const L = localize('title-bar');

const maximizeIcon = (
    `<svg width="16"
          height="16"
          viewBox="0 0 16 15"
          fill="inherit"
          stroke="currentColor"
          stroke-width="1.2"
          stroke-linejoin="miter">
        <rect x="4" y="1" width="10" height="10"></rect>
        <rect x="1" y="4" width="10" height="10" fill="inherit"></rect>
    </svg>`
);

export default
`<div class="menus-container">
    <img src="icons/appIcon.png" />
</div>
<div class="window-actions" style="--wails-draggable: no-drag;">
    <sl-button id="minimize-app" data-click-action="minimize" title="${L`Minimize`}">
        <sl-icon name="dash-lg"></sl-icon>
    </sl-button>
    <sl-button id="maximize-app" data-click-action="toggleMaximize">
        ${maximizeIcon}
        <sl-icon name="square" style="display: none"></sl-icon>
    </sl-button>
    <sl-button id="close-window" data-click-action="exit" title="${L`Close`}">
        <sl-icon name="x-lg"></sl-icon>
    </sl-button>
</div>`;
