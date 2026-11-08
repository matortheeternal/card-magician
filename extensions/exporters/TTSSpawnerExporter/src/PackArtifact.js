const colorOrder = ['w', 'u', 'b', 'r', 'g'];

export default class PackArtifact extends ExportArtifact {
    constructor(config) {
        super();
        this.basePath = config.basePath.endsWith('/')
            ? config.basePath
            : config.basePath + '/';
        this.cards = window.activeProject.cards;
        this.cardIds = new Map(
            this.cards.map((card, index) => [card, index + 1])
        );
    }

    getCardId(card) {
        const cardId = this.cardIds.get(card);
        if (cardId === undefined)
            throw new Error('Pack query returned a card outside activeProject.cards.');
        return cardId;
    }

    getCardColors(card) {
        const colors = new Set(
            (card?.front?.colors || [])
                .map(color => String(color.char || '').toLowerCase())
                .filter(Boolean)
        );

        return [...colors].sort((a, b) => {
            const aIndex = colorOrder.indexOf(a);
            const bIndex = colorOrder.indexOf(b);
            if (aIndex === -1 && bIndex === -1)
                return a.localeCompare(b);
            if (aIndex === -1)
                return 1;
            if (bIndex === -1)
                return -1;
            return aIndex - bIndex;
        });
    }

    createRunBuckets(cards) {
        const colorCountGroups = new Map();

        for (const card of cards) {
            const colors = this.getCardColors(card);
            const colorCount = colors.length;
            const colorIdentity = colors.join('') || 'c';

            if (!colorCountGroups.has(colorCount))
                colorCountGroups.set(colorCount, new Map());

            const identityGroups = colorCountGroups.get(colorCount);
            if (!identityGroups.has(colorIdentity))
                identityGroups.set(colorIdentity, []);

            identityGroups.get(colorIdentity).push(this.getCardId(card));
        }

        return [...colorCountGroups.entries()]
            .sort(([a], [b]) => a - b)
            .map(([colorCount, identityGroups]) => {
                const identities = [...identityGroups.entries()]
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([colorIdentity, cardIds]) => ({
                        colorIdentity,
                        size: cardIds.length,
                        cardIds
                    }));

                return {
                    colorCount,
                    size: identities.reduce(
                        (total, identity) => total + identity.size,
                        0
                    ),
                    identities
                };
            });
    }

    resolvePool(pool) {
        const cards = Array.from(
            activeGame.filter(this.cards, pool.expression)
        );
        const weight = Number(pool.weight);

        if (!Number.isInteger(weight) || weight <= 0) {
            throw new Error(
                `Pack pool weight must be a positive integer: ${pool.weight}`
            );
        }

        return {
            expression: pool.expression,
            weight,
            cards
        };
    }

    createPackSlot(slot) {
        const count = Number(slot.count);
        if (!Number.isInteger(count) || count < 0) {
            throw new Error(
                `Pack slot count must be a non-negative integer: ${slot.count}`
            );
        }

        if (!['runs', 'sheet'].includes(slot.collation)) {
            throw new Error(
                `Unsupported pack collation "${slot.collation}" for ${slot.label}.`
            );
        }

        const resolvedPools = slot.pool
            .map(pool => this.resolvePool(pool))
            .filter(pool => pool.cards.length > 0);

        if (count > 0 && resolvedPools.length === 0)
            throw new Error(`Pack slot "${slot.label}" resolves to no cards.`);

        return {
            label: slot.label,
            count,
            collation: slot.collation,
            pools: resolvedPools.map(pool => ({
                weight: pool.weight,
                size: pool.cards.length,
                cardIds: pool.cards.map(card => this.getCardId(card)),
                runBuckets: slot.collation === 'runs'
                    ? this.createRunBuckets(pool.cards)
                    : undefined
            }))
        };
    }

    createCardDefinition(card, index) {
        return {
            id: index + 1,
            nickname: card.front.name,
            faceUrl: this.basePath + encodeURI(card.imageExports.front)
        };
    }

    collectPoolCardIds(pools, cardIds) {
        for (const pool of pools)
            for (const cardId of pool.cardIds) cardIds.add(cardId);
    }

    createManifest() {
        if (!Array.isArray(window.activeProject.pack))
            throw new Error('The active project has no pack configuration.');

        const packSlots = window.activeProject.pack.map(
            slot => this.createPackSlot(slot)
        );
        const boosterCardIds = new Set();

        for (const slot of packSlots)
            this.collectPoolCardIds(slot.pools, boosterCardIds);


        const extras = this.cards
            .map((card, index) => ({ card, cardId: index + 1 }))
            .filter(({ cardId }) => !boosterCardIds.has(cardId))
            .map(({ cardId }) => cardId);

        return {
            setCode: window.activeProject.setCode,
            backUrl: this.basePath + 'CardBack.jpg',
            cards: this.cards.map(
                (card, index) => this.createCardDefinition(card, index)
            ),
            packSlots,
            extras
        };
    }

    async toBuffer() {
        const manifest = this.createManifest();
        return JSON.stringify(manifest);
    }
}
