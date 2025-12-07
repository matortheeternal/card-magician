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

englishNumber.X = "X";
englishNumber.Y = "Y";
englishNumber.Z = "Z";

const englishNumberA = ["no", "a"].concat(englishNumber.slice(2));

englishNumberA.X = "X";
englishNumberA.Y = "Y";
englishNumberA.Z = "Z";

function digitalNumber(englishN) {
    if (englishN == "a" || englishN == "an") return 1;
    return englishNumber.indexOf(englishN);
}

// const flying = {
//     name: "flying",
//     params: [],
//     exclude: [ /gains flying/, /have flying/ ],
//     reminderText: params => "This creature can't be blocked except by creatures with flying or reach."
// };

// const bolster = {
//     name: "bolster",
//     params: [ /\d?/ ],
//     exclude: [],
//     reminderText: params => `Choose a creature with the least toughness among creatures you control and put ${englishNumberA[parseInt(params[1])]} +1/+1 counter on it.`
// };

const bolster = {
    match: "bolster <counters:number>",
    reminderText: "Choose a creature with the least toughness among creatures you control and put <counters:number-word-or-a> +1/+1 counter<counters:handle-plural> on it.",
    exclude: []
}

const keywords = [
    // flying,
    bolster
];

const pseudoKeywords = [
    "Channel",
    "Landfall"
];

function parseKeywordExpression(str) {
    const res = [];
    let remainingStr = str;

    while (remainingStr.length) {
        const [match, token] = parseNextKeywordToken(remainingStr);
        // if (!parser) throw new Error('no parser found for ' + remainingStr.slice(0, 10));
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
    const [ value, type ] = tokenArgs;
    const args = tokenArgs.slice(2);

    return [match, {type: type, value: value, args: args}];
}
const literalParam = value => value;

const paramRegex = {
    number: /[XYZ\d]+/,
    name: /[\w ]+?/,
    ["one-word"]: /[^ ]+/,
    prefix: /[A-Z][A-Z,a-z’' ]*/, // regex stolen from mse
    ["number-word"]: /(up to )?(a|an|one|two|three|four|five|six|seven|eight|nine|ten| )/, // regex stolen from mse
    a: /an?/,
    plural: /[a-z]s?/
};

const paramHandlers = {
    number: value => parseInt(value),
    ["number-word"]: value => digitalNumber(value)
};

const paramFunctions = {
    ["handle-plural"]: value => { 
        if (value > 1) return "s"; 
        return "";
    },
    ["handle-plural-es"]: value => { 
        if (value > 1) return "es"; 
        return "";
    },
    ["number-word-or-a"]: value => englishNumberA[value] || value,
    ["number-word"]: value => englishNumber[value] || value
};


function keywordMatch(tokens, keyword, str) {
    const included = keywordInclude(tokens, str);
    const excluded = keywordExclude(keyword, str);

    if (included && !excluded) return [ included, processKeywordParams(tokens, included) ];
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

    return str.match(match);
}

function keywordExclude(keyword, str) {
    const exclude = keyword.exclude || [];

    for (const excludeMatch of exclude) {
        if (str.match(excludeMatch)) return true;
    }

    return false;
}

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

function processReminderText(tokens, params) {
    let output = "";

    for (const token of tokens) {
        const paramFn = paramFunctions[token.type] || literalParam;
        const paramValue = params[token.value] || token.value;
        console.log("rt", token, params, paramValue, paramFn(paramValue, token));
        console.log(englishNumberA);
        output += paramFn(paramValue, token);
    }

    return output;
}

export const KeywordConverter = {
    match(str) {
        return str.match(/.*/);
    },
    convert(match, state, card, outputSymbols) {
        let reminderText = "";

        for (const keyword of keywords) {
            const [ keywordMatched, params ] = keywordMatch(parseKeywordExpression(keyword.match), keyword, match[0].toLowerCase());
            if (keywordMatched) reminderText += processReminderText(parseKeywordExpression(keyword.reminderText), params) + " ";
        }
        
        const processedRt = reminderText ? " (<i>" + reminderText.trim() + "</i>)" : "";
        return match[0] + processedRt;
    }
}

export function getPsuedoKeywordConverters() {
    return pseudoKeywords.map(kw => makePseudoKeywordConverter(kw));
}