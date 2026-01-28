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

    get items() {
        return [
            this.menuItem(
                L`Export All`,
                L`Ctrl+Shift+A`,
                () => executeAction('export-all')
            ),
            Object.keys(getActiveSet().export).map(exporterId => {
                const exporter = getExporter(exporterId);
                return this.menuItem(L`Export ${exporter.label}`, ``, () => {
                    // TODO: export
                });
            }),
            this.DIVIDER,
            this.menuItem(
                L`Configure Exporters`,
                L`Ctrl+Shift+E`,
                () => openModal('cm-configure-exporters')
            ),
        ];
    }
}
