import LayerGroup from './LayerGroup.js';
import { indent, objectToAttributesString } from './svgText.js';

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
    <feFlood flood-color="white" result="outline-color"/>
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
            ...this.groups.map(group => indent(group.defsString)),
            indent(outlineFilter),
            `</defs>`
        ].join('\n');
    }

    get svgAttributes() {
        return objectToAttributesString({
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 100 100'
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
