import ImageFieldValue from './ImageFieldValue.js';
import { retainImage } from './imageRetention.js';
import { expectFilesToMatch } from '../../shared/testing/testUtils.js';
import { openContext, restoreContext } from '../../ui/systems/objectUrlSystem.js';

describe('Image retention', () => {
    let art, previousContext;

    beforeAll(async () => {
        const response = await fetch('/tests/fixtures/art.jpg');
        art = new File([await response.blob()], 'art.jpg', { type: 'image/jpeg' });
    });

    beforeEach(() => {
        previousContext = openContext();
    });

    afterEach(() => {
        restoreContext(previousContext);
    });

    it('shares blob content with independent editable state', async () => {
        const image = await ImageFieldValue.fromFile(art);
        const retained = await retainImage(image);
        expect(retained.imageUrl).toBe(image.imageUrl);
        retained.crop.xOffset = 13;
        expect(image.crop.xOffset).toBe(0);
        await expectFilesToMatch(new File([await retained.loadImageData()], ''), art);
    });

    it('retains backup bytes after the image URL expires', async () => {
        const image = new ImageFieldValue('/missing-history-image.jpg');
        const retained = await retainImage(image, art);
        expect(image.imageUrl).toBe('/missing-history-image.jpg');
        await expectFilesToMatch(new File([await retained.loadImageData()], ''), art);
    });

    it('copies empty and data URL image values without fetching', async () => {
        const fetchImage = spyOn(window, 'fetch').and.callThrough();
        const empty = new ImageFieldValue();
        expect((await retainImage(empty)).imageUrl).toBeNull();
        const url = 'data:image/png;base64,aGVsbG8=';
        const image = new ImageFieldValue(url);
        expect((await retainImage(image)).imageUrl).toBe(url);
        expect(fetchImage).not.toHaveBeenCalled();
    });

    it('reports retention failures without changing the source value', async () => {
        const image = new ImageFieldValue('/missing-history-image.jpg');
        spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 404 }));
        await expectAsync(retainImage(image)).toBeRejectedWithError(
            'Cannot retain image: /missing-history-image.jpg'
        );
        expect(image.imageUrl).toBe('/missing-history-image.jpg');
    });
});
