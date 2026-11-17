const L = localize('under-construction');

export default class UnderConstruction extends ReactiveComponent {
    connectedCallback() {
        this.innerHTML = `<p class="text-muted">${L`Under construction.`}</p>`;
    }
}

customElements.define('cm-under-construction', UnderConstruction);
