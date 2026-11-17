import { compareCardOrder, highestSequence } from './cardOrder.js';

function card(fileName, sequence) {
    return { sequence, files: { get: () => `/set/cards/${fileName}` } };
}

function names(cards) {
    return cards.map(item => item.files.get('data').split('/').pop());
}

describe('Card order', () => {
    it('orders cards by sequence number', () => {
        const cards = [card('A.yml', 3), card('B.yml', 1), card('C.yml', 2)];
        expect(names(cards.sort(compareCardOrder))).toEqual(['B.yml', 'C.yml', 'A.yml']);
    });

    it('puts unnumbered cards after numbered ones, in file name order', () => {
        const cards = [
            card('Lightning Bolt.yml'), card('Zebra.yml', 2),
            card('Lightning Bolt-2.yml'), card('Ant.yml', 1)
        ];
        expect(names(cards.sort(compareCardOrder))).toEqual([
            'Ant.yml', 'Zebra.yml', 'Lightning Bolt-2.yml', 'Lightning Bolt.yml'
        ]);
    });

    it('orders cards sharing a sequence number by file name', () => {
        const cards = [card('B.yml', 1), card('A.yml', 1)];
        expect(names(cards.sort(compareCardOrder))).toEqual(['A.yml', 'B.yml']);
    });

    it('finds the highest sequence number, ignoring unnumbered cards', () => {
        expect(highestSequence([])).toBe(0);
        expect(highestSequence([card('A.yml', 4), card('B.yml'), card('C.yml', 9)]))
            .toBe(9);
    });
});
