const L = localize('card-list');

export default
`<sl-split-panel class="problems-split" vertical disabled position="100">
<div slot="start" class="card-list-region">
<div class="filter-bar" style="display: none">
    <sl-input
        autocomplete="off"
        placeholder="${L`Filter cards`}"
        data-keydown-action="filterInputKeyDown"
        clearable
    ></sl-input>
    <sl-button data-click-action="buildFilter">${L`Build`}</sl-button>
</div>
<cm-list-view
    add-row-label="${L`Click to add a card or press Ctrl+Enter`}"
></cm-list-view>
<div class="status-bar">
    <div class="card-list-status"></div>
    <div class="card-list-selection"></div>
    <sl-tooltip content="${L`Show Problems`}" hoist hidden>
        <sl-icon-button name="exclamation-triangle" label="${L`Show Problems`}"
            data-click-action="toggleProblems" aria-controls="project-problems"
            aria-expanded="false"></sl-icon-button>
    </sl-tooltip>
</div>
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
    <cm-recent-projects></cm-recent-projects>
</div>
</div>
<cm-project-inspections id="project-problems" slot="end" hidden></cm-project-inspections>
</sl-split-panel>`;
