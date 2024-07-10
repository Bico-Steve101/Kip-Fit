export declare const instrumentPrisma: ((options?: unknown) => void) & {
    id: string;
};
/**
 * Prisma integration
 *
 * Capture tracing data for prisma.
 * Note: This requieres to set:
 * previewFeatures = ["tracing"]
 * For the prisma client.
 * See https://www.prisma.io/docs/concepts/components/prisma-client/opentelemetry-tracing for more details.
 */
export declare const prismaIntegration: () => import("@sentry/types").Integration;
//# sourceMappingURL=prisma.d.ts.map