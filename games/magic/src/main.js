import * as ManaScribe from 'mana-scribe';
import Magic from '@sigil-sifter/magic';
import CardMagicianMagic from '@sigil-sifter/magic-cm';
import CardMagicianCard from '@sigil-sifter/magic-cm/card';
import { buildColumns } from './columns.js';
import { autoNumberCards } from './autoNumber.js';
import MakeManaCostAdapter from './ManaCostAdapter.js';

export default class MagicTheGathering extends CardMagicianGame {
    async init() {
        this.ManaScribe = ManaScribe;
        this.addSerializerAdapter(SerializerAdapter => {
            return MakeManaCostAdapter(SerializerAdapter, ManaScribe.ManaCost);
        });
        this.setInfoHtml = await this.loadFile('setInfo.html');
        this.defaultSetSymbol = await this.loadFile('defaultSymbol.svg');
        this.autoNumberCards = autoNumberCards;

        this.numberFormatField = {
            id: 'collectorNumberFormat',
            label: 'Collector Number Format',
            options: [
                { id: 'four', name: '0001' },
                { id: 'threeOutOf', name: '001/999' },
            ]
        };
        this.rarityOrderField = {
            id: 'rarityOrder',
            label: 'Footer Rarity Order',
            options: [
                { id: 'before', name: 'Before Collector Number' },
                { id: 'after', name: 'After Collector Number' },
            ]
        };
    }

    setupSearch(sifter) {
        Magic(sifter, CardMagicianCard);
        CardMagicianMagic(sifter);
    }

    get columns () {
        return buildColumns();
    }

    get defaultTemplateId() {
        return 'M15Main';
    }

    loadSet(set) {
        const newSet = this.newSet();
        const info = { ...newSet.info, ...(set?.info ?? {}) };
        return { ...newSet, ...set, info };
    }

    newCard() {
        return { front: {} };
    }

    newSet() {
        const info = {
            language: 'EN',
            setCode: '',
            symbol: this.defaultSetSymbol,
            collectorNumberFormat: this.numberFormatField.options[0].id,
            rarityOrder: this.rarityOrderField.options[0].id,
        };
        return { cards: [], info };
    }

    renderSetInfo() {
        return this.setInfoHtml;
    }
}
