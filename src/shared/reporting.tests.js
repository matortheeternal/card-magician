import { subscribe } from './reporting.js';

describe('reporting', () => {
    it('does not swallow subscriber failures', () => {
        const expected = new Error('Subscriber failed');
        let enabled = true;
        subscribe(() => {
            if (enabled) throw expected;
        });
        const report = createReporter({ unit: 'ReportingTest' });

        expect(() => report('subscriber-failure', null, null)).toThrow(expected);
        enabled = false;
    });
});
