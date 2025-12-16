// StegCrypt constants - PRD-compliant limits and settings

// File size limits (in bytes)
// Note: Processing requires ~3x file size in memory
export const FILE_LIMITS = {
    desktop: {
        imageCarrier: 100 * 1024 * 1024, // 100 MB
        audioCarrier: 200 * 1024 * 1024, // 200 MB  
        payload: 50 * 1024 * 1024,       // 50 MB
    },
    mobile: {
        imageCarrier: 20 * 1024 * 1024,  // 20 MB
        audioCarrier: 20 * 1024 * 1024,  // 20 MB
        payload: 10 * 1024 * 1024,       // 10 MB
    }
} as const;

// Supported file formats
export const SUPPORTED_FORMATS = {
    imageCarriers: {
        supported: ['image/png', 'image/bmp'],
        extensions: ['.png', '.bmp'],
        recommended: 'PNG',
    },
    audioCarriers: {
        supported: ['audio/wav', 'audio/wave', 'audio/x-wav'],
        extensions: ['.wav'],
        recommended: 'WAV (PCM)',
    },
    // Formats explicitly NOT supported
    unsupported: {
        images: ['image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif', 'image/gif'],
        audio: ['audio/mpeg', 'audio/mp3', 'audio/aac', 'audio/ogg'],
        reasons: {
            'image/jpeg': 'JPEG uses lossy compression which destroys hidden data',
            'image/webp': 'WebP uses lossy compression which destroys hidden data',
            'image/heic': 'HEIC uses lossy compression which destroys hidden data',
            'image/gif': 'GIF has limited color depth unsuitable for steganography',
            'audio/mpeg': 'MP3 uses lossy compression which destroys hidden data',
            'audio/mp3': 'MP3 uses lossy compression which destroys hidden data',
            'audio/aac': 'AAC uses lossy compression which destroys hidden data',
            'audio/ogg': 'OGG typically uses lossy compression',
        } as Record<string, string>,
    },
} as const;

// LSB depth settings
export const LSB_SETTINGS = {
    default: 1,
    min: 1,
    max: 4,
    mobileForced: 1, // Mobile devices are forced to use LSB depth 1
    expertOnly: [2, 3, 4], // These depths only available in Expert Mode
} as const;

// PRD-compliant warning messages
export const WARNING_MESSAGES = {
    // Capacity warnings
    highDensity: 'High embedding density increases detectability',
    lsbDepthWarning: 'LSB depth > 2 is not recommended',
    nearCapacity: 'Payload is near capacity limit. Consider using a larger carrier.',

    // Format warnings
    unsupportedFormat: (format: string) =>
        `${format} is not supported. Please use PNG for images or WAV for audio.`,
    lossyFormat: (format: string) =>
        `${format} uses lossy compression which destroys hidden data. Please use lossless formats (PNG, WAV).`,

    // Size warnings
    fileTooLarge: (limit: string) =>
        `File exceeds the ${limit} limit. Please use a smaller file.`,
    mobileLimit: 'On mobile devices, all files are limited to 20 MB.',

    // Mobile restrictions
    mobileArgon2Disabled: 'Argon2 is automatically disabled on mobile devices for performance.',
    mobileLsbForced: 'LSB depth is fixed to 1 on mobile devices for optimal performance.',
    mobileFlacDisabled: 'FLAC audio is not supported on mobile devices.',

    // Security warnings
    weakPassword: 'Password should be at least 12 characters for optimal security.',
    socialMediaWarning: 'Warning: Sharing on social media will destroy hidden data due to recompression.',
} as const;

// KDF settings
export const KDF_SETTINGS = {
    pbkdf2: {
        iterations: 100000,
        hash: 'SHA-256',
    },
    argon2: {
        memory: 65536, // 64 MB
        iterations: 3,
        parallelism: 4,
        desktopOnly: true,
    },
} as const;

// Processing stages for UI
export const PROCESSING_STAGES = {
    encode: ['load', 'analyze', 'encrypt', 'embed', 'save'] as const,
    decode: ['load', 'analyze', 'extract', 'decrypt', 'save'] as const,
} as const;
