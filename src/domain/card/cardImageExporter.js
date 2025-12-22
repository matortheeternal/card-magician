import { snapdom } from '@zumer/snapdom';

async function inlineImages(root) {
    async function urlToDataURL(url) {
        const res = await fetch(url);
        const blob = await res.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    function extractUrls(str) {
        if (!str) return [];
        const urls = [];
        const regex = /url\((['"]?)(.*?)\1\)/g;
        let match;
        while ((match = regex.exec(str)) !== null) {
            if (!match[2].startsWith('data:'))
                urls.push(match[2]);
        }
        return urls;
    }

    // Inline IMG tags
    const imgElements = root.querySelectorAll('img[src]');
    for (const img of imgElements) {
        const src = img.getAttribute('src');
        if (!src || src.startsWith('data:')) continue;
        try {
            const dataURL = await urlToDataURL(src);
            img.setAttribute('src', dataURL);
        } catch (e) {
            console.warn('Failed to inline <img>', src, e);
        }
    }

    // Inline background-image URLs
    const tree = root.querySelectorAll('*');
    for (const el of tree) {
        const style = getComputedStyle(el);
        const bg = style.backgroundImage;

        const urls = extractUrls(bg);
        if (urls.length === 0) continue;

        const replacedParts = {};
        for (const url of urls) {
            try {
                replacedParts[url] = await urlToDataURL(url);
            } catch (e) {
                console.warn('Failed to inline BG image', url, e);
            }
        }

        if (Object.keys(replacedParts).length > 0) {
            let newBg = bg;
            for (const [url, dataURL] of Object.entries(replacedParts))
                newBg = newBg.replace(url, dataURL);
            el.style.backgroundImage = newBg;
        }
    }
}

function downloadImage(imageUrl, filename) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

const imageFormats = {
    jpg: (result, options) => result.toJpg(options),
    png: (result, options) => result.toPng(options),
    svg: (result, options) => result.toSvg(options),
};

export async function saveHTMLAsImage(node, filename) {
    try {
        window.__EXPORTING__ = true;
        let t0 = performance.now();
        await inlineImages(node);
        console.debug('[saveHTMLAsImage] inlineImages:', performance.now() - t0);

        t0 = performance.now();
        const result = await snapdom(node, { embedFonts: true, cache: 'full' });
        console.debug('[saveHTMLAsImage] snapdom:', performance.now() - t0);

        t0 = performance.now();
        const ext = filename.split('.').pop().toLowerCase();
        const formatFn = imageFormats[ext];
        const img = await formatFn(result, { scale: 2 });
        window.__EXPORTING__ = false;
        console.debug(`[saveHTMLAsImage] ${ext}:`, performance.now() - t0);

        downloadImage(img.src, filename);
        console.log(`Saved image to ${filename}`);
    } catch (err) {
        console.error('Failed to save image:', err);
    }
}
