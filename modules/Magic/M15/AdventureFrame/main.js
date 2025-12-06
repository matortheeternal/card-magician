import FrameModule from '../Frame/main.js';
import AdventureFrame from './src/AdventureFrame.js';
import AdventureSpotlightFrame from './src/AdventureSpotlightFrame.js';

export default class AdventureFrameModule extends FrameModule {
    async init(card) {
        await super.init(card, false);
        card.frames = [AdventureSpotlightFrame, AdventureFrame];
        this.frameOptions = [
            { id: 'normal',     name: 'Adventure' },
            { id: 'spotlight',  name: 'Spotlight Adventure' },
            { id: 'reversed',   name: 'Reversed Adventure' },
        ];
    }

    updateTopClasses(card) {
        if (!this.backgrounds) return;
        const classes = [`page-style-${card.pageStyle}`];
        for (const bg of this.backgrounds)
            classes.push(`frame-${bg.id}`);
        card.dom.root.className = classes.join(' ');
    }

    async updatePages(card) {
        if (!this.activeFrame) return;
        this.pageBackgrounds = await this.activeFrame.buildBackgrounds('pages', card);
        this.updateTopClasses(card);
        this.requestRender({ render: 'renderPages' });
    }

    updateShowFrameExtras(card) {
        card.showFrameExtras = card.frame !== 'spotlight';
    }

    bind(card, watch) {
        super.bind(card, watch);
        watch(() => card.frame, () => this.updateShowFrameExtras(card));
        watch(() => [
            card.colorIdentity, card.adventure.colorIdentity,
            card.pageStyle, card.activeFrame
        ], () => this.updatePages(card));
    }

    renderPages() {
        if (!this.pageBackgrounds) return;
        return this.pageBackgrounds.map(bg => (
            `<div class="bg ${bg.id}" style="${this.objectToStyle(bg.style)}"></div>`
        )).join('\n');
    }

    get options() {
        return [...super.options, {
            id: 'pageStyle',
            label: 'Page Style',
            type: 'select',
            options: [
                { id: 'name_and_type', name: 'Name and Type' },
                { id: 'name_and_type_flat', name: 'Flat Name and Type' },
                { id: 'name_flat', name: 'Flat Name' },
                { id: 'name', name: 'Name' },
                { id: 'blank', name: 'Blank' },
            ]
        }];
    }
}
