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
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
      state === 'loading' && 'bg-primary/10 text-primary',
      state === 'ready' && 'bg-success/10 text-success',
      state === 'error' && 'bg-destructive/10 text-destructive',
      className
    )}>
      {state === 'loading' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Initializing secure engine…
        </>
      )}
      {state === 'ready' && (
        <>
          <CheckCircle className="h-3 w-3" />
          Engine ready
        </>
      )}
      {state === 'error' && (
        <>
          <AlertCircle className="h-3 w-3" />
          Engine error
        </>
      )}
    </div>
  );
}
