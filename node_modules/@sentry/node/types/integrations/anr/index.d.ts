import type { Integration } from '@sentry/types';
import type { AnrIntegrationOptions } from './common';
export declare const base64WorkerScript = "###AnrWorkerScript###";
type AnrInternal = {
    startWorker: () => void;
    stopWorker: () => void;
};
type AnrReturn = (options?: Partial<AnrIntegrationOptions>) => Integration & AnrInternal;
export declare const anrIntegration: AnrReturn;
export {};
//# sourceMappingURL=index.d.ts.map