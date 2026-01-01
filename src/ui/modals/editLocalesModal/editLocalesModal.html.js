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
<div class="input-fields">
    <form-field model-key="selectedLocale" field-id="id"></form-field>
    <form-field model-key="selectedLocale" field-id="label"></form-field>
    <form-field model-key="selectedLocale" field-id="contributors"></form-field>
</div>
<form-field model-key="selectedLocale" field-id="text"></form-field>
<div class="editor-status-bar">
    <div class="status-message"></div>
    <div class="stats"></div>
</div>`;
