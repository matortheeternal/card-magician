const L = localize('game-magic');

const ALLOWED = { id: 'allowed', label: L`Allowed`, isFlagged: false };

export const SEVERITIES = {
    primary: ALLOWED,
    secondary: ALLOWED,
    tertiary: { id: 'bend', label: L`Bend`, isFlagged: true },
    none: { id: 'break', label: L`Break`, isFlagged: true }
};
