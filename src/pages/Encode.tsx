import { useState, useCallback, useEffect } from 'react';
import { Lock, Download, AlertTriangle, Info, Image, Music } from 'lucide-react';
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
import { useWasmEngine, mapToEngineState } from '@/hooks/use-wasm-engine';
import { encryptInWorker } from '@/workers/worker-client';
import { packEncryptedData, stringToBuffer } from '@/lib/crypto';
import { loadImage, analyzeImageCapacity, embedData, extractData, createPngBlob, createBmpBlob } from '@/lib/steganography';
import { decodeWav, encodeWav, analyzeWavCapacity, embedWavData, extractWavData, WavData } from '@/lib/wav-codec';
import { packPayload } from '@/lib/payload-helper';
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

const detectCarrierType = (file: File): CarrierType => {
  if (file.type === 'image/png' || file.type === 'image/bmp') return 'image';
  if (file.type === 'audio/wav' || file.type === 'audio/wave' || file.name.endsWith('.wav')) return 'audio';
  return null;
};

export default function Encode() {
  const { isExpertMode } = useMode();
  const { toast } = useToast();
  const { state: wasmState, initialize: initWasm } = useWasmEngine();
  const isMobile = isMobileDevice();

  const [carrierFile, setCarrierFile] = useState<File | null>(null);
  const [carrierType, setCarrierType] = useState<CarrierType>(null);
  const [payloadText, setPayloadText] = useState('');
  const [payloadFile, setPayloadFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  // Show mobile warning if LSB was forced
  useEffect(() => {
    if (isMobile && effectiveLsbDepth.forced) {
      setMobileWarning(effectiveLsbDepth.message || WARNING_MESSAGES.mobileLsbForced);
    } else {
      setMobileWarning(null);
    }
  }, [isMobile, effectiveLsbDepth]);

  // Recalculate capacity when LSB depth changes
  useEffect(() => {
    if (carrierFile && carrierType) {
      // Re-analyze carrier with new LSB depth
      (async () => {
        try {
          if (carrierType === 'image') {
            const imageData = await loadImage(carrierFile);
            const analysis = analyzeImageCapacity(imageData, parseInt(lsbDepth));
            setCapacity(prev => ({ ...prev, total: analysis.maxCapacityBytes }));
          } else {
            const buffer = await carrierFile.arrayBuffer();
            const wavData = decodeWav(buffer);
            const analysis = analyzeWavCapacity(wavData, parseInt(lsbDepth));
            setCapacity(prev => ({ ...prev, total: analysis.maxCapacityBytes }));
          }
        } catch (e) {
          // Ignore errors during recalculation
        }
      })();
    }
  }, [lsbDepth, carrierFile, carrierType]);

  const engineState = mapToEngineState(wasmState);

  const analyzeCarrier = useCallback(async (file: File, type: CarrierType) => {
    try {
      if (type === 'image') {
        const imageData = await loadImage(file);
        const analysis = analyzeImageCapacity(imageData, parseInt(lsbDepth));
        setCapacity({ used: 0, total: analysis.maxCapacityBytes });
      } else { // This 'else' now covers audio
        const buffer = await file.arrayBuffer();
        const wavData = decodeWav(buffer);
        const analysis = analyzeWavCapacity(wavData, parseInt(lsbDepth));
        setCapacity({ used: 0, total: analysis.maxCapacityBytes });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not analyze the carrier file.',
      });
    }
  }, [lsbDepth, toast]);

  const handleCarrierSelect = useCallback((file: File | null) => {
    setCarrierFile(file);
    if (file) {
      const type = detectCarrierType(file);
      setCarrierType(type);
      if (type) {
        analyzeCarrier(file, type);
      } else {
        toast({
          variant: 'destructive',
          title: 'Unsupported Format',
          description: 'Please use PNG images or WAV audio files.',
        });
        setCarrierFile(null);
        setCapacity({ used: 0, total: 0 });
      }
    } else {
      setCarrierType(null);
      setCapacity({ used: 0, total: 0 });
    }
  }, [analyzeCarrier, toast]);

  // Calculate used capacity based on payload
  useEffect(() => {
    let payloadSize = 0;
    if (payloadText) {
      payloadSize = new TextEncoder().encode(payloadText).length;
    } else if (payloadFile) {
      payloadSize = payloadFile.size;
    }
    // Add overhead if there's actual payload:
    // Metadata: 1 byte version + 4 bytes meta len + ~50 bytes JSON = ~55 bytes
    // Crypto: 1 byte flags + 4 bytes salt len + 16 bytes salt + 12 bytes IV + 16 bytes auth tag = 49 bytes
    // Total overhead: ~105 bytes (rounded up for safety)
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
      toast({ variant: 'destructive', title: 'Password must be at least 12 characters', description: 'Strong passwords are essential for security.' });
      return;
    }

    setIsProcessing(true);
    setCompletedStages([]);

    try {
      // Stage 1: Load
      setCurrentStage('load');

      let maxCapacity: number;
      let imageData: ImageData | null = null;
      let wavData: WavData | null = null;

      if (carrierType === 'image') {
        imageData = await loadImage(carrierFile);
        const analysis = analyzeImageCapacity(imageData, parseInt(lsbDepth));
        maxCapacity = analysis.maxCapacityBytes;
      } else {
        const buffer = await carrierFile.arrayBuffer();
        wavData = decodeWav(buffer);
        const analysis = analyzeWavCapacity(wavData, parseInt(lsbDepth));
        maxCapacity = analysis.maxCapacityBytes;
      }
      setCompletedStages(['load']);

      // Stage 2: Analyze
      setCurrentStage('analyze');
      await new Promise(r => setTimeout(r, 300)); // Visual feedback
      setCompletedStages(['load', 'analyze']);

      // Stage 3: Encrypt
      setCurrentStage('encrypt');

      let payloadBuffer: ArrayBuffer;
      let metadata: import('@/lib/payload-helper').PayloadMetadata;

      if (payloadText) {
        payloadBuffer = stringToBuffer(payloadText);
        metadata = {
          type: 'text',
          timestamp: Date.now()
        };
      } else {
        // Handle potentially corrupted payload files
        try {
          payloadBuffer = await payloadFile!.arrayBuffer();
          // Validate that we got data
          if (!payloadBuffer || payloadBuffer.byteLength === 0) {
            throw new Error('Empty payload file');
          }
        } catch (fileError) {
          throw new Error('Failed to read payload file - file may be corrupted or inaccessible');
        }
        metadata = {
          type: 'file',
          name: payloadFile!.name,
          mimeType: payloadFile!.type || 'application/octet-stream',
          timestamp: Date.now()
        };
      }

      const packedPayload = packPayload(payloadBuffer, metadata);

      const { promise: encryptPromise, cancel: cancelEncrypt } = encryptInWorker({
        payload: packedPayload,
        password,
        useArgon2: isExpertMode && useArgon2,
        compress: useCompression,
        onProgress: (progress, stage, message) => {
          // Optional: Update granular progress if needed
        }
      });

      // Store cancel function if needed (omitted for brevity, can be added to state)
      const encrypted = await encryptPromise;

      // Note: encryptInWorker now returns packed data directly!
      // No need to call packEncryptedData separately if worker handles it.
      // My worker implementation DOES pack it.
      // So 'encrypted' IS 'packedData'.
      const packedData = encrypted;

      if (packedData.byteLength > maxCapacity) {
        throw new Error('Payload too large for carrier');
      }
      setCompletedStages(['load', 'analyze', 'encrypt']);

      // Stage 4: Embed
      setCurrentStage('embed');
      let blob: Blob;
      let extension: string;

      if (carrierType === 'image' && imageData) {
        const result = embedData(imageData, packedData, parseInt(lsbDepth));

        // Verify embedding worked by testing extraction immediately
        const verifyImageData = new ImageData(
          new Uint8ClampedArray(result.data),
          result.width,
          result.height
        );
        const verifyExtract = extractData(verifyImageData, parseInt(lsbDepth));
        if (!verifyExtract) {
          throw new Error('Embedding verification failed - data not extractable');
        }

        // Output in same format as input for maximum compatibility
        // BMP is lossless, PNG is also lossless - both work fine
        const isBmp = carrierFile?.type === 'image/bmp' || carrierFile?.name.toLowerCase().endsWith('.bmp');
        if (isBmp) {
          blob = createBmpBlob(result);
          extension = 'bmp';
        } else {
          blob = await createPngBlob(result);
          extension = 'png';
        }
      } else if (carrierType === 'audio' && wavData) {
        const result = embedWavData(wavData, packedData, parseInt(lsbDepth));

        // Verify embedding worked by testing extraction immediately
        const verifyExtract = extractWavData(result, parseInt(lsbDepth));
        if (!verifyExtract) {
          throw new Error('Audio embedding verification failed - data not extractable');
        }

        blob = encodeWav(result);
        extension = 'wav';
      } else {
        throw new Error('Invalid carrier type');
      }
      setCompletedStages(['load', 'analyze', 'encrypt', 'embed']);

      // Stage 5: Save
      setCurrentStage('save');

      // Trigger download with clean filename
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Use original filename with simple prefix or just a generic name
      const originalName = carrierFile.name.replace(/\.[^/.]+$/, '');
      a.download = `${originalName}_copy.${extension}`;
      a.click();
      URL.revokeObjectURL(url);

      setCompletedStages(['load', 'analyze', 'encrypt', 'embed', 'save']);

      toast({
        title: 'Encoding Complete',
        description: 'Your file has been downloaded.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Encoding Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsProcessing(false);
      setCurrentStage(null);
    }
  };

  const canEncode = carrierFile && carrierType && (payloadText || payloadFile) && password && password === confirmPassword;

  return (
    <div className="container py-8 md:py-12 animate-fade-in">
      <PageSEO
        title="Encode"
        description="Hide encrypted data within images or audio files using LSB steganography. Secure AES-256 encryption with 100% local processing."
        path="/encode"
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
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary-foreground" />
              </div>
              Encode
            </h1>
            <p className="text-muted-foreground mt-2">
              Hide encrypted data within a carrier file
            </p>
          </div>
          <EngineStatus state={engineState} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carrier File */}
            <div className="cyber-card">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                Carrier File
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The carrier file hides your data. Only lossless formats (PNG, WAV) preserve data integrity.</p>
                  </TooltipContent>
                </Tooltip>
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
                onFileSelect={handleCarrierSelect}
                selectedFile={carrierFile}
                label="Select carrier file"
                description="PNG/BMP image or WAV audio"
              />
            </div>

            {/* Payload */}
            <div className="cyber-card">
              <h2 className="font-semibold mb-4">Payload</h2>

              {!isExpertMode ? (
                <div className="space-y-2">
                  <Label htmlFor="payload-text">Secret Message</Label>
                  <Textarea
                    id="payload-text"
                    placeholder="Enter your secret message..."
                    value={payloadText}
                    onChange={(e) => setPayloadText(e.target.value)}
                    className="min-h-[120px] font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payload-text">Text Payload</Label>
                    <Textarea
                      id="payload-text"
                      placeholder="Enter text or use file below..."
                      value={payloadText}
                      onChange={(e) => {
                        setPayloadText(e.target.value);
                        setPayloadFile(null);
                      }}
                      className="min-h-[100px] font-mono"
                      disabled={!!payloadFile}
                    />
                  </div>
                  <div className="text-center text-sm text-muted-foreground">or</div>
                  <FileDropzone
                    accept="*/*"
                    maxSize={isMobile ? FILE_LIMITS.mobile.payload / (1024 * 1024) : FILE_LIMITS.desktop.payload / (1024 * 1024)}
                    onFileSelect={(file) => {
                      setPayloadFile(file);
                      if (file) setPayloadText('');
                    }}
                    selectedFile={payloadFile}
                    label="Payload file"
                    description="Any file type"
                  />
                </div>
              )}
            </div>

            {/* Encryption */}
            <div className="cyber-card">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                Encryption
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Uses AES-256-GCM encryption with PBKDF2 key derivation (100,000 iterations).</p>
                  </TooltipContent>
                </Tooltip>
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 12 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {password && confirmPassword && password !== confirmPassword && (
                <div className="mt-3 flex items-center gap-2 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Passwords do not match
                </div>
              )}
            </div>

            {/* Expert Options - Only shown in Expert Mode */}
            {isExpertMode && (
              <div className="cyber-card border-warning/30 bg-warning/5">
                <h2 className="font-semibold mb-4 flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  Expert Options
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lsb-depth">LSB Depth</Label>
                    <Select value={lsbDepth} onValueChange={setLsbDepth}>
                      <SelectTrigger id="lsb-depth">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 bit (Most secure)</SelectItem>
                        <SelectItem value="2">2 bits</SelectItem>
                        <SelectItem value="3">3 bits</SelectItem>
                        <SelectItem value="4">4 bits (Highest capacity)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Higher depth = more capacity but more detectable
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="high-security-mode">High Security Mode</Label>
                      <p className="text-xs text-muted-foreground">
                        310K PBKDF2 iterations (3x slower, stronger)
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="high-security-mode"
                        checked={useArgon2}
                        onChange={(e) => setUseArgon2(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Capacity */}
            <div className="cyber-card">
              <h3 className="font-semibold mb-4">Safety & Capacity</h3>
              <CapacityIndicator used={capacity.used} total={capacity.total} />
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="cyber-card">
                <h3 className="font-semibold mb-4">Progress</h3>
                <ProcessingStages
                  currentStage={currentStage}
                  completedStages={completedStages}
                  mode="encode"
                />
              </div>
            )}

            {/* Encode Button */}
            <Button
              size="lg"
              className="w-full gap-2"
              disabled={!canEncode || isProcessing}
              onClick={handleEncode}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Encode & Download
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
