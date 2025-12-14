const L = localize('set-info-modal');

export default
`<div class="modal">
    <div class="modal-title-bar">
        <div>${L`Set Info`}</div>
        <div class="close-modal" @click="closeModal()">
            <sl-icon name="x-lg"></sl-icon>
        </div>
    </div>
    <div class="modal-body" x-html="game.renderSetInfo()"></div>
</div>`
