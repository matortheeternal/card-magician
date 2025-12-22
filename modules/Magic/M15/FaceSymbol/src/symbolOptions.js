import computeAutoSymbol from './computeAutoSymbol.js';

const separator = () => ({ separator: true });

const faceSymbol = (id, name, imagePath, extra) => ({
    id,
    name: name || id.normalizeWords().toTitleCase(),
    ...(id.includes('autodetect') ? {} : { imagePath: imagePath || `${id}.png`}),
    ...(extra ? extra.except('id', 'name', 'imagePath') : {})
});

function computeAutoColor(card, options) {
    const colorKey = card.getCardColorKey();
    return options.find(opt => opt.c === colorKey);
}

const autodetectOption = (compute) => ({
    id: 'autodetect',
    name: 'Auto',
    compute
});

const colorOptions = [
    autodetectOption(computeAutoColor),
    { id: 'white', c: 'w' },
    { id: 'blue', c: 'u' },
    { id: 'black', c: 'b' },
    { id: 'red', c: 'r' },
    { id: 'green', c: 'g' },
    { id: 'multicolor', c: 'm' },
    { id: 'colorless', c: 'c' },
    { id: 'artifact', c: 'a' },
];

const faceSymbolGroup = (groupId, items) => ({
    id: groupId,
    name: groupId.normalizeWords().toTitleCase(),
    items: items || colorOptions.map(opt => faceSymbol(
        `${groupId}/${opt.id}`,
        opt.name || opt.id.toTitleCase(),
        `${groupId}/${opt.c}.png`,
        opt
    ))
});

export default () => ([
    autodetectOption(computeAutoSymbol),
    faceSymbol('none'),
    separator(),
    faceSymbolGroup('modal_front'),
    faceSymbolGroup('modal_back'),
    faceSymbolGroup('sparker'),
    separator(),
    faceSymbolGroup('front', [
        faceSymbol('front_triangle'),
        faceSymbol('day'),
        faceSymbol('moon'),
        faceSymbol('closed_fan'),
        faceSymbol('meld'),
    ]),
    faceSymbolGroup('back', [
        faceSymbol('back_triangle'),
        faceSymbol('night'),
        faceSymbol('eldrazi'),
        faceSymbol('compass'),
        faceSymbol('open_fan'),
        faceSymbol('specialized'),
        faceSymbol('aetherprint'),
    ]),
    separator(),
    faceSymbol('lesson'),
    faceSymbol('comedy'),
    faceSymbol('tragedy'),
    faceSymbolGroup('type', [
        faceSymbol('multitype'),
        faceSymbol('artifact'),
        faceSymbol('battle'),
        faceSymbol('creature'),
        faceSymbol('enchantment'),
        faceSymbol('fortress'),
        faceSymbol('instant'),
        faceSymbol('land'),
        faceSymbol('planeswalker'),
        faceSymbol('sorcery'),
    ]),
    faceSymbolGroup('non_standard', [
        faceSymbol('conspiracy'),
        faceSymbol('dungeon'),
        faceSymbol('emblem', 'Emblem', 'aetherprint.png'),
        faceSymbol('hero'),
        faceSymbol('phenomenon'),
        faceSymbol('plane'),
        faceSymbol('scheme'),
        faceSymbol('vanguard'),
    ]),
]);
