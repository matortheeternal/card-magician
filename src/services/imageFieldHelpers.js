const imageKeys = ['filename', 'xOffset', 'yOffset', 'width', 'height'];
function imageFields(obj) {
    return imageKeys.reduce((acc, key) => {
        if (key in obj) acc[key] = obj[key];
        return acc;
    }, {});
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            resolve(result.split(',')[1]);
        };
        reader.onerror = () => reject(new Error("Failed to read blob"));
        reader.readAsDataURL(blob);
    });
}

export async function saveImage(data, field) {
    const imageUrl = data[field.id]?.imageUrl;
    if (!imageUrl) return { imageBase64: null, type: null, filename: "" };

    const blob = await fetch(imageUrl).then(r => r.blob());
    const base64 = await blobToBase64(blob);

    return {
        imageBase64: base64,
        type: blob.type,
        ...imageFields(data[field.id])
    };
}

async function base64ToBlob(base64, mime) {
    const res = await fetch(`data:${mime};base64,${base64}`);
    return await res.blob();
}

const base64Marker = ';base64,';
function parseDataURL(raw) {
    const start = raw.lastIndexOf('data:');
    if (start === -1) return {};

    const candidate = raw.slice(start);
    const markerIndex = candidate.indexOf(base64Marker);
    if (markerIndex === -1) return {};

    const mime = candidate.slice(5, markerIndex);
    if (!mime.includes('/')) return {};

    const base64 = candidate.slice(markerIndex + base64Marker.length);
    return base64.length > 0 ? { base64, mime } : {};
}

async function loadLegacyImage(stored) {
    const raw = stored.image;
    if (!raw || typeof raw !== "string") return null;

    const { base64, mime } = parseDataURL(raw);
    if (!base64) return null;

    const blob = await fetch(`data:${mime};base64,${base64}`).then(r => r.blob());
    return URL.createObjectURL(blob);
}

async function loadBase64Blob(stored) {
    const { imageBase64, type } = stored;
    if (!imageBase64 || !type) return null;
    const blob = await base64ToBlob(imageBase64, type);
    return URL.createObjectURL(blob);
}

export async function loadImage(model, dataToLoad, field) {
    const existingUrl = model[field.id]?.imageUrl;
    if (existingUrl) URL.revokeObjectURL(existingUrl);

    const stored = dataToLoad[field.id];
    if (!stored) return { imageUrl: null, filename: "" };

    return {
        imageUrl: await loadBase64Blob(stored)
               || await loadLegacyImage(stored),
        ...imageFields(stored)
    };
}


