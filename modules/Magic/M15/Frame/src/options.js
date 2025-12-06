export default () => ([{
    id: 'frame',
    label: 'Frame',
    type: 'select',
    options: [
        { id: 'normal',          name: 'Default' },
        { id: 'devoid',          name: 'Devoid' },
        { id: 'clear',           name: 'Clear' },
        { id: 'fnm',             name: 'FNM Promo' },
        { id: 'dka',             name: 'DKA Full Art' },
        { id: 'inverted',        name: 'Inverted' },
        { id: 'planeshifted',    name: 'Planeshifted' },
    ]
}, {
    id: 'artSize',
    type: 'select',
    label: 'Art Size',
    options: [
        { id: 'normal',           name: 'Default' },
        { id: 'borderless',       name: 'Borderless' },
        { id: 'clearBorderless',  name: 'Clear Borderless' },
        { id: 'frameless',        name: 'Frameless' },
        { id: 'puma',             name: 'PUMA' },
    ]
}, {
    id: 'crownStyle',
    type: 'select',
    label: 'Crown',
    options: [
        { id: 'auto',       name: 'Auto' },
        { id: 'normal',     name: 'Normal' },
        { id: 'nyx',        name: 'Nyx' },
        { id: 'companion',  name: 'Companion' },
        { id: 'brawl',      name: 'Brawl' },
        { id: 'disabled',   name: 'Disabled' },
    ]
}, {
    id: 'nyxStyle',
    type: 'select',
    label: 'Nyx',
    options: [
        { id: 'auto',       name: 'Auto' },
        { id: 'normal',     name: 'Normal' },
        { id: 'star',       name: 'Star' },
        { id: 'disabled',   name: 'Disabled' },
    ]
}, {
    id: 'vehicleStyle',
    type: 'select',
    label: 'Vehicle',
    options: [
        { id: 'auto',       name: 'Auto' },
        { id: 'normal',     name: 'Normal' },
        { id: 'disabled',   name: 'Disabled' },
    ]
}, {
    id: 'snowStyle',
    type: 'select',
    label: 'Snow',
    options: [
        { id: 'auto',       name: 'Auto' },
        { id: 'normal',     name: 'Normal' },
        { id: 'disabled',   name: 'Disabled' },
    ]
}, {
    id: 'scrollsStyle',
    type: 'select',
    label: 'Scrolls',
    options: [
        { id: 'auto',       name: 'Auto' },
        { id: 'normal',     name: 'Normal' },
        { id: 'disabled',   name: 'Disabled' },
    ]
}, {
    id: 'draftStyle',
    type: 'select',
    label: 'Draft',
    options: [
        { id: 'auto',       name: 'Auto' },
        { id: 'normal',     name: 'Normal' },
        { id: 'disabled',   name: 'Disabled' },
    ]
}, {
    id: 'miracleStyle',
    type: 'select',
    label: 'Miracle',
    options: [
        { id: 'auto',       name: 'Auto' },
        { id: 'normal',     name: 'Normal' },
        { id: 'disabled',   name: 'Disabled' },
    ]
}, {
    id: 'mutateStyle',
    type: 'select',
    label: 'Mutate',
    options: [
        { id: 'auto',       name: 'Auto' },
        { id: 'normal',     name: 'Normal' },
        { id: 'disabled',   name: 'Disabled' },
    ]
}, {
    id: 'ubStyle',
    type: 'select',
    label: 'Universes Beyond',
    options: [
        { id: 'auto',       name: 'Auto' },
        { id: 'normal',     name: 'Normal' },
        { id: 'disabled',   name: 'Disabled' },
    ]
}, {
    id: 'hybridStyle',
    type: 'multiselect',
    label: 'Hybrid Style',
    options: [
        { id: 'reverse',    name: 'Reverse' },
        { id: 'vertical',   name: 'Vertical' },
    ]
}, {
    id: 'hybridBlendStyle',
    type: 'select',
    label: 'Hybrid Blend Style',
    options: [
        { id: 'grey',   name: 'Grey' },
        { id: 'gold',   name: 'Gold' },
        { id: 'hybrid', name: 'Hybrid' },
    ]
}, {
    id: 'other',
    type: 'checkboxlist',
    label: 'Extra options',
    options: [
        { id: 'avoidCoveringDevoid', label: 'Avoid covering devoid' }
    ],
    default: { avoidCoveringDevoid: true }
}]);
