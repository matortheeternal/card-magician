function makeKeywordConverterNormal(include, exclude, convert) {
    return {
        match(str, res, state) {
            const included = include(str, res, state); 
            if (included && !exclude(str, res, state)) return included;
            return false;
        },
        convert(match, state, card, outputSymbols) {
            return convert(match, state, card, outputSymbols);
        }
    }
}

function makeKeywordConverterObj(keyword) {
    return makeKeywordConverterNormal(
        (str) => {
            console.log(str.match(keyword.include));
            return str.match(keyword.include);
        },
        (str) => {
            for (const excludeMatch of keyword.exclude) {
                if (str.match(excludeMatch)) return true;
            }
            return false;
        },
        keyword.convert
    )
}

const flying = {
    include: /[Ff]lying/,
    exclude: [ /gains flying/, /have flying/ ],
    convert: (match, state, card) => {
        return match[0] + " (<i>This creature can't be blocked except by creatures with flying or reach.</i>)";
    }
};

export const KeywordConverters = [
    makeKeywordConverterObj(flying)
];