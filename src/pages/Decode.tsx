import { useState, useEffect } from 'react';
import { Lock, Unlock, Download, AlertTriangle, Info, Image, Music, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileDropzone } from '@/components/shared/FileDropzone';
import { ProcessingStages, ProcessingStage } from '@/components/shared/ProcessingStages';
import { EngineStatus } from '@/components/shared/EngineStatus';
import { PageSEO } from '@/components/PageSEO';
import { useToast } from '@/hooks/use-toast';
import { useWasmEngine, mapToEngineState } from '@/hooks/use-wasm-engine';
import { decryptInWorker } from '@/workers/worker-client';
import { stringToBuffer, bufferToString } from '@/lib/crypto';
import { loadImage, extractData } from '@/lib/steganography';
import { decodeWav, extractWavData } from '@/lib/wav-codec';
import { unpackPayload } from '@/lib/payload-helper';
import { validateCarrierFile, getLsbDepthForPlatform, isMobileDevice } from '@/lib/file-validator';
import { WARNING_MESSAGES } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMode } from '@/contexts/ModeContext';

type CarrierType = 'image' | 'audio' | null;

const detectCarrierType = (file: File): CarrierType => {
  const type = file.type;
  if (type === 'image/png' || type === 'image/bmp' || type === 'image/webp' || type === 'image/tiff') return 'image';
  if (type === 'audio/wav' || type === 'audio/wave' || file.name.endsWith('.wav')) return 'audio';
  return null;
};

export default function Decode() {
  const { isExpertMode } = useMode();
  const { toast } = useToast();
  const { state: wasmState, initialize: initWasm } = useWasmEngine();
  const isMobile = isMobileDevice();

  const [stegoFile, setStegoFile] = useState<File | null>(null);
  const [carrierType, setCarrierType] = useState<CarrierType>(null);
  const [password, setPassword] = useState('');
  const [lsbDepth, setLsbDepth] = useState('1');

  const [decodedText, setDecodedText] = useState('');
  const [decodedBlob, setDecodedBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);
  const [decodedFileName, setDecodedFileName] = useState<string>('recovered_file.bin');

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState<ProcessingStage | null>(null);
  const [completedStages, setCompletedStages] = useState<ProcessingStage[]>([]);
  const [mobileWarning, setMobileWarning] = useState<string | null>(null);

  // Initialize WASM engine on mount
  useEffect(() => {
    initWasm();
  }, [initWasm]);

  // Get effective LSB depth based on platform and mode
  const effectiveLsbDepth = getLsbDepthForPlatform(
    parseInt(lsbDepth),
    isExpertMode,
    isMobile ? 'mobile' : 'desktop'
  );

  // Show mobile warning if LSB was forced
  useEffect(() => {
    if (isMobile && effectiveLsbDepth.forced) {
      setMobileWarning(effectiveLsbDepth.message || WARNING_MESSAGES.mobileLsbForced);
    } else {
      setMobileWarning(null);
    }
  }, [isMobile, effectiveLsbDepth]);

  const engineState = mapToEngineState(wasmState);

  const handleFileSelect = (file: File | null) => {
    setStegoFile(file);
    if (file) {
      const type = detectCarrierType(file);
      setCarrierType(type);
      if (!type) {
        toast({
          variant: 'destructive',
          title: 'Unsupported Format',
          description: 'Please use PNG images or WAV audio files.',
        });
        setStegoFile(null);
      }
    } else {
      setCarrierType(null);
    }
  };

  const handleDecode = async () => {
    if (!stegoFile || !carrierType) {
      toast({ variant: 'destructive', title: 'No file selected' });
      return;
    }
    if (!password) {
      toast({ variant: 'destructive', title: 'Password required' });
      return;
    }

    setIsProcessing(true);
    setCompletedStages([]);
    setDecodedText('');
    setDecodedBlob(null);

    try {
      // Stage 1: Load
      setCurrentStage('load');
      let extractedData: ArrayBuffer | null = null;

      if (carrierType === 'image') {
        const imageData = await loadImage(stegoFile);
        setCompletedStages(['load']);

        // Stage 2: Analyze/Detect
        setCurrentStage('analyze');
        await new Promise(r => setTimeout(r, 300));
        setCompletedStages(['load', 'analyze']);

        // Stage 3: Extract
        setCurrentStage('extract');
        extractedData = extractData(imageData, parseInt(lsbDepth));
      } else {
        const buffer = await stegoFile.arrayBuffer();
        const wavData = decodeWav(buffer);
        setCompletedStages(['load']);

        // Stage 2: Analyze/Detect
        setCurrentStage('analyze');
        await new Promise(r => setTimeout(r, 300));
        setCompletedStages(['load', 'analyze']);

        // Stage 3: Extract
        setCurrentStage('extract');
        extractedData = extractWavData(wavData, parseInt(lsbDepth));
      }

      if (!extractedData) {
        throw new Error('No hidden data found or wrong LSB depth');
      }
      setCompletedStages(['load', 'analyze', 'extract']);

      // Stage 4: Decrypt
      setCurrentStage('decrypt');

      const { promise: decryptPromise } = decryptInWorker({
        ciphertext: extractedData,
        password,
        onProgress: (p, s, m) => {
          // Optional progress
        }
      });

      const processedData = await decryptPromise;

      // Stage 5: Unpack Metadata & Save/Display
      setCurrentStage('save');

      try {
        const { data, metadata } = unpackPayload(processedData);

        if (metadata.type === 'text') {
          const text = bufferToString(data);
          setDecodedText(text);
        } else {
          // It's a file
          const blob = new Blob([data], { type: metadata.mimeType || 'application/octet-stream' });
          setDecodedBlob(blob);
          setDecodedFileName(metadata.name || 'recovered_file.bin');
        }
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn('[StegCrypt] Payload unpack error, using fallback:', e);
        }
        setDecodedBlob(new Blob([processedData]));
        setDecodedFileName('recovered_file.bin');
      }

      setCompletedStages(['load', 'analyze', 'extract', 'decrypt', 'save']);

      toast({
        title: 'Decoding Complete',
        description: 'Hidden data has been extracted.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Decoding Failed',
        description: error instanceof Error ? error.message : 'Wrong password or no hidden data',
      });
    } finally {
      setIsProcessing(false);
      setCurrentStage(null);
    }
  };

  const handleCopy = async () => {
    if (decodedText) {
      await navigator.clipboard.writeText(decodedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied to clipboard' });
    }
  };

  const handleDownload = () => {
    if (decodedBlob) {
      const url = URL.createObjectURL(decodedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = decodedFileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const canDecode = stegoFile && carrierType && password;

  return (
    <div className="container py-8 md:py-12 animate-fade-in">
      <PageSEO
        title="Decode"
        description="Extract and decrypt hidden data from steganographic images or audio files. Secure AES-256 decryption with 100% local processing."
        path="/decode"
      />
      <div className="max-w-4xl mx-auto">
        {/* Mobile Warning */}
        {mobileWarning && (
          <div className="mb-6 flex items-center gap-2 p-4 border-[3px] border-[#F0C020] bg-[#F0C020]/15 text-[#121212] dark:text-[#F0C020] text-sm font-bold shadow-[3px_3px_0px_0px_#F0C020]">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 stroke-[3px]" />
            {mobileWarning}
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <div className="h-10 w-10 bg-[#1040C0] flex items-center justify-center border-[3px] border-[#121212] dark:border-white shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white]">
                <Unlock className="h-5 w-5 text-white stroke-[3px]" />
              </div>
              Decode
            </h1>
            <p className="text-muted-foreground mt-2 font-medium italic">
              Extract and decrypt hidden data from a steganographic carrier
            </p>
          </div>
          <EngineStatus state={engineState} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stego File */}
            <div className="cyber-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black uppercase tracking-wide">Steganographic File</h2>
                {carrierType && (
                  <div className="flex items-center gap-1.5 px-3 py-1 border-[2px] border-[#121212] dark:border-white bg-[#1040C0] text-white text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white]">
                    {carrierType === 'image' ? <Image className="h-3 w-3 stroke-[3px]" /> : <Music className="h-3 w-3 stroke-[3px]" />}
                    {carrierType === 'image' ? 'PNG Image' : 'WAV Audio'}
                  </div>
                )}
              </div>
              <FileDropzone
                accept="image/png,image/bmp,image/webp,image/tiff,.bmp,.webp,.tiff,.tif,audio/wav,audio/wave,.wav"
                maxSize={100}
                onFileSelect={handleFileSelect}
                selectedFile={stegoFile}
                label="Select encoded file"
                description="PNG/BMP/WebP/TIFF image or WAV audio"
              />
            </div>

            {/* Decryption */}
            <div className="cyber-card">
              <h2 className="font-black mb-4 uppercase tracking-wide">Decryption</h2>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-wide">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter the encryption password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[2px] border-[#121212] dark:border-white rounded-none"
                />
              </div>

              {isExpertMode && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="lsb-depth">LSB Depth</Label>
                  <Select value={lsbDepth} onValueChange={setLsbDepth}>
                    <SelectTrigger id="lsb-depth" className="rounded-none border-[2px] border-[#121212] dark:border-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-[2px] border-[#121212] dark:border-white">
                      <SelectItem value="1">1 bit</SelectItem>
                      <SelectItem value="2">2 bits</SelectItem>
                      <SelectItem value="3">3 bits</SelectItem>
                      <SelectItem value="4">4 bits</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground font-medium">
                    Must match the LSB depth used during encoding
                  </p>
                </div>
              )}
            </div>

            {/* Output */}
            {(decodedText || decodedBlob) && (
              <div className="cyber-card border-[3px] border-[#1040C0] dark:border-[#6080F0] shadow-[6px_6px_0px_0px_#1040C0] dark:shadow-[6px_6px_0px_0px_#6080F0] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="font-black mb-4 uppercase tracking-wide text-[#1040C0] dark:text-[#6080F0]">Decoded Output</h2>

                {decodedText ? (
                  <div className="space-y-3">
                    <Textarea
                      value={decodedText}
                      readOnly
                      className="min-h-[150px] font-mono border-[2px] border-[#121212] dark:border-white bg-background rounded-none"
                    />
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-6 py-2 border-[3px] border-[#121212] dark:border-white bg-[#121212] dark:bg-white text-white dark:text-[#121212] font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_#1040C0] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    >
                      {copied ? (
                        <><Check className="h-4 w-4 stroke-[3px]" />Copied!</>
                      ) : (
                        <><Copy className="h-4 w-4 stroke-[3px]" />Copy to Clipboard</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-bold opacity-70 italic">
                      Binary data detected. Download to recover the hidden file.
                    </p>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-6 py-2 border-[3px] border-[#121212] dark:border-white bg-[#1040C0] text-white font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    >
                      <Download className="h-4 w-4 stroke-[3px]" />
                      Download File
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            {isProcessing && (
              <div className="cyber-card">
                <h3 className="font-black mb-4 uppercase tracking-wide text-xs">Processing Journey</h3>
                <ProcessingStages
                  currentStage={currentStage}
                  completedStages={completedStages}
                  mode="decode"
                />
              </div>
            )}

            {/* Decode Button */}
            <button
              className="w-full flex items-center justify-center gap-2 py-4 border-[3px] border-[#121212] dark:border-white bg-[#1040C0] text-white font-black uppercase tracking-widest text-base shadow-[8px_8px_0px_0px_#121212] dark:shadow-[8px_8px_0px_0px_white] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              disabled={!canDecode || isProcessing}
              onClick={handleDecode}
            >
              {isProcessing ? (
                <>Processing…</>
              ) : (
                <><Unlock className="h-5 w-5 stroke-[3px] flex-shrink-0" /><span>Decode</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
