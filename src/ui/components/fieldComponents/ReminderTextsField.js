import FieldComponent from './FieldComponent.js';
import { emit, esc } from '../../../shared/htmlUtils.js';
import { registerField } from '../../systems/fieldComponentRegistry.js';
import { beforeExit } from '../../../lifecycle.js';
import {
    rewriteMechanicReminders
} from '../../../domain/projects/rewriteMechanicReminders.js';

const L = localize('reminder-texts-field');
const types = {
    static: L`Static`, granted: L`Granted`, anthem: L`Anthem`, other: L`Other`
};

export default class ReminderTextsField extends FieldComponent {
    static tagName = 'cm-reminder-texts';
    eventKey = 'cm-reminders-change';
    #committing = false;

    static matches(field) { return field.type === 'reminder-texts'; }

    get list() { return this.querySelector('.reminder-rows'); }
    get dialog() { return this.querySelector('sl-dialog'); }
    get operation() { return this.dialog.querySelector('sl-select'); }
    get replaceButtons() {
        return this.list.querySelectorAll('[data-click-action="replaceReminder"]');
    }
    get applyButton() { return this.dialog.querySelector('[data-click-action="apply"]'); }

    bind() {
        super.bind();
        this.handleEvents('click', {
            add: () => this.add(),
            editReminder: event => this.edit(event.target.closest('.reminder-row')),
            removeReminder: event => this.remove(event.target.closest('.reminder-row')),
            replaceReminder: event => this.replace(event.target.closest('.reminder-row')),
            cancel: () => this.dialog.hide(),
            apply: () => this.applyRemoval()
        });
        this.on('sl-change', event => {
            if (this.list.contains(event.target)) this.commit();
        });
    }

    getChangedValue(event) { return event.detail; }

    async promptText(title, defaultValue = '') {
        const text = await dialog.prompt(L`Reminder text`, { title, defaultValue });
        return text?.trim() ?? '';
    }

    async add() {
        const text = await this.promptText(L`Add reminder`);
        if (!text) return;
        this.addRow({ text });
        this.commit();
    }

    async edit(row) {
        const current = this.rowText(row);
        const text = await this.promptText(L`Edit reminder`, current);
        if (!text || text === current) return;
        this.reminderText(row).textContent = text;
        this.commit();
    }

    async onChange(event) {
        this.#committing = true;
        try {
            await super.onChange(event);
        } finally {
            this.#committing = false;
        }
    }

    render() {
        this.innerHTML = `
            <fieldset>
                <legend>${this.field.label}</legend>
                <div class="field-box">
                    <div class="reminder-rows"></div>
                    <sl-button class="add-btn" size="small" variant="success" outline
                               data-click-action="add">
                        <sl-icon slot="prefix" name="plus-lg"></sl-icon>
                        ${L`Add reminder`}
                    </sl-button>
                </div>
            </fieldset>
            <sl-dialog label="${esc(L`Remove reminder`)}">
                <sl-select hoist></sl-select>
                <sl-button slot="footer" data-click-action="cancel">
                    ${L`Cancel`}
                </sl-button>
                <sl-button slot="footer" variant="danger" data-click-action="apply">
                    ${L`Remove reminder`}
                </sl-button>
            </sl-dialog>`;
        this.loadValue();
    }

    loadValue() {
        if (this.#committing) return;
        this.list.replaceChildren();
        for (const entry of this.value ?? []) this.addRow(entry);
        this.updateReplaceButtons();
    }

    addRow({ text, type = 'other' }) {
        const row = document.createElement('div');
        row.className = 'reminder-row';
        row.innerHTML = `
            <p></p>
            <sl-select size="small" label="${esc(L`Type`)}"></sl-select>
            <div class="reminder-actions">
                <sl-tooltip content="${esc(L`Edit reminder`)}">
                    <sl-icon-button name="pencil" label="${esc(L`Edit reminder`)}"
                                    data-click-action="editReminder">
                    </sl-icon-button>
                </sl-tooltip>
                <sl-tooltip content="${esc(L`Replace reminder`)}">
                    <sl-icon-button name="arrow-left-right"
                                    label="${esc(L`Replace reminder`)}"
                                    data-click-action="replaceReminder" disabled>
                    </sl-icon-button>
                </sl-tooltip>
                <sl-tooltip content="${esc(L`Remove reminder`)}">
                    <sl-icon-button name="trash3" label="${esc(L`Remove reminder`)}"
                                    data-click-action="removeReminder">
                    </sl-icon-button>
                </sl-tooltip>
            </div>`;
        const select = row.querySelector('sl-select');
        for (const [id, label] of Object.entries(types))
            this.addOption(select, id, label);
        select.value = type;
        this.reminderText(row).textContent = text;
        this.list.append(row);
        return row;
    }

    addOption(select, value, label) {
        const option = document.createElement('sl-option');
        option.value = value;
        option.textContent = label;
        select.append(option);
    }

    commit() {
        const values = [...this.list.children].map(row => ({
            text: this.rowText(row),
            type: row.querySelector('sl-select').value
        }));
        this.updateReplaceButtons();
        emit(this, this.eventKey, values);
    }

    reminderText(row) {
        return row.querySelector(':scope > p');
    }

    rowText(row) {
        return this.reminderText(row).textContent;
    }

    replacementsFor(row) {
        const text = this.rowText(row);
        const values = [...this.list.children].map(item => this.rowText(item));
        return [...new Set(values)].filter(value => value !== text);
    }

    updateReplaceButtons() {
        for (const button of this.replaceButtons) {
            const row = button.closest('.reminder-row');
            button.disabled = !this.replacementsFor(row).length;
        }
    }

    remove(row) {
        const text = this.rowText(row);
        if (!this.model.name.trim()) return this.finishRemoval(row);
        this.prepareDialog(row, text, 'remove');
        this.addOption(this.operation, 'keep', L`Leave card text as written`);
        this.addOption(this.operation, 'delete', L`Delete matching reminders from cards`);
        this.operation.value = 'keep';
        this.dialog.show();
    }

    replace(row) {
        const alternatives = this.replacementsFor(row);
        if (!alternatives.length) return;
        this.prepareDialog(row, this.rowText(row), 'replace', alternatives);
        alternatives.forEach((text, index) =>
            this.addOption(this.operation, String(index), text));
        this.operation.value = '0';
        this.dialog.show();
    }

    prepareDialog(row, text, mode, alternatives = []) {
        this.pendingRemoval = { row, text, mode, alternatives };
        const replacing = mode === 'replace';
        const label = replacing ? L`Replace reminder` : L`Remove reminder`;
        this.dialog.label = label;
        this.applyButton.textContent = label;
        this.applyButton.variant = replacing ? 'primary' : 'danger';
        this.operation.label = replacing ? L`Replacement reminder`
            : L`Matching reminder text on cards`;
        this.operation.replaceChildren();
    }

    finishRemoval(row) {
        row.remove();
        this.commit();
    }

    async applyRemoval() {
        if (!this.pendingRemoval || this.applyButton.loading) return;
        const { row, text, mode, alternatives } = this.pendingRemoval;
        const choice = this.operation.value;
        const replacement = alternatives[choice];
        const valid = mode === 'replace' ? Boolean(replacement)
            : ['keep', 'delete'].includes(choice);
        if (!valid) return;
        this.applyButton.loading = true;
        const pending = this.rewriteAndRemove(row, text, choice, replacement);
        const unregister = beforeExit(() => pending, () => true);
        try {
            await pending;
        } catch (error) {
            createReporter({ unit: 'ReminderTextsField' })('rewrite', error);
            await dialog.alert(L`Could not update the matching cards.`);
        } finally {
            unregister();
            this.applyButton.loading = false;
        }
    }

    async rewriteAndRemove(row, text, choice, replacement) {
        const complete = choice === 'keep' || await rewriteMechanicReminders(
            window.activeProject, this.model.name.trim(), text, replacement
        );
        if (!complete || !this.isConnected) return;
        this.finishRemoval(row);
        await this.dialog.hide();
    }
}

registerField(ReminderTextsField);
