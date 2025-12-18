import { HelpCircle, Lock, Unlock, FileImage, FileAudio, Shield, AlertTriangle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PageSEO } from '@/components/PageSEO';

const faqs = [
  {
    question: 'What is steganography?',
    answer: 'Steganography is the practice of hiding secret data within ordinary, non-secret data or physical objects. Unlike encryption which makes data unreadable, steganography hides the very existence of the secret message. StegCrypt combines both: it encrypts your data AND hides it within image or audio files.',
  },
  {
    question: 'What is cryptography and how does StegCrypt use it?',
    answer: 'Cryptography is the science of encoding data so only authorized parties can read it. StegCrypt uses AES-256-GCM encryption (military-grade) to encrypt your data BEFORE hiding it. This provides two layers of security: even if hidden data is found, it cannot be read without the password.',
  },
  {
    question: 'What is AES-256-GCM?',
    answer: 'AES-256-GCM is a symmetric encryption algorithm. AES-256 uses a 256-bit key (extremely secure), and GCM (Galois/Counter Mode) provides authenticated encryption - meaning it not only encrypts but also verifies data integrity. If anyone tampers with the encrypted data, decryption will fail.',
  },
  {
    question: 'What is PBKDF2 and why is it important?',
    answer: 'PBKDF2 (Password-Based Key Derivation Function 2) converts your password into a cryptographic key. It runs your password through SHA-256 hashing 100,000-310,000 times, making brute-force attacks extremely slow. Even simple passwords become hard to crack.',
  },
  {
    question: 'How does StegCrypt hide data?',
    answer: 'StegCrypt uses LSB (Least Significant Bit) steganography. It modifies the last 1-4 bits of each color channel in image pixels or audio samples. These changes are imperceptible to humans but can store significant amounts of data. Before embedding, your data is encrypted with AES-256-GCM.',
  },
  {
    question: 'Which file formats are supported?',
    answer: 'StegCrypt supports PNG and BMP images (both lossless), and WAV audio files. Lossy formats like JPEG and MP3 are not supported because compression destroys the hidden data. Your hidden files retain their original names and types when decoded.',
  },
  {
    question: 'Is my data really secure?',
    answer: 'StegCrypt uses AES-256-GCM encryption with PBKDF2 key derivation (100K-310K iterations). All processing happens locally in your browser — no data is ever sent to any server. However, security depends on your password strength (minimum 12 characters required).',
  },
  {
    question: 'What is High Security Mode?',
    answer: 'High Security Mode (Expert Mode only) increases PBKDF2 iterations from 100K to 310K, making brute-force attacks 3x harder. It takes longer to encrypt/decrypt but provides stronger protection for sensitive data.',
  },
  {
    question: 'What happens if I forget my password?',
    answer: 'There is no password recovery. If you forget your password, your data is permanently inaccessible. This is a feature, not a bug; it means even we cannot access your data. Always store passwords securely.',
  },
  {
    question: 'Can the hidden data be detected?',
    answer: 'Sophisticated steganalysis tools can potentially detect that data has been hidden, especially with high LSB depths or when using most of the available capacity. For maximum security, use LSB depth 1 and keep payload size under 50% of capacity.',
  },
  {
    question: 'What is ImageWrangler and how is it related to StegCrypt?',
    answer: 'ImageWrangler is a companion privacy-first, browser-based image processing tool by the same developer. It allows you to resize, crop, compress, and convert images entirely in your browser — no uploads, no servers. Like StegCrypt, all processing happens locally on your device. You can access it via the "ImageWrangler" link in the navigation menu.',
  },
  {
    question: 'Can I use ImageWrangler to prepare images for StegCrypt?',
    answer: 'Yes! ImageWrangler is perfect for preparing carrier images before using StegCrypt. You can resize, crop, or convert images to PNG/BMP format (which StegCrypt supports) directly in your browser. This workflow keeps your entire image preparation and steganography process private and local.',
  },
];

const supportedFormats = {
  carriers: [
    { format: 'PNG', icon: FileImage, status: 'supported', note: 'Recommended for images' },
    { format: 'BMP', icon: FileImage, status: 'supported', note: 'Lossless, excellent for steganography' },
    { format: 'WAV', icon: FileAudio, status: 'supported', note: 'Audio support available' },
    { format: 'JPEG', icon: FileImage, status: 'blocked', note: 'Lossy compression destroys data' },
  ],
  payloads: [
    { type: 'Text', note: 'Any text message (Quick Mode)' },
    { type: 'Files', note: 'Any file type (Expert Mode)' },
  ],
};

const sizeLimits = [
  { platform: 'Desktop (Image)', carrier: '≤100 MB', payload: '≤50 MB' },
  { platform: 'Desktop (Audio)', carrier: '≤200 MB', payload: '≤50 MB' },
  { platform: 'Mobile', carrier: '≤20 MB', payload: '≤10 MB' },
];

export default function Help() {
  return (
    <div className="container py-8 md:py-12 animate-fade-in">
      <PageSEO
        title="Help & Documentation"
        description="Learn how to use StegCrypt for secure steganography. Complete guide on encoding, decoding, supported file formats, and security best practices."
        path="/help"
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Help & Documentation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how to use StegCrypt effectively and securely.
          </p>
        </div>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Quick Start Guide</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="cyber-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold">Encoding (Hiding Data)</h3>
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">1.</span>
                  Select a carrier (PNG, BMP image or WAV audio)
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">2.</span>
                  Enter your secret message or select a file
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">3.</span>
                  Create a strong password (min 12 characters)
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">4.</span>
                  Click Encode & Download
                </li>
              </ol>
            </div>

            <div className="cyber-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <Unlock className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="font-semibold">Decoding (Extracting Data)</h3>
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">1.</span>
                  Select the encoded image or audio file
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">2.</span>
                  Enter the password used during encoding
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">3.</span>
                  Click Decode to extract the hidden data
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">4.</span>
                  Copy text or download the extracted file
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Supported Formats */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Supported Formats</h2>
          <div className="cyber-card">
            <h3 className="font-medium mb-4">Carrier Files (for hiding data)</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {supportedFormats.carriers.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.format}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${item.status === 'supported'
                      ? 'border-success/30 bg-success/5'
                      : item.status === 'planned'
                        ? 'border-muted bg-muted/30'
                        : 'border-destructive/30 bg-destructive/5'
                      }`}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="font-medium">{item.format}</span>
                      <p className="text-xs text-muted-foreground">{item.note}</p>
                    </div>
                    {item.status === 'supported' && (
                      <span className="text-xs text-success font-medium">✓ Supported</span>
                    )}
                    {item.status === 'blocked' && (
                      <span className="text-xs text-destructive font-medium">✗ Not Supported</span>
                    )}
                  </div>
                );
              })}
            </div>

            <h3 className="font-medium mb-4">Size Limits</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium">Platform</th>
                    <th className="text-left py-2 font-medium">Carrier Limit</th>
                    <th className="text-left py-2 font-medium">Payload Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeLimits.map((row) => (
                    <tr key={row.platform} className="border-b border-border last:border-0">
                      <td className="py-2">{row.platform}</td>
                      <td className="py-2 font-mono">{row.carrier}</td>
                      <td className="py-2 font-mono">{row.payload}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Best Practices
          </h2>
          <div className="cyber-card">
            <ul className="space-y-3">
              {[
                'Use passwords of at least 12 characters with mixed case, numbers, and symbols',
                'Keep payload size under 50% of carrier capacity for lower detectability',
                'Use LSB depth of 1 for maximum security (Expert Mode)',
                'Never share encoded files via social media — they recompress images',
                'Verify your encoded files work before deleting the original payload',
                'Store your passwords securely — there is no recovery option',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-medium text-primary">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="cyber-card px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
