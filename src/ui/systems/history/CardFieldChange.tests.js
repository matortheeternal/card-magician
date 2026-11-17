import CardFieldChange from './CardFieldChange.js';
import ImageCrop from '../../../domain/card/ImageCrop.js';
import ImageFieldValue from '../../../domain/card/ImageFieldValue.js';
import { openContext, restoreContext } from '../objectUrlSystem.js';

describe('Card field history', () => {
    let previousContext;

    beforeEach(() => {
        previousContext = openContext();
    });

    afterEach(() => {
        restoreContext(previousContext);
    });

    it('reads an image once for the snapshots before and after a crop', async () => {
        const image = new ImageFieldValue('/tests/fixtures/art.jpg');
        const cropped = image.clone();
        cropped.crop = new ImageCrop(100, 120, 3, 4);
        const event = new CustomEvent('cm-field-changed', { detail: {
            faceId: 'front', fieldId: 'artImage', oldValue: image, newValue: cropped
        } });
        const entry = new CardFieldChange({ front: {} }, event);
        const read = spyOn(window, 'fetch').and.callThrough();

        await entry.prepare();

        const imageReads = read.calls.allArgs().filter(([url]) => url === image.imageUrl);
        expect(imageReads).toEqual([[image.imageUrl]]);
        expect(entry.oldValue.imageUrl.startsWith('blob:')).toBeTrue();
        expect(entry.newValue.imageUrl).toBe(entry.oldValue.imageUrl);
        expect(entry.newValue.crop).toEqual(cropped.crop);
        expect(entry.newValue.crop).not.toBe(cropped.crop);
    });
});
