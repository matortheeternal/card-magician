import { numberWordToDigit, numberWord, numberWordOrA, multiplicativeNumbers } from './numberWords.js';

class DirectiveParam {
    static expr = null;
    static alias = null;

    static handler(value, token) {
        return value;
    }

    static number_word_or_a(value) {
        return numberWordOrA[value] || value;
    }

    static number_word(value) {
        return numberWord[value] || value;
    }

    static capitalize(value) {
        const valueStr = value.toString();
        return valueStr[0].toUpperCase() + valueStr.substring(1);
    }

    static lowercase(value) {
        return value.toString().toLowerCase();
    }

    static uppercase(value) {
        return value.toString().toLowerCase();
    }

    static target_singular(value, args, card, target) {
        return target !== 'They' ? value : '';
    }

    static target_plural(value, args, card, target) {
        return target === 'They' ? value : '';
    }

    static a(value) {
        return (/[aeiou]/i.test(value) ? 'an' : 'a');
    }

    static singular(value, args) {
        return value.match(`${args[0] || 's'}$`)[0];
    }

    static invalid_format(value) {
        return value;
    }

    static editMatch(match) {
        return match;
    }
}

class NumberParam extends DirectiveParam {
    static expr = /[XYZ\d]+/;
    static alias = 'number';

    static handler(value) {
        const nParsed = parseInt(value);
        if (isNaN(nParsed)) return value;
        return nParsed;
    }

    static plural(value, args) {
        return value !== 1 ? args[0] || 's' : '';
    }

    static multiply(value, args) {
        if (value === 2) return 'twice ' + (args[0] || '');
        if (value === 1) return args[0] || '';
        return numberWord[value] + ' times' + (args[0] || '')
    }

    static mana(value, args) {
        if (value < 6)
            return `{${args[0]}}`.repeat(value)
        
        return numberWord[args[0]] + ` {${args[0]}}`;
    }
}

class NameParam extends DirectiveParam {
    static expr = /[\w ]+?/;
    static alias = 'name';
}

class OneWordParam extends DirectiveParam {
    static expr = /[^ ,:;.!?]+/;
    static alias = 'one_word';
}

class PrefixParam extends DirectiveParam {
    static expr = /[^,:;.!?]*?/;
    static alias = 'prefix';
}

class NumberWordParam extends DirectiveParam {
    static expr = /(up to )?(a|an|one|two|three|four|five|six|seven|eight|nine|ten| )/;
    static alias = 'number_word';

    static handler(value) {
        return numberWordToDigit(value);
    }
}

class AParam extends DirectiveParam {
    static expr = /an?/;
    static alias = 'a';
}

class SParam extends DirectiveParam {
    static expr = /[a-z]?s?/;
    static alias = 's';

    static handler(value) {
        return value.match(/[Ss]/) ? value : '';
    }
}

class CostParam extends DirectiveParam {
    static expr = / {.+?}+|—.+/;
    static alias = 'cost';

    static handler(value) {
        return value.replace('—', '');
    }

    static editMatch(match) {
        return match.slice(0, match.length - 2) + ')';
    }
}

class LiteralParam extends DirectiveParam {
    static alias = 'literal';
}

const paramTypes = [
    NumberParam,
    NameParam,
    OneWordParam,
    PrefixParam,
    NumberWordParam,
    AParam,
    SParam,
    CostParam
];

export function getParamType(name) {
    for (const paramType of paramTypes)  
        if (paramType.alias === name) return paramType;
    
    
    return LiteralParam;
}