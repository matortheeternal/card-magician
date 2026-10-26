export default class ErrorItem extends ReactiveComponent {
    #model;

    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {

    }

    get model() {
        return this.#model;
    }

    set model(value) {
        this.#model = value;
    }

    render() {
        this.innerHTML = this.model ? (
            `Not implemented`
        ) : '';
    }
}

customElements.define('cm-error-item', ErrorItem);
