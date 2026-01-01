const L = localize('edit-locales-modal');

export default
`<div class="select-bar">
    <form-field field-id="selectedLocaleId"></form-field>
    <sl-tooltip hoist content="${L`Create new locale`}">
        <sl-icon-button
            name="plus-lg"
            data-click-action="createNewLocale"
        ></sl-icon-button>
    </sl-tooltip>
    <sl-tooltip hoist content="${L`Open locales folder`}">
        <sl-icon-button
            name="folder2-open"
            data-click-action="openLocalesFolder"
        ></sl-icon-button>
    </sl-tooltip>
</div>
<div class="locale-fields-container"></div>
<div class="editor-status-bar">
    <div class="status-message"></div>
    <div class="stats"></div>
</div>`;
