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
        width: '250px',
        data: row => collect(row, 'name')
    }, {
        label: 'Cost',
        width: '88px',
        data: row => collect(row, 'manaCost').toUpperCase()
    }, {
        label: 'CMC',
        width: '60px',
        data: row => calculateCmc(row.card?.manaCost)
    }, {
        label: 'Type',
        width: '230px',
        data: row => collectMap(row, f => {
            if (!f.superType && !f.subType) return '';
            if (!f.subType) return f.superType;
            return `${f.superType || ''} — ${f.subType}`;
        })
    }, {
        label: 'P/T',
        id: 'pt',
        width: '60px',
        data: row => collectMap(row, f => {
            if (!f.power && !f.toughness) return '';
            return `${f.power || ''} / ${f.toughness || ''}`;
        })
    }, {
        label: 'Color',
        width: '210px',
        data: row => calculateColors(row)
    }, {
        label: 'Rarity',
        width: '100px',
        data: row => row.card?.rarity || ''
    }, {
        label: '#',
        width: '50px',
        data: row => row.card?.collectorNumber || ''
    }];
}
