// Web Crypto API wrapper for StegCrypt
// This module handles all cryptographic operations

export interface EncryptionResult {
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
  salt: Uint8Array;
}

export interface DecryptionResult {
  plaintext: ArrayBuffer;
}

// Derive a key from password using PBKDF2
async function deriveKey(
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

// Encrypt data using AES-GCM
export async function encrypt(
  data: ArrayBuffer,
  password: string
): Promise<EncryptionResult> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const key = await deriveKey(password, salt);
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return { ciphertext, iv, salt };
}

// Decrypt data using AES-GCM
export async function decrypt(
  ciphertext: ArrayBuffer,
  password: string,
  iv: Uint8Array,
  salt: Uint8Array
): Promise<DecryptionResult> {
  const key = await deriveKey(password, salt);
  
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    ciphertext
  );

  return { plaintext };
}

// Generate random bytes
export function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

// Convert string to ArrayBuffer
export function stringToBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer;
}

// Convert ArrayBuffer to string
export function bufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

// Pack encrypted data with metadata for storage
export function packEncryptedData(result: EncryptionResult): ArrayBuffer {
  const metadataSize = 4 + result.salt.length + result.iv.length;
  const totalSize = metadataSize + result.ciphertext.byteLength;
  
  const packed = new Uint8Array(totalSize);
  let offset = 0;

  // Write salt length (4 bytes)
  new DataView(packed.buffer).setUint32(offset, result.salt.length, true);
  offset += 4;

  // Write salt
  packed.set(result.salt, offset);
  offset += result.salt.length;

  // Write IV
  packed.set(result.iv, offset);
  offset += result.iv.length;

  // Write ciphertext
  packed.set(new Uint8Array(result.ciphertext), offset);

  return packed.buffer;
}

// Unpack encrypted data
export function unpackEncryptedData(packed: ArrayBuffer): {
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
  salt: Uint8Array;
} {
  const data = new Uint8Array(packed);
  const view = new DataView(packed);
  let offset = 0;

  // Read salt length
  const saltLength = view.getUint32(offset, true);
  offset += 4;

  // Read salt
  const salt = data.slice(offset, offset + saltLength);
  offset += saltLength;

  // Read IV (always 12 bytes for AES-GCM)
  const iv = data.slice(offset, offset + 12);
  offset += 12;

  // Read ciphertext
  const ciphertext = data.slice(offset).buffer;

  return { ciphertext, iv, salt };
}
