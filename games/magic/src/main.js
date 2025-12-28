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
import { 
    addAutoReminderText, 
    AbilityWordConverters, 
    matchAllKeywords 
} from './keywords/reminderText.js';
import { newUserKeyword, generateUserKeywordsForm } from './keywords/userKeywords.js';
import EditKeywordsModal from './keywords/editKeywordsModal.js';
import ViewKeywordsModal from './keywords/viewKeywordsModal.js';

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
        this.getThisType = getThisType;
        this.addAutoReminderText = (str, card) => addAutoReminderText(str, card, this);
        this.AbilityWordConverters = AbilityWordConverters;
        this.matchAllKeywords = (str, card) => matchAllKeywords(str, card, this);
        // this.generateUserKeywordsForm = generateUserKeywordsForm;
        // this.currentUserKeyword = this.userKeywords[0];
        // this.userKeywords = [newUserKeyword()];
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
        return { cards: [], info, keywordOverrides: {} };
    }
}
