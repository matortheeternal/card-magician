/** Helpers available only in Card Magician's test runners. */
declare global {
    const cmTest: Readonly<{
        /** Poll until the predicate returns a truthy result, or reject on timeout. */
        eventually<T>(
            predicate: () => T | Promise<T>,
            options?: { timeout?: number; interval?: number }
        ): Promise<Awaited<T>>;
        /** Wait for a control to update, then dispatch mouse events and click. */
        click(element: HTMLElement | null | undefined): Promise<void>;
        /** Open File → Settings and return the modal element. */
        openSettings(): Promise<HTMLElement>;
        /** Close Settings through its Close button; harmless if already closed. */
        closeSettings(): Promise<void>;
    }>;
}

export {};
