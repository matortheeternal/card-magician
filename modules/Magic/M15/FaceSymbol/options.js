const faceSymbol = id => ({
    id,
    name: id.normalizeWords().toTitleCase(),
    url: `${id}.png`
});

const separator = () => ({ separator: true });

const colorChars = 'wubrgamc'.split('');

const faceSymbolGroup = (groupId, items) => ({
    name: groupId.normalizeWords().toTitleCase(),
    items: items || colorChars.map(c =>
        faceSymbol(`${groupId}/${c}.png`)
    )
});

export default [
    faceSymbol('autodetect'),
    faceSymbol('none'),
    separator(),
    faceSymbolGroup('modal_front'),
    faceSymbolGroup('modal_back'),
    separator(),
    faceSymbol('front_triangle'),
    faceSymbol('day'),
    faceSymbol('moon'),
    faceSymbol('closed_fan'),
    faceSymbol('meld'),
    faceSymbolGroup('sparker'),
    separator(),
    faceSymbol('back_triangle'),
    faceSymbol('night'),
    faceSymbol('eldrazi'),
    faceSymbol('compass'),
    faceSymbol('open_fan'),
    faceSymbol('specialized'),
    faceSymbol('aetherprint'),
    separator(),
    faceSymbol('lesson'),
    faceSymbol('comedy'),
    faceSymbol('tragedy'),
    separator(),
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
    faceSymbolGroup('non_standard', [
        faceSymbol('conspiracy'),
        faceSymbol('dungeon'),
        faceSymbol('emblem'),
        faceSymbol('hero'),
        faceSymbol('phenomenon'),
        faceSymbol('plane'),
        faceSymbol('scheme'),
        faceSymbol('vanguard'),
    ]),
]
