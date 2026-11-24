const L = localize('module-classic-shifted-frame');

export default [{
    id: 'artSize',
    type: 'select',
    label: L`Art Size`,
    options: [
        { id: 'standard',   name: L`Standard` },
        { id: 'extended',   name: L`Extended` },
    ]
}, {
    id: 'dualLandBlend',
    type: 'select',
    label: L`Dual Land Blend`,
    options: [
        { id: 'gradient',   name: L`Gradient` },
        { id: 'alpha',      name: L`Alpha` },
    ]
}];
