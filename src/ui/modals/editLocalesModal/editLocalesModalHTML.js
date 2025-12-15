const L = localize('edit-locales-modal');

export default
`<div class="modal">
    <div class="modal-title-bar">
        <div>${L`Edit Locales`}</div>
        <div class="close-modal" @click="closeModal()">
            <sl-icon name="x-lg"></sl-icon>
        </div>
    </div>
    <div class="modal-body">
        <div class="select-bar">
            <cm-select x-once:field="localeField"></cm-select>
            <sl-tooltip hoist content="${L`Create new locale`}">
                <sl-icon-button 
                    name="plus-lg" 
                    @click="createNewLocale"
                ></sl-icon-button>
            </sl-tooltip>
            <sl-tooltip hoist content="${L`Open locales folder`}">
                <sl-icon-button 
                    name="folder2-open" 
                    @click="openLocalesFolder()"
                ></sl-icon-button>
            </sl-tooltip>
        </div>
        <div class="input-fields">
            <cm-input x-once:field="idField"></cm-input>
            <cm-input x-once:field="labelField"></cm-input>
            <cm-input 
                class="contributors-input" 
                x-once:field="contributorsField"
            ></cm-input>
        </div>
        <cm-code-editor syntax="yaml"></cm-code-editor>
    </div>
    <div class="modal-actions">
        <sl-button @click="activate">${L`Activate`}</sl-button>
        <sl-button @click="share">${L`Share`}</sl-button>
        <sl-button @click="closeModal">${L`Close`}</sl-button>
    </div>
</div>`
