import { registerChartType } from '../../../../domain/statistics/chartTypes.js';
import { matrixRenderer } from './matrix.js';
import { renderD3Curve } from './series.js';
import { horizontalBarRenderer } from './horizontalBars.js';

registerChartType('matrix', matrixRenderer);
registerChartType('horizontal-bar', horizontalBarRenderer);
for (const [type, label] of [['line', 'Lines'], ['bar', 'Bars']]) {
    registerChartType(type, {
        label, shape: 'series',
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
