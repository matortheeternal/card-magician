const colorNames = {
    g: 'green',
    w: 'white',
    r: 'red',
    b: 'black',
    u: 'blue'
};

function addColor(colors, colorCharacter, sourceKey = 'normal') {
    if (!colors.hasOwnProperty(colorCharacter))
        colors[colorCharacter] = {
            char: colorCharacter.toLowerCase(),
            name: colorNames[colorCharacter],
            sources: {}
        };

    colors[colorCharacter].sources[sourceKey] = true;
}

export default class ColorIdentity {
    constructor() {
        this.colorSources = {};
        this.override = null;
        this.colors = [];
    }

    getColorsFromSources() {
        const colors = {};
        Object.values(this.colorSources).forEach(src => {
            if (src.commanderOnly) return;
            src.symbols.forEach(sym => {
                if (!sym.isColored()) return;
                const sourceKey = sym.isTwoColorHybrid()
                    ? 'hybrid'
                    : 'normal';
                sym.parts.forEach(p => addColor(colors, p, sourceKey));
            });
        });
        return colors;
    }

    getColorsFromOverride() {
        const colors = {};
        this.override.split('').forEach(char => {
            if (!colorNames[char]) return;
            addColor(colors, char, 'override');
        });
        return colors;
    }

    getColors() {
        const colors = this.override
            ? this.getColorsFromOverride()
            : this.getColorsFromSources();
        return Object.values(colors);
    }

    addColorSource(key, symbols, commanderOnly = false) {
        this.colorSources[key] = {
            commanderOnly,
            symbols
        };
        this.colors = this.getColors();
    }

    setOverride(str) {
        this.override = str && str.length ? str : null;
        this.colors = this.getColors();
    }

    isMulticolor() {
        return (this.colors.length > 2) || (
            (this.colors.length === 2) &&
            !this.isHybrid()
        );
    }

    isHybrid() {
        return (this.colors.length === 2) &&
            this.colors.every(c => c.sources.hybrid && !c.sources.normal);
    }
}
