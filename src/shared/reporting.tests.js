import { subscribe } from './reporting.js';

describe('reporting', () => {
    it('does not swallow subscriber failures', () => {
        const expected = new Error('Subscriber failed');
        let enabled = false;
        subscribe(() => {
            if (enabled) throw expected;
        });
        const report = createReporter({ unit: 'ReportingTest' });

        enabled = true;
        try {
            expect(() => report('subscriber-failure', null, null)).toThrow(expected);
        } finally {
            enabled = false;
        }
    });
});
