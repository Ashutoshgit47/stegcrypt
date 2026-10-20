import { Shield, Lock, Server, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { PageSEO } from '@/components/PageSEO';

const guarantees = [
  {
    icon: Server,
    title: 'No Backend',
    description: 'StegCrypt operates without a server. There are no uploads, API calls, or analytics tracking your data.',
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
  { label: 'Key Derivation', value: 'PBKDF2-SHA256 (100K-310K)' },
  { label: 'Authentication', value: 'GCM 128-bit auth' },
  { label: 'Random Generation', value: 'getRandomValues()' },
  { label: 'Salt Size', value: '128 bits' },
  { label: 'IV/Nonce Size', value: '96 bits' },
  { label: 'Timing Protection', value: 'Uniform errors' },
];

export default function Security() {
  return (
    <div className="container py-8 md:py-12 animate-fade-in">
      <PageSEO
        title="Cryptography & Security"
        description="Understand StegCrypt's cryptography and security features. AES-256-GCM encryption, PBKDF2 key derivation, local-only processing, and complete transparency about protections."
        path="/security"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          'headline': 'StegCrypt Cryptography & Security Model',
          'description': 'Technical breakdown of StegCrypt cryptographic architecture, including AES-256-GCM encryption, PBKDF2-SHA256 key derivation, LSB steganography, and zero-knowledge local execution.',
          'author': {
            '@type': 'Organization',
            'name': 'StegCrypt'
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'StegCrypt',
            'url': 'https://stegcrypt.app'
          }
        }}
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-[#1040C0] border-[3px] border-[#121212] dark:border-white shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] mb-6 transform -rotate-3 hover:rotate-3 transition-transform">
            <Shield className="h-8 w-8 text-white stroke-[3px]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">Cryptography & Security</h1>
          <p className="text-lg font-bold opacity-80 max-w-2xl mx-auto">
            Learn how StegCrypt uses cryptography to protect your data — and understand its limitations.
          </p>
        </div>

        {/* Security Guarantees */}
        <section className="mb-14">
          <h2 className="text-2xl font-black uppercase tracking-wider mb-8 flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center bg-[#1040C0] border-2 border-[#121212] dark:border-white">
              <CheckCircle className="h-5 w-5 text-white stroke-[3px]" />
            </div>
            Security Guarantees
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {guarantees.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="cyber-card group hover:-translate-y-2 transition-transform duration-300 flex flex-col items-start bg-white dark:bg-[#121212] shadow-[6px_6px_0px_0px_#1040C0]">
                  <div className="h-12 w-12 flex items-center justify-center mb-5 border-[3px] border-[#121212] dark:border-white bg-[#1040C0] shadow-[3px_3px_0px_0px_#121212] dark:shadow-[3px_3px_0px_0px_white] group-hover:-rotate-6 transition-transform">
                    <Icon className="h-6 w-6 text-white stroke-[3px]" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-wide mb-2 leading-tight">{item.title}</h3>
                  <p className="text-sm font-medium opacity-80">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Cryptographic Details */}
        <section className="mb-14">
          <h2 className="text-2xl font-black uppercase tracking-wider mb-8 flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center bg-[#D02020] border-2 border-[#121212] dark:border-white">
              <Lock className="h-5 w-5 text-white stroke-[3px]" />
            </div>
            Cryptographic Specifications
          </h2>
          <div className="cyber-card overflow-hidden bg-[#F0F0F0] dark:bg-[#121212] p-0">
            <div className="divide-y-2 divide-[#121212] dark:divide-white">
              {cryptoDetails.map((item) => (
                <div key={item.label} className="p-4 sm:p-5 hover:bg-[#F0C020] hover:text-[#121212] dark:hover:bg-[#F0C020] dark:hover:text-[#121212] transition-colors group">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
                    <span className="text-sm font-mono font-bold sm:text-right px-3 py-1 bg-[#121212] text-white dark:bg-white dark:text-[#121212] group-hover:bg-[#121212] group-hover:text-white transition-colors">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Limitations */}
        <section className="mb-14">
          <h2 className="text-2xl font-black uppercase tracking-wider mb-8 flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center bg-[#F0C020] border-2 border-[#121212] dark:border-white">
              <AlertTriangle className="h-5 w-5 text-[#121212] stroke-[3px]" />
            </div>
            Known Limitations
          </h2>
          <div className="space-y-6">
            {limitations.map((item) => (
              <div
                key={item.title}
                className={`cyber-card flex flex-col sm:flex-row gap-5 p-6 ${item.severity === 'critical' ? 'bg-[#D02020] text-white border-[#121212] dark:border-white shadow-[6px_6px_0px_0px_#121212] dark:shadow-[6px_6px_0px_0px_white]' : 'bg-[#F0C020] text-[#121212] border-[#121212] dark:border-white shadow-[6px_6px_0px_0px_#121212] dark:shadow-[6px_6px_0px_0px_white]'
                  }`}
              >
                <div className="flex-shrink-0">
                  <div className={`h-14 w-14 flex items-center justify-center border-[3px] border-inherit shadow-[4px_4px_0px_0px_currentColor] bg-transparent`}>
                      {item.severity === 'critical' ? (
                        <XCircle className="h-7 w-7 stroke-[3px]" />
                      ) : (
                        <AlertTriangle className="h-7 w-7 stroke-[3px]" />
                      )}
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-black uppercase tracking-wide mb-2 leading-tight">{item.title}</h3>
                  <p className="text-base font-bold opacity-90">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Open Source Notice */}
        <section>
          <div className="cyber-card p-8 md:p-12 text-center bg-[#1040C0] text-white border-[#121212] dark:border-white shadow-[6px_6px_0px_0px_#121212] dark:shadow-[6px_6px_0px_0px_white] hover:-translate-y-1 transition-transform">
            <h3 className="text-2xl font-black uppercase tracking-wider mb-4">Open & Auditable</h3>
            <p className="text-lg font-bold opacity-90 max-w-2xl mx-auto leading-relaxed">
              StegCrypt's code is open source. You can inspect every line to verify these security claims.
              <br/>
              <a 
                href="https://github.com/Ashutoshgit47/stegcrypt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 px-6 py-3 bg-[#F0C020] text-[#121212] border-[3px] border-[#121212] dark:border-white shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] rotate-2 hover:rotate-0 hover:scale-105 transition-transform"
              >
                <span className="hover-glitch-text" data-text="DON'T TRUST, VERIFY.">DON'T TRUST, VERIFY.</span>
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
