import { AbilityWordConverter } from "./keywords/reminderText.js";

export const LegendNameConverter = {
    match(str) {
        return str.match(/^(LEGENDNAME|@)/);
    },
    convert(match, state, card) {
        return card.getLegendName();
    }
};

export const CardNameConverter = {
    match(str) {
        return str.match(/^(CARDNAME|~)/);
    },
    convert(match, state, card) {
        return card.name;
    }
};

export const ThisConverter = {
    match(str) {
        return str.match(/^THIS/);
    },
    convert(match, state, card) {
        return 'this ' + card.getThisType();
    }
};

export default [
    AbilityWordConverter,
    LegendNameConverter,
    CardNameConverter,
    ThisConverter
];