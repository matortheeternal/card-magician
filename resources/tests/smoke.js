(() => {
  var __defProp = Object.defineProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  // src/startup.smoke.js
  describe("Startup", () => {
    it("loads the application UI", () => {
      expect(document.querySelector("cm-title-bar")).not.toBeNull();
      expect(document.querySelector("cm-display-card")).not.toBeNull();
      expect(document.querySelector("cm-set-view")).not.toBeNull();
      expect(document.querySelector("cm-card-form")).not.toBeNull();
      expect(document.querySelector("cm-mobile-actions")).not.toBeNull();
    });
  });

  // src/shared/neutralinoAdapter.js
  async function readFile(path) {
    log("fs").debug("readFile", path);
    return await Neutralino.filesystem.readFile(path);
  }
  async function writeFile(path, data) {
    log("fs").debug("writeFile", path, `${data.length} bytes`);
    const { parentPath } = await Neutralino.filesystem.getPathParts(path);
    await createDirectory(parentPath);
    await Neutralino.filesystem.writeFile(path, data);
  }
  async function getStats(path) {
    log("fs").debug("getStats", path);
    return await Neutralino.filesystem.getStats(path);
  }
  async function getJoinedPath(...paths) {
    log("fs").debug("getJoinedPath", paths);
    return await Neutralino.filesystem.getJoinedPath(...paths);
  }
  async function createDirectory(path) {
    log("fs").debug("createDirectory", path);
    try {
      await Neutralino.filesystem.createDirectory(path);
    } catch (error) {
      if (error.code !== "NE_FS_DIRCRER")
        throw new Error(`${error.code} ${error.message}`);
    }
  }
  async function rmrf(path) {
    log("fs").debug("remove", path);
    return await Neutralino.filesystem.remove(path);
  }
  function writeProcessOutput(data) {
    return Neutralino.app.writeProcessOutput(data);
  }
  function exitApp(code = 0) {
    Neutralino.app.exit(code);
  }

  // src/shared/imageUtils.js
  function getImageSize(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.onerror = (e) => reject(
        new Error(`Failed to load image ${url}, ${e.message}`)
      );
      img.src = url;
    });
  }

  // src/shared/fsUtils.js
  async function checkFileExists(filePath) {
    try {
      const stats = await getStats(filePath);
      return stats.isFile;
    } catch (error) {
      if (error.code === "NE_FS_NOPATHE") return false;
      throw error;
    }
  }

  // src/ui/systems/actionSystem.js
  window.actions || (window.actions = /* @__PURE__ */ new Map());
  function executeAction(id, ...args) {
    const action = window.actions.get(id);
    if (!action) throw new Error("Could not find action: " + id);
    return action(...args);
  }

  // src/shared/htmlUtils.js
  function esc(str) {
    return String(str ?? "").replace(/"/g, "&quot;");
  }

  // src/shared/testing/FieldInteractor.js
  var FieldInteractor = class {
    constructor(fieldId, faceKey) {
      this.fieldId = fieldId;
      this.faceKey = faceKey;
    }
    /**
     * @returns {FormField}
     */
    get formField() {
      if (!this._formField?.parentElement)
        this._formField = null;
      return this._formField || (this._formField = document.querySelector(
        `cm-face-form[data-face-id="${esc(this.faceKey)}"] form-field[field-id="${esc(this.fieldId)}"]`
      ));
    }
    get exists() {
      return Boolean(this.formField);
    }
    /**
     * @returns {FieldComponent}
     */
    get fieldElement() {
      if (!this.formField?.fieldElement)
        throw new Error(`Field ${this.fieldId} not found.`);
      return this.formField.fieldElement;
    }
    setValue(value) {
      return new Promise((resolve) => {
        this.fieldElement.addEventListener(
          "cm-field-changed",
          resolve,
          { once: true }
        );
        this.fieldElement.inputValue(value);
      });
    }
    get value() {
      return this.fieldElement.value;
    }
    clear() {
      this.fieldElement.clear();
    }
    remove() {
      if (!this.formField)
        throw new Error(`Field ${this.fieldId} does not exist.`);
      this.formField.toggleShow(false);
    }
  };

  // src/shared/testing/testUtils.js
  async function setCardFields(fields, faceKey = "front") {
    const changes = Object.entries(fields).map(([field, value]) => {
      const interactor = new FieldInteractor(field, faceKey);
      return interactor.setValue(value);
    });
    return Promise.all(changes);
  }
  async function createCard() {
    await executeAction("add-card");
    return selectedProjectCard;
  }
  var testIndex = 0;
  async function createTestProject() {
    const testProjectDir = await getJoinedPath(NL_DATAPATH, `test-${testIndex++}`);
    const projectFilePath = await getJoinedPath(testProjectDir, "test.cmproj");
    try {
      await rmrf(testProjectDir);
    } catch {
    }
    executeAction("new-project");
    await activeProject.setFilePath(projectFilePath);
    return activeProject;
  }
  async function deleteTestProject() {
    if (!activeProject.filePath.endsWith("test.cmproj"))
      throw new Error("Project file is not test.cmproj? Escaping.");
    try {
      await rmrf(activeProject.folderPath);
    } catch {
    }
  }
  function normalizeImage(image) {
    return {
      width: image.width,
      height: image.height,
      cropWidth: image.crop.width,
      cropHeight: image.crop.height,
      xOffset: image.crop.xOffset,
      yOffset: image.crop.yOffset
    };
  }
  function normalizeCardData(value) {
    if (Array.isArray(value))
      return value.map(normalizeCardData);
    if (value === null || typeof value !== "object")
      return value;
    if (value.constructor?.name === "ManaCost")
      return String(value);
    if (value.constructor?.name === "ImageFieldValue")
      return normalizeImage(value);
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        normalizeCardData(item)
      ])
    );
  }
  function expectCardData(actual, expected) {
    expect(normalizeCardData(actual)).toEqual(
      jasmine.objectContaining(expected)
    );
  }
  async function toggleFace(face) {
    const cardForm = document.querySelector("cm-card-form");
    await cardForm.toggleFace(face);
  }
  async function flushCard() {
    const cardForm = document.querySelector("cm-card-form");
    await cardForm.save.flush();
  }

  // src/domain/projects/adapters/SerializerAdapter.js
  var SerializerAdapter = class {
    constructor() {
      /**
       * Unique type identifier stored in the intermediate representation.
       * Subclasses must override this value.
       * @type {string}
       */
      __publicField(this, "nodeType", "BaseAdapter");
    }
    /**
     * Determine whether this adapter can encode the given value.
     *
     * @abstract
     * @param {any} value - The runtime value to inspect.
     * @returns {boolean} True if this adapter should encode the value.
     */
    canEncode(value) {
      throw new Error("canEncode() must be implemented by subclass");
    }
    /**
     * Determine whether this adapter can decode the given node.
     *
     * @abstract
     * @param {any} node - The intermediate node to inspect.
     * @returns {boolean} True if this adapter should encode the value.
     */
    canDecode(node) {
      throw new Error("canDecode() must be implemented by subclass");
    }
    /**
     * Encode a runtime value into an intermediate representation node.
     *
     * @abstract
     * @param {any} value - The value to encode.
     * @param {Serializer} serializer - The serializer instance.
     * @returns {Promise<object>} The encoded intermediate node.
     */
    async encode(value, serializer) {
      throw new Error("encode() must be implemented by subclass");
    }
    /**
     * Decode an intermediate representation node back into a runtime value.
     *
     * @abstract
     * @param {object} node - The encoded node.
     * @param {Serializer} serializer - The serializer instance.
     * @returns {Promise<any>} The decoded runtime value.
     */
    async decode(node, serializer) {
      throw new Error("decode() must be implemented by subclass");
    }
  };

  // src/domain/projects/adapters/ManaCostAdapter.js
  var ManaCostAdapter = class extends SerializerAdapter {
    constructor() {
      super(...arguments);
      __publicField(this, "nodeType", "ManaCost");
    }
    canEncode(value) {
      return value && value.constructor.name === "ManaCost";
    }
    canDecode(node) {
      return node.__type === this.nodeType;
    }
    /**
     * Encode a mana cost into an object
     * @param {ManaCost} manaCost
     * @returns {Promise<object>}
     */
    async encode(manaCost) {
      return {
        __type: this.nodeType,
        symbols: manaCost.toString()
      };
    }
    /**
     * Decode an object into a mana cost.
     *
     * @param {object} node
     * @returns {Promise<ManaCost>} A new mana cost.
     */
    async decode(node) {
      const { ManaCost } = activeGame.ManaScribe;
      return ManaCost.parse(node.symbols);
    }
  };

  // src/domain/card/ImageCrop.js
  var ImageCrop = class {
    constructor(width = 0, height = 0, xOffset = 0, yOffset = 0) {
      this.width = width;
      this.height = height;
      this.xOffset = xOffset;
      this.yOffset = yOffset;
    }
    static load(data) {
      return new this(
        data.cropWidth || data.width || 1,
        data.cropHeight || data.height || 1,
        data.xOffset || 0,
        data.yOffset || 0
      );
    }
    clamp(sourceWidth, sourceHeight, isMove) {
      const maxOffsetX = sourceWidth - (isMove ? this.width : 1);
      const maxOffsetY = sourceHeight - (isMove ? this.height : 1);
      this.xOffset = Math.max(0, Math.min(this.xOffset, maxOffsetX));
      this.yOffset = Math.max(0, Math.min(this.yOffset, maxOffsetY));
      const maxWidth = sourceWidth - this.xOffset;
      const maxHeight = sourceHeight - this.yOffset;
      this.width = Math.min(Math.max(this.width, 1), maxWidth);
      this.height = Math.min(Math.max(this.height, 1), maxHeight);
    }
    save() {
      return {
        cropWidth: this.width,
        cropHeight: this.height,
        xOffset: this.xOffset,
        yOffset: this.yOffset
      };
    }
    clone() {
      return new this.constructor(
        this.width,
        this.height,
        this.xOffset,
        this.yOffset
      );
    }
  };

  // src/ui/systems/objectUrlSystem.js
  var activeContext = null;
  function createURL(blob) {
    if (!activeContext) throw new Error("No active context");
    const url = URL.createObjectURL(blob);
    activeContext.trackedUrls.push(url);
    return url;
  }

  // src/domain/card/ImageFieldValue.js
  var ImageFieldValue = class {
    constructor(imageUrl = null, width = 0, height = 0, crop) {
      this.imageUrl = imageUrl;
      this.width = width;
      this.height = height;
      this.crop = crop || new ImageCrop();
    }
    static async fromFile(file) {
      const imageUrl = createURL(file);
      const { width, height } = await getImageSize(imageUrl);
      const crop = new ImageCrop(width, height);
      const value = new this(imageUrl, width, height, crop);
      value.dirty = true;
      return value;
    }
    static async load(data) {
      return new this(
        data.imageUrl,
        data.width || 0,
        data.height || 0,
        ImageCrop.load(data)
      );
    }
    async loadImageData() {
      if (!this.imageUrl) return null;
      return (await fetch(this.imageUrl)).arrayBuffer();
    }
    async save() {
      return {
        width: this.width,
        height: this.height,
        ...this.crop.save()
      };
    }
    clone() {
      const clone = new this.constructor(
        this.imageUrl,
        this.width,
        this.height,
        this.crop.clone()
      );
      clone.scale = this.scale;
      return clone;
    }
    applyCoordinateSpace(targetWidth, targetHeight) {
      this.scale = 1;
      if (targetWidth < this.width)
        this.scale = this.width / targetWidth;
      if (targetHeight < this.height)
        this.scale = Math.max(this.scale, this.height / targetHeight);
      this.width = Math.round(this.width * 10 / this.scale) / 10;
      this.height = Math.round(this.height * 10 / this.scale) / 10;
      this.crop.width = Math.round(this.crop.width * 10 / this.scale) / 10;
      this.crop.height = Math.round(this.crop.height * 10 / this.scale) / 10;
      this.crop.xOffset = Math.round(this.crop.xOffset * 10 / this.scale) / 10;
      this.crop.yOffset = Math.round(this.crop.yOffset * 10 / this.scale) / 10;
    }
    removeCoordinateSpace() {
      if (!this.scale) return;
      this.width = Math.round(this.width * this.scale);
      this.height = Math.round(this.height * this.scale);
      this.crop.width = Math.round(this.crop.width * this.scale);
      this.crop.height = Math.round(this.crop.height * this.scale);
      this.crop.xOffset = Math.round(this.crop.xOffset * this.scale);
      this.crop.yOffset = Math.round(this.crop.yOffset * this.scale);
      delete this.scale;
    }
  };

  // src/domain/projects/adapters/ImageFieldAdapter.js
  var ImageFieldAdapter = class extends SerializerAdapter {
    constructor() {
      super(...arguments);
      __publicField(this, "nodeType", "image");
    }
    canDecode(node) {
      return node.__type === this.nodeType;
    }
    canEncode(value) {
      return value instanceof ImageFieldValue;
    }
    /**
     * Encode an ImageFieldValue into an object.
     * @param {ImageFieldValue} value
     * @returns {Promise<object>}
     */
    async encode(value) {
      return {
        __type: this.nodeType,
        ...await value.save()
      };
    }
    /**
     * Decode an object into an ImageFieldValue.
     *
     * @param {object} node
     * @returns {Promise<ImageFieldValue>} A new ImageFieldValue.
     */
    async decode(node) {
      return ImageFieldValue.load(node);
    }
  };

  // src/domain/projects/adapters/ObjectUrlBinaryAdapter.js
  var ObjectUrlBinaryAdapter = class extends SerializerAdapter {
    constructor() {
      super(...arguments);
      __publicField(this, "nodeType", "ObjectURL");
    }
    canEncode(value) {
      return typeof value === "string" && value.startsWith("blob:");
    }
    canDecode(node) {
      return node.__type === this.nodeType;
    }
    /**
     * Encode a blob: URL into raw binary representation.
     * @param {string} url
     * @returns {Promise<object>}
     */
    async encode(url) {
      const response = await fetch(url);
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      return {
        __type: this.nodeType,
        mime: blob.type,
        binary: buffer
      };
    }
    /**
     * Decode raw binary into a blob: URL.
     *
     * @param {object|string} node
     * @returns {Promise<string>} A new blob: URL
     */
    async decode(node) {
      const bytes = new Uint8Array(node.binary);
      const blob = new Blob([bytes], { type: node.mime });
      return createURL(blob);
    }
  };

  // src/domain/projects/adapters/adapterRegistry.js
  var adapters = /* @__PURE__ */ new Set();
  var binaryAdapters = /* @__PURE__ */ new Set();
  function registerAdapter(Adapter) {
    adapters.add(new Adapter());
  }
  function registerBinaryAdapter(Adapter) {
    binaryAdapters.add(new Adapter());
  }
  function getAdapters() {
    return [...adapters];
  }
  registerAdapter(ImageFieldAdapter);
  registerAdapter(ManaCostAdapter);
  registerBinaryAdapter(ObjectUrlBinaryAdapter);

  // src/domain/projects/serializers/Serializer.js
  var Serializer = class {
    static matches(filePath) {
      return false;
    }
    static async save(filePath, data, options = {}) {
      const serializer = new this();
      const text = await serializer.serialize(data, options);
      await writeFile(filePath, text);
    }
    static async load(filePath) {
      const serializer = new this();
      const text = await readFile(filePath);
      return serializer.deserialize(text);
    }
    /**
     * @param {Array<SerializerAdapter>} [adapters=null]
     *   List of serialization adapters.
     */
    constructor(adapters2 = null) {
      this.adapters = adapters2 || getAdapters();
    }
    /**
     * Encode the intermediate representation into the final serialized form.
     * Subclasses must implement this.
     *
     * @abstract
     * @param {any} value - The intermediate representation.
     * @returns {Promise<any>}
     */
    async encode(value) {
      throw new Error("Not implemented");
    }
    /**
     * Decode a serialized payload into the intermediate representation.
     * Subclasses must implement this.
     *
     * @abstract
     * @param {any} value - The encoded payload.
     * @returns {Promise<any>}
     */
    async decode(value) {
      throw new Error("Not implemented");
    }
    /**
     * Serialize an object by converting it through intermediate representation
     * and then through the specific format encoder.
     *
     * @param {any} value - The object to serialize.
     * @param {object} options
     * @returns {Promise<any>} The serialized payload.
     */
    async serialize(value, options = {}) {
      const intermediate = await this.encodeNode(value);
      return this.encode(intermediate, options);
    }
    /**
     * Deserialize a payload by decoding the format and then reconstructing
     * the object graph using adapters.
     *
     * @param {any} value - Serialized payload.
     * @returns {Promise<any>} The fully reconstructed value.
     */
    async deserialize(value) {
      const intermediate = await this.decode(value);
      return this.decodeNode(intermediate);
    }
    /**
     * Encode a plain object (non-array, non-special-type).
     *
     * @param {object} value
     * @returns {Promise<object>}
     */
    async encodeObject(value) {
      const out = {};
      for (const [k, v] of Object.entries(value))
        out[k] = await this.encodeNode(v);
      return out;
    }
    /**
     * Encode an arbitrary value by detecting adapters or falling back to
     * object/array recursion.
     *
     * @param {any} value
     * @returns {Promise<any>}
     */
    async encodeNode(value) {
      for (const adapter of this.adapters) {
        if (adapter.canEncode(value))
          return adapter.encode(value, this);
      }
      if (Array.isArray(value))
        return Promise.all(value.map((v) => this.encodeNode(v)));
      if (value && typeof value === "object")
        return this.encodeObject(value);
      return value;
    }
    /**
     * Decode a plain object (non-array, non-adapted node).
     *
     * @param {object} node
     * @returns {Promise<object>}
     */
    async decodeObject(node) {
      const out = {};
      for (const [k, v] of Object.entries(node))
        out[k] = await this.decodeNode(v);
      return out;
    }
    /**
     * Decode an arbitrary node by using adapters or recursively descending
     * into arrays and objects.
     *
     * @param {any} node
     * @returns {Promise<any>}
     */
    async decodeNode(node) {
      if (!node) return node;
      const adapter = this.adapters.find((a) => a.canDecode(node));
      if (adapter) return adapter.decode(node, this);
      if (Array.isArray(node))
        return Promise.all(node.map((n) => this.decodeNode(n)));
      if (node && typeof node === "object")
        return this.decodeObject(node);
      return node;
    }
  };

  // node_modules/yaml/browser/dist/index.js
  var dist_exports = {};
  __export(dist_exports, {
    Alias: () => Alias,
    CST: () => cst_exports,
    Composer: () => Composer,
    Document: () => Document,
    Lexer: () => Lexer,
    LineCounter: () => LineCounter,
    Pair: () => Pair,
    Parser: () => Parser,
    Scalar: () => Scalar,
    Schema: () => Schema,
    YAMLError: () => YAMLError,
    YAMLMap: () => YAMLMap,
    YAMLParseError: () => YAMLParseError,
    YAMLSeq: () => YAMLSeq,
    YAMLWarning: () => YAMLWarning,
    isAlias: () => isAlias,
    isCollection: () => isCollection,
    isDocument: () => isDocument,
    isMap: () => isMap,
    isNode: () => isNode,
    isPair: () => isPair,
    isScalar: () => isScalar,
    isSeq: () => isSeq,
    parse: () => parse,
    parseAllDocuments: () => parseAllDocuments,
    parseDocument: () => parseDocument,
    stringify: () => stringify3,
    visit: () => visit,
    visitAsync: () => visitAsync
  });

  // node_modules/yaml/browser/dist/nodes/identity.js
  var ALIAS = /* @__PURE__ */ Symbol.for("yaml.alias");
  var DOC = /* @__PURE__ */ Symbol.for("yaml.document");
  var MAP = /* @__PURE__ */ Symbol.for("yaml.map");
  var PAIR = /* @__PURE__ */ Symbol.for("yaml.pair");
  var SCALAR = /* @__PURE__ */ Symbol.for("yaml.scalar");
  var SEQ = /* @__PURE__ */ Symbol.for("yaml.seq");
  var NODE_TYPE = /* @__PURE__ */ Symbol.for("yaml.node.type");
  var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
  var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
  var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
  var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
  var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
  var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
  function isCollection(node) {
    if (node && typeof node === "object")
      switch (node[NODE_TYPE]) {
        case MAP:
        case SEQ:
          return true;
      }
    return false;
  }
  function isNode(node) {
    if (node && typeof node === "object")
      switch (node[NODE_TYPE]) {
        case ALIAS:
        case MAP:
        case SCALAR:
        case SEQ:
          return true;
      }
    return false;
  }
  var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;

  // node_modules/yaml/browser/dist/visit.js
  var BREAK = /* @__PURE__ */ Symbol("break visit");
  var SKIP = /* @__PURE__ */ Symbol("skip children");
  var REMOVE = /* @__PURE__ */ Symbol("remove node");
  function visit(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if (isDocument(node)) {
      const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
      if (cd === REMOVE)
        node.contents = null;
    } else
      visit_(null, node, visitor_, Object.freeze([]));
  }
  visit.BREAK = BREAK;
  visit.SKIP = SKIP;
  visit.REMOVE = REMOVE;
  function visit_(key, node, visitor, path) {
    const ctrl = callVisitor(key, node, visitor, path);
    if (isNode(ctrl) || isPair(ctrl)) {
      replaceNode(key, path, ctrl);
      return visit_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== "symbol") {
      if (isCollection(node)) {
        path = Object.freeze(path.concat(node));
        for (let i = 0; i < node.items.length; ++i) {
          const ci = visit_(i, node.items[i], visitor, path);
          if (typeof ci === "number")
            i = ci - 1;
          else if (ci === BREAK)
            return BREAK;
          else if (ci === REMOVE) {
            node.items.splice(i, 1);
            i -= 1;
          }
        }
      } else if (isPair(node)) {
        path = Object.freeze(path.concat(node));
        const ck = visit_("key", node.key, visitor, path);
        if (ck === BREAK)
          return BREAK;
        else if (ck === REMOVE)
          node.key = null;
        const cv = visit_("value", node.value, visitor, path);
        if (cv === BREAK)
          return BREAK;
        else if (cv === REMOVE)
          node.value = null;
      }
    }
    return ctrl;
  }
  async function visitAsync(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if (isDocument(node)) {
      const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
      if (cd === REMOVE)
        node.contents = null;
    } else
      await visitAsync_(null, node, visitor_, Object.freeze([]));
  }
  visitAsync.BREAK = BREAK;
  visitAsync.SKIP = SKIP;
  visitAsync.REMOVE = REMOVE;
  async function visitAsync_(key, node, visitor, path) {
    const ctrl = await callVisitor(key, node, visitor, path);
    if (isNode(ctrl) || isPair(ctrl)) {
      replaceNode(key, path, ctrl);
      return visitAsync_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== "symbol") {
      if (isCollection(node)) {
        path = Object.freeze(path.concat(node));
        for (let i = 0; i < node.items.length; ++i) {
          const ci = await visitAsync_(i, node.items[i], visitor, path);
          if (typeof ci === "number")
            i = ci - 1;
          else if (ci === BREAK)
            return BREAK;
          else if (ci === REMOVE) {
            node.items.splice(i, 1);
            i -= 1;
          }
        }
      } else if (isPair(node)) {
        path = Object.freeze(path.concat(node));
        const ck = await visitAsync_("key", node.key, visitor, path);
        if (ck === BREAK)
          return BREAK;
        else if (ck === REMOVE)
          node.key = null;
        const cv = await visitAsync_("value", node.value, visitor, path);
        if (cv === BREAK)
          return BREAK;
        else if (cv === REMOVE)
          node.value = null;
      }
    }
    return ctrl;
  }
  function initVisitor(visitor) {
    if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
      return Object.assign({
        Alias: visitor.Node,
        Map: visitor.Node,
        Scalar: visitor.Node,
        Seq: visitor.Node
      }, visitor.Value && {
        Map: visitor.Value,
        Scalar: visitor.Value,
        Seq: visitor.Value
      }, visitor.Collection && {
        Map: visitor.Collection,
        Seq: visitor.Collection
      }, visitor);
    }
    return visitor;
  }
  function callVisitor(key, node, visitor, path) {
    if (typeof visitor === "function")
      return visitor(key, node, path);
    if (isMap(node))
      return visitor.Map?.(key, node, path);
    if (isSeq(node))
      return visitor.Seq?.(key, node, path);
    if (isPair(node))
      return visitor.Pair?.(key, node, path);
    if (isScalar(node))
      return visitor.Scalar?.(key, node, path);
    if (isAlias(node))
      return visitor.Alias?.(key, node, path);
    return void 0;
  }
  function replaceNode(key, path, node) {
    const parent = path[path.length - 1];
    if (isCollection(parent)) {
      parent.items[key] = node;
    } else if (isPair(parent)) {
      if (key === "key")
        parent.key = node;
      else
        parent.value = node;
    } else if (isDocument(parent)) {
      parent.contents = node;
    } else {
      const pt = isAlias(parent) ? "alias" : "scalar";
      throw new Error(`Cannot replace node with ${pt} parent`);
    }
  }

  // node_modules/yaml/browser/dist/doc/directives.js
  var escapeChars = {
    "!": "%21",
    ",": "%2C",
    "[": "%5B",
    "]": "%5D",
    "{": "%7B",
    "}": "%7D"
  };
  var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
  var Directives = class _Directives {
    constructor(yaml, tags) {
      this.docStart = null;
      this.docEnd = false;
      this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
      this.tags = Object.assign({}, _Directives.defaultTags, tags);
    }
    clone() {
      const copy = new _Directives(this.yaml, this.tags);
      copy.docStart = this.docStart;
      return copy;
    }
    /**
     * During parsing, get a Directives instance for the current document and
     * update the stream state according to the current version's spec.
     */
    atDocument() {
      const res = new _Directives(this.yaml, this.tags);
      switch (this.yaml.version) {
        case "1.1":
          this.atNextDocument = true;
          break;
        case "1.2":
          this.atNextDocument = false;
          this.yaml = {
            explicit: _Directives.defaultYaml.explicit,
            version: "1.2"
          };
          this.tags = Object.assign({}, _Directives.defaultTags);
          break;
      }
      return res;
    }
    /**
     * @param onError - May be called even if the action was successful
     * @returns `true` on success
     */
    add(line, onError) {
      if (this.atNextDocument) {
        this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
        this.tags = Object.assign({}, _Directives.defaultTags);
        this.atNextDocument = false;
      }
      const parts = line.trim().split(/[ \t]+/);
      const name = parts.shift();
      switch (name) {
        case "%TAG": {
          if (parts.length !== 2) {
            onError(0, "%TAG directive should contain exactly two parts");
            if (parts.length < 2)
              return false;
          }
          const [handle, prefix] = parts;
          this.tags[handle] = prefix;
          return true;
        }
        case "%YAML": {
          this.yaml.explicit = true;
          if (parts.length !== 1) {
            onError(0, "%YAML directive should contain exactly one part");
            return false;
          }
          const [version] = parts;
          if (version === "1.1" || version === "1.2") {
            this.yaml.version = version;
            return true;
          } else {
            const isValid = /^\d+\.\d+$/.test(version);
            onError(6, `Unsupported YAML version ${version}`, isValid);
            return false;
          }
        }
        default:
          onError(0, `Unknown directive ${name}`, true);
          return false;
      }
    }
    /**
     * Resolves a tag, matching handles to those defined in %TAG directives.
     *
     * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
     *   `'!local'` tag, or `null` if unresolvable.
     */
    tagName(source, onError) {
      if (source === "!")
        return "!";
      if (source[0] !== "!") {
        onError(`Not a valid tag: ${source}`);
        return null;
      }
      if (source[1] === "<") {
        const verbatim = source.slice(2, -1);
        if (verbatim === "!" || verbatim === "!!") {
          onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
          return null;
        }
        if (source[source.length - 1] !== ">")
          onError("Verbatim tags must end with a >");
        return verbatim;
      }
      const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
      if (!suffix)
        onError(`The ${source} tag has no suffix`);
      const prefix = this.tags[handle];
      if (prefix) {
        try {
          return prefix + decodeURIComponent(suffix);
        } catch (error) {
          onError(String(error));
          return null;
        }
      }
      if (handle === "!")
        return source;
      onError(`Could not resolve tag: ${source}`);
      return null;
    }
    /**
     * Given a fully resolved tag, returns its printable string form,
     * taking into account current tag prefixes and defaults.
     */
    tagString(tag) {
      for (const [handle, prefix] of Object.entries(this.tags)) {
        if (tag.startsWith(prefix))
          return handle + escapeTagName(tag.substring(prefix.length));
      }
      return tag[0] === "!" ? tag : `!<${tag}>`;
    }
    toString(doc) {
      const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
      const tagEntries = Object.entries(this.tags);
      let tagNames;
      if (doc && tagEntries.length > 0 && isNode(doc.contents)) {
        const tags = {};
        visit(doc.contents, (_key, node) => {
          if (isNode(node) && node.tag)
            tags[node.tag] = true;
        });
        tagNames = Object.keys(tags);
      } else
        tagNames = [];
      for (const [handle, prefix] of tagEntries) {
        if (handle === "!!" && prefix === "tag:yaml.org,2002:")
          continue;
        if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
          lines.push(`%TAG ${handle} ${prefix}`);
      }
      return lines.join("\n");
    }
  };
  Directives.defaultYaml = { explicit: false, version: "1.2" };
  Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };

  // node_modules/yaml/browser/dist/doc/anchors.js
  function anchorIsValid(anchor) {
    if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
      const sa = JSON.stringify(anchor);
      const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
      throw new Error(msg);
    }
    return true;
  }
  function anchorNames(root) {
    const anchors = /* @__PURE__ */ new Set();
    visit(root, {
      Value(_key, node) {
        if (node.anchor)
          anchors.add(node.anchor);
      }
    });
    return anchors;
  }
  function findNewAnchor(prefix, exclude) {
    for (let i = 1; true; ++i) {
      const name = `${prefix}${i}`;
      if (!exclude.has(name))
        return name;
    }
  }
  function createNodeAnchors(doc, prefix) {
    const aliasObjects = [];
    const sourceObjects = /* @__PURE__ */ new Map();
    let prevAnchors = null;
    return {
      onAnchor: (source) => {
        aliasObjects.push(source);
        prevAnchors ?? (prevAnchors = anchorNames(doc));
        const anchor = findNewAnchor(prefix, prevAnchors);
        prevAnchors.add(anchor);
        return anchor;
      },
      /**
       * With circular references, the source node is only resolved after all
       * of its child nodes are. This is why anchors are set only after all of
       * the nodes have been created.
       */
      setAnchors: () => {
        for (const source of aliasObjects) {
          const ref = sourceObjects.get(source);
          if (typeof ref === "object" && ref.anchor && (isScalar(ref.node) || isCollection(ref.node))) {
            ref.node.anchor = ref.anchor;
          } else {
            const error = new Error("Failed to resolve repeated object (this should not happen)");
            error.source = source;
            throw error;
          }
        }
      },
      sourceObjects
    };
  }

  // node_modules/yaml/browser/dist/doc/applyReviver.js
  function applyReviver(reviver, obj, key, val) {
    if (val && typeof val === "object") {
      if (Array.isArray(val)) {
        for (let i = 0, len = val.length; i < len; ++i) {
          const v0 = val[i];
          const v1 = applyReviver(reviver, val, String(i), v0);
          if (v1 === void 0)
            delete val[i];
          else if (v1 !== v0)
            val[i] = v1;
        }
      } else if (val instanceof Map) {
        for (const k of Array.from(val.keys())) {
          const v0 = val.get(k);
          const v1 = applyReviver(reviver, val, k, v0);
          if (v1 === void 0)
            val.delete(k);
          else if (v1 !== v0)
            val.set(k, v1);
        }
      } else if (val instanceof Set) {
        for (const v0 of Array.from(val)) {
          const v1 = applyReviver(reviver, val, v0, v0);
          if (v1 === void 0)
            val.delete(v0);
          else if (v1 !== v0) {
            val.delete(v0);
            val.add(v1);
          }
        }
      } else {
        for (const [k, v0] of Object.entries(val)) {
          const v1 = applyReviver(reviver, val, k, v0);
          if (v1 === void 0)
            delete val[k];
          else if (v1 !== v0)
            val[k] = v1;
        }
      }
    }
    return reviver.call(obj, key, val);
  }

  // node_modules/yaml/browser/dist/nodes/toJS.js
  function toJS(value, arg, ctx) {
    if (Array.isArray(value))
      return value.map((v, i) => toJS(v, String(i), ctx));
    if (value && typeof value.toJSON === "function") {
      if (!ctx || !hasAnchor(value))
        return value.toJSON(arg, ctx);
      const data = { aliasCount: 0, count: 1, res: void 0 };
      ctx.anchors.set(value, data);
      ctx.onCreate = (res2) => {
        data.res = res2;
        delete ctx.onCreate;
      };
      const res = value.toJSON(arg, ctx);
      if (ctx.onCreate)
        ctx.onCreate(res);
      return res;
    }
    if (typeof value === "bigint" && !ctx?.keep)
      return Number(value);
    return value;
  }

  // node_modules/yaml/browser/dist/nodes/Node.js
  var NodeBase = class {
    constructor(type) {
      Object.defineProperty(this, NODE_TYPE, { value: type });
    }
    /** Create a copy of this node.  */
    clone() {
      const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      if (this.range)
        copy.range = this.range.slice();
      return copy;
    }
    /** A plain JavaScript representation of this node. */
    toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
      if (!isDocument(doc))
        throw new TypeError("A document argument is required");
      const ctx = {
        anchors: /* @__PURE__ */ new Map(),
        doc,
        keep: true,
        mapAsMap: mapAsMap === true,
        mapKeyWarned: false,
        maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
      };
      const res = toJS(this, "", ctx);
      if (typeof onAnchor === "function")
        for (const { count, res: res2 } of ctx.anchors.values())
          onAnchor(res2, count);
      return typeof reviver === "function" ? applyReviver(reviver, { "": res }, "", res) : res;
    }
  };

  // node_modules/yaml/browser/dist/nodes/Alias.js
  var Alias = class extends NodeBase {
    constructor(source) {
      super(ALIAS);
      this.source = source;
      Object.defineProperty(this, "tag", {
        set() {
          throw new Error("Alias nodes cannot have tags");
        }
      });
    }
    /**
     * Resolve the value of this alias within `doc`, finding the last
     * instance of the `source` anchor before this node.
     */
    resolve(doc, ctx) {
      if (ctx?.maxAliasCount === 0)
        throw new ReferenceError("Alias resolution is disabled");
      let nodes;
      if (ctx?.aliasResolveCache) {
        nodes = ctx.aliasResolveCache;
      } else {
        nodes = [];
        visit(doc, {
          Node: (_key, node) => {
            if (isAlias(node) || hasAnchor(node))
              nodes.push(node);
          }
        });
        if (ctx)
          ctx.aliasResolveCache = nodes;
      }
      let found = void 0;
      for (const node of nodes) {
        if (node === this)
          break;
        if (node.anchor === this.source)
          found = node;
      }
      return found;
    }
    toJSON(_arg, ctx) {
      if (!ctx)
        return { source: this.source };
      const { anchors, doc, maxAliasCount } = ctx;
      const source = this.resolve(doc, ctx);
      if (!source) {
        const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new ReferenceError(msg);
      }
      let data = anchors.get(source);
      if (!data) {
        toJS(source, null, ctx);
        data = anchors.get(source);
      }
      if (data?.res === void 0) {
        const msg = "This should not happen: Alias anchor was not resolved?";
        throw new ReferenceError(msg);
      }
      if (maxAliasCount >= 0) {
        data.count += 1;
        if (data.aliasCount === 0)
          data.aliasCount = getAliasCount(doc, source, anchors);
        if (data.count * data.aliasCount > maxAliasCount) {
          const msg = "Excessive alias count indicates a resource exhaustion attack";
          throw new ReferenceError(msg);
        }
      }
      return data.res;
    }
    toString(ctx, _onComment, _onChompKeep) {
      const src = `*${this.source}`;
      if (ctx) {
        anchorIsValid(this.source);
        if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new Error(msg);
        }
        if (ctx.implicitKey)
          return `${src} `;
      }
      return src;
    }
  };
  function getAliasCount(doc, node, anchors) {
    if (isAlias(node)) {
      const source = node.resolve(doc);
      const anchor = anchors && source && anchors.get(source);
      return anchor ? anchor.count * anchor.aliasCount : 0;
    } else if (isCollection(node)) {
      let count = 0;
      for (const item of node.items) {
        const c = getAliasCount(doc, item, anchors);
        if (c > count)
          count = c;
      }
      return count;
    } else if (isPair(node)) {
      const kc = getAliasCount(doc, node.key, anchors);
      const vc = getAliasCount(doc, node.value, anchors);
      return Math.max(kc, vc);
    }
    return 1;
  }

  // node_modules/yaml/browser/dist/nodes/Scalar.js
  var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
  var Scalar = class extends NodeBase {
    constructor(value) {
      super(SCALAR);
      this.value = value;
    }
    toJSON(arg, ctx) {
      return ctx?.keep ? this.value : toJS(this.value, arg, ctx);
    }
    toString() {
      return String(this.value);
    }
  };
  Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
  Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
  Scalar.PLAIN = "PLAIN";
  Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
  Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";

  // node_modules/yaml/browser/dist/doc/createNode.js
  var defaultTagPrefix = "tag:yaml.org,2002:";
  function findTagObject(value, tagName, tags) {
    if (tagName) {
      const match = tags.filter((t) => t.tag === tagName);
      const tagObj = match.find((t) => !t.format) ?? match[0];
      if (!tagObj)
        throw new Error(`Tag ${tagName} not found`);
      return tagObj;
    }
    return tags.find((t) => t.identify?.(value) && !t.format);
  }
  function createNode(value, tagName, ctx) {
    if (isDocument(value))
      value = value.contents;
    if (isNode(value))
      return value;
    if (isPair(value)) {
      const map2 = ctx.schema[MAP].createNode?.(ctx.schema, null, ctx);
      map2.items.push(value);
      return map2;
    }
    if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
      value = value.valueOf();
    }
    const { aliasDuplicateObjects, onAnchor, onTagObj, schema: schema4, sourceObjects } = ctx;
    let ref = void 0;
    if (aliasDuplicateObjects && value && typeof value === "object") {
      ref = sourceObjects.get(value);
      if (ref) {
        ref.anchor ?? (ref.anchor = onAnchor(value));
        return new Alias(ref.anchor);
      } else {
        ref = { anchor: null, node: null };
        sourceObjects.set(value, ref);
      }
    }
    if (tagName?.startsWith("!!"))
      tagName = defaultTagPrefix + tagName.slice(2);
    let tagObj = findTagObject(value, tagName, schema4.tags);
    if (!tagObj) {
      if (value && typeof value.toJSON === "function") {
        value = value.toJSON();
      }
      if (!value || typeof value !== "object") {
        const node2 = new Scalar(value);
        if (ref)
          ref.node = node2;
        return node2;
      }
      tagObj = value instanceof Map ? schema4[MAP] : Symbol.iterator in Object(value) ? schema4[SEQ] : schema4[MAP];
    }
    if (onTagObj) {
      onTagObj(tagObj);
      delete ctx.onTagObj;
    }
    const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar(value);
    if (tagName)
      node.tag = tagName;
    else if (!tagObj.default)
      node.tag = tagObj.tag;
    if (ref)
      ref.node = node;
    return node;
  }

  // node_modules/yaml/browser/dist/nodes/Collection.js
  function collectionFromPath(schema4, path, value) {
    let v = value;
    for (let i = path.length - 1; i >= 0; --i) {
      const k = path[i];
      if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
        const a = [];
        a[k] = v;
        v = a;
      } else {
        v = /* @__PURE__ */ new Map([[k, v]]);
      }
    }
    return createNode(v, void 0, {
      aliasDuplicateObjects: false,
      keepUndefined: false,
      onAnchor: () => {
        throw new Error("This should not happen, please report a bug.");
      },
      schema: schema4,
      sourceObjects: /* @__PURE__ */ new Map()
    });
  }
  var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;
  var Collection = class extends NodeBase {
    constructor(type, schema4) {
      super(type);
      Object.defineProperty(this, "schema", {
        value: schema4,
        configurable: true,
        enumerable: false,
        writable: true
      });
    }
    /**
     * Create a copy of this collection.
     *
     * @param schema - If defined, overwrites the original's schema
     */
    clone(schema4) {
      const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      if (schema4)
        copy.schema = schema4;
      copy.items = copy.items.map((it2) => isNode(it2) || isPair(it2) ? it2.clone(schema4) : it2);
      if (this.range)
        copy.range = this.range.slice();
      return copy;
    }
    /**
     * Adds a value to the collection. For `!!map` and `!!omap` the value must
     * be a Pair instance or a `{ key, value }` object, which may not have a key
     * that already exists in the map.
     */
    addIn(path, value) {
      if (isEmptyPath(path))
        this.add(value);
      else {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (isCollection(node))
          node.addIn(rest, value);
        else if (node === void 0 && this.schema)
          this.set(key, collectionFromPath(this.schema, rest, value));
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
    }
    /**
     * Removes a value from the collection.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(path) {
      const [key, ...rest] = path;
      if (rest.length === 0)
        return this.delete(key);
      const node = this.get(key, true);
      if (isCollection(node))
        return node.deleteIn(rest);
      else
        throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(path, keepScalar) {
      const [key, ...rest] = path;
      const node = this.get(key, true);
      if (rest.length === 0)
        return !keepScalar && isScalar(node) ? node.value : node;
      else
        return isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
    }
    hasAllNullValues(allowScalar) {
      return this.items.every((node) => {
        if (!isPair(node))
          return false;
        const n = node.value;
        return n == null || allowScalar && isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
      });
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     */
    hasIn(path) {
      const [key, ...rest] = path;
      if (rest.length === 0)
        return this.has(key);
      const node = this.get(key, true);
      return isCollection(node) ? node.hasIn(rest) : false;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(path, value) {
      const [key, ...rest] = path;
      if (rest.length === 0) {
        this.set(key, value);
      } else {
        const node = this.get(key, true);
        if (isCollection(node))
          node.setIn(rest, value);
        else if (node === void 0 && this.schema)
          this.set(key, collectionFromPath(this.schema, rest, value));
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
    }
  };

  // node_modules/yaml/browser/dist/stringify/stringifyComment.js
  var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
  function indentComment(comment, indent2) {
    if (/^\n+$/.test(comment))
      return comment.substring(1);
    return indent2 ? comment.replace(/^(?! *$)/gm, indent2) : comment;
  }
  var lineComment = (str, indent2, comment) => str.endsWith("\n") ? indentComment(comment, indent2) : comment.includes("\n") ? "\n" + indentComment(comment, indent2) : (str.endsWith(" ") ? "" : " ") + comment;

  // node_modules/yaml/browser/dist/stringify/foldFlowLines.js
  var FOLD_FLOW = "flow";
  var FOLD_BLOCK = "block";
  var FOLD_QUOTED = "quoted";
  function foldFlowLines(text, indent2, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
    if (!lineWidth || lineWidth < 0)
      return text;
    if (lineWidth < minContentWidth)
      minContentWidth = 0;
    const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent2.length);
    if (text.length <= endStep)
      return text;
    const folds = [];
    const escapedFolds = {};
    let end = lineWidth - indent2.length;
    if (typeof indentAtStart === "number") {
      if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
        folds.push(0);
      else
        end = lineWidth - indentAtStart;
    }
    let split = void 0;
    let prev = void 0;
    let overflow = false;
    let i = -1;
    let escStart = -1;
    let escEnd = -1;
    if (mode === FOLD_BLOCK) {
      i = consumeMoreIndentedLines(text, i, indent2.length);
      if (i !== -1)
        end = i + endStep;
    }
    for (let ch; ch = text[i += 1]; ) {
      if (mode === FOLD_QUOTED && ch === "\\") {
        escStart = i;
        switch (text[i + 1]) {
          case "x":
            i += 3;
            break;
          case "u":
            i += 5;
            break;
          case "U":
            i += 9;
            break;
          default:
            i += 1;
        }
        escEnd = i;
      }
      if (ch === "\n") {
        if (mode === FOLD_BLOCK)
          i = consumeMoreIndentedLines(text, i, indent2.length);
        end = i + indent2.length + endStep;
        split = void 0;
      } else {
        if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
          const next = text[i + 1];
          if (next && next !== " " && next !== "\n" && next !== "	")
            split = i;
        }
        if (i >= end) {
          if (split) {
            folds.push(split);
            end = split + endStep;
            split = void 0;
          } else if (mode === FOLD_QUOTED) {
            while (prev === " " || prev === "	") {
              prev = ch;
              ch = text[i += 1];
              overflow = true;
            }
            const j = i > escEnd + 1 ? i - 2 : escStart - 1;
            if (escapedFolds[j])
              return text;
            folds.push(j);
            escapedFolds[j] = true;
            end = j + endStep;
            split = void 0;
          } else {
            overflow = true;
          }
        }
      }
      prev = ch;
    }
    if (overflow && onOverflow)
      onOverflow();
    if (folds.length === 0)
      return text;
    if (onFold)
      onFold();
    let res = text.slice(0, folds[0]);
    for (let i2 = 0; i2 < folds.length; ++i2) {
      const fold = folds[i2];
      const end2 = folds[i2 + 1] || text.length;
      if (fold === 0)
        res = `
${indent2}${text.slice(0, end2)}`;
      else {
        if (mode === FOLD_QUOTED && escapedFolds[fold])
          res += `${text[fold]}\\`;
        res += `
${indent2}${text.slice(fold + 1, end2)}`;
      }
    }
    return res;
  }
  function consumeMoreIndentedLines(text, i, indent2) {
    let end = i;
    let start = i + 1;
    let ch = text[start];
    while (ch === " " || ch === "	") {
      if (i < start + indent2) {
        ch = text[++i];
      } else {
        do {
          ch = text[++i];
        } while (ch && ch !== "\n");
        end = i;
        start = i + 1;
        ch = text[start];
      }
    }
    return end;
  }

  // node_modules/yaml/browser/dist/stringify/stringifyString.js
  var getFoldOptions = (ctx, isBlock2) => ({
    indentAtStart: isBlock2 ? ctx.indent.length : ctx.indentAtStart,
    lineWidth: ctx.options.lineWidth,
    minContentWidth: ctx.options.minContentWidth
  });
  var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
  function lineLengthOverLimit(str, lineWidth, indentLength) {
    if (!lineWidth || lineWidth < 0)
      return false;
    const limit = lineWidth - indentLength;
    const strLen = str.length;
    if (strLen <= limit)
      return false;
    for (let i = 0, start = 0; i < strLen; ++i) {
      if (str[i] === "\n") {
        if (i - start > limit)
          return true;
        start = i + 1;
        if (strLen - start <= limit)
          return false;
      }
    }
    return true;
  }
  function doubleQuotedString(value, ctx) {
    const json = JSON.stringify(value);
    if (ctx.options.doubleQuotedAsJSON)
      return json;
    const { implicitKey } = ctx;
    const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
    const indent2 = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
    let str = "";
    let start = 0;
    for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
      if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
        str += json.slice(start, i) + "\\ ";
        i += 1;
        start = i;
        ch = "\\";
      }
      if (ch === "\\")
        switch (json[i + 1]) {
          case "u":
            {
              str += json.slice(start, i);
              const code = json.substr(i + 2, 4);
              switch (code) {
                case "0000":
                  str += "\\0";
                  break;
                case "0007":
                  str += "\\a";
                  break;
                case "000b":
                  str += "\\v";
                  break;
                case "001b":
                  str += "\\e";
                  break;
                case "0085":
                  str += "\\N";
                  break;
                case "00a0":
                  str += "\\_";
                  break;
                case "2028":
                  str += "\\L";
                  break;
                case "2029":
                  str += "\\P";
                  break;
                default:
                  if (code.substr(0, 2) === "00")
                    str += "\\x" + code.substr(2);
                  else
                    str += json.substr(i, 6);
              }
              i += 5;
              start = i + 1;
            }
            break;
          case "n":
            if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
              i += 1;
            } else {
              str += json.slice(start, i) + "\n\n";
              while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
                str += "\n";
                i += 2;
              }
              str += indent2;
              if (json[i + 2] === " ")
                str += "\\";
              i += 1;
              start = i + 1;
            }
            break;
          default:
            i += 1;
        }
    }
    str = start ? str + json.slice(start) : json;
    return implicitKey ? str : foldFlowLines(str, indent2, FOLD_QUOTED, getFoldOptions(ctx, false));
  }
  function singleQuotedString(value, ctx) {
    if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
      return doubleQuotedString(value, ctx);
    const indent2 = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
    const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent2}`) + "'";
    return ctx.implicitKey ? res : foldFlowLines(res, indent2, FOLD_FLOW, getFoldOptions(ctx, false));
  }
  function quotedString(value, ctx) {
    const { singleQuote } = ctx.options;
    let qs;
    if (singleQuote === false)
      qs = doubleQuotedString;
    else {
      const hasDouble = value.includes('"');
      const hasSingle = value.includes("'");
      if (hasDouble && !hasSingle)
        qs = singleQuotedString;
      else if (hasSingle && !hasDouble)
        qs = doubleQuotedString;
      else
        qs = singleQuote ? singleQuotedString : doubleQuotedString;
    }
    return qs(value, ctx);
  }
  var blockEndNewlines;
  try {
    blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
  } catch {
    blockEndNewlines = /\n+(?!\n|$)/g;
  }
  function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
    const { blockQuote, commentString, lineWidth } = ctx.options;
    if (!blockQuote || /\n[\t ]+$/.test(value)) {
      return quotedString(value, ctx);
    }
    const indent2 = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
    const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.BLOCK_FOLDED ? false : type === Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent2.length);
    if (!value)
      return literal ? "|\n" : ">\n";
    let chomp;
    let endStart;
    for (endStart = value.length; endStart > 0; --endStart) {
      const ch = value[endStart - 1];
      if (ch !== "\n" && ch !== "	" && ch !== " ")
        break;
    }
    let end = value.substring(endStart);
    const endNlPos = end.indexOf("\n");
    if (endNlPos === -1) {
      chomp = "-";
    } else if (value === end || endNlPos !== end.length - 1) {
      chomp = "+";
      if (onChompKeep)
        onChompKeep();
    } else {
      chomp = "";
    }
    if (end) {
      value = value.slice(0, -end.length);
      if (end[end.length - 1] === "\n")
        end = end.slice(0, -1);
      end = end.replace(blockEndNewlines, `$&${indent2}`);
    }
    let startWithSpace = false;
    let startEnd;
    let startNlPos = -1;
    for (startEnd = 0; startEnd < value.length; ++startEnd) {
      const ch = value[startEnd];
      if (ch === " ")
        startWithSpace = true;
      else if (ch === "\n")
        startNlPos = startEnd;
      else
        break;
    }
    let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
    if (start) {
      value = value.substring(start.length);
      start = start.replace(/\n+/g, `$&${indent2}`);
    }
    const indentSize = indent2 ? "2" : "1";
    let header = (startWithSpace ? indentSize : "") + chomp;
    if (comment) {
      header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
      if (onComment)
        onComment();
    }
    if (!literal) {
      const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent2}`);
      let literalFallback = false;
      const foldOptions = getFoldOptions(ctx, true);
      if (blockQuote !== "folded" && type !== Scalar.BLOCK_FOLDED) {
        foldOptions.onOverflow = () => {
          literalFallback = true;
        };
      }
      const body = foldFlowLines(`${start}${foldedValue}${end}`, indent2, FOLD_BLOCK, foldOptions);
      if (!literalFallback)
        return `>${header}
${indent2}${body}`;
    }
    value = value.replace(/\n+/g, `$&${indent2}`);
    return `|${header}
${indent2}${start}${value}${end}`;
  }
  function plainString(item, ctx, onComment, onChompKeep) {
    const { type, value } = item;
    const { actualString, implicitKey, indent: indent2, indentStep, inFlow } = ctx;
    if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
      return quotedString(value, ctx);
    }
    if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
      return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
    }
    if (!implicitKey && !inFlow && type !== Scalar.PLAIN && value.includes("\n")) {
      return blockString(item, ctx, onComment, onChompKeep);
    }
    if (containsDocumentMarker(value)) {
      if (indent2 === "") {
        ctx.forceBlockIndent = true;
        return blockString(item, ctx, onComment, onChompKeep);
      } else if (implicitKey && indent2 === indentStep) {
        return quotedString(value, ctx);
      }
    }
    const str = value.replace(/\n+/g, `$&
${indent2}`);
    if (actualString) {
      const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
      const { compat, tags } = ctx.doc.schema;
      if (tags.some(test) || compat?.some(test))
        return quotedString(value, ctx);
    }
    return implicitKey ? str : foldFlowLines(str, indent2, FOLD_FLOW, getFoldOptions(ctx, false));
  }
  function stringifyString(item, ctx, onComment, onChompKeep) {
    const { implicitKey, inFlow } = ctx;
    const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
    let { type } = item;
    if (type !== Scalar.QUOTE_DOUBLE) {
      if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
        type = Scalar.QUOTE_DOUBLE;
    }
    const _stringify = (_type) => {
      switch (_type) {
        case Scalar.BLOCK_FOLDED:
        case Scalar.BLOCK_LITERAL:
          return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
        case Scalar.QUOTE_DOUBLE:
          return doubleQuotedString(ss.value, ctx);
        case Scalar.QUOTE_SINGLE:
          return singleQuotedString(ss.value, ctx);
        case Scalar.PLAIN:
          return plainString(ss, ctx, onComment, onChompKeep);
        default:
          return null;
      }
    };
    let res = _stringify(type);
    if (res === null) {
      const { defaultKeyType, defaultStringType } = ctx.options;
      const t = implicitKey && defaultKeyType || defaultStringType;
      res = _stringify(t);
      if (res === null)
        throw new Error(`Unsupported default string type ${t}`);
    }
    return res;
  }

  // node_modules/yaml/browser/dist/stringify/stringify.js
  function createStringifyContext(doc, options) {
    const opt = Object.assign({
      blockQuote: true,
      commentString: stringifyComment,
      defaultKeyType: null,
      defaultStringType: "PLAIN",
      directives: null,
      doubleQuotedAsJSON: false,
      doubleQuotedMinMultiLineLength: 40,
      falseStr: "false",
      flowCollectionPadding: true,
      indentSeq: true,
      lineWidth: 80,
      minContentWidth: 20,
      nullStr: "null",
      simpleKeys: false,
      singleQuote: null,
      trailingComma: false,
      trueStr: "true",
      verifyAliasOrder: true
    }, doc.schema.toStringOptions, options);
    let inFlow;
    switch (opt.collectionStyle) {
      case "block":
        inFlow = false;
        break;
      case "flow":
        inFlow = true;
        break;
      default:
        inFlow = null;
    }
    return {
      anchors: /* @__PURE__ */ new Set(),
      doc,
      flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
      indent: "",
      indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
      inFlow,
      options: opt
    };
  }
  function getTagObject(tags, item) {
    if (item.tag) {
      const match = tags.filter((t) => t.tag === item.tag);
      if (match.length > 0)
        return match.find((t) => t.format === item.format) ?? match[0];
    }
    let tagObj = void 0;
    let obj;
    if (isScalar(item)) {
      obj = item.value;
      let match = tags.filter((t) => t.identify?.(obj));
      if (match.length > 1) {
        const testMatch = match.filter((t) => t.test);
        if (testMatch.length > 0)
          match = testMatch;
      }
      tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
    } else {
      obj = item;
      tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
    }
    if (!tagObj) {
      const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
      throw new Error(`Tag not resolved for ${name} value`);
    }
    return tagObj;
  }
  function stringifyProps(node, tagObj, { anchors, doc }) {
    if (!doc.directives)
      return "";
    const props = [];
    const anchor = (isScalar(node) || isCollection(node)) && node.anchor;
    if (anchor && anchorIsValid(anchor)) {
      anchors.add(anchor);
      props.push(`&${anchor}`);
    }
    const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
    if (tag)
      props.push(doc.directives.tagString(tag));
    return props.join(" ");
  }
  function stringify(item, ctx, onComment, onChompKeep) {
    if (isPair(item))
      return item.toString(ctx, onComment, onChompKeep);
    if (isAlias(item)) {
      if (ctx.doc.directives)
        return item.toString(ctx);
      if (ctx.resolvedAliases?.has(item)) {
        throw new TypeError(`Cannot stringify circular structure without alias nodes`);
      } else {
        if (ctx.resolvedAliases)
          ctx.resolvedAliases.add(item);
        else
          ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
        item = item.resolve(ctx.doc);
      }
    }
    let tagObj = void 0;
    const node = isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
    tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
    const props = stringifyProps(node, tagObj, ctx);
    if (props.length > 0)
      ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
    const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : isScalar(node) ? stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
    if (!props)
      return str;
    return isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
  }

  // node_modules/yaml/browser/dist/stringify/stringifyPair.js
  function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
    const { allNullValues, doc, indent: indent2, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
    let keyComment = isNode(key) && key.comment || null;
    if (simpleKeys) {
      if (keyComment) {
        throw new Error("With simple keys, key nodes cannot have comments");
      }
      if (isCollection(key) || !isNode(key) && typeof key === "object") {
        const msg = "With simple keys, collection cannot be used as a key value";
        throw new Error(msg);
      }
    }
    let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || isCollection(key) || (isScalar(key) ? key.type === Scalar.BLOCK_FOLDED || key.type === Scalar.BLOCK_LITERAL : typeof key === "object"));
    ctx = Object.assign({}, ctx, {
      allNullValues: false,
      implicitKey: !explicitKey && (simpleKeys || !allNullValues),
      indent: indent2 + indentStep
    });
    let keyCommentDone = false;
    let chompKeep = false;
    let str = stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
    if (!explicitKey && !ctx.inFlow && str.length > 1024) {
      if (simpleKeys)
        throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
      explicitKey = true;
    }
    if (ctx.inFlow) {
      if (allNullValues || value == null) {
        if (keyCommentDone && onComment)
          onComment();
        return str === "" ? "?" : explicitKey ? `? ${str}` : str;
      }
    } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
      str = `? ${str}`;
      if (keyComment && !keyCommentDone) {
        str += lineComment(str, ctx.indent, commentString(keyComment));
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str;
    }
    if (keyCommentDone)
      keyComment = null;
    if (explicitKey) {
      if (keyComment)
        str += lineComment(str, ctx.indent, commentString(keyComment));
      str = `? ${str}
${indent2}:`;
    } else {
      str = `${str}:`;
      if (keyComment)
        str += lineComment(str, ctx.indent, commentString(keyComment));
    }
    let vsb, vcb, valueComment;
    if (isNode(value)) {
      vsb = !!value.spaceBefore;
      vcb = value.commentBefore;
      valueComment = value.comment;
    } else {
      vsb = false;
      vcb = null;
      valueComment = null;
      if (value && typeof value === "object")
        value = doc.createNode(value);
    }
    ctx.implicitKey = false;
    if (!explicitKey && !keyComment && isScalar(value))
      ctx.indentAtStart = str.length + 1;
    chompKeep = false;
    if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && isSeq(value) && !value.flow && !value.tag && !value.anchor) {
      ctx.indent = ctx.indent.substring(2);
    }
    let valueCommentDone = false;
    const valueStr = stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
    let ws = " ";
    if (keyComment || vsb || vcb) {
      ws = vsb ? "\n" : "";
      if (vcb) {
        const cs = commentString(vcb);
        ws += `
${indentComment(cs, ctx.indent)}`;
      }
      if (valueStr === "" && !ctx.inFlow) {
        if (ws === "\n" && valueComment)
          ws = "\n\n";
      } else {
        ws += `
${ctx.indent}`;
      }
    } else if (!explicitKey && isCollection(value)) {
      const vs0 = valueStr[0];
      const nl0 = valueStr.indexOf("\n");
      const hasNewline = nl0 !== -1;
      const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
      if (hasNewline || !flow) {
        let hasPropsLine = false;
        if (hasNewline && (vs0 === "&" || vs0 === "!")) {
          let sp0 = valueStr.indexOf(" ");
          if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
            sp0 = valueStr.indexOf(" ", sp0 + 1);
          }
          if (sp0 === -1 || nl0 < sp0)
            hasPropsLine = true;
        }
        if (!hasPropsLine)
          ws = `
${ctx.indent}`;
      }
    } else if (valueStr === "" || valueStr[0] === "\n") {
      ws = "";
    }
    str += ws + valueStr;
    if (ctx.inFlow) {
      if (valueCommentDone && onComment)
        onComment();
    } else if (valueComment && !valueCommentDone) {
      str += lineComment(str, ctx.indent, commentString(valueComment));
    } else if (chompKeep && onChompKeep) {
      onChompKeep();
    }
    return str;
  }

  // node_modules/yaml/browser/dist/log.js
  function warn(logLevel, warning) {
    if (logLevel === "debug" || logLevel === "warn") {
      console.warn(warning);
    }
  }

  // node_modules/yaml/browser/dist/schema/yaml-1.1/merge.js
  var MERGE_KEY = "<<";
  var merge = {
    identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
    default: "key",
    tag: "tag:yaml.org,2002:merge",
    test: /^<<$/,
    resolve: () => Object.assign(new Scalar(Symbol(MERGE_KEY)), {
      addToJSMap: addMergeToJSMap
    }),
    stringify: () => MERGE_KEY
  };
  var isMergeKey = (ctx, key) => (merge.identify(key) || isScalar(key) && (!key.type || key.type === Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
  function addMergeToJSMap(ctx, map2, value) {
    const source = resolveAliasValue(ctx, value);
    if (isSeq(source))
      for (const it2 of source.items)
        mergeValue(ctx, map2, it2);
    else if (Array.isArray(source))
      for (const it2 of source)
        mergeValue(ctx, map2, it2);
    else
      mergeValue(ctx, map2, source);
  }
  function mergeValue(ctx, map2, value) {
    const source = resolveAliasValue(ctx, value);
    if (!isMap(source))
      throw new Error("Merge sources must be maps or map aliases");
    const srcMap = source.toJSON(null, ctx, Map);
    for (const [key, value2] of srcMap) {
      if (map2 instanceof Map) {
        if (!map2.has(key))
          map2.set(key, value2);
      } else if (map2 instanceof Set) {
        map2.add(key);
      } else if (!Object.prototype.hasOwnProperty.call(map2, key)) {
        Object.defineProperty(map2, key, {
          value: value2,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }
    }
    return map2;
  }
  function resolveAliasValue(ctx, value) {
    return ctx && isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
  }

  // node_modules/yaml/browser/dist/nodes/addPairToJSMap.js
  function addPairToJSMap(ctx, map2, { key, value }) {
    if (isNode(key) && key.addToJSMap)
      key.addToJSMap(ctx, map2, value);
    else if (isMergeKey(ctx, key))
      addMergeToJSMap(ctx, map2, value);
    else {
      const jsKey = toJS(key, "", ctx);
      if (map2 instanceof Map) {
        map2.set(jsKey, toJS(value, jsKey, ctx));
      } else if (map2 instanceof Set) {
        map2.add(jsKey);
      } else {
        const stringKey = stringifyKey(key, jsKey, ctx);
        const jsValue = toJS(value, stringKey, ctx);
        if (stringKey in map2)
          Object.defineProperty(map2, stringKey, {
            value: jsValue,
            writable: true,
            enumerable: true,
            configurable: true
          });
        else
          map2[stringKey] = jsValue;
      }
    }
    return map2;
  }
  function stringifyKey(key, jsKey, ctx) {
    if (jsKey === null)
      return "";
    if (typeof jsKey !== "object")
      return String(jsKey);
    if (isNode(key) && ctx?.doc) {
      const strCtx = createStringifyContext(ctx.doc, {});
      strCtx.anchors = /* @__PURE__ */ new Set();
      for (const node of ctx.anchors.keys())
        strCtx.anchors.add(node.anchor);
      strCtx.inFlow = true;
      strCtx.inStringifyKey = true;
      const strKey = key.toString(strCtx);
      if (!ctx.mapKeyWarned) {
        let jsonStr = JSON.stringify(strKey);
        if (jsonStr.length > 40)
          jsonStr = jsonStr.substring(0, 36) + '..."';
        warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
        ctx.mapKeyWarned = true;
      }
      return strKey;
    }
    return JSON.stringify(jsKey);
  }

  // node_modules/yaml/browser/dist/nodes/Pair.js
  function createPair(key, value, ctx) {
    const k = createNode(key, void 0, ctx);
    const v = createNode(value, void 0, ctx);
    return new Pair(k, v);
  }
  var Pair = class _Pair {
    constructor(key, value = null) {
      Object.defineProperty(this, NODE_TYPE, { value: PAIR });
      this.key = key;
      this.value = value;
    }
    clone(schema4) {
      let { key, value } = this;
      if (isNode(key))
        key = key.clone(schema4);
      if (isNode(value))
        value = value.clone(schema4);
      return new _Pair(key, value);
    }
    toJSON(_, ctx) {
      const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
      return addPairToJSMap(ctx, pair, this);
    }
    toString(ctx, onComment, onChompKeep) {
      return ctx?.doc ? stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
    }
  };

  // node_modules/yaml/browser/dist/stringify/stringifyCollection.js
  function stringifyCollection(collection, ctx, options) {
    const flow = ctx.inFlow ?? collection.flow;
    const stringify4 = flow ? stringifyFlowCollection : stringifyBlockCollection;
    return stringify4(collection, ctx, options);
  }
  function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
    const { indent: indent2, options: { commentString } } = ctx;
    const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
    let chompKeep = false;
    const lines = [];
    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      let comment2 = null;
      if (isNode(item)) {
        if (!chompKeep && item.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
        if (item.comment)
          comment2 = item.comment;
      } else if (isPair(item)) {
        const ik = isNode(item.key) ? item.key : null;
        if (ik) {
          if (!chompKeep && ik.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
        }
      }
      chompKeep = false;
      let str2 = stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
      if (comment2)
        str2 += lineComment(str2, itemIndent, commentString(comment2));
      if (chompKeep && comment2)
        chompKeep = false;
      lines.push(blockItemPrefix + str2);
    }
    let str;
    if (lines.length === 0) {
      str = flowChars.start + flowChars.end;
    } else {
      str = lines[0];
      for (let i = 1; i < lines.length; ++i) {
        const line = lines[i];
        str += line ? `
${indent2}${line}` : "\n";
      }
    }
    if (comment) {
      str += "\n" + indentComment(commentString(comment), indent2);
      if (onComment)
        onComment();
    } else if (chompKeep && onChompKeep)
      onChompKeep();
    return str;
  }
  function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
    const { indent: indent2, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
    itemIndent += indentStep;
    const itemCtx = Object.assign({}, ctx, {
      indent: itemIndent,
      inFlow: true,
      type: null
    });
    let reqNewline = false;
    let linesAtValue = 0;
    const lines = [];
    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      let comment = null;
      if (isNode(item)) {
        if (item.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, item.commentBefore, false);
        if (item.comment)
          comment = item.comment;
      } else if (isPair(item)) {
        const ik = isNode(item.key) ? item.key : null;
        if (ik) {
          if (ik.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, ik.commentBefore, false);
          if (ik.comment)
            reqNewline = true;
        }
        const iv = isNode(item.value) ? item.value : null;
        if (iv) {
          if (iv.comment)
            comment = iv.comment;
          if (iv.commentBefore)
            reqNewline = true;
        } else if (item.value == null && ik?.comment) {
          comment = ik.comment;
        }
      }
      if (comment)
        reqNewline = true;
      let str = stringify(item, itemCtx, () => comment = null);
      reqNewline || (reqNewline = lines.length > linesAtValue || str.includes("\n"));
      if (i < items.length - 1) {
        str += ",";
      } else if (ctx.options.trailingComma) {
        if (ctx.options.lineWidth > 0) {
          reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) + (str.length + 2) > ctx.options.lineWidth);
        }
        if (reqNewline) {
          str += ",";
        }
      }
      if (comment)
        str += lineComment(str, itemIndent, commentString(comment));
      lines.push(str);
      linesAtValue = lines.length;
    }
    const { start, end } = flowChars;
    if (lines.length === 0) {
      return start + end;
    } else {
      if (!reqNewline) {
        const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
        reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
      }
      if (reqNewline) {
        let str = start;
        for (const line of lines)
          str += line ? `
${indentStep}${indent2}${line}` : "\n";
        return `${str}
${indent2}${end}`;
      } else {
        return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
      }
    }
  }
  function addCommentBefore({ indent: indent2, options: { commentString } }, lines, comment, chompKeep) {
    if (comment && chompKeep)
      comment = comment.replace(/^\n+/, "");
    if (comment) {
      const ic = indentComment(commentString(comment), indent2);
      lines.push(ic.trimStart());
    }
  }

  // node_modules/yaml/browser/dist/nodes/YAMLMap.js
  function findPair(items, key) {
    const k = isScalar(key) ? key.value : key;
    for (const it2 of items) {
      if (isPair(it2)) {
        if (it2.key === key || it2.key === k)
          return it2;
        if (isScalar(it2.key) && it2.key.value === k)
          return it2;
      }
    }
    return void 0;
  }
  var YAMLMap = class extends Collection {
    static get tagName() {
      return "tag:yaml.org,2002:map";
    }
    constructor(schema4) {
      super(MAP, schema4);
      this.items = [];
    }
    /**
     * A generic collection parsing method that can be extended
     * to other node classes that inherit from YAMLMap
     */
    static from(schema4, obj, ctx) {
      const { keepUndefined, replacer } = ctx;
      const map2 = new this(schema4);
      const add = (key, value) => {
        if (typeof replacer === "function")
          value = replacer.call(obj, key, value);
        else if (Array.isArray(replacer) && !replacer.includes(key))
          return;
        if (value !== void 0 || keepUndefined)
          map2.items.push(createPair(key, value, ctx));
      };
      if (obj instanceof Map) {
        for (const [key, value] of obj)
          add(key, value);
      } else if (obj && typeof obj === "object") {
        for (const key of Object.keys(obj))
          add(key, obj[key]);
      }
      if (typeof schema4.sortMapEntries === "function") {
        map2.items.sort(schema4.sortMapEntries);
      }
      return map2;
    }
    /**
     * Adds a value to the collection.
     *
     * @param overwrite - If not set `true`, using a key that is already in the
     *   collection will throw. Otherwise, overwrites the previous value.
     */
    add(pair, overwrite) {
      let _pair;
      if (isPair(pair))
        _pair = pair;
      else if (!pair || typeof pair !== "object" || !("key" in pair)) {
        _pair = new Pair(pair, pair?.value);
      } else
        _pair = new Pair(pair.key, pair.value);
      const prev = findPair(this.items, _pair.key);
      const sortEntries = this.schema?.sortMapEntries;
      if (prev) {
        if (!overwrite)
          throw new Error(`Key ${_pair.key} already set`);
        if (isScalar(prev.value) && isScalarValue(_pair.value))
          prev.value.value = _pair.value;
        else
          prev.value = _pair.value;
      } else if (sortEntries) {
        const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
        if (i === -1)
          this.items.push(_pair);
        else
          this.items.splice(i, 0, _pair);
      } else {
        this.items.push(_pair);
      }
    }
    delete(key) {
      const it2 = findPair(this.items, key);
      if (!it2)
        return false;
      const del = this.items.splice(this.items.indexOf(it2), 1);
      return del.length > 0;
    }
    get(key, keepScalar) {
      const it2 = findPair(this.items, key);
      const node = it2?.value;
      return (!keepScalar && isScalar(node) ? node.value : node) ?? void 0;
    }
    has(key) {
      return !!findPair(this.items, key);
    }
    set(key, value) {
      this.add(new Pair(key, value), true);
    }
    /**
     * @param ctx - Conversion context, originally set in Document#toJS()
     * @param {Class} Type - If set, forces the returned collection type
     * @returns Instance of Type, Map, or Object
     */
    toJSON(_, ctx, Type) {
      const map2 = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
      if (ctx?.onCreate)
        ctx.onCreate(map2);
      for (const item of this.items)
        addPairToJSMap(ctx, map2, item);
      return map2;
    }
    toString(ctx, onComment, onChompKeep) {
      if (!ctx)
        return JSON.stringify(this);
      for (const item of this.items) {
        if (!isPair(item))
          throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
      }
      if (!ctx.allNullValues && this.hasAllNullValues(false))
        ctx = Object.assign({}, ctx, { allNullValues: true });
      return stringifyCollection(this, ctx, {
        blockItemPrefix: "",
        flowChars: { start: "{", end: "}" },
        itemIndent: ctx.indent || "",
        onChompKeep,
        onComment
      });
    }
  };

  // node_modules/yaml/browser/dist/schema/common/map.js
  var map = {
    collection: "map",
    default: true,
    nodeClass: YAMLMap,
    tag: "tag:yaml.org,2002:map",
    resolve(map2, onError) {
      if (!isMap(map2))
        onError("Expected a mapping for this tag");
      return map2;
    },
    createNode: (schema4, obj, ctx) => YAMLMap.from(schema4, obj, ctx)
  };

  // node_modules/yaml/browser/dist/nodes/YAMLSeq.js
  var YAMLSeq = class extends Collection {
    static get tagName() {
      return "tag:yaml.org,2002:seq";
    }
    constructor(schema4) {
      super(SEQ, schema4);
      this.items = [];
    }
    add(value) {
      this.items.push(value);
    }
    /**
     * Removes a value from the collection.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     *
     * @returns `true` if the item was found and removed.
     */
    delete(key) {
      const idx = asItemIndex(key);
      if (typeof idx !== "number")
        return false;
      const del = this.items.splice(idx, 1);
      return del.length > 0;
    }
    get(key, keepScalar) {
      const idx = asItemIndex(key);
      if (typeof idx !== "number")
        return void 0;
      const it2 = this.items[idx];
      return !keepScalar && isScalar(it2) ? it2.value : it2;
    }
    /**
     * Checks if the collection includes a value with the key `key`.
     *
     * `key` must contain a representation of an integer for this to succeed.
     * It may be wrapped in a `Scalar`.
     */
    has(key) {
      const idx = asItemIndex(key);
      return typeof idx === "number" && idx < this.items.length;
    }
    /**
     * Sets a value in this collection. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     *
     * If `key` does not contain a representation of an integer, this will throw.
     * It may be wrapped in a `Scalar`.
     */
    set(key, value) {
      const idx = asItemIndex(key);
      if (typeof idx !== "number")
        throw new Error(`Expected a valid index, not ${key}.`);
      const prev = this.items[idx];
      if (isScalar(prev) && isScalarValue(value))
        prev.value = value;
      else
        this.items[idx] = value;
    }
    toJSON(_, ctx) {
      const seq2 = [];
      if (ctx?.onCreate)
        ctx.onCreate(seq2);
      let i = 0;
      for (const item of this.items)
        seq2.push(toJS(item, String(i++), ctx));
      return seq2;
    }
    toString(ctx, onComment, onChompKeep) {
      if (!ctx)
        return JSON.stringify(this);
      return stringifyCollection(this, ctx, {
        blockItemPrefix: "- ",
        flowChars: { start: "[", end: "]" },
        itemIndent: (ctx.indent || "") + "  ",
        onChompKeep,
        onComment
      });
    }
    static from(schema4, obj, ctx) {
      const { replacer } = ctx;
      const seq2 = new this(schema4);
      if (obj && Symbol.iterator in Object(obj)) {
        let i = 0;
        for (let it2 of obj) {
          if (typeof replacer === "function") {
            const key = obj instanceof Set ? it2 : String(i++);
            it2 = replacer.call(obj, key, it2);
          }
          seq2.items.push(createNode(it2, void 0, ctx));
        }
      }
      return seq2;
    }
  };
  function asItemIndex(key) {
    let idx = isScalar(key) ? key.value : key;
    if (idx && typeof idx === "string")
      idx = Number(idx);
    return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
  }

  // node_modules/yaml/browser/dist/schema/common/seq.js
  var seq = {
    collection: "seq",
    default: true,
    nodeClass: YAMLSeq,
    tag: "tag:yaml.org,2002:seq",
    resolve(seq2, onError) {
      if (!isSeq(seq2))
        onError("Expected a sequence for this tag");
      return seq2;
    },
    createNode: (schema4, obj, ctx) => YAMLSeq.from(schema4, obj, ctx)
  };

  // node_modules/yaml/browser/dist/schema/common/string.js
  var string = {
    identify: (value) => typeof value === "string",
    default: true,
    tag: "tag:yaml.org,2002:str",
    resolve: (str) => str,
    stringify(item, ctx, onComment, onChompKeep) {
      ctx = Object.assign({ actualString: true }, ctx);
      return stringifyString(item, ctx, onComment, onChompKeep);
    }
  };

  // node_modules/yaml/browser/dist/schema/common/null.js
  var nullTag = {
    identify: (value) => value == null,
    createNode: () => new Scalar(null),
    default: true,
    tag: "tag:yaml.org,2002:null",
    test: /^(?:~|[Nn]ull|NULL)?$/,
    resolve: () => new Scalar(null),
    stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
  };

  // node_modules/yaml/browser/dist/schema/core/bool.js
  var boolTag = {
    identify: (value) => typeof value === "boolean",
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
    resolve: (str) => new Scalar(str[0] === "t" || str[0] === "T"),
    stringify({ source, value }, ctx) {
      if (source && boolTag.test.test(source)) {
        const sv = source[0] === "t" || source[0] === "T";
        if (value === sv)
          return source;
      }
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
  };

  // node_modules/yaml/browser/dist/stringify/stringifyNumber.js
  function stringifyNumber({ format, minFractionDigits, tag, value }) {
    if (typeof value === "bigint")
      return String(value);
    const num = typeof value === "number" ? value : Number(value);
    if (!isFinite(num))
      return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
    let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
    if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^-?\d/.test(n) && !n.includes("e")) {
      let i = n.indexOf(".");
      if (i < 0) {
        i = n.length;
        n += ".";
      }
      let d = minFractionDigits - (n.length - i - 1);
      while (d-- > 0)
        n += "0";
    }
    return n;
  }

  // node_modules/yaml/browser/dist/schema/core/float.js
  var floatNaN = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: stringifyNumber
  };
  var floatExp = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
    resolve: (str) => parseFloat(str),
    stringify(node) {
      const num = Number(node.value);
      return isFinite(num) ? num.toExponential() : stringifyNumber(node);
    }
  };
  var float = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
    resolve(str) {
      const node = new Scalar(parseFloat(str));
      const dot = str.indexOf(".");
      if (dot !== -1 && str[str.length - 1] === "0")
        node.minFractionDigits = str.length - dot - 1;
      return node;
    },
    stringify: stringifyNumber
  };

  // node_modules/yaml/browser/dist/schema/core/int.js
  var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
  var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
  function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value) && value >= 0)
      return prefix + value.toString(radix);
    return stringifyNumber(node);
  }
  var intOct = {
    identify: (value) => intIdentify(value) && value >= 0,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^0o[0-7]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
    stringify: (node) => intStringify(node, 8, "0o")
  };
  var int = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: stringifyNumber
  };
  var intHex = {
    identify: (value) => intIdentify(value) && value >= 0,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^0x[0-9a-fA-F]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: (node) => intStringify(node, 16, "0x")
  };

  // node_modules/yaml/browser/dist/schema/core/schema.js
  var schema = [
    map,
    seq,
    string,
    nullTag,
    boolTag,
    intOct,
    int,
    intHex,
    floatNaN,
    floatExp,
    float
  ];

  // node_modules/yaml/browser/dist/schema/json/schema.js
  function intIdentify2(value) {
    return typeof value === "bigint" || Number.isInteger(value);
  }
  var stringifyJSON = ({ value }) => JSON.stringify(value);
  var jsonScalars = [
    {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str) => str,
      stringify: stringifyJSON
    },
    {
      identify: (value) => value == null,
      createNode: () => new Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^null$/,
      resolve: () => null,
      stringify: stringifyJSON
    },
    {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^true$|^false$/,
      resolve: (str) => str === "true",
      stringify: stringifyJSON
    },
    {
      identify: intIdentify2,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^-?(?:0|[1-9][0-9]*)$/,
      resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
      stringify: ({ value }) => intIdentify2(value) ? value.toString() : JSON.stringify(value)
    },
    {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
      resolve: (str) => parseFloat(str),
      stringify: stringifyJSON
    }
  ];
  var jsonError = {
    default: true,
    tag: "",
    test: /^/,
    resolve(str, onError) {
      onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
      return str;
    }
  };
  var schema2 = [map, seq].concat(jsonScalars, jsonError);

  // node_modules/yaml/browser/dist/schema/yaml-1.1/binary.js
  var binary = {
    identify: (value) => value instanceof Uint8Array,
    // Buffer inherits from Uint8Array
    default: false,
    tag: "tag:yaml.org,2002:binary",
    /**
     * Returns a Buffer in node and an Uint8Array in browsers
     *
     * To use the resulting buffer as an image, you'll want to do something like:
     *
     *   const blob = new Blob([buffer], { type: 'image/jpeg' })
     *   document.querySelector('#photo').src = URL.createObjectURL(blob)
     */
    resolve(src, onError) {
      if (typeof atob === "function") {
        const str = atob(src.replace(/[\n\r]/g, ""));
        const buffer = new Uint8Array(str.length);
        for (let i = 0; i < str.length; ++i)
          buffer[i] = str.charCodeAt(i);
        return buffer;
      } else {
        onError("This environment does not support reading binary tags; either Buffer or atob is required");
        return src;
      }
    },
    stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
      if (!value)
        return "";
      const buf = value;
      let str;
      if (typeof btoa === "function") {
        let s = "";
        for (let i = 0; i < buf.length; ++i)
          s += String.fromCharCode(buf[i]);
        str = btoa(s);
      } else {
        throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
      }
      type ?? (type = Scalar.BLOCK_LITERAL);
      if (type !== Scalar.QUOTE_DOUBLE) {
        const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
        const n = Math.ceil(str.length / lineWidth);
        const lines = new Array(n);
        for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
          lines[i] = str.substr(o, lineWidth);
        }
        str = lines.join(type === Scalar.BLOCK_LITERAL ? "\n" : " ");
      }
      return stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
    }
  };

  // node_modules/yaml/browser/dist/schema/yaml-1.1/pairs.js
  function resolvePairs(seq2, onError) {
    if (isSeq(seq2)) {
      for (let i = 0; i < seq2.items.length; ++i) {
        let item = seq2.items[i];
        if (isPair(item))
          continue;
        else if (isMap(item)) {
          if (item.items.length > 1)
            onError("Each pair must have its own sequence indicator");
          const pair = item.items[0] || new Pair(new Scalar(null));
          if (item.commentBefore)
            pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
          if (item.comment) {
            const cn = pair.value ?? pair.key;
            cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
          }
          item = pair;
        }
        seq2.items[i] = isPair(item) ? item : new Pair(item);
      }
    } else
      onError("Expected a sequence for this tag");
    return seq2;
  }
  function createPairs(schema4, iterable, ctx) {
    const { replacer } = ctx;
    const pairs2 = new YAMLSeq(schema4);
    pairs2.tag = "tag:yaml.org,2002:pairs";
    let i = 0;
    if (iterable && Symbol.iterator in Object(iterable))
      for (let it2 of iterable) {
        if (typeof replacer === "function")
          it2 = replacer.call(iterable, String(i++), it2);
        let key, value;
        if (Array.isArray(it2)) {
          if (it2.length === 2) {
            key = it2[0];
            value = it2[1];
          } else
            throw new TypeError(`Expected [key, value] tuple: ${it2}`);
        } else if (it2 && it2 instanceof Object) {
          const keys = Object.keys(it2);
          if (keys.length === 1) {
            key = keys[0];
            value = it2[key];
          } else {
            throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
          }
        } else {
          key = it2;
        }
        pairs2.items.push(createPair(key, value, ctx));
      }
    return pairs2;
  }
  var pairs = {
    collection: "seq",
    default: false,
    tag: "tag:yaml.org,2002:pairs",
    resolve: resolvePairs,
    createNode: createPairs
  };

  // node_modules/yaml/browser/dist/schema/yaml-1.1/omap.js
  var YAMLOMap = class _YAMLOMap extends YAMLSeq {
    constructor() {
      super();
      this.add = YAMLMap.prototype.add.bind(this);
      this.delete = YAMLMap.prototype.delete.bind(this);
      this.get = YAMLMap.prototype.get.bind(this);
      this.has = YAMLMap.prototype.has.bind(this);
      this.set = YAMLMap.prototype.set.bind(this);
      this.tag = _YAMLOMap.tag;
    }
    /**
     * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
     * but TypeScript won't allow widening the signature of a child method.
     */
    toJSON(_, ctx) {
      if (!ctx)
        return super.toJSON(_);
      const map2 = /* @__PURE__ */ new Map();
      if (ctx?.onCreate)
        ctx.onCreate(map2);
      for (const pair of this.items) {
        let key, value;
        if (isPair(pair)) {
          key = toJS(pair.key, "", ctx);
          value = toJS(pair.value, key, ctx);
        } else {
          key = toJS(pair, "", ctx);
        }
        if (map2.has(key))
          throw new Error("Ordered maps must not include duplicate keys");
        map2.set(key, value);
      }
      return map2;
    }
    static from(schema4, iterable, ctx) {
      const pairs2 = createPairs(schema4, iterable, ctx);
      const omap2 = new this();
      omap2.items = pairs2.items;
      return omap2;
    }
  };
  YAMLOMap.tag = "tag:yaml.org,2002:omap";
  var omap = {
    collection: "seq",
    identify: (value) => value instanceof Map,
    nodeClass: YAMLOMap,
    default: false,
    tag: "tag:yaml.org,2002:omap",
    resolve(seq2, onError) {
      const pairs2 = resolvePairs(seq2, onError);
      const seenKeys = [];
      for (const { key } of pairs2.items) {
        if (isScalar(key)) {
          if (seenKeys.includes(key.value)) {
            onError(`Ordered maps must not include duplicate keys: ${key.value}`);
          } else {
            seenKeys.push(key.value);
          }
        }
      }
      return Object.assign(new YAMLOMap(), pairs2);
    },
    createNode: (schema4, iterable, ctx) => YAMLOMap.from(schema4, iterable, ctx)
  };

  // node_modules/yaml/browser/dist/schema/yaml-1.1/bool.js
  function boolStringify({ value, source }, ctx) {
    const boolObj = value ? trueTag : falseTag;
    if (source && boolObj.test.test(source))
      return source;
    return value ? ctx.options.trueStr : ctx.options.falseStr;
  }
  var trueTag = {
    identify: (value) => value === true,
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
    resolve: () => new Scalar(true),
    stringify: boolStringify
  };
  var falseTag = {
    identify: (value) => value === false,
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
    resolve: () => new Scalar(false),
    stringify: boolStringify
  };

  // node_modules/yaml/browser/dist/schema/yaml-1.1/float.js
  var floatNaN2 = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: stringifyNumber
  };
  var floatExp2 = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
    resolve: (str) => parseFloat(str.replace(/_/g, "")),
    stringify(node) {
      const num = Number(node.value);
      return isFinite(num) ? num.toExponential() : stringifyNumber(node);
    }
  };
  var float2 = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
    resolve(str) {
      const node = new Scalar(parseFloat(str.replace(/_/g, "")));
      const dot = str.indexOf(".");
      if (dot !== -1) {
        const f = str.substring(dot + 1).replace(/_/g, "");
        if (f[f.length - 1] === "0")
          node.minFractionDigits = f.length;
      }
      return node;
    },
    stringify: stringifyNumber
  };

  // node_modules/yaml/browser/dist/schema/yaml-1.1/int.js
  var intIdentify3 = (value) => typeof value === "bigint" || Number.isInteger(value);
  function intResolve2(str, offset, radix, { intAsBigInt }) {
    const sign = str[0];
    if (sign === "-" || sign === "+")
      offset += 1;
    str = str.substring(offset).replace(/_/g, "");
    if (intAsBigInt) {
      switch (radix) {
        case 2:
          str = `0b${str}`;
          break;
        case 8:
          str = `0o${str}`;
          break;
        case 16:
          str = `0x${str}`;
          break;
      }
      const n2 = BigInt(str);
      return sign === "-" ? BigInt(-1) * n2 : n2;
    }
    const n = parseInt(str, radix);
    return sign === "-" ? -1 * n : n;
  }
  function intStringify2(node, radix, prefix) {
    const { value } = node;
    if (intIdentify3(value)) {
      const str = value.toString(radix);
      return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
    }
    return stringifyNumber(node);
  }
  var intBin = {
    identify: intIdentify3,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "BIN",
    test: /^[-+]?0b[0-1_]+$/,
    resolve: (str, _onError, opt) => intResolve2(str, 2, 2, opt),
    stringify: (node) => intStringify2(node, 2, "0b")
  };
  var intOct2 = {
    identify: intIdentify3,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^[-+]?0[0-7_]+$/,
    resolve: (str, _onError, opt) => intResolve2(str, 1, 8, opt),
    stringify: (node) => intStringify2(node, 8, "0")
  };
  var int2 = {
    identify: intIdentify3,
    default: true,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9][0-9_]*$/,
    resolve: (str, _onError, opt) => intResolve2(str, 0, 10, opt),
    stringify: stringifyNumber
  };
  var intHex2 = {
    identify: intIdentify3,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^[-+]?0x[0-9a-fA-F_]+$/,
    resolve: (str, _onError, opt) => intResolve2(str, 2, 16, opt),
    stringify: (node) => intStringify2(node, 16, "0x")
  };

  // node_modules/yaml/browser/dist/schema/yaml-1.1/set.js
  var YAMLSet = class _YAMLSet extends YAMLMap {
    constructor(schema4) {
      super(schema4);
      this.tag = _YAMLSet.tag;
    }
    add(key) {
      let pair;
      if (isPair(key))
        pair = key;
      else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
        pair = new Pair(key.key, null);
      else
        pair = new Pair(key, null);
      const prev = findPair(this.items, pair.key);
      if (!prev)
        this.items.push(pair);
    }
    /**
     * If `keepPair` is `true`, returns the Pair matching `key`.
     * Otherwise, returns the value of that Pair's key.
     */
    get(key, keepPair) {
      const pair = findPair(this.items, key);
      return !keepPair && isPair(pair) ? isScalar(pair.key) ? pair.key.value : pair.key : pair;
    }
    set(key, value) {
      if (typeof value !== "boolean")
        throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
      const prev = findPair(this.items, key);
      if (prev && !value) {
        this.items.splice(this.items.indexOf(prev), 1);
      } else if (!prev && value) {
        this.items.push(new Pair(key));
      }
    }
    toJSON(_, ctx) {
      return super.toJSON(_, ctx, Set);
    }
    toString(ctx, onComment, onChompKeep) {
      if (!ctx)
        return JSON.stringify(this);
      if (this.hasAllNullValues(true))
        return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
      else
        throw new Error("Set items must all have null values");
    }
    static from(schema4, iterable, ctx) {
      const { replacer } = ctx;
      const set2 = new this(schema4);
      if (iterable && Symbol.iterator in Object(iterable))
        for (let value of iterable) {
          if (typeof replacer === "function")
            value = replacer.call(iterable, value, value);
          set2.items.push(createPair(value, null, ctx));
        }
      return set2;
    }
  };
  YAMLSet.tag = "tag:yaml.org,2002:set";
  var set = {
    collection: "map",
    identify: (value) => value instanceof Set,
    nodeClass: YAMLSet,
    default: false,
    tag: "tag:yaml.org,2002:set",
    createNode: (schema4, iterable, ctx) => YAMLSet.from(schema4, iterable, ctx),
    resolve(map2, onError) {
      if (isMap(map2)) {
        if (map2.hasAllNullValues(true))
          return Object.assign(new YAMLSet(), map2);
        else
          onError("Set items must all have null values");
      } else
        onError("Expected a mapping for this tag");
      return map2;
    }
  };

  // node_modules/yaml/browser/dist/schema/yaml-1.1/timestamp.js
  function parseSexagesimal(str, asBigInt) {
    const sign = str[0];
    const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
    const num = (n) => asBigInt ? BigInt(n) : Number(n);
    const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num(60) + num(p), num(0));
    return sign === "-" ? num(-1) * res : res;
  }
  function stringifySexagesimal(node) {
    let { value } = node;
    let num = (n) => n;
    if (typeof value === "bigint")
      num = (n) => BigInt(n);
    else if (isNaN(value) || !isFinite(value))
      return stringifyNumber(node);
    let sign = "";
    if (value < 0) {
      sign = "-";
      value *= num(-1);
    }
    const _60 = num(60);
    const parts = [value % _60];
    if (value < 60) {
      parts.unshift(0);
    } else {
      value = (value - parts[0]) / _60;
      parts.unshift(value % _60);
      if (value >= 60) {
        value = (value - parts[0]) / _60;
        parts.unshift(value);
      }
    }
    return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
  }
  var intTime = {
    identify: (value) => typeof value === "bigint" || Number.isInteger(value),
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
    resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
    stringify: stringifySexagesimal
  };
  var floatTime = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
    resolve: (str) => parseSexagesimal(str, false),
    stringify: stringifySexagesimal
  };
  var timestamp = {
    identify: (value) => value instanceof Date,
    default: true,
    tag: "tag:yaml.org,2002:timestamp",
    // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
    // may be omitted altogether, resulting in a date format. In such a case, the time part is
    // assumed to be 00:00:00Z (start of day, UTC).
    test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
    resolve(str) {
      const match = str.match(timestamp.test);
      if (!match)
        throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
      const [, year, month, day, hour, minute, second] = match.map(Number);
      const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
      let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
      const tz = match[8];
      if (tz && tz !== "Z") {
        let d = parseSexagesimal(tz, false);
        if (Math.abs(d) < 30)
          d *= 60;
        date -= 6e4 * d;
      }
      return new Date(date);
    },
    stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
  };

  // node_modules/yaml/browser/dist/schema/yaml-1.1/schema.js
  var schema3 = [
    map,
    seq,
    string,
    nullTag,
    trueTag,
    falseTag,
    intBin,
    intOct2,
    int2,
    intHex2,
    floatNaN2,
    floatExp2,
    float2,
    binary,
    merge,
    omap,
    pairs,
    set,
    intTime,
    floatTime,
    timestamp
  ];

  // node_modules/yaml/browser/dist/schema/tags.js
  var schemas = /* @__PURE__ */ new Map([
    ["core", schema],
    ["failsafe", [map, seq, string]],
    ["json", schema2],
    ["yaml11", schema3],
    ["yaml-1.1", schema3]
  ]);
  var tagsByName = {
    binary,
    bool: boolTag,
    float,
    floatExp,
    floatNaN,
    floatTime,
    int,
    intHex,
    intOct,
    intTime,
    map,
    merge,
    null: nullTag,
    omap,
    pairs,
    seq,
    set,
    timestamp
  };
  var coreKnownTags = {
    "tag:yaml.org,2002:binary": binary,
    "tag:yaml.org,2002:merge": merge,
    "tag:yaml.org,2002:omap": omap,
    "tag:yaml.org,2002:pairs": pairs,
    "tag:yaml.org,2002:set": set,
    "tag:yaml.org,2002:timestamp": timestamp
  };
  function getTags(customTags, schemaName, addMergeTag) {
    const schemaTags = schemas.get(schemaName);
    if (schemaTags && !customTags) {
      return addMergeTag && !schemaTags.includes(merge) ? schemaTags.concat(merge) : schemaTags.slice();
    }
    let tags = schemaTags;
    if (!tags) {
      if (Array.isArray(customTags))
        tags = [];
      else {
        const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
        throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
      }
    }
    if (Array.isArray(customTags)) {
      for (const tag of customTags)
        tags = tags.concat(tag);
    } else if (typeof customTags === "function") {
      tags = customTags(tags.slice());
    }
    if (addMergeTag)
      tags = tags.concat(merge);
    return tags.reduce((tags2, tag) => {
      const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
      if (!tagObj) {
        const tagName = JSON.stringify(tag);
        const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
        throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
      }
      if (!tags2.includes(tagObj))
        tags2.push(tagObj);
      return tags2;
    }, []);
  }

  // node_modules/yaml/browser/dist/schema/Schema.js
  var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
  var Schema = class _Schema {
    constructor({ compat, customTags, merge: merge2, resolveKnownTags, schema: schema4, sortMapEntries, toStringDefaults }) {
      this.compat = Array.isArray(compat) ? getTags(compat, "compat") : compat ? getTags(null, compat) : null;
      this.name = typeof schema4 === "string" && schema4 || "core";
      this.knownTags = resolveKnownTags ? coreKnownTags : {};
      this.tags = getTags(customTags, this.name, merge2);
      this.toStringOptions = toStringDefaults ?? null;
      Object.defineProperty(this, MAP, { value: map });
      Object.defineProperty(this, SCALAR, { value: string });
      Object.defineProperty(this, SEQ, { value: seq });
      this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
    }
    clone() {
      const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
      copy.tags = this.tags.slice();
      return copy;
    }
  };

  // node_modules/yaml/browser/dist/stringify/stringifyDocument.js
  function stringifyDocument(doc, options) {
    const lines = [];
    let hasDirectives = options.directives === true;
    if (options.directives !== false && doc.directives) {
      const dir = doc.directives.toString(doc);
      if (dir) {
        lines.push(dir);
        hasDirectives = true;
      } else if (doc.directives.docStart)
        hasDirectives = true;
    }
    if (hasDirectives)
      lines.push("---");
    const ctx = createStringifyContext(doc, options);
    const { commentString } = ctx.options;
    if (doc.commentBefore) {
      if (lines.length !== 1)
        lines.unshift("");
      const cs = commentString(doc.commentBefore);
      lines.unshift(indentComment(cs, ""));
    }
    let chompKeep = false;
    let contentComment = null;
    if (doc.contents) {
      if (isNode(doc.contents)) {
        if (doc.contents.spaceBefore && hasDirectives)
          lines.push("");
        if (doc.contents.commentBefore) {
          const cs = commentString(doc.contents.commentBefore);
          lines.push(indentComment(cs, ""));
        }
        ctx.forceBlockIndent = !!doc.comment;
        contentComment = doc.contents.comment;
      }
      const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
      let body = stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
      if (contentComment)
        body += lineComment(body, "", commentString(contentComment));
      if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
        lines[lines.length - 1] = `--- ${body}`;
      } else
        lines.push(body);
    } else {
      lines.push(stringify(doc.contents, ctx));
    }
    if (doc.directives?.docEnd) {
      if (doc.comment) {
        const cs = commentString(doc.comment);
        if (cs.includes("\n")) {
          lines.push("...");
          lines.push(indentComment(cs, ""));
        } else {
          lines.push(`... ${cs}`);
        }
      } else {
        lines.push("...");
      }
    } else {
      let dc = doc.comment;
      if (dc && chompKeep)
        dc = dc.replace(/^\n+/, "");
      if (dc) {
        if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
          lines.push("");
        lines.push(indentComment(commentString(dc), ""));
      }
    }
    return lines.join("\n") + "\n";
  }

  // node_modules/yaml/browser/dist/doc/Document.js
  var Document = class _Document {
    constructor(value, replacer, options) {
      this.commentBefore = null;
      this.comment = null;
      this.errors = [];
      this.warnings = [];
      Object.defineProperty(this, NODE_TYPE, { value: DOC });
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === void 0 && replacer) {
        options = replacer;
        replacer = void 0;
      }
      const opt = Object.assign({
        intAsBigInt: false,
        keepSourceTokens: false,
        logLevel: "warn",
        prettyErrors: true,
        strict: true,
        stringKeys: false,
        uniqueKeys: true,
        version: "1.2"
      }, options);
      this.options = opt;
      let { version } = opt;
      if (options?._directives) {
        this.directives = options._directives.atDocument();
        if (this.directives.yaml.explicit)
          version = this.directives.yaml.version;
      } else
        this.directives = new Directives({ version });
      this.setSchema(version, options);
      this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
    }
    /**
     * Create a deep copy of this Document and its contents.
     *
     * Custom Node values that inherit from `Object` still refer to their original instances.
     */
    clone() {
      const copy = Object.create(_Document.prototype, {
        [NODE_TYPE]: { value: DOC }
      });
      copy.commentBefore = this.commentBefore;
      copy.comment = this.comment;
      copy.errors = this.errors.slice();
      copy.warnings = this.warnings.slice();
      copy.options = Object.assign({}, this.options);
      if (this.directives)
        copy.directives = this.directives.clone();
      copy.schema = this.schema.clone();
      copy.contents = isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
      if (this.range)
        copy.range = this.range.slice();
      return copy;
    }
    /** Adds a value to the document. */
    add(value) {
      if (assertCollection(this.contents))
        this.contents.add(value);
    }
    /** Adds a value to the document. */
    addIn(path, value) {
      if (assertCollection(this.contents))
        this.contents.addIn(path, value);
    }
    /**
     * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
     *
     * If `node` already has an anchor, `name` is ignored.
     * Otherwise, the `node.anchor` value will be set to `name`,
     * or if an anchor with that name is already present in the document,
     * `name` will be used as a prefix for a new unique anchor.
     * If `name` is undefined, the generated anchor will use 'a' as a prefix.
     */
    createAlias(node, name) {
      if (!node.anchor) {
        const prev = anchorNames(this);
        node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        !name || prev.has(name) ? findNewAnchor(name || "a", prev) : name;
      }
      return new Alias(node.anchor);
    }
    createNode(value, replacer, options) {
      let _replacer = void 0;
      if (typeof replacer === "function") {
        value = replacer.call({ "": value }, "", value);
        _replacer = replacer;
      } else if (Array.isArray(replacer)) {
        const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
        const asStr = replacer.filter(keyToStr).map(String);
        if (asStr.length > 0)
          replacer = replacer.concat(asStr);
        _replacer = replacer;
      } else if (options === void 0 && replacer) {
        options = replacer;
        replacer = void 0;
      }
      const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
      const { onAnchor, setAnchors, sourceObjects } = createNodeAnchors(
        this,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        anchorPrefix || "a"
      );
      const ctx = {
        aliasDuplicateObjects: aliasDuplicateObjects ?? true,
        keepUndefined: keepUndefined ?? false,
        onAnchor,
        onTagObj,
        replacer: _replacer,
        schema: this.schema,
        sourceObjects
      };
      const node = createNode(value, tag, ctx);
      if (flow && isCollection(node))
        node.flow = true;
      setAnchors();
      return node;
    }
    /**
     * Convert a key and a value into a `Pair` using the current schema,
     * recursively wrapping all values as `Scalar` or `Collection` nodes.
     */
    createPair(key, value, options = {}) {
      const k = this.createNode(key, null, options);
      const v = this.createNode(value, null, options);
      return new Pair(k, v);
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    delete(key) {
      return assertCollection(this.contents) ? this.contents.delete(key) : false;
    }
    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    deleteIn(path) {
      if (isEmptyPath(path)) {
        if (this.contents == null)
          return false;
        this.contents = null;
        return true;
      }
      return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
    }
    /**
     * Returns item at `key`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    get(key, keepScalar) {
      return isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
    }
    /**
     * Returns item at `path`, or `undefined` if not found. By default unwraps
     * scalar values from their surrounding node; to disable set `keepScalar` to
     * `true` (collections are always returned intact).
     */
    getIn(path, keepScalar) {
      if (isEmptyPath(path))
        return !keepScalar && isScalar(this.contents) ? this.contents.value : this.contents;
      return isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : void 0;
    }
    /**
     * Checks if the document includes a value with the key `key`.
     */
    has(key) {
      return isCollection(this.contents) ? this.contents.has(key) : false;
    }
    /**
     * Checks if the document includes a value at `path`.
     */
    hasIn(path) {
      if (isEmptyPath(path))
        return this.contents !== void 0;
      return isCollection(this.contents) ? this.contents.hasIn(path) : false;
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    set(key, value) {
      if (this.contents == null) {
        this.contents = collectionFromPath(this.schema, [key], value);
      } else if (assertCollection(this.contents)) {
        this.contents.set(key, value);
      }
    }
    /**
     * Sets a value in this document. For `!!set`, `value` needs to be a
     * boolean to add/remove the item from the set.
     */
    setIn(path, value) {
      if (isEmptyPath(path)) {
        this.contents = value;
      } else if (this.contents == null) {
        this.contents = collectionFromPath(this.schema, Array.from(path), value);
      } else if (assertCollection(this.contents)) {
        this.contents.setIn(path, value);
      }
    }
    /**
     * Change the YAML version and schema used by the document.
     * A `null` version disables support for directives, explicit tags, anchors, and aliases.
     * It also requires the `schema` option to be given as a `Schema` instance value.
     *
     * Overrides all previously set schema options.
     */
    setSchema(version, options = {}) {
      if (typeof version === "number")
        version = String(version);
      let opt;
      switch (version) {
        case "1.1":
          if (this.directives)
            this.directives.yaml.version = "1.1";
          else
            this.directives = new Directives({ version: "1.1" });
          opt = { resolveKnownTags: false, schema: "yaml-1.1" };
          break;
        case "1.2":
        case "next":
          if (this.directives)
            this.directives.yaml.version = version;
          else
            this.directives = new Directives({ version });
          opt = { resolveKnownTags: true, schema: "core" };
          break;
        case null:
          if (this.directives)
            delete this.directives;
          opt = null;
          break;
        default: {
          const sv = JSON.stringify(version);
          throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
        }
      }
      if (options.schema instanceof Object)
        this.schema = options.schema;
      else if (opt)
        this.schema = new Schema(Object.assign(opt, options));
      else
        throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
    }
    // json & jsonArg are only used from toJSON()
    toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
      const ctx = {
        anchors: /* @__PURE__ */ new Map(),
        doc: this,
        keep: !json,
        mapAsMap: mapAsMap === true,
        mapKeyWarned: false,
        maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
      };
      const res = toJS(this.contents, jsonArg ?? "", ctx);
      if (typeof onAnchor === "function")
        for (const { count, res: res2 } of ctx.anchors.values())
          onAnchor(res2, count);
      return typeof reviver === "function" ? applyReviver(reviver, { "": res }, "", res) : res;
    }
    /**
     * A JSON representation of the document `contents`.
     *
     * @param jsonArg Used by `JSON.stringify` to indicate the array index or
     *   property name.
     */
    toJSON(jsonArg, onAnchor) {
      return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
    }
    /** A YAML representation of the document. */
    toString(options = {}) {
      if (this.errors.length > 0)
        throw new Error("Document with errors cannot be stringified");
      if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
        const s = JSON.stringify(options.indent);
        throw new Error(`"indent" option must be a positive integer, not ${s}`);
      }
      return stringifyDocument(this, options);
    }
  };
  function assertCollection(contents) {
    if (isCollection(contents))
      return true;
    throw new Error("Expected a YAML collection as document contents");
  }

  // node_modules/yaml/browser/dist/errors.js
  var YAMLError = class extends Error {
    constructor(name, pos, code, message) {
      super();
      this.name = name;
      this.code = code;
      this.message = message;
      this.pos = pos;
    }
  };
  var YAMLParseError = class extends YAMLError {
    constructor(pos, code, message) {
      super("YAMLParseError", pos, code, message);
    }
  };
  var YAMLWarning = class extends YAMLError {
    constructor(pos, code, message) {
      super("YAMLWarning", pos, code, message);
    }
  };
  var prettifyError = (src, lc) => (error) => {
    if (error.pos[0] === -1)
      return;
    error.linePos = error.pos.map((pos) => lc.linePos(pos));
    const { line, col } = error.linePos[0];
    error.message += ` at line ${line}, column ${col}`;
    let ci = col - 1;
    let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
    if (ci >= 60 && lineStr.length > 80) {
      const trimStart = Math.min(ci - 39, lineStr.length - 79);
      lineStr = "\u2026" + lineStr.substring(trimStart);
      ci -= trimStart - 1;
    }
    if (lineStr.length > 80)
      lineStr = lineStr.substring(0, 79) + "\u2026";
    if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
      let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
      if (prev.length > 80)
        prev = prev.substring(0, 79) + "\u2026\n";
      lineStr = prev + lineStr;
    }
    if (/[^ ]/.test(lineStr)) {
      let count = 1;
      const end = error.linePos[1];
      if (end?.line === line && end.col > col) {
        count = Math.max(1, Math.min(end.col - col, 80 - ci));
      }
      const pointer = " ".repeat(ci) + "^".repeat(count);
      error.message += `:

${lineStr}
${pointer}
`;
    }
  };

  // node_modules/yaml/browser/dist/compose/resolve-props.js
  function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
    let spaceBefore = false;
    let atNewline = startOnNewline;
    let hasSpace = startOnNewline;
    let comment = "";
    let commentSep = "";
    let hasNewline = false;
    let reqSpace = false;
    let tab = null;
    let anchor = null;
    let tag = null;
    let newlineAfterProp = null;
    let comma = null;
    let found = null;
    let start = null;
    for (const token of tokens) {
      if (reqSpace) {
        if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
          onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
        reqSpace = false;
      }
      if (tab) {
        if (atNewline && token.type !== "comment" && token.type !== "newline") {
          onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
        }
        tab = null;
      }
      switch (token.type) {
        case "space":
          if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) {
            tab = token;
          }
          hasSpace = true;
          break;
        case "comment": {
          if (!hasSpace)
            onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const cb = token.source.substring(1) || " ";
          if (!comment)
            comment = cb;
          else
            comment += commentSep + cb;
          commentSep = "";
          atNewline = false;
          break;
        }
        case "newline":
          if (atNewline) {
            if (comment)
              comment += token.source;
            else if (!found || indicator !== "seq-item-ind")
              spaceBefore = true;
          } else
            commentSep += token.source;
          atNewline = true;
          hasNewline = true;
          if (anchor || tag)
            newlineAfterProp = token;
          hasSpace = true;
          break;
        case "anchor":
          if (anchor)
            onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
          if (token.source.endsWith(":"))
            onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
          anchor = token;
          start ?? (start = token.offset);
          atNewline = false;
          hasSpace = false;
          reqSpace = true;
          break;
        case "tag": {
          if (tag)
            onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
          tag = token;
          start ?? (start = token.offset);
          atNewline = false;
          hasSpace = false;
          reqSpace = true;
          break;
        }
        case indicator:
          if (anchor || tag)
            onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
          if (found)
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
          found = token;
          atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
          hasSpace = false;
          break;
        case "comma":
          if (flow) {
            if (comma)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
            comma = token;
            atNewline = false;
            hasSpace = false;
            break;
          }
        // else fallthrough
        default:
          onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
          atNewline = false;
          hasSpace = false;
      }
    }
    const last = tokens[tokens.length - 1];
    const end = last ? last.offset + last.source.length : offset;
    if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
      onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
    }
    if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
      onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
    return {
      comma,
      found,
      spaceBefore,
      comment,
      hasNewline,
      anchor,
      tag,
      newlineAfterProp,
      end,
      start: start ?? end
    };
  }

  // node_modules/yaml/browser/dist/compose/util-contains-newline.js
  function containsNewline(key) {
    if (!key)
      return null;
    switch (key.type) {
      case "alias":
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        if (key.source.includes("\n"))
          return true;
        if (key.end) {
          for (const st of key.end)
            if (st.type === "newline")
              return true;
        }
        return false;
      case "flow-collection":
        for (const it2 of key.items) {
          for (const st of it2.start)
            if (st.type === "newline")
              return true;
          if (it2.sep) {
            for (const st of it2.sep)
              if (st.type === "newline")
                return true;
          }
          if (containsNewline(it2.key) || containsNewline(it2.value))
            return true;
        }
        return false;
      default:
        return true;
    }
  }

  // node_modules/yaml/browser/dist/compose/util-flow-indent-check.js
  function flowIndentCheck(indent2, fc, onError) {
    if (fc?.type === "flow-collection") {
      const end = fc.end[0];
      if (end.indent === indent2 && (end.source === "]" || end.source === "}") && containsNewline(fc)) {
        const msg = "Flow end indicator should be more indented than parent";
        onError(end, "BAD_INDENT", msg, true);
      }
    }
  }

  // node_modules/yaml/browser/dist/compose/util-map-includes.js
  function mapIncludes(ctx, items, search) {
    const { uniqueKeys } = ctx.options;
    if (uniqueKeys === false)
      return false;
    const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || isScalar(a) && isScalar(b) && a.value === b.value;
    return items.some((pair) => isEqual(pair.key, search));
  }

  // node_modules/yaml/browser/dist/compose/resolve-block-map.js
  var startColMsg = "All mapping items must start at the same column";
  function resolveBlockMap({ composeNode: composeNode2, composeEmptyNode: composeEmptyNode2 }, ctx, bm, onError, tag) {
    const NodeClass = tag?.nodeClass ?? YAMLMap;
    const map2 = new NodeClass(ctx.schema);
    if (ctx.atRoot)
      ctx.atRoot = false;
    let offset = bm.offset;
    let commentEnd = null;
    for (const collItem of bm.items) {
      const { start, key, sep, value } = collItem;
      const keyProps = resolveProps(start, {
        indicator: "explicit-key-ind",
        next: key ?? sep?.[0],
        offset,
        onError,
        parentIndent: bm.indent,
        startOnNewline: true
      });
      const implicitKey = !keyProps.found;
      if (implicitKey) {
        if (key) {
          if (key.type === "block-seq")
            onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
          else if ("indent" in key && key.indent !== bm.indent)
            onError(offset, "BAD_INDENT", startColMsg);
        }
        if (!keyProps.anchor && !keyProps.tag && !sep) {
          commentEnd = keyProps.end;
          if (keyProps.comment) {
            if (map2.comment)
              map2.comment += "\n" + keyProps.comment;
            else
              map2.comment = keyProps.comment;
          }
          continue;
        }
        if (keyProps.newlineAfterProp || containsNewline(key)) {
          onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
        }
      } else if (keyProps.found?.indent !== bm.indent) {
        onError(offset, "BAD_INDENT", startColMsg);
      }
      ctx.atKey = true;
      const keyStart = keyProps.end;
      const keyNode = key ? composeNode2(ctx, key, keyProps, onError) : composeEmptyNode2(ctx, keyStart, start, null, keyProps, onError);
      if (ctx.schema.compat)
        flowIndentCheck(bm.indent, key, onError);
      ctx.atKey = false;
      if (mapIncludes(ctx, map2.items, keyNode))
        onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
      const valueProps = resolveProps(sep ?? [], {
        indicator: "map-value-ind",
        next: value,
        offset: keyNode.range[2],
        onError,
        parentIndent: bm.indent,
        startOnNewline: !key || key.type === "block-scalar"
      });
      offset = valueProps.end;
      if (valueProps.found) {
        if (implicitKey) {
          if (value?.type === "block-map" && !valueProps.hasNewline)
            onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
          if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
            onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
        }
        const valueNode = value ? composeNode2(ctx, value, valueProps, onError) : composeEmptyNode2(ctx, offset, sep, null, valueProps, onError);
        if (ctx.schema.compat)
          flowIndentCheck(bm.indent, value, onError);
        offset = valueNode.range[2];
        const pair = new Pair(keyNode, valueNode);
        if (ctx.options.keepSourceTokens)
          pair.srcToken = collItem;
        map2.items.push(pair);
      } else {
        if (implicitKey)
          onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
        if (valueProps.comment) {
          if (keyNode.comment)
            keyNode.comment += "\n" + valueProps.comment;
          else
            keyNode.comment = valueProps.comment;
        }
        const pair = new Pair(keyNode);
        if (ctx.options.keepSourceTokens)
          pair.srcToken = collItem;
        map2.items.push(pair);
      }
    }
    if (commentEnd && commentEnd < offset)
      onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
    map2.range = [bm.offset, offset, commentEnd ?? offset];
    return map2;
  }

  // node_modules/yaml/browser/dist/compose/resolve-block-seq.js
  function resolveBlockSeq({ composeNode: composeNode2, composeEmptyNode: composeEmptyNode2 }, ctx, bs, onError, tag) {
    const NodeClass = tag?.nodeClass ?? YAMLSeq;
    const seq2 = new NodeClass(ctx.schema);
    if (ctx.atRoot)
      ctx.atRoot = false;
    if (ctx.atKey)
      ctx.atKey = false;
    let offset = bs.offset;
    let commentEnd = null;
    for (const { start, value } of bs.items) {
      const props = resolveProps(start, {
        indicator: "seq-item-ind",
        next: value,
        offset,
        onError,
        parentIndent: bs.indent,
        startOnNewline: true
      });
      if (!props.found) {
        if (props.anchor || props.tag || value) {
          if (value?.type === "block-seq")
            onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
          else
            onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
        } else {
          commentEnd = props.end;
          if (props.comment)
            seq2.comment = props.comment;
          continue;
        }
      }
      const node = value ? composeNode2(ctx, value, props, onError) : composeEmptyNode2(ctx, props.end, start, null, props, onError);
      if (ctx.schema.compat)
        flowIndentCheck(bs.indent, value, onError);
      offset = node.range[2];
      seq2.items.push(node);
    }
    seq2.range = [bs.offset, offset, commentEnd ?? offset];
    return seq2;
  }

  // node_modules/yaml/browser/dist/compose/resolve-end.js
  function resolveEnd(end, offset, reqSpace, onError) {
    let comment = "";
    if (end) {
      let hasSpace = false;
      let sep = "";
      for (const token of end) {
        const { source, type } = token;
        switch (type) {
          case "space":
            hasSpace = true;
            break;
          case "comment": {
            if (reqSpace && !hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += sep + cb;
            sep = "";
            break;
          }
          case "newline":
            if (comment)
              sep += source;
            hasSpace = true;
            break;
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
        }
        offset += source.length;
      }
    }
    return { comment, offset };
  }

  // node_modules/yaml/browser/dist/compose/resolve-flow-collection.js
  var blockMsg = "Block collections are not allowed within flow collections";
  var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
  function resolveFlowCollection({ composeNode: composeNode2, composeEmptyNode: composeEmptyNode2 }, ctx, fc, onError, tag) {
    const isMap2 = fc.start.source === "{";
    const fcName = isMap2 ? "flow map" : "flow sequence";
    const NodeClass = tag?.nodeClass ?? (isMap2 ? YAMLMap : YAMLSeq);
    const coll = new NodeClass(ctx.schema);
    coll.flow = true;
    const atRoot = ctx.atRoot;
    if (atRoot)
      ctx.atRoot = false;
    if (ctx.atKey)
      ctx.atKey = false;
    let offset = fc.offset + fc.start.source.length;
    for (let i = 0; i < fc.items.length; ++i) {
      const collItem = fc.items[i];
      const { start, key, sep, value } = collItem;
      const props = resolveProps(start, {
        flow: fcName,
        indicator: "explicit-key-ind",
        next: key ?? sep?.[0],
        offset,
        onError,
        parentIndent: fc.indent,
        startOnNewline: false
      });
      if (!props.found) {
        if (!props.anchor && !props.tag && !sep && !value) {
          if (i === 0 && props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
          else if (i < fc.items.length - 1)
            onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
          if (props.comment) {
            if (coll.comment)
              coll.comment += "\n" + props.comment;
            else
              coll.comment = props.comment;
          }
          offset = props.end;
          continue;
        }
        if (!isMap2 && ctx.options.strict && containsNewline(key))
          onError(
            key,
            // checked by containsNewline()
            "MULTILINE_IMPLICIT_KEY",
            "Implicit keys of flow sequence pairs need to be on a single line"
          );
      }
      if (i === 0) {
        if (props.comma)
          onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
      } else {
        if (!props.comma)
          onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
        if (props.comment) {
          let prevItemComment = "";
          loop: for (const st of start) {
            switch (st.type) {
              case "comma":
              case "space":
                break;
              case "comment":
                prevItemComment = st.source.substring(1);
                break loop;
              default:
                break loop;
            }
          }
          if (prevItemComment) {
            let prev = coll.items[coll.items.length - 1];
            if (isPair(prev))
              prev = prev.value ?? prev.key;
            if (prev.comment)
              prev.comment += "\n" + prevItemComment;
            else
              prev.comment = prevItemComment;
            props.comment = props.comment.substring(prevItemComment.length + 1);
          }
        }
      }
      if (!isMap2 && !sep && !props.found) {
        const valueNode = value ? composeNode2(ctx, value, props, onError) : composeEmptyNode2(ctx, props.end, sep, null, props, onError);
        coll.items.push(valueNode);
        offset = valueNode.range[2];
        if (isBlock(value))
          onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
      } else {
        ctx.atKey = true;
        const keyStart = props.end;
        const keyNode = key ? composeNode2(ctx, key, props, onError) : composeEmptyNode2(ctx, keyStart, start, null, props, onError);
        if (isBlock(key))
          onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
        ctx.atKey = false;
        const valueProps = resolveProps(sep ?? [], {
          flow: fcName,
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (valueProps.found) {
          if (!isMap2 && !props.found && ctx.options.strict) {
            if (sep)
              for (const st of sep) {
                if (st === valueProps.found)
                  break;
                if (st.type === "newline") {
                  onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                  break;
                }
              }
            if (props.start < valueProps.found.offset - 1024)
              onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
          }
        } else if (value) {
          if ("source" in value && value.source?.[0] === ":")
            onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
          else
            onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
        }
        const valueNode = value ? composeNode2(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode2(ctx, valueProps.end, sep, null, valueProps, onError) : null;
        if (valueNode) {
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else if (valueProps.comment) {
          if (keyNode.comment)
            keyNode.comment += "\n" + valueProps.comment;
          else
            keyNode.comment = valueProps.comment;
        }
        const pair = new Pair(keyNode, valueNode);
        if (ctx.options.keepSourceTokens)
          pair.srcToken = collItem;
        if (isMap2) {
          const map2 = coll;
          if (mapIncludes(ctx, map2.items, keyNode))
            onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
          map2.items.push(pair);
        } else {
          const map2 = new YAMLMap(ctx.schema);
          map2.flow = true;
          map2.items.push(pair);
          const endRange = (valueNode ?? keyNode).range;
          map2.range = [keyNode.range[0], endRange[1], endRange[2]];
          coll.items.push(map2);
        }
        offset = valueNode ? valueNode.range[2] : valueProps.end;
      }
    }
    const expectedEnd = isMap2 ? "}" : "]";
    const [ce, ...ee] = fc.end;
    let cePos = offset;
    if (ce?.source === expectedEnd)
      cePos = ce.offset + ce.source.length;
    else {
      const name = fcName[0].toUpperCase() + fcName.substring(1);
      const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
      onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
      if (ce && ce.source.length !== 1)
        ee.unshift(ce);
    }
    if (ee.length > 0) {
      const end = resolveEnd(ee, cePos, ctx.options.strict, onError);
      if (end.comment) {
        if (coll.comment)
          coll.comment += "\n" + end.comment;
        else
          coll.comment = end.comment;
      }
      coll.range = [fc.offset, cePos, end.offset];
    } else {
      coll.range = [fc.offset, cePos, cePos];
    }
    return coll;
  }

  // node_modules/yaml/browser/dist/compose/compose-collection.js
  function resolveCollection(CN2, ctx, token, onError, tagName, tag) {
    const coll = token.type === "block-map" ? resolveBlockMap(CN2, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq(CN2, ctx, token, onError, tag) : resolveFlowCollection(CN2, ctx, token, onError, tag);
    const Coll = coll.constructor;
    if (tagName === "!" || tagName === Coll.tagName) {
      coll.tag = Coll.tagName;
      return coll;
    }
    if (tagName)
      coll.tag = tagName;
    return coll;
  }
  function composeCollection(CN2, ctx, token, props, onError) {
    const tagToken = props.tag;
    const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
    if (token.type === "block-seq") {
      const { anchor, newlineAfterProp: nl } = props;
      const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
      if (lastProp && (!nl || nl.offset < lastProp.offset)) {
        const message = "Missing newline after block sequence props";
        onError(lastProp, "MISSING_CHAR", message);
      }
    }
    const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
    if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.tagName && expType === "seq") {
      return resolveCollection(CN2, ctx, token, onError, tagName);
    }
    let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
    if (!tag) {
      const kt = ctx.schema.knownTags[tagName];
      if (kt?.collection === expType) {
        ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
        tag = kt;
      } else {
        if (kt) {
          onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
        } else {
          onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
        }
        return resolveCollection(CN2, ctx, token, onError, tagName);
      }
    }
    const coll = resolveCollection(CN2, ctx, token, onError, tagName, tag);
    const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
    const node = isNode(res) ? res : new Scalar(res);
    node.range = coll.range;
    node.tag = tagName;
    if (tag?.format)
      node.format = tag.format;
    return node;
  }

  // node_modules/yaml/browser/dist/compose/resolve-block-scalar.js
  function resolveBlockScalar(ctx, scalar, onError) {
    const start = scalar.offset;
    const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
    if (!header)
      return { value: "", type: null, comment: "", range: [start, start, start] };
    const type = header.mode === ">" ? Scalar.BLOCK_FOLDED : Scalar.BLOCK_LITERAL;
    const lines = scalar.source ? splitLines(scalar.source) : [];
    let chompStart = lines.length;
    for (let i = lines.length - 1; i >= 0; --i) {
      const content = lines[i][1];
      if (content === "" || content === "\r")
        chompStart = i;
      else
        break;
    }
    if (chompStart === 0) {
      const value2 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
      let end2 = start + header.length;
      if (scalar.source)
        end2 += scalar.source.length;
      return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
    }
    let trimIndent = scalar.indent + header.indent;
    let offset = scalar.offset + header.length;
    let contentStart = 0;
    for (let i = 0; i < chompStart; ++i) {
      const [indent2, content] = lines[i];
      if (content === "" || content === "\r") {
        if (header.indent === 0 && indent2.length > trimIndent)
          trimIndent = indent2.length;
      } else {
        if (indent2.length < trimIndent) {
          const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
          onError(offset + indent2.length, "MISSING_CHAR", message);
        }
        if (header.indent === 0)
          trimIndent = indent2.length;
        contentStart = i;
        if (trimIndent === 0 && !ctx.atRoot) {
          const message = "Block scalar values in collections must be indented";
          onError(offset, "BAD_INDENT", message);
        }
        break;
      }
      offset += indent2.length + content.length + 1;
    }
    for (let i = lines.length - 1; i >= chompStart; --i) {
      if (lines[i][0].length > trimIndent)
        chompStart = i + 1;
    }
    let value = "";
    let sep = "";
    let prevMoreIndented = false;
    for (let i = 0; i < contentStart; ++i)
      value += lines[i][0].slice(trimIndent) + "\n";
    for (let i = contentStart; i < chompStart; ++i) {
      let [indent2, content] = lines[i];
      offset += indent2.length + content.length + 1;
      const crlf = content[content.length - 1] === "\r";
      if (crlf)
        content = content.slice(0, -1);
      if (content && indent2.length < trimIndent) {
        const src = header.indent ? "explicit indentation indicator" : "first line";
        const message = `Block scalar lines must not be less indented than their ${src}`;
        onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
        indent2 = "";
      }
      if (type === Scalar.BLOCK_LITERAL) {
        value += sep + indent2.slice(trimIndent) + content;
        sep = "\n";
      } else if (indent2.length > trimIndent || content[0] === "	") {
        if (sep === " ")
          sep = "\n";
        else if (!prevMoreIndented && sep === "\n")
          sep = "\n\n";
        value += sep + indent2.slice(trimIndent) + content;
        sep = "\n";
        prevMoreIndented = true;
      } else if (content === "") {
        if (sep === "\n")
          value += "\n";
        else
          sep = "\n";
      } else {
        value += sep + content;
        sep = " ";
        prevMoreIndented = false;
      }
    }
    switch (header.chomp) {
      case "-":
        break;
      case "+":
        for (let i = chompStart; i < lines.length; ++i)
          value += "\n" + lines[i][0].slice(trimIndent);
        if (value[value.length - 1] !== "\n")
          value += "\n";
        break;
      default:
        value += "\n";
    }
    const end = start + header.length + scalar.source.length;
    return { value, type, comment: header.comment, range: [start, end, end] };
  }
  function parseBlockScalarHeader({ offset, props }, strict, onError) {
    if (props[0].type !== "block-scalar-header") {
      onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
      return null;
    }
    const { source } = props[0];
    const mode = source[0];
    let indent2 = 0;
    let chomp = "";
    let error = -1;
    for (let i = 1; i < source.length; ++i) {
      const ch = source[i];
      if (!chomp && (ch === "-" || ch === "+"))
        chomp = ch;
      else {
        const n = Number(ch);
        if (!indent2 && n)
          indent2 = n;
        else if (error === -1)
          error = offset + i;
      }
    }
    if (error !== -1)
      onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
    let hasSpace = false;
    let comment = "";
    let length = source.length;
    for (let i = 1; i < props.length; ++i) {
      const token = props[i];
      switch (token.type) {
        case "space":
          hasSpace = true;
        // fallthrough
        case "newline":
          length += token.source.length;
          break;
        case "comment":
          if (strict && !hasSpace) {
            const message = "Comments must be separated from other tokens by white space characters";
            onError(token, "MISSING_CHAR", message);
          }
          length += token.source.length;
          comment = token.source.substring(1);
          break;
        case "error":
          onError(token, "UNEXPECTED_TOKEN", token.message);
          length += token.source.length;
          break;
        /* istanbul ignore next should not happen */
        default: {
          const message = `Unexpected token in block scalar header: ${token.type}`;
          onError(token, "UNEXPECTED_TOKEN", message);
          const ts = token.source;
          if (ts && typeof ts === "string")
            length += ts.length;
        }
      }
    }
    return { mode, indent: indent2, chomp, comment, length };
  }
  function splitLines(source) {
    const split = source.split(/\n( *)/);
    const first = split[0];
    const m = first.match(/^( *)/);
    const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
    const lines = [line0];
    for (let i = 1; i < split.length; i += 2)
      lines.push([split[i], split[i + 1]]);
    return lines;
  }

  // node_modules/yaml/browser/dist/compose/resolve-flow-scalar.js
  function resolveFlowScalar(scalar, strict, onError) {
    const { offset, type, source, end } = scalar;
    let _type;
    let value;
    const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
    switch (type) {
      case "scalar":
        _type = Scalar.PLAIN;
        value = plainValue(source, _onError);
        break;
      case "single-quoted-scalar":
        _type = Scalar.QUOTE_SINGLE;
        value = singleQuotedValue(source, _onError);
        break;
      case "double-quoted-scalar":
        _type = Scalar.QUOTE_DOUBLE;
        value = doubleQuotedValue(source, _onError);
        break;
      /* istanbul ignore next should not happen */
      default:
        onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
        return {
          value: "",
          type: null,
          comment: "",
          range: [offset, offset + source.length, offset + source.length]
        };
    }
    const valueEnd = offset + source.length;
    const re = resolveEnd(end, valueEnd, strict, onError);
    return {
      value,
      type: _type,
      comment: re.comment,
      range: [offset, valueEnd, re.offset]
    };
  }
  function plainValue(source, onError) {
    let badChar = "";
    switch (source[0]) {
      /* istanbul ignore next should not happen */
      case "	":
        badChar = "a tab character";
        break;
      case ",":
        badChar = "flow indicator character ,";
        break;
      case "%":
        badChar = "directive indicator character %";
        break;
      case "|":
      case ">": {
        badChar = `block scalar indicator ${source[0]}`;
        break;
      }
      case "@":
      case "`": {
        badChar = `reserved character ${source[0]}`;
        break;
      }
    }
    if (badChar)
      onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
    return foldLines(source);
  }
  function singleQuotedValue(source, onError) {
    if (source[source.length - 1] !== "'" || source.length === 1)
      onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
    return foldLines(source.slice(1, -1)).replace(/''/g, "'");
  }
  function foldLines(source) {
    let first, line;
    try {
      first = new RegExp("(.*?)(?<![ 	])[ 	]*\r?\n", "sy");
      line = new RegExp("[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?\n", "sy");
    } catch {
      first = /(.*?)[ \t]*\r?\n/sy;
      line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
    }
    let match = first.exec(source);
    if (!match)
      return source;
    let res = match[1];
    let sep = " ";
    let pos = first.lastIndex;
    line.lastIndex = pos;
    while (match = line.exec(source)) {
      if (match[1] === "") {
        if (sep === "\n")
          res += sep;
        else
          sep = "\n";
      } else {
        res += sep + match[1];
        sep = " ";
      }
      pos = line.lastIndex;
    }
    const last = /[ \t]*(.*)/sy;
    last.lastIndex = pos;
    match = last.exec(source);
    return res + sep + (match?.[1] ?? "");
  }
  function doubleQuotedValue(source, onError) {
    let res = "";
    for (let i = 1; i < source.length - 1; ++i) {
      const ch = source[i];
      if (ch === "\r" && source[i + 1] === "\n")
        continue;
      if (ch === "\n") {
        const { fold, offset } = foldNewline(source, i);
        res += fold;
        i = offset;
      } else if (ch === "\\") {
        let next = source[++i];
        const cc = escapeCodes[next];
        if (cc)
          res += cc;
        else if (next === "\n") {
          next = source[i + 1];
          while (next === " " || next === "	")
            next = source[++i + 1];
        } else if (next === "\r" && source[i + 1] === "\n") {
          next = source[++i + 1];
          while (next === " " || next === "	")
            next = source[++i + 1];
        } else if (next === "x" || next === "u" || next === "U") {
          const length = next === "x" ? 2 : next === "u" ? 4 : 8;
          res += parseCharCode(source, i + 1, length, onError);
          i += length;
        } else {
          const raw = source.substr(i - 1, 2);
          onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
          res += raw;
        }
      } else if (ch === " " || ch === "	") {
        const wsStart = i;
        let next = source[i + 1];
        while (next === " " || next === "	")
          next = source[++i + 1];
        if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n"))
          res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
      } else {
        res += ch;
      }
    }
    if (source[source.length - 1] !== '"' || source.length === 1)
      onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
    return res;
  }
  function foldNewline(source, offset) {
    let fold = "";
    let ch = source[offset + 1];
    while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
      if (ch === "\r" && source[offset + 2] !== "\n")
        break;
      if (ch === "\n")
        fold += "\n";
      offset += 1;
      ch = source[offset + 1];
    }
    if (!fold)
      fold = " ";
    return { fold, offset };
  }
  var escapeCodes = {
    "0": "\0",
    // null character
    a: "\x07",
    // bell character
    b: "\b",
    // backspace
    e: "\x1B",
    // escape character
    f: "\f",
    // form feed
    n: "\n",
    // line feed
    r: "\r",
    // carriage return
    t: "	",
    // horizontal tab
    v: "\v",
    // vertical tab
    N: "\x85",
    // Unicode next line
    _: "\xA0",
    // Unicode non-breaking space
    L: "\u2028",
    // Unicode line separator
    P: "\u2029",
    // Unicode paragraph separator
    " ": " ",
    '"': '"',
    "/": "/",
    "\\": "\\",
    "	": "	"
  };
  function parseCharCode(source, offset, length, onError) {
    const cc = source.substr(offset, length);
    const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
    const code = ok ? parseInt(cc, 16) : NaN;
    try {
      return String.fromCodePoint(code);
    } catch {
      const raw = source.substr(offset - 2, length + 2);
      onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
      return raw;
    }
  }

  // node_modules/yaml/browser/dist/compose/compose-scalar.js
  function composeScalar(ctx, token, tagToken, onError) {
    const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar(ctx, token, onError) : resolveFlowScalar(token, ctx.options.strict, onError);
    const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
    let tag;
    if (ctx.options.stringKeys && ctx.atKey) {
      tag = ctx.schema[SCALAR];
    } else if (tagName)
      tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
    else if (token.type === "scalar")
      tag = findScalarTagByTest(ctx, value, token, onError);
    else
      tag = ctx.schema[SCALAR];
    let scalar;
    try {
      const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
      scalar = isScalar(res) ? res : new Scalar(res);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
      scalar = new Scalar(value);
    }
    scalar.range = range;
    scalar.source = value;
    if (type)
      scalar.type = type;
    if (tagName)
      scalar.tag = tagName;
    if (tag.format)
      scalar.format = tag.format;
    if (comment)
      scalar.comment = comment;
    return scalar;
  }
  function findScalarTagByName(schema4, value, tagName, tagToken, onError) {
    if (tagName === "!")
      return schema4[SCALAR];
    const matchWithTest = [];
    for (const tag of schema4.tags) {
      if (!tag.collection && tag.tag === tagName) {
        if (tag.default && tag.test)
          matchWithTest.push(tag);
        else
          return tag;
      }
    }
    for (const tag of matchWithTest)
      if (tag.test?.test(value))
        return tag;
    const kt = schema4.knownTags[tagName];
    if (kt && !kt.collection) {
      schema4.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
      return kt;
    }
    onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
    return schema4[SCALAR];
  }
  function findScalarTagByTest({ atKey, directives, schema: schema4 }, value, token, onError) {
    const tag = schema4.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema4[SCALAR];
    if (schema4.compat) {
      const compat = schema4.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema4[SCALAR];
      if (tag.tag !== compat.tag) {
        const ts = directives.tagString(tag.tag);
        const cs = directives.tagString(compat.tag);
        const msg = `Value may be parsed as either ${ts} or ${cs}`;
        onError(token, "TAG_RESOLVE_FAILED", msg, true);
      }
    }
    return tag;
  }

  // node_modules/yaml/browser/dist/compose/util-empty-scalar-position.js
  function emptyScalarPosition(offset, before, pos) {
    if (before) {
      pos ?? (pos = before.length);
      for (let i = pos - 1; i >= 0; --i) {
        let st = before[i];
        switch (st.type) {
          case "space":
          case "comment":
          case "newline":
            offset -= st.source.length;
            continue;
        }
        st = before[++i];
        while (st?.type === "space") {
          offset += st.source.length;
          st = before[++i];
        }
        break;
      }
    }
    return offset;
  }

  // node_modules/yaml/browser/dist/compose/compose-node.js
  var CN = { composeNode, composeEmptyNode };
  function composeNode(ctx, token, props, onError) {
    const atKey = ctx.atKey;
    const { spaceBefore, comment, anchor, tag } = props;
    let node;
    let isSrcToken = true;
    switch (token.type) {
      case "alias":
        node = composeAlias(ctx, token, onError);
        if (anchor || tag)
          onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
        break;
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "block-scalar":
        node = composeScalar(ctx, token, tag, onError);
        if (anchor)
          node.anchor = anchor.source.substring(1);
        break;
      case "block-map":
      case "block-seq":
      case "flow-collection":
        try {
          node = composeCollection(CN, ctx, token, props, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          onError(token, "RESOURCE_EXHAUSTION", message);
        }
        break;
      default: {
        const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
        onError(token, "UNEXPECTED_TOKEN", message);
        isSrcToken = false;
      }
    }
    node ?? (node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError));
    if (anchor && node.anchor === "")
      onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
    if (atKey && ctx.options.stringKeys && (!isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
      const msg = "With stringKeys, all keys must be strings";
      onError(tag ?? token, "NON_STRING_KEY", msg);
    }
    if (spaceBefore)
      node.spaceBefore = true;
    if (comment) {
      if (token.type === "scalar" && token.source === "")
        node.comment = comment;
      else
        node.commentBefore = comment;
    }
    if (ctx.options.keepSourceTokens && isSrcToken)
      node.srcToken = token;
    return node;
  }
  function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
    const token = {
      type: "scalar",
      offset: emptyScalarPosition(offset, before, pos),
      indent: -1,
      source: ""
    };
    const node = composeScalar(ctx, token, tag, onError);
    if (anchor) {
      node.anchor = anchor.source.substring(1);
      if (node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
    }
    if (spaceBefore)
      node.spaceBefore = true;
    if (comment) {
      node.comment = comment;
      node.range[2] = end;
    }
    return node;
  }
  function composeAlias({ options }, { offset, source, end }, onError) {
    const alias = new Alias(source.substring(1));
    if (alias.source === "")
      onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
    if (alias.source.endsWith(":"))
      onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
    const valueEnd = offset + source.length;
    const re = resolveEnd(end, valueEnd, options.strict, onError);
    alias.range = [offset, valueEnd, re.offset];
    if (re.comment)
      alias.comment = re.comment;
    return alias;
  }

  // node_modules/yaml/browser/dist/compose/compose-doc.js
  function composeDoc(options, directives, { offset, start, value, end }, onError) {
    const opts = Object.assign({ _directives: directives }, options);
    const doc = new Document(void 0, opts);
    const ctx = {
      atKey: false,
      atRoot: true,
      directives: doc.directives,
      options: doc.options,
      schema: doc.schema
    };
    const props = resolveProps(start, {
      indicator: "doc-start",
      next: value ?? end?.[0],
      offset,
      onError,
      parentIndent: 0,
      startOnNewline: true
    });
    if (props.found) {
      doc.directives.docStart = true;
      if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
        onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
    }
    doc.contents = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
    const contentEnd = doc.contents.range[2];
    const re = resolveEnd(end, contentEnd, false, onError);
    if (re.comment)
      doc.comment = re.comment;
    doc.range = [offset, contentEnd, re.offset];
    return doc;
  }

  // node_modules/yaml/browser/dist/compose/composer.js
  function getErrorPos(src) {
    if (typeof src === "number")
      return [src, src + 1];
    if (Array.isArray(src))
      return src.length === 2 ? src : [src[0], src[1]];
    const { offset, source } = src;
    return [offset, offset + (typeof source === "string" ? source.length : 1)];
  }
  function parsePrelude(prelude) {
    let comment = "";
    let atComment = false;
    let afterEmptyLine = false;
    for (let i = 0; i < prelude.length; ++i) {
      const source = prelude[i];
      switch (source[0]) {
        case "#":
          comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
          atComment = true;
          afterEmptyLine = false;
          break;
        case "%":
          if (prelude[i + 1]?.[0] !== "#")
            i += 1;
          atComment = false;
          break;
        default:
          if (!atComment)
            afterEmptyLine = true;
          atComment = false;
      }
    }
    return { comment, afterEmptyLine };
  }
  var Composer = class {
    constructor(options = {}) {
      this.doc = null;
      this.atDirectives = false;
      this.prelude = [];
      this.errors = [];
      this.warnings = [];
      this.onError = (source, code, message, warning) => {
        const pos = getErrorPos(source);
        if (warning)
          this.warnings.push(new YAMLWarning(pos, code, message));
        else
          this.errors.push(new YAMLParseError(pos, code, message));
      };
      this.directives = new Directives({ version: options.version || "1.2" });
      this.options = options;
    }
    decorate(doc, afterDoc) {
      const { comment, afterEmptyLine } = parsePrelude(this.prelude);
      if (comment) {
        const dc = doc.contents;
        if (afterDoc) {
          doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
        } else if (afterEmptyLine || doc.directives.docStart || !dc) {
          doc.commentBefore = comment;
        } else if (isCollection(dc) && !dc.flow && dc.items.length > 0) {
          let it2 = dc.items[0];
          if (isPair(it2))
            it2 = it2.key;
          const cb = it2.commentBefore;
          it2.commentBefore = cb ? `${comment}
${cb}` : comment;
        } else {
          const cb = dc.commentBefore;
          dc.commentBefore = cb ? `${comment}
${cb}` : comment;
        }
      }
      if (afterDoc) {
        for (let i = 0; i < this.errors.length; ++i)
          doc.errors.push(this.errors[i]);
        for (let i = 0; i < this.warnings.length; ++i)
          doc.warnings.push(this.warnings[i]);
      } else {
        doc.errors = this.errors;
        doc.warnings = this.warnings;
      }
      this.prelude = [];
      this.errors = [];
      this.warnings = [];
    }
    /**
     * Current stream status information.
     *
     * Mostly useful at the end of input for an empty stream.
     */
    streamInfo() {
      return {
        comment: parsePrelude(this.prelude).comment,
        directives: this.directives,
        errors: this.errors,
        warnings: this.warnings
      };
    }
    /**
     * Compose tokens into documents.
     *
     * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
     * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
     */
    *compose(tokens, forceDoc = false, endOffset = -1) {
      for (const token of tokens)
        yield* this.next(token);
      yield* this.end(forceDoc, endOffset);
    }
    /** Advance the composer by one CST token. */
    *next(token) {
      switch (token.type) {
        case "directive":
          this.directives.add(token.source, (offset, message, warning) => {
            const pos = getErrorPos(token);
            pos[0] += offset;
            this.onError(pos, "BAD_DIRECTIVE", message, warning);
          });
          this.prelude.push(token.source);
          this.atDirectives = true;
          break;
        case "document": {
          const doc = composeDoc(this.options, this.directives, token, this.onError);
          if (this.atDirectives && !doc.directives.docStart)
            this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
          this.decorate(doc, false);
          if (this.doc)
            yield this.doc;
          this.doc = doc;
          this.atDirectives = false;
          break;
        }
        case "byte-order-mark":
        case "space":
          break;
        case "comment":
        case "newline":
          this.prelude.push(token.source);
          break;
        case "error": {
          const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
          const error = new YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
          if (this.atDirectives || !this.doc)
            this.errors.push(error);
          else
            this.doc.errors.push(error);
          break;
        }
        case "doc-end": {
          if (!this.doc) {
            const msg = "Unexpected doc-end without preceding document";
            this.errors.push(new YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
            break;
          }
          this.doc.directives.docEnd = true;
          const end = resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
          this.decorate(this.doc, true);
          if (end.comment) {
            const dc = this.doc.comment;
            this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
          }
          this.doc.range[2] = end.offset;
          break;
        }
        default:
          this.errors.push(new YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
      }
    }
    /**
     * Call at end of input to yield any remaining document.
     *
     * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
     * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
     */
    *end(forceDoc = false, endOffset = -1) {
      if (this.doc) {
        this.decorate(this.doc, true);
        yield this.doc;
        this.doc = null;
      } else if (forceDoc) {
        const opts = Object.assign({ _directives: this.directives }, this.options);
        const doc = new Document(void 0, opts);
        if (this.atDirectives)
          this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
        doc.range = [0, endOffset, endOffset];
        this.decorate(doc, false);
        yield doc;
      }
    }
  };

  // node_modules/yaml/browser/dist/parse/cst.js
  var cst_exports = {};
  __export(cst_exports, {
    BOM: () => BOM,
    DOCUMENT: () => DOCUMENT,
    FLOW_END: () => FLOW_END,
    SCALAR: () => SCALAR2,
    createScalarToken: () => createScalarToken,
    isCollection: () => isCollection2,
    isScalar: () => isScalar2,
    prettyToken: () => prettyToken,
    resolveAsScalar: () => resolveAsScalar,
    setScalarValue: () => setScalarValue,
    stringify: () => stringify2,
    tokenType: () => tokenType,
    visit: () => visit2
  });

  // node_modules/yaml/browser/dist/parse/cst-scalar.js
  function resolveAsScalar(token, strict = true, onError) {
    if (token) {
      const _onError = (pos, code, message) => {
        const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
        if (onError)
          onError(offset, code, message);
        else
          throw new YAMLParseError([offset, offset + 1], code, message);
      };
      switch (token.type) {
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return resolveFlowScalar(token, strict, _onError);
        case "block-scalar":
          return resolveBlockScalar({ options: { strict } }, token, _onError);
      }
    }
    return null;
  }
  function createScalarToken(value, context) {
    const { implicitKey = false, indent: indent2, inFlow = false, offset = -1, type = "PLAIN" } = context;
    const source = stringifyString({ type, value }, {
      implicitKey,
      indent: indent2 > 0 ? " ".repeat(indent2) : "",
      inFlow,
      options: { blockQuote: true, lineWidth: -1 }
    });
    const end = context.end ?? [
      { type: "newline", offset: -1, indent: indent2, source: "\n" }
    ];
    switch (source[0]) {
      case "|":
      case ">": {
        const he = source.indexOf("\n");
        const head = source.substring(0, he);
        const body = source.substring(he + 1) + "\n";
        const props = [
          { type: "block-scalar-header", offset, indent: indent2, source: head }
        ];
        if (!addEndtoBlockProps(props, end))
          props.push({ type: "newline", offset: -1, indent: indent2, source: "\n" });
        return { type: "block-scalar", offset, indent: indent2, props, source: body };
      }
      case '"':
        return { type: "double-quoted-scalar", offset, indent: indent2, source, end };
      case "'":
        return { type: "single-quoted-scalar", offset, indent: indent2, source, end };
      default:
        return { type: "scalar", offset, indent: indent2, source, end };
    }
  }
  function setScalarValue(token, value, context = {}) {
    let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
    let indent2 = "indent" in token ? token.indent : null;
    if (afterKey && typeof indent2 === "number")
      indent2 += 2;
    if (!type)
      switch (token.type) {
        case "single-quoted-scalar":
          type = "QUOTE_SINGLE";
          break;
        case "double-quoted-scalar":
          type = "QUOTE_DOUBLE";
          break;
        case "block-scalar": {
          const header = token.props[0];
          if (header.type !== "block-scalar-header")
            throw new Error("Invalid block scalar header");
          type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
          break;
        }
        default:
          type = "PLAIN";
      }
    const source = stringifyString({ type, value }, {
      implicitKey: implicitKey || indent2 === null,
      indent: indent2 !== null && indent2 > 0 ? " ".repeat(indent2) : "",
      inFlow,
      options: { blockQuote: true, lineWidth: -1 }
    });
    switch (source[0]) {
      case "|":
      case ">":
        setBlockScalarValue(token, source);
        break;
      case '"':
        setFlowScalarValue(token, source, "double-quoted-scalar");
        break;
      case "'":
        setFlowScalarValue(token, source, "single-quoted-scalar");
        break;
      default:
        setFlowScalarValue(token, source, "scalar");
    }
  }
  function setBlockScalarValue(token, source) {
    const he = source.indexOf("\n");
    const head = source.substring(0, he);
    const body = source.substring(he + 1) + "\n";
    if (token.type === "block-scalar") {
      const header = token.props[0];
      if (header.type !== "block-scalar-header")
        throw new Error("Invalid block scalar header");
      header.source = head;
      token.source = body;
    } else {
      const { offset } = token;
      const indent2 = "indent" in token ? token.indent : -1;
      const props = [
        { type: "block-scalar-header", offset, indent: indent2, source: head }
      ];
      if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
        props.push({ type: "newline", offset: -1, indent: indent2, source: "\n" });
      for (const key of Object.keys(token))
        if (key !== "type" && key !== "offset")
          delete token[key];
      Object.assign(token, { type: "block-scalar", indent: indent2, props, source: body });
    }
  }
  function addEndtoBlockProps(props, end) {
    if (end)
      for (const st of end)
        switch (st.type) {
          case "space":
          case "comment":
            props.push(st);
            break;
          case "newline":
            props.push(st);
            return true;
        }
    return false;
  }
  function setFlowScalarValue(token, source, type) {
    switch (token.type) {
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        token.type = type;
        token.source = source;
        break;
      case "block-scalar": {
        const end = token.props.slice(1);
        let oa = source.length;
        if (token.props[0].type === "block-scalar-header")
          oa -= token.props[0].source.length;
        for (const tok of end)
          tok.offset += oa;
        delete token.props;
        Object.assign(token, { type, source, end });
        break;
      }
      case "block-map":
      case "block-seq": {
        const offset = token.offset + source.length;
        const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
        delete token.items;
        Object.assign(token, { type, source, end: [nl] });
        break;
      }
      default: {
        const indent2 = "indent" in token ? token.indent : -1;
        const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type, indent: indent2, source, end });
      }
    }
  }

  // node_modules/yaml/browser/dist/parse/cst-stringify.js
  var stringify2 = (cst) => "type" in cst ? stringifyToken(cst) : stringifyItem(cst);
  function stringifyToken(token) {
    switch (token.type) {
      case "block-scalar": {
        let res = "";
        for (const tok of token.props)
          res += stringifyToken(tok);
        return res + token.source;
      }
      case "block-map":
      case "block-seq": {
        let res = "";
        for (const item of token.items)
          res += stringifyItem(item);
        return res;
      }
      case "flow-collection": {
        let res = token.start.source;
        for (const item of token.items)
          res += stringifyItem(item);
        for (const st of token.end)
          res += st.source;
        return res;
      }
      case "document": {
        let res = stringifyItem(token);
        if (token.end)
          for (const st of token.end)
            res += st.source;
        return res;
      }
      default: {
        let res = token.source;
        if ("end" in token && token.end)
          for (const st of token.end)
            res += st.source;
        return res;
      }
    }
  }
  function stringifyItem({ start, key, sep, value }) {
    let res = "";
    for (const st of start)
      res += st.source;
    if (key)
      res += stringifyToken(key);
    if (sep)
      for (const st of sep)
        res += st.source;
    if (value)
      res += stringifyToken(value);
    return res;
  }

  // node_modules/yaml/browser/dist/parse/cst-visit.js
  var BREAK2 = /* @__PURE__ */ Symbol("break visit");
  var SKIP2 = /* @__PURE__ */ Symbol("skip children");
  var REMOVE2 = /* @__PURE__ */ Symbol("remove item");
  function visit2(cst, visitor) {
    if ("type" in cst && cst.type === "document")
      cst = { start: cst.start, value: cst.value };
    _visit(Object.freeze([]), cst, visitor);
  }
  visit2.BREAK = BREAK2;
  visit2.SKIP = SKIP2;
  visit2.REMOVE = REMOVE2;
  visit2.itemAtPath = (cst, path) => {
    let item = cst;
    for (const [field, index] of path) {
      const tok = item?.[field];
      if (tok && "items" in tok) {
        item = tok.items[index];
      } else
        return void 0;
    }
    return item;
  };
  visit2.parentCollection = (cst, path) => {
    const parent = visit2.itemAtPath(cst, path.slice(0, -1));
    const field = path[path.length - 1][0];
    const coll = parent?.[field];
    if (coll && "items" in coll)
      return coll;
    throw new Error("Parent collection not found");
  };
  function _visit(path, item, visitor) {
    let ctrl = visitor(item, path);
    if (typeof ctrl === "symbol")
      return ctrl;
    for (const field of ["key", "value"]) {
      const token = item[field];
      if (token && "items" in token) {
        for (let i = 0; i < token.items.length; ++i) {
          const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
          if (typeof ci === "number")
            i = ci - 1;
          else if (ci === BREAK2)
            return BREAK2;
          else if (ci === REMOVE2) {
            token.items.splice(i, 1);
            i -= 1;
          }
        }
        if (typeof ctrl === "function" && field === "key")
          ctrl = ctrl(item, path);
      }
    }
    return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
  }

  // node_modules/yaml/browser/dist/parse/cst.js
  var BOM = "\uFEFF";
  var DOCUMENT = "";
  var FLOW_END = "";
  var SCALAR2 = "";
  var isCollection2 = (token) => !!token && "items" in token;
  var isScalar2 = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
  function prettyToken(token) {
    switch (token) {
      case BOM:
        return "<BOM>";
      case DOCUMENT:
        return "<DOC>";
      case FLOW_END:
        return "<FLOW_END>";
      case SCALAR2:
        return "<SCALAR>";
      default:
        return JSON.stringify(token);
    }
  }
  function tokenType(source) {
    switch (source) {
      case BOM:
        return "byte-order-mark";
      case DOCUMENT:
        return "doc-mode";
      case FLOW_END:
        return "flow-error-end";
      case SCALAR2:
        return "scalar";
      case "---":
        return "doc-start";
      case "...":
        return "doc-end";
      case "":
      case "\n":
      case "\r\n":
        return "newline";
      case "-":
        return "seq-item-ind";
      case "?":
        return "explicit-key-ind";
      case ":":
        return "map-value-ind";
      case "{":
        return "flow-map-start";
      case "}":
        return "flow-map-end";
      case "[":
        return "flow-seq-start";
      case "]":
        return "flow-seq-end";
      case ",":
        return "comma";
    }
    switch (source[0]) {
      case " ":
      case "	":
        return "space";
      case "#":
        return "comment";
      case "%":
        return "directive-line";
      case "*":
        return "alias";
      case "&":
        return "anchor";
      case "!":
        return "tag";
      case "'":
        return "single-quoted-scalar";
      case '"':
        return "double-quoted-scalar";
      case "|":
      case ">":
        return "block-scalar-header";
    }
    return null;
  }

  // node_modules/yaml/browser/dist/parse/lexer.js
  function isEmpty(ch) {
    switch (ch) {
      case void 0:
      case " ":
      case "\n":
      case "\r":
      case "	":
        return true;
      default:
        return false;
    }
  }
  var hexDigits = new Set("0123456789ABCDEFabcdef");
  var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
  var flowIndicatorChars = new Set(",[]{}");
  var invalidAnchorChars = new Set(" ,[]{}\n\r	");
  var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
  var Lexer = class {
    constructor() {
      this.atEnd = false;
      this.blockScalarIndent = -1;
      this.blockScalarKeep = false;
      this.buffer = "";
      this.flowKey = false;
      this.flowLevel = 0;
      this.indentNext = 0;
      this.indentValue = 0;
      this.lineEndPos = null;
      this.next = null;
      this.pos = 0;
    }
    /**
     * Generate YAML tokens from the `source` string. If `incomplete`,
     * a part of the last line may be left as a buffer for the next call.
     *
     * @returns A generator of lexical tokens
     */
    *lex(source, incomplete = false) {
      if (source) {
        if (typeof source !== "string")
          throw TypeError("source is not a string");
        this.buffer = this.buffer ? this.buffer + source : source;
        this.lineEndPos = null;
      }
      this.atEnd = !incomplete;
      let next = this.next ?? "stream";
      while (next && (incomplete || this.hasChars(1)))
        next = yield* this.parseNext(next);
    }
    atLineEnd() {
      let i = this.pos;
      let ch = this.buffer[i];
      while (ch === " " || ch === "	")
        ch = this.buffer[++i];
      if (!ch || ch === "#" || ch === "\n")
        return true;
      if (ch === "\r")
        return this.buffer[i + 1] === "\n";
      return false;
    }
    charAt(n) {
      return this.buffer[this.pos + n];
    }
    continueScalar(offset) {
      let ch = this.buffer[offset];
      if (this.indentNext > 0) {
        let indent2 = 0;
        while (ch === " ")
          ch = this.buffer[++indent2 + offset];
        if (ch === "\r") {
          const next = this.buffer[indent2 + offset + 1];
          if (next === "\n" || !next && !this.atEnd)
            return offset + indent2 + 1;
        }
        return ch === "\n" || indent2 >= this.indentNext || !ch && !this.atEnd ? offset + indent2 : -1;
      }
      if (ch === "-" || ch === ".") {
        const dt = this.buffer.substr(offset, 3);
        if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
          return -1;
      }
      return offset;
    }
    getLine() {
      let end = this.lineEndPos;
      if (typeof end !== "number" || end !== -1 && end < this.pos) {
        end = this.buffer.indexOf("\n", this.pos);
        this.lineEndPos = end;
      }
      if (end === -1)
        return this.atEnd ? this.buffer.substring(this.pos) : null;
      if (this.buffer[end - 1] === "\r")
        end -= 1;
      return this.buffer.substring(this.pos, end);
    }
    hasChars(n) {
      return this.pos + n <= this.buffer.length;
    }
    setNext(state) {
      this.buffer = this.buffer.substring(this.pos);
      this.pos = 0;
      this.lineEndPos = null;
      this.next = state;
      return null;
    }
    peek(n) {
      return this.buffer.substr(this.pos, n);
    }
    *parseNext(next) {
      switch (next) {
        case "stream":
          return yield* this.parseStream();
        case "line-start":
          return yield* this.parseLineStart();
        case "block-start":
          return yield* this.parseBlockStart();
        case "doc":
          return yield* this.parseDocument();
        case "flow":
          return yield* this.parseFlowCollection();
        case "quoted-scalar":
          return yield* this.parseQuotedScalar();
        case "block-scalar":
          return yield* this.parseBlockScalar();
        case "plain-scalar":
          return yield* this.parsePlainScalar();
      }
    }
    *parseStream() {
      let line = this.getLine();
      if (line === null)
        return this.setNext("stream");
      if (line[0] === BOM) {
        yield* this.pushCount(1);
        line = line.substring(1);
      }
      if (line[0] === "%") {
        let dirEnd = line.length;
        let cs = line.indexOf("#");
        while (cs !== -1) {
          const ch = line[cs - 1];
          if (ch === " " || ch === "	") {
            dirEnd = cs - 1;
            break;
          } else {
            cs = line.indexOf("#", cs + 1);
          }
        }
        while (true) {
          const ch = line[dirEnd - 1];
          if (ch === " " || ch === "	")
            dirEnd -= 1;
          else
            break;
        }
        const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
        yield* this.pushCount(line.length - n);
        this.pushNewline();
        return "stream";
      }
      if (this.atLineEnd()) {
        const sp = yield* this.pushSpaces(true);
        yield* this.pushCount(line.length - sp);
        yield* this.pushNewline();
        return "stream";
      }
      yield DOCUMENT;
      return yield* this.parseLineStart();
    }
    *parseLineStart() {
      const ch = this.charAt(0);
      if (!ch && !this.atEnd)
        return this.setNext("line-start");
      if (ch === "-" || ch === ".") {
        if (!this.atEnd && !this.hasChars(4))
          return this.setNext("line-start");
        const s = this.peek(3);
        if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
          yield* this.pushCount(3);
          this.indentValue = 0;
          this.indentNext = 0;
          return s === "---" ? "doc" : "stream";
        }
      }
      this.indentValue = yield* this.pushSpaces(false);
      if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
        this.indentNext = this.indentValue;
      return yield* this.parseBlockStart();
    }
    *parseBlockStart() {
      const [ch0, ch1] = this.peek(2);
      if (!ch1 && !this.atEnd)
        return this.setNext("block-start");
      if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
        const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
        this.indentNext = this.indentValue + 1;
        this.indentValue += n;
        return "block-start";
      }
      return "doc";
    }
    *parseDocument() {
      yield* this.pushSpaces(true);
      const line = this.getLine();
      if (line === null)
        return this.setNext("doc");
      let n = yield* this.pushIndicators();
      switch (line[n]) {
        case "#":
          yield* this.pushCount(line.length - n);
        // fallthrough
        case void 0:
          yield* this.pushNewline();
          return yield* this.parseLineStart();
        case "{":
        case "[":
          yield* this.pushCount(1);
          this.flowKey = false;
          this.flowLevel = 1;
          return "flow";
        case "}":
        case "]":
          yield* this.pushCount(1);
          return "doc";
        case "*":
          yield* this.pushUntil(isNotAnchorChar);
          return "doc";
        case '"':
        case "'":
          return yield* this.parseQuotedScalar();
        case "|":
        case ">":
          n += yield* this.parseBlockScalarHeader();
          n += yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - n);
          yield* this.pushNewline();
          return yield* this.parseBlockScalar();
        default:
          return yield* this.parsePlainScalar();
      }
    }
    *parseFlowCollection() {
      let nl, sp;
      let indent2 = -1;
      do {
        nl = yield* this.pushNewline();
        if (nl > 0) {
          sp = yield* this.pushSpaces(false);
          this.indentValue = indent2 = sp;
        } else {
          sp = 0;
        }
        sp += yield* this.pushSpaces(true);
      } while (nl + sp > 0);
      const line = this.getLine();
      if (line === null)
        return this.setNext("flow");
      if (indent2 !== -1 && indent2 < this.indentNext && line[0] !== "#" || indent2 === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
        const atFlowEndMarker = indent2 === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
        if (!atFlowEndMarker) {
          this.flowLevel = 0;
          yield FLOW_END;
          return yield* this.parseLineStart();
        }
      }
      let n = 0;
      while (line[n] === ",") {
        n += yield* this.pushCount(1);
        n += yield* this.pushSpaces(true);
        this.flowKey = false;
      }
      n += yield* this.pushIndicators();
      switch (line[n]) {
        case void 0:
          return "flow";
        case "#":
          yield* this.pushCount(line.length - n);
          return "flow";
        case "{":
        case "[":
          yield* this.pushCount(1);
          this.flowKey = false;
          this.flowLevel += 1;
          return "flow";
        case "}":
        case "]":
          yield* this.pushCount(1);
          this.flowKey = true;
          this.flowLevel -= 1;
          return this.flowLevel ? "flow" : "doc";
        case "*":
          yield* this.pushUntil(isNotAnchorChar);
          return "flow";
        case '"':
        case "'":
          this.flowKey = true;
          return yield* this.parseQuotedScalar();
        case ":": {
          const next = this.charAt(1);
          if (this.flowKey || isEmpty(next) || next === ",") {
            this.flowKey = false;
            yield* this.pushCount(1);
            yield* this.pushSpaces(true);
            return "flow";
          }
        }
        // fallthrough
        default:
          this.flowKey = false;
          return yield* this.parsePlainScalar();
      }
    }
    *parseQuotedScalar() {
      const quote = this.charAt(0);
      let end = this.buffer.indexOf(quote, this.pos + 1);
      if (quote === "'") {
        while (end !== -1 && this.buffer[end + 1] === "'")
          end = this.buffer.indexOf("'", end + 2);
      } else {
        while (end !== -1) {
          let n = 0;
          while (this.buffer[end - 1 - n] === "\\")
            n += 1;
          if (n % 2 === 0)
            break;
          end = this.buffer.indexOf('"', end + 1);
        }
      }
      const qb = this.buffer.substring(0, end);
      let nl = qb.indexOf("\n", this.pos);
      if (nl !== -1) {
        while (nl !== -1) {
          const cs = this.continueScalar(nl + 1);
          if (cs === -1)
            break;
          nl = qb.indexOf("\n", cs);
        }
        if (nl !== -1) {
          end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
        }
      }
      if (end === -1) {
        if (!this.atEnd)
          return this.setNext("quoted-scalar");
        end = this.buffer.length;
      }
      yield* this.pushToIndex(end + 1, false);
      return this.flowLevel ? "flow" : "doc";
    }
    *parseBlockScalarHeader() {
      this.blockScalarIndent = -1;
      this.blockScalarKeep = false;
      let i = this.pos;
      while (true) {
        const ch = this.buffer[++i];
        if (ch === "+")
          this.blockScalarKeep = true;
        else if (ch > "0" && ch <= "9")
          this.blockScalarIndent = Number(ch) - 1;
        else if (ch !== "-")
          break;
      }
      return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
    }
    *parseBlockScalar() {
      let nl = this.pos - 1;
      let indent2 = 0;
      let ch;
      loop: for (let i2 = this.pos; ch = this.buffer[i2]; ++i2) {
        switch (ch) {
          case " ":
            indent2 += 1;
            break;
          case "\n":
            nl = i2;
            indent2 = 0;
            break;
          case "\r": {
            const next = this.buffer[i2 + 1];
            if (!next && !this.atEnd)
              return this.setNext("block-scalar");
            if (next === "\n")
              break;
          }
          // fallthrough
          default:
            break loop;
        }
      }
      if (!ch && !this.atEnd)
        return this.setNext("block-scalar");
      if (indent2 >= this.indentNext) {
        if (this.blockScalarIndent === -1)
          this.indentNext = indent2;
        else {
          this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
        }
        do {
          const cs = this.continueScalar(nl + 1);
          if (cs === -1)
            break;
          nl = this.buffer.indexOf("\n", cs);
        } while (nl !== -1);
        if (nl === -1) {
          if (!this.atEnd)
            return this.setNext("block-scalar");
          nl = this.buffer.length;
        }
      }
      let i = nl + 1;
      ch = this.buffer[i];
      while (ch === " ")
        ch = this.buffer[++i];
      if (ch === "	") {
        while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
          ch = this.buffer[++i];
        nl = i - 1;
      } else if (!this.blockScalarKeep) {
        do {
          let i2 = nl - 1;
          let ch2 = this.buffer[i2];
          if (ch2 === "\r")
            ch2 = this.buffer[--i2];
          const lastChar = i2;
          while (ch2 === " ")
            ch2 = this.buffer[--i2];
          if (ch2 === "\n" && i2 >= this.pos && i2 + 1 + indent2 > lastChar)
            nl = i2;
          else
            break;
        } while (true);
      }
      yield SCALAR2;
      yield* this.pushToIndex(nl + 1, true);
      return yield* this.parseLineStart();
    }
    *parsePlainScalar() {
      const inFlow = this.flowLevel > 0;
      let end = this.pos - 1;
      let i = this.pos - 1;
      let ch;
      while (ch = this.buffer[++i]) {
        if (ch === ":") {
          const next = this.buffer[i + 1];
          if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
            break;
          end = i;
        } else if (isEmpty(ch)) {
          let next = this.buffer[i + 1];
          if (ch === "\r") {
            if (next === "\n") {
              i += 1;
              ch = "\n";
              next = this.buffer[i + 1];
            } else
              end = i;
          }
          if (next === "#" || inFlow && flowIndicatorChars.has(next))
            break;
          if (ch === "\n") {
            const cs = this.continueScalar(i + 1);
            if (cs === -1)
              break;
            i = Math.max(i, cs - 2);
          }
        } else {
          if (inFlow && flowIndicatorChars.has(ch))
            break;
          end = i;
        }
      }
      if (!ch && !this.atEnd)
        return this.setNext("plain-scalar");
      yield SCALAR2;
      yield* this.pushToIndex(end + 1, true);
      return inFlow ? "flow" : "doc";
    }
    *pushCount(n) {
      if (n > 0) {
        yield this.buffer.substr(this.pos, n);
        this.pos += n;
        return n;
      }
      return 0;
    }
    *pushToIndex(i, allowEmpty) {
      const s = this.buffer.slice(this.pos, i);
      if (s) {
        yield s;
        this.pos += s.length;
        return s.length;
      } else if (allowEmpty)
        yield "";
      return 0;
    }
    *pushIndicators() {
      let n = 0;
      loop: while (true) {
        switch (this.charAt(0)) {
          case "!":
            n += yield* this.pushTag();
            n += yield* this.pushSpaces(true);
            continue loop;
          case "&":
            n += yield* this.pushUntil(isNotAnchorChar);
            n += yield* this.pushSpaces(true);
            continue loop;
          case "-":
          // this is an error
          case "?":
          // this is an error outside flow collections
          case ":": {
            const inFlow = this.flowLevel > 0;
            const ch1 = this.charAt(1);
            if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
              if (!inFlow)
                this.indentNext = this.indentValue + 1;
              else if (this.flowKey)
                this.flowKey = false;
              n += yield* this.pushCount(1);
              n += yield* this.pushSpaces(true);
              continue loop;
            }
          }
        }
        break loop;
      }
      return n;
    }
    *pushTag() {
      if (this.charAt(1) === "<") {
        let i = this.pos + 2;
        let ch = this.buffer[i];
        while (!isEmpty(ch) && ch !== ">")
          ch = this.buffer[++i];
        return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
      } else {
        let i = this.pos + 1;
        let ch = this.buffer[i];
        while (ch) {
          if (tagChars.has(ch))
            ch = this.buffer[++i];
          else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
            ch = this.buffer[i += 3];
          } else
            break;
        }
        return yield* this.pushToIndex(i, false);
      }
    }
    *pushNewline() {
      const ch = this.buffer[this.pos];
      if (ch === "\n")
        return yield* this.pushCount(1);
      else if (ch === "\r" && this.charAt(1) === "\n")
        return yield* this.pushCount(2);
      else
        return 0;
    }
    *pushSpaces(allowTabs) {
      let i = this.pos - 1;
      let ch;
      do {
        ch = this.buffer[++i];
      } while (ch === " " || allowTabs && ch === "	");
      const n = i - this.pos;
      if (n > 0) {
        yield this.buffer.substr(this.pos, n);
        this.pos = i;
      }
      return n;
    }
    *pushUntil(test) {
      let i = this.pos;
      let ch = this.buffer[i];
      while (!test(ch))
        ch = this.buffer[++i];
      return yield* this.pushToIndex(i, false);
    }
  };

  // node_modules/yaml/browser/dist/parse/line-counter.js
  var LineCounter = class {
    constructor() {
      this.lineStarts = [];
      this.addNewLine = (offset) => this.lineStarts.push(offset);
      this.linePos = (offset) => {
        let low = 0;
        let high = this.lineStarts.length;
        while (low < high) {
          const mid = low + high >> 1;
          if (this.lineStarts[mid] < offset)
            low = mid + 1;
          else
            high = mid;
        }
        if (this.lineStarts[low] === offset)
          return { line: low + 1, col: 1 };
        if (low === 0)
          return { line: 0, col: offset };
        const start = this.lineStarts[low - 1];
        return { line: low, col: offset - start + 1 };
      };
    }
  };

  // node_modules/yaml/browser/dist/parse/parser.js
  function includesToken(list, type) {
    for (let i = 0; i < list.length; ++i)
      if (list[i].type === type)
        return true;
    return false;
  }
  function findNonEmptyIndex(list) {
    for (let i = 0; i < list.length; ++i) {
      switch (list[i].type) {
        case "space":
        case "comment":
        case "newline":
          break;
        default:
          return i;
      }
    }
    return -1;
  }
  function isFlowToken(token) {
    switch (token?.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "flow-collection":
        return true;
      default:
        return false;
    }
  }
  function getPrevProps(parent) {
    switch (parent.type) {
      case "document":
        return parent.start;
      case "block-map": {
        const it2 = parent.items[parent.items.length - 1];
        return it2.sep ?? it2.start;
      }
      case "block-seq":
        return parent.items[parent.items.length - 1].start;
      /* istanbul ignore next should not happen */
      default:
        return [];
    }
  }
  function getFirstKeyStartProps(prev) {
    if (prev.length === 0)
      return [];
    let i = prev.length;
    loop: while (--i >= 0) {
      switch (prev[i].type) {
        case "doc-start":
        case "explicit-key-ind":
        case "map-value-ind":
        case "seq-item-ind":
        case "newline":
          break loop;
      }
    }
    while (prev[++i]?.type === "space") {
    }
    return prev.splice(i, prev.length);
  }
  function arrayPushArray(target, source) {
    if (source.length < 1e5)
      Array.prototype.push.apply(target, source);
    else
      for (let i = 0; i < source.length; ++i)
        target.push(source[i]);
  }
  function fixFlowSeqItems(fc) {
    if (fc.start.type === "flow-seq-start") {
      for (const it2 of fc.items) {
        if (it2.sep && !it2.value && !includesToken(it2.start, "explicit-key-ind") && !includesToken(it2.sep, "map-value-ind")) {
          if (it2.key)
            it2.value = it2.key;
          delete it2.key;
          if (isFlowToken(it2.value)) {
            if (it2.value.end)
              arrayPushArray(it2.value.end, it2.sep);
            else
              it2.value.end = it2.sep;
          } else
            arrayPushArray(it2.start, it2.sep);
          delete it2.sep;
        }
      }
    }
  }
  var Parser = class {
    /**
     * @param onNewLine - If defined, called separately with the start position of
     *   each new line (in `parse()`, including the start of input).
     */
    constructor(onNewLine) {
      this.atNewLine = true;
      this.atScalar = false;
      this.indent = 0;
      this.offset = 0;
      this.onKeyLine = false;
      this.stack = [];
      this.source = "";
      this.type = "";
      this.lexer = new Lexer();
      this.onNewLine = onNewLine;
    }
    /**
     * Parse `source` as a YAML stream.
     * If `incomplete`, a part of the last line may be left as a buffer for the next call.
     *
     * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
     *
     * @returns A generator of tokens representing each directive, document, and other structure.
     */
    *parse(source, incomplete = false) {
      if (this.onNewLine && this.offset === 0)
        this.onNewLine(0);
      for (const lexeme of this.lexer.lex(source, incomplete))
        yield* this.next(lexeme);
      if (!incomplete)
        yield* this.end();
    }
    /**
     * Advance the parser by the `source` of one lexical token.
     */
    *next(source) {
      this.source = source;
      if (this.atScalar) {
        this.atScalar = false;
        yield* this.step();
        this.offset += source.length;
        return;
      }
      const type = tokenType(source);
      if (!type) {
        const message = `Not a YAML token: ${source}`;
        yield* this.pop({ type: "error", offset: this.offset, message, source });
        this.offset += source.length;
      } else if (type === "scalar") {
        this.atNewLine = false;
        this.atScalar = true;
        this.type = "scalar";
      } else {
        this.type = type;
        yield* this.step();
        switch (type) {
          case "newline":
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine)
              this.onNewLine(this.offset + source.length);
            break;
          case "space":
            if (this.atNewLine && source[0] === " ")
              this.indent += source.length;
            break;
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
            if (this.atNewLine)
              this.indent += source.length;
            break;
          case "doc-mode":
          case "flow-error-end":
            return;
          default:
            this.atNewLine = false;
        }
        this.offset += source.length;
      }
    }
    /** Call at end of input to push out any remaining constructions */
    *end() {
      while (this.stack.length > 0)
        yield* this.pop();
    }
    get sourceToken() {
      const st = {
        type: this.type,
        offset: this.offset,
        indent: this.indent,
        source: this.source
      };
      return st;
    }
    *step() {
      const top = this.peek(1);
      if (this.type === "doc-end" && top?.type !== "doc-end") {
        while (this.stack.length > 0)
          yield* this.pop();
        this.stack.push({
          type: "doc-end",
          offset: this.offset,
          source: this.source
        });
        return;
      }
      if (!top)
        return yield* this.stream();
      switch (top.type) {
        case "document":
          return yield* this.document(top);
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return yield* this.scalar(top);
        case "block-scalar":
          return yield* this.blockScalar(top);
        case "block-map":
          return yield* this.blockMap(top);
        case "block-seq":
          return yield* this.blockSequence(top);
        case "flow-collection":
          return yield* this.flowCollection(top);
        case "doc-end":
          return yield* this.documentEnd(top);
      }
      yield* this.pop();
    }
    peek(n) {
      return this.stack[this.stack.length - n];
    }
    *pop(error) {
      const token = error ?? this.stack.pop();
      if (!token) {
        const message = "Tried to pop an empty stack";
        yield { type: "error", offset: this.offset, source: "", message };
      } else if (this.stack.length === 0) {
        yield token;
      } else {
        const top = this.peek(1);
        if (token.type === "block-scalar") {
          token.indent = "indent" in top ? top.indent : 0;
        } else if (token.type === "flow-collection" && top.type === "document") {
          token.indent = 0;
        }
        if (token.type === "flow-collection")
          fixFlowSeqItems(token);
        switch (top.type) {
          case "document":
            top.value = token;
            break;
          case "block-scalar":
            top.props.push(token);
            break;
          case "block-map": {
            const it2 = top.items[top.items.length - 1];
            if (it2.value) {
              top.items.push({ start: [], key: token, sep: [] });
              this.onKeyLine = true;
              return;
            } else if (it2.sep) {
              it2.value = token;
            } else {
              Object.assign(it2, { key: token, sep: [] });
              this.onKeyLine = !it2.explicitKey;
              return;
            }
            break;
          }
          case "block-seq": {
            const it2 = top.items[top.items.length - 1];
            if (it2.value)
              top.items.push({ start: [], value: token });
            else
              it2.value = token;
            break;
          }
          case "flow-collection": {
            const it2 = top.items[top.items.length - 1];
            if (!it2 || it2.value)
              top.items.push({ start: [], key: token, sep: [] });
            else if (it2.sep)
              it2.value = token;
            else
              Object.assign(it2, { key: token, sep: [] });
            return;
          }
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop();
            yield* this.pop(token);
        }
        if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
          const last = token.items[token.items.length - 1];
          if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
            if (top.type === "document")
              top.end = last.start;
            else
              top.items.push({ start: last.start });
            token.items.splice(-1, 1);
          }
        }
      }
    }
    *stream() {
      switch (this.type) {
        case "directive-line":
          yield { type: "directive", offset: this.offset, source: this.source };
          return;
        case "byte-order-mark":
        case "space":
        case "comment":
        case "newline":
          yield this.sourceToken;
          return;
        case "doc-mode":
        case "doc-start": {
          const doc = {
            type: "document",
            offset: this.offset,
            start: []
          };
          if (this.type === "doc-start")
            doc.start.push(this.sourceToken);
          this.stack.push(doc);
          return;
        }
      }
      yield {
        type: "error",
        offset: this.offset,
        message: `Unexpected ${this.type} token in YAML stream`,
        source: this.source
      };
    }
    *document(doc) {
      if (doc.value)
        return yield* this.lineEnd(doc);
      switch (this.type) {
        case "doc-start": {
          if (findNonEmptyIndex(doc.start) !== -1) {
            yield* this.pop();
            yield* this.step();
          } else
            doc.start.push(this.sourceToken);
          return;
        }
        case "anchor":
        case "tag":
        case "space":
        case "comment":
        case "newline":
          doc.start.push(this.sourceToken);
          return;
      }
      const bv = this.startBlockValue(doc);
      if (bv)
        this.stack.push(bv);
      else {
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML document`,
          source: this.source
        };
      }
    }
    *scalar(scalar) {
      if (this.type === "map-value-ind") {
        const prev = getPrevProps(this.peek(2));
        const start = getFirstKeyStartProps(prev);
        let sep;
        if (scalar.end) {
          sep = scalar.end;
          sep.push(this.sourceToken);
          delete scalar.end;
        } else
          sep = [this.sourceToken];
        const map2 = {
          type: "block-map",
          offset: scalar.offset,
          indent: scalar.indent,
          items: [{ start, key: scalar, sep }]
        };
        this.onKeyLine = true;
        this.stack[this.stack.length - 1] = map2;
      } else
        yield* this.lineEnd(scalar);
    }
    *blockScalar(scalar) {
      switch (this.type) {
        case "space":
        case "comment":
        case "newline":
          scalar.props.push(this.sourceToken);
          return;
        case "scalar":
          scalar.source = this.source;
          this.atNewLine = true;
          this.indent = 0;
          if (this.onNewLine) {
            let nl = this.source.indexOf("\n") + 1;
            while (nl !== 0) {
              this.onNewLine(this.offset + nl);
              nl = this.source.indexOf("\n", nl) + 1;
            }
          }
          yield* this.pop();
          break;
        /* istanbul ignore next should not happen */
        default:
          yield* this.pop();
          yield* this.step();
      }
    }
    *blockMap(map2) {
      const it2 = map2.items[map2.items.length - 1];
      switch (this.type) {
        case "newline":
          this.onKeyLine = false;
          if (it2.value) {
            const end = "end" in it2.value ? it2.value.end : void 0;
            const last = Array.isArray(end) ? end[end.length - 1] : void 0;
            if (last?.type === "comment")
              end?.push(this.sourceToken);
            else
              map2.items.push({ start: [this.sourceToken] });
          } else if (it2.sep) {
            it2.sep.push(this.sourceToken);
          } else {
            it2.start.push(this.sourceToken);
          }
          return;
        case "space":
        case "comment":
          if (it2.value) {
            map2.items.push({ start: [this.sourceToken] });
          } else if (it2.sep) {
            it2.sep.push(this.sourceToken);
          } else {
            if (this.atIndentedComment(it2.start, map2.indent)) {
              const prev = map2.items[map2.items.length - 2];
              const end = prev?.value?.end;
              if (Array.isArray(end)) {
                arrayPushArray(end, it2.start);
                end.push(this.sourceToken);
                map2.items.pop();
                return;
              }
            }
            it2.start.push(this.sourceToken);
          }
          return;
      }
      if (this.indent >= map2.indent) {
        const atMapIndent = !this.onKeyLine && this.indent === map2.indent;
        const atNextItem = atMapIndent && (it2.sep || it2.explicitKey) && this.type !== "seq-item-ind";
        let start = [];
        if (atNextItem && it2.sep && !it2.value) {
          const nl = [];
          for (let i = 0; i < it2.sep.length; ++i) {
            const st = it2.sep[i];
            switch (st.type) {
              case "newline":
                nl.push(i);
                break;
              case "space":
                break;
              case "comment":
                if (st.indent > map2.indent)
                  nl.length = 0;
                break;
              default:
                nl.length = 0;
            }
          }
          if (nl.length >= 2)
            start = it2.sep.splice(nl[1]);
        }
        switch (this.type) {
          case "anchor":
          case "tag":
            if (atNextItem || it2.value) {
              start.push(this.sourceToken);
              map2.items.push({ start });
              this.onKeyLine = true;
            } else if (it2.sep) {
              it2.sep.push(this.sourceToken);
            } else {
              it2.start.push(this.sourceToken);
            }
            return;
          case "explicit-key-ind":
            if (!it2.sep && !it2.explicitKey) {
              it2.start.push(this.sourceToken);
              it2.explicitKey = true;
            } else if (atNextItem || it2.value) {
              start.push(this.sourceToken);
              map2.items.push({ start, explicitKey: true });
            } else {
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: [this.sourceToken], explicitKey: true }]
              });
            }
            this.onKeyLine = true;
            return;
          case "map-value-ind":
            if (it2.explicitKey) {
              if (!it2.sep) {
                if (includesToken(it2.start, "newline")) {
                  Object.assign(it2, { key: null, sep: [this.sourceToken] });
                } else {
                  const start2 = getFirstKeyStartProps(it2.start);
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                  });
                }
              } else if (it2.value) {
                map2.items.push({ start: [], key: null, sep: [this.sourceToken] });
              } else if (includesToken(it2.sep, "map-value-ind")) {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start, key: null, sep: [this.sourceToken] }]
                });
              } else if (isFlowToken(it2.key) && !includesToken(it2.sep, "newline")) {
                const start2 = getFirstKeyStartProps(it2.start);
                const key = it2.key;
                const sep = it2.sep;
                sep.push(this.sourceToken);
                delete it2.key;
                delete it2.sep;
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: start2, key, sep }]
                });
              } else if (start.length > 0) {
                it2.sep = it2.sep.concat(start, this.sourceToken);
              } else {
                it2.sep.push(this.sourceToken);
              }
            } else {
              if (!it2.sep) {
                Object.assign(it2, { key: null, sep: [this.sourceToken] });
              } else if (it2.value || atNextItem) {
                map2.items.push({ start, key: null, sep: [this.sourceToken] });
              } else if (includesToken(it2.sep, "map-value-ind")) {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [], key: null, sep: [this.sourceToken] }]
                });
              } else {
                it2.sep.push(this.sourceToken);
              }
            }
            this.onKeyLine = true;
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const fs = this.flowScalar(this.type);
            if (atNextItem || it2.value) {
              map2.items.push({ start, key: fs, sep: [] });
              this.onKeyLine = true;
            } else if (it2.sep) {
              this.stack.push(fs);
            } else {
              Object.assign(it2, { key: fs, sep: [] });
              this.onKeyLine = true;
            }
            return;
          }
          default: {
            const bv = this.startBlockValue(map2);
            if (bv) {
              if (bv.type === "block-seq") {
                if (!it2.explicitKey && it2.sep && !includesToken(it2.sep, "newline")) {
                  yield* this.pop({
                    type: "error",
                    offset: this.offset,
                    message: "Unexpected block-seq-ind on same line with key",
                    source: this.source
                  });
                  return;
                }
              } else if (atMapIndent) {
                map2.items.push({ start });
              }
              this.stack.push(bv);
              return;
            }
          }
        }
      }
      yield* this.pop();
      yield* this.step();
    }
    *blockSequence(seq2) {
      const it2 = seq2.items[seq2.items.length - 1];
      switch (this.type) {
        case "newline":
          if (it2.value) {
            const end = "end" in it2.value ? it2.value.end : void 0;
            const last = Array.isArray(end) ? end[end.length - 1] : void 0;
            if (last?.type === "comment")
              end?.push(this.sourceToken);
            else
              seq2.items.push({ start: [this.sourceToken] });
          } else
            it2.start.push(this.sourceToken);
          return;
        case "space":
        case "comment":
          if (it2.value)
            seq2.items.push({ start: [this.sourceToken] });
          else {
            if (this.atIndentedComment(it2.start, seq2.indent)) {
              const prev = seq2.items[seq2.items.length - 2];
              const end = prev?.value?.end;
              if (Array.isArray(end)) {
                arrayPushArray(end, it2.start);
                end.push(this.sourceToken);
                seq2.items.pop();
                return;
              }
            }
            it2.start.push(this.sourceToken);
          }
          return;
        case "anchor":
        case "tag":
          if (it2.value || this.indent <= seq2.indent)
            break;
          it2.start.push(this.sourceToken);
          return;
        case "seq-item-ind":
          if (this.indent !== seq2.indent)
            break;
          if (it2.value || includesToken(it2.start, "seq-item-ind"))
            seq2.items.push({ start: [this.sourceToken] });
          else
            it2.start.push(this.sourceToken);
          return;
      }
      if (this.indent > seq2.indent) {
        const bv = this.startBlockValue(seq2);
        if (bv) {
          this.stack.push(bv);
          return;
        }
      }
      yield* this.pop();
      yield* this.step();
    }
    *flowCollection(fc) {
      const it2 = fc.items[fc.items.length - 1];
      if (this.type === "flow-error-end") {
        let top;
        do {
          yield* this.pop();
          top = this.peek(1);
        } while (top?.type === "flow-collection");
      } else if (fc.end.length === 0) {
        switch (this.type) {
          case "comma":
          case "explicit-key-ind":
            if (!it2 || it2.sep)
              fc.items.push({ start: [this.sourceToken] });
            else
              it2.start.push(this.sourceToken);
            return;
          case "map-value-ind":
            if (!it2 || it2.value)
              fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
            else if (it2.sep)
              it2.sep.push(this.sourceToken);
            else
              Object.assign(it2, { key: null, sep: [this.sourceToken] });
            return;
          case "space":
          case "comment":
          case "newline":
          case "anchor":
          case "tag":
            if (!it2 || it2.value)
              fc.items.push({ start: [this.sourceToken] });
            else if (it2.sep)
              it2.sep.push(this.sourceToken);
            else
              it2.start.push(this.sourceToken);
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const fs = this.flowScalar(this.type);
            if (!it2 || it2.value)
              fc.items.push({ start: [], key: fs, sep: [] });
            else if (it2.sep)
              this.stack.push(fs);
            else
              Object.assign(it2, { key: fs, sep: [] });
            return;
          }
          case "flow-map-end":
          case "flow-seq-end":
            fc.end.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(fc);
        if (bv)
          this.stack.push(bv);
        else {
          yield* this.pop();
          yield* this.step();
        }
      } else {
        const parent = this.peek(2);
        if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
          yield* this.pop();
          yield* this.step();
        } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
          const prev = getPrevProps(parent);
          const start = getFirstKeyStartProps(prev);
          fixFlowSeqItems(fc);
          const sep = fc.end.splice(1, fc.end.length);
          sep.push(this.sourceToken);
          const map2 = {
            type: "block-map",
            offset: fc.offset,
            indent: fc.indent,
            items: [{ start, key: fc, sep }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map2;
        } else {
          yield* this.lineEnd(fc);
        }
      }
    }
    flowScalar(type) {
      if (this.onNewLine) {
        let nl = this.source.indexOf("\n") + 1;
        while (nl !== 0) {
          this.onNewLine(this.offset + nl);
          nl = this.source.indexOf("\n", nl) + 1;
        }
      }
      return {
        type,
        offset: this.offset,
        indent: this.indent,
        source: this.source
      };
    }
    startBlockValue(parent) {
      switch (this.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return this.flowScalar(this.type);
        case "block-scalar-header":
          return {
            type: "block-scalar",
            offset: this.offset,
            indent: this.indent,
            props: [this.sourceToken],
            source: ""
          };
        case "flow-map-start":
        case "flow-seq-start":
          return {
            type: "flow-collection",
            offset: this.offset,
            indent: this.indent,
            start: this.sourceToken,
            items: [],
            end: []
          };
        case "seq-item-ind":
          return {
            type: "block-seq",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: [this.sourceToken] }]
          };
        case "explicit-key-ind": {
          this.onKeyLine = true;
          const prev = getPrevProps(parent);
          const start = getFirstKeyStartProps(prev);
          start.push(this.sourceToken);
          return {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start, explicitKey: true }]
          };
        }
        case "map-value-ind": {
          this.onKeyLine = true;
          const prev = getPrevProps(parent);
          const start = getFirstKeyStartProps(prev);
          return {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start, key: null, sep: [this.sourceToken] }]
          };
        }
      }
      return null;
    }
    atIndentedComment(start, indent2) {
      if (this.type !== "comment")
        return false;
      if (this.indent <= indent2)
        return false;
      return start.every((st) => st.type === "newline" || st.type === "space");
    }
    *documentEnd(docEnd) {
      if (this.type !== "doc-mode") {
        if (docEnd.end)
          docEnd.end.push(this.sourceToken);
        else
          docEnd.end = [this.sourceToken];
        if (this.type === "newline")
          yield* this.pop();
      }
    }
    *lineEnd(token) {
      switch (this.type) {
        case "comma":
        case "doc-start":
        case "doc-end":
        case "flow-seq-end":
        case "flow-map-end":
        case "map-value-ind":
          yield* this.pop();
          yield* this.step();
          break;
        case "newline":
          this.onKeyLine = false;
        // fallthrough
        case "space":
        case "comment":
        default:
          if (token.end)
            token.end.push(this.sourceToken);
          else
            token.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
      }
    }
  };

  // node_modules/yaml/browser/dist/public-api.js
  function parseOptions(options) {
    const prettyErrors = options.prettyErrors !== false;
    const lineCounter = options.lineCounter || prettyErrors && new LineCounter() || null;
    return { lineCounter, prettyErrors };
  }
  function parseAllDocuments(source, options = {}) {
    const { lineCounter, prettyErrors } = parseOptions(options);
    const parser = new Parser(lineCounter?.addNewLine);
    const composer = new Composer(options);
    const docs = Array.from(composer.compose(parser.parse(source)));
    if (prettyErrors && lineCounter)
      for (const doc of docs) {
        doc.errors.forEach(prettifyError(source, lineCounter));
        doc.warnings.forEach(prettifyError(source, lineCounter));
      }
    if (docs.length > 0)
      return docs;
    return Object.assign([], { empty: true }, composer.streamInfo());
  }
  function parseDocument(source, options = {}) {
    const { lineCounter, prettyErrors } = parseOptions(options);
    const parser = new Parser(lineCounter?.addNewLine);
    const composer = new Composer(options);
    let doc = null;
    for (const _doc of composer.compose(parser.parse(source), true, source.length)) {
      if (!doc)
        doc = _doc;
      else if (doc.options.logLevel !== "silent") {
        doc.errors.push(new YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
        break;
      }
    }
    if (prettyErrors && lineCounter) {
      doc.errors.forEach(prettifyError(source, lineCounter));
      doc.warnings.forEach(prettifyError(source, lineCounter));
    }
    return doc;
  }
  function parse(src, reviver, options) {
    let _reviver = void 0;
    if (typeof reviver === "function") {
      _reviver = reviver;
    } else if (options === void 0 && reviver && typeof reviver === "object") {
      options = reviver;
    }
    const doc = parseDocument(src, options);
    if (!doc)
      return null;
    doc.warnings.forEach((warning) => warn(doc.options.logLevel, warning));
    if (doc.errors.length > 0) {
      if (doc.options.logLevel !== "silent")
        throw doc.errors[0];
      else
        doc.errors = [];
    }
    return doc.toJS(Object.assign({ reviver: _reviver }, options));
  }
  function stringify3(value, replacer, options) {
    let _replacer = null;
    if (typeof replacer === "function" || Array.isArray(replacer)) {
      _replacer = replacer;
    } else if (options === void 0 && replacer) {
      options = replacer;
    }
    if (typeof options === "string")
      options = options.length;
    if (typeof options === "number") {
      const indent2 = Math.round(options);
      options = indent2 < 1 ? void 0 : indent2 > 8 ? { indent: 8 } : { indent: indent2 };
    }
    if (value === void 0) {
      const { keepUndefined } = options ?? replacer ?? {};
      if (!keepUndefined)
        return void 0;
    }
    if (isDocument(value) && !_replacer)
      return value.toString(options);
    return new Document(value, _replacer, options).toString(options);
  }

  // node_modules/yaml/browser/index.js
  var browser_default = dist_exports;

  // src/domain/projects/serializers/YAMLSerializer.js
  var YAMLSerializer = class extends Serializer {
    static matches(filePath) {
      return /\.yml$/i.test(filePath);
    }
    /**
     * Encode the intermediate representation as YAML.
     *
     * @param {any} value - Intermediate representation.
     * @returns {Promise<string>}
     */
    async encode(value) {
      return browser_default.stringify(value);
    }
    /**
     * Decode YAML back into the intermediate representation.
     *
     * @param {string} yaml - YAML string.
     * @returns {Promise<any>}
     */
    async decode(yaml) {
      return browser_default.parse(yaml);
    }
  };

  // src/domain/persistence.smoke.js
  describe("Persistence", () => {
    let project;
    let expectedBlankCardData;
    beforeAll(async () => {
      const response = await fetch("/tests/fixtures/blank.yml");
      expectedBlankCardData = await response.text();
    });
    beforeEach(async () => {
      project = await createTestProject();
    });
    afterAll(async () => {
      await deleteTestProject();
    });
    it("saves the project file to the filesystem", async () => {
      expect(project.filePath).toMatch(/test.cmproj$/);
      await project.save();
      const projectFileExists = await checkFileExists(project.filePath);
      expect(projectFileExists).toBeTrue();
    });
    describe("card fields", () => {
      it("persists a new card to the filesystem", async () => {
        const card = await createCard();
        await setCardFields({ name: "Test" });
        await flushCard();
        const path = card.files.get("data");
        const exists = await checkFileExists(path);
        expect(exists).toBeTrue();
        expect(path).toMatch(/cards\/Test.yml$/);
      });
      it("persists default card data", async () => {
        const card = await createCard();
        await setCardFields({ name: "Test" });
        await setCardFields({ name: "" });
        await flushCard();
        const path = card.files.get("data");
        const data = await readFile(path);
        expect(data).toEqual(expectedBlankCardData);
      });
      it("persists multiple cards", async () => {
        const cardA = await createCard();
        await setCardFields({ name: "Card A" });
        await flushCard();
        const pathA = cardA.files.get("data");
        const existsA = await checkFileExists(pathA);
        expect(existsA).toBeTrue();
        expect(pathA).toMatch(/cards\/Card A.yml$/);
        const cardB = await createCard();
        await setCardFields({ name: "Card B" });
        await flushCard();
        const pathB = cardB.files.get("data");
        const existsB = await checkFileExists(pathB);
        expect(existsB).toBeTrue();
        expect(pathB).toMatch(/cards\/Card B.yml$/);
      });
      it("persists changes to multiple fields", async () => {
        const card = await createCard();
        await setCardFields({ name: "Test", manaCost: "WUBRG" });
        await flushCard();
        const path = card.files.get("data");
        const data = await YAMLSerializer.load(path);
        expectCardData(data.front, {
          name: "Test",
          manaCost: "WUBRG"
        });
      });
      it("persists the final value after multiple changes", async () => {
        const card = await createCard();
        await setCardFields({ name: "Swamp", superType: "Land" });
        await setCardFields({ superType: "Basic Land", subType: "Swamp" });
        await flushCard();
        const path = card.files.get("data");
        const data = await YAMLSerializer.load(path);
        expectCardData(data.front, {
          name: "Swamp",
          superType: "Basic Land",
          subType: "Swamp"
        });
      });
      it("persists changing fields to empty values", async () => {
        const card = await createCard();
        await setCardFields({
          name: "Twinflame Tyrant",
          manaCost: "3RR",
          superType: "Creature",
          subType: "Dragon",
          rulesText: "Flying\n\nIf a source you control would deal damage to an opponent or a permanent an opponent controls, it deals double that damage instead.",
          flavorText: `"Job only paid enough for one head. I'm out."
\u2014Peren, veteran mercenary`
        });
        await flushCard();
        await setCardFields({
          name: "",
          manaCost: "",
          superType: "",
          subType: "",
          rulesText: "",
          flavorText: ""
        });
        await flushCard();
        const path = card.files.get("data");
        const data = await YAMLSerializer.load(path);
        expectCardData(data.front, {
          name: "",
          manaCost: "",
          superType: "",
          subType: "",
          rulesText: "",
          flavorText: ""
        });
      });
      it("persists front and back face fields", async () => {
        const card = await createCard();
        await setCardFields({ name: "Sea Gate Restoration" });
        await toggleFace("back");
        await setCardFields({ name: "Sea Gate, Reborn" }, "back");
        await flushCard();
        const path = card.files.get("data");
        const data = await YAMLSerializer.load(path);
        expectCardData(data.front, { name: "Sea Gate Restoration" });
        expectCardData(data.back, { name: "Sea Gate, Reborn" });
      });
      it("persists changes correctly when card changes before save", async () => {
        const cardA = await createCard();
        await setCardFields({ name: "Card A" });
        const cardB = await createCard();
        await setCardFields({ name: "Card B" });
        const cardC = await createCard();
        await setCardFields({ name: "Card C" });
        await flushCard();
        const pathA = cardA.files.get("data");
        const existsA = await checkFileExists(pathA);
        expect(existsA).toBeTrue();
        expect(pathA).toMatch(/cards\/Card A.yml$/);
        const pathB = cardB.files.get("data");
        const existsB = await checkFileExists(pathB);
        expect(existsB).toBeTrue();
        expect(pathB).toMatch(/cards\/Card B.yml$/);
        const pathC = cardC.files.get("data");
        const existsC = await checkFileExists(pathC);
        expect(existsC).toBeTrue();
        expect(pathC).toMatch(/cards\/Card C.yml$/);
      });
    });
    describe("card properties", () => {
      it("persists card tags", async () => {
      });
      it("persists card notes", async () => {
      });
    });
    describe("file naming", () => {
      it('defaults empty name to "blank"', async () => {
      });
      it("sanitizes filenames", async () => {
      });
      it('sanitizes " - " in filenames', async () => {
      });
      it("handles filename conflicts without changing card names", async () => {
      });
      it("is case insensitive when handling naming conflicts", async () => {
      });
    });
    describe("images", () => {
      it("persists card image files", async () => {
      });
      it("persists front and back image files", async () => {
      });
      it("persists changes to an image", async () => {
      });
      it("persists image crops", async () => {
      });
      it("removes image files when image is removed", async () => {
      });
      it("handles naming collisions", async () => {
      });
    });
    describe("renaming", () => {
      it("does not rename when name is changed but matches", async () => {
      });
      it("renames the card file when the card name changes", async () => {
      });
      it("renames to a safe filename when a conflict exists", async () => {
      });
      it("renames card image files when the card name changes", async () => {
      });
    });
    describe("removal", () => {
      it("removes the card data file when card is deleted", async () => {
      });
      it("removes the card image files when card is deleted", async () => {
      });
      it("removes the right files when a naming conflict exists", async () => {
      });
      it("works with removing multiple cards at the same time", async () => {
      });
      it("does not rename cards named to avoid collisions", async () => {
      });
      it("does not recreate the card when a save was pending", async () => {
      });
    });
    describe("copy/paste", () => {
      it("creates a new card", async () => {
      });
      it("can create multiple cards", async () => {
      });
      it("copies all field values", async () => {
      });
      it("saves image to a new file", async () => {
      });
      it("does not change pasted card when source is changed later", async () => {
      });
      it("does not change the source card when pasted card is changed", async () => {
      });
      it("creates a card after source is removed", async () => {
      });
      it("works with copying a pasted card", async () => {
      });
      it("creates multiple independent cards on multiple pastes", async () => {
      });
    });
  });

  // src/shared/testing/customReporter.js
  var ansi = {
    green: "\x1B[32m",
    red: "\x1B[31m",
    yellow: "\x1B[33m",
    none: "\x1B[0m"
  };
  var _print, _showColors, _alwaysListPendingSpecs, _listNotApplicableSpecs, _stackFilter, _failedSpecs, _pendingSpecs, _notApplicableSpecs, _failedSuites, _outputQueue, _CustomReporter_instances, write_fn, printNewline_fn, colored_fn, specFailureDetails_fn, suiteFailureDetails_fn, printFailedExpectations_fn, pendingSpecDetails_fn, printNotApplicableSpecs_fn, printSummary_fn;
  var CustomReporter = class {
    constructor(options) {
      __privateAdd(this, _CustomReporter_instances);
      __privateAdd(this, _print);
      __privateAdd(this, _showColors);
      __privateAdd(this, _alwaysListPendingSpecs);
      __privateAdd(this, _listNotApplicableSpecs);
      __privateAdd(this, _stackFilter);
      __privateAdd(this, _failedSpecs);
      __privateAdd(this, _pendingSpecs);
      __privateAdd(this, _notApplicableSpecs);
      __privateAdd(this, _failedSuites);
      __privateAdd(this, _outputQueue);
      if (!options?.print)
        throw new Error("CustomReporter requires a print function.");
      __privateSet(this, _print, options.print);
      __privateSet(this, _showColors, options.color ?? false);
      __privateSet(this, _alwaysListPendingSpecs, options.alwaysListPendingSpecs ?? true);
      __privateSet(this, _listNotApplicableSpecs, options.listNotApplicableSpecs ?? false);
      __privateSet(this, _stackFilter, options.stackFilter ?? ((stack) => stack));
      __privateSet(this, _failedSpecs, []);
      __privateSet(this, _pendingSpecs, []);
      __privateSet(this, _notApplicableSpecs, []);
      __privateSet(this, _failedSuites, []);
      __privateSet(this, _outputQueue, Promise.resolve());
    }
    jasmineStarted(options) {
      this.specCount = 0;
      this.executableSpecCount = 0;
      this.failureCount = 0;
      if (options?.order?.random) {
        __privateMethod(this, _CustomReporter_instances, write_fn).call(this, `Randomized with seed ${options.order.seed}`);
        __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
      }
      __privateMethod(this, _CustomReporter_instances, write_fn).call(this, "Started");
      __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
    }
    specDone(result) {
      this.specCount++;
      switch (result.status) {
        case "pending":
          __privateGet(this, _pendingSpecs).push(result);
          this.executableSpecCount++;
          __privateMethod(this, _CustomReporter_instances, write_fn).call(this, __privateMethod(this, _CustomReporter_instances, colored_fn).call(this, "yellow", "*"));
          break;
        case "notApplicable":
          __privateGet(this, _notApplicableSpecs).push(result);
          this.executableSpecCount++;
          break;
        case "passed":
          this.executableSpecCount++;
          __privateMethod(this, _CustomReporter_instances, write_fn).call(this, __privateMethod(this, _CustomReporter_instances, colored_fn).call(this, "green", "."));
          break;
        case "failed":
          this.failureCount++;
          __privateGet(this, _failedSpecs).push(result);
          this.executableSpecCount++;
          __privateMethod(this, _CustomReporter_instances, write_fn).call(this, __privateMethod(this, _CustomReporter_instances, colored_fn).call(this, "red", "F"));
          break;
      }
    }
    suiteDone(result) {
      if (result.failedExpectations?.length > 0) {
        this.failureCount++;
        __privateGet(this, _failedSuites).push(result);
      }
    }
    async jasmineDone(result) {
      if (result.failedExpectations)
        this.failureCount += result.failedExpectations.length;
      __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
      __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
      if (__privateGet(this, _failedSpecs).length > 0)
        __privateMethod(this, _CustomReporter_instances, write_fn).call(this, "Failures:");
      for (let i = 0; i < __privateGet(this, _failedSpecs).length; i++)
        __privateMethod(this, _CustomReporter_instances, specFailureDetails_fn).call(this, __privateGet(this, _failedSpecs)[i], i + 1);
      for (const failedSuite of __privateGet(this, _failedSuites))
        __privateMethod(this, _CustomReporter_instances, suiteFailureDetails_fn).call(this, failedSuite);
      if (result.failedExpectations?.length > 0) {
        __privateMethod(this, _CustomReporter_instances, suiteFailureDetails_fn).call(this, {
          fullName: "top suite",
          ...result
        });
      }
      if (__privateGet(this, _alwaysListPendingSpecs) || result.overallStatus === "passed") {
        if (__privateGet(this, _pendingSpecs).length > 0)
          __privateMethod(this, _CustomReporter_instances, write_fn).call(this, "Pending:");
        for (let i = 0; i < __privateGet(this, _pendingSpecs).length; i++)
          __privateMethod(this, _CustomReporter_instances, pendingSpecDetails_fn).call(this, __privateGet(this, _pendingSpecs)[i], i + 1);
      }
      __privateMethod(this, _CustomReporter_instances, printNotApplicableSpecs_fn).call(this);
      if (this.specCount > 0)
        __privateMethod(this, _CustomReporter_instances, printSummary_fn).call(this);
      else
        __privateMethod(this, _CustomReporter_instances, write_fn).call(this, "No specs found");
      __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
      const seconds = result?.totalTime / 1e3 || 0;
      __privateMethod(this, _CustomReporter_instances, write_fn).call(this, `Finished in ${seconds} ${plural("second", seconds)}`);
      __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
      if (result?.overallStatus === "incomplete") {
        __privateMethod(this, _CustomReporter_instances, write_fn).call(this, `Incomplete: ${result.incompleteReason}`);
        __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
      }
      if (result?.order?.random) {
        __privateMethod(this, _CustomReporter_instances, write_fn).call(this, `Randomized with seed ${result.order.seed}`);
        __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
      }
      await __privateGet(this, _outputQueue);
    }
  };
  _print = new WeakMap();
  _showColors = new WeakMap();
  _alwaysListPendingSpecs = new WeakMap();
  _listNotApplicableSpecs = new WeakMap();
  _stackFilter = new WeakMap();
  _failedSpecs = new WeakMap();
  _pendingSpecs = new WeakMap();
  _notApplicableSpecs = new WeakMap();
  _failedSuites = new WeakMap();
  _outputQueue = new WeakMap();
  _CustomReporter_instances = new WeakSet();
  write_fn = function(text) {
    __privateSet(this, _outputQueue, __privateGet(this, _outputQueue).then(() => __privateGet(this, _print).call(this, text)));
  };
  printNewline_fn = function() {
    __privateMethod(this, _CustomReporter_instances, write_fn).call(this, "\n");
  };
  colored_fn = function(color, text) {
    if (!__privateGet(this, _showColors))
      return text;
    return ansi[color] + text + ansi.none;
  };
  specFailureDetails_fn = function(result, failedSpecNumber) {
    __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
    __privateMethod(this, _CustomReporter_instances, write_fn).call(this, `${failedSpecNumber}) ${result.fullName}`);
    __privateMethod(this, _CustomReporter_instances, printFailedExpectations_fn).call(this, result);
    if (!result.debugLogs)
      return;
    __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
    __privateMethod(this, _CustomReporter_instances, write_fn).call(this, indent("Debug logs:", 2));
    __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
    for (const entry of result.debugLogs) {
      __privateMethod(this, _CustomReporter_instances, write_fn).call(this, indent(`${entry.timestamp}ms: ${entry.message}`, 4));
      __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
    }
  };
  suiteFailureDetails_fn = function(result) {
    __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
    __privateMethod(this, _CustomReporter_instances, write_fn).call(this, `Suite error: ${result.fullName}`);
    __privateMethod(this, _CustomReporter_instances, printFailedExpectations_fn).call(this, result);
  };
  printFailedExpectations_fn = function(result) {
    for (const failedExpectation of result.failedExpectations) {
      __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
      __privateMethod(this, _CustomReporter_instances, write_fn).call(this, indent("Message:", 2));
      __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
      __privateMethod(this, _CustomReporter_instances, write_fn).call(this, __privateMethod(this, _CustomReporter_instances, colored_fn).call(this, "red", indent(failedExpectation.message, 4)));
      __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
      __privateMethod(this, _CustomReporter_instances, write_fn).call(this, indent("Stack:", 2));
      __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
      __privateMethod(this, _CustomReporter_instances, write_fn).call(this, indent(__privateGet(this, _stackFilter).call(this, failedExpectation.stack), 4));
    }
    if (result.failedExpectations.length === 0 && result.passedExpectations.length === 0) {
      __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
      __privateMethod(this, _CustomReporter_instances, write_fn).call(this, indent("Message:", 2));
      __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
      __privateMethod(this, _CustomReporter_instances, write_fn).call(this, __privateMethod(this, _CustomReporter_instances, colored_fn).call(this, "red", indent("Spec has no expectations", 4)));
    }
    __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
  };
  pendingSpecDetails_fn = function(result, pendingSpecNumber) {
    __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
    __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
    __privateMethod(this, _CustomReporter_instances, write_fn).call(this, `${pendingSpecNumber}) ${result.fullName}`);
    __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
    const reason = result.pendingReason || "No reason given";
    __privateMethod(this, _CustomReporter_instances, write_fn).call(this, indent(__privateMethod(this, _CustomReporter_instances, colored_fn).call(this, "yellow", reason), 2));
    __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
  };
  printNotApplicableSpecs_fn = function() {
    if (__privateGet(this, _notApplicableSpecs).length === 0)
      return;
    const byReason = {};
    for (const spec of __privateGet(this, _notApplicableSpecs)) {
      const reason = spec.notApplicableReason;
      if (!byReason[reason])
        byReason[reason] = [];
      byReason[reason].push(spec.fullName);
    }
    __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
    for (const [reason, specNames] of Object.entries(byReason)) {
      __privateMethod(this, _CustomReporter_instances, write_fn).call(this, `${specNames.length} ${plural("spec", specNames.length)} not applicable because: ${reason}`);
      __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
      if (!__privateGet(this, _listNotApplicableSpecs))
        continue;
      for (const name of specNames) {
        __privateMethod(this, _CustomReporter_instances, write_fn).call(this, `   * ${name}`);
        __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
      }
    }
  };
  printSummary_fn = function() {
    __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
    if (this.executableSpecCount !== this.specCount) {
      __privateMethod(this, _CustomReporter_instances, write_fn).call(this, `Ran ${this.executableSpecCount} of ${this.specCount}` + plural(" spec", this.specCount));
      __privateMethod(this, _CustomReporter_instances, printNewline_fn).call(this);
    }
    let summary = `${this.executableSpecCount} ${plural("spec", this.executableSpecCount)}, ${this.failureCount} ` + plural("failure", this.failureCount);
    if (__privateGet(this, _pendingSpecs).length) {
      summary += `, ${__privateGet(this, _pendingSpecs).length} pending ` + plural("spec", __privateGet(this, _pendingSpecs).length);
    }
    __privateMethod(this, _CustomReporter_instances, write_fn).call(this, summary);
  };
  function plural(text, count) {
    return count === 1 ? text : `${text}s`;
  }
  function indent(text, spaces) {
    const prefix = " ".repeat(spaces);
    return (text || "").split("\n").map((line) => prefix + line).join("\n");
  }
  var customReporter_default = CustomReporter;

  // src/smoke.js
  var RESULT_PREFIX = "@TEST_RESULT:";
  var OUTPUT_PREFIX = "@TEST_OUTPUT:";
  function getArgument(name) {
    const prefix = `${name}=`;
    const argument = NL_ARGS.find((arg) => arg.startsWith(prefix));
    return argument?.slice(prefix.length);
  }
  function getSuiteId() {
    const targetSuite = getArgument("--test-suite");
    const top = jasmine.getEnv().topSuite();
    for (const suite of top.children || []) {
      if (suite.description === targetSuite)
        return suite.id;
    }
    throw new Error(`Test suite not found: ${targetSuite}`);
  }
  function verifyTestEnvironment() {
    if (NL_APPID === "cardmagician.test") return;
    throw new Error(`Canceling smoke tests with unsupported appId "${NL_APPID}".`);
  }
  async function runTests() {
    log("startup").info("Initializing neutralino");
    Neutralino.init();
    log("startup").info("Verifying test environment");
    verifyTestEnvironment();
    log("startup").info("Clearing neutralino storage");
    await Neutralino.storage.clear();
    log("startup").info("Executing jasmine tests");
    const suiteId = getSuiteId();
    await jasmine.getEnv().execute([suiteId]);
  }
  function print(message) {
    writeProcessOutput(OUTPUT_PREFIX + JSON.stringify({ message }) + "\n");
  }
  jasmine.getEnv().addReporter(
    new customReporter_default({ print, color: true })
  );
  jasmine.getEnv().addReporter({
    async jasmineDone(result) {
      const output = JSON.stringify({ status: result.overallStatus });
      await writeProcessOutput(RESULT_PREFIX + output + "\n");
      if (!NL_ARGS.includes("--stay-open")) close();
    }
  });
  window.addEventListener("beforeunload", () => {
    exitApp();
  });
  window.addEventListener("cm-loaded", () => {
    runTests();
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3N0YXJ0dXAuc21va2UuanMiLCAiLi4vLi4vc3JjL3NoYXJlZC9uZXV0cmFsaW5vQWRhcHRlci5qcyIsICIuLi8uLi9zcmMvc2hhcmVkL2ltYWdlVXRpbHMuanMiLCAiLi4vLi4vc3JjL3NoYXJlZC9mc1V0aWxzLmpzIiwgIi4uLy4uL3NyYy91aS9zeXN0ZW1zL2FjdGlvblN5c3RlbS5qcyIsICIuLi8uLi9zcmMvc2hhcmVkL2h0bWxVdGlscy5qcyIsICIuLi8uLi9zcmMvc2hhcmVkL3Rlc3RpbmcvRmllbGRJbnRlcmFjdG9yLmpzIiwgIi4uLy4uL3NyYy9zaGFyZWQvdGVzdGluZy90ZXN0VXRpbHMuanMiLCAiLi4vLi4vc3JjL2RvbWFpbi9wcm9qZWN0cy9hZGFwdGVycy9TZXJpYWxpemVyQWRhcHRlci5qcyIsICIuLi8uLi9zcmMvZG9tYWluL3Byb2plY3RzL2FkYXB0ZXJzL01hbmFDb3N0QWRhcHRlci5qcyIsICIuLi8uLi9zcmMvZG9tYWluL2NhcmQvSW1hZ2VDcm9wLmpzIiwgIi4uLy4uL3NyYy91aS9zeXN0ZW1zL29iamVjdFVybFN5c3RlbS5qcyIsICIuLi8uLi9zcmMvZG9tYWluL2NhcmQvSW1hZ2VGaWVsZFZhbHVlLmpzIiwgIi4uLy4uL3NyYy9kb21haW4vcHJvamVjdHMvYWRhcHRlcnMvSW1hZ2VGaWVsZEFkYXB0ZXIuanMiLCAiLi4vLi4vc3JjL2RvbWFpbi9wcm9qZWN0cy9hZGFwdGVycy9PYmplY3RVcmxCaW5hcnlBZGFwdGVyLmpzIiwgIi4uLy4uL3NyYy9kb21haW4vcHJvamVjdHMvYWRhcHRlcnMvYWRhcHRlclJlZ2lzdHJ5LmpzIiwgIi4uLy4uL3NyYy9kb21haW4vcHJvamVjdHMvc2VyaWFsaXplcnMvU2VyaWFsaXplci5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvaW5kZXguanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL2lkZW50aXR5LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC92aXNpdC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvZG9jL2RpcmVjdGl2ZXMuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2RvYy9hbmNob3JzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9kb2MvYXBwbHlSZXZpdmVyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy90b0pTLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy9Ob2RlLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy9BbGlhcy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvU2NhbGFyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9kb2MvY3JlYXRlTm9kZS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvQ29sbGVjdGlvbi5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeUNvbW1lbnQuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3N0cmluZ2lmeS9mb2xkRmxvd0xpbmVzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5U3RyaW5nLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5UGFpci5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvbG9nLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvbWVyZ2UuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL2FkZFBhaXJUb0pTTWFwLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy9QYWlyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5Q29sbGVjdGlvbi5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvWUFNTE1hcC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL2NvbW1vbi9tYXAuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL1lBTUxTZXEuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9jb21tb24vc2VxLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvY29tbW9uL3N0cmluZy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL2NvbW1vbi9udWxsLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvY29yZS9ib29sLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5TnVtYmVyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvY29yZS9mbG9hdC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL2NvcmUvaW50LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvY29yZS9zY2hlbWEuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9qc29uL3NjaGVtYS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2JpbmFyeS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL3BhaXJzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvb21hcC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2Jvb2wuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS95YW1sLTEuMS9mbG9hdC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2ludC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL3NldC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL3RpbWVzdGFtcC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL3NjaGVtYS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3RhZ3MuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9TY2hlbWEuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlEb2N1bWVudC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvZG9jL0RvY3VtZW50LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9lcnJvcnMuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1wcm9wcy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS91dGlsLWNvbnRhaW5zLW5ld2xpbmUuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvdXRpbC1mbG93LWluZGVudC1jaGVjay5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS91dGlsLW1hcC1pbmNsdWRlcy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWJsb2NrLW1hcC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWJsb2NrLXNlcS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWVuZC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWZsb3ctY29sbGVjdGlvbi5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9jb21wb3NlLWNvbGxlY3Rpb24uanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1ibG9jay1zY2FsYXIuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1mbG93LXNjYWxhci5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9jb21wb3NlLXNjYWxhci5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS91dGlsLWVtcHR5LXNjYWxhci1wb3NpdGlvbi5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9jb21wb3NlLW5vZGUuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvY29tcG9zZS1kb2MuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2NvbXBvc2UvY29tcG9zZXIuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3BhcnNlL2NzdC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvcGFyc2UvY3N0LXNjYWxhci5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvcGFyc2UvY3N0LXN0cmluZ2lmeS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvcGFyc2UvY3N0LXZpc2l0LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9wYXJzZS9sZXhlci5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvcGFyc2UvbGluZS1jb3VudGVyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9wYXJzZS9wYXJzZXIuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3B1YmxpYy1hcGkuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9pbmRleC5qcyIsICIuLi8uLi9zcmMvZG9tYWluL3Byb2plY3RzL3NlcmlhbGl6ZXJzL1lBTUxTZXJpYWxpemVyLmpzIiwgIi4uLy4uL3NyYy9kb21haW4vcGVyc2lzdGVuY2Uuc21va2UuanMiLCAiLi4vLi4vc3JjL3NoYXJlZC90ZXN0aW5nL2N1c3RvbVJlcG9ydGVyLmpzIiwgIi4uLy4uL3NyYy9zbW9rZS5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZGVzY3JpYmUoJ1N0YXJ0dXAnLCAoKSA9PiB7XHJcbiAgICBpdCgnbG9hZHMgdGhlIGFwcGxpY2F0aW9uIFVJJywgKCkgPT4ge1xyXG4gICAgICAgIGV4cGVjdChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdjbS10aXRsZS1iYXInKSkubm90LnRvQmVOdWxsKCk7XHJcbiAgICAgICAgZXhwZWN0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NtLWRpc3BsYXktY2FyZCcpKS5ub3QudG9CZU51bGwoKTtcclxuICAgICAgICBleHBlY3QoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY20tc2V0LXZpZXcnKSkubm90LnRvQmVOdWxsKCk7XHJcbiAgICAgICAgZXhwZWN0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NtLWNhcmQtZm9ybScpKS5ub3QudG9CZU51bGwoKTtcclxuICAgICAgICBleHBlY3QoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY20tbW9iaWxlLWFjdGlvbnMnKSkubm90LnRvQmVOdWxsKCk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsICJpbXBvcnQgc2FmZVN0cmluZ2lmeSBmcm9tICcuL3RoZVByaW50ZXIuanMnO1xuXG5jb25zdCBsZXZlbFRvTG9nVHlwZSA9IHtcbiAgICBpbmZvOiAnSU5GTycsXG4gICAgd2FybjogJ1dBUk5JTkcnLFxuICAgIGVycm9yOiAnRVJST1InLFxufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlYnVnTG9nKGxldmVsLCBtZXNzYWdlLCBhcmdzKSB7XG4gICAgY29uc3QgdHlwZSA9IGxldmVsVG9Mb2dUeXBlW2xldmVsXSA/PyAnSU5GTyc7XG4gICAgY29uc3QgbWVzc2FnZVdpdGhBcmdzID0gbWVzc2FnZSArIGFyZ3MubWFwKGFyZyA9PiB7XG4gICAgICAgIHJldHVybiBgXFxuJHtzYWZlU3RyaW5naWZ5KGFyZyl9YDtcbiAgICB9KS5qb2luKCcnKTtcbiAgICByZXR1cm4gYXdhaXQgTmV1dHJhbGluby5kZWJ1Zy5sb2cobWVzc2FnZVdpdGhBcmdzLCB0eXBlKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5TaW5nbGVGaWxlRGlhbG9nKGxhYmVsLCBmaWx0ZXJzKSB7XG4gICAgbG9nKCdmcycpLmRlYnVnKCdvcGVuU2luZ2xlRmlsZURpYWxvZycsIGxhYmVsLCBmaWx0ZXJzKTtcbiAgICBjb25zdCByZXMgPSBhd2FpdCBOZXV0cmFsaW5vLm9zLnNob3dPcGVuRGlhbG9nKGxhYmVsLCB7IGZpbHRlcnMgfSk7XG4gICAgcmV0dXJuIHJlcz8uWzBdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb3BlbkZvbGRlckRpYWxvZyhsYWJlbCkge1xuICAgIGxvZygnZnMnKS5kZWJ1Zygnb3BlbkZvbGRlckRpYWxvZycsIGxhYmVsKTtcbiAgICByZXR1cm4gYXdhaXQgTmV1dHJhbGluby5vcy5zaG93Rm9sZGVyRGlhbG9nKGxhYmVsKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVTaW5nbGVGaWxlRGlhbG9nKGxhYmVsLCBkZWZhdWx0UGF0aCwgZmlsdGVycykge1xuICAgIGxvZygnZnMnKS5kZWJ1Zygnc2F2ZVNpbmdsZUZpbGVEaWFsb2cnLCBsYWJlbCwgZGVmYXVsdFBhdGgsIGZpbHRlcnMpO1xuICAgIHJldHVybiBhd2FpdCBOZXV0cmFsaW5vLm9zLnNob3dTYXZlRGlhbG9nKGxhYmVsLCB7IGRlZmF1bHRQYXRoLCBmaWx0ZXJzIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U3RvcmVkRGF0YShrZXkpIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ3N0b3JhZ2UuZ2V0RGF0YScsIGtleSk7XG4gICAgcmV0dXJuIGF3YWl0IE5ldXRyYWxpbm8uc3RvcmFnZS5nZXREYXRhKGtleSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdG9yZURhdGEoa2V5LCB2YWx1ZSkge1xuICAgIGxvZygnZnMnKS5kZWJ1Zygnc3RvcmFnZS5zdG9yZURhdGEnLCBrZXksIHZhbHVlKTtcbiAgICByZXR1cm4gYXdhaXQgTmV1dHJhbGluby5zdG9yYWdlLnNldERhdGEoa2V5LCB2YWx1ZSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkRGlyZWN0b3J5KHBhdGgsIG9wdGlvbnMpIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ3JlYWREaXJlY3RvcnknLCBwYXRoLCBvcHRpb25zKTtcbiAgICByZXR1cm4gYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLnJlYWREaXJlY3RvcnkocGF0aCwgb3B0aW9ucyk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkRmlsZShwYXRoKSB7XG4gICAgbG9nKCdmcycpLmRlYnVnKCdyZWFkRmlsZScsIHBhdGgpO1xuICAgIHJldHVybiBhd2FpdCBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0ucmVhZEZpbGUocGF0aCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cml0ZUZpbGUocGF0aCwgZGF0YSkge1xuICAgIGxvZygnZnMnKS5kZWJ1Zygnd3JpdGVGaWxlJywgcGF0aCwgYCR7ZGF0YS5sZW5ndGh9IGJ5dGVzYCk7XG4gICAgY29uc3QgeyBwYXJlbnRQYXRoIH0gPSBhd2FpdCBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0uZ2V0UGF0aFBhcnRzKHBhdGgpO1xuICAgIGF3YWl0IGNyZWF0ZURpcmVjdG9yeShwYXJlbnRQYXRoKTtcbiAgICBhd2FpdCBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0ud3JpdGVGaWxlKHBhdGgsIGRhdGEpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JpdGVCaW5hcnlGaWxlKHBhdGgsIGRhdGEpIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ3dyaXRlQmluYXJ5RmlsZScsIHBhdGgsIGAke2RhdGEuYnl0ZUxlbmd0aH0gYnl0ZXNgKTtcbiAgICBjb25zdCB7IHBhcmVudFBhdGggfSA9IGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5nZXRQYXRoUGFydHMocGF0aCk7XG4gICAgYXdhaXQgY3JlYXRlRGlyZWN0b3J5KHBhcmVudFBhdGgpO1xuICAgIGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS53cml0ZUJpbmFyeUZpbGUocGF0aCwgZGF0YSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkQmluYXJ5RmlsZShwYXRoKSB7XG4gICAgbG9nKCdmcycpLmRlYnVnKCdyZWFkQmluYXJ5RmlsZScsIHBhdGgpO1xuICAgIHJldHVybiBhd2FpdCBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0ucmVhZEJpbmFyeUZpbGUocGF0aCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBYnNvbHV0ZVBhdGgocGF0aCkge1xuICAgIGxvZygnZnMnKS5kZWJ1ZygnZ2V0QWJzb2x1dGVQYXRoJywgcGF0aCk7XG4gICAgcmV0dXJuIGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5nZXRBYnNvbHV0ZVBhdGgocGF0aCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuKHBhdGgpIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ29wZW4nLCBwYXRoKTtcbiAgICByZXR1cm4gYXdhaXQgTmV1dHJhbGluby5vcy5vcGVuKHBhdGgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U3RhdHMocGF0aCkge1xuICAgIGxvZygnZnMnKS5kZWJ1ZygnZ2V0U3RhdHMnLCBwYXRoKTtcbiAgICByZXR1cm4gYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLmdldFN0YXRzKHBhdGgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Sm9pbmVkUGF0aCguLi5wYXRocykge1xuICAgIGxvZygnZnMnKS5kZWJ1ZygnZ2V0Sm9pbmVkUGF0aCcsIHBhdGhzKTtcbiAgICByZXR1cm4gYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLmdldEpvaW5lZFBhdGgoLi4ucGF0aHMpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbW92ZUZpbGUoc291cmNlLCBkZXN0aW5hdGlvbikge1xuICAgIGxvZygnZnMnKS5kZWJ1ZygnbW92ZUZpbGUnLCBzb3VyY2UsIGRlc3RpbmF0aW9uKTtcbiAgICByZXR1cm4gYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLm1vdmUoc291cmNlLCBkZXN0aW5hdGlvbik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVEaXJlY3RvcnkocGF0aCkge1xuICAgIGxvZygnZnMnKS5kZWJ1ZygnY3JlYXRlRGlyZWN0b3J5JywgcGF0aCk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLmNyZWF0ZURpcmVjdG9yeShwYXRoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IuY29kZSAhPT0gJ05FX0ZTX0RJUkNSRVInKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2Vycm9yLmNvZGV9ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQYXRoUGFydHMocGF0aCkge1xuICAgIGxvZygnZnMnKS5kZWJ1ZygnZ2V0UGF0aFBhcnRzJywgcGF0aCk7XG4gICAgcmV0dXJuIGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5nZXRQYXRoUGFydHMocGF0aCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQYXJlbnRQYXRoKHBhdGgpIHtcbiAgICBjb25zdCB7IHBhcmVudFBhdGggfSA9IGF3YWl0IGdldFBhdGhQYXJ0cyhwYXRoKTtcbiAgICByZXR1cm4gcGFyZW50UGF0aDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJtcmYocGF0aCkge1xuICAgIGxvZygnZnMnKS5kZWJ1ZygncmVtb3ZlJywgcGF0aCk7XG4gICAgcmV0dXJuIGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5yZW1vdmUocGF0aCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRNb3VudHMoKSB7XG4gICAgbG9nKCdmcycpLmRlYnVnKCdnZXRNb3VudHMnKTtcbiAgICByZXR1cm4gYXdhaXQgTmV1dHJhbGluby5zZXJ2ZXIuZ2V0TW91bnRzKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1bm1vdW50KHBhdGgpIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ3VubW91bnQnLCBwYXRoKTtcbiAgICBjb25zdCBtb3VudHMgPSBhd2FpdCBOZXV0cmFsaW5vLnNlcnZlci5nZXRNb3VudHMoKTtcbiAgICBpZiAoIW1vdW50c1twYXRoXSkgcmV0dXJuO1xuICAgIGF3YWl0IE5ldXRyYWxpbm8uc2VydmVyLnVubW91bnQocGF0aCk7XG4gICAgLy8gVGhpcyBwcm90ZWN0cyB1cyBmcm9tIGEgdGltaW5nIGJ1ZyB3aGljaCBvY2N1cnMgd2hlbiB0aGUgY29kZVxuICAgIC8vIHRyaWVzIHRvIG1vdW50IGEgcGF0aCBhZnRlciB1bm1vdW50aW5nIGl0LlxuICAgIGF3YWl0IE5ldXRyYWxpbm8uc2VydmVyLmdldE1vdW50cygpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbW91bnQocGF0aCwgdGFyZ2V0KSB7XG4gICAgbG9nKCdmcycpLmRlYnVnKCdtb3VudCcsIHBhdGgsIHRhcmdldCk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgTmV1dHJhbGluby5zZXJ2ZXIubW91bnQocGF0aCwgdGFyZ2V0KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IuY29kZSAhPT0gJ05FX1NSX01QSU5VU0UnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2Vycm9yLmNvZGV9ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRXaW5kb3dTaXplKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gYXdhaXQgTmV1dHJhbGluby53aW5kb3cuc2V0U2l6ZShvcHRpb25zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlUHJvY2Vzc091dHB1dChkYXRhKSB7XG4gICAgcmV0dXJuIE5ldXRyYWxpbm8uYXBwLndyaXRlUHJvY2Vzc091dHB1dChkYXRhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlUHJvY2Vzc0Vycm9yKGRhdGEpIHtcbiAgICByZXR1cm4gTmV1dHJhbGluby5hcHAud3JpdGVQcm9jZXNzRXJyb3IoZGF0YSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0QXBwKCkge1xuICAgIE5ldXRyYWxpbm8uaW5pdCgpO1xuICAgIGF3YWl0IE5ldXRyYWxpbm8uZXZlbnRzLm9uKCd3aW5kb3dDbG9zZScsICgpID0+IE5ldXRyYWxpbm8uYXBwLmV4aXQoMCkpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBOZXV0cmFsaW5vLmV2ZW50cy5vbigncmVhZHknLCAoKSA9PiByZXNvbHZlKCkpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhpdEFwcChjb2RlID0gMCkge1xuICAgIE5ldXRyYWxpbm8uYXBwLmV4aXQoY29kZSk7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGltYWdlVG9DYW52YXMoaW1nKSB7XG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgY2FudmFzLndpZHRoID0gaW1nLndpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0O1xuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcbiAgICBjb25zdCBpbWFnZURhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGltZy53aWR0aCwgaW1nLmhlaWdodCk7XG4gICAgcmV0dXJuIHsgY2FudmFzLCBjdHgsIGltYWdlRGF0YSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV3Q2FudmFzKHdpZHRoLCBoZWlnaHQpIHtcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHJldHVybiB7IGNhbnZhcywgY3R4IH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkSW1hZ2UodXJsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKGltZyk7XG4gICAgICAgIGltZy5vbmVycm9yID0gZSA9PiByZWplY3QoXG4gICAgICAgICAgICBuZXcgRXJyb3IoYEZhaWxlZCB0byBsb2FkIGltYWdlICR7dXJsfSwgJHtlLm1lc3NhZ2V9YClcbiAgICAgICAgKTtcbiAgICAgICAgaW1nLnNyYyA9IHVybDtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEltYWdlU2l6ZSh1cmwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgIHdpZHRoOiBpbWcubmF0dXJhbFdpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogaW1nLm5hdHVyYWxIZWlnaHRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBpbWcub25lcnJvciA9IGUgPT4gcmVqZWN0KFxuICAgICAgICAgICAgbmV3IEVycm9yKGBGYWlsZWQgdG8gbG9hZCBpbWFnZSAke3VybH0sICR7ZS5tZXNzYWdlfWApXG4gICAgICAgICk7XG4gICAgICAgIGltZy5zcmMgPSB1cmw7XG4gICAgfSk7XG59XG5cblxuZnVuY3Rpb24gaGFzUG5nTWFnaWMoYnl0ZXMpIHtcbiAgICByZXR1cm4gYnl0ZXMubGVuZ3RoID49IDhcbiAgICAgICAgJiYgYnl0ZXNbMF0gPT09IDB4ODlcbiAgICAgICAgJiYgYnl0ZXNbMV0gPT09IDB4NTBcbiAgICAgICAgJiYgYnl0ZXNbMl0gPT09IDB4NEVcbiAgICAgICAgJiYgYnl0ZXNbM10gPT09IDB4NDdcbiAgICAgICAgJiYgYnl0ZXNbNF0gPT09IDB4MERcbiAgICAgICAgJiYgYnl0ZXNbNV0gPT09IDB4MEFcbiAgICAgICAgJiYgYnl0ZXNbNl0gPT09IDB4MUFcbiAgICAgICAgJiYgYnl0ZXNbN10gPT09IDB4MEE7XG59XG5cbmZ1bmN0aW9uIGhhc0pwZWdNYWdpYyhieXRlcykge1xuICAgIHJldHVybiBieXRlcy5sZW5ndGggPj0gM1xuICAgICAgICAmJiBieXRlc1swXSA9PT0gMHhGRlxuICAgICAgICAmJiBieXRlc1sxXSA9PT0gMHhEOFxuICAgICAgICAmJiBieXRlc1syXSA9PT0gMHhGRjtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbWFnZSBtaW1lIHR5cGUgZm9yIGEgZ2l2ZW4gYnVmZmVyIG9mIGRhdGEuXG4gKlxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gZGF0YSAtIGltYWdlIGJ5dGVzIGxvYWRlZCBmcm9tIGRpc2suXG4gKiBAcmV0dXJucyB7J2ltYWdlL2pwZWcnfCdpbWFnZS9wbmcnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGV0ZXJtaW5lSW1hZ2VUeXBlKGRhdGEpIHtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgIGlmIChoYXNQbmdNYWdpYyhieXRlcykpIHJldHVybiAnaW1hZ2UvcG5nJztcbiAgICBpZiAoaGFzSnBlZ01hZ2ljKGJ5dGVzKSkgcmV0dXJuICdpbWFnZS9qcGVnJztcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gaW1hZ2UgdHlwZScpO1xufVxuIiwgImltcG9ydCB7XG4gICAgZ2V0Sm9pbmVkUGF0aCxcbiAgICBnZXRTdGF0cyxcbiAgICByZWFkQmluYXJ5RmlsZSxcbiAgICByZWFkRGlyZWN0b3J5LFxuICAgIHJlYWRGaWxlXG59IGZyb20gJy4vbmV1dHJhbGlub0FkYXB0ZXIuanMnO1xuaW1wb3J0IHsgZGV0ZXJtaW5lSW1hZ2VUeXBlIH0gZnJvbSAnLi9pbWFnZVV0aWxzLmpzJztcblxuLyoqXG4gKiBMb2FkcyBhbmQgcGFyc2VzIGEgSlNPTiBmaWxlIGZyb20gdGhlIGdpdmVuIGZpbGUgcGF0aC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlUGF0aFxuICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRKc29uKGZpbGVQYXRoKSB7XG4gICAgY29uc3QgdGV4dCA9IGF3YWl0IHJlYWRGaWxlKGZpbGVQYXRoKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZSh0ZXh0KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgYSBmaWxlIGV4aXN0cyBhdCB0aGUgZ2l2ZW4gZmlsZSBwYXRoLlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVQYXRoXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrRmlsZUV4aXN0cyhmaWxlUGF0aCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgZ2V0U3RhdHMoZmlsZVBhdGgpO1xuICAgICAgICByZXR1cm4gc3RhdHMuaXNGaWxlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChlcnJvci5jb2RlID09PSAnTkVfRlNfTk9QQVRIRScpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tGb2xkZXJFeGlzdHMoZm9sZGVyUGF0aCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgZ2V0U3RhdHMoZm9sZGVyUGF0aCk7XG4gICAgICAgIHJldHVybiAhc3RhdHMuaXNGaWxlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChlcnJvci5jb2RlID09PSAnTkVfRlNfTk9QQVRIRScpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRNYXRjaGluZ0VudHJpZXMoZm9sZGVyUGF0aCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgbWF0Y2hpbmc6IG51bGwsXG4gICAgICAgIGZpbGVzOiB0cnVlLFxuICAgICAgICBkaXJlY3RvcmllczogZmFsc2UsXG4gICAgICAgIHJlY3Vyc2l2ZTogZmFsc2UsXG4gICAgfSwgb3B0aW9ucyk7XG4gICAgaWYgKCFhd2FpdCBjaGVja0ZvbGRlckV4aXN0cyhmb2xkZXJQYXRoKSkgcmV0dXJuIFtdO1xuICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCByZWFkRGlyZWN0b3J5KGZvbGRlclBhdGgsIHsgcmVjdXJzaXZlOiBvcHRpb25zLnJlY3Vyc2l2ZSB9KTtcbiAgICByZXR1cm4gZW50cmllcy5maWx0ZXIoKHsgZW50cnksIHR5cGUgfSkgPT4ge1xuICAgICAgICBpZiAoIW9wdGlvbnMuZmlsZXMgJiYgdHlwZSA9PT0gJ0ZJTEUnKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICghb3B0aW9ucy5kaXJlY3RvcmllcyAmJiB0eXBlID09PSAnRElSRUNUT1JZJykgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gIW9wdGlvbnMubWF0Y2hpbmcgfHwgb3B0aW9ucy5tYXRjaGluZy50ZXN0KGVudHJ5KTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjb250ZW50cyBvZiBhIGZvbGRlciBpZiBpdCBleGlzdHMsIGVsc2UgcmV0dXJucyBhbiBlbXB0eSBhcnJheS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBmb2xkZXJQYXRoXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHJldHVybnMge1Byb21pc2U8QXJyYXk8c3RyaW5nPj59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kKGZvbGRlclBhdGgsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBnZXRNYXRjaGluZ0VudHJpZXMoZm9sZGVyUGF0aCwgb3B0aW9ucyk7XG4gICAgY29uc3QgcGF0aHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHsgZW50cnkgfSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBhd2FpdCBnZXRKb2luZWRQYXRoKGZvbGRlclBhdGgsIGVudHJ5KTtcbiAgICAgICAgcGF0aHMucHVzaChwYXRoKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhdGhzO1xufVxuXG4vKipcbiAqIExvYWRzIGEgdGV4dCBmaWxlIGZyb20gdGhlIGdpdmVuIG1vdW50ZWQgZmlsZSBwYXRoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlUGF0aFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRUZXh0RmlsZShmaWxlUGF0aCkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZmlsZVBhdGgpO1xuICAgIGlmICghcmVzcG9uc2Uub2spXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGxvYWQgZmlsZSAke2ZpbGVQYXRofSwgJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgaGV4YWRlY2ltYWwgc3RyaW5nIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGZudjFhIGhhc2ggb2YgYW4gaW5wdXQgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbnYxYShzdHIpIHtcbiAgICBsZXQgaGFzaCA9IDB4ODExYzlkYzU7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaGFzaCBePSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgaGFzaCA9IChoYXNoICogMHgwMTAwMDE5MykgPj4+IDA7XG4gICAgfVxuICAgIHJldHVybiAoaGFzaCA+Pj4gMCkudG9TdHJpbmcoMTYpO1xufVxuXG4vKipcbiAqIExvYWRzIGFuIGltYWdlIGZpbGUgZnJvbSBhIGZpbGUgcGF0aCBhbmQgcmV0dXJucyBhIGJsb2IgY29udGFpbmluZyBpdC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZVBhdGggLSBwYXRoIHRvIHRoZSBpbWFnZSBmaWxlIHRvIGxvYWRcbiAqIEByZXR1cm5zIHtQcm9taXNlPEJsb2I+fSAtIHRoZSBpbWFnZSBmaWxlIGFzIGEgYmxvYlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZEltYWdlRmlsZShmaWxlUGF0aCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZWFkQmluYXJ5RmlsZShmaWxlUGF0aCk7XG4gICAgY29uc3QgdHlwZSA9IGRldGVybWluZUltYWdlVHlwZShkYXRhKTtcbiAgICByZXR1cm4gbmV3IEJsb2IoW2RhdGFdLCB7IHR5cGUgfSk7XG59XG4iLCAid2luZG93LmFjdGlvbnMgfHw9IG5ldyBNYXAoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyQWN0aW9uKGlkLCBhY3Rpb24pIHtcbiAgICBpZiAod2luZG93LmFjdGlvbnMuaGFzKGlkKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBY3Rpb24gJHtpZH0gYWxyZWFkeSByZWdpc3RlcmVkLmApO1xuICAgIHdpbmRvdy5hY3Rpb25zLnNldChpZCwgYWN0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGVBY3Rpb24oaWQsIC4uLmFyZ3MpIHtcbiAgICBjb25zdCBhY3Rpb24gPSB3aW5kb3cuYWN0aW9ucy5nZXQoaWQpO1xuICAgIGlmICghYWN0aW9uKSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIGFjdGlvbjogJyArIGlkKTtcbiAgICByZXR1cm4gYWN0aW9uKC4uLmFyZ3MpO1xufVxuIiwgImV4cG9ydCBjb25zdCBzaG93ID0gZWwgPT4gKGVsLnN0eWxlLmRpc3BsYXkgPSAnJyk7XG5leHBvcnQgY29uc3QgaGlkZSA9IGVsID0+IChlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZURpc3BsYXkoc2hvdywgZWxlbWVudCwgb3RoZXJFbGVtZW50KSB7XG4gICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gc2hvdyA/ICcnIDogJ25vbmUnO1xuICAgIGlmICghb3RoZXJFbGVtZW50KSByZXR1cm47XG4gICAgb3RoZXJFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBzaG93ID8gJ25vbmUnIDogJyc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbWl0KGVsZW1lbnQsIG5hbWUsIGRldGFpbCA9IHt9KSB7XG4gICAgY29uc3QgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQobmFtZSwge1xuICAgICAgICBkZXRhaWwsXG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgICBjYW5jZWxhYmxlOiBmYWxzZVxuICAgIH0pO1xuICAgIHJldHVybiBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXNjKHN0cikge1xuICAgIHJldHVybiBTdHJpbmcoc3RyID8/ICcnKS5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVIVE1MKHN0cikge1xuICAgIHJldHVybiBzdHJcbiAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpO1xufVxuXG5mdW5jdGlvbiBpbWFnZUxvYWRlZE9yRXJyb3IoaW1nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICBpbWcub25sb2FkID0gcmVzb2x2ZTtcbiAgICAgICAgaW1nLm9uZXJyb3IgPSByZXNvbHZlO1xuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd2FpdEZvckltYWdlcyhub2RlKSB7XG4gICAgY29uc3QgaW1hZ2VzID0gWy4uLm5vZGUucXVlcnlTZWxlY3RvckFsbCgnaW1nJyldO1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoaW1hZ2VzLm1hcChpbWcgPT4ge1xuICAgICAgICByZXR1cm4gaW1nLmNvbXBsZXRlXG4gICAgICAgICAgICA/IGltZy5kZWNvZGUoKS5jYXRjaCgoKSA9PiB7fSlcbiAgICAgICAgICAgIDogaW1hZ2VMb2FkZWRPckVycm9yKGltZyk7XG4gICAgfSkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbGF5b3V0U2V0dGxlZChyb290LCB7XG4gICAgc2V0dGxlRnJhbWVzID0gNCxcbiAgICBtYXhXYWl0TXMgPSAyMDAwLFxufSA9IHt9KSB7XG4gICAgbGV0IGxhc3RNdXRhdGlvbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgIGxhc3RNdXRhdGlvbiA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIH0pO1xuXG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShyb290LCB7XG4gICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgY2hhcmFjdGVyRGF0YTogdHJ1ZSxcbiAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICB9KTtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBpZiAocGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydCA+IG1heFdhaXRNcykgYnJlYWs7XG5cbiAgICAgICAgICAgIGxldCBzdGFibGUgPSB0cnVlO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZXR0bGVGcmFtZXM7IGkrKykge1xuICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlcXVlc3RBbmltYXRpb25GcmFtZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbXV0YXRlZFJlY2VudGx5ID0gcGVyZm9ybWFuY2Uubm93KCkgLSBsYXN0TXV0YXRpb24gPCA1MDtcbiAgICAgICAgICAgICAgICBpZiAoIW11dGF0ZWRSZWNlbnRseSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgc3RhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdGFibGUpIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdhaXRGb3JTdGFibGVMYXlvdXQobm9kZSkge1xuICAgIGF3YWl0IGRvY3VtZW50LmZvbnRzLnJlYWR5O1xuICAgIGF3YWl0IHdhaXRGb3JJbWFnZXMobm9kZSk7XG4gICAgYXdhaXQgbGF5b3V0U2V0dGxlZChub2RlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRTY3JpcHQoc3JjKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgIHNjcmlwdC5zcmMgPSBzcmM7XG4gICAgICAgIHNjcmlwdC5vbmxvYWQgPSByZXNvbHZlO1xuICAgICAgICBzY3JpcHQub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoYEZhaWxlZCB0byBsb2FkIEphc21pbmUgc2NyaXB0OiAke3NyY31gKSk7XG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRTdHlsZShocmVmKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgICAgICAgbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XG4gICAgICAgIGxpbmsuaHJlZiA9IGhyZWY7XG4gICAgICAgIGxpbmsub25sb2FkID0gcmVzb2x2ZTtcbiAgICAgICAgbGluay5vbmVycm9yID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcignRmFpbGVkIHRvIGxvYWQgSmFzbWluZSBDU1MnKSk7XG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgfSk7XG59XG4iLCAiaW1wb3J0IHsgZXNjIH0gZnJvbSAnLi4vaHRtbFV0aWxzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpZWxkSW50ZXJhY3RvciB7XHJcbiAgICBjb25zdHJ1Y3RvcihmaWVsZElkLCBmYWNlS2V5KSB7XHJcbiAgICAgICAgdGhpcy5maWVsZElkID0gZmllbGRJZDtcclxuICAgICAgICB0aGlzLmZhY2VLZXkgPSBmYWNlS2V5O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybnMge0Zvcm1GaWVsZH1cclxuICAgICAqL1xyXG4gICAgZ2V0IGZvcm1GaWVsZCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2Zvcm1GaWVsZD8ucGFyZW50RWxlbWVudClcclxuICAgICAgICAgICAgdGhpcy5fZm9ybUZpZWxkID0gbnVsbDtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZm9ybUZpZWxkIHx8PSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICBgY20tZmFjZS1mb3JtW2RhdGEtZmFjZS1pZD1cIiR7ZXNjKHRoaXMuZmFjZUtleSl9XCJdIGBcclxuICAgICAgICAgICAgKyBgZm9ybS1maWVsZFtmaWVsZC1pZD1cIiR7ZXNjKHRoaXMuZmllbGRJZCl9XCJdYFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGV4aXN0cygpIHtcclxuICAgICAgICByZXR1cm4gQm9vbGVhbih0aGlzLmZvcm1GaWVsZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJucyB7RmllbGRDb21wb25lbnR9XHJcbiAgICAgKi9cclxuICAgIGdldCBmaWVsZEVsZW1lbnQoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmZvcm1GaWVsZD8uZmllbGRFbGVtZW50KVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZpZWxkICR7dGhpcy5maWVsZElkfSBub3QgZm91bmQuYCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9ybUZpZWxkLmZpZWxkRWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgdGhpcy5maWVsZEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICdjbS1maWVsZC1jaGFuZ2VkJyxcclxuICAgICAgICAgICAgICAgIHJlc29sdmUsXHJcbiAgICAgICAgICAgICAgICB7IG9uY2U6IHRydWUgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB0aGlzLmZpZWxkRWxlbWVudC5pbnB1dFZhbHVlKHZhbHVlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgdmFsdWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmllbGRFbGVtZW50LnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyKCkge1xyXG4gICAgICAgIHRoaXMuZmllbGRFbGVtZW50LmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5mb3JtRmllbGQpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmllbGQgJHt0aGlzLmZpZWxkSWR9IGRvZXMgbm90IGV4aXN0LmApO1xyXG4gICAgICAgIHRoaXMuZm9ybUZpZWxkLnRvZ2dsZVNob3coZmFsc2UpO1xyXG4gICAgfVxyXG59XHJcbiIsICJpbXBvcnQgeyBleGVjdXRlQWN0aW9uIH0gZnJvbSAnLi4vLi4vdWkvc3lzdGVtcy9hY3Rpb25TeXN0ZW0uanMnO1xyXG5pbXBvcnQgRmllbGRJbnRlcmFjdG9yIGZyb20gJy4vRmllbGRJbnRlcmFjdG9yLmpzJztcclxuaW1wb3J0IHsgZ2V0Sm9pbmVkUGF0aCwgcm1yZiB9IGZyb20gJy4uL25ldXRyYWxpbm9BZGFwdGVyLmpzJztcclxuXHJcbi8qKlxyXG4gKiBXYWl0cyB1bnRpbCB0aGUgcHJvdmlkZWQgYXN5bmNocm9ub3VzIGNvbmRpdGlvbiBiZWNvbWVzIHRydWUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7KCkgPT4gYW55fSBwcmVkaWNhdGUgQ29uZGl0aW9uIHRvIGV2YWx1YXRlLlxyXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIFBvbGxpbmcgb3B0aW9ucy5cclxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWVvdXQ9MjAwMF0gTWF4aW11bSB0aW1lIHRvIHdhaXQsIGluIG1pbGxpc2Vjb25kcy5cclxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmludGVydmFsPTUwXSBEZWxheSBiZXR3ZWVuIGF0dGVtcHRzLCBpbiBtaWxsaXNlY29uZHMuXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XHJcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgY29uZGl0aW9uIGRvZXMgbm90IGJlY29tZSB0cnVlIGJlZm9yZSB0aGUgdGltZW91dC5cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBldmVudHVhbGx5KHByZWRpY2F0ZSwge1xyXG4gICAgdGltZW91dCA9IDIwMDAsXHJcbiAgICBpbnRlcnZhbCA9IDUwLFxyXG59ID0ge30pIHtcclxuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcclxuICAgIHdoaWxlIChEYXRlLm5vdygpIC0gc3RhcnQgPCB0aW1lb3V0KSB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcHJlZGljYXRlKCk7XHJcbiAgICAgICAgaWYgKHJlc3VsdCkgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgc2V0VGltZW91dChyZXNvbHZlLCBpbnRlcnZhbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwcmVkaWNhdGUoKTtcclxuICAgIGlmIChyZXN1bHQpIHJldHVybiByZXN1bHQ7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENvbmRpdGlvbiBub3QgbWV0IHdpdGhpbiAke3RpbWVvdXR9bXNgKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciB0d28gZmlsZXMgY29udGFpbiBpZGVudGljYWwgYmluYXJ5IGNvbnRlbnRzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlyc3RQYXRoXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWNvbmRQYXRoXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbGVzQXJlRXF1YWwoZmlyc3RQYXRoLCBzZWNvbmRQYXRoKSB7XHJcbiAgICAvLyBUT0RPXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXRzIG11bHRpcGxlIGZpZWxkcyBvbiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGNhcmQgdGhyb3VnaCB0aGUgY2FyZCBmb3JtIFVJLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1JlY29yZDxzdHJpbmcsICo+fSBmaWVsZHNcclxuICogQHBhcmFtIHtzdHJpbmd9IGZhY2VLZXlcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRDYXJkRmllbGRzKGZpZWxkcywgZmFjZUtleSA9ICdmcm9udCcpIHtcclxuICAgIGNvbnN0IGNoYW5nZXMgPSBPYmplY3QuZW50cmllcyhmaWVsZHMpLm1hcCgoW2ZpZWxkLCB2YWx1ZV0pID0+IHtcclxuICAgICAgICBjb25zdCBpbnRlcmFjdG9yID0gbmV3IEZpZWxkSW50ZXJhY3RvcihmaWVsZCwgZmFjZUtleSk7XHJcbiAgICAgICAgcmV0dXJuIGludGVyYWN0b3Iuc2V0VmFsdWUodmFsdWUpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoY2hhbmdlcyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgY2FyZCB0aHJvdWdoIHRoZSBub3JtYWwgYXBwbGljYXRpb24gd29ya2Zsb3cuXHJcbiAqXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPENhcmRNYWdpY2lhbkNhcmQ+fVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUNhcmQoKSB7XHJcbiAgICBhd2FpdCBleGVjdXRlQWN0aW9uKCdhZGQtY2FyZCcpO1xyXG4gICAgcmV0dXJuIHNlbGVjdGVkUHJvamVjdENhcmQ7XHJcbn1cclxuXHJcbmxldCB0ZXN0SW5kZXggPSAwO1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgcHJvamVjdCBhbmQgc2V0cyBpdHMgZmlsZVBhdGggdG8gLi90ZW1wX3Rlc3RfcHJvamVjdC90ZXN0LmNtcHJvai5cclxuICpcclxuICogQHJldHVybnMge1Byb21pc2U8Q2FyZE1hZ2ljaWFuUHJvamVjdD59XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlVGVzdFByb2plY3QoKSB7XHJcbiAgICBjb25zdCB0ZXN0UHJvamVjdERpciA9IGF3YWl0IGdldEpvaW5lZFBhdGgoTkxfREFUQVBBVEgsIGB0ZXN0LSR7dGVzdEluZGV4Kyt9YCk7XHJcbiAgICBjb25zdCBwcm9qZWN0RmlsZVBhdGggPSBhd2FpdCBnZXRKb2luZWRQYXRoKHRlc3RQcm9qZWN0RGlyLCAndGVzdC5jbXByb2onKTtcclxuICAgIHRyeSB7IGF3YWl0IHJtcmYodGVzdFByb2plY3REaXIpOyB9IGNhdGNoIHt9XHJcbiAgICBleGVjdXRlQWN0aW9uKCduZXctcHJvamVjdCcpO1xyXG4gICAgYXdhaXQgYWN0aXZlUHJvamVjdC5zZXRGaWxlUGF0aChwcm9qZWN0RmlsZVBhdGgpO1xyXG4gICAgcmV0dXJuIGFjdGl2ZVByb2plY3Q7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWxldGVzIGEgcHJvamVjdCBpZiBpdCBpcyBzYXZlZCBhdCBhIGZpbGVwYXRoIHRoYXQgZW5kcyB3aXRoIFwidGVzdC5jbXByb2pcIi5cclxuICpcclxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlVGVzdFByb2plY3QoKSB7XHJcbiAgICBpZiAoIWFjdGl2ZVByb2plY3QuZmlsZVBhdGguZW5kc1dpdGgoJ3Rlc3QuY21wcm9qJykpXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcm9qZWN0IGZpbGUgaXMgbm90IHRlc3QuY21wcm9qPyBFc2NhcGluZy4nKTtcclxuICAgIHRyeSB7IGF3YWl0IHJtcmYoYWN0aXZlUHJvamVjdC5mb2xkZXJQYXRoKTsgfSBjYXRjaCB7fVxyXG59XHJcblxyXG5mdW5jdGlvbiBub3JtYWxpemVJbWFnZShpbWFnZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB3aWR0aDogaW1hZ2Uud2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiBpbWFnZS5oZWlnaHQsXHJcbiAgICAgICAgY3JvcFdpZHRoOiBpbWFnZS5jcm9wLndpZHRoLFxyXG4gICAgICAgIGNyb3BIZWlnaHQ6IGltYWdlLmNyb3AuaGVpZ2h0LFxyXG4gICAgICAgIHhPZmZzZXQ6IGltYWdlLmNyb3AueE9mZnNldCxcclxuICAgICAgICB5T2Zmc2V0OiBpbWFnZS5jcm9wLnlPZmZzZXQsXHJcbiAgICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBub3JtYWxpemVDYXJkRGF0YSh2YWx1ZSkge1xyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKVxyXG4gICAgICAgIHJldHVybiB2YWx1ZS5tYXAobm9ybWFsaXplQ2FyZERhdGEpO1xyXG4gICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpXHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yPy5uYW1lID09PSAnTWFuYUNvc3QnKVxyXG4gICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xyXG4gICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yPy5uYW1lID09PSAnSW1hZ2VGaWVsZFZhbHVlJylcclxuICAgICAgICByZXR1cm4gbm9ybWFsaXplSW1hZ2UodmFsdWUpO1xyXG5cclxuICAgIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXHJcbiAgICAgICAgT2JqZWN0LmVudHJpZXModmFsdWUpLm1hcCgoW2tleSwgaXRlbV0pID0+IFtcclxuICAgICAgICAgICAga2V5LFxyXG4gICAgICAgICAgICBub3JtYWxpemVDYXJkRGF0YShpdGVtKSxcclxuICAgICAgICBdKVxyXG4gICAgKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGV4cGVjdENhcmREYXRhKGFjdHVhbCwgZXhwZWN0ZWQpIHtcclxuICAgIGV4cGVjdChub3JtYWxpemVDYXJkRGF0YShhY3R1YWwpKS50b0VxdWFsKFxyXG4gICAgICAgIGphc21pbmUub2JqZWN0Q29udGFpbmluZyhleHBlY3RlZClcclxuICAgICk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0b2dnbGVGYWNlKGZhY2UpIHtcclxuICAgIGNvbnN0IGNhcmRGb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY20tY2FyZC1mb3JtJyk7XHJcbiAgICBhd2FpdCBjYXJkRm9ybS50b2dnbGVGYWNlKGZhY2UpO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmx1c2hDYXJkKCkge1xyXG4gICAgY29uc3QgY2FyZEZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdjbS1jYXJkLWZvcm0nKTtcclxuICAgIGF3YWl0IGNhcmRGb3JtLnNhdmUuZmx1c2goKTtcclxufVxyXG4iLCAiLyoqXG4gKiBBYnN0cmFjdCBiYXNlIGNsYXNzIGZvciBhbGwgdHlwZSBhZGFwdGVycyB1c2VkIGJ5IFNlcmlhbGl6ZXIuXG4gKiBBZGFwdGVycyBjb252ZXJ0IGJldHdlZW4gcnVudGltZSB2YWx1ZXMgYW5kIGludGVybWVkaWF0ZSByZXByZXNlbnRhdGlvbiBub2Rlcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VyaWFsaXplckFkYXB0ZXIge1xuICAgIC8qKlxuICAgICAqIFVuaXF1ZSB0eXBlIGlkZW50aWZpZXIgc3RvcmVkIGluIHRoZSBpbnRlcm1lZGlhdGUgcmVwcmVzZW50YXRpb24uXG4gICAgICogU3ViY2xhc3NlcyBtdXN0IG92ZXJyaWRlIHRoaXMgdmFsdWUuXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBub2RlVHlwZSA9ICdCYXNlQWRhcHRlcic7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmUgd2hldGhlciB0aGlzIGFkYXB0ZXIgY2FuIGVuY29kZSB0aGUgZ2l2ZW4gdmFsdWUuXG4gICAgICpcbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWUgLSBUaGUgcnVudGltZSB2YWx1ZSB0byBpbnNwZWN0LlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoaXMgYWRhcHRlciBzaG91bGQgZW5jb2RlIHRoZSB2YWx1ZS5cbiAgICAgKi9cbiAgICBjYW5FbmNvZGUodmFsdWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjYW5FbmNvZGUoKSBtdXN0IGJlIGltcGxlbWVudGVkIGJ5IHN1YmNsYXNzJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBhZGFwdGVyIGNhbiBkZWNvZGUgdGhlIGdpdmVuIG5vZGUuXG4gICAgICpcbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKiBAcGFyYW0ge2FueX0gbm9kZSAtIFRoZSBpbnRlcm1lZGlhdGUgbm9kZSB0byBpbnNwZWN0LlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoaXMgYWRhcHRlciBzaG91bGQgZW5jb2RlIHRoZSB2YWx1ZS5cbiAgICAgKi9cbiAgICBjYW5EZWNvZGUobm9kZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhbkRlY29kZSgpIG11c3QgYmUgaW1wbGVtZW50ZWQgYnkgc3ViY2xhc3MnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmNvZGUgYSBydW50aW1lIHZhbHVlIGludG8gYW4gaW50ZXJtZWRpYXRlIHJlcHJlc2VudGF0aW9uIG5vZGUuXG4gICAgICpcbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWUgLSBUaGUgdmFsdWUgdG8gZW5jb2RlLlxuICAgICAqIEBwYXJhbSB7U2VyaWFsaXplcn0gc2VyaWFsaXplciAtIFRoZSBzZXJpYWxpemVyIGluc3RhbmNlLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPG9iamVjdD59IFRoZSBlbmNvZGVkIGludGVybWVkaWF0ZSBub2RlLlxuICAgICAqL1xuICAgIGFzeW5jIGVuY29kZSh2YWx1ZSwgc2VyaWFsaXplcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2VuY29kZSgpIG11c3QgYmUgaW1wbGVtZW50ZWQgYnkgc3ViY2xhc3MnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWNvZGUgYW4gaW50ZXJtZWRpYXRlIHJlcHJlc2VudGF0aW9uIG5vZGUgYmFjayBpbnRvIGEgcnVudGltZSB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBhYnN0cmFjdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBub2RlIC0gVGhlIGVuY29kZWQgbm9kZS5cbiAgICAgKiBAcGFyYW0ge1NlcmlhbGl6ZXJ9IHNlcmlhbGl6ZXIgLSBUaGUgc2VyaWFsaXplciBpbnN0YW5jZS5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSBUaGUgZGVjb2RlZCBydW50aW1lIHZhbHVlLlxuICAgICAqL1xuICAgIGFzeW5jIGRlY29kZShub2RlLCBzZXJpYWxpemVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZGVjb2RlKCkgbXVzdCBiZSBpbXBsZW1lbnRlZCBieSBzdWJjbGFzcycpO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgU2VyaWFsaXplckFkYXB0ZXIgZnJvbSAnLi9TZXJpYWxpemVyQWRhcHRlci5qcyc7XHJcblxyXG4vKipcclxuICogQWRhcHRlciBmb3IgZW5jb2RpbmcvZGVjb2Rpbmcgb2JqZWN0IFVSTHMgYXMgcmF3IGJpbmFyeSBkYXRhLlxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFuYUNvc3RBZGFwdGVyIGV4dGVuZHMgU2VyaWFsaXplckFkYXB0ZXIge1xyXG4gICAgbm9kZVR5cGUgPSAnTWFuYUNvc3QnO1xyXG5cclxuICAgIGNhbkVuY29kZSh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5uYW1lID09PSAnTWFuYUNvc3QnO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbkRlY29kZShub2RlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5vZGUuX190eXBlID09PSB0aGlzLm5vZGVUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRW5jb2RlIGEgbWFuYSBjb3N0IGludG8gYW4gb2JqZWN0XHJcbiAgICAgKiBAcGFyYW0ge01hbmFDb3N0fSBtYW5hQ29zdFxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8b2JqZWN0Pn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgZW5jb2RlKG1hbmFDb3N0KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgX190eXBlOiB0aGlzLm5vZGVUeXBlLFxyXG4gICAgICAgICAgICBzeW1ib2xzOiBtYW5hQ29zdC50b1N0cmluZygpXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlY29kZSBhbiBvYmplY3QgaW50byBhIG1hbmEgY29zdC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbm9kZVxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8TWFuYUNvc3Q+fSBBIG5ldyBtYW5hIGNvc3QuXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGRlY29kZShub2RlKSB7XHJcbiAgICAgICAgY29uc3QgeyBNYW5hQ29zdCB9ID0gYWN0aXZlR2FtZS5NYW5hU2NyaWJlO1xyXG4gICAgICAgIHJldHVybiBNYW5hQ29zdC5wYXJzZShub2RlLnN5bWJvbHMpO1xyXG4gICAgfVxyXG59XHJcbiIsICJleHBvcnQgZGVmYXVsdCBjbGFzcyBJbWFnZUNyb3Age1xyXG4gICAgY29uc3RydWN0b3Iod2lkdGggPSAwLCBoZWlnaHQgPSAwLCB4T2Zmc2V0ID0gMCwgeU9mZnNldCA9IDApIHtcclxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgdGhpcy54T2Zmc2V0ID0geE9mZnNldDtcclxuICAgICAgICB0aGlzLnlPZmZzZXQgPSB5T2Zmc2V0O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBsb2FkKGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gbmV3IHRoaXMoXHJcbiAgICAgICAgICAgIGRhdGEuY3JvcFdpZHRoIHx8IGRhdGEud2lkdGggfHwgMSxcclxuICAgICAgICAgICAgZGF0YS5jcm9wSGVpZ2h0IHx8IGRhdGEuaGVpZ2h0IHx8IDEsXHJcbiAgICAgICAgICAgIGRhdGEueE9mZnNldCB8fCAwLFxyXG4gICAgICAgICAgICBkYXRhLnlPZmZzZXQgfHwgMFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xhbXAoc291cmNlV2lkdGgsIHNvdXJjZUhlaWdodCwgaXNNb3ZlKSB7XHJcbiAgICAgICAgY29uc3QgbWF4T2Zmc2V0WCA9IHNvdXJjZVdpZHRoIC0gKGlzTW92ZSA/IHRoaXMud2lkdGggOiAxKTtcclxuICAgICAgICBjb25zdCBtYXhPZmZzZXRZID0gc291cmNlSGVpZ2h0IC0gKGlzTW92ZSA/IHRoaXMuaGVpZ2h0IDogMSk7XHJcbiAgICAgICAgdGhpcy54T2Zmc2V0ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4odGhpcy54T2Zmc2V0LCBtYXhPZmZzZXRYKSk7XHJcbiAgICAgICAgdGhpcy55T2Zmc2V0ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4odGhpcy55T2Zmc2V0LCBtYXhPZmZzZXRZKSk7XHJcbiAgICAgICAgY29uc3QgbWF4V2lkdGggPSBzb3VyY2VXaWR0aCAtIHRoaXMueE9mZnNldDtcclxuICAgICAgICBjb25zdCBtYXhIZWlnaHQgPSBzb3VyY2VIZWlnaHQgLSB0aGlzLnlPZmZzZXQ7XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IE1hdGgubWluKE1hdGgubWF4KHRoaXMud2lkdGgsIDEpLCBtYXhXaWR0aCk7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBNYXRoLm1pbihNYXRoLm1heCh0aGlzLmhlaWdodCwgMSksIG1heEhlaWdodCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2F2ZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjcm9wV2lkdGg6IHRoaXMud2lkdGgsXHJcbiAgICAgICAgICAgIGNyb3BIZWlnaHQ6IHRoaXMuaGVpZ2h0LFxyXG4gICAgICAgICAgICB4T2Zmc2V0OiB0aGlzLnhPZmZzZXQsXHJcbiAgICAgICAgICAgIHlPZmZzZXQ6IHRoaXMueU9mZnNldFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgY2xvbmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKFxyXG4gICAgICAgICAgICB0aGlzLndpZHRoLFxyXG4gICAgICAgICAgICB0aGlzLmhlaWdodCxcclxuICAgICAgICAgICAgdGhpcy54T2Zmc2V0LFxyXG4gICAgICAgICAgICB0aGlzLnlPZmZzZXRcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcbiIsICJsZXQgYWN0aXZlQ29udGV4dCA9IG51bGw7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xlYXIoY29udGV4dCkge1xyXG4gICAgY29uc3QgeyB0cmFja2VkVXJscyB9ID0gY29udGV4dDtcclxuICAgIGNvbnN0IHVybHNUb1Jldm9rZSA9IHRyYWNrZWRVcmxzLnNsaWNlKCk7XHJcbiAgICB0cmFja2VkVXJscy5zcGxpY2UoMCwgdHJhY2tlZFVybHMubGVuZ3RoKTtcclxuICAgIGZvciAoY29uc3QgdXJsIG9mIHVybHNUb1Jldm9rZSlcclxuICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3aXRoTmV3Q29udGV4dChjYWxsYmFjaykge1xyXG4gICAgY29uc3QgcHJldkNvbnRleHQgPSBhY3RpdmVDb250ZXh0O1xyXG4gICAgYWN0aXZlQ29udGV4dCA9IHsgdHJhY2tlZFVybHM6IFtdIH07XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IGNhbGxiYWNrKCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNsZWFyKGFjdGl2ZUNvbnRleHQpO1xyXG4gICAgICAgIGFjdGl2ZUNvbnRleHQgPSBwcmV2Q29udGV4dDtcclxuICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVVSTChibG9iKSB7XHJcbiAgICBpZiAoIWFjdGl2ZUNvbnRleHQpIHRocm93IG5ldyBFcnJvcignTm8gYWN0aXZlIGNvbnRleHQnKTtcclxuICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XHJcbiAgICBhY3RpdmVDb250ZXh0LnRyYWNrZWRVcmxzLnB1c2godXJsKTtcclxuICAgIHJldHVybiB1cmw7XHJcbn1cclxuIiwgImltcG9ydCB7IGdldEltYWdlU2l6ZSB9IGZyb20gJy4uLy4uL3NoYXJlZC9pbWFnZVV0aWxzLmpzJztcbmltcG9ydCBJbWFnZUNyb3AgZnJvbSAnLi9JbWFnZUNyb3AuanMnO1xuaW1wb3J0IHsgY3JlYXRlVVJMIH0gZnJvbSAnLi4vLi4vdWkvc3lzdGVtcy9vYmplY3RVcmxTeXN0ZW0uanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbWFnZUZpZWxkVmFsdWUge1xuICAgIGNvbnN0cnVjdG9yKGltYWdlVXJsID0gbnVsbCwgd2lkdGggPSAwLCBoZWlnaHQgPSAwLCBjcm9wKSB7XG4gICAgICAgIHRoaXMuaW1hZ2VVcmwgPSBpbWFnZVVybDtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5jcm9wID0gY3JvcCB8fCBuZXcgSW1hZ2VDcm9wKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIGZyb21GaWxlKGZpbGUpIHtcbiAgICAgICAgY29uc3QgaW1hZ2VVcmwgPSBjcmVhdGVVUkwoZmlsZSk7XG4gICAgICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gYXdhaXQgZ2V0SW1hZ2VTaXplKGltYWdlVXJsKTtcbiAgICAgICAgY29uc3QgY3JvcCA9IG5ldyBJbWFnZUNyb3Aod2lkdGgsIGhlaWdodCk7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gbmV3IHRoaXMoaW1hZ2VVcmwsIHdpZHRoLCBoZWlnaHQsIGNyb3ApO1xuICAgICAgICB2YWx1ZS5kaXJ0eSA9IHRydWU7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgbG9hZChkYXRhKSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcyhcbiAgICAgICAgICAgIGRhdGEuaW1hZ2VVcmwsXG4gICAgICAgICAgICBkYXRhLndpZHRoIHx8IDAsXG4gICAgICAgICAgICBkYXRhLmhlaWdodCB8fCAwLFxuICAgICAgICAgICAgSW1hZ2VDcm9wLmxvYWQoZGF0YSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBhc3luYyBsb2FkSW1hZ2VEYXRhKCkge1xuICAgICAgICBpZiAoIXRoaXMuaW1hZ2VVcmwpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gKGF3YWl0IGZldGNoKHRoaXMuaW1hZ2VVcmwpKS5hcnJheUJ1ZmZlcigpO1xuXG4gICAgfVxuXG4gICAgYXN5bmMgc2F2ZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIC4uLnRoaXMuY3JvcC5zYXZlKClcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgY2xvbmUgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VVcmwsXG4gICAgICAgICAgICB0aGlzLndpZHRoLFxuICAgICAgICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICB0aGlzLmNyb3AuY2xvbmUoKVxuICAgICAgICApO1xuICAgICAgICBjbG9uZS5zY2FsZSA9IHRoaXMuc2NhbGU7XG4gICAgICAgIHJldHVybiBjbG9uZTtcbiAgICB9XG5cbiAgICBhcHBseUNvb3JkaW5hdGVTcGFjZSh0YXJnZXRXaWR0aCwgdGFyZ2V0SGVpZ2h0KSB7XG4gICAgICAgIHRoaXMuc2NhbGUgPSAxLjA7XG4gICAgICAgIGlmICh0YXJnZXRXaWR0aCA8IHRoaXMud2lkdGgpXG4gICAgICAgICAgICB0aGlzLnNjYWxlID0gdGhpcy53aWR0aCAvIHRhcmdldFdpZHRoO1xuICAgICAgICBpZiAodGFyZ2V0SGVpZ2h0IDwgdGhpcy5oZWlnaHQpXG4gICAgICAgICAgICB0aGlzLnNjYWxlID0gTWF0aC5tYXgodGhpcy5zY2FsZSwgdGhpcy5oZWlnaHQgLyB0YXJnZXRIZWlnaHQpO1xuICAgICAgICB0aGlzLndpZHRoID0gTWF0aC5yb3VuZCh0aGlzLndpZHRoICogMTAgLyB0aGlzLnNjYWxlKSAvIDEwO1xuICAgICAgICB0aGlzLmhlaWdodCA9IE1hdGgucm91bmQodGhpcy5oZWlnaHQgKiAxMCAvIHRoaXMuc2NhbGUpIC8gMTA7XG4gICAgICAgIHRoaXMuY3JvcC53aWR0aCA9IE1hdGgucm91bmQodGhpcy5jcm9wLndpZHRoICogMTAgLyB0aGlzLnNjYWxlKSAvIDEwO1xuICAgICAgICB0aGlzLmNyb3AuaGVpZ2h0ID0gTWF0aC5yb3VuZCh0aGlzLmNyb3AuaGVpZ2h0ICogMTAgLyB0aGlzLnNjYWxlKSAvIDEwO1xuICAgICAgICB0aGlzLmNyb3AueE9mZnNldCA9IE1hdGgucm91bmQodGhpcy5jcm9wLnhPZmZzZXQgKiAxMCAvIHRoaXMuc2NhbGUpIC8gMTA7XG4gICAgICAgIHRoaXMuY3JvcC55T2Zmc2V0ID0gTWF0aC5yb3VuZCh0aGlzLmNyb3AueU9mZnNldCAqIDEwIC8gdGhpcy5zY2FsZSkgLyAxMDtcbiAgICB9XG5cbiAgICByZW1vdmVDb29yZGluYXRlU3BhY2UoKSB7XG4gICAgICAgIGlmICghdGhpcy5zY2FsZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLndpZHRoID0gTWF0aC5yb3VuZCh0aGlzLndpZHRoICogdGhpcy5zY2FsZSk7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gTWF0aC5yb3VuZCh0aGlzLmhlaWdodCAqIHRoaXMuc2NhbGUpO1xuICAgICAgICB0aGlzLmNyb3Aud2lkdGggPSBNYXRoLnJvdW5kKHRoaXMuY3JvcC53aWR0aCAqIHRoaXMuc2NhbGUpO1xuICAgICAgICB0aGlzLmNyb3AuaGVpZ2h0ID0gTWF0aC5yb3VuZCh0aGlzLmNyb3AuaGVpZ2h0ICogdGhpcy5zY2FsZSk7XG4gICAgICAgIHRoaXMuY3JvcC54T2Zmc2V0ID0gTWF0aC5yb3VuZCh0aGlzLmNyb3AueE9mZnNldCAqIHRoaXMuc2NhbGUpO1xuICAgICAgICB0aGlzLmNyb3AueU9mZnNldCA9IE1hdGgucm91bmQodGhpcy5jcm9wLnlPZmZzZXQgKiB0aGlzLnNjYWxlKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc2NhbGU7XG4gICAgfVxufVxuIiwgImltcG9ydCBTZXJpYWxpemVyQWRhcHRlciBmcm9tICcuL1NlcmlhbGl6ZXJBZGFwdGVyLmpzJztcclxuaW1wb3J0IEltYWdlRmllbGRWYWx1ZSBmcm9tICcuLi8uLi9jYXJkL0ltYWdlRmllbGRWYWx1ZS5qcyc7XHJcblxyXG4vKipcclxuICogQWRhcHRlciBmb3IgZW5jb2RpbmcvZGVjb2RpbmcgaW1hZ2UgZmllbGQgdmFsdWVzLlxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW1hZ2VGaWVsZEFkYXB0ZXIgZXh0ZW5kcyBTZXJpYWxpemVyQWRhcHRlciB7XHJcbiAgICBub2RlVHlwZSA9ICdpbWFnZSc7XHJcblxyXG4gICAgY2FuRGVjb2RlKG5vZGUpIHtcclxuICAgICAgICByZXR1cm4gbm9kZS5fX3R5cGUgPT09IHRoaXMubm9kZVR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgY2FuRW5jb2RlKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgSW1hZ2VGaWVsZFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRW5jb2RlIGFuIEltYWdlRmllbGRWYWx1ZSBpbnRvIGFuIG9iamVjdC5cclxuICAgICAqIEBwYXJhbSB7SW1hZ2VGaWVsZFZhbHVlfSB2YWx1ZVxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8b2JqZWN0Pn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgZW5jb2RlKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgX190eXBlOiB0aGlzLm5vZGVUeXBlLFxyXG4gICAgICAgICAgICAuLi5hd2FpdCB2YWx1ZS5zYXZlKClcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVjb2RlIGFuIG9iamVjdCBpbnRvIGFuIEltYWdlRmllbGRWYWx1ZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbm9kZVxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8SW1hZ2VGaWVsZFZhbHVlPn0gQSBuZXcgSW1hZ2VGaWVsZFZhbHVlLlxyXG4gICAgICovXHJcbiAgICBhc3luYyBkZWNvZGUobm9kZSkge1xyXG4gICAgICAgIHJldHVybiBJbWFnZUZpZWxkVmFsdWUubG9hZChub2RlKTtcclxuICAgIH1cclxufVxyXG4iLCAiaW1wb3J0IFNlcmlhbGl6ZXJBZGFwdGVyIGZyb20gJy4vU2VyaWFsaXplckFkYXB0ZXIuanMnO1xuaW1wb3J0IHsgY3JlYXRlVVJMIH0gZnJvbSAnLi4vLi4vLi4vdWkvc3lzdGVtcy9vYmplY3RVcmxTeXN0ZW0uanMnO1xuXG4vKipcbiAqIEFkYXB0ZXIgZm9yIGVuY29kaW5nL2RlY29kaW5nIG9iamVjdCBVUkxzIGFzIHJhdyBiaW5hcnkgZGF0YS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2JqZWN0VXJsQmluYXJ5QWRhcHRlciBleHRlbmRzIFNlcmlhbGl6ZXJBZGFwdGVyIHtcbiAgICBub2RlVHlwZSA9ICdPYmplY3RVUkwnO1xuXG4gICAgY2FuRW5jb2RlKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnXG4gICAgICAgICAgICAmJiB2YWx1ZS5zdGFydHNXaXRoKCdibG9iOicpO1xuICAgIH1cblxuICAgIGNhbkRlY29kZShub2RlKSB7XG4gICAgICAgIHJldHVybiBub2RlLl9fdHlwZSA9PT0gdGhpcy5ub2RlVHlwZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmNvZGUgYSBibG9iOiBVUkwgaW50byByYXcgYmluYXJ5IHJlcHJlc2VudGF0aW9uLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxvYmplY3Q+fVxuICAgICAqL1xuICAgIGFzeW5jIGVuY29kZSh1cmwpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwpO1xuICAgICAgICBjb25zdCBibG9iID0gYXdhaXQgcmVzcG9uc2UuYmxvYigpO1xuICAgICAgICBjb25zdCBidWZmZXIgPSBhd2FpdCBibG9iLmFycmF5QnVmZmVyKCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIF9fdHlwZTogdGhpcy5ub2RlVHlwZSxcbiAgICAgICAgICAgIG1pbWU6IGJsb2IudHlwZSxcbiAgICAgICAgICAgIGJpbmFyeTogYnVmZmVyXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVjb2RlIHJhdyBiaW5hcnkgaW50byBhIGJsb2I6IFVSTC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fHN0cmluZ30gbm9kZVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IEEgbmV3IGJsb2I6IFVSTFxuICAgICAqL1xuICAgIGFzeW5jIGRlY29kZShub2RlKSB7XG4gICAgICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobm9kZS5iaW5hcnkpO1xuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2J5dGVzXSwgeyB0eXBlOiBub2RlLm1pbWUgfSk7XG4gICAgICAgIHJldHVybiBjcmVhdGVVUkwoYmxvYik7XG4gICAgfVxufVxuIiwgImltcG9ydCBNYW5hQ29zdEFkYXB0ZXIgZnJvbSAnLi9NYW5hQ29zdEFkYXB0ZXIuanMnO1xuaW1wb3J0IEltYWdlRmllbGRBZGFwdGVyIGZyb20gJy4vSW1hZ2VGaWVsZEFkYXB0ZXIuanMnO1xuaW1wb3J0IE9iamVjdFVybEJpbmFyeUFkYXB0ZXIgZnJvbSAnLi9PYmplY3RVcmxCaW5hcnlBZGFwdGVyLmpzJztcblxuY29uc3QgYWRhcHRlcnMgPSBuZXcgU2V0KCk7XG5jb25zdCBiaW5hcnlBZGFwdGVycyA9IG5ldyBTZXQoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyQWRhcHRlcihBZGFwdGVyKSB7XG4gICAgYWRhcHRlcnMuYWRkKG5ldyBBZGFwdGVyKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJCaW5hcnlBZGFwdGVyKEFkYXB0ZXIpIHtcbiAgICBiaW5hcnlBZGFwdGVycy5hZGQobmV3IEFkYXB0ZXIoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBZGFwdGVycygpIHtcbiAgICByZXR1cm4gWy4uLmFkYXB0ZXJzXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJpbmFyeUFkYXB0ZXJzKCkge1xuICAgIHJldHVybiBbLi4uYmluYXJ5QWRhcHRlcnNdO1xufVxuXG5yZWdpc3RlckFkYXB0ZXIoSW1hZ2VGaWVsZEFkYXB0ZXIpO1xucmVnaXN0ZXJBZGFwdGVyKE1hbmFDb3N0QWRhcHRlcik7XG5yZWdpc3RlckJpbmFyeUFkYXB0ZXIoT2JqZWN0VXJsQmluYXJ5QWRhcHRlcik7XG4iLCAiaW1wb3J0IHsgZ2V0QWRhcHRlcnMgfSBmcm9tICcuLi9hZGFwdGVycy9hZGFwdGVyUmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgcmVhZEZpbGUsIHdyaXRlRmlsZSB9IGZyb20gJy4uLy4uLy4uL3NoYXJlZC9uZXV0cmFsaW5vQWRhcHRlci5qcyc7XG5cbi8qKlxuICogQWJzdHJhY3QgYmFzZSBjbGFzcyBmb3Igc2VyaWFsaXplcnMgdGhhdCB1c2UgdHlwZSBhZGFwdGVycyB0byB0cmFuc2Zvcm1cbiAqIGFuIGFyYml0cmFyeSBvYmplY3QgZ3JhcGggaW50byBhbiBpbnRlcm1lZGlhdGUgcmVwcmVzZW50YXRpb24sIGFuZCB0aGVuXG4gKiBpbnRvIGEgZmluYWwgZW5jb2RlZCBmb3JtYXQgKEpTT04sIGJpbmFyeSwgZXRjLikuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcmlhbGl6ZXIge1xuICAgIHN0YXRpYyBtYXRjaGVzKGZpbGVQYXRoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgc2F2ZShmaWxlUGF0aCwgZGF0YSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IHNlcmlhbGl6ZXIgPSBuZXcgdGhpcygpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUoZGF0YSwgb3B0aW9ucyk7XG4gICAgICAgIGF3YWl0IHdyaXRlRmlsZShmaWxlUGF0aCwgdGV4dCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIGxvYWQoZmlsZVBhdGgpIHtcbiAgICAgICAgY29uc3Qgc2VyaWFsaXplciA9IG5ldyB0aGlzKCk7XG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCByZWFkRmlsZShmaWxlUGF0aCk7XG4gICAgICAgIHJldHVybiBzZXJpYWxpemVyLmRlc2VyaWFsaXplKHRleHQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7QXJyYXk8U2VyaWFsaXplckFkYXB0ZXI+fSBbYWRhcHRlcnM9bnVsbF1cbiAgICAgKiAgIExpc3Qgb2Ygc2VyaWFsaXphdGlvbiBhZGFwdGVycy5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihhZGFwdGVycyA9IG51bGwpIHtcbiAgICAgICAgLyoqIEB0eXBlIHtBcnJheTxTZXJpYWxpemVyQWRhcHRlcj59ICovXG4gICAgICAgIHRoaXMuYWRhcHRlcnMgPSBhZGFwdGVycyB8fCBnZXRBZGFwdGVycygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuY29kZSB0aGUgaW50ZXJtZWRpYXRlIHJlcHJlc2VudGF0aW9uIGludG8gdGhlIGZpbmFsIHNlcmlhbGl6ZWQgZm9ybS5cbiAgICAgKiBTdWJjbGFzc2VzIG11c3QgaW1wbGVtZW50IHRoaXMuXG4gICAgICpcbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWUgLSBUaGUgaW50ZXJtZWRpYXRlIHJlcHJlc2VudGF0aW9uLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gICAgICovXG4gICAgYXN5bmMgZW5jb2RlKHZhbHVlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVjb2RlIGEgc2VyaWFsaXplZCBwYXlsb2FkIGludG8gdGhlIGludGVybWVkaWF0ZSByZXByZXNlbnRhdGlvbi5cbiAgICAgKiBTdWJjbGFzc2VzIG11c3QgaW1wbGVtZW50IHRoaXMuXG4gICAgICpcbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWUgLSBUaGUgZW5jb2RlZCBwYXlsb2FkLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gICAgICovXG4gICAgYXN5bmMgZGVjb2RlKHZhbHVlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VyaWFsaXplIGFuIG9iamVjdCBieSBjb252ZXJ0aW5nIGl0IHRocm91Z2ggaW50ZXJtZWRpYXRlIHJlcHJlc2VudGF0aW9uXG4gICAgICogYW5kIHRoZW4gdGhyb3VnaCB0aGUgc3BlY2lmaWMgZm9ybWF0IGVuY29kZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWUgLSBUaGUgb2JqZWN0IHRvIHNlcmlhbGl6ZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IFRoZSBzZXJpYWxpemVkIHBheWxvYWQuXG4gICAgICovXG4gICAgYXN5bmMgc2VyaWFsaXplKHZhbHVlLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgY29uc3QgaW50ZXJtZWRpYXRlID0gYXdhaXQgdGhpcy5lbmNvZGVOb2RlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5jb2RlKGludGVybWVkaWF0ZSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVzZXJpYWxpemUgYSBwYXlsb2FkIGJ5IGRlY29kaW5nIHRoZSBmb3JtYXQgYW5kIHRoZW4gcmVjb25zdHJ1Y3RpbmdcbiAgICAgKiB0aGUgb2JqZWN0IGdyYXBoIHVzaW5nIGFkYXB0ZXJzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHthbnl9IHZhbHVlIC0gU2VyaWFsaXplZCBwYXlsb2FkLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IFRoZSBmdWxseSByZWNvbnN0cnVjdGVkIHZhbHVlLlxuICAgICAqL1xuICAgIGFzeW5jIGRlc2VyaWFsaXplKHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IGludGVybWVkaWF0ZSA9IGF3YWl0IHRoaXMuZGVjb2RlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlTm9kZShpbnRlcm1lZGlhdGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuY29kZSBhIHBsYWluIG9iamVjdCAobm9uLWFycmF5LCBub24tc3BlY2lhbC10eXBlKS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPG9iamVjdD59XG4gICAgICovXG4gICAgYXN5bmMgZW5jb2RlT2JqZWN0KHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IG91dCA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyh2YWx1ZSkpXG4gICAgICAgICAgICBvdXRba10gPSBhd2FpdCB0aGlzLmVuY29kZU5vZGUodik7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5jb2RlIGFuIGFyYml0cmFyeSB2YWx1ZSBieSBkZXRlY3RpbmcgYWRhcHRlcnMgb3IgZmFsbGluZyBiYWNrIHRvXG4gICAgICogb2JqZWN0L2FycmF5IHJlY3Vyc2lvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gICAgICovXG4gICAgYXN5bmMgZW5jb2RlTm9kZSh2YWx1ZSkge1xuICAgICAgICBmb3IgKGNvbnN0IGFkYXB0ZXIgb2YgdGhpcy5hZGFwdGVycykge1xuICAgICAgICAgICAgaWYgKGFkYXB0ZXIuY2FuRW5jb2RlKHZhbHVlKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRhcHRlci5lbmNvZGUodmFsdWUsIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHZhbHVlLm1hcCh2ID0+IHRoaXMuZW5jb2RlTm9kZSh2KSkpO1xuXG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5jb2RlT2JqZWN0KHZhbHVlKTtcblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVjb2RlIGEgcGxhaW4gb2JqZWN0IChub24tYXJyYXksIG5vbi1hZGFwdGVkIG5vZGUpLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG5vZGVcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxvYmplY3Q+fVxuICAgICAqL1xuICAgIGFzeW5jIGRlY29kZU9iamVjdChub2RlKSB7XG4gICAgICAgIGNvbnN0IG91dCA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhub2RlKSlcbiAgICAgICAgICAgIG91dFtrXSA9IGF3YWl0IHRoaXMuZGVjb2RlTm9kZSh2KTtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWNvZGUgYW4gYXJiaXRyYXJ5IG5vZGUgYnkgdXNpbmcgYWRhcHRlcnMgb3IgcmVjdXJzaXZlbHkgZGVzY2VuZGluZ1xuICAgICAqIGludG8gYXJyYXlzIGFuZCBvYmplY3RzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHthbnl9IG5vZGVcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICAgICAqL1xuICAgIGFzeW5jIGRlY29kZU5vZGUobm9kZSkge1xuICAgICAgICBpZiAoIW5vZGUpIHJldHVybiBub2RlO1xuICAgICAgICBjb25zdCBhZGFwdGVyID0gdGhpcy5hZGFwdGVycy5maW5kKGEgPT4gYS5jYW5EZWNvZGUobm9kZSkpO1xuICAgICAgICBpZiAoYWRhcHRlcikgcmV0dXJuIGFkYXB0ZXIuZGVjb2RlKG5vZGUsIHRoaXMpO1xuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG5vZGUpKVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKG5vZGUubWFwKG4gPT4gdGhpcy5kZWNvZGVOb2RlKG4pKSk7XG5cbiAgICAgICAgaWYgKG5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlT2JqZWN0KG5vZGUpO1xuXG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbn1cbiIsICJleHBvcnQgeyBDb21wb3NlciB9IGZyb20gJy4vY29tcG9zZS9jb21wb3Nlci5qcyc7XG5leHBvcnQgeyBEb2N1bWVudCB9IGZyb20gJy4vZG9jL0RvY3VtZW50LmpzJztcbmV4cG9ydCB7IFNjaGVtYSB9IGZyb20gJy4vc2NoZW1hL1NjaGVtYS5qcyc7XG5leHBvcnQgeyBZQU1MRXJyb3IsIFlBTUxQYXJzZUVycm9yLCBZQU1MV2FybmluZyB9IGZyb20gJy4vZXJyb3JzLmpzJztcbmV4cG9ydCB7IEFsaWFzIH0gZnJvbSAnLi9ub2Rlcy9BbGlhcy5qcyc7XG5leHBvcnQgeyBpc0FsaWFzLCBpc0NvbGxlY3Rpb24sIGlzRG9jdW1lbnQsIGlzTWFwLCBpc05vZGUsIGlzUGFpciwgaXNTY2FsYXIsIGlzU2VxIH0gZnJvbSAnLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5leHBvcnQgeyBQYWlyIH0gZnJvbSAnLi9ub2Rlcy9QYWlyLmpzJztcbmV4cG9ydCB7IFNjYWxhciB9IGZyb20gJy4vbm9kZXMvU2NhbGFyLmpzJztcbmV4cG9ydCB7IFlBTUxNYXAgfSBmcm9tICcuL25vZGVzL1lBTUxNYXAuanMnO1xuZXhwb3J0IHsgWUFNTFNlcSB9IGZyb20gJy4vbm9kZXMvWUFNTFNlcS5qcyc7XG5pbXBvcnQgKiBhcyBjc3QgZnJvbSAnLi9wYXJzZS9jc3QuanMnO1xuZXhwb3J0IHsgY3N0IGFzIENTVCB9O1xuZXhwb3J0IHsgTGV4ZXIgfSBmcm9tICcuL3BhcnNlL2xleGVyLmpzJztcbmV4cG9ydCB7IExpbmVDb3VudGVyIH0gZnJvbSAnLi9wYXJzZS9saW5lLWNvdW50ZXIuanMnO1xuZXhwb3J0IHsgUGFyc2VyIH0gZnJvbSAnLi9wYXJzZS9wYXJzZXIuanMnO1xuZXhwb3J0IHsgcGFyc2UsIHBhcnNlQWxsRG9jdW1lbnRzLCBwYXJzZURvY3VtZW50LCBzdHJpbmdpZnkgfSBmcm9tICcuL3B1YmxpYy1hcGkuanMnO1xuZXhwb3J0IHsgdmlzaXQsIHZpc2l0QXN5bmMgfSBmcm9tICcuL3Zpc2l0LmpzJztcbiIsICJjb25zdCBBTElBUyA9IFN5bWJvbC5mb3IoJ3lhbWwuYWxpYXMnKTtcbmNvbnN0IERPQyA9IFN5bWJvbC5mb3IoJ3lhbWwuZG9jdW1lbnQnKTtcbmNvbnN0IE1BUCA9IFN5bWJvbC5mb3IoJ3lhbWwubWFwJyk7XG5jb25zdCBQQUlSID0gU3ltYm9sLmZvcigneWFtbC5wYWlyJyk7XG5jb25zdCBTQ0FMQVIgPSBTeW1ib2wuZm9yKCd5YW1sLnNjYWxhcicpO1xuY29uc3QgU0VRID0gU3ltYm9sLmZvcigneWFtbC5zZXEnKTtcbmNvbnN0IE5PREVfVFlQRSA9IFN5bWJvbC5mb3IoJ3lhbWwubm9kZS50eXBlJyk7XG5jb25zdCBpc0FsaWFzID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBBTElBUztcbmNvbnN0IGlzRG9jdW1lbnQgPSAobm9kZSkgPT4gISFub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJiBub2RlW05PREVfVFlQRV0gPT09IERPQztcbmNvbnN0IGlzTWFwID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBNQVA7XG5jb25zdCBpc1BhaXIgPSAobm9kZSkgPT4gISFub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJiBub2RlW05PREVfVFlQRV0gPT09IFBBSVI7XG5jb25zdCBpc1NjYWxhciA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gU0NBTEFSO1xuY29uc3QgaXNTZXEgPSAobm9kZSkgPT4gISFub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJiBub2RlW05PREVfVFlQRV0gPT09IFNFUTtcbmZ1bmN0aW9uIGlzQ29sbGVjdGlvbihub2RlKSB7XG4gICAgaWYgKG5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnKVxuICAgICAgICBzd2l0Y2ggKG5vZGVbTk9ERV9UWVBFXSkge1xuICAgICAgICAgICAgY2FzZSBNQVA6XG4gICAgICAgICAgICBjYXNlIFNFUTpcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIGlzTm9kZShub2RlKSB7XG4gICAgaWYgKG5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnKVxuICAgICAgICBzd2l0Y2ggKG5vZGVbTk9ERV9UWVBFXSkge1xuICAgICAgICAgICAgY2FzZSBBTElBUzpcbiAgICAgICAgICAgIGNhc2UgTUFQOlxuICAgICAgICAgICAgY2FzZSBTQ0FMQVI6XG4gICAgICAgICAgICBjYXNlIFNFUTpcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmNvbnN0IGhhc0FuY2hvciA9IChub2RlKSA9PiAoaXNTY2FsYXIobm9kZSkgfHwgaXNDb2xsZWN0aW9uKG5vZGUpKSAmJiAhIW5vZGUuYW5jaG9yO1xuXG5leHBvcnQgeyBBTElBUywgRE9DLCBNQVAsIE5PREVfVFlQRSwgUEFJUiwgU0NBTEFSLCBTRVEsIGhhc0FuY2hvciwgaXNBbGlhcywgaXNDb2xsZWN0aW9uLCBpc0RvY3VtZW50LCBpc01hcCwgaXNOb2RlLCBpc1BhaXIsIGlzU2NhbGFyLCBpc1NlcSB9O1xuIiwgImltcG9ydCB7IGlzRG9jdW1lbnQsIGlzTm9kZSwgaXNQYWlyLCBpc0NvbGxlY3Rpb24sIGlzTWFwLCBpc1NlcSwgaXNTY2FsYXIsIGlzQWxpYXMgfSBmcm9tICcuL25vZGVzL2lkZW50aXR5LmpzJztcblxuY29uc3QgQlJFQUsgPSBTeW1ib2woJ2JyZWFrIHZpc2l0Jyk7XG5jb25zdCBTS0lQID0gU3ltYm9sKCdza2lwIGNoaWxkcmVuJyk7XG5jb25zdCBSRU1PVkUgPSBTeW1ib2woJ3JlbW92ZSBub2RlJyk7XG4vKipcbiAqIEFwcGx5IGEgdmlzaXRvciB0byBhbiBBU1Qgbm9kZSBvciBkb2N1bWVudC5cbiAqXG4gKiBXYWxrcyB0aHJvdWdoIHRoZSB0cmVlIChkZXB0aC1maXJzdCkgc3RhcnRpbmcgZnJvbSBgbm9kZWAsIGNhbGxpbmcgYVxuICogYHZpc2l0b3JgIGZ1bmN0aW9uIHdpdGggdGhyZWUgYXJndW1lbnRzOlxuICogICAtIGBrZXlgOiBGb3Igc2VxdWVuY2UgdmFsdWVzIGFuZCBtYXAgYFBhaXJgLCB0aGUgbm9kZSdzIGluZGV4IGluIHRoZVxuICogICAgIGNvbGxlY3Rpb24uIFdpdGhpbiBhIGBQYWlyYCwgYCdrZXknYCBvciBgJ3ZhbHVlJ2AsIGNvcnJlc3BvbmRpbmdseS5cbiAqICAgICBgbnVsbGAgZm9yIHRoZSByb290IG5vZGUuXG4gKiAgIC0gYG5vZGVgOiBUaGUgY3VycmVudCBub2RlLlxuICogICAtIGBwYXRoYDogVGhlIGFuY2VzdHJ5IG9mIHRoZSBjdXJyZW50IG5vZGUuXG4gKlxuICogVGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgdmlzaXRvciBtYXkgYmUgdXNlZCB0byBjb250cm9sIHRoZSB0cmF2ZXJzYWw6XG4gKiAgIC0gYHVuZGVmaW5lZGAgKGRlZmF1bHQpOiBEbyBub3RoaW5nIGFuZCBjb250aW51ZVxuICogICAtIGB2aXNpdC5TS0lQYDogRG8gbm90IHZpc2l0IHRoZSBjaGlsZHJlbiBvZiB0aGlzIG5vZGUsIGNvbnRpbnVlIHdpdGggbmV4dFxuICogICAgIHNpYmxpbmdcbiAqICAgLSBgdmlzaXQuQlJFQUtgOiBUZXJtaW5hdGUgdHJhdmVyc2FsIGNvbXBsZXRlbHlcbiAqICAgLSBgdmlzaXQuUkVNT1ZFYDogUmVtb3ZlIHRoZSBjdXJyZW50IG5vZGUsIHRoZW4gY29udGludWUgd2l0aCB0aGUgbmV4dCBvbmVcbiAqICAgLSBgTm9kZWA6IFJlcGxhY2UgdGhlIGN1cnJlbnQgbm9kZSwgdGhlbiBjb250aW51ZSBieSB2aXNpdGluZyBpdFxuICogICAtIGBudW1iZXJgOiBXaGlsZSBpdGVyYXRpbmcgdGhlIGl0ZW1zIG9mIGEgc2VxdWVuY2Ugb3IgbWFwLCBzZXQgdGhlIGluZGV4XG4gKiAgICAgb2YgdGhlIG5leHQgc3RlcC4gVGhpcyBpcyB1c2VmdWwgZXNwZWNpYWxseSBpZiB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnRcbiAqICAgICBub2RlIGhhcyBjaGFuZ2VkLlxuICpcbiAqIElmIGB2aXNpdG9yYCBpcyBhIHNpbmdsZSBmdW5jdGlvbiwgaXQgd2lsbCBiZSBjYWxsZWQgd2l0aCBhbGwgdmFsdWVzXG4gKiBlbmNvdW50ZXJlZCBpbiB0aGUgdHJlZSwgaW5jbHVkaW5nIGUuZy4gYG51bGxgIHZhbHVlcy4gQWx0ZXJuYXRpdmVseSxcbiAqIHNlcGFyYXRlIHZpc2l0b3IgZnVuY3Rpb25zIG1heSBiZSBkZWZpbmVkIGZvciBlYWNoIGBNYXBgLCBgUGFpcmAsIGBTZXFgLFxuICogYEFsaWFzYCBhbmQgYFNjYWxhcmAgbm9kZS4gVG8gZGVmaW5lIHRoZSBzYW1lIHZpc2l0b3IgZnVuY3Rpb24gZm9yIG1vcmUgdGhhblxuICogb25lIG5vZGUgdHlwZSwgdXNlIHRoZSBgQ29sbGVjdGlvbmAgKG1hcCBhbmQgc2VxKSwgYFZhbHVlYCAobWFwLCBzZXEgJiBzY2FsYXIpXG4gKiBhbmQgYE5vZGVgIChhbGlhcywgbWFwLCBzZXEgJiBzY2FsYXIpIHRhcmdldHMuIE9mIGFsbCB0aGVzZSwgb25seSB0aGUgbW9zdFxuICogc3BlY2lmaWMgZGVmaW5lZCBvbmUgd2lsbCBiZSB1c2VkIGZvciBlYWNoIG5vZGUuXG4gKi9cbmZ1bmN0aW9uIHZpc2l0KG5vZGUsIHZpc2l0b3IpIHtcbiAgICBjb25zdCB2aXNpdG9yXyA9IGluaXRWaXNpdG9yKHZpc2l0b3IpO1xuICAgIGlmIChpc0RvY3VtZW50KG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IGNkID0gdmlzaXRfKG51bGwsIG5vZGUuY29udGVudHMsIHZpc2l0b3JfLCBPYmplY3QuZnJlZXplKFtub2RlXSkpO1xuICAgICAgICBpZiAoY2QgPT09IFJFTU9WRSlcbiAgICAgICAgICAgIG5vZGUuY29udGVudHMgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIHZpc2l0XyhudWxsLCBub2RlLCB2aXNpdG9yXywgT2JqZWN0LmZyZWV6ZShbXSkpO1xufVxuLy8gV2l0aG91dCB0aGUgYGFzIHN5bWJvbGAgY2FzdHMsIFRTIGRlY2xhcmVzIHRoZXNlIGluIHRoZSBgdmlzaXRgXG4vLyBuYW1lc3BhY2UgdXNpbmcgYHZhcmAsIGJ1dCB0aGVuIGNvbXBsYWlucyBhYm91dCB0aGF0IGJlY2F1c2Vcbi8vIGB1bmlxdWUgc3ltYm9sYCBtdXN0IGJlIGBjb25zdGAuXG4vKiogVGVybWluYXRlIHZpc2l0IHRyYXZlcnNhbCBjb21wbGV0ZWx5ICovXG52aXNpdC5CUkVBSyA9IEJSRUFLO1xuLyoqIERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhlIGN1cnJlbnQgbm9kZSAqL1xudmlzaXQuU0tJUCA9IFNLSVA7XG4vKiogUmVtb3ZlIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0LlJFTU9WRSA9IFJFTU9WRTtcbmZ1bmN0aW9uIHZpc2l0XyhrZXksIG5vZGUsIHZpc2l0b3IsIHBhdGgpIHtcbiAgICBjb25zdCBjdHJsID0gY2FsbFZpc2l0b3Ioa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKTtcbiAgICBpZiAoaXNOb2RlKGN0cmwpIHx8IGlzUGFpcihjdHJsKSkge1xuICAgICAgICByZXBsYWNlTm9kZShrZXksIHBhdGgsIGN0cmwpO1xuICAgICAgICByZXR1cm4gdmlzaXRfKGtleSwgY3RybCwgdmlzaXRvciwgcGF0aCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY3RybCAhPT0gJ3N5bWJvbCcpIHtcbiAgICAgICAgaWYgKGlzQ29sbGVjdGlvbihub2RlKSkge1xuICAgICAgICAgICAgcGF0aCA9IE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQobm9kZSkpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2kgPSB2aXNpdF8oaSwgbm9kZS5pdGVtc1tpXSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjaSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgICAgIGkgPSBjaSAtIDE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2kgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2kgPT09IFJFTU9WRSkge1xuICAgICAgICAgICAgICAgICAgICBub2RlLml0ZW1zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1BhaXIobm9kZSkpIHtcbiAgICAgICAgICAgIHBhdGggPSBPYmplY3QuZnJlZXplKHBhdGguY29uY2F0KG5vZGUpKTtcbiAgICAgICAgICAgIGNvbnN0IGNrID0gdmlzaXRfKCdrZXknLCBub2RlLmtleSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICBpZiAoY2sgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgIGVsc2UgaWYgKGNrID09PSBSRU1PVkUpXG4gICAgICAgICAgICAgICAgbm9kZS5rZXkgPSBudWxsO1xuICAgICAgICAgICAgY29uc3QgY3YgPSB2aXNpdF8oJ3ZhbHVlJywgbm9kZS52YWx1ZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICBpZiAoY3YgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgIGVsc2UgaWYgKGN2ID09PSBSRU1PVkUpXG4gICAgICAgICAgICAgICAgbm9kZS52YWx1ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGN0cmw7XG59XG4vKipcbiAqIEFwcGx5IGFuIGFzeW5jIHZpc2l0b3IgdG8gYW4gQVNUIG5vZGUgb3IgZG9jdW1lbnQuXG4gKlxuICogV2Fsa3MgdGhyb3VnaCB0aGUgdHJlZSAoZGVwdGgtZmlyc3QpIHN0YXJ0aW5nIGZyb20gYG5vZGVgLCBjYWxsaW5nIGFcbiAqIGB2aXNpdG9yYCBmdW5jdGlvbiB3aXRoIHRocmVlIGFyZ3VtZW50czpcbiAqICAgLSBga2V5YDogRm9yIHNlcXVlbmNlIHZhbHVlcyBhbmQgbWFwIGBQYWlyYCwgdGhlIG5vZGUncyBpbmRleCBpbiB0aGVcbiAqICAgICBjb2xsZWN0aW9uLiBXaXRoaW4gYSBgUGFpcmAsIGAna2V5J2Agb3IgYCd2YWx1ZSdgLCBjb3JyZXNwb25kaW5nbHkuXG4gKiAgICAgYG51bGxgIGZvciB0aGUgcm9vdCBub2RlLlxuICogICAtIGBub2RlYDogVGhlIGN1cnJlbnQgbm9kZS5cbiAqICAgLSBgcGF0aGA6IFRoZSBhbmNlc3RyeSBvZiB0aGUgY3VycmVudCBub2RlLlxuICpcbiAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHZpc2l0b3IgbWF5IGJlIHVzZWQgdG8gY29udHJvbCB0aGUgdHJhdmVyc2FsOlxuICogICAtIGBQcm9taXNlYDogTXVzdCByZXNvbHZlIHRvIG9uZSBvZiB0aGUgZm9sbG93aW5nIHZhbHVlc1xuICogICAtIGB1bmRlZmluZWRgIChkZWZhdWx0KTogRG8gbm90aGluZyBhbmQgY29udGludWVcbiAqICAgLSBgdmlzaXQuU0tJUGA6IERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhpcyBub2RlLCBjb250aW51ZSB3aXRoIG5leHRcbiAqICAgICBzaWJsaW5nXG4gKiAgIC0gYHZpc2l0LkJSRUFLYDogVGVybWluYXRlIHRyYXZlcnNhbCBjb21wbGV0ZWx5XG4gKiAgIC0gYHZpc2l0LlJFTU9WRWA6IFJlbW92ZSB0aGUgY3VycmVudCBub2RlLCB0aGVuIGNvbnRpbnVlIHdpdGggdGhlIG5leHQgb25lXG4gKiAgIC0gYE5vZGVgOiBSZXBsYWNlIHRoZSBjdXJyZW50IG5vZGUsIHRoZW4gY29udGludWUgYnkgdmlzaXRpbmcgaXRcbiAqICAgLSBgbnVtYmVyYDogV2hpbGUgaXRlcmF0aW5nIHRoZSBpdGVtcyBvZiBhIHNlcXVlbmNlIG9yIG1hcCwgc2V0IHRoZSBpbmRleFxuICogICAgIG9mIHRoZSBuZXh0IHN0ZXAuIFRoaXMgaXMgdXNlZnVsIGVzcGVjaWFsbHkgaWYgdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50XG4gKiAgICAgbm9kZSBoYXMgY2hhbmdlZC5cbiAqXG4gKiBJZiBgdmlzaXRvcmAgaXMgYSBzaW5nbGUgZnVuY3Rpb24sIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggYWxsIHZhbHVlc1xuICogZW5jb3VudGVyZWQgaW4gdGhlIHRyZWUsIGluY2x1ZGluZyBlLmcuIGBudWxsYCB2YWx1ZXMuIEFsdGVybmF0aXZlbHksXG4gKiBzZXBhcmF0ZSB2aXNpdG9yIGZ1bmN0aW9ucyBtYXkgYmUgZGVmaW5lZCBmb3IgZWFjaCBgTWFwYCwgYFBhaXJgLCBgU2VxYCxcbiAqIGBBbGlhc2AgYW5kIGBTY2FsYXJgIG5vZGUuIFRvIGRlZmluZSB0aGUgc2FtZSB2aXNpdG9yIGZ1bmN0aW9uIGZvciBtb3JlIHRoYW5cbiAqIG9uZSBub2RlIHR5cGUsIHVzZSB0aGUgYENvbGxlY3Rpb25gIChtYXAgYW5kIHNlcSksIGBWYWx1ZWAgKG1hcCwgc2VxICYgc2NhbGFyKVxuICogYW5kIGBOb2RlYCAoYWxpYXMsIG1hcCwgc2VxICYgc2NhbGFyKSB0YXJnZXRzLiBPZiBhbGwgdGhlc2UsIG9ubHkgdGhlIG1vc3RcbiAqIHNwZWNpZmljIGRlZmluZWQgb25lIHdpbGwgYmUgdXNlZCBmb3IgZWFjaCBub2RlLlxuICovXG5hc3luYyBmdW5jdGlvbiB2aXNpdEFzeW5jKG5vZGUsIHZpc2l0b3IpIHtcbiAgICBjb25zdCB2aXNpdG9yXyA9IGluaXRWaXNpdG9yKHZpc2l0b3IpO1xuICAgIGlmIChpc0RvY3VtZW50KG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IGNkID0gYXdhaXQgdmlzaXRBc3luY18obnVsbCwgbm9kZS5jb250ZW50cywgdmlzaXRvcl8sIE9iamVjdC5mcmVlemUoW25vZGVdKSk7XG4gICAgICAgIGlmIChjZCA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgbm9kZS5jb250ZW50cyA9IG51bGw7XG4gICAgfVxuICAgIGVsc2VcbiAgICAgICAgYXdhaXQgdmlzaXRBc3luY18obnVsbCwgbm9kZSwgdmlzaXRvcl8sIE9iamVjdC5mcmVlemUoW10pKTtcbn1cbi8vIFdpdGhvdXQgdGhlIGBhcyBzeW1ib2xgIGNhc3RzLCBUUyBkZWNsYXJlcyB0aGVzZSBpbiB0aGUgYHZpc2l0YFxuLy8gbmFtZXNwYWNlIHVzaW5nIGB2YXJgLCBidXQgdGhlbiBjb21wbGFpbnMgYWJvdXQgdGhhdCBiZWNhdXNlXG4vLyBgdW5pcXVlIHN5bWJvbGAgbXVzdCBiZSBgY29uc3RgLlxuLyoqIFRlcm1pbmF0ZSB2aXNpdCB0cmF2ZXJzYWwgY29tcGxldGVseSAqL1xudmlzaXRBc3luYy5CUkVBSyA9IEJSRUFLO1xuLyoqIERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhlIGN1cnJlbnQgbm9kZSAqL1xudmlzaXRBc3luYy5TS0lQID0gU0tJUDtcbi8qKiBSZW1vdmUgdGhlIGN1cnJlbnQgbm9kZSAqL1xudmlzaXRBc3luYy5SRU1PVkUgPSBSRU1PVkU7XG5hc3luYyBmdW5jdGlvbiB2aXNpdEFzeW5jXyhrZXksIG5vZGUsIHZpc2l0b3IsIHBhdGgpIHtcbiAgICBjb25zdCBjdHJsID0gYXdhaXQgY2FsbFZpc2l0b3Ioa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKTtcbiAgICBpZiAoaXNOb2RlKGN0cmwpIHx8IGlzUGFpcihjdHJsKSkge1xuICAgICAgICByZXBsYWNlTm9kZShrZXksIHBhdGgsIGN0cmwpO1xuICAgICAgICByZXR1cm4gdmlzaXRBc3luY18oa2V5LCBjdHJsLCB2aXNpdG9yLCBwYXRoKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjdHJsICE9PSAnc3ltYm9sJykge1xuICAgICAgICBpZiAoaXNDb2xsZWN0aW9uKG5vZGUpKSB7XG4gICAgICAgICAgICBwYXRoID0gT2JqZWN0LmZyZWV6ZShwYXRoLmNvbmNhdChub2RlKSk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaSA9IGF3YWl0IHZpc2l0QXN5bmNfKGksIG5vZGUuaXRlbXNbaV0sIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2kgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgICAgICBpID0gY2kgLSAxO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBSRU1PVkUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pdGVtcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNQYWlyKG5vZGUpKSB7XG4gICAgICAgICAgICBwYXRoID0gT2JqZWN0LmZyZWV6ZShwYXRoLmNvbmNhdChub2RlKSk7XG4gICAgICAgICAgICBjb25zdCBjayA9IGF3YWl0IHZpc2l0QXN5bmNfKCdrZXknLCBub2RlLmtleSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICBpZiAoY2sgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgIGVsc2UgaWYgKGNrID09PSBSRU1PVkUpXG4gICAgICAgICAgICAgICAgbm9kZS5rZXkgPSBudWxsO1xuICAgICAgICAgICAgY29uc3QgY3YgPSBhd2FpdCB2aXNpdEFzeW5jXygndmFsdWUnLCBub2RlLnZhbHVlLCB2aXNpdG9yLCBwYXRoKTtcbiAgICAgICAgICAgIGlmIChjdiA9PT0gQlJFQUspXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgZWxzZSBpZiAoY3YgPT09IFJFTU9WRSlcbiAgICAgICAgICAgICAgICBub2RlLnZhbHVlID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3RybDtcbn1cbmZ1bmN0aW9uIGluaXRWaXNpdG9yKHZpc2l0b3IpIHtcbiAgICBpZiAodHlwZW9mIHZpc2l0b3IgPT09ICdvYmplY3QnICYmXG4gICAgICAgICh2aXNpdG9yLkNvbGxlY3Rpb24gfHwgdmlzaXRvci5Ob2RlIHx8IHZpc2l0b3IuVmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIEFsaWFzOiB2aXNpdG9yLk5vZGUsXG4gICAgICAgICAgICBNYXA6IHZpc2l0b3IuTm9kZSxcbiAgICAgICAgICAgIFNjYWxhcjogdmlzaXRvci5Ob2RlLFxuICAgICAgICAgICAgU2VxOiB2aXNpdG9yLk5vZGVcbiAgICAgICAgfSwgdmlzaXRvci5WYWx1ZSAmJiB7XG4gICAgICAgICAgICBNYXA6IHZpc2l0b3IuVmFsdWUsXG4gICAgICAgICAgICBTY2FsYXI6IHZpc2l0b3IuVmFsdWUsXG4gICAgICAgICAgICBTZXE6IHZpc2l0b3IuVmFsdWVcbiAgICAgICAgfSwgdmlzaXRvci5Db2xsZWN0aW9uICYmIHtcbiAgICAgICAgICAgIE1hcDogdmlzaXRvci5Db2xsZWN0aW9uLFxuICAgICAgICAgICAgU2VxOiB2aXNpdG9yLkNvbGxlY3Rpb25cbiAgICAgICAgfSwgdmlzaXRvcik7XG4gICAgfVxuICAgIHJldHVybiB2aXNpdG9yO1xufVxuZnVuY3Rpb24gY2FsbFZpc2l0b3Ioa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKSB7XG4gICAgaWYgKHR5cGVvZiB2aXNpdG9yID09PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gdmlzaXRvcihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpc01hcChub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuTWFwPy4oa2V5LCBub2RlLCBwYXRoKTtcbiAgICBpZiAoaXNTZXEobm9kZSkpXG4gICAgICAgIHJldHVybiB2aXNpdG9yLlNlcT8uKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgaWYgKGlzUGFpcihub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuUGFpcj8uKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgaWYgKGlzU2NhbGFyKG5vZGUpKVxuICAgICAgICByZXR1cm4gdmlzaXRvci5TY2FsYXI/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpc0FsaWFzKG5vZGUpKVxuICAgICAgICByZXR1cm4gdmlzaXRvci5BbGlhcz8uKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIHJlcGxhY2VOb2RlKGtleSwgcGF0aCwgbm9kZSkge1xuICAgIGNvbnN0IHBhcmVudCA9IHBhdGhbcGF0aC5sZW5ndGggLSAxXTtcbiAgICBpZiAoaXNDb2xsZWN0aW9uKHBhcmVudCkpIHtcbiAgICAgICAgcGFyZW50Lml0ZW1zW2tleV0gPSBub2RlO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc1BhaXIocGFyZW50KSkge1xuICAgICAgICBpZiAoa2V5ID09PSAna2V5JylcbiAgICAgICAgICAgIHBhcmVudC5rZXkgPSBub2RlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwYXJlbnQudmFsdWUgPSBub2RlO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc0RvY3VtZW50KHBhcmVudCkpIHtcbiAgICAgICAgcGFyZW50LmNvbnRlbnRzID0gbm9kZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHB0ID0gaXNBbGlhcyhwYXJlbnQpID8gJ2FsaWFzJyA6ICdzY2FsYXInO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCByZXBsYWNlIG5vZGUgd2l0aCAke3B0fSBwYXJlbnRgKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IHZpc2l0LCB2aXNpdEFzeW5jIH07XG4iLCAiaW1wb3J0IHsgaXNOb2RlIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgdmlzaXQgfSBmcm9tICcuLi92aXNpdC5qcyc7XG5cbmNvbnN0IGVzY2FwZUNoYXJzID0ge1xuICAgICchJzogJyUyMScsXG4gICAgJywnOiAnJTJDJyxcbiAgICAnWyc6ICclNUInLFxuICAgICddJzogJyU1RCcsXG4gICAgJ3snOiAnJTdCJyxcbiAgICAnfSc6ICclN0QnXG59O1xuY29uc3QgZXNjYXBlVGFnTmFtZSA9ICh0bikgPT4gdG4ucmVwbGFjZSgvWyEsW1xcXXt9XS9nLCBjaCA9PiBlc2NhcGVDaGFyc1tjaF0pO1xuY2xhc3MgRGlyZWN0aXZlcyB7XG4gICAgY29uc3RydWN0b3IoeWFtbCwgdGFncykge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGRpcmVjdGl2ZXMtZW5kL2RvYy1zdGFydCBtYXJrZXIgYC0tLWAuIElmIGBudWxsYCwgYSBtYXJrZXIgbWF5IHN0aWxsIGJlXG4gICAgICAgICAqIGluY2x1ZGVkIGluIHRoZSBkb2N1bWVudCdzIHN0cmluZ2lmaWVkIHJlcHJlc2VudGF0aW9uLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kb2NTdGFydCA9IG51bGw7XG4gICAgICAgIC8qKiBUaGUgZG9jLWVuZCBtYXJrZXIgYC4uLmAuICAqL1xuICAgICAgICB0aGlzLmRvY0VuZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnlhbWwgPSBPYmplY3QuYXNzaWduKHt9LCBEaXJlY3RpdmVzLmRlZmF1bHRZYW1sLCB5YW1sKTtcbiAgICAgICAgdGhpcy50YWdzID0gT2JqZWN0LmFzc2lnbih7fSwgRGlyZWN0aXZlcy5kZWZhdWx0VGFncywgdGFncyk7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjb3B5ID0gbmV3IERpcmVjdGl2ZXModGhpcy55YW1sLCB0aGlzLnRhZ3MpO1xuICAgICAgICBjb3B5LmRvY1N0YXJ0ID0gdGhpcy5kb2NTdGFydDtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIER1cmluZyBwYXJzaW5nLCBnZXQgYSBEaXJlY3RpdmVzIGluc3RhbmNlIGZvciB0aGUgY3VycmVudCBkb2N1bWVudCBhbmRcbiAgICAgKiB1cGRhdGUgdGhlIHN0cmVhbSBzdGF0ZSBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgdmVyc2lvbidzIHNwZWMuXG4gICAgICovXG4gICAgYXREb2N1bWVudCgpIHtcbiAgICAgICAgY29uc3QgcmVzID0gbmV3IERpcmVjdGl2ZXModGhpcy55YW1sLCB0aGlzLnRhZ3MpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMueWFtbC52ZXJzaW9uKSB7XG4gICAgICAgICAgICBjYXNlICcxLjEnOlxuICAgICAgICAgICAgICAgIHRoaXMuYXROZXh0RG9jdW1lbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnMS4yJzpcbiAgICAgICAgICAgICAgICB0aGlzLmF0TmV4dERvY3VtZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy55YW1sID0ge1xuICAgICAgICAgICAgICAgICAgICBleHBsaWNpdDogRGlyZWN0aXZlcy5kZWZhdWx0WWFtbC5leHBsaWNpdCxcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogJzEuMidcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMudGFncyA9IE9iamVjdC5hc3NpZ24oe30sIERpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBvbkVycm9yIC0gTWF5IGJlIGNhbGxlZCBldmVuIGlmIHRoZSBhY3Rpb24gd2FzIHN1Y2Nlc3NmdWxcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgb24gc3VjY2Vzc1xuICAgICAqL1xuICAgIGFkZChsaW5lLCBvbkVycm9yKSB7XG4gICAgICAgIGlmICh0aGlzLmF0TmV4dERvY3VtZW50KSB7XG4gICAgICAgICAgICB0aGlzLnlhbWwgPSB7IGV4cGxpY2l0OiBEaXJlY3RpdmVzLmRlZmF1bHRZYW1sLmV4cGxpY2l0LCB2ZXJzaW9uOiAnMS4xJyB9O1xuICAgICAgICAgICAgdGhpcy50YWdzID0gT2JqZWN0LmFzc2lnbih7fSwgRGlyZWN0aXZlcy5kZWZhdWx0VGFncyk7XG4gICAgICAgICAgICB0aGlzLmF0TmV4dERvY3VtZW50ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFydHMgPSBsaW5lLnRyaW0oKS5zcGxpdCgvWyBcXHRdKy8pO1xuICAgICAgICBjb25zdCBuYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgICAgICBjYXNlICclVEFHJzoge1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcigwLCAnJVRBRyBkaXJlY3RpdmUgc2hvdWxkIGNvbnRhaW4gZXhhY3RseSB0d28gcGFydHMnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA8IDIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gPSBwYXJ0cztcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3NbaGFuZGxlXSA9IHByZWZpeDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJyVZQU1MJzoge1xuICAgICAgICAgICAgICAgIHRoaXMueWFtbC5leHBsaWNpdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKDAsICclWUFNTCBkaXJlY3RpdmUgc2hvdWxkIGNvbnRhaW4gZXhhY3RseSBvbmUgcGFydCcpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IFt2ZXJzaW9uXSA9IHBhcnRzO1xuICAgICAgICAgICAgICAgIGlmICh2ZXJzaW9uID09PSAnMS4xJyB8fCB2ZXJzaW9uID09PSAnMS4yJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnlhbWwudmVyc2lvbiA9IHZlcnNpb247XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNWYWxpZCA9IC9eXFxkK1xcLlxcZCskLy50ZXN0KHZlcnNpb24pO1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKDYsIGBVbnN1cHBvcnRlZCBZQU1MIHZlcnNpb24gJHt2ZXJzaW9ufWAsIGlzVmFsaWQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBvbkVycm9yKDAsIGBVbmtub3duIGRpcmVjdGl2ZSAke25hbWV9YCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlc29sdmVzIGEgdGFnLCBtYXRjaGluZyBoYW5kbGVzIHRvIHRob3NlIGRlZmluZWQgaW4gJVRBRyBkaXJlY3RpdmVzLlxuICAgICAqXG4gICAgICogQHJldHVybnMgUmVzb2x2ZWQgdGFnLCB3aGljaCBtYXkgYWxzbyBiZSB0aGUgbm9uLXNwZWNpZmljIHRhZyBgJyEnYCBvciBhXG4gICAgICogICBgJyFsb2NhbCdgIHRhZywgb3IgYG51bGxgIGlmIHVucmVzb2x2YWJsZS5cbiAgICAgKi9cbiAgICB0YWdOYW1lKHNvdXJjZSwgb25FcnJvcikge1xuICAgICAgICBpZiAoc291cmNlID09PSAnIScpXG4gICAgICAgICAgICByZXR1cm4gJyEnOyAvLyBub24tc3BlY2lmaWMgdGFnXG4gICAgICAgIGlmIChzb3VyY2VbMF0gIT09ICchJykge1xuICAgICAgICAgICAgb25FcnJvcihgTm90IGEgdmFsaWQgdGFnOiAke3NvdXJjZX1gKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzb3VyY2VbMV0gPT09ICc8Jykge1xuICAgICAgICAgICAgY29uc3QgdmVyYmF0aW0gPSBzb3VyY2Uuc2xpY2UoMiwgLTEpO1xuICAgICAgICAgICAgaWYgKHZlcmJhdGltID09PSAnIScgfHwgdmVyYmF0aW0gPT09ICchIScpIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKGBWZXJiYXRpbSB0YWdzIGFyZW4ndCByZXNvbHZlZCwgc28gJHtzb3VyY2V9IGlzIGludmFsaWQuYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc291cmNlW3NvdXJjZS5sZW5ndGggLSAxXSAhPT0gJz4nKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IoJ1ZlcmJhdGltIHRhZ3MgbXVzdCBlbmQgd2l0aCBhID4nKTtcbiAgICAgICAgICAgIHJldHVybiB2ZXJiYXRpbTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBbLCBoYW5kbGUsIHN1ZmZpeF0gPSBzb3VyY2UubWF0Y2goL14oLiohKShbXiFdKikkL3MpO1xuICAgICAgICBpZiAoIXN1ZmZpeClcbiAgICAgICAgICAgIG9uRXJyb3IoYFRoZSAke3NvdXJjZX0gdGFnIGhhcyBubyBzdWZmaXhgKTtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy50YWdzW2hhbmRsZV07XG4gICAgICAgIGlmIChwcmVmaXgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArIGRlY29kZVVSSUNvbXBvbmVudChzdWZmaXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcihTdHJpbmcoZXJyb3IpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFuZGxlID09PSAnIScpXG4gICAgICAgICAgICByZXR1cm4gc291cmNlOyAvLyBsb2NhbCB0YWdcbiAgICAgICAgb25FcnJvcihgQ291bGQgbm90IHJlc29sdmUgdGFnOiAke3NvdXJjZX1gKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgZnVsbHkgcmVzb2x2ZWQgdGFnLCByZXR1cm5zIGl0cyBwcmludGFibGUgc3RyaW5nIGZvcm0sXG4gICAgICogdGFraW5nIGludG8gYWNjb3VudCBjdXJyZW50IHRhZyBwcmVmaXhlcyBhbmQgZGVmYXVsdHMuXG4gICAgICovXG4gICAgdGFnU3RyaW5nKHRhZykge1xuICAgICAgICBmb3IgKGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gb2YgT2JqZWN0LmVudHJpZXModGhpcy50YWdzKSkge1xuICAgICAgICAgICAgaWYgKHRhZy5zdGFydHNXaXRoKHByZWZpeCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZSArIGVzY2FwZVRhZ05hbWUodGFnLnN1YnN0cmluZyhwcmVmaXgubGVuZ3RoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhZ1swXSA9PT0gJyEnID8gdGFnIDogYCE8JHt0YWd9PmA7XG4gICAgfVxuICAgIHRvU3RyaW5nKGRvYykge1xuICAgICAgICBjb25zdCBsaW5lcyA9IHRoaXMueWFtbC5leHBsaWNpdFxuICAgICAgICAgICAgPyBbYCVZQU1MICR7dGhpcy55YW1sLnZlcnNpb24gfHwgJzEuMid9YF1cbiAgICAgICAgICAgIDogW107XG4gICAgICAgIGNvbnN0IHRhZ0VudHJpZXMgPSBPYmplY3QuZW50cmllcyh0aGlzLnRhZ3MpO1xuICAgICAgICBsZXQgdGFnTmFtZXM7XG4gICAgICAgIGlmIChkb2MgJiYgdGFnRW50cmllcy5sZW5ndGggPiAwICYmIGlzTm9kZShkb2MuY29udGVudHMpKSB7XG4gICAgICAgICAgICBjb25zdCB0YWdzID0ge307XG4gICAgICAgICAgICB2aXNpdChkb2MuY29udGVudHMsIChfa2V5LCBub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTm9kZShub2RlKSAmJiBub2RlLnRhZylcbiAgICAgICAgICAgICAgICAgICAgdGFnc1tub2RlLnRhZ10gPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0YWdOYW1lcyA9IE9iamVjdC5rZXlzKHRhZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRhZ05hbWVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgW2hhbmRsZSwgcHJlZml4XSBvZiB0YWdFbnRyaWVzKSB7XG4gICAgICAgICAgICBpZiAoaGFuZGxlID09PSAnISEnICYmIHByZWZpeCA9PT0gJ3RhZzp5YW1sLm9yZywyMDAyOicpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBpZiAoIWRvYyB8fCB0YWdOYW1lcy5zb21lKHRuID0+IHRuLnN0YXJ0c1dpdGgocHJlZml4KSkpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChgJVRBRyAke2hhbmRsZX0gJHtwcmVmaXh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xuICAgIH1cbn1cbkRpcmVjdGl2ZXMuZGVmYXVsdFlhbWwgPSB7IGV4cGxpY2l0OiBmYWxzZSwgdmVyc2lvbjogJzEuMicgfTtcbkRpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MgPSB7ICchISc6ICd0YWc6eWFtbC5vcmcsMjAwMjonIH07XG5cbmV4cG9ydCB7IERpcmVjdGl2ZXMgfTtcbiIsICJpbXBvcnQgeyBpc1NjYWxhciwgaXNDb2xsZWN0aW9uIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgdmlzaXQgfSBmcm9tICcuLi92aXNpdC5qcyc7XG5cbi8qKlxuICogVmVyaWZ5IHRoYXQgdGhlIGlucHV0IHN0cmluZyBpcyBhIHZhbGlkIGFuY2hvci5cbiAqXG4gKiBXaWxsIHRocm93IG9uIGVycm9ycy5cbiAqL1xuZnVuY3Rpb24gYW5jaG9ySXNWYWxpZChhbmNob3IpIHtcbiAgICBpZiAoL1tcXHgwMC1cXHgxOVxccyxbXFxde31dLy50ZXN0KGFuY2hvcikpIHtcbiAgICAgICAgY29uc3Qgc2EgPSBKU09OLnN0cmluZ2lmeShhbmNob3IpO1xuICAgICAgICBjb25zdCBtc2cgPSBgQW5jaG9yIG11c3Qgbm90IGNvbnRhaW4gd2hpdGVzcGFjZSBvciBjb250cm9sIGNoYXJhY3RlcnM6ICR7c2F9YDtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24gYW5jaG9yTmFtZXMocm9vdCkge1xuICAgIGNvbnN0IGFuY2hvcnMgPSBuZXcgU2V0KCk7XG4gICAgdmlzaXQocm9vdCwge1xuICAgICAgICBWYWx1ZShfa2V5LCBub2RlKSB7XG4gICAgICAgICAgICBpZiAobm9kZS5hbmNob3IpXG4gICAgICAgICAgICAgICAgYW5jaG9ycy5hZGQobm9kZS5hbmNob3IpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGFuY2hvcnM7XG59XG4vKiogRmluZCBhIG5ldyBhbmNob3IgbmFtZSB3aXRoIHRoZSBnaXZlbiBgcHJlZml4YCBhbmQgYSBvbmUtaW5kZXhlZCBzdWZmaXguICovXG5mdW5jdGlvbiBmaW5kTmV3QW5jaG9yKHByZWZpeCwgZXhjbHVkZSkge1xuICAgIGZvciAobGV0IGkgPSAxOyB0cnVlOyArK2kpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGAke3ByZWZpeH0ke2l9YDtcbiAgICAgICAgaWYgKCFleGNsdWRlLmhhcyhuYW1lKSlcbiAgICAgICAgICAgIHJldHVybiBuYW1lO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNyZWF0ZU5vZGVBbmNob3JzKGRvYywgcHJlZml4KSB7XG4gICAgY29uc3QgYWxpYXNPYmplY3RzID0gW107XG4gICAgY29uc3Qgc291cmNlT2JqZWN0cyA9IG5ldyBNYXAoKTtcbiAgICBsZXQgcHJldkFuY2hvcnMgPSBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAgIG9uQW5jaG9yOiAoc291cmNlKSA9PiB7XG4gICAgICAgICAgICBhbGlhc09iamVjdHMucHVzaChzb3VyY2UpO1xuICAgICAgICAgICAgcHJldkFuY2hvcnMgPz8gKHByZXZBbmNob3JzID0gYW5jaG9yTmFtZXMoZG9jKSk7XG4gICAgICAgICAgICBjb25zdCBhbmNob3IgPSBmaW5kTmV3QW5jaG9yKHByZWZpeCwgcHJldkFuY2hvcnMpO1xuICAgICAgICAgICAgcHJldkFuY2hvcnMuYWRkKGFuY2hvcik7XG4gICAgICAgICAgICByZXR1cm4gYW5jaG9yO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogV2l0aCBjaXJjdWxhciByZWZlcmVuY2VzLCB0aGUgc291cmNlIG5vZGUgaXMgb25seSByZXNvbHZlZCBhZnRlciBhbGxcbiAgICAgICAgICogb2YgaXRzIGNoaWxkIG5vZGVzIGFyZS4gVGhpcyBpcyB3aHkgYW5jaG9ycyBhcmUgc2V0IG9ubHkgYWZ0ZXIgYWxsIG9mXG4gICAgICAgICAqIHRoZSBub2RlcyBoYXZlIGJlZW4gY3JlYXRlZC5cbiAgICAgICAgICovXG4gICAgICAgIHNldEFuY2hvcnM6ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGFsaWFzT2JqZWN0cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZiA9IHNvdXJjZU9iamVjdHMuZ2V0KHNvdXJjZSk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZWYgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAgICAgICAgIHJlZi5hbmNob3IgJiZcbiAgICAgICAgICAgICAgICAgICAgKGlzU2NhbGFyKHJlZi5ub2RlKSB8fCBpc0NvbGxlY3Rpb24ocmVmLm5vZGUpKSkge1xuICAgICAgICAgICAgICAgICAgICByZWYubm9kZS5hbmNob3IgPSByZWYuYW5jaG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoJ0ZhaWxlZCB0byByZXNvbHZlIHJlcGVhdGVkIG9iamVjdCAodGhpcyBzaG91bGQgbm90IGhhcHBlbiknKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3Iuc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNvdXJjZU9iamVjdHNcbiAgICB9O1xufVxuXG5leHBvcnQgeyBhbmNob3JJc1ZhbGlkLCBhbmNob3JOYW1lcywgY3JlYXRlTm9kZUFuY2hvcnMsIGZpbmROZXdBbmNob3IgfTtcbiIsICIvKipcbiAqIEFwcGxpZXMgdGhlIEpTT04ucGFyc2UgcmV2aXZlciBhbGdvcml0aG0gYXMgZGVmaW5lZCBpbiB0aGUgRUNNQS0yNjIgc3BlYyxcbiAqIGluIHNlY3Rpb24gMjQuNS4xLjEgXCJSdW50aW1lIFNlbWFudGljczogSW50ZXJuYWxpemVKU09OUHJvcGVydHlcIiBvZiB0aGVcbiAqIDIwMjEgZWRpdGlvbjogaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1qc29uLnBhcnNlXG4gKlxuICogSW5jbHVkZXMgZXh0ZW5zaW9ucyBmb3IgaGFuZGxpbmcgTWFwIGFuZCBTZXQgb2JqZWN0cy5cbiAqL1xuZnVuY3Rpb24gYXBwbHlSZXZpdmVyKHJldml2ZXIsIG9iaiwga2V5LCB2YWwpIHtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB2YWwubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2MCA9IHZhbFtpXTtcbiAgICAgICAgICAgICAgICBjb25zdCB2MSA9IGFwcGx5UmV2aXZlcihyZXZpdmVyLCB2YWwsIFN0cmluZyhpKSwgdjApO1xuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tYXJyYXktZGVsZXRlXG4gICAgICAgICAgICAgICAgaWYgKHYxID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB2YWxbaV07XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodjEgIT09IHYwKVxuICAgICAgICAgICAgICAgICAgICB2YWxbaV0gPSB2MTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgayBvZiBBcnJheS5mcm9tKHZhbC5rZXlzKCkpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdjAgPSB2YWwuZ2V0KGspO1xuICAgICAgICAgICAgICAgIGNvbnN0IHYxID0gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHZhbCwgaywgdjApO1xuICAgICAgICAgICAgICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICB2YWwuZGVsZXRlKGspO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYxICE9PSB2MClcbiAgICAgICAgICAgICAgICAgICAgdmFsLnNldChrLCB2MSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHYwIG9mIEFycmF5LmZyb20odmFsKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYxID0gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHZhbCwgdjAsIHYwKTtcbiAgICAgICAgICAgICAgICBpZiAodjEgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgdmFsLmRlbGV0ZSh2MCk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodjEgIT09IHYwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5kZWxldGUodjApO1xuICAgICAgICAgICAgICAgICAgICB2YWwuYWRkKHYxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrLCB2MF0gb2YgT2JqZWN0LmVudHJpZXModmFsKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYxID0gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHZhbCwgaywgdjApO1xuICAgICAgICAgICAgICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdmFsW2tdO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYxICE9PSB2MClcbiAgICAgICAgICAgICAgICAgICAgdmFsW2tdID0gdjE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldml2ZXIuY2FsbChvYmosIGtleSwgdmFsKTtcbn1cblxuZXhwb3J0IHsgYXBwbHlSZXZpdmVyIH07XG4iLCAiaW1wb3J0IHsgaGFzQW5jaG9yIH0gZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5cbi8qKlxuICogUmVjdXJzaXZlbHkgY29udmVydCBhbnkgbm9kZSBvciBpdHMgY29udGVudHMgdG8gbmF0aXZlIEphdmFTY3JpcHRcbiAqXG4gKiBAcGFyYW0gdmFsdWUgLSBUaGUgaW5wdXQgdmFsdWVcbiAqIEBwYXJhbSBhcmcgLSBJZiBgdmFsdWVgIGRlZmluZXMgYSBgdG9KU09OKClgIG1ldGhvZCwgdXNlIHRoaXNcbiAqICAgYXMgaXRzIGZpcnN0IGFyZ3VtZW50XG4gKiBAcGFyYW0gY3R4IC0gQ29udmVyc2lvbiBjb250ZXh0LCBvcmlnaW5hbGx5IHNldCBpbiBEb2N1bWVudCN0b0pTKCkuIElmXG4gKiAgIGB7IGtlZXA6IHRydWUgfWAgaXMgbm90IHNldCwgb3V0cHV0IHNob3VsZCBiZSBzdWl0YWJsZSBmb3IgSlNPTlxuICogICBzdHJpbmdpZmljYXRpb24uXG4gKi9cbmZ1bmN0aW9uIHRvSlModmFsdWUsIGFyZywgY3R4KSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtcmV0dXJuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKVxuICAgICAgICByZXR1cm4gdmFsdWUubWFwKCh2LCBpKSA9PiB0b0pTKHYsIFN0cmluZyhpKSwgY3R4KSk7XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50b0pTT04gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtY2FsbFxuICAgICAgICBpZiAoIWN0eCB8fCAhaGFzQW5jaG9yKHZhbHVlKSlcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b0pTT04oYXJnLCBjdHgpO1xuICAgICAgICBjb25zdCBkYXRhID0geyBhbGlhc0NvdW50OiAwLCBjb3VudDogMSwgcmVzOiB1bmRlZmluZWQgfTtcbiAgICAgICAgY3R4LmFuY2hvcnMuc2V0KHZhbHVlLCBkYXRhKTtcbiAgICAgICAgY3R4Lm9uQ3JlYXRlID0gcmVzID0+IHtcbiAgICAgICAgICAgIGRhdGEucmVzID0gcmVzO1xuICAgICAgICAgICAgZGVsZXRlIGN0eC5vbkNyZWF0ZTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzID0gdmFsdWUudG9KU09OKGFyZywgY3R4KTtcbiAgICAgICAgaWYgKGN0eC5vbkNyZWF0ZSlcbiAgICAgICAgICAgIGN0eC5vbkNyZWF0ZShyZXMpO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyAmJiAhY3R4Py5rZWVwKVxuICAgICAgICByZXR1cm4gTnVtYmVyKHZhbHVlKTtcbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCB7IHRvSlMgfTtcbiIsICJpbXBvcnQgeyBhcHBseVJldml2ZXIgfSBmcm9tICcuLi9kb2MvYXBwbHlSZXZpdmVyLmpzJztcbmltcG9ydCB7IE5PREVfVFlQRSwgaXNEb2N1bWVudCB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgdG9KUyB9IGZyb20gJy4vdG9KUy5qcyc7XG5cbmNsYXNzIE5vZGVCYXNlIHtcbiAgICBjb25zdHJ1Y3Rvcih0eXBlKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBOT0RFX1RZUEUsIHsgdmFsdWU6IHR5cGUgfSk7XG4gICAgfVxuICAgIC8qKiBDcmVhdGUgYSBjb3B5IG9mIHRoaXMgbm9kZS4gICovXG4gICAgY2xvbmUoKSB7XG4gICAgICAgIGNvbnN0IGNvcHkgPSBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModGhpcykpO1xuICAgICAgICBpZiAodGhpcy5yYW5nZSlcbiAgICAgICAgICAgIGNvcHkucmFuZ2UgPSB0aGlzLnJhbmdlLnNsaWNlKCk7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cbiAgICAvKiogQSBwbGFpbiBKYXZhU2NyaXB0IHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgbm9kZS4gKi9cbiAgICB0b0pTKGRvYywgeyBtYXBBc01hcCwgbWF4QWxpYXNDb3VudCwgb25BbmNob3IsIHJldml2ZXIgfSA9IHt9KSB7XG4gICAgICAgIGlmICghaXNEb2N1bWVudChkb2MpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQSBkb2N1bWVudCBhcmd1bWVudCBpcyByZXF1aXJlZCcpO1xuICAgICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgICAgICBhbmNob3JzOiBuZXcgTWFwKCksXG4gICAgICAgICAgICBkb2MsXG4gICAgICAgICAgICBrZWVwOiB0cnVlLFxuICAgICAgICAgICAgbWFwQXNNYXA6IG1hcEFzTWFwID09PSB0cnVlLFxuICAgICAgICAgICAgbWFwS2V5V2FybmVkOiBmYWxzZSxcbiAgICAgICAgICAgIG1heEFsaWFzQ291bnQ6IHR5cGVvZiBtYXhBbGlhc0NvdW50ID09PSAnbnVtYmVyJyA/IG1heEFsaWFzQ291bnQgOiAxMDBcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzID0gdG9KUyh0aGlzLCAnJywgY3R4KTtcbiAgICAgICAgaWYgKHR5cGVvZiBvbkFuY2hvciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBjb3VudCwgcmVzIH0gb2YgY3R4LmFuY2hvcnMudmFsdWVzKCkpXG4gICAgICAgICAgICAgICAgb25BbmNob3IocmVzLCBjb3VudCk7XG4gICAgICAgIHJldHVybiB0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBhcHBseVJldml2ZXIocmV2aXZlciwgeyAnJzogcmVzIH0sICcnLCByZXMpXG4gICAgICAgICAgICA6IHJlcztcbiAgICB9XG59XG5cbmV4cG9ydCB7IE5vZGVCYXNlIH07XG4iLCAiaW1wb3J0IHsgYW5jaG9ySXNWYWxpZCB9IGZyb20gJy4uL2RvYy9hbmNob3JzLmpzJztcbmltcG9ydCB7IHZpc2l0IH0gZnJvbSAnLi4vdmlzaXQuanMnO1xuaW1wb3J0IHsgQUxJQVMsIGlzQWxpYXMsIGlzQ29sbGVjdGlvbiwgaXNQYWlyLCBoYXNBbmNob3IgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IE5vZGVCYXNlIH0gZnJvbSAnLi9Ob2RlLmpzJztcbmltcG9ydCB7IHRvSlMgfSBmcm9tICcuL3RvSlMuanMnO1xuXG5jbGFzcyBBbGlhcyBleHRlbmRzIE5vZGVCYXNlIHtcbiAgICBjb25zdHJ1Y3Rvcihzb3VyY2UpIHtcbiAgICAgICAgc3VwZXIoQUxJQVMpO1xuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd0YWcnLCB7XG4gICAgICAgICAgICBzZXQoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbGlhcyBub2RlcyBjYW5ub3QgaGF2ZSB0YWdzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlIHRoZSB2YWx1ZSBvZiB0aGlzIGFsaWFzIHdpdGhpbiBgZG9jYCwgZmluZGluZyB0aGUgbGFzdFxuICAgICAqIGluc3RhbmNlIG9mIHRoZSBgc291cmNlYCBhbmNob3IgYmVmb3JlIHRoaXMgbm9kZS5cbiAgICAgKi9cbiAgICByZXNvbHZlKGRvYywgY3R4KSB7XG4gICAgICAgIGlmIChjdHg/Lm1heEFsaWFzQ291bnQgPT09IDApXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoJ0FsaWFzIHJlc29sdXRpb24gaXMgZGlzYWJsZWQnKTtcbiAgICAgICAgbGV0IG5vZGVzO1xuICAgICAgICBpZiAoY3R4Py5hbGlhc1Jlc29sdmVDYWNoZSkge1xuICAgICAgICAgICAgbm9kZXMgPSBjdHguYWxpYXNSZXNvbHZlQ2FjaGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBub2RlcyA9IFtdO1xuICAgICAgICAgICAgdmlzaXQoZG9jLCB7XG4gICAgICAgICAgICAgICAgTm9kZTogKF9rZXksIG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQWxpYXMobm9kZSkgfHwgaGFzQW5jaG9yKG5vZGUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChjdHgpXG4gICAgICAgICAgICAgICAgY3R4LmFsaWFzUmVzb2x2ZUNhY2hlID0gbm9kZXM7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGZvdW5kID0gdW5kZWZpbmVkO1xuICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgIGlmIChub2RlID09PSB0aGlzKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgaWYgKG5vZGUuYW5jaG9yID09PSB0aGlzLnNvdXJjZSlcbiAgICAgICAgICAgICAgICBmb3VuZCA9IG5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgIH1cbiAgICB0b0pTT04oX2FyZywgY3R4KSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIHsgc291cmNlOiB0aGlzLnNvdXJjZSB9O1xuICAgICAgICBjb25zdCB7IGFuY2hvcnMsIGRvYywgbWF4QWxpYXNDb3VudCB9ID0gY3R4O1xuICAgICAgICBjb25zdCBzb3VyY2UgPSB0aGlzLnJlc29sdmUoZG9jLCBjdHgpO1xuICAgICAgICBpZiAoIXNvdXJjZSkge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gYFVucmVzb2x2ZWQgYWxpYXMgKHRoZSBhbmNob3IgbXVzdCBiZSBzZXQgYmVmb3JlIHRoZSBhbGlhcyk6ICR7dGhpcy5zb3VyY2V9YDtcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihtc2cpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkYXRhID0gYW5jaG9ycy5nZXQoc291cmNlKTtcbiAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICAvLyBSZXNvbHZlIGFuY2hvcnMgZm9yIE5vZGUucHJvdG90eXBlLnRvSlMoKVxuICAgICAgICAgICAgdG9KUyhzb3VyY2UsIG51bGwsIGN0eCk7XG4gICAgICAgICAgICBkYXRhID0gYW5jaG9ycy5nZXQoc291cmNlKTtcbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKGRhdGE/LnJlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSAnVGhpcyBzaG91bGQgbm90IGhhcHBlbjogQWxpYXMgYW5jaG9yIHdhcyBub3QgcmVzb2x2ZWQ/JztcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihtc2cpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtYXhBbGlhc0NvdW50ID49IDApIHtcbiAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcbiAgICAgICAgICAgIGlmIChkYXRhLmFsaWFzQ291bnQgPT09IDApXG4gICAgICAgICAgICAgICAgZGF0YS5hbGlhc0NvdW50ID0gZ2V0QWxpYXNDb3VudChkb2MsIHNvdXJjZSwgYW5jaG9ycyk7XG4gICAgICAgICAgICBpZiAoZGF0YS5jb3VudCAqIGRhdGEuYWxpYXNDb3VudCA+IG1heEFsaWFzQ291bnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSAnRXhjZXNzaXZlIGFsaWFzIGNvdW50IGluZGljYXRlcyBhIHJlc291cmNlIGV4aGF1c3Rpb24gYXR0YWNrJztcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IobXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YS5yZXM7XG4gICAgfVxuICAgIHRvU3RyaW5nKGN0eCwgX29uQ29tbWVudCwgX29uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGNvbnN0IHNyYyA9IGAqJHt0aGlzLnNvdXJjZX1gO1xuICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICBhbmNob3JJc1ZhbGlkKHRoaXMuc291cmNlKTtcbiAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy52ZXJpZnlBbGlhc09yZGVyICYmICFjdHguYW5jaG9ycy5oYXModGhpcy5zb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gYFVucmVzb2x2ZWQgYWxpYXMgKHRoZSBhbmNob3IgbXVzdCBiZSBzZXQgYmVmb3JlIHRoZSBhbGlhcyk6ICR7dGhpcy5zb3VyY2V9YDtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjdHguaW1wbGljaXRLZXkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3NyY30gYDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3JjO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGdldEFsaWFzQ291bnQoZG9jLCBub2RlLCBhbmNob3JzKSB7XG4gICAgaWYgKGlzQWxpYXMobm9kZSkpIHtcbiAgICAgICAgY29uc3Qgc291cmNlID0gbm9kZS5yZXNvbHZlKGRvYyk7XG4gICAgICAgIGNvbnN0IGFuY2hvciA9IGFuY2hvcnMgJiYgc291cmNlICYmIGFuY2hvcnMuZ2V0KHNvdXJjZSk7XG4gICAgICAgIHJldHVybiBhbmNob3IgPyBhbmNob3IuY291bnQgKiBhbmNob3IuYWxpYXNDb3VudCA6IDA7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzQ29sbGVjdGlvbihub2RlKSkge1xuICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2Ygbm9kZS5pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgYyA9IGdldEFsaWFzQ291bnQoZG9jLCBpdGVtLCBhbmNob3JzKTtcbiAgICAgICAgICAgIGlmIChjID4gY291bnQpXG4gICAgICAgICAgICAgICAgY291bnQgPSBjO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNQYWlyKG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IGtjID0gZ2V0QWxpYXNDb3VudChkb2MsIG5vZGUua2V5LCBhbmNob3JzKTtcbiAgICAgICAgY29uc3QgdmMgPSBnZXRBbGlhc0NvdW50KGRvYywgbm9kZS52YWx1ZSwgYW5jaG9ycyk7XG4gICAgICAgIHJldHVybiBNYXRoLm1heChrYywgdmMpO1xuICAgIH1cbiAgICByZXR1cm4gMTtcbn1cblxuZXhwb3J0IHsgQWxpYXMgfTtcbiIsICJpbXBvcnQgeyBTQ0FMQVIgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IE5vZGVCYXNlIH0gZnJvbSAnLi9Ob2RlLmpzJztcbmltcG9ydCB7IHRvSlMgfSBmcm9tICcuL3RvSlMuanMnO1xuXG5jb25zdCBpc1NjYWxhclZhbHVlID0gKHZhbHVlKSA9PiAhdmFsdWUgfHwgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKTtcbmNsYXNzIFNjYWxhciBleHRlbmRzIE5vZGVCYXNlIHtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSkge1xuICAgICAgICBzdXBlcihTQ0FMQVIpO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIHRvSlNPTihhcmcsIGN0eCkge1xuICAgICAgICByZXR1cm4gY3R4Py5rZWVwID8gdGhpcy52YWx1ZSA6IHRvSlModGhpcy52YWx1ZSwgYXJnLCBjdHgpO1xuICAgIH1cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZyh0aGlzLnZhbHVlKTtcbiAgICB9XG59XG5TY2FsYXIuQkxPQ0tfRk9MREVEID0gJ0JMT0NLX0ZPTERFRCc7XG5TY2FsYXIuQkxPQ0tfTElURVJBTCA9ICdCTE9DS19MSVRFUkFMJztcblNjYWxhci5QTEFJTiA9ICdQTEFJTic7XG5TY2FsYXIuUVVPVEVfRE9VQkxFID0gJ1FVT1RFX0RPVUJMRSc7XG5TY2FsYXIuUVVPVEVfU0lOR0xFID0gJ1FVT1RFX1NJTkdMRSc7XG5cbmV4cG9ydCB7IFNjYWxhciwgaXNTY2FsYXJWYWx1ZSB9O1xuIiwgImltcG9ydCB7IEFsaWFzIH0gZnJvbSAnLi4vbm9kZXMvQWxpYXMuanMnO1xuaW1wb3J0IHsgaXNOb2RlLCBpc1BhaXIsIE1BUCwgU0VRLCBpc0RvY3VtZW50IH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vbm9kZXMvU2NhbGFyLmpzJztcblxuY29uc3QgZGVmYXVsdFRhZ1ByZWZpeCA9ICd0YWc6eWFtbC5vcmcsMjAwMjonO1xuZnVuY3Rpb24gZmluZFRhZ09iamVjdCh2YWx1ZSwgdGFnTmFtZSwgdGFncykge1xuICAgIGlmICh0YWdOYW1lKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdGFncy5maWx0ZXIodCA9PiB0LnRhZyA9PT0gdGFnTmFtZSk7XG4gICAgICAgIGNvbnN0IHRhZ09iaiA9IG1hdGNoLmZpbmQodCA9PiAhdC5mb3JtYXQpID8/IG1hdGNoWzBdO1xuICAgICAgICBpZiAoIXRhZ09iailcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGFnICR7dGFnTmFtZX0gbm90IGZvdW5kYCk7XG4gICAgICAgIHJldHVybiB0YWdPYmo7XG4gICAgfVxuICAgIHJldHVybiB0YWdzLmZpbmQodCA9PiB0LmlkZW50aWZ5Py4odmFsdWUpICYmICF0LmZvcm1hdCk7XG59XG5mdW5jdGlvbiBjcmVhdGVOb2RlKHZhbHVlLCB0YWdOYW1lLCBjdHgpIHtcbiAgICBpZiAoaXNEb2N1bWVudCh2YWx1ZSkpXG4gICAgICAgIHZhbHVlID0gdmFsdWUuY29udGVudHM7XG4gICAgaWYgKGlzTm9kZSh2YWx1ZSkpXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICBpZiAoaXNQYWlyKHZhbHVlKSkge1xuICAgICAgICBjb25zdCBtYXAgPSBjdHguc2NoZW1hW01BUF0uY3JlYXRlTm9kZT8uKGN0eC5zY2hlbWEsIG51bGwsIGN0eCk7XG4gICAgICAgIG1hcC5pdGVtcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgU3RyaW5nIHx8XG4gICAgICAgIHZhbHVlIGluc3RhbmNlb2YgTnVtYmVyIHx8XG4gICAgICAgIHZhbHVlIGluc3RhbmNlb2YgQm9vbGVhbiB8fFxuICAgICAgICAodHlwZW9mIEJpZ0ludCAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgaW5zdGFuY2VvZiBCaWdJbnQpIC8vIG5vdCBzdXBwb3J0ZWQgZXZlcnl3aGVyZVxuICAgICkge1xuICAgICAgICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jc2VjLXNlcmlhbGl6ZWpzb25wcm9wZXJ0eVxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnZhbHVlT2YoKTtcbiAgICB9XG4gICAgY29uc3QgeyBhbGlhc0R1cGxpY2F0ZU9iamVjdHMsIG9uQW5jaG9yLCBvblRhZ09iaiwgc2NoZW1hLCBzb3VyY2VPYmplY3RzIH0gPSBjdHg7XG4gICAgLy8gRGV0ZWN0IGR1cGxpY2F0ZSByZWZlcmVuY2VzIHRvIHRoZSBzYW1lIG9iamVjdCAmIHVzZSBBbGlhcyBub2RlcyBmb3IgYWxsXG4gICAgLy8gYWZ0ZXIgZmlyc3QuIFRoZSBgcmVmYCB3cmFwcGVyIGFsbG93cyBmb3IgY2lyY3VsYXIgcmVmZXJlbmNlcyB0byByZXNvbHZlLlxuICAgIGxldCByZWYgPSB1bmRlZmluZWQ7XG4gICAgaWYgKGFsaWFzRHVwbGljYXRlT2JqZWN0cyAmJiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJlZiA9IHNvdXJjZU9iamVjdHMuZ2V0KHZhbHVlKTtcbiAgICAgICAgaWYgKHJlZikge1xuICAgICAgICAgICAgcmVmLmFuY2hvciA/PyAocmVmLmFuY2hvciA9IG9uQW5jaG9yKHZhbHVlKSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEFsaWFzKHJlZi5hbmNob3IpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVmID0geyBhbmNob3I6IG51bGwsIG5vZGU6IG51bGwgfTtcbiAgICAgICAgICAgIHNvdXJjZU9iamVjdHMuc2V0KHZhbHVlLCByZWYpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0YWdOYW1lPy5zdGFydHNXaXRoKCchIScpKVxuICAgICAgICB0YWdOYW1lID0gZGVmYXVsdFRhZ1ByZWZpeCArIHRhZ05hbWUuc2xpY2UoMik7XG4gICAgbGV0IHRhZ09iaiA9IGZpbmRUYWdPYmplY3QodmFsdWUsIHRhZ05hbWUsIHNjaGVtYS50YWdzKTtcbiAgICBpZiAoIXRhZ09iaikge1xuICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtY2FsbFxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b0pTT04oKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgU2NhbGFyKHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChyZWYpXG4gICAgICAgICAgICAgICAgcmVmLm5vZGUgPSBub2RlO1xuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgdGFnT2JqID1cbiAgICAgICAgICAgIHZhbHVlIGluc3RhbmNlb2YgTWFwXG4gICAgICAgICAgICAgICAgPyBzY2hlbWFbTUFQXVxuICAgICAgICAgICAgICAgIDogU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdCh2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgPyBzY2hlbWFbU0VRXVxuICAgICAgICAgICAgICAgICAgICA6IHNjaGVtYVtNQVBdO1xuICAgIH1cbiAgICBpZiAob25UYWdPYmopIHtcbiAgICAgICAgb25UYWdPYmoodGFnT2JqKTtcbiAgICAgICAgZGVsZXRlIGN0eC5vblRhZ09iajtcbiAgICB9XG4gICAgY29uc3Qgbm9kZSA9IHRhZ09iaj8uY3JlYXRlTm9kZVxuICAgICAgICA/IHRhZ09iai5jcmVhdGVOb2RlKGN0eC5zY2hlbWEsIHZhbHVlLCBjdHgpXG4gICAgICAgIDogdHlwZW9mIHRhZ09iaj8ubm9kZUNsYXNzPy5mcm9tID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IHRhZ09iai5ub2RlQ2xhc3MuZnJvbShjdHguc2NoZW1hLCB2YWx1ZSwgY3R4KVxuICAgICAgICAgICAgOiBuZXcgU2NhbGFyKHZhbHVlKTtcbiAgICBpZiAodGFnTmFtZSlcbiAgICAgICAgbm9kZS50YWcgPSB0YWdOYW1lO1xuICAgIGVsc2UgaWYgKCF0YWdPYmouZGVmYXVsdClcbiAgICAgICAgbm9kZS50YWcgPSB0YWdPYmoudGFnO1xuICAgIGlmIChyZWYpXG4gICAgICAgIHJlZi5ub2RlID0gbm9kZTtcbiAgICByZXR1cm4gbm9kZTtcbn1cblxuZXhwb3J0IHsgY3JlYXRlTm9kZSB9O1xuIiwgImltcG9ydCB7IGNyZWF0ZU5vZGUgfSBmcm9tICcuLi9kb2MvY3JlYXRlTm9kZS5qcyc7XG5pbXBvcnQgeyBpc05vZGUsIGlzUGFpciwgaXNDb2xsZWN0aW9uLCBpc1NjYWxhciB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgTm9kZUJhc2UgfSBmcm9tICcuL05vZGUuanMnO1xuXG5mdW5jdGlvbiBjb2xsZWN0aW9uRnJvbVBhdGgoc2NoZW1hLCBwYXRoLCB2YWx1ZSkge1xuICAgIGxldCB2ID0gdmFsdWU7XG4gICAgZm9yIChsZXQgaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgY29uc3QgayA9IHBhdGhbaV07XG4gICAgICAgIGlmICh0eXBlb2YgayA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzSW50ZWdlcihrKSAmJiBrID49IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGEgPSBbXTtcbiAgICAgICAgICAgIGFba10gPSB2O1xuICAgICAgICAgICAgdiA9IGE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2ID0gbmV3IE1hcChbW2ssIHZdXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZU5vZGUodiwgdW5kZWZpbmVkLCB7XG4gICAgICAgIGFsaWFzRHVwbGljYXRlT2JqZWN0czogZmFsc2UsXG4gICAgICAgIGtlZXBVbmRlZmluZWQ6IGZhbHNlLFxuICAgICAgICBvbkFuY2hvcjogKCkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIHNob3VsZCBub3QgaGFwcGVuLCBwbGVhc2UgcmVwb3J0IGEgYnVnLicpO1xuICAgICAgICB9LFxuICAgICAgICBzY2hlbWEsXG4gICAgICAgIHNvdXJjZU9iamVjdHM6IG5ldyBNYXAoKVxuICAgIH0pO1xufVxuLy8gVHlwZSBndWFyZCBpcyBpbnRlbnRpb25hbGx5IGEgbGl0dGxlIHdyb25nIHNvIGFzIHRvIGJlIG1vcmUgdXNlZnVsLFxuLy8gYXMgaXQgZG9lcyBub3QgY292ZXIgdW50eXBhYmxlIGVtcHR5IG5vbi1zdHJpbmcgaXRlcmFibGVzIChlLmcuIFtdKS5cbmNvbnN0IGlzRW1wdHlQYXRoID0gKHBhdGgpID0+IHBhdGggPT0gbnVsbCB8fFxuICAgICh0eXBlb2YgcGF0aCA9PT0gJ29iamVjdCcgJiYgISFwYXRoW1N5bWJvbC5pdGVyYXRvcl0oKS5uZXh0KCkuZG9uZSk7XG5jbGFzcyBDb2xsZWN0aW9uIGV4dGVuZHMgTm9kZUJhc2Uge1xuICAgIGNvbnN0cnVjdG9yKHR5cGUsIHNjaGVtYSkge1xuICAgICAgICBzdXBlcih0eXBlKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdzY2hlbWEnLCB7XG4gICAgICAgICAgICB2YWx1ZTogc2NoZW1hLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgY29weSBvZiB0aGlzIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2NoZW1hIC0gSWYgZGVmaW5lZCwgb3ZlcndyaXRlcyB0aGUgb3JpZ2luYWwncyBzY2hlbWFcbiAgICAgKi9cbiAgICBjbG9uZShzY2hlbWEpIHtcbiAgICAgICAgY29uc3QgY29weSA9IE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0aGlzKSk7XG4gICAgICAgIGlmIChzY2hlbWEpXG4gICAgICAgICAgICBjb3B5LnNjaGVtYSA9IHNjaGVtYTtcbiAgICAgICAgY29weS5pdGVtcyA9IGNvcHkuaXRlbXMubWFwKGl0ID0+IGlzTm9kZShpdCkgfHwgaXNQYWlyKGl0KSA/IGl0LmNsb25lKHNjaGVtYSkgOiBpdCk7XG4gICAgICAgIGlmICh0aGlzLnJhbmdlKVxuICAgICAgICAgICAgY29weS5yYW5nZSA9IHRoaXMucmFuZ2Uuc2xpY2UoKTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSB2YWx1ZSB0byB0aGUgY29sbGVjdGlvbi4gRm9yIGAhIW1hcGAgYW5kIGAhIW9tYXBgIHRoZSB2YWx1ZSBtdXN0XG4gICAgICogYmUgYSBQYWlyIGluc3RhbmNlIG9yIGEgYHsga2V5LCB2YWx1ZSB9YCBvYmplY3QsIHdoaWNoIG1heSBub3QgaGF2ZSBhIGtleVxuICAgICAqIHRoYXQgYWxyZWFkeSBleGlzdHMgaW4gdGhlIG1hcC5cbiAgICAgKi9cbiAgICBhZGRJbihwYXRoLCB2YWx1ZSkge1xuICAgICAgICBpZiAoaXNFbXB0eVBhdGgocGF0aCkpXG4gICAgICAgICAgICB0aGlzLmFkZCh2YWx1ZSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoaXNDb2xsZWN0aW9uKG5vZGUpKVxuICAgICAgICAgICAgICAgIG5vZGUuYWRkSW4ocmVzdCwgdmFsdWUpO1xuICAgICAgICAgICAgZWxzZSBpZiAobm9kZSA9PT0gdW5kZWZpbmVkICYmIHRoaXMuc2NoZW1hKVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgY29sbGVjdGlvbkZyb21QYXRoKHRoaXMuc2NoZW1hLCByZXN0LCB2YWx1ZSkpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgWUFNTCBjb2xsZWN0aW9uIGF0ICR7a2V5fS4gUmVtYWluaW5nIHBhdGg6ICR7cmVzdH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgdmFsdWUgZnJvbSB0aGUgY29sbGVjdGlvbi5cbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGl0ZW0gd2FzIGZvdW5kIGFuZCByZW1vdmVkLlxuICAgICAqL1xuICAgIGRlbGV0ZUluKHBhdGgpIHtcbiAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICBpZiAocmVzdC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZWxldGUoa2V5KTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgIGlmIChpc0NvbGxlY3Rpb24obm9kZSkpXG4gICAgICAgICAgICByZXR1cm4gbm9kZS5kZWxldGVJbihyZXN0KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBZQU1MIGNvbGxlY3Rpb24gYXQgJHtrZXl9LiBSZW1haW5pbmcgcGF0aDogJHtyZXN0fWApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGl0ZW0gYXQgYGtleWAsIG9yIGB1bmRlZmluZWRgIGlmIG5vdCBmb3VuZC4gQnkgZGVmYXVsdCB1bndyYXBzXG4gICAgICogc2NhbGFyIHZhbHVlcyBmcm9tIHRoZWlyIHN1cnJvdW5kaW5nIG5vZGU7IHRvIGRpc2FibGUgc2V0IGBrZWVwU2NhbGFyYCB0b1xuICAgICAqIGB0cnVlYCAoY29sbGVjdGlvbnMgYXJlIGFsd2F5cyByZXR1cm5lZCBpbnRhY3QpLlxuICAgICAqL1xuICAgIGdldEluKHBhdGgsIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXQoa2V5LCB0cnVlKTtcbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuICFrZWVwU2NhbGFyICYmIGlzU2NhbGFyKG5vZGUpID8gbm9kZS52YWx1ZSA6IG5vZGU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBpc0NvbGxlY3Rpb24obm9kZSkgPyBub2RlLmdldEluKHJlc3QsIGtlZXBTY2FsYXIpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBoYXNBbGxOdWxsVmFsdWVzKGFsbG93U2NhbGFyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zLmV2ZXJ5KG5vZGUgPT4ge1xuICAgICAgICAgICAgaWYgKCFpc1BhaXIobm9kZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgbiA9IG5vZGUudmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gKG4gPT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgIChhbGxvd1NjYWxhciAmJlxuICAgICAgICAgICAgICAgICAgICBpc1NjYWxhcihuKSAmJlxuICAgICAgICAgICAgICAgICAgICBuLnZhbHVlID09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgIW4uY29tbWVudEJlZm9yZSAmJlxuICAgICAgICAgICAgICAgICAgICAhbi5jb21tZW50ICYmXG4gICAgICAgICAgICAgICAgICAgICFuLnRhZykpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBjb2xsZWN0aW9uIGluY2x1ZGVzIGEgdmFsdWUgd2l0aCB0aGUga2V5IGBrZXlgLlxuICAgICAqL1xuICAgIGhhc0luKHBhdGgpIHtcbiAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICBpZiAocmVzdC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYXMoa2V5KTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBpc0NvbGxlY3Rpb24obm9kZSkgPyBub2RlLmhhc0luKHJlc3QpIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBpbiB0aGlzIGNvbGxlY3Rpb24uIEZvciBgISFzZXRgLCBgdmFsdWVgIG5lZWRzIHRvIGJlIGFcbiAgICAgKiBib29sZWFuIHRvIGFkZC9yZW1vdmUgdGhlIGl0ZW0gZnJvbSB0aGUgc2V0LlxuICAgICAqL1xuICAgIHNldEluKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldChrZXksIHRydWUpO1xuICAgICAgICAgICAgaWYgKGlzQ29sbGVjdGlvbihub2RlKSlcbiAgICAgICAgICAgICAgICBub2RlLnNldEluKHJlc3QsIHZhbHVlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUgPT09IHVuZGVmaW5lZCAmJiB0aGlzLnNjaGVtYSlcbiAgICAgICAgICAgICAgICB0aGlzLnNldChrZXksIGNvbGxlY3Rpb25Gcm9tUGF0aCh0aGlzLnNjaGVtYSwgcmVzdCwgdmFsdWUpKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIFlBTUwgY29sbGVjdGlvbiBhdCAke2tleX0uIFJlbWFpbmluZyBwYXRoOiAke3Jlc3R9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7IENvbGxlY3Rpb24sIGNvbGxlY3Rpb25Gcm9tUGF0aCwgaXNFbXB0eVBhdGggfTtcbiIsICIvKipcbiAqIFN0cmluZ2lmaWVzIGEgY29tbWVudC5cbiAqXG4gKiBFbXB0eSBjb21tZW50IGxpbmVzIGFyZSBsZWZ0IGVtcHR5LFxuICogbGluZXMgY29uc2lzdGluZyBvZiBhIHNpbmdsZSBzcGFjZSBhcmUgcmVwbGFjZWQgYnkgYCNgLFxuICogYW5kIGFsbCBvdGhlciBsaW5lcyBhcmUgcHJlZml4ZWQgd2l0aCBhIGAjYC5cbiAqL1xuY29uc3Qgc3RyaW5naWZ5Q29tbWVudCA9IChzdHIpID0+IHN0ci5yZXBsYWNlKC9eKD8hJCkoPzogJCk/L2dtLCAnIycpO1xuZnVuY3Rpb24gaW5kZW50Q29tbWVudChjb21tZW50LCBpbmRlbnQpIHtcbiAgICBpZiAoL15cXG4rJC8udGVzdChjb21tZW50KSlcbiAgICAgICAgcmV0dXJuIGNvbW1lbnQuc3Vic3RyaW5nKDEpO1xuICAgIHJldHVybiBpbmRlbnQgPyBjb21tZW50LnJlcGxhY2UoL14oPyEgKiQpL2dtLCBpbmRlbnQpIDogY29tbWVudDtcbn1cbmNvbnN0IGxpbmVDb21tZW50ID0gKHN0ciwgaW5kZW50LCBjb21tZW50KSA9PiBzdHIuZW5kc1dpdGgoJ1xcbicpXG4gICAgPyBpbmRlbnRDb21tZW50KGNvbW1lbnQsIGluZGVudClcbiAgICA6IGNvbW1lbnQuaW5jbHVkZXMoJ1xcbicpXG4gICAgICAgID8gJ1xcbicgKyBpbmRlbnRDb21tZW50KGNvbW1lbnQsIGluZGVudClcbiAgICAgICAgOiAoc3RyLmVuZHNXaXRoKCcgJykgPyAnJyA6ICcgJykgKyBjb21tZW50O1xuXG5leHBvcnQgeyBpbmRlbnRDb21tZW50LCBsaW5lQ29tbWVudCwgc3RyaW5naWZ5Q29tbWVudCB9O1xuIiwgImNvbnN0IEZPTERfRkxPVyA9ICdmbG93JztcbmNvbnN0IEZPTERfQkxPQ0sgPSAnYmxvY2snO1xuY29uc3QgRk9MRF9RVU9URUQgPSAncXVvdGVkJztcbi8qKlxuICogVHJpZXMgdG8ga2VlcCBpbnB1dCBhdCB1cCB0byBgbGluZVdpZHRoYCBjaGFyYWN0ZXJzLCBzcGxpdHRpbmcgb25seSBvbiBzcGFjZXNcbiAqIG5vdCBmb2xsb3dlZCBieSBuZXdsaW5lcyBvciBzcGFjZXMgdW5sZXNzIGBtb2RlYCBpcyBgJ3F1b3RlZCdgLiBMaW5lcyBhcmVcbiAqIHRlcm1pbmF0ZWQgd2l0aCBgXFxuYCBhbmQgc3RhcnRlZCB3aXRoIGBpbmRlbnRgLlxuICovXG5mdW5jdGlvbiBmb2xkRmxvd0xpbmVzKHRleHQsIGluZGVudCwgbW9kZSA9ICdmbG93JywgeyBpbmRlbnRBdFN0YXJ0LCBsaW5lV2lkdGggPSA4MCwgbWluQ29udGVudFdpZHRoID0gMjAsIG9uRm9sZCwgb25PdmVyZmxvdyB9ID0ge30pIHtcbiAgICBpZiAoIWxpbmVXaWR0aCB8fCBsaW5lV2lkdGggPCAwKVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICBpZiAobGluZVdpZHRoIDwgbWluQ29udGVudFdpZHRoKVxuICAgICAgICBtaW5Db250ZW50V2lkdGggPSAwO1xuICAgIGNvbnN0IGVuZFN0ZXAgPSBNYXRoLm1heCgxICsgbWluQ29udGVudFdpZHRoLCAxICsgbGluZVdpZHRoIC0gaW5kZW50Lmxlbmd0aCk7XG4gICAgaWYgKHRleHQubGVuZ3RoIDw9IGVuZFN0ZXApXG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIGNvbnN0IGZvbGRzID0gW107XG4gICAgY29uc3QgZXNjYXBlZEZvbGRzID0ge307XG4gICAgbGV0IGVuZCA9IGxpbmVXaWR0aCAtIGluZGVudC5sZW5ndGg7XG4gICAgaWYgKHR5cGVvZiBpbmRlbnRBdFN0YXJ0ID09PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoaW5kZW50QXRTdGFydCA+IGxpbmVXaWR0aCAtIE1hdGgubWF4KDIsIG1pbkNvbnRlbnRXaWR0aCkpXG4gICAgICAgICAgICBmb2xkcy5wdXNoKDApO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlbmQgPSBsaW5lV2lkdGggLSBpbmRlbnRBdFN0YXJ0O1xuICAgIH1cbiAgICBsZXQgc3BsaXQgPSB1bmRlZmluZWQ7XG4gICAgbGV0IHByZXYgPSB1bmRlZmluZWQ7XG4gICAgbGV0IG92ZXJmbG93ID0gZmFsc2U7XG4gICAgbGV0IGkgPSAtMTtcbiAgICBsZXQgZXNjU3RhcnQgPSAtMTtcbiAgICBsZXQgZXNjRW5kID0gLTE7XG4gICAgaWYgKG1vZGUgPT09IEZPTERfQkxPQ0spIHtcbiAgICAgICAgaSA9IGNvbnN1bWVNb3JlSW5kZW50ZWRMaW5lcyh0ZXh0LCBpLCBpbmRlbnQubGVuZ3RoKTtcbiAgICAgICAgaWYgKGkgIT09IC0xKVxuICAgICAgICAgICAgZW5kID0gaSArIGVuZFN0ZXA7XG4gICAgfVxuICAgIGZvciAobGV0IGNoOyAoY2ggPSB0ZXh0WyhpICs9IDEpXSk7KSB7XG4gICAgICAgIGlmIChtb2RlID09PSBGT0xEX1FVT1RFRCAmJiBjaCA9PT0gJ1xcXFwnKSB7XG4gICAgICAgICAgICBlc2NTdGFydCA9IGk7XG4gICAgICAgICAgICBzd2l0Y2ggKHRleHRbaSArIDFdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAneCc6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAndSc6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnVSc6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gOTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXNjRW5kID0gaTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gRk9MRF9CTE9DSylcbiAgICAgICAgICAgICAgICBpID0gY29uc3VtZU1vcmVJbmRlbnRlZExpbmVzKHRleHQsIGksIGluZGVudC5sZW5ndGgpO1xuICAgICAgICAgICAgZW5kID0gaSArIGluZGVudC5sZW5ndGggKyBlbmRTdGVwO1xuICAgICAgICAgICAgc3BsaXQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoY2ggPT09ICcgJyAmJlxuICAgICAgICAgICAgICAgIHByZXYgJiZcbiAgICAgICAgICAgICAgICBwcmV2ICE9PSAnICcgJiZcbiAgICAgICAgICAgICAgICBwcmV2ICE9PSAnXFxuJyAmJlxuICAgICAgICAgICAgICAgIHByZXYgIT09ICdcXHQnKSB7XG4gICAgICAgICAgICAgICAgLy8gc3BhY2Ugc3Vycm91bmRlZCBieSBub24tc3BhY2UgY2FuIGJlIHJlcGxhY2VkIHdpdGggbmV3bGluZSArIGluZGVudFxuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0ZXh0W2kgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAobmV4dCAmJiBuZXh0ICE9PSAnICcgJiYgbmV4dCAhPT0gJ1xcbicgJiYgbmV4dCAhPT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgICAgIHNwbGl0ID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpID49IGVuZCkge1xuICAgICAgICAgICAgICAgIGlmIChzcGxpdCkge1xuICAgICAgICAgICAgICAgICAgICBmb2xkcy5wdXNoKHNwbGl0KTtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gc3BsaXQgKyBlbmRTdGVwO1xuICAgICAgICAgICAgICAgICAgICBzcGxpdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobW9kZSA9PT0gRk9MRF9RVU9URUQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2hpdGUtc3BhY2UgY29sbGVjdGVkIGF0IGVuZCBtYXkgc3RyZXRjaCBwYXN0IGxpbmVXaWR0aFxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAocHJldiA9PT0gJyAnIHx8IHByZXYgPT09ICdcXHQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2ID0gY2g7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaCA9IHRleHRbKGkgKz0gMSldO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3cgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIEFjY291bnQgZm9yIG5ld2xpbmUgZXNjYXBlLCBidXQgZG9uJ3QgYnJlYWsgcHJlY2VkaW5nIGVzY2FwZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBqID0gaSA+IGVzY0VuZCArIDEgPyBpIC0gMiA6IGVzY1N0YXJ0IC0gMTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQmFpbCBvdXQgaWYgbGluZVdpZHRoICYgbWluQ29udGVudFdpZHRoIGFyZSBzaG9ydGVyIHRoYW4gYW4gZXNjYXBlIHN0cmluZ1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXNjYXBlZEZvbGRzW2pdKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGZvbGRzLnB1c2goaik7XG4gICAgICAgICAgICAgICAgICAgIGVzY2FwZWRGb2xkc1tqXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGogKyBlbmRTdGVwO1xuICAgICAgICAgICAgICAgICAgICBzcGxpdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJldiA9IGNoO1xuICAgIH1cbiAgICBpZiAob3ZlcmZsb3cgJiYgb25PdmVyZmxvdylcbiAgICAgICAgb25PdmVyZmxvdygpO1xuICAgIGlmIChmb2xkcy5sZW5ndGggPT09IDApXG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIGlmIChvbkZvbGQpXG4gICAgICAgIG9uRm9sZCgpO1xuICAgIGxldCByZXMgPSB0ZXh0LnNsaWNlKDAsIGZvbGRzWzBdKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZvbGRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGZvbGQgPSBmb2xkc1tpXTtcbiAgICAgICAgY29uc3QgZW5kID0gZm9sZHNbaSArIDFdIHx8IHRleHQubGVuZ3RoO1xuICAgICAgICBpZiAoZm9sZCA9PT0gMClcbiAgICAgICAgICAgIHJlcyA9IGBcXG4ke2luZGVudH0ke3RleHQuc2xpY2UoMCwgZW5kKX1gO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChtb2RlID09PSBGT0xEX1FVT1RFRCAmJiBlc2NhcGVkRm9sZHNbZm9sZF0pXG4gICAgICAgICAgICAgICAgcmVzICs9IGAke3RleHRbZm9sZF19XFxcXGA7XG4gICAgICAgICAgICByZXMgKz0gYFxcbiR7aW5kZW50fSR7dGV4dC5zbGljZShmb2xkICsgMSwgZW5kKX1gO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG4vKipcbiAqIFByZXN1bWVzIGBpICsgMWAgaXMgYXQgdGhlIHN0YXJ0IG9mIGEgbGluZVxuICogQHJldHVybnMgaW5kZXggb2YgbGFzdCBuZXdsaW5lIGluIG1vcmUtaW5kZW50ZWQgYmxvY2tcbiAqL1xuZnVuY3Rpb24gY29uc3VtZU1vcmVJbmRlbnRlZExpbmVzKHRleHQsIGksIGluZGVudCkge1xuICAgIGxldCBlbmQgPSBpO1xuICAgIGxldCBzdGFydCA9IGkgKyAxO1xuICAgIGxldCBjaCA9IHRleHRbc3RhcnRdO1xuICAgIHdoaWxlIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0Jykge1xuICAgICAgICBpZiAoaSA8IHN0YXJ0ICsgaW5kZW50KSB7XG4gICAgICAgICAgICBjaCA9IHRleHRbKytpXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBjaCA9IHRleHRbKytpXTtcbiAgICAgICAgICAgIH0gd2hpbGUgKGNoICYmIGNoICE9PSAnXFxuJyk7XG4gICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIGNoID0gdGV4dFtzdGFydF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVuZDtcbn1cblxuZXhwb3J0IHsgRk9MRF9CTE9DSywgRk9MRF9GTE9XLCBGT0xEX1FVT1RFRCwgZm9sZEZsb3dMaW5lcyB9O1xuIiwgImltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyBmb2xkRmxvd0xpbmVzLCBGT0xEX0ZMT1csIEZPTERfUVVPVEVELCBGT0xEX0JMT0NLIH0gZnJvbSAnLi9mb2xkRmxvd0xpbmVzLmpzJztcblxuY29uc3QgZ2V0Rm9sZE9wdGlvbnMgPSAoY3R4LCBpc0Jsb2NrKSA9PiAoe1xuICAgIGluZGVudEF0U3RhcnQ6IGlzQmxvY2sgPyBjdHguaW5kZW50Lmxlbmd0aCA6IGN0eC5pbmRlbnRBdFN0YXJ0LFxuICAgIGxpbmVXaWR0aDogY3R4Lm9wdGlvbnMubGluZVdpZHRoLFxuICAgIG1pbkNvbnRlbnRXaWR0aDogY3R4Lm9wdGlvbnMubWluQ29udGVudFdpZHRoXG59KTtcbi8vIEFsc28gY2hlY2tzIGZvciBsaW5lcyBzdGFydGluZyB3aXRoICUsIGFzIHBhcnNpbmcgdGhlIG91dHB1dCBhcyBZQU1MIDEuMSB3aWxsXG4vLyBwcmVzdW1lIHRoYXQncyBzdGFydGluZyBhIG5ldyBkb2N1bWVudC5cbmNvbnN0IGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIgPSAoc3RyKSA9PiAvXiglfC0tLXxcXC5cXC5cXC4pL20udGVzdChzdHIpO1xuZnVuY3Rpb24gbGluZUxlbmd0aE92ZXJMaW1pdChzdHIsIGxpbmVXaWR0aCwgaW5kZW50TGVuZ3RoKSB7XG4gICAgaWYgKCFsaW5lV2lkdGggfHwgbGluZVdpZHRoIDwgMClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGxpbWl0ID0gbGluZVdpZHRoIC0gaW5kZW50TGVuZ3RoO1xuICAgIGNvbnN0IHN0ckxlbiA9IHN0ci5sZW5ndGg7XG4gICAgaWYgKHN0ckxlbiA8PSBsaW1pdClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwLCBzdGFydCA9IDA7IGkgPCBzdHJMZW47ICsraSkge1xuICAgICAgICBpZiAoc3RyW2ldID09PSAnXFxuJykge1xuICAgICAgICAgICAgaWYgKGkgLSBzdGFydCA+IGxpbWl0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIGlmIChzdHJMZW4gLSBzdGFydCA8PSBsaW1pdClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5mdW5jdGlvbiBkb3VibGVRdW90ZWRTdHJpbmcodmFsdWUsIGN0eCkge1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgaWYgKGN0eC5vcHRpb25zLmRvdWJsZVF1b3RlZEFzSlNPTilcbiAgICAgICAgcmV0dXJuIGpzb247XG4gICAgY29uc3QgeyBpbXBsaWNpdEtleSB9ID0gY3R4O1xuICAgIGNvbnN0IG1pbk11bHRpTGluZUxlbmd0aCA9IGN0eC5vcHRpb25zLmRvdWJsZVF1b3RlZE1pbk11bHRpTGluZUxlbmd0aDtcbiAgICBjb25zdCBpbmRlbnQgPSBjdHguaW5kZW50IHx8IChjb250YWluc0RvY3VtZW50TWFya2VyKHZhbHVlKSA/ICcgICcgOiAnJyk7XG4gICAgbGV0IHN0ciA9ICcnO1xuICAgIGxldCBzdGFydCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDAsIGNoID0ganNvbltpXTsgY2g7IGNoID0ganNvblsrK2ldKSB7XG4gICAgICAgIGlmIChjaCA9PT0gJyAnICYmIGpzb25baSArIDFdID09PSAnXFxcXCcgJiYganNvbltpICsgMl0gPT09ICduJykge1xuICAgICAgICAgICAgLy8gc3BhY2UgYmVmb3JlIG5ld2xpbmUgbmVlZHMgdG8gYmUgZXNjYXBlZCB0byBub3QgYmUgZm9sZGVkXG4gICAgICAgICAgICBzdHIgKz0ganNvbi5zbGljZShzdGFydCwgaSkgKyAnXFxcXCAnO1xuICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgc3RhcnQgPSBpO1xuICAgICAgICAgICAgY2ggPSAnXFxcXCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnXFxcXCcpXG4gICAgICAgICAgICBzd2l0Y2ggKGpzb25baSArIDFdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAndSc6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSBqc29uLnNsaWNlKHN0YXJ0LCBpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBqc29uLnN1YnN0cihpICsgMiwgNCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMDAwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcMCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwMDcnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxhJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDAwYic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXHYnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMDFiJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwODUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxOJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDBhMCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXF8nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcyMDI4JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcTCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzIwMjknOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxQJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGUuc3Vic3RyKDAsIDIpID09PSAnMDAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxceCcgKyBjb2RlLnN1YnN0cigyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGpzb24uc3Vic3RyKGksIDYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICduJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltcGxpY2l0S2V5IHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uW2kgKyAyXSA9PT0gJ1wiJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbi5sZW5ndGggPCBtaW5NdWx0aUxpbmVMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvbGRpbmcgd2lsbCBlYXQgZmlyc3QgbmV3bGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGpzb24uc2xpY2Uoc3RhcnQsIGkpICsgJ1xcblxcbic7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoanNvbltpICsgMl0gPT09ICdcXFxcJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb25baSArIDNdID09PSAnbicgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uW2kgKyA0XSAhPT0gJ1wiJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxuJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gaW5kZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3BhY2UgYWZ0ZXIgbmV3bGluZSBuZWVkcyB0byBiZSBlc2NhcGVkIHRvIG5vdCBiZSBmb2xkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc29uW2kgKyAyXSA9PT0gJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICB9XG4gICAgc3RyID0gc3RhcnQgPyBzdHIgKyBqc29uLnNsaWNlKHN0YXJ0KSA6IGpzb247XG4gICAgcmV0dXJuIGltcGxpY2l0S2V5XG4gICAgICAgID8gc3RyXG4gICAgICAgIDogZm9sZEZsb3dMaW5lcyhzdHIsIGluZGVudCwgRk9MRF9RVU9URUQsIGdldEZvbGRPcHRpb25zKGN0eCwgZmFsc2UpKTtcbn1cbmZ1bmN0aW9uIHNpbmdsZVF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KSB7XG4gICAgaWYgKGN0eC5vcHRpb25zLnNpbmdsZVF1b3RlID09PSBmYWxzZSB8fFxuICAgICAgICAoY3R4LmltcGxpY2l0S2V5ICYmIHZhbHVlLmluY2x1ZGVzKCdcXG4nKSkgfHxcbiAgICAgICAgL1sgXFx0XVxcbnxcXG5bIFxcdF0vLnRlc3QodmFsdWUpIC8vIHNpbmdsZSBxdW90ZWQgc3RyaW5nIGNhbid0IGhhdmUgbGVhZGluZyBvciB0cmFpbGluZyB3aGl0ZXNwYWNlIGFyb3VuZCBuZXdsaW5lXG4gICAgKVxuICAgICAgICByZXR1cm4gZG91YmxlUXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgIGNvbnN0IGluZGVudCA9IGN0eC5pbmRlbnQgfHwgKGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIodmFsdWUpID8gJyAgJyA6ICcnKTtcbiAgICBjb25zdCByZXMgPSBcIidcIiArIHZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKS5yZXBsYWNlKC9cXG4rL2csIGAkJlxcbiR7aW5kZW50fWApICsgXCInXCI7XG4gICAgcmV0dXJuIGN0eC5pbXBsaWNpdEtleVxuICAgICAgICA/IHJlc1xuICAgICAgICA6IGZvbGRGbG93TGluZXMocmVzLCBpbmRlbnQsIEZPTERfRkxPVywgZ2V0Rm9sZE9wdGlvbnMoY3R4LCBmYWxzZSkpO1xufVxuZnVuY3Rpb24gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpIHtcbiAgICBjb25zdCB7IHNpbmdsZVF1b3RlIH0gPSBjdHgub3B0aW9ucztcbiAgICBsZXQgcXM7XG4gICAgaWYgKHNpbmdsZVF1b3RlID09PSBmYWxzZSlcbiAgICAgICAgcXMgPSBkb3VibGVRdW90ZWRTdHJpbmc7XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGhhc0RvdWJsZSA9IHZhbHVlLmluY2x1ZGVzKCdcIicpO1xuICAgICAgICBjb25zdCBoYXNTaW5nbGUgPSB2YWx1ZS5pbmNsdWRlcyhcIidcIik7XG4gICAgICAgIGlmIChoYXNEb3VibGUgJiYgIWhhc1NpbmdsZSlcbiAgICAgICAgICAgIHFzID0gc2luZ2xlUXVvdGVkU3RyaW5nO1xuICAgICAgICBlbHNlIGlmIChoYXNTaW5nbGUgJiYgIWhhc0RvdWJsZSlcbiAgICAgICAgICAgIHFzID0gZG91YmxlUXVvdGVkU3RyaW5nO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBxcyA9IHNpbmdsZVF1b3RlID8gc2luZ2xlUXVvdGVkU3RyaW5nIDogZG91YmxlUXVvdGVkU3RyaW5nO1xuICAgIH1cbiAgICByZXR1cm4gcXModmFsdWUsIGN0eCk7XG59XG4vLyBUaGUgbmVnYXRpdmUgbG9va2JlaGluZCBhdm9pZHMgYSBwb2x5bm9taWFsIHNlYXJjaCxcbi8vIGJ1dCBpc24ndCBzdXBwb3J0ZWQgeWV0IG9uIFNhZmFyaTogaHR0cHM6Ly9jYW5pdXNlLmNvbS9qcy1yZWdleHAtbG9va2JlaGluZFxubGV0IGJsb2NrRW5kTmV3bGluZXM7XG50cnkge1xuICAgIGJsb2NrRW5kTmV3bGluZXMgPSBuZXcgUmVnRXhwKCcoXnwoPzwhXFxuKSlcXG4rKD8hXFxufCQpJywgJ2cnKTtcbn1cbmNhdGNoIHtcbiAgICBibG9ja0VuZE5ld2xpbmVzID0gL1xcbisoPyFcXG58JCkvZztcbn1cbmZ1bmN0aW9uIGJsb2NrU3RyaW5nKHsgY29tbWVudCwgdHlwZSwgdmFsdWUgfSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgY29uc3QgeyBibG9ja1F1b3RlLCBjb21tZW50U3RyaW5nLCBsaW5lV2lkdGggfSA9IGN0eC5vcHRpb25zO1xuICAgIC8vIDEuIEJsb2NrIGNhbid0IGVuZCBpbiB3aGl0ZXNwYWNlIHVubGVzcyB0aGUgbGFzdCBsaW5lIGlzIG5vbi1lbXB0eS5cbiAgICAvLyAyLiBTdHJpbmdzIGNvbnNpc3Rpbmcgb2Ygb25seSB3aGl0ZXNwYWNlIGFyZSBiZXN0IHJlbmRlcmVkIGV4cGxpY2l0bHkuXG4gICAgaWYgKCFibG9ja1F1b3RlIHx8IC9cXG5bXFx0IF0rJC8udGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KTtcbiAgICB9XG4gICAgY29uc3QgaW5kZW50ID0gY3R4LmluZGVudCB8fFxuICAgICAgICAoY3R4LmZvcmNlQmxvY2tJbmRlbnQgfHwgY29udGFpbnNEb2N1bWVudE1hcmtlcih2YWx1ZSkgPyAnICAnIDogJycpO1xuICAgIGNvbnN0IGxpdGVyYWwgPSBibG9ja1F1b3RlID09PSAnbGl0ZXJhbCdcbiAgICAgICAgPyB0cnVlXG4gICAgICAgIDogYmxvY2tRdW90ZSA9PT0gJ2ZvbGRlZCcgfHwgdHlwZSA9PT0gU2NhbGFyLkJMT0NLX0ZPTERFRFxuICAgICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgOiB0eXBlID09PSBTY2FsYXIuQkxPQ0tfTElURVJBTFxuICAgICAgICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgICAgIDogIWxpbmVMZW5ndGhPdmVyTGltaXQodmFsdWUsIGxpbmVXaWR0aCwgaW5kZW50Lmxlbmd0aCk7XG4gICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgcmV0dXJuIGxpdGVyYWwgPyAnfFxcbicgOiAnPlxcbic7XG4gICAgLy8gZGV0ZXJtaW5lIGNob21waW5nIGZyb20gd2hpdGVzcGFjZSBhdCB2YWx1ZSBlbmRcbiAgICBsZXQgY2hvbXA7XG4gICAgbGV0IGVuZFN0YXJ0O1xuICAgIGZvciAoZW5kU3RhcnQgPSB2YWx1ZS5sZW5ndGg7IGVuZFN0YXJ0ID4gMDsgLS1lbmRTdGFydCkge1xuICAgICAgICBjb25zdCBjaCA9IHZhbHVlW2VuZFN0YXJ0IC0gMV07XG4gICAgICAgIGlmIChjaCAhPT0gJ1xcbicgJiYgY2ggIT09ICdcXHQnICYmIGNoICE9PSAnICcpXG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgbGV0IGVuZCA9IHZhbHVlLnN1YnN0cmluZyhlbmRTdGFydCk7XG4gICAgY29uc3QgZW5kTmxQb3MgPSBlbmQuaW5kZXhPZignXFxuJyk7XG4gICAgaWYgKGVuZE5sUG9zID09PSAtMSkge1xuICAgICAgICBjaG9tcCA9ICctJzsgLy8gc3RyaXBcbiAgICB9XG4gICAgZWxzZSBpZiAodmFsdWUgPT09IGVuZCB8fCBlbmRObFBvcyAhPT0gZW5kLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgY2hvbXAgPSAnKyc7IC8vIGtlZXBcbiAgICAgICAgaWYgKG9uQ2hvbXBLZWVwKVxuICAgICAgICAgICAgb25DaG9tcEtlZXAoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNob21wID0gJyc7IC8vIGNsaXBcbiAgICB9XG4gICAgaWYgKGVuZCkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDAsIC1lbmQubGVuZ3RoKTtcbiAgICAgICAgaWYgKGVuZFtlbmQubGVuZ3RoIC0gMV0gPT09ICdcXG4nKVxuICAgICAgICAgICAgZW5kID0gZW5kLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgZW5kID0gZW5kLnJlcGxhY2UoYmxvY2tFbmROZXdsaW5lcywgYCQmJHtpbmRlbnR9YCk7XG4gICAgfVxuICAgIC8vIGRldGVybWluZSBpbmRlbnQgaW5kaWNhdG9yIGZyb20gd2hpdGVzcGFjZSBhdCB2YWx1ZSBzdGFydFxuICAgIGxldCBzdGFydFdpdGhTcGFjZSA9IGZhbHNlO1xuICAgIGxldCBzdGFydEVuZDtcbiAgICBsZXQgc3RhcnRObFBvcyA9IC0xO1xuICAgIGZvciAoc3RhcnRFbmQgPSAwOyBzdGFydEVuZCA8IHZhbHVlLmxlbmd0aDsgKytzdGFydEVuZCkge1xuICAgICAgICBjb25zdCBjaCA9IHZhbHVlW3N0YXJ0RW5kXTtcbiAgICAgICAgaWYgKGNoID09PSAnICcpXG4gICAgICAgICAgICBzdGFydFdpdGhTcGFjZSA9IHRydWU7XG4gICAgICAgIGVsc2UgaWYgKGNoID09PSAnXFxuJylcbiAgICAgICAgICAgIHN0YXJ0TmxQb3MgPSBzdGFydEVuZDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGxldCBzdGFydCA9IHZhbHVlLnN1YnN0cmluZygwLCBzdGFydE5sUG9zIDwgc3RhcnRFbmQgPyBzdGFydE5sUG9zICsgMSA6IHN0YXJ0RW5kKTtcbiAgICBpZiAoc3RhcnQpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoc3RhcnQubGVuZ3RoKTtcbiAgICAgICAgc3RhcnQgPSBzdGFydC5yZXBsYWNlKC9cXG4rL2csIGAkJiR7aW5kZW50fWApO1xuICAgIH1cbiAgICBjb25zdCBpbmRlbnRTaXplID0gaW5kZW50ID8gJzInIDogJzEnOyAvLyByb290IGlzIGF0IC0xXG4gICAgLy8gTGVhZGluZyB8IG9yID4gaXMgYWRkZWQgbGF0ZXJcbiAgICBsZXQgaGVhZGVyID0gKHN0YXJ0V2l0aFNwYWNlID8gaW5kZW50U2l6ZSA6ICcnKSArIGNob21wO1xuICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgIGhlYWRlciArPSAnICcgKyBjb21tZW50U3RyaW5nKGNvbW1lbnQucmVwbGFjZSgvID9bXFxyXFxuXSsvZywgJyAnKSk7XG4gICAgICAgIGlmIChvbkNvbW1lbnQpXG4gICAgICAgICAgICBvbkNvbW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKCFsaXRlcmFsKSB7XG4gICAgICAgIGNvbnN0IGZvbGRlZFZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4rL2csICdcXG4kJicpXG4gICAgICAgICAgICAucmVwbGFjZSgvKD86XnxcXG4pKFtcXHQgXS4qKSg/OihbXFxuXFx0IF0qKVxcbig/IVtcXG5cXHQgXSkpPy9nLCAnJDEkMicpIC8vIG1vcmUtaW5kZW50ZWQgbGluZXMgYXJlbid0IGZvbGRlZFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgXiBtb3JlLWluZC4gXiBlbXB0eSAgICAgXiBjYXB0dXJlIG5leHQgZW1wdHkgbGluZXMgb25seSBhdCBlbmQgb2YgaW5kZW50XG4gICAgICAgICAgICAucmVwbGFjZSgvXFxuKy9nLCBgJCYke2luZGVudH1gKTtcbiAgICAgICAgbGV0IGxpdGVyYWxGYWxsYmFjayA9IGZhbHNlO1xuICAgICAgICBjb25zdCBmb2xkT3B0aW9ucyA9IGdldEZvbGRPcHRpb25zKGN0eCwgdHJ1ZSk7XG4gICAgICAgIGlmIChibG9ja1F1b3RlICE9PSAnZm9sZGVkJyAmJiB0eXBlICE9PSBTY2FsYXIuQkxPQ0tfRk9MREVEKSB7XG4gICAgICAgICAgICBmb2xkT3B0aW9ucy5vbk92ZXJmbG93ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxpdGVyYWxGYWxsYmFjayA9IHRydWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJvZHkgPSBmb2xkRmxvd0xpbmVzKGAke3N0YXJ0fSR7Zm9sZGVkVmFsdWV9JHtlbmR9YCwgaW5kZW50LCBGT0xEX0JMT0NLLCBmb2xkT3B0aW9ucyk7XG4gICAgICAgIGlmICghbGl0ZXJhbEZhbGxiYWNrKVxuICAgICAgICAgICAgcmV0dXJuIGA+JHtoZWFkZXJ9XFxuJHtpbmRlbnR9JHtib2R5fWA7XG4gICAgfVxuICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFxuKy9nLCBgJCYke2luZGVudH1gKTtcbiAgICByZXR1cm4gYHwke2hlYWRlcn1cXG4ke2luZGVudH0ke3N0YXJ0fSR7dmFsdWV9JHtlbmR9YDtcbn1cbmZ1bmN0aW9uIHBsYWluU3RyaW5nKGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGNvbnN0IHsgdHlwZSwgdmFsdWUgfSA9IGl0ZW07XG4gICAgY29uc3QgeyBhY3R1YWxTdHJpbmcsIGltcGxpY2l0S2V5LCBpbmRlbnQsIGluZGVudFN0ZXAsIGluRmxvdyB9ID0gY3R4O1xuICAgIGlmICgoaW1wbGljaXRLZXkgJiYgdmFsdWUuaW5jbHVkZXMoJ1xcbicpKSB8fFxuICAgICAgICAoaW5GbG93ICYmIC9bW1xcXXt9LF0vLnRlc3QodmFsdWUpKSkge1xuICAgICAgICByZXR1cm4gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgIH1cbiAgICBpZiAoL15bXFxuXFx0ICxbXFxde30jJiohfD4nXCIlQGBdfF5bPy1dJHxeWz8tXVsgXFx0XXxbXFxuOl1bIFxcdF18WyBcXHRdXFxufFtcXG5cXHQgXSN8W1xcblxcdCA6XSQvLnRlc3QodmFsdWUpKSB7XG4gICAgICAgIC8vIG5vdCBhbGxvd2VkOlxuICAgICAgICAvLyAtICctJyBvciAnPydcbiAgICAgICAgLy8gLSBzdGFydCB3aXRoIGFuIGluZGljYXRvciBjaGFyYWN0ZXIgKGV4Y2VwdCBbPzotXSkgb3IgL1s/LV0gL1xuICAgICAgICAvLyAtICdcXG4gJywgJzogJyBvciAnIFxcbicgYW55d2hlcmVcbiAgICAgICAgLy8gLSAnIycgbm90IHByZWNlZGVkIGJ5IGEgbm9uLXNwYWNlIGNoYXJcbiAgICAgICAgLy8gLSBlbmQgd2l0aCAnICcgb3IgJzonXG4gICAgICAgIHJldHVybiBpbXBsaWNpdEtleSB8fCBpbkZsb3cgfHwgIXZhbHVlLmluY2x1ZGVzKCdcXG4nKVxuICAgICAgICAgICAgPyBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eClcbiAgICAgICAgICAgIDogYmxvY2tTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICB9XG4gICAgaWYgKCFpbXBsaWNpdEtleSAmJlxuICAgICAgICAhaW5GbG93ICYmXG4gICAgICAgIHR5cGUgIT09IFNjYWxhci5QTEFJTiAmJlxuICAgICAgICB2YWx1ZS5pbmNsdWRlcygnXFxuJykpIHtcbiAgICAgICAgLy8gV2hlcmUgYWxsb3dlZCAmIHR5cGUgbm90IHNldCBleHBsaWNpdGx5LCBwcmVmZXIgYmxvY2sgc3R5bGUgZm9yIG11bHRpbGluZSBzdHJpbmdzXG4gICAgICAgIHJldHVybiBibG9ja1N0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIH1cbiAgICBpZiAoY29udGFpbnNEb2N1bWVudE1hcmtlcih2YWx1ZSkpIHtcbiAgICAgICAgaWYgKGluZGVudCA9PT0gJycpIHtcbiAgICAgICAgICAgIGN0eC5mb3JjZUJsb2NrSW5kZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBibG9ja1N0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGltcGxpY2l0S2V5ICYmIGluZGVudCA9PT0gaW5kZW50U3RlcCkge1xuICAgICAgICAgICAgcmV0dXJuIHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBzdHIgPSB2YWx1ZS5yZXBsYWNlKC9cXG4rL2csIGAkJlxcbiR7aW5kZW50fWApO1xuICAgIC8vIFZlcmlmeSB0aGF0IG91dHB1dCB3aWxsIGJlIHBhcnNlZCBhcyBhIHN0cmluZywgYXMgZS5nLiBwbGFpbiBudW1iZXJzIGFuZFxuICAgIC8vIGJvb2xlYW5zIGdldCBwYXJzZWQgd2l0aCB0aG9zZSB0eXBlcyBpbiB2MS4yIChlLmcuICc0MicsICd0cnVlJyAmICcwLjllLTMnKSxcbiAgICAvLyBhbmQgb3RoZXJzIGluIHYxLjEuXG4gICAgaWYgKGFjdHVhbFN0cmluZykge1xuICAgICAgICBjb25zdCB0ZXN0ID0gKHRhZykgPT4gdGFnLmRlZmF1bHQgJiYgdGFnLnRhZyAhPT0gJ3RhZzp5YW1sLm9yZywyMDAyOnN0cicgJiYgdGFnLnRlc3Q/LnRlc3Qoc3RyKTtcbiAgICAgICAgY29uc3QgeyBjb21wYXQsIHRhZ3MgfSA9IGN0eC5kb2Muc2NoZW1hO1xuICAgICAgICBpZiAodGFncy5zb21lKHRlc3QpIHx8IGNvbXBhdD8uc29tZSh0ZXN0KSlcbiAgICAgICAgICAgIHJldHVybiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgfVxuICAgIHJldHVybiBpbXBsaWNpdEtleVxuICAgICAgICA/IHN0clxuICAgICAgICA6IGZvbGRGbG93TGluZXMoc3RyLCBpbmRlbnQsIEZPTERfRkxPVywgZ2V0Rm9sZE9wdGlvbnMoY3R4LCBmYWxzZSkpO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5U3RyaW5nKGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGNvbnN0IHsgaW1wbGljaXRLZXksIGluRmxvdyB9ID0gY3R4O1xuICAgIGNvbnN0IHNzID0gdHlwZW9mIGl0ZW0udmFsdWUgPT09ICdzdHJpbmcnXG4gICAgICAgID8gaXRlbVxuICAgICAgICA6IE9iamVjdC5hc3NpZ24oe30sIGl0ZW0sIHsgdmFsdWU6IFN0cmluZyhpdGVtLnZhbHVlKSB9KTtcbiAgICBsZXQgeyB0eXBlIH0gPSBpdGVtO1xuICAgIGlmICh0eXBlICE9PSBTY2FsYXIuUVVPVEVfRE9VQkxFKSB7XG4gICAgICAgIC8vIGZvcmNlIGRvdWJsZSBxdW90ZXMgb24gY29udHJvbCBjaGFyYWN0ZXJzICYgdW5wYWlyZWQgc3Vycm9nYXRlc1xuICAgICAgICBpZiAoL1tcXHgwMC1cXHgwOFxceDBiLVxceDFmXFx4N2YtXFx4OWZcXHV7RDgwMH0tXFx1e0RGRkZ9XS91LnRlc3Qoc3MudmFsdWUpKVxuICAgICAgICAgICAgdHlwZSA9IFNjYWxhci5RVU9URV9ET1VCTEU7XG4gICAgfVxuICAgIGNvbnN0IF9zdHJpbmdpZnkgPSAoX3R5cGUpID0+IHtcbiAgICAgICAgc3dpdGNoIChfdHlwZSkge1xuICAgICAgICAgICAgY2FzZSBTY2FsYXIuQkxPQ0tfRk9MREVEOlxuICAgICAgICAgICAgY2FzZSBTY2FsYXIuQkxPQ0tfTElURVJBTDpcbiAgICAgICAgICAgICAgICByZXR1cm4gaW1wbGljaXRLZXkgfHwgaW5GbG93XG4gICAgICAgICAgICAgICAgICAgID8gcXVvdGVkU3RyaW5nKHNzLnZhbHVlLCBjdHgpIC8vIGJsb2NrcyBhcmUgbm90IHZhbGlkIGluc2lkZSBmbG93IGNvbnRhaW5lcnNcbiAgICAgICAgICAgICAgICAgICAgOiBibG9ja1N0cmluZyhzcywgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLlFVT1RFX0RPVUJMRTpcbiAgICAgICAgICAgICAgICByZXR1cm4gZG91YmxlUXVvdGVkU3RyaW5nKHNzLnZhbHVlLCBjdHgpO1xuICAgICAgICAgICAgY2FzZSBTY2FsYXIuUVVPVEVfU0lOR0xFOlxuICAgICAgICAgICAgICAgIHJldHVybiBzaW5nbGVRdW90ZWRTdHJpbmcoc3MudmFsdWUsIGN0eCk7XG4gICAgICAgICAgICBjYXNlIFNjYWxhci5QTEFJTjpcbiAgICAgICAgICAgICAgICByZXR1cm4gcGxhaW5TdHJpbmcoc3MsIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBsZXQgcmVzID0gX3N0cmluZ2lmeSh0eXBlKTtcbiAgICBpZiAocmVzID09PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHsgZGVmYXVsdEtleVR5cGUsIGRlZmF1bHRTdHJpbmdUeXBlIH0gPSBjdHgub3B0aW9ucztcbiAgICAgICAgY29uc3QgdCA9IChpbXBsaWNpdEtleSAmJiBkZWZhdWx0S2V5VHlwZSkgfHwgZGVmYXVsdFN0cmluZ1R5cGU7XG4gICAgICAgIHJlcyA9IF9zdHJpbmdpZnkodCk7XG4gICAgICAgIGlmIChyZXMgPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGRlZmF1bHQgc3RyaW5nIHR5cGUgJHt0fWApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG5leHBvcnQgeyBzdHJpbmdpZnlTdHJpbmcgfTtcbiIsICJpbXBvcnQgeyBhbmNob3JJc1ZhbGlkIH0gZnJvbSAnLi4vZG9jL2FuY2hvcnMuanMnO1xuaW1wb3J0IHsgaXNQYWlyLCBpc0FsaWFzLCBpc05vZGUsIGlzU2NhbGFyLCBpc0NvbGxlY3Rpb24gfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnlDb21tZW50IH0gZnJvbSAnLi9zdHJpbmdpZnlDb21tZW50LmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeVN0cmluZyB9IGZyb20gJy4vc3RyaW5naWZ5U3RyaW5nLmpzJztcblxuZnVuY3Rpb24gY3JlYXRlU3RyaW5naWZ5Q29udGV4dChkb2MsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBvcHQgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgYmxvY2tRdW90ZTogdHJ1ZSxcbiAgICAgICAgY29tbWVudFN0cmluZzogc3RyaW5naWZ5Q29tbWVudCxcbiAgICAgICAgZGVmYXVsdEtleVR5cGU6IG51bGwsXG4gICAgICAgIGRlZmF1bHRTdHJpbmdUeXBlOiAnUExBSU4nLFxuICAgICAgICBkaXJlY3RpdmVzOiBudWxsLFxuICAgICAgICBkb3VibGVRdW90ZWRBc0pTT046IGZhbHNlLFxuICAgICAgICBkb3VibGVRdW90ZWRNaW5NdWx0aUxpbmVMZW5ndGg6IDQwLFxuICAgICAgICBmYWxzZVN0cjogJ2ZhbHNlJyxcbiAgICAgICAgZmxvd0NvbGxlY3Rpb25QYWRkaW5nOiB0cnVlLFxuICAgICAgICBpbmRlbnRTZXE6IHRydWUsXG4gICAgICAgIGxpbmVXaWR0aDogODAsXG4gICAgICAgIG1pbkNvbnRlbnRXaWR0aDogMjAsXG4gICAgICAgIG51bGxTdHI6ICdudWxsJyxcbiAgICAgICAgc2ltcGxlS2V5czogZmFsc2UsXG4gICAgICAgIHNpbmdsZVF1b3RlOiBudWxsLFxuICAgICAgICB0cmFpbGluZ0NvbW1hOiBmYWxzZSxcbiAgICAgICAgdHJ1ZVN0cjogJ3RydWUnLFxuICAgICAgICB2ZXJpZnlBbGlhc09yZGVyOiB0cnVlXG4gICAgfSwgZG9jLnNjaGVtYS50b1N0cmluZ09wdGlvbnMsIG9wdGlvbnMpO1xuICAgIGxldCBpbkZsb3c7XG4gICAgc3dpdGNoIChvcHQuY29sbGVjdGlvblN0eWxlKSB7XG4gICAgICAgIGNhc2UgJ2Jsb2NrJzpcbiAgICAgICAgICAgIGluRmxvdyA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Zsb3cnOlxuICAgICAgICAgICAgaW5GbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaW5GbG93ID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYW5jaG9yczogbmV3IFNldCgpLFxuICAgICAgICBkb2MsXG4gICAgICAgIGZsb3dDb2xsZWN0aW9uUGFkZGluZzogb3B0LmZsb3dDb2xsZWN0aW9uUGFkZGluZyA/ICcgJyA6ICcnLFxuICAgICAgICBpbmRlbnQ6ICcnLFxuICAgICAgICBpbmRlbnRTdGVwOiB0eXBlb2Ygb3B0LmluZGVudCA9PT0gJ251bWJlcicgPyAnICcucmVwZWF0KG9wdC5pbmRlbnQpIDogJyAgJyxcbiAgICAgICAgaW5GbG93LFxuICAgICAgICBvcHRpb25zOiBvcHRcbiAgICB9O1xufVxuZnVuY3Rpb24gZ2V0VGFnT2JqZWN0KHRhZ3MsIGl0ZW0pIHtcbiAgICBpZiAoaXRlbS50YWcpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB0YWdzLmZpbHRlcih0ID0+IHQudGFnID09PSBpdGVtLnRhZyk7XG4gICAgICAgIGlmIChtYXRjaC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoLmZpbmQodCA9PiB0LmZvcm1hdCA9PT0gaXRlbS5mb3JtYXQpID8/IG1hdGNoWzBdO1xuICAgIH1cbiAgICBsZXQgdGFnT2JqID0gdW5kZWZpbmVkO1xuICAgIGxldCBvYmo7XG4gICAgaWYgKGlzU2NhbGFyKGl0ZW0pKSB7XG4gICAgICAgIG9iaiA9IGl0ZW0udmFsdWU7XG4gICAgICAgIGxldCBtYXRjaCA9IHRhZ3MuZmlsdGVyKHQgPT4gdC5pZGVudGlmeT8uKG9iaikpO1xuICAgICAgICBpZiAobWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgY29uc3QgdGVzdE1hdGNoID0gbWF0Y2guZmlsdGVyKHQgPT4gdC50ZXN0KTtcbiAgICAgICAgICAgIGlmICh0ZXN0TWF0Y2gubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICBtYXRjaCA9IHRlc3RNYXRjaDtcbiAgICAgICAgfVxuICAgICAgICB0YWdPYmogPVxuICAgICAgICAgICAgbWF0Y2guZmluZCh0ID0+IHQuZm9ybWF0ID09PSBpdGVtLmZvcm1hdCkgPz8gbWF0Y2guZmluZCh0ID0+ICF0LmZvcm1hdCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBvYmogPSBpdGVtO1xuICAgICAgICB0YWdPYmogPSB0YWdzLmZpbmQodCA9PiB0Lm5vZGVDbGFzcyAmJiBvYmogaW5zdGFuY2VvZiB0Lm5vZGVDbGFzcyk7XG4gICAgfVxuICAgIGlmICghdGFnT2JqKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBvYmo/LmNvbnN0cnVjdG9yPy5uYW1lID8/IChvYmogPT09IG51bGwgPyAnbnVsbCcgOiB0eXBlb2Ygb2JqKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUYWcgbm90IHJlc29sdmVkIGZvciAke25hbWV9IHZhbHVlYCk7XG4gICAgfVxuICAgIHJldHVybiB0YWdPYmo7XG59XG4vLyBuZWVkcyB0byBiZSBjYWxsZWQgYmVmb3JlIHZhbHVlIHN0cmluZ2lmaWVyIHRvIGFsbG93IGZvciBjaXJjdWxhciBhbmNob3IgcmVmc1xuZnVuY3Rpb24gc3RyaW5naWZ5UHJvcHMobm9kZSwgdGFnT2JqLCB7IGFuY2hvcnMsIGRvYyB9KSB7XG4gICAgaWYgKCFkb2MuZGlyZWN0aXZlcylcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIGNvbnN0IHByb3BzID0gW107XG4gICAgY29uc3QgYW5jaG9yID0gKGlzU2NhbGFyKG5vZGUpIHx8IGlzQ29sbGVjdGlvbihub2RlKSkgJiYgbm9kZS5hbmNob3I7XG4gICAgaWYgKGFuY2hvciAmJiBhbmNob3JJc1ZhbGlkKGFuY2hvcikpIHtcbiAgICAgICAgYW5jaG9ycy5hZGQoYW5jaG9yKTtcbiAgICAgICAgcHJvcHMucHVzaChgJiR7YW5jaG9yfWApO1xuICAgIH1cbiAgICBjb25zdCB0YWcgPSBub2RlLnRhZyA/PyAodGFnT2JqLmRlZmF1bHQgPyBudWxsIDogdGFnT2JqLnRhZyk7XG4gICAgaWYgKHRhZylcbiAgICAgICAgcHJvcHMucHVzaChkb2MuZGlyZWN0aXZlcy50YWdTdHJpbmcodGFnKSk7XG4gICAgcmV0dXJuIHByb3BzLmpvaW4oJyAnKTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeShpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBpZiAoaXNQYWlyKGl0ZW0pKVxuICAgICAgICByZXR1cm4gaXRlbS50b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIGlmIChpc0FsaWFzKGl0ZW0pKSB7XG4gICAgICAgIGlmIChjdHguZG9jLmRpcmVjdGl2ZXMpXG4gICAgICAgICAgICByZXR1cm4gaXRlbS50b1N0cmluZyhjdHgpO1xuICAgICAgICBpZiAoY3R4LnJlc29sdmVkQWxpYXNlcz8uaGFzKGl0ZW0pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBDYW5ub3Qgc3RyaW5naWZ5IGNpcmN1bGFyIHN0cnVjdHVyZSB3aXRob3V0IGFsaWFzIG5vZGVzYCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoY3R4LnJlc29sdmVkQWxpYXNlcylcbiAgICAgICAgICAgICAgICBjdHgucmVzb2x2ZWRBbGlhc2VzLmFkZChpdGVtKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjdHgucmVzb2x2ZWRBbGlhc2VzID0gbmV3IFNldChbaXRlbV0pO1xuICAgICAgICAgICAgaXRlbSA9IGl0ZW0ucmVzb2x2ZShjdHguZG9jKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgdGFnT2JqID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IG5vZGUgPSBpc05vZGUoaXRlbSlcbiAgICAgICAgPyBpdGVtXG4gICAgICAgIDogY3R4LmRvYy5jcmVhdGVOb2RlKGl0ZW0sIHsgb25UYWdPYmo6IG8gPT4gKHRhZ09iaiA9IG8pIH0pO1xuICAgIHRhZ09iaiA/PyAodGFnT2JqID0gZ2V0VGFnT2JqZWN0KGN0eC5kb2Muc2NoZW1hLnRhZ3MsIG5vZGUpKTtcbiAgICBjb25zdCBwcm9wcyA9IHN0cmluZ2lmeVByb3BzKG5vZGUsIHRhZ09iaiwgY3R4KTtcbiAgICBpZiAocHJvcHMubGVuZ3RoID4gMClcbiAgICAgICAgY3R4LmluZGVudEF0U3RhcnQgPSAoY3R4LmluZGVudEF0U3RhcnQgPz8gMCkgKyBwcm9wcy5sZW5ndGggKyAxO1xuICAgIGNvbnN0IHN0ciA9IHR5cGVvZiB0YWdPYmouc3RyaW5naWZ5ID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gdGFnT2JqLnN0cmluZ2lmeShub2RlLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApXG4gICAgICAgIDogaXNTY2FsYXIobm9kZSlcbiAgICAgICAgICAgID8gc3RyaW5naWZ5U3RyaW5nKG5vZGUsIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcClcbiAgICAgICAgICAgIDogbm9kZS50b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIGlmICghcHJvcHMpXG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgcmV0dXJuIGlzU2NhbGFyKG5vZGUpIHx8IHN0clswXSA9PT0gJ3snIHx8IHN0clswXSA9PT0gJ1snXG4gICAgICAgID8gYCR7cHJvcHN9ICR7c3RyfWBcbiAgICAgICAgOiBgJHtwcm9wc31cXG4ke2N0eC5pbmRlbnR9JHtzdHJ9YDtcbn1cblxuZXhwb3J0IHsgY3JlYXRlU3RyaW5naWZ5Q29udGV4dCwgc3RyaW5naWZ5IH07XG4iLCAiaW1wb3J0IHsgaXNDb2xsZWN0aW9uLCBpc05vZGUsIGlzU2NhbGFyLCBpc1NlcSB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnkgfSBmcm9tICcuL3N0cmluZ2lmeS5qcyc7XG5pbXBvcnQgeyBsaW5lQ29tbWVudCwgaW5kZW50Q29tbWVudCB9IGZyb20gJy4vc3RyaW5naWZ5Q29tbWVudC5qcyc7XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeVBhaXIoeyBrZXksIHZhbHVlIH0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGNvbnN0IHsgYWxsTnVsbFZhbHVlcywgZG9jLCBpbmRlbnQsIGluZGVudFN0ZXAsIG9wdGlvbnM6IHsgY29tbWVudFN0cmluZywgaW5kZW50U2VxLCBzaW1wbGVLZXlzIH0gfSA9IGN0eDtcbiAgICBsZXQga2V5Q29tbWVudCA9IChpc05vZGUoa2V5KSAmJiBrZXkuY29tbWVudCkgfHwgbnVsbDtcbiAgICBpZiAoc2ltcGxlS2V5cykge1xuICAgICAgICBpZiAoa2V5Q29tbWVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXaXRoIHNpbXBsZSBrZXlzLCBrZXkgbm9kZXMgY2Fubm90IGhhdmUgY29tbWVudHMnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNDb2xsZWN0aW9uKGtleSkgfHwgKCFpc05vZGUoa2V5KSAmJiB0eXBlb2Yga2V5ID09PSAnb2JqZWN0JykpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9ICdXaXRoIHNpbXBsZSBrZXlzLCBjb2xsZWN0aW9uIGNhbm5vdCBiZSB1c2VkIGFzIGEga2V5IHZhbHVlJztcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGxldCBleHBsaWNpdEtleSA9ICFzaW1wbGVLZXlzICYmXG4gICAgICAgICgha2V5IHx8XG4gICAgICAgICAgICAoa2V5Q29tbWVudCAmJiB2YWx1ZSA9PSBudWxsICYmICFjdHguaW5GbG93KSB8fFxuICAgICAgICAgICAgaXNDb2xsZWN0aW9uKGtleSkgfHxcbiAgICAgICAgICAgIChpc1NjYWxhcihrZXkpXG4gICAgICAgICAgICAgICAgPyBrZXkudHlwZSA9PT0gU2NhbGFyLkJMT0NLX0ZPTERFRCB8fCBrZXkudHlwZSA9PT0gU2NhbGFyLkJMT0NLX0xJVEVSQUxcbiAgICAgICAgICAgICAgICA6IHR5cGVvZiBrZXkgPT09ICdvYmplY3QnKSk7XG4gICAgY3R4ID0gT2JqZWN0LmFzc2lnbih7fSwgY3R4LCB7XG4gICAgICAgIGFsbE51bGxWYWx1ZXM6IGZhbHNlLFxuICAgICAgICBpbXBsaWNpdEtleTogIWV4cGxpY2l0S2V5ICYmIChzaW1wbGVLZXlzIHx8ICFhbGxOdWxsVmFsdWVzKSxcbiAgICAgICAgaW5kZW50OiBpbmRlbnQgKyBpbmRlbnRTdGVwXG4gICAgfSk7XG4gICAgbGV0IGtleUNvbW1lbnREb25lID0gZmFsc2U7XG4gICAgbGV0IGNob21wS2VlcCA9IGZhbHNlO1xuICAgIGxldCBzdHIgPSBzdHJpbmdpZnkoa2V5LCBjdHgsICgpID0+IChrZXlDb21tZW50RG9uZSA9IHRydWUpLCAoKSA9PiAoY2hvbXBLZWVwID0gdHJ1ZSkpO1xuICAgIGlmICghZXhwbGljaXRLZXkgJiYgIWN0eC5pbkZsb3cgJiYgc3RyLmxlbmd0aCA+IDEwMjQpIHtcbiAgICAgICAgaWYgKHNpbXBsZUtleXMpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dpdGggc2ltcGxlIGtleXMsIHNpbmdsZSBsaW5lIHNjYWxhciBtdXN0IG5vdCBzcGFuIG1vcmUgdGhhbiAxMDI0IGNoYXJhY3RlcnMnKTtcbiAgICAgICAgZXhwbGljaXRLZXkgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoY3R4LmluRmxvdykge1xuICAgICAgICBpZiAoYWxsTnVsbFZhbHVlcyB8fCB2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoa2V5Q29tbWVudERvbmUgJiYgb25Db21tZW50KVxuICAgICAgICAgICAgICAgIG9uQ29tbWVudCgpO1xuICAgICAgICAgICAgcmV0dXJuIHN0ciA9PT0gJycgPyAnPycgOiBleHBsaWNpdEtleSA/IGA/ICR7c3RyfWAgOiBzdHI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoKGFsbE51bGxWYWx1ZXMgJiYgIXNpbXBsZUtleXMpIHx8ICh2YWx1ZSA9PSBudWxsICYmIGV4cGxpY2l0S2V5KSkge1xuICAgICAgICBzdHIgPSBgPyAke3N0cn1gO1xuICAgICAgICBpZiAoa2V5Q29tbWVudCAmJiAha2V5Q29tbWVudERvbmUpIHtcbiAgICAgICAgICAgIHN0ciArPSBsaW5lQ29tbWVudChzdHIsIGN0eC5pbmRlbnQsIGNvbW1lbnRTdHJpbmcoa2V5Q29tbWVudCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNob21wS2VlcCAmJiBvbkNob21wS2VlcClcbiAgICAgICAgICAgIG9uQ2hvbXBLZWVwKCk7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIGlmIChrZXlDb21tZW50RG9uZSlcbiAgICAgICAga2V5Q29tbWVudCA9IG51bGw7XG4gICAgaWYgKGV4cGxpY2l0S2V5KSB7XG4gICAgICAgIGlmIChrZXlDb21tZW50KVxuICAgICAgICAgICAgc3RyICs9IGxpbmVDb21tZW50KHN0ciwgY3R4LmluZGVudCwgY29tbWVudFN0cmluZyhrZXlDb21tZW50KSk7XG4gICAgICAgIHN0ciA9IGA/ICR7c3RyfVxcbiR7aW5kZW50fTpgO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc3RyID0gYCR7c3RyfTpgO1xuICAgICAgICBpZiAoa2V5Q29tbWVudClcbiAgICAgICAgICAgIHN0ciArPSBsaW5lQ29tbWVudChzdHIsIGN0eC5pbmRlbnQsIGNvbW1lbnRTdHJpbmcoa2V5Q29tbWVudCkpO1xuICAgIH1cbiAgICBsZXQgdnNiLCB2Y2IsIHZhbHVlQ29tbWVudDtcbiAgICBpZiAoaXNOb2RlKHZhbHVlKSkge1xuICAgICAgICB2c2IgPSAhIXZhbHVlLnNwYWNlQmVmb3JlO1xuICAgICAgICB2Y2IgPSB2YWx1ZS5jb21tZW50QmVmb3JlO1xuICAgICAgICB2YWx1ZUNvbW1lbnQgPSB2YWx1ZS5jb21tZW50O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdnNiID0gZmFsc2U7XG4gICAgICAgIHZjYiA9IG51bGw7XG4gICAgICAgIHZhbHVlQ29tbWVudCA9IG51bGw7XG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKVxuICAgICAgICAgICAgdmFsdWUgPSBkb2MuY3JlYXRlTm9kZSh2YWx1ZSk7XG4gICAgfVxuICAgIGN0eC5pbXBsaWNpdEtleSA9IGZhbHNlO1xuICAgIGlmICghZXhwbGljaXRLZXkgJiYgIWtleUNvbW1lbnQgJiYgaXNTY2FsYXIodmFsdWUpKVxuICAgICAgICBjdHguaW5kZW50QXRTdGFydCA9IHN0ci5sZW5ndGggKyAxO1xuICAgIGNob21wS2VlcCA9IGZhbHNlO1xuICAgIGlmICghaW5kZW50U2VxICYmXG4gICAgICAgIGluZGVudFN0ZXAubGVuZ3RoID49IDIgJiZcbiAgICAgICAgIWN0eC5pbkZsb3cgJiZcbiAgICAgICAgIWV4cGxpY2l0S2V5ICYmXG4gICAgICAgIGlzU2VxKHZhbHVlKSAmJlxuICAgICAgICAhdmFsdWUuZmxvdyAmJlxuICAgICAgICAhdmFsdWUudGFnICYmXG4gICAgICAgICF2YWx1ZS5hbmNob3IpIHtcbiAgICAgICAgLy8gSWYgaW5kZW50U2VxID09PSBmYWxzZSwgY29uc2lkZXIgJy0gJyBhcyBwYXJ0IG9mIGluZGVudGF0aW9uIHdoZXJlIHBvc3NpYmxlXG4gICAgICAgIGN0eC5pbmRlbnQgPSBjdHguaW5kZW50LnN1YnN0cmluZygyKTtcbiAgICB9XG4gICAgbGV0IHZhbHVlQ29tbWVudERvbmUgPSBmYWxzZTtcbiAgICBjb25zdCB2YWx1ZVN0ciA9IHN0cmluZ2lmeSh2YWx1ZSwgY3R4LCAoKSA9PiAodmFsdWVDb21tZW50RG9uZSA9IHRydWUpLCAoKSA9PiAoY2hvbXBLZWVwID0gdHJ1ZSkpO1xuICAgIGxldCB3cyA9ICcgJztcbiAgICBpZiAoa2V5Q29tbWVudCB8fCB2c2IgfHwgdmNiKSB7XG4gICAgICAgIHdzID0gdnNiID8gJ1xcbicgOiAnJztcbiAgICAgICAgaWYgKHZjYikge1xuICAgICAgICAgICAgY29uc3QgY3MgPSBjb21tZW50U3RyaW5nKHZjYik7XG4gICAgICAgICAgICB3cyArPSBgXFxuJHtpbmRlbnRDb21tZW50KGNzLCBjdHguaW5kZW50KX1gO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZVN0ciA9PT0gJycgJiYgIWN0eC5pbkZsb3cpIHtcbiAgICAgICAgICAgIGlmICh3cyA9PT0gJ1xcbicgJiYgdmFsdWVDb21tZW50KVxuICAgICAgICAgICAgICAgIHdzID0gJ1xcblxcbic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB3cyArPSBgXFxuJHtjdHguaW5kZW50fWA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoIWV4cGxpY2l0S2V5ICYmIGlzQ29sbGVjdGlvbih2YWx1ZSkpIHtcbiAgICAgICAgY29uc3QgdnMwID0gdmFsdWVTdHJbMF07XG4gICAgICAgIGNvbnN0IG5sMCA9IHZhbHVlU3RyLmluZGV4T2YoJ1xcbicpO1xuICAgICAgICBjb25zdCBoYXNOZXdsaW5lID0gbmwwICE9PSAtMTtcbiAgICAgICAgY29uc3QgZmxvdyA9IGN0eC5pbkZsb3cgPz8gdmFsdWUuZmxvdyA/PyB2YWx1ZS5pdGVtcy5sZW5ndGggPT09IDA7XG4gICAgICAgIGlmIChoYXNOZXdsaW5lIHx8ICFmbG93KSB7XG4gICAgICAgICAgICBsZXQgaGFzUHJvcHNMaW5lID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoaGFzTmV3bGluZSAmJiAodnMwID09PSAnJicgfHwgdnMwID09PSAnIScpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHNwMCA9IHZhbHVlU3RyLmluZGV4T2YoJyAnKTtcbiAgICAgICAgICAgICAgICBpZiAodnMwID09PSAnJicgJiZcbiAgICAgICAgICAgICAgICAgICAgc3AwICE9PSAtMSAmJlxuICAgICAgICAgICAgICAgICAgICBzcDAgPCBubDAgJiZcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVTdHJbc3AwICsgMV0gPT09ICchJykge1xuICAgICAgICAgICAgICAgICAgICBzcDAgPSB2YWx1ZVN0ci5pbmRleE9mKCcgJywgc3AwICsgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzcDAgPT09IC0xIHx8IG5sMCA8IHNwMClcbiAgICAgICAgICAgICAgICAgICAgaGFzUHJvcHNMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaGFzUHJvcHNMaW5lKVxuICAgICAgICAgICAgICAgIHdzID0gYFxcbiR7Y3R4LmluZGVudH1gO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlU3RyID09PSAnJyB8fCB2YWx1ZVN0clswXSA9PT0gJ1xcbicpIHtcbiAgICAgICAgd3MgPSAnJztcbiAgICB9XG4gICAgc3RyICs9IHdzICsgdmFsdWVTdHI7XG4gICAgaWYgKGN0eC5pbkZsb3cpIHtcbiAgICAgICAgaWYgKHZhbHVlQ29tbWVudERvbmUgJiYgb25Db21tZW50KVxuICAgICAgICAgICAgb25Db21tZW50KCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlQ29tbWVudCAmJiAhdmFsdWVDb21tZW50RG9uZSkge1xuICAgICAgICBzdHIgKz0gbGluZUNvbW1lbnQoc3RyLCBjdHguaW5kZW50LCBjb21tZW50U3RyaW5nKHZhbHVlQ29tbWVudCkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChjaG9tcEtlZXAgJiYgb25DaG9tcEtlZXApIHtcbiAgICAgICAgb25DaG9tcEtlZXAoKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbn1cblxuZXhwb3J0IHsgc3RyaW5naWZ5UGFpciB9O1xuIiwgImZ1bmN0aW9uIGRlYnVnKGxvZ0xldmVsLCAuLi5tZXNzYWdlcykge1xuICAgIGlmIChsb2dMZXZlbCA9PT0gJ2RlYnVnJylcbiAgICAgICAgY29uc29sZS5sb2coLi4ubWVzc2FnZXMpO1xufVxuZnVuY3Rpb24gd2Fybihsb2dMZXZlbCwgd2FybmluZykge1xuICAgIGlmIChsb2dMZXZlbCA9PT0gJ2RlYnVnJyB8fCBsb2dMZXZlbCA9PT0gJ3dhcm4nKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybih3YXJuaW5nKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IGRlYnVnLCB3YXJuIH07XG4iLCAiaW1wb3J0IHsgaXNTY2FsYXIsIGlzU2VxLCBpc0FsaWFzLCBpc01hcCB9IGZyb20gJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uLy4uL25vZGVzL1NjYWxhci5qcyc7XG5cbi8vIElmIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggYSBtZXJnZSBrZXkgaXMgYSBzaW5nbGUgbWFwcGluZyBub2RlLCBlYWNoIG9mXG4vLyBpdHMga2V5L3ZhbHVlIHBhaXJzIGlzIGluc2VydGVkIGludG8gdGhlIGN1cnJlbnQgbWFwcGluZywgdW5sZXNzIHRoZSBrZXlcbi8vIGFscmVhZHkgZXhpc3RzIGluIGl0LiBJZiB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBtZXJnZSBrZXkgaXMgYVxuLy8gc2VxdWVuY2UsIHRoZW4gdGhpcyBzZXF1ZW5jZSBpcyBleHBlY3RlZCB0byBjb250YWluIG1hcHBpbmcgbm9kZXMgYW5kIGVhY2hcbi8vIG9mIHRoZXNlIG5vZGVzIGlzIG1lcmdlZCBpbiB0dXJuIGFjY29yZGluZyB0byBpdHMgb3JkZXIgaW4gdGhlIHNlcXVlbmNlLlxuLy8gS2V5cyBpbiBtYXBwaW5nIG5vZGVzIGVhcmxpZXIgaW4gdGhlIHNlcXVlbmNlIG92ZXJyaWRlIGtleXMgc3BlY2lmaWVkIGluXG4vLyBsYXRlciBtYXBwaW5nIG5vZGVzLiAtLSBodHRwOi8veWFtbC5vcmcvdHlwZS9tZXJnZS5odG1sXG5jb25zdCBNRVJHRV9LRVkgPSAnPDwnO1xuY29uc3QgbWVyZ2UgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09PSBNRVJHRV9LRVkgfHxcbiAgICAgICAgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N5bWJvbCcgJiYgdmFsdWUuZGVzY3JpcHRpb24gPT09IE1FUkdFX0tFWSksXG4gICAgZGVmYXVsdDogJ2tleScsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6bWVyZ2UnLFxuICAgIHRlc3Q6IC9ePDwkLyxcbiAgICByZXNvbHZlOiAoKSA9PiBPYmplY3QuYXNzaWduKG5ldyBTY2FsYXIoU3ltYm9sKE1FUkdFX0tFWSkpLCB7XG4gICAgICAgIGFkZFRvSlNNYXA6IGFkZE1lcmdlVG9KU01hcFxuICAgIH0pLFxuICAgIHN0cmluZ2lmeTogKCkgPT4gTUVSR0VfS0VZXG59O1xuY29uc3QgaXNNZXJnZUtleSA9IChjdHgsIGtleSkgPT4gKG1lcmdlLmlkZW50aWZ5KGtleSkgfHxcbiAgICAoaXNTY2FsYXIoa2V5KSAmJlxuICAgICAgICAoIWtleS50eXBlIHx8IGtleS50eXBlID09PSBTY2FsYXIuUExBSU4pICYmXG4gICAgICAgIG1lcmdlLmlkZW50aWZ5KGtleS52YWx1ZSkpKSAmJlxuICAgIGN0eD8uZG9jLnNjaGVtYS50YWdzLnNvbWUodGFnID0+IHRhZy50YWcgPT09IG1lcmdlLnRhZyAmJiB0YWcuZGVmYXVsdCk7XG5mdW5jdGlvbiBhZGRNZXJnZVRvSlNNYXAoY3R4LCBtYXAsIHZhbHVlKSB7XG4gICAgY29uc3Qgc291cmNlID0gcmVzb2x2ZUFsaWFzVmFsdWUoY3R4LCB2YWx1ZSk7XG4gICAgaWYgKGlzU2VxKHNvdXJjZSkpXG4gICAgICAgIGZvciAoY29uc3QgaXQgb2Ygc291cmNlLml0ZW1zKVxuICAgICAgICAgICAgbWVyZ2VWYWx1ZShjdHgsIG1hcCwgaXQpO1xuICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoc291cmNlKSlcbiAgICAgICAgZm9yIChjb25zdCBpdCBvZiBzb3VyY2UpXG4gICAgICAgICAgICBtZXJnZVZhbHVlKGN0eCwgbWFwLCBpdCk7XG4gICAgZWxzZVxuICAgICAgICBtZXJnZVZhbHVlKGN0eCwgbWFwLCBzb3VyY2UpO1xufVxuZnVuY3Rpb24gbWVyZ2VWYWx1ZShjdHgsIG1hcCwgdmFsdWUpIHtcbiAgICBjb25zdCBzb3VyY2UgPSByZXNvbHZlQWxpYXNWYWx1ZShjdHgsIHZhbHVlKTtcbiAgICBpZiAoIWlzTWFwKHNvdXJjZSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWVyZ2Ugc291cmNlcyBtdXN0IGJlIG1hcHMgb3IgbWFwIGFsaWFzZXMnKTtcbiAgICBjb25zdCBzcmNNYXAgPSBzb3VyY2UudG9KU09OKG51bGwsIGN0eCwgTWFwKTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBzcmNNYXApIHtcbiAgICAgICAgaWYgKG1hcCBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgaWYgKCFtYXAuaGFzKGtleSkpXG4gICAgICAgICAgICAgICAgbWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtYXAgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgIG1hcC5hZGQoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1hcCwga2V5KSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG1hcCwga2V5LCB7XG4gICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG5mdW5jdGlvbiByZXNvbHZlQWxpYXNWYWx1ZShjdHgsIHZhbHVlKSB7XG4gICAgcmV0dXJuIGN0eCAmJiBpc0FsaWFzKHZhbHVlKSA/IHZhbHVlLnJlc29sdmUoY3R4LmRvYywgY3R4KSA6IHZhbHVlO1xufVxuXG5leHBvcnQgeyBhZGRNZXJnZVRvSlNNYXAsIGlzTWVyZ2VLZXksIG1lcmdlIH07XG4iLCAiaW1wb3J0IHsgd2FybiB9IGZyb20gJy4uL2xvZy5qcyc7XG5pbXBvcnQgeyBpc01lcmdlS2V5LCBhZGRNZXJnZVRvSlNNYXAgfSBmcm9tICcuLi9zY2hlbWEveWFtbC0xLjEvbWVyZ2UuanMnO1xuaW1wb3J0IHsgY3JlYXRlU3RyaW5naWZ5Q29udGV4dCB9IGZyb20gJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnkuanMnO1xuaW1wb3J0IHsgaXNOb2RlIH0gZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyB0b0pTIH0gZnJvbSAnLi90b0pTLmpzJztcblxuZnVuY3Rpb24gYWRkUGFpclRvSlNNYXAoY3R4LCBtYXAsIHsga2V5LCB2YWx1ZSB9KSB7XG4gICAgaWYgKGlzTm9kZShrZXkpICYmIGtleS5hZGRUb0pTTWFwKVxuICAgICAgICBrZXkuYWRkVG9KU01hcChjdHgsIG1hcCwgdmFsdWUpO1xuICAgIC8vIFRPRE86IFNob3VsZCBkcm9wIHRoaXMgc3BlY2lhbCBjYXNlIGZvciBiYXJlIDw8IGhhbmRsaW5nXG4gICAgZWxzZSBpZiAoaXNNZXJnZUtleShjdHgsIGtleSkpXG4gICAgICAgIGFkZE1lcmdlVG9KU01hcChjdHgsIG1hcCwgdmFsdWUpO1xuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBqc0tleSA9IHRvSlMoa2V5LCAnJywgY3R4KTtcbiAgICAgICAgaWYgKG1hcCBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgbWFwLnNldChqc0tleSwgdG9KUyh2YWx1ZSwganNLZXksIGN0eCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1hcCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgbWFwLmFkZChqc0tleSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBzdHJpbmdLZXkgPSBzdHJpbmdpZnlLZXkoa2V5LCBqc0tleSwgY3R4KTtcbiAgICAgICAgICAgIGNvbnN0IGpzVmFsdWUgPSB0b0pTKHZhbHVlLCBzdHJpbmdLZXksIGN0eCk7XG4gICAgICAgICAgICBpZiAoc3RyaW5nS2V5IGluIG1hcClcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobWFwLCBzdHJpbmdLZXksIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGpzVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtYXBbc3RyaW5nS2V5XSA9IGpzVmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeUtleShrZXksIGpzS2V5LCBjdHgpIHtcbiAgICBpZiAoanNLZXkgPT09IG51bGwpXG4gICAgICAgIHJldHVybiAnJztcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWJhc2UtdG8tc3RyaW5nXG4gICAgaWYgKHR5cGVvZiBqc0tleSAhPT0gJ29iamVjdCcpXG4gICAgICAgIHJldHVybiBTdHJpbmcoanNLZXkpO1xuICAgIGlmIChpc05vZGUoa2V5KSAmJiBjdHg/LmRvYykge1xuICAgICAgICBjb25zdCBzdHJDdHggPSBjcmVhdGVTdHJpbmdpZnlDb250ZXh0KGN0eC5kb2MsIHt9KTtcbiAgICAgICAgc3RyQ3R4LmFuY2hvcnMgPSBuZXcgU2V0KCk7XG4gICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiBjdHguYW5jaG9ycy5rZXlzKCkpXG4gICAgICAgICAgICBzdHJDdHguYW5jaG9ycy5hZGQobm9kZS5hbmNob3IpO1xuICAgICAgICBzdHJDdHguaW5GbG93ID0gdHJ1ZTtcbiAgICAgICAgc3RyQ3R4LmluU3RyaW5naWZ5S2V5ID0gdHJ1ZTtcbiAgICAgICAgY29uc3Qgc3RyS2V5ID0ga2V5LnRvU3RyaW5nKHN0ckN0eCk7XG4gICAgICAgIGlmICghY3R4Lm1hcEtleVdhcm5lZCkge1xuICAgICAgICAgICAgbGV0IGpzb25TdHIgPSBKU09OLnN0cmluZ2lmeShzdHJLZXkpO1xuICAgICAgICAgICAgaWYgKGpzb25TdHIubGVuZ3RoID4gNDApXG4gICAgICAgICAgICAgICAganNvblN0ciA9IGpzb25TdHIuc3Vic3RyaW5nKDAsIDM2KSArICcuLi5cIic7XG4gICAgICAgICAgICB3YXJuKGN0eC5kb2Mub3B0aW9ucy5sb2dMZXZlbCwgYEtleXMgd2l0aCBjb2xsZWN0aW9uIHZhbHVlcyB3aWxsIGJlIHN0cmluZ2lmaWVkIGR1ZSB0byBKUyBPYmplY3QgcmVzdHJpY3Rpb25zOiAke2pzb25TdHJ9LiBTZXQgbWFwQXNNYXA6IHRydWUgdG8gdXNlIG9iamVjdCBrZXlzLmApO1xuICAgICAgICAgICAgY3R4Lm1hcEtleVdhcm5lZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cktleTtcbiAgICB9XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGpzS2V5KTtcbn1cblxuZXhwb3J0IHsgYWRkUGFpclRvSlNNYXAgfTtcbiIsICJpbXBvcnQgeyBjcmVhdGVOb2RlIH0gZnJvbSAnLi4vZG9jL2NyZWF0ZU5vZGUuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5UGFpciB9IGZyb20gJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlQYWlyLmpzJztcbmltcG9ydCB7IGFkZFBhaXJUb0pTTWFwIH0gZnJvbSAnLi9hZGRQYWlyVG9KU01hcC5qcyc7XG5pbXBvcnQgeyBOT0RFX1RZUEUsIFBBSVIsIGlzTm9kZSB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuXG5mdW5jdGlvbiBjcmVhdGVQYWlyKGtleSwgdmFsdWUsIGN0eCkge1xuICAgIGNvbnN0IGsgPSBjcmVhdGVOb2RlKGtleSwgdW5kZWZpbmVkLCBjdHgpO1xuICAgIGNvbnN0IHYgPSBjcmVhdGVOb2RlKHZhbHVlLCB1bmRlZmluZWQsIGN0eCk7XG4gICAgcmV0dXJuIG5ldyBQYWlyKGssIHYpO1xufVxuY2xhc3MgUGFpciB7XG4gICAgY29uc3RydWN0b3Ioa2V5LCB2YWx1ZSA9IG51bGwpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIE5PREVfVFlQRSwgeyB2YWx1ZTogUEFJUiB9KTtcbiAgICAgICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY2xvbmUoc2NoZW1hKSB7XG4gICAgICAgIGxldCB7IGtleSwgdmFsdWUgfSA9IHRoaXM7XG4gICAgICAgIGlmIChpc05vZGUoa2V5KSlcbiAgICAgICAgICAgIGtleSA9IGtleS5jbG9uZShzY2hlbWEpO1xuICAgICAgICBpZiAoaXNOb2RlKHZhbHVlKSlcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuY2xvbmUoc2NoZW1hKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQYWlyKGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICB0b0pTT04oXywgY3R4KSB7XG4gICAgICAgIGNvbnN0IHBhaXIgPSBjdHg/Lm1hcEFzTWFwID8gbmV3IE1hcCgpIDoge307XG4gICAgICAgIHJldHVybiBhZGRQYWlyVG9KU01hcChjdHgsIHBhaXIsIHRoaXMpO1xuICAgIH1cbiAgICB0b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgcmV0dXJuIGN0eD8uZG9jXG4gICAgICAgICAgICA/IHN0cmluZ2lmeVBhaXIodGhpcywgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKVxuICAgICAgICAgICAgOiBKU09OLnN0cmluZ2lmeSh0aGlzKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFBhaXIsIGNyZWF0ZVBhaXIgfTtcbiIsICJpbXBvcnQgeyBpc05vZGUsIGlzUGFpciB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeSB9IGZyb20gJy4vc3RyaW5naWZ5LmpzJztcbmltcG9ydCB7IGxpbmVDb21tZW50LCBpbmRlbnRDb21tZW50IH0gZnJvbSAnLi9zdHJpbmdpZnlDb21tZW50LmpzJztcblxuZnVuY3Rpb24gc3RyaW5naWZ5Q29sbGVjdGlvbihjb2xsZWN0aW9uLCBjdHgsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBmbG93ID0gY3R4LmluRmxvdyA/PyBjb2xsZWN0aW9uLmZsb3c7XG4gICAgY29uc3Qgc3RyaW5naWZ5ID0gZmxvdyA/IHN0cmluZ2lmeUZsb3dDb2xsZWN0aW9uIDogc3RyaW5naWZ5QmxvY2tDb2xsZWN0aW9uO1xuICAgIHJldHVybiBzdHJpbmdpZnkoY29sbGVjdGlvbiwgY3R4LCBvcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeUJsb2NrQ29sbGVjdGlvbih7IGNvbW1lbnQsIGl0ZW1zIH0sIGN0eCwgeyBibG9ja0l0ZW1QcmVmaXgsIGZsb3dDaGFycywgaXRlbUluZGVudCwgb25DaG9tcEtlZXAsIG9uQ29tbWVudCB9KSB7XG4gICAgY29uc3QgeyBpbmRlbnQsIG9wdGlvbnM6IHsgY29tbWVudFN0cmluZyB9IH0gPSBjdHg7XG4gICAgY29uc3QgaXRlbUN0eCA9IE9iamVjdC5hc3NpZ24oe30sIGN0eCwgeyBpbmRlbnQ6IGl0ZW1JbmRlbnQsIHR5cGU6IG51bGwgfSk7XG4gICAgbGV0IGNob21wS2VlcCA9IGZhbHNlOyAvLyBmbGFnIGZvciB0aGUgcHJlY2VkaW5nIG5vZGUncyBzdGF0dXNcbiAgICBjb25zdCBsaW5lcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2ldO1xuICAgICAgICBsZXQgY29tbWVudCA9IG51bGw7XG4gICAgICAgIGlmIChpc05vZGUoaXRlbSkpIHtcbiAgICAgICAgICAgIGlmICghY2hvbXBLZWVwICYmIGl0ZW0uc3BhY2VCZWZvcmUpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICBhZGRDb21tZW50QmVmb3JlKGN0eCwgbGluZXMsIGl0ZW0uY29tbWVudEJlZm9yZSwgY2hvbXBLZWVwKTtcbiAgICAgICAgICAgIGlmIChpdGVtLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgY29tbWVudCA9IGl0ZW0uY29tbWVudDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1BhaXIoaXRlbSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGlrID0gaXNOb2RlKGl0ZW0ua2V5KSA/IGl0ZW0ua2V5IDogbnVsbDtcbiAgICAgICAgICAgIGlmIChpaykge1xuICAgICAgICAgICAgICAgIGlmICghY2hvbXBLZWVwICYmIGlrLnNwYWNlQmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgICAgICBhZGRDb21tZW50QmVmb3JlKGN0eCwgbGluZXMsIGlrLmNvbW1lbnRCZWZvcmUsIGNob21wS2VlcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgICAgIGxldCBzdHIgPSBzdHJpbmdpZnkoaXRlbSwgaXRlbUN0eCwgKCkgPT4gKGNvbW1lbnQgPSBudWxsKSwgKCkgPT4gKGNob21wS2VlcCA9IHRydWUpKTtcbiAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICBzdHIgKz0gbGluZUNvbW1lbnQoc3RyLCBpdGVtSW5kZW50LCBjb21tZW50U3RyaW5nKGNvbW1lbnQpKTtcbiAgICAgICAgaWYgKGNob21wS2VlcCAmJiBjb21tZW50KVxuICAgICAgICAgICAgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgICAgIGxpbmVzLnB1c2goYmxvY2tJdGVtUHJlZml4ICsgc3RyKTtcbiAgICB9XG4gICAgbGV0IHN0cjtcbiAgICBpZiAobGluZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHN0ciA9IGZsb3dDaGFycy5zdGFydCArIGZsb3dDaGFycy5lbmQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzdHIgPSBsaW5lc1swXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW2ldO1xuICAgICAgICAgICAgc3RyICs9IGxpbmUgPyBgXFxuJHtpbmRlbnR9JHtsaW5lfWAgOiAnXFxuJztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBzdHIgKz0gJ1xcbicgKyBpbmRlbnRDb21tZW50KGNvbW1lbnRTdHJpbmcoY29tbWVudCksIGluZGVudCk7XG4gICAgICAgIGlmIChvbkNvbW1lbnQpXG4gICAgICAgICAgICBvbkNvbW1lbnQoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY2hvbXBLZWVwICYmIG9uQ2hvbXBLZWVwKVxuICAgICAgICBvbkNob21wS2VlcCgpO1xuICAgIHJldHVybiBzdHI7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlGbG93Q29sbGVjdGlvbih7IGl0ZW1zIH0sIGN0eCwgeyBmbG93Q2hhcnMsIGl0ZW1JbmRlbnQgfSkge1xuICAgIGNvbnN0IHsgaW5kZW50LCBpbmRlbnRTdGVwLCBmbG93Q29sbGVjdGlvblBhZGRpbmc6IGZjUGFkZGluZywgb3B0aW9uczogeyBjb21tZW50U3RyaW5nIH0gfSA9IGN0eDtcbiAgICBpdGVtSW5kZW50ICs9IGluZGVudFN0ZXA7XG4gICAgY29uc3QgaXRlbUN0eCA9IE9iamVjdC5hc3NpZ24oe30sIGN0eCwge1xuICAgICAgICBpbmRlbnQ6IGl0ZW1JbmRlbnQsXG4gICAgICAgIGluRmxvdzogdHJ1ZSxcbiAgICAgICAgdHlwZTogbnVsbFxuICAgIH0pO1xuICAgIGxldCByZXFOZXdsaW5lID0gZmFsc2U7XG4gICAgbGV0IGxpbmVzQXRWYWx1ZSA9IDA7XG4gICAgY29uc3QgbGluZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAgICAgbGV0IGNvbW1lbnQgPSBudWxsO1xuICAgICAgICBpZiAoaXNOb2RlKGl0ZW0pKSB7XG4gICAgICAgICAgICBpZiAoaXRlbS5zcGFjZUJlZm9yZSlcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgIGFkZENvbW1lbnRCZWZvcmUoY3R4LCBsaW5lcywgaXRlbS5jb21tZW50QmVmb3JlLCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAoaXRlbS5jb21tZW50KVxuICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBpdGVtLmNvbW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNQYWlyKGl0ZW0pKSB7XG4gICAgICAgICAgICBjb25zdCBpayA9IGlzTm9kZShpdGVtLmtleSkgPyBpdGVtLmtleSA6IG51bGw7XG4gICAgICAgICAgICBpZiAoaWspIHtcbiAgICAgICAgICAgICAgICBpZiAoaWsuc3BhY2VCZWZvcmUpXG4gICAgICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgICAgIGFkZENvbW1lbnRCZWZvcmUoY3R4LCBsaW5lcywgaWsuY29tbWVudEJlZm9yZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGlmIChpay5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICByZXFOZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGl2ID0gaXNOb2RlKGl0ZW0udmFsdWUpID8gaXRlbS52YWx1ZSA6IG51bGw7XG4gICAgICAgICAgICBpZiAoaXYpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXYuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudCA9IGl2LmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKGl2LmNvbW1lbnRCZWZvcmUpXG4gICAgICAgICAgICAgICAgICAgIHJlcU5ld2xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXRlbS52YWx1ZSA9PSBudWxsICYmIGlrPy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgY29tbWVudCA9IGlrLmNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICByZXFOZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgbGV0IHN0ciA9IHN0cmluZ2lmeShpdGVtLCBpdGVtQ3R4LCAoKSA9PiAoY29tbWVudCA9IG51bGwpKTtcbiAgICAgICAgcmVxTmV3bGluZSB8fCAocmVxTmV3bGluZSA9IGxpbmVzLmxlbmd0aCA+IGxpbmVzQXRWYWx1ZSB8fCBzdHIuaW5jbHVkZXMoJ1xcbicpKTtcbiAgICAgICAgaWYgKGkgPCBpdGVtcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBzdHIgKz0gJywnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGN0eC5vcHRpb25zLnRyYWlsaW5nQ29tbWEpIHtcbiAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy5saW5lV2lkdGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVxTmV3bGluZSB8fCAocmVxTmV3bGluZSA9IGxpbmVzLnJlZHVjZSgoc3VtLCBsaW5lKSA9PiBzdW0gKyBsaW5lLmxlbmd0aCArIDIsIDIpICtcbiAgICAgICAgICAgICAgICAgICAgKHN0ci5sZW5ndGggKyAyKSA+XG4gICAgICAgICAgICAgICAgICAgIGN0eC5vcHRpb25zLmxpbmVXaWR0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVxTmV3bGluZSkge1xuICAgICAgICAgICAgICAgIHN0ciArPSAnLCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICBzdHIgKz0gbGluZUNvbW1lbnQoc3RyLCBpdGVtSW5kZW50LCBjb21tZW50U3RyaW5nKGNvbW1lbnQpKTtcbiAgICAgICAgbGluZXMucHVzaChzdHIpO1xuICAgICAgICBsaW5lc0F0VmFsdWUgPSBsaW5lcy5sZW5ndGg7XG4gICAgfVxuICAgIGNvbnN0IHsgc3RhcnQsIGVuZCB9ID0gZmxvd0NoYXJzO1xuICAgIGlmIChsaW5lcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHN0YXJ0ICsgZW5kO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKCFyZXFOZXdsaW5lKSB7XG4gICAgICAgICAgICBjb25zdCBsZW4gPSBsaW5lcy5yZWR1Y2UoKHN1bSwgbGluZSkgPT4gc3VtICsgbGluZS5sZW5ndGggKyAyLCAyKTtcbiAgICAgICAgICAgIHJlcU5ld2xpbmUgPSBjdHgub3B0aW9ucy5saW5lV2lkdGggPiAwICYmIGxlbiA+IGN0eC5vcHRpb25zLmxpbmVXaWR0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVxTmV3bGluZSkge1xuICAgICAgICAgICAgbGV0IHN0ciA9IHN0YXJ0O1xuICAgICAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKVxuICAgICAgICAgICAgICAgIHN0ciArPSBsaW5lID8gYFxcbiR7aW5kZW50U3RlcH0ke2luZGVudH0ke2xpbmV9YCA6ICdcXG4nO1xuICAgICAgICAgICAgcmV0dXJuIGAke3N0cn1cXG4ke2luZGVudH0ke2VuZH1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGAke3N0YXJ0fSR7ZmNQYWRkaW5nfSR7bGluZXMuam9pbignICcpfSR7ZmNQYWRkaW5nfSR7ZW5kfWA7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBhZGRDb21tZW50QmVmb3JlKHsgaW5kZW50LCBvcHRpb25zOiB7IGNvbW1lbnRTdHJpbmcgfSB9LCBsaW5lcywgY29tbWVudCwgY2hvbXBLZWVwKSB7XG4gICAgaWYgKGNvbW1lbnQgJiYgY2hvbXBLZWVwKVxuICAgICAgICBjb21tZW50ID0gY29tbWVudC5yZXBsYWNlKC9eXFxuKy8sICcnKTtcbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBjb25zdCBpYyA9IGluZGVudENvbW1lbnQoY29tbWVudFN0cmluZyhjb21tZW50KSwgaW5kZW50KTtcbiAgICAgICAgbGluZXMucHVzaChpYy50cmltU3RhcnQoKSk7IC8vIEF2b2lkIGRvdWJsZSBpbmRlbnQgb24gZmlyc3QgbGluZVxuICAgIH1cbn1cblxuZXhwb3J0IHsgc3RyaW5naWZ5Q29sbGVjdGlvbiB9O1xuIiwgImltcG9ydCB7IHN0cmluZ2lmeUNvbGxlY3Rpb24gfSBmcm9tICcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5Q29sbGVjdGlvbi5qcyc7XG5pbXBvcnQgeyBhZGRQYWlyVG9KU01hcCB9IGZyb20gJy4vYWRkUGFpclRvSlNNYXAuanMnO1xuaW1wb3J0IHsgQ29sbGVjdGlvbiB9IGZyb20gJy4vQ29sbGVjdGlvbi5qcyc7XG5pbXBvcnQgeyBNQVAsIGlzUGFpciwgaXNTY2FsYXIgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFBhaXIsIGNyZWF0ZVBhaXIgfSBmcm9tICcuL1BhaXIuanMnO1xuaW1wb3J0IHsgaXNTY2FsYXJWYWx1ZSB9IGZyb20gJy4vU2NhbGFyLmpzJztcblxuZnVuY3Rpb24gZmluZFBhaXIoaXRlbXMsIGtleSkge1xuICAgIGNvbnN0IGsgPSBpc1NjYWxhcihrZXkpID8ga2V5LnZhbHVlIDoga2V5O1xuICAgIGZvciAoY29uc3QgaXQgb2YgaXRlbXMpIHtcbiAgICAgICAgaWYgKGlzUGFpcihpdCkpIHtcbiAgICAgICAgICAgIGlmIChpdC5rZXkgPT09IGtleSB8fCBpdC5rZXkgPT09IGspXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0O1xuICAgICAgICAgICAgaWYgKGlzU2NhbGFyKGl0LmtleSkgJiYgaXQua2V5LnZhbHVlID09PSBrKVxuICAgICAgICAgICAgICAgIHJldHVybiBpdDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuY2xhc3MgWUFNTE1hcCBleHRlbmRzIENvbGxlY3Rpb24ge1xuICAgIHN0YXRpYyBnZXQgdGFnTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuICd0YWc6eWFtbC5vcmcsMjAwMjptYXAnO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihzY2hlbWEpIHtcbiAgICAgICAgc3VwZXIoTUFQLCBzY2hlbWEpO1xuICAgICAgICB0aGlzLml0ZW1zID0gW107XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEEgZ2VuZXJpYyBjb2xsZWN0aW9uIHBhcnNpbmcgbWV0aG9kIHRoYXQgY2FuIGJlIGV4dGVuZGVkXG4gICAgICogdG8gb3RoZXIgbm9kZSBjbGFzc2VzIHRoYXQgaW5oZXJpdCBmcm9tIFlBTUxNYXBcbiAgICAgKi9cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIG9iaiwgY3R4KSB7XG4gICAgICAgIGNvbnN0IHsga2VlcFVuZGVmaW5lZCwgcmVwbGFjZXIgfSA9IGN0eDtcbiAgICAgICAgY29uc3QgbWFwID0gbmV3IHRoaXMoc2NoZW1hKTtcbiAgICAgICAgY29uc3QgYWRkID0gKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXBsYWNlci5jYWxsKG9iaiwga2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlcGxhY2VyKSAmJiAhcmVwbGFjZXIuaW5jbHVkZXMoa2V5KSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCB8fCBrZWVwVW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKGNyZWF0ZVBhaXIoa2V5LCB2YWx1ZSwgY3R4KSk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIG9iailcbiAgICAgICAgICAgICAgICBhZGQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob2JqICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvYmopKVxuICAgICAgICAgICAgICAgIGFkZChrZXksIG9ialtrZXldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHNjaGVtYS5zb3J0TWFwRW50cmllcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgbWFwLml0ZW1zLnNvcnQoc2NoZW1hLnNvcnRNYXBFbnRyaWVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgdmFsdWUgdG8gdGhlIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3ZlcndyaXRlIC0gSWYgbm90IHNldCBgdHJ1ZWAsIHVzaW5nIGEga2V5IHRoYXQgaXMgYWxyZWFkeSBpbiB0aGVcbiAgICAgKiAgIGNvbGxlY3Rpb24gd2lsbCB0aHJvdy4gT3RoZXJ3aXNlLCBvdmVyd3JpdGVzIHRoZSBwcmV2aW91cyB2YWx1ZS5cbiAgICAgKi9cbiAgICBhZGQocGFpciwgb3ZlcndyaXRlKSB7XG4gICAgICAgIGxldCBfcGFpcjtcbiAgICAgICAgaWYgKGlzUGFpcihwYWlyKSlcbiAgICAgICAgICAgIF9wYWlyID0gcGFpcjtcbiAgICAgICAgZWxzZSBpZiAoIXBhaXIgfHwgdHlwZW9mIHBhaXIgIT09ICdvYmplY3QnIHx8ICEoJ2tleScgaW4gcGFpcikpIHtcbiAgICAgICAgICAgIC8vIEluIFR5cGVTY3JpcHQsIHRoaXMgbmV2ZXIgaGFwcGVucy5cbiAgICAgICAgICAgIF9wYWlyID0gbmV3IFBhaXIocGFpciwgcGFpcj8udmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIF9wYWlyID0gbmV3IFBhaXIocGFpci5rZXksIHBhaXIudmFsdWUpO1xuICAgICAgICBjb25zdCBwcmV2ID0gZmluZFBhaXIodGhpcy5pdGVtcywgX3BhaXIua2V5KTtcbiAgICAgICAgY29uc3Qgc29ydEVudHJpZXMgPSB0aGlzLnNjaGVtYT8uc29ydE1hcEVudHJpZXM7XG4gICAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgICAgICBpZiAoIW92ZXJ3cml0ZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEtleSAke19wYWlyLmtleX0gYWxyZWFkeSBzZXRgKTtcbiAgICAgICAgICAgIC8vIEZvciBzY2FsYXJzLCBrZWVwIHRoZSBvbGQgbm9kZSAmIGl0cyBjb21tZW50cyBhbmQgYW5jaG9yc1xuICAgICAgICAgICAgaWYgKGlzU2NhbGFyKHByZXYudmFsdWUpICYmIGlzU2NhbGFyVmFsdWUoX3BhaXIudmFsdWUpKVxuICAgICAgICAgICAgICAgIHByZXYudmFsdWUudmFsdWUgPSBfcGFpci52YWx1ZTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwcmV2LnZhbHVlID0gX3BhaXIudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc29ydEVudHJpZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGkgPSB0aGlzLml0ZW1zLmZpbmRJbmRleChpdGVtID0+IHNvcnRFbnRyaWVzKF9wYWlyLCBpdGVtKSA8IDApO1xuICAgICAgICAgICAgaWYgKGkgPT09IC0xKVxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChfcGFpcik7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5zcGxpY2UoaSwgMCwgX3BhaXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKF9wYWlyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZWxldGUoa2V5KSB7XG4gICAgICAgIGNvbnN0IGl0ID0gZmluZFBhaXIodGhpcy5pdGVtcywga2V5KTtcbiAgICAgICAgaWYgKCFpdClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgZGVsID0gdGhpcy5pdGVtcy5zcGxpY2UodGhpcy5pdGVtcy5pbmRleE9mKGl0KSwgMSk7XG4gICAgICAgIHJldHVybiBkZWwubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgZ2V0KGtleSwga2VlcFNjYWxhcikge1xuICAgICAgICBjb25zdCBpdCA9IGZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBpdD8udmFsdWU7XG4gICAgICAgIHJldHVybiAoIWtlZXBTY2FsYXIgJiYgaXNTY2FsYXIobm9kZSkgPyBub2RlLnZhbHVlIDogbm9kZSkgPz8gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBoYXMoa2V5KSB7XG4gICAgICAgIHJldHVybiAhIWZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgfVxuICAgIHNldChrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuYWRkKG5ldyBQYWlyKGtleSwgdmFsdWUpLCB0cnVlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIGN0eCAtIENvbnZlcnNpb24gY29udGV4dCwgb3JpZ2luYWxseSBzZXQgaW4gRG9jdW1lbnQjdG9KUygpXG4gICAgICogQHBhcmFtIHtDbGFzc30gVHlwZSAtIElmIHNldCwgZm9yY2VzIHRoZSByZXR1cm5lZCBjb2xsZWN0aW9uIHR5cGVcbiAgICAgKiBAcmV0dXJucyBJbnN0YW5jZSBvZiBUeXBlLCBNYXAsIG9yIE9iamVjdFxuICAgICAqL1xuICAgIHRvSlNPTihfLCBjdHgsIFR5cGUpIHtcbiAgICAgICAgY29uc3QgbWFwID0gVHlwZSA/IG5ldyBUeXBlKCkgOiBjdHg/Lm1hcEFzTWFwID8gbmV3IE1hcCgpIDoge307XG4gICAgICAgIGlmIChjdHg/Lm9uQ3JlYXRlKVxuICAgICAgICAgICAgY3R4Lm9uQ3JlYXRlKG1hcCk7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLml0ZW1zKVxuICAgICAgICAgICAgYWRkUGFpclRvSlNNYXAoY3R4LCBtYXAsIGl0ZW0pO1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICB0b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgaWYgKCFjdHgpXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLml0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoIWlzUGFpcihpdGVtKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1hcCBpdGVtcyBtdXN0IGFsbCBiZSBwYWlyczsgZm91bmQgJHtKU09OLnN0cmluZ2lmeShpdGVtKX0gaW5zdGVhZGApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghY3R4LmFsbE51bGxWYWx1ZXMgJiYgdGhpcy5oYXNBbGxOdWxsVmFsdWVzKGZhbHNlKSlcbiAgICAgICAgICAgIGN0eCA9IE9iamVjdC5hc3NpZ24oe30sIGN0eCwgeyBhbGxOdWxsVmFsdWVzOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4gc3RyaW5naWZ5Q29sbGVjdGlvbih0aGlzLCBjdHgsIHtcbiAgICAgICAgICAgIGJsb2NrSXRlbVByZWZpeDogJycsXG4gICAgICAgICAgICBmbG93Q2hhcnM6IHsgc3RhcnQ6ICd7JywgZW5kOiAnfScgfSxcbiAgICAgICAgICAgIGl0ZW1JbmRlbnQ6IGN0eC5pbmRlbnQgfHwgJycsXG4gICAgICAgICAgICBvbkNob21wS2VlcCxcbiAgICAgICAgICAgIG9uQ29tbWVudFxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFlBTUxNYXAsIGZpbmRQYWlyIH07XG4iLCAiaW1wb3J0IHsgaXNNYXAgfSBmcm9tICcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBZQU1MTWFwIH0gZnJvbSAnLi4vLi4vbm9kZXMvWUFNTE1hcC5qcyc7XG5cbmNvbnN0IG1hcCA9IHtcbiAgICBjb2xsZWN0aW9uOiAnbWFwJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG5vZGVDbGFzczogWUFNTE1hcCxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjptYXAnLFxuICAgIHJlc29sdmUobWFwLCBvbkVycm9yKSB7XG4gICAgICAgIGlmICghaXNNYXAobWFwKSlcbiAgICAgICAgICAgIG9uRXJyb3IoJ0V4cGVjdGVkIGEgbWFwcGluZyBmb3IgdGhpcyB0YWcnKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9LFxuICAgIGNyZWF0ZU5vZGU6IChzY2hlbWEsIG9iaiwgY3R4KSA9PiBZQU1MTWFwLmZyb20oc2NoZW1hLCBvYmosIGN0eClcbn07XG5cbmV4cG9ydCB7IG1hcCB9O1xuIiwgImltcG9ydCB7IGNyZWF0ZU5vZGUgfSBmcm9tICcuLi9kb2MvY3JlYXRlTm9kZS5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnlDb2xsZWN0aW9uIH0gZnJvbSAnLi4vc3RyaW5naWZ5L3N0cmluZ2lmeUNvbGxlY3Rpb24uanMnO1xuaW1wb3J0IHsgQ29sbGVjdGlvbiB9IGZyb20gJy4vQ29sbGVjdGlvbi5qcyc7XG5pbXBvcnQgeyBTRVEsIGlzU2NhbGFyIH0gZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBpc1NjYWxhclZhbHVlIH0gZnJvbSAnLi9TY2FsYXIuanMnO1xuaW1wb3J0IHsgdG9KUyB9IGZyb20gJy4vdG9KUy5qcyc7XG5cbmNsYXNzIFlBTUxTZXEgZXh0ZW5kcyBDb2xsZWN0aW9uIHtcbiAgICBzdGF0aWMgZ2V0IHRhZ05hbWUoKSB7XG4gICAgICAgIHJldHVybiAndGFnOnlhbWwub3JnLDIwMDI6c2VxJztcbiAgICB9XG4gICAgY29uc3RydWN0b3Ioc2NoZW1hKSB7XG4gICAgICAgIHN1cGVyKFNFUSwgc2NoZW1hKTtcbiAgICAgICAgdGhpcy5pdGVtcyA9IFtdO1xuICAgIH1cbiAgICBhZGQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5pdGVtcy5wdXNoKHZhbHVlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHZhbHVlIGZyb20gdGhlIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBga2V5YCBtdXN0IGNvbnRhaW4gYSByZXByZXNlbnRhdGlvbiBvZiBhbiBpbnRlZ2VyIGZvciB0aGlzIHRvIHN1Y2NlZWQuXG4gICAgICogSXQgbWF5IGJlIHdyYXBwZWQgaW4gYSBgU2NhbGFyYC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaXRlbSB3YXMgZm91bmQgYW5kIHJlbW92ZWQuXG4gICAgICovXG4gICAgZGVsZXRlKGtleSkge1xuICAgICAgICBjb25zdCBpZHggPSBhc0l0ZW1JbmRleChrZXkpO1xuICAgICAgICBpZiAodHlwZW9mIGlkeCAhPT0gJ251bWJlcicpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IGRlbCA9IHRoaXMuaXRlbXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIHJldHVybiBkZWwubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgZ2V0KGtleSwga2VlcFNjYWxhcikge1xuICAgICAgICBjb25zdCBpZHggPSBhc0l0ZW1JbmRleChrZXkpO1xuICAgICAgICBpZiAodHlwZW9mIGlkeCAhPT0gJ251bWJlcicpXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBpdCA9IHRoaXMuaXRlbXNbaWR4XTtcbiAgICAgICAgcmV0dXJuICFrZWVwU2NhbGFyICYmIGlzU2NhbGFyKGl0KSA/IGl0LnZhbHVlIDogaXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgY29sbGVjdGlvbiBpbmNsdWRlcyBhIHZhbHVlIHdpdGggdGhlIGtleSBga2V5YC5cbiAgICAgKlxuICAgICAqIGBrZXlgIG11c3QgY29udGFpbiBhIHJlcHJlc2VudGF0aW9uIG9mIGFuIGludGVnZXIgZm9yIHRoaXMgdG8gc3VjY2VlZC5cbiAgICAgKiBJdCBtYXkgYmUgd3JhcHBlZCBpbiBhIGBTY2FsYXJgLlxuICAgICAqL1xuICAgIGhhcyhrZXkpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBpZHggPT09ICdudW1iZXInICYmIGlkeCA8IHRoaXMuaXRlbXMubGVuZ3RoO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgdmFsdWUgaW4gdGhpcyBjb2xsZWN0aW9uLiBGb3IgYCEhc2V0YCwgYHZhbHVlYCBuZWVkcyB0byBiZSBhXG4gICAgICogYm9vbGVhbiB0byBhZGQvcmVtb3ZlIHRoZSBpdGVtIGZyb20gdGhlIHNldC5cbiAgICAgKlxuICAgICAqIElmIGBrZXlgIGRvZXMgbm90IGNvbnRhaW4gYSByZXByZXNlbnRhdGlvbiBvZiBhbiBpbnRlZ2VyLCB0aGlzIHdpbGwgdGhyb3cuXG4gICAgICogSXQgbWF5IGJlIHdyYXBwZWQgaW4gYSBgU2NhbGFyYC5cbiAgICAgKi9cbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBpZHggPSBhc0l0ZW1JbmRleChrZXkpO1xuICAgICAgICBpZiAodHlwZW9mIGlkeCAhPT0gJ251bWJlcicpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGEgdmFsaWQgaW5kZXgsIG5vdCAke2tleX0uYCk7XG4gICAgICAgIGNvbnN0IHByZXYgPSB0aGlzLml0ZW1zW2lkeF07XG4gICAgICAgIGlmIChpc1NjYWxhcihwcmV2KSAmJiBpc1NjYWxhclZhbHVlKHZhbHVlKSlcbiAgICAgICAgICAgIHByZXYudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5pdGVtc1tpZHhdID0gdmFsdWU7XG4gICAgfVxuICAgIHRvSlNPTihfLCBjdHgpIHtcbiAgICAgICAgY29uc3Qgc2VxID0gW107XG4gICAgICAgIGlmIChjdHg/Lm9uQ3JlYXRlKVxuICAgICAgICAgICAgY3R4Lm9uQ3JlYXRlKHNlcSk7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRoaXMuaXRlbXMpXG4gICAgICAgICAgICBzZXEucHVzaCh0b0pTKGl0ZW0sIFN0cmluZyhpKyspLCBjdHgpKTtcbiAgICAgICAgcmV0dXJuIHNlcTtcbiAgICB9XG4gICAgdG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMpO1xuICAgICAgICByZXR1cm4gc3RyaW5naWZ5Q29sbGVjdGlvbih0aGlzLCBjdHgsIHtcbiAgICAgICAgICAgIGJsb2NrSXRlbVByZWZpeDogJy0gJyxcbiAgICAgICAgICAgIGZsb3dDaGFyczogeyBzdGFydDogJ1snLCBlbmQ6ICddJyB9LFxuICAgICAgICAgICAgaXRlbUluZGVudDogKGN0eC5pbmRlbnQgfHwgJycpICsgJyAgJyxcbiAgICAgICAgICAgIG9uQ2hvbXBLZWVwLFxuICAgICAgICAgICAgb25Db21tZW50XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIG9iaiwgY3R4KSB7XG4gICAgICAgIGNvbnN0IHsgcmVwbGFjZXIgfSA9IGN0eDtcbiAgICAgICAgY29uc3Qgc2VxID0gbmV3IHRoaXMoc2NoZW1hKTtcbiAgICAgICAgaWYgKG9iaiAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KG9iaikpIHtcbiAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgIGZvciAobGV0IGl0IG9mIG9iaikge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gb2JqIGluc3RhbmNlb2YgU2V0ID8gaXQgOiBTdHJpbmcoaSsrKTtcbiAgICAgICAgICAgICAgICAgICAgaXQgPSByZXBsYWNlci5jYWxsKG9iaiwga2V5LCBpdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNlcS5pdGVtcy5wdXNoKGNyZWF0ZU5vZGUoaXQsIHVuZGVmaW5lZCwgY3R4KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlcTtcbiAgICB9XG59XG5mdW5jdGlvbiBhc0l0ZW1JbmRleChrZXkpIHtcbiAgICBsZXQgaWR4ID0gaXNTY2FsYXIoa2V5KSA/IGtleS52YWx1ZSA6IGtleTtcbiAgICBpZiAoaWR4ICYmIHR5cGVvZiBpZHggPT09ICdzdHJpbmcnKVxuICAgICAgICBpZHggPSBOdW1iZXIoaWR4KTtcbiAgICByZXR1cm4gdHlwZW9mIGlkeCA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzSW50ZWdlcihpZHgpICYmIGlkeCA+PSAwXG4gICAgICAgID8gaWR4XG4gICAgICAgIDogbnVsbDtcbn1cblxuZXhwb3J0IHsgWUFNTFNlcSB9O1xuIiwgImltcG9ydCB7IGlzU2VxIH0gZnJvbSAnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgWUFNTFNlcSB9IGZyb20gJy4uLy4uL25vZGVzL1lBTUxTZXEuanMnO1xuXG5jb25zdCBzZXEgPSB7XG4gICAgY29sbGVjdGlvbjogJ3NlcScsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBub2RlQ2xhc3M6IFlBTUxTZXEsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6c2VxJyxcbiAgICByZXNvbHZlKHNlcSwgb25FcnJvcikge1xuICAgICAgICBpZiAoIWlzU2VxKHNlcSkpXG4gICAgICAgICAgICBvbkVycm9yKCdFeHBlY3RlZCBhIHNlcXVlbmNlIGZvciB0aGlzIHRhZycpO1xuICAgICAgICByZXR1cm4gc2VxO1xuICAgIH0sXG4gICAgY3JlYXRlTm9kZTogKHNjaGVtYSwgb2JqLCBjdHgpID0+IFlBTUxTZXEuZnJvbShzY2hlbWEsIG9iaiwgY3R4KVxufTtcblxuZXhwb3J0IHsgc2VxIH07XG4iLCAiaW1wb3J0IHsgc3RyaW5naWZ5U3RyaW5nIH0gZnJvbSAnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeVN0cmluZy5qcyc7XG5cbmNvbnN0IHN0cmluZyA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOnN0cicsXG4gICAgcmVzb2x2ZTogc3RyID0+IHN0cixcbiAgICBzdHJpbmdpZnkoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGN0eCA9IE9iamVjdC5hc3NpZ24oeyBhY3R1YWxTdHJpbmc6IHRydWUgfSwgY3R4KTtcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeVN0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIH1cbn07XG5cbmV4cG9ydCB7IHN0cmluZyB9O1xuIiwgImltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uLy4uL25vZGVzL1NjYWxhci5qcyc7XG5cbmNvbnN0IG51bGxUYWcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09IG51bGwsXG4gICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFNjYWxhcihudWxsKSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm51bGwnLFxuICAgIHRlc3Q6IC9eKD86fnxbTm5ddWxsfE5VTEwpPyQvLFxuICAgIHJlc29sdmU6ICgpID0+IG5ldyBTY2FsYXIobnVsbCksXG4gICAgc3RyaW5naWZ5OiAoeyBzb3VyY2UgfSwgY3R4KSA9PiB0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJyAmJiBudWxsVGFnLnRlc3QudGVzdChzb3VyY2UpXG4gICAgICAgID8gc291cmNlXG4gICAgICAgIDogY3R4Lm9wdGlvbnMubnVsbFN0clxufTtcblxuZXhwb3J0IHsgbnVsbFRhZyB9O1xuIiwgImltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uLy4uL25vZGVzL1NjYWxhci5qcyc7XG5cbmNvbnN0IGJvb2xUYWcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsXG4gICAgdGVzdDogL14oPzpbVHRdcnVlfFRSVUV8W0ZmXWFsc2V8RkFMU0UpJC8sXG4gICAgcmVzb2x2ZTogc3RyID0+IG5ldyBTY2FsYXIoc3RyWzBdID09PSAndCcgfHwgc3RyWzBdID09PSAnVCcpLFxuICAgIHN0cmluZ2lmeSh7IHNvdXJjZSwgdmFsdWUgfSwgY3R4KSB7XG4gICAgICAgIGlmIChzb3VyY2UgJiYgYm9vbFRhZy50ZXN0LnRlc3Qoc291cmNlKSkge1xuICAgICAgICAgICAgY29uc3Qgc3YgPSBzb3VyY2VbMF0gPT09ICd0JyB8fCBzb3VyY2VbMF0gPT09ICdUJztcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gc3YpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWUgPyBjdHgub3B0aW9ucy50cnVlU3RyIDogY3R4Lm9wdGlvbnMuZmFsc2VTdHI7XG4gICAgfVxufTtcblxuZXhwb3J0IHsgYm9vbFRhZyB9O1xuIiwgImZ1bmN0aW9uIHN0cmluZ2lmeU51bWJlcih7IGZvcm1hdCwgbWluRnJhY3Rpb25EaWdpdHMsIHRhZywgdmFsdWUgfSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnKVxuICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbiAgICBjb25zdCBudW0gPSB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInID8gdmFsdWUgOiBOdW1iZXIodmFsdWUpO1xuICAgIGlmICghaXNGaW5pdGUobnVtKSlcbiAgICAgICAgcmV0dXJuIGlzTmFOKG51bSkgPyAnLm5hbicgOiBudW0gPCAwID8gJy0uaW5mJyA6ICcuaW5mJztcbiAgICBsZXQgbiA9IE9iamVjdC5pcyh2YWx1ZSwgLTApID8gJy0wJyA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICBpZiAoIWZvcm1hdCAmJlxuICAgICAgICBtaW5GcmFjdGlvbkRpZ2l0cyAmJlxuICAgICAgICAoIXRhZyB8fCB0YWcgPT09ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcpICYmXG4gICAgICAgIC9eLT9cXGQvLnRlc3QobikgJiZcbiAgICAgICAgIW4uaW5jbHVkZXMoJ2UnKSkge1xuICAgICAgICBsZXQgaSA9IG4uaW5kZXhPZignLicpO1xuICAgICAgICBpZiAoaSA8IDApIHtcbiAgICAgICAgICAgIGkgPSBuLmxlbmd0aDtcbiAgICAgICAgICAgIG4gKz0gJy4nO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkID0gbWluRnJhY3Rpb25EaWdpdHMgLSAobi5sZW5ndGggLSBpIC0gMSk7XG4gICAgICAgIHdoaWxlIChkLS0gPiAwKVxuICAgICAgICAgICAgbiArPSAnMCc7XG4gICAgfVxuICAgIHJldHVybiBuO1xufVxuXG5leHBvcnQgeyBzdHJpbmdpZnlOdW1iZXIgfTtcbiIsICJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5TnVtYmVyIH0gZnJvbSAnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcyc7XG5cbmNvbnN0IGZsb2F0TmFOID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIHRlc3Q6IC9eKD86Wy0rXT9cXC4oPzppbmZ8SW5mfElORil8XFwubmFufFxcLk5hTnxcXC5OQU4pJC8sXG4gICAgcmVzb2x2ZTogc3RyID0+IHN0ci5zbGljZSgtMykudG9Mb3dlckNhc2UoKSA9PT0gJ25hbidcbiAgICAgICAgPyBOYU5cbiAgICAgICAgOiBzdHJbMF0gPT09ICctJ1xuICAgICAgICAgICAgPyBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFlcbiAgICAgICAgICAgIDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyXG59O1xuY29uc3QgZmxvYXRFeHAgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgZm9ybWF0OiAnRVhQJyxcbiAgICB0ZXN0OiAvXlstK10/KD86XFwuWzAtOV0rfFswLTldKyg/OlxcLlswLTldKik/KVtlRV1bLStdP1swLTldKyQvLFxuICAgIHJlc29sdmU6IHN0ciA9PiBwYXJzZUZsb2F0KHN0ciksXG4gICAgc3RyaW5naWZ5KG5vZGUpIHtcbiAgICAgICAgY29uc3QgbnVtID0gTnVtYmVyKG5vZGUudmFsdWUpO1xuICAgICAgICByZXR1cm4gaXNGaW5pdGUobnVtKSA/IG51bS50b0V4cG9uZW50aWFsKCkgOiBzdHJpbmdpZnlOdW1iZXIobm9kZSk7XG4gICAgfVxufTtcbmNvbnN0IGZsb2F0ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIHRlc3Q6IC9eWy0rXT8oPzpcXC5bMC05XSt8WzAtOV0rXFwuWzAtOV0qKSQvLFxuICAgIHJlc29sdmUoc3RyKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgU2NhbGFyKHBhcnNlRmxvYXQoc3RyKSk7XG4gICAgICAgIGNvbnN0IGRvdCA9IHN0ci5pbmRleE9mKCcuJyk7XG4gICAgICAgIGlmIChkb3QgIT09IC0xICYmIHN0cltzdHIubGVuZ3RoIC0gMV0gPT09ICcwJylcbiAgICAgICAgICAgIG5vZGUubWluRnJhY3Rpb25EaWdpdHMgPSBzdHIubGVuZ3RoIC0gZG90IC0gMTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlclxufTtcblxuZXhwb3J0IHsgZmxvYXQsIGZsb2F0RXhwLCBmbG9hdE5hTiB9O1xuIiwgImltcG9ydCB7IHN0cmluZ2lmeU51bWJlciB9IGZyb20gJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnO1xuXG5jb25zdCBpbnRJZGVudGlmeSA9ICh2YWx1ZSkgPT4gdHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyB8fCBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKTtcbmNvbnN0IGludFJlc29sdmUgPSAoc3RyLCBvZmZzZXQsIHJhZGl4LCB7IGludEFzQmlnSW50IH0pID0+IChpbnRBc0JpZ0ludCA/IEJpZ0ludChzdHIpIDogcGFyc2VJbnQoc3RyLnN1YnN0cmluZyhvZmZzZXQpLCByYWRpeCkpO1xuZnVuY3Rpb24gaW50U3RyaW5naWZ5KG5vZGUsIHJhZGl4LCBwcmVmaXgpIHtcbiAgICBjb25zdCB7IHZhbHVlIH0gPSBub2RlO1xuICAgIGlmIChpbnRJZGVudGlmeSh2YWx1ZSkgJiYgdmFsdWUgPj0gMClcbiAgICAgICAgcmV0dXJuIHByZWZpeCArIHZhbHVlLnRvU3RyaW5nKHJhZGl4KTtcbiAgICByZXR1cm4gc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xufVxuY29uc3QgaW50T2N0ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiBpbnRJZGVudGlmeSh2YWx1ZSkgJiYgdmFsdWUgPj0gMCxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnT0NUJyxcbiAgICB0ZXN0OiAvXjBvWzAtN10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDIsIDgsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCA4LCAnMG8nKVxufTtcbmNvbnN0IGludCA9IHtcbiAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIHRlc3Q6IC9eWy0rXT9bMC05XSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMCwgMTAsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXJcbn07XG5jb25zdCBpbnRIZXggPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IGludElkZW50aWZ5KHZhbHVlKSAmJiB2YWx1ZSA+PSAwLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdIRVgnLFxuICAgIHRlc3Q6IC9eMHhbMC05YS1mQS1GXSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMiwgMTYsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCAxNiwgJzB4Jylcbn07XG5cbmV4cG9ydCB7IGludCwgaW50SGV4LCBpbnRPY3QgfTtcbiIsICJpbXBvcnQgeyBtYXAgfSBmcm9tICcuLi9jb21tb24vbWFwLmpzJztcbmltcG9ydCB7IG51bGxUYWcgfSBmcm9tICcuLi9jb21tb24vbnVsbC5qcyc7XG5pbXBvcnQgeyBzZXEgfSBmcm9tICcuLi9jb21tb24vc2VxLmpzJztcbmltcG9ydCB7IHN0cmluZyB9IGZyb20gJy4uL2NvbW1vbi9zdHJpbmcuanMnO1xuaW1wb3J0IHsgYm9vbFRhZyB9IGZyb20gJy4vYm9vbC5qcyc7XG5pbXBvcnQgeyBmbG9hdE5hTiwgZmxvYXRFeHAsIGZsb2F0IH0gZnJvbSAnLi9mbG9hdC5qcyc7XG5pbXBvcnQgeyBpbnRPY3QsIGludCwgaW50SGV4IH0gZnJvbSAnLi9pbnQuanMnO1xuXG5jb25zdCBzY2hlbWEgPSBbXG4gICAgbWFwLFxuICAgIHNlcSxcbiAgICBzdHJpbmcsXG4gICAgbnVsbFRhZyxcbiAgICBib29sVGFnLFxuICAgIGludE9jdCxcbiAgICBpbnQsXG4gICAgaW50SGV4LFxuICAgIGZsb2F0TmFOLFxuICAgIGZsb2F0RXhwLFxuICAgIGZsb2F0XG5dO1xuXG5leHBvcnQgeyBzY2hlbWEgfTtcbiIsICJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSAnLi4vY29tbW9uL21hcC5qcyc7XG5pbXBvcnQgeyBzZXEgfSBmcm9tICcuLi9jb21tb24vc2VxLmpzJztcblxuZnVuY3Rpb24gaW50SWRlbnRpZnkodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyB8fCBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKTtcbn1cbmNvbnN0IHN0cmluZ2lmeUpTT04gPSAoeyB2YWx1ZSB9KSA9PiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5jb25zdCBqc29uU2NhbGFycyA9IFtcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInLFxuICAgICAgICByZXNvbHZlOiBzdHIgPT4gc3RyLFxuICAgICAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeUpTT05cbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09IG51bGwsXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBTY2FsYXIobnVsbCksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm51bGwnLFxuICAgICAgICB0ZXN0OiAvXm51bGwkLyxcbiAgICAgICAgcmVzb2x2ZTogKCkgPT4gbnVsbCxcbiAgICAgICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlKU09OXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsXG4gICAgICAgIHRlc3Q6IC9edHJ1ZSR8XmZhbHNlJC8sXG4gICAgICAgIHJlc29sdmU6IHN0ciA9PiBzdHIgPT09ICd0cnVlJyxcbiAgICAgICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlKU09OXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICAgICAgdGVzdDogL14tPyg/OjB8WzEtOV1bMC05XSopJC8sXG4gICAgICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCB7IGludEFzQmlnSW50IH0pID0+IGludEFzQmlnSW50ID8gQmlnSW50KHN0cikgOiBwYXJzZUludChzdHIsIDEwKSxcbiAgICAgICAgc3RyaW5naWZ5OiAoeyB2YWx1ZSB9KSA9PiBpbnRJZGVudGlmeSh2YWx1ZSkgPyB2YWx1ZS50b1N0cmluZygpIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgICAgIHRlc3Q6IC9eLT8oPzowfFsxLTldWzAtOV0qKSg/OlxcLlswLTldKik/KD86W2VFXVstK10/WzAtOV0rKT8kLyxcbiAgICAgICAgcmVzb2x2ZTogc3RyID0+IHBhcnNlRmxvYXQoc3RyKSxcbiAgICAgICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlKU09OXG4gICAgfVxuXTtcbmNvbnN0IGpzb25FcnJvciA9IHtcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJycsXG4gICAgdGVzdDogL14vLFxuICAgIHJlc29sdmUoc3RyLCBvbkVycm9yKSB7XG4gICAgICAgIG9uRXJyb3IoYFVucmVzb2x2ZWQgcGxhaW4gc2NhbGFyICR7SlNPTi5zdHJpbmdpZnkoc3RyKX1gKTtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG59O1xuY29uc3Qgc2NoZW1hID0gW21hcCwgc2VxXS5jb25jYXQoanNvblNjYWxhcnMsIGpzb25FcnJvcik7XG5cbmV4cG9ydCB7IHNjaGVtYSB9O1xuIiwgImltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uLy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnlTdHJpbmcgfSBmcm9tICcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5U3RyaW5nLmpzJztcblxuY29uc3QgYmluYXJ5ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXksIC8vIEJ1ZmZlciBpbmhlcml0cyBmcm9tIFVpbnQ4QXJyYXlcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpiaW5hcnknLFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBCdWZmZXIgaW4gbm9kZSBhbmQgYW4gVWludDhBcnJheSBpbiBicm93c2Vyc1xuICAgICAqXG4gICAgICogVG8gdXNlIHRoZSByZXN1bHRpbmcgYnVmZmVyIGFzIGFuIGltYWdlLCB5b3UnbGwgd2FudCB0byBkbyBzb21ldGhpbmcgbGlrZTpcbiAgICAgKlxuICAgICAqICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtidWZmZXJdLCB7IHR5cGU6ICdpbWFnZS9qcGVnJyB9KVxuICAgICAqICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Bob3RvJykuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKVxuICAgICAqL1xuICAgIHJlc29sdmUoc3JjLCBvbkVycm9yKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXRvYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy8gT24gSUUgMTEsIGF0b2IoKSBjYW4ndCBoYW5kbGUgbmV3bGluZXNcbiAgICAgICAgICAgIGNvbnN0IHN0ciA9IGF0b2Ioc3JjLnJlcGxhY2UoL1tcXG5cXHJdL2csICcnKSk7XG4gICAgICAgICAgICBjb25zdCBidWZmZXIgPSBuZXcgVWludDhBcnJheShzdHIubGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGJ1ZmZlcltpXSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG9uRXJyb3IoJ1RoaXMgZW52aXJvbm1lbnQgZG9lcyBub3Qgc3VwcG9ydCByZWFkaW5nIGJpbmFyeSB0YWdzOyBlaXRoZXIgQnVmZmVyIG9yIGF0b2IgaXMgcmVxdWlyZWQnKTtcbiAgICAgICAgICAgIHJldHVybiBzcmM7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHN0cmluZ2lmeSh7IGNvbW1lbnQsIHR5cGUsIHZhbHVlIH0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICBpZiAoIXZhbHVlKVxuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICBjb25zdCBidWYgPSB2YWx1ZTsgLy8gY2hlY2tlZCBlYXJsaWVyIGJ5IGJpbmFyeS5pZGVudGlmeSgpXG4gICAgICAgIGxldCBzdHI7XG4gICAgICAgIGlmICh0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgbGV0IHMgPSAnJztcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnVmLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIHMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pO1xuICAgICAgICAgICAgc3RyID0gYnRvYShzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBlbnZpcm9ubWVudCBkb2VzIG5vdCBzdXBwb3J0IHdyaXRpbmcgYmluYXJ5IHRhZ3M7IGVpdGhlciBCdWZmZXIgb3IgYnRvYSBpcyByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHR5cGUgPz8gKHR5cGUgPSBTY2FsYXIuQkxPQ0tfTElURVJBTCk7XG4gICAgICAgIGlmICh0eXBlICE9PSBTY2FsYXIuUVVPVEVfRE9VQkxFKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5lV2lkdGggPSBNYXRoLm1heChjdHgub3B0aW9ucy5saW5lV2lkdGggLSBjdHguaW5kZW50Lmxlbmd0aCwgY3R4Lm9wdGlvbnMubWluQ29udGVudFdpZHRoKTtcbiAgICAgICAgICAgIGNvbnN0IG4gPSBNYXRoLmNlaWwoc3RyLmxlbmd0aCAvIGxpbmVXaWR0aCk7XG4gICAgICAgICAgICBjb25zdCBsaW5lcyA9IG5ldyBBcnJheShuKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBvID0gMDsgaSA8IG47ICsraSwgbyArPSBsaW5lV2lkdGgpIHtcbiAgICAgICAgICAgICAgICBsaW5lc1tpXSA9IHN0ci5zdWJzdHIobywgbGluZVdpZHRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ciA9IGxpbmVzLmpvaW4odHlwZSA9PT0gU2NhbGFyLkJMT0NLX0xJVEVSQUwgPyAnXFxuJyA6ICcgJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeVN0cmluZyh7IGNvbW1lbnQsIHR5cGUsIHZhbHVlOiBzdHIgfSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICB9XG59O1xuXG5leHBvcnQgeyBiaW5hcnkgfTtcbiIsICJpbXBvcnQgeyBpc1NlcSwgaXNQYWlyLCBpc01hcCB9IGZyb20gJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IGNyZWF0ZVBhaXIsIFBhaXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9QYWlyLmpzJztcbmltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uLy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyBZQU1MU2VxIH0gZnJvbSAnLi4vLi4vbm9kZXMvWUFNTFNlcS5qcyc7XG5cbmZ1bmN0aW9uIHJlc29sdmVQYWlycyhzZXEsIG9uRXJyb3IpIHtcbiAgICBpZiAoaXNTZXEoc2VxKSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlcS5pdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgbGV0IGl0ZW0gPSBzZXEuaXRlbXNbaV07XG4gICAgICAgICAgICBpZiAoaXNQYWlyKGl0ZW0pKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNNYXAoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5pdGVtcy5sZW5ndGggPiAxKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCdFYWNoIHBhaXIgbXVzdCBoYXZlIGl0cyBvd24gc2VxdWVuY2UgaW5kaWNhdG9yJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFpciA9IGl0ZW0uaXRlbXNbMF0gfHwgbmV3IFBhaXIobmV3IFNjYWxhcihudWxsKSk7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uY29tbWVudEJlZm9yZSlcbiAgICAgICAgICAgICAgICAgICAgcGFpci5rZXkuY29tbWVudEJlZm9yZSA9IHBhaXIua2V5LmNvbW1lbnRCZWZvcmVcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCR7aXRlbS5jb21tZW50QmVmb3JlfVxcbiR7cGFpci5rZXkuY29tbWVudEJlZm9yZX1gXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGl0ZW0uY29tbWVudEJlZm9yZTtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNuID0gcGFpci52YWx1ZSA/PyBwYWlyLmtleTtcbiAgICAgICAgICAgICAgICAgICAgY24uY29tbWVudCA9IGNuLmNvbW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCR7aXRlbS5jb21tZW50fVxcbiR7Y24uY29tbWVudH1gXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGl0ZW0uY29tbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaXRlbSA9IHBhaXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXEuaXRlbXNbaV0gPSBpc1BhaXIoaXRlbSkgPyBpdGVtIDogbmV3IFBhaXIoaXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZVxuICAgICAgICBvbkVycm9yKCdFeHBlY3RlZCBhIHNlcXVlbmNlIGZvciB0aGlzIHRhZycpO1xuICAgIHJldHVybiBzZXE7XG59XG5mdW5jdGlvbiBjcmVhdGVQYWlycyhzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpIHtcbiAgICBjb25zdCB7IHJlcGxhY2VyIH0gPSBjdHg7XG4gICAgY29uc3QgcGFpcnMgPSBuZXcgWUFNTFNlcShzY2hlbWEpO1xuICAgIHBhaXJzLnRhZyA9ICd0YWc6eWFtbC5vcmcsMjAwMjpwYWlycyc7XG4gICAgbGV0IGkgPSAwO1xuICAgIGlmIChpdGVyYWJsZSAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGl0ZXJhYmxlKSlcbiAgICAgICAgZm9yIChsZXQgaXQgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgaXQgPSByZXBsYWNlci5jYWxsKGl0ZXJhYmxlLCBTdHJpbmcoaSsrKSwgaXQpO1xuICAgICAgICAgICAgbGV0IGtleSwgdmFsdWU7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpdCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXQubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IGl0WzBdO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGl0WzFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIFtrZXksIHZhbHVlXSB0dXBsZTogJHtpdH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGl0ICYmIGl0IGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGl0KTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0ga2V5c1swXTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpdFtrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgdHVwbGUgd2l0aCBvbmUga2V5LCBub3QgJHtrZXlzLmxlbmd0aH0ga2V5c2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleSA9IGl0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFpcnMuaXRlbXMucHVzaChjcmVhdGVQYWlyKGtleSwgdmFsdWUsIGN0eCkpO1xuICAgICAgICB9XG4gICAgcmV0dXJuIHBhaXJzO1xufVxuY29uc3QgcGFpcnMgPSB7XG4gICAgY29sbGVjdGlvbjogJ3NlcScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6cGFpcnMnLFxuICAgIHJlc29sdmU6IHJlc29sdmVQYWlycyxcbiAgICBjcmVhdGVOb2RlOiBjcmVhdGVQYWlyc1xufTtcblxuZXhwb3J0IHsgY3JlYXRlUGFpcnMsIHBhaXJzLCByZXNvbHZlUGFpcnMgfTtcbiIsICJpbXBvcnQgeyBpc1NjYWxhciwgaXNQYWlyIH0gZnJvbSAnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgdG9KUyB9IGZyb20gJy4uLy4uL25vZGVzL3RvSlMuanMnO1xuaW1wb3J0IHsgWUFNTE1hcCB9IGZyb20gJy4uLy4uL25vZGVzL1lBTUxNYXAuanMnO1xuaW1wb3J0IHsgWUFNTFNlcSB9IGZyb20gJy4uLy4uL25vZGVzL1lBTUxTZXEuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZVBhaXJzLCBjcmVhdGVQYWlycyB9IGZyb20gJy4vcGFpcnMuanMnO1xuXG5jbGFzcyBZQU1MT01hcCBleHRlbmRzIFlBTUxTZXEge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmFkZCA9IFlBTUxNYXAucHJvdG90eXBlLmFkZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmRlbGV0ZSA9IFlBTUxNYXAucHJvdG90eXBlLmRlbGV0ZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmdldCA9IFlBTUxNYXAucHJvdG90eXBlLmdldC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmhhcyA9IFlBTUxNYXAucHJvdG90eXBlLmhhcy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnNldCA9IFlBTUxNYXAucHJvdG90eXBlLnNldC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnRhZyA9IFlBTUxPTWFwLnRhZztcbiAgICB9XG4gICAgLyoqXG4gICAgICogSWYgYGN0eGAgaXMgZ2l2ZW4sIHRoZSByZXR1cm4gdHlwZSBpcyBhY3R1YWxseSBgTWFwPHVua25vd24sIHVua25vd24+YCxcbiAgICAgKiBidXQgVHlwZVNjcmlwdCB3b24ndCBhbGxvdyB3aWRlbmluZyB0aGUgc2lnbmF0dXJlIG9mIGEgY2hpbGQgbWV0aG9kLlxuICAgICAqL1xuICAgIHRvSlNPTihfLCBjdHgpIHtcbiAgICAgICAgaWYgKCFjdHgpXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIudG9KU09OKF8pO1xuICAgICAgICBjb25zdCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGlmIChjdHg/Lm9uQ3JlYXRlKVxuICAgICAgICAgICAgY3R4Lm9uQ3JlYXRlKG1hcCk7XG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiB0aGlzLml0ZW1zKSB7XG4gICAgICAgICAgICBsZXQga2V5LCB2YWx1ZTtcbiAgICAgICAgICAgIGlmIChpc1BhaXIocGFpcikpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSB0b0pTKHBhaXIua2V5LCAnJywgY3R4KTtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRvSlMocGFpci52YWx1ZSwga2V5LCBjdHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5ID0gdG9KUyhwYWlyLCAnJywgY3R4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtYXAuaGFzKGtleSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPcmRlcmVkIG1hcHMgbXVzdCBub3QgaW5jbHVkZSBkdXBsaWNhdGUga2V5cycpO1xuICAgICAgICAgICAgbWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpIHtcbiAgICAgICAgY29uc3QgcGFpcnMgPSBjcmVhdGVQYWlycyhzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpO1xuICAgICAgICBjb25zdCBvbWFwID0gbmV3IHRoaXMoKTtcbiAgICAgICAgb21hcC5pdGVtcyA9IHBhaXJzLml0ZW1zO1xuICAgICAgICByZXR1cm4gb21hcDtcbiAgICB9XG59XG5ZQU1MT01hcC50YWcgPSAndGFnOnlhbWwub3JnLDIwMDI6b21hcCc7XG5jb25zdCBvbWFwID0ge1xuICAgIGNvbGxlY3Rpb246ICdzZXEnLFxuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIE1hcCxcbiAgICBub2RlQ2xhc3M6IFlBTUxPTWFwLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm9tYXAnLFxuICAgIHJlc29sdmUoc2VxLCBvbkVycm9yKSB7XG4gICAgICAgIGNvbnN0IHBhaXJzID0gcmVzb2x2ZVBhaXJzKHNlcSwgb25FcnJvcik7XG4gICAgICAgIGNvbnN0IHNlZW5LZXlzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgeyBrZXkgfSBvZiBwYWlycy5pdGVtcykge1xuICAgICAgICAgICAgaWYgKGlzU2NhbGFyKGtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VlbktleXMuaW5jbHVkZXMoa2V5LnZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKGBPcmRlcmVkIG1hcHMgbXVzdCBub3QgaW5jbHVkZSBkdXBsaWNhdGUga2V5czogJHtrZXkudmFsdWV9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWVuS2V5cy5wdXNoKGtleS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyBZQU1MT01hcCgpLCBwYWlycyk7XG4gICAgfSxcbiAgICBjcmVhdGVOb2RlOiAoc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSA9PiBZQU1MT01hcC5mcm9tKHNjaGVtYSwgaXRlcmFibGUsIGN0eClcbn07XG5cbmV4cG9ydCB7IFlBTUxPTWFwLCBvbWFwIH07XG4iLCAiaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJztcblxuZnVuY3Rpb24gYm9vbFN0cmluZ2lmeSh7IHZhbHVlLCBzb3VyY2UgfSwgY3R4KSB7XG4gICAgY29uc3QgYm9vbE9iaiA9IHZhbHVlID8gdHJ1ZVRhZyA6IGZhbHNlVGFnO1xuICAgIGlmIChzb3VyY2UgJiYgYm9vbE9iai50ZXN0LnRlc3Qoc291cmNlKSlcbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICByZXR1cm4gdmFsdWUgPyBjdHgub3B0aW9ucy50cnVlU3RyIDogY3R4Lm9wdGlvbnMuZmFsc2VTdHI7XG59XG5jb25zdCB0cnVlVGFnID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PT0gdHJ1ZSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLFxuICAgIHRlc3Q6IC9eKD86WXx5fFtZeV1lc3xZRVN8W1R0XXJ1ZXxUUlVFfFtPb11ufE9OKSQvLFxuICAgIHJlc29sdmU6ICgpID0+IG5ldyBTY2FsYXIodHJ1ZSksXG4gICAgc3RyaW5naWZ5OiBib29sU3RyaW5naWZ5XG59O1xuY29uc3QgZmFsc2VUYWcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09PSBmYWxzZSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLFxuICAgIHRlc3Q6IC9eKD86TnxufFtObl1vfE5PfFtGZl1hbHNlfEZBTFNFfFtPb11mZnxPRkYpJC8sXG4gICAgcmVzb2x2ZTogKCkgPT4gbmV3IFNjYWxhcihmYWxzZSksXG4gICAgc3RyaW5naWZ5OiBib29sU3RyaW5naWZ5XG59O1xuXG5leHBvcnQgeyBmYWxzZVRhZywgdHJ1ZVRhZyB9O1xuIiwgImltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uLy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnlOdW1iZXIgfSBmcm9tICcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5TnVtYmVyLmpzJztcblxuY29uc3QgZmxvYXROYU4gPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgdGVzdDogL14oPzpbLStdP1xcLig/OmluZnxJbmZ8SU5GKXxcXC5uYW58XFwuTmFOfFxcLk5BTikkLyxcbiAgICByZXNvbHZlOiAoc3RyKSA9PiBzdHIuc2xpY2UoLTMpLnRvTG93ZXJDYXNlKCkgPT09ICduYW4nXG4gICAgICAgID8gTmFOXG4gICAgICAgIDogc3RyWzBdID09PSAnLSdcbiAgICAgICAgICAgID8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZXG4gICAgICAgICAgICA6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlclxufTtcbmNvbnN0IGZsb2F0RXhwID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIGZvcm1hdDogJ0VYUCcsXG4gICAgdGVzdDogL15bLStdPyg/OlswLTldWzAtOV9dKik/KD86XFwuWzAtOV9dKik/W2VFXVstK10/WzAtOV0rJC8sXG4gICAgcmVzb2x2ZTogKHN0cikgPT4gcGFyc2VGbG9hdChzdHIucmVwbGFjZSgvXy9nLCAnJykpLFxuICAgIHN0cmluZ2lmeShub2RlKSB7XG4gICAgICAgIGNvbnN0IG51bSA9IE51bWJlcihub2RlLnZhbHVlKTtcbiAgICAgICAgcmV0dXJuIGlzRmluaXRlKG51bSkgPyBudW0udG9FeHBvbmVudGlhbCgpIDogc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xuICAgIH1cbn07XG5jb25zdCBmbG9hdCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICB0ZXN0OiAvXlstK10/KD86WzAtOV1bMC05X10qKT9cXC5bMC05X10qJC8sXG4gICAgcmVzb2x2ZShzdHIpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5ldyBTY2FsYXIocGFyc2VGbG9hdChzdHIucmVwbGFjZSgvXy9nLCAnJykpKTtcbiAgICAgICAgY29uc3QgZG90ID0gc3RyLmluZGV4T2YoJy4nKTtcbiAgICAgICAgaWYgKGRvdCAhPT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGYgPSBzdHIuc3Vic3RyaW5nKGRvdCArIDEpLnJlcGxhY2UoL18vZywgJycpO1xuICAgICAgICAgICAgaWYgKGZbZi5sZW5ndGggLSAxXSA9PT0gJzAnKVxuICAgICAgICAgICAgICAgIG5vZGUubWluRnJhY3Rpb25EaWdpdHMgPSBmLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9LFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyXG59O1xuXG5leHBvcnQgeyBmbG9hdCwgZmxvYXRFeHAsIGZsb2F0TmFOIH07XG4iLCAiaW1wb3J0IHsgc3RyaW5naWZ5TnVtYmVyIH0gZnJvbSAnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcyc7XG5cbmNvbnN0IGludElkZW50aWZ5ID0gKHZhbHVlKSA9PiB0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnIHx8IE51bWJlci5pc0ludGVnZXIodmFsdWUpO1xuZnVuY3Rpb24gaW50UmVzb2x2ZShzdHIsIG9mZnNldCwgcmFkaXgsIHsgaW50QXNCaWdJbnQgfSkge1xuICAgIGNvbnN0IHNpZ24gPSBzdHJbMF07XG4gICAgaWYgKHNpZ24gPT09ICctJyB8fCBzaWduID09PSAnKycpXG4gICAgICAgIG9mZnNldCArPSAxO1xuICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcob2Zmc2V0KS5yZXBsYWNlKC9fL2csICcnKTtcbiAgICBpZiAoaW50QXNCaWdJbnQpIHtcbiAgICAgICAgc3dpdGNoIChyYWRpeCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHN0ciA9IGAwYiR7c3RyfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgICAgc3RyID0gYDBvJHtzdHJ9YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICAgICAgc3RyID0gYDB4JHtzdHJ9YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuID0gQmlnSW50KHN0cik7XG4gICAgICAgIHJldHVybiBzaWduID09PSAnLScgPyBCaWdJbnQoLTEpICogbiA6IG47XG4gICAgfVxuICAgIGNvbnN0IG4gPSBwYXJzZUludChzdHIsIHJhZGl4KTtcbiAgICByZXR1cm4gc2lnbiA9PT0gJy0nID8gLTEgKiBuIDogbjtcbn1cbmZ1bmN0aW9uIGludFN0cmluZ2lmeShub2RlLCByYWRpeCwgcHJlZml4KSB7XG4gICAgY29uc3QgeyB2YWx1ZSB9ID0gbm9kZTtcbiAgICBpZiAoaW50SWRlbnRpZnkodmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IHN0ciA9IHZhbHVlLnRvU3RyaW5nKHJhZGl4KTtcbiAgICAgICAgcmV0dXJuIHZhbHVlIDwgMCA/ICctJyArIHByZWZpeCArIHN0ci5zdWJzdHIoMSkgOiBwcmVmaXggKyBzdHI7XG4gICAgfVxuICAgIHJldHVybiBzdHJpbmdpZnlOdW1iZXIobm9kZSk7XG59XG5jb25zdCBpbnRCaW4gPSB7XG4gICAgaWRlbnRpZnk6IGludElkZW50aWZ5LFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdCSU4nLFxuICAgIHRlc3Q6IC9eWy0rXT8wYlswLTFfXSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMiwgMiwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDIsICcwYicpXG59O1xuY29uc3QgaW50T2N0ID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnT0NUJyxcbiAgICB0ZXN0OiAvXlstK10/MFswLTdfXSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMSwgOCwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDgsICcwJylcbn07XG5jb25zdCBpbnQgPSB7XG4gICAgaWRlbnRpZnk6IGludElkZW50aWZ5LFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICB0ZXN0OiAvXlstK10/WzAtOV1bMC05X10qJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDAsIDEwLCBvcHQpLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyXG59O1xuY29uc3QgaW50SGV4ID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnSEVYJyxcbiAgICB0ZXN0OiAvXlstK10/MHhbMC05YS1mQS1GX10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDIsIDE2LCBvcHQpLFxuICAgIHN0cmluZ2lmeTogbm9kZSA9PiBpbnRTdHJpbmdpZnkobm9kZSwgMTYsICcweCcpXG59O1xuXG5leHBvcnQgeyBpbnQsIGludEJpbiwgaW50SGV4LCBpbnRPY3QgfTtcbiIsICJpbXBvcnQgeyBpc01hcCwgaXNQYWlyLCBpc1NjYWxhciB9IGZyb20gJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFBhaXIsIGNyZWF0ZVBhaXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9QYWlyLmpzJztcbmltcG9ydCB7IFlBTUxNYXAsIGZpbmRQYWlyIH0gZnJvbSAnLi4vLi4vbm9kZXMvWUFNTE1hcC5qcyc7XG5cbmNsYXNzIFlBTUxTZXQgZXh0ZW5kcyBZQU1MTWFwIHtcbiAgICBjb25zdHJ1Y3RvcihzY2hlbWEpIHtcbiAgICAgICAgc3VwZXIoc2NoZW1hKTtcbiAgICAgICAgdGhpcy50YWcgPSBZQU1MU2V0LnRhZztcbiAgICB9XG4gICAgYWRkKGtleSkge1xuICAgICAgICBsZXQgcGFpcjtcbiAgICAgICAgaWYgKGlzUGFpcihrZXkpKVxuICAgICAgICAgICAgcGFpciA9IGtleTtcbiAgICAgICAgZWxzZSBpZiAoa2V5ICYmXG4gICAgICAgICAgICB0eXBlb2Yga2V5ID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgJ2tleScgaW4ga2V5ICYmXG4gICAgICAgICAgICAndmFsdWUnIGluIGtleSAmJlxuICAgICAgICAgICAga2V5LnZhbHVlID09PSBudWxsKVxuICAgICAgICAgICAgcGFpciA9IG5ldyBQYWlyKGtleS5rZXksIG51bGwpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwYWlyID0gbmV3IFBhaXIoa2V5LCBudWxsKTtcbiAgICAgICAgY29uc3QgcHJldiA9IGZpbmRQYWlyKHRoaXMuaXRlbXMsIHBhaXIua2V5KTtcbiAgICAgICAgaWYgKCFwcmV2KVxuICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKHBhaXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJZiBga2VlcFBhaXJgIGlzIGB0cnVlYCwgcmV0dXJucyB0aGUgUGFpciBtYXRjaGluZyBga2V5YC5cbiAgICAgKiBPdGhlcndpc2UsIHJldHVybnMgdGhlIHZhbHVlIG9mIHRoYXQgUGFpcidzIGtleS5cbiAgICAgKi9cbiAgICBnZXQoa2V5LCBrZWVwUGFpcikge1xuICAgICAgICBjb25zdCBwYWlyID0gZmluZFBhaXIodGhpcy5pdGVtcywga2V5KTtcbiAgICAgICAgcmV0dXJuICFrZWVwUGFpciAmJiBpc1BhaXIocGFpcilcbiAgICAgICAgICAgID8gaXNTY2FsYXIocGFpci5rZXkpXG4gICAgICAgICAgICAgICAgPyBwYWlyLmtleS52YWx1ZVxuICAgICAgICAgICAgICAgIDogcGFpci5rZXlcbiAgICAgICAgICAgIDogcGFpcjtcbiAgICB9XG4gICAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Jvb2xlYW4nKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBib29sZWFuIHZhbHVlIGZvciBzZXQoa2V5LCB2YWx1ZSkgaW4gYSBZQU1MIHNldCwgbm90ICR7dHlwZW9mIHZhbHVlfWApO1xuICAgICAgICBjb25zdCBwcmV2ID0gZmluZFBhaXIodGhpcy5pdGVtcywga2V5KTtcbiAgICAgICAgaWYgKHByZXYgJiYgIXZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zLnNwbGljZSh0aGlzLml0ZW1zLmluZGV4T2YocHJldiksIDEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFwcmV2ICYmIHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2gobmV3IFBhaXIoa2V5KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdG9KU09OKF8sIGN0eCkge1xuICAgICAgICByZXR1cm4gc3VwZXIudG9KU09OKF8sIGN0eCwgU2V0KTtcbiAgICB9XG4gICAgdG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMpO1xuICAgICAgICBpZiAodGhpcy5oYXNBbGxOdWxsVmFsdWVzKHRydWUpKVxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnRvU3RyaW5nKE9iamVjdC5hc3NpZ24oe30sIGN0eCwgeyBhbGxOdWxsVmFsdWVzOiB0cnVlIH0pLCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXQgaXRlbXMgbXVzdCBhbGwgaGF2ZSBudWxsIHZhbHVlcycpO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpIHtcbiAgICAgICAgY29uc3QgeyByZXBsYWNlciB9ID0gY3R4O1xuICAgICAgICBjb25zdCBzZXQgPSBuZXcgdGhpcyhzY2hlbWEpO1xuICAgICAgICBpZiAoaXRlcmFibGUgJiYgU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChpdGVyYWJsZSkpXG4gICAgICAgICAgICBmb3IgKGxldCB2YWx1ZSBvZiBpdGVyYWJsZSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gcmVwbGFjZXIuY2FsbChpdGVyYWJsZSwgdmFsdWUsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZXQuaXRlbXMucHVzaChjcmVhdGVQYWlyKHZhbHVlLCBudWxsLCBjdHgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNldDtcbiAgICB9XG59XG5ZQU1MU2V0LnRhZyA9ICd0YWc6eWFtbC5vcmcsMjAwMjpzZXQnO1xuY29uc3Qgc2V0ID0ge1xuICAgIGNvbGxlY3Rpb246ICdtYXAnLFxuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIFNldCxcbiAgICBub2RlQ2xhc3M6IFlBTUxTZXQsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6c2V0JyxcbiAgICBjcmVhdGVOb2RlOiAoc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSA9PiBZQU1MU2V0LmZyb20oc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSxcbiAgICByZXNvbHZlKG1hcCwgb25FcnJvcikge1xuICAgICAgICBpZiAoaXNNYXAobWFwKSkge1xuICAgICAgICAgICAgaWYgKG1hcC5oYXNBbGxOdWxsVmFsdWVzKHRydWUpKVxuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyBZQU1MU2V0KCksIG1hcCk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb25FcnJvcignU2V0IGl0ZW1zIG11c3QgYWxsIGhhdmUgbnVsbCB2YWx1ZXMnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvbkVycm9yKCdFeHBlY3RlZCBhIG1hcHBpbmcgZm9yIHRoaXMgdGFnJyk7XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxufTtcblxuZXhwb3J0IHsgWUFNTFNldCwgc2V0IH07XG4iLCAiaW1wb3J0IHsgc3RyaW5naWZ5TnVtYmVyIH0gZnJvbSAnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcyc7XG5cbi8qKiBJbnRlcm5hbCB0eXBlcyBoYW5kbGUgYmlnaW50IGFzIG51bWJlciwgYmVjYXVzZSBUUyBjYW4ndCBmaWd1cmUgaXQgb3V0LiAqL1xuZnVuY3Rpb24gcGFyc2VTZXhhZ2VzaW1hbChzdHIsIGFzQmlnSW50KSB7XG4gICAgY29uc3Qgc2lnbiA9IHN0clswXTtcbiAgICBjb25zdCBwYXJ0cyA9IHNpZ24gPT09ICctJyB8fCBzaWduID09PSAnKycgPyBzdHIuc3Vic3RyaW5nKDEpIDogc3RyO1xuICAgIGNvbnN0IG51bSA9IChuKSA9PiBhc0JpZ0ludCA/IEJpZ0ludChuKSA6IE51bWJlcihuKTtcbiAgICBjb25zdCByZXMgPSBwYXJ0c1xuICAgICAgICAucmVwbGFjZSgvXy9nLCAnJylcbiAgICAgICAgLnNwbGl0KCc6JylcbiAgICAgICAgLnJlZHVjZSgocmVzLCBwKSA9PiByZXMgKiBudW0oNjApICsgbnVtKHApLCBudW0oMCkpO1xuICAgIHJldHVybiAoc2lnbiA9PT0gJy0nID8gbnVtKC0xKSAqIHJlcyA6IHJlcyk7XG59XG4vKipcbiAqIGhoaGg6bW06c3Muc3NzXG4gKlxuICogSW50ZXJuYWwgdHlwZXMgaGFuZGxlIGJpZ2ludCBhcyBudW1iZXIsIGJlY2F1c2UgVFMgY2FuJ3QgZmlndXJlIGl0IG91dC5cbiAqL1xuZnVuY3Rpb24gc3RyaW5naWZ5U2V4YWdlc2ltYWwobm9kZSkge1xuICAgIGxldCB7IHZhbHVlIH0gPSBub2RlO1xuICAgIGxldCBudW0gPSAobikgPT4gbjtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnYmlnaW50JylcbiAgICAgICAgbnVtID0gbiA9PiBCaWdJbnQobik7XG4gICAgZWxzZSBpZiAoaXNOYU4odmFsdWUpIHx8ICFpc0Zpbml0ZSh2YWx1ZSkpXG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlOdW1iZXIobm9kZSk7XG4gICAgbGV0IHNpZ24gPSAnJztcbiAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgIHNpZ24gPSAnLSc7XG4gICAgICAgIHZhbHVlICo9IG51bSgtMSk7XG4gICAgfVxuICAgIGNvbnN0IF82MCA9IG51bSg2MCk7XG4gICAgY29uc3QgcGFydHMgPSBbdmFsdWUgJSBfNjBdOyAvLyBzZWNvbmRzLCBpbmNsdWRpbmcgbXNcbiAgICBpZiAodmFsdWUgPCA2MCkge1xuICAgICAgICBwYXJ0cy51bnNoaWZ0KDApOyAvLyBhdCBsZWFzdCBvbmUgOiBpcyByZXF1aXJlZFxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSAodmFsdWUgLSBwYXJ0c1swXSkgLyBfNjA7XG4gICAgICAgIHBhcnRzLnVuc2hpZnQodmFsdWUgJSBfNjApOyAvLyBtaW51dGVzXG4gICAgICAgIGlmICh2YWx1ZSA+PSA2MCkge1xuICAgICAgICAgICAgdmFsdWUgPSAodmFsdWUgLSBwYXJ0c1swXSkgLyBfNjA7XG4gICAgICAgICAgICBwYXJ0cy51bnNoaWZ0KHZhbHVlKTsgLy8gaG91cnNcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKHNpZ24gK1xuICAgICAgICBwYXJ0c1xuICAgICAgICAgICAgLm1hcChuID0+IFN0cmluZyhuKS5wYWRTdGFydCgyLCAnMCcpKVxuICAgICAgICAgICAgLmpvaW4oJzonKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzAwMDAwMFxcZCokLywgJycpIC8vICUgNjAgbWF5IGludHJvZHVjZSBlcnJvclxuICAgICk7XG59XG5jb25zdCBpbnRUaW1lID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnIHx8IE51bWJlci5pc0ludGVnZXIodmFsdWUpLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdUSU1FJyxcbiAgICB0ZXN0OiAvXlstK10/WzAtOV1bMC05X10qKD86OlswLTVdP1swLTldKSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgeyBpbnRBc0JpZ0ludCB9KSA9PiBwYXJzZVNleGFnZXNpbWFsKHN0ciwgaW50QXNCaWdJbnQpLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5U2V4YWdlc2ltYWxcbn07XG5jb25zdCBmbG9hdFRpbWUgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgZm9ybWF0OiAnVElNRScsXG4gICAgdGVzdDogL15bLStdP1swLTldWzAtOV9dKig/OjpbMC01XT9bMC05XSkrXFwuWzAtOV9dKiQvLFxuICAgIHJlc29sdmU6IHN0ciA9PiBwYXJzZVNleGFnZXNpbWFsKHN0ciwgZmFsc2UpLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5U2V4YWdlc2ltYWxcbn07XG5jb25zdCB0aW1lc3RhbXAgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlIGluc3RhbmNlb2YgRGF0ZSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOnRpbWVzdGFtcCcsXG4gICAgLy8gSWYgdGhlIHRpbWUgem9uZSBpcyBvbWl0dGVkLCB0aGUgdGltZXN0YW1wIGlzIGFzc3VtZWQgdG8gYmUgc3BlY2lmaWVkIGluIFVUQy4gVGhlIHRpbWUgcGFydFxuICAgIC8vIG1heSBiZSBvbWl0dGVkIGFsdG9nZXRoZXIsIHJlc3VsdGluZyBpbiBhIGRhdGUgZm9ybWF0LiBJbiBzdWNoIGEgY2FzZSwgdGhlIHRpbWUgcGFydCBpc1xuICAgIC8vIGFzc3VtZWQgdG8gYmUgMDA6MDA6MDBaIChzdGFydCBvZiBkYXksIFVUQykuXG4gICAgdGVzdDogUmVnRXhwKCdeKFswLTldezR9KS0oWzAtOV17MSwyfSktKFswLTldezEsMn0pJyArIC8vIFlZWVktTW0tRGRcbiAgICAgICAgJyg/OicgKyAvLyB0aW1lIGlzIG9wdGlvbmFsXG4gICAgICAgICcoPzp0fFR8WyBcXFxcdF0rKScgKyAvLyB0IHwgVCB8IHdoaXRlc3BhY2VcbiAgICAgICAgJyhbMC05XXsxLDJ9KTooWzAtOV17MSwyfSk6KFswLTldezEsMn0oXFxcXC5bMC05XSspPyknICsgLy8gSGg6TW06U3MoLnNzKT9cbiAgICAgICAgJyg/OlsgXFxcXHRdKihafFstK11bMDEyXT9bMC05XSg/OjpbMC05XXsyfSk/KSk/JyArIC8vIFogfCArNSB8IC0wMzozMFxuICAgICAgICAnKT8kJyksXG4gICAgcmVzb2x2ZShzdHIpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBzdHIubWF0Y2godGltZXN0YW1wLnRlc3QpO1xuICAgICAgICBpZiAoIW1hdGNoKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCchIXRpbWVzdGFtcCBleHBlY3RzIGEgZGF0ZSwgc3RhcnRpbmcgd2l0aCB5eXl5LW1tLWRkJyk7XG4gICAgICAgIGNvbnN0IFssIHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kXSA9IG1hdGNoLm1hcChOdW1iZXIpO1xuICAgICAgICBjb25zdCBtaWxsaXNlYyA9IG1hdGNoWzddID8gTnVtYmVyKChtYXRjaFs3XSArICcwMCcpLnN1YnN0cigxLCAzKSkgOiAwO1xuICAgICAgICBsZXQgZGF0ZSA9IERhdGUuVVRDKHllYXIsIG1vbnRoIC0gMSwgZGF5LCBob3VyIHx8IDAsIG1pbnV0ZSB8fCAwLCBzZWNvbmQgfHwgMCwgbWlsbGlzZWMpO1xuICAgICAgICBjb25zdCB0eiA9IG1hdGNoWzhdO1xuICAgICAgICBpZiAodHogJiYgdHogIT09ICdaJykge1xuICAgICAgICAgICAgbGV0IGQgPSBwYXJzZVNleGFnZXNpbWFsKHR6LCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoZCkgPCAzMClcbiAgICAgICAgICAgICAgICBkICo9IDYwO1xuICAgICAgICAgICAgZGF0ZSAtPSA2MDAwMCAqIGQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUpO1xuICAgIH0sXG4gICAgc3RyaW5naWZ5OiAoeyB2YWx1ZSB9KSA9PiB2YWx1ZT8udG9JU09TdHJpbmcoKS5yZXBsYWNlKC8oVDAwOjAwOjAwKT9cXC4wMDBaJC8sICcnKSA/PyAnJ1xufTtcblxuZXhwb3J0IHsgZmxvYXRUaW1lLCBpbnRUaW1lLCB0aW1lc3RhbXAgfTtcbiIsICJpbXBvcnQgeyBtYXAgfSBmcm9tICcuLi9jb21tb24vbWFwLmpzJztcbmltcG9ydCB7IG51bGxUYWcgfSBmcm9tICcuLi9jb21tb24vbnVsbC5qcyc7XG5pbXBvcnQgeyBzZXEgfSBmcm9tICcuLi9jb21tb24vc2VxLmpzJztcbmltcG9ydCB7IHN0cmluZyB9IGZyb20gJy4uL2NvbW1vbi9zdHJpbmcuanMnO1xuaW1wb3J0IHsgYmluYXJ5IH0gZnJvbSAnLi9iaW5hcnkuanMnO1xuaW1wb3J0IHsgdHJ1ZVRhZywgZmFsc2VUYWcgfSBmcm9tICcuL2Jvb2wuanMnO1xuaW1wb3J0IHsgZmxvYXROYU4sIGZsb2F0RXhwLCBmbG9hdCB9IGZyb20gJy4vZmxvYXQuanMnO1xuaW1wb3J0IHsgaW50QmluLCBpbnRPY3QsIGludCwgaW50SGV4IH0gZnJvbSAnLi9pbnQuanMnO1xuaW1wb3J0IHsgbWVyZ2UgfSBmcm9tICcuL21lcmdlLmpzJztcbmltcG9ydCB7IG9tYXAgfSBmcm9tICcuL29tYXAuanMnO1xuaW1wb3J0IHsgcGFpcnMgfSBmcm9tICcuL3BhaXJzLmpzJztcbmltcG9ydCB7IHNldCB9IGZyb20gJy4vc2V0LmpzJztcbmltcG9ydCB7IGludFRpbWUsIGZsb2F0VGltZSwgdGltZXN0YW1wIH0gZnJvbSAnLi90aW1lc3RhbXAuanMnO1xuXG5jb25zdCBzY2hlbWEgPSBbXG4gICAgbWFwLFxuICAgIHNlcSxcbiAgICBzdHJpbmcsXG4gICAgbnVsbFRhZyxcbiAgICB0cnVlVGFnLFxuICAgIGZhbHNlVGFnLFxuICAgIGludEJpbixcbiAgICBpbnRPY3QsXG4gICAgaW50LFxuICAgIGludEhleCxcbiAgICBmbG9hdE5hTixcbiAgICBmbG9hdEV4cCxcbiAgICBmbG9hdCxcbiAgICBiaW5hcnksXG4gICAgbWVyZ2UsXG4gICAgb21hcCxcbiAgICBwYWlycyxcbiAgICBzZXQsXG4gICAgaW50VGltZSxcbiAgICBmbG9hdFRpbWUsXG4gICAgdGltZXN0YW1wXG5dO1xuXG5leHBvcnQgeyBzY2hlbWEgfTtcbiIsICJpbXBvcnQgeyBtYXAgfSBmcm9tICcuL2NvbW1vbi9tYXAuanMnO1xuaW1wb3J0IHsgbnVsbFRhZyB9IGZyb20gJy4vY29tbW9uL251bGwuanMnO1xuaW1wb3J0IHsgc2VxIH0gZnJvbSAnLi9jb21tb24vc2VxLmpzJztcbmltcG9ydCB7IHN0cmluZyB9IGZyb20gJy4vY29tbW9uL3N0cmluZy5qcyc7XG5pbXBvcnQgeyBib29sVGFnIH0gZnJvbSAnLi9jb3JlL2Jvb2wuanMnO1xuaW1wb3J0IHsgZmxvYXROYU4sIGZsb2F0RXhwLCBmbG9hdCB9IGZyb20gJy4vY29yZS9mbG9hdC5qcyc7XG5pbXBvcnQgeyBpbnRPY3QsIGludEhleCwgaW50IH0gZnJvbSAnLi9jb3JlL2ludC5qcyc7XG5pbXBvcnQgeyBzY2hlbWEgfSBmcm9tICcuL2NvcmUvc2NoZW1hLmpzJztcbmltcG9ydCB7IHNjaGVtYSBhcyBzY2hlbWEkMSB9IGZyb20gJy4vanNvbi9zY2hlbWEuanMnO1xuaW1wb3J0IHsgYmluYXJ5IH0gZnJvbSAnLi95YW1sLTEuMS9iaW5hcnkuanMnO1xuaW1wb3J0IHsgbWVyZ2UgfSBmcm9tICcuL3lhbWwtMS4xL21lcmdlLmpzJztcbmltcG9ydCB7IG9tYXAgfSBmcm9tICcuL3lhbWwtMS4xL29tYXAuanMnO1xuaW1wb3J0IHsgcGFpcnMgfSBmcm9tICcuL3lhbWwtMS4xL3BhaXJzLmpzJztcbmltcG9ydCB7IHNjaGVtYSBhcyBzY2hlbWEkMiB9IGZyb20gJy4veWFtbC0xLjEvc2NoZW1hLmpzJztcbmltcG9ydCB7IHNldCB9IGZyb20gJy4veWFtbC0xLjEvc2V0LmpzJztcbmltcG9ydCB7IHRpbWVzdGFtcCwgaW50VGltZSwgZmxvYXRUaW1lIH0gZnJvbSAnLi95YW1sLTEuMS90aW1lc3RhbXAuanMnO1xuXG5jb25zdCBzY2hlbWFzID0gbmV3IE1hcChbXG4gICAgWydjb3JlJywgc2NoZW1hXSxcbiAgICBbJ2ZhaWxzYWZlJywgW21hcCwgc2VxLCBzdHJpbmddXSxcbiAgICBbJ2pzb24nLCBzY2hlbWEkMV0sXG4gICAgWyd5YW1sMTEnLCBzY2hlbWEkMl0sXG4gICAgWyd5YW1sLTEuMScsIHNjaGVtYSQyXVxuXSk7XG5jb25zdCB0YWdzQnlOYW1lID0ge1xuICAgIGJpbmFyeSxcbiAgICBib29sOiBib29sVGFnLFxuICAgIGZsb2F0LFxuICAgIGZsb2F0RXhwLFxuICAgIGZsb2F0TmFOLFxuICAgIGZsb2F0VGltZSxcbiAgICBpbnQsXG4gICAgaW50SGV4LFxuICAgIGludE9jdCxcbiAgICBpbnRUaW1lLFxuICAgIG1hcCxcbiAgICBtZXJnZSxcbiAgICBudWxsOiBudWxsVGFnLFxuICAgIG9tYXAsXG4gICAgcGFpcnMsXG4gICAgc2VxLFxuICAgIHNldCxcbiAgICB0aW1lc3RhbXBcbn07XG5jb25zdCBjb3JlS25vd25UYWdzID0ge1xuICAgICd0YWc6eWFtbC5vcmcsMjAwMjpiaW5hcnknOiBiaW5hcnksXG4gICAgJ3RhZzp5YW1sLm9yZywyMDAyOm1lcmdlJzogbWVyZ2UsXG4gICAgJ3RhZzp5YW1sLm9yZywyMDAyOm9tYXAnOiBvbWFwLFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjpwYWlycyc6IHBhaXJzLFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjpzZXQnOiBzZXQsXG4gICAgJ3RhZzp5YW1sLm9yZywyMDAyOnRpbWVzdGFtcCc6IHRpbWVzdGFtcFxufTtcbmZ1bmN0aW9uIGdldFRhZ3MoY3VzdG9tVGFncywgc2NoZW1hTmFtZSwgYWRkTWVyZ2VUYWcpIHtcbiAgICBjb25zdCBzY2hlbWFUYWdzID0gc2NoZW1hcy5nZXQoc2NoZW1hTmFtZSk7XG4gICAgaWYgKHNjaGVtYVRhZ3MgJiYgIWN1c3RvbVRhZ3MpIHtcbiAgICAgICAgcmV0dXJuIGFkZE1lcmdlVGFnICYmICFzY2hlbWFUYWdzLmluY2x1ZGVzKG1lcmdlKVxuICAgICAgICAgICAgPyBzY2hlbWFUYWdzLmNvbmNhdChtZXJnZSlcbiAgICAgICAgICAgIDogc2NoZW1hVGFncy5zbGljZSgpO1xuICAgIH1cbiAgICBsZXQgdGFncyA9IHNjaGVtYVRhZ3M7XG4gICAgaWYgKCF0YWdzKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGN1c3RvbVRhZ3MpKVxuICAgICAgICAgICAgdGFncyA9IFtdO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGtleXMgPSBBcnJheS5mcm9tKHNjaGVtYXMua2V5cygpKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoa2V5ID0+IGtleSAhPT0gJ3lhbWwxMScpXG4gICAgICAgICAgICAgICAgLm1hcChrZXkgPT4gSlNPTi5zdHJpbmdpZnkoa2V5KSlcbiAgICAgICAgICAgICAgICAuam9pbignLCAnKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBzY2hlbWEgXCIke3NjaGVtYU5hbWV9XCI7IHVzZSBvbmUgb2YgJHtrZXlzfSBvciBkZWZpbmUgY3VzdG9tVGFncyBhcnJheWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KGN1c3RvbVRhZ3MpKSB7XG4gICAgICAgIGZvciAoY29uc3QgdGFnIG9mIGN1c3RvbVRhZ3MpXG4gICAgICAgICAgICB0YWdzID0gdGFncy5jb25jYXQodGFnKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGN1c3RvbVRhZ3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGFncyA9IGN1c3RvbVRhZ3ModGFncy5zbGljZSgpKTtcbiAgICB9XG4gICAgaWYgKGFkZE1lcmdlVGFnKVxuICAgICAgICB0YWdzID0gdGFncy5jb25jYXQobWVyZ2UpO1xuICAgIHJldHVybiB0YWdzLnJlZHVjZSgodGFncywgdGFnKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhZ09iaiA9IHR5cGVvZiB0YWcgPT09ICdzdHJpbmcnID8gdGFnc0J5TmFtZVt0YWddIDogdGFnO1xuICAgICAgICBpZiAoIXRhZ09iaikge1xuICAgICAgICAgICAgY29uc3QgdGFnTmFtZSA9IEpTT04uc3RyaW5naWZ5KHRhZyk7XG4gICAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGFnc0J5TmFtZSlcbiAgICAgICAgICAgICAgICAubWFwKGtleSA9PiBKU09OLnN0cmluZ2lmeShrZXkpKVxuICAgICAgICAgICAgICAgIC5qb2luKCcsICcpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGN1c3RvbSB0YWcgJHt0YWdOYW1lfTsgdXNlIG9uZSBvZiAke2tleXN9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0YWdzLmluY2x1ZGVzKHRhZ09iaikpXG4gICAgICAgICAgICB0YWdzLnB1c2godGFnT2JqKTtcbiAgICAgICAgcmV0dXJuIHRhZ3M7XG4gICAgfSwgW10pO1xufVxuXG5leHBvcnQgeyBjb3JlS25vd25UYWdzLCBnZXRUYWdzIH07XG4iLCAiaW1wb3J0IHsgTUFQLCBTQ0FMQVIsIFNFUSB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IG1hcCB9IGZyb20gJy4vY29tbW9uL21hcC5qcyc7XG5pbXBvcnQgeyBzZXEgfSBmcm9tICcuL2NvbW1vbi9zZXEuanMnO1xuaW1wb3J0IHsgc3RyaW5nIH0gZnJvbSAnLi9jb21tb24vc3RyaW5nLmpzJztcbmltcG9ydCB7IGdldFRhZ3MsIGNvcmVLbm93blRhZ3MgfSBmcm9tICcuL3RhZ3MuanMnO1xuXG5jb25zdCBzb3J0TWFwRW50cmllc0J5S2V5ID0gKGEsIGIpID0+IGEua2V5IDwgYi5rZXkgPyAtMSA6IGEua2V5ID4gYi5rZXkgPyAxIDogMDtcbmNsYXNzIFNjaGVtYSB7XG4gICAgY29uc3RydWN0b3IoeyBjb21wYXQsIGN1c3RvbVRhZ3MsIG1lcmdlLCByZXNvbHZlS25vd25UYWdzLCBzY2hlbWEsIHNvcnRNYXBFbnRyaWVzLCB0b1N0cmluZ0RlZmF1bHRzIH0pIHtcbiAgICAgICAgdGhpcy5jb21wYXQgPSBBcnJheS5pc0FycmF5KGNvbXBhdClcbiAgICAgICAgICAgID8gZ2V0VGFncyhjb21wYXQsICdjb21wYXQnKVxuICAgICAgICAgICAgOiBjb21wYXRcbiAgICAgICAgICAgICAgICA/IGdldFRhZ3MobnVsbCwgY29tcGF0KVxuICAgICAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgdGhpcy5uYW1lID0gKHR5cGVvZiBzY2hlbWEgPT09ICdzdHJpbmcnICYmIHNjaGVtYSkgfHwgJ2NvcmUnO1xuICAgICAgICB0aGlzLmtub3duVGFncyA9IHJlc29sdmVLbm93blRhZ3MgPyBjb3JlS25vd25UYWdzIDoge307XG4gICAgICAgIHRoaXMudGFncyA9IGdldFRhZ3MoY3VzdG9tVGFncywgdGhpcy5uYW1lLCBtZXJnZSk7XG4gICAgICAgIHRoaXMudG9TdHJpbmdPcHRpb25zID0gdG9TdHJpbmdEZWZhdWx0cyA/PyBudWxsO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgTUFQLCB7IHZhbHVlOiBtYXAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBTQ0FMQVIsIHsgdmFsdWU6IHN0cmluZyB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFNFUSwgeyB2YWx1ZTogc2VxIH0pO1xuICAgICAgICAvLyBVc2VkIGJ5IGNyZWF0ZU1hcCgpXG4gICAgICAgIHRoaXMuc29ydE1hcEVudHJpZXMgPVxuICAgICAgICAgICAgdHlwZW9mIHNvcnRNYXBFbnRyaWVzID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgPyBzb3J0TWFwRW50cmllc1xuICAgICAgICAgICAgICAgIDogc29ydE1hcEVudHJpZXMgPT09IHRydWVcbiAgICAgICAgICAgICAgICAgICAgPyBzb3J0TWFwRW50cmllc0J5S2V5XG4gICAgICAgICAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIGNvbnN0IGNvcHkgPSBPYmplY3QuY3JlYXRlKFNjaGVtYS5wcm90b3R5cGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHRoaXMpKTtcbiAgICAgICAgY29weS50YWdzID0gdGhpcy50YWdzLnNsaWNlKCk7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cbn1cblxuZXhwb3J0IHsgU2NoZW1hIH07XG4iLCAiaW1wb3J0IHsgaXNOb2RlIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgY3JlYXRlU3RyaW5naWZ5Q29udGV4dCwgc3RyaW5naWZ5IH0gZnJvbSAnLi9zdHJpbmdpZnkuanMnO1xuaW1wb3J0IHsgaW5kZW50Q29tbWVudCwgbGluZUNvbW1lbnQgfSBmcm9tICcuL3N0cmluZ2lmeUNvbW1lbnQuanMnO1xuXG5mdW5jdGlvbiBzdHJpbmdpZnlEb2N1bWVudChkb2MsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBsaW5lcyA9IFtdO1xuICAgIGxldCBoYXNEaXJlY3RpdmVzID0gb3B0aW9ucy5kaXJlY3RpdmVzID09PSB0cnVlO1xuICAgIGlmIChvcHRpb25zLmRpcmVjdGl2ZXMgIT09IGZhbHNlICYmIGRvYy5kaXJlY3RpdmVzKSB7XG4gICAgICAgIGNvbnN0IGRpciA9IGRvYy5kaXJlY3RpdmVzLnRvU3RyaW5nKGRvYyk7XG4gICAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goZGlyKTtcbiAgICAgICAgICAgIGhhc0RpcmVjdGl2ZXMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRvYy5kaXJlY3RpdmVzLmRvY1N0YXJ0KVxuICAgICAgICAgICAgaGFzRGlyZWN0aXZlcyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChoYXNEaXJlY3RpdmVzKVxuICAgICAgICBsaW5lcy5wdXNoKCctLS0nKTtcbiAgICBjb25zdCBjdHggPSBjcmVhdGVTdHJpbmdpZnlDb250ZXh0KGRvYywgb3B0aW9ucyk7XG4gICAgY29uc3QgeyBjb21tZW50U3RyaW5nIH0gPSBjdHgub3B0aW9ucztcbiAgICBpZiAoZG9jLmNvbW1lbnRCZWZvcmUpIHtcbiAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCAhPT0gMSlcbiAgICAgICAgICAgIGxpbmVzLnVuc2hpZnQoJycpO1xuICAgICAgICBjb25zdCBjcyA9IGNvbW1lbnRTdHJpbmcoZG9jLmNvbW1lbnRCZWZvcmUpO1xuICAgICAgICBsaW5lcy51bnNoaWZ0KGluZGVudENvbW1lbnQoY3MsICcnKSk7XG4gICAgfVxuICAgIGxldCBjaG9tcEtlZXAgPSBmYWxzZTtcbiAgICBsZXQgY29udGVudENvbW1lbnQgPSBudWxsO1xuICAgIGlmIChkb2MuY29udGVudHMpIHtcbiAgICAgICAgaWYgKGlzTm9kZShkb2MuY29udGVudHMpKSB7XG4gICAgICAgICAgICBpZiAoZG9jLmNvbnRlbnRzLnNwYWNlQmVmb3JlICYmIGhhc0RpcmVjdGl2ZXMpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICBpZiAoZG9jLmNvbnRlbnRzLmNvbW1lbnRCZWZvcmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcyA9IGNvbW1lbnRTdHJpbmcoZG9jLmNvbnRlbnRzLmNvbW1lbnRCZWZvcmUpO1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goaW5kZW50Q29tbWVudChjcywgJycpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHRvcC1sZXZlbCBibG9jayBzY2FsYXJzIG5lZWQgdG8gYmUgaW5kZW50ZWQgaWYgZm9sbG93ZWQgYnkgYSBjb21tZW50XG4gICAgICAgICAgICBjdHguZm9yY2VCbG9ja0luZGVudCA9ICEhZG9jLmNvbW1lbnQ7XG4gICAgICAgICAgICBjb250ZW50Q29tbWVudCA9IGRvYy5jb250ZW50cy5jb21tZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9uQ2hvbXBLZWVwID0gY29udGVudENvbW1lbnQgPyB1bmRlZmluZWQgOiAoKSA9PiAoY2hvbXBLZWVwID0gdHJ1ZSk7XG4gICAgICAgIGxldCBib2R5ID0gc3RyaW5naWZ5KGRvYy5jb250ZW50cywgY3R4LCAoKSA9PiAoY29udGVudENvbW1lbnQgPSBudWxsKSwgb25DaG9tcEtlZXApO1xuICAgICAgICBpZiAoY29udGVudENvbW1lbnQpXG4gICAgICAgICAgICBib2R5ICs9IGxpbmVDb21tZW50KGJvZHksICcnLCBjb21tZW50U3RyaW5nKGNvbnRlbnRDb21tZW50KSk7XG4gICAgICAgIGlmICgoYm9keVswXSA9PT0gJ3wnIHx8IGJvZHlbMF0gPT09ICc+JykgJiZcbiAgICAgICAgICAgIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnLS0tJykge1xuICAgICAgICAgICAgLy8gVG9wLWxldmVsIGJsb2NrIHNjYWxhcnMgd2l0aCBhIHByZWNlZGluZyBkb2MgbWFya2VyIG91Z2h0IHRvIHVzZSB0aGVcbiAgICAgICAgICAgIC8vIHNhbWUgbGluZSBmb3IgdGhlaXIgaGVhZGVyLlxuICAgICAgICAgICAgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPSBgLS0tICR7Ym9keX1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxpbmVzLnB1c2goYm9keSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBsaW5lcy5wdXNoKHN0cmluZ2lmeShkb2MuY29udGVudHMsIGN0eCkpO1xuICAgIH1cbiAgICBpZiAoZG9jLmRpcmVjdGl2ZXM/LmRvY0VuZCkge1xuICAgICAgICBpZiAoZG9jLmNvbW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNzID0gY29tbWVudFN0cmluZyhkb2MuY29tbWVudCk7XG4gICAgICAgICAgICBpZiAoY3MuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnLi4uJyk7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChpbmRlbnRDb21tZW50KGNzLCAnJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChgLi4uICR7Y3N9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKCcuLi4nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbGV0IGRjID0gZG9jLmNvbW1lbnQ7XG4gICAgICAgIGlmIChkYyAmJiBjaG9tcEtlZXApXG4gICAgICAgICAgICBkYyA9IGRjLnJlcGxhY2UoL15cXG4rLywgJycpO1xuICAgICAgICBpZiAoZGMpIHtcbiAgICAgICAgICAgIGlmICgoIWNob21wS2VlcCB8fCBjb250ZW50Q29tbWVudCkgJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gIT09ICcnKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgbGluZXMucHVzaChpbmRlbnRDb21tZW50KGNvbW1lbnRTdHJpbmcoZGMpLCAnJykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKSArICdcXG4nO1xufVxuXG5leHBvcnQgeyBzdHJpbmdpZnlEb2N1bWVudCB9O1xuIiwgImltcG9ydCB7IEFsaWFzIH0gZnJvbSAnLi4vbm9kZXMvQWxpYXMuanMnO1xuaW1wb3J0IHsgaXNFbXB0eVBhdGgsIGNvbGxlY3Rpb25Gcm9tUGF0aCB9IGZyb20gJy4uL25vZGVzL0NvbGxlY3Rpb24uanMnO1xuaW1wb3J0IHsgTk9ERV9UWVBFLCBET0MsIGlzTm9kZSwgaXNDb2xsZWN0aW9uLCBpc1NjYWxhciB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFBhaXIgfSBmcm9tICcuLi9ub2Rlcy9QYWlyLmpzJztcbmltcG9ydCB7IHRvSlMgfSBmcm9tICcuLi9ub2Rlcy90b0pTLmpzJztcbmltcG9ydCB7IFNjaGVtYSB9IGZyb20gJy4uL3NjaGVtYS9TY2hlbWEuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5RG9jdW1lbnQgfSBmcm9tICcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5RG9jdW1lbnQuanMnO1xuaW1wb3J0IHsgYW5jaG9yTmFtZXMsIGZpbmROZXdBbmNob3IsIGNyZWF0ZU5vZGVBbmNob3JzIH0gZnJvbSAnLi9hbmNob3JzLmpzJztcbmltcG9ydCB7IGFwcGx5UmV2aXZlciB9IGZyb20gJy4vYXBwbHlSZXZpdmVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZU5vZGUgfSBmcm9tICcuL2NyZWF0ZU5vZGUuanMnO1xuaW1wb3J0IHsgRGlyZWN0aXZlcyB9IGZyb20gJy4vZGlyZWN0aXZlcy5qcyc7XG5cbmNsYXNzIERvY3VtZW50IHtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSwgcmVwbGFjZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgLyoqIEEgY29tbWVudCBiZWZvcmUgdGhpcyBEb2N1bWVudCAqL1xuICAgICAgICB0aGlzLmNvbW1lbnRCZWZvcmUgPSBudWxsO1xuICAgICAgICAvKiogQSBjb21tZW50IGltbWVkaWF0ZWx5IGFmdGVyIHRoaXMgRG9jdW1lbnQgKi9cbiAgICAgICAgdGhpcy5jb21tZW50ID0gbnVsbDtcbiAgICAgICAgLyoqIEVycm9ycyBlbmNvdW50ZXJlZCBkdXJpbmcgcGFyc2luZy4gKi9cbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgLyoqIFdhcm5pbmdzIGVuY291bnRlcmVkIGR1cmluZyBwYXJzaW5nLiAqL1xuICAgICAgICB0aGlzLndhcm5pbmdzID0gW107XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBOT0RFX1RZUEUsIHsgdmFsdWU6IERPQyB9KTtcbiAgICAgICAgbGV0IF9yZXBsYWNlciA9IG51bGw7XG4gICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicgfHwgQXJyYXkuaXNBcnJheShyZXBsYWNlcikpIHtcbiAgICAgICAgICAgIF9yZXBsYWNlciA9IHJlcGxhY2VyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXBsYWNlcikge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHJlcGxhY2VyO1xuICAgICAgICAgICAgcmVwbGFjZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb3B0ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBpbnRBc0JpZ0ludDogZmFsc2UsXG4gICAgICAgICAgICBrZWVwU291cmNlVG9rZW5zOiBmYWxzZSxcbiAgICAgICAgICAgIGxvZ0xldmVsOiAnd2FybicsXG4gICAgICAgICAgICBwcmV0dHlFcnJvcnM6IHRydWUsXG4gICAgICAgICAgICBzdHJpY3Q6IHRydWUsXG4gICAgICAgICAgICBzdHJpbmdLZXlzOiBmYWxzZSxcbiAgICAgICAgICAgIHVuaXF1ZUtleXM6IHRydWUsXG4gICAgICAgICAgICB2ZXJzaW9uOiAnMS4yJ1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0O1xuICAgICAgICBsZXQgeyB2ZXJzaW9uIH0gPSBvcHQ7XG4gICAgICAgIGlmIChvcHRpb25zPy5fZGlyZWN0aXZlcykge1xuICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gb3B0aW9ucy5fZGlyZWN0aXZlcy5hdERvY3VtZW50KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzLnlhbWwuZXhwbGljaXQpXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IHRoaXMuZGlyZWN0aXZlcy55YW1sLnZlcnNpb247XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gbmV3IERpcmVjdGl2ZXMoeyB2ZXJzaW9uIH0pO1xuICAgICAgICB0aGlzLnNldFNjaGVtYSh2ZXJzaW9uLCBvcHRpb25zKTtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgdGhpcy5jb250ZW50cyA9XG4gICAgICAgICAgICB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHRoaXMuY3JlYXRlTm9kZSh2YWx1ZSwgX3JlcGxhY2VyLCBvcHRpb25zKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgZGVlcCBjb3B5IG9mIHRoaXMgRG9jdW1lbnQgYW5kIGl0cyBjb250ZW50cy5cbiAgICAgKlxuICAgICAqIEN1c3RvbSBOb2RlIHZhbHVlcyB0aGF0IGluaGVyaXQgZnJvbSBgT2JqZWN0YCBzdGlsbCByZWZlciB0byB0aGVpciBvcmlnaW5hbCBpbnN0YW5jZXMuXG4gICAgICovXG4gICAgY2xvbmUoKSB7XG4gICAgICAgIGNvbnN0IGNvcHkgPSBPYmplY3QuY3JlYXRlKERvY3VtZW50LnByb3RvdHlwZSwge1xuICAgICAgICAgICAgW05PREVfVFlQRV06IHsgdmFsdWU6IERPQyB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb3B5LmNvbW1lbnRCZWZvcmUgPSB0aGlzLmNvbW1lbnRCZWZvcmU7XG4gICAgICAgIGNvcHkuY29tbWVudCA9IHRoaXMuY29tbWVudDtcbiAgICAgICAgY29weS5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgpO1xuICAgICAgICBjb3B5Lndhcm5pbmdzID0gdGhpcy53YXJuaW5ncy5zbGljZSgpO1xuICAgICAgICBjb3B5Lm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgY29weS5kaXJlY3RpdmVzID0gdGhpcy5kaXJlY3RpdmVzLmNsb25lKCk7XG4gICAgICAgIGNvcHkuc2NoZW1hID0gdGhpcy5zY2hlbWEuY2xvbmUoKTtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgY29weS5jb250ZW50cyA9IGlzTm9kZSh0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLmNsb25lKGNvcHkuc2NoZW1hKVxuICAgICAgICAgICAgOiB0aGlzLmNvbnRlbnRzO1xuICAgICAgICBpZiAodGhpcy5yYW5nZSlcbiAgICAgICAgICAgIGNvcHkucmFuZ2UgPSB0aGlzLnJhbmdlLnNsaWNlKCk7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cbiAgICAvKiogQWRkcyBhIHZhbHVlIHRvIHRoZSBkb2N1bWVudC4gKi9cbiAgICBhZGQodmFsdWUpIHtcbiAgICAgICAgaWYgKGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cykpXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzLmFkZCh2YWx1ZSk7XG4gICAgfVxuICAgIC8qKiBBZGRzIGEgdmFsdWUgdG8gdGhlIGRvY3VtZW50LiAqL1xuICAgIGFkZEluKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIGlmIChhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpKVxuICAgICAgICAgICAgdGhpcy5jb250ZW50cy5hZGRJbihwYXRoLCB2YWx1ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBgQWxpYXNgIG5vZGUsIGVuc3VyaW5nIHRoYXQgdGhlIHRhcmdldCBgbm9kZWAgaGFzIHRoZSByZXF1aXJlZCBhbmNob3IuXG4gICAgICpcbiAgICAgKiBJZiBgbm9kZWAgYWxyZWFkeSBoYXMgYW4gYW5jaG9yLCBgbmFtZWAgaXMgaWdub3JlZC5cbiAgICAgKiBPdGhlcndpc2UsIHRoZSBgbm9kZS5hbmNob3JgIHZhbHVlIHdpbGwgYmUgc2V0IHRvIGBuYW1lYCxcbiAgICAgKiBvciBpZiBhbiBhbmNob3Igd2l0aCB0aGF0IG5hbWUgaXMgYWxyZWFkeSBwcmVzZW50IGluIHRoZSBkb2N1bWVudCxcbiAgICAgKiBgbmFtZWAgd2lsbCBiZSB1c2VkIGFzIGEgcHJlZml4IGZvciBhIG5ldyB1bmlxdWUgYW5jaG9yLlxuICAgICAqIElmIGBuYW1lYCBpcyB1bmRlZmluZWQsIHRoZSBnZW5lcmF0ZWQgYW5jaG9yIHdpbGwgdXNlICdhJyBhcyBhIHByZWZpeC5cbiAgICAgKi9cbiAgICBjcmVhdGVBbGlhcyhub2RlLCBuYW1lKSB7XG4gICAgICAgIGlmICghbm9kZS5hbmNob3IpIHtcbiAgICAgICAgICAgIGNvbnN0IHByZXYgPSBhbmNob3JOYW1lcyh0aGlzKTtcbiAgICAgICAgICAgIG5vZGUuYW5jaG9yID1cbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3ByZWZlci1udWxsaXNoLWNvYWxlc2NpbmdcbiAgICAgICAgICAgICAgICAhbmFtZSB8fCBwcmV2LmhhcyhuYW1lKSA/IGZpbmROZXdBbmNob3IobmFtZSB8fCAnYScsIHByZXYpIDogbmFtZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEFsaWFzKG5vZGUuYW5jaG9yKTtcbiAgICB9XG4gICAgY3JlYXRlTm9kZSh2YWx1ZSwgcmVwbGFjZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgbGV0IF9yZXBsYWNlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdmFsdWUgPSByZXBsYWNlci5jYWxsKHsgJyc6IHZhbHVlIH0sICcnLCB2YWx1ZSk7XG4gICAgICAgICAgICBfcmVwbGFjZXIgPSByZXBsYWNlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlcGxhY2VyKSkge1xuICAgICAgICAgICAgY29uc3Qga2V5VG9TdHIgPSAodikgPT4gdHlwZW9mIHYgPT09ICdudW1iZXInIHx8IHYgaW5zdGFuY2VvZiBTdHJpbmcgfHwgdiBpbnN0YW5jZW9mIE51bWJlcjtcbiAgICAgICAgICAgIGNvbnN0IGFzU3RyID0gcmVwbGFjZXIuZmlsdGVyKGtleVRvU3RyKS5tYXAoU3RyaW5nKTtcbiAgICAgICAgICAgIGlmIChhc1N0ci5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHJlcGxhY2VyID0gcmVwbGFjZXIuY29uY2F0KGFzU3RyKTtcbiAgICAgICAgICAgIF9yZXBsYWNlciA9IHJlcGxhY2VyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXBsYWNlcikge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHJlcGxhY2VyO1xuICAgICAgICAgICAgcmVwbGFjZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyBhbGlhc0R1cGxpY2F0ZU9iamVjdHMsIGFuY2hvclByZWZpeCwgZmxvdywga2VlcFVuZGVmaW5lZCwgb25UYWdPYmosIHRhZyB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgICAgICAgY29uc3QgeyBvbkFuY2hvciwgc2V0QW5jaG9ycywgc291cmNlT2JqZWN0cyB9ID0gY3JlYXRlTm9kZUFuY2hvcnModGhpcywgXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLW51bGxpc2gtY29hbGVzY2luZ1xuICAgICAgICBhbmNob3JQcmVmaXggfHwgJ2EnKTtcbiAgICAgICAgY29uc3QgY3R4ID0ge1xuICAgICAgICAgICAgYWxpYXNEdXBsaWNhdGVPYmplY3RzOiBhbGlhc0R1cGxpY2F0ZU9iamVjdHMgPz8gdHJ1ZSxcbiAgICAgICAgICAgIGtlZXBVbmRlZmluZWQ6IGtlZXBVbmRlZmluZWQgPz8gZmFsc2UsXG4gICAgICAgICAgICBvbkFuY2hvcixcbiAgICAgICAgICAgIG9uVGFnT2JqLFxuICAgICAgICAgICAgcmVwbGFjZXI6IF9yZXBsYWNlcixcbiAgICAgICAgICAgIHNjaGVtYTogdGhpcy5zY2hlbWEsXG4gICAgICAgICAgICBzb3VyY2VPYmplY3RzXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG5vZGUgPSBjcmVhdGVOb2RlKHZhbHVlLCB0YWcsIGN0eCk7XG4gICAgICAgIGlmIChmbG93ICYmIGlzQ29sbGVjdGlvbihub2RlKSlcbiAgICAgICAgICAgIG5vZGUuZmxvdyA9IHRydWU7XG4gICAgICAgIHNldEFuY2hvcnMoKTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgYSBrZXkgYW5kIGEgdmFsdWUgaW50byBhIGBQYWlyYCB1c2luZyB0aGUgY3VycmVudCBzY2hlbWEsXG4gICAgICogcmVjdXJzaXZlbHkgd3JhcHBpbmcgYWxsIHZhbHVlcyBhcyBgU2NhbGFyYCBvciBgQ29sbGVjdGlvbmAgbm9kZXMuXG4gICAgICovXG4gICAgY3JlYXRlUGFpcihrZXksIHZhbHVlLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgY29uc3QgayA9IHRoaXMuY3JlYXRlTm9kZShrZXksIG51bGwsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCB2ID0gdGhpcy5jcmVhdGVOb2RlKHZhbHVlLCBudWxsLCBvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQYWlyKGssIHYpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgdmFsdWUgZnJvbSB0aGUgZG9jdW1lbnQuXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBpdGVtIHdhcyBmb3VuZCBhbmQgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBkZWxldGUoa2V5KSB7XG4gICAgICAgIHJldHVybiBhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpID8gdGhpcy5jb250ZW50cy5kZWxldGUoa2V5KSA6IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgdmFsdWUgZnJvbSB0aGUgZG9jdW1lbnQuXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBpdGVtIHdhcyBmb3VuZCBhbmQgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBkZWxldGVJbihwYXRoKSB7XG4gICAgICAgIGlmIChpc0VtcHR5UGF0aChwYXRoKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29udGVudHMgPT0gbnVsbClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFByZXN1bWVkIGltcG9zc2libGUgaWYgU3RyaWN0IGV4dGVuZHMgZmFsc2VcbiAgICAgICAgICAgIHRoaXMuY29udGVudHMgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cylcbiAgICAgICAgICAgID8gdGhpcy5jb250ZW50cy5kZWxldGVJbihwYXRoKVxuICAgICAgICAgICAgOiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBpdGVtIGF0IGBrZXlgLCBvciBgdW5kZWZpbmVkYCBpZiBub3QgZm91bmQuIEJ5IGRlZmF1bHQgdW53cmFwc1xuICAgICAqIHNjYWxhciB2YWx1ZXMgZnJvbSB0aGVpciBzdXJyb3VuZGluZyBub2RlOyB0byBkaXNhYmxlIHNldCBga2VlcFNjYWxhcmAgdG9cbiAgICAgKiBgdHJ1ZWAgKGNvbGxlY3Rpb25zIGFyZSBhbHdheXMgcmV0dXJuZWQgaW50YWN0KS5cbiAgICAgKi9cbiAgICBnZXQoa2V5LCBrZWVwU2NhbGFyKSB7XG4gICAgICAgIHJldHVybiBpc0NvbGxlY3Rpb24odGhpcy5jb250ZW50cylcbiAgICAgICAgICAgID8gdGhpcy5jb250ZW50cy5nZXQoa2V5LCBrZWVwU2NhbGFyKVxuICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgaXRlbSBhdCBgcGF0aGAsIG9yIGB1bmRlZmluZWRgIGlmIG5vdCBmb3VuZC4gQnkgZGVmYXVsdCB1bndyYXBzXG4gICAgICogc2NhbGFyIHZhbHVlcyBmcm9tIHRoZWlyIHN1cnJvdW5kaW5nIG5vZGU7IHRvIGRpc2FibGUgc2V0IGBrZWVwU2NhbGFyYCB0b1xuICAgICAqIGB0cnVlYCAoY29sbGVjdGlvbnMgYXJlIGFsd2F5cyByZXR1cm5lZCBpbnRhY3QpLlxuICAgICAqL1xuICAgIGdldEluKHBhdGgsIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgaWYgKGlzRW1wdHlQYXRoKHBhdGgpKVxuICAgICAgICAgICAgcmV0dXJuICFrZWVwU2NhbGFyICYmIGlzU2NhbGFyKHRoaXMuY29udGVudHMpXG4gICAgICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLnZhbHVlXG4gICAgICAgICAgICAgICAgOiB0aGlzLmNvbnRlbnRzO1xuICAgICAgICByZXR1cm4gaXNDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpXG4gICAgICAgICAgICA/IHRoaXMuY29udGVudHMuZ2V0SW4ocGF0aCwga2VlcFNjYWxhcilcbiAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGRvY3VtZW50IGluY2x1ZGVzIGEgdmFsdWUgd2l0aCB0aGUga2V5IGBrZXlgLlxuICAgICAqL1xuICAgIGhhcyhrZXkpIHtcbiAgICAgICAgcmV0dXJuIGlzQ29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSA/IHRoaXMuY29udGVudHMuaGFzKGtleSkgOiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBkb2N1bWVudCBpbmNsdWRlcyBhIHZhbHVlIGF0IGBwYXRoYC5cbiAgICAgKi9cbiAgICBoYXNJbihwYXRoKSB7XG4gICAgICAgIGlmIChpc0VtcHR5UGF0aChwYXRoKSlcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRlbnRzICE9PSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBpc0NvbGxlY3Rpb24odGhpcy5jb250ZW50cykgPyB0aGlzLmNvbnRlbnRzLmhhc0luKHBhdGgpIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBpbiB0aGlzIGRvY3VtZW50LiBGb3IgYCEhc2V0YCwgYHZhbHVlYCBuZWVkcyB0byBiZSBhXG4gICAgICogYm9vbGVhbiB0byBhZGQvcmVtb3ZlIHRoZSBpdGVtIGZyb20gdGhlIHNldC5cbiAgICAgKi9cbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5jb250ZW50cyA9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFdlIGNhbid0IHJlYWxseSBrbm93IHRoYXQgdGhpcyBtYXRjaGVzIENvbnRlbnRzLlxuICAgICAgICAgICAgdGhpcy5jb250ZW50cyA9IGNvbGxlY3Rpb25Gcm9tUGF0aCh0aGlzLnNjaGVtYSwgW2tleV0sIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgdmFsdWUgaW4gdGhpcyBkb2N1bWVudC4gRm9yIGAhIXNldGAsIGB2YWx1ZWAgbmVlZHMgdG8gYmUgYVxuICAgICAqIGJvb2xlYW4gdG8gYWRkL3JlbW92ZSB0aGUgaXRlbSBmcm9tIHRoZSBzZXQuXG4gICAgICovXG4gICAgc2V0SW4ocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGlzRW1wdHlQYXRoKHBhdGgpKSB7XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFdlIGNhbid0IHJlYWxseSBrbm93IHRoYXQgdGhpcyBtYXRjaGVzIENvbnRlbnRzLlxuICAgICAgICAgICAgdGhpcy5jb250ZW50cyA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY29udGVudHMgPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgICAgIHRoaXMuY29udGVudHMgPSBjb2xsZWN0aW9uRnJvbVBhdGgodGhpcy5zY2hlbWEsIEFycmF5LmZyb20ocGF0aCksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzLnNldEluKHBhdGgsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdGhlIFlBTUwgdmVyc2lvbiBhbmQgc2NoZW1hIHVzZWQgYnkgdGhlIGRvY3VtZW50LlxuICAgICAqIEEgYG51bGxgIHZlcnNpb24gZGlzYWJsZXMgc3VwcG9ydCBmb3IgZGlyZWN0aXZlcywgZXhwbGljaXQgdGFncywgYW5jaG9ycywgYW5kIGFsaWFzZXMuXG4gICAgICogSXQgYWxzbyByZXF1aXJlcyB0aGUgYHNjaGVtYWAgb3B0aW9uIHRvIGJlIGdpdmVuIGFzIGEgYFNjaGVtYWAgaW5zdGFuY2UgdmFsdWUuXG4gICAgICpcbiAgICAgKiBPdmVycmlkZXMgYWxsIHByZXZpb3VzbHkgc2V0IHNjaGVtYSBvcHRpb25zLlxuICAgICAqL1xuICAgIHNldFNjaGVtYSh2ZXJzaW9uLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHZlcnNpb24gPSBTdHJpbmcodmVyc2lvbik7XG4gICAgICAgIGxldCBvcHQ7XG4gICAgICAgIHN3aXRjaCAodmVyc2lvbikge1xuICAgICAgICAgICAgY2FzZSAnMS4xJzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMueWFtbC52ZXJzaW9uID0gJzEuMSc7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBuZXcgRGlyZWN0aXZlcyh7IHZlcnNpb246ICcxLjEnIH0pO1xuICAgICAgICAgICAgICAgIG9wdCA9IHsgcmVzb2x2ZUtub3duVGFnczogZmFsc2UsIHNjaGVtYTogJ3lhbWwtMS4xJyB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnMS4yJzpcbiAgICAgICAgICAgIGNhc2UgJ25leHQnOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRpcmVjdGl2ZXMpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcy55YW1sLnZlcnNpb24gPSB2ZXJzaW9uO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gbmV3IERpcmVjdGl2ZXMoeyB2ZXJzaW9uIH0pO1xuICAgICAgICAgICAgICAgIG9wdCA9IHsgcmVzb2x2ZUtub3duVGFnczogdHJ1ZSwgc2NoZW1hOiAnY29yZScgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgbnVsbDpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5kaXJlY3RpdmVzO1xuICAgICAgICAgICAgICAgIG9wdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3YgPSBKU09OLnN0cmluZ2lmeSh2ZXJzaW9uKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkICcxLjEnLCAnMS4yJyBvciBudWxsIGFzIGZpcnN0IGFyZ3VtZW50LCBidXQgZm91bmQ6ICR7c3Z9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gTm90IHVzaW5nIGBpbnN0YW5jZW9mIFNjaGVtYWAgdG8gYWxsb3cgZm9yIGR1Y2sgdHlwaW5nXG4gICAgICAgIGlmIChvcHRpb25zLnNjaGVtYSBpbnN0YW5jZW9mIE9iamVjdClcbiAgICAgICAgICAgIHRoaXMuc2NoZW1hID0gb3B0aW9ucy5zY2hlbWE7XG4gICAgICAgIGVsc2UgaWYgKG9wdClcbiAgICAgICAgICAgIHRoaXMuc2NoZW1hID0gbmV3IFNjaGVtYShPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdpdGggYSBudWxsIFlBTUwgdmVyc2lvbiwgdGhlIHsgc2NoZW1hOiBTY2hlbWEgfSBvcHRpb24gaXMgcmVxdWlyZWRgKTtcbiAgICB9XG4gICAgLy8ganNvbiAmIGpzb25BcmcgYXJlIG9ubHkgdXNlZCBmcm9tIHRvSlNPTigpXG4gICAgdG9KUyh7IGpzb24sIGpzb25BcmcsIG1hcEFzTWFwLCBtYXhBbGlhc0NvdW50LCBvbkFuY2hvciwgcmV2aXZlciB9ID0ge30pIHtcbiAgICAgICAgY29uc3QgY3R4ID0ge1xuICAgICAgICAgICAgYW5jaG9yczogbmV3IE1hcCgpLFxuICAgICAgICAgICAgZG9jOiB0aGlzLFxuICAgICAgICAgICAga2VlcDogIWpzb24sXG4gICAgICAgICAgICBtYXBBc01hcDogbWFwQXNNYXAgPT09IHRydWUsXG4gICAgICAgICAgICBtYXBLZXlXYXJuZWQ6IGZhbHNlLFxuICAgICAgICAgICAgbWF4QWxpYXNDb3VudDogdHlwZW9mIG1heEFsaWFzQ291bnQgPT09ICdudW1iZXInID8gbWF4QWxpYXNDb3VudCA6IDEwMFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXMgPSB0b0pTKHRoaXMuY29udGVudHMsIGpzb25BcmcgPz8gJycsIGN0eCk7XG4gICAgICAgIGlmICh0eXBlb2Ygb25BbmNob3IgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgY291bnQsIHJlcyB9IG9mIGN0eC5hbmNob3JzLnZhbHVlcygpKVxuICAgICAgICAgICAgICAgIG9uQW5jaG9yKHJlcywgY291bnQpO1xuICAgICAgICByZXR1cm4gdHlwZW9mIHJldml2ZXIgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHsgJyc6IHJlcyB9LCAnJywgcmVzKVxuICAgICAgICAgICAgOiByZXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZG9jdW1lbnQgYGNvbnRlbnRzYC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBqc29uQXJnIFVzZWQgYnkgYEpTT04uc3RyaW5naWZ5YCB0byBpbmRpY2F0ZSB0aGUgYXJyYXkgaW5kZXggb3JcbiAgICAgKiAgIHByb3BlcnR5IG5hbWUuXG4gICAgICovXG4gICAgdG9KU09OKGpzb25BcmcsIG9uQW5jaG9yKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvSlMoeyBqc29uOiB0cnVlLCBqc29uQXJnLCBtYXBBc01hcDogZmFsc2UsIG9uQW5jaG9yIH0pO1xuICAgIH1cbiAgICAvKiogQSBZQU1MIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkb2N1bWVudC4gKi9cbiAgICB0b1N0cmluZyhvcHRpb25zID0ge30pIHtcbiAgICAgICAgaWYgKHRoaXMuZXJyb3JzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RvY3VtZW50IHdpdGggZXJyb3JzIGNhbm5vdCBiZSBzdHJpbmdpZmllZCcpO1xuICAgICAgICBpZiAoJ2luZGVudCcgaW4gb3B0aW9ucyAmJlxuICAgICAgICAgICAgKCFOdW1iZXIuaXNJbnRlZ2VyKG9wdGlvbnMuaW5kZW50KSB8fCBOdW1iZXIob3B0aW9ucy5pbmRlbnQpIDw9IDApKSB7XG4gICAgICAgICAgICBjb25zdCBzID0gSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5pbmRlbnQpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcImluZGVudFwiIG9wdGlvbiBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlciwgbm90ICR7c31gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5naWZ5RG9jdW1lbnQodGhpcywgb3B0aW9ucyk7XG4gICAgfVxufVxuZnVuY3Rpb24gYXNzZXJ0Q29sbGVjdGlvbihjb250ZW50cykge1xuICAgIGlmIChpc0NvbGxlY3Rpb24oY29udGVudHMpKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGEgWUFNTCBjb2xsZWN0aW9uIGFzIGRvY3VtZW50IGNvbnRlbnRzJyk7XG59XG5cbmV4cG9ydCB7IERvY3VtZW50IH07XG4iLCAiY2xhc3MgWUFNTEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHBvcywgY29kZSwgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLmNvZGUgPSBjb2RlO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB0aGlzLnBvcyA9IHBvcztcbiAgICB9XG59XG5jbGFzcyBZQU1MUGFyc2VFcnJvciBleHRlbmRzIFlBTUxFcnJvciB7XG4gICAgY29uc3RydWN0b3IocG9zLCBjb2RlLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKCdZQU1MUGFyc2VFcnJvcicsIHBvcywgY29kZSwgbWVzc2FnZSk7XG4gICAgfVxufVxuY2xhc3MgWUFNTFdhcm5pbmcgZXh0ZW5kcyBZQU1MRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKHBvcywgY29kZSwgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcignWUFNTFdhcm5pbmcnLCBwb3MsIGNvZGUsIG1lc3NhZ2UpO1xuICAgIH1cbn1cbmNvbnN0IHByZXR0aWZ5RXJyb3IgPSAoc3JjLCBsYykgPT4gKGVycm9yKSA9PiB7XG4gICAgaWYgKGVycm9yLnBvc1swXSA9PT0gLTEpXG4gICAgICAgIHJldHVybjtcbiAgICBlcnJvci5saW5lUG9zID0gZXJyb3IucG9zLm1hcChwb3MgPT4gbGMubGluZVBvcyhwb3MpKTtcbiAgICBjb25zdCB7IGxpbmUsIGNvbCB9ID0gZXJyb3IubGluZVBvc1swXTtcbiAgICBlcnJvci5tZXNzYWdlICs9IGAgYXQgbGluZSAke2xpbmV9LCBjb2x1bW4gJHtjb2x9YDtcbiAgICBsZXQgY2kgPSBjb2wgLSAxO1xuICAgIGxldCBsaW5lU3RyID0gc3JjXG4gICAgICAgIC5zdWJzdHJpbmcobGMubGluZVN0YXJ0c1tsaW5lIC0gMV0sIGxjLmxpbmVTdGFydHNbbGluZV0pXG4gICAgICAgIC5yZXBsYWNlKC9bXFxuXFxyXSskLywgJycpO1xuICAgIC8vIFRyaW0gdG8gbWF4IDgwIGNoYXJzLCBrZWVwaW5nIGNvbCBwb3NpdGlvbiBuZWFyIHRoZSBtaWRkbGVcbiAgICBpZiAoY2kgPj0gNjAgJiYgbGluZVN0ci5sZW5ndGggPiA4MCkge1xuICAgICAgICBjb25zdCB0cmltU3RhcnQgPSBNYXRoLm1pbihjaSAtIDM5LCBsaW5lU3RyLmxlbmd0aCAtIDc5KTtcbiAgICAgICAgbGluZVN0ciA9ICdcdTIwMjYnICsgbGluZVN0ci5zdWJzdHJpbmcodHJpbVN0YXJ0KTtcbiAgICAgICAgY2kgLT0gdHJpbVN0YXJ0IC0gMTtcbiAgICB9XG4gICAgaWYgKGxpbmVTdHIubGVuZ3RoID4gODApXG4gICAgICAgIGxpbmVTdHIgPSBsaW5lU3RyLnN1YnN0cmluZygwLCA3OSkgKyAnXHUyMDI2JztcbiAgICAvLyBJbmNsdWRlIHByZXZpb3VzIGxpbmUgaW4gY29udGV4dCBpZiBwb2ludGluZyBhdCBsaW5lIHN0YXJ0XG4gICAgaWYgKGxpbmUgPiAxICYmIC9eICokLy50ZXN0KGxpbmVTdHIuc3Vic3RyaW5nKDAsIGNpKSkpIHtcbiAgICAgICAgLy8gUmVnZXhwIHdvbid0IG1hdGNoIGlmIHN0YXJ0IGlzIHRyaW1tZWRcbiAgICAgICAgbGV0IHByZXYgPSBzcmMuc3Vic3RyaW5nKGxjLmxpbmVTdGFydHNbbGluZSAtIDJdLCBsYy5saW5lU3RhcnRzW2xpbmUgLSAxXSk7XG4gICAgICAgIGlmIChwcmV2Lmxlbmd0aCA+IDgwKVxuICAgICAgICAgICAgcHJldiA9IHByZXYuc3Vic3RyaW5nKDAsIDc5KSArICdcdTIwMjZcXG4nO1xuICAgICAgICBsaW5lU3RyID0gcHJldiArIGxpbmVTdHI7XG4gICAgfVxuICAgIGlmICgvW14gXS8udGVzdChsaW5lU3RyKSkge1xuICAgICAgICBsZXQgY291bnQgPSAxO1xuICAgICAgICBjb25zdCBlbmQgPSBlcnJvci5saW5lUG9zWzFdO1xuICAgICAgICBpZiAoZW5kPy5saW5lID09PSBsaW5lICYmIGVuZC5jb2wgPiBjb2wpIHtcbiAgICAgICAgICAgIGNvdW50ID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oZW5kLmNvbCAtIGNvbCwgODAgLSBjaSkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvaW50ZXIgPSAnICcucmVwZWF0KGNpKSArICdeJy5yZXBlYXQoY291bnQpO1xuICAgICAgICBlcnJvci5tZXNzYWdlICs9IGA6XFxuXFxuJHtsaW5lU3RyfVxcbiR7cG9pbnRlcn1cXG5gO1xuICAgIH1cbn07XG5cbmV4cG9ydCB7IFlBTUxFcnJvciwgWUFNTFBhcnNlRXJyb3IsIFlBTUxXYXJuaW5nLCBwcmV0dGlmeUVycm9yIH07XG4iLCAiZnVuY3Rpb24gcmVzb2x2ZVByb3BzKHRva2VucywgeyBmbG93LCBpbmRpY2F0b3IsIG5leHQsIG9mZnNldCwgb25FcnJvciwgcGFyZW50SW5kZW50LCBzdGFydE9uTmV3bGluZSB9KSB7XG4gICAgbGV0IHNwYWNlQmVmb3JlID0gZmFsc2U7XG4gICAgbGV0IGF0TmV3bGluZSA9IHN0YXJ0T25OZXdsaW5lO1xuICAgIGxldCBoYXNTcGFjZSA9IHN0YXJ0T25OZXdsaW5lO1xuICAgIGxldCBjb21tZW50ID0gJyc7XG4gICAgbGV0IGNvbW1lbnRTZXAgPSAnJztcbiAgICBsZXQgaGFzTmV3bGluZSA9IGZhbHNlO1xuICAgIGxldCByZXFTcGFjZSA9IGZhbHNlO1xuICAgIGxldCB0YWIgPSBudWxsO1xuICAgIGxldCBhbmNob3IgPSBudWxsO1xuICAgIGxldCB0YWcgPSBudWxsO1xuICAgIGxldCBuZXdsaW5lQWZ0ZXJQcm9wID0gbnVsbDtcbiAgICBsZXQgY29tbWEgPSBudWxsO1xuICAgIGxldCBmb3VuZCA9IG51bGw7XG4gICAgbGV0IHN0YXJ0ID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgICAgICBpZiAocmVxU3BhY2UpIHtcbiAgICAgICAgICAgIGlmICh0b2tlbi50eXBlICE9PSAnc3BhY2UnICYmXG4gICAgICAgICAgICAgICAgdG9rZW4udHlwZSAhPT0gJ25ld2xpbmUnICYmXG4gICAgICAgICAgICAgICAgdG9rZW4udHlwZSAhPT0gJ2NvbW1hJylcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLm9mZnNldCwgJ01JU1NJTkdfQ0hBUicsICdUYWdzIGFuZCBhbmNob3JzIG11c3QgYmUgc2VwYXJhdGVkIGZyb20gdGhlIG5leHQgdG9rZW4gYnkgd2hpdGUgc3BhY2UnKTtcbiAgICAgICAgICAgIHJlcVNwYWNlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhYikge1xuICAgICAgICAgICAgaWYgKGF0TmV3bGluZSAmJiB0b2tlbi50eXBlICE9PSAnY29tbWVudCcgJiYgdG9rZW4udHlwZSAhPT0gJ25ld2xpbmUnKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0YWIsICdUQUJfQVNfSU5ERU5UJywgJ1RhYnMgYXJlIG5vdCBhbGxvd2VkIGFzIGluZGVudGF0aW9uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YWIgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIC8vIEF0IHRoZSBkb2MgbGV2ZWwsIHRhYnMgYXQgbGluZSBzdGFydCBtYXkgYmUgcGFyc2VkXG4gICAgICAgICAgICAgICAgLy8gYXMgbGVhZGluZyB3aGl0ZSBzcGFjZSByYXRoZXIgdGhhbiBpbmRlbnRhdGlvbi5cbiAgICAgICAgICAgICAgICAvLyBJbiBhIGZsb3cgY29sbGVjdGlvbiwgb25seSB0aGUgcGFyc2VyIGhhbmRsZXMgaW5kZW50LlxuICAgICAgICAgICAgICAgIGlmICghZmxvdyAmJlxuICAgICAgICAgICAgICAgICAgICAoaW5kaWNhdG9yICE9PSAnZG9jLXN0YXJ0JyB8fCBuZXh0Py50eXBlICE9PSAnZmxvdy1jb2xsZWN0aW9uJykgJiZcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uc291cmNlLmluY2x1ZGVzKCdcXHQnKSkge1xuICAgICAgICAgICAgICAgICAgICB0YWIgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6IHtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc1NwYWNlKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTUlTU0lOR19DSEFSJywgJ0NvbW1lbnRzIG11c3QgYmUgc2VwYXJhdGVkIGZyb20gb3RoZXIgdG9rZW5zIGJ5IHdoaXRlIHNwYWNlIGNoYXJhY3RlcnMnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjYiA9IHRva2VuLnNvdXJjZS5zdWJzdHJpbmcoMSkgfHwgJyAnO1xuICAgICAgICAgICAgICAgIGlmICghY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudCA9IGNiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudCArPSBjb21tZW50U2VwICsgY2I7XG4gICAgICAgICAgICAgICAgY29tbWVudFNlcCA9ICcnO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgaWYgKGF0TmV3bGluZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgKz0gdG9rZW4uc291cmNlO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZm91bmQgfHwgaW5kaWNhdG9yICE9PSAnc2VxLWl0ZW0taW5kJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwYWNlQmVmb3JlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjb21tZW50U2VwICs9IHRva2VuLnNvdXJjZTtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGhhc05ld2xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChhbmNob3IgfHwgdGFnKVxuICAgICAgICAgICAgICAgICAgICBuZXdsaW5lQWZ0ZXJQcm9wID0gdG9rZW47XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgICAgICBpZiAoYW5jaG9yKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTVVMVElQTEVfQU5DSE9SUycsICdBIG5vZGUgY2FuIGhhdmUgYXQgbW9zdCBvbmUgYW5jaG9yJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLnNvdXJjZS5lbmRzV2l0aCgnOicpKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLm9mZnNldCArIHRva2VuLnNvdXJjZS5sZW5ndGggLSAxLCAnQkFEX0FMSUFTJywgJ0FuY2hvciBlbmRpbmcgaW4gOiBpcyBhbWJpZ3VvdXMnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBhbmNob3IgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBzdGFydCA/PyAoc3RhcnQgPSB0b2tlbi5vZmZzZXQpO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmVxU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndGFnJzoge1xuICAgICAgICAgICAgICAgIGlmICh0YWcpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdNVUxUSVBMRV9UQUdTJywgJ0Egbm9kZSBjYW4gaGF2ZSBhdCBtb3N0IG9uZSB0YWcnKTtcbiAgICAgICAgICAgICAgICB0YWcgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBzdGFydCA/PyAoc3RhcnQgPSB0b2tlbi5vZmZzZXQpO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmVxU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBpbmRpY2F0b3I6XG4gICAgICAgICAgICAgICAgLy8gQ291bGQgaGVyZSBoYW5kbGUgcHJlY2VkaW5nIGNvbW1lbnRzIGRpZmZlcmVudGx5XG4gICAgICAgICAgICAgICAgaWYgKGFuY2hvciB8fCB0YWcpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdCQURfUFJPUF9PUkRFUicsIGBBbmNob3JzIGFuZCB0YWdzIG11c3QgYmUgYWZ0ZXIgdGhlICR7dG9rZW4uc291cmNlfSBpbmRpY2F0b3JgKTtcbiAgICAgICAgICAgICAgICBpZiAoZm91bmQpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgJHt0b2tlbi5zb3VyY2V9IGluICR7ZmxvdyA/PyAnY29sbGVjdGlvbid9YCk7XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPVxuICAgICAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPT09ICdzZXEtaXRlbS1pbmQnIHx8IGluZGljYXRvciA9PT0gJ2V4cGxpY2l0LWtleS1pbmQnO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb21tYSc6XG4gICAgICAgICAgICAgICAgaWYgKGZsb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbW1hKVxuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAsIGluICR7Zmxvd31gKTtcbiAgICAgICAgICAgICAgICAgICAgY29tbWEgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgYXROZXdsaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGVsc2UgZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAke3Rva2VuLnR5cGV9IHRva2VuYCk7XG4gICAgICAgICAgICAgICAgYXROZXdsaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBsYXN0ID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICBjb25zdCBlbmQgPSBsYXN0ID8gbGFzdC5vZmZzZXQgKyBsYXN0LnNvdXJjZS5sZW5ndGggOiBvZmZzZXQ7XG4gICAgaWYgKHJlcVNwYWNlICYmXG4gICAgICAgIG5leHQgJiZcbiAgICAgICAgbmV4dC50eXBlICE9PSAnc3BhY2UnICYmXG4gICAgICAgIG5leHQudHlwZSAhPT0gJ25ld2xpbmUnICYmXG4gICAgICAgIG5leHQudHlwZSAhPT0gJ2NvbW1hJyAmJlxuICAgICAgICAobmV4dC50eXBlICE9PSAnc2NhbGFyJyB8fCBuZXh0LnNvdXJjZSAhPT0gJycpKSB7XG4gICAgICAgIG9uRXJyb3IobmV4dC5vZmZzZXQsICdNSVNTSU5HX0NIQVInLCAnVGFncyBhbmQgYW5jaG9ycyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIHRoZSBuZXh0IHRva2VuIGJ5IHdoaXRlIHNwYWNlJyk7XG4gICAgfVxuICAgIGlmICh0YWIgJiZcbiAgICAgICAgKChhdE5ld2xpbmUgJiYgdGFiLmluZGVudCA8PSBwYXJlbnRJbmRlbnQpIHx8XG4gICAgICAgICAgICBuZXh0Py50eXBlID09PSAnYmxvY2stbWFwJyB8fFxuICAgICAgICAgICAgbmV4dD8udHlwZSA9PT0gJ2Jsb2NrLXNlcScpKVxuICAgICAgICBvbkVycm9yKHRhYiwgJ1RBQl9BU19JTkRFTlQnLCAnVGFicyBhcmUgbm90IGFsbG93ZWQgYXMgaW5kZW50YXRpb24nKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb21tYSxcbiAgICAgICAgZm91bmQsXG4gICAgICAgIHNwYWNlQmVmb3JlLFxuICAgICAgICBjb21tZW50LFxuICAgICAgICBoYXNOZXdsaW5lLFxuICAgICAgICBhbmNob3IsXG4gICAgICAgIHRhZyxcbiAgICAgICAgbmV3bGluZUFmdGVyUHJvcCxcbiAgICAgICAgZW5kLFxuICAgICAgICBzdGFydDogc3RhcnQgPz8gZW5kXG4gICAgfTtcbn1cblxuZXhwb3J0IHsgcmVzb2x2ZVByb3BzIH07XG4iLCAiZnVuY3Rpb24gY29udGFpbnNOZXdsaW5lKGtleSkge1xuICAgIGlmICgha2V5KVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBzd2l0Y2ggKGtleS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBpZiAoa2V5LnNvdXJjZS5pbmNsdWRlcygnXFxuJykpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBpZiAoa2V5LmVuZClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIGtleS5lbmQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdC50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzpcbiAgICAgICAgICAgIGZvciAoY29uc3QgaXQgb2Yga2V5Lml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiBpdC5zdGFydClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0LnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0LnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGFpbnNOZXdsaW5lKGl0LmtleSkgfHwgY29udGFpbnNOZXdsaW5lKGl0LnZhbHVlKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IGNvbnRhaW5zTmV3bGluZSB9O1xuIiwgImltcG9ydCB7IGNvbnRhaW5zTmV3bGluZSB9IGZyb20gJy4vdXRpbC1jb250YWlucy1uZXdsaW5lLmpzJztcblxuZnVuY3Rpb24gZmxvd0luZGVudENoZWNrKGluZGVudCwgZmMsIG9uRXJyb3IpIHtcbiAgICBpZiAoZmM/LnR5cGUgPT09ICdmbG93LWNvbGxlY3Rpb24nKSB7XG4gICAgICAgIGNvbnN0IGVuZCA9IGZjLmVuZFswXTtcbiAgICAgICAgaWYgKGVuZC5pbmRlbnQgPT09IGluZGVudCAmJlxuICAgICAgICAgICAgKGVuZC5zb3VyY2UgPT09ICddJyB8fCBlbmQuc291cmNlID09PSAnfScpICYmXG4gICAgICAgICAgICBjb250YWluc05ld2xpbmUoZmMpKSB7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSAnRmxvdyBlbmQgaW5kaWNhdG9yIHNob3VsZCBiZSBtb3JlIGluZGVudGVkIHRoYW4gcGFyZW50JztcbiAgICAgICAgICAgIG9uRXJyb3IoZW5kLCAnQkFEX0lOREVOVCcsIG1zZywgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7IGZsb3dJbmRlbnRDaGVjayB9O1xuIiwgImltcG9ydCB7IGlzU2NhbGFyIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuXG5mdW5jdGlvbiBtYXBJbmNsdWRlcyhjdHgsIGl0ZW1zLCBzZWFyY2gpIHtcbiAgICBjb25zdCB7IHVuaXF1ZUtleXMgfSA9IGN0eC5vcHRpb25zO1xuICAgIGlmICh1bmlxdWVLZXlzID09PSBmYWxzZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGlzRXF1YWwgPSB0eXBlb2YgdW5pcXVlS2V5cyA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IHVuaXF1ZUtleXNcbiAgICAgICAgOiAoYSwgYikgPT4gYSA9PT0gYiB8fCAoaXNTY2FsYXIoYSkgJiYgaXNTY2FsYXIoYikgJiYgYS52YWx1ZSA9PT0gYi52YWx1ZSk7XG4gICAgcmV0dXJuIGl0ZW1zLnNvbWUocGFpciA9PiBpc0VxdWFsKHBhaXIua2V5LCBzZWFyY2gpKTtcbn1cblxuZXhwb3J0IHsgbWFwSW5jbHVkZXMgfTtcbiIsICJpbXBvcnQgeyBQYWlyIH0gZnJvbSAnLi4vbm9kZXMvUGFpci5qcyc7XG5pbXBvcnQgeyBZQU1MTWFwIH0gZnJvbSAnLi4vbm9kZXMvWUFNTE1hcC5qcyc7XG5pbXBvcnQgeyByZXNvbHZlUHJvcHMgfSBmcm9tICcuL3Jlc29sdmUtcHJvcHMuanMnO1xuaW1wb3J0IHsgY29udGFpbnNOZXdsaW5lIH0gZnJvbSAnLi91dGlsLWNvbnRhaW5zLW5ld2xpbmUuanMnO1xuaW1wb3J0IHsgZmxvd0luZGVudENoZWNrIH0gZnJvbSAnLi91dGlsLWZsb3ctaW5kZW50LWNoZWNrLmpzJztcbmltcG9ydCB7IG1hcEluY2x1ZGVzIH0gZnJvbSAnLi91dGlsLW1hcC1pbmNsdWRlcy5qcyc7XG5cbmNvbnN0IHN0YXJ0Q29sTXNnID0gJ0FsbCBtYXBwaW5nIGl0ZW1zIG11c3Qgc3RhcnQgYXQgdGhlIHNhbWUgY29sdW1uJztcbmZ1bmN0aW9uIHJlc29sdmVCbG9ja01hcCh7IGNvbXBvc2VOb2RlLCBjb21wb3NlRW1wdHlOb2RlIH0sIGN0eCwgYm0sIG9uRXJyb3IsIHRhZykge1xuICAgIGNvbnN0IE5vZGVDbGFzcyA9IHRhZz8ubm9kZUNsYXNzID8/IFlBTUxNYXA7XG4gICAgY29uc3QgbWFwID0gbmV3IE5vZGVDbGFzcyhjdHguc2NoZW1hKTtcbiAgICBpZiAoY3R4LmF0Um9vdClcbiAgICAgICAgY3R4LmF0Um9vdCA9IGZhbHNlO1xuICAgIGxldCBvZmZzZXQgPSBibS5vZmZzZXQ7XG4gICAgbGV0IGNvbW1lbnRFbmQgPSBudWxsO1xuICAgIGZvciAoY29uc3QgY29sbEl0ZW0gb2YgYm0uaXRlbXMpIHtcbiAgICAgICAgY29uc3QgeyBzdGFydCwga2V5LCBzZXAsIHZhbHVlIH0gPSBjb2xsSXRlbTtcbiAgICAgICAgLy8ga2V5IHByb3BlcnRpZXNcbiAgICAgICAgY29uc3Qga2V5UHJvcHMgPSByZXNvbHZlUHJvcHMoc3RhcnQsIHtcbiAgICAgICAgICAgIGluZGljYXRvcjogJ2V4cGxpY2l0LWtleS1pbmQnLFxuICAgICAgICAgICAgbmV4dDoga2V5ID8/IHNlcD8uWzBdLFxuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgIHBhcmVudEluZGVudDogYm0uaW5kZW50LFxuICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGltcGxpY2l0S2V5ID0gIWtleVByb3BzLmZvdW5kO1xuICAgICAgICBpZiAoaW1wbGljaXRLZXkpIHtcbiAgICAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5LnR5cGUgPT09ICdibG9jay1zZXEnKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JMT0NLX0FTX0lNUExJQ0lUX0tFWScsICdBIGJsb2NrIHNlcXVlbmNlIG1heSBub3QgYmUgdXNlZCBhcyBhbiBpbXBsaWNpdCBtYXAga2V5Jyk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoJ2luZGVudCcgaW4ga2V5ICYmIGtleS5pbmRlbnQgIT09IGJtLmluZGVudClcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCQURfSU5ERU5UJywgc3RhcnRDb2xNc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFrZXlQcm9wcy5hbmNob3IgJiYgIWtleVByb3BzLnRhZyAmJiAhc2VwKSB7XG4gICAgICAgICAgICAgICAgY29tbWVudEVuZCA9IGtleVByb3BzLmVuZDtcbiAgICAgICAgICAgICAgICBpZiAoa2V5UHJvcHMuY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWFwLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuY29tbWVudCArPSAnXFxuJyArIGtleVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5jb21tZW50ID0ga2V5UHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoa2V5UHJvcHMubmV3bGluZUFmdGVyUHJvcCB8fCBjb250YWluc05ld2xpbmUoa2V5KSkge1xuICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5ID8/IHN0YXJ0W3N0YXJ0Lmxlbmd0aCAtIDFdLCAnTVVMVElMSU5FX0lNUExJQ0lUX0tFWScsICdJbXBsaWNpdCBrZXlzIG5lZWQgdG8gYmUgb24gYSBzaW5nbGUgbGluZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGtleVByb3BzLmZvdW5kPy5pbmRlbnQgIT09IGJtLmluZGVudCkge1xuICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCQURfSU5ERU5UJywgc3RhcnRDb2xNc2cpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGtleSB2YWx1ZVxuICAgICAgICBjdHguYXRLZXkgPSB0cnVlO1xuICAgICAgICBjb25zdCBrZXlTdGFydCA9IGtleVByb3BzLmVuZDtcbiAgICAgICAgY29uc3Qga2V5Tm9kZSA9IGtleVxuICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIGtleSwga2V5UHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICA6IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBrZXlTdGFydCwgc3RhcnQsIG51bGwsIGtleVByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgaWYgKGN0eC5zY2hlbWEuY29tcGF0KVxuICAgICAgICAgICAgZmxvd0luZGVudENoZWNrKGJtLmluZGVudCwga2V5LCBvbkVycm9yKTtcbiAgICAgICAgY3R4LmF0S2V5ID0gZmFsc2U7XG4gICAgICAgIGlmIChtYXBJbmNsdWRlcyhjdHgsIG1hcC5pdGVtcywga2V5Tm9kZSkpXG4gICAgICAgICAgICBvbkVycm9yKGtleVN0YXJ0LCAnRFVQTElDQVRFX0tFWScsICdNYXAga2V5cyBtdXN0IGJlIHVuaXF1ZScpO1xuICAgICAgICAvLyB2YWx1ZSBwcm9wZXJ0aWVzXG4gICAgICAgIGNvbnN0IHZhbHVlUHJvcHMgPSByZXNvbHZlUHJvcHMoc2VwID8/IFtdLCB7XG4gICAgICAgICAgICBpbmRpY2F0b3I6ICdtYXAtdmFsdWUtaW5kJyxcbiAgICAgICAgICAgIG5leHQ6IHZhbHVlLFxuICAgICAgICAgICAgb2Zmc2V0OiBrZXlOb2RlLnJhbmdlWzJdLFxuICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgIHBhcmVudEluZGVudDogYm0uaW5kZW50LFxuICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6ICFrZXkgfHwga2V5LnR5cGUgPT09ICdibG9jay1zY2FsYXInXG4gICAgICAgIH0pO1xuICAgICAgICBvZmZzZXQgPSB2YWx1ZVByb3BzLmVuZDtcbiAgICAgICAgaWYgKHZhbHVlUHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgIGlmIChpbXBsaWNpdEtleSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZT8udHlwZSA9PT0gJ2Jsb2NrLW1hcCcgJiYgIXZhbHVlUHJvcHMuaGFzTmV3bGluZSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCTE9DS19BU19JTVBMSUNJVF9LRVknLCAnTmVzdGVkIG1hcHBpbmdzIGFyZSBub3QgYWxsb3dlZCBpbiBjb21wYWN0IG1hcHBpbmdzJyk7XG4gICAgICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLnN0cmljdCAmJlxuICAgICAgICAgICAgICAgICAgICBrZXlQcm9wcy5zdGFydCA8IHZhbHVlUHJvcHMuZm91bmQub2Zmc2V0IC0gMTAyNClcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihrZXlOb2RlLnJhbmdlLCAnS0VZX09WRVJfMTAyNF9DSEFSUycsICdUaGUgOiBpbmRpY2F0b3IgbXVzdCBiZSBhdCBtb3N0IDEwMjQgY2hhcnMgYWZ0ZXIgdGhlIHN0YXJ0IG9mIGFuIGltcGxpY2l0IGJsb2NrIG1hcHBpbmcga2V5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB2YWx1ZSB2YWx1ZVxuICAgICAgICAgICAgY29uc3QgdmFsdWVOb2RlID0gdmFsdWVcbiAgICAgICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHZhbHVlUHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgb2Zmc2V0LCBzZXAsIG51bGwsIHZhbHVlUHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGN0eC5zY2hlbWEuY29tcGF0KVxuICAgICAgICAgICAgICAgIGZsb3dJbmRlbnRDaGVjayhibS5pbmRlbnQsIHZhbHVlLCBvbkVycm9yKTtcbiAgICAgICAgICAgIG9mZnNldCA9IHZhbHVlTm9kZS5yYW5nZVsyXTtcbiAgICAgICAgICAgIGNvbnN0IHBhaXIgPSBuZXcgUGFpcihrZXlOb2RlLCB2YWx1ZU5vZGUpO1xuICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLmtlZXBTb3VyY2VUb2tlbnMpXG4gICAgICAgICAgICAgICAgcGFpci5zcmNUb2tlbiA9IGNvbGxJdGVtO1xuICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2gocGFpcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBrZXkgd2l0aCBubyB2YWx1ZVxuICAgICAgICAgICAgaWYgKGltcGxpY2l0S2V5KVxuICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5Tm9kZS5yYW5nZSwgJ01JU1NJTkdfQ0hBUicsICdJbXBsaWNpdCBtYXAga2V5cyBuZWVkIHRvIGJlIGZvbGxvd2VkIGJ5IG1hcCB2YWx1ZXMnKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZVByb3BzLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5Tm9kZS5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBrZXlOb2RlLmNvbW1lbnQgKz0gJ1xcbicgKyB2YWx1ZVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBrZXlOb2RlLmNvbW1lbnQgPSB2YWx1ZVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwYWlyID0gbmV3IFBhaXIoa2V5Tm9kZSk7XG4gICAgICAgICAgICBpZiAoY3R4Lm9wdGlvbnMua2VlcFNvdXJjZVRva2VucylcbiAgICAgICAgICAgICAgICBwYWlyLnNyY1Rva2VuID0gY29sbEl0ZW07XG4gICAgICAgICAgICBtYXAuaXRlbXMucHVzaChwYWlyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoY29tbWVudEVuZCAmJiBjb21tZW50RW5kIDwgb2Zmc2V0KVxuICAgICAgICBvbkVycm9yKGNvbW1lbnRFbmQsICdJTVBPU1NJQkxFJywgJ01hcCBjb21tZW50IHdpdGggdHJhaWxpbmcgY29udGVudCcpO1xuICAgIG1hcC5yYW5nZSA9IFtibS5vZmZzZXQsIG9mZnNldCwgY29tbWVudEVuZCA/PyBvZmZzZXRdO1xuICAgIHJldHVybiBtYXA7XG59XG5cbmV4cG9ydCB7IHJlc29sdmVCbG9ja01hcCB9O1xuIiwgImltcG9ydCB7IFlBTUxTZXEgfSBmcm9tICcuLi9ub2Rlcy9ZQU1MU2VxLmpzJztcbmltcG9ydCB7IHJlc29sdmVQcm9wcyB9IGZyb20gJy4vcmVzb2x2ZS1wcm9wcy5qcyc7XG5pbXBvcnQgeyBmbG93SW5kZW50Q2hlY2sgfSBmcm9tICcuL3V0aWwtZmxvdy1pbmRlbnQtY2hlY2suanMnO1xuXG5mdW5jdGlvbiByZXNvbHZlQmxvY2tTZXEoeyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9LCBjdHgsIGJzLCBvbkVycm9yLCB0YWcpIHtcbiAgICBjb25zdCBOb2RlQ2xhc3MgPSB0YWc/Lm5vZGVDbGFzcyA/PyBZQU1MU2VxO1xuICAgIGNvbnN0IHNlcSA9IG5ldyBOb2RlQ2xhc3MoY3R4LnNjaGVtYSk7XG4gICAgaWYgKGN0eC5hdFJvb3QpXG4gICAgICAgIGN0eC5hdFJvb3QgPSBmYWxzZTtcbiAgICBpZiAoY3R4LmF0S2V5KVxuICAgICAgICBjdHguYXRLZXkgPSBmYWxzZTtcbiAgICBsZXQgb2Zmc2V0ID0gYnMub2Zmc2V0O1xuICAgIGxldCBjb21tZW50RW5kID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IHsgc3RhcnQsIHZhbHVlIH0gb2YgYnMuaXRlbXMpIHtcbiAgICAgICAgY29uc3QgcHJvcHMgPSByZXNvbHZlUHJvcHMoc3RhcnQsIHtcbiAgICAgICAgICAgIGluZGljYXRvcjogJ3NlcS1pdGVtLWluZCcsXG4gICAgICAgICAgICBuZXh0OiB2YWx1ZSxcbiAgICAgICAgICAgIG9mZnNldCxcbiAgICAgICAgICAgIG9uRXJyb3IsXG4gICAgICAgICAgICBwYXJlbnRJbmRlbnQ6IGJzLmluZGVudCxcbiAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICBpZiAocHJvcHMuYW5jaG9yIHx8IHByb3BzLnRhZyB8fCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZT8udHlwZSA9PT0gJ2Jsb2NrLXNlcScpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuZW5kLCAnQkFEX0lOREVOVCcsICdBbGwgc2VxdWVuY2UgaXRlbXMgbXVzdCBzdGFydCBhdCB0aGUgc2FtZSBjb2x1bW4nKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnTUlTU0lOR19DSEFSJywgJ1NlcXVlbmNlIGl0ZW0gd2l0aG91dCAtIGluZGljYXRvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tbWVudEVuZCA9IHByb3BzLmVuZDtcbiAgICAgICAgICAgICAgICBpZiAocHJvcHMuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgc2VxLmNvbW1lbnQgPSBwcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5vZGUgPSB2YWx1ZVxuICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIHZhbHVlLCBwcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIHByb3BzLmVuZCwgc3RhcnQsIG51bGwsIHByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgaWYgKGN0eC5zY2hlbWEuY29tcGF0KVxuICAgICAgICAgICAgZmxvd0luZGVudENoZWNrKGJzLmluZGVudCwgdmFsdWUsIG9uRXJyb3IpO1xuICAgICAgICBvZmZzZXQgPSBub2RlLnJhbmdlWzJdO1xuICAgICAgICBzZXEuaXRlbXMucHVzaChub2RlKTtcbiAgICB9XG4gICAgc2VxLnJhbmdlID0gW2JzLm9mZnNldCwgb2Zmc2V0LCBjb21tZW50RW5kID8/IG9mZnNldF07XG4gICAgcmV0dXJuIHNlcTtcbn1cblxuZXhwb3J0IHsgcmVzb2x2ZUJsb2NrU2VxIH07XG4iLCAiZnVuY3Rpb24gcmVzb2x2ZUVuZChlbmQsIG9mZnNldCwgcmVxU3BhY2UsIG9uRXJyb3IpIHtcbiAgICBsZXQgY29tbWVudCA9ICcnO1xuICAgIGlmIChlbmQpIHtcbiAgICAgICAgbGV0IGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgIGxldCBzZXAgPSAnJztcbiAgICAgICAgZm9yIChjb25zdCB0b2tlbiBvZiBlbmQpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgc291cmNlLCB0eXBlIH0gPSB0b2tlbjtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50Jzoge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVxU3BhY2UgJiYgIWhhc1NwYWNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ01JU1NJTkdfQ0hBUicsICdDb21tZW50cyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIG90aGVyIHRva2VucyBieSB3aGl0ZSBzcGFjZSBjaGFyYWN0ZXJzJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNiID0gc291cmNlLnN1YnN0cmluZygxKSB8fCAnICc7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBjYjtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWVudCArPSBzZXAgKyBjYjtcbiAgICAgICAgICAgICAgICAgICAgc2VwID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXAgKz0gc291cmNlO1xuICAgICAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgJHt0eXBlfSBhdCBub2RlIGVuZGApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgY29tbWVudCwgb2Zmc2V0IH07XG59XG5cbmV4cG9ydCB7IHJlc29sdmVFbmQgfTtcbiIsICJpbXBvcnQgeyBpc1BhaXIgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBQYWlyIH0gZnJvbSAnLi4vbm9kZXMvUGFpci5qcyc7XG5pbXBvcnQgeyBZQU1MTWFwIH0gZnJvbSAnLi4vbm9kZXMvWUFNTE1hcC5qcyc7XG5pbXBvcnQgeyBZQU1MU2VxIH0gZnJvbSAnLi4vbm9kZXMvWUFNTFNlcS5qcyc7XG5pbXBvcnQgeyByZXNvbHZlRW5kIH0gZnJvbSAnLi9yZXNvbHZlLWVuZC5qcyc7XG5pbXBvcnQgeyByZXNvbHZlUHJvcHMgfSBmcm9tICcuL3Jlc29sdmUtcHJvcHMuanMnO1xuaW1wb3J0IHsgY29udGFpbnNOZXdsaW5lIH0gZnJvbSAnLi91dGlsLWNvbnRhaW5zLW5ld2xpbmUuanMnO1xuaW1wb3J0IHsgbWFwSW5jbHVkZXMgfSBmcm9tICcuL3V0aWwtbWFwLWluY2x1ZGVzLmpzJztcblxuY29uc3QgYmxvY2tNc2cgPSAnQmxvY2sgY29sbGVjdGlvbnMgYXJlIG5vdCBhbGxvd2VkIHdpdGhpbiBmbG93IGNvbGxlY3Rpb25zJztcbmNvbnN0IGlzQmxvY2sgPSAodG9rZW4pID0+IHRva2VuICYmICh0b2tlbi50eXBlID09PSAnYmxvY2stbWFwJyB8fCB0b2tlbi50eXBlID09PSAnYmxvY2stc2VxJyk7XG5mdW5jdGlvbiByZXNvbHZlRmxvd0NvbGxlY3Rpb24oeyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9LCBjdHgsIGZjLCBvbkVycm9yLCB0YWcpIHtcbiAgICBjb25zdCBpc01hcCA9IGZjLnN0YXJ0LnNvdXJjZSA9PT0gJ3snO1xuICAgIGNvbnN0IGZjTmFtZSA9IGlzTWFwID8gJ2Zsb3cgbWFwJyA6ICdmbG93IHNlcXVlbmNlJztcbiAgICBjb25zdCBOb2RlQ2xhc3MgPSAodGFnPy5ub2RlQ2xhc3MgPz8gKGlzTWFwID8gWUFNTE1hcCA6IFlBTUxTZXEpKTtcbiAgICBjb25zdCBjb2xsID0gbmV3IE5vZGVDbGFzcyhjdHguc2NoZW1hKTtcbiAgICBjb2xsLmZsb3cgPSB0cnVlO1xuICAgIGNvbnN0IGF0Um9vdCA9IGN0eC5hdFJvb3Q7XG4gICAgaWYgKGF0Um9vdClcbiAgICAgICAgY3R4LmF0Um9vdCA9IGZhbHNlO1xuICAgIGlmIChjdHguYXRLZXkpXG4gICAgICAgIGN0eC5hdEtleSA9IGZhbHNlO1xuICAgIGxldCBvZmZzZXQgPSBmYy5vZmZzZXQgKyBmYy5zdGFydC5zb3VyY2UubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmMuaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgY29sbEl0ZW0gPSBmYy5pdGVtc1tpXTtcbiAgICAgICAgY29uc3QgeyBzdGFydCwga2V5LCBzZXAsIHZhbHVlIH0gPSBjb2xsSXRlbTtcbiAgICAgICAgY29uc3QgcHJvcHMgPSByZXNvbHZlUHJvcHMoc3RhcnQsIHtcbiAgICAgICAgICAgIGZsb3c6IGZjTmFtZSxcbiAgICAgICAgICAgIGluZGljYXRvcjogJ2V4cGxpY2l0LWtleS1pbmQnLFxuICAgICAgICAgICAgbmV4dDoga2V5ID8/IHNlcD8uWzBdLFxuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgIHBhcmVudEluZGVudDogZmMuaW5kZW50LFxuICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICBpZiAoIXByb3BzLmFuY2hvciAmJiAhcHJvcHMudGFnICYmICFzZXAgJiYgIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgcHJvcHMuY29tbWEpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuY29tbWEsICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgLCBpbiAke2ZjTmFtZX1gKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpIDwgZmMuaXRlbXMubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihwcm9wcy5zdGFydCwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCBlbXB0eSBpdGVtIGluICR7ZmNOYW1lfWApO1xuICAgICAgICAgICAgICAgIGlmIChwcm9wcy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2xsLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsLmNvbW1lbnQgKz0gJ1xcbicgKyBwcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsLmNvbW1lbnQgPSBwcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBwcm9wcy5lbmQ7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzTWFwICYmIGN0eC5vcHRpb25zLnN0cmljdCAmJiBjb250YWluc05ld2xpbmUoa2V5KSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKGtleSwgLy8gY2hlY2tlZCBieSBjb250YWluc05ld2xpbmUoKVxuICAgICAgICAgICAgICAgICdNVUxUSUxJTkVfSU1QTElDSVRfS0VZJywgJ0ltcGxpY2l0IGtleXMgb2YgZmxvdyBzZXF1ZW5jZSBwYWlycyBuZWVkIHRvIGJlIG9uIGEgc2luZ2xlIGxpbmUnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKHByb3BzLmNvbW1hKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuY29tbWEsICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgLCBpbiAke2ZjTmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICghcHJvcHMuY29tbWEpXG4gICAgICAgICAgICAgICAgb25FcnJvcihwcm9wcy5zdGFydCwgJ01JU1NJTkdfQ0hBUicsIGBNaXNzaW5nICwgYmV0d2VlbiAke2ZjTmFtZX0gaXRlbXNgKTtcbiAgICAgICAgICAgIGlmIChwcm9wcy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgbGV0IHByZXZJdGVtQ29tbWVudCA9ICcnO1xuICAgICAgICAgICAgICAgIGxvb3A6IGZvciAoY29uc3Qgc3Qgb2Ygc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChzdC50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdjb21tYSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2SXRlbUNvbW1lbnQgPSBzdC5zb3VyY2Uuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHByZXZJdGVtQ29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcHJldiA9IGNvbGwuaXRlbXNbY29sbC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzUGFpcihwcmV2KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXYgPSBwcmV2LnZhbHVlID8/IHByZXYua2V5O1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJldi5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldi5jb21tZW50ICs9ICdcXG4nICsgcHJldkl0ZW1Db21tZW50O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2LmNvbW1lbnQgPSBwcmV2SXRlbUNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLmNvbW1lbnQgPSBwcm9wcy5jb21tZW50LnN1YnN0cmluZyhwcmV2SXRlbUNvbW1lbnQubGVuZ3RoICsgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghaXNNYXAgJiYgIXNlcCAmJiAhcHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgIC8vIGl0ZW0gaXMgYSB2YWx1ZSBpbiBhIHNlcVxuICAgICAgICAgICAgLy8gXHUyMTkyIGtleSAmIHNlcCBhcmUgZW1wdHksIHN0YXJ0IGRvZXMgbm90IGluY2x1ZGUgPyBvciA6XG4gICAgICAgICAgICBjb25zdCB2YWx1ZU5vZGUgPSB2YWx1ZVxuICAgICAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCB2YWx1ZSwgcHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgcHJvcHMuZW5kLCBzZXAsIG51bGwsIHByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGNvbGwuaXRlbXMucHVzaCh2YWx1ZU5vZGUpO1xuICAgICAgICAgICAgb2Zmc2V0ID0gdmFsdWVOb2RlLnJhbmdlWzJdO1xuICAgICAgICAgICAgaWYgKGlzQmxvY2sodmFsdWUpKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IodmFsdWVOb2RlLnJhbmdlLCAnQkxPQ0tfSU5fRkxPVycsIGJsb2NrTXNnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGl0ZW0gaXMgYSBrZXkrdmFsdWUgcGFpclxuICAgICAgICAgICAgLy8ga2V5IHZhbHVlXG4gICAgICAgICAgICBjdHguYXRLZXkgPSB0cnVlO1xuICAgICAgICAgICAgY29uc3Qga2V5U3RhcnQgPSBwcm9wcy5lbmQ7XG4gICAgICAgICAgICBjb25zdCBrZXlOb2RlID0ga2V5XG4gICAgICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIGtleSwgcHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwga2V5U3RhcnQsIHN0YXJ0LCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgICAgICBpZiAoaXNCbG9jayhrZXkpKVxuICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5Tm9kZS5yYW5nZSwgJ0JMT0NLX0lOX0ZMT1cnLCBibG9ja01zZyk7XG4gICAgICAgICAgICBjdHguYXRLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIHZhbHVlIHByb3BlcnRpZXNcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlUHJvcHMgPSByZXNvbHZlUHJvcHMoc2VwID8/IFtdLCB7XG4gICAgICAgICAgICAgICAgZmxvdzogZmNOYW1lLFxuICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ21hcC12YWx1ZS1pbmQnLFxuICAgICAgICAgICAgICAgIG5leHQ6IHZhbHVlLFxuICAgICAgICAgICAgICAgIG9mZnNldDoga2V5Tm9kZS5yYW5nZVsyXSxcbiAgICAgICAgICAgICAgICBvbkVycm9yLFxuICAgICAgICAgICAgICAgIHBhcmVudEluZGVudDogZmMuaW5kZW50LFxuICAgICAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodmFsdWVQcm9wcy5mb3VuZCkge1xuICAgICAgICAgICAgICAgIGlmICghaXNNYXAgJiYgIXByb3BzLmZvdW5kICYmIGN0eC5vcHRpb25zLnN0cmljdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiBzZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3QgPT09IHZhbHVlUHJvcHMuZm91bmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdC50eXBlID09PSAnbmV3bGluZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcihzdCwgJ01VTFRJTElORV9JTVBMSUNJVF9LRVknLCAnSW1wbGljaXQga2V5cyBvZiBmbG93IHNlcXVlbmNlIHBhaXJzIG5lZWQgdG8gYmUgb24gYSBzaW5nbGUgbGluZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wcy5zdGFydCA8IHZhbHVlUHJvcHMuZm91bmQub2Zmc2V0IC0gMTAyNClcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodmFsdWVQcm9wcy5mb3VuZCwgJ0tFWV9PVkVSXzEwMjRfQ0hBUlMnLCAnVGhlIDogaW5kaWNhdG9yIG11c3QgYmUgYXQgbW9zdCAxMDI0IGNoYXJzIGFmdGVyIHRoZSBzdGFydCBvZiBhbiBpbXBsaWNpdCBmbG93IHNlcXVlbmNlIGtleScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCdzb3VyY2UnIGluIHZhbHVlICYmIHZhbHVlLnNvdXJjZT8uWzBdID09PSAnOicpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodmFsdWUsICdNSVNTSU5HX0NIQVInLCBgTWlzc2luZyBzcGFjZSBhZnRlciA6IGluICR7ZmNOYW1lfWApO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih2YWx1ZVByb3BzLnN0YXJ0LCAnTUlTU0lOR19DSEFSJywgYE1pc3NpbmcgLCBvciA6IGJldHdlZW4gJHtmY05hbWV9IGl0ZW1zYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB2YWx1ZSB2YWx1ZVxuICAgICAgICAgICAgY29uc3QgdmFsdWVOb2RlID0gdmFsdWVcbiAgICAgICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHZhbHVlUHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgOiB2YWx1ZVByb3BzLmZvdW5kXG4gICAgICAgICAgICAgICAgICAgID8gY29tcG9zZUVtcHR5Tm9kZShjdHgsIHZhbHVlUHJvcHMuZW5kLCBzZXAsIG51bGwsIHZhbHVlUHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgICAgIGlmICh2YWx1ZU5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNCbG9jayh2YWx1ZSkpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodmFsdWVOb2RlLnJhbmdlLCAnQkxPQ0tfSU5fRkxPVycsIGJsb2NrTXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlUHJvcHMuY29tbWVudCkge1xuICAgICAgICAgICAgICAgIGlmIChrZXlOb2RlLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIGtleU5vZGUuY29tbWVudCArPSAnXFxuJyArIHZhbHVlUHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGtleU5vZGUuY29tbWVudCA9IHZhbHVlUHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBhaXIgPSBuZXcgUGFpcihrZXlOb2RlLCB2YWx1ZU5vZGUpO1xuICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLmtlZXBTb3VyY2VUb2tlbnMpXG4gICAgICAgICAgICAgICAgcGFpci5zcmNUb2tlbiA9IGNvbGxJdGVtO1xuICAgICAgICAgICAgaWYgKGlzTWFwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFwID0gY29sbDtcbiAgICAgICAgICAgICAgICBpZiAobWFwSW5jbHVkZXMoY3R4LCBtYXAuaXRlbXMsIGtleU5vZGUpKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKGtleVN0YXJ0LCAnRFVQTElDQVRFX0tFWScsICdNYXAga2V5cyBtdXN0IGJlIHVuaXF1ZScpO1xuICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHBhaXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFwID0gbmV3IFlBTUxNYXAoY3R4LnNjaGVtYSk7XG4gICAgICAgICAgICAgICAgbWFwLmZsb3cgPSB0cnVlO1xuICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHBhaXIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuZFJhbmdlID0gKHZhbHVlTm9kZSA/PyBrZXlOb2RlKS5yYW5nZTtcbiAgICAgICAgICAgICAgICBtYXAucmFuZ2UgPSBba2V5Tm9kZS5yYW5nZVswXSwgZW5kUmFuZ2VbMV0sIGVuZFJhbmdlWzJdXTtcbiAgICAgICAgICAgICAgICBjb2xsLml0ZW1zLnB1c2gobWFwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9mZnNldCA9IHZhbHVlTm9kZSA/IHZhbHVlTm9kZS5yYW5nZVsyXSA6IHZhbHVlUHJvcHMuZW5kO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGV4cGVjdGVkRW5kID0gaXNNYXAgPyAnfScgOiAnXSc7XG4gICAgY29uc3QgW2NlLCAuLi5lZV0gPSBmYy5lbmQ7XG4gICAgbGV0IGNlUG9zID0gb2Zmc2V0O1xuICAgIGlmIChjZT8uc291cmNlID09PSBleHBlY3RlZEVuZClcbiAgICAgICAgY2VQb3MgPSBjZS5vZmZzZXQgKyBjZS5zb3VyY2UubGVuZ3RoO1xuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBuYW1lID0gZmNOYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyBmY05hbWUuc3Vic3RyaW5nKDEpO1xuICAgICAgICBjb25zdCBtc2cgPSBhdFJvb3RcbiAgICAgICAgICAgID8gYCR7bmFtZX0gbXVzdCBlbmQgd2l0aCBhICR7ZXhwZWN0ZWRFbmR9YFxuICAgICAgICAgICAgOiBgJHtuYW1lfSBpbiBibG9jayBjb2xsZWN0aW9uIG11c3QgYmUgc3VmZmljaWVudGx5IGluZGVudGVkIGFuZCBlbmQgd2l0aCBhICR7ZXhwZWN0ZWRFbmR9YDtcbiAgICAgICAgb25FcnJvcihvZmZzZXQsIGF0Um9vdCA/ICdNSVNTSU5HX0NIQVInIDogJ0JBRF9JTkRFTlQnLCBtc2cpO1xuICAgICAgICBpZiAoY2UgJiYgY2Uuc291cmNlLmxlbmd0aCAhPT0gMSlcbiAgICAgICAgICAgIGVlLnVuc2hpZnQoY2UpO1xuICAgIH1cbiAgICBpZiAoZWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBlbmQgPSByZXNvbHZlRW5kKGVlLCBjZVBvcywgY3R4Lm9wdGlvbnMuc3RyaWN0LCBvbkVycm9yKTtcbiAgICAgICAgaWYgKGVuZC5jb21tZW50KSB7XG4gICAgICAgICAgICBpZiAoY29sbC5jb21tZW50KVxuICAgICAgICAgICAgICAgIGNvbGwuY29tbWVudCArPSAnXFxuJyArIGVuZC5jb21tZW50O1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvbGwuY29tbWVudCA9IGVuZC5jb21tZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbGwucmFuZ2UgPSBbZmMub2Zmc2V0LCBjZVBvcywgZW5kLm9mZnNldF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb2xsLnJhbmdlID0gW2ZjLm9mZnNldCwgY2VQb3MsIGNlUG9zXTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbGw7XG59XG5cbmV4cG9ydCB7IHJlc29sdmVGbG93Q29sbGVjdGlvbiB9O1xuIiwgImltcG9ydCB7IGlzTm9kZSB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyBZQU1MTWFwIH0gZnJvbSAnLi4vbm9kZXMvWUFNTE1hcC5qcyc7XG5pbXBvcnQgeyBZQU1MU2VxIH0gZnJvbSAnLi4vbm9kZXMvWUFNTFNlcS5qcyc7XG5pbXBvcnQgeyByZXNvbHZlQmxvY2tNYXAgfSBmcm9tICcuL3Jlc29sdmUtYmxvY2stbWFwLmpzJztcbmltcG9ydCB7IHJlc29sdmVCbG9ja1NlcSB9IGZyb20gJy4vcmVzb2x2ZS1ibG9jay1zZXEuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUZsb3dDb2xsZWN0aW9uIH0gZnJvbSAnLi9yZXNvbHZlLWZsb3ctY29sbGVjdGlvbi5qcyc7XG5cbmZ1bmN0aW9uIHJlc29sdmVDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWdOYW1lLCB0YWcpIHtcbiAgICBjb25zdCBjb2xsID0gdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLW1hcCdcbiAgICAgICAgPyByZXNvbHZlQmxvY2tNYXAoQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZylcbiAgICAgICAgOiB0b2tlbi50eXBlID09PSAnYmxvY2stc2VxJ1xuICAgICAgICAgICAgPyByZXNvbHZlQmxvY2tTZXEoQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZylcbiAgICAgICAgICAgIDogcmVzb2x2ZUZsb3dDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWcpO1xuICAgIGNvbnN0IENvbGwgPSBjb2xsLmNvbnN0cnVjdG9yO1xuICAgIC8vIElmIHdlIGdvdCBhIHRhZ05hbWUgbWF0Y2hpbmcgdGhlIGNsYXNzLCBvciB0aGUgdGFnIG5hbWUgaXMgJyEnLFxuICAgIC8vIHRoZW4gdXNlIHRoZSB0YWdOYW1lIGZyb20gdGhlIG5vZGUgY2xhc3MgdXNlZCB0byBjcmVhdGUgaXQuXG4gICAgaWYgKHRhZ05hbWUgPT09ICchJyB8fCB0YWdOYW1lID09PSBDb2xsLnRhZ05hbWUpIHtcbiAgICAgICAgY29sbC50YWcgPSBDb2xsLnRhZ05hbWU7XG4gICAgICAgIHJldHVybiBjb2xsO1xuICAgIH1cbiAgICBpZiAodGFnTmFtZSlcbiAgICAgICAgY29sbC50YWcgPSB0YWdOYW1lO1xuICAgIHJldHVybiBjb2xsO1xufVxuZnVuY3Rpb24gY29tcG9zZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIHByb3BzLCBvbkVycm9yKSB7XG4gICAgY29uc3QgdGFnVG9rZW4gPSBwcm9wcy50YWc7XG4gICAgY29uc3QgdGFnTmFtZSA9ICF0YWdUb2tlblxuICAgICAgICA/IG51bGxcbiAgICAgICAgOiBjdHguZGlyZWN0aXZlcy50YWdOYW1lKHRhZ1Rva2VuLnNvdXJjZSwgbXNnID0+IG9uRXJyb3IodGFnVG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBtc2cpKTtcbiAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNlcScpIHtcbiAgICAgICAgY29uc3QgeyBhbmNob3IsIG5ld2xpbmVBZnRlclByb3A6IG5sIH0gPSBwcm9wcztcbiAgICAgICAgY29uc3QgbGFzdFByb3AgPSBhbmNob3IgJiYgdGFnVG9rZW5cbiAgICAgICAgICAgID8gYW5jaG9yLm9mZnNldCA+IHRhZ1Rva2VuLm9mZnNldFxuICAgICAgICAgICAgICAgID8gYW5jaG9yXG4gICAgICAgICAgICAgICAgOiB0YWdUb2tlblxuICAgICAgICAgICAgOiAoYW5jaG9yID8/IHRhZ1Rva2VuKTtcbiAgICAgICAgaWYgKGxhc3RQcm9wICYmICghbmwgfHwgbmwub2Zmc2V0IDwgbGFzdFByb3Aub2Zmc2V0KSkge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdNaXNzaW5nIG5ld2xpbmUgYWZ0ZXIgYmxvY2sgc2VxdWVuY2UgcHJvcHMnO1xuICAgICAgICAgICAgb25FcnJvcihsYXN0UHJvcCwgJ01JU1NJTkdfQ0hBUicsIG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGV4cFR5cGUgPSB0b2tlbi50eXBlID09PSAnYmxvY2stbWFwJ1xuICAgICAgICA/ICdtYXAnXG4gICAgICAgIDogdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNlcSdcbiAgICAgICAgICAgID8gJ3NlcSdcbiAgICAgICAgICAgIDogdG9rZW4uc3RhcnQuc291cmNlID09PSAneydcbiAgICAgICAgICAgICAgICA/ICdtYXAnXG4gICAgICAgICAgICAgICAgOiAnc2VxJztcbiAgICAvLyBzaG9ydGN1dDogY2hlY2sgaWYgaXQncyBhIGdlbmVyaWMgWUFNTE1hcCBvciBZQU1MU2VxXG4gICAgLy8gYmVmb3JlIGp1bXBpbmcgaW50byB0aGUgY3VzdG9tIHRhZyBsb2dpYy5cbiAgICBpZiAoIXRhZ1Rva2VuIHx8XG4gICAgICAgICF0YWdOYW1lIHx8XG4gICAgICAgIHRhZ05hbWUgPT09ICchJyB8fFxuICAgICAgICAodGFnTmFtZSA9PT0gWUFNTE1hcC50YWdOYW1lICYmIGV4cFR5cGUgPT09ICdtYXAnKSB8fFxuICAgICAgICAodGFnTmFtZSA9PT0gWUFNTFNlcS50YWdOYW1lICYmIGV4cFR5cGUgPT09ICdzZXEnKSkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZ05hbWUpO1xuICAgIH1cbiAgICBsZXQgdGFnID0gY3R4LnNjaGVtYS50YWdzLmZpbmQodCA9PiB0LnRhZyA9PT0gdGFnTmFtZSAmJiB0LmNvbGxlY3Rpb24gPT09IGV4cFR5cGUpO1xuICAgIGlmICghdGFnKSB7XG4gICAgICAgIGNvbnN0IGt0ID0gY3R4LnNjaGVtYS5rbm93blRhZ3NbdGFnTmFtZV07XG4gICAgICAgIGlmIChrdD8uY29sbGVjdGlvbiA9PT0gZXhwVHlwZSkge1xuICAgICAgICAgICAgY3R4LnNjaGVtYS50YWdzLnB1c2goT2JqZWN0LmFzc2lnbih7fSwga3QsIHsgZGVmYXVsdDogZmFsc2UgfSkpO1xuICAgICAgICAgICAgdGFnID0ga3Q7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoa3QpIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRhZ1Rva2VuLCAnQkFEX0NPTExFQ1RJT05fVFlQRScsIGAke2t0LnRhZ30gdXNlZCBmb3IgJHtleHBUeXBlfSBjb2xsZWN0aW9uLCBidXQgZXhwZWN0cyAke2t0LmNvbGxlY3Rpb24gPz8gJ3NjYWxhcid9YCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRhZ1Rva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgYFVucmVzb2x2ZWQgdGFnOiAke3RhZ05hbWV9YCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZ05hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGNvbGwgPSByZXNvbHZlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnTmFtZSwgdGFnKTtcbiAgICBjb25zdCByZXMgPSB0YWcucmVzb2x2ZT8uKGNvbGwsIG1zZyA9PiBvbkVycm9yKHRhZ1Rva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKSwgY3R4Lm9wdGlvbnMpID8/IGNvbGw7XG4gICAgY29uc3Qgbm9kZSA9IGlzTm9kZShyZXMpXG4gICAgICAgID8gcmVzXG4gICAgICAgIDogbmV3IFNjYWxhcihyZXMpO1xuICAgIG5vZGUucmFuZ2UgPSBjb2xsLnJhbmdlO1xuICAgIG5vZGUudGFnID0gdGFnTmFtZTtcbiAgICBpZiAodGFnPy5mb3JtYXQpXG4gICAgICAgIG5vZGUuZm9ybWF0ID0gdGFnLmZvcm1hdDtcbiAgICByZXR1cm4gbm9kZTtcbn1cblxuZXhwb3J0IHsgY29tcG9zZUNvbGxlY3Rpb24gfTtcbiIsICJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi9ub2Rlcy9TY2FsYXIuanMnO1xuXG5mdW5jdGlvbiByZXNvbHZlQmxvY2tTY2FsYXIoY3R4LCBzY2FsYXIsIG9uRXJyb3IpIHtcbiAgICBjb25zdCBzdGFydCA9IHNjYWxhci5vZmZzZXQ7XG4gICAgY29uc3QgaGVhZGVyID0gcGFyc2VCbG9ja1NjYWxhckhlYWRlcihzY2FsYXIsIGN0eC5vcHRpb25zLnN0cmljdCwgb25FcnJvcik7XG4gICAgaWYgKCFoZWFkZXIpXG4gICAgICAgIHJldHVybiB7IHZhbHVlOiAnJywgdHlwZTogbnVsbCwgY29tbWVudDogJycsIHJhbmdlOiBbc3RhcnQsIHN0YXJ0LCBzdGFydF0gfTtcbiAgICBjb25zdCB0eXBlID0gaGVhZGVyLm1vZGUgPT09ICc+JyA/IFNjYWxhci5CTE9DS19GT0xERUQgOiBTY2FsYXIuQkxPQ0tfTElURVJBTDtcbiAgICBjb25zdCBsaW5lcyA9IHNjYWxhci5zb3VyY2UgPyBzcGxpdExpbmVzKHNjYWxhci5zb3VyY2UpIDogW107XG4gICAgLy8gZGV0ZXJtaW5lIHRoZSBlbmQgb2YgY29udGVudCAmIHN0YXJ0IG9mIGNob21waW5nXG4gICAgbGV0IGNob21wU3RhcnQgPSBsaW5lcy5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IGxpbmVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBsaW5lc1tpXVsxXTtcbiAgICAgICAgaWYgKGNvbnRlbnQgPT09ICcnIHx8IGNvbnRlbnQgPT09ICdcXHInKVxuICAgICAgICAgICAgY2hvbXBTdGFydCA9IGk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAvLyBzaG9ydGN1dCBmb3IgZW1wdHkgY29udGVudHNcbiAgICBpZiAoY2hvbXBTdGFydCA9PT0gMCkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGhlYWRlci5jaG9tcCA9PT0gJysnICYmIGxpbmVzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgID8gJ1xcbicucmVwZWF0KE1hdGgubWF4KDEsIGxpbmVzLmxlbmd0aCAtIDEpKVxuICAgICAgICAgICAgOiAnJztcbiAgICAgICAgbGV0IGVuZCA9IHN0YXJ0ICsgaGVhZGVyLmxlbmd0aDtcbiAgICAgICAgaWYgKHNjYWxhci5zb3VyY2UpXG4gICAgICAgICAgICBlbmQgKz0gc2NhbGFyLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgIHJldHVybiB7IHZhbHVlLCB0eXBlLCBjb21tZW50OiBoZWFkZXIuY29tbWVudCwgcmFuZ2U6IFtzdGFydCwgZW5kLCBlbmRdIH07XG4gICAgfVxuICAgIC8vIGZpbmQgdGhlIGluZGVudGF0aW9uIGxldmVsIHRvIHRyaW0gZnJvbSBzdGFydFxuICAgIGxldCB0cmltSW5kZW50ID0gc2NhbGFyLmluZGVudCArIGhlYWRlci5pbmRlbnQ7XG4gICAgbGV0IG9mZnNldCA9IHNjYWxhci5vZmZzZXQgKyBoZWFkZXIubGVuZ3RoO1xuICAgIGxldCBjb250ZW50U3RhcnQgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hvbXBTdGFydDsgKytpKSB7XG4gICAgICAgIGNvbnN0IFtpbmRlbnQsIGNvbnRlbnRdID0gbGluZXNbaV07XG4gICAgICAgIGlmIChjb250ZW50ID09PSAnJyB8fCBjb250ZW50ID09PSAnXFxyJykge1xuICAgICAgICAgICAgaWYgKGhlYWRlci5pbmRlbnQgPT09IDAgJiYgaW5kZW50Lmxlbmd0aCA+IHRyaW1JbmRlbnQpXG4gICAgICAgICAgICAgICAgdHJpbUluZGVudCA9IGluZGVudC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoaW5kZW50Lmxlbmd0aCA8IHRyaW1JbmRlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ0Jsb2NrIHNjYWxhcnMgd2l0aCBtb3JlLWluZGVudGVkIGxlYWRpbmcgZW1wdHkgbGluZXMgbXVzdCB1c2UgYW4gZXhwbGljaXQgaW5kZW50YXRpb24gaW5kaWNhdG9yJztcbiAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCArIGluZGVudC5sZW5ndGgsICdNSVNTSU5HX0NIQVInLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChoZWFkZXIuaW5kZW50ID09PSAwKVxuICAgICAgICAgICAgICAgIHRyaW1JbmRlbnQgPSBpbmRlbnQubGVuZ3RoO1xuICAgICAgICAgICAgY29udGVudFN0YXJ0ID0gaTtcbiAgICAgICAgICAgIGlmICh0cmltSW5kZW50ID09PSAwICYmICFjdHguYXRSb290KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdCbG9jayBzY2FsYXIgdmFsdWVzIGluIGNvbGxlY3Rpb25zIG11c3QgYmUgaW5kZW50ZWQnO1xuICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkFEX0lOREVOVCcsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgb2Zmc2V0ICs9IGluZGVudC5sZW5ndGggKyBjb250ZW50Lmxlbmd0aCArIDE7XG4gICAgfVxuICAgIC8vIGluY2x1ZGUgdHJhaWxpbmcgbW9yZS1pbmRlbnRlZCBlbXB0eSBsaW5lcyBpbiBjb250ZW50XG4gICAgZm9yIChsZXQgaSA9IGxpbmVzLmxlbmd0aCAtIDE7IGkgPj0gY2hvbXBTdGFydDsgLS1pKSB7XG4gICAgICAgIGlmIChsaW5lc1tpXVswXS5sZW5ndGggPiB0cmltSW5kZW50KVxuICAgICAgICAgICAgY2hvbXBTdGFydCA9IGkgKyAxO1xuICAgIH1cbiAgICBsZXQgdmFsdWUgPSAnJztcbiAgICBsZXQgc2VwID0gJyc7XG4gICAgbGV0IHByZXZNb3JlSW5kZW50ZWQgPSBmYWxzZTtcbiAgICAvLyBsZWFkaW5nIHdoaXRlc3BhY2UgaXMga2VwdCBpbnRhY3RcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRlbnRTdGFydDsgKytpKVxuICAgICAgICB2YWx1ZSArPSBsaW5lc1tpXVswXS5zbGljZSh0cmltSW5kZW50KSArICdcXG4nO1xuICAgIGZvciAobGV0IGkgPSBjb250ZW50U3RhcnQ7IGkgPCBjaG9tcFN0YXJ0OyArK2kpIHtcbiAgICAgICAgbGV0IFtpbmRlbnQsIGNvbnRlbnRdID0gbGluZXNbaV07XG4gICAgICAgIG9mZnNldCArPSBpbmRlbnQubGVuZ3RoICsgY29udGVudC5sZW5ndGggKyAxO1xuICAgICAgICBjb25zdCBjcmxmID0gY29udGVudFtjb250ZW50Lmxlbmd0aCAtIDFdID09PSAnXFxyJztcbiAgICAgICAgaWYgKGNybGYpXG4gICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgwLCAtMSk7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiBhbHJlYWR5IGNhdWdodCBpbiBsZXhlciAqL1xuICAgICAgICBpZiAoY29udGVudCAmJiBpbmRlbnQubGVuZ3RoIDwgdHJpbUluZGVudCkge1xuICAgICAgICAgICAgY29uc3Qgc3JjID0gaGVhZGVyLmluZGVudFxuICAgICAgICAgICAgICAgID8gJ2V4cGxpY2l0IGluZGVudGF0aW9uIGluZGljYXRvcidcbiAgICAgICAgICAgICAgICA6ICdmaXJzdCBsaW5lJztcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgQmxvY2sgc2NhbGFyIGxpbmVzIG11c3Qgbm90IGJlIGxlc3MgaW5kZW50ZWQgdGhhbiB0aGVpciAke3NyY31gO1xuICAgICAgICAgICAgb25FcnJvcihvZmZzZXQgLSBjb250ZW50Lmxlbmd0aCAtIChjcmxmID8gMiA6IDEpLCAnQkFEX0lOREVOVCcsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgaW5kZW50ID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09IFNjYWxhci5CTE9DS19MSVRFUkFMKSB7XG4gICAgICAgICAgICB2YWx1ZSArPSBzZXAgKyBpbmRlbnQuc2xpY2UodHJpbUluZGVudCkgKyBjb250ZW50O1xuICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaW5kZW50Lmxlbmd0aCA+IHRyaW1JbmRlbnQgfHwgY29udGVudFswXSA9PT0gJ1xcdCcpIHtcbiAgICAgICAgICAgIC8vIG1vcmUtaW5kZW50ZWQgY29udGVudCB3aXRoaW4gYSBmb2xkZWQgYmxvY2tcbiAgICAgICAgICAgIGlmIChzZXAgPT09ICcgJylcbiAgICAgICAgICAgICAgICBzZXAgPSAnXFxuJztcbiAgICAgICAgICAgIGVsc2UgaWYgKCFwcmV2TW9yZUluZGVudGVkICYmIHNlcCA9PT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgc2VwID0gJ1xcblxcbic7XG4gICAgICAgICAgICB2YWx1ZSArPSBzZXAgKyBpbmRlbnQuc2xpY2UodHJpbUluZGVudCkgKyBjb250ZW50O1xuICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgICAgICBwcmV2TW9yZUluZGVudGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjb250ZW50ID09PSAnJykge1xuICAgICAgICAgICAgLy8gZW1wdHkgbGluZVxuICAgICAgICAgICAgaWYgKHNlcCA9PT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gJ1xcbic7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZSArPSBzZXAgKyBjb250ZW50O1xuICAgICAgICAgICAgc2VwID0gJyAnO1xuICAgICAgICAgICAgcHJldk1vcmVJbmRlbnRlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN3aXRjaCAoaGVhZGVyLmNob21wKSB7XG4gICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNob21wU3RhcnQ7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICB2YWx1ZSArPSAnXFxuJyArIGxpbmVzW2ldWzBdLnNsaWNlKHRyaW1JbmRlbnQpO1xuICAgICAgICAgICAgaWYgKHZhbHVlW3ZhbHVlLmxlbmd0aCAtIDFdICE9PSAnXFxuJylcbiAgICAgICAgICAgICAgICB2YWx1ZSArPSAnXFxuJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdmFsdWUgKz0gJ1xcbic7XG4gICAgfVxuICAgIGNvbnN0IGVuZCA9IHN0YXJ0ICsgaGVhZGVyLmxlbmd0aCArIHNjYWxhci5zb3VyY2UubGVuZ3RoO1xuICAgIHJldHVybiB7IHZhbHVlLCB0eXBlLCBjb21tZW50OiBoZWFkZXIuY29tbWVudCwgcmFuZ2U6IFtzdGFydCwgZW5kLCBlbmRdIH07XG59XG5mdW5jdGlvbiBwYXJzZUJsb2NrU2NhbGFySGVhZGVyKHsgb2Zmc2V0LCBwcm9wcyB9LCBzdHJpY3QsIG9uRXJyb3IpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICBpZiAocHJvcHNbMF0udHlwZSAhPT0gJ2Jsb2NrLXNjYWxhci1oZWFkZXInKSB7XG4gICAgICAgIG9uRXJyb3IocHJvcHNbMF0sICdJTVBPU1NJQkxFJywgJ0Jsb2NrIHNjYWxhciBoZWFkZXIgbm90IGZvdW5kJyk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7IHNvdXJjZSB9ID0gcHJvcHNbMF07XG4gICAgY29uc3QgbW9kZSA9IHNvdXJjZVswXTtcbiAgICBsZXQgaW5kZW50ID0gMDtcbiAgICBsZXQgY2hvbXAgPSAnJztcbiAgICBsZXQgZXJyb3IgPSAtMTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNvdXJjZS5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBjaCA9IHNvdXJjZVtpXTtcbiAgICAgICAgaWYgKCFjaG9tcCAmJiAoY2ggPT09ICctJyB8fCBjaCA9PT0gJysnKSlcbiAgICAgICAgICAgIGNob21wID0gY2g7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbiA9IE51bWJlcihjaCk7XG4gICAgICAgICAgICBpZiAoIWluZGVudCAmJiBuKVxuICAgICAgICAgICAgICAgIGluZGVudCA9IG47XG4gICAgICAgICAgICBlbHNlIGlmIChlcnJvciA9PT0gLTEpXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBvZmZzZXQgKyBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChlcnJvciAhPT0gLTEpXG4gICAgICAgIG9uRXJyb3IoZXJyb3IsICdVTkVYUEVDVEVEX1RPS0VOJywgYEJsb2NrIHNjYWxhciBoZWFkZXIgaW5jbHVkZXMgZXh0cmEgY2hhcmFjdGVyczogJHtzb3VyY2V9YCk7XG4gICAgbGV0IGhhc1NwYWNlID0gZmFsc2U7XG4gICAgbGV0IGNvbW1lbnQgPSAnJztcbiAgICBsZXQgbGVuZ3RoID0gc291cmNlLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IHByb3BzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gcHJvcHNbaV07XG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBsZW5ndGggKz0gdG9rZW4uc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgIGlmIChzdHJpY3QgJiYgIWhhc1NwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnQ29tbWVudHMgbXVzdCBiZSBzZXBhcmF0ZWQgZnJvbSBvdGhlciB0b2tlbnMgYnkgd2hpdGUgc3BhY2UgY2hhcmFjdGVycyc7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdNSVNTSU5HX0NIQVInLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGVuZ3RoICs9IHRva2VuLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29tbWVudCA9IHRva2VuLnNvdXJjZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCB0b2tlbi5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBsZW5ndGggKz0gdG9rZW4uc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGBVbmV4cGVjdGVkIHRva2VuIGluIGJsb2NrIHNjYWxhciBoZWFkZXI6ICR7dG9rZW4udHlwZX1gO1xuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgdHMgPSB0b2tlbi5zb3VyY2U7XG4gICAgICAgICAgICAgICAgaWYgKHRzICYmIHR5cGVvZiB0cyA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aCArPSB0cy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgbW9kZSwgaW5kZW50LCBjaG9tcCwgY29tbWVudCwgbGVuZ3RoIH07XG59XG4vKiogQHJldHVybnMgQXJyYXkgb2YgbGluZXMgc3BsaXQgdXAgYXMgYFtpbmRlbnQsIGNvbnRlbnRdYCAqL1xuZnVuY3Rpb24gc3BsaXRMaW5lcyhzb3VyY2UpIHtcbiAgICBjb25zdCBzcGxpdCA9IHNvdXJjZS5zcGxpdCgvXFxuKCAqKS8pO1xuICAgIGNvbnN0IGZpcnN0ID0gc3BsaXRbMF07XG4gICAgY29uc3QgbSA9IGZpcnN0Lm1hdGNoKC9eKCAqKS8pO1xuICAgIGNvbnN0IGxpbmUwID0gbT8uWzFdXG4gICAgICAgID8gW21bMV0sIGZpcnN0LnNsaWNlKG1bMV0ubGVuZ3RoKV1cbiAgICAgICAgOiBbJycsIGZpcnN0XTtcbiAgICBjb25zdCBsaW5lcyA9IFtsaW5lMF07XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzcGxpdC5sZW5ndGg7IGkgKz0gMilcbiAgICAgICAgbGluZXMucHVzaChbc3BsaXRbaV0sIHNwbGl0W2kgKyAxXV0pO1xuICAgIHJldHVybiBsaW5lcztcbn1cblxuZXhwb3J0IHsgcmVzb2x2ZUJsb2NrU2NhbGFyIH07XG4iLCAiaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vbm9kZXMvU2NhbGFyLmpzJztcbmltcG9ydCB7IHJlc29sdmVFbmQgfSBmcm9tICcuL3Jlc29sdmUtZW5kLmpzJztcblxuZnVuY3Rpb24gcmVzb2x2ZUZsb3dTY2FsYXIoc2NhbGFyLCBzdHJpY3QsIG9uRXJyb3IpIHtcbiAgICBjb25zdCB7IG9mZnNldCwgdHlwZSwgc291cmNlLCBlbmQgfSA9IHNjYWxhcjtcbiAgICBsZXQgX3R5cGU7XG4gICAgbGV0IHZhbHVlO1xuICAgIGNvbnN0IF9vbkVycm9yID0gKHJlbCwgY29kZSwgbXNnKSA9PiBvbkVycm9yKG9mZnNldCArIHJlbCwgY29kZSwgbXNnKTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgIF90eXBlID0gU2NhbGFyLlBMQUlOO1xuICAgICAgICAgICAgdmFsdWUgPSBwbGFpblZhbHVlKHNvdXJjZSwgX29uRXJyb3IpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIF90eXBlID0gU2NhbGFyLlFVT1RFX1NJTkdMRTtcbiAgICAgICAgICAgIHZhbHVlID0gc2luZ2xlUXVvdGVkVmFsdWUoc291cmNlLCBfb25FcnJvcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgX3R5cGUgPSBTY2FsYXIuUVVPVEVfRE9VQkxFO1xuICAgICAgICAgICAgdmFsdWUgPSBkb3VibGVRdW90ZWRWYWx1ZShzb3VyY2UsIF9vbkVycm9yKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgb25FcnJvcihzY2FsYXIsICdVTkVYUEVDVEVEX1RPS0VOJywgYEV4cGVjdGVkIGEgZmxvdyBzY2FsYXIgdmFsdWUsIGJ1dCBmb3VuZDogJHt0eXBlfWApO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgdHlwZTogbnVsbCxcbiAgICAgICAgICAgICAgICBjb21tZW50OiAnJyxcbiAgICAgICAgICAgICAgICByYW5nZTogW29mZnNldCwgb2Zmc2V0ICsgc291cmNlLmxlbmd0aCwgb2Zmc2V0ICsgc291cmNlLmxlbmd0aF1cbiAgICAgICAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlRW5kID0gb2Zmc2V0ICsgc291cmNlLmxlbmd0aDtcbiAgICBjb25zdCByZSA9IHJlc29sdmVFbmQoZW5kLCB2YWx1ZUVuZCwgc3RyaWN0LCBvbkVycm9yKTtcbiAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZSxcbiAgICAgICAgdHlwZTogX3R5cGUsXG4gICAgICAgIGNvbW1lbnQ6IHJlLmNvbW1lbnQsXG4gICAgICAgIHJhbmdlOiBbb2Zmc2V0LCB2YWx1ZUVuZCwgcmUub2Zmc2V0XVxuICAgIH07XG59XG5mdW5jdGlvbiBwbGFpblZhbHVlKHNvdXJjZSwgb25FcnJvcikge1xuICAgIGxldCBiYWRDaGFyID0gJyc7XG4gICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgY2FzZSAnXFx0JzpcbiAgICAgICAgICAgIGJhZENoYXIgPSAnYSB0YWIgY2hhcmFjdGVyJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICcsJzpcbiAgICAgICAgICAgIGJhZENoYXIgPSAnZmxvdyBpbmRpY2F0b3IgY2hhcmFjdGVyICwnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJyUnOlxuICAgICAgICAgICAgYmFkQ2hhciA9ICdkaXJlY3RpdmUgaW5kaWNhdG9yIGNoYXJhY3RlciAlJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgY2FzZSAnPic6IHtcbiAgICAgICAgICAgIGJhZENoYXIgPSBgYmxvY2sgc2NhbGFyIGluZGljYXRvciAke3NvdXJjZVswXX1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnQCc6XG4gICAgICAgIGNhc2UgJ2AnOiB7XG4gICAgICAgICAgICBiYWRDaGFyID0gYHJlc2VydmVkIGNoYXJhY3RlciAke3NvdXJjZVswXX1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGJhZENoYXIpXG4gICAgICAgIG9uRXJyb3IoMCwgJ0JBRF9TQ0FMQVJfU1RBUlQnLCBgUGxhaW4gdmFsdWUgY2Fubm90IHN0YXJ0IHdpdGggJHtiYWRDaGFyfWApO1xuICAgIHJldHVybiBmb2xkTGluZXMoc291cmNlKTtcbn1cbmZ1bmN0aW9uIHNpbmdsZVF1b3RlZFZhbHVlKHNvdXJjZSwgb25FcnJvcikge1xuICAgIGlmIChzb3VyY2Vbc291cmNlLmxlbmd0aCAtIDFdICE9PSBcIidcIiB8fCBzb3VyY2UubGVuZ3RoID09PSAxKVxuICAgICAgICBvbkVycm9yKHNvdXJjZS5sZW5ndGgsICdNSVNTSU5HX0NIQVInLCBcIk1pc3NpbmcgY2xvc2luZyAncXVvdGVcIik7XG4gICAgcmV0dXJuIGZvbGRMaW5lcyhzb3VyY2Uuc2xpY2UoMSwgLTEpKS5yZXBsYWNlKC8nJy9nLCBcIidcIik7XG59XG5mdW5jdGlvbiBmb2xkTGluZXMoc291cmNlKSB7XG4gICAgLyoqXG4gICAgICogVGhlIG5lZ2F0aXZlIGxvb2tiZWhpbmQgaGVyZSBhbmQgaW4gdGhlIGByZWAgUmVnRXhwIGlzIHRvXG4gICAgICogcHJldmVudCBjYXVzaW5nIGEgcG9seW5vbWlhbCBzZWFyY2ggdGltZSBpbiBjZXJ0YWluIGNhc2VzLlxuICAgICAqXG4gICAgICogVGhlIHRyeS1jYXRjaCBpcyBmb3IgU2FmYXJpLCB3aGljaCBkb2Vzbid0IHN1cHBvcnQgdGhpcyB5ZXQ6XG4gICAgICogaHR0cHM6Ly9jYW5pdXNlLmNvbS9qcy1yZWdleHAtbG9va2JlaGluZFxuICAgICAqL1xuICAgIGxldCBmaXJzdCwgbGluZTtcbiAgICB0cnkge1xuICAgICAgICBmaXJzdCA9IG5ldyBSZWdFeHAoJyguKj8pKD88IVsgXFx0XSlbIFxcdF0qXFxyP1xcbicsICdzeScpO1xuICAgICAgICBsaW5lID0gbmV3IFJlZ0V4cCgnWyBcXHRdKiguKj8pKD86KD88IVsgXFx0XSlbIFxcdF0qKT9cXHI/XFxuJywgJ3N5Jyk7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgZmlyc3QgPSAvKC4qPylbIFxcdF0qXFxyP1xcbi9zeTtcbiAgICAgICAgbGluZSA9IC9bIFxcdF0qKC4qPylbIFxcdF0qXFxyP1xcbi9zeTtcbiAgICB9XG4gICAgbGV0IG1hdGNoID0gZmlyc3QuZXhlYyhzb3VyY2UpO1xuICAgIGlmICghbWF0Y2gpXG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgbGV0IHJlcyA9IG1hdGNoWzFdO1xuICAgIGxldCBzZXAgPSAnICc7XG4gICAgbGV0IHBvcyA9IGZpcnN0Lmxhc3RJbmRleDtcbiAgICBsaW5lLmxhc3RJbmRleCA9IHBvcztcbiAgICB3aGlsZSAoKG1hdGNoID0gbGluZS5leGVjKHNvdXJjZSkpKSB7XG4gICAgICAgIGlmIChtYXRjaFsxXSA9PT0gJycpIHtcbiAgICAgICAgICAgIGlmIChzZXAgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIHJlcyArPSBzZXA7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXMgKz0gc2VwICsgbWF0Y2hbMV07XG4gICAgICAgICAgICBzZXAgPSAnICc7XG4gICAgICAgIH1cbiAgICAgICAgcG9zID0gbGluZS5sYXN0SW5kZXg7XG4gICAgfVxuICAgIGNvbnN0IGxhc3QgPSAvWyBcXHRdKiguKikvc3k7XG4gICAgbGFzdC5sYXN0SW5kZXggPSBwb3M7XG4gICAgbWF0Y2ggPSBsYXN0LmV4ZWMoc291cmNlKTtcbiAgICByZXR1cm4gcmVzICsgc2VwICsgKG1hdGNoPy5bMV0gPz8gJycpO1xufVxuZnVuY3Rpb24gZG91YmxlUXVvdGVkVmFsdWUoc291cmNlLCBvbkVycm9yKSB7XG4gICAgbGV0IHJlcyA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc291cmNlLmxlbmd0aCAtIDE7ICsraSkge1xuICAgICAgICBjb25zdCBjaCA9IHNvdXJjZVtpXTtcbiAgICAgICAgaWYgKGNoID09PSAnXFxyJyAmJiBzb3VyY2VbaSArIDFdID09PSAnXFxuJylcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICBpZiAoY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICBjb25zdCB7IGZvbGQsIG9mZnNldCB9ID0gZm9sZE5ld2xpbmUoc291cmNlLCBpKTtcbiAgICAgICAgICAgIHJlcyArPSBmb2xkO1xuICAgICAgICAgICAgaSA9IG9mZnNldDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjaCA9PT0gJ1xcXFwnKSB7XG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNvdXJjZVsrK2ldO1xuICAgICAgICAgICAgY29uc3QgY2MgPSBlc2NhcGVDb2Rlc1tuZXh0XTtcbiAgICAgICAgICAgIGlmIChjYylcbiAgICAgICAgICAgICAgICByZXMgKz0gY2M7XG4gICAgICAgICAgICBlbHNlIGlmIChuZXh0ID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgIC8vIHNraXAgZXNjYXBlZCBuZXdsaW5lcywgYnV0IHN0aWxsIHRyaW0gdGhlIGZvbGxvd2luZyBsaW5lXG4gICAgICAgICAgICAgICAgbmV4dCA9IHNvdXJjZVtpICsgMV07XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5leHQgPT09ICcgJyB8fCBuZXh0ID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHNvdXJjZVsrK2kgKyAxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5leHQgPT09ICdcXHInICYmIHNvdXJjZVtpICsgMV0gPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgLy8gc2tpcCBlc2NhcGVkIENSTEYgbmV3bGluZXMsIGJ1dCBzdGlsbCB0cmltIHRoZSBmb2xsb3dpbmcgbGluZVxuICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbKytpICsgMV07XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5leHQgPT09ICcgJyB8fCBuZXh0ID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHNvdXJjZVsrK2kgKyAxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5leHQgPT09ICd4JyB8fCBuZXh0ID09PSAndScgfHwgbmV4dCA9PT0gJ1UnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0gbmV4dCA9PT0gJ3gnID8gMiA6IG5leHQgPT09ICd1JyA/IDQgOiA4O1xuICAgICAgICAgICAgICAgIHJlcyArPSBwYXJzZUNoYXJDb2RlKHNvdXJjZSwgaSArIDEsIGxlbmd0aCwgb25FcnJvcik7XG4gICAgICAgICAgICAgICAgaSArPSBsZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCByYXcgPSBzb3VyY2Uuc3Vic3RyKGkgLSAxLCAyKTtcbiAgICAgICAgICAgICAgICBvbkVycm9yKGkgLSAxLCAnQkFEX0RRX0VTQ0FQRScsIGBJbnZhbGlkIGVzY2FwZSBzZXF1ZW5jZSAke3Jhd31gKTtcbiAgICAgICAgICAgICAgICByZXMgKz0gcmF3O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKSB7XG4gICAgICAgICAgICAvLyB0cmltIHRyYWlsaW5nIHdoaXRlc3BhY2VcbiAgICAgICAgICAgIGNvbnN0IHdzU3RhcnQgPSBpO1xuICAgICAgICAgICAgbGV0IG5leHQgPSBzb3VyY2VbaSArIDFdO1xuICAgICAgICAgICAgd2hpbGUgKG5leHQgPT09ICcgJyB8fCBuZXh0ID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICBuZXh0ID0gc291cmNlWysraSArIDFdO1xuICAgICAgICAgICAgaWYgKG5leHQgIT09ICdcXG4nICYmICEobmV4dCA9PT0gJ1xccicgJiYgc291cmNlW2kgKyAyXSA9PT0gJ1xcbicpKVxuICAgICAgICAgICAgICAgIHJlcyArPSBpID4gd3NTdGFydCA/IHNvdXJjZS5zbGljZSh3c1N0YXJ0LCBpICsgMSkgOiBjaDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlcyArPSBjaDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoc291cmNlW3NvdXJjZS5sZW5ndGggLSAxXSAhPT0gJ1wiJyB8fCBzb3VyY2UubGVuZ3RoID09PSAxKVxuICAgICAgICBvbkVycm9yKHNvdXJjZS5sZW5ndGgsICdNSVNTSU5HX0NIQVInLCAnTWlzc2luZyBjbG9zaW5nIFwicXVvdGUnKTtcbiAgICByZXR1cm4gcmVzO1xufVxuLyoqXG4gKiBGb2xkIGEgc2luZ2xlIG5ld2xpbmUgaW50byBhIHNwYWNlLCBtdWx0aXBsZSBuZXdsaW5lcyB0byBOIC0gMSBuZXdsaW5lcy5cbiAqIFByZXN1bWVzIGBzb3VyY2Vbb2Zmc2V0XSA9PT0gJ1xcbidgXG4gKi9cbmZ1bmN0aW9uIGZvbGROZXdsaW5lKHNvdXJjZSwgb2Zmc2V0KSB7XG4gICAgbGV0IGZvbGQgPSAnJztcbiAgICBsZXQgY2ggPSBzb3VyY2Vbb2Zmc2V0ICsgMV07XG4gICAgd2hpbGUgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnIHx8IGNoID09PSAnXFxuJyB8fCBjaCA9PT0gJ1xccicpIHtcbiAgICAgICAgaWYgKGNoID09PSAnXFxyJyAmJiBzb3VyY2Vbb2Zmc2V0ICsgMl0gIT09ICdcXG4nKVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGlmIChjaCA9PT0gJ1xcbicpXG4gICAgICAgICAgICBmb2xkICs9ICdcXG4nO1xuICAgICAgICBvZmZzZXQgKz0gMTtcbiAgICAgICAgY2ggPSBzb3VyY2Vbb2Zmc2V0ICsgMV07XG4gICAgfVxuICAgIGlmICghZm9sZClcbiAgICAgICAgZm9sZCA9ICcgJztcbiAgICByZXR1cm4geyBmb2xkLCBvZmZzZXQgfTtcbn1cbmNvbnN0IGVzY2FwZUNvZGVzID0ge1xuICAgICcwJzogJ1xcMCcsIC8vIG51bGwgY2hhcmFjdGVyXG4gICAgYTogJ1xceDA3JywgLy8gYmVsbCBjaGFyYWN0ZXJcbiAgICBiOiAnXFxiJywgLy8gYmFja3NwYWNlXG4gICAgZTogJ1xceDFiJywgLy8gZXNjYXBlIGNoYXJhY3RlclxuICAgIGY6ICdcXGYnLCAvLyBmb3JtIGZlZWRcbiAgICBuOiAnXFxuJywgLy8gbGluZSBmZWVkXG4gICAgcjogJ1xccicsIC8vIGNhcnJpYWdlIHJldHVyblxuICAgIHQ6ICdcXHQnLCAvLyBob3Jpem9udGFsIHRhYlxuICAgIHY6ICdcXHYnLCAvLyB2ZXJ0aWNhbCB0YWJcbiAgICBOOiAnXFx1MDA4NScsIC8vIFVuaWNvZGUgbmV4dCBsaW5lXG4gICAgXzogJ1xcdTAwYTAnLCAvLyBVbmljb2RlIG5vbi1icmVha2luZyBzcGFjZVxuICAgIEw6ICdcXHUyMDI4JywgLy8gVW5pY29kZSBsaW5lIHNlcGFyYXRvclxuICAgIFA6ICdcXHUyMDI5JywgLy8gVW5pY29kZSBwYXJhZ3JhcGggc2VwYXJhdG9yXG4gICAgJyAnOiAnICcsXG4gICAgJ1wiJzogJ1wiJyxcbiAgICAnLyc6ICcvJyxcbiAgICAnXFxcXCc6ICdcXFxcJyxcbiAgICAnXFx0JzogJ1xcdCdcbn07XG5mdW5jdGlvbiBwYXJzZUNoYXJDb2RlKHNvdXJjZSwgb2Zmc2V0LCBsZW5ndGgsIG9uRXJyb3IpIHtcbiAgICBjb25zdCBjYyA9IHNvdXJjZS5zdWJzdHIob2Zmc2V0LCBsZW5ndGgpO1xuICAgIGNvbnN0IG9rID0gY2MubGVuZ3RoID09PSBsZW5ndGggJiYgL15bMC05YS1mQS1GXSskLy50ZXN0KGNjKTtcbiAgICBjb25zdCBjb2RlID0gb2sgPyBwYXJzZUludChjYywgMTYpIDogTmFOO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNvZGVQb2ludChjb2RlKTtcbiAgICB9XG4gICAgY2F0Y2gge1xuICAgICAgICBjb25zdCByYXcgPSBzb3VyY2Uuc3Vic3RyKG9mZnNldCAtIDIsIGxlbmd0aCArIDIpO1xuICAgICAgICBvbkVycm9yKG9mZnNldCAtIDIsICdCQURfRFFfRVNDQVBFJywgYEludmFsaWQgZXNjYXBlIHNlcXVlbmNlICR7cmF3fWApO1xuICAgICAgICByZXR1cm4gcmF3O1xuICAgIH1cbn1cblxuZXhwb3J0IHsgcmVzb2x2ZUZsb3dTY2FsYXIgfTtcbiIsICJpbXBvcnQgeyBpc1NjYWxhciwgU0NBTEFSIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vbm9kZXMvU2NhbGFyLmpzJztcbmltcG9ydCB7IHJlc29sdmVCbG9ja1NjYWxhciB9IGZyb20gJy4vcmVzb2x2ZS1ibG9jay1zY2FsYXIuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUZsb3dTY2FsYXIgfSBmcm9tICcuL3Jlc29sdmUtZmxvdy1zY2FsYXIuanMnO1xuXG5mdW5jdGlvbiBjb21wb3NlU2NhbGFyKGN0eCwgdG9rZW4sIHRhZ1Rva2VuLCBvbkVycm9yKSB7XG4gICAgY29uc3QgeyB2YWx1ZSwgdHlwZSwgY29tbWVudCwgcmFuZ2UgfSA9IHRva2VuLnR5cGUgPT09ICdibG9jay1zY2FsYXInXG4gICAgICAgID8gcmVzb2x2ZUJsb2NrU2NhbGFyKGN0eCwgdG9rZW4sIG9uRXJyb3IpXG4gICAgICAgIDogcmVzb2x2ZUZsb3dTY2FsYXIodG9rZW4sIGN0eC5vcHRpb25zLnN0cmljdCwgb25FcnJvcik7XG4gICAgY29uc3QgdGFnTmFtZSA9IHRhZ1Rva2VuXG4gICAgICAgID8gY3R4LmRpcmVjdGl2ZXMudGFnTmFtZSh0YWdUb2tlbi5zb3VyY2UsIG1zZyA9PiBvbkVycm9yKHRhZ1Rva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKSlcbiAgICAgICAgOiBudWxsO1xuICAgIGxldCB0YWc7XG4gICAgaWYgKGN0eC5vcHRpb25zLnN0cmluZ0tleXMgJiYgY3R4LmF0S2V5KSB7XG4gICAgICAgIHRhZyA9IGN0eC5zY2hlbWFbU0NBTEFSXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGFnTmFtZSlcbiAgICAgICAgdGFnID0gZmluZFNjYWxhclRhZ0J5TmFtZShjdHguc2NoZW1hLCB2YWx1ZSwgdGFnTmFtZSwgdGFnVG9rZW4sIG9uRXJyb3IpO1xuICAgIGVsc2UgaWYgKHRva2VuLnR5cGUgPT09ICdzY2FsYXInKVxuICAgICAgICB0YWcgPSBmaW5kU2NhbGFyVGFnQnlUZXN0KGN0eCwgdmFsdWUsIHRva2VuLCBvbkVycm9yKTtcbiAgICBlbHNlXG4gICAgICAgIHRhZyA9IGN0eC5zY2hlbWFbU0NBTEFSXTtcbiAgICBsZXQgc2NhbGFyO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IHRhZy5yZXNvbHZlKHZhbHVlLCBtc2cgPT4gb25FcnJvcih0YWdUb2tlbiA/PyB0b2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZyksIGN0eC5vcHRpb25zKTtcbiAgICAgICAgc2NhbGFyID0gaXNTY2FsYXIocmVzKSA/IHJlcyA6IG5ldyBTY2FsYXIocmVzKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1zZyA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgb25FcnJvcih0YWdUb2tlbiA/PyB0b2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZyk7XG4gICAgICAgIHNjYWxhciA9IG5ldyBTY2FsYXIodmFsdWUpO1xuICAgIH1cbiAgICBzY2FsYXIucmFuZ2UgPSByYW5nZTtcbiAgICBzY2FsYXIuc291cmNlID0gdmFsdWU7XG4gICAgaWYgKHR5cGUpXG4gICAgICAgIHNjYWxhci50eXBlID0gdHlwZTtcbiAgICBpZiAodGFnTmFtZSlcbiAgICAgICAgc2NhbGFyLnRhZyA9IHRhZ05hbWU7XG4gICAgaWYgKHRhZy5mb3JtYXQpXG4gICAgICAgIHNjYWxhci5mb3JtYXQgPSB0YWcuZm9ybWF0O1xuICAgIGlmIChjb21tZW50KVxuICAgICAgICBzY2FsYXIuY29tbWVudCA9IGNvbW1lbnQ7XG4gICAgcmV0dXJuIHNjYWxhcjtcbn1cbmZ1bmN0aW9uIGZpbmRTY2FsYXJUYWdCeU5hbWUoc2NoZW1hLCB2YWx1ZSwgdGFnTmFtZSwgdGFnVG9rZW4sIG9uRXJyb3IpIHtcbiAgICBpZiAodGFnTmFtZSA9PT0gJyEnKVxuICAgICAgICByZXR1cm4gc2NoZW1hW1NDQUxBUl07IC8vIG5vbi1zcGVjaWZpYyB0YWdcbiAgICBjb25zdCBtYXRjaFdpdGhUZXN0ID0gW107XG4gICAgZm9yIChjb25zdCB0YWcgb2Ygc2NoZW1hLnRhZ3MpIHtcbiAgICAgICAgaWYgKCF0YWcuY29sbGVjdGlvbiAmJiB0YWcudGFnID09PSB0YWdOYW1lKSB7XG4gICAgICAgICAgICBpZiAodGFnLmRlZmF1bHQgJiYgdGFnLnRlc3QpXG4gICAgICAgICAgICAgICAgbWF0Y2hXaXRoVGVzdC5wdXNoKHRhZyk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhZztcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IHRhZyBvZiBtYXRjaFdpdGhUZXN0KVxuICAgICAgICBpZiAodGFnLnRlc3Q/LnRlc3QodmFsdWUpKVxuICAgICAgICAgICAgcmV0dXJuIHRhZztcbiAgICBjb25zdCBrdCA9IHNjaGVtYS5rbm93blRhZ3NbdGFnTmFtZV07XG4gICAgaWYgKGt0ICYmICFrdC5jb2xsZWN0aW9uKSB7XG4gICAgICAgIC8vIEVuc3VyZSB0aGF0IHRoZSBrbm93biB0YWcgaXMgYXZhaWxhYmxlIGZvciBzdHJpbmdpZnlpbmcsXG4gICAgICAgIC8vIGJ1dCBkb2VzIG5vdCBnZXQgdXNlZCBieSBkZWZhdWx0LlxuICAgICAgICBzY2hlbWEudGFncy5wdXNoKE9iamVjdC5hc3NpZ24oe30sIGt0LCB7IGRlZmF1bHQ6IGZhbHNlLCB0ZXN0OiB1bmRlZmluZWQgfSkpO1xuICAgICAgICByZXR1cm4ga3Q7XG4gICAgfVxuICAgIG9uRXJyb3IodGFnVG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBgVW5yZXNvbHZlZCB0YWc6ICR7dGFnTmFtZX1gLCB0YWdOYW1lICE9PSAndGFnOnlhbWwub3JnLDIwMDI6c3RyJyk7XG4gICAgcmV0dXJuIHNjaGVtYVtTQ0FMQVJdO1xufVxuZnVuY3Rpb24gZmluZFNjYWxhclRhZ0J5VGVzdCh7IGF0S2V5LCBkaXJlY3RpdmVzLCBzY2hlbWEgfSwgdmFsdWUsIHRva2VuLCBvbkVycm9yKSB7XG4gICAgY29uc3QgdGFnID0gc2NoZW1hLnRhZ3MuZmluZCh0YWcgPT4gKHRhZy5kZWZhdWx0ID09PSB0cnVlIHx8IChhdEtleSAmJiB0YWcuZGVmYXVsdCA9PT0gJ2tleScpKSAmJlxuICAgICAgICB0YWcudGVzdD8udGVzdCh2YWx1ZSkpIHx8IHNjaGVtYVtTQ0FMQVJdO1xuICAgIGlmIChzY2hlbWEuY29tcGF0KSB7XG4gICAgICAgIGNvbnN0IGNvbXBhdCA9IHNjaGVtYS5jb21wYXQuZmluZCh0YWcgPT4gdGFnLmRlZmF1bHQgJiYgdGFnLnRlc3Q/LnRlc3QodmFsdWUpKSA/P1xuICAgICAgICAgICAgc2NoZW1hW1NDQUxBUl07XG4gICAgICAgIGlmICh0YWcudGFnICE9PSBjb21wYXQudGFnKSB7XG4gICAgICAgICAgICBjb25zdCB0cyA9IGRpcmVjdGl2ZXMudGFnU3RyaW5nKHRhZy50YWcpO1xuICAgICAgICAgICAgY29uc3QgY3MgPSBkaXJlY3RpdmVzLnRhZ1N0cmluZyhjb21wYXQudGFnKTtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IGBWYWx1ZSBtYXkgYmUgcGFyc2VkIGFzIGVpdGhlciAke3RzfSBvciAke2NzfWA7XG4gICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFnO1xufVxuXG5leHBvcnQgeyBjb21wb3NlU2NhbGFyIH07XG4iLCAiZnVuY3Rpb24gZW1wdHlTY2FsYXJQb3NpdGlvbihvZmZzZXQsIGJlZm9yZSwgcG9zKSB7XG4gICAgaWYgKGJlZm9yZSkge1xuICAgICAgICBwb3MgPz8gKHBvcyA9IGJlZm9yZS5sZW5ndGgpO1xuICAgICAgICBmb3IgKGxldCBpID0gcG9zIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgIGxldCBzdCA9IGJlZm9yZVtpXTtcbiAgICAgICAgICAgIHN3aXRjaCAoc3QudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IC09IHN0LnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVGVjaG5pY2FsbHksIGFuIGVtcHR5IHNjYWxhciBpcyBpbW1lZGlhdGVseSBhZnRlciB0aGUgbGFzdCBub24tZW1wdHlcbiAgICAgICAgICAgIC8vIG5vZGUsIGJ1dCBpdCdzIG1vcmUgdXNlZnVsIHRvIHBsYWNlIGl0IGFmdGVyIGFueSB3aGl0ZXNwYWNlLlxuICAgICAgICAgICAgc3QgPSBiZWZvcmVbKytpXTtcbiAgICAgICAgICAgIHdoaWxlIChzdD8udHlwZSA9PT0gJ3NwYWNlJykge1xuICAgICAgICAgICAgICAgIG9mZnNldCArPSBzdC5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHN0ID0gYmVmb3JlWysraV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0O1xufVxuXG5leHBvcnQgeyBlbXB0eVNjYWxhclBvc2l0aW9uIH07XG4iLCAiaW1wb3J0IHsgQWxpYXMgfSBmcm9tICcuLi9ub2Rlcy9BbGlhcy5qcyc7XG5pbXBvcnQgeyBpc1NjYWxhciB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IGNvbXBvc2VDb2xsZWN0aW9uIH0gZnJvbSAnLi9jb21wb3NlLWNvbGxlY3Rpb24uanMnO1xuaW1wb3J0IHsgY29tcG9zZVNjYWxhciB9IGZyb20gJy4vY29tcG9zZS1zY2FsYXIuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUVuZCB9IGZyb20gJy4vcmVzb2x2ZS1lbmQuanMnO1xuaW1wb3J0IHsgZW1wdHlTY2FsYXJQb3NpdGlvbiB9IGZyb20gJy4vdXRpbC1lbXB0eS1zY2FsYXItcG9zaXRpb24uanMnO1xuXG5jb25zdCBDTiA9IHsgY29tcG9zZU5vZGUsIGNvbXBvc2VFbXB0eU5vZGUgfTtcbmZ1bmN0aW9uIGNvbXBvc2VOb2RlKGN0eCwgdG9rZW4sIHByb3BzLCBvbkVycm9yKSB7XG4gICAgY29uc3QgYXRLZXkgPSBjdHguYXRLZXk7XG4gICAgY29uc3QgeyBzcGFjZUJlZm9yZSwgY29tbWVudCwgYW5jaG9yLCB0YWcgfSA9IHByb3BzO1xuICAgIGxldCBub2RlO1xuICAgIGxldCBpc1NyY1Rva2VuID0gdHJ1ZTtcbiAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgbm9kZSA9IGNvbXBvc2VBbGlhcyhjdHgsIHRva2VuLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlmIChhbmNob3IgfHwgdGFnKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdBTElBU19QUk9QUycsICdBbiBhbGlhcyBub2RlIG11c3Qgbm90IHNwZWNpZnkgYW55IHByb3BlcnRpZXMnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgIG5vZGUgPSBjb21wb3NlU2NhbGFyKGN0eCwgdG9rZW4sIHRhZywgb25FcnJvcik7XG4gICAgICAgICAgICBpZiAoYW5jaG9yKVxuICAgICAgICAgICAgICAgIG5vZGUuYW5jaG9yID0gYW5jaG9yLnNvdXJjZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYmxvY2stbWFwJzpcbiAgICAgICAgY2FzZSAnYmxvY2stc2VxJzpcbiAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzpcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IGNvbXBvc2VDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgICAgICAgICAgaWYgKGFuY2hvcilcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5hbmNob3IgPSBhbmNob3Iuc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIC8vIEFsbW9zdCBjZXJ0YWlubHkgaGVyZSBkdWUgdG8gYSBzdGFjayBvdmVyZmxvd1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1JFU09VUkNFX0VYSEFVU1RJT04nLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gdG9rZW4udHlwZSA9PT0gJ2Vycm9yJ1xuICAgICAgICAgICAgICAgID8gdG9rZW4ubWVzc2FnZVxuICAgICAgICAgICAgICAgIDogYFVuc3VwcG9ydGVkIHRva2VuICh0eXBlOiAke3Rva2VuLnR5cGV9KWA7XG4gICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgaXNTcmNUb2tlbiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIG5vZGUgPz8gKG5vZGUgPSBjb21wb3NlRW1wdHlOb2RlKGN0eCwgdG9rZW4ub2Zmc2V0LCB1bmRlZmluZWQsIG51bGwsIHByb3BzLCBvbkVycm9yKSk7XG4gICAgaWYgKGFuY2hvciAmJiBub2RlLmFuY2hvciA9PT0gJycpXG4gICAgICAgIG9uRXJyb3IoYW5jaG9yLCAnQkFEX0FMSUFTJywgJ0FuY2hvciBjYW5ub3QgYmUgYW4gZW1wdHkgc3RyaW5nJyk7XG4gICAgaWYgKGF0S2V5ICYmXG4gICAgICAgIGN0eC5vcHRpb25zLnN0cmluZ0tleXMgJiZcbiAgICAgICAgKCFpc1NjYWxhcihub2RlKSB8fFxuICAgICAgICAgICAgdHlwZW9mIG5vZGUudmFsdWUgIT09ICdzdHJpbmcnIHx8XG4gICAgICAgICAgICAobm9kZS50YWcgJiYgbm9kZS50YWcgIT09ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInKSkpIHtcbiAgICAgICAgY29uc3QgbXNnID0gJ1dpdGggc3RyaW5nS2V5cywgYWxsIGtleXMgbXVzdCBiZSBzdHJpbmdzJztcbiAgICAgICAgb25FcnJvcih0YWcgPz8gdG9rZW4sICdOT05fU1RSSU5HX0tFWScsIG1zZyk7XG4gICAgfVxuICAgIGlmIChzcGFjZUJlZm9yZSlcbiAgICAgICAgbm9kZS5zcGFjZUJlZm9yZSA9IHRydWU7XG4gICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICdzY2FsYXInICYmIHRva2VuLnNvdXJjZSA9PT0gJycpXG4gICAgICAgICAgICBub2RlLmNvbW1lbnQgPSBjb21tZW50O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBub2RlLmNvbW1lbnRCZWZvcmUgPSBjb21tZW50O1xuICAgIH1cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFR5cGUgY2hlY2tpbmcgbWlzc2VzIG1lYW5pbmcgb2YgaXNTcmNUb2tlblxuICAgIGlmIChjdHgub3B0aW9ucy5rZWVwU291cmNlVG9rZW5zICYmIGlzU3JjVG9rZW4pXG4gICAgICAgIG5vZGUuc3JjVG9rZW4gPSB0b2tlbjtcbiAgICByZXR1cm4gbm9kZTtcbn1cbmZ1bmN0aW9uIGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBvZmZzZXQsIGJlZm9yZSwgcG9zLCB7IHNwYWNlQmVmb3JlLCBjb21tZW50LCBhbmNob3IsIHRhZywgZW5kIH0sIG9uRXJyb3IpIHtcbiAgICBjb25zdCB0b2tlbiA9IHtcbiAgICAgICAgdHlwZTogJ3NjYWxhcicsXG4gICAgICAgIG9mZnNldDogZW1wdHlTY2FsYXJQb3NpdGlvbihvZmZzZXQsIGJlZm9yZSwgcG9zKSxcbiAgICAgICAgaW5kZW50OiAtMSxcbiAgICAgICAgc291cmNlOiAnJ1xuICAgIH07XG4gICAgY29uc3Qgbm9kZSA9IGNvbXBvc2VTY2FsYXIoY3R4LCB0b2tlbiwgdGFnLCBvbkVycm9yKTtcbiAgICBpZiAoYW5jaG9yKSB7XG4gICAgICAgIG5vZGUuYW5jaG9yID0gYW5jaG9yLnNvdXJjZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgIGlmIChub2RlLmFuY2hvciA9PT0gJycpXG4gICAgICAgICAgICBvbkVycm9yKGFuY2hvciwgJ0JBRF9BTElBUycsICdBbmNob3IgY2Fubm90IGJlIGFuIGVtcHR5IHN0cmluZycpO1xuICAgIH1cbiAgICBpZiAoc3BhY2VCZWZvcmUpXG4gICAgICAgIG5vZGUuc3BhY2VCZWZvcmUgPSB0cnVlO1xuICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgIG5vZGUuY29tbWVudCA9IGNvbW1lbnQ7XG4gICAgICAgIG5vZGUucmFuZ2VbMl0gPSBlbmQ7XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xufVxuZnVuY3Rpb24gY29tcG9zZUFsaWFzKHsgb3B0aW9ucyB9LCB7IG9mZnNldCwgc291cmNlLCBlbmQgfSwgb25FcnJvcikge1xuICAgIGNvbnN0IGFsaWFzID0gbmV3IEFsaWFzKHNvdXJjZS5zdWJzdHJpbmcoMSkpO1xuICAgIGlmIChhbGlhcy5zb3VyY2UgPT09ICcnKVxuICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JBRF9BTElBUycsICdBbGlhcyBjYW5ub3QgYmUgYW4gZW1wdHkgc3RyaW5nJyk7XG4gICAgaWYgKGFsaWFzLnNvdXJjZS5lbmRzV2l0aCgnOicpKVxuICAgICAgICBvbkVycm9yKG9mZnNldCArIHNvdXJjZS5sZW5ndGggLSAxLCAnQkFEX0FMSUFTJywgJ0FsaWFzIGVuZGluZyBpbiA6IGlzIGFtYmlndW91cycsIHRydWUpO1xuICAgIGNvbnN0IHZhbHVlRW5kID0gb2Zmc2V0ICsgc291cmNlLmxlbmd0aDtcbiAgICBjb25zdCByZSA9IHJlc29sdmVFbmQoZW5kLCB2YWx1ZUVuZCwgb3B0aW9ucy5zdHJpY3QsIG9uRXJyb3IpO1xuICAgIGFsaWFzLnJhbmdlID0gW29mZnNldCwgdmFsdWVFbmQsIHJlLm9mZnNldF07XG4gICAgaWYgKHJlLmNvbW1lbnQpXG4gICAgICAgIGFsaWFzLmNvbW1lbnQgPSByZS5jb21tZW50O1xuICAgIHJldHVybiBhbGlhcztcbn1cblxuZXhwb3J0IHsgY29tcG9zZUVtcHR5Tm9kZSwgY29tcG9zZU5vZGUgfTtcbiIsICJpbXBvcnQgeyBEb2N1bWVudCB9IGZyb20gJy4uL2RvYy9Eb2N1bWVudC5qcyc7XG5pbXBvcnQgeyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9IGZyb20gJy4vY29tcG9zZS1ub2RlLmpzJztcbmltcG9ydCB7IHJlc29sdmVFbmQgfSBmcm9tICcuL3Jlc29sdmUtZW5kLmpzJztcbmltcG9ydCB7IHJlc29sdmVQcm9wcyB9IGZyb20gJy4vcmVzb2x2ZS1wcm9wcy5qcyc7XG5cbmZ1bmN0aW9uIGNvbXBvc2VEb2Mob3B0aW9ucywgZGlyZWN0aXZlcywgeyBvZmZzZXQsIHN0YXJ0LCB2YWx1ZSwgZW5kIH0sIG9uRXJyb3IpIHtcbiAgICBjb25zdCBvcHRzID0gT2JqZWN0LmFzc2lnbih7IF9kaXJlY3RpdmVzOiBkaXJlY3RpdmVzIH0sIG9wdGlvbnMpO1xuICAgIGNvbnN0IGRvYyA9IG5ldyBEb2N1bWVudCh1bmRlZmluZWQsIG9wdHMpO1xuICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgYXRLZXk6IGZhbHNlLFxuICAgICAgICBhdFJvb3Q6IHRydWUsXG4gICAgICAgIGRpcmVjdGl2ZXM6IGRvYy5kaXJlY3RpdmVzLFxuICAgICAgICBvcHRpb25zOiBkb2Mub3B0aW9ucyxcbiAgICAgICAgc2NoZW1hOiBkb2Muc2NoZW1hXG4gICAgfTtcbiAgICBjb25zdCBwcm9wcyA9IHJlc29sdmVQcm9wcyhzdGFydCwge1xuICAgICAgICBpbmRpY2F0b3I6ICdkb2Mtc3RhcnQnLFxuICAgICAgICBuZXh0OiB2YWx1ZSA/PyBlbmQ/LlswXSxcbiAgICAgICAgb2Zmc2V0LFxuICAgICAgICBvbkVycm9yLFxuICAgICAgICBwYXJlbnRJbmRlbnQ6IDAsXG4gICAgICAgIHN0YXJ0T25OZXdsaW5lOiB0cnVlXG4gICAgfSk7XG4gICAgaWYgKHByb3BzLmZvdW5kKSB7XG4gICAgICAgIGRvYy5kaXJlY3RpdmVzLmRvY1N0YXJ0ID0gdHJ1ZTtcbiAgICAgICAgaWYgKHZhbHVlICYmXG4gICAgICAgICAgICAodmFsdWUudHlwZSA9PT0gJ2Jsb2NrLW1hcCcgfHwgdmFsdWUudHlwZSA9PT0gJ2Jsb2NrLXNlcScpICYmXG4gICAgICAgICAgICAhcHJvcHMuaGFzTmV3bGluZSlcbiAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuZW5kLCAnTUlTU0lOR19DSEFSJywgJ0Jsb2NrIGNvbGxlY3Rpb24gY2Fubm90IHN0YXJ0IG9uIHNhbWUgbGluZSB3aXRoIGRpcmVjdGl2ZXMtZW5kIG1hcmtlcicpO1xuICAgIH1cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIElmIENvbnRlbnRzIGlzIHNldCwgbGV0J3MgdHJ1c3QgdGhlIHVzZXJcbiAgICBkb2MuY29udGVudHMgPSB2YWx1ZVxuICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHByb3BzLCBvbkVycm9yKVxuICAgICAgICA6IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBwcm9wcy5lbmQsIHN0YXJ0LCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgY29uc3QgY29udGVudEVuZCA9IGRvYy5jb250ZW50cy5yYW5nZVsyXTtcbiAgICBjb25zdCByZSA9IHJlc29sdmVFbmQoZW5kLCBjb250ZW50RW5kLCBmYWxzZSwgb25FcnJvcik7XG4gICAgaWYgKHJlLmNvbW1lbnQpXG4gICAgICAgIGRvYy5jb21tZW50ID0gcmUuY29tbWVudDtcbiAgICBkb2MucmFuZ2UgPSBbb2Zmc2V0LCBjb250ZW50RW5kLCByZS5vZmZzZXRdO1xuICAgIHJldHVybiBkb2M7XG59XG5cbmV4cG9ydCB7IGNvbXBvc2VEb2MgfTtcbiIsICJpbXBvcnQgeyBEaXJlY3RpdmVzIH0gZnJvbSAnLi4vZG9jL2RpcmVjdGl2ZXMuanMnO1xuaW1wb3J0IHsgRG9jdW1lbnQgfSBmcm9tICcuLi9kb2MvRG9jdW1lbnQuanMnO1xuaW1wb3J0IHsgWUFNTFdhcm5pbmcsIFlBTUxQYXJzZUVycm9yIH0gZnJvbSAnLi4vZXJyb3JzLmpzJztcbmltcG9ydCB7IGlzQ29sbGVjdGlvbiwgaXNQYWlyIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgY29tcG9zZURvYyB9IGZyb20gJy4vY29tcG9zZS1kb2MuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUVuZCB9IGZyb20gJy4vcmVzb2x2ZS1lbmQuanMnO1xuXG5mdW5jdGlvbiBnZXRFcnJvclBvcyhzcmMpIHtcbiAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ251bWJlcicpXG4gICAgICAgIHJldHVybiBbc3JjLCBzcmMgKyAxXTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzcmMpKVxuICAgICAgICByZXR1cm4gc3JjLmxlbmd0aCA9PT0gMiA/IHNyYyA6IFtzcmNbMF0sIHNyY1sxXV07XG4gICAgY29uc3QgeyBvZmZzZXQsIHNvdXJjZSB9ID0gc3JjO1xuICAgIHJldHVybiBbb2Zmc2V0LCBvZmZzZXQgKyAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycgPyBzb3VyY2UubGVuZ3RoIDogMSldO1xufVxuZnVuY3Rpb24gcGFyc2VQcmVsdWRlKHByZWx1ZGUpIHtcbiAgICBsZXQgY29tbWVudCA9ICcnO1xuICAgIGxldCBhdENvbW1lbnQgPSBmYWxzZTtcbiAgICBsZXQgYWZ0ZXJFbXB0eUxpbmUgPSBmYWxzZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWx1ZGUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3Qgc291cmNlID0gcHJlbHVkZVtpXTtcbiAgICAgICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgICAgIGNhc2UgJyMnOlxuICAgICAgICAgICAgICAgIGNvbW1lbnQgKz1cbiAgICAgICAgICAgICAgICAgICAgKGNvbW1lbnQgPT09ICcnID8gJycgOiBhZnRlckVtcHR5TGluZSA/ICdcXG5cXG4nIDogJ1xcbicpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChzb3VyY2Uuc3Vic3RyaW5nKDEpIHx8ICcgJyk7XG4gICAgICAgICAgICAgICAgYXRDb21tZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhZnRlckVtcHR5TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnJSc6XG4gICAgICAgICAgICAgICAgaWYgKHByZWx1ZGVbaSArIDFdPy5bMF0gIT09ICcjJylcbiAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgIGF0Q29tbWVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBUaGlzIG1heSBiZSB3cm9uZyBhZnRlciBkb2MtZW5kLCBidXQgaW4gdGhhdCBjYXNlIGl0IGRvZXNuJ3QgbWF0dGVyXG4gICAgICAgICAgICAgICAgaWYgKCFhdENvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIGFmdGVyRW1wdHlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhdENvbW1lbnQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBjb21tZW50LCBhZnRlckVtcHR5TGluZSB9O1xufVxuLyoqXG4gKiBDb21wb3NlIGEgc3RyZWFtIG9mIENTVCBub2RlcyBpbnRvIGEgc3RyZWFtIG9mIFlBTUwgRG9jdW1lbnRzLlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBDb21wb3NlciwgUGFyc2VyIH0gZnJvbSAneWFtbCdcbiAqXG4gKiBjb25zdCBzcmM6IHN0cmluZyA9IC4uLlxuICogY29uc3QgdG9rZW5zID0gbmV3IFBhcnNlcigpLnBhcnNlKHNyYylcbiAqIGNvbnN0IGRvY3MgPSBuZXcgQ29tcG9zZXIoKS5jb21wb3NlKHRva2VucylcbiAqIGBgYFxuICovXG5jbGFzcyBDb21wb3NlciB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMuZG9jID0gbnVsbDtcbiAgICAgICAgdGhpcy5hdERpcmVjdGl2ZXMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wcmVsdWRlID0gW107XG4gICAgICAgIHRoaXMuZXJyb3JzID0gW107XG4gICAgICAgIHRoaXMud2FybmluZ3MgPSBbXTtcbiAgICAgICAgdGhpcy5vbkVycm9yID0gKHNvdXJjZSwgY29kZSwgbWVzc2FnZSwgd2FybmluZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zID0gZ2V0RXJyb3JQb3Moc291cmNlKTtcbiAgICAgICAgICAgIGlmICh3YXJuaW5nKVxuICAgICAgICAgICAgICAgIHRoaXMud2FybmluZ3MucHVzaChuZXcgWUFNTFdhcm5pbmcocG9zLCBjb2RlLCBtZXNzYWdlKSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChuZXcgWUFNTFBhcnNlRXJyb3IocG9zLCBjb2RlLCBtZXNzYWdlKSk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLW51bGxpc2gtY29hbGVzY2luZ1xuICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBuZXcgRGlyZWN0aXZlcyh7IHZlcnNpb246IG9wdGlvbnMudmVyc2lvbiB8fCAnMS4yJyB9KTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG4gICAgZGVjb3JhdGUoZG9jLCBhZnRlckRvYykge1xuICAgICAgICBjb25zdCB7IGNvbW1lbnQsIGFmdGVyRW1wdHlMaW5lIH0gPSBwYXJzZVByZWx1ZGUodGhpcy5wcmVsdWRlKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh7IGRjOiBkb2MuY29tbWVudCwgcHJlbHVkZSwgY29tbWVudCB9KVxuICAgICAgICBpZiAoY29tbWVudCkge1xuICAgICAgICAgICAgY29uc3QgZGMgPSBkb2MuY29udGVudHM7XG4gICAgICAgICAgICBpZiAoYWZ0ZXJEb2MpIHtcbiAgICAgICAgICAgICAgICBkb2MuY29tbWVudCA9IGRvYy5jb21tZW50ID8gYCR7ZG9jLmNvbW1lbnR9XFxuJHtjb21tZW50fWAgOiBjb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYWZ0ZXJFbXB0eUxpbmUgfHwgZG9jLmRpcmVjdGl2ZXMuZG9jU3RhcnQgfHwgIWRjKSB7XG4gICAgICAgICAgICAgICAgZG9jLmNvbW1lbnRCZWZvcmUgPSBjb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNDb2xsZWN0aW9uKGRjKSAmJiAhZGMuZmxvdyAmJiBkYy5pdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IGl0ID0gZGMuaXRlbXNbMF07XG4gICAgICAgICAgICAgICAgaWYgKGlzUGFpcihpdCkpXG4gICAgICAgICAgICAgICAgICAgIGl0ID0gaXQua2V5O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNiID0gaXQuY29tbWVudEJlZm9yZTtcbiAgICAgICAgICAgICAgICBpdC5jb21tZW50QmVmb3JlID0gY2IgPyBgJHtjb21tZW50fVxcbiR7Y2J9YCA6IGNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYiA9IGRjLmNvbW1lbnRCZWZvcmU7XG4gICAgICAgICAgICAgICAgZGMuY29tbWVudEJlZm9yZSA9IGNiID8gYCR7Y29tbWVudH1cXG4ke2NifWAgOiBjb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhZnRlckRvYykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmVycm9ycy5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBkb2MuZXJyb3JzLnB1c2godGhpcy5lcnJvcnNbaV0pO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLndhcm5pbmdzLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGRvYy53YXJuaW5ncy5wdXNoKHRoaXMud2FybmluZ3NbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZG9jLmVycm9ycyA9IHRoaXMuZXJyb3JzO1xuICAgICAgICAgICAgZG9jLndhcm5pbmdzID0gdGhpcy53YXJuaW5ncztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByZWx1ZGUgPSBbXTtcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgdGhpcy53YXJuaW5ncyA9IFtdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDdXJyZW50IHN0cmVhbSBzdGF0dXMgaW5mb3JtYXRpb24uXG4gICAgICpcbiAgICAgKiBNb3N0bHkgdXNlZnVsIGF0IHRoZSBlbmQgb2YgaW5wdXQgZm9yIGFuIGVtcHR5IHN0cmVhbS5cbiAgICAgKi9cbiAgICBzdHJlYW1JbmZvKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29tbWVudDogcGFyc2VQcmVsdWRlKHRoaXMucHJlbHVkZSkuY29tbWVudCxcbiAgICAgICAgICAgIGRpcmVjdGl2ZXM6IHRoaXMuZGlyZWN0aXZlcyxcbiAgICAgICAgICAgIGVycm9yczogdGhpcy5lcnJvcnMsXG4gICAgICAgICAgICB3YXJuaW5nczogdGhpcy53YXJuaW5nc1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb21wb3NlIHRva2VucyBpbnRvIGRvY3VtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmb3JjZURvYyAtIElmIHRoZSBzdHJlYW0gY29udGFpbnMgbm8gZG9jdW1lbnQsIHN0aWxsIGVtaXQgYSBmaW5hbCBkb2N1bWVudCBpbmNsdWRpbmcgYW55IGNvbW1lbnRzIGFuZCBkaXJlY3RpdmVzIHRoYXQgd291bGQgYmUgYXBwbGllZCB0byBhIHN1YnNlcXVlbnQgZG9jdW1lbnQuXG4gICAgICogQHBhcmFtIGVuZE9mZnNldCAtIFNob3VsZCBiZSBzZXQgaWYgYGZvcmNlRG9jYCBpcyBhbHNvIHNldCwgdG8gc2V0IHRoZSBkb2N1bWVudCByYW5nZSBlbmQgYW5kIHRvIGluZGljYXRlIGVycm9ycyBjb3JyZWN0bHkuXG4gICAgICovXG4gICAgKmNvbXBvc2UodG9rZW5zLCBmb3JjZURvYyA9IGZhbHNlLCBlbmRPZmZzZXQgPSAtMSkge1xuICAgICAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2VucylcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLm5leHQodG9rZW4pO1xuICAgICAgICB5aWVsZCogdGhpcy5lbmQoZm9yY2VEb2MsIGVuZE9mZnNldCk7XG4gICAgfVxuICAgIC8qKiBBZHZhbmNlIHRoZSBjb21wb3NlciBieSBvbmUgQ1NUIHRva2VuLiAqL1xuICAgICpuZXh0KHRva2VuKSB7XG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZGlyZWN0aXZlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMuYWRkKHRva2VuLnNvdXJjZSwgKG9mZnNldCwgbWVzc2FnZSwgd2FybmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3MgPSBnZXRFcnJvclBvcyh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIHBvc1swXSArPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihwb3MsICdCQURfRElSRUNUSVZFJywgbWVzc2FnZSwgd2FybmluZyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVsdWRlLnB1c2godG9rZW4uc291cmNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmF0RGlyZWN0aXZlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkb2N1bWVudCc6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkb2MgPSBjb21wb3NlRG9jKHRoaXMub3B0aW9ucywgdGhpcy5kaXJlY3RpdmVzLCB0b2tlbiwgdGhpcy5vbkVycm9yKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hdERpcmVjdGl2ZXMgJiYgIWRvYy5kaXJlY3RpdmVzLmRvY1N0YXJ0KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IodG9rZW4sICdNSVNTSU5HX0NIQVInLCAnTWlzc2luZyBkaXJlY3RpdmVzLWVuZC9kb2Mtc3RhcnQgaW5kaWNhdG9yIGxpbmUnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlY29yYXRlKGRvYywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRvYylcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgdGhpcy5kb2M7XG4gICAgICAgICAgICAgICAgdGhpcy5kb2MgPSBkb2M7XG4gICAgICAgICAgICAgICAgdGhpcy5hdERpcmVjdGl2ZXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2J5dGUtb3JkZXItbWFyayc6XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIHRoaXMucHJlbHVkZS5wdXNoKHRva2VuLnNvdXJjZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdlcnJvcic6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSB0b2tlbi5zb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgPyBgJHt0b2tlbi5tZXNzYWdlfTogJHtKU09OLnN0cmluZ2lmeSh0b2tlbi5zb3VyY2UpfWBcbiAgICAgICAgICAgICAgICAgICAgOiB0b2tlbi5tZXNzYWdlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IFlBTUxQYXJzZUVycm9yKGdldEVycm9yUG9zKHRva2VuKSwgJ1VORVhQRUNURURfVE9LRU4nLCBtc2cpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0RGlyZWN0aXZlcyB8fCAhdGhpcy5kb2MpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kb2MuZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnZG9jLWVuZCc6IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZG9jKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9ICdVbmV4cGVjdGVkIGRvYy1lbmQgd2l0aG91dCBwcmVjZWRpbmcgZG9jdW1lbnQnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBZQU1MUGFyc2VFcnJvcihnZXRFcnJvclBvcyh0b2tlbiksICdVTkVYUEVDVEVEX1RPS0VOJywgbXNnKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRvYy5kaXJlY3RpdmVzLmRvY0VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kID0gcmVzb2x2ZUVuZCh0b2tlbi5lbmQsIHRva2VuLm9mZnNldCArIHRva2VuLnNvdXJjZS5sZW5ndGgsIHRoaXMuZG9jLm9wdGlvbnMuc3RyaWN0LCB0aGlzLm9uRXJyb3IpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVjb3JhdGUodGhpcy5kb2MsIHRydWUpO1xuICAgICAgICAgICAgICAgIGlmIChlbmQuY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYyA9IHRoaXMuZG9jLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9jLmNvbW1lbnQgPSBkYyA/IGAke2RjfVxcbiR7ZW5kLmNvbW1lbnR9YCA6IGVuZC5jb21tZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRvYy5yYW5nZVsyXSA9IGVuZC5vZmZzZXQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2gobmV3IFlBTUxQYXJzZUVycm9yKGdldEVycm9yUG9zKHRva2VuKSwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5zdXBwb3J0ZWQgdG9rZW4gJHt0b2tlbi50eXBlfWApKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsIGF0IGVuZCBvZiBpbnB1dCB0byB5aWVsZCBhbnkgcmVtYWluaW5nIGRvY3VtZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIGZvcmNlRG9jIC0gSWYgdGhlIHN0cmVhbSBjb250YWlucyBubyBkb2N1bWVudCwgc3RpbGwgZW1pdCBhIGZpbmFsIGRvY3VtZW50IGluY2x1ZGluZyBhbnkgY29tbWVudHMgYW5kIGRpcmVjdGl2ZXMgdGhhdCB3b3VsZCBiZSBhcHBsaWVkIHRvIGEgc3Vic2VxdWVudCBkb2N1bWVudC5cbiAgICAgKiBAcGFyYW0gZW5kT2Zmc2V0IC0gU2hvdWxkIGJlIHNldCBpZiBgZm9yY2VEb2NgIGlzIGFsc28gc2V0LCB0byBzZXQgdGhlIGRvY3VtZW50IHJhbmdlIGVuZCBhbmQgdG8gaW5kaWNhdGUgZXJyb3JzIGNvcnJlY3RseS5cbiAgICAgKi9cbiAgICAqZW5kKGZvcmNlRG9jID0gZmFsc2UsIGVuZE9mZnNldCA9IC0xKSB7XG4gICAgICAgIGlmICh0aGlzLmRvYykge1xuICAgICAgICAgICAgdGhpcy5kZWNvcmF0ZSh0aGlzLmRvYywgdHJ1ZSk7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLmRvYztcbiAgICAgICAgICAgIHRoaXMuZG9jID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmb3JjZURvYykge1xuICAgICAgICAgICAgY29uc3Qgb3B0cyA9IE9iamVjdC5hc3NpZ24oeyBfZGlyZWN0aXZlczogdGhpcy5kaXJlY3RpdmVzIH0sIHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBkb2MgPSBuZXcgRG9jdW1lbnQodW5kZWZpbmVkLCBvcHRzKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmF0RGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoZW5kT2Zmc2V0LCAnTUlTU0lOR19DSEFSJywgJ01pc3NpbmcgZGlyZWN0aXZlcy1lbmQgaW5kaWNhdG9yIGxpbmUnKTtcbiAgICAgICAgICAgIGRvYy5yYW5nZSA9IFswLCBlbmRPZmZzZXQsIGVuZE9mZnNldF07XG4gICAgICAgICAgICB0aGlzLmRlY29yYXRlKGRvYywgZmFsc2UpO1xuICAgICAgICAgICAgeWllbGQgZG9jO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgeyBDb21wb3NlciB9O1xuIiwgImV4cG9ydCB7IGNyZWF0ZVNjYWxhclRva2VuLCByZXNvbHZlQXNTY2FsYXIsIHNldFNjYWxhclZhbHVlIH0gZnJvbSAnLi9jc3Qtc2NhbGFyLmpzJztcbmV4cG9ydCB7IHN0cmluZ2lmeSB9IGZyb20gJy4vY3N0LXN0cmluZ2lmeS5qcyc7XG5leHBvcnQgeyB2aXNpdCB9IGZyb20gJy4vY3N0LXZpc2l0LmpzJztcblxuLyoqIFRoZSBieXRlIG9yZGVyIG1hcmsgKi9cbmNvbnN0IEJPTSA9ICdcXHV7RkVGRn0nO1xuLyoqIFN0YXJ0IG9mIGRvYy1tb2RlICovXG5jb25zdCBET0NVTUVOVCA9ICdcXHgwMic7IC8vIEMwOiBTdGFydCBvZiBUZXh0XG4vKiogVW5leHBlY3RlZCBlbmQgb2YgZmxvdy1tb2RlICovXG5jb25zdCBGTE9XX0VORCA9ICdcXHgxOCc7IC8vIEMwOiBDYW5jZWxcbi8qKiBOZXh0IHRva2VuIGlzIGEgc2NhbGFyIHZhbHVlICovXG5jb25zdCBTQ0FMQVIgPSAnXFx4MWYnOyAvLyBDMDogVW5pdCBTZXBhcmF0b3Jcbi8qKiBAcmV0dXJucyBgdHJ1ZWAgaWYgYHRva2VuYCBpcyBhIGZsb3cgb3IgYmxvY2sgY29sbGVjdGlvbiAqL1xuY29uc3QgaXNDb2xsZWN0aW9uID0gKHRva2VuKSA9PiAhIXRva2VuICYmICdpdGVtcycgaW4gdG9rZW47XG4vKiogQHJldHVybnMgYHRydWVgIGlmIGB0b2tlbmAgaXMgYSBmbG93IG9yIGJsb2NrIHNjYWxhcjsgbm90IGFuIGFsaWFzICovXG5jb25zdCBpc1NjYWxhciA9ICh0b2tlbikgPT4gISF0b2tlbiAmJlxuICAgICh0b2tlbi50eXBlID09PSAnc2NhbGFyJyB8fFxuICAgICAgICB0b2tlbi50eXBlID09PSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInIHx8XG4gICAgICAgIHRva2VuLnR5cGUgPT09ICdkb3VibGUtcXVvdGVkLXNjYWxhcicgfHxcbiAgICAgICAgdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNjYWxhcicpO1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbi8qKiBHZXQgYSBwcmludGFibGUgcmVwcmVzZW50YXRpb24gb2YgYSBsZXhlciB0b2tlbiAqL1xuZnVuY3Rpb24gcHJldHR5VG9rZW4odG9rZW4pIHtcbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICAgIGNhc2UgQk9NOlxuICAgICAgICAgICAgcmV0dXJuICc8Qk9NPic7XG4gICAgICAgIGNhc2UgRE9DVU1FTlQ6XG4gICAgICAgICAgICByZXR1cm4gJzxET0M+JztcbiAgICAgICAgY2FzZSBGTE9XX0VORDpcbiAgICAgICAgICAgIHJldHVybiAnPEZMT1dfRU5EPic7XG4gICAgICAgIGNhc2UgU0NBTEFSOlxuICAgICAgICAgICAgcmV0dXJuICc8U0NBTEFSPic7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodG9rZW4pO1xuICAgIH1cbn1cbi8qKiBJZGVudGlmeSB0aGUgdHlwZSBvZiBhIGxleGVyIHRva2VuLiBNYXkgcmV0dXJuIGBudWxsYCBmb3IgdW5rbm93biB0b2tlbnMuICovXG5mdW5jdGlvbiB0b2tlblR5cGUoc291cmNlKSB7XG4gICAgc3dpdGNoIChzb3VyY2UpIHtcbiAgICAgICAgY2FzZSBCT006XG4gICAgICAgICAgICByZXR1cm4gJ2J5dGUtb3JkZXItbWFyayc7XG4gICAgICAgIGNhc2UgRE9DVU1FTlQ6XG4gICAgICAgICAgICByZXR1cm4gJ2RvYy1tb2RlJztcbiAgICAgICAgY2FzZSBGTE9XX0VORDpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1lcnJvci1lbmQnO1xuICAgICAgICBjYXNlIFNDQUxBUjpcbiAgICAgICAgICAgIHJldHVybiAnc2NhbGFyJztcbiAgICAgICAgY2FzZSAnLS0tJzpcbiAgICAgICAgICAgIHJldHVybiAnZG9jLXN0YXJ0JztcbiAgICAgICAgY2FzZSAnLi4uJzpcbiAgICAgICAgICAgIHJldHVybiAnZG9jLWVuZCc7XG4gICAgICAgIGNhc2UgJyc6XG4gICAgICAgIGNhc2UgJ1xcbic6XG4gICAgICAgIGNhc2UgJ1xcclxcbic6XG4gICAgICAgICAgICByZXR1cm4gJ25ld2xpbmUnO1xuICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgIHJldHVybiAnc2VxLWl0ZW0taW5kJztcbiAgICAgICAgY2FzZSAnPyc6XG4gICAgICAgICAgICByZXR1cm4gJ2V4cGxpY2l0LWtleS1pbmQnO1xuICAgICAgICBjYXNlICc6JzpcbiAgICAgICAgICAgIHJldHVybiAnbWFwLXZhbHVlLWluZCc7XG4gICAgICAgIGNhc2UgJ3snOlxuICAgICAgICAgICAgcmV0dXJuICdmbG93LW1hcC1zdGFydCc7XG4gICAgICAgIGNhc2UgJ30nOlxuICAgICAgICAgICAgcmV0dXJuICdmbG93LW1hcC1lbmQnO1xuICAgICAgICBjYXNlICdbJzpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1zZXEtc3RhcnQnO1xuICAgICAgICBjYXNlICddJzpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1zZXEtZW5kJztcbiAgICAgICAgY2FzZSAnLCc6XG4gICAgICAgICAgICByZXR1cm4gJ2NvbW1hJztcbiAgICB9XG4gICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgY2FzZSAnICc6XG4gICAgICAgIGNhc2UgJ1xcdCc6XG4gICAgICAgICAgICByZXR1cm4gJ3NwYWNlJztcbiAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICByZXR1cm4gJ2NvbW1lbnQnO1xuICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgIHJldHVybiAnZGlyZWN0aXZlLWxpbmUnO1xuICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgIHJldHVybiAnYWxpYXMnO1xuICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgIHJldHVybiAnYW5jaG9yJztcbiAgICAgICAgY2FzZSAnISc6XG4gICAgICAgICAgICByZXR1cm4gJ3RhZyc7XG4gICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICByZXR1cm4gJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJztcbiAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgcmV0dXJuICdkb3VibGUtcXVvdGVkLXNjYWxhcic7XG4gICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgIHJldHVybiAnYmxvY2stc2NhbGFyLWhlYWRlcic7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgeyBCT00sIERPQ1VNRU5ULCBGTE9XX0VORCwgU0NBTEFSLCBpc0NvbGxlY3Rpb24sIGlzU2NhbGFyLCBwcmV0dHlUb2tlbiwgdG9rZW5UeXBlIH07XG4iLCAiaW1wb3J0IHsgcmVzb2x2ZUJsb2NrU2NhbGFyIH0gZnJvbSAnLi4vY29tcG9zZS9yZXNvbHZlLWJsb2NrLXNjYWxhci5qcyc7XG5pbXBvcnQgeyByZXNvbHZlRmxvd1NjYWxhciB9IGZyb20gJy4uL2NvbXBvc2UvcmVzb2x2ZS1mbG93LXNjYWxhci5qcyc7XG5pbXBvcnQgeyBZQU1MUGFyc2VFcnJvciB9IGZyb20gJy4uL2Vycm9ycy5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnlTdHJpbmcgfSBmcm9tICcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5U3RyaW5nLmpzJztcblxuZnVuY3Rpb24gcmVzb2x2ZUFzU2NhbGFyKHRva2VuLCBzdHJpY3QgPSB0cnVlLCBvbkVycm9yKSB7XG4gICAgaWYgKHRva2VuKSB7XG4gICAgICAgIGNvbnN0IF9vbkVycm9yID0gKHBvcywgY29kZSwgbWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gdHlwZW9mIHBvcyA9PT0gJ251bWJlcicgPyBwb3MgOiBBcnJheS5pc0FycmF5KHBvcykgPyBwb3NbMF0gOiBwb3Mub2Zmc2V0O1xuICAgICAgICAgICAgaWYgKG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsIGNvZGUsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBZQU1MUGFyc2VFcnJvcihbb2Zmc2V0LCBvZmZzZXQgKyAxXSwgY29kZSwgbWVzc2FnZSk7XG4gICAgICAgIH07XG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZUZsb3dTY2FsYXIodG9rZW4sIHN0cmljdCwgX29uRXJyb3IpO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZUJsb2NrU2NhbGFyKHsgb3B0aW9uczogeyBzdHJpY3QgfSB9LCB0b2tlbiwgX29uRXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgc2NhbGFyIHRva2VuIHdpdGggYHZhbHVlYFxuICpcbiAqIFZhbHVlcyB0aGF0IHJlcHJlc2VudCBhbiBhY3R1YWwgc3RyaW5nIGJ1dCBtYXkgYmUgcGFyc2VkIGFzIGEgZGlmZmVyZW50IHR5cGUgc2hvdWxkIHVzZSBhIGB0eXBlYCBvdGhlciB0aGFuIGAnUExBSU4nYCxcbiAqIGFzIHRoaXMgZnVuY3Rpb24gZG9lcyBub3Qgc3VwcG9ydCBhbnkgc2NoZW1hIG9wZXJhdGlvbnMgYW5kIHdvbid0IGNoZWNrIGZvciBzdWNoIGNvbmZsaWN0cy5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmFsdWUsIHdoaWNoIHdpbGwgaGF2ZSBpdHMgY29udGVudCBwcm9wZXJseSBpbmRlbnRlZC5cbiAqIEBwYXJhbSBjb250ZXh0LmVuZCBDb21tZW50cyBhbmQgd2hpdGVzcGFjZSBhZnRlciB0aGUgZW5kIG9mIHRoZSB2YWx1ZSwgb3IgYWZ0ZXIgdGhlIGJsb2NrIHNjYWxhciBoZWFkZXIuIElmIHVuZGVmaW5lZCwgYSBuZXdsaW5lIHdpbGwgYmUgYWRkZWQuXG4gKiBAcGFyYW0gY29udGV4dC5pbXBsaWNpdEtleSBCZWluZyB3aXRoaW4gYW4gaW1wbGljaXQga2V5IG1heSBhZmZlY3QgdGhlIHJlc29sdmVkIHR5cGUgb2YgdGhlIHRva2VuJ3MgdmFsdWUuXG4gKiBAcGFyYW0gY29udGV4dC5pbmRlbnQgVGhlIGluZGVudCBsZXZlbCBvZiB0aGUgdG9rZW4uXG4gKiBAcGFyYW0gY29udGV4dC5pbkZsb3cgSXMgdGhpcyBzY2FsYXIgd2l0aGluIGEgZmxvdyBjb2xsZWN0aW9uPyBUaGlzIG1heSBhZmZlY3QgdGhlIHJlc29sdmVkIHR5cGUgb2YgdGhlIHRva2VuJ3MgdmFsdWUuXG4gKiBAcGFyYW0gY29udGV4dC5vZmZzZXQgVGhlIG9mZnNldCBwb3NpdGlvbiBvZiB0aGUgdG9rZW4uXG4gKiBAcGFyYW0gY29udGV4dC50eXBlIFRoZSBwcmVmZXJyZWQgdHlwZSBvZiB0aGUgc2NhbGFyIHRva2VuLiBJZiB1bmRlZmluZWQsIHRoZSBwcmV2aW91cyB0eXBlIG9mIHRoZSBgdG9rZW5gIHdpbGwgYmUgdXNlZCwgZGVmYXVsdGluZyB0byBgJ1BMQUlOJ2AuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVNjYWxhclRva2VuKHZhbHVlLCBjb250ZXh0KSB7XG4gICAgY29uc3QgeyBpbXBsaWNpdEtleSA9IGZhbHNlLCBpbmRlbnQsIGluRmxvdyA9IGZhbHNlLCBvZmZzZXQgPSAtMSwgdHlwZSA9ICdQTEFJTicgfSA9IGNvbnRleHQ7XG4gICAgY29uc3Qgc291cmNlID0gc3RyaW5naWZ5U3RyaW5nKHsgdHlwZSwgdmFsdWUgfSwge1xuICAgICAgICBpbXBsaWNpdEtleSxcbiAgICAgICAgaW5kZW50OiBpbmRlbnQgPiAwID8gJyAnLnJlcGVhdChpbmRlbnQpIDogJycsXG4gICAgICAgIGluRmxvdyxcbiAgICAgICAgb3B0aW9uczogeyBibG9ja1F1b3RlOiB0cnVlLCBsaW5lV2lkdGg6IC0xIH1cbiAgICB9KTtcbiAgICBjb25zdCBlbmQgPSBjb250ZXh0LmVuZCA/PyBbXG4gICAgICAgIHsgdHlwZTogJ25ld2xpbmUnLCBvZmZzZXQ6IC0xLCBpbmRlbnQsIHNvdXJjZTogJ1xcbicgfVxuICAgIF07XG4gICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgIGNhc2UgJz4nOiB7XG4gICAgICAgICAgICBjb25zdCBoZSA9IHNvdXJjZS5pbmRleE9mKCdcXG4nKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWQgPSBzb3VyY2Uuc3Vic3RyaW5nKDAsIGhlKTtcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBzb3VyY2Uuc3Vic3RyaW5nKGhlICsgMSkgKyAnXFxuJztcbiAgICAgICAgICAgIGNvbnN0IHByb3BzID0gW1xuICAgICAgICAgICAgICAgIHsgdHlwZTogJ2Jsb2NrLXNjYWxhci1oZWFkZXInLCBvZmZzZXQsIGluZGVudCwgc291cmNlOiBoZWFkIH1cbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAoIWFkZEVuZHRvQmxvY2tQcm9wcyhwcm9wcywgZW5kKSlcbiAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHsgdHlwZTogJ25ld2xpbmUnLCBvZmZzZXQ6IC0xLCBpbmRlbnQsIHNvdXJjZTogJ1xcbicgfSk7XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiAnYmxvY2stc2NhbGFyJywgb2Zmc2V0LCBpbmRlbnQsIHByb3BzLCBzb3VyY2U6IGJvZHkgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZG91YmxlLXF1b3RlZC1zY2FsYXInLCBvZmZzZXQsIGluZGVudCwgc291cmNlLCBlbmQgfTtcbiAgICAgICAgY2FzZSBcIidcIjpcbiAgICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdzaW5nbGUtcXVvdGVkLXNjYWxhcicsIG9mZnNldCwgaW5kZW50LCBzb3VyY2UsIGVuZCB9O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3NjYWxhcicsIG9mZnNldCwgaW5kZW50LCBzb3VyY2UsIGVuZCB9O1xuICAgIH1cbn1cbi8qKlxuICogU2V0IHRoZSB2YWx1ZSBvZiBgdG9rZW5gIHRvIHRoZSBnaXZlbiBzdHJpbmcgYHZhbHVlYCwgb3ZlcndyaXRpbmcgYW55IHByZXZpb3VzIGNvbnRlbnRzIGFuZCB0eXBlIHRoYXQgaXQgbWF5IGhhdmUuXG4gKlxuICogQmVzdCBlZmZvcnRzIGFyZSBtYWRlIHRvIHJldGFpbiBhbnkgY29tbWVudHMgcHJldmlvdXNseSBhc3NvY2lhdGVkIHdpdGggdGhlIGB0b2tlbmAsXG4gKiB0aG91Z2ggYWxsIGNvbnRlbnRzIHdpdGhpbiBhIGNvbGxlY3Rpb24ncyBgaXRlbXNgIHdpbGwgYmUgb3ZlcndyaXR0ZW4uXG4gKlxuICogVmFsdWVzIHRoYXQgcmVwcmVzZW50IGFuIGFjdHVhbCBzdHJpbmcgYnV0IG1heSBiZSBwYXJzZWQgYXMgYSBkaWZmZXJlbnQgdHlwZSBzaG91bGQgdXNlIGEgYHR5cGVgIG90aGVyIHRoYW4gYCdQTEFJTidgLFxuICogYXMgdGhpcyBmdW5jdGlvbiBkb2VzIG5vdCBzdXBwb3J0IGFueSBzY2hlbWEgb3BlcmF0aW9ucyBhbmQgd29uJ3QgY2hlY2sgZm9yIHN1Y2ggY29uZmxpY3RzLlxuICpcbiAqIEBwYXJhbSB0b2tlbiBBbnkgdG9rZW4uIElmIGl0IGRvZXMgbm90IGluY2x1ZGUgYW4gYGluZGVudGAgdmFsdWUsIHRoZSB2YWx1ZSB3aWxsIGJlIHN0cmluZ2lmaWVkIGFzIGlmIGl0IHdlcmUgYW4gaW1wbGljaXQga2V5LlxuICogQHBhcmFtIHZhbHVlIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZhbHVlLCB3aGljaCB3aWxsIGhhdmUgaXRzIGNvbnRlbnQgcHJvcGVybHkgaW5kZW50ZWQuXG4gKiBAcGFyYW0gY29udGV4dC5hZnRlcktleSBJbiBtb3N0IGNhc2VzLCB2YWx1ZXMgYWZ0ZXIgYSBrZXkgc2hvdWxkIGhhdmUgYW4gYWRkaXRpb25hbCBsZXZlbCBvZiBpbmRlbnRhdGlvbi5cbiAqIEBwYXJhbSBjb250ZXh0LmltcGxpY2l0S2V5IEJlaW5nIHdpdGhpbiBhbiBpbXBsaWNpdCBrZXkgbWF5IGFmZmVjdCB0aGUgcmVzb2x2ZWQgdHlwZSBvZiB0aGUgdG9rZW4ncyB2YWx1ZS5cbiAqIEBwYXJhbSBjb250ZXh0LmluRmxvdyBCZWluZyB3aXRoaW4gYSBmbG93IGNvbGxlY3Rpb24gbWF5IGFmZmVjdCB0aGUgcmVzb2x2ZWQgdHlwZSBvZiB0aGUgdG9rZW4ncyB2YWx1ZS5cbiAqIEBwYXJhbSBjb250ZXh0LnR5cGUgVGhlIHByZWZlcnJlZCB0eXBlIG9mIHRoZSBzY2FsYXIgdG9rZW4uIElmIHVuZGVmaW5lZCwgdGhlIHByZXZpb3VzIHR5cGUgb2YgdGhlIGB0b2tlbmAgd2lsbCBiZSB1c2VkLCBkZWZhdWx0aW5nIHRvIGAnUExBSU4nYC5cbiAqL1xuZnVuY3Rpb24gc2V0U2NhbGFyVmFsdWUodG9rZW4sIHZhbHVlLCBjb250ZXh0ID0ge30pIHtcbiAgICBsZXQgeyBhZnRlcktleSA9IGZhbHNlLCBpbXBsaWNpdEtleSA9IGZhbHNlLCBpbkZsb3cgPSBmYWxzZSwgdHlwZSB9ID0gY29udGV4dDtcbiAgICBsZXQgaW5kZW50ID0gJ2luZGVudCcgaW4gdG9rZW4gPyB0b2tlbi5pbmRlbnQgOiBudWxsO1xuICAgIGlmIChhZnRlcktleSAmJiB0eXBlb2YgaW5kZW50ID09PSAnbnVtYmVyJylcbiAgICAgICAgaW5kZW50ICs9IDI7XG4gICAgaWYgKCF0eXBlKVxuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICB0eXBlID0gJ1FVT1RFX1NJTkdMRSc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgdHlwZSA9ICdRVU9URV9ET1VCTEUnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IHRva2VuLnByb3BzWzBdO1xuICAgICAgICAgICAgICAgIGlmIChoZWFkZXIudHlwZSAhPT0gJ2Jsb2NrLXNjYWxhci1oZWFkZXInKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYmxvY2sgc2NhbGFyIGhlYWRlcicpO1xuICAgICAgICAgICAgICAgIHR5cGUgPSBoZWFkZXIuc291cmNlWzBdID09PSAnPicgPyAnQkxPQ0tfRk9MREVEJyA6ICdCTE9DS19MSVRFUkFMJztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdHlwZSA9ICdQTEFJTic7XG4gICAgICAgIH1cbiAgICBjb25zdCBzb3VyY2UgPSBzdHJpbmdpZnlTdHJpbmcoeyB0eXBlLCB2YWx1ZSB9LCB7XG4gICAgICAgIGltcGxpY2l0S2V5OiBpbXBsaWNpdEtleSB8fCBpbmRlbnQgPT09IG51bGwsXG4gICAgICAgIGluZGVudDogaW5kZW50ICE9PSBudWxsICYmIGluZGVudCA+IDAgPyAnICcucmVwZWF0KGluZGVudCkgOiAnJyxcbiAgICAgICAgaW5GbG93LFxuICAgICAgICBvcHRpb25zOiB7IGJsb2NrUXVvdGU6IHRydWUsIGxpbmVXaWR0aDogLTEgfVxuICAgIH0pO1xuICAgIHN3aXRjaCAoc291cmNlWzBdKSB7XG4gICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgIHNldEJsb2NrU2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgc2V0Rmxvd1NjYWxhclZhbHVlKHRva2VuLCBzb3VyY2UsICdkb3VibGUtcXVvdGVkLXNjYWxhcicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICBzZXRGbG93U2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSwgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHNldEZsb3dTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlLCAnc2NhbGFyJyk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0QmxvY2tTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlKSB7XG4gICAgY29uc3QgaGUgPSBzb3VyY2UuaW5kZXhPZignXFxuJyk7XG4gICAgY29uc3QgaGVhZCA9IHNvdXJjZS5zdWJzdHJpbmcoMCwgaGUpO1xuICAgIGNvbnN0IGJvZHkgPSBzb3VyY2Uuc3Vic3RyaW5nKGhlICsgMSkgKyAnXFxuJztcbiAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNjYWxhcicpIHtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gdG9rZW4ucHJvcHNbMF07XG4gICAgICAgIGlmIChoZWFkZXIudHlwZSAhPT0gJ2Jsb2NrLXNjYWxhci1oZWFkZXInKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJsb2NrIHNjYWxhciBoZWFkZXInKTtcbiAgICAgICAgaGVhZGVyLnNvdXJjZSA9IGhlYWQ7XG4gICAgICAgIHRva2VuLnNvdXJjZSA9IGJvZHk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCB7IG9mZnNldCB9ID0gdG9rZW47XG4gICAgICAgIGNvbnN0IGluZGVudCA9ICdpbmRlbnQnIGluIHRva2VuID8gdG9rZW4uaW5kZW50IDogLTE7XG4gICAgICAgIGNvbnN0IHByb3BzID0gW1xuICAgICAgICAgICAgeyB0eXBlOiAnYmxvY2stc2NhbGFyLWhlYWRlcicsIG9mZnNldCwgaW5kZW50LCBzb3VyY2U6IGhlYWQgfVxuICAgICAgICBdO1xuICAgICAgICBpZiAoIWFkZEVuZHRvQmxvY2tQcm9wcyhwcm9wcywgJ2VuZCcgaW4gdG9rZW4gPyB0b2tlbi5lbmQgOiB1bmRlZmluZWQpKVxuICAgICAgICAgICAgcHJvcHMucHVzaCh7IHR5cGU6ICduZXdsaW5lJywgb2Zmc2V0OiAtMSwgaW5kZW50LCBzb3VyY2U6ICdcXG4nIH0pO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0b2tlbikpXG4gICAgICAgICAgICBpZiAoa2V5ICE9PSAndHlwZScgJiYga2V5ICE9PSAnb2Zmc2V0JylcbiAgICAgICAgICAgICAgICBkZWxldGUgdG9rZW5ba2V5XTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0b2tlbiwgeyB0eXBlOiAnYmxvY2stc2NhbGFyJywgaW5kZW50LCBwcm9wcywgc291cmNlOiBib2R5IH0pO1xuICAgIH1cbn1cbi8qKiBAcmV0dXJucyBgdHJ1ZWAgaWYgbGFzdCB0b2tlbiBpcyBhIG5ld2xpbmUgKi9cbmZ1bmN0aW9uIGFkZEVuZHRvQmxvY2tQcm9wcyhwcm9wcywgZW5kKSB7XG4gICAgaWYgKGVuZClcbiAgICAgICAgZm9yIChjb25zdCBzdCBvZiBlbmQpXG4gICAgICAgICAgICBzd2l0Y2ggKHN0LnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLnB1c2goc3QpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMucHVzaChzdCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIHNldEZsb3dTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlLCB0eXBlKSB7XG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgdG9rZW4udHlwZSA9IHR5cGU7XG4gICAgICAgICAgICB0b2tlbi5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzoge1xuICAgICAgICAgICAgY29uc3QgZW5kID0gdG9rZW4ucHJvcHMuc2xpY2UoMSk7XG4gICAgICAgICAgICBsZXQgb2EgPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKHRva2VuLnByb3BzWzBdLnR5cGUgPT09ICdibG9jay1zY2FsYXItaGVhZGVyJylcbiAgICAgICAgICAgICAgICBvYSAtPSB0b2tlbi5wcm9wc1swXS5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChjb25zdCB0b2sgb2YgZW5kKVxuICAgICAgICAgICAgICAgIHRvay5vZmZzZXQgKz0gb2E7XG4gICAgICAgICAgICBkZWxldGUgdG9rZW4ucHJvcHM7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRva2VuLCB7IHR5cGUsIHNvdXJjZSwgZW5kIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnYmxvY2stbWFwJzpcbiAgICAgICAgY2FzZSAnYmxvY2stc2VxJzoge1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gdG9rZW4ub2Zmc2V0ICsgc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IG5sID0geyB0eXBlOiAnbmV3bGluZScsIG9mZnNldCwgaW5kZW50OiB0b2tlbi5pbmRlbnQsIHNvdXJjZTogJ1xcbicgfTtcbiAgICAgICAgICAgIGRlbGV0ZSB0b2tlbi5pdGVtcztcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odG9rZW4sIHsgdHlwZSwgc291cmNlLCBlbmQ6IFtubF0gfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBjb25zdCBpbmRlbnQgPSAnaW5kZW50JyBpbiB0b2tlbiA/IHRva2VuLmluZGVudCA6IC0xO1xuICAgICAgICAgICAgY29uc3QgZW5kID0gJ2VuZCcgaW4gdG9rZW4gJiYgQXJyYXkuaXNBcnJheSh0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgPyB0b2tlbi5lbmQuZmlsdGVyKHN0ID0+IHN0LnR5cGUgPT09ICdzcGFjZScgfHxcbiAgICAgICAgICAgICAgICAgICAgc3QudHlwZSA9PT0gJ2NvbW1lbnQnIHx8XG4gICAgICAgICAgICAgICAgICAgIHN0LnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICA6IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModG9rZW4pKVxuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09ICd0eXBlJyAmJiBrZXkgIT09ICdvZmZzZXQnKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdG9rZW5ba2V5XTtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odG9rZW4sIHsgdHlwZSwgaW5kZW50LCBzb3VyY2UsIGVuZCB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHsgY3JlYXRlU2NhbGFyVG9rZW4sIHJlc29sdmVBc1NjYWxhciwgc2V0U2NhbGFyVmFsdWUgfTtcbiIsICIvKipcbiAqIFN0cmluZ2lmeSBhIENTVCBkb2N1bWVudCwgdG9rZW4sIG9yIGNvbGxlY3Rpb24gaXRlbVxuICpcbiAqIEZhaXIgd2FybmluZzogVGhpcyBhcHBsaWVzIG5vIHZhbGlkYXRpb24gd2hhdHNvZXZlciwgYW5kXG4gKiBzaW1wbHkgY29uY2F0ZW5hdGVzIHRoZSBzb3VyY2VzIGluIHRoZWlyIGxvZ2ljYWwgb3JkZXIuXG4gKi9cbmNvbnN0IHN0cmluZ2lmeSA9IChjc3QpID0+ICd0eXBlJyBpbiBjc3QgPyBzdHJpbmdpZnlUb2tlbihjc3QpIDogc3RyaW5naWZ5SXRlbShjc3QpO1xuZnVuY3Rpb24gc3RyaW5naWZ5VG9rZW4odG9rZW4pIHtcbiAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzoge1xuICAgICAgICAgICAgbGV0IHJlcyA9ICcnO1xuICAgICAgICAgICAgZm9yIChjb25zdCB0b2sgb2YgdG9rZW4ucHJvcHMpXG4gICAgICAgICAgICAgICAgcmVzICs9IHN0cmluZ2lmeVRva2VuKHRvayk7XG4gICAgICAgICAgICByZXR1cm4gcmVzICsgdG9rZW4uc291cmNlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNlcSc6IHtcbiAgICAgICAgICAgIGxldCByZXMgPSAnJztcbiAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0b2tlbi5pdGVtcylcbiAgICAgICAgICAgICAgICByZXMgKz0gc3RyaW5naWZ5SXRlbShpdGVtKTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzoge1xuICAgICAgICAgICAgbGV0IHJlcyA9IHRva2VuLnN0YXJ0LnNvdXJjZTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0b2tlbi5pdGVtcylcbiAgICAgICAgICAgICAgICByZXMgKz0gc3RyaW5naWZ5SXRlbShpdGVtKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgdG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgIHJlcyArPSBzdC5zb3VyY2U7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2RvY3VtZW50Jzoge1xuICAgICAgICAgICAgbGV0IHJlcyA9IHN0cmluZ2lmeUl0ZW0odG9rZW4pO1xuICAgICAgICAgICAgaWYgKHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICAgICAgcmVzICs9IHN0LnNvdXJjZTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgbGV0IHJlcyA9IHRva2VuLnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgnZW5kJyBpbiB0b2tlbiAmJiB0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiB0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgICAgIHJlcyArPSBzdC5zb3VyY2U7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gc3RyaW5naWZ5SXRlbSh7IHN0YXJ0LCBrZXksIHNlcCwgdmFsdWUgfSkge1xuICAgIGxldCByZXMgPSAnJztcbiAgICBmb3IgKGNvbnN0IHN0IG9mIHN0YXJ0KVxuICAgICAgICByZXMgKz0gc3Quc291cmNlO1xuICAgIGlmIChrZXkpXG4gICAgICAgIHJlcyArPSBzdHJpbmdpZnlUb2tlbihrZXkpO1xuICAgIGlmIChzZXApXG4gICAgICAgIGZvciAoY29uc3Qgc3Qgb2Ygc2VwKVxuICAgICAgICAgICAgcmVzICs9IHN0LnNvdXJjZTtcbiAgICBpZiAodmFsdWUpXG4gICAgICAgIHJlcyArPSBzdHJpbmdpZnlUb2tlbih2YWx1ZSk7XG4gICAgcmV0dXJuIHJlcztcbn1cblxuZXhwb3J0IHsgc3RyaW5naWZ5IH07XG4iLCAiY29uc3QgQlJFQUsgPSBTeW1ib2woJ2JyZWFrIHZpc2l0Jyk7XG5jb25zdCBTS0lQID0gU3ltYm9sKCdza2lwIGNoaWxkcmVuJyk7XG5jb25zdCBSRU1PVkUgPSBTeW1ib2woJ3JlbW92ZSBpdGVtJyk7XG4vKipcbiAqIEFwcGx5IGEgdmlzaXRvciB0byBhIENTVCBkb2N1bWVudCBvciBpdGVtLlxuICpcbiAqIFdhbGtzIHRocm91Z2ggdGhlIHRyZWUgKGRlcHRoLWZpcnN0KSBzdGFydGluZyBmcm9tIHRoZSByb290LCBjYWxsaW5nIGFcbiAqIGB2aXNpdG9yYCBmdW5jdGlvbiB3aXRoIHR3byBhcmd1bWVudHMgd2hlbiBlbnRlcmluZyBlYWNoIGl0ZW06XG4gKiAgIC0gYGl0ZW1gOiBUaGUgY3VycmVudCBpdGVtLCB3aGljaCBpbmNsdWRlZCB0aGUgZm9sbG93aW5nIG1lbWJlcnM6XG4gKiAgICAgLSBgc3RhcnQ6IFNvdXJjZVRva2VuW11gIFx1MjAxMyBTb3VyY2UgdG9rZW5zIGJlZm9yZSB0aGUga2V5IG9yIHZhbHVlLFxuICogICAgICAgcG9zc2libHkgaW5jbHVkaW5nIGl0cyBhbmNob3Igb3IgdGFnLlxuICogICAgIC0gYGtleT86IFRva2VuIHwgbnVsbGAgXHUyMDEzIFNldCBmb3IgcGFpciB2YWx1ZXMuIE1heSB0aGVuIGJlIGBudWxsYCwgaWZcbiAqICAgICAgIHRoZSBrZXkgYmVmb3JlIHRoZSBgOmAgc2VwYXJhdG9yIGlzIGVtcHR5LlxuICogICAgIC0gYHNlcD86IFNvdXJjZVRva2VuW11gIFx1MjAxMyBTb3VyY2UgdG9rZW5zIGJldHdlZW4gdGhlIGtleSBhbmQgdGhlIHZhbHVlLFxuICogICAgICAgd2hpY2ggc2hvdWxkIGluY2x1ZGUgdGhlIGA6YCBtYXAgdmFsdWUgaW5kaWNhdG9yIGlmIGB2YWx1ZWAgaXMgc2V0LlxuICogICAgIC0gYHZhbHVlPzogVG9rZW5gIFx1MjAxMyBUaGUgdmFsdWUgb2YgYSBzZXF1ZW5jZSBpdGVtLCBvciBvZiBhIG1hcCBwYWlyLlxuICogICAtIGBwYXRoYDogVGhlIHN0ZXBzIGZyb20gdGhlIHJvb3QgdG8gdGhlIGN1cnJlbnQgbm9kZSwgYXMgYW4gYXJyYXkgb2ZcbiAqICAgICBgWydrZXknIHwgJ3ZhbHVlJywgbnVtYmVyXWAgdHVwbGVzLlxuICpcbiAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHZpc2l0b3IgbWF5IGJlIHVzZWQgdG8gY29udHJvbCB0aGUgdHJhdmVyc2FsOlxuICogICAtIGB1bmRlZmluZWRgIChkZWZhdWx0KTogRG8gbm90aGluZyBhbmQgY29udGludWVcbiAqICAgLSBgdmlzaXQuU0tJUGA6IERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhpcyB0b2tlbiwgY29udGludWUgd2l0aFxuICogICAgICBuZXh0IHNpYmxpbmdcbiAqICAgLSBgdmlzaXQuQlJFQUtgOiBUZXJtaW5hdGUgdHJhdmVyc2FsIGNvbXBsZXRlbHlcbiAqICAgLSBgdmlzaXQuUkVNT1ZFYDogUmVtb3ZlIHRoZSBjdXJyZW50IGl0ZW0sIHRoZW4gY29udGludWUgd2l0aCB0aGUgbmV4dCBvbmVcbiAqICAgLSBgbnVtYmVyYDogU2V0IHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGVwLiBUaGlzIGlzIHVzZWZ1bCBlc3BlY2lhbGx5IGlmXG4gKiAgICAgdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50IHRva2VuIGhhcyBjaGFuZ2VkLlxuICogICAtIGBmdW5jdGlvbmA6IERlZmluZSB0aGUgbmV4dCB2aXNpdG9yIGZvciB0aGlzIGl0ZW0uIEFmdGVyIHRoZSBvcmlnaW5hbFxuICogICAgIHZpc2l0b3IgaXMgY2FsbGVkIG9uIGl0ZW0gZW50cnksIG5leHQgdmlzaXRvcnMgYXJlIGNhbGxlZCBhZnRlciBoYW5kbGluZ1xuICogICAgIGEgbm9uLWVtcHR5IGBrZXlgIGFuZCB3aGVuIGV4aXRpbmcgdGhlIGl0ZW0uXG4gKi9cbmZ1bmN0aW9uIHZpc2l0KGNzdCwgdmlzaXRvcikge1xuICAgIGlmICgndHlwZScgaW4gY3N0ICYmIGNzdC50eXBlID09PSAnZG9jdW1lbnQnKVxuICAgICAgICBjc3QgPSB7IHN0YXJ0OiBjc3Quc3RhcnQsIHZhbHVlOiBjc3QudmFsdWUgfTtcbiAgICBfdmlzaXQoT2JqZWN0LmZyZWV6ZShbXSksIGNzdCwgdmlzaXRvcik7XG59XG4vLyBXaXRob3V0IHRoZSBgYXMgc3ltYm9sYCBjYXN0cywgVFMgZGVjbGFyZXMgdGhlc2UgaW4gdGhlIGB2aXNpdGBcbi8vIG5hbWVzcGFjZSB1c2luZyBgdmFyYCwgYnV0IHRoZW4gY29tcGxhaW5zIGFib3V0IHRoYXQgYmVjYXVzZVxuLy8gYHVuaXF1ZSBzeW1ib2xgIG11c3QgYmUgYGNvbnN0YC5cbi8qKiBUZXJtaW5hdGUgdmlzaXQgdHJhdmVyc2FsIGNvbXBsZXRlbHkgKi9cbnZpc2l0LkJSRUFLID0gQlJFQUs7XG4vKiogRG8gbm90IHZpc2l0IHRoZSBjaGlsZHJlbiBvZiB0aGUgY3VycmVudCBpdGVtICovXG52aXNpdC5TS0lQID0gU0tJUDtcbi8qKiBSZW1vdmUgdGhlIGN1cnJlbnQgaXRlbSAqL1xudmlzaXQuUkVNT1ZFID0gUkVNT1ZFO1xuLyoqIEZpbmQgdGhlIGl0ZW0gYXQgYHBhdGhgIGZyb20gYGNzdGAgYXMgdGhlIHJvb3QgKi9cbnZpc2l0Lml0ZW1BdFBhdGggPSAoY3N0LCBwYXRoKSA9PiB7XG4gICAgbGV0IGl0ZW0gPSBjc3Q7XG4gICAgZm9yIChjb25zdCBbZmllbGQsIGluZGV4XSBvZiBwYXRoKSB7XG4gICAgICAgIGNvbnN0IHRvayA9IGl0ZW0/LltmaWVsZF07XG4gICAgICAgIGlmICh0b2sgJiYgJ2l0ZW1zJyBpbiB0b2spIHtcbiAgICAgICAgICAgIGl0ZW0gPSB0b2suaXRlbXNbaW5kZXhdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBpdGVtO1xufTtcbi8qKlxuICogR2V0IHRoZSBpbW1lZGlhdGUgcGFyZW50IGNvbGxlY3Rpb24gb2YgdGhlIGl0ZW0gYXQgYHBhdGhgIGZyb20gYGNzdGAgYXMgdGhlIHJvb3QuXG4gKlxuICogVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBjb2xsZWN0aW9uIGlzIG5vdCBmb3VuZCwgd2hpY2ggc2hvdWxkIG5ldmVyIGhhcHBlbiBpZiB0aGUgaXRlbSBpdHNlbGYgZXhpc3RzLlxuICovXG52aXNpdC5wYXJlbnRDb2xsZWN0aW9uID0gKGNzdCwgcGF0aCkgPT4ge1xuICAgIGNvbnN0IHBhcmVudCA9IHZpc2l0Lml0ZW1BdFBhdGgoY3N0LCBwYXRoLnNsaWNlKDAsIC0xKSk7XG4gICAgY29uc3QgZmllbGQgPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV1bMF07XG4gICAgY29uc3QgY29sbCA9IHBhcmVudD8uW2ZpZWxkXTtcbiAgICBpZiAoY29sbCAmJiAnaXRlbXMnIGluIGNvbGwpXG4gICAgICAgIHJldHVybiBjb2xsO1xuICAgIHRocm93IG5ldyBFcnJvcignUGFyZW50IGNvbGxlY3Rpb24gbm90IGZvdW5kJyk7XG59O1xuZnVuY3Rpb24gX3Zpc2l0KHBhdGgsIGl0ZW0sIHZpc2l0b3IpIHtcbiAgICBsZXQgY3RybCA9IHZpc2l0b3IoaXRlbSwgcGF0aCk7XG4gICAgaWYgKHR5cGVvZiBjdHJsID09PSAnc3ltYm9sJylcbiAgICAgICAgcmV0dXJuIGN0cmw7XG4gICAgZm9yIChjb25zdCBmaWVsZCBvZiBbJ2tleScsICd2YWx1ZSddKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gaXRlbVtmaWVsZF07XG4gICAgICAgIGlmICh0b2tlbiAmJiAnaXRlbXMnIGluIHRva2VuKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2VuLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2kgPSBfdmlzaXQoT2JqZWN0LmZyZWV6ZShwYXRoLmNvbmNhdChbW2ZpZWxkLCBpXV0pKSwgdG9rZW4uaXRlbXNbaV0sIHZpc2l0b3IpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2kgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgICAgICBpID0gY2kgLSAxO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBSRU1PVkUpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdHJsID09PSAnZnVuY3Rpb24nICYmIGZpZWxkID09PSAna2V5JylcbiAgICAgICAgICAgICAgICBjdHJsID0gY3RybChpdGVtLCBwYXRoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHlwZW9mIGN0cmwgPT09ICdmdW5jdGlvbicgPyBjdHJsKGl0ZW0sIHBhdGgpIDogY3RybDtcbn1cblxuZXhwb3J0IHsgdmlzaXQgfTtcbiIsICJpbXBvcnQgeyBCT00sIERPQ1VNRU5ULCBGTE9XX0VORCwgU0NBTEFSIH0gZnJvbSAnLi9jc3QuanMnO1xuXG4vKlxuU1RBUlQgLT4gc3RyZWFtXG5cbnN0cmVhbVxuICBkaXJlY3RpdmUgLT4gbGluZS1lbmQgLT4gc3RyZWFtXG4gIGluZGVudCArIGxpbmUtZW5kIC0+IHN0cmVhbVxuICBbZWxzZV0gLT4gbGluZS1zdGFydFxuXG5saW5lLWVuZFxuICBjb21tZW50IC0+IGxpbmUtZW5kXG4gIG5ld2xpbmUgLT4gLlxuICBpbnB1dC1lbmQgLT4gRU5EXG5cbmxpbmUtc3RhcnRcbiAgZG9jLXN0YXJ0IC0+IGRvY1xuICBkb2MtZW5kIC0+IHN0cmVhbVxuICBbZWxzZV0gLT4gaW5kZW50IC0+IGJsb2NrLXN0YXJ0XG5cbmJsb2NrLXN0YXJ0XG4gIHNlcS1pdGVtLXN0YXJ0IC0+IGJsb2NrLXN0YXJ0XG4gIGV4cGxpY2l0LWtleS1zdGFydCAtPiBibG9jay1zdGFydFxuICBtYXAtdmFsdWUtc3RhcnQgLT4gYmxvY2stc3RhcnRcbiAgW2Vsc2VdIC0+IGRvY1xuXG5kb2NcbiAgbGluZS1lbmQgLT4gbGluZS1zdGFydFxuICBzcGFjZXMgLT4gZG9jXG4gIGFuY2hvciAtPiBkb2NcbiAgdGFnIC0+IGRvY1xuICBmbG93LXN0YXJ0IC0+IGZsb3cgLT4gZG9jXG4gIGZsb3ctZW5kIC0+IGVycm9yIC0+IGRvY1xuICBzZXEtaXRlbS1zdGFydCAtPiBlcnJvciAtPiBkb2NcbiAgZXhwbGljaXQta2V5LXN0YXJ0IC0+IGVycm9yIC0+IGRvY1xuICBtYXAtdmFsdWUtc3RhcnQgLT4gZG9jXG4gIGFsaWFzIC0+IGRvY1xuICBxdW90ZS1zdGFydCAtPiBxdW90ZWQtc2NhbGFyIC0+IGRvY1xuICBibG9jay1zY2FsYXItaGVhZGVyIC0+IGxpbmUtZW5kIC0+IGJsb2NrLXNjYWxhcihtaW4pIC0+IGxpbmUtc3RhcnRcbiAgW2Vsc2VdIC0+IHBsYWluLXNjYWxhcihmYWxzZSwgbWluKSAtPiBkb2NcblxuZmxvd1xuICBsaW5lLWVuZCAtPiBmbG93XG4gIHNwYWNlcyAtPiBmbG93XG4gIGFuY2hvciAtPiBmbG93XG4gIHRhZyAtPiBmbG93XG4gIGZsb3ctc3RhcnQgLT4gZmxvdyAtPiBmbG93XG4gIGZsb3ctZW5kIC0+IC5cbiAgc2VxLWl0ZW0tc3RhcnQgLT4gZXJyb3IgLT4gZmxvd1xuICBleHBsaWNpdC1rZXktc3RhcnQgLT4gZmxvd1xuICBtYXAtdmFsdWUtc3RhcnQgLT4gZmxvd1xuICBhbGlhcyAtPiBmbG93XG4gIHF1b3RlLXN0YXJ0IC0+IHF1b3RlZC1zY2FsYXIgLT4gZmxvd1xuICBjb21tYSAtPiBmbG93XG4gIFtlbHNlXSAtPiBwbGFpbi1zY2FsYXIodHJ1ZSwgMCkgLT4gZmxvd1xuXG5xdW90ZWQtc2NhbGFyXG4gIHF1b3RlLWVuZCAtPiAuXG4gIFtlbHNlXSAtPiBxdW90ZWQtc2NhbGFyXG5cbmJsb2NrLXNjYWxhcihtaW4pXG4gIG5ld2xpbmUgKyBwZWVrKGluZGVudCA8IG1pbikgLT4gLlxuICBbZWxzZV0gLT4gYmxvY2stc2NhbGFyKG1pbilcblxucGxhaW4tc2NhbGFyKGlzLWZsb3csIG1pbilcbiAgc2NhbGFyLWVuZChpcy1mbG93KSAtPiAuXG4gIHBlZWsobmV3bGluZSArIChpbmRlbnQgPCBtaW4pKSAtPiAuXG4gIFtlbHNlXSAtPiBwbGFpbi1zY2FsYXIobWluKVxuKi9cbmZ1bmN0aW9uIGlzRW1wdHkoY2gpIHtcbiAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICBjYXNlICcgJzpcbiAgICAgICAgY2FzZSAnXFxuJzpcbiAgICAgICAgY2FzZSAnXFxyJzpcbiAgICAgICAgY2FzZSAnXFx0JzpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmNvbnN0IGhleERpZ2l0cyA9IG5ldyBTZXQoJzAxMjM0NTY3ODlBQkNERUZhYmNkZWYnKTtcbmNvbnN0IHRhZ0NoYXJzID0gbmV3IFNldChcIjAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6LSM7Lz86QCY9KyRfLiF+KicoKVwiKTtcbmNvbnN0IGZsb3dJbmRpY2F0b3JDaGFycyA9IG5ldyBTZXQoJyxbXXt9Jyk7XG5jb25zdCBpbnZhbGlkQW5jaG9yQ2hhcnMgPSBuZXcgU2V0KCcgLFtde31cXG5cXHJcXHQnKTtcbmNvbnN0IGlzTm90QW5jaG9yQ2hhciA9IChjaCkgPT4gIWNoIHx8IGludmFsaWRBbmNob3JDaGFycy5oYXMoY2gpO1xuLyoqXG4gKiBTcGxpdHMgYW4gaW5wdXQgc3RyaW5nIGludG8gbGV4aWNhbCB0b2tlbnMsIGkuZS4gc21hbGxlciBzdHJpbmdzIHRoYXQgYXJlXG4gKiBlYXNpbHkgaWRlbnRpZmlhYmxlIGJ5IGB0b2tlbnMudG9rZW5UeXBlKClgLlxuICpcbiAqIExleGluZyBzdGFydHMgYWx3YXlzIGluIGEgXCJzdHJlYW1cIiBjb250ZXh0LiBJbmNvbXBsZXRlIGlucHV0IG1heSBiZSBidWZmZXJlZFxuICogdW50aWwgYSBjb21wbGV0ZSB0b2tlbiBjYW4gYmUgZW1pdHRlZC5cbiAqXG4gKiBJbiBhZGRpdGlvbiB0byBzbGljZXMgb2YgdGhlIG9yaWdpbmFsIGlucHV0LCB0aGUgZm9sbG93aW5nIGNvbnRyb2wgY2hhcmFjdGVyc1xuICogbWF5IGFsc28gYmUgZW1pdHRlZDpcbiAqXG4gKiAtIGBcXHgwMmAgKFN0YXJ0IG9mIFRleHQpOiBBIGRvY3VtZW50IHN0YXJ0cyB3aXRoIHRoZSBuZXh0IHRva2VuXG4gKiAtIGBcXHgxOGAgKENhbmNlbCk6IFVuZXhwZWN0ZWQgZW5kIG9mIGZsb3ctbW9kZSAoaW5kaWNhdGVzIGFuIGVycm9yKVxuICogLSBgXFx4MWZgIChVbml0IFNlcGFyYXRvcik6IE5leHQgdG9rZW4gaXMgYSBzY2FsYXIgdmFsdWVcbiAqIC0gYFxcdXtGRUZGfWAgKEJ5dGUgb3JkZXIgbWFyayk6IEVtaXR0ZWQgc2VwYXJhdGVseSBvdXRzaWRlIGRvY3VtZW50c1xuICovXG5jbGFzcyBMZXhlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGbGFnIGluZGljYXRpbmcgd2hldGhlciB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IGJ1ZmZlciBtYXJrcyB0aGUgZW5kIG9mXG4gICAgICAgICAqIGFsbCBpbnB1dFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hdEVuZCA9IGZhbHNlO1xuICAgICAgICAvKipcbiAgICAgICAgICogRXhwbGljaXQgaW5kZW50IHNldCBpbiBibG9jayBzY2FsYXIgaGVhZGVyLCBhcyBhbiBvZmZzZXQgZnJvbSB0aGUgY3VycmVudFxuICAgICAgICAgKiBtaW5pbXVtIGluZGVudCwgc28gZS5nLiBzZXQgdG8gMSBmcm9tIGEgaGVhZGVyIGB8MitgLiBTZXQgdG8gLTEgaWYgbm90XG4gICAgICAgICAqIGV4cGxpY2l0bHkgc2V0LlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCA9IC0xO1xuICAgICAgICAvKipcbiAgICAgICAgICogQmxvY2sgc2NhbGFycyB0aGF0IGluY2x1ZGUgYSArIChrZWVwKSBjaG9tcGluZyBpbmRpY2F0b3IgaW4gdGhlaXIgaGVhZGVyXG4gICAgICAgICAqIGluY2x1ZGUgdHJhaWxpbmcgZW1wdHkgbGluZXMsIHdoaWNoIGFyZSBvdGhlcndpc2UgZXhjbHVkZWQgZnJvbSB0aGVcbiAgICAgICAgICogc2NhbGFyJ3MgY29udGVudHMuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmJsb2NrU2NhbGFyS2VlcCA9IGZhbHNlO1xuICAgICAgICAvKiogQ3VycmVudCBpbnB1dCAqL1xuICAgICAgICB0aGlzLmJ1ZmZlciA9ICcnO1xuICAgICAgICAvKipcbiAgICAgICAgICogRmxhZyBub3Rpbmcgd2hldGhlciB0aGUgbWFwIHZhbHVlIGluZGljYXRvciA6IGNhbiBpbW1lZGlhdGVseSBmb2xsb3cgdGhpc1xuICAgICAgICAgKiBub2RlIHdpdGhpbiBhIGZsb3cgY29udGV4dC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAvKiogQ291bnQgb2Ygc3Vycm91bmRpbmcgZmxvdyBjb2xsZWN0aW9uIGxldmVscy4gKi9cbiAgICAgICAgdGhpcy5mbG93TGV2ZWwgPSAwO1xuICAgICAgICAvKipcbiAgICAgICAgICogTWluaW11bSBsZXZlbCBvZiBpbmRlbnRhdGlvbiByZXF1aXJlZCBmb3IgbmV4dCBsaW5lcyB0byBiZSBwYXJzZWQgYXMgYVxuICAgICAgICAgKiBwYXJ0IG9mIHRoZSBjdXJyZW50IHNjYWxhciB2YWx1ZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IDA7XG4gICAgICAgIC8qKiBJbmRlbnRhdGlvbiBsZXZlbCBvZiB0aGUgY3VycmVudCBsaW5lLiAqL1xuICAgICAgICB0aGlzLmluZGVudFZhbHVlID0gMDtcbiAgICAgICAgLyoqIFBvc2l0aW9uIG9mIHRoZSBuZXh0IFxcbiBjaGFyYWN0ZXIuICovXG4gICAgICAgIHRoaXMubGluZUVuZFBvcyA9IG51bGw7XG4gICAgICAgIC8qKiBTdG9yZXMgdGhlIHN0YXRlIG9mIHRoZSBsZXhlciBpZiByZWFjaGluZyB0aGUgZW5kIG9mIGluY3BvbXBsZXRlIGlucHV0ICovXG4gICAgICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgICAgIC8qKiBBIHBvaW50ZXIgdG8gYGJ1ZmZlcmA7IHRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBsZXhlci4gKi9cbiAgICAgICAgdGhpcy5wb3MgPSAwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBZQU1MIHRva2VucyBmcm9tIHRoZSBgc291cmNlYCBzdHJpbmcuIElmIGBpbmNvbXBsZXRlYCxcbiAgICAgKiBhIHBhcnQgb2YgdGhlIGxhc3QgbGluZSBtYXkgYmUgbGVmdCBhcyBhIGJ1ZmZlciBmb3IgdGhlIG5leHQgY2FsbC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgZ2VuZXJhdG9yIG9mIGxleGljYWwgdG9rZW5zXG4gICAgICovXG4gICAgKmxleChzb3VyY2UsIGluY29tcGxldGUgPSBmYWxzZSkge1xuICAgICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNvdXJjZSAhPT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdzb3VyY2UgaXMgbm90IGEgc3RyaW5nJyk7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuYnVmZmVyID8gdGhpcy5idWZmZXIgKyBzb3VyY2UgOiBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLmxpbmVFbmRQb3MgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXRFbmQgPSAhaW5jb21wbGV0ZTtcbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLm5leHQgPz8gJ3N0cmVhbSc7XG4gICAgICAgIHdoaWxlIChuZXh0ICYmIChpbmNvbXBsZXRlIHx8IHRoaXMuaGFzQ2hhcnMoMSkpKVxuICAgICAgICAgICAgbmV4dCA9IHlpZWxkKiB0aGlzLnBhcnNlTmV4dChuZXh0KTtcbiAgICB9XG4gICAgYXRMaW5lRW5kKCkge1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zO1xuICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgd2hpbGUgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKVxuICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICBpZiAoIWNoIHx8IGNoID09PSAnIycgfHwgY2ggPT09ICdcXG4nKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmIChjaCA9PT0gJ1xccicpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5idWZmZXJbaSArIDFdID09PSAnXFxuJztcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjaGFyQXQobikge1xuICAgICAgICByZXR1cm4gdGhpcy5idWZmZXJbdGhpcy5wb3MgKyBuXTtcbiAgICB9XG4gICAgY29udGludWVTY2FsYXIob2Zmc2V0KSB7XG4gICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW29mZnNldF07XG4gICAgICAgIGlmICh0aGlzLmluZGVudE5leHQgPiAwKSB7XG4gICAgICAgICAgICBsZXQgaW5kZW50ID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChjaCA9PT0gJyAnKVxuICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpbmRlbnQgKyBvZmZzZXRdO1xuICAgICAgICAgICAgaWYgKGNoID09PSAnXFxyJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmJ1ZmZlcltpbmRlbnQgKyBvZmZzZXQgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gJ1xcbicgfHwgKCFuZXh0ICYmICF0aGlzLmF0RW5kKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldCArIGluZGVudCArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2ggPT09ICdcXG4nIHx8IGluZGVudCA+PSB0aGlzLmluZGVudE5leHQgfHwgKCFjaCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgICAgICA/IG9mZnNldCArIGluZGVudFxuICAgICAgICAgICAgICAgIDogLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnLScgfHwgY2ggPT09ICcuJykge1xuICAgICAgICAgICAgY29uc3QgZHQgPSB0aGlzLmJ1ZmZlci5zdWJzdHIob2Zmc2V0LCAzKTtcbiAgICAgICAgICAgIGlmICgoZHQgPT09ICctLS0nIHx8IGR0ID09PSAnLi4uJykgJiYgaXNFbXB0eSh0aGlzLmJ1ZmZlcltvZmZzZXQgKyAzXSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvZmZzZXQ7XG4gICAgfVxuICAgIGdldExpbmUoKSB7XG4gICAgICAgIGxldCBlbmQgPSB0aGlzLmxpbmVFbmRQb3M7XG4gICAgICAgIGlmICh0eXBlb2YgZW5kICE9PSAnbnVtYmVyJyB8fCAoZW5kICE9PSAtMSAmJiBlbmQgPCB0aGlzLnBvcykpIHtcbiAgICAgICAgICAgIGVuZCA9IHRoaXMuYnVmZmVyLmluZGV4T2YoJ1xcbicsIHRoaXMucG9zKTtcbiAgICAgICAgICAgIHRoaXMubGluZUVuZFBvcyA9IGVuZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5kID09PSAtMSlcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0RW5kID8gdGhpcy5idWZmZXIuc3Vic3RyaW5nKHRoaXMucG9zKSA6IG51bGw7XG4gICAgICAgIGlmICh0aGlzLmJ1ZmZlcltlbmQgLSAxXSA9PT0gJ1xccicpXG4gICAgICAgICAgICBlbmQgLT0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyLnN1YnN0cmluZyh0aGlzLnBvcywgZW5kKTtcbiAgICB9XG4gICAgaGFzQ2hhcnMobikge1xuICAgICAgICByZXR1cm4gdGhpcy5wb3MgKyBuIDw9IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICB9XG4gICAgc2V0TmV4dChzdGF0ZSkge1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuYnVmZmVyLnN1YnN0cmluZyh0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zID0gMDtcbiAgICAgICAgdGhpcy5saW5lRW5kUG9zID0gbnVsbDtcbiAgICAgICAgdGhpcy5uZXh0ID0gc3RhdGU7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBwZWVrKG4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyLnN1YnN0cih0aGlzLnBvcywgbik7XG4gICAgfVxuICAgICpwYXJzZU5leHQobmV4dCkge1xuICAgICAgICBzd2l0Y2ggKG5leHQpIHtcbiAgICAgICAgICAgIGNhc2UgJ3N0cmVhbSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlU3RyZWFtKCk7XG4gICAgICAgICAgICBjYXNlICdsaW5lLXN0YXJ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXN0YXJ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1N0YXJ0KCk7XG4gICAgICAgICAgICBjYXNlICdkb2MnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZURvY3VtZW50KCk7XG4gICAgICAgICAgICBjYXNlICdmbG93JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VGbG93Q29sbGVjdGlvbigpO1xuICAgICAgICAgICAgY2FzZSAncXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUXVvdGVkU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICdwbGFpbi1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVBsYWluU2NhbGFyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnBhcnNlU3RyZWFtKCkge1xuICAgICAgICBsZXQgbGluZSA9IHRoaXMuZ2V0TGluZSgpO1xuICAgICAgICBpZiAobGluZSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ3N0cmVhbScpO1xuICAgICAgICBpZiAobGluZVswXSA9PT0gQk9NKSB7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICBsaW5lID0gbGluZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpbmVbMF0gPT09ICclJykge1xuICAgICAgICAgICAgbGV0IGRpckVuZCA9IGxpbmUubGVuZ3RoO1xuICAgICAgICAgICAgbGV0IGNzID0gbGluZS5pbmRleE9mKCcjJyk7XG4gICAgICAgICAgICB3aGlsZSAoY3MgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2ggPSBsaW5lW2NzIC0gMV07XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpckVuZCA9IGNzIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjcyA9IGxpbmUuaW5kZXhPZignIycsIGNzICsgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaCA9IGxpbmVbZGlyRW5kIC0gMV07XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKVxuICAgICAgICAgICAgICAgICAgICBkaXJFbmQgLT0gMTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbiA9ICh5aWVsZCogdGhpcy5wdXNoQ291bnQoZGlyRW5kKSkgKyAoeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKSk7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBuKTsgLy8gcG9zc2libGUgY29tbWVudFxuICAgICAgICAgICAgdGhpcy5wdXNoTmV3bGluZSgpO1xuICAgICAgICAgICAgcmV0dXJuICdzdHJlYW0nO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmF0TGluZUVuZCgpKSB7XG4gICAgICAgICAgICBjb25zdCBzcCA9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBzcCk7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoTmV3bGluZSgpO1xuICAgICAgICAgICAgcmV0dXJuICdzdHJlYW0nO1xuICAgICAgICB9XG4gICAgICAgIHlpZWxkIERPQ1VNRU5UO1xuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICB9XG4gICAgKnBhcnNlTGluZVN0YXJ0KCkge1xuICAgICAgICBjb25zdCBjaCA9IHRoaXMuY2hhckF0KDApO1xuICAgICAgICBpZiAoIWNoICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnbGluZS1zdGFydCcpO1xuICAgICAgICBpZiAoY2ggPT09ICctJyB8fCBjaCA9PT0gJy4nKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYXRFbmQgJiYgIXRoaXMuaGFzQ2hhcnMoNCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnbGluZS1zdGFydCcpO1xuICAgICAgICAgICAgY29uc3QgcyA9IHRoaXMucGVlaygzKTtcbiAgICAgICAgICAgIGlmICgocyA9PT0gJy0tLScgfHwgcyA9PT0gJy4uLicpICYmIGlzRW1wdHkodGhpcy5jaGFyQXQoMykpKSB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDMpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50VmFsdWUgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHMgPT09ICctLS0nID8gJ2RvYycgOiAnc3RyZWFtJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluZGVudFZhbHVlID0geWllbGQqIHRoaXMucHVzaFNwYWNlcyhmYWxzZSk7XG4gICAgICAgIGlmICh0aGlzLmluZGVudE5leHQgPiB0aGlzLmluZGVudFZhbHVlICYmICFpc0VtcHR5KHRoaXMuY2hhckF0KDEpKSlcbiAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IHRoaXMuaW5kZW50VmFsdWU7XG4gICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU3RhcnQoKTtcbiAgICB9XG4gICAgKnBhcnNlQmxvY2tTdGFydCgpIHtcbiAgICAgICAgY29uc3QgW2NoMCwgY2gxXSA9IHRoaXMucGVlaygyKTtcbiAgICAgICAgaWYgKCFjaDEgJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdibG9jay1zdGFydCcpO1xuICAgICAgICBpZiAoKGNoMCA9PT0gJy0nIHx8IGNoMCA9PT0gJz8nIHx8IGNoMCA9PT0gJzonKSAmJiBpc0VtcHR5KGNoMSkpIHtcbiAgICAgICAgICAgIGNvbnN0IG4gPSAoeWllbGQqIHRoaXMucHVzaENvdW50KDEpKSArICh5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpKTtcbiAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IHRoaXMuaW5kZW50VmFsdWUgKyAxO1xuICAgICAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSArPSBuO1xuICAgICAgICAgICAgcmV0dXJuICdibG9jay1zdGFydCc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICdkb2MnO1xuICAgIH1cbiAgICAqcGFyc2VEb2N1bWVudCgpIHtcbiAgICAgICAgeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgY29uc3QgbGluZSA9IHRoaXMuZ2V0TGluZSgpO1xuICAgICAgICBpZiAobGluZSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2RvYycpO1xuICAgICAgICBsZXQgbiA9IHlpZWxkKiB0aGlzLnB1c2hJbmRpY2F0b3JzKCk7XG4gICAgICAgIHN3aXRjaCAobGluZVtuXSkge1xuICAgICAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gbik7XG4gICAgICAgICAgICAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICAgICAgICAgIGNhc2UgJ3snOlxuICAgICAgICAgICAgY2FzZSAnWyc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0xldmVsID0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAnfSc6XG4gICAgICAgICAgICBjYXNlICddJzpcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGFuIGVycm9yXG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZG9jJztcbiAgICAgICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hVbnRpbChpc05vdEFuY2hvckNoYXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZG9jJztcbiAgICAgICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUXVvdGVkU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgICAgIG4gKz0geWllbGQqIHRoaXMucGFyc2VCbG9ja1NjYWxhckhlYWRlcigpO1xuICAgICAgICAgICAgICAgIG4gKz0geWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBuKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoTmV3bGluZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU2NhbGFyKCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVBsYWluU2NhbGFyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnBhcnNlRmxvd0NvbGxlY3Rpb24oKSB7XG4gICAgICAgIGxldCBubCwgc3A7XG4gICAgICAgIGxldCBpbmRlbnQgPSAtMTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgbmwgPSB5aWVsZCogdGhpcy5wdXNoTmV3bGluZSgpO1xuICAgICAgICAgICAgaWYgKG5sID4gMCkge1xuICAgICAgICAgICAgICAgIHNwID0geWllbGQqIHRoaXMucHVzaFNwYWNlcyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSA9IGluZGVudCA9IHNwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc3AgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3AgKz0geWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgfSB3aGlsZSAobmwgKyBzcCA+IDApO1xuICAgICAgICBjb25zdCBsaW5lID0gdGhpcy5nZXRMaW5lKCk7XG4gICAgICAgIGlmIChsaW5lID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnZmxvdycpO1xuICAgICAgICBpZiAoKGluZGVudCAhPT0gLTEgJiYgaW5kZW50IDwgdGhpcy5pbmRlbnROZXh0ICYmIGxpbmVbMF0gIT09ICcjJykgfHxcbiAgICAgICAgICAgIChpbmRlbnQgPT09IDAgJiZcbiAgICAgICAgICAgICAgICAobGluZS5zdGFydHNXaXRoKCctLS0nKSB8fCBsaW5lLnN0YXJ0c1dpdGgoJy4uLicpKSAmJlxuICAgICAgICAgICAgICAgIGlzRW1wdHkobGluZVszXSkpKSB7XG4gICAgICAgICAgICAvLyBBbGxvd2luZyBmb3IgdGhlIHRlcm1pbmFsIF0gb3IgfSBhdCB0aGUgc2FtZSAocmF0aGVyIHRoYW4gZ3JlYXRlcilcbiAgICAgICAgICAgIC8vIGluZGVudCBsZXZlbCBhcyB0aGUgaW5pdGlhbCBbIG9yIHsgaXMgdGVjaG5pY2FsbHkgaW52YWxpZCwgYnV0XG4gICAgICAgICAgICAvLyBmYWlsaW5nIGhlcmUgd291bGQgYmUgc3VycHJpc2luZyB0byB1c2Vycy5cbiAgICAgICAgICAgIGNvbnN0IGF0Rmxvd0VuZE1hcmtlciA9IGluZGVudCA9PT0gdGhpcy5pbmRlbnROZXh0IC0gMSAmJlxuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0xldmVsID09PSAxICYmXG4gICAgICAgICAgICAgICAgKGxpbmVbMF0gPT09ICddJyB8fCBsaW5lWzBdID09PSAnfScpO1xuICAgICAgICAgICAgaWYgKCFhdEZsb3dFbmRNYXJrZXIpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGFuIGVycm9yXG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgPSAwO1xuICAgICAgICAgICAgICAgIHlpZWxkIEZMT1dfRU5EO1xuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUxpbmVTdGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxldCBuID0gMDtcbiAgICAgICAgd2hpbGUgKGxpbmVbbl0gPT09ICcsJykge1xuICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnB1c2hJbmRpY2F0b3JzKCk7XG4gICAgICAgIHN3aXRjaCAobGluZVtuXSkge1xuICAgICAgICAgICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgIGNhc2UgJyMnOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudChsaW5lLmxlbmd0aCAtIG4pO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICBjYXNlICd7JzpcbiAgICAgICAgICAgIGNhc2UgJ1snOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dMZXZlbCArPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICBjYXNlICd9JzpcbiAgICAgICAgICAgIGNhc2UgJ10nOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0xldmVsIC09IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmxvd0xldmVsID8gJ2Zsb3cnIDogJ2RvYyc7XG4gICAgICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoVW50aWwoaXNOb3RBbmNob3JDaGFyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgY2FzZSBcIidcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVF1b3RlZFNjYWxhcigpO1xuICAgICAgICAgICAgY2FzZSAnOic6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5jaGFyQXQoMSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmxvd0tleSB8fCBpc0VtcHR5KG5leHQpIHx8IG5leHQgPT09ICcsJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVBsYWluU2NhbGFyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnBhcnNlUXVvdGVkU2NhbGFyKCkge1xuICAgICAgICBjb25zdCBxdW90ZSA9IHRoaXMuY2hhckF0KDApO1xuICAgICAgICBsZXQgZW5kID0gdGhpcy5idWZmZXIuaW5kZXhPZihxdW90ZSwgdGhpcy5wb3MgKyAxKTtcbiAgICAgICAgaWYgKHF1b3RlID09PSBcIidcIikge1xuICAgICAgICAgICAgd2hpbGUgKGVuZCAhPT0gLTEgJiYgdGhpcy5idWZmZXJbZW5kICsgMV0gPT09IFwiJ1wiKVxuICAgICAgICAgICAgICAgIGVuZCA9IHRoaXMuYnVmZmVyLmluZGV4T2YoXCInXCIsIGVuZCArIDIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gZG91YmxlLXF1b3RlXG4gICAgICAgICAgICB3aGlsZSAoZW5kICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGxldCBuID0gMDtcbiAgICAgICAgICAgICAgICB3aGlsZSAodGhpcy5idWZmZXJbZW5kIC0gMSAtIG5dID09PSAnXFxcXCcpXG4gICAgICAgICAgICAgICAgICAgIG4gKz0gMTtcbiAgICAgICAgICAgICAgICBpZiAobiAlIDIgPT09IDApXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGVuZCA9IHRoaXMuYnVmZmVyLmluZGV4T2YoJ1wiJywgZW5kICsgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gT25seSBsb29raW5nIGZvciBuZXdsaW5lcyB3aXRoaW4gdGhlIHF1b3Rlc1xuICAgICAgICBjb25zdCBxYiA9IHRoaXMuYnVmZmVyLnN1YnN0cmluZygwLCBlbmQpO1xuICAgICAgICBsZXQgbmwgPSBxYi5pbmRleE9mKCdcXG4nLCB0aGlzLnBvcyk7XG4gICAgICAgIGlmIChubCAhPT0gLTEpIHtcbiAgICAgICAgICAgIHdoaWxlIChubCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcyA9IHRoaXMuY29udGludWVTY2FsYXIobmwgKyAxKTtcbiAgICAgICAgICAgICAgICBpZiAoY3MgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBubCA9IHFiLmluZGV4T2YoJ1xcbicsIGNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChubCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGFuIGVycm9yIGNhdXNlZCBieSBhbiB1bmV4cGVjdGVkIHVuaW5kZW50XG4gICAgICAgICAgICAgICAgZW5kID0gbmwgLSAocWJbbmwgLSAxXSA9PT0gJ1xccicgPyAyIDogMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVuZCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5hdEVuZClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdxdW90ZWQtc2NhbGFyJyk7XG4gICAgICAgICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQqIHRoaXMucHVzaFRvSW5kZXgoZW5kICsgMSwgZmFsc2UpO1xuICAgICAgICByZXR1cm4gdGhpcy5mbG93TGV2ZWwgPyAnZmxvdycgOiAnZG9jJztcbiAgICB9XG4gICAgKnBhcnNlQmxvY2tTY2FsYXJIZWFkZXIoKSB7XG4gICAgICAgIHRoaXMuYmxvY2tTY2FsYXJJbmRlbnQgPSAtMTtcbiAgICAgICAgdGhpcy5ibG9ja1NjYWxhcktlZXAgPSBmYWxzZTtcbiAgICAgICAgbGV0IGkgPSB0aGlzLnBvcztcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgICAgIGlmIChjaCA9PT0gJysnKVxuICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tTY2FsYXJLZWVwID0gdHJ1ZTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGNoID4gJzAnICYmIGNoIDw9ICc5JylcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2NrU2NhbGFySW5kZW50ID0gTnVtYmVyKGNoKSAtIDE7XG4gICAgICAgICAgICBlbHNlIGlmIChjaCAhPT0gJy0nKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoVW50aWwoY2ggPT4gaXNFbXB0eShjaCkgfHwgY2ggPT09ICcjJyk7XG4gICAgfVxuICAgICpwYXJzZUJsb2NrU2NhbGFyKCkge1xuICAgICAgICBsZXQgbmwgPSB0aGlzLnBvcyAtIDE7IC8vIG1heSBiZSAtMSBpZiB0aGlzLnBvcyA9PT0gMFxuICAgICAgICBsZXQgaW5kZW50ID0gMDtcbiAgICAgICAgbGV0IGNoO1xuICAgICAgICBsb29wOiBmb3IgKGxldCBpID0gdGhpcy5wb3M7IChjaCA9IHRoaXMuYnVmZmVyW2ldKTsgKytpKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnICc6XG4gICAgICAgICAgICAgICAgICAgIGluZGVudCArPSAxO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdcXG4nOlxuICAgICAgICAgICAgICAgICAgICBubCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIGluZGVudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1xccic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuYnVmZmVyW2kgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFuZXh0ICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnYmxvY2stc2NhbGFyJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0ID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH0gLy8gZmFsbHRocm91Z2hcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBicmVhayBsb29wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghY2ggJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdibG9jay1zY2FsYXInKTtcbiAgICAgICAgaWYgKGluZGVudCA+PSB0aGlzLmluZGVudE5leHQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJsb2NrU2NhbGFySW5kZW50ID09PSAtMSlcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPSBpbmRlbnQ7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJsb2NrU2NhbGFySW5kZW50ICsgKHRoaXMuaW5kZW50TmV4dCA9PT0gMCA/IDEgOiB0aGlzLmluZGVudE5leHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNzID0gdGhpcy5jb250aW51ZVNjYWxhcihubCArIDEpO1xuICAgICAgICAgICAgICAgIGlmIChjcyA9PT0gLTEpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIG5sID0gdGhpcy5idWZmZXIuaW5kZXhPZignXFxuJywgY3MpO1xuICAgICAgICAgICAgfSB3aGlsZSAobmwgIT09IC0xKTtcbiAgICAgICAgICAgIGlmIChubCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2Jsb2NrLXNjYWxhcicpO1xuICAgICAgICAgICAgICAgIG5sID0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRyYWlsaW5nIGluc3VmZmljaWVudGx5IGluZGVudGVkIHRhYnMgYXJlIGludmFsaWQuXG4gICAgICAgIC8vIFRvIGNhdGNoIHRoYXQgZHVyaW5nIHBhcnNpbmcsIHdlIGluY2x1ZGUgdGhlbSBpbiB0aGUgYmxvY2sgc2NhbGFyIHZhbHVlLlxuICAgICAgICBsZXQgaSA9IG5sICsgMTtcbiAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgd2hpbGUgKGNoID09PSAnICcpXG4gICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgIGlmIChjaCA9PT0gJ1xcdCcpIHtcbiAgICAgICAgICAgIHdoaWxlIChjaCA9PT0gJ1xcdCcgfHwgY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xccicgfHwgY2ggPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgICAgIG5sID0gaSAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIXRoaXMuYmxvY2tTY2FsYXJLZWVwKSB7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgbGV0IGkgPSBubCAtIDE7XG4gICAgICAgICAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnXFxyJylcbiAgICAgICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclstLWldO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RDaGFyID0gaTsgLy8gRHJvcCB0aGUgbGluZSBpZiBsYXN0IGNoYXIgbm90IG1vcmUgaW5kZW50ZWRcbiAgICAgICAgICAgICAgICB3aGlsZSAoY2ggPT09ICcgJylcbiAgICAgICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclstLWldO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xcbicgJiYgaSA+PSB0aGlzLnBvcyAmJiBpICsgMSArIGluZGVudCA+IGxhc3RDaGFyKVxuICAgICAgICAgICAgICAgICAgICBubCA9IGk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gd2hpbGUgKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHlpZWxkIFNDQUxBUjtcbiAgICAgICAgeWllbGQqIHRoaXMucHVzaFRvSW5kZXgobmwgKyAxLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlTGluZVN0YXJ0KCk7XG4gICAgfVxuICAgICpwYXJzZVBsYWluU2NhbGFyKCkge1xuICAgICAgICBjb25zdCBpbkZsb3cgPSB0aGlzLmZsb3dMZXZlbCA+IDA7XG4gICAgICAgIGxldCBlbmQgPSB0aGlzLnBvcyAtIDE7XG4gICAgICAgIGxldCBpID0gdGhpcy5wb3MgLSAxO1xuICAgICAgICBsZXQgY2g7XG4gICAgICAgIHdoaWxlICgoY2ggPSB0aGlzLmJ1ZmZlclsrK2ldKSkge1xuICAgICAgICAgICAgaWYgKGNoID09PSAnOicpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5idWZmZXJbaSArIDFdO1xuICAgICAgICAgICAgICAgIGlmIChpc0VtcHR5KG5leHQpIHx8IChpbkZsb3cgJiYgZmxvd0luZGljYXRvckNoYXJzLmhhcyhuZXh0KSkpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0VtcHR5KGNoKSkge1xuICAgICAgICAgICAgICAgIGxldCBuZXh0ID0gdGhpcy5idWZmZXJbaSArIDFdO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xccicpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQgPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaCA9ICdcXG4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMuYnVmZmVyW2kgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gJyMnIHx8IChpbkZsb3cgJiYgZmxvd0luZGljYXRvckNoYXJzLmhhcyhuZXh0KSkpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY3MgPSB0aGlzLmNvbnRpbnVlU2NhbGFyKGkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNzID09PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBpID0gTWF0aC5tYXgoaSwgY3MgLSAyKTsgLy8gdG8gYWR2YW5jZSwgYnV0IHN0aWxsIGFjY291bnQgZm9yICcgIydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5GbG93ICYmIGZsb3dJbmRpY2F0b3JDaGFycy5oYXMoY2gpKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghY2ggJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdwbGFpbi1zY2FsYXInKTtcbiAgICAgICAgeWllbGQgU0NBTEFSO1xuICAgICAgICB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChlbmQgKyAxLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGluRmxvdyA/ICdmbG93JyA6ICdkb2MnO1xuICAgIH1cbiAgICAqcHVzaENvdW50KG4pIHtcbiAgICAgICAgaWYgKG4gPiAwKSB7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLmJ1ZmZlci5zdWJzdHIodGhpcy5wb3MsIG4pO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gbjtcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICAqcHVzaFRvSW5kZXgoaSwgYWxsb3dFbXB0eSkge1xuICAgICAgICBjb25zdCBzID0gdGhpcy5idWZmZXIuc2xpY2UodGhpcy5wb3MsIGkpO1xuICAgICAgICBpZiAocykge1xuICAgICAgICAgICAgeWllbGQgcztcbiAgICAgICAgICAgIHRoaXMucG9zICs9IHMubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIHMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFsbG93RW1wdHkpXG4gICAgICAgICAgICB5aWVsZCAnJztcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgICpwdXNoSW5kaWNhdG9ycygpIHtcbiAgICAgICAgbGV0IG4gPSAwO1xuICAgICAgICBsb29wOiB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLmNoYXJBdCgwKSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJyEnOlxuICAgICAgICAgICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnB1c2hUYWcoKTtcbiAgICAgICAgICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZSBsb29wO1xuICAgICAgICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnB1c2hVbnRpbChpc05vdEFuY2hvckNoYXIpO1xuICAgICAgICAgICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlIGxvb3A7XG4gICAgICAgICAgICAgICAgY2FzZSAnLSc6IC8vIHRoaXMgaXMgYW4gZXJyb3JcbiAgICAgICAgICAgICAgICBjYXNlICc/JzogLy8gdGhpcyBpcyBhbiBlcnJvciBvdXRzaWRlIGZsb3cgY29sbGVjdGlvbnNcbiAgICAgICAgICAgICAgICBjYXNlICc6Jzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbkZsb3cgPSB0aGlzLmZsb3dMZXZlbCA+IDA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoMSA9IHRoaXMuY2hhckF0KDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNFbXB0eShjaDEpIHx8IChpbkZsb3cgJiYgZmxvd0luZGljYXRvckNoYXJzLmhhcyhjaDEpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpbkZsb3cpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gdGhpcy5pbmRlbnRWYWx1ZSArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmZsb3dLZXkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG4gKz0geWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlIGxvb3A7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhayBsb29wO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cbiAgICAqcHVzaFRhZygpIHtcbiAgICAgICAgaWYgKHRoaXMuY2hhckF0KDEpID09PSAnPCcpIHtcbiAgICAgICAgICAgIGxldCBpID0gdGhpcy5wb3MgKyAyO1xuICAgICAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgICAgICB3aGlsZSAoIWlzRW1wdHkoY2gpICYmIGNoICE9PSAnPicpXG4gICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGNoID09PSAnPicgPyBpICsgMSA6IGksIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBpID0gdGhpcy5wb3MgKyAxO1xuICAgICAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgICAgICB3aGlsZSAoY2gpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFnQ2hhcnMuaGFzKGNoKSlcbiAgICAgICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoID09PSAnJScgJiZcbiAgICAgICAgICAgICAgICAgICAgaGV4RGlnaXRzLmhhcyh0aGlzLmJ1ZmZlcltpICsgMV0pICYmXG4gICAgICAgICAgICAgICAgICAgIGhleERpZ2l0cy5oYXModGhpcy5idWZmZXJbaSArIDJdKSkge1xuICAgICAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWyhpICs9IDMpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChpLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnB1c2hOZXdsaW5lKCkge1xuICAgICAgICBjb25zdCBjaCA9IHRoaXMuYnVmZmVyW3RoaXMucG9zXTtcbiAgICAgICAgaWYgKGNoID09PSAnXFxuJylcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgIGVsc2UgaWYgKGNoID09PSAnXFxyJyAmJiB0aGlzLmNoYXJBdCgxKSA9PT0gJ1xcbicpXG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaENvdW50KDIpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgKnB1c2hTcGFjZXMoYWxsb3dUYWJzKSB7XG4gICAgICAgIGxldCBpID0gdGhpcy5wb3MgLSAxO1xuICAgICAgICBsZXQgY2g7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgfSB3aGlsZSAoY2ggPT09ICcgJyB8fCAoYWxsb3dUYWJzICYmIGNoID09PSAnXFx0JykpO1xuICAgICAgICBjb25zdCBuID0gaSAtIHRoaXMucG9zO1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICAgIHlpZWxkIHRoaXMuYnVmZmVyLnN1YnN0cih0aGlzLnBvcywgbik7XG4gICAgICAgICAgICB0aGlzLnBvcyA9IGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG47XG4gICAgfVxuICAgICpwdXNoVW50aWwodGVzdCkge1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zO1xuICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgd2hpbGUgKCF0ZXN0KGNoKSlcbiAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGksIGZhbHNlKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IExleGVyIH07XG4iLCAiLyoqXG4gKiBUcmFja3MgbmV3bGluZXMgZHVyaW5nIHBhcnNpbmcgaW4gb3JkZXIgdG8gcHJvdmlkZSBhbiBlZmZpY2llbnQgQVBJIGZvclxuICogZGV0ZXJtaW5pbmcgdGhlIG9uZS1pbmRleGVkIGB7IGxpbmUsIGNvbCB9YCBwb3NpdGlvbiBmb3IgYW55IG9mZnNldFxuICogd2l0aGluIHRoZSBpbnB1dC5cbiAqL1xuY2xhc3MgTGluZUNvdW50ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmxpbmVTdGFydHMgPSBbXTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNob3VsZCBiZSBjYWxsZWQgaW4gYXNjZW5kaW5nIG9yZGVyLiBPdGhlcndpc2UsIGNhbGxcbiAgICAgICAgICogYGxpbmVDb3VudGVyLmxpbmVTdGFydHMuc29ydCgpYCBiZWZvcmUgY2FsbGluZyBgbGluZVBvcygpYC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkTmV3TGluZSA9IChvZmZzZXQpID0+IHRoaXMubGluZVN0YXJ0cy5wdXNoKG9mZnNldCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQZXJmb3JtcyBhIGJpbmFyeSBzZWFyY2ggYW5kIHJldHVybnMgdGhlIDEtaW5kZXhlZCB7IGxpbmUsIGNvbCB9XG4gICAgICAgICAqIHBvc2l0aW9uIG9mIGBvZmZzZXRgLiBJZiBgbGluZSA9PT0gMGAsIGBhZGROZXdMaW5lYCBoYXMgbmV2ZXIgYmVlblxuICAgICAgICAgKiBjYWxsZWQgb3IgYG9mZnNldGAgaXMgYmVmb3JlIHRoZSBmaXJzdCBrbm93biBuZXdsaW5lLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5saW5lUG9zID0gKG9mZnNldCkgPT4ge1xuICAgICAgICAgICAgbGV0IGxvdyA9IDA7XG4gICAgICAgICAgICBsZXQgaGlnaCA9IHRoaXMubGluZVN0YXJ0cy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1pZCA9IChsb3cgKyBoaWdoKSA+PiAxOyAvLyBNYXRoLmZsb29yKChsb3cgKyBoaWdoKSAvIDIpXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGluZVN0YXJ0c1ttaWRdIDwgb2Zmc2V0KVxuICAgICAgICAgICAgICAgICAgICBsb3cgPSBtaWQgKyAxO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaGlnaCA9IG1pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmxpbmVTdGFydHNbbG93XSA9PT0gb2Zmc2V0KVxuICAgICAgICAgICAgICAgIHJldHVybiB7IGxpbmU6IGxvdyArIDEsIGNvbDogMSB9O1xuICAgICAgICAgICAgaWYgKGxvdyA9PT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4geyBsaW5lOiAwLCBjb2w6IG9mZnNldCB9O1xuICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmxpbmVTdGFydHNbbG93IC0gMV07XG4gICAgICAgICAgICByZXR1cm4geyBsaW5lOiBsb3csIGNvbDogb2Zmc2V0IC0gc3RhcnQgKyAxIH07XG4gICAgICAgIH07XG4gICAgfVxufVxuXG5leHBvcnQgeyBMaW5lQ291bnRlciB9O1xuIiwgImltcG9ydCB7IHRva2VuVHlwZSB9IGZyb20gJy4vY3N0LmpzJztcbmltcG9ydCB7IExleGVyIH0gZnJvbSAnLi9sZXhlci5qcyc7XG5cbmZ1bmN0aW9uIGluY2x1ZGVzVG9rZW4obGlzdCwgdHlwZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSlcbiAgICAgICAgaWYgKGxpc3RbaV0udHlwZSA9PT0gdHlwZSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIGZpbmROb25FbXB0eUluZGV4KGxpc3QpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgc3dpdGNoIChsaXN0W2ldLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn1cbmZ1bmN0aW9uIGlzRmxvd1Rva2VuKHRva2VuKSB7XG4gICAgc3dpdGNoICh0b2tlbj8udHlwZSkge1xuICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0UHJldlByb3BzKHBhcmVudCkge1xuICAgIHN3aXRjaCAocGFyZW50LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnZG9jdW1lbnQnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5zdGFydDtcbiAgICAgICAgY2FzZSAnYmxvY2stbWFwJzoge1xuICAgICAgICAgICAgY29uc3QgaXQgPSBwYXJlbnQuaXRlbXNbcGFyZW50Lml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgcmV0dXJuIGl0LnNlcCA/PyBpdC5zdGFydDtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdibG9jay1zZXEnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5pdGVtc1twYXJlbnQuaXRlbXMubGVuZ3RoIC0gMV0uc3RhcnQ7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgfVxufVxuLyoqIE5vdGU6IE1heSBtb2RpZnkgaW5wdXQgYXJyYXkgKi9cbmZ1bmN0aW9uIGdldEZpcnN0S2V5U3RhcnRQcm9wcyhwcmV2KSB7XG4gICAgaWYgKHByZXYubGVuZ3RoID09PSAwKVxuICAgICAgICByZXR1cm4gW107XG4gICAgbGV0IGkgPSBwcmV2Lmxlbmd0aDtcbiAgICBsb29wOiB3aGlsZSAoLS1pID49IDApIHtcbiAgICAgICAgc3dpdGNoIChwcmV2W2ldLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1zdGFydCc6XG4gICAgICAgICAgICBjYXNlICdleHBsaWNpdC1rZXktaW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOlxuICAgICAgICAgICAgY2FzZSAnc2VxLWl0ZW0taW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUgKHByZXZbKytpXT8udHlwZSA9PT0gJ3NwYWNlJykge1xuICAgICAgICAvKiBsb29wICovXG4gICAgfVxuICAgIHJldHVybiBwcmV2LnNwbGljZShpLCBwcmV2Lmxlbmd0aCk7XG59XG5mdW5jdGlvbiBhcnJheVB1c2hBcnJheSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIC8vIE1heSBleGhhdXN0IGNhbGwgc3RhY2sgd2l0aCBsYXJnZSBgc291cmNlYCBhcnJheVxuICAgIGlmIChzb3VyY2UubGVuZ3RoIDwgMWU1KVxuICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSh0YXJnZXQsIHNvdXJjZSk7XG4gICAgZWxzZVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNvdXJjZS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIHRhcmdldC5wdXNoKHNvdXJjZVtpXSk7XG59XG5mdW5jdGlvbiBmaXhGbG93U2VxSXRlbXMoZmMpIHtcbiAgICBpZiAoZmMuc3RhcnQudHlwZSA9PT0gJ2Zsb3ctc2VxLXN0YXJ0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IGl0IG9mIGZjLml0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoaXQuc2VwICYmXG4gICAgICAgICAgICAgICAgIWl0LnZhbHVlICYmXG4gICAgICAgICAgICAgICAgIWluY2x1ZGVzVG9rZW4oaXQuc3RhcnQsICdleHBsaWNpdC1rZXktaW5kJykgJiZcbiAgICAgICAgICAgICAgICAhaW5jbHVkZXNUb2tlbihpdC5zZXAsICdtYXAtdmFsdWUtaW5kJykpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXQua2V5KVxuICAgICAgICAgICAgICAgICAgICBpdC52YWx1ZSA9IGl0LmtleTtcbiAgICAgICAgICAgICAgICBkZWxldGUgaXQua2V5O1xuICAgICAgICAgICAgICAgIGlmIChpc0Zsb3dUb2tlbihpdC52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlLmVuZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5UHVzaEFycmF5KGl0LnZhbHVlLmVuZCwgaXQuc2VwKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUuZW5kID0gaXQuc2VwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGFycmF5UHVzaEFycmF5KGl0LnN0YXJ0LCBpdC5zZXApO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBpdC5zZXA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIEEgWUFNTCBjb25jcmV0ZSBzeW50YXggdHJlZSAoQ1NUKSBwYXJzZXJcbiAqXG4gKiBgYGB0c1xuICogY29uc3Qgc3JjOiBzdHJpbmcgPSAuLi5cbiAqIGZvciAoY29uc3QgdG9rZW4gb2YgbmV3IFBhcnNlcigpLnBhcnNlKHNyYykpIHtcbiAqICAgLy8gdG9rZW46IFRva2VuXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUbyB1c2UgdGhlIHBhcnNlciB3aXRoIGEgdXNlci1wcm92aWRlZCBsZXhlcjpcbiAqXG4gKiBgYGB0c1xuICogZnVuY3Rpb24qIHBhcnNlKHNvdXJjZTogc3RyaW5nLCBsZXhlcjogTGV4ZXIpIHtcbiAqICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcigpXG4gKiAgIGZvciAoY29uc3QgbGV4ZW1lIG9mIGxleGVyLmxleChzb3VyY2UpKVxuICogICAgIHlpZWxkKiBwYXJzZXIubmV4dChsZXhlbWUpXG4gKiAgIHlpZWxkKiBwYXJzZXIuZW5kKClcbiAqIH1cbiAqXG4gKiBjb25zdCBzcmM6IHN0cmluZyA9IC4uLlxuICogY29uc3QgbGV4ZXIgPSBuZXcgTGV4ZXIoKVxuICogZm9yIChjb25zdCB0b2tlbiBvZiBwYXJzZShzcmMsIGxleGVyKSkge1xuICogICAvLyB0b2tlbjogVG9rZW5cbiAqIH1cbiAqIGBgYFxuICovXG5jbGFzcyBQYXJzZXIge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSBvbk5ld0xpbmUgLSBJZiBkZWZpbmVkLCBjYWxsZWQgc2VwYXJhdGVseSB3aXRoIHRoZSBzdGFydCBwb3NpdGlvbiBvZlxuICAgICAqICAgZWFjaCBuZXcgbGluZSAoaW4gYHBhcnNlKClgLCBpbmNsdWRpbmcgdGhlIHN0YXJ0IG9mIGlucHV0KS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihvbk5ld0xpbmUpIHtcbiAgICAgICAgLyoqIElmIHRydWUsIHNwYWNlIGFuZCBzZXF1ZW5jZSBpbmRpY2F0b3JzIGNvdW50IGFzIGluZGVudGF0aW9uICovXG4gICAgICAgIHRoaXMuYXROZXdMaW5lID0gdHJ1ZTtcbiAgICAgICAgLyoqIElmIHRydWUsIG5leHQgdG9rZW4gaXMgYSBzY2FsYXIgdmFsdWUgKi9cbiAgICAgICAgdGhpcy5hdFNjYWxhciA9IGZhbHNlO1xuICAgICAgICAvKiogQ3VycmVudCBpbmRlbnRhdGlvbiBsZXZlbCAqL1xuICAgICAgICB0aGlzLmluZGVudCA9IDA7XG4gICAgICAgIC8qKiBDdXJyZW50IG9mZnNldCBzaW5jZSB0aGUgc3RhcnQgb2YgcGFyc2luZyAqL1xuICAgICAgICB0aGlzLm9mZnNldCA9IDA7XG4gICAgICAgIC8qKiBPbiB0aGUgc2FtZSBsaW5lIHdpdGggYSBibG9jayBtYXAga2V5ICovXG4gICAgICAgIHRoaXMub25LZXlMaW5lID0gZmFsc2U7XG4gICAgICAgIC8qKiBUb3AgaW5kaWNhdGVzIHRoZSBub2RlIHRoYXQncyBjdXJyZW50bHkgYmVpbmcgYnVpbHQgKi9cbiAgICAgICAgdGhpcy5zdGFjayA9IFtdO1xuICAgICAgICAvKiogVGhlIHNvdXJjZSBvZiB0aGUgY3VycmVudCB0b2tlbiwgc2V0IGluIHBhcnNlKCkgKi9cbiAgICAgICAgdGhpcy5zb3VyY2UgPSAnJztcbiAgICAgICAgLyoqIFRoZSB0eXBlIG9mIHRoZSBjdXJyZW50IHRva2VuLCBzZXQgaW4gcGFyc2UoKSAqL1xuICAgICAgICB0aGlzLnR5cGUgPSAnJztcbiAgICAgICAgLy8gTXVzdCBiZSBkZWZpbmVkIGFmdGVyIGBuZXh0KClgXG4gICAgICAgIHRoaXMubGV4ZXIgPSBuZXcgTGV4ZXIoKTtcbiAgICAgICAgdGhpcy5vbk5ld0xpbmUgPSBvbk5ld0xpbmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBhcnNlIGBzb3VyY2VgIGFzIGEgWUFNTCBzdHJlYW0uXG4gICAgICogSWYgYGluY29tcGxldGVgLCBhIHBhcnQgb2YgdGhlIGxhc3QgbGluZSBtYXkgYmUgbGVmdCBhcyBhIGJ1ZmZlciBmb3IgdGhlIG5leHQgY2FsbC5cbiAgICAgKlxuICAgICAqIEVycm9ycyBhcmUgbm90IHRocm93biwgYnV0IHlpZWxkZWQgYXMgYHsgdHlwZTogJ2Vycm9yJywgbWVzc2FnZSB9YCB0b2tlbnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIGdlbmVyYXRvciBvZiB0b2tlbnMgcmVwcmVzZW50aW5nIGVhY2ggZGlyZWN0aXZlLCBkb2N1bWVudCwgYW5kIG90aGVyIHN0cnVjdHVyZS5cbiAgICAgKi9cbiAgICAqcGFyc2Uoc291cmNlLCBpbmNvbXBsZXRlID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lICYmIHRoaXMub2Zmc2V0ID09PSAwKVxuICAgICAgICAgICAgdGhpcy5vbk5ld0xpbmUoMCk7XG4gICAgICAgIGZvciAoY29uc3QgbGV4ZW1lIG9mIHRoaXMubGV4ZXIubGV4KHNvdXJjZSwgaW5jb21wbGV0ZSkpXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5uZXh0KGxleGVtZSk7XG4gICAgICAgIGlmICghaW5jb21wbGV0ZSlcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLmVuZCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZHZhbmNlIHRoZSBwYXJzZXIgYnkgdGhlIGBzb3VyY2VgIG9mIG9uZSBsZXhpY2FsIHRva2VuLlxuICAgICAqL1xuICAgICpuZXh0KHNvdXJjZSkge1xuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgaWYgKHRoaXMuYXRTY2FsYXIpIHtcbiAgICAgICAgICAgIHRoaXMuYXRTY2FsYXIgPSBmYWxzZTtcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHlwZSA9IHRva2VuVHlwZShzb3VyY2UpO1xuICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgTm90IGEgWUFNTCB0b2tlbjogJHtzb3VyY2V9YDtcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCh7IHR5cGU6ICdlcnJvcicsIG9mZnNldDogdGhpcy5vZmZzZXQsIG1lc3NhZ2UsIHNvdXJjZSB9KTtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ3NjYWxhcicpIHtcbiAgICAgICAgICAgIHRoaXMuYXROZXdMaW5lID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmF0U2NhbGFyID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9ICdzY2FsYXInO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmF0TmV3TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbk5ld0xpbmUodGhpcy5vZmZzZXQgKyBzb3VyY2UubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hdE5ld0xpbmUgJiYgc291cmNlWzBdID09PSAnICcpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGVudCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdleHBsaWNpdC1rZXktaW5kJzpcbiAgICAgICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzZXEtaXRlbS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hdE5ld0xpbmUpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGVudCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdkb2MtbW9kZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZmxvdy1lcnJvci1lbmQnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdE5ld0xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqIENhbGwgYXQgZW5kIG9mIGlucHV0IHRvIHB1c2ggb3V0IGFueSByZW1haW5pbmcgY29uc3RydWN0aW9ucyAqL1xuICAgICplbmQoKSB7XG4gICAgICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICB9XG4gICAgZ2V0IHNvdXJjZVRva2VuKCkge1xuICAgICAgICBjb25zdCBzdCA9IHtcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gc3Q7XG4gICAgfVxuICAgICpzdGVwKCkge1xuICAgICAgICBjb25zdCB0b3AgPSB0aGlzLnBlZWsoMSk7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdkb2MtZW5kJyAmJiB0b3A/LnR5cGUgIT09ICdkb2MtZW5kJykge1xuICAgICAgICAgICAgd2hpbGUgKHRoaXMuc3RhY2subGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2RvYy1lbmQnLFxuICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0b3ApXG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuc3RyZWFtKCk7XG4gICAgICAgIHN3aXRjaCAodG9wLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RvY3VtZW50JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuZG9jdW1lbnQodG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnNjYWxhcih0b3ApO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuYmxvY2tTY2FsYXIodG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmJsb2NrTWFwKHRvcCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zZXEnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5ibG9ja1NlcXVlbmNlKHRvcCk7XG4gICAgICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5mbG93Q29sbGVjdGlvbih0b3ApO1xuICAgICAgICAgICAgY2FzZSAnZG9jLWVuZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmRvY3VtZW50RW5kKHRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgfVxuICAgIHBlZWsobikge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aCAtIG5dO1xuICAgIH1cbiAgICAqcG9wKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gZXJyb3IgPz8gdGhpcy5zdGFjay5wb3AoKTtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmIHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnVHJpZWQgdG8gcG9wIGFuIGVtcHR5IHN0YWNrJztcbiAgICAgICAgICAgIHlpZWxkIHsgdHlwZTogJ2Vycm9yJywgb2Zmc2V0OiB0aGlzLm9mZnNldCwgc291cmNlOiAnJywgbWVzc2FnZSB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuc3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB5aWVsZCB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHRvcCA9IHRoaXMucGVlaygxKTtcbiAgICAgICAgICAgIGlmICh0b2tlbi50eXBlID09PSAnYmxvY2stc2NhbGFyJykge1xuICAgICAgICAgICAgICAgIC8vIEJsb2NrIHNjYWxhcnMgdXNlIHRoZWlyIHBhcmVudCByYXRoZXIgdGhhbiBoZWFkZXIgaW5kZW50XG4gICAgICAgICAgICAgICAgdG9rZW4uaW5kZW50ID0gJ2luZGVudCcgaW4gdG9wID8gdG9wLmluZGVudCA6IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0b2tlbi50eXBlID09PSAnZmxvdy1jb2xsZWN0aW9uJyAmJiB0b3AudHlwZSA9PT0gJ2RvY3VtZW50Jykge1xuICAgICAgICAgICAgICAgIC8vIElnbm9yZSBhbGwgaW5kZW50IGZvciB0b3AtbGV2ZWwgZmxvdyBjb2xsZWN0aW9uc1xuICAgICAgICAgICAgICAgIHRva2VuLmluZGVudCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2Zsb3ctY29sbGVjdGlvbicpXG4gICAgICAgICAgICAgICAgZml4Rmxvd1NlcUl0ZW1zKHRva2VuKTtcbiAgICAgICAgICAgIHN3aXRjaCAodG9wLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkb2N1bWVudCc6XG4gICAgICAgICAgICAgICAgICAgIHRvcC52YWx1ZSA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOlxuICAgICAgICAgICAgICAgICAgICB0b3AucHJvcHMucHVzaCh0b2tlbik7IC8vIGVycm9yXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXQgPSB0b3AuaXRlbXNbdG9wLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCBrZXk6IHRva2VuLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiB0b2tlbiwgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gIWl0LmV4cGxpY2l0S2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdibG9jay1zZXEnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ID0gdG9wLml0ZW1zW3RvcC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLml0ZW1zLnB1c2goeyBzdGFydDogW10sIHZhbHVlOiB0b2tlbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXQgPSB0b3AuaXRlbXNbdG9wLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogdG9rZW4sIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnZhbHVlID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiB0b2tlbiwgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AodG9rZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCh0b3AudHlwZSA9PT0gJ2RvY3VtZW50JyB8fFxuICAgICAgICAgICAgICAgIHRvcC50eXBlID09PSAnYmxvY2stbWFwJyB8fFxuICAgICAgICAgICAgICAgIHRvcC50eXBlID09PSAnYmxvY2stc2VxJykgJiZcbiAgICAgICAgICAgICAgICAodG9rZW4udHlwZSA9PT0gJ2Jsb2NrLW1hcCcgfHwgdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNlcScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdCA9IHRva2VuLml0ZW1zW3Rva2VuLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0ICYmXG4gICAgICAgICAgICAgICAgICAgICFsYXN0LnNlcCAmJlxuICAgICAgICAgICAgICAgICAgICAhbGFzdC52YWx1ZSAmJlxuICAgICAgICAgICAgICAgICAgICBsYXN0LnN0YXJ0Lmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgZmluZE5vbkVtcHR5SW5kZXgobGFzdC5zdGFydCkgPT09IC0xICYmXG4gICAgICAgICAgICAgICAgICAgICh0b2tlbi5pbmRlbnQgPT09IDAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Quc3RhcnQuZXZlcnkoc3QgPT4gc3QudHlwZSAhPT0gJ2NvbW1lbnQnIHx8IHN0LmluZGVudCA8IHRva2VuLmluZGVudCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b3AudHlwZSA9PT0gJ2RvY3VtZW50JylcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5lbmQgPSBsYXN0LnN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuaXRlbXMucHVzaCh7IHN0YXJ0OiBsYXN0LnN0YXJ0IH0pO1xuICAgICAgICAgICAgICAgICAgICB0b2tlbi5pdGVtcy5zcGxpY2UoLTEsIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAqc3RyZWFtKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZGlyZWN0aXZlLWxpbmUnOlxuICAgICAgICAgICAgICAgIHlpZWxkIHsgdHlwZTogJ2RpcmVjdGl2ZScsIG9mZnNldDogdGhpcy5vZmZzZXQsIHNvdXJjZTogdGhpcy5zb3VyY2UgfTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdieXRlLW9yZGVyLW1hcmsnOlxuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLnNvdXJjZVRva2VuO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1tb2RlJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1zdGFydCc6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkb2MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkb2N1bWVudCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBbXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2RvYy1zdGFydCcpXG4gICAgICAgICAgICAgICAgICAgIGRvYy5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChkb2MpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB5aWVsZCB7XG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBVbmV4cGVjdGVkICR7dGhpcy50eXBlfSB0b2tlbiBpbiBZQU1MIHN0cmVhbWAsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgIH07XG4gICAgfVxuICAgICpkb2N1bWVudChkb2MpIHtcbiAgICAgICAgaWYgKGRvYy52YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5saW5lRW5kKGRvYyk7XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdkb2Mtc3RhcnQnOiB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbmROb25FbXB0eUluZGV4KGRvYy5zdGFydCkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZG9jLnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGRvYy5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBidiA9IHRoaXMuc3RhcnRCbG9ja1ZhbHVlKGRvYyk7XG4gICAgICAgIGlmIChidilcbiAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChidik7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgeWllbGQge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVW5leHBlY3RlZCAke3RoaXMudHlwZX0gdG9rZW4gaW4gWUFNTCBkb2N1bWVudGAsXG4gICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqc2NhbGFyKHNjYWxhcikge1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnbWFwLXZhbHVlLWluZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHByZXYgPSBnZXRQcmV2UHJvcHModGhpcy5wZWVrKDIpKTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgbGV0IHNlcDtcbiAgICAgICAgICAgIGlmIChzY2FsYXIuZW5kKSB7XG4gICAgICAgICAgICAgICAgc2VwID0gc2NhbGFyLmVuZDtcbiAgICAgICAgICAgICAgICBzZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgc2NhbGFyLmVuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzZXAgPSBbdGhpcy5zb3VyY2VUb2tlbl07XG4gICAgICAgICAgICBjb25zdCBtYXAgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiBzY2FsYXIub2Zmc2V0LFxuICAgICAgICAgICAgICAgIGluZGVudDogc2NhbGFyLmluZGVudCxcbiAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogc2NhbGFyLCBzZXAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnN0YWNrW3RoaXMuc3RhY2subGVuZ3RoIC0gMV0gPSBtYXA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgeWllbGQqIHRoaXMubGluZUVuZChzY2FsYXIpO1xuICAgIH1cbiAgICAqYmxvY2tTY2FsYXIoc2NhbGFyKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIHNjYWxhci5wcm9wcy5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICAgICAgc2NhbGFyLnNvdXJjZSA9IHRoaXMuc291cmNlO1xuICAgICAgICAgICAgICAgIC8vIGJsb2NrLXNjYWxhciBzb3VyY2UgaW5jbHVkZXMgdHJhaWxpbmcgbmV3bGluZVxuICAgICAgICAgICAgICAgIHRoaXMuYXROZXdMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudCA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBubCA9IHRoaXMuc291cmNlLmluZGV4T2YoJ1xcbicpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKG5sICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTmV3TGluZSh0aGlzLm9mZnNldCArIG5sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5sID0gdGhpcy5zb3VyY2UuaW5kZXhPZignXFxuJywgbmwpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqYmxvY2tNYXAobWFwKSB7XG4gICAgICAgIGNvbnN0IGl0ID0gbWFwLml0ZW1zW21hcC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgLy8gaXQuc2VwIGlzIHRydWUtaXNoIGlmIHBhaXIgYWxyZWFkeSBoYXMga2V5IG9yIDogc2VwYXJhdG9yXG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSAnZW5kJyBpbiBpdC52YWx1ZSA/IGl0LnZhbHVlLmVuZCA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGFzdCA9IEFycmF5LmlzQXJyYXkoZW5kKSA/IGVuZFtlbmQubGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0Py50eXBlID09PSAnY29tbWVudCcpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQ/LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXRJbmRlbnRlZENvbW1lbnQoaXQuc3RhcnQsIG1hcC5pbmRlbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gbWFwLml0ZW1zW21hcC5pdGVtcy5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IHByZXY/LnZhbHVlPy5lbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbmQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXlQdXNoQXJyYXkoZW5kLCBpdC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5kZW50ID49IG1hcC5pbmRlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGF0TWFwSW5kZW50ID0gIXRoaXMub25LZXlMaW5lICYmIHRoaXMuaW5kZW50ID09PSBtYXAuaW5kZW50O1xuICAgICAgICAgICAgY29uc3QgYXROZXh0SXRlbSA9IGF0TWFwSW5kZW50ICYmXG4gICAgICAgICAgICAgICAgKGl0LnNlcCB8fCBpdC5leHBsaWNpdEtleSkgJiZcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGUgIT09ICdzZXEtaXRlbS1pbmQnO1xuICAgICAgICAgICAgLy8gRm9yIGVtcHR5IG5vZGVzLCBhc3NpZ24gbmV3bGluZS1zZXBhcmF0ZWQgbm90IGluZGVudGVkIGVtcHR5IHRva2VucyB0byBmb2xsb3dpbmcgbm9kZVxuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gW107XG4gICAgICAgICAgICBpZiAoYXROZXh0SXRlbSAmJiBpdC5zZXAgJiYgIWl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmwgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0LnNlcC5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdCA9IGl0LnNlcFtpXTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChzdC50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBubC5wdXNoKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0LmluZGVudCA+IG1hcC5pbmRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5sLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5sLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5sLmxlbmd0aCA+PSAyKVxuICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGl0LnNlcC5zcGxpY2UobmxbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdhbmNob3InOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdE5leHRJdGVtIHx8IGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQuc2VwICYmICFpdC5leHBsaWNpdEtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LmV4cGxpY2l0S2V5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhdE5leHRJdGVtIHx8IGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCwgZXhwbGljaXRLZXk6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSwgZXhwbGljaXRLZXk6IHRydWUgfV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoaXQuZXhwbGljaXRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVzVG9rZW4oaXQuc3RhcnQsICduZXdsaW5lJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMoaXQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaW5jbHVkZXNUb2tlbihpdC5zZXAsICdtYXAtdmFsdWUtaW5kJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpc0Zsb3dUb2tlbihpdC5rZXkpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIWluY2x1ZGVzVG9rZW4oaXQuc2VwLCAnbmV3bGluZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMoaXQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGl0LmtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXAgPSBpdC5zZXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlIGd1YXJkIGlzIHdyb25nIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgaXQua2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHlwZSBndWFyZCBpcyB3cm9uZyBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGl0LnNlcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXksIHNlcCB9XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhcnQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdCBhY3R1YWxseSBhdCBuZXh0IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAgPSBpdC5zZXAuY29uY2F0KHN0YXJ0LCB0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC52YWx1ZSB8fCBhdE5leHRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGluY2x1ZGVzVG9rZW4oaXQuc2VwLCAnbWFwLXZhbHVlLWluZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydDogW10sIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnMgPSB0aGlzLmZsb3dTY2FsYXIodGhpcy50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0TmV4dEl0ZW0gfHwgaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQsIGtleTogZnMsIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goZnMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IGZzLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBidiA9IHRoaXMuc3RhcnRCbG9ja1ZhbHVlKG1hcCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChidikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJ2LnR5cGUgPT09ICdibG9jay1zZXEnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdC5leHBsaWNpdEtleSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWluY2x1ZGVzVG9rZW4oaXQuc2VwLCAnbmV3bGluZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdVbmV4cGVjdGVkIGJsb2NrLXNlcS1pbmQgb24gc2FtZSBsaW5lIHdpdGgga2V5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhdE1hcEluZGVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goYnYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgfVxuICAgICpibG9ja1NlcXVlbmNlKHNlcSkge1xuICAgICAgICBjb25zdCBpdCA9IHNlcS5pdGVtc1tzZXEuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kID0gJ2VuZCcgaW4gaXQudmFsdWUgPyBpdC52YWx1ZS5lbmQgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3QgPSBBcnJheS5pc0FycmF5KGVuZCkgPyBlbmRbZW5kLmxlbmd0aCAtIDFdIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdD8udHlwZSA9PT0gJ2NvbW1lbnQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kPy5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXEuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHNlcS5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXRJbmRlbnRlZENvbW1lbnQoaXQuc3RhcnQsIHNlcS5pbmRlbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gc2VxLml0ZW1zW3NlcS5pdGVtcy5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IHByZXY/LnZhbHVlPy5lbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbmQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXlQdXNoQXJyYXkoZW5kLCBpdC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VxLml0ZW1zLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdhbmNob3InOlxuICAgICAgICAgICAgY2FzZSAndGFnJzpcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUgfHwgdGhpcy5pbmRlbnQgPD0gc2VxLmluZGVudClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdzZXEtaXRlbS1pbmQnOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluZGVudCAhPT0gc2VxLmluZGVudClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlIHx8IGluY2x1ZGVzVG9rZW4oaXQuc3RhcnQsICdzZXEtaXRlbS1pbmQnKSlcbiAgICAgICAgICAgICAgICAgICAgc2VxLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5kZW50ID4gc2VxLmluZGVudCkge1xuICAgICAgICAgICAgY29uc3QgYnYgPSB0aGlzLnN0YXJ0QmxvY2tWYWx1ZShzZXEpO1xuICAgICAgICAgICAgaWYgKGJ2KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGJ2KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICB9XG4gICAgKmZsb3dDb2xsZWN0aW9uKGZjKSB7XG4gICAgICAgIGNvbnN0IGl0ID0gZmMuaXRlbXNbZmMuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdmbG93LWVycm9yLWVuZCcpIHtcbiAgICAgICAgICAgIGxldCB0b3A7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgdG9wID0gdGhpcy5wZWVrKDEpO1xuICAgICAgICAgICAgfSB3aGlsZSAodG9wPy50eXBlID09PSAnZmxvdy1jb2xsZWN0aW9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZmMuZW5kLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdjb21tYSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQgfHwgaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmMuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdCB8fCBpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZjLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgICAgICBjYXNlICd0YWcnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmMuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmcyA9IHRoaXMuZmxvd1NjYWxhcih0aGlzLnR5cGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmMuaXRlbXMucHVzaCh7IHN0YXJ0OiBbXSwga2V5OiBmcywgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGZzKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IGZzLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb3ctbWFwLWVuZCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZmxvdy1zZXEtZW5kJzpcbiAgICAgICAgICAgICAgICAgICAgZmMuZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGJ2ID0gdGhpcy5zdGFydEJsb2NrVmFsdWUoZmMpO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2Ugc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgICAgIGlmIChidilcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goYnYpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5wZWVrKDIpO1xuICAgICAgICAgICAgaWYgKHBhcmVudC50eXBlID09PSAnYmxvY2stbWFwJyAmJlxuICAgICAgICAgICAgICAgICgodGhpcy50eXBlID09PSAnbWFwLXZhbHVlLWluZCcgJiYgcGFyZW50LmluZGVudCA9PT0gZmMuaW5kZW50KSB8fFxuICAgICAgICAgICAgICAgICAgICAodGhpcy50eXBlID09PSAnbmV3bGluZScgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICFwYXJlbnQuaXRlbXNbcGFyZW50Lml0ZW1zLmxlbmd0aCAtIDFdLnNlcCkpKSB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy50eXBlID09PSAnbWFwLXZhbHVlLWluZCcgJiZcbiAgICAgICAgICAgICAgICBwYXJlbnQudHlwZSAhPT0gJ2Zsb3ctY29sbGVjdGlvbicpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gZ2V0UHJldlByb3BzKHBhcmVudCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMocHJldik7XG4gICAgICAgICAgICAgICAgZml4Rmxvd1NlcUl0ZW1zKGZjKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzZXAgPSBmYy5lbmQuc3BsaWNlKDEsIGZjLmVuZC5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogZmMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IGZjLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IGZjLCBzZXAgfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWNrW3RoaXMuc3RhY2subGVuZ3RoIC0gMV0gPSBtYXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5saW5lRW5kKGZjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmbG93U2NhbGFyKHR5cGUpIHtcbiAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lKSB7XG4gICAgICAgICAgICBsZXQgbmwgPSB0aGlzLnNvdXJjZS5pbmRleE9mKCdcXG4nKSArIDE7XG4gICAgICAgICAgICB3aGlsZSAobmwgIT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uTmV3TGluZSh0aGlzLm9mZnNldCArIG5sKTtcbiAgICAgICAgICAgICAgICBubCA9IHRoaXMuc291cmNlLmluZGV4T2YoJ1xcbicsIG5sKSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgfTtcbiAgICB9XG4gICAgc3RhcnRCbG9ja1ZhbHVlKHBhcmVudCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mbG93U2NhbGFyKHRoaXMudHlwZSk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXItaGVhZGVyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stc2NhbGFyJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgcHJvcHM6IFt0aGlzLnNvdXJjZVRva2VuXSxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiAnJ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYXNlICdmbG93LW1hcC1zdGFydCc6XG4gICAgICAgICAgICBjYXNlICdmbG93LXNlcS1zdGFydCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Zsb3ctY29sbGVjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLnNvdXJjZVRva2VuLFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW10sXG4gICAgICAgICAgICAgICAgICAgIGVuZDogW11cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSAnc2VxLWl0ZW0taW5kJzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stc2VxJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IGdldFByZXZQcm9wcyhwYXJlbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgICAgIHN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwgZXhwbGljaXRLZXk6IHRydWUgfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IGdldFByZXZQcm9wcyhwYXJlbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBhdEluZGVudGVkQ29tbWVudChzdGFydCwgaW5kZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgIT09ICdjb21tZW50JylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuaW5kZW50IDw9IGluZGVudClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHN0YXJ0LmV2ZXJ5KHN0ID0+IHN0LnR5cGUgPT09ICduZXdsaW5lJyB8fCBzdC50eXBlID09PSAnc3BhY2UnKTtcbiAgICB9XG4gICAgKmRvY3VtZW50RW5kKGRvY0VuZCkge1xuICAgICAgICBpZiAodGhpcy50eXBlICE9PSAnZG9jLW1vZGUnKSB7XG4gICAgICAgICAgICBpZiAoZG9jRW5kLmVuZClcbiAgICAgICAgICAgICAgICBkb2NFbmQuZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZG9jRW5kLmVuZCA9IFt0aGlzLnNvdXJjZVRva2VuXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqbGluZUVuZCh0b2tlbikge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnY29tbWEnOlxuICAgICAgICAgICAgY2FzZSAnZG9jLXN0YXJ0JzpcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1lbmQnOlxuICAgICAgICAgICAgY2FzZSAnZmxvdy1zZXEtZW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3ctbWFwLWVuZCc6XG4gICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBhbGwgb3RoZXIgdmFsdWVzIGFyZSBlcnJvcnNcbiAgICAgICAgICAgICAgICBpZiAodG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgICAgICB0b2tlbi5lbmQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRva2VuLmVuZCA9IFt0aGlzLnNvdXJjZVRva2VuXTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgeyBQYXJzZXIgfTtcbiIsICJpbXBvcnQgeyBDb21wb3NlciB9IGZyb20gJy4vY29tcG9zZS9jb21wb3Nlci5qcyc7XG5pbXBvcnQgeyBEb2N1bWVudCB9IGZyb20gJy4vZG9jL0RvY3VtZW50LmpzJztcbmltcG9ydCB7IHByZXR0aWZ5RXJyb3IsIFlBTUxQYXJzZUVycm9yIH0gZnJvbSAnLi9lcnJvcnMuanMnO1xuaW1wb3J0IHsgd2FybiB9IGZyb20gJy4vbG9nLmpzJztcbmltcG9ydCB7IGlzRG9jdW1lbnQgfSBmcm9tICcuL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IExpbmVDb3VudGVyIH0gZnJvbSAnLi9wYXJzZS9saW5lLWNvdW50ZXIuanMnO1xuaW1wb3J0IHsgUGFyc2VyIH0gZnJvbSAnLi9wYXJzZS9wYXJzZXIuanMnO1xuXG5mdW5jdGlvbiBwYXJzZU9wdGlvbnMob3B0aW9ucykge1xuICAgIGNvbnN0IHByZXR0eUVycm9ycyA9IG9wdGlvbnMucHJldHR5RXJyb3JzICE9PSBmYWxzZTtcbiAgICBjb25zdCBsaW5lQ291bnRlciA9IG9wdGlvbnMubGluZUNvdW50ZXIgfHwgKHByZXR0eUVycm9ycyAmJiBuZXcgTGluZUNvdW50ZXIoKSkgfHwgbnVsbDtcbiAgICByZXR1cm4geyBsaW5lQ291bnRlciwgcHJldHR5RXJyb3JzIH07XG59XG4vKipcbiAqIFBhcnNlIHRoZSBpbnB1dCBhcyBhIHN0cmVhbSBvZiBZQU1MIGRvY3VtZW50cy5cbiAqXG4gKiBEb2N1bWVudHMgc2hvdWxkIGJlIHNlcGFyYXRlZCBmcm9tIGVhY2ggb3RoZXIgYnkgYC4uLmAgb3IgYC0tLWAgbWFya2VyIGxpbmVzLlxuICpcbiAqIEByZXR1cm5zIElmIGFuIGVtcHR5IGBkb2NzYCBhcnJheSBpcyByZXR1cm5lZCwgaXQgd2lsbCBiZSBvZiB0eXBlXG4gKiAgIEVtcHR5U3RyZWFtIGFuZCBjb250YWluIGFkZGl0aW9uYWwgc3RyZWFtIGluZm9ybWF0aW9uLiBJblxuICogICBUeXBlU2NyaXB0LCB5b3Ugc2hvdWxkIHVzZSBgJ2VtcHR5JyBpbiBkb2NzYCBhcyBhIHR5cGUgZ3VhcmQgZm9yIGl0LlxuICovXG5mdW5jdGlvbiBwYXJzZUFsbERvY3VtZW50cyhzb3VyY2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHsgbGluZUNvdW50ZXIsIHByZXR0eUVycm9ycyB9ID0gcGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIobGluZUNvdW50ZXI/LmFkZE5ld0xpbmUpO1xuICAgIGNvbnN0IGNvbXBvc2VyID0gbmV3IENvbXBvc2VyKG9wdGlvbnMpO1xuICAgIGNvbnN0IGRvY3MgPSBBcnJheS5mcm9tKGNvbXBvc2VyLmNvbXBvc2UocGFyc2VyLnBhcnNlKHNvdXJjZSkpKTtcbiAgICBpZiAocHJldHR5RXJyb3JzICYmIGxpbmVDb3VudGVyKVxuICAgICAgICBmb3IgKGNvbnN0IGRvYyBvZiBkb2NzKSB7XG4gICAgICAgICAgICBkb2MuZXJyb3JzLmZvckVhY2gocHJldHRpZnlFcnJvcihzb3VyY2UsIGxpbmVDb3VudGVyKSk7XG4gICAgICAgICAgICBkb2Mud2FybmluZ3MuZm9yRWFjaChwcmV0dGlmeUVycm9yKHNvdXJjZSwgbGluZUNvdW50ZXIpKTtcbiAgICAgICAgfVxuICAgIGlmIChkb2NzLmxlbmd0aCA+IDApXG4gICAgICAgIHJldHVybiBkb2NzO1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKFtdLCB7IGVtcHR5OiB0cnVlIH0sIGNvbXBvc2VyLnN0cmVhbUluZm8oKSk7XG59XG4vKiogUGFyc2UgYW4gaW5wdXQgc3RyaW5nIGludG8gYSBzaW5nbGUgWUFNTC5Eb2N1bWVudCAqL1xuZnVuY3Rpb24gcGFyc2VEb2N1bWVudChzb3VyY2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHsgbGluZUNvdW50ZXIsIHByZXR0eUVycm9ycyB9ID0gcGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIobGluZUNvdW50ZXI/LmFkZE5ld0xpbmUpO1xuICAgIGNvbnN0IGNvbXBvc2VyID0gbmV3IENvbXBvc2VyKG9wdGlvbnMpO1xuICAgIC8vIGBkb2NgIGlzIGFsd2F5cyBzZXQgYnkgY29tcG9zZS5lbmQodHJ1ZSkgYXQgdGhlIHZlcnkgbGF0ZXN0XG4gICAgbGV0IGRvYyA9IG51bGw7XG4gICAgZm9yIChjb25zdCBfZG9jIG9mIGNvbXBvc2VyLmNvbXBvc2UocGFyc2VyLnBhcnNlKHNvdXJjZSksIHRydWUsIHNvdXJjZS5sZW5ndGgpKSB7XG4gICAgICAgIGlmICghZG9jKVxuICAgICAgICAgICAgZG9jID0gX2RvYztcbiAgICAgICAgZWxzZSBpZiAoZG9jLm9wdGlvbnMubG9nTGV2ZWwgIT09ICdzaWxlbnQnKSB7XG4gICAgICAgICAgICBkb2MuZXJyb3JzLnB1c2gobmV3IFlBTUxQYXJzZUVycm9yKF9kb2MucmFuZ2Uuc2xpY2UoMCwgMiksICdNVUxUSVBMRV9ET0NTJywgJ1NvdXJjZSBjb250YWlucyBtdWx0aXBsZSBkb2N1bWVudHM7IHBsZWFzZSB1c2UgWUFNTC5wYXJzZUFsbERvY3VtZW50cygpJykpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByZXR0eUVycm9ycyAmJiBsaW5lQ291bnRlcikge1xuICAgICAgICBkb2MuZXJyb3JzLmZvckVhY2gocHJldHRpZnlFcnJvcihzb3VyY2UsIGxpbmVDb3VudGVyKSk7XG4gICAgICAgIGRvYy53YXJuaW5ncy5mb3JFYWNoKHByZXR0aWZ5RXJyb3Ioc291cmNlLCBsaW5lQ291bnRlcikpO1xuICAgIH1cbiAgICByZXR1cm4gZG9jO1xufVxuZnVuY3Rpb24gcGFyc2Uoc3JjLCByZXZpdmVyLCBvcHRpb25zKSB7XG4gICAgbGV0IF9yZXZpdmVyID0gdW5kZWZpbmVkO1xuICAgIGlmICh0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBfcmV2aXZlciA9IHJldml2ZXI7XG4gICAgfVxuICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXZpdmVyICYmIHR5cGVvZiByZXZpdmVyID09PSAnb2JqZWN0Jykge1xuICAgICAgICBvcHRpb25zID0gcmV2aXZlcjtcbiAgICB9XG4gICAgY29uc3QgZG9jID0gcGFyc2VEb2N1bWVudChzcmMsIG9wdGlvbnMpO1xuICAgIGlmICghZG9jKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBkb2Mud2FybmluZ3MuZm9yRWFjaCh3YXJuaW5nID0+IHdhcm4oZG9jLm9wdGlvbnMubG9nTGV2ZWwsIHdhcm5pbmcpKTtcbiAgICBpZiAoZG9jLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChkb2Mub3B0aW9ucy5sb2dMZXZlbCAhPT0gJ3NpbGVudCcpXG4gICAgICAgICAgICB0aHJvdyBkb2MuZXJyb3JzWzBdO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkb2MuZXJyb3JzID0gW107XG4gICAgfVxuICAgIHJldHVybiBkb2MudG9KUyhPYmplY3QuYXNzaWduKHsgcmV2aXZlcjogX3Jldml2ZXIgfSwgb3B0aW9ucykpO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5KHZhbHVlLCByZXBsYWNlciwgb3B0aW9ucykge1xuICAgIGxldCBfcmVwbGFjZXIgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicgfHwgQXJyYXkuaXNBcnJheShyZXBsYWNlcikpIHtcbiAgICAgICAgX3JlcGxhY2VyID0gcmVwbGFjZXI7XG4gICAgfVxuICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXBsYWNlcikge1xuICAgICAgICBvcHRpb25zID0gcmVwbGFjZXI7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zLmxlbmd0aDtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGNvbnN0IGluZGVudCA9IE1hdGgucm91bmQob3B0aW9ucyk7XG4gICAgICAgIG9wdGlvbnMgPSBpbmRlbnQgPCAxID8gdW5kZWZpbmVkIDogaW5kZW50ID4gOCA/IHsgaW5kZW50OiA4IH0gOiB7IGluZGVudCB9O1xuICAgIH1cbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCB7IGtlZXBVbmRlZmluZWQgfSA9IG9wdGlvbnMgPz8gcmVwbGFjZXIgPz8ge307XG4gICAgICAgIGlmICgha2VlcFVuZGVmaW5lZClcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChpc0RvY3VtZW50KHZhbHVlKSAmJiAhX3JlcGxhY2VyKVxuICAgICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcob3B0aW9ucyk7XG4gICAgcmV0dXJuIG5ldyBEb2N1bWVudCh2YWx1ZSwgX3JlcGxhY2VyLCBvcHRpb25zKS50b1N0cmluZyhvcHRpb25zKTtcbn1cblxuZXhwb3J0IHsgcGFyc2UsIHBhcnNlQWxsRG9jdW1lbnRzLCBwYXJzZURvY3VtZW50LCBzdHJpbmdpZnkgfTtcbiIsICIvLyBgZXhwb3J0ICogYXMgZGVmYXVsdCBmcm9tIC4uLmAgZmFpbHMgb24gV2VicGFjayB2NFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2VlbWVsaS95YW1sL2lzc3Vlcy8yMjhcbmltcG9ydCAqIGFzIFlBTUwgZnJvbSAnLi9kaXN0L2luZGV4LmpzJ1xuZXhwb3J0IGRlZmF1bHQgWUFNTFxuZXhwb3J0ICogZnJvbSAnLi9kaXN0L2luZGV4LmpzJ1xuIiwgImltcG9ydCBTZXJpYWxpemVyIGZyb20gJy4vU2VyaWFsaXplci5qcyc7XG5pbXBvcnQgWUFNTCBmcm9tICd5YW1sJztcblxuLyoqXG4gKiBTZXJpYWxpemVyIHRoYXQgY29udmVydHMgdGhlIGludGVybWVkaWF0ZSByZXByZXNlbnRhdGlvbiB0by9mcm9tIFlBTUwuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFlBTUxTZXJpYWxpemVyIGV4dGVuZHMgU2VyaWFsaXplciB7XG4gICAgc3RhdGljIG1hdGNoZXMoZmlsZVBhdGgpIHtcbiAgICAgICAgcmV0dXJuIC9cXC55bWwkL2kudGVzdChmaWxlUGF0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5jb2RlIHRoZSBpbnRlcm1lZGlhdGUgcmVwcmVzZW50YXRpb24gYXMgWUFNTC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7YW55fSB2YWx1ZSAtIEludGVybWVkaWF0ZSByZXByZXNlbnRhdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fVxuICAgICAqL1xuICAgIGFzeW5jIGVuY29kZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gWUFNTC5zdHJpbmdpZnkodmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlY29kZSBZQU1MIGJhY2sgaW50byB0aGUgaW50ZXJtZWRpYXRlIHJlcHJlc2VudGF0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHlhbWwgLSBZQU1MIHN0cmluZy5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICAgICAqL1xuICAgIGFzeW5jIGRlY29kZSh5YW1sKSB7XG4gICAgICAgIHJldHVybiBZQU1MLnBhcnNlKHlhbWwpO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBjaGVja0ZpbGVFeGlzdHMgfSBmcm9tICcuLi9zaGFyZWQvZnNVdGlscy5qcyc7XG5pbXBvcnQge1xuICAgIGNyZWF0ZUNhcmQsIGNyZWF0ZVRlc3RQcm9qZWN0LCBkZWxldGVUZXN0UHJvamVjdCxcbiAgICBleHBlY3RDYXJkRGF0YSwgZmx1c2hDYXJkLCBzZXRDYXJkRmllbGRzLCB0b2dnbGVGYWNlXG59IGZyb20gJy4uL3NoYXJlZC90ZXN0aW5nL3Rlc3RVdGlscy5qcyc7XG5pbXBvcnQgWUFNTFNlcmlhbGl6ZXIgZnJvbSAnLi9wcm9qZWN0cy9zZXJpYWxpemVycy9ZQU1MU2VyaWFsaXplci5qcyc7XG5pbXBvcnQgeyByZWFkRmlsZSB9IGZyb20gJy4uL3NoYXJlZC9uZXV0cmFsaW5vQWRhcHRlci5qcyc7XG5cbmRlc2NyaWJlKCdQZXJzaXN0ZW5jZScsICgpID0+IHtcbiAgICBsZXQgcHJvamVjdDtcbiAgICBsZXQgZXhwZWN0ZWRCbGFua0NhcmREYXRhO1xuXG4gICAgYmVmb3JlQWxsKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnL3Rlc3RzL2ZpeHR1cmVzL2JsYW5rLnltbCcpO1xuICAgICAgICBleHBlY3RlZEJsYW5rQ2FyZERhdGEgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgfSk7XG5cbiAgICBiZWZvcmVFYWNoKGFzeW5jICgpID0+IHtcbiAgICAgICAgcHJvamVjdCA9IGF3YWl0IGNyZWF0ZVRlc3RQcm9qZWN0KCk7XG4gICAgfSk7XG5cbiAgICBhZnRlckFsbChhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGRlbGV0ZVRlc3RQcm9qZWN0KCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2F2ZXMgdGhlIHByb2plY3QgZmlsZSB0byB0aGUgZmlsZXN5c3RlbScsIGFzeW5jICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHByb2plY3QuZmlsZVBhdGgpLnRvTWF0Y2goL3Rlc3QuY21wcm9qJC8pO1xuICAgICAgICBhd2FpdCBwcm9qZWN0LnNhdmUoKTtcbiAgICAgICAgY29uc3QgcHJvamVjdEZpbGVFeGlzdHMgPSBhd2FpdCBjaGVja0ZpbGVFeGlzdHMocHJvamVjdC5maWxlUGF0aCk7XG4gICAgICAgIGV4cGVjdChwcm9qZWN0RmlsZUV4aXN0cykudG9CZVRydWUoKTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdjYXJkIGZpZWxkcycsICgpID0+IHtcbiAgICAgICAgaXQoJ3BlcnNpc3RzIGEgbmV3IGNhcmQgdG8gdGhlIGZpbGVzeXN0ZW0nLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYXJkID0gYXdhaXQgY3JlYXRlQ2FyZCgpO1xuICAgICAgICAgICAgYXdhaXQgc2V0Q2FyZEZpZWxkcyh7IG5hbWU6ICdUZXN0JyB9KTtcbiAgICAgICAgICAgIGF3YWl0IGZsdXNoQ2FyZCgpO1xuICAgICAgICAgICAgY29uc3QgcGF0aCA9IGNhcmQuZmlsZXMuZ2V0KCdkYXRhJyk7XG4gICAgICAgICAgICBjb25zdCBleGlzdHMgPSBhd2FpdCBjaGVja0ZpbGVFeGlzdHMocGF0aCk7XG4gICAgICAgICAgICBleHBlY3QoZXhpc3RzKS50b0JlVHJ1ZSgpO1xuICAgICAgICAgICAgZXhwZWN0KHBhdGgpLnRvTWF0Y2goL2NhcmRzXFwvVGVzdC55bWwkLyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdwZXJzaXN0cyBkZWZhdWx0IGNhcmQgZGF0YScsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNhcmQgPSBhd2FpdCBjcmVhdGVDYXJkKCk7XG4gICAgICAgICAgICBhd2FpdCBzZXRDYXJkRmllbGRzKHsgbmFtZTogJ1Rlc3QnIH0pO1xuICAgICAgICAgICAgYXdhaXQgc2V0Q2FyZEZpZWxkcyh7IG5hbWU6ICcnIH0pO1xuICAgICAgICAgICAgYXdhaXQgZmx1c2hDYXJkKCk7XG4gICAgICAgICAgICBjb25zdCBwYXRoID0gY2FyZC5maWxlcy5nZXQoJ2RhdGEnKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZWFkRmlsZShwYXRoKTtcbiAgICAgICAgICAgIGV4cGVjdChkYXRhKS50b0VxdWFsKGV4cGVjdGVkQmxhbmtDYXJkRGF0YSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdwZXJzaXN0cyBtdWx0aXBsZSBjYXJkcycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNhcmRBID0gYXdhaXQgY3JlYXRlQ2FyZCgpO1xuICAgICAgICAgICAgYXdhaXQgc2V0Q2FyZEZpZWxkcyh7IG5hbWU6ICdDYXJkIEEnIH0pO1xuICAgICAgICAgICAgYXdhaXQgZmx1c2hDYXJkKCk7XG4gICAgICAgICAgICBjb25zdCBwYXRoQSA9IGNhcmRBLmZpbGVzLmdldCgnZGF0YScpO1xuICAgICAgICAgICAgY29uc3QgZXhpc3RzQSA9IGF3YWl0IGNoZWNrRmlsZUV4aXN0cyhwYXRoQSk7XG4gICAgICAgICAgICBleHBlY3QoZXhpc3RzQSkudG9CZVRydWUoKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXRoQSkudG9NYXRjaCgvY2FyZHNcXC9DYXJkIEEueW1sJC8pO1xuXG4gICAgICAgICAgICBjb25zdCBjYXJkQiA9IGF3YWl0IGNyZWF0ZUNhcmQoKTtcbiAgICAgICAgICAgIGF3YWl0IHNldENhcmRGaWVsZHMoeyBuYW1lOiAnQ2FyZCBCJyB9KTtcbiAgICAgICAgICAgIGF3YWl0IGZsdXNoQ2FyZCgpO1xuICAgICAgICAgICAgY29uc3QgcGF0aEIgPSBjYXJkQi5maWxlcy5nZXQoJ2RhdGEnKTtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0c0IgPSBhd2FpdCBjaGVja0ZpbGVFeGlzdHMocGF0aEIpO1xuICAgICAgICAgICAgZXhwZWN0KGV4aXN0c0IpLnRvQmVUcnVlKCk7XG4gICAgICAgICAgICBleHBlY3QocGF0aEIpLnRvTWF0Y2goL2NhcmRzXFwvQ2FyZCBCLnltbCQvKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3BlcnNpc3RzIGNoYW5nZXMgdG8gbXVsdGlwbGUgZmllbGRzJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2FyZCA9IGF3YWl0IGNyZWF0ZUNhcmQoKTtcbiAgICAgICAgICAgIGF3YWl0IHNldENhcmRGaWVsZHMoeyBuYW1lOiAnVGVzdCcsIG1hbmFDb3N0OiAnV1VCUkcnIH0pO1xuICAgICAgICAgICAgYXdhaXQgZmx1c2hDYXJkKCk7XG4gICAgICAgICAgICBjb25zdCBwYXRoID0gY2FyZC5maWxlcy5nZXQoJ2RhdGEnKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBZQU1MU2VyaWFsaXplci5sb2FkKHBhdGgpO1xuICAgICAgICAgICAgZXhwZWN0Q2FyZERhdGEoZGF0YS5mcm9udCwgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnVGVzdCcsXG4gICAgICAgICAgICAgICAgbWFuYUNvc3Q6ICdXVUJSRydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgncGVyc2lzdHMgdGhlIGZpbmFsIHZhbHVlIGFmdGVyIG11bHRpcGxlIGNoYW5nZXMnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYXJkID0gYXdhaXQgY3JlYXRlQ2FyZCgpO1xuICAgICAgICAgICAgYXdhaXQgc2V0Q2FyZEZpZWxkcyh7IG5hbWU6ICdTd2FtcCcsIHN1cGVyVHlwZTogJ0xhbmQnIH0pO1xuICAgICAgICAgICAgYXdhaXQgc2V0Q2FyZEZpZWxkcyh7IHN1cGVyVHlwZTogJ0Jhc2ljIExhbmQnLCBzdWJUeXBlOiAnU3dhbXAnIH0pO1xuICAgICAgICAgICAgYXdhaXQgZmx1c2hDYXJkKCk7XG4gICAgICAgICAgICBjb25zdCBwYXRoID0gY2FyZC5maWxlcy5nZXQoJ2RhdGEnKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBZQU1MU2VyaWFsaXplci5sb2FkKHBhdGgpO1xuICAgICAgICAgICAgZXhwZWN0Q2FyZERhdGEoZGF0YS5mcm9udCwge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdTd2FtcCcsXG4gICAgICAgICAgICAgICAgc3VwZXJUeXBlOiAnQmFzaWMgTGFuZCcsXG4gICAgICAgICAgICAgICAgc3ViVHlwZTogJ1N3YW1wJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgncGVyc2lzdHMgY2hhbmdpbmcgZmllbGRzIHRvIGVtcHR5IHZhbHVlcycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNhcmQgPSBhd2FpdCBjcmVhdGVDYXJkKCk7XG4gICAgICAgICAgICBhd2FpdCBzZXRDYXJkRmllbGRzKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnVHdpbmZsYW1lIFR5cmFudCcsXG4gICAgICAgICAgICAgICAgbWFuYUNvc3Q6ICczUlInLFxuICAgICAgICAgICAgICAgIHN1cGVyVHlwZTogJ0NyZWF0dXJlJyxcbiAgICAgICAgICAgICAgICBzdWJUeXBlOiAnRHJhZ29uJyxcbiAgICAgICAgICAgICAgICBydWxlc1RleHQ6ICdGbHlpbmdcXG5cXG5JZiBhIHNvdXJjZSB5b3UgY29udHJvbCB3b3VsZCBkZWFsIGRhbWFnZSB0byBhbiAnXG4gICAgICAgICAgICAgICAgICAgICsgJ29wcG9uZW50IG9yIGEgcGVybWFuZW50IGFuIG9wcG9uZW50IGNvbnRyb2xzLCBpdCBkZWFscyBkb3VibGUgJ1xuICAgICAgICAgICAgICAgICAgICArICd0aGF0IGRhbWFnZSBpbnN0ZWFkLicsXG4gICAgICAgICAgICAgICAgZmxhdm9yVGV4dDogYFwiSm9iIG9ubHkgcGFpZCBlbm91Z2ggZm9yIG9uZSBoZWFkLiBJJ20gb3V0LlwiXFxuYFxuICAgICAgICAgICAgICAgICAgICArIGBcdTIwMTRQZXJlbiwgdmV0ZXJhbiBtZXJjZW5hcnlgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGF3YWl0IGZsdXNoQ2FyZCgpO1xuICAgICAgICAgICAgYXdhaXQgc2V0Q2FyZEZpZWxkcyh7XG4gICAgICAgICAgICAgICAgbmFtZTogJycsXG4gICAgICAgICAgICAgICAgbWFuYUNvc3Q6ICcnLFxuICAgICAgICAgICAgICAgIHN1cGVyVHlwZTogJycsXG4gICAgICAgICAgICAgICAgc3ViVHlwZTogJycsXG4gICAgICAgICAgICAgICAgcnVsZXNUZXh0OiAnJyxcbiAgICAgICAgICAgICAgICBmbGF2b3JUZXh0OiAnJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhd2FpdCBmbHVzaENhcmQoKTtcbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSBjYXJkLmZpbGVzLmdldCgnZGF0YScpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IFlBTUxTZXJpYWxpemVyLmxvYWQocGF0aCk7XG4gICAgICAgICAgICBleHBlY3RDYXJkRGF0YShkYXRhLmZyb250LCB7XG4gICAgICAgICAgICAgICAgbmFtZTogJycsXG4gICAgICAgICAgICAgICAgbWFuYUNvc3Q6ICcnLFxuICAgICAgICAgICAgICAgIHN1cGVyVHlwZTogJycsXG4gICAgICAgICAgICAgICAgc3ViVHlwZTogJycsXG4gICAgICAgICAgICAgICAgcnVsZXNUZXh0OiAnJyxcbiAgICAgICAgICAgICAgICBmbGF2b3JUZXh0OiAnJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgncGVyc2lzdHMgZnJvbnQgYW5kIGJhY2sgZmFjZSBmaWVsZHMnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYXJkID0gYXdhaXQgY3JlYXRlQ2FyZCgpO1xuICAgICAgICAgICAgYXdhaXQgc2V0Q2FyZEZpZWxkcyh7IG5hbWU6ICdTZWEgR2F0ZSBSZXN0b3JhdGlvbicgfSk7XG4gICAgICAgICAgICBhd2FpdCB0b2dnbGVGYWNlKCdiYWNrJyk7XG4gICAgICAgICAgICBhd2FpdCBzZXRDYXJkRmllbGRzKHsgbmFtZTogJ1NlYSBHYXRlLCBSZWJvcm4nIH0sICdiYWNrJyk7XG4gICAgICAgICAgICBhd2FpdCBmbHVzaENhcmQoKTtcbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSBjYXJkLmZpbGVzLmdldCgnZGF0YScpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IFlBTUxTZXJpYWxpemVyLmxvYWQocGF0aCk7XG4gICAgICAgICAgICBleHBlY3RDYXJkRGF0YShkYXRhLmZyb250LCB7IG5hbWU6ICdTZWEgR2F0ZSBSZXN0b3JhdGlvbicgfSk7XG4gICAgICAgICAgICBleHBlY3RDYXJkRGF0YShkYXRhLmJhY2ssIHsgbmFtZTogJ1NlYSBHYXRlLCBSZWJvcm4nIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgncGVyc2lzdHMgY2hhbmdlcyBjb3JyZWN0bHkgd2hlbiBjYXJkIGNoYW5nZXMgYmVmb3JlIHNhdmUnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYXJkQSA9IGF3YWl0IGNyZWF0ZUNhcmQoKTtcbiAgICAgICAgICAgIGF3YWl0IHNldENhcmRGaWVsZHMoeyBuYW1lOiAnQ2FyZCBBJyB9KTtcbiAgICAgICAgICAgIGNvbnN0IGNhcmRCID0gYXdhaXQgY3JlYXRlQ2FyZCgpO1xuICAgICAgICAgICAgYXdhaXQgc2V0Q2FyZEZpZWxkcyh7IG5hbWU6ICdDYXJkIEInIH0pO1xuICAgICAgICAgICAgY29uc3QgY2FyZEMgPSBhd2FpdCBjcmVhdGVDYXJkKCk7XG4gICAgICAgICAgICBhd2FpdCBzZXRDYXJkRmllbGRzKHsgbmFtZTogJ0NhcmQgQycgfSk7XG4gICAgICAgICAgICBhd2FpdCBmbHVzaENhcmQoKTtcblxuICAgICAgICAgICAgY29uc3QgcGF0aEEgPSBjYXJkQS5maWxlcy5nZXQoJ2RhdGEnKTtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0c0EgPSBhd2FpdCBjaGVja0ZpbGVFeGlzdHMocGF0aEEpO1xuICAgICAgICAgICAgZXhwZWN0KGV4aXN0c0EpLnRvQmVUcnVlKCk7XG4gICAgICAgICAgICBleHBlY3QocGF0aEEpLnRvTWF0Y2goL2NhcmRzXFwvQ2FyZCBBLnltbCQvKTtcblxuICAgICAgICAgICAgY29uc3QgcGF0aEIgPSBjYXJkQi5maWxlcy5nZXQoJ2RhdGEnKTtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0c0IgPSBhd2FpdCBjaGVja0ZpbGVFeGlzdHMocGF0aEIpO1xuICAgICAgICAgICAgZXhwZWN0KGV4aXN0c0IpLnRvQmVUcnVlKCk7XG4gICAgICAgICAgICBleHBlY3QocGF0aEIpLnRvTWF0Y2goL2NhcmRzXFwvQ2FyZCBCLnltbCQvKTtcblxuICAgICAgICAgICAgY29uc3QgcGF0aEMgPSBjYXJkQy5maWxlcy5nZXQoJ2RhdGEnKTtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0c0MgPSBhd2FpdCBjaGVja0ZpbGVFeGlzdHMocGF0aEMpO1xuICAgICAgICAgICAgZXhwZWN0KGV4aXN0c0MpLnRvQmVUcnVlKCk7XG4gICAgICAgICAgICBleHBlY3QocGF0aEMpLnRvTWF0Y2goL2NhcmRzXFwvQ2FyZCBDLnltbCQvKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnY2FyZCBwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgICAgICBpdCgncGVyc2lzdHMgY2FyZCB0YWdzJywgYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdwZXJzaXN0cyBjYXJkIG5vdGVzJywgYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ2ZpbGUgbmFtaW5nJywgKCkgPT4ge1xuICAgICAgICBpdCgnZGVmYXVsdHMgZW1wdHkgbmFtZSB0byBcImJsYW5rXCInLCBhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nhbml0aXplcyBmaWxlbmFtZXMnLCBhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nhbml0aXplcyBcIiAtIFwiIGluIGZpbGVuYW1lcycsIGFzeW5jICgpID0+IHtcblxuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnaGFuZGxlcyBmaWxlbmFtZSBjb25mbGljdHMgd2l0aG91dCBjaGFuZ2luZyBjYXJkIG5hbWVzJywgYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdpcyBjYXNlIGluc2Vuc2l0aXZlIHdoZW4gaGFuZGxpbmcgbmFtaW5nIGNvbmZsaWN0cycsIGFzeW5jICgpID0+IHtcblxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdpbWFnZXMnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdwZXJzaXN0cyBjYXJkIGltYWdlIGZpbGVzJywgYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdwZXJzaXN0cyBmcm9udCBhbmQgYmFjayBpbWFnZSBmaWxlcycsIGFzeW5jICgpID0+IHtcblxuICAgICAgICB9KTtcblxuICAgICAgICBpdCgncGVyc2lzdHMgY2hhbmdlcyB0byBhbiBpbWFnZScsIGFzeW5jICgpID0+IHtcblxuICAgICAgICB9KTtcblxuICAgICAgICBpdCgncGVyc2lzdHMgaW1hZ2UgY3JvcHMnLCBhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3JlbW92ZXMgaW1hZ2UgZmlsZXMgd2hlbiBpbWFnZSBpcyByZW1vdmVkJywgYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdoYW5kbGVzIG5hbWluZyBjb2xsaXNpb25zJywgYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3JlbmFtaW5nJywgKCkgPT4ge1xuICAgICAgICBpdCgnZG9lcyBub3QgcmVuYW1lIHdoZW4gbmFtZSBpcyBjaGFuZ2VkIGJ1dCBtYXRjaGVzJywgYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdyZW5hbWVzIHRoZSBjYXJkIGZpbGUgd2hlbiB0aGUgY2FyZCBuYW1lIGNoYW5nZXMnLCBhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3JlbmFtZXMgdG8gYSBzYWZlIGZpbGVuYW1lIHdoZW4gYSBjb25mbGljdCBleGlzdHMnLCBhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3JlbmFtZXMgY2FyZCBpbWFnZSBmaWxlcyB3aGVuIHRoZSBjYXJkIG5hbWUgY2hhbmdlcycsIGFzeW5jICgpID0+IHtcblxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdyZW1vdmFsJywgKCkgPT4ge1xuICAgICAgICBpdCgncmVtb3ZlcyB0aGUgY2FyZCBkYXRhIGZpbGUgd2hlbiBjYXJkIGlzIGRlbGV0ZWQnLCBhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3JlbW92ZXMgdGhlIGNhcmQgaW1hZ2UgZmlsZXMgd2hlbiBjYXJkIGlzIGRlbGV0ZWQnLCBhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3JlbW92ZXMgdGhlIHJpZ2h0IGZpbGVzIHdoZW4gYSBuYW1pbmcgY29uZmxpY3QgZXhpc3RzJywgYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCd3b3JrcyB3aXRoIHJlbW92aW5nIG11bHRpcGxlIGNhcmRzIGF0IHRoZSBzYW1lIHRpbWUnLCBhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2RvZXMgbm90IHJlbmFtZSBjYXJkcyBuYW1lZCB0byBhdm9pZCBjb2xsaXNpb25zJywgYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdkb2VzIG5vdCByZWNyZWF0ZSB0aGUgY2FyZCB3aGVuIGEgc2F2ZSB3YXMgcGVuZGluZycsIGFzeW5jICgpID0+IHtcblxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdjb3B5L3Bhc3RlJywgKCkgPT4ge1xuICAgICAgICBpdCgnY3JlYXRlcyBhIG5ldyBjYXJkJywgYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjYW4gY3JlYXRlIG11bHRpcGxlIGNhcmRzJywgYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjb3BpZXMgYWxsIGZpZWxkIHZhbHVlcycsIGFzeW5jICgpID0+IHtcblxuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2F2ZXMgaW1hZ2UgdG8gYSBuZXcgZmlsZScsIGFzeW5jICgpID0+IHtcblxuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnZG9lcyBub3QgY2hhbmdlIHBhc3RlZCBjYXJkIHdoZW4gc291cmNlIGlzIGNoYW5nZWQgbGF0ZXInLCBhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2RvZXMgbm90IGNoYW5nZSB0aGUgc291cmNlIGNhcmQgd2hlbiBwYXN0ZWQgY2FyZCBpcyBjaGFuZ2VkJywgYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjcmVhdGVzIGEgY2FyZCBhZnRlciBzb3VyY2UgaXMgcmVtb3ZlZCcsIGFzeW5jICgpID0+IHtcblxuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnd29ya3Mgd2l0aCBjb3B5aW5nIGEgcGFzdGVkIGNhcmQnLCBhc3luYyAoKSA9PiB7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NyZWF0ZXMgbXVsdGlwbGUgaW5kZXBlbmRlbnQgY2FyZHMgb24gbXVsdGlwbGUgcGFzdGVzJywgYXN5bmMgKCkgPT4ge1xuXG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iLCAiLypcclxuICogQWRhcHRlZCBmcm9tIHRoZSBKYXNtaW5lIENvbnNvbGVSZXBvcnRlci5cclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTkgUGl2b3RhbCBMYWJzXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDI2IFRoZSBKYXNtaW5lIGRldmVsb3BlcnNcclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nXHJcbiAqIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxyXG4gKiBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcclxuICogd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxyXG4gKiBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cclxuICogcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXHJcbiAqIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcclxuICogaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXHJcbiAqIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxyXG4gKiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxyXG4gKiBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFXHJcbiAqIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cclxuICogT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXHJcbiAqIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxyXG4gKi9cclxuXHJcbmNvbnN0IGFuc2kgPSB7XHJcbiAgICBncmVlbjogJ1xceDFCWzMybScsXHJcbiAgICByZWQ6ICdcXHgxQlszMW0nLFxyXG4gICAgeWVsbG93OiAnXFx4MUJbMzNtJyxcclxuICAgIG5vbmU6ICdcXHgxQlswbScsXHJcbn07XHJcblxyXG5jbGFzcyBDdXN0b21SZXBvcnRlciB7XHJcbiAgICAjcHJpbnQ7XHJcbiAgICAjc2hvd0NvbG9ycztcclxuICAgICNhbHdheXNMaXN0UGVuZGluZ1NwZWNzO1xyXG4gICAgI2xpc3ROb3RBcHBsaWNhYmxlU3BlY3M7XHJcbiAgICAjc3RhY2tGaWx0ZXI7XHJcbiAgICAjZmFpbGVkU3BlY3M7XHJcbiAgICAjcGVuZGluZ1NwZWNzO1xyXG4gICAgI25vdEFwcGxpY2FibGVTcGVjcztcclxuICAgICNmYWlsZWRTdWl0ZXM7XHJcbiAgICAjb3V0cHV0UXVldWU7XHJcblxyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIGlmICghb3B0aW9ucz8ucHJpbnQpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ3VzdG9tUmVwb3J0ZXIgcmVxdWlyZXMgYSBwcmludCBmdW5jdGlvbi4nKTtcclxuXHJcbiAgICAgICAgdGhpcy4jcHJpbnQgPSBvcHRpb25zLnByaW50O1xyXG4gICAgICAgIHRoaXMuI3Nob3dDb2xvcnMgPSBvcHRpb25zLmNvbG9yID8/IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuI2Fsd2F5c0xpc3RQZW5kaW5nU3BlY3MgPSBvcHRpb25zLmFsd2F5c0xpc3RQZW5kaW5nU3BlY3MgPz8gdHJ1ZTtcclxuICAgICAgICB0aGlzLiNsaXN0Tm90QXBwbGljYWJsZVNwZWNzID0gb3B0aW9ucy5saXN0Tm90QXBwbGljYWJsZVNwZWNzID8/IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuI3N0YWNrRmlsdGVyID0gb3B0aW9ucy5zdGFja0ZpbHRlciA/PyAoc3RhY2sgPT4gc3RhY2spO1xyXG4gICAgICAgIHRoaXMuI2ZhaWxlZFNwZWNzID0gW107XHJcbiAgICAgICAgdGhpcy4jcGVuZGluZ1NwZWNzID0gW107XHJcbiAgICAgICAgdGhpcy4jbm90QXBwbGljYWJsZVNwZWNzID0gW107XHJcbiAgICAgICAgdGhpcy4jZmFpbGVkU3VpdGVzID0gW107XHJcbiAgICAgICAgdGhpcy4jb3V0cHV0UXVldWUgPSBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBqYXNtaW5lU3RhcnRlZChvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5zcGVjQ291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuZXhlY3V0YWJsZVNwZWNDb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5mYWlsdXJlQ291bnQgPSAwO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucz8ub3JkZXI/LnJhbmRvbSkge1xyXG4gICAgICAgICAgICB0aGlzLiN3cml0ZShgUmFuZG9taXplZCB3aXRoIHNlZWQgJHtvcHRpb25zLm9yZGVyLnNlZWR9YCk7XHJcbiAgICAgICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy4jd3JpdGUoJ1N0YXJ0ZWQnKTtcclxuICAgICAgICB0aGlzLiNwcmludE5ld2xpbmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBzcGVjRG9uZShyZXN1bHQpIHtcclxuICAgICAgICB0aGlzLnNwZWNDb3VudCsrO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKHJlc3VsdC5zdGF0dXMpIHtcclxuICAgICAgICBjYXNlICdwZW5kaW5nJzpcclxuICAgICAgICAgICAgdGhpcy4jcGVuZGluZ1NwZWNzLnB1c2gocmVzdWx0KTtcclxuICAgICAgICAgICAgdGhpcy5leGVjdXRhYmxlU3BlY0NvdW50Kys7XHJcbiAgICAgICAgICAgIHRoaXMuI3dyaXRlKHRoaXMuI2NvbG9yZWQoJ3llbGxvdycsICcqJykpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnbm90QXBwbGljYWJsZSc6XHJcbiAgICAgICAgICAgIHRoaXMuI25vdEFwcGxpY2FibGVTcGVjcy5wdXNoKHJlc3VsdCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXhlY3V0YWJsZVNwZWNDb3VudCsrO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAncGFzc2VkJzpcclxuICAgICAgICAgICAgdGhpcy5leGVjdXRhYmxlU3BlY0NvdW50Kys7XHJcbiAgICAgICAgICAgIHRoaXMuI3dyaXRlKHRoaXMuI2NvbG9yZWQoJ2dyZWVuJywgJy4nKSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdmYWlsZWQnOlxyXG4gICAgICAgICAgICB0aGlzLmZhaWx1cmVDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLiNmYWlsZWRTcGVjcy5wdXNoKHJlc3VsdCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXhlY3V0YWJsZVNwZWNDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLiN3cml0ZSh0aGlzLiNjb2xvcmVkKCdyZWQnLCAnRicpKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN1aXRlRG9uZShyZXN1bHQpIHtcclxuICAgICAgICBpZiAocmVzdWx0LmZhaWxlZEV4cGVjdGF0aW9ucz8ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmZhaWx1cmVDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLiNmYWlsZWRTdWl0ZXMucHVzaChyZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBqYXNtaW5lRG9uZShyZXN1bHQpIHtcclxuICAgICAgICBpZiAocmVzdWx0LmZhaWxlZEV4cGVjdGF0aW9ucylcclxuICAgICAgICAgICAgdGhpcy5mYWlsdXJlQ291bnQgKz0gcmVzdWx0LmZhaWxlZEV4cGVjdGF0aW9ucy5sZW5ndGg7XHJcblxyXG4gICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG4gICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy4jZmFpbGVkU3BlY3MubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoJ0ZhaWx1cmVzOicpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuI2ZhaWxlZFNwZWNzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICB0aGlzLiNzcGVjRmFpbHVyZURldGFpbHModGhpcy4jZmFpbGVkU3BlY3NbaV0sIGkgKyAxKTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBmYWlsZWRTdWl0ZSBvZiB0aGlzLiNmYWlsZWRTdWl0ZXMpXHJcbiAgICAgICAgICAgIHRoaXMuI3N1aXRlRmFpbHVyZURldGFpbHMoZmFpbGVkU3VpdGUpO1xyXG5cclxuICAgICAgICBpZiAocmVzdWx0LmZhaWxlZEV4cGVjdGF0aW9ucz8ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLiNzdWl0ZUZhaWx1cmVEZXRhaWxzKHtcclxuICAgICAgICAgICAgICAgIGZ1bGxOYW1lOiAndG9wIHN1aXRlJyxcclxuICAgICAgICAgICAgICAgIC4uLnJlc3VsdCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy4jYWx3YXlzTGlzdFBlbmRpbmdTcGVjcyB8fCByZXN1bHQub3ZlcmFsbFN0YXR1cyA9PT0gJ3Bhc3NlZCcpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuI3BlbmRpbmdTcGVjcy5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgdGhpcy4jd3JpdGUoJ1BlbmRpbmc6Jyk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuI3BlbmRpbmdTcGVjcy5sZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgIHRoaXMuI3BlbmRpbmdTcGVjRGV0YWlscyh0aGlzLiNwZW5kaW5nU3BlY3NbaV0sIGkgKyAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuI3ByaW50Tm90QXBwbGljYWJsZVNwZWNzKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNwZWNDb3VudCA+IDApXHJcbiAgICAgICAgICAgIHRoaXMuI3ByaW50U3VtbWFyeSgpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoJ05vIHNwZWNzIGZvdW5kJyk7XHJcblxyXG4gICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG5cclxuICAgICAgICBjb25zdCBzZWNvbmRzID0gcmVzdWx0Py50b3RhbFRpbWUgLyAxMDAwIHx8IDA7XHJcbiAgICAgICAgdGhpcy4jd3JpdGUoYEZpbmlzaGVkIGluICR7c2Vjb25kc30gJHtwbHVyYWwoJ3NlY29uZCcsIHNlY29uZHMpfWApO1xyXG4gICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG5cclxuICAgICAgICBpZiAocmVzdWx0Py5vdmVyYWxsU3RhdHVzID09PSAnaW5jb21wbGV0ZScpIHtcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoYEluY29tcGxldGU6ICR7cmVzdWx0LmluY29tcGxldGVSZWFzb259YCk7XHJcbiAgICAgICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHJlc3VsdD8ub3JkZXI/LnJhbmRvbSkge1xyXG4gICAgICAgICAgICB0aGlzLiN3cml0ZShgUmFuZG9taXplZCB3aXRoIHNlZWQgJHtyZXN1bHQub3JkZXIuc2VlZH1gKTtcclxuICAgICAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhd2FpdCB0aGlzLiNvdXRwdXRRdWV1ZTtcclxuICAgIH1cclxuXHJcbiAgICAjd3JpdGUodGV4dCkge1xyXG4gICAgICAgIHRoaXMuI291dHB1dFF1ZXVlID0gdGhpcy4jb3V0cHV0UXVldWUudGhlbigoKSA9PiB0aGlzLiNwcmludCh0ZXh0KSk7XHJcbiAgICB9XHJcblxyXG4gICAgI3ByaW50TmV3bGluZSgpIHtcclxuICAgICAgICB0aGlzLiN3cml0ZSgnXFxuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgI2NvbG9yZWQoY29sb3IsIHRleHQpIHtcclxuICAgICAgICBpZiAoIXRoaXMuI3Nob3dDb2xvcnMpXHJcbiAgICAgICAgICAgIHJldHVybiB0ZXh0O1xyXG5cclxuICAgICAgICByZXR1cm4gYW5zaVtjb2xvcl0gKyB0ZXh0ICsgYW5zaS5ub25lO1xyXG4gICAgfVxyXG5cclxuICAgICNzcGVjRmFpbHVyZURldGFpbHMocmVzdWx0LCBmYWlsZWRTcGVjTnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgdGhpcy4jd3JpdGUoYCR7ZmFpbGVkU3BlY051bWJlcn0pICR7cmVzdWx0LmZ1bGxOYW1lfWApO1xyXG4gICAgICAgIHRoaXMuI3ByaW50RmFpbGVkRXhwZWN0YXRpb25zKHJlc3VsdCk7XHJcblxyXG4gICAgICAgIGlmICghcmVzdWx0LmRlYnVnTG9ncylcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLiNwcmludE5ld2xpbmUoKTtcclxuICAgICAgICB0aGlzLiN3cml0ZShpbmRlbnQoJ0RlYnVnIGxvZ3M6JywgMikpO1xyXG4gICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHJlc3VsdC5kZWJ1Z0xvZ3MpIHtcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoaW5kZW50KGAke2VudHJ5LnRpbWVzdGFtcH1tczogJHtlbnRyeS5tZXNzYWdlfWAsIDQpKTtcclxuICAgICAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICNzdWl0ZUZhaWx1cmVEZXRhaWxzKHJlc3VsdCkge1xyXG4gICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG4gICAgICAgIHRoaXMuI3dyaXRlKGBTdWl0ZSBlcnJvcjogJHtyZXN1bHQuZnVsbE5hbWV9YCk7XHJcbiAgICAgICAgdGhpcy4jcHJpbnRGYWlsZWRFeHBlY3RhdGlvbnMocmVzdWx0KTtcclxuICAgIH1cclxuXHJcbiAgICAjcHJpbnRGYWlsZWRFeHBlY3RhdGlvbnMocmVzdWx0KSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBmYWlsZWRFeHBlY3RhdGlvbiBvZiByZXN1bHQuZmFpbGVkRXhwZWN0YXRpb25zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG4gICAgICAgICAgICB0aGlzLiN3cml0ZShpbmRlbnQoJ01lc3NhZ2U6JywgMikpO1xyXG4gICAgICAgICAgICB0aGlzLiNwcmludE5ld2xpbmUoKTtcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoXHJcbiAgICAgICAgICAgICAgICB0aGlzLiNjb2xvcmVkKFxyXG4gICAgICAgICAgICAgICAgICAgICdyZWQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGluZGVudChmYWlsZWRFeHBlY3RhdGlvbi5tZXNzYWdlLCA0KSxcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG4gICAgICAgICAgICB0aGlzLiN3cml0ZShpbmRlbnQoJ1N0YWNrOicsIDIpKTtcclxuICAgICAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgICAgIHRoaXMuI3dyaXRlKFxyXG4gICAgICAgICAgICAgICAgaW5kZW50KHRoaXMuI3N0YWNrRmlsdGVyKGZhaWxlZEV4cGVjdGF0aW9uLnN0YWNrKSwgNCksXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIHJlc3VsdC5mYWlsZWRFeHBlY3RhdGlvbnMubGVuZ3RoID09PSAwXHJcbiAgICAgICAgICAgICYmIHJlc3VsdC5wYXNzZWRFeHBlY3RhdGlvbnMubGVuZ3RoID09PSAwXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG4gICAgICAgICAgICB0aGlzLiN3cml0ZShpbmRlbnQoJ01lc3NhZ2U6JywgMikpO1xyXG4gICAgICAgICAgICB0aGlzLiNwcmludE5ld2xpbmUoKTtcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoXHJcbiAgICAgICAgICAgICAgICB0aGlzLiNjb2xvcmVkKFxyXG4gICAgICAgICAgICAgICAgICAgICdyZWQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGluZGVudCgnU3BlYyBoYXMgbm8gZXhwZWN0YXRpb25zJywgNCksXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICB9XHJcblxyXG4gICAgI3BlbmRpbmdTcGVjRGV0YWlscyhyZXN1bHQsIHBlbmRpbmdTcGVjTnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgdGhpcy4jd3JpdGUoYCR7cGVuZGluZ1NwZWNOdW1iZXJ9KSAke3Jlc3VsdC5mdWxsTmFtZX1gKTtcclxuICAgICAgICB0aGlzLiNwcmludE5ld2xpbmUoKTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVhc29uID0gcmVzdWx0LnBlbmRpbmdSZWFzb24gfHwgJ05vIHJlYXNvbiBnaXZlbic7XHJcblxyXG4gICAgICAgIHRoaXMuI3dyaXRlKGluZGVudCh0aGlzLiNjb2xvcmVkKCd5ZWxsb3cnLCByZWFzb24pLCAyKSk7XHJcbiAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICB9XHJcblxyXG4gICAgI3ByaW50Tm90QXBwbGljYWJsZVNwZWNzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLiNub3RBcHBsaWNhYmxlU3BlY3MubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IGJ5UmVhc29uID0ge307XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgc3BlYyBvZiB0aGlzLiNub3RBcHBsaWNhYmxlU3BlY3MpIHtcclxuICAgICAgICAgICAgY29uc3QgcmVhc29uID0gc3BlYy5ub3RBcHBsaWNhYmxlUmVhc29uO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFieVJlYXNvbltyZWFzb25dKVxyXG4gICAgICAgICAgICAgICAgYnlSZWFzb25bcmVhc29uXSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgYnlSZWFzb25bcmVhc29uXS5wdXNoKHNwZWMuZnVsbE5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgW3JlYXNvbiwgc3BlY05hbWVzXSBvZiBPYmplY3QuZW50cmllcyhieVJlYXNvbikpIHtcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoXHJcbiAgICAgICAgICAgICAgICBgJHtzcGVjTmFtZXMubGVuZ3RofSAke3BsdXJhbCgnc3BlYycsIHNwZWNOYW1lcy5sZW5ndGgpfWBcclxuICAgICAgICAgICAgICAgICsgYCBub3QgYXBwbGljYWJsZSBiZWNhdXNlOiAke3JlYXNvbn1gLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB0aGlzLiNwcmludE5ld2xpbmUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy4jbGlzdE5vdEFwcGxpY2FibGVTcGVjcylcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHNwZWNOYW1lcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4jd3JpdGUoYCAgICogJHtuYW1lfWApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgI3ByaW50U3VtbWFyeSgpIHtcclxuICAgICAgICB0aGlzLiNwcmludE5ld2xpbmUoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZXhlY3V0YWJsZVNwZWNDb3VudCAhPT0gdGhpcy5zcGVjQ291bnQpIHtcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoXHJcbiAgICAgICAgICAgICAgICBgUmFuICR7dGhpcy5leGVjdXRhYmxlU3BlY0NvdW50fSBvZiAke3RoaXMuc3BlY0NvdW50fWBcclxuICAgICAgICAgICAgICAgICsgcGx1cmFsKCcgc3BlYycsIHRoaXMuc3BlY0NvdW50KSxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc3VtbWFyeVxyXG4gICAgICAgICAgICA9IGAke3RoaXMuZXhlY3V0YWJsZVNwZWNDb3VudH0gYFxyXG4gICAgICAgICAgICArIGAke3BsdXJhbCgnc3BlYycsIHRoaXMuZXhlY3V0YWJsZVNwZWNDb3VudCl9LCBgXHJcbiAgICAgICAgICAgICsgYCR7dGhpcy5mYWlsdXJlQ291bnR9IGBcclxuICAgICAgICAgICAgKyBwbHVyYWwoJ2ZhaWx1cmUnLCB0aGlzLmZhaWx1cmVDb3VudCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLiNwZW5kaW5nU3BlY3MubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnlcclxuICAgICAgICAgICAgICAgICs9IGAsICR7dGhpcy4jcGVuZGluZ1NwZWNzLmxlbmd0aH0gcGVuZGluZyBgXHJcbiAgICAgICAgICAgICAgICArIHBsdXJhbCgnc3BlYycsIHRoaXMuI3BlbmRpbmdTcGVjcy5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy4jd3JpdGUoc3VtbWFyeSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBsdXJhbCh0ZXh0LCBjb3VudCkge1xyXG4gICAgcmV0dXJuIGNvdW50ID09PSAxID8gdGV4dCA6IGAke3RleHR9c2A7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluZGVudCh0ZXh0LCBzcGFjZXMpIHtcclxuICAgIGNvbnN0IHByZWZpeCA9ICcgJy5yZXBlYXQoc3BhY2VzKTtcclxuXHJcbiAgICByZXR1cm4gKHRleHQgfHwgJycpXHJcbiAgICAgICAgLnNwbGl0KCdcXG4nKVxyXG4gICAgICAgIC5tYXAobGluZSA9PiBwcmVmaXggKyBsaW5lKVxyXG4gICAgICAgIC5qb2luKCdcXG4nKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ3VzdG9tUmVwb3J0ZXI7XHJcbiIsICJpbXBvcnQgeyBleGl0QXBwLCB3cml0ZVByb2Nlc3NPdXRwdXQgfSBmcm9tICcuL3NoYXJlZC9uZXV0cmFsaW5vQWRhcHRlci5qcyc7XHJcbmltcG9ydCBDdXN0b21SZXBvcnRlciBmcm9tICcuL3NoYXJlZC90ZXN0aW5nL2N1c3RvbVJlcG9ydGVyLmpzJztcclxuXHJcbmNvbnN0IFJFU1VMVF9QUkVGSVggPSAnQFRFU1RfUkVTVUxUOic7XHJcbmNvbnN0IE9VVFBVVF9QUkVGSVggPSAnQFRFU1RfT1VUUFVUOic7XHJcblxyXG5mdW5jdGlvbiBnZXRBcmd1bWVudChuYW1lKSB7XHJcbiAgICBjb25zdCBwcmVmaXggPSBgJHtuYW1lfT1gO1xyXG4gICAgY29uc3QgYXJndW1lbnQgPSBOTF9BUkdTLmZpbmQoYXJnID0+IGFyZy5zdGFydHNXaXRoKHByZWZpeCkpO1xyXG4gICAgcmV0dXJuIGFyZ3VtZW50Py5zbGljZShwcmVmaXgubGVuZ3RoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U3VpdGVJZCgpIHtcclxuICAgIGNvbnN0IHRhcmdldFN1aXRlID0gZ2V0QXJndW1lbnQoJy0tdGVzdC1zdWl0ZScpO1xyXG4gICAgY29uc3QgdG9wID0gamFzbWluZS5nZXRFbnYoKS50b3BTdWl0ZSgpO1xyXG4gICAgZm9yIChjb25zdCBzdWl0ZSBvZiB0b3AuY2hpbGRyZW4gfHwgW10pIHtcclxuICAgICAgICBpZiAoc3VpdGUuZGVzY3JpcHRpb24gPT09IHRhcmdldFN1aXRlKVxyXG4gICAgICAgICAgICByZXR1cm4gc3VpdGUuaWQ7XHJcbiAgICB9XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFRlc3Qgc3VpdGUgbm90IGZvdW5kOiAke3RhcmdldFN1aXRlfWApO1xyXG59XHJcblxyXG5mdW5jdGlvbiB2ZXJpZnlUZXN0RW52aXJvbm1lbnQoKSB7XHJcbiAgICBpZiAoTkxfQVBQSUQgPT09ICdjYXJkbWFnaWNpYW4udGVzdCcpIHJldHVybjtcclxuICAgIHRocm93IG5ldyBFcnJvcihgQ2FuY2VsaW5nIHNtb2tlIHRlc3RzIHdpdGggdW5zdXBwb3J0ZWQgYXBwSWQgXCIke05MX0FQUElEfVwiLmApO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBydW5UZXN0cygpIHtcclxuICAgIGxvZygnc3RhcnR1cCcpLmluZm8oJ0luaXRpYWxpemluZyBuZXV0cmFsaW5vJyk7XHJcbiAgICBOZXV0cmFsaW5vLmluaXQoKTtcclxuXHJcbiAgICBsb2coJ3N0YXJ0dXAnKS5pbmZvKCdWZXJpZnlpbmcgdGVzdCBlbnZpcm9ubWVudCcpO1xyXG4gICAgdmVyaWZ5VGVzdEVudmlyb25tZW50KCk7XHJcblxyXG4gICAgbG9nKCdzdGFydHVwJykuaW5mbygnQ2xlYXJpbmcgbmV1dHJhbGlubyBzdG9yYWdlJyk7XHJcbiAgICBhd2FpdCBOZXV0cmFsaW5vLnN0b3JhZ2UuY2xlYXIoKTtcclxuXHJcbiAgICBsb2coJ3N0YXJ0dXAnKS5pbmZvKCdFeGVjdXRpbmcgamFzbWluZSB0ZXN0cycpO1xyXG4gICAgY29uc3Qgc3VpdGVJZCA9IGdldFN1aXRlSWQoKTtcclxuICAgIGF3YWl0IGphc21pbmUuZ2V0RW52KCkuZXhlY3V0ZShbc3VpdGVJZF0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwcmludChtZXNzYWdlKSB7XHJcbiAgICB3cml0ZVByb2Nlc3NPdXRwdXQoT1VUUFVUX1BSRUZJWCArIEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZSB9KSArICdcXG4nKTtcclxufVxyXG5cclxuamFzbWluZS5nZXRFbnYoKS5hZGRSZXBvcnRlcihcclxuICAgIG5ldyBDdXN0b21SZXBvcnRlcih7IHByaW50LCBjb2xvcjogdHJ1ZSB9KVxyXG4pO1xyXG5cclxuamFzbWluZS5nZXRFbnYoKS5hZGRSZXBvcnRlcih7XHJcbiAgICBhc3luYyBqYXNtaW5lRG9uZShyZXN1bHQpIHtcclxuICAgICAgICBjb25zdCBvdXRwdXQgPSBKU09OLnN0cmluZ2lmeSh7IHN0YXR1czogcmVzdWx0Lm92ZXJhbGxTdGF0dXMgfSk7XHJcbiAgICAgICAgYXdhaXQgd3JpdGVQcm9jZXNzT3V0cHV0KFJFU1VMVF9QUkVGSVggKyBvdXRwdXQgKyAnXFxuJyk7XHJcbiAgICAgICAgaWYgKCFOTF9BUkdTLmluY2x1ZGVzKCctLXN0YXktb3BlbicpKSBjbG9zZSgpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCAoKSA9PiB7XHJcbiAgICBleGl0QXBwKCk7XHJcbn0pO1xyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NtLWxvYWRlZCcsICgpID0+IHtcclxuICAgIHJ1blRlc3RzKCk7XHJcbn0pO1xyXG5cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsV0FBUyxXQUFXLE1BQU07QUFDdEIsT0FBRyw0QkFBNEIsTUFBTTtBQUNqQyxhQUFPLFNBQVMsY0FBYyxjQUFjLENBQUMsRUFBRSxJQUFJLFNBQVM7QUFDNUQsYUFBTyxTQUFTLGNBQWMsaUJBQWlCLENBQUMsRUFBRSxJQUFJLFNBQVM7QUFDL0QsYUFBTyxTQUFTLGNBQWMsYUFBYSxDQUFDLEVBQUUsSUFBSSxTQUFTO0FBQzNELGFBQU8sU0FBUyxjQUFjLGNBQWMsQ0FBQyxFQUFFLElBQUksU0FBUztBQUM1RCxhQUFPLFNBQVMsY0FBYyxtQkFBbUIsQ0FBQyxFQUFFLElBQUksU0FBUztBQUFBLElBQ3JFLENBQUM7QUFBQSxFQUNMLENBQUM7OztBQ3VDRCxpQkFBc0IsU0FBUyxNQUFNO0FBQ2pDLFFBQUksSUFBSSxFQUFFLE1BQU0sWUFBWSxJQUFJO0FBQ2hDLFdBQU8sTUFBTSxXQUFXLFdBQVcsU0FBUyxJQUFJO0FBQUEsRUFDcEQ7QUFFQSxpQkFBc0IsVUFBVSxNQUFNLE1BQU07QUFDeEMsUUFBSSxJQUFJLEVBQUUsTUFBTSxhQUFhLE1BQU0sR0FBRyxLQUFLLE1BQU0sUUFBUTtBQUN6RCxVQUFNLEVBQUUsV0FBVyxJQUFJLE1BQU0sV0FBVyxXQUFXLGFBQWEsSUFBSTtBQUNwRSxVQUFNLGdCQUFnQixVQUFVO0FBQ2hDLFVBQU0sV0FBVyxXQUFXLFVBQVUsTUFBTSxJQUFJO0FBQUEsRUFDcEQ7QUF3QkEsaUJBQXNCLFNBQVMsTUFBTTtBQUNqQyxRQUFJLElBQUksRUFBRSxNQUFNLFlBQVksSUFBSTtBQUNoQyxXQUFPLE1BQU0sV0FBVyxXQUFXLFNBQVMsSUFBSTtBQUFBLEVBQ3BEO0FBRUEsaUJBQXNCLGlCQUFpQixPQUFPO0FBQzFDLFFBQUksSUFBSSxFQUFFLE1BQU0saUJBQWlCLEtBQUs7QUFDdEMs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QUUsWUFBWTtBQUFBLElBQ3pCLE1BQU0sWUFBWSxRQUFRO0FBQ3RCLFlBQU0sU0FBUyxLQUFLLFVBQVUsRUFBRSxRQUFRLE9BQU8sY0FBYyxDQUFDO0FBQzlELFlBQU0sbUJBQW1CLGdCQUFnQixTQUFTLElBQUk7QUFDdEQsVUFBSSxDQUFDLFFBQVEsU0FBUyxhQUFhLEVBQUcsT0FBTTtBQUFBLElBQ2hEO0FBQUEsRUFDSixDQUFDO0FBRUQsU0FBTyxpQkFBaUIsZ0JBQWdCLE1BQU07QUFDMUMsWUFBUTtBQUFBLEVBQ1osQ0FBQztBQUVELFNBQU8saUJBQWlCLGFBQWEsTUFBTTtBQUN2QyxhQUFTO0FBQUEsRUFDYixDQUFDOyIsCiAgIm5hbWVzIjogWyJhZGFwdGVycyIsICJzdHJpbmdpZnkiLCAicmVzIiwgInJlcyIsICJtYXAiLCAic2NoZW1hIiwgIm5vZGUiLCAic2NoZW1hIiwgIml0IiwgImluZGVudCIsICJpbmRlbnQiLCAiaSIsICJlbmQiLCAiaXNCbG9jayIsICJpbmRlbnQiLCAiaW5kZW50IiwgIm1hcCIsICJpdCIsICJ2YWx1ZSIsICJtYXAiLCAic2NoZW1hIiwgInN0cmluZ2lmeSIsICJpbmRlbnQiLCAiY29tbWVudCIsICJzdHIiLCAiaXQiLCAic2NoZW1hIiwgIm1hcCIsICJtYXAiLCAic2NoZW1hIiwgInNjaGVtYSIsICJpdCIsICJzZXEiLCAic2VxIiwgInNjaGVtYSIsICJpbnRJZGVudGlmeSIsICJzY2hlbWEiLCAic2VxIiwgInNjaGVtYSIsICJwYWlycyIsICJpdCIsICJtYXAiLCAic2NoZW1hIiwgInBhaXJzIiwgIm9tYXAiLCAic2VxIiwgImZsb2F0TmFOIiwgImZsb2F0RXhwIiwgImZsb2F0IiwgImludElkZW50aWZ5IiwgImludFJlc29sdmUiLCAibiIsICJpbnRTdHJpbmdpZnkiLCAiaW50T2N0IiwgImludCIsICJpbnRIZXgiLCAic2NoZW1hIiwgInNldCIsICJtYXAiLCAicmVzIiwgInNjaGVtYSIsICJpbnRPY3QiLCAiaW50IiwgImludEhleCIsICJmbG9hdE5hTiIsICJmbG9hdEV4cCIsICJmbG9hdCIsICJzY2hlbWEiLCAidGFncyIsICJtZXJnZSIsICJzY2hlbWEiLCAicmVzIiwgIml0IiwgImluZGVudCIsICJjb21wb3NlTm9kZSIsICJjb21wb3NlRW1wdHlOb2RlIiwgIm1hcCIsICJjb21wb3NlTm9kZSIsICJjb21wb3NlRW1wdHlOb2RlIiwgInNlcSIsICJjb21wb3NlTm9kZSIsICJjb21wb3NlRW1wdHlOb2RlIiwgImlzTWFwIiwgIm1hcCIsICJDTiIsICJ2YWx1ZSIsICJlbmQiLCAiaW5kZW50IiwgInNjaGVtYSIsICJ0YWciLCAiaXQiLCAiU0NBTEFSIiwgImlzQ29sbGVjdGlvbiIsICJpc1NjYWxhciIsICJzdHJpbmdpZnkiLCAidmlzaXQiLCAiaW5kZW50IiwgInN0cmluZ2lmeSIsICJCUkVBSyIsICJTS0lQIiwgIlJFTU9WRSIsICJ2aXNpdCIsICJTQ0FMQVIiLCAiaXNDb2xsZWN0aW9uIiwgImlzU2NhbGFyIiwgImluZGVudCIsICJpIiwgImNoIiwgIlNDQUxBUiIsICJpdCIsICJtYXAiLCAic3RhcnQiLCAic2VxIiwgImluZGVudCIsICJzdHJpbmdpZnkiLCAiaW5kZW50Il0KfQo=
