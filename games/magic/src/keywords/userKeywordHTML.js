const L = localize('game-magic');

export default `
<cm-select x-once:field="$store.game.userKwField" x-once:model="set.info"></cm-select>
<sl-input label="${L`Custom Keyword Expression`}" x-model="$store.game.currentUserKeyword.expression"></sl-input>
<sl-input label="${L`Custom Keyword Reminder Text Template`}" x-model="$store.game.currentUserKeyword.reminderTexts[0].template"></sl-input>
`;