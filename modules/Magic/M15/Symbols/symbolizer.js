export const img = (src) => `<img class="sym" src="${src}"/>`;

const manaCircle = (size, text) =>
    `<div class="mana-circle" :style="${size}ManaCircleStyle">${text}</div>`;

function getMultiColorKey(str) {
    let lstr = str.toLowerCase();
    return 'cwubrg'.split('').filter(c => lstr.includes(c)).join('');
}

function getHybridCount(str) {
    return new Set(str.split('/')).size;
}

export const buildSymbolConverters = (utils) => ([
    {
        name: 'colored phyrexian',
        match: str => str.match(/^(h\/[wubrgh]|[wubrg]\/h)/i),
        convert: async (size, [str]) => {
            const key = getMultiColorKey(str);
            return img(await utils.assetURL(`${size}/phyrexian/${key}.png`));
        }
    },
    {
        // TODO: support generic number splits
        name: 'generic/split',
        match: str => str.match(/^[2]\/([wubrgc])/i),
        convert: async (size, [,c]) => {
            return img(await utils.assetURL(`${size}/hybrid2/2${c}.png`));
        }
    },
    {
        name: '5-color hybrid',
        match: str => {
            const match = str.match(/^[wubrg](\/[wubrg]){4}/i);
            if (!match || getHybridCount(match[0]) !== 5) return;
            return match;
        },
        convert: async (size) => {
            return img(await utils.assetURL(`${size}/hybrid5/wubrg.png`));
        }
    },
    // TODO: MISSING ASSETS FOR 4-COLOR HYBRID
    // {
    //     name: '4-color hybrid',
    //     expr: /^(?!.*([wubrg]).*\1)[wubrg](\/[wubrg]){3}$/i,
    //     convert: async (size, [str]) => {
    //         // TODO: dynamically construct split mana symbol
    //     }
    // },
    {
        name: '3-color hybrid',
        match: str => {
            const match = str.match(/^[wubrg](\/[wubrg]){2}/i);
            if (!match || getHybridCount(match[0]) !== 3) return;
            return match;
        },
        convert: async (size, [str]) => {
            const key = getMultiColorKey(str);
            return img(await utils.assetURL(`${size}/hybrid3/${key}.png`));
        }
    },
    {
        name: '2-color hybrid',
        match: str => {
            const match = str.match(/^[wubrg]\/[wubrg]/i);
            if (!match || getHybridCount(match[0]) !== 2) return;
            return match;
        },
        convert: async (size, [str]) => {
            const key = getMultiColorKey(str);
            return img(await utils.assetURL(`${size}/hybrid2/${key}.png`));
        }
    },
    {
        name: 'half color',
        match: str => str.match(/^\|[wubrgs]/i),
        convert: async (size, [str]) => {
            const key = str[1];
            return img(await utils.assetURL(`${size}/half/${key}.png`));
        }
    },
    {
        name: 'two digit number, and 100',
        match: str => str.match(/^(100|99|30|[1-2][0-9])/i),
        convert: async (size, [str]) => {
            return img(await utils.assetURL(`${size}/num/${str}.png`));
        }
    },
    {
        name: 'circle with text',
        match: str => str.match(/^[0-9|\/flxyz]/i),
        convert: async (size, [str]) => {
            return manaCircle(size, str.toUpperCase());
        }
    },
    {
        name: 'single',
        match: str => str.match(/^[wubrgchsei]/i),
        convert: async (size, [str]) => {
            return img(await utils.assetURL(`${size}/single/${str}.png`));
        }
    },
    {
        name: 'tap',
        match: str => str.match(/^[tq]/i),
        convert: async (size, [str]) => {
            return img(await utils.assetURL(`${size}/tap/${str}.png`));
        }
    }
]);
