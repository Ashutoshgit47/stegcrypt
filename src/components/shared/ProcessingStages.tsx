import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';

export type ProcessingStage = 'load' | 'analyze' | 'encrypt' | 'decrypt' | 'embed' | 'extract' | 'save';

interface ProcessingStagesProps {
  currentStage: ProcessingStage | null;
  completedStages: ProcessingStage[];
  mode: 'encode' | 'decode';
}

const encodeStages: { id: ProcessingStage; label: string }[] = [
  { id: 'load',    label: 'Load Files' },
  { id: 'analyze', label: 'Analyze Capacity' },
  { id: 'encrypt', label: 'Encrypt Payload' },
  { id: 'embed',   label: 'Embed Data' },
  { id: 'save',    label: 'Save Output' },
];

const decodeStages: { id: ProcessingStage; label: string }[] = [
  { id: 'load',    label: 'Load File' },
  { id: 'analyze', label: 'Detect Data' },
  { id: 'extract', label: 'Extract Data' },
  { id: 'decrypt', label: 'Decrypt Payload' },
  { id: 'save',    label: 'Save Output' },
];

export function ProcessingStages({ currentStage, completedStages, mode }: ProcessingStagesProps) {
  const stages = mode === 'encode' ? encodeStages : decodeStages;
  const activeStageObj = stages.find(s => s.id === currentStage);

  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <span className="sr-only">
        {activeStageObj ? `Current processing step: ${activeStageObj.label}` : 'Processing idle'}
      </span>
      {stages.map((stage, index) => {
        const isCompleted = completedStages.includes(stage.id);
        const isCurrent   = currentStage === stage.id;
        const isPending   = !isCompleted && !isCurrent;

        return (
          <div key={stage.id} className="flex items-center gap-3">
            {/* Square Bauhaus stage indicator */}
            <div className={cn(
              'h-8 w-8 flex-shrink-0 border-[2px] flex items-center justify-center text-xs font-black transition-all',
              isCompleted && 'bg-[#1040C0] border-[#121212] dark:border-white text-white shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white]',
              isCurrent   && 'bg-[#D02020] border-[#121212] dark:border-white text-white shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white]',
              isPending   && 'bg-transparent border-[#121212]/40 dark:border-white/30 text-[#121212]/40 dark:text-white/30'
            )}>
              {isCompleted ? (
                <Check className="h-4 w-4 stroke-[3px]" />
              ) : isCurrent ? (
                <Loader2 className="h-4 w-4 stroke-[2.5px] animate-spin" />
              ) : (
                index + 1
              )}
            </div>

            {/* Label */}
            <span className={cn(
              'text-sm font-bold uppercase tracking-wide',
              isCompleted && 'text-[#1040C0] dark:text-[#6080F0]',
              isCurrent   && 'text-[#D02020] font-black',
              isPending   && 'text-[#121212]/40 dark:text-white/30'
            )}>
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
