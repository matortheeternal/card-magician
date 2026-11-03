export type AppEnvironment = import('./card-magician.js').AppEnvironment;

export type NativeResponse<Value> = {
    value: Value;
    error?: never;
} | {
    value?: never;
    error: { message: string; code?: string };
};

export interface CardMagicianNative {
    call<Value = any>(operation: string, args: unknown[]): Promise<NativeResponse<Value>>;
    onClose(callback: () => void): void;
}

declare global {
    var cardMagicianNative: CardMagicianNative;

    interface Window {
        readonly appEnvironment: AppEnvironment;
        readonly cardMagicianNative: CardMagicianNative;
    }
}
