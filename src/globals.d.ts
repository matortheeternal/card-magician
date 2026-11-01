type HostEnvironment = ReturnType<typeof import('../electron/paths.js').createEnvironment>;

export type AppEnvironment = {
    readonly [Key in keyof HostEnvironment]: Readonly<HostEnvironment[Key]>;
};

export type NativeResponse<Value> = {
    value: Value;
    error?: never;
} | {
    value?: never;
    error: { message: string; code?: string };
};

export interface CardMagicianNative {
    // Operation names and payloads are dynamic; callers may specify a result type.
    call<Value = any>(operation: string, args: unknown[]): Promise<NativeResponse<Value>>;
    onClose(callback: () => void): void;
}

declare global {
    // var also makes these properties available on globalThis.
    var appEnvironment: AppEnvironment;
    var cardMagicianNative: CardMagicianNative;

    interface Window {
        readonly appEnvironment: AppEnvironment;
        readonly cardMagicianNative: CardMagicianNative;
    }
}
