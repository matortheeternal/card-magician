export default ({label}) => `
<style>
    :host {
        display: flex;
        flex-direction: column;
        font-family: var(--sl-font-sans);
        color: var(--sl-color-neutral-700);
    }
    
    sl-card {
        cursor: default; 
        user-select: none;
        position: relative;
        text-align: center;
        transition: background-color 0.2s, border-color 0.2s;
    }
    
    sl-card.dragover {
        border: 2px dashed var(--sl-color-primary-600);
        background-color: var(--sl-color-primary-50);
    }
    
    #upload-prompt {
        color: var(--sl-color-neutral-700);
    }
    
    #preview {
        display: none;
    }
    
    #preview img {
        max-height: 160px;
        border-radius: var(--sl-border-radius-medium);
    }
    
    #preview-name {
        font-size: small;
    }
    
    #remove-btn {
        cursor: pointer;
        position: absolute;
        top: 0;
        right: 0;
    }
    
    #remove-btn::part(base) {
        padding: var(--sl-spacing-2x-small);
        color: var(--sl-color-danger-600);
    }
</style>

<label
  part="form-control-label"
  class="form-control__label"
  for="file-input"
>
  <slot name="label">${label}</slot>
</label>
<sl-card id="dropzone">
    <div id="upload-prompt">
        <sl-icon name="image"  style="font-size: 4em;"></sl-icon>
        <div>Select image</div>
    </div>
    
    <div id="preview">
        <sl-tooltip content="Clear selection">
            <sl-icon-button id="remove-btn" name="x-lg"></sl-icon-button>
        </sl-tooltip>
        <img id="preview-image" alt="Preview" hidden />
        <div id="preview-name""></div>
    </div>
    
    <input type="file" id="file-input" hidden />
</sl-card>`;
