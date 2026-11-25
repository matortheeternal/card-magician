const L = localize('module-classic-frame');

export default [{
    id: 'frame',
    type: 'select',
    label: L`Frame`,
    options: [
        { id: 'classic',    name: L`Classic` },
        { id: 'shifted',    name: L`Shifted` },
        { id: 'clear',      name: L`Clear` },
    ]
}, {
    id: 'artSize',
    type: 'select',
    label: L`Art Size`,
    options: [
        { id: 'standard',   name: L`Standard` },
        { id: 'extended',   name: L`Extended` },
        { id: 'background', name: L`Background` },
    ]
}, {
    id: 'dualLandBlend',
    type: 'select',
    label: L`Dual Land Blend`,
    options: [
        { id: 'gradient',   name: L`Gradient` },
        { id: 'alpha',      name: L`Alpha` },
    ]
}, {
    id: 'nonbasicLandColoring',
    type: 'select',
    label: L`Nonbasic Land Coloring`,
    options: [
        { id: 'trimAndTextbox', name: L`Trim and Text Box` },
        { id: 'textbox',        name: L`Text Box` },
        { id: 'trim',           name: L`Trim` },
        { id: 'none',           name: L`None` },
    ]
}, {
    id: 'multicolorGradient',
    type: 'select',
    label: L`Multicolor Gradient`,
    options: [
        { id: 'full',       name: L`Full Card` },
        { id: 'trim',       name: L`Trim Only` },
    ]
}, {
    id: 'artifactGradient',
    type: 'select',
    label: L`Artifact Gradient`,
    options: [
        { id: 'full',       name: L`Full Card` },
        { id: 'trim',       name: L`Trim Only` },
    ]
}, {
    id: 'colorlessStyle',
    type: 'select',
    label: L`Colorless Style`,
    options: [
        { id: 'standard',   name: L`Standard` },
        { id: 'eldrazi',    name: L`Eldrazi` },
    ]
}, {
    id: 'frameOpacity',
    type: 'number',
    label: L`Frame Opacity`,
    min: 0,
    max: 100,
    step: 5,
    default: 75
}];
