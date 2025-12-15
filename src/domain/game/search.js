import SigilSifter from 'sigil-sifter';

const sifter = new SigilSifter();

export { sifter };

export function filter(cards, query) {
    return sifter.filter(cards, query);
}
