import { registerChartType } from '../../../../domain/statistics/chartTypes.js';
import { matrixRenderer } from './matrix.js';
import { renderD3Curve } from './series.js';
import { horizontalBarRenderer } from './horizontalBars.js';

const L = localize('statistics');

function seriesLabel(type) {
    if (type === 'line') return L`Lines`;
    return L`Bars`;
}

registerChartType('matrix', matrixRenderer);
registerChartType('horizontal-bar', horizontalBarRenderer);
for (const type of ['line', 'bar']) {
    registerChartType(type, {
        get label() { return seriesLabel(type); },
        shape: 'series',
        create(container) {
            let dispose;
            return {
                render(data, options) {
                    dispose?.();
                    container.replaceChildren();
                    dispose = renderD3Curve(container, {
                        ...data, type, width: options.width,
                        title: options.definition.title
                    });
                },
                dispose() { dispose?.(); }
            };
        }
    });
}
