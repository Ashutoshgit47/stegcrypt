// TIFF codec for StegCrypt - LSB steganography support
// Handles reading TIFF files via canvas fallback (browser native support)
// and writing back as PNG (TIFF output via canvas is not reliably supported)

export interface TiffData {
  imageData: ImageData;
  width: number;
  height: number;
}

/** Detect if a file is a TIFF by checking the magic bytes */
export function isTiff(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 4));
  // Little-endian TIFF: 49 49 2A 00
  // Big-endian TIFF:    4D 4D 00 2A
  const isLe = bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2A && bytes[3] === 0x00;
  const isBe = bytes[0] === 0x4D && bytes[1] === 0x4D && bytes[2] === 0x00 && bytes[3] === 0x2A;
  return isLe || isBe;
}

/**
 * Load a TIFF file into an ImageData object via the browser's built-in canvas API.
 * Most modern browsers support reading TIFF via <img>/canvas.
 * Returns null if the browser doesn't support TIFF.
 */
export async function decodeTiff(file: File): Promise<ImageData> {
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
        reject(new Error('Failed to get canvas context for TIFF decoding'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);

      URL.revokeObjectURL(url);
      resolve(imageData);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(
        'Could not load TIFF file. Your browser may not support TIFF images natively. ' +
        'Please convert to PNG first using a tool like ImageWrangler.'
      ));
    };

    img.src = url;
  });
}

/**
 * Analyze TIFF carrier capacity (same algorithm as PNG — pixel-based LSB).
 */
export function analyzeTiffCapacity(
  imageData: ImageData,
  lsbDepth: number = 1
): { maxCapacityBytes: number; width: number; height: number } {
  const { width, height } = imageData;
  const usablePixels = width * height;
  const bitsPerPixel = 3 * lsbDepth;
  const maxCapacityBits = usablePixels * bitsPerPixel;
  const maxCapacityBytes = Math.max(0, Math.floor(maxCapacityBits / 8) - 8);
  return { maxCapacityBytes, width, height };
}
