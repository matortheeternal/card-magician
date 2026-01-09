import { AbilityWordConverter } from './lists/main.js';
import { targetCard, targetSpell, targetToObject, targetWith } from './target.js';
import { parseKeywordTokens } from './parse.js';
import { matchAllKeywords } from './match.js';

export { AbilityWordConverter, matchAllKeywords };

const specialVariables = {
    target_type: (token, card) => card.getThisType(),
    subtypes_and_or: (token, card) => {
        const subtypesCommas = card.subType.replaceAll(' ', ', ');
        const finalComma = subtypesCommas.lastIndexOf(',');
        token.variable = subtypesCommas.substring(0, finalComma) 
            + ' and/or' 
            + subtypesCommas.substring(finalComma + 1);
    },
    subtypes_or: (token, card) => {
        const subtypesCommas = card.subType.replaceAll(' ', ', ');
        const finalComma = subtypesCommas.lastIndexOf(',');
        token.variable = subtypesCommas.substring(0, finalComma) 
            + ' or' 
            + subtypesCommas.substring(finalComma + 1);
    },
    dies_or_gy: (token, card) => card.superType.match(/creature/i) 
        ? 'dies' 
        : 'is put into a graveyard from the battlefield',
    target: (token, card, target) => target,
    target_object: (token, card, target) => targetToObject(target, token.format),
    target_it: (token, card, target) => target.includes('This') ? target : 'It',
    target_spell: (token, card, target) => targetSpell(target),
    target_card: (token, card, target) => targetCard(target),
    target_with: (token, card, target) => targetWith(target, token.format),
    to_do_this: (token, card, target, keyword) =>  {
        const kwRegex = new RegExp(keyword.expressionRegex.source + '.?$', 'i');
        const match = card.rulesText.match(kwRegex);

        if (!match) return token.format;

        const matchedKw = card.rulesText.match(keyword.expressionRegex)[0];
        const optAction = token.args ? ' ' + token.args[0] : '';
        const firstWord = token.format.toLowerCase();
        return `To ${matchedKw}${optAction}, ${firstWord}`;
    },
    station_creature_breakpoint: () => 'Not implemented'
};

function processReminderText(templateTokens, params, card, target, keyword) {
    let output = '';

    for (const token of templateTokens) {        
        for (const [ variableName, variableFn ] of Object.entries(specialVariables)) {
            if (token.variable === variableName) {
                token.variable = variableFn(token, card, target, keyword);
                token.format = 'literal';
                break;
            }
        }

        if (token.variable.substring(0, 5) === 'card.') {
            token.variable = card[token.variable.substring(5)];
            token.format = 'literal';
        }

        const param = params[token.variable];

        if (!param) {
            output += token.format === 'literal' 
                ? token.variable 
                : '&lt;INVALID_PARAM_REFERENCE&gt;';
            continue;
        }

        const formatFn = param.type?.[token.format] || param.type.invalid_format;

        output += ' ' + formatFn(param.value, token.formatArgs, card, target);
    }

    return output;
}

const permanentTypes = [
    'creature',
    'artifact',
    'enchantment',
    'planeswalker',
    'battle',
    'land'
];

const rtMatches = { // Stuff used in 'match'
    cardProp: (matchParams, params, card) => {
        const cardProp = card[matchParams.prop];
        return cardProp?.match(new RegExp(matchParams.match), 'i');
    },
    keywordParam: (matchParams, params) => {
        const kwParam = params?.[matchParams.param]?.value?.toString();
        if (!kwParam) return false;
        return kwParam.match(new RegExp(matchParams.match), 'i');
    },
    numberIsX: (matchParams, params) => 
        params[matchParams?.param || 'number'].value  === 'X',
    isPlural: (matchParams, params) => params[matchParams?.param || 's'].value === 's',
    targetsOther: (matchParams, params, card, target) => !target.includes('This'),
    costHasX: (matchParams, params) => 
        params[matchParams?.param || 'cost'].value.match(/x/i),
    hasPt: (matchParams, params, card) => card.power || card.toughness,
    hasPPCounters: (matchParams, params, card) => card.rulesText.match(/modular/i),
    hasTarget: (matchParams, params, card) => card.rulesText.match(/target/i),
    isPermanent: (matchParams, params, card) => {
        for (const type of permanentTypes) 
            if (card.superType?.match(new RegExp(type, 'i'))) return true;
        
        return false;
    },
    multipleModes: (matchParams, params, card) => {
        return (card.rulesText.match(/::|•/g) || []).length > 2;
    },
    nonManaCost: (matchParams, params) => 
        !params[matchParams?.param || 'cost'].value.match(/{/)
};

function checkMatch(match, params, card, target) {  
    if (!Array.isArray(match))  
        return rtMatches[match.type]?.(match.params, params, card, target);  

    for (const subMatch of match) {  
        const matchFn = rtMatches[subMatch.type];  
        const subMatchRes = matchFn?.(subMatch.params, params, card, target);  
        if (!subMatchRes) return false;  
    }  
    
    return true;  
} 

function generateReminderText(keyword, params, card, target) {
    for (const { match, template } of keyword.reminderTexts) {
        const matchRes = match ? checkMatch(match, params, card, target) : false;
        if (!match || matchRes) {
            const templateTokens = parseKeywordTokens(template);
            return processReminderText(templateTokens, params, card, target, keyword);
        }
    }
}

export function addAutoReminderText(str, card, set) {
    let reminderText = '';

    for (const match of matchAllKeywords(str, card, set)) {
        const generatedRt = generateReminderText(match.keyword, match.params, card, match.target);
        const autoRt
            = (!match.keyword.hideByDefault || card.autoRt === 'all') 
            && card.autoRt !== 'none';
        if (autoRt) reminderText += generatedRt;
    }
    
    return str + (reminderText ? ' (<i>' + reminderText.trim() + '</i>)' : '');
}