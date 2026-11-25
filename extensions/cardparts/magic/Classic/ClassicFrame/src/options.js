const L = localize('module-classic-frame');

export default [{
    id: 'frame',
    type: 'select',
    label: L`Frame`,
    options: [
        { id: 'shifted',    name: L`Shifted` },
    ]
}, {
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
