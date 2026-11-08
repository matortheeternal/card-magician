function isElement(node) { return node?.nodeType === Node.ELEMENT_NODE; }

class NodeMorph {
    constructor(context) {
        this.parent = context.parent;
        this.oldNode = context.oldNode;
        this.newNode = context.newNode;
        this.markMutated = context.markMutated;
        this.morphElement = context.morphElement;
    }
}

class InsertNodeMorph extends NodeMorph {
    static matches(oldNode, newNode) { return !oldNode && Boolean(newNode); }

    apply() {
        this.parent.appendChild(this.newNode.cloneNode(true));
        this.markMutated(this.parent);
    }
}

class RemoveNodeMorph extends NodeMorph {
    static matches(oldNode, newNode) { return Boolean(oldNode) && !newNode; }

    apply() {
        this.parent.removeChild(this.oldNode);
        this.markMutated(this.parent);
    }
}

class ReplaceNodeMorph extends NodeMorph {
    static matches(oldNode, newNode) {
        if (oldNode.nodeType !== newNode.nodeType) return true;
        return isElement(oldNode) && oldNode.tagName !== newNode.tagName;
    }

    apply() {
        this.parent.replaceChild(this.newNode.cloneNode(true), this.oldNode);
        this.markMutated(this.parent);
    }
}

class TextNodeMorph extends NodeMorph {
    static matches(oldNode) { return oldNode.nodeType === Node.TEXT_NODE; }

    apply() {
        if (this.oldNode.textContent === this.newNode.textContent) return;
        this.oldNode.textContent = this.newNode.textContent;
        this.markMutated(this.oldNode);
    }
}

class ElementNodeMorph extends NodeMorph {
    static matches(oldNode) { return isElement(oldNode); }

    apply() { this.morphElement(this.oldNode, this.newNode); }
}

export const NODE_MORPHS = [
    InsertNodeMorph, RemoveNodeMorph, ReplaceNodeMorph, TextNodeMorph, ElementNodeMorph
];
