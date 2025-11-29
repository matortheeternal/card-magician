

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

function collectUnique(row, fn, separator = ', ') {
    const values = new Set();
    for (const face of Object.values(row)) {
        const valuesToAdd = fn(face);
        if (valuesToAdd.length)
            valuesToAdd.forEach(v => values.add(v));
    }
    return [...values].join(separator);
}

export function buildColumns({ ManaCost }) {
    return [{
        label: 'Name',
        width: '250px',
        data: row => collect(row, 'name')
    }, {
        label: 'Cost',
        width: '87px',
        data: row => collect(row, 'manaCost').toUpperCase()
    }, {
        label: 'CMC',
        width: '60px',
        data: row => collectMap(row, f => {
            if (!f.manaCost) return '';
            return ManaCost.parse(f.manaCost).cmc.toString();
        })
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
        width: '200px',
        data: row => collectUnique(row, f => {
            if (!f.colors) return [];
            return f.colors.map(c => c.name);
        })
    }, {
        label: 'Rarity',
        width: '100px',
        data: row => row.front.rarity || ''
    }, {
        label: '#',
        width: '50px',
        data: row => {
            return parseInt(row.front?.collectorNumber || '0')
                .toString()
                .padStart(4, '0');
        }
    }];
}
