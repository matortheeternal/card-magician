import ErrorReport from './ErrorReport.js';

describe('ErrorReport', () => {
    it('formats error details and serialized data as Markdown', () => {
        const report = new ErrorReport([{
            context: { unit: 'Card', label: 'Card Editor' },
            id: 'save',
            error: new Error('Could not save the card.'),
            data: '{\n  "cardId": "abc123"\n}',
            timestamp: new Date('2026-10-26T12:00:00.000Z'),
        }]).toMarkdown();

        expect(report).toContain('# Card Magician Error Report');
        expect(report).toContain('## System Information');
        expect(report).toContain('## Errors (1)');
        expect(report).toContain('### Error 1: Card Editor');
        expect(report).toContain('- ID: `save`');
        expect(report).toContain('- Reported: `2026-10-26T12:00:00.000Z`');
        expect(report).toContain('Could not save the card.');
        expect(report).toContain('"cardId": "abc123"');
    });

    it('reports when no errors are visible', () => {
        const report = new ErrorReport([]).toMarkdown();

        expect(report).toContain('## Errors (0)');
        expect(report).toContain('No errors are currently visible in the application.');
    });

    it('formats arbitrary thrown values', () => {
        const report = new ErrorReport([{
            context: { unit: 'Fallback' },
            id: 'unhandled-error',
            error: null,
            data: '{\n  "message": "Script error."\n}',
            timestamp: new Date('2026-10-26T12:00:00.000Z'),
        }]).toMarkdown();

        expect(report).toContain([
            '#### Message', '```', 'null', '```'
        ].join('\n'));
        expect(report).toContain('"message": "Script error."');
    });
});
