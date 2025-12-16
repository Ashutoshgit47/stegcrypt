// Worker Client - Main thread API for communicating with web workers
// Provides promise-based API with progress callbacks and cancellation

import type {
    WorkerResponse,
    EncryptRequest,
    DecryptRequest,
    EmbedRequest,
    ExtractRequest
} from './worker-types';

type ProgressCallback = (progress: number, stage: string, message?: string) => void;

interface WorkerJob<T> {
    id: string;
    resolve: (value: T) => void;
    reject: (error: Error) => void;
    onProgress?: ProgressCallback;
}

class WorkerClient<RequestType, ResultType> {
    private worker: Worker;
    private jobs = new Map<string, WorkerJob<ResultType>>();
    private jobCounter = 0;

    constructor(worker: Worker) {
        this.worker = worker;
        this.worker.onmessage = this.handleMessage.bind(this);
        this.worker.onerror = this.handleError.bind(this);
    }

    private generateId(): string {
        return `job_${Date.now()}_${++this.jobCounter}`;
    }

    private handleMessage(event: MessageEvent<WorkerResponse>) {
        const { type, id, data } = event.data;
        const job = this.jobs.get(id);

        if (!job) return;

        switch (type) {
            case 'PROGRESS':
                if (job.onProgress && data) {
                    const progressData = data as { progress: number; stage: string; message?: string };
                    job.onProgress(progressData.progress, progressData.stage, progressData.message);
                }
                break;

            case 'COMPLETE':
                this.jobs.delete(id);
                if (data) {
                    job.resolve((data as { result: ResultType }).result);
                }
                break;

            case 'ERROR':
                this.jobs.delete(id);
                if (data) {
                    const errorData = data as { message: string; code?: string };
                    job.reject(new Error(errorData.message));
                }
                break;
        }
    }

    private handleError(error: ErrorEvent) {
        console.error('Worker error:', error);
        // Reject all pending jobs when worker crashes
        for (const [id, job] of this.jobs) {
            job.reject(new Error('Worker crashed: ' + error.message));
            this.jobs.delete(id);
        }
    }

    execute(
        request: Omit<RequestType, 'id'>,
        onProgress?: ProgressCallback
    ): { promise: Promise<ResultType>; cancel: () => void } {
        const id = this.generateId();

        const promise = new Promise<ResultType>((resolve, reject) => {
            this.jobs.set(id, { id, resolve, reject, onProgress });
            this.worker.postMessage({ ...request, id });
        });

        const cancel = () => {
            const job = this.jobs.get(id);
            if (job) {
                this.jobs.delete(id);
                job.reject(new Error('Cancelled'));
                this.worker.postMessage({ type: 'CANCEL', id });
            }
        };

        return { promise, cancel };
    }

    terminate() {
        this.worker.terminate();
        for (const job of this.jobs.values()) {
            job.reject(new Error('Worker terminated'));
        }
        this.jobs.clear();
    }
}

// Lazy-loaded worker instances
let cryptoWorkerClient: WorkerClient<EncryptRequest | DecryptRequest, ArrayBuffer> | null = null;
let stegWorkerClient: WorkerClient<EmbedRequest | ExtractRequest, ArrayBuffer> | null = null;

export function getCryptoWorker() {
    if (!cryptoWorkerClient) {
        const worker = new Worker(
            new URL('./crypto.worker.ts', import.meta.url),
            { type: 'module' }
        );
        cryptoWorkerClient = new WorkerClient(worker);
    }
    return cryptoWorkerClient;
}

export function getStegWorker() {
    if (!stegWorkerClient) {
        const worker = new Worker(
            new URL('./steg.worker.ts', import.meta.url),
            { type: 'module' }
        );
        stegWorkerClient = new WorkerClient(worker);
    }
    return stegWorkerClient;
}

// High-level API functions

export interface EncryptOptions {
    payload: ArrayBuffer;
    password: string;
    useArgon2?: boolean;
    compress?: boolean;
    onProgress?: ProgressCallback;
}

export function encryptInWorker(options: EncryptOptions) {
    const worker = getCryptoWorker();
    return worker.execute({
        type: 'ENCRYPT',
        data: {
            payload: options.payload,
            password: options.password,
            useArgon2: options.useArgon2 ?? false,
            compress: options.compress ?? true
        }
    } as EncryptRequest, options.onProgress);
}

export interface DecryptOptions {
    ciphertext: ArrayBuffer;
    password: string;
    onProgress?: ProgressCallback;
}

export function decryptInWorker(options: DecryptOptions) {
    const worker = getCryptoWorker();
    return worker.execute({
        type: 'DECRYPT',
        data: {
            ciphertext: options.ciphertext,
            password: options.password
        }
    } as DecryptRequest, options.onProgress);
}
