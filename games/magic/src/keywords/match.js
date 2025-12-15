import { getKeywords } from "./lists/main.js";
import { getTarget } from "./target.js";
import { parseKeywordTokens } from "./parse.js";
import { getParamType } from "./params.js";

function genExpressionRegex(expressionTokens) {
    let match = "";

    for (const token of expressionTokens) {
        const paramType = getParamType(token.format);
        const paramExpr = paramType.expr?.source;

        match += "(";
        match += paramExpr ? paramExpr : token.variable; // literals and invalid types
        match += ")";
    }

    return new RegExp(match, "i");
}

function getParamVariables(expressionTokens, match) {
    const params = match.slice(1);
    const paramVariables = {};
        
    for (const [i, paramValue] of params.entries()) {
        const token = expressionTokens[i];
        const type = getParamType(token.format);
        const value = type?.handler(paramValue) || paramValue;
        paramVariables[token.variable] = {value, type};
    }

    return paramVariables;
}

export function matchAllKeywords(str, card, game) {
    const matched = [];
    const keywords = getKeywords(game);

    for (const keyword of keywords) {
        const expressionTokens = parseKeywordTokens(keyword.expression);
        if (!keyword.expressionRegex) keyword.expressionRegex = genExpressionRegex(expressionTokens);
        const keywordMatched = str.match(keyword.expressionRegex);
        
        if (keywordMatched) {
            const params = getParamVariables(expressionTokens, keywordMatched)
            const target = getTarget(str, keyword.label, card); 
            matched.push({keyword, params, target});
        }
    }
    
    return matched;
}