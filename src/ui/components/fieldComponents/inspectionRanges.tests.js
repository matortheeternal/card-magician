import { mostSpecificInspection } from './inspectionRanges.js';

describe('Overlapping inspection tooltips', () => {
    it('prefers the shortest original range over a broader or field-wide finding', () => {
        const broad = { location: { start: 0, end: 24 } };
        const narrow = { location: { start: 5, end: 14 } };
        const field = { location: { field: 'rulesText' } };
        expect(mostSpecificInspection([broad, field, narrow])).toBe(narrow);
    });

    it('prefers the earlier start when two overlapping ranges are equally long', () => {
        const earlier = { location: { start: 4, end: 13 } };
        const later = { location: { start: 6, end: 15 } };
        expect(mostSpecificInspection([later, earlier])).toBe(earlier);
    });
});
