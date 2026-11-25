import { getExtensionDirectory } from '../../shared/extensionManager.js';
import { loadFont } from './dynamicFontLoader.js';
import {
    combineBlendOp,
    linearBlendOp,
    makeTransparentOp,
    maskBlendOp,
    maskColorOp,
    maskImageOp
} from '../graphics/compositeOperations.js';
import DOMPurify from 'dompurify';
import { escapeHTML, esc } from '../../shared/htmlUtils.js';
import { watch } from '../../shared/reactivity.js';

export default class CardMagicianModule {
    #watchers = [];
    #fields;
    #options;

    /**
     * @param {CardFace} card - The card face this module is associated with.
     * @param {string} modulePath - Module identifier relative to cardparts/.
     * @param {MountedDirectory} [directory] - Directory containing the module.
     */
    constructor(card, modulePath, directory) {
        this.card = card;
        this.modulePath = modulePath;
        this.directory = directory ?? getExtensionDirectory()
            .child(`cardparts/${modulePath}`);
        this.name = modulePath.split('/').pop();
        this.containerName = this.name;
    }

    /**
     * Metadata from the module's module.json, assigned when the module is
     * registered for the active game.
     *
     * @type {object}
     */
    static moduleMetadata;

    /**
     * Returns the module container names this module can render into: its own
     * name first, followed by the names of the modules it extends. A template
     * can use an extended module's name to let this module render there with
     * that module's styling.
     *
     * @returns {Set<string>}
     */
    static get containerNames() {
        const names = new Set();
        let Module = this;
        while (Module !== CardMagicianModule) {
            names.add(Module.moduleMetadata.id.split('/').pop());
            Module = Object.getPrototypeOf(Module);
        }
        return names;
    }

    dispose() {
        this.#watchers.forEach(unwatch => unwatch());
    }

    /**
     * Invokes callback whenever the specified object properties are reported to
     * have changed via changed().
     *
     * @param {object} obj - The object to watch for changes.
     * @param {string|string[]|null} keysArg - The key or keys to watch. Passing null
     * or empty string indicates to watch all properties.
     * @param {function} callback - The callback function to execute when a change
     * is reported.
     * @returns {{remove(): void}}
     */
    watch(obj, keysArg, callback) {
        const unwatch = watch(obj, keysArg, callback);
        this.#watchers.push(unwatch);
        return {
            remove: () => {
                const index = this.#watchers.indexOf(unwatch);
                this.#watchers.splice(index, 1);
                unwatch();
            }
        };
    }

    /**
     * Returns a path for a file in this module's folder.
     *
     * @param {string} localPath - Path relative to the module's directory.
     * @returns {string} - Fully qualified path for the file.
     */
    resolvePath(localPath) {
        return this.directory.url(localPath);
    }

    /**
     * Returns a path for a file in this module's assets folder.
     *
     * @param {string} assetPath - Path relative to the module's `assets` directory.
     * @returns {string} - Fully qualified path for the asset.
     */
    resolveAsset(assetPath) {
        return this.directory.url(`assets/${assetPath}`);
    }

    /**
     * Loads a text file from inside the module folder.
     * The file is cached on first read.
     *
     * @async
     * @param {string} localPath - Path relative to the module root.
     * @returns {Promise<string>} Resolves with the file's text content.
     */
    async loadFile(localPath) {
        return this.directory.readText(localPath);
    }

    /**
     * Tints an image using a color mask.
     *
     * @async
     * @param {ImageOp|string} source - The source image.
     * @param {HexColor} color - Hex color string (e.g. "#ff00aa").
     * @returns {ImageOp} A deferred image operation.
     */
    maskColor(source, color) {
        return maskColorOp(source, color);
    }

    /**
     * Applies an alpha mask image to another image.
     *
     * @param {ImageOp|string} source - The source image.
     * @param {ImageOp|string} mask - The mask image.
     * @returns {ImageOp} A deferred image operation.
     */
    maskImage(source, mask) {
        return maskImageOp(source, mask);
    }

    /**
     * Blends two images using a pixel-level blending mode.
     *
     * @param {ImageOp|string} imgA - The first image.
     * @param {ImageOp|string} imgB - The second image.
     * @param {BlendMode} [mode='symmetricOverlay'] - Name of the blend mode to use.
     * @returns {ImageOp} A deferred image operation.
     */
    combineBlend(imgA, imgB, mode = 'symmetricOverlay') {
        return combineBlendOp(imgA, imgB, mode);
    }

    /**
     * Blends two images using a linear gradient between two points.
     *
     * @param {ImageOp|string} imgA - First image.
     * @param {ImageOp|string} imgB - Second image.
     * @param {number} x1 - Gradient start X (0–1 relative).
     * @param {number} y1 - Gradient start Y (0–1).
     * @param {number} x2 - Gradient end X (0–1).
     * @param {number} y2 - Gradient end Y (0–1).
     * @returns {ImageOp} A deferred image operation.
     */
    linearBlend(imgA, imgB, x1, y1, x2, y2) {
        return linearBlendOp(imgA, imgB, x1, y1, x2, y2);
    }

    /**
     * Blends two images together using a mask image that controls pixel mixing.
     *
     * @async
     * @param {ImageOp|string} imgToMask - The image whose pixels are blended.
     * @param {ImageOp|string} baseImg - The base/background image.
     * @param {ImageOp|string} mask - The mask image (uses red channel as mask).
     * @returns {ImageOp} A deferred image operation.
     */
    maskedBlend(imgToMask, baseImg, mask) {
        return maskBlendOp(imgToMask, baseImg, mask);
    }

    /**
     * Sets the alpha value of every pixel in the input image to the specified opacity.
     *
     * @async
     * @param {ImageOp|string} image - The image to make transparent.
     * @param {number} opacityValue - The alpha value to use, in the range 0.0 to 1.0.
     * @returns {ImageOp} A deferred image operation.
     */
    makeTransparent(image, opacityValue) {
        return makeTransparentOp(image, opacityValue);
    }

    /**
     * Loads a font file from this module and registers it in the document
     * via @font-face.
     *
     * @async
     * @param {string} fontName - Name to register the loaded font under.
     * @param {string} localPath - Path inside the module's /assets folder.
     * @returns {Promise<void>}
     */
    async loadFont(fontName, localPath) {
        await loadFont(fontName, this.resolveAsset(localPath));
    }

    /**
     * Sanitizes an input string using DOMPurify.
     *
     * @param {string} str - the string to sanitize
     * @param {object} options - sanitize HTML options
     * @returns {string}
     */
    sanitize(str, options) {
        return DOMPurify.sanitize(str, options);
    }

    /**
     * Escapes HTML markup in a string.
     * @param {string} str
     * @returns {string}
     */
    escapeHTML(str) {
        return escapeHTML(str);
    }

    esc(str) {
        return esc(str);
    }

    getCardClientRect(element) {
        const rect = element.getBoundingClientRect();
        const rootRect = this.card.dom.root.getBoundingClientRect();
        return new DOMRect(
            rect.left - rootRect.left,
            rect.top - rootRect.top,
            rect.width,
            rect.height
        );
    }

    objectToStyle(obj) {
        return Object.entries(obj)
            .map(([key, value]) => `${key.separate('-').toLowerCase()}: ${value}`)
            .join('; ');
    }

    /**
     * Request that this module perform a render update.
     *
     * NOTE:
     *   This function is injected at runtime by `setupRenderPipeline()`.
     *
     * @type {(options?: RequestRenderOptions) => void}
     */
    requestRender;

    /**
     * Called once when the module is initialized.
     * Override to load options, assets, or perform setup.
     *
     * @param {CardFace} card
     * @returns {Promise<void>|void}
     */
    async init(card) {}

    /**
     * Creates card field definitions for this module without requiring an
     * instance or card model.
     *
     * @returns {Array<Field>}
     */
    static createFields() { return []; }

    /**
     * Returns this module instance's card field definitions.
     *
     * @returns {Array<Field>}
     */
    get fields() {
        return this.#fields ??= this.constructor.createFields();
    }

    /**
     * Creates option field definitions for this module without requiring an
     * instance or card model.
     *
     * @returns {Array<Field>}
     */
    static createOptions() { return []; }

    /**
     * Returns this module instance's option field definitions.
     *
     * @returns {Array<Field>}
     */
    get options() {
        return this.#options ??= this.constructor.createOptions();
    }

    /**
     * Returns CSS styles to be injected for this module.
     *
     * @returns {Promise<Array<string>>|Array<string>}
     */
    async styles() { return []; }

    /**
     * Sets up reactive effects connecting card state to module behavior.
     *
     * @param {CardFace} card
     * @param {(deps:()=>any, fn:()=>Promise<void>|void)=>void} watch
     * @returns {void}
     */
    bind(card, watch) {}

    /**
     * Default render function invoked when you requestRender in this function.
     * Output is written into the associated <module-container> specified in the
     * active template.
     *
     * @param {CardFace} card
     * @returns {string|undefined}
     */
    render(card) {}

    /**
     * Additional named render methods may be provided, and invoked from
     * <module-container> elements in templates using the render attribute.
     *
     * This method exists only for documentation and does nothing.
     *
     * @param {CardFace} card
     * @returns {string|undefined}
     */
    renderNamed(card) {}
}

window.CardMagicianModule = CardMagicianModule;

/**
 * A blob URL pointing to an in-memory file, produced by URL.createObjectURL().
 * Example: "blob:http://localhost/abc123"
 * @typedef {string} BlobURL
 */

/**
 * A color expressed as a hex string.
 * Accepts #RGB, #RRGGBB, or #RRGGBBAA formats.
 * @typedef {string} HexColor
 */

/**
 * Blend modes supported by the blending engine.
 *
 * @typedef {(
 *   "multiply" |
 *   "screen" |
 *   "overlay" |
 *   "softLight" |
 *   "hardLight" |
 *   "colorDodge" |
 *   "colorBurn" |
 *   "linearBurn" |
 *   "difference" |
 *   "exclusion" |
 *   "symmetricOverlay"
 * )} BlendMode
 */

/**
 * A single option in a select-type field.
 *
 * @typedef {object} FieldOption
 * @property {string} id              - Option identifier.
 * @property {string} name            - Human-friendly label.
 * @property {BlobURL} [imageUrl]     - Optional icon to render next to the option.
 * @property {Array<FieldOption>} [items]
 *   Nested submenu items (for group selects).
 * @property {boolean} [separator]
 *   If true, renders a <sl-divider> instead of an option.
 */

/**
 * Value stored in the card model for image-type fields.
 *
 * @typedef {object} ImageFieldValue
 * @property {BlobURL|null} image
 * @property {number} [xOffset]
 * @property {number} [yOffset]
 * @property {number} [width]
 * @property {number} [height]
 */

/**
 * Base properties shared by all field definitions.
 *
 * @typedef {object} BaseField
 * @property {string} id                 - Key under which this field’s value
 *                                         is stored on the card.
 * @property {string} label              - User-facing label.
 * @property {string} [group]            - Optional grouping (creates nested UI groups).
 * @property {string} [default]          - Default value used when card is created.
 */

/**
 * Single-line text input field.
 *
 * @typedef {BaseField & {
 *    type: "input",
 *    inputType?: string
 * }} InputField
 */

/**
 * Multiline text area field.
 *
 * @typedef {BaseField & {
 *    type: "textarea"
 * }} TextareaField
 */

/**
 * Image selection field (with crop parameters, etc.)
 *
 * @typedef {Omit<BaseField, "default"> & {
 *    type: "image",
 *    default?: ImageFieldValue
 * }} ImageField
 */

/**
 * Dropdown select field with nested options.
 *
 * @typedef {BaseField & {
 *    type: "select",
 *    options: Array<FieldOption>,
 *    default: string
 * }} SelectField
 */

/**
 * @typedef {InputField | TextareaField | SelectField | ImageField} Field
 */

/**
 * Reactive card face data model.
 *
 * NOTE:
 *   CardFace is intentionally extensible. Modules may attach arbitrary
 *   additional reactive properties to it, which become visible to other
 *   modules. Only core properties are documented here.
 *
 *
 * @typedef {object} CardFace
 *
 * @property {string} id                             - Face key. e.g. 'front'
 * @property {DOMBuilder} dom
 * @property {DOMBuilder} form
 * @property {Array<Field>} fields
 * @property {Array<CardFace>} subCards              - Nested subcards.
 *
 * @property {function():Promise<object>} save - Saves the face.
 * @property {function(object):Promise<void>} load - Loads face data.
 *
 * @property {function():CardFace|null} parent       - Resolve parent.
 * @property {function():Array<CardMagicianModule>} modules - Active modules.
 */

/**
 * Options passed to requestRender().
 *
 * @typedef {object} RequestRenderOptions
 *
 * @property {string} [render]
 *    Optional name of the specific render method to invoke.
 *    If omitted, the system will update all `<module-container>` instances
 *    associated with this module.
 *
 * @example
 * // Update containers that have a specific render key:
 * this.requestRender({ render: "renderFaceSymbol" });
 *
 * @example
 * // Default: update all containers associated with this module
 * this.requestRender();
 */
