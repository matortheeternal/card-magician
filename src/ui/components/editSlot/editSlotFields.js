const L = localize('edit-packs-modal');

export default [{
    id: 'label',
    label: L`Label`
}, {
    id: 'count',
    label: L`Count`,
    type: 'number'
}, {
    id: 'collation',
    label: L`Collation Strategy`,
    type: 'select',
    options: [
        { id: 'random', name: L`Random` },
        { id: 'uniqueRandom', name: L`Unique Random` },
        { id: 'sheet', name: L`Virtual Sheet` },
        { id: 'runs', name: L`Balanced Runs` },
    ]
}];
