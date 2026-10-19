import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type EngineState = 'loading' | 'ready' | 'error';

interface EngineStatusProps {
  state: EngineState;
  className?: string;
}

export function EngineStatus({ state, className }: EngineStatusProps) {
  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5',
      'border-[2px] text-xs font-black uppercase tracking-widest transition-all',
      state === 'loading' && 'border-[#121212] dark:border-white bg-[#F0C020] text-[#121212] shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white]',
      state === 'ready'   && 'border-[#121212] dark:border-white bg-[#1040C0] text-white shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white]',
      state === 'error'   && 'border-[#121212] dark:border-white bg-[#D02020] text-white shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white]',
      className
    )}>
      {state === 'loading' && (
        <>
          <Loader2 className="h-3 w-3 stroke-[3px] animate-spin" />
          Initializing…
        </>
      )}
      {state === 'ready' && (
        <>
          <CheckCircle className="h-3 w-3 stroke-[3px]" />
          Engine Ready
        </>
      )}
      {state === 'error' && (
        <>
          <AlertCircle className="h-3 w-3 stroke-[3px]" />
          Engine Error
        </>
      )}
    </div>
  );
}
