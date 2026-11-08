import { NODE_MORPHS } from './nodeMorphs.js';

let mutatedElements = null;

function markMutated(el) {
    if (el && el.nodeType === 1)
        mutatedElements.add(el);
}

function morphAttributes(oldEl, newEl) {
    for (const { name, value } of newEl.attributes) {
        if (oldEl.getAttribute(name) !== value) {
            oldEl.setAttribute(name, value);
            markMutated(oldEl);
        }
    }

    for (const { name } of Array.from(oldEl.attributes)) {
        if (!newEl.hasAttribute(name)) {
            oldEl.removeAttribute(name);
            markMutated(oldEl);
        }
    }
}

function morphElement(oldNode, newNode) {
    morphAttributes(oldNode, newNode);
    morphChildren(oldNode, newNode);
}

function morphNode(parent, oldNode, newNode) {
    const Strategy = NODE_MORPHS.find(strategy => strategy.matches(oldNode, newNode));
    if (!Strategy) return;
    new Strategy({ parent, oldNode, newNode, markMutated, morphElement }).apply();
}

function morphChildren(oldParent, newParent) {
    const oldNodes = Array.from(oldParent.childNodes);
    const newNodes = Array.from(newParent.childNodes);
    const max = Math.max(oldNodes.length, newNodes.length);

    for (let i = 0; i < max; i++)
        morphNode(oldParent, oldNodes[i], newNodes[i]);
}

export function morphHTML(container, htmlString) {
    if (!htmlString) {
        container.textContent = '';
        return;
    }

    const newContainer = document.createElement('template');
    newContainer.innerHTML = htmlString;
    mutatedElements = new Set();

    morphChildren(container, newContainer.content);
    for (const el of mutatedElements)
        el.dispatchEvent(new CustomEvent('dom-morphed', { bubbles: false }));

    mutatedElements = null;
}
