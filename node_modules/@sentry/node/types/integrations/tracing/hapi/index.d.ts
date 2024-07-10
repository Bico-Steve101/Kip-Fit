import type { Server } from './types';
export declare const instrumentHapi: ((options?: unknown) => void) & {
    id: string;
};
/**
 * Hapi integration
 *
 * Capture tracing data for Hapi.
 * If you also want to capture errors, you need to call `setupHapiErrorHandler(server)` after you set up your server.
 */
export declare const hapiIntegration: () => import("@sentry/types").Integration;
export declare const hapiErrorPlugin: {
    name: string;
    version: string;
    register: (serverArg: Record<any, any>) => Promise<void>;
};
/**
 * Add a Hapi plugin to capture errors to Sentry.
 */
export declare function setupHapiErrorHandler(server: Server): Promise<void>;
//# sourceMappingURL=index.d.ts.map