import { indent, objectToAttributesString } from './svgText.js';

export default class LayerGroup {
    constructor(index) {
        this.index = index;
        this.layers = [];
    }

    get id() {
        return `group-${this.index}`;
    }

    get shapeString() {
        const attributes = objectToAttributesString({
            height: '100',
            width: '100',
            mask: `url(#${this.id})`,
            fill: 'url(#grad)'
        });
        return `<rect ${attributes} />`;
    }

    get outputString() {
        return [
            `<g filter="url(#outline-filter)">`,
            indent(this.shapeString),
            `</g>`,
        ].join('\n');
    }

    get defsString() {
        return [
            ...this.layers.map(layer => layer.defsString),
            this.createMask(),
        ].join('\n');
    }

    addLayer(layer) {
        this.layers.push(layer);
    }

    createMask() {
        return [
            `<mask id="${this.id}">`,
            ...this.layers.map(layer => indent(layer.fillMask)),
            `</mask>`
        ].join('\n');
    }
}
