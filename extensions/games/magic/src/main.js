import { initializeCardFace } from './domain/cardTraits/initializeCardFace.js';
import * as textStructures from './domain/cardTraits/textStructures.js';
import './ui/editSetSymbol/editSetSymbol.css';
import { renderSetSymbol } from './domain/setSymbol/renderSetSymbol.js';
import * as ManaScribe from 'mana-scribe';
import CardInspector from './domain/inspections/CardInspector.js';
import pieInspections from './domain/inspections/pieInspections.js';
import { CARD_INSPECTIONS } from './domain/inspections/cardInspections.js';
import Magic from '@sigil-sifter/magic';
import CardMagicianMagic from '@sigil-sifter/magic-cm';
import CardMagicianCard from '@sigil-sifter/magic-cm/card';
import { editCardTags } from './domain/cardTagInheritance.js';
import {
    canonicalTag, effectiveTags, equivalentTags, inheritedTagSources, specificTags
} from 'oracle-of-pie';
import { buildColumns } from './ui/listView/columns.js';
import { autoNumberCards } from './domain/autoNumber.js';
import MakeManaCostAdapter from './domain/ManaCostAdapter.js';
import defaultPackStructure from './domain/defaultPackStructure.js';
import SigilSifter from 'sigil-sifter';
import ColorIdentity, { getCardFaceColors } from './domain/ColorIdentity.js';
import OracleAssistance from './domain/OracleAssistance.js';
import mtg from './domain/hljsMtg.js';
import { entriesFor } from './domain/projectMechanics.js';
import baseCardFields from './baseCardFields.js';
import MagicProject from './MagicProject.js';
import MagicCard from './MagicCard.js';
import MagicSymbols from './domain/symbols/MagicSymbols.js';
import MagicProjectDetails from './ui/settings/MagicProjectDetails.js';
import InspectionSettings from './ui/settings/inspections/InspectionSettings.js';
import filterPresets from './ui/buildFilterModal/filterPresets.js';
import MechanicSettings from './ui/settings/MechanicSettings.js';
import MagicEditorSettings from './ui/settings/MagicEditorSettings.js';
import MagicSettings from './ui/settings/MagicSettings.js';
import SetIconEditorSettings from './ui/settings/SetIconEditorSettings.js';
import FaceSymbolSettings from './ui/settings/FaceSymbolSettings.js';
import { registerStatistics } from './statistics/registerStatistics.js';

class MagicSearchCard extends CardMagicianCard {
    get keywords() {
        const { keywords } = this.card;
        return keywords?.map(keyword => keyword.toLowerCase()) ?? super.keywords;
    }

    get tags() {
        return equivalentTags(super.tags);
    }
}

function randomId() {
    return Math.random().toString(36).substring(2, 10);
}

export default class MagicTheGathering extends CardMagicianGame {
    #updateMtgLanguage;
    #mechanicNames = '[]';

    constructor(metadata) {
        super(metadata);
        this.renderSetSymbol = renderSetSymbol;
        this.ManaScribe = ManaScribe;
        this.ColorIdentity = ColorIdentity;
        this.Project = MagicProject;
        this.Card = MagicCard;
        this.filterPresets = filterPresets;
        this.symbols = new MagicSymbols(this);
        this.textStructures = textStructures;
        this.oracleAssistance = new OracleAssistance();
        this.cardInspector = new CardInspector();
        this.tagRelationships = {
            canonicalTag, effectiveTags, equivalentTags, inheritedTagSources, specificTags
        };
        this.editCardTags = editCardTags;
        registerStatistics(this);
    }

    initializeCardFace(face) {
        initializeCardFace(face);
        this.symbols.initializeCardFace(face);
    }

    async init() {
        this.addSerializerAdapter(SerializerAdapter => {
            return MakeManaCostAdapter(SerializerAdapter, ManaScribe.ManaCost);
        });
        this.faceSymbolManager = this.manageCollection({
            path: () => [appEnvironment.paths.data, 'magic', 'faceSymbols.yml'],
            matches: (faceSymbol, name) => faceSymbol.name === name,
            next: tryCount => `Custom Face Symbol`
                + (tryCount <= 1 ? '' : ` ${tryCount}`),
            create: name => ({ id: `custom_${randomId()}`, name })
        });
        await this.faceSymbolManager.load();
        this.autoNumberCards = autoNumberCards;
        this.registerSettings(MagicSettings);
        this.registerSettings(MagicEditorSettings);
        this.registerSettings(MechanicSettings);
        this.registerSettings(FaceSymbolSettings);
        this.registerSettings(SetIconEditorSettings);
        this.registerSettings(MagicProjectDetails);
        for (const inspection of [...pieInspections(), ...CARD_INSPECTIONS])
            this.registerInspection(inspection);
        this.registerSettings(InspectionSettings);
        this.#updateMtgLanguage = this.registerLanguage(
            'mtg', () => mtg(), await this.loadFile('hljsMtg.css')
        );
        this.setupSearch();
    }

    prepareRulesSyntax(project) {
        if (!this.#updateMtgLanguage) return;
        const names = entriesFor(project)
            .filter(({ definition }) => !definition.disabled)
            .map(({ definition }) => definition.name);
        const key = JSON.stringify(names);
        if (key === this.#mechanicNames) return;
        this.#updateMtgLanguage(() => mtg(names));
        this.#mechanicNames = key;
    }

    setupSearch() {
        this.sifter = new SigilSifter();
        Magic(this.sifter, CardMagicianCard);
        CardMagicianMagic(this.sifter);
        this.sifter.setInputAdapter(MagicSearchCard);
    }

    filter(cards, query) {
        return this.sifter.filter(cards, query);
    }

    get columns() {
        return buildColumns();
    }

    get statisticsComponent() { return 'cm-magic-statistics'; }

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

    get defaultPackStructure() {
        return defaultPackStructure();
    }

    newPackSlot() {
        return { label: 'New Slot', count: 1, pool: [], collation: 'runs' };
    }
}
