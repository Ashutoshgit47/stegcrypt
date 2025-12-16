// File validation utilities - PRD-compliant validation

import { FILE_LIMITS, SUPPORTED_FORMATS, WARNING_MESSAGES } from './constants';

export type FileType = 'imageCarrier' | 'audioCarrier' | 'payload';
export type Platform = 'desktop' | 'mobile';

export interface ValidationResult {
    valid: boolean;
    error?: string;
    warning?: string;
}

// Detect if running on mobile
export function isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;

    // Check screen width
    const isSmallScreen = window.innerWidth < 768;

    // Check user agent for mobile indicators
    const ua = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);

    // Check for touch capability
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return isSmallScreen || isMobileUA || (hasTouchScreen && isSmallScreen);
}

// Get the current platform
export function getPlatform(): Platform {
    return isMobileDevice() ? 'mobile' : 'desktop';
}

// Get file size limit for a file type
export function getFileSizeLimit(fileType: FileType, platform?: Platform): number {
    const currentPlatform = platform ?? getPlatform();
    return FILE_LIMITS[currentPlatform][fileType];
}

// Format bytes to human-readable string
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Get file MIME type from extension
function getMimeFromExtension(filename: string): string | null {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
        case 'png': return 'image/png';
        case 'bmp': return 'image/bmp';
        case 'tiff':
        case 'tif': return 'image/tiff';
        case 'wav': return 'audio/wav';
        case 'flac': return 'audio/flac';
        case 'mp3': return 'audio/mpeg';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'webp': return 'image/webp';
        case 'heic': return 'image/heic';
        case 'gif': return 'image/gif';
        case 'aac': return 'audio/aac';
        case 'ogg': return 'audio/ogg';
        default: return null;
    }
}

// Check if a MIME type is a supported image carrier
export function isSupportedImageCarrier(mimeType: string): boolean {
    return (SUPPORTED_FORMATS.imageCarriers.supported as readonly string[]).includes(mimeType);
}

// Check if a MIME type is a supported audio carrier
export function isSupportedAudioCarrier(mimeType: string): boolean {
    return (SUPPORTED_FORMATS.audioCarriers.supported as readonly string[]).includes(mimeType);
}

// Check if a format is explicitly unsupported (lossy)
function isUnsupportedFormat(mimeType: string): { unsupported: boolean; reason?: string } {
    if ((SUPPORTED_FORMATS.unsupported.images as readonly string[]).includes(mimeType)) {
        return {
            unsupported: true,
            reason: SUPPORTED_FORMATS.unsupported.reasons[mimeType] ||
                'This format is not supported for steganography.'
        };
    }
    if ((SUPPORTED_FORMATS.unsupported.audio as readonly string[]).includes(mimeType)) {
        return {
            unsupported: true,
            reason: SUPPORTED_FORMATS.unsupported.reasons[mimeType] ||
                'This audio format is not supported for steganography.'
        };
    }
    return { unsupported: false };
}

// Validate carrier file
export function validateCarrierFile(file: File, platform?: Platform): ValidationResult {
    const currentPlatform = platform ?? getPlatform();
    let mimeType = file.type;

    // Fallback to extension if MIME type is missing
    if (!mimeType) {
        mimeType = getMimeFromExtension(file.name) || '';
    }

    // Check if explicitly unsupported
    const unsupportedCheck = isUnsupportedFormat(mimeType);
    if (unsupportedCheck.unsupported) {
        return {
            valid: false,
            error: unsupportedCheck.reason
        };
    }

    // Check if it's a supported image
    if (isSupportedImageCarrier(mimeType)) {
        const limit = FILE_LIMITS[currentPlatform].imageCarrier;
        if (file.size > limit) {
            return {
                valid: false,
                error: WARNING_MESSAGES.fileTooLarge(formatFileSize(limit))
            };
        }

        // Add warning for mobile
        if (currentPlatform === 'mobile' && file.size > 15 * 1024 * 1024) {
            return {
                valid: true,
                warning: 'Large file may cause performance issues on mobile.'
            };
        }

        return { valid: true };
    }

    // Check if it's supported audio
    if (isSupportedAudioCarrier(mimeType) || file.name.toLowerCase().endsWith('.wav')) {
        const limit = FILE_LIMITS[currentPlatform].audioCarrier;
        if (file.size > limit) {
            return {
                valid: false,
                error: WARNING_MESSAGES.fileTooLarge(formatFileSize(limit))
            };
        }
        return { valid: true };
    }

    // Unknown format
    return {
        valid: false,
        error: WARNING_MESSAGES.unsupportedFormat(mimeType || file.name.split('.').pop() || 'Unknown')
    };
}

// Validate payload file
export function validatePayloadFile(file: File, platform?: Platform): ValidationResult {
    const currentPlatform = platform ?? getPlatform();
    const limit = FILE_LIMITS[currentPlatform].payload;

    if (file.size > limit) {
        return {
            valid: false,
            error: WARNING_MESSAGES.fileTooLarge(formatFileSize(limit))
        };
    }

    return { valid: true };
}

// Check if payload fits in carrier
export function validateCapacity(
    payloadSize: number,
    carrierCapacity: number
): ValidationResult {
    // Account for encryption overhead (salt + iv + auth tag + header)
    const overhead = 16 + 12 + 16 + 4; // ~48 bytes
    const requiredCapacity = payloadSize + overhead;

    if (requiredCapacity > carrierCapacity) {
        return {
            valid: false,
            error: `Payload too large. Need ${formatFileSize(requiredCapacity)}, carrier can hold ${formatFileSize(carrierCapacity)}.`
        };
    }

    // Calculate density percentage
    const density = (requiredCapacity / carrierCapacity) * 100;

    if (density > 80) {
        return {
            valid: true,
            warning: WARNING_MESSAGES.highDensity
        };
    }

    if (density > 50) {
        return {
            valid: true,
            warning: WARNING_MESSAGES.nearCapacity
        };
    }

    return { valid: true };
}

// Get LSB depth restriction for current platform
export function getLsbDepthForPlatform(
    requestedDepth: number,
    isExpertMode: boolean,
    platform?: Platform
): { depth: number; forced: boolean; message?: string } {
    const currentPlatform = platform ?? getPlatform();

    // Mobile always gets depth 1
    if (currentPlatform === 'mobile') {
        return {
            depth: 1,
            forced: true,
            message: WARNING_MESSAGES.mobileLsbForced
        };
    }

    // Desktop in Quick Mode gets depth 1
    if (!isExpertMode) {
        return {
            depth: 1,
            forced: true
        };
    }

    // Expert mode on desktop - use requested depth with warnings
    const depth = Math.max(1, Math.min(4, requestedDepth));

    if (depth > 2) {
        return {
            depth,
            forced: false,
            message: WARNING_MESSAGES.lsbDepthWarning
        };
    }

    return {
        depth,
        forced: false
    };
}

// Check if Argon2 is available
export function isArgon2Available(platform?: Platform): boolean {
    const currentPlatform = platform ?? getPlatform();

    // Argon2 disabled on mobile per PRD
    if (currentPlatform === 'mobile') {
        return false;
    }

    return true;
}
