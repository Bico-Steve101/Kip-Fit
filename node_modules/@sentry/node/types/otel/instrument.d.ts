import type { Instrumentation } from '@opentelemetry/instrumentation';
/**
 * Instrument an OpenTelemetry instrumentation once.
 * This will skip running instrumentation again if it was already instrumented.
 */
export declare function generateInstrumentOnce<Options = unknown>(name: string, creator: (options?: Options) => Instrumentation): ((options?: Options) => void) & {
    id: string;
};
//# sourceMappingURL=instrument.d.ts.map