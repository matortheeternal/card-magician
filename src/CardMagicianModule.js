import { getImageUrl, loadFont, loadTextFile } from './services/fsHelpers.js';
import {
    combineBlendUrl,
    linearBlendUrl,
    maskBlendUrl,
    maskColorUrl,
    maskImageUrl
} from './gfx/blending.js';
import Alpine from 'alpinejs';
import { loadImport } from './services/importService.js';

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
 * @property {string} displayName        - User-facing label.
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
 * INTERNAL:
 *   Some methods are internal to the module system and should generally
 *   not be used by modules.  These methods are marked @internal @private.
 *
 * @typedef {object} CardFace
 *
 * @property {string} id                             - Face key. e.g. 'front'
 * @property {HTMLElement} dom                       @internal @private
 * @property {Array<Field>} fields                   @internal @private
 * @property {Array<object>} form                    @internal @private
 * @property {Array<CardFace>} subCards              - Nested subcards.
 *
 * @property {function(Field):void} addField         @internal @private
 * @property {function(string):void} addStyle        @internal @private
 * @property {function(string):void} setFrame        @internal @private
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
     * @param {object} card - The card instance that owns this module.
     * @param {string} modulePath - Filesystem path of the module.
     */
    constructor(card, modulePath) {
        this.card = card;
        this.modulePath = modulePath;
        this.name = modulePath.split('/').pop();
    }

    /**
     * Returns a blob URL for an image in this module's assets folder.
     *
     * @async
     * @param {string} path - Path relative to the module's `assets` directory.
     * @returns {Promise<BlobURL|undefined>} Blob URL for the image, or undefined if missing.
     */
    async assetURL(path) {
        const filePath = ['modules', this.modulePath, 'assets', path].join('/');
        return await getImageUrl(filePath);
    }

    /**
     * Loads a text file from inside the module folder.
     * The file is cached on first read.
     *
     * @async
     * @param {string} filename - Filename relative to the module root.
     * @returns {Promise<string>} Resolves with the file's text content.
     */
    async loadFile(filename) {
        const filePath = ['modules', this.modulePath, filename].join('/');
        return await loadTextFile(filePath);
    }

    /**
     * Tints an image using a color mask.
     *
     * @async
     * @param {BlobURL} sourceUrl - Blob URL of the source image.
     * @param {HexColor} color - Hex color string (e.g. "#ff00aa").
     * @returns {Promise<BlobURL>} A blob URL for the resulting masked image.
     */
    async maskColor(sourceUrl, color) {
        return await maskColorUrl(sourceUrl, color);
    }

    /**
     * Applies an alpha mask image to another image.
     *
     * @async
     * @param {BlobURL} sourceUrl - Blob URL of the source image.
     * @param {BlobURL} maskUrl - Blob URL of the mask image.
     * @returns {Promise<BlobURL>} A blob URL containing the masked result.
     */
    async maskImage(sourceUrl, maskUrl) {
        return await maskImageUrl(sourceUrl, maskUrl);
    }

    /**
     * Blends two images using a pixel-level blending mode.
     *
     * @async
     * @param {BlobURL} imgUrlA - Blob URL of the first image.
     * @param {BlobURL} imgUrlB - Blob URL of the second image.
     * @param {BlendMode} [mode='symmetricOverlay'] - Name of the blend mode to use.
     * @returns {Promise<BlobURL>} A blob URL for the blended image.
     */
    async combineBlend(imgUrlA, imgUrlB, mode = 'symmetricOverlay') {
        return await combineBlendUrl(imgUrlA, imgUrlB, mode);
    }


    /**
     * Blends two images using a linear gradient between two points.
     *
     * @async
     * @param {BlobURL} imgUrlA - First image URL.
     * @param {BlobURL} imgUrlB - Second image URL.
     * @param {number} x1 - Gradient start X (0–1 relative).
     * @param {number} y1 - Gradient start Y (0–1).
     * @param {number} x2 - Gradient end X (0–1).
     * @param {number} y2 - Gradient end Y (0–1).
     * @returns {Promise<BlobURL>} Blob URL of the blended result.
     */
    async linearBlend(imgUrlA, imgUrlB, x1, y1, x2, y2) {
        return await linearBlendUrl(imgUrlA, imgUrlB, x1, y1, x2, y2);
    }

    /**
     * Blends two images together using a mask image that controls pixel mixing.
     *
     * @async
     * @param {BlobURL} imgToMaskUrl - URL of the image whose pixels are blended.
     * @param {BlobURL} baseImgUrl - URL of the base/background image.
     * @param {BlobURL} maskUrl - URL of the mask image (uses red channel as mask).
     * @returns {Promise<BlobURL>} Blob URL of the blended result.
     */
    async maskedBlend(imgToMaskUrl, baseImgUrl, maskUrl) {
        return await maskBlendUrl(imgToMaskUrl, baseImgUrl, maskUrl);
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
        const filePath = ['modules', this.modulePath, 'assets', localPath].join('/');
        await loadFont(fontName, filePath);
    }

    /**
     * Dynamically imports a JavaScript module from within this module folder.
     *
     * @async
     * @param {string} localPath - Module path relative to the module folder.
     * @returns {Promise<any>} The imported module or its default export.
     */
    async import(localPath) {
        const filePath = ['modules', this.modulePath, localPath].join('/');
        return await loadImport(filePath);
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
     * Returns all field definitions this module contributes
     * to the card form UI.
     *
     * @abstract
     * @returns {Array<Field>}
     */
    get fields() { return []; }

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

    /**
     * Returns the current active set 
     *
     * @returns {object}
     */
    getActiveSet() {
        return Alpine.store('views').activeSet;
    }
}
