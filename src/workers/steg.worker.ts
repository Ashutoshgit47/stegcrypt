// Steganography Worker - Handles embedding/extraction in background thread
// This prevents UI freezing for large files

import type { WorkerResponse } from './worker-types';

interface EmbedRequest {
    type: 'EMBED_IMAGE' | 'EMBED_AUDIO';
    id: string;
    data: {
        carrier: ArrayBuffer;  // Image or audio raw data
        payload: ArrayBuffer;
        lsbDepth: number;
        format: 'png' | 'bmp' | 'wav';
    };
}

interface ExtractRequest {
    type: 'EXTRACT_IMAGE' | 'EXTRACT_AUDIO';
    id: string;
    data: {
        carrier: ArrayBuffer;
        lsbDepth: number;
        format: 'png' | 'bmp' | 'wav';
    };
}

type StegRequest = EmbedRequest | ExtractRequest;

// Magic header for detecting embedded data: "STEG" in hex
const MAGIC_HEADER = new Uint8Array([0x53, 0x54, 0x45, 0x47]);

function sendProgress(id: string, progress: number, stage: string, message?: string) {
    self.postMessage({
        type: 'PROGRESS',
        id,
        data: { progress, stage, message }
    });
}

function sendComplete(id: string, result: ArrayBuffer) {
    (self as any).postMessage({
        type: 'COMPLETE',
        id,
        data: { result }
    }, [result]);
}

function sendError(id: string, message: string, code?: string) {
    self.postMessage({
        type: 'ERROR',
        id,
        data: { message, code }
    });
}

// =============== IMAGE STEGANOGRAPHY ===============

function embedImageData(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    payload: ArrayBuffer,
    lsbDepth: number,
    onProgress: (p: number) => void
): Uint8ClampedArray {
    const payloadBytes = new Uint8Array(payload);

    // Build the full message: MAGIC (4 bytes) + LENGTH (4 bytes) + DATA
    const messageLength = 8 + payloadBytes.length;
    const message = new Uint8Array(messageLength);

    // Set magic header
    message.set(MAGIC_HEADER, 0);

    // Set length (big endian)
    const len = payloadBytes.length;
    message[4] = (len >> 24) & 0xFF;
    message[5] = (len >> 16) & 0xFF;
    message[6] = (len >> 8) & 0xFF;
    message[7] = len & 0xFF;

    // Copy payload
    message.set(payloadBytes, 8);

    // Calculate capacity
    const usableChannels = width * height * 3; // R, G, B (skip alpha)
    const availableBits = usableChannels * lsbDepth;
    const neededBits = messageLength * 8;

    if (neededBits > availableBits) {
        throw new Error(`Payload too large. Need ${neededBits} bits, have ${availableBits}`);
    }

    // Create output buffer
    const output = new Uint8ClampedArray(pixels.length);
    output.set(pixels);

    // Embed message into pixels
    let bitIndex = 0;
    const totalBitsToEmbed = messageLength * 8;
    const progressInterval = Math.floor(pixels.length / 20); // Report every 5%

    for (let pixelOffset = 0; pixelOffset < pixels.length && bitIndex < totalBitsToEmbed; pixelOffset += 4) {
        // Progress reporting
        if (pixelOffset % progressInterval === 0) {
            onProgress((bitIndex / totalBitsToEmbed) * 100);
        }

        // Process R, G, B channels (skip Alpha)
        for (let channel = 0; channel < 3 && bitIndex < totalBitsToEmbed; channel++) {
            const idx = pixelOffset + channel;
            let pixelValue = output[idx];

            // Clear the LSB bits
            const mask = 0xFF << lsbDepth;
            pixelValue = pixelValue & mask;

            // Set new LSB bits
            for (let bit = lsbDepth - 1; bit >= 0 && bitIndex < totalBitsToEmbed; bit--) {
                const byteIndex = Math.floor(bitIndex / 8);
                const bitPosition = 7 - (bitIndex % 8);
                const bitValue = (message[byteIndex] >> bitPosition) & 1;
                pixelValue |= bitValue << bit;
                bitIndex++;
            }

            output[idx] = pixelValue;
        }

        // Ensure alpha is always 255 for compatibility
        output[pixelOffset + 3] = 255;
    }

    return output;
}

function extractImageData(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    lsbDepth: number,
    onProgress: (p: number) => void
): ArrayBuffer | null {
    const usableChannels = width * height * 3;
    const maxBits = usableChannels * lsbDepth;

    if (maxBits < 64) {
        return null;
    }

    // Extract bits from pixels
    const extractedBits: number[] = [];
    const progressInterval = Math.floor(pixels.length / 10);

    for (let pixelOffset = 0; pixelOffset < pixels.length; pixelOffset += 4) {
        if (pixelOffset % progressInterval === 0) {
            onProgress((pixelOffset / pixels.length) * 50);
        }

        for (let channel = 0; channel < 3; channel++) {
            const idx = pixelOffset + channel;
            const pixelValue = pixels[idx];

            for (let bit = lsbDepth - 1; bit >= 0; bit--) {
                extractedBits.push((pixelValue >> bit) & 1);
            }
        }
    }

    onProgress(50);

    // Convert first 32 bits to magic header
    if (extractedBits.length < 64) {
        return null;
    }

    const extractedMagic = [0, 0, 0, 0];
    for (let byteIdx = 0; byteIdx < 4; byteIdx++) {
        let byte = 0;
        for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
            const bit = extractedBits[byteIdx * 8 + bitIdx];
            byte |= bit << (7 - bitIdx);
        }
        extractedMagic[byteIdx] = byte;
    }

    // Verify magic header
    for (let i = 0; i < 4; i++) {
        if (extractedMagic[i] !== MAGIC_HEADER[i]) {
            return null;
        }
    }

    onProgress(60);

    // Extract length (bytes 4-7, big endian)
    let payloadLength = 0;
    for (let byteIdx = 4; byteIdx < 8; byteIdx++) {
        let byte = 0;
        for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
            const bit = extractedBits[byteIdx * 8 + bitIdx];
            byte |= bit << (7 - bitIdx);
        }
        payloadLength = (payloadLength << 8) | byte;
    }

    // Sanity check
    const headerBits = 64;
    const availablePayloadBits = extractedBits.length - headerBits;
    const maxPayloadBytes = Math.floor(availablePayloadBits / 8);

    if (payloadLength <= 0 || payloadLength > maxPayloadBytes) {
        return null;
    }

    onProgress(70);

    // Extract payload
    const payload = new Uint8Array(payloadLength);
    const payloadStartBit = 64;

    for (let byteIdx = 0; byteIdx < payloadLength; byteIdx++) {
        if (byteIdx % 1000 === 0) {
            onProgress(70 + (byteIdx / payloadLength) * 30);
        }

        let byte = 0;
        for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
            const globalBitIdx = payloadStartBit + byteIdx * 8 + bitIdx;
            if (globalBitIdx < extractedBits.length) {
                const bit = extractedBits[globalBitIdx];
                byte |= bit << (7 - bitIdx);
            }
        }
        payload[byteIdx] = byte;
    }

    onProgress(100);
    return payload.buffer;
}

// =============== BMP CODEC ===============

function decodeBMP(buffer: ArrayBuffer): { pixels: Uint8ClampedArray; width: number; height: number } {
    const data = new Uint8Array(buffer);
    const view = new DataView(buffer);

    if (data[0] !== 0x42 || data[1] !== 0x4D) {
        throw new Error('Invalid BMP signature');
    }

    const dataOffset = view.getUint32(10, true);
    const width = view.getInt32(18, true);
    const height = view.getInt32(22, true);
    const bitsPerPixel = view.getUint16(28, true);

    if (bitsPerPixel !== 24 && bitsPerPixel !== 32) {
        throw new Error(`Unsupported BMP bit depth: ${bitsPerPixel}`);
    }

    const bytesPerPixel = bitsPerPixel / 8;
    const absHeight = Math.abs(height);
    const isTopDown = height < 0;
    const rowSize = Math.ceil((width * bytesPerPixel) / 4) * 4;

    const pixels = new Uint8ClampedArray(width * absHeight * 4);

    for (let y = 0; y < absHeight; y++) {
        const srcY = isTopDown ? y : (absHeight - 1 - y);
        const rowOffset = dataOffset + srcY * rowSize;

        for (let x = 0; x < width; x++) {
            const srcOffset = rowOffset + x * bytesPerPixel;
            const dstOffset = (y * width + x) * 4;

            pixels[dstOffset + 2] = data[srcOffset];     // B -> R
            pixels[dstOffset + 1] = data[srcOffset + 1]; // G -> G
            pixels[dstOffset] = data[srcOffset + 2];     // R -> B
            pixels[dstOffset + 3] = bytesPerPixel === 4 ? data[srcOffset + 3] : 255;
        }
    }

    return { pixels, width, height: absHeight };
}

function encodeBMP(pixels: Uint8ClampedArray, width: number, height: number): ArrayBuffer {
    const bytesPerPixel = 4;
    const rowSize = width * bytesPerPixel;
    const pixelDataSize = rowSize * height;
    const headerSize = 54;
    const fileSize = headerSize + pixelDataSize;

    const buffer = new ArrayBuffer(fileSize);
    const data = new Uint8Array(buffer);
    const view = new DataView(buffer);

    // BMP File Header
    data[0] = 0x42; data[1] = 0x4D;
    view.setUint32(2, fileSize, true);
    view.setUint32(6, 0, true);
    view.setUint32(10, headerSize, true);

    // DIB Header
    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, -height, true); // Negative = top-down
    view.setUint16(26, 1, true);
    view.setUint16(28, 32, true);
    view.setUint32(30, 0, true);
    view.setUint32(34, pixelDataSize, true);
    view.setUint32(38, 2835, true);
    view.setUint32(42, 2835, true);
    view.setUint32(46, 0, true);
    view.setUint32(50, 0, true);

    // Pixel data
    let offset = headerSize;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcOffset = (y * width + x) * 4;
            data[offset] = pixels[srcOffset + 2];     // B
            data[offset + 1] = pixels[srcOffset + 1]; // G
            data[offset + 2] = pixels[srcOffset];     // R
            data[offset + 3] = pixels[srcOffset + 3]; // A
            offset += 4;
        }
    }

    return buffer;
}

// =============== WAV CODEC ===============

function decodeWAV(buffer: ArrayBuffer): { samples: Int16Array; sampleRate: number; channels: number } {
    const data = new Uint8Array(buffer);
    const view = new DataView(buffer);

    const riff = String.fromCharCode(data[0], data[1], data[2], data[3]);
    if (riff !== 'RIFF') throw new Error('Invalid WAV: missing RIFF');

    const wave = String.fromCharCode(data[8], data[9], data[10], data[11]);
    if (wave !== 'WAVE') throw new Error('Invalid WAV: missing WAVE');

    let offset = 12;
    let sampleRate = 0, channels = 0, bitsPerSample = 0;
    let dataOffset = 0, dataSize = 0;

    while (offset < data.length) {
        const chunkId = String.fromCharCode(data[offset], data[offset + 1], data[offset + 2], data[offset + 3]);
        const chunkSize = view.getUint32(offset + 4, true);
        offset += 8;

        if (chunkId === 'fmt ') {
            const audioFormat = view.getUint16(offset, true);
            if (audioFormat !== 1) throw new Error('Only PCM WAV supported');
            channels = view.getUint16(offset + 2, true);
            sampleRate = view.getUint32(offset + 4, true);
            bitsPerSample = view.getUint16(offset + 14, true);
            if (bitsPerSample !== 16) throw new Error('Only 16-bit WAV supported');
        } else if (chunkId === 'data') {
            dataOffset = offset;
            dataSize = chunkSize;
        }

        offset += chunkSize;
        if (chunkSize % 2 !== 0) offset++;
    }

    const numSamples = dataSize / 2;
    const samples = new Int16Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
        samples[i] = view.getInt16(dataOffset + i * 2, true);
    }

    return { samples, sampleRate, channels };
}

function encodeWAV(samples: Int16Array, sampleRate: number, channels: number): ArrayBuffer {
    const dataSize = samples.length * 2;
    const fileSize = 44 + dataSize;
    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);
    const data = new Uint8Array(buffer);

    // RIFF header
    data.set([0x52, 0x49, 0x46, 0x46], 0); // "RIFF"
    view.setUint32(4, fileSize - 8, true);
    data.set([0x57, 0x41, 0x56, 0x45], 8); // "WAVE"

    // fmt chunk
    data.set([0x66, 0x6D, 0x74, 0x20], 12); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);

    // data chunk
    data.set([0x64, 0x61, 0x74, 0x61], 36); // "data"
    view.setUint32(40, dataSize, true);

    for (let i = 0; i < samples.length; i++) {
        view.setInt16(44 + i * 2, samples[i], true);
    }

    return buffer;
}

function embedWAVData(
    samples: Int16Array,
    payload: ArrayBuffer,
    lsbDepth: number,
    onProgress: (p: number) => void
): Int16Array {
    const payloadBytes = new Uint8Array(payload);

    // Build full message: MAGIC (4) + LENGTH (4) + DATA
    const fullMessage = new Uint8Array(8 + payloadBytes.length);
    fullMessage.set(MAGIC_HEADER, 0);
    const lengthView = new DataView(fullMessage.buffer);
    lengthView.setUint32(4, payloadBytes.length, false);
    fullMessage.set(payloadBytes, 8);

    // Convert to bits
    const bits: number[] = [];
    for (const byte of fullMessage) {
        for (let i = 7; i >= 0; i--) {
            bits.push((byte >> i) & 1);
        }
    }

    const availableBits = samples.length * lsbDepth;
    if (bits.length > availableBits) {
        throw new Error(`Payload too large. Need ${bits.length} bits, have ${availableBits}`);
    }

    const output = new Int16Array(samples.length);
    output.set(samples);

    const mask = 0xFFFF << lsbDepth;
    let bitIndex = 0;
    const progressInterval = Math.floor(samples.length / 20);

    for (let i = 0; i < samples.length && bitIndex < bits.length; i++) {
        if (i % progressInterval === 0) {
            onProgress((bitIndex / bits.length) * 100);
        }

        let newValue = output[i] & mask;
        for (let d = lsbDepth - 1; d >= 0 && bitIndex < bits.length; d--) {
            newValue |= bits[bitIndex++] << d;
        }
        output[i] = newValue;
    }

    return output;
}

function extractWAVData(
    samples: Int16Array,
    lsbDepth: number,
    onProgress: (p: number) => void
): ArrayBuffer | null {
    const totalBits = samples.length * lsbDepth;
    if (totalBits < 64) return null;

    const bits: number[] = [];
    const progressInterval = Math.floor(samples.length / 10);

    for (let i = 0; i < samples.length && bits.length < totalBits; i++) {
        if (i % progressInterval === 0) {
            onProgress((i / samples.length) * 50);
        }
        for (let d = lsbDepth - 1; d >= 0; d--) {
            bits.push((samples[i] >> d) & 1);
        }
    }

    // Check magic
    const magicBytes = new Uint8Array(4);
    for (let i = 0; i < 4; i++) {
        let byte = 0;
        for (let j = 0; j < 8; j++) {
            byte |= bits[i * 8 + j] << (7 - j);
        }
        magicBytes[i] = byte;
    }

    for (let i = 0; i < 4; i++) {
        if (magicBytes[i] !== MAGIC_HEADER[i]) return null;
    }

    // Extract length
    const lengthBytes = new Uint8Array(4);
    for (let i = 0; i < 4; i++) {
        let byte = 0;
        for (let j = 0; j < 8; j++) {
            byte |= bits[32 + i * 8 + j] << (7 - j);
        }
        lengthBytes[i] = byte;
    }
    const payloadLength = new DataView(lengthBytes.buffer).getUint32(0, false);

    const maxBytes = Math.floor((bits.length - 64) / 8);
    if (payloadLength <= 0 || payloadLength > maxBytes) return null;

    onProgress(60);

    // Extract payload
    const payload = new Uint8Array(payloadLength);
    for (let i = 0; i < payloadLength; i++) {
        if (i % 1000 === 0) {
            onProgress(60 + (i / payloadLength) * 40);
        }
        let byte = 0;
        for (let j = 0; j < 8; j++) {
            const bitIdx = 64 + i * 8 + j;
            if (bitIdx < bits.length) {
                byte |= bits[bitIdx] << (7 - j);
            }
        }
        payload[i] = byte;
    }

    return payload.buffer;
}

// =============== MESSAGE HANDLER ===============

self.onmessage = async (event: MessageEvent<StegRequest>) => {
    const { type, id, data } = event.data;

    try {
        sendProgress(id, 0, 'steg', 'Starting...');

        switch (type) {
            case 'EMBED_IMAGE': {
                sendProgress(id, 10, 'steg', 'Decoding image...');
                let pixels: Uint8ClampedArray, width: number, height: number;

                if (data.format === 'bmp') {
                    const decoded = decodeBMP(data.carrier);
                    pixels = decoded.pixels;
                    width = decoded.width;
                    height = decoded.height;
                } else {
                    throw new Error('PNG decoding in worker not implemented - use main thread');
                }

                sendProgress(id, 30, 'steg', 'Embedding data...');
                const embedded = embedImageData(
                    pixels, width, height,
                    data.payload, data.lsbDepth,
                    (p) => sendProgress(id, 30 + p * 0.5, 'steg', 'Embedding...')
                );

                sendProgress(id, 80, 'steg', 'Encoding output...');
                const output = encodeBMP(embedded, width, height);

                sendProgress(id, 100, 'steg', 'Complete');
                sendComplete(id, output);
                break;
            }

            case 'EMBED_AUDIO': {
                sendProgress(id, 10, 'steg', 'Decoding audio...');
                const { samples, sampleRate, channels } = decodeWAV(data.carrier);

                sendProgress(id, 30, 'steg', 'Embedding data...');
                const embedded = embedWAVData(
                    samples, data.payload, data.lsbDepth,
                    (p) => sendProgress(id, 30 + p * 0.5, 'steg', 'Embedding...')
                );

                sendProgress(id, 80, 'steg', 'Encoding output...');
                const output = encodeWAV(embedded, sampleRate, channels);

                sendProgress(id, 100, 'steg', 'Complete');
                sendComplete(id, output);
                break;
            }

            case 'EXTRACT_IMAGE': {
                sendProgress(id, 10, 'steg', 'Decoding image...');
                let pixels: Uint8ClampedArray, width: number, height: number;

                if (data.format === 'bmp') {
                    const decoded = decodeBMP(data.carrier);
                    pixels = decoded.pixels;
                    width = decoded.width;
                    height = decoded.height;
                } else {
                    throw new Error('PNG decoding in worker not implemented - use main thread');
                }

                sendProgress(id, 30, 'steg', 'Extracting data...');
                const extracted = extractImageData(
                    pixels, width, height, data.lsbDepth,
                    (p) => sendProgress(id, 30 + p * 0.7, 'steg', 'Extracting...')
                );

                if (!extracted) {
                    throw new Error('No hidden data found or wrong LSB depth');
                }

                sendProgress(id, 100, 'steg', 'Complete');
                sendComplete(id, extracted);
                break;
            }

            case 'EXTRACT_AUDIO': {
                sendProgress(id, 10, 'steg', 'Decoding audio...');
                const { samples } = decodeWAV(data.carrier);

                sendProgress(id, 30, 'steg', 'Extracting data...');
                const extracted = extractWAVData(
                    samples, data.lsbDepth,
                    (p) => sendProgress(id, 30 + p * 0.7, 'steg', 'Extracting...')
                );

                if (!extracted) {
                    throw new Error('No hidden data found or wrong LSB depth');
                }

                sendProgress(id, 100, 'steg', 'Complete');
                sendComplete(id, extracted);
                break;
            }

            default:
                throw new Error(`Unknown request type: ${type}`);
        }
    } catch (error) {
        sendError(id, error instanceof Error ? error.message : 'Unknown error', 'STEG_ERROR');
    }
};
