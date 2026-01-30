function collectShadowRoots(htmlElement) {
    return Array.from(htmlElement.querySelectorAll('*'))
        .map(node => node.shadowRoot)
        .filter(Boolean);
}

function bakeStyles(srcNode, targetNode) {
    const sourceStyle = getComputedStyle(srcNode);
    const targetStyle = getComputedStyle(targetNode);
    const styleDeclaration = targetNode.style;

    for (const prop of sourceStyle) {
        const value = sourceStyle.getPropertyValue(prop);
        const defaultValue = targetStyle.getPropertyValue(prop);
        if (value !== defaultValue)
            styleDeclaration.setProperty(prop, value);
    }
}

function getNormalizedTagName(node) {
    if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml')
        return node.tagName;
    if (customElements.get(node.tagName.toLowerCase()))
        return 'div';
    return node.tagName;
}

function bakeSubtreeStyles(source, target) {
    if (source.nodeType !== Node.ELEMENT_NODE) return;

    bakeStyles(source, target);
    const sourceChildNodes = source.childNodes;
    const targetChildNodes = target.childNodes;
    for (let i = 0; i < sourceChildNodes.length; i++)
        bakeSubtreeStyles(sourceChildNodes[i], targetChildNodes[i]);
}

function copyAttributes(source, target) {
    for (const attr of source.attributes) {
        if (attr.name === 'style' || attr.name === 'id') continue;
        target.setAttribute(attr.name, attr.value);
    }
}

const bakingStrategies = [{
    id: 'skip',
    match: sourceNode => sourceNode.tagName === 'STYLE',
    bake: () => {},
}, {
    id: 'shallowClone',
    match: sourceNode => sourceNode.nodeType !== Node.ELEMENT_NODE,
    bake: (sourceNode, target) => {
        target.appendChild(sourceNode.cloneNode(false));
    }
}, {
    id: 'deepClone',
    match: sourceNode => sourceNode.tagName === 'SVG',
    bake: (sourceNode, target) => {
        const targetNode = sourceNode.cloneNode(true);
        target.appendChild(targetNode);
        bakeSubtreeStyles(sourceNode, targetNode);
    }
}, {
    id: 'default',
    match: () => true,
    bake: (sourceNode, target) => {
        const tagName = getNormalizedTagName(sourceNode);
        const targetNode = document.createElement(tagName);
        copyAttributes(sourceNode, targetNode);
        target.appendChild(targetNode);
        bakeStyles(sourceNode, targetNode);
        bakeAndNormalize(sourceNode, targetNode);
    }
}];

function bakeAndNormalize(source, target) {
    Array.from(source.childNodes).forEach(sourceNode => {
        const bakingStrategy = bakingStrategies.find(strategy => {
            return strategy.match(sourceNode);
        });
        bakingStrategy.bake(sourceNode, target);
    });
}

export default function bake(htmlElement) {
    for (const shadowRoot of collectShadowRoots(htmlElement)) {
        const newRoot = document.createElement('div');
        htmlElement.appendChild(newRoot);
        bakeAndNormalize(shadowRoot, newRoot);
        shadowRoot.host.remove();
    }
}
