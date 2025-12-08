function makePseudoKeywordConverter(keyword) {
    return {
        match(str) {
            return str.match(keyword);
        },
        convert(match) {
            return "<i>" + match + "</i>";
        }
    }
}

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

import numericKeywords from "./keywordLists/numericKeywords.js";
import simpleKeywords from  "./keywordLists/simpleKeywords.js";

const keywords = [
    ...numericKeywords,
    ...simpleKeywords
]

const pseudoKeywords = [
    "Channel",
    "Landfall"
];

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
const literalParam = value => value;

const paramRegex = {
    number: /[XYZ\d]+/,
    name: /[\w ]+?/,
    one_word: /[^ ]+/,
    prefix: /[^,;.]*?/,
    number_word: /(up to )?(a|an|one|two|three|four|five|six|seven|eight|nine|ten| )/, // regex stolen from mse
    a: /an?/,
    s: /[a-z]s?/
};

const paramHandlers = {
    number: value => { 
        const nParsed = parseInt(value);
        if (isNaN(nParsed)) return value;
        return nParsed;
    },
    number_word: value => digitalNumber(value)  
};

const paramFunctions = {
    plural: (value, args) => value !== 1 ? args[0] || 's' : '',
    number_word_or_a: value => englishNumberA[value] || value,
    number_word: value => englishNumber[value] || value
};

function keywordMatch(keyword, str) {
    const tokens = parseKeywordExpression(keyword.expression);
    const included = keywordInclude(tokens, str);
    if (included) return [ included, processKeywordParams(tokens, included) ];
    

    return [false, false];
}

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

// function keywordExclude(keyword, str) {
//     const exclude = keyword.exclude || [];

//     for (const excludeMatch of exclude) {
//         if (str.match(excludeMatch)) return true;
//     }

//     return false;
// }

function processKeywordParams(tokens, match) {
    const params = match.slice(1);
    const paramsProcessed = {};
    
    for (const [i, param] of params.entries()) {
        const token = tokens[i];
        const handler = paramHandlers[token.type];
        if (handler) paramsProcessed[token.value] = handler(param, token);
        else paramsProcessed[token.value] = token.value;
    }

    return paramsProcessed;
}

function processReminderText(tokens, params, card) {
    let output = "";

    for (const token of tokens) {        
        if (token.value.substring(0, 5) === "card.") {
            token.value = card[token.value.substring(5)];
        }
        if (token.value === "target_type") {
            token.value = card.getThisType();
        }

        if (token.value === "subtypes_and_or") {
            const subtypesCommas = card.subType.replaceAll(" ", ", ");
            const finalComma = subtypesCommas.lastIndexOf(",");
            token.value = subtypesCommas.substring(0, finalComma) + " and/or" + subtypesCommas.substring(finalComma + 1);
        }

        // if (token.value === "dies") {
        //     token.value = 
        // }

        const paramFn = paramFunctions[token.type] || literalParam;
        const paramValue = params[token.value] || token.value;
        output += paramFn(paramValue, token.args, card);
    }

    return output;
}

const rtMatches = {
    cardProp: (matchParams, params, card) => {
        const cardProp = card[matchParams.prop];
        for (const param of matchParams.matches) {
            if (cardProp.match(new RegExp(param, "i"))) return true;
        }
        return false;
    },
    numberIsX: (matchParams, params) => params["number"]  === "X" 
};

function handleReminderText(keyword, params, card) {
    for (const reminderText of keyword.reminderTexts) {
        if (reminderText.match) {
            const matchRes = rtMatches[reminderText.match.type](reminderText.match.params, params, card);
            if (matchRes) return processReminderText(parseKeywordExpression(reminderText.template), params, card);
        }
        else {
            return processReminderText(parseKeywordExpression(reminderText.template), params, card); // has no condition
        }
    }
    
}

export const KeywordConverter = {
    match(str) {
        return str.match(/.*/);
    }, 
    convert(match, state, card, outputSymbols) {
        let reminderText = "";

        for (const keyword of keywords) {
            const [ keywordMatched, params ] = keywordMatch(keyword, match[0]);
            if (keywordMatched) reminderText += handleReminderText(keyword, params, card) + " ";
        }
        
        const processedRt = reminderText ? " (<i>" + reminderText.trim() + "</i>)" : "";
        return match[0] + processedRt;
    }
}

export function getPsuedoKeywordConverters() {
    return pseudoKeywords.map(kw => makePseudoKeywordConverter(kw));
}