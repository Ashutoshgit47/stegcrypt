import { Link } from 'react-router-dom';
import { Lock, Unlock, Shield, ArrowRight, Fingerprint, Cpu, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeSelector } from '@/components/home/ModeSelector';
import { PageSEO } from '@/components/PageSEO';
import { useMode } from '@/contexts/ModeContext';

const features = [
  {
    icon: Shield,
    title: '100% Local Processing',
    description: 'All encryption and embedding happens in your browser. No data ever leaves your device.',
  },
  {
    icon: Fingerprint,
    title: 'Military-Grade Encryption',
    description: 'AES-256-GCM encryption with PBKDF2 key derivation protects your hidden messages.',
  },
  {
    icon: Cpu,
    title: 'WebAssembly Ready',
    description: 'Architecture prepared for high-performance WASM modules when you need them.',
  },
  {
    icon: Eye,
    title: 'Undetectable Embedding',
    description: 'LSB steganography hides data in image pixels without visible changes.',
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
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Shield className="h-4 w-4" />
              Browser-Based Steganography
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Hide Secrets in
              <span className="text-primary"> Plain Sight</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Encrypt and embed confidential data within ordinary images.
              All processing happens locally — your secrets never leave your device.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="gap-2 min-w-[160px]">
                <Link to="/encode">
                  <Lock className="h-4 w-4" />
                  Encode
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 min-w-[160px]">
                <Link to="/decode">
                  <Unlock className="h-4 w-4" />
                  Decode
                </Link>
              </Button>
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
            <Button asChild variant="default" size="lg" className="gap-2">
              <Link to="/encode">
                Continue to Encode
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-20 bg-muted/30 border-y border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Security First</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built with the highest security standards. No compromises.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="cyber-card group hover:border-primary/30"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
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
            <h2 className="text-2xl md:text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three simple steps to hide your secrets
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: 1, title: 'Select Carrier', desc: 'Choose a PNG, BMP or WAV file to hide your data in' },
              { step: 2, title: 'Add Payload', desc: 'Enter your secret message or select a file to hide' },
              { step: 3, title: 'Download', desc: 'Get your file with the hidden encrypted data' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
