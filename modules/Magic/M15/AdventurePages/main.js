export default class AdventurePagesModule extends CardMagicianModule {
    async updateBackgrounds(card) {
        const activeFrame = card.parent().activeFrame?.();
        if (!activeFrame) return;
        this.backgrounds = await activeFrame.buildBackgrounds('pages', card.parent());
        const parentRoot = card.parent().dom.root;
        if (this.oldPageStyle) parentRoot.classList.toggle(this.oldPageStyle, false);
        const pageStyleClass = `page-style-${card.pageStyle}`;
        parentRoot.classList.toggle(pageStyleClass, true);
        this.oldPageStyle = pageStyleClass;
        this.requestRender();
    }

    bind(card, watch) {
        watch(
            () => [
                card.colorIdentity,
                card.parent().colorIdentity,
                card.pageStyle,
                card.parent().activeFrame
            ],
            () => this.updateBackgrounds(card)
        );
    }

    renderBackgrounds() {
        if (!this.backgrounds) return;
        return this.backgrounds.map(bg => (
            `<div class="bg ${bg.id}" style="${this.objectToStyle(bg.style)}"></div>`
        )).join('\n');
    }

    get options() {
        return [{
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
        }]
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
