import editKeywordFields from './editKeywordsFields.js';
import ReminderTextItem from './reminderTextItem.js'; // Import to register custom element

const L = localize('game-magic');

export default class EditKeywordsModal extends Modal {
    static id = 'cm-edit-keywords-modal';
    title = L`Edit Keywords`;

    css = `
        form-group {
            grid-template-columns: auto;
        }
    `;

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
    }
}