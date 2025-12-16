// Crypto Worker - Handles encryption/decryption in background thread
// Uses PBKDF2 for key derivation (Argon2 disabled due to WASM issues)

import type {
    CryptoWorkerRequest,
    ProgressMessage,
    CompleteMessage,
    ErrorMessage
} from './worker-types';

const activeJobs = new Map<string, boolean>();

// Flag masks
const FLAG_COMPRESSED = 1;    // Bit 0: Data is compressed
const FLAG_HIGH_SECURITY = 2; // Bit 1: Use 310K PBKDF2 iterations (vs 100K)

async function deriveKeyPBKDF2(
    password: string,
    salt: Uint8Array,
    iterations: number = 100000
): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const baseKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt as BufferSource,
            iterations,
            hash: 'SHA-256',
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function compressData(data: ArrayBuffer): Promise<ArrayBuffer> {
    if (typeof CompressionStream === 'undefined') return data;

    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    writer.write(new Uint8Array(data));
    writer.close();

    const chunks: Uint8Array[] = [];
    const reader = stream.readable.getReader();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }

    return result.buffer;
}

async function decompressData(data: ArrayBuffer): Promise<ArrayBuffer> {
    if (typeof DecompressionStream === 'undefined') return data;

    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    writer.write(new Uint8Array(data));
    writer.close();

    const chunks: Uint8Array[] = [];
    const reader = stream.readable.getReader();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }

    return result.buffer;
}

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
    } as CompleteMessage, [result]);
}

function sendError(id: string, message: string, code?: string) {
    self.postMessage({
        type: 'ERROR',
        id,
        data: { message, code }
    });
}

async function handleEncrypt(
    id: string,
    payload: ArrayBuffer,
    password: string,
    useHighSecurity: boolean, // Uses higher PBKDF2 iterations for stronger security
    compress: boolean
) {
    if (!activeJobs.get(id)) return;

    try {
        sendProgress(id, 10, 'encrypt', 'Preparing data...');

        let dataToEncrypt = payload;
        if (compress) {
            sendProgress(id, 20, 'encrypt', 'Compressing...');
            dataToEncrypt = await compressData(payload);
        }

        if (!activeJobs.get(id)) return;

        // Use higher iterations for "high security" mode
        const iterations = useHighSecurity ? 310000 : 100000;
        sendProgress(id, 40, 'encrypt', `Generating keys (PBKDF2 ${iterations / 1000}K)...`);

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await deriveKeyPBKDF2(password, salt, iterations);

        if (!activeJobs.get(id)) return;

        sendProgress(id, 70, 'encrypt', 'Encrypting...');

        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            dataToEncrypt
        );

        sendProgress(id, 90, 'encrypt', 'Packing...');

        // Set flags
        let flagsByte = 0;
        if (compress) flagsByte |= FLAG_COMPRESSED;
        if (useHighSecurity) flagsByte |= FLAG_HIGH_SECURITY; // Mark high security mode

        const flags = new Uint8Array([flagsByte]);
        const saltLenBytes = new Uint8Array(4);
        new DataView(saltLenBytes.buffer).setUint32(0, salt.length, true);

        const totalSize = 1 + 4 + salt.length + iv.length + ciphertext.byteLength;
        const packed = new Uint8Array(totalSize);
        let offset = 0;

        packed.set(flags, offset); offset += 1;
        packed.set(saltLenBytes, offset); offset += 4;
        packed.set(salt, offset); offset += salt.length;
        packed.set(iv, offset); offset += iv.length;
        packed.set(new Uint8Array(ciphertext), offset);

        sendProgress(id, 100, 'encrypt', 'Complete');
        sendComplete(id, packed.buffer);

    } catch (error) {
        sendError(id, error instanceof Error ? error.message : 'Encryption failed', 'ENCRYPT_ERROR');
    } finally {
        activeJobs.delete(id);
    }
}

async function handleDecrypt(
    id: string,
    packedData: ArrayBuffer,
    password: string
) {
    if (!activeJobs.get(id)) return;

    // Security: Use uniform error message for all failures to prevent timing attacks
    const GENERIC_ERROR = 'Decryption failed - wrong password or corrupted data';

    try {
        sendProgress(id, 10, 'decrypt', 'Unpacking data...');

        const data = new Uint8Array(packedData);

        // Security: Validate minimum data length before any parsing
        // Minimum: 1 (flags) + 4 (salt len) + 16 (salt) + 12 (IV) + 16 (auth tag) = 49 bytes
        const MIN_DATA_LENGTH = 49;
        if (data.length < MIN_DATA_LENGTH) {
            throw new Error(GENERIC_ERROR);
        }

        let offset = 0;

        // Read flags
        const flags = data[offset]; offset += 1;
        const isCompressed = (flags & FLAG_COMPRESSED) !== 0;
        const isHighSecurity = (flags & FLAG_HIGH_SECURITY) !== 0;

        // Security: Use DataView for safe integer parsing (little-endian)
        const saltLenView = new DataView(data.buffer, data.byteOffset + offset, 4);
        const saltLen = saltLenView.getUint32(0, true);
        offset += 4;

        // Security: Strict salt length validation - must be exactly 16 bytes
        const EXPECTED_SALT_LENGTH = 16;
        if (saltLen !== EXPECTED_SALT_LENGTH) {
            throw new Error(GENERIC_ERROR);
        }

        // Security: Bounds check before slice
        if (offset + saltLen > data.length) {
            throw new Error(GENERIC_ERROR);
        }
        const salt = data.slice(offset, offset + saltLen); offset += saltLen;

        // Security: Validate IV bounds (12 bytes for AES-GCM)
        const IV_LENGTH = 12;
        if (offset + IV_LENGTH > data.length) {
            throw new Error(GENERIC_ERROR);
        }
        const iv = data.slice(offset, offset + IV_LENGTH); offset += IV_LENGTH;

        // Security: Validate ciphertext has minimum length (at least auth tag = 16 bytes)
        const MIN_CIPHERTEXT_LENGTH = 16; // AES-GCM auth tag
        if (offset + MIN_CIPHERTEXT_LENGTH > data.length) {
            throw new Error(GENERIC_ERROR);
        }
        const encryptedData = data.slice(offset);

        if (!activeJobs.get(id)) return;

        // Use matching iterations based on flag
        const iterations = isHighSecurity ? 310000 : 100000;
        sendProgress(id, 30, 'decrypt', `Deriving key (PBKDF2 ${iterations / 1000}K)...`);

        const key = await deriveKeyPBKDF2(password, salt, iterations);

        if (!activeJobs.get(id)) return;

        sendProgress(id, 60, 'decrypt', 'Decrypting...');

        const plaintext = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv as BufferSource },
            key,
            encryptedData
        );

        sendProgress(id, 80, 'decrypt', 'Processing...');

        let result = plaintext;
        if (isCompressed) {
            sendProgress(id, 85, 'decrypt', 'Decompressing...');
            result = await decompressData(plaintext);
        }

        sendProgress(id, 100, 'decrypt', 'Complete');
        sendComplete(id, result);

    } catch (error) {
        // Security: Always return generic error to prevent timing/oracle attacks
        sendError(id, GENERIC_ERROR, 'DECRYPT_ERROR');
    } finally {
        activeJobs.delete(id);
    }
}

self.onmessage = (event: MessageEvent<CryptoWorkerRequest>) => {
    const request = event.data;
    const { type, id } = request;

    switch (type) {
        case 'ENCRYPT': {
            const req = request as import('./worker-types').EncryptRequest;
            activeJobs.set(id, true);
            handleEncrypt(
                id,
                req.data.payload,
                req.data.password,
                req.data.useArgon2,
                req.data.compress
            );
            break;
        }

        case 'DECRYPT': {
            const req = request as import('./worker-types').DecryptRequest;
            activeJobs.set(id, true);
            handleDecrypt(
                id,
                req.data.ciphertext,
                req.data.password
            );
            break;
        }

        case 'CANCEL':
            activeJobs.set(id, false);
            break;
    }
};

export { };
