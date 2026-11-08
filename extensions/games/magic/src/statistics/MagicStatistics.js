class MagicStatistics extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="stats-grid">
                <cm-chart report="color-rarity"></cm-chart>
                <cm-chart report="color-type"></cm-chart>
                <cm-chart class="stats-curve" report="mana-curve"></cm-chart>
            </div>`;
    }
}

customElements.define('cm-magic-statistics', MagicStatistics);
