import { Shield, Lock, Server, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { PageSEO } from '@/components/PageSEO';

const guarantees = [
  {
    icon: Server,
    title: 'No Backend',
    description: 'StegCrypt has no server. There are no uploads, no API calls, no analytics tracking your data.',
    status: 'guaranteed',
  },
  {
    icon: Lock,
    title: 'Local Processing Only',
    description: 'All encryption, decryption, and steganography operations happen entirely in your browser using Web Crypto API.',
    status: 'guaranteed',
  },
  {
    icon: Eye,
    title: 'No Data Transmission',
    description: 'Your files, passwords, and decrypted content never leave your device. Check your network tab to verify.',
    status: 'guaranteed',
  },
];

const limitations = [
  {
    title: 'Steganalysis Detection',
    description: 'Advanced steganalysis tools can potentially detect that data has been hidden in an image, especially with high LSB depths or near-capacity payloads.',
    severity: 'warning',
  },
  {
    title: 'Compromised Devices',
    description: 'If your device is compromised with malware or keyloggers, the encryption cannot protect you. The security of StegCrypt depends on the security of your device.',
    severity: 'critical',
  },
  {
    title: 'Weak Passwords',
    description: 'AES-256 is only as strong as your password. Short or common passwords can be brute-forced. Use at least 12 characters with mixed case, numbers, and symbols.',
    severity: 'warning',
  },
  {
    title: 'Social Media Recompression',
    description: 'Platforms like Twitter, Facebook, and Instagram recompress images, destroying hidden data. Share files directly or via encrypted channels.',
    severity: 'critical',
  },
  {
    title: 'Format Conversion',
    description: 'Converting to lossy formats (JPEG, WebP) or resizing images will destroy the hidden data. Always use the original PNG file.',
    severity: 'warning',
  },
];

const cryptoDetails = [
  { label: 'Symmetric Cipher', value: 'AES-256-GCM (AEAD)' },
  { label: 'Key Derivation', value: 'PBKDF2-SHA256 (100K or 310K iterations)' },
  { label: 'Authentication', value: 'GCM 128-bit auth tag' },
  { label: 'Random Generation', value: 'Web Crypto getRandomValues()' },
  { label: 'Salt Size', value: '128 bits (16 bytes, strict)' },
  { label: 'IV/Nonce Size', value: '96 bits (12 bytes)' },
  { label: 'Timing Protection', value: 'Uniform error responses' },
];

export default function Security() {
  return (
    <div className="container py-8 md:py-12 animate-fade-in">
      <PageSEO
        title="Cryptography & Security"
        description="Understand StegCrypt's cryptography and security features. AES-256-GCM encryption, PBKDF2 key derivation, local-only processing, and complete transparency about protections."
        path="/security"
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Cryptography & Security</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how StegCrypt uses cryptography to protect your data — and understand its limitations.
          </p>
        </div>

        {/* Security Guarantees */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Security Guarantees
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {guarantees.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="cyber-card">
                  <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Cryptographic Details */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Cryptographic Specifications
          </h2>
          <div className="cyber-card">
            <div className="grid sm:grid-cols-2 gap-4">
              {cryptoDetails.map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-mono font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Limitations */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Known Limitations
          </h2>
          <div className="space-y-4">
            {limitations.map((item) => (
              <div
                key={item.title}
                className={`cyber-card flex gap-4 ${item.severity === 'critical' ? 'border-destructive/30 bg-destructive/5' : 'border-warning/30 bg-warning/5'
                  }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {item.severity === 'critical' ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Open Source Notice */}
        <section>
          <div className="cyber-card bg-primary/5 border-primary/20 text-center">
            <h3 className="font-semibold mb-2">Open & Auditable</h3>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              StegCrypt's code is open source. You can inspect every line to verify these security claims.
              Don't trust — verify.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
