import { HelpCircle, Lock, Unlock, FileImage, FileAudio, Shield, AlertTriangle, Wrench, Key } from 'lucide-react';
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
    answer: 'Steganography is the practice of hiding secret data within ordinary, non-secret data or a physical object. Unlike encryption, which makes data unreadable, steganography hides the very existence of the secret message. StegCrypt combines both techniques: it encrypts your data AND hides it within image or audio files.',
  },
  {
    question: 'What is cryptography, and how does StegCrypt use it?',
    answer: 'Cryptography is the science of encoding data so that only authorized parties can read it. StegCrypt uses AES-256-GCM encryption (military grade) to encrypt your data BEFORE hiding it in a carrier file. This provides two layers of security: even if someone discovers hidden data in a file, they cannot read it without the password. StegCrypt also has a dedicated Cryptography mode that encrypts files directly — no carrier needed.',
  },
  {
    question: 'What is AES-256-GCM?',
    answer: 'AES-256-GCM is a symmetric encryption algorithm. AES-256 uses a 256-bit key (extremely secure), and GCM (Galois/Counter Mode) provides authenticated encryption — meaning it not only encrypts data but also verifies its integrity. If anyone tampers with the encrypted data, decryption will fail with an authentication error.',
  },
  {
    question: 'What is PBKDF2, and why is it important?',
    answer: 'PBKDF2 (Password-Based Key Derivation Function 2) converts your password into a cryptographic key. It runs your password through SHA-256 hashing 100,000–310,000 times, making brute-force attacks extremely slow. Even a simple password becomes very hard to crack when PBKDF2 is used with a high iteration count.',
  },
  {
    question: 'How does StegCrypt hide data in files?',
    answer: 'StegCrypt uses LSB (Least Significant Bit) steganography. It modifies the last 1–4 bits of each color channel in image pixels, or each audio sample in WAV files. These changes are imperceptible to humans but can store significant amounts of data. Before embedding, data is encrypted with AES-256-GCM.',
  },
  {
    question: 'What file formats are supported as carriers?',
    answer: 'StegCrypt supports PNG and BMP images (recommended), WebP lossless images, TIFF images, and WAV audio files. Lossy formats like JPEG and MP3 are not supported because their compression algorithms destroy the hidden data. When you decode, the original file name and type are restored automatically.',
  },
  {
    question: 'What is the difference between Steganography Mode and Cryptography Mode?',
    answer: 'In Steganography Mode, your encrypted data is hidden inside a carrier file (an image or WAV audio). The output looks like a normal image or audio file. In Cryptography Mode, your data is encrypted without being hidden — the output is a .stegcrypt binary file. Cryptography Mode is useful when you do not need the invisibility aspect, just the encryption.',
  },
  {
    question: 'What is the built-in password generator?',
    answer: 'StegCrypt includes a cryptographically secure password generator accessible inline on the Encode and Decode pages, as well as on the Tools page. It uses crypto.getRandomValues() to generate random passwords and displays their strength in bits of entropy. You can click "Use This" to apply the generated password directly to the form.',
  },
  {
    question: 'Is my data really secure?',
    answer: 'StegCrypt uses AES-256-GCM encryption with PBKDF2 key derivation (100K–310K iterations). All processing happens locally in your browser — no data is ever sent to any server. However, security also depends on your password strength (minimum 12 characters required) and the security of your device.',
  },
  {
    question: 'What is High Security Mode?',
    answer: 'High Security Mode (available in Expert Mode) increases the PBKDF2 iteration count from 100,000 to 310,000, making brute-force attacks 3× harder. It takes longer to encrypt and decrypt but provides stronger protection for highly sensitive data. It is disabled on mobile devices for performance reasons.',
  },
  {
    question: 'What happens if I forget my password?',
    answer: 'There is no password recovery. If you forget your password, your data is permanently inaccessible. This is by design — it means no one can access your data, including us. Always store your passwords in a secure password manager.',
  },
  {
    question: 'Can the hidden data be detected?',
    answer: 'Sophisticated steganalysis tools can potentially detect that data has been hidden, especially with high LSB depths (3–4) or when the payload uses most of the available capacity. For maximum stealth, use LSB depth 1 and keep the payload size below 50% of the carrier capacity.',
  },
  {
    question: 'What is ImageWrangler, and how is it related to StegCrypt?',
    answer: 'ImageWrangler is a companion privacy-first, browser-based image processing tool by the same developer. It allows you to resize, crop, compress, and convert images entirely in your browser — no uploads, no servers. You can use it to prepare PNG or BMP carrier images before using StegCrypt.',
  },
];

const supportedFormats = {
  carriers: [
    { format: 'PNG', icon: FileImage, status: 'supported', note: 'Recommended — lossless, pure JS codec' },
    { format: 'BMP', icon: FileImage, status: 'supported', note: 'Lossless, excellent for steganography' },
    { format: 'WebP (lossless)', icon: FileImage, status: 'supported', note: 'Lossless WebP only; lossy WebP is rejected' },
    { format: 'TIFF', icon: FileImage, status: 'supported', note: 'Read via browser canvas; output saved as PNG' },
    { format: 'WAV', icon: FileAudio, status: 'supported', note: '16-bit PCM audio support' },
    { format: 'JPEG', icon: FileImage, status: 'blocked', note: 'Lossy compression destroys hidden data' },
    { format: 'MP3 / AAC', icon: FileAudio, status: 'blocked', note: 'Lossy compression destroys hidden data' },
  ],
  payloads: [
    { type: 'Text', note: 'Any text message (Quick Mode and Expert Mode)' },
    { type: 'Files', note: 'Any file type (Expert Mode), including binary files' },
  ],
};

const sizeLimits = [
  { platform: 'Desktop (Image)', carrier: '≤ 100 MB', payload: '≤ 50 MB' },
  { platform: 'Desktop (Audio)', carrier: '≤ 200 MB', payload: '≤ 50 MB' },
  { platform: 'Mobile (All)', carrier: '≤ 20 MB', payload: '≤ 10 MB' },
];

export default function Help() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };

  return (
    <div className="container py-8 md:py-12 animate-fade-in">
      <PageSEO
        title="Help & Documentation"
        description="Learn how to use StegCrypt for secure steganography and encryption. Complete guide on encoding, decoding, file formats, the password generator, security tools, and best practices."
        path="/help"
        schema={faqSchema}
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-[#D02020] border-[3px] border-[#121212] dark:border-white shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] mb-6 transform rotate-3 hover:-rotate-3 transition-transform">
            <HelpCircle className="h-8 w-8 text-white stroke-[3px]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">Help & Docs</h1>
          <p className="text-lg font-bold opacity-80 max-w-2xl mx-auto">
            Learn how to use StegCrypt effectively and securely.
          </p>
        </div>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Quick Start Guide</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="cyber-card shadow-[4px_4px_0px_0px_#D02020] dark:shadow-[4px_4px_0px_0px_#D02020]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 border-[3px] border-[#121212] dark:border-white bg-[#D02020] flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#121212]">
                  <Lock className="h-5 w-5 stroke-[3px]" />
                </div>
                <h3 className="font-black uppercase tracking-wide text-sm">Encoding (Hiding Data)</h3>
              </div>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-black text-[#D02020]">1.</span>
                  <span className="font-medium opacity-80">Select a carrier file (PNG, BMP, WebP lossless, TIFF, or WAV)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black text-[#D02020]">2.</span>
                  <span className="font-medium opacity-80">Enter your secret message or select a file to hide</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black text-[#D02020]">3.</span>
                  <span className="font-medium opacity-80">Create a strong password — use the built-in generator if needed</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black text-[#D02020]">4.</span>
                  <span className="font-medium opacity-80">Click "Encode & Download"</span>
                </li>
              </ol>
            </div>

            <div className="cyber-card shadow-[4px_4px_0px_0px_#1040C0] dark:shadow-[4px_4px_0px_0px_#1040C0]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 border-[3px] border-[#121212] dark:border-white bg-[#1040C0] flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#121212]">
                  <Unlock className="h-5 w-5 stroke-[3px]" />
                </div>
                <h3 className="font-black uppercase tracking-wide text-sm">Decoding (Extracting Data)</h3>
              </div>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-black text-[#1040C0]">1.</span>
                  <span className="font-medium opacity-80">Select the encoded image or audio file</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black text-[#1040C0]">2.</span>
                  <span className="font-medium opacity-80">Enter the password that was used during encoding</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black text-[#1040C0]">3.</span>
                  <span className="font-medium opacity-80">Click "Decode" to extract the hidden data</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black text-[#1040C0]">4.</span>
                  <span className="font-medium opacity-80">Copy the extracted text or download the recovered file</span>
                </li>
              </ol>
            </div>

            <div className="cyber-card shadow-[4px_4px_0px_0px_#F0C020] dark:shadow-[4px_4px_0px_0px_#F0C020]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 border-[3px] border-[#121212] dark:border-white bg-[#F0C020] flex items-center justify-center text-[#121212] shadow-[2px_2px_0px_0px_#121212]">
                  <Shield className="h-5 w-5 stroke-[3px]" />
                </div>
                <h3 className="font-black uppercase tracking-wide text-sm">Cryptography Mode (Encrypt Only)</h3>
              </div>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-black text-[#1040C0]">1.</span>
                  <span className="font-medium opacity-80">On the Encode page, select the "Cryptography" tab</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black text-[#1040C0]">2.</span>
                  <span className="font-medium opacity-80">Enter text or select any file to encrypt</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black text-[#1040C0]">3.</span>
                  <span className="font-medium opacity-80">Set a password and click "Encrypt & Download"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black text-[#1040C0]">4.</span>
                  <span className="font-medium opacity-80">Decrypt using the Cryptography tab on the Decode page</span>
                </li>
              </ol>
            </div>

            <div className="cyber-card shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 border-[3px] border-[#121212] dark:border-white bg-[#121212] dark:bg-white flex items-center justify-center text-white dark:text-[#121212] shadow-[2px_2px_0px_0px_#D02020]">
                  <Wrench className="h-5 w-5 stroke-[3px]" />
                </div>
                <h3 className="font-black uppercase tracking-wide text-sm">Security Tools</h3>
              </div>
              <p className="text-sm font-medium opacity-80 mb-3">
                Visit the <strong className="text-foreground">Tools</strong> page for standalone cryptographic utilities:
              </p>
              <ul className="space-y-1 text-sm">
                <li>• <strong className="text-[#D02020]">Hash Generator</strong> — SHA-1, SHA-256, SHA-384, SHA-512</li>
                <li>• <strong className="text-[#1040C0]">Base64</strong> — Encode and decode Base64 strings</li>
                <li>• <strong className="text-[#F0C020]">Password Generator</strong> — Strong, random passwords</li>
                <li>• <strong className="text-[#121212] dark:text-white">Hex Converter</strong> — Text ↔ hexadecimal</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Password Generator */}
        <section className="mb-12">
          <h2 className="text-2xl font-black uppercase tracking-wide mb-6 flex items-center gap-3">
            <span className="h-8 w-8 flex items-center justify-center bg-[#D02020] border-[3px] border-[#121212] dark:border-white">
              <Key className="h-4 w-4 text-white stroke-[3px]" />
            </span>
            Built-in Password Generator
          </h2>
          <div className="cyber-card">
            <p className="text-sm font-medium opacity-80 mb-4">
              StegCrypt has a built-in cryptographically secure password generator available directly
              next to the password fields on the Encode and Decode pages, and as a full tool on the Tools page.
            </p>
            <ul className="space-y-2">
              {[
                <span key={0}>Uses <code className="text-xs bg-[#121212] dark:bg-white text-white dark:text-[#121212] px-1 font-mono">crypto.getRandomValues()</code> — no patterns, no predictability</span>,
                '24-character passwords by default (configurable on Tools page)',
                'Displays entropy in bits so you know exactly how strong the password is',
                '"Use This" button fills the password fields instantly',
                'Passwords are generated locally — never transmitted anywhere',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="h-5 w-5 flex items-center justify-center bg-[#D02020] text-white text-xs font-black shrink-0 mt-0.5">▸</span>
                  <span className="font-medium opacity-80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Supported Formats */}
        <section className="mb-12">
          <h2 className="text-2xl font-black uppercase tracking-wide mb-6 flex items-center gap-3">
            <span className="h-8 w-8 flex items-center justify-center bg-[#D02020] border-[3px] border-[#121212] dark:border-white">
              <FileImage className="h-4 w-4 text-white stroke-[3px]" />
            </span>
            Supported Formats
          </h2>
          <div className="cyber-card">
            <h3 className="font-black uppercase tracking-wide text-sm mb-4 border-b-[2px] border-[#121212] dark:border-white pb-2">Carrier Files</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {supportedFormats.carriers.map((item) => {
                const Icon = item.icon;
                const ok = item.status === 'supported';
                return (
                  <div
                    key={item.format}
                    className={`flex items-center gap-3 p-3 border-[3px] ${
                      ok
                        ? 'border-[#121212] dark:border-white bg-white dark:bg-[#1E1E1E]'
                        : 'border-[#D02020] bg-[#D02020]/10'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-black uppercase text-xs tracking-wide">{item.format}</span>
                      <p className="text-xs font-medium opacity-60">{item.note}</p>
                    </div>
                    <span className={`text-sm font-black shrink-0 ${ok ? 'text-green-600 dark:text-green-400' : 'text-[#D02020]'}`}>
                      {ok ? '✓' : '✗'}
                    </span>
                  </div>
                );
              })}
            </div>

            <h3 className="font-black uppercase tracking-wide text-sm mb-4 border-b-[2px] border-[#121212] dark:border-white pb-2">File Size Limits</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-[3px] border-[#121212] dark:border-white">
                <thead>
                  <tr className="bg-[#D02020] text-white">
                    <th className="text-left py-2 px-3 font-black uppercase tracking-wide text-xs">Platform</th>
                    <th className="text-left py-2 px-3 font-black uppercase tracking-wide text-xs">Carrier Limit</th>
                    <th className="text-left py-2 px-3 font-black uppercase tracking-wide text-xs">Payload Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeLimits.map((row, i) => (
                    <tr key={row.platform} className={`border-t-[2px] border-[#121212] dark:border-white ${i % 2 === 0 ? 'bg-white dark:bg-[#1E1E1E]' : 'bg-[#F0F0F0] dark:bg-[#252525]'}`}>
                      <td className="py-2 px-3 font-bold text-xs uppercase tracking-wide">{row.platform}</td>
                      <td className="py-2 px-3 font-mono text-xs">{row.carrier}</td>
                      <td className="py-2 px-3 font-mono text-xs">{row.payload}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-black uppercase tracking-wide mb-6 flex items-center gap-3">
            <span className="h-8 w-8 flex items-center justify-center bg-[#D02020] border-[3px] border-[#121212] dark:border-white">
              <Shield className="h-4 w-4 text-white stroke-[3px]" />
            </span>
            Best Practices
          </h2>
          <div className="cyber-card">
            <ul className="space-y-3">
              {[
                'Use passwords of at least 12 characters with mixed case, numbers, and symbols — or use the built-in generator',
                'Keep the payload size below 50% of the carrier capacity for lower detectability',
                'Use LSB depth 1 for maximum security (available in Expert Mode)',
                'Never share encoded files via social media — platforms recompress images, destroying hidden data',
                'Verify your encoded files work before deleting the original payload',
                'Store your passwords securely in a password manager — there is no recovery option',
                'Use PNG as the output format for maximum compatibility and lossless storage',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="h-6 w-6 flex items-center justify-center bg-[#D02020] text-white text-xs font-black shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="font-medium opacity-80">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-black uppercase tracking-wide mb-6 flex items-center gap-3">
            <span className="h-8 w-8 flex items-center justify-center bg-[#D02020] border-[3px] border-[#121212] dark:border-white">
              <HelpCircle className="h-4 w-4 text-white stroke-[3px]" />
            </span>
            FAQ
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-[3px] border-[#121212] dark:border-white shadow-[3px_3px_0px_0px_#D02020] px-5 bg-white dark:bg-[#121212] data-[state=open]:shadow-none data-[state=open]:translate-x-[3px] data-[state=open]:translate-y-[3px] transition-all">
                <AccordionTrigger className="text-left hover:no-underline font-black uppercase tracking-wide text-sm py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-medium opacity-80 text-sm pb-4">
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
