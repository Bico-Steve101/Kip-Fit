export declare const instrumentKoa: ((options?: unknown) => void) & {
    id: string;
};
export declare const koaIntegration: () => import("@sentry/types").Integration;
export declare const setupKoaErrorHandler: (app: {
    use: (arg0: (ctx: any, next: any) => Promise<void>) => void;
}) => void;
//# sourceMappingURL=koa.d.ts.map