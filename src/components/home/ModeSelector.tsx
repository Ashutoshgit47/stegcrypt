import { Zap, Settings2, Check, AlertTriangle } from 'lucide-react';
import { useMode, AppMode } from '@/contexts/ModeContext';
import { cn } from '@/lib/utils';

const modes: {
  id: AppMode;
  title: string;
  description: string;
  icon: typeof Zap;
  features: string[];
  color: 'success' | 'warning';
}[] = [
    {
      id: 'quick',
      title: 'Quick Mode',
      description: 'Safe, simple, and hard to misuse. Perfect for most users.',
      icon: Zap,
      features: [
        'Text payload only',
        'PNG, BMP or WAV carriers',
        'AES-GCM + PBKDF2 encryption',
        'Fixed LSB depth (1)',
      ],
      color: 'success',
    },
    {
      id: 'expert',
      title: 'Expert Mode',
      description: 'Full control with explicit responsibility. For advanced users.',
      icon: Settings2,
      features: [
        'Any file type as payload',
        'Adjustable LSB depth (1-4)',
        'High Security mode (310K iterations)',
        'Advanced format options',
      ],
      color: 'warning',
    },
  ];

export function ModeSelector() {
  const { mode, setMode } = useMode();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
      {modes.map((m) => {
        const Icon = m.icon;
        const isSelected = mode === m.id;
        const colorClasses = m.color === 'success'
          ? 'border-success/50 bg-success/5'
          : 'border-warning/50 bg-warning/5';
        const selectedClasses = isSelected
          ? m.color === 'success'
            ? 'border-success ring-2 ring-success/20'
            : 'border-warning ring-2 ring-warning/20'
          : '';

        return (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              'relative text-left p-4 md:p-6 rounded-xl border-2 transition-all duration-200 h-full flex flex-col',
              'hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20',
              isSelected ? selectedClasses : 'border-border hover:border-muted-foreground/30',
              isSelected && colorClasses
            )}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div className={cn(
                'absolute top-4 right-4 h-6 w-6 rounded-full flex items-center justify-center',
                m.color === 'success' ? 'bg-success' : 'bg-warning'
              )}>
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className={cn(
                'h-12 w-12 rounded-lg flex items-center justify-center',
                m.color === 'success' ? 'bg-success/10' : 'bg-warning/10'
              )}>
                <Icon className={cn(
                  'h-6 w-6',
                  m.color === 'success' ? 'text-success' : 'text-warning'
                )} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{m.title}</h3>
                <p className="text-sm text-muted-foreground">{m.description}</p>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-2 flex-grow">
              {m.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className={cn(
                    'h-1.5 w-1.5 rounded-full flex-shrink-0',
                    m.color === 'success' ? 'bg-success' : 'bg-warning'
                  )} />
                  {feature}
                </li>
              ))}
            </ul>

            {/* Expert warning */}
            {m.id === 'expert' && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-warning/10 text-warning text-xs">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Expert mode requires understanding of steganography concepts and security implications.</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
