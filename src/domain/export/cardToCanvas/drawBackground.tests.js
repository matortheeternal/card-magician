import { drawBackground } from './drawBackground.js';

const blueImage = 'data:image/svg+xml,'
    + '%3Csvg xmlns="http://www.w3.org/2000/svg" width="10" height="10"%3E'
    + '%3Crect width="10" height="10" fill="%230000ff"/%3E%3C/svg%3E';
const redImage = 'data:image/svg+xml,'
    + '%3Csvg xmlns="http://www.w3.org/2000/svg" width="10" height="10"%3E'
    + '%3Crect width="10" height="10" fill="%23ff0000"/%3E%3C/svg%3E';

function getStyle(backgroundImage, backgroundPosition, backgroundSize) {
    return {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        backgroundImage,
        backgroundPosition,
        backgroundSize,
        backgroundRepeat: 'no-repeat',
        backgroundOrigin: 'border-box',
        borderLeftWidth: '0px',
        borderRightWidth: '0px',
        borderTopWidth: '0px',
        borderBottomWidth: '0px',
        paddingLeft: '0px',
        paddingRight: '0px',
        paddingTop: '0px',
        paddingBottom: '0px',
        borderTopLeftRadius: '0px',
        borderTopRightRadius: '0px',
        borderBottomRightRadius: '0px',
        borderBottomLeftRadius: '0px'
    };
}

function getPixel(ctx, x, y) {
    return Array.from(ctx.getImageData(x, y, 1, 1).data);
}

async function render(style, width = 100, height = 60) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const rect = new DOMRect(0, 0, width, height);
    const element = { getBoundingClientRect: () => rect };
    await drawBackground(ctx, element, style, rect);
    return ctx;
}

describe('drawBackground', () => {
    it('resolves auto dimensions from the image aspect ratio', async () => {
        for (const [size, edge] of [['auto auto', 10], ['auto 20px', 20],
                                    ['30px auto', 30]]) {
            const style = getStyle(`url("${blueImage}")`, '0px 0px', size);
            const ctx = await render(style);
            expect(getPixel(ctx, edge - 1, edge - 1)).toEqual([0, 0, 255, 255]);
            expect(getPixel(ctx, edge + 1, edge - 1)).toEqual([0, 0, 0, 0]);
        }
    });

    it('draws the first background image on top', async () => {
        const style = getStyle(
            `url("${blueImage}"), url("${redImage}")`,
            '10px 10px, 0px 0px',
            '20px 20px, 100% 100%'
        );
        const ctx = await render(style);

        expect(getPixel(ctx, 15, 15)).toEqual([0, 0, 255, 255]);
        expect(getPixel(ctx, 50, 50)).toEqual([255, 0, 0, 255]);
    });

    it('resolves layered positions and calc sizes', async () => {
        const style = getStyle(
            `url("${blueImage}"), url("${redImage}")`,
            '31px 100%, 31px 0',
            '50px 20px, 50px calc(100% - 20px)'
        );
        const ctx = await render(style);

        expect(getPixel(ctx, 35, 30)).toEqual([255, 0, 0, 255]);
        expect(getPixel(ctx, 35, 50)).toEqual([0, 0, 255, 255]);
        expect(getPixel(ctx, 5, 30)).toEqual([0, 0, 0, 0]);
    });
});
