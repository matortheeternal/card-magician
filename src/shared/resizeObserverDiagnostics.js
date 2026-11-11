const MAX_DELIVERIES = 10;

function describeEntry({ target, contentRect }) {
    const host = target.getRootNode().host;
    const face = (host || target).closest('[data-face-id]')?.dataset.faceId;
    const field = target.getAttribute('field-id') || target.getAttribute('name');
    const element = [face, host?.localName, target.localName, target.id, field]
        .filter(Boolean).join(' / ');
    return `${element}: ${contentRect.width} × ${contentRect.height}`;
}

export function installDiagnostics(scope) {
    const NativeResizeObserver = scope.ResizeObserver;
    const recent = [];
    scope.ResizeObserver = class extends NativeResizeObserver {
        constructor(callback) {
            const source = new Error().stack.split('\n').slice(2, 7).join('\n');
            super((entries, observer) => {
                recent.push({ source, entries, time: scope.performance.now() });
                if (recent.length > MAX_DELIVERIES) recent.shift();
                callback.call(observer, entries, observer);
            });
        }
    };
    return {
        snapshot: () => ({
            viewport: `${scope.innerWidth} × ${scope.innerHeight}`,
            recent: recent.map(({ source, entries, time }) => ({
                source,
                ageMs: Math.round(scope.performance.now() - time),
                targets: entries.map(describeEntry).join('\n'),
            })),
        }),
        restore: () => { scope.ResizeObserver = NativeResizeObserver; },
    };
}
