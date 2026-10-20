import { Shield, Coffee, Heart } from 'lucide-react';
import { GithubIcon as Github } from '@/components/shared/GithubIcon';
import { Link } from 'react-router-dom';

const BADGE = 'flex items-center gap-2 px-4 py-2.5 border-[3px] border-[#121212] dark:border-white shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] hover:-translate-y-1 hover:shadow-none transition-all text-[11px] font-black uppercase tracking-widest whitespace-nowrap';

export function Footer() {
  return (
    <footer className="border-t-[4px] border-[#121212] dark:border-white bg-[#F0F0F0] dark:bg-[#121212]">
      <div className="container py-5">

        {/* 3-col grid — left / center / right */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">

          {/* Left — Brand (left-aligned on md+) */}
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <Shield className="h-6 w-6 text-[#1040C0] dark:text-white stroke-[3px] shrink-0" />
            <div className="leading-tight">
              <p className="text-sm font-black uppercase tracking-widest text-[#121212] dark:text-white leading-none">StegCrypt</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#1040C0] dark:text-[#F0C020] mt-1">100% Local Processing</p>
            </div>
          </div>

          {/* Center — Badges (always centred) */}
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://ko-fi.com/Y8Y11V9RQ2"
              target="_blank"
              rel="noopener noreferrer"
              className={`${BADGE} bg-[#72a4f2] text-[#121212] group`}
              title="Support me on Ko-fi"
            >
              <Coffee className="h-3.5 w-3.5 stroke-[3px] shrink-0 group-hover:-rotate-12 transition-transform" />
              <span>Ko-fi</span>
            </a>

            <a
              href="https://github.com/Ashutoshgit47/stegcrypt"
              target="_blank"
              rel="noopener noreferrer"
              className={`${BADGE} bg-[#F0C020] text-[#121212] group`}
            >
              <Github className="h-3.5 w-3.5 stroke-[3px] shrink-0 group-hover:-rotate-12 transition-transform" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Right — Credit (right-aligned on md+) */}
          <div className="flex justify-center md:justify-end">
            <Link
              to="/about"
              className={`${BADGE} bg-[#D02020] text-white group`}
            >
              <span>Made with</span>
              <Heart className="h-3.5 w-3.5 fill-transparent stroke-white group-hover:fill-white transition-colors stroke-[3px] shrink-0" />
              <span>Ashutosh Gautam</span>
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
