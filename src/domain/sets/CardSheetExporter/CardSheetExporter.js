import CardSheetPair from './CardSheetPair.js';
import { addNativeExporter } from '../exporterManager.js';

export default class CardSheetExporter extends CardMagicianExporter {
    get defaultConfig() {
        return {
            imageType: 'png',
            quality: 0.92,
            scale: 1.5,
            columns: 10,
            rows: 7,
            gap: 0,
            backFaceMode: 'adjacent',
            backgroundColor: 'black',
            leaveLastEmpty: true,
        };
    }

    get activeSheet() {
        return this.sheets[this.sheets.length - 1];
    }

    appendNewCardSheet() {
        const sheetNumber = this.sheets.length + 1;
        this.sheets.push(new CardSheetPair(this.config, sheetNumber));
    }

    async prepare() {
        this.sheets = [];
        for (const card of this.activeSet.cards) {
            if (!this.activeSheet?.hasSpaceFor(card))
                this.appendNewCardSheet();
            this.activeSheet.add(card);
        }
    }

    async *produce() {
        const manifest = {};
        for (const sheet of this.sheets) {
            for await (const value of sheet.produce())
                yield value;
        }
        return manifest;
    }
}

addNativeExporter({
    id: 'CardSheetExporter',
    description: 'Exports to a sheet of cards.',
    version: '0.0',
    ExporterClass: CardSheetExporter
});
