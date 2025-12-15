const L = localize('module-M15-frame');

export default () => ([{
    id: 'frame',
    label: L`Frame`,
    type: 'select',
    options: [
        { id: 'normal',          name: L`Default` },
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
        { id: 'normal',           name: L`Default` },
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
        { id: 'auto',       name: L`Auto` },
        { id: 'normal',     name: L`Normal` },
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
        { id: 'auto',       name: L`Auto` },
        { id: 'normal',     name: L`Normal` },
        { id: 'star',       name: L`Star` },
        { id: 'disabled',   name: L`Disabled` },
    ]
}, {
    id: 'vehicleStyle',
    type: 'select',
    label: L`Vehicle`,
    options: [
        { id: 'auto',       name: L`Auto` },
        { id: 'normal',     name: L`Normal` },
        { id: 'disabled',   name: L`Disabled` },
    ]
}, {
    id: 'snowStyle',
    type: 'select',
    label: L`Snow`,
    options: [
        { id: 'auto',       name: L`Auto` },
        { id: 'normal',     name: L`Normal` },
        { id: 'disabled',   name: L`Disabled` },
    ]
}, {
    id: 'scrollsStyle',
    type: 'select',
    label: L`Scrolls`,
    options: [
        { id: 'auto',       name: L`Auto` },
        { id: 'normal',     name: L`Normal` },
        { id: 'disabled',   name: L`Disabled` },
    ]
}, {
    id: 'draftStyle',
    type: 'select',
    label: L`Draft`,
    options: [
        { id: 'auto',       name: L`Auto` },
        { id: 'normal',     name: L`Normal` },
        { id: 'disabled',   name: L`Disabled` },
    ]
}, {
    id: 'miracleStyle',
    type: 'select',
    label: L`Miracle`,
    options: [
        { id: 'auto',       name: L`Auto` },
        { id: 'normal',     name: L`Normal` },
        { id: 'disabled',   name: L`Disabled` },
    ]
}, {
    id: 'mutateStyle',
    type: 'select',
    label: L`Mutate`,
    options: [
        { id: 'auto',       name: L`Auto` },
        { id: 'normal',     name: L`Normal` },
        { id: 'disabled',   name: L`Disabled` },
    ]
}, {
    id: 'ubStyle',
    type: 'select',
    label: L`Universes Beyond`,
    options: [
        { id: 'auto',       name: L`Auto` },
        { id: 'normal',     name: L`Normal` },
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
    id: 'other',
    type: 'checkboxlist',
    label: L`Extra options`,
    options: [
        { id: 'avoidCoveringDevoid', name: L`Avoid covering devoid` }
    ],
    default: { avoidCoveringDevoid: true }
}]);
