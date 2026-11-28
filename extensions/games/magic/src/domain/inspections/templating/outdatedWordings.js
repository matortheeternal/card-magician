import WordingInspection from './WordingInspection.js';

const L = localize('game-magic');

const ENTERS_THE_BATTLEFIELD = /\benters? the battlefield\b/i;
const CONVERTED_MANA_COST = /\bconverted mana costs?\b/i;
const GENDERED_PRONOUNS = /\b(?:his or her|he or she|him or her)\b/i;
const PUT_INTO_GRAVEYARD = /\bput into (?:\S+ )?graveyards? from the battlefield\b/i;
const IN_PLAY = /\b(?:comes? into play|leaves? play|in play)\b/i;
const REMOVED_FROM_GAME = /\bremoved? from the game\b/i;
const AT_END_OF_TURN = /\bat end of turn\b/i;

const BATTLEFIELD_SUFFIX = / the battlefield$/i;
const COST_WORDING = /converted mana cost/i;

function manaValue(wording) {
    return wording.replace(COST_WORDING, match => {
        if (match === match.toUpperCase()) return 'MANA VALUE';
        if (match[0] === 'C') return 'Mana value';
        return 'mana value';
    });
}

export const OUTDATED_WORDINGS = [
    new WordingInspection({
        id: 'wording-enters-the-battlefield',
        title: L`“Enters the battlefield”`,
        pattern: ENTERS_THE_BATTLEFIELD,
        replacement: L`enters`,
        description: L([
            'Around 2024 (date to verify), “enters the battlefield” was shortened'
            + ' to “enters” in standard templating.'
        ]),
        fix: wording => wording.replace(BATTLEFIELD_SUFFIX, '')
    }),
    new WordingInspection({
        id: 'wording-converted-mana-cost',
        title: L`“Converted mana cost”`,
        pattern: CONVERTED_MANA_COST,
        replacement: L`mana value`,
        description: L([
            'Around 2021 (date to verify), “converted mana cost” became “mana'
            + ' value”.'
        ]),
        fix: manaValue
    }),
    new WordingInspection({
        id: 'wording-gendered-pronouns',
        title: L`“His or her” and similar pronouns`,
        pattern: GENDERED_PRONOUNS,
        replacement: L`their`,
        description: L([
            'Around 2018 (date to verify), “they”, “them”, and “their” replaced'
            + ' gendered pronouns in standard templating.'
        ])
    }),
    new WordingInspection({
        id: 'wording-put-into-graveyard',
        title: L`“Put into a graveyard from the battlefield”`,
        pattern: PUT_INTO_GRAVEYARD,
        replacement: L`dies`,
        description: L([
            'Around 2011 (date to verify), creatures going from the battlefield to'
            + ' a graveyard began using “dies”. Other objects can still use explicit'
            + ' zone wording.'
        ])
    }),
    new WordingInspection({
        id: 'wording-in-play',
        title: L`“In play” and “comes into play”`,
        pattern: IN_PLAY,
        replacement: L`on the battlefield`,
        description: L([
            'Around 2009 (date to verify), the “in play” zone became the'
            + ' battlefield. Use “on the battlefield”, “enters”, or “leaves the'
            + ' battlefield” as appropriate.'
        ])
    }),
    new WordingInspection({
        id: 'wording-removed-from-game',
        title: L`“Removed from the game”`,
        pattern: REMOVED_FROM_GAME,
        replacement: L`exiled`,
        description: L([
            'Around 2009 (date to verify), “removed from the game” became'
            + ' “exiled”.'
        ])
    }),
    new WordingInspection({
        id: 'wording-at-end-of-turn',
        title: L`“At end of turn”`,
        pattern: AT_END_OF_TURN,
        replacement: L`at the beginning of the next end step`,
        description: L([
            'Around 2009 (date to verify), delayed triggers began using “at the'
            + ' beginning of the next end step”. Duration wording still uses “until'
            + ' end of turn”.'
        ])
    })
];
