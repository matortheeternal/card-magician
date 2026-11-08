const L = localize('statistics');

export default () => `
    <section class="stats-block">
        <cm-chart-controls></cm-chart-controls>
        <div class="stats-render"></div>
        <details class="stats-data"><summary>${L`View chart data`}</summary>
            <div class="stats-curve-table stats-matrix"></div>
        </details>
        <p class="stats-chart-error" role="alert" hidden></p>
    </section>`;
