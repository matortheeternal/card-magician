import setInfoFields from './setInfoFields.js';
import '../editSetSymbol/EditSetSymbol.js';

const L = localize('game-magic');

export default class MagicProjectDetails extends CardMagicianSettings {
    static id = 'cm-magic-project-details';
    static parentId = 'cm-project-settings';
    static label = L`Details`;
    static groupWeight = 1024;

    static search(query) {
        return setInfoFields.filter(field => {
            return this.fieldMatches(field, query);
        });
    }

    bind() {
        this.addEventListener('cm-field-changed', () => {
            this.emit('project-changed');
        });
    }

    get model() {
        return window.activeProject;
    }

    get fields() {
        return setInfoFields;
    }

    render() {
        this.innerHTML = (
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
            <cm-edit-set-symbol></cm-edit-set-symbol>`
        );
    }
}
