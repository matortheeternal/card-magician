import { defineRtComponents } from './reminderTextItem.js';

const L = localize('game-magic');

export default class EditKeywordsModal extends Modal {
    static id = 'cm-edit-keywords-modal';
    title = L`Edit Keywords`;
    edited = false;

    css = `
        cm-edit-keywords-modal form-group {
            grid-template-columns: auto;
        }

        .add-rt, .add-match {
            margin-top: 10px;
            width: fit-content;
        }

        .x-label {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .x-label sl-icon:hover {
            color: var(--sl-color-danger-400);
            cursor: pointer;
        }
    `;

    get onClickHandlers() {
        return ({
            ...super.onClickHandlers,
            addRt: this.addRt,
            removeRt: this.removeRt
        });
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
        if (!this.data.keyword.user) 
            this.data.set.keywordOverrides[this.data.keyword.label] = this.data.keyword;
        else
            this.data.set.userKeywords[this.data.keyword.saveIndex] = this.data.keyword;
        
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
        return (
            `<form-field field-id="label"></form-field>
            <form-field field-id="expression"></form-field>
            <h2 class="rt-header">Reminder Text Options</h2>
            <sl-button class="add-rt" variant="success" 
                outline data-click-action="addRt">
                <sl-icon name="plus" slot="prefix"></sl-icon>
                Add Reminder Text
            </sl-button>
            <div class="rts-container"></div>
            <style>${this.css}</style>`
        );
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