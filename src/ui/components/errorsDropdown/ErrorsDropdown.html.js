const L = localize('errors-dropdown');

export default (
    `<sl-dropdown>
        <sl-button
            slot="trigger"
            size="small"
            class="errors-button"
            data-click-action="showErrors"
        >
            <sl-icon slot="prefix" name="check-circle"></sl-icon>
            ${L`No issues`}
        </sl-button>
        <div class="dropdown">
            <sl-tab-group>
                <sl-tab slot="nav" panel="errors">${L`Errors`}</sl-tab>
                <sl-tab slot="nav" panel="warnings">${L`Warnings`}</sl-tab>
                <div slot="nav" class="actions">
                    <sl-button
                        size="small"
                        data-click-action="clearAll"
                    >Clear</sl-button>
                    <sl-button
                        size="small"
                        data-click-action="copyAll"
                    >Copy</sl-button>
                </div>

                <sl-tab-panel name="errors">
                    <div class="no-content-prompt">
                        <h2>${L`No errors reported.`}</h2>
                    </div>
                </sl-tab-panel>
                <sl-tab-panel name="warnings">
                    <div class="no-content-prompt">
                        <h2>${L`No warnings reported.`}</h2>
                    </div>
                </sl-tab-panel>
            </sl-tab-group>
        </div>
    </sl-dropdown>`
);
