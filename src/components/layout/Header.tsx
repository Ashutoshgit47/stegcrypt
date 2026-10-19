import { Link, useLocation } from 'react-router-dom';
import { Shield, Lock, Unlock, HelpCircle, Moon, Sun, Monitor, Menu, X, User, Bug, Wrench } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useMode } from '@/contexts/ModeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Home', icon: Shield },
  { path: '/encode', label: 'Encode', icon: Lock },
  { path: '/decode', label: 'Decode', icon: Unlock },
  { path: '/tools', label: 'Tools', icon: Wrench },
  { path: '/security', label: 'Security', icon: Shield },
  { path: '/help', label: 'Help', icon: HelpCircle },
  { path: '/about', label: 'About', icon: User },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const { mode, setMode } = useMode();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto px-4 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 transition-opacity hover:opacity-80">
          <img src="/favicon.svg" alt="StegCrypt Logo" className="h-9 w-9" />
          <span className="text-xl font-bold tracking-tight">StegCrypt</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3 ml-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-none text-sm font-black uppercase tracking-widest border-2 border-transparent transition-all active:translate-y-[2px] whitespace-nowrap',
                  isActive
                    ? 'bauhaus-bg-red border-[#121212] dark:border-white shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-[#121212] dark:hover:border-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {/* Report Issue - External Link */}
          <a
            href="https://github.com/Ashutoshgit47/stegcrypt/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-none text-sm font-black uppercase tracking-widest border-2 border-[#121212] dark:border-white bg-[#F0C020] text-[#121212] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white] whitespace-nowrap"
          >
            <Bug className="h-4 w-4 stroke-[3px]" />
            REPORT
          </a>
        </nav>

        <div className="flex items-center gap-6">
          {/* Mode Badge */}
          {/* Mode Badge - Click to toggle */}
          <button
            onClick={() => setMode(mode === 'expert' ? 'quick' : 'expert')}
            className={cn(
              'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-[0.15em] border-[3px] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none focus:outline-none shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white]',
              mode === 'expert'
                ? 'bg-[#F0C020] text-[#121212] border-[#121212] dark:border-white'
                : 'bg-[#1040C0] text-white border-[#121212] dark:border-white'
            )}
          >
            <div className={cn(
              'h-2 w-2 border-2 border-current',
              mode === 'expert' ? 'bg-[#121212]' : 'bg-white'
            )} />
            {mode === 'expert' ? 'Expert' : 'Quick'}
          </button>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-6 py-4 rounded-none text-sm font-black uppercase tracking-widest border-2 transition-all',
                    isActive
                      ? 'bauhaus-bg-red border-[#121212] dark:border-white shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white]'
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary hover:border-[#121212] dark:hover:border-white'
                  )}
                >
                  <Icon className="h-5 w-5 stroke-[2.5px]" />
                  {item.label}
                </Link>
              );
            })}
            {/* Report Issue - External Link (Mobile) */}
            <a
              href="https://github.com/Ashutoshgit47/stegcrypt/issues"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-6 py-4 rounded-none text-sm font-black uppercase tracking-widest border-[3px] border-[#121212] dark:border-white bg-[#F0C020] text-[#121212] transition-all shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white]"
            >
              <Bug className="h-5 w-5 stroke-[2.5px]" />
              REPORT
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
