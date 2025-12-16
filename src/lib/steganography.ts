// Steganography utilities for StegCrypt
// LSB (Least Significant Bit) embedding for PNG images

import { encodePNG, decodePNG } from './png-encoder';
import { encodeBMP, decodeBMP } from './bmp-codec';

// Magic header for detecting embedded data: "STEG" in hex
const MAGIC_HEADER = [0x53, 0x54, 0x45, 0x47];

export interface EmbedResult {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface CarrierAnalysis {
  width: number;
  height: number;
  channels: number;
  maxCapacityBytes: number;
  format: string;
}

// Analyze image capacity
export function analyzeImageCapacity(
  imageData: ImageData,
  lsbDepth: number = 1
): CarrierAnalysis {
  const { width, height } = imageData;
  // Use RGB channels only (skip alpha for maximum compatibility)
  const usablePixels = width * height;
  const bitsPerPixel = 3 * lsbDepth; // 3 channels × lsbDepth bits
  const maxCapacityBits = usablePixels * bitsPerPixel;
  // Subtract header overhead: 4 bytes magic + 4 bytes length
  const maxCapacityBytes = Math.floor(maxCapacityBits / 8) - 8;

  return {
    width,
    height,
    channels: 3,
    maxCapacityBytes: Math.max(0, maxCapacityBytes),
    format: 'PNG',
  };
}

// Embed data into image using LSB
export function embedData(
  imageData: ImageData,
  payload: ArrayBuffer,
  lsbDepth: number = 1
): EmbedResult {
  const { width, height } = imageData;
  // Create a copy of the pixel data
  const pixels = new Uint8ClampedArray(imageData.data.length);
  for (let i = 0; i < imageData.data.length; i++) {
    pixels[i] = imageData.data[i];
  }

  const payloadBytes = new Uint8Array(payload);

  // Build the full message: MAGIC (4 bytes) + LENGTH (4 bytes) + DATA
  const messageLength = 8 + payloadBytes.length;
  const message = new Uint8Array(messageLength);

  // Set magic header
  message[0] = MAGIC_HEADER[0];
  message[1] = MAGIC_HEADER[1];
  message[2] = MAGIC_HEADER[2];
  message[3] = MAGIC_HEADER[3];

  // Set length (big endian)
  const len = payloadBytes.length;
  message[4] = (len >> 24) & 0xFF;
  message[5] = (len >> 16) & 0xFF;
  message[6] = (len >> 8) & 0xFF;
  message[7] = len & 0xFF;

  // Copy payload
  for (let i = 0; i < payloadBytes.length; i++) {
    message[8 + i] = payloadBytes[i];
  }

  // Calculate capacity
  const usablePixels = width * height * 3; // R, G, B channels
  const availableBits = usablePixels * lsbDepth;
  const neededBits = messageLength * 8;

  if (neededBits > availableBits) {
    throw new Error(`Payload too large. Need ${neededBits} bits, have ${availableBits}`);
  }

  // Embed message into pixels
  let bitIndex = 0;
  const totalBitsToEmbed = messageLength * 8;

  // Iterate through pixels: RGBA format, we use R, G, B (skip A)
  for (let pixelOffset = 0; pixelOffset < pixels.length && bitIndex < totalBitsToEmbed; pixelOffset += 4) {
    // Process R, G, B channels (indices 0, 1, 2 within each pixel)
    for (let channel = 0; channel < 3 && bitIndex < totalBitsToEmbed; channel++) {
      const idx = pixelOffset + channel;

      // Get current pixel value
      let pixelValue = pixels[idx];

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

      pixels[idx] = pixelValue;
    }

    // Ensure alpha is always 255 for maximum compatibility
    pixels[pixelOffset + 3] = 255;
  }

  return { data: pixels, width, height };
}

// Extract data from image
export function extractData(
  imageData: ImageData,
  lsbDepth: number = 1
): ArrayBuffer | null {
  const pixels = imageData.data;
  const { width, height } = imageData;

  // We need at least 64 bits for header (4 bytes magic + 4 bytes length)
  const usableChannels = width * height * 3;
  const maxBits = usableChannels * lsbDepth;

  if (maxBits < 64) {
    return null;
  }

  // Extract bits from pixels
  const extractedBits: number[] = [];

  for (let pixelOffset = 0; pixelOffset < pixels.length; pixelOffset += 4) {
    // Extract from R, G, B channels
    for (let channel = 0; channel < 3; channel++) {
      const idx = pixelOffset + channel;
      const pixelValue = pixels[idx];

      // Extract LSB bits
      for (let bit = lsbDepth - 1; bit >= 0; bit--) {
        extractedBits.push((pixelValue >> bit) & 1);
      }
    }
  }

  // Convert first 32 bits (4 bytes) to magic header
  if (extractedBits.length < 64) {
    console.warn('[StegCrypt] Not enough bits for header:', extractedBits.length);
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
  if (extractedMagic[0] !== MAGIC_HEADER[0] ||
    extractedMagic[1] !== MAGIC_HEADER[1] ||
    extractedMagic[2] !== MAGIC_HEADER[2] ||
    extractedMagic[3] !== MAGIC_HEADER[3]) {
    console.warn('[StegCrypt] Magic header mismatch - not our data or wrong LSB depth');
    return null; // Not our data or wrong LSB depth
  }

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

  // Extract payload
  const payload = new Uint8Array(payloadLength);
  const payloadStartBit = 64; // After 8 bytes header

  for (let byteIdx = 0; byteIdx < payloadLength; byteIdx++) {
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

  return payload.buffer;
}

// Load image from file and get ImageData
// Supports PNG and BMP with binary-safe decoding

export async function loadImage(file: File): Promise<ImageData> {
  // Use pure JS decoder for PNGs to ensure binary safety (no gamma/color shifts)
  if (file.type === 'image/png') {
    try {
      const buffer = await file.arrayBuffer();
      return await decodePNG(buffer);
    } catch (e) {
      console.warn('PNG decode failed, falling back to canvas:', e);
    }
  }

  // Use pure JS decoder for BMPs
  if (file.type === 'image/bmp' || file.name.toLowerCase().endsWith('.bmp')) {
    try {
      const buffer = await file.arrayBuffer();
      return decodeBMP(buffer);
    } catch (e) {
      console.warn('BMP decode failed, falling back to canvas:', e);
    }
  }

  // Fallback for other formats or if strict decode fails
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d', {
        willReadFrequently: true,
        alpha: true
      });
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw image
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);

      URL.revokeObjectURL(url);
      resolve(imageData);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

// Create PNG blob from EmbedResult
// Uses pure JS encoder to prevent canvas noise

export function createPngBlob(result: EmbedResult): Promise<Blob> {
  return encodePNG(result.data, result.width, result.height);
}

// Create BMP blob from EmbedResult
// BMP is uncompressed - excellent for steganography
export function createBmpBlob(result: EmbedResult): Blob {
  return encodeBMP(result.data, result.width, result.height);
}
