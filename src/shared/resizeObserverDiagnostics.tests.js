import safeStringify from './thePrinter.js';
import { installDiagnostics } from './resizeObserverDiagnostics.js';

describe('ResizeObserver diagnostics', () => {
    let scope, diagnostics, observer, receive;
    const target = document.createElement('textarea');
    target.name = 'rulesText';
    const entries = [{ target, contentRect: { width: 320, height: 100 } }];

    beforeEach(() => {
        class TestObserver {
            constructor(callback) { receive = callback; }
            observe() {}
            disconnect() {}
        }
        scope = {
            ResizeObserver: TestObserver,
            performance: { now: () => 42 },
            innerWidth: 1280, innerHeight: 720,
        };
        diagnostics = installDiagnostics(scope);
        observer = new scope.ResizeObserver(function (values, instance) {
            expect(this).toBe(instance);
            expect(instance).toBe(observer);
            expect(values).toBe(entries);
        });
    });

    afterEach(() => diagnostics.restore());

    it('preserves callback arguments and records the observer and target', () => {
        receive(entries, observer);
        const snapshot = diagnostics.snapshot();
        expect(snapshot.viewport).toBe('1280 × 720');
        expect(snapshot.recent[0].source).toContain('tests.js');
        expect(snapshot.recent[0].targets).toBe('textarea / rulesText: 320 × 100');
        expect(snapshot.recent[0].ageMs).toBe(0);
        const report = safeStringify({ resizeObservers: snapshot });
        expect(report).toContain('rulesText');
        expect(report).not.toContain('[MaxDepth]');
    });

    it('bounds retained deliveries and leaves previous snapshots unchanged', () => {
        receive(entries, observer);
        const earlier = diagnostics.snapshot();
        for (let index = 0; index < 30; index++) receive(entries, observer);
        expect(earlier.recent.length).toBe(1);
        expect(diagnostics.snapshot().recent.length).toBe(10);
    });

    it('identifies faces and fields inside shadow roots and measures recency', () => {
        const face = document.createElement('section');
        face.dataset.faceId = 'back';
        const host = document.createElement('sl-textarea');
        face.append(host);
        const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
        const input = document.createElement('textarea');
        input.name = 'flavorText';
        root.append(input);
        const values = [{ target: input, contentRect: { width: 365, height: 0 } }];
        const traced = new scope.ResizeObserver(() => {});
        receive(values, traced);
        scope.performance.now = () => 100;
        expect(diagnostics.snapshot().recent[0].targets)
            .toBe('back / sl-textarea / textarea / flavorText: 365 × 0');
        expect(diagnostics.snapshot().recent[0].ageMs).toBe(58);
    });

    it('restores the original observer', () => {
        diagnostics.restore();
        expect(scope.ResizeObserver.name).toBe('TestObserver');
    });
});
