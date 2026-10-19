import LayerGroup from './LayerGroup.js';
import { indent, objectToAttributesString } from './svgText.js';

const gradient
    = `<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop class="g1" offset="0%" stop-color="black" />
    <stop class="g2" offset="45%" stop-color="black" />
    <stop class="g3" offset="55%" stop-color="black" />
    <stop class="g4" offset="100%" stop-color="black" />
</linearGradient>`;

const filterAttributes = objectToAttributesString({
    id: 'outline-filter',
    x: '-10%',
    y: '-10%',
    width: '120%',
    height: '120%',
    'color-interpolation-filters': 'sRGB'
});

const outlineFilter
    = `<filter ${filterAttributes}>
    <feMorphology operator="dilate" radius="3" in="SourceAlpha" result="expanded"/>
    <feFlood class="outline" flood-color="white" result="outline-color"/>
    <feComposite operator="in" in="outline-color" in2="expanded" result="outline-full"/>
    <feComposite operator="out" in="outline-full" in2="SourceAlpha" result="outline"/>
    <feComposite operator="over" in="outline" in2="SourceGraphic"/>
</filter>`;

export default class SvgBuilder {
    constructor() {
        this.groupId = 1;
        this.groups = [];
    }

    nextGroup() {
        const group = new LayerGroup(this.groupId++);
        this.groups.push(group);
        return group;
    }

    get defsString() {
        return [
            `<defs>`,
            indent(gradient),
            ...this.groups.map(group => indent(group.defsString)),
            indent(outlineFilter),
            `</defs>`
        ].join('\n');
    }

    get svgAttributes() {
        return objectToAttributesString({
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 100 100',
            class: 'set-icon'
        });
    }

    toString() {
        return [
            `<svg ${this.svgAttributes}>`,
            indent(this.defsString),
            ...this.groups.map(group => indent(group.outputString)),
            '</svg>'
        ].join('\n');
    }
}
