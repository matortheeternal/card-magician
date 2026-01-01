const L = localize('set-view');

export default
`<div class="search-bar" style="display: none">
    <sl-input
        autocomplete="off"
        placeholder="${L`Search for cards`}"
        data-keydown-action="searchInputKeyDown"
    ></sl-input>
    <sl-button data-click-action="openAdvancedSearch">${L`Advanced`}</sl-button>
</div>
<cm-list-view
    add-row-label="${L`Click to add a card or press Ctrl+Enter`}"
></cm-list-view>
<div class="no-content-prompt">
    <div>${L`This set has no cards in it.`}</div>
    <div class="buttons-container">
        <sl-button size="large" data-click-action="addCard">
            ${L`Add a card`}
        </sl-button>
        <sl-button size="large" data-click-action="openSet">
            ${L`Open a set`}
        </sl-button>
    </div>
    <div class="recent-sets-container">
        <div>${L`Recent sets`}</div>
        <div class="buttons-container"></div>
    </div>
</div>`;
