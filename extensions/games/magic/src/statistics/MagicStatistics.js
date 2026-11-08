class MagicStatistics extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="stats-grid">
                <cm-chart report="color-rarity"></cm-chart>
                <cm-chart report="color-type"></cm-chart>
                <cm-chart class="stats-curve" report="mana-curve"></cm-chart>
                <cm-chart class="stats-curve" report="common-creature-curve"></cm-chart>
                <cm-chart class="stats-curve" report="creature-types"
                    style="--chart-matrix-max-height: 420px;
                        --chart-scroll-padding: var(--sl-spacing-small)">
                </cm-chart>
                <cm-chart class="stats-curve" report="rules-text-length"></cm-chart>
                <cm-chart report="rules-text-by-color"></cm-chart>
                <cm-chart report="wordiest-cards"></cm-chart>
            </div>`;
    }
}

customElements.define('cm-magic-statistics', MagicStatistics);
