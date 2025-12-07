import { loadTextFile } from '../../shared/fsUtils.js';
import { loadFont } from './fontService.js';
import {
    combineBlendOp,
    linearBlendOp,
    maskBlendOp,
    maskColorOp,
    maskImageOp
} from '../gfx/blending.js';
import Alpine from 'alpinejs';
import sanitizeHtml from 'sanitize-html';
import { escapeHTML } from '../../shared/htmlUtils.js';

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
 * @property {BlobURL} [imageURL]     - Optional icon to render next to the option.
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
 * @property {string} filename
 * @property {number} [xOffset]
 * @property {number} [yOffset]
 * @property {number} [width]
 * @property {number} [height]
 */

/**
 * Base properties shared by all field definitions.
 *
 * @typedef {object} BaseField
 * @property {string} id                 - Key under which this field’s value is stored on the card.
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
 * @typedef {BaseField & {
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
 * @property {function():Promise<object>} save       @internal @private
 * @property {function(object):Promise<void>} load   @internal @private
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


/**
 * Base class for Card Magician modules which provides utility
 * functions for loading assets, files, fonts and performing
 * graphical operations.
 */
export default class CardMagicianModule {
    /**
     * @param {CardFace} card - The card face this module is associated with.
     * @param {string} modulePath - Filesystem path of the module.
     */
    constructor(card, modulePath) {
        this.card = card;
        this.modulePath = modulePath;
        this.name = modulePath.split('/').pop();
    }

    /**
     * Returns a path for a file in this module's folder.
     *
     * @param {string} localPath - Path relative to the module's directory.
     * @returns {string} - Fully qualified path for the file.
     */
    resolvePath(localPath) {
        return ['modules', this.modulePath, localPath].join('/');
    }

    /**
     * Returns a path for a file in this module's assets folder.
     *
     * @param {string} assetPath - Path relative to the module's `assets` directory.
     * @returns {string} - Fully qualified path for the asset.
     */
    resolveAsset(assetPath) {
        return ['modules', this.modulePath, 'assets', assetPath].join('/');
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
        return await loadTextFile(this.resolvePath(localPath));
    }

    /**
     * Tints an image using a color mask.
     *
     * @async
     * @param {ImageOperation|string} source - The source image.
     * @param {HexColor} color - Hex color string (e.g. "#ff00aa").
     * @returns {ImageOperation} A deferred image operation.
     */
    maskColor(source, color) {
        return maskColorOp(source, color);
    }

    /**
     * Applies an alpha mask image to another image.
     *
     * @param {ImageOperation|string} source - The source image.
     * @param {ImageOperation|string} mask - The mask image.
     * @returns {ImageOperation} A deferred image operation.
     */
    maskImage(source, mask) {
        return maskImageOp(source, mask);
    }

    /**
     * Blends two images using a pixel-level blending mode.
     *
     * @param {ImageOperation|string} imgA - The first image.
     * @param {ImageOperation|string} imgB - The second image.
     * @param {BlendMode} [mode='symmetricOverlay'] - Name of the blend mode to use.
     * @returns {ImageOperation} A deferred image operation.
     */
    combineBlend(imgA, imgB, mode = 'symmetricOverlay') {
        return combineBlendOp(imgA, imgB, mode);
    }


    /**
     * Blends two images using a linear gradient between two points.
     *
     * @param {ImageOperation|string} imgA - First image.
     * @param {ImageOperation|string} imgB - Second image.
     * @param {number} x1 - Gradient start X (0–1 relative).
     * @param {number} y1 - Gradient start Y (0–1).
     * @param {number} x2 - Gradient end X (0–1).
     * @param {number} y2 - Gradient end Y (0–1).
     * @returns {ImageOperation} A deferred image operation.
     */
    linearBlend(imgA, imgB, x1, y1, x2, y2) {
        return linearBlendOp(imgA, imgB, x1, y1, x2, y2);
    }

    /**
     * Blends two images together using a mask image that controls pixel mixing.
     *
     * @async
     * @param {ImageOperation|string} imgToMask - The image whose pixels are blended.
     * @param {ImageOperation|string} baseImg - The base/background image.
     * @param {ImageOperation|string} mask - The mask image (uses red channel as mask).
     * @returns {ImageOperation} A deferred image operation.
     */
    maskedBlend(imgToMask, baseImg, mask) {
        return maskBlendOp(imgToMask, baseImg, mask);
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
     * Wraps an object in Alpine.js reactivity (deep reactive proxy).
     *
     * @param {object} obj - Object to make reactive.
     * @returns {object} The reactive proxy.
     */
    makeReactive(obj) {
        return Alpine.reactive(obj);
    }

    /**
     * Returns the current active set
     *
     * @returns {object}
     */
    getActiveSet() {
        return Alpine.store('views').activeSet;
    }

    /**
     * Returns the current active game
     *
     * @returns {object}
     */
    getActiveGame() {
        return Alpine.store('game');
    }

    /**
     * Sanitizes an input string using sanitize-html.
     *
     * @param {string} str - the string to sanitize
     * @param {object} options - sanitze HTML options
     * @returns {string}
     */
    sanitize(str, options) {
        return sanitizeHtml(str, options);
    }

    escapeHTML(str) {
        return escapeHTML(str);
    }

    objectToStyle(obj) {
        return Object.entries(obj)
            .map(([key, value]) => `${key.separate('-')}: ${value}`)
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
     * @abstract
     * @param {CardFace} card
     * @returns {Promise<void>|void}
     */
    async init(card) {}

    /**
     * Returns the card field definitions for this module.
     *
     * @abstract
     * @returns {Array<Field>}
     */
    get fields() { return []; }

    /**
     * Returns the option field definitions for this module.
     *
     * @abstract
     * @returns {Array<Field>}
     */
    get options() { return []; }

    /**
     * Returns CSS styles to be injected for this module.
     *
     * @abstract
     * @returns {Promise<Array<string>>|Array<string>}
     */
    async styles() { return []; }

    /**
     * Sets up reactive effects connecting card state to module behavior.
     *
     * @abstract
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
     * @abstract
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
     * @abstract
     * @param {CardFace} card
     * @returns {string|undefined}
     */
    renderNamed(card) {}
}
