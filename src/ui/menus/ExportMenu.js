import ReactiveMenu from './ReactiveMenu.js';
import { getActiveSet, onActiveSetChanged } from '../../domain/sets/setManager.js';
import { getExporter } from '../../domain/sets/exporterManager.js';
import { watch } from '../../shared/reactivity.js';
import { executeAction } from '../systems/actionSystem.js';
import { openModal } from '../modals/modalManager.js';

const L = localize('title-bar');

export default class ExportMenu extends ReactiveMenu {
    id = 'export';
    title = L`Export`;

    constructor() {
        super();
        this.subscribe();
    }

    subscribe() {
        onActiveSetChanged(activeSet => {
            this.unwatch?.();
            this.unwatch = watch(activeSet, 'export', () => changed(this));
            changed(this);
        });
    }

    get exporterMenuItems() {
        const set = getActiveSet();
        return Object.keys(set.export).map(exporterId => {
            const exporter = getExporter(exporterId);
            return this.menuItem(L`Export ${exporter.label}`, ``, () => {
                executeAction('run-exporter', exporterId);
            });
        });
    }

    get items() {
        return [
            this.menuItem(
                L`Export All`,
                L`Ctrl+Shift+A`,
                () => executeAction('run-exporter', 'all')
            ),
            ...this.exporterMenuItems,
            this.DIVIDER,
            this.menuItem(
                L`Configure Exporters`,
                L`Ctrl+Shift+E`,
                () => {
                    const activeSet = getActiveSet();
                    openModal('cm-configure-exporters-modal', activeSet.export);
                }
            ),
        ];
    }
}
