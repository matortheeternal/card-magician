import CardSheetPair from './CardSheetPair.js';
import { addNativeExporter } from '../exporterManager.js';
import form from './form.html.js';

const L = localize('card-sheet-exporter');

export default class CardSheetExporter extends CardMagicianExporter {
    static get options() {
        return [{
            id: 'imageType',
            label: L`Image Type`,
            type: 'select',
            options: [
                { id: 'png', name: L`PNG` },
                { id: 'jpg', name: L`JPG` },
            ]
        }, {
            id: 'quality',
            label: L`Image Quality`,
            default: '0.92'
        }, {
            id: 'scale',
            label: L`Scale`,
            default: '1'
        }, {
            id: 'columns',
            label: L`Columns`,
            default: '10'
        }, {
            id: 'rows',
            label: L`Rows`,
            default: '7'
        }, {
            id: 'gap',
            label: L`Gap`,
            default: '0'
        }, {
            id: 'backFaceMode',
            label: L`Back Face Mode`,
            type: 'select',
            options: [
                { id: 'adjacent', name: 'Adjacent' },
                { id: 'separate', name: 'Separate' },
            ]
        }, {
            id: 'backgroundColor',
            label: L`Background Color`,
            type: 'color',
            default: 'white'
        }, {
            id: 'leaveLastEmpty',
            label: L`Leave Last Slot Empty`,
            type: 'checkbox',
            default: true
        }];
    }

    get activeSheet() {
        return this.sheets[this.sheets.length - 1];
    }

    appendNewCardSheet() {
        const sheetNumber = this.sheets.length + 1;
        this.sheets.push(new CardSheetPair(this.config, sheetNumber));
    }

    get selectedCards() {
        const listView = document.querySelector('cm-list-view');
        const selection = listView.selection;
        return this.activeSet.cards.filter(card => {
            return selection.length === 1 || selection.some(row => {
                return row.original === card;
            });
        });
    }

    async prepare() {
        this.sheets = [];
        for (const card of this.selectedCards) {
            if (!this.activeSheet?.hasSpaceFor(card))
                this.appendNewCardSheet();
            this.activeSheet.add(card);
        }
    }

    async *produce() {
        for (const sheet of this.sheets) {
            for await (const value of sheet.produce())
                yield value;
        }
    }

    getOutputCount() {
        return this.sheets.reduce((total, sheet) => {
            return total + sheet.getOutputCount();
        }, 0);
    }
}

addNativeExporter({
    id: 'CardSheetExporter',
    folder: 'sheets',
    description: 'Exports to a sheet of cards.',
    version: '0.0',
    ExporterForm: form,
    ExporterClass: CardSheetExporter
});
