import { AbilityWordConverters } from "./lists/main.js";
import { targetToObject } from "./target.js";
import { parseKeywordTokens } from "./parse.js";
import { matchAllKeywords } from "./match.js";

export { AbilityWordConverters, matchAllKeywords };

const specialVariables = { // Special <variables> that can be used in rt templates. Accepts (token, card, target)
    target_type: (token, card) => card.getThisType(),
    subtypes_and_or: (token, card) => {
        const subtypesCommas = card.subType.replaceAll(" ", ", ");
        const finalComma = subtypesCommas.lastIndexOf(",");
        token.variable = subtypesCommas.substring(0, finalComma) + " and/or" + subtypesCommas.substring(finalComma + 1);
    },
    dies_or_gy: (token, card) => card.superType.match(/creature/i) ? "dies" : "is put into a graveyard from the battlefield",
    target: (token, card, target) => target,
    target_object: (token, card, target) => targetToObject(target, token.format),
    station_creature_breakpoint: () => "Not implemented"
};

function processReminderText(templateTokens, params, card, target) {
    let output = "";

    for (const token of templateTokens) {        
        for (const [ variableName, variableFn ] of Object.entries(specialVariables)) {
            if (token.variable === variableName) {
                token.variable = variableFn(token, card, target);
                token.format = "literal";
                break;
            }
        }

        if (token.variable.substring(0, 5) === "card.") {
            token.variable = card[token.variable.substring(5)];
            token.format = "literal";
        }

        const param = params[token.variable];

        if (!param) {
            output += token.format === "literal" ? token.variable : "&lt;INVALID_PARAM_REFERENCE&gt;";
            continue;
        }

        const formatFn = param.type?.[token.format] || param.type.invalid_format;

        output += formatFn(param.value, token.formatArgs, card, target);
    }

    return output;
}

const permanentTypes = [
    "creature",
    "artifact",
    "enchantment",
    "planeswalker",
    "battle",
    "land"
];

const rtMatches = { // Stuff used in "match"
    cardProp: (matchParams, params, card) => {
        const cardProp = card[matchParams.prop];
        for (const param of matchParams.matches) {
            if (cardProp.match(new RegExp(param, "i"))) return true;
        }
        return false;
    },
    numberIsX: (matchParams, params) => params[matchParams?.param || "number"]  === "X",
    isPlural: (matchParams, params) => params[matchParams?.param || "s"] === "s",
    targetsOther: (matchParams, params, card, target) => !target.includes("This"),
    costHasX: (matchParams, params) => params[matchParams?.param || "cost"].toLowerCase().includes("x"),
    hasPt: (matchParams, params, card) => card.power || card.toughness,
    hasPPCounters: (matchParams, params, card) => card.rulesText.match(/modular/i),
    hasTarget: (matchParams, params, card) => card.rulesText.match(/target/i),
    isPermanent: (matchParams, params, card) => {
        for (const type of permanentTypes) {
            if (card.superType?.match(new RegExp(type, "i"))) return true;
        }
        return false;
    }
};

function checkMatch(reminderText, params, card, target) {
    let matchRes;

    if (Array.isArray(reminderText.match)) {
        for (const subMatch of reminderText.match) {
            const subMatchRes = rtMatches[subMatch.type]?.(subMatch.params, params, card, target);
            if (!subMatchRes) {
                matchRes = false;
                break;
            }
            matchRes = true;
        }
    } else {
        matchRes = rtMatches[reminderText.match.type]?.(reminderText.match.params, params, card, target);
    }
    
    return matchRes;
}

function generateReminderText(keyword, params, card, target) {
    for (const reminderText of keyword.reminderTexts) {
        const matchRes = reminderText.match ? checkMatch(reminderText, params, card, target) : false;
        if (!reminderText.match || matchRes) return processReminderText(parseKeywordTokens(reminderText.template), params, card, target);
    }
}

export function addAutoReminderText(str, card) {
    let reminderText = "";

    for (const { keyword, params, target } of matchAllKeywords(str, card)) {
        const generatedRt = generateReminderText(keyword, params, card, target);
        if ((!keyword.hideByDefault || card.showRt === "all") && card.showRt !== "none") reminderText += generatedRt;
    }
    
    return str + (reminderText ? " (<i>" + reminderText.trim() + "</i>)" : "");
}