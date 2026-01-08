import { defineRtComponents } from '../reminderTextItem.js';
import html from './editKeywordsModal.html';
import css from './editKeywordsModal.css';

const L = localize('game-magic');

export default class EditKeywordsModal extends Modal {
    static id = 'cm-edit-keywords-modal';
    title = L`Edit Keywords`;
    edited = false;
    css = css;

    get onClickHandlers() {
        return ({
            ...super.onClickHandlers,
            addRt: this.addRt,
            removeRt: this.removeRt
        });
    }

    async connectedCallback() {
        super.connectedCallback();
    }

    addRt() {
        this.edited = true;
        this.data.keyword.reminderTexts.push({template: ''});
        this.renderReminderTextItems();
    }

    removeRt(event) {
        const targetItem = event.target.closest('cm-reminder-text-item');
        const index = targetItem.dataset.index;
        this.data.keyword.reminderTexts.splice(index, 1);
        this.edited = true;
        this.renderReminderTextItems();
    }

    saveKeyword() {
        if (!this.edited) return;
        if (!this.data.keyword.isCustom) 
            this.data.set.keywordOverrides[this.data.keyword.label] = this.data.keyword;
        else
            this.data.set.userKeywords[this.data.keyword.saveIndex] = this.data.keyword;
        
        this.closest('cm-view-keywords-modal').render();
    }

    close() {
        this.saveKeyword();
        super.close();
    }

    bind() {
        super.bind();
        this.on('cm-field-changed', () => this.edited = true);
    }

    get fields() {
        return [{
            id: 'label',
            label: L`Label`
        }, {
            id: 'expression',
            label: L`Expression`
        }];
    }

    get model() {
        return this.data.keyword;
    }

    renderBody() {
        return html;
    }

    render() {
        super.render();
        this.renderReminderTextItems();
    }

    renderReminderTextItems() {
        const rtContainer = this.querySelector('.rts-container');
        rtContainer.innerHTML = '';

        this.data.keyword.reminderTexts.forEach((rt, index ) => {
            const rtElement = document.createElement('cm-reminder-text-item');
            rtContainer.appendChild(rtElement);
            rtElement.dataset.index = index;
            rtElement.model = rt;
            rtElement.render();
        });
    }
}

defineRtComponents();