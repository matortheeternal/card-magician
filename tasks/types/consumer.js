/// <reference path="../../dist/card-magician.d.ts" />
/* global CardMagicianGame, CardMagicianProject */
/* global CardMagicianModule, CardMagicianExporter */
/* global CardMagicianCard, ReactiveComponent, Modal */
/* global appEnvironment, activeGame, activeProject, activeEditorCard */
/* global selectedProjectCard, localize, log, createReporter, changed, dialog */

class Game extends CardMagicianGame {}
class Project extends CardMagicianProject {}
class Module extends CardMagicianModule {
    escapeLabel() {
        return this.escapeHTML('<label>');
    }
}
class Exporter extends CardMagicianExporter {}
class Widget extends ReactiveComponent {}
class ExtensionModal extends Modal {}

/**
 * @param {ExportArtifact} artifact
 * @returns {OutputItem}
 */
function createOutputItem(artifact) {
    return { filePath: 'cards/example.png', artifact };
}

const game = new Game({ id: 'example', version: '1.0.0', path: '/games/example' });
game.statistics.registerDimension('suit', {
    label: 'Suit', values: card => [card.suit]
});
game.statistics.registerReport('suit-rank', {
    type: 'matrix', rows: 'suit', columns: 'rank', measure: 'card-count'
});
game.statistics.registerChartType('example:summary', {
    shape: 'matrix',
    create: container => ({
        render: data => { container.textContent = String(data.total); }
    })
});
// @ts-expect-error Dimension accessors must return arrays of category IDs.
game.statistics.registerDimension('invalid', { label: 'Invalid', values: () => 3 });
/** @type {Promise<string>} */
const platformText = game.platform.readFile('project.cmproj');
/** @type {Promise<ArrayBuffer>} */
const platformBytes = game.platform.readBinaryFile('image.png');
// @ts-expect-error File paths must be strings.
game.platform.readFile(123);
// @ts-expect-error Text writes must contain strings.
game.platform.writeFile('project.cmproj', new Uint8Array());
// @ts-expect-error Filesystem operations live directly on the adapter.
game.platform.filesystem;
/** @type {string[]} */
const identity = [game.id, game.version, game.name, game.resolvePath('assets')];
const card = new game.Card();
const project = new game.Project();
const globalCard = new CardMagicianCard();
/** @type {string[]} */
const environment = [appEnvironment.id, appEnvironment.paths.data];
/** @type {string} */
const activeAsset = activeGame.resolveAsset('image.png');
const projectFile = activeProject.filePath;
if (activeEditorCard?.front) activeEditorCard.front.save();
if (selectedProjectCard) selectedProjectCard.save();
const L = localize('example-extension');
/** @type {string} */
const localized = L`Project file: ${projectFile}`;
log('plugin').info(localized, environment);
createReporter({ unit: 'Example' })('load', new Error('Example'));
changed(globalCard, ['front.title', 'back.title']);
changed(globalCard);
/** @type {Promise<void>} */
const alertResult = dialog.alert('Example', { title: 'Example' });
/** @type {Promise<boolean>} */
const confirmation = dialog.confirm('Continue?', { cancelLabel: 'Keep editing' });
/** @type {Promise<string | null>} */
const promptResult = dialog.prompt('Name', { defaultValue: 'Example' });
/** @type {boolean} */
const dialogIsOpen = dialog.isOpen;

// @ts-expect-error Environment arguments are readonly.
appEnvironment.args.push('--example');
// @ts-expect-error Localization namespaces must be strings.
localize(123);
// @ts-expect-error Changed paths must be strings or arrays of strings.
changed(globalCard, [123]);
// @ts-expect-error Dialog messages must be strings.
dialog.alert(123);
/** @type {Promise<string>} */
// @ts-expect-error A dismissed prompt can return null.
const invalidPrompt = dialog.prompt('Name');

/** @type {Field} */
const imageField = {
    id: 'image', label: 'Image', type: 'image', default: { image: null }
};
/** @type {Field} */
const inputField = { id: 'title', label: 'Title', type: 'input', default: 'Example' };

/** @type {Field} */
// @ts-expect-error Image defaults must be image values.
const invalidImage = { id: 'image', label: 'Image', type: 'image', default: 'image' };
/** @type {Field} */
// @ts-expect-error Text defaults must be strings.
const invalidInput = { id: 'title', label: 'Title', type: 'input', default: 123 };
/** @type {number} */
// @ts-expect-error Game identity must not degrade to any.
const invalidId = game.id;
// @ts-expect-error Paths must be strings.
game.resolvePath(123);
// @ts-expect-error HTML input must be a string.
Module.prototype.escapeHTML(123);

const exporter = new Exporter({ outputName: 'cards' }, {
    id: 'example', version: '1.0.0', path: '/exporters/example'
});
// @ts-expect-error Config values must be narrowed before use.
exporter.config.outputName.toUpperCase();
/** @type {number} */
// @ts-expect-error Escaped HTML must not degrade to any.
const invalidEscaped = Module.prototype.escapeHTML('label');

export {
    platformText, platformBytes,
    Game, Project, Module, Exporter, identity, card, project, imageField, inputField,
    invalidImage, invalidInput, invalidId, invalidEscaped,
    Widget, ExtensionModal, globalCard, activeAsset, localized, alertResult,
    confirmation, promptResult, dialogIsOpen, invalidPrompt, createOutputItem
};
