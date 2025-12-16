
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
  if (file.type === 'image/png' || file.type === 'image/bmp') return 'image';
  if (file.type === 'audio/wav' || file.type === 'audio/wave' || file.name.endsWith('.wav')) return 'audio';
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
        // Fallback legacy (assume binary)
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

  const [decodedFileName, setDecodedFileName] = useState<string>('file.bin');

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
          <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {mobileWarning}
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Unlock className="h-5 w-5 text-accent-foreground" />
              </div>
              Decode
            </h1>
            <p className="text-muted-foreground mt-2">
              Extract and decrypt hidden data from a file
            </p>
          </div>
          <EngineStatus state={engineState} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stego File */}
            <div className="cyber-card">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                Steganographic File
                {carrierType && (
                  <Badge variant="secondary" className="ml-auto gap-1.5">
                    {carrierType === 'image' ? <Image className="h-3 w-3" /> : <Music className="h-3 w-3" />}
                    {carrierType === 'image' ? 'PNG Image' : 'WAV Audio'}
                  </Badge>
                )}
              </h2>
              <FileDropzone
                accept="image/png,image/bmp,.bmp,audio/wav,audio/wave,.wav"
                maxSize={100}
                onFileSelect={handleFileSelect}
                selectedFile={stegoFile}
                label="Select encoded file"
                description="PNG/BMP image or WAV audio with hidden data"
              />
            </div>

            {/* Decryption */}
            <div className="cyber-card">
              <h2 className="font-semibold mb-4">Decryption</h2>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter the encryption password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {isExpertMode && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="lsb-depth">LSB Depth</Label>
                  <Select value={lsbDepth} onValueChange={setLsbDepth}>
                    <SelectTrigger id="lsb-depth">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 bit</SelectItem>
                      <SelectItem value="2">2 bits</SelectItem>
                      <SelectItem value="3">3 bits</SelectItem>
                      <SelectItem value="4">4 bits</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Must match the LSB depth used during encoding
                  </p>
                </div>
              )}
            </div>

            {/* Output */}
            {(decodedText || decodedBlob) && (
              <div className="cyber-card border-success/30 bg-success/5">
                <h2 className="font-semibold mb-4 text-success">Decoded Output</h2>

                {decodedText ? (
                  <div className="space-y-3">
                    <Textarea
                      value={decodedText}
                      readOnly
                      className="min-h-[150px] font-mono bg-background"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Binary data detected. Download to access the file.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download File
                    </Button>
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
                <h3 className="font-semibold mb-4">Progress</h3>
                <ProcessingStages
                  currentStage={currentStage}
                  completedStages={completedStages}
                  mode="decode"
                />
              </div>
            )}

            {/* Decode Button */}
            <Button
              size="lg"
              className="w-full gap-2"
              disabled={!canDecode || isProcessing}
              onClick={handleDecode}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  Decode
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
