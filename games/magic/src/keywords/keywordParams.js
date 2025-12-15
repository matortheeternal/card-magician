import { numberWordToDigit, numberWord, numberWordOrA } from "../localeManager.js";

class DirectiveParam {
    expr = null;
    name = null;

    handler(value, token) {
        return value;
    }

    number_word_or_a(value) {
        return numberWordOrA[value] || value;
    }

    number_word(value) {
        return numberWord[value] || value;
    }

    capitalize(value) {
        const valueStr = value.toString();
        return valueStr[0].toUpperCase() + valueStr.substring(1);
    }

    lowercase(value) {
        return value.toString.toLowerCase();
    }

    uppercase(value) {
        return value.toString.toLowerCase();
    }

    target_singular(value, args, card, target) {
        return target !== "They" ? value : "";
    }

    target_plural(value, args, card, target) {
        return target === "They" ? value : "";
    }

    invalid_format(value) {
        return value;
    }
}

class NumberParam extends DirectiveParam {
    expr = /[XYZ\d]+/;
    name = 'number';

    handler(value) {
        const nParsed = parseInt(value);
        if (isNaN(nParsed)) return value;
        return nParsed;
    }

    plural(value, args) {
        return value !== 1 ? args[0] || 's' : '';
    }
}

class NameParam extends DirectiveParam {
    expr = /[\w ]+?/;
    name = 'name';
}

class OneWordParam extends DirectiveParam {
    expr = /[^\b]+/;
    name = 'one_word';
}

class PrefixParam extends DirectiveParam {
    expr = /[^,;.]*?/;
    name = 'prefix';
}

class NumberWordParam extends DirectiveParam {
    expr = /(up to )?(a|an|one|two|three|four|five|six|seven|eight|nine|ten| )/;
    name = 'number_word';

    handler(value) {
        return numberWordToDigit(value);
    }
}

class AParam extends DirectiveParam {
    expr = /an?/;
    name = 'a';
}

class SParam extends DirectiveParam {
    expr = /[a-z]?s?/;
    name = 's';

    handler(value) {
        return value.match(/[Ss]/) ? value : "";
    }
}

class CostParam extends DirectiveParam {
    expr = /{.+?}+|—.+/;
    name = 'cost';
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
    for (const paramType of paramTypes) {
        if (paramType.name === name) return paramType;
    }

    return null;
}