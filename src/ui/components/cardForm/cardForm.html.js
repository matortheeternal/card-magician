const L = localize('card-form');

export default
`<div class="face-actions">
    <sl-button-group>
        <sl-button
            class="toggle-face-front"
            variant="primary"
            data-click-action="toggleFront"
        ></sl-button>
        <sl-button
            class="toggle-face-back"
            variant="default"
            data-click-action="toggleBack"
        ></sl-button>
    </sl-button-group>

    <sl-button
        class="preview-card"
        variant="success"
        data-click-action="showPreview"
    >${L`Preview`}</sl-button>
</div>

<ul class="inspection-summary" aria-label="${L`Inspection warnings`}" hidden></ul>

<cm-inspection-popup></cm-inspection-popup>

<div class="face-front">
    <sl-details summary="${L`Fields`}" open>
        <cm-face-form data-face-id="front"></cm-face-form>
    </sl-details>
    <sl-details summary="${L`Options`}">
        <cm-options-form data-face-id="front"></cm-options-form>
    </sl-details>
</div>
<div class="face-back" style="display: none;">
    <sl-details summary="${L`Fields`}" open>
        <cm-face-form data-face-id="back"></cm-face-form>
    </sl-details>
    <sl-details summary="${L`Options`}">
        <cm-options-form data-face-id="back"></cm-options-form>
    </sl-details>
    <sl-button
        class="remove-back-face"
        variant="danger"
        data-click-action="removeBack"
        outline
    >
        ${L`Remove Back Face`}
    </sl-button>
</div>`;
