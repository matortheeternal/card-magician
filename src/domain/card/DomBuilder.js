export default class DOMBuilder {
    root = document.createElement('div');
    style = document.createElement('style');
    styles = [];
    stylesheets = [];

    setHTML(html) {
        this.root.setAttribute('spellcheck', 'false');
        this.root.innerHTML = html;
        this.root.prepend(this.style);
    }

    addCSS(css) {
        this.styles.push(css);
        this.style.innerHTML = this.styles.join('\n\n');
    }

    addStylesheets(stylesheets) {
        for (const stylesheet of stylesheets) {
            if (this.stylesheets.includes(stylesheet)) continue;
            this.stylesheets.push(stylesheet);
        }
        this.adoptStylesheets();
    }

    adoptStylesheets() {
        const shadowRoot = this.root.getRootNode();
        if (!(shadowRoot instanceof ShadowRoot)) return;
        shadowRoot.adoptedStyleSheets = this.stylesheets;
    }
}
