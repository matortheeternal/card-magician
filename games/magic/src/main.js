import * as ManaScribe from 'mana-scribe';
import Magic from '@sigil-sifter/magic';
import CardMagicianMagic from '@sigil-sifter/magic-cm';
import CardMagicianCard from '@sigil-sifter/magic-cm/card';
import {buildColumns, collectMap} from './columns.js';
import { autoNumberCards } from './autoNumber.js';
import MakeManaCostAdapter from './ManaCostAdapter.js';
import setInfoFields from './setInfoFields.js';
import SetInfoModal from './SetInfoModal.js';
import SigilSifter from 'sigil-sifter';

const SET_FILE_VERSION = 1;

export default class MagicTheGathering extends CardMagicianGame {
    async init() {
        this.ManaScribe = ManaScribe;
        this.addSerializerAdapter(SerializerAdapter => {
            return MakeManaCostAdapter(SerializerAdapter, ManaScribe.ManaCost);
        });
        this.autoNumberCards = autoNumberCards;
        this.registerModal(SetInfoModal);
        this.setupSearch();
    }

    setupSearch() {
        this.sifter = new SigilSifter();
        Magic(this.sifter, CardMagicianCard);
        CardMagicianMagic(this.sifter);
    }

    filter(cards, query) {
        return this.sifter.filter(cards, query);
    }

    get columns () {
        return buildColumns();
    }

    get defaultTemplateId() {
        return 'M15Main';
    }

    getCardName(card) {
        return collectMap(card, f => f.name || 'blank', ' + ');
    }

    async getCardImages(card) {
        return Promise.all(
            ['front', 'back'].filter(key => {
                return card[key]?.artImage?.imageUrl
                    && card[key]?.artImage?.dirty;
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

    newCard() {
        return { front: {}, notes: '', dirty: true, tags: [] };
    }

    newSet() {
        const info = this.initializeFields(setInfoFields);
        return {
            ...info,
            version: SET_FILE_VERSION,
            export: { CardImagesExporter: {} },
            cards: []
        };
    }
}
