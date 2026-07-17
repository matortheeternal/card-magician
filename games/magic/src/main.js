import * as ManaScribe from 'mana-scribe';
import Magic from '@sigil-sifter/magic';
import CardMageMagic from '@sigil-sifter/magic-cm';
import CardMageCard from '@sigil-sifter/magic-cm/card';
import { buildColumns, collectMap } from './ui/listView/columns.js';
import { autoNumberCards } from './domain/autoNumber.js';
import MakeManaCostAdapter from './domain/ManaCostAdapter.js';
import setInfoFields from './ui/setInfoModal/setInfoFields.js';
import SetInfoModal from './ui/setInfoModal/SetInfoModal.js';
import SigilSifter from 'sigil-sifter';
import ColorIdentity, { getCardFaceColors } from './domain/ColorIdentity.js';
import mtg from './domain/hljsMtg.js';
import baseCardFields from './baseCardFields.js';

const SET_FILE_VERSION = 1;

export default class MagicTheGathering extends CardMageGame {
    async init() {
        this.ManaScribe = ManaScribe;
        this.ColorIdentity = ColorIdentity;
        this.addSerializerAdapter(SerializerAdapter => {
            return MakeManaCostAdapter(SerializerAdapter, ManaScribe.ManaCost);
        });
        this.autoNumberCards = autoNumberCards;
        this.registerModal(SetInfoModal);
        this.registerLanguage('mtg', mtg, await this.loadFile('hljsMtg.css'));
        this.setupSearch();
    }

    setupSearch() {
        this.sifter = new SigilSifter();
        Magic(this.sifter, CardMageCard);
        CardMageMagic(this.sifter);
    }

    filter(cards, query) {
        return this.sifter.filter(cards, query);
    }

    get columns () {
        return buildColumns();
    }

    get defaultTemplateId() {
        return 'magic/M15/Main';
    }

    getCardName(card) {
        return collectMap(card, f => f.name, ' + ') || 'blank';
    }

    async getCardImages(card, fullSave) {
        return Promise.all(
            ['front', 'back'].filter(key => {
                return card[key]?.artImage?.imageUrl
                    && (card[key]?.artImage?.dirty || fullSave);
            }).map(async key => ({
                data: await card[key].artImage.loadImageData(),
                value: card[key].artImage,
                key
            }))
        );
    }

    loadSet(set) {
        const newSet = this.newSet();
        const info = { ...newSet.info, ...(set?.info ?? {}) };
        set.cards.forEach(card => {
            card.notes ||= '';
            card.tags ||= [];
        });
        return { ...info, ...newSet, ...set };
    }

    addComputedProps(cardFace) {
        cardFace.showPT = Boolean(cardFace.power || cardFace.toughness);
        cardFace.rarity ??= 'common';
        cardFace.colors = getCardFaceColors(cardFace);
    }

    get baseCardFields() {
        return Object.values(baseCardFields);
    }

    newCard() {
        return { front: {}, notes: '', dirty: true, tags: [] };
    }

    newSet() {
        const info = this.initializeFields(setInfoFields);
        return {
            ...info,
            version: SET_FILE_VERSION,
            defaultBackImage: this.resolveAsset('back.png'),
            export: { CardImagesExporter: {} },
            cards: []
        };
    }
}
