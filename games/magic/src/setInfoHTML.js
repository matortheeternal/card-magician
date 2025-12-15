const L = localize('game-magic');

export default
`<sl-input label="${L`Title`}" x-model="set.info.title"></sl-input>
<sl-input label="${L`Description`}" x-model="set.info.description"></sl-input>
<sl-input label="${L`Default Artist`}" x-model="set.info.illustrator"></sl-input>
<sl-input label="${L`Copyright`}" x-model="set.info.legalText"></sl-input>
<sl-input label="${L`Set code`}" x-model="set.info.setCode"></sl-input>
<sl-input label="${L`Language`}" x-model="set.info.language"></sl-input>
<cm-select x-once:field="$store.game.rarityOrderField" x-once:model="set.info"></cm-select>
<cm-select x-once:field="$store.game.numberFormatField" x-once:model="set.info"></cm-select>
<sl-textarea label="${L`Set symbol`}" x-model="set.info.symbol" resize="auto"></sl-textarea>`;
