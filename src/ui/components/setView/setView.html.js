const L = localize('set-view');

export default
`<div class="search-bar" style="display: none">
    <sl-input
        autocomplete="off"
        placeholder="${L`Search for cards`}"
        data-keydown-action="searchInputKeyDown"
    ></sl-input>
    <sl-button data-click-action="buildFilter">${L`Build`}</sl-button>
</div>
<cm-list-view
    add-row-label="${L`Click to add a card or press Ctrl+Enter`}"
></cm-list-view>
<div class="status-bar"></div>
<div class="no-content-prompt">
    <h2>${L`This set has no cards in it.`}</h2>
    <div class="buttons-container">
        <sl-button size="large" data-click-action="addCard">
            ${L`Add a card`}
        </sl-button>
        <sl-button size="large" data-click-action="openProject">
            ${L`Open a project`}
        </sl-button>
    </div>
    <div class="recent-projects-container">
        <div>${L`Recent projects`}</div>
        <div class="buttons-container"></div>
    </div>
</div>`;
