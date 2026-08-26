const L = localize('module-M15-frame');

function computeFrame(card) {
    if (/\bdevoid\b/i.test(card.rulesText)) return 'devoid';
    if (card.isColorless?.() && !card.isArtifact?.()) return 'clear';
    return 'standard';
}

function computeArtSize(card) {
    if (card.isStation?.()) return 'borderless';
    return 'standard';
}

function computeCrownStyle(card) {
    if (!card.isLegendary?.()) return 'disabled';
    if (card.isCompanion?.()) return 'companion';
    if (card.isBrawl?.()) return 'brawl';
    const nyxStyle = card.nyxStyle === 'auto'
        ? computeNyxStyle(card)
        : card.nyxStyle;
    if (nyxStyle !== 'disabled') return 'nyx';
    return 'standard';
}

function computeNyxStyle(card) {
    if (!card.isEnchantment?.()) return 'disabled';
    return card.frame === 'planeshifted' ? 'shifted' : 'standard';
}

function computeVehicleStyle(card) {
    return card.isVehicle?.() ? 'standard' : 'disabled';
}

function computeSnowStyle(card) {
    return card.isSnow?.() ? 'standard' : 'disabled';
}

function computeScrollsStyle(card) {
    return card.isConspiracy?.() ? 'standard' : 'disabled';
}

function computeMiracleStyle(card) {
    return card.isMiracle?.() ? 'standard' : 'disabled';
}

export default (frameOptions) => ([{
    id: 'frame',
    label: L`Frame`,
    type: 'select',
    options: frameOptions || [
        { id: 'auto',            name: L`Auto`, compute: computeFrame },
        { id: 'standard',        name: L`Standard` },
        { id: 'devoid',          name: L`Devoid` },
        { id: 'clear',           name: L`Clear` },
        { id: 'fnm',             name: L`FNM Promo` },
        { id: 'dka',             name: L`DKA Full Art` },
        { id: 'inverted',        name: L`Inverted` },
        { id: 'planeshifted',    name: L`Planeshifted` },
    ]
}, {
    id: 'artSize',
    type: 'select',
    label: L`Art Size`,
    options: [
        { id: 'auto',             name: L`Auto`, compute: computeArtSize },
        { id: 'standard',         name: L`Standard` },
        { id: 'borderless',       name: L`Borderless` },
        { id: 'clearBorderless',  name: L`Clear Borderless` },
        { id: 'frameless',        name: L`Frameless` },
        { id: 'puma',             name: L`PUMA` },
    ]
}, {
    id: 'crownStyle',
    type: 'select',
    label: L`Crown`,
    options: [
        { id: 'auto',       name: L`Auto`, compute: computeCrownStyle },
        { id: 'standard',   name: L`Standard` },
        { id: 'nyx',        name: L`Nyx` },
        { id: 'companion',  name: L`Companion` },
        { id: 'brawl',      name: L`Brawl` },
        { id: 'disabled',   name: L`Disabled` },
    ]
}, {
    id: 'nyxStyle',
    type: 'select',
    label: L`Nyx`,
    options: [
        { id: 'auto',       name: L`Auto`, compute: computeNyxStyle },
        { id: 'standard',   name: L`Standard` },
        { id: 'star',       name: L`Star` },
        { id: 'disabled',   name: L`Disabled` },
    ]
}, {
    id: 'vehicleStyle',
    type: 'select',
    label: L`Vehicle`,
    options: [
        { id: 'auto',       name: L`Auto`, compute: computeVehicleStyle },
        { id: 'standard',   name: L`Standard` },
        { id: 'disabled',   name: L`Disabled` },
    ]
}, {
    id: 'snowStyle',
    type: 'select',
    label: L`Snow`,
    options: [
        { id: 'auto',       name: L`Auto`, compute: computeSnowStyle },
        { id: 'standard',   name: L`Standard` },
        { id: 'disabled',   name: L`Disabled` },
    ]
}, {
    id: 'scrollsStyle',
    type: 'select',
    label: L`Scrolls`,
    options: [
        { id: 'auto',       name: L`Auto`, compute: computeScrollsStyle },
        { id: 'standard',   name: L`Standard` },
        { id: 'disabled',   name: L`Disabled` },
    ]
}, {
    id: 'draftStyle',
    type: 'select',
    label: L`Draft`,
    options: [
        { id: 'auto',       name: L`Auto`, compute: computeScrollsStyle },
        { id: 'standard',   name: L`Standard` },
        { id: 'disabled',   name: L`Disabled` },
    ]
}, {
    id: 'miracleStyle',
    type: 'select',
    label: L`Miracle`,
    options: [
        { id: 'auto',       name: L`Auto`, compute: computeMiracleStyle },
        { id: 'standard',   name: L`Standard` },
        { id: 'disabled',   name: L`Disabled` },
    ]
}, {
    id: 'ubStyle',
    type: 'select',
    label: L`Universes Beyond`,
    options: [
        // TODO: how do we compute this when it's auto?
        { id: 'auto',       name: L`Auto`, compute: () => 'disabled' },
        { id: 'standard',   name: L`Standard` },
        { id: 'disabled',   name: L`Disabled` },
    ]
}, {
    id: 'hybridStyle',
    type: 'multiselect',
    label: L`Hybrid Style`,
    options: [
        { id: 'reverse',    name: L`Reverse` },
        { id: 'vertical',   name: L`Vertical` },
    ]
}, {
    id: 'hybridBlendStyle',
    type: 'select',
    label: L`Hybrid Blend Style`,
    options: [
        { id: 'grey',   name: L`Grey` },
        { id: 'gold',   name: L`Gold` },
        { id: 'hybrid', name: L`Hybrid` },
    ]
}, {
    id: 'meldStyle',
    type: 'select',
    label: L`Meld Style`,
    options: [
        { id: 'none',   name: L`None` },
        { id: 'top',    name: L`Top` },
        { id: 'bottom', name: L`Bottom` },
    ]
}, {
    id: 'otherFrameOptions',
    type: 'checkboxlist',
    label: L`Extra options`,
    options: [
        { id: 'avoidCoveringDevoid', name: L`Avoid covering devoid` }
    ],
    default: { avoidCoveringDevoid: true }
}]);
