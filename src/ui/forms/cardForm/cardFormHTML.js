const L = localize('card-form');

export default
`<sl-tab-group>
    <sl-tab slot="nav" panel="frontFields">${L`Front Fields`}</sl-tab>
    <sl-tab slot="nav" panel="frontOptions">${L`Front Options`}</sl-tab>
    <sl-tab slot="nav" panel="backFields">${L`Back Fields`}</sl-tab>
    <sl-tab slot="nav" panel="backOptions">${L`Back Options`}</sl-tab>

    <sl-tab-panel name="frontFields">
        <cm-face-form data-face-id="front"></cm-face-form>
    </sl-tab-panel>
    <sl-tab-panel name="frontOptions">
        <cm-options-form data-face-id="front"></cm-options-form>
    </sl-tab-panel>
    <sl-tab-panel name="backFields">
        <cm-face-form data-face-id="back"></cm-face-form>
    </sl-tab-panel>
    <sl-tab-panel name="backOptions">
        <cm-options-form data-face-id="back"></cm-options-form>
    </sl-tab-panel>
</sl-tab-group>`;
