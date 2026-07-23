import * as ManaScribe from 'mana-scribe';
import Magic from '@sigil-sifter/magic';
import CardMagicianMagic from '@sigil-sifter/magic-cm';
import CardMagicianCard from '@sigil-sifter/magic-cm/card';
import { buildColumns } from './ui/listView/columns.js';
import { autoNumberCards } from './domain/autoNumber.js';
import MakeManaCostAdapter from './domain/ManaCostAdapter.js';
import SetInfoModal from './ui/setInfoModal/SetInfoModal.js';
import SigilSifter from 'sigil-sifter';
import ColorIdentity, { getCardFaceColors } from './domain/ColorIdentity.js';
import mtg from './domain/hljsMtg.js';
import baseCardFields from './baseCardFields.js';
import MagicProject from './MagicProject.js';
import MagicCard from './MagicCard.js';

export default class MagicTheGathering extends CardMagicianGame {
    constructor(gamePath) {
        super(gamePath);
        this.ManaScribe = ManaScribe;
        this.ColorIdentity = ColorIdentity;
        this.Project = MagicProject;
        this.Card = MagicCard;
    }

    async init() {
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
        Magic(this.sifter, CardMagicianCard);
        CardMagicianMagic(this.sifter);
    }

    filter(cards, query) {
        return this.sifter.filter(cards, query);
    }

    get columns() {
        return buildColumns();
    }

    get defaultTemplateId() {
        return 'magic/M15/Main';
    }

    addComputedProps(cardFace) {
        cardFace.showPT = Boolean(cardFace.power || cardFace.toughness);
        cardFace.rarity ??= 'common';
        cardFace.colors = getCardFaceColors(cardFace);
    }

    get baseCardFields() {
        return Object.values(baseCardFields);
    }

    newPackSlot() {
        return { label: 'New Slot', count: 1, pool: [] };
    }
}
