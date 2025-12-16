// Worker message types for StegCrypt

export type WorkerMessageType =
    | 'INIT'
    | 'ENCRYPT'
    | 'DECRYPT'
    | 'EMBED'
    | 'EXTRACT'
    | 'PROGRESS'
    | 'COMPLETE'
    | 'ERROR'
    | 'CANCEL';

export interface WorkerMessage {
    type: WorkerMessageType;
    id: string;
    data?: unknown;
}

export interface ProgressMessage {
    type: 'PROGRESS';
    id: string;
    data: {
        progress: number; // 0-100
        stage: string;
        message?: string;
    };
}

export interface CompleteMessage {
    type: 'COMPLETE';
    id: string;
    data: {
        result: ArrayBuffer | string;
    };
}

export interface ErrorMessage {
    type: 'ERROR';
    id: string;
    data: {
        message: string;
        code?: string;
    };
}

// Encryption request
export interface EncryptRequest {
    type: 'ENCRYPT';
    id: string;
    data: {
        payload: ArrayBuffer;
        password: string;
        useArgon2: boolean;
        compress: boolean;
    };
}

// Decryption request
export interface DecryptRequest {
    type: 'DECRYPT';
    id: string;
    data: {
        ciphertext: ArrayBuffer;
        password: string;
    };
}

// Embed request
export interface EmbedRequest {
    type: 'EMBED';
    id: string;
    data: {
        imageData: ImageData;
        payload: ArrayBuffer;
        lsbDepth: number;
        randomize: boolean;
    };
}

// Extract request
export interface ExtractRequest {
    type: 'EXTRACT';
    id: string;
    data: {
        imageData: ImageData;
        lsbDepth: number;
    };
}

// Cancel request
export interface CancelRequest {
    type: 'CANCEL';
    id: string;
}

export type CryptoWorkerRequest = EncryptRequest | DecryptRequest | CancelRequest;
export type StegWorkerRequest = EmbedRequest | ExtractRequest | CancelRequest;
export type WorkerResponse = ProgressMessage | CompleteMessage | ErrorMessage;
