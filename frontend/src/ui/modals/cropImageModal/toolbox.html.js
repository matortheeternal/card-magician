const L = localize('crop-image-modal');

export default
`<sl-tooltip placement="left">
    <sl-icon-button data-click-action="toggleAspectRatioLock"></sl-icon-button>
</sl-tooltip>
<sl-tooltip content="${L`Reset crop`}" placement="left">
    <sl-icon-button
        name="arrow-counterclockwise"
        data-click-action="resetCrop"
    ></sl-icon-button>
</sl-tooltip>
<sl-tooltip content="${L`Crop to image size`}" placement="left">
    <sl-icon-button
        name="arrows-fullscreen"
        data-click-action="cropToImageSize"
    ></sl-icon-button>
</sl-tooltip>
<sl-tooltip content="${L`Center crop horizontally`}" placement="left">
    <sl-icon-button
        name="align-center"
        data-click-action="centerCropHorizontally"
    ></sl-icon-button>
</sl-tooltip>
<sl-tooltip content="${L`Center crop vertically`}" placement="left">
    <sl-icon-button
        name="align-middle"
        data-click-action="centerCropVertically"
    ></sl-icon-button>
</sl-tooltip>`;
