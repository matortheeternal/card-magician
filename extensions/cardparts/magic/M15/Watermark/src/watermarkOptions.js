import computeAutoWatermark from './computeAutoWatermark.js';

const L = localize('module-M15-watermark');

const guildOptions = [
    { id: 'wu', name: L`Azorius` },
    { id: 'wr', name: L`Boros` },
    { id: 'ub', name: L`Dimir` },
    { id: 'ur', name: L`Izzet` },
    { id: 'bg', name: L`Golgari` },
    { id: 'rg', name: L`Gruul` },
    { id: 'wb', name: L`Orzhov ` },
    { id: 'br', name: L`Rakdos` },
    { id: 'wg', name: L`Selesnya` },
    { id: 'ug', name: L`Simic` },
];

const separator = () => ({ separator: true });

const watermark = (id, name, extra = {}) => ({
    id,
    name: name || id.normalizeWords().toTitleCase(),
    ...(id.includes('autodetect') ? {} : { imagePath: extra.imagePath || `${id}.png`}),
    ...(extra ? extra.except('id', 'name', 'imagePath') : {})
});

const watermarkGroup = (groupId, items) => ({
    id: groupId,
    name: L([groupId.normalizeWords().toTitleCase()]),
    items
});

const watermarkGuildGroup = (groupId, extraOptions) => watermarkGroup(
    groupId,
    guildOptions.map(opt => watermark(
        `${groupId}/${opt.id}`,
        opt.name,
        extraOptions
    ))
);

const autodetectOption = (compute) => ({
    id: 'autodetect',
    name: 'Auto',
    compute
});

export default () => ([
    autodetectOption(computeAutoWatermark),
    separator(),
    watermarkGroup('mana', [
        watermark('mana/w', L`White`,     { colored: true }),
        watermark('mana/u', L`Blue`,      { colored: true }),
        watermark('mana/b', L`Black`,     { colored: true }),
        watermark('mana/r', L`Red`,       { colored: true }),
        watermark('mana/g', L`Green`,     { colored: true }),
        watermark('mana/c', L`Colorless`, { colored: true }),
    ]),
    separator(),
    watermarkGuildGroup('mana-pair',      { colored: true }),
    watermarkGuildGroup('ravnica'),
    watermarkGuildGroup('og-ravnica'),
    watermarkGroup('strixhaven', [
        watermark('strixhaven/lorehold',    L`Lorehold`),
        watermark('strixhaven/prismari',    L`Prismari`),
        watermark('strixhaven/quandrix',    L`Quandrix`),
        watermark('strixhaven/silverquill', L`Silverquill`),
        watermark('strixhaven/witherbloom', L`Witherbloom`),
    ]),
    separator(),
    watermarkGroup('alara', [
        watermark('alara/bant',   L`Bant`),
        watermark('alara/esper',  L`Esper`),
        watermark('alara/grixis', L`Grixis`),
        watermark('alara/jund',   L`Jund`),
        watermark('alara/naya',   L`Naya`),
    ]),
    watermarkGroup('capenna', [
        watermark('capenna/brokers',   L`Brokers`),
        watermark('capenna/cabaretti', L`Cabaretti`),
        watermark('capenna/maestros',  L`Maestros`),
        watermark('capenna/obscura',   L`Obscura`),
        watermark('capenna/riveteers', L`Riveteers`),
    ]),
    watermarkGroup('innistrad', [
        watermark('innistrad/gavony',   L`Gavony`),
        watermark('innistrad/kessig',   L`Kessig`),
        watermark('innistrad/nephalia', L`Nephalia`),
        watermark('innistrad/stensia',  L`Stensia`),
    ]),
    watermarkGroup('tarkir', [
        watermark('tarkir/abzan',    L`Abzan`),
        watermark('tarkir/jeskai',   L`Jeskai`),
        watermark('tarkir/mardu',    L`Mardu`),
        watermark('tarkir/sultai',   L`Sultai`),
        watermark('tarkir/temur',    L`Temur`),
        watermark('tarkir/atarka',   L`Atarka`),
        watermark('tarkir/dromoka',  L`Dromoka`),
        watermark('tarkir/kolaghan', L`Kolaghan`),
        watermark('tarkir/ojutai',   L`Ojutai`),
        watermark('tarkir/silumgar', L`Silumgar`),
    ]),
    watermarkGroup('theros', [
        watermark('theros/akros',   L`Akros`),
        watermark('theros/meletis', L`Meletis`),
        watermark('theros/setessa', L`Setessa`),
    ]),
    separator(),
    watermarkGroup('mirrodin', [
        watermark('mirrodin/mirrodin', L`Mirrodin`),
        watermark('mirrodin/phyrexia', L`Phyrexia`),
    ]),
    watermarkGroup('other', [
        watermark('other/aetherprint',     L`Aetherprint`),
        watermark('other/chaos',           L`Chaos`),
        watermark('other/colorpie',        L`Color Pie`),
        watermark('other/desparked',       L`Desparked`),
        watermark('other/foretell',        L`Foretell`),
        watermark('other/jace-consortium', L`Jace Consortium`),
        watermark('other/phyrexia',        L`Phyrexia`),
        watermark('other/planeswalker',    L`Planeswalker`),
        watermark('other/seekersofcarmot', L`Seekers of Carmot`),
    ]),
]);
