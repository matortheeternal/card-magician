class MagicStatistics extends HTMLElement {
    connectedCallback() {
        this.innerHTML = (
            `<div class="stats-grid">
                <cm-chart report="color-rarity"></cm-chart>
                <cm-chart report="color-type"></cm-chart>
                <cm-chart report="color-count"></cm-chart>
                <cm-chart report="creature-shape"></cm-chart>
                <cm-chart class="stats-curve" report="mana-curve"></cm-chart>
                <cm-chart class="stats-curve" report="common-creature-curve"></cm-chart>
                <cm-chart class="stats-curve" report="creature-types"></cm-chart>
                <cm-chart class="stats-curve" report="non-creature-subtypes"></cm-chart>
                <cm-chart report="legendary-permanents"></cm-chart>
                <cm-chart report="missing-art-credit"></cm-chart>
                <cm-chart class="stats-curve" report="rules-text-length"></cm-chart>
                <cm-chart report="rules-text-by-color"></cm-chart>
                <cm-chart report="wordiest-cards"></cm-chart>
            </div>`
        );
    }
}

customElements.define('cm-magic-statistics', MagicStatistics);
