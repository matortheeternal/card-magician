import ReactiveComponent from '../ReactiveComponent.js';
import { onActiveProjectChanged } from '../../../domain/projects/projectManager.js';
import { COLORS, RARITIES, CARD_TYPES, cardRecord, aggregateStatistics } from './statisticsData.js';
import { renderD3Curve } from './d3Curve.js';
import { getExtensionDirectory } from '../../../shared/extensionManager.js';

const L = localize('project-statistics');

export default class ProjectStats extends ReactiveComponent {
    chartType = 'line';
    hiddenColors = new Set();
    includeLands = false;
    records = [];

    connectedCallback() {
        this.render();
        this.on('click', event => {
            const type = event.target.closest('[data-chart-type]');
            const color = event.target.closest('[data-color]');
            if (type) this.chartType = type.dataset.chartType;
            if (color) {
                const id = color.dataset.color;
                if (this.hiddenColors.has(id)) this.hiddenColors.delete(id);
                else this.hiddenColors.add(id);
            }
            if (type || color) this.update();
        });
        this.on('change', event => {
            if (!event.target.matches('[data-include-lands]')) return;
            this.includeLands = event.target.checked;
            this.update();
        });
        if (!this.projectSubscription) {
            onActiveProjectChanged(project => {
                if (this.isConnected) this.observeProject(project);
            });
            this.projectSubscription = true;
        } else {
            this.observeProject(window.activeProject);
        }
        this.resizeObserver = new ResizeObserver(entries => {
            const width = entries[0].contentRect.width;
            if (width === this.chartWidth) return;
            this.chartWidth = width;
            this.scheduleChart();
        });
        this.resizeObserver.observe(this.querySelector('.stats-chart'));
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.resizeObserver?.disconnect();
        cancelAnimationFrame(this.chartFrame);
    }

    observeProject(project) {
        if (!project) return;
        const refresh = () => {
            this.records = (project.cards || []).map(
                card => cardRecord(card, activeGame)
            );
            this.update();
        };
        this.watch('project-cards', project, 'cards', refresh);
        refresh();
    }

    render() {
        this.innerHTML = `
            <header class="stats-header">
                <div><h1>${L`Project statistics`}</h1><p class="stats-summary"></p></div>
            </header>
            <p class="stats-empty" hidden>
                ${L`Add cards or open a project to see statistics.`}
            </p>
            <div class="stats-grid">
                <section class="stats-block">
                    <h2>${L`Color × rarity`}</h2>
                    <div class="stats-matrix" data-matrix="rarity"></div>
                    </section>
                <section class="stats-block">
                    <h2>${L`Color × card type`}</h2>
                    <div class="stats-matrix" data-matrix="type"></div>
                </section>
                <section class="stats-block stats-curve">
                    <div class="stats-block-header">
                        <div>
                            <h2>${L`Mana curve by color`}</h2>
                            <p class="stats-curve-summary"></p>
                        </div>
                        <div class="stats-switch" role="group" aria-label="Chart type">
                            <button type="button" data-chart-type="line">
                                ${L`Lines`}
                            </button>
                            <button type="button" data-chart-type="bar">
                                ${L`Bars`}
                            </button>
                        </div>
                    </div>
                    <div class="stats-curve-controls">
                        <div class="stats-legend"
                            role="group"
                            aria-label="Visible colors"></div>
                        <label>
                            <input type="checkbox" data-include-lands>
                            ${L`Include lands`}
                        </label>
                    </div>
                    <div class="stats-chart"></div>
                    <details class="stats-data">
                        <summary>${L`View chart data`}</summary>
                        <div class="stats-curve-table stats-matrix"></div>
                    </details>
                </section>
            </div>`;
        const legend = this.querySelector('.stats-legend');
        for (const color of COLORS) {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.color = color.id;
            button.style.setProperty('--series-color', color.color);
            button.setAttribute('aria-label', color.label);
            button.appendChild(this.colorSymbol(color));
            const tooltip = document.createElement('sl-tooltip');
            tooltip.content = color.label;
            tooltip.appendChild(button);
            legend.appendChild(tooltip);
        }
    }

    colorSymbol(color) {
        const image = document.createElement('img');
        image.src = color.id === 'm'
            ? '/' + activeGame.resolveAsset('multicolor.svg')
            : getExtensionDirectory().url(
                `cardparts/magic/M15/Symbols/assets/flat/single/${color.id}.png`
            );
        image.alt = '';
        image.className = 'stats-color-symbol';
        return image;
    }

    update() {
        this.data = aggregateStatistics(
            this.records, { includeLands: this.includeLands }
        );
        this.querySelector('.stats-summary').textContent = `${this.data.total} cards`;
        this.querySelector('.stats-empty').hidden = this.data.total > 0;
        for (const button of this.querySelectorAll('[data-chart-type]')) {
            button.setAttribute(
                'aria-pressed',
                String(button.dataset.chartType === this.chartType)
            );
        }
        for (const button of this.querySelectorAll('[data-color]')) {
            button.setAttribute(
                'aria-pressed',
                String(!this.hiddenColors.has(button.dataset.color))
            );
        }
        this.renderMatrix('rarity', RARITIES, this.data.rarity);
        this.renderMatrix('type', CARD_TYPES, this.data.type);
        this.scheduleChart();
    }

    renderMatrix(name, columns, counts) {
        const container = this.querySelector(`[data-matrix="${name}"]`);
        const totals = columns.map(
            (_, column) => counts.reduce((sum, row) => sum + row[column], 0)
        );
        const table = this.createTable(
            columns, counts, this.data.totals, totals, this.data.total
        );
        table.setAttribute(
            'aria-label',
            `Card counts by color and ${name === 'rarity' ? 'rarity' : 'card type'}`
        );
        container.replaceChildren(table);
    }

    createTable(columns, counts, rowTotals, columnTotals, total) {
        const table = document.createElement('table');
        const head = table.createTHead().insertRow();
        for (const label of ['Color', ...columns, ...(rowTotals ? ['Cards'] : [])]) {
            const cell = document.createElement('th');
            cell.scope = 'col';
            cell.textContent = label.charAt(0).toUpperCase() + label.slice(1);
            head.appendChild(cell);
        }
        const body = table.createTBody();
        const max = Math.max(1, ...counts.filter(Boolean).flat());
        COLORS.forEach((color, i) => {
            if (counts[i] === null) return;
            const row = body.insertRow();
            const heading = document.createElement('th');
            heading.scope = 'row';
            heading.style.setProperty('--series-color', color.color);
            heading.setAttribute('aria-label', color.label);
            const tooltip = document.createElement('sl-tooltip');
            tooltip.content = color.label;
            const symbol = this.colorSymbol(color);
            symbol.tabIndex = 0;
            symbol.setAttribute('role', 'img');
            symbol.setAttribute('aria-label', color.label);
            tooltip.appendChild(symbol);
            heading.appendChild(tooltip);
            row.appendChild(heading);
            counts[i].forEach(value => {
                const cell = row.insertCell();
                cell.textContent = value;
                cell.style.setProperty(
                    '--cell-strength',
                    String(0.04 + 0.24 * value / max)
                );
            });
            if (rowTotals) row.insertCell().textContent = rowTotals[i];
        });
        if (columnTotals) {
            const row = table.createTFoot().insertRow();
            const heading = document.createElement('th');
            heading.scope = 'row';
            heading.textContent = 'Total';
            row.appendChild(heading);
            for (const value of [...columnTotals, total])
                row.insertCell().textContent = value;
        }
        return table;
    }

    scheduleChart() {
        cancelAnimationFrame(this.chartFrame);
        this.chartFrame = requestAnimationFrame(() => this.renderChart());
    }

    renderChart() {
        const container = this.querySelector('.stats-chart');
        if (!container || !this.data || container.clientWidth === 0) return;
        container.replaceChildren();
        const series = this.data.series.filter(color => !this.hiddenColors.has(color.id));
        const rows = this.data.series.map(
            color => this.hiddenColors.has(color.id) ? null : color.values
        );
        this.querySelector('.stats-curve-table').replaceChildren(
            this.createTable(this.data.labels, rows)
        );
        if (!series.length || !this.data.curveTotal) {
            const message = document.createElement('p');
            message.className = 'stats-chart-empty';
            message.textContent = !series.length
                ? 'Select a color to show its curve.'
                : 'No cards to plot in this scope.';
            container.appendChild(message);
            return;
        }
        renderD3Curve(container, {
            labels: this.data.labels, series, type: this.chartType,
            width: Math.max(360, container.clientWidth),
            colorSymbol: color => this.colorSymbol(color)
        });
    }
}

customElements.define('cm-project-stats', ProjectStats);
