// WASM Loader - Lazy loads WASM modules only when needed
// Shows "Initializing secure engine..." during loading

import type { WasmModules, WasmLoadState, WasmLoadResult } from './types';
import { stegFallback, cryptoFallback } from './js-fallback';

let loadState: WasmLoadState = 'idle';
let loadedModules: WasmModules = { steg: null, crypto: null };
let loadError: string | undefined;
let loadPromise: Promise<WasmLoadResult> | null = null;

// Subscribers for state changes
type StateListener = (state: WasmLoadState) => void;
const listeners: Set<StateListener> = new Set();

function notifyListeners() {
    for (const listener of listeners) {
        listener(loadState);
    }
}

export function subscribeToLoadState(listener: StateListener): () => void {
    listeners.add(listener);
    // Immediately notify with current state
    listener(loadState);
    return () => listeners.delete(listener);
}

export function getLoadState(): WasmLoadState {
    return loadState;
}

export function getModules(): WasmModules {
    return loadedModules;
}

// Check if WASM is supported in this environment
function isWasmSupported(): boolean {
    try {
        if (typeof WebAssembly === 'object' &&
            typeof WebAssembly.instantiate === 'function') {
            // Test with a minimal WASM module
            const module = new WebAssembly.Module(
                new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])
            );
            return module instanceof WebAssembly.Module;
        }
    } catch {
        // WASM not supported
    }
    return false;
}

// Initialize WASM modules
export async function initWasm(): Promise<WasmLoadResult> {
    // Return existing promise if already loading
    if (loadPromise) {
        return loadPromise;
    }

    // Return cached result if already loaded
    if (loadState === 'ready' || loadState === 'error') {
        return {
            state: loadState,
            modules: loadedModules,
            error: loadError
        };
    }

    loadPromise = (async () => {
        loadState = 'loading';
        notifyListeners();

        try {
            // Check WASM support
            if (!isWasmSupported()) {
                loadState = 'unsupported';
                loadError = 'WebAssembly is not supported in this browser';
                notifyListeners();

                // Use JS fallbacks
                loadedModules = {
                    steg: stegFallback,
                    crypto: cryptoFallback
                };

                return {
                    state: loadState,
                    modules: loadedModules,
                    error: loadError
                };
            }

            // Use JS fallbacks until WASM binaries are provided
            // When WASM is available, replace this with:
            // const wasmModule = await import('./steg.wasm');
            // loadedModules.steg = wasmModule;

            loadedModules = {
                steg: stegFallback,
                crypto: cryptoFallback
            };

            loadState = 'ready';
            loadError = undefined;
            notifyListeners();

            return {
                state: loadState,
                modules: loadedModules
            };

        } catch (err) {
            loadState = 'error';
            loadError = err instanceof Error ? err.message : 'Failed to load WASM modules';
            notifyListeners();

            // Fall back to JS implementations
            loadedModules = {
                steg: stegFallback,
                crypto: cryptoFallback
            };

            return {
                state: loadState,
                modules: loadedModules,
                error: loadError
            };
        }
    })();

    return loadPromise;
}

// Reset loader (useful for testing or retry)
export function resetLoader() {
    loadState = 'idle';
    loadedModules = { steg: null, crypto: null };
    loadError = undefined;
    loadPromise = null;
    notifyListeners();
}

// Utility hook for React components
export function useWasmLoader() {
    return {
        state: loadState,
        modules: loadedModules,
        error: loadError,
        init: initWasm
    };
}
