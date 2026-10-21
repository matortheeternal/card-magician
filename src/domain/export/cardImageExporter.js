import { cardToCanvas } from './cardToCanvas/cardToCanvas.js';
import Stopwatch from '../../shared/Stopwatch.js';

function downloadImage(imageUrl, filename) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error(`Failed to encode ${type} image`));
        }, type, quality);
    });
}

export async function cardFacesToBlob(cardFaces) {
    window.__EXPORTING__ = true;
    try {
        const canvases = [];
        for (const cardFace of cardFaces)
            canvases.push(await cardToCanvas(cardFace));
        if (!canvases.length) throw new Error('No card faces to copy');

        const canvas = document.createElement('canvas');
        canvas.width = canvases.reduce((width, face) => width + face.width, 0);
        canvas.height = Math.max(...canvases.map(face => face.height));
        const context = canvas.getContext('2d');
        let x = 0;
        for (const face of canvases) {
            context.drawImage(face, x, 0);
            x += face.width;
        }
        return await canvasToBlob(canvas, 'image/png');
    } finally {
        window.__EXPORTING__ = false;
    }
}

export async function saveHTMLAsImage(node, filename) {
    try {
        window.__EXPORTING__ = true;

        const stopwatch = new Stopwatch('render');
        const canvas = await cardToCanvas(node);
        stopwatch.lap('cardToCanvas');

        const imgURL = canvas.toDataURL('image/jpg', 0.92);
        stopwatch.lap('toDataUrl');

        downloadImage(imgURL, filename);
        stopwatch.complete('saveHTMLAsImage');
        log('fs').info(`Saved image to ${filename}`);
    } catch (err) {
        log('fs').error('Failed to save image:', err);
    } finally {
        window.__EXPORTING__ = false;
    }
}
