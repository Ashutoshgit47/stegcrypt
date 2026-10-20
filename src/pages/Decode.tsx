import { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Download,
  AlertTriangle,
  Info,
  Image as ImageIcon,
  Music,
  Copy,
  Check,
  Eye,
  EyeOff,
  FileText,
  FileArchive,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileDropzone } from '@/components/shared/FileDropzone';
import { ProcessingStages, ProcessingStage } from '@/components/shared/ProcessingStages';
import { EngineStatus } from '@/components/shared/EngineStatus';
import { PageSEO } from '@/components/PageSEO';
import { useToast } from '@/hooks/use-toast';
import { useWasmEngine, mapToEngineState } from '@/hooks/use-wasm-engine';
import { decryptInWorker } from '@/workers/worker-client';
import { bufferToString } from '@/lib/crypto';
import { loadImage, extractData, analyzeImageCapacity } from '@/lib/steganography';
import { decodeWav, extractWavData, analyzeWavCapacity } from '@/lib/wav-codec';
import { unpackPayload } from '@/lib/payload-helper';
import { getLsbDepthForPlatform, isMobileDevice, formatFileSize } from '@/lib/file-validator';
import { isWebPLossless } from '@/lib/webp-codec';
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

const IMAGE_EXTENSIONS = ['png', 'bmp', 'webp', 'tif', 'tiff'];
const AUDIO_EXTENSIONS = ['wav', 'wave'];

const detectCarrierType = (file: File): CarrierType => {
  const type = (file.type || '').toLowerCase();
  const ext = file.name.toLowerCase().split('.').pop() || '';
  // Some platforms report an empty or non-standard MIME type (e.g. audio/x-wav),
  // so fall back to the file extension.
  if (
    type === 'image/png' || type === 'image/bmp' || type === 'image/webp' || type === 'image/tiff' ||
    IMAGE_EXTENSIONS.includes(ext)
  ) return 'image';
  if (
    type === 'audio/wav' || type === 'audio/wave' || type === 'audio/x-wav' ||
    AUDIO_EXTENSIONS.includes(ext)
  ) return 'audio';
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
  const [showPassword, setShowPassword] = useState(false);
  const [lsbDepth, setLsbDepth] = useState('1');
  const [autoDetectedDepth, setAutoDetectedDepth] = useState<number | null>(null);

  const [carrierInfo, setCarrierInfo] = useState<{
    capacityBytes: number;
    meta?: string;
  } | null>(null);

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
    parseInt(lsbDepth) || 1,
    isExpertMode,
    isMobile ? 'mobile' : 'desktop'
  );
  // Depth used for the first extraction attempt and capacity display. On mobile
  // and in Quick mode this is always 1; the auto-probe still scans 1-4.
  const lsbDepthValue = effectiveLsbDepth.depth;

  // Show mobile warning only if Expert Mode is active and LSB was forced
  useEffect(() => {
    if (isMobile && isExpertMode && effectiveLsbDepth.forced) {
      setMobileWarning(effectiveLsbDepth.message || WARNING_MESSAGES.mobileLsbForced);
    } else {
      setMobileWarning(null);
    }
  }, [isMobile, isExpertMode, effectiveLsbDepth]);

  // Reset auto-detected depth when file changes
  useEffect(() => {
    setAutoDetectedDepth(null);
    setDecodedText('');
    setDecodedBlob(null);
  }, [stegoFile]);

  // Analyze carrier capacity for sidebar display
  useEffect(() => {
    if (!stegoFile || !carrierType) {
      setCarrierInfo(null);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        if (carrierType === 'image') {
          const img = await loadImage(stegoFile);
          if (!isMounted) return;
          const analysis = analyzeImageCapacity(img, lsbDepthValue);
          setCarrierInfo({
            capacityBytes: analysis.maxCapacityBytes,
            meta: `${analysis.width} × ${analysis.height} px`,
          });
        } else {
          const buf = await stegoFile.arrayBuffer();
          if (!isMounted) return;
          const wav = decodeWav(buf);
          const analysis = analyzeWavCapacity(wav, lsbDepthValue);
          const duration = (wav.samples.length / (wav.sampleRate * wav.channels)).toFixed(1);
          setCarrierInfo({
            capacityBytes: analysis.maxCapacityBytes,
            meta: `${wav.sampleRate} Hz · ${duration}s · ${wav.channels} ch`,
          });
        }
      } catch {
        if (isMounted) setCarrierInfo(null);
      }
    })();

    return () => { isMounted = false; };
  }, [stegoFile, carrierType, lsbDepthValue]);

  const engineState = mapToEngineState(wasmState);

  const handleFileSelect = async (file: File | null) => {
    setStegoFile(file);
    if (!file) {
      setCarrierType(null);
      return;
    }

    const type = detectCarrierType(file);
    if (!type) {
      toast({
        variant: 'destructive',
        title: 'Unsupported Format',
        description: 'Please select a PNG, BMP, WebP (Lossless), or TIFF image, or a WAV audio file.',
      });
      setStegoFile(null);
      setCarrierType(null);
      return;
    }

    // Verify lossless WebP
    if (file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')) {
      try {
        const buffer = await file.arrayBuffer();
        if (!isWebPLossless(buffer)) {
          toast({
            variant: 'destructive',
            title: 'Lossy WebP Detected',
            description: 'Lossy WebP compression destroys hidden steganographic data. Please use a lossless WebP carrier.',
          });
          setStegoFile(null);
          setCarrierType(null);
          return;
        }
      } catch (err) {
        console.error('WebP validation error:', err);
      }
    }

    setCarrierType(type);
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
      const initialDepth = lsbDepthValue;
      let matchedDepth = initialDepth;

      if (carrierType === 'image') {
        const imageData = await loadImage(stegoFile);
        setCompletedStages(['load']);

        // Stage 2: Analyze
        setCurrentStage('analyze');
        await new Promise(r => setTimeout(r, 200));
        setCompletedStages(['load', 'analyze']);

        // Stage 3: Extract with automatic depth probing
        setCurrentStage('extract');
        extractedData = extractData(imageData, initialDepth);

        if (!extractedData) {
          // Probe remaining depths (1..4)
          for (const d of [1, 2, 3, 4]) {
            if (d === initialDepth) continue;
            const probe = extractData(imageData, d);
            if (probe) {
              extractedData = probe;
              matchedDepth = d;
              setAutoDetectedDepth(d);
              setLsbDepth(d.toString());
              break;
            }
          }
        }
      } else {
        const buffer = await stegoFile.arrayBuffer();
        const wavData = decodeWav(buffer);
        setCompletedStages(['load']);

        // Stage 2: Analyze
        setCurrentStage('analyze');
        await new Promise(r => setTimeout(r, 200));
        setCompletedStages(['load', 'analyze']);

        // Stage 3: Extract with automatic depth probing
        setCurrentStage('extract');
        extractedData = extractWavData(wavData, initialDepth);

        if (!extractedData) {
          // Probe remaining depths (1..4)
          for (const d of [1, 2, 3, 4]) {
            if (d === initialDepth) continue;
            const probe = extractWavData(wavData, d);
            if (probe) {
              extractedData = probe;
              matchedDepth = d;
              setAutoDetectedDepth(d);
              setLsbDepth(d.toString());
              break;
            }
          }
        }
      }

      if (!extractedData) {
        throw new Error('No hidden data found. The file may not contain a StegCrypt payload or was modified by lossy compression.');
      }

      setCompletedStages(['load', 'analyze', 'extract']);

      // Stage 4: Decrypt in web worker
      setCurrentStage('decrypt');

      const { promise: decryptPromise } = decryptInWorker({
        ciphertext: extractedData,
        password,
      });

      const processedData = await decryptPromise;

      // Stage 5: Unpack Metadata & Present Output
      setCurrentStage('save');

      try {
        const { data, metadata } = unpackPayload(processedData);

        if (metadata.type === 'text') {
          const text = bufferToString(data);
          setDecodedText(text);
        } else {
          const blob = new Blob([data], { type: metadata.mimeType || 'application/octet-stream' });
          setDecodedBlob(blob);
          setDecodedFileName(metadata.name || 'recovered_file.bin');
        }
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn('[StegCrypt] Payload unpack fallback:', e);
        }
        setDecodedBlob(new Blob([processedData]));
        setDecodedFileName('recovered_file.bin');
      }

      setCompletedStages(['load', 'analyze', 'extract', 'decrypt', 'save']);

      toast({
        title: 'Decoding Complete',
        description: matchedDepth !== initialDepth
          ? `Auto-detected ${matchedDepth}-bit LSB depth and successfully extracted payload.`
          : 'Hidden data extracted and decrypted successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Decoding Failed',
        description: error instanceof Error ? error.message : 'Wrong password or no hidden data found',
      });
    } finally {
      setIsProcessing(false);
      setCurrentStage(null);
    }
  };

  const handleCopy = async () => {
    if (!decodedText) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(decodedText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = decodedText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied to clipboard' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Copy failed',
        description: 'Clipboard access denied. Please select and copy text manually.'
      });
    }
  };

  const handleDownloadText = () => {
    if (!decodedText) return;
    const blob = new Blob([decodedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decrypted_secret.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadBlob = () => {
    if (decodedBlob) {
      const url = URL.createObjectURL(decodedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = decodedFileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const decodeSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to Extract and Decrypt Hidden Data from Files with StegCrypt',
    'description': 'Step-by-step instructions for extracting encrypted secrets hidden inside image or audio carrier files in your browser.',
    'step': [
      {
        '@type': 'HowToStep',
        'name': 'Upload Stego File',
        'text': 'Upload the carrier file (PNG, BMP, WebP, TIFF, or WAV) containing hidden data.'
      },
      {
        '@type': 'HowToStep',
        'name': 'Enter Decryption Password',
        'text': 'Type the password used during the original encoding process to derive the AES-256-GCM key.'
      },
      {
        '@type': 'HowToStep',
        'name': 'Decode & Decrypt',
        'text': 'Click Decode to run client-side extraction and cryptographic integrity verification.'
      },
      {
        '@type': 'HowToStep',
        'name': 'View or Download Payload',
        'text': 'Read the decrypted text message or download the recovered payload file.'
      }
    ]
  };

  const canDecode = Boolean(stegoFile && carrierType && password);
  const fileExt = stegoFile?.name.split('.').pop()?.toUpperCase() || '';

  return (
    <div className="container py-8 md:py-12 animate-fade-in">
      <PageSEO
        title="Decode"
        description="Extract and decrypt hidden data from steganographic images or audio files. Secure AES-256 decryption with 100% local processing."
        path="/decode"
        schema={decodeSchema}
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
          {/* Main Form (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stego File Selection */}
            <div className="cyber-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black uppercase tracking-wide">Steganographic File</h2>
                {carrierType && (
                  <div className="flex items-center gap-1.5 px-3 py-1 border-[2px] border-[#121212] dark:border-white bg-[#1040C0] text-white text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white]">
                    {carrierType === 'image' ? <ImageIcon className="h-3 w-3 stroke-[3px]" /> : <Music className="h-3 w-3 stroke-[3px]" />}
                    {fileExt ? `${fileExt} ${carrierType === 'image' ? 'Image' : 'Audio'}` : (carrierType === 'image' ? 'Image' : 'Audio')}
                  </div>
                )}
              </div>
              <FileDropzone
                accept="image/png,image/bmp,image/webp,image/tiff,.bmp,.webp,.tiff,.tif,audio/wav,audio/wave,.wav"
                maxSize={100}
                onFileSelect={handleFileSelect}
                selectedFile={stegoFile}
                label="Select encoded carrier"
                description="PNG, BMP, Lossless WebP, TIFF image or WAV audio"
              />
            </div>

            {/* Decryption Settings */}
            <div className="cyber-card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-black uppercase tracking-wide">Decryption</h2>
                {autoDetectedDepth && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border-2 border-[#121212] dark:border-white bg-[#F0C020] text-[#121212] text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white]">
                    <Sparkles className="h-3 w-3" />
                    Auto-Detected: {autoDetectedDepth} Bit LSB
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-wide">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter the encryption password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-[2px] border-[#121212] dark:border-white rounded-none pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none p-1 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && password.length < 12 && (
                  <p className="text-[11px] font-bold text-[#D02020] animate-fade-in">
                    StegCrypt encoding uses min 12 character passwords ({password.length}/12)
                  </p>
                )}
              </div>

              {isExpertMode && (
                <div className="pt-2 border-t border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lsb-depth" className="text-xs font-black uppercase tracking-wide">LSB Depth</Label>
                    <span className="text-[11px] text-muted-foreground font-semibold">Auto-detected if mismatch</span>
                  </div>
                  <Select value={lsbDepth} onValueChange={(val) => { setLsbDepth(val); setAutoDetectedDepth(null); }}>
                    <SelectTrigger id="lsb-depth" className="rounded-none border-[2px] border-[#121212] dark:border-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-[2px] border-[#121212] dark:border-white">
                      <SelectItem value="1">1 bit (Standard)</SelectItem>
                      <SelectItem value="2">2 bits (Medium Capacity)</SelectItem>
                      <SelectItem value="3">3 bits (High Capacity)</SelectItem>
                      <SelectItem value="4">4 bits (Maximum Capacity)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Action Button Right in Form Flow */}
              <div className="pt-2">
                <Button
                  size="lg"
                  className="w-full gap-2 min-h-[3.5rem] py-3 text-base font-black uppercase tracking-[0.15em] border-[3px] border-[#121212] dark:border-white bg-[#1040C0] text-white shadow-[6px_6px_0px_0px_#121212] dark:shadow-[6px_6px_0px_0px_white] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed rounded-none"
                  disabled={!canDecode || isProcessing}
                  onClick={handleDecode}
                >
                  {isProcessing ? (
                    <>Processing…</>
                  ) : (
                    <><Unlock className="h-5 w-5 stroke-[3px] flex-shrink-0" /><span>Decode & Extract</span></>
                  )}
                </Button>
              </div>
            </div>

            {/* Decoded Output */}
            {decodedText || decodedBlob ? (
              <div className="cyber-card border-[3px] border-[#1040C0] dark:border-[#6080F0] shadow-[6px_6px_0px_0px_#1040C0] dark:shadow-[6px_6px_0px_0px_#6080F0] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black uppercase tracking-wide text-[#1040C0] dark:text-[#6080F0] flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Decoded Output
                  </h2>
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 border-2 border-current">
                    {decodedText ? 'Text Message' : 'Extracted File'}
                  </span>
                </div>

                {decodedText ? (
                  <div className="space-y-4">
                    <Textarea
                      value={decodedText}
                      readOnly
                      className="min-h-[160px] font-mono border-[2px] border-[#121212] dark:border-white bg-background rounded-none"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="text-xs font-bold opacity-75">
                        {decodedText.length} characters · {decodedText.trim().split(/\s+/).filter(Boolean).length} words
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleCopy}
                          className="flex items-center gap-2 px-4 py-2 border-[2px] border-[#121212] dark:border-white bg-[#121212] dark:bg-white text-white dark:text-[#121212] font-black uppercase tracking-widest text-xs shadow-[3px_3px_0px_0px_#1040C0] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none"
                        >
                          {copied ? (
                            <><Check className="h-4 w-4 stroke-[3px]" />Copied!</>
                          ) : (
                            <><Copy className="h-4 w-4 stroke-[3px]" />Copy Text</>
                          )}
                        </Button>
                        <Button
                          onClick={handleDownloadText}
                          className="flex items-center gap-2 px-4 py-2 border-[2px] border-[#121212] dark:border-white bg-[#1040C0] text-white font-black uppercase tracking-widest text-xs shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none"
                        >
                          <Download className="h-4 w-4 stroke-[3px]" />
                          Download .txt
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border-[2px] border-[#121212] dark:border-white bg-secondary/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[#1040C0] text-white flex items-center justify-center border-2 border-[#121212] dark:border-white">
                          <FileArchive className="h-5 w-5 stroke-[2.5px]" />
                        </div>
                        <div>
                          <p className="font-black text-sm">{decodedFileName}</p>
                          <p className="text-xs text-muted-foreground font-semibold">
                            {decodedBlob ? formatFileSize(decodedBlob.size) : 'Unknown size'}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleDownloadBlob}
                        className="flex items-center gap-2 px-4 py-2 border-[2px] border-[#121212] dark:border-white bg-[#1040C0] text-white font-black uppercase tracking-widest text-xs shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none"
                      >
                        <Download className="h-4 w-4 stroke-[3px]" />
                        Download File
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="cyber-card border-dashed opacity-75 text-center py-8">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Decoded message or recovered file will appear here after clicking Decode
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Column (1 column) */}
          <div className="space-y-6">
            {/* Carrier Summary Card */}
            <div className="cyber-card space-y-4 shadow-[6px_6px_0px_0px_#1040C0] dark:shadow-[6px_6px_0px_0px_#1040C0]">
              <h3 className="font-black uppercase tracking-wide text-xs">Carrier Details</h3>
              {stegoFile ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-border font-semibold">
                    <span className="text-muted-foreground">File</span>
                    <span className="font-bold truncate max-w-[160px]" title={stegoFile.name}>
                      {stegoFile.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border font-semibold">
                    <span className="text-muted-foreground">File Size</span>
                    <span className="font-bold">{formatFileSize(stegoFile.size)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border font-semibold">
                    <span className="text-muted-foreground">Carrier Type</span>
                    <span className="font-bold uppercase">{fileExt || carrierType}</span>
                  </div>
                  {carrierInfo?.meta && (
                    <div className="flex justify-between py-1.5 border-b border-border font-semibold">
                      <span className="text-muted-foreground">Dimensions</span>
                      <span className="font-bold">{carrierInfo.meta}</span>
                    </div>
                  )}
                  {carrierInfo && (
                    <div className="flex justify-between py-1.5 font-semibold">
                      <span className="text-muted-foreground">Max Capacity</span>
                      <span className="font-bold">{formatFileSize(carrierInfo.capacityBytes)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-xs text-muted-foreground font-medium">
                  <p>Upload an encoded carrier to inspect file properties and begin decryption.</p>
                  <div className="pt-2 text-[11px] space-y-1">
                    <p className="font-bold text-foreground">Supported Formats:</p>
                    <p>• Lossless Images: PNG, BMP, WebP, TIFF</p>
                    <p>• Lossless Audio: 16-bit PCM WAV</p>
                  </div>
                </div>
              )}
            </div>

            {/* Processing Journey Card */}
            {isProcessing && (
              <div className="cyber-card animate-fade-in">
                <h3 className="font-black mb-4 uppercase tracking-wide text-xs">Processing Journey</h3>
                <ProcessingStages
                  currentStage={currentStage}
                  completedStages={completedStages}
                  mode="decode"
                />
              </div>
            )}

            {/* Security Guarantee Box */}
            <div className="cyber-card bg-secondary/20 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-black uppercase text-[#1040C0] dark:text-[#6080F0]">
                <ShieldCheck className="h-4 w-4 stroke-[3px]" />
                Zero-Knowledge Local
              </div>
              <p className="text-muted-foreground font-medium text-[11px] leading-relaxed">
                All decryption and steganographic unpacking occurs entirely in your browser using Web Crypto API. No files or keys are transmitted to any server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
