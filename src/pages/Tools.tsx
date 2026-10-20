import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Hash, Binary, RefreshCw, Check, Copy, Key, FileText, Shield, Lock, Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageSEO } from '@/components/PageSEO';
import { useToast } from '@/hooks/use-toast';
import { FileDropzone } from '@/components/shared/FileDropzone';
import { cn } from '@/lib/utils';
import { generateSecurePassword } from '@/lib/crypto';

// ----------- Helpers -----------

function hexToBase64(hex: string): string {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return btoa(String.fromCharCode(...bytes));
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}



// ----------- Sub-components -----------

function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const handleCopy = async () => {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
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
    } catch {
      toast({
        variant: 'destructive',
        title: 'Copy failed',
        description: 'Unable to access clipboard. Please copy manually.'
      });
    }
  };
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      className={`gap-2 rounded-none border-[2px] border-[#121212] dark:border-white shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${className}`}
    >
      {copied ? <><Check className="h-3.5 w-3.5 stroke-[3px]" />Copied</> : <><Copy className="h-3.5 w-3.5 stroke-[3px]" />Copy</>}
    </Button>
  );
}

// ----------- Hash Tool -----------

function HashTool() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const compute = useCallback(async () => {
    if (!input) return;
    setLoading(true);
    try {
      const enc = new TextEncoder().encode(input);
      const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
      const hashes: Record<string, string> = {};
      for (const algo of algos) {
        const buf = await crypto.subtle.digest(algo, enc);
        hashes[algo] = bufToHex(buf);
      }
      setResults(hashes);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Hash failed',
        description: 'The browser refused the crypto operation. Make sure the page is served over HTTPS.',
      });
    } finally {
      setLoading(false);
    }
  }, [input, toast]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hash-input">Input Text</Label>
        <Textarea
          id="hash-input"
          placeholder="Enter text to hash..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[100px] font-mono"
        />
      </div>
      <Button 
        onClick={compute} 
        disabled={!input || loading} 
        className="gap-2 w-full sm:w-auto rounded-none border-[3px] border-[#121212] dark:border-white bg-[#1040C0] text-white shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
      >
        <Hash className="h-4 w-4 stroke-[3px]" />
        {loading ? 'Computing...' : 'Compute Hashes'}
      </Button>

      {Object.entries(results).length > 0 && (
        <div className="space-y-3 pt-2">
          {Object.entries(results).map(([algo, hash]) => (
            <div key={algo} className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">{algo}</Label>
                <CopyButton text={hash} className="h-7 text-xs" />
              </div>
              <Input value={hash} readOnly className="font-mono text-xs" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ----------- Base64 Tool -----------

function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  const process = useCallback(() => {
    setError('');
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch {
      setError('Invalid Base64 input for decoding');
      setOutput('');
    }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={mode === 'encode' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setMode('encode'); setOutput(''); setError(''); }}
          className={cn(
            "rounded-none border-2 border-[#121212] dark:border-white transition-all",
            mode === 'encode' ? "bg-[#D02020] text-white shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white]" : "bg-transparent shadow-none"
          )}
        >Encode</Button>
        <Button
          variant={mode === 'decode' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setMode('decode'); setOutput(''); setError(''); }}
          className={cn(
            "rounded-none border-2 border-[#121212] dark:border-white transition-all",
            mode === 'decode' ? "bg-[#1040C0] text-white shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white]" : "bg-transparent shadow-none"
          )}
        >Decode</Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="b64-input">{mode === 'encode' ? 'Plain Text' : 'Base64 Input'}</Label>
        <Textarea
          id="b64-input"
          placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 to decode...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[100px] font-mono"
        />
      </div>

      <Button 
        onClick={process} 
        disabled={!input} 
        className={cn(
          "gap-2 w-full sm:w-auto rounded-none border-[3px] border-[#121212] dark:border-white text-white shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
          mode === 'encode' ? "bg-[#D02020]" : "bg-[#1040C0]"
        )}
      >
        <Binary className="h-4 w-4 stroke-[3px]" />
        {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Output</Label>
            <CopyButton text={output} className="h-7 text-xs" />
          </div>
          <Textarea value={output} readOnly className="min-h-[100px] font-mono text-xs" />
        </div>
      )}
    </div>
  );
}

// ----------- Hex Tool -----------

function HexTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode'|'decode'>('encode');
  const [error, setError] = useState('');

  const process = useCallback(() => {
    setError('');
    try {
      if (mode === 'encode') {
        const bytes = new TextEncoder().encode(input);
        setOutput(Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
      } else {
        const hexStr = input.replace(/\s+/g, '');
        if (hexStr.length === 0 || hexStr.length % 2 !== 0 || /[^0-9a-fA-F]/.test(hexStr)) {
          throw new Error('Invalid hex input');
        }
        const bytes = new Uint8Array(hexStr.length / 2);
        for (let i = 0; i < hexStr.length; i += 2) {
          bytes[i / 2] = parseInt(hexStr.substring(i, i + 2), 16);
        }
        setOutput(new TextDecoder().decode(bytes));
      }
    } catch {
       setError('Invalid input');
       setOutput('');
    }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={mode === 'encode' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setMode('encode'); setOutput(''); setError(''); }}
          className={cn(
            "rounded-none border-2 border-[#121212] dark:border-white transition-all",
            mode === 'encode' ? "bg-[#D02020] text-white shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white]" : "bg-transparent shadow-none"
          )}
        >Text to Hex</Button>
        <Button
          variant={mode === 'decode' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setMode('decode'); setOutput(''); setError(''); }}
          className={cn(
            "rounded-none border-2 border-[#121212] dark:border-white transition-all",
            mode === 'decode' ? "bg-[#1040C0] text-white shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white]" : "bg-transparent shadow-none"
          )}
        >Hex to Text</Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hex-input">{mode === 'encode' ? 'Plain Text' : 'Hexadecimal Input'}</Label>
        <Textarea
          id="hex-input"
          placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste Hex to decode...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[100px] font-mono"
        />
      </div>

      <Button 
        onClick={process} 
        disabled={!input} 
        className={cn(
          "gap-2 w-full sm:w-auto rounded-none border-[3px] border-[#121212] dark:border-white text-white shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
          mode === 'encode' ? "bg-[#D02020]" : "bg-[#1040C0]"
        )}
      >
        <FileText className="h-4 w-4 stroke-[3px]" />
        {mode === 'encode' ? 'Convert to Hex' : 'Convert to Text'}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Output</Label>
            <CopyButton text={output} className="h-7 text-xs" />
          </div>
          <Textarea value={output} readOnly className="min-h-[100px] font-mono text-[10px] break-all leading-relaxed" />
        </div>
      )}
    </div>
  );
}

// ----------- Image Converter Tool -----------

function ImageConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [targetType, setTargetType] = useState('image/png');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const img = new window.Image();
      const url = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image format.'));
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas operations not supported in this browser.');
      
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (!blob) {
          setError('Conversion failed. Format might not be supported.');
          setLoading(false);
          return;
        }

        const ext = blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : 'png';
        const newName = file.name.replace(/\.[^/.]+$/, '') + `_converted.${ext}`;

        const dl = document.createElement('a');
        dl.href = URL.createObjectURL(blob);
        dl.download = newName;
        dl.click();
        const dlUrl = dl.href;
        setTimeout(() => URL.revokeObjectURL(dlUrl), 1000);

        toast({ title: 'Conversion Complete', description: `File saved as ${newName}` });
        setLoading(false);
      }, targetType, 1.0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fatal conversion error');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileDropzone
        accept="image/*"
        maxSize={20}
        onFileSelect={setFile}
        selectedFile={file}
        label="Select Image to Convert"
        description="Supports JPG, PNG, WEBP, GIF (static)"
      />

      {file && (
        <div className="space-y-4 pt-4 border-t-2 border-[#121212] dark:border-white">
          <div className="space-y-2">
            <Label>Target Format</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={targetType === 'image/png' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTargetType('image/png')}
                className="rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_black] dark:shadow-[2px_2px_0px_0px_white]"
              >
                PNG (Lossless)
              </Button>
              <Button
                variant={targetType === 'image/webp' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTargetType('image/webp')}
                className="rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_black] dark:shadow-[2px_2px_0px_0px_white]"
              >
                WEBP (Lossy)
              </Button>
              <Button
                variant={targetType === 'image/jpeg' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTargetType('image/jpeg')}
                className="rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_black] dark:shadow-[2px_2px_0px_0px_white]"
              >
                JPEG
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: PNG is the only lossless output here. WebP and JPEG are re-encoded lossily by the
              browser and cannot be used as Steganography carriers.
            </p>
          </div>

          <Button 
            onClick={handleConvert} 
            disabled={loading} 
            className="w-full gap-2 rounded-none border-[3px] border-[#121212] dark:border-white shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_white] hover:translate-y-[2px] hover:translate-x-[2px] active:shadow-none hover:shadow-[2px_2px_0px_0px_black] dark:hover:shadow-[2px_2px_0px_0px_white] transition-all bg-[#F0C020] text-[#121212]"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            {loading ? 'Converting...' : 'Convert Image'}
          </Button>
          
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ----------- Binary Tool -----------

function BinaryTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  const process = useCallback(() => {
    setError('');
    if (!input) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'encode') {
        const bin = Array.from(new TextEncoder().encode(input))
          .map(b => b.toString(2).padStart(8, '0'))
          .join(' ');
        setOutput(bin);
      } else {
        const clean = input.replace(/[^01]/g, '');
        if (clean.length % 8 !== 0) {
          setError('Warning: Binary string length should be a multiple of 8');
        }
        const bytes = clean.match(/.{1,8}/g)?.map(b => parseInt(b, 2)) || [];
        setOutput(new TextDecoder().decode(new Uint8Array(bytes)));
      }
    } catch {
      setError('Invalid input for conversion');
      setOutput('');
    }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={mode === 'encode' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setMode('encode'); setOutput(''); setError(''); }}
          className={cn(mode === 'encode' && "bauhaus-bg-red")}
        >Text to Binary</Button>
        <Button
          variant={mode === 'decode' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setMode('decode'); setOutput(''); setError(''); }}
          className={cn(mode === 'decode' && "bauhaus-bg-blue")}
        >Binary to Text</Button>
      </div>

      <div className="space-y-2">
        <Label>{mode === 'encode' ? 'Normal Text' : 'Binary Code (0101...)'}</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? 'Hello World' : '01001000 01100101...'}
          className="font-mono min-h-[120px]"
        />
      </div>

      <Button 
        onClick={process} 
        className={cn(
          "w-full sm:w-auto rounded-none border-[3px] border-[#121212] dark:border-white text-white shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
          mode === 'encode' ? "bg-[#D02020]" : "bg-[#1040C0]"
        )}
      >
        Convert
      </Button>

      {error && <p className="text-destructive text-sm font-bold uppercase">{error}</p>}

      {output && (
        <div className="space-y-2 pt-4">
          <Label>Result</Label>
          <div className="relative group">
            <Textarea
              value={output}
              readOnly
              className="font-mono min-h-[120px] bg-muted/30"
            />
            <div className="absolute top-2 right-2">
              <CopyButton text={output} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------- Password Generator Tool -----------

function PasswordGeneratorTool() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(24);

  // Keep the slider/number input inside the supported 8-64 range
  const clampLength = (value: number) => {
    if (!Number.isFinite(value)) return 8;
    return Math.min(64, Math.max(8, Math.round(value)));
  };

  const generate = () => {
    const pwd = generateSecurePassword(clampLength(length));
    setPassword(pwd);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Label htmlFor="password-length">Length: {length}</Label>
        <div className="flex items-center gap-4">
           <input
             id="password-length"
             type="range"
             min="8"
             max="64"
             value={length}
             aria-label="Password length slider"
             aria-valuemin={8}
             aria-valuemax={64}
             aria-valuenow={length}
             onChange={e => setLength(clampLength(Number(e.target.value)))}
             className="w-full accent-primary"
           />
           <Input
             type="number"
             min="8"
             max="64"
             value={length}
             aria-label="Password length number input"
             onChange={e => setLength(clampLength(Number(e.target.value)))}
             className="w-20 font-mono"
           />
        </div>
      </div>
      <Button 
        onClick={generate} 
        className="gap-2 w-full sm:w-auto rounded-none border-[3px] border-[#121212] dark:border-white bg-[#F0C020] text-[#121212] shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] font-black uppercase tracking-widest transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
      >
        <Key className="w-4 h-4 stroke-[3px]" /> Generate Password
      </Button>
      {password && (
        <div className="space-y-2 pt-4">
          <Label>Generated Password</Label>
          <div className="flex gap-2">
             <Input value={password} readOnly className="font-mono text-center text-lg h-auto py-3 shrink" />
             <CopyButton text={password} className="shrink-0 h-auto" />
          </div>
        </div>
      )}
    </div>
  );
}

// ----------- Main Tools Page -----------

const TOOLS = [
  { id: 'image-converter', label: 'Image Converter', icon: RefreshCw, description: 'Convert images' },
  { id: 'hash', label: 'Hash Gen', icon: Hash, description: 'SHA family' },
  { id: 'base64', label: 'Base64', icon: Code, description: 'Encoding' },
  { id: 'binary', label: 'Binary', icon: Binary, description: '010101 conversion' },
  { id: 'password', label: 'Passwords', icon: Key, description: 'Secure gen' },
  { id: 'hex', label: 'Hex', icon: FileText, description: 'Hexadecimal' },
];

export default function Tools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'image-converter';
  const validTab = TOOLS.some(t => t.id === currentTab) ? currentTab : 'image-converter';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  };

  const toolsSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'StegCrypt Security & Privacy Tools',
    'url': 'https://stegcrypt.app/tools',
    'applicationCategory': 'SecurityApplication',
    'operatingSystem': 'All',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'featureList': [
      'Image Format Converter (PNG, WebP, JPEG, BMP)',
      'SHA Hash Generator (SHA-1, SHA-256, SHA-384, SHA-512)',
      'Base64 Encoder and Decoder (UTF-8 safe)',
      'Binary Text Converter',
      'Cryptographically Secure Password Generator',
      'Hexadecimal Text Converter'
    ]
  };

  return (
    <div className="container py-8 md:py-12 animate-fade-in">
      <PageSEO
        title="Security Tools"
        description="Free browser-based security tools: SHA hash generator, Base64 encoder/decoder, secure password generator, and hex converter. All processing is 100% local."
        path="/tools"
        schema={toolsSchema}
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-[#1040C0] border-[3px] border-[#121212] dark:border-white shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] mb-6 transform -rotate-3 hover:rotate-3 transition-transform">
            <Shield className="h-8 w-8 text-white stroke-[3px]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">Security Tools</h1>
          <p className="text-lg font-bold opacity-80 max-w-2xl mx-auto">
            Privacy-first cryptographic utilities. All processing happens
            locally in your browser — no data is ever sent to a server.
          </p>
        </div>

        {/* Tools Tabs */}
        <Tabs value={validTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto gap-2 bg-transparent p-0" aria-label="Security utilities tabs">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <TabsTrigger
                  key={tool.id}
                  value={tool.id}
                  className="flex flex-col gap-1.5 py-4 h-auto rounded-none border-[3px] border-[#121212] dark:border-white shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] data-[state=active]:bg-[#121212] data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-[#121212] data-[state=active]:shadow-none data-[state=active]:translate-x-[4px] data-[state=active]:translate-y-[4px] transition-all bg-white dark:bg-[#121212] text-[#121212] dark:text-white hover:-translate-y-1 hover:shadow-none"
                >
                  <Icon className="h-5 w-5 stroke-[3px]" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{tool.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="image-converter">
            <div className="cyber-card shadow-[6px_6px_0px_0px_#F0C020] dark:shadow-[6px_6px_0px_0px_#F0C020]">
              <div className="mb-6 flex items-start gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-[#F0C020] border-[3px] border-[#121212] dark:border-white shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white] shrink-0">
                  <RefreshCw className="h-5 w-5 text-[#121212] stroke-[3px]" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wide">Image Format Converter</h2>
                  <p className="text-sm font-medium opacity-70 mt-1">
                    Convert image formats entirely in your browser. Especially useful for generating Lossless PNG or WEBP carriers for Steganography.
                  </p>
                </div>
              </div>
              <ImageConverterTool />
            </div>
          </TabsContent>

          <TabsContent value="hash">
            <div className="cyber-card shadow-[6px_6px_0px_0px_#1040C0] dark:shadow-[6px_6px_0px_0px_#1040C0]">
              <div className="mb-6 flex items-start gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-[#1040C0] border-[3px] border-[#121212] dark:border-white shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white] shrink-0">
                  <Hash className="h-5 w-5 text-white stroke-[3px]" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wide">Hash Generator</h2>
                  <p className="text-sm font-medium opacity-70 mt-1">
                    Compute cryptographic hashes using the Web Crypto API. Supports SHA-1, SHA-256, SHA-384, and SHA-512.
                  </p>
                </div>
              </div>
              <HashTool />
            </div>
          </TabsContent>

          <TabsContent value="base64">
            <div className="cyber-card shadow-[6px_6px_0px_0px_#D02020] dark:shadow-[6px_6px_0px_0px_#D02020]">
              <div className="mb-6 flex items-start gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-[#D02020] border-[3px] border-[#121212] dark:border-white shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white] shrink-0">
                  <Binary className="h-5 w-5 text-white stroke-[3px]" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wide">Base64 Encoder / Decoder</h2>
                  <p className="text-sm font-medium opacity-70 mt-1">
                    Encode plain text to Base64 or decode Base64 back to plain text. Supports UTF-8 characters.
                  </p>
                </div>
              </div>
              <Base64Tool />
            </div>
          </TabsContent>

          <TabsContent value="binary">
            <div className="cyber-card shadow-[6px_6px_0px_0px_#1040C0] dark:shadow-[6px_6px_0px_0px_#1040C0]">
              <div className="mb-6 flex items-start gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-[#1040C0] border-[3px] border-[#121212] dark:border-white shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white] shrink-0">
                  <Binary className="h-5 w-5 text-white stroke-[3px]" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wide">Binary Converter</h2>
                  <p className="text-sm font-medium opacity-70 mt-1">
                    Convert between plain text and binary representation (0s and 1s). Useful for low-level data inspection.
                  </p>
                </div>
              </div>
              <BinaryTool />
            </div>
          </TabsContent>

          <TabsContent value="password">
            <div className="cyber-card shadow-[6px_6px_0px_0px_#1040C0] dark:shadow-[6px_6px_0px_0px_#1040C0]">
              <div className="mb-6 flex items-start gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-[#F0C020] border-[3px] border-[#121212] dark:border-white shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white] shrink-0">
                  <Key className="h-5 w-5 text-[#121212] stroke-[3px]" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wide">Secure Password Generator</h2>
                  <p className="text-sm font-medium opacity-70 mt-1">
                    Generate strong, cryptographically random passwords using Web Crypto API.
                    No patterns, no predictability.
                  </p>
                </div>
              </div>
              <PasswordGeneratorTool />
            </div>
          </TabsContent>

          <TabsContent value="hex">
            <div className="cyber-card shadow-[6px_6px_0px_0px_#D02020] dark:shadow-[6px_6px_0px_0px_#D02020]">
              <div className="mb-6 flex items-start gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-[#D02020] border-[3px] border-[#121212] dark:border-white shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white] shrink-0">
                  <FileText className="h-5 w-5 text-white stroke-[3px]" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wide">Hex Converter</h2>
                  <p className="text-sm font-medium opacity-70 mt-1">
                    Convert text to hexadecimal representation and back. Useful for inspecting binary data.
                  </p>
                </div>
              </div>
              <HexTool />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
