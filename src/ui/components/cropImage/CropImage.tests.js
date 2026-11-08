import './CropImage.js';

describe('CropImage update completion', () => {
    let element, imageCreated;

    async function setSource(source) {
        const created = new Promise(resolve => { imageCreated = resolve; });
        element.setAttribute('src', source);
        return created;
    }

    beforeEach(async () => {
        spyOn(window, 'Image').and.callFake(function () {
            const image = { naturalWidth: 200, naturalHeight: 100 };
            imageCreated(image);
            return image;
        });
        element = document.createElement('crop-image');
        element.style.cssText = 'display:block;width:100px;height:50px';
        document.body.append(element);
        await element.updateComplete;
    });

    afterEach(async () => {
        await element.updateComplete;
        element.remove();
    });

    it('waits for image dimensions and the rendered background', async () => {
        const image = await setSource('/image.jpg');
        let complete = false;
        const update = element.updateComplete.then(value => { complete = value; });
        expect(complete).toBeFalse();
        image.onload();
        await update;
        expect(complete).toBeTrue();
        expect(element.style.backgroundImage).toContain('/image.jpg');
        expect(element._srcWidth).toBe(200);
    });

    it('includes updates queued during an image lookup', async () => {
        const first = await setSource('/first.jpg');
        const complete = element.updateComplete;
        const secondCreated = setSource('/second.jpg');
        first.onload();
        const second = await secondCreated;
        second.naturalWidth = 400;
        second.onload();
        expect(await complete).toBeTrue();
        expect(element._srcWidth).toBe(400);
        expect(element.style.backgroundImage).toContain('/second.jpg');
    });

    it('waits for crop attribute updates', async () => {
        const image = await setSource('/image.jpg');
        image.onload();
        await element.updateComplete;
        element.setAttribute('crop-width', '100');
        element.setAttribute('crop-height', '50');
        expect(await element.updateComplete).toBeTrue();
        expect(element.style.backgroundSize).toBe('200px 100px');
    });

    it('surfaces image failures to the caller and allows a later update', async () => {
        const image = await setSource('/missing.jpg');
        const failed = expectAsync(element.updateComplete)
            .toBeRejectedWithError(/Failed to load image/);
        image.onerror({});
        await failed;
        const replacement = await setSource('/replacement.jpg');
        replacement.onload();
        expect(await element.updateComplete).toBeTrue();
        expect(element.style.backgroundImage).toContain('/replacement.jpg');
    });

    it('completes clearing the source without loading another image', async () => {
        const image = await setSource('/image.jpg');
        image.onload();
        await element.updateComplete;
        element.removeAttribute('src');
        expect(await element.updateComplete).toBeTrue();
        expect(window.Image).toHaveBeenCalledTimes(1);
        expect(element.style.backgroundImage).toBe('');
    });
});
