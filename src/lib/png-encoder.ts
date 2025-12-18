// Utility to encode/decode raw image data to/from PNG using pure JavaScript
// This avoids browser canvas noise/gamma correction issues

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
}

// Update CRC32 with new data
function updateCrc(crc: number, buf: Uint8Array): number {
    let c = crc;
    for (let i = 0; i < buf.length; i++) {
        c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    }
    return c;
}

// Convert 32-bit int to 4-byte big-endian array
function int32ToBytes(val: number): Uint8Array {
    return new Uint8Array([
        (val >>> 24) & 0xFF,
        (val >>> 16) & 0xFF,
        (val >>> 8) & 0xFF,
        val & 0xFF
    ]);
}

async function compress(data: Uint8Array): Promise<Uint8Array> {
    const stream = new CompressionStream('deflate');
    const writer = stream.writable.getWriter();
    writer.write(data);
    writer.close();

    const chunks: Uint8Array[] = [];
    const reader = stream.readable.getReader();
    let totalLength = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalLength += value.length;
    }

    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result;
}

async function decompress(data: Uint8Array): Promise<Uint8Array> {
    const stream = new DecompressionStream('deflate');
    const writer = stream.writable.getWriter();
    writer.write(data);
    writer.close();

    const chunks: Uint8Array[] = [];
    const reader = stream.readable.getReader();
    let totalLength = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalLength += value.length;
    }

    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result;
}

export async function encodePNG(
    pixels: Uint8ClampedArray,
    width: number,
    height: number
): Promise<Blob> {
    const parts: BlobPart[] = [];

    // PNG Signature
    parts.push(new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));

    // IHDR Chunk
    const ihdrData = new Uint8Array(13);
    const view = new DataView(ihdrData.buffer);
    view.setUint32(0, width, false);
    view.setUint32(4, height, false);
    view.setUint8(8, 8); // Bit depth: 8
    view.setUint8(9, 6); // Color type: 6 (Truecolor with alpha)
    view.setUint8(10, 0);
    view.setUint8(11, 0);
    view.setUint8(12, 0);

    writeChunk(parts, 'IHDR', ihdrData);

    const rowSize = width * 4;
    const rawSize = (rowSize + 1) * height;
    const rawData = new Uint8Array(rawSize);

    for (let y = 0; y < height; y++) {
        // Filter byte 0 (None) implicit (array initialized to 0)
        const sourceOffset = y * rowSize;
        const targetOffset = y * (rowSize + 1) + 1;
        const row = pixels.subarray(sourceOffset, sourceOffset + rowSize);
        rawData.set(row, targetOffset);
    }

    const compressedData = await compress(rawData);
    writeChunk(parts, 'IDAT', compressedData);
    writeChunk(parts, 'IEND', new Uint8Array(0));

    return new Blob(parts, { type: 'image/png' });
}

export async function decodePNG(buffer: ArrayBuffer): Promise<ImageData> {
    const data = new Uint8Array(buffer);
    let offset = 8; // Skip signature

    // Verify signature
    if (data[0] !== 0x89 || data[1] !== 0x50 || data[2] !== 0x4E || data[3] !== 0x47) {
        throw new Error('Invalid PNG signature');
    }

    let width = 0, height = 0;
    let depth = 0, colorType = 0, compression = 0, filter = 0, interlace = 0;
    const idatChunks: Uint8Array[] = [];
    let idatTotalSize = 0;

    while (offset < data.length) {
        const view = new DataView(data.buffer, offset);
        const length = view.getUint32(0, false);
        offset += 4;

        const type = String.fromCharCode(
            data[offset], data[offset + 1], data[offset + 2], data[offset + 3]
        );
        offset += 4;

        if (type === 'IHDR') {
            const chunkData = new DataView(data.buffer, offset);
            width = chunkData.getUint32(0, false);
            height = chunkData.getUint32(4, false);
            depth = chunkData.getUint8(8);
            colorType = chunkData.getUint8(9);
            compression = chunkData.getUint8(10);
            filter = chunkData.getUint8(11);
            interlace = chunkData.getUint8(12);
        } else if (type === 'IDAT') {
            const chunkData = data.slice(offset, offset + length);
            idatChunks.push(chunkData);
            idatTotalSize += length;
        } else if (type === 'IEND') {
            break;
        }

        offset += length;
        offset += 4; // Skip CRC
    }

    if (width === 0 || height === 0) throw new Error('Invalid PNG dimensions');
    // Only support Truecolor (2 or 6) with generic depth for now. 
    // Just blindly assume compatible structure if Filter 0 is used.

    // Reconstruct valid Zlib stream from IDATs
    const zlibStream = new Uint8Array(idatTotalSize);
    let zOffset = 0;
    for (const chunk of idatChunks) {
        zlibStream.set(chunk, zOffset);
        zOffset += chunk.length;
    }

    const decompressed = await decompress(zlibStream);
    const bytesPerPixel = 4; // For Truecolor+Alpha
    // Note: Actual bpp depends on ColorType. 
    // Type 6 (Truecolor+Alpha) = 4 bytes. Type 2 (Truecolor) = 3 bytes.
    let channels = 4;
    if (colorType === 2) channels = 3;

    const filterRowSize = (width * channels);
    const pixels = new Uint8ClampedArray(width * height * 4);

    // Paeth predictor function
    function paethPredictor(a: number, b: number, c: number): number {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        if (pa <= pb && pa <= pc) return a;
        if (pb <= pc) return b;
        return c;
    }

    // Previous row for filter reconstruction
    let prevRow = new Uint8Array(filterRowSize);
    let currentRow = new Uint8Array(filterRowSize);

    // Scanline reconstruction with full filter support
    let dOffset = 0;
    for (let y = 0; y < height; y++) {
        const filterType = decompressed[dOffset];
        dOffset++;

        // Read raw filtered row
        for (let i = 0; i < filterRowSize; i++) {
            currentRow[i] = decompressed[dOffset + i];
        }

        // Apply inverse filter
        for (let x = 0; x < filterRowSize; x++) {
            const left = x >= channels ? currentRow[x - channels] : 0;
            const up = prevRow[x];
            const upLeft = x >= channels ? prevRow[x - channels] : 0;

            switch (filterType) {
                case 0: // None
                    // No change
                    break;
                case 1: // Sub
                    currentRow[x] = (currentRow[x] + left) & 0xFF;
                    break;
                case 2: // Up
                    currentRow[x] = (currentRow[x] + up) & 0xFF;
                    break;
                case 3: // Average
                    currentRow[x] = (currentRow[x] + Math.floor((left + up) / 2)) & 0xFF;
                    break;
                case 4: // Paeth
                    currentRow[x] = (currentRow[x] + paethPredictor(left, up, upLeft)) & 0xFF;
                    break;
                default:
                    // Unknown filter, treat as None
                    break;
            }
        }

        dOffset += filterRowSize;

        // Copy pixels to output
        for (let x = 0; x < width; x++) {
            const srcOffset = x * channels;
            const r = currentRow[srcOffset];
            const g = currentRow[srcOffset + 1];
            const b = currentRow[srcOffset + 2];
            const a = channels === 4 ? currentRow[srcOffset + 3] : 255;

            const pIdx = (y * width + x) * 4;
            pixels[pIdx] = r;
            pixels[pIdx + 1] = g;
            pixels[pIdx + 2] = b;
            pixels[pIdx + 3] = a;
        }

        // Swap rows for next iteration
        [prevRow, currentRow] = [currentRow, prevRow];
    }

    return new ImageData(pixels, width, height);
}

function writeChunk(parts: BlobPart[], type: string, data: Uint8Array) {
    parts.push(int32ToBytes(data.length));
    const typeBytes = new TextEncoder().encode(type);
    parts.push(typeBytes);
    parts.push(data);
    let crc = 0xFFFFFFFF;
    crc = updateCrc(crc, typeBytes);
    crc = updateCrc(crc, data);
    crc ^= 0xFFFFFFFF;
    parts.push(int32ToBytes(crc >>> 0));
}
