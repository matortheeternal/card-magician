const L = localize('edit-tag');

export default [{
    id: 'text'
}, {
    id: 'variant',
    type: 'select',
    options: [
        { id: 'neutral', name: L`Neutral` },
        { id: 'primary', name: L`Primary` },
        { id: 'success', name: L`Success` },
        { id: 'warning', name: L`Warning` },
        { id: 'danger',  name: L`Danger` },
    ]
}];
