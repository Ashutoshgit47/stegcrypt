import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';

export type ProcessingStage = 'load' | 'analyze' | 'encrypt' | 'decrypt' | 'embed' | 'extract' | 'save';

interface ProcessingStagesProps {
  currentStage: ProcessingStage | null;
  completedStages: ProcessingStage[];
  mode: 'encode' | 'decode';
}

const encodeStages: { id: ProcessingStage; label: string }[] = [
  { id: 'load', label: 'Load Files' },
  { id: 'analyze', label: 'Analyze Capacity' },
  { id: 'encrypt', label: 'Encrypt Payload' },
  { id: 'embed', label: 'Embed Data' },
  { id: 'save', label: 'Save Output' },
];

const decodeStages: { id: ProcessingStage; label: string }[] = [
  { id: 'load', label: 'Load File' },
  { id: 'analyze', label: 'Detect Data' },
  { id: 'extract', label: 'Extract Data' },
  { id: 'decrypt', label: 'Decrypt Payload' },
  { id: 'save', label: 'Save Output' },
];

export function ProcessingStages({ currentStage, completedStages, mode }: ProcessingStagesProps) {
  const stages = mode === 'encode' ? encodeStages : decodeStages;

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const isCompleted = completedStages.includes(stage.id);
        const isCurrent = currentStage === stage.id;
        const isPending = !isCompleted && !isCurrent;

        return (
          <div key={stage.id} className="flex items-center gap-3">
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
              isCompleted && 'bg-success text-success-foreground',
              isCurrent && 'bg-primary text-primary-foreground',
              isPending && 'bg-muted text-muted-foreground'
            )}>
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : isCurrent ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                index + 1
              )}
            </div>
            <span className={cn(
              'text-sm font-medium',
              isCompleted && 'text-success',
              isCurrent && 'text-foreground',
              isPending && 'text-muted-foreground'
            )}>
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
