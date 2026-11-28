import inspectionHoverBridge from './inspectionHoverBridge.js';

describe('Inspection popup hover corridor', () => {
    const popup = { left: 100, right: 300, top: 120, bottom: 180 };

    it('protects a diagonal move from the highlight into the popup below it', () => {
        const contains = inspectionHoverBridge({ x: 110, y: 100 }, popup);
        expect(contains({ x: 170, y: 110 })).toBeTrue();
        expect(contains({ x: 240, y: 110 })).toBeFalse();
        expect(contains({ x: 110, y: 95 })).toBeFalse();
    });

    it('also protects the path to a popup placed above the highlight', () => {
        const contains = inspectionHoverBridge({ x: 150, y: 200 }, popup);
        expect(contains({ x: 200, y: 190 })).toBeTrue();
        expect(contains({ x: 80, y: 190 })).toBeFalse();
        expect(contains({ x: 150, y: 210 })).toBeFalse();
    });
});
