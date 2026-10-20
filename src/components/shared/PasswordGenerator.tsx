// PasswordGenerator component for StegCrypt
// Generates cryptographically strong random passwords using Web Crypto API

import { useState, useCallback } from 'react';
import { Key, RefreshCw, Copy, Check, Eye, EyeOff, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Character sets for password generation
const CHARSET_LOWER = 'abcdefghijkmnpqrstuvwxyz'; // no l, o (ambiguous)
const CHARSET_UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I, O (ambiguous)
const CHARSET_DIGITS = '23456789'; // no 0, 1 (ambiguous)
const CHARSET_SYMBOLS = '!@#$%^&*-_=+';

const ALL_CHARS = CHARSET_LOWER + CHARSET_UPPER + CHARSET_DIGITS + CHARSET_SYMBOLS;

function generateSecurePassword(length: number = 24): string {
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  // Ensure we have at least one of each type
  const guaranteed = [
    CHARSET_LOWER[array[0] % CHARSET_LOWER.length],
    CHARSET_UPPER[array[1] % CHARSET_UPPER.length],
    CHARSET_DIGITS[array[2] % CHARSET_DIGITS.length],
    CHARSET_SYMBOLS[array[3] % CHARSET_SYMBOLS.length],
  ];

  const rest: string[] = [];
  for (let i = 4; i < length; i++) {
    rest.push(ALL_CHARS[array[i] % ALL_CHARS.length]);
  }

  // Shuffle everything together using Fisher-Yates
  const combined = [...guaranteed, ...rest];
  const shuffleArr = new Uint32Array(combined.length);
  crypto.getRandomValues(shuffleArr);
  for (let i = combined.length - 1; i > 0; i--) {
    const j = shuffleArr[i] % (i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join('');
}

function getPasswordStrength(password: string): {
  score: number; // 0–4
  label: string;
  color: string;
  entropy: number;
} {
  if (!password) return { score: 0, label: '', color: '', entropy: 0 };

  const len = password.length;
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 32;

  const entropy = Math.floor(len * Math.log2(pool || 1));

  let score = 0;
  if (entropy >= 40) score = 1;
  if (entropy >= 60) score = 2;
  if (entropy >= 80) score = 3;
  if (entropy >= 100) score = 4;

  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = [
    'bg-destructive',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-success',
  ];

  return { score, label: labels[score], color: colors[score], entropy };
}

interface PasswordGeneratorProps {
  onUsePassword: (password: string) => void;
  className?: string;
}

export function PasswordGenerator({ onUsePassword, className }: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const generate = useCallback(() => {
    setPassword(generateSecurePassword(24));
  }, []);

  const handleCopy = useCallback(async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  const handleUse = useCallback(() => {
    onUsePassword(password);
  }, [password, onUsePassword]);

  const strength = getPasswordStrength(password);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('gap-2 text-xs font-bold uppercase border-[2px] border-[#121212] dark:border-white shadow-[2px_2px_0px_0px_black] dark:shadow-[2px_2px_0px_0px_white] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all', className)}
        >
          <Key className="h-3.5 w-3.5 stroke-[3px]" />
          Generate Password
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 border-[3px] border-[#121212] dark:border-white rounded-none shadow-[8px_8px_0px_0px_black] dark:shadow-[8px_8px_0px_0px_white] bg-background" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b-2 border-current pb-3">
            <div className="h-10 w-10 border-[2px] border-current bg-[#F0C020] flex items-center justify-center shadow-[3px_3px_0px_0px_black]">
              <Zap className="h-5 w-5 text-[#121212] stroke-[3px]" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-tight">Password Generator</p>
              <p className="text-[10px] font-bold opacity-70">CRYPTOGRAPHICALLY SECURE</p>
            </div>
          </div>

          {/* Generated password display */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-tight">Generated Password</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  readOnly
                  aria-label="Generated password"
                  placeholder="Click generate..."
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="font-mono text-xs pr-8 border-[2px] border-current rounded-none select-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F0C020]"
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5 stroke-[3px]" /> : <Eye className="h-3.5 w-3.5 stroke-[3px]" />}
                  </button>
                )}
              </div>
            </div>

            {/* Strength meter */}
            {password && (
              <div className="space-y-2">
                <div className="flex gap-1 h-3 border-[2px] border-current p-[1px]">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 transition-colors',
                        i < strength.score ? strength.color : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span>{strength.label}</span>
                  <span className="opacity-70">{strength.entropy} BITS ENTROPY</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={generate}
              size="sm"
              className="w-full gap-2 font-bold uppercase border-[2px] border-current shadow-[3px_3px_0px_0px_black] dark:shadow-[3px_3px_0px_0px_white] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5 stroke-[3px]" />
              {password ? 'Regenerate' : 'Generate'}
            </Button>

            {password && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 font-bold uppercase border-[2px] border-current shadow-[3px_3px_0px_0px_black] dark:shadow-[3px_3px_0px_0px_white] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 stroke-[3px]" />Copied</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5 stroke-[3px]" />Copy</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="flex-1 gap-2 font-bold uppercase border-[2px] border-[#121212] dark:border-white bg-[#1040C0] text-white shadow-[3px_3px_0px_0px_black] dark:shadow-[3px_3px_0px_0px_white] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  onClick={handleUse}
                >
                  <Key className="h-3.5 w-3.5 stroke-[3px]" />
                  Use This
                </Button>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Generated locally with Web Crypto API. Never transmitted.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
