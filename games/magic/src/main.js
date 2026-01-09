import * as ManaScribe from 'mana-scribe';
import Magic from '@sigil-sifter/magic';
import CardMagicianMagic from '@sigil-sifter/magic-cm';
import CardMagicianCard from '@sigil-sifter/magic-cm/card';
import { buildColumns } from './columns.js';
import { autoNumberCards } from './autoNumber.js';
import MakeManaCostAdapter from './ManaCostAdapter.js';
import setInfoFields from './setInfoFields.js';
import SetInfoModal from './SetInfoModal.js';
import { getThisType } from './thisType.js';
import { addAutoReminderText, matchAllKeywords } from './keywords/reminderText.js';
import EditKeywordsModal from './keywords/editKeywordsModal/editKeywordsModal.js';
import ViewKeywordsModal from './keywords/viewKeywordsModal/viewKeywordsModal.js';
import AutoReplaceConverters from './autoReplacers.js';

export default class MagicTheGathering extends CardMagicianGame {
    async init() {
        this.ManaScribe = ManaScribe;
        this.addSerializerAdapter(SerializerAdapter => {
            return MakeManaCostAdapter(SerializerAdapter, ManaScribe.ManaCost);
        });
        this.autoNumberCards = autoNumberCards;
        this.registerModal(SetInfoModal);
        this.registerModal(EditKeywordsModal);
        this.registerModal(ViewKeywordsModal);
        this.addAutoReminderText = (str, card) => 
            addAutoReminderText(str, card, this.getActiveSet());
        this.matchAllKeywords = (str, card) => 
            matchAllKeywords(str, card, this.getActiveSet());
        this.AutoReplaceConverters = AutoReplaceConverters;
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
        set.cards.forEach(card => {
            card.notes ||= '';
            card.tags ||= [];
        });
        return { ...newSet, ...set, info };
    }

    newCard() {
        return { front: {}, notes: '', tags: [] };
    }

    newSet() {
        const info = this.initializeFields(setInfoFields);
        return { cards: [], info, keywordOverrides: {}, userKeywords: [] };
    }

    bindCardFunctions(card) {
        card.getThisType = getThisType.bind(card);
    }
}
