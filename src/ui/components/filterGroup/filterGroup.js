function negate(query) {
    const hasSpace = query.includes(' ');
    const alreadyWrapped = query.startsWith('(') && query.endsWith(')');
    if (hasSpace && !alreadyWrapped) return `-(${query})`;
    return '-' + query;
}

export default class FilterGroup extends ReactiveComponent {
    #model = null;
    selected = [];

    connectedCallback() {
        this.render();
        this.renderOptions();
        this.bind();
    }

    bind() {
        this.handleEvents('click', {
            selectPreset: event => {
                const query = event.target.dataset.query;
                const oldSelected = this.selected.slice();
                if (event.target.hasAttribute('outline')) {
                    const targetVariant = event.target.getAttribute('variant');
                    const queryToRemove = targetVariant === 'danger'
                        ? negate(query)
                        : query;
                    this.selected.remove(queryToRemove);
                    event.target.removeAttribute('outline');
                    event.target.removeAttribute('variant');
                    this.emit('cm-select-preset', oldSelected);
                    return;
                }
                if (!this.model.allowMultiple) {
                    const buttons = this.querySelectorAll('sl-button[data-query]');
                    for (const button of buttons) {
                        button.removeAttribute('outline');
                        button.removeAttribute('variant');
                    }
                    this.selected = [];
                }
                this.selected.push(event.ctrlKey ? negate(query) : query);
                event.target.setAttribute('outline', '');
                const variant = event.ctrlKey ? 'danger' : 'success';
                event.target.setAttribute('variant', variant);
                this.emit('cm-select-preset', oldSelected);
            }
        });
    }

    get optionsContainer() {
        return this.querySelector('.options-container');
    }

    get model() {
        return this.#model;
    }

    set model(value) {
        this.#model = value;
        this.render();
        this.renderOptions();
    }

    get dynamicOptions() {
        return (this.model?.dynamic?.() || []).map(label => ({
            q: `t:${label.toLowerCase()}`,
            label
        }));
    }

    get options() {
        if (!this.model) return [];
        return Array.prototype.concat(
            this.model.options || [],
            this.dynamicOptions.slice(0, this.model?.dynamicCount || 0)
        );
    }

    renderOptions() {
        for (const option of this.options) {
            const btn = document.createElement('sl-button');
            btn.setAttribute('size', 'small');
            btn.setAttribute('pill', '');
            btn.textContent = option.label || option.symbol;
            btn.setAttribute('data-query', option.q);
            btn.setAttribute('data-click-action', 'selectPreset');
            if (option.hint) btn.setAttribute('title', option.hint);
            this.optionsContainer.append(btn);
        }
    }

    render() {
        if (!this.model) return;
        this.innerHTML = (
            `<h2>${this.model.label}</h2>
            <div class="options-container"></div>`
        );
    }
}

customElements.define('cm-filter-group', FilterGroup);
