async function background(utils, path, zIndex) {
    const url = await utils.assetURL(path);
    return { url, zIndex };
}

function resolveCrown(card, key) {
    const crownPath = ['crowns'];
    if (card.isEnchantment()) crownPath.push('nyx');
    crownPath.push(`${key}.png`);
    return crownPath.join('/');
}

function getBorderMaskPath(card) {
    const filenameParts = [];
    if (card.isLegendary()) filenameParts.push('crown');
    const filename = filenameParts.join('_') || 'base';
    return ['masks', 'border', `${filename}.png`].join('/');
}

export const buildPipeline = (utils) => [{
    name: 'card',
    useBackground: card => !card.colorIdentity.isHybrid(),
    apply: async (card, bgs) => {
        let key = card.getCardColorKey();
        if (card.isLand()) key += 'l';
        const folder = card.isSnow() ? 'snow' : 'card';
        bgs.base = await background(utils, `${folder}/${key}.jpg`, -10);
    }
}, {
    name: 'hybrid',
    useBackground: card => card.colorIdentity.isHybrid(),
    apply: async (card, bgs) => {
        let [c1, c2] = card.colorIdentity.colors;
        if (card.isLand()) c1 += 'l', c2 += 'l';
        const folder = card.isSnow() ? 'snow' : 'card';
        const images = await Promise.all([
            utils.assetURL(`${folder}/${c1.char}.jpg`),
            utils.assetURL(`${folder}/${c2.char}.jpg`)
        ]);
        const url = await utils.linearBlend(...images, 0.4, 0, 0.6, 0);
        bgs.base = { url, zIndex: -10 };
    }
}, {
    name: 'artifact',
    useBackground: card => card.isArtifact(),
    apply: async (card, bgs) => {
        const key = card.isLand() ? 'al' : 'a';
        const folder = card.isSnow() ? 'snow' : 'card';
        const artifactUrl = await utils.assetURL(`${folder}/${key}.jpg`);
        const maskUrl = await utils.assetURL('masks/blend/artifact.png');
        bgs.base.url = await utils.maskedBlend(bgs.base.url, artifactUrl, maskUrl);
    }
}, {
    name: 'vehicle',
    useBackground: card => card.isVehicle(),
    apply: async (card, bgs) => {
        const vehicleUrl = await utils.assetURL(`trims/vehicle.png`);
        const maskUrl = await utils.assetURL(`masks/375x523 trim mask.png`);
        const blendUrl = await utils.maskImage(vehicleUrl, maskUrl);
        bgs.vehicle = { url: blendUrl, zIndex: -9 };
    }
}, {
    name: 'nyx',
    useBackground: card => card.isEnchantment() &&
        !card.colorIdentity.isHybrid() && !card.isSnow(),
    apply: async (card, bgs) => {
        const key = card.getCardColorKey();
        const nyxUrl = await utils.assetURL(`nyx/${key}.png`);
        const maskUrl = await utils.assetURL(`masks/375x523 trim mask.png`);
        const blendUrl = await utils.maskImage(nyxUrl, maskUrl);
        bgs.nyx = { url: blendUrl, zIndex: -9 };
    }
}, {
    name: 'hybrid nyx',
    useBackground: card => card.isEnchantment() &&
        card.colorIdentity.isHybrid() && !card.isSnow(),
    apply: async (card, bgs) => {
        const [c1, c2] = card.colorIdentity.colors;
        const images = await Promise.all([
            utils.assetURL(`nyx/${c1.char}.jpg`),
            utils.assetURL(`nyx/${c2.char}.jpg`)
        ]);
        const url = await utils.linearBlend(...images, 0.4, 0, 0.6, 0);
        bgs.nyx = { url, zIndex: -9 };
    }
}, {
    name: 'crown',
    useBackground: card => card.isLegendary() && !card.colorIdentity.isHybrid(),
    apply: async (card, bgs) => {
        const crownPath = resolveCrown(card, card.getCardColorKey());
        bgs.crown = await background(utils, crownPath, -8);
    }
}, {
    name: 'hybrid crown',
    useBackground: card => card.isLegendary() && card.colorIdentity.isHybrid(),
    apply: async (card, bgs) => {
        const [c1, c2] = card.colorIdentity.colors;
        const images = await Promise.all([
            utils.assetURL(resolveCrown(card, c1.char)),
            utils.assetURL(resolveCrown(card, c2.char))
        ]);
        const url = await utils.linearBlend(...images, 0.4, 0, 0.6, 0);
        bgs.crown = { url, zIndex: -9 };
    }
}, {
    name: 'border',
    useBackground: () => true,
    apply: async (card, bgs) => {
        const maskUrl = await utils.assetURL(getBorderMaskPath(card));
        const borderUrl = await utils.maskColor(maskUrl, '#000000');
        bgs.border = { url: borderUrl, zIndex: -1 };
    }
}];
