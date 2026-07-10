import compareRowPTs from './compareRowPTs.js';
import compareRowManaCosts from './compareRowManaCosts.js';
import compareRowRarity from './compareRarity.js';
import compareRowColors from './compareRowColors.js';
import compareRowCNs from './compareRowCNs.js';

const L = localize('game-magic-columns');

export function collect(row, key, separator = ' // ') {
    return [
        row.front[key],
        row.front.bottom && row.front.bottom[key],
        row.front.top && row.front.top[key],
        row.front.adventure && row.front.adventure[key],
        row.back && row.back[key],
        row.back?.bottom && row.back.bottom[key],
        row.back?.top && row.back.top[key],
        row.back?.adventure && row.back.adventure[key],
    ].filter(Boolean).join(separator);
}

export function collectMap(row, fn, separator = ' // ') {
    return [
        fn(row.front),
        row.front.bottom && fn(row.front.bottom),
        row.front.top && fn(row.front.top),
        row.front.adventure && fn(row.front.adventure),
        row.back && fn(row.back),
        row.back?.bottom && fn(row.back.bottom),
        row.back?.top && fn(row.back.top),
        row.back?.adventure && fn(row.back.adventure),
    ].filter(Boolean).join(separator);
}

function collectUnique(row, fn, separator = ', ') {
    const values = new Set([
        ...fn(row.front),
        ...fn(row.front.bottom),
        ...fn(row.front.top),
        ...fn(row.front.adventure),
        ...fn(row.back),
        ...fn(row.back?.bottom),
        ...fn(row.back?.top),
        ...fn(row.back?.adventure),
    ]);
    return [...values].join(separator);
}

export function buildColumns() {
    return [{
        label: L`Name`,
        width: '240px',
        data: row => collect(row, 'name')
    }, {
        label: L`Cost`,
        width: '75px',
        data: row => collectMap(row, f => {
            if (!f.manaCost?.toString) return '';
            return f.manaCost.toString().toUpperCase();
        }),
        compare: compareRowManaCosts
    }, {
        label: L`CMC`,
        width: '50px',
        data: row => collectMap(row, f => {
            if (!f.manaCost?.cmc) return '';
            return f.manaCost.cmc.toString();
        }),
        compare: (a, b) => {
            return (parseInt(a.data.cmc) || 0)
                 - (parseInt(b.data.cmc) || 0);
        }
    }, {
        label: L`Type`,
        width: '280px',
        data: row => collectMap(row, f => {
            if (!f.superType && !f.subType) return '';
            if (!f.subType) return f.superType;
            return `${f.superType || ''} — ${f.subType}`;
        })
    }, {
        label: L`P/T`,
        id: 'pt',
        width: '60px',
        data: row => collectMap(row, f => {
            if (!f.power && !f.toughness) return '';
            return `${f.power || ''} / ${f.toughness || ''}`;
        }),
        compare: compareRowPTs
    }, {
        label: L`Color`,
        width: '150px',
        data: row => collectUnique(row, f => {
            if (!f?.colors) return [];
            return f.colors.map(c => c.name);
        }),
        compare: compareRowColors
    }, {
        label: L`Rarity`,
        width: '75px',
        data: row => {
            if (!row.front.rarity) return '';
            return row.front.rarity.slice(0, 1).toUpperCase()
                   + row.front.rarity.slice(1);
        },
        compare: compareRowRarity
    }, {
        id: 'collectorNumber',
        label: L`#`,
        width: '50px',
        data: row => {
            const number = row.front.collectorNumber || row.front.autoCollectorNumber;
            return number.padStart(4, '0');
        },
        compare: compareRowCNs
    }];
}
