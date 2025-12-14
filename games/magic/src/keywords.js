import abilityWords from "./keywordLists/abilityWords.js";

import numericKeywords from "./keywordLists/numericKeywords.js";
import simpleKeywords from  "./keywordLists/simpleKeywords.js";

const keywords = [
    ...numericKeywords,
    ...simpleKeywords
];

const englishNumber = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
    "twenty"
];

const englishNumberA = ["no", "a"].concat(englishNumber.slice(2));

function digitalNumber(englishN) {
    if (englishN == "a" || englishN == "an") return 1;
    return englishNumber.indexOf(englishN);
}

function parseKeywordExpression(str) {
    const res = [];
    let remainingStr = str;

    while (remainingStr.length) {
        const [match, token] = parseNextKeywordToken(remainingStr);
        res.push(token);
        remainingStr = remainingStr.slice(match[0].length);
    }

    return res;
}

function parseNextKeywordToken(str) {
    const match = str.match(/<.*?>|[^<]*/);
    const token = match[0];

    if (!token.includes("<")) return [match, {type: "literal", value: token, args: []}];

    const tokenArgs = token.substring(1, token.length - 1).split(":");
    let [ value, type ] = tokenArgs;
    if (!type) type = value; // so we can have things like <number>
    const args = tokenArgs.slice(2);

    return [match, {type: type, value: value, args: args}];
}

function keywordMatch(keyword, str) {
    const tokens = parseKeywordExpression(keyword.expression);
    const included = keywordInclude(tokens, str);
    if (included) return [ included, processKeywordParams(tokens, included) ];
    

    return [false, false];
}

const literalParam = value => value;

const paramRegex = {
    number: /[XYZ\d]+/,
    name: /[\w ]+?/,
    one_word: /[^ ]+/,
    prefix: /[^,;.]*?/,
    number_word: /(up to )?(a|an|one|two|three|four|five|six|seven|eight|nine|ten| )/, // regex stolen from mse
    a: /an?/,
    s: /[a-z]?s?/,
    cost: /{.+?}+|—.+/
};

function keywordInclude(tokens, str) {
    let match = "";

    for (const token of tokens) {
        const paramExpr = paramRegex[token.type];
        match += "(";

        if (paramExpr) match += paramExpr.source;
        else match += token.value; // literals and invalid types

        match += ")";
    }

    return str.match(new RegExp(match, "i"));
}

const paramHandlers = { // Handler functions for parameters after theyre matched
    number: value => { 
        const nParsed = parseInt(value);
        if (isNaN(nParsed)) return value;
        return nParsed;
    },
    number_word: value => digitalNumber(value),
    s: value => value.match(/[Ss]/) ? value : "" 
};

function processKeywordParams(tokens, match) {
    const params = match.slice(1);
    const paramsProcessed = {};
        
    for (const [i, param] of params.entries()) {
        const token = tokens[i];
        const handler = paramHandlers[token.type];
        if (handler) paramsProcessed[token.value] = handler(param, token);
        else paramsProcessed[token.value] = param;
    }

    return paramsProcessed;
}

const specialTokens = { // Special <tokens> that can be used in rt templates
    target_type: (token, card) => card.getThisType(),
    subtypes_and_or: (token, card) => {
        const subtypesCommas = card.subType.replaceAll(" ", ", ");
        const finalComma = subtypesCommas.lastIndexOf(",");
        token.value = subtypesCommas.substring(0, finalComma) + " and/or" + subtypesCommas.substring(finalComma + 1);
    },
    dies_or_gy: (token, card) => card.superType.match(/creature/i) ? "dies" : "is put into a graveyard from the battlefield",
    target: (token, card, target) => target,
    target_object: (token, card, target) => targetToObject(target, token.type),
    station_creature_breakpoint: () => "Not implemented"
};

const paramFunctions = { // <token:functions> that can be used in rt templates
    plural: (value, args) => value !== 1 ? args[0] || 's' : '',
    number_word_or_a: value => englishNumberA[value] || value,
    number_word: value => englishNumber[value] || value,
    capitalize: value => value[0].toUpperCase() + value.substring(1),
    lowercase: value => value.toLowerCase(),
    target_singular: (value, args, card, target) => target !== "They" ? value : "",
    target_plural: (value, args, card, target) => target === "They" ? value : ""
};

function processReminderText(tokens, params, card, target) {
    let output = "";

    for (const token of tokens) {        
        for (const [ tkName, tkFn ] of Object.entries(specialTokens)) {
            if (token.value === tkName) {
                token.value = tkFn(token, card, target);
                break;
            }
        }

        if (token.value.substring(0, 5) === "card.") {
            token.value = card[token.value.substring(5)];
        }

        const paramFn = paramFunctions[token.type] || literalParam;
        const paramValue = params[token.value] || token.value;
        output += paramFn(paramValue, token.args, card, target);
    }

    return output;
}

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
    hasPPCounters: (matchParams, params, card) => card.text.match(/modular/i)
};

function handleReminderText(keyword, params, card, target) {
    for (const reminderText of keyword.reminderTexts) {
        if (reminderText.match) {
            const matchRes = rtMatches[reminderText.match.type]?.(reminderText.match.params, params, card, target);
            if (matchRes) return processReminderText(parseKeywordExpression(reminderText.template), params, card, target);
        }
        else {
            return processReminderText(parseKeywordExpression(reminderText.template), params, card, target); // has no condition
        }
    }
    
}

const cardTypeRegex = "(creature|artifact|enchantment|planeswalker|battle|permanent|land|legendary|basic|snow|token ?)+";
const itRegex = (kw, card) => new RegExp(`(This ${card.getThisType()} (has|gains) ${kw})|Target ${cardTypeRegex} gains ${kw}|put a ${kw} counter`, "i");
const theyRegex = /Creatures|All .*? creatures|.*? or .*? you control|.*? you control|Each .*? you control/i;

function matchTarget(str, kw, card) {
    if (str.match(itRegex(kw, card))) return "It";
    if (str.match(theyRegex)) return "They";
    return `This ${card.getThisType()}`;
}

function targetToObject(target, type) {
    if (target === "They") return "them";
    if (target === "It") return "it";
    return "that " + (type || "permanent");
}

export function matchAllKeywords(str, card) {
    const matched = [];

    for (const keyword of keywords) {
        const [ keywordMatched, params ] = keywordMatch(keyword, str);
        if (keywordMatched) {
            const target = matchTarget(str, keyword.label, card); 
            matched.push({keyword, params, target});
        }
    }
    
    return matched;
}

export function addAutoReminderText(str, card) {
    let reminderText = "";

    for (const { keyword, params, target } of matchAllKeywords(str, card)) {
        
        if ((card[`${keyword.alias}Rt`] || "yes") == "yes") reminderText += handleReminderText(keyword, params, card, target);
    }
    
    return str + (reminderText ? " (<i>" + reminderText.trim() + "</i>)" : "");
}

function makeAbilityWordConverter(keyword) {
    return {
        match(str) {
            return str.match(keyword);
        },
        convert(match) {
            return "<i>" + match + "</i>";
        }
    }
}

export function getAbilityWordConverters() {
    return abilityWords.map(kw => makeAbilityWordConverter(kw));
}