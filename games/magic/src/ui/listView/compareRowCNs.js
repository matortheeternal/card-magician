import { isEmblem, isToken } from '../../domain/helpers.js';

function compareTokenValues(aToken, bToken) {
    if (bToken && !aToken) return -1;
    if (aToken && !bToken) return 1;
    return 0;
}

export default function compareRowCNs(a, b) {
    const aToken = isToken(a.original) || isEmblem(a.original);
    const bToken = isToken(b.original) || isEmblem(b.original);
    const tokenCmp = compareTokenValues(aToken, bToken);

    if (tokenCmp !== 0) return tokenCmp;
    const aData = a.data.collectorNumber;
    const bData = b.data.collectorNumber;
    return aData.localeCompare(bData);
}
