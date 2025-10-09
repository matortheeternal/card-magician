const colorNames = {
    g: 'green',
    w: 'white',
    r: 'red',
    b: 'black',
    u: 'blue'
};

function addColor(colors, colorCharacter, isHybrid) {
    if (!colors.hasOwnProperty(colorCharacter))
        colors[colorCharacter] = {
            char: colorCharacter,
            name: colorNames[colorCharacter],
            sources: {}
        };

    const sourceKey = isHybrid ? 'hybrid' : 'normal';
    colors[colorCharacter].sources[sourceKey] = true;
}

export class ColorIdentity {
    constructor() {
        this.colorSources = {};
        this.overrides = {};
        this.colors = [];
    }

    getColors() {
        const colors = {};
        Object.values(this.colorSources).forEach(src => {
            if (src.commanderOnly) return;
            src.symbols.forEach(sym => {
                if (!sym.isColored()) return;
                const isHybrid = sym.isTwoColorHybrid();
                sym.parts.forEach(p => addColor(colors, p, isHybrid));
            });
        });
        return Object.values(colors);
    }

    addColorSource(key, symbols, commanderOnly = false) {
        this.colorSources[key] = {
            commanderOnly,
            symbols
        };
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
