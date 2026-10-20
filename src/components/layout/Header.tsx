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
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-1.5 px-2 xl:px-2.5 py-1.5 rounded-none text-xs font-black uppercase tracking-wider border-2 border-transparent transition-all active:translate-y-[1px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1040C0]',
                  isActive
                    ? 'bauhaus-bg-red border-[#121212] dark:border-white shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-[#121212] dark:hover:border-white'
                )}
              >
                <Icon className="h-3.5 w-3.5 stroke-[2.5px]" />
                {item.label}
              </Link>
            );
          })}
          {/* Report Issue - External Link */}
          <a
            href="https://github.com/Ashutoshgit47/stegcrypt/issues"
            target="_blank"
            rel="noopener noreferrer"
            title="Report Issue on GitHub"
            className="flex items-center gap-1.5 px-2 xl:px-2.5 py-1.5 rounded-none text-xs font-black uppercase tracking-wider border-2 border-[#121212] dark:border-white bg-[#F0C020] text-[#121212] transition-all hover:translate-x-[1px] hover:translate-y-[1px] shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white] whitespace-nowrap shrink-0"
          >
            <Bug className="h-3.5 w-3.5 stroke-[3px]" />
            <span className="hidden xl:inline">Report</span>
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mode Badge - Click to toggle */}
          <button
            onClick={() => setMode(mode === 'expert' ? 'quick' : 'expert')}
            className={cn(
              'hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-none text-[10px] font-black uppercase tracking-[0.15em] border-[2px] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none focus:outline-none shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white]',
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
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none border-2 border-transparent hover:border-[#121212] dark:hover:border-white">
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
            className="lg:hidden h-9 w-9 rounded-none border-2 border-[#121212] dark:border-white shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            {/* Mobile Mode Toggle (Bug #1 Fix) */}
            <div className="flex items-center justify-between px-4 py-3 mb-1 border-2 border-[#121212] dark:border-white bg-secondary/30">
              <span className="text-xs font-black uppercase tracking-widest">Active Mode</span>
              <button
                type="button"
                onClick={() => setMode(mode === 'expert' ? 'quick' : 'expert')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-none text-xs font-black uppercase tracking-widest border-2 transition-all shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white] active:translate-x-0.5 active:translate-y-0.5',
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
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-5 py-3.5 rounded-none text-sm font-black uppercase tracking-widest border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D02020]',
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
              className="flex items-center gap-3 px-5 py-3.5 rounded-none text-sm font-black uppercase tracking-widest border-[3px] border-[#121212] dark:border-white bg-[#F0C020] text-[#121212] transition-all shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D02020]"
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
