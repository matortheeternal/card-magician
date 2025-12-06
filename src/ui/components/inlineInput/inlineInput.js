export default class InlineInput extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = (
            `<input type="text" />
            <span class="mirror"></span>`
        );

        this.inputElement = this.querySelector('input');
        this.mirrorElement = this.querySelector('span.mirror');

        this.inputElement.addEventListener('input', () => {
            this.value = this.inputElement.value;
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value' && newValue !== this.value)
            this.value = newValue ?? '';
    }

    get value() {
        return this.inputElement?.value;
    }

    set value(val) {
        if (val == null) val = '';
        this.setAttribute('value', val);
        this.inputElement.value = val;
        this.updateWidth();
    }

    connectedCallback() {
        setTimeout(() => this.updateWidth());
    }

    updateWidth() {
        this.mirrorElement.textContent = this.value;
        this.inputElement.style.width = this.mirrorElement.offsetWidth + 'px';
    }
}

customElements.define('cm-inline-input', InlineInput);
