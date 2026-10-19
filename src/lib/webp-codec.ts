// WebP lossless detection and handling for StegCrypt
// WebP lossless files can be used as carriers since their pixel data is preserved.
// Lossy WebP files must be rejected since they destroy LSB data.

/**
 * Detect if a WebP file is lossless by reading the RIFF/VP8L header.
 *
 * WebP binary structure:
 *   Bytes 0-3:   "RIFF"
 *   Bytes 4-7:   File size (LE uint32)
 *   Bytes 8-11:  "WEBP"
 *   Bytes 12-15: Chunk type: "VP8 " (lossy), "VP8L" (lossless), or "VP8X" (extended)
 *
 * For VP8X (extended), we need to check the Alpha flag or look for a VP8L chunk.
 */
export function isWebPLossless(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);

  // Validate RIFF header
  if (
    bytes[0] !== 0x52 || bytes[1] !== 0x49 ||
    bytes[2] !== 0x46 || bytes[3] !== 0x46
  ) return false;

  // Validate WEBP format
  if (
    bytes[8] !== 0x57 || bytes[9] !== 0x45 ||
    bytes[10] !== 0x42 || bytes[11] !== 0x50
  ) return false;

  // Check chunk type
  const chunkType = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);

  if (chunkType === 'VP8L') {
    // Pure lossless WebP
    return true;
  }

  if (chunkType === 'VP8X') {
    // Extended WebP — scan sub-chunks for VP8L
    let offset = 12;
    while (offset + 8 <= bytes.length) {
      const subChunk = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
      const subSize = (bytes[offset + 4] | (bytes[offset + 5] << 8) | (bytes[offset + 6] << 16) | (bytes[offset + 7] << 24)) >>> 0;
      if (subChunk === 'VP8L') return true;
      if (subChunk === 'VP8 ') return false; // Lossy block found
      offset += 8 + subSize + (subSize % 2); // Chunks are word-aligned
    }
  }

  // VP8 (lossy) or unknown
  return false;
}

/**
 * Decode a WebP image to ImageData via the browser's canvas API.
 * Works for both lossless and lossy WebP — but only call with lossless!
 */
export async function decodeWebP(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: true });
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to get canvas context for WebP decoding'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
      URL.revokeObjectURL(url);
      resolve(imageData);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode WebP image.'));
    };

    img.src = url;
  });
}
