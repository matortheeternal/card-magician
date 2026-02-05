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

export async function saveHTMLAsImage(node, filename) {
    try {
        window.__EXPORTING__ = true;

        const stopwatch = new Stopwatch('render');
        const canvas = await cardToCanvas(node);
        stopwatch.lap('cardToCanvas');

        const imgURL = canvas.toDataURL('image/jpg', 0.92);
        window.__EXPORTING__ = false;
        stopwatch.lap('toDataUrl');

        downloadImage(imgURL, filename);
        stopwatch.complete('saveHTMLAsImage');
        log('fs').info(`Saved image to ${filename}`);
    } catch (err) {
        log('fs').error('Failed to save image:', err);
    }
}
