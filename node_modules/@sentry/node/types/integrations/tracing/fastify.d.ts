interface Fastify {
    register: (plugin: any) => void;
    addHook: (hook: string, handler: (request: any, reply: any, error: Error) => void) => void;
}
export declare const instrumentFastify: ((options?: unknown) => void) & {
    id: string;
};
/**
 * Express integration
 *
 * Capture tracing data for fastify.
 */
export declare const fastifyIntegration: () => import("@sentry/types").Integration;
/**
 * Setup an error handler for Fastify.
 */
export declare function setupFastifyErrorHandler(fastify: Fastify): void;
export {};
//# sourceMappingURL=fastify.d.ts.map