import compareRowPTs from './compareRowPTs.js';
import compareRowManaCosts from './compareRowManaCosts.js';
import compareRowRarity from './compareRarity.js';

function collect(row, key, separator = ' // ') {
    return [row.front[key], row.back && row.back[key]]
        .filter(Boolean)
        .join(separator);
}

function collectMap(row, fn, separator = ' // ') {
    return [fn(row.front), row.back && fn(row.back)]
        .filter(Boolean)
        .join(separator);
}

function collectUnique(row, fn, separator = ', ') {
    const values = new Set([...fn(row.front), ...fn(row.back)]);
    return [...values].join(separator);
}

export function buildColumns() {
    return [{
        label: 'Name',
        width: '240px',
        data: row => collect(row, 'name')
    }, {
        label: 'Cost',
        width: '87px',
        data: row => collectMap(row, f => {
            if (!f.manaCost?.toString) return '';
            return f.manaCost.toString().toUpperCase();
        }),
        compare: compareRowManaCosts
    }, {
        label: 'CMC',
        width: '60px',
        data: row => collectMap(row, f => {
            if (!f.manaCost?.cmc) return '';
            return f.manaCost.cmc.toString();
        }),
        compare: (a, b) => {
            return (parseInt(a.data.cmc) || 0)
                 - (parseInt(b.data.cmc) || 0);
        }
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
        }),
        compare: compareRowPTs
    }, {
        label: 'Color',
        width: '200px',
        data: row => collectUnique(row, f => {
            if (!f?.colors) return [];
            return f.colors.map(c => c.name);
        })
    }, {
        label: 'Rarity',
        width: '100px',
        data: row => {
            if (!row.front.rarity) return '';
            return row.front.rarity.slice(0, 1).toUpperCase() +
                   row.front.rarity.slice(1);
        },
        compare: compareRowRarity
    }, {
        label: '#',
        width: '50px',
        data: row => {
            const number = row.front.collectorNumber || row.front.autoCollectorNumber;
            return (parseInt(number) || 0).toString().padStart(4, '0');
        }
    }];
}
