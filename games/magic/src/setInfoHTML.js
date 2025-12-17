const L = localize('game-magic');

export default
`<sl-input 
    autocomplete="off"
    size="small" 
    label="${L`Title`}" 
    x-model="$store.views.activeSet.info.title"
></sl-input>
<sl-input 
    autocomplete="off"
    size="small" 
    label="${L`Description`}" 
    x-model="$store.views.activeSet.info.description"
></sl-input>
<div class="field-group">
    <sl-input 
        autocomplete="off"
        size="small" 
        label="${L`Default Artist`}" 
        x-model="$store.views.activeSet.info.illustrator"
    ></sl-input>
    <sl-input 
        autocomplete="off"
        size="small" 
        label="${L`Copyright`}" 
        x-model="$store.views.activeSet.info.legalText"
    ></sl-input>
</div>
<div class="field-group">
    <sl-input 
        autocomplete="off"
        size="small" 
        label="${L`Set code`}" 
        x-model="$store.views.activeSet.info.setCode"
    ></sl-input>
    <sl-input 
        autocomplete="off"
        size="small" 
        label="${L`Language`}" 
        x-model="$store.views.activeSet.info.language"
    ></sl-input>
</div>
<div class="field-group">
    <cm-select x-once:field="$store.game.rarityOrderField" x-once:model="$store.views.activeSet.info"></cm-select>
    <cm-select x-once:field="$store.game.numberFormatField" x-once:model="$store.views.activeSet.info"></cm-select>
</div>
<cm-code-editor label="Set Symbol" x-once:value="$store.views.activeSet.info.symbol" syntax="xml"></cm-code-editor>`
