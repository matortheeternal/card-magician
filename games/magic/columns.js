function collect(row, key, separator = ' // ') {
    const values = [];
    for (const face of Object.values(row))
        if (face[key]) values.push(face[key]);
    return values.join(separator);
}

export function buildColumns({ calculateCmc, calculateColors }) {
    return [{
        label: 'Name',
        width: '5fr',
        data: row => collect(row, 'name'),
        onItemClick: card => (view.activeCard = card)
    }, {
        label: 'Cost',
        width: '1fr',
        data: row => collect(row, 'cost').toUpperCase()
    }, {
        label: 'CMC',
        width: '1fr',
        data: row => calculateCmc(row.card?.cost)
    }, {
        label: 'Type',
        width: '4fr',
        data: row => collect(row, f => `${f.superType} — ${f.subType}`)
    }, {
        label: 'P/T',
        id: 'pt',
        width: '1fr',
        data: row => collect(row, f => `${f.power} / ${f.toughness}`)
    }, {
        label: 'Color',
        width: '3fr',
        data: row => calculateColors(row)
    }, {
        label: 'Rarity',
        width: '2fr',
        data: row => row.card?.rarity
    }, {
        label: 'Number',
        width: '1fr',
        data: row => row.card?.collectorNumber
    }];
}
