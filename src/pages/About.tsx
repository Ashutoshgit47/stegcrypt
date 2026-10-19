import { Shield, Code, Lock, Zap, Heart, ExternalLink, Image, FileKey } from 'lucide-react';
import { GithubIcon as Github } from '@/components/shared/GithubIcon';
import { PageSEO } from '@/components/PageSEO';

// Color cycle: Red → Blue → Yellow → Red ...
const COLORS = [
  { bg: 'bg-[#D02020]', text: 'text-white', border: 'border-[#D02020]', shadow: 'shadow-[4px_4px_0px_0px_#D02020]' },
  { bg: 'bg-[#1040C0]', text: 'text-white', border: 'border-[#1040C0]', shadow: 'shadow-[4px_4px_0px_0px_#1040C0]' },
  { bg: 'bg-[#F0C020]', text: 'text-[#121212]', border: 'border-[#F0C020]', shadow: 'shadow-[4px_4px_0px_0px_#F0C020]' },
];

const features = [
  { icon: Lock,    title: 'AES-256-GCM + PBKDF2',   description: 'Military-grade encryption with PBKDF2 key derivation (100K–310K iterations)' },
  { icon: Shield,  title: '100% Local Processing',   description: 'All data stays on your device — zero uploads, zero telemetry' },
  { icon: Image,   title: 'Multi-Format Support',    description: 'PNG, BMP, WebP (lossless), TIFF images, and WAV audio carriers' },
  { icon: FileKey, title: 'Dual Cryptography Modes', description: 'Steganography mode hides data in files; cryptography mode encrypts directly' },
  { icon: Zap,     title: 'Password Generator',      description: 'Built-in cryptographically secure password generator with entropy meter' },
  { icon: Code,    title: 'Binary-Safe Processing',  description: 'Pure JS codecs and a /tools page with hash, Base64, and hex utilities' },
];

const techStack = [
  { label: 'React',         color: COLORS[0] },
  { label: 'TypeScript',    color: COLORS[1] },
  { label: 'Tailwind CSS',  color: COLORS[2] },
  { label: 'Web Crypto API',color: COLORS[0] },
  { label: 'Web Workers',   color: COLORS[1] },
  { label: 'Vite',          color: COLORS[2] },
];

export default function About() {
  return (
    <div className="container py-8 md:py-12 space-y-12 animate-fade-in">
      <PageSEO
        title="About StegCrypt"
        description="Learn about StegCrypt - a privacy-first steganography and cryptography tool for hiding encrypted messages in images and audio. Built by Ashutosh Gautam with security and transparency in mind."
        path="/about"
      />

      {/* Hero */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        {/* Three overlapping icon blocks */}
        <div className="flex items-center justify-center gap-0 relative h-24">
          <div className="h-16 w-16 flex items-center justify-center bg-[#D02020] border-[3px] border-[#121212] dark:border-white shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] -rotate-6 z-10 relative -mr-4">
            <Lock className="h-8 w-8 text-white stroke-[3px]" />
          </div>
          <div className="h-20 w-20 flex items-center justify-center bg-[#F0C020] border-[3px] border-[#121212] dark:border-white shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] z-20 relative">
            <Shield className="h-10 w-10 text-[#121212] stroke-[3px]" />
          </div>
          <div className="h-16 w-16 flex items-center justify-center bg-[#1040C0] border-[3px] border-[#121212] dark:border-white shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] rotate-6 z-10 relative -ml-4">
            <Code className="h-8 w-8 text-white stroke-[3px]" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
          About{' '}
          <span className="bg-[#D02020] text-white px-2">Steg</span>
          <span className="bg-[#1040C0] text-white px-2">Crypt</span>
        </h1>
        <p className="text-lg font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
          A powerful, privacy-first <strong>steganography and cryptography</strong> tool.
          Encrypt data with AES-256-GCM and hide it within images or audio files — or encrypt directly
          without a carrier using the dedicated Cryptography mode.
        </p>
        {/* Hero mini-stats */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { label: 'AES-256-GCM', bg: 'bg-[#D02020]', text: 'text-white' },
            { label: '100% Local', bg: 'bg-[#1040C0]', text: 'text-white' },
            { label: 'Open Source', bg: 'bg-[#F0C020]', text: 'text-[#121212]' },
          ].map((s) => (
            <span key={s.label} className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest border-[3px] border-[#121212] dark:border-white shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white] ${s.bg} ${s.text}`}>
              {s.label}
            </span>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          const c = COLORS[i % 3];
          return (
            <div
              key={f.title}
              className={`border-[3px] border-[#121212] dark:border-white ${c.shadow} hover:-translate-y-1 hover:shadow-none transition-all p-5 bg-white dark:bg-[#121212]`}
            >
              <div className={`h-11 w-11 flex items-center justify-center border-[3px] border-[#121212] dark:border-white mb-4 ${c.bg} ${c.text}`}>
                <Icon className="h-5 w-5 stroke-[3px]" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wide mb-2">{f.title}</h3>
              <p className="text-sm font-medium opacity-70">{f.description}</p>
            </div>
          );
        })}
      </section>

      {/* Developer Section */}
      <section className="max-w-2xl mx-auto">
        <div className="border-[3px] border-[#121212] dark:border-white shadow-[6px_6px_0px_0px_#121212] dark:shadow-[6px_6px_0px_0px_white] bg-white dark:bg-[#121212]">
          {/* Tri-color top bar */}
          <div className="h-3 flex">
            <div className="flex-1 bg-[#D02020]" />
            <div className="flex-1 bg-[#F0C020]" />
            <div className="flex-1 bg-[#1040C0]" />
          </div>
          <div className="p-8 text-center space-y-6">
            {/* Avatar */}
            <div className="mx-auto h-24 w-24 flex items-center justify-center bg-[#F0C020] border-[3px] border-[#121212] dark:border-white shadow-[4px_4px_0px_0px_#D02020]">
              <Code className="h-12 w-12 text-[#121212] stroke-[3px]" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wide">Ashutosh Gautam</h2>
              <p className="text-sm font-bold uppercase tracking-widest opacity-60 mt-1">Cybersecurity Enthusiast & Developer</p>
            </div>
            <p className="font-medium opacity-80 max-w-md mx-auto">
              Passionate about building secure, privacy-focused tools that empower users
              to protect their digital communications.
            </p>

            {/* Tech Stack — cycling colors */}
            <div className="flex flex-wrap justify-center gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech.label}
                  className={`px-3 py-1 text-xs font-black uppercase tracking-widest border-[2px] border-[#121212] dark:border-white shadow-[2px_2px_0px_0px_#121212] dark:shadow-[2px_2px_0px_0px_white] ${tech.color.bg} ${tech.color.text}`}
                >
                  {tech.label}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a
                href="https://github.com/Ashutoshgit47/Ashutoshgit47"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-2.5 border-[3px] border-[#121212] dark:border-white bg-[#121212] dark:bg-white text-white dark:text-[#121212] shadow-[4px_4px_0px_0px_#D02020] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all font-black uppercase tracking-widest text-xs"
              >
                <Github className="h-4 w-4" />
                GitHub Profile
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
              <a
                href="https://github.com/Ashutoshgit47/stegcrypt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-2.5 border-[3px] border-[#121212] dark:border-white bg-[#1040C0] text-white shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all font-black uppercase tracking-widest text-xs"
              >
                <Code className="h-4 w-4" />
                Project Repo
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="text-center pb-8">
        <div className="inline-flex items-center gap-0 border-[3px] border-[#121212] dark:border-white shadow-[6px_6px_0px_0px_#121212] dark:shadow-[6px_6px_0px_0px_white] font-black uppercase tracking-widest text-sm overflow-hidden animate-bounce-slow">
          <span className="px-4 py-3 bg-[#D02020] text-white">Built with</span>
          <span className="px-3 py-3 bg-[#F0C020] text-[#121212] flex items-center">
            <Heart className="h-4 w-4 fill-[#D02020] stroke-[#D02020] stroke-[3px]" />
          </span>
          <span className="px-4 py-3 bg-[#1040C0] text-white">for privacy advocates</span>
        </div>
        <p className="text-sm font-medium opacity-60 mt-4">
          StegCrypt is open source and free to use. Contributions welcome!
        </p>
      </section>
    </div>
  );
}
