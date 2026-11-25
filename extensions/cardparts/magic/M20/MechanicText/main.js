import TextModule from '../../M15/Text/main.js';
import { SectionConverter } from './src/SectionConverter.js';
import { ListConverter } from '../../M15/Text/src/ListConverter.js';

const L = localize('module-M20-mechanic-text');

export default class MechanicTextModule extends TextModule {
    get structureConverters() {
        return [ListConverter, SectionConverter];
    }

    async renderPreHTML(card) {
        this.preHTML = card.textToHTML(card.preText || this.defaultPreText);
        changed(card, ['preHTML']);
        this.requestRender({ render: 'renderPreText' });
    }

    bind(card, watch) {
        super.bind(card, watch);
        watch(card, ['maxFontSize', 'chopTop', 'chopBottom', 'preText'],
              () => this.renderPreHTML(card));
    }

    renderPreText(card) {
        return (
            `<auto-fit-text
               ${card.maxFontSize ? `max="${card.maxFontSize}"` : ''}
               style="${this.getTextStyle(card)}"
           >
                <div class="pre-text">${this.preHTML}</div>
            </auto-fit-text>`
        );
    }

    get fields() {
        return [
            { id: 'preText', type: 'textarea', label: L`Pretext` },
            { id: 'rulesText', type: 'code', syntax: 'mtg', label: L`Rules Text`}
        ];
    }

    async styles() {
        return [];
    }
}
