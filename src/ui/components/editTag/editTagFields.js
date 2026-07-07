const L = localize('edit-tag');

export default [{
    id: 'text',
    label: L`Text`
}, {
    id: 'variant',
    label: L`Variant`,
    type: 'select',
    options: [
        { id: 'neutral', name: L`Neutral` },
        { id: 'primary', name: L`Primary` },
        { id: 'success', name: L`Success` },
        { id: 'warning', name: L`Warning` },
        { id: 'danger',  name: L`Danger` },
    ]
}, {
    id: 'scope',
    label: L`Scope`,
    type: 'select',
    options: [
        { id: 'project', name: L`Project` },
        { id: 'game',    name: L`Game` },
        { id: 'global',  name: L`Global` },
    ]
}];
