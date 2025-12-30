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

        cm-edit-keywords-modal .save-btn {
            margin-top: 10px;
        }

        .warning-unsaved {
            color: #ed7e38;
        }
    `;

    saveKeyword() {
        console.log('saving', this.edited);
        if (!this.edited) return;
        if (!this.data.keyword.user) {
            const data = this.data.keyword;
            
            this.querySelectorAll('cm-reminder-text-item').forEach((rt, index) => {
                this.data.keyword.reminderTexts[index] = rt.fullModel();
            });

            this.data.set.keywordOverrides[this.data.keyword.label] = data;
        }
    }

    close() {
        this.saveKeyword();
        super.close();
    }

    get fields() {
        return editKeywordFields;
    }

    getModel() {
        return this.data.keyword;
    }

    renderBody() {
        let rtHtml = '';
        for (const rt of this.data.keyword.reminderTexts) {
            rtHtml += '<cm-reminder-text-item></cm-reminder-text-item>';
        }
        
        return (
            `<form-field field-id="label"></form-field>
            <form-field field-id="expression"></form-field>
            <div class="rts-container">${rtHtml}</div>
            <style>${this.css}</style>`
        );
    }

    afterRender() {
        super.afterRender();
        const rts = this.querySelectorAll('cm-reminder-text-item');
        rts.forEach((rt, index) => {
            rt.model = this.data.keyword.reminderTexts[index];
            rt.render(index + 1);
        });

        this.addEventListener('sl-change', () => { this.edited = true });
    }
}