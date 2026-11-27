import Modal from '../Modal.js';
import { getActiveModal, registerModal } from '../modalManager.js';
import { executeAction } from '../../systems/actionSystem.js';
import * as history from '../../systems/historySystem.js';
import {
    collectTagSuggestions, tagSuggestionChanges
} from '../../../domain/game/tagSuggestions.js';
import '../../components/tagSuggestionTree/TagSuggestionTree.js';

const L = localize('tag-suggestions-modal');
const report = createReporter({ unit: 'TagSuggestionsModal' });

function countAccepted(decisions) {
    let count = 0;
    for (const { accepted } of decisions.values()) count += accepted.length;
    return count;
}

function applyLabel(count) {
    return count === 1 ? L`Add 1 tag` : L`Add ${count} tags`;
}

export default class TagSuggestionsModal extends Modal {
    static id = 'cm-tag-suggestions-modal';
    title = L`Apply tag suggestions`;
    #loadCount = 0;

    get scopeSelect() { return this.querySelector('sl-select'); }
    get tree() { return this.querySelector('cm-tag-suggestion-tree'); }
    get dismissCheckbox() { return this.querySelector('sl-checkbox'); }
    get applyButton() { return this.querySelector('[data-click-action="apply"]'); }
    get progress() { return this.querySelector('[role="status"]'); }
    get progressBar() { return this.progress.querySelector('sl-progress-bar'); }
    get progressMessage() { return this.progress.querySelector('p'); }

    get isLoading() {
        return !this.progress.hidden;
    }

    get onClickHandlers() {
        return {
            ...super.onClickHandlers,
            apply: () => this.apply()
        };
    }

    get cards() {
        return this.scopeSelect.value === 'all'
            ? activeProject.cards
            : executeAction('get-shown-cards');
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadSuggestions();
    }

    bind() {
        super.bind();
        this.on('sl-change', event => {
            if (event.target === this.scopeSelect) this.loadSuggestions();
        });
        this.on('cm-suggestion-selection-change', () => this.updateApplyButton());
    }

    async loadSuggestions() {
        const load = ++this.#loadCount;
        const cards = this.cards;
        this.showProgress(0, cards.length);
        const groups = await collectTagSuggestions(cards, {
            onProgress: (done, total) => this.showProgress(done, total),
            isCancelled: () => load !== this.#loadCount || getActiveModal() !== this
        });
        if (!groups) return;
        this.tree.groups = groups;
        this.hideProgress();
        this.updateApplyButton();
    }

    showProgress(done, total) {
        this.progress.hidden = false;
        this.tree.hidden = true;
        this.applyButton.disabled = true;
        this.applyButton.textContent = L`Apply`;
        this.progressBar.value = total ? (done / total) * 100 : 0;
        this.progressMessage.textContent = L`Reading ${done} of ${total} cards…`;
    }

    hideProgress() {
        this.progress.hidden = true;
        this.tree.hidden = false;
    }

    updateApplyButton() {
        const count = countAccepted(this.tree.decisions);
        this.applyButton.disabled = !count;
        this.applyButton.textContent = applyLabel(count);
    }

    async apply() {
        const dismissDeclined = this.dismissCheckbox.checked;
        const changes = tagSuggestionChanges(this.tree.decisions, { dismissDeclined });
        if (!changes.length || this.applyButton.loading) return;
        this.applyButton.loading = true;
        try {
            const event = new CustomEvent('cm-cards-edited', { detail: { changes } });
            await history.execute(activeProject, event);
            this.close();
        } catch (error) {
            report('apply', error);
            await dialog.alert(L`Could not update the cards.`);
        } finally {
            this.applyButton.loading = false;
        }
    }

    renderScope() {
        const shown = executeAction('get-shown-cards').length;
        const all = activeProject.cards.length;
        return (
            `<sl-select size="small" label="${L`Cards`}" value="shown">
                <sl-option value="shown">
                    ${L`Shown in the card list (${shown})`}
                </sl-option>
                <sl-option value="all">${L`All cards (${all})`}</sl-option>
            </sl-select>`
        );
    }

    renderBody() {
        return (
            `${this.renderScope()}
            <p class="text-muted">
                ${L`Uncheck a tag to skip it, or expand it to skip single cards.`}
            </p>
            <div role="status" hidden>
                <sl-progress-bar></sl-progress-bar>
                <p class="text-muted"></p>
            </div>
            <cm-tag-suggestion-tree hidden></cm-tag-suggestion-tree>
            <sl-checkbox size="small">${L`Dismiss unchecked suggestions`}</sl-checkbox>`
        );
    }

    renderActions() {
        return (
            `<sl-button data-click-action="close">${L`Cancel`}</sl-button>
            <sl-button variant="primary" data-click-action="apply" disabled>
                ${L`Apply`}
            </sl-button>`
        );
    }
}

registerModal(TagSuggestionsModal);
