import { getKeywords } from './lists/main.js';
import { getTarget } from './target.js';
import { parseKeywordTokens } from './parse.js';
import { getParamType } from './params.js';

class KeywordMatch {
    #params;
    #expressionTokens;

    constructor(keyword, str, card) {
        this.keyword = keyword;
        this.str = str;
        this.card = card;

        if (!this.keyword.expressionRegex)
            this.keyword.expressionRegex = this.genExpressionRegex();
    }

    get target() {
        return getTarget(this.str, this.keyword, this.card);
    }

    get params() {
        return this.#params ??= this.getParamVariables(this.expressionTokens, this.match);
    }

    get expressionTokens() {
        return this.#expressionTokens ??= parseKeywordTokens(this.keyword.expression);
    }

    genExpressionRegex() {
        let match = '';

        for (const token of this.expressionTokens) {
            const paramType = getParamType(token.format);
            const paramExpr = paramType.expr?.source;
            console.log(token);

            match += `(${paramExpr || token.variable})`;
        }

        return new RegExp(match, 'i');
    }

    getParamVariables() {
        const params = this.match.slice(1);
        const paramVariables = {};
            
        for (const [i, paramValue] of params.entries()) {
            const token = this.expressionTokens[i];
            const type = getParamType(token.format);
            const value = type?.handler(paramValue) || paramValue;
            paramVariables[token.variable] = {value, type};
        }

        return paramVariables;
    }

    matchKeyword() {
        this.match = this.str.match(this.keyword.expressionRegex);
        return this.match;
    }
}

export function matchAllKeywords(str, card, set) {
    const matched = [];
    const keywords = getKeywords(set);

    for (const keyword of keywords) {
        const keywordMatch = new KeywordMatch(keyword, str, card);
        console.log(keywordMatch.keyword.expressionRegex);
        if (keywordMatch.matchKeyword())
            matched.push(keywordMatch);
    }
    
    return matched;
}