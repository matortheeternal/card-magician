export function getKey(sym) {
    const order = 'wubrgc';
    return sym.raw.toLowerCase().split('').sort((a, b) => {
        return order.indexOf(a) - order.indexOf(b);
    }).join('');
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
    resolve: (sym, size) => `${size}/hybrid3/2${getKey(sym)}.png`,
}, {
    match: sym => sym.type === 'twoColorHybridMana',
    resolve: (sym, size) => `${size}/hybrid2/${getKey(sym)}.png`,
}, {
    match: sym => sym.type === 'halfMana',
    resolve: (sym, size) => `${size}/half/${getKey(sym)}.png`,
}, {
    match: sym => {
        if (sym.type !== 'genericMana') return false;
        const num = parseInt(sym.raw);
        return (num >= 10) && (num <= 20);
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

const symbolDiv = (imageUrl, text = '') => (
    `<div class="sym" style="background-image: url('${imageUrl}')">
        ${text}
    </div>`
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
    return symbolDiv(circleUrl, sym.raw.toUpperCase());
}

export function symbolToHTML(ctx, sym, size) {
    const adapter = imagePathAdapters.find(adapter => adapter.match(sym));
    if (!adapter && sym.raw.length > 1)
        return noSymbol(sym);
    if (!adapter)
        return circleWithText(ctx, sym, size);

    const imagePath = adapter.resolve(sym, size);
    return symbolDiv(ctx.resolveAsset(imagePath));
}
