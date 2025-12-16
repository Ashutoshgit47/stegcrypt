import { useState, useEffect, useCallback } from 'react';
import { initWasm, subscribeToLoadState, getModules } from '@/wasm/loader';
import type { WasmLoadState, WasmModules } from '@/wasm/types';

export interface UseWasmEngineResult {
    state: WasmLoadState;
    modules: WasmModules;
    error?: string;
    initialize: () => Promise<void>;
}

/**
 * Hook for managing WASM engine state
 * Lazy-loads WASM modules and provides loading state for UI
 */
export function useWasmEngine(): UseWasmEngineResult {
    const [state, setState] = useState<WasmLoadState>('idle');
    const [error, setError] = useState<string | undefined>();
    const [modules, setModules] = useState<WasmModules>({ steg: null, crypto: null });

    useEffect(() => {
        // Subscribe to loader state changes
        const unsubscribe = subscribeToLoadState((newState) => {
            setState(newState);
            setModules(getModules());
        });

        return unsubscribe;
    }, []);

    const initialize = useCallback(async () => {
        try {
            const result = await initWasm();
            setModules(result.modules);
            if (result.error) {
                setError(result.error);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initialize engine');
        }
    }, []);

    return {
        state,
        modules,
        error,
        initialize
    };
}

// Map WASM state to legacy engine state for backward compatibility
export function mapToEngineState(wasmState: WasmLoadState): 'loading' | 'ready' | 'error' {
    switch (wasmState) {
        case 'idle':
        case 'loading':
            return 'loading';
        case 'ready':
        case 'unsupported': // Unsupported but using fallbacks, so "ready"
            return 'ready';
        case 'error':
            return 'error';
        default:
            return 'loading';
    }
}
