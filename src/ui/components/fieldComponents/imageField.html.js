export default
`<sl-card class="dropzone">
    <div class="upload-prompt" data-click-action="selectImage">
        <sl-icon name="image"></sl-icon>
        <div>Select image</div>
    </div>
    <div class="preview" style="display: none">
        <div class="actions">
            <sl-tooltip content="Remove image">
                <sl-icon-button
                    class="clear-btn"
                    name="x-lg"
                    data-click-action="clearImage"
                ></sl-icon-button>
            </sl-tooltip>
            <sl-tooltip content="Crop image">
                <sl-icon-button
                    class="crop-btn"
                    name="scissors"
                    data-click-action="cropImage"
                ></sl-icon-button>
            </sl-tooltip>
        </div>
        <sl-tooltip content="Click to change image">
            <div class="preview-container" data-click-action="selectImage">
                <img class="preview-image" alt="Preview" />
                <div class="crop-region"></div>
            </div>
        </sl-tooltip>
    </div>
    <input type="file" hidden />
</sl-card>`;
