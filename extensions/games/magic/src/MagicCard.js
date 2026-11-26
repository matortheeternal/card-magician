import { reconcileCardTags } from './domain/cardTagInheritance.js';
import { collectMap } from './ui/listView/columns.js';

// we extend window.CardMagicianCard so the IDE does not get confused
// with the class of the same name from sigil-sifter
export default class MagicCard extends window.CardMagicianCard {
    constructor(data = {}) {
        super({
            front: {},
            notes: '',
            tags: [],
            ...data
        });
        const { tags, inheritedTags } = reconcileCardTags(this);
        this.tags = tags;
        if (inheritedTags.length || Object.hasOwn(this, 'inheritedTags'))
            this.inheritedTags = inheritedTags;
    }

    get fileDefinitions() {
        return [
            ...super.fileDefinitions,
            new CardImageFileDefinition('front.artImage'),
            new CardImageFileDefinition('back.artImage', {
                suffix: ' - Back'
            }),
        ];
    }

    get name() {
        return collectMap(this, f => f.name, ' + ') || 'blank';
    }

    get faces() {
        const a = [];
        if (this.front) a.push(this.front);
        if (this.back) a.push(this.back);
        return a;
    }
}
