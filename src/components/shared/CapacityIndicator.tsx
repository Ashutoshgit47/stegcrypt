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
    if (percentage <= 50) return { level: 'safe',       label: 'Safe',       iconColor: '#1040C0', barColor: 'bg-[#1040C0]', textColor: 'text-[#1040C0] dark:text-[#6080F0]' };
    if (percentage <= 80) return { level: 'high',       label: 'High',       iconColor: '#F0C020', barColor: 'bg-[#F0C020]', textColor: 'text-[#A07000] dark:text-[#F0C020]' };
    return               { level: 'suspicious', label: 'Suspicious', iconColor: '#D02020', barColor: 'bg-[#D02020]', textColor: 'text-[#D02020]' };
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
    <div className={cn('space-y-3', className)}>
      {/* Label row */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-xs font-black uppercase tracking-wide opacity-70">Capacity Used</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center gap-1.5 font-black text-xs uppercase tracking-wide cursor-help', status.textColor)}>
              <StatusIcon className="h-4 w-4 stroke-[3px]" />
              {status.label}
            </div>
          </TooltipTrigger>
          <TooltipContent className="border-[2px] border-[#121212] dark:border-white rounded-none shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white]">
            <p className="max-w-xs text-sm font-bold">
              {status.level === 'safe'       && 'Low payload density. Harder to detect.'}
              {status.level === 'high'       && 'High embedding density increases detectability.'}
              {status.level === 'suspicious' && 'Very high density. Easy to detect via steganalysis.'}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Square progress bar (Bauhaus — no rounding) */}
      <div className="relative h-4 bg-[#E0E0E0] dark:bg-[#2A2A2A] border-[2px] border-[#121212] dark:border-white overflow-hidden">
        <div
          className={cn('absolute inset-y-0 left-0 transition-all duration-500', status.barColor)}
          style={{ width: `${percentage}%` }}
        />
        {/* Zone markers at 50% and 80% */}
        <div className="absolute inset-0 flex pointer-events-none">
          <div className="w-1/2 border-r-[2px] border-[#121212]/30 dark:border-white/30" />
          <div className="w-[30%] border-r-[2px] border-[#121212]/30 dark:border-white/30" />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide opacity-70">
        <span>{formatSize(used)} / {formatSize(total)}</span>
        <span>{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
}
