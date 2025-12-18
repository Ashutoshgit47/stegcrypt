// BMP Encoder/Decoder for lossless steganography
// BMP format is ideal because it's uncompressed - no data loss

export interface BMPHeader {
    width: number;
    height: number;
    bitsPerPixel: number;
    dataOffset: number;
}

/**
 * Decode BMP file to ImageData
 * Throws descriptive errors for corrupted/invalid files
 */
export function decodeBMP(buffer: ArrayBuffer): ImageData {
    const data = new Uint8Array(buffer);
    const view = new DataView(buffer);

    // Minimum BMP size: 54 bytes (14 file header + 40 DIB header)
    const MIN_BMP_SIZE = 54;
    if (buffer.byteLength < MIN_BMP_SIZE) {
        throw new Error('Invalid BMP file: file too small (corrupted or truncated)');
    }

    // Verify BMP signature
    if (data[0] !== 0x42 || data[1] !== 0x4D) { // "BM"
        throw new Error('Invalid BMP file: missing BM signature');
    }

    // Read header
    const dataOffset = view.getUint32(10, true);
    const width = view.getInt32(18, true);
    const height = view.getInt32(22, true);
    const bitsPerPixel = view.getUint16(28, true);

    // Validate header values
    if (width <= 0 || width > 32768 || Math.abs(height) <= 0 || Math.abs(height) > 32768) {
        throw new Error('Invalid BMP file: unreasonable dimensions (corrupted header)');
    }

    if (dataOffset >= buffer.byteLength) {
        throw new Error('Invalid BMP file: data offset exceeds file size (corrupted)');
    }

    // We support 24-bit (RGB) and 32-bit (RGBA) BMP
    if (bitsPerPixel !== 24 && bitsPerPixel !== 32) {
        throw new Error(`Unsupported BMP format: ${bitsPerPixel}-bit. Only 24-bit and 32-bit supported.`);
    }

    const bytesPerPixel = bitsPerPixel / 8;
    const absHeight = Math.abs(height);
    const isTopDown = height < 0; // Top-down if height is negative

    // Row padding (BMP rows are padded to 4-byte boundaries)
    const rowSize = Math.ceil((width * bytesPerPixel) / 4) * 4;

    // Create output ImageData (always RGBA)
    const pixels = new Uint8ClampedArray(width * absHeight * 4);

    for (let y = 0; y < absHeight; y++) {
        // BMP stores rows bottom-up by default
        const srcY = isTopDown ? y : (absHeight - 1 - y);
        const rowOffset = dataOffset + srcY * rowSize;

        for (let x = 0; x < width; x++) {
            const srcOffset = rowOffset + x * bytesPerPixel;
            const dstOffset = (y * width + x) * 4;

            // BMP stores as BGR(A)
            pixels[dstOffset + 2] = data[srcOffset];     // B -> R
            pixels[dstOffset + 1] = data[srcOffset + 1]; // G -> G
            pixels[dstOffset] = data[srcOffset + 2];     // R -> B
            pixels[dstOffset + 3] = bytesPerPixel === 4 ? data[srcOffset + 3] : 255; // A
        }
    }

    return new ImageData(pixels, width, absHeight);
}

/**
 * Encode ImageData to BMP (32-bit RGBA for maximum compatibility)
 */
export function encodeBMP(
    pixels: Uint8ClampedArray,
    width: number,
    height: number
): Blob {
    const bytesPerPixel = 4; // 32-bit BGRA
    const rowSize = width * bytesPerPixel; // No padding needed for 32-bit
    const pixelDataSize = rowSize * height;
    const headerSize = 54; // Standard BMP header + DIB header
    const fileSize = headerSize + pixelDataSize;

    const buffer = new ArrayBuffer(fileSize);
    const data = new Uint8Array(buffer);
    const view = new DataView(buffer);

    // BMP File Header (14 bytes)
    data[0] = 0x42; data[1] = 0x4D; // "BM"
    view.setUint32(2, fileSize, true);
    view.setUint32(6, 0, true); // Reserved
    view.setUint32(10, headerSize, true); // Pixel data offset

    // DIB Header (BITMAPINFOHEADER - 40 bytes)
    view.setUint32(14, 40, true); // DIB header size
    view.setInt32(18, width, true);
    view.setInt32(22, -height, true); // Negative = top-down (easier to work with)
    view.setUint16(26, 1, true); // Color planes
    view.setUint16(28, 32, true); // Bits per pixel
    view.setUint32(30, 0, true); // Compression (0 = none)
    view.setUint32(34, pixelDataSize, true); // Image size
    view.setUint32(38, 2835, true); // Horizontal resolution (72 DPI)
    view.setUint32(42, 2835, true); // Vertical resolution (72 DPI)
    view.setUint32(46, 0, true); // Colors in palette
    view.setUint32(50, 0, true); // Important colors

    // Pixel data (BGRA format, top-down)
    let offset = headerSize;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcOffset = (y * width + x) * 4;
            // RGBA -> BGRA
            data[offset] = pixels[srcOffset + 2];     // B
            data[offset + 1] = pixels[srcOffset + 1]; // G
            data[offset + 2] = pixels[srcOffset];     // R
            data[offset + 3] = pixels[srcOffset + 3]; // A
            offset += 4;
        }
    }

    return new Blob([buffer], { type: 'image/bmp' });
}
