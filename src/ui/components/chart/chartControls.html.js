const L = localize('statistics');

export default () => `
    <div class="stats-block-header">
        <div><h2></h2><p class="stats-description"></p></div>
        <div class="stats-header-controls">
            <div class="stats-switch stats-views" role="group"
                aria-label="${L`Breakdown`}"></div>
            <div class="stats-switch" role="group" aria-label="${L`Chart type`}"></div>
            <label class="stats-measure">${L`Measure`}
                <select data-measure data-change-action="measureChanged"
                    aria-label="${L`Measure`}"></select>
            </label>
        </div>
    </div>
    <div class="stats-curve-controls">
        <div class="stats-legend" role="group"></div>
        <label class="stats-filter"><input type="checkbox" data-filter-toggle
            data-change-action="filterChanged"> <span></span></label>
    </div>`;
