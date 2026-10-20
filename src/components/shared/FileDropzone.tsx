import { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileDropzoneProps {
  accept: string;
  maxSize: number; // in MB
  onFileSelect: (file: File | null) => void;
  label: string;
  description?: string;
  selectedFile: File | null;
  error?: string;
}

export function FileDropzone({
  accept,
  maxSize,
  onFileSelect,
  label,
  description,
  selectedFile,
  error,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      return `File too large. Maximum size is ${maxSize}MB.`;
    }
    return null;
  }, [maxSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const err = validateFile(file);
      if (err) {
        setValidationError(err);
        onFileSelect(null);
      } else {
        setValidationError(null);
        onFileSelect(file);
      }
    }
  }, [onFileSelect, validateFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the input so selecting the same file again still fires onChange
    e.target.value = '';
    if (file) {
      const err = validateFile(file);
      if (err) {
        setValidationError(err);
        onFileSelect(null);
      } else {
        setValidationError(null);
        onFileSelect(file);
      }
    }
  }, [onFileSelect, validateFile]);

  const handleClear = useCallback(() => {
    setValidationError(null);
    onFileSelect(null);
  }, [onFileSelect]);

  const displayError = validationError || error;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-wide">{label}</label>

      {selectedFile ? (
        /* ── Selected state ─────────────────────────── */
        <div className="flex items-center gap-3 p-4 border-[3px] border-[#121212] dark:border-white bg-[#F0C020] shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] transition-all">
          <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-[#121212] dark:bg-white border-[2px] border-[#121212] dark:border-white">
            <File className="h-5 w-5 text-white dark:text-[#121212]" />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-sm font-black uppercase truncate max-w-full text-[#121212]">{selectedFile.name}</p>
            <p className="text-xs font-bold opacity-70 text-[#121212]">{formatFileSize(selectedFile.size)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 text-[#121212] hover:text-[#D02020] hover:bg-transparent"
            onClick={handleClear}
          >
            <X className="h-4 w-4 stroke-[3px]" />
          </Button>
        </div>
      ) : (
        /* ── Drop zone ──────────────────────────────── */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center p-6 sm:p-8',
            'border-[3px] border-dashed transition-all cursor-pointer',
            'focus-within:border-[#1040C0] focus-within:ring-4 focus-within:ring-[#1040C0]/20 focus-within:shadow-[4px_4px_0px_0px_#1040C0]',
            isDragging
              ? 'border-[#D02020] bg-[#D02020]/5 shadow-[4px_4px_0px_0px_#D02020] translate-x-[2px] translate-y-[2px]'
              : 'border-[#121212] dark:border-white hover:bg-[#F0C020]/10 hover:shadow-[4px_4px_0px_0px_#F0C020] hover:border-[#F0C020]',
            displayError && 'border-[#D02020] bg-[#D02020]/5'
          )}        >
          <input
            type="file"
            accept={accept}
            aria-label={label || 'Select carrier file'}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer focus:outline-none"
          />
          <div className={cn(
            'h-12 w-12 flex items-center justify-center border-[3px] mb-3 transition-all',
            isDragging
              ? 'border-[#D02020] bg-[#D02020] text-white'
              : 'border-[#121212] dark:border-white text-[#121212] dark:text-white'
          )}>
            <Upload className="h-6 w-6 stroke-[2.5px]" />
          </div>
          <p className="text-sm font-black uppercase tracking-wide text-center mb-1">
            Drop file here or click to browse
          </p>
          {description && (
            <p className="text-xs font-bold opacity-60 text-center">
              {description} · Max {maxSize}MB
            </p>
          )}
        </div>
      )}

      {displayError && (
        <div className="flex items-center gap-2 text-[#D02020] text-sm font-bold">
          <AlertCircle className="h-4 w-4 stroke-[3px] flex-shrink-0" />
          {displayError}
        </div>
      )}
    </div>
  );
}
