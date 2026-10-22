import { cardToCanvas } from './cardToCanvas/cardToCanvas.js';
import CardSheetPair from './CardSheetExporter/CardSheetPair.js';
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

export async function cardsToBlob(cards) {
    const faceCount = cards.reduce((count, card) => {
        return count + (card.back ? 2 : 1);
    }, 0);
    if (!faceCount) throw new Error('No cards to copy');

    const columns = Math.ceil(Math.sqrt(faceCount));
    const sheet = new CardSheetPair({
        backFaceMode: 'adjacent',
        backgroundColor: 'white',
        columns,
        gap: 0,
        imageType: 'image/png',
        leaveLastEmpty: false,
        quality: 1,
        rows: Math.ceil(faceCount / columns),
        scale: 2,
    }, 1);
    for (const card of cards)
        sheet.add(card);
    const canvas = await sheet.front.capture();
    return await canvasToBlob(canvas, 'image/png');
}

export async function saveHTMLAsImage(node, filename) {
    try {
        window.__EXPORTING__ = true;

        const stopwatch = new Stopwatch('render');
        const canvas = await cardToCanvas(node);
        stopwatch.lap('cardToCanvas');

        const imgURL = canvas.toDataURL('image/png');
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
