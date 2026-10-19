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
        
        // Strict Bauhaus Styling Overrides
        const colorMain = m.color === 'success' ? '#1040C0' : '#F0C020';
        const activeBorderClass = m.color === 'success' 
          ? 'border-[#1040C0] shadow-[6px_6px_0px_0px_#1040C0] dark:shadow-[6px_6px_0px_0px_#1040C0]'
          : 'border-[#F0C020] shadow-[6px_6px_0px_0px_#F0C020] dark:shadow-[6px_6px_0px_0px_#F0C020]';
          
        return (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              'relative text-left p-6 border-[3px] transition-all duration-150 flex flex-col items-start bg-[#F0F0F0] dark:bg-[#121212] group',
              isSelected ? activeBorderClass : 'border-[#121212] dark:border-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#121212] dark:hover:shadow-[4px_4px_0px_0px_white]'
            )}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div 
                className="absolute top-4 right-4 h-6 w-6 flex items-center justify-center border-2 border-[#121212] dark:border-[#121212]"
                style={{ backgroundColor: colorMain }}
              >
                <Check className={cn("h-4 w-4", m.color === 'success' ? 'text-white' : 'text-[#121212]')} />
              </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div 
                className="h-12 w-12 flex flex-shrink-0 items-center justify-center border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] dark:border-white dark:shadow-[2px_2px_0px_0px_white]"
                style={{ backgroundColor: isSelected ? colorMain : 'transparent' }}
              >
                <Icon className={cn(
                  'h-6 w-6',
                  isSelected ? (m.color === 'success' ? 'text-white' : 'text-[#121212]') : 'text-[#121212] dark:text-white'
                )} />
              </div>
              <div className="flex-1 pt-1 text-[#121212] dark:text-white">
                <h3 className="text-xl font-black uppercase tracking-wide leading-tight mb-1">{m.title}</h3>
                <p className="text-sm font-medium opacity-80">{m.description}</p>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 flex-grow text-[#121212] dark:text-white mb-4">
              {m.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-semibold">
                  <div 
                    className="h-3 w-3 flex-shrink-0 border-2 border-[#121212] dark:border-white"
                    style={{ backgroundColor: colorMain }}
                  />
                  {feature}
                </li>
              ))}
            </ul>

            {/* Expert warning */}
            {m.id === 'expert' && (
              <div className="mt-2 w-full flex items-start gap-3 p-3 border-2 border-[#121212] bg-[#F0C020] text-[#121212]">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wide">Expert mode requires understanding of steganography concepts and security implications.</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
