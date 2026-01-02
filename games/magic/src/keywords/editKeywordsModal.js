import editKeywordFields from './editKeywordsFields.js';
import ReminderTextItem from './reminderTextItem.js'; // Import to register custom element

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

        .warning-unsaved {
            color: #ed7e38;
        }

        .x-label {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .x-label sl-icon:hover {
            color: red;
            cursor: pointer;
        }
    `;

    get onClickHandlers() {
        return ({
            ...super.onClickHandlers,
            addRt() {
                this.edited = true;
                this.data.keyword.reminderTexts.push({template: ''});
                this.render();
            },
            removeRt(event) {
                this.querySelectorAll('cm-reminder-text-item').forEach((rt, index) => {
                    if (rt === event.target.closest('cm-reminder-text-item')) {
                        this.edited = true;
                        this.data.keyword.reminderTexts.splice(index, 1);
                        this.render();
                    }
                });
            }
        });
    }

    saveKeyword() {
        if (!this.edited) return;
        if (!this.data.keyword.user) 
            this.data.set.keywordOverrides[this.data.keyword.label] = this.data.keyword;
        else {
            this.data.set.userKeywords[this.data.keyword.saveIndex] = this.data.keyword;
        }
    }

    close() {
        this.saveKeyword();
        super.close();
    }

    get fields() {
        return editKeywordFields;
    }

    get model() {
        return this.data.keyword;
    }

    renderBody() {
        const numRts = this.data.keyword.reminderTexts.length;
        const rtHtml = '<cm-reminder-text-item></cm-reminder-text-item>'.repeat(numRts);
        
        return (
            `<form-field field-id="label"></form-field>
            <form-field field-id="expression"></form-field>
            <div class="rts-container">${rtHtml}</div>
            <sl-button class="add-rt" variant="success" outline data-click-action="addRt"><sl-icon name="plus" slot="prefix"></sl-icon>Add Reminder Text</sl-button>
            <style>${this.css}</style>`
        );
    }

    render() {
        super.render();

        const rts = this.querySelectorAll('cm-reminder-text-item');
        rts.forEach((rt, index) => {
            rt.model = this.data.keyword.reminderTexts[index];
            rt.dataset.index = index + 1;
            rt.render();
        });

        this.addEventListener('cm-field-changed', () => { this.edited = true; });
    }
}