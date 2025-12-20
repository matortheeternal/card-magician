const rawSymbolTypes = ['typedMana', 'tap', 'untap'];

export function getKey(sym) {
    const order = 'wubrgc';
    if (rawSymbolTypes.includes(sym.type))
        return sym.raw.toLowerCase();
    if (sym.colors.length === 0) return 'c';
    return sym.colors
        .map(c => c.toLowerCase())
        .sort((a, b) => order.indexOf(a) - order.indexOf(b))
        .join('');
}

const imagePathAdapters = [{
    match: sym => {
        return sym.type === 'colorlessPhyrexianMana'
            || sym.type === 'coloredPhyrexianMana';
    },
    resolve: (sym, size) => `${size}/phyrexian/${getKey(sym)}.png`
}, {
    match: sym => sym.type === 'genericHybridMana',
    resolve: (sym, size) => `${size}/hybrid2/2${getKey(sym)}.png`,
}, {
    match: sym => sym.type === 'fiveColorHybridMana',
    resolve: (sym, size) => `${size}/hybrid5/wubrg.png`,
}, {
    match: sym => sym.type === 'threeColorHybridMana',
    resolve: (sym, size) => `${size}/hybrid3/${getKey(sym)}.png`,
}, {
    match: sym => sym.type === 'twoColorHybridMana',
    resolve: (sym, size) => `${size}/hybrid2/${getKey(sym)}.png`,
}, {
    match: sym => sym.type === 'halfMana',
    resolve: (sym, size) => `${size}/half/${getKey(sym)}.png`,
}, {
    match: sym => {
        if (sym.type === 'variableMana') return true;
        if (sym.type !== 'genericMana') return false;
        const num = parseInt(sym.raw);
        return (num >= 0) && (num <= 20);
    },
    resolve: (sym, size) => `${size}/num/${sym.raw}.png`,
}, {
    match: sym => {
        return (sym.type === 'typedMana' && sym.raw.toLowerCase() === 's')
            || (sym.type === 'colorlessMana')
            || (sym.type === 'coloredMana');
    },
    resolve: (sym, size) => `${size}/single/${getKey(sym)}.png`,
}, {
    match: sym => sym.type === 'tap' || sym.type === 'untap',
    resolve: (sym, size) => `${size}/tap/${getKey(sym)}.png`,
}];

const symbolHtml = (imageUrl, raw, offset, text = '') => (
    `<span 
        data-src="${raw.replace(/"/g, '&quot;')}" 
        data-src-end="${offset + raw.length}" 
        contenteditable="false" 
        class="sym" 
        style="background-image: url('${imageUrl}')"
    >${text}</span>`
);

const warned = {};

function noSymbol(sym) {
    if (!warned[sym.raw]) {
        console.warn('No image path adapter found for ' + sym.raw);
        warned[sym.raw] = true;
    }
    return '';
}

function circleWithText(ctx, sym, size) {
    const circleUrl = ctx.resolveAsset(`${size}/circle.png`);
    return symbolHtml(circleUrl, sym.raw.toUpperCase());
}

export function symbolToHTML(ctx, sym, size, offset) {
    const adapter = imagePathAdapters.find(adapter => adapter.match(sym));
    if (!adapter && sym.raw.length > 1)
        return noSymbol(sym);
    if (!adapter)
        return circleWithText(ctx, sym, size);

    const imagePath = adapter.resolve(sym, size);
    return symbolHtml(ctx.resolveAsset(imagePath), sym.raw, offset);
}
