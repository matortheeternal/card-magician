import {
    autodetectMechanics, entriesFor, mechanicFields, mechanicReminders,
    withMechanicReminders
} from '../../domain/projectMechanics.js';
import './mechanicSettings.css';

const L = localize('game-magic');
const kinds = { keywords: L`Keyword ability`, actions: L`Keyword action` };
const arrowDirections = { ArrowDown: 1, ArrowUp: -1 };

export default class MechanicSettings extends CardMagicianSettings {
    static id = 'cm-mechanic-settings';
    static parentId = 'cm-project-settings';
    static label = L`Custom Mechanics`;
    static groupWeight = 704;
    #selected = null;
    #updatingRows = false;
    model = { draft: { name: '', kind: 'keywords', reminders: [] } };

    static hide() { return !window.activeProject; }

    static search(query) {
        const fields = [{ label: this.label }, { label: L`Keyword ability` }];
        return fields.filter(field => this.fieldMatches(field, query));
    }

    get project() { return window.activeProject; }
    get fields() {
        const colors = { W: L`White`, U: L`Blue`, B: L`Black`, R: L`Red`, G: L`Green` };
        return [
            { id: 'name', label: L`Name`, eventKey: 'sl-change' },
            { id: 'kind', label: L`Mechanic type`, type: 'select',
                options: Object.entries(kinds).map(([id, name]) => ({ id, name })) },
            { id: 'tiers', label: L`Color affinity`, type: 'color-affinity',
                options: Object.entries(colors).map(([id, name]) => ({
                    id, name,
                    icon: activeGame.symbols.resolveColorSymbolIcon(id.toLowerCase())
                })) },
            { id: 'reminders', label: L`Reminder texts`, type: 'reminder-texts' }
        ];
    }
    get list() { return this.querySelector('cm-list-view'); }
    get nameInput() { return this.querySelector('form-field[field-id="name"] sl-input'); }
    get removeButton() { return this.querySelector('[data-click-action="remove"]'); }
    get status() { return this.querySelector('[role="status"]'); }

    bind() {
        this.handleEvents('click', {
            scan: () => this.scan(),
            newMechanic: () => this.newMechanic(),
            remove: () => this.remove()
        });
        this.on('cm-field-changed', () => this.autosave());
        this.on('row-selected', event => {
            if (!this.#updatingRows) this.selectEntry(event.detail.row?.original);
        });
        this.list.addEventListener('keydown', event => {
            const offset = arrowDirections[event.key];
            if (!offset) return;
            event.preventDefault();
            this.list.moveSelection(offset);
        });
    }

    async newMechanic() {
        this.selectEntry(null);
        const input = this.nameInput;
        await input.updateComplete;
        input.focus();
    }

    scan() {
        const entries = entriesFor(this.project);
        const editor = window.activeEditorCard;
        const merged = autodetectMechanics(this.project, editor, entries);
        const updated = merged.filter(entry => !entries.includes(entry));
        if (!updated.length) {
            this.status.textContent = L`No new mechanics, reminders, or affinity found.`;
            return;
        }
        this.persist(merged);
        this.refreshList(this.#selected ?? updated[0]);
        this.status.textContent = L`Updated ${updated.length} mechanics.`;
    }

    refreshList(preferred, renderDraft = true) {
        this.#updatingRows = true;
        this.list.rows = entriesFor(this.project);
        this.#updatingRows = false;
        const current = this.list.rows.find(entry =>
            entry.kind === preferred?.kind
            && entry.definition.name === preferred.definition.name);
        this.selectEntry(current ?? this.list.activeRows[0]?.original, renderDraft);
    }

    selectEntry(entry, renderDraft = true) {
        this.#selected = entry ?? null;
        const index = this.list.activeRows.findIndex(row => row.original === entry);
        this.list.selection = index < 0 ? [] : [index];
        if (renderDraft) this.renderDraft(entry);
    }

    renderDraft(entry) {
        const definition = entry?.definition ?? {};
        this.model.draft = {
            name: definition.name ?? '',
            kind: entry?.kind ?? 'keywords',
            reminders: mechanicReminders(definition).map(text => ({
                text,
                type: Object.hasOwn(definition.reminderTypes ?? {}, text)
                    ? definition.reminderTypes[text] : 'other'
            })),
            tiers: definition.tiers
        };
        changed(this.model, 'draft');
        this.removeButton.hidden = !entry;
    }

    autosave() {
        const draft = this.model.draft;
        const name = draft.name.trim();
        if (!name) return;
        const old = this.#selected;
        const entries = entriesFor(this.project);
        const duplicate = entries.some(({ definition }) => definition !== old?.definition
            && definition.name.toLowerCase() === name.toLowerCase());
        if (duplicate) {
            const message = L`A mechanic with this name is already configured.`;
            this.nameInput.setCustomValidity(message);
            this.nameInput.reportValidity();
            return;
        }
        this.nameInput.setCustomValidity('');
        const { kind } = draft;
        const metadata = old?.kind === kind ? old.definition : {};
        const reminders = [...new Set(draft.reminders.map(entry => entry.text))];
        const definition = withMechanicReminders({ ...metadata, name }, reminders);
        const types = draft.reminders.filter(entry => entry.type !== 'other');
        definition.reminderTypes = Object.fromEntries(types.map(({ text, type }) =>
            [text, type]));
        if (!types.length) delete definition.reminderTypes;
        if (draft.tiers !== undefined) definition.tiers = draft.tiers;
        const entry = { kind, definition };
        const updated = old
            ? entries.map(item => item.definition === old.definition ? entry : item)
            : [...entries, entry];
        this.persist(updated);
        this.updateSavedEntry(old, entry);
    }

    updateSavedEntry(old, entry) {
        if (old?.kind === entry.kind && old.definition.name === entry.definition.name) {
            old.definition = entry.definition;
            return;
        }
        this.refreshList(entry, false);
        this.removeButton.hidden = false;
    }

    async remove() {
        const selected = this.#selected;
        const project = this.project;
        if (!selected) return;
        const { name } = selected.definition;
        if (!await dialog.confirm(L`Remove mechanic ${name}?`)) return;
        if (project !== this.project) return;
        const entries = entriesFor(project)
            .filter(entry => entry.definition !== selected.definition);
        this.persist(entries);
        this.refreshList();
    }

    persist(entries) {
        for (const [kind, key] of Object.entries(mechanicFields)) {
            this.project[key] = entries.filter(entry => entry.kind === kind)
                .map(entry => entry.definition);
        }
        changed(this.project, Object.values(mechanicFields));
        this.emit('project-changed');
    }

    render() {
        const hint = L`Configure custom mechanics in this set.`;
        this.innerHTML = `
            <header class="mechanic-toolbar">
                <div class="mechanic-toolbar-copy">
                    <p class="text-muted">${hint}</p>
                    <small role="status"></small>
                </div>
                <sl-button data-click-action="scan">${L`Autodetect`}</sl-button>
                <sl-button data-click-action="newMechanic" variant="primary">
                    ${L`Add mechanic`}
                </sl-button>
            </header>
            <div class="mechanics-layout">
                <div class="mechanic-list">
                    <cm-list-view tabindex="0" aria-label="${L`Mechanics`}">
                    </cm-list-view>
                </div>
                <div class="mechanic-editor">
                    <div class="mechanic-form">
                        <form-field model-key="draft" field-id="name"></form-field>
                        <form-field model-key="draft" field-id="kind"></form-field>
                        <form-field model-key="draft" field-id="tiers"></form-field>
                        <form-field model-key="draft" field-id="reminders"></form-field>
                        <div>
                            <sl-button data-click-action="remove" variant="danger"
                                       outline>
                                ${L`Delete mechanic`}
                            </sl-button>
                        </div>
                    </div>
                </div>
            </div>`;
        this.list.columns = [
            { id: 'name', label: L`Name`, data: entry => entry.definition.name },
            { id: 'type', label: L`Type`, data: entry => kinds[entry.kind] }
        ];
        this.refreshList();
    }
}
