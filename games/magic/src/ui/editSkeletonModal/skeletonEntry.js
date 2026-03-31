const L = localize('skeleton-entry');

export default class SkeletonEntry extends window.ReactiveComponent {
    connectedCallback() {
        this.setAttribute('data-form-provider', '');
        this.render();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            onRemoveClick: () => this.onRemoveClick()
        });
    }

    get fields() {
        return this._fields ??= [
            {
                id: 'count',
                hint: L`Count`,
                type: 'number',
                min: '1',
                default: 1
            },
            { id: 'type', placeholder: L`Type` },
            { id: 'tags', placeholder: L`Tags` }
        ];
    }

    async render() {
        this.innerHTML = (
            `<form-field field-id="count"></form-field>
            <form-field field-id="type"></form-field>
            <form-field field-id="tags"></form-field>
            <sl-tooltip content="${L`Remove entry`}">
                <sl-icon-button
                    class="remove-entry-btn"
                    name="x-lg"
                    data-click-action="onRemoveClick"></sl-icon-button>
            </sl-tooltip>`
        );
    }

    onRemoveClick() {
        const event = new CustomEvent('entry-removed', {
            bubbles: true,
            composed: true,
            cancelable: false
        });
        this.dispatchEvent(event);
    }
}

customElements.define('cm-skeleton-entry', SkeletonEntry);
