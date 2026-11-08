import { registerChartType } from '../../../../domain/statistics/chartTypes.js';
import { matrixRenderer } from './matrix.js';
import { renderD3Curve } from './series.js';
import { categorySymbol } from '../categoryLabel.js';

registerChartType('matrix', matrixRenderer);
for (const [type, label] of [['line', 'Lines'], ['bar', 'Bars']]) {
    registerChartType(type, {
        label, shape: 'series',
        create(container) {
            return {
                render(data, options) {
                    container.replaceChildren();
                    renderD3Curve(container, {
                        ...data, type, width: options.width,
                        title: options.definition.title,
                        colorSymbol: categorySymbol
                    });
                }
            };
        }
    });
}
