// Utility to package payload with metadata (filename, type) before encryption

export interface PayloadMetadata {
    type: 'text' | 'file';
    name?: string; // filename for files
    mimeType?: string; // MIME type for files
    timestamp: number;
}

const METADATA_VERSION = 1;
const MAX_METADATA_LENGTH = 10 * 1024; // 10KB max for metadata JSON
const MAX_FILENAME_LENGTH = 255; // Standard filesystem limit

/**
 * Packs payload data with metadata into a single buffer
 * Format:
 * [Version (1 byte)]
 * [Metadata Length (4 bytes UI32)]
 * [Metadata JSON (UTF-8 bytes)]
 * [Payload Data]
 */
export function packPayload(
    data: ArrayBuffer,
    metadata: PayloadMetadata
): ArrayBuffer {
    // Security: Sanitize metadata before packing
    const sanitizedMeta: PayloadMetadata = {
        type: metadata.type === 'text' ? 'text' : 'file',
        timestamp: typeof metadata.timestamp === 'number' ? metadata.timestamp : Date.now(),
    };

    if (metadata.name && typeof metadata.name === 'string') {
        // Limit filename length and remove potentially dangerous characters
        sanitizedMeta.name = metadata.name.slice(0, MAX_FILENAME_LENGTH).replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_');
    }
    if (metadata.mimeType && typeof metadata.mimeType === 'string') {
        // Basic MIME type validation
        sanitizedMeta.mimeType = metadata.mimeType.slice(0, 100);
    }

    const metaString = JSON.stringify(sanitizedMeta);
    const metaBytes = new TextEncoder().encode(metaString);

    // Security: Enforce max metadata size
    if (metaBytes.length > MAX_METADATA_LENGTH) {
        throw new Error('Metadata too large');
    }

    // Calculate total size
    // 1 byte version + 4 bytes meta length + meta bytes + data bytes
    const totalSize = 1 + 4 + metaBytes.length + data.byteLength;
    const buffer = new Uint8Array(totalSize);
    const view = new DataView(buffer.buffer);

    let offset = 0;

    // Version
    buffer[offset] = METADATA_VERSION;
    offset += 1;

    // Metadata Length
    view.setUint32(offset, metaBytes.length, true); // Little endian
    offset += 4;

    // Metadata
    buffer.set(metaBytes, offset);
    offset += metaBytes.length;

    // Payload
    buffer.set(new Uint8Array(data), offset);

    return buffer.buffer;
}

export interface UnpackedPayload {
    data: ArrayBuffer;
    metadata: PayloadMetadata;
}

/**
 * Validates that metadata has required fields with correct types
 */
function isValidMetadata(obj: unknown): obj is PayloadMetadata {
    if (typeof obj !== 'object' || obj === null) return false;
    const meta = obj as Record<string, unknown>;

    // Required: type must be 'text' or 'file'
    if (meta.type !== 'text' && meta.type !== 'file') return false;

    // Required: timestamp must be a number
    if (typeof meta.timestamp !== 'number') return false;

    // Optional: name must be string if present
    if (meta.name !== undefined && typeof meta.name !== 'string') return false;

    // Optional: mimeType must be string if present
    if (meta.mimeType !== undefined && typeof meta.mimeType !== 'string') return false;

    return true;
}

/**
 * Unpacks payload data and metadata
 * throws Error if format is invalid
 */
export function unpackPayload(buffer: ArrayBuffer): UnpackedPayload {
    const data = new Uint8Array(buffer);
    const view = new DataView(buffer);
    let offset = 0;

    // Security: Validate minimum header size (1 version + 4 length)
    const MIN_HEADER_SIZE = 5;
    if (data.length < MIN_HEADER_SIZE) {
        throw new Error('Invalid payload format');
    }

    // Version
    const version = data[offset];
    offset += 1;

    if (version !== METADATA_VERSION) {
        // Legacy payload - return raw data with default metadata
        return {
            data: buffer,
            metadata: { type: 'file', timestamp: Date.now(), name: 'recovered_data.bin' }
        };
    }

    // Metadata Length
    const metaLen = view.getUint32(offset, true);
    offset += 4;

    // Security: Validate metadata length bounds
    if (metaLen <= 0 || metaLen > MAX_METADATA_LENGTH) {
        throw new Error('Invalid payload format');
    }

    // Security: Bounds check
    if (offset + metaLen > data.length) {
        throw new Error('Invalid payload format');
    }

    // Metadata
    const metaBytes = data.slice(offset, offset + metaLen);
    offset += metaLen;

    let metadata: PayloadMetadata;
    try {
        const metaString = new TextDecoder().decode(metaBytes);
        const parsed = JSON.parse(metaString);

        // Security: Validate metadata schema
        if (!isValidMetadata(parsed)) {
            throw new Error('Invalid metadata schema');
        }

        metadata = parsed;

        // Security: Sanitize filename if present
        if (metadata.name) {
            metadata.name = metadata.name.slice(0, MAX_FILENAME_LENGTH).replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_');
        }
    } catch (e) {
        throw new Error('Invalid payload format');
    }

    // Payload
    const payloadData = buffer.slice(offset);

    return {
        data: payloadData,
        metadata
    };
}

