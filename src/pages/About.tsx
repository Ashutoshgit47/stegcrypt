import { Github, Shield, Code, Lock, Zap, Heart, ExternalLink, Image, Music, FileKey } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageSEO } from '@/components/PageSEO';

const features = [
  {
    icon: Lock,
    title: 'AES-256-GCM + PBKDF2',
    description: 'Military-grade encryption with 100K-310K iterations',
  },
  {
    icon: Shield,
    title: '100% Local Processing',
    description: 'All data stays on your device, zero uploads',
  },
  {
    icon: Image,
    title: 'Multi-Format Support',
    description: 'PNG, BMP images and WAV audio carriers',
  },
  {
    icon: FileKey,
    title: 'File Metadata Preservation',
    description: 'Original filenames and types are restored',
  },
  {
    icon: Zap,
    title: 'Large File Support',
    description: 'Up to 100MB images, 200MB audio carriers',
  },
  {
    icon: Code,
    title: 'Binary-Safe Processing',
    description: 'Pure JS codecs bypass browser interference',
  },
];

const techStack = [
  'React', 'TypeScript', 'Tailwind CSS', 'Web Crypto API', 'Web Workers', 'Vite'
];

export default function About() {
  return (
    <div className="container py-8 md:py-12 space-y-12 animate-fade-in">
      <PageSEO
        title="About StegCrypt"
        description="Learn about StegCrypt - a privacy-first steganography and cryptography tool for hiding encrypted messages in images and audio. Built by Ashutosh Gautam with security and transparency in mind."
        path="/about"
      />
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 animate-scale-in">
          <Shield className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          About <span className="text-primary">StegCrypt</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A powerful, privacy-first <strong>steganography and cryptography</strong> tool.
          Encrypt your data with AES-256-GCM, then hide it within images and audio files.
          Built with security and simplicity in mind.
        </p>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className="group hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-2">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Developer Section */}
      <section className="max-w-2xl mx-auto">
        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-accent" />
          <CardHeader className="text-center pt-8">
            <div className="mx-auto mb-4 relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent p-1">
                <div className="h-full w-full rounded-full bg-card flex items-center justify-center">
                  <Code className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-success flex items-center justify-center border-4 border-card">
                <Shield className="h-4 w-4 text-success-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Ashutosh Gautam</CardTitle>
            <p className="text-muted-foreground">Cybersecurity Enthusiast & Developer</p>
          </CardHeader>
          <CardContent className="text-center space-y-6 pb-8">
            <p className="text-muted-foreground max-w-md mx-auto">
              Passionate about building secure, privacy-focused tools that empower users
              to protect their digital communications.
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              {techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="px-3 py-1">
                  {tech}
                </Badge>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button asChild className="gap-2 group">
                <a
                  href="https://github.com/Ashutoshgit47/Ashutoshgit47"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  GitHub Profile
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-2 group">
                <a
                  href="https://github.com/Ashutoshgit47/stegcrypt"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Code className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Project Repository
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer Note */}
      <section className="text-center space-y-4 pb-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <span>Built with</span>
          <Heart className="h-4 w-4 text-destructive animate-pulse" />
          <span>for privacy advocates</span>
        </div>
        <p className="text-sm text-muted-foreground">
          StegCrypt is open source and free to use. Contributions welcome!
        </p>
      </section>
    </div>
  );
}
