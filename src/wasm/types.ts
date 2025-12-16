// WASM module type definitions
// These define the expected interface for the Rust WASM module when it's added

export interface WasmStegModule {
    // Steganography functions
    analyze_capacity(imageData: Uint8Array, width: number, height: number, lsbDepth: number): number;
    embed(imageData: Uint8Array, width: number, height: number, payload: Uint8Array, lsbDepth: number, randomize: boolean): Uint8Array;
    extract(imageData: Uint8Array, width: number, height: number, lsbDepth: number): Uint8Array | null;

    // Audio steganography
    analyze_audio_capacity(audioData: Int16Array, lsbDepth: number): number;
    embed_audio(audioData: Int16Array, payload: Uint8Array, lsbDepth: number): Int16Array;
    extract_audio(audioData: Int16Array, lsbDepth: number): Uint8Array | null;
}

export interface WasmCryptoModule {
    // Cryptography functions (Argon2 specifically)
    argon2_hash(password: Uint8Array, salt: Uint8Array, iterations: number, memory: number, parallelism: number): Uint8Array;

    // Optional: WASM-accelerated AES-GCM if needed
    aes_gcm_encrypt?(data: Uint8Array, key: Uint8Array, iv: Uint8Array): Uint8Array;
    aes_gcm_decrypt?(data: Uint8Array, key: Uint8Array, iv: Uint8Array): Uint8Array | null;
}

export interface WasmModules {
    steg: WasmStegModule | null;
    crypto: WasmCryptoModule | null;
}

export type WasmLoadState = 'idle' | 'loading' | 'ready' | 'error' | 'unsupported';

export interface WasmLoadResult {
    state: WasmLoadState;
    modules: WasmModules;
    error?: string;
}
