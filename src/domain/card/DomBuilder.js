export default class DOMBuilder {
    root = document.createElement('div');
    style = document.createElement('style');
    styles = [];

    setHTML(html) {
        this.root.innerHTML = html;
        this.root.prepend(this.style);
    }

    addCSS(css) {
        this.styles.push(css);
        this.style.innerHTML = this.styles.join('\n\n');
    }
}
