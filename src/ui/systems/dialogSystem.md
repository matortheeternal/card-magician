# Dialog System

Use the global `window.dialog`.

```js
await dialog.alert('Project must be saved before exporting.');

if (!await dialog.confirm('Delete this item?', {
    title: 'Delete item',
    confirmLabel: 'Delete',
    cancelLabel: 'Keep',
})) return;

const name = await dialog.prompt('Enter tag name', { defaultValue: 'New tag' });
if (name === null) return;
```

All methods return promises. Alerts resolve with no value after dismissal.
Confirmations resolve `true` when accepted and `false` for Cancel, Escape,
or the close button. Confirmations initially focus Cancel.

Prompts focus the text input and resolve with its value when accepted using OK
or Enter, including an empty string. Cancelling returns `null`. Set `defaultValue`
to prefill the input.

Overlay clicks never dismiss dialogs. Escape and the close button still work.
Titles and button labels have localized defaults and can be overridden.
Messages are plain text and preserve line breaks.

Requests display in order, one at a time. The service appends Shoelace dialogs
to the document body above the modal manager's container, leaving its active
modal intact. Shoelace handles focus trapping and restoration. Application
hotkeys pause while a service dialog is visible.
