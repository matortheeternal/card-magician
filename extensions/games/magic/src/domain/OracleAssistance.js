import Oracle from 'oracle-of-pie';
import { getPrintedColors } from './ColorIdentity.js';
import { mechanicFields, projectDefinitions } from './projectMechanics.js';
import { markUnrecognizedText } from './hljsMtg.js';
import { defaultOracleTagStyle, oracleTagStyles } from './oracleTagStyles.js';

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

function getFaces(card) {
    return [card?.front, card?.back].filter(Boolean);
}

export default class OracleAssistance {
    faceFields = ['name', 'superType', 'subType', 'loyalty', 'manaCost', 'colorOverride'];
    defaultTagStyles = oracleTagStyles;
    defaultTagStyle = defaultOracleTagStyle;
    definitionFields = [...Object.values(mechanicFields), 'customTokens'];
    #cache = new WeakMap();
    #definitionKey;
    #oracle;

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
        return getFaces(card).flatMap(face => [face, ...(face.subcards ?? [])]);
    }

    suggestTags(card) {
        const faceCount = getFaces(card).length;
        const suggestions = new Set();
        for (const face of this.getSuggestionModels(card)) {
            if (!face.rulesText?.trim()) continue;
            const parsed = this.parse(face, face.rulesText, faceCount);
            for (const tag of parsed.tagMatches.keys()) suggestions.add(tag);
        }
        return [...suggestions].sort();
    }

    highlightRules(editor, face) {
        const rootFace = face.isSubcard ? face.parent() : face;
        const faceCount = getFaces(rootFace.parent?.()).length || 1;
        const text = editor.textContent;
        if (!text.trim()) return;
        const parsed = this.parse(face, text, faceCount);
        markUnrecognizedText(editor, parsed);
    }
}
