const L = localize('crop-image-modal');

export default
`<div class="crop-container">
    <img alt="" />
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
    <div class="image-info"></div>
    <div class="crop-info">
        <span>${L`crop`}&nbsp;</span>
        <cm-inline-input data-crop-key="width"></cm-inline-input>
        <span>x</span>
        <cm-inline-input data-crop-key="height"></cm-inline-input>
        <span>, x+</span>
        <cm-inline-input data-crop-key="xOffset"></cm-inline-input>
        <span>&nbsp;y+</span>
        <cm-inline-input data-crop-key="yOffset"></cm-inline-input>
    </div>
</div>`;
