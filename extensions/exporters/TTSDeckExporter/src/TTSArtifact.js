const mainRarities = [
    'common', 'uncommon', 'rare', 'mythic'
];

export default class TTSArtifact extends ExportArtifact {
    constructor(config) {
        super();
        this.basePath = config.basePath.endsWith('/')
            ? config.basePath
            : config.basePath + '/';
    }

    getCardKey(card) {
        const rarity = String(card?.front?.rarity || 'common');
        if (!mainRarities.includes(rarity))
            return 'other';
        return rarity;
    }

    *cards() {
        for (const card of window.activeProject.cards) {
            const key = this.getCardKey(card);
            yield { key, card };
        }
    }

    createTransform(y = 0, index = 0) {
        return {
            posX: 2.5 * index,
            posY: y,
            posZ: 0,
            rotX: 0,
            rotY: 180,
            rotZ: 180,
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1
        };
    }

    createCardObject(CardID, card) {
        return {
            CardID,
            Name: 'Card',
            Nickname: card.front.name,
            Transform: this.createTransform()
        };
    }

    createCustomDeckEntry(card) {
        return {
            FaceURL: this.basePath + encodeURI(card.imageExports.front),
            BackURL: this.basePath + `CardBack.jpg`,
            NumHeight: 1,
            NumWidth: 1,
            BackIsHidden: true,
        };
    }

    createDeckObject(rarity, cards, index) {
        const ContainedObjects = [];
        const DeckIDs = [];
        const CustomDeck = {};
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const CardID = 100 * i + 100;
            const DeckKey = (i + 1).toString();
            const cardObject = this.createCardObject(CardID, card);
            ContainedObjects.push(cardObject);
            DeckIDs.push(CardID);
            CustomDeck[DeckKey] = this.createCustomDeckEntry(card);
        }

        return {
            Name: `DeckCustom`,
            Nickname: `${window.activeProject.setCode} ${rarity} cards`,
            ContainedObjects,
            DeckIDs,
            CustomDeck,
            Transform: this.createTransform(1, index)
        }
    }

    get objectStates() {
        const GroupedCards = {};
        for (const { key, card } of this.cards()) {
            GroupedCards[key] ||= [];
            GroupedCards[key].push(card);
        }
        return Object.entries(GroupedCards).map(
            ([key, value], index) => this.createDeckObject(key, value, index)
        );
    }

    async toBuffer() {
        return JSON.stringify({ ObjectStates: this.objectStates });
    }
}
