// JavaScript fallback implementations for when WASM is not available
// These provide the same interface as the WASM modules but use JS/Web Crypto

import type { WasmStegModule, WasmCryptoModule } from './types';

// Steganography fallback (uses existing JS implementation)
export const stegFallback: WasmStegModule = {
    analyze_capacity(imageData: Uint8Array, width: number, height: number, lsbDepth: number): number {
        const usablePixels = width * height;
        const bitsPerPixel = 3 * lsbDepth; // RGB channels
        const maxCapacityBits = usablePixels * bitsPerPixel;
        return Math.floor(maxCapacityBits / 8);
    },

    embed(imageData: Uint8Array, width: number, height: number, payload: Uint8Array, lsbDepth: number, _randomize: boolean): Uint8Array {
        const pixels = new Uint8Array(imageData);

        // Prepare header
        const header = new Uint8Array(4);
        new DataView(header.buffer).setUint32(0, payload.length, true);

        // Combine header and payload
        const fullPayload = new Uint8Array(header.length + payload.length);
        fullPayload.set(header);
        fullPayload.set(payload, header.length);

        // Convert to bits
        const bits: number[] = [];
        for (const byte of fullPayload) {
            for (let i = 7; i >= 0; i--) {
                bits.push((byte >> i) & 1);
            }
        }

        // Create LSB mask
        const mask = 0xFF << lsbDepth;

        let bitIndex = 0;
        for (let i = 0; i < pixels.length && bitIndex < bits.length; i++) {
            if ((i + 1) % 4 === 0) continue; // Skip alpha

            let newValue = pixels[i] & mask;
            for (let d = lsbDepth - 1; d >= 0 && bitIndex < bits.length; d--) {
                newValue |= bits[bitIndex++] << d;
            }
            pixels[i] = newValue;
        }

        return pixels;
    },

    extract(imageData: Uint8Array, _width: number, _height: number, lsbDepth: number): Uint8Array | null {
        const pixels = imageData;

        // Extract bits
        const bits: number[] = [];
        for (let i = 0; i < pixels.length; i++) {
            if ((i + 1) % 4 === 0) continue;

            for (let d = lsbDepth - 1; d >= 0; d--) {
                bits.push((pixels[i] >> d) & 1);
            }
        }

        // Read header
        if (bits.length < 32) return null;

        let length = 0;
        for (let i = 0; i < 32; i++) {
            length |= bits[i] << (31 - i);
        }

        // Sanity check
        const maxPossibleBytes = Math.floor((bits.length - 32) / 8);
        if (length <= 0 || length > maxPossibleBytes) {
            return null;
        }

        // Extract payload
        const payload = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                const bitIndex = 32 + i * 8 + j;
                byte |= bits[bitIndex] << (7 - j);
            }
            payload[i] = byte;
        }

        return payload;
    },

    analyze_audio_capacity(audioData: Int16Array, lsbDepth: number): number {
        const samples = audioData.length;
        const bitsPerSample = lsbDepth;
        const maxCapacityBits = samples * bitsPerSample;
        return Math.floor(maxCapacityBits / 8);
    },

    embed_audio(audioData: Int16Array, payload: Uint8Array, lsbDepth: number): Int16Array {
        const samples = new Int16Array(audioData);

        // Prepare header
        const header = new Uint8Array(4);
        new DataView(header.buffer).setUint32(0, payload.length, true);

        // Combine header and payload
        const fullPayload = new Uint8Array(header.length + payload.length);
        fullPayload.set(header);
        fullPayload.set(payload, header.length);

        // Convert to bits
        const bits: number[] = [];
        for (const byte of fullPayload) {
            for (let i = 7; i >= 0; i--) {
                bits.push((byte >> i) & 1);
            }
        }

        // Create LSB mask
        const mask = 0xFFFF << lsbDepth;

        let bitIndex = 0;
        for (let i = 0; i < samples.length && bitIndex < bits.length; i++) {
            let newValue = samples[i] & mask;
            for (let d = lsbDepth - 1; d >= 0 && bitIndex < bits.length; d--) {
                newValue |= bits[bitIndex++] << d;
            }
            samples[i] = newValue;
        }

        return samples;
    },

    extract_audio(audioData: Int16Array, lsbDepth: number): Uint8Array | null {
        const samples = audioData;

        // Extract bits
        const bits: number[] = [];
        for (let i = 0; i < samples.length; i++) {
            for (let d = lsbDepth - 1; d >= 0; d--) {
                bits.push((samples[i] >> d) & 1);
            }
        }

        // Read header
        if (bits.length < 32) return null;

        let length = 0;
        for (let i = 0; i < 32; i++) {
            length |= bits[i] << (31 - i);
        }

        // Sanity check
        const maxPossibleBytes = Math.floor((bits.length - 32) / 8);
        if (length <= 0 || length > maxPossibleBytes) {
            return null;
        }

        // Extract payload
        const payload = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                const bitIndex = 32 + i * 8 + j;
                byte |= bits[bitIndex] << (7 - j);
            }
            payload[i] = byte;
        }

        return payload;
    }
};

// Crypto fallback (PBKDF2 via Web Crypto - Argon2 needs actual WASM)
export const cryptoFallback: WasmCryptoModule = {
    argon2_hash(_password: Uint8Array, _salt: Uint8Array, _iterations: number, _memory: number, _parallelism: number): Uint8Array {
        // Argon2 requires actual WASM implementation
        // This fallback throws an error - use PBKDF2 instead
        throw new Error('Argon2 requires WASM support. Use PBKDF2 as fallback.');
    }
};
