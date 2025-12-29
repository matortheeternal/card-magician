const L = localize('crop-image-modal');

export default
`<sl-tab-group>
    <sl-tab slot="nav" panel="edit">${L`Edit Crop`}</sl-tab>
    <sl-tab slot="nav" panel="preview">${L`Preview`}</sl-tab>

    <sl-tab-panel name="edit">
        <div class="modal-body">
            <cm-crop-image-toolbox></cm-crop-image-toolbox>
            <cm-crop-image-editor></cm-crop-image-editor>
        </div>
    </sl-tab-panel>
    <sl-tab-panel name="preview">
        <div class="modal-body">
            <div class="preview-container"></div>
        </div>
    </sl-tab-panel>
</sl-tab-group>`;
