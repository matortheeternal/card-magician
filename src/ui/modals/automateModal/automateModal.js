import Modal from '../Modal.js';
import { registerModal } from '../modalManager.js';
import {
    getScripts, runScript, saveScript
} from '../../../domain/scripts/scriptManager.js';
import { initializeFields } from '../../systems/fieldSystem.js';

const L = localize('automate-modal');

export default class AutomateModal extends Modal {
    static id = 'cm-automate-modal';
    title = L`Automate changes`;

    get onClickHandlers() {
        return {
            ...super.onClickHandlers,
            newScript: () => this.newScript(),
            saveScript: () => this.saveScript(),
            runScript: () => this.runScript(),
        };
    }

    connectedCallback() {
        initializeFields(this.fields, this.model);
        super.connectedCallback();
        this.style.width = '50em';
    }

    get scriptFields() {
        return [{
            id: 'source',
            label: L`Source`,
            type: 'code',
            syntax: 'js'
        }, {
            id: 'name',
            label: L`Script name`
        }];
    }

    get scriptOptions() {
        return this._scriptOptions ||= getScripts().map(script => ({
            id: script.name,
            name: script.name.split('.')[0],
            fields: this.scriptFields,
            source: script.source,
        }));
    }

    get fields() {
        return this._fields ||= [{
            id: 'script',
            label: L`Script`,
            type: 'select',
            options: this.scriptOptions
        }, {
            id: 'target',
            label: L`Apply to`,
            type: 'select',
            options: [
                { id: 'all', name: L`All cards` },
                { id: 'selection', name: L`Selected cards` },
            ]
        }];
    }

    renderBody() {
        return (
            `<div class="script-selection">
                <form-group>
                    <form-field field-id="script"></form-field>
                    <form-field field-id="target"></form-field>
                    <sl-button data-click-action="newScript" size="small">New</sl-button>
                </form-group>
            </div>
            <div class="script-fields">
                <form-field model-key="script" field-id="name"></form-field>
                <form-field model-key="script" field-id="source"></form-field>
            </div>`
        );
    }

    renderActions() {
        return (
            `<sl-button data-click-action="saveScript">${L`Save`}</sl-button>
             <sl-button data-click-action="runScript">${L`Run Script`}</sl-button>
             <sl-button data-click-action="close">${L`Close`}</sl-button>`
        );
    }

    getNextScriptId() {
        const usedIds = this.scriptOptions.map(s => s.id);
        let currentId = 'NewScript';
        let counter = 1;
        while (usedIds.includes(currentId))
            currentId = `NewScript${counter++}`;
        return currentId;
    }

    newScript() {
        const newOption = {
            id: this.getNextScriptId(),
            name: L`New Script`,
            fields: this.scriptFields,
            source: ''
        };
        this.scriptOptions.push(newOption);
        changed(this.fields[0], 'options');
        this.model.script = newOption;
        changed(this.model, 'script');
    }

    saveScript() {
        saveScript(this.model.script);
    }

    runScript() {
        runScript(this.model.script, this.model.target);
    }
}

registerModal(AutomateModal);
