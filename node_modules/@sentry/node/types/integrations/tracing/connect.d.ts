type ConnectApp = {
    use: (middleware: any) => void;
};
export declare const instrumentConnect: ((options?: unknown) => void) & {
    id: string;
};
export declare const connectIntegration: () => import("@sentry/types").Integration;
export declare const setupConnectErrorHandler: (app: ConnectApp) => void;
export {};
//# sourceMappingURL=connect.d.ts.map