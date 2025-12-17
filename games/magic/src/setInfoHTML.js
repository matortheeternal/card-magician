const L = localize('game-magic');

export default
`<sl-input 
    autocomplete="off"
    size="small" 
    label="${L`Title`}" 
    x-model="set.info.title"
></sl-input>
<sl-input 
    autocomplete="off"
    size="small" 
    label="${L`Description`}" 
    x-model="set.info.description"
></sl-input>
<div class="field-group">
    <sl-input 
        autocomplete="off"
        size="small" 
        label="${L`Default Artist`}" 
        x-model="set.info.illustrator"
    ></sl-input>
    <sl-input 
        autocomplete="off"
        size="small" 
        label="${L`Copyright`}" 
        x-model="set.info.legalText"
    ></sl-input>
</div>
<div class="field-group">
    <sl-input 
        autocomplete="off"
        size="small" 
        label="${L`Set code`}" 
        x-model="set.info.setCode"
    ></sl-input>
    <sl-input 
        autocomplete="off"
        size="small" 
        label="${L`Language`}" 
        x-model="set.info.language"
    ></sl-input>
</div>
<div class="field-group">
    <cm-select x-once:field="$store.game.rarityOrderField" x-once:model="set.info"></cm-select>
    <cm-select x-once:field="$store.game.numberFormatField" x-once:model="set.info"></cm-select>
</div>
<cm-code-editor label="Set Symbol" x-once:value="set.info.symbol" syntax="xml"></cm-code-editor>`
