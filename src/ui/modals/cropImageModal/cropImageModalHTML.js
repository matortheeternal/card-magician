const L = localize('crop-image-modal');

const toolbox = (
    `<div class="toolbox">
        <sl-tooltip
            :content="aspectRatioLocked
                ? '${L`Unlock aspect ratio`}'
                : '${L`Lock aspect ratio`}'"
            placement="left">
            <sl-icon-button
                :name="aspectRatioLocked
                    ? 'lock'
                    : 'unlock'"
                @click="toggleAspectRatioLock()"
            ></sl-icon-button>
        </sl-tooltip>
        <sl-tooltip content="${L`Reset crop`}" placement="left">
            <sl-icon-button
                name="arrow-counterclockwise"
                @click="resetCrop()"
            ></sl-icon-button>
        </sl-tooltip>
        <sl-tooltip content="${L`Crop to image size`}" placement="left">
            <sl-icon-button
                name="arrows-fullscreen"
                @click="cropToImageSize()"
            ></sl-icon-button>
        </sl-tooltip>
        <sl-tooltip content="${L`Center crop horizontally`}" placement="left">
            <sl-icon-button
                name="align-center"
                @click="centerCropHorizontally()"
            ></sl-icon-button>
        </sl-tooltip>
        <sl-tooltip content="${L`Center crop vertically`}" placement="left">
            <sl-icon-button
                name="align-middle"
                @click="centerCropVertically()"
            ></sl-icon-button>
        </sl-tooltip>
    </div>`
);

const editor = (
    `<div class="editor-container">
        <div class="crop-container">
            <img
                :src="value.imageUrl"
                :width="value.width + 'px'"
                :height="value.height + 'px'"
            />
            <div class="crop-box" data-mode="move">
                <div
                    class="edge vertical"
                    style="top: -4px"
                    data-mode="resize-top">
                    <div></div>
                </div>
                <div
                    class="edge vertical"
                    style="bottom: -3px"
                    data-mode="resize-bottom">
                    <div></div>
                </div>
                <div
                    class="edge horizontal"
                    style="left: -4px"
                    data-mode="resize-left">
                    <div></div>
                </div>
                <div
                    class="edge horizontal"
                    style="right: -3px"
                    data-mode="resize-right">
                    <div></div>
                </div>
                <div class="corner"
                     style="top: -4px; left: -4px; cursor: nw-resize"
                     data-mode="resize-top resize-left"></div>
                <div class="corner"
                     style="top: -4px; right: -4px; cursor: ne-resize"
                     data-mode="resize-top resize-right"></div>
                <div class="corner"
                     style="bottom: -4px; left: -4px; cursor: sw-resize"
                     data-mode="resize-bottom resize-left"></div>
                <div class="corner"
                     style="bottom: -4px; right: -4px; cursor: se-resize"
                     data-mode="resize-bottom resize-right"></div>
            </div>
        </div>
        <div class="info-container">
            <div class="image-info">
                <span>${L`Image`}&nbsp;</span>
                <span x-text="realWidth"></span>
                <span>x</span>
                <span x-text="realHeight"></span>
                <span>, ${L`scaled to`}&nbsp;</span>
                <span x-text="value.width"></span>
                <span>x</span>
                <span x-text="value.height"></span>
            </div>
            <div class="crop-info">
                <span>${L`crop`}&nbsp;</span>
                <cm-inline-input
                    data-crop-key="width"
                    :value="realCrop.width"
                ></cm-inline-input>
                <span>x</span>
                <cm-inline-input
                    data-crop-key="height"
                    :value="realCrop.height"
                ></cm-inline-input>
                <span>, x+</span>
                <cm-inline-input
                    data-crop-key="xOffset"
                    :value="realCrop.xOffset"
                ></cm-inline-input>
                <span>&nbsp;y+</span>
                <cm-inline-input
                    data-crop-key="yOffset"
                    :value="realCrop.yOffset"
                ></cm-inline-input>
            </div>
        </div>
    </div>`
);

export default
`<div class="modal">
    <div class="modal-title-bar">
        <div>${L`Crop Image`} (<span x-text="value.filename"></span>)</div>
        <sl-tooltip content="${L`Close Modal`}">
            <sl-icon-button
                name="x-lg"
                class="close-modal"
                @click="cancel()"
            ></sl-icon-button>
        </sl-tooltip>
    </div>
    <sl-tab-group>
        <sl-tab slot="nav" panel="edit">${L`Edit Crop`}</sl-tab>
        <sl-tab slot="nav" panel="preview">${L`Preview`}</sl-tab>

        <sl-tab-panel name="edit">
            <div class="modal-body">
                ${toolbox}
                ${editor}
            </div>
        </sl-tab-panel>
        <sl-tab-panel name="preview">
            <div class="modal-body">
                <div class="preview-container">
                    <crop-image :crop-width="realCrop.width"
                                :crop-height="realCrop.height"
                                :offset-x="realCrop.xOffset"
                                :offset-y="realCrop.yOffset"
                                :src="value.imageUrl"></crop-image>
                </div>
            </div>
        </sl-tab-panel>
    </sl-tab-group>
    <div class="modal-actions">
        <sl-button @click="save()">${L`Save`}</sl-button>
        <sl-button @click="cancel()">${L`Cancel`}</sl-button>
    </div>
</div>`;
