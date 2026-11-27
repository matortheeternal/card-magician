import WordingInspection from './WordingInspection.js';

const L = localize('game-magic');

const ENTERS_THE_BATTLEFIELD = /\benters? the battlefield\b/i;
const CONVERTED_MANA_COST = /\bconverted mana costs?\b/i;
const GENDERED_PRONOUNS = /\b(?:his or her|he or she|him or her)\b/i;
const PUT_INTO_GRAVEYARD = /\bput into (?:\S+ )?graveyards? from the battlefield\b/i;
const IN_PLAY = /\b(?:comes? into play|leaves? play|in play)\b/i;
const REMOVED_FROM_GAME = /\bremoved? from the game\b/i;
const AT_END_OF_TURN = /\bat end of turn\b/i;

export const OUTDATED_WORDINGS = [
    new WordingInspection({
        id: 'wording-enters-the-battlefield',
        title: L`“Enters the battlefield”`,
        pattern: ENTERS_THE_BATTLEFIELD,
        replacement: L`enters`
    }),
    new WordingInspection({
        id: 'wording-converted-mana-cost',
        title: L`“Converted mana cost”`,
        pattern: CONVERTED_MANA_COST,
        replacement: L`mana value`
    }),
    new WordingInspection({
        id: 'wording-gendered-pronouns',
        title: L`“His or her” and similar pronouns`,
        pattern: GENDERED_PRONOUNS,
        replacement: L`their`
    }),
    new WordingInspection({
        id: 'wording-put-into-graveyard',
        title: L`“Put into a graveyard from the battlefield”`,
        pattern: PUT_INTO_GRAVEYARD,
        replacement: L`dies`
    }),
    new WordingInspection({
        id: 'wording-in-play',
        title: L`“In play” and “comes into play”`,
        pattern: IN_PLAY,
        replacement: L`on the battlefield`
    }),
    new WordingInspection({
        id: 'wording-removed-from-game',
        title: L`“Removed from the game”`,
        pattern: REMOVED_FROM_GAME,
        replacement: L`exiled`
    }),
    new WordingInspection({
        id: 'wording-at-end-of-turn',
        title: L`“At end of turn”`,
        pattern: AT_END_OF_TURN,
        replacement: L`at the beginning of the next end step`
    })
];
