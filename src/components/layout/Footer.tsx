import { Shield, Github, Lock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>StegCrypt — 100% Local Processing</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Lock className="h-3.5 w-3.5" />
              <span>No data leaves your device</span>
            </div>
            <a
              href="https://github.com/Ashutoshgit47/stegcrypt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
            >
              <Github className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
              <span>Open Source</span>
            </a>
            <Link
              to="/about"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <span>Made with</span>
              <Heart className="h-3.5 w-3.5 text-destructive" />
              <span>by Ashutosh Gautam</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
