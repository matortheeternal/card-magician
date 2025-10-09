async function background(utils, path, zIndex) {
    const url = await utils.assetURL(path);
    return { url, zIndex };
}

function resolveCrown(card) {
    const { c } = card.color;
    const crownPath = ['crowns'];
    if (card.isEnchantment()) crownPath.push('nyx');
    crownPath.push(`${c}.png`);
    return crownPath.join('/');
}

function getBorderMaskPath(card) {
    const filenameParts = [];
    if (card.isLegendary()) filenameParts.push('crown');
    const filename = filenameParts.join('_') || 'base';
    return ['masks', 'border', `${filename}.png`].join('/');
}

export const buildPipeline = (utils) => [{
    name: 'colorless, monocolor, multicolor base',
    useBackground: card => {
        return card.color.colors.length <= 1 ||
            card.color.colors.length >= 3;
    },
    apply: async (card, bgs) => {
        const { c } = card.color;
        bgs.base = await background(utils, `card/${c}.jpg`, -10);
    }
}, {
    name: 'two-color base',
    useBackground: card => card.color.colors.length === 2,
    apply: async (card, bgs) => {
        const [c1, c2] = card.color.colors;
        const images = await Promise.all([
            utils.assetURL(`card/${c1}.jpg`),
            utils.assetURL(`card/${c2}.jpg`)
        ]);
        const url = await utils.linearBlend(...images, 0.4, 0, 0.6, 0);
        bgs.base = { url, zIndex: -10 };
    }
}, {
    name: 'artifact blend',
    useBackground: card => card.isArtifact(),
    apply: async (card, bgs) => {
        const artifactUrl = await utils.assetURL('card/a.jpg');
        const maskUrl = await utils.assetURL('masks/blend/artifact.png');
        bgs.base.url = await utils.maskedBlend(bgs.base.url, artifactUrl, maskUrl);
    }
}, {
    name: 'vehicle blend and mask',
    useBackground: card => card.isVehicle(),
    apply: async (card, bgs) => {
        const vehicleUrl = await utils.assetURL(`trims/vehicle.png`);
        const maskUrl = await utils.assetURL(`masks/375x523 trim mask.png`);
        const blendUrl = await utils.maskImage(vehicleUrl, maskUrl);
        bgs.vehicle = { url: blendUrl, zIndex: -9 };
    }
}, {
    name: 'enchantment blend (nyx)',
    useBackground: card => card.isEnchantment(),
    apply: async (card, bgs) => {
        const { c } = card.color;
        const nyxUrl = await utils.assetURL(`nyx/${c}.png`);
        const maskUrl = await utils.assetURL(`masks/375x523 trim mask.png`);
        const blendUrl = await utils.maskImage(nyxUrl, maskUrl);
        bgs.nyx = { url: blendUrl, zIndex: -9 };
    }
}, {
    name: 'legendary crown and mask',
    useBackground: card => card.isLegendary(),
    apply: async (card, bgs) => {
        bgs.crown = await background(utils, resolveCrown(card), -8);
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
