const imagePathAdapters = {
    "phyrexian color":
        (size, sym) => `${size}/phyrexian/${sym.colorKey}.png`,
    "generic/split":
        (size, sym) => `${size}/hybrid2/2${sym.colorKey}.png`,
    "5-color hybrid":
        (size, sym) => `${size}/hybrid5/wubrg.png`,
    "3-color hybrid":
        (size, sym) => `${size}/hybrid3/2${sym.colorKey}.png`,
    "2-color hybrid":
        (size, sym) => `${size}/hybrid2/${sym.colorKey}.png`,
    "half color":
        (size, sym) => `${size}/half/${sym.colorKey}.png`,
    "two+ digit number":
        (size, sym) => `${size}/num/${sym.value}.png`,
    "single":
        (size, sym) => `${size}/single/${sym.value}.png`,
    "tap":
        (size, sym) => `${size}/tap/${sym.value}.png`,
};

const manaCircle = (size, text) => [
    `<div class="mana-circle" :style="${size}ManaCircleStyle">`,
        text,
    `</div>`
].join('');

const img = (src) => `<img class="sym" src="${src}"/>`;

export class Symbol {
    constructor(type, value) {
        this.type = type;
        this.value = value.toLowerCase();
        this.parts = this.value.split('/');
        this.colorKey = this.parts
            .filter(c => 'wubrgc'.includes(c))
            .join('');
    }

    isTwoColorHybrid() {
        return this.type === '2-color hybrid';
    }

    isColored() {
        return this.colorKey !== 'c' && this.colorKey;
    }

    async toHTML(utils, size) {
        if (this.type === 'circle with text')
            return manaCircle(size, this.value.toUpperCase());

        const adapter = imagePathAdapters[this.type];
        if (!adapter) throw new Error('No image path adapter found for ' + this.type);

        return img(await utils.assetURL(adapter(size, this)));
    }
}
