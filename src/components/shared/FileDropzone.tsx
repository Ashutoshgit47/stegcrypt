import { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileDropzoneProps {
  accept: string;
  maxSize: number; // in MB
  onFileSelect: (file: File | null) => void;
  label: string;
  description: string;
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
      const validationError = validateFile(file);
      if (validationError) {
        onFileSelect(null);
      } else {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, validateFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        onFileSelect(null);
      } else {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, validateFile]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      {selectedFile ? (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <File className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onFileSelect(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-colors cursor-pointer',
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-muted-foreground/50 hover:bg-muted/30',
            error && 'border-destructive'
          )}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className={cn(
            'h-10 w-10 mb-3',
            isDragging ? 'text-primary' : 'text-muted-foreground'
          )} />
          <p className="text-sm font-medium text-center mb-1">
            Drop file here or click to browse
          </p>
          <p className="text-xs text-muted-foreground text-center">
            {description} • Max {maxSize}MB
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
