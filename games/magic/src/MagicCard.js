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

    async getCardImages(fullSave) {
        return Promise.all(
            this.faces.filter(face => {
                return face?.artImage?.imageUrl
                    && (face?.artImage?.dirty || fullSave);
            }).map(async face => ({
                data: await face.artImage.loadImageData(),
                value: face.artImage,
                key: face.id
            }))
        );
    }
}
