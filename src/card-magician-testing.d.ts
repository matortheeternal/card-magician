declare global {
    const cmTest: Readonly<{
        eventually<T>(
            predicate: () => T | Promise<T>,
            options?: { timeout?: number; interval?: number }
        ): Promise<Awaited<T>>;
        click(element: HTMLElement | null | undefined): Promise<void>;
        openSettings(): Promise<HTMLElement>;
        closeSettings(): Promise<void>;
    }>;
}

export {};
