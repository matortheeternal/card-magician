import setInfoFields from './setInfoFields.js';

const L = localize('game-magic');

export default class SetInfoModal extends Modal {
    static id = 'cm-set-info-modal';
    title = L`Set Info`;

    connectedCallback() {
        super.connectedCallback();
        this.style.maxWidth = '35em';
    }

    get fields() {
        return setInfoFields;
    }

    renderBody() {
        return (
            `<form-field field-id="title"></form-field>
            <form-field field-id="description"></form-field>
            <div class="field-group">
                <form-field field-id="illustrator"></form-field>
                <form-field field-id="legalText"></form-field>
                <form-field field-id="setCode"></form-field>
                <form-field field-id="language"></form-field>
                <form-field field-id="collectorNumberFormat"></form-field>
                <form-field field-id="rarityOrder"></form-field>
            </div>
            <form-field field-id="symbol"></form-field>`
        );
    }
}
