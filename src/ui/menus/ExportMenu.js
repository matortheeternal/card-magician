import ReactiveMenu from './ReactiveMenu.js';
import { onActiveProjectChanged } from '../../domain/projects/projectManager.js';
import { getExporter, hasExporter } from '../../domain/export/exporterManager.js';
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
        onActiveProjectChanged(project => {
            this.unwatch?.();
            this.unwatch = watch(project, 'export', () => changed(this));
            changed(this);
        });
    }

    get exporterMenuItems() {
        return Object.keys(activeProject.export)
            .filter(hasExporter)
            .map(exporterId => {
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
                    openModal('cm-settings-modal', 'cm-configure-exporters');
                }
            ),
        ];
    }
}
