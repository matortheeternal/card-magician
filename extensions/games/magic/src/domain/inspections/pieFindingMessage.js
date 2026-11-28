const L = localize('game-magic');

const colorNames = {
    W: L`white`, U: L`blue`, B: L`black`, R: L`red`, G: L`green`, C: L`colorless`
};

function colorList(colors) {
    const names = colors.map(color => colorNames[color]);
    if (names.length === 1) return names[0];
    const last = names.at(-1);
    const first = names.slice(0, -1).join(', ');
    return L`${first} and ${last}`;
}

export default function pieFindingMessage({ tier, offending }) {
    const colors = colorList(offending);
    if (tier.name === 'tertiary') return L`Pie bend in ${colors}.`;
    return L`Pie break in ${colors}.`;
}
