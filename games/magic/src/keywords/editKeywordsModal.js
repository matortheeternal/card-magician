import editKeywordFields from './editKeywordsFields.js';
import ReminderTextItem from './reminderTextItem.js';

const L = localize('game-magic');

export default class EditKeywordsModal extends Modal {
    static id = 'cm-edit-keywords-modal';
    title = L`Edit Keywords`;

    get fields() {
        console.log('fields', editKeywordFields);
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
        
        console.log('body');
        return (
            `<form-field field-id="label"></form-field>
            <form-field field-id="expression"></form-field>
            <div class="rts-container">${rtHtml}</div>`
        );
    }

    afterRender() {
        super.afterRender();
        const rts = this.querySelectorAll('cm-reminder-text-item');
        rts.forEach((rt, index) => {
            rt.model = this.data.keyword.reminderTexts[index];
            rt.render();
        });
    }
}