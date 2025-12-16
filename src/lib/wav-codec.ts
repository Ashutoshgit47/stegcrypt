// Pure JavaScript WAV Encoder/Decoder for lossless steganography
// Bypasses browser AudioContext to prevent sample modification

export interface WavData {
    samples: Int16Array;  // Interleaved 16-bit samples
    sampleRate: number;
    channels: number;
    bitsPerSample: number;
}

/**
 * Decode WAV file to raw samples without browser processing
 * This ensures bit-perfect reading of LSB embedded data
 * Throws descriptive errors for corrupted/invalid files
 */
export function decodeWav(buffer: ArrayBuffer): WavData {
    const data = new Uint8Array(buffer);
    const view = new DataView(buffer);

    // Minimum WAV size: 44 bytes (standard WAV header)
    const MIN_WAV_SIZE = 44;
    if (buffer.byteLength < MIN_WAV_SIZE) {
        throw new Error('Invalid WAV file: file too small (corrupted or truncated)');
    }

    // Verify RIFF header
    const riff = String.fromCharCode(data[0], data[1], data[2], data[3]);
    if (riff !== 'RIFF') {
        throw new Error('Invalid WAV file: missing RIFF header');
    }

    const wave = String.fromCharCode(data[8], data[9], data[10], data[11]);
    if (wave !== 'WAVE') {
        throw new Error('Invalid WAV file: missing WAVE marker');
    }

    // Parse chunks
    let offset = 12;
    let sampleRate = 0;
    let channels = 0;
    let bitsPerSample = 0;
    let dataOffset = 0;
    let dataSize = 0;

    while (offset < data.length) {
        const chunkId = String.fromCharCode(
            data[offset], data[offset + 1], data[offset + 2], data[offset + 3]
        );
        const chunkSize = view.getUint32(offset + 4, true);
        offset += 8;

        if (chunkId === 'fmt ') {
            const audioFormat = view.getUint16(offset, true);
            if (audioFormat !== 1) {
                throw new Error(`Unsupported audio format: ${audioFormat}. Only PCM (1) is supported.`);
            }
            channels = view.getUint16(offset + 2, true);
            sampleRate = view.getUint32(offset + 4, true);
            // byteRate = view.getUint32(offset + 8, true);
            // blockAlign = view.getUint16(offset + 12, true);
            bitsPerSample = view.getUint16(offset + 14, true);

            if (bitsPerSample !== 16) {
                throw new Error(`Unsupported bit depth: ${bitsPerSample}. Only 16-bit is supported.`);
            }
        } else if (chunkId === 'data') {
            dataOffset = offset;
            dataSize = chunkSize;
        }

        offset += chunkSize;
        // Word alignment
        if (chunkSize % 2 !== 0) offset++;
    }

    if (dataOffset === 0 || sampleRate === 0) {
        throw new Error('Invalid WAV file: missing fmt or data chunk');
    }

    // Read samples directly as Int16
    const numSamples = dataSize / 2;
    const samples = new Int16Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
        samples[i] = view.getInt16(dataOffset + i * 2, true);
    }

    return {
        samples,
        sampleRate,
        channels,
        bitsPerSample
    };
}

/**
 * Encode samples to WAV format
 */
export function encodeWav(wavData: WavData): Blob {
    const { samples, sampleRate, channels, bitsPerSample } = wavData;

    const headerSize = 44;
    const dataSize = samples.length * 2; // 16-bit = 2 bytes per sample
    const fileSize = headerSize + dataSize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);
    const data = new Uint8Array(buffer);

    // RIFF header
    writeString(data, 0, 'RIFF');
    view.setUint32(4, fileSize - 8, true);
    writeString(data, 8, 'WAVE');

    // fmt chunk
    writeString(data, 12, 'fmt ');
    view.setUint32(16, 16, true); // Chunk size
    view.setUint16(20, 1, true);  // PCM format
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true); // Byte rate
    view.setUint16(32, channels * 2, true); // Block align
    view.setUint16(34, bitsPerSample, true);

    // data chunk
    writeString(data, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write audio samples
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
        view.setInt16(offset, samples[i], true);
        offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(arr: Uint8Array, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
        arr[offset + i] = str.charCodeAt(i);
    }
}

// Magic header for detecting embedded data
const MAGIC_HEADER = new Uint8Array([0x53, 0x54, 0x45, 0x47]); // "STEG"

export interface AudioAnalysis {
    duration: number;
    sampleRate: number;
    channels: number;
    samples: number;
    maxCapacityBytes: number;
    format: string;
}

/**
 * Analyze WAV capacity for steganography
 */
export function analyzeWavCapacity(wavData: WavData, lsbDepth: number = 1): AudioAnalysis {
    const totalSamples = wavData.samples.length;
    const bitsPerSample = lsbDepth;
    const maxCapacityBits = totalSamples * bitsPerSample;
    const maxCapacityBytes = Math.floor(maxCapacityBits / 8) - 8; // Minus header

    return {
        duration: totalSamples / wavData.channels / wavData.sampleRate,
        sampleRate: wavData.sampleRate,
        channels: wavData.channels,
        samples: totalSamples,
        maxCapacityBytes: Math.max(0, maxCapacityBytes),
        format: 'WAV'
    };
}

/**
 * Embed data into WAV samples using LSB
 */
export function embedWavData(
    wavData: WavData,
    payload: ArrayBuffer,
    lsbDepth: number = 1
): WavData {
    const samples = new Int16Array(wavData.samples.length);
    // Copy original samples
    for (let i = 0; i < wavData.samples.length; i++) {
        samples[i] = wavData.samples[i];
    }

    const payloadBytes = new Uint8Array(payload);

    // Build full message: MAGIC (4) + LENGTH (4) + DATA
    const fullMessage = new Uint8Array(8 + payloadBytes.length);
    fullMessage.set(MAGIC_HEADER, 0);
    const lengthView = new DataView(fullMessage.buffer);
    lengthView.setUint32(4, payloadBytes.length, false); // Big endian
    fullMessage.set(payloadBytes, 8);

    // Convert to bits
    const bits: number[] = [];
    for (const byte of fullMessage) {
        for (let i = 7; i >= 0; i--) {
            bits.push((byte >> i) & 1);
        }
    }

    // Check capacity
    const availableBits = samples.length * lsbDepth;
    if (bits.length > availableBits) {
        throw new Error(`Payload too large. Need ${bits.length} bits, have ${availableBits}`);
    }

    // Create LSB mask for 16-bit samples
    const mask = 0xFFFF << lsbDepth;

    let bitIndex = 0;
    for (let i = 0; i < samples.length && bitIndex < bits.length; i++) {
        // Clear LSBs and set new value
        let newValue = samples[i] & mask;
        for (let d = lsbDepth - 1; d >= 0 && bitIndex < bits.length; d--) {
            newValue |= bits[bitIndex++] << d;
        }
        samples[i] = newValue;
    }

    return {
        samples,
        sampleRate: wavData.sampleRate,
        channels: wavData.channels,
        bitsPerSample: wavData.bitsPerSample
    };
}

/**
 * Extract data from WAV samples
 */
export function extractWavData(
    wavData: WavData,
    lsbDepth: number = 1
): ArrayBuffer | null {
    const samples = wavData.samples;
    const totalBits = samples.length * lsbDepth;

    // We need at least 64 bits for header
    if (totalBits < 64) {
        return null;
    }

    // Extract bits
    const bits: number[] = [];
    for (let i = 0; i < samples.length && bits.length < totalBits; i++) {
        for (let d = lsbDepth - 1; d >= 0; d--) {
            bits.push((samples[i] >> d) & 1);
        }
    }

    // Convert bits to bytes for magic check (first 32 bits = 4 bytes)
    const magicBytes = new Uint8Array(4);
    for (let i = 0; i < 4; i++) {
        let byte = 0;
        for (let j = 0; j < 8; j++) {
            byte |= bits[i * 8 + j] << (7 - j);
        }
        magicBytes[i] = byte;
    }

    // Check magic header
    for (let i = 0; i < 4; i++) {
        if (magicBytes[i] !== MAGIC_HEADER[i]) {
            return null; // Not our data
        }
    }

    // Extract length (next 32 bits = 4 bytes, big endian)
    const lengthBytes = new Uint8Array(4);
    for (let i = 0; i < 4; i++) {
        let byte = 0;
        for (let j = 0; j < 8; j++) {
            byte |= bits[32 + i * 8 + j] << (7 - j);
        }
        lengthBytes[i] = byte;
    }
    const payloadLength = new DataView(lengthBytes.buffer).getUint32(0, false);

    // Sanity check
    const maxPossibleBytes = Math.floor((bits.length - 64) / 8);
    if (payloadLength <= 0 || payloadLength > maxPossibleBytes) {
        return null;
    }

    // Extract payload bytes
    const payload = new Uint8Array(payloadLength);
    for (let i = 0; i < payloadLength; i++) {
        let byte = 0;
        for (let j = 0; j < 8; j++) {
            const bitIndex = 64 + i * 8 + j;
            if (bitIndex < bits.length) {
                byte |= bits[bitIndex] << (7 - j);
            }
        }
        payload[i] = byte;
    }

    return payload.buffer;
}
