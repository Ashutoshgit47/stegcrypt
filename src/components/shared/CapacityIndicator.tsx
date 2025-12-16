import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CapacityIndicatorProps {
  used: number; // bytes
  total: number; // bytes
  className?: string;
}

export function CapacityIndicator({ used, total, className }: CapacityIndicatorProps) {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;

  const getStatus = () => {
    if (percentage <= 50) return { level: 'safe', label: 'Safe', color: 'safe' };
    if (percentage <= 80) return { level: 'high', label: 'High', color: 'high' };
    return { level: 'suspicious', label: 'Suspicious', color: 'suspicious' };
  };

  const status = getStatus();
  const StatusIcon = status.level === 'safe'
    ? CheckCircle
    : status.level === 'high'
      ? AlertTriangle
      : XCircle;

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Capacity Used</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              'flex items-center gap-1.5 font-medium',
              status.color === 'safe' && 'text-safe',
              status.color === 'high' && 'text-high',
              status.color === 'suspicious' && 'text-suspicious'
            )}>
              <StatusIcon className="h-4 w-4" />
              {status.label}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-sm">
              {status.level === 'safe' && 'Low payload density. Harder to detect.'}
              {status.level === 'high' && 'High embedding density increases detectability.'}
              {status.level === 'suspicious' && 'Very high density. High embedding density increases detectability.'}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-all duration-300',
            status.color === 'safe' && 'bg-safe',
            status.color === 'high' && 'bg-high',
            status.color === 'suspicious' && 'bg-suspicious'
          )}
          style={{ width: `${percentage}%` }}
        />
        {/* Zone markers */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 border-r border-background/50" />
          <div className="w-[30%] border-r border-background/50" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatSize(used)} / {formatSize(total)}</span>
        <span>{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
}
