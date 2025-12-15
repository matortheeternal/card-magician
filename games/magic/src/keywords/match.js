import { keywords } from "./lists/main.js";
import { matchTarget } from "./target.js";
import { parseKeywordExpression } from "./parse.js";
import { getParamType } from "./keywordParams.js";

function parseAndMatchKeyword(keyword, str) {
    const tokens = parseKeywordExpression(keyword.expression);
    const match = matchKeyword(tokens, str);
    
    return match ? [match, getParamVariables(tokens, match)] : [false, false];
}

function matchKeyword(tokens, str) {
    let match = "";

    for (const token of tokens) {
        const paramType = getParamType(token.format);
        match += "(";

        if (paramExpr) match += paramType.expr.source;
        else match += token.variable; // literals and invalid types

        match += ")";
    }

    return str.match(new RegExp(match, "i"));
}

function getParamVariables(tokens, match) {
    const params = match.slice(1);
    const paramVariables = {};
        
    for (const [i, paramValue] of params.entries()) {
        const token = tokens[i];
        const type = getParamType(token.format);
        const value = type?.handler(paramValue) || paramValue;
        paramVariables[token.variable] = {value, type};
    }

    return paramVariables;
}

export function matchAllKeywords(str, card) {
    const matched = [];

    for (const keyword of keywords) {
        const [ keywordMatched, params ] = parseAndMatchKeyword(keyword, str);
        if (keywordMatched) {
            const target = matchTarget(str, keyword.label, card); 
            matched.push({keyword, params, target});
        }
    }
    
    return matched;
}