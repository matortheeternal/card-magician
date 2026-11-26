import platform from '../../platformAdapter.js';
import CardRenderer from '../../../domain/card/CardRenderer.js';
import CardSheetArtifact
    from '../../../domain/export/CardSheetExporter/CardSheetArtifact.js';
import { getFaceKeys } from '../../../domain/card/cardBuilder.js';
import {
    canvasToLosslessWebp, compareImages, imageDataToPng
} from './imageComparison.js';

const IMAGE_SCALE = 0.5;
const SHEET_CONFIG = { columns: 1, gap: 0, backgroundColor: 'transparent' };

async function writeBlob(filePath, blob) {
    await platform.createDirectory(await platform.getParentPath(filePath));
    await platform.writeBinaryFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function readBlob(filePath) {
    if (!await platform.checkFileExists(filePath)) return null;
    return new Blob([await platform.readBinaryFile(filePath)], { type: 'image/webp' });
}

function describeDifference(name, comparison) {
    if (comparison.sizes)
        return `${name} is ${comparison.sizes[0]}, expected ${comparison.sizes[1]}`;
    return `${name} differs in ${comparison.differentPixels} pixels `
        + `(largest channel difference ${comparison.maxDelta})`;
}

export default class TemplateCardTest {
    constructor(project, cardName, { record }) {
        this.project = project;
        this.cardName = cardName;
        this.record = record;
    }

    get baseCard() {
        return activeProject.cards.find(card => card.baseName === this.cardName);
    }

    imageName(faceKey) {
        const hasBackFace = Object.hasOwn(this.baseCard, 'back');
        return hasBackFace ? `${this.cardName} - ${faceKey}` : this.cardName;
    }

    async run() {
        if (!this.baseCard) return fail(`${this.cardName} was not loaded`);
        for await (const output of this.renderFaces())
            await this.checkFace(output.card.faceKey, output.cardCanvas);
    }

    async *renderFaces() {
        const sheet = new CardSheetArtifact(SHEET_CONFIG);
        const renderer = new CardRenderer(this.baseCard);
        for (const faceKey of getFaceKeys(this.baseCard))
            sheet.add({ card: renderer, faceKey });
        try {
            yield* sheet.cardOutputs({ scale: IMAGE_SCALE });
        } finally {
            sheet.cleanup();
        }
    }

    async checkFace(faceKey, canvas) {
        const name = this.imageName(faceKey);
        const actual = await canvasToLosslessWebp(canvas);
        if (this.record)
            return writeBlob(this.project.expectedImagePath(name), actual);
        const expected = await readBlob(this.project.expectedImagePath(name));
        if (!expected)
            return fail(`${name} has no expected image; run with --record to create it`);
        const comparison = await compareImages(actual, expected);
        if (comparison.matches) return;
        await this.writeFailure(name, actual, comparison);
        fail(describeDifference(name, comparison));
    }

    async writeFailure(name, actual, comparison) {
        await writeBlob(this.project.imagePath('output', name, 'webp'), actual);
        if (!comparison.diff) return;
        const diff = await imageDataToPng(comparison.diff);
        await writeBlob(this.project.imagePath('output', `${name}.diff`, 'png'), diff);
    }
}
