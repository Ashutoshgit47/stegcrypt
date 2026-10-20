import { useState, useCallback, useEffect } from 'react';
import { Lock, Download, AlertTriangle, Info, Image, Music, Key, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileDropzone } from '@/components/shared/FileDropzone';
import { CapacityIndicator } from '@/components/shared/CapacityIndicator';
import { ProcessingStages, ProcessingStage } from '@/components/shared/ProcessingStages';
import { EngineStatus } from '@/components/shared/EngineStatus';
import { PageSEO } from '@/components/PageSEO';
import { useMode } from '@/contexts/ModeContext';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useNavigate } from 'react-router-dom';
import { useWasmEngine, mapToEngineState } from '@/hooks/use-wasm-engine';
import { encryptInWorker } from '@/workers/worker-client';
import { packEncryptedData, stringToBuffer, generateSecurePassword } from '@/lib/crypto';
import { loadImage, analyzeImageCapacity, embedData, extractData, createPngBlob, createBmpBlob } from '@/lib/steganography';
import { decodeWav, encodeWav, analyzeWavCapacity, embedWavData, extractWavData, WavData } from '@/lib/wav-codec';
import { packPayload } from '@/lib/payload-helper';
import { isWebPLossless } from '@/lib/webp-codec';
import { PasswordGenerator } from '@/components/shared/PasswordGenerator';
import {
  validateCarrierFile,
  validatePayloadFile,
  getLsbDepthForPlatform,
  isMobileDevice,
  isArgon2Available,
  formatFileSize
} from '@/lib/file-validator';
import { WARNING_MESSAGES, FILE_LIMITS } from '@/lib/constants';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

export default function Encode() {
  const { isExpertMode } = useMode();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { state: wasmState, initialize: initWasm } = useWasmEngine();
  const isMobile = isMobileDevice();

  const [carrierFile, setCarrierFile] = useState<File | null>(null);
  const [carrierType, setCarrierType] = useState<CarrierType>(null);
  const [payloadText, setPayloadText] = useState('');
  const [payloadFile, setPayloadFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [lsbDepth, setLsbDepth] = useState('1');
  const [useArgon2, setUseArgon2] = useState(false);
  const [useCompression, setUseCompression] = useState(true);

  const [capacity, setCapacity] = useState({ used: 0, total: 0 });

  // Reset expert options when switching to Quick Mode
  useEffect(() => {
    if (!isExpertMode) {
      setLsbDepth('1');
      setUseArgon2(false);
      setPayloadFile(null);
    }
  }, [isExpertMode]);

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
  // The depth actually used for capacity math and embedding. Mobile and Quick
  // mode are locked to 1 bit regardless of what the selector shows.
  const lsbDepthValue = effectiveLsbDepth.depth;

  // Show mobile warning only if Expert Mode is active and LSB was forced
  useEffect(() => {
    if (isMobile && isExpertMode && effectiveLsbDepth.forced) {
      setMobileWarning(effectiveLsbDepth.message || WARNING_MESSAGES.mobileLsbForced);
    } else {
      setMobileWarning(null);
    }
  }, [isMobile, isExpertMode, effectiveLsbDepth]);

  // Recalculate capacity when LSB depth changes
  useEffect(() => {
    if (carrierFile && carrierType) {
      // Re-analyze carrier with new LSB depth
      (async () => {
        try {
          if (carrierType === 'image') {
            const imageData = await loadImage(carrierFile);
            const analysis = analyzeImageCapacity(imageData, lsbDepthValue);
            setCapacity(prev => ({ ...prev, total: analysis.maxCapacityBytes }));
          } else {
            const buffer = await carrierFile.arrayBuffer();
            const wavData = decodeWav(buffer);
            const analysis = analyzeWavCapacity(wavData, lsbDepthValue);
            setCapacity(prev => ({ ...prev, total: analysis.maxCapacityBytes }));
          }
        } catch (e) {
          if (import.meta.env.DEV) {
            console.warn('[StegCrypt] Capacity recalculation error:', e);
          }
        }
      })();
    }
  }, [lsbDepthValue, carrierFile, carrierType]);

  const engineState = mapToEngineState(wasmState);

  const analyzeCarrier = useCallback(async (file: File, type: CarrierType) => {
    try {
      if (type === 'image') {
        const imageData = await loadImage(file);
        const analysis = analyzeImageCapacity(imageData, lsbDepthValue);
        setCapacity({ used: 0, total: analysis.maxCapacityBytes });
      } else { // This 'else' now covers audio
        const buffer = await file.arrayBuffer();
        const wavData = decodeWav(buffer);
        const analysis = analyzeWavCapacity(wavData, lsbDepthValue);
        setCapacity({ used: 0, total: analysis.maxCapacityBytes });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not analyze the carrier file.',
      });
    }
  }, [lsbDepthValue, toast]);

  const handleCarrierSelect = useCallback(async (file: File | null) => {
    setCarrierFile(file);
    if (file) {
      const type = detectCarrierType(file);
      
      // Additional check for WebP losslessness
      if (file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')) {
        try {
          const buffer = await file.arrayBuffer();
          if (!isWebPLossless(buffer)) {
            toast({
              variant: 'destructive',
              title: 'Lossy WebP Detected',
              description: 'Only Lossless WebP is supported. Lossy compression destroys hidden data.',
            });
            setCarrierFile(null);
            return;
          }
        } catch (e) {
          console.error('WebP validation error:', e);
        }
      }

      setCarrierType(type);
      if (type) {
        analyzeCarrier(file, type);
      } else {
        toast({
          variant: 'destructive',
          title: 'Unsupported Format',
          description: 'Please use PNG, BMP, WebP (Lossless), or TIFF images, or WAV audio files.',
          action: (
            <ToastAction 
              altText="Convert File" 
              onClick={() => navigate('/tools')}
              className="bauhaus-bg-red text-white border-2 border-[#121212] hover:bg-[#D02020]/90 px-3 uppercase text-xs font-bold"
            >
              Convert File
            </ToastAction>
          ),
        });
        setCarrierFile(null);
        setCapacity({ used: 0, total: 0 });
      }
    } else {
      setCarrierType(null);
      setCapacity({ used: 0, total: 0 });
    }
  }, [analyzeCarrier, toast, navigate]);

  // Calculate used capacity based on payload
  useEffect(() => {
    let payloadSize = 0;
    if (payloadText) {
      payloadSize = new TextEncoder().encode(payloadText).length;
    } else if (payloadFile) {
      payloadSize = payloadFile.size;
    }
    const overhead = payloadSize > 0 ? 110 : 0;
    setCapacity(prev => ({ ...prev, used: payloadSize + overhead }));
  }, [payloadText, payloadFile]);

  const handleEncode = async () => {
    if (!carrierFile || !carrierType) {
      toast({ variant: 'destructive', title: 'No carrier file selected' });
      return;
    }
    if (!payloadText && !payloadFile) {
      toast({ variant: 'destructive', title: 'No payload provided' });
      return;
    }
    if (!password) {
      toast({ variant: 'destructive', title: 'Password required' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match' });
      return;
    }
    if (password.length < 12) {
      toast({ variant: 'destructive', title: 'Password too short', description: 'Minimum 12 characters required for secure encryption.' });
      return;
    }

    setIsProcessing(true);
    setCompletedStages([]);

    try {
      setCurrentStage('load');
      let maxCapacity: number;
      let imageData: ImageData | null = null;
      let wavData: WavData | null = null;

      if (carrierType === 'image') {
        imageData = await loadImage(carrierFile);
        const analysis = analyzeImageCapacity(imageData, lsbDepthValue);
        maxCapacity = analysis.maxCapacityBytes;
      } else {
        const buffer = await carrierFile.arrayBuffer();
        wavData = decodeWav(buffer);
        const analysis = analyzeWavCapacity(wavData, lsbDepthValue);
        maxCapacity = analysis.maxCapacityBytes;
      }
      setCompletedStages(['load']);

      setCurrentStage('analyze');
      await new Promise(r => setTimeout(r, 300));
      setCompletedStages(['load', 'analyze']);

      setCurrentStage('encrypt');
      let payloadBuffer: ArrayBuffer;
      let metadata: import('@/lib/payload-helper').PayloadMetadata;

      if (payloadText) {
        payloadBuffer = stringToBuffer(payloadText);
        metadata = { type: 'text', timestamp: Date.now() };
      } else {
        payloadBuffer = await payloadFile!.arrayBuffer();
        metadata = {
          type: 'file',
          name: payloadFile!.name,
          mimeType: payloadFile!.type || 'application/octet-stream',
          timestamp: Date.now()
        };
      }

      const packedPayload = packPayload(payloadBuffer, metadata);
      const { promise: encryptPromise } = encryptInWorker({
        payload: packedPayload,
        password,
        useArgon2: isExpertMode && useArgon2,
        compress: useCompression,
      });

      const packedData = await encryptPromise;
      if (packedData.byteLength > maxCapacity) throw new Error('Payload too large for carrier');
      setCompletedStages(['load', 'analyze', 'encrypt']);

      setCurrentStage('embed');
      let blob: Blob;
      let extension: string;

      if (carrierType === 'image' && imageData) {
        const result = embedData(imageData, packedData, lsbDepthValue);
        const isBmp = carrierFile?.type === 'image/bmp' || carrierFile?.name.toLowerCase().endsWith('.bmp');
        blob = isBmp ? createBmpBlob(result) : await createPngBlob(result);
        extension = isBmp ? 'bmp' : 'png';
      } else if (carrierType === 'audio' && wavData) {
        const result = embedWavData(wavData, packedData, lsbDepthValue);
        blob = encodeWav(result);
        extension = 'wav';
      } else throw new Error('Invalid state');
      
      setCompletedStages(['load', 'analyze', 'encrypt', 'embed']);

      setCurrentStage('save');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const originalName = carrierFile.name.replace(/\.[^/.]+$/, '');
      a.download = `${originalName}_steg.${extension}`;
      a.click();
      // Revoking instantly can cancel the download in Firefox/Safari.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setCompletedStages(['load', 'analyze', 'encrypt', 'embed', 'save']);

      toast({ title: 'Encoding Complete', description: 'Your file has been downloaded.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Encoding Failed', description: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setIsProcessing(false);
      setCurrentStage(null);
    }
  };

  const quickPasswordGen = () => {
    const pwd = generateSecurePassword(16);
    setPassword(pwd);
    setConfirmPassword(pwd);
    toast({ title: 'Password Generated', description: 'A secure 16-character password has been applied.' });
  };

  const encodeSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to Hide Encrypted Secret Data in Files (Steganography)',
    'description': 'Step-by-step guide to hiding AES-256-GCM encrypted messages or files inside PNG, BMP, WebP, TIFF, or WAV carrier files with StegCrypt.',
    'step': [
      {
        '@type': 'HowToStep',
        'name': 'Select Carrier File',
        'text': 'Upload a lossless carrier file such as PNG, BMP, lossless WebP, TIFF image, or WAV audio.'
      },
      {
        '@type': 'HowToStep',
        'name': 'Enter Payload',
        'text': 'Type the secret text message or upload a confidential payload file.'
      },
      {
        '@type': 'HowToStep',
        'name': 'Set Encryption Password',
        'text': 'Enter a secure password (minimum 12 characters) or generate one using the built-in cryptographically secure generator.'
      },
      {
        '@type': 'HowToStep',
        'name': 'Encode & Download',
        'text': 'Execute local LSB steganographic embedding and download the carrier file.'
      }
    ]
  };

  const canEncode = carrierFile && carrierType && (payloadText || payloadFile) && password && password === confirmPassword && password.length >= 12;

  return (
    <div className="container py-8 md:py-12 animate-fade-in">
      <PageSEO
        title="Encode"
        description="Hide encrypted data within images or audio files using LSB steganography."
        path="/encode"
        schema={encodeSchema}
      />
      <div className="max-w-4xl mx-auto">
        {mobileWarning && (
          <div className="mb-6 flex items-center gap-2 p-4 border-[3px] border-[#F0C020] bg-[#F0C020]/15 text-[#121212] dark:text-[#F0C020] text-sm font-bold shadow-[3px_3px_0px_0px_#F0C020]">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 stroke-[3px]" />
            {mobileWarning}
          </div>
        )}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <div className="h-10 w-10 bg-[#D02020] flex items-center justify-center border-[3px] border-[#121212] dark:border-white shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white]">
                <Lock className="h-5 w-5 text-white" />
              </div>
              Encode
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">Hide encrypted data within a carrier file</p>
          </div>
          <EngineStatus state={engineState} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="cyber-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black uppercase tracking-wide">Carrier File</h2>
                {carrierType && (
                  <div className="flex items-center gap-1.5 px-3 py-1 border-[2px] border-[#121212] dark:border-white bg-[#D02020] text-white text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white]">
                    {carrierType === 'image' ? <Image className="h-3 w-3 stroke-[3px]" /> : <Music className="h-3 w-3 stroke-[3px]" />}
                    {carrierFile ? `${carrierFile.name.split('.').pop()?.toUpperCase()} ${carrierType === 'image' ? 'Image' : 'Audio'}` : (carrierType === 'image' ? 'Image' : 'Audio')}
                  </div>
                )}
              </div>
                <FileDropzone
                  accept="image/png,image/bmp,image/webp,image/tiff,.bmp,.webp,.tiff,.tif,audio/wav,audio/wave,.wav"
                  maxSize={100}
                  onFileSelect={handleCarrierSelect}
                selectedFile={carrierFile}
                label="Select carrier file"
                description="PNG/BMP/WebP/TIFF image or WAV audio"
              />
            </div>

            <div className="cyber-card">
              <h2 className="font-black mb-4 uppercase tracking-wide">Payload</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payload-text" className="text-xs font-black uppercase tracking-wide">Message</Label>
                  <Textarea
                    id="payload-text"
                    placeholder="Enter secret text..."
                    value={payloadText}
                    onChange={(e) => { setPayloadText(e.target.value); setPayloadFile(null); }}
                    className="min-h-[120px] font-mono border-[2px] border-[#121212] dark:border-white"
                  />
                </div>
                {isExpertMode && (
                  <FileDropzone
                    accept="*/*"
                    maxSize={50}
                    onFileSelect={(file) => { setPayloadFile(file); if (file) setPayloadText(''); }}
                    selectedFile={payloadFile}
                    label="Or upload a file"
                  />
                )}
              </div>
            </div>

            <div className="cyber-card">
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-black uppercase tracking-wide">Encryption</h2>
                <PasswordGenerator onUsePassword={(pwd) => { setPassword(pwd); setConfirmPassword(pwd); }} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-black uppercase tracking-wide">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
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
                    <p className="text-[11px] font-bold text-[#D02020] animate-fade-in">Min 12 chars required ({password.length}/12)</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-xs font-black uppercase tracking-wide">Confirm</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-[2px] border-[#121212] dark:border-white rounded-none pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none p-1 transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] font-bold text-[#D02020] animate-fade-in">Passwords do not match</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="cyber-card shadow-[6px_6px_0px_0px_#1040C0] dark:shadow-[6px_6px_0px_0px_#1040C0]">
              <h3 className="font-bold mb-4 uppercase tracking-wide">Capacity</h3>
              <CapacityIndicator used={capacity.used} total={capacity.total} />
            </div>

            {isProcessing && (
              <div className="cyber-card">
                <ProcessingStages currentStage={currentStage} completedStages={completedStages} mode="encode" />
              </div>
            )}

            <div className="pt-4">
              <Button
                size="lg"
                className="w-full gap-2 min-h-[3.5rem] py-3 text-base font-black uppercase tracking-[0.15em] bauhaus-bg-red border-[3px] border-[#121212] dark:border-white shadow-[8px_8px_0px_0px_#121212] dark:shadow-[8px_8px_0px_0px_white] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:grayscale"
                disabled={!canEncode || isProcessing}
                onClick={handleEncode}
              >
                {isProcessing ? <>Processing…</> : <><Lock className="h-5 w-5 stroke-[3px] flex-shrink-0" /><span>Encode &amp; Download</span></>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
