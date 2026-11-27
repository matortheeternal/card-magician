import Oracle from 'oracle-of-pie';
import { getPrintedColors } from './ColorIdentity.js';
import { mechanicFields, projectDefinitions } from './projectMechanics.js';
import {
    eligibilityFields, getCardFaces, isOracleCard
} from './oracleCardEligibility.js';
import { markUnrecognizedText } from './hljsMtg.js';
import { defaultOracleTagStyle, oracleTagStyles } from './oracleTagStyles.js';
import { projectKeywordTagStyles } from './projectKeywordTagStyles.js';

function faceMetadata(face, faceCount) {
    const superType = face.superType ?? '';
    return {
        name: face.name ?? '',
        typeLine: face.subType ? `${superType} — ${face.subType}` : superType,
        loyalty: face.loyalty,
        colors: getPrintedColors(face),
        faceCount
    };
}

function cardForFace(face) {
    const root = face.isSubcard ? face.parent() : face;
    return root.parent?.() ?? { front: root };
}

export default class OracleAssistance {
    eligibilityFields = eligibilityFields;
    faceFields = [
        'name', 'superType', 'subType', 'loyalty', 'manaCost', 'colorOverride',
        ...eligibilityFields
    ];
    defaultTagStyles = oracleTagStyles;
    definitionFields = [...Object.values(mechanicFields), 'customTokens'];
    #cache = new WeakMap();
    #definitionKey;
    #oracle;
    #keywordStylesKey;
    #keywordStyles = new Map();

    oracleFor(project) {
        const definitions = projectDefinitions(project);
        const key = JSON.stringify(definitions);
        if (key === this.#definitionKey) return this.#oracle;
        const enabled = Object.entries(definitions).map(([kind, entries]) =>
            [kind, entries.filter(entry => !entry.disabled)]);
        this.#oracle = new Oracle({ definitions: Object.fromEntries(enabled) });
        this.#definitionKey = key;
        this.#cache = new WeakMap();
        return this.#oracle;
    }

    keywordTagStyles(project) {
        const keywords = projectDefinitions(project).keywords;
        const key = JSON.stringify(keywords);
        if (key === this.#keywordStylesKey) return this.#keywordStyles;
        this.#keywordStyles = projectKeywordTagStyles(keywords);
        this.#keywordStylesKey = key;
        return this.#keywordStyles;
    }

    defaultTagStyle(tag) {
        const projectStyle = this.keywordTagStyles(window.activeProject).get(tag);
        return projectStyle ?? defaultOracleTagStyle(tag);
    }

    parse(face, text, faceCount) {
        const oracle = this.oracleFor(window.activeProject);
        const input = { ...faceMetadata(face, faceCount), text };
        const key = JSON.stringify(input);
        const cached = this.#cache.get(face);
        if (cached?.key === key) return cached.parsed;
        const parsed = oracle.parseFace(input);
        this.#cache.set(face, { key, parsed });
        return parsed;
    }

    getSuggestionModels(card) {
        return getCardFaces(card).flatMap(face => [face, ...(face.subcards ?? [])]);
    }

    suggestTags(card) {
        if (!isOracleCard(card)) return [];
        const faceCount = getCardFaces(card).length;
        const suggestions = new Set();
        for (const face of this.getSuggestionModels(card)) {
            if (!face.rulesText?.trim()) continue;
            const parsed = this.parse(face, face.rulesText, faceCount);
            for (const tag of parsed.tagMatches.keys()) suggestions.add(tag);
        }
        return [...suggestions].sort();
    }

    getRulesCardFaces(face) {
        return getCardFaces(cardForFace(face));
    }

    highlightRules(editor, face) {
        const card = cardForFace(face);
        if (!isOracleCard(card)) return;
        const faceCount = getCardFaces(card).length;
        const text = editor.textContent;
        if (!text.trim()) return;
        const parsed = this.parse(face, text, faceCount);
        markUnrecognizedText(editor, parsed);
    }
}
