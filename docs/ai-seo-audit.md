# StegCrypt AI SEO Audit Report

**Date**: 2026-04-12  
**Status re-check**: 2026-10-20  
**Site**: https://stegcrypt.app  
**Industry**: Security/Privacy Tools  
**Analyst**: AI SEO Specialist

> **Implementation update (2026-10-20)**: The three critical fixes from this audit are now in the codebase:
> - `public/robots.txt` has explicit AI crawler entries.
> - `Help.tsx` generates FAQPage JSON-LD from its `faqs` array and passes it to `PageSEO`.
> - `Encode.tsx` and `Decode.tsx` each emit HowTo schema.
>
> The original findings and recommendations are retained below for history. Open items are marked in the priority list.

---

## Executive Summary

**Overall AI SEO Score: 7.5/10** (original audit; schema and crawler gaps have since been closed)

StegCrypt has strong foundational AI SEO with:
- ✅ Well-structured llms.txt file
- ✅ Valid schema markup
- ✅ Comprehensive FAQ section
- ✅ Good technical documentation

**Status of original critical gaps (2026-10-20)**:
- ✅ robots.txt now has explicit AI crawler permissions
- ✅ FAQ Schema implemented (via `Help.tsx`/`PageSEO`)
- ✅ HowTo Schema implemented on Encode and Decode
- ⚠️ Still no `llms-full.txt`; `public/llms.txt` and `public/llm.txt` exist
- ⚠️ No location-based content (still not needed for this niche)

---

## 1. llms.txt Analysis

### Status: ✅ LIVE - Well Implemented

**Location**: `public/llm.txt` (also at `llm.txt` in root)

**Strengths**:
- ✅ Comprehensive technical documentation
- ✅ Clear feature descriptions
- ✅ API reference included
- ✅ Security model explained
- ✅ Development setup documented
- ✅ Known limitations listed

**Content Quality**: 9/10
- Detailed cryptographic specifications
- Clear architecture overview
- Code examples for API usage
- Browser compatibility matrix

**Missing Elements**:
- ⚠️ **Use case examples**: No real-world scenarios
- ⚠️ **Comparison section**: How it differs from competitors
- ⚠️ **Tutorial section**: Step-by-step guides
- ⚠️ **Security audit results**: Third-party validation

### Recommended Additions to llms.txt:

```markdown
## Use Cases

### Privacy Scenarios
1. **Whistleblower Communication**: Hide evidence in vacation photos
2. **Personal Journal**: Encrypted diary entries in family photos
3. **Secure File Transfer**: Send sensitive documents disguised as images
4. **Backup Encryption**: Hide encrypted backups in media files

### Industry Applications
- Journalism: Source protection
- Legal: Client confidentiality
- Healthcare: HIPAA-compliant data sharing
- Finance: Secure document transmission

## Competitive Advantages

vs. **OpenStego**: Modern UI, audio support, browser-based
vs. **OpenPuff**: Simpler UX, no installation needed
vs. **StegHide**: Web-based, supports more formats

## Security Audit Status
- ✅ Self-audited (bug.md available)
- ⚠️ No third-party security audit yet
- ✅ OWASP Top 10 compliant
- ✅ Zero npm vulnerabilities
```

---

## 2. Schema Markup Validation

### Status: ✅ VALID — WebApplication + FAQPage + HowTo

**Current Schema Types**:
- ✅ WebApplication (main schema in `index.html`)
- ✅ Offer (pricing - free)
- ✅ Person (author)
- ✅ FAQPage (`Help.tsx` via `PageSEO`)
- ✅ HowTo (`Encode.tsx` and `Decode.tsx` via `PageSEO`)

**Schema Present**:
```json
{
  "@type": "WebApplication",
  "name": "StegCrypt",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0" },
  "featureList": [...] 
}
```

### Schema Status:

#### ✅ FAQ Schema — IMPLEMENTED (2026-10-20)
`Help.tsx` builds the `FAQPage` object from its `faqs` array and passes it to `PageSEO`, which injects the JSON-LD. No static `public/faq-schema.json` is needed.

Original impact of the gap:
- Google AI Overviews could not parse the FAQs
- ChatGPT/Perplexity missed structured Q&A
- No FAQ rich-snippet opportunity

#### ⚠️ Software Application Schema Enhancements (still open)
Current schema missing:
- `softwareVersion`: "1.0.0"
- `fileSize`: "0" (browser-based)
- `installUrl`: "https://stegcrypt.app"
- `releaseNotes`: Link to changelog
- `screenshot`: Add multiple screenshots
- `aggregateRating`: User reviews (if applicable)

#### ✅ HowTo Schema — IMPLEMENTED (2026-10-20)
For encode/decode workflows, `Encode.tsx` and `Decode.tsx` each pass a `HowTo` object to `PageSEO`:
Current schema missing:
- `softwareVersion`: "1.0.0"
- `fileSize`: "0" (browser-based)
- `installUrl`: "https://stegcrypt.app"
- `releaseNotes`: Link to changelog
- `screenshot`: Add multiple screenshots
- `aggregateRating`: User reviews (if applicable)

#### ⚠️ HowTo Schema (MEDIUM PRIORITY)
For encode/decode workflows:

```json
{
  "@type": "HowTo",
  "name": "How to Hide Data in an Image",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Select Carrier File",
      "text": "Choose a PNG, BMP, or WAV file..."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Enter Password",
      "text": "Create a strong password (min 12 characters)..."
    }
    // ... more steps
  ]
}
```

---

## 3. robots.txt AI Bot Permissions

### Status: ✅ IMPLEMENTED (2026-10-20)

`public/robots.txt` now includes explicit AI search/retrieval crawler entries:

```txt
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: Google-Extended
Allow: /
```

It also allows Googlebot, Bingbot, Applebot, Twitterbot, and facebookexternalhit, with the sitemap at `https://stegcrypt.app/sitemap.xml`.

**Original problem**: the old file had no explicit AI crawler permissions. That gap is closed. The original recommendation below is retained for reference; the actual file covers the search/retrieval bots rather than the training-only `GPTBot`/`CCBot` entries.

### Original recommended robots.txt:

```txt
# Traditional Search Engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

# AI Crawlers (Explicit Permission)
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Anthropic-AI
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: AppleBot
Allow: /

# Social Media
User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: LinkedInBot
Allow: /

# Catch-all
User-agent: *
Allow: /

# Sitemap
Sitemap: https://stegcrypt.app/sitemap.xml

# Crawl-delay (optional, for server load)
Crawl-delay: 1
```

**Why This Matters**:
- OpenAI uses GPTBot to crawl for ChatGPT answers
- Anthropic uses ClaudeBot for Claude
- Perplexity uses its own bot
- Without explicit permission, they may skip your site

---

## 4. FAQ Section & Schema

### Status: ✅ EXCELLENT Content, ✅ Schema implemented (2026-10-20)

**FAQ Quality**: 10/10
- 13 comprehensive questions
- Detailed, helpful answers
- Covers security, privacy, technical aspects
- Well-structured in `Help.tsx`

**Current Implementation**:
```tsx
// Help.tsx has excellent FAQ content
const faqs = [
  { question: 'What is steganography?', answer: '...' },
  // ... 13 total FAQs
];

// Rendered with Accordion UI
<Accordion type="single" collapsible>
  {faqs.map((faq, i) => (
    <AccordionItem value={`faq-${i}`}>
      <AccordionTrigger>{faq.question}</AccordionTrigger>
      <AccordionContent>{faq.answer}</AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

### Implemented: FAQ Schema (Option 2)

`Help.tsx` now builds the schema from the same `faqs` array used by the accordion and passes it to `PageSEO` as the `schema` prop. The historical static/dynamic options are kept below for reference.

**Option 1: Static Schema in index.html**
Add to `<head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is steganography?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Steganography is the practice of hiding secret data within ordinary, non-secret data or a physical object. Unlike encryption, which makes data unreadable, steganography hides the very existence of the secret message."
      }
    },
    {
      "@type": "Question",
      "name": "What is AES-256-GCM?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AES-256-GCM is a symmetric encryption algorithm. AES-256 uses a 256-bit key (extremely secure), and GCM provides authenticated encryption — meaning it not only encrypts data but also verifies its integrity."
      }
    }
    // ... continue for all 13 FAQs
  ]
}
</script>
```

**Option 2: Dynamic Schema in Help.tsx**
This is the approach actually used. `PageSEO` injects the JSON-LD, so the manual `useEffect` example below is illustrative only:

```tsx
// Add to Help.tsx
useEffect(() => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(faqSchema);
  document.head.appendChild(script);
  
  return () => {
    document.head.removeChild(script);
  };
}, []);
```

---

## 5. Location Pages Analysis

### Status: ✅ N/A - Not Needed for This Niche

**Current Pages**:
- `/` - Homepage
- `/encode` - Encode tool
- `/decode` - Decode tool
- `/tools` - Security utilities
- `/help` - Documentation
- `/security` - Security info
- `/about` - About page

**Assessment**: 
- ❌ No location-specific pages (good - not needed)
- ✅ Function-specific pages (correct approach)
- ✅ All pages have substantial content (500+ words)

**Why Location Pages Aren't Needed**:
1. **Global Audience**: Steganography tool for privacy worldwide
2. **Not Local Service**: No physical location or regional service
3. **Language**: English-only (could add i18n later)
4. **No Regional Regulations**: Not a legal/financial service

**Recommendation**: DON'T create location pages. Focus on:
- Feature-specific landing pages
- Use-case pages (e.g., `/use-cases/journalists`)
- Comparison pages (e.g., `/vs-openstego`)

---

## 6. Missing Elements vs. Top Competitors

### Competitor Analysis

#### Top AI-Recommended Security Tools:
1. **ProtonMail** - Email encryption
2. **VeraCrypt** - Disk encryption
3. **Signal** - Messaging
4. **Bitwarden** - Password manager
5. **Tails OS** - Privacy OS

#### What They Have That StegCrypt Missing:

### 1. **Trust Signals** (HIGH IMPACT)
- ❌ No security audit badges
- ❌ No third-party endorsements
- ❌ No media mentions
- ❌ No user testimonials
- ❌ No GitHub stars display (you have 0 visible)

**Fix**:
```markdown
## Add to Homepage:
- "Featured on Product Hunt" (if applicable)
- "Recommended by X" (security blogs)
- User testimonial quotes
- GitHub star count: ⭐ X stars
- Download count: "Trusted by X users"
```

### 2. **Comparison Content** (HIGH IMPACT)
- ❌ No `/compare` page
- ❌ No `/alternatives` page
- ❌ No `/vs-competitor` pages

**Fix**: Create `/compare` page:

```tsx
// src/pages/Compare.tsx
const comparisons = [
  {
    feature: 'Browser-based',
    stegcrypt: '✅',
    openstego: '❌',
    steghide: '❌',
    quickstego: '✅'
  },
  {
    feature: 'Audio support',
    stegcrypt: '✅ WAV',
    openstego: '❌',
    steghide: '✅ Audio',
    quickstego: '❌'
  },
  {
    feature: 'AES-256 encryption',
    stegcrypt: '✅',
    openstego: '❌',
    steghide: '✅ AES-128',
    quickstego: '❌'
  },
  // ... more features
];
```

### 3. **Educational Content Hub** (MEDIUM IMPACT)
- ❌ No blog
- ❌ No tutorials beyond Help page
- ❌ No case studies
- ❌ No security whitepaper

**Fix**: Create `/learn` section:
- `/learn/what-is-steganography`
- `/learn/how-encryption-works`
- `/learn/steganography-history`
- `/learn/digital-privacy-guide`
- `/learn/security-best-practices`

### 4. **Visual Demonstrations** (MEDIUM IMPACT)
- ❌ No demo videos
- ❌ No animated GIFs showing workflow
- ❌ No before/after examples

**Fix**:
- Add demo GIF to homepage
- Create YouTube video tutorial
- Add interactive demo section

### 5. **Community & Social Proof** (MEDIUM IMPACT)
- ❌ No Discord/community
- ❌ No Twitter following
- ❌ No Reddit presence
- ❌ No blog comments

**Fix**:
- Create Discord server
- Active Twitter account with tips
- Post to r/privacy, r/cryptography
- Enable GitHub Discussions

### 6. **Advanced Documentation** (LOW-MEDIUM IMPACT)
- ⚠️ llms.txt good but no extended docs
- ❌ No API documentation site
- ❌ No developer docs beyond llms.txt

**Fix**: Consider:
- `/docs` site (using VitePress/Docusaurus)
- API reference with examples
- Code playground

### 7. **Downloadable Resources** (LOW IMPACT)
- ❌ No PDF guides
- ❌ No cheat sheets
- ❌ No security checklist

**Fix**: Create:
- "Complete Guide to Steganography" PDF
- "Security Checklist" one-pager
- "Encryption Best Practices" guide

---

## 7. Prioritized Fix List

### Priority 0: CRITICAL (Do Immediately)

#### 1. ✅ Add AI Bot Permissions to robots.txt — DONE (2026-10-20)
**Impact**: AI crawlers can index your content  
**Fix**: `public/robots.txt` now allows OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, Claude-SearchBot, Claude-User, and Google-Extended.

#### 2. ✅ Add FAQ Schema Markup — DONE (2026-10-20)
**Impact**: Google AI Overviews can display your FAQs  
**Fix**: `Help.tsx` passes a generated `FAQPage` schema to `PageSEO`.

---

### Priority 1: HIGH (Do This Week)

#### 3. Add Comparison Page (`/compare`)
**Impact**: Capture "steganography tool comparison" searches  
**Effort**: 2-3 hours  
**Fix**: Create Compare.tsx with feature matrix

#### 4. Enhance llms.txt with Use Cases
**Impact**: Better AI understanding of practical applications  
**Effort**: 30 minutes  
**Fix**: Add "Use Cases" and "Competitive Advantages" sections

#### 5. ✅ Add HowTo Schema for Encode/Decode — DONE (2026-10-20)
**Impact**: Rich snippets for tutorial searches  
**Fix**: `Encode.tsx` and `Decode.tsx` each pass a `HowTo` schema to `PageSEO`.

---

### Priority 2: MEDIUM (Do This Month)

#### 6. Create Educational Content Hub (`/learn`)
**Impact**: Authority building, long-tail SEO  
**Effort**: 1-2 days  
**Fix**: 5-10 article pages on steganography topics

#### 7. Add Trust Signals to Homepage
**Impact**: Credibility, conversion rate  
**Effort**: 2 hours  
**Fix**: GitHub stars, user count, testimonials

#### 8. Create Demo Video/GIF
**Impact**: User understanding, engagement  
**Effort**: 2-4 hours  
**Fix**: Loom recording or animated GIF on homepage

#### 9. Add SoftwareApplication Enhancements
**Impact**: Better rich snippets  
**Effort**: 30 minutes  
**Fix**: Add version, screenshots, releaseNotes to schema

---

### Priority 3: LOW (Nice to Have)

#### 10. Create Downloadable Resources
**Impact**: Lead generation (if applicable)  
**Effort**: 3-4 hours  
**Fix**: PDF guides, checklists

#### 11. Build Community Presence
**Impact**: Long-term brand building  
**Effort**: Ongoing  
**Fix**: Discord, Twitter, Reddit engagement

#### 12. Add Multi-language Support (i18n)
**Impact**: Global reach  
**Effort**: 1-2 weeks  
**Fix**: React i18n for major languages

---

## 8. Immediate Action Items (Original 24-Hour List)

### Status (2026-10-20):

1. ✅ **`public/robots.txt`** — updated with AI crawler entries (see section 3). The actual file lists OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, Claude-SearchBot, Claude-User, Google-Extended, and standard search bots. It does not block or explicitly list GPTBot/CCBot.
2. ✅ **FAQ schema** — implemented dynamically in `Help.tsx`/`PageSEO`. No `public/faq-schema.json` was created.
3. ✅ **FAQ schema in `index.html`** — not needed; the FAQ page injects it. `index.html` retains the WebApplication schema.
4. ⬜ **`public/llm.txt`** — still lacks dedicated Use Cases, Competitive Advantages, and Security Audit sections. Both `llm.txt` and `llms.txt` exist.
5. ⬜ **`src/pages/Compare.tsx`** — still not implemented.

---

## 9. Success Metrics to Track

### Before/After Metrics:

**Week 1 Metrics**:
- AI search appearances (Google Search Console)
- FAQ rich snippet appearances
- Crawl stats for AI bots

**Month 1 Metrics**:
- Organic traffic from AI searches
- "steganography tool comparison" rankings
- Backlinks from AI-optimized content

**Quarter 1 Metrics**:
- Brand mentions in AI responses
- Featured snippet appearances
- Voice search appearances

---

## 10. Competitive Positioning

### Unique Advantages to Emphasize:

1. **100% Browser-Based**: No installation vs. competitors
2. **Audio Steganography**: Unique feature (most tools only images)
3. **Military-Grade Encryption**: AES-256-GCM standard
4. **Zero Server**: Complete privacy
5. **Open Source**: Auditable code
6. **PWA**: Installable, works offline

### Messaging for AI:
"StegCrypt is the ONLY browser-based steganography tool with audio support and military-grade AES-256-GCM encryption. Unlike OpenStego and StegHide, StegCrypt requires no installation and processes everything locally."

---

## Summary (updated 2026-10-20)

Completed since the original audit:

1. ✅ AI crawler permissions in `public/robots.txt`
2. ✅ FAQPage schema in `Help.tsx`
3. ✅ HowTo schema on Encode and Decode

Still open:

1. **This Week**: Comparison page (`/compare`), `llm.txt` use-case/competitive/audit sections
2. **This Month**: Educational content, trust signals, SoftwareApplication enhancements
3. **Ongoing**: Demo media, community presence, downloadable resources, i18n

The original 30-50% visibility estimate was a projection, not a measured result. Re-run the audit after the open items ship.

---

**Report generated**: 2026-04-12  
**Status updated**: 2026-10-20  
**Next audit**: Recommended after the `/compare` and `llm.txt` updates
