function collect(row, key, separator = ' // ') {
    const values = [];
    for (const face of Object.values(row))
        if (face[key]) values.push(face[key]);
    return values.join(separator);
}

function collectMap(row, fn, separator = ' // ') {
    const values = [];
    for (const face of Object.values(row)) {
        const value = fn(face);
        if (value) values.push(value);
    }
    return values.join(separator);
}

export function buildColumns({ calculateCmc, calculateColors }) {
    return [{
        label: 'Name',
        width: '5fr',
        data: row => collect(row, 'name')
    }, {
        label: 'Cost',
        width: '1fr',
        data: row => collect(row, 'manaCost').toUpperCase()
    }, {
        label: 'CMC',
        width: '1fr',
        data: row => calculateCmc(row.card?.manaCost)
    }, {
        label: 'Type',
        width: '4fr',
        data: row => collectMap(row, f => {
            if (!f.superType && !f.subType) return '';
            if (!f.subType) return f.superType;
            return `${f.superType || ''} — ${f.subType}`;
        })
    }, {
        label: 'P/T',
        id: 'pt',
        width: '1fr',
        data: row => collectMap(row, f => {
            if (!f.power && !f.toughness) return '';
            return `${f.power || ''} / ${f.toughness || ''}`;
        })
    }, {
        label: 'Color',
        width: '3fr',
        data: row => calculateColors(row)
    }, {
        label: 'Rarity',
        width: '2fr',
        data: row => row.card?.rarity || ''
    }, {
        label: 'Number',
        width: '1fr',
        data: row => row.card?.collectorNumber || ''
    }];
}
