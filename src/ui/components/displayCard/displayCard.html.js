const L = localize('display-card');

export default
`<div class="card-viewport">
    <div class="card-canvas">
        <cm-card></cm-card>
    </div>
</div>
<div class="buttons-container" style="display: none">
    <sl-button data-click-action="flip">
        <sl-icon name="arrow-repeat"></sl-icon>
        <span>${L`Turn over`}</span>
    </sl-button>
</div>
<cm-card-properties></cm-card-properties>`;
