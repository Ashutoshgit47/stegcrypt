import { Link } from 'react-router-dom';
import {
  Lock,
  Unlock,
  Shield,
  ArrowRight,
  Image as ImageIcon,
  Zap,
  Code,
  FileLock2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeSelector } from '@/components/home/ModeSelector';
import { PageSEO } from '@/components/PageSEO';
import { useMode } from '@/contexts/ModeContext';
import { ParticleBackground } from '@/components/shared/ParticleBackground';

const features = [
  {
    icon: Lock,
    title: 'AES-256-GCM + PBKDF2',
    description: 'Military-grade encryption with PBKDF2 key derivation (100K–310K iterations)',
    color: 'red'
  },
  {
    icon: Shield,
    title: '100% Local Processing',
    description: 'All data stays on your device — zero uploads, zero telemetry',
    color: 'blue'
  },
  {
    icon: ImageIcon,
    title: 'Multi-Format Support',
    description: 'PNG, BMP, WebP (lossless), TIFF images, and WAV audio carriers',
    color: 'yellow'
  },
  {
    icon: FileLock2,
    title: 'Dual Cryptography Modes',
    description: 'Steganography mode hides data in files; cryptography mode encrypts directly',
    color: 'red'
  },
  {
    icon: Zap,
    title: 'Password Generator',
    description: 'Built-in cryptographically secure password generator with entropy meter',
    color: 'blue'
  },
  {
    icon: Code,
    title: 'Binary-Safe Processing',
    description: 'Pure JS codecs and a /tools page with hash, Base64, and hex utilities',
    color: 'yellow'
  },
];

export default function Index() {
  const { mode } = useMode();

  return (
    <div className="animate-fade-in">
      <PageSEO
        title="StegCrypt - Hide Secrets in Plain Sight"
        description="Browser-based steganography with military-grade encryption. Hide encrypted data in images and audio files. 100% local processing - your data never leaves your device."
        path="/"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          'name': 'StegCrypt',
          'url': 'https://stegcrypt.app',
          'applicationCategory': 'SecurityApplication',
          'operatingSystem': 'All modern browsers (Chrome, Firefox, Safari, Edge)',
          'browserRequirements': 'Requires JavaScript. Requires Web Crypto API and HTML5 Canvas.',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD'
          },
          'description': 'Browser-based steganography with military-grade AES-256-GCM encryption. Hide encrypted text, credentials, and files in PNG, BMP, WebP, TIFF, and WAV carriers 100% locally.',
          'featureList': [
            'AES-256-GCM encryption with PBKDF2 key derivation',
            'LSB steganography for PNG, BMP, WebP, TIFF, and WAV audio',
            '100% client-side zero-knowledge offline processing',
            'Built-in cryptographically secure password generator',
            'Integrated cryptographic tools: SHA-256, Base64, Hex conversion'
          ]
        }}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b-[3px] border-[#121212] dark:border-white">

        {/* ── Dynamic Bauhaus Particles (Dust/Sand Effect) ───────── */}
        <ParticleBackground />
        {/* ─────────────────────────────────────────────────────── */}
        {/* ─────────────────────────────────────────────────────── */}

        <div className="container relative py-12 md:py-16 lg:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">

            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 border-[3px] border-[#121212] dark:border-white bg-[#1040C0] text-white text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white]">
              <Shield className="h-4 w-4 stroke-[3px]" />
              Browser-Based Steganography
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.15]">
              Hide Secrets in<br className="hidden sm:inline" />{' '}
              <span className="inline-block bg-[#D02020] text-white px-3 py-0.5 mx-1 shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white]">
                Plain
              </span>
              <span className="inline-block bg-[#F0C020] text-[#121212] px-3 py-0.5 mx-1 shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white]">
                Sight
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl font-bold opacity-80 max-w-2xl mx-auto leading-relaxed">
              Encrypt and embed confidential data within ordinary images and audio files.
              All processing happens locally — your secrets never leave your device.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/encode"
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 border-[3px] border-[#121212] dark:border-white bg-[#D02020] text-white shadow-[5px_5px_0px_0px_#121212] dark:shadow-[5px_5px_0px_0px_white] font-black uppercase tracking-widest text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:translate-x-[4px] active:translate-y-[4px]"
              >
                <Lock className="h-4 w-4 stroke-[3px]" />
                Encode
              </Link>
              <Link
                to="/decode"
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 border-[3px] border-[#121212] dark:border-white bg-[#1040C0] text-white shadow-[5px_5px_0px_0px_#121212] dark:shadow-[5px_5px_0px_0px_white] font-black uppercase tracking-widest text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:translate-x-[4px] active:translate-y-[4px]"
              >
                <Unlock className="h-4 w-4 stroke-[3px]" />
                Decode
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mode Selection */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Choose Your Mode</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select the mode that matches your needs. Quick Mode is recommended for most users.
            </p>
          </div>

          <ModeSelector />

          <div className="text-center mt-8">
            <Button asChild variant="default" size="lg" className="gap-2 border-[3px] border-[#121212] dark:border-white shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_white] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-black uppercase tracking-widest bg-[#1040C0] text-white">
              <Link to="/encode">
                Continue to Encode
                <ArrowRight className="h-5 w-5 stroke-[3px]" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-20 border-y-[3px] border-[#121212] dark:border-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide mb-3">
              <span className="bg-[#F0C020] text-[#121212] px-2">Security</span> First
            </h2>
            <p className="font-bold opacity-70 max-w-xl mx-auto">
              Built with the highest security standards. No compromises.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              const shadowColor =
                feature.color === 'red' ? '#D02020' :
                feature.color === 'blue' ? '#1040C0' : '#F0C020';

              const iconBg =
                feature.color === 'red' ? 'bg-[#D02020] text-white' :
                feature.color === 'blue' ? 'bg-[#1040C0] text-white' : 'bg-[#F0C020] text-[#121212]';

              return (
                <div
                  key={feature.title}
                  className="p-8 border-[3px] border-[#121212] dark:border-white bg-card relative group hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300"
                  style={{
                    boxShadow: `6px 6px 0px 0px ${shadowColor}`,
                  }}
                >
                  <div className={`h-12 w-12 flex items-center justify-center mb-6 border-[3px] border-[#121212] dark:border-white group-hover:-rotate-6 transition-transform ${iconBg} shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white]`}>
                    <Icon className="h-6 w-6 stroke-[3px]" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-wider mb-3 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm font-bold opacity-70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide mb-3">
              How It <span className="bg-[#1040C0] text-white px-2">Works</span>
            </h2>
            <p className="font-bold opacity-70 max-w-xl mx-auto">
              Three simple steps to hide your secrets
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: 1, title: 'Select Carrier', desc: 'Choose a PNG, BMP or WAV file to hide your data in', bg: 'bg-[#D02020]', text: 'text-white', shadow: 'shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white]' },
              { step: 2, title: 'Add Payload', desc: 'Enter your secret message or select a file to hide', bg: 'bg-[#F0C020]', text: 'text-[#121212]', shadow: 'shadow-[4px_4px_0px_0px_#D02020]' },
              { step: 3, title: 'Download', desc: 'Get your file with the hidden encrypted data', bg: 'bg-[#1040C0]', text: 'text-white', shadow: 'shadow-[4px_4px_0px_0px_#F0C020]' },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className={`h-16 w-16 border-[3px] border-[#121212] dark:border-white ${item.shadow} ${item.bg} ${item.text} flex items-center justify-center text-2xl font-black mx-auto mb-6 group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:shadow-none transition-all`}>
                  {item.step}
                </div>
                <h3 className="font-black uppercase tracking-wider mb-2">{item.title}</h3>
                <p className="text-sm opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
