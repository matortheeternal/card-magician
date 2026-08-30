(() => {
  var __defProp = Object.defineProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  // src/shared/thePrinter.js
  var serializers = [{
    test: (val) => val instanceof Error,
    serialize: (val) => val.stack
  }, {
    test: (val) => typeof val === "function",
    serialize: (val) => `[Function ${val.name || "anonymous"}]`
  }, {
    test: (val) => typeof val === "symbol",
    serialize: (val) => val.toString()
  }, {
    test: (val) => typeof val !== "object" || val === null,
    serialize: (val) => val
  }, {
    test: (val, seen) => seen.has(val),
    serialize: () => "[Circular]"
  }, {
    test: (val) => Array.isArray(val),
    serialize: (val, seen, serialize, depth) => {
      seen.add(val);
      return val.map((v) => serialize(v, depth + 1));
    }
  }, {
    test: () => true,
    serialize: (val, seen, serialize, depth) => {
      seen.add(val);
      const out = {};
      for (const [k, v] of Object.entries(val))
        out[k] = serialize(v, depth + 1);
      return out;
    }
  }];
  function safeStringify(value, maxDepth = 4, maxLength = 1e4) {
    const seen = /* @__PURE__ */ new Set();
    function serialize(val, depth) {
      if (depth > maxDepth) return "[MaxDepth]";
      const serializer = serializers.find((s) => s.test(val, seen));
      if (!serializer) return;
      return serializer.serialize(val, seen, serialize, depth);
    }
    let result;
    try {
      const serializedValue = serialize(value, 0);
      result = typeof serializedValue === "string" ? serializedValue : JSON.stringify(serializedValue, null, 2);
    } catch (error) {
      console.error(error);
      return "[Unserializable]";
    }
    if (result && result.length > maxLength)
      return result.slice(0, maxLength) + "\n[Truncated]";
    return result;
  }

  // src/shared/neutralinoAdapter.js
  var levelToLogType = {
    info: "INFO",
    warn: "WARNING",
    error: "ERROR"
  };
  async function debugLog(level, message, args) {
    const type = levelToLogType[level] ?? "INFO";
    const messageWithArgs = message + args.map((arg) => {
      return `
${safeStringify(arg)}`;
    }).join("");
    return await Neutralino.debug.log(messageWithArgs, type);
  }
  async function readDirectory(path, options) {
    log("fs").debug("readDirectory", path, options);
    return await Neutralino.filesystem.readDirectory(path, options);
  }
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
  async function createDirectory(path) {
    log("fs").debug("createDirectory", path);
    try {
      await Neutralino.filesystem.createDirectory(path);
    } catch (error) {
      if (error.code !== "NE_FS_DIRCRER")
        throw new Error(`${error.code} ${error.message}`);
    }
  }
  async function mount(path, target) {
    log("fs").debug("mount", path, target);
    try {
      await Neutralino.server.mount(path, target);
    } catch (error) {
      if (error.code !== "NE_SR_MPINUSE")
        throw new Error(`${error.code} ${error.message}`);
    }
  }
  function writeProcessOutput(data) {
    return Neutralino.app.writeProcessOutput(data);
  }
  function exitApp(code = 0) {
    Neutralino.app.exit(code);
  }

  // src/shared/log.js
  var isDebugMode = NL_ARGS.includes("--debug");
  var log2 = [];
  var loggers = {};
  var logGroups = {};
  function addLogGroup(groupKey, color) {
    logGroups[groupKey] = { color };
  }
  function logMessage(level, groupKey, message, ...args) {
    const timestamp2 = /* @__PURE__ */ new Date();
    const colorExpr = `color: ${logGroups[groupKey]?.color ?? "inherit"}`;
    console[level](`%c[${groupKey}] ${message}`, colorExpr, ...args);
    if (level === "debug" && !isDebugMode) return;
    log2.push({ level, groupKey, message, args, timestamp: timestamp2 });
    debugLog(level, `[${groupKey}] ${message}`, args).catch(() => {
    });
  }
  window.log = function(groupKey) {
    return loggers[groupKey] ?? (loggers[groupKey] = {
      debug: (msg, ...args) => logMessage("debug", groupKey, msg, ...args),
      info: (msg, ...args) => logMessage("info", groupKey, msg, ...args),
      warn: (msg, ...args) => logMessage("warn", groupKey, msg, ...args),
      error: (msg, ...args) => logMessage("error", groupKey, msg, ...args)
    });
  };
  addLogGroup("startup", "goldenrod");
  addLogGroup("fs", "coral");
  addLogGroup("cache", "grey");
  addLogGroup("user", "khaki");
  addLogGroup("render", "turquoise");
  addLogGroup("state", "violet");
  addLogGroup("export", "black");
  addLogGroup("plugin", "lightgreen");

  // src/shared/prototypeExtensions.js
  function addPrototypeFunction(ctor, name, descriptor) {
    if (typeof ctor !== "function" || !ctor.prototype)
      throw new TypeError("First argument must be a constructor function");
    if (typeof name !== "string")
      throw new TypeError("Second argument must be a string");
    if (Object.prototype.hasOwnProperty.call(ctor.prototype, name)) {
      log("startup").warn(`${ctor.name}.prototype.${name} already defined \u2014 skipping.`);
      return;
    }
    const finalDescriptor = Object.assign(
      { writable: true, configurable: true, enumerable: false },
      descriptor
    );
    Object.defineProperty(ctor.prototype, name, finalDescriptor);
  }
  addPrototypeFunction(String, "separate", {
    value: function separate(separator = " ") {
      return this.replace(/([a-z])([A-Z])/g, `$1${separator}$2`);
    }
  });
  addPrototypeFunction(String, "normalizeWords", {
    value: function normalizeWords(sep = /[^a-z0-9]+/gi) {
      if (!(sep instanceof RegExp))
        throw new TypeError("separator must be a RegExp");
      return this.toLowerCase().replaceAll(sep, " ").trim();
    }
  });
  addPrototypeFunction(String, "toTitleCase", {
    value: function toTitleCase() {
      return this.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
  });
  addPrototypeFunction(String, "toCamelCase", {
    value: function toCamelCase() {
      return this.split(/\s+/).map(
        (w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)
      ).join("");
    }
  });
  addPrototypeFunction(Object, "except", {
    value: function except(...keysToExclude) {
      return Object.fromEntries(
        Object.entries(this).filter(([key]) => !keysToExclude.includes(key))
      );
    }
  });
  addPrototypeFunction(Array, "remove", {
    value: function remove(item) {
      const index = this.indexOf(item);
      if (index > -1) this.splice(index, 1);
      return this;
    }
  });
  addPrototypeFunction(Array, "zip", {
    value: function zip(otherArray) {
      const res = [];
      for (let i = 0; i < this.length && i < otherArray.length; i++)
        res.push([this[i], otherArray[i]]);
      return res;
    }
  });
  addPrototypeFunction(Array, "toDictionary", {
    value: function toDictionary(keyCallback) {
      return this.reduce((dictionary, item) => {
        const key = keyCallback(item);
        if (Object.hasOwn(dictionary, key))
          throw new Error(`Encountered duplicate key ${key}`);
        dictionary[key] = item;
        return dictionary;
      }, {});
    }
  });
  addPrototypeFunction(Function, "debounce", {
    value: function debounce(delay) {
      let timeout = null;
      let context = null;
      let args = null;
      const func = this;
      const invoke = function() {
        timeout = null;
        return func.apply(context, args);
      };
      const debounced = function() {
        context = this;
        args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(invoke, delay);
      };
      Object.defineProperty(debounced, "cancel", {
        value: function cancel() {
          clearTimeout(timeout);
          timeout = null;
          context = null;
          args = null;
        }
      });
      Object.defineProperty(debounced, "flush", {
        value: function flush() {
          if (timeout === null) return;
          clearTimeout(timeout);
          return invoke();
        }
      });
      return debounced;
    }
  });

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

  // src/shared/htmlUtils.js
  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // src/shared/Localization.js
  var CURRENT_SCHEMA_VERSION = 1;
  var Localization = class _Localization {
    static async load(localeId, metadata = {}) {
      const filePath = `locales/${localeId}.yml`;
      const text = await readFile(filePath);
      return new _Localization(localeId, text, metadata);
    }
    static get totalKeys() {
      if (!this.schema) return null;
      return Object.values(this.schema).flatMap((entries) => {
        return Object.values(entries);
      }).length;
    }
    constructor(localeId, text = "", metadata = {}) {
      this.id = localeId;
      this.data = browser_default.parse(text) || {};
      this.addMissingKeys();
      this.text = this.stringify();
      this.label = metadata?.label || "New Locale";
      this.created = metadata?.created || /* @__PURE__ */ new Date();
      this.updated = metadata?.updated || void 0;
      this.schemaVersion = metadata?.schemaVersion || CURRENT_SCHEMA_VERSION;
      this.contributors = metadata?.contributors || "";
    }
    addMissingKeys() {
      var _a, _b;
      const schemaEntries = Object.entries(this.constructor.schema);
      for (const [namespaceKey, entries] of schemaEntries) {
        (_a = this.data)[namespaceKey] || (_a[namespaceKey] = {});
        for (const key in entries)
          (_b = this.data[namespaceKey])[key] || (_b[key] = null);
      }
    }
    stringify() {
      return browser_default.stringify(this.data, null, { nullStr: "" });
    }
    resolve(namespaceKey, key, values) {
      const namespace = this.data[namespaceKey];
      const template = namespace?.[key];
      if (!template) return null;
      return escapeHTML(template.replace(/%\{(\d+)}/g, (_, index) => {
        return values[index];
      }));
    }
    get fields() {
      const L = localize("edit-locales-modal");
      return [
        { id: "id", label: L`Locale ID` },
        { id: "label", label: L`Label` },
        {
          id: "contributors",
          placeholder: L`Your name here`,
          label: L`Contributors`
        },
        { id: "text", label: L`Text`, type: "code", syntax: "yaml" }
      ];
    }
    get metadata() {
      return {
        label: this.label,
        created: this.created,
        updated: this.updated,
        percentComplete: this.percentCompleted,
        schemaVersion: this.schemaVersion,
        contributors: this.contributors
      };
    }
    get percentComplete() {
      const ratio = this.completedCount / this.constructor.totalKeys;
      return `${Math.floor(ratio * 100)}%`;
    }
    get completedCount() {
      return Object.values(this.data).flatMap((entries) => {
        return Object.values(entries);
      }).length;
    }
    get name() {
      return `${this.label} (${this.id}.yml)`;
    }
    async save() {
      const filePath = `locales/${this.id}.yml`;
      await writeFile(filePath, this.raw);
    }
  };

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

  // src/shared/localize.js
  var generateSchema = NL_ARGS.includes("--localize");
  var schemaPromise = loadSchema();
  var localesPromise = loadLocales();
  var activeLocalization = null;
  async function loadLocales() {
    const manifestPath = `locales/locales.json`;
    const manifestStr = await readFile(manifestPath);
    const manifest = JSON.parse(manifestStr);
    const dirEntries = await readDirectory("locales");
    const availableFiles = dirEntries.filter((e) => e.type === "FILE" && e.entry.endsWith(".yml")).map((e) => e.entry.slice(0, -4));
    return Promise.all(
      Object.entries(manifest).filter(([key]) => {
        return availableFiles.includes(key);
      }).map(([key, value]) => {
        return Localization.load(key, value);
      })
    );
  }
  function resolveFallbackStr(strings, values) {
    return strings[0] + values.map((v, i) => {
      return `${v}${strings[i + 1]}`;
    }).join("");
  }
  function buildLocalizationKey(strings, values) {
    return strings[0] + values.map((v, i) => {
      return `%{${i}}${strings[i + 1]}`;
    }).join("");
  }
  var writeSchemaFile = (async function writeSchemaFile2() {
    const schema4 = await schemaPromise;
    const json = JSON.stringify(schema4, null, 2);
    const outputPath = `locales/schema.json`;
    log("plugin").log(`Writing localization schema to `, outputPath);
    await writeFile(outputPath, json);
  }).debounce(1e3);
  async function updateSchema(namespaceKey, entryKey) {
    const schema4 = await schemaPromise;
    const namespace = schema4[namespaceKey] || (schema4[namespaceKey] = {});
    namespace[entryKey] || (namespace[entryKey] = 0);
    namespace[entryKey] += 1;
    writeSchemaFile();
  }
  async function loadSchema() {
    try {
      const inputPath = `locales/schema.json`;
      if (!await checkFileExists(inputPath)) return {};
      const text = await readFile(inputPath);
      return JSON.parse(text);
    } catch (e) {
      log("plugin").error("Error loading localization schema:", e);
      return {};
    }
  }
  window.localize = function(namespaceKey) {
    return function(strings, ...values) {
      const key = buildLocalizationKey(strings, values);
      if (generateSchema) updateSchema(namespaceKey, key);
      return activeLocalization?.resolve(namespaceKey, key, values) ?? resolveFallbackStr(strings, values);
    };
  };

  // src/domain/import/mse/loadMseFile.js
  var knownMultilineKeys = [
    /^rule_text(_\d)?$/,
    /^flavor_text(_\d)?$/,
    /^notes$/
  ];
  function isEmptyObject(obj) {
    return obj && typeof obj === "object" && Object.keys(obj).length === 0;
  }
  function getType(key) {
    const isMultiline = knownMultilineKeys.some((expr) => expr.test(key));
    return isMultiline ? { type: "multiline" } : {};
  }
  function makeLineObject(match) {
    return {
      depth: match[1].length,
      key: match[2],
      ...getType(match[2]),
      value: match[3].slice(1)
    };
  }
  function findMultilineRoot(parsedLines, targetDepth) {
    for (let i = parsedLines.length - 1; i >= 0; i--) {
      if (parsedLines[i].depth === targetDepth)
        return i;
    }
  }
  function collectMultilineValues(parsedLines, rootIndex) {
    const values = [];
    while (parsedLines.length > rootIndex + 1) {
      const line = parsedLines.pop();
      values.unshift(`${line.key}: ${line.value}`);
    }
    if (parsedLines[rootIndex].value)
      values.unshift(parsedLines[rootIndex].value);
    return values;
  }
  function rollupMultiline(depth, lastValue, parsedLines) {
    const rootIndex = findMultilineRoot(parsedLines, depth - 1);
    parsedLines[rootIndex].type = "multiline";
    parsedLines[rootIndex].value = [
      ...collectMultilineValues(parsedLines, rootIndex),
      lastValue
    ].join("\n");
  }
  function shouldRollup(parsedLines, depth) {
    const prevLine = parsedLines[parsedLines.length - 1];
    return prevLine?.type === "multiline" && prevLine?.depth === depth - 1;
  }
  function parseMseLines(text) {
    const parsedLines = [];
    for (const line of text.trimEnd().split(/\r?\n/)) {
      const match = line.match(/^(\t*)([^\s:]+):([^\n]*)$/);
      if (match && !shouldRollup(parsedLines, match[1].length)) {
        parsedLines.push(makeLineObject(match));
        continue;
      }
      const valueMatch = line.match(/^(\t*)([^\n]*)$/);
      rollupMultiline(valueMatch[1].length, valueMatch[2], parsedLines);
    }
    return parsedLines;
  }
  var valueWriters = [{
    match: (target, key) => Array.isArray(target[key]),
    write: (target, key, value) => target[key].push(value)
  }, {
    match: (target, key) => Object.hasOwn(target, key),
    write: (target, key, value) => target[key] = [target[key], value]
  }, {
    match: () => true,
    write: (target, key, value) => target[key] = value
  }];
  function writeLast(stack) {
    const [key, value] = stack.pop();
    const [, target] = stack[stack.length - 1];
    const writer = valueWriters.find((vw) => vw.match(target, key));
    const finalValue = isEmptyObject(value) ? null : value;
    writer.write(target, key, finalValue);
  }
  function parseMse(text) {
    const root = {};
    const stack = [["root", root]];
    for (const { depth, key, value } of parseMseLines(text)) {
      while (stack.length - 1 > depth) writeLast(stack);
      stack.push([key, value || {}]);
    }
    while (stack.length - 1 > 0) writeLast(stack);
    return root;
  }

  // src/domain/import/mse/loadMseFile.tests.js
  describe("parseMse", () => {
    it("should parse simple values", () => {
      const obj = parseMse("hello: world\n");
      expect(obj).toBeDefined();
      expect(obj.hello).toBe("world");
    });
    it("should parse blank values as null", () => {
      const obj = parseMse("test:\nvalue:\n");
      expect(obj).toBeDefined();
      expect(obj.test).toBe(null);
      expect(obj.value).toBe(null);
    });
    it("should parse objects", () => {
      const obj = parseMse(
        "colors:\n	red: #f00\n	green: #0f0\n	blue: #00f\n"
      );
      expect(obj.colors).toBeDefined();
      expect(obj.colors.red).toBe("#f00");
      expect(obj.colors.green).toBe("#0f0");
      expect(obj.colors.blue).toBe("#00f");
    });
    it("should parse arrays", () => {
      const obj = parseMse(
        "include_file: card blue rabbit\ninclude_file: card red turtle\ninclude_file: card green vulture\ninclude_file: card pink frog\n"
      );
      expect(obj.include_file).toBeDefined();
      expect(obj.include_file.length).toBe(4);
      expect(obj.include_file[0]).toBe("card blue rabbit");
      expect(obj.include_file[1]).toBe("card red turtle");
      expect(obj.include_file[2]).toBe("card green vulture");
      expect(obj.include_file[3]).toBe("card pink frog");
    });
    it("should parse multiline text", () => {
      const obj = parseMse(
        "rules_text:\n	This is some rules text\n	\n	Trample, flying, first strike"
      );
      expect(obj.rules_text).toBeDefined();
      expect(obj.rules_text).toBe(
        "This is some rules text\n\nTrample, flying, first strike"
      );
    });
    it("should parse as multiline text when later lines are value only", () => {
      const obj = parseMse(
        "rules_text:\n	T: Add {G}.\n	\n	Whenever you"
      );
      expect(obj.rules_text).toBeDefined();
      expect(obj.rules_text).toBe(
        "T: Add {G}.\n\nWhenever you"
      );
    });
    it("should parse as multiline text when first lines are value only", () => {
      const obj = parseMse(
        "rules_text:\n	Whenever you\n	\n	T: Add {G}.\n"
      );
      expect(obj.rules_text).toBeDefined();
      expect(obj.rules_text).toBe(
        "Whenever you\n\nT: Add {G}."
      );
    });
    it("should parse ambiguous multiline text as object", () => {
      const obj = parseMse(
        "ambiguous:\n	T: Add {G}.\n"
      );
      expect(obj.ambiguous.T).toBeDefined();
      expect(obj.ambiguous.T).toBe("Add {G}.");
    });
    it("should not rollup unnested", () => {
      const obj = parseMse(
        "multiline:\n	example\n	example\n	example\nhello: world\n"
      );
      expect(obj.multiline).toBeDefined();
      expect(obj.multiline).toBe(
        "example\nexample\nexample"
      );
      expect(obj.hello).toBeDefined();
      expect(obj.hello).toBe("world");
    });
  });

  // src/shared/testing/findTestFiles.js
  async function findTestFiles(dir) {
    const testFiles = [];
    const files = await readDirectory(dir);
    for (const file of files) {
      const path = `${dir}/${file.entry}`;
      if (file.type === "DIRECTORY") {
        if (file.entry === "." || file.entry === "..") continue;
        testFiles.push(...await findTestFiles(path));
      } else if (file.entry.endsWith(".tests.js")) {
        testFiles.push(path);
      }
    }
    return testFiles;
  }

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

  // src/tests.js
  var RESULT_PREFIX = "@TEST_RESULT:";
  var OUTPUT_PREFIX = "@TEST_OUTPUT:";
  async function loadModuleTests() {
    const testFiles = await findTestFiles("modules");
    await mount("/modules", NL_PATH + "/modules");
    for (const file of testFiles)
      await import(`/${file}`);
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
    log("startup").info("Loading module tests");
    await loadModuleTests();
    log("startup").info("Executing jasmine tests");
    await window.executeJasmine();
  }
  function print(message) {
    writeProcessOutput(OUTPUT_PREFIX + JSON.stringify({ message }) + "\n");
  }
  jasmine.getEnv().addReporter(
    new customReporter_default({ print })
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
  runTests();
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3NoYXJlZC90aGVQcmludGVyLmpzIiwgIi4uLy4uL3NyYy9zaGFyZWQvbmV1dHJhbGlub0FkYXB0ZXIuanMiLCAiLi4vLi4vc3JjL3NoYXJlZC9sb2cuanMiLCAiLi4vLi4vc3JjL3NoYXJlZC9wcm90b3R5cGVFeHRlbnNpb25zLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9pbmRleC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvaWRlbnRpdHkuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3Zpc2l0LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9kb2MvZGlyZWN0aXZlcy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvZG9jL2FuY2hvcnMuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2RvYy9hcHBseVJldml2ZXIuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL3RvSlMuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL05vZGUuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL0FsaWFzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy9TY2FsYXIuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2RvYy9jcmVhdGVOb2RlLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy9Db2xsZWN0aW9uLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5Q29tbWVudC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc3RyaW5naWZ5L2ZvbGRGbG93TGluZXMuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlTdHJpbmcuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnkuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlQYWlyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9sb2cuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS95YW1sLTEuMS9tZXJnZS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvYWRkUGFpclRvSlNNYXAuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L25vZGVzL1BhaXIuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlDb2xsZWN0aW9uLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9ub2Rlcy9ZQU1MTWFwLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvY29tbW9uL21hcC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvbm9kZXMvWUFNTFNlcS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL2NvbW1vbi9zZXEuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9jb21tb24vc3RyaW5nLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvY29tbW9uL251bGwuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9jb3JlL2Jvb2wuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9jb3JlL2Zsb2F0LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvY29yZS9pbnQuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS9jb3JlL3NjaGVtYS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL2pzb24vc2NoZW1hLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvYmluYXJ5LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvcGFpcnMuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3NjaGVtYS95YW1sLTEuMS9vbWFwLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvYm9vbC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2Zsb2F0LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvaW50LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvc2V0LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvdGltZXN0YW1wLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEveWFtbC0xLjEvc2NoZW1hLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9zY2hlbWEvdGFncy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc2NoZW1hL1NjaGVtYS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeURvY3VtZW50LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9kb2MvRG9jdW1lbnQuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L2Vycm9ycy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9yZXNvbHZlLXByb3BzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3V0aWwtY29udGFpbnMtbmV3bGluZS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS91dGlsLWZsb3ctaW5kZW50LWNoZWNrLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3V0aWwtbWFwLWluY2x1ZGVzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3Jlc29sdmUtYmxvY2stbWFwLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3Jlc29sdmUtYmxvY2stc2VxLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3Jlc29sdmUtZW5kLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3Jlc29sdmUtZmxvdy1jb2xsZWN0aW9uLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL2NvbXBvc2UtY29sbGVjdGlvbi5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWJsb2NrLXNjYWxhci5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWZsb3ctc2NhbGFyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL2NvbXBvc2Utc2NhbGFyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL3V0aWwtZW1wdHktc2NhbGFyLXBvc2l0aW9uLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9jb21wb3NlL2NvbXBvc2Utbm9kZS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9jb21wb3NlLWRvYy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvY29tcG9zZS9jb21wb3Nlci5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvcGFyc2UvY3N0LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9wYXJzZS9jc3Qtc2NhbGFyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9wYXJzZS9jc3Qtc3RyaW5naWZ5LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9wYXJzZS9jc3QtdmlzaXQuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3BhcnNlL2xleGVyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy95YW1sL2Jyb3dzZXIvZGlzdC9wYXJzZS9saW5lLWNvdW50ZXIuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3lhbWwvYnJvd3Nlci9kaXN0L3BhcnNlL3BhcnNlci5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2Rpc3QvcHVibGljLWFwaS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMveWFtbC9icm93c2VyL2luZGV4LmpzIiwgIi4uLy4uL3NyYy9zaGFyZWQvaHRtbFV0aWxzLmpzIiwgIi4uLy4uL3NyYy9zaGFyZWQvTG9jYWxpemF0aW9uLmpzIiwgIi4uLy4uL3NyYy9zaGFyZWQvZnNVdGlscy5qcyIsICIuLi8uLi9zcmMvc2hhcmVkL2xvY2FsaXplLmpzIiwgIi4uLy4uL3NyYy9kb21haW4vaW1wb3J0L21zZS9sb2FkTXNlRmlsZS5qcyIsICIuLi8uLi9zcmMvZG9tYWluL2ltcG9ydC9tc2UvbG9hZE1zZUZpbGUudGVzdHMuanMiLCAiLi4vLi4vc3JjL3NoYXJlZC90ZXN0aW5nL2ZpbmRUZXN0RmlsZXMuanMiLCAiLi4vLi4vc3JjL3NoYXJlZC90ZXN0aW5nL2N1c3RvbVJlcG9ydGVyLmpzIiwgIi4uLy4uL3NyYy90ZXN0cy5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3Qgc2VyaWFsaXplcnMgPSBbe1xyXG4gICAgdGVzdDogdmFsID0+IHZhbCBpbnN0YW5jZW9mIEVycm9yLFxyXG4gICAgc2VyaWFsaXplOiB2YWwgPT4gdmFsLnN0YWNrXHJcbn0sIHtcclxuICAgIHRlc3Q6IHZhbCA9PiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nLFxyXG4gICAgc2VyaWFsaXplOiB2YWwgPT4gYFtGdW5jdGlvbiAke3ZhbC5uYW1lIHx8ICdhbm9ueW1vdXMnfV1gXHJcbn0sIHtcclxuICAgIHRlc3Q6IHZhbCA9PiB0eXBlb2YgdmFsID09PSAnc3ltYm9sJyxcclxuICAgIHNlcmlhbGl6ZTogdmFsID0+IHZhbC50b1N0cmluZygpXHJcbn0sIHtcclxuICAgIHRlc3Q6IHZhbCA9PiB0eXBlb2YgdmFsICE9PSAnb2JqZWN0JyB8fCB2YWwgPT09IG51bGwsXHJcbiAgICBzZXJpYWxpemU6IHZhbCA9PiB2YWxcclxufSwge1xyXG4gICAgdGVzdDogKHZhbCwgc2VlbikgPT4gc2Vlbi5oYXModmFsKSxcclxuICAgIHNlcmlhbGl6ZTogKCkgPT4gJ1tDaXJjdWxhcl0nXHJcbn0sIHtcclxuICAgIHRlc3Q6IHZhbCA9PiBBcnJheS5pc0FycmF5KHZhbCksXHJcbiAgICBzZXJpYWxpemU6ICh2YWwsIHNlZW4sIHNlcmlhbGl6ZSwgZGVwdGgpID0+IHtcclxuICAgICAgICBzZWVuLmFkZCh2YWwpO1xyXG4gICAgICAgIHJldHVybiB2YWwubWFwKHYgPT4gc2VyaWFsaXplKHYsIGRlcHRoICsgMSkpO1xyXG4gICAgfVxyXG59LCB7XHJcbiAgICB0ZXN0OiAoKSA9PiB0cnVlLFxyXG4gICAgc2VyaWFsaXplOiAodmFsLCBzZWVuLCBzZXJpYWxpemUsIGRlcHRoKSA9PiB7XHJcbiAgICAgICAgc2Vlbi5hZGQodmFsKTtcclxuICAgICAgICBjb25zdCBvdXQgPSB7fTtcclxuICAgICAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyh2YWwpKVxyXG4gICAgICAgICAgICBvdXRba10gPSBzZXJpYWxpemUodiwgZGVwdGggKyAxKTtcclxuICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgfVxyXG59XTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNhZmVTdHJpbmdpZnkodmFsdWUsIG1heERlcHRoID0gNCwgbWF4TGVuZ3RoID0gMTBfMDAwKSB7XHJcbiAgICBjb25zdCBzZWVuID0gbmV3IFNldCgpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGRlcHRoKSB7XHJcbiAgICAgICAgaWYgKGRlcHRoID4gbWF4RGVwdGgpIHJldHVybiAnW01heERlcHRoXSc7XHJcbiAgICAgICAgY29uc3Qgc2VyaWFsaXplciA9IHNlcmlhbGl6ZXJzLmZpbmQocyA9PiBzLnRlc3QodmFsLCBzZWVuKSk7XHJcbiAgICAgICAgaWYgKCFzZXJpYWxpemVyKSByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHNlcmlhbGl6ZXIuc2VyaWFsaXplKHZhbCwgc2Vlbiwgc2VyaWFsaXplLCBkZXB0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHJlc3VsdDtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgc2VyaWFsaXplZFZhbHVlID0gc2VyaWFsaXplKHZhbHVlLCAwKTtcclxuICAgICAgICByZXN1bHQgPSB0eXBlb2Ygc2VyaWFsaXplZFZhbHVlID09PSAnc3RyaW5nJ1xyXG4gICAgICAgICAgICA/IHNlcmlhbGl6ZWRWYWx1ZVxyXG4gICAgICAgICAgICA6IEpTT04uc3RyaW5naWZ5KHNlcmlhbGl6ZWRWYWx1ZSwgbnVsbCwgMik7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgIHJldHVybiAnW1Vuc2VyaWFsaXphYmxlXSc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoID4gbWF4TGVuZ3RoKVxyXG4gICAgICAgIHJldHVybiByZXN1bHQuc2xpY2UoMCwgbWF4TGVuZ3RoKSArICdcXG5bVHJ1bmNhdGVkXSc7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG4iLCAiaW1wb3J0IHNhZmVTdHJpbmdpZnkgZnJvbSAnLi90aGVQcmludGVyLmpzJztcblxuY29uc3QgbGV2ZWxUb0xvZ1R5cGUgPSB7XG4gICAgaW5mbzogJ0lORk8nLFxuICAgIHdhcm46ICdXQVJOSU5HJyxcbiAgICBlcnJvcjogJ0VSUk9SJyxcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWJ1Z0xvZyhsZXZlbCwgbWVzc2FnZSwgYXJncykge1xuICAgIGNvbnN0IHR5cGUgPSBsZXZlbFRvTG9nVHlwZVtsZXZlbF0gPz8gJ0lORk8nO1xuICAgIGNvbnN0IG1lc3NhZ2VXaXRoQXJncyA9IG1lc3NhZ2UgKyBhcmdzLm1hcChhcmcgPT4ge1xuICAgICAgICByZXR1cm4gYFxcbiR7c2FmZVN0cmluZ2lmeShhcmcpfWA7XG4gICAgfSkuam9pbignJyk7XG4gICAgcmV0dXJuIGF3YWl0IE5ldXRyYWxpbm8uZGVidWcubG9nKG1lc3NhZ2VXaXRoQXJncywgdHlwZSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuU2luZ2xlRmlsZURpYWxvZyhsYWJlbCwgZmlsdGVycykge1xuICAgIGxvZygnZnMnKS5kZWJ1Zygnb3BlblNpbmdsZUZpbGVEaWFsb2cnLCBsYWJlbCwgZmlsdGVycyk7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgTmV1dHJhbGluby5vcy5zaG93T3BlbkRpYWxvZyhsYWJlbCwgeyBmaWx0ZXJzIH0pO1xuICAgIHJldHVybiByZXM/LlswXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5Gb2xkZXJEaWFsb2cobGFiZWwpIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ29wZW5Gb2xkZXJEaWFsb2cnLCBsYWJlbCk7XG4gICAgcmV0dXJuIGF3YWl0IE5ldXRyYWxpbm8ub3Muc2hvd0ZvbGRlckRpYWxvZyhsYWJlbCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlU2luZ2xlRmlsZURpYWxvZyhsYWJlbCwgZGVmYXVsdFBhdGgsIGZpbHRlcnMpIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ3NhdmVTaW5nbGVGaWxlRGlhbG9nJywgbGFiZWwsIGRlZmF1bHRQYXRoLCBmaWx0ZXJzKTtcbiAgICByZXR1cm4gYXdhaXQgTmV1dHJhbGluby5vcy5zaG93U2F2ZURpYWxvZyhsYWJlbCwgeyBkZWZhdWx0UGF0aCwgZmlsdGVycyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFN0b3JlZERhdGEoa2V5KSB7XG4gICAgbG9nKCdmcycpLmRlYnVnKCdzdG9yYWdlLmdldERhdGEnLCBrZXkpO1xuICAgIHJldHVybiBhd2FpdCBOZXV0cmFsaW5vLnN0b3JhZ2UuZ2V0RGF0YShrZXkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RvcmVEYXRhKGtleSwgdmFsdWUpIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ3N0b3JhZ2Uuc3RvcmVEYXRhJywga2V5LCB2YWx1ZSk7XG4gICAgcmV0dXJuIGF3YWl0IE5ldXRyYWxpbm8uc3RvcmFnZS5zZXREYXRhKGtleSwgdmFsdWUpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZERpcmVjdG9yeShwYXRoLCBvcHRpb25zKSB7XG4gICAgbG9nKCdmcycpLmRlYnVnKCdyZWFkRGlyZWN0b3J5JywgcGF0aCwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5yZWFkRGlyZWN0b3J5KHBhdGgsIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEZpbGUocGF0aCkge1xuICAgIGxvZygnZnMnKS5kZWJ1ZygncmVhZEZpbGUnLCBwYXRoKTtcbiAgICByZXR1cm4gYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLnJlYWRGaWxlKHBhdGgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JpdGVGaWxlKHBhdGgsIGRhdGEpIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ3dyaXRlRmlsZScsIHBhdGgsIGAke2RhdGEubGVuZ3RofSBieXRlc2ApO1xuICAgIGNvbnN0IHsgcGFyZW50UGF0aCB9ID0gYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLmdldFBhdGhQYXJ0cyhwYXRoKTtcbiAgICBhd2FpdCBjcmVhdGVEaXJlY3RvcnkocGFyZW50UGF0aCk7XG4gICAgYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLndyaXRlRmlsZShwYXRoLCBkYXRhKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlQmluYXJ5RmlsZShwYXRoLCBkYXRhKSB7XG4gICAgbG9nKCdmcycpLmRlYnVnKCd3cml0ZUJpbmFyeUZpbGUnLCBwYXRoLCBgJHtkYXRhLmJ5dGVMZW5ndGh9IGJ5dGVzYCk7XG4gICAgY29uc3QgeyBwYXJlbnRQYXRoIH0gPSBhd2FpdCBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0uZ2V0UGF0aFBhcnRzKHBhdGgpO1xuICAgIGF3YWl0IGNyZWF0ZURpcmVjdG9yeShwYXJlbnRQYXRoKTtcbiAgICBhd2FpdCBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0ud3JpdGVCaW5hcnlGaWxlKHBhdGgsIGRhdGEpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEJpbmFyeUZpbGUocGF0aCkge1xuICAgIGxvZygnZnMnKS5kZWJ1ZygncmVhZEJpbmFyeUZpbGUnLCBwYXRoKTtcbiAgICByZXR1cm4gYXdhaXQgTmV1dHJhbGluby5maWxlc3lzdGVtLnJlYWRCaW5hcnlGaWxlKHBhdGgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QWJzb2x1dGVQYXRoKHBhdGgpIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ2dldEFic29sdXRlUGF0aCcsIHBhdGgpO1xuICAgIHJldHVybiBhd2FpdCBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0uZ2V0QWJzb2x1dGVQYXRoKHBhdGgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb3BlbihwYXRoKSB7XG4gICAgbG9nKCdmcycpLmRlYnVnKCdvcGVuJywgcGF0aCk7XG4gICAgcmV0dXJuIGF3YWl0IE5ldXRyYWxpbm8ub3Mub3BlbihwYXRoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFN0YXRzKHBhdGgpIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ2dldFN0YXRzJywgcGF0aCk7XG4gICAgcmV0dXJuIGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5nZXRTdGF0cyhwYXRoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEpvaW5lZFBhdGgoLi4ucGF0aHMpIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ2dldEpvaW5lZFBhdGgnLCBwYXRocyk7XG4gICAgcmV0dXJuIGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5nZXRKb2luZWRQYXRoKC4uLnBhdGhzKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1vdmVGaWxlKHNvdXJjZSwgZGVzdGluYXRpb24pIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ21vdmVGaWxlJywgc291cmNlLCBkZXN0aW5hdGlvbik7XG4gICAgcmV0dXJuIGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5tb3ZlKHNvdXJjZSwgZGVzdGluYXRpb24pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlRGlyZWN0b3J5KHBhdGgpIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ2NyZWF0ZURpcmVjdG9yeScsIHBhdGgpO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IE5ldXRyYWxpbm8uZmlsZXN5c3RlbS5jcmVhdGVEaXJlY3RvcnkocGF0aCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKGVycm9yLmNvZGUgIT09ICdORV9GU19ESVJDUkVSJylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtlcnJvci5jb2RlfSAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGF0aFBhcnRzKHBhdGgpIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ2dldFBhdGhQYXJ0cycsIHBhdGgpO1xuICAgIHJldHVybiBhd2FpdCBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0uZ2V0UGF0aFBhcnRzKHBhdGgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGFyZW50UGF0aChwYXRoKSB7XG4gICAgY29uc3QgeyBwYXJlbnRQYXRoIH0gPSBhd2FpdCBnZXRQYXRoUGFydHMocGF0aCk7XG4gICAgcmV0dXJuIHBhcmVudFBhdGg7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBybXJmKHBhdGgpIHtcbiAgICBsb2coJ2ZzJykuZGVidWcoJ3JlbW92ZScsIHBhdGgpO1xuICAgIHJldHVybiBhd2FpdCBOZXV0cmFsaW5vLmZpbGVzeXN0ZW0ucmVtb3ZlKHBhdGgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TW91bnRzKCkge1xuICAgIGxvZygnZnMnKS5kZWJ1ZygnZ2V0TW91bnRzJyk7XG4gICAgcmV0dXJuIGF3YWl0IE5ldXRyYWxpbm8uc2VydmVyLmdldE1vdW50cygpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdW5tb3VudChwYXRoKSB7XG4gICAgbG9nKCdmcycpLmRlYnVnKCd1bm1vdW50JywgcGF0aCk7XG4gICAgY29uc3QgbW91bnRzID0gYXdhaXQgTmV1dHJhbGluby5zZXJ2ZXIuZ2V0TW91bnRzKCk7XG4gICAgaWYgKCFtb3VudHNbcGF0aF0pIHJldHVybjtcbiAgICBhd2FpdCBOZXV0cmFsaW5vLnNlcnZlci51bm1vdW50KHBhdGgpO1xuICAgIC8vIFRoaXMgcHJvdGVjdHMgdXMgZnJvbSBhIHRpbWluZyBidWcgd2hpY2ggb2NjdXJzIHdoZW4gdGhlIGNvZGVcbiAgICAvLyB0cmllcyB0byBtb3VudCBhIHBhdGggYWZ0ZXIgdW5tb3VudGluZyBpdC5cbiAgICBhd2FpdCBOZXV0cmFsaW5vLnNlcnZlci5nZXRNb3VudHMoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1vdW50KHBhdGgsIHRhcmdldCkge1xuICAgIGxvZygnZnMnKS5kZWJ1ZygnbW91bnQnLCBwYXRoLCB0YXJnZXQpO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IE5ldXRyYWxpbm8uc2VydmVyLm1vdW50KHBhdGgsIHRhcmdldCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKGVycm9yLmNvZGUgIT09ICdORV9TUl9NUElOVVNFJylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtlcnJvci5jb2RlfSAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0V2luZG93U2l6ZShvcHRpb25zKSB7XG4gICAgcmV0dXJuIGF3YWl0IE5ldXRyYWxpbm8ud2luZG93LnNldFNpemUob3B0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZVByb2Nlc3NPdXRwdXQoZGF0YSkge1xuICAgIHJldHVybiBOZXV0cmFsaW5vLmFwcC53cml0ZVByb2Nlc3NPdXRwdXQoZGF0YSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZVByb2Nlc3NFcnJvcihkYXRhKSB7XG4gICAgcmV0dXJuIE5ldXRyYWxpbm8uYXBwLndyaXRlUHJvY2Vzc0Vycm9yKGRhdGEpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdEFwcCgpIHtcbiAgICBOZXV0cmFsaW5vLmluaXQoKTtcbiAgICBhd2FpdCBOZXV0cmFsaW5vLmV2ZW50cy5vbignd2luZG93Q2xvc2UnLCAoKSA9PiBOZXV0cmFsaW5vLmFwcC5leGl0KDApKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgTmV1dHJhbGluby5ldmVudHMub24oJ3JlYWR5JywgKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4aXRBcHAoY29kZSA9IDApIHtcbiAgICBOZXV0cmFsaW5vLmFwcC5leGl0KGNvZGUpO1xufVxuIiwgImltcG9ydCB7IGRlYnVnTG9nIH0gZnJvbSAnLi9uZXV0cmFsaW5vQWRhcHRlci5qcyc7XHJcblxyXG5jb25zdCBpc0RlYnVnTW9kZSA9IE5MX0FSR1MuaW5jbHVkZXMoJy0tZGVidWcnKTtcclxuY29uc3QgbG9nID0gW107XHJcbmNvbnN0IGxvZ2dlcnMgPSB7fTtcclxuY29uc3QgbG9nR3JvdXBzID0ge307XHJcbmNvbnN0IHQwID0gbmV3IERhdGUoKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2dNZXNzYWdlcyhzaW5jZSA9IHQwKSB7XHJcbiAgICByZXR1cm4gbG9nLmZpbHRlcihtc2cgPT4gbXNnLnRpbWVzdGFtcCA+PSBzaW5jZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRMb2dHcm91cChncm91cEtleSwgY29sb3IpIHtcclxuICAgIGxvZ0dyb3Vwc1tncm91cEtleV0gPSB7IGNvbG9yIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvZ01lc3NhZ2UobGV2ZWwsIGdyb3VwS2V5LCBtZXNzYWdlLCAuLi5hcmdzKSB7XHJcbiAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpO1xyXG4gICAgY29uc3QgY29sb3JFeHByID0gYGNvbG9yOiAke2xvZ0dyb3Vwc1tncm91cEtleV0/LmNvbG9yID8/ICdpbmhlcml0J31gO1xyXG4gICAgY29uc29sZVtsZXZlbF0oYCVjWyR7Z3JvdXBLZXl9XSAke21lc3NhZ2V9YCwgY29sb3JFeHByLCAuLi5hcmdzKTtcclxuICAgIGlmIChsZXZlbCA9PT0gJ2RlYnVnJyAmJiAhaXNEZWJ1Z01vZGUpIHJldHVybjtcclxuICAgIGxvZy5wdXNoKHsgbGV2ZWwsIGdyb3VwS2V5LCBtZXNzYWdlLCBhcmdzLCB0aW1lc3RhbXAgfSk7XHJcbiAgICBkZWJ1Z0xvZyhsZXZlbCwgYFske2dyb3VwS2V5fV0gJHttZXNzYWdlfWAsIGFyZ3MpLmNhdGNoKCgpID0+IHt9KTtcclxufVxyXG5cclxud2luZG93LmxvZyA9IGZ1bmN0aW9uKGdyb3VwS2V5KSB7XHJcbiAgICByZXR1cm4gbG9nZ2Vyc1tncm91cEtleV0gPz89IHtcclxuICAgICAgICBkZWJ1ZzogKG1zZywgLi4uYXJncykgPT4gbG9nTWVzc2FnZSgnZGVidWcnLCBncm91cEtleSwgbXNnLCAuLi5hcmdzKSxcclxuICAgICAgICBpbmZvOiAgKG1zZywgLi4uYXJncykgPT4gbG9nTWVzc2FnZSgnaW5mbycsICBncm91cEtleSwgbXNnLCAuLi5hcmdzKSxcclxuICAgICAgICB3YXJuOiAgKG1zZywgLi4uYXJncykgPT4gbG9nTWVzc2FnZSgnd2FybicsICBncm91cEtleSwgbXNnLCAuLi5hcmdzKSxcclxuICAgICAgICBlcnJvcjogKG1zZywgLi4uYXJncykgPT4gbG9nTWVzc2FnZSgnZXJyb3InLCBncm91cEtleSwgbXNnLCAuLi5hcmdzKSxcclxuICAgIH07XHJcbn07XHJcblxyXG5hZGRMb2dHcm91cCgnc3RhcnR1cCcsICdnb2xkZW5yb2QnKTtcclxuYWRkTG9nR3JvdXAoJ2ZzJywgICAgICAnY29yYWwnKTtcclxuYWRkTG9nR3JvdXAoJ2NhY2hlJywgICAnZ3JleScpO1xyXG5hZGRMb2dHcm91cCgndXNlcicsICAgICdraGFraScpO1xyXG5hZGRMb2dHcm91cCgncmVuZGVyJywgICd0dXJxdW9pc2UnKTtcclxuYWRkTG9nR3JvdXAoJ3N0YXRlJywgICAndmlvbGV0Jyk7XHJcbmFkZExvZ0dyb3VwKCdleHBvcnQnLCAgJ2JsYWNrJyk7XHJcbmFkZExvZ0dyb3VwKCdwbHVnaW4nLCAgJ2xpZ2h0Z3JlZW4nKTtcclxuIiwgImZ1bmN0aW9uIGFkZFByb3RvdHlwZUZ1bmN0aW9uKGN0b3IsIG5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICBpZiAodHlwZW9mIGN0b3IgIT09ICdmdW5jdGlvbicgfHwgIWN0b3IucHJvdG90eXBlKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgY29uc3RydWN0b3IgZnVuY3Rpb24nKTtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZycpO1xuXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjdG9yLnByb3RvdHlwZSwgbmFtZSkpIHtcbiAgICAgICAgbG9nKCdzdGFydHVwJykud2FybihgJHtjdG9yLm5hbWV9LnByb3RvdHlwZS4ke25hbWV9IGFscmVhZHkgZGVmaW5lZCBcdTIwMTQgc2tpcHBpbmcuYCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaW5hbERlc2NyaXB0b3IgPSBPYmplY3QuYXNzaWduKFxuICAgICAgICB7IHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlIH0sXG4gICAgICAgIGRlc2NyaXB0b3JcbiAgICApO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGN0b3IucHJvdG90eXBlLCBuYW1lLCBmaW5hbERlc2NyaXB0b3IpO1xufVxuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBuYW1lIFN0cmluZyNzZXBhcmF0ZVxuICogQHJldHVybnMge3N0cmluZ31cbiAqIEBkZXNjcmlwdGlvbiBJbnNlcnQgYSBzZXBhcmF0b3IgYmVmb3JlIHVwcGVyY2FzZSBsZXR0ZXJzIGluIGNhbWVsQ2FzZVxuICogICAgICAgICAgICAgIG9yIFBhc2NhbENhc2Ugc3RyaW5ncy5cbiAqIEV4YW1wbGVzOiBgJ2NhbWVsQ2FzZScuc2VwYXJhdGUoKWAgXHUyMTkyIGAnY2FtZWwgQ2FzZSdgLFxuICogICAgICAgICAgIGAnSFRNTFBhcnNlcicuc2VwYXJhdGUoKWAgXHUyMTkyIGAnSFRNTCBQYXJzZXInYFxuICogICAgICAgICAgIGAnTXlDb29sQ2xhc3MnLnNlcGFyYXRlKCctJylgIFx1MjE5MiBgJ015LUNvb2wtQ2xhc3MnYFxuICovXG5hZGRQcm90b3R5cGVGdW5jdGlvbihTdHJpbmcsICdzZXBhcmF0ZScsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VwYXJhdGUoc2VwYXJhdG9yID0gJyAnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csIGAkMSR7c2VwYXJhdG9yfSQyYCk7XG4gICAgfVxufSk7XG5cbi8qKlxuICogQG1ldGhvZFxuICogQG5hbWUgU3RyaW5nI25vcm1hbGl6ZVdvcmRzXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICogQHBhcmFtIHtSZWdFeHB9IFtzZXBdIC0gUmVnZXggbWF0Y2hpbmcgc2VwYXJhdG9ycyAoZGVmYXVsdHMgdG8gL1teYS16MC05XSsvZ2kpXG4gKiBAZGVzY3JpcHRpb24gTm9ybWFsaXplcyBhIHN0cmluZyB0byBiZSBsb3dlcmNhc2UgYW5kIHNlcGFyYXRlZCBieSBzcGFjZXMuXG4gKiBFeGFtcGxlOiBgJ21vZGFsX2JhY2snLm5vcm1hbGl6ZVdvcmRzKClgIC0+IGAnbW9kYWwgYmFjaydgXG4gKi9cbmFkZFByb3RvdHlwZUZ1bmN0aW9uKFN0cmluZywgJ25vcm1hbGl6ZVdvcmRzJywge1xuICAgIHZhbHVlOiBmdW5jdGlvbiBub3JtYWxpemVXb3JkcyhzZXAgPSAvW15hLXowLTldKy9naSkge1xuICAgICAgICBpZiAoIShzZXAgaW5zdGFuY2VvZiBSZWdFeHApKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc2VwYXJhdG9yIG11c3QgYmUgYSBSZWdFeHAnKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9Mb3dlckNhc2UoKS5yZXBsYWNlQWxsKHNlcCwgJyAnKS50cmltKCk7XG4gICAgfVxufSk7XG5cbi8qKlxuICogQG1ldGhvZFxuICogQG5hbWUgU3RyaW5nI3RvVGl0bGVDYXNlXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICogQGRlc2NyaXB0aW9uIENvbnZlcnRzIGEgc3BhY2Utc2VwYXJhdGVkIHN0cmluZyB0byBUaXRsZSBDYXNlLlxuICogRXhhbXBsZTogYCdtb2RhbCBiYWNrJy50b1RpdGxlQ2FzZSgpYCAtPiBgJ01vZGFsIEJhY2snYFxuICovXG5hZGRQcm90b3R5cGVGdW5jdGlvbihTdHJpbmcsICd0b1RpdGxlQ2FzZScsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gdG9UaXRsZUNhc2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNwbGl0KC9cXHMrLylcbiAgICAgICAgICAgIC5tYXAodyA9PiB3LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdy5zbGljZSgxKSlcbiAgICAgICAgICAgIC5qb2luKCcgJyk7XG4gICAgfVxufSk7XG5cbi8qKlxuICogQG1ldGhvZFxuICogQG5hbWUgU3RyaW5nI3RvQ2FtZWxDYXNlXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICogQGRlc2NyaXB0aW9uIENvbnZlcnRzIGEgc3BhY2Utc2VwYXJhdGVkIHN0cmluZyBpbnRvIGNhbWVsQ2FzZS5cbiAqIEV4YW1wbGU6IGAnbW9kYWwgYmFjaycudG9DYW1lbENhc2UoKWAgLT4gYCdtb2RhbEJhY2snYFxuICovXG5hZGRQcm90b3R5cGVGdW5jdGlvbihTdHJpbmcsICd0b0NhbWVsQ2FzZScsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gdG9DYW1lbENhc2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNwbGl0KC9cXHMrLylcbiAgICAgICAgICAgIC5tYXAoKHcsIGkpID0+XG4gICAgICAgICAgICAgICAgaSA9PT0gMCA/IHcgOiAody5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHcuc2xpY2UoMSkpXG4gICAgICAgICAgICApLmpvaW4oJycpO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBuYW1lIE9iamVjdCNleGNlcHRcbiAqIEBwYXJhbSB7Li4uc3RyaW5nfSBrZXlzVG9FeGNsdWRlIC0gQSB2YXJpYWJsZSBudW1iZXIgb2Ygc3RyaW5nIGtleXMgdG8gcmVtb3ZlIGZyb21cbiAqICB0aGUgb2JqZWN0LlxuICogQHJldHVybnMge29iamVjdH1cbiAqIEBkZXNjcmlwdGlvbiBDcmVhdGVzIGEgbmV3IG9iamVjdCB0aGF0IGhhcyB0aGUgc3BlY2lmaWVkIGtleXMgcmVtb3ZlZC5cbiAqIEV4YW1wbGU6IGB7IGE6IDEsIGI6IDIgfS5leGNlcHQoJ2EnKWAgLT4gYHsgYjogMiB9YFxuICovXG5hZGRQcm90b3R5cGVGdW5jdGlvbihPYmplY3QsICdleGNlcHQnLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uIGV4Y2VwdCguLi5rZXlzVG9FeGNsdWRlKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgICAgICBPYmplY3QuZW50cmllcyh0aGlzKS5maWx0ZXIoKFtrZXldKSA9PiAha2V5c1RvRXhjbHVkZS5pbmNsdWRlcyhrZXkpKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBuYW1lIEFycmF5I3JlbW92ZVxuICogQHBhcmFtIHthbnl9IGl0ZW0gLSBBbiBpdGVtIHRvIHJlbW92ZSBmcm9tIHRoZSBhcnJheS5cbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKiBAZGVzY3JpcHRpb24gUmVtb3ZlcyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgdGhlIGl0ZW0gZnJvbSB0aGUgYXJyYXkgaWYgcHJlc2VudC5cbiAqIEV4YW1wbGU6IGBbMSwgMiwgM10ucmVtb3ZlKDIpYCAtPiBgWzEsIDNdYFxuICovXG5hZGRQcm90b3R5cGVGdW5jdGlvbihBcnJheSwgJ3JlbW92ZScsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlKGl0ZW0pIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4T2YoaXRlbSk7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB0aGlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBuYW1lIEFycmF5I3ppcFxuICogQHBhcmFtIHtBcnJheTxhbnk+fSBvdGhlckFycmF5IC0gQW5vdGhlciBhcnJheSB0byB6aXAgd2l0aC5cbiAqIEByZXR1cm5zIHtBcnJheTxBcnJheTxhbnksIGFueT4+fVxuICogQGRlc2NyaXB0aW9uIENvbWJpbmVzIHR3byBhcnJheXMgdG9nZXRoZXIuXG4gKiBFeGFtcGxlOlxuICogYGBganNcbiAqIFsxLCAyLCAzXS56aXAoWydhJywgJ2InLCAnYyddKTtcbiAqIC8vIC0+IFtbMSwgJ2EnXSwgWzIsICdiJ10sIFszLCAnYyddXVxuICogYGBgXG4gKi9cbmFkZFByb3RvdHlwZUZ1bmN0aW9uKEFycmF5LCAnemlwJywge1xuICAgIHZhbHVlOiBmdW5jdGlvbiB6aXAob3RoZXJBcnJheSkge1xuICAgICAgICBjb25zdCByZXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aCAmJiBpIDwgb3RoZXJBcnJheS5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIHJlcy5wdXNoKFt0aGlzW2ldLCBvdGhlckFycmF5W2ldXSk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxufSk7XG5cbi8qKlxuICogQG1ldGhvZFxuICogQG5hbWUgQXJyYXkjdG9EaWN0aW9uYXJ5XG4gKiBAcGFyYW0geyhpdGVtKSA9PiBhbnl9IGtleUNhbGxiYWNrIC0gQ2FsbGJhY2sgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBrZXkgdG8gdXNlXG4gKiBmb3IgYSBwYXNzZWQgaXRlbS5cbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKiBAZGVzY3JpcHRpb24gVHJhbnNmb3JtcyBhbiBhcnJheSBpbnRvIGEgZGljdGlvbmFyeSwga2V5ZWQgYnkgdGhlIGtleXMgcmV0dXJuZWQgYnlcbiAqIHRoZSBrZXlDYWxsYmFjayBmb3IgZWFjaCBpdGVtLlxuICogRXhhbXBsZTpcbiAqIGBgYGpzXG4gKiBbeyBpZDogJ2hlbGxvJyB9LCB7IGlkOiAnd29ybGQnIH1dLnRvRGljdGlvbmFyeShpdGVtID0+IGl0ZW0uaWQpO1xuICogLy8geyBoZWxsbzogeyBpZDogJ2hlbGxvJyB9LCB3b3JsZDogeyBpZDogJ3dvcmxkJyB9IH1cbiAqIGBgYFxuICovXG5hZGRQcm90b3R5cGVGdW5jdGlvbihBcnJheSwgJ3RvRGljdGlvbmFyeScsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gdG9EaWN0aW9uYXJ5KGtleUNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlZHVjZSgoZGljdGlvbmFyeSwgaXRlbSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0ga2V5Q2FsbGJhY2soaXRlbSk7XG4gICAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093bihkaWN0aW9uYXJ5LCBrZXkpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRW5jb3VudGVyZWQgZHVwbGljYXRlIGtleSAke2tleX1gKTtcbiAgICAgICAgICAgIGRpY3Rpb25hcnlba2V5XSA9IGl0ZW07XG4gICAgICAgICAgICByZXR1cm4gZGljdGlvbmFyeTtcbiAgICAgICAgfSwge30pO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBuYW1lIEZ1bmN0aW9uI2RlYm91bmNlXG4gKiBAcGFyYW0ge251bWJlcn0gZGVsYXkgLSBEZWJvdW5jZSBkZWxheSBiZWZvcmUgZnVuY3Rpb24gZXhlY3V0aW9uLlxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICogQGRlc2NyaXB0aW9uIENyZWF0ZXMgYSBkZWJvdW5jZWQgd3JhcHBlciBhcm91bmQgYSBmdW5jdGlvbi5cbiAqIEV4YW1wbGU6IGNvbnN0IHNheUhlbGxvID0gKCgpID0+IGNvbnNvbGUubG9nKCdIZWxsbyBXb3JsZCcpKS5kZWJvdW5jZSg1MDApO1xuICovXG5hZGRQcm90b3R5cGVGdW5jdGlvbihGdW5jdGlvbiwgJ2RlYm91bmNlJywge1xuICAgIHZhbHVlOiBmdW5jdGlvbiBkZWJvdW5jZShkZWxheSkge1xuICAgICAgICBsZXQgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGxldCBjb250ZXh0ID0gbnVsbDtcbiAgICAgICAgbGV0IGFyZ3MgPSBudWxsO1xuICAgICAgICBjb25zdCBmdW5jID0gdGhpcztcblxuICAgICAgICBjb25zdCBpbnZva2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZGVib3VuY2VkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChpbnZva2UsIGRlbGF5KTtcbiAgICAgICAgfTtcblxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVib3VuY2VkLCAnY2FuY2VsJywge1xuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgY29udGV4dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgYXJncyA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkZWJvdW5jZWQsICdmbHVzaCcsIHtcbiAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGltZW91dCA9PT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW52b2tlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkZWJvdW5jZWQ7XG4gICAgfVxufSk7XG4iLCAiZXhwb3J0IHsgQ29tcG9zZXIgfSBmcm9tICcuL2NvbXBvc2UvY29tcG9zZXIuanMnO1xuZXhwb3J0IHsgRG9jdW1lbnQgfSBmcm9tICcuL2RvYy9Eb2N1bWVudC5qcyc7XG5leHBvcnQgeyBTY2hlbWEgfSBmcm9tICcuL3NjaGVtYS9TY2hlbWEuanMnO1xuZXhwb3J0IHsgWUFNTEVycm9yLCBZQU1MUGFyc2VFcnJvciwgWUFNTFdhcm5pbmcgfSBmcm9tICcuL2Vycm9ycy5qcyc7XG5leHBvcnQgeyBBbGlhcyB9IGZyb20gJy4vbm9kZXMvQWxpYXMuanMnO1xuZXhwb3J0IHsgaXNBbGlhcywgaXNDb2xsZWN0aW9uLCBpc0RvY3VtZW50LCBpc01hcCwgaXNOb2RlLCBpc1BhaXIsIGlzU2NhbGFyLCBpc1NlcSB9IGZyb20gJy4vbm9kZXMvaWRlbnRpdHkuanMnO1xuZXhwb3J0IHsgUGFpciB9IGZyb20gJy4vbm9kZXMvUGFpci5qcyc7XG5leHBvcnQgeyBTY2FsYXIgfSBmcm9tICcuL25vZGVzL1NjYWxhci5qcyc7XG5leHBvcnQgeyBZQU1MTWFwIH0gZnJvbSAnLi9ub2Rlcy9ZQU1MTWFwLmpzJztcbmV4cG9ydCB7IFlBTUxTZXEgfSBmcm9tICcuL25vZGVzL1lBTUxTZXEuanMnO1xuaW1wb3J0ICogYXMgY3N0IGZyb20gJy4vcGFyc2UvY3N0LmpzJztcbmV4cG9ydCB7IGNzdCBhcyBDU1QgfTtcbmV4cG9ydCB7IExleGVyIH0gZnJvbSAnLi9wYXJzZS9sZXhlci5qcyc7XG5leHBvcnQgeyBMaW5lQ291bnRlciB9IGZyb20gJy4vcGFyc2UvbGluZS1jb3VudGVyLmpzJztcbmV4cG9ydCB7IFBhcnNlciB9IGZyb20gJy4vcGFyc2UvcGFyc2VyLmpzJztcbmV4cG9ydCB7IHBhcnNlLCBwYXJzZUFsbERvY3VtZW50cywgcGFyc2VEb2N1bWVudCwgc3RyaW5naWZ5IH0gZnJvbSAnLi9wdWJsaWMtYXBpLmpzJztcbmV4cG9ydCB7IHZpc2l0LCB2aXNpdEFzeW5jIH0gZnJvbSAnLi92aXNpdC5qcyc7XG4iLCAiY29uc3QgQUxJQVMgPSBTeW1ib2wuZm9yKCd5YW1sLmFsaWFzJyk7XG5jb25zdCBET0MgPSBTeW1ib2wuZm9yKCd5YW1sLmRvY3VtZW50Jyk7XG5jb25zdCBNQVAgPSBTeW1ib2wuZm9yKCd5YW1sLm1hcCcpO1xuY29uc3QgUEFJUiA9IFN5bWJvbC5mb3IoJ3lhbWwucGFpcicpO1xuY29uc3QgU0NBTEFSID0gU3ltYm9sLmZvcigneWFtbC5zY2FsYXInKTtcbmNvbnN0IFNFUSA9IFN5bWJvbC5mb3IoJ3lhbWwuc2VxJyk7XG5jb25zdCBOT0RFX1RZUEUgPSBTeW1ib2wuZm9yKCd5YW1sLm5vZGUudHlwZScpO1xuY29uc3QgaXNBbGlhcyA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gQUxJQVM7XG5jb25zdCBpc0RvY3VtZW50ID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBET0M7XG5jb25zdCBpc01hcCA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gTUFQO1xuY29uc3QgaXNQYWlyID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBQQUlSO1xuY29uc3QgaXNTY2FsYXIgPSAobm9kZSkgPT4gISFub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJiBub2RlW05PREVfVFlQRV0gPT09IFNDQUxBUjtcbmNvbnN0IGlzU2VxID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBTRVE7XG5mdW5jdGlvbiBpc0NvbGxlY3Rpb24obm9kZSkge1xuICAgIGlmIChub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JylcbiAgICAgICAgc3dpdGNoIChub2RlW05PREVfVFlQRV0pIHtcbiAgICAgICAgICAgIGNhc2UgTUFQOlxuICAgICAgICAgICAgY2FzZSBTRVE6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBpc05vZGUobm9kZSkge1xuICAgIGlmIChub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JylcbiAgICAgICAgc3dpdGNoIChub2RlW05PREVfVFlQRV0pIHtcbiAgICAgICAgICAgIGNhc2UgQUxJQVM6XG4gICAgICAgICAgICBjYXNlIE1BUDpcbiAgICAgICAgICAgIGNhc2UgU0NBTEFSOlxuICAgICAgICAgICAgY2FzZSBTRVE6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5jb25zdCBoYXNBbmNob3IgPSAobm9kZSkgPT4gKGlzU2NhbGFyKG5vZGUpIHx8IGlzQ29sbGVjdGlvbihub2RlKSkgJiYgISFub2RlLmFuY2hvcjtcblxuZXhwb3J0IHsgQUxJQVMsIERPQywgTUFQLCBOT0RFX1RZUEUsIFBBSVIsIFNDQUxBUiwgU0VRLCBoYXNBbmNob3IsIGlzQWxpYXMsIGlzQ29sbGVjdGlvbiwgaXNEb2N1bWVudCwgaXNNYXAsIGlzTm9kZSwgaXNQYWlyLCBpc1NjYWxhciwgaXNTZXEgfTtcbiIsICJpbXBvcnQgeyBpc0RvY3VtZW50LCBpc05vZGUsIGlzUGFpciwgaXNDb2xsZWN0aW9uLCBpc01hcCwgaXNTZXEsIGlzU2NhbGFyLCBpc0FsaWFzIH0gZnJvbSAnLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5cbmNvbnN0IEJSRUFLID0gU3ltYm9sKCdicmVhayB2aXNpdCcpO1xuY29uc3QgU0tJUCA9IFN5bWJvbCgnc2tpcCBjaGlsZHJlbicpO1xuY29uc3QgUkVNT1ZFID0gU3ltYm9sKCdyZW1vdmUgbm9kZScpO1xuLyoqXG4gKiBBcHBseSBhIHZpc2l0b3IgdG8gYW4gQVNUIG5vZGUgb3IgZG9jdW1lbnQuXG4gKlxuICogV2Fsa3MgdGhyb3VnaCB0aGUgdHJlZSAoZGVwdGgtZmlyc3QpIHN0YXJ0aW5nIGZyb20gYG5vZGVgLCBjYWxsaW5nIGFcbiAqIGB2aXNpdG9yYCBmdW5jdGlvbiB3aXRoIHRocmVlIGFyZ3VtZW50czpcbiAqICAgLSBga2V5YDogRm9yIHNlcXVlbmNlIHZhbHVlcyBhbmQgbWFwIGBQYWlyYCwgdGhlIG5vZGUncyBpbmRleCBpbiB0aGVcbiAqICAgICBjb2xsZWN0aW9uLiBXaXRoaW4gYSBgUGFpcmAsIGAna2V5J2Agb3IgYCd2YWx1ZSdgLCBjb3JyZXNwb25kaW5nbHkuXG4gKiAgICAgYG51bGxgIGZvciB0aGUgcm9vdCBub2RlLlxuICogICAtIGBub2RlYDogVGhlIGN1cnJlbnQgbm9kZS5cbiAqICAgLSBgcGF0aGA6IFRoZSBhbmNlc3RyeSBvZiB0aGUgY3VycmVudCBub2RlLlxuICpcbiAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHZpc2l0b3IgbWF5IGJlIHVzZWQgdG8gY29udHJvbCB0aGUgdHJhdmVyc2FsOlxuICogICAtIGB1bmRlZmluZWRgIChkZWZhdWx0KTogRG8gbm90aGluZyBhbmQgY29udGludWVcbiAqICAgLSBgdmlzaXQuU0tJUGA6IERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhpcyBub2RlLCBjb250aW51ZSB3aXRoIG5leHRcbiAqICAgICBzaWJsaW5nXG4gKiAgIC0gYHZpc2l0LkJSRUFLYDogVGVybWluYXRlIHRyYXZlcnNhbCBjb21wbGV0ZWx5XG4gKiAgIC0gYHZpc2l0LlJFTU9WRWA6IFJlbW92ZSB0aGUgY3VycmVudCBub2RlLCB0aGVuIGNvbnRpbnVlIHdpdGggdGhlIG5leHQgb25lXG4gKiAgIC0gYE5vZGVgOiBSZXBsYWNlIHRoZSBjdXJyZW50IG5vZGUsIHRoZW4gY29udGludWUgYnkgdmlzaXRpbmcgaXRcbiAqICAgLSBgbnVtYmVyYDogV2hpbGUgaXRlcmF0aW5nIHRoZSBpdGVtcyBvZiBhIHNlcXVlbmNlIG9yIG1hcCwgc2V0IHRoZSBpbmRleFxuICogICAgIG9mIHRoZSBuZXh0IHN0ZXAuIFRoaXMgaXMgdXNlZnVsIGVzcGVjaWFsbHkgaWYgdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50XG4gKiAgICAgbm9kZSBoYXMgY2hhbmdlZC5cbiAqXG4gKiBJZiBgdmlzaXRvcmAgaXMgYSBzaW5nbGUgZnVuY3Rpb24sIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggYWxsIHZhbHVlc1xuICogZW5jb3VudGVyZWQgaW4gdGhlIHRyZWUsIGluY2x1ZGluZyBlLmcuIGBudWxsYCB2YWx1ZXMuIEFsdGVybmF0aXZlbHksXG4gKiBzZXBhcmF0ZSB2aXNpdG9yIGZ1bmN0aW9ucyBtYXkgYmUgZGVmaW5lZCBmb3IgZWFjaCBgTWFwYCwgYFBhaXJgLCBgU2VxYCxcbiAqIGBBbGlhc2AgYW5kIGBTY2FsYXJgIG5vZGUuIFRvIGRlZmluZSB0aGUgc2FtZSB2aXNpdG9yIGZ1bmN0aW9uIGZvciBtb3JlIHRoYW5cbiAqIG9uZSBub2RlIHR5cGUsIHVzZSB0aGUgYENvbGxlY3Rpb25gIChtYXAgYW5kIHNlcSksIGBWYWx1ZWAgKG1hcCwgc2VxICYgc2NhbGFyKVxuICogYW5kIGBOb2RlYCAoYWxpYXMsIG1hcCwgc2VxICYgc2NhbGFyKSB0YXJnZXRzLiBPZiBhbGwgdGhlc2UsIG9ubHkgdGhlIG1vc3RcbiAqIHNwZWNpZmljIGRlZmluZWQgb25lIHdpbGwgYmUgdXNlZCBmb3IgZWFjaCBub2RlLlxuICovXG5mdW5jdGlvbiB2aXNpdChub2RlLCB2aXNpdG9yKSB7XG4gICAgY29uc3QgdmlzaXRvcl8gPSBpbml0VmlzaXRvcih2aXNpdG9yKTtcbiAgICBpZiAoaXNEb2N1bWVudChub2RlKSkge1xuICAgICAgICBjb25zdCBjZCA9IHZpc2l0XyhudWxsLCBub2RlLmNvbnRlbnRzLCB2aXNpdG9yXywgT2JqZWN0LmZyZWV6ZShbbm9kZV0pKTtcbiAgICAgICAgaWYgKGNkID09PSBSRU1PVkUpXG4gICAgICAgICAgICBub2RlLmNvbnRlbnRzID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZVxuICAgICAgICB2aXNpdF8obnVsbCwgbm9kZSwgdmlzaXRvcl8sIE9iamVjdC5mcmVlemUoW10pKTtcbn1cbi8vIFdpdGhvdXQgdGhlIGBhcyBzeW1ib2xgIGNhc3RzLCBUUyBkZWNsYXJlcyB0aGVzZSBpbiB0aGUgYHZpc2l0YFxuLy8gbmFtZXNwYWNlIHVzaW5nIGB2YXJgLCBidXQgdGhlbiBjb21wbGFpbnMgYWJvdXQgdGhhdCBiZWNhdXNlXG4vLyBgdW5pcXVlIHN5bWJvbGAgbXVzdCBiZSBgY29uc3RgLlxuLyoqIFRlcm1pbmF0ZSB2aXNpdCB0cmF2ZXJzYWwgY29tcGxldGVseSAqL1xudmlzaXQuQlJFQUsgPSBCUkVBSztcbi8qKiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0LlNLSVAgPSBTS0lQO1xuLyoqIFJlbW92ZSB0aGUgY3VycmVudCBub2RlICovXG52aXNpdC5SRU1PVkUgPSBSRU1PVkU7XG5mdW5jdGlvbiB2aXNpdF8oa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKSB7XG4gICAgY29uc3QgY3RybCA9IGNhbGxWaXNpdG9yKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgaWYgKGlzTm9kZShjdHJsKSB8fCBpc1BhaXIoY3RybCkpIHtcbiAgICAgICAgcmVwbGFjZU5vZGUoa2V5LCBwYXRoLCBjdHJsKTtcbiAgICAgICAgcmV0dXJuIHZpc2l0XyhrZXksIGN0cmwsIHZpc2l0b3IsIHBhdGgpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGN0cmwgIT09ICdzeW1ib2wnKSB7XG4gICAgICAgIGlmIChpc0NvbGxlY3Rpb24obm9kZSkpIHtcbiAgICAgICAgICAgIHBhdGggPSBPYmplY3QuZnJlZXplKHBhdGguY29uY2F0KG5vZGUpKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5pdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNpID0gdmlzaXRfKGksIG5vZGUuaXRlbXNbaV0sIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2kgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgICAgICBpID0gY2kgLSAxO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBSRU1PVkUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pdGVtcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNQYWlyKG5vZGUpKSB7XG4gICAgICAgICAgICBwYXRoID0gT2JqZWN0LmZyZWV6ZShwYXRoLmNvbmNhdChub2RlKSk7XG4gICAgICAgICAgICBjb25zdCBjayA9IHZpc2l0Xygna2V5Jywgbm9kZS5rZXksIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGNrID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjayA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUua2V5ID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGN2ID0gdmlzaXRfKCd2YWx1ZScsIG5vZGUudmFsdWUsIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGN2ID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjdiA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUudmFsdWUgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjdHJsO1xufVxuLyoqXG4gKiBBcHBseSBhbiBhc3luYyB2aXNpdG9yIHRvIGFuIEFTVCBub2RlIG9yIGRvY3VtZW50LlxuICpcbiAqIFdhbGtzIHRocm91Z2ggdGhlIHRyZWUgKGRlcHRoLWZpcnN0KSBzdGFydGluZyBmcm9tIGBub2RlYCwgY2FsbGluZyBhXG4gKiBgdmlzaXRvcmAgZnVuY3Rpb24gd2l0aCB0aHJlZSBhcmd1bWVudHM6XG4gKiAgIC0gYGtleWA6IEZvciBzZXF1ZW5jZSB2YWx1ZXMgYW5kIG1hcCBgUGFpcmAsIHRoZSBub2RlJ3MgaW5kZXggaW4gdGhlXG4gKiAgICAgY29sbGVjdGlvbi4gV2l0aGluIGEgYFBhaXJgLCBgJ2tleSdgIG9yIGAndmFsdWUnYCwgY29ycmVzcG9uZGluZ2x5LlxuICogICAgIGBudWxsYCBmb3IgdGhlIHJvb3Qgbm9kZS5cbiAqICAgLSBgbm9kZWA6IFRoZSBjdXJyZW50IG5vZGUuXG4gKiAgIC0gYHBhdGhgOiBUaGUgYW5jZXN0cnkgb2YgdGhlIGN1cnJlbnQgbm9kZS5cbiAqXG4gKiBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoZSB2aXNpdG9yIG1heSBiZSB1c2VkIHRvIGNvbnRyb2wgdGhlIHRyYXZlcnNhbDpcbiAqICAgLSBgUHJvbWlzZWA6IE11c3QgcmVzb2x2ZSB0byBvbmUgb2YgdGhlIGZvbGxvd2luZyB2YWx1ZXNcbiAqICAgLSBgdW5kZWZpbmVkYCAoZGVmYXVsdCk6IERvIG5vdGhpbmcgYW5kIGNvbnRpbnVlXG4gKiAgIC0gYHZpc2l0LlNLSVBgOiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoaXMgbm9kZSwgY29udGludWUgd2l0aCBuZXh0XG4gKiAgICAgc2libGluZ1xuICogICAtIGB2aXNpdC5CUkVBS2A6IFRlcm1pbmF0ZSB0cmF2ZXJzYWwgY29tcGxldGVseVxuICogICAtIGB2aXNpdC5SRU1PVkVgOiBSZW1vdmUgdGhlIGN1cnJlbnQgbm9kZSwgdGhlbiBjb250aW51ZSB3aXRoIHRoZSBuZXh0IG9uZVxuICogICAtIGBOb2RlYDogUmVwbGFjZSB0aGUgY3VycmVudCBub2RlLCB0aGVuIGNvbnRpbnVlIGJ5IHZpc2l0aW5nIGl0XG4gKiAgIC0gYG51bWJlcmA6IFdoaWxlIGl0ZXJhdGluZyB0aGUgaXRlbXMgb2YgYSBzZXF1ZW5jZSBvciBtYXAsIHNldCB0aGUgaW5kZXhcbiAqICAgICBvZiB0aGUgbmV4dCBzdGVwLiBUaGlzIGlzIHVzZWZ1bCBlc3BlY2lhbGx5IGlmIHRoZSBpbmRleCBvZiB0aGUgY3VycmVudFxuICogICAgIG5vZGUgaGFzIGNoYW5nZWQuXG4gKlxuICogSWYgYHZpc2l0b3JgIGlzIGEgc2luZ2xlIGZ1bmN0aW9uLCBpdCB3aWxsIGJlIGNhbGxlZCB3aXRoIGFsbCB2YWx1ZXNcbiAqIGVuY291bnRlcmVkIGluIHRoZSB0cmVlLCBpbmNsdWRpbmcgZS5nLiBgbnVsbGAgdmFsdWVzLiBBbHRlcm5hdGl2ZWx5LFxuICogc2VwYXJhdGUgdmlzaXRvciBmdW5jdGlvbnMgbWF5IGJlIGRlZmluZWQgZm9yIGVhY2ggYE1hcGAsIGBQYWlyYCwgYFNlcWAsXG4gKiBgQWxpYXNgIGFuZCBgU2NhbGFyYCBub2RlLiBUbyBkZWZpbmUgdGhlIHNhbWUgdmlzaXRvciBmdW5jdGlvbiBmb3IgbW9yZSB0aGFuXG4gKiBvbmUgbm9kZSB0eXBlLCB1c2UgdGhlIGBDb2xsZWN0aW9uYCAobWFwIGFuZCBzZXEpLCBgVmFsdWVgIChtYXAsIHNlcSAmIHNjYWxhcilcbiAqIGFuZCBgTm9kZWAgKGFsaWFzLCBtYXAsIHNlcSAmIHNjYWxhcikgdGFyZ2V0cy4gT2YgYWxsIHRoZXNlLCBvbmx5IHRoZSBtb3N0XG4gKiBzcGVjaWZpYyBkZWZpbmVkIG9uZSB3aWxsIGJlIHVzZWQgZm9yIGVhY2ggbm9kZS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gdmlzaXRBc3luYyhub2RlLCB2aXNpdG9yKSB7XG4gICAgY29uc3QgdmlzaXRvcl8gPSBpbml0VmlzaXRvcih2aXNpdG9yKTtcbiAgICBpZiAoaXNEb2N1bWVudChub2RlKSkge1xuICAgICAgICBjb25zdCBjZCA9IGF3YWl0IHZpc2l0QXN5bmNfKG51bGwsIG5vZGUuY29udGVudHMsIHZpc2l0b3JfLCBPYmplY3QuZnJlZXplKFtub2RlXSkpO1xuICAgICAgICBpZiAoY2QgPT09IFJFTU9WRSlcbiAgICAgICAgICAgIG5vZGUuY29udGVudHMgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIGF3YWl0IHZpc2l0QXN5bmNfKG51bGwsIG5vZGUsIHZpc2l0b3JfLCBPYmplY3QuZnJlZXplKFtdKSk7XG59XG4vLyBXaXRob3V0IHRoZSBgYXMgc3ltYm9sYCBjYXN0cywgVFMgZGVjbGFyZXMgdGhlc2UgaW4gdGhlIGB2aXNpdGBcbi8vIG5hbWVzcGFjZSB1c2luZyBgdmFyYCwgYnV0IHRoZW4gY29tcGxhaW5zIGFib3V0IHRoYXQgYmVjYXVzZVxuLy8gYHVuaXF1ZSBzeW1ib2xgIG11c3QgYmUgYGNvbnN0YC5cbi8qKiBUZXJtaW5hdGUgdmlzaXQgdHJhdmVyc2FsIGNvbXBsZXRlbHkgKi9cbnZpc2l0QXN5bmMuQlJFQUsgPSBCUkVBSztcbi8qKiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0QXN5bmMuU0tJUCA9IFNLSVA7XG4vKiogUmVtb3ZlIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0QXN5bmMuUkVNT1ZFID0gUkVNT1ZFO1xuYXN5bmMgZnVuY3Rpb24gdmlzaXRBc3luY18oa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKSB7XG4gICAgY29uc3QgY3RybCA9IGF3YWl0IGNhbGxWaXNpdG9yKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgaWYgKGlzTm9kZShjdHJsKSB8fCBpc1BhaXIoY3RybCkpIHtcbiAgICAgICAgcmVwbGFjZU5vZGUoa2V5LCBwYXRoLCBjdHJsKTtcbiAgICAgICAgcmV0dXJuIHZpc2l0QXN5bmNfKGtleSwgY3RybCwgdmlzaXRvciwgcGF0aCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY3RybCAhPT0gJ3N5bWJvbCcpIHtcbiAgICAgICAgaWYgKGlzQ29sbGVjdGlvbihub2RlKSkge1xuICAgICAgICAgICAgcGF0aCA9IE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQobm9kZSkpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2kgPSBhd2FpdCB2aXNpdEFzeW5jXyhpLCBub2RlLml0ZW1zW2ldLCB2aXNpdG9yLCBwYXRoKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNpID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICAgICAgaSA9IGNpIC0gMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gQlJFQUspXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gUkVNT1ZFKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzUGFpcihub2RlKSkge1xuICAgICAgICAgICAgcGF0aCA9IE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQobm9kZSkpO1xuICAgICAgICAgICAgY29uc3QgY2sgPSBhd2FpdCB2aXNpdEFzeW5jXygna2V5Jywgbm9kZS5rZXksIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGNrID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjayA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUua2V5ID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGN2ID0gYXdhaXQgdmlzaXRBc3luY18oJ3ZhbHVlJywgbm9kZS52YWx1ZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICBpZiAoY3YgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgIGVsc2UgaWYgKGN2ID09PSBSRU1PVkUpXG4gICAgICAgICAgICAgICAgbm9kZS52YWx1ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGN0cmw7XG59XG5mdW5jdGlvbiBpbml0VmlzaXRvcih2aXNpdG9yKSB7XG4gICAgaWYgKHR5cGVvZiB2aXNpdG9yID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAodmlzaXRvci5Db2xsZWN0aW9uIHx8IHZpc2l0b3IuTm9kZSB8fCB2aXNpdG9yLlZhbHVlKSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBBbGlhczogdmlzaXRvci5Ob2RlLFxuICAgICAgICAgICAgTWFwOiB2aXNpdG9yLk5vZGUsXG4gICAgICAgICAgICBTY2FsYXI6IHZpc2l0b3IuTm9kZSxcbiAgICAgICAgICAgIFNlcTogdmlzaXRvci5Ob2RlXG4gICAgICAgIH0sIHZpc2l0b3IuVmFsdWUgJiYge1xuICAgICAgICAgICAgTWFwOiB2aXNpdG9yLlZhbHVlLFxuICAgICAgICAgICAgU2NhbGFyOiB2aXNpdG9yLlZhbHVlLFxuICAgICAgICAgICAgU2VxOiB2aXNpdG9yLlZhbHVlXG4gICAgICAgIH0sIHZpc2l0b3IuQ29sbGVjdGlvbiAmJiB7XG4gICAgICAgICAgICBNYXA6IHZpc2l0b3IuQ29sbGVjdGlvbixcbiAgICAgICAgICAgIFNlcTogdmlzaXRvci5Db2xsZWN0aW9uXG4gICAgICAgIH0sIHZpc2l0b3IpO1xuICAgIH1cbiAgICByZXR1cm4gdmlzaXRvcjtcbn1cbmZ1bmN0aW9uIGNhbGxWaXNpdG9yKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCkge1xuICAgIGlmICh0eXBlb2YgdmlzaXRvciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgcmV0dXJuIHZpc2l0b3Ioa2V5LCBub2RlLCBwYXRoKTtcbiAgICBpZiAoaXNNYXAobm9kZSkpXG4gICAgICAgIHJldHVybiB2aXNpdG9yLk1hcD8uKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgaWYgKGlzU2VxKG5vZGUpKVxuICAgICAgICByZXR1cm4gdmlzaXRvci5TZXE/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpc1BhaXIobm9kZSkpXG4gICAgICAgIHJldHVybiB2aXNpdG9yLlBhaXI/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpc1NjYWxhcihub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuU2NhbGFyPy4oa2V5LCBub2RlLCBwYXRoKTtcbiAgICBpZiAoaXNBbGlhcyhub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuQWxpYXM/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5mdW5jdGlvbiByZXBsYWNlTm9kZShrZXksIHBhdGgsIG5vZGUpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV07XG4gICAgaWYgKGlzQ29sbGVjdGlvbihwYXJlbnQpKSB7XG4gICAgICAgIHBhcmVudC5pdGVtc1trZXldID0gbm9kZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNQYWlyKHBhcmVudCkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2tleScpXG4gICAgICAgICAgICBwYXJlbnQua2V5ID0gbm9kZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcGFyZW50LnZhbHVlID0gbm9kZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNEb2N1bWVudChwYXJlbnQpKSB7XG4gICAgICAgIHBhcmVudC5jb250ZW50cyA9IG5vZGU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBwdCA9IGlzQWxpYXMocGFyZW50KSA/ICdhbGlhcycgOiAnc2NhbGFyJztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgcmVwbGFjZSBub2RlIHdpdGggJHtwdH0gcGFyZW50YCk7XG4gICAgfVxufVxuXG5leHBvcnQgeyB2aXNpdCwgdmlzaXRBc3luYyB9O1xuIiwgImltcG9ydCB7IGlzTm9kZSB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IHZpc2l0IH0gZnJvbSAnLi4vdmlzaXQuanMnO1xuXG5jb25zdCBlc2NhcGVDaGFycyA9IHtcbiAgICAnISc6ICclMjEnLFxuICAgICcsJzogJyUyQycsXG4gICAgJ1snOiAnJTVCJyxcbiAgICAnXSc6ICclNUQnLFxuICAgICd7JzogJyU3QicsXG4gICAgJ30nOiAnJTdEJ1xufTtcbmNvbnN0IGVzY2FwZVRhZ05hbWUgPSAodG4pID0+IHRuLnJlcGxhY2UoL1shLFtcXF17fV0vZywgY2ggPT4gZXNjYXBlQ2hhcnNbY2hdKTtcbmNsYXNzIERpcmVjdGl2ZXMge1xuICAgIGNvbnN0cnVjdG9yKHlhbWwsIHRhZ3MpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBkaXJlY3RpdmVzLWVuZC9kb2Mtc3RhcnQgbWFya2VyIGAtLS1gLiBJZiBgbnVsbGAsIGEgbWFya2VyIG1heSBzdGlsbCBiZVxuICAgICAgICAgKiBpbmNsdWRlZCBpbiB0aGUgZG9jdW1lbnQncyBzdHJpbmdpZmllZCByZXByZXNlbnRhdGlvbi5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZG9jU3RhcnQgPSBudWxsO1xuICAgICAgICAvKiogVGhlIGRvYy1lbmQgbWFya2VyIGAuLi5gLiAgKi9cbiAgICAgICAgdGhpcy5kb2NFbmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy55YW1sID0gT2JqZWN0LmFzc2lnbih7fSwgRGlyZWN0aXZlcy5kZWZhdWx0WWFtbCwgeWFtbCk7XG4gICAgICAgIHRoaXMudGFncyA9IE9iamVjdC5hc3NpZ24oe30sIERpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MsIHRhZ3MpO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgY29weSA9IG5ldyBEaXJlY3RpdmVzKHRoaXMueWFtbCwgdGhpcy50YWdzKTtcbiAgICAgICAgY29weS5kb2NTdGFydCA9IHRoaXMuZG9jU3RhcnQ7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEdXJpbmcgcGFyc2luZywgZ2V0IGEgRGlyZWN0aXZlcyBpbnN0YW5jZSBmb3IgdGhlIGN1cnJlbnQgZG9jdW1lbnQgYW5kXG4gICAgICogdXBkYXRlIHRoZSBzdHJlYW0gc3RhdGUgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHZlcnNpb24ncyBzcGVjLlxuICAgICAqL1xuICAgIGF0RG9jdW1lbnQoKSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IG5ldyBEaXJlY3RpdmVzKHRoaXMueWFtbCwgdGhpcy50YWdzKTtcbiAgICAgICAgc3dpdGNoICh0aGlzLnlhbWwudmVyc2lvbikge1xuICAgICAgICAgICAgY2FzZSAnMS4xJzpcbiAgICAgICAgICAgICAgICB0aGlzLmF0TmV4dERvY3VtZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJzEuMic6XG4gICAgICAgICAgICAgICAgdGhpcy5hdE5leHREb2N1bWVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMueWFtbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZXhwbGljaXQ6IERpcmVjdGl2ZXMuZGVmYXVsdFlhbWwuZXhwbGljaXQsXG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb246ICcxLjInXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBEaXJlY3RpdmVzLmRlZmF1bHRUYWdzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gb25FcnJvciAtIE1heSBiZSBjYWxsZWQgZXZlbiBpZiB0aGUgYWN0aW9uIHdhcyBzdWNjZXNzZnVsXG4gICAgICogQHJldHVybnMgYHRydWVgIG9uIHN1Y2Nlc3NcbiAgICAgKi9cbiAgICBhZGQobGluZSwgb25FcnJvcikge1xuICAgICAgICBpZiAodGhpcy5hdE5leHREb2N1bWVudCkge1xuICAgICAgICAgICAgdGhpcy55YW1sID0geyBleHBsaWNpdDogRGlyZWN0aXZlcy5kZWZhdWx0WWFtbC5leHBsaWNpdCwgdmVyc2lvbjogJzEuMScgfTtcbiAgICAgICAgICAgIHRoaXMudGFncyA9IE9iamVjdC5hc3NpZ24oe30sIERpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MpO1xuICAgICAgICAgICAgdGhpcy5hdE5leHREb2N1bWVudCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnRzID0gbGluZS50cmltKCkuc3BsaXQoL1sgXFx0XSsvKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgICAgICAgY2FzZSAnJVRBRyc6IHtcbiAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoMCwgJyVUQUcgZGlyZWN0aXZlIHNob3VsZCBjb250YWluIGV4YWN0bHkgdHdvIHBhcnRzJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPCAyKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBbaGFuZGxlLCBwcmVmaXhdID0gcGFydHM7XG4gICAgICAgICAgICAgICAgdGhpcy50YWdzW2hhbmRsZV0gPSBwcmVmaXg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICclWUFNTCc6IHtcbiAgICAgICAgICAgICAgICB0aGlzLnlhbWwuZXhwbGljaXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcigwLCAnJVlBTUwgZGlyZWN0aXZlIHNob3VsZCBjb250YWluIGV4YWN0bHkgb25lIHBhcnQnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBbdmVyc2lvbl0gPSBwYXJ0cztcbiAgICAgICAgICAgICAgICBpZiAodmVyc2lvbiA9PT0gJzEuMScgfHwgdmVyc2lvbiA9PT0gJzEuMicpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy55YW1sLnZlcnNpb24gPSB2ZXJzaW9uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzVmFsaWQgPSAvXlxcZCtcXC5cXGQrJC8udGVzdCh2ZXJzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcig2LCBgVW5zdXBwb3J0ZWQgWUFNTCB2ZXJzaW9uICR7dmVyc2lvbn1gLCBpc1ZhbGlkKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgb25FcnJvcigwLCBgVW5rbm93biBkaXJlY3RpdmUgJHtuYW1lfWAsIHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlcyBhIHRhZywgbWF0Y2hpbmcgaGFuZGxlcyB0byB0aG9zZSBkZWZpbmVkIGluICVUQUcgZGlyZWN0aXZlcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFJlc29sdmVkIHRhZywgd2hpY2ggbWF5IGFsc28gYmUgdGhlIG5vbi1zcGVjaWZpYyB0YWcgYCchJ2Agb3IgYVxuICAgICAqICAgYCchbG9jYWwnYCB0YWcsIG9yIGBudWxsYCBpZiB1bnJlc29sdmFibGUuXG4gICAgICovXG4gICAgdGFnTmFtZShzb3VyY2UsIG9uRXJyb3IpIHtcbiAgICAgICAgaWYgKHNvdXJjZSA9PT0gJyEnKVxuICAgICAgICAgICAgcmV0dXJuICchJzsgLy8gbm9uLXNwZWNpZmljIHRhZ1xuICAgICAgICBpZiAoc291cmNlWzBdICE9PSAnIScpIHtcbiAgICAgICAgICAgIG9uRXJyb3IoYE5vdCBhIHZhbGlkIHRhZzogJHtzb3VyY2V9YCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc291cmNlWzFdID09PSAnPCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHZlcmJhdGltID0gc291cmNlLnNsaWNlKDIsIC0xKTtcbiAgICAgICAgICAgIGlmICh2ZXJiYXRpbSA9PT0gJyEnIHx8IHZlcmJhdGltID09PSAnISEnKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcihgVmVyYmF0aW0gdGFncyBhcmVuJ3QgcmVzb2x2ZWQsIHNvICR7c291cmNlfSBpcyBpbnZhbGlkLmApO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNvdXJjZVtzb3VyY2UubGVuZ3RoIC0gMV0gIT09ICc+JylcbiAgICAgICAgICAgICAgICBvbkVycm9yKCdWZXJiYXRpbSB0YWdzIG11c3QgZW5kIHdpdGggYSA+Jyk7XG4gICAgICAgICAgICByZXR1cm4gdmVyYmF0aW07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgWywgaGFuZGxlLCBzdWZmaXhdID0gc291cmNlLm1hdGNoKC9eKC4qISkoW14hXSopJC9zKTtcbiAgICAgICAgaWYgKCFzdWZmaXgpXG4gICAgICAgICAgICBvbkVycm9yKGBUaGUgJHtzb3VyY2V9IHRhZyBoYXMgbm8gc3VmZml4YCk7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMudGFnc1toYW5kbGVdO1xuICAgICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyBkZWNvZGVVUklDb21wb25lbnQoc3VmZml4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIG9uRXJyb3IoU3RyaW5nKGVycm9yKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhbmRsZSA9PT0gJyEnKVxuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZTsgLy8gbG9jYWwgdGFnXG4gICAgICAgIG9uRXJyb3IoYENvdWxkIG5vdCByZXNvbHZlIHRhZzogJHtzb3VyY2V9YCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIGZ1bGx5IHJlc29sdmVkIHRhZywgcmV0dXJucyBpdHMgcHJpbnRhYmxlIHN0cmluZyBmb3JtLFxuICAgICAqIHRha2luZyBpbnRvIGFjY291bnQgY3VycmVudCB0YWcgcHJlZml4ZXMgYW5kIGRlZmF1bHRzLlxuICAgICAqL1xuICAgIHRhZ1N0cmluZyh0YWcpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaGFuZGxlLCBwcmVmaXhdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMudGFncykpIHtcbiAgICAgICAgICAgIGlmICh0YWcuc3RhcnRzV2l0aChwcmVmaXgpKVxuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGUgKyBlc2NhcGVUYWdOYW1lKHRhZy5zdWJzdHJpbmcocHJlZml4Lmxlbmd0aCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YWdbMF0gPT09ICchJyA/IHRhZyA6IGAhPCR7dGFnfT5gO1xuICAgIH1cbiAgICB0b1N0cmluZyhkb2MpIHtcbiAgICAgICAgY29uc3QgbGluZXMgPSB0aGlzLnlhbWwuZXhwbGljaXRcbiAgICAgICAgICAgID8gW2AlWUFNTCAke3RoaXMueWFtbC52ZXJzaW9uIHx8ICcxLjInfWBdXG4gICAgICAgICAgICA6IFtdO1xuICAgICAgICBjb25zdCB0YWdFbnRyaWVzID0gT2JqZWN0LmVudHJpZXModGhpcy50YWdzKTtcbiAgICAgICAgbGV0IHRhZ05hbWVzO1xuICAgICAgICBpZiAoZG9jICYmIHRhZ0VudHJpZXMubGVuZ3RoID4gMCAmJiBpc05vZGUoZG9jLmNvbnRlbnRzKSkge1xuICAgICAgICAgICAgY29uc3QgdGFncyA9IHt9O1xuICAgICAgICAgICAgdmlzaXQoZG9jLmNvbnRlbnRzLCAoX2tleSwgbm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpc05vZGUobm9kZSkgJiYgbm9kZS50YWcpXG4gICAgICAgICAgICAgICAgICAgIHRhZ3Nbbm9kZS50YWddID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGFnTmFtZXMgPSBPYmplY3Qua2V5cyh0YWdzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0YWdOYW1lcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gb2YgdGFnRW50cmllcykge1xuICAgICAgICAgICAgaWYgKGhhbmRsZSA9PT0gJyEhJyAmJiBwcmVmaXggPT09ICd0YWc6eWFtbC5vcmcsMjAwMjonKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKCFkb2MgfHwgdGFnTmFtZXMuc29tZSh0biA9PiB0bi5zdGFydHNXaXRoKHByZWZpeCkpKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goYCVUQUcgJHtoYW5kbGV9ICR7cHJlZml4fWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICB9XG59XG5EaXJlY3RpdmVzLmRlZmF1bHRZYW1sID0geyBleHBsaWNpdDogZmFsc2UsIHZlcnNpb246ICcxLjInIH07XG5EaXJlY3RpdmVzLmRlZmF1bHRUYWdzID0geyAnISEnOiAndGFnOnlhbWwub3JnLDIwMDI6JyB9O1xuXG5leHBvcnQgeyBEaXJlY3RpdmVzIH07XG4iLCAiaW1wb3J0IHsgaXNTY2FsYXIsIGlzQ29sbGVjdGlvbiB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IHZpc2l0IH0gZnJvbSAnLi4vdmlzaXQuanMnO1xuXG4vKipcbiAqIFZlcmlmeSB0aGF0IHRoZSBpbnB1dCBzdHJpbmcgaXMgYSB2YWxpZCBhbmNob3IuXG4gKlxuICogV2lsbCB0aHJvdyBvbiBlcnJvcnMuXG4gKi9cbmZ1bmN0aW9uIGFuY2hvcklzVmFsaWQoYW5jaG9yKSB7XG4gICAgaWYgKC9bXFx4MDAtXFx4MTlcXHMsW1xcXXt9XS8udGVzdChhbmNob3IpKSB7XG4gICAgICAgIGNvbnN0IHNhID0gSlNPTi5zdHJpbmdpZnkoYW5jaG9yKTtcbiAgICAgICAgY29uc3QgbXNnID0gYEFuY2hvciBtdXN0IG5vdCBjb250YWluIHdoaXRlc3BhY2Ugb3IgY29udHJvbCBjaGFyYWN0ZXJzOiAke3NhfWA7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGFuY2hvck5hbWVzKHJvb3QpIHtcbiAgICBjb25zdCBhbmNob3JzID0gbmV3IFNldCgpO1xuICAgIHZpc2l0KHJvb3QsIHtcbiAgICAgICAgVmFsdWUoX2tleSwgbm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUuYW5jaG9yKVxuICAgICAgICAgICAgICAgIGFuY2hvcnMuYWRkKG5vZGUuYW5jaG9yKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBhbmNob3JzO1xufVxuLyoqIEZpbmQgYSBuZXcgYW5jaG9yIG5hbWUgd2l0aCB0aGUgZ2l2ZW4gYHByZWZpeGAgYW5kIGEgb25lLWluZGV4ZWQgc3VmZml4LiAqL1xuZnVuY3Rpb24gZmluZE5ld0FuY2hvcihwcmVmaXgsIGV4Y2x1ZGUpIHtcbiAgICBmb3IgKGxldCBpID0gMTsgdHJ1ZTsgKytpKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBgJHtwcmVmaXh9JHtpfWA7XG4gICAgICAgIGlmICghZXhjbHVkZS5oYXMobmFtZSkpXG4gICAgICAgICAgICByZXR1cm4gbmFtZTtcbiAgICB9XG59XG5mdW5jdGlvbiBjcmVhdGVOb2RlQW5jaG9ycyhkb2MsIHByZWZpeCkge1xuICAgIGNvbnN0IGFsaWFzT2JqZWN0cyA9IFtdO1xuICAgIGNvbnN0IHNvdXJjZU9iamVjdHMgPSBuZXcgTWFwKCk7XG4gICAgbGV0IHByZXZBbmNob3JzID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgICBvbkFuY2hvcjogKHNvdXJjZSkgPT4ge1xuICAgICAgICAgICAgYWxpYXNPYmplY3RzLnB1c2goc291cmNlKTtcbiAgICAgICAgICAgIHByZXZBbmNob3JzID8/IChwcmV2QW5jaG9ycyA9IGFuY2hvck5hbWVzKGRvYykpO1xuICAgICAgICAgICAgY29uc3QgYW5jaG9yID0gZmluZE5ld0FuY2hvcihwcmVmaXgsIHByZXZBbmNob3JzKTtcbiAgICAgICAgICAgIHByZXZBbmNob3JzLmFkZChhbmNob3IpO1xuICAgICAgICAgICAgcmV0dXJuIGFuY2hvcjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdpdGggY2lyY3VsYXIgcmVmZXJlbmNlcywgdGhlIHNvdXJjZSBub2RlIGlzIG9ubHkgcmVzb2x2ZWQgYWZ0ZXIgYWxsXG4gICAgICAgICAqIG9mIGl0cyBjaGlsZCBub2RlcyBhcmUuIFRoaXMgaXMgd2h5IGFuY2hvcnMgYXJlIHNldCBvbmx5IGFmdGVyIGFsbCBvZlxuICAgICAgICAgKiB0aGUgbm9kZXMgaGF2ZSBiZWVuIGNyZWF0ZWQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBbmNob3JzOiAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBhbGlhc09iamVjdHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWYgPSBzb3VyY2VPYmplY3RzLmdldChzb3VyY2UpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVmID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgICAgICAgICByZWYuYW5jaG9yICYmXG4gICAgICAgICAgICAgICAgICAgIChpc1NjYWxhcihyZWYubm9kZSkgfHwgaXNDb2xsZWN0aW9uKHJlZi5ub2RlKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmLm5vZGUuYW5jaG9yID0gcmVmLmFuY2hvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdGYWlsZWQgdG8gcmVzb2x2ZSByZXBlYXRlZCBvYmplY3QgKHRoaXMgc2hvdWxkIG5vdCBoYXBwZW4pJyk7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzb3VyY2VPYmplY3RzXG4gICAgfTtcbn1cblxuZXhwb3J0IHsgYW5jaG9ySXNWYWxpZCwgYW5jaG9yTmFtZXMsIGNyZWF0ZU5vZGVBbmNob3JzLCBmaW5kTmV3QW5jaG9yIH07XG4iLCAiLyoqXG4gKiBBcHBsaWVzIHRoZSBKU09OLnBhcnNlIHJldml2ZXIgYWxnb3JpdGhtIGFzIGRlZmluZWQgaW4gdGhlIEVDTUEtMjYyIHNwZWMsXG4gKiBpbiBzZWN0aW9uIDI0LjUuMS4xIFwiUnVudGltZSBTZW1hbnRpY3M6IEludGVybmFsaXplSlNPTlByb3BlcnR5XCIgb2YgdGhlXG4gKiAyMDIxIGVkaXRpb246IGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtanNvbi5wYXJzZVxuICpcbiAqIEluY2x1ZGVzIGV4dGVuc2lvbnMgZm9yIGhhbmRsaW5nIE1hcCBhbmQgU2V0IG9iamVjdHMuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5UmV2aXZlcihyZXZpdmVyLCBvYmosIGtleSwgdmFsKSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gdmFsLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdjAgPSB2YWxbaV07XG4gICAgICAgICAgICAgICAgY29uc3QgdjEgPSBhcHBseVJldml2ZXIocmV2aXZlciwgdmFsLCBTdHJpbmcoaSksIHYwKTtcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWFycmF5LWRlbGV0ZVxuICAgICAgICAgICAgICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdmFsW2ldO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYxICE9PSB2MClcbiAgICAgICAgICAgICAgICAgICAgdmFsW2ldID0gdjE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGsgb2YgQXJyYXkuZnJvbSh2YWwua2V5cygpKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYwID0gdmFsLmdldChrKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2MSA9IGFwcGx5UmV2aXZlcihyZXZpdmVyLCB2YWwsIGssIHYwKTtcbiAgICAgICAgICAgICAgICBpZiAodjEgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgdmFsLmRlbGV0ZShrKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2MSAhPT0gdjApXG4gICAgICAgICAgICAgICAgICAgIHZhbC5zZXQoaywgdjEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCB2MCBvZiBBcnJheS5mcm9tKHZhbCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2MSA9IGFwcGx5UmV2aXZlcihyZXZpdmVyLCB2YWwsIHYwLCB2MCk7XG4gICAgICAgICAgICAgICAgaWYgKHYxID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIHZhbC5kZWxldGUodjApO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYxICE9PSB2MCkge1xuICAgICAgICAgICAgICAgICAgICB2YWwuZGVsZXRlKHYwKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsLmFkZCh2MSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yIChjb25zdCBbaywgdjBdIG9mIE9iamVjdC5lbnRyaWVzKHZhbCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2MSA9IGFwcGx5UmV2aXZlcihyZXZpdmVyLCB2YWwsIGssIHYwKTtcbiAgICAgICAgICAgICAgICBpZiAodjEgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHZhbFtrXTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2MSAhPT0gdjApXG4gICAgICAgICAgICAgICAgICAgIHZhbFtrXSA9IHYxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXZpdmVyLmNhbGwob2JqLCBrZXksIHZhbCk7XG59XG5cbmV4cG9ydCB7IGFwcGx5UmV2aXZlciB9O1xuIiwgImltcG9ydCB7IGhhc0FuY2hvciB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IGNvbnZlcnQgYW55IG5vZGUgb3IgaXRzIGNvbnRlbnRzIHRvIG5hdGl2ZSBKYXZhU2NyaXB0XG4gKlxuICogQHBhcmFtIHZhbHVlIC0gVGhlIGlucHV0IHZhbHVlXG4gKiBAcGFyYW0gYXJnIC0gSWYgYHZhbHVlYCBkZWZpbmVzIGEgYHRvSlNPTigpYCBtZXRob2QsIHVzZSB0aGlzXG4gKiAgIGFzIGl0cyBmaXJzdCBhcmd1bWVudFxuICogQHBhcmFtIGN0eCAtIENvbnZlcnNpb24gY29udGV4dCwgb3JpZ2luYWxseSBzZXQgaW4gRG9jdW1lbnQjdG9KUygpLiBJZlxuICogICBgeyBrZWVwOiB0cnVlIH1gIGlzIG5vdCBzZXQsIG91dHB1dCBzaG91bGQgYmUgc3VpdGFibGUgZm9yIEpTT05cbiAqICAgc3RyaW5naWZpY2F0aW9uLlxuICovXG5mdW5jdGlvbiB0b0pTKHZhbHVlLCBhcmcsIGN0eCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLXJldHVyblxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHZhbHVlLm1hcCgodiwgaSkgPT4gdG9KUyh2LCBTdHJpbmcoaSksIGN0eCkpO1xuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudG9KU09OID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWNhbGxcbiAgICAgICAgaWYgKCFjdHggfHwgIWhhc0FuY2hvcih2YWx1ZSkpXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9KU09OKGFyZywgY3R4KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IHsgYWxpYXNDb3VudDogMCwgY291bnQ6IDEsIHJlczogdW5kZWZpbmVkIH07XG4gICAgICAgIGN0eC5hbmNob3JzLnNldCh2YWx1ZSwgZGF0YSk7XG4gICAgICAgIGN0eC5vbkNyZWF0ZSA9IHJlcyA9PiB7XG4gICAgICAgICAgICBkYXRhLnJlcyA9IHJlcztcbiAgICAgICAgICAgIGRlbGV0ZSBjdHgub25DcmVhdGU7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlcyA9IHZhbHVlLnRvSlNPTihhcmcsIGN0eCk7XG4gICAgICAgIGlmIChjdHgub25DcmVhdGUpXG4gICAgICAgICAgICBjdHgub25DcmVhdGUocmVzKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcgJiYgIWN0eD8ua2VlcClcbiAgICAgICAgcmV0dXJuIE51bWJlcih2YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgeyB0b0pTIH07XG4iLCAiaW1wb3J0IHsgYXBwbHlSZXZpdmVyIH0gZnJvbSAnLi4vZG9jL2FwcGx5UmV2aXZlci5qcyc7XG5pbXBvcnQgeyBOT0RFX1RZUEUsIGlzRG9jdW1lbnQgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IHRvSlMgfSBmcm9tICcuL3RvSlMuanMnO1xuXG5jbGFzcyBOb2RlQmFzZSB7XG4gICAgY29uc3RydWN0b3IodHlwZSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgTk9ERV9UWVBFLCB7IHZhbHVlOiB0eXBlIH0pO1xuICAgIH1cbiAgICAvKiogQ3JlYXRlIGEgY29weSBvZiB0aGlzIG5vZGUuICAqL1xuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjb3B5ID0gT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcyksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHRoaXMpKTtcbiAgICAgICAgaWYgKHRoaXMucmFuZ2UpXG4gICAgICAgICAgICBjb3B5LnJhbmdlID0gdGhpcy5yYW5nZS5zbGljZSgpO1xuICAgICAgICByZXR1cm4gY29weTtcbiAgICB9XG4gICAgLyoqIEEgcGxhaW4gSmF2YVNjcmlwdCByZXByZXNlbnRhdGlvbiBvZiB0aGlzIG5vZGUuICovXG4gICAgdG9KUyhkb2MsIHsgbWFwQXNNYXAsIG1heEFsaWFzQ291bnQsIG9uQW5jaG9yLCByZXZpdmVyIH0gPSB7fSkge1xuICAgICAgICBpZiAoIWlzRG9jdW1lbnQoZG9jKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgZG9jdW1lbnQgYXJndW1lbnQgaXMgcmVxdWlyZWQnKTtcbiAgICAgICAgY29uc3QgY3R4ID0ge1xuICAgICAgICAgICAgYW5jaG9yczogbmV3IE1hcCgpLFxuICAgICAgICAgICAgZG9jLFxuICAgICAgICAgICAga2VlcDogdHJ1ZSxcbiAgICAgICAgICAgIG1hcEFzTWFwOiBtYXBBc01hcCA9PT0gdHJ1ZSxcbiAgICAgICAgICAgIG1hcEtleVdhcm5lZDogZmFsc2UsXG4gICAgICAgICAgICBtYXhBbGlhc0NvdW50OiB0eXBlb2YgbWF4QWxpYXNDb3VudCA9PT0gJ251bWJlcicgPyBtYXhBbGlhc0NvdW50IDogMTAwXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlcyA9IHRvSlModGhpcywgJycsIGN0eCk7XG4gICAgICAgIGlmICh0eXBlb2Ygb25BbmNob3IgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgY291bnQsIHJlcyB9IG9mIGN0eC5hbmNob3JzLnZhbHVlcygpKVxuICAgICAgICAgICAgICAgIG9uQW5jaG9yKHJlcywgY291bnQpO1xuICAgICAgICByZXR1cm4gdHlwZW9mIHJldml2ZXIgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHsgJyc6IHJlcyB9LCAnJywgcmVzKVxuICAgICAgICAgICAgOiByZXM7XG4gICAgfVxufVxuXG5leHBvcnQgeyBOb2RlQmFzZSB9O1xuIiwgImltcG9ydCB7IGFuY2hvcklzVmFsaWQgfSBmcm9tICcuLi9kb2MvYW5jaG9ycy5qcyc7XG5pbXBvcnQgeyB2aXNpdCB9IGZyb20gJy4uL3Zpc2l0LmpzJztcbmltcG9ydCB7IEFMSUFTLCBpc0FsaWFzLCBpc0NvbGxlY3Rpb24sIGlzUGFpciwgaGFzQW5jaG9yIH0gZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBOb2RlQmFzZSB9IGZyb20gJy4vTm9kZS5qcyc7XG5pbXBvcnQgeyB0b0pTIH0gZnJvbSAnLi90b0pTLmpzJztcblxuY2xhc3MgQWxpYXMgZXh0ZW5kcyBOb2RlQmFzZSB7XG4gICAgY29uc3RydWN0b3Ioc291cmNlKSB7XG4gICAgICAgIHN1cGVyKEFMSUFTKTtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndGFnJywge1xuICAgICAgICAgICAgc2V0KCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWxpYXMgbm9kZXMgY2Fubm90IGhhdmUgdGFncycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVzb2x2ZSB0aGUgdmFsdWUgb2YgdGhpcyBhbGlhcyB3aXRoaW4gYGRvY2AsIGZpbmRpbmcgdGhlIGxhc3RcbiAgICAgKiBpbnN0YW5jZSBvZiB0aGUgYHNvdXJjZWAgYW5jaG9yIGJlZm9yZSB0aGlzIG5vZGUuXG4gICAgICovXG4gICAgcmVzb2x2ZShkb2MsIGN0eCkge1xuICAgICAgICBpZiAoY3R4Py5tYXhBbGlhc0NvdW50ID09PSAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdBbGlhcyByZXNvbHV0aW9uIGlzIGRpc2FibGVkJyk7XG4gICAgICAgIGxldCBub2RlcztcbiAgICAgICAgaWYgKGN0eD8uYWxpYXNSZXNvbHZlQ2FjaGUpIHtcbiAgICAgICAgICAgIG5vZGVzID0gY3R4LmFsaWFzUmVzb2x2ZUNhY2hlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbm9kZXMgPSBbXTtcbiAgICAgICAgICAgIHZpc2l0KGRvYywge1xuICAgICAgICAgICAgICAgIE5vZGU6IChfa2V5LCBub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0FsaWFzKG5vZGUpIHx8IGhhc0FuY2hvcihub2RlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoY3R4KVxuICAgICAgICAgICAgICAgIGN0eC5hbGlhc1Jlc29sdmVDYWNoZSA9IG5vZGVzO1xuICAgICAgICB9XG4gICAgICAgIGxldCBmb3VuZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICBpZiAobm9kZSA9PT0gdGhpcylcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGlmIChub2RlLmFuY2hvciA9PT0gdGhpcy5zb3VyY2UpXG4gICAgICAgICAgICAgICAgZm91bmQgPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICB9XG4gICAgdG9KU09OKF9hcmcsIGN0eCkge1xuICAgICAgICBpZiAoIWN0eClcbiAgICAgICAgICAgIHJldHVybiB7IHNvdXJjZTogdGhpcy5zb3VyY2UgfTtcbiAgICAgICAgY29uc3QgeyBhbmNob3JzLCBkb2MsIG1heEFsaWFzQ291bnQgfSA9IGN0eDtcbiAgICAgICAgY29uc3Qgc291cmNlID0gdGhpcy5yZXNvbHZlKGRvYywgY3R4KTtcbiAgICAgICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IGBVbnJlc29sdmVkIGFsaWFzICh0aGUgYW5jaG9yIG11c3QgYmUgc2V0IGJlZm9yZSB0aGUgYWxpYXMpOiAke3RoaXMuc291cmNlfWA7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IobXNnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGF0YSA9IGFuY2hvcnMuZ2V0KHNvdXJjZSk7XG4gICAgICAgIGlmICghZGF0YSkge1xuICAgICAgICAgICAgLy8gUmVzb2x2ZSBhbmNob3JzIGZvciBOb2RlLnByb3RvdHlwZS50b0pTKClcbiAgICAgICAgICAgIHRvSlMoc291cmNlLCBudWxsLCBjdHgpO1xuICAgICAgICAgICAgZGF0YSA9IGFuY2hvcnMuZ2V0KHNvdXJjZSk7XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmIChkYXRhPy5yZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gJ1RoaXMgc2hvdWxkIG5vdCBoYXBwZW46IEFsaWFzIGFuY2hvciB3YXMgbm90IHJlc29sdmVkPyc7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IobXNnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWF4QWxpYXNDb3VudCA+PSAwKSB7XG4gICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XG4gICAgICAgICAgICBpZiAoZGF0YS5hbGlhc0NvdW50ID09PSAwKVxuICAgICAgICAgICAgICAgIGRhdGEuYWxpYXNDb3VudCA9IGdldEFsaWFzQ291bnQoZG9jLCBzb3VyY2UsIGFuY2hvcnMpO1xuICAgICAgICAgICAgaWYgKGRhdGEuY291bnQgKiBkYXRhLmFsaWFzQ291bnQgPiBtYXhBbGlhc0NvdW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gJ0V4Y2Vzc2l2ZSBhbGlhcyBjb3VudCBpbmRpY2F0ZXMgYSByZXNvdXJjZSBleGhhdXN0aW9uIGF0dGFjayc7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGEucmVzO1xuICAgIH1cbiAgICB0b1N0cmluZyhjdHgsIF9vbkNvbW1lbnQsIF9vbkNob21wS2VlcCkge1xuICAgICAgICBjb25zdCBzcmMgPSBgKiR7dGhpcy5zb3VyY2V9YDtcbiAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgYW5jaG9ySXNWYWxpZCh0aGlzLnNvdXJjZSk7XG4gICAgICAgICAgICBpZiAoY3R4Lm9wdGlvbnMudmVyaWZ5QWxpYXNPcmRlciAmJiAhY3R4LmFuY2hvcnMuaGFzKHRoaXMuc291cmNlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IGBVbnJlc29sdmVkIGFsaWFzICh0aGUgYW5jaG9yIG11c3QgYmUgc2V0IGJlZm9yZSB0aGUgYWxpYXMpOiAke3RoaXMuc291cmNlfWA7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY3R4LmltcGxpY2l0S2V5KVxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtzcmN9IGA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNyYztcbiAgICB9XG59XG5mdW5jdGlvbiBnZXRBbGlhc0NvdW50KGRvYywgbm9kZSwgYW5jaG9ycykge1xuICAgIGlmIChpc0FsaWFzKG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IG5vZGUucmVzb2x2ZShkb2MpO1xuICAgICAgICBjb25zdCBhbmNob3IgPSBhbmNob3JzICYmIHNvdXJjZSAmJiBhbmNob3JzLmdldChzb3VyY2UpO1xuICAgICAgICByZXR1cm4gYW5jaG9yID8gYW5jaG9yLmNvdW50ICogYW5jaG9yLmFsaWFzQ291bnQgOiAwO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc0NvbGxlY3Rpb24obm9kZSkpIHtcbiAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIG5vZGUuaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGMgPSBnZXRBbGlhc0NvdW50KGRvYywgaXRlbSwgYW5jaG9ycyk7XG4gICAgICAgICAgICBpZiAoYyA+IGNvdW50KVxuICAgICAgICAgICAgICAgIGNvdW50ID0gYztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzUGFpcihub2RlKSkge1xuICAgICAgICBjb25zdCBrYyA9IGdldEFsaWFzQ291bnQoZG9jLCBub2RlLmtleSwgYW5jaG9ycyk7XG4gICAgICAgIGNvbnN0IHZjID0gZ2V0QWxpYXNDb3VudChkb2MsIG5vZGUudmFsdWUsIGFuY2hvcnMpO1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgoa2MsIHZjKTtcbiAgICB9XG4gICAgcmV0dXJuIDE7XG59XG5cbmV4cG9ydCB7IEFsaWFzIH07XG4iLCAiaW1wb3J0IHsgU0NBTEFSIH0gZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBOb2RlQmFzZSB9IGZyb20gJy4vTm9kZS5qcyc7XG5pbXBvcnQgeyB0b0pTIH0gZnJvbSAnLi90b0pTLmpzJztcblxuY29uc3QgaXNTY2FsYXJWYWx1ZSA9ICh2YWx1ZSkgPT4gIXZhbHVlIHx8ICh0eXBlb2YgdmFsdWUgIT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jyk7XG5jbGFzcyBTY2FsYXIgZXh0ZW5kcyBOb2RlQmFzZSB7XG4gICAgY29uc3RydWN0b3IodmFsdWUpIHtcbiAgICAgICAgc3VwZXIoU0NBTEFSKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICB0b0pTT04oYXJnLCBjdHgpIHtcbiAgICAgICAgcmV0dXJuIGN0eD8ua2VlcCA/IHRoaXMudmFsdWUgOiB0b0pTKHRoaXMudmFsdWUsIGFyZywgY3R4KTtcbiAgICB9XG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBTdHJpbmcodGhpcy52YWx1ZSk7XG4gICAgfVxufVxuU2NhbGFyLkJMT0NLX0ZPTERFRCA9ICdCTE9DS19GT0xERUQnO1xuU2NhbGFyLkJMT0NLX0xJVEVSQUwgPSAnQkxPQ0tfTElURVJBTCc7XG5TY2FsYXIuUExBSU4gPSAnUExBSU4nO1xuU2NhbGFyLlFVT1RFX0RPVUJMRSA9ICdRVU9URV9ET1VCTEUnO1xuU2NhbGFyLlFVT1RFX1NJTkdMRSA9ICdRVU9URV9TSU5HTEUnO1xuXG5leHBvcnQgeyBTY2FsYXIsIGlzU2NhbGFyVmFsdWUgfTtcbiIsICJpbXBvcnQgeyBBbGlhcyB9IGZyb20gJy4uL25vZGVzL0FsaWFzLmpzJztcbmltcG9ydCB7IGlzTm9kZSwgaXNQYWlyLCBNQVAsIFNFUSwgaXNEb2N1bWVudCB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uL25vZGVzL1NjYWxhci5qcyc7XG5cbmNvbnN0IGRlZmF1bHRUYWdQcmVmaXggPSAndGFnOnlhbWwub3JnLDIwMDI6JztcbmZ1bmN0aW9uIGZpbmRUYWdPYmplY3QodmFsdWUsIHRhZ05hbWUsIHRhZ3MpIHtcbiAgICBpZiAodGFnTmFtZSkge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHRhZ3MuZmlsdGVyKHQgPT4gdC50YWcgPT09IHRhZ05hbWUpO1xuICAgICAgICBjb25zdCB0YWdPYmogPSBtYXRjaC5maW5kKHQgPT4gIXQuZm9ybWF0KSA/PyBtYXRjaFswXTtcbiAgICAgICAgaWYgKCF0YWdPYmopXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRhZyAke3RhZ05hbWV9IG5vdCBmb3VuZGApO1xuICAgICAgICByZXR1cm4gdGFnT2JqO1xuICAgIH1cbiAgICByZXR1cm4gdGFncy5maW5kKHQgPT4gdC5pZGVudGlmeT8uKHZhbHVlKSAmJiAhdC5mb3JtYXQpO1xufVxuZnVuY3Rpb24gY3JlYXRlTm9kZSh2YWx1ZSwgdGFnTmFtZSwgY3R4KSB7XG4gICAgaWYgKGlzRG9jdW1lbnQodmFsdWUpKVxuICAgICAgICB2YWx1ZSA9IHZhbHVlLmNvbnRlbnRzO1xuICAgIGlmIChpc05vZGUodmFsdWUpKVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgaWYgKGlzUGFpcih2YWx1ZSkpIHtcbiAgICAgICAgY29uc3QgbWFwID0gY3R4LnNjaGVtYVtNQVBdLmNyZWF0ZU5vZGU/LihjdHguc2NoZW1hLCBudWxsLCBjdHgpO1xuICAgICAgICBtYXAuaXRlbXMucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFN0cmluZyB8fFxuICAgICAgICB2YWx1ZSBpbnN0YW5jZW9mIE51bWJlciB8fFxuICAgICAgICB2YWx1ZSBpbnN0YW5jZW9mIEJvb2xlYW4gfHxcbiAgICAgICAgKHR5cGVvZiBCaWdJbnQgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlIGluc3RhbmNlb2YgQmlnSW50KSAvLyBub3Qgc3VwcG9ydGVkIGV2ZXJ5d2hlcmVcbiAgICApIHtcbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1zZXJpYWxpemVqc29ucHJvcGVydHlcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS52YWx1ZU9mKCk7XG4gICAgfVxuICAgIGNvbnN0IHsgYWxpYXNEdXBsaWNhdGVPYmplY3RzLCBvbkFuY2hvciwgb25UYWdPYmosIHNjaGVtYSwgc291cmNlT2JqZWN0cyB9ID0gY3R4O1xuICAgIC8vIERldGVjdCBkdXBsaWNhdGUgcmVmZXJlbmNlcyB0byB0aGUgc2FtZSBvYmplY3QgJiB1c2UgQWxpYXMgbm9kZXMgZm9yIGFsbFxuICAgIC8vIGFmdGVyIGZpcnN0LiBUaGUgYHJlZmAgd3JhcHBlciBhbGxvd3MgZm9yIGNpcmN1bGFyIHJlZmVyZW5jZXMgdG8gcmVzb2x2ZS5cbiAgICBsZXQgcmVmID0gdW5kZWZpbmVkO1xuICAgIGlmIChhbGlhc0R1cGxpY2F0ZU9iamVjdHMgJiYgdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICByZWYgPSBzb3VyY2VPYmplY3RzLmdldCh2YWx1ZSk7XG4gICAgICAgIGlmIChyZWYpIHtcbiAgICAgICAgICAgIHJlZi5hbmNob3IgPz8gKHJlZi5hbmNob3IgPSBvbkFuY2hvcih2YWx1ZSkpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBBbGlhcyhyZWYuYW5jaG9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlZiA9IHsgYW5jaG9yOiBudWxsLCBub2RlOiBudWxsIH07XG4gICAgICAgICAgICBzb3VyY2VPYmplY3RzLnNldCh2YWx1ZSwgcmVmKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodGFnTmFtZT8uc3RhcnRzV2l0aCgnISEnKSlcbiAgICAgICAgdGFnTmFtZSA9IGRlZmF1bHRUYWdQcmVmaXggKyB0YWdOYW1lLnNsaWNlKDIpO1xuICAgIGxldCB0YWdPYmogPSBmaW5kVGFnT2JqZWN0KHZhbHVlLCB0YWdOYW1lLCBzY2hlbWEudGFncyk7XG4gICAgaWYgKCF0YWdPYmopIHtcbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50b0pTT04gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWNhbGxcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9KU09OKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gbmV3IFNjYWxhcih2YWx1ZSk7XG4gICAgICAgICAgICBpZiAocmVmKVxuICAgICAgICAgICAgICAgIHJlZi5ub2RlID0gbm9kZTtcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9XG4gICAgICAgIHRhZ09iaiA9XG4gICAgICAgICAgICB2YWx1ZSBpbnN0YW5jZW9mIE1hcFxuICAgICAgICAgICAgICAgID8gc2NoZW1hW01BUF1cbiAgICAgICAgICAgICAgICA6IFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QodmFsdWUpXG4gICAgICAgICAgICAgICAgICAgID8gc2NoZW1hW1NFUV1cbiAgICAgICAgICAgICAgICAgICAgOiBzY2hlbWFbTUFQXTtcbiAgICB9XG4gICAgaWYgKG9uVGFnT2JqKSB7XG4gICAgICAgIG9uVGFnT2JqKHRhZ09iaik7XG4gICAgICAgIGRlbGV0ZSBjdHgub25UYWdPYmo7XG4gICAgfVxuICAgIGNvbnN0IG5vZGUgPSB0YWdPYmo/LmNyZWF0ZU5vZGVcbiAgICAgICAgPyB0YWdPYmouY3JlYXRlTm9kZShjdHguc2NoZW1hLCB2YWx1ZSwgY3R4KVxuICAgICAgICA6IHR5cGVvZiB0YWdPYmo/Lm5vZGVDbGFzcz8uZnJvbSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyB0YWdPYmoubm9kZUNsYXNzLmZyb20oY3R4LnNjaGVtYSwgdmFsdWUsIGN0eClcbiAgICAgICAgICAgIDogbmV3IFNjYWxhcih2YWx1ZSk7XG4gICAgaWYgKHRhZ05hbWUpXG4gICAgICAgIG5vZGUudGFnID0gdGFnTmFtZTtcbiAgICBlbHNlIGlmICghdGFnT2JqLmRlZmF1bHQpXG4gICAgICAgIG5vZGUudGFnID0gdGFnT2JqLnRhZztcbiAgICBpZiAocmVmKVxuICAgICAgICByZWYubm9kZSA9IG5vZGU7XG4gICAgcmV0dXJuIG5vZGU7XG59XG5cbmV4cG9ydCB7IGNyZWF0ZU5vZGUgfTtcbiIsICJpbXBvcnQgeyBjcmVhdGVOb2RlIH0gZnJvbSAnLi4vZG9jL2NyZWF0ZU5vZGUuanMnO1xuaW1wb3J0IHsgaXNOb2RlLCBpc1BhaXIsIGlzQ29sbGVjdGlvbiwgaXNTY2FsYXIgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IE5vZGVCYXNlIH0gZnJvbSAnLi9Ob2RlLmpzJztcblxuZnVuY3Rpb24gY29sbGVjdGlvbkZyb21QYXRoKHNjaGVtYSwgcGF0aCwgdmFsdWUpIHtcbiAgICBsZXQgdiA9IHZhbHVlO1xuICAgIGZvciAobGV0IGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIGNvbnN0IGsgPSBwYXRoW2ldO1xuICAgICAgICBpZiAodHlwZW9mIGsgPT09ICdudW1iZXInICYmIE51bWJlci5pc0ludGVnZXIoaykgJiYgayA+PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBhID0gW107XG4gICAgICAgICAgICBhW2tdID0gdjtcbiAgICAgICAgICAgIHYgPSBhO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdiA9IG5ldyBNYXAoW1trLCB2XV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVOb2RlKHYsIHVuZGVmaW5lZCwge1xuICAgICAgICBhbGlhc0R1cGxpY2F0ZU9iamVjdHM6IGZhbHNlLFxuICAgICAgICBrZWVwVW5kZWZpbmVkOiBmYWxzZSxcbiAgICAgICAgb25BbmNob3I6ICgpID0+IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBzaG91bGQgbm90IGhhcHBlbiwgcGxlYXNlIHJlcG9ydCBhIGJ1Zy4nKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2NoZW1hLFxuICAgICAgICBzb3VyY2VPYmplY3RzOiBuZXcgTWFwKClcbiAgICB9KTtcbn1cbi8vIFR5cGUgZ3VhcmQgaXMgaW50ZW50aW9uYWxseSBhIGxpdHRsZSB3cm9uZyBzbyBhcyB0byBiZSBtb3JlIHVzZWZ1bCxcbi8vIGFzIGl0IGRvZXMgbm90IGNvdmVyIHVudHlwYWJsZSBlbXB0eSBub24tc3RyaW5nIGl0ZXJhYmxlcyAoZS5nLiBbXSkuXG5jb25zdCBpc0VtcHR5UGF0aCA9IChwYXRoKSA9PiBwYXRoID09IG51bGwgfHxcbiAgICAodHlwZW9mIHBhdGggPT09ICdvYmplY3QnICYmICEhcGF0aFtTeW1ib2wuaXRlcmF0b3JdKCkubmV4dCgpLmRvbmUpO1xuY2xhc3MgQ29sbGVjdGlvbiBleHRlbmRzIE5vZGVCYXNlIHtcbiAgICBjb25zdHJ1Y3Rvcih0eXBlLCBzY2hlbWEpIHtcbiAgICAgICAgc3VwZXIodHlwZSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnc2NoZW1hJywge1xuICAgICAgICAgICAgdmFsdWU6IHNjaGVtYSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGNvcHkgb2YgdGhpcyBjb2xsZWN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHNjaGVtYSAtIElmIGRlZmluZWQsIG92ZXJ3cml0ZXMgdGhlIG9yaWdpbmFsJ3Mgc2NoZW1hXG4gICAgICovXG4gICAgY2xvbmUoc2NoZW1hKSB7XG4gICAgICAgIGNvbnN0IGNvcHkgPSBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModGhpcykpO1xuICAgICAgICBpZiAoc2NoZW1hKVxuICAgICAgICAgICAgY29weS5zY2hlbWEgPSBzY2hlbWE7XG4gICAgICAgIGNvcHkuaXRlbXMgPSBjb3B5Lml0ZW1zLm1hcChpdCA9PiBpc05vZGUoaXQpIHx8IGlzUGFpcihpdCkgPyBpdC5jbG9uZShzY2hlbWEpIDogaXQpO1xuICAgICAgICBpZiAodGhpcy5yYW5nZSlcbiAgICAgICAgICAgIGNvcHkucmFuZ2UgPSB0aGlzLnJhbmdlLnNsaWNlKCk7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgdmFsdWUgdG8gdGhlIGNvbGxlY3Rpb24uIEZvciBgISFtYXBgIGFuZCBgISFvbWFwYCB0aGUgdmFsdWUgbXVzdFxuICAgICAqIGJlIGEgUGFpciBpbnN0YW5jZSBvciBhIGB7IGtleSwgdmFsdWUgfWAgb2JqZWN0LCB3aGljaCBtYXkgbm90IGhhdmUgYSBrZXlcbiAgICAgKiB0aGF0IGFscmVhZHkgZXhpc3RzIGluIHRoZSBtYXAuXG4gICAgICovXG4gICAgYWRkSW4ocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGlzRW1wdHlQYXRoKHBhdGgpKVxuICAgICAgICAgICAgdGhpcy5hZGQodmFsdWUpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldChrZXksIHRydWUpO1xuICAgICAgICAgICAgaWYgKGlzQ29sbGVjdGlvbihub2RlKSlcbiAgICAgICAgICAgICAgICBub2RlLmFkZEluKHJlc3QsIHZhbHVlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUgPT09IHVuZGVmaW5lZCAmJiB0aGlzLnNjaGVtYSlcbiAgICAgICAgICAgICAgICB0aGlzLnNldChrZXksIGNvbGxlY3Rpb25Gcm9tUGF0aCh0aGlzLnNjaGVtYSwgcmVzdCwgdmFsdWUpKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIFlBTUwgY29sbGVjdGlvbiBhdCAke2tleX0uIFJlbWFpbmluZyBwYXRoOiAke3Jlc3R9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHZhbHVlIGZyb20gdGhlIGNvbGxlY3Rpb24uXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBpdGVtIHdhcyBmb3VuZCBhbmQgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBkZWxldGVJbihwYXRoKSB7XG4gICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlKGtleSk7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldChrZXksIHRydWUpO1xuICAgICAgICBpZiAoaXNDb2xsZWN0aW9uKG5vZGUpKVxuICAgICAgICAgICAgcmV0dXJuIG5vZGUuZGVsZXRlSW4ocmVzdCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgWUFNTCBjb2xsZWN0aW9uIGF0ICR7a2V5fS4gUmVtYWluaW5nIHBhdGg6ICR7cmVzdH1gKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBpdGVtIGF0IGBrZXlgLCBvciBgdW5kZWZpbmVkYCBpZiBub3QgZm91bmQuIEJ5IGRlZmF1bHQgdW53cmFwc1xuICAgICAqIHNjYWxhciB2YWx1ZXMgZnJvbSB0aGVpciBzdXJyb3VuZGluZyBub2RlOyB0byBkaXNhYmxlIHNldCBga2VlcFNjYWxhcmAgdG9cbiAgICAgKiBgdHJ1ZWAgKGNvbGxlY3Rpb25zIGFyZSBhbHdheXMgcmV0dXJuZWQgaW50YWN0KS5cbiAgICAgKi9cbiAgICBnZXRJbihwYXRoLCBrZWVwU2NhbGFyKSB7XG4gICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgIGlmIChyZXN0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiAha2VlcFNjYWxhciAmJiBpc1NjYWxhcihub2RlKSA/IG5vZGUudmFsdWUgOiBub2RlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gaXNDb2xsZWN0aW9uKG5vZGUpID8gbm9kZS5nZXRJbihyZXN0LCBrZWVwU2NhbGFyKSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaGFzQWxsTnVsbFZhbHVlcyhhbGxvd1NjYWxhcikge1xuICAgICAgICByZXR1cm4gdGhpcy5pdGVtcy5ldmVyeShub2RlID0+IHtcbiAgICAgICAgICAgIGlmICghaXNQYWlyKG5vZGUpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IG4gPSBub2RlLnZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIChuID09IG51bGwgfHxcbiAgICAgICAgICAgICAgICAoYWxsb3dTY2FsYXIgJiZcbiAgICAgICAgICAgICAgICAgICAgaXNTY2FsYXIobikgJiZcbiAgICAgICAgICAgICAgICAgICAgbi52YWx1ZSA9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgICFuLmNvbW1lbnRCZWZvcmUgJiZcbiAgICAgICAgICAgICAgICAgICAgIW4uY29tbWVudCAmJlxuICAgICAgICAgICAgICAgICAgICAhbi50YWcpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgY29sbGVjdGlvbiBpbmNsdWRlcyBhIHZhbHVlIHdpdGggdGhlIGtleSBga2V5YC5cbiAgICAgKi9cbiAgICBoYXNJbihwYXRoKSB7XG4gICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFzKGtleSk7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldChrZXksIHRydWUpO1xuICAgICAgICByZXR1cm4gaXNDb2xsZWN0aW9uKG5vZGUpID8gbm9kZS5oYXNJbihyZXN0KSA6IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgdmFsdWUgaW4gdGhpcyBjb2xsZWN0aW9uLiBGb3IgYCEhc2V0YCwgYHZhbHVlYCBuZWVkcyB0byBiZSBhXG4gICAgICogYm9vbGVhbiB0byBhZGQvcmVtb3ZlIHRoZSBpdGVtIGZyb20gdGhlIHNldC5cbiAgICAgKi9cbiAgICBzZXRJbihwYXRoLCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBba2V5LCAuLi5yZXN0XSA9IHBhdGg7XG4gICAgICAgIGlmIChyZXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXQoa2V5LCB0cnVlKTtcbiAgICAgICAgICAgIGlmIChpc0NvbGxlY3Rpb24obm9kZSkpXG4gICAgICAgICAgICAgICAgbm9kZS5zZXRJbihyZXN0LCB2YWx1ZSk7XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlID09PSB1bmRlZmluZWQgJiYgdGhpcy5zY2hlbWEpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoa2V5LCBjb2xsZWN0aW9uRnJvbVBhdGgodGhpcy5zY2hlbWEsIHJlc3QsIHZhbHVlKSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBZQU1MIGNvbGxlY3Rpb24gYXQgJHtrZXl9LiBSZW1haW5pbmcgcGF0aDogJHtyZXN0fWApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgeyBDb2xsZWN0aW9uLCBjb2xsZWN0aW9uRnJvbVBhdGgsIGlzRW1wdHlQYXRoIH07XG4iLCAiLyoqXG4gKiBTdHJpbmdpZmllcyBhIGNvbW1lbnQuXG4gKlxuICogRW1wdHkgY29tbWVudCBsaW5lcyBhcmUgbGVmdCBlbXB0eSxcbiAqIGxpbmVzIGNvbnNpc3Rpbmcgb2YgYSBzaW5nbGUgc3BhY2UgYXJlIHJlcGxhY2VkIGJ5IGAjYCxcbiAqIGFuZCBhbGwgb3RoZXIgbGluZXMgYXJlIHByZWZpeGVkIHdpdGggYSBgI2AuXG4gKi9cbmNvbnN0IHN0cmluZ2lmeUNvbW1lbnQgPSAoc3RyKSA9PiBzdHIucmVwbGFjZSgvXig/ISQpKD86ICQpPy9nbSwgJyMnKTtcbmZ1bmN0aW9uIGluZGVudENvbW1lbnQoY29tbWVudCwgaW5kZW50KSB7XG4gICAgaWYgKC9eXFxuKyQvLnRlc3QoY29tbWVudCkpXG4gICAgICAgIHJldHVybiBjb21tZW50LnN1YnN0cmluZygxKTtcbiAgICByZXR1cm4gaW5kZW50ID8gY29tbWVudC5yZXBsYWNlKC9eKD8hICokKS9nbSwgaW5kZW50KSA6IGNvbW1lbnQ7XG59XG5jb25zdCBsaW5lQ29tbWVudCA9IChzdHIsIGluZGVudCwgY29tbWVudCkgPT4gc3RyLmVuZHNXaXRoKCdcXG4nKVxuICAgID8gaW5kZW50Q29tbWVudChjb21tZW50LCBpbmRlbnQpXG4gICAgOiBjb21tZW50LmluY2x1ZGVzKCdcXG4nKVxuICAgICAgICA/ICdcXG4nICsgaW5kZW50Q29tbWVudChjb21tZW50LCBpbmRlbnQpXG4gICAgICAgIDogKHN0ci5lbmRzV2l0aCgnICcpID8gJycgOiAnICcpICsgY29tbWVudDtcblxuZXhwb3J0IHsgaW5kZW50Q29tbWVudCwgbGluZUNvbW1lbnQsIHN0cmluZ2lmeUNvbW1lbnQgfTtcbiIsICJjb25zdCBGT0xEX0ZMT1cgPSAnZmxvdyc7XG5jb25zdCBGT0xEX0JMT0NLID0gJ2Jsb2NrJztcbmNvbnN0IEZPTERfUVVPVEVEID0gJ3F1b3RlZCc7XG4vKipcbiAqIFRyaWVzIHRvIGtlZXAgaW5wdXQgYXQgdXAgdG8gYGxpbmVXaWR0aGAgY2hhcmFjdGVycywgc3BsaXR0aW5nIG9ubHkgb24gc3BhY2VzXG4gKiBub3QgZm9sbG93ZWQgYnkgbmV3bGluZXMgb3Igc3BhY2VzIHVubGVzcyBgbW9kZWAgaXMgYCdxdW90ZWQnYC4gTGluZXMgYXJlXG4gKiB0ZXJtaW5hdGVkIHdpdGggYFxcbmAgYW5kIHN0YXJ0ZWQgd2l0aCBgaW5kZW50YC5cbiAqL1xuZnVuY3Rpb24gZm9sZEZsb3dMaW5lcyh0ZXh0LCBpbmRlbnQsIG1vZGUgPSAnZmxvdycsIHsgaW5kZW50QXRTdGFydCwgbGluZVdpZHRoID0gODAsIG1pbkNvbnRlbnRXaWR0aCA9IDIwLCBvbkZvbGQsIG9uT3ZlcmZsb3cgfSA9IHt9KSB7XG4gICAgaWYgKCFsaW5lV2lkdGggfHwgbGluZVdpZHRoIDwgMClcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgaWYgKGxpbmVXaWR0aCA8IG1pbkNvbnRlbnRXaWR0aClcbiAgICAgICAgbWluQ29udGVudFdpZHRoID0gMDtcbiAgICBjb25zdCBlbmRTdGVwID0gTWF0aC5tYXgoMSArIG1pbkNvbnRlbnRXaWR0aCwgMSArIGxpbmVXaWR0aCAtIGluZGVudC5sZW5ndGgpO1xuICAgIGlmICh0ZXh0Lmxlbmd0aCA8PSBlbmRTdGVwKVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICBjb25zdCBmb2xkcyA9IFtdO1xuICAgIGNvbnN0IGVzY2FwZWRGb2xkcyA9IHt9O1xuICAgIGxldCBlbmQgPSBsaW5lV2lkdGggLSBpbmRlbnQubGVuZ3RoO1xuICAgIGlmICh0eXBlb2YgaW5kZW50QXRTdGFydCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgaWYgKGluZGVudEF0U3RhcnQgPiBsaW5lV2lkdGggLSBNYXRoLm1heCgyLCBtaW5Db250ZW50V2lkdGgpKVxuICAgICAgICAgICAgZm9sZHMucHVzaCgwKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZW5kID0gbGluZVdpZHRoIC0gaW5kZW50QXRTdGFydDtcbiAgICB9XG4gICAgbGV0IHNwbGl0ID0gdW5kZWZpbmVkO1xuICAgIGxldCBwcmV2ID0gdW5kZWZpbmVkO1xuICAgIGxldCBvdmVyZmxvdyA9IGZhbHNlO1xuICAgIGxldCBpID0gLTE7XG4gICAgbGV0IGVzY1N0YXJ0ID0gLTE7XG4gICAgbGV0IGVzY0VuZCA9IC0xO1xuICAgIGlmIChtb2RlID09PSBGT0xEX0JMT0NLKSB7XG4gICAgICAgIGkgPSBjb25zdW1lTW9yZUluZGVudGVkTGluZXModGV4dCwgaSwgaW5kZW50Lmxlbmd0aCk7XG4gICAgICAgIGlmIChpICE9PSAtMSlcbiAgICAgICAgICAgIGVuZCA9IGkgKyBlbmRTdGVwO1xuICAgIH1cbiAgICBmb3IgKGxldCBjaDsgKGNoID0gdGV4dFsoaSArPSAxKV0pOykge1xuICAgICAgICBpZiAobW9kZSA9PT0gRk9MRF9RVU9URUQgJiYgY2ggPT09ICdcXFxcJykge1xuICAgICAgICAgICAgZXNjU3RhcnQgPSBpO1xuICAgICAgICAgICAgc3dpdGNoICh0ZXh0W2kgKyAxXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3gnOlxuICAgICAgICAgICAgICAgICAgICBpICs9IDM7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3UnOlxuICAgICAgICAgICAgICAgICAgICBpICs9IDU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1UnOlxuICAgICAgICAgICAgICAgICAgICBpICs9IDk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVzY0VuZCA9IGk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnXFxuJykge1xuICAgICAgICAgICAgaWYgKG1vZGUgPT09IEZPTERfQkxPQ0spXG4gICAgICAgICAgICAgICAgaSA9IGNvbnN1bWVNb3JlSW5kZW50ZWRMaW5lcyh0ZXh0LCBpLCBpbmRlbnQubGVuZ3RoKTtcbiAgICAgICAgICAgIGVuZCA9IGkgKyBpbmRlbnQubGVuZ3RoICsgZW5kU3RlcDtcbiAgICAgICAgICAgIHNwbGl0ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNoID09PSAnICcgJiZcbiAgICAgICAgICAgICAgICBwcmV2ICYmXG4gICAgICAgICAgICAgICAgcHJldiAhPT0gJyAnICYmXG4gICAgICAgICAgICAgICAgcHJldiAhPT0gJ1xcbicgJiZcbiAgICAgICAgICAgICAgICBwcmV2ICE9PSAnXFx0Jykge1xuICAgICAgICAgICAgICAgIC8vIHNwYWNlIHN1cnJvdW5kZWQgYnkgbm9uLXNwYWNlIGNhbiBiZSByZXBsYWNlZCB3aXRoIG5ld2xpbmUgKyBpbmRlbnRcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGV4dFtpICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKG5leHQgJiYgbmV4dCAhPT0gJyAnICYmIG5leHQgIT09ICdcXG4nICYmIG5leHQgIT09ICdcXHQnKVxuICAgICAgICAgICAgICAgICAgICBzcGxpdCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaSA+PSBlbmQpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3BsaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9sZHMucHVzaChzcGxpdCk7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHNwbGl0ICsgZW5kU3RlcDtcbiAgICAgICAgICAgICAgICAgICAgc3BsaXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1vZGUgPT09IEZPTERfUVVPVEVEKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdoaXRlLXNwYWNlIGNvbGxlY3RlZCBhdCBlbmQgbWF5IHN0cmV0Y2ggcGFzdCBsaW5lV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHByZXYgPT09ICcgJyB8fCBwcmV2ID09PSAnXFx0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldiA9IGNoO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2ggPSB0ZXh0WyhpICs9IDEpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJmbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBBY2NvdW50IGZvciBuZXdsaW5lIGVzY2FwZSwgYnV0IGRvbid0IGJyZWFrIHByZWNlZGluZyBlc2NhcGVcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaiA9IGkgPiBlc2NFbmQgKyAxID8gaSAtIDIgOiBlc2NTdGFydCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIC8vIEJhaWwgb3V0IGlmIGxpbmVXaWR0aCAmIG1pbkNvbnRlbnRXaWR0aCBhcmUgc2hvcnRlciB0aGFuIGFuIGVzY2FwZSBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVzY2FwZWRGb2xkc1tqXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICAgICAgICAgICAgICBmb2xkcy5wdXNoKGopO1xuICAgICAgICAgICAgICAgICAgICBlc2NhcGVkRm9sZHNbal0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBqICsgZW5kU3RlcDtcbiAgICAgICAgICAgICAgICAgICAgc3BsaXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHByZXYgPSBjaDtcbiAgICB9XG4gICAgaWYgKG92ZXJmbG93ICYmIG9uT3ZlcmZsb3cpXG4gICAgICAgIG9uT3ZlcmZsb3coKTtcbiAgICBpZiAoZm9sZHMubGVuZ3RoID09PSAwKVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICBpZiAob25Gb2xkKVxuICAgICAgICBvbkZvbGQoKTtcbiAgICBsZXQgcmVzID0gdGV4dC5zbGljZSgwLCBmb2xkc1swXSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmb2xkcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBmb2xkID0gZm9sZHNbaV07XG4gICAgICAgIGNvbnN0IGVuZCA9IGZvbGRzW2kgKyAxXSB8fCB0ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKGZvbGQgPT09IDApXG4gICAgICAgICAgICByZXMgPSBgXFxuJHtpbmRlbnR9JHt0ZXh0LnNsaWNlKDAsIGVuZCl9YDtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gRk9MRF9RVU9URUQgJiYgZXNjYXBlZEZvbGRzW2ZvbGRdKVxuICAgICAgICAgICAgICAgIHJlcyArPSBgJHt0ZXh0W2ZvbGRdfVxcXFxgO1xuICAgICAgICAgICAgcmVzICs9IGBcXG4ke2luZGVudH0ke3RleHQuc2xpY2UoZm9sZCArIDEsIGVuZCl9YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuLyoqXG4gKiBQcmVzdW1lcyBgaSArIDFgIGlzIGF0IHRoZSBzdGFydCBvZiBhIGxpbmVcbiAqIEByZXR1cm5zIGluZGV4IG9mIGxhc3QgbmV3bGluZSBpbiBtb3JlLWluZGVudGVkIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGNvbnN1bWVNb3JlSW5kZW50ZWRMaW5lcyh0ZXh0LCBpLCBpbmRlbnQpIHtcbiAgICBsZXQgZW5kID0gaTtcbiAgICBsZXQgc3RhcnQgPSBpICsgMTtcbiAgICBsZXQgY2ggPSB0ZXh0W3N0YXJ0XTtcbiAgICB3aGlsZSAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcpIHtcbiAgICAgICAgaWYgKGkgPCBzdGFydCArIGluZGVudCkge1xuICAgICAgICAgICAgY2ggPSB0ZXh0WysraV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgY2ggPSB0ZXh0WysraV07XG4gICAgICAgICAgICB9IHdoaWxlIChjaCAmJiBjaCAhPT0gJ1xcbicpO1xuICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICBjaCA9IHRleHRbc3RhcnRdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbmQ7XG59XG5cbmV4cG9ydCB7IEZPTERfQkxPQ0ssIEZPTERfRkxPVywgRk9MRF9RVU9URUQsIGZvbGRGbG93TGluZXMgfTtcbiIsICJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgZm9sZEZsb3dMaW5lcywgRk9MRF9GTE9XLCBGT0xEX1FVT1RFRCwgRk9MRF9CTE9DSyB9IGZyb20gJy4vZm9sZEZsb3dMaW5lcy5qcyc7XG5cbmNvbnN0IGdldEZvbGRPcHRpb25zID0gKGN0eCwgaXNCbG9jaykgPT4gKHtcbiAgICBpbmRlbnRBdFN0YXJ0OiBpc0Jsb2NrID8gY3R4LmluZGVudC5sZW5ndGggOiBjdHguaW5kZW50QXRTdGFydCxcbiAgICBsaW5lV2lkdGg6IGN0eC5vcHRpb25zLmxpbmVXaWR0aCxcbiAgICBtaW5Db250ZW50V2lkdGg6IGN0eC5vcHRpb25zLm1pbkNvbnRlbnRXaWR0aFxufSk7XG4vLyBBbHNvIGNoZWNrcyBmb3IgbGluZXMgc3RhcnRpbmcgd2l0aCAlLCBhcyBwYXJzaW5nIHRoZSBvdXRwdXQgYXMgWUFNTCAxLjEgd2lsbFxuLy8gcHJlc3VtZSB0aGF0J3Mgc3RhcnRpbmcgYSBuZXcgZG9jdW1lbnQuXG5jb25zdCBjb250YWluc0RvY3VtZW50TWFya2VyID0gKHN0cikgPT4gL14oJXwtLS18XFwuXFwuXFwuKS9tLnRlc3Qoc3RyKTtcbmZ1bmN0aW9uIGxpbmVMZW5ndGhPdmVyTGltaXQoc3RyLCBsaW5lV2lkdGgsIGluZGVudExlbmd0aCkge1xuICAgIGlmICghbGluZVdpZHRoIHx8IGxpbmVXaWR0aCA8IDApXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBsaW1pdCA9IGxpbmVXaWR0aCAtIGluZGVudExlbmd0aDtcbiAgICBjb25zdCBzdHJMZW4gPSBzdHIubGVuZ3RoO1xuICAgIGlmIChzdHJMZW4gPD0gbGltaXQpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBmb3IgKGxldCBpID0gMCwgc3RhcnQgPSAwOyBpIDwgc3RyTGVuOyArK2kpIHtcbiAgICAgICAgaWYgKHN0cltpXSA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgIGlmIChpIC0gc3RhcnQgPiBsaW1pdClcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICBpZiAoc3RyTGVuIC0gc3RhcnQgPD0gbGltaXQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24gZG91YmxlUXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpIHtcbiAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIGlmIChjdHgub3B0aW9ucy5kb3VibGVRdW90ZWRBc0pTT04pXG4gICAgICAgIHJldHVybiBqc29uO1xuICAgIGNvbnN0IHsgaW1wbGljaXRLZXkgfSA9IGN0eDtcbiAgICBjb25zdCBtaW5NdWx0aUxpbmVMZW5ndGggPSBjdHgub3B0aW9ucy5kb3VibGVRdW90ZWRNaW5NdWx0aUxpbmVMZW5ndGg7XG4gICAgY29uc3QgaW5kZW50ID0gY3R4LmluZGVudCB8fCAoY29udGFpbnNEb2N1bWVudE1hcmtlcih2YWx1ZSkgPyAnICAnIDogJycpO1xuICAgIGxldCBzdHIgPSAnJztcbiAgICBsZXQgc3RhcnQgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwLCBjaCA9IGpzb25baV07IGNoOyBjaCA9IGpzb25bKytpXSkge1xuICAgICAgICBpZiAoY2ggPT09ICcgJyAmJiBqc29uW2kgKyAxXSA9PT0gJ1xcXFwnICYmIGpzb25baSArIDJdID09PSAnbicpIHtcbiAgICAgICAgICAgIC8vIHNwYWNlIGJlZm9yZSBuZXdsaW5lIG5lZWRzIHRvIGJlIGVzY2FwZWQgdG8gbm90IGJlIGZvbGRlZFxuICAgICAgICAgICAgc3RyICs9IGpzb24uc2xpY2Uoc3RhcnQsIGkpICsgJ1xcXFwgJztcbiAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgIHN0YXJ0ID0gaTtcbiAgICAgICAgICAgIGNoID0gJ1xcXFwnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaCA9PT0gJ1xcXFwnKVxuICAgICAgICAgICAgc3dpdGNoIChqc29uW2kgKyAxXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3UnOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0ganNvbi5zbGljZShzdGFydCwgaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2RlID0ganNvbi5zdWJzdHIoaSArIDIsIDQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChjb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDAwMCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXDAnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMDA3JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcYSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwMGInOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFx2JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDAxYic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXGUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMDg1JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcTic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwYTAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxfJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMjAyOCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXEwnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcyMDI5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcUCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb2RlLnN1YnN0cigwLCAyKSA9PT0gJzAwJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXHgnICsgY29kZS5zdWJzdHIoMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSBqc29uLnN1YnN0cihpLCA2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbic6XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbXBsaWNpdEtleSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbltpICsgMl0gPT09ICdcIicgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb24ubGVuZ3RoIDwgbWluTXVsdGlMaW5lTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmb2xkaW5nIHdpbGwgZWF0IGZpcnN0IG5ld2xpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSBqc29uLnNsaWNlKHN0YXJ0LCBpKSArICdcXG5cXG4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGpzb25baSArIDJdID09PSAnXFxcXCcgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uW2kgKyAzXSA9PT0gJ24nICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbltpICsgNF0gIT09ICdcIicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcbic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGluZGVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNwYWNlIGFmdGVyIG5ld2xpbmUgbmVlZHMgdG8gYmUgZXNjYXBlZCB0byBub3QgYmUgZm9sZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNvbltpICsgMl0gPT09ICcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFwnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgfVxuICAgIHN0ciA9IHN0YXJ0ID8gc3RyICsganNvbi5zbGljZShzdGFydCkgOiBqc29uO1xuICAgIHJldHVybiBpbXBsaWNpdEtleVxuICAgICAgICA/IHN0clxuICAgICAgICA6IGZvbGRGbG93TGluZXMoc3RyLCBpbmRlbnQsIEZPTERfUVVPVEVELCBnZXRGb2xkT3B0aW9ucyhjdHgsIGZhbHNlKSk7XG59XG5mdW5jdGlvbiBzaW5nbGVRdW90ZWRTdHJpbmcodmFsdWUsIGN0eCkge1xuICAgIGlmIChjdHgub3B0aW9ucy5zaW5nbGVRdW90ZSA9PT0gZmFsc2UgfHxcbiAgICAgICAgKGN0eC5pbXBsaWNpdEtleSAmJiB2YWx1ZS5pbmNsdWRlcygnXFxuJykpIHx8XG4gICAgICAgIC9bIFxcdF1cXG58XFxuWyBcXHRdLy50ZXN0KHZhbHVlKSAvLyBzaW5nbGUgcXVvdGVkIHN0cmluZyBjYW4ndCBoYXZlIGxlYWRpbmcgb3IgdHJhaWxpbmcgd2hpdGVzcGFjZSBhcm91bmQgbmV3bGluZVxuICAgIClcbiAgICAgICAgcmV0dXJuIGRvdWJsZVF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KTtcbiAgICBjb25zdCBpbmRlbnQgPSBjdHguaW5kZW50IHx8IChjb250YWluc0RvY3VtZW50TWFya2VyKHZhbHVlKSA/ICcgICcgOiAnJyk7XG4gICAgY29uc3QgcmVzID0gXCInXCIgKyB2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIikucmVwbGFjZSgvXFxuKy9nLCBgJCZcXG4ke2luZGVudH1gKSArIFwiJ1wiO1xuICAgIHJldHVybiBjdHguaW1wbGljaXRLZXlcbiAgICAgICAgPyByZXNcbiAgICAgICAgOiBmb2xkRmxvd0xpbmVzKHJlcywgaW5kZW50LCBGT0xEX0ZMT1csIGdldEZvbGRPcHRpb25zKGN0eCwgZmFsc2UpKTtcbn1cbmZ1bmN0aW9uIHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KSB7XG4gICAgY29uc3QgeyBzaW5nbGVRdW90ZSB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgbGV0IHFzO1xuICAgIGlmIChzaW5nbGVRdW90ZSA9PT0gZmFsc2UpXG4gICAgICAgIHFzID0gZG91YmxlUXVvdGVkU3RyaW5nO1xuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBoYXNEb3VibGUgPSB2YWx1ZS5pbmNsdWRlcygnXCInKTtcbiAgICAgICAgY29uc3QgaGFzU2luZ2xlID0gdmFsdWUuaW5jbHVkZXMoXCInXCIpO1xuICAgICAgICBpZiAoaGFzRG91YmxlICYmICFoYXNTaW5nbGUpXG4gICAgICAgICAgICBxcyA9IHNpbmdsZVF1b3RlZFN0cmluZztcbiAgICAgICAgZWxzZSBpZiAoaGFzU2luZ2xlICYmICFoYXNEb3VibGUpXG4gICAgICAgICAgICBxcyA9IGRvdWJsZVF1b3RlZFN0cmluZztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcXMgPSBzaW5nbGVRdW90ZSA/IHNpbmdsZVF1b3RlZFN0cmluZyA6IGRvdWJsZVF1b3RlZFN0cmluZztcbiAgICB9XG4gICAgcmV0dXJuIHFzKHZhbHVlLCBjdHgpO1xufVxuLy8gVGhlIG5lZ2F0aXZlIGxvb2tiZWhpbmQgYXZvaWRzIGEgcG9seW5vbWlhbCBzZWFyY2gsXG4vLyBidXQgaXNuJ3Qgc3VwcG9ydGVkIHlldCBvbiBTYWZhcmk6IGh0dHBzOi8vY2FuaXVzZS5jb20vanMtcmVnZXhwLWxvb2tiZWhpbmRcbmxldCBibG9ja0VuZE5ld2xpbmVzO1xudHJ5IHtcbiAgICBibG9ja0VuZE5ld2xpbmVzID0gbmV3IFJlZ0V4cCgnKF58KD88IVxcbikpXFxuKyg/IVxcbnwkKScsICdnJyk7XG59XG5jYXRjaCB7XG4gICAgYmxvY2tFbmROZXdsaW5lcyA9IC9cXG4rKD8hXFxufCQpL2c7XG59XG5mdW5jdGlvbiBibG9ja1N0cmluZyh7IGNvbW1lbnQsIHR5cGUsIHZhbHVlIH0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGNvbnN0IHsgYmxvY2tRdW90ZSwgY29tbWVudFN0cmluZywgbGluZVdpZHRoIH0gPSBjdHgub3B0aW9ucztcbiAgICAvLyAxLiBCbG9jayBjYW4ndCBlbmQgaW4gd2hpdGVzcGFjZSB1bmxlc3MgdGhlIGxhc3QgbGluZSBpcyBub24tZW1wdHkuXG4gICAgLy8gMi4gU3RyaW5ncyBjb25zaXN0aW5nIG9mIG9ubHkgd2hpdGVzcGFjZSBhcmUgYmVzdCByZW5kZXJlZCBleHBsaWNpdGx5LlxuICAgIGlmICghYmxvY2tRdW90ZSB8fCAvXFxuW1xcdCBdKyQvLnRlc3QodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgfVxuICAgIGNvbnN0IGluZGVudCA9IGN0eC5pbmRlbnQgfHxcbiAgICAgICAgKGN0eC5mb3JjZUJsb2NrSW5kZW50IHx8IGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIodmFsdWUpID8gJyAgJyA6ICcnKTtcbiAgICBjb25zdCBsaXRlcmFsID0gYmxvY2tRdW90ZSA9PT0gJ2xpdGVyYWwnXG4gICAgICAgID8gdHJ1ZVxuICAgICAgICA6IGJsb2NrUXVvdGUgPT09ICdmb2xkZWQnIHx8IHR5cGUgPT09IFNjYWxhci5CTE9DS19GT0xERURcbiAgICAgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgIDogdHlwZSA9PT0gU2NhbGFyLkJMT0NLX0xJVEVSQUxcbiAgICAgICAgICAgICAgICA/IHRydWVcbiAgICAgICAgICAgICAgICA6ICFsaW5lTGVuZ3RoT3ZlckxpbWl0KHZhbHVlLCBsaW5lV2lkdGgsIGluZGVudC5sZW5ndGgpO1xuICAgIGlmICghdmFsdWUpXG4gICAgICAgIHJldHVybiBsaXRlcmFsID8gJ3xcXG4nIDogJz5cXG4nO1xuICAgIC8vIGRldGVybWluZSBjaG9tcGluZyBmcm9tIHdoaXRlc3BhY2UgYXQgdmFsdWUgZW5kXG4gICAgbGV0IGNob21wO1xuICAgIGxldCBlbmRTdGFydDtcbiAgICBmb3IgKGVuZFN0YXJ0ID0gdmFsdWUubGVuZ3RoOyBlbmRTdGFydCA+IDA7IC0tZW5kU3RhcnQpIHtcbiAgICAgICAgY29uc3QgY2ggPSB2YWx1ZVtlbmRTdGFydCAtIDFdO1xuICAgICAgICBpZiAoY2ggIT09ICdcXG4nICYmIGNoICE9PSAnXFx0JyAmJiBjaCAhPT0gJyAnKVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGxldCBlbmQgPSB2YWx1ZS5zdWJzdHJpbmcoZW5kU3RhcnQpO1xuICAgIGNvbnN0IGVuZE5sUG9zID0gZW5kLmluZGV4T2YoJ1xcbicpO1xuICAgIGlmIChlbmRObFBvcyA9PT0gLTEpIHtcbiAgICAgICAgY2hvbXAgPSAnLSc7IC8vIHN0cmlwXG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlID09PSBlbmQgfHwgZW5kTmxQb3MgIT09IGVuZC5sZW5ndGggLSAxKSB7XG4gICAgICAgIGNob21wID0gJysnOyAvLyBrZWVwXG4gICAgICAgIGlmIChvbkNob21wS2VlcClcbiAgICAgICAgICAgIG9uQ2hvbXBLZWVwKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjaG9tcCA9ICcnOyAvLyBjbGlwXG4gICAgfVxuICAgIGlmIChlbmQpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgwLCAtZW5kLmxlbmd0aCk7XG4gICAgICAgIGlmIChlbmRbZW5kLmxlbmd0aCAtIDFdID09PSAnXFxuJylcbiAgICAgICAgICAgIGVuZCA9IGVuZC5zbGljZSgwLCAtMSk7XG4gICAgICAgIGVuZCA9IGVuZC5yZXBsYWNlKGJsb2NrRW5kTmV3bGluZXMsIGAkJiR7aW5kZW50fWApO1xuICAgIH1cbiAgICAvLyBkZXRlcm1pbmUgaW5kZW50IGluZGljYXRvciBmcm9tIHdoaXRlc3BhY2UgYXQgdmFsdWUgc3RhcnRcbiAgICBsZXQgc3RhcnRXaXRoU3BhY2UgPSBmYWxzZTtcbiAgICBsZXQgc3RhcnRFbmQ7XG4gICAgbGV0IHN0YXJ0TmxQb3MgPSAtMTtcbiAgICBmb3IgKHN0YXJ0RW5kID0gMDsgc3RhcnRFbmQgPCB2YWx1ZS5sZW5ndGg7ICsrc3RhcnRFbmQpIHtcbiAgICAgICAgY29uc3QgY2ggPSB2YWx1ZVtzdGFydEVuZF07XG4gICAgICAgIGlmIChjaCA9PT0gJyAnKVxuICAgICAgICAgICAgc3RhcnRXaXRoU3BhY2UgPSB0cnVlO1xuICAgICAgICBlbHNlIGlmIChjaCA9PT0gJ1xcbicpXG4gICAgICAgICAgICBzdGFydE5sUG9zID0gc3RhcnRFbmQ7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBsZXQgc3RhcnQgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgc3RhcnRObFBvcyA8IHN0YXJ0RW5kID8gc3RhcnRObFBvcyArIDEgOiBzdGFydEVuZCk7XG4gICAgaWYgKHN0YXJ0KSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUuc3Vic3RyaW5nKHN0YXJ0Lmxlbmd0aCk7XG4gICAgICAgIHN0YXJ0ID0gc3RhcnQucmVwbGFjZSgvXFxuKy9nLCBgJCYke2luZGVudH1gKTtcbiAgICB9XG4gICAgY29uc3QgaW5kZW50U2l6ZSA9IGluZGVudCA/ICcyJyA6ICcxJzsgLy8gcm9vdCBpcyBhdCAtMVxuICAgIC8vIExlYWRpbmcgfCBvciA+IGlzIGFkZGVkIGxhdGVyXG4gICAgbGV0IGhlYWRlciA9IChzdGFydFdpdGhTcGFjZSA/IGluZGVudFNpemUgOiAnJykgKyBjaG9tcDtcbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBoZWFkZXIgKz0gJyAnICsgY29tbWVudFN0cmluZyhjb21tZW50LnJlcGxhY2UoLyA/W1xcclxcbl0rL2csICcgJykpO1xuICAgICAgICBpZiAob25Db21tZW50KVxuICAgICAgICAgICAgb25Db21tZW50KCk7XG4gICAgfVxuICAgIGlmICghbGl0ZXJhbCkge1xuICAgICAgICBjb25zdCBmb2xkZWRWYWx1ZSA9IHZhbHVlXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxuKy9nLCAnXFxuJCYnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyg/Ol58XFxuKShbXFx0IF0uKikoPzooW1xcblxcdCBdKilcXG4oPyFbXFxuXFx0IF0pKT8vZywgJyQxJDInKSAvLyBtb3JlLWluZGVudGVkIGxpbmVzIGFyZW4ndCBmb2xkZWRcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIF4gbW9yZS1pbmQuIF4gZW1wdHkgICAgIF4gY2FwdHVyZSBuZXh0IGVtcHR5IGxpbmVzIG9ubHkgYXQgZW5kIG9mIGluZGVudFxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcbisvZywgYCQmJHtpbmRlbnR9YCk7XG4gICAgICAgIGxldCBsaXRlcmFsRmFsbGJhY2sgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgZm9sZE9wdGlvbnMgPSBnZXRGb2xkT3B0aW9ucyhjdHgsIHRydWUpO1xuICAgICAgICBpZiAoYmxvY2tRdW90ZSAhPT0gJ2ZvbGRlZCcgJiYgdHlwZSAhPT0gU2NhbGFyLkJMT0NLX0ZPTERFRCkge1xuICAgICAgICAgICAgZm9sZE9wdGlvbnMub25PdmVyZmxvdyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsaXRlcmFsRmFsbGJhY2sgPSB0cnVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBib2R5ID0gZm9sZEZsb3dMaW5lcyhgJHtzdGFydH0ke2ZvbGRlZFZhbHVlfSR7ZW5kfWAsIGluZGVudCwgRk9MRF9CTE9DSywgZm9sZE9wdGlvbnMpO1xuICAgICAgICBpZiAoIWxpdGVyYWxGYWxsYmFjaylcbiAgICAgICAgICAgIHJldHVybiBgPiR7aGVhZGVyfVxcbiR7aW5kZW50fSR7Ym9keX1gO1xuICAgIH1cbiAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1xcbisvZywgYCQmJHtpbmRlbnR9YCk7XG4gICAgcmV0dXJuIGB8JHtoZWFkZXJ9XFxuJHtpbmRlbnR9JHtzdGFydH0ke3ZhbHVlfSR7ZW5kfWA7XG59XG5mdW5jdGlvbiBwbGFpblN0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBjb25zdCB7IHR5cGUsIHZhbHVlIH0gPSBpdGVtO1xuICAgIGNvbnN0IHsgYWN0dWFsU3RyaW5nLCBpbXBsaWNpdEtleSwgaW5kZW50LCBpbmRlbnRTdGVwLCBpbkZsb3cgfSA9IGN0eDtcbiAgICBpZiAoKGltcGxpY2l0S2V5ICYmIHZhbHVlLmluY2x1ZGVzKCdcXG4nKSkgfHxcbiAgICAgICAgKGluRmxvdyAmJiAvW1tcXF17fSxdLy50ZXN0KHZhbHVlKSkpIHtcbiAgICAgICAgcmV0dXJuIHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KTtcbiAgICB9XG4gICAgaWYgKC9eW1xcblxcdCAsW1xcXXt9IyYqIXw+J1wiJUBgXXxeWz8tXSR8Xls/LV1bIFxcdF18W1xcbjpdWyBcXHRdfFsgXFx0XVxcbnxbXFxuXFx0IF0jfFtcXG5cXHQgOl0kLy50ZXN0KHZhbHVlKSkge1xuICAgICAgICAvLyBub3QgYWxsb3dlZDpcbiAgICAgICAgLy8gLSAnLScgb3IgJz8nXG4gICAgICAgIC8vIC0gc3RhcnQgd2l0aCBhbiBpbmRpY2F0b3IgY2hhcmFjdGVyIChleGNlcHQgWz86LV0pIG9yIC9bPy1dIC9cbiAgICAgICAgLy8gLSAnXFxuICcsICc6ICcgb3IgJyBcXG4nIGFueXdoZXJlXG4gICAgICAgIC8vIC0gJyMnIG5vdCBwcmVjZWRlZCBieSBhIG5vbi1zcGFjZSBjaGFyXG4gICAgICAgIC8vIC0gZW5kIHdpdGggJyAnIG9yICc6J1xuICAgICAgICByZXR1cm4gaW1wbGljaXRLZXkgfHwgaW5GbG93IHx8ICF2YWx1ZS5pbmNsdWRlcygnXFxuJylcbiAgICAgICAgICAgID8gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpXG4gICAgICAgICAgICA6IGJsb2NrU3RyaW5nKGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgfVxuICAgIGlmICghaW1wbGljaXRLZXkgJiZcbiAgICAgICAgIWluRmxvdyAmJlxuICAgICAgICB0eXBlICE9PSBTY2FsYXIuUExBSU4gJiZcbiAgICAgICAgdmFsdWUuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgIC8vIFdoZXJlIGFsbG93ZWQgJiB0eXBlIG5vdCBzZXQgZXhwbGljaXRseSwgcHJlZmVyIGJsb2NrIHN0eWxlIGZvciBtdWx0aWxpbmUgc3RyaW5nc1xuICAgICAgICByZXR1cm4gYmxvY2tTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICB9XG4gICAgaWYgKGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIodmFsdWUpKSB7XG4gICAgICAgIGlmIChpbmRlbnQgPT09ICcnKSB7XG4gICAgICAgICAgICBjdHguZm9yY2VCbG9ja0luZGVudCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbXBsaWNpdEtleSAmJiBpbmRlbnQgPT09IGluZGVudFN0ZXApIHtcbiAgICAgICAgICAgIHJldHVybiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgc3RyID0gdmFsdWUucmVwbGFjZSgvXFxuKy9nLCBgJCZcXG4ke2luZGVudH1gKTtcbiAgICAvLyBWZXJpZnkgdGhhdCBvdXRwdXQgd2lsbCBiZSBwYXJzZWQgYXMgYSBzdHJpbmcsIGFzIGUuZy4gcGxhaW4gbnVtYmVycyBhbmRcbiAgICAvLyBib29sZWFucyBnZXQgcGFyc2VkIHdpdGggdGhvc2UgdHlwZXMgaW4gdjEuMiAoZS5nLiAnNDInLCAndHJ1ZScgJiAnMC45ZS0zJyksXG4gICAgLy8gYW5kIG90aGVycyBpbiB2MS4xLlxuICAgIGlmIChhY3R1YWxTdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdGVzdCA9ICh0YWcpID0+IHRhZy5kZWZhdWx0ICYmIHRhZy50YWcgIT09ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInICYmIHRhZy50ZXN0Py50ZXN0KHN0cik7XG4gICAgICAgIGNvbnN0IHsgY29tcGF0LCB0YWdzIH0gPSBjdHguZG9jLnNjaGVtYTtcbiAgICAgICAgaWYgKHRhZ3Muc29tZSh0ZXN0KSB8fCBjb21wYXQ/LnNvbWUodGVzdCkpXG4gICAgICAgICAgICByZXR1cm4gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgIH1cbiAgICByZXR1cm4gaW1wbGljaXRLZXlcbiAgICAgICAgPyBzdHJcbiAgICAgICAgOiBmb2xkRmxvd0xpbmVzKHN0ciwgaW5kZW50LCBGT0xEX0ZMT1csIGdldEZvbGRPcHRpb25zKGN0eCwgZmFsc2UpKTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeVN0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBjb25zdCB7IGltcGxpY2l0S2V5LCBpbkZsb3cgfSA9IGN0eDtcbiAgICBjb25zdCBzcyA9IHR5cGVvZiBpdGVtLnZhbHVlID09PSAnc3RyaW5nJ1xuICAgICAgICA/IGl0ZW1cbiAgICAgICAgOiBPYmplY3QuYXNzaWduKHt9LCBpdGVtLCB7IHZhbHVlOiBTdHJpbmcoaXRlbS52YWx1ZSkgfSk7XG4gICAgbGV0IHsgdHlwZSB9ID0gaXRlbTtcbiAgICBpZiAodHlwZSAhPT0gU2NhbGFyLlFVT1RFX0RPVUJMRSkge1xuICAgICAgICAvLyBmb3JjZSBkb3VibGUgcXVvdGVzIG9uIGNvbnRyb2wgY2hhcmFjdGVycyAmIHVucGFpcmVkIHN1cnJvZ2F0ZXNcbiAgICAgICAgaWYgKC9bXFx4MDAtXFx4MDhcXHgwYi1cXHgxZlxceDdmLVxceDlmXFx1e0Q4MDB9LVxcdXtERkZGfV0vdS50ZXN0KHNzLnZhbHVlKSlcbiAgICAgICAgICAgIHR5cGUgPSBTY2FsYXIuUVVPVEVfRE9VQkxFO1xuICAgIH1cbiAgICBjb25zdCBfc3RyaW5naWZ5ID0gKF90eXBlKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoX3R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLkJMT0NLX0ZPTERFRDpcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLkJMT0NLX0xJVEVSQUw6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGltcGxpY2l0S2V5IHx8IGluRmxvd1xuICAgICAgICAgICAgICAgICAgICA/IHF1b3RlZFN0cmluZyhzcy52YWx1ZSwgY3R4KSAvLyBibG9ja3MgYXJlIG5vdCB2YWxpZCBpbnNpZGUgZmxvdyBjb250YWluZXJzXG4gICAgICAgICAgICAgICAgICAgIDogYmxvY2tTdHJpbmcoc3MsIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgICAgICAgICBjYXNlIFNjYWxhci5RVU9URV9ET1VCTEU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvdWJsZVF1b3RlZFN0cmluZyhzcy52YWx1ZSwgY3R4KTtcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLlFVT1RFX1NJTkdMRTpcbiAgICAgICAgICAgICAgICByZXR1cm4gc2luZ2xlUXVvdGVkU3RyaW5nKHNzLnZhbHVlLCBjdHgpO1xuICAgICAgICAgICAgY2FzZSBTY2FsYXIuUExBSU46XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBsYWluU3RyaW5nKHNzLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgbGV0IHJlcyA9IF9zdHJpbmdpZnkodHlwZSk7XG4gICAgaWYgKHJlcyA9PT0gbnVsbCkge1xuICAgICAgICBjb25zdCB7IGRlZmF1bHRLZXlUeXBlLCBkZWZhdWx0U3RyaW5nVHlwZSB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgICAgIGNvbnN0IHQgPSAoaW1wbGljaXRLZXkgJiYgZGVmYXVsdEtleVR5cGUpIHx8IGRlZmF1bHRTdHJpbmdUeXBlO1xuICAgICAgICByZXMgPSBfc3RyaW5naWZ5KHQpO1xuICAgICAgICBpZiAocmVzID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBkZWZhdWx0IHN0cmluZyB0eXBlICR7dH1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cblxuZXhwb3J0IHsgc3RyaW5naWZ5U3RyaW5nIH07XG4iLCAiaW1wb3J0IHsgYW5jaG9ySXNWYWxpZCB9IGZyb20gJy4uL2RvYy9hbmNob3JzLmpzJztcbmltcG9ydCB7IGlzUGFpciwgaXNBbGlhcywgaXNOb2RlLCBpc1NjYWxhciwgaXNDb2xsZWN0aW9uIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5Q29tbWVudCB9IGZyb20gJy4vc3RyaW5naWZ5Q29tbWVudC5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnlTdHJpbmcgfSBmcm9tICcuL3N0cmluZ2lmeVN0cmluZy5qcyc7XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0cmluZ2lmeUNvbnRleHQoZG9jLCBvcHRpb25zKSB7XG4gICAgY29uc3Qgb3B0ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGJsb2NrUXVvdGU6IHRydWUsXG4gICAgICAgIGNvbW1lbnRTdHJpbmc6IHN0cmluZ2lmeUNvbW1lbnQsXG4gICAgICAgIGRlZmF1bHRLZXlUeXBlOiBudWxsLFxuICAgICAgICBkZWZhdWx0U3RyaW5nVHlwZTogJ1BMQUlOJyxcbiAgICAgICAgZGlyZWN0aXZlczogbnVsbCxcbiAgICAgICAgZG91YmxlUXVvdGVkQXNKU09OOiBmYWxzZSxcbiAgICAgICAgZG91YmxlUXVvdGVkTWluTXVsdGlMaW5lTGVuZ3RoOiA0MCxcbiAgICAgICAgZmFsc2VTdHI6ICdmYWxzZScsXG4gICAgICAgIGZsb3dDb2xsZWN0aW9uUGFkZGluZzogdHJ1ZSxcbiAgICAgICAgaW5kZW50U2VxOiB0cnVlLFxuICAgICAgICBsaW5lV2lkdGg6IDgwLFxuICAgICAgICBtaW5Db250ZW50V2lkdGg6IDIwLFxuICAgICAgICBudWxsU3RyOiAnbnVsbCcsXG4gICAgICAgIHNpbXBsZUtleXM6IGZhbHNlLFxuICAgICAgICBzaW5nbGVRdW90ZTogbnVsbCxcbiAgICAgICAgdHJhaWxpbmdDb21tYTogZmFsc2UsXG4gICAgICAgIHRydWVTdHI6ICd0cnVlJyxcbiAgICAgICAgdmVyaWZ5QWxpYXNPcmRlcjogdHJ1ZVxuICAgIH0sIGRvYy5zY2hlbWEudG9TdHJpbmdPcHRpb25zLCBvcHRpb25zKTtcbiAgICBsZXQgaW5GbG93O1xuICAgIHN3aXRjaCAob3B0LmNvbGxlY3Rpb25TdHlsZSkge1xuICAgICAgICBjYXNlICdibG9jayc6XG4gICAgICAgICAgICBpbkZsb3cgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmbG93JzpcbiAgICAgICAgICAgIGluRmxvdyA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGluRmxvdyA9IG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGFuY2hvcnM6IG5ldyBTZXQoKSxcbiAgICAgICAgZG9jLFxuICAgICAgICBmbG93Q29sbGVjdGlvblBhZGRpbmc6IG9wdC5mbG93Q29sbGVjdGlvblBhZGRpbmcgPyAnICcgOiAnJyxcbiAgICAgICAgaW5kZW50OiAnJyxcbiAgICAgICAgaW5kZW50U3RlcDogdHlwZW9mIG9wdC5pbmRlbnQgPT09ICdudW1iZXInID8gJyAnLnJlcGVhdChvcHQuaW5kZW50KSA6ICcgICcsXG4gICAgICAgIGluRmxvdyxcbiAgICAgICAgb3B0aW9uczogb3B0XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGdldFRhZ09iamVjdCh0YWdzLCBpdGVtKSB7XG4gICAgaWYgKGl0ZW0udGFnKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdGFncy5maWx0ZXIodCA9PiB0LnRhZyA9PT0gaXRlbS50YWcpO1xuICAgICAgICBpZiAobWF0Y2gubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHJldHVybiBtYXRjaC5maW5kKHQgPT4gdC5mb3JtYXQgPT09IGl0ZW0uZm9ybWF0KSA/PyBtYXRjaFswXTtcbiAgICB9XG4gICAgbGV0IHRhZ09iaiA9IHVuZGVmaW5lZDtcbiAgICBsZXQgb2JqO1xuICAgIGlmIChpc1NjYWxhcihpdGVtKSkge1xuICAgICAgICBvYmogPSBpdGVtLnZhbHVlO1xuICAgICAgICBsZXQgbWF0Y2ggPSB0YWdzLmZpbHRlcih0ID0+IHQuaWRlbnRpZnk/LihvYmopKTtcbiAgICAgICAgaWYgKG1hdGNoLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlc3RNYXRjaCA9IG1hdGNoLmZpbHRlcih0ID0+IHQudGVzdCk7XG4gICAgICAgICAgICBpZiAodGVzdE1hdGNoLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgbWF0Y2ggPSB0ZXN0TWF0Y2g7XG4gICAgICAgIH1cbiAgICAgICAgdGFnT2JqID1cbiAgICAgICAgICAgIG1hdGNoLmZpbmQodCA9PiB0LmZvcm1hdCA9PT0gaXRlbS5mb3JtYXQpID8/IG1hdGNoLmZpbmQodCA9PiAhdC5mb3JtYXQpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgb2JqID0gaXRlbTtcbiAgICAgICAgdGFnT2JqID0gdGFncy5maW5kKHQgPT4gdC5ub2RlQ2xhc3MgJiYgb2JqIGluc3RhbmNlb2YgdC5ub2RlQ2xhc3MpO1xuICAgIH1cbiAgICBpZiAoIXRhZ09iaikge1xuICAgICAgICBjb25zdCBuYW1lID0gb2JqPy5jb25zdHJ1Y3Rvcj8ubmFtZSA/PyAob2JqID09PSBudWxsID8gJ251bGwnIDogdHlwZW9mIG9iaik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGFnIG5vdCByZXNvbHZlZCBmb3IgJHtuYW1lfSB2YWx1ZWApO1xuICAgIH1cbiAgICByZXR1cm4gdGFnT2JqO1xufVxuLy8gbmVlZHMgdG8gYmUgY2FsbGVkIGJlZm9yZSB2YWx1ZSBzdHJpbmdpZmllciB0byBhbGxvdyBmb3IgY2lyY3VsYXIgYW5jaG9yIHJlZnNcbmZ1bmN0aW9uIHN0cmluZ2lmeVByb3BzKG5vZGUsIHRhZ09iaiwgeyBhbmNob3JzLCBkb2MgfSkge1xuICAgIGlmICghZG9jLmRpcmVjdGl2ZXMpXG4gICAgICAgIHJldHVybiAnJztcbiAgICBjb25zdCBwcm9wcyA9IFtdO1xuICAgIGNvbnN0IGFuY2hvciA9IChpc1NjYWxhcihub2RlKSB8fCBpc0NvbGxlY3Rpb24obm9kZSkpICYmIG5vZGUuYW5jaG9yO1xuICAgIGlmIChhbmNob3IgJiYgYW5jaG9ySXNWYWxpZChhbmNob3IpKSB7XG4gICAgICAgIGFuY2hvcnMuYWRkKGFuY2hvcik7XG4gICAgICAgIHByb3BzLnB1c2goYCYke2FuY2hvcn1gKTtcbiAgICB9XG4gICAgY29uc3QgdGFnID0gbm9kZS50YWcgPz8gKHRhZ09iai5kZWZhdWx0ID8gbnVsbCA6IHRhZ09iai50YWcpO1xuICAgIGlmICh0YWcpXG4gICAgICAgIHByb3BzLnB1c2goZG9jLmRpcmVjdGl2ZXMudGFnU3RyaW5nKHRhZykpO1xuICAgIHJldHVybiBwcm9wcy5qb2luKCcgJyk7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnkoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgaWYgKGlzUGFpcihpdGVtKSlcbiAgICAgICAgcmV0dXJuIGl0ZW0udG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICBpZiAoaXNBbGlhcyhpdGVtKSkge1xuICAgICAgICBpZiAoY3R4LmRvYy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udG9TdHJpbmcoY3R4KTtcbiAgICAgICAgaWYgKGN0eC5yZXNvbHZlZEFsaWFzZXM/LmhhcyhpdGVtKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgQ2Fubm90IHN0cmluZ2lmeSBjaXJjdWxhciBzdHJ1Y3R1cmUgd2l0aG91dCBhbGlhcyBub2Rlc2ApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGN0eC5yZXNvbHZlZEFsaWFzZXMpXG4gICAgICAgICAgICAgICAgY3R4LnJlc29sdmVkQWxpYXNlcy5hZGQoaXRlbSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY3R4LnJlc29sdmVkQWxpYXNlcyA9IG5ldyBTZXQoW2l0ZW1dKTtcbiAgICAgICAgICAgIGl0ZW0gPSBpdGVtLnJlc29sdmUoY3R4LmRvYyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbGV0IHRhZ09iaiA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCBub2RlID0gaXNOb2RlKGl0ZW0pXG4gICAgICAgID8gaXRlbVxuICAgICAgICA6IGN0eC5kb2MuY3JlYXRlTm9kZShpdGVtLCB7IG9uVGFnT2JqOiBvID0+ICh0YWdPYmogPSBvKSB9KTtcbiAgICB0YWdPYmogPz8gKHRhZ09iaiA9IGdldFRhZ09iamVjdChjdHguZG9jLnNjaGVtYS50YWdzLCBub2RlKSk7XG4gICAgY29uc3QgcHJvcHMgPSBzdHJpbmdpZnlQcm9wcyhub2RlLCB0YWdPYmosIGN0eCk7XG4gICAgaWYgKHByb3BzLmxlbmd0aCA+IDApXG4gICAgICAgIGN0eC5pbmRlbnRBdFN0YXJ0ID0gKGN0eC5pbmRlbnRBdFN0YXJ0ID8/IDApICsgcHJvcHMubGVuZ3RoICsgMTtcbiAgICBjb25zdCBzdHIgPSB0eXBlb2YgdGFnT2JqLnN0cmluZ2lmeSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IHRhZ09iai5zdHJpbmdpZnkobm9kZSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKVxuICAgICAgICA6IGlzU2NhbGFyKG5vZGUpXG4gICAgICAgICAgICA/IHN0cmluZ2lmeVN0cmluZyhub2RlLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApXG4gICAgICAgICAgICA6IG5vZGUudG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICBpZiAoIXByb3BzKVxuICAgICAgICByZXR1cm4gc3RyO1xuICAgIHJldHVybiBpc1NjYWxhcihub2RlKSB8fCBzdHJbMF0gPT09ICd7JyB8fCBzdHJbMF0gPT09ICdbJ1xuICAgICAgICA/IGAke3Byb3BzfSAke3N0cn1gXG4gICAgICAgIDogYCR7cHJvcHN9XFxuJHtjdHguaW5kZW50fSR7c3RyfWA7XG59XG5cbmV4cG9ydCB7IGNyZWF0ZVN0cmluZ2lmeUNvbnRleHQsIHN0cmluZ2lmeSB9O1xuIiwgImltcG9ydCB7IGlzQ29sbGVjdGlvbiwgaXNOb2RlLCBpc1NjYWxhciwgaXNTZXEgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5IH0gZnJvbSAnLi9zdHJpbmdpZnkuanMnO1xuaW1wb3J0IHsgbGluZUNvbW1lbnQsIGluZGVudENvbW1lbnQgfSBmcm9tICcuL3N0cmluZ2lmeUNvbW1lbnQuanMnO1xuXG5mdW5jdGlvbiBzdHJpbmdpZnlQYWlyKHsga2V5LCB2YWx1ZSB9LCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBjb25zdCB7IGFsbE51bGxWYWx1ZXMsIGRvYywgaW5kZW50LCBpbmRlbnRTdGVwLCBvcHRpb25zOiB7IGNvbW1lbnRTdHJpbmcsIGluZGVudFNlcSwgc2ltcGxlS2V5cyB9IH0gPSBjdHg7XG4gICAgbGV0IGtleUNvbW1lbnQgPSAoaXNOb2RlKGtleSkgJiYga2V5LmNvbW1lbnQpIHx8IG51bGw7XG4gICAgaWYgKHNpbXBsZUtleXMpIHtcbiAgICAgICAgaWYgKGtleUNvbW1lbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignV2l0aCBzaW1wbGUga2V5cywga2V5IG5vZGVzIGNhbm5vdCBoYXZlIGNvbW1lbnRzJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQ29sbGVjdGlvbihrZXkpIHx8ICghaXNOb2RlKGtleSkgJiYgdHlwZW9mIGtleSA9PT0gJ29iamVjdCcpKSB7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSAnV2l0aCBzaW1wbGUga2V5cywgY29sbGVjdGlvbiBjYW5ub3QgYmUgdXNlZCBhcyBhIGtleSB2YWx1ZSc7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgZXhwbGljaXRLZXkgPSAhc2ltcGxlS2V5cyAmJlxuICAgICAgICAoIWtleSB8fFxuICAgICAgICAgICAgKGtleUNvbW1lbnQgJiYgdmFsdWUgPT0gbnVsbCAmJiAhY3R4LmluRmxvdykgfHxcbiAgICAgICAgICAgIGlzQ29sbGVjdGlvbihrZXkpIHx8XG4gICAgICAgICAgICAoaXNTY2FsYXIoa2V5KVxuICAgICAgICAgICAgICAgID8ga2V5LnR5cGUgPT09IFNjYWxhci5CTE9DS19GT0xERUQgfHwga2V5LnR5cGUgPT09IFNjYWxhci5CTE9DS19MSVRFUkFMXG4gICAgICAgICAgICAgICAgOiB0eXBlb2Yga2V5ID09PSAnb2JqZWN0JykpO1xuICAgIGN0eCA9IE9iamVjdC5hc3NpZ24oe30sIGN0eCwge1xuICAgICAgICBhbGxOdWxsVmFsdWVzOiBmYWxzZSxcbiAgICAgICAgaW1wbGljaXRLZXk6ICFleHBsaWNpdEtleSAmJiAoc2ltcGxlS2V5cyB8fCAhYWxsTnVsbFZhbHVlcyksXG4gICAgICAgIGluZGVudDogaW5kZW50ICsgaW5kZW50U3RlcFxuICAgIH0pO1xuICAgIGxldCBrZXlDb21tZW50RG9uZSA9IGZhbHNlO1xuICAgIGxldCBjaG9tcEtlZXAgPSBmYWxzZTtcbiAgICBsZXQgc3RyID0gc3RyaW5naWZ5KGtleSwgY3R4LCAoKSA9PiAoa2V5Q29tbWVudERvbmUgPSB0cnVlKSwgKCkgPT4gKGNob21wS2VlcCA9IHRydWUpKTtcbiAgICBpZiAoIWV4cGxpY2l0S2V5ICYmICFjdHguaW5GbG93ICYmIHN0ci5sZW5ndGggPiAxMDI0KSB7XG4gICAgICAgIGlmIChzaW1wbGVLZXlzKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXaXRoIHNpbXBsZSBrZXlzLCBzaW5nbGUgbGluZSBzY2FsYXIgbXVzdCBub3Qgc3BhbiBtb3JlIHRoYW4gMTAyNCBjaGFyYWN0ZXJzJyk7XG4gICAgICAgIGV4cGxpY2l0S2V5ID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGN0eC5pbkZsb3cpIHtcbiAgICAgICAgaWYgKGFsbE51bGxWYWx1ZXMgfHwgdmFsdWUgPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGtleUNvbW1lbnREb25lICYmIG9uQ29tbWVudClcbiAgICAgICAgICAgICAgICBvbkNvbW1lbnQoKTtcbiAgICAgICAgICAgIHJldHVybiBzdHIgPT09ICcnID8gJz8nIDogZXhwbGljaXRLZXkgPyBgPyAke3N0cn1gIDogc3RyO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKChhbGxOdWxsVmFsdWVzICYmICFzaW1wbGVLZXlzKSB8fCAodmFsdWUgPT0gbnVsbCAmJiBleHBsaWNpdEtleSkpIHtcbiAgICAgICAgc3RyID0gYD8gJHtzdHJ9YDtcbiAgICAgICAgaWYgKGtleUNvbW1lbnQgJiYgIWtleUNvbW1lbnREb25lKSB7XG4gICAgICAgICAgICBzdHIgKz0gbGluZUNvbW1lbnQoc3RyLCBjdHguaW5kZW50LCBjb21tZW50U3RyaW5nKGtleUNvbW1lbnQpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjaG9tcEtlZXAgJiYgb25DaG9tcEtlZXApXG4gICAgICAgICAgICBvbkNob21wS2VlcCgpO1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBpZiAoa2V5Q29tbWVudERvbmUpXG4gICAgICAgIGtleUNvbW1lbnQgPSBudWxsO1xuICAgIGlmIChleHBsaWNpdEtleSkge1xuICAgICAgICBpZiAoa2V5Q29tbWVudClcbiAgICAgICAgICAgIHN0ciArPSBsaW5lQ29tbWVudChzdHIsIGN0eC5pbmRlbnQsIGNvbW1lbnRTdHJpbmcoa2V5Q29tbWVudCkpO1xuICAgICAgICBzdHIgPSBgPyAke3N0cn1cXG4ke2luZGVudH06YDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHN0ciA9IGAke3N0cn06YDtcbiAgICAgICAgaWYgKGtleUNvbW1lbnQpXG4gICAgICAgICAgICBzdHIgKz0gbGluZUNvbW1lbnQoc3RyLCBjdHguaW5kZW50LCBjb21tZW50U3RyaW5nKGtleUNvbW1lbnQpKTtcbiAgICB9XG4gICAgbGV0IHZzYiwgdmNiLCB2YWx1ZUNvbW1lbnQ7XG4gICAgaWYgKGlzTm9kZSh2YWx1ZSkpIHtcbiAgICAgICAgdnNiID0gISF2YWx1ZS5zcGFjZUJlZm9yZTtcbiAgICAgICAgdmNiID0gdmFsdWUuY29tbWVudEJlZm9yZTtcbiAgICAgICAgdmFsdWVDb21tZW50ID0gdmFsdWUuY29tbWVudDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZzYiA9IGZhbHNlO1xuICAgICAgICB2Y2IgPSBudWxsO1xuICAgICAgICB2YWx1ZUNvbW1lbnQgPSBudWxsO1xuICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JylcbiAgICAgICAgICAgIHZhbHVlID0gZG9jLmNyZWF0ZU5vZGUodmFsdWUpO1xuICAgIH1cbiAgICBjdHguaW1wbGljaXRLZXkgPSBmYWxzZTtcbiAgICBpZiAoIWV4cGxpY2l0S2V5ICYmICFrZXlDb21tZW50ICYmIGlzU2NhbGFyKHZhbHVlKSlcbiAgICAgICAgY3R4LmluZGVudEF0U3RhcnQgPSBzdHIubGVuZ3RoICsgMTtcbiAgICBjaG9tcEtlZXAgPSBmYWxzZTtcbiAgICBpZiAoIWluZGVudFNlcSAmJlxuICAgICAgICBpbmRlbnRTdGVwLmxlbmd0aCA+PSAyICYmXG4gICAgICAgICFjdHguaW5GbG93ICYmXG4gICAgICAgICFleHBsaWNpdEtleSAmJlxuICAgICAgICBpc1NlcSh2YWx1ZSkgJiZcbiAgICAgICAgIXZhbHVlLmZsb3cgJiZcbiAgICAgICAgIXZhbHVlLnRhZyAmJlxuICAgICAgICAhdmFsdWUuYW5jaG9yKSB7XG4gICAgICAgIC8vIElmIGluZGVudFNlcSA9PT0gZmFsc2UsIGNvbnNpZGVyICctICcgYXMgcGFydCBvZiBpbmRlbnRhdGlvbiB3aGVyZSBwb3NzaWJsZVxuICAgICAgICBjdHguaW5kZW50ID0gY3R4LmluZGVudC5zdWJzdHJpbmcoMik7XG4gICAgfVxuICAgIGxldCB2YWx1ZUNvbW1lbnREb25lID0gZmFsc2U7XG4gICAgY29uc3QgdmFsdWVTdHIgPSBzdHJpbmdpZnkodmFsdWUsIGN0eCwgKCkgPT4gKHZhbHVlQ29tbWVudERvbmUgPSB0cnVlKSwgKCkgPT4gKGNob21wS2VlcCA9IHRydWUpKTtcbiAgICBsZXQgd3MgPSAnICc7XG4gICAgaWYgKGtleUNvbW1lbnQgfHwgdnNiIHx8IHZjYikge1xuICAgICAgICB3cyA9IHZzYiA/ICdcXG4nIDogJyc7XG4gICAgICAgIGlmICh2Y2IpIHtcbiAgICAgICAgICAgIGNvbnN0IGNzID0gY29tbWVudFN0cmluZyh2Y2IpO1xuICAgICAgICAgICAgd3MgKz0gYFxcbiR7aW5kZW50Q29tbWVudChjcywgY3R4LmluZGVudCl9YDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWVTdHIgPT09ICcnICYmICFjdHguaW5GbG93KSB7XG4gICAgICAgICAgICBpZiAod3MgPT09ICdcXG4nICYmIHZhbHVlQ29tbWVudClcbiAgICAgICAgICAgICAgICB3cyA9ICdcXG5cXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd3MgKz0gYFxcbiR7Y3R4LmluZGVudH1gO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCFleHBsaWNpdEtleSAmJiBpc0NvbGxlY3Rpb24odmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IHZzMCA9IHZhbHVlU3RyWzBdO1xuICAgICAgICBjb25zdCBubDAgPSB2YWx1ZVN0ci5pbmRleE9mKCdcXG4nKTtcbiAgICAgICAgY29uc3QgaGFzTmV3bGluZSA9IG5sMCAhPT0gLTE7XG4gICAgICAgIGNvbnN0IGZsb3cgPSBjdHguaW5GbG93ID8/IHZhbHVlLmZsb3cgPz8gdmFsdWUuaXRlbXMubGVuZ3RoID09PSAwO1xuICAgICAgICBpZiAoaGFzTmV3bGluZSB8fCAhZmxvdykge1xuICAgICAgICAgICAgbGV0IGhhc1Byb3BzTGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGhhc05ld2xpbmUgJiYgKHZzMCA9PT0gJyYnIHx8IHZzMCA9PT0gJyEnKSkge1xuICAgICAgICAgICAgICAgIGxldCBzcDAgPSB2YWx1ZVN0ci5pbmRleE9mKCcgJyk7XG4gICAgICAgICAgICAgICAgaWYgKHZzMCA9PT0gJyYnICYmXG4gICAgICAgICAgICAgICAgICAgIHNwMCAhPT0gLTEgJiZcbiAgICAgICAgICAgICAgICAgICAgc3AwIDwgbmwwICYmXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlU3RyW3NwMCArIDFdID09PSAnIScpIHtcbiAgICAgICAgICAgICAgICAgICAgc3AwID0gdmFsdWVTdHIuaW5kZXhPZignICcsIHNwMCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3AwID09PSAtMSB8fCBubDAgPCBzcDApXG4gICAgICAgICAgICAgICAgICAgIGhhc1Byb3BzTGluZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWhhc1Byb3BzTGluZSlcbiAgICAgICAgICAgICAgICB3cyA9IGBcXG4ke2N0eC5pbmRlbnR9YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh2YWx1ZVN0ciA9PT0gJycgfHwgdmFsdWVTdHJbMF0gPT09ICdcXG4nKSB7XG4gICAgICAgIHdzID0gJyc7XG4gICAgfVxuICAgIHN0ciArPSB3cyArIHZhbHVlU3RyO1xuICAgIGlmIChjdHguaW5GbG93KSB7XG4gICAgICAgIGlmICh2YWx1ZUNvbW1lbnREb25lICYmIG9uQ29tbWVudClcbiAgICAgICAgICAgIG9uQ29tbWVudCgpO1xuICAgIH1cbiAgICBlbHNlIGlmICh2YWx1ZUNvbW1lbnQgJiYgIXZhbHVlQ29tbWVudERvbmUpIHtcbiAgICAgICAgc3RyICs9IGxpbmVDb21tZW50KHN0ciwgY3R4LmluZGVudCwgY29tbWVudFN0cmluZyh2YWx1ZUNvbW1lbnQpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY2hvbXBLZWVwICYmIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIG9uQ2hvbXBLZWVwKCk7XG4gICAgfVxuICAgIHJldHVybiBzdHI7XG59XG5cbmV4cG9ydCB7IHN0cmluZ2lmeVBhaXIgfTtcbiIsICJmdW5jdGlvbiBkZWJ1Zyhsb2dMZXZlbCwgLi4ubWVzc2FnZXMpIHtcbiAgICBpZiAobG9nTGV2ZWwgPT09ICdkZWJ1ZycpXG4gICAgICAgIGNvbnNvbGUubG9nKC4uLm1lc3NhZ2VzKTtcbn1cbmZ1bmN0aW9uIHdhcm4obG9nTGV2ZWwsIHdhcm5pbmcpIHtcbiAgICBpZiAobG9nTGV2ZWwgPT09ICdkZWJ1ZycgfHwgbG9nTGV2ZWwgPT09ICd3YXJuJykge1xuICAgICAgICBjb25zb2xlLndhcm4od2FybmluZyk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBkZWJ1Zywgd2FybiB9O1xuIiwgImltcG9ydCB7IGlzU2NhbGFyLCBpc1NlcSwgaXNBbGlhcywgaXNNYXAgfSBmcm9tICcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuXG4vLyBJZiB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIGEgbWVyZ2Uga2V5IGlzIGEgc2luZ2xlIG1hcHBpbmcgbm9kZSwgZWFjaCBvZlxuLy8gaXRzIGtleS92YWx1ZSBwYWlycyBpcyBpbnNlcnRlZCBpbnRvIHRoZSBjdXJyZW50IG1hcHBpbmcsIHVubGVzcyB0aGUga2V5XG4vLyBhbHJlYWR5IGV4aXN0cyBpbiBpdC4gSWYgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgbWVyZ2Uga2V5IGlzIGFcbi8vIHNlcXVlbmNlLCB0aGVuIHRoaXMgc2VxdWVuY2UgaXMgZXhwZWN0ZWQgdG8gY29udGFpbiBtYXBwaW5nIG5vZGVzIGFuZCBlYWNoXG4vLyBvZiB0aGVzZSBub2RlcyBpcyBtZXJnZWQgaW4gdHVybiBhY2NvcmRpbmcgdG8gaXRzIG9yZGVyIGluIHRoZSBzZXF1ZW5jZS5cbi8vIEtleXMgaW4gbWFwcGluZyBub2RlcyBlYXJsaWVyIGluIHRoZSBzZXF1ZW5jZSBvdmVycmlkZSBrZXlzIHNwZWNpZmllZCBpblxuLy8gbGF0ZXIgbWFwcGluZyBub2Rlcy4gLS0gaHR0cDovL3lhbWwub3JnL3R5cGUvbWVyZ2UuaHRtbFxuY29uc3QgTUVSR0VfS0VZID0gJzw8JztcbmNvbnN0IG1lcmdlID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PT0gTUVSR0VfS0VZIHx8XG4gICAgICAgICh0eXBlb2YgdmFsdWUgPT09ICdzeW1ib2wnICYmIHZhbHVlLmRlc2NyaXB0aW9uID09PSBNRVJHRV9LRVkpLFxuICAgIGRlZmF1bHQ6ICdrZXknLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm1lcmdlJyxcbiAgICB0ZXN0OiAvXjw8JC8sXG4gICAgcmVzb2x2ZTogKCkgPT4gT2JqZWN0LmFzc2lnbihuZXcgU2NhbGFyKFN5bWJvbChNRVJHRV9LRVkpKSwge1xuICAgICAgICBhZGRUb0pTTWFwOiBhZGRNZXJnZVRvSlNNYXBcbiAgICB9KSxcbiAgICBzdHJpbmdpZnk6ICgpID0+IE1FUkdFX0tFWVxufTtcbmNvbnN0IGlzTWVyZ2VLZXkgPSAoY3R4LCBrZXkpID0+IChtZXJnZS5pZGVudGlmeShrZXkpIHx8XG4gICAgKGlzU2NhbGFyKGtleSkgJiZcbiAgICAgICAgKCFrZXkudHlwZSB8fCBrZXkudHlwZSA9PT0gU2NhbGFyLlBMQUlOKSAmJlxuICAgICAgICBtZXJnZS5pZGVudGlmeShrZXkudmFsdWUpKSkgJiZcbiAgICBjdHg/LmRvYy5zY2hlbWEudGFncy5zb21lKHRhZyA9PiB0YWcudGFnID09PSBtZXJnZS50YWcgJiYgdGFnLmRlZmF1bHQpO1xuZnVuY3Rpb24gYWRkTWVyZ2VUb0pTTWFwKGN0eCwgbWFwLCB2YWx1ZSkge1xuICAgIGNvbnN0IHNvdXJjZSA9IHJlc29sdmVBbGlhc1ZhbHVlKGN0eCwgdmFsdWUpO1xuICAgIGlmIChpc1NlcShzb3VyY2UpKVxuICAgICAgICBmb3IgKGNvbnN0IGl0IG9mIHNvdXJjZS5pdGVtcylcbiAgICAgICAgICAgIG1lcmdlVmFsdWUoY3R4LCBtYXAsIGl0KTtcbiAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNvdXJjZSkpXG4gICAgICAgIGZvciAoY29uc3QgaXQgb2Ygc291cmNlKVxuICAgICAgICAgICAgbWVyZ2VWYWx1ZShjdHgsIG1hcCwgaXQpO1xuICAgIGVsc2VcbiAgICAgICAgbWVyZ2VWYWx1ZShjdHgsIG1hcCwgc291cmNlKTtcbn1cbmZ1bmN0aW9uIG1lcmdlVmFsdWUoY3R4LCBtYXAsIHZhbHVlKSB7XG4gICAgY29uc3Qgc291cmNlID0gcmVzb2x2ZUFsaWFzVmFsdWUoY3R4LCB2YWx1ZSk7XG4gICAgaWYgKCFpc01hcChzb3VyY2UpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01lcmdlIHNvdXJjZXMgbXVzdCBiZSBtYXBzIG9yIG1hcCBhbGlhc2VzJyk7XG4gICAgY29uc3Qgc3JjTWFwID0gc291cmNlLnRvSlNPTihudWxsLCBjdHgsIE1hcCk7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2Ygc3JjTWFwKSB7XG4gICAgICAgIGlmIChtYXAgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIGlmICghbWFwLmhhcyhrZXkpKVxuICAgICAgICAgICAgICAgIG1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWFwIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICBtYXAuYWRkKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtYXAsIGtleSkpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtYXAsIGtleSwge1xuICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFwO1xufVxuZnVuY3Rpb24gcmVzb2x2ZUFsaWFzVmFsdWUoY3R4LCB2YWx1ZSkge1xuICAgIHJldHVybiBjdHggJiYgaXNBbGlhcyh2YWx1ZSkgPyB2YWx1ZS5yZXNvbHZlKGN0eC5kb2MsIGN0eCkgOiB2YWx1ZTtcbn1cblxuZXhwb3J0IHsgYWRkTWVyZ2VUb0pTTWFwLCBpc01lcmdlS2V5LCBtZXJnZSB9O1xuIiwgImltcG9ydCB7IHdhcm4gfSBmcm9tICcuLi9sb2cuanMnO1xuaW1wb3J0IHsgaXNNZXJnZUtleSwgYWRkTWVyZ2VUb0pTTWFwIH0gZnJvbSAnLi4vc2NoZW1hL3lhbWwtMS4xL21lcmdlLmpzJztcbmltcG9ydCB7IGNyZWF0ZVN0cmluZ2lmeUNvbnRleHQgfSBmcm9tICcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5LmpzJztcbmltcG9ydCB7IGlzTm9kZSB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgdG9KUyB9IGZyb20gJy4vdG9KUy5qcyc7XG5cbmZ1bmN0aW9uIGFkZFBhaXJUb0pTTWFwKGN0eCwgbWFwLCB7IGtleSwgdmFsdWUgfSkge1xuICAgIGlmIChpc05vZGUoa2V5KSAmJiBrZXkuYWRkVG9KU01hcClcbiAgICAgICAga2V5LmFkZFRvSlNNYXAoY3R4LCBtYXAsIHZhbHVlKTtcbiAgICAvLyBUT0RPOiBTaG91bGQgZHJvcCB0aGlzIHNwZWNpYWwgY2FzZSBmb3IgYmFyZSA8PCBoYW5kbGluZ1xuICAgIGVsc2UgaWYgKGlzTWVyZ2VLZXkoY3R4LCBrZXkpKVxuICAgICAgICBhZGRNZXJnZVRvSlNNYXAoY3R4LCBtYXAsIHZhbHVlKTtcbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QganNLZXkgPSB0b0pTKGtleSwgJycsIGN0eCk7XG4gICAgICAgIGlmIChtYXAgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIG1hcC5zZXQoanNLZXksIHRvSlModmFsdWUsIGpzS2V5LCBjdHgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtYXAgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgIG1hcC5hZGQoanNLZXkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc3RyaW5nS2V5ID0gc3RyaW5naWZ5S2V5KGtleSwganNLZXksIGN0eCk7XG4gICAgICAgICAgICBjb25zdCBqc1ZhbHVlID0gdG9KUyh2YWx1ZSwgc3RyaW5nS2V5LCBjdHgpO1xuICAgICAgICAgICAgaWYgKHN0cmluZ0tleSBpbiBtYXApXG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG1hcCwgc3RyaW5nS2V5LCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBqc1ZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbWFwW3N0cmluZ0tleV0gPSBqc1ZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlLZXkoa2V5LCBqc0tleSwgY3R4KSB7XG4gICAgaWYgKGpzS2V5ID09PSBudWxsKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1iYXNlLXRvLXN0cmluZ1xuICAgIGlmICh0eXBlb2YganNLZXkgIT09ICdvYmplY3QnKVxuICAgICAgICByZXR1cm4gU3RyaW5nKGpzS2V5KTtcbiAgICBpZiAoaXNOb2RlKGtleSkgJiYgY3R4Py5kb2MpIHtcbiAgICAgICAgY29uc3Qgc3RyQ3R4ID0gY3JlYXRlU3RyaW5naWZ5Q29udGV4dChjdHguZG9jLCB7fSk7XG4gICAgICAgIHN0ckN0eC5hbmNob3JzID0gbmV3IFNldCgpO1xuICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgY3R4LmFuY2hvcnMua2V5cygpKVxuICAgICAgICAgICAgc3RyQ3R4LmFuY2hvcnMuYWRkKG5vZGUuYW5jaG9yKTtcbiAgICAgICAgc3RyQ3R4LmluRmxvdyA9IHRydWU7XG4gICAgICAgIHN0ckN0eC5pblN0cmluZ2lmeUtleSA9IHRydWU7XG4gICAgICAgIGNvbnN0IHN0cktleSA9IGtleS50b1N0cmluZyhzdHJDdHgpO1xuICAgICAgICBpZiAoIWN0eC5tYXBLZXlXYXJuZWQpIHtcbiAgICAgICAgICAgIGxldCBqc29uU3RyID0gSlNPTi5zdHJpbmdpZnkoc3RyS2V5KTtcbiAgICAgICAgICAgIGlmIChqc29uU3RyLmxlbmd0aCA+IDQwKVxuICAgICAgICAgICAgICAgIGpzb25TdHIgPSBqc29uU3RyLnN1YnN0cmluZygwLCAzNikgKyAnLi4uXCInO1xuICAgICAgICAgICAgd2FybihjdHguZG9jLm9wdGlvbnMubG9nTGV2ZWwsIGBLZXlzIHdpdGggY29sbGVjdGlvbiB2YWx1ZXMgd2lsbCBiZSBzdHJpbmdpZmllZCBkdWUgdG8gSlMgT2JqZWN0IHJlc3RyaWN0aW9uczogJHtqc29uU3RyfS4gU2V0IG1hcEFzTWFwOiB0cnVlIHRvIHVzZSBvYmplY3Qga2V5cy5gKTtcbiAgICAgICAgICAgIGN0eC5tYXBLZXlXYXJuZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJLZXk7XG4gICAgfVxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShqc0tleSk7XG59XG5cbmV4cG9ydCB7IGFkZFBhaXJUb0pTTWFwIH07XG4iLCAiaW1wb3J0IHsgY3JlYXRlTm9kZSB9IGZyb20gJy4uL2RvYy9jcmVhdGVOb2RlLmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeVBhaXIgfSBmcm9tICcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5UGFpci5qcyc7XG5pbXBvcnQgeyBhZGRQYWlyVG9KU01hcCB9IGZyb20gJy4vYWRkUGFpclRvSlNNYXAuanMnO1xuaW1wb3J0IHsgTk9ERV9UWVBFLCBQQUlSLCBpc05vZGUgfSBmcm9tICcuL2lkZW50aXR5LmpzJztcblxuZnVuY3Rpb24gY3JlYXRlUGFpcihrZXksIHZhbHVlLCBjdHgpIHtcbiAgICBjb25zdCBrID0gY3JlYXRlTm9kZShrZXksIHVuZGVmaW5lZCwgY3R4KTtcbiAgICBjb25zdCB2ID0gY3JlYXRlTm9kZSh2YWx1ZSwgdW5kZWZpbmVkLCBjdHgpO1xuICAgIHJldHVybiBuZXcgUGFpcihrLCB2KTtcbn1cbmNsYXNzIFBhaXIge1xuICAgIGNvbnN0cnVjdG9yKGtleSwgdmFsdWUgPSBudWxsKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBOT0RFX1RZUEUsIHsgdmFsdWU6IFBBSVIgfSk7XG4gICAgICAgIHRoaXMua2V5ID0ga2V5O1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIGNsb25lKHNjaGVtYSkge1xuICAgICAgICBsZXQgeyBrZXksIHZhbHVlIH0gPSB0aGlzO1xuICAgICAgICBpZiAoaXNOb2RlKGtleSkpXG4gICAgICAgICAgICBrZXkgPSBrZXkuY2xvbmUoc2NoZW1hKTtcbiAgICAgICAgaWYgKGlzTm9kZSh2YWx1ZSkpXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmNsb25lKHNjaGVtYSk7XG4gICAgICAgIHJldHVybiBuZXcgUGFpcihrZXksIHZhbHVlKTtcbiAgICB9XG4gICAgdG9KU09OKF8sIGN0eCkge1xuICAgICAgICBjb25zdCBwYWlyID0gY3R4Py5tYXBBc01hcCA/IG5ldyBNYXAoKSA6IHt9O1xuICAgICAgICByZXR1cm4gYWRkUGFpclRvSlNNYXAoY3R4LCBwYWlyLCB0aGlzKTtcbiAgICB9XG4gICAgdG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIHJldHVybiBjdHg/LmRvY1xuICAgICAgICAgICAgPyBzdHJpbmdpZnlQYWlyKHRoaXMsIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcClcbiAgICAgICAgICAgIDogSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBQYWlyLCBjcmVhdGVQYWlyIH07XG4iLCAiaW1wb3J0IHsgaXNOb2RlLCBpc1BhaXIgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBzdHJpbmdpZnkgfSBmcm9tICcuL3N0cmluZ2lmeS5qcyc7XG5pbXBvcnQgeyBsaW5lQ29tbWVudCwgaW5kZW50Q29tbWVudCB9IGZyb20gJy4vc3RyaW5naWZ5Q29tbWVudC5qcyc7XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeUNvbGxlY3Rpb24oY29sbGVjdGlvbiwgY3R4LCBvcHRpb25zKSB7XG4gICAgY29uc3QgZmxvdyA9IGN0eC5pbkZsb3cgPz8gY29sbGVjdGlvbi5mbG93O1xuICAgIGNvbnN0IHN0cmluZ2lmeSA9IGZsb3cgPyBzdHJpbmdpZnlGbG93Q29sbGVjdGlvbiA6IHN0cmluZ2lmeUJsb2NrQ29sbGVjdGlvbjtcbiAgICByZXR1cm4gc3RyaW5naWZ5KGNvbGxlY3Rpb24sIGN0eCwgb3B0aW9ucyk7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlCbG9ja0NvbGxlY3Rpb24oeyBjb21tZW50LCBpdGVtcyB9LCBjdHgsIHsgYmxvY2tJdGVtUHJlZml4LCBmbG93Q2hhcnMsIGl0ZW1JbmRlbnQsIG9uQ2hvbXBLZWVwLCBvbkNvbW1lbnQgfSkge1xuICAgIGNvbnN0IHsgaW5kZW50LCBvcHRpb25zOiB7IGNvbW1lbnRTdHJpbmcgfSB9ID0gY3R4O1xuICAgIGNvbnN0IGl0ZW1DdHggPSBPYmplY3QuYXNzaWduKHt9LCBjdHgsIHsgaW5kZW50OiBpdGVtSW5kZW50LCB0eXBlOiBudWxsIH0pO1xuICAgIGxldCBjaG9tcEtlZXAgPSBmYWxzZTsgLy8gZmxhZyBmb3IgdGhlIHByZWNlZGluZyBub2RlJ3Mgc3RhdHVzXG4gICAgY29uc3QgbGluZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAgICAgbGV0IGNvbW1lbnQgPSBudWxsO1xuICAgICAgICBpZiAoaXNOb2RlKGl0ZW0pKSB7XG4gICAgICAgICAgICBpZiAoIWNob21wS2VlcCAmJiBpdGVtLnNwYWNlQmVmb3JlKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgYWRkQ29tbWVudEJlZm9yZShjdHgsIGxpbmVzLCBpdGVtLmNvbW1lbnRCZWZvcmUsIGNob21wS2VlcCk7XG4gICAgICAgICAgICBpZiAoaXRlbS5jb21tZW50KVxuICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBpdGVtLmNvbW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNQYWlyKGl0ZW0pKSB7XG4gICAgICAgICAgICBjb25zdCBpayA9IGlzTm9kZShpdGVtLmtleSkgPyBpdGVtLmtleSA6IG51bGw7XG4gICAgICAgICAgICBpZiAoaWspIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNob21wS2VlcCAmJiBpay5zcGFjZUJlZm9yZSlcbiAgICAgICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICAgICAgYWRkQ29tbWVudEJlZm9yZShjdHgsIGxpbmVzLCBpay5jb21tZW50QmVmb3JlLCBjaG9tcEtlZXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNob21wS2VlcCA9IGZhbHNlO1xuICAgICAgICBsZXQgc3RyID0gc3RyaW5naWZ5KGl0ZW0sIGl0ZW1DdHgsICgpID0+IChjb21tZW50ID0gbnVsbCksICgpID0+IChjaG9tcEtlZXAgPSB0cnVlKSk7XG4gICAgICAgIGlmIChjb21tZW50KVxuICAgICAgICAgICAgc3RyICs9IGxpbmVDb21tZW50KHN0ciwgaXRlbUluZGVudCwgY29tbWVudFN0cmluZyhjb21tZW50KSk7XG4gICAgICAgIGlmIChjaG9tcEtlZXAgJiYgY29tbWVudClcbiAgICAgICAgICAgIGNob21wS2VlcCA9IGZhbHNlO1xuICAgICAgICBsaW5lcy5wdXNoKGJsb2NrSXRlbVByZWZpeCArIHN0cik7XG4gICAgfVxuICAgIGxldCBzdHI7XG4gICAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBzdHIgPSBmbG93Q2hhcnMuc3RhcnQgKyBmbG93Q2hhcnMuZW5kO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc3RyID0gbGluZXNbMF07XG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbGluZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc1tpXTtcbiAgICAgICAgICAgIHN0ciArPSBsaW5lID8gYFxcbiR7aW5kZW50fSR7bGluZX1gIDogJ1xcbic7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgc3RyICs9ICdcXG4nICsgaW5kZW50Q29tbWVudChjb21tZW50U3RyaW5nKGNvbW1lbnQpLCBpbmRlbnQpO1xuICAgICAgICBpZiAob25Db21tZW50KVxuICAgICAgICAgICAgb25Db21tZW50KCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGNob21wS2VlcCAmJiBvbkNob21wS2VlcClcbiAgICAgICAgb25DaG9tcEtlZXAoKTtcbiAgICByZXR1cm4gc3RyO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5Rmxvd0NvbGxlY3Rpb24oeyBpdGVtcyB9LCBjdHgsIHsgZmxvd0NoYXJzLCBpdGVtSW5kZW50IH0pIHtcbiAgICBjb25zdCB7IGluZGVudCwgaW5kZW50U3RlcCwgZmxvd0NvbGxlY3Rpb25QYWRkaW5nOiBmY1BhZGRpbmcsIG9wdGlvbnM6IHsgY29tbWVudFN0cmluZyB9IH0gPSBjdHg7XG4gICAgaXRlbUluZGVudCArPSBpbmRlbnRTdGVwO1xuICAgIGNvbnN0IGl0ZW1DdHggPSBPYmplY3QuYXNzaWduKHt9LCBjdHgsIHtcbiAgICAgICAgaW5kZW50OiBpdGVtSW5kZW50LFxuICAgICAgICBpbkZsb3c6IHRydWUsXG4gICAgICAgIHR5cGU6IG51bGxcbiAgICB9KTtcbiAgICBsZXQgcmVxTmV3bGluZSA9IGZhbHNlO1xuICAgIGxldCBsaW5lc0F0VmFsdWUgPSAwO1xuICAgIGNvbnN0IGxpbmVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBpdGVtID0gaXRlbXNbaV07XG4gICAgICAgIGxldCBjb21tZW50ID0gbnVsbDtcbiAgICAgICAgaWYgKGlzTm9kZShpdGVtKSkge1xuICAgICAgICAgICAgaWYgKGl0ZW0uc3BhY2VCZWZvcmUpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICBhZGRDb21tZW50QmVmb3JlKGN0eCwgbGluZXMsIGl0ZW0uY29tbWVudEJlZm9yZSwgZmFsc2UpO1xuICAgICAgICAgICAgaWYgKGl0ZW0uY29tbWVudClcbiAgICAgICAgICAgICAgICBjb21tZW50ID0gaXRlbS5jb21tZW50O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzUGFpcihpdGVtKSkge1xuICAgICAgICAgICAgY29uc3QgaWsgPSBpc05vZGUoaXRlbS5rZXkpID8gaXRlbS5rZXkgOiBudWxsO1xuICAgICAgICAgICAgaWYgKGlrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlrLnNwYWNlQmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgICAgICBhZGRDb21tZW50QmVmb3JlKGN0eCwgbGluZXMsIGlrLmNvbW1lbnRCZWZvcmUsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBpZiAoaWsuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgcmVxTmV3bGluZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBpdiA9IGlzTm9kZShpdGVtLnZhbHVlKSA/IGl0ZW0udmFsdWUgOiBudWxsO1xuICAgICAgICAgICAgaWYgKGl2KSB7XG4gICAgICAgICAgICAgICAgaWYgKGl2LmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBpdi5jb21tZW50O1xuICAgICAgICAgICAgICAgIGlmIChpdi5jb21tZW50QmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICByZXFOZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW0udmFsdWUgPT0gbnVsbCAmJiBpaz8uY29tbWVudCkge1xuICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBpay5jb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjb21tZW50KVxuICAgICAgICAgICAgcmVxTmV3bGluZSA9IHRydWU7XG4gICAgICAgIGxldCBzdHIgPSBzdHJpbmdpZnkoaXRlbSwgaXRlbUN0eCwgKCkgPT4gKGNvbW1lbnQgPSBudWxsKSk7XG4gICAgICAgIHJlcU5ld2xpbmUgfHwgKHJlcU5ld2xpbmUgPSBsaW5lcy5sZW5ndGggPiBsaW5lc0F0VmFsdWUgfHwgc3RyLmluY2x1ZGVzKCdcXG4nKSk7XG4gICAgICAgIGlmIChpIDwgaXRlbXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgc3RyICs9ICcsJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjdHgub3B0aW9ucy50cmFpbGluZ0NvbW1hKSB7XG4gICAgICAgICAgICBpZiAoY3R4Lm9wdGlvbnMubGluZVdpZHRoID4gMCkge1xuICAgICAgICAgICAgICAgIHJlcU5ld2xpbmUgfHwgKHJlcU5ld2xpbmUgPSBsaW5lcy5yZWR1Y2UoKHN1bSwgbGluZSkgPT4gc3VtICsgbGluZS5sZW5ndGggKyAyLCAyKSArXG4gICAgICAgICAgICAgICAgICAgIChzdHIubGVuZ3RoICsgMikgPlxuICAgICAgICAgICAgICAgICAgICBjdHgub3B0aW9ucy5saW5lV2lkdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcU5ld2xpbmUpIHtcbiAgICAgICAgICAgICAgICBzdHIgKz0gJywnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjb21tZW50KVxuICAgICAgICAgICAgc3RyICs9IGxpbmVDb21tZW50KHN0ciwgaXRlbUluZGVudCwgY29tbWVudFN0cmluZyhjb21tZW50KSk7XG4gICAgICAgIGxpbmVzLnB1c2goc3RyKTtcbiAgICAgICAgbGluZXNBdFZhbHVlID0gbGluZXMubGVuZ3RoO1xuICAgIH1cbiAgICBjb25zdCB7IHN0YXJ0LCBlbmQgfSA9IGZsb3dDaGFycztcbiAgICBpZiAobGluZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBzdGFydCArIGVuZDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmICghcmVxTmV3bGluZSkge1xuICAgICAgICAgICAgY29uc3QgbGVuID0gbGluZXMucmVkdWNlKChzdW0sIGxpbmUpID0+IHN1bSArIGxpbmUubGVuZ3RoICsgMiwgMik7XG4gICAgICAgICAgICByZXFOZXdsaW5lID0gY3R4Lm9wdGlvbnMubGluZVdpZHRoID4gMCAmJiBsZW4gPiBjdHgub3B0aW9ucy5saW5lV2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlcU5ld2xpbmUpIHtcbiAgICAgICAgICAgIGxldCBzdHIgPSBzdGFydDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcylcbiAgICAgICAgICAgICAgICBzdHIgKz0gbGluZSA/IGBcXG4ke2luZGVudFN0ZXB9JHtpbmRlbnR9JHtsaW5lfWAgOiAnXFxuJztcbiAgICAgICAgICAgIHJldHVybiBgJHtzdHJ9XFxuJHtpbmRlbnR9JHtlbmR9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBgJHtzdGFydH0ke2ZjUGFkZGluZ30ke2xpbmVzLmpvaW4oJyAnKX0ke2ZjUGFkZGluZ30ke2VuZH1gO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gYWRkQ29tbWVudEJlZm9yZSh7IGluZGVudCwgb3B0aW9uczogeyBjb21tZW50U3RyaW5nIH0gfSwgbGluZXMsIGNvbW1lbnQsIGNob21wS2VlcCkge1xuICAgIGlmIChjb21tZW50ICYmIGNob21wS2VlcClcbiAgICAgICAgY29tbWVudCA9IGNvbW1lbnQucmVwbGFjZSgvXlxcbisvLCAnJyk7XG4gICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgY29uc3QgaWMgPSBpbmRlbnRDb21tZW50KGNvbW1lbnRTdHJpbmcoY29tbWVudCksIGluZGVudCk7XG4gICAgICAgIGxpbmVzLnB1c2goaWMudHJpbVN0YXJ0KCkpOyAvLyBBdm9pZCBkb3VibGUgaW5kZW50IG9uIGZpcnN0IGxpbmVcbiAgICB9XG59XG5cbmV4cG9ydCB7IHN0cmluZ2lmeUNvbGxlY3Rpb24gfTtcbiIsICJpbXBvcnQgeyBzdHJpbmdpZnlDb2xsZWN0aW9uIH0gZnJvbSAnLi4vc3RyaW5naWZ5L3N0cmluZ2lmeUNvbGxlY3Rpb24uanMnO1xuaW1wb3J0IHsgYWRkUGFpclRvSlNNYXAgfSBmcm9tICcuL2FkZFBhaXJUb0pTTWFwLmpzJztcbmltcG9ydCB7IENvbGxlY3Rpb24gfSBmcm9tICcuL0NvbGxlY3Rpb24uanMnO1xuaW1wb3J0IHsgTUFQLCBpc1BhaXIsIGlzU2NhbGFyIH0gZnJvbSAnLi9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBQYWlyLCBjcmVhdGVQYWlyIH0gZnJvbSAnLi9QYWlyLmpzJztcbmltcG9ydCB7IGlzU2NhbGFyVmFsdWUgfSBmcm9tICcuL1NjYWxhci5qcyc7XG5cbmZ1bmN0aW9uIGZpbmRQYWlyKGl0ZW1zLCBrZXkpIHtcbiAgICBjb25zdCBrID0gaXNTY2FsYXIoa2V5KSA/IGtleS52YWx1ZSA6IGtleTtcbiAgICBmb3IgKGNvbnN0IGl0IG9mIGl0ZW1zKSB7XG4gICAgICAgIGlmIChpc1BhaXIoaXQpKSB7XG4gICAgICAgICAgICBpZiAoaXQua2V5ID09PSBrZXkgfHwgaXQua2V5ID09PSBrKVxuICAgICAgICAgICAgICAgIHJldHVybiBpdDtcbiAgICAgICAgICAgIGlmIChpc1NjYWxhcihpdC5rZXkpICYmIGl0LmtleS52YWx1ZSA9PT0gaylcbiAgICAgICAgICAgICAgICByZXR1cm4gaXQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbmNsYXNzIFlBTUxNYXAgZXh0ZW5kcyBDb2xsZWN0aW9uIHtcbiAgICBzdGF0aWMgZ2V0IHRhZ05hbWUoKSB7XG4gICAgICAgIHJldHVybiAndGFnOnlhbWwub3JnLDIwMDI6bWFwJztcbiAgICB9XG4gICAgY29uc3RydWN0b3Ioc2NoZW1hKSB7XG4gICAgICAgIHN1cGVyKE1BUCwgc2NoZW1hKTtcbiAgICAgICAgdGhpcy5pdGVtcyA9IFtdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBIGdlbmVyaWMgY29sbGVjdGlvbiBwYXJzaW5nIG1ldGhvZCB0aGF0IGNhbiBiZSBleHRlbmRlZFxuICAgICAqIHRvIG90aGVyIG5vZGUgY2xhc3NlcyB0aGF0IGluaGVyaXQgZnJvbSBZQU1MTWFwXG4gICAgICovXG4gICAgc3RhdGljIGZyb20oc2NoZW1hLCBvYmosIGN0eCkge1xuICAgICAgICBjb25zdCB7IGtlZXBVbmRlZmluZWQsIHJlcGxhY2VyIH0gPSBjdHg7XG4gICAgICAgIGNvbnN0IG1hcCA9IG5ldyB0aGlzKHNjaGVtYSk7XG4gICAgICAgIGNvbnN0IGFkZCA9IChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgIHZhbHVlID0gcmVwbGFjZXIuY2FsbChvYmosIGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXBsYWNlcikgJiYgIXJlcGxhY2VyLmluY2x1ZGVzKGtleSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgfHwga2VlcFVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaChjcmVhdGVQYWlyKGtleSwgdmFsdWUsIGN0eCkpO1xuICAgICAgICB9O1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBvYmopXG4gICAgICAgICAgICAgICAgYWRkKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9iaiAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMob2JqKSlcbiAgICAgICAgICAgICAgICBhZGQoa2V5LCBvYmpba2V5XSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBzY2hlbWEuc29ydE1hcEVudHJpZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIG1hcC5pdGVtcy5zb3J0KHNjaGVtYS5zb3J0TWFwRW50cmllcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIHZhbHVlIHRvIHRoZSBjb2xsZWN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIG92ZXJ3cml0ZSAtIElmIG5vdCBzZXQgYHRydWVgLCB1c2luZyBhIGtleSB0aGF0IGlzIGFscmVhZHkgaW4gdGhlXG4gICAgICogICBjb2xsZWN0aW9uIHdpbGwgdGhyb3cuIE90aGVyd2lzZSwgb3ZlcndyaXRlcyB0aGUgcHJldmlvdXMgdmFsdWUuXG4gICAgICovXG4gICAgYWRkKHBhaXIsIG92ZXJ3cml0ZSkge1xuICAgICAgICBsZXQgX3BhaXI7XG4gICAgICAgIGlmIChpc1BhaXIocGFpcikpXG4gICAgICAgICAgICBfcGFpciA9IHBhaXI7XG4gICAgICAgIGVsc2UgaWYgKCFwYWlyIHx8IHR5cGVvZiBwYWlyICE9PSAnb2JqZWN0JyB8fCAhKCdrZXknIGluIHBhaXIpKSB7XG4gICAgICAgICAgICAvLyBJbiBUeXBlU2NyaXB0LCB0aGlzIG5ldmVyIGhhcHBlbnMuXG4gICAgICAgICAgICBfcGFpciA9IG5ldyBQYWlyKHBhaXIsIHBhaXI/LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBfcGFpciA9IG5ldyBQYWlyKHBhaXIua2V5LCBwYWlyLnZhbHVlKTtcbiAgICAgICAgY29uc3QgcHJldiA9IGZpbmRQYWlyKHRoaXMuaXRlbXMsIF9wYWlyLmtleSk7XG4gICAgICAgIGNvbnN0IHNvcnRFbnRyaWVzID0gdGhpcy5zY2hlbWE/LnNvcnRNYXBFbnRyaWVzO1xuICAgICAgICBpZiAocHJldikge1xuICAgICAgICAgICAgaWYgKCFvdmVyd3JpdGUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBLZXkgJHtfcGFpci5rZXl9IGFscmVhZHkgc2V0YCk7XG4gICAgICAgICAgICAvLyBGb3Igc2NhbGFycywga2VlcCB0aGUgb2xkIG5vZGUgJiBpdHMgY29tbWVudHMgYW5kIGFuY2hvcnNcbiAgICAgICAgICAgIGlmIChpc1NjYWxhcihwcmV2LnZhbHVlKSAmJiBpc1NjYWxhclZhbHVlKF9wYWlyLnZhbHVlKSlcbiAgICAgICAgICAgICAgICBwcmV2LnZhbHVlLnZhbHVlID0gX3BhaXIudmFsdWU7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcHJldi52YWx1ZSA9IF9wYWlyLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNvcnRFbnRyaWVzKSB7XG4gICAgICAgICAgICBjb25zdCBpID0gdGhpcy5pdGVtcy5maW5kSW5kZXgoaXRlbSA9PiBzb3J0RW50cmllcyhfcGFpciwgaXRlbSkgPCAwKTtcbiAgICAgICAgICAgIGlmIChpID09PSAtMSlcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2goX3BhaXIpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMuc3BsaWNlKGksIDAsIF9wYWlyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChfcGFpcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGVsZXRlKGtleSkge1xuICAgICAgICBjb25zdCBpdCA9IGZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgICAgIGlmICghaXQpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IGRlbCA9IHRoaXMuaXRlbXMuc3BsaWNlKHRoaXMuaXRlbXMuaW5kZXhPZihpdCksIDEpO1xuICAgICAgICByZXR1cm4gZGVsLmxlbmd0aCA+IDA7XG4gICAgfVxuICAgIGdldChrZXksIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgY29uc3QgaXQgPSBmaW5kUGFpcih0aGlzLml0ZW1zLCBrZXkpO1xuICAgICAgICBjb25zdCBub2RlID0gaXQ/LnZhbHVlO1xuICAgICAgICByZXR1cm4gKCFrZWVwU2NhbGFyICYmIGlzU2NhbGFyKG5vZGUpID8gbm9kZS52YWx1ZSA6IG5vZGUpID8/IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaGFzKGtleSkge1xuICAgICAgICByZXR1cm4gISFmaW5kUGFpcih0aGlzLml0ZW1zLCBrZXkpO1xuICAgIH1cbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLmFkZChuZXcgUGFpcihrZXksIHZhbHVlKSwgdHJ1ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBjdHggLSBDb252ZXJzaW9uIGNvbnRleHQsIG9yaWdpbmFsbHkgc2V0IGluIERvY3VtZW50I3RvSlMoKVxuICAgICAqIEBwYXJhbSB7Q2xhc3N9IFR5cGUgLSBJZiBzZXQsIGZvcmNlcyB0aGUgcmV0dXJuZWQgY29sbGVjdGlvbiB0eXBlXG4gICAgICogQHJldHVybnMgSW5zdGFuY2Ugb2YgVHlwZSwgTWFwLCBvciBPYmplY3RcbiAgICAgKi9cbiAgICB0b0pTT04oXywgY3R4LCBUeXBlKSB7XG4gICAgICAgIGNvbnN0IG1hcCA9IFR5cGUgPyBuZXcgVHlwZSgpIDogY3R4Py5tYXBBc01hcCA/IG5ldyBNYXAoKSA6IHt9O1xuICAgICAgICBpZiAoY3R4Py5vbkNyZWF0ZSlcbiAgICAgICAgICAgIGN0eC5vbkNyZWF0ZShtYXApO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGhpcy5pdGVtcylcbiAgICAgICAgICAgIGFkZFBhaXJUb0pTTWFwKGN0eCwgbWFwLCBpdGVtKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgdG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMpO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGhpcy5pdGVtcykge1xuICAgICAgICAgICAgaWYgKCFpc1BhaXIoaXRlbSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNYXAgaXRlbXMgbXVzdCBhbGwgYmUgcGFpcnM7IGZvdW5kICR7SlNPTi5zdHJpbmdpZnkoaXRlbSl9IGluc3RlYWRgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWN0eC5hbGxOdWxsVmFsdWVzICYmIHRoaXMuaGFzQWxsTnVsbFZhbHVlcyhmYWxzZSkpXG4gICAgICAgICAgICBjdHggPSBPYmplY3QuYXNzaWduKHt9LCBjdHgsIHsgYWxsTnVsbFZhbHVlczogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeUNvbGxlY3Rpb24odGhpcywgY3R4LCB7XG4gICAgICAgICAgICBibG9ja0l0ZW1QcmVmaXg6ICcnLFxuICAgICAgICAgICAgZmxvd0NoYXJzOiB7IHN0YXJ0OiAneycsIGVuZDogJ30nIH0sXG4gICAgICAgICAgICBpdGVtSW5kZW50OiBjdHguaW5kZW50IHx8ICcnLFxuICAgICAgICAgICAgb25DaG9tcEtlZXAsXG4gICAgICAgICAgICBvbkNvbW1lbnRcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBZQU1MTWFwLCBmaW5kUGFpciB9O1xuIiwgImltcG9ydCB7IGlzTWFwIH0gZnJvbSAnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgWUFNTE1hcCB9IGZyb20gJy4uLy4uL25vZGVzL1lBTUxNYXAuanMnO1xuXG5jb25zdCBtYXAgPSB7XG4gICAgY29sbGVjdGlvbjogJ21hcCcsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBub2RlQ2xhc3M6IFlBTUxNYXAsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6bWFwJyxcbiAgICByZXNvbHZlKG1hcCwgb25FcnJvcikge1xuICAgICAgICBpZiAoIWlzTWFwKG1hcCkpXG4gICAgICAgICAgICBvbkVycm9yKCdFeHBlY3RlZCBhIG1hcHBpbmcgZm9yIHRoaXMgdGFnJyk7XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfSxcbiAgICBjcmVhdGVOb2RlOiAoc2NoZW1hLCBvYmosIGN0eCkgPT4gWUFNTE1hcC5mcm9tKHNjaGVtYSwgb2JqLCBjdHgpXG59O1xuXG5leHBvcnQgeyBtYXAgfTtcbiIsICJpbXBvcnQgeyBjcmVhdGVOb2RlIH0gZnJvbSAnLi4vZG9jL2NyZWF0ZU5vZGUuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5Q29sbGVjdGlvbiB9IGZyb20gJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlDb2xsZWN0aW9uLmpzJztcbmltcG9ydCB7IENvbGxlY3Rpb24gfSBmcm9tICcuL0NvbGxlY3Rpb24uanMnO1xuaW1wb3J0IHsgU0VRLCBpc1NjYWxhciB9IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgaXNTY2FsYXJWYWx1ZSB9IGZyb20gJy4vU2NhbGFyLmpzJztcbmltcG9ydCB7IHRvSlMgfSBmcm9tICcuL3RvSlMuanMnO1xuXG5jbGFzcyBZQU1MU2VxIGV4dGVuZHMgQ29sbGVjdGlvbiB7XG4gICAgc3RhdGljIGdldCB0YWdOYW1lKCkge1xuICAgICAgICByZXR1cm4gJ3RhZzp5YW1sLm9yZywyMDAyOnNlcSc7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHNjaGVtYSkge1xuICAgICAgICBzdXBlcihTRVEsIHNjaGVtYSk7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcbiAgICB9XG4gICAgYWRkKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuaXRlbXMucHVzaCh2YWx1ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSB2YWx1ZSBmcm9tIHRoZSBjb2xsZWN0aW9uLlxuICAgICAqXG4gICAgICogYGtleWAgbXVzdCBjb250YWluIGEgcmVwcmVzZW50YXRpb24gb2YgYW4gaW50ZWdlciBmb3IgdGhpcyB0byBzdWNjZWVkLlxuICAgICAqIEl0IG1heSBiZSB3cmFwcGVkIGluIGEgYFNjYWxhcmAuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGl0ZW0gd2FzIGZvdW5kIGFuZCByZW1vdmVkLlxuICAgICAqL1xuICAgIGRlbGV0ZShrZXkpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZHggIT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBkZWwgPSB0aGlzLml0ZW1zLnNwbGljZShpZHgsIDEpO1xuICAgICAgICByZXR1cm4gZGVsLmxlbmd0aCA+IDA7XG4gICAgfVxuICAgIGdldChrZXksIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZHggIT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgaXQgPSB0aGlzLml0ZW1zW2lkeF07XG4gICAgICAgIHJldHVybiAha2VlcFNjYWxhciAmJiBpc1NjYWxhcihpdCkgPyBpdC52YWx1ZSA6IGl0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGNvbGxlY3Rpb24gaW5jbHVkZXMgYSB2YWx1ZSB3aXRoIHRoZSBrZXkgYGtleWAuXG4gICAgICpcbiAgICAgKiBga2V5YCBtdXN0IGNvbnRhaW4gYSByZXByZXNlbnRhdGlvbiBvZiBhbiBpbnRlZ2VyIGZvciB0aGlzIHRvIHN1Y2NlZWQuXG4gICAgICogSXQgbWF5IGJlIHdyYXBwZWQgaW4gYSBgU2NhbGFyYC5cbiAgICAgKi9cbiAgICBoYXMoa2V5KSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IGFzSXRlbUluZGV4KGtleSk7XG4gICAgICAgIHJldHVybiB0eXBlb2YgaWR4ID09PSAnbnVtYmVyJyAmJiBpZHggPCB0aGlzLml0ZW1zLmxlbmd0aDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIHZhbHVlIGluIHRoaXMgY29sbGVjdGlvbi4gRm9yIGAhIXNldGAsIGB2YWx1ZWAgbmVlZHMgdG8gYmUgYVxuICAgICAqIGJvb2xlYW4gdG8gYWRkL3JlbW92ZSB0aGUgaXRlbSBmcm9tIHRoZSBzZXQuXG4gICAgICpcbiAgICAgKiBJZiBga2V5YCBkb2VzIG5vdCBjb250YWluIGEgcmVwcmVzZW50YXRpb24gb2YgYW4gaW50ZWdlciwgdGhpcyB3aWxsIHRocm93LlxuICAgICAqIEl0IG1heSBiZSB3cmFwcGVkIGluIGEgYFNjYWxhcmAuXG4gICAgICovXG4gICAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZHggIT09ICdudW1iZXInKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhIHZhbGlkIGluZGV4LCBub3QgJHtrZXl9LmApO1xuICAgICAgICBjb25zdCBwcmV2ID0gdGhpcy5pdGVtc1tpZHhdO1xuICAgICAgICBpZiAoaXNTY2FsYXIocHJldikgJiYgaXNTY2FsYXJWYWx1ZSh2YWx1ZSkpXG4gICAgICAgICAgICBwcmV2LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaWR4XSA9IHZhbHVlO1xuICAgIH1cbiAgICB0b0pTT04oXywgY3R4KSB7XG4gICAgICAgIGNvbnN0IHNlcSA9IFtdO1xuICAgICAgICBpZiAoY3R4Py5vbkNyZWF0ZSlcbiAgICAgICAgICAgIGN0eC5vbkNyZWF0ZShzZXEpO1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLml0ZW1zKVxuICAgICAgICAgICAgc2VxLnB1c2godG9KUyhpdGVtLCBTdHJpbmcoaSsrKSwgY3R4KSk7XG4gICAgICAgIHJldHVybiBzZXE7XG4gICAgfVxuICAgIHRvU3RyaW5nKGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICBpZiAoIWN0eClcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeUNvbGxlY3Rpb24odGhpcywgY3R4LCB7XG4gICAgICAgICAgICBibG9ja0l0ZW1QcmVmaXg6ICctICcsXG4gICAgICAgICAgICBmbG93Q2hhcnM6IHsgc3RhcnQ6ICdbJywgZW5kOiAnXScgfSxcbiAgICAgICAgICAgIGl0ZW1JbmRlbnQ6IChjdHguaW5kZW50IHx8ICcnKSArICcgICcsXG4gICAgICAgICAgICBvbkNob21wS2VlcCxcbiAgICAgICAgICAgIG9uQ29tbWVudFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc3RhdGljIGZyb20oc2NoZW1hLCBvYmosIGN0eCkge1xuICAgICAgICBjb25zdCB7IHJlcGxhY2VyIH0gPSBjdHg7XG4gICAgICAgIGNvbnN0IHNlcSA9IG5ldyB0aGlzKHNjaGVtYSk7XG4gICAgICAgIGlmIChvYmogJiYgU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChvYmopKSB7XG4gICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICBmb3IgKGxldCBpdCBvZiBvYmopIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IG9iaiBpbnN0YW5jZW9mIFNldCA/IGl0IDogU3RyaW5nKGkrKyk7XG4gICAgICAgICAgICAgICAgICAgIGl0ID0gcmVwbGFjZXIuY2FsbChvYmosIGtleSwgaXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXEuaXRlbXMucHVzaChjcmVhdGVOb2RlKGl0LCB1bmRlZmluZWQsIGN0eCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXE7XG4gICAgfVxufVxuZnVuY3Rpb24gYXNJdGVtSW5kZXgoa2V5KSB7XG4gICAgbGV0IGlkeCA9IGlzU2NhbGFyKGtleSkgPyBrZXkudmFsdWUgOiBrZXk7XG4gICAgaWYgKGlkeCAmJiB0eXBlb2YgaWR4ID09PSAnc3RyaW5nJylcbiAgICAgICAgaWR4ID0gTnVtYmVyKGlkeCk7XG4gICAgcmV0dXJuIHR5cGVvZiBpZHggPT09ICdudW1iZXInICYmIE51bWJlci5pc0ludGVnZXIoaWR4KSAmJiBpZHggPj0gMFxuICAgICAgICA/IGlkeFxuICAgICAgICA6IG51bGw7XG59XG5cbmV4cG9ydCB7IFlBTUxTZXEgfTtcbiIsICJpbXBvcnQgeyBpc1NlcSB9IGZyb20gJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFlBTUxTZXEgfSBmcm9tICcuLi8uLi9ub2Rlcy9ZQU1MU2VxLmpzJztcblxuY29uc3Qgc2VxID0ge1xuICAgIGNvbGxlY3Rpb246ICdzZXEnLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgbm9kZUNsYXNzOiBZQU1MU2VxLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOnNlcScsXG4gICAgcmVzb2x2ZShzZXEsIG9uRXJyb3IpIHtcbiAgICAgICAgaWYgKCFpc1NlcShzZXEpKVxuICAgICAgICAgICAgb25FcnJvcignRXhwZWN0ZWQgYSBzZXF1ZW5jZSBmb3IgdGhpcyB0YWcnKTtcbiAgICAgICAgcmV0dXJuIHNlcTtcbiAgICB9LFxuICAgIGNyZWF0ZU5vZGU6IChzY2hlbWEsIG9iaiwgY3R4KSA9PiBZQU1MU2VxLmZyb20oc2NoZW1hLCBvYmosIGN0eClcbn07XG5cbmV4cG9ydCB7IHNlcSB9O1xuIiwgImltcG9ydCB7IHN0cmluZ2lmeVN0cmluZyB9IGZyb20gJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlTdHJpbmcuanMnO1xuXG5jb25zdCBzdHJpbmcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInLFxuICAgIHJlc29sdmU6IHN0ciA9PiBzdHIsXG4gICAgc3RyaW5naWZ5KGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICBjdHggPSBPYmplY3QuYXNzaWduKHsgYWN0dWFsU3RyaW5nOiB0cnVlIH0sIGN0eCk7XG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICB9XG59O1xuXG5leHBvcnQgeyBzdHJpbmcgfTtcbiIsICJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuXG5jb25zdCBudWxsVGFnID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PSBudWxsLFxuICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBTY2FsYXIobnVsbCksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpudWxsJyxcbiAgICB0ZXN0OiAvXig/On58W05uXXVsbHxOVUxMKT8kLyxcbiAgICByZXNvbHZlOiAoKSA9PiBuZXcgU2NhbGFyKG51bGwpLFxuICAgIHN0cmluZ2lmeTogKHsgc291cmNlIH0sIGN0eCkgPT4gdHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycgJiYgbnVsbFRhZy50ZXN0LnRlc3Qoc291cmNlKVxuICAgICAgICA/IHNvdXJjZVxuICAgICAgICA6IGN0eC5vcHRpb25zLm51bGxTdHJcbn07XG5cbmV4cG9ydCB7IG51bGxUYWcgfTtcbiIsICJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuXG5jb25zdCBib29sVGFnID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLFxuICAgIHRlc3Q6IC9eKD86W1R0XXJ1ZXxUUlVFfFtGZl1hbHNlfEZBTFNFKSQvLFxuICAgIHJlc29sdmU6IHN0ciA9PiBuZXcgU2NhbGFyKHN0clswXSA9PT0gJ3QnIHx8IHN0clswXSA9PT0gJ1QnKSxcbiAgICBzdHJpbmdpZnkoeyBzb3VyY2UsIHZhbHVlIH0sIGN0eCkge1xuICAgICAgICBpZiAoc291cmNlICYmIGJvb2xUYWcudGVzdC50ZXN0KHNvdXJjZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN2ID0gc291cmNlWzBdID09PSAndCcgfHwgc291cmNlWzBdID09PSAnVCc7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHN2KVxuICAgICAgICAgICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlID8gY3R4Lm9wdGlvbnMudHJ1ZVN0ciA6IGN0eC5vcHRpb25zLmZhbHNlU3RyO1xuICAgIH1cbn07XG5cbmV4cG9ydCB7IGJvb2xUYWcgfTtcbiIsICJmdW5jdGlvbiBzdHJpbmdpZnlOdW1iZXIoeyBmb3JtYXQsIG1pbkZyYWN0aW9uRGlnaXRzLCB0YWcsIHZhbHVlIH0pIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnYmlnaW50JylcbiAgICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG4gICAgY29uc3QgbnVtID0gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyA/IHZhbHVlIDogTnVtYmVyKHZhbHVlKTtcbiAgICBpZiAoIWlzRmluaXRlKG51bSkpXG4gICAgICAgIHJldHVybiBpc05hTihudW0pID8gJy5uYW4nIDogbnVtIDwgMCA/ICctLmluZicgOiAnLmluZic7XG4gICAgbGV0IG4gPSBPYmplY3QuaXModmFsdWUsIC0wKSA/ICctMCcgOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgaWYgKCFmb3JtYXQgJiZcbiAgICAgICAgbWluRnJhY3Rpb25EaWdpdHMgJiZcbiAgICAgICAgKCF0YWcgfHwgdGFnID09PSAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnKSAmJlxuICAgICAgICAvXi0/XFxkLy50ZXN0KG4pICYmXG4gICAgICAgICFuLmluY2x1ZGVzKCdlJykpIHtcbiAgICAgICAgbGV0IGkgPSBuLmluZGV4T2YoJy4nKTtcbiAgICAgICAgaWYgKGkgPCAwKSB7XG4gICAgICAgICAgICBpID0gbi5sZW5ndGg7XG4gICAgICAgICAgICBuICs9ICcuJztcbiAgICAgICAgfVxuICAgICAgICBsZXQgZCA9IG1pbkZyYWN0aW9uRGlnaXRzIC0gKG4ubGVuZ3RoIC0gaSAtIDEpO1xuICAgICAgICB3aGlsZSAoZC0tID4gMClcbiAgICAgICAgICAgIG4gKz0gJzAnO1xuICAgIH1cbiAgICByZXR1cm4gbjtcbn1cblxuZXhwb3J0IHsgc3RyaW5naWZ5TnVtYmVyIH07XG4iLCAiaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeU51bWJlciB9IGZyb20gJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnO1xuXG5jb25zdCBmbG9hdE5hTiA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICB0ZXN0OiAvXig/OlstK10/XFwuKD86aW5mfEluZnxJTkYpfFxcLm5hbnxcXC5OYU58XFwuTkFOKSQvLFxuICAgIHJlc29sdmU6IHN0ciA9PiBzdHIuc2xpY2UoLTMpLnRvTG93ZXJDYXNlKCkgPT09ICduYW4nXG4gICAgICAgID8gTmFOXG4gICAgICAgIDogc3RyWzBdID09PSAnLSdcbiAgICAgICAgICAgID8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZXG4gICAgICAgICAgICA6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlclxufTtcbmNvbnN0IGZsb2F0RXhwID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIGZvcm1hdDogJ0VYUCcsXG4gICAgdGVzdDogL15bLStdPyg/OlxcLlswLTldK3xbMC05XSsoPzpcXC5bMC05XSopPylbZUVdWy0rXT9bMC05XSskLyxcbiAgICByZXNvbHZlOiBzdHIgPT4gcGFyc2VGbG9hdChzdHIpLFxuICAgIHN0cmluZ2lmeShub2RlKSB7XG4gICAgICAgIGNvbnN0IG51bSA9IE51bWJlcihub2RlLnZhbHVlKTtcbiAgICAgICAgcmV0dXJuIGlzRmluaXRlKG51bSkgPyBudW0udG9FeHBvbmVudGlhbCgpIDogc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xuICAgIH1cbn07XG5jb25zdCBmbG9hdCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICB0ZXN0OiAvXlstK10/KD86XFwuWzAtOV0rfFswLTldK1xcLlswLTldKikkLyxcbiAgICByZXNvbHZlKHN0cikge1xuICAgICAgICBjb25zdCBub2RlID0gbmV3IFNjYWxhcihwYXJzZUZsb2F0KHN0cikpO1xuICAgICAgICBjb25zdCBkb3QgPSBzdHIuaW5kZXhPZignLicpO1xuICAgICAgICBpZiAoZG90ICE9PSAtMSAmJiBzdHJbc3RyLmxlbmd0aCAtIDFdID09PSAnMCcpXG4gICAgICAgICAgICBub2RlLm1pbkZyYWN0aW9uRGlnaXRzID0gc3RyLmxlbmd0aCAtIGRvdCAtIDE7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH0sXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXJcbn07XG5cbmV4cG9ydCB7IGZsb2F0LCBmbG9hdEV4cCwgZmxvYXROYU4gfTtcbiIsICJpbXBvcnQgeyBzdHJpbmdpZnlOdW1iZXIgfSBmcm9tICcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5TnVtYmVyLmpzJztcblxuY29uc3QgaW50SWRlbnRpZnkgPSAodmFsdWUpID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcgfHwgTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSk7XG5jb25zdCBpbnRSZXNvbHZlID0gKHN0ciwgb2Zmc2V0LCByYWRpeCwgeyBpbnRBc0JpZ0ludCB9KSA9PiAoaW50QXNCaWdJbnQgPyBCaWdJbnQoc3RyKSA6IHBhcnNlSW50KHN0ci5zdWJzdHJpbmcob2Zmc2V0KSwgcmFkaXgpKTtcbmZ1bmN0aW9uIGludFN0cmluZ2lmeShub2RlLCByYWRpeCwgcHJlZml4KSB7XG4gICAgY29uc3QgeyB2YWx1ZSB9ID0gbm9kZTtcbiAgICBpZiAoaW50SWRlbnRpZnkodmFsdWUpICYmIHZhbHVlID49IDApXG4gICAgICAgIHJldHVybiBwcmVmaXggKyB2YWx1ZS50b1N0cmluZyhyYWRpeCk7XG4gICAgcmV0dXJuIHN0cmluZ2lmeU51bWJlcihub2RlKTtcbn1cbmNvbnN0IGludE9jdCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gaW50SWRlbnRpZnkodmFsdWUpICYmIHZhbHVlID49IDAsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIGZvcm1hdDogJ09DVCcsXG4gICAgdGVzdDogL14wb1swLTddKyQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAyLCA4LCBvcHQpLFxuICAgIHN0cmluZ2lmeTogbm9kZSA9PiBpbnRTdHJpbmdpZnkobm9kZSwgOCwgJzBvJylcbn07XG5jb25zdCBpbnQgPSB7XG4gICAgaWRlbnRpZnk6IGludElkZW50aWZ5LFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICB0ZXN0OiAvXlstK10/WzAtOV0rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDAsIDEwLCBvcHQpLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyXG59O1xuY29uc3QgaW50SGV4ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiBpbnRJZGVudGlmeSh2YWx1ZSkgJiYgdmFsdWUgPj0gMCxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnSEVYJyxcbiAgICB0ZXN0OiAvXjB4WzAtOWEtZkEtRl0rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDIsIDE2LCBvcHQpLFxuICAgIHN0cmluZ2lmeTogbm9kZSA9PiBpbnRTdHJpbmdpZnkobm9kZSwgMTYsICcweCcpXG59O1xuXG5leHBvcnQgeyBpbnQsIGludEhleCwgaW50T2N0IH07XG4iLCAiaW1wb3J0IHsgbWFwIH0gZnJvbSAnLi4vY29tbW9uL21hcC5qcyc7XG5pbXBvcnQgeyBudWxsVGFnIH0gZnJvbSAnLi4vY29tbW9uL251bGwuanMnO1xuaW1wb3J0IHsgc2VxIH0gZnJvbSAnLi4vY29tbW9uL3NlcS5qcyc7XG5pbXBvcnQgeyBzdHJpbmcgfSBmcm9tICcuLi9jb21tb24vc3RyaW5nLmpzJztcbmltcG9ydCB7IGJvb2xUYWcgfSBmcm9tICcuL2Jvb2wuanMnO1xuaW1wb3J0IHsgZmxvYXROYU4sIGZsb2F0RXhwLCBmbG9hdCB9IGZyb20gJy4vZmxvYXQuanMnO1xuaW1wb3J0IHsgaW50T2N0LCBpbnQsIGludEhleCB9IGZyb20gJy4vaW50LmpzJztcblxuY29uc3Qgc2NoZW1hID0gW1xuICAgIG1hcCxcbiAgICBzZXEsXG4gICAgc3RyaW5nLFxuICAgIG51bGxUYWcsXG4gICAgYm9vbFRhZyxcbiAgICBpbnRPY3QsXG4gICAgaW50LFxuICAgIGludEhleCxcbiAgICBmbG9hdE5hTixcbiAgICBmbG9hdEV4cCxcbiAgICBmbG9hdFxuXTtcblxuZXhwb3J0IHsgc2NoZW1hIH07XG4iLCAiaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJztcbmltcG9ydCB7IG1hcCB9IGZyb20gJy4uL2NvbW1vbi9tYXAuanMnO1xuaW1wb3J0IHsgc2VxIH0gZnJvbSAnLi4vY29tbW9uL3NlcS5qcyc7XG5cbmZ1bmN0aW9uIGludElkZW50aWZ5KHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcgfHwgTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSk7XG59XG5jb25zdCBzdHJpbmdpZnlKU09OID0gKHsgdmFsdWUgfSkgPT4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuY29uc3QganNvblNjYWxhcnMgPSBbXG4gICAge1xuICAgICAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6c3RyJyxcbiAgICAgICAgcmVzb2x2ZTogc3RyID0+IHN0cixcbiAgICAgICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlKU09OXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PSBudWxsLFxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgU2NhbGFyKG51bGwpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpudWxsJyxcbiAgICAgICAgdGVzdDogL15udWxsJC8sXG4gICAgICAgIHJlc29sdmU6ICgpID0+IG51bGwsXG4gICAgICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5SlNPTlxuICAgIH0sXG4gICAge1xuICAgICAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLFxuICAgICAgICB0ZXN0OiAvXnRydWUkfF5mYWxzZSQvLFxuICAgICAgICByZXNvbHZlOiBzdHIgPT4gc3RyID09PSAndHJ1ZScsXG4gICAgICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5SlNPTlxuICAgIH0sXG4gICAge1xuICAgICAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgICAgIHRlc3Q6IC9eLT8oPzowfFsxLTldWzAtOV0qKSQvLFxuICAgICAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgeyBpbnRBc0JpZ0ludCB9KSA9PiBpbnRBc0JpZ0ludCA/IEJpZ0ludChzdHIpIDogcGFyc2VJbnQoc3RyLCAxMCksXG4gICAgICAgIHN0cmluZ2lmeTogKHsgdmFsdWUgfSkgPT4gaW50SWRlbnRpZnkodmFsdWUpID8gdmFsdWUudG9TdHJpbmcoKSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxuICAgIH0sXG4gICAge1xuICAgICAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgICAgICB0ZXN0OiAvXi0/KD86MHxbMS05XVswLTldKikoPzpcXC5bMC05XSopPyg/OltlRV1bLStdP1swLTldKyk/JC8sXG4gICAgICAgIHJlc29sdmU6IHN0ciA9PiBwYXJzZUZsb2F0KHN0ciksXG4gICAgICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5SlNPTlxuICAgIH1cbl07XG5jb25zdCBqc29uRXJyb3IgPSB7XG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICcnLFxuICAgIHRlc3Q6IC9eLyxcbiAgICByZXNvbHZlKHN0ciwgb25FcnJvcikge1xuICAgICAgICBvbkVycm9yKGBVbnJlc29sdmVkIHBsYWluIHNjYWxhciAke0pTT04uc3RyaW5naWZ5KHN0cil9YCk7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxufTtcbmNvbnN0IHNjaGVtYSA9IFttYXAsIHNlcV0uY29uY2F0KGpzb25TY2FsYXJzLCBqc29uRXJyb3IpO1xuXG5leHBvcnQgeyBzY2hlbWEgfTtcbiIsICJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5U3RyaW5nIH0gZnJvbSAnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeVN0cmluZy5qcyc7XG5cbmNvbnN0IGJpbmFyeSA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgaW5zdGFuY2VvZiBVaW50OEFycmF5LCAvLyBCdWZmZXIgaW5oZXJpdHMgZnJvbSBVaW50OEFycmF5XG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6YmluYXJ5JyxcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgQnVmZmVyIGluIG5vZGUgYW5kIGFuIFVpbnQ4QXJyYXkgaW4gYnJvd3NlcnNcbiAgICAgKlxuICAgICAqIFRvIHVzZSB0aGUgcmVzdWx0aW5nIGJ1ZmZlciBhcyBhbiBpbWFnZSwgeW91J2xsIHdhbnQgdG8gZG8gc29tZXRoaW5nIGxpa2U6XG4gICAgICpcbiAgICAgKiAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbYnVmZmVyXSwgeyB0eXBlOiAnaW1hZ2UvanBlZycgfSlcbiAgICAgKiAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwaG90bycpLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYilcbiAgICAgKi9cbiAgICByZXNvbHZlKHNyYywgb25FcnJvcikge1xuICAgICAgICBpZiAodHlwZW9mIGF0b2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIE9uIElFIDExLCBhdG9iKCkgY2FuJ3QgaGFuZGxlIG5ld2xpbmVzXG4gICAgICAgICAgICBjb25zdCBzdHIgPSBhdG9iKHNyYy5yZXBsYWNlKC9bXFxuXFxyXS9nLCAnJykpO1xuICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoc3RyLmxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBidWZmZXJbaV0gPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBvbkVycm9yKCdUaGlzIGVudmlyb25tZW50IGRvZXMgbm90IHN1cHBvcnQgcmVhZGluZyBiaW5hcnkgdGFnczsgZWl0aGVyIEJ1ZmZlciBvciBhdG9iIGlzIHJlcXVpcmVkJyk7XG4gICAgICAgICAgICByZXR1cm4gc3JjO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBzdHJpbmdpZnkoeyBjb21tZW50LCB0eXBlLCB2YWx1ZSB9LCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgY29uc3QgYnVmID0gdmFsdWU7IC8vIGNoZWNrZWQgZWFybGllciBieSBiaW5hcnkuaWRlbnRpZnkoKVxuICAgICAgICBsZXQgc3RyO1xuICAgICAgICBpZiAodHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGxldCBzID0gJyc7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ1Zi5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKTtcbiAgICAgICAgICAgIHN0ciA9IGJ0b2Eocyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgZW52aXJvbm1lbnQgZG9lcyBub3Qgc3VwcG9ydCB3cml0aW5nIGJpbmFyeSB0YWdzOyBlaXRoZXIgQnVmZmVyIG9yIGJ0b2EgaXMgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0eXBlID8/ICh0eXBlID0gU2NhbGFyLkJMT0NLX0xJVEVSQUwpO1xuICAgICAgICBpZiAodHlwZSAhPT0gU2NhbGFyLlFVT1RFX0RPVUJMRSkge1xuICAgICAgICAgICAgY29uc3QgbGluZVdpZHRoID0gTWF0aC5tYXgoY3R4Lm9wdGlvbnMubGluZVdpZHRoIC0gY3R4LmluZGVudC5sZW5ndGgsIGN0eC5vcHRpb25zLm1pbkNvbnRlbnRXaWR0aCk7XG4gICAgICAgICAgICBjb25zdCBuID0gTWF0aC5jZWlsKHN0ci5sZW5ndGggLyBsaW5lV2lkdGgpO1xuICAgICAgICAgICAgY29uc3QgbGluZXMgPSBuZXcgQXJyYXkobik7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbyA9IDA7IGkgPCBuOyArK2ksIG8gKz0gbGluZVdpZHRoKSB7XG4gICAgICAgICAgICAgICAgbGluZXNbaV0gPSBzdHIuc3Vic3RyKG8sIGxpbmVXaWR0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdHIgPSBsaW5lcy5qb2luKHR5cGUgPT09IFNjYWxhci5CTE9DS19MSVRFUkFMID8gJ1xcbicgOiAnICcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlTdHJpbmcoeyBjb21tZW50LCB0eXBlLCB2YWx1ZTogc3RyIH0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgfVxufTtcblxuZXhwb3J0IHsgYmluYXJ5IH07XG4iLCAiaW1wb3J0IHsgaXNTZXEsIGlzUGFpciwgaXNNYXAgfSBmcm9tICcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBjcmVhdGVQYWlyLCBQYWlyIH0gZnJvbSAnLi4vLi4vbm9kZXMvUGFpci5qcyc7XG5pbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgWUFNTFNlcSB9IGZyb20gJy4uLy4uL25vZGVzL1lBTUxTZXEuanMnO1xuXG5mdW5jdGlvbiByZXNvbHZlUGFpcnMoc2VxLCBvbkVycm9yKSB7XG4gICAgaWYgKGlzU2VxKHNlcSkpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZXEuaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gc2VxLml0ZW1zW2ldO1xuICAgICAgICAgICAgaWYgKGlzUGFpcihpdGVtKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzTWFwKGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uaXRlbXMubGVuZ3RoID4gMSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignRWFjaCBwYWlyIG11c3QgaGF2ZSBpdHMgb3duIHNlcXVlbmNlIGluZGljYXRvcicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhaXIgPSBpdGVtLml0ZW1zWzBdIHx8IG5ldyBQYWlyKG5ldyBTY2FsYXIobnVsbCkpO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmNvbW1lbnRCZWZvcmUpXG4gICAgICAgICAgICAgICAgICAgIHBhaXIua2V5LmNvbW1lbnRCZWZvcmUgPSBwYWlyLmtleS5jb21tZW50QmVmb3JlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGAke2l0ZW0uY29tbWVudEJlZm9yZX1cXG4ke3BhaXIua2V5LmNvbW1lbnRCZWZvcmV9YFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBpdGVtLmNvbW1lbnRCZWZvcmU7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbiA9IHBhaXIudmFsdWUgPz8gcGFpci5rZXk7XG4gICAgICAgICAgICAgICAgICAgIGNuLmNvbW1lbnQgPSBjbi5jb21tZW50XG4gICAgICAgICAgICAgICAgICAgICAgICA/IGAke2l0ZW0uY29tbWVudH1cXG4ke2NuLmNvbW1lbnR9YFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBpdGVtLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGl0ZW0gPSBwYWlyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VxLml0ZW1zW2ldID0gaXNQYWlyKGl0ZW0pID8gaXRlbSA6IG5ldyBQYWlyKGl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2VcbiAgICAgICAgb25FcnJvcignRXhwZWN0ZWQgYSBzZXF1ZW5jZSBmb3IgdGhpcyB0YWcnKTtcbiAgICByZXR1cm4gc2VxO1xufVxuZnVuY3Rpb24gY3JlYXRlUGFpcnMoc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSB7XG4gICAgY29uc3QgeyByZXBsYWNlciB9ID0gY3R4O1xuICAgIGNvbnN0IHBhaXJzID0gbmV3IFlBTUxTZXEoc2NoZW1hKTtcbiAgICBwYWlycy50YWcgPSAndGFnOnlhbWwub3JnLDIwMDI6cGFpcnMnO1xuICAgIGxldCBpID0gMDtcbiAgICBpZiAoaXRlcmFibGUgJiYgU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChpdGVyYWJsZSkpXG4gICAgICAgIGZvciAobGV0IGl0IG9mIGl0ZXJhYmxlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgIGl0ID0gcmVwbGFjZXIuY2FsbChpdGVyYWJsZSwgU3RyaW5nKGkrKyksIGl0KTtcbiAgICAgICAgICAgIGxldCBrZXksIHZhbHVlO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaXQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0Lmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBrZXkgPSBpdFswXTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpdFsxXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBba2V5LCB2YWx1ZV0gdHVwbGU6ICR7aXR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpdCAmJiBpdCBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhpdCk7XG4gICAgICAgICAgICAgICAgaWYgKGtleXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IGtleXNbMF07XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gaXRba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIHR1cGxlIHdpdGggb25lIGtleSwgbm90ICR7a2V5cy5sZW5ndGh9IGtleXNgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBpdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhaXJzLml0ZW1zLnB1c2goY3JlYXRlUGFpcihrZXksIHZhbHVlLCBjdHgpKTtcbiAgICAgICAgfVxuICAgIHJldHVybiBwYWlycztcbn1cbmNvbnN0IHBhaXJzID0ge1xuICAgIGNvbGxlY3Rpb246ICdzZXEnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOnBhaXJzJyxcbiAgICByZXNvbHZlOiByZXNvbHZlUGFpcnMsXG4gICAgY3JlYXRlTm9kZTogY3JlYXRlUGFpcnNcbn07XG5cbmV4cG9ydCB7IGNyZWF0ZVBhaXJzLCBwYWlycywgcmVzb2x2ZVBhaXJzIH07XG4iLCAiaW1wb3J0IHsgaXNTY2FsYXIsIGlzUGFpciB9IGZyb20gJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IHRvSlMgfSBmcm9tICcuLi8uLi9ub2Rlcy90b0pTLmpzJztcbmltcG9ydCB7IFlBTUxNYXAgfSBmcm9tICcuLi8uLi9ub2Rlcy9ZQU1MTWFwLmpzJztcbmltcG9ydCB7IFlBTUxTZXEgfSBmcm9tICcuLi8uLi9ub2Rlcy9ZQU1MU2VxLmpzJztcbmltcG9ydCB7IHJlc29sdmVQYWlycywgY3JlYXRlUGFpcnMgfSBmcm9tICcuL3BhaXJzLmpzJztcblxuY2xhc3MgWUFNTE9NYXAgZXh0ZW5kcyBZQU1MU2VxIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5hZGQgPSBZQU1MTWFwLnByb3RvdHlwZS5hZGQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5kZWxldGUgPSBZQU1MTWFwLnByb3RvdHlwZS5kZWxldGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5nZXQgPSBZQU1MTWFwLnByb3RvdHlwZS5nZXQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5oYXMgPSBZQU1MTWFwLnByb3RvdHlwZS5oYXMuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zZXQgPSBZQU1MTWFwLnByb3RvdHlwZS5zZXQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy50YWcgPSBZQU1MT01hcC50YWc7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIElmIGBjdHhgIGlzIGdpdmVuLCB0aGUgcmV0dXJuIHR5cGUgaXMgYWN0dWFsbHkgYE1hcDx1bmtub3duLCB1bmtub3duPmAsXG4gICAgICogYnV0IFR5cGVTY3JpcHQgd29uJ3QgYWxsb3cgd2lkZW5pbmcgdGhlIHNpZ25hdHVyZSBvZiBhIGNoaWxkIG1ldGhvZC5cbiAgICAgKi9cbiAgICB0b0pTT04oXywgY3R4KSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnRvSlNPTihfKTtcbiAgICAgICAgY29uc3QgbWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBpZiAoY3R4Py5vbkNyZWF0ZSlcbiAgICAgICAgICAgIGN0eC5vbkNyZWF0ZShtYXApO1xuICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgdGhpcy5pdGVtcykge1xuICAgICAgICAgICAgbGV0IGtleSwgdmFsdWU7XG4gICAgICAgICAgICBpZiAoaXNQYWlyKHBhaXIpKSB7XG4gICAgICAgICAgICAgICAga2V5ID0gdG9KUyhwYWlyLmtleSwgJycsIGN0eCk7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0b0pTKHBhaXIudmFsdWUsIGtleSwgY3R4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleSA9IHRvSlMocGFpciwgJycsIGN0eCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobWFwLmhhcyhrZXkpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT3JkZXJlZCBtYXBzIG11c3Qgbm90IGluY2x1ZGUgZHVwbGljYXRlIGtleXMnKTtcbiAgICAgICAgICAgIG1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgc3RhdGljIGZyb20oc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSB7XG4gICAgICAgIGNvbnN0IHBhaXJzID0gY3JlYXRlUGFpcnMoc2NoZW1hLCBpdGVyYWJsZSwgY3R4KTtcbiAgICAgICAgY29uc3Qgb21hcCA9IG5ldyB0aGlzKCk7XG4gICAgICAgIG9tYXAuaXRlbXMgPSBwYWlycy5pdGVtcztcbiAgICAgICAgcmV0dXJuIG9tYXA7XG4gICAgfVxufVxuWUFNTE9NYXAudGFnID0gJ3RhZzp5YW1sLm9yZywyMDAyOm9tYXAnO1xuY29uc3Qgb21hcCA9IHtcbiAgICBjb2xsZWN0aW9uOiAnc2VxJyxcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgaW5zdGFuY2VvZiBNYXAsXG4gICAgbm9kZUNsYXNzOiBZQU1MT01hcCxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpvbWFwJyxcbiAgICByZXNvbHZlKHNlcSwgb25FcnJvcikge1xuICAgICAgICBjb25zdCBwYWlycyA9IHJlc29sdmVQYWlycyhzZXEsIG9uRXJyb3IpO1xuICAgICAgICBjb25zdCBzZWVuS2V5cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHsga2V5IH0gb2YgcGFpcnMuaXRlbXMpIHtcbiAgICAgICAgICAgIGlmIChpc1NjYWxhcihrZXkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlZW5LZXlzLmluY2x1ZGVzKGtleS52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihgT3JkZXJlZCBtYXBzIG11c3Qgbm90IGluY2x1ZGUgZHVwbGljYXRlIGtleXM6ICR7a2V5LnZhbHVlfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VlbktleXMucHVzaChrZXkudmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihuZXcgWUFNTE9NYXAoKSwgcGFpcnMpO1xuICAgIH0sXG4gICAgY3JlYXRlTm9kZTogKHNjaGVtYSwgaXRlcmFibGUsIGN0eCkgPT4gWUFNTE9NYXAuZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpXG59O1xuXG5leHBvcnQgeyBZQU1MT01hcCwgb21hcCB9O1xuIiwgImltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uLy4uL25vZGVzL1NjYWxhci5qcyc7XG5cbmZ1bmN0aW9uIGJvb2xTdHJpbmdpZnkoeyB2YWx1ZSwgc291cmNlIH0sIGN0eCkge1xuICAgIGNvbnN0IGJvb2xPYmogPSB2YWx1ZSA/IHRydWVUYWcgOiBmYWxzZVRhZztcbiAgICBpZiAoc291cmNlICYmIGJvb2xPYmoudGVzdC50ZXN0KHNvdXJjZSkpXG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgcmV0dXJuIHZhbHVlID8gY3R4Lm9wdGlvbnMudHJ1ZVN0ciA6IGN0eC5vcHRpb25zLmZhbHNlU3RyO1xufVxuY29uc3QgdHJ1ZVRhZyA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgPT09IHRydWUsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpib29sJyxcbiAgICB0ZXN0OiAvXig/Oll8eXxbWXldZXN8WUVTfFtUdF1ydWV8VFJVRXxbT29dbnxPTikkLyxcbiAgICByZXNvbHZlOiAoKSA9PiBuZXcgU2NhbGFyKHRydWUpLFxuICAgIHN0cmluZ2lmeTogYm9vbFN0cmluZ2lmeVxufTtcbmNvbnN0IGZhbHNlVGFnID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PT0gZmFsc2UsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpib29sJyxcbiAgICB0ZXN0OiAvXig/Ok58bnxbTm5db3xOT3xbRmZdYWxzZXxGQUxTRXxbT29dZmZ8T0ZGKSQvLFxuICAgIHJlc29sdmU6ICgpID0+IG5ldyBTY2FsYXIoZmFsc2UpLFxuICAgIHN0cmluZ2lmeTogYm9vbFN0cmluZ2lmeVxufTtcblxuZXhwb3J0IHsgZmFsc2VUYWcsIHRydWVUYWcgfTtcbiIsICJpbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5TnVtYmVyIH0gZnJvbSAnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcyc7XG5cbmNvbnN0IGZsb2F0TmFOID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIHRlc3Q6IC9eKD86Wy0rXT9cXC4oPzppbmZ8SW5mfElORil8XFwubmFufFxcLk5hTnxcXC5OQU4pJC8sXG4gICAgcmVzb2x2ZTogKHN0cikgPT4gc3RyLnNsaWNlKC0zKS50b0xvd2VyQ2FzZSgpID09PSAnbmFuJ1xuICAgICAgICA/IE5hTlxuICAgICAgICA6IHN0clswXSA9PT0gJy0nXG4gICAgICAgICAgICA/IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxuICAgICAgICAgICAgOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXJcbn07XG5jb25zdCBmbG9hdEV4cCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICBmb3JtYXQ6ICdFWFAnLFxuICAgIHRlc3Q6IC9eWy0rXT8oPzpbMC05XVswLTlfXSopPyg/OlxcLlswLTlfXSopP1tlRV1bLStdP1swLTldKyQvLFxuICAgIHJlc29sdmU6IChzdHIpID0+IHBhcnNlRmxvYXQoc3RyLnJlcGxhY2UoL18vZywgJycpKSxcbiAgICBzdHJpbmdpZnkobm9kZSkge1xuICAgICAgICBjb25zdCBudW0gPSBOdW1iZXIobm9kZS52YWx1ZSk7XG4gICAgICAgIHJldHVybiBpc0Zpbml0ZShudW0pID8gbnVtLnRvRXhwb25lbnRpYWwoKSA6IHN0cmluZ2lmeU51bWJlcihub2RlKTtcbiAgICB9XG59O1xuY29uc3QgZmxvYXQgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgdGVzdDogL15bLStdPyg/OlswLTldWzAtOV9dKik/XFwuWzAtOV9dKiQvLFxuICAgIHJlc29sdmUoc3RyKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgU2NhbGFyKHBhcnNlRmxvYXQoc3RyLnJlcGxhY2UoL18vZywgJycpKSk7XG4gICAgICAgIGNvbnN0IGRvdCA9IHN0ci5pbmRleE9mKCcuJyk7XG4gICAgICAgIGlmIChkb3QgIT09IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBmID0gc3RyLnN1YnN0cmluZyhkb3QgKyAxKS5yZXBsYWNlKC9fL2csICcnKTtcbiAgICAgICAgICAgIGlmIChmW2YubGVuZ3RoIC0gMV0gPT09ICcwJylcbiAgICAgICAgICAgICAgICBub2RlLm1pbkZyYWN0aW9uRGlnaXRzID0gZi5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlclxufTtcblxuZXhwb3J0IHsgZmxvYXQsIGZsb2F0RXhwLCBmbG9hdE5hTiB9O1xuIiwgImltcG9ydCB7IHN0cmluZ2lmeU51bWJlciB9IGZyb20gJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnO1xuXG5jb25zdCBpbnRJZGVudGlmeSA9ICh2YWx1ZSkgPT4gdHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyB8fCBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKTtcbmZ1bmN0aW9uIGludFJlc29sdmUoc3RyLCBvZmZzZXQsIHJhZGl4LCB7IGludEFzQmlnSW50IH0pIHtcbiAgICBjb25zdCBzaWduID0gc3RyWzBdO1xuICAgIGlmIChzaWduID09PSAnLScgfHwgc2lnbiA9PT0gJysnKVxuICAgICAgICBvZmZzZXQgKz0gMTtcbiAgICBzdHIgPSBzdHIuc3Vic3RyaW5nKG9mZnNldCkucmVwbGFjZSgvXy9nLCAnJyk7XG4gICAgaWYgKGludEFzQmlnSW50KSB7XG4gICAgICAgIHN3aXRjaCAocmFkaXgpIHtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBzdHIgPSBgMGIke3N0cn1gO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICAgIHN0ciA9IGAwbyR7c3RyfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgICAgIHN0ciA9IGAweCR7c3RyfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbiA9IEJpZ0ludChzdHIpO1xuICAgICAgICByZXR1cm4gc2lnbiA9PT0gJy0nID8gQmlnSW50KC0xKSAqIG4gOiBuO1xuICAgIH1cbiAgICBjb25zdCBuID0gcGFyc2VJbnQoc3RyLCByYWRpeCk7XG4gICAgcmV0dXJuIHNpZ24gPT09ICctJyA/IC0xICogbiA6IG47XG59XG5mdW5jdGlvbiBpbnRTdHJpbmdpZnkobm9kZSwgcmFkaXgsIHByZWZpeCkge1xuICAgIGNvbnN0IHsgdmFsdWUgfSA9IG5vZGU7XG4gICAgaWYgKGludElkZW50aWZ5KHZhbHVlKSkge1xuICAgICAgICBjb25zdCBzdHIgPSB2YWx1ZS50b1N0cmluZyhyYWRpeCk7XG4gICAgICAgIHJldHVybiB2YWx1ZSA8IDAgPyAnLScgKyBwcmVmaXggKyBzdHIuc3Vic3RyKDEpIDogcHJlZml4ICsgc3RyO1xuICAgIH1cbiAgICByZXR1cm4gc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xufVxuY29uc3QgaW50QmluID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnQklOJyxcbiAgICB0ZXN0OiAvXlstK10/MGJbMC0xX10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDIsIDIsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCAyLCAnMGInKVxufTtcbmNvbnN0IGludE9jdCA9IHtcbiAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIGZvcm1hdDogJ09DVCcsXG4gICAgdGVzdDogL15bLStdPzBbMC03X10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDEsIDgsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCA4LCAnMCcpXG59O1xuY29uc3QgaW50ID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgdGVzdDogL15bLStdP1swLTldWzAtOV9dKiQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAwLCAxMCwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlclxufTtcbmNvbnN0IGludEhleCA9IHtcbiAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIGZvcm1hdDogJ0hFWCcsXG4gICAgdGVzdDogL15bLStdPzB4WzAtOWEtZkEtRl9dKyQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAyLCAxNiwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDE2LCAnMHgnKVxufTtcblxuZXhwb3J0IHsgaW50LCBpbnRCaW4sIGludEhleCwgaW50T2N0IH07XG4iLCAiaW1wb3J0IHsgaXNNYXAsIGlzUGFpciwgaXNTY2FsYXIgfSBmcm9tICcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBQYWlyLCBjcmVhdGVQYWlyIH0gZnJvbSAnLi4vLi4vbm9kZXMvUGFpci5qcyc7XG5pbXBvcnQgeyBZQU1MTWFwLCBmaW5kUGFpciB9IGZyb20gJy4uLy4uL25vZGVzL1lBTUxNYXAuanMnO1xuXG5jbGFzcyBZQU1MU2V0IGV4dGVuZHMgWUFNTE1hcCB7XG4gICAgY29uc3RydWN0b3Ioc2NoZW1hKSB7XG4gICAgICAgIHN1cGVyKHNjaGVtYSk7XG4gICAgICAgIHRoaXMudGFnID0gWUFNTFNldC50YWc7XG4gICAgfVxuICAgIGFkZChrZXkpIHtcbiAgICAgICAgbGV0IHBhaXI7XG4gICAgICAgIGlmIChpc1BhaXIoa2V5KSlcbiAgICAgICAgICAgIHBhaXIgPSBrZXk7XG4gICAgICAgIGVsc2UgaWYgKGtleSAmJlxuICAgICAgICAgICAgdHlwZW9mIGtleSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgICdrZXknIGluIGtleSAmJlxuICAgICAgICAgICAgJ3ZhbHVlJyBpbiBrZXkgJiZcbiAgICAgICAgICAgIGtleS52YWx1ZSA9PT0gbnVsbClcbiAgICAgICAgICAgIHBhaXIgPSBuZXcgUGFpcihrZXkua2V5LCBudWxsKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcGFpciA9IG5ldyBQYWlyKGtleSwgbnVsbCk7XG4gICAgICAgIGNvbnN0IHByZXYgPSBmaW5kUGFpcih0aGlzLml0ZW1zLCBwYWlyLmtleSk7XG4gICAgICAgIGlmICghcHJldilcbiAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChwYWlyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSWYgYGtlZXBQYWlyYCBpcyBgdHJ1ZWAsIHJldHVybnMgdGhlIFBhaXIgbWF0Y2hpbmcgYGtleWAuXG4gICAgICogT3RoZXJ3aXNlLCByZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGF0IFBhaXIncyBrZXkuXG4gICAgICovXG4gICAgZ2V0KGtleSwga2VlcFBhaXIpIHtcbiAgICAgICAgY29uc3QgcGFpciA9IGZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgICAgIHJldHVybiAha2VlcFBhaXIgJiYgaXNQYWlyKHBhaXIpXG4gICAgICAgICAgICA/IGlzU2NhbGFyKHBhaXIua2V5KVxuICAgICAgICAgICAgICAgID8gcGFpci5rZXkudmFsdWVcbiAgICAgICAgICAgICAgICA6IHBhaXIua2V5XG4gICAgICAgICAgICA6IHBhaXI7XG4gICAgfVxuICAgIHNldChrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdib29sZWFuJylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYm9vbGVhbiB2YWx1ZSBmb3Igc2V0KGtleSwgdmFsdWUpIGluIGEgWUFNTCBzZXQsIG5vdCAke3R5cGVvZiB2YWx1ZX1gKTtcbiAgICAgICAgY29uc3QgcHJldiA9IGZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgICAgIGlmIChwcmV2ICYmICF2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5pdGVtcy5zcGxpY2UodGhpcy5pdGVtcy5pbmRleE9mKHByZXYpLCAxKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghcHJldiAmJiB2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKG5ldyBQYWlyKGtleSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRvSlNPTihfLCBjdHgpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLnRvSlNPTihfLCBjdHgsIFNldCk7XG4gICAgfVxuICAgIHRvU3RyaW5nKGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICBpZiAoIWN0eClcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzKTtcbiAgICAgICAgaWYgKHRoaXMuaGFzQWxsTnVsbFZhbHVlcyh0cnVlKSlcbiAgICAgICAgICAgIHJldHVybiBzdXBlci50b1N0cmluZyhPYmplY3QuYXNzaWduKHt9LCBjdHgsIHsgYWxsTnVsbFZhbHVlczogdHJ1ZSB9KSwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2V0IGl0ZW1zIG11c3QgYWxsIGhhdmUgbnVsbCB2YWx1ZXMnKTtcbiAgICB9XG4gICAgc3RhdGljIGZyb20oc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSB7XG4gICAgICAgIGNvbnN0IHsgcmVwbGFjZXIgfSA9IGN0eDtcbiAgICAgICAgY29uc3Qgc2V0ID0gbmV3IHRoaXMoc2NoZW1hKTtcbiAgICAgICAgaWYgKGl0ZXJhYmxlICYmIFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoaXRlcmFibGUpKVxuICAgICAgICAgICAgZm9yIChsZXQgdmFsdWUgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlcGxhY2VyLmNhbGwoaXRlcmFibGUsIHZhbHVlLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgc2V0Lml0ZW1zLnB1c2goY3JlYXRlUGFpcih2YWx1ZSwgbnVsbCwgY3R4KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXQ7XG4gICAgfVxufVxuWUFNTFNldC50YWcgPSAndGFnOnlhbWwub3JnLDIwMDI6c2V0JztcbmNvbnN0IHNldCA9IHtcbiAgICBjb2xsZWN0aW9uOiAnbWFwJyxcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgaW5zdGFuY2VvZiBTZXQsXG4gICAgbm9kZUNsYXNzOiBZQU1MU2V0LFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOnNldCcsXG4gICAgY3JlYXRlTm9kZTogKHNjaGVtYSwgaXRlcmFibGUsIGN0eCkgPT4gWUFNTFNldC5mcm9tKHNjaGVtYSwgaXRlcmFibGUsIGN0eCksXG4gICAgcmVzb2x2ZShtYXAsIG9uRXJyb3IpIHtcbiAgICAgICAgaWYgKGlzTWFwKG1hcCkpIHtcbiAgICAgICAgICAgIGlmIChtYXAuaGFzQWxsTnVsbFZhbHVlcyh0cnVlKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihuZXcgWUFNTFNldCgpLCBtYXApO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9uRXJyb3IoJ1NldCBpdGVtcyBtdXN0IGFsbCBoYXZlIG51bGwgdmFsdWVzJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb25FcnJvcignRXhwZWN0ZWQgYSBtYXBwaW5nIGZvciB0aGlzIHRhZycpO1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbn07XG5cbmV4cG9ydCB7IFlBTUxTZXQsIHNldCB9O1xuIiwgImltcG9ydCB7IHN0cmluZ2lmeU51bWJlciB9IGZyb20gJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnO1xuXG4vKiogSW50ZXJuYWwgdHlwZXMgaGFuZGxlIGJpZ2ludCBhcyBudW1iZXIsIGJlY2F1c2UgVFMgY2FuJ3QgZmlndXJlIGl0IG91dC4gKi9cbmZ1bmN0aW9uIHBhcnNlU2V4YWdlc2ltYWwoc3RyLCBhc0JpZ0ludCkge1xuICAgIGNvbnN0IHNpZ24gPSBzdHJbMF07XG4gICAgY29uc3QgcGFydHMgPSBzaWduID09PSAnLScgfHwgc2lnbiA9PT0gJysnID8gc3RyLnN1YnN0cmluZygxKSA6IHN0cjtcbiAgICBjb25zdCBudW0gPSAobikgPT4gYXNCaWdJbnQgPyBCaWdJbnQobikgOiBOdW1iZXIobik7XG4gICAgY29uc3QgcmVzID0gcGFydHNcbiAgICAgICAgLnJlcGxhY2UoL18vZywgJycpXG4gICAgICAgIC5zcGxpdCgnOicpXG4gICAgICAgIC5yZWR1Y2UoKHJlcywgcCkgPT4gcmVzICogbnVtKDYwKSArIG51bShwKSwgbnVtKDApKTtcbiAgICByZXR1cm4gKHNpZ24gPT09ICctJyA/IG51bSgtMSkgKiByZXMgOiByZXMpO1xufVxuLyoqXG4gKiBoaGhoOm1tOnNzLnNzc1xuICpcbiAqIEludGVybmFsIHR5cGVzIGhhbmRsZSBiaWdpbnQgYXMgbnVtYmVyLCBiZWNhdXNlIFRTIGNhbid0IGZpZ3VyZSBpdCBvdXQuXG4gKi9cbmZ1bmN0aW9uIHN0cmluZ2lmeVNleGFnZXNpbWFsKG5vZGUpIHtcbiAgICBsZXQgeyB2YWx1ZSB9ID0gbm9kZTtcbiAgICBsZXQgbnVtID0gKG4pID0+IG47XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcpXG4gICAgICAgIG51bSA9IG4gPT4gQmlnSW50KG4pO1xuICAgIGVsc2UgaWYgKGlzTmFOKHZhbHVlKSB8fCAhaXNGaW5pdGUodmFsdWUpKVxuICAgICAgICByZXR1cm4gc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xuICAgIGxldCBzaWduID0gJyc7XG4gICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICBzaWduID0gJy0nO1xuICAgICAgICB2YWx1ZSAqPSBudW0oLTEpO1xuICAgIH1cbiAgICBjb25zdCBfNjAgPSBudW0oNjApO1xuICAgIGNvbnN0IHBhcnRzID0gW3ZhbHVlICUgXzYwXTsgLy8gc2Vjb25kcywgaW5jbHVkaW5nIG1zXG4gICAgaWYgKHZhbHVlIDwgNjApIHtcbiAgICAgICAgcGFydHMudW5zaGlmdCgwKTsgLy8gYXQgbGVhc3Qgb25lIDogaXMgcmVxdWlyZWRcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhbHVlID0gKHZhbHVlIC0gcGFydHNbMF0pIC8gXzYwO1xuICAgICAgICBwYXJ0cy51bnNoaWZ0KHZhbHVlICUgXzYwKTsgLy8gbWludXRlc1xuICAgICAgICBpZiAodmFsdWUgPj0gNjApIHtcbiAgICAgICAgICAgIHZhbHVlID0gKHZhbHVlIC0gcGFydHNbMF0pIC8gXzYwO1xuICAgICAgICAgICAgcGFydHMudW5zaGlmdCh2YWx1ZSk7IC8vIGhvdXJzXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIChzaWduICtcbiAgICAgICAgcGFydHNcbiAgICAgICAgICAgIC5tYXAobiA9PiBTdHJpbmcobikucGFkU3RhcnQoMiwgJzAnKSlcbiAgICAgICAgICAgIC5qb2luKCc6JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8wMDAwMDBcXGQqJC8sICcnKSAvLyAlIDYwIG1heSBpbnRyb2R1Y2UgZXJyb3JcbiAgICApO1xufVxuY29uc3QgaW50VGltZSA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyB8fCBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnVElNRScsXG4gICAgdGVzdDogL15bLStdP1swLTldWzAtOV9dKig/OjpbMC01XT9bMC05XSkrJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIHsgaW50QXNCaWdJbnQgfSkgPT4gcGFyc2VTZXhhZ2VzaW1hbChzdHIsIGludEFzQmlnSW50KSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeVNleGFnZXNpbWFsXG59O1xuY29uc3QgZmxvYXRUaW1lID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIGZvcm1hdDogJ1RJTUUnLFxuICAgIHRlc3Q6IC9eWy0rXT9bMC05XVswLTlfXSooPzo6WzAtNV0/WzAtOV0pK1xcLlswLTlfXSokLyxcbiAgICByZXNvbHZlOiBzdHIgPT4gcGFyc2VTZXhhZ2VzaW1hbChzdHIsIGZhbHNlKSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeVNleGFnZXNpbWFsXG59O1xuY29uc3QgdGltZXN0YW1wID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIERhdGUsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjp0aW1lc3RhbXAnLFxuICAgIC8vIElmIHRoZSB0aW1lIHpvbmUgaXMgb21pdHRlZCwgdGhlIHRpbWVzdGFtcCBpcyBhc3N1bWVkIHRvIGJlIHNwZWNpZmllZCBpbiBVVEMuIFRoZSB0aW1lIHBhcnRcbiAgICAvLyBtYXkgYmUgb21pdHRlZCBhbHRvZ2V0aGVyLCByZXN1bHRpbmcgaW4gYSBkYXRlIGZvcm1hdC4gSW4gc3VjaCBhIGNhc2UsIHRoZSB0aW1lIHBhcnQgaXNcbiAgICAvLyBhc3N1bWVkIHRvIGJlIDAwOjAwOjAwWiAoc3RhcnQgb2YgZGF5LCBVVEMpLlxuICAgIHRlc3Q6IFJlZ0V4cCgnXihbMC05XXs0fSktKFswLTldezEsMn0pLShbMC05XXsxLDJ9KScgKyAvLyBZWVlZLU1tLURkXG4gICAgICAgICcoPzonICsgLy8gdGltZSBpcyBvcHRpb25hbFxuICAgICAgICAnKD86dHxUfFsgXFxcXHRdKyknICsgLy8gdCB8IFQgfCB3aGl0ZXNwYWNlXG4gICAgICAgICcoWzAtOV17MSwyfSk6KFswLTldezEsMn0pOihbMC05XXsxLDJ9KFxcXFwuWzAtOV0rKT8pJyArIC8vIEhoOk1tOlNzKC5zcyk/XG4gICAgICAgICcoPzpbIFxcXFx0XSooWnxbLStdWzAxMl0/WzAtOV0oPzo6WzAtOV17Mn0pPykpPycgKyAvLyBaIHwgKzUgfCAtMDM6MzBcbiAgICAgICAgJyk/JCcpLFxuICAgIHJlc29sdmUoc3RyKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gc3RyLm1hdGNoKHRpbWVzdGFtcC50ZXN0KTtcbiAgICAgICAgaWYgKCFtYXRjaClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignISF0aW1lc3RhbXAgZXhwZWN0cyBhIGRhdGUsIHN0YXJ0aW5nIHdpdGggeXl5eS1tbS1kZCcpO1xuICAgICAgICBjb25zdCBbLCB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZF0gPSBtYXRjaC5tYXAoTnVtYmVyKTtcbiAgICAgICAgY29uc3QgbWlsbGlzZWMgPSBtYXRjaFs3XSA/IE51bWJlcigobWF0Y2hbN10gKyAnMDAnKS5zdWJzdHIoMSwgMykpIDogMDtcbiAgICAgICAgbGV0IGRhdGUgPSBEYXRlLlVUQyh5ZWFyLCBtb250aCAtIDEsIGRheSwgaG91ciB8fCAwLCBtaW51dGUgfHwgMCwgc2Vjb25kIHx8IDAsIG1pbGxpc2VjKTtcbiAgICAgICAgY29uc3QgdHogPSBtYXRjaFs4XTtcbiAgICAgICAgaWYgKHR6ICYmIHR6ICE9PSAnWicpIHtcbiAgICAgICAgICAgIGxldCBkID0gcGFyc2VTZXhhZ2VzaW1hbCh0eiwgZmFsc2UpO1xuICAgICAgICAgICAgaWYgKE1hdGguYWJzKGQpIDwgMzApXG4gICAgICAgICAgICAgICAgZCAqPSA2MDtcbiAgICAgICAgICAgIGRhdGUgLT0gNjAwMDAgKiBkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlKTtcbiAgICB9LFxuICAgIHN0cmluZ2lmeTogKHsgdmFsdWUgfSkgPT4gdmFsdWU/LnRvSVNPU3RyaW5nKCkucmVwbGFjZSgvKFQwMDowMDowMCk/XFwuMDAwWiQvLCAnJykgPz8gJydcbn07XG5cbmV4cG9ydCB7IGZsb2F0VGltZSwgaW50VGltZSwgdGltZXN0YW1wIH07XG4iLCAiaW1wb3J0IHsgbWFwIH0gZnJvbSAnLi4vY29tbW9uL21hcC5qcyc7XG5pbXBvcnQgeyBudWxsVGFnIH0gZnJvbSAnLi4vY29tbW9uL251bGwuanMnO1xuaW1wb3J0IHsgc2VxIH0gZnJvbSAnLi4vY29tbW9uL3NlcS5qcyc7XG5pbXBvcnQgeyBzdHJpbmcgfSBmcm9tICcuLi9jb21tb24vc3RyaW5nLmpzJztcbmltcG9ydCB7IGJpbmFyeSB9IGZyb20gJy4vYmluYXJ5LmpzJztcbmltcG9ydCB7IHRydWVUYWcsIGZhbHNlVGFnIH0gZnJvbSAnLi9ib29sLmpzJztcbmltcG9ydCB7IGZsb2F0TmFOLCBmbG9hdEV4cCwgZmxvYXQgfSBmcm9tICcuL2Zsb2F0LmpzJztcbmltcG9ydCB7IGludEJpbiwgaW50T2N0LCBpbnQsIGludEhleCB9IGZyb20gJy4vaW50LmpzJztcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSAnLi9tZXJnZS5qcyc7XG5pbXBvcnQgeyBvbWFwIH0gZnJvbSAnLi9vbWFwLmpzJztcbmltcG9ydCB7IHBhaXJzIH0gZnJvbSAnLi9wYWlycy5qcyc7XG5pbXBvcnQgeyBzZXQgfSBmcm9tICcuL3NldC5qcyc7XG5pbXBvcnQgeyBpbnRUaW1lLCBmbG9hdFRpbWUsIHRpbWVzdGFtcCB9IGZyb20gJy4vdGltZXN0YW1wLmpzJztcblxuY29uc3Qgc2NoZW1hID0gW1xuICAgIG1hcCxcbiAgICBzZXEsXG4gICAgc3RyaW5nLFxuICAgIG51bGxUYWcsXG4gICAgdHJ1ZVRhZyxcbiAgICBmYWxzZVRhZyxcbiAgICBpbnRCaW4sXG4gICAgaW50T2N0LFxuICAgIGludCxcbiAgICBpbnRIZXgsXG4gICAgZmxvYXROYU4sXG4gICAgZmxvYXRFeHAsXG4gICAgZmxvYXQsXG4gICAgYmluYXJ5LFxuICAgIG1lcmdlLFxuICAgIG9tYXAsXG4gICAgcGFpcnMsXG4gICAgc2V0LFxuICAgIGludFRpbWUsXG4gICAgZmxvYXRUaW1lLFxuICAgIHRpbWVzdGFtcFxuXTtcblxuZXhwb3J0IHsgc2NoZW1hIH07XG4iLCAiaW1wb3J0IHsgbWFwIH0gZnJvbSAnLi9jb21tb24vbWFwLmpzJztcbmltcG9ydCB7IG51bGxUYWcgfSBmcm9tICcuL2NvbW1vbi9udWxsLmpzJztcbmltcG9ydCB7IHNlcSB9IGZyb20gJy4vY29tbW9uL3NlcS5qcyc7XG5pbXBvcnQgeyBzdHJpbmcgfSBmcm9tICcuL2NvbW1vbi9zdHJpbmcuanMnO1xuaW1wb3J0IHsgYm9vbFRhZyB9IGZyb20gJy4vY29yZS9ib29sLmpzJztcbmltcG9ydCB7IGZsb2F0TmFOLCBmbG9hdEV4cCwgZmxvYXQgfSBmcm9tICcuL2NvcmUvZmxvYXQuanMnO1xuaW1wb3J0IHsgaW50T2N0LCBpbnRIZXgsIGludCB9IGZyb20gJy4vY29yZS9pbnQuanMnO1xuaW1wb3J0IHsgc2NoZW1hIH0gZnJvbSAnLi9jb3JlL3NjaGVtYS5qcyc7XG5pbXBvcnQgeyBzY2hlbWEgYXMgc2NoZW1hJDEgfSBmcm9tICcuL2pzb24vc2NoZW1hLmpzJztcbmltcG9ydCB7IGJpbmFyeSB9IGZyb20gJy4veWFtbC0xLjEvYmluYXJ5LmpzJztcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSAnLi95YW1sLTEuMS9tZXJnZS5qcyc7XG5pbXBvcnQgeyBvbWFwIH0gZnJvbSAnLi95YW1sLTEuMS9vbWFwLmpzJztcbmltcG9ydCB7IHBhaXJzIH0gZnJvbSAnLi95YW1sLTEuMS9wYWlycy5qcyc7XG5pbXBvcnQgeyBzY2hlbWEgYXMgc2NoZW1hJDIgfSBmcm9tICcuL3lhbWwtMS4xL3NjaGVtYS5qcyc7XG5pbXBvcnQgeyBzZXQgfSBmcm9tICcuL3lhbWwtMS4xL3NldC5qcyc7XG5pbXBvcnQgeyB0aW1lc3RhbXAsIGludFRpbWUsIGZsb2F0VGltZSB9IGZyb20gJy4veWFtbC0xLjEvdGltZXN0YW1wLmpzJztcblxuY29uc3Qgc2NoZW1hcyA9IG5ldyBNYXAoW1xuICAgIFsnY29yZScsIHNjaGVtYV0sXG4gICAgWydmYWlsc2FmZScsIFttYXAsIHNlcSwgc3RyaW5nXV0sXG4gICAgWydqc29uJywgc2NoZW1hJDFdLFxuICAgIFsneWFtbDExJywgc2NoZW1hJDJdLFxuICAgIFsneWFtbC0xLjEnLCBzY2hlbWEkMl1cbl0pO1xuY29uc3QgdGFnc0J5TmFtZSA9IHtcbiAgICBiaW5hcnksXG4gICAgYm9vbDogYm9vbFRhZyxcbiAgICBmbG9hdCxcbiAgICBmbG9hdEV4cCxcbiAgICBmbG9hdE5hTixcbiAgICBmbG9hdFRpbWUsXG4gICAgaW50LFxuICAgIGludEhleCxcbiAgICBpbnRPY3QsXG4gICAgaW50VGltZSxcbiAgICBtYXAsXG4gICAgbWVyZ2UsXG4gICAgbnVsbDogbnVsbFRhZyxcbiAgICBvbWFwLFxuICAgIHBhaXJzLFxuICAgIHNlcSxcbiAgICBzZXQsXG4gICAgdGltZXN0YW1wXG59O1xuY29uc3QgY29yZUtub3duVGFncyA9IHtcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6YmluYXJ5JzogYmluYXJ5LFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjptZXJnZSc6IG1lcmdlLFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjpvbWFwJzogb21hcCxcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6cGFpcnMnOiBwYWlycyxcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6c2V0Jzogc2V0LFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjp0aW1lc3RhbXAnOiB0aW1lc3RhbXBcbn07XG5mdW5jdGlvbiBnZXRUYWdzKGN1c3RvbVRhZ3MsIHNjaGVtYU5hbWUsIGFkZE1lcmdlVGFnKSB7XG4gICAgY29uc3Qgc2NoZW1hVGFncyA9IHNjaGVtYXMuZ2V0KHNjaGVtYU5hbWUpO1xuICAgIGlmIChzY2hlbWFUYWdzICYmICFjdXN0b21UYWdzKSB7XG4gICAgICAgIHJldHVybiBhZGRNZXJnZVRhZyAmJiAhc2NoZW1hVGFncy5pbmNsdWRlcyhtZXJnZSlcbiAgICAgICAgICAgID8gc2NoZW1hVGFncy5jb25jYXQobWVyZ2UpXG4gICAgICAgICAgICA6IHNjaGVtYVRhZ3Muc2xpY2UoKTtcbiAgICB9XG4gICAgbGV0IHRhZ3MgPSBzY2hlbWFUYWdzO1xuICAgIGlmICghdGFncykge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjdXN0b21UYWdzKSlcbiAgICAgICAgICAgIHRhZ3MgPSBbXTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBrZXlzID0gQXJyYXkuZnJvbShzY2hlbWFzLmtleXMoKSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKGtleSA9PiBrZXkgIT09ICd5YW1sMTEnKVxuICAgICAgICAgICAgICAgIC5tYXAoa2V5ID0+IEpTT04uc3RyaW5naWZ5KGtleSkpXG4gICAgICAgICAgICAgICAgLmpvaW4oJywgJyk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gc2NoZW1hIFwiJHtzY2hlbWFOYW1lfVwiOyB1c2Ugb25lIG9mICR7a2V5c30gb3IgZGVmaW5lIGN1c3RvbVRhZ3MgYXJyYXlgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShjdXN0b21UYWdzKSkge1xuICAgICAgICBmb3IgKGNvbnN0IHRhZyBvZiBjdXN0b21UYWdzKVxuICAgICAgICAgICAgdGFncyA9IHRhZ3MuY29uY2F0KHRhZyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBjdXN0b21UYWdzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRhZ3MgPSBjdXN0b21UYWdzKHRhZ3Muc2xpY2UoKSk7XG4gICAgfVxuICAgIGlmIChhZGRNZXJnZVRhZylcbiAgICAgICAgdGFncyA9IHRhZ3MuY29uY2F0KG1lcmdlKTtcbiAgICByZXR1cm4gdGFncy5yZWR1Y2UoKHRhZ3MsIHRhZykgPT4ge1xuICAgICAgICBjb25zdCB0YWdPYmogPSB0eXBlb2YgdGFnID09PSAnc3RyaW5nJyA/IHRhZ3NCeU5hbWVbdGFnXSA6IHRhZztcbiAgICAgICAgaWYgKCF0YWdPYmopIHtcbiAgICAgICAgICAgIGNvbnN0IHRhZ05hbWUgPSBKU09OLnN0cmluZ2lmeSh0YWcpO1xuICAgICAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRhZ3NCeU5hbWUpXG4gICAgICAgICAgICAgICAgLm1hcChrZXkgPT4gSlNPTi5zdHJpbmdpZnkoa2V5KSlcbiAgICAgICAgICAgICAgICAuam9pbignLCAnKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBjdXN0b20gdGFnICR7dGFnTmFtZX07IHVzZSBvbmUgb2YgJHtrZXlzfWApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGFncy5pbmNsdWRlcyh0YWdPYmopKVxuICAgICAgICAgICAgdGFncy5wdXNoKHRhZ09iaik7XG4gICAgICAgIHJldHVybiB0YWdzO1xuICAgIH0sIFtdKTtcbn1cblxuZXhwb3J0IHsgY29yZUtub3duVGFncywgZ2V0VGFncyB9O1xuIiwgImltcG9ydCB7IE1BUCwgU0NBTEFSLCBTRVEgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBtYXAgfSBmcm9tICcuL2NvbW1vbi9tYXAuanMnO1xuaW1wb3J0IHsgc2VxIH0gZnJvbSAnLi9jb21tb24vc2VxLmpzJztcbmltcG9ydCB7IHN0cmluZyB9IGZyb20gJy4vY29tbW9uL3N0cmluZy5qcyc7XG5pbXBvcnQgeyBnZXRUYWdzLCBjb3JlS25vd25UYWdzIH0gZnJvbSAnLi90YWdzLmpzJztcblxuY29uc3Qgc29ydE1hcEVudHJpZXNCeUtleSA9IChhLCBiKSA9PiBhLmtleSA8IGIua2V5ID8gLTEgOiBhLmtleSA+IGIua2V5ID8gMSA6IDA7XG5jbGFzcyBTY2hlbWEge1xuICAgIGNvbnN0cnVjdG9yKHsgY29tcGF0LCBjdXN0b21UYWdzLCBtZXJnZSwgcmVzb2x2ZUtub3duVGFncywgc2NoZW1hLCBzb3J0TWFwRW50cmllcywgdG9TdHJpbmdEZWZhdWx0cyB9KSB7XG4gICAgICAgIHRoaXMuY29tcGF0ID0gQXJyYXkuaXNBcnJheShjb21wYXQpXG4gICAgICAgICAgICA/IGdldFRhZ3MoY29tcGF0LCAnY29tcGF0JylcbiAgICAgICAgICAgIDogY29tcGF0XG4gICAgICAgICAgICAgICAgPyBnZXRUYWdzKG51bGwsIGNvbXBhdClcbiAgICAgICAgICAgICAgICA6IG51bGw7XG4gICAgICAgIHRoaXMubmFtZSA9ICh0eXBlb2Ygc2NoZW1hID09PSAnc3RyaW5nJyAmJiBzY2hlbWEpIHx8ICdjb3JlJztcbiAgICAgICAgdGhpcy5rbm93blRhZ3MgPSByZXNvbHZlS25vd25UYWdzID8gY29yZUtub3duVGFncyA6IHt9O1xuICAgICAgICB0aGlzLnRhZ3MgPSBnZXRUYWdzKGN1c3RvbVRhZ3MsIHRoaXMubmFtZSwgbWVyZ2UpO1xuICAgICAgICB0aGlzLnRvU3RyaW5nT3B0aW9ucyA9IHRvU3RyaW5nRGVmYXVsdHMgPz8gbnVsbDtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIE1BUCwgeyB2YWx1ZTogbWFwIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgU0NBTEFSLCB7IHZhbHVlOiBzdHJpbmcgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBTRVEsIHsgdmFsdWU6IHNlcSB9KTtcbiAgICAgICAgLy8gVXNlZCBieSBjcmVhdGVNYXAoKVxuICAgICAgICB0aGlzLnNvcnRNYXBFbnRyaWVzID1cbiAgICAgICAgICAgIHR5cGVvZiBzb3J0TWFwRW50cmllcyA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgID8gc29ydE1hcEVudHJpZXNcbiAgICAgICAgICAgICAgICA6IHNvcnRNYXBFbnRyaWVzID09PSB0cnVlXG4gICAgICAgICAgICAgICAgICAgID8gc29ydE1hcEVudHJpZXNCeUtleVxuICAgICAgICAgICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjb3B5ID0gT2JqZWN0LmNyZWF0ZShTY2hlbWEucHJvdG90eXBlLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0aGlzKSk7XG4gICAgICAgIGNvcHkudGFncyA9IHRoaXMudGFncy5zbGljZSgpO1xuICAgICAgICByZXR1cm4gY29weTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFNjaGVtYSB9O1xuIiwgImltcG9ydCB7IGlzTm9kZSB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IGNyZWF0ZVN0cmluZ2lmeUNvbnRleHQsIHN0cmluZ2lmeSB9IGZyb20gJy4vc3RyaW5naWZ5LmpzJztcbmltcG9ydCB7IGluZGVudENvbW1lbnQsIGxpbmVDb21tZW50IH0gZnJvbSAnLi9zdHJpbmdpZnlDb21tZW50LmpzJztcblxuZnVuY3Rpb24gc3RyaW5naWZ5RG9jdW1lbnQoZG9jLCBvcHRpb25zKSB7XG4gICAgY29uc3QgbGluZXMgPSBbXTtcbiAgICBsZXQgaGFzRGlyZWN0aXZlcyA9IG9wdGlvbnMuZGlyZWN0aXZlcyA9PT0gdHJ1ZTtcbiAgICBpZiAob3B0aW9ucy5kaXJlY3RpdmVzICE9PSBmYWxzZSAmJiBkb2MuZGlyZWN0aXZlcykge1xuICAgICAgICBjb25zdCBkaXIgPSBkb2MuZGlyZWN0aXZlcy50b1N0cmluZyhkb2MpO1xuICAgICAgICBpZiAoZGlyKSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGRpcik7XG4gICAgICAgICAgICBoYXNEaXJlY3RpdmVzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkb2MuZGlyZWN0aXZlcy5kb2NTdGFydClcbiAgICAgICAgICAgIGhhc0RpcmVjdGl2ZXMgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoaGFzRGlyZWN0aXZlcylcbiAgICAgICAgbGluZXMucHVzaCgnLS0tJyk7XG4gICAgY29uc3QgY3R4ID0gY3JlYXRlU3RyaW5naWZ5Q29udGV4dChkb2MsIG9wdGlvbnMpO1xuICAgIGNvbnN0IHsgY29tbWVudFN0cmluZyB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgaWYgKGRvYy5jb21tZW50QmVmb3JlKSB7XG4gICAgICAgIGlmIChsaW5lcy5sZW5ndGggIT09IDEpXG4gICAgICAgICAgICBsaW5lcy51bnNoaWZ0KCcnKTtcbiAgICAgICAgY29uc3QgY3MgPSBjb21tZW50U3RyaW5nKGRvYy5jb21tZW50QmVmb3JlKTtcbiAgICAgICAgbGluZXMudW5zaGlmdChpbmRlbnRDb21tZW50KGNzLCAnJykpO1xuICAgIH1cbiAgICBsZXQgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgbGV0IGNvbnRlbnRDb21tZW50ID0gbnVsbDtcbiAgICBpZiAoZG9jLmNvbnRlbnRzKSB7XG4gICAgICAgIGlmIChpc05vZGUoZG9jLmNvbnRlbnRzKSkge1xuICAgICAgICAgICAgaWYgKGRvYy5jb250ZW50cy5zcGFjZUJlZm9yZSAmJiBoYXNEaXJlY3RpdmVzKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgaWYgKGRvYy5jb250ZW50cy5jb21tZW50QmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3MgPSBjb21tZW50U3RyaW5nKGRvYy5jb250ZW50cy5jb21tZW50QmVmb3JlKTtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKGluZGVudENvbW1lbnQoY3MsICcnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0b3AtbGV2ZWwgYmxvY2sgc2NhbGFycyBuZWVkIHRvIGJlIGluZGVudGVkIGlmIGZvbGxvd2VkIGJ5IGEgY29tbWVudFxuICAgICAgICAgICAgY3R4LmZvcmNlQmxvY2tJbmRlbnQgPSAhIWRvYy5jb21tZW50O1xuICAgICAgICAgICAgY29udGVudENvbW1lbnQgPSBkb2MuY29udGVudHMuY29tbWVudDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvbkNob21wS2VlcCA9IGNvbnRlbnRDb21tZW50ID8gdW5kZWZpbmVkIDogKCkgPT4gKGNob21wS2VlcCA9IHRydWUpO1xuICAgICAgICBsZXQgYm9keSA9IHN0cmluZ2lmeShkb2MuY29udGVudHMsIGN0eCwgKCkgPT4gKGNvbnRlbnRDb21tZW50ID0gbnVsbCksIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgaWYgKGNvbnRlbnRDb21tZW50KVxuICAgICAgICAgICAgYm9keSArPSBsaW5lQ29tbWVudChib2R5LCAnJywgY29tbWVudFN0cmluZyhjb250ZW50Q29tbWVudCkpO1xuICAgICAgICBpZiAoKGJvZHlbMF0gPT09ICd8JyB8fCBib2R5WzBdID09PSAnPicpICYmXG4gICAgICAgICAgICBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJy0tLScpIHtcbiAgICAgICAgICAgIC8vIFRvcC1sZXZlbCBibG9jayBzY2FsYXJzIHdpdGggYSBwcmVjZWRpbmcgZG9jIG1hcmtlciBvdWdodCB0byB1c2UgdGhlXG4gICAgICAgICAgICAvLyBzYW1lIGxpbmUgZm9yIHRoZWlyIGhlYWRlci5cbiAgICAgICAgICAgIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID0gYC0tLSAke2JvZHl9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsaW5lcy5wdXNoKGJvZHkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbGluZXMucHVzaChzdHJpbmdpZnkoZG9jLmNvbnRlbnRzLCBjdHgpKTtcbiAgICB9XG4gICAgaWYgKGRvYy5kaXJlY3RpdmVzPy5kb2NFbmQpIHtcbiAgICAgICAgaWYgKGRvYy5jb21tZW50KSB7XG4gICAgICAgICAgICBjb25zdCBjcyA9IGNvbW1lbnRTdHJpbmcoZG9jLmNvbW1lbnQpO1xuICAgICAgICAgICAgaWYgKGNzLmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJy4uLicpO1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goaW5kZW50Q29tbWVudChjcywgJycpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goYC4uLiAke2NzfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGluZXMucHVzaCgnLi4uJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxldCBkYyA9IGRvYy5jb21tZW50O1xuICAgICAgICBpZiAoZGMgJiYgY2hvbXBLZWVwKVxuICAgICAgICAgICAgZGMgPSBkYy5yZXBsYWNlKC9eXFxuKy8sICcnKTtcbiAgICAgICAgaWYgKGRjKSB7XG4gICAgICAgICAgICBpZiAoKCFjaG9tcEtlZXAgfHwgY29udGVudENvbW1lbnQpICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdICE9PSAnJylcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goaW5kZW50Q29tbWVudChjb21tZW50U3RyaW5nKGRjKSwgJycpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJykgKyAnXFxuJztcbn1cblxuZXhwb3J0IHsgc3RyaW5naWZ5RG9jdW1lbnQgfTtcbiIsICJpbXBvcnQgeyBBbGlhcyB9IGZyb20gJy4uL25vZGVzL0FsaWFzLmpzJztcbmltcG9ydCB7IGlzRW1wdHlQYXRoLCBjb2xsZWN0aW9uRnJvbVBhdGggfSBmcm9tICcuLi9ub2Rlcy9Db2xsZWN0aW9uLmpzJztcbmltcG9ydCB7IE5PREVfVFlQRSwgRE9DLCBpc05vZGUsIGlzQ29sbGVjdGlvbiwgaXNTY2FsYXIgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBQYWlyIH0gZnJvbSAnLi4vbm9kZXMvUGFpci5qcyc7XG5pbXBvcnQgeyB0b0pTIH0gZnJvbSAnLi4vbm9kZXMvdG9KUy5qcyc7XG5pbXBvcnQgeyBTY2hlbWEgfSBmcm9tICcuLi9zY2hlbWEvU2NoZW1hLmpzJztcbmltcG9ydCB7IHN0cmluZ2lmeURvY3VtZW50IH0gZnJvbSAnLi4vc3RyaW5naWZ5L3N0cmluZ2lmeURvY3VtZW50LmpzJztcbmltcG9ydCB7IGFuY2hvck5hbWVzLCBmaW5kTmV3QW5jaG9yLCBjcmVhdGVOb2RlQW5jaG9ycyB9IGZyb20gJy4vYW5jaG9ycy5qcyc7XG5pbXBvcnQgeyBhcHBseVJldml2ZXIgfSBmcm9tICcuL2FwcGx5UmV2aXZlci5qcyc7XG5pbXBvcnQgeyBjcmVhdGVOb2RlIH0gZnJvbSAnLi9jcmVhdGVOb2RlLmpzJztcbmltcG9ydCB7IERpcmVjdGl2ZXMgfSBmcm9tICcuL2RpcmVjdGl2ZXMuanMnO1xuXG5jbGFzcyBEb2N1bWVudCB7XG4gICAgY29uc3RydWN0b3IodmFsdWUsIHJlcGxhY2VyLCBvcHRpb25zKSB7XG4gICAgICAgIC8qKiBBIGNvbW1lbnQgYmVmb3JlIHRoaXMgRG9jdW1lbnQgKi9cbiAgICAgICAgdGhpcy5jb21tZW50QmVmb3JlID0gbnVsbDtcbiAgICAgICAgLyoqIEEgY29tbWVudCBpbW1lZGlhdGVseSBhZnRlciB0aGlzIERvY3VtZW50ICovXG4gICAgICAgIHRoaXMuY29tbWVudCA9IG51bGw7XG4gICAgICAgIC8qKiBFcnJvcnMgZW5jb3VudGVyZWQgZHVyaW5nIHBhcnNpbmcuICovXG4gICAgICAgIHRoaXMuZXJyb3JzID0gW107XG4gICAgICAgIC8qKiBXYXJuaW5ncyBlbmNvdW50ZXJlZCBkdXJpbmcgcGFyc2luZy4gKi9cbiAgICAgICAgdGhpcy53YXJuaW5ncyA9IFtdO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgTk9ERV9UWVBFLCB7IHZhbHVlOiBET0MgfSk7XG4gICAgICAgIGxldCBfcmVwbGFjZXIgPSBudWxsO1xuICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nIHx8IEFycmF5LmlzQXJyYXkocmVwbGFjZXIpKSB7XG4gICAgICAgICAgICBfcmVwbGFjZXIgPSByZXBsYWNlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQgJiYgcmVwbGFjZXIpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSByZXBsYWNlcjtcbiAgICAgICAgICAgIHJlcGxhY2VyID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9wdCA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgaW50QXNCaWdJbnQ6IGZhbHNlLFxuICAgICAgICAgICAga2VlcFNvdXJjZVRva2VuczogZmFsc2UsXG4gICAgICAgICAgICBsb2dMZXZlbDogJ3dhcm4nLFxuICAgICAgICAgICAgcHJldHR5RXJyb3JzOiB0cnVlLFxuICAgICAgICAgICAgc3RyaWN0OiB0cnVlLFxuICAgICAgICAgICAgc3RyaW5nS2V5czogZmFsc2UsXG4gICAgICAgICAgICB1bmlxdWVLZXlzOiB0cnVlLFxuICAgICAgICAgICAgdmVyc2lvbjogJzEuMidcbiAgICAgICAgfSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdDtcbiAgICAgICAgbGV0IHsgdmVyc2lvbiB9ID0gb3B0O1xuICAgICAgICBpZiAob3B0aW9ucz8uX2RpcmVjdGl2ZXMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcyA9IG9wdGlvbnMuX2RpcmVjdGl2ZXMuYXREb2N1bWVudCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcy55YW1sLmV4cGxpY2l0KVxuICAgICAgICAgICAgICAgIHZlcnNpb24gPSB0aGlzLmRpcmVjdGl2ZXMueWFtbC52ZXJzaW9uO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcyA9IG5ldyBEaXJlY3RpdmVzKHsgdmVyc2lvbiB9KTtcbiAgICAgICAgdGhpcy5zZXRTY2hlbWEodmVyc2lvbiwgb3B0aW9ucyk7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgV2UgY2FuJ3QgcmVhbGx5IGtub3cgdGhhdCB0aGlzIG1hdGNoZXMgQ29udGVudHMuXG4gICAgICAgIHRoaXMuY29udGVudHMgPVxuICAgICAgICAgICAgdmFsdWUgPT09IHVuZGVmaW5lZCA/IG51bGwgOiB0aGlzLmNyZWF0ZU5vZGUodmFsdWUsIF9yZXBsYWNlciwgb3B0aW9ucyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGRlZXAgY29weSBvZiB0aGlzIERvY3VtZW50IGFuZCBpdHMgY29udGVudHMuXG4gICAgICpcbiAgICAgKiBDdXN0b20gTm9kZSB2YWx1ZXMgdGhhdCBpbmhlcml0IGZyb20gYE9iamVjdGAgc3RpbGwgcmVmZXIgdG8gdGhlaXIgb3JpZ2luYWwgaW5zdGFuY2VzLlxuICAgICAqL1xuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjb3B5ID0gT2JqZWN0LmNyZWF0ZShEb2N1bWVudC5wcm90b3R5cGUsIHtcbiAgICAgICAgICAgIFtOT0RFX1RZUEVdOiB7IHZhbHVlOiBET0MgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29weS5jb21tZW50QmVmb3JlID0gdGhpcy5jb21tZW50QmVmb3JlO1xuICAgICAgICBjb3B5LmNvbW1lbnQgPSB0aGlzLmNvbW1lbnQ7XG4gICAgICAgIGNvcHkuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoKTtcbiAgICAgICAgY29weS53YXJuaW5ncyA9IHRoaXMud2FybmluZ3Muc2xpY2UoKTtcbiAgICAgICAgY29weS5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcylcbiAgICAgICAgICAgIGNvcHkuZGlyZWN0aXZlcyA9IHRoaXMuZGlyZWN0aXZlcy5jbG9uZSgpO1xuICAgICAgICBjb3B5LnNjaGVtYSA9IHRoaXMuc2NoZW1hLmNsb25lKCk7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgV2UgY2FuJ3QgcmVhbGx5IGtub3cgdGhhdCB0aGlzIG1hdGNoZXMgQ29udGVudHMuXG4gICAgICAgIGNvcHkuY29udGVudHMgPSBpc05vZGUodGhpcy5jb250ZW50cylcbiAgICAgICAgICAgID8gdGhpcy5jb250ZW50cy5jbG9uZShjb3B5LnNjaGVtYSlcbiAgICAgICAgICAgIDogdGhpcy5jb250ZW50cztcbiAgICAgICAgaWYgKHRoaXMucmFuZ2UpXG4gICAgICAgICAgICBjb3B5LnJhbmdlID0gdGhpcy5yYW5nZS5zbGljZSgpO1xuICAgICAgICByZXR1cm4gY29weTtcbiAgICB9XG4gICAgLyoqIEFkZHMgYSB2YWx1ZSB0byB0aGUgZG9jdW1lbnQuICovXG4gICAgYWRkKHZhbHVlKSB7XG4gICAgICAgIGlmIChhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpKVxuICAgICAgICAgICAgdGhpcy5jb250ZW50cy5hZGQodmFsdWUpO1xuICAgIH1cbiAgICAvKiogQWRkcyBhIHZhbHVlIHRvIHRoZSBkb2N1bWVudC4gKi9cbiAgICBhZGRJbihwYXRoLCB2YWx1ZSkge1xuICAgICAgICBpZiAoYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSlcbiAgICAgICAgICAgIHRoaXMuY29udGVudHMuYWRkSW4ocGF0aCwgdmFsdWUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgYEFsaWFzYCBub2RlLCBlbnN1cmluZyB0aGF0IHRoZSB0YXJnZXQgYG5vZGVgIGhhcyB0aGUgcmVxdWlyZWQgYW5jaG9yLlxuICAgICAqXG4gICAgICogSWYgYG5vZGVgIGFscmVhZHkgaGFzIGFuIGFuY2hvciwgYG5hbWVgIGlzIGlnbm9yZWQuXG4gICAgICogT3RoZXJ3aXNlLCB0aGUgYG5vZGUuYW5jaG9yYCB2YWx1ZSB3aWxsIGJlIHNldCB0byBgbmFtZWAsXG4gICAgICogb3IgaWYgYW4gYW5jaG9yIHdpdGggdGhhdCBuYW1lIGlzIGFscmVhZHkgcHJlc2VudCBpbiB0aGUgZG9jdW1lbnQsXG4gICAgICogYG5hbWVgIHdpbGwgYmUgdXNlZCBhcyBhIHByZWZpeCBmb3IgYSBuZXcgdW5pcXVlIGFuY2hvci5cbiAgICAgKiBJZiBgbmFtZWAgaXMgdW5kZWZpbmVkLCB0aGUgZ2VuZXJhdGVkIGFuY2hvciB3aWxsIHVzZSAnYScgYXMgYSBwcmVmaXguXG4gICAgICovXG4gICAgY3JlYXRlQWxpYXMobm9kZSwgbmFtZSkge1xuICAgICAgICBpZiAoIW5vZGUuYW5jaG9yKSB7XG4gICAgICAgICAgICBjb25zdCBwcmV2ID0gYW5jaG9yTmFtZXModGhpcyk7XG4gICAgICAgICAgICBub2RlLmFuY2hvciA9XG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItbnVsbGlzaC1jb2FsZXNjaW5nXG4gICAgICAgICAgICAgICAgIW5hbWUgfHwgcHJldi5oYXMobmFtZSkgPyBmaW5kTmV3QW5jaG9yKG5hbWUgfHwgJ2EnLCBwcmV2KSA6IG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBBbGlhcyhub2RlLmFuY2hvcik7XG4gICAgfVxuICAgIGNyZWF0ZU5vZGUodmFsdWUsIHJlcGxhY2VyLCBvcHRpb25zKSB7XG4gICAgICAgIGxldCBfcmVwbGFjZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcmVwbGFjZXIuY2FsbCh7ICcnOiB2YWx1ZSB9LCAnJywgdmFsdWUpO1xuICAgICAgICAgICAgX3JlcGxhY2VyID0gcmVwbGFjZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXBsYWNlcikpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleVRvU3RyID0gKHYpID0+IHR5cGVvZiB2ID09PSAnbnVtYmVyJyB8fCB2IGluc3RhbmNlb2YgU3RyaW5nIHx8IHYgaW5zdGFuY2VvZiBOdW1iZXI7XG4gICAgICAgICAgICBjb25zdCBhc1N0ciA9IHJlcGxhY2VyLmZpbHRlcihrZXlUb1N0cikubWFwKFN0cmluZyk7XG4gICAgICAgICAgICBpZiAoYXNTdHIubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICByZXBsYWNlciA9IHJlcGxhY2VyLmNvbmNhdChhc1N0cik7XG4gICAgICAgICAgICBfcmVwbGFjZXIgPSByZXBsYWNlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQgJiYgcmVwbGFjZXIpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSByZXBsYWNlcjtcbiAgICAgICAgICAgIHJlcGxhY2VyID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgYWxpYXNEdXBsaWNhdGVPYmplY3RzLCBhbmNob3JQcmVmaXgsIGZsb3csIGtlZXBVbmRlZmluZWQsIG9uVGFnT2JqLCB0YWcgfSA9IG9wdGlvbnMgPz8ge307XG4gICAgICAgIGNvbnN0IHsgb25BbmNob3IsIHNldEFuY2hvcnMsIHNvdXJjZU9iamVjdHMgfSA9IGNyZWF0ZU5vZGVBbmNob3JzKHRoaXMsIFxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3ByZWZlci1udWxsaXNoLWNvYWxlc2NpbmdcbiAgICAgICAgYW5jaG9yUHJlZml4IHx8ICdhJyk7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGFsaWFzRHVwbGljYXRlT2JqZWN0czogYWxpYXNEdXBsaWNhdGVPYmplY3RzID8/IHRydWUsXG4gICAgICAgICAgICBrZWVwVW5kZWZpbmVkOiBrZWVwVW5kZWZpbmVkID8/IGZhbHNlLFxuICAgICAgICAgICAgb25BbmNob3IsXG4gICAgICAgICAgICBvblRhZ09iaixcbiAgICAgICAgICAgIHJlcGxhY2VyOiBfcmVwbGFjZXIsXG4gICAgICAgICAgICBzY2hlbWE6IHRoaXMuc2NoZW1hLFxuICAgICAgICAgICAgc291cmNlT2JqZWN0c1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBub2RlID0gY3JlYXRlTm9kZSh2YWx1ZSwgdGFnLCBjdHgpO1xuICAgICAgICBpZiAoZmxvdyAmJiBpc0NvbGxlY3Rpb24obm9kZSkpXG4gICAgICAgICAgICBub2RlLmZsb3cgPSB0cnVlO1xuICAgICAgICBzZXRBbmNob3JzKCk7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IGEga2V5IGFuZCBhIHZhbHVlIGludG8gYSBgUGFpcmAgdXNpbmcgdGhlIGN1cnJlbnQgc2NoZW1hLFxuICAgICAqIHJlY3Vyc2l2ZWx5IHdyYXBwaW5nIGFsbCB2YWx1ZXMgYXMgYFNjYWxhcmAgb3IgYENvbGxlY3Rpb25gIG5vZGVzLlxuICAgICAqL1xuICAgIGNyZWF0ZVBhaXIoa2V5LCB2YWx1ZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGsgPSB0aGlzLmNyZWF0ZU5vZGUoa2V5LCBudWxsLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgdiA9IHRoaXMuY3JlYXRlTm9kZSh2YWx1ZSwgbnVsbCwgb3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBuZXcgUGFpcihrLCB2KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHZhbHVlIGZyb20gdGhlIGRvY3VtZW50LlxuICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaXRlbSB3YXMgZm91bmQgYW5kIHJlbW92ZWQuXG4gICAgICovXG4gICAgZGVsZXRlKGtleSkge1xuICAgICAgICByZXR1cm4gYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSA/IHRoaXMuY29udGVudHMuZGVsZXRlKGtleSkgOiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHZhbHVlIGZyb20gdGhlIGRvY3VtZW50LlxuICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaXRlbSB3YXMgZm91bmQgYW5kIHJlbW92ZWQuXG4gICAgICovXG4gICAgZGVsZXRlSW4ocGF0aCkge1xuICAgICAgICBpZiAoaXNFbXB0eVBhdGgocGF0aCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRlbnRzID09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBQcmVzdW1lZCBpbXBvc3NpYmxlIGlmIFN0cmljdCBleHRlbmRzIGZhbHNlXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpXG4gICAgICAgICAgICA/IHRoaXMuY29udGVudHMuZGVsZXRlSW4ocGF0aClcbiAgICAgICAgICAgIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgaXRlbSBhdCBga2V5YCwgb3IgYHVuZGVmaW5lZGAgaWYgbm90IGZvdW5kLiBCeSBkZWZhdWx0IHVud3JhcHNcbiAgICAgKiBzY2FsYXIgdmFsdWVzIGZyb20gdGhlaXIgc3Vycm91bmRpbmcgbm9kZTsgdG8gZGlzYWJsZSBzZXQgYGtlZXBTY2FsYXJgIHRvXG4gICAgICogYHRydWVgIChjb2xsZWN0aW9ucyBhcmUgYWx3YXlzIHJldHVybmVkIGludGFjdCkuXG4gICAgICovXG4gICAgZ2V0KGtleSwga2VlcFNjYWxhcikge1xuICAgICAgICByZXR1cm4gaXNDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpXG4gICAgICAgICAgICA/IHRoaXMuY29udGVudHMuZ2V0KGtleSwga2VlcFNjYWxhcilcbiAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGl0ZW0gYXQgYHBhdGhgLCBvciBgdW5kZWZpbmVkYCBpZiBub3QgZm91bmQuIEJ5IGRlZmF1bHQgdW53cmFwc1xuICAgICAqIHNjYWxhciB2YWx1ZXMgZnJvbSB0aGVpciBzdXJyb3VuZGluZyBub2RlOyB0byBkaXNhYmxlIHNldCBga2VlcFNjYWxhcmAgdG9cbiAgICAgKiBgdHJ1ZWAgKGNvbGxlY3Rpb25zIGFyZSBhbHdheXMgcmV0dXJuZWQgaW50YWN0KS5cbiAgICAgKi9cbiAgICBnZXRJbihwYXRoLCBrZWVwU2NhbGFyKSB7XG4gICAgICAgIGlmIChpc0VtcHR5UGF0aChwYXRoKSlcbiAgICAgICAgICAgIHJldHVybiAha2VlcFNjYWxhciAmJiBpc1NjYWxhcih0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgICAgID8gdGhpcy5jb250ZW50cy52YWx1ZVxuICAgICAgICAgICAgICAgIDogdGhpcy5jb250ZW50cztcbiAgICAgICAgcmV0dXJuIGlzQ29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLmdldEluKHBhdGgsIGtlZXBTY2FsYXIpXG4gICAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBkb2N1bWVudCBpbmNsdWRlcyBhIHZhbHVlIHdpdGggdGhlIGtleSBga2V5YC5cbiAgICAgKi9cbiAgICBoYXMoa2V5KSB7XG4gICAgICAgIHJldHVybiBpc0NvbGxlY3Rpb24odGhpcy5jb250ZW50cykgPyB0aGlzLmNvbnRlbnRzLmhhcyhrZXkpIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgZG9jdW1lbnQgaW5jbHVkZXMgYSB2YWx1ZSBhdCBgcGF0aGAuXG4gICAgICovXG4gICAgaGFzSW4ocGF0aCkge1xuICAgICAgICBpZiAoaXNFbXB0eVBhdGgocGF0aCkpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb250ZW50cyAhPT0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gaXNDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpID8gdGhpcy5jb250ZW50cy5oYXNJbihwYXRoKSA6IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgdmFsdWUgaW4gdGhpcyBkb2N1bWVudC4gRm9yIGAhIXNldGAsIGB2YWx1ZWAgbmVlZHMgdG8gYmUgYVxuICAgICAqIGJvb2xlYW4gdG8gYWRkL3JlbW92ZSB0aGUgaXRlbSBmcm9tIHRoZSBzZXQuXG4gICAgICovXG4gICAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udGVudHMgPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgICAgIHRoaXMuY29udGVudHMgPSBjb2xsZWN0aW9uRnJvbVBhdGgodGhpcy5zY2hlbWEsIFtrZXldLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSkge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50cy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIHZhbHVlIGluIHRoaXMgZG9jdW1lbnQuIEZvciBgISFzZXRgLCBgdmFsdWVgIG5lZWRzIHRvIGJlIGFcbiAgICAgKiBib29sZWFuIHRvIGFkZC9yZW1vdmUgdGhlIGl0ZW0gZnJvbSB0aGUgc2V0LlxuICAgICAqL1xuICAgIHNldEluKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIGlmIChpc0VtcHR5UGF0aChwYXRoKSkge1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgICAgIHRoaXMuY29udGVudHMgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmNvbnRlbnRzID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgV2UgY2FuJ3QgcmVhbGx5IGtub3cgdGhhdCB0aGlzIG1hdGNoZXMgQ29udGVudHMuXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzID0gY29sbGVjdGlvbkZyb21QYXRoKHRoaXMuc2NoZW1hLCBBcnJheS5mcm9tKHBhdGgpLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSkge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50cy5zZXRJbihwYXRoLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hhbmdlIHRoZSBZQU1MIHZlcnNpb24gYW5kIHNjaGVtYSB1c2VkIGJ5IHRoZSBkb2N1bWVudC5cbiAgICAgKiBBIGBudWxsYCB2ZXJzaW9uIGRpc2FibGVzIHN1cHBvcnQgZm9yIGRpcmVjdGl2ZXMsIGV4cGxpY2l0IHRhZ3MsIGFuY2hvcnMsIGFuZCBhbGlhc2VzLlxuICAgICAqIEl0IGFsc28gcmVxdWlyZXMgdGhlIGBzY2hlbWFgIG9wdGlvbiB0byBiZSBnaXZlbiBhcyBhIGBTY2hlbWFgIGluc3RhbmNlIHZhbHVlLlxuICAgICAqXG4gICAgICogT3ZlcnJpZGVzIGFsbCBwcmV2aW91c2x5IHNldCBzY2hlbWEgb3B0aW9ucy5cbiAgICAgKi9cbiAgICBzZXRTY2hlbWEodmVyc2lvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICB2ZXJzaW9uID0gU3RyaW5nKHZlcnNpb24pO1xuICAgICAgICBsZXQgb3B0O1xuICAgICAgICBzd2l0Y2ggKHZlcnNpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJzEuMSc6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzLnlhbWwudmVyc2lvbiA9ICcxLjEnO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gbmV3IERpcmVjdGl2ZXMoeyB2ZXJzaW9uOiAnMS4xJyB9KTtcbiAgICAgICAgICAgICAgICBvcHQgPSB7IHJlc29sdmVLbm93blRhZ3M6IGZhbHNlLCBzY2hlbWE6ICd5YW1sLTEuMScgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJzEuMic6XG4gICAgICAgICAgICBjYXNlICduZXh0JzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMueWFtbC52ZXJzaW9uID0gdmVyc2lvbjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcyA9IG5ldyBEaXJlY3RpdmVzKHsgdmVyc2lvbiB9KTtcbiAgICAgICAgICAgICAgICBvcHQgPSB7IHJlc29sdmVLbm93blRhZ3M6IHRydWUsIHNjaGVtYTogJ2NvcmUnIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIG51bGw6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuZGlyZWN0aXZlcztcbiAgICAgICAgICAgICAgICBvcHQgPSBudWxsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN2ID0gSlNPTi5zdHJpbmdpZnkodmVyc2lvbik7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCAnMS4xJywgJzEuMicgb3IgbnVsbCBhcyBmaXJzdCBhcmd1bWVudCwgYnV0IGZvdW5kOiAke3N2fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE5vdCB1c2luZyBgaW5zdGFuY2VvZiBTY2hlbWFgIHRvIGFsbG93IGZvciBkdWNrIHR5cGluZ1xuICAgICAgICBpZiAob3B0aW9ucy5zY2hlbWEgaW5zdGFuY2VvZiBPYmplY3QpXG4gICAgICAgICAgICB0aGlzLnNjaGVtYSA9IG9wdGlvbnMuc2NoZW1hO1xuICAgICAgICBlbHNlIGlmIChvcHQpXG4gICAgICAgICAgICB0aGlzLnNjaGVtYSA9IG5ldyBTY2hlbWEoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXaXRoIGEgbnVsbCBZQU1MIHZlcnNpb24sIHRoZSB7IHNjaGVtYTogU2NoZW1hIH0gb3B0aW9uIGlzIHJlcXVpcmVkYCk7XG4gICAgfVxuICAgIC8vIGpzb24gJiBqc29uQXJnIGFyZSBvbmx5IHVzZWQgZnJvbSB0b0pTT04oKVxuICAgIHRvSlMoeyBqc29uLCBqc29uQXJnLCBtYXBBc01hcCwgbWF4QWxpYXNDb3VudCwgb25BbmNob3IsIHJldml2ZXIgfSA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGFuY2hvcnM6IG5ldyBNYXAoKSxcbiAgICAgICAgICAgIGRvYzogdGhpcyxcbiAgICAgICAgICAgIGtlZXA6ICFqc29uLFxuICAgICAgICAgICAgbWFwQXNNYXA6IG1hcEFzTWFwID09PSB0cnVlLFxuICAgICAgICAgICAgbWFwS2V5V2FybmVkOiBmYWxzZSxcbiAgICAgICAgICAgIG1heEFsaWFzQ291bnQ6IHR5cGVvZiBtYXhBbGlhc0NvdW50ID09PSAnbnVtYmVyJyA/IG1heEFsaWFzQ291bnQgOiAxMDBcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzID0gdG9KUyh0aGlzLmNvbnRlbnRzLCBqc29uQXJnID8/ICcnLCBjdHgpO1xuICAgICAgICBpZiAodHlwZW9mIG9uQW5jaG9yID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgZm9yIChjb25zdCB7IGNvdW50LCByZXMgfSBvZiBjdHguYW5jaG9ycy52YWx1ZXMoKSlcbiAgICAgICAgICAgICAgICBvbkFuY2hvcihyZXMsIGNvdW50KTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiByZXZpdmVyID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IGFwcGx5UmV2aXZlcihyZXZpdmVyLCB7ICcnOiByZXMgfSwgJycsIHJlcylcbiAgICAgICAgICAgIDogcmVzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGRvY3VtZW50IGBjb250ZW50c2AuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ganNvbkFyZyBVc2VkIGJ5IGBKU09OLnN0cmluZ2lmeWAgdG8gaW5kaWNhdGUgdGhlIGFycmF5IGluZGV4IG9yXG4gICAgICogICBwcm9wZXJ0eSBuYW1lLlxuICAgICAqL1xuICAgIHRvSlNPTihqc29uQXJnLCBvbkFuY2hvcikge1xuICAgICAgICByZXR1cm4gdGhpcy50b0pTKHsganNvbjogdHJ1ZSwganNvbkFyZywgbWFwQXNNYXA6IGZhbHNlLCBvbkFuY2hvciB9KTtcbiAgICB9XG4gICAgLyoqIEEgWUFNTCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZG9jdW1lbnQuICovXG4gICAgdG9TdHJpbmcob3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGlmICh0aGlzLmVycm9ycy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEb2N1bWVudCB3aXRoIGVycm9ycyBjYW5ub3QgYmUgc3RyaW5naWZpZWQnKTtcbiAgICAgICAgaWYgKCdpbmRlbnQnIGluIG9wdGlvbnMgJiZcbiAgICAgICAgICAgICghTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmluZGVudCkgfHwgTnVtYmVyKG9wdGlvbnMuaW5kZW50KSA8PSAwKSkge1xuICAgICAgICAgICAgY29uc3QgcyA9IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuaW5kZW50KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgXCJpbmRlbnRcIiBvcHRpb24gbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXIsIG5vdCAke3N9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeURvY3VtZW50KHRoaXMsIG9wdGlvbnMpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGFzc2VydENvbGxlY3Rpb24oY29udGVudHMpIHtcbiAgICBpZiAoaXNDb2xsZWN0aW9uKGNvbnRlbnRzKSlcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBhIFlBTUwgY29sbGVjdGlvbiBhcyBkb2N1bWVudCBjb250ZW50cycpO1xufVxuXG5leHBvcnQgeyBEb2N1bWVudCB9O1xuIiwgImNsYXNzIFlBTUxFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwb3MsIGNvZGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jb2RlID0gY29kZTtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgfVxufVxuY2xhc3MgWUFNTFBhcnNlRXJyb3IgZXh0ZW5kcyBZQU1MRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKHBvcywgY29kZSwgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcignWUFNTFBhcnNlRXJyb3InLCBwb3MsIGNvZGUsIG1lc3NhZ2UpO1xuICAgIH1cbn1cbmNsYXNzIFlBTUxXYXJuaW5nIGV4dGVuZHMgWUFNTEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihwb3MsIGNvZGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoJ1lBTUxXYXJuaW5nJywgcG9zLCBjb2RlLCBtZXNzYWdlKTtcbiAgICB9XG59XG5jb25zdCBwcmV0dGlmeUVycm9yID0gKHNyYywgbGMpID0+IChlcnJvcikgPT4ge1xuICAgIGlmIChlcnJvci5wb3NbMF0gPT09IC0xKVxuICAgICAgICByZXR1cm47XG4gICAgZXJyb3IubGluZVBvcyA9IGVycm9yLnBvcy5tYXAocG9zID0+IGxjLmxpbmVQb3MocG9zKSk7XG4gICAgY29uc3QgeyBsaW5lLCBjb2wgfSA9IGVycm9yLmxpbmVQb3NbMF07XG4gICAgZXJyb3IubWVzc2FnZSArPSBgIGF0IGxpbmUgJHtsaW5lfSwgY29sdW1uICR7Y29sfWA7XG4gICAgbGV0IGNpID0gY29sIC0gMTtcbiAgICBsZXQgbGluZVN0ciA9IHNyY1xuICAgICAgICAuc3Vic3RyaW5nKGxjLmxpbmVTdGFydHNbbGluZSAtIDFdLCBsYy5saW5lU3RhcnRzW2xpbmVdKVxuICAgICAgICAucmVwbGFjZSgvW1xcblxccl0rJC8sICcnKTtcbiAgICAvLyBUcmltIHRvIG1heCA4MCBjaGFycywga2VlcGluZyBjb2wgcG9zaXRpb24gbmVhciB0aGUgbWlkZGxlXG4gICAgaWYgKGNpID49IDYwICYmIGxpbmVTdHIubGVuZ3RoID4gODApIHtcbiAgICAgICAgY29uc3QgdHJpbVN0YXJ0ID0gTWF0aC5taW4oY2kgLSAzOSwgbGluZVN0ci5sZW5ndGggLSA3OSk7XG4gICAgICAgIGxpbmVTdHIgPSAnXHUyMDI2JyArIGxpbmVTdHIuc3Vic3RyaW5nKHRyaW1TdGFydCk7XG4gICAgICAgIGNpIC09IHRyaW1TdGFydCAtIDE7XG4gICAgfVxuICAgIGlmIChsaW5lU3RyLmxlbmd0aCA+IDgwKVxuICAgICAgICBsaW5lU3RyID0gbGluZVN0ci5zdWJzdHJpbmcoMCwgNzkpICsgJ1x1MjAyNic7XG4gICAgLy8gSW5jbHVkZSBwcmV2aW91cyBsaW5lIGluIGNvbnRleHQgaWYgcG9pbnRpbmcgYXQgbGluZSBzdGFydFxuICAgIGlmIChsaW5lID4gMSAmJiAvXiAqJC8udGVzdChsaW5lU3RyLnN1YnN0cmluZygwLCBjaSkpKSB7XG4gICAgICAgIC8vIFJlZ2V4cCB3b24ndCBtYXRjaCBpZiBzdGFydCBpcyB0cmltbWVkXG4gICAgICAgIGxldCBwcmV2ID0gc3JjLnN1YnN0cmluZyhsYy5saW5lU3RhcnRzW2xpbmUgLSAyXSwgbGMubGluZVN0YXJ0c1tsaW5lIC0gMV0pO1xuICAgICAgICBpZiAocHJldi5sZW5ndGggPiA4MClcbiAgICAgICAgICAgIHByZXYgPSBwcmV2LnN1YnN0cmluZygwLCA3OSkgKyAnXHUyMDI2XFxuJztcbiAgICAgICAgbGluZVN0ciA9IHByZXYgKyBsaW5lU3RyO1xuICAgIH1cbiAgICBpZiAoL1teIF0vLnRlc3QobGluZVN0cikpIHtcbiAgICAgICAgbGV0IGNvdW50ID0gMTtcbiAgICAgICAgY29uc3QgZW5kID0gZXJyb3IubGluZVBvc1sxXTtcbiAgICAgICAgaWYgKGVuZD8ubGluZSA9PT0gbGluZSAmJiBlbmQuY29sID4gY29sKSB7XG4gICAgICAgICAgICBjb3VudCA9IE1hdGgubWF4KDEsIE1hdGgubWluKGVuZC5jb2wgLSBjb2wsIDgwIC0gY2kpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb2ludGVyID0gJyAnLnJlcGVhdChjaSkgKyAnXicucmVwZWF0KGNvdW50KTtcbiAgICAgICAgZXJyb3IubWVzc2FnZSArPSBgOlxcblxcbiR7bGluZVN0cn1cXG4ke3BvaW50ZXJ9XFxuYDtcbiAgICB9XG59O1xuXG5leHBvcnQgeyBZQU1MRXJyb3IsIFlBTUxQYXJzZUVycm9yLCBZQU1MV2FybmluZywgcHJldHRpZnlFcnJvciB9O1xuIiwgImZ1bmN0aW9uIHJlc29sdmVQcm9wcyh0b2tlbnMsIHsgZmxvdywgaW5kaWNhdG9yLCBuZXh0LCBvZmZzZXQsIG9uRXJyb3IsIHBhcmVudEluZGVudCwgc3RhcnRPbk5ld2xpbmUgfSkge1xuICAgIGxldCBzcGFjZUJlZm9yZSA9IGZhbHNlO1xuICAgIGxldCBhdE5ld2xpbmUgPSBzdGFydE9uTmV3bGluZTtcbiAgICBsZXQgaGFzU3BhY2UgPSBzdGFydE9uTmV3bGluZTtcbiAgICBsZXQgY29tbWVudCA9ICcnO1xuICAgIGxldCBjb21tZW50U2VwID0gJyc7XG4gICAgbGV0IGhhc05ld2xpbmUgPSBmYWxzZTtcbiAgICBsZXQgcmVxU3BhY2UgPSBmYWxzZTtcbiAgICBsZXQgdGFiID0gbnVsbDtcbiAgICBsZXQgYW5jaG9yID0gbnVsbDtcbiAgICBsZXQgdGFnID0gbnVsbDtcbiAgICBsZXQgbmV3bGluZUFmdGVyUHJvcCA9IG51bGw7XG4gICAgbGV0IGNvbW1hID0gbnVsbDtcbiAgICBsZXQgZm91bmQgPSBudWxsO1xuICAgIGxldCBzdGFydCA9IG51bGw7XG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICAgICAgaWYgKHJlcVNwYWNlKSB7XG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSAhPT0gJ3NwYWNlJyAmJlxuICAgICAgICAgICAgICAgIHRva2VuLnR5cGUgIT09ICduZXdsaW5lJyAmJlxuICAgICAgICAgICAgICAgIHRva2VuLnR5cGUgIT09ICdjb21tYScpXG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbi5vZmZzZXQsICdNSVNTSU5HX0NIQVInLCAnVGFncyBhbmQgYW5jaG9ycyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIHRoZSBuZXh0IHRva2VuIGJ5IHdoaXRlIHNwYWNlJyk7XG4gICAgICAgICAgICByZXFTcGFjZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YWIpIHtcbiAgICAgICAgICAgIGlmIChhdE5ld2xpbmUgJiYgdG9rZW4udHlwZSAhPT0gJ2NvbW1lbnQnICYmIHRva2VuLnR5cGUgIT09ICduZXdsaW5lJykge1xuICAgICAgICAgICAgICAgIG9uRXJyb3IodGFiLCAnVEFCX0FTX0lOREVOVCcsICdUYWJzIGFyZSBub3QgYWxsb3dlZCBhcyBpbmRlbnRhdGlvbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGFiID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICAvLyBBdCB0aGUgZG9jIGxldmVsLCB0YWJzIGF0IGxpbmUgc3RhcnQgbWF5IGJlIHBhcnNlZFxuICAgICAgICAgICAgICAgIC8vIGFzIGxlYWRpbmcgd2hpdGUgc3BhY2UgcmF0aGVyIHRoYW4gaW5kZW50YXRpb24uXG4gICAgICAgICAgICAgICAgLy8gSW4gYSBmbG93IGNvbGxlY3Rpb24sIG9ubHkgdGhlIHBhcnNlciBoYW5kbGVzIGluZGVudC5cbiAgICAgICAgICAgICAgICBpZiAoIWZsb3cgJiZcbiAgICAgICAgICAgICAgICAgICAgKGluZGljYXRvciAhPT0gJ2RvYy1zdGFydCcgfHwgbmV4dD8udHlwZSAhPT0gJ2Zsb3ctY29sbGVjdGlvbicpICYmXG4gICAgICAgICAgICAgICAgICAgIHRva2VuLnNvdXJjZS5pbmNsdWRlcygnXFx0JykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFiID0gdG9rZW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOiB7XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNTcGFjZSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ01JU1NJTkdfQ0hBUicsICdDb21tZW50cyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIG90aGVyIHRva2VucyBieSB3aGl0ZSBzcGFjZSBjaGFyYWN0ZXJzJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2IgPSB0b2tlbi5zb3VyY2Uuc3Vic3RyaW5nKDEpIHx8ICcgJztcbiAgICAgICAgICAgICAgICBpZiAoIWNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBjYjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgKz0gY29tbWVudFNlcCArIGNiO1xuICAgICAgICAgICAgICAgIGNvbW1lbnRTZXAgPSAnJztcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGlmIChhdE5ld2xpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tZW50ICs9IHRva2VuLnNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIWZvdW5kIHx8IGluZGljYXRvciAhPT0gJ3NlcS1pdGVtLWluZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFjZUJlZm9yZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudFNlcCArPSB0b2tlbi5zb3VyY2U7XG4gICAgICAgICAgICAgICAgYXROZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBoYXNOZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoYW5jaG9yIHx8IHRhZylcbiAgICAgICAgICAgICAgICAgICAgbmV3bGluZUFmdGVyUHJvcCA9IHRva2VuO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2FuY2hvcic6XG4gICAgICAgICAgICAgICAgaWYgKGFuY2hvcilcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ01VTFRJUExFX0FOQ0hPUlMnLCAnQSBub2RlIGNhbiBoYXZlIGF0IG1vc3Qgb25lIGFuY2hvcicpO1xuICAgICAgICAgICAgICAgIGlmICh0b2tlbi5zb3VyY2UuZW5kc1dpdGgoJzonKSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbi5vZmZzZXQgKyB0b2tlbi5zb3VyY2UubGVuZ3RoIC0gMSwgJ0JBRF9BTElBUycsICdBbmNob3IgZW5kaW5nIGluIDogaXMgYW1iaWd1b3VzJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgYW5jaG9yID0gdG9rZW47XG4gICAgICAgICAgICAgICAgc3RhcnQgPz8gKHN0YXJ0ID0gdG9rZW4ub2Zmc2V0KTtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJlcVNwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RhZyc6IHtcbiAgICAgICAgICAgICAgICBpZiAodGFnKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTVVMVElQTEVfVEFHUycsICdBIG5vZGUgY2FuIGhhdmUgYXQgbW9zdCBvbmUgdGFnJyk7XG4gICAgICAgICAgICAgICAgdGFnID0gdG9rZW47XG4gICAgICAgICAgICAgICAgc3RhcnQgPz8gKHN0YXJ0ID0gdG9rZW4ub2Zmc2V0KTtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJlcVNwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgaW5kaWNhdG9yOlxuICAgICAgICAgICAgICAgIC8vIENvdWxkIGhlcmUgaGFuZGxlIHByZWNlZGluZyBjb21tZW50cyBkaWZmZXJlbnRseVxuICAgICAgICAgICAgICAgIGlmIChhbmNob3IgfHwgdGFnKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnQkFEX1BST1BfT1JERVInLCBgQW5jaG9ycyBhbmQgdGFncyBtdXN0IGJlIGFmdGVyIHRoZSAke3Rva2VuLnNvdXJjZX0gaW5kaWNhdG9yYCk7XG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICR7dG9rZW4uc291cmNlfSBpbiAke2Zsb3cgPz8gJ2NvbGxlY3Rpb24nfWApO1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdG9rZW47XG4gICAgICAgICAgICAgICAgYXROZXdsaW5lID1cbiAgICAgICAgICAgICAgICAgICAgaW5kaWNhdG9yID09PSAnc2VxLWl0ZW0taW5kJyB8fCBpbmRpY2F0b3IgPT09ICdleHBsaWNpdC1rZXktaW5kJztcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29tbWEnOlxuICAgICAgICAgICAgICAgIGlmIChmbG93KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21tYSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgLCBpbiAke2Zsb3d9YCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1hID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlbHNlIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgJHt0b2tlbi50eXBlfSB0b2tlbmApO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgbGFzdCA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgY29uc3QgZW5kID0gbGFzdCA/IGxhc3Qub2Zmc2V0ICsgbGFzdC5zb3VyY2UubGVuZ3RoIDogb2Zmc2V0O1xuICAgIGlmIChyZXFTcGFjZSAmJlxuICAgICAgICBuZXh0ICYmXG4gICAgICAgIG5leHQudHlwZSAhPT0gJ3NwYWNlJyAmJlxuICAgICAgICBuZXh0LnR5cGUgIT09ICduZXdsaW5lJyAmJlxuICAgICAgICBuZXh0LnR5cGUgIT09ICdjb21tYScgJiZcbiAgICAgICAgKG5leHQudHlwZSAhPT0gJ3NjYWxhcicgfHwgbmV4dC5zb3VyY2UgIT09ICcnKSkge1xuICAgICAgICBvbkVycm9yKG5leHQub2Zmc2V0LCAnTUlTU0lOR19DSEFSJywgJ1RhZ3MgYW5kIGFuY2hvcnMgbXVzdCBiZSBzZXBhcmF0ZWQgZnJvbSB0aGUgbmV4dCB0b2tlbiBieSB3aGl0ZSBzcGFjZScpO1xuICAgIH1cbiAgICBpZiAodGFiICYmXG4gICAgICAgICgoYXROZXdsaW5lICYmIHRhYi5pbmRlbnQgPD0gcGFyZW50SW5kZW50KSB8fFxuICAgICAgICAgICAgbmV4dD8udHlwZSA9PT0gJ2Jsb2NrLW1hcCcgfHxcbiAgICAgICAgICAgIG5leHQ/LnR5cGUgPT09ICdibG9jay1zZXEnKSlcbiAgICAgICAgb25FcnJvcih0YWIsICdUQUJfQVNfSU5ERU5UJywgJ1RhYnMgYXJlIG5vdCBhbGxvd2VkIGFzIGluZGVudGF0aW9uJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29tbWEsXG4gICAgICAgIGZvdW5kLFxuICAgICAgICBzcGFjZUJlZm9yZSxcbiAgICAgICAgY29tbWVudCxcbiAgICAgICAgaGFzTmV3bGluZSxcbiAgICAgICAgYW5jaG9yLFxuICAgICAgICB0YWcsXG4gICAgICAgIG5ld2xpbmVBZnRlclByb3AsXG4gICAgICAgIGVuZCxcbiAgICAgICAgc3RhcnQ6IHN0YXJ0ID8/IGVuZFxuICAgIH07XG59XG5cbmV4cG9ydCB7IHJlc29sdmVQcm9wcyB9O1xuIiwgImZ1bmN0aW9uIGNvbnRhaW5zTmV3bGluZShrZXkpIHtcbiAgICBpZiAoIWtleSlcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgc3dpdGNoIChrZXkudHlwZSkge1xuICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgaWYgKGtleS5zb3VyY2UuaW5jbHVkZXMoJ1xcbicpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgaWYgKGtleS5lbmQpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiBrZXkuZW5kKVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3QudHlwZSA9PT0gJ25ld2xpbmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0IG9mIGtleS5pdGVtcykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgaXQuc3RhcnQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdC50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdC50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5zTmV3bGluZShpdC5rZXkpIHx8IGNvbnRhaW5zTmV3bGluZShpdC52YWx1ZSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuXG5leHBvcnQgeyBjb250YWluc05ld2xpbmUgfTtcbiIsICJpbXBvcnQgeyBjb250YWluc05ld2xpbmUgfSBmcm9tICcuL3V0aWwtY29udGFpbnMtbmV3bGluZS5qcyc7XG5cbmZ1bmN0aW9uIGZsb3dJbmRlbnRDaGVjayhpbmRlbnQsIGZjLCBvbkVycm9yKSB7XG4gICAgaWYgKGZjPy50eXBlID09PSAnZmxvdy1jb2xsZWN0aW9uJykge1xuICAgICAgICBjb25zdCBlbmQgPSBmYy5lbmRbMF07XG4gICAgICAgIGlmIChlbmQuaW5kZW50ID09PSBpbmRlbnQgJiZcbiAgICAgICAgICAgIChlbmQuc291cmNlID09PSAnXScgfHwgZW5kLnNvdXJjZSA9PT0gJ30nKSAmJlxuICAgICAgICAgICAgY29udGFpbnNOZXdsaW5lKGZjKSkge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gJ0Zsb3cgZW5kIGluZGljYXRvciBzaG91bGQgYmUgbW9yZSBpbmRlbnRlZCB0aGFuIHBhcmVudCc7XG4gICAgICAgICAgICBvbkVycm9yKGVuZCwgJ0JBRF9JTkRFTlQnLCBtc2csIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgeyBmbG93SW5kZW50Q2hlY2sgfTtcbiIsICJpbXBvcnQgeyBpc1NjYWxhciB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcblxuZnVuY3Rpb24gbWFwSW5jbHVkZXMoY3R4LCBpdGVtcywgc2VhcmNoKSB7XG4gICAgY29uc3QgeyB1bmlxdWVLZXlzIH0gPSBjdHgub3B0aW9ucztcbiAgICBpZiAodW5pcXVlS2V5cyA9PT0gZmFsc2UpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBpc0VxdWFsID0gdHlwZW9mIHVuaXF1ZUtleXMgPT09ICdmdW5jdGlvbidcbiAgICAgICAgPyB1bmlxdWVLZXlzXG4gICAgICAgIDogKGEsIGIpID0+IGEgPT09IGIgfHwgKGlzU2NhbGFyKGEpICYmIGlzU2NhbGFyKGIpICYmIGEudmFsdWUgPT09IGIudmFsdWUpO1xuICAgIHJldHVybiBpdGVtcy5zb21lKHBhaXIgPT4gaXNFcXVhbChwYWlyLmtleSwgc2VhcmNoKSk7XG59XG5cbmV4cG9ydCB7IG1hcEluY2x1ZGVzIH07XG4iLCAiaW1wb3J0IHsgUGFpciB9IGZyb20gJy4uL25vZGVzL1BhaXIuanMnO1xuaW1wb3J0IHsgWUFNTE1hcCB9IGZyb20gJy4uL25vZGVzL1lBTUxNYXAuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZVByb3BzIH0gZnJvbSAnLi9yZXNvbHZlLXByb3BzLmpzJztcbmltcG9ydCB7IGNvbnRhaW5zTmV3bGluZSB9IGZyb20gJy4vdXRpbC1jb250YWlucy1uZXdsaW5lLmpzJztcbmltcG9ydCB7IGZsb3dJbmRlbnRDaGVjayB9IGZyb20gJy4vdXRpbC1mbG93LWluZGVudC1jaGVjay5qcyc7XG5pbXBvcnQgeyBtYXBJbmNsdWRlcyB9IGZyb20gJy4vdXRpbC1tYXAtaW5jbHVkZXMuanMnO1xuXG5jb25zdCBzdGFydENvbE1zZyA9ICdBbGwgbWFwcGluZyBpdGVtcyBtdXN0IHN0YXJ0IGF0IHRoZSBzYW1lIGNvbHVtbic7XG5mdW5jdGlvbiByZXNvbHZlQmxvY2tNYXAoeyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9LCBjdHgsIGJtLCBvbkVycm9yLCB0YWcpIHtcbiAgICBjb25zdCBOb2RlQ2xhc3MgPSB0YWc/Lm5vZGVDbGFzcyA/PyBZQU1MTWFwO1xuICAgIGNvbnN0IG1hcCA9IG5ldyBOb2RlQ2xhc3MoY3R4LnNjaGVtYSk7XG4gICAgaWYgKGN0eC5hdFJvb3QpXG4gICAgICAgIGN0eC5hdFJvb3QgPSBmYWxzZTtcbiAgICBsZXQgb2Zmc2V0ID0gYm0ub2Zmc2V0O1xuICAgIGxldCBjb21tZW50RW5kID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IGNvbGxJdGVtIG9mIGJtLml0ZW1zKSB7XG4gICAgICAgIGNvbnN0IHsgc3RhcnQsIGtleSwgc2VwLCB2YWx1ZSB9ID0gY29sbEl0ZW07XG4gICAgICAgIC8vIGtleSBwcm9wZXJ0aWVzXG4gICAgICAgIGNvbnN0IGtleVByb3BzID0gcmVzb2x2ZVByb3BzKHN0YXJ0LCB7XG4gICAgICAgICAgICBpbmRpY2F0b3I6ICdleHBsaWNpdC1rZXktaW5kJyxcbiAgICAgICAgICAgIG5leHQ6IGtleSA/PyBzZXA/LlswXSxcbiAgICAgICAgICAgIG9mZnNldCxcbiAgICAgICAgICAgIG9uRXJyb3IsXG4gICAgICAgICAgICBwYXJlbnRJbmRlbnQ6IGJtLmluZGVudCxcbiAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBpbXBsaWNpdEtleSA9ICFrZXlQcm9wcy5mb3VuZDtcbiAgICAgICAgaWYgKGltcGxpY2l0S2V5KSB7XG4gICAgICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleS50eXBlID09PSAnYmxvY2stc2VxJylcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCTE9DS19BU19JTVBMSUNJVF9LRVknLCAnQSBibG9jayBzZXF1ZW5jZSBtYXkgbm90IGJlIHVzZWQgYXMgYW4gaW1wbGljaXQgbWFwIGtleScpO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCdpbmRlbnQnIGluIGtleSAmJiBrZXkuaW5kZW50ICE9PSBibS5pbmRlbnQpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkFEX0lOREVOVCcsIHN0YXJ0Q29sTXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgha2V5UHJvcHMuYW5jaG9yICYmICFrZXlQcm9wcy50YWcgJiYgIXNlcCkge1xuICAgICAgICAgICAgICAgIGNvbW1lbnRFbmQgPSBrZXlQcm9wcy5lbmQ7XG4gICAgICAgICAgICAgICAgaWYgKGtleVByb3BzLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hcC5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLmNvbW1lbnQgKz0gJ1xcbicgKyBrZXlQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuY29tbWVudCA9IGtleVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGtleVByb3BzLm5ld2xpbmVBZnRlclByb3AgfHwgY29udGFpbnNOZXdsaW5lKGtleSkpIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKGtleSA/PyBzdGFydFtzdGFydC5sZW5ndGggLSAxXSwgJ01VTFRJTElORV9JTVBMSUNJVF9LRVknLCAnSW1wbGljaXQga2V5cyBuZWVkIHRvIGJlIG9uIGEgc2luZ2xlIGxpbmUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChrZXlQcm9wcy5mb3VuZD8uaW5kZW50ICE9PSBibS5pbmRlbnQpIHtcbiAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkFEX0lOREVOVCcsIHN0YXJ0Q29sTXNnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBrZXkgdmFsdWVcbiAgICAgICAgY3R4LmF0S2V5ID0gdHJ1ZTtcbiAgICAgICAgY29uc3Qga2V5U3RhcnQgPSBrZXlQcm9wcy5lbmQ7XG4gICAgICAgIGNvbnN0IGtleU5vZGUgPSBrZXlcbiAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCBrZXksIGtleVByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwga2V5U3RhcnQsIHN0YXJ0LCBudWxsLCBrZXlQcm9wcywgb25FcnJvcik7XG4gICAgICAgIGlmIChjdHguc2NoZW1hLmNvbXBhdClcbiAgICAgICAgICAgIGZsb3dJbmRlbnRDaGVjayhibS5pbmRlbnQsIGtleSwgb25FcnJvcik7XG4gICAgICAgIGN0eC5hdEtleSA9IGZhbHNlO1xuICAgICAgICBpZiAobWFwSW5jbHVkZXMoY3R4LCBtYXAuaXRlbXMsIGtleU5vZGUpKVxuICAgICAgICAgICAgb25FcnJvcihrZXlTdGFydCwgJ0RVUExJQ0FURV9LRVknLCAnTWFwIGtleXMgbXVzdCBiZSB1bmlxdWUnKTtcbiAgICAgICAgLy8gdmFsdWUgcHJvcGVydGllc1xuICAgICAgICBjb25zdCB2YWx1ZVByb3BzID0gcmVzb2x2ZVByb3BzKHNlcCA/PyBbXSwge1xuICAgICAgICAgICAgaW5kaWNhdG9yOiAnbWFwLXZhbHVlLWluZCcsXG4gICAgICAgICAgICBuZXh0OiB2YWx1ZSxcbiAgICAgICAgICAgIG9mZnNldDoga2V5Tm9kZS5yYW5nZVsyXSxcbiAgICAgICAgICAgIG9uRXJyb3IsXG4gICAgICAgICAgICBwYXJlbnRJbmRlbnQ6IGJtLmluZGVudCxcbiAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiAha2V5IHx8IGtleS50eXBlID09PSAnYmxvY2stc2NhbGFyJ1xuICAgICAgICB9KTtcbiAgICAgICAgb2Zmc2V0ID0gdmFsdWVQcm9wcy5lbmQ7XG4gICAgICAgIGlmICh2YWx1ZVByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICBpZiAoaW1wbGljaXRLZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWU/LnR5cGUgPT09ICdibG9jay1tYXAnICYmICF2YWx1ZVByb3BzLmhhc05ld2xpbmUpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkxPQ0tfQVNfSU1QTElDSVRfS0VZJywgJ05lc3RlZCBtYXBwaW5ncyBhcmUgbm90IGFsbG93ZWQgaW4gY29tcGFjdCBtYXBwaW5ncycpO1xuICAgICAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy5zdHJpY3QgJiZcbiAgICAgICAgICAgICAgICAgICAga2V5UHJvcHMuc3RhcnQgPCB2YWx1ZVByb3BzLmZvdW5kLm9mZnNldCAtIDEwMjQpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5Tm9kZS5yYW5nZSwgJ0tFWV9PVkVSXzEwMjRfQ0hBUlMnLCAnVGhlIDogaW5kaWNhdG9yIG11c3QgYmUgYXQgbW9zdCAxMDI0IGNoYXJzIGFmdGVyIHRoZSBzdGFydCBvZiBhbiBpbXBsaWNpdCBibG9jayBtYXBwaW5nIGtleScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdmFsdWUgdmFsdWVcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlTm9kZSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIHZhbHVlLCB2YWx1ZVByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIG9mZnNldCwgc2VwLCBudWxsLCB2YWx1ZVByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlmIChjdHguc2NoZW1hLmNvbXBhdClcbiAgICAgICAgICAgICAgICBmbG93SW5kZW50Q2hlY2soYm0uaW5kZW50LCB2YWx1ZSwgb25FcnJvcik7XG4gICAgICAgICAgICBvZmZzZXQgPSB2YWx1ZU5vZGUucmFuZ2VbMl07XG4gICAgICAgICAgICBjb25zdCBwYWlyID0gbmV3IFBhaXIoa2V5Tm9kZSwgdmFsdWVOb2RlKTtcbiAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy5rZWVwU291cmNlVG9rZW5zKVxuICAgICAgICAgICAgICAgIHBhaXIuc3JjVG9rZW4gPSBjb2xsSXRlbTtcbiAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHBhaXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8ga2V5IHdpdGggbm8gdmFsdWVcbiAgICAgICAgICAgIGlmIChpbXBsaWNpdEtleSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKGtleU5vZGUucmFuZ2UsICdNSVNTSU5HX0NIQVInLCAnSW1wbGljaXQgbWFwIGtleXMgbmVlZCB0byBiZSBmb2xsb3dlZCBieSBtYXAgdmFsdWVzJyk7XG4gICAgICAgICAgICBpZiAodmFsdWVQcm9wcy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleU5vZGUuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAga2V5Tm9kZS5jb21tZW50ICs9ICdcXG4nICsgdmFsdWVQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAga2V5Tm9kZS5jb21tZW50ID0gdmFsdWVQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGFpciA9IG5ldyBQYWlyKGtleU5vZGUpO1xuICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLmtlZXBTb3VyY2VUb2tlbnMpXG4gICAgICAgICAgICAgICAgcGFpci5zcmNUb2tlbiA9IGNvbGxJdGVtO1xuICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2gocGFpcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNvbW1lbnRFbmQgJiYgY29tbWVudEVuZCA8IG9mZnNldClcbiAgICAgICAgb25FcnJvcihjb21tZW50RW5kLCAnSU1QT1NTSUJMRScsICdNYXAgY29tbWVudCB3aXRoIHRyYWlsaW5nIGNvbnRlbnQnKTtcbiAgICBtYXAucmFuZ2UgPSBbYm0ub2Zmc2V0LCBvZmZzZXQsIGNvbW1lbnRFbmQgPz8gb2Zmc2V0XTtcbiAgICByZXR1cm4gbWFwO1xufVxuXG5leHBvcnQgeyByZXNvbHZlQmxvY2tNYXAgfTtcbiIsICJpbXBvcnQgeyBZQU1MU2VxIH0gZnJvbSAnLi4vbm9kZXMvWUFNTFNlcS5qcyc7XG5pbXBvcnQgeyByZXNvbHZlUHJvcHMgfSBmcm9tICcuL3Jlc29sdmUtcHJvcHMuanMnO1xuaW1wb3J0IHsgZmxvd0luZGVudENoZWNrIH0gZnJvbSAnLi91dGlsLWZsb3ctaW5kZW50LWNoZWNrLmpzJztcblxuZnVuY3Rpb24gcmVzb2x2ZUJsb2NrU2VxKHsgY29tcG9zZU5vZGUsIGNvbXBvc2VFbXB0eU5vZGUgfSwgY3R4LCBicywgb25FcnJvciwgdGFnKSB7XG4gICAgY29uc3QgTm9kZUNsYXNzID0gdGFnPy5ub2RlQ2xhc3MgPz8gWUFNTFNlcTtcbiAgICBjb25zdCBzZXEgPSBuZXcgTm9kZUNsYXNzKGN0eC5zY2hlbWEpO1xuICAgIGlmIChjdHguYXRSb290KVxuICAgICAgICBjdHguYXRSb290ID0gZmFsc2U7XG4gICAgaWYgKGN0eC5hdEtleSlcbiAgICAgICAgY3R4LmF0S2V5ID0gZmFsc2U7XG4gICAgbGV0IG9mZnNldCA9IGJzLm9mZnNldDtcbiAgICBsZXQgY29tbWVudEVuZCA9IG51bGw7XG4gICAgZm9yIChjb25zdCB7IHN0YXJ0LCB2YWx1ZSB9IG9mIGJzLml0ZW1zKSB7XG4gICAgICAgIGNvbnN0IHByb3BzID0gcmVzb2x2ZVByb3BzKHN0YXJ0LCB7XG4gICAgICAgICAgICBpbmRpY2F0b3I6ICdzZXEtaXRlbS1pbmQnLFxuICAgICAgICAgICAgbmV4dDogdmFsdWUsXG4gICAgICAgICAgICBvZmZzZXQsXG4gICAgICAgICAgICBvbkVycm9yLFxuICAgICAgICAgICAgcGFyZW50SW5kZW50OiBicy5pbmRlbnQsXG4gICAgICAgICAgICBzdGFydE9uTmV3bGluZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFwcm9wcy5mb3VuZCkge1xuICAgICAgICAgICAgaWYgKHByb3BzLmFuY2hvciB8fCBwcm9wcy50YWcgfHwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWU/LnR5cGUgPT09ICdibG9jay1zZXEnKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLmVuZCwgJ0JBRF9JTkRFTlQnLCAnQWxsIHNlcXVlbmNlIGl0ZW1zIG11c3Qgc3RhcnQgYXQgdGhlIHNhbWUgY29sdW1uJyk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ01JU1NJTkdfQ0hBUicsICdTZXF1ZW5jZSBpdGVtIHdpdGhvdXQgLSBpbmRpY2F0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbW1lbnRFbmQgPSBwcm9wcy5lbmQ7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BzLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIHNlcS5jb21tZW50ID0gcHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBub2RlID0gdmFsdWVcbiAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCB2YWx1ZSwgcHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICA6IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBwcm9wcy5lbmQsIHN0YXJ0LCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgIGlmIChjdHguc2NoZW1hLmNvbXBhdClcbiAgICAgICAgICAgIGZsb3dJbmRlbnRDaGVjayhicy5pbmRlbnQsIHZhbHVlLCBvbkVycm9yKTtcbiAgICAgICAgb2Zmc2V0ID0gbm9kZS5yYW5nZVsyXTtcbiAgICAgICAgc2VxLml0ZW1zLnB1c2gobm9kZSk7XG4gICAgfVxuICAgIHNlcS5yYW5nZSA9IFticy5vZmZzZXQsIG9mZnNldCwgY29tbWVudEVuZCA/PyBvZmZzZXRdO1xuICAgIHJldHVybiBzZXE7XG59XG5cbmV4cG9ydCB7IHJlc29sdmVCbG9ja1NlcSB9O1xuIiwgImZ1bmN0aW9uIHJlc29sdmVFbmQoZW5kLCBvZmZzZXQsIHJlcVNwYWNlLCBvbkVycm9yKSB7XG4gICAgbGV0IGNvbW1lbnQgPSAnJztcbiAgICBpZiAoZW5kKSB7XG4gICAgICAgIGxldCBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICBsZXQgc2VwID0gJyc7XG4gICAgICAgIGZvciAoY29uc3QgdG9rZW4gb2YgZW5kKSB7XG4gICAgICAgICAgICBjb25zdCB7IHNvdXJjZSwgdHlwZSB9ID0gdG9rZW47XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcVNwYWNlICYmICFoYXNTcGFjZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdNSVNTSU5HX0NIQVInLCAnQ29tbWVudHMgbXVzdCBiZSBzZXBhcmF0ZWQgZnJvbSBvdGhlciB0b2tlbnMgYnkgd2hpdGUgc3BhY2UgY2hhcmFjdGVycycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYiA9IHNvdXJjZS5zdWJzdHJpbmcoMSkgfHwgJyAnO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tZW50ID0gY2I7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgKz0gc2VwICsgY2I7XG4gICAgICAgICAgICAgICAgICAgIHNlcCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21tZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VwICs9IHNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICR7dHlwZX0gYXQgbm9kZSBlbmRgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9mZnNldCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IGNvbW1lbnQsIG9mZnNldCB9O1xufVxuXG5leHBvcnQgeyByZXNvbHZlRW5kIH07XG4iLCAiaW1wb3J0IHsgaXNQYWlyIH0gZnJvbSAnLi4vbm9kZXMvaWRlbnRpdHkuanMnO1xuaW1wb3J0IHsgUGFpciB9IGZyb20gJy4uL25vZGVzL1BhaXIuanMnO1xuaW1wb3J0IHsgWUFNTE1hcCB9IGZyb20gJy4uL25vZGVzL1lBTUxNYXAuanMnO1xuaW1wb3J0IHsgWUFNTFNlcSB9IGZyb20gJy4uL25vZGVzL1lBTUxTZXEuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUVuZCB9IGZyb20gJy4vcmVzb2x2ZS1lbmQuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZVByb3BzIH0gZnJvbSAnLi9yZXNvbHZlLXByb3BzLmpzJztcbmltcG9ydCB7IGNvbnRhaW5zTmV3bGluZSB9IGZyb20gJy4vdXRpbC1jb250YWlucy1uZXdsaW5lLmpzJztcbmltcG9ydCB7IG1hcEluY2x1ZGVzIH0gZnJvbSAnLi91dGlsLW1hcC1pbmNsdWRlcy5qcyc7XG5cbmNvbnN0IGJsb2NrTXNnID0gJ0Jsb2NrIGNvbGxlY3Rpb25zIGFyZSBub3QgYWxsb3dlZCB3aXRoaW4gZmxvdyBjb2xsZWN0aW9ucyc7XG5jb25zdCBpc0Jsb2NrID0gKHRva2VuKSA9PiB0b2tlbiAmJiAodG9rZW4udHlwZSA9PT0gJ2Jsb2NrLW1hcCcgfHwgdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNlcScpO1xuZnVuY3Rpb24gcmVzb2x2ZUZsb3dDb2xsZWN0aW9uKHsgY29tcG9zZU5vZGUsIGNvbXBvc2VFbXB0eU5vZGUgfSwgY3R4LCBmYywgb25FcnJvciwgdGFnKSB7XG4gICAgY29uc3QgaXNNYXAgPSBmYy5zdGFydC5zb3VyY2UgPT09ICd7JztcbiAgICBjb25zdCBmY05hbWUgPSBpc01hcCA/ICdmbG93IG1hcCcgOiAnZmxvdyBzZXF1ZW5jZSc7XG4gICAgY29uc3QgTm9kZUNsYXNzID0gKHRhZz8ubm9kZUNsYXNzID8/IChpc01hcCA/IFlBTUxNYXAgOiBZQU1MU2VxKSk7XG4gICAgY29uc3QgY29sbCA9IG5ldyBOb2RlQ2xhc3MoY3R4LnNjaGVtYSk7XG4gICAgY29sbC5mbG93ID0gdHJ1ZTtcbiAgICBjb25zdCBhdFJvb3QgPSBjdHguYXRSb290O1xuICAgIGlmIChhdFJvb3QpXG4gICAgICAgIGN0eC5hdFJvb3QgPSBmYWxzZTtcbiAgICBpZiAoY3R4LmF0S2V5KVxuICAgICAgICBjdHguYXRLZXkgPSBmYWxzZTtcbiAgICBsZXQgb2Zmc2V0ID0gZmMub2Zmc2V0ICsgZmMuc3RhcnQuc291cmNlLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZjLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGNvbGxJdGVtID0gZmMuaXRlbXNbaV07XG4gICAgICAgIGNvbnN0IHsgc3RhcnQsIGtleSwgc2VwLCB2YWx1ZSB9ID0gY29sbEl0ZW07XG4gICAgICAgIGNvbnN0IHByb3BzID0gcmVzb2x2ZVByb3BzKHN0YXJ0LCB7XG4gICAgICAgICAgICBmbG93OiBmY05hbWUsXG4gICAgICAgICAgICBpbmRpY2F0b3I6ICdleHBsaWNpdC1rZXktaW5kJyxcbiAgICAgICAgICAgIG5leHQ6IGtleSA/PyBzZXA/LlswXSxcbiAgICAgICAgICAgIG9mZnNldCxcbiAgICAgICAgICAgIG9uRXJyb3IsXG4gICAgICAgICAgICBwYXJlbnRJbmRlbnQ6IGZjLmluZGVudCxcbiAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFwcm9wcy5mb3VuZCkge1xuICAgICAgICAgICAgaWYgKCFwcm9wcy5hbmNob3IgJiYgIXByb3BzLnRhZyAmJiAhc2VwICYmICF2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChpID09PSAwICYmIHByb3BzLmNvbW1hKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLmNvbW1hLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICwgaW4gJHtmY05hbWV9YCk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaSA8IGZjLml0ZW1zLmxlbmd0aCAtIDEpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuc3RhcnQsICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgZW1wdHkgaXRlbSBpbiAke2ZjTmFtZX1gKTtcbiAgICAgICAgICAgICAgICBpZiAocHJvcHMuY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29sbC5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbC5jb21tZW50ICs9ICdcXG4nICsgcHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbC5jb21tZW50ID0gcHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gcHJvcHMuZW5kO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc01hcCAmJiBjdHgub3B0aW9ucy5zdHJpY3QgJiYgY29udGFpbnNOZXdsaW5lKGtleSkpXG4gICAgICAgICAgICAgICAgb25FcnJvcihrZXksIC8vIGNoZWNrZWQgYnkgY29udGFpbnNOZXdsaW5lKClcbiAgICAgICAgICAgICAgICAnTVVMVElMSU5FX0lNUExJQ0lUX0tFWScsICdJbXBsaWNpdCBrZXlzIG9mIGZsb3cgc2VxdWVuY2UgcGFpcnMgbmVlZCB0byBiZSBvbiBhIHNpbmdsZSBsaW5lJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgIGlmIChwcm9wcy5jb21tYSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLmNvbW1hLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICwgaW4gJHtmY05hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXByb3BzLmNvbW1hKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuc3RhcnQsICdNSVNTSU5HX0NIQVInLCBgTWlzc2luZyAsIGJldHdlZW4gJHtmY05hbWV9IGl0ZW1zYCk7XG4gICAgICAgICAgICBpZiAocHJvcHMuY29tbWVudCkge1xuICAgICAgICAgICAgICAgIGxldCBwcmV2SXRlbUNvbW1lbnQgPSAnJztcbiAgICAgICAgICAgICAgICBsb29wOiBmb3IgKGNvbnN0IHN0IG9mIHN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoc3QudHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tbWEnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldkl0ZW1Db21tZW50ID0gc3Quc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhayBsb29wO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhayBsb29wO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwcmV2SXRlbUNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByZXYgPSBjb2xsLml0ZW1zW2NvbGwuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1BhaXIocHJldikpXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2ID0gcHJldi52YWx1ZSA/PyBwcmV2LmtleTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXYuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXYuY29tbWVudCArPSAnXFxuJyArIHByZXZJdGVtQ29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldi5jb21tZW50ID0gcHJldkl0ZW1Db21tZW50O1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5jb21tZW50ID0gcHJvcHMuY29tbWVudC5zdWJzdHJpbmcocHJldkl0ZW1Db21tZW50Lmxlbmd0aCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzTWFwICYmICFzZXAgJiYgIXByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICAvLyBpdGVtIGlzIGEgdmFsdWUgaW4gYSBzZXFcbiAgICAgICAgICAgIC8vIFx1MjE5MiBrZXkgJiBzZXAgYXJlIGVtcHR5LCBzdGFydCBkb2VzIG5vdCBpbmNsdWRlID8gb3IgOlxuICAgICAgICAgICAgY29uc3QgdmFsdWVOb2RlID0gdmFsdWVcbiAgICAgICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIHByb3BzLmVuZCwgc2VwLCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgICAgICBjb2xsLml0ZW1zLnB1c2godmFsdWVOb2RlKTtcbiAgICAgICAgICAgIG9mZnNldCA9IHZhbHVlTm9kZS5yYW5nZVsyXTtcbiAgICAgICAgICAgIGlmIChpc0Jsb2NrKHZhbHVlKSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlTm9kZS5yYW5nZSwgJ0JMT0NLX0lOX0ZMT1cnLCBibG9ja01zZyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBpdGVtIGlzIGEga2V5K3ZhbHVlIHBhaXJcbiAgICAgICAgICAgIC8vIGtleSB2YWx1ZVxuICAgICAgICAgICAgY3R4LmF0S2V5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGtleVN0YXJ0ID0gcHJvcHMuZW5kO1xuICAgICAgICAgICAgY29uc3Qga2V5Tm9kZSA9IGtleVxuICAgICAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCBrZXksIHByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIGtleVN0YXJ0LCBzdGFydCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGlzQmxvY2soa2V5KSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKGtleU5vZGUucmFuZ2UsICdCTE9DS19JTl9GTE9XJywgYmxvY2tNc2cpO1xuICAgICAgICAgICAgY3R4LmF0S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAvLyB2YWx1ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBjb25zdCB2YWx1ZVByb3BzID0gcmVzb2x2ZVByb3BzKHNlcCA/PyBbXSwge1xuICAgICAgICAgICAgICAgIGZsb3c6IGZjTmFtZSxcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3I6ICdtYXAtdmFsdWUtaW5kJyxcbiAgICAgICAgICAgICAgICBuZXh0OiB2YWx1ZSxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IGtleU5vZGUucmFuZ2VbMl0sXG4gICAgICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgICAgICBwYXJlbnRJbmRlbnQ6IGZjLmluZGVudCxcbiAgICAgICAgICAgICAgICBzdGFydE9uTmV3bGluZTogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHZhbHVlUHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzTWFwICYmICFwcm9wcy5mb3VuZCAmJiBjdHgub3B0aW9ucy5zdHJpY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2Ygc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ID09PSB2YWx1ZVByb3BzLmZvdW5kKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3QudHlwZSA9PT0gJ25ld2xpbmUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3Ioc3QsICdNVUxUSUxJTkVfSU1QTElDSVRfS0VZJywgJ0ltcGxpY2l0IGtleXMgb2YgZmxvdyBzZXF1ZW5jZSBwYWlycyBuZWVkIHRvIGJlIG9uIGEgc2luZ2xlIGxpbmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcHMuc3RhcnQgPCB2YWx1ZVByb3BzLmZvdW5kLm9mZnNldCAtIDEwMjQpXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlUHJvcHMuZm91bmQsICdLRVlfT1ZFUl8xMDI0X0NIQVJTJywgJ1RoZSA6IGluZGljYXRvciBtdXN0IGJlIGF0IG1vc3QgMTAyNCBjaGFycyBhZnRlciB0aGUgc3RhcnQgb2YgYW4gaW1wbGljaXQgZmxvdyBzZXF1ZW5jZSBrZXknKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICgnc291cmNlJyBpbiB2YWx1ZSAmJiB2YWx1ZS5zb3VyY2U/LlswXSA9PT0gJzonKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlLCAnTUlTU0lOR19DSEFSJywgYE1pc3Npbmcgc3BhY2UgYWZ0ZXIgOiBpbiAke2ZjTmFtZX1gKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodmFsdWVQcm9wcy5zdGFydCwgJ01JU1NJTkdfQ0hBUicsIGBNaXNzaW5nICwgb3IgOiBiZXR3ZWVuICR7ZmNOYW1lfSBpdGVtc2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdmFsdWUgdmFsdWVcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlTm9kZSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIHZhbHVlLCB2YWx1ZVByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgIDogdmFsdWVQcm9wcy5mb3VuZFxuICAgICAgICAgICAgICAgICAgICA/IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCB2YWx1ZVByb3BzLmVuZCwgc2VwLCBudWxsLCB2YWx1ZVByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgICAgICA6IG51bGw7XG4gICAgICAgICAgICBpZiAodmFsdWVOb2RlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzQmxvY2sodmFsdWUpKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlTm9kZS5yYW5nZSwgJ0JMT0NLX0lOX0ZMT1cnLCBibG9ja01zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZVByb3BzLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5Tm9kZS5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBrZXlOb2RlLmNvbW1lbnQgKz0gJ1xcbicgKyB2YWx1ZVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBrZXlOb2RlLmNvbW1lbnQgPSB2YWx1ZVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwYWlyID0gbmV3IFBhaXIoa2V5Tm9kZSwgdmFsdWVOb2RlKTtcbiAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy5rZWVwU291cmNlVG9rZW5zKVxuICAgICAgICAgICAgICAgIHBhaXIuc3JjVG9rZW4gPSBjb2xsSXRlbTtcbiAgICAgICAgICAgIGlmIChpc01hcCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IGNvbGw7XG4gICAgICAgICAgICAgICAgaWYgKG1hcEluY2x1ZGVzKGN0eCwgbWFwLml0ZW1zLCBrZXlOb2RlKSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihrZXlTdGFydCwgJ0RVUExJQ0FURV9LRVknLCAnTWFwIGtleXMgbXVzdCBiZSB1bmlxdWUnKTtcbiAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaChwYWlyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IG5ldyBZQU1MTWFwKGN0eC5zY2hlbWEpO1xuICAgICAgICAgICAgICAgIG1hcC5mbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaChwYWlyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmRSYW5nZSA9ICh2YWx1ZU5vZGUgPz8ga2V5Tm9kZSkucmFuZ2U7XG4gICAgICAgICAgICAgICAgbWFwLnJhbmdlID0gW2tleU5vZGUucmFuZ2VbMF0sIGVuZFJhbmdlWzFdLCBlbmRSYW5nZVsyXV07XG4gICAgICAgICAgICAgICAgY29sbC5pdGVtcy5wdXNoKG1hcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvZmZzZXQgPSB2YWx1ZU5vZGUgPyB2YWx1ZU5vZGUucmFuZ2VbMl0gOiB2YWx1ZVByb3BzLmVuZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBleHBlY3RlZEVuZCA9IGlzTWFwID8gJ30nIDogJ10nO1xuICAgIGNvbnN0IFtjZSwgLi4uZWVdID0gZmMuZW5kO1xuICAgIGxldCBjZVBvcyA9IG9mZnNldDtcbiAgICBpZiAoY2U/LnNvdXJjZSA9PT0gZXhwZWN0ZWRFbmQpXG4gICAgICAgIGNlUG9zID0gY2Uub2Zmc2V0ICsgY2Uuc291cmNlLmxlbmd0aDtcbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGZjTmFtZVswXS50b1VwcGVyQ2FzZSgpICsgZmNOYW1lLnN1YnN0cmluZygxKTtcbiAgICAgICAgY29uc3QgbXNnID0gYXRSb290XG4gICAgICAgICAgICA/IGAke25hbWV9IG11c3QgZW5kIHdpdGggYSAke2V4cGVjdGVkRW5kfWBcbiAgICAgICAgICAgIDogYCR7bmFtZX0gaW4gYmxvY2sgY29sbGVjdGlvbiBtdXN0IGJlIHN1ZmZpY2llbnRseSBpbmRlbnRlZCBhbmQgZW5kIHdpdGggYSAke2V4cGVjdGVkRW5kfWA7XG4gICAgICAgIG9uRXJyb3Iob2Zmc2V0LCBhdFJvb3QgPyAnTUlTU0lOR19DSEFSJyA6ICdCQURfSU5ERU5UJywgbXNnKTtcbiAgICAgICAgaWYgKGNlICYmIGNlLnNvdXJjZS5sZW5ndGggIT09IDEpXG4gICAgICAgICAgICBlZS51bnNoaWZ0KGNlKTtcbiAgICB9XG4gICAgaWYgKGVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgZW5kID0gcmVzb2x2ZUVuZChlZSwgY2VQb3MsIGN0eC5vcHRpb25zLnN0cmljdCwgb25FcnJvcik7XG4gICAgICAgIGlmIChlbmQuY29tbWVudCkge1xuICAgICAgICAgICAgaWYgKGNvbGwuY29tbWVudClcbiAgICAgICAgICAgICAgICBjb2xsLmNvbW1lbnQgKz0gJ1xcbicgKyBlbmQuY29tbWVudDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb2xsLmNvbW1lbnQgPSBlbmQuY29tbWVudDtcbiAgICAgICAgfVxuICAgICAgICBjb2xsLnJhbmdlID0gW2ZjLm9mZnNldCwgY2VQb3MsIGVuZC5vZmZzZXRdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29sbC5yYW5nZSA9IFtmYy5vZmZzZXQsIGNlUG9zLCBjZVBvc107XG4gICAgfVxuICAgIHJldHVybiBjb2xsO1xufVxuXG5leHBvcnQgeyByZXNvbHZlRmxvd0NvbGxlY3Rpb24gfTtcbiIsICJpbXBvcnQgeyBpc05vZGUgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBTY2FsYXIgfSBmcm9tICcuLi9ub2Rlcy9TY2FsYXIuanMnO1xuaW1wb3J0IHsgWUFNTE1hcCB9IGZyb20gJy4uL25vZGVzL1lBTUxNYXAuanMnO1xuaW1wb3J0IHsgWUFNTFNlcSB9IGZyb20gJy4uL25vZGVzL1lBTUxTZXEuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUJsb2NrTWFwIH0gZnJvbSAnLi9yZXNvbHZlLWJsb2NrLW1hcC5qcyc7XG5pbXBvcnQgeyByZXNvbHZlQmxvY2tTZXEgfSBmcm9tICcuL3Jlc29sdmUtYmxvY2stc2VxLmpzJztcbmltcG9ydCB7IHJlc29sdmVGbG93Q29sbGVjdGlvbiB9IGZyb20gJy4vcmVzb2x2ZS1mbG93LWNvbGxlY3Rpb24uanMnO1xuXG5mdW5jdGlvbiByZXNvbHZlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnTmFtZSwgdGFnKSB7XG4gICAgY29uc3QgY29sbCA9IHRva2VuLnR5cGUgPT09ICdibG9jay1tYXAnXG4gICAgICAgID8gcmVzb2x2ZUJsb2NrTWFwKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWcpXG4gICAgICAgIDogdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNlcSdcbiAgICAgICAgICAgID8gcmVzb2x2ZUJsb2NrU2VxKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWcpXG4gICAgICAgICAgICA6IHJlc29sdmVGbG93Q29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnKTtcbiAgICBjb25zdCBDb2xsID0gY29sbC5jb25zdHJ1Y3RvcjtcbiAgICAvLyBJZiB3ZSBnb3QgYSB0YWdOYW1lIG1hdGNoaW5nIHRoZSBjbGFzcywgb3IgdGhlIHRhZyBuYW1lIGlzICchJyxcbiAgICAvLyB0aGVuIHVzZSB0aGUgdGFnTmFtZSBmcm9tIHRoZSBub2RlIGNsYXNzIHVzZWQgdG8gY3JlYXRlIGl0LlxuICAgIGlmICh0YWdOYW1lID09PSAnIScgfHwgdGFnTmFtZSA9PT0gQ29sbC50YWdOYW1lKSB7XG4gICAgICAgIGNvbGwudGFnID0gQ29sbC50YWdOYW1lO1xuICAgICAgICByZXR1cm4gY29sbDtcbiAgICB9XG4gICAgaWYgKHRhZ05hbWUpXG4gICAgICAgIGNvbGwudGFnID0gdGFnTmFtZTtcbiAgICByZXR1cm4gY29sbDtcbn1cbmZ1bmN0aW9uIGNvbXBvc2VDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBwcm9wcywgb25FcnJvcikge1xuICAgIGNvbnN0IHRhZ1Rva2VuID0gcHJvcHMudGFnO1xuICAgIGNvbnN0IHRhZ05hbWUgPSAhdGFnVG9rZW5cbiAgICAgICAgPyBudWxsXG4gICAgICAgIDogY3R4LmRpcmVjdGl2ZXMudGFnTmFtZSh0YWdUb2tlbi5zb3VyY2UsIG1zZyA9PiBvbkVycm9yKHRhZ1Rva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKSk7XG4gICAgaWYgKHRva2VuLnR5cGUgPT09ICdibG9jay1zZXEnKSB7XG4gICAgICAgIGNvbnN0IHsgYW5jaG9yLCBuZXdsaW5lQWZ0ZXJQcm9wOiBubCB9ID0gcHJvcHM7XG4gICAgICAgIGNvbnN0IGxhc3RQcm9wID0gYW5jaG9yICYmIHRhZ1Rva2VuXG4gICAgICAgICAgICA/IGFuY2hvci5vZmZzZXQgPiB0YWdUb2tlbi5vZmZzZXRcbiAgICAgICAgICAgICAgICA/IGFuY2hvclxuICAgICAgICAgICAgICAgIDogdGFnVG9rZW5cbiAgICAgICAgICAgIDogKGFuY2hvciA/PyB0YWdUb2tlbik7XG4gICAgICAgIGlmIChsYXN0UHJvcCAmJiAoIW5sIHx8IG5sLm9mZnNldCA8IGxhc3RQcm9wLm9mZnNldCkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnTWlzc2luZyBuZXdsaW5lIGFmdGVyIGJsb2NrIHNlcXVlbmNlIHByb3BzJztcbiAgICAgICAgICAgIG9uRXJyb3IobGFzdFByb3AsICdNSVNTSU5HX0NIQVInLCBtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBleHBUeXBlID0gdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLW1hcCdcbiAgICAgICAgPyAnbWFwJ1xuICAgICAgICA6IHRva2VuLnR5cGUgPT09ICdibG9jay1zZXEnXG4gICAgICAgICAgICA/ICdzZXEnXG4gICAgICAgICAgICA6IHRva2VuLnN0YXJ0LnNvdXJjZSA9PT0gJ3snXG4gICAgICAgICAgICAgICAgPyAnbWFwJ1xuICAgICAgICAgICAgICAgIDogJ3NlcSc7XG4gICAgLy8gc2hvcnRjdXQ6IGNoZWNrIGlmIGl0J3MgYSBnZW5lcmljIFlBTUxNYXAgb3IgWUFNTFNlcVxuICAgIC8vIGJlZm9yZSBqdW1waW5nIGludG8gdGhlIGN1c3RvbSB0YWcgbG9naWMuXG4gICAgaWYgKCF0YWdUb2tlbiB8fFxuICAgICAgICAhdGFnTmFtZSB8fFxuICAgICAgICB0YWdOYW1lID09PSAnIScgfHxcbiAgICAgICAgKHRhZ05hbWUgPT09IFlBTUxNYXAudGFnTmFtZSAmJiBleHBUeXBlID09PSAnbWFwJykgfHxcbiAgICAgICAgKHRhZ05hbWUgPT09IFlBTUxTZXEudGFnTmFtZSAmJiBleHBUeXBlID09PSAnc2VxJykpIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmVDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWdOYW1lKTtcbiAgICB9XG4gICAgbGV0IHRhZyA9IGN0eC5zY2hlbWEudGFncy5maW5kKHQgPT4gdC50YWcgPT09IHRhZ05hbWUgJiYgdC5jb2xsZWN0aW9uID09PSBleHBUeXBlKTtcbiAgICBpZiAoIXRhZykge1xuICAgICAgICBjb25zdCBrdCA9IGN0eC5zY2hlbWEua25vd25UYWdzW3RhZ05hbWVdO1xuICAgICAgICBpZiAoa3Q/LmNvbGxlY3Rpb24gPT09IGV4cFR5cGUpIHtcbiAgICAgICAgICAgIGN0eC5zY2hlbWEudGFncy5wdXNoKE9iamVjdC5hc3NpZ24oe30sIGt0LCB7IGRlZmF1bHQ6IGZhbHNlIH0pKTtcbiAgICAgICAgICAgIHRhZyA9IGt0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGt0KSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0YWdUb2tlbiwgJ0JBRF9DT0xMRUNUSU9OX1RZUEUnLCBgJHtrdC50YWd9IHVzZWQgZm9yICR7ZXhwVHlwZX0gY29sbGVjdGlvbiwgYnV0IGV4cGVjdHMgJHtrdC5jb2xsZWN0aW9uID8/ICdzY2FsYXInfWAsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIGBVbnJlc29sdmVkIHRhZzogJHt0YWdOYW1lfWAsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWdOYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBjb2xsID0gcmVzb2x2ZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZ05hbWUsIHRhZyk7XG4gICAgY29uc3QgcmVzID0gdGFnLnJlc29sdmU/Lihjb2xsLCBtc2cgPT4gb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZyksIGN0eC5vcHRpb25zKSA/PyBjb2xsO1xuICAgIGNvbnN0IG5vZGUgPSBpc05vZGUocmVzKVxuICAgICAgICA/IHJlc1xuICAgICAgICA6IG5ldyBTY2FsYXIocmVzKTtcbiAgICBub2RlLnJhbmdlID0gY29sbC5yYW5nZTtcbiAgICBub2RlLnRhZyA9IHRhZ05hbWU7XG4gICAgaWYgKHRhZz8uZm9ybWF0KVxuICAgICAgICBub2RlLmZvcm1hdCA9IHRhZy5mb3JtYXQ7XG4gICAgcmV0dXJuIG5vZGU7XG59XG5cbmV4cG9ydCB7IGNvbXBvc2VDb2xsZWN0aW9uIH07XG4iLCAiaW1wb3J0IHsgU2NhbGFyIH0gZnJvbSAnLi4vbm9kZXMvU2NhbGFyLmpzJztcblxuZnVuY3Rpb24gcmVzb2x2ZUJsb2NrU2NhbGFyKGN0eCwgc2NhbGFyLCBvbkVycm9yKSB7XG4gICAgY29uc3Qgc3RhcnQgPSBzY2FsYXIub2Zmc2V0O1xuICAgIGNvbnN0IGhlYWRlciA9IHBhcnNlQmxvY2tTY2FsYXJIZWFkZXIoc2NhbGFyLCBjdHgub3B0aW9ucy5zdHJpY3QsIG9uRXJyb3IpO1xuICAgIGlmICghaGVhZGVyKVxuICAgICAgICByZXR1cm4geyB2YWx1ZTogJycsIHR5cGU6IG51bGwsIGNvbW1lbnQ6ICcnLCByYW5nZTogW3N0YXJ0LCBzdGFydCwgc3RhcnRdIH07XG4gICAgY29uc3QgdHlwZSA9IGhlYWRlci5tb2RlID09PSAnPicgPyBTY2FsYXIuQkxPQ0tfRk9MREVEIDogU2NhbGFyLkJMT0NLX0xJVEVSQUw7XG4gICAgY29uc3QgbGluZXMgPSBzY2FsYXIuc291cmNlID8gc3BsaXRMaW5lcyhzY2FsYXIuc291cmNlKSA6IFtdO1xuICAgIC8vIGRldGVybWluZSB0aGUgZW5kIG9mIGNvbnRlbnQgJiBzdGFydCBvZiBjaG9tcGluZ1xuICAgIGxldCBjaG9tcFN0YXJ0ID0gbGluZXMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSBsaW5lcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gbGluZXNbaV1bMV07XG4gICAgICAgIGlmIChjb250ZW50ID09PSAnJyB8fCBjb250ZW50ID09PSAnXFxyJylcbiAgICAgICAgICAgIGNob21wU3RhcnQgPSBpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgLy8gc2hvcnRjdXQgZm9yIGVtcHR5IGNvbnRlbnRzXG4gICAgaWYgKGNob21wU3RhcnQgPT09IDApIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBoZWFkZXIuY2hvbXAgPT09ICcrJyAmJiBsaW5lcy5sZW5ndGggPiAwXG4gICAgICAgICAgICA/ICdcXG4nLnJlcGVhdChNYXRoLm1heCgxLCBsaW5lcy5sZW5ndGggLSAxKSlcbiAgICAgICAgICAgIDogJyc7XG4gICAgICAgIGxldCBlbmQgPSBzdGFydCArIGhlYWRlci5sZW5ndGg7XG4gICAgICAgIGlmIChzY2FsYXIuc291cmNlKVxuICAgICAgICAgICAgZW5kICs9IHNjYWxhci5zb3VyY2UubGVuZ3RoO1xuICAgICAgICByZXR1cm4geyB2YWx1ZSwgdHlwZSwgY29tbWVudDogaGVhZGVyLmNvbW1lbnQsIHJhbmdlOiBbc3RhcnQsIGVuZCwgZW5kXSB9O1xuICAgIH1cbiAgICAvLyBmaW5kIHRoZSBpbmRlbnRhdGlvbiBsZXZlbCB0byB0cmltIGZyb20gc3RhcnRcbiAgICBsZXQgdHJpbUluZGVudCA9IHNjYWxhci5pbmRlbnQgKyBoZWFkZXIuaW5kZW50O1xuICAgIGxldCBvZmZzZXQgPSBzY2FsYXIub2Zmc2V0ICsgaGVhZGVyLmxlbmd0aDtcbiAgICBsZXQgY29udGVudFN0YXJ0ID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNob21wU3RhcnQ7ICsraSkge1xuICAgICAgICBjb25zdCBbaW5kZW50LCBjb250ZW50XSA9IGxpbmVzW2ldO1xuICAgICAgICBpZiAoY29udGVudCA9PT0gJycgfHwgY29udGVudCA9PT0gJ1xccicpIHtcbiAgICAgICAgICAgIGlmIChoZWFkZXIuaW5kZW50ID09PSAwICYmIGluZGVudC5sZW5ndGggPiB0cmltSW5kZW50KVxuICAgICAgICAgICAgICAgIHRyaW1JbmRlbnQgPSBpbmRlbnQubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGluZGVudC5sZW5ndGggPCB0cmltSW5kZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdCbG9jayBzY2FsYXJzIHdpdGggbW9yZS1pbmRlbnRlZCBsZWFkaW5nIGVtcHR5IGxpbmVzIG11c3QgdXNlIGFuIGV4cGxpY2l0IGluZGVudGF0aW9uIGluZGljYXRvcic7XG4gICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQgKyBpbmRlbnQubGVuZ3RoLCAnTUlTU0lOR19DSEFSJywgbWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaGVhZGVyLmluZGVudCA9PT0gMClcbiAgICAgICAgICAgICAgICB0cmltSW5kZW50ID0gaW5kZW50Lmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnRlbnRTdGFydCA9IGk7XG4gICAgICAgICAgICBpZiAodHJpbUluZGVudCA9PT0gMCAmJiAhY3R4LmF0Um9vdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnQmxvY2sgc2NhbGFyIHZhbHVlcyBpbiBjb2xsZWN0aW9ucyBtdXN0IGJlIGluZGVudGVkJztcbiAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JBRF9JTkRFTlQnLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG9mZnNldCArPSBpbmRlbnQubGVuZ3RoICsgY29udGVudC5sZW5ndGggKyAxO1xuICAgIH1cbiAgICAvLyBpbmNsdWRlIHRyYWlsaW5nIG1vcmUtaW5kZW50ZWQgZW1wdHkgbGluZXMgaW4gY29udGVudFxuICAgIGZvciAobGV0IGkgPSBsaW5lcy5sZW5ndGggLSAxOyBpID49IGNob21wU3RhcnQ7IC0taSkge1xuICAgICAgICBpZiAobGluZXNbaV1bMF0ubGVuZ3RoID4gdHJpbUluZGVudClcbiAgICAgICAgICAgIGNob21wU3RhcnQgPSBpICsgMTtcbiAgICB9XG4gICAgbGV0IHZhbHVlID0gJyc7XG4gICAgbGV0IHNlcCA9ICcnO1xuICAgIGxldCBwcmV2TW9yZUluZGVudGVkID0gZmFsc2U7XG4gICAgLy8gbGVhZGluZyB3aGl0ZXNwYWNlIGlzIGtlcHQgaW50YWN0XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb250ZW50U3RhcnQ7ICsraSlcbiAgICAgICAgdmFsdWUgKz0gbGluZXNbaV1bMF0uc2xpY2UodHJpbUluZGVudCkgKyAnXFxuJztcbiAgICBmb3IgKGxldCBpID0gY29udGVudFN0YXJ0OyBpIDwgY2hvbXBTdGFydDsgKytpKSB7XG4gICAgICAgIGxldCBbaW5kZW50LCBjb250ZW50XSA9IGxpbmVzW2ldO1xuICAgICAgICBvZmZzZXQgKz0gaW5kZW50Lmxlbmd0aCArIGNvbnRlbnQubGVuZ3RoICsgMTtcbiAgICAgICAgY29uc3QgY3JsZiA9IGNvbnRlbnRbY29udGVudC5sZW5ndGggLSAxXSA9PT0gJ1xccic7XG4gICAgICAgIGlmIChjcmxmKVxuICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMCwgLTEpO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgYWxyZWFkeSBjYXVnaHQgaW4gbGV4ZXIgKi9cbiAgICAgICAgaWYgKGNvbnRlbnQgJiYgaW5kZW50Lmxlbmd0aCA8IHRyaW1JbmRlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNyYyA9IGhlYWRlci5pbmRlbnRcbiAgICAgICAgICAgICAgICA/ICdleHBsaWNpdCBpbmRlbnRhdGlvbiBpbmRpY2F0b3InXG4gICAgICAgICAgICAgICAgOiAnZmlyc3QgbGluZSc7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gYEJsb2NrIHNjYWxhciBsaW5lcyBtdXN0IG5vdCBiZSBsZXNzIGluZGVudGVkIHRoYW4gdGhlaXIgJHtzcmN9YDtcbiAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0IC0gY29udGVudC5sZW5ndGggLSAoY3JsZiA/IDIgOiAxKSwgJ0JBRF9JTkRFTlQnLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIGluZGVudCA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlID09PSBTY2FsYXIuQkxPQ0tfTElURVJBTCkge1xuICAgICAgICAgICAgdmFsdWUgKz0gc2VwICsgaW5kZW50LnNsaWNlKHRyaW1JbmRlbnQpICsgY29udGVudDtcbiAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGluZGVudC5sZW5ndGggPiB0cmltSW5kZW50IHx8IGNvbnRlbnRbMF0gPT09ICdcXHQnKSB7XG4gICAgICAgICAgICAvLyBtb3JlLWluZGVudGVkIGNvbnRlbnQgd2l0aGluIGEgZm9sZGVkIGJsb2NrXG4gICAgICAgICAgICBpZiAoc2VwID09PSAnICcpXG4gICAgICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgICAgICBlbHNlIGlmICghcHJldk1vcmVJbmRlbnRlZCAmJiBzZXAgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIHNlcCA9ICdcXG5cXG4nO1xuICAgICAgICAgICAgdmFsdWUgKz0gc2VwICsgaW5kZW50LnNsaWNlKHRyaW1JbmRlbnQpICsgY29udGVudDtcbiAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICAgICAgcHJldk1vcmVJbmRlbnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY29udGVudCA9PT0gJycpIHtcbiAgICAgICAgICAgIC8vIGVtcHR5IGxpbmVcbiAgICAgICAgICAgIGlmIChzZXAgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIHZhbHVlICs9ICdcXG4nO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgKz0gc2VwICsgY29udGVudDtcbiAgICAgICAgICAgIHNlcCA9ICcgJztcbiAgICAgICAgICAgIHByZXZNb3JlSW5kZW50ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzd2l0Y2ggKGhlYWRlci5jaG9tcCkge1xuICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaG9tcFN0YXJ0OyBpIDwgbGluZXMubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gJ1xcbicgKyBsaW5lc1tpXVswXS5zbGljZSh0cmltSW5kZW50KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZVt2YWx1ZS5sZW5ndGggLSAxXSAhPT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gJ1xcbic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHZhbHVlICs9ICdcXG4nO1xuICAgIH1cbiAgICBjb25zdCBlbmQgPSBzdGFydCArIGhlYWRlci5sZW5ndGggKyBzY2FsYXIuc291cmNlLmxlbmd0aDtcbiAgICByZXR1cm4geyB2YWx1ZSwgdHlwZSwgY29tbWVudDogaGVhZGVyLmNvbW1lbnQsIHJhbmdlOiBbc3RhcnQsIGVuZCwgZW5kXSB9O1xufVxuZnVuY3Rpb24gcGFyc2VCbG9ja1NjYWxhckhlYWRlcih7IG9mZnNldCwgcHJvcHMgfSwgc3RyaWN0LCBvbkVycm9yKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmIHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgaWYgKHByb3BzWzBdLnR5cGUgIT09ICdibG9jay1zY2FsYXItaGVhZGVyJykge1xuICAgICAgICBvbkVycm9yKHByb3BzWzBdLCAnSU1QT1NTSUJMRScsICdCbG9jayBzY2FsYXIgaGVhZGVyIG5vdCBmb3VuZCcpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgeyBzb3VyY2UgfSA9IHByb3BzWzBdO1xuICAgIGNvbnN0IG1vZGUgPSBzb3VyY2VbMF07XG4gICAgbGV0IGluZGVudCA9IDA7XG4gICAgbGV0IGNob21wID0gJyc7XG4gICAgbGV0IGVycm9yID0gLTE7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzb3VyY2UubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgY2ggPSBzb3VyY2VbaV07XG4gICAgICAgIGlmICghY2hvbXAgJiYgKGNoID09PSAnLScgfHwgY2ggPT09ICcrJykpXG4gICAgICAgICAgICBjaG9tcCA9IGNoO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG4gPSBOdW1iZXIoY2gpO1xuICAgICAgICAgICAgaWYgKCFpbmRlbnQgJiYgbilcbiAgICAgICAgICAgICAgICBpbmRlbnQgPSBuO1xuICAgICAgICAgICAgZWxzZSBpZiAoZXJyb3IgPT09IC0xKVxuICAgICAgICAgICAgICAgIGVycm9yID0gb2Zmc2V0ICsgaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZXJyb3IgIT09IC0xKVxuICAgICAgICBvbkVycm9yKGVycm9yLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBCbG9jayBzY2FsYXIgaGVhZGVyIGluY2x1ZGVzIGV4dHJhIGNoYXJhY3RlcnM6ICR7c291cmNlfWApO1xuICAgIGxldCBoYXNTcGFjZSA9IGZhbHNlO1xuICAgIGxldCBjb21tZW50ID0gJyc7XG4gICAgbGV0IGxlbmd0aCA9IHNvdXJjZS5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBwcm9wcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHByb3BzW2ldO1xuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgbGVuZ3RoICs9IHRva2VuLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICBpZiAoc3RyaWN0ICYmICFoYXNTcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ0NvbW1lbnRzIG11c3QgYmUgc2VwYXJhdGVkIGZyb20gb3RoZXIgdG9rZW5zIGJ5IHdoaXRlIHNwYWNlIGNoYXJhY3RlcnMnO1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTUlTU0lOR19DSEFSJywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxlbmd0aCArPSB0b2tlbi5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGNvbW1lbnQgPSB0b2tlbi5zb3VyY2Uuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgdG9rZW4ubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgbGVuZ3RoICs9IHRva2VuLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgVW5leHBlY3RlZCB0b2tlbiBpbiBibG9jayBzY2FsYXIgaGVhZGVyOiAke3Rva2VuLnR5cGV9YDtcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRzID0gdG9rZW4uc291cmNlO1xuICAgICAgICAgICAgICAgIGlmICh0cyAmJiB0eXBlb2YgdHMgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgICAgICBsZW5ndGggKz0gdHMubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IG1vZGUsIGluZGVudCwgY2hvbXAsIGNvbW1lbnQsIGxlbmd0aCB9O1xufVxuLyoqIEByZXR1cm5zIEFycmF5IG9mIGxpbmVzIHNwbGl0IHVwIGFzIGBbaW5kZW50LCBjb250ZW50XWAgKi9cbmZ1bmN0aW9uIHNwbGl0TGluZXMoc291cmNlKSB7XG4gICAgY29uc3Qgc3BsaXQgPSBzb3VyY2Uuc3BsaXQoL1xcbiggKikvKTtcbiAgICBjb25zdCBmaXJzdCA9IHNwbGl0WzBdO1xuICAgIGNvbnN0IG0gPSBmaXJzdC5tYXRjaCgvXiggKikvKTtcbiAgICBjb25zdCBsaW5lMCA9IG0/LlsxXVxuICAgICAgICA/IFttWzFdLCBmaXJzdC5zbGljZShtWzFdLmxlbmd0aCldXG4gICAgICAgIDogWycnLCBmaXJzdF07XG4gICAgY29uc3QgbGluZXMgPSBbbGluZTBdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc3BsaXQubGVuZ3RoOyBpICs9IDIpXG4gICAgICAgIGxpbmVzLnB1c2goW3NwbGl0W2ldLCBzcGxpdFtpICsgMV1dKTtcbiAgICByZXR1cm4gbGluZXM7XG59XG5cbmV4cG9ydCB7IHJlc29sdmVCbG9ja1NjYWxhciB9O1xuIiwgImltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyByZXNvbHZlRW5kIH0gZnJvbSAnLi9yZXNvbHZlLWVuZC5qcyc7XG5cbmZ1bmN0aW9uIHJlc29sdmVGbG93U2NhbGFyKHNjYWxhciwgc3RyaWN0LCBvbkVycm9yKSB7XG4gICAgY29uc3QgeyBvZmZzZXQsIHR5cGUsIHNvdXJjZSwgZW5kIH0gPSBzY2FsYXI7XG4gICAgbGV0IF90eXBlO1xuICAgIGxldCB2YWx1ZTtcbiAgICBjb25zdCBfb25FcnJvciA9IChyZWwsIGNvZGUsIG1zZykgPT4gb25FcnJvcihvZmZzZXQgKyByZWwsIGNvZGUsIG1zZyk7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICBfdHlwZSA9IFNjYWxhci5QTEFJTjtcbiAgICAgICAgICAgIHZhbHVlID0gcGxhaW5WYWx1ZShzb3VyY2UsIF9vbkVycm9yKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBfdHlwZSA9IFNjYWxhci5RVU9URV9TSU5HTEU7XG4gICAgICAgICAgICB2YWx1ZSA9IHNpbmdsZVF1b3RlZFZhbHVlKHNvdXJjZSwgX29uRXJyb3IpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIF90eXBlID0gU2NhbGFyLlFVT1RFX0RPVUJMRTtcbiAgICAgICAgICAgIHZhbHVlID0gZG91YmxlUXVvdGVkVmFsdWUoc291cmNlLCBfb25FcnJvcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG9uRXJyb3Ioc2NhbGFyLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBFeHBlY3RlZCBhIGZsb3cgc2NhbGFyIHZhbHVlLCBidXQgZm91bmQ6ICR7dHlwZX1gKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgIHR5cGU6IG51bGwsXG4gICAgICAgICAgICAgICAgY29tbWVudDogJycsXG4gICAgICAgICAgICAgICAgcmFuZ2U6IFtvZmZzZXQsIG9mZnNldCArIHNvdXJjZS5sZW5ndGgsIG9mZnNldCArIHNvdXJjZS5sZW5ndGhdXG4gICAgICAgICAgICB9O1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZUVuZCA9IG9mZnNldCArIHNvdXJjZS5sZW5ndGg7XG4gICAgY29uc3QgcmUgPSByZXNvbHZlRW5kKGVuZCwgdmFsdWVFbmQsIHN0cmljdCwgb25FcnJvcik7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHR5cGU6IF90eXBlLFxuICAgICAgICBjb21tZW50OiByZS5jb21tZW50LFxuICAgICAgICByYW5nZTogW29mZnNldCwgdmFsdWVFbmQsIHJlLm9mZnNldF1cbiAgICB9O1xufVxuZnVuY3Rpb24gcGxhaW5WYWx1ZShzb3VyY2UsIG9uRXJyb3IpIHtcbiAgICBsZXQgYmFkQ2hhciA9ICcnO1xuICAgIHN3aXRjaCAoc291cmNlWzBdKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIGNhc2UgJ1xcdCc6XG4gICAgICAgICAgICBiYWRDaGFyID0gJ2EgdGFiIGNoYXJhY3Rlcic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnLCc6XG4gICAgICAgICAgICBiYWRDaGFyID0gJ2Zsb3cgaW5kaWNhdG9yIGNoYXJhY3RlciAsJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgIGJhZENoYXIgPSAnZGlyZWN0aXZlIGluZGljYXRvciBjaGFyYWN0ZXIgJSc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgIGNhc2UgJz4nOiB7XG4gICAgICAgICAgICBiYWRDaGFyID0gYGJsb2NrIHNjYWxhciBpbmRpY2F0b3IgJHtzb3VyY2VbMF19YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0AnOlxuICAgICAgICBjYXNlICdgJzoge1xuICAgICAgICAgICAgYmFkQ2hhciA9IGByZXNlcnZlZCBjaGFyYWN0ZXIgJHtzb3VyY2VbMF19YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChiYWRDaGFyKVxuICAgICAgICBvbkVycm9yKDAsICdCQURfU0NBTEFSX1NUQVJUJywgYFBsYWluIHZhbHVlIGNhbm5vdCBzdGFydCB3aXRoICR7YmFkQ2hhcn1gKTtcbiAgICByZXR1cm4gZm9sZExpbmVzKHNvdXJjZSk7XG59XG5mdW5jdGlvbiBzaW5nbGVRdW90ZWRWYWx1ZShzb3VyY2UsIG9uRXJyb3IpIHtcbiAgICBpZiAoc291cmNlW3NvdXJjZS5sZW5ndGggLSAxXSAhPT0gXCInXCIgfHwgc291cmNlLmxlbmd0aCA9PT0gMSlcbiAgICAgICAgb25FcnJvcihzb3VyY2UubGVuZ3RoLCAnTUlTU0lOR19DSEFSJywgXCJNaXNzaW5nIGNsb3NpbmcgJ3F1b3RlXCIpO1xuICAgIHJldHVybiBmb2xkTGluZXMoc291cmNlLnNsaWNlKDEsIC0xKSkucmVwbGFjZSgvJycvZywgXCInXCIpO1xufVxuZnVuY3Rpb24gZm9sZExpbmVzKHNvdXJjZSkge1xuICAgIC8qKlxuICAgICAqIFRoZSBuZWdhdGl2ZSBsb29rYmVoaW5kIGhlcmUgYW5kIGluIHRoZSBgcmVgIFJlZ0V4cCBpcyB0b1xuICAgICAqIHByZXZlbnQgY2F1c2luZyBhIHBvbHlub21pYWwgc2VhcmNoIHRpbWUgaW4gY2VydGFpbiBjYXNlcy5cbiAgICAgKlxuICAgICAqIFRoZSB0cnktY2F0Y2ggaXMgZm9yIFNhZmFyaSwgd2hpY2ggZG9lc24ndCBzdXBwb3J0IHRoaXMgeWV0OlxuICAgICAqIGh0dHBzOi8vY2FuaXVzZS5jb20vanMtcmVnZXhwLWxvb2tiZWhpbmRcbiAgICAgKi9cbiAgICBsZXQgZmlyc3QsIGxpbmU7XG4gICAgdHJ5IHtcbiAgICAgICAgZmlyc3QgPSBuZXcgUmVnRXhwKCcoLio/KSg/PCFbIFxcdF0pWyBcXHRdKlxccj9cXG4nLCAnc3knKTtcbiAgICAgICAgbGluZSA9IG5ldyBSZWdFeHAoJ1sgXFx0XSooLio/KSg/Oig/PCFbIFxcdF0pWyBcXHRdKik/XFxyP1xcbicsICdzeScpO1xuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIGZpcnN0ID0gLyguKj8pWyBcXHRdKlxccj9cXG4vc3k7XG4gICAgICAgIGxpbmUgPSAvWyBcXHRdKiguKj8pWyBcXHRdKlxccj9cXG4vc3k7XG4gICAgfVxuICAgIGxldCBtYXRjaCA9IGZpcnN0LmV4ZWMoc291cmNlKTtcbiAgICBpZiAoIW1hdGNoKVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIGxldCByZXMgPSBtYXRjaFsxXTtcbiAgICBsZXQgc2VwID0gJyAnO1xuICAgIGxldCBwb3MgPSBmaXJzdC5sYXN0SW5kZXg7XG4gICAgbGluZS5sYXN0SW5kZXggPSBwb3M7XG4gICAgd2hpbGUgKChtYXRjaCA9IGxpbmUuZXhlYyhzb3VyY2UpKSkge1xuICAgICAgICBpZiAobWF0Y2hbMV0gPT09ICcnKSB7XG4gICAgICAgICAgICBpZiAoc2VwID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICByZXMgKz0gc2VwO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzICs9IHNlcCArIG1hdGNoWzFdO1xuICAgICAgICAgICAgc2VwID0gJyAnO1xuICAgICAgICB9XG4gICAgICAgIHBvcyA9IGxpbmUubGFzdEluZGV4O1xuICAgIH1cbiAgICBjb25zdCBsYXN0ID0gL1sgXFx0XSooLiopL3N5O1xuICAgIGxhc3QubGFzdEluZGV4ID0gcG9zO1xuICAgIG1hdGNoID0gbGFzdC5leGVjKHNvdXJjZSk7XG4gICAgcmV0dXJuIHJlcyArIHNlcCArIChtYXRjaD8uWzFdID8/ICcnKTtcbn1cbmZ1bmN0aW9uIGRvdWJsZVF1b3RlZFZhbHVlKHNvdXJjZSwgb25FcnJvcikge1xuICAgIGxldCByZXMgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNvdXJjZS5sZW5ndGggLSAxOyArK2kpIHtcbiAgICAgICAgY29uc3QgY2ggPSBzb3VyY2VbaV07XG4gICAgICAgIGlmIChjaCA9PT0gJ1xccicgJiYgc291cmNlW2kgKyAxXSA9PT0gJ1xcbicpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgaWYgKGNoID09PSAnXFxuJykge1xuICAgICAgICAgICAgY29uc3QgeyBmb2xkLCBvZmZzZXQgfSA9IGZvbGROZXdsaW5lKHNvdXJjZSwgaSk7XG4gICAgICAgICAgICByZXMgKz0gZm9sZDtcbiAgICAgICAgICAgIGkgPSBvZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2ggPT09ICdcXFxcJykge1xuICAgICAgICAgICAgbGV0IG5leHQgPSBzb3VyY2VbKytpXTtcbiAgICAgICAgICAgIGNvbnN0IGNjID0gZXNjYXBlQ29kZXNbbmV4dF07XG4gICAgICAgICAgICBpZiAoY2MpXG4gICAgICAgICAgICAgICAgcmVzICs9IGNjO1xuICAgICAgICAgICAgZWxzZSBpZiAobmV4dCA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgICAvLyBza2lwIGVzY2FwZWQgbmV3bGluZXMsIGJ1dCBzdGlsbCB0cmltIHRoZSBmb2xsb3dpbmcgbGluZVxuICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbaSArIDFdO1xuICAgICAgICAgICAgICAgIHdoaWxlIChuZXh0ID09PSAnICcgfHwgbmV4dCA9PT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbKytpICsgMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXh0ID09PSAnXFxyJyAmJiBzb3VyY2VbaSArIDFdID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgIC8vIHNraXAgZXNjYXBlZCBDUkxGIG5ld2xpbmVzLCBidXQgc3RpbGwgdHJpbSB0aGUgZm9sbG93aW5nIGxpbmVcbiAgICAgICAgICAgICAgICBuZXh0ID0gc291cmNlWysraSArIDFdO1xuICAgICAgICAgICAgICAgIHdoaWxlIChuZXh0ID09PSAnICcgfHwgbmV4dCA9PT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbKytpICsgMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXh0ID09PSAneCcgfHwgbmV4dCA9PT0gJ3UnIHx8IG5leHQgPT09ICdVJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IG5leHQgPT09ICd4JyA/IDIgOiBuZXh0ID09PSAndScgPyA0IDogODtcbiAgICAgICAgICAgICAgICByZXMgKz0gcGFyc2VDaGFyQ29kZShzb3VyY2UsIGkgKyAxLCBsZW5ndGgsIG9uRXJyb3IpO1xuICAgICAgICAgICAgICAgIGkgKz0gbGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmF3ID0gc291cmNlLnN1YnN0cihpIC0gMSwgMik7XG4gICAgICAgICAgICAgICAgb25FcnJvcihpIC0gMSwgJ0JBRF9EUV9FU0NBUEUnLCBgSW52YWxpZCBlc2NhcGUgc2VxdWVuY2UgJHtyYXd9YCk7XG4gICAgICAgICAgICAgICAgcmVzICs9IHJhdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0Jykge1xuICAgICAgICAgICAgLy8gdHJpbSB0cmFpbGluZyB3aGl0ZXNwYWNlXG4gICAgICAgICAgICBjb25zdCB3c1N0YXJ0ID0gaTtcbiAgICAgICAgICAgIGxldCBuZXh0ID0gc291cmNlW2kgKyAxXTtcbiAgICAgICAgICAgIHdoaWxlIChuZXh0ID09PSAnICcgfHwgbmV4dCA9PT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgbmV4dCA9IHNvdXJjZVsrK2kgKyAxXTtcbiAgICAgICAgICAgIGlmIChuZXh0ICE9PSAnXFxuJyAmJiAhKG5leHQgPT09ICdcXHInICYmIHNvdXJjZVtpICsgMl0gPT09ICdcXG4nKSlcbiAgICAgICAgICAgICAgICByZXMgKz0gaSA+IHdzU3RhcnQgPyBzb3VyY2Uuc2xpY2Uod3NTdGFydCwgaSArIDEpIDogY2g7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXMgKz0gY2g7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNvdXJjZVtzb3VyY2UubGVuZ3RoIC0gMV0gIT09ICdcIicgfHwgc291cmNlLmxlbmd0aCA9PT0gMSlcbiAgICAgICAgb25FcnJvcihzb3VyY2UubGVuZ3RoLCAnTUlTU0lOR19DSEFSJywgJ01pc3NpbmcgY2xvc2luZyBcInF1b3RlJyk7XG4gICAgcmV0dXJuIHJlcztcbn1cbi8qKlxuICogRm9sZCBhIHNpbmdsZSBuZXdsaW5lIGludG8gYSBzcGFjZSwgbXVsdGlwbGUgbmV3bGluZXMgdG8gTiAtIDEgbmV3bGluZXMuXG4gKiBQcmVzdW1lcyBgc291cmNlW29mZnNldF0gPT09ICdcXG4nYFxuICovXG5mdW5jdGlvbiBmb2xkTmV3bGluZShzb3VyY2UsIG9mZnNldCkge1xuICAgIGxldCBmb2xkID0gJyc7XG4gICAgbGV0IGNoID0gc291cmNlW29mZnNldCArIDFdO1xuICAgIHdoaWxlIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0JyB8fCBjaCA9PT0gJ1xcbicgfHwgY2ggPT09ICdcXHInKSB7XG4gICAgICAgIGlmIChjaCA9PT0gJ1xccicgJiYgc291cmNlW29mZnNldCArIDJdICE9PSAnXFxuJylcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBpZiAoY2ggPT09ICdcXG4nKVxuICAgICAgICAgICAgZm9sZCArPSAnXFxuJztcbiAgICAgICAgb2Zmc2V0ICs9IDE7XG4gICAgICAgIGNoID0gc291cmNlW29mZnNldCArIDFdO1xuICAgIH1cbiAgICBpZiAoIWZvbGQpXG4gICAgICAgIGZvbGQgPSAnICc7XG4gICAgcmV0dXJuIHsgZm9sZCwgb2Zmc2V0IH07XG59XG5jb25zdCBlc2NhcGVDb2RlcyA9IHtcbiAgICAnMCc6ICdcXDAnLCAvLyBudWxsIGNoYXJhY3RlclxuICAgIGE6ICdcXHgwNycsIC8vIGJlbGwgY2hhcmFjdGVyXG4gICAgYjogJ1xcYicsIC8vIGJhY2tzcGFjZVxuICAgIGU6ICdcXHgxYicsIC8vIGVzY2FwZSBjaGFyYWN0ZXJcbiAgICBmOiAnXFxmJywgLy8gZm9ybSBmZWVkXG4gICAgbjogJ1xcbicsIC8vIGxpbmUgZmVlZFxuICAgIHI6ICdcXHInLCAvLyBjYXJyaWFnZSByZXR1cm5cbiAgICB0OiAnXFx0JywgLy8gaG9yaXpvbnRhbCB0YWJcbiAgICB2OiAnXFx2JywgLy8gdmVydGljYWwgdGFiXG4gICAgTjogJ1xcdTAwODUnLCAvLyBVbmljb2RlIG5leHQgbGluZVxuICAgIF86ICdcXHUwMGEwJywgLy8gVW5pY29kZSBub24tYnJlYWtpbmcgc3BhY2VcbiAgICBMOiAnXFx1MjAyOCcsIC8vIFVuaWNvZGUgbGluZSBzZXBhcmF0b3JcbiAgICBQOiAnXFx1MjAyOScsIC8vIFVuaWNvZGUgcGFyYWdyYXBoIHNlcGFyYXRvclxuICAgICcgJzogJyAnLFxuICAgICdcIic6ICdcIicsXG4gICAgJy8nOiAnLycsXG4gICAgJ1xcXFwnOiAnXFxcXCcsXG4gICAgJ1xcdCc6ICdcXHQnXG59O1xuZnVuY3Rpb24gcGFyc2VDaGFyQ29kZShzb3VyY2UsIG9mZnNldCwgbGVuZ3RoLCBvbkVycm9yKSB7XG4gICAgY29uc3QgY2MgPSBzb3VyY2Uuc3Vic3RyKG9mZnNldCwgbGVuZ3RoKTtcbiAgICBjb25zdCBvayA9IGNjLmxlbmd0aCA9PT0gbGVuZ3RoICYmIC9eWzAtOWEtZkEtRl0rJC8udGVzdChjYyk7XG4gICAgY29uc3QgY29kZSA9IG9rID8gcGFyc2VJbnQoY2MsIDE2KSA6IE5hTjtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21Db2RlUG9pbnQoY29kZSk7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgY29uc3QgcmF3ID0gc291cmNlLnN1YnN0cihvZmZzZXQgLSAyLCBsZW5ndGggKyAyKTtcbiAgICAgICAgb25FcnJvcihvZmZzZXQgLSAyLCAnQkFEX0RRX0VTQ0FQRScsIGBJbnZhbGlkIGVzY2FwZSBzZXF1ZW5jZSAke3Jhd31gKTtcbiAgICAgICAgcmV0dXJuIHJhdztcbiAgICB9XG59XG5cbmV4cG9ydCB7IHJlc29sdmVGbG93U2NhbGFyIH07XG4iLCAiaW1wb3J0IHsgaXNTY2FsYXIsIFNDQUxBUiB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IFNjYWxhciB9IGZyb20gJy4uL25vZGVzL1NjYWxhci5qcyc7XG5pbXBvcnQgeyByZXNvbHZlQmxvY2tTY2FsYXIgfSBmcm9tICcuL3Jlc29sdmUtYmxvY2stc2NhbGFyLmpzJztcbmltcG9ydCB7IHJlc29sdmVGbG93U2NhbGFyIH0gZnJvbSAnLi9yZXNvbHZlLWZsb3ctc2NhbGFyLmpzJztcblxuZnVuY3Rpb24gY29tcG9zZVNjYWxhcihjdHgsIHRva2VuLCB0YWdUb2tlbiwgb25FcnJvcikge1xuICAgIGNvbnN0IHsgdmFsdWUsIHR5cGUsIGNvbW1lbnQsIHJhbmdlIH0gPSB0b2tlbi50eXBlID09PSAnYmxvY2stc2NhbGFyJ1xuICAgICAgICA/IHJlc29sdmVCbG9ja1NjYWxhcihjdHgsIHRva2VuLCBvbkVycm9yKVxuICAgICAgICA6IHJlc29sdmVGbG93U2NhbGFyKHRva2VuLCBjdHgub3B0aW9ucy5zdHJpY3QsIG9uRXJyb3IpO1xuICAgIGNvbnN0IHRhZ05hbWUgPSB0YWdUb2tlblxuICAgICAgICA/IGN0eC5kaXJlY3RpdmVzLnRhZ05hbWUodGFnVG9rZW4uc291cmNlLCBtc2cgPT4gb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZykpXG4gICAgICAgIDogbnVsbDtcbiAgICBsZXQgdGFnO1xuICAgIGlmIChjdHgub3B0aW9ucy5zdHJpbmdLZXlzICYmIGN0eC5hdEtleSkge1xuICAgICAgICB0YWcgPSBjdHguc2NoZW1hW1NDQUxBUl07XG4gICAgfVxuICAgIGVsc2UgaWYgKHRhZ05hbWUpXG4gICAgICAgIHRhZyA9IGZpbmRTY2FsYXJUYWdCeU5hbWUoY3R4LnNjaGVtYSwgdmFsdWUsIHRhZ05hbWUsIHRhZ1Rva2VuLCBvbkVycm9yKTtcbiAgICBlbHNlIGlmICh0b2tlbi50eXBlID09PSAnc2NhbGFyJylcbiAgICAgICAgdGFnID0gZmluZFNjYWxhclRhZ0J5VGVzdChjdHgsIHZhbHVlLCB0b2tlbiwgb25FcnJvcik7XG4gICAgZWxzZVxuICAgICAgICB0YWcgPSBjdHguc2NoZW1hW1NDQUxBUl07XG4gICAgbGV0IHNjYWxhcjtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXMgPSB0YWcucmVzb2x2ZSh2YWx1ZSwgbXNnID0+IG9uRXJyb3IodGFnVG9rZW4gPz8gdG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBtc2cpLCBjdHgub3B0aW9ucyk7XG4gICAgICAgIHNjYWxhciA9IGlzU2NhbGFyKHJlcykgPyByZXMgOiBuZXcgU2NhbGFyKHJlcyk7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtc2cgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIG9uRXJyb3IodGFnVG9rZW4gPz8gdG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBtc2cpO1xuICAgICAgICBzY2FsYXIgPSBuZXcgU2NhbGFyKHZhbHVlKTtcbiAgICB9XG4gICAgc2NhbGFyLnJhbmdlID0gcmFuZ2U7XG4gICAgc2NhbGFyLnNvdXJjZSA9IHZhbHVlO1xuICAgIGlmICh0eXBlKVxuICAgICAgICBzY2FsYXIudHlwZSA9IHR5cGU7XG4gICAgaWYgKHRhZ05hbWUpXG4gICAgICAgIHNjYWxhci50YWcgPSB0YWdOYW1lO1xuICAgIGlmICh0YWcuZm9ybWF0KVxuICAgICAgICBzY2FsYXIuZm9ybWF0ID0gdGFnLmZvcm1hdDtcbiAgICBpZiAoY29tbWVudClcbiAgICAgICAgc2NhbGFyLmNvbW1lbnQgPSBjb21tZW50O1xuICAgIHJldHVybiBzY2FsYXI7XG59XG5mdW5jdGlvbiBmaW5kU2NhbGFyVGFnQnlOYW1lKHNjaGVtYSwgdmFsdWUsIHRhZ05hbWUsIHRhZ1Rva2VuLCBvbkVycm9yKSB7XG4gICAgaWYgKHRhZ05hbWUgPT09ICchJylcbiAgICAgICAgcmV0dXJuIHNjaGVtYVtTQ0FMQVJdOyAvLyBub24tc3BlY2lmaWMgdGFnXG4gICAgY29uc3QgbWF0Y2hXaXRoVGVzdCA9IFtdO1xuICAgIGZvciAoY29uc3QgdGFnIG9mIHNjaGVtYS50YWdzKSB7XG4gICAgICAgIGlmICghdGFnLmNvbGxlY3Rpb24gJiYgdGFnLnRhZyA9PT0gdGFnTmFtZSkge1xuICAgICAgICAgICAgaWYgKHRhZy5kZWZhdWx0ICYmIHRhZy50ZXN0KVxuICAgICAgICAgICAgICAgIG1hdGNoV2l0aFRlc3QucHVzaCh0YWcpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiB0YWc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCB0YWcgb2YgbWF0Y2hXaXRoVGVzdClcbiAgICAgICAgaWYgKHRhZy50ZXN0Py50ZXN0KHZhbHVlKSlcbiAgICAgICAgICAgIHJldHVybiB0YWc7XG4gICAgY29uc3Qga3QgPSBzY2hlbWEua25vd25UYWdzW3RhZ05hbWVdO1xuICAgIGlmIChrdCAmJiAha3QuY29sbGVjdGlvbikge1xuICAgICAgICAvLyBFbnN1cmUgdGhhdCB0aGUga25vd24gdGFnIGlzIGF2YWlsYWJsZSBmb3Igc3RyaW5naWZ5aW5nLFxuICAgICAgICAvLyBidXQgZG9lcyBub3QgZ2V0IHVzZWQgYnkgZGVmYXVsdC5cbiAgICAgICAgc2NoZW1hLnRhZ3MucHVzaChPYmplY3QuYXNzaWduKHt9LCBrdCwgeyBkZWZhdWx0OiBmYWxzZSwgdGVzdDogdW5kZWZpbmVkIH0pKTtcbiAgICAgICAgcmV0dXJuIGt0O1xuICAgIH1cbiAgICBvbkVycm9yKHRhZ1Rva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgYFVucmVzb2x2ZWQgdGFnOiAke3RhZ05hbWV9YCwgdGFnTmFtZSAhPT0gJ3RhZzp5YW1sLm9yZywyMDAyOnN0cicpO1xuICAgIHJldHVybiBzY2hlbWFbU0NBTEFSXTtcbn1cbmZ1bmN0aW9uIGZpbmRTY2FsYXJUYWdCeVRlc3QoeyBhdEtleSwgZGlyZWN0aXZlcywgc2NoZW1hIH0sIHZhbHVlLCB0b2tlbiwgb25FcnJvcikge1xuICAgIGNvbnN0IHRhZyA9IHNjaGVtYS50YWdzLmZpbmQodGFnID0+ICh0YWcuZGVmYXVsdCA9PT0gdHJ1ZSB8fCAoYXRLZXkgJiYgdGFnLmRlZmF1bHQgPT09ICdrZXknKSkgJiZcbiAgICAgICAgdGFnLnRlc3Q/LnRlc3QodmFsdWUpKSB8fCBzY2hlbWFbU0NBTEFSXTtcbiAgICBpZiAoc2NoZW1hLmNvbXBhdCkge1xuICAgICAgICBjb25zdCBjb21wYXQgPSBzY2hlbWEuY29tcGF0LmZpbmQodGFnID0+IHRhZy5kZWZhdWx0ICYmIHRhZy50ZXN0Py50ZXN0KHZhbHVlKSkgPz9cbiAgICAgICAgICAgIHNjaGVtYVtTQ0FMQVJdO1xuICAgICAgICBpZiAodGFnLnRhZyAhPT0gY29tcGF0LnRhZykge1xuICAgICAgICAgICAgY29uc3QgdHMgPSBkaXJlY3RpdmVzLnRhZ1N0cmluZyh0YWcudGFnKTtcbiAgICAgICAgICAgIGNvbnN0IGNzID0gZGlyZWN0aXZlcy50YWdTdHJpbmcoY29tcGF0LnRhZyk7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSBgVmFsdWUgbWF5IGJlIHBhcnNlZCBhcyBlaXRoZXIgJHt0c30gb3IgJHtjc31gO1xuICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZywgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhZztcbn1cblxuZXhwb3J0IHsgY29tcG9zZVNjYWxhciB9O1xuIiwgImZ1bmN0aW9uIGVtcHR5U2NhbGFyUG9zaXRpb24ob2Zmc2V0LCBiZWZvcmUsIHBvcykge1xuICAgIGlmIChiZWZvcmUpIHtcbiAgICAgICAgcG9zID8/IChwb3MgPSBiZWZvcmUubGVuZ3RoKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IHBvcyAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICBsZXQgc3QgPSBiZWZvcmVbaV07XG4gICAgICAgICAgICBzd2l0Y2ggKHN0LnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCAtPSBzdC5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRlY2huaWNhbGx5LCBhbiBlbXB0eSBzY2FsYXIgaXMgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGxhc3Qgbm9uLWVtcHR5XG4gICAgICAgICAgICAvLyBub2RlLCBidXQgaXQncyBtb3JlIHVzZWZ1bCB0byBwbGFjZSBpdCBhZnRlciBhbnkgd2hpdGVzcGFjZS5cbiAgICAgICAgICAgIHN0ID0gYmVmb3JlWysraV07XG4gICAgICAgICAgICB3aGlsZSAoc3Q/LnR5cGUgPT09ICdzcGFjZScpIHtcbiAgICAgICAgICAgICAgICBvZmZzZXQgKz0gc3Quc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBzdCA9IGJlZm9yZVsrK2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldDtcbn1cblxuZXhwb3J0IHsgZW1wdHlTY2FsYXJQb3NpdGlvbiB9O1xuIiwgImltcG9ydCB7IEFsaWFzIH0gZnJvbSAnLi4vbm9kZXMvQWxpYXMuanMnO1xuaW1wb3J0IHsgaXNTY2FsYXIgfSBmcm9tICcuLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBjb21wb3NlQ29sbGVjdGlvbiB9IGZyb20gJy4vY29tcG9zZS1jb2xsZWN0aW9uLmpzJztcbmltcG9ydCB7IGNvbXBvc2VTY2FsYXIgfSBmcm9tICcuL2NvbXBvc2Utc2NhbGFyLmpzJztcbmltcG9ydCB7IHJlc29sdmVFbmQgfSBmcm9tICcuL3Jlc29sdmUtZW5kLmpzJztcbmltcG9ydCB7IGVtcHR5U2NhbGFyUG9zaXRpb24gfSBmcm9tICcuL3V0aWwtZW1wdHktc2NhbGFyLXBvc2l0aW9uLmpzJztcblxuY29uc3QgQ04gPSB7IGNvbXBvc2VOb2RlLCBjb21wb3NlRW1wdHlOb2RlIH07XG5mdW5jdGlvbiBjb21wb3NlTm9kZShjdHgsIHRva2VuLCBwcm9wcywgb25FcnJvcikge1xuICAgIGNvbnN0IGF0S2V5ID0gY3R4LmF0S2V5O1xuICAgIGNvbnN0IHsgc3BhY2VCZWZvcmUsIGNvbW1lbnQsIGFuY2hvciwgdGFnIH0gPSBwcm9wcztcbiAgICBsZXQgbm9kZTtcbiAgICBsZXQgaXNTcmNUb2tlbiA9IHRydWU7XG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgIG5vZGUgPSBjb21wb3NlQWxpYXMoY3R4LCB0b2tlbiwgb25FcnJvcik7XG4gICAgICAgICAgICBpZiAoYW5jaG9yIHx8IHRhZylcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnQUxJQVNfUFJPUFMnLCAnQW4gYWxpYXMgbm9kZSBtdXN0IG5vdCBzcGVjaWZ5IGFueSBwcm9wZXJ0aWVzJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6XG4gICAgICAgICAgICBub2RlID0gY29tcG9zZVNjYWxhcihjdHgsIHRva2VuLCB0YWcsIG9uRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGFuY2hvcilcbiAgICAgICAgICAgICAgICBub2RlLmFuY2hvciA9IGFuY2hvci5zb3VyY2Uuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNlcSc6XG4gICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIG5vZGUgPSBjb21wb3NlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgcHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICAgICAgICAgIGlmIChhbmNob3IpXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuYW5jaG9yID0gYW5jaG9yLnNvdXJjZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAvLyBBbG1vc3QgY2VydGFpbmx5IGhlcmUgZHVlIHRvIGEgc3RhY2sgb3ZlcmZsb3dcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdSRVNPVVJDRV9FWEhBVVNUSU9OJywgbWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHRva2VuLnR5cGUgPT09ICdlcnJvcidcbiAgICAgICAgICAgICAgICA/IHRva2VuLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICA6IGBVbnN1cHBvcnRlZCB0b2tlbiAodHlwZTogJHt0b2tlbi50eXBlfSlgO1xuICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIGlzU3JjVG9rZW4gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBub2RlID8/IChub2RlID0gY29tcG9zZUVtcHR5Tm9kZShjdHgsIHRva2VuLm9mZnNldCwgdW5kZWZpbmVkLCBudWxsLCBwcm9wcywgb25FcnJvcikpO1xuICAgIGlmIChhbmNob3IgJiYgbm9kZS5hbmNob3IgPT09ICcnKVxuICAgICAgICBvbkVycm9yKGFuY2hvciwgJ0JBRF9BTElBUycsICdBbmNob3IgY2Fubm90IGJlIGFuIGVtcHR5IHN0cmluZycpO1xuICAgIGlmIChhdEtleSAmJlxuICAgICAgICBjdHgub3B0aW9ucy5zdHJpbmdLZXlzICYmXG4gICAgICAgICghaXNTY2FsYXIobm9kZSkgfHxcbiAgICAgICAgICAgIHR5cGVvZiBub2RlLnZhbHVlICE9PSAnc3RyaW5nJyB8fFxuICAgICAgICAgICAgKG5vZGUudGFnICYmIG5vZGUudGFnICE9PSAndGFnOnlhbWwub3JnLDIwMDI6c3RyJykpKSB7XG4gICAgICAgIGNvbnN0IG1zZyA9ICdXaXRoIHN0cmluZ0tleXMsIGFsbCBrZXlzIG11c3QgYmUgc3RyaW5ncyc7XG4gICAgICAgIG9uRXJyb3IodGFnID8/IHRva2VuLCAnTk9OX1NUUklOR19LRVknLCBtc2cpO1xuICAgIH1cbiAgICBpZiAoc3BhY2VCZWZvcmUpXG4gICAgICAgIG5vZGUuc3BhY2VCZWZvcmUgPSB0cnVlO1xuICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgIGlmICh0b2tlbi50eXBlID09PSAnc2NhbGFyJyAmJiB0b2tlbi5zb3VyY2UgPT09ICcnKVxuICAgICAgICAgICAgbm9kZS5jb21tZW50ID0gY29tbWVudDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbm9kZS5jb21tZW50QmVmb3JlID0gY29tbWVudDtcbiAgICB9XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUeXBlIGNoZWNraW5nIG1pc3NlcyBtZWFuaW5nIG9mIGlzU3JjVG9rZW5cbiAgICBpZiAoY3R4Lm9wdGlvbnMua2VlcFNvdXJjZVRva2VucyAmJiBpc1NyY1Rva2VuKVxuICAgICAgICBub2RlLnNyY1Rva2VuID0gdG9rZW47XG4gICAgcmV0dXJuIG5vZGU7XG59XG5mdW5jdGlvbiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgb2Zmc2V0LCBiZWZvcmUsIHBvcywgeyBzcGFjZUJlZm9yZSwgY29tbWVudCwgYW5jaG9yLCB0YWcsIGVuZCB9LCBvbkVycm9yKSB7XG4gICAgY29uc3QgdG9rZW4gPSB7XG4gICAgICAgIHR5cGU6ICdzY2FsYXInLFxuICAgICAgICBvZmZzZXQ6IGVtcHR5U2NhbGFyUG9zaXRpb24ob2Zmc2V0LCBiZWZvcmUsIHBvcyksXG4gICAgICAgIGluZGVudDogLTEsXG4gICAgICAgIHNvdXJjZTogJydcbiAgICB9O1xuICAgIGNvbnN0IG5vZGUgPSBjb21wb3NlU2NhbGFyKGN0eCwgdG9rZW4sIHRhZywgb25FcnJvcik7XG4gICAgaWYgKGFuY2hvcikge1xuICAgICAgICBub2RlLmFuY2hvciA9IGFuY2hvci5zb3VyY2Uuc3Vic3RyaW5nKDEpO1xuICAgICAgICBpZiAobm9kZS5hbmNob3IgPT09ICcnKVxuICAgICAgICAgICAgb25FcnJvcihhbmNob3IsICdCQURfQUxJQVMnLCAnQW5jaG9yIGNhbm5vdCBiZSBhbiBlbXB0eSBzdHJpbmcnKTtcbiAgICB9XG4gICAgaWYgKHNwYWNlQmVmb3JlKVxuICAgICAgICBub2RlLnNwYWNlQmVmb3JlID0gdHJ1ZTtcbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBub2RlLmNvbW1lbnQgPSBjb21tZW50O1xuICAgICAgICBub2RlLnJhbmdlWzJdID0gZW5kO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbn1cbmZ1bmN0aW9uIGNvbXBvc2VBbGlhcyh7IG9wdGlvbnMgfSwgeyBvZmZzZXQsIHNvdXJjZSwgZW5kIH0sIG9uRXJyb3IpIHtcbiAgICBjb25zdCBhbGlhcyA9IG5ldyBBbGlhcyhzb3VyY2Uuc3Vic3RyaW5nKDEpKTtcbiAgICBpZiAoYWxpYXMuc291cmNlID09PSAnJylcbiAgICAgICAgb25FcnJvcihvZmZzZXQsICdCQURfQUxJQVMnLCAnQWxpYXMgY2Fubm90IGJlIGFuIGVtcHR5IHN0cmluZycpO1xuICAgIGlmIChhbGlhcy5zb3VyY2UuZW5kc1dpdGgoJzonKSlcbiAgICAgICAgb25FcnJvcihvZmZzZXQgKyBzb3VyY2UubGVuZ3RoIC0gMSwgJ0JBRF9BTElBUycsICdBbGlhcyBlbmRpbmcgaW4gOiBpcyBhbWJpZ3VvdXMnLCB0cnVlKTtcbiAgICBjb25zdCB2YWx1ZUVuZCA9IG9mZnNldCArIHNvdXJjZS5sZW5ndGg7XG4gICAgY29uc3QgcmUgPSByZXNvbHZlRW5kKGVuZCwgdmFsdWVFbmQsIG9wdGlvbnMuc3RyaWN0LCBvbkVycm9yKTtcbiAgICBhbGlhcy5yYW5nZSA9IFtvZmZzZXQsIHZhbHVlRW5kLCByZS5vZmZzZXRdO1xuICAgIGlmIChyZS5jb21tZW50KVxuICAgICAgICBhbGlhcy5jb21tZW50ID0gcmUuY29tbWVudDtcbiAgICByZXR1cm4gYWxpYXM7XG59XG5cbmV4cG9ydCB7IGNvbXBvc2VFbXB0eU5vZGUsIGNvbXBvc2VOb2RlIH07XG4iLCAiaW1wb3J0IHsgRG9jdW1lbnQgfSBmcm9tICcuLi9kb2MvRG9jdW1lbnQuanMnO1xuaW1wb3J0IHsgY29tcG9zZU5vZGUsIGNvbXBvc2VFbXB0eU5vZGUgfSBmcm9tICcuL2NvbXBvc2Utbm9kZS5qcyc7XG5pbXBvcnQgeyByZXNvbHZlRW5kIH0gZnJvbSAnLi9yZXNvbHZlLWVuZC5qcyc7XG5pbXBvcnQgeyByZXNvbHZlUHJvcHMgfSBmcm9tICcuL3Jlc29sdmUtcHJvcHMuanMnO1xuXG5mdW5jdGlvbiBjb21wb3NlRG9jKG9wdGlvbnMsIGRpcmVjdGl2ZXMsIHsgb2Zmc2V0LCBzdGFydCwgdmFsdWUsIGVuZCB9LCBvbkVycm9yKSB7XG4gICAgY29uc3Qgb3B0cyA9IE9iamVjdC5hc3NpZ24oeyBfZGlyZWN0aXZlczogZGlyZWN0aXZlcyB9LCBvcHRpb25zKTtcbiAgICBjb25zdCBkb2MgPSBuZXcgRG9jdW1lbnQodW5kZWZpbmVkLCBvcHRzKTtcbiAgICBjb25zdCBjdHggPSB7XG4gICAgICAgIGF0S2V5OiBmYWxzZSxcbiAgICAgICAgYXRSb290OiB0cnVlLFxuICAgICAgICBkaXJlY3RpdmVzOiBkb2MuZGlyZWN0aXZlcyxcbiAgICAgICAgb3B0aW9uczogZG9jLm9wdGlvbnMsXG4gICAgICAgIHNjaGVtYTogZG9jLnNjaGVtYVxuICAgIH07XG4gICAgY29uc3QgcHJvcHMgPSByZXNvbHZlUHJvcHMoc3RhcnQsIHtcbiAgICAgICAgaW5kaWNhdG9yOiAnZG9jLXN0YXJ0JyxcbiAgICAgICAgbmV4dDogdmFsdWUgPz8gZW5kPy5bMF0sXG4gICAgICAgIG9mZnNldCxcbiAgICAgICAgb25FcnJvcixcbiAgICAgICAgcGFyZW50SW5kZW50OiAwLFxuICAgICAgICBzdGFydE9uTmV3bGluZTogdHJ1ZVxuICAgIH0pO1xuICAgIGlmIChwcm9wcy5mb3VuZCkge1xuICAgICAgICBkb2MuZGlyZWN0aXZlcy5kb2NTdGFydCA9IHRydWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgKHZhbHVlLnR5cGUgPT09ICdibG9jay1tYXAnIHx8IHZhbHVlLnR5cGUgPT09ICdibG9jay1zZXEnKSAmJlxuICAgICAgICAgICAgIXByb3BzLmhhc05ld2xpbmUpXG4gICAgICAgICAgICBvbkVycm9yKHByb3BzLmVuZCwgJ01JU1NJTkdfQ0hBUicsICdCbG9jayBjb2xsZWN0aW9uIGNhbm5vdCBzdGFydCBvbiBzYW1lIGxpbmUgd2l0aCBkaXJlY3RpdmVzLWVuZCBtYXJrZXInKTtcbiAgICB9XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJZiBDb250ZW50cyBpcyBzZXQsIGxldCdzIHRydXN0IHRoZSB1c2VyXG4gICAgZG9jLmNvbnRlbnRzID0gdmFsdWVcbiAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIHZhbHVlLCBwcm9wcywgb25FcnJvcilcbiAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgcHJvcHMuZW5kLCBzdGFydCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpO1xuICAgIGNvbnN0IGNvbnRlbnRFbmQgPSBkb2MuY29udGVudHMucmFuZ2VbMl07XG4gICAgY29uc3QgcmUgPSByZXNvbHZlRW5kKGVuZCwgY29udGVudEVuZCwgZmFsc2UsIG9uRXJyb3IpO1xuICAgIGlmIChyZS5jb21tZW50KVxuICAgICAgICBkb2MuY29tbWVudCA9IHJlLmNvbW1lbnQ7XG4gICAgZG9jLnJhbmdlID0gW29mZnNldCwgY29udGVudEVuZCwgcmUub2Zmc2V0XTtcbiAgICByZXR1cm4gZG9jO1xufVxuXG5leHBvcnQgeyBjb21wb3NlRG9jIH07XG4iLCAiaW1wb3J0IHsgRGlyZWN0aXZlcyB9IGZyb20gJy4uL2RvYy9kaXJlY3RpdmVzLmpzJztcbmltcG9ydCB7IERvY3VtZW50IH0gZnJvbSAnLi4vZG9jL0RvY3VtZW50LmpzJztcbmltcG9ydCB7IFlBTUxXYXJuaW5nLCBZQU1MUGFyc2VFcnJvciB9IGZyb20gJy4uL2Vycm9ycy5qcyc7XG5pbXBvcnQgeyBpc0NvbGxlY3Rpb24sIGlzUGFpciB9IGZyb20gJy4uL25vZGVzL2lkZW50aXR5LmpzJztcbmltcG9ydCB7IGNvbXBvc2VEb2MgfSBmcm9tICcuL2NvbXBvc2UtZG9jLmpzJztcbmltcG9ydCB7IHJlc29sdmVFbmQgfSBmcm9tICcuL3Jlc29sdmUtZW5kLmpzJztcblxuZnVuY3Rpb24gZ2V0RXJyb3JQb3Moc3JjKSB7XG4gICAgaWYgKHR5cGVvZiBzcmMgPT09ICdudW1iZXInKVxuICAgICAgICByZXR1cm4gW3NyYywgc3JjICsgMV07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc3JjKSlcbiAgICAgICAgcmV0dXJuIHNyYy5sZW5ndGggPT09IDIgPyBzcmMgOiBbc3JjWzBdLCBzcmNbMV1dO1xuICAgIGNvbnN0IHsgb2Zmc2V0LCBzb3VyY2UgfSA9IHNyYztcbiAgICByZXR1cm4gW29mZnNldCwgb2Zmc2V0ICsgKHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnID8gc291cmNlLmxlbmd0aCA6IDEpXTtcbn1cbmZ1bmN0aW9uIHBhcnNlUHJlbHVkZShwcmVsdWRlKSB7XG4gICAgbGV0IGNvbW1lbnQgPSAnJztcbiAgICBsZXQgYXRDb21tZW50ID0gZmFsc2U7XG4gICAgbGV0IGFmdGVyRW1wdHlMaW5lID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVsdWRlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IHByZWx1ZGVbaV07XG4gICAgICAgIHN3aXRjaCAoc291cmNlWzBdKSB7XG4gICAgICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICAgICAgICBjb21tZW50ICs9XG4gICAgICAgICAgICAgICAgICAgIChjb21tZW50ID09PSAnJyA/ICcnIDogYWZ0ZXJFbXB0eUxpbmUgPyAnXFxuXFxuJyA6ICdcXG4nKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAoc291cmNlLnN1YnN0cmluZygxKSB8fCAnICcpO1xuICAgICAgICAgICAgICAgIGF0Q29tbWVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYWZ0ZXJFbXB0eUxpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJyUnOlxuICAgICAgICAgICAgICAgIGlmIChwcmVsdWRlW2kgKyAxXT8uWzBdICE9PSAnIycpXG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICBhdENvbW1lbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBtYXkgYmUgd3JvbmcgYWZ0ZXIgZG9jLWVuZCwgYnV0IGluIHRoYXQgY2FzZSBpdCBkb2Vzbid0IG1hdHRlclxuICAgICAgICAgICAgICAgIGlmICghYXRDb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBhZnRlckVtcHR5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYXRDb21tZW50ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgY29tbWVudCwgYWZ0ZXJFbXB0eUxpbmUgfTtcbn1cbi8qKlxuICogQ29tcG9zZSBhIHN0cmVhbSBvZiBDU1Qgbm9kZXMgaW50byBhIHN0cmVhbSBvZiBZQU1MIERvY3VtZW50cy5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgQ29tcG9zZXIsIFBhcnNlciB9IGZyb20gJ3lhbWwnXG4gKlxuICogY29uc3Qgc3JjOiBzdHJpbmcgPSAuLi5cbiAqIGNvbnN0IHRva2VucyA9IG5ldyBQYXJzZXIoKS5wYXJzZShzcmMpXG4gKiBjb25zdCBkb2NzID0gbmV3IENvbXBvc2VyKCkuY29tcG9zZSh0b2tlbnMpXG4gKiBgYGBcbiAqL1xuY2xhc3MgQ29tcG9zZXIge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLmRvYyA9IG51bGw7XG4gICAgICAgIHRoaXMuYXREaXJlY3RpdmVzID0gZmFsc2U7XG4gICAgICAgIHRoaXMucHJlbHVkZSA9IFtdO1xuICAgICAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgICAgICB0aGlzLndhcm5pbmdzID0gW107XG4gICAgICAgIHRoaXMub25FcnJvciA9IChzb3VyY2UsIGNvZGUsIG1lc3NhZ2UsIHdhcm5pbmcpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IGdldEVycm9yUG9zKHNvdXJjZSk7XG4gICAgICAgICAgICBpZiAod2FybmluZylcbiAgICAgICAgICAgICAgICB0aGlzLndhcm5pbmdzLnB1c2gobmV3IFlBTUxXYXJuaW5nKHBvcywgY29kZSwgbWVzc2FnZSkpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2gobmV3IFlBTUxQYXJzZUVycm9yKHBvcywgY29kZSwgbWVzc2FnZSkpO1xuICAgICAgICB9O1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3ByZWZlci1udWxsaXNoLWNvYWxlc2NpbmdcbiAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gbmV3IERpcmVjdGl2ZXMoeyB2ZXJzaW9uOiBvcHRpb25zLnZlcnNpb24gfHwgJzEuMicgfSk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICAgIGRlY29yYXRlKGRvYywgYWZ0ZXJEb2MpIHtcbiAgICAgICAgY29uc3QgeyBjb21tZW50LCBhZnRlckVtcHR5TGluZSB9ID0gcGFyc2VQcmVsdWRlKHRoaXMucHJlbHVkZSk7XG4gICAgICAgIC8vY29uc29sZS5sb2coeyBkYzogZG9jLmNvbW1lbnQsIHByZWx1ZGUsIGNvbW1lbnQgfSlcbiAgICAgICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGRjID0gZG9jLmNvbnRlbnRzO1xuICAgICAgICAgICAgaWYgKGFmdGVyRG9jKSB7XG4gICAgICAgICAgICAgICAgZG9jLmNvbW1lbnQgPSBkb2MuY29tbWVudCA/IGAke2RvYy5jb21tZW50fVxcbiR7Y29tbWVudH1gIDogY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGFmdGVyRW1wdHlMaW5lIHx8IGRvYy5kaXJlY3RpdmVzLmRvY1N0YXJ0IHx8ICFkYykge1xuICAgICAgICAgICAgICAgIGRvYy5jb21tZW50QmVmb3JlID0gY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzQ29sbGVjdGlvbihkYykgJiYgIWRjLmZsb3cgJiYgZGMuaXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGxldCBpdCA9IGRjLml0ZW1zWzBdO1xuICAgICAgICAgICAgICAgIGlmIChpc1BhaXIoaXQpKVxuICAgICAgICAgICAgICAgICAgICBpdCA9IGl0LmtleTtcbiAgICAgICAgICAgICAgICBjb25zdCBjYiA9IGl0LmNvbW1lbnRCZWZvcmU7XG4gICAgICAgICAgICAgICAgaXQuY29tbWVudEJlZm9yZSA9IGNiID8gYCR7Y29tbWVudH1cXG4ke2NifWAgOiBjb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2IgPSBkYy5jb21tZW50QmVmb3JlO1xuICAgICAgICAgICAgICAgIGRjLmNvbW1lbnRCZWZvcmUgPSBjYiA/IGAke2NvbW1lbnR9XFxuJHtjYn1gIDogY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYWZ0ZXJEb2MpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lcnJvcnMubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgZG9jLmVycm9ycy5wdXNoKHRoaXMuZXJyb3JzW2ldKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy53YXJuaW5ncy5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBkb2Mud2FybmluZ3MucHVzaCh0aGlzLndhcm5pbmdzW2ldKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRvYy5lcnJvcnMgPSB0aGlzLmVycm9ycztcbiAgICAgICAgICAgIGRvYy53YXJuaW5ncyA9IHRoaXMud2FybmluZ3M7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcmVsdWRlID0gW107XG4gICAgICAgIHRoaXMuZXJyb3JzID0gW107XG4gICAgICAgIHRoaXMud2FybmluZ3MgPSBbXTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3VycmVudCBzdHJlYW0gc3RhdHVzIGluZm9ybWF0aW9uLlxuICAgICAqXG4gICAgICogTW9zdGx5IHVzZWZ1bCBhdCB0aGUgZW5kIG9mIGlucHV0IGZvciBhbiBlbXB0eSBzdHJlYW0uXG4gICAgICovXG4gICAgc3RyZWFtSW5mbygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbW1lbnQ6IHBhcnNlUHJlbHVkZSh0aGlzLnByZWx1ZGUpLmNvbW1lbnQsXG4gICAgICAgICAgICBkaXJlY3RpdmVzOiB0aGlzLmRpcmVjdGl2ZXMsXG4gICAgICAgICAgICBlcnJvcnM6IHRoaXMuZXJyb3JzLFxuICAgICAgICAgICAgd2FybmluZ3M6IHRoaXMud2FybmluZ3NcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29tcG9zZSB0b2tlbnMgaW50byBkb2N1bWVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZm9yY2VEb2MgLSBJZiB0aGUgc3RyZWFtIGNvbnRhaW5zIG5vIGRvY3VtZW50LCBzdGlsbCBlbWl0IGEgZmluYWwgZG9jdW1lbnQgaW5jbHVkaW5nIGFueSBjb21tZW50cyBhbmQgZGlyZWN0aXZlcyB0aGF0IHdvdWxkIGJlIGFwcGxpZWQgdG8gYSBzdWJzZXF1ZW50IGRvY3VtZW50LlxuICAgICAqIEBwYXJhbSBlbmRPZmZzZXQgLSBTaG91bGQgYmUgc2V0IGlmIGBmb3JjZURvY2AgaXMgYWxzbyBzZXQsIHRvIHNldCB0aGUgZG9jdW1lbnQgcmFuZ2UgZW5kIGFuZCB0byBpbmRpY2F0ZSBlcnJvcnMgY29ycmVjdGx5LlxuICAgICAqL1xuICAgICpjb21wb3NlKHRva2VucywgZm9yY2VEb2MgPSBmYWxzZSwgZW5kT2Zmc2V0ID0gLTEpIHtcbiAgICAgICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5uZXh0KHRva2VuKTtcbiAgICAgICAgeWllbGQqIHRoaXMuZW5kKGZvcmNlRG9jLCBlbmRPZmZzZXQpO1xuICAgIH1cbiAgICAvKiogQWR2YW5jZSB0aGUgY29tcG9zZXIgYnkgb25lIENTVCB0b2tlbi4gKi9cbiAgICAqbmV4dCh0b2tlbikge1xuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RpcmVjdGl2ZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzLmFkZCh0b2tlbi5zb3VyY2UsIChvZmZzZXQsIG1lc3NhZ2UsIHdhcm5pbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zID0gZ2V0RXJyb3JQb3ModG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBwb3NbMF0gKz0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IocG9zLCAnQkFEX0RJUkVDVElWRScsIG1lc3NhZ2UsIHdhcm5pbmcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMucHJlbHVkZS5wdXNoKHRva2VuLnNvdXJjZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hdERpcmVjdGl2ZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZG9jdW1lbnQnOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZG9jID0gY29tcG9zZURvYyh0aGlzLm9wdGlvbnMsIHRoaXMuZGlyZWN0aXZlcywgdG9rZW4sIHRoaXMub25FcnJvcik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXREaXJlY3RpdmVzICYmICFkb2MuZGlyZWN0aXZlcy5kb2NTdGFydClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKHRva2VuLCAnTUlTU0lOR19DSEFSJywgJ01pc3NpbmcgZGlyZWN0aXZlcy1lbmQvZG9jLXN0YXJ0IGluZGljYXRvciBsaW5lJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWNvcmF0ZShkb2MsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kb2MpXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuZG9jO1xuICAgICAgICAgICAgICAgIHRoaXMuZG9jID0gZG9jO1xuICAgICAgICAgICAgICAgIHRoaXMuYXREaXJlY3RpdmVzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdieXRlLW9yZGVyLW1hcmsnOlxuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB0aGlzLnByZWx1ZGUucHVzaCh0b2tlbi5zb3VyY2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZXJyb3InOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gdG9rZW4uc291cmNlXG4gICAgICAgICAgICAgICAgICAgID8gYCR7dG9rZW4ubWVzc2FnZX06ICR7SlNPTi5zdHJpbmdpZnkodG9rZW4uc291cmNlKX1gXG4gICAgICAgICAgICAgICAgICAgIDogdG9rZW4ubWVzc2FnZTtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBZQU1MUGFyc2VFcnJvcihnZXRFcnJvclBvcyh0b2tlbiksICdVTkVYUEVDVEVEX1RPS0VOJywgbXNnKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hdERpcmVjdGl2ZXMgfHwgIXRoaXMuZG9jKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKGVycm9yKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9jLmVycm9ycy5wdXNoKGVycm9yKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2RvYy1lbmQnOiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmRvYykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSAnVW5leHBlY3RlZCBkb2MtZW5kIHdpdGhvdXQgcHJlY2VkaW5nIGRvY3VtZW50JztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChuZXcgWUFNTFBhcnNlRXJyb3IoZ2V0RXJyb3JQb3ModG9rZW4pLCAnVU5FWFBFQ1RFRF9UT0tFTicsIG1zZykpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kb2MuZGlyZWN0aXZlcy5kb2NFbmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IHJlc29sdmVFbmQodG9rZW4uZW5kLCB0b2tlbi5vZmZzZXQgKyB0b2tlbi5zb3VyY2UubGVuZ3RoLCB0aGlzLmRvYy5vcHRpb25zLnN0cmljdCwgdGhpcy5vbkVycm9yKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlY29yYXRlKHRoaXMuZG9jLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBpZiAoZW5kLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGMgPSB0aGlzLmRvYy5jb21tZW50O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvYy5jb21tZW50ID0gZGMgPyBgJHtkY31cXG4ke2VuZC5jb21tZW50fWAgOiBlbmQuY29tbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kb2MucmFuZ2VbMl0gPSBlbmQub2Zmc2V0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBZQU1MUGFyc2VFcnJvcihnZXRFcnJvclBvcyh0b2tlbiksICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuc3VwcG9ydGVkIHRva2VuICR7dG9rZW4udHlwZX1gKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbCBhdCBlbmQgb2YgaW5wdXQgdG8geWllbGQgYW55IHJlbWFpbmluZyBkb2N1bWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmb3JjZURvYyAtIElmIHRoZSBzdHJlYW0gY29udGFpbnMgbm8gZG9jdW1lbnQsIHN0aWxsIGVtaXQgYSBmaW5hbCBkb2N1bWVudCBpbmNsdWRpbmcgYW55IGNvbW1lbnRzIGFuZCBkaXJlY3RpdmVzIHRoYXQgd291bGQgYmUgYXBwbGllZCB0byBhIHN1YnNlcXVlbnQgZG9jdW1lbnQuXG4gICAgICogQHBhcmFtIGVuZE9mZnNldCAtIFNob3VsZCBiZSBzZXQgaWYgYGZvcmNlRG9jYCBpcyBhbHNvIHNldCwgdG8gc2V0IHRoZSBkb2N1bWVudCByYW5nZSBlbmQgYW5kIHRvIGluZGljYXRlIGVycm9ycyBjb3JyZWN0bHkuXG4gICAgICovXG4gICAgKmVuZChmb3JjZURvYyA9IGZhbHNlLCBlbmRPZmZzZXQgPSAtMSkge1xuICAgICAgICBpZiAodGhpcy5kb2MpIHtcbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdGUodGhpcy5kb2MsIHRydWUpO1xuICAgICAgICAgICAgeWllbGQgdGhpcy5kb2M7XG4gICAgICAgICAgICB0aGlzLmRvYyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZm9yY2VEb2MpIHtcbiAgICAgICAgICAgIGNvbnN0IG9wdHMgPSBPYmplY3QuYXNzaWduKHsgX2RpcmVjdGl2ZXM6IHRoaXMuZGlyZWN0aXZlcyB9LCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgZG9jID0gbmV3IERvY3VtZW50KHVuZGVmaW5lZCwgb3B0cyk7XG4gICAgICAgICAgICBpZiAodGhpcy5hdERpcmVjdGl2ZXMpXG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKGVuZE9mZnNldCwgJ01JU1NJTkdfQ0hBUicsICdNaXNzaW5nIGRpcmVjdGl2ZXMtZW5kIGluZGljYXRvciBsaW5lJyk7XG4gICAgICAgICAgICBkb2MucmFuZ2UgPSBbMCwgZW5kT2Zmc2V0LCBlbmRPZmZzZXRdO1xuICAgICAgICAgICAgdGhpcy5kZWNvcmF0ZShkb2MsIGZhbHNlKTtcbiAgICAgICAgICAgIHlpZWxkIGRvYztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHsgQ29tcG9zZXIgfTtcbiIsICJleHBvcnQgeyBjcmVhdGVTY2FsYXJUb2tlbiwgcmVzb2x2ZUFzU2NhbGFyLCBzZXRTY2FsYXJWYWx1ZSB9IGZyb20gJy4vY3N0LXNjYWxhci5qcyc7XG5leHBvcnQgeyBzdHJpbmdpZnkgfSBmcm9tICcuL2NzdC1zdHJpbmdpZnkuanMnO1xuZXhwb3J0IHsgdmlzaXQgfSBmcm9tICcuL2NzdC12aXNpdC5qcyc7XG5cbi8qKiBUaGUgYnl0ZSBvcmRlciBtYXJrICovXG5jb25zdCBCT00gPSAnXFx1e0ZFRkZ9Jztcbi8qKiBTdGFydCBvZiBkb2MtbW9kZSAqL1xuY29uc3QgRE9DVU1FTlQgPSAnXFx4MDInOyAvLyBDMDogU3RhcnQgb2YgVGV4dFxuLyoqIFVuZXhwZWN0ZWQgZW5kIG9mIGZsb3ctbW9kZSAqL1xuY29uc3QgRkxPV19FTkQgPSAnXFx4MTgnOyAvLyBDMDogQ2FuY2VsXG4vKiogTmV4dCB0b2tlbiBpcyBhIHNjYWxhciB2YWx1ZSAqL1xuY29uc3QgU0NBTEFSID0gJ1xceDFmJzsgLy8gQzA6IFVuaXQgU2VwYXJhdG9yXG4vKiogQHJldHVybnMgYHRydWVgIGlmIGB0b2tlbmAgaXMgYSBmbG93IG9yIGJsb2NrIGNvbGxlY3Rpb24gKi9cbmNvbnN0IGlzQ29sbGVjdGlvbiA9ICh0b2tlbikgPT4gISF0b2tlbiAmJiAnaXRlbXMnIGluIHRva2VuO1xuLyoqIEByZXR1cm5zIGB0cnVlYCBpZiBgdG9rZW5gIGlzIGEgZmxvdyBvciBibG9jayBzY2FsYXI7IG5vdCBhbiBhbGlhcyAqL1xuY29uc3QgaXNTY2FsYXIgPSAodG9rZW4pID0+ICEhdG9rZW4gJiZcbiAgICAodG9rZW4udHlwZSA9PT0gJ3NjYWxhcicgfHxcbiAgICAgICAgdG9rZW4udHlwZSA9PT0gJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJyB8fFxuICAgICAgICB0b2tlbi50eXBlID09PSAnZG91YmxlLXF1b3RlZC1zY2FsYXInIHx8XG4gICAgICAgIHRva2VuLnR5cGUgPT09ICdibG9jay1zY2FsYXInKTtcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4vKiogR2V0IGEgcHJpbnRhYmxlIHJlcHJlc2VudGF0aW9uIG9mIGEgbGV4ZXIgdG9rZW4gKi9cbmZ1bmN0aW9uIHByZXR0eVRva2VuKHRva2VuKSB7XG4gICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgICBjYXNlIEJPTTpcbiAgICAgICAgICAgIHJldHVybiAnPEJPTT4nO1xuICAgICAgICBjYXNlIERPQ1VNRU5UOlxuICAgICAgICAgICAgcmV0dXJuICc8RE9DPic7XG4gICAgICAgIGNhc2UgRkxPV19FTkQ6XG4gICAgICAgICAgICByZXR1cm4gJzxGTE9XX0VORD4nO1xuICAgICAgICBjYXNlIFNDQUxBUjpcbiAgICAgICAgICAgIHJldHVybiAnPFNDQUxBUj4nO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRva2VuKTtcbiAgICB9XG59XG4vKiogSWRlbnRpZnkgdGhlIHR5cGUgb2YgYSBsZXhlciB0b2tlbi4gTWF5IHJldHVybiBgbnVsbGAgZm9yIHVua25vd24gdG9rZW5zLiAqL1xuZnVuY3Rpb24gdG9rZW5UeXBlKHNvdXJjZSkge1xuICAgIHN3aXRjaCAoc291cmNlKSB7XG4gICAgICAgIGNhc2UgQk9NOlxuICAgICAgICAgICAgcmV0dXJuICdieXRlLW9yZGVyLW1hcmsnO1xuICAgICAgICBjYXNlIERPQ1VNRU5UOlxuICAgICAgICAgICAgcmV0dXJuICdkb2MtbW9kZSc7XG4gICAgICAgIGNhc2UgRkxPV19FTkQ6XG4gICAgICAgICAgICByZXR1cm4gJ2Zsb3ctZXJyb3ItZW5kJztcbiAgICAgICAgY2FzZSBTQ0FMQVI6XG4gICAgICAgICAgICByZXR1cm4gJ3NjYWxhcic7XG4gICAgICAgIGNhc2UgJy0tLSc6XG4gICAgICAgICAgICByZXR1cm4gJ2RvYy1zdGFydCc7XG4gICAgICAgIGNhc2UgJy4uLic6XG4gICAgICAgICAgICByZXR1cm4gJ2RvYy1lbmQnO1xuICAgICAgICBjYXNlICcnOlxuICAgICAgICBjYXNlICdcXG4nOlxuICAgICAgICBjYXNlICdcXHJcXG4nOlxuICAgICAgICAgICAgcmV0dXJuICduZXdsaW5lJztcbiAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgICByZXR1cm4gJ3NlcS1pdGVtLWluZCc7XG4gICAgICAgIGNhc2UgJz8nOlxuICAgICAgICAgICAgcmV0dXJuICdleHBsaWNpdC1rZXktaW5kJztcbiAgICAgICAgY2FzZSAnOic6XG4gICAgICAgICAgICByZXR1cm4gJ21hcC12YWx1ZS1pbmQnO1xuICAgICAgICBjYXNlICd7JzpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1tYXAtc3RhcnQnO1xuICAgICAgICBjYXNlICd9JzpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1tYXAtZW5kJztcbiAgICAgICAgY2FzZSAnWyc6XG4gICAgICAgICAgICByZXR1cm4gJ2Zsb3ctc2VxLXN0YXJ0JztcbiAgICAgICAgY2FzZSAnXSc6XG4gICAgICAgICAgICByZXR1cm4gJ2Zsb3ctc2VxLWVuZCc7XG4gICAgICAgIGNhc2UgJywnOlxuICAgICAgICAgICAgcmV0dXJuICdjb21tYSc7XG4gICAgfVxuICAgIHN3aXRjaCAoc291cmNlWzBdKSB7XG4gICAgICAgIGNhc2UgJyAnOlxuICAgICAgICBjYXNlICdcXHQnOlxuICAgICAgICAgICAgcmV0dXJuICdzcGFjZSc7XG4gICAgICAgIGNhc2UgJyMnOlxuICAgICAgICAgICAgcmV0dXJuICdjb21tZW50JztcbiAgICAgICAgY2FzZSAnJSc6XG4gICAgICAgICAgICByZXR1cm4gJ2RpcmVjdGl2ZS1saW5lJztcbiAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICByZXR1cm4gJ2FsaWFzJztcbiAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICByZXR1cm4gJ2FuY2hvcic7XG4gICAgICAgIGNhc2UgJyEnOlxuICAgICAgICAgICAgcmV0dXJuICd0YWcnO1xuICAgICAgICBjYXNlIFwiJ1wiOlxuICAgICAgICAgICAgcmV0dXJuICdzaW5nbGUtcXVvdGVkLXNjYWxhcic7XG4gICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgIHJldHVybiAnZG91YmxlLXF1b3RlZC1zY2FsYXInO1xuICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICByZXR1cm4gJ2Jsb2NrLXNjYWxhci1oZWFkZXInO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IHsgQk9NLCBET0NVTUVOVCwgRkxPV19FTkQsIFNDQUxBUiwgaXNDb2xsZWN0aW9uLCBpc1NjYWxhciwgcHJldHR5VG9rZW4sIHRva2VuVHlwZSB9O1xuIiwgImltcG9ydCB7IHJlc29sdmVCbG9ja1NjYWxhciB9IGZyb20gJy4uL2NvbXBvc2UvcmVzb2x2ZS1ibG9jay1zY2FsYXIuanMnO1xuaW1wb3J0IHsgcmVzb2x2ZUZsb3dTY2FsYXIgfSBmcm9tICcuLi9jb21wb3NlL3Jlc29sdmUtZmxvdy1zY2FsYXIuanMnO1xuaW1wb3J0IHsgWUFNTFBhcnNlRXJyb3IgfSBmcm9tICcuLi9lcnJvcnMuanMnO1xuaW1wb3J0IHsgc3RyaW5naWZ5U3RyaW5nIH0gZnJvbSAnLi4vc3RyaW5naWZ5L3N0cmluZ2lmeVN0cmluZy5qcyc7XG5cbmZ1bmN0aW9uIHJlc29sdmVBc1NjYWxhcih0b2tlbiwgc3RyaWN0ID0gdHJ1ZSwgb25FcnJvcikge1xuICAgIGlmICh0b2tlbikge1xuICAgICAgICBjb25zdCBfb25FcnJvciA9IChwb3MsIGNvZGUsIG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHR5cGVvZiBwb3MgPT09ICdudW1iZXInID8gcG9zIDogQXJyYXkuaXNBcnJheShwb3MpID8gcG9zWzBdIDogcG9zLm9mZnNldDtcbiAgICAgICAgICAgIGlmIChvbkVycm9yKVxuICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCBjb2RlLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgWUFNTFBhcnNlRXJyb3IoW29mZnNldCwgb2Zmc2V0ICsgMV0sIGNvZGUsIG1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVGbG93U2NhbGFyKHRva2VuLCBzdHJpY3QsIF9vbkVycm9yKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVCbG9ja1NjYWxhcih7IG9wdGlvbnM6IHsgc3RyaWN0IH0gfSwgdG9rZW4sIF9vbkVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbi8qKlxuICogQ3JlYXRlIGEgbmV3IHNjYWxhciB0b2tlbiB3aXRoIGB2YWx1ZWBcbiAqXG4gKiBWYWx1ZXMgdGhhdCByZXByZXNlbnQgYW4gYWN0dWFsIHN0cmluZyBidXQgbWF5IGJlIHBhcnNlZCBhcyBhIGRpZmZlcmVudCB0eXBlIHNob3VsZCB1c2UgYSBgdHlwZWAgb3RoZXIgdGhhbiBgJ1BMQUlOJ2AsXG4gKiBhcyB0aGlzIGZ1bmN0aW9uIGRvZXMgbm90IHN1cHBvcnQgYW55IHNjaGVtYSBvcGVyYXRpb25zIGFuZCB3b24ndCBjaGVjayBmb3Igc3VjaCBjb25mbGljdHMuXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZhbHVlLCB3aGljaCB3aWxsIGhhdmUgaXRzIGNvbnRlbnQgcHJvcGVybHkgaW5kZW50ZWQuXG4gKiBAcGFyYW0gY29udGV4dC5lbmQgQ29tbWVudHMgYW5kIHdoaXRlc3BhY2UgYWZ0ZXIgdGhlIGVuZCBvZiB0aGUgdmFsdWUsIG9yIGFmdGVyIHRoZSBibG9jayBzY2FsYXIgaGVhZGVyLiBJZiB1bmRlZmluZWQsIGEgbmV3bGluZSB3aWxsIGJlIGFkZGVkLlxuICogQHBhcmFtIGNvbnRleHQuaW1wbGljaXRLZXkgQmVpbmcgd2l0aGluIGFuIGltcGxpY2l0IGtleSBtYXkgYWZmZWN0IHRoZSByZXNvbHZlZCB0eXBlIG9mIHRoZSB0b2tlbidzIHZhbHVlLlxuICogQHBhcmFtIGNvbnRleHQuaW5kZW50IFRoZSBpbmRlbnQgbGV2ZWwgb2YgdGhlIHRva2VuLlxuICogQHBhcmFtIGNvbnRleHQuaW5GbG93IElzIHRoaXMgc2NhbGFyIHdpdGhpbiBhIGZsb3cgY29sbGVjdGlvbj8gVGhpcyBtYXkgYWZmZWN0IHRoZSByZXNvbHZlZCB0eXBlIG9mIHRoZSB0b2tlbidzIHZhbHVlLlxuICogQHBhcmFtIGNvbnRleHQub2Zmc2V0IFRoZSBvZmZzZXQgcG9zaXRpb24gb2YgdGhlIHRva2VuLlxuICogQHBhcmFtIGNvbnRleHQudHlwZSBUaGUgcHJlZmVycmVkIHR5cGUgb2YgdGhlIHNjYWxhciB0b2tlbi4gSWYgdW5kZWZpbmVkLCB0aGUgcHJldmlvdXMgdHlwZSBvZiB0aGUgYHRva2VuYCB3aWxsIGJlIHVzZWQsIGRlZmF1bHRpbmcgdG8gYCdQTEFJTidgLlxuICovXG5mdW5jdGlvbiBjcmVhdGVTY2FsYXJUb2tlbih2YWx1ZSwgY29udGV4dCkge1xuICAgIGNvbnN0IHsgaW1wbGljaXRLZXkgPSBmYWxzZSwgaW5kZW50LCBpbkZsb3cgPSBmYWxzZSwgb2Zmc2V0ID0gLTEsIHR5cGUgPSAnUExBSU4nIH0gPSBjb250ZXh0O1xuICAgIGNvbnN0IHNvdXJjZSA9IHN0cmluZ2lmeVN0cmluZyh7IHR5cGUsIHZhbHVlIH0sIHtcbiAgICAgICAgaW1wbGljaXRLZXksXG4gICAgICAgIGluZGVudDogaW5kZW50ID4gMCA/ICcgJy5yZXBlYXQoaW5kZW50KSA6ICcnLFxuICAgICAgICBpbkZsb3csXG4gICAgICAgIG9wdGlvbnM6IHsgYmxvY2tRdW90ZTogdHJ1ZSwgbGluZVdpZHRoOiAtMSB9XG4gICAgfSk7XG4gICAgY29uc3QgZW5kID0gY29udGV4dC5lbmQgPz8gW1xuICAgICAgICB7IHR5cGU6ICduZXdsaW5lJywgb2Zmc2V0OiAtMSwgaW5kZW50LCBzb3VyY2U6ICdcXG4nIH1cbiAgICBdO1xuICAgIHN3aXRjaCAoc291cmNlWzBdKSB7XG4gICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICBjYXNlICc+Jzoge1xuICAgICAgICAgICAgY29uc3QgaGUgPSBzb3VyY2UuaW5kZXhPZignXFxuJyk7XG4gICAgICAgICAgICBjb25zdCBoZWFkID0gc291cmNlLnN1YnN0cmluZygwLCBoZSk7XG4gICAgICAgICAgICBjb25zdCBib2R5ID0gc291cmNlLnN1YnN0cmluZyhoZSArIDEpICsgJ1xcbic7XG4gICAgICAgICAgICBjb25zdCBwcm9wcyA9IFtcbiAgICAgICAgICAgICAgICB7IHR5cGU6ICdibG9jay1zY2FsYXItaGVhZGVyJywgb2Zmc2V0LCBpbmRlbnQsIHNvdXJjZTogaGVhZCB9XG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgaWYgKCFhZGRFbmR0b0Jsb2NrUHJvcHMocHJvcHMsIGVuZCkpXG4gICAgICAgICAgICAgICAgcHJvcHMucHVzaCh7IHR5cGU6ICduZXdsaW5lJywgb2Zmc2V0OiAtMSwgaW5kZW50LCBzb3VyY2U6ICdcXG4nIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2Jsb2NrLXNjYWxhcicsIG9mZnNldCwgaW5kZW50LCBwcm9wcywgc291cmNlOiBib2R5IH07XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJywgb2Zmc2V0LCBpbmRlbnQsIHNvdXJjZSwgZW5kIH07XG4gICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiAnc2luZ2xlLXF1b3RlZC1zY2FsYXInLCBvZmZzZXQsIGluZGVudCwgc291cmNlLCBlbmQgfTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdzY2FsYXInLCBvZmZzZXQsIGluZGVudCwgc291cmNlLCBlbmQgfTtcbiAgICB9XG59XG4vKipcbiAqIFNldCB0aGUgdmFsdWUgb2YgYHRva2VuYCB0byB0aGUgZ2l2ZW4gc3RyaW5nIGB2YWx1ZWAsIG92ZXJ3cml0aW5nIGFueSBwcmV2aW91cyBjb250ZW50cyBhbmQgdHlwZSB0aGF0IGl0IG1heSBoYXZlLlxuICpcbiAqIEJlc3QgZWZmb3J0cyBhcmUgbWFkZSB0byByZXRhaW4gYW55IGNvbW1lbnRzIHByZXZpb3VzbHkgYXNzb2NpYXRlZCB3aXRoIHRoZSBgdG9rZW5gLFxuICogdGhvdWdoIGFsbCBjb250ZW50cyB3aXRoaW4gYSBjb2xsZWN0aW9uJ3MgYGl0ZW1zYCB3aWxsIGJlIG92ZXJ3cml0dGVuLlxuICpcbiAqIFZhbHVlcyB0aGF0IHJlcHJlc2VudCBhbiBhY3R1YWwgc3RyaW5nIGJ1dCBtYXkgYmUgcGFyc2VkIGFzIGEgZGlmZmVyZW50IHR5cGUgc2hvdWxkIHVzZSBhIGB0eXBlYCBvdGhlciB0aGFuIGAnUExBSU4nYCxcbiAqIGFzIHRoaXMgZnVuY3Rpb24gZG9lcyBub3Qgc3VwcG9ydCBhbnkgc2NoZW1hIG9wZXJhdGlvbnMgYW5kIHdvbid0IGNoZWNrIGZvciBzdWNoIGNvbmZsaWN0cy5cbiAqXG4gKiBAcGFyYW0gdG9rZW4gQW55IHRva2VuLiBJZiBpdCBkb2VzIG5vdCBpbmNsdWRlIGFuIGBpbmRlbnRgIHZhbHVlLCB0aGUgdmFsdWUgd2lsbCBiZSBzdHJpbmdpZmllZCBhcyBpZiBpdCB3ZXJlIGFuIGltcGxpY2l0IGtleS5cbiAqIEBwYXJhbSB2YWx1ZSBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2YWx1ZSwgd2hpY2ggd2lsbCBoYXZlIGl0cyBjb250ZW50IHByb3Blcmx5IGluZGVudGVkLlxuICogQHBhcmFtIGNvbnRleHQuYWZ0ZXJLZXkgSW4gbW9zdCBjYXNlcywgdmFsdWVzIGFmdGVyIGEga2V5IHNob3VsZCBoYXZlIGFuIGFkZGl0aW9uYWwgbGV2ZWwgb2YgaW5kZW50YXRpb24uXG4gKiBAcGFyYW0gY29udGV4dC5pbXBsaWNpdEtleSBCZWluZyB3aXRoaW4gYW4gaW1wbGljaXQga2V5IG1heSBhZmZlY3QgdGhlIHJlc29sdmVkIHR5cGUgb2YgdGhlIHRva2VuJ3MgdmFsdWUuXG4gKiBAcGFyYW0gY29udGV4dC5pbkZsb3cgQmVpbmcgd2l0aGluIGEgZmxvdyBjb2xsZWN0aW9uIG1heSBhZmZlY3QgdGhlIHJlc29sdmVkIHR5cGUgb2YgdGhlIHRva2VuJ3MgdmFsdWUuXG4gKiBAcGFyYW0gY29udGV4dC50eXBlIFRoZSBwcmVmZXJyZWQgdHlwZSBvZiB0aGUgc2NhbGFyIHRva2VuLiBJZiB1bmRlZmluZWQsIHRoZSBwcmV2aW91cyB0eXBlIG9mIHRoZSBgdG9rZW5gIHdpbGwgYmUgdXNlZCwgZGVmYXVsdGluZyB0byBgJ1BMQUlOJ2AuXG4gKi9cbmZ1bmN0aW9uIHNldFNjYWxhclZhbHVlKHRva2VuLCB2YWx1ZSwgY29udGV4dCA9IHt9KSB7XG4gICAgbGV0IHsgYWZ0ZXJLZXkgPSBmYWxzZSwgaW1wbGljaXRLZXkgPSBmYWxzZSwgaW5GbG93ID0gZmFsc2UsIHR5cGUgfSA9IGNvbnRleHQ7XG4gICAgbGV0IGluZGVudCA9ICdpbmRlbnQnIGluIHRva2VuID8gdG9rZW4uaW5kZW50IDogbnVsbDtcbiAgICBpZiAoYWZ0ZXJLZXkgJiYgdHlwZW9mIGluZGVudCA9PT0gJ251bWJlcicpXG4gICAgICAgIGluZGVudCArPSAyO1xuICAgIGlmICghdHlwZSlcbiAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgdHlwZSA9ICdRVU9URV9TSU5HTEUnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHR5cGUgPSAnUVVPVEVfRE9VQkxFJztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBoZWFkZXIgPSB0b2tlbi5wcm9wc1swXTtcbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLnR5cGUgIT09ICdibG9jay1zY2FsYXItaGVhZGVyJylcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJsb2NrIHNjYWxhciBoZWFkZXInKTtcbiAgICAgICAgICAgICAgICB0eXBlID0gaGVhZGVyLnNvdXJjZVswXSA9PT0gJz4nID8gJ0JMT0NLX0ZPTERFRCcgOiAnQkxPQ0tfTElURVJBTCc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHR5cGUgPSAnUExBSU4nO1xuICAgICAgICB9XG4gICAgY29uc3Qgc291cmNlID0gc3RyaW5naWZ5U3RyaW5nKHsgdHlwZSwgdmFsdWUgfSwge1xuICAgICAgICBpbXBsaWNpdEtleTogaW1wbGljaXRLZXkgfHwgaW5kZW50ID09PSBudWxsLFxuICAgICAgICBpbmRlbnQ6IGluZGVudCAhPT0gbnVsbCAmJiBpbmRlbnQgPiAwID8gJyAnLnJlcGVhdChpbmRlbnQpIDogJycsXG4gICAgICAgIGluRmxvdyxcbiAgICAgICAgb3B0aW9uczogeyBibG9ja1F1b3RlOiB0cnVlLCBsaW5lV2lkdGg6IC0xIH1cbiAgICB9KTtcbiAgICBzd2l0Y2ggKHNvdXJjZVswXSkge1xuICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICBzZXRCbG9ja1NjYWxhclZhbHVlKHRva2VuLCBzb3VyY2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgIHNldEZsb3dTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlLCAnZG91YmxlLXF1b3RlZC1zY2FsYXInKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiJ1wiOlxuICAgICAgICAgICAgc2V0Rmxvd1NjYWxhclZhbHVlKHRva2VuLCBzb3VyY2UsICdzaW5nbGUtcXVvdGVkLXNjYWxhcicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBzZXRGbG93U2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSwgJ3NjYWxhcicpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNldEJsb2NrU2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSkge1xuICAgIGNvbnN0IGhlID0gc291cmNlLmluZGV4T2YoJ1xcbicpO1xuICAgIGNvbnN0IGhlYWQgPSBzb3VyY2Uuc3Vic3RyaW5nKDAsIGhlKTtcbiAgICBjb25zdCBib2R5ID0gc291cmNlLnN1YnN0cmluZyhoZSArIDEpICsgJ1xcbic7XG4gICAgaWYgKHRva2VuLnR5cGUgPT09ICdibG9jay1zY2FsYXInKSB7XG4gICAgICAgIGNvbnN0IGhlYWRlciA9IHRva2VuLnByb3BzWzBdO1xuICAgICAgICBpZiAoaGVhZGVyLnR5cGUgIT09ICdibG9jay1zY2FsYXItaGVhZGVyJylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBibG9jayBzY2FsYXIgaGVhZGVyJyk7XG4gICAgICAgIGhlYWRlci5zb3VyY2UgPSBoZWFkO1xuICAgICAgICB0b2tlbi5zb3VyY2UgPSBib2R5O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgeyBvZmZzZXQgfSA9IHRva2VuO1xuICAgICAgICBjb25zdCBpbmRlbnQgPSAnaW5kZW50JyBpbiB0b2tlbiA/IHRva2VuLmluZGVudCA6IC0xO1xuICAgICAgICBjb25zdCBwcm9wcyA9IFtcbiAgICAgICAgICAgIHsgdHlwZTogJ2Jsb2NrLXNjYWxhci1oZWFkZXInLCBvZmZzZXQsIGluZGVudCwgc291cmNlOiBoZWFkIH1cbiAgICAgICAgXTtcbiAgICAgICAgaWYgKCFhZGRFbmR0b0Jsb2NrUHJvcHMocHJvcHMsICdlbmQnIGluIHRva2VuID8gdG9rZW4uZW5kIDogdW5kZWZpbmVkKSlcbiAgICAgICAgICAgIHByb3BzLnB1c2goeyB0eXBlOiAnbmV3bGluZScsIG9mZnNldDogLTEsIGluZGVudCwgc291cmNlOiAnXFxuJyB9KTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModG9rZW4pKVxuICAgICAgICAgICAgaWYgKGtleSAhPT0gJ3R5cGUnICYmIGtleSAhPT0gJ29mZnNldCcpXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRva2VuW2tleV07XG4gICAgICAgIE9iamVjdC5hc3NpZ24odG9rZW4sIHsgdHlwZTogJ2Jsb2NrLXNjYWxhcicsIGluZGVudCwgcHJvcHMsIHNvdXJjZTogYm9keSB9KTtcbiAgICB9XG59XG4vKiogQHJldHVybnMgYHRydWVgIGlmIGxhc3QgdG9rZW4gaXMgYSBuZXdsaW5lICovXG5mdW5jdGlvbiBhZGRFbmR0b0Jsb2NrUHJvcHMocHJvcHMsIGVuZCkge1xuICAgIGlmIChlbmQpXG4gICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgZW5kKVxuICAgICAgICAgICAgc3dpdGNoIChzdC50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHN0KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLnB1c2goc3QpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBzZXRGbG93U2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSwgdHlwZSkge1xuICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIHRva2VuLnR5cGUgPSB0eXBlO1xuICAgICAgICAgICAgdG9rZW4uc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6IHtcbiAgICAgICAgICAgIGNvbnN0IGVuZCA9IHRva2VuLnByb3BzLnNsaWNlKDEpO1xuICAgICAgICAgICAgbGV0IG9hID0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgIGlmICh0b2tlbi5wcm9wc1swXS50eXBlID09PSAnYmxvY2stc2NhbGFyLWhlYWRlcicpXG4gICAgICAgICAgICAgICAgb2EgLT0gdG9rZW4ucHJvcHNbMF0uc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdG9rIG9mIGVuZClcbiAgICAgICAgICAgICAgICB0b2sub2Zmc2V0ICs9IG9hO1xuICAgICAgICAgICAgZGVsZXRlIHRva2VuLnByb3BzO1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0b2tlbiwgeyB0eXBlLCBzb3VyY2UsIGVuZCB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNlcSc6IHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHRva2VuLm9mZnNldCArIHNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBubCA9IHsgdHlwZTogJ25ld2xpbmUnLCBvZmZzZXQsIGluZGVudDogdG9rZW4uaW5kZW50LCBzb3VyY2U6ICdcXG4nIH07XG4gICAgICAgICAgICBkZWxldGUgdG9rZW4uaXRlbXM7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRva2VuLCB7IHR5cGUsIHNvdXJjZSwgZW5kOiBbbmxdIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgY29uc3QgaW5kZW50ID0gJ2luZGVudCcgaW4gdG9rZW4gPyB0b2tlbi5pbmRlbnQgOiAtMTtcbiAgICAgICAgICAgIGNvbnN0IGVuZCA9ICdlbmQnIGluIHRva2VuICYmIEFycmF5LmlzQXJyYXkodG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgID8gdG9rZW4uZW5kLmZpbHRlcihzdCA9PiBzdC50eXBlID09PSAnc3BhY2UnIHx8XG4gICAgICAgICAgICAgICAgICAgIHN0LnR5cGUgPT09ICdjb21tZW50JyB8fFxuICAgICAgICAgICAgICAgICAgICBzdC50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgOiBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHRva2VuKSlcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSAndHlwZScgJiYga2V5ICE9PSAnb2Zmc2V0JylcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRva2VuW2tleV07XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRva2VuLCB7IHR5cGUsIGluZGVudCwgc291cmNlLCBlbmQgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7IGNyZWF0ZVNjYWxhclRva2VuLCByZXNvbHZlQXNTY2FsYXIsIHNldFNjYWxhclZhbHVlIH07XG4iLCAiLyoqXG4gKiBTdHJpbmdpZnkgYSBDU1QgZG9jdW1lbnQsIHRva2VuLCBvciBjb2xsZWN0aW9uIGl0ZW1cbiAqXG4gKiBGYWlyIHdhcm5pbmc6IFRoaXMgYXBwbGllcyBubyB2YWxpZGF0aW9uIHdoYXRzb2V2ZXIsIGFuZFxuICogc2ltcGx5IGNvbmNhdGVuYXRlcyB0aGUgc291cmNlcyBpbiB0aGVpciBsb2dpY2FsIG9yZGVyLlxuICovXG5jb25zdCBzdHJpbmdpZnkgPSAoY3N0KSA9PiAndHlwZScgaW4gY3N0ID8gc3RyaW5naWZ5VG9rZW4oY3N0KSA6IHN0cmluZ2lmeUl0ZW0oY3N0KTtcbmZ1bmN0aW9uIHN0cmluZ2lmeVRva2VuKHRva2VuKSB7XG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6IHtcbiAgICAgICAgICAgIGxldCByZXMgPSAnJztcbiAgICAgICAgICAgIGZvciAoY29uc3QgdG9rIG9mIHRva2VuLnByb3BzKVxuICAgICAgICAgICAgICAgIHJlcyArPSBzdHJpbmdpZnlUb2tlbih0b2spO1xuICAgICAgICAgICAgcmV0dXJuIHJlcyArIHRva2VuLnNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdibG9jay1tYXAnOlxuICAgICAgICBjYXNlICdibG9jay1zZXEnOiB7XG4gICAgICAgICAgICBsZXQgcmVzID0gJyc7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdG9rZW4uaXRlbXMpXG4gICAgICAgICAgICAgICAgcmVzICs9IHN0cmluZ2lmeUl0ZW0oaXRlbSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6IHtcbiAgICAgICAgICAgIGxldCByZXMgPSB0b2tlbi5zdGFydC5zb3VyY2U7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdG9rZW4uaXRlbXMpXG4gICAgICAgICAgICAgICAgcmVzICs9IHN0cmluZ2lmeUl0ZW0oaXRlbSk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICByZXMgKz0gc3Quc291cmNlO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdkb2N1bWVudCc6IHtcbiAgICAgICAgICAgIGxldCByZXMgPSBzdHJpbmdpZnlJdGVtKHRva2VuKTtcbiAgICAgICAgICAgIGlmICh0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiB0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgICAgIHJlcyArPSBzdC5zb3VyY2U7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGxldCByZXMgPSB0b2tlbi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoJ2VuZCcgaW4gdG9rZW4gJiYgdG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgdG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgICAgICByZXMgKz0gc3Quc291cmNlO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeUl0ZW0oeyBzdGFydCwga2V5LCBzZXAsIHZhbHVlIH0pIHtcbiAgICBsZXQgcmVzID0gJyc7XG4gICAgZm9yIChjb25zdCBzdCBvZiBzdGFydClcbiAgICAgICAgcmVzICs9IHN0LnNvdXJjZTtcbiAgICBpZiAoa2V5KVxuICAgICAgICByZXMgKz0gc3RyaW5naWZ5VG9rZW4oa2V5KTtcbiAgICBpZiAoc2VwKVxuICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIHNlcClcbiAgICAgICAgICAgIHJlcyArPSBzdC5zb3VyY2U7XG4gICAgaWYgKHZhbHVlKVxuICAgICAgICByZXMgKz0gc3RyaW5naWZ5VG9rZW4odmFsdWUpO1xuICAgIHJldHVybiByZXM7XG59XG5cbmV4cG9ydCB7IHN0cmluZ2lmeSB9O1xuIiwgImNvbnN0IEJSRUFLID0gU3ltYm9sKCdicmVhayB2aXNpdCcpO1xuY29uc3QgU0tJUCA9IFN5bWJvbCgnc2tpcCBjaGlsZHJlbicpO1xuY29uc3QgUkVNT1ZFID0gU3ltYm9sKCdyZW1vdmUgaXRlbScpO1xuLyoqXG4gKiBBcHBseSBhIHZpc2l0b3IgdG8gYSBDU1QgZG9jdW1lbnQgb3IgaXRlbS5cbiAqXG4gKiBXYWxrcyB0aHJvdWdoIHRoZSB0cmVlIChkZXB0aC1maXJzdCkgc3RhcnRpbmcgZnJvbSB0aGUgcm9vdCwgY2FsbGluZyBhXG4gKiBgdmlzaXRvcmAgZnVuY3Rpb24gd2l0aCB0d28gYXJndW1lbnRzIHdoZW4gZW50ZXJpbmcgZWFjaCBpdGVtOlxuICogICAtIGBpdGVtYDogVGhlIGN1cnJlbnQgaXRlbSwgd2hpY2ggaW5jbHVkZWQgdGhlIGZvbGxvd2luZyBtZW1iZXJzOlxuICogICAgIC0gYHN0YXJ0OiBTb3VyY2VUb2tlbltdYCBcdTIwMTMgU291cmNlIHRva2VucyBiZWZvcmUgdGhlIGtleSBvciB2YWx1ZSxcbiAqICAgICAgIHBvc3NpYmx5IGluY2x1ZGluZyBpdHMgYW5jaG9yIG9yIHRhZy5cbiAqICAgICAtIGBrZXk/OiBUb2tlbiB8IG51bGxgIFx1MjAxMyBTZXQgZm9yIHBhaXIgdmFsdWVzLiBNYXkgdGhlbiBiZSBgbnVsbGAsIGlmXG4gKiAgICAgICB0aGUga2V5IGJlZm9yZSB0aGUgYDpgIHNlcGFyYXRvciBpcyBlbXB0eS5cbiAqICAgICAtIGBzZXA/OiBTb3VyY2VUb2tlbltdYCBcdTIwMTMgU291cmNlIHRva2VucyBiZXR3ZWVuIHRoZSBrZXkgYW5kIHRoZSB2YWx1ZSxcbiAqICAgICAgIHdoaWNoIHNob3VsZCBpbmNsdWRlIHRoZSBgOmAgbWFwIHZhbHVlIGluZGljYXRvciBpZiBgdmFsdWVgIGlzIHNldC5cbiAqICAgICAtIGB2YWx1ZT86IFRva2VuYCBcdTIwMTMgVGhlIHZhbHVlIG9mIGEgc2VxdWVuY2UgaXRlbSwgb3Igb2YgYSBtYXAgcGFpci5cbiAqICAgLSBgcGF0aGA6IFRoZSBzdGVwcyBmcm9tIHRoZSByb290IHRvIHRoZSBjdXJyZW50IG5vZGUsIGFzIGFuIGFycmF5IG9mXG4gKiAgICAgYFsna2V5JyB8ICd2YWx1ZScsIG51bWJlcl1gIHR1cGxlcy5cbiAqXG4gKiBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoZSB2aXNpdG9yIG1heSBiZSB1c2VkIHRvIGNvbnRyb2wgdGhlIHRyYXZlcnNhbDpcbiAqICAgLSBgdW5kZWZpbmVkYCAoZGVmYXVsdCk6IERvIG5vdGhpbmcgYW5kIGNvbnRpbnVlXG4gKiAgIC0gYHZpc2l0LlNLSVBgOiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoaXMgdG9rZW4sIGNvbnRpbnVlIHdpdGhcbiAqICAgICAgbmV4dCBzaWJsaW5nXG4gKiAgIC0gYHZpc2l0LkJSRUFLYDogVGVybWluYXRlIHRyYXZlcnNhbCBjb21wbGV0ZWx5XG4gKiAgIC0gYHZpc2l0LlJFTU9WRWA6IFJlbW92ZSB0aGUgY3VycmVudCBpdGVtLCB0aGVuIGNvbnRpbnVlIHdpdGggdGhlIG5leHQgb25lXG4gKiAgIC0gYG51bWJlcmA6IFNldCB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RlcC4gVGhpcyBpcyB1c2VmdWwgZXNwZWNpYWxseSBpZlxuICogICAgIHRoZSBpbmRleCBvZiB0aGUgY3VycmVudCB0b2tlbiBoYXMgY2hhbmdlZC5cbiAqICAgLSBgZnVuY3Rpb25gOiBEZWZpbmUgdGhlIG5leHQgdmlzaXRvciBmb3IgdGhpcyBpdGVtLiBBZnRlciB0aGUgb3JpZ2luYWxcbiAqICAgICB2aXNpdG9yIGlzIGNhbGxlZCBvbiBpdGVtIGVudHJ5LCBuZXh0IHZpc2l0b3JzIGFyZSBjYWxsZWQgYWZ0ZXIgaGFuZGxpbmdcbiAqICAgICBhIG5vbi1lbXB0eSBga2V5YCBhbmQgd2hlbiBleGl0aW5nIHRoZSBpdGVtLlxuICovXG5mdW5jdGlvbiB2aXNpdChjc3QsIHZpc2l0b3IpIHtcbiAgICBpZiAoJ3R5cGUnIGluIGNzdCAmJiBjc3QudHlwZSA9PT0gJ2RvY3VtZW50JylcbiAgICAgICAgY3N0ID0geyBzdGFydDogY3N0LnN0YXJ0LCB2YWx1ZTogY3N0LnZhbHVlIH07XG4gICAgX3Zpc2l0KE9iamVjdC5mcmVlemUoW10pLCBjc3QsIHZpc2l0b3IpO1xufVxuLy8gV2l0aG91dCB0aGUgYGFzIHN5bWJvbGAgY2FzdHMsIFRTIGRlY2xhcmVzIHRoZXNlIGluIHRoZSBgdmlzaXRgXG4vLyBuYW1lc3BhY2UgdXNpbmcgYHZhcmAsIGJ1dCB0aGVuIGNvbXBsYWlucyBhYm91dCB0aGF0IGJlY2F1c2Vcbi8vIGB1bmlxdWUgc3ltYm9sYCBtdXN0IGJlIGBjb25zdGAuXG4vKiogVGVybWluYXRlIHZpc2l0IHRyYXZlcnNhbCBjb21wbGV0ZWx5ICovXG52aXNpdC5CUkVBSyA9IEJSRUFLO1xuLyoqIERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhlIGN1cnJlbnQgaXRlbSAqL1xudmlzaXQuU0tJUCA9IFNLSVA7XG4vKiogUmVtb3ZlIHRoZSBjdXJyZW50IGl0ZW0gKi9cbnZpc2l0LlJFTU9WRSA9IFJFTU9WRTtcbi8qKiBGaW5kIHRoZSBpdGVtIGF0IGBwYXRoYCBmcm9tIGBjc3RgIGFzIHRoZSByb290ICovXG52aXNpdC5pdGVtQXRQYXRoID0gKGNzdCwgcGF0aCkgPT4ge1xuICAgIGxldCBpdGVtID0gY3N0O1xuICAgIGZvciAoY29uc3QgW2ZpZWxkLCBpbmRleF0gb2YgcGF0aCkge1xuICAgICAgICBjb25zdCB0b2sgPSBpdGVtPy5bZmllbGRdO1xuICAgICAgICBpZiAodG9rICYmICdpdGVtcycgaW4gdG9rKSB7XG4gICAgICAgICAgICBpdGVtID0gdG9rLml0ZW1zW2luZGV4XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gaXRlbTtcbn07XG4vKipcbiAqIEdldCB0aGUgaW1tZWRpYXRlIHBhcmVudCBjb2xsZWN0aW9uIG9mIHRoZSBpdGVtIGF0IGBwYXRoYCBmcm9tIGBjc3RgIGFzIHRoZSByb290LlxuICpcbiAqIFRocm93cyBhbiBlcnJvciBpZiB0aGUgY29sbGVjdGlvbiBpcyBub3QgZm91bmQsIHdoaWNoIHNob3VsZCBuZXZlciBoYXBwZW4gaWYgdGhlIGl0ZW0gaXRzZWxmIGV4aXN0cy5cbiAqL1xudmlzaXQucGFyZW50Q29sbGVjdGlvbiA9IChjc3QsIHBhdGgpID0+IHtcbiAgICBjb25zdCBwYXJlbnQgPSB2aXNpdC5pdGVtQXRQYXRoKGNzdCwgcGF0aC5zbGljZSgwLCAtMSkpO1xuICAgIGNvbnN0IGZpZWxkID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdWzBdO1xuICAgIGNvbnN0IGNvbGwgPSBwYXJlbnQ/LltmaWVsZF07XG4gICAgaWYgKGNvbGwgJiYgJ2l0ZW1zJyBpbiBjb2xsKVxuICAgICAgICByZXR1cm4gY29sbDtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmVudCBjb2xsZWN0aW9uIG5vdCBmb3VuZCcpO1xufTtcbmZ1bmN0aW9uIF92aXNpdChwYXRoLCBpdGVtLCB2aXNpdG9yKSB7XG4gICAgbGV0IGN0cmwgPSB2aXNpdG9yKGl0ZW0sIHBhdGgpO1xuICAgIGlmICh0eXBlb2YgY3RybCA9PT0gJ3N5bWJvbCcpXG4gICAgICAgIHJldHVybiBjdHJsO1xuICAgIGZvciAoY29uc3QgZmllbGQgb2YgWydrZXknLCAndmFsdWUnXSkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IGl0ZW1bZmllbGRdO1xuICAgICAgICBpZiAodG9rZW4gJiYgJ2l0ZW1zJyBpbiB0b2tlbikge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbi5pdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNpID0gX3Zpc2l0KE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQoW1tmaWVsZCwgaV1dKSksIHRva2VuLml0ZW1zW2ldLCB2aXNpdG9yKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNpID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICAgICAgaSA9IGNpIC0gMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gQlJFQUspXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gUkVNT1ZFKSB7XG4gICAgICAgICAgICAgICAgICAgIHRva2VuLml0ZW1zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3RybCA9PT0gJ2Z1bmN0aW9uJyAmJiBmaWVsZCA9PT0gJ2tleScpXG4gICAgICAgICAgICAgICAgY3RybCA9IGN0cmwoaXRlbSwgcGF0aCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiBjdHJsID09PSAnZnVuY3Rpb24nID8gY3RybChpdGVtLCBwYXRoKSA6IGN0cmw7XG59XG5cbmV4cG9ydCB7IHZpc2l0IH07XG4iLCAiaW1wb3J0IHsgQk9NLCBET0NVTUVOVCwgRkxPV19FTkQsIFNDQUxBUiB9IGZyb20gJy4vY3N0LmpzJztcblxuLypcblNUQVJUIC0+IHN0cmVhbVxuXG5zdHJlYW1cbiAgZGlyZWN0aXZlIC0+IGxpbmUtZW5kIC0+IHN0cmVhbVxuICBpbmRlbnQgKyBsaW5lLWVuZCAtPiBzdHJlYW1cbiAgW2Vsc2VdIC0+IGxpbmUtc3RhcnRcblxubGluZS1lbmRcbiAgY29tbWVudCAtPiBsaW5lLWVuZFxuICBuZXdsaW5lIC0+IC5cbiAgaW5wdXQtZW5kIC0+IEVORFxuXG5saW5lLXN0YXJ0XG4gIGRvYy1zdGFydCAtPiBkb2NcbiAgZG9jLWVuZCAtPiBzdHJlYW1cbiAgW2Vsc2VdIC0+IGluZGVudCAtPiBibG9jay1zdGFydFxuXG5ibG9jay1zdGFydFxuICBzZXEtaXRlbS1zdGFydCAtPiBibG9jay1zdGFydFxuICBleHBsaWNpdC1rZXktc3RhcnQgLT4gYmxvY2stc3RhcnRcbiAgbWFwLXZhbHVlLXN0YXJ0IC0+IGJsb2NrLXN0YXJ0XG4gIFtlbHNlXSAtPiBkb2NcblxuZG9jXG4gIGxpbmUtZW5kIC0+IGxpbmUtc3RhcnRcbiAgc3BhY2VzIC0+IGRvY1xuICBhbmNob3IgLT4gZG9jXG4gIHRhZyAtPiBkb2NcbiAgZmxvdy1zdGFydCAtPiBmbG93IC0+IGRvY1xuICBmbG93LWVuZCAtPiBlcnJvciAtPiBkb2NcbiAgc2VxLWl0ZW0tc3RhcnQgLT4gZXJyb3IgLT4gZG9jXG4gIGV4cGxpY2l0LWtleS1zdGFydCAtPiBlcnJvciAtPiBkb2NcbiAgbWFwLXZhbHVlLXN0YXJ0IC0+IGRvY1xuICBhbGlhcyAtPiBkb2NcbiAgcXVvdGUtc3RhcnQgLT4gcXVvdGVkLXNjYWxhciAtPiBkb2NcbiAgYmxvY2stc2NhbGFyLWhlYWRlciAtPiBsaW5lLWVuZCAtPiBibG9jay1zY2FsYXIobWluKSAtPiBsaW5lLXN0YXJ0XG4gIFtlbHNlXSAtPiBwbGFpbi1zY2FsYXIoZmFsc2UsIG1pbikgLT4gZG9jXG5cbmZsb3dcbiAgbGluZS1lbmQgLT4gZmxvd1xuICBzcGFjZXMgLT4gZmxvd1xuICBhbmNob3IgLT4gZmxvd1xuICB0YWcgLT4gZmxvd1xuICBmbG93LXN0YXJ0IC0+IGZsb3cgLT4gZmxvd1xuICBmbG93LWVuZCAtPiAuXG4gIHNlcS1pdGVtLXN0YXJ0IC0+IGVycm9yIC0+IGZsb3dcbiAgZXhwbGljaXQta2V5LXN0YXJ0IC0+IGZsb3dcbiAgbWFwLXZhbHVlLXN0YXJ0IC0+IGZsb3dcbiAgYWxpYXMgLT4gZmxvd1xuICBxdW90ZS1zdGFydCAtPiBxdW90ZWQtc2NhbGFyIC0+IGZsb3dcbiAgY29tbWEgLT4gZmxvd1xuICBbZWxzZV0gLT4gcGxhaW4tc2NhbGFyKHRydWUsIDApIC0+IGZsb3dcblxucXVvdGVkLXNjYWxhclxuICBxdW90ZS1lbmQgLT4gLlxuICBbZWxzZV0gLT4gcXVvdGVkLXNjYWxhclxuXG5ibG9jay1zY2FsYXIobWluKVxuICBuZXdsaW5lICsgcGVlayhpbmRlbnQgPCBtaW4pIC0+IC5cbiAgW2Vsc2VdIC0+IGJsb2NrLXNjYWxhcihtaW4pXG5cbnBsYWluLXNjYWxhcihpcy1mbG93LCBtaW4pXG4gIHNjYWxhci1lbmQoaXMtZmxvdykgLT4gLlxuICBwZWVrKG5ld2xpbmUgKyAoaW5kZW50IDwgbWluKSkgLT4gLlxuICBbZWxzZV0gLT4gcGxhaW4tc2NhbGFyKG1pbilcbiovXG5mdW5jdGlvbiBpc0VtcHR5KGNoKSB7XG4gICAgc3dpdGNoIChjaCkge1xuICAgICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgY2FzZSAnICc6XG4gICAgICAgIGNhc2UgJ1xcbic6XG4gICAgICAgIGNhc2UgJ1xccic6XG4gICAgICAgIGNhc2UgJ1xcdCc6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5jb25zdCBoZXhEaWdpdHMgPSBuZXcgU2V0KCcwMTIzNDU2Nzg5QUJDREVGYWJjZGVmJyk7XG5jb25zdCB0YWdDaGFycyA9IG5ldyBTZXQoXCIwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ei0jOy8/OkAmPSskXy4hfionKClcIik7XG5jb25zdCBmbG93SW5kaWNhdG9yQ2hhcnMgPSBuZXcgU2V0KCcsW117fScpO1xuY29uc3QgaW52YWxpZEFuY2hvckNoYXJzID0gbmV3IFNldCgnICxbXXt9XFxuXFxyXFx0Jyk7XG5jb25zdCBpc05vdEFuY2hvckNoYXIgPSAoY2gpID0+ICFjaCB8fCBpbnZhbGlkQW5jaG9yQ2hhcnMuaGFzKGNoKTtcbi8qKlxuICogU3BsaXRzIGFuIGlucHV0IHN0cmluZyBpbnRvIGxleGljYWwgdG9rZW5zLCBpLmUuIHNtYWxsZXIgc3RyaW5ncyB0aGF0IGFyZVxuICogZWFzaWx5IGlkZW50aWZpYWJsZSBieSBgdG9rZW5zLnRva2VuVHlwZSgpYC5cbiAqXG4gKiBMZXhpbmcgc3RhcnRzIGFsd2F5cyBpbiBhIFwic3RyZWFtXCIgY29udGV4dC4gSW5jb21wbGV0ZSBpbnB1dCBtYXkgYmUgYnVmZmVyZWRcbiAqIHVudGlsIGEgY29tcGxldGUgdG9rZW4gY2FuIGJlIGVtaXR0ZWQuXG4gKlxuICogSW4gYWRkaXRpb24gdG8gc2xpY2VzIG9mIHRoZSBvcmlnaW5hbCBpbnB1dCwgdGhlIGZvbGxvd2luZyBjb250cm9sIGNoYXJhY3RlcnNcbiAqIG1heSBhbHNvIGJlIGVtaXR0ZWQ6XG4gKlxuICogLSBgXFx4MDJgIChTdGFydCBvZiBUZXh0KTogQSBkb2N1bWVudCBzdGFydHMgd2l0aCB0aGUgbmV4dCB0b2tlblxuICogLSBgXFx4MThgIChDYW5jZWwpOiBVbmV4cGVjdGVkIGVuZCBvZiBmbG93LW1vZGUgKGluZGljYXRlcyBhbiBlcnJvcilcbiAqIC0gYFxceDFmYCAoVW5pdCBTZXBhcmF0b3IpOiBOZXh0IHRva2VuIGlzIGEgc2NhbGFyIHZhbHVlXG4gKiAtIGBcXHV7RkVGRn1gIChCeXRlIG9yZGVyIG1hcmspOiBFbWl0dGVkIHNlcGFyYXRlbHkgb3V0c2lkZSBkb2N1bWVudHNcbiAqL1xuY2xhc3MgTGV4ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogRmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGVuZCBvZiB0aGUgY3VycmVudCBidWZmZXIgbWFya3MgdGhlIGVuZCBvZlxuICAgICAgICAgKiBhbGwgaW5wdXRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYXRFbmQgPSBmYWxzZTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEV4cGxpY2l0IGluZGVudCBzZXQgaW4gYmxvY2sgc2NhbGFyIGhlYWRlciwgYXMgYW4gb2Zmc2V0IGZyb20gdGhlIGN1cnJlbnRcbiAgICAgICAgICogbWluaW11bSBpbmRlbnQsIHNvIGUuZy4gc2V0IHRvIDEgZnJvbSBhIGhlYWRlciBgfDIrYC4gU2V0IHRvIC0xIGlmIG5vdFxuICAgICAgICAgKiBleHBsaWNpdGx5IHNldC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYmxvY2tTY2FsYXJJbmRlbnQgPSAtMTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEJsb2NrIHNjYWxhcnMgdGhhdCBpbmNsdWRlIGEgKyAoa2VlcCkgY2hvbXBpbmcgaW5kaWNhdG9yIGluIHRoZWlyIGhlYWRlclxuICAgICAgICAgKiBpbmNsdWRlIHRyYWlsaW5nIGVtcHR5IGxpbmVzLCB3aGljaCBhcmUgb3RoZXJ3aXNlIGV4Y2x1ZGVkIGZyb20gdGhlXG4gICAgICAgICAqIHNjYWxhcidzIGNvbnRlbnRzLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ibG9ja1NjYWxhcktlZXAgPSBmYWxzZTtcbiAgICAgICAgLyoqIEN1cnJlbnQgaW5wdXQgKi9cbiAgICAgICAgdGhpcy5idWZmZXIgPSAnJztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZsYWcgbm90aW5nIHdoZXRoZXIgdGhlIG1hcCB2YWx1ZSBpbmRpY2F0b3IgOiBjYW4gaW1tZWRpYXRlbHkgZm9sbG93IHRoaXNcbiAgICAgICAgICogbm9kZSB3aXRoaW4gYSBmbG93IGNvbnRleHQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgLyoqIENvdW50IG9mIHN1cnJvdW5kaW5nIGZsb3cgY29sbGVjdGlvbiBsZXZlbHMuICovXG4gICAgICAgIHRoaXMuZmxvd0xldmVsID0gMDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1pbmltdW0gbGV2ZWwgb2YgaW5kZW50YXRpb24gcmVxdWlyZWQgZm9yIG5leHQgbGluZXMgdG8gYmUgcGFyc2VkIGFzIGFcbiAgICAgICAgICogcGFydCBvZiB0aGUgY3VycmVudCBzY2FsYXIgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmluZGVudE5leHQgPSAwO1xuICAgICAgICAvKiogSW5kZW50YXRpb24gbGV2ZWwgb2YgdGhlIGN1cnJlbnQgbGluZS4gKi9cbiAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSA9IDA7XG4gICAgICAgIC8qKiBQb3NpdGlvbiBvZiB0aGUgbmV4dCBcXG4gY2hhcmFjdGVyLiAqL1xuICAgICAgICB0aGlzLmxpbmVFbmRQb3MgPSBudWxsO1xuICAgICAgICAvKiogU3RvcmVzIHRoZSBzdGF0ZSBvZiB0aGUgbGV4ZXIgaWYgcmVhY2hpbmcgdGhlIGVuZCBvZiBpbmNwb21wbGV0ZSBpbnB1dCAqL1xuICAgICAgICB0aGlzLm5leHQgPSBudWxsO1xuICAgICAgICAvKiogQSBwb2ludGVyIHRvIGBidWZmZXJgOyB0aGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgbGV4ZXIuICovXG4gICAgICAgIHRoaXMucG9zID0gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgWUFNTCB0b2tlbnMgZnJvbSB0aGUgYHNvdXJjZWAgc3RyaW5nLiBJZiBgaW5jb21wbGV0ZWAsXG4gICAgICogYSBwYXJ0IG9mIHRoZSBsYXN0IGxpbmUgbWF5IGJlIGxlZnQgYXMgYSBidWZmZXIgZm9yIHRoZSBuZXh0IGNhbGwuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIGdlbmVyYXRvciBvZiBsZXhpY2FsIHRva2Vuc1xuICAgICAqL1xuICAgICpsZXgoc291cmNlLCBpbmNvbXBsZXRlID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2UgIT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgIHRocm93IFR5cGVFcnJvcignc291cmNlIGlzIG5vdCBhIHN0cmluZycpO1xuICAgICAgICAgICAgdGhpcy5idWZmZXIgPSB0aGlzLmJ1ZmZlciA/IHRoaXMuYnVmZmVyICsgc291cmNlIDogc291cmNlO1xuICAgICAgICAgICAgdGhpcy5saW5lRW5kUG9zID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmF0RW5kID0gIWluY29tcGxldGU7XG4gICAgICAgIGxldCBuZXh0ID0gdGhpcy5uZXh0ID8/ICdzdHJlYW0nO1xuICAgICAgICB3aGlsZSAobmV4dCAmJiAoaW5jb21wbGV0ZSB8fCB0aGlzLmhhc0NoYXJzKDEpKSlcbiAgICAgICAgICAgIG5leHQgPSB5aWVsZCogdGhpcy5wYXJzZU5leHQobmV4dCk7XG4gICAgfVxuICAgIGF0TGluZUVuZCgpIHtcbiAgICAgICAgbGV0IGkgPSB0aGlzLnBvcztcbiAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgIHdoaWxlIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0JylcbiAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgaWYgKCFjaCB8fCBjaCA9PT0gJyMnIHx8IGNoID09PSAnXFxuJylcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBpZiAoY2ggPT09ICdcXHInKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyW2kgKyAxXSA9PT0gJ1xcbic7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY2hhckF0KG4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyW3RoaXMucG9zICsgbl07XG4gICAgfVxuICAgIGNvbnRpbnVlU2NhbGFyKG9mZnNldCkge1xuICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltvZmZzZXRdO1xuICAgICAgICBpZiAodGhpcy5pbmRlbnROZXh0ID4gMCkge1xuICAgICAgICAgICAgbGV0IGluZGVudCA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoY2ggPT09ICcgJylcbiAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraW5kZW50ICsgb2Zmc2V0XTtcbiAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xccicpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5idWZmZXJbaW5kZW50ICsgb2Zmc2V0ICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKG5leHQgPT09ICdcXG4nIHx8ICghbmV4dCAmJiAhdGhpcy5hdEVuZCkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvZmZzZXQgKyBpbmRlbnQgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNoID09PSAnXFxuJyB8fCBpbmRlbnQgPj0gdGhpcy5pbmRlbnROZXh0IHx8ICghY2ggJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICAgICAgPyBvZmZzZXQgKyBpbmRlbnRcbiAgICAgICAgICAgICAgICA6IC0xO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaCA9PT0gJy0nIHx8IGNoID09PSAnLicpIHtcbiAgICAgICAgICAgIGNvbnN0IGR0ID0gdGhpcy5idWZmZXIuc3Vic3RyKG9mZnNldCwgMyk7XG4gICAgICAgICAgICBpZiAoKGR0ID09PSAnLS0tJyB8fCBkdCA9PT0gJy4uLicpICYmIGlzRW1wdHkodGhpcy5idWZmZXJbb2Zmc2V0ICsgM10pKVxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2Zmc2V0O1xuICAgIH1cbiAgICBnZXRMaW5lKCkge1xuICAgICAgICBsZXQgZW5kID0gdGhpcy5saW5lRW5kUG9zO1xuICAgICAgICBpZiAodHlwZW9mIGVuZCAhPT0gJ251bWJlcicgfHwgKGVuZCAhPT0gLTEgJiYgZW5kIDwgdGhpcy5wb3MpKSB7XG4gICAgICAgICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKCdcXG4nLCB0aGlzLnBvcyk7XG4gICAgICAgICAgICB0aGlzLmxpbmVFbmRQb3MgPSBlbmQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVuZCA9PT0gLTEpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdEVuZCA/IHRoaXMuYnVmZmVyLnN1YnN0cmluZyh0aGlzLnBvcykgOiBudWxsO1xuICAgICAgICBpZiAodGhpcy5idWZmZXJbZW5kIC0gMV0gPT09ICdcXHInKVxuICAgICAgICAgICAgZW5kIC09IDE7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1ZmZlci5zdWJzdHJpbmcodGhpcy5wb3MsIGVuZCk7XG4gICAgfVxuICAgIGhhc0NoYXJzKG4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9zICsgbiA8PSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gICAgfVxuICAgIHNldE5leHQoc3RhdGUpIHtcbiAgICAgICAgdGhpcy5idWZmZXIgPSB0aGlzLmJ1ZmZlci5zdWJzdHJpbmcodGhpcy5wb3MpO1xuICAgICAgICB0aGlzLnBvcyA9IDA7XG4gICAgICAgIHRoaXMubGluZUVuZFBvcyA9IG51bGw7XG4gICAgICAgIHRoaXMubmV4dCA9IHN0YXRlO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcGVlayhuKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1ZmZlci5zdWJzdHIodGhpcy5wb3MsIG4pO1xuICAgIH1cbiAgICAqcGFyc2VOZXh0KG5leHQpIHtcbiAgICAgICAgc3dpdGNoIChuZXh0KSB7XG4gICAgICAgICAgICBjYXNlICdzdHJlYW0nOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVN0cmVhbSgpO1xuICAgICAgICAgICAgY2FzZSAnbGluZS1zdGFydCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlTGluZVN0YXJ0KCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zdGFydCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlQmxvY2tTdGFydCgpO1xuICAgICAgICAgICAgY2FzZSAnZG9jJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VEb2N1bWVudCgpO1xuICAgICAgICAgICAgY2FzZSAnZmxvdyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlRmxvd0NvbGxlY3Rpb24oKTtcbiAgICAgICAgICAgIGNhc2UgJ3F1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVF1b3RlZFNjYWxhcigpO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1NjYWxhcigpO1xuICAgICAgICAgICAgY2FzZSAncGxhaW4tc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VQbGFpblNjYWxhcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpwYXJzZVN0cmVhbSgpIHtcbiAgICAgICAgbGV0IGxpbmUgPSB0aGlzLmdldExpbmUoKTtcbiAgICAgICAgaWYgKGxpbmUgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdzdHJlYW0nKTtcbiAgICAgICAgaWYgKGxpbmVbMF0gPT09IEJPTSkge1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgbGluZSA9IGxpbmUuc3Vic3RyaW5nKDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaW5lWzBdID09PSAnJScpIHtcbiAgICAgICAgICAgIGxldCBkaXJFbmQgPSBsaW5lLmxlbmd0aDtcbiAgICAgICAgICAgIGxldCBjcyA9IGxpbmUuaW5kZXhPZignIycpO1xuICAgICAgICAgICAgd2hpbGUgKGNzICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoID0gbGluZVtjcyAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0Jykge1xuICAgICAgICAgICAgICAgICAgICBkaXJFbmQgPSBjcyAtIDE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3MgPSBsaW5lLmluZGV4T2YoJyMnLCBjcyArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2ggPSBsaW5lW2RpckVuZCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICAgICAgZGlyRW5kIC09IDE7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG4gPSAoeWllbGQqIHRoaXMucHVzaENvdW50KGRpckVuZCkpICsgKHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSkpO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gbik7IC8vIHBvc3NpYmxlIGNvbW1lbnRcbiAgICAgICAgICAgIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgIHJldHVybiAnc3RyZWFtJztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5hdExpbmVFbmQoKSkge1xuICAgICAgICAgICAgY29uc3Qgc3AgPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gc3ApO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgIHJldHVybiAnc3RyZWFtJztcbiAgICAgICAgfVxuICAgICAgICB5aWVsZCBET0NVTUVOVDtcbiAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlTGluZVN0YXJ0KCk7XG4gICAgfVxuICAgICpwYXJzZUxpbmVTdGFydCgpIHtcbiAgICAgICAgY29uc3QgY2ggPSB0aGlzLmNoYXJBdCgwKTtcbiAgICAgICAgaWYgKCFjaCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2xpbmUtc3RhcnQnKTtcbiAgICAgICAgaWYgKGNoID09PSAnLScgfHwgY2ggPT09ICcuJykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmF0RW5kICYmICF0aGlzLmhhc0NoYXJzKDQpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2xpbmUtc3RhcnQnKTtcbiAgICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLnBlZWsoMyk7XG4gICAgICAgICAgICBpZiAoKHMgPT09ICctLS0nIHx8IHMgPT09ICcuLi4nKSAmJiBpc0VtcHR5KHRoaXMuY2hhckF0KDMpKSkge1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudFZhbHVlID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPSAwO1xuICAgICAgICAgICAgICAgIHJldHVybiBzID09PSAnLS0tJyA/ICdkb2MnIDogJ3N0cmVhbSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSA9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXMoZmFsc2UpO1xuICAgICAgICBpZiAodGhpcy5pbmRlbnROZXh0ID4gdGhpcy5pbmRlbnRWYWx1ZSAmJiAhaXNFbXB0eSh0aGlzLmNoYXJBdCgxKSkpXG4gICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPSB0aGlzLmluZGVudFZhbHVlO1xuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1N0YXJ0KCk7XG4gICAgfVxuICAgICpwYXJzZUJsb2NrU3RhcnQoKSB7XG4gICAgICAgIGNvbnN0IFtjaDAsIGNoMV0gPSB0aGlzLnBlZWsoMik7XG4gICAgICAgIGlmICghY2gxICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnYmxvY2stc3RhcnQnKTtcbiAgICAgICAgaWYgKChjaDAgPT09ICctJyB8fCBjaDAgPT09ICc/JyB8fCBjaDAgPT09ICc6JykgJiYgaXNFbXB0eShjaDEpKSB7XG4gICAgICAgICAgICBjb25zdCBuID0gKHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKSkgKyAoeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKSk7XG4gICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPSB0aGlzLmluZGVudFZhbHVlICsgMTtcbiAgICAgICAgICAgIHRoaXMuaW5kZW50VmFsdWUgKz0gbjtcbiAgICAgICAgICAgIHJldHVybiAnYmxvY2stc3RhcnQnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnZG9jJztcbiAgICB9XG4gICAgKnBhcnNlRG9jdW1lbnQoKSB7XG4gICAgICAgIHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgIGNvbnN0IGxpbmUgPSB0aGlzLmdldExpbmUoKTtcbiAgICAgICAgaWYgKGxpbmUgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdkb2MnKTtcbiAgICAgICAgbGV0IG4gPSB5aWVsZCogdGhpcy5wdXNoSW5kaWNhdG9ycygpO1xuICAgICAgICBzd2l0Y2ggKGxpbmVbbl0pIHtcbiAgICAgICAgICAgIGNhc2UgJyMnOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudChsaW5lLmxlbmd0aCAtIG4pO1xuICAgICAgICAgICAgLy8gZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hOZXdsaW5lKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlTGluZVN0YXJ0KCk7XG4gICAgICAgICAgICBjYXNlICd7JzpcbiAgICAgICAgICAgIGNhc2UgJ1snOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dMZXZlbCA9IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgIGNhc2UgJ30nOlxuICAgICAgICAgICAgY2FzZSAnXSc6XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhbiBlcnJvclxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2RvYyc7XG4gICAgICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoVW50aWwoaXNOb3RBbmNob3JDaGFyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2RvYyc7XG4gICAgICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICBjYXNlIFwiJ1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVF1b3RlZFNjYWxhcigpO1xuICAgICAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnBhcnNlQmxvY2tTY2FsYXJIZWFkZXIoKTtcbiAgICAgICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gbik7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1NjYWxhcigpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VQbGFpblNjYWxhcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpwYXJzZUZsb3dDb2xsZWN0aW9uKCkge1xuICAgICAgICBsZXQgbmwsIHNwO1xuICAgICAgICBsZXQgaW5kZW50ID0gLTE7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIG5sID0geWllbGQqIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgIGlmIChubCA+IDApIHtcbiAgICAgICAgICAgICAgICBzcCA9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXMoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50VmFsdWUgPSBpbmRlbnQgPSBzcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNwID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNwICs9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgIH0gd2hpbGUgKG5sICsgc3AgPiAwKTtcbiAgICAgICAgY29uc3QgbGluZSA9IHRoaXMuZ2V0TGluZSgpO1xuICAgICAgICBpZiAobGluZSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2Zsb3cnKTtcbiAgICAgICAgaWYgKChpbmRlbnQgIT09IC0xICYmIGluZGVudCA8IHRoaXMuaW5kZW50TmV4dCAmJiBsaW5lWzBdICE9PSAnIycpIHx8XG4gICAgICAgICAgICAoaW5kZW50ID09PSAwICYmXG4gICAgICAgICAgICAgICAgKGxpbmUuc3RhcnRzV2l0aCgnLS0tJykgfHwgbGluZS5zdGFydHNXaXRoKCcuLi4nKSkgJiZcbiAgICAgICAgICAgICAgICBpc0VtcHR5KGxpbmVbM10pKSkge1xuICAgICAgICAgICAgLy8gQWxsb3dpbmcgZm9yIHRoZSB0ZXJtaW5hbCBdIG9yIH0gYXQgdGhlIHNhbWUgKHJhdGhlciB0aGFuIGdyZWF0ZXIpXG4gICAgICAgICAgICAvLyBpbmRlbnQgbGV2ZWwgYXMgdGhlIGluaXRpYWwgWyBvciB7IGlzIHRlY2huaWNhbGx5IGludmFsaWQsIGJ1dFxuICAgICAgICAgICAgLy8gZmFpbGluZyBoZXJlIHdvdWxkIGJlIHN1cnByaXNpbmcgdG8gdXNlcnMuXG4gICAgICAgICAgICBjb25zdCBhdEZsb3dFbmRNYXJrZXIgPSBpbmRlbnQgPT09IHRoaXMuaW5kZW50TmV4dCAtIDEgJiZcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dMZXZlbCA9PT0gMSAmJlxuICAgICAgICAgICAgICAgIChsaW5lWzBdID09PSAnXScgfHwgbGluZVswXSA9PT0gJ30nKTtcbiAgICAgICAgICAgIGlmICghYXRGbG93RW5kTWFya2VyKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhbiBlcnJvclxuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0xldmVsID0gMDtcbiAgICAgICAgICAgICAgICB5aWVsZCBGTE9XX0VORDtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQgbiA9IDA7XG4gICAgICAgIHdoaWxlIChsaW5lW25dID09PSAnLCcpIHtcbiAgICAgICAgICAgIG4gKz0geWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoSW5kaWNhdG9ycygpO1xuICAgICAgICBzd2l0Y2ggKGxpbmVbbl0pIHtcbiAgICAgICAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBuKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAneyc6XG4gICAgICAgICAgICBjYXNlICdbJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgKz0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAnfSc6XG4gICAgICAgICAgICBjYXNlICddJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dMZXZlbCAtPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZsb3dMZXZlbCA/ICdmbG93JyA6ICdkb2MnO1xuICAgICAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaFVudGlsKGlzTm90QW5jaG9yQ2hhcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VRdW90ZWRTY2FsYXIoKTtcbiAgICAgICAgICAgIGNhc2UgJzonOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuY2hhckF0KDEpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZsb3dLZXkgfHwgaXNFbXB0eShuZXh0KSB8fCBuZXh0ID09PSAnLCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VQbGFpblNjYWxhcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpwYXJzZVF1b3RlZFNjYWxhcigpIHtcbiAgICAgICAgY29uc3QgcXVvdGUgPSB0aGlzLmNoYXJBdCgwKTtcbiAgICAgICAgbGV0IGVuZCA9IHRoaXMuYnVmZmVyLmluZGV4T2YocXVvdGUsIHRoaXMucG9zICsgMSk7XG4gICAgICAgIGlmIChxdW90ZSA9PT0gXCInXCIpIHtcbiAgICAgICAgICAgIHdoaWxlIChlbmQgIT09IC0xICYmIHRoaXMuYnVmZmVyW2VuZCArIDFdID09PSBcIidcIilcbiAgICAgICAgICAgICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKFwiJ1wiLCBlbmQgKyAyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGRvdWJsZS1xdW90ZVxuICAgICAgICAgICAgd2hpbGUgKGVuZCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBsZXQgbiA9IDA7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuYnVmZmVyW2VuZCAtIDEgLSBuXSA9PT0gJ1xcXFwnKVxuICAgICAgICAgICAgICAgICAgICBuICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKG4gJSAyID09PSAwKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKCdcIicsIGVuZCArIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE9ubHkgbG9va2luZyBmb3IgbmV3bGluZXMgd2l0aGluIHRoZSBxdW90ZXNcbiAgICAgICAgY29uc3QgcWIgPSB0aGlzLmJ1ZmZlci5zdWJzdHJpbmcoMCwgZW5kKTtcbiAgICAgICAgbGV0IG5sID0gcWIuaW5kZXhPZignXFxuJywgdGhpcy5wb3MpO1xuICAgICAgICBpZiAobmwgIT09IC0xKSB7XG4gICAgICAgICAgICB3aGlsZSAobmwgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3MgPSB0aGlzLmNvbnRpbnVlU2NhbGFyKG5sICsgMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNzID09PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgbmwgPSBxYi5pbmRleE9mKCdcXG4nLCBjcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobmwgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhbiBlcnJvciBjYXVzZWQgYnkgYW4gdW5leHBlY3RlZCB1bmluZGVudFxuICAgICAgICAgICAgICAgIGVuZCA9IG5sIC0gKHFiW25sIC0gMV0gPT09ICdcXHInID8gMiA6IDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgncXVvdGVkLXNjYWxhcicpO1xuICAgICAgICAgICAgZW5kID0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGVuZCArIDEsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvd0xldmVsID8gJ2Zsb3cnIDogJ2RvYyc7XG4gICAgfVxuICAgICpwYXJzZUJsb2NrU2NhbGFySGVhZGVyKCkge1xuICAgICAgICB0aGlzLmJsb2NrU2NhbGFySW5kZW50ID0gLTE7XG4gICAgICAgIHRoaXMuYmxvY2tTY2FsYXJLZWVwID0gZmFsc2U7XG4gICAgICAgIGxldCBpID0gdGhpcy5wb3M7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgICAgICBpZiAoY2ggPT09ICcrJylcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2NrU2NhbGFyS2VlcCA9IHRydWU7XG4gICAgICAgICAgICBlbHNlIGlmIChjaCA+ICcwJyAmJiBjaCA8PSAnOScpXG4gICAgICAgICAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCA9IE51bWJlcihjaCkgLSAxO1xuICAgICAgICAgICAgZWxzZSBpZiAoY2ggIT09ICctJylcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaFVudGlsKGNoID0+IGlzRW1wdHkoY2gpIHx8IGNoID09PSAnIycpO1xuICAgIH1cbiAgICAqcGFyc2VCbG9ja1NjYWxhcigpIHtcbiAgICAgICAgbGV0IG5sID0gdGhpcy5wb3MgLSAxOyAvLyBtYXkgYmUgLTEgaWYgdGhpcy5wb3MgPT09IDBcbiAgICAgICAgbGV0IGluZGVudCA9IDA7XG4gICAgICAgIGxldCBjaDtcbiAgICAgICAgbG9vcDogZm9yIChsZXQgaSA9IHRoaXMucG9zOyAoY2ggPSB0aGlzLmJ1ZmZlcltpXSk7ICsraSkge1xuICAgICAgICAgICAgc3dpdGNoIChjaCkge1xuICAgICAgICAgICAgICAgIGNhc2UgJyAnOlxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnXFxuJzpcbiAgICAgICAgICAgICAgICAgICAgbmwgPSBpO1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdcXHInOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmJ1ZmZlcltpICsgMV07XG4gICAgICAgICAgICAgICAgICAgIGlmICghbmV4dCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2Jsb2NrLXNjYWxhcicpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9IC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgbG9vcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNoICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnYmxvY2stc2NhbGFyJyk7XG4gICAgICAgIGlmIChpbmRlbnQgPj0gdGhpcy5pbmRlbnROZXh0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ibG9ja1NjYWxhckluZGVudCA9PT0gLTEpXG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gaW5kZW50O1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCArICh0aGlzLmluZGVudE5leHQgPT09IDAgPyAxIDogdGhpcy5pbmRlbnROZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcyA9IHRoaXMuY29udGludWVTY2FsYXIobmwgKyAxKTtcbiAgICAgICAgICAgICAgICBpZiAoY3MgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBubCA9IHRoaXMuYnVmZmVyLmluZGV4T2YoJ1xcbicsIGNzKTtcbiAgICAgICAgICAgIH0gd2hpbGUgKG5sICE9PSAtMSk7XG4gICAgICAgICAgICBpZiAobmwgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdibG9jay1zY2FsYXInKTtcbiAgICAgICAgICAgICAgICBubCA9IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBUcmFpbGluZyBpbnN1ZmZpY2llbnRseSBpbmRlbnRlZCB0YWJzIGFyZSBpbnZhbGlkLlxuICAgICAgICAvLyBUbyBjYXRjaCB0aGF0IGR1cmluZyBwYXJzaW5nLCB3ZSBpbmNsdWRlIHRoZW0gaW4gdGhlIGJsb2NrIHNjYWxhciB2YWx1ZS5cbiAgICAgICAgbGV0IGkgPSBubCArIDE7XG4gICAgICAgIGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgIHdoaWxlIChjaCA9PT0gJyAnKVxuICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICBpZiAoY2ggPT09ICdcXHQnKSB7XG4gICAgICAgICAgICB3aGlsZSAoY2ggPT09ICdcXHQnIHx8IGNoID09PSAnICcgfHwgY2ggPT09ICdcXHInIHx8IGNoID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgICAgICBubCA9IGkgLSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCF0aGlzLmJsb2NrU2NhbGFyS2VlcCkge1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGxldCBpID0gbmwgLSAxO1xuICAgICAgICAgICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xccicpXG4gICAgICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbLS1pXTtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0Q2hhciA9IGk7IC8vIERyb3AgdGhlIGxpbmUgaWYgbGFzdCBjaGFyIG5vdCBtb3JlIGluZGVudGVkXG4gICAgICAgICAgICAgICAgd2hpbGUgKGNoID09PSAnICcpXG4gICAgICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbLS1pXTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcXG4nICYmIGkgPj0gdGhpcy5wb3MgJiYgaSArIDEgKyBpbmRlbnQgPiBsYXN0Q2hhcilcbiAgICAgICAgICAgICAgICAgICAgbmwgPSBpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IHdoaWxlICh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICB5aWVsZCBTQ0FMQVI7XG4gICAgICAgIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KG5sICsgMSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUxpbmVTdGFydCgpO1xuICAgIH1cbiAgICAqcGFyc2VQbGFpblNjYWxhcigpIHtcbiAgICAgICAgY29uc3QgaW5GbG93ID0gdGhpcy5mbG93TGV2ZWwgPiAwO1xuICAgICAgICBsZXQgZW5kID0gdGhpcy5wb3MgLSAxO1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zIC0gMTtcbiAgICAgICAgbGV0IGNoO1xuICAgICAgICB3aGlsZSAoKGNoID0gdGhpcy5idWZmZXJbKytpXSkpIHtcbiAgICAgICAgICAgIGlmIChjaCA9PT0gJzonKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuYnVmZmVyW2kgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAoaXNFbXB0eShuZXh0KSB8fCAoaW5GbG93ICYmIGZsb3dJbmRpY2F0b3JDaGFycy5oYXMobmV4dCkpKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNFbXB0eShjaCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dCA9IHRoaXMuYnVmZmVyW2kgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcXHInKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0ID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2ggPSAnXFxuJztcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLmJ1ZmZlcltpICsgMV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5leHQgPT09ICcjJyB8fCAoaW5GbG93ICYmIGZsb3dJbmRpY2F0b3JDaGFycy5oYXMobmV4dCkpKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNzID0gdGhpcy5jb250aW51ZVNjYWxhcihpICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjcyA9PT0gLTEpXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgaSA9IE1hdGgubWF4KGksIGNzIC0gMik7IC8vIHRvIGFkdmFuY2UsIGJ1dCBzdGlsbCBhY2NvdW50IGZvciAnICMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGluRmxvdyAmJiBmbG93SW5kaWNhdG9yQ2hhcnMuaGFzKGNoKSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNoICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgncGxhaW4tc2NhbGFyJyk7XG4gICAgICAgIHlpZWxkIFNDQUxBUjtcbiAgICAgICAgeWllbGQqIHRoaXMucHVzaFRvSW5kZXgoZW5kICsgMSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBpbkZsb3cgPyAnZmxvdycgOiAnZG9jJztcbiAgICB9XG4gICAgKnB1c2hDb3VudChuKSB7XG4gICAgICAgIGlmIChuID4gMCkge1xuICAgICAgICAgICAgeWllbGQgdGhpcy5idWZmZXIuc3Vic3RyKHRoaXMucG9zLCBuKTtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IG47XG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgKnB1c2hUb0luZGV4KGksIGFsbG93RW1wdHkpIHtcbiAgICAgICAgY29uc3QgcyA9IHRoaXMuYnVmZmVyLnNsaWNlKHRoaXMucG9zLCBpKTtcbiAgICAgICAgaWYgKHMpIHtcbiAgICAgICAgICAgIHlpZWxkIHM7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSBzLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhbGxvd0VtcHR5KVxuICAgICAgICAgICAgeWllbGQgJyc7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICAqcHVzaEluZGljYXRvcnMoKSB7XG4gICAgICAgIGxldCBuID0gMDtcbiAgICAgICAgbG9vcDogd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5jaGFyQXQoMCkpIHtcbiAgICAgICAgICAgICAgICBjYXNlICchJzpcbiAgICAgICAgICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoVGFnKCk7XG4gICAgICAgICAgICAgICAgICAgIG4gKz0geWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWUgbG9vcDtcbiAgICAgICAgICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoVW50aWwoaXNOb3RBbmNob3JDaGFyKTtcbiAgICAgICAgICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZSBsb29wO1xuICAgICAgICAgICAgICAgIGNhc2UgJy0nOiAvLyB0aGlzIGlzIGFuIGVycm9yXG4gICAgICAgICAgICAgICAgY2FzZSAnPyc6IC8vIHRoaXMgaXMgYW4gZXJyb3Igb3V0c2lkZSBmbG93IGNvbGxlY3Rpb25zXG4gICAgICAgICAgICAgICAgY2FzZSAnOic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5GbG93ID0gdGhpcy5mbG93TGV2ZWwgPiAwO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaDEgPSB0aGlzLmNoYXJBdCgxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRW1wdHkoY2gxKSB8fCAoaW5GbG93ICYmIGZsb3dJbmRpY2F0b3JDaGFycy5oYXMoY2gxKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaW5GbG93KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IHRoaXMuaW5kZW50VmFsdWUgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5mbG93S2V5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZSBsb29wO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWsgbG9vcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG4gICAgKnB1c2hUYWcoKSB7XG4gICAgICAgIGlmICh0aGlzLmNoYXJBdCgxKSA9PT0gJzwnKSB7XG4gICAgICAgICAgICBsZXQgaSA9IHRoaXMucG9zICsgMjtcbiAgICAgICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICAgICAgd2hpbGUgKCFpc0VtcHR5KGNoKSAmJiBjaCAhPT0gJz4nKVxuICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChjaCA9PT0gJz4nID8gaSArIDEgOiBpLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgaSA9IHRoaXMucG9zICsgMTtcbiAgICAgICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICAgICAgd2hpbGUgKGNoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhZ0NoYXJzLmhhcyhjaCkpXG4gICAgICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaCA9PT0gJyUnICYmXG4gICAgICAgICAgICAgICAgICAgIGhleERpZ2l0cy5oYXModGhpcy5idWZmZXJbaSArIDFdKSAmJlxuICAgICAgICAgICAgICAgICAgICBoZXhEaWdpdHMuaGFzKHRoaXMuYnVmZmVyW2kgKyAyXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsoaSArPSAzKV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaFRvSW5kZXgoaSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpwdXNoTmV3bGluZSgpIHtcbiAgICAgICAgY29uc3QgY2ggPSB0aGlzLmJ1ZmZlclt0aGlzLnBvc107XG4gICAgICAgIGlmIChjaCA9PT0gJ1xcbicpXG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICBlbHNlIGlmIChjaCA9PT0gJ1xccicgJiYgdGhpcy5jaGFyQXQoMSkgPT09ICdcXG4nKVxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgyKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgICpwdXNoU3BhY2VzKGFsbG93VGFicykge1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zIC0gMTtcbiAgICAgICAgbGV0IGNoO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgIH0gd2hpbGUgKGNoID09PSAnICcgfHwgKGFsbG93VGFicyAmJiBjaCA9PT0gJ1xcdCcpKTtcbiAgICAgICAgY29uc3QgbiA9IGkgLSB0aGlzLnBvcztcbiAgICAgICAgaWYgKG4gPiAwKSB7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLmJ1ZmZlci5zdWJzdHIodGhpcy5wb3MsIG4pO1xuICAgICAgICAgICAgdGhpcy5wb3MgPSBpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cbiAgICAqcHVzaFVudGlsKHRlc3QpIHtcbiAgICAgICAgbGV0IGkgPSB0aGlzLnBvcztcbiAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgIHdoaWxlICghdGVzdChjaCkpXG4gICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChpLCBmYWxzZSk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBMZXhlciB9O1xuIiwgIi8qKlxuICogVHJhY2tzIG5ld2xpbmVzIGR1cmluZyBwYXJzaW5nIGluIG9yZGVyIHRvIHByb3ZpZGUgYW4gZWZmaWNpZW50IEFQSSBmb3JcbiAqIGRldGVybWluaW5nIHRoZSBvbmUtaW5kZXhlZCBgeyBsaW5lLCBjb2wgfWAgcG9zaXRpb24gZm9yIGFueSBvZmZzZXRcbiAqIHdpdGhpbiB0aGUgaW5wdXQuXG4gKi9cbmNsYXNzIExpbmVDb3VudGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5saW5lU3RhcnRzID0gW107XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTaG91bGQgYmUgY2FsbGVkIGluIGFzY2VuZGluZyBvcmRlci4gT3RoZXJ3aXNlLCBjYWxsXG4gICAgICAgICAqIGBsaW5lQ291bnRlci5saW5lU3RhcnRzLnNvcnQoKWAgYmVmb3JlIGNhbGxpbmcgYGxpbmVQb3MoKWAuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZE5ld0xpbmUgPSAob2Zmc2V0KSA9PiB0aGlzLmxpbmVTdGFydHMucHVzaChvZmZzZXQpO1xuICAgICAgICAvKipcbiAgICAgICAgICogUGVyZm9ybXMgYSBiaW5hcnkgc2VhcmNoIGFuZCByZXR1cm5zIHRoZSAxLWluZGV4ZWQgeyBsaW5lLCBjb2wgfVxuICAgICAgICAgKiBwb3NpdGlvbiBvZiBgb2Zmc2V0YC4gSWYgYGxpbmUgPT09IDBgLCBgYWRkTmV3TGluZWAgaGFzIG5ldmVyIGJlZW5cbiAgICAgICAgICogY2FsbGVkIG9yIGBvZmZzZXRgIGlzIGJlZm9yZSB0aGUgZmlyc3Qga25vd24gbmV3bGluZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubGluZVBvcyA9IChvZmZzZXQpID0+IHtcbiAgICAgICAgICAgIGxldCBsb3cgPSAwO1xuICAgICAgICAgICAgbGV0IGhpZ2ggPSB0aGlzLmxpbmVTdGFydHMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtaWQgPSAobG93ICsgaGlnaCkgPj4gMTsgLy8gTWF0aC5mbG9vcigobG93ICsgaGlnaCkgLyAyKVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxpbmVTdGFydHNbbWlkXSA8IG9mZnNldClcbiAgICAgICAgICAgICAgICAgICAgbG93ID0gbWlkICsgMTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGhpZ2ggPSBtaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5saW5lU3RhcnRzW2xvd10gPT09IG9mZnNldClcbiAgICAgICAgICAgICAgICByZXR1cm4geyBsaW5lOiBsb3cgKyAxLCBjb2w6IDEgfTtcbiAgICAgICAgICAgIGlmIChsb3cgPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgbGluZTogMCwgY29sOiBvZmZzZXQgfTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5saW5lU3RhcnRzW2xvdyAtIDFdO1xuICAgICAgICAgICAgcmV0dXJuIHsgbGluZTogbG93LCBjb2w6IG9mZnNldCAtIHN0YXJ0ICsgMSB9O1xuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IHsgTGluZUNvdW50ZXIgfTtcbiIsICJpbXBvcnQgeyB0b2tlblR5cGUgfSBmcm9tICcuL2NzdC5qcyc7XG5pbXBvcnQgeyBMZXhlciB9IGZyb20gJy4vbGV4ZXIuanMnO1xuXG5mdW5jdGlvbiBpbmNsdWRlc1Rva2VuKGxpc3QsIHR5cGUpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpXG4gICAgICAgIGlmIChsaXN0W2ldLnR5cGUgPT09IHR5cGUpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBmaW5kTm9uRW1wdHlJbmRleChsaXN0KSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHN3aXRjaCAobGlzdFtpXS50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG59XG5mdW5jdGlvbiBpc0Zsb3dUb2tlbih0b2tlbikge1xuICAgIHN3aXRjaCAodG9rZW4/LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGdldFByZXZQcm9wcyhwYXJlbnQpIHtcbiAgICBzd2l0Y2ggKHBhcmVudC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2RvY3VtZW50JzpcbiAgICAgICAgICAgIHJldHVybiBwYXJlbnQuc3RhcnQ7XG4gICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6IHtcbiAgICAgICAgICAgIGNvbnN0IGl0ID0gcGFyZW50Lml0ZW1zW3BhcmVudC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIHJldHVybiBpdC5zZXAgPz8gaXQuc3RhcnQ7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnYmxvY2stc2VxJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJlbnQuaXRlbXNbcGFyZW50Lml0ZW1zLmxlbmd0aCAtIDFdLnN0YXJ0O1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbn1cbi8qKiBOb3RlOiBNYXkgbW9kaWZ5IGlucHV0IGFycmF5ICovXG5mdW5jdGlvbiBnZXRGaXJzdEtleVN0YXJ0UHJvcHMocHJldikge1xuICAgIGlmIChwcmV2Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIGxldCBpID0gcHJldi5sZW5ndGg7XG4gICAgbG9vcDogd2hpbGUgKC0taSA+PSAwKSB7XG4gICAgICAgIHN3aXRjaCAocHJldltpXS50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdkb2Mtc3RhcnQnOlxuICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6XG4gICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ3NlcS1pdGVtLWluZCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBicmVhayBsb29wO1xuICAgICAgICB9XG4gICAgfVxuICAgIHdoaWxlIChwcmV2WysraV0/LnR5cGUgPT09ICdzcGFjZScpIHtcbiAgICAgICAgLyogbG9vcCAqL1xuICAgIH1cbiAgICByZXR1cm4gcHJldi5zcGxpY2UoaSwgcHJldi5sZW5ndGgpO1xufVxuZnVuY3Rpb24gYXJyYXlQdXNoQXJyYXkodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICAvLyBNYXkgZXhoYXVzdCBjYWxsIHN0YWNrIHdpdGggbGFyZ2UgYHNvdXJjZWAgYXJyYXlcbiAgICBpZiAoc291cmNlLmxlbmd0aCA8IDFlNSlcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkodGFyZ2V0LCBzb3VyY2UpO1xuICAgIGVsc2VcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzb3VyY2UubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICB0YXJnZXQucHVzaChzb3VyY2VbaV0pO1xufVxuZnVuY3Rpb24gZml4Rmxvd1NlcUl0ZW1zKGZjKSB7XG4gICAgaWYgKGZjLnN0YXJ0LnR5cGUgPT09ICdmbG93LXNlcS1zdGFydCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBpdCBvZiBmYy5pdGVtcykge1xuICAgICAgICAgICAgaWYgKGl0LnNlcCAmJlxuICAgICAgICAgICAgICAgICFpdC52YWx1ZSAmJlxuICAgICAgICAgICAgICAgICFpbmNsdWRlc1Rva2VuKGl0LnN0YXJ0LCAnZXhwbGljaXQta2V5LWluZCcpICYmXG4gICAgICAgICAgICAgICAgIWluY2x1ZGVzVG9rZW4oaXQuc2VwLCAnbWFwLXZhbHVlLWluZCcpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0LmtleSlcbiAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUgPSBpdC5rZXk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGl0LmtleTtcbiAgICAgICAgICAgICAgICBpZiAoaXNGbG93VG9rZW4oaXQudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZS5lbmQpXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJheVB1c2hBcnJheShpdC52YWx1ZS5lbmQsIGl0LnNlcCk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnZhbHVlLmVuZCA9IGl0LnNlcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBhcnJheVB1c2hBcnJheShpdC5zdGFydCwgaXQuc2VwKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgaXQuc2VwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiBBIFlBTUwgY29uY3JldGUgc3ludGF4IHRyZWUgKENTVCkgcGFyc2VyXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IHNyYzogc3RyaW5nID0gLi4uXG4gKiBmb3IgKGNvbnN0IHRva2VuIG9mIG5ldyBQYXJzZXIoKS5wYXJzZShzcmMpKSB7XG4gKiAgIC8vIHRva2VuOiBUb2tlblxuICogfVxuICogYGBgXG4gKlxuICogVG8gdXNlIHRoZSBwYXJzZXIgd2l0aCBhIHVzZXItcHJvdmlkZWQgbGV4ZXI6XG4gKlxuICogYGBgdHNcbiAqIGZ1bmN0aW9uKiBwYXJzZShzb3VyY2U6IHN0cmluZywgbGV4ZXI6IExleGVyKSB7XG4gKiAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIoKVxuICogICBmb3IgKGNvbnN0IGxleGVtZSBvZiBsZXhlci5sZXgoc291cmNlKSlcbiAqICAgICB5aWVsZCogcGFyc2VyLm5leHQobGV4ZW1lKVxuICogICB5aWVsZCogcGFyc2VyLmVuZCgpXG4gKiB9XG4gKlxuICogY29uc3Qgc3JjOiBzdHJpbmcgPSAuLi5cbiAqIGNvbnN0IGxleGVyID0gbmV3IExleGVyKClcbiAqIGZvciAoY29uc3QgdG9rZW4gb2YgcGFyc2Uoc3JjLCBsZXhlcikpIHtcbiAqICAgLy8gdG9rZW46IFRva2VuXG4gKiB9XG4gKiBgYGBcbiAqL1xuY2xhc3MgUGFyc2VyIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0gb25OZXdMaW5lIC0gSWYgZGVmaW5lZCwgY2FsbGVkIHNlcGFyYXRlbHkgd2l0aCB0aGUgc3RhcnQgcG9zaXRpb24gb2ZcbiAgICAgKiAgIGVhY2ggbmV3IGxpbmUgKGluIGBwYXJzZSgpYCwgaW5jbHVkaW5nIHRoZSBzdGFydCBvZiBpbnB1dCkuXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iob25OZXdMaW5lKSB7XG4gICAgICAgIC8qKiBJZiB0cnVlLCBzcGFjZSBhbmQgc2VxdWVuY2UgaW5kaWNhdG9ycyBjb3VudCBhcyBpbmRlbnRhdGlvbiAqL1xuICAgICAgICB0aGlzLmF0TmV3TGluZSA9IHRydWU7XG4gICAgICAgIC8qKiBJZiB0cnVlLCBuZXh0IHRva2VuIGlzIGEgc2NhbGFyIHZhbHVlICovXG4gICAgICAgIHRoaXMuYXRTY2FsYXIgPSBmYWxzZTtcbiAgICAgICAgLyoqIEN1cnJlbnQgaW5kZW50YXRpb24gbGV2ZWwgKi9cbiAgICAgICAgdGhpcy5pbmRlbnQgPSAwO1xuICAgICAgICAvKiogQ3VycmVudCBvZmZzZXQgc2luY2UgdGhlIHN0YXJ0IG9mIHBhcnNpbmcgKi9cbiAgICAgICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgICAgICAvKiogT24gdGhlIHNhbWUgbGluZSB3aXRoIGEgYmxvY2sgbWFwIGtleSAqL1xuICAgICAgICB0aGlzLm9uS2V5TGluZSA9IGZhbHNlO1xuICAgICAgICAvKiogVG9wIGluZGljYXRlcyB0aGUgbm9kZSB0aGF0J3MgY3VycmVudGx5IGJlaW5nIGJ1aWx0ICovXG4gICAgICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICAgICAgLyoqIFRoZSBzb3VyY2Ugb2YgdGhlIGN1cnJlbnQgdG9rZW4sIHNldCBpbiBwYXJzZSgpICovXG4gICAgICAgIHRoaXMuc291cmNlID0gJyc7XG4gICAgICAgIC8qKiBUaGUgdHlwZSBvZiB0aGUgY3VycmVudCB0b2tlbiwgc2V0IGluIHBhcnNlKCkgKi9cbiAgICAgICAgdGhpcy50eXBlID0gJyc7XG4gICAgICAgIC8vIE11c3QgYmUgZGVmaW5lZCBhZnRlciBgbmV4dCgpYFxuICAgICAgICB0aGlzLmxleGVyID0gbmV3IExleGVyKCk7XG4gICAgICAgIHRoaXMub25OZXdMaW5lID0gb25OZXdMaW5lO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQYXJzZSBgc291cmNlYCBhcyBhIFlBTUwgc3RyZWFtLlxuICAgICAqIElmIGBpbmNvbXBsZXRlYCwgYSBwYXJ0IG9mIHRoZSBsYXN0IGxpbmUgbWF5IGJlIGxlZnQgYXMgYSBidWZmZXIgZm9yIHRoZSBuZXh0IGNhbGwuXG4gICAgICpcbiAgICAgKiBFcnJvcnMgYXJlIG5vdCB0aHJvd24sIGJ1dCB5aWVsZGVkIGFzIGB7IHR5cGU6ICdlcnJvcicsIG1lc3NhZ2UgfWAgdG9rZW5zLlxuICAgICAqXG4gICAgICogQHJldHVybnMgQSBnZW5lcmF0b3Igb2YgdG9rZW5zIHJlcHJlc2VudGluZyBlYWNoIGRpcmVjdGl2ZSwgZG9jdW1lbnQsIGFuZCBvdGhlciBzdHJ1Y3R1cmUuXG4gICAgICovXG4gICAgKnBhcnNlKHNvdXJjZSwgaW5jb21wbGV0ZSA9IGZhbHNlKSB7XG4gICAgICAgIGlmICh0aGlzLm9uTmV3TGluZSAmJiB0aGlzLm9mZnNldCA9PT0gMClcbiAgICAgICAgICAgIHRoaXMub25OZXdMaW5lKDApO1xuICAgICAgICBmb3IgKGNvbnN0IGxleGVtZSBvZiB0aGlzLmxleGVyLmxleChzb3VyY2UsIGluY29tcGxldGUpKVxuICAgICAgICAgICAgeWllbGQqIHRoaXMubmV4dChsZXhlbWUpO1xuICAgICAgICBpZiAoIWluY29tcGxldGUpXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5lbmQoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWR2YW5jZSB0aGUgcGFyc2VyIGJ5IHRoZSBgc291cmNlYCBvZiBvbmUgbGV4aWNhbCB0b2tlbi5cbiAgICAgKi9cbiAgICAqbmV4dChzb3VyY2UpIHtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIGlmICh0aGlzLmF0U2NhbGFyKSB7XG4gICAgICAgICAgICB0aGlzLmF0U2NhbGFyID0gZmFsc2U7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICB0aGlzLm9mZnNldCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR5cGUgPSB0b2tlblR5cGUoc291cmNlKTtcbiAgICAgICAgaWYgKCF0eXBlKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gYE5vdCBhIFlBTUwgdG9rZW46ICR7c291cmNlfWA7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoeyB0eXBlOiAnZXJyb3InLCBvZmZzZXQ6IHRoaXMub2Zmc2V0LCBtZXNzYWdlLCBzb3VyY2UgfSk7XG4gICAgICAgICAgICB0aGlzLm9mZnNldCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdzY2FsYXInKSB7XG4gICAgICAgICAgICB0aGlzLmF0TmV3TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5hdFNjYWxhciA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSAnc2NhbGFyJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdE5ld0xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGVudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uTmV3TGluZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25OZXdMaW5lKHRoaXMub2Zmc2V0ICsgc291cmNlLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXROZXdMaW5lICYmIHNvdXJjZVswXSA9PT0gJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRlbnQgKz0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2VxLWl0ZW0taW5kJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXROZXdMaW5lKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRlbnQgKz0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZG9jLW1vZGUnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb3ctZXJyb3ItZW5kJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXROZXdMaW5lID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9mZnNldCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKiBDYWxsIGF0IGVuZCBvZiBpbnB1dCB0byBwdXNoIG91dCBhbnkgcmVtYWluaW5nIGNvbnN0cnVjdGlvbnMgKi9cbiAgICAqZW5kKCkge1xuICAgICAgICB3aGlsZSAodGhpcy5zdGFjay5sZW5ndGggPiAwKVxuICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgfVxuICAgIGdldCBzb3VyY2VUb2tlbigpIHtcbiAgICAgICAgY29uc3Qgc3QgPSB7XG4gICAgICAgICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHN0O1xuICAgIH1cbiAgICAqc3RlcCgpIHtcbiAgICAgICAgY29uc3QgdG9wID0gdGhpcy5wZWVrKDEpO1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnZG9jLWVuZCcgJiYgdG9wPy50eXBlICE9PSAnZG9jLWVuZCcpIHtcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdkb2MtZW5kJyxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdG9wKVxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnN0cmVhbSgpO1xuICAgICAgICBzd2l0Y2ggKHRvcC50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdkb2N1bWVudCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmRvY3VtZW50KHRvcCk7XG4gICAgICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5zY2FsYXIodG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmJsb2NrU2NhbGFyKHRvcCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1tYXAnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5ibG9ja01hcCh0b3ApO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2VxJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuYmxvY2tTZXF1ZW5jZSh0b3ApO1xuICAgICAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuZmxvd0NvbGxlY3Rpb24odG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1lbmQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5kb2N1bWVudEVuZCh0b3ApO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgIH1cbiAgICBwZWVrKG4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhY2tbdGhpcy5zdGFjay5sZW5ndGggLSBuXTtcbiAgICB9XG4gICAgKnBvcChlcnJvcikge1xuICAgICAgICBjb25zdCB0b2tlbiA9IGVycm9yID8/IHRoaXMuc3RhY2sucG9wKCk7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ1RyaWVkIHRvIHBvcCBhbiBlbXB0eSBzdGFjayc7XG4gICAgICAgICAgICB5aWVsZCB7IHR5cGU6ICdlcnJvcicsIG9mZnNldDogdGhpcy5vZmZzZXQsIHNvdXJjZTogJycsIG1lc3NhZ2UgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLnN0YWNrLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgeWllbGQgdG9rZW47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0b3AgPSB0aGlzLnBlZWsoMSk7XG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNjYWxhcicpIHtcbiAgICAgICAgICAgICAgICAvLyBCbG9jayBzY2FsYXJzIHVzZSB0aGVpciBwYXJlbnQgcmF0aGVyIHRoYW4gaGVhZGVyIGluZGVudFxuICAgICAgICAgICAgICAgIHRva2VuLmluZGVudCA9ICdpbmRlbnQnIGluIHRvcCA/IHRvcC5pbmRlbnQgOiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodG9rZW4udHlwZSA9PT0gJ2Zsb3ctY29sbGVjdGlvbicgJiYgdG9wLnR5cGUgPT09ICdkb2N1bWVudCcpIHtcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmUgYWxsIGluZGVudCBmb3IgdG9wLWxldmVsIGZsb3cgY29sbGVjdGlvbnNcbiAgICAgICAgICAgICAgICB0b2tlbi5pbmRlbnQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICdmbG93LWNvbGxlY3Rpb24nKVxuICAgICAgICAgICAgICAgIGZpeEZsb3dTZXFJdGVtcyh0b2tlbik7XG4gICAgICAgICAgICBzd2l0Y2ggKHRvcC50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZG9jdW1lbnQnOlxuICAgICAgICAgICAgICAgICAgICB0b3AudmFsdWUgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgICAgICAgICAgdG9wLnByb3BzLnB1c2godG9rZW4pOyAvLyBlcnJvclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdibG9jay1tYXAnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ID0gdG9wLml0ZW1zW3RvcC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuaXRlbXMucHVzaCh7IHN0YXJ0OiBbXSwga2V5OiB0b2tlbiwgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnZhbHVlID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogdG9rZW4sIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9ICFpdC5leHBsaWNpdEtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnYmxvY2stc2VxJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpdCA9IHRvcC5pdGVtc1t0b3AuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCB2YWx1ZTogdG9rZW4gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnZhbHVlID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ID0gdG9wLml0ZW1zW3RvcC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdCB8fCBpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCBrZXk6IHRva2VuLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC52YWx1ZSA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogdG9rZW4sIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKHRva2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgodG9wLnR5cGUgPT09ICdkb2N1bWVudCcgfHxcbiAgICAgICAgICAgICAgICB0b3AudHlwZSA9PT0gJ2Jsb2NrLW1hcCcgfHxcbiAgICAgICAgICAgICAgICB0b3AudHlwZSA9PT0gJ2Jsb2NrLXNlcScpICYmXG4gICAgICAgICAgICAgICAgKHRva2VuLnR5cGUgPT09ICdibG9jay1tYXAnIHx8IHRva2VuLnR5cGUgPT09ICdibG9jay1zZXEnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3QgPSB0b2tlbi5pdGVtc1t0b2tlbi5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAobGFzdCAmJlxuICAgICAgICAgICAgICAgICAgICAhbGFzdC5zZXAgJiZcbiAgICAgICAgICAgICAgICAgICAgIWxhc3QudmFsdWUgJiZcbiAgICAgICAgICAgICAgICAgICAgbGFzdC5zdGFydC5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICAgICAgICAgIGZpbmROb25FbXB0eUluZGV4KGxhc3Quc3RhcnQpID09PSAtMSAmJlxuICAgICAgICAgICAgICAgICAgICAodG9rZW4uaW5kZW50ID09PSAwIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0LnN0YXJ0LmV2ZXJ5KHN0ID0+IHN0LnR5cGUgIT09ICdjb21tZW50JyB8fCBzdC5pbmRlbnQgPCB0b2tlbi5pbmRlbnQpKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodG9wLnR5cGUgPT09ICdkb2N1bWVudCcpXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuZW5kID0gbGFzdC5zdGFydDtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLml0ZW1zLnB1c2goeyBzdGFydDogbGFzdC5zdGFydCB9KTtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uaXRlbXMuc3BsaWNlKC0xLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnN0cmVhbSgpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RpcmVjdGl2ZS1saW5lJzpcbiAgICAgICAgICAgICAgICB5aWVsZCB7IHR5cGU6ICdkaXJlY3RpdmUnLCBvZmZzZXQ6IHRoaXMub2Zmc2V0LCBzb3VyY2U6IHRoaXMuc291cmNlIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnYnl0ZS1vcmRlci1tYXJrJzpcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgeWllbGQgdGhpcy5zb3VyY2VUb2tlbjtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdkb2MtbW9kZSc6XG4gICAgICAgICAgICBjYXNlICdkb2Mtc3RhcnQnOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZG9jID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZG9jdW1lbnQnLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBzdGFydDogW11cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdkb2Mtc3RhcnQnKVxuICAgICAgICAgICAgICAgICAgICBkb2Muc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goZG9jKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQge1xuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICBtZXNzYWdlOiBgVW5leHBlY3RlZCAke3RoaXMudHlwZX0gdG9rZW4gaW4gWUFNTCBzdHJlYW1gLFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICB9O1xuICAgIH1cbiAgICAqZG9jdW1lbnQoZG9jKSB7XG4gICAgICAgIGlmIChkb2MudmFsdWUpXG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMubGluZUVuZChkb2MpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZG9jLXN0YXJ0Jzoge1xuICAgICAgICAgICAgICAgIGlmIChmaW5kTm9uRW1wdHlJbmRleChkb2Muc3RhcnQpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGRvYy5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2FuY2hvcic6XG4gICAgICAgICAgICBjYXNlICd0YWcnOlxuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBkb2Muc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYnYgPSB0aGlzLnN0YXJ0QmxvY2tWYWx1ZShkb2MpO1xuICAgICAgICBpZiAoYnYpXG4gICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goYnYpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHlpZWxkIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYFVuZXhwZWN0ZWQgJHt0aGlzLnR5cGV9IHRva2VuIGluIFlBTUwgZG9jdW1lbnRgLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnNjYWxhcihzY2FsYXIpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ21hcC12YWx1ZS1pbmQnKSB7XG4gICAgICAgICAgICBjb25zdCBwcmV2ID0gZ2V0UHJldlByb3BzKHRoaXMucGVlaygyKSk7XG4gICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhwcmV2KTtcbiAgICAgICAgICAgIGxldCBzZXA7XG4gICAgICAgICAgICBpZiAoc2NhbGFyLmVuZCkge1xuICAgICAgICAgICAgICAgIHNlcCA9IHNjYWxhci5lbmQ7XG4gICAgICAgICAgICAgICAgc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHNjYWxhci5lbmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc2VwID0gW3RoaXMuc291cmNlVG9rZW5dO1xuICAgICAgICAgICAgY29uc3QgbWFwID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgIG9mZnNldDogc2NhbGFyLm9mZnNldCxcbiAgICAgICAgICAgICAgICBpbmRlbnQ6IHNjYWxhci5pbmRlbnQsXG4gICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IHNjYWxhciwgc2VwIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aCAtIDFdID0gbWFwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLmxpbmVFbmQoc2NhbGFyKTtcbiAgICB9XG4gICAgKmJsb2NrU2NhbGFyKHNjYWxhcikge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBzY2FsYXIucHJvcHMucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgICAgIHNjYWxhci5zb3VyY2UgPSB0aGlzLnNvdXJjZTtcbiAgICAgICAgICAgICAgICAvLyBibG9jay1zY2FsYXIgc291cmNlIGluY2x1ZGVzIHRyYWlsaW5nIG5ld2xpbmVcbiAgICAgICAgICAgICAgICB0aGlzLmF0TmV3TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnQgPSAwO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uTmV3TGluZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmwgPSB0aGlzLnNvdXJjZS5pbmRleE9mKCdcXG4nKSArIDE7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChubCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbk5ld0xpbmUodGhpcy5vZmZzZXQgKyBubCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBubCA9IHRoaXMuc291cmNlLmluZGV4T2YoJ1xcbicsIG5sKSArIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKmJsb2NrTWFwKG1hcCkge1xuICAgICAgICBjb25zdCBpdCA9IG1hcC5pdGVtc1ttYXAuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgIC8vIGl0LnNlcCBpcyB0cnVlLWlzaCBpZiBwYWlyIGFscmVhZHkgaGFzIGtleSBvciA6IHNlcGFyYXRvclxuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kID0gJ2VuZCcgaW4gaXQudmFsdWUgPyBpdC52YWx1ZS5lbmQgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3QgPSBBcnJheS5pc0FycmF5KGVuZCkgPyBlbmRbZW5kLmxlbmd0aCAtIDFdIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdD8udHlwZSA9PT0gJ2NvbW1lbnQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kPy5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0SW5kZW50ZWRDb21tZW50KGl0LnN0YXJ0LCBtYXAuaW5kZW50KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IG1hcC5pdGVtc1ttYXAuaXRlbXMubGVuZ3RoIC0gMl07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSBwcmV2Py52YWx1ZT8uZW5kO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZW5kKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5UHVzaEFycmF5KGVuZCwgaXQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmluZGVudCA+PSBtYXAuaW5kZW50KSB7XG4gICAgICAgICAgICBjb25zdCBhdE1hcEluZGVudCA9ICF0aGlzLm9uS2V5TGluZSAmJiB0aGlzLmluZGVudCA9PT0gbWFwLmluZGVudDtcbiAgICAgICAgICAgIGNvbnN0IGF0TmV4dEl0ZW0gPSBhdE1hcEluZGVudCAmJlxuICAgICAgICAgICAgICAgIChpdC5zZXAgfHwgaXQuZXhwbGljaXRLZXkpICYmXG4gICAgICAgICAgICAgICAgdGhpcy50eXBlICE9PSAnc2VxLWl0ZW0taW5kJztcbiAgICAgICAgICAgIC8vIEZvciBlbXB0eSBub2RlcywgYXNzaWduIG5ld2xpbmUtc2VwYXJhdGVkIG5vdCBpbmRlbnRlZCBlbXB0eSB0b2tlbnMgdG8gZm9sbG93aW5nIG5vZGVcbiAgICAgICAgICAgIGxldCBzdGFydCA9IFtdO1xuICAgICAgICAgICAgaWYgKGF0TmV4dEl0ZW0gJiYgaXQuc2VwICYmICFpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5sID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdC5zZXAubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3QgPSBpdC5zZXBbaV07XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoc3QudHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmwucHVzaChpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdC5pbmRlbnQgPiBtYXAuaW5kZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBubC5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBubC5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChubC5sZW5ndGggPj0gMilcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBpdC5zZXAuc3BsaWNlKG5sWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgICAgICBjYXNlICd0YWcnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoYXROZXh0SXRlbSB8fCBpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2V4cGxpY2l0LWtleS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0LnNlcCAmJiAhaXQuZXhwbGljaXRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5leHBsaWNpdEtleSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYXROZXh0SXRlbSB8fCBpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQsIGV4cGxpY2l0S2V5OiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0sIGV4cGxpY2l0S2V5OiB0cnVlIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0LmV4cGxpY2l0S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmNsdWRlc1Rva2VuKGl0LnN0YXJ0LCAnbmV3bGluZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKGl0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0OiBbXSwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGluY2x1ZGVzVG9rZW4oaXQuc2VwLCAnbWFwLXZhbHVlLWluZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNGbG93VG9rZW4oaXQua2V5KSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICFpbmNsdWRlc1Rva2VuKGl0LnNlcCwgJ25ld2xpbmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKGl0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBpdC5rZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VwID0gaXQuc2VwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHlwZSBndWFyZCBpcyB3cm9uZyBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGl0LmtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHR5cGUgZ3VhcmQgaXMgd3JvbmcgaGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBpdC5zZXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5LCBzZXAgfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXJ0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3QgYWN0dWFsbHkgYXQgbmV4dCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwID0gaXQuc2VwLmNvbmNhdChzdGFydCwgdGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQudmFsdWUgfHwgYXROZXh0SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQsIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpbmNsdWRlc1Rva2VuKGl0LnNlcCwgJ21hcC12YWx1ZS1pbmQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQ6IFtdLCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZzID0gdGhpcy5mbG93U2NhbGFyKHRoaXMudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdE5leHRJdGVtIHx8IGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0LCBrZXk6IGZzLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGZzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiBmcywgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnYgPSB0aGlzLnN0YXJ0QmxvY2tWYWx1ZShtYXApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChidi50eXBlID09PSAnYmxvY2stc2VxJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXQuZXhwbGljaXRLZXkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFpbmNsdWRlc1Rva2VuKGl0LnNlcCwgJ25ld2xpbmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3Aoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnVW5leHBlY3RlZCBibG9jay1zZXEtaW5kIG9uIHNhbWUgbGluZSB3aXRoIGtleScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYXRNYXBJbmRlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGJ2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgIH1cbiAgICAqYmxvY2tTZXF1ZW5jZShzZXEpIHtcbiAgICAgICAgY29uc3QgaXQgPSBzZXEuaXRlbXNbc2VxLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9ICdlbmQnIGluIGl0LnZhbHVlID8gaXQudmFsdWUuZW5kIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXN0ID0gQXJyYXkuaXNBcnJheShlbmQpID8gZW5kW2VuZC5sZW5ndGggLSAxXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3Q/LnR5cGUgPT09ICdjb21tZW50JylcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZD8ucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VxLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICBzZXEuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0SW5kZW50ZWRDb21tZW50KGl0LnN0YXJ0LCBzZXEuaW5kZW50KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IHNlcS5pdGVtc1tzZXEuaXRlbXMubGVuZ3RoIC0gMl07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSBwcmV2Py52YWx1ZT8uZW5kO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZW5kKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5UHVzaEFycmF5KGVuZCwgaXQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcS5pdGVtcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlIHx8IHRoaXMuaW5kZW50IDw9IHNlcS5pbmRlbnQpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnc2VxLWl0ZW0taW5kJzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbmRlbnQgIT09IHNlcS5pbmRlbnQpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSB8fCBpbmNsdWRlc1Rva2VuKGl0LnN0YXJ0LCAnc2VxLWl0ZW0taW5kJykpXG4gICAgICAgICAgICAgICAgICAgIHNlcS5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmluZGVudCA+IHNlcS5pbmRlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGJ2ID0gdGhpcy5zdGFydEJsb2NrVmFsdWUoc2VxKTtcbiAgICAgICAgICAgIGlmIChidikge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChidik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgfVxuICAgICpmbG93Q29sbGVjdGlvbihmYykge1xuICAgICAgICBjb25zdCBpdCA9IGZjLml0ZW1zW2ZjLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnZmxvdy1lcnJvci1lbmQnKSB7XG4gICAgICAgICAgICBsZXQgdG9wO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHRvcCA9IHRoaXMucGVlaygxKTtcbiAgICAgICAgICAgIH0gd2hpbGUgKHRvcD8udHlwZSA9PT0gJ2Zsb3ctY29sbGVjdGlvbicpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZjLmVuZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWEnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2V4cGxpY2l0LWtleS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZjLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQgfHwgaXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBmYy5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2FuY2hvcic6XG4gICAgICAgICAgICAgICAgY2FzZSAndGFnJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdCB8fCBpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZjLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnMgPSB0aGlzLmZsb3dTY2FsYXIodGhpcy50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdCB8fCBpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZjLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogZnMsIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChmcyk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiBmcywgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdmbG93LW1hcC1lbmQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb3ctc2VxLWVuZCc6XG4gICAgICAgICAgICAgICAgICAgIGZjLmVuZC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBidiA9IHRoaXMuc3RhcnRCbG9ja1ZhbHVlKGZjKTtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlIHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgICAgICBpZiAoYnYpXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGJ2KTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMucGVlaygyKTtcbiAgICAgICAgICAgIGlmIChwYXJlbnQudHlwZSA9PT0gJ2Jsb2NrLW1hcCcgJiZcbiAgICAgICAgICAgICAgICAoKHRoaXMudHlwZSA9PT0gJ21hcC12YWx1ZS1pbmQnICYmIHBhcmVudC5pbmRlbnQgPT09IGZjLmluZGVudCkgfHxcbiAgICAgICAgICAgICAgICAgICAgKHRoaXMudHlwZSA9PT0gJ25ld2xpbmUnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhcGFyZW50Lml0ZW1zW3BhcmVudC5pdGVtcy5sZW5ndGggLSAxXS5zZXApKSkge1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gJ21hcC12YWx1ZS1pbmQnICYmXG4gICAgICAgICAgICAgICAgcGFyZW50LnR5cGUgIT09ICdmbG93LWNvbGxlY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IGdldFByZXZQcm9wcyhwYXJlbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgICAgIGZpeEZsb3dTZXFJdGVtcyhmYyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VwID0gZmMuZW5kLnNwbGljZSgxLCBmYy5lbmQubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBzZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IGZjLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiBmYy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5OiBmYywgc2VwIH1dXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aCAtIDFdID0gbWFwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMubGluZUVuZChmYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZmxvd1NjYWxhcih0eXBlKSB7XG4gICAgICAgIGlmICh0aGlzLm9uTmV3TGluZSkge1xuICAgICAgICAgICAgbGV0IG5sID0gdGhpcy5zb3VyY2UuaW5kZXhPZignXFxuJykgKyAxO1xuICAgICAgICAgICAgd2hpbGUgKG5sICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbk5ld0xpbmUodGhpcy5vZmZzZXQgKyBubCk7XG4gICAgICAgICAgICAgICAgbmwgPSB0aGlzLnNvdXJjZS5pbmRleE9mKCdcXG4nLCBubCkgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgIH07XG4gICAgfVxuICAgIHN0YXJ0QmxvY2tWYWx1ZShwYXJlbnQpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmxvd1NjYWxhcih0aGlzLnR5cGUpO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyLWhlYWRlcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLXNjYWxhcicsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIHByb3BzOiBbdGhpcy5zb3VyY2VUb2tlbl0sXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJydcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSAnZmxvdy1tYXAtc3RhcnQnOlxuICAgICAgICAgICAgY2FzZSAnZmxvdy1zZXEtc3RhcnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdmbG93LWNvbGxlY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5zb3VyY2VUb2tlbixcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBlbmQ6IFtdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ3NlcS1pdGVtLWluZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLXNlcScsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ2V4cGxpY2l0LWtleS1pbmQnOiB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBnZXRQcmV2UHJvcHMocGFyZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhwcmV2KTtcbiAgICAgICAgICAgICAgICBzdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGV4cGxpY2l0S2V5OiB0cnVlIH1dXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOiB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBnZXRQcmV2UHJvcHMocGFyZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhwcmV2KTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgYXRJbmRlbnRlZENvbW1lbnQoc3RhcnQsIGluZGVudCkge1xuICAgICAgICBpZiAodGhpcy50eXBlICE9PSAnY29tbWVudCcpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLmluZGVudCA8PSBpbmRlbnQpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiBzdGFydC5ldmVyeShzdCA9PiBzdC50eXBlID09PSAnbmV3bGluZScgfHwgc3QudHlwZSA9PT0gJ3NwYWNlJyk7XG4gICAgfVxuICAgICpkb2N1bWVudEVuZChkb2NFbmQpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gJ2RvYy1tb2RlJykge1xuICAgICAgICAgICAgaWYgKGRvY0VuZC5lbmQpXG4gICAgICAgICAgICAgICAgZG9jRW5kLmVuZC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGRvY0VuZC5lbmQgPSBbdGhpcy5zb3VyY2VUb2tlbl07XG4gICAgICAgICAgICBpZiAodGhpcy50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKmxpbmVFbmQodG9rZW4pIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1hJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1zdGFydCc6XG4gICAgICAgICAgICBjYXNlICdkb2MtZW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3ctc2VxLWVuZCc6XG4gICAgICAgICAgICBjYXNlICdmbG93LW1hcC1lbmQnOlxuICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gYWxsIG90aGVyIHZhbHVlcyBhcmUgZXJyb3JzXG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0b2tlbi5lbmQgPSBbdGhpcy5zb3VyY2VUb2tlbl07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ25ld2xpbmUnKVxuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHsgUGFyc2VyIH07XG4iLCAiaW1wb3J0IHsgQ29tcG9zZXIgfSBmcm9tICcuL2NvbXBvc2UvY29tcG9zZXIuanMnO1xuaW1wb3J0IHsgRG9jdW1lbnQgfSBmcm9tICcuL2RvYy9Eb2N1bWVudC5qcyc7XG5pbXBvcnQgeyBwcmV0dGlmeUVycm9yLCBZQU1MUGFyc2VFcnJvciB9IGZyb20gJy4vZXJyb3JzLmpzJztcbmltcG9ydCB7IHdhcm4gfSBmcm9tICcuL2xvZy5qcyc7XG5pbXBvcnQgeyBpc0RvY3VtZW50IH0gZnJvbSAnLi9ub2Rlcy9pZGVudGl0eS5qcyc7XG5pbXBvcnQgeyBMaW5lQ291bnRlciB9IGZyb20gJy4vcGFyc2UvbGluZS1jb3VudGVyLmpzJztcbmltcG9ydCB7IFBhcnNlciB9IGZyb20gJy4vcGFyc2UvcGFyc2VyLmpzJztcblxuZnVuY3Rpb24gcGFyc2VPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBjb25zdCBwcmV0dHlFcnJvcnMgPSBvcHRpb25zLnByZXR0eUVycm9ycyAhPT0gZmFsc2U7XG4gICAgY29uc3QgbGluZUNvdW50ZXIgPSBvcHRpb25zLmxpbmVDb3VudGVyIHx8IChwcmV0dHlFcnJvcnMgJiYgbmV3IExpbmVDb3VudGVyKCkpIHx8IG51bGw7XG4gICAgcmV0dXJuIHsgbGluZUNvdW50ZXIsIHByZXR0eUVycm9ycyB9O1xufVxuLyoqXG4gKiBQYXJzZSB0aGUgaW5wdXQgYXMgYSBzdHJlYW0gb2YgWUFNTCBkb2N1bWVudHMuXG4gKlxuICogRG9jdW1lbnRzIHNob3VsZCBiZSBzZXBhcmF0ZWQgZnJvbSBlYWNoIG90aGVyIGJ5IGAuLi5gIG9yIGAtLS1gIG1hcmtlciBsaW5lcy5cbiAqXG4gKiBAcmV0dXJucyBJZiBhbiBlbXB0eSBgZG9jc2AgYXJyYXkgaXMgcmV0dXJuZWQsIGl0IHdpbGwgYmUgb2YgdHlwZVxuICogICBFbXB0eVN0cmVhbSBhbmQgY29udGFpbiBhZGRpdGlvbmFsIHN0cmVhbSBpbmZvcm1hdGlvbi4gSW5cbiAqICAgVHlwZVNjcmlwdCwgeW91IHNob3VsZCB1c2UgYCdlbXB0eScgaW4gZG9jc2AgYXMgYSB0eXBlIGd1YXJkIGZvciBpdC5cbiAqL1xuZnVuY3Rpb24gcGFyc2VBbGxEb2N1bWVudHMoc291cmNlLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7IGxpbmVDb3VudGVyLCBwcmV0dHlFcnJvcnMgfSA9IHBhcnNlT3B0aW9ucyhvcHRpb25zKTtcbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKGxpbmVDb3VudGVyPy5hZGROZXdMaW5lKTtcbiAgICBjb25zdCBjb21wb3NlciA9IG5ldyBDb21wb3NlcihvcHRpb25zKTtcbiAgICBjb25zdCBkb2NzID0gQXJyYXkuZnJvbShjb21wb3Nlci5jb21wb3NlKHBhcnNlci5wYXJzZShzb3VyY2UpKSk7XG4gICAgaWYgKHByZXR0eUVycm9ycyAmJiBsaW5lQ291bnRlcilcbiAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgZG9jcykge1xuICAgICAgICAgICAgZG9jLmVycm9ycy5mb3JFYWNoKHByZXR0aWZ5RXJyb3Ioc291cmNlLCBsaW5lQ291bnRlcikpO1xuICAgICAgICAgICAgZG9jLndhcm5pbmdzLmZvckVhY2gocHJldHRpZnlFcnJvcihzb3VyY2UsIGxpbmVDb3VudGVyKSk7XG4gICAgICAgIH1cbiAgICBpZiAoZG9jcy5sZW5ndGggPiAwKVxuICAgICAgICByZXR1cm4gZG9jcztcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihbXSwgeyBlbXB0eTogdHJ1ZSB9LCBjb21wb3Nlci5zdHJlYW1JbmZvKCkpO1xufVxuLyoqIFBhcnNlIGFuIGlucHV0IHN0cmluZyBpbnRvIGEgc2luZ2xlIFlBTUwuRG9jdW1lbnQgKi9cbmZ1bmN0aW9uIHBhcnNlRG9jdW1lbnQoc291cmNlLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7IGxpbmVDb3VudGVyLCBwcmV0dHlFcnJvcnMgfSA9IHBhcnNlT3B0aW9ucyhvcHRpb25zKTtcbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKGxpbmVDb3VudGVyPy5hZGROZXdMaW5lKTtcbiAgICBjb25zdCBjb21wb3NlciA9IG5ldyBDb21wb3NlcihvcHRpb25zKTtcbiAgICAvLyBgZG9jYCBpcyBhbHdheXMgc2V0IGJ5IGNvbXBvc2UuZW5kKHRydWUpIGF0IHRoZSB2ZXJ5IGxhdGVzdFxuICAgIGxldCBkb2MgPSBudWxsO1xuICAgIGZvciAoY29uc3QgX2RvYyBvZiBjb21wb3Nlci5jb21wb3NlKHBhcnNlci5wYXJzZShzb3VyY2UpLCB0cnVlLCBzb3VyY2UubGVuZ3RoKSkge1xuICAgICAgICBpZiAoIWRvYylcbiAgICAgICAgICAgIGRvYyA9IF9kb2M7XG4gICAgICAgIGVsc2UgaWYgKGRvYy5vcHRpb25zLmxvZ0xldmVsICE9PSAnc2lsZW50Jykge1xuICAgICAgICAgICAgZG9jLmVycm9ycy5wdXNoKG5ldyBZQU1MUGFyc2VFcnJvcihfZG9jLnJhbmdlLnNsaWNlKDAsIDIpLCAnTVVMVElQTEVfRE9DUycsICdTb3VyY2UgY29udGFpbnMgbXVsdGlwbGUgZG9jdW1lbnRzOyBwbGVhc2UgdXNlIFlBTUwucGFyc2VBbGxEb2N1bWVudHMoKScpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChwcmV0dHlFcnJvcnMgJiYgbGluZUNvdW50ZXIpIHtcbiAgICAgICAgZG9jLmVycm9ycy5mb3JFYWNoKHByZXR0aWZ5RXJyb3Ioc291cmNlLCBsaW5lQ291bnRlcikpO1xuICAgICAgICBkb2Mud2FybmluZ3MuZm9yRWFjaChwcmV0dGlmeUVycm9yKHNvdXJjZSwgbGluZUNvdW50ZXIpKTtcbiAgICB9XG4gICAgcmV0dXJuIGRvYztcbn1cbmZ1bmN0aW9uIHBhcnNlKHNyYywgcmV2aXZlciwgb3B0aW9ucykge1xuICAgIGxldCBfcmV2aXZlciA9IHVuZGVmaW5lZDtcbiAgICBpZiAodHlwZW9mIHJldml2ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgX3Jldml2ZXIgPSByZXZpdmVyO1xuICAgIH1cbiAgICBlbHNlIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQgJiYgcmV2aXZlciAmJiB0eXBlb2YgcmV2aXZlciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgb3B0aW9ucyA9IHJldml2ZXI7XG4gICAgfVxuICAgIGNvbnN0IGRvYyA9IHBhcnNlRG9jdW1lbnQoc3JjLCBvcHRpb25zKTtcbiAgICBpZiAoIWRvYylcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgZG9jLndhcm5pbmdzLmZvckVhY2god2FybmluZyA9PiB3YXJuKGRvYy5vcHRpb25zLmxvZ0xldmVsLCB3YXJuaW5nKSk7XG4gICAgaWYgKGRvYy5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoZG9jLm9wdGlvbnMubG9nTGV2ZWwgIT09ICdzaWxlbnQnKVxuICAgICAgICAgICAgdGhyb3cgZG9jLmVycm9yc1swXTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZG9jLmVycm9ycyA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gZG9jLnRvSlMoT2JqZWN0LmFzc2lnbih7IHJldml2ZXI6IF9yZXZpdmVyIH0sIG9wdGlvbnMpKTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeSh2YWx1ZSwgcmVwbGFjZXIsIG9wdGlvbnMpIHtcbiAgICBsZXQgX3JlcGxhY2VyID0gbnVsbDtcbiAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nIHx8IEFycmF5LmlzQXJyYXkocmVwbGFjZXIpKSB7XG4gICAgICAgIF9yZXBsYWNlciA9IHJlcGxhY2VyO1xuICAgIH1cbiAgICBlbHNlIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQgJiYgcmVwbGFjZXIpIHtcbiAgICAgICAgb3B0aW9ucyA9IHJlcGxhY2VyO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKVxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucy5sZW5ndGg7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnbnVtYmVyJykge1xuICAgICAgICBjb25zdCBpbmRlbnQgPSBNYXRoLnJvdW5kKG9wdGlvbnMpO1xuICAgICAgICBvcHRpb25zID0gaW5kZW50IDwgMSA/IHVuZGVmaW5lZCA6IGluZGVudCA+IDggPyB7IGluZGVudDogOCB9IDogeyBpbmRlbnQgfTtcbiAgICB9XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgeyBrZWVwVW5kZWZpbmVkIH0gPSBvcHRpb25zID8/IHJlcGxhY2VyID8/IHt9O1xuICAgICAgICBpZiAoIWtlZXBVbmRlZmluZWQpXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoaXNEb2N1bWVudCh2YWx1ZSkgJiYgIV9yZXBsYWNlcilcbiAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKG9wdGlvbnMpO1xuICAgIHJldHVybiBuZXcgRG9jdW1lbnQodmFsdWUsIF9yZXBsYWNlciwgb3B0aW9ucykudG9TdHJpbmcob3B0aW9ucyk7XG59XG5cbmV4cG9ydCB7IHBhcnNlLCBwYXJzZUFsbERvY3VtZW50cywgcGFyc2VEb2N1bWVudCwgc3RyaW5naWZ5IH07XG4iLCAiLy8gYGV4cG9ydCAqIGFzIGRlZmF1bHQgZnJvbSAuLi5gIGZhaWxzIG9uIFdlYnBhY2sgdjRcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9lZW1lbGkveWFtbC9pc3N1ZXMvMjI4XG5pbXBvcnQgKiBhcyBZQU1MIGZyb20gJy4vZGlzdC9pbmRleC5qcydcbmV4cG9ydCBkZWZhdWx0IFlBTUxcbmV4cG9ydCAqIGZyb20gJy4vZGlzdC9pbmRleC5qcydcbiIsICJleHBvcnQgY29uc3Qgc2hvdyA9IGVsID0+IChlbC5zdHlsZS5kaXNwbGF5ID0gJycpO1xuZXhwb3J0IGNvbnN0IGhpZGUgPSBlbCA9PiAoZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVEaXNwbGF5KHNob3csIGVsZW1lbnQsIG90aGVyRWxlbWVudCkge1xuICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IHNob3cgPyAnJyA6ICdub25lJztcbiAgICBpZiAoIW90aGVyRWxlbWVudCkgcmV0dXJuO1xuICAgIG90aGVyRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gc2hvdyA/ICdub25lJyA6ICcnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW1pdChlbGVtZW50LCBuYW1lLCBkZXRhaWwgPSB7fSkge1xuICAgIGNvbnN0IGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KG5hbWUsIHtcbiAgICAgICAgZGV0YWlsLFxuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgICAgY2FuY2VsYWJsZTogZmFsc2VcbiAgICB9KTtcbiAgICByZXR1cm4gZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVzYyhzdHIpIHtcbiAgICByZXR1cm4gU3RyaW5nKHN0ciA/PyAnJykucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlSFRNTChzdHIpIHtcbiAgICByZXR1cm4gc3RyXG4gICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn1cblxuZnVuY3Rpb24gaW1hZ2VMb2FkZWRPckVycm9yKGltZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgaW1nLm9ubG9hZCA9IHJlc29sdmU7XG4gICAgICAgIGltZy5vbmVycm9yID0gcmVzb2x2ZTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdhaXRGb3JJbWFnZXMobm9kZSkge1xuICAgIGNvbnN0IGltYWdlcyA9IFsuLi5ub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltZycpXTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKGltYWdlcy5tYXAoaW1nID0+IHtcbiAgICAgICAgcmV0dXJuIGltZy5jb21wbGV0ZVxuICAgICAgICAgICAgPyBpbWcuZGVjb2RlKCkuY2F0Y2goKCkgPT4ge30pXG4gICAgICAgICAgICA6IGltYWdlTG9hZGVkT3JFcnJvcihpbWcpO1xuICAgIH0pKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxheW91dFNldHRsZWQocm9vdCwge1xuICAgIHNldHRsZUZyYW1lcyA9IDQsXG4gICAgbWF4V2FpdE1zID0gMjAwMCxcbn0gPSB7fSkge1xuICAgIGxldCBsYXN0TXV0YXRpb24gPSBwZXJmb3JtYW5jZS5ub3coKTtcblxuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICBsYXN0TXV0YXRpb24gPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB9KTtcblxuICAgIG9ic2VydmVyLm9ic2VydmUocm9vdCwge1xuICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgIGNoYXJhY3RlckRhdGE6IHRydWUsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgaWYgKHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnQgPiBtYXhXYWl0TXMpIGJyZWFrO1xuXG4gICAgICAgICAgICBsZXQgc3RhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2V0dGxlRnJhbWVzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXF1ZXN0QW5pbWF0aW9uRnJhbWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG11dGF0ZWRSZWNlbnRseSA9IHBlcmZvcm1hbmNlLm5vdygpIC0gbGFzdE11dGF0aW9uIDwgNTA7XG4gICAgICAgICAgICAgICAgaWYgKCFtdXRhdGVkUmVjZW50bHkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIHN0YWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3RhYmxlKSBicmVhaztcbiAgICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3YWl0Rm9yU3RhYmxlTGF5b3V0KG5vZGUpIHtcbiAgICBhd2FpdCBkb2N1bWVudC5mb250cy5yZWFkeTtcbiAgICBhd2FpdCB3YWl0Rm9ySW1hZ2VzKG5vZGUpO1xuICAgIGF3YWl0IGxheW91dFNldHRsZWQobm9kZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkU2NyaXB0KHNyYykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICBzY3JpcHQuc3JjID0gc3JjO1xuICAgICAgICBzY3JpcHQub25sb2FkID0gcmVzb2x2ZTtcbiAgICAgICAgc2NyaXB0Lm9uZXJyb3IgPSAoKSA9PiByZWplY3QobmV3IEVycm9yKGBGYWlsZWQgdG8gbG9hZCBKYXNtaW5lIHNjcmlwdDogJHtzcmN9YCkpO1xuICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkU3R5bGUoaHJlZikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgICAgIGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xuICAgICAgICBsaW5rLmhyZWYgPSBocmVmO1xuICAgICAgICBsaW5rLm9ubG9hZCA9IHJlc29sdmU7XG4gICAgICAgIGxpbmsub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoJ0ZhaWxlZCB0byBsb2FkIEphc21pbmUgQ1NTJykpO1xuICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICAgIH0pO1xufVxuIiwgImltcG9ydCB5YW1sIGZyb20gJ3lhbWwnO1xuaW1wb3J0IHsgZXNjYXBlSFRNTCB9IGZyb20gJy4vaHRtbFV0aWxzLmpzJztcbmltcG9ydCB7IHJlYWRGaWxlLCB3cml0ZUZpbGUgfSBmcm9tICcuL25ldXRyYWxpbm9BZGFwdGVyLmpzJztcblxuY29uc3QgQ1VSUkVOVF9TQ0hFTUFfVkVSU0lPTiA9IDE7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIGxvYWRlZCBsb2NhbGl6YXRpb24gZm9yIGEgc3BlY2lmaWMgbG9jYWxlLlxuICpcbiAqIFRoaXMgY2xhc3MgaXMgcmVzcG9uc2libGUgZm9yOlxuICogLSBMb2FkaW5nIGFuZCBwYXJzaW5nIGxvY2FsZSBZQU1MIGZpbGVzXG4gKiAtIENyZWF0aW5nIGJhc2UgbG9jYWxpemF0aW9uIHRlbXBsYXRlcyB1c2luZyB0aGUgbG9jYWxpemF0aW9uIHNjaGVtYSBmaWxlXG4gKiAtIFJlc29sdmluZyBsb2NhbGl6ZWQgc3RyaW5ncyB3aXRoIHBhcmFtZXRlciBzdWJzdGl0dXRpb25cbiAqIC0gUGVyc2lzdGluZyBsb2NhbGUgZGF0YSBiYWNrIHRvIGRpc2tcbiAqXG4gKiBJbnRlcmFjdGluZyB3aXRoIHRoaXMgY2xhc3Mgc2hvdWxkIG9ubHkgYmUgbmVjZXNzYXJ5IGluIHRoZSBjb250ZXh0IG9mIG9wZXJhdGluZ1xuICogb24gbG9jYWxpemF0aW9ucyBkaXJlY3RseS4gSWYgeW91IG5lZWQgdG8gbG9jYWxpemUgYSBzdHJpbmcsIHVzZSBgbG9jYWxpemVgLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2NhbGl6YXRpb24ge1xuICAgIHN0YXRpYyBhc3luYyBsb2FkKGxvY2FsZUlkLCBtZXRhZGF0YSA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gYGxvY2FsZXMvJHtsb2NhbGVJZH0ueW1sYDtcbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IHJlYWRGaWxlKGZpbGVQYXRoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBMb2NhbGl6YXRpb24obG9jYWxlSWQsIHRleHQsIG1ldGFkYXRhKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IHRvdGFsS2V5cygpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNjaGVtYSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuc2NoZW1hKS5mbGF0TWFwKGVudHJpZXMgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXMoZW50cmllcyk7XG4gICAgICAgIH0pLmxlbmd0aDtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihsb2NhbGVJZCwgdGV4dCA9ICcnLCBtZXRhZGF0YSA9IHt9KSB7XG4gICAgICAgIHRoaXMuaWQgPSBsb2NhbGVJZDtcbiAgICAgICAgdGhpcy5kYXRhID0geWFtbC5wYXJzZSh0ZXh0KSB8fCB7fTtcbiAgICAgICAgdGhpcy5hZGRNaXNzaW5nS2V5cygpO1xuICAgICAgICB0aGlzLnRleHQgPSB0aGlzLnN0cmluZ2lmeSgpO1xuICAgICAgICB0aGlzLmxhYmVsID0gbWV0YWRhdGE/LmxhYmVsIHx8ICdOZXcgTG9jYWxlJztcbiAgICAgICAgdGhpcy5jcmVhdGVkID0gbWV0YWRhdGE/LmNyZWF0ZWQgfHwgbmV3IERhdGUoKTtcbiAgICAgICAgdGhpcy51cGRhdGVkID0gbWV0YWRhdGE/LnVwZGF0ZWQgfHwgdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnNjaGVtYVZlcnNpb24gPSBtZXRhZGF0YT8uc2NoZW1hVmVyc2lvbiB8fCBDVVJSRU5UX1NDSEVNQV9WRVJTSU9OO1xuICAgICAgICB0aGlzLmNvbnRyaWJ1dG9ycyA9IG1ldGFkYXRhPy5jb250cmlidXRvcnMgfHwgJyc7XG4gICAgfVxuXG4gICAgYWRkTWlzc2luZ0tleXMoKSB7XG4gICAgICAgIGNvbnN0IHNjaGVtYUVudHJpZXMgPSBPYmplY3QuZW50cmllcyh0aGlzLmNvbnN0cnVjdG9yLnNjaGVtYSk7XG4gICAgICAgIGZvciAoY29uc3QgW25hbWVzcGFjZUtleSwgZW50cmllc10gb2Ygc2NoZW1hRW50cmllcykge1xuICAgICAgICAgICAgdGhpcy5kYXRhW25hbWVzcGFjZUtleV0gfHw9IHt9O1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gZW50cmllcylcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbbmFtZXNwYWNlS2V5XVtrZXldIHx8PSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RyaW5naWZ5KCkge1xuICAgICAgICByZXR1cm4geWFtbC5zdHJpbmdpZnkodGhpcy5kYXRhLCBudWxsLCB7IG51bGxTdHI6ICcnIH0pO1xuICAgIH1cblxuICAgIHJlc29sdmUobmFtZXNwYWNlS2V5LCBrZXksIHZhbHVlcykge1xuICAgICAgICBjb25zdCBuYW1lc3BhY2UgPSB0aGlzLmRhdGFbbmFtZXNwYWNlS2V5XTtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBuYW1lc3BhY2U/LltrZXldO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGVzY2FwZUhUTUwodGVtcGxhdGUucmVwbGFjZSgvJVxceyhcXGQrKX0vZywgKF8sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzW2luZGV4XTtcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIGdldCBmaWVsZHMoKSB7XG4gICAgICAgIGNvbnN0IEwgPSBsb2NhbGl6ZSgnZWRpdC1sb2NhbGVzLW1vZGFsJyk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7IGlkOiAnaWQnLCBsYWJlbDogTGBMb2NhbGUgSURgIH0sXG4gICAgICAgICAgICB7IGlkOiAnbGFiZWwnLCBsYWJlbDogTGBMYWJlbGAgfSxcbiAgICAgICAgICAgIHsgaWQ6ICdjb250cmlidXRvcnMnLFxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBMYFlvdXIgbmFtZSBoZXJlYCxcbiAgICAgICAgICAgICAgICBsYWJlbDogTGBDb250cmlidXRvcnNgIH0sXG4gICAgICAgICAgICB7IGlkOiAndGV4dCcsIGxhYmVsOiBMYFRleHRgLCB0eXBlOiAnY29kZScsIHN5bnRheDogJ3lhbWwnIH1cbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBnZXQgbWV0YWRhdGEoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy5sYWJlbCxcbiAgICAgICAgICAgIGNyZWF0ZWQ6IHRoaXMuY3JlYXRlZCxcbiAgICAgICAgICAgIHVwZGF0ZWQ6IHRoaXMudXBkYXRlZCxcbiAgICAgICAgICAgIHBlcmNlbnRDb21wbGV0ZTogdGhpcy5wZXJjZW50Q29tcGxldGVkLFxuICAgICAgICAgICAgc2NoZW1hVmVyc2lvbjogdGhpcy5zY2hlbWFWZXJzaW9uLFxuICAgICAgICAgICAgY29udHJpYnV0b3JzOiB0aGlzLmNvbnRyaWJ1dG9yc1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGdldCBwZXJjZW50Q29tcGxldGUoKSB7XG4gICAgICAgIGNvbnN0IHJhdGlvID0gdGhpcy5jb21wbGV0ZWRDb3VudCAvIHRoaXMuY29uc3RydWN0b3IudG90YWxLZXlzO1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5mbG9vcihyYXRpbyAqIDEwMCl9JWA7XG4gICAgfVxuXG4gICAgZ2V0IGNvbXBsZXRlZENvdW50KCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmRhdGEpLmZsYXRNYXAoZW50cmllcyA9PiB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhlbnRyaWVzKTtcbiAgICAgICAgfSkubGVuZ3RoO1xuICAgIH1cblxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5sYWJlbH0gKCR7dGhpcy5pZH0ueW1sKWA7XG4gICAgfVxuXG4gICAgYXN5bmMgc2F2ZSgpIHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBgbG9jYWxlcy8ke3RoaXMuaWR9LnltbGA7XG4gICAgICAgIGF3YWl0IHdyaXRlRmlsZShmaWxlUGF0aCwgdGhpcy5yYXcpO1xuICAgIH1cbn1cbiIsICJpbXBvcnQge1xuICAgIGdldEpvaW5lZFBhdGgsXG4gICAgZ2V0U3RhdHMsXG4gICAgcmVhZEJpbmFyeUZpbGUsXG4gICAgcmVhZERpcmVjdG9yeSxcbiAgICByZWFkRmlsZVxufSBmcm9tICcuL25ldXRyYWxpbm9BZGFwdGVyLmpzJztcbmltcG9ydCB7IGRldGVybWluZUltYWdlVHlwZSB9IGZyb20gJy4vaW1hZ2VVdGlscy5qcyc7XG5cbi8qKlxuICogTG9hZHMgYW5kIHBhcnNlcyBhIEpTT04gZmlsZSBmcm9tIHRoZSBnaXZlbiBmaWxlIHBhdGguXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZVBhdGhcbiAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkSnNvbihmaWxlUGF0aCkge1xuICAgIGNvbnN0IHRleHQgPSBhd2FpdCByZWFkRmlsZShmaWxlUGF0aCk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UodGV4dCk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIGEgZmlsZSBleGlzdHMgYXQgdGhlIGdpdmVuIGZpbGUgcGF0aC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlUGF0aFxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja0ZpbGVFeGlzdHMoZmlsZVBhdGgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzdGF0cyA9IGF3YWl0IGdldFN0YXRzKGZpbGVQYXRoKTtcbiAgICAgICAgcmV0dXJuIHN0YXRzLmlzRmlsZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ05FX0ZTX05PUEFUSEUnKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrRm9sZGVyRXhpc3RzKGZvbGRlclBhdGgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzdGF0cyA9IGF3YWl0IGdldFN0YXRzKGZvbGRlclBhdGgpO1xuICAgICAgICByZXR1cm4gIXN0YXRzLmlzRmlsZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ05FX0ZTX05PUEFUSEUnKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0TWF0Y2hpbmdFbnRyaWVzKGZvbGRlclBhdGgsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIG1hdGNoaW5nOiBudWxsLFxuICAgICAgICBmaWxlczogdHJ1ZSxcbiAgICAgICAgZGlyZWN0b3JpZXM6IGZhbHNlLFxuICAgICAgICByZWN1cnNpdmU6IGZhbHNlLFxuICAgIH0sIG9wdGlvbnMpO1xuICAgIGlmICghYXdhaXQgY2hlY2tGb2xkZXJFeGlzdHMoZm9sZGVyUGF0aCkpIHJldHVybiBbXTtcbiAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgcmVhZERpcmVjdG9yeShmb2xkZXJQYXRoLCB7IHJlY3Vyc2l2ZTogb3B0aW9ucy5yZWN1cnNpdmUgfSk7XG4gICAgcmV0dXJuIGVudHJpZXMuZmlsdGVyKCh7IGVudHJ5LCB0eXBlIH0pID0+IHtcbiAgICAgICAgaWYgKCFvcHRpb25zLmZpbGVzICYmIHR5cGUgPT09ICdGSUxFJykgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoIW9wdGlvbnMuZGlyZWN0b3JpZXMgJiYgdHlwZSA9PT0gJ0RJUkVDVE9SWScpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuICFvcHRpb25zLm1hdGNoaW5nIHx8IG9wdGlvbnMubWF0Y2hpbmcudGVzdChlbnRyeSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY29udGVudHMgb2YgYSBmb2xkZXIgaWYgaXQgZXhpc3RzLCBlbHNlIHJldHVybnMgYW4gZW1wdHkgYXJyYXkuXG4gKiBAcGFyYW0ge3N0cmluZ30gZm9sZGVyUGF0aFxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5PHN0cmluZz4+fVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmluZChmb2xkZXJQYXRoLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgZ2V0TWF0Y2hpbmdFbnRyaWVzKGZvbGRlclBhdGgsIG9wdGlvbnMpO1xuICAgIGNvbnN0IHBhdGhzID0gW107XG4gICAgZm9yIChjb25zdCB7IGVudHJ5IH0gb2YgZW50cmllcykge1xuICAgICAgICBjb25zdCBwYXRoID0gYXdhaXQgZ2V0Sm9pbmVkUGF0aChmb2xkZXJQYXRoLCBlbnRyeSk7XG4gICAgICAgIHBhdGhzLnB1c2gocGF0aCk7XG4gICAgfVxuICAgIHJldHVybiBwYXRocztcbn1cblxuLyoqXG4gKiBMb2FkcyBhIHRleHQgZmlsZSBmcm9tIHRoZSBnaXZlbiBtb3VudGVkIGZpbGUgcGF0aC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZVBhdGhcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkVGV4dEZpbGUoZmlsZVBhdGgpIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGZpbGVQYXRoKTtcbiAgICBpZiAoIXJlc3BvbnNlLm9rKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBsb2FkIGZpbGUgJHtmaWxlUGF0aH0sICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGhleGFkZWNpbWFsIHN0cmluZyBjb3JyZXNwb25kaW5nIHRvIHRoZSBmbnYxYSBoYXNoIG9mIGFuIGlucHV0IHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZm52MWEoc3RyKSB7XG4gICAgbGV0IGhhc2ggPSAweDgxMWM5ZGM1O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhhc2ggXj0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGhhc2ggPSAoaGFzaCAqIDB4MDEwMDAxOTMpID4+PiAwO1xuICAgIH1cbiAgICByZXR1cm4gKGhhc2ggPj4+IDApLnRvU3RyaW5nKDE2KTtcbn1cblxuLyoqXG4gKiBMb2FkcyBhbiBpbWFnZSBmaWxlIGZyb20gYSBmaWxlIHBhdGggYW5kIHJldHVybnMgYSBibG9iIGNvbnRhaW5pbmcgaXQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVQYXRoIC0gcGF0aCB0byB0aGUgaW1hZ2UgZmlsZSB0byBsb2FkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxCbG9iPn0gLSB0aGUgaW1hZ2UgZmlsZSBhcyBhIGJsb2JcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRJbWFnZUZpbGUoZmlsZVBhdGgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVhZEJpbmFyeUZpbGUoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHR5cGUgPSBkZXRlcm1pbmVJbWFnZVR5cGUoZGF0YSk7XG4gICAgcmV0dXJuIG5ldyBCbG9iKFtkYXRhXSwgeyB0eXBlIH0pO1xufVxuIiwgImltcG9ydCBMb2NhbGl6YXRpb24gZnJvbSAnLi9Mb2NhbGl6YXRpb24uanMnO1xuaW1wb3J0IHtcbiAgICByZWFkRGlyZWN0b3J5LFxuICAgIHJlYWRGaWxlLFxuICAgIHdyaXRlRmlsZVxufSBmcm9tICcuL25ldXRyYWxpbm9BZGFwdGVyLmpzJztcbmltcG9ydCB7IGNoZWNrRmlsZUV4aXN0cyB9IGZyb20gJy4vZnNVdGlscy5qcyc7XG5cbmNvbnN0IGdlbmVyYXRlU2NoZW1hID0gTkxfQVJHUy5pbmNsdWRlcygnLS1sb2NhbGl6ZScpO1xuY29uc3Qgc2NoZW1hUHJvbWlzZSA9IGxvYWRTY2hlbWEoKTtcbmNvbnN0IGxvY2FsZXNQcm9taXNlID0gbG9hZExvY2FsZXMoKTtcblxubGV0IGFjdGl2ZUxvY2FsaXphdGlvbiA9IG51bGw7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcmVwYXJlU2NoZW1hKCkge1xuICAgIExvY2FsaXphdGlvbi5zY2hlbWEgPSBhd2FpdCBzY2hlbWFQcm9taXNlO1xuICAgIHJldHVybiBMb2NhbGl6YXRpb24uc2NoZW1hO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZExvY2FsZXMoKSB7XG4gICAgY29uc3QgbWFuaWZlc3RQYXRoID0gYGxvY2FsZXMvbG9jYWxlcy5qc29uYDtcbiAgICBjb25zdCBtYW5pZmVzdFN0ciA9IGF3YWl0IHJlYWRGaWxlKG1hbmlmZXN0UGF0aCk7XG4gICAgY29uc3QgbWFuaWZlc3QgPSBKU09OLnBhcnNlKG1hbmlmZXN0U3RyKTtcblxuICAgIGNvbnN0IGRpckVudHJpZXMgPSBhd2FpdCByZWFkRGlyZWN0b3J5KCdsb2NhbGVzJyk7XG4gICAgY29uc3QgYXZhaWxhYmxlRmlsZXMgPSBkaXJFbnRyaWVzXG4gICAgICAgIC5maWx0ZXIoZSA9PiBlLnR5cGUgPT09ICdGSUxFJyAmJiBlLmVudHJ5LmVuZHNXaXRoKCcueW1sJykpXG4gICAgICAgIC5tYXAoZSA9PiBlLmVudHJ5LnNsaWNlKDAsIC00KSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKG1hbmlmZXN0KS5maWx0ZXIoKFtrZXldKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlRmlsZXMuaW5jbHVkZXMoa2V5KTtcbiAgICAgICAgfSkubWFwKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBMb2NhbGl6YXRpb24ubG9hZChrZXksIHZhbHVlKTtcbiAgICAgICAgfSlcbiAgICApO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlTG9jYWxlUmVnaXN0cnkoKSB7XG4gICAgY29uc3QgbG9jYWxlcyA9IChhd2FpdCBsb2NhbGVzUHJvbWlzZSkucmVkdWNlKChhY2MsIGxvY2FsZSkgPT4ge1xuICAgICAgICBhY2NbbG9jYWxlLmlkXSA9IHtcbiAgICAgICAgICAgIGxhYmVsOiBsb2NhbGUubGFiZWwsXG4gICAgICAgICAgICBjcmVhdGVkOiBsb2NhbGUuY3JlYXRlZCxcbiAgICAgICAgICAgIHVwZGF0ZWQ6IGxvY2FsZS51cGRhdGUsXG4gICAgICAgICAgICBwZXJjZW50Q29tcGxldGU6IGxvY2FsZS5wZXJjZW50Q29tcGxldGUsXG4gICAgICAgICAgICBzY2hlbWFWZXJzaW9uOiBsb2NhbGUuc2NoZW1hVmVyc2lvbixcbiAgICAgICAgICAgIGNvbnRyaWJ1dG9yczogbG9jYWxlLmNvbnRyaWJ1dG9yc1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gYWNjO1xuICAgIH0sIHt9KTtcbiAgICBjb25zdCB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkobG9jYWxlcywgbnVsbCwgMik7XG4gICAgYXdhaXQgd3JpdGVGaWxlKCdsb2NhbGVzL2xvY2FsZXMuanNvbicsIHRleHQpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXZhaWxhYmxlTG9jYWxlcygpIHtcbiAgICByZXR1cm4gbG9jYWxlc1Byb21pc2U7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlTG9jYWxlKGxvY2FsZSkge1xuICAgIGNvbnN0IGxvY2FsZXMgPSBhd2FpdCBsb2NhbGVzUHJvbWlzZTtcbiAgICBsb2NhbGVzW2xvY2FsZS5pZF0gPSBsb2NhbGUubWV0YWRhdGE7XG4gICAgc2F2ZUxvY2FsZVJlZ2lzdHJ5KCk7XG4gICAgbG9jYWxlLnNhdmUoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldExvY2FsaXphdGlvbihsb2NhbGVJZCkge1xuICAgIHRyeSB7XG4gICAgICAgIGFjdGl2ZUxvY2FsaXphdGlvbiA9IGF3YWl0IExvY2FsaXphdGlvbi5sb2FkKGxvY2FsZUlkKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsb2coJ3BsdWdpbicpLmVycm9yKCdFcnJvciBsb2FkaW5nIGxvY2FsaXphdGlvbiwnLCBlLm1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlRmFsbGJhY2tTdHIoc3RyaW5ncywgdmFsdWVzKSB7XG4gICAgcmV0dXJuIHN0cmluZ3NbMF0gKyB2YWx1ZXMubWFwKCh2LCBpKSA9PiB7XG4gICAgICAgIHJldHVybiBgJHt2fSR7c3RyaW5nc1tpICsgMV19YDtcbiAgICB9KS5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gYnVpbGRMb2NhbGl6YXRpb25LZXkoc3RyaW5ncywgdmFsdWVzKSB7XG4gICAgcmV0dXJuIHN0cmluZ3NbMF0gKyB2YWx1ZXMubWFwKCh2LCBpKSA9PiB7XG4gICAgICAgIHJldHVybiBgJXske2l9fSR7c3RyaW5nc1tpICsgMV19YDtcbiAgICB9KS5qb2luKCcnKTtcbn1cblxuY29uc3Qgd3JpdGVTY2hlbWFGaWxlID0gKGFzeW5jIGZ1bmN0aW9uIHdyaXRlU2NoZW1hRmlsZSgpIHtcbiAgICBjb25zdCBzY2hlbWEgPSBhd2FpdCBzY2hlbWFQcm9taXNlO1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShzY2hlbWEsIG51bGwsIDIpO1xuICAgIGNvbnN0IG91dHB1dFBhdGggPSBgbG9jYWxlcy9zY2hlbWEuanNvbmA7XG4gICAgbG9nKCdwbHVnaW4nKS5sb2coYFdyaXRpbmcgbG9jYWxpemF0aW9uIHNjaGVtYSB0byBgLCBvdXRwdXRQYXRoKTtcbiAgICBhd2FpdCB3cml0ZUZpbGUob3V0cHV0UGF0aCwganNvbik7XG59KS5kZWJvdW5jZSgxMDAwKTtcblxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlU2NoZW1hKG5hbWVzcGFjZUtleSwgZW50cnlLZXkpIHtcbiAgICBjb25zdCBzY2hlbWEgPSBhd2FpdCBzY2hlbWFQcm9taXNlO1xuICAgIGNvbnN0IG5hbWVzcGFjZSA9IHNjaGVtYVtuYW1lc3BhY2VLZXldIHx8PSB7fTtcbiAgICBuYW1lc3BhY2VbZW50cnlLZXldIHx8PSAwO1xuICAgIG5hbWVzcGFjZVtlbnRyeUtleV0gKz0gMTtcbiAgICB3cml0ZVNjaGVtYUZpbGUoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRTY2hlbWEoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaW5wdXRQYXRoID0gYGxvY2FsZXMvc2NoZW1hLmpzb25gO1xuICAgICAgICBpZiAoIWF3YWl0IGNoZWNrRmlsZUV4aXN0cyhpbnB1dFBhdGgpKSByZXR1cm4ge307XG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCByZWFkRmlsZShpbnB1dFBhdGgpO1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGxvZygncGx1Z2luJykuZXJyb3IoJ0Vycm9yIGxvYWRpbmcgbG9jYWxpemF0aW9uIHNjaGVtYTonLCBlKTtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgdGFnZ2VkIHRlbXBsYXRlIGZ1bmN0aW9uIGZvciByZXNvbHZpbmcgbG9jYWxpemVkIHN0cmluZ3Mgd2l0aGluIGFcbiAqIHNwZWNpZmljIG5hbWVzcGFjZS5cbiAqXG4gKiBUaGUgcmV0dXJuZWQgZnVuY3Rpb24gZ2VuZXJhdGVzIGEgc3RhYmxlIGxvY2FsaXphdGlvbiBrZXkgZnJvbSB0aGUgdGVtcGxhdGVcbiAqIHN0cmluZ3MgYW5kIHZhbHVlcywgcmVzb2x2ZXMgdGhlIGxvY2FsaXplZCBzdHJpbmcgaWYgYXZhaWxhYmxlLCBhbmQgZmFsbHMgYmFja1xuICogdG8gdGhlIG9yaWdpbmFsIHRlbXBsYXRlIG91dHB1dCB3aGVuIG5vIGxvY2FsaXphdGlvbiBleGlzdHMuXG4gKlxuICogRXhhbXBsZSB1c2FnZTpcbiAqIGBgYGpzXG4gKiBjb25zdCBMID0gbG9jYWxpemUoJ2VkaXQtbG9jYWxlcy1tb2RhbCcpO1xuICogY29uc3QgdGl0bGUgPSBMYEVkaXQgbG9jYWxlc2A7XG4gKiAvLyB5aWVsZHMgXCJFZGl0IGxvY2FsZXNcIiBieSBkZWZhdWx0LCBidXQgY2FuIGJlIGxvY2FsaXplZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVzcGFjZUtleVxuICogICBOYW1lc3BhY2UgdXNlZCB0byBncm91cCBhbmQgcmVzb2x2ZSBsb2NhbGl6YXRpb24ga2V5cy5cbiAqXG4gKiBAcmV0dXJucyB7KHN0cmluZ3M6IFRlbXBsYXRlU3RyaW5nc0FycmF5LCAuLi52YWx1ZXM6IGFueVtdKSA9PiBzdHJpbmd9XG4gKiAgIEEgdGFnZ2VkIHRlbXBsYXRlIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIGxvY2FsaXplZCBzdHJpbmcuXG4gKi9cbndpbmRvdy5sb2NhbGl6ZSA9IGZ1bmN0aW9uKG5hbWVzcGFjZUtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJpbmdzLCAuLi52YWx1ZXMpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gYnVpbGRMb2NhbGl6YXRpb25LZXkoc3RyaW5ncywgdmFsdWVzKTtcbiAgICAgICAgaWYgKGdlbmVyYXRlU2NoZW1hKSB1cGRhdGVTY2hlbWEobmFtZXNwYWNlS2V5LCBrZXkpO1xuICAgICAgICByZXR1cm4gYWN0aXZlTG9jYWxpemF0aW9uPy5yZXNvbHZlKG5hbWVzcGFjZUtleSwga2V5LCB2YWx1ZXMpXG4gICAgICAgICAgICA/PyByZXNvbHZlRmFsbGJhY2tTdHIoc3RyaW5ncywgdmFsdWVzKTtcbiAgICB9O1xufTtcbiIsICJpbXBvcnQgeyBnZXRKb2luZWRQYXRoLCByZWFkRmlsZSB9IGZyb20gJy4uLy4uLy4uL3NoYXJlZC9uZXV0cmFsaW5vQWRhcHRlci5qcyc7XHJcbmltcG9ydCB7IGNoZWNrRmlsZUV4aXN0cyB9IGZyb20gJy4uLy4uLy4uL3NoYXJlZC9mc1V0aWxzLmpzJztcclxuXHJcbmNvbnN0IGtub3duTXVsdGlsaW5lS2V5cyA9IFtcclxuICAgIC9ecnVsZV90ZXh0KF9cXGQpPyQvLFxyXG4gICAgL15mbGF2b3JfdGV4dChfXFxkKT8kLyxcclxuICAgIC9ebm90ZXMkLyxcclxuXTtcclxuXHJcbmZ1bmN0aW9uIGlzRW1wdHlPYmplY3Qob2JqKSB7XHJcbiAgICByZXR1cm4gb2JqICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRUeXBlKGtleSkge1xyXG4gICAgY29uc3QgaXNNdWx0aWxpbmUgPSBrbm93bk11bHRpbGluZUtleXMuc29tZShleHByID0+IGV4cHIudGVzdChrZXkpKTtcclxuICAgIHJldHVybiBpc011bHRpbGluZSA/IHsgdHlwZTogJ211bHRpbGluZScgfSA6IHt9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYWtlTGluZU9iamVjdChtYXRjaCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBkZXB0aDogbWF0Y2hbMV0ubGVuZ3RoLFxyXG4gICAgICAgIGtleTogbWF0Y2hbMl0sXHJcbiAgICAgICAgLi4uZ2V0VHlwZShtYXRjaFsyXSksXHJcbiAgICAgICAgdmFsdWU6IG1hdGNoWzNdLnNsaWNlKDEpXHJcbiAgICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBmaW5kTXVsdGlsaW5lUm9vdChwYXJzZWRMaW5lcywgdGFyZ2V0RGVwdGgpIHtcclxuICAgIGZvciAobGV0IGkgPSBwYXJzZWRMaW5lcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIGlmIChwYXJzZWRMaW5lc1tpXS5kZXB0aCA9PT0gdGFyZ2V0RGVwdGgpXHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjb2xsZWN0TXVsdGlsaW5lVmFsdWVzKHBhcnNlZExpbmVzLCByb290SW5kZXgpIHtcclxuICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xyXG4gICAgd2hpbGUgKHBhcnNlZExpbmVzLmxlbmd0aCA+IHJvb3RJbmRleCArIDEpIHtcclxuICAgICAgICBjb25zdCBsaW5lID0gcGFyc2VkTGluZXMucG9wKCk7XHJcbiAgICAgICAgdmFsdWVzLnVuc2hpZnQoYCR7bGluZS5rZXl9OiAke2xpbmUudmFsdWV9YCk7XHJcbiAgICB9XHJcbiAgICBpZiAocGFyc2VkTGluZXNbcm9vdEluZGV4XS52YWx1ZSlcclxuICAgICAgICB2YWx1ZXMudW5zaGlmdChwYXJzZWRMaW5lc1tyb290SW5kZXhdLnZhbHVlKTtcclxuICAgIHJldHVybiB2YWx1ZXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJvbGx1cE11bHRpbGluZShkZXB0aCwgbGFzdFZhbHVlLCBwYXJzZWRMaW5lcykge1xyXG4gICAgY29uc3Qgcm9vdEluZGV4ID0gZmluZE11bHRpbGluZVJvb3QocGFyc2VkTGluZXMsIGRlcHRoIC0gMSk7XHJcbiAgICBwYXJzZWRMaW5lc1tyb290SW5kZXhdLnR5cGUgPSAnbXVsdGlsaW5lJztcclxuICAgIHBhcnNlZExpbmVzW3Jvb3RJbmRleF0udmFsdWUgPSBbXHJcbiAgICAgICAgLi4uY29sbGVjdE11bHRpbGluZVZhbHVlcyhwYXJzZWRMaW5lcywgcm9vdEluZGV4KSxcclxuICAgICAgICBsYXN0VmFsdWVcclxuICAgIF0uam9pbignXFxuJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNob3VsZFJvbGx1cChwYXJzZWRMaW5lcywgZGVwdGgpIHtcclxuICAgIGNvbnN0IHByZXZMaW5lID0gcGFyc2VkTGluZXNbcGFyc2VkTGluZXMubGVuZ3RoIC0gMV07XHJcbiAgICByZXR1cm4gcHJldkxpbmU/LnR5cGUgPT09ICdtdWx0aWxpbmUnXHJcbiAgICAgICAgJiYgcHJldkxpbmU/LmRlcHRoID09PSBkZXB0aCAtIDE7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlTXNlTGluZXModGV4dCkge1xyXG4gICAgY29uc3QgcGFyc2VkTGluZXMgPSBbXTtcclxuICAgIGZvciAoY29uc3QgbGluZSBvZiB0ZXh0LnRyaW1FbmQoKS5zcGxpdCgvXFxyP1xcbi8pKSB7XHJcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKC9eKFxcdCopKFteXFxzOl0rKTooW15cXG5dKikkLyk7XHJcbiAgICAgICAgaWYgKG1hdGNoICYmICFzaG91bGRSb2xsdXAocGFyc2VkTGluZXMsIG1hdGNoWzFdLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgcGFyc2VkTGluZXMucHVzaChtYWtlTGluZU9iamVjdChtYXRjaCkpO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdmFsdWVNYXRjaCA9IGxpbmUubWF0Y2goL14oXFx0KikoW15cXG5dKikkLyk7XHJcbiAgICAgICAgcm9sbHVwTXVsdGlsaW5lKHZhbHVlTWF0Y2hbMV0ubGVuZ3RoLCB2YWx1ZU1hdGNoWzJdLCBwYXJzZWRMaW5lcyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGFyc2VkTGluZXM7XHJcbn1cclxuXHJcbmNvbnN0IHZhbHVlV3JpdGVycyA9IFt7XHJcbiAgICBtYXRjaDogKHRhcmdldCwga2V5KSA9PiBBcnJheS5pc0FycmF5KHRhcmdldFtrZXldKSxcclxuICAgIHdyaXRlOiAodGFyZ2V0LCBrZXksIHZhbHVlKSA9PiB0YXJnZXRba2V5XS5wdXNoKHZhbHVlKVxyXG59LCB7XHJcbiAgICBtYXRjaDogKHRhcmdldCwga2V5KSA9PiBPYmplY3QuaGFzT3duKHRhcmdldCwga2V5KSxcclxuICAgIHdyaXRlOiAodGFyZ2V0LCBrZXksIHZhbHVlKSA9PiB0YXJnZXRba2V5XSA9IFt0YXJnZXRba2V5XSwgdmFsdWVdXHJcbn0sIHtcclxuICAgIG1hdGNoOiAoKSA9PiB0cnVlLFxyXG4gICAgd3JpdGU6ICh0YXJnZXQsIGtleSwgdmFsdWUpID0+IHRhcmdldFtrZXldID0gdmFsdWVcclxufV07XHJcblxyXG5mdW5jdGlvbiB3cml0ZUxhc3Qoc3RhY2spIHtcclxuICAgIGNvbnN0IFtrZXksIHZhbHVlXSA9IHN0YWNrLnBvcCgpO1xyXG4gICAgY29uc3QgWyx0YXJnZXRdID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XHJcbiAgICBjb25zdCB3cml0ZXIgPSB2YWx1ZVdyaXRlcnMuZmluZCh2dyA9PiB2dy5tYXRjaCh0YXJnZXQsIGtleSkpO1xyXG4gICAgY29uc3QgZmluYWxWYWx1ZSA9IGlzRW1wdHlPYmplY3QodmFsdWUpID8gbnVsbCA6IHZhbHVlO1xyXG4gICAgd3JpdGVyLndyaXRlKHRhcmdldCwga2V5LCBmaW5hbFZhbHVlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTXNlKHRleHQpIHtcclxuICAgIGNvbnN0IHJvb3QgPSB7fTtcclxuICAgIGNvbnN0IHN0YWNrID0gW1sncm9vdCcsIHJvb3RdXTtcclxuICAgIGZvciAoY29uc3QgeyBkZXB0aCwga2V5LCB2YWx1ZSB9IG9mIHBhcnNlTXNlTGluZXModGV4dCkpIHtcclxuICAgICAgICB3aGlsZSAoc3RhY2subGVuZ3RoIC0gMSA+IGRlcHRoKSB3cml0ZUxhc3Qoc3RhY2spO1xyXG4gICAgICAgIHN0YWNrLnB1c2goW2tleSwgdmFsdWUgfHwge31dKTtcclxuICAgIH1cclxuICAgIHdoaWxlIChzdGFjay5sZW5ndGggLSAxID4gMCkgd3JpdGVMYXN0KHN0YWNrKTtcclxuICAgIHJldHVybiByb290O1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZE1zZUZpbGUoZm9sZGVyUGF0aCwgZmlsZW5hbWUpIHtcclxuICAgIGNvbnN0IGZpbGVQYXRoID0gYXdhaXQgZ2V0Sm9pbmVkUGF0aChmb2xkZXJQYXRoLCBmaWxlbmFtZSk7XHJcbiAgICBpZiAoIWF3YWl0IGNoZWNrRmlsZUV4aXN0cyhmaWxlUGF0aCkpXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNU0UgZmlsZSBub3QgZm91bmQgYXQgJHtmaWxlUGF0aH1gKTtcclxuICAgIGNvbnN0IHRleHQgPSBhd2FpdCByZWFkRmlsZShmaWxlUGF0aCk7XHJcbiAgICByZXR1cm4gcGFyc2VNc2UodGV4dC5zbGljZSgxKSk7XHJcbn1cclxuIiwgImltcG9ydCB7IHBhcnNlTXNlIH0gZnJvbSAnLi9sb2FkTXNlRmlsZS5qcyc7XHJcblxyXG5kZXNjcmliZSgncGFyc2VNc2UnLCAoKSA9PiB7XHJcbiAgICBpdCgnc2hvdWxkIHBhcnNlIHNpbXBsZSB2YWx1ZXMnLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgb2JqID0gcGFyc2VNc2UoJ2hlbGxvOiB3b3JsZFxcbicpO1xyXG4gICAgICAgIGV4cGVjdChvYmopLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgZXhwZWN0KG9iai5oZWxsbykudG9CZSgnd29ybGQnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcGFyc2UgYmxhbmsgdmFsdWVzIGFzIG51bGwnLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgb2JqID0gcGFyc2VNc2UoJ3Rlc3Q6XFxudmFsdWU6XFxuJyk7XHJcbiAgICAgICAgZXhwZWN0KG9iaikudG9CZURlZmluZWQoKTtcclxuICAgICAgICBleHBlY3Qob2JqLnRlc3QpLnRvQmUobnVsbCk7XHJcbiAgICAgICAgZXhwZWN0KG9iai52YWx1ZSkudG9CZShudWxsKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcGFyc2Ugb2JqZWN0cycsICgpID0+IHtcclxuICAgICAgICBjb25zdCBvYmogPSBwYXJzZU1zZShcclxuICAgICAgICAgICAgJ2NvbG9yczpcXG4nXHJcbiAgICAgICAgICAgICsgJ1xcdHJlZDogI2YwMFxcbidcclxuICAgICAgICAgICAgKyAnXFx0Z3JlZW46ICMwZjBcXG4nXHJcbiAgICAgICAgICAgICsgJ1xcdGJsdWU6ICMwMGZcXG4nXHJcbiAgICAgICAgKTtcclxuICAgICAgICBleHBlY3Qob2JqLmNvbG9ycykudG9CZURlZmluZWQoKTtcclxuICAgICAgICBleHBlY3Qob2JqLmNvbG9ycy5yZWQpLnRvQmUoJyNmMDAnKTtcclxuICAgICAgICBleHBlY3Qob2JqLmNvbG9ycy5ncmVlbikudG9CZSgnIzBmMCcpO1xyXG4gICAgICAgIGV4cGVjdChvYmouY29sb3JzLmJsdWUpLnRvQmUoJyMwMGYnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcGFyc2UgYXJyYXlzJywgKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9iaiA9IHBhcnNlTXNlKFxyXG4gICAgICAgICAgICAnaW5jbHVkZV9maWxlOiBjYXJkIGJsdWUgcmFiYml0XFxuJ1xyXG4gICAgICAgICAgICArICdpbmNsdWRlX2ZpbGU6IGNhcmQgcmVkIHR1cnRsZVxcbidcclxuICAgICAgICAgICAgKyAnaW5jbHVkZV9maWxlOiBjYXJkIGdyZWVuIHZ1bHR1cmVcXG4nXHJcbiAgICAgICAgICAgICsgJ2luY2x1ZGVfZmlsZTogY2FyZCBwaW5rIGZyb2dcXG4nXHJcbiAgICAgICAgKTtcclxuICAgICAgICBleHBlY3Qob2JqLmluY2x1ZGVfZmlsZSkudG9CZURlZmluZWQoKTtcclxuICAgICAgICBleHBlY3Qob2JqLmluY2x1ZGVfZmlsZS5sZW5ndGgpLnRvQmUoNCk7XHJcbiAgICAgICAgZXhwZWN0KG9iai5pbmNsdWRlX2ZpbGVbMF0pLnRvQmUoJ2NhcmQgYmx1ZSByYWJiaXQnKTtcclxuICAgICAgICBleHBlY3Qob2JqLmluY2x1ZGVfZmlsZVsxXSkudG9CZSgnY2FyZCByZWQgdHVydGxlJyk7XHJcbiAgICAgICAgZXhwZWN0KG9iai5pbmNsdWRlX2ZpbGVbMl0pLnRvQmUoJ2NhcmQgZ3JlZW4gdnVsdHVyZScpO1xyXG4gICAgICAgIGV4cGVjdChvYmouaW5jbHVkZV9maWxlWzNdKS50b0JlKCdjYXJkIHBpbmsgZnJvZycpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBwYXJzZSBtdWx0aWxpbmUgdGV4dCcsICgpID0+IHtcclxuICAgICAgICBjb25zdCBvYmogPSBwYXJzZU1zZShcclxuICAgICAgICAgICAgJ3J1bGVzX3RleHQ6XFxuJ1xyXG4gICAgICAgICAgICArICdcXHRUaGlzIGlzIHNvbWUgcnVsZXMgdGV4dFxcbidcclxuICAgICAgICAgICAgKyAnXFx0XFxuJ1xyXG4gICAgICAgICAgICArICdcXHRUcmFtcGxlLCBmbHlpbmcsIGZpcnN0IHN0cmlrZSdcclxuICAgICAgICApO1xyXG4gICAgICAgIGV4cGVjdChvYmoucnVsZXNfdGV4dCkudG9CZURlZmluZWQoKTtcclxuICAgICAgICBleHBlY3Qob2JqLnJ1bGVzX3RleHQpLnRvQmUoXHJcbiAgICAgICAgICAgICdUaGlzIGlzIHNvbWUgcnVsZXMgdGV4dFxcbidcclxuICAgICAgICAgICAgKyAnXFxuJ1xyXG4gICAgICAgICAgICArICdUcmFtcGxlLCBmbHlpbmcsIGZpcnN0IHN0cmlrZSdcclxuICAgICAgICApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBwYXJzZSBhcyBtdWx0aWxpbmUgdGV4dCB3aGVuIGxhdGVyIGxpbmVzIGFyZSB2YWx1ZSBvbmx5JywgKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9iaiA9IHBhcnNlTXNlKFxyXG4gICAgICAgICAgICAncnVsZXNfdGV4dDpcXG4nXHJcbiAgICAgICAgICAgICsgJ1xcdFQ6IEFkZCB7R30uXFxuJ1xyXG4gICAgICAgICAgICArICdcXHRcXG4nXHJcbiAgICAgICAgICAgICsgJ1xcdFdoZW5ldmVyIHlvdSdcclxuICAgICAgICApO1xyXG4gICAgICAgIGV4cGVjdChvYmoucnVsZXNfdGV4dCkudG9CZURlZmluZWQoKTtcclxuICAgICAgICBleHBlY3Qob2JqLnJ1bGVzX3RleHQpLnRvQmUoXHJcbiAgICAgICAgICAgICdUOiBBZGQge0d9LlxcbidcclxuICAgICAgICAgICAgKyAnXFxuJ1xyXG4gICAgICAgICAgICArICdXaGVuZXZlciB5b3UnXHJcbiAgICAgICAgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcGFyc2UgYXMgbXVsdGlsaW5lIHRleHQgd2hlbiBmaXJzdCBsaW5lcyBhcmUgdmFsdWUgb25seScsICgpID0+IHtcclxuICAgICAgICBjb25zdCBvYmogPSBwYXJzZU1zZShcclxuICAgICAgICAgICAgJ3J1bGVzX3RleHQ6XFxuJ1xyXG4gICAgICAgICAgICArICdcXHRXaGVuZXZlciB5b3VcXG4nXHJcbiAgICAgICAgICAgICsgJ1xcdFxcbidcclxuICAgICAgICAgICAgKyAnXFx0VDogQWRkIHtHfS5cXG4nXHJcbiAgICAgICAgKTtcclxuICAgICAgICBleHBlY3Qob2JqLnJ1bGVzX3RleHQpLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgZXhwZWN0KG9iai5ydWxlc190ZXh0KS50b0JlKFxyXG4gICAgICAgICAgICAnV2hlbmV2ZXIgeW91XFxuJ1xyXG4gICAgICAgICAgICArICdcXG4nXHJcbiAgICAgICAgICAgICsgJ1Q6IEFkZCB7R30uJ1xyXG4gICAgICAgICk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHBhcnNlIGFtYmlndW91cyBtdWx0aWxpbmUgdGV4dCBhcyBvYmplY3QnLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgb2JqID0gcGFyc2VNc2UoXHJcbiAgICAgICAgICAgICdhbWJpZ3VvdXM6XFxuJ1xyXG4gICAgICAgICAgICArICdcXHRUOiBBZGQge0d9LlxcbidcclxuICAgICAgICApO1xyXG4gICAgICAgIGV4cGVjdChvYmouYW1iaWd1b3VzLlQpLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgZXhwZWN0KG9iai5hbWJpZ3VvdXMuVCkudG9CZSgnQWRkIHtHfS4nKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgbm90IHJvbGx1cCB1bm5lc3RlZCcsICgpID0+IHtcclxuICAgICAgICBjb25zdCBvYmogPSBwYXJzZU1zZShcclxuICAgICAgICAgICAgJ211bHRpbGluZTpcXG4nXHJcbiAgICAgICAgICAgICsgJ1xcdGV4YW1wbGVcXG4nXHJcbiAgICAgICAgICAgICsgJ1xcdGV4YW1wbGVcXG4nXHJcbiAgICAgICAgICAgICsgJ1xcdGV4YW1wbGVcXG4nXHJcbiAgICAgICAgICAgICsgJ2hlbGxvOiB3b3JsZFxcbidcclxuICAgICAgICApO1xyXG4gICAgICAgIGV4cGVjdChvYmoubXVsdGlsaW5lKS50b0JlRGVmaW5lZCgpO1xyXG4gICAgICAgIGV4cGVjdChvYmoubXVsdGlsaW5lKS50b0JlKFxyXG4gICAgICAgICAgICAnZXhhbXBsZVxcbmV4YW1wbGVcXG5leGFtcGxlJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgZXhwZWN0KG9iai5oZWxsbykudG9CZURlZmluZWQoKTtcclxuICAgICAgICBleHBlY3Qob2JqLmhlbGxvKS50b0JlKCd3b3JsZCcpO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCAiaW1wb3J0IHsgcmVhZERpcmVjdG9yeSB9IGZyb20gJy4uL25ldXRyYWxpbm9BZGFwdGVyLmpzJztcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kVGVzdEZpbGVzKGRpcikge1xyXG4gICAgY29uc3QgdGVzdEZpbGVzID0gW107XHJcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHJlYWREaXJlY3RvcnkoZGlyKTtcclxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xyXG4gICAgICAgIGNvbnN0IHBhdGggPSBgJHtkaXJ9LyR7ZmlsZS5lbnRyeX1gO1xyXG4gICAgICAgIGlmIChmaWxlLnR5cGUgPT09ICdESVJFQ1RPUlknKSB7XHJcbiAgICAgICAgICAgIGlmIChmaWxlLmVudHJ5ID09PSAnLicgfHwgZmlsZS5lbnRyeSA9PT0gJy4uJykgY29udGludWU7XHJcbiAgICAgICAgICAgIHRlc3RGaWxlcy5wdXNoKC4uLmF3YWl0IGZpbmRUZXN0RmlsZXMocGF0aCkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZmlsZS5lbnRyeS5lbmRzV2l0aCgnLnRlc3RzLmpzJykpIHtcclxuICAgICAgICAgICAgdGVzdEZpbGVzLnB1c2gocGF0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRlc3RGaWxlcztcclxufVxyXG4iLCAiLypcclxuICogQWRhcHRlZCBmcm9tIHRoZSBKYXNtaW5lIENvbnNvbGVSZXBvcnRlci5cclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTkgUGl2b3RhbCBMYWJzXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDI2IFRoZSBKYXNtaW5lIGRldmVsb3BlcnNcclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nXHJcbiAqIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxyXG4gKiBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcclxuICogd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxyXG4gKiBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cclxuICogcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXHJcbiAqIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcclxuICogaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXHJcbiAqIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxyXG4gKiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxyXG4gKiBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFXHJcbiAqIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cclxuICogT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXHJcbiAqIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxyXG4gKi9cclxuXHJcbmNvbnN0IGFuc2kgPSB7XHJcbiAgICBncmVlbjogJ1xceDFCWzMybScsXHJcbiAgICByZWQ6ICdcXHgxQlszMW0nLFxyXG4gICAgeWVsbG93OiAnXFx4MUJbMzNtJyxcclxuICAgIG5vbmU6ICdcXHgxQlswbScsXHJcbn07XHJcblxyXG5jbGFzcyBDdXN0b21SZXBvcnRlciB7XHJcbiAgICAjcHJpbnQ7XHJcbiAgICAjc2hvd0NvbG9ycztcclxuICAgICNhbHdheXNMaXN0UGVuZGluZ1NwZWNzO1xyXG4gICAgI2xpc3ROb3RBcHBsaWNhYmxlU3BlY3M7XHJcbiAgICAjc3RhY2tGaWx0ZXI7XHJcbiAgICAjZmFpbGVkU3BlY3M7XHJcbiAgICAjcGVuZGluZ1NwZWNzO1xyXG4gICAgI25vdEFwcGxpY2FibGVTcGVjcztcclxuICAgICNmYWlsZWRTdWl0ZXM7XHJcbiAgICAjb3V0cHV0UXVldWU7XHJcblxyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIGlmICghb3B0aW9ucz8ucHJpbnQpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ3VzdG9tUmVwb3J0ZXIgcmVxdWlyZXMgYSBwcmludCBmdW5jdGlvbi4nKTtcclxuXHJcbiAgICAgICAgdGhpcy4jcHJpbnQgPSBvcHRpb25zLnByaW50O1xyXG4gICAgICAgIHRoaXMuI3Nob3dDb2xvcnMgPSBvcHRpb25zLmNvbG9yID8/IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuI2Fsd2F5c0xpc3RQZW5kaW5nU3BlY3MgPSBvcHRpb25zLmFsd2F5c0xpc3RQZW5kaW5nU3BlY3MgPz8gdHJ1ZTtcclxuICAgICAgICB0aGlzLiNsaXN0Tm90QXBwbGljYWJsZVNwZWNzID0gb3B0aW9ucy5saXN0Tm90QXBwbGljYWJsZVNwZWNzID8/IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuI3N0YWNrRmlsdGVyID0gb3B0aW9ucy5zdGFja0ZpbHRlciA/PyAoc3RhY2sgPT4gc3RhY2spO1xyXG4gICAgICAgIHRoaXMuI2ZhaWxlZFNwZWNzID0gW107XHJcbiAgICAgICAgdGhpcy4jcGVuZGluZ1NwZWNzID0gW107XHJcbiAgICAgICAgdGhpcy4jbm90QXBwbGljYWJsZVNwZWNzID0gW107XHJcbiAgICAgICAgdGhpcy4jZmFpbGVkU3VpdGVzID0gW107XHJcbiAgICAgICAgdGhpcy4jb3V0cHV0UXVldWUgPSBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBqYXNtaW5lU3RhcnRlZChvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5zcGVjQ291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMuZXhlY3V0YWJsZVNwZWNDb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5mYWlsdXJlQ291bnQgPSAwO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucz8ub3JkZXI/LnJhbmRvbSkge1xyXG4gICAgICAgICAgICB0aGlzLiN3cml0ZShgUmFuZG9taXplZCB3aXRoIHNlZWQgJHtvcHRpb25zLm9yZGVyLnNlZWR9YCk7XHJcbiAgICAgICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy4jd3JpdGUoJ1N0YXJ0ZWQnKTtcclxuICAgICAgICB0aGlzLiNwcmludE5ld2xpbmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBzcGVjRG9uZShyZXN1bHQpIHtcclxuICAgICAgICB0aGlzLnNwZWNDb3VudCsrO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKHJlc3VsdC5zdGF0dXMpIHtcclxuICAgICAgICBjYXNlICdwZW5kaW5nJzpcclxuICAgICAgICAgICAgdGhpcy4jcGVuZGluZ1NwZWNzLnB1c2gocmVzdWx0KTtcclxuICAgICAgICAgICAgdGhpcy5leGVjdXRhYmxlU3BlY0NvdW50Kys7XHJcbiAgICAgICAgICAgIHRoaXMuI3dyaXRlKHRoaXMuI2NvbG9yZWQoJ3llbGxvdycsICcqJykpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnbm90QXBwbGljYWJsZSc6XHJcbiAgICAgICAgICAgIHRoaXMuI25vdEFwcGxpY2FibGVTcGVjcy5wdXNoKHJlc3VsdCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXhlY3V0YWJsZVNwZWNDb3VudCsrO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAncGFzc2VkJzpcclxuICAgICAgICAgICAgdGhpcy5leGVjdXRhYmxlU3BlY0NvdW50Kys7XHJcbiAgICAgICAgICAgIHRoaXMuI3dyaXRlKHRoaXMuI2NvbG9yZWQoJ2dyZWVuJywgJy4nKSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdmYWlsZWQnOlxyXG4gICAgICAgICAgICB0aGlzLmZhaWx1cmVDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLiNmYWlsZWRTcGVjcy5wdXNoKHJlc3VsdCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXhlY3V0YWJsZVNwZWNDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLiN3cml0ZSh0aGlzLiNjb2xvcmVkKCdyZWQnLCAnRicpKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN1aXRlRG9uZShyZXN1bHQpIHtcclxuICAgICAgICBpZiAocmVzdWx0LmZhaWxlZEV4cGVjdGF0aW9ucz8ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmZhaWx1cmVDb3VudCsrO1xyXG4gICAgICAgICAgICB0aGlzLiNmYWlsZWRTdWl0ZXMucHVzaChyZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBqYXNtaW5lRG9uZShyZXN1bHQpIHtcclxuICAgICAgICBpZiAocmVzdWx0LmZhaWxlZEV4cGVjdGF0aW9ucylcclxuICAgICAgICAgICAgdGhpcy5mYWlsdXJlQ291bnQgKz0gcmVzdWx0LmZhaWxlZEV4cGVjdGF0aW9ucy5sZW5ndGg7XHJcblxyXG4gICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG4gICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy4jZmFpbGVkU3BlY3MubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoJ0ZhaWx1cmVzOicpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuI2ZhaWxlZFNwZWNzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICB0aGlzLiNzcGVjRmFpbHVyZURldGFpbHModGhpcy4jZmFpbGVkU3BlY3NbaV0sIGkgKyAxKTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBmYWlsZWRTdWl0ZSBvZiB0aGlzLiNmYWlsZWRTdWl0ZXMpXHJcbiAgICAgICAgICAgIHRoaXMuI3N1aXRlRmFpbHVyZURldGFpbHMoZmFpbGVkU3VpdGUpO1xyXG5cclxuICAgICAgICBpZiAocmVzdWx0LmZhaWxlZEV4cGVjdGF0aW9ucz8ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLiNzdWl0ZUZhaWx1cmVEZXRhaWxzKHtcclxuICAgICAgICAgICAgICAgIGZ1bGxOYW1lOiAndG9wIHN1aXRlJyxcclxuICAgICAgICAgICAgICAgIC4uLnJlc3VsdCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy4jYWx3YXlzTGlzdFBlbmRpbmdTcGVjcyB8fCByZXN1bHQub3ZlcmFsbFN0YXR1cyA9PT0gJ3Bhc3NlZCcpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuI3BlbmRpbmdTcGVjcy5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgdGhpcy4jd3JpdGUoJ1BlbmRpbmc6Jyk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuI3BlbmRpbmdTcGVjcy5sZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgIHRoaXMuI3BlbmRpbmdTcGVjRGV0YWlscyh0aGlzLiNwZW5kaW5nU3BlY3NbaV0sIGkgKyAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuI3ByaW50Tm90QXBwbGljYWJsZVNwZWNzKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNwZWNDb3VudCA+IDApXHJcbiAgICAgICAgICAgIHRoaXMuI3ByaW50U3VtbWFyeSgpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoJ05vIHNwZWNzIGZvdW5kJyk7XHJcblxyXG4gICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG5cclxuICAgICAgICBjb25zdCBzZWNvbmRzID0gcmVzdWx0Py50b3RhbFRpbWUgLyAxMDAwIHx8IDA7XHJcbiAgICAgICAgdGhpcy4jd3JpdGUoYEZpbmlzaGVkIGluICR7c2Vjb25kc30gJHtwbHVyYWwoJ3NlY29uZCcsIHNlY29uZHMpfWApO1xyXG4gICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG5cclxuICAgICAgICBpZiAocmVzdWx0Py5vdmVyYWxsU3RhdHVzID09PSAnaW5jb21wbGV0ZScpIHtcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoYEluY29tcGxldGU6ICR7cmVzdWx0LmluY29tcGxldGVSZWFzb259YCk7XHJcbiAgICAgICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHJlc3VsdD8ub3JkZXI/LnJhbmRvbSkge1xyXG4gICAgICAgICAgICB0aGlzLiN3cml0ZShgUmFuZG9taXplZCB3aXRoIHNlZWQgJHtyZXN1bHQub3JkZXIuc2VlZH1gKTtcclxuICAgICAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhd2FpdCB0aGlzLiNvdXRwdXRRdWV1ZTtcclxuICAgIH1cclxuXHJcbiAgICAjd3JpdGUodGV4dCkge1xyXG4gICAgICAgIHRoaXMuI291dHB1dFF1ZXVlID0gdGhpcy4jb3V0cHV0UXVldWUudGhlbigoKSA9PiB0aGlzLiNwcmludCh0ZXh0KSk7XHJcbiAgICB9XHJcblxyXG4gICAgI3ByaW50TmV3bGluZSgpIHtcclxuICAgICAgICB0aGlzLiN3cml0ZSgnXFxuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgI2NvbG9yZWQoY29sb3IsIHRleHQpIHtcclxuICAgICAgICBpZiAoIXRoaXMuI3Nob3dDb2xvcnMpXHJcbiAgICAgICAgICAgIHJldHVybiB0ZXh0O1xyXG5cclxuICAgICAgICByZXR1cm4gYW5zaVtjb2xvcl0gKyB0ZXh0ICsgYW5zaS5ub25lO1xyXG4gICAgfVxyXG5cclxuICAgICNzcGVjRmFpbHVyZURldGFpbHMocmVzdWx0LCBmYWlsZWRTcGVjTnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgdGhpcy4jd3JpdGUoYCR7ZmFpbGVkU3BlY051bWJlcn0pICR7cmVzdWx0LmZ1bGxOYW1lfWApO1xyXG4gICAgICAgIHRoaXMuI3ByaW50RmFpbGVkRXhwZWN0YXRpb25zKHJlc3VsdCk7XHJcblxyXG4gICAgICAgIGlmICghcmVzdWx0LmRlYnVnTG9ncylcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLiNwcmludE5ld2xpbmUoKTtcclxuICAgICAgICB0aGlzLiN3cml0ZShpbmRlbnQoJ0RlYnVnIGxvZ3M6JywgMikpO1xyXG4gICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHJlc3VsdC5kZWJ1Z0xvZ3MpIHtcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoaW5kZW50KGAke2VudHJ5LnRpbWVzdGFtcH1tczogJHtlbnRyeS5tZXNzYWdlfWAsIDQpKTtcclxuICAgICAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICNzdWl0ZUZhaWx1cmVEZXRhaWxzKHJlc3VsdCkge1xyXG4gICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG4gICAgICAgIHRoaXMuI3dyaXRlKGBTdWl0ZSBlcnJvcjogJHtyZXN1bHQuZnVsbE5hbWV9YCk7XHJcbiAgICAgICAgdGhpcy4jcHJpbnRGYWlsZWRFeHBlY3RhdGlvbnMocmVzdWx0KTtcclxuICAgIH1cclxuXHJcbiAgICAjcHJpbnRGYWlsZWRFeHBlY3RhdGlvbnMocmVzdWx0KSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBmYWlsZWRFeHBlY3RhdGlvbiBvZiByZXN1bHQuZmFpbGVkRXhwZWN0YXRpb25zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG4gICAgICAgICAgICB0aGlzLiN3cml0ZShpbmRlbnQoJ01lc3NhZ2U6JywgMikpO1xyXG4gICAgICAgICAgICB0aGlzLiNwcmludE5ld2xpbmUoKTtcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoXHJcbiAgICAgICAgICAgICAgICB0aGlzLiNjb2xvcmVkKFxyXG4gICAgICAgICAgICAgICAgICAgICdyZWQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGluZGVudChmYWlsZWRFeHBlY3RhdGlvbi5tZXNzYWdlLCA0KSxcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG4gICAgICAgICAgICB0aGlzLiN3cml0ZShpbmRlbnQoJ1N0YWNrOicsIDIpKTtcclxuICAgICAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgICAgIHRoaXMuI3dyaXRlKFxyXG4gICAgICAgICAgICAgICAgaW5kZW50KHRoaXMuI3N0YWNrRmlsdGVyKGZhaWxlZEV4cGVjdGF0aW9uLnN0YWNrKSwgNCksXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIHJlc3VsdC5mYWlsZWRFeHBlY3RhdGlvbnMubGVuZ3RoID09PSAwXHJcbiAgICAgICAgICAgICYmIHJlc3VsdC5wYXNzZWRFeHBlY3RhdGlvbnMubGVuZ3RoID09PSAwXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuI3ByaW50TmV3bGluZSgpO1xyXG4gICAgICAgICAgICB0aGlzLiN3cml0ZShpbmRlbnQoJ01lc3NhZ2U6JywgMikpO1xyXG4gICAgICAgICAgICB0aGlzLiNwcmludE5ld2xpbmUoKTtcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoXHJcbiAgICAgICAgICAgICAgICB0aGlzLiNjb2xvcmVkKFxyXG4gICAgICAgICAgICAgICAgICAgICdyZWQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGluZGVudCgnU3BlYyBoYXMgbm8gZXhwZWN0YXRpb25zJywgNCksXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICB9XHJcblxyXG4gICAgI3BlbmRpbmdTcGVjRGV0YWlscyhyZXN1bHQsIHBlbmRpbmdTcGVjTnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgdGhpcy4jd3JpdGUoYCR7cGVuZGluZ1NwZWNOdW1iZXJ9KSAke3Jlc3VsdC5mdWxsTmFtZX1gKTtcclxuICAgICAgICB0aGlzLiNwcmludE5ld2xpbmUoKTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVhc29uID0gcmVzdWx0LnBlbmRpbmdSZWFzb24gfHwgJ05vIHJlYXNvbiBnaXZlbic7XHJcblxyXG4gICAgICAgIHRoaXMuI3dyaXRlKGluZGVudCh0aGlzLiNjb2xvcmVkKCd5ZWxsb3cnLCByZWFzb24pLCAyKSk7XHJcbiAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICB9XHJcblxyXG4gICAgI3ByaW50Tm90QXBwbGljYWJsZVNwZWNzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLiNub3RBcHBsaWNhYmxlU3BlY3MubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IGJ5UmVhc29uID0ge307XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgc3BlYyBvZiB0aGlzLiNub3RBcHBsaWNhYmxlU3BlY3MpIHtcclxuICAgICAgICAgICAgY29uc3QgcmVhc29uID0gc3BlYy5ub3RBcHBsaWNhYmxlUmVhc29uO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFieVJlYXNvbltyZWFzb25dKVxyXG4gICAgICAgICAgICAgICAgYnlSZWFzb25bcmVhc29uXSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgYnlSZWFzb25bcmVhc29uXS5wdXNoKHNwZWMuZnVsbE5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgW3JlYXNvbiwgc3BlY05hbWVzXSBvZiBPYmplY3QuZW50cmllcyhieVJlYXNvbikpIHtcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoXHJcbiAgICAgICAgICAgICAgICBgJHtzcGVjTmFtZXMubGVuZ3RofSAke3BsdXJhbCgnc3BlYycsIHNwZWNOYW1lcy5sZW5ndGgpfWBcclxuICAgICAgICAgICAgICAgICsgYCBub3QgYXBwbGljYWJsZSBiZWNhdXNlOiAke3JlYXNvbn1gLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB0aGlzLiNwcmludE5ld2xpbmUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy4jbGlzdE5vdEFwcGxpY2FibGVTcGVjcylcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHNwZWNOYW1lcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4jd3JpdGUoYCAgICogJHtuYW1lfWApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgI3ByaW50U3VtbWFyeSgpIHtcclxuICAgICAgICB0aGlzLiNwcmludE5ld2xpbmUoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZXhlY3V0YWJsZVNwZWNDb3VudCAhPT0gdGhpcy5zcGVjQ291bnQpIHtcclxuICAgICAgICAgICAgdGhpcy4jd3JpdGUoXHJcbiAgICAgICAgICAgICAgICBgUmFuICR7dGhpcy5leGVjdXRhYmxlU3BlY0NvdW50fSBvZiAke3RoaXMuc3BlY0NvdW50fWBcclxuICAgICAgICAgICAgICAgICsgcGx1cmFsKCcgc3BlYycsIHRoaXMuc3BlY0NvdW50KSxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgdGhpcy4jcHJpbnROZXdsaW5lKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc3VtbWFyeVxyXG4gICAgICAgICAgICA9IGAke3RoaXMuZXhlY3V0YWJsZVNwZWNDb3VudH0gYFxyXG4gICAgICAgICAgICArIGAke3BsdXJhbCgnc3BlYycsIHRoaXMuZXhlY3V0YWJsZVNwZWNDb3VudCl9LCBgXHJcbiAgICAgICAgICAgICsgYCR7dGhpcy5mYWlsdXJlQ291bnR9IGBcclxuICAgICAgICAgICAgKyBwbHVyYWwoJ2ZhaWx1cmUnLCB0aGlzLmZhaWx1cmVDb3VudCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLiNwZW5kaW5nU3BlY3MubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnlcclxuICAgICAgICAgICAgICAgICs9IGAsICR7dGhpcy4jcGVuZGluZ1NwZWNzLmxlbmd0aH0gcGVuZGluZyBgXHJcbiAgICAgICAgICAgICAgICArIHBsdXJhbCgnc3BlYycsIHRoaXMuI3BlbmRpbmdTcGVjcy5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy4jd3JpdGUoc3VtbWFyeSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBsdXJhbCh0ZXh0LCBjb3VudCkge1xyXG4gICAgcmV0dXJuIGNvdW50ID09PSAxID8gdGV4dCA6IGAke3RleHR9c2A7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluZGVudCh0ZXh0LCBzcGFjZXMpIHtcclxuICAgIGNvbnN0IHByZWZpeCA9ICcgJy5yZXBlYXQoc3BhY2VzKTtcclxuXHJcbiAgICByZXR1cm4gKHRleHQgfHwgJycpXHJcbiAgICAgICAgLnNwbGl0KCdcXG4nKVxyXG4gICAgICAgIC5tYXAobGluZSA9PiBwcmVmaXggKyBsaW5lKVxyXG4gICAgICAgIC5qb2luKCdcXG4nKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ3VzdG9tUmVwb3J0ZXI7XHJcbiIsICJpbXBvcnQgeyBmaW5kVGVzdEZpbGVzIH0gZnJvbSAnLi9zaGFyZWQvdGVzdGluZy9maW5kVGVzdEZpbGVzLmpzJztcclxuaW1wb3J0IHsgZXhpdEFwcCwgbW91bnQsIHdyaXRlUHJvY2Vzc091dHB1dCB9IGZyb20gJy4vc2hhcmVkL25ldXRyYWxpbm9BZGFwdGVyLmpzJztcclxuaW1wb3J0IEN1c3RvbVJlcG9ydGVyIGZyb20gJy4vc2hhcmVkL3Rlc3RpbmcvY3VzdG9tUmVwb3J0ZXIuanMnO1xyXG5cclxuY29uc3QgUkVTVUxUX1BSRUZJWCA9ICdAVEVTVF9SRVNVTFQ6JztcclxuY29uc3QgT1VUUFVUX1BSRUZJWCA9ICdAVEVTVF9PVVRQVVQ6JztcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWRNb2R1bGVUZXN0cygpIHtcclxuICAgIGNvbnN0IHRlc3RGaWxlcyA9IGF3YWl0IGZpbmRUZXN0RmlsZXMoJ21vZHVsZXMnKTtcclxuICAgIGF3YWl0IG1vdW50KCcvbW9kdWxlcycsIE5MX1BBVEggKyAnL21vZHVsZXMnKTtcclxuICAgIGZvciAoY29uc3QgZmlsZSBvZiB0ZXN0RmlsZXMpXHJcbiAgICAgICAgYXdhaXQgaW1wb3J0KGAvJHtmaWxlfWApO1xyXG59XHJcblxyXG5mdW5jdGlvbiB2ZXJpZnlUZXN0RW52aXJvbm1lbnQoKSB7XHJcbiAgICBpZiAoTkxfQVBQSUQgPT09ICdjYXJkbWFnaWNpYW4udGVzdCcpIHJldHVybjtcclxuICAgIHRocm93IG5ldyBFcnJvcihgQ2FuY2VsaW5nIHNtb2tlIHRlc3RzIHdpdGggdW5zdXBwb3J0ZWQgYXBwSWQgXCIke05MX0FQUElEfVwiLmApO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBydW5UZXN0cygpIHtcclxuICAgIGxvZygnc3RhcnR1cCcpLmluZm8oJ0luaXRpYWxpemluZyBuZXV0cmFsaW5vJyk7XHJcbiAgICBOZXV0cmFsaW5vLmluaXQoKTtcclxuXHJcbiAgICBsb2coJ3N0YXJ0dXAnKS5pbmZvKCdWZXJpZnlpbmcgdGVzdCBlbnZpcm9ubWVudCcpO1xyXG4gICAgdmVyaWZ5VGVzdEVudmlyb25tZW50KCk7XHJcblxyXG4gICAgbG9nKCdzdGFydHVwJykuaW5mbygnQ2xlYXJpbmcgbmV1dHJhbGlubyBzdG9yYWdlJyk7XHJcbiAgICBhd2FpdCBOZXV0cmFsaW5vLnN0b3JhZ2UuY2xlYXIoKTtcclxuXHJcbiAgICBsb2coJ3N0YXJ0dXAnKS5pbmZvKCdMb2FkaW5nIG1vZHVsZSB0ZXN0cycpO1xyXG4gICAgYXdhaXQgbG9hZE1vZHVsZVRlc3RzKCk7XHJcblxyXG4gICAgbG9nKCdzdGFydHVwJykuaW5mbygnRXhlY3V0aW5nIGphc21pbmUgdGVzdHMnKTtcclxuICAgIGF3YWl0IHdpbmRvdy5leGVjdXRlSmFzbWluZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwcmludChtZXNzYWdlKSB7XHJcbiAgICB3cml0ZVByb2Nlc3NPdXRwdXQoT1VUUFVUX1BSRUZJWCArIEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZSB9KSArICdcXG4nKTtcclxufVxyXG5cclxuamFzbWluZS5nZXRFbnYoKS5hZGRSZXBvcnRlcihcclxuICAgIG5ldyBDdXN0b21SZXBvcnRlcih7IHByaW50IH0pXHJcbik7XHJcblxyXG5qYXNtaW5lLmdldEVudigpLmFkZFJlcG9ydGVyKHtcclxuICAgIGFzeW5jIGphc21pbmVEb25lKHJlc3VsdCkge1xyXG4gICAgICAgIGNvbnN0IG91dHB1dCA9IEpTT04uc3RyaW5naWZ5KHsgc3RhdHVzOiByZXN1bHQub3ZlcmFsbFN0YXR1cyB9KTtcclxuICAgICAgICBhd2FpdCB3cml0ZVByb2Nlc3NPdXRwdXQoUkVTVUxUX1BSRUZJWCArIG91dHB1dCArICdcXG4nKTtcclxuICAgICAgICBpZiAoIU5MX0FSR1MuaW5jbHVkZXMoJy0tc3RheS1vcGVuJykpIGNsb3NlKCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsICgpID0+IHtcclxuICAgIGV4aXRBcHAoKTtcclxufSk7XHJcblxyXG5ydW5UZXN0cygpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsTUFBTSxjQUFjLENBQUM7QUFBQSxJQUNqQixNQUFNLFNBQU8sZUFBZTtBQUFBLElBQzVCLFdBQVcsU0FBTyxJQUFJO0FBQUEsRUFDMUIsR0FBRztBQUFBLElBQ0MsTUFBTSxTQUFPLE9BQU8sUUFBUTtBQUFBLElBQzVCLFdBQVcsU0FBTyxhQUFhLElBQUksUUFBUSxXQUFXO0FBQUEsRUFDMUQsR0FBRztBQUFBLElBQ0MsTUFBTSxTQUFPLE9BQU8sUUFBUTtBQUFBLElBQzVCLFdBQVcsU0FBTyxJQUFJLFNBQVM7QUFBQSxFQUNuQyxHQUFHO0FBQUEsSUFDQyxNQUFNLFNBQU8sT0FBTyxRQUFRLFlBQVksUUFBUTtBQUFBLElBQ2hELFdBQVcsU0FBTztBQUFBLEVBQ3RCLEdBQUc7QUFBQSxJQUNDLE1BQU0sQ0FBQyxLQUFLLFNBQVMsS0FBSyxJQUFJLEdBQUc7QUFBQSxJQUNqQyxXQUFXLE1BQU07QUFBQSxFQUNyQixHQUFHO0FBQUEsSUFDQyxNQUFNLFNBQU8sTUFBTSxRQUFRLEdBQUc7QUFBQSxJQUM5QixXQUFXLENBQUMsS0FBSyxNQUFNLFdBQVcsVUFBVTtBQUN4QyxXQUFLLElBQUksR0FBRztBQUNaLGFBQU8sSUFBSSxJQUFJLE9BQUssVUFBVSxHQUFHLFFBQVEsQ0FBQyxDQUFDO0FBQUEsSUFDL0M7QUFBQSxFQUNKLEdBQUc7QUFBQSxJQUNDLE1BQU0sTUFBTTtBQUFBLElBQ1osV0FBVyxDQUFDLEtBQUssTUFBTSxXQUFXLFVBQVU7QUFDeEMsV0FBSyxJQUFJLEdBQUc7QUFDWixZQUFNLE1BQU0sQ0FBQztBQUNiLGlCQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssT0FBTyxRQUFRLEdBQUc7QUFDbkMsWUFBSSxDQUFDLElBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQztBQUNuQyxhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0osQ0FBQztBQUVjLFdBQVIsY0FBK0IsT0FBTyxXQUFXLEdBQUcsWUFBWSxLQUFRO0FBQzNFLFVBQU0sT0FBTyxvQkFBSSxJQUFJO0FBRXJCLGFBQVMsVUFBVSxLQUFLLE9BQU87QUFDM0IsVUFBSSxRQUFRLFNBQVUsUUFBTztBQUM3QixZQUFNLGFBQWEsWUFBWSxLQUFLLE9BQUssRUFBRSxLQUFLLEtBQUssSUFBSSxDQUFDO0FBQzFELFVBQUksQ0FBQyxXQUFZO0FBQ2pCLGFBQU8sV0FBVyxVQUFVLEtBQUssTUFBTSxXQUFXLEtBQUs7QUFBQSxJQUMzRDtBQUVBLFFBQUk7QUFDSixRQUFJO0FBQ0EsWUFBTSxrQkFBa0IsVUFBVSxPQUFPLENBQUM7QUFDMUMsZUFBUyxPQUFPLG9CQUFvQixXQUM5QixrQkFDQSxLQUFLLFVBQVUsaUJBQWlCLE1BQU0sQ0FBQztBQUFBLElBQ2pELFNBQVMsT0FBTztBQUNaLGNBQVEsTUFBTSxLQUFLO0FBQ25CLGFBQU87QUFBQSxJQUNYO0FBRUEsUUFBSSxVQUFVLE9BQU8sU0FBUztBQUMxQixhQUFPLE9BQU8sTUFBTSxHQUFHLFNBQVMsSUFBSTtBQUV4QyxXQUFPO0FBQUEsRUFDWDs7O0FDdkRBLE1BQU0saUJBQWlCO0FBQUEsSUFDbkIsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBQ1g7QUFFQSxpQkFBc0IsU0FBUyxPQUFPLFNBQVMsTUFBTTtBQUNqRCxVQUFNLE9BQU8sZUFBZSxLQUFLLEtBQUs7QUFDdEMsVUFBTSxrQkFBa0IsVUFBVSxLQUFLLElBQUksU0FBTztBQUM5QyxhQUFPO0FBQUEsRUFBSyxjQUFjLEdBQUcsQ0FBQztBQUFBLElBQ2xDLENBQUMsRUFBRSxLQUFLLEVBQUU7QUFDVixXQUFPLE1BQU0sV0FBVyxNQUFNLElBQUksaUJBQWlCLElBQUk7QUFBQSxFQUMzRDtBQTRCQSxpQkFBc0IsY0FBYyxNQUFNLFNBQVM7QUFDL0MsUUFBSSxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsTUFBTSxPQUFPO0FBQzlDLFdBQU8sTUFBTSxXQUFXLFdBQVcsY0FBYyxNQUFNLE9BQU87QUFBQSxFQUNsRTtBQUVBLGlCQUFzQixTQUFTLE1BQU07QUFDakMsUUFBSSxJQUFJLEVBQUUsTUFBTSxZQUFZLElBQUk7QUFDaEMsV0FBTyxNQUFNLFdBQVcsV0FBVyxTQUFTLElBQUk7QUFBQSxFQUNwRDtBQUVBLGlCQUFzQixVQUFVLE1BQU0sTUFBTTtBQUN4QyxRQUFJLElBQUksRUFBRSxNQUFNLGFBQWEsTUFBTSxHQUFHLEtBQUssTUFBTSxRQUFRO0FBQ3pELFVBQU0sRUFBRSxXQUFXLElBQUksTUFBTSxXQUFXLFdBQVcsYUFBYSxJQUFJO0FBQ3BFLFVBQU0sZ0JBQWdCLFVBQVU7QUFDaEMsVUFBTSxXQUFXLFdBQVcsVUFBVSxNQUFNLElBQUk7QUFBQSxFQUNwRDtBQXdCQSxpQkFBc0IsU0FBUyxNQUFNO0FBQ2pDLFFBQUksSUFBSSxFQUFFLE1BQU0sWUFBWSxJQUFJO0FBQ2hDLFdBQU8sTUFBTSxXQUFXLFdBQVcsU0FBUyxJQUFJO0FBQUEsRUFDcEQ7QUFZQSxpQkFBc0IsZ0JBQWdCLE1BQU07QUFDeEMsUUFBSSxJQUFJLEVBQUUsTUFBTSxtQkFBbUIsSUFBSTtBQUN2QyxRQUFJO0FBQ0EsWUFBTSxXQUFXLFdBQVcsZ0JBQWdCLElBQUk7QUFBQSxJQUNwRCxTQUFTLE9BQU87QUFDWixVQUFJLE1BQU0sU0FBUztBQUNmLGNBQU0sSUFBSSxNQUFNLEdBQUcsTUFBTSxJQUFJLElBQUksTUFBTSxPQUFPLEVBQUU7QUFBQSxJQUN4RDtBQUFBLEVBQ0o7QUFnQ0EsaUJBQXNCLE1BQU0sTUFBTSxRQUFRO0FBQ3RDLFFBQUksSUFBSSxFQUFFLE1BQU0sU0FBUyxNQUFNLE1BQU07QUFDckMsUUFBSTtBQUNBLFlBQU0sV0FBVyxPQUFPLE1BQU0sTUFBTSxNQUFNO0FBQUEsSUFDOUMsU0FBUyxPQUFPO0FBQ1osVUFBSSxNQUFNLFNBQVM7QUFDZixjQUFNLElBQUksTUFBTSxHQUFHLE1BQU0sSUFBSSxJQUFJLE1BQU0sT0FBTyxFQUFFO0FBQUEsSUFDeEQ7QUFBQSxFQUNKO0FBTU8sV0FBUyxtQkFBbUIsTUFBTTtBQUNyQyxXQUFPLFdBQVcsSUFBSSxtQkFBbUIsSUFBSTtBQUFBLEVBQ2pEO0FBY08sV0FBUyxRQUFRLE9BQU8sR0FBRztBQUM5QixlQUFXLElBQUksS0FBSyxJQUFJO0FBQUEsRUFDNUI7OztBQ3RLQSxNQUFNLGNBQWMsUUFBUSxTQUFTLFNBQVM7QUFDOUMsTUFBTUEsT0FBTSxDQUFDO0FBQ2IsTUFBTSxVQUFVLENBQUM7QUFDakIsTUFBTSxZQUFZLENBQUM7QUFPWixXQUFTLFlBQVksVUFBVSxPQUFPO0FBQ3pDLGNBQVUsUUFBUSxJQUFJLEVBQUUsTUFBTTtBQUFBLEVBQ2xDO0FBRUEsV0FBUyxXQUFXLE9BQU8sVUFBVSxZQUFZLE1BQU07QUFDbkQsVUFBTUMsYUFBWSxvQkFBSSxLQUFLO0FBQzNCLFVBQU0sWUFBWSxVQUFVLFVBQVUsUUFBUSxHQUFHLFNBQVMsU0FBUztBQUNuRSxZQUFRLEtBQUssRUFBRSxNQUFNLFFBQVEsS0FBSyxPQUFPLElBQUksV0FBVyxHQUFHLElBQUk7QUFDL0QsUUFBSSxVQUFVLFdBQVcsQ0FBQyxZQUFhO0FBQ3ZDLElBQUFDLEtBQUksS0FBSyxFQUFFLE9BQU8sVUFBVSxTQUFTLE1BQU0sV0FBQUQsV0FBVSxDQUFDO0FBQ3RELGFBQVMsT0FBTyxJQUFJLFFBQVEsS0FBSyxPQUFPLElBQUksSUFBSSxFQUFFLE1BQU0sTUFBTTtBQUFBLElBQUMsQ0FBQztBQUFBLEVBQ3BFO0FBRUEsU0FBTyxNQUFNLFNBQVMsVUFBVTtBQUM1QixXQUFPLDBDQUFzQjtBQUFBLE1BQ3pCLE9BQU8sQ0FBQyxRQUFRLFNBQVMsV0FBVyxTQUFTLFVBQVUsS0FBSyxHQUFHLElBQUk7QUFBQSxNQUNuRSxNQUFPLENBQUMsUUFBUSxTQUFTLFdBQVcsUUFBUyxVQUFVLEtBQUssR0FBRyxJQUFJO0FBQUEsTUFDbkUsTUFBTyxDQUFDLFFBQVEsU0FBUyxXQUFXLFFBQVMsVUFBVSxLQUFLLEdBQUcsSUFBSTtBQUFBLE1BQ25FLE9BQU8sQ0FBQyxRQUFRLFNBQVMsV0FBVyxTQUFTLFVBQVUsS0FBSyxHQUFHLElBQUk7QUFBQSxJQUN2RTtBQUFBLEVBQ0o7QUFFQSxjQUFZLFdBQVcsV0FBVztBQUNsQyxjQUFZLE1BQVcsT0FBTztBQUM5QixjQUFZLFNBQVcsTUFBTTtBQUM3QixjQUFZLFFBQVcsT0FBTztBQUM5QixjQUFZLFVBQVcsV0FBVztBQUNsQyxjQUFZLFNBQVcsUUFBUTtBQUMvQixjQUFZLFVBQVcsT0FBTztBQUM5QixjQUFZLFVBQVcsWUFBWTs7O0FDekNuQyxXQUFTLHFCQUFxQixNQUFNLE1BQU0sWUFBWTtBQUNsRCxRQUFJLE9BQU8sU0FBUyxjQUFjLENBQUMsS0FBSztBQUNwQyxZQUFNLElBQUksVUFBVSwrQ0FBK0M7QUFDdkUsUUFBSSxPQUFPLFNBQVM7QUFDaEIsWUFBTSxJQUFJLFVBQVUsa0NBQWtDO0FBRTFELFFBQUksT0FBTyxVQUFVLGVBQWUsS0FBSyxLQUFLLFdBQVcsSUFBSSxHQUFHO0FBQzVELFVBQUksU0FBUyxFQUFFLEtBQUssR0FBRyxLQUFLLElBQUksY0FBYyxJQUFJLG1DQUE4QjtBQUNoRjtBQUFBLElBQ0o7QUFFQSxVQUFNLGtCQUFrQixPQUFPO0FBQUEsTUFDM0IsRUFBRSxVQUFVLE1BQU0sY0FBYyxNQUFNLFlBQVksTUFBTTtBQUFBLE1BQ3hEO0FBQUEsSUFDSjtBQUVBLFdBQU8sZUFBZSxLQUFLLFdBQVcsTUFBTSxlQUFlO0FBQUEsRUFDL0Q7QUFZQSx1QkFBcUIsUUFBUSxZQUFZO0FBQUEsSUFDckMsT0FBTyxTQUFTLFNBQVMsWUFBWSxLQUFLO0FBQ3RDLGFBQU8sS0FBSyxRQUFRLG1CQUFtQixLQUFLLFNBQVMsSUFBSTtBQUFBLElBQzdEO0FBQUEsRUFDSixDQUFDO0FBVUQsdUJBQXFCLFFBQVEsa0JBQWtCO0FBQUEsSUFDM0MsT0FBTyxTQUFTLGVBQWUsTUFBTSxnQkFBZ0I7QUFDakQsVUFBSSxFQUFFLGVBQWU7QUFDakIsY0FBTSxJQUFJLFVBQVUsNEJBQTRCO0FBQ3BELGFBQU8sS0FBSyxZQUFZLEVBQUUsV0FBVyxLQUFLLEdBQUcsRUFBRSxLQUFLO0FBQUEsSUFDeEQ7QUFBQSxFQUNKLENBQUM7QUFTRCx1QkFBcUIsUUFBUSxlQUFlO0FBQUEsSUFDeEMsT0FBTyxTQUFTLGNBQWM7QUFDMUIsYUFBTyxLQUFLLE1BQU0sS0FBSyxFQUNsQixJQUFJLE9BQUssRUFBRSxPQUFPLENBQUMsRUFBRSxZQUFZLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUMvQyxLQUFLLEdBQUc7QUFBQSxJQUNqQjtBQUFBLEVBQ0osQ0FBQztBQVNELHVCQUFxQixRQUFRLGVBQWU7QUFBQSxJQUN4QyxPQUFPLFNBQVMsY0FBYztBQUMxQixhQUFPLEtBQUssTUFBTSxLQUFLLEVBQ2xCO0FBQUEsUUFBSSxDQUFDLEdBQUcsTUFDTCxNQUFNLElBQUksSUFBSyxFQUFFLE9BQU8sQ0FBQyxFQUFFLFlBQVksSUFBSSxFQUFFLE1BQU0sQ0FBQztBQUFBLE1BQ3hELEVBQUUsS0FBSyxFQUFFO0FBQUEsSUFDakI7QUFBQSxFQUNKLENBQUM7QUFXRCx1QkFBcUIsUUFBUSxVQUFVO0FBQUEsSUFDbkMsT0FBTyxTQUFTLFVBQVUsZUFBZTtBQUNyQyxhQUFPLE9BQU87QUFBQSxRQUNWLE9BQU8sUUFBUSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsY0FBYyxTQUFTLEdBQUcsQ0FBQztBQUFBLE1BQ3ZFO0FBQUEsSUFDSjtBQUFBLEVBQ0osQ0FBQztBQVVELHVCQUFxQixPQUFPLFVBQVU7QUFBQSxJQUNsQyxPQUFPLFNBQVMsT0FBTyxNQUFNO0FBQ3pCLFlBQU0sUUFBUSxLQUFLLFFBQVEsSUFBSTtBQUMvQixVQUFJLFFBQVEsR0FBSSxNQUFLLE9BQU8sT0FBTyxDQUFDO0FBQ3BDLGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSixDQUFDO0FBY0QsdUJBQXFCLE9BQU8sT0FBTztBQUFBLElBQy9CLE9BQU8sU0FBUyxJQUFJLFlBQVk7QUFDNUIsWUFBTSxNQUFNLENBQUM7QUFDYixlQUFTLElBQUksR0FBRyxJQUFJLEtBQUssVUFBVSxJQUFJLFdBQVcsUUFBUTtBQUN0RCxZQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBQ3JDLGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSixDQUFDO0FBZ0JELHVCQUFxQixPQUFPLGdCQUFnQjtBQUFBLElBQ3hDLE9BQU8sU0FBUyxhQUFhLGFBQWE7QUFDdEMsYUFBTyxLQUFLLE9BQU8sQ0FBQyxZQUFZLFNBQVM7QUFDckMsY0FBTSxNQUFNLFlBQVksSUFBSTtBQUM1QixZQUFJLE9BQU8sT0FBTyxZQUFZLEdBQUc7QUFDN0IsZ0JBQU0sSUFBSSxNQUFNLDZCQUE2QixHQUFHLEVBQUU7QUFDdEQsbUJBQVcsR0FBRyxJQUFJO0FBQ2xCLGVBQU87QUFBQSxNQUNYLEdBQUcsQ0FBQyxDQUFDO0FBQUEsSUFDVDtBQUFBLEVBQ0osQ0FBQztBQVVELHVCQUFxQixVQUFVLFlBQVk7QUFBQSxJQUN2QyxPQUFPLFNBQVMsU0FBUyxPQUFPO0FBQzVCLFVBQUksVUFBVTtBQUNkLFVBQUksVUFBVTtBQUNkLFVBQUksT0FBTztBQUNYLFlBQU0sT0FBTztBQUViLFlBQU0sU0FBUyxXQUFXO0FBQ3RCLGtCQUFVO0FBQ1YsZUFBTyxLQUFLLE1BQU0sU0FBUyxJQUFJO0FBQUEsTUFDbkM7QUFFQSxZQUFNLFlBQVksV0FBVztBQUN6QixrQkFBVTtBQUNWLGVBQU87QUFDUCxxQkFBYSxPQUFPO0FBQ3BCLGtCQUFVLFdBQVcsUUFBUSxLQUFLO0FBQUEsTUFDdEM7QUFFQSxhQUFPLGVBQWUsV0FBVyxVQUFVO0FBQUEsUUFDdkMsT0FBTyxTQUFTLFNBQVM7QUFDckIsdUJBQWEsT0FBTztBQUNwQixvQkFBVTtBQUNWLG9CQUFVO0FBQ1YsaUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSixDQUFDO0FBRUQsYUFBTyxlQUFlLFdBQVcsU0FBUztBQUFBLFFBQ3RDLE9BQU8sU0FBUyxRQUFRO0FBQ3BCLGNBQUksWUFBWSxLQUFNO0FBQ3RCLHVCQUFhLE9BQU87QUFDcEIsaUJBQU8sT0FBTztBQUFBLFFBQ2xCO0FBQUEsTUFDSixDQUFDO0FBRUQsYUFBTztBQUFBLElBQ1g7QUFBQSxFQUNKLENBQUM7OztBQ2hORDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHFCQUFBRTtBQUFBLElBQUE7QUFBQTtBQUFBOzs7QUNBQSxNQUFNLFFBQVEsdUJBQU8sSUFBSSxZQUFZO0FBQ3JDLE1BQU0sTUFBTSx1QkFBTyxJQUFJLGVBQWU7QUFDdEMsTUFBTSxNQUFNLHVCQUFPLElBQUksVUFBVTtBQUNqQyxNQUFNLE9BQU8sdUJBQU8sSUFBSSxXQUFXO0FBQ25DLE1BQU0sU0FBUyx1QkFBTyxJQUFJLGFBQWE7QUFDdkMsTUFBTSxNQUFNLHVCQUFPLElBQUksVUFBVTtBQUNqQyxNQUFNLFlBQVksdUJBQU8sSUFBSSxnQkFBZ0I7QUFDN0MsTUFBTSxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxPQUFPLFNBQVMsWUFBWSxLQUFLLFNBQVMsTUFBTTtBQUNwRixNQUFNLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLE9BQU8sU0FBUyxZQUFZLEtBQUssU0FBUyxNQUFNO0FBQ3ZGLE1BQU0sUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsT0FBTyxTQUFTLFlBQVksS0FBSyxTQUFTLE1BQU07QUFDbEYsTUFBTSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxPQUFPLFNBQVMsWUFBWSxLQUFLLFNBQVMsTUFBTTtBQUNuRixNQUFNLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLE9BQU8sU0FBUyxZQUFZLEtBQUssU0FBUyxNQUFNO0FBQ3JGLE1BQU0sUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsT0FBTyxTQUFTLFlBQVksS0FBSyxTQUFTLE1BQU07QUFDbEYsV0FBUyxhQUFhLE1BQU07QUFDeEIsUUFBSSxRQUFRLE9BQU8sU0FBUztBQUN4QixjQUFRLEtBQUssU0FBUyxHQUFHO0FBQUEsUUFDckIsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPO0FBQUEsTUFDZjtBQUNKLFdBQU87QUFBQSxFQUNYO0FBQ0EsV0FBUyxPQUFPLE1BQU07QUFDbEIsUUFBSSxRQUFRLE9BQU8sU0FBUztBQUN4QixjQUFRLEtBQUssU0FBUyxHQUFHO0FBQUEsUUFDckIsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPO0FBQUEsTUFDZjtBQUNKLFdBQU87QUFBQSxFQUNYO0FBQ0EsTUFBTSxZQUFZLENBQUMsVUFBVSxTQUFTLElBQUksS0FBSyxhQUFhLElBQUksTUFBTSxDQUFDLENBQUMsS0FBSzs7O0FDL0I3RSxNQUFNLFFBQVEsdUJBQU8sYUFBYTtBQUNsQyxNQUFNLE9BQU8sdUJBQU8sZUFBZTtBQUNuQyxNQUFNLFNBQVMsdUJBQU8sYUFBYTtBQStCbkMsV0FBUyxNQUFNLE1BQU0sU0FBUztBQUMxQixVQUFNLFdBQVcsWUFBWSxPQUFPO0FBQ3BDLFFBQUksV0FBVyxJQUFJLEdBQUc7QUFDbEIsWUFBTSxLQUFLLE9BQU8sTUFBTSxLQUFLLFVBQVUsVUFBVSxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0RSxVQUFJLE9BQU87QUFDUCxhQUFLLFdBQVc7QUFBQSxJQUN4QjtBQUVJLGFBQU8sTUFBTSxNQUFNLFVBQVUsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQUEsRUFDdEQ7QUFLQSxRQUFNLFFBQVE7QUFFZCxRQUFNLE9BQU87QUFFYixRQUFNLFNBQVM7QUFDZixXQUFTLE9BQU8sS0FBSyxNQUFNLFNBQVMsTUFBTTtBQUN0QyxVQUFNLE9BQU8sWUFBWSxLQUFLLE1BQU0sU0FBUyxJQUFJO0FBQ2pELFFBQUksT0FBTyxJQUFJLEtBQUssT0FBTyxJQUFJLEdBQUc7QUFDOUIsa0JBQVksS0FBSyxNQUFNLElBQUk7QUFDM0IsYUFBTyxPQUFPLEtBQUssTUFBTSxTQUFTLElBQUk7QUFBQSxJQUMxQztBQUNBLFFBQUksT0FBTyxTQUFTLFVBQVU7QUFDMUIsVUFBSSxhQUFhLElBQUksR0FBRztBQUNwQixlQUFPLE9BQU8sT0FBTyxLQUFLLE9BQU8sSUFBSSxDQUFDO0FBQ3RDLGlCQUFTLElBQUksR0FBRyxJQUFJLEtBQUssTUFBTSxRQUFRLEVBQUUsR0FBRztBQUN4QyxnQkFBTSxLQUFLLE9BQU8sR0FBRyxLQUFLLE1BQU0sQ0FBQyxHQUFHLFNBQVMsSUFBSTtBQUNqRCxjQUFJLE9BQU8sT0FBTztBQUNkLGdCQUFJLEtBQUs7QUFBQSxtQkFDSixPQUFPO0FBQ1osbUJBQU87QUFBQSxtQkFDRixPQUFPLFFBQVE7QUFDcEIsaUJBQUssTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUN0QixpQkFBSztBQUFBLFVBQ1Q7QUFBQSxRQUNKO0FBQUEsTUFDSixXQUNTLE9BQU8sSUFBSSxHQUFHO0FBQ25CLGVBQU8sT0FBTyxPQUFPLEtBQUssT0FBTyxJQUFJLENBQUM7QUFDdEMsY0FBTSxLQUFLLE9BQU8sT0FBTyxLQUFLLEtBQUssU0FBUyxJQUFJO0FBQ2hELFlBQUksT0FBTztBQUNQLGlCQUFPO0FBQUEsaUJBQ0YsT0FBTztBQUNaLGVBQUssTUFBTTtBQUNmLGNBQU0sS0FBSyxPQUFPLFNBQVMsS0FBSyxPQUFPLFNBQVMsSUFBSTtBQUNwRCxZQUFJLE9BQU87QUFDUCxpQkFBTztBQUFBLGlCQUNGLE9BQU87QUFDWixlQUFLLFFBQVE7QUFBQSxNQUNyQjtBQUFBLElBQ0o7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQWdDQSxpQkFBZSxXQUFXLE1BQU0sU0FBUztBQUNyQyxVQUFNLFdBQVcsWUFBWSxPQUFPO0FBQ3BDLFFBQUksV0FBVyxJQUFJLEdBQUc7QUFDbEIsWUFBTSxLQUFLLE1BQU0sWUFBWSxNQUFNLEtBQUssVUFBVSxVQUFVLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pGLFVBQUksT0FBTztBQUNQLGFBQUssV0FBVztBQUFBLElBQ3hCO0FBRUksWUFBTSxZQUFZLE1BQU0sTUFBTSxVQUFVLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQztBQUFBLEVBQ2pFO0FBS0EsYUFBVyxRQUFRO0FBRW5CLGFBQVcsT0FBTztBQUVsQixhQUFXLFNBQVM7QUFDcEIsaUJBQWUsWUFBWSxLQUFLLE1BQU0sU0FBUyxNQUFNO0FBQ2pELFVBQU0sT0FBTyxNQUFNLFlBQVksS0FBSyxNQUFNLFNBQVMsSUFBSTtBQUN2RCxRQUFJLE9BQU8sSUFBSSxLQUFLLE9BQU8sSUFBSSxHQUFHO0FBQzlCLGtCQUFZLEtBQUssTUFBTSxJQUFJO0FBQzNCLGFBQU8sWUFBWSxLQUFLLE1BQU0sU0FBUyxJQUFJO0FBQUEsSUFDL0M7QUFDQSxRQUFJLE9BQU8sU0FBUyxVQUFVO0FBQzFCLFVBQUksYUFBYSxJQUFJLEdBQUc7QUFDcEIsZUFBTyxPQUFPLE9BQU8sS0FBSyxPQUFPLElBQUksQ0FBQztBQUN0QyxpQkFBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLE1BQU0sUUFBUSxFQUFFLEdBQUc7QUFDeEMsZ0JBQU0sS0FBSyxNQUFNLFlBQVksR0FBRyxLQUFLLE1BQU0sQ0FBQyxHQUFHLFNBQVMsSUFBSTtBQUM1RCxjQUFJLE9BQU8sT0FBTztBQUNkLGdCQUFJLEtBQUs7QUFBQSxtQkFDSixPQUFPO0FBQ1osbUJBQU87QUFBQSxtQkFDRixPQUFPLFFBQVE7QUFDcEIsaUJBQUssTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUN0QixpQkFBSztBQUFBLFVBQ1Q7QUFBQSxRQUNKO0FBQUEsTUFDSixXQUNTLE9BQU8sSUFBSSxHQUFHO0FBQ25CLGVBQU8sT0FBTyxPQUFPLEtBQUssT0FBTyxJQUFJLENBQUM7QUFDdEMsY0FBTSxLQUFLLE1BQU0sWUFBWSxPQUFPLEtBQUssS0FBSyxTQUFTLElBQUk7QUFDM0QsWUFBSSxPQUFPO0FBQ1AsaUJBQU87QUFBQSxpQkFDRixPQUFPO0FBQ1osZUFBSyxNQUFNO0FBQ2YsY0FBTSxLQUFLLE1BQU0sWUFBWSxTQUFTLEtBQUssT0FBTyxTQUFTLElBQUk7QUFDL0QsWUFBSSxPQUFPO0FBQ1AsaUJBQU87QUFBQSxpQkFDRixPQUFPO0FBQ1osZUFBSyxRQUFRO0FBQUEsTUFDckI7QUFBQSxJQUNKO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFDQSxXQUFTLFlBQVksU0FBUztBQUMxQixRQUFJLE9BQU8sWUFBWSxhQUNsQixRQUFRLGNBQWMsUUFBUSxRQUFRLFFBQVEsUUFBUTtBQUN2RCxhQUFPLE9BQU8sT0FBTztBQUFBLFFBQ2pCLE9BQU8sUUFBUTtBQUFBLFFBQ2YsS0FBSyxRQUFRO0FBQUEsUUFDYixRQUFRLFFBQVE7QUFBQSxRQUNoQixLQUFLLFFBQVE7QUFBQSxNQUNqQixHQUFHLFFBQVEsU0FBUztBQUFBLFFBQ2hCLEtBQUssUUFBUTtBQUFBLFFBQ2IsUUFBUSxRQUFRO0FBQUEsUUFDaEIsS0FBSyxRQUFRO0FBQUEsTUFDakIsR0FBRyxRQUFRLGNBQWM7QUFBQSxRQUNyQixLQUFLLFFBQVE7QUFBQSxRQUNiLEtBQUssUUFBUTtBQUFBLE1BQ2pCLEdBQUcsT0FBTztBQUFBLElBQ2Q7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUNBLFdBQVMsWUFBWSxLQUFLLE1BQU0sU0FBUyxNQUFNO0FBQzNDLFFBQUksT0FBTyxZQUFZO0FBQ25CLGFBQU8sUUFBUSxLQUFLLE1BQU0sSUFBSTtBQUNsQyxRQUFJLE1BQU0sSUFBSTtBQUNWLGFBQU8sUUFBUSxNQUFNLEtBQUssTUFBTSxJQUFJO0FBQ3hDLFFBQUksTUFBTSxJQUFJO0FBQ1YsYUFBTyxRQUFRLE1BQU0sS0FBSyxNQUFNLElBQUk7QUFDeEMsUUFBSSxPQUFPLElBQUk7QUFDWCxhQUFPLFFBQVEsT0FBTyxLQUFLLE1BQU0sSUFBSTtBQUN6QyxRQUFJLFNBQVMsSUFBSTtBQUNiLGFBQU8sUUFBUSxTQUFTLEtBQUssTUFBTSxJQUFJO0FBQzNDLFFBQUksUUFBUSxJQUFJO0FBQ1osYUFBTyxRQUFRLFFBQVEsS0FBSyxNQUFNLElBQUk7QUFDMUMsV0FBTztBQUFBLEVBQ1g7QUFDQSxXQUFTLFlBQVksS0FBSyxNQUFNLE1BQU07QUFDbEMsVUFBTSxTQUFTLEtBQUssS0FBSyxTQUFTLENBQUM7QUFDbkMsUUFBSSxhQUFhLE1BQU0sR0FBRztBQUN0QixhQUFPLE1BQU0sR0FBRyxJQUFJO0FBQUEsSUFDeEIsV0FDUyxPQUFPLE1BQU0sR0FBRztBQUNyQixVQUFJLFFBQVE7QUFDUixlQUFPLE1BQU07QUFBQTtBQUViLGVBQU8sUUFBUTtBQUFBLElBQ3ZCLFdBQ1MsV0FBVyxNQUFNLEdBQUc7QUFDekIsYUFBTyxXQUFXO0FBQUEsSUFDdEIsT0FDSztBQUNELFlBQU0sS0FBSyxRQUFRLE1BQU0sSUFBSSxVQUFVO0FBQ3ZDLFlBQU0sSUFBSSxNQUFNLDRCQUE0QixFQUFFLFNBQVM7QUFBQSxJQUMzRDtBQUFBLEVBQ0o7OztBQ25PQSxNQUFNLGNBQWM7QUFBQSxJQUNoQixLQUFLO0FBQUEsSUFDTCxLQUFLO0FBQUEsSUFDTCxLQUFLO0FBQUEsSUFDTCxLQUFLO0FBQUEsSUFDTCxLQUFLO0FBQUEsSUFDTCxLQUFLO0FBQUEsRUFDVDtBQUNBLE1BQU0sZ0JBQWdCLENBQUMsT0FBTyxHQUFHLFFBQVEsY0FBYyxRQUFNLFlBQVksRUFBRSxDQUFDO0FBQzVFLE1BQU0sYUFBTixNQUFNLFlBQVc7QUFBQSxJQUNiLFlBQVksTUFBTSxNQUFNO0FBS3BCLFdBQUssV0FBVztBQUVoQixXQUFLLFNBQVM7QUFDZCxXQUFLLE9BQU8sT0FBTyxPQUFPLENBQUMsR0FBRyxZQUFXLGFBQWEsSUFBSTtBQUMxRCxXQUFLLE9BQU8sT0FBTyxPQUFPLENBQUMsR0FBRyxZQUFXLGFBQWEsSUFBSTtBQUFBLElBQzlEO0FBQUEsSUFDQSxRQUFRO0FBQ0osWUFBTSxPQUFPLElBQUksWUFBVyxLQUFLLE1BQU0sS0FBSyxJQUFJO0FBQ2hELFdBQUssV0FBVyxLQUFLO0FBQ3JCLGFBQU87QUFBQSxJQUNYO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLGFBQWE7QUFDVCxZQUFNLE1BQU0sSUFBSSxZQUFXLEtBQUssTUFBTSxLQUFLLElBQUk7QUFDL0MsY0FBUSxLQUFLLEtBQUssU0FBUztBQUFBLFFBQ3ZCLEtBQUs7QUFDRCxlQUFLLGlCQUFpQjtBQUN0QjtBQUFBLFFBQ0osS0FBSztBQUNELGVBQUssaUJBQWlCO0FBQ3RCLGVBQUssT0FBTztBQUFBLFlBQ1IsVUFBVSxZQUFXLFlBQVk7QUFBQSxZQUNqQyxTQUFTO0FBQUEsVUFDYjtBQUNBLGVBQUssT0FBTyxPQUFPLE9BQU8sQ0FBQyxHQUFHLFlBQVcsV0FBVztBQUNwRDtBQUFBLE1BQ1I7QUFDQSxhQUFPO0FBQUEsSUFDWDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLQSxJQUFJLE1BQU0sU0FBUztBQUNmLFVBQUksS0FBSyxnQkFBZ0I7QUFDckIsYUFBSyxPQUFPLEVBQUUsVUFBVSxZQUFXLFlBQVksVUFBVSxTQUFTLE1BQU07QUFDeEUsYUFBSyxPQUFPLE9BQU8sT0FBTyxDQUFDLEdBQUcsWUFBVyxXQUFXO0FBQ3BELGFBQUssaUJBQWlCO0FBQUEsTUFDMUI7QUFDQSxZQUFNLFFBQVEsS0FBSyxLQUFLLEVBQUUsTUFBTSxRQUFRO0FBQ3hDLFlBQU0sT0FBTyxNQUFNLE1BQU07QUFDekIsY0FBUSxNQUFNO0FBQUEsUUFDVixLQUFLLFFBQVE7QUFDVCxjQUFJLE1BQU0sV0FBVyxHQUFHO0FBQ3BCLG9CQUFRLEdBQUcsaURBQWlEO0FBQzVELGdCQUFJLE1BQU0sU0FBUztBQUNmLHFCQUFPO0FBQUEsVUFDZjtBQUNBLGdCQUFNLENBQUMsUUFBUSxNQUFNLElBQUk7QUFDekIsZUFBSyxLQUFLLE1BQU0sSUFBSTtBQUNwQixpQkFBTztBQUFBLFFBQ1g7QUFBQSxRQUNBLEtBQUssU0FBUztBQUNWLGVBQUssS0FBSyxXQUFXO0FBQ3JCLGNBQUksTUFBTSxXQUFXLEdBQUc7QUFDcEIsb0JBQVEsR0FBRyxpREFBaUQ7QUFDNUQsbUJBQU87QUFBQSxVQUNYO0FBQ0EsZ0JBQU0sQ0FBQyxPQUFPLElBQUk7QUFDbEIsY0FBSSxZQUFZLFNBQVMsWUFBWSxPQUFPO0FBQ3hDLGlCQUFLLEtBQUssVUFBVTtBQUNwQixtQkFBTztBQUFBLFVBQ1gsT0FDSztBQUNELGtCQUFNLFVBQVUsYUFBYSxLQUFLLE9BQU87QUFDekMsb0JBQVEsR0FBRyw0QkFBNEIsT0FBTyxJQUFJLE9BQU87QUFDekQsbUJBQU87QUFBQSxVQUNYO0FBQUEsUUFDSjtBQUFBLFFBQ0E7QUFDSSxrQkFBUSxHQUFHLHFCQUFxQixJQUFJLElBQUksSUFBSTtBQUM1QyxpQkFBTztBQUFBLE1BQ2Y7QUFBQSxJQUNKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFPQSxRQUFRLFFBQVEsU0FBUztBQUNyQixVQUFJLFdBQVc7QUFDWCxlQUFPO0FBQ1gsVUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLO0FBQ25CLGdCQUFRLG9CQUFvQixNQUFNLEVBQUU7QUFDcEMsZUFBTztBQUFBLE1BQ1g7QUFDQSxVQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUs7QUFDbkIsY0FBTSxXQUFXLE9BQU8sTUFBTSxHQUFHLEVBQUU7QUFDbkMsWUFBSSxhQUFhLE9BQU8sYUFBYSxNQUFNO0FBQ3ZDLGtCQUFRLHFDQUFxQyxNQUFNLGNBQWM7QUFDakUsaUJBQU87QUFBQSxRQUNYO0FBQ0EsWUFBSSxPQUFPLE9BQU8sU0FBUyxDQUFDLE1BQU07QUFDOUIsa0JBQVEsaUNBQWlDO0FBQzdDLGVBQU87QUFBQSxNQUNYO0FBQ0EsWUFBTSxDQUFDLEVBQUUsUUFBUSxNQUFNLElBQUksT0FBTyxNQUFNLGlCQUFpQjtBQUN6RCxVQUFJLENBQUM7QUFDRCxnQkFBUSxPQUFPLE1BQU0sb0JBQW9CO0FBQzdDLFlBQU0sU0FBUyxLQUFLLEtBQUssTUFBTTtBQUMvQixVQUFJLFFBQVE7QUFDUixZQUFJO0FBQ0EsaUJBQU8sU0FBUyxtQkFBbUIsTUFBTTtBQUFBLFFBQzdDLFNBQ08sT0FBTztBQUNWLGtCQUFRLE9BQU8sS0FBSyxDQUFDO0FBQ3JCLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0o7QUFDQSxVQUFJLFdBQVc7QUFDWCxlQUFPO0FBQ1gsY0FBUSwwQkFBMEIsTUFBTSxFQUFFO0FBQzFDLGFBQU87QUFBQSxJQUNYO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLFVBQVUsS0FBSztBQUNYLGlCQUFXLENBQUMsUUFBUSxNQUFNLEtBQUssT0FBTyxRQUFRLEtBQUssSUFBSSxHQUFHO0FBQ3RELFlBQUksSUFBSSxXQUFXLE1BQU07QUFDckIsaUJBQU8sU0FBUyxjQUFjLElBQUksVUFBVSxPQUFPLE1BQU0sQ0FBQztBQUFBLE1BQ2xFO0FBQ0EsYUFBTyxJQUFJLENBQUMsTUFBTSxNQUFNLE1BQU0sS0FBSyxHQUFHO0FBQUEsSUFDMUM7QUFBQSxJQUNBLFNBQVMsS0FBSztBQUNWLFlBQU0sUUFBUSxLQUFLLEtBQUssV0FDbEIsQ0FBQyxTQUFTLEtBQUssS0FBSyxXQUFXLEtBQUssRUFBRSxJQUN0QyxDQUFDO0FBQ1AsWUFBTSxhQUFhLE9BQU8sUUFBUSxLQUFLLElBQUk7QUFDM0MsVUFBSTtBQUNKLFVBQUksT0FBTyxXQUFXLFNBQVMsS0FBSyxPQUFPLElBQUksUUFBUSxHQUFHO0FBQ3RELGNBQU0sT0FBTyxDQUFDO0FBQ2QsY0FBTSxJQUFJLFVBQVUsQ0FBQyxNQUFNLFNBQVM7QUFDaEMsY0FBSSxPQUFPLElBQUksS0FBSyxLQUFLO0FBQ3JCLGlCQUFLLEtBQUssR0FBRyxJQUFJO0FBQUEsUUFDekIsQ0FBQztBQUNELG1CQUFXLE9BQU8sS0FBSyxJQUFJO0FBQUEsTUFDL0I7QUFFSSxtQkFBVyxDQUFDO0FBQ2hCLGlCQUFXLENBQUMsUUFBUSxNQUFNLEtBQUssWUFBWTtBQUN2QyxZQUFJLFdBQVcsUUFBUSxXQUFXO0FBQzlCO0FBQ0osWUFBSSxDQUFDLE9BQU8sU0FBUyxLQUFLLFFBQU0sR0FBRyxXQUFXLE1BQU0sQ0FBQztBQUNqRCxnQkFBTSxLQUFLLFFBQVEsTUFBTSxJQUFJLE1BQU0sRUFBRTtBQUFBLE1BQzdDO0FBQ0EsYUFBTyxNQUFNLEtBQUssSUFBSTtBQUFBLElBQzFCO0FBQUEsRUFDSjtBQUNBLGFBQVcsY0FBYyxFQUFFLFVBQVUsT0FBTyxTQUFTLE1BQU07QUFDM0QsYUFBVyxjQUFjLEVBQUUsTUFBTSxxQkFBcUI7OztBQ3JLdEQsV0FBUyxjQUFjLFFBQVE7QUFDM0IsUUFBSSxzQkFBc0IsS0FBSyxNQUFNLEdBQUc7QUFDcEMsWUFBTSxLQUFLLEtBQUssVUFBVSxNQUFNO0FBQ2hDLFlBQU0sTUFBTSw2REFBNkQsRUFBRTtBQUMzRSxZQUFNLElBQUksTUFBTSxHQUFHO0FBQUEsSUFDdkI7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUNBLFdBQVMsWUFBWSxNQUFNO0FBQ3ZCLFVBQU0sVUFBVSxvQkFBSSxJQUFJO0FBQ3hCLFVBQU0sTUFBTTtBQUFBLE1BQ1IsTUFBTSxNQUFNLE1BQU07QUFDZCxZQUFJLEtBQUs7QUFDTCxrQkFBUSxJQUFJLEtBQUssTUFBTTtBQUFBLE1BQy9CO0FBQUEsSUFDSixDQUFDO0FBQ0QsV0FBTztBQUFBLEVBQ1g7QUFFQSxXQUFTLGNBQWMsUUFBUSxTQUFTO0FBQ3BDLGFBQVMsSUFBSSxHQUFHLE1BQU0sRUFBRSxHQUFHO0FBQ3ZCLFlBQU0sT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDO0FBQzFCLFVBQUksQ0FBQyxRQUFRLElBQUksSUFBSTtBQUNqQixlQUFPO0FBQUEsSUFDZjtBQUFBLEVBQ0o7QUFDQSxXQUFTLGtCQUFrQixLQUFLLFFBQVE7QUFDcEMsVUFBTSxlQUFlLENBQUM7QUFDdEIsVUFBTSxnQkFBZ0Isb0JBQUksSUFBSTtBQUM5QixRQUFJLGNBQWM7QUFDbEIsV0FBTztBQUFBLE1BQ0gsVUFBVSxDQUFDLFdBQVc7QUFDbEIscUJBQWEsS0FBSyxNQUFNO0FBQ3hCLHdCQUFnQixjQUFjLFlBQVksR0FBRztBQUM3QyxjQUFNLFNBQVMsY0FBYyxRQUFRLFdBQVc7QUFDaEQsb0JBQVksSUFBSSxNQUFNO0FBQ3RCLGVBQU87QUFBQSxNQUNYO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BTUEsWUFBWSxNQUFNO0FBQ2QsbUJBQVcsVUFBVSxjQUFjO0FBQy9CLGdCQUFNLE1BQU0sY0FBYyxJQUFJLE1BQU07QUFDcEMsY0FBSSxPQUFPLFFBQVEsWUFDZixJQUFJLFdBQ0gsU0FBUyxJQUFJLElBQUksS0FBSyxhQUFhLElBQUksSUFBSSxJQUFJO0FBQ2hELGdCQUFJLEtBQUssU0FBUyxJQUFJO0FBQUEsVUFDMUIsT0FDSztBQUNELGtCQUFNLFFBQVEsSUFBSSxNQUFNLDREQUE0RDtBQUNwRixrQkFBTSxTQUFTO0FBQ2Ysa0JBQU07QUFBQSxVQUNWO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7OztBQzdEQSxXQUFTLGFBQWEsU0FBUyxLQUFLLEtBQUssS0FBSztBQUMxQyxRQUFJLE9BQU8sT0FBTyxRQUFRLFVBQVU7QUFDaEMsVUFBSSxNQUFNLFFBQVEsR0FBRyxHQUFHO0FBQ3BCLGlCQUFTLElBQUksR0FBRyxNQUFNLElBQUksUUFBUSxJQUFJLEtBQUssRUFBRSxHQUFHO0FBQzVDLGdCQUFNLEtBQUssSUFBSSxDQUFDO0FBQ2hCLGdCQUFNLEtBQUssYUFBYSxTQUFTLEtBQUssT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUVuRCxjQUFJLE9BQU87QUFDUCxtQkFBTyxJQUFJLENBQUM7QUFBQSxtQkFDUCxPQUFPO0FBQ1osZ0JBQUksQ0FBQyxJQUFJO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsZUFBZSxLQUFLO0FBQ3pCLG1CQUFXLEtBQUssTUFBTSxLQUFLLElBQUksS0FBSyxDQUFDLEdBQUc7QUFDcEMsZ0JBQU0sS0FBSyxJQUFJLElBQUksQ0FBQztBQUNwQixnQkFBTSxLQUFLLGFBQWEsU0FBUyxLQUFLLEdBQUcsRUFBRTtBQUMzQyxjQUFJLE9BQU87QUFDUCxnQkFBSSxPQUFPLENBQUM7QUFBQSxtQkFDUCxPQUFPO0FBQ1osZ0JBQUksSUFBSSxHQUFHLEVBQUU7QUFBQSxRQUNyQjtBQUFBLE1BQ0osV0FDUyxlQUFlLEtBQUs7QUFDekIsbUJBQVcsTUFBTSxNQUFNLEtBQUssR0FBRyxHQUFHO0FBQzlCLGdCQUFNLEtBQUssYUFBYSxTQUFTLEtBQUssSUFBSSxFQUFFO0FBQzVDLGNBQUksT0FBTztBQUNQLGdCQUFJLE9BQU8sRUFBRTtBQUFBLG1CQUNSLE9BQU8sSUFBSTtBQUNoQixnQkFBSSxPQUFPLEVBQUU7QUFDYixnQkFBSSxJQUFJLEVBQUU7QUFBQSxVQUNkO0FBQUEsUUFDSjtBQUFBLE1BQ0osT0FDSztBQUNELG1CQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssT0FBTyxRQUFRLEdBQUcsR0FBRztBQUN2QyxnQkFBTSxLQUFLLGFBQWEsU0FBUyxLQUFLLEdBQUcsRUFBRTtBQUMzQyxjQUFJLE9BQU87QUFDUCxtQkFBTyxJQUFJLENBQUM7QUFBQSxtQkFDUCxPQUFPO0FBQ1osZ0JBQUksQ0FBQyxJQUFJO0FBQUEsUUFDakI7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUNBLFdBQU8sUUFBUSxLQUFLLEtBQUssS0FBSyxHQUFHO0FBQUEsRUFDckM7OztBQ3hDQSxXQUFTLEtBQUssT0FBTyxLQUFLLEtBQUs7QUFFM0IsUUFBSSxNQUFNLFFBQVEsS0FBSztBQUNuQixhQUFPLE1BQU0sSUFBSSxDQUFDLEdBQUcsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3RELFFBQUksU0FBUyxPQUFPLE1BQU0sV0FBVyxZQUFZO0FBRTdDLFVBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxLQUFLO0FBQ3hCLGVBQU8sTUFBTSxPQUFPLEtBQUssR0FBRztBQUNoQyxZQUFNLE9BQU8sRUFBRSxZQUFZLEdBQUcsT0FBTyxHQUFHLEtBQUssT0FBVTtBQUN2RCxVQUFJLFFBQVEsSUFBSSxPQUFPLElBQUk7QUFDM0IsVUFBSSxXQUFXLENBQUFDLFNBQU87QUFDbEIsYUFBSyxNQUFNQTtBQUNYLGVBQU8sSUFBSTtBQUFBLE1BQ2Y7QUFDQSxZQUFNLE1BQU0sTUFBTSxPQUFPLEtBQUssR0FBRztBQUNqQyxVQUFJLElBQUk7QUFDSixZQUFJLFNBQVMsR0FBRztBQUNwQixhQUFPO0FBQUEsSUFDWDtBQUNBLFFBQUksT0FBTyxVQUFVLFlBQVksQ0FBQyxLQUFLO0FBQ25DLGFBQU8sT0FBTyxLQUFLO0FBQ3ZCLFdBQU87QUFBQSxFQUNYOzs7QUM5QkEsTUFBTSxXQUFOLE1BQWU7QUFBQSxJQUNYLFlBQVksTUFBTTtBQUNkLGFBQU8sZUFBZSxNQUFNLFdBQVcsRUFBRSxPQUFPLEtBQUssQ0FBQztBQUFBLElBQzFEO0FBQUE7QUFBQSxJQUVBLFFBQVE7QUFDSixZQUFNLE9BQU8sT0FBTyxPQUFPLE9BQU8sZUFBZSxJQUFJLEdBQUcsT0FBTywwQkFBMEIsSUFBSSxDQUFDO0FBQzlGLFVBQUksS0FBSztBQUNMLGFBQUssUUFBUSxLQUFLLE1BQU0sTUFBTTtBQUNsQyxhQUFPO0FBQUEsSUFDWDtBQUFBO0FBQUEsSUFFQSxLQUFLLEtBQUssRUFBRSxVQUFVLGVBQWUsVUFBVSxRQUFRLElBQUksQ0FBQyxHQUFHO0FBQzNELFVBQUksQ0FBQyxXQUFXLEdBQUc7QUFDZixjQUFNLElBQUksVUFBVSxpQ0FBaUM7QUFDekQsWUFBTSxNQUFNO0FBQUEsUUFDUixTQUFTLG9CQUFJLElBQUk7QUFBQSxRQUNqQjtBQUFBLFFBQ0EsTUFBTTtBQUFBLFFBQ04sVUFBVSxhQUFhO0FBQUEsUUFDdkIsY0FBYztBQUFBLFFBQ2QsZUFBZSxPQUFPLGtCQUFrQixXQUFXLGdCQUFnQjtBQUFBLE1BQ3ZFO0FBQ0EsWUFBTSxNQUFNLEtBQUssTUFBTSxJQUFJLEdBQUc7QUFDOUIsVUFBSSxPQUFPLGFBQWE7QUFDcEIsbUJBQVcsRUFBRSxPQUFPLEtBQUFDLEtBQUksS0FBSyxJQUFJLFFBQVEsT0FBTztBQUM1QyxtQkFBU0EsTUFBSyxLQUFLO0FBQzNCLGFBQU8sT0FBTyxZQUFZLGFBQ3BCLGFBQWEsU0FBUyxFQUFFLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUMxQztBQUFBLElBQ1Y7QUFBQSxFQUNKOzs7QUM3QkEsTUFBTSxRQUFOLGNBQW9CLFNBQVM7QUFBQSxJQUN6QixZQUFZLFFBQVE7QUFDaEIsWUFBTSxLQUFLO0FBQ1gsV0FBSyxTQUFTO0FBQ2QsYUFBTyxlQUFlLE1BQU0sT0FBTztBQUFBLFFBQy9CLE1BQU07QUFDRixnQkFBTSxJQUFJLE1BQU0sOEJBQThCO0FBQUEsUUFDbEQ7QUFBQSxNQUNKLENBQUM7QUFBQSxJQUNMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLFFBQVEsS0FBSyxLQUFLO0FBQ2QsVUFBSSxLQUFLLGtCQUFrQjtBQUN2QixjQUFNLElBQUksZUFBZSw4QkFBOEI7QUFDM0QsVUFBSTtBQUNKLFVBQUksS0FBSyxtQkFBbUI7QUFDeEIsZ0JBQVEsSUFBSTtBQUFBLE1BQ2hCLE9BQ0s7QUFDRCxnQkFBUSxDQUFDO0FBQ1QsY0FBTSxLQUFLO0FBQUEsVUFDUCxNQUFNLENBQUMsTUFBTSxTQUFTO0FBQ2xCLGdCQUFJLFFBQVEsSUFBSSxLQUFLLFVBQVUsSUFBSTtBQUMvQixvQkFBTSxLQUFLLElBQUk7QUFBQSxVQUN2QjtBQUFBLFFBQ0osQ0FBQztBQUNELFlBQUk7QUFDQSxjQUFJLG9CQUFvQjtBQUFBLE1BQ2hDO0FBQ0EsVUFBSSxRQUFRO0FBQ1osaUJBQVcsUUFBUSxPQUFPO0FBQ3RCLFlBQUksU0FBUztBQUNUO0FBQ0osWUFBSSxLQUFLLFdBQVcsS0FBSztBQUNyQixrQkFBUTtBQUFBLE1BQ2hCO0FBQ0EsYUFBTztBQUFBLElBQ1g7QUFBQSxJQUNBLE9BQU8sTUFBTSxLQUFLO0FBQ2QsVUFBSSxDQUFDO0FBQ0QsZUFBTyxFQUFFLFFBQVEsS0FBSyxPQUFPO0FBQ2pDLFlBQU0sRUFBRSxTQUFTLEtBQUssY0FBYyxJQUFJO0FBQ3hDLFlBQU0sU0FBUyxLQUFLLFFBQVEsS0FBSyxHQUFHO0FBQ3BDLFVBQUksQ0FBQyxRQUFRO0FBQ1QsY0FBTSxNQUFNLCtEQUErRCxLQUFLLE1BQU07QUFDdEYsY0FBTSxJQUFJLGVBQWUsR0FBRztBQUFBLE1BQ2hDO0FBQ0EsVUFBSSxPQUFPLFFBQVEsSUFBSSxNQUFNO0FBQzdCLFVBQUksQ0FBQyxNQUFNO0FBRVAsYUFBSyxRQUFRLE1BQU0sR0FBRztBQUN0QixlQUFPLFFBQVEsSUFBSSxNQUFNO0FBQUEsTUFDN0I7QUFFQSxVQUFJLE1BQU0sUUFBUSxRQUFXO0FBQ3pCLGNBQU0sTUFBTTtBQUNaLGNBQU0sSUFBSSxlQUFlLEdBQUc7QUFBQSxNQUNoQztBQUNBLFVBQUksaUJBQWlCLEdBQUc7QUFDcEIsYUFBSyxTQUFTO0FBQ2QsWUFBSSxLQUFLLGVBQWU7QUFDcEIsZUFBSyxhQUFhLGNBQWMsS0FBSyxRQUFRLE9BQU87QUFDeEQsWUFBSSxLQUFLLFFBQVEsS0FBSyxhQUFhLGVBQWU7QUFDOUMsZ0JBQU0sTUFBTTtBQUNaLGdCQUFNLElBQUksZUFBZSxHQUFHO0FBQUEsUUFDaEM7QUFBQSxNQUNKO0FBQ0EsYUFBTyxLQUFLO0FBQUEsSUFDaEI7QUFBQSxJQUNBLFNBQVMsS0FBSyxZQUFZLGNBQWM7QUFDcEMsWUFBTSxNQUFNLElBQUksS0FBSyxNQUFNO0FBQzNCLFVBQUksS0FBSztBQUNMLHNCQUFjLEtBQUssTUFBTTtBQUN6QixZQUFJLElBQUksUUFBUSxvQkFBb0IsQ0FBQyxJQUFJLFFBQVEsSUFBSSxLQUFLLE1BQU0sR0FBRztBQUMvRCxnQkFBTSxNQUFNLCtEQUErRCxLQUFLLE1BQU07QUFDdEYsZ0JBQU0sSUFBSSxNQUFNLEdBQUc7QUFBQSxRQUN2QjtBQUNBLFlBQUksSUFBSTtBQUNKLGlCQUFPLEdBQUcsR0FBRztBQUFBLE1BQ3JCO0FBQ0EsYUFBTztBQUFBLElBQ1g7QUFBQSxFQUNKO0FBQ0EsV0FBUyxjQUFjLEtBQUssTUFBTSxTQUFTO0FBQ3ZDLFFBQUksUUFBUSxJQUFJLEdBQUc7QUFDZixZQUFNLFNBQVMsS0FBSyxRQUFRLEdBQUc7QUFDL0IsWUFBTSxTQUFTLFdBQVcsVUFBVSxRQUFRLElBQUksTUFBTTtBQUN0RCxhQUFPLFNBQVMsT0FBTyxRQUFRLE9BQU8sYUFBYTtBQUFBLElBQ3ZELFdBQ1MsYUFBYSxJQUFJLEdBQUc7QUFDekIsVUFBSSxRQUFRO0FBQ1osaUJBQVcsUUFBUSxLQUFLLE9BQU87QUFDM0IsY0FBTSxJQUFJLGNBQWMsS0FBSyxNQUFNLE9BQU87QUFDMUMsWUFBSSxJQUFJO0FBQ0osa0JBQVE7QUFBQSxNQUNoQjtBQUNBLGFBQU87QUFBQSxJQUNYLFdBQ1MsT0FBTyxJQUFJLEdBQUc7QUFDbkIsWUFBTSxLQUFLLGNBQWMsS0FBSyxLQUFLLEtBQUssT0FBTztBQUMvQyxZQUFNLEtBQUssY0FBYyxLQUFLLEtBQUssT0FBTyxPQUFPO0FBQ2pELGFBQU8sS0FBSyxJQUFJLElBQUksRUFBRTtBQUFBLElBQzFCO0FBQ0EsV0FBTztBQUFBLEVBQ1g7OztBQzdHQSxNQUFNLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxTQUFVLE9BQU8sVUFBVSxjQUFjLE9BQU8sVUFBVTtBQUM1RixNQUFNLFNBQU4sY0FBcUIsU0FBUztBQUFBLElBQzFCLFlBQVksT0FBTztBQUNmLFlBQU0sTUFBTTtBQUNaLFdBQUssUUFBUTtBQUFBLElBQ2pCO0FBQUEsSUFDQSxPQUFPLEtBQUssS0FBSztBQUNiLGFBQU8sS0FBSyxPQUFPLEtBQUssUUFBUSxLQUFLLEtBQUssT0FBTyxLQUFLLEdBQUc7QUFBQSxJQUM3RDtBQUFBLElBQ0EsV0FBVztBQUNQLGFBQU8sT0FBTyxLQUFLLEtBQUs7QUFBQSxJQUM1QjtBQUFBLEVBQ0o7QUFDQSxTQUFPLGVBQWU7QUFDdEIsU0FBTyxnQkFBZ0I7QUFDdkIsU0FBTyxRQUFRO0FBQ2YsU0FBTyxlQUFlO0FBQ3RCLFNBQU8sZUFBZTs7O0FDakJ0QixNQUFNLG1CQUFtQjtBQUN6QixXQUFTLGNBQWMsT0FBTyxTQUFTLE1BQU07QUFDekMsUUFBSSxTQUFTO0FBQ1QsWUFBTSxRQUFRLEtBQUssT0FBTyxPQUFLLEVBQUUsUUFBUSxPQUFPO0FBQ2hELFlBQU0sU0FBUyxNQUFNLEtBQUssT0FBSyxDQUFDLEVBQUUsTUFBTSxLQUFLLE1BQU0sQ0FBQztBQUNwRCxVQUFJLENBQUM7QUFDRCxjQUFNLElBQUksTUFBTSxPQUFPLE9BQU8sWUFBWTtBQUM5QyxhQUFPO0FBQUEsSUFDWDtBQUNBLFdBQU8sS0FBSyxLQUFLLE9BQUssRUFBRSxXQUFXLEtBQUssS0FBSyxDQUFDLEVBQUUsTUFBTTtBQUFBLEVBQzFEO0FBQ0EsV0FBUyxXQUFXLE9BQU8sU0FBUyxLQUFLO0FBQ3JDLFFBQUksV0FBVyxLQUFLO0FBQ2hCLGNBQVEsTUFBTTtBQUNsQixRQUFJLE9BQU8sS0FBSztBQUNaLGFBQU87QUFDWCxRQUFJLE9BQU8sS0FBSyxHQUFHO0FBQ2YsWUFBTUMsT0FBTSxJQUFJLE9BQU8sR0FBRyxFQUFFLGFBQWEsSUFBSSxRQUFRLE1BQU0sR0FBRztBQUM5RCxNQUFBQSxLQUFJLE1BQU0sS0FBSyxLQUFLO0FBQ3BCLGFBQU9BO0FBQUEsSUFDWDtBQUNBLFFBQUksaUJBQWlCLFVBQ2pCLGlCQUFpQixVQUNqQixpQkFBaUIsV0FDaEIsT0FBTyxXQUFXLGVBQWUsaUJBQWlCLFFBQ3JEO0FBRUUsY0FBUSxNQUFNLFFBQVE7QUFBQSxJQUMxQjtBQUNBLFVBQU0sRUFBRSx1QkFBdUIsVUFBVSxVQUFVLFFBQUFDLFNBQVEsY0FBYyxJQUFJO0FBRzdFLFFBQUksTUFBTTtBQUNWLFFBQUkseUJBQXlCLFNBQVMsT0FBTyxVQUFVLFVBQVU7QUFDN0QsWUFBTSxjQUFjLElBQUksS0FBSztBQUM3QixVQUFJLEtBQUs7QUFDTCxZQUFJLFdBQVcsSUFBSSxTQUFTLFNBQVMsS0FBSztBQUMxQyxlQUFPLElBQUksTUFBTSxJQUFJLE1BQU07QUFBQSxNQUMvQixPQUNLO0FBQ0QsY0FBTSxFQUFFLFFBQVEsTUFBTSxNQUFNLEtBQUs7QUFDakMsc0JBQWMsSUFBSSxPQUFPLEdBQUc7QUFBQSxNQUNoQztBQUFBLElBQ0o7QUFDQSxRQUFJLFNBQVMsV0FBVyxJQUFJO0FBQ3hCLGdCQUFVLG1CQUFtQixRQUFRLE1BQU0sQ0FBQztBQUNoRCxRQUFJLFNBQVMsY0FBYyxPQUFPLFNBQVNBLFFBQU8sSUFBSTtBQUN0RCxRQUFJLENBQUMsUUFBUTtBQUNULFVBQUksU0FBUyxPQUFPLE1BQU0sV0FBVyxZQUFZO0FBRTdDLGdCQUFRLE1BQU0sT0FBTztBQUFBLE1BQ3pCO0FBQ0EsVUFBSSxDQUFDLFNBQVMsT0FBTyxVQUFVLFVBQVU7QUFDckMsY0FBTUMsUUFBTyxJQUFJLE9BQU8sS0FBSztBQUM3QixZQUFJO0FBQ0EsY0FBSSxPQUFPQTtBQUNmLGVBQU9BO0FBQUEsTUFDWDtBQUNBLGVBQ0ksaUJBQWlCLE1BQ1hELFFBQU8sR0FBRyxJQUNWLE9BQU8sWUFBWSxPQUFPLEtBQUssSUFDM0JBLFFBQU8sR0FBRyxJQUNWQSxRQUFPLEdBQUc7QUFBQSxJQUM1QjtBQUNBLFFBQUksVUFBVTtBQUNWLGVBQVMsTUFBTTtBQUNmLGFBQU8sSUFBSTtBQUFBLElBQ2Y7QUFDQSxVQUFNLE9BQU8sUUFBUSxhQUNmLE9BQU8sV0FBVyxJQUFJLFFBQVEsT0FBTyxHQUFHLElBQ3hDLE9BQU8sUUFBUSxXQUFXLFNBQVMsYUFDL0IsT0FBTyxVQUFVLEtBQUssSUFBSSxRQUFRLE9BQU8sR0FBRyxJQUM1QyxJQUFJLE9BQU8sS0FBSztBQUMxQixRQUFJO0FBQ0EsV0FBSyxNQUFNO0FBQUEsYUFDTixDQUFDLE9BQU87QUFDYixXQUFLLE1BQU0sT0FBTztBQUN0QixRQUFJO0FBQ0EsVUFBSSxPQUFPO0FBQ2YsV0FBTztBQUFBLEVBQ1g7OztBQ2pGQSxXQUFTLG1CQUFtQkUsU0FBUSxNQUFNLE9BQU87QUFDN0MsUUFBSSxJQUFJO0FBQ1IsYUFBUyxJQUFJLEtBQUssU0FBUyxHQUFHLEtBQUssR0FBRyxFQUFFLEdBQUc7QUFDdkMsWUFBTSxJQUFJLEtBQUssQ0FBQztBQUNoQixVQUFJLE9BQU8sTUFBTSxZQUFZLE9BQU8sVUFBVSxDQUFDLEtBQUssS0FBSyxHQUFHO0FBQ3hELGNBQU0sSUFBSSxDQUFDO0FBQ1gsVUFBRSxDQUFDLElBQUk7QUFDUCxZQUFJO0FBQUEsTUFDUixPQUNLO0FBQ0QsWUFBSSxvQkFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQUEsTUFDeEI7QUFBQSxJQUNKO0FBQ0EsV0FBTyxXQUFXLEdBQUcsUUFBVztBQUFBLE1BQzVCLHVCQUF1QjtBQUFBLE1BQ3ZCLGVBQWU7QUFBQSxNQUNmLFVBQVUsTUFBTTtBQUNaLGNBQU0sSUFBSSxNQUFNLDhDQUE4QztBQUFBLE1BQ2xFO0FBQUEsTUFDQSxRQUFBQTtBQUFBLE1BQ0EsZUFBZSxvQkFBSSxJQUFJO0FBQUEsSUFDM0IsQ0FBQztBQUFBLEVBQ0w7QUFHQSxNQUFNLGNBQWMsQ0FBQyxTQUFTLFFBQVEsUUFDakMsT0FBTyxTQUFTLFlBQVksQ0FBQyxDQUFDLEtBQUssT0FBTyxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUU7QUFDbEUsTUFBTSxhQUFOLGNBQXlCLFNBQVM7QUFBQSxJQUM5QixZQUFZLE1BQU1BLFNBQVE7QUFDdEIsWUFBTSxJQUFJO0FBQ1YsYUFBTyxlQUFlLE1BQU0sVUFBVTtBQUFBLFFBQ2xDLE9BQU9BO0FBQUEsUUFDUCxjQUFjO0FBQUEsUUFDZCxZQUFZO0FBQUEsUUFDWixVQUFVO0FBQUEsTUFDZCxDQUFDO0FBQUEsSUFDTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQU1BLE1BQU1BLFNBQVE7QUFDVixZQUFNLE9BQU8sT0FBTyxPQUFPLE9BQU8sZUFBZSxJQUFJLEdBQUcsT0FBTywwQkFBMEIsSUFBSSxDQUFDO0FBQzlGLFVBQUlBO0FBQ0EsYUFBSyxTQUFTQTtBQUNsQixXQUFLLFFBQVEsS0FBSyxNQUFNLElBQUksQ0FBQUMsUUFBTSxPQUFPQSxHQUFFLEtBQUssT0FBT0EsR0FBRSxJQUFJQSxJQUFHLE1BQU1ELE9BQU0sSUFBSUMsR0FBRTtBQUNsRixVQUFJLEtBQUs7QUFDTCxhQUFLLFFBQVEsS0FBSyxNQUFNLE1BQU07QUFDbEMsYUFBTztBQUFBLElBQ1g7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFNQSxNQUFNLE1BQU0sT0FBTztBQUNmLFVBQUksWUFBWSxJQUFJO0FBQ2hCLGFBQUssSUFBSSxLQUFLO0FBQUEsV0FDYjtBQUNELGNBQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJO0FBQ3ZCLGNBQU0sT0FBTyxLQUFLLElBQUksS0FBSyxJQUFJO0FBQy9CLFlBQUksYUFBYSxJQUFJO0FBQ2pCLGVBQUssTUFBTSxNQUFNLEtBQUs7QUFBQSxpQkFDakIsU0FBUyxVQUFhLEtBQUs7QUFDaEMsZUFBSyxJQUFJLEtBQUssbUJBQW1CLEtBQUssUUFBUSxNQUFNLEtBQUssQ0FBQztBQUFBO0FBRTFELGdCQUFNLElBQUksTUFBTSwrQkFBK0IsR0FBRyxxQkFBcUIsSUFBSSxFQUFFO0FBQUEsTUFDckY7QUFBQSxJQUNKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLFNBQVMsTUFBTTtBQUNYLFlBQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJO0FBQ3ZCLFVBQUksS0FBSyxXQUFXO0FBQ2hCLGVBQU8sS0FBSyxPQUFPLEdBQUc7QUFDMUIsWUFBTSxPQUFPLEtBQUssSUFBSSxLQUFLLElBQUk7QUFDL0IsVUFBSSxhQUFhLElBQUk7QUFDakIsZUFBTyxLQUFLLFNBQVMsSUFBSTtBQUFBO0FBRXpCLGNBQU0sSUFBSSxNQUFNLCtCQUErQixHQUFHLHFCQUFxQixJQUFJLEVBQUU7QUFBQSxJQUNyRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQU1BLE1BQU0sTUFBTSxZQUFZO0FBQ3BCLFlBQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJO0FBQ3ZCLFlBQU0sT0FBTyxLQUFLLElBQUksS0FBSyxJQUFJO0FBQy9CLFVBQUksS0FBSyxXQUFXO0FBQ2hCLGVBQU8sQ0FBQyxjQUFjLFNBQVMsSUFBSSxJQUFJLEtBQUssUUFBUTtBQUFBO0FBRXBELGVBQU8sYUFBYSxJQUFJLElBQUksS0FBSyxNQUFNLE1BQU0sVUFBVSxJQUFJO0FBQUEsSUFDbkU7QUFBQSxJQUNBLGlCQUFpQixhQUFhO0FBQzFCLGFBQU8sS0FBSyxNQUFNLE1BQU0sVUFBUTtBQUM1QixZQUFJLENBQUMsT0FBTyxJQUFJO0FBQ1osaUJBQU87QUFDWCxjQUFNLElBQUksS0FBSztBQUNmLGVBQVEsS0FBSyxRQUNSLGVBQ0csU0FBUyxDQUFDLEtBQ1YsRUFBRSxTQUFTLFFBQ1gsQ0FBQyxFQUFFLGlCQUNILENBQUMsRUFBRSxXQUNILENBQUMsRUFBRTtBQUFBLE1BQ2YsQ0FBQztBQUFBLElBQ0w7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlBLE1BQU0sTUFBTTtBQUNSLFlBQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJO0FBQ3ZCLFVBQUksS0FBSyxXQUFXO0FBQ2hCLGVBQU8sS0FBSyxJQUFJLEdBQUc7QUFDdkIsWUFBTSxPQUFPLEtBQUssSUFBSSxLQUFLLElBQUk7QUFDL0IsYUFBTyxhQUFhLElBQUksSUFBSSxLQUFLLE1BQU0sSUFBSSxJQUFJO0FBQUEsSUFDbkQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0EsTUFBTSxNQUFNLE9BQU87QUFDZixZQUFNLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSTtBQUN2QixVQUFJLEtBQUssV0FBVyxHQUFHO0FBQ25CLGFBQUssSUFBSSxLQUFLLEtBQUs7QUFBQSxNQUN2QixPQUNLO0FBQ0QsY0FBTSxPQUFPLEtBQUssSUFBSSxLQUFLLElBQUk7QUFDL0IsWUFBSSxhQUFhLElBQUk7QUFDakIsZUFBSyxNQUFNLE1BQU0sS0FBSztBQUFBLGlCQUNqQixTQUFTLFVBQWEsS0FBSztBQUNoQyxlQUFLLElBQUksS0FBSyxtQkFBbUIsS0FBSyxRQUFRLE1BQU0sS0FBSyxDQUFDO0FBQUE7QUFFMUQsZ0JBQU0sSUFBSSxNQUFNLCtCQUErQixHQUFHLHFCQUFxQixJQUFJLEVBQUU7QUFBQSxNQUNyRjtBQUFBLElBQ0o7QUFBQSxFQUNKOzs7QUN6SUEsTUFBTSxtQkFBbUIsQ0FBQyxRQUFRLElBQUksUUFBUSxtQkFBbUIsR0FBRztBQUNwRSxXQUFTLGNBQWMsU0FBU0MsU0FBUTtBQUNwQyxRQUFJLFFBQVEsS0FBSyxPQUFPO0FBQ3BCLGFBQU8sUUFBUSxVQUFVLENBQUM7QUFDOUIsV0FBT0EsVUFBUyxRQUFRLFFBQVEsY0FBY0EsT0FBTSxJQUFJO0FBQUEsRUFDNUQ7QUFDQSxNQUFNLGNBQWMsQ0FBQyxLQUFLQSxTQUFRLFlBQVksSUFBSSxTQUFTLElBQUksSUFDekQsY0FBYyxTQUFTQSxPQUFNLElBQzdCLFFBQVEsU0FBUyxJQUFJLElBQ2pCLE9BQU8sY0FBYyxTQUFTQSxPQUFNLEtBQ25DLElBQUksU0FBUyxHQUFHLElBQUksS0FBSyxPQUFPOzs7QUNqQjNDLE1BQU0sWUFBWTtBQUNsQixNQUFNLGFBQWE7QUFDbkIsTUFBTSxjQUFjO0FBTXBCLFdBQVMsY0FBYyxNQUFNQyxTQUFRLE9BQU8sUUFBUSxFQUFFLGVBQWUsWUFBWSxJQUFJLGtCQUFrQixJQUFJLFFBQVEsV0FBVyxJQUFJLENBQUMsR0FBRztBQUNsSSxRQUFJLENBQUMsYUFBYSxZQUFZO0FBQzFCLGFBQU87QUFDWCxRQUFJLFlBQVk7QUFDWix3QkFBa0I7QUFDdEIsVUFBTSxVQUFVLEtBQUssSUFBSSxJQUFJLGlCQUFpQixJQUFJLFlBQVlBLFFBQU8sTUFBTTtBQUMzRSxRQUFJLEtBQUssVUFBVTtBQUNmLGFBQU87QUFDWCxVQUFNLFFBQVEsQ0FBQztBQUNmLFVBQU0sZUFBZSxDQUFDO0FBQ3RCLFFBQUksTUFBTSxZQUFZQSxRQUFPO0FBQzdCLFFBQUksT0FBTyxrQkFBa0IsVUFBVTtBQUNuQyxVQUFJLGdCQUFnQixZQUFZLEtBQUssSUFBSSxHQUFHLGVBQWU7QUFDdkQsY0FBTSxLQUFLLENBQUM7QUFBQTtBQUVaLGNBQU0sWUFBWTtBQUFBLElBQzFCO0FBQ0EsUUFBSSxRQUFRO0FBQ1osUUFBSSxPQUFPO0FBQ1gsUUFBSSxXQUFXO0FBQ2YsUUFBSSxJQUFJO0FBQ1IsUUFBSSxXQUFXO0FBQ2YsUUFBSSxTQUFTO0FBQ2IsUUFBSSxTQUFTLFlBQVk7QUFDckIsVUFBSSx5QkFBeUIsTUFBTSxHQUFHQSxRQUFPLE1BQU07QUFDbkQsVUFBSSxNQUFNO0FBQ04sY0FBTSxJQUFJO0FBQUEsSUFDbEI7QUFDQSxhQUFTLElBQUssS0FBSyxLQUFNLEtBQUssQ0FBRSxLQUFLO0FBQ2pDLFVBQUksU0FBUyxlQUFlLE9BQU8sTUFBTTtBQUNyQyxtQkFBVztBQUNYLGdCQUFRLEtBQUssSUFBSSxDQUFDLEdBQUc7QUFBQSxVQUNqQixLQUFLO0FBQ0QsaUJBQUs7QUFDTDtBQUFBLFVBQ0osS0FBSztBQUNELGlCQUFLO0FBQ0w7QUFBQSxVQUNKLEtBQUs7QUFDRCxpQkFBSztBQUNMO0FBQUEsVUFDSjtBQUNJLGlCQUFLO0FBQUEsUUFDYjtBQUNBLGlCQUFTO0FBQUEsTUFDYjtBQUNBLFVBQUksT0FBTyxNQUFNO0FBQ2IsWUFBSSxTQUFTO0FBQ1QsY0FBSSx5QkFBeUIsTUFBTSxHQUFHQSxRQUFPLE1BQU07QUFDdkQsY0FBTSxJQUFJQSxRQUFPLFNBQVM7QUFDMUIsZ0JBQVE7QUFBQSxNQUNaLE9BQ0s7QUFDRCxZQUFJLE9BQU8sT0FDUCxRQUNBLFNBQVMsT0FDVCxTQUFTLFFBQ1QsU0FBUyxLQUFNO0FBRWYsZ0JBQU0sT0FBTyxLQUFLLElBQUksQ0FBQztBQUN2QixjQUFJLFFBQVEsU0FBUyxPQUFPLFNBQVMsUUFBUSxTQUFTO0FBQ2xELG9CQUFRO0FBQUEsUUFDaEI7QUFDQSxZQUFJLEtBQUssS0FBSztBQUNWLGNBQUksT0FBTztBQUNQLGtCQUFNLEtBQUssS0FBSztBQUNoQixrQkFBTSxRQUFRO0FBQ2Qsb0JBQVE7QUFBQSxVQUNaLFdBQ1MsU0FBUyxhQUFhO0FBRTNCLG1CQUFPLFNBQVMsT0FBTyxTQUFTLEtBQU07QUFDbEMscUJBQU87QUFDUCxtQkFBSyxLQUFNLEtBQUssQ0FBRTtBQUNsQix5QkFBVztBQUFBLFlBQ2Y7QUFFQSxrQkFBTSxJQUFJLElBQUksU0FBUyxJQUFJLElBQUksSUFBSSxXQUFXO0FBRTlDLGdCQUFJLGFBQWEsQ0FBQztBQUNkLHFCQUFPO0FBQ1gsa0JBQU0sS0FBSyxDQUFDO0FBQ1oseUJBQWEsQ0FBQyxJQUFJO0FBQ2xCLGtCQUFNLElBQUk7QUFDVixvQkFBUTtBQUFBLFVBQ1osT0FDSztBQUNELHVCQUFXO0FBQUEsVUFDZjtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQ0EsYUFBTztBQUFBLElBQ1g7QUFDQSxRQUFJLFlBQVk7QUFDWixpQkFBVztBQUNmLFFBQUksTUFBTSxXQUFXO0FBQ2pCLGFBQU87QUFDWCxRQUFJO0FBQ0EsYUFBTztBQUNYLFFBQUksTUFBTSxLQUFLLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztBQUNoQyxhQUFTQyxLQUFJLEdBQUdBLEtBQUksTUFBTSxRQUFRLEVBQUVBLElBQUc7QUFDbkMsWUFBTSxPQUFPLE1BQU1BLEVBQUM7QUFDcEIsWUFBTUMsT0FBTSxNQUFNRCxLQUFJLENBQUMsS0FBSyxLQUFLO0FBQ2pDLFVBQUksU0FBUztBQUNULGNBQU07QUFBQSxFQUFLRCxPQUFNLEdBQUcsS0FBSyxNQUFNLEdBQUdFLElBQUcsQ0FBQztBQUFBLFdBQ3JDO0FBQ0QsWUFBSSxTQUFTLGVBQWUsYUFBYSxJQUFJO0FBQ3pDLGlCQUFPLEdBQUcsS0FBSyxJQUFJLENBQUM7QUFDeEIsZUFBTztBQUFBLEVBQUtGLE9BQU0sR0FBRyxLQUFLLE1BQU0sT0FBTyxHQUFHRSxJQUFHLENBQUM7QUFBQSxNQUNsRDtBQUFBLElBQ0o7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUtBLFdBQVMseUJBQXlCLE1BQU0sR0FBR0YsU0FBUTtBQUMvQyxRQUFJLE1BQU07QUFDVixRQUFJLFFBQVEsSUFBSTtBQUNoQixRQUFJLEtBQUssS0FBSyxLQUFLO0FBQ25CLFdBQU8sT0FBTyxPQUFPLE9BQU8sS0FBTTtBQUM5QixVQUFJLElBQUksUUFBUUEsU0FBUTtBQUNwQixhQUFLLEtBQUssRUFBRSxDQUFDO0FBQUEsTUFDakIsT0FDSztBQUNELFdBQUc7QUFDQyxlQUFLLEtBQUssRUFBRSxDQUFDO0FBQUEsUUFDakIsU0FBUyxNQUFNLE9BQU87QUFDdEIsY0FBTTtBQUNOLGdCQUFRLElBQUk7QUFDWixhQUFLLEtBQUssS0FBSztBQUFBLE1BQ25CO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxFQUNYOzs7QUM1SUEsTUFBTSxpQkFBaUIsQ0FBQyxLQUFLRyxjQUFhO0FBQUEsSUFDdEMsZUFBZUEsV0FBVSxJQUFJLE9BQU8sU0FBUyxJQUFJO0FBQUEsSUFDakQsV0FBVyxJQUFJLFFBQVE7QUFBQSxJQUN2QixpQkFBaUIsSUFBSSxRQUFRO0FBQUEsRUFDakM7QUFHQSxNQUFNLHlCQUF5QixDQUFDLFFBQVEsbUJBQW1CLEtBQUssR0FBRztBQUNuRSxXQUFTLG9CQUFvQixLQUFLLFdBQVcsY0FBYztBQUN2RCxRQUFJLENBQUMsYUFBYSxZQUFZO0FBQzFCLGFBQU87QUFDWCxVQUFNLFFBQVEsWUFBWTtBQUMxQixVQUFNLFNBQVMsSUFBSTtBQUNuQixRQUFJLFVBQVU7QUFDVixhQUFPO0FBQ1gsYUFBUyxJQUFJLEdBQUcsUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFLEdBQUc7QUFDeEMsVUFBSSxJQUFJLENBQUMsTUFBTSxNQUFNO0FBQ2pCLFlBQUksSUFBSSxRQUFRO0FBQ1osaUJBQU87QUFDWCxnQkFBUSxJQUFJO0FBQ1osWUFBSSxTQUFTLFNBQVM7QUFDbEIsaUJBQU87QUFBQSxNQUNmO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBQ0EsV0FBUyxtQkFBbUIsT0FBTyxLQUFLO0FBQ3BDLFVBQU0sT0FBTyxLQUFLLFVBQVUsS0FBSztBQUNqQyxRQUFJLElBQUksUUFBUTtBQUNaLGFBQU87QUFDWCxVQUFNLEVBQUUsWUFBWSxJQUFJO0FBQ3hCLFVBQU0scUJBQXFCLElBQUksUUFBUTtBQUN2QyxVQUFNQyxVQUFTLElBQUksV0FBVyx1QkFBdUIsS0FBSyxJQUFJLE9BQU87QUFDckUsUUFBSSxNQUFNO0FBQ1YsUUFBSSxRQUFRO0FBQ1osYUFBUyxJQUFJLEdBQUcsS0FBSyxLQUFLLENBQUMsR0FBRyxJQUFJLEtBQUssS0FBSyxFQUFFLENBQUMsR0FBRztBQUM5QyxVQUFJLE9BQU8sT0FBTyxLQUFLLElBQUksQ0FBQyxNQUFNLFFBQVEsS0FBSyxJQUFJLENBQUMsTUFBTSxLQUFLO0FBRTNELGVBQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQyxJQUFJO0FBQzlCLGFBQUs7QUFDTCxnQkFBUTtBQUNSLGFBQUs7QUFBQSxNQUNUO0FBQ0EsVUFBSSxPQUFPO0FBQ1AsZ0JBQVEsS0FBSyxJQUFJLENBQUMsR0FBRztBQUFBLFVBQ2pCLEtBQUs7QUFDRDtBQUNJLHFCQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDMUIsb0JBQU0sT0FBTyxLQUFLLE9BQU8sSUFBSSxHQUFHLENBQUM7QUFDakMsc0JBQVEsTUFBTTtBQUFBLGdCQUNWLEtBQUs7QUFDRCx5QkFBTztBQUNQO0FBQUEsZ0JBQ0osS0FBSztBQUNELHlCQUFPO0FBQ1A7QUFBQSxnQkFDSixLQUFLO0FBQ0QseUJBQU87QUFDUDtBQUFBLGdCQUNKLEtBQUs7QUFDRCx5QkFBTztBQUNQO0FBQUEsZ0JBQ0osS0FBSztBQUNELHlCQUFPO0FBQ1A7QUFBQSxnQkFDSixLQUFLO0FBQ0QseUJBQU87QUFDUDtBQUFBLGdCQUNKLEtBQUs7QUFDRCx5QkFBTztBQUNQO0FBQUEsZ0JBQ0osS0FBSztBQUNELHlCQUFPO0FBQ1A7QUFBQSxnQkFDSjtBQUNJLHNCQUFJLEtBQUssT0FBTyxHQUFHLENBQUMsTUFBTTtBQUN0QiwyQkFBTyxRQUFRLEtBQUssT0FBTyxDQUFDO0FBQUE7QUFFNUIsMkJBQU8sS0FBSyxPQUFPLEdBQUcsQ0FBQztBQUFBLGNBQ25DO0FBQ0EsbUJBQUs7QUFDTCxzQkFBUSxJQUFJO0FBQUEsWUFDaEI7QUFDQTtBQUFBLFVBQ0osS0FBSztBQUNELGdCQUFJLGVBQ0EsS0FBSyxJQUFJLENBQUMsTUFBTSxPQUNoQixLQUFLLFNBQVMsb0JBQW9CO0FBQ2xDLG1CQUFLO0FBQUEsWUFDVCxPQUNLO0FBRUQscUJBQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQyxJQUFJO0FBQzlCLHFCQUFPLEtBQUssSUFBSSxDQUFDLE1BQU0sUUFDbkIsS0FBSyxJQUFJLENBQUMsTUFBTSxPQUNoQixLQUFLLElBQUksQ0FBQyxNQUFNLEtBQUs7QUFDckIsdUJBQU87QUFDUCxxQkFBSztBQUFBLGNBQ1Q7QUFDQSxxQkFBT0E7QUFFUCxrQkFBSSxLQUFLLElBQUksQ0FBQyxNQUFNO0FBQ2hCLHVCQUFPO0FBQ1gsbUJBQUs7QUFDTCxzQkFBUSxJQUFJO0FBQUEsWUFDaEI7QUFDQTtBQUFBLFVBQ0o7QUFDSSxpQkFBSztBQUFBLFFBQ2I7QUFBQSxJQUNSO0FBQ0EsVUFBTSxRQUFRLE1BQU0sS0FBSyxNQUFNLEtBQUssSUFBSTtBQUN4QyxXQUFPLGNBQ0QsTUFDQSxjQUFjLEtBQUtBLFNBQVEsYUFBYSxlQUFlLEtBQUssS0FBSyxDQUFDO0FBQUEsRUFDNUU7QUFDQSxXQUFTLG1CQUFtQixPQUFPLEtBQUs7QUFDcEMsUUFBSSxJQUFJLFFBQVEsZ0JBQWdCLFNBQzNCLElBQUksZUFBZSxNQUFNLFNBQVMsSUFBSSxLQUN2QyxrQkFBa0IsS0FBSyxLQUFLO0FBRTVCLGFBQU8sbUJBQW1CLE9BQU8sR0FBRztBQUN4QyxVQUFNQSxVQUFTLElBQUksV0FBVyx1QkFBdUIsS0FBSyxJQUFJLE9BQU87QUFDckUsVUFBTSxNQUFNLE1BQU0sTUFBTSxRQUFRLE1BQU0sSUFBSSxFQUFFLFFBQVEsUUFBUTtBQUFBLEVBQU9BLE9BQU0sRUFBRSxJQUFJO0FBQy9FLFdBQU8sSUFBSSxjQUNMLE1BQ0EsY0FBYyxLQUFLQSxTQUFRLFdBQVcsZUFBZSxLQUFLLEtBQUssQ0FBQztBQUFBLEVBQzFFO0FBQ0EsV0FBUyxhQUFhLE9BQU8sS0FBSztBQUM5QixVQUFNLEVBQUUsWUFBWSxJQUFJLElBQUk7QUFDNUIsUUFBSTtBQUNKLFFBQUksZ0JBQWdCO0FBQ2hCLFdBQUs7QUFBQSxTQUNKO0FBQ0QsWUFBTSxZQUFZLE1BQU0sU0FBUyxHQUFHO0FBQ3BDLFlBQU0sWUFBWSxNQUFNLFNBQVMsR0FBRztBQUNwQyxVQUFJLGFBQWEsQ0FBQztBQUNkLGFBQUs7QUFBQSxlQUNBLGFBQWEsQ0FBQztBQUNuQixhQUFLO0FBQUE7QUFFTCxhQUFLLGNBQWMscUJBQXFCO0FBQUEsSUFDaEQ7QUFDQSxXQUFPLEdBQUcsT0FBTyxHQUFHO0FBQUEsRUFDeEI7QUFHQSxNQUFJO0FBQ0osTUFBSTtBQUNBLHVCQUFtQixJQUFJLE9BQU8sMEJBQTBCLEdBQUc7QUFBQSxFQUMvRCxRQUNNO0FBQ0YsdUJBQW1CO0FBQUEsRUFDdkI7QUFDQSxXQUFTLFlBQVksRUFBRSxTQUFTLE1BQU0sTUFBTSxHQUFHLEtBQUssV0FBVyxhQUFhO0FBQ3hFLFVBQU0sRUFBRSxZQUFZLGVBQWUsVUFBVSxJQUFJLElBQUk7QUFHckQsUUFBSSxDQUFDLGNBQWMsWUFBWSxLQUFLLEtBQUssR0FBRztBQUN4QyxhQUFPLGFBQWEsT0FBTyxHQUFHO0FBQUEsSUFDbEM7QUFDQSxVQUFNQSxVQUFTLElBQUksV0FDZCxJQUFJLG9CQUFvQix1QkFBdUIsS0FBSyxJQUFJLE9BQU87QUFDcEUsVUFBTSxVQUFVLGVBQWUsWUFDekIsT0FDQSxlQUFlLFlBQVksU0FBUyxPQUFPLGVBQ3ZDLFFBQ0EsU0FBUyxPQUFPLGdCQUNaLE9BQ0EsQ0FBQyxvQkFBb0IsT0FBTyxXQUFXQSxRQUFPLE1BQU07QUFDbEUsUUFBSSxDQUFDO0FBQ0QsYUFBTyxVQUFVLFFBQVE7QUFFN0IsUUFBSTtBQUNKLFFBQUk7QUFDSixTQUFLLFdBQVcsTUFBTSxRQUFRLFdBQVcsR0FBRyxFQUFFLFVBQVU7QUFDcEQsWUFBTSxLQUFLLE1BQU0sV0FBVyxDQUFDO0FBQzdCLFVBQUksT0FBTyxRQUFRLE9BQU8sT0FBUSxPQUFPO0FBQ3JDO0FBQUEsSUFDUjtBQUNBLFFBQUksTUFBTSxNQUFNLFVBQVUsUUFBUTtBQUNsQyxVQUFNLFdBQVcsSUFBSSxRQUFRLElBQUk7QUFDakMsUUFBSSxhQUFhLElBQUk7QUFDakIsY0FBUTtBQUFBLElBQ1osV0FDUyxVQUFVLE9BQU8sYUFBYSxJQUFJLFNBQVMsR0FBRztBQUNuRCxjQUFRO0FBQ1IsVUFBSTtBQUNBLG9CQUFZO0FBQUEsSUFDcEIsT0FDSztBQUNELGNBQVE7QUFBQSxJQUNaO0FBQ0EsUUFBSSxLQUFLO0FBQ0wsY0FBUSxNQUFNLE1BQU0sR0FBRyxDQUFDLElBQUksTUFBTTtBQUNsQyxVQUFJLElBQUksSUFBSSxTQUFTLENBQUMsTUFBTTtBQUN4QixjQUFNLElBQUksTUFBTSxHQUFHLEVBQUU7QUFDekIsWUFBTSxJQUFJLFFBQVEsa0JBQWtCLEtBQUtBLE9BQU0sRUFBRTtBQUFBLElBQ3JEO0FBRUEsUUFBSSxpQkFBaUI7QUFDckIsUUFBSTtBQUNKLFFBQUksYUFBYTtBQUNqQixTQUFLLFdBQVcsR0FBRyxXQUFXLE1BQU0sUUFBUSxFQUFFLFVBQVU7QUFDcEQsWUFBTSxLQUFLLE1BQU0sUUFBUTtBQUN6QixVQUFJLE9BQU87QUFDUCx5QkFBaUI7QUFBQSxlQUNaLE9BQU87QUFDWixxQkFBYTtBQUFBO0FBRWI7QUFBQSxJQUNSO0FBQ0EsUUFBSSxRQUFRLE1BQU0sVUFBVSxHQUFHLGFBQWEsV0FBVyxhQUFhLElBQUksUUFBUTtBQUNoRixRQUFJLE9BQU87QUFDUCxjQUFRLE1BQU0sVUFBVSxNQUFNLE1BQU07QUFDcEMsY0FBUSxNQUFNLFFBQVEsUUFBUSxLQUFLQSxPQUFNLEVBQUU7QUFBQSxJQUMvQztBQUNBLFVBQU0sYUFBYUEsVUFBUyxNQUFNO0FBRWxDLFFBQUksVUFBVSxpQkFBaUIsYUFBYSxNQUFNO0FBQ2xELFFBQUksU0FBUztBQUNULGdCQUFVLE1BQU0sY0FBYyxRQUFRLFFBQVEsY0FBYyxHQUFHLENBQUM7QUFDaEUsVUFBSTtBQUNBLGtCQUFVO0FBQUEsSUFDbEI7QUFDQSxRQUFJLENBQUMsU0FBUztBQUNWLFlBQU0sY0FBYyxNQUNmLFFBQVEsUUFBUSxNQUFNLEVBQ3RCLFFBQVEsa0RBQWtELE1BQU0sRUFFaEUsUUFBUSxRQUFRLEtBQUtBLE9BQU0sRUFBRTtBQUNsQyxVQUFJLGtCQUFrQjtBQUN0QixZQUFNLGNBQWMsZUFBZSxLQUFLLElBQUk7QUFDNUMsVUFBSSxlQUFlLFlBQVksU0FBUyxPQUFPLGNBQWM7QUFDekQsb0JBQVksYUFBYSxNQUFNO0FBQzNCLDRCQUFrQjtBQUFBLFFBQ3RCO0FBQUEsTUFDSjtBQUNBLFlBQU0sT0FBTyxjQUFjLEdBQUcsS0FBSyxHQUFHLFdBQVcsR0FBRyxHQUFHLElBQUlBLFNBQVEsWUFBWSxXQUFXO0FBQzFGLFVBQUksQ0FBQztBQUNELGVBQU8sSUFBSSxNQUFNO0FBQUEsRUFBS0EsT0FBTSxHQUFHLElBQUk7QUFBQSxJQUMzQztBQUNBLFlBQVEsTUFBTSxRQUFRLFFBQVEsS0FBS0EsT0FBTSxFQUFFO0FBQzNDLFdBQU8sSUFBSSxNQUFNO0FBQUEsRUFBS0EsT0FBTSxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsR0FBRztBQUFBLEVBQ3REO0FBQ0EsV0FBUyxZQUFZLE1BQU0sS0FBSyxXQUFXLGFBQWE7QUFDcEQsVUFBTSxFQUFFLE1BQU0sTUFBTSxJQUFJO0FBQ3hCLFVBQU0sRUFBRSxjQUFjLGFBQWEsUUFBQUEsU0FBUSxZQUFZLE9BQU8sSUFBSTtBQUNsRSxRQUFLLGVBQWUsTUFBTSxTQUFTLElBQUksS0FDbEMsVUFBVSxXQUFXLEtBQUssS0FBSyxHQUFJO0FBQ3BDLGFBQU8sYUFBYSxPQUFPLEdBQUc7QUFBQSxJQUNsQztBQUNBLFFBQUksb0ZBQW9GLEtBQUssS0FBSyxHQUFHO0FBT2pHLGFBQU8sZUFBZSxVQUFVLENBQUMsTUFBTSxTQUFTLElBQUksSUFDOUMsYUFBYSxPQUFPLEdBQUcsSUFDdkIsWUFBWSxNQUFNLEtBQUssV0FBVyxXQUFXO0FBQUEsSUFDdkQ7QUFDQSxRQUFJLENBQUMsZUFDRCxDQUFDLFVBQ0QsU0FBUyxPQUFPLFNBQ2hCLE1BQU0sU0FBUyxJQUFJLEdBQUc7QUFFdEIsYUFBTyxZQUFZLE1BQU0sS0FBSyxXQUFXLFdBQVc7QUFBQSxJQUN4RDtBQUNBLFFBQUksdUJBQXVCLEtBQUssR0FBRztBQUMvQixVQUFJQSxZQUFXLElBQUk7QUFDZixZQUFJLG1CQUFtQjtBQUN2QixlQUFPLFlBQVksTUFBTSxLQUFLLFdBQVcsV0FBVztBQUFBLE1BQ3hELFdBQ1MsZUFBZUEsWUFBVyxZQUFZO0FBQzNDLGVBQU8sYUFBYSxPQUFPLEdBQUc7QUFBQSxNQUNsQztBQUFBLElBQ0o7QUFDQSxVQUFNLE1BQU0sTUFBTSxRQUFRLFFBQVE7QUFBQSxFQUFPQSxPQUFNLEVBQUU7QUFJakQsUUFBSSxjQUFjO0FBQ2QsWUFBTSxPQUFPLENBQUMsUUFBUSxJQUFJLFdBQVcsSUFBSSxRQUFRLDJCQUEyQixJQUFJLE1BQU0sS0FBSyxHQUFHO0FBQzlGLFlBQU0sRUFBRSxRQUFRLEtBQUssSUFBSSxJQUFJLElBQUk7QUFDakMsVUFBSSxLQUFLLEtBQUssSUFBSSxLQUFLLFFBQVEsS0FBSyxJQUFJO0FBQ3BDLGVBQU8sYUFBYSxPQUFPLEdBQUc7QUFBQSxJQUN0QztBQUNBLFdBQU8sY0FDRCxNQUNBLGNBQWMsS0FBS0EsU0FBUSxXQUFXLGVBQWUsS0FBSyxLQUFLLENBQUM7QUFBQSxFQUMxRTtBQUNBLFdBQVMsZ0JBQWdCLE1BQU0sS0FBSyxXQUFXLGFBQWE7QUFDeEQsVUFBTSxFQUFFLGFBQWEsT0FBTyxJQUFJO0FBQ2hDLFVBQU0sS0FBSyxPQUFPLEtBQUssVUFBVSxXQUMzQixPQUNBLE9BQU8sT0FBTyxDQUFDLEdBQUcsTUFBTSxFQUFFLE9BQU8sT0FBTyxLQUFLLEtBQUssRUFBRSxDQUFDO0FBQzNELFFBQUksRUFBRSxLQUFLLElBQUk7QUFDZixRQUFJLFNBQVMsT0FBTyxjQUFjO0FBRTlCLFVBQUksa0RBQWtELEtBQUssR0FBRyxLQUFLO0FBQy9ELGVBQU8sT0FBTztBQUFBLElBQ3RCO0FBQ0EsVUFBTSxhQUFhLENBQUMsVUFBVTtBQUMxQixjQUFRLE9BQU87QUFBQSxRQUNYLEtBQUssT0FBTztBQUFBLFFBQ1osS0FBSyxPQUFPO0FBQ1IsaUJBQU8sZUFBZSxTQUNoQixhQUFhLEdBQUcsT0FBTyxHQUFHLElBQzFCLFlBQVksSUFBSSxLQUFLLFdBQVcsV0FBVztBQUFBLFFBQ3JELEtBQUssT0FBTztBQUNSLGlCQUFPLG1CQUFtQixHQUFHLE9BQU8sR0FBRztBQUFBLFFBQzNDLEtBQUssT0FBTztBQUNSLGlCQUFPLG1CQUFtQixHQUFHLE9BQU8sR0FBRztBQUFBLFFBQzNDLEtBQUssT0FBTztBQUNSLGlCQUFPLFlBQVksSUFBSSxLQUFLLFdBQVcsV0FBVztBQUFBLFFBQ3REO0FBQ0ksaUJBQU87QUFBQSxNQUNmO0FBQUEsSUFDSjtBQUNBLFFBQUksTUFBTSxXQUFXLElBQUk7QUFDekIsUUFBSSxRQUFRLE1BQU07QUFDZCxZQUFNLEVBQUUsZ0JBQWdCLGtCQUFrQixJQUFJLElBQUk7QUFDbEQsWUFBTSxJQUFLLGVBQWUsa0JBQW1CO0FBQzdDLFlBQU0sV0FBVyxDQUFDO0FBQ2xCLFVBQUksUUFBUTtBQUNSLGNBQU0sSUFBSSxNQUFNLG1DQUFtQyxDQUFDLEVBQUU7QUFBQSxJQUM5RDtBQUNBLFdBQU87QUFBQSxFQUNYOzs7QUN4VUEsV0FBUyx1QkFBdUIsS0FBSyxTQUFTO0FBQzFDLFVBQU0sTUFBTSxPQUFPLE9BQU87QUFBQSxNQUN0QixZQUFZO0FBQUEsTUFDWixlQUFlO0FBQUEsTUFDZixnQkFBZ0I7QUFBQSxNQUNoQixtQkFBbUI7QUFBQSxNQUNuQixZQUFZO0FBQUEsTUFDWixvQkFBb0I7QUFBQSxNQUNwQixnQ0FBZ0M7QUFBQSxNQUNoQyxVQUFVO0FBQUEsTUFDVix1QkFBdUI7QUFBQSxNQUN2QixXQUFXO0FBQUEsTUFDWCxXQUFXO0FBQUEsTUFDWCxpQkFBaUI7QUFBQSxNQUNqQixTQUFTO0FBQUEsTUFDVCxZQUFZO0FBQUEsTUFDWixhQUFhO0FBQUEsTUFDYixlQUFlO0FBQUEsTUFDZixTQUFTO0FBQUEsTUFDVCxrQkFBa0I7QUFBQSxJQUN0QixHQUFHLElBQUksT0FBTyxpQkFBaUIsT0FBTztBQUN0QyxRQUFJO0FBQ0osWUFBUSxJQUFJLGlCQUFpQjtBQUFBLE1BQ3pCLEtBQUs7QUFDRCxpQkFBUztBQUNUO0FBQUEsTUFDSixLQUFLO0FBQ0QsaUJBQVM7QUFDVDtBQUFBLE1BQ0o7QUFDSSxpQkFBUztBQUFBLElBQ2pCO0FBQ0EsV0FBTztBQUFBLE1BQ0gsU0FBUyxvQkFBSSxJQUFJO0FBQUEsTUFDakI7QUFBQSxNQUNBLHVCQUF1QixJQUFJLHdCQUF3QixNQUFNO0FBQUEsTUFDekQsUUFBUTtBQUFBLE1BQ1IsWUFBWSxPQUFPLElBQUksV0FBVyxXQUFXLElBQUksT0FBTyxJQUFJLE1BQU0sSUFBSTtBQUFBLE1BQ3RFO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDYjtBQUFBLEVBQ0o7QUFDQSxXQUFTLGFBQWEsTUFBTSxNQUFNO0FBQzlCLFFBQUksS0FBSyxLQUFLO0FBQ1YsWUFBTSxRQUFRLEtBQUssT0FBTyxPQUFLLEVBQUUsUUFBUSxLQUFLLEdBQUc7QUFDakQsVUFBSSxNQUFNLFNBQVM7QUFDZixlQUFPLE1BQU0sS0FBSyxPQUFLLEVBQUUsV0FBVyxLQUFLLE1BQU0sS0FBSyxNQUFNLENBQUM7QUFBQSxJQUNuRTtBQUNBLFFBQUksU0FBUztBQUNiLFFBQUk7QUFDSixRQUFJLFNBQVMsSUFBSSxHQUFHO0FBQ2hCLFlBQU0sS0FBSztBQUNYLFVBQUksUUFBUSxLQUFLLE9BQU8sT0FBSyxFQUFFLFdBQVcsR0FBRyxDQUFDO0FBQzlDLFVBQUksTUFBTSxTQUFTLEdBQUc7QUFDbEIsY0FBTSxZQUFZLE1BQU0sT0FBTyxPQUFLLEVBQUUsSUFBSTtBQUMxQyxZQUFJLFVBQVUsU0FBUztBQUNuQixrQkFBUTtBQUFBLE1BQ2hCO0FBQ0EsZUFDSSxNQUFNLEtBQUssT0FBSyxFQUFFLFdBQVcsS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLE9BQUssQ0FBQyxFQUFFLE1BQU07QUFBQSxJQUM5RSxPQUNLO0FBQ0QsWUFBTTtBQUNOLGVBQVMsS0FBSyxLQUFLLE9BQUssRUFBRSxhQUFhLGVBQWUsRUFBRSxTQUFTO0FBQUEsSUFDckU7QUFDQSxRQUFJLENBQUMsUUFBUTtBQUNULFlBQU0sT0FBTyxLQUFLLGFBQWEsU0FBUyxRQUFRLE9BQU8sU0FBUyxPQUFPO0FBQ3ZFLFlBQU0sSUFBSSxNQUFNLHdCQUF3QixJQUFJLFFBQVE7QUFBQSxJQUN4RDtBQUNBLFdBQU87QUFBQSxFQUNYO0FBRUEsV0FBUyxlQUFlLE1BQU0sUUFBUSxFQUFFLFNBQVMsSUFBSSxHQUFHO0FBQ3BELFFBQUksQ0FBQyxJQUFJO0FBQ0wsYUFBTztBQUNYLFVBQU0sUUFBUSxDQUFDO0FBQ2YsVUFBTSxVQUFVLFNBQVMsSUFBSSxLQUFLLGFBQWEsSUFBSSxNQUFNLEtBQUs7QUFDOUQsUUFBSSxVQUFVLGNBQWMsTUFBTSxHQUFHO0FBQ2pDLGNBQVEsSUFBSSxNQUFNO0FBQ2xCLFlBQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtBQUFBLElBQzNCO0FBQ0EsVUFBTSxNQUFNLEtBQUssUUFBUSxPQUFPLFVBQVUsT0FBTyxPQUFPO0FBQ3hELFFBQUk7QUFDQSxZQUFNLEtBQUssSUFBSSxXQUFXLFVBQVUsR0FBRyxDQUFDO0FBQzVDLFdBQU8sTUFBTSxLQUFLLEdBQUc7QUFBQSxFQUN6QjtBQUNBLFdBQVMsVUFBVSxNQUFNLEtBQUssV0FBVyxhQUFhO0FBQ2xELFFBQUksT0FBTyxJQUFJO0FBQ1gsYUFBTyxLQUFLLFNBQVMsS0FBSyxXQUFXLFdBQVc7QUFDcEQsUUFBSSxRQUFRLElBQUksR0FBRztBQUNmLFVBQUksSUFBSSxJQUFJO0FBQ1IsZUFBTyxLQUFLLFNBQVMsR0FBRztBQUM1QixVQUFJLElBQUksaUJBQWlCLElBQUksSUFBSSxHQUFHO0FBQ2hDLGNBQU0sSUFBSSxVQUFVLHlEQUF5RDtBQUFBLE1BQ2pGLE9BQ0s7QUFDRCxZQUFJLElBQUk7QUFDSixjQUFJLGdCQUFnQixJQUFJLElBQUk7QUFBQTtBQUU1QixjQUFJLGtCQUFrQixvQkFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3hDLGVBQU8sS0FBSyxRQUFRLElBQUksR0FBRztBQUFBLE1BQy9CO0FBQUEsSUFDSjtBQUNBLFFBQUksU0FBUztBQUNiLFVBQU0sT0FBTyxPQUFPLElBQUksSUFDbEIsT0FDQSxJQUFJLElBQUksV0FBVyxNQUFNLEVBQUUsVUFBVSxPQUFNLFNBQVMsRUFBRyxDQUFDO0FBQzlELGVBQVcsU0FBUyxhQUFhLElBQUksSUFBSSxPQUFPLE1BQU0sSUFBSTtBQUMxRCxVQUFNLFFBQVEsZUFBZSxNQUFNLFFBQVEsR0FBRztBQUM5QyxRQUFJLE1BQU0sU0FBUztBQUNmLFVBQUksaUJBQWlCLElBQUksaUJBQWlCLEtBQUssTUFBTSxTQUFTO0FBQ2xFLFVBQU0sTUFBTSxPQUFPLE9BQU8sY0FBYyxhQUNsQyxPQUFPLFVBQVUsTUFBTSxLQUFLLFdBQVcsV0FBVyxJQUNsRCxTQUFTLElBQUksSUFDVCxnQkFBZ0IsTUFBTSxLQUFLLFdBQVcsV0FBVyxJQUNqRCxLQUFLLFNBQVMsS0FBSyxXQUFXLFdBQVc7QUFDbkQsUUFBSSxDQUFDO0FBQ0QsYUFBTztBQUNYLFdBQU8sU0FBUyxJQUFJLEtBQUssSUFBSSxDQUFDLE1BQU0sT0FBTyxJQUFJLENBQUMsTUFBTSxNQUNoRCxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQ2YsR0FBRyxLQUFLO0FBQUEsRUFBSyxJQUFJLE1BQU0sR0FBRyxHQUFHO0FBQUEsRUFDdkM7OztBQ3pIQSxXQUFTLGNBQWMsRUFBRSxLQUFLLE1BQU0sR0FBRyxLQUFLLFdBQVcsYUFBYTtBQUNoRSxVQUFNLEVBQUUsZUFBZSxLQUFLLFFBQUFDLFNBQVEsWUFBWSxTQUFTLEVBQUUsZUFBZSxXQUFXLFdBQVcsRUFBRSxJQUFJO0FBQ3RHLFFBQUksYUFBYyxPQUFPLEdBQUcsS0FBSyxJQUFJLFdBQVk7QUFDakQsUUFBSSxZQUFZO0FBQ1osVUFBSSxZQUFZO0FBQ1osY0FBTSxJQUFJLE1BQU0sa0RBQWtEO0FBQUEsTUFDdEU7QUFDQSxVQUFJLGFBQWEsR0FBRyxLQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssT0FBTyxRQUFRLFVBQVc7QUFDaEUsY0FBTSxNQUFNO0FBQ1osY0FBTSxJQUFJLE1BQU0sR0FBRztBQUFBLE1BQ3ZCO0FBQUEsSUFDSjtBQUNBLFFBQUksY0FBYyxDQUFDLGVBQ2QsQ0FBQyxPQUNHLGNBQWMsU0FBUyxRQUFRLENBQUMsSUFBSSxVQUNyQyxhQUFhLEdBQUcsTUFDZixTQUFTLEdBQUcsSUFDUCxJQUFJLFNBQVMsT0FBTyxnQkFBZ0IsSUFBSSxTQUFTLE9BQU8sZ0JBQ3hELE9BQU8sUUFBUTtBQUM3QixVQUFNLE9BQU8sT0FBTyxDQUFDLEdBQUcsS0FBSztBQUFBLE1BQ3pCLGVBQWU7QUFBQSxNQUNmLGFBQWEsQ0FBQyxnQkFBZ0IsY0FBYyxDQUFDO0FBQUEsTUFDN0MsUUFBUUEsVUFBUztBQUFBLElBQ3JCLENBQUM7QUFDRCxRQUFJLGlCQUFpQjtBQUNyQixRQUFJLFlBQVk7QUFDaEIsUUFBSSxNQUFNLFVBQVUsS0FBSyxLQUFLLE1BQU8saUJBQWlCLE1BQU8sTUFBTyxZQUFZLElBQUs7QUFDckYsUUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLFVBQVUsSUFBSSxTQUFTLE1BQU07QUFDbEQsVUFBSTtBQUNBLGNBQU0sSUFBSSxNQUFNLDhFQUE4RTtBQUNsRyxvQkFBYztBQUFBLElBQ2xCO0FBQ0EsUUFBSSxJQUFJLFFBQVE7QUFDWixVQUFJLGlCQUFpQixTQUFTLE1BQU07QUFDaEMsWUFBSSxrQkFBa0I7QUFDbEIsb0JBQVU7QUFDZCxlQUFPLFFBQVEsS0FBSyxNQUFNLGNBQWMsS0FBSyxHQUFHLEtBQUs7QUFBQSxNQUN6RDtBQUFBLElBQ0osV0FDVSxpQkFBaUIsQ0FBQyxjQUFnQixTQUFTLFFBQVEsYUFBYztBQUN2RSxZQUFNLEtBQUssR0FBRztBQUNkLFVBQUksY0FBYyxDQUFDLGdCQUFnQjtBQUMvQixlQUFPLFlBQVksS0FBSyxJQUFJLFFBQVEsY0FBYyxVQUFVLENBQUM7QUFBQSxNQUNqRSxXQUNTLGFBQWE7QUFDbEIsb0JBQVk7QUFDaEIsYUFBTztBQUFBLElBQ1g7QUFDQSxRQUFJO0FBQ0EsbUJBQWE7QUFDakIsUUFBSSxhQUFhO0FBQ2IsVUFBSTtBQUNBLGVBQU8sWUFBWSxLQUFLLElBQUksUUFBUSxjQUFjLFVBQVUsQ0FBQztBQUNqRSxZQUFNLEtBQUssR0FBRztBQUFBLEVBQUtBLE9BQU07QUFBQSxJQUM3QixPQUNLO0FBQ0QsWUFBTSxHQUFHLEdBQUc7QUFDWixVQUFJO0FBQ0EsZUFBTyxZQUFZLEtBQUssSUFBSSxRQUFRLGNBQWMsVUFBVSxDQUFDO0FBQUEsSUFDckU7QUFDQSxRQUFJLEtBQUssS0FBSztBQUNkLFFBQUksT0FBTyxLQUFLLEdBQUc7QUFDZixZQUFNLENBQUMsQ0FBQyxNQUFNO0FBQ2QsWUFBTSxNQUFNO0FBQ1oscUJBQWUsTUFBTTtBQUFBLElBQ3pCLE9BQ0s7QUFDRCxZQUFNO0FBQ04sWUFBTTtBQUNOLHFCQUFlO0FBQ2YsVUFBSSxTQUFTLE9BQU8sVUFBVTtBQUMxQixnQkFBUSxJQUFJLFdBQVcsS0FBSztBQUFBLElBQ3BDO0FBQ0EsUUFBSSxjQUFjO0FBQ2xCLFFBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxTQUFTLEtBQUs7QUFDN0MsVUFBSSxnQkFBZ0IsSUFBSSxTQUFTO0FBQ3JDLGdCQUFZO0FBQ1osUUFBSSxDQUFDLGFBQ0QsV0FBVyxVQUFVLEtBQ3JCLENBQUMsSUFBSSxVQUNMLENBQUMsZUFDRCxNQUFNLEtBQUssS0FDWCxDQUFDLE1BQU0sUUFDUCxDQUFDLE1BQU0sT0FDUCxDQUFDLE1BQU0sUUFBUTtBQUVmLFVBQUksU0FBUyxJQUFJLE9BQU8sVUFBVSxDQUFDO0FBQUEsSUFDdkM7QUFDQSxRQUFJLG1CQUFtQjtBQUN2QixVQUFNLFdBQVcsVUFBVSxPQUFPLEtBQUssTUFBTyxtQkFBbUIsTUFBTyxNQUFPLFlBQVksSUFBSztBQUNoRyxRQUFJLEtBQUs7QUFDVCxRQUFJLGNBQWMsT0FBTyxLQUFLO0FBQzFCLFdBQUssTUFBTSxPQUFPO0FBQ2xCLFVBQUksS0FBSztBQUNMLGNBQU0sS0FBSyxjQUFjLEdBQUc7QUFDNUIsY0FBTTtBQUFBLEVBQUssY0FBYyxJQUFJLElBQUksTUFBTSxDQUFDO0FBQUEsTUFDNUM7QUFDQSxVQUFJLGFBQWEsTUFBTSxDQUFDLElBQUksUUFBUTtBQUNoQyxZQUFJLE9BQU8sUUFBUTtBQUNmLGVBQUs7QUFBQSxNQUNiLE9BQ0s7QUFDRCxjQUFNO0FBQUEsRUFBSyxJQUFJLE1BQU07QUFBQSxNQUN6QjtBQUFBLElBQ0osV0FDUyxDQUFDLGVBQWUsYUFBYSxLQUFLLEdBQUc7QUFDMUMsWUFBTSxNQUFNLFNBQVMsQ0FBQztBQUN0QixZQUFNLE1BQU0sU0FBUyxRQUFRLElBQUk7QUFDakMsWUFBTSxhQUFhLFFBQVE7QUFDM0IsWUFBTSxPQUFPLElBQUksVUFBVSxNQUFNLFFBQVEsTUFBTSxNQUFNLFdBQVc7QUFDaEUsVUFBSSxjQUFjLENBQUMsTUFBTTtBQUNyQixZQUFJLGVBQWU7QUFDbkIsWUFBSSxlQUFlLFFBQVEsT0FBTyxRQUFRLE1BQU07QUFDNUMsY0FBSSxNQUFNLFNBQVMsUUFBUSxHQUFHO0FBQzlCLGNBQUksUUFBUSxPQUNSLFFBQVEsTUFDUixNQUFNLE9BQ04sU0FBUyxNQUFNLENBQUMsTUFBTSxLQUFLO0FBQzNCLGtCQUFNLFNBQVMsUUFBUSxLQUFLLE1BQU0sQ0FBQztBQUFBLFVBQ3ZDO0FBQ0EsY0FBSSxRQUFRLE1BQU0sTUFBTTtBQUNwQiwyQkFBZTtBQUFBLFFBQ3ZCO0FBQ0EsWUFBSSxDQUFDO0FBQ0QsZUFBSztBQUFBLEVBQUssSUFBSSxNQUFNO0FBQUEsTUFDNUI7QUFBQSxJQUNKLFdBQ1MsYUFBYSxNQUFNLFNBQVMsQ0FBQyxNQUFNLE1BQU07QUFDOUMsV0FBSztBQUFBLElBQ1Q7QUFDQSxXQUFPLEtBQUs7QUFDWixRQUFJLElBQUksUUFBUTtBQUNaLFVBQUksb0JBQW9CO0FBQ3BCLGtCQUFVO0FBQUEsSUFDbEIsV0FDUyxnQkFBZ0IsQ0FBQyxrQkFBa0I7QUFDeEMsYUFBTyxZQUFZLEtBQUssSUFBSSxRQUFRLGNBQWMsWUFBWSxDQUFDO0FBQUEsSUFDbkUsV0FDUyxhQUFhLGFBQWE7QUFDL0Isa0JBQVk7QUFBQSxJQUNoQjtBQUNBLFdBQU87QUFBQSxFQUNYOzs7QUMvSUEsV0FBUyxLQUFLLFVBQVUsU0FBUztBQUM3QixRQUFJLGFBQWEsV0FBVyxhQUFhLFFBQVE7QUFDN0MsY0FBUSxLQUFLLE9BQU87QUFBQSxJQUN4QjtBQUFBLEVBQ0o7OztBQ0VBLE1BQU0sWUFBWTtBQUNsQixNQUFNLFFBQVE7QUFBQSxJQUNWLFVBQVUsV0FBUyxVQUFVLGFBQ3hCLE9BQU8sVUFBVSxZQUFZLE1BQU0sZ0JBQWdCO0FBQUEsSUFDeEQsU0FBUztBQUFBLElBQ1QsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sU0FBUyxNQUFNLE9BQU8sT0FBTyxJQUFJLE9BQU8sT0FBTyxTQUFTLENBQUMsR0FBRztBQUFBLE1BQ3hELFlBQVk7QUFBQSxJQUNoQixDQUFDO0FBQUEsSUFDRCxXQUFXLE1BQU07QUFBQSxFQUNyQjtBQUNBLE1BQU0sYUFBYSxDQUFDLEtBQUssU0FBUyxNQUFNLFNBQVMsR0FBRyxLQUMvQyxTQUFTLEdBQUcsTUFDUixDQUFDLElBQUksUUFBUSxJQUFJLFNBQVMsT0FBTyxVQUNsQyxNQUFNLFNBQVMsSUFBSSxLQUFLLE1BQzVCLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxTQUFPLElBQUksUUFBUSxNQUFNLE9BQU8sSUFBSSxPQUFPO0FBQ3pFLFdBQVMsZ0JBQWdCLEtBQUtDLE1BQUssT0FBTztBQUN0QyxVQUFNLFNBQVMsa0JBQWtCLEtBQUssS0FBSztBQUMzQyxRQUFJLE1BQU0sTUFBTTtBQUNaLGlCQUFXQyxPQUFNLE9BQU87QUFDcEIsbUJBQVcsS0FBS0QsTUFBS0MsR0FBRTtBQUFBLGFBQ3RCLE1BQU0sUUFBUSxNQUFNO0FBQ3pCLGlCQUFXQSxPQUFNO0FBQ2IsbUJBQVcsS0FBS0QsTUFBS0MsR0FBRTtBQUFBO0FBRTNCLGlCQUFXLEtBQUtELE1BQUssTUFBTTtBQUFBLEVBQ25DO0FBQ0EsV0FBUyxXQUFXLEtBQUtBLE1BQUssT0FBTztBQUNqQyxVQUFNLFNBQVMsa0JBQWtCLEtBQUssS0FBSztBQUMzQyxRQUFJLENBQUMsTUFBTSxNQUFNO0FBQ2IsWUFBTSxJQUFJLE1BQU0sMkNBQTJDO0FBQy9ELFVBQU0sU0FBUyxPQUFPLE9BQU8sTUFBTSxLQUFLLEdBQUc7QUFDM0MsZUFBVyxDQUFDLEtBQUtFLE1BQUssS0FBSyxRQUFRO0FBQy9CLFVBQUlGLGdCQUFlLEtBQUs7QUFDcEIsWUFBSSxDQUFDQSxLQUFJLElBQUksR0FBRztBQUNaLFVBQUFBLEtBQUksSUFBSSxLQUFLRSxNQUFLO0FBQUEsTUFDMUIsV0FDU0YsZ0JBQWUsS0FBSztBQUN6QixRQUFBQSxLQUFJLElBQUksR0FBRztBQUFBLE1BQ2YsV0FDUyxDQUFDLE9BQU8sVUFBVSxlQUFlLEtBQUtBLE1BQUssR0FBRyxHQUFHO0FBQ3RELGVBQU8sZUFBZUEsTUFBSyxLQUFLO0FBQUEsVUFDNUIsT0FBQUU7QUFBQSxVQUNBLFVBQVU7QUFBQSxVQUNWLFlBQVk7QUFBQSxVQUNaLGNBQWM7QUFBQSxRQUNsQixDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0o7QUFDQSxXQUFPRjtBQUFBLEVBQ1g7QUFDQSxXQUFTLGtCQUFrQixLQUFLLE9BQU87QUFDbkMsV0FBTyxPQUFPLFFBQVEsS0FBSyxJQUFJLE1BQU0sUUFBUSxJQUFJLEtBQUssR0FBRyxJQUFJO0FBQUEsRUFDakU7OztBQzFEQSxXQUFTLGVBQWUsS0FBS0csTUFBSyxFQUFFLEtBQUssTUFBTSxHQUFHO0FBQzlDLFFBQUksT0FBTyxHQUFHLEtBQUssSUFBSTtBQUNuQixVQUFJLFdBQVcsS0FBS0EsTUFBSyxLQUFLO0FBQUEsYUFFekIsV0FBVyxLQUFLLEdBQUc7QUFDeEIsc0JBQWdCLEtBQUtBLE1BQUssS0FBSztBQUFBLFNBQzlCO0FBQ0QsWUFBTSxRQUFRLEtBQUssS0FBSyxJQUFJLEdBQUc7QUFDL0IsVUFBSUEsZ0JBQWUsS0FBSztBQUNwQixRQUFBQSxLQUFJLElBQUksT0FBTyxLQUFLLE9BQU8sT0FBTyxHQUFHLENBQUM7QUFBQSxNQUMxQyxXQUNTQSxnQkFBZSxLQUFLO0FBQ3pCLFFBQUFBLEtBQUksSUFBSSxLQUFLO0FBQUEsTUFDakIsT0FDSztBQUNELGNBQU0sWUFBWSxhQUFhLEtBQUssT0FBTyxHQUFHO0FBQzlDLGNBQU0sVUFBVSxLQUFLLE9BQU8sV0FBVyxHQUFHO0FBQzFDLFlBQUksYUFBYUE7QUFDYixpQkFBTyxlQUFlQSxNQUFLLFdBQVc7QUFBQSxZQUNsQyxPQUFPO0FBQUEsWUFDUCxVQUFVO0FBQUEsWUFDVixZQUFZO0FBQUEsWUFDWixjQUFjO0FBQUEsVUFDbEIsQ0FBQztBQUFBO0FBRUQsVUFBQUEsS0FBSSxTQUFTLElBQUk7QUFBQSxNQUN6QjtBQUFBLElBQ0o7QUFDQSxXQUFPQTtBQUFBLEVBQ1g7QUFDQSxXQUFTLGFBQWEsS0FBSyxPQUFPLEtBQUs7QUFDbkMsUUFBSSxVQUFVO0FBQ1YsYUFBTztBQUVYLFFBQUksT0FBTyxVQUFVO0FBQ2pCLGFBQU8sT0FBTyxLQUFLO0FBQ3ZCLFFBQUksT0FBTyxHQUFHLEtBQUssS0FBSyxLQUFLO0FBQ3pCLFlBQU0sU0FBUyx1QkFBdUIsSUFBSSxLQUFLLENBQUMsQ0FBQztBQUNqRCxhQUFPLFVBQVUsb0JBQUksSUFBSTtBQUN6QixpQkFBVyxRQUFRLElBQUksUUFBUSxLQUFLO0FBQ2hDLGVBQU8sUUFBUSxJQUFJLEtBQUssTUFBTTtBQUNsQyxhQUFPLFNBQVM7QUFDaEIsYUFBTyxpQkFBaUI7QUFDeEIsWUFBTSxTQUFTLElBQUksU0FBUyxNQUFNO0FBQ2xDLFVBQUksQ0FBQyxJQUFJLGNBQWM7QUFDbkIsWUFBSSxVQUFVLEtBQUssVUFBVSxNQUFNO0FBQ25DLFlBQUksUUFBUSxTQUFTO0FBQ2pCLG9CQUFVLFFBQVEsVUFBVSxHQUFHLEVBQUUsSUFBSTtBQUN6QyxhQUFLLElBQUksSUFBSSxRQUFRLFVBQVUsa0ZBQWtGLE9BQU8sMENBQTBDO0FBQ2xLLFlBQUksZUFBZTtBQUFBLE1BQ3ZCO0FBQ0EsYUFBTztBQUFBLElBQ1g7QUFDQSxXQUFPLEtBQUssVUFBVSxLQUFLO0FBQUEsRUFDL0I7OztBQ3ZEQSxXQUFTLFdBQVcsS0FBSyxPQUFPLEtBQUs7QUFDakMsVUFBTSxJQUFJLFdBQVcsS0FBSyxRQUFXLEdBQUc7QUFDeEMsVUFBTSxJQUFJLFdBQVcsT0FBTyxRQUFXLEdBQUc7QUFDMUMsV0FBTyxJQUFJLEtBQUssR0FBRyxDQUFDO0FBQUEsRUFDeEI7QUFDQSxNQUFNLE9BQU4sTUFBTSxNQUFLO0FBQUEsSUFDUCxZQUFZLEtBQUssUUFBUSxNQUFNO0FBQzNCLGFBQU8sZUFBZSxNQUFNLFdBQVcsRUFBRSxPQUFPLEtBQUssQ0FBQztBQUN0RCxXQUFLLE1BQU07QUFDWCxXQUFLLFFBQVE7QUFBQSxJQUNqQjtBQUFBLElBQ0EsTUFBTUMsU0FBUTtBQUNWLFVBQUksRUFBRSxLQUFLLE1BQU0sSUFBSTtBQUNyQixVQUFJLE9BQU8sR0FBRztBQUNWLGNBQU0sSUFBSSxNQUFNQSxPQUFNO0FBQzFCLFVBQUksT0FBTyxLQUFLO0FBQ1osZ0JBQVEsTUFBTSxNQUFNQSxPQUFNO0FBQzlCLGFBQU8sSUFBSSxNQUFLLEtBQUssS0FBSztBQUFBLElBQzlCO0FBQUEsSUFDQSxPQUFPLEdBQUcsS0FBSztBQUNYLFlBQU0sT0FBTyxLQUFLLFdBQVcsb0JBQUksSUFBSSxJQUFJLENBQUM7QUFDMUMsYUFBTyxlQUFlLEtBQUssTUFBTSxJQUFJO0FBQUEsSUFDekM7QUFBQSxJQUNBLFNBQVMsS0FBSyxXQUFXLGFBQWE7QUFDbEMsYUFBTyxLQUFLLE1BQ04sY0FBYyxNQUFNLEtBQUssV0FBVyxXQUFXLElBQy9DLEtBQUssVUFBVSxJQUFJO0FBQUEsSUFDN0I7QUFBQSxFQUNKOzs7QUM3QkEsV0FBUyxvQkFBb0IsWUFBWSxLQUFLLFNBQVM7QUFDbkQsVUFBTSxPQUFPLElBQUksVUFBVSxXQUFXO0FBQ3RDLFVBQU1DLGFBQVksT0FBTywwQkFBMEI7QUFDbkQsV0FBT0EsV0FBVSxZQUFZLEtBQUssT0FBTztBQUFBLEVBQzdDO0FBQ0EsV0FBUyx5QkFBeUIsRUFBRSxTQUFTLE1BQU0sR0FBRyxLQUFLLEVBQUUsaUJBQWlCLFdBQVcsWUFBWSxhQUFhLFVBQVUsR0FBRztBQUMzSCxVQUFNLEVBQUUsUUFBQUMsU0FBUSxTQUFTLEVBQUUsY0FBYyxFQUFFLElBQUk7QUFDL0MsVUFBTSxVQUFVLE9BQU8sT0FBTyxDQUFDLEdBQUcsS0FBSyxFQUFFLFFBQVEsWUFBWSxNQUFNLEtBQUssQ0FBQztBQUN6RSxRQUFJLFlBQVk7QUFDaEIsVUFBTSxRQUFRLENBQUM7QUFDZixhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxFQUFFLEdBQUc7QUFDbkMsWUFBTSxPQUFPLE1BQU0sQ0FBQztBQUNwQixVQUFJQyxXQUFVO0FBQ2QsVUFBSSxPQUFPLElBQUksR0FBRztBQUNkLFlBQUksQ0FBQyxhQUFhLEtBQUs7QUFDbkIsZ0JBQU0sS0FBSyxFQUFFO0FBQ2pCLHlCQUFpQixLQUFLLE9BQU8sS0FBSyxlQUFlLFNBQVM7QUFDMUQsWUFBSSxLQUFLO0FBQ0wsVUFBQUEsV0FBVSxLQUFLO0FBQUEsTUFDdkIsV0FDUyxPQUFPLElBQUksR0FBRztBQUNuQixjQUFNLEtBQUssT0FBTyxLQUFLLEdBQUcsSUFBSSxLQUFLLE1BQU07QUFDekMsWUFBSSxJQUFJO0FBQ0osY0FBSSxDQUFDLGFBQWEsR0FBRztBQUNqQixrQkFBTSxLQUFLLEVBQUU7QUFDakIsMkJBQWlCLEtBQUssT0FBTyxHQUFHLGVBQWUsU0FBUztBQUFBLFFBQzVEO0FBQUEsTUFDSjtBQUNBLGtCQUFZO0FBQ1osVUFBSUMsT0FBTSxVQUFVLE1BQU0sU0FBUyxNQUFPRCxXQUFVLE1BQU8sTUFBTyxZQUFZLElBQUs7QUFDbkYsVUFBSUE7QUFDQSxRQUFBQyxRQUFPLFlBQVlBLE1BQUssWUFBWSxjQUFjRCxRQUFPLENBQUM7QUFDOUQsVUFBSSxhQUFhQTtBQUNiLG9CQUFZO0FBQ2hCLFlBQU0sS0FBSyxrQkFBa0JDLElBQUc7QUFBQSxJQUNwQztBQUNBLFFBQUk7QUFDSixRQUFJLE1BQU0sV0FBVyxHQUFHO0FBQ3BCLFlBQU0sVUFBVSxRQUFRLFVBQVU7QUFBQSxJQUN0QyxPQUNLO0FBQ0QsWUFBTSxNQUFNLENBQUM7QUFDYixlQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxFQUFFLEdBQUc7QUFDbkMsY0FBTSxPQUFPLE1BQU0sQ0FBQztBQUNwQixlQUFPLE9BQU87QUFBQSxFQUFLRixPQUFNLEdBQUcsSUFBSSxLQUFLO0FBQUEsTUFDekM7QUFBQSxJQUNKO0FBQ0EsUUFBSSxTQUFTO0FBQ1QsYUFBTyxPQUFPLGNBQWMsY0FBYyxPQUFPLEdBQUdBLE9BQU07QUFDMUQsVUFBSTtBQUNBLGtCQUFVO0FBQUEsSUFDbEIsV0FDUyxhQUFhO0FBQ2xCLGtCQUFZO0FBQ2hCLFdBQU87QUFBQSxFQUNYO0FBQ0EsV0FBUyx3QkFBd0IsRUFBRSxNQUFNLEdBQUcsS0FBSyxFQUFFLFdBQVcsV0FBVyxHQUFHO0FBQ3hFLFVBQU0sRUFBRSxRQUFBQSxTQUFRLFlBQVksdUJBQXVCLFdBQVcsU0FBUyxFQUFFLGNBQWMsRUFBRSxJQUFJO0FBQzdGLGtCQUFjO0FBQ2QsVUFBTSxVQUFVLE9BQU8sT0FBTyxDQUFDLEdBQUcsS0FBSztBQUFBLE1BQ25DLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQSxNQUNSLE1BQU07QUFBQSxJQUNWLENBQUM7QUFDRCxRQUFJLGFBQWE7QUFDakIsUUFBSSxlQUFlO0FBQ25CLFVBQU0sUUFBUSxDQUFDO0FBQ2YsYUFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLFFBQVEsRUFBRSxHQUFHO0FBQ25DLFlBQU0sT0FBTyxNQUFNLENBQUM7QUFDcEIsVUFBSSxVQUFVO0FBQ2QsVUFBSSxPQUFPLElBQUksR0FBRztBQUNkLFlBQUksS0FBSztBQUNMLGdCQUFNLEtBQUssRUFBRTtBQUNqQix5QkFBaUIsS0FBSyxPQUFPLEtBQUssZUFBZSxLQUFLO0FBQ3RELFlBQUksS0FBSztBQUNMLG9CQUFVLEtBQUs7QUFBQSxNQUN2QixXQUNTLE9BQU8sSUFBSSxHQUFHO0FBQ25CLGNBQU0sS0FBSyxPQUFPLEtBQUssR0FBRyxJQUFJLEtBQUssTUFBTTtBQUN6QyxZQUFJLElBQUk7QUFDSixjQUFJLEdBQUc7QUFDSCxrQkFBTSxLQUFLLEVBQUU7QUFDakIsMkJBQWlCLEtBQUssT0FBTyxHQUFHLGVBQWUsS0FBSztBQUNwRCxjQUFJLEdBQUc7QUFDSCx5QkFBYTtBQUFBLFFBQ3JCO0FBQ0EsY0FBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLElBQUksS0FBSyxRQUFRO0FBQzdDLFlBQUksSUFBSTtBQUNKLGNBQUksR0FBRztBQUNILHNCQUFVLEdBQUc7QUFDakIsY0FBSSxHQUFHO0FBQ0gseUJBQWE7QUFBQSxRQUNyQixXQUNTLEtBQUssU0FBUyxRQUFRLElBQUksU0FBUztBQUN4QyxvQkFBVSxHQUFHO0FBQUEsUUFDakI7QUFBQSxNQUNKO0FBQ0EsVUFBSTtBQUNBLHFCQUFhO0FBQ2pCLFVBQUksTUFBTSxVQUFVLE1BQU0sU0FBUyxNQUFPLFVBQVUsSUFBSztBQUN6RCxxQkFBZSxhQUFhLE1BQU0sU0FBUyxnQkFBZ0IsSUFBSSxTQUFTLElBQUk7QUFDNUUsVUFBSSxJQUFJLE1BQU0sU0FBUyxHQUFHO0FBQ3RCLGVBQU87QUFBQSxNQUNYLFdBQ1MsSUFBSSxRQUFRLGVBQWU7QUFDaEMsWUFBSSxJQUFJLFFBQVEsWUFBWSxHQUFHO0FBQzNCLHlCQUFlLGFBQWEsTUFBTSxPQUFPLENBQUMsS0FBSyxTQUFTLE1BQU0sS0FBSyxTQUFTLEdBQUcsQ0FBQyxLQUMzRSxJQUFJLFNBQVMsS0FDZCxJQUFJLFFBQVE7QUFBQSxRQUNwQjtBQUNBLFlBQUksWUFBWTtBQUNaLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0o7QUFDQSxVQUFJO0FBQ0EsZUFBTyxZQUFZLEtBQUssWUFBWSxjQUFjLE9BQU8sQ0FBQztBQUM5RCxZQUFNLEtBQUssR0FBRztBQUNkLHFCQUFlLE1BQU07QUFBQSxJQUN6QjtBQUNBLFVBQU0sRUFBRSxPQUFPLElBQUksSUFBSTtBQUN2QixRQUFJLE1BQU0sV0FBVyxHQUFHO0FBQ3BCLGFBQU8sUUFBUTtBQUFBLElBQ25CLE9BQ0s7QUFDRCxVQUFJLENBQUMsWUFBWTtBQUNiLGNBQU0sTUFBTSxNQUFNLE9BQU8sQ0FBQyxLQUFLLFNBQVMsTUFBTSxLQUFLLFNBQVMsR0FBRyxDQUFDO0FBQ2hFLHFCQUFhLElBQUksUUFBUSxZQUFZLEtBQUssTUFBTSxJQUFJLFFBQVE7QUFBQSxNQUNoRTtBQUNBLFVBQUksWUFBWTtBQUNaLFlBQUksTUFBTTtBQUNWLG1CQUFXLFFBQVE7QUFDZixpQkFBTyxPQUFPO0FBQUEsRUFBSyxVQUFVLEdBQUdBLE9BQU0sR0FBRyxJQUFJLEtBQUs7QUFDdEQsZUFBTyxHQUFHLEdBQUc7QUFBQSxFQUFLQSxPQUFNLEdBQUcsR0FBRztBQUFBLE1BQ2xDLE9BQ0s7QUFDRCxlQUFPLEdBQUcsS0FBSyxHQUFHLFNBQVMsR0FBRyxNQUFNLEtBQUssR0FBRyxDQUFDLEdBQUcsU0FBUyxHQUFHLEdBQUc7QUFBQSxNQUNuRTtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0EsV0FBUyxpQkFBaUIsRUFBRSxRQUFBQSxTQUFRLFNBQVMsRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLFNBQVMsV0FBVztBQUN6RixRQUFJLFdBQVc7QUFDWCxnQkFBVSxRQUFRLFFBQVEsUUFBUSxFQUFFO0FBQ3hDLFFBQUksU0FBUztBQUNULFlBQU0sS0FBSyxjQUFjLGNBQWMsT0FBTyxHQUFHQSxPQUFNO0FBQ3ZELFlBQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQztBQUFBLElBQzdCO0FBQUEsRUFDSjs7O0FDL0lBLFdBQVMsU0FBUyxPQUFPLEtBQUs7QUFDMUIsVUFBTSxJQUFJLFNBQVMsR0FBRyxJQUFJLElBQUksUUFBUTtBQUN0QyxlQUFXRyxPQUFNLE9BQU87QUFDcEIsVUFBSSxPQUFPQSxHQUFFLEdBQUc7QUFDWixZQUFJQSxJQUFHLFFBQVEsT0FBT0EsSUFBRyxRQUFRO0FBQzdCLGlCQUFPQTtBQUNYLFlBQUksU0FBU0EsSUFBRyxHQUFHLEtBQUtBLElBQUcsSUFBSSxVQUFVO0FBQ3JDLGlCQUFPQTtBQUFBLE1BQ2Y7QUFBQSxJQUNKO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFDQSxNQUFNLFVBQU4sY0FBc0IsV0FBVztBQUFBLElBQzdCLFdBQVcsVUFBVTtBQUNqQixhQUFPO0FBQUEsSUFDWDtBQUFBLElBQ0EsWUFBWUMsU0FBUTtBQUNoQixZQUFNLEtBQUtBLE9BQU07QUFDakIsV0FBSyxRQUFRLENBQUM7QUFBQSxJQUNsQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLQSxPQUFPLEtBQUtBLFNBQVEsS0FBSyxLQUFLO0FBQzFCLFlBQU0sRUFBRSxlQUFlLFNBQVMsSUFBSTtBQUNwQyxZQUFNQyxPQUFNLElBQUksS0FBS0QsT0FBTTtBQUMzQixZQUFNLE1BQU0sQ0FBQyxLQUFLLFVBQVU7QUFDeEIsWUFBSSxPQUFPLGFBQWE7QUFDcEIsa0JBQVEsU0FBUyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQUEsaUJBQ2hDLE1BQU0sUUFBUSxRQUFRLEtBQUssQ0FBQyxTQUFTLFNBQVMsR0FBRztBQUN0RDtBQUNKLFlBQUksVUFBVSxVQUFhO0FBQ3ZCLFVBQUFDLEtBQUksTUFBTSxLQUFLLFdBQVcsS0FBSyxPQUFPLEdBQUcsQ0FBQztBQUFBLE1BQ2xEO0FBQ0EsVUFBSSxlQUFlLEtBQUs7QUFDcEIsbUJBQVcsQ0FBQyxLQUFLLEtBQUssS0FBSztBQUN2QixjQUFJLEtBQUssS0FBSztBQUFBLE1BQ3RCLFdBQ1MsT0FBTyxPQUFPLFFBQVEsVUFBVTtBQUNyQyxtQkFBVyxPQUFPLE9BQU8sS0FBSyxHQUFHO0FBQzdCLGNBQUksS0FBSyxJQUFJLEdBQUcsQ0FBQztBQUFBLE1BQ3pCO0FBQ0EsVUFBSSxPQUFPRCxRQUFPLG1CQUFtQixZQUFZO0FBQzdDLFFBQUFDLEtBQUksTUFBTSxLQUFLRCxRQUFPLGNBQWM7QUFBQSxNQUN4QztBQUNBLGFBQU9DO0FBQUEsSUFDWDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBT0EsSUFBSSxNQUFNLFdBQVc7QUFDakIsVUFBSTtBQUNKLFVBQUksT0FBTyxJQUFJO0FBQ1gsZ0JBQVE7QUFBQSxlQUNILENBQUMsUUFBUSxPQUFPLFNBQVMsWUFBWSxFQUFFLFNBQVMsT0FBTztBQUU1RCxnQkFBUSxJQUFJLEtBQUssTUFBTSxNQUFNLEtBQUs7QUFBQSxNQUN0QztBQUVJLGdCQUFRLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ3pDLFlBQU0sT0FBTyxTQUFTLEtBQUssT0FBTyxNQUFNLEdBQUc7QUFDM0MsWUFBTSxjQUFjLEtBQUssUUFBUTtBQUNqQyxVQUFJLE1BQU07QUFDTixZQUFJLENBQUM7QUFDRCxnQkFBTSxJQUFJLE1BQU0sT0FBTyxNQUFNLEdBQUcsY0FBYztBQUVsRCxZQUFJLFNBQVMsS0FBSyxLQUFLLEtBQUssY0FBYyxNQUFNLEtBQUs7QUFDakQsZUFBSyxNQUFNLFFBQVEsTUFBTTtBQUFBO0FBRXpCLGVBQUssUUFBUSxNQUFNO0FBQUEsTUFDM0IsV0FDUyxhQUFhO0FBQ2xCLGNBQU0sSUFBSSxLQUFLLE1BQU0sVUFBVSxVQUFRLFlBQVksT0FBTyxJQUFJLElBQUksQ0FBQztBQUNuRSxZQUFJLE1BQU07QUFDTixlQUFLLE1BQU0sS0FBSyxLQUFLO0FBQUE7QUFFckIsZUFBSyxNQUFNLE9BQU8sR0FBRyxHQUFHLEtBQUs7QUFBQSxNQUNyQyxPQUNLO0FBQ0QsYUFBSyxNQUFNLEtBQUssS0FBSztBQUFBLE1BQ3pCO0FBQUEsSUFDSjtBQUFBLElBQ0EsT0FBTyxLQUFLO0FBQ1IsWUFBTUYsTUFBSyxTQUFTLEtBQUssT0FBTyxHQUFHO0FBQ25DLFVBQUksQ0FBQ0E7QUFDRCxlQUFPO0FBQ1gsWUFBTSxNQUFNLEtBQUssTUFBTSxPQUFPLEtBQUssTUFBTSxRQUFRQSxHQUFFLEdBQUcsQ0FBQztBQUN2RCxhQUFPLElBQUksU0FBUztBQUFBLElBQ3hCO0FBQUEsSUFDQSxJQUFJLEtBQUssWUFBWTtBQUNqQixZQUFNQSxNQUFLLFNBQVMsS0FBSyxPQUFPLEdBQUc7QUFDbkMsWUFBTSxPQUFPQSxLQUFJO0FBQ2pCLGNBQVEsQ0FBQyxjQUFjLFNBQVMsSUFBSSxJQUFJLEtBQUssUUFBUSxTQUFTO0FBQUEsSUFDbEU7QUFBQSxJQUNBLElBQUksS0FBSztBQUNMLGFBQU8sQ0FBQyxDQUFDLFNBQVMsS0FBSyxPQUFPLEdBQUc7QUFBQSxJQUNyQztBQUFBLElBQ0EsSUFBSSxLQUFLLE9BQU87QUFDWixXQUFLLElBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxHQUFHLElBQUk7QUFBQSxJQUN2QztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQU1BLE9BQU8sR0FBRyxLQUFLLE1BQU07QUFDakIsWUFBTUUsT0FBTSxPQUFPLElBQUksS0FBSyxJQUFJLEtBQUssV0FBVyxvQkFBSSxJQUFJLElBQUksQ0FBQztBQUM3RCxVQUFJLEtBQUs7QUFDTCxZQUFJLFNBQVNBLElBQUc7QUFDcEIsaUJBQVcsUUFBUSxLQUFLO0FBQ3BCLHVCQUFlLEtBQUtBLE1BQUssSUFBSTtBQUNqQyxhQUFPQTtBQUFBLElBQ1g7QUFBQSxJQUNBLFNBQVMsS0FBSyxXQUFXLGFBQWE7QUFDbEMsVUFBSSxDQUFDO0FBQ0QsZUFBTyxLQUFLLFVBQVUsSUFBSTtBQUM5QixpQkFBVyxRQUFRLEtBQUssT0FBTztBQUMzQixZQUFJLENBQUMsT0FBTyxJQUFJO0FBQ1osZ0JBQU0sSUFBSSxNQUFNLHNDQUFzQyxLQUFLLFVBQVUsSUFBSSxDQUFDLFVBQVU7QUFBQSxNQUM1RjtBQUNBLFVBQUksQ0FBQyxJQUFJLGlCQUFpQixLQUFLLGlCQUFpQixLQUFLO0FBQ2pELGNBQU0sT0FBTyxPQUFPLENBQUMsR0FBRyxLQUFLLEVBQUUsZUFBZSxLQUFLLENBQUM7QUFDeEQsYUFBTyxvQkFBb0IsTUFBTSxLQUFLO0FBQUEsUUFDbEMsaUJBQWlCO0FBQUEsUUFDakIsV0FBVyxFQUFFLE9BQU8sS0FBSyxLQUFLLElBQUk7QUFBQSxRQUNsQyxZQUFZLElBQUksVUFBVTtBQUFBLFFBQzFCO0FBQUEsUUFDQTtBQUFBLE1BQ0osQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKOzs7QUMxSUEsTUFBTSxNQUFNO0FBQUEsSUFDUixZQUFZO0FBQUEsSUFDWixTQUFTO0FBQUEsSUFDVCxXQUFXO0FBQUEsSUFDWCxLQUFLO0FBQUEsSUFDTCxRQUFRQyxNQUFLLFNBQVM7QUFDbEIsVUFBSSxDQUFDLE1BQU1BLElBQUc7QUFDVixnQkFBUSxpQ0FBaUM7QUFDN0MsYUFBT0E7QUFBQSxJQUNYO0FBQUEsSUFDQSxZQUFZLENBQUNDLFNBQVEsS0FBSyxRQUFRLFFBQVEsS0FBS0EsU0FBUSxLQUFLLEdBQUc7QUFBQSxFQUNuRTs7O0FDUEEsTUFBTSxVQUFOLGNBQXNCLFdBQVc7QUFBQSxJQUM3QixXQUFXLFVBQVU7QUFDakIsYUFBTztBQUFBLElBQ1g7QUFBQSxJQUNBLFlBQVlDLFNBQVE7QUFDaEIsWUFBTSxLQUFLQSxPQUFNO0FBQ2pCLFdBQUssUUFBUSxDQUFDO0FBQUEsSUFDbEI7QUFBQSxJQUNBLElBQUksT0FBTztBQUNQLFdBQUssTUFBTSxLQUFLLEtBQUs7QUFBQSxJQUN6QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVNBLE9BQU8sS0FBSztBQUNSLFlBQU0sTUFBTSxZQUFZLEdBQUc7QUFDM0IsVUFBSSxPQUFPLFFBQVE7QUFDZixlQUFPO0FBQ1gsWUFBTSxNQUFNLEtBQUssTUFBTSxPQUFPLEtBQUssQ0FBQztBQUNwQyxhQUFPLElBQUksU0FBUztBQUFBLElBQ3hCO0FBQUEsSUFDQSxJQUFJLEtBQUssWUFBWTtBQUNqQixZQUFNLE1BQU0sWUFBWSxHQUFHO0FBQzNCLFVBQUksT0FBTyxRQUFRO0FBQ2YsZUFBTztBQUNYLFlBQU1DLE1BQUssS0FBSyxNQUFNLEdBQUc7QUFDekIsYUFBTyxDQUFDLGNBQWMsU0FBU0EsR0FBRSxJQUFJQSxJQUFHLFFBQVFBO0FBQUEsSUFDcEQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQU9BLElBQUksS0FBSztBQUNMLFlBQU0sTUFBTSxZQUFZLEdBQUc7QUFDM0IsYUFBTyxPQUFPLFFBQVEsWUFBWSxNQUFNLEtBQUssTUFBTTtBQUFBLElBQ3ZEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVFBLElBQUksS0FBSyxPQUFPO0FBQ1osWUFBTSxNQUFNLFlBQVksR0FBRztBQUMzQixVQUFJLE9BQU8sUUFBUTtBQUNmLGNBQU0sSUFBSSxNQUFNLCtCQUErQixHQUFHLEdBQUc7QUFDekQsWUFBTSxPQUFPLEtBQUssTUFBTSxHQUFHO0FBQzNCLFVBQUksU0FBUyxJQUFJLEtBQUssY0FBYyxLQUFLO0FBQ3JDLGFBQUssUUFBUTtBQUFBO0FBRWIsYUFBSyxNQUFNLEdBQUcsSUFBSTtBQUFBLElBQzFCO0FBQUEsSUFDQSxPQUFPLEdBQUcsS0FBSztBQUNYLFlBQU1DLE9BQU0sQ0FBQztBQUNiLFVBQUksS0FBSztBQUNMLFlBQUksU0FBU0EsSUFBRztBQUNwQixVQUFJLElBQUk7QUFDUixpQkFBVyxRQUFRLEtBQUs7QUFDcEIsUUFBQUEsS0FBSSxLQUFLLEtBQUssTUFBTSxPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDekMsYUFBT0E7QUFBQSxJQUNYO0FBQUEsSUFDQSxTQUFTLEtBQUssV0FBVyxhQUFhO0FBQ2xDLFVBQUksQ0FBQztBQUNELGVBQU8sS0FBSyxVQUFVLElBQUk7QUFDOUIsYUFBTyxvQkFBb0IsTUFBTSxLQUFLO0FBQUEsUUFDbEMsaUJBQWlCO0FBQUEsUUFDakIsV0FBVyxFQUFFLE9BQU8sS0FBSyxLQUFLLElBQUk7QUFBQSxRQUNsQyxhQUFhLElBQUksVUFBVSxNQUFNO0FBQUEsUUFDakM7QUFBQSxRQUNBO0FBQUEsTUFDSixDQUFDO0FBQUEsSUFDTDtBQUFBLElBQ0EsT0FBTyxLQUFLRixTQUFRLEtBQUssS0FBSztBQUMxQixZQUFNLEVBQUUsU0FBUyxJQUFJO0FBQ3JCLFlBQU1FLE9BQU0sSUFBSSxLQUFLRixPQUFNO0FBQzNCLFVBQUksT0FBTyxPQUFPLFlBQVksT0FBTyxHQUFHLEdBQUc7QUFDdkMsWUFBSSxJQUFJO0FBQ1IsaUJBQVNDLE9BQU0sS0FBSztBQUNoQixjQUFJLE9BQU8sYUFBYSxZQUFZO0FBQ2hDLGtCQUFNLE1BQU0sZUFBZSxNQUFNQSxNQUFLLE9BQU8sR0FBRztBQUNoRCxZQUFBQSxNQUFLLFNBQVMsS0FBSyxLQUFLLEtBQUtBLEdBQUU7QUFBQSxVQUNuQztBQUNBLFVBQUFDLEtBQUksTUFBTSxLQUFLLFdBQVdELEtBQUksUUFBVyxHQUFHLENBQUM7QUFBQSxRQUNqRDtBQUFBLE1BQ0o7QUFDQSxhQUFPQztBQUFBLElBQ1g7QUFBQSxFQUNKO0FBQ0EsV0FBUyxZQUFZLEtBQUs7QUFDdEIsUUFBSSxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksUUFBUTtBQUN0QyxRQUFJLE9BQU8sT0FBTyxRQUFRO0FBQ3RCLFlBQU0sT0FBTyxHQUFHO0FBQ3BCLFdBQU8sT0FBTyxRQUFRLFlBQVksT0FBTyxVQUFVLEdBQUcsS0FBSyxPQUFPLElBQzVELE1BQ0E7QUFBQSxFQUNWOzs7QUMzR0EsTUFBTSxNQUFNO0FBQUEsSUFDUixZQUFZO0FBQUEsSUFDWixTQUFTO0FBQUEsSUFDVCxXQUFXO0FBQUEsSUFDWCxLQUFLO0FBQUEsSUFDTCxRQUFRQyxNQUFLLFNBQVM7QUFDbEIsVUFBSSxDQUFDLE1BQU1BLElBQUc7QUFDVixnQkFBUSxrQ0FBa0M7QUFDOUMsYUFBT0E7QUFBQSxJQUNYO0FBQUEsSUFDQSxZQUFZLENBQUNDLFNBQVEsS0FBSyxRQUFRLFFBQVEsS0FBS0EsU0FBUSxLQUFLLEdBQUc7QUFBQSxFQUNuRTs7O0FDWkEsTUFBTSxTQUFTO0FBQUEsSUFDWCxVQUFVLFdBQVMsT0FBTyxVQUFVO0FBQUEsSUFDcEMsU0FBUztBQUFBLElBQ1QsS0FBSztBQUFBLElBQ0wsU0FBUyxTQUFPO0FBQUEsSUFDaEIsVUFBVSxNQUFNLEtBQUssV0FBVyxhQUFhO0FBQ3pDLFlBQU0sT0FBTyxPQUFPLEVBQUUsY0FBYyxLQUFLLEdBQUcsR0FBRztBQUMvQyxhQUFPLGdCQUFnQixNQUFNLEtBQUssV0FBVyxXQUFXO0FBQUEsSUFDNUQ7QUFBQSxFQUNKOzs7QUNUQSxNQUFNLFVBQVU7QUFBQSxJQUNaLFVBQVUsV0FBUyxTQUFTO0FBQUEsSUFDNUIsWUFBWSxNQUFNLElBQUksT0FBTyxJQUFJO0FBQUEsSUFDakMsU0FBUztBQUFBLElBQ1QsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sU0FBUyxNQUFNLElBQUksT0FBTyxJQUFJO0FBQUEsSUFDOUIsV0FBVyxDQUFDLEVBQUUsT0FBTyxHQUFHLFFBQVEsT0FBTyxXQUFXLFlBQVksUUFBUSxLQUFLLEtBQUssTUFBTSxJQUNoRixTQUNBLElBQUksUUFBUTtBQUFBLEVBQ3RCOzs7QUNWQSxNQUFNLFVBQVU7QUFBQSxJQUNaLFVBQVUsV0FBUyxPQUFPLFVBQVU7QUFBQSxJQUNwQyxTQUFTO0FBQUEsSUFDVCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixTQUFTLFNBQU8sSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRztBQUFBLElBQzNELFVBQVUsRUFBRSxRQUFRLE1BQU0sR0FBRyxLQUFLO0FBQzlCLFVBQUksVUFBVSxRQUFRLEtBQUssS0FBSyxNQUFNLEdBQUc7QUFDckMsY0FBTSxLQUFLLE9BQU8sQ0FBQyxNQUFNLE9BQU8sT0FBTyxDQUFDLE1BQU07QUFDOUMsWUFBSSxVQUFVO0FBQ1YsaUJBQU87QUFBQSxNQUNmO0FBQ0EsYUFBTyxRQUFRLElBQUksUUFBUSxVQUFVLElBQUksUUFBUTtBQUFBLElBQ3JEO0FBQUEsRUFDSjs7O0FDaEJBLFdBQVMsZ0JBQWdCLEVBQUUsUUFBUSxtQkFBbUIsS0FBSyxNQUFNLEdBQUc7QUFDaEUsUUFBSSxPQUFPLFVBQVU7QUFDakIsYUFBTyxPQUFPLEtBQUs7QUFDdkIsVUFBTSxNQUFNLE9BQU8sVUFBVSxXQUFXLFFBQVEsT0FBTyxLQUFLO0FBQzVELFFBQUksQ0FBQyxTQUFTLEdBQUc7QUFDYixhQUFPLE1BQU0sR0FBRyxJQUFJLFNBQVMsTUFBTSxJQUFJLFVBQVU7QUFDckQsUUFBSSxJQUFJLE9BQU8sR0FBRyxPQUFPLEVBQUUsSUFBSSxPQUFPLEtBQUssVUFBVSxLQUFLO0FBQzFELFFBQUksQ0FBQyxVQUNELHNCQUNDLENBQUMsT0FBTyxRQUFRLDhCQUNqQixRQUFRLEtBQUssQ0FBQyxLQUNkLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNsQixVQUFJLElBQUksRUFBRSxRQUFRLEdBQUc7QUFDckIsVUFBSSxJQUFJLEdBQUc7QUFDUCxZQUFJLEVBQUU7QUFDTixhQUFLO0FBQUEsTUFDVDtBQUNBLFVBQUksSUFBSSxxQkFBcUIsRUFBRSxTQUFTLElBQUk7QUFDNUMsYUFBTyxNQUFNO0FBQ1QsYUFBSztBQUFBLElBQ2I7QUFDQSxXQUFPO0FBQUEsRUFDWDs7O0FDbkJBLE1BQU0sV0FBVztBQUFBLElBQ2IsVUFBVSxXQUFTLE9BQU8sVUFBVTtBQUFBLElBQ3BDLFNBQVM7QUFBQSxJQUNULEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFNBQVMsU0FBTyxJQUFJLE1BQU0sRUFBRSxFQUFFLFlBQVksTUFBTSxRQUMxQyxNQUNBLElBQUksQ0FBQyxNQUFNLE1BQ1AsT0FBTyxvQkFDUCxPQUFPO0FBQUEsSUFDakIsV0FBVztBQUFBLEVBQ2Y7QUFDQSxNQUFNLFdBQVc7QUFBQSxJQUNiLFVBQVUsV0FBUyxPQUFPLFVBQVU7QUFBQSxJQUNwQyxTQUFTO0FBQUEsSUFDVCxLQUFLO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixNQUFNO0FBQUEsSUFDTixTQUFTLFNBQU8sV0FBVyxHQUFHO0FBQUEsSUFDOUIsVUFBVSxNQUFNO0FBQ1osWUFBTSxNQUFNLE9BQU8sS0FBSyxLQUFLO0FBQzdCLGFBQU8sU0FBUyxHQUFHLElBQUksSUFBSSxjQUFjLElBQUksZ0JBQWdCLElBQUk7QUFBQSxJQUNyRTtBQUFBLEVBQ0o7QUFDQSxNQUFNLFFBQVE7QUFBQSxJQUNWLFVBQVUsV0FBUyxPQUFPLFVBQVU7QUFBQSxJQUNwQyxTQUFTO0FBQUEsSUFDVCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixRQUFRLEtBQUs7QUFDVCxZQUFNLE9BQU8sSUFBSSxPQUFPLFdBQVcsR0FBRyxDQUFDO0FBQ3ZDLFlBQU0sTUFBTSxJQUFJLFFBQVEsR0FBRztBQUMzQixVQUFJLFFBQVEsTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDLE1BQU07QUFDdEMsYUFBSyxvQkFBb0IsSUFBSSxTQUFTLE1BQU07QUFDaEQsYUFBTztBQUFBLElBQ1g7QUFBQSxJQUNBLFdBQVc7QUFBQSxFQUNmOzs7QUN0Q0EsTUFBTSxjQUFjLENBQUMsVUFBVSxPQUFPLFVBQVUsWUFBWSxPQUFPLFVBQVUsS0FBSztBQUNsRixNQUFNLGFBQWEsQ0FBQyxLQUFLLFFBQVEsT0FBTyxFQUFFLFlBQVksTUFBTyxjQUFjLE9BQU8sR0FBRyxJQUFJLFNBQVMsSUFBSSxVQUFVLE1BQU0sR0FBRyxLQUFLO0FBQzlILFdBQVMsYUFBYSxNQUFNLE9BQU8sUUFBUTtBQUN2QyxVQUFNLEVBQUUsTUFBTSxJQUFJO0FBQ2xCLFFBQUksWUFBWSxLQUFLLEtBQUssU0FBUztBQUMvQixhQUFPLFNBQVMsTUFBTSxTQUFTLEtBQUs7QUFDeEMsV0FBTyxnQkFBZ0IsSUFBSTtBQUFBLEVBQy9CO0FBQ0EsTUFBTSxTQUFTO0FBQUEsSUFDWCxVQUFVLFdBQVMsWUFBWSxLQUFLLEtBQUssU0FBUztBQUFBLElBQ2xELFNBQVM7QUFBQSxJQUNULEtBQUs7QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLE1BQU07QUFBQSxJQUNOLFNBQVMsQ0FBQyxLQUFLLFVBQVUsUUFBUSxXQUFXLEtBQUssR0FBRyxHQUFHLEdBQUc7QUFBQSxJQUMxRCxXQUFXLFVBQVEsYUFBYSxNQUFNLEdBQUcsSUFBSTtBQUFBLEVBQ2pEO0FBQ0EsTUFBTSxNQUFNO0FBQUEsSUFDUixVQUFVO0FBQUEsSUFDVixTQUFTO0FBQUEsSUFDVCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixTQUFTLENBQUMsS0FBSyxVQUFVLFFBQVEsV0FBVyxLQUFLLEdBQUcsSUFBSSxHQUFHO0FBQUEsSUFDM0QsV0FBVztBQUFBLEVBQ2Y7QUFDQSxNQUFNLFNBQVM7QUFBQSxJQUNYLFVBQVUsV0FBUyxZQUFZLEtBQUssS0FBSyxTQUFTO0FBQUEsSUFDbEQsU0FBUztBQUFBLElBQ1QsS0FBSztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sU0FBUyxDQUFDLEtBQUssVUFBVSxRQUFRLFdBQVcsS0FBSyxHQUFHLElBQUksR0FBRztBQUFBLElBQzNELFdBQVcsVUFBUSxhQUFhLE1BQU0sSUFBSSxJQUFJO0FBQUEsRUFDbEQ7OztBQzNCQSxNQUFNLFNBQVM7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0o7OztBQ2hCQSxXQUFTQyxhQUFZLE9BQU87QUFDeEIsV0FBTyxPQUFPLFVBQVUsWUFBWSxPQUFPLFVBQVUsS0FBSztBQUFBLEVBQzlEO0FBQ0EsTUFBTSxnQkFBZ0IsQ0FBQyxFQUFFLE1BQU0sTUFBTSxLQUFLLFVBQVUsS0FBSztBQUN6RCxNQUFNLGNBQWM7QUFBQSxJQUNoQjtBQUFBLE1BQ0ksVUFBVSxXQUFTLE9BQU8sVUFBVTtBQUFBLE1BQ3BDLFNBQVM7QUFBQSxNQUNULEtBQUs7QUFBQSxNQUNMLFNBQVMsU0FBTztBQUFBLE1BQ2hCLFdBQVc7QUFBQSxJQUNmO0FBQUEsSUFDQTtBQUFBLE1BQ0ksVUFBVSxXQUFTLFNBQVM7QUFBQSxNQUM1QixZQUFZLE1BQU0sSUFBSSxPQUFPLElBQUk7QUFBQSxNQUNqQyxTQUFTO0FBQUEsTUFDVCxLQUFLO0FBQUEsTUFDTCxNQUFNO0FBQUEsTUFDTixTQUFTLE1BQU07QUFBQSxNQUNmLFdBQVc7QUFBQSxJQUNmO0FBQUEsSUFDQTtBQUFBLE1BQ0ksVUFBVSxXQUFTLE9BQU8sVUFBVTtBQUFBLE1BQ3BDLFNBQVM7QUFBQSxNQUNULEtBQUs7QUFBQSxNQUNMLE1BQU07QUFBQSxNQUNOLFNBQVMsU0FBTyxRQUFRO0FBQUEsTUFDeEIsV0FBVztBQUFBLElBQ2Y7QUFBQSxJQUNBO0FBQUEsTUFDSSxVQUFVQTtBQUFBLE1BQ1YsU0FBUztBQUFBLE1BQ1QsS0FBSztBQUFBLE1BQ0wsTUFBTTtBQUFBLE1BQ04sU0FBUyxDQUFDLEtBQUssVUFBVSxFQUFFLFlBQVksTUFBTSxjQUFjLE9BQU8sR0FBRyxJQUFJLFNBQVMsS0FBSyxFQUFFO0FBQUEsTUFDekYsV0FBVyxDQUFDLEVBQUUsTUFBTSxNQUFNQSxhQUFZLEtBQUssSUFBSSxNQUFNLFNBQVMsSUFBSSxLQUFLLFVBQVUsS0FBSztBQUFBLElBQzFGO0FBQUEsSUFDQTtBQUFBLE1BQ0ksVUFBVSxXQUFTLE9BQU8sVUFBVTtBQUFBLE1BQ3BDLFNBQVM7QUFBQSxNQUNULEtBQUs7QUFBQSxNQUNMLE1BQU07QUFBQSxNQUNOLFNBQVMsU0FBTyxXQUFXLEdBQUc7QUFBQSxNQUM5QixXQUFXO0FBQUEsSUFDZjtBQUFBLEVBQ0o7QUFDQSxNQUFNLFlBQVk7QUFBQSxJQUNkLFNBQVM7QUFBQSxJQUNULEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFFBQVEsS0FBSyxTQUFTO0FBQ2xCLGNBQVEsMkJBQTJCLEtBQUssVUFBVSxHQUFHLENBQUMsRUFBRTtBQUN4RCxhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFDQSxNQUFNQyxVQUFTLENBQUMsS0FBSyxHQUFHLEVBQUUsT0FBTyxhQUFhLFNBQVM7OztBQ3hEdkQsTUFBTSxTQUFTO0FBQUEsSUFDWCxVQUFVLFdBQVMsaUJBQWlCO0FBQUE7QUFBQSxJQUNwQyxTQUFTO0FBQUEsSUFDVCxLQUFLO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBU0wsUUFBUSxLQUFLLFNBQVM7QUFDbEIsVUFBSSxPQUFPLFNBQVMsWUFBWTtBQUU1QixjQUFNLE1BQU0sS0FBSyxJQUFJLFFBQVEsV0FBVyxFQUFFLENBQUM7QUFDM0MsY0FBTSxTQUFTLElBQUksV0FBVyxJQUFJLE1BQU07QUFDeEMsaUJBQVMsSUFBSSxHQUFHLElBQUksSUFBSSxRQUFRLEVBQUU7QUFDOUIsaUJBQU8sQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFDO0FBQ2hDLGVBQU87QUFBQSxNQUNYLE9BQ0s7QUFDRCxnQkFBUSwwRkFBMEY7QUFDbEcsZUFBTztBQUFBLE1BQ1g7QUFBQSxJQUNKO0FBQUEsSUFDQSxVQUFVLEVBQUUsU0FBUyxNQUFNLE1BQU0sR0FBRyxLQUFLLFdBQVcsYUFBYTtBQUM3RCxVQUFJLENBQUM7QUFDRCxlQUFPO0FBQ1gsWUFBTSxNQUFNO0FBQ1osVUFBSTtBQUNKLFVBQUksT0FBTyxTQUFTLFlBQVk7QUFDNUIsWUFBSSxJQUFJO0FBQ1IsaUJBQVMsSUFBSSxHQUFHLElBQUksSUFBSSxRQUFRLEVBQUU7QUFDOUIsZUFBSyxPQUFPLGFBQWEsSUFBSSxDQUFDLENBQUM7QUFDbkMsY0FBTSxLQUFLLENBQUM7QUFBQSxNQUNoQixPQUNLO0FBQ0QsY0FBTSxJQUFJLE1BQU0sMEZBQTBGO0FBQUEsTUFDOUc7QUFDQSxlQUFTLE9BQU8sT0FBTztBQUN2QixVQUFJLFNBQVMsT0FBTyxjQUFjO0FBQzlCLGNBQU0sWUFBWSxLQUFLLElBQUksSUFBSSxRQUFRLFlBQVksSUFBSSxPQUFPLFFBQVEsSUFBSSxRQUFRLGVBQWU7QUFDakcsY0FBTSxJQUFJLEtBQUssS0FBSyxJQUFJLFNBQVMsU0FBUztBQUMxQyxjQUFNLFFBQVEsSUFBSSxNQUFNLENBQUM7QUFDekIsaUJBQVMsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLEtBQUssV0FBVztBQUMvQyxnQkFBTSxDQUFDLElBQUksSUFBSSxPQUFPLEdBQUcsU0FBUztBQUFBLFFBQ3RDO0FBQ0EsY0FBTSxNQUFNLEtBQUssU0FBUyxPQUFPLGdCQUFnQixPQUFPLEdBQUc7QUFBQSxNQUMvRDtBQUNBLGFBQU8sZ0JBQWdCLEVBQUUsU0FBUyxNQUFNLE9BQU8sSUFBSSxHQUFHLEtBQUssV0FBVyxXQUFXO0FBQUEsSUFDckY7QUFBQSxFQUNKOzs7QUNsREEsV0FBUyxhQUFhQyxNQUFLLFNBQVM7QUFDaEMsUUFBSSxNQUFNQSxJQUFHLEdBQUc7QUFDWixlQUFTLElBQUksR0FBRyxJQUFJQSxLQUFJLE1BQU0sUUFBUSxFQUFFLEdBQUc7QUFDdkMsWUFBSSxPQUFPQSxLQUFJLE1BQU0sQ0FBQztBQUN0QixZQUFJLE9BQU8sSUFBSTtBQUNYO0FBQUEsaUJBQ0ssTUFBTSxJQUFJLEdBQUc7QUFDbEIsY0FBSSxLQUFLLE1BQU0sU0FBUztBQUNwQixvQkFBUSxnREFBZ0Q7QUFDNUQsZ0JBQU0sT0FBTyxLQUFLLE1BQU0sQ0FBQyxLQUFLLElBQUksS0FBSyxJQUFJLE9BQU8sSUFBSSxDQUFDO0FBQ3ZELGNBQUksS0FBSztBQUNMLGlCQUFLLElBQUksZ0JBQWdCLEtBQUssSUFBSSxnQkFDNUIsR0FBRyxLQUFLLGFBQWE7QUFBQSxFQUFLLEtBQUssSUFBSSxhQUFhLEtBQ2hELEtBQUs7QUFDZixjQUFJLEtBQUssU0FBUztBQUNkLGtCQUFNLEtBQUssS0FBSyxTQUFTLEtBQUs7QUFDOUIsZUFBRyxVQUFVLEdBQUcsVUFDVixHQUFHLEtBQUssT0FBTztBQUFBLEVBQUssR0FBRyxPQUFPLEtBQzlCLEtBQUs7QUFBQSxVQUNmO0FBQ0EsaUJBQU87QUFBQSxRQUNYO0FBQ0EsUUFBQUEsS0FBSSxNQUFNLENBQUMsSUFBSSxPQUFPLElBQUksSUFBSSxPQUFPLElBQUksS0FBSyxJQUFJO0FBQUEsTUFDdEQ7QUFBQSxJQUNKO0FBRUksY0FBUSxrQ0FBa0M7QUFDOUMsV0FBT0E7QUFBQSxFQUNYO0FBQ0EsV0FBUyxZQUFZQyxTQUFRLFVBQVUsS0FBSztBQUN4QyxVQUFNLEVBQUUsU0FBUyxJQUFJO0FBQ3JCLFVBQU1DLFNBQVEsSUFBSSxRQUFRRCxPQUFNO0FBQ2hDLElBQUFDLE9BQU0sTUFBTTtBQUNaLFFBQUksSUFBSTtBQUNSLFFBQUksWUFBWSxPQUFPLFlBQVksT0FBTyxRQUFRO0FBQzlDLGVBQVNDLE9BQU0sVUFBVTtBQUNyQixZQUFJLE9BQU8sYUFBYTtBQUNwQixVQUFBQSxNQUFLLFNBQVMsS0FBSyxVQUFVLE9BQU8sR0FBRyxHQUFHQSxHQUFFO0FBQ2hELFlBQUksS0FBSztBQUNULFlBQUksTUFBTSxRQUFRQSxHQUFFLEdBQUc7QUFDbkIsY0FBSUEsSUFBRyxXQUFXLEdBQUc7QUFDakIsa0JBQU1BLElBQUcsQ0FBQztBQUNWLG9CQUFRQSxJQUFHLENBQUM7QUFBQSxVQUNoQjtBQUVJLGtCQUFNLElBQUksVUFBVSxnQ0FBZ0NBLEdBQUUsRUFBRTtBQUFBLFFBQ2hFLFdBQ1NBLE9BQU1BLGVBQWMsUUFBUTtBQUNqQyxnQkFBTSxPQUFPLE9BQU8sS0FBS0EsR0FBRTtBQUMzQixjQUFJLEtBQUssV0FBVyxHQUFHO0FBQ25CLGtCQUFNLEtBQUssQ0FBQztBQUNaLG9CQUFRQSxJQUFHLEdBQUc7QUFBQSxVQUNsQixPQUNLO0FBQ0Qsa0JBQU0sSUFBSSxVQUFVLG9DQUFvQyxLQUFLLE1BQU0sT0FBTztBQUFBLFVBQzlFO0FBQUEsUUFDSixPQUNLO0FBQ0QsZ0JBQU1BO0FBQUEsUUFDVjtBQUNBLFFBQUFELE9BQU0sTUFBTSxLQUFLLFdBQVcsS0FBSyxPQUFPLEdBQUcsQ0FBQztBQUFBLE1BQ2hEO0FBQ0osV0FBT0E7QUFBQSxFQUNYO0FBQ0EsTUFBTSxRQUFRO0FBQUEsSUFDVixZQUFZO0FBQUEsSUFDWixTQUFTO0FBQUEsSUFDVCxLQUFLO0FBQUEsSUFDTCxTQUFTO0FBQUEsSUFDVCxZQUFZO0FBQUEsRUFDaEI7OztBQ3JFQSxNQUFNLFdBQU4sTUFBTSxrQkFBaUIsUUFBUTtBQUFBLElBQzNCLGNBQWM7QUFDVixZQUFNO0FBQ04sV0FBSyxNQUFNLFFBQVEsVUFBVSxJQUFJLEtBQUssSUFBSTtBQUMxQyxXQUFLLFNBQVMsUUFBUSxVQUFVLE9BQU8sS0FBSyxJQUFJO0FBQ2hELFdBQUssTUFBTSxRQUFRLFVBQVUsSUFBSSxLQUFLLElBQUk7QUFDMUMsV0FBSyxNQUFNLFFBQVEsVUFBVSxJQUFJLEtBQUssSUFBSTtBQUMxQyxXQUFLLE1BQU0sUUFBUSxVQUFVLElBQUksS0FBSyxJQUFJO0FBQzFDLFdBQUssTUFBTSxVQUFTO0FBQUEsSUFDeEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0EsT0FBTyxHQUFHLEtBQUs7QUFDWCxVQUFJLENBQUM7QUFDRCxlQUFPLE1BQU0sT0FBTyxDQUFDO0FBQ3pCLFlBQU1FLE9BQU0sb0JBQUksSUFBSTtBQUNwQixVQUFJLEtBQUs7QUFDTCxZQUFJLFNBQVNBLElBQUc7QUFDcEIsaUJBQVcsUUFBUSxLQUFLLE9BQU87QUFDM0IsWUFBSSxLQUFLO0FBQ1QsWUFBSSxPQUFPLElBQUksR0FBRztBQUNkLGdCQUFNLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRztBQUM1QixrQkFBUSxLQUFLLEtBQUssT0FBTyxLQUFLLEdBQUc7QUFBQSxRQUNyQyxPQUNLO0FBQ0QsZ0JBQU0sS0FBSyxNQUFNLElBQUksR0FBRztBQUFBLFFBQzVCO0FBQ0EsWUFBSUEsS0FBSSxJQUFJLEdBQUc7QUFDWCxnQkFBTSxJQUFJLE1BQU0sOENBQThDO0FBQ2xFLFFBQUFBLEtBQUksSUFBSSxLQUFLLEtBQUs7QUFBQSxNQUN0QjtBQUNBLGFBQU9BO0FBQUEsSUFDWDtBQUFBLElBQ0EsT0FBTyxLQUFLQyxTQUFRLFVBQVUsS0FBSztBQUMvQixZQUFNQyxTQUFRLFlBQVlELFNBQVEsVUFBVSxHQUFHO0FBQy9DLFlBQU1FLFFBQU8sSUFBSSxLQUFLO0FBQ3RCLE1BQUFBLE1BQUssUUFBUUQsT0FBTTtBQUNuQixhQUFPQztBQUFBLElBQ1g7QUFBQSxFQUNKO0FBQ0EsV0FBUyxNQUFNO0FBQ2YsTUFBTSxPQUFPO0FBQUEsSUFDVCxZQUFZO0FBQUEsSUFDWixVQUFVLFdBQVMsaUJBQWlCO0FBQUEsSUFDcEMsV0FBVztBQUFBLElBQ1gsU0FBUztBQUFBLElBQ1QsS0FBSztBQUFBLElBQ0wsUUFBUUMsTUFBSyxTQUFTO0FBQ2xCLFlBQU1GLFNBQVEsYUFBYUUsTUFBSyxPQUFPO0FBQ3ZDLFlBQU0sV0FBVyxDQUFDO0FBQ2xCLGlCQUFXLEVBQUUsSUFBSSxLQUFLRixPQUFNLE9BQU87QUFDL0IsWUFBSSxTQUFTLEdBQUcsR0FBRztBQUNmLGNBQUksU0FBUyxTQUFTLElBQUksS0FBSyxHQUFHO0FBQzlCLG9CQUFRLGlEQUFpRCxJQUFJLEtBQUssRUFBRTtBQUFBLFVBQ3hFLE9BQ0s7QUFDRCxxQkFBUyxLQUFLLElBQUksS0FBSztBQUFBLFVBQzNCO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFDQSxhQUFPLE9BQU8sT0FBTyxJQUFJLFNBQVMsR0FBR0EsTUFBSztBQUFBLElBQzlDO0FBQUEsSUFDQSxZQUFZLENBQUNELFNBQVEsVUFBVSxRQUFRLFNBQVMsS0FBS0EsU0FBUSxVQUFVLEdBQUc7QUFBQSxFQUM5RTs7O0FDckVBLFdBQVMsY0FBYyxFQUFFLE9BQU8sT0FBTyxHQUFHLEtBQUs7QUFDM0MsVUFBTSxVQUFVLFFBQVEsVUFBVTtBQUNsQyxRQUFJLFVBQVUsUUFBUSxLQUFLLEtBQUssTUFBTTtBQUNsQyxhQUFPO0FBQ1gsV0FBTyxRQUFRLElBQUksUUFBUSxVQUFVLElBQUksUUFBUTtBQUFBLEVBQ3JEO0FBQ0EsTUFBTSxVQUFVO0FBQUEsSUFDWixVQUFVLFdBQVMsVUFBVTtBQUFBLElBQzdCLFNBQVM7QUFBQSxJQUNULEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFNBQVMsTUFBTSxJQUFJLE9BQU8sSUFBSTtBQUFBLElBQzlCLFdBQVc7QUFBQSxFQUNmO0FBQ0EsTUFBTSxXQUFXO0FBQUEsSUFDYixVQUFVLFdBQVMsVUFBVTtBQUFBLElBQzdCLFNBQVM7QUFBQSxJQUNULEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFNBQVMsTUFBTSxJQUFJLE9BQU8sS0FBSztBQUFBLElBQy9CLFdBQVc7QUFBQSxFQUNmOzs7QUNwQkEsTUFBTUksWUFBVztBQUFBLElBQ2IsVUFBVSxXQUFTLE9BQU8sVUFBVTtBQUFBLElBQ3BDLFNBQVM7QUFBQSxJQUNULEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFNBQVMsQ0FBQyxRQUFRLElBQUksTUFBTSxFQUFFLEVBQUUsWUFBWSxNQUFNLFFBQzVDLE1BQ0EsSUFBSSxDQUFDLE1BQU0sTUFDUCxPQUFPLG9CQUNQLE9BQU87QUFBQSxJQUNqQixXQUFXO0FBQUEsRUFDZjtBQUNBLE1BQU1DLFlBQVc7QUFBQSxJQUNiLFVBQVUsV0FBUyxPQUFPLFVBQVU7QUFBQSxJQUNwQyxTQUFTO0FBQUEsSUFDVCxLQUFLO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixNQUFNO0FBQUEsSUFDTixTQUFTLENBQUMsUUFBUSxXQUFXLElBQUksUUFBUSxNQUFNLEVBQUUsQ0FBQztBQUFBLElBQ2xELFVBQVUsTUFBTTtBQUNaLFlBQU0sTUFBTSxPQUFPLEtBQUssS0FBSztBQUM3QixhQUFPLFNBQVMsR0FBRyxJQUFJLElBQUksY0FBYyxJQUFJLGdCQUFnQixJQUFJO0FBQUEsSUFDckU7QUFBQSxFQUNKO0FBQ0EsTUFBTUMsU0FBUTtBQUFBLElBQ1YsVUFBVSxXQUFTLE9BQU8sVUFBVTtBQUFBLElBQ3BDLFNBQVM7QUFBQSxJQUNULEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFFBQVEsS0FBSztBQUNULFlBQU0sT0FBTyxJQUFJLE9BQU8sV0FBVyxJQUFJLFFBQVEsTUFBTSxFQUFFLENBQUMsQ0FBQztBQUN6RCxZQUFNLE1BQU0sSUFBSSxRQUFRLEdBQUc7QUFDM0IsVUFBSSxRQUFRLElBQUk7QUFDWixjQUFNLElBQUksSUFBSSxVQUFVLE1BQU0sQ0FBQyxFQUFFLFFBQVEsTUFBTSxFQUFFO0FBQ2pELFlBQUksRUFBRSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQ3BCLGVBQUssb0JBQW9CLEVBQUU7QUFBQSxNQUNuQztBQUNBLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFDQSxXQUFXO0FBQUEsRUFDZjs7O0FDekNBLE1BQU1DLGVBQWMsQ0FBQyxVQUFVLE9BQU8sVUFBVSxZQUFZLE9BQU8sVUFBVSxLQUFLO0FBQ2xGLFdBQVNDLFlBQVcsS0FBSyxRQUFRLE9BQU8sRUFBRSxZQUFZLEdBQUc7QUFDckQsVUFBTSxPQUFPLElBQUksQ0FBQztBQUNsQixRQUFJLFNBQVMsT0FBTyxTQUFTO0FBQ3pCLGdCQUFVO0FBQ2QsVUFBTSxJQUFJLFVBQVUsTUFBTSxFQUFFLFFBQVEsTUFBTSxFQUFFO0FBQzVDLFFBQUksYUFBYTtBQUNiLGNBQVEsT0FBTztBQUFBLFFBQ1gsS0FBSztBQUNELGdCQUFNLEtBQUssR0FBRztBQUNkO0FBQUEsUUFDSixLQUFLO0FBQ0QsZ0JBQU0sS0FBSyxHQUFHO0FBQ2Q7QUFBQSxRQUNKLEtBQUs7QUFDRCxnQkFBTSxLQUFLLEdBQUc7QUFDZDtBQUFBLE1BQ1I7QUFDQSxZQUFNQyxLQUFJLE9BQU8sR0FBRztBQUNwQixhQUFPLFNBQVMsTUFBTSxPQUFPLEVBQUUsSUFBSUEsS0FBSUE7QUFBQSxJQUMzQztBQUNBLFVBQU0sSUFBSSxTQUFTLEtBQUssS0FBSztBQUM3QixXQUFPLFNBQVMsTUFBTSxLQUFLLElBQUk7QUFBQSxFQUNuQztBQUNBLFdBQVNDLGNBQWEsTUFBTSxPQUFPLFFBQVE7QUFDdkMsVUFBTSxFQUFFLE1BQU0sSUFBSTtBQUNsQixRQUFJSCxhQUFZLEtBQUssR0FBRztBQUNwQixZQUFNLE1BQU0sTUFBTSxTQUFTLEtBQUs7QUFDaEMsYUFBTyxRQUFRLElBQUksTUFBTSxTQUFTLElBQUksT0FBTyxDQUFDLElBQUksU0FBUztBQUFBLElBQy9EO0FBQ0EsV0FBTyxnQkFBZ0IsSUFBSTtBQUFBLEVBQy9CO0FBQ0EsTUFBTSxTQUFTO0FBQUEsSUFDWCxVQUFVQTtBQUFBLElBQ1YsU0FBUztBQUFBLElBQ1QsS0FBSztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sU0FBUyxDQUFDLEtBQUssVUFBVSxRQUFRQyxZQUFXLEtBQUssR0FBRyxHQUFHLEdBQUc7QUFBQSxJQUMxRCxXQUFXLFVBQVFFLGNBQWEsTUFBTSxHQUFHLElBQUk7QUFBQSxFQUNqRDtBQUNBLE1BQU1DLFVBQVM7QUFBQSxJQUNYLFVBQVVKO0FBQUEsSUFDVixTQUFTO0FBQUEsSUFDVCxLQUFLO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixNQUFNO0FBQUEsSUFDTixTQUFTLENBQUMsS0FBSyxVQUFVLFFBQVFDLFlBQVcsS0FBSyxHQUFHLEdBQUcsR0FBRztBQUFBLElBQzFELFdBQVcsVUFBUUUsY0FBYSxNQUFNLEdBQUcsR0FBRztBQUFBLEVBQ2hEO0FBQ0EsTUFBTUUsT0FBTTtBQUFBLElBQ1IsVUFBVUw7QUFBQSxJQUNWLFNBQVM7QUFBQSxJQUNULEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFNBQVMsQ0FBQyxLQUFLLFVBQVUsUUFBUUMsWUFBVyxLQUFLLEdBQUcsSUFBSSxHQUFHO0FBQUEsSUFDM0QsV0FBVztBQUFBLEVBQ2Y7QUFDQSxNQUFNSyxVQUFTO0FBQUEsSUFDWCxVQUFVTjtBQUFBLElBQ1YsU0FBUztBQUFBLElBQ1QsS0FBSztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sU0FBUyxDQUFDLEtBQUssVUFBVSxRQUFRQyxZQUFXLEtBQUssR0FBRyxJQUFJLEdBQUc7QUFBQSxJQUMzRCxXQUFXLFVBQVFFLGNBQWEsTUFBTSxJQUFJLElBQUk7QUFBQSxFQUNsRDs7O0FDaEVBLE1BQU0sVUFBTixNQUFNLGlCQUFnQixRQUFRO0FBQUEsSUFDMUIsWUFBWUksU0FBUTtBQUNoQixZQUFNQSxPQUFNO0FBQ1osV0FBSyxNQUFNLFNBQVE7QUFBQSxJQUN2QjtBQUFBLElBQ0EsSUFBSSxLQUFLO0FBQ0wsVUFBSTtBQUNKLFVBQUksT0FBTyxHQUFHO0FBQ1YsZUFBTztBQUFBLGVBQ0YsT0FDTCxPQUFPLFFBQVEsWUFDZixTQUFTLE9BQ1QsV0FBVyxPQUNYLElBQUksVUFBVTtBQUNkLGVBQU8sSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJO0FBQUE7QUFFN0IsZUFBTyxJQUFJLEtBQUssS0FBSyxJQUFJO0FBQzdCLFlBQU0sT0FBTyxTQUFTLEtBQUssT0FBTyxLQUFLLEdBQUc7QUFDMUMsVUFBSSxDQUFDO0FBQ0QsYUFBSyxNQUFNLEtBQUssSUFBSTtBQUFBLElBQzVCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLElBQUksS0FBSyxVQUFVO0FBQ2YsWUFBTSxPQUFPLFNBQVMsS0FBSyxPQUFPLEdBQUc7QUFDckMsYUFBTyxDQUFDLFlBQVksT0FBTyxJQUFJLElBQ3pCLFNBQVMsS0FBSyxHQUFHLElBQ2IsS0FBSyxJQUFJLFFBQ1QsS0FBSyxNQUNUO0FBQUEsSUFDVjtBQUFBLElBQ0EsSUFBSSxLQUFLLE9BQU87QUFDWixVQUFJLE9BQU8sVUFBVTtBQUNqQixjQUFNLElBQUksTUFBTSxpRUFBaUUsT0FBTyxLQUFLLEVBQUU7QUFDbkcsWUFBTSxPQUFPLFNBQVMsS0FBSyxPQUFPLEdBQUc7QUFDckMsVUFBSSxRQUFRLENBQUMsT0FBTztBQUNoQixhQUFLLE1BQU0sT0FBTyxLQUFLLE1BQU0sUUFBUSxJQUFJLEdBQUcsQ0FBQztBQUFBLE1BQ2pELFdBQ1MsQ0FBQyxRQUFRLE9BQU87QUFDckIsYUFBSyxNQUFNLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQztBQUFBLE1BQ2pDO0FBQUEsSUFDSjtBQUFBLElBQ0EsT0FBTyxHQUFHLEtBQUs7QUFDWCxhQUFPLE1BQU0sT0FBTyxHQUFHLEtBQUssR0FBRztBQUFBLElBQ25DO0FBQUEsSUFDQSxTQUFTLEtBQUssV0FBVyxhQUFhO0FBQ2xDLFVBQUksQ0FBQztBQUNELGVBQU8sS0FBSyxVQUFVLElBQUk7QUFDOUIsVUFBSSxLQUFLLGlCQUFpQixJQUFJO0FBQzFCLGVBQU8sTUFBTSxTQUFTLE9BQU8sT0FBTyxDQUFDLEdBQUcsS0FBSyxFQUFFLGVBQWUsS0FBSyxDQUFDLEdBQUcsV0FBVyxXQUFXO0FBQUE7QUFFN0YsY0FBTSxJQUFJLE1BQU0scUNBQXFDO0FBQUEsSUFDN0Q7QUFBQSxJQUNBLE9BQU8sS0FBS0EsU0FBUSxVQUFVLEtBQUs7QUFDL0IsWUFBTSxFQUFFLFNBQVMsSUFBSTtBQUNyQixZQUFNQyxPQUFNLElBQUksS0FBS0QsT0FBTTtBQUMzQixVQUFJLFlBQVksT0FBTyxZQUFZLE9BQU8sUUFBUTtBQUM5QyxpQkFBUyxTQUFTLFVBQVU7QUFDeEIsY0FBSSxPQUFPLGFBQWE7QUFDcEIsb0JBQVEsU0FBUyxLQUFLLFVBQVUsT0FBTyxLQUFLO0FBQ2hELFVBQUFDLEtBQUksTUFBTSxLQUFLLFdBQVcsT0FBTyxNQUFNLEdBQUcsQ0FBQztBQUFBLFFBQy9DO0FBQ0osYUFBT0E7QUFBQSxJQUNYO0FBQUEsRUFDSjtBQUNBLFVBQVEsTUFBTTtBQUNkLE1BQU0sTUFBTTtBQUFBLElBQ1IsWUFBWTtBQUFBLElBQ1osVUFBVSxXQUFTLGlCQUFpQjtBQUFBLElBQ3BDLFdBQVc7QUFBQSxJQUNYLFNBQVM7QUFBQSxJQUNULEtBQUs7QUFBQSxJQUNMLFlBQVksQ0FBQ0QsU0FBUSxVQUFVLFFBQVEsUUFBUSxLQUFLQSxTQUFRLFVBQVUsR0FBRztBQUFBLElBQ3pFLFFBQVFFLE1BQUssU0FBUztBQUNsQixVQUFJLE1BQU1BLElBQUcsR0FBRztBQUNaLFlBQUlBLEtBQUksaUJBQWlCLElBQUk7QUFDekIsaUJBQU8sT0FBTyxPQUFPLElBQUksUUFBUSxHQUFHQSxJQUFHO0FBQUE7QUFFdkMsa0JBQVEscUNBQXFDO0FBQUEsTUFDckQ7QUFFSSxnQkFBUSxpQ0FBaUM7QUFDN0MsYUFBT0E7QUFBQSxJQUNYO0FBQUEsRUFDSjs7O0FDdkZBLFdBQVMsaUJBQWlCLEtBQUssVUFBVTtBQUNyQyxVQUFNLE9BQU8sSUFBSSxDQUFDO0FBQ2xCLFVBQU0sUUFBUSxTQUFTLE9BQU8sU0FBUyxNQUFNLElBQUksVUFBVSxDQUFDLElBQUk7QUFDaEUsVUFBTSxNQUFNLENBQUMsTUFBTSxXQUFXLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQztBQUNsRCxVQUFNLE1BQU0sTUFDUCxRQUFRLE1BQU0sRUFBRSxFQUNoQixNQUFNLEdBQUcsRUFDVCxPQUFPLENBQUNDLE1BQUssTUFBTUEsT0FBTSxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUN0RCxXQUFRLFNBQVMsTUFBTSxJQUFJLEVBQUUsSUFBSSxNQUFNO0FBQUEsRUFDM0M7QUFNQSxXQUFTLHFCQUFxQixNQUFNO0FBQ2hDLFFBQUksRUFBRSxNQUFNLElBQUk7QUFDaEIsUUFBSSxNQUFNLENBQUMsTUFBTTtBQUNqQixRQUFJLE9BQU8sVUFBVTtBQUNqQixZQUFNLE9BQUssT0FBTyxDQUFDO0FBQUEsYUFDZCxNQUFNLEtBQUssS0FBSyxDQUFDLFNBQVMsS0FBSztBQUNwQyxhQUFPLGdCQUFnQixJQUFJO0FBQy9CLFFBQUksT0FBTztBQUNYLFFBQUksUUFBUSxHQUFHO0FBQ1gsYUFBTztBQUNQLGVBQVMsSUFBSSxFQUFFO0FBQUEsSUFDbkI7QUFDQSxVQUFNLE1BQU0sSUFBSSxFQUFFO0FBQ2xCLFVBQU0sUUFBUSxDQUFDLFFBQVEsR0FBRztBQUMxQixRQUFJLFFBQVEsSUFBSTtBQUNaLFlBQU0sUUFBUSxDQUFDO0FBQUEsSUFDbkIsT0FDSztBQUNELGVBQVMsUUFBUSxNQUFNLENBQUMsS0FBSztBQUM3QixZQUFNLFFBQVEsUUFBUSxHQUFHO0FBQ3pCLFVBQUksU0FBUyxJQUFJO0FBQ2IsaUJBQVMsUUFBUSxNQUFNLENBQUMsS0FBSztBQUM3QixjQUFNLFFBQVEsS0FBSztBQUFBLE1BQ3ZCO0FBQUEsSUFDSjtBQUNBLFdBQVEsT0FDSixNQUNLLElBQUksT0FBSyxPQUFPLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRyxDQUFDLEVBQ25DLEtBQUssR0FBRyxFQUNSLFFBQVEsY0FBYyxFQUFFO0FBQUEsRUFFckM7QUFDQSxNQUFNLFVBQVU7QUFBQSxJQUNaLFVBQVUsV0FBUyxPQUFPLFVBQVUsWUFBWSxPQUFPLFVBQVUsS0FBSztBQUFBLElBQ3RFLFNBQVM7QUFBQSxJQUNULEtBQUs7QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLE1BQU07QUFBQSxJQUNOLFNBQVMsQ0FBQyxLQUFLLFVBQVUsRUFBRSxZQUFZLE1BQU0saUJBQWlCLEtBQUssV0FBVztBQUFBLElBQzlFLFdBQVc7QUFBQSxFQUNmO0FBQ0EsTUFBTSxZQUFZO0FBQUEsSUFDZCxVQUFVLFdBQVMsT0FBTyxVQUFVO0FBQUEsSUFDcEMsU0FBUztBQUFBLElBQ1QsS0FBSztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sU0FBUyxTQUFPLGlCQUFpQixLQUFLLEtBQUs7QUFBQSxJQUMzQyxXQUFXO0FBQUEsRUFDZjtBQUNBLE1BQU0sWUFBWTtBQUFBLElBQ2QsVUFBVSxXQUFTLGlCQUFpQjtBQUFBLElBQ3BDLFNBQVM7QUFBQSxJQUNULEtBQUs7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlMLE1BQU0sT0FBTywySkFLSjtBQUFBLElBQ1QsUUFBUSxLQUFLO0FBQ1QsWUFBTSxRQUFRLElBQUksTUFBTSxVQUFVLElBQUk7QUFDdEMsVUFBSSxDQUFDO0FBQ0QsY0FBTSxJQUFJLE1BQU0sc0RBQXNEO0FBQzFFLFlBQU0sQ0FBQyxFQUFFLE1BQU0sT0FBTyxLQUFLLE1BQU0sUUFBUSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU07QUFDbkUsWUFBTSxXQUFXLE1BQU0sQ0FBQyxJQUFJLFFBQVEsTUFBTSxDQUFDLElBQUksTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUk7QUFDckUsVUFBSSxPQUFPLEtBQUssSUFBSSxNQUFNLFFBQVEsR0FBRyxLQUFLLFFBQVEsR0FBRyxVQUFVLEdBQUcsVUFBVSxHQUFHLFFBQVE7QUFDdkYsWUFBTSxLQUFLLE1BQU0sQ0FBQztBQUNsQixVQUFJLE1BQU0sT0FBTyxLQUFLO0FBQ2xCLFlBQUksSUFBSSxpQkFBaUIsSUFBSSxLQUFLO0FBQ2xDLFlBQUksS0FBSyxJQUFJLENBQUMsSUFBSTtBQUNkLGVBQUs7QUFDVCxnQkFBUSxNQUFRO0FBQUEsTUFDcEI7QUFDQSxhQUFPLElBQUksS0FBSyxJQUFJO0FBQUEsSUFDeEI7QUFBQSxJQUNBLFdBQVcsQ0FBQyxFQUFFLE1BQU0sTUFBTSxPQUFPLFlBQVksRUFBRSxRQUFRLHVCQUF1QixFQUFFLEtBQUs7QUFBQSxFQUN6Rjs7O0FDcEZBLE1BQU1DLFVBQVM7QUFBQSxJQUNYO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQUM7QUFBQSxJQUNBQztBQUFBLElBQ0FDO0FBQUEsSUFDQUM7QUFBQSxJQUNBQztBQUFBLElBQ0FDO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNKOzs7QUNuQkEsTUFBTSxVQUFVLG9CQUFJLElBQUk7QUFBQSxJQUNwQixDQUFDLFFBQVEsTUFBTTtBQUFBLElBQ2YsQ0FBQyxZQUFZLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQztBQUFBLElBQy9CLENBQUMsUUFBUUMsT0FBUTtBQUFBLElBQ2pCLENBQUMsVUFBVUEsT0FBUTtBQUFBLElBQ25CLENBQUMsWUFBWUEsT0FBUTtBQUFBLEVBQ3pCLENBQUM7QUFDRCxNQUFNLGFBQWE7QUFBQSxJQUNmO0FBQUEsSUFDQSxNQUFNO0FBQUEsSUFDTjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0EsTUFBTTtBQUFBLElBQ047QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUNBLE1BQU0sZ0JBQWdCO0FBQUEsSUFDbEIsNEJBQTRCO0FBQUEsSUFDNUIsMkJBQTJCO0FBQUEsSUFDM0IsMEJBQTBCO0FBQUEsSUFDMUIsMkJBQTJCO0FBQUEsSUFDM0IseUJBQXlCO0FBQUEsSUFDekIsK0JBQStCO0FBQUEsRUFDbkM7QUFDQSxXQUFTLFFBQVEsWUFBWSxZQUFZLGFBQWE7QUFDbEQsVUFBTSxhQUFhLFFBQVEsSUFBSSxVQUFVO0FBQ3pDLFFBQUksY0FBYyxDQUFDLFlBQVk7QUFDM0IsYUFBTyxlQUFlLENBQUMsV0FBVyxTQUFTLEtBQUssSUFDMUMsV0FBVyxPQUFPLEtBQUssSUFDdkIsV0FBVyxNQUFNO0FBQUEsSUFDM0I7QUFDQSxRQUFJLE9BQU87QUFDWCxRQUFJLENBQUMsTUFBTTtBQUNQLFVBQUksTUFBTSxRQUFRLFVBQVU7QUFDeEIsZUFBTyxDQUFDO0FBQUEsV0FDUDtBQUNELGNBQU0sT0FBTyxNQUFNLEtBQUssUUFBUSxLQUFLLENBQUMsRUFDakMsT0FBTyxTQUFPLFFBQVEsUUFBUSxFQUM5QixJQUFJLFNBQU8sS0FBSyxVQUFVLEdBQUcsQ0FBQyxFQUM5QixLQUFLLElBQUk7QUFDZCxjQUFNLElBQUksTUFBTSxtQkFBbUIsVUFBVSxpQkFBaUIsSUFBSSw2QkFBNkI7QUFBQSxNQUNuRztBQUFBLElBQ0o7QUFDQSxRQUFJLE1BQU0sUUFBUSxVQUFVLEdBQUc7QUFDM0IsaUJBQVcsT0FBTztBQUNkLGVBQU8sS0FBSyxPQUFPLEdBQUc7QUFBQSxJQUM5QixXQUNTLE9BQU8sZUFBZSxZQUFZO0FBQ3ZDLGFBQU8sV0FBVyxLQUFLLE1BQU0sQ0FBQztBQUFBLElBQ2xDO0FBQ0EsUUFBSTtBQUNBLGFBQU8sS0FBSyxPQUFPLEtBQUs7QUFDNUIsV0FBTyxLQUFLLE9BQU8sQ0FBQ0MsT0FBTSxRQUFRO0FBQzlCLFlBQU0sU0FBUyxPQUFPLFFBQVEsV0FBVyxXQUFXLEdBQUcsSUFBSTtBQUMzRCxVQUFJLENBQUMsUUFBUTtBQUNULGNBQU0sVUFBVSxLQUFLLFVBQVUsR0FBRztBQUNsQyxjQUFNLE9BQU8sT0FBTyxLQUFLLFVBQVUsRUFDOUIsSUFBSSxTQUFPLEtBQUssVUFBVSxHQUFHLENBQUMsRUFDOUIsS0FBSyxJQUFJO0FBQ2QsY0FBTSxJQUFJLE1BQU0sc0JBQXNCLE9BQU8sZ0JBQWdCLElBQUksRUFBRTtBQUFBLE1BQ3ZFO0FBQ0EsVUFBSSxDQUFDQSxNQUFLLFNBQVMsTUFBTTtBQUNyQixRQUFBQSxNQUFLLEtBQUssTUFBTTtBQUNwQixhQUFPQTtBQUFBLElBQ1gsR0FBRyxDQUFDLENBQUM7QUFBQSxFQUNUOzs7QUN2RkEsTUFBTSxzQkFBc0IsQ0FBQyxHQUFHLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sSUFBSTtBQUMvRSxNQUFNLFNBQU4sTUFBTSxRQUFPO0FBQUEsSUFDVCxZQUFZLEVBQUUsUUFBUSxZQUFZLE9BQUFDLFFBQU8sa0JBQWtCLFFBQUFDLFNBQVEsZ0JBQWdCLGlCQUFpQixHQUFHO0FBQ25HLFdBQUssU0FBUyxNQUFNLFFBQVEsTUFBTSxJQUM1QixRQUFRLFFBQVEsUUFBUSxJQUN4QixTQUNJLFFBQVEsTUFBTSxNQUFNLElBQ3BCO0FBQ1YsV0FBSyxPQUFRLE9BQU9BLFlBQVcsWUFBWUEsV0FBVztBQUN0RCxXQUFLLFlBQVksbUJBQW1CLGdCQUFnQixDQUFDO0FBQ3JELFdBQUssT0FBTyxRQUFRLFlBQVksS0FBSyxNQUFNRCxNQUFLO0FBQ2hELFdBQUssa0JBQWtCLG9CQUFvQjtBQUMzQyxhQUFPLGVBQWUsTUFBTSxLQUFLLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDL0MsYUFBTyxlQUFlLE1BQU0sUUFBUSxFQUFFLE9BQU8sT0FBTyxDQUFDO0FBQ3JELGFBQU8sZUFBZSxNQUFNLEtBQUssRUFBRSxPQUFPLElBQUksQ0FBQztBQUUvQyxXQUFLLGlCQUNELE9BQU8sbUJBQW1CLGFBQ3BCLGlCQUNBLG1CQUFtQixPQUNmLHNCQUNBO0FBQUEsSUFDbEI7QUFBQSxJQUNBLFFBQVE7QUFDSixZQUFNLE9BQU8sT0FBTyxPQUFPLFFBQU8sV0FBVyxPQUFPLDBCQUEwQixJQUFJLENBQUM7QUFDbkYsV0FBSyxPQUFPLEtBQUssS0FBSyxNQUFNO0FBQzVCLGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSjs7O0FDOUJBLFdBQVMsa0JBQWtCLEtBQUssU0FBUztBQUNyQyxVQUFNLFFBQVEsQ0FBQztBQUNmLFFBQUksZ0JBQWdCLFFBQVEsZUFBZTtBQUMzQyxRQUFJLFFBQVEsZUFBZSxTQUFTLElBQUksWUFBWTtBQUNoRCxZQUFNLE1BQU0sSUFBSSxXQUFXLFNBQVMsR0FBRztBQUN2QyxVQUFJLEtBQUs7QUFDTCxjQUFNLEtBQUssR0FBRztBQUNkLHdCQUFnQjtBQUFBLE1BQ3BCLFdBQ1MsSUFBSSxXQUFXO0FBQ3BCLHdCQUFnQjtBQUFBLElBQ3hCO0FBQ0EsUUFBSTtBQUNBLFlBQU0sS0FBSyxLQUFLO0FBQ3BCLFVBQU0sTUFBTSx1QkFBdUIsS0FBSyxPQUFPO0FBQy9DLFVBQU0sRUFBRSxjQUFjLElBQUksSUFBSTtBQUM5QixRQUFJLElBQUksZUFBZTtBQUNuQixVQUFJLE1BQU0sV0FBVztBQUNqQixjQUFNLFFBQVEsRUFBRTtBQUNwQixZQUFNLEtBQUssY0FBYyxJQUFJLGFBQWE7QUFDMUMsWUFBTSxRQUFRLGNBQWMsSUFBSSxFQUFFLENBQUM7QUFBQSxJQUN2QztBQUNBLFFBQUksWUFBWTtBQUNoQixRQUFJLGlCQUFpQjtBQUNyQixRQUFJLElBQUksVUFBVTtBQUNkLFVBQUksT0FBTyxJQUFJLFFBQVEsR0FBRztBQUN0QixZQUFJLElBQUksU0FBUyxlQUFlO0FBQzVCLGdCQUFNLEtBQUssRUFBRTtBQUNqQixZQUFJLElBQUksU0FBUyxlQUFlO0FBQzVCLGdCQUFNLEtBQUssY0FBYyxJQUFJLFNBQVMsYUFBYTtBQUNuRCxnQkFBTSxLQUFLLGNBQWMsSUFBSSxFQUFFLENBQUM7QUFBQSxRQUNwQztBQUVBLFlBQUksbUJBQW1CLENBQUMsQ0FBQyxJQUFJO0FBQzdCLHlCQUFpQixJQUFJLFNBQVM7QUFBQSxNQUNsQztBQUNBLFlBQU0sY0FBYyxpQkFBaUIsU0FBWSxNQUFPLFlBQVk7QUFDcEUsVUFBSSxPQUFPLFVBQVUsSUFBSSxVQUFVLEtBQUssTUFBTyxpQkFBaUIsTUFBTyxXQUFXO0FBQ2xGLFVBQUk7QUFDQSxnQkFBUSxZQUFZLE1BQU0sSUFBSSxjQUFjLGNBQWMsQ0FBQztBQUMvRCxXQUFLLEtBQUssQ0FBQyxNQUFNLE9BQU8sS0FBSyxDQUFDLE1BQU0sUUFDaEMsTUFBTSxNQUFNLFNBQVMsQ0FBQyxNQUFNLE9BQU87QUFHbkMsY0FBTSxNQUFNLFNBQVMsQ0FBQyxJQUFJLE9BQU8sSUFBSTtBQUFBLE1BQ3pDO0FBRUksY0FBTSxLQUFLLElBQUk7QUFBQSxJQUN2QixPQUNLO0FBQ0QsWUFBTSxLQUFLLFVBQVUsSUFBSSxVQUFVLEdBQUcsQ0FBQztBQUFBLElBQzNDO0FBQ0EsUUFBSSxJQUFJLFlBQVksUUFBUTtBQUN4QixVQUFJLElBQUksU0FBUztBQUNiLGNBQU0sS0FBSyxjQUFjLElBQUksT0FBTztBQUNwQyxZQUFJLEdBQUcsU0FBUyxJQUFJLEdBQUc7QUFDbkIsZ0JBQU0sS0FBSyxLQUFLO0FBQ2hCLGdCQUFNLEtBQUssY0FBYyxJQUFJLEVBQUUsQ0FBQztBQUFBLFFBQ3BDLE9BQ0s7QUFDRCxnQkFBTSxLQUFLLE9BQU8sRUFBRSxFQUFFO0FBQUEsUUFDMUI7QUFBQSxNQUNKLE9BQ0s7QUFDRCxjQUFNLEtBQUssS0FBSztBQUFBLE1BQ3BCO0FBQUEsSUFDSixPQUNLO0FBQ0QsVUFBSSxLQUFLLElBQUk7QUFDYixVQUFJLE1BQU07QUFDTixhQUFLLEdBQUcsUUFBUSxRQUFRLEVBQUU7QUFDOUIsVUFBSSxJQUFJO0FBQ0osYUFBSyxDQUFDLGFBQWEsbUJBQW1CLE1BQU0sTUFBTSxTQUFTLENBQUMsTUFBTTtBQUM5RCxnQkFBTSxLQUFLLEVBQUU7QUFDakIsY0FBTSxLQUFLLGNBQWMsY0FBYyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQUEsTUFDbkQ7QUFBQSxJQUNKO0FBQ0EsV0FBTyxNQUFNLEtBQUssSUFBSSxJQUFJO0FBQUEsRUFDOUI7OztBQ3RFQSxNQUFNLFdBQU4sTUFBTSxVQUFTO0FBQUEsSUFDWCxZQUFZLE9BQU8sVUFBVSxTQUFTO0FBRWxDLFdBQUssZ0JBQWdCO0FBRXJCLFdBQUssVUFBVTtBQUVmLFdBQUssU0FBUyxDQUFDO0FBRWYsV0FBSyxXQUFXLENBQUM7QUFDakIsYUFBTyxlQUFlLE1BQU0sV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ3JELFVBQUksWUFBWTtBQUNoQixVQUFJLE9BQU8sYUFBYSxjQUFjLE1BQU0sUUFBUSxRQUFRLEdBQUc7QUFDM0Qsb0JBQVk7QUFBQSxNQUNoQixXQUNTLFlBQVksVUFBYSxVQUFVO0FBQ3hDLGtCQUFVO0FBQ1YsbUJBQVc7QUFBQSxNQUNmO0FBQ0EsWUFBTSxNQUFNLE9BQU8sT0FBTztBQUFBLFFBQ3RCLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFVBQVU7QUFBQSxRQUNWLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxRQUNSLFlBQVk7QUFBQSxRQUNaLFlBQVk7QUFBQSxRQUNaLFNBQVM7QUFBQSxNQUNiLEdBQUcsT0FBTztBQUNWLFdBQUssVUFBVTtBQUNmLFVBQUksRUFBRSxRQUFRLElBQUk7QUFDbEIsVUFBSSxTQUFTLGFBQWE7QUFDdEIsYUFBSyxhQUFhLFFBQVEsWUFBWSxXQUFXO0FBQ2pELFlBQUksS0FBSyxXQUFXLEtBQUs7QUFDckIsb0JBQVUsS0FBSyxXQUFXLEtBQUs7QUFBQSxNQUN2QztBQUVJLGFBQUssYUFBYSxJQUFJLFdBQVcsRUFBRSxRQUFRLENBQUM7QUFDaEQsV0FBSyxVQUFVLFNBQVMsT0FBTztBQUUvQixXQUFLLFdBQ0QsVUFBVSxTQUFZLE9BQU8sS0FBSyxXQUFXLE9BQU8sV0FBVyxPQUFPO0FBQUEsSUFDOUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFNQSxRQUFRO0FBQ0osWUFBTSxPQUFPLE9BQU8sT0FBTyxVQUFTLFdBQVc7QUFBQSxRQUMzQyxDQUFDLFNBQVMsR0FBRyxFQUFFLE9BQU8sSUFBSTtBQUFBLE1BQzlCLENBQUM7QUFDRCxXQUFLLGdCQUFnQixLQUFLO0FBQzFCLFdBQUssVUFBVSxLQUFLO0FBQ3BCLFdBQUssU0FBUyxLQUFLLE9BQU8sTUFBTTtBQUNoQyxXQUFLLFdBQVcsS0FBSyxTQUFTLE1BQU07QUFDcEMsV0FBSyxVQUFVLE9BQU8sT0FBTyxDQUFDLEdBQUcsS0FBSyxPQUFPO0FBQzdDLFVBQUksS0FBSztBQUNMLGFBQUssYUFBYSxLQUFLLFdBQVcsTUFBTTtBQUM1QyxXQUFLLFNBQVMsS0FBSyxPQUFPLE1BQU07QUFFaEMsV0FBSyxXQUFXLE9BQU8sS0FBSyxRQUFRLElBQzlCLEtBQUssU0FBUyxNQUFNLEtBQUssTUFBTSxJQUMvQixLQUFLO0FBQ1gsVUFBSSxLQUFLO0FBQ0wsYUFBSyxRQUFRLEtBQUssTUFBTSxNQUFNO0FBQ2xDLGFBQU87QUFBQSxJQUNYO0FBQUE7QUFBQSxJQUVBLElBQUksT0FBTztBQUNQLFVBQUksaUJBQWlCLEtBQUssUUFBUTtBQUM5QixhQUFLLFNBQVMsSUFBSSxLQUFLO0FBQUEsSUFDL0I7QUFBQTtBQUFBLElBRUEsTUFBTSxNQUFNLE9BQU87QUFDZixVQUFJLGlCQUFpQixLQUFLLFFBQVE7QUFDOUIsYUFBSyxTQUFTLE1BQU0sTUFBTSxLQUFLO0FBQUEsSUFDdkM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVVBLFlBQVksTUFBTSxNQUFNO0FBQ3BCLFVBQUksQ0FBQyxLQUFLLFFBQVE7QUFDZCxjQUFNLE9BQU8sWUFBWSxJQUFJO0FBQzdCLGFBQUs7QUFBQSxRQUVELENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxJQUFJLGNBQWMsUUFBUSxLQUFLLElBQUksSUFBSTtBQUFBLE1BQ3JFO0FBQ0EsYUFBTyxJQUFJLE1BQU0sS0FBSyxNQUFNO0FBQUEsSUFDaEM7QUFBQSxJQUNBLFdBQVcsT0FBTyxVQUFVLFNBQVM7QUFDakMsVUFBSSxZQUFZO0FBQ2hCLFVBQUksT0FBTyxhQUFhLFlBQVk7QUFDaEMsZ0JBQVEsU0FBUyxLQUFLLEVBQUUsSUFBSSxNQUFNLEdBQUcsSUFBSSxLQUFLO0FBQzlDLG9CQUFZO0FBQUEsTUFDaEIsV0FDUyxNQUFNLFFBQVEsUUFBUSxHQUFHO0FBQzlCLGNBQU0sV0FBVyxDQUFDLE1BQU0sT0FBTyxNQUFNLFlBQVksYUFBYSxVQUFVLGFBQWE7QUFDckYsY0FBTSxRQUFRLFNBQVMsT0FBTyxRQUFRLEVBQUUsSUFBSSxNQUFNO0FBQ2xELFlBQUksTUFBTSxTQUFTO0FBQ2YscUJBQVcsU0FBUyxPQUFPLEtBQUs7QUFDcEMsb0JBQVk7QUFBQSxNQUNoQixXQUNTLFlBQVksVUFBYSxVQUFVO0FBQ3hDLGtCQUFVO0FBQ1YsbUJBQVc7QUFBQSxNQUNmO0FBQ0EsWUFBTSxFQUFFLHVCQUF1QixjQUFjLE1BQU0sZUFBZSxVQUFVLElBQUksSUFBSSxXQUFXLENBQUM7QUFDaEcsWUFBTSxFQUFFLFVBQVUsWUFBWSxjQUFjLElBQUk7QUFBQSxRQUFrQjtBQUFBO0FBQUEsUUFFbEUsZ0JBQWdCO0FBQUEsTUFBRztBQUNuQixZQUFNLE1BQU07QUFBQSxRQUNSLHVCQUF1Qix5QkFBeUI7QUFBQSxRQUNoRCxlQUFlLGlCQUFpQjtBQUFBLFFBQ2hDO0FBQUEsUUFDQTtBQUFBLFFBQ0EsVUFBVTtBQUFBLFFBQ1YsUUFBUSxLQUFLO0FBQUEsUUFDYjtBQUFBLE1BQ0o7QUFDQSxZQUFNLE9BQU8sV0FBVyxPQUFPLEtBQUssR0FBRztBQUN2QyxVQUFJLFFBQVEsYUFBYSxJQUFJO0FBQ3pCLGFBQUssT0FBTztBQUNoQixpQkFBVztBQUNYLGFBQU87QUFBQSxJQUNYO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLFdBQVcsS0FBSyxPQUFPLFVBQVUsQ0FBQyxHQUFHO0FBQ2pDLFlBQU0sSUFBSSxLQUFLLFdBQVcsS0FBSyxNQUFNLE9BQU87QUFDNUMsWUFBTSxJQUFJLEtBQUssV0FBVyxPQUFPLE1BQU0sT0FBTztBQUM5QyxhQUFPLElBQUksS0FBSyxHQUFHLENBQUM7QUFBQSxJQUN4QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLQSxPQUFPLEtBQUs7QUFDUixhQUFPLGlCQUFpQixLQUFLLFFBQVEsSUFBSSxLQUFLLFNBQVMsT0FBTyxHQUFHLElBQUk7QUFBQSxJQUN6RTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLQSxTQUFTLE1BQU07QUFDWCxVQUFJLFlBQVksSUFBSSxHQUFHO0FBQ25CLFlBQUksS0FBSyxZQUFZO0FBQ2pCLGlCQUFPO0FBRVgsYUFBSyxXQUFXO0FBQ2hCLGVBQU87QUFBQSxNQUNYO0FBQ0EsYUFBTyxpQkFBaUIsS0FBSyxRQUFRLElBQy9CLEtBQUssU0FBUyxTQUFTLElBQUksSUFDM0I7QUFBQSxJQUNWO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBTUEsSUFBSSxLQUFLLFlBQVk7QUFDakIsYUFBTyxhQUFhLEtBQUssUUFBUSxJQUMzQixLQUFLLFNBQVMsSUFBSSxLQUFLLFVBQVUsSUFDakM7QUFBQSxJQUNWO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBTUEsTUFBTSxNQUFNLFlBQVk7QUFDcEIsVUFBSSxZQUFZLElBQUk7QUFDaEIsZUFBTyxDQUFDLGNBQWMsU0FBUyxLQUFLLFFBQVEsSUFDdEMsS0FBSyxTQUFTLFFBQ2QsS0FBSztBQUNmLGFBQU8sYUFBYSxLQUFLLFFBQVEsSUFDM0IsS0FBSyxTQUFTLE1BQU0sTUFBTSxVQUFVLElBQ3BDO0FBQUEsSUFDVjtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSUEsSUFBSSxLQUFLO0FBQ0wsYUFBTyxhQUFhLEtBQUssUUFBUSxJQUFJLEtBQUssU0FBUyxJQUFJLEdBQUcsSUFBSTtBQUFBLElBQ2xFO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJQSxNQUFNLE1BQU07QUFDUixVQUFJLFlBQVksSUFBSTtBQUNoQixlQUFPLEtBQUssYUFBYTtBQUM3QixhQUFPLGFBQWEsS0FBSyxRQUFRLElBQUksS0FBSyxTQUFTLE1BQU0sSUFBSSxJQUFJO0FBQUEsSUFDckU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0EsSUFBSSxLQUFLLE9BQU87QUFDWixVQUFJLEtBQUssWUFBWSxNQUFNO0FBRXZCLGFBQUssV0FBVyxtQkFBbUIsS0FBSyxRQUFRLENBQUMsR0FBRyxHQUFHLEtBQUs7QUFBQSxNQUNoRSxXQUNTLGlCQUFpQixLQUFLLFFBQVEsR0FBRztBQUN0QyxhQUFLLFNBQVMsSUFBSSxLQUFLLEtBQUs7QUFBQSxNQUNoQztBQUFBLElBQ0o7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0EsTUFBTSxNQUFNLE9BQU87QUFDZixVQUFJLFlBQVksSUFBSSxHQUFHO0FBRW5CLGFBQUssV0FBVztBQUFBLE1BQ3BCLFdBQ1MsS0FBSyxZQUFZLE1BQU07QUFFNUIsYUFBSyxXQUFXLG1CQUFtQixLQUFLLFFBQVEsTUFBTSxLQUFLLElBQUksR0FBRyxLQUFLO0FBQUEsTUFDM0UsV0FDUyxpQkFBaUIsS0FBSyxRQUFRLEdBQUc7QUFDdEMsYUFBSyxTQUFTLE1BQU0sTUFBTSxLQUFLO0FBQUEsTUFDbkM7QUFBQSxJQUNKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVFBLFVBQVUsU0FBUyxVQUFVLENBQUMsR0FBRztBQUM3QixVQUFJLE9BQU8sWUFBWTtBQUNuQixrQkFBVSxPQUFPLE9BQU87QUFDNUIsVUFBSTtBQUNKLGNBQVEsU0FBUztBQUFBLFFBQ2IsS0FBSztBQUNELGNBQUksS0FBSztBQUNMLGlCQUFLLFdBQVcsS0FBSyxVQUFVO0FBQUE7QUFFL0IsaUJBQUssYUFBYSxJQUFJLFdBQVcsRUFBRSxTQUFTLE1BQU0sQ0FBQztBQUN2RCxnQkFBTSxFQUFFLGtCQUFrQixPQUFPLFFBQVEsV0FBVztBQUNwRDtBQUFBLFFBQ0osS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGNBQUksS0FBSztBQUNMLGlCQUFLLFdBQVcsS0FBSyxVQUFVO0FBQUE7QUFFL0IsaUJBQUssYUFBYSxJQUFJLFdBQVcsRUFBRSxRQUFRLENBQUM7QUFDaEQsZ0JBQU0sRUFBRSxrQkFBa0IsTUFBTSxRQUFRLE9BQU87QUFDL0M7QUFBQSxRQUNKLEtBQUs7QUFDRCxjQUFJLEtBQUs7QUFDTCxtQkFBTyxLQUFLO0FBQ2hCLGdCQUFNO0FBQ047QUFBQSxRQUNKLFNBQVM7QUFDTCxnQkFBTSxLQUFLLEtBQUssVUFBVSxPQUFPO0FBQ2pDLGdCQUFNLElBQUksTUFBTSwrREFBK0QsRUFBRSxFQUFFO0FBQUEsUUFDdkY7QUFBQSxNQUNKO0FBRUEsVUFBSSxRQUFRLGtCQUFrQjtBQUMxQixhQUFLLFNBQVMsUUFBUTtBQUFBLGVBQ2pCO0FBQ0wsYUFBSyxTQUFTLElBQUksT0FBTyxPQUFPLE9BQU8sS0FBSyxPQUFPLENBQUM7QUFBQTtBQUVwRCxjQUFNLElBQUksTUFBTSxxRUFBcUU7QUFBQSxJQUM3RjtBQUFBO0FBQUEsSUFFQSxLQUFLLEVBQUUsTUFBTSxTQUFTLFVBQVUsZUFBZSxVQUFVLFFBQVEsSUFBSSxDQUFDLEdBQUc7QUFDckUsWUFBTSxNQUFNO0FBQUEsUUFDUixTQUFTLG9CQUFJLElBQUk7QUFBQSxRQUNqQixLQUFLO0FBQUEsUUFDTCxNQUFNLENBQUM7QUFBQSxRQUNQLFVBQVUsYUFBYTtBQUFBLFFBQ3ZCLGNBQWM7QUFBQSxRQUNkLGVBQWUsT0FBTyxrQkFBa0IsV0FBVyxnQkFBZ0I7QUFBQSxNQUN2RTtBQUNBLFlBQU0sTUFBTSxLQUFLLEtBQUssVUFBVSxXQUFXLElBQUksR0FBRztBQUNsRCxVQUFJLE9BQU8sYUFBYTtBQUNwQixtQkFBVyxFQUFFLE9BQU8sS0FBQUUsS0FBSSxLQUFLLElBQUksUUFBUSxPQUFPO0FBQzVDLG1CQUFTQSxNQUFLLEtBQUs7QUFDM0IsYUFBTyxPQUFPLFlBQVksYUFDcEIsYUFBYSxTQUFTLEVBQUUsSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQzFDO0FBQUEsSUFDVjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBT0EsT0FBTyxTQUFTLFVBQVU7QUFDdEIsYUFBTyxLQUFLLEtBQUssRUFBRSxNQUFNLE1BQU0sU0FBUyxVQUFVLE9BQU8sU0FBUyxDQUFDO0FBQUEsSUFDdkU7QUFBQTtBQUFBLElBRUEsU0FBUyxVQUFVLENBQUMsR0FBRztBQUNuQixVQUFJLEtBQUssT0FBTyxTQUFTO0FBQ3JCLGNBQU0sSUFBSSxNQUFNLDRDQUE0QztBQUNoRSxVQUFJLFlBQVksWUFDWCxDQUFDLE9BQU8sVUFBVSxRQUFRLE1BQU0sS0FBSyxPQUFPLFFBQVEsTUFBTSxLQUFLLElBQUk7QUFDcEUsY0FBTSxJQUFJLEtBQUssVUFBVSxRQUFRLE1BQU07QUFDdkMsY0FBTSxJQUFJLE1BQU0sbURBQW1ELENBQUMsRUFBRTtBQUFBLE1BQzFFO0FBQ0EsYUFBTyxrQkFBa0IsTUFBTSxPQUFPO0FBQUEsSUFDMUM7QUFBQSxFQUNKO0FBQ0EsV0FBUyxpQkFBaUIsVUFBVTtBQUNoQyxRQUFJLGFBQWEsUUFBUTtBQUNyQixhQUFPO0FBQ1gsVUFBTSxJQUFJLE1BQU0saURBQWlEO0FBQUEsRUFDckU7OztBQzVVQSxNQUFNLFlBQU4sY0FBd0IsTUFBTTtBQUFBLElBQzFCLFlBQVksTUFBTSxLQUFLLE1BQU0sU0FBUztBQUNsQyxZQUFNO0FBQ04sV0FBSyxPQUFPO0FBQ1osV0FBSyxPQUFPO0FBQ1osV0FBSyxVQUFVO0FBQ2YsV0FBSyxNQUFNO0FBQUEsSUFDZjtBQUFBLEVBQ0o7QUFDQSxNQUFNLGlCQUFOLGNBQTZCLFVBQVU7QUFBQSxJQUNuQyxZQUFZLEtBQUssTUFBTSxTQUFTO0FBQzVCLFlBQU0sa0JBQWtCLEtBQUssTUFBTSxPQUFPO0FBQUEsSUFDOUM7QUFBQSxFQUNKO0FBQ0EsTUFBTSxjQUFOLGNBQTBCLFVBQVU7QUFBQSxJQUNoQyxZQUFZLEtBQUssTUFBTSxTQUFTO0FBQzVCLFlBQU0sZUFBZSxLQUFLLE1BQU0sT0FBTztBQUFBLElBQzNDO0FBQUEsRUFDSjtBQUNBLE1BQU0sZ0JBQWdCLENBQUMsS0FBSyxPQUFPLENBQUMsVUFBVTtBQUMxQyxRQUFJLE1BQU0sSUFBSSxDQUFDLE1BQU07QUFDakI7QUFDSixVQUFNLFVBQVUsTUFBTSxJQUFJLElBQUksU0FBTyxHQUFHLFFBQVEsR0FBRyxDQUFDO0FBQ3BELFVBQU0sRUFBRSxNQUFNLElBQUksSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUNyQyxVQUFNLFdBQVcsWUFBWSxJQUFJLFlBQVksR0FBRztBQUNoRCxRQUFJLEtBQUssTUFBTTtBQUNmLFFBQUksVUFBVSxJQUNULFVBQVUsR0FBRyxXQUFXLE9BQU8sQ0FBQyxHQUFHLEdBQUcsV0FBVyxJQUFJLENBQUMsRUFDdEQsUUFBUSxZQUFZLEVBQUU7QUFFM0IsUUFBSSxNQUFNLE1BQU0sUUFBUSxTQUFTLElBQUk7QUFDakMsWUFBTSxZQUFZLEtBQUssSUFBSSxLQUFLLElBQUksUUFBUSxTQUFTLEVBQUU7QUFDdkQsZ0JBQVUsV0FBTSxRQUFRLFVBQVUsU0FBUztBQUMzQyxZQUFNLFlBQVk7QUFBQSxJQUN0QjtBQUNBLFFBQUksUUFBUSxTQUFTO0FBQ2pCLGdCQUFVLFFBQVEsVUFBVSxHQUFHLEVBQUUsSUFBSTtBQUV6QyxRQUFJLE9BQU8sS0FBSyxPQUFPLEtBQUssUUFBUSxVQUFVLEdBQUcsRUFBRSxDQUFDLEdBQUc7QUFFbkQsVUFBSSxPQUFPLElBQUksVUFBVSxHQUFHLFdBQVcsT0FBTyxDQUFDLEdBQUcsR0FBRyxXQUFXLE9BQU8sQ0FBQyxDQUFDO0FBQ3pFLFVBQUksS0FBSyxTQUFTO0FBQ2QsZUFBTyxLQUFLLFVBQVUsR0FBRyxFQUFFLElBQUk7QUFDbkMsZ0JBQVUsT0FBTztBQUFBLElBQ3JCO0FBQ0EsUUFBSSxPQUFPLEtBQUssT0FBTyxHQUFHO0FBQ3RCLFVBQUksUUFBUTtBQUNaLFlBQU0sTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUMzQixVQUFJLEtBQUssU0FBUyxRQUFRLElBQUksTUFBTSxLQUFLO0FBQ3JDLGdCQUFRLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLE1BQU0sS0FBSyxLQUFLLEVBQUUsQ0FBQztBQUFBLE1BQ3hEO0FBQ0EsWUFBTSxVQUFVLElBQUksT0FBTyxFQUFFLElBQUksSUFBSSxPQUFPLEtBQUs7QUFDakQsWUFBTSxXQUFXO0FBQUE7QUFBQSxFQUFRLE9BQU87QUFBQSxFQUFLLE9BQU87QUFBQTtBQUFBLElBQ2hEO0FBQUEsRUFDSjs7O0FDdERBLFdBQVMsYUFBYSxRQUFRLEVBQUUsTUFBTSxXQUFXLE1BQU0sUUFBUSxTQUFTLGNBQWMsZUFBZSxHQUFHO0FBQ3BHLFFBQUksY0FBYztBQUNsQixRQUFJLFlBQVk7QUFDaEIsUUFBSSxXQUFXO0FBQ2YsUUFBSSxVQUFVO0FBQ2QsUUFBSSxhQUFhO0FBQ2pCLFFBQUksYUFBYTtBQUNqQixRQUFJLFdBQVc7QUFDZixRQUFJLE1BQU07QUFDVixRQUFJLFNBQVM7QUFDYixRQUFJLE1BQU07QUFDVixRQUFJLG1CQUFtQjtBQUN2QixRQUFJLFFBQVE7QUFDWixRQUFJLFFBQVE7QUFDWixRQUFJLFFBQVE7QUFDWixlQUFXLFNBQVMsUUFBUTtBQUN4QixVQUFJLFVBQVU7QUFDVixZQUFJLE1BQU0sU0FBUyxXQUNmLE1BQU0sU0FBUyxhQUNmLE1BQU0sU0FBUztBQUNmLGtCQUFRLE1BQU0sUUFBUSxnQkFBZ0IsdUVBQXVFO0FBQ2pILG1CQUFXO0FBQUEsTUFDZjtBQUNBLFVBQUksS0FBSztBQUNMLFlBQUksYUFBYSxNQUFNLFNBQVMsYUFBYSxNQUFNLFNBQVMsV0FBVztBQUNuRSxrQkFBUSxLQUFLLGlCQUFpQixxQ0FBcUM7QUFBQSxRQUN2RTtBQUNBLGNBQU07QUFBQSxNQUNWO0FBQ0EsY0FBUSxNQUFNLE1BQU07QUFBQSxRQUNoQixLQUFLO0FBSUQsY0FBSSxDQUFDLFNBQ0EsY0FBYyxlQUFlLE1BQU0sU0FBUyxzQkFDN0MsTUFBTSxPQUFPLFNBQVMsR0FBSSxHQUFHO0FBQzdCLGtCQUFNO0FBQUEsVUFDVjtBQUNBLHFCQUFXO0FBQ1g7QUFBQSxRQUNKLEtBQUssV0FBVztBQUNaLGNBQUksQ0FBQztBQUNELG9CQUFRLE9BQU8sZ0JBQWdCLHdFQUF3RTtBQUMzRyxnQkFBTSxLQUFLLE1BQU0sT0FBTyxVQUFVLENBQUMsS0FBSztBQUN4QyxjQUFJLENBQUM7QUFDRCxzQkFBVTtBQUFBO0FBRVYsdUJBQVcsYUFBYTtBQUM1Qix1QkFBYTtBQUNiLHNCQUFZO0FBQ1o7QUFBQSxRQUNKO0FBQUEsUUFDQSxLQUFLO0FBQ0QsY0FBSSxXQUFXO0FBQ1gsZ0JBQUk7QUFDQSx5QkFBVyxNQUFNO0FBQUEscUJBQ1osQ0FBQyxTQUFTLGNBQWM7QUFDN0IsNEJBQWM7QUFBQSxVQUN0QjtBQUVJLDBCQUFjLE1BQU07QUFDeEIsc0JBQVk7QUFDWix1QkFBYTtBQUNiLGNBQUksVUFBVTtBQUNWLCtCQUFtQjtBQUN2QixxQkFBVztBQUNYO0FBQUEsUUFDSixLQUFLO0FBQ0QsY0FBSTtBQUNBLG9CQUFRLE9BQU8sb0JBQW9CLG9DQUFvQztBQUMzRSxjQUFJLE1BQU0sT0FBTyxTQUFTLEdBQUc7QUFDekIsb0JBQVEsTUFBTSxTQUFTLE1BQU0sT0FBTyxTQUFTLEdBQUcsYUFBYSxtQ0FBbUMsSUFBSTtBQUN4RyxtQkFBUztBQUNULG9CQUFVLFFBQVEsTUFBTTtBQUN4QixzQkFBWTtBQUNaLHFCQUFXO0FBQ1gscUJBQVc7QUFDWDtBQUFBLFFBQ0osS0FBSyxPQUFPO0FBQ1IsY0FBSTtBQUNBLG9CQUFRLE9BQU8saUJBQWlCLGlDQUFpQztBQUNyRSxnQkFBTTtBQUNOLG9CQUFVLFFBQVEsTUFBTTtBQUN4QixzQkFBWTtBQUNaLHFCQUFXO0FBQ1gscUJBQVc7QUFDWDtBQUFBLFFBQ0o7QUFBQSxRQUNBLEtBQUs7QUFFRCxjQUFJLFVBQVU7QUFDVixvQkFBUSxPQUFPLGtCQUFrQixzQ0FBc0MsTUFBTSxNQUFNLFlBQVk7QUFDbkcsY0FBSTtBQUNBLG9CQUFRLE9BQU8sb0JBQW9CLGNBQWMsTUFBTSxNQUFNLE9BQU8sUUFBUSxZQUFZLEVBQUU7QUFDOUYsa0JBQVE7QUFDUixzQkFDSSxjQUFjLGtCQUFrQixjQUFjO0FBQ2xELHFCQUFXO0FBQ1g7QUFBQSxRQUNKLEtBQUs7QUFDRCxjQUFJLE1BQU07QUFDTixnQkFBSTtBQUNBLHNCQUFRLE9BQU8sb0JBQW9CLG1CQUFtQixJQUFJLEVBQUU7QUFDaEUsb0JBQVE7QUFDUix3QkFBWTtBQUNaLHVCQUFXO0FBQ1g7QUFBQSxVQUNKO0FBQUE7QUFBQSxRQUVKO0FBQ0ksa0JBQVEsT0FBTyxvQkFBb0IsY0FBYyxNQUFNLElBQUksUUFBUTtBQUNuRSxzQkFBWTtBQUNaLHFCQUFXO0FBQUEsTUFDbkI7QUFBQSxJQUNKO0FBQ0EsVUFBTSxPQUFPLE9BQU8sT0FBTyxTQUFTLENBQUM7QUFDckMsVUFBTSxNQUFNLE9BQU8sS0FBSyxTQUFTLEtBQUssT0FBTyxTQUFTO0FBQ3RELFFBQUksWUFDQSxRQUNBLEtBQUssU0FBUyxXQUNkLEtBQUssU0FBUyxhQUNkLEtBQUssU0FBUyxZQUNiLEtBQUssU0FBUyxZQUFZLEtBQUssV0FBVyxLQUFLO0FBQ2hELGNBQVEsS0FBSyxRQUFRLGdCQUFnQix1RUFBdUU7QUFBQSxJQUNoSDtBQUNBLFFBQUksUUFDRSxhQUFhLElBQUksVUFBVSxnQkFDekIsTUFBTSxTQUFTLGVBQ2YsTUFBTSxTQUFTO0FBQ25CLGNBQVEsS0FBSyxpQkFBaUIscUNBQXFDO0FBQ3ZFLFdBQU87QUFBQSxNQUNIO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLE9BQU8sU0FBUztBQUFBLElBQ3BCO0FBQUEsRUFDSjs7O0FDL0lBLFdBQVMsZ0JBQWdCLEtBQUs7QUFDMUIsUUFBSSxDQUFDO0FBQ0QsYUFBTztBQUNYLFlBQVEsSUFBSSxNQUFNO0FBQUEsTUFDZCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQ0QsWUFBSSxJQUFJLE9BQU8sU0FBUyxJQUFJO0FBQ3hCLGlCQUFPO0FBQ1gsWUFBSSxJQUFJO0FBQ0oscUJBQVcsTUFBTSxJQUFJO0FBQ2pCLGdCQUFJLEdBQUcsU0FBUztBQUNaLHFCQUFPO0FBQUE7QUFDbkIsZUFBTztBQUFBLE1BQ1gsS0FBSztBQUNELG1CQUFXQyxPQUFNLElBQUksT0FBTztBQUN4QixxQkFBVyxNQUFNQSxJQUFHO0FBQ2hCLGdCQUFJLEdBQUcsU0FBUztBQUNaLHFCQUFPO0FBQ2YsY0FBSUEsSUFBRztBQUNILHVCQUFXLE1BQU1BLElBQUc7QUFDaEIsa0JBQUksR0FBRyxTQUFTO0FBQ1osdUJBQU87QUFBQTtBQUNuQixjQUFJLGdCQUFnQkEsSUFBRyxHQUFHLEtBQUssZ0JBQWdCQSxJQUFHLEtBQUs7QUFDbkQsbUJBQU87QUFBQSxRQUNmO0FBQ0EsZUFBTztBQUFBLE1BQ1g7QUFDSSxlQUFPO0FBQUEsSUFDZjtBQUFBLEVBQ0o7OztBQzdCQSxXQUFTLGdCQUFnQkMsU0FBUSxJQUFJLFNBQVM7QUFDMUMsUUFBSSxJQUFJLFNBQVMsbUJBQW1CO0FBQ2hDLFlBQU0sTUFBTSxHQUFHLElBQUksQ0FBQztBQUNwQixVQUFJLElBQUksV0FBV0EsWUFDZCxJQUFJLFdBQVcsT0FBTyxJQUFJLFdBQVcsUUFDdEMsZ0JBQWdCLEVBQUUsR0FBRztBQUNyQixjQUFNLE1BQU07QUFDWixnQkFBUSxLQUFLLGNBQWMsS0FBSyxJQUFJO0FBQUEsTUFDeEM7QUFBQSxJQUNKO0FBQUEsRUFDSjs7O0FDVkEsV0FBUyxZQUFZLEtBQUssT0FBTyxRQUFRO0FBQ3JDLFVBQU0sRUFBRSxXQUFXLElBQUksSUFBSTtBQUMzQixRQUFJLGVBQWU7QUFDZixhQUFPO0FBQ1gsVUFBTSxVQUFVLE9BQU8sZUFBZSxhQUNoQyxhQUNBLENBQUMsR0FBRyxNQUFNLE1BQU0sS0FBTSxTQUFTLENBQUMsS0FBSyxTQUFTLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRTtBQUN4RSxXQUFPLE1BQU0sS0FBSyxVQUFRLFFBQVEsS0FBSyxLQUFLLE1BQU0sQ0FBQztBQUFBLEVBQ3ZEOzs7QUNIQSxNQUFNLGNBQWM7QUFDcEIsV0FBUyxnQkFBZ0IsRUFBRSxhQUFBQyxjQUFhLGtCQUFBQyxrQkFBaUIsR0FBRyxLQUFLLElBQUksU0FBUyxLQUFLO0FBQy9FLFVBQU0sWUFBWSxLQUFLLGFBQWE7QUFDcEMsVUFBTUMsT0FBTSxJQUFJLFVBQVUsSUFBSSxNQUFNO0FBQ3BDLFFBQUksSUFBSTtBQUNKLFVBQUksU0FBUztBQUNqQixRQUFJLFNBQVMsR0FBRztBQUNoQixRQUFJLGFBQWE7QUFDakIsZUFBVyxZQUFZLEdBQUcsT0FBTztBQUM3QixZQUFNLEVBQUUsT0FBTyxLQUFLLEtBQUssTUFBTSxJQUFJO0FBRW5DLFlBQU0sV0FBVyxhQUFhLE9BQU87QUFBQSxRQUNqQyxXQUFXO0FBQUEsUUFDWCxNQUFNLE9BQU8sTUFBTSxDQUFDO0FBQUEsUUFDcEI7QUFBQSxRQUNBO0FBQUEsUUFDQSxjQUFjLEdBQUc7QUFBQSxRQUNqQixnQkFBZ0I7QUFBQSxNQUNwQixDQUFDO0FBQ0QsWUFBTSxjQUFjLENBQUMsU0FBUztBQUM5QixVQUFJLGFBQWE7QUFDYixZQUFJLEtBQUs7QUFDTCxjQUFJLElBQUksU0FBUztBQUNiLG9CQUFRLFFBQVEseUJBQXlCLHlEQUF5RDtBQUFBLG1CQUM3RixZQUFZLE9BQU8sSUFBSSxXQUFXLEdBQUc7QUFDMUMsb0JBQVEsUUFBUSxjQUFjLFdBQVc7QUFBQSxRQUNqRDtBQUNBLFlBQUksQ0FBQyxTQUFTLFVBQVUsQ0FBQyxTQUFTLE9BQU8sQ0FBQyxLQUFLO0FBQzNDLHVCQUFhLFNBQVM7QUFDdEIsY0FBSSxTQUFTLFNBQVM7QUFDbEIsZ0JBQUlBLEtBQUk7QUFDSixjQUFBQSxLQUFJLFdBQVcsT0FBTyxTQUFTO0FBQUE7QUFFL0IsY0FBQUEsS0FBSSxVQUFVLFNBQVM7QUFBQSxVQUMvQjtBQUNBO0FBQUEsUUFDSjtBQUNBLFlBQUksU0FBUyxvQkFBb0IsZ0JBQWdCLEdBQUcsR0FBRztBQUNuRCxrQkFBUSxPQUFPLE1BQU0sTUFBTSxTQUFTLENBQUMsR0FBRywwQkFBMEIsMkNBQTJDO0FBQUEsUUFDakg7QUFBQSxNQUNKLFdBQ1MsU0FBUyxPQUFPLFdBQVcsR0FBRyxRQUFRO0FBQzNDLGdCQUFRLFFBQVEsY0FBYyxXQUFXO0FBQUEsTUFDN0M7QUFFQSxVQUFJLFFBQVE7QUFDWixZQUFNLFdBQVcsU0FBUztBQUMxQixZQUFNLFVBQVUsTUFDVkYsYUFBWSxLQUFLLEtBQUssVUFBVSxPQUFPLElBQ3ZDQyxrQkFBaUIsS0FBSyxVQUFVLE9BQU8sTUFBTSxVQUFVLE9BQU87QUFDcEUsVUFBSSxJQUFJLE9BQU87QUFDWCx3QkFBZ0IsR0FBRyxRQUFRLEtBQUssT0FBTztBQUMzQyxVQUFJLFFBQVE7QUFDWixVQUFJLFlBQVksS0FBS0MsS0FBSSxPQUFPLE9BQU87QUFDbkMsZ0JBQVEsVUFBVSxpQkFBaUIseUJBQXlCO0FBRWhFLFlBQU0sYUFBYSxhQUFhLE9BQU8sQ0FBQyxHQUFHO0FBQUEsUUFDdkMsV0FBVztBQUFBLFFBQ1gsTUFBTTtBQUFBLFFBQ04sUUFBUSxRQUFRLE1BQU0sQ0FBQztBQUFBLFFBQ3ZCO0FBQUEsUUFDQSxjQUFjLEdBQUc7QUFBQSxRQUNqQixnQkFBZ0IsQ0FBQyxPQUFPLElBQUksU0FBUztBQUFBLE1BQ3pDLENBQUM7QUFDRCxlQUFTLFdBQVc7QUFDcEIsVUFBSSxXQUFXLE9BQU87QUFDbEIsWUFBSSxhQUFhO0FBQ2IsY0FBSSxPQUFPLFNBQVMsZUFBZSxDQUFDLFdBQVc7QUFDM0Msb0JBQVEsUUFBUSx5QkFBeUIscURBQXFEO0FBQ2xHLGNBQUksSUFBSSxRQUFRLFVBQ1osU0FBUyxRQUFRLFdBQVcsTUFBTSxTQUFTO0FBQzNDLG9CQUFRLFFBQVEsT0FBTyx1QkFBdUIsNkZBQTZGO0FBQUEsUUFDbko7QUFFQSxjQUFNLFlBQVksUUFDWkYsYUFBWSxLQUFLLE9BQU8sWUFBWSxPQUFPLElBQzNDQyxrQkFBaUIsS0FBSyxRQUFRLEtBQUssTUFBTSxZQUFZLE9BQU87QUFDbEUsWUFBSSxJQUFJLE9BQU87QUFDWCwwQkFBZ0IsR0FBRyxRQUFRLE9BQU8sT0FBTztBQUM3QyxpQkFBUyxVQUFVLE1BQU0sQ0FBQztBQUMxQixjQUFNLE9BQU8sSUFBSSxLQUFLLFNBQVMsU0FBUztBQUN4QyxZQUFJLElBQUksUUFBUTtBQUNaLGVBQUssV0FBVztBQUNwQixRQUFBQyxLQUFJLE1BQU0sS0FBSyxJQUFJO0FBQUEsTUFDdkIsT0FDSztBQUVELFlBQUk7QUFDQSxrQkFBUSxRQUFRLE9BQU8sZ0JBQWdCLHFEQUFxRDtBQUNoRyxZQUFJLFdBQVcsU0FBUztBQUNwQixjQUFJLFFBQVE7QUFDUixvQkFBUSxXQUFXLE9BQU8sV0FBVztBQUFBO0FBRXJDLG9CQUFRLFVBQVUsV0FBVztBQUFBLFFBQ3JDO0FBQ0EsY0FBTSxPQUFPLElBQUksS0FBSyxPQUFPO0FBQzdCLFlBQUksSUFBSSxRQUFRO0FBQ1osZUFBSyxXQUFXO0FBQ3BCLFFBQUFBLEtBQUksTUFBTSxLQUFLLElBQUk7QUFBQSxNQUN2QjtBQUFBLElBQ0o7QUFDQSxRQUFJLGNBQWMsYUFBYTtBQUMzQixjQUFRLFlBQVksY0FBYyxtQ0FBbUM7QUFDekUsSUFBQUEsS0FBSSxRQUFRLENBQUMsR0FBRyxRQUFRLFFBQVEsY0FBYyxNQUFNO0FBQ3BELFdBQU9BO0FBQUEsRUFDWDs7O0FDNUdBLFdBQVMsZ0JBQWdCLEVBQUUsYUFBQUMsY0FBYSxrQkFBQUMsa0JBQWlCLEdBQUcsS0FBSyxJQUFJLFNBQVMsS0FBSztBQUMvRSxVQUFNLFlBQVksS0FBSyxhQUFhO0FBQ3BDLFVBQU1DLE9BQU0sSUFBSSxVQUFVLElBQUksTUFBTTtBQUNwQyxRQUFJLElBQUk7QUFDSixVQUFJLFNBQVM7QUFDakIsUUFBSSxJQUFJO0FBQ0osVUFBSSxRQUFRO0FBQ2hCLFFBQUksU0FBUyxHQUFHO0FBQ2hCLFFBQUksYUFBYTtBQUNqQixlQUFXLEVBQUUsT0FBTyxNQUFNLEtBQUssR0FBRyxPQUFPO0FBQ3JDLFlBQU0sUUFBUSxhQUFhLE9BQU87QUFBQSxRQUM5QixXQUFXO0FBQUEsUUFDWCxNQUFNO0FBQUEsUUFDTjtBQUFBLFFBQ0E7QUFBQSxRQUNBLGNBQWMsR0FBRztBQUFBLFFBQ2pCLGdCQUFnQjtBQUFBLE1BQ3BCLENBQUM7QUFDRCxVQUFJLENBQUMsTUFBTSxPQUFPO0FBQ2QsWUFBSSxNQUFNLFVBQVUsTUFBTSxPQUFPLE9BQU87QUFDcEMsY0FBSSxPQUFPLFNBQVM7QUFDaEIsb0JBQVEsTUFBTSxLQUFLLGNBQWMsa0RBQWtEO0FBQUE7QUFFbkYsb0JBQVEsUUFBUSxnQkFBZ0IsbUNBQW1DO0FBQUEsUUFDM0UsT0FDSztBQUNELHVCQUFhLE1BQU07QUFDbkIsY0FBSSxNQUFNO0FBQ04sWUFBQUEsS0FBSSxVQUFVLE1BQU07QUFDeEI7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUNBLFlBQU0sT0FBTyxRQUNQRixhQUFZLEtBQUssT0FBTyxPQUFPLE9BQU8sSUFDdENDLGtCQUFpQixLQUFLLE1BQU0sS0FBSyxPQUFPLE1BQU0sT0FBTyxPQUFPO0FBQ2xFLFVBQUksSUFBSSxPQUFPO0FBQ1gsd0JBQWdCLEdBQUcsUUFBUSxPQUFPLE9BQU87QUFDN0MsZUFBUyxLQUFLLE1BQU0sQ0FBQztBQUNyQixNQUFBQyxLQUFJLE1BQU0sS0FBSyxJQUFJO0FBQUEsSUFDdkI7QUFDQSxJQUFBQSxLQUFJLFFBQVEsQ0FBQyxHQUFHLFFBQVEsUUFBUSxjQUFjLE1BQU07QUFDcEQsV0FBT0E7QUFBQSxFQUNYOzs7QUM5Q0EsV0FBUyxXQUFXLEtBQUssUUFBUSxVQUFVLFNBQVM7QUFDaEQsUUFBSSxVQUFVO0FBQ2QsUUFBSSxLQUFLO0FBQ0wsVUFBSSxXQUFXO0FBQ2YsVUFBSSxNQUFNO0FBQ1YsaUJBQVcsU0FBUyxLQUFLO0FBQ3JCLGNBQU0sRUFBRSxRQUFRLEtBQUssSUFBSTtBQUN6QixnQkFBUSxNQUFNO0FBQUEsVUFDVixLQUFLO0FBQ0QsdUJBQVc7QUFDWDtBQUFBLFVBQ0osS0FBSyxXQUFXO0FBQ1osZ0JBQUksWUFBWSxDQUFDO0FBQ2Isc0JBQVEsT0FBTyxnQkFBZ0Isd0VBQXdFO0FBQzNHLGtCQUFNLEtBQUssT0FBTyxVQUFVLENBQUMsS0FBSztBQUNsQyxnQkFBSSxDQUFDO0FBQ0Qsd0JBQVU7QUFBQTtBQUVWLHlCQUFXLE1BQU07QUFDckIsa0JBQU07QUFDTjtBQUFBLFVBQ0o7QUFBQSxVQUNBLEtBQUs7QUFDRCxnQkFBSTtBQUNBLHFCQUFPO0FBQ1gsdUJBQVc7QUFDWDtBQUFBLFVBQ0o7QUFDSSxvQkFBUSxPQUFPLG9CQUFvQixjQUFjLElBQUksY0FBYztBQUFBLFFBQzNFO0FBQ0Esa0JBQVUsT0FBTztBQUFBLE1BQ3JCO0FBQUEsSUFDSjtBQUNBLFdBQU8sRUFBRSxTQUFTLE9BQU87QUFBQSxFQUM3Qjs7O0FDekJBLE1BQU0sV0FBVztBQUNqQixNQUFNLFVBQVUsQ0FBQyxVQUFVLFVBQVUsTUFBTSxTQUFTLGVBQWUsTUFBTSxTQUFTO0FBQ2xGLFdBQVMsc0JBQXNCLEVBQUUsYUFBQUMsY0FBYSxrQkFBQUMsa0JBQWlCLEdBQUcsS0FBSyxJQUFJLFNBQVMsS0FBSztBQUNyRixVQUFNQyxTQUFRLEdBQUcsTUFBTSxXQUFXO0FBQ2xDLFVBQU0sU0FBU0EsU0FBUSxhQUFhO0FBQ3BDLFVBQU0sWUFBYSxLQUFLLGNBQWNBLFNBQVEsVUFBVTtBQUN4RCxVQUFNLE9BQU8sSUFBSSxVQUFVLElBQUksTUFBTTtBQUNyQyxTQUFLLE9BQU87QUFDWixVQUFNLFNBQVMsSUFBSTtBQUNuQixRQUFJO0FBQ0EsVUFBSSxTQUFTO0FBQ2pCLFFBQUksSUFBSTtBQUNKLFVBQUksUUFBUTtBQUNoQixRQUFJLFNBQVMsR0FBRyxTQUFTLEdBQUcsTUFBTSxPQUFPO0FBQ3pDLGFBQVMsSUFBSSxHQUFHLElBQUksR0FBRyxNQUFNLFFBQVEsRUFBRSxHQUFHO0FBQ3RDLFlBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQztBQUMzQixZQUFNLEVBQUUsT0FBTyxLQUFLLEtBQUssTUFBTSxJQUFJO0FBQ25DLFlBQU0sUUFBUSxhQUFhLE9BQU87QUFBQSxRQUM5QixNQUFNO0FBQUEsUUFDTixXQUFXO0FBQUEsUUFDWCxNQUFNLE9BQU8sTUFBTSxDQUFDO0FBQUEsUUFDcEI7QUFBQSxRQUNBO0FBQUEsUUFDQSxjQUFjLEdBQUc7QUFBQSxRQUNqQixnQkFBZ0I7QUFBQSxNQUNwQixDQUFDO0FBQ0QsVUFBSSxDQUFDLE1BQU0sT0FBTztBQUNkLFlBQUksQ0FBQyxNQUFNLFVBQVUsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTztBQUMvQyxjQUFJLE1BQU0sS0FBSyxNQUFNO0FBQ2pCLG9CQUFRLE1BQU0sT0FBTyxvQkFBb0IsbUJBQW1CLE1BQU0sRUFBRTtBQUFBLG1CQUMvRCxJQUFJLEdBQUcsTUFBTSxTQUFTO0FBQzNCLG9CQUFRLE1BQU0sT0FBTyxvQkFBb0IsNEJBQTRCLE1BQU0sRUFBRTtBQUNqRixjQUFJLE1BQU0sU0FBUztBQUNmLGdCQUFJLEtBQUs7QUFDTCxtQkFBSyxXQUFXLE9BQU8sTUFBTTtBQUFBO0FBRTdCLG1CQUFLLFVBQVUsTUFBTTtBQUFBLFVBQzdCO0FBQ0EsbUJBQVMsTUFBTTtBQUNmO0FBQUEsUUFDSjtBQUNBLFlBQUksQ0FBQ0EsVUFBUyxJQUFJLFFBQVEsVUFBVSxnQkFBZ0IsR0FBRztBQUNuRDtBQUFBLFlBQVE7QUFBQTtBQUFBLFlBQ1I7QUFBQSxZQUEwQjtBQUFBLFVBQWtFO0FBQUEsTUFDcEc7QUFDQSxVQUFJLE1BQU0sR0FBRztBQUNULFlBQUksTUFBTTtBQUNOLGtCQUFRLE1BQU0sT0FBTyxvQkFBb0IsbUJBQW1CLE1BQU0sRUFBRTtBQUFBLE1BQzVFLE9BQ0s7QUFDRCxZQUFJLENBQUMsTUFBTTtBQUNQLGtCQUFRLE1BQU0sT0FBTyxnQkFBZ0IscUJBQXFCLE1BQU0sUUFBUTtBQUM1RSxZQUFJLE1BQU0sU0FBUztBQUNmLGNBQUksa0JBQWtCO0FBQ3RCLGVBQU0sWUFBVyxNQUFNLE9BQU87QUFDMUIsb0JBQVEsR0FBRyxNQUFNO0FBQUEsY0FDYixLQUFLO0FBQUEsY0FDTCxLQUFLO0FBQ0Q7QUFBQSxjQUNKLEtBQUs7QUFDRCxrQ0FBa0IsR0FBRyxPQUFPLFVBQVUsQ0FBQztBQUN2QyxzQkFBTTtBQUFBLGNBQ1Y7QUFDSSxzQkFBTTtBQUFBLFlBQ2Q7QUFBQSxVQUNKO0FBQ0EsY0FBSSxpQkFBaUI7QUFDakIsZ0JBQUksT0FBTyxLQUFLLE1BQU0sS0FBSyxNQUFNLFNBQVMsQ0FBQztBQUMzQyxnQkFBSSxPQUFPLElBQUk7QUFDWCxxQkFBTyxLQUFLLFNBQVMsS0FBSztBQUM5QixnQkFBSSxLQUFLO0FBQ0wsbUJBQUssV0FBVyxPQUFPO0FBQUE7QUFFdkIsbUJBQUssVUFBVTtBQUNuQixrQkFBTSxVQUFVLE1BQU0sUUFBUSxVQUFVLGdCQUFnQixTQUFTLENBQUM7QUFBQSxVQUN0RTtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQ0EsVUFBSSxDQUFDQSxVQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sT0FBTztBQUdoQyxjQUFNLFlBQVksUUFDWkYsYUFBWSxLQUFLLE9BQU8sT0FBTyxPQUFPLElBQ3RDQyxrQkFBaUIsS0FBSyxNQUFNLEtBQUssS0FBSyxNQUFNLE9BQU8sT0FBTztBQUNoRSxhQUFLLE1BQU0sS0FBSyxTQUFTO0FBQ3pCLGlCQUFTLFVBQVUsTUFBTSxDQUFDO0FBQzFCLFlBQUksUUFBUSxLQUFLO0FBQ2Isa0JBQVEsVUFBVSxPQUFPLGlCQUFpQixRQUFRO0FBQUEsTUFDMUQsT0FDSztBQUdELFlBQUksUUFBUTtBQUNaLGNBQU0sV0FBVyxNQUFNO0FBQ3ZCLGNBQU0sVUFBVSxNQUNWRCxhQUFZLEtBQUssS0FBSyxPQUFPLE9BQU8sSUFDcENDLGtCQUFpQixLQUFLLFVBQVUsT0FBTyxNQUFNLE9BQU8sT0FBTztBQUNqRSxZQUFJLFFBQVEsR0FBRztBQUNYLGtCQUFRLFFBQVEsT0FBTyxpQkFBaUIsUUFBUTtBQUNwRCxZQUFJLFFBQVE7QUFFWixjQUFNLGFBQWEsYUFBYSxPQUFPLENBQUMsR0FBRztBQUFBLFVBQ3ZDLE1BQU07QUFBQSxVQUNOLFdBQVc7QUFBQSxVQUNYLE1BQU07QUFBQSxVQUNOLFFBQVEsUUFBUSxNQUFNLENBQUM7QUFBQSxVQUN2QjtBQUFBLFVBQ0EsY0FBYyxHQUFHO0FBQUEsVUFDakIsZ0JBQWdCO0FBQUEsUUFDcEIsQ0FBQztBQUNELFlBQUksV0FBVyxPQUFPO0FBQ2xCLGNBQUksQ0FBQ0MsVUFBUyxDQUFDLE1BQU0sU0FBUyxJQUFJLFFBQVEsUUFBUTtBQUM5QyxnQkFBSTtBQUNBLHlCQUFXLE1BQU0sS0FBSztBQUNsQixvQkFBSSxPQUFPLFdBQVc7QUFDbEI7QUFDSixvQkFBSSxHQUFHLFNBQVMsV0FBVztBQUN2QiwwQkFBUSxJQUFJLDBCQUEwQixrRUFBa0U7QUFDeEc7QUFBQSxnQkFDSjtBQUFBLGNBQ0o7QUFDSixnQkFBSSxNQUFNLFFBQVEsV0FBVyxNQUFNLFNBQVM7QUFDeEMsc0JBQVEsV0FBVyxPQUFPLHVCQUF1Qiw2RkFBNkY7QUFBQSxVQUN0SjtBQUFBLFFBQ0osV0FDUyxPQUFPO0FBQ1osY0FBSSxZQUFZLFNBQVMsTUFBTSxTQUFTLENBQUMsTUFBTTtBQUMzQyxvQkFBUSxPQUFPLGdCQUFnQiw0QkFBNEIsTUFBTSxFQUFFO0FBQUE7QUFFbkUsb0JBQVEsV0FBVyxPQUFPLGdCQUFnQiwwQkFBMEIsTUFBTSxRQUFRO0FBQUEsUUFDMUY7QUFFQSxjQUFNLFlBQVksUUFDWkYsYUFBWSxLQUFLLE9BQU8sWUFBWSxPQUFPLElBQzNDLFdBQVcsUUFDUEMsa0JBQWlCLEtBQUssV0FBVyxLQUFLLEtBQUssTUFBTSxZQUFZLE9BQU8sSUFDcEU7QUFDVixZQUFJLFdBQVc7QUFDWCxjQUFJLFFBQVEsS0FBSztBQUNiLG9CQUFRLFVBQVUsT0FBTyxpQkFBaUIsUUFBUTtBQUFBLFFBQzFELFdBQ1MsV0FBVyxTQUFTO0FBQ3pCLGNBQUksUUFBUTtBQUNSLG9CQUFRLFdBQVcsT0FBTyxXQUFXO0FBQUE7QUFFckMsb0JBQVEsVUFBVSxXQUFXO0FBQUEsUUFDckM7QUFDQSxjQUFNLE9BQU8sSUFBSSxLQUFLLFNBQVMsU0FBUztBQUN4QyxZQUFJLElBQUksUUFBUTtBQUNaLGVBQUssV0FBVztBQUNwQixZQUFJQyxRQUFPO0FBQ1AsZ0JBQU1DLE9BQU07QUFDWixjQUFJLFlBQVksS0FBS0EsS0FBSSxPQUFPLE9BQU87QUFDbkMsb0JBQVEsVUFBVSxpQkFBaUIseUJBQXlCO0FBQ2hFLFVBQUFBLEtBQUksTUFBTSxLQUFLLElBQUk7QUFBQSxRQUN2QixPQUNLO0FBQ0QsZ0JBQU1BLE9BQU0sSUFBSSxRQUFRLElBQUksTUFBTTtBQUNsQyxVQUFBQSxLQUFJLE9BQU87QUFDWCxVQUFBQSxLQUFJLE1BQU0sS0FBSyxJQUFJO0FBQ25CLGdCQUFNLFlBQVksYUFBYSxTQUFTO0FBQ3hDLFVBQUFBLEtBQUksUUFBUSxDQUFDLFFBQVEsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUM7QUFDdkQsZUFBSyxNQUFNLEtBQUtBLElBQUc7QUFBQSxRQUN2QjtBQUNBLGlCQUFTLFlBQVksVUFBVSxNQUFNLENBQUMsSUFBSSxXQUFXO0FBQUEsTUFDekQ7QUFBQSxJQUNKO0FBQ0EsVUFBTSxjQUFjRCxTQUFRLE1BQU07QUFDbEMsVUFBTSxDQUFDLElBQUksR0FBRyxFQUFFLElBQUksR0FBRztBQUN2QixRQUFJLFFBQVE7QUFDWixRQUFJLElBQUksV0FBVztBQUNmLGNBQVEsR0FBRyxTQUFTLEdBQUcsT0FBTztBQUFBLFNBQzdCO0FBQ0QsWUFBTSxPQUFPLE9BQU8sQ0FBQyxFQUFFLFlBQVksSUFBSSxPQUFPLFVBQVUsQ0FBQztBQUN6RCxZQUFNLE1BQU0sU0FDTixHQUFHLElBQUksb0JBQW9CLFdBQVcsS0FDdEMsR0FBRyxJQUFJLHFFQUFxRSxXQUFXO0FBQzdGLGNBQVEsUUFBUSxTQUFTLGlCQUFpQixjQUFjLEdBQUc7QUFDM0QsVUFBSSxNQUFNLEdBQUcsT0FBTyxXQUFXO0FBQzNCLFdBQUcsUUFBUSxFQUFFO0FBQUEsSUFDckI7QUFDQSxRQUFJLEdBQUcsU0FBUyxHQUFHO0FBQ2YsWUFBTSxNQUFNLFdBQVcsSUFBSSxPQUFPLElBQUksUUFBUSxRQUFRLE9BQU87QUFDN0QsVUFBSSxJQUFJLFNBQVM7QUFDYixZQUFJLEtBQUs7QUFDTCxlQUFLLFdBQVcsT0FBTyxJQUFJO0FBQUE7QUFFM0IsZUFBSyxVQUFVLElBQUk7QUFBQSxNQUMzQjtBQUNBLFdBQUssUUFBUSxDQUFDLEdBQUcsUUFBUSxPQUFPLElBQUksTUFBTTtBQUFBLElBQzlDLE9BQ0s7QUFDRCxXQUFLLFFBQVEsQ0FBQyxHQUFHLFFBQVEsT0FBTyxLQUFLO0FBQUEsSUFDekM7QUFDQSxXQUFPO0FBQUEsRUFDWDs7O0FDcE1BLFdBQVMsa0JBQWtCRSxLQUFJLEtBQUssT0FBTyxTQUFTLFNBQVMsS0FBSztBQUM5RCxVQUFNLE9BQU8sTUFBTSxTQUFTLGNBQ3RCLGdCQUFnQkEsS0FBSSxLQUFLLE9BQU8sU0FBUyxHQUFHLElBQzVDLE1BQU0sU0FBUyxjQUNYLGdCQUFnQkEsS0FBSSxLQUFLLE9BQU8sU0FBUyxHQUFHLElBQzVDLHNCQUFzQkEsS0FBSSxLQUFLLE9BQU8sU0FBUyxHQUFHO0FBQzVELFVBQU0sT0FBTyxLQUFLO0FBR2xCLFFBQUksWUFBWSxPQUFPLFlBQVksS0FBSyxTQUFTO0FBQzdDLFdBQUssTUFBTSxLQUFLO0FBQ2hCLGFBQU87QUFBQSxJQUNYO0FBQ0EsUUFBSTtBQUNBLFdBQUssTUFBTTtBQUNmLFdBQU87QUFBQSxFQUNYO0FBQ0EsV0FBUyxrQkFBa0JBLEtBQUksS0FBSyxPQUFPLE9BQU8sU0FBUztBQUN2RCxVQUFNLFdBQVcsTUFBTTtBQUN2QixVQUFNLFVBQVUsQ0FBQyxXQUNYLE9BQ0EsSUFBSSxXQUFXLFFBQVEsU0FBUyxRQUFRLFNBQU8sUUFBUSxVQUFVLHNCQUFzQixHQUFHLENBQUM7QUFDakcsUUFBSSxNQUFNLFNBQVMsYUFBYTtBQUM1QixZQUFNLEVBQUUsUUFBUSxrQkFBa0IsR0FBRyxJQUFJO0FBQ3pDLFlBQU0sV0FBVyxVQUFVLFdBQ3JCLE9BQU8sU0FBUyxTQUFTLFNBQ3JCLFNBQ0EsV0FDSCxVQUFVO0FBQ2pCLFVBQUksYUFBYSxDQUFDLE1BQU0sR0FBRyxTQUFTLFNBQVMsU0FBUztBQUNsRCxjQUFNLFVBQVU7QUFDaEIsZ0JBQVEsVUFBVSxnQkFBZ0IsT0FBTztBQUFBLE1BQzdDO0FBQUEsSUFDSjtBQUNBLFVBQU0sVUFBVSxNQUFNLFNBQVMsY0FDekIsUUFDQSxNQUFNLFNBQVMsY0FDWCxRQUNBLE1BQU0sTUFBTSxXQUFXLE1BQ25CLFFBQ0E7QUFHZCxRQUFJLENBQUMsWUFDRCxDQUFDLFdBQ0QsWUFBWSxPQUNYLFlBQVksUUFBUSxXQUFXLFlBQVksU0FDM0MsWUFBWSxRQUFRLFdBQVcsWUFBWSxPQUFRO0FBQ3BELGFBQU8sa0JBQWtCQSxLQUFJLEtBQUssT0FBTyxTQUFTLE9BQU87QUFBQSxJQUM3RDtBQUNBLFFBQUksTUFBTSxJQUFJLE9BQU8sS0FBSyxLQUFLLE9BQUssRUFBRSxRQUFRLFdBQVcsRUFBRSxlQUFlLE9BQU87QUFDakYsUUFBSSxDQUFDLEtBQUs7QUFDTixZQUFNLEtBQUssSUFBSSxPQUFPLFVBQVUsT0FBTztBQUN2QyxVQUFJLElBQUksZUFBZSxTQUFTO0FBQzVCLFlBQUksT0FBTyxLQUFLLEtBQUssT0FBTyxPQUFPLENBQUMsR0FBRyxJQUFJLEVBQUUsU0FBUyxNQUFNLENBQUMsQ0FBQztBQUM5RCxjQUFNO0FBQUEsTUFDVixPQUNLO0FBQ0QsWUFBSSxJQUFJO0FBQ0osa0JBQVEsVUFBVSx1QkFBdUIsR0FBRyxHQUFHLEdBQUcsYUFBYSxPQUFPLDRCQUE0QixHQUFHLGNBQWMsUUFBUSxJQUFJLElBQUk7QUFBQSxRQUN2SSxPQUNLO0FBQ0Qsa0JBQVEsVUFBVSxzQkFBc0IsbUJBQW1CLE9BQU8sSUFBSSxJQUFJO0FBQUEsUUFDOUU7QUFDQSxlQUFPLGtCQUFrQkEsS0FBSSxLQUFLLE9BQU8sU0FBUyxPQUFPO0FBQUEsTUFDN0Q7QUFBQSxJQUNKO0FBQ0EsVUFBTSxPQUFPLGtCQUFrQkEsS0FBSSxLQUFLLE9BQU8sU0FBUyxTQUFTLEdBQUc7QUFDcEUsVUFBTSxNQUFNLElBQUksVUFBVSxNQUFNLFNBQU8sUUFBUSxVQUFVLHNCQUFzQixHQUFHLEdBQUcsSUFBSSxPQUFPLEtBQUs7QUFDckcsVUFBTSxPQUFPLE9BQU8sR0FBRyxJQUNqQixNQUNBLElBQUksT0FBTyxHQUFHO0FBQ3BCLFNBQUssUUFBUSxLQUFLO0FBQ2xCLFNBQUssTUFBTTtBQUNYLFFBQUksS0FBSztBQUNMLFdBQUssU0FBUyxJQUFJO0FBQ3RCLFdBQU87QUFBQSxFQUNYOzs7QUNuRkEsV0FBUyxtQkFBbUIsS0FBSyxRQUFRLFNBQVM7QUFDOUMsVUFBTSxRQUFRLE9BQU87QUFDckIsVUFBTSxTQUFTLHVCQUF1QixRQUFRLElBQUksUUFBUSxRQUFRLE9BQU87QUFDekUsUUFBSSxDQUFDO0FBQ0QsYUFBTyxFQUFFLE9BQU8sSUFBSSxNQUFNLE1BQU0sU0FBUyxJQUFJLE9BQU8sQ0FBQyxPQUFPLE9BQU8sS0FBSyxFQUFFO0FBQzlFLFVBQU0sT0FBTyxPQUFPLFNBQVMsTUFBTSxPQUFPLGVBQWUsT0FBTztBQUNoRSxVQUFNLFFBQVEsT0FBTyxTQUFTLFdBQVcsT0FBTyxNQUFNLElBQUksQ0FBQztBQUUzRCxRQUFJLGFBQWEsTUFBTTtBQUN2QixhQUFTLElBQUksTUFBTSxTQUFTLEdBQUcsS0FBSyxHQUFHLEVBQUUsR0FBRztBQUN4QyxZQUFNLFVBQVUsTUFBTSxDQUFDLEVBQUUsQ0FBQztBQUMxQixVQUFJLFlBQVksTUFBTSxZQUFZO0FBQzlCLHFCQUFhO0FBQUE7QUFFYjtBQUFBLElBQ1I7QUFFQSxRQUFJLGVBQWUsR0FBRztBQUNsQixZQUFNQyxTQUFRLE9BQU8sVUFBVSxPQUFPLE1BQU0sU0FBUyxJQUMvQyxLQUFLLE9BQU8sS0FBSyxJQUFJLEdBQUcsTUFBTSxTQUFTLENBQUMsQ0FBQyxJQUN6QztBQUNOLFVBQUlDLE9BQU0sUUFBUSxPQUFPO0FBQ3pCLFVBQUksT0FBTztBQUNQLFFBQUFBLFFBQU8sT0FBTyxPQUFPO0FBQ3pCLGFBQU8sRUFBRSxPQUFBRCxRQUFPLE1BQU0sU0FBUyxPQUFPLFNBQVMsT0FBTyxDQUFDLE9BQU9DLE1BQUtBLElBQUcsRUFBRTtBQUFBLElBQzVFO0FBRUEsUUFBSSxhQUFhLE9BQU8sU0FBUyxPQUFPO0FBQ3hDLFFBQUksU0FBUyxPQUFPLFNBQVMsT0FBTztBQUNwQyxRQUFJLGVBQWU7QUFDbkIsYUFBUyxJQUFJLEdBQUcsSUFBSSxZQUFZLEVBQUUsR0FBRztBQUNqQyxZQUFNLENBQUNDLFNBQVEsT0FBTyxJQUFJLE1BQU0sQ0FBQztBQUNqQyxVQUFJLFlBQVksTUFBTSxZQUFZLE1BQU07QUFDcEMsWUFBSSxPQUFPLFdBQVcsS0FBS0EsUUFBTyxTQUFTO0FBQ3ZDLHVCQUFhQSxRQUFPO0FBQUEsTUFDNUIsT0FDSztBQUNELFlBQUlBLFFBQU8sU0FBUyxZQUFZO0FBQzVCLGdCQUFNLFVBQVU7QUFDaEIsa0JBQVEsU0FBU0EsUUFBTyxRQUFRLGdCQUFnQixPQUFPO0FBQUEsUUFDM0Q7QUFDQSxZQUFJLE9BQU8sV0FBVztBQUNsQix1QkFBYUEsUUFBTztBQUN4Qix1QkFBZTtBQUNmLFlBQUksZUFBZSxLQUFLLENBQUMsSUFBSSxRQUFRO0FBQ2pDLGdCQUFNLFVBQVU7QUFDaEIsa0JBQVEsUUFBUSxjQUFjLE9BQU87QUFBQSxRQUN6QztBQUNBO0FBQUEsTUFDSjtBQUNBLGdCQUFVQSxRQUFPLFNBQVMsUUFBUSxTQUFTO0FBQUEsSUFDL0M7QUFFQSxhQUFTLElBQUksTUFBTSxTQUFTLEdBQUcsS0FBSyxZQUFZLEVBQUUsR0FBRztBQUNqRCxVQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTO0FBQ3JCLHFCQUFhLElBQUk7QUFBQSxJQUN6QjtBQUNBLFFBQUksUUFBUTtBQUNaLFFBQUksTUFBTTtBQUNWLFFBQUksbUJBQW1CO0FBRXZCLGFBQVMsSUFBSSxHQUFHLElBQUksY0FBYyxFQUFFO0FBQ2hDLGVBQVMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sVUFBVSxJQUFJO0FBQzdDLGFBQVMsSUFBSSxjQUFjLElBQUksWUFBWSxFQUFFLEdBQUc7QUFDNUMsVUFBSSxDQUFDQSxTQUFRLE9BQU8sSUFBSSxNQUFNLENBQUM7QUFDL0IsZ0JBQVVBLFFBQU8sU0FBUyxRQUFRLFNBQVM7QUFDM0MsWUFBTSxPQUFPLFFBQVEsUUFBUSxTQUFTLENBQUMsTUFBTTtBQUM3QyxVQUFJO0FBQ0Esa0JBQVUsUUFBUSxNQUFNLEdBQUcsRUFBRTtBQUVqQyxVQUFJLFdBQVdBLFFBQU8sU0FBUyxZQUFZO0FBQ3ZDLGNBQU0sTUFBTSxPQUFPLFNBQ2IsbUNBQ0E7QUFDTixjQUFNLFVBQVUsMkRBQTJELEdBQUc7QUFDOUUsZ0JBQVEsU0FBUyxRQUFRLFVBQVUsT0FBTyxJQUFJLElBQUksY0FBYyxPQUFPO0FBQ3ZFLFFBQUFBLFVBQVM7QUFBQSxNQUNiO0FBQ0EsVUFBSSxTQUFTLE9BQU8sZUFBZTtBQUMvQixpQkFBUyxNQUFNQSxRQUFPLE1BQU0sVUFBVSxJQUFJO0FBQzFDLGNBQU07QUFBQSxNQUNWLFdBQ1NBLFFBQU8sU0FBUyxjQUFjLFFBQVEsQ0FBQyxNQUFNLEtBQU07QUFFeEQsWUFBSSxRQUFRO0FBQ1IsZ0JBQU07QUFBQSxpQkFDRCxDQUFDLG9CQUFvQixRQUFRO0FBQ2xDLGdCQUFNO0FBQ1YsaUJBQVMsTUFBTUEsUUFBTyxNQUFNLFVBQVUsSUFBSTtBQUMxQyxjQUFNO0FBQ04sMkJBQW1CO0FBQUEsTUFDdkIsV0FDUyxZQUFZLElBQUk7QUFFckIsWUFBSSxRQUFRO0FBQ1IsbUJBQVM7QUFBQTtBQUVULGdCQUFNO0FBQUEsTUFDZCxPQUNLO0FBQ0QsaUJBQVMsTUFBTTtBQUNmLGNBQU07QUFDTiwyQkFBbUI7QUFBQSxNQUN2QjtBQUFBLElBQ0o7QUFDQSxZQUFRLE9BQU8sT0FBTztBQUFBLE1BQ2xCLEtBQUs7QUFDRDtBQUFBLE1BQ0osS0FBSztBQUNELGlCQUFTLElBQUksWUFBWSxJQUFJLE1BQU0sUUFBUSxFQUFFO0FBQ3pDLG1CQUFTLE9BQU8sTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sVUFBVTtBQUNoRCxZQUFJLE1BQU0sTUFBTSxTQUFTLENBQUMsTUFBTTtBQUM1QixtQkFBUztBQUNiO0FBQUEsTUFDSjtBQUNJLGlCQUFTO0FBQUEsSUFDakI7QUFDQSxVQUFNLE1BQU0sUUFBUSxPQUFPLFNBQVMsT0FBTyxPQUFPO0FBQ2xELFdBQU8sRUFBRSxPQUFPLE1BQU0sU0FBUyxPQUFPLFNBQVMsT0FBTyxDQUFDLE9BQU8sS0FBSyxHQUFHLEVBQUU7QUFBQSxFQUM1RTtBQUNBLFdBQVMsdUJBQXVCLEVBQUUsUUFBUSxNQUFNLEdBQUcsUUFBUSxTQUFTO0FBRWhFLFFBQUksTUFBTSxDQUFDLEVBQUUsU0FBUyx1QkFBdUI7QUFDekMsY0FBUSxNQUFNLENBQUMsR0FBRyxjQUFjLCtCQUErQjtBQUMvRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFVBQU0sRUFBRSxPQUFPLElBQUksTUFBTSxDQUFDO0FBQzFCLFVBQU0sT0FBTyxPQUFPLENBQUM7QUFDckIsUUFBSUEsVUFBUztBQUNiLFFBQUksUUFBUTtBQUNaLFFBQUksUUFBUTtBQUNaLGFBQVMsSUFBSSxHQUFHLElBQUksT0FBTyxRQUFRLEVBQUUsR0FBRztBQUNwQyxZQUFNLEtBQUssT0FBTyxDQUFDO0FBQ25CLFVBQUksQ0FBQyxVQUFVLE9BQU8sT0FBTyxPQUFPO0FBQ2hDLGdCQUFRO0FBQUEsV0FDUDtBQUNELGNBQU0sSUFBSSxPQUFPLEVBQUU7QUFDbkIsWUFBSSxDQUFDQSxXQUFVO0FBQ1gsVUFBQUEsVUFBUztBQUFBLGlCQUNKLFVBQVU7QUFDZixrQkFBUSxTQUFTO0FBQUEsTUFDekI7QUFBQSxJQUNKO0FBQ0EsUUFBSSxVQUFVO0FBQ1YsY0FBUSxPQUFPLG9CQUFvQixrREFBa0QsTUFBTSxFQUFFO0FBQ2pHLFFBQUksV0FBVztBQUNmLFFBQUksVUFBVTtBQUNkLFFBQUksU0FBUyxPQUFPO0FBQ3BCLGFBQVMsSUFBSSxHQUFHLElBQUksTUFBTSxRQUFRLEVBQUUsR0FBRztBQUNuQyxZQUFNLFFBQVEsTUFBTSxDQUFDO0FBQ3JCLGNBQVEsTUFBTSxNQUFNO0FBQUEsUUFDaEIsS0FBSztBQUNELHFCQUFXO0FBQUE7QUFBQSxRQUVmLEtBQUs7QUFDRCxvQkFBVSxNQUFNLE9BQU87QUFDdkI7QUFBQSxRQUNKLEtBQUs7QUFDRCxjQUFJLFVBQVUsQ0FBQyxVQUFVO0FBQ3JCLGtCQUFNLFVBQVU7QUFDaEIsb0JBQVEsT0FBTyxnQkFBZ0IsT0FBTztBQUFBLFVBQzFDO0FBQ0Esb0JBQVUsTUFBTSxPQUFPO0FBQ3ZCLG9CQUFVLE1BQU0sT0FBTyxVQUFVLENBQUM7QUFDbEM7QUFBQSxRQUNKLEtBQUs7QUFDRCxrQkFBUSxPQUFPLG9CQUFvQixNQUFNLE9BQU87QUFDaEQsb0JBQVUsTUFBTSxPQUFPO0FBQ3ZCO0FBQUE7QUFBQSxRQUVKLFNBQVM7QUFDTCxnQkFBTSxVQUFVLDRDQUE0QyxNQUFNLElBQUk7QUFDdEUsa0JBQVEsT0FBTyxvQkFBb0IsT0FBTztBQUMxQyxnQkFBTSxLQUFLLE1BQU07QUFDakIsY0FBSSxNQUFNLE9BQU8sT0FBTztBQUNwQixzQkFBVSxHQUFHO0FBQUEsUUFDckI7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUNBLFdBQU8sRUFBRSxNQUFNLFFBQUFBLFNBQVEsT0FBTyxTQUFTLE9BQU87QUFBQSxFQUNsRDtBQUVBLFdBQVMsV0FBVyxRQUFRO0FBQ3hCLFVBQU0sUUFBUSxPQUFPLE1BQU0sUUFBUTtBQUNuQyxVQUFNLFFBQVEsTUFBTSxDQUFDO0FBQ3JCLFVBQU0sSUFBSSxNQUFNLE1BQU0sT0FBTztBQUM3QixVQUFNLFFBQVEsSUFBSSxDQUFDLElBQ2IsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQy9CLENBQUMsSUFBSSxLQUFLO0FBQ2hCLFVBQU0sUUFBUSxDQUFDLEtBQUs7QUFDcEIsYUFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLFFBQVEsS0FBSztBQUNuQyxZQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdkMsV0FBTztBQUFBLEVBQ1g7OztBQ2hNQSxXQUFTLGtCQUFrQixRQUFRLFFBQVEsU0FBUztBQUNoRCxVQUFNLEVBQUUsUUFBUSxNQUFNLFFBQVEsSUFBSSxJQUFJO0FBQ3RDLFFBQUk7QUFDSixRQUFJO0FBQ0osVUFBTSxXQUFXLENBQUMsS0FBSyxNQUFNLFFBQVEsUUFBUSxTQUFTLEtBQUssTUFBTSxHQUFHO0FBQ3BFLFlBQVEsTUFBTTtBQUFBLE1BQ1YsS0FBSztBQUNELGdCQUFRLE9BQU87QUFDZixnQkFBUSxXQUFXLFFBQVEsUUFBUTtBQUNuQztBQUFBLE1BQ0osS0FBSztBQUNELGdCQUFRLE9BQU87QUFDZixnQkFBUSxrQkFBa0IsUUFBUSxRQUFRO0FBQzFDO0FBQUEsTUFDSixLQUFLO0FBQ0QsZ0JBQVEsT0FBTztBQUNmLGdCQUFRLGtCQUFrQixRQUFRLFFBQVE7QUFDMUM7QUFBQTtBQUFBLE1BRUo7QUFDSSxnQkFBUSxRQUFRLG9CQUFvQiw0Q0FBNEMsSUFBSSxFQUFFO0FBQ3RGLGVBQU87QUFBQSxVQUNILE9BQU87QUFBQSxVQUNQLE1BQU07QUFBQSxVQUNOLFNBQVM7QUFBQSxVQUNULE9BQU8sQ0FBQyxRQUFRLFNBQVMsT0FBTyxRQUFRLFNBQVMsT0FBTyxNQUFNO0FBQUEsUUFDbEU7QUFBQSxJQUNSO0FBQ0EsVUFBTSxXQUFXLFNBQVMsT0FBTztBQUNqQyxVQUFNLEtBQUssV0FBVyxLQUFLLFVBQVUsUUFBUSxPQUFPO0FBQ3BELFdBQU87QUFBQSxNQUNIO0FBQUEsTUFDQSxNQUFNO0FBQUEsTUFDTixTQUFTLEdBQUc7QUFBQSxNQUNaLE9BQU8sQ0FBQyxRQUFRLFVBQVUsR0FBRyxNQUFNO0FBQUEsSUFDdkM7QUFBQSxFQUNKO0FBQ0EsV0FBUyxXQUFXLFFBQVEsU0FBUztBQUNqQyxRQUFJLFVBQVU7QUFDZCxZQUFRLE9BQU8sQ0FBQyxHQUFHO0FBQUE7QUFBQSxNQUVmLEtBQUs7QUFDRCxrQkFBVTtBQUNWO0FBQUEsTUFDSixLQUFLO0FBQ0Qsa0JBQVU7QUFDVjtBQUFBLE1BQ0osS0FBSztBQUNELGtCQUFVO0FBQ1Y7QUFBQSxNQUNKLEtBQUs7QUFBQSxNQUNMLEtBQUssS0FBSztBQUNOLGtCQUFVLDBCQUEwQixPQUFPLENBQUMsQ0FBQztBQUM3QztBQUFBLE1BQ0o7QUFBQSxNQUNBLEtBQUs7QUFBQSxNQUNMLEtBQUssS0FBSztBQUNOLGtCQUFVLHNCQUFzQixPQUFPLENBQUMsQ0FBQztBQUN6QztBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQ0EsUUFBSTtBQUNBLGNBQVEsR0FBRyxvQkFBb0IsaUNBQWlDLE9BQU8sRUFBRTtBQUM3RSxXQUFPLFVBQVUsTUFBTTtBQUFBLEVBQzNCO0FBQ0EsV0FBUyxrQkFBa0IsUUFBUSxTQUFTO0FBQ3hDLFFBQUksT0FBTyxPQUFPLFNBQVMsQ0FBQyxNQUFNLE9BQU8sT0FBTyxXQUFXO0FBQ3ZELGNBQVEsT0FBTyxRQUFRLGdCQUFnQix3QkFBd0I7QUFDbkUsV0FBTyxVQUFVLE9BQU8sTUFBTSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFFBQVEsT0FBTyxHQUFHO0FBQUEsRUFDNUQ7QUFDQSxXQUFTLFVBQVUsUUFBUTtBQVF2QixRQUFJLE9BQU87QUFDWCxRQUFJO0FBQ0EsY0FBUSxJQUFJLE9BQU8sNEJBQThCLElBQUk7QUFDckQsYUFBTyxJQUFJLE9BQU8sc0NBQXlDLElBQUk7QUFBQSxJQUNuRSxRQUNNO0FBQ0YsY0FBUTtBQUNSLGFBQU87QUFBQSxJQUNYO0FBQ0EsUUFBSSxRQUFRLE1BQU0sS0FBSyxNQUFNO0FBQzdCLFFBQUksQ0FBQztBQUNELGFBQU87QUFDWCxRQUFJLE1BQU0sTUFBTSxDQUFDO0FBQ2pCLFFBQUksTUFBTTtBQUNWLFFBQUksTUFBTSxNQUFNO0FBQ2hCLFNBQUssWUFBWTtBQUNqQixXQUFRLFFBQVEsS0FBSyxLQUFLLE1BQU0sR0FBSTtBQUNoQyxVQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUk7QUFDakIsWUFBSSxRQUFRO0FBQ1IsaUJBQU87QUFBQTtBQUVQLGdCQUFNO0FBQUEsTUFDZCxPQUNLO0FBQ0QsZUFBTyxNQUFNLE1BQU0sQ0FBQztBQUNwQixjQUFNO0FBQUEsTUFDVjtBQUNBLFlBQU0sS0FBSztBQUFBLElBQ2Y7QUFDQSxVQUFNLE9BQU87QUFDYixTQUFLLFlBQVk7QUFDakIsWUFBUSxLQUFLLEtBQUssTUFBTTtBQUN4QixXQUFPLE1BQU0sT0FBTyxRQUFRLENBQUMsS0FBSztBQUFBLEVBQ3RDO0FBQ0EsV0FBUyxrQkFBa0IsUUFBUSxTQUFTO0FBQ3hDLFFBQUksTUFBTTtBQUNWLGFBQVMsSUFBSSxHQUFHLElBQUksT0FBTyxTQUFTLEdBQUcsRUFBRSxHQUFHO0FBQ3hDLFlBQU0sS0FBSyxPQUFPLENBQUM7QUFDbkIsVUFBSSxPQUFPLFFBQVEsT0FBTyxJQUFJLENBQUMsTUFBTTtBQUNqQztBQUNKLFVBQUksT0FBTyxNQUFNO0FBQ2IsY0FBTSxFQUFFLE1BQU0sT0FBTyxJQUFJLFlBQVksUUFBUSxDQUFDO0FBQzlDLGVBQU87QUFDUCxZQUFJO0FBQUEsTUFDUixXQUNTLE9BQU8sTUFBTTtBQUNsQixZQUFJLE9BQU8sT0FBTyxFQUFFLENBQUM7QUFDckIsY0FBTSxLQUFLLFlBQVksSUFBSTtBQUMzQixZQUFJO0FBQ0EsaUJBQU87QUFBQSxpQkFDRixTQUFTLE1BQU07QUFFcEIsaUJBQU8sT0FBTyxJQUFJLENBQUM7QUFDbkIsaUJBQU8sU0FBUyxPQUFPLFNBQVM7QUFDNUIsbUJBQU8sT0FBTyxFQUFFLElBQUksQ0FBQztBQUFBLFFBQzdCLFdBQ1MsU0FBUyxRQUFRLE9BQU8sSUFBSSxDQUFDLE1BQU0sTUFBTTtBQUU5QyxpQkFBTyxPQUFPLEVBQUUsSUFBSSxDQUFDO0FBQ3JCLGlCQUFPLFNBQVMsT0FBTyxTQUFTO0FBQzVCLG1CQUFPLE9BQU8sRUFBRSxJQUFJLENBQUM7QUFBQSxRQUM3QixXQUNTLFNBQVMsT0FBTyxTQUFTLE9BQU8sU0FBUyxLQUFLO0FBQ25ELGdCQUFNLFNBQVMsU0FBUyxNQUFNLElBQUksU0FBUyxNQUFNLElBQUk7QUFDckQsaUJBQU8sY0FBYyxRQUFRLElBQUksR0FBRyxRQUFRLE9BQU87QUFDbkQsZUFBSztBQUFBLFFBQ1QsT0FDSztBQUNELGdCQUFNLE1BQU0sT0FBTyxPQUFPLElBQUksR0FBRyxDQUFDO0FBQ2xDLGtCQUFRLElBQUksR0FBRyxpQkFBaUIsMkJBQTJCLEdBQUcsRUFBRTtBQUNoRSxpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKLFdBQ1MsT0FBTyxPQUFPLE9BQU8sS0FBTTtBQUVoQyxjQUFNLFVBQVU7QUFDaEIsWUFBSSxPQUFPLE9BQU8sSUFBSSxDQUFDO0FBQ3ZCLGVBQU8sU0FBUyxPQUFPLFNBQVM7QUFDNUIsaUJBQU8sT0FBTyxFQUFFLElBQUksQ0FBQztBQUN6QixZQUFJLFNBQVMsUUFBUSxFQUFFLFNBQVMsUUFBUSxPQUFPLElBQUksQ0FBQyxNQUFNO0FBQ3RELGlCQUFPLElBQUksVUFBVSxPQUFPLE1BQU0sU0FBUyxJQUFJLENBQUMsSUFBSTtBQUFBLE1BQzVELE9BQ0s7QUFDRCxlQUFPO0FBQUEsTUFDWDtBQUFBLElBQ0o7QUFDQSxRQUFJLE9BQU8sT0FBTyxTQUFTLENBQUMsTUFBTSxPQUFPLE9BQU8sV0FBVztBQUN2RCxjQUFRLE9BQU8sUUFBUSxnQkFBZ0Isd0JBQXdCO0FBQ25FLFdBQU87QUFBQSxFQUNYO0FBS0EsV0FBUyxZQUFZLFFBQVEsUUFBUTtBQUNqQyxRQUFJLE9BQU87QUFDWCxRQUFJLEtBQUssT0FBTyxTQUFTLENBQUM7QUFDMUIsV0FBTyxPQUFPLE9BQU8sT0FBTyxPQUFRLE9BQU8sUUFBUSxPQUFPLE1BQU07QUFDNUQsVUFBSSxPQUFPLFFBQVEsT0FBTyxTQUFTLENBQUMsTUFBTTtBQUN0QztBQUNKLFVBQUksT0FBTztBQUNQLGdCQUFRO0FBQ1osZ0JBQVU7QUFDVixXQUFLLE9BQU8sU0FBUyxDQUFDO0FBQUEsSUFDMUI7QUFDQSxRQUFJLENBQUM7QUFDRCxhQUFPO0FBQ1gsV0FBTyxFQUFFLE1BQU0sT0FBTztBQUFBLEVBQzFCO0FBQ0EsTUFBTSxjQUFjO0FBQUEsSUFDaEIsS0FBSztBQUFBO0FBQUEsSUFDTCxHQUFHO0FBQUE7QUFBQSxJQUNILEdBQUc7QUFBQTtBQUFBLElBQ0gsR0FBRztBQUFBO0FBQUEsSUFDSCxHQUFHO0FBQUE7QUFBQSxJQUNILEdBQUc7QUFBQTtBQUFBLElBQ0gsR0FBRztBQUFBO0FBQUEsSUFDSCxHQUFHO0FBQUE7QUFBQSxJQUNILEdBQUc7QUFBQTtBQUFBLElBQ0gsR0FBRztBQUFBO0FBQUEsSUFDSCxHQUFHO0FBQUE7QUFBQSxJQUNILEdBQUc7QUFBQTtBQUFBLElBQ0gsR0FBRztBQUFBO0FBQUEsSUFDSCxLQUFLO0FBQUEsSUFDTCxLQUFLO0FBQUEsSUFDTCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixLQUFNO0FBQUEsRUFDVjtBQUNBLFdBQVMsY0FBYyxRQUFRLFFBQVEsUUFBUSxTQUFTO0FBQ3BELFVBQU0sS0FBSyxPQUFPLE9BQU8sUUFBUSxNQUFNO0FBQ3ZDLFVBQU0sS0FBSyxHQUFHLFdBQVcsVUFBVSxpQkFBaUIsS0FBSyxFQUFFO0FBQzNELFVBQU0sT0FBTyxLQUFLLFNBQVMsSUFBSSxFQUFFLElBQUk7QUFDckMsUUFBSTtBQUNBLGFBQU8sT0FBTyxjQUFjLElBQUk7QUFBQSxJQUNwQyxRQUNNO0FBQ0YsWUFBTSxNQUFNLE9BQU8sT0FBTyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQ2hELGNBQVEsU0FBUyxHQUFHLGlCQUFpQiwyQkFBMkIsR0FBRyxFQUFFO0FBQ3JFLGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSjs7O0FDek5BLFdBQVMsY0FBYyxLQUFLLE9BQU8sVUFBVSxTQUFTO0FBQ2xELFVBQU0sRUFBRSxPQUFPLE1BQU0sU0FBUyxNQUFNLElBQUksTUFBTSxTQUFTLGlCQUNqRCxtQkFBbUIsS0FBSyxPQUFPLE9BQU8sSUFDdEMsa0JBQWtCLE9BQU8sSUFBSSxRQUFRLFFBQVEsT0FBTztBQUMxRCxVQUFNLFVBQVUsV0FDVixJQUFJLFdBQVcsUUFBUSxTQUFTLFFBQVEsU0FBTyxRQUFRLFVBQVUsc0JBQXNCLEdBQUcsQ0FBQyxJQUMzRjtBQUNOLFFBQUk7QUFDSixRQUFJLElBQUksUUFBUSxjQUFjLElBQUksT0FBTztBQUNyQyxZQUFNLElBQUksT0FBTyxNQUFNO0FBQUEsSUFDM0IsV0FDUztBQUNMLFlBQU0sb0JBQW9CLElBQUksUUFBUSxPQUFPLFNBQVMsVUFBVSxPQUFPO0FBQUEsYUFDbEUsTUFBTSxTQUFTO0FBQ3BCLFlBQU0sb0JBQW9CLEtBQUssT0FBTyxPQUFPLE9BQU87QUFBQTtBQUVwRCxZQUFNLElBQUksT0FBTyxNQUFNO0FBQzNCLFFBQUk7QUFDSixRQUFJO0FBQ0EsWUFBTSxNQUFNLElBQUksUUFBUSxPQUFPLFNBQU8sUUFBUSxZQUFZLE9BQU8sc0JBQXNCLEdBQUcsR0FBRyxJQUFJLE9BQU87QUFDeEcsZUFBUyxTQUFTLEdBQUcsSUFBSSxNQUFNLElBQUksT0FBTyxHQUFHO0FBQUEsSUFDakQsU0FDTyxPQUFPO0FBQ1YsWUFBTSxNQUFNLGlCQUFpQixRQUFRLE1BQU0sVUFBVSxPQUFPLEtBQUs7QUFDakUsY0FBUSxZQUFZLE9BQU8sc0JBQXNCLEdBQUc7QUFDcEQsZUFBUyxJQUFJLE9BQU8sS0FBSztBQUFBLElBQzdCO0FBQ0EsV0FBTyxRQUFRO0FBQ2YsV0FBTyxTQUFTO0FBQ2hCLFFBQUk7QUFDQSxhQUFPLE9BQU87QUFDbEIsUUFBSTtBQUNBLGFBQU8sTUFBTTtBQUNqQixRQUFJLElBQUk7QUFDSixhQUFPLFNBQVMsSUFBSTtBQUN4QixRQUFJO0FBQ0EsYUFBTyxVQUFVO0FBQ3JCLFdBQU87QUFBQSxFQUNYO0FBQ0EsV0FBUyxvQkFBb0JDLFNBQVEsT0FBTyxTQUFTLFVBQVUsU0FBUztBQUNwRSxRQUFJLFlBQVk7QUFDWixhQUFPQSxRQUFPLE1BQU07QUFDeEIsVUFBTSxnQkFBZ0IsQ0FBQztBQUN2QixlQUFXLE9BQU9BLFFBQU8sTUFBTTtBQUMzQixVQUFJLENBQUMsSUFBSSxjQUFjLElBQUksUUFBUSxTQUFTO0FBQ3hDLFlBQUksSUFBSSxXQUFXLElBQUk7QUFDbkIsd0JBQWMsS0FBSyxHQUFHO0FBQUE7QUFFdEIsaUJBQU87QUFBQSxNQUNmO0FBQUEsSUFDSjtBQUNBLGVBQVcsT0FBTztBQUNkLFVBQUksSUFBSSxNQUFNLEtBQUssS0FBSztBQUNwQixlQUFPO0FBQ2YsVUFBTSxLQUFLQSxRQUFPLFVBQVUsT0FBTztBQUNuQyxRQUFJLE1BQU0sQ0FBQyxHQUFHLFlBQVk7QUFHdEIsTUFBQUEsUUFBTyxLQUFLLEtBQUssT0FBTyxPQUFPLENBQUMsR0FBRyxJQUFJLEVBQUUsU0FBUyxPQUFPLE1BQU0sT0FBVSxDQUFDLENBQUM7QUFDM0UsYUFBTztBQUFBLElBQ1g7QUFDQSxZQUFRLFVBQVUsc0JBQXNCLG1CQUFtQixPQUFPLElBQUksWUFBWSx1QkFBdUI7QUFDekcsV0FBT0EsUUFBTyxNQUFNO0FBQUEsRUFDeEI7QUFDQSxXQUFTLG9CQUFvQixFQUFFLE9BQU8sWUFBWSxRQUFBQSxRQUFPLEdBQUcsT0FBTyxPQUFPLFNBQVM7QUFDL0UsVUFBTSxNQUFNQSxRQUFPLEtBQUssS0FBSyxDQUFBQyxVQUFRQSxLQUFJLFlBQVksUUFBUyxTQUFTQSxLQUFJLFlBQVksVUFDbkZBLEtBQUksTUFBTSxLQUFLLEtBQUssQ0FBQyxLQUFLRCxRQUFPLE1BQU07QUFDM0MsUUFBSUEsUUFBTyxRQUFRO0FBQ2YsWUFBTSxTQUFTQSxRQUFPLE9BQU8sS0FBSyxDQUFBQyxTQUFPQSxLQUFJLFdBQVdBLEtBQUksTUFBTSxLQUFLLEtBQUssQ0FBQyxLQUN6RUQsUUFBTyxNQUFNO0FBQ2pCLFVBQUksSUFBSSxRQUFRLE9BQU8sS0FBSztBQUN4QixjQUFNLEtBQUssV0FBVyxVQUFVLElBQUksR0FBRztBQUN2QyxjQUFNLEtBQUssV0FBVyxVQUFVLE9BQU8sR0FBRztBQUMxQyxjQUFNLE1BQU0saUNBQWlDLEVBQUUsT0FBTyxFQUFFO0FBQ3hELGdCQUFRLE9BQU8sc0JBQXNCLEtBQUssSUFBSTtBQUFBLE1BQ2xEO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxFQUNYOzs7QUNuRkEsV0FBUyxvQkFBb0IsUUFBUSxRQUFRLEtBQUs7QUFDOUMsUUFBSSxRQUFRO0FBQ1IsY0FBUSxNQUFNLE9BQU87QUFDckIsZUFBUyxJQUFJLE1BQU0sR0FBRyxLQUFLLEdBQUcsRUFBRSxHQUFHO0FBQy9CLFlBQUksS0FBSyxPQUFPLENBQUM7QUFDakIsZ0JBQVEsR0FBRyxNQUFNO0FBQUEsVUFDYixLQUFLO0FBQUEsVUFDTCxLQUFLO0FBQUEsVUFDTCxLQUFLO0FBQ0Qsc0JBQVUsR0FBRyxPQUFPO0FBQ3BCO0FBQUEsUUFDUjtBQUdBLGFBQUssT0FBTyxFQUFFLENBQUM7QUFDZixlQUFPLElBQUksU0FBUyxTQUFTO0FBQ3pCLG9CQUFVLEdBQUcsT0FBTztBQUNwQixlQUFLLE9BQU8sRUFBRSxDQUFDO0FBQUEsUUFDbkI7QUFDQTtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQ0EsV0FBTztBQUFBLEVBQ1g7OztBQ2hCQSxNQUFNLEtBQUssRUFBRSxhQUFhLGlCQUFpQjtBQUMzQyxXQUFTLFlBQVksS0FBSyxPQUFPLE9BQU8sU0FBUztBQUM3QyxVQUFNLFFBQVEsSUFBSTtBQUNsQixVQUFNLEVBQUUsYUFBYSxTQUFTLFFBQVEsSUFBSSxJQUFJO0FBQzlDLFFBQUk7QUFDSixRQUFJLGFBQWE7QUFDakIsWUFBUSxNQUFNLE1BQU07QUFBQSxNQUNoQixLQUFLO0FBQ0QsZUFBTyxhQUFhLEtBQUssT0FBTyxPQUFPO0FBQ3ZDLFlBQUksVUFBVTtBQUNWLGtCQUFRLE9BQU8sZUFBZSwrQ0FBK0M7QUFDakY7QUFBQSxNQUNKLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFDRCxlQUFPLGNBQWMsS0FBSyxPQUFPLEtBQUssT0FBTztBQUM3QyxZQUFJO0FBQ0EsZUFBSyxTQUFTLE9BQU8sT0FBTyxVQUFVLENBQUM7QUFDM0M7QUFBQSxNQUNKLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFDRCxZQUFJO0FBQ0EsaUJBQU8sa0JBQWtCLElBQUksS0FBSyxPQUFPLE9BQU8sT0FBTztBQUN2RCxjQUFJO0FBQ0EsaUJBQUssU0FBUyxPQUFPLE9BQU8sVUFBVSxDQUFDO0FBQUEsUUFDL0MsU0FDTyxPQUFPO0FBRVYsZ0JBQU0sVUFBVSxpQkFBaUIsUUFBUSxNQUFNLFVBQVUsT0FBTyxLQUFLO0FBQ3JFLGtCQUFRLE9BQU8sdUJBQXVCLE9BQU87QUFBQSxRQUNqRDtBQUNBO0FBQUEsTUFDSixTQUFTO0FBQ0wsY0FBTSxVQUFVLE1BQU0sU0FBUyxVQUN6QixNQUFNLFVBQ04sNEJBQTRCLE1BQU0sSUFBSTtBQUM1QyxnQkFBUSxPQUFPLG9CQUFvQixPQUFPO0FBQzFDLHFCQUFhO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQ0EsYUFBUyxPQUFPLGlCQUFpQixLQUFLLE1BQU0sUUFBUSxRQUFXLE1BQU0sT0FBTyxPQUFPO0FBQ25GLFFBQUksVUFBVSxLQUFLLFdBQVc7QUFDMUIsY0FBUSxRQUFRLGFBQWEsa0NBQWtDO0FBQ25FLFFBQUksU0FDQSxJQUFJLFFBQVEsZUFDWCxDQUFDLFNBQVMsSUFBSSxLQUNYLE9BQU8sS0FBSyxVQUFVLFlBQ3JCLEtBQUssT0FBTyxLQUFLLFFBQVEsMEJBQTJCO0FBQ3pELFlBQU0sTUFBTTtBQUNaLGNBQVEsT0FBTyxPQUFPLGtCQUFrQixHQUFHO0FBQUEsSUFDL0M7QUFDQSxRQUFJO0FBQ0EsV0FBSyxjQUFjO0FBQ3ZCLFFBQUksU0FBUztBQUNULFVBQUksTUFBTSxTQUFTLFlBQVksTUFBTSxXQUFXO0FBQzVDLGFBQUssVUFBVTtBQUFBO0FBRWYsYUFBSyxnQkFBZ0I7QUFBQSxJQUM3QjtBQUVBLFFBQUksSUFBSSxRQUFRLG9CQUFvQjtBQUNoQyxXQUFLLFdBQVc7QUFDcEIsV0FBTztBQUFBLEVBQ1g7QUFDQSxXQUFTLGlCQUFpQixLQUFLLFFBQVEsUUFBUSxLQUFLLEVBQUUsYUFBYSxTQUFTLFFBQVEsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUNyRyxVQUFNLFFBQVE7QUFBQSxNQUNWLE1BQU07QUFBQSxNQUNOLFFBQVEsb0JBQW9CLFFBQVEsUUFBUSxHQUFHO0FBQUEsTUFDL0MsUUFBUTtBQUFBLE1BQ1IsUUFBUTtBQUFBLElBQ1o7QUFDQSxVQUFNLE9BQU8sY0FBYyxLQUFLLE9BQU8sS0FBSyxPQUFPO0FBQ25ELFFBQUksUUFBUTtBQUNSLFdBQUssU0FBUyxPQUFPLE9BQU8sVUFBVSxDQUFDO0FBQ3ZDLFVBQUksS0FBSyxXQUFXO0FBQ2hCLGdCQUFRLFFBQVEsYUFBYSxrQ0FBa0M7QUFBQSxJQUN2RTtBQUNBLFFBQUk7QUFDQSxXQUFLLGNBQWM7QUFDdkIsUUFBSSxTQUFTO0FBQ1QsV0FBSyxVQUFVO0FBQ2YsV0FBSyxNQUFNLENBQUMsSUFBSTtBQUFBLElBQ3BCO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFDQSxXQUFTLGFBQWEsRUFBRSxRQUFRLEdBQUcsRUFBRSxRQUFRLFFBQVEsSUFBSSxHQUFHLFNBQVM7QUFDakUsVUFBTSxRQUFRLElBQUksTUFBTSxPQUFPLFVBQVUsQ0FBQyxDQUFDO0FBQzNDLFFBQUksTUFBTSxXQUFXO0FBQ2pCLGNBQVEsUUFBUSxhQUFhLGlDQUFpQztBQUNsRSxRQUFJLE1BQU0sT0FBTyxTQUFTLEdBQUc7QUFDekIsY0FBUSxTQUFTLE9BQU8sU0FBUyxHQUFHLGFBQWEsa0NBQWtDLElBQUk7QUFDM0YsVUFBTSxXQUFXLFNBQVMsT0FBTztBQUNqQyxVQUFNLEtBQUssV0FBVyxLQUFLLFVBQVUsUUFBUSxRQUFRLE9BQU87QUFDNUQsVUFBTSxRQUFRLENBQUMsUUFBUSxVQUFVLEdBQUcsTUFBTTtBQUMxQyxRQUFJLEdBQUc7QUFDSCxZQUFNLFVBQVUsR0FBRztBQUN2QixXQUFPO0FBQUEsRUFDWDs7O0FDckdBLFdBQVMsV0FBVyxTQUFTLFlBQVksRUFBRSxRQUFRLE9BQU8sT0FBTyxJQUFJLEdBQUcsU0FBUztBQUM3RSxVQUFNLE9BQU8sT0FBTyxPQUFPLEVBQUUsYUFBYSxXQUFXLEdBQUcsT0FBTztBQUMvRCxVQUFNLE1BQU0sSUFBSSxTQUFTLFFBQVcsSUFBSTtBQUN4QyxVQUFNLE1BQU07QUFBQSxNQUNSLE9BQU87QUFBQSxNQUNQLFFBQVE7QUFBQSxNQUNSLFlBQVksSUFBSTtBQUFBLE1BQ2hCLFNBQVMsSUFBSTtBQUFBLE1BQ2IsUUFBUSxJQUFJO0FBQUEsSUFDaEI7QUFDQSxVQUFNLFFBQVEsYUFBYSxPQUFPO0FBQUEsTUFDOUIsV0FBVztBQUFBLE1BQ1gsTUFBTSxTQUFTLE1BQU0sQ0FBQztBQUFBLE1BQ3RCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsY0FBYztBQUFBLE1BQ2QsZ0JBQWdCO0FBQUEsSUFDcEIsQ0FBQztBQUNELFFBQUksTUFBTSxPQUFPO0FBQ2IsVUFBSSxXQUFXLFdBQVc7QUFDMUIsVUFBSSxVQUNDLE1BQU0sU0FBUyxlQUFlLE1BQU0sU0FBUyxnQkFDOUMsQ0FBQyxNQUFNO0FBQ1AsZ0JBQVEsTUFBTSxLQUFLLGdCQUFnQix1RUFBdUU7QUFBQSxJQUNsSDtBQUVBLFFBQUksV0FBVyxRQUNULFlBQVksS0FBSyxPQUFPLE9BQU8sT0FBTyxJQUN0QyxpQkFBaUIsS0FBSyxNQUFNLEtBQUssT0FBTyxNQUFNLE9BQU8sT0FBTztBQUNsRSxVQUFNLGFBQWEsSUFBSSxTQUFTLE1BQU0sQ0FBQztBQUN2QyxVQUFNLEtBQUssV0FBVyxLQUFLLFlBQVksT0FBTyxPQUFPO0FBQ3JELFFBQUksR0FBRztBQUNILFVBQUksVUFBVSxHQUFHO0FBQ3JCLFFBQUksUUFBUSxDQUFDLFFBQVEsWUFBWSxHQUFHLE1BQU07QUFDMUMsV0FBTztBQUFBLEVBQ1g7OztBQ2pDQSxXQUFTLFlBQVksS0FBSztBQUN0QixRQUFJLE9BQU8sUUFBUTtBQUNmLGFBQU8sQ0FBQyxLQUFLLE1BQU0sQ0FBQztBQUN4QixRQUFJLE1BQU0sUUFBUSxHQUFHO0FBQ2pCLGFBQU8sSUFBSSxXQUFXLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ25ELFVBQU0sRUFBRSxRQUFRLE9BQU8sSUFBSTtBQUMzQixXQUFPLENBQUMsUUFBUSxVQUFVLE9BQU8sV0FBVyxXQUFXLE9BQU8sU0FBUyxFQUFFO0FBQUEsRUFDN0U7QUFDQSxXQUFTLGFBQWEsU0FBUztBQUMzQixRQUFJLFVBQVU7QUFDZCxRQUFJLFlBQVk7QUFDaEIsUUFBSSxpQkFBaUI7QUFDckIsYUFBUyxJQUFJLEdBQUcsSUFBSSxRQUFRLFFBQVEsRUFBRSxHQUFHO0FBQ3JDLFlBQU0sU0FBUyxRQUFRLENBQUM7QUFDeEIsY0FBUSxPQUFPLENBQUMsR0FBRztBQUFBLFFBQ2YsS0FBSztBQUNELHNCQUNLLFlBQVksS0FBSyxLQUFLLGlCQUFpQixTQUFTLFNBQzVDLE9BQU8sVUFBVSxDQUFDLEtBQUs7QUFDaEMsc0JBQVk7QUFDWiwyQkFBaUI7QUFDakI7QUFBQSxRQUNKLEtBQUs7QUFDRCxjQUFJLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNO0FBQ3hCLGlCQUFLO0FBQ1Qsc0JBQVk7QUFDWjtBQUFBLFFBQ0o7QUFFSSxjQUFJLENBQUM7QUFDRCw2QkFBaUI7QUFDckIsc0JBQVk7QUFBQSxNQUNwQjtBQUFBLElBQ0o7QUFDQSxXQUFPLEVBQUUsU0FBUyxlQUFlO0FBQUEsRUFDckM7QUFZQSxNQUFNLFdBQU4sTUFBZTtBQUFBLElBQ1gsWUFBWSxVQUFVLENBQUMsR0FBRztBQUN0QixXQUFLLE1BQU07QUFDWCxXQUFLLGVBQWU7QUFDcEIsV0FBSyxVQUFVLENBQUM7QUFDaEIsV0FBSyxTQUFTLENBQUM7QUFDZixXQUFLLFdBQVcsQ0FBQztBQUNqQixXQUFLLFVBQVUsQ0FBQyxRQUFRLE1BQU0sU0FBUyxZQUFZO0FBQy9DLGNBQU0sTUFBTSxZQUFZLE1BQU07QUFDOUIsWUFBSTtBQUNBLGVBQUssU0FBUyxLQUFLLElBQUksWUFBWSxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQUE7QUFFdEQsZUFBSyxPQUFPLEtBQUssSUFBSSxlQUFlLEtBQUssTUFBTSxPQUFPLENBQUM7QUFBQSxNQUMvRDtBQUVBLFdBQUssYUFBYSxJQUFJLFdBQVcsRUFBRSxTQUFTLFFBQVEsV0FBVyxNQUFNLENBQUM7QUFDdEUsV0FBSyxVQUFVO0FBQUEsSUFDbkI7QUFBQSxJQUNBLFNBQVMsS0FBSyxVQUFVO0FBQ3BCLFlBQU0sRUFBRSxTQUFTLGVBQWUsSUFBSSxhQUFhLEtBQUssT0FBTztBQUU3RCxVQUFJLFNBQVM7QUFDVCxjQUFNLEtBQUssSUFBSTtBQUNmLFlBQUksVUFBVTtBQUNWLGNBQUksVUFBVSxJQUFJLFVBQVUsR0FBRyxJQUFJLE9BQU87QUFBQSxFQUFLLE9BQU8sS0FBSztBQUFBLFFBQy9ELFdBQ1Msa0JBQWtCLElBQUksV0FBVyxZQUFZLENBQUMsSUFBSTtBQUN2RCxjQUFJLGdCQUFnQjtBQUFBLFFBQ3hCLFdBQ1MsYUFBYSxFQUFFLEtBQUssQ0FBQyxHQUFHLFFBQVEsR0FBRyxNQUFNLFNBQVMsR0FBRztBQUMxRCxjQUFJRSxNQUFLLEdBQUcsTUFBTSxDQUFDO0FBQ25CLGNBQUksT0FBT0EsR0FBRTtBQUNULFlBQUFBLE1BQUtBLElBQUc7QUFDWixnQkFBTSxLQUFLQSxJQUFHO0FBQ2QsVUFBQUEsSUFBRyxnQkFBZ0IsS0FBSyxHQUFHLE9BQU87QUFBQSxFQUFLLEVBQUUsS0FBSztBQUFBLFFBQ2xELE9BQ0s7QUFDRCxnQkFBTSxLQUFLLEdBQUc7QUFDZCxhQUFHLGdCQUFnQixLQUFLLEdBQUcsT0FBTztBQUFBLEVBQUssRUFBRSxLQUFLO0FBQUEsUUFDbEQ7QUFBQSxNQUNKO0FBQ0EsVUFBSSxVQUFVO0FBQ1YsaUJBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxPQUFPLFFBQVEsRUFBRTtBQUN0QyxjQUFJLE9BQU8sS0FBSyxLQUFLLE9BQU8sQ0FBQyxDQUFDO0FBQ2xDLGlCQUFTLElBQUksR0FBRyxJQUFJLEtBQUssU0FBUyxRQUFRLEVBQUU7QUFDeEMsY0FBSSxTQUFTLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQztBQUFBLE1BQzFDLE9BQ0s7QUFDRCxZQUFJLFNBQVMsS0FBSztBQUNsQixZQUFJLFdBQVcsS0FBSztBQUFBLE1BQ3hCO0FBQ0EsV0FBSyxVQUFVLENBQUM7QUFDaEIsV0FBSyxTQUFTLENBQUM7QUFDZixXQUFLLFdBQVcsQ0FBQztBQUFBLElBQ3JCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBTUEsYUFBYTtBQUNULGFBQU87QUFBQSxRQUNILFNBQVMsYUFBYSxLQUFLLE9BQU8sRUFBRTtBQUFBLFFBQ3BDLFlBQVksS0FBSztBQUFBLFFBQ2pCLFFBQVEsS0FBSztBQUFBLFFBQ2IsVUFBVSxLQUFLO0FBQUEsTUFDbkI7QUFBQSxJQUNKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFPQSxDQUFDLFFBQVEsUUFBUSxXQUFXLE9BQU8sWUFBWSxJQUFJO0FBQy9DLGlCQUFXLFNBQVM7QUFDaEIsZUFBTyxLQUFLLEtBQUssS0FBSztBQUMxQixhQUFPLEtBQUssSUFBSSxVQUFVLFNBQVM7QUFBQSxJQUN2QztBQUFBO0FBQUEsSUFFQSxDQUFDLEtBQUssT0FBTztBQUNULGNBQVEsTUFBTSxNQUFNO0FBQUEsUUFDaEIsS0FBSztBQUNELGVBQUssV0FBVyxJQUFJLE1BQU0sUUFBUSxDQUFDLFFBQVEsU0FBUyxZQUFZO0FBQzVELGtCQUFNLE1BQU0sWUFBWSxLQUFLO0FBQzdCLGdCQUFJLENBQUMsS0FBSztBQUNWLGlCQUFLLFFBQVEsS0FBSyxpQkFBaUIsU0FBUyxPQUFPO0FBQUEsVUFDdkQsQ0FBQztBQUNELGVBQUssUUFBUSxLQUFLLE1BQU0sTUFBTTtBQUM5QixlQUFLLGVBQWU7QUFDcEI7QUFBQSxRQUNKLEtBQUssWUFBWTtBQUNiLGdCQUFNLE1BQU0sV0FBVyxLQUFLLFNBQVMsS0FBSyxZQUFZLE9BQU8sS0FBSyxPQUFPO0FBQ3pFLGNBQUksS0FBSyxnQkFBZ0IsQ0FBQyxJQUFJLFdBQVc7QUFDckMsaUJBQUssUUFBUSxPQUFPLGdCQUFnQixpREFBaUQ7QUFDekYsZUFBSyxTQUFTLEtBQUssS0FBSztBQUN4QixjQUFJLEtBQUs7QUFDTCxrQkFBTSxLQUFLO0FBQ2YsZUFBSyxNQUFNO0FBQ1gsZUFBSyxlQUFlO0FBQ3BCO0FBQUEsUUFDSjtBQUFBLFFBQ0EsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNEO0FBQUEsUUFDSixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQ0QsZUFBSyxRQUFRLEtBQUssTUFBTSxNQUFNO0FBQzlCO0FBQUEsUUFDSixLQUFLLFNBQVM7QUFDVixnQkFBTSxNQUFNLE1BQU0sU0FDWixHQUFHLE1BQU0sT0FBTyxLQUFLLEtBQUssVUFBVSxNQUFNLE1BQU0sQ0FBQyxLQUNqRCxNQUFNO0FBQ1osZ0JBQU0sUUFBUSxJQUFJLGVBQWUsWUFBWSxLQUFLLEdBQUcsb0JBQW9CLEdBQUc7QUFDNUUsY0FBSSxLQUFLLGdCQUFnQixDQUFDLEtBQUs7QUFDM0IsaUJBQUssT0FBTyxLQUFLLEtBQUs7QUFBQTtBQUV0QixpQkFBSyxJQUFJLE9BQU8sS0FBSyxLQUFLO0FBQzlCO0FBQUEsUUFDSjtBQUFBLFFBQ0EsS0FBSyxXQUFXO0FBQ1osY0FBSSxDQUFDLEtBQUssS0FBSztBQUNYLGtCQUFNLE1BQU07QUFDWixpQkFBSyxPQUFPLEtBQUssSUFBSSxlQUFlLFlBQVksS0FBSyxHQUFHLG9CQUFvQixHQUFHLENBQUM7QUFDaEY7QUFBQSxVQUNKO0FBQ0EsZUFBSyxJQUFJLFdBQVcsU0FBUztBQUM3QixnQkFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE1BQU0sU0FBUyxNQUFNLE9BQU8sUUFBUSxLQUFLLElBQUksUUFBUSxRQUFRLEtBQUssT0FBTztBQUMzRyxlQUFLLFNBQVMsS0FBSyxLQUFLLElBQUk7QUFDNUIsY0FBSSxJQUFJLFNBQVM7QUFDYixrQkFBTSxLQUFLLEtBQUssSUFBSTtBQUNwQixpQkFBSyxJQUFJLFVBQVUsS0FBSyxHQUFHLEVBQUU7QUFBQSxFQUFLLElBQUksT0FBTyxLQUFLLElBQUk7QUFBQSxVQUMxRDtBQUNBLGVBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxJQUFJO0FBQ3hCO0FBQUEsUUFDSjtBQUFBLFFBQ0E7QUFDSSxlQUFLLE9BQU8sS0FBSyxJQUFJLGVBQWUsWUFBWSxLQUFLLEdBQUcsb0JBQW9CLHFCQUFxQixNQUFNLElBQUksRUFBRSxDQUFDO0FBQUEsTUFDdEg7QUFBQSxJQUNKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFPQSxDQUFDLElBQUksV0FBVyxPQUFPLFlBQVksSUFBSTtBQUNuQyxVQUFJLEtBQUssS0FBSztBQUNWLGFBQUssU0FBUyxLQUFLLEtBQUssSUFBSTtBQUM1QixjQUFNLEtBQUs7QUFDWCxhQUFLLE1BQU07QUFBQSxNQUNmLFdBQ1MsVUFBVTtBQUNmLGNBQU0sT0FBTyxPQUFPLE9BQU8sRUFBRSxhQUFhLEtBQUssV0FBVyxHQUFHLEtBQUssT0FBTztBQUN6RSxjQUFNLE1BQU0sSUFBSSxTQUFTLFFBQVcsSUFBSTtBQUN4QyxZQUFJLEtBQUs7QUFDTCxlQUFLLFFBQVEsV0FBVyxnQkFBZ0IsdUNBQXVDO0FBQ25GLFlBQUksUUFBUSxDQUFDLEdBQUcsV0FBVyxTQUFTO0FBQ3BDLGFBQUssU0FBUyxLQUFLLEtBQUs7QUFDeEIsY0FBTTtBQUFBLE1BQ1Y7QUFBQSxJQUNKO0FBQUEsRUFDSjs7O0FDeE5BO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrQkFBQUM7QUFBQSxJQUFBO0FBQUEsd0JBQUFDO0FBQUEsSUFBQSxnQkFBQUM7QUFBQSxJQUFBO0FBQUE7QUFBQTtBQUFBLHFCQUFBQztBQUFBLElBQUE7QUFBQSxpQkFBQUM7QUFBQTs7O0FDS0EsV0FBUyxnQkFBZ0IsT0FBTyxTQUFTLE1BQU0sU0FBUztBQUNwRCxRQUFJLE9BQU87QUFDUCxZQUFNLFdBQVcsQ0FBQyxLQUFLLE1BQU0sWUFBWTtBQUNyQyxjQUFNLFNBQVMsT0FBTyxRQUFRLFdBQVcsTUFBTSxNQUFNLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUk7QUFDakYsWUFBSTtBQUNBLGtCQUFRLFFBQVEsTUFBTSxPQUFPO0FBQUE7QUFFN0IsZ0JBQU0sSUFBSSxlQUFlLENBQUMsUUFBUSxTQUFTLENBQUMsR0FBRyxNQUFNLE9BQU87QUFBQSxNQUNwRTtBQUNBLGNBQVEsTUFBTSxNQUFNO0FBQUEsUUFDaEIsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPLGtCQUFrQixPQUFPLFFBQVEsUUFBUTtBQUFBLFFBQ3BELEtBQUs7QUFDRCxpQkFBTyxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxRQUFRO0FBQUEsTUFDMUU7QUFBQSxJQUNKO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFlQSxXQUFTLGtCQUFrQixPQUFPLFNBQVM7QUFDdkMsVUFBTSxFQUFFLGNBQWMsT0FBTyxRQUFBQyxTQUFRLFNBQVMsT0FBTyxTQUFTLElBQUksT0FBTyxRQUFRLElBQUk7QUFDckYsVUFBTSxTQUFTLGdCQUFnQixFQUFFLE1BQU0sTUFBTSxHQUFHO0FBQUEsTUFDNUM7QUFBQSxNQUNBLFFBQVFBLFVBQVMsSUFBSSxJQUFJLE9BQU9BLE9BQU0sSUFBSTtBQUFBLE1BQzFDO0FBQUEsTUFDQSxTQUFTLEVBQUUsWUFBWSxNQUFNLFdBQVcsR0FBRztBQUFBLElBQy9DLENBQUM7QUFDRCxVQUFNLE1BQU0sUUFBUSxPQUFPO0FBQUEsTUFDdkIsRUFBRSxNQUFNLFdBQVcsUUFBUSxJQUFJLFFBQUFBLFNBQVEsUUFBUSxLQUFLO0FBQUEsSUFDeEQ7QUFDQSxZQUFRLE9BQU8sQ0FBQyxHQUFHO0FBQUEsTUFDZixLQUFLO0FBQUEsTUFDTCxLQUFLLEtBQUs7QUFDTixjQUFNLEtBQUssT0FBTyxRQUFRLElBQUk7QUFDOUIsY0FBTSxPQUFPLE9BQU8sVUFBVSxHQUFHLEVBQUU7QUFDbkMsY0FBTSxPQUFPLE9BQU8sVUFBVSxLQUFLLENBQUMsSUFBSTtBQUN4QyxjQUFNLFFBQVE7QUFBQSxVQUNWLEVBQUUsTUFBTSx1QkFBdUIsUUFBUSxRQUFBQSxTQUFRLFFBQVEsS0FBSztBQUFBLFFBQ2hFO0FBQ0EsWUFBSSxDQUFDLG1CQUFtQixPQUFPLEdBQUc7QUFDOUIsZ0JBQU0sS0FBSyxFQUFFLE1BQU0sV0FBVyxRQUFRLElBQUksUUFBQUEsU0FBUSxRQUFRLEtBQUssQ0FBQztBQUNwRSxlQUFPLEVBQUUsTUFBTSxnQkFBZ0IsUUFBUSxRQUFBQSxTQUFRLE9BQU8sUUFBUSxLQUFLO0FBQUEsTUFDdkU7QUFBQSxNQUNBLEtBQUs7QUFDRCxlQUFPLEVBQUUsTUFBTSx3QkFBd0IsUUFBUSxRQUFBQSxTQUFRLFFBQVEsSUFBSTtBQUFBLE1BQ3ZFLEtBQUs7QUFDRCxlQUFPLEVBQUUsTUFBTSx3QkFBd0IsUUFBUSxRQUFBQSxTQUFRLFFBQVEsSUFBSTtBQUFBLE1BQ3ZFO0FBQ0ksZUFBTyxFQUFFLE1BQU0sVUFBVSxRQUFRLFFBQUFBLFNBQVEsUUFBUSxJQUFJO0FBQUEsSUFDN0Q7QUFBQSxFQUNKO0FBaUJBLFdBQVMsZUFBZSxPQUFPLE9BQU8sVUFBVSxDQUFDLEdBQUc7QUFDaEQsUUFBSSxFQUFFLFdBQVcsT0FBTyxjQUFjLE9BQU8sU0FBUyxPQUFPLEtBQUssSUFBSTtBQUN0RSxRQUFJQSxVQUFTLFlBQVksUUFBUSxNQUFNLFNBQVM7QUFDaEQsUUFBSSxZQUFZLE9BQU9BLFlBQVc7QUFDOUIsTUFBQUEsV0FBVTtBQUNkLFFBQUksQ0FBQztBQUNELGNBQVEsTUFBTSxNQUFNO0FBQUEsUUFDaEIsS0FBSztBQUNELGlCQUFPO0FBQ1A7QUFBQSxRQUNKLEtBQUs7QUFDRCxpQkFBTztBQUNQO0FBQUEsUUFDSixLQUFLLGdCQUFnQjtBQUNqQixnQkFBTSxTQUFTLE1BQU0sTUFBTSxDQUFDO0FBQzVCLGNBQUksT0FBTyxTQUFTO0FBQ2hCLGtCQUFNLElBQUksTUFBTSw2QkFBNkI7QUFDakQsaUJBQU8sT0FBTyxPQUFPLENBQUMsTUFBTSxNQUFNLGlCQUFpQjtBQUNuRDtBQUFBLFFBQ0o7QUFBQSxRQUNBO0FBQ0ksaUJBQU87QUFBQSxNQUNmO0FBQ0osVUFBTSxTQUFTLGdCQUFnQixFQUFFLE1BQU0sTUFBTSxHQUFHO0FBQUEsTUFDNUMsYUFBYSxlQUFlQSxZQUFXO0FBQUEsTUFDdkMsUUFBUUEsWUFBVyxRQUFRQSxVQUFTLElBQUksSUFBSSxPQUFPQSxPQUFNLElBQUk7QUFBQSxNQUM3RDtBQUFBLE1BQ0EsU0FBUyxFQUFFLFlBQVksTUFBTSxXQUFXLEdBQUc7QUFBQSxJQUMvQyxDQUFDO0FBQ0QsWUFBUSxPQUFPLENBQUMsR0FBRztBQUFBLE1BQ2YsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUNELDRCQUFvQixPQUFPLE1BQU07QUFDakM7QUFBQSxNQUNKLEtBQUs7QUFDRCwyQkFBbUIsT0FBTyxRQUFRLHNCQUFzQjtBQUN4RDtBQUFBLE1BQ0osS0FBSztBQUNELDJCQUFtQixPQUFPLFFBQVEsc0JBQXNCO0FBQ3hEO0FBQUEsTUFDSjtBQUNJLDJCQUFtQixPQUFPLFFBQVEsUUFBUTtBQUFBLElBQ2xEO0FBQUEsRUFDSjtBQUNBLFdBQVMsb0JBQW9CLE9BQU8sUUFBUTtBQUN4QyxVQUFNLEtBQUssT0FBTyxRQUFRLElBQUk7QUFDOUIsVUFBTSxPQUFPLE9BQU8sVUFBVSxHQUFHLEVBQUU7QUFDbkMsVUFBTSxPQUFPLE9BQU8sVUFBVSxLQUFLLENBQUMsSUFBSTtBQUN4QyxRQUFJLE1BQU0sU0FBUyxnQkFBZ0I7QUFDL0IsWUFBTSxTQUFTLE1BQU0sTUFBTSxDQUFDO0FBQzVCLFVBQUksT0FBTyxTQUFTO0FBQ2hCLGNBQU0sSUFBSSxNQUFNLDZCQUE2QjtBQUNqRCxhQUFPLFNBQVM7QUFDaEIsWUFBTSxTQUFTO0FBQUEsSUFDbkIsT0FDSztBQUNELFlBQU0sRUFBRSxPQUFPLElBQUk7QUFDbkIsWUFBTUEsVUFBUyxZQUFZLFFBQVEsTUFBTSxTQUFTO0FBQ2xELFlBQU0sUUFBUTtBQUFBLFFBQ1YsRUFBRSxNQUFNLHVCQUF1QixRQUFRLFFBQUFBLFNBQVEsUUFBUSxLQUFLO0FBQUEsTUFDaEU7QUFDQSxVQUFJLENBQUMsbUJBQW1CLE9BQU8sU0FBUyxRQUFRLE1BQU0sTUFBTSxNQUFTO0FBQ2pFLGNBQU0sS0FBSyxFQUFFLE1BQU0sV0FBVyxRQUFRLElBQUksUUFBQUEsU0FBUSxRQUFRLEtBQUssQ0FBQztBQUNwRSxpQkFBVyxPQUFPLE9BQU8sS0FBSyxLQUFLO0FBQy9CLFlBQUksUUFBUSxVQUFVLFFBQVE7QUFDMUIsaUJBQU8sTUFBTSxHQUFHO0FBQ3hCLGFBQU8sT0FBTyxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsUUFBQUEsU0FBUSxPQUFPLFFBQVEsS0FBSyxDQUFDO0FBQUEsSUFDOUU7QUFBQSxFQUNKO0FBRUEsV0FBUyxtQkFBbUIsT0FBTyxLQUFLO0FBQ3BDLFFBQUk7QUFDQSxpQkFBVyxNQUFNO0FBQ2IsZ0JBQVEsR0FBRyxNQUFNO0FBQUEsVUFDYixLQUFLO0FBQUEsVUFDTCxLQUFLO0FBQ0Qsa0JBQU0sS0FBSyxFQUFFO0FBQ2I7QUFBQSxVQUNKLEtBQUs7QUFDRCxrQkFBTSxLQUFLLEVBQUU7QUFDYixtQkFBTztBQUFBLFFBQ2Y7QUFDUixXQUFPO0FBQUEsRUFDWDtBQUNBLFdBQVMsbUJBQW1CLE9BQU8sUUFBUSxNQUFNO0FBQzdDLFlBQVEsTUFBTSxNQUFNO0FBQUEsTUFDaEIsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUNELGNBQU0sT0FBTztBQUNiLGNBQU0sU0FBUztBQUNmO0FBQUEsTUFDSixLQUFLLGdCQUFnQjtBQUNqQixjQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sQ0FBQztBQUMvQixZQUFJLEtBQUssT0FBTztBQUNoQixZQUFJLE1BQU0sTUFBTSxDQUFDLEVBQUUsU0FBUztBQUN4QixnQkFBTSxNQUFNLE1BQU0sQ0FBQyxFQUFFLE9BQU87QUFDaEMsbUJBQVcsT0FBTztBQUNkLGNBQUksVUFBVTtBQUNsQixlQUFPLE1BQU07QUFDYixlQUFPLE9BQU8sT0FBTyxFQUFFLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFDMUM7QUFBQSxNQUNKO0FBQUEsTUFDQSxLQUFLO0FBQUEsTUFDTCxLQUFLLGFBQWE7QUFDZCxjQUFNLFNBQVMsTUFBTSxTQUFTLE9BQU87QUFDckMsY0FBTSxLQUFLLEVBQUUsTUFBTSxXQUFXLFFBQVEsUUFBUSxNQUFNLFFBQVEsUUFBUSxLQUFLO0FBQ3pFLGVBQU8sTUFBTTtBQUNiLGVBQU8sT0FBTyxPQUFPLEVBQUUsTUFBTSxRQUFRLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNoRDtBQUFBLE1BQ0o7QUFBQSxNQUNBLFNBQVM7QUFDTCxjQUFNQSxVQUFTLFlBQVksUUFBUSxNQUFNLFNBQVM7QUFDbEQsY0FBTSxNQUFNLFNBQVMsU0FBUyxNQUFNLFFBQVEsTUFBTSxHQUFHLElBQy9DLE1BQU0sSUFBSSxPQUFPLFFBQU0sR0FBRyxTQUFTLFdBQ2pDLEdBQUcsU0FBUyxhQUNaLEdBQUcsU0FBUyxTQUFTLElBQ3ZCLENBQUM7QUFDUCxtQkFBVyxPQUFPLE9BQU8sS0FBSyxLQUFLO0FBQy9CLGNBQUksUUFBUSxVQUFVLFFBQVE7QUFDMUIsbUJBQU8sTUFBTSxHQUFHO0FBQ3hCLGVBQU8sT0FBTyxPQUFPLEVBQUUsTUFBTSxRQUFBQSxTQUFRLFFBQVEsSUFBSSxDQUFDO0FBQUEsTUFDdEQ7QUFBQSxJQUNKO0FBQUEsRUFDSjs7O0FDN01BLE1BQU1DLGFBQVksQ0FBQyxRQUFRLFVBQVUsTUFBTSxlQUFlLEdBQUcsSUFBSSxjQUFjLEdBQUc7QUFDbEYsV0FBUyxlQUFlLE9BQU87QUFDM0IsWUFBUSxNQUFNLE1BQU07QUFBQSxNQUNoQixLQUFLLGdCQUFnQjtBQUNqQixZQUFJLE1BQU07QUFDVixtQkFBVyxPQUFPLE1BQU07QUFDcEIsaUJBQU8sZUFBZSxHQUFHO0FBQzdCLGVBQU8sTUFBTSxNQUFNO0FBQUEsTUFDdkI7QUFBQSxNQUNBLEtBQUs7QUFBQSxNQUNMLEtBQUssYUFBYTtBQUNkLFlBQUksTUFBTTtBQUNWLG1CQUFXLFFBQVEsTUFBTTtBQUNyQixpQkFBTyxjQUFjLElBQUk7QUFDN0IsZUFBTztBQUFBLE1BQ1g7QUFBQSxNQUNBLEtBQUssbUJBQW1CO0FBQ3BCLFlBQUksTUFBTSxNQUFNLE1BQU07QUFDdEIsbUJBQVcsUUFBUSxNQUFNO0FBQ3JCLGlCQUFPLGNBQWMsSUFBSTtBQUM3QixtQkFBVyxNQUFNLE1BQU07QUFDbkIsaUJBQU8sR0FBRztBQUNkLGVBQU87QUFBQSxNQUNYO0FBQUEsTUFDQSxLQUFLLFlBQVk7QUFDYixZQUFJLE1BQU0sY0FBYyxLQUFLO0FBQzdCLFlBQUksTUFBTTtBQUNOLHFCQUFXLE1BQU0sTUFBTTtBQUNuQixtQkFBTyxHQUFHO0FBQ2xCLGVBQU87QUFBQSxNQUNYO0FBQUEsTUFDQSxTQUFTO0FBQ0wsWUFBSSxNQUFNLE1BQU07QUFDaEIsWUFBSSxTQUFTLFNBQVMsTUFBTTtBQUN4QixxQkFBVyxNQUFNLE1BQU07QUFDbkIsbUJBQU8sR0FBRztBQUNsQixlQUFPO0FBQUEsTUFDWDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0EsV0FBUyxjQUFjLEVBQUUsT0FBTyxLQUFLLEtBQUssTUFBTSxHQUFHO0FBQy9DLFFBQUksTUFBTTtBQUNWLGVBQVcsTUFBTTtBQUNiLGFBQU8sR0FBRztBQUNkLFFBQUk7QUFDQSxhQUFPLGVBQWUsR0FBRztBQUM3QixRQUFJO0FBQ0EsaUJBQVcsTUFBTTtBQUNiLGVBQU8sR0FBRztBQUNsQixRQUFJO0FBQ0EsYUFBTyxlQUFlLEtBQUs7QUFDL0IsV0FBTztBQUFBLEVBQ1g7OztBQzFEQSxNQUFNQyxTQUFRLHVCQUFPLGFBQWE7QUFDbEMsTUFBTUMsUUFBTyx1QkFBTyxlQUFlO0FBQ25DLE1BQU1DLFVBQVMsdUJBQU8sYUFBYTtBQTZCbkMsV0FBU0MsT0FBTSxLQUFLLFNBQVM7QUFDekIsUUFBSSxVQUFVLE9BQU8sSUFBSSxTQUFTO0FBQzlCLFlBQU0sRUFBRSxPQUFPLElBQUksT0FBTyxPQUFPLElBQUksTUFBTTtBQUMvQyxXQUFPLE9BQU8sT0FBTyxDQUFDLENBQUMsR0FBRyxLQUFLLE9BQU87QUFBQSxFQUMxQztBQUtBLEVBQUFBLE9BQU0sUUFBUUg7QUFFZCxFQUFBRyxPQUFNLE9BQU9GO0FBRWIsRUFBQUUsT0FBTSxTQUFTRDtBQUVmLEVBQUFDLE9BQU0sYUFBYSxDQUFDLEtBQUssU0FBUztBQUM5QixRQUFJLE9BQU87QUFDWCxlQUFXLENBQUMsT0FBTyxLQUFLLEtBQUssTUFBTTtBQUMvQixZQUFNLE1BQU0sT0FBTyxLQUFLO0FBQ3hCLFVBQUksT0FBTyxXQUFXLEtBQUs7QUFDdkIsZUFBTyxJQUFJLE1BQU0sS0FBSztBQUFBLE1BQzFCO0FBRUksZUFBTztBQUFBLElBQ2Y7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQU1BLEVBQUFBLE9BQU0sbUJBQW1CLENBQUMsS0FBSyxTQUFTO0FBQ3BDLFVBQU0sU0FBU0EsT0FBTSxXQUFXLEtBQUssS0FBSyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ3RELFVBQU0sUUFBUSxLQUFLLEtBQUssU0FBUyxDQUFDLEVBQUUsQ0FBQztBQUNyQyxVQUFNLE9BQU8sU0FBUyxLQUFLO0FBQzNCLFFBQUksUUFBUSxXQUFXO0FBQ25CLGFBQU87QUFDWCxVQUFNLElBQUksTUFBTSw2QkFBNkI7QUFBQSxFQUNqRDtBQUNBLFdBQVMsT0FBTyxNQUFNLE1BQU0sU0FBUztBQUNqQyxRQUFJLE9BQU8sUUFBUSxNQUFNLElBQUk7QUFDN0IsUUFBSSxPQUFPLFNBQVM7QUFDaEIsYUFBTztBQUNYLGVBQVcsU0FBUyxDQUFDLE9BQU8sT0FBTyxHQUFHO0FBQ2xDLFlBQU0sUUFBUSxLQUFLLEtBQUs7QUFDeEIsVUFBSSxTQUFTLFdBQVcsT0FBTztBQUMzQixpQkFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLE1BQU0sUUFBUSxFQUFFLEdBQUc7QUFDekMsZ0JBQU0sS0FBSyxPQUFPLE9BQU8sT0FBTyxLQUFLLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sTUFBTSxDQUFDLEdBQUcsT0FBTztBQUNuRixjQUFJLE9BQU8sT0FBTztBQUNkLGdCQUFJLEtBQUs7QUFBQSxtQkFDSixPQUFPSDtBQUNaLG1CQUFPQTtBQUFBLG1CQUNGLE9BQU9FLFNBQVE7QUFDcEIsa0JBQU0sTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUN2QixpQkFBSztBQUFBLFVBQ1Q7QUFBQSxRQUNKO0FBQ0EsWUFBSSxPQUFPLFNBQVMsY0FBYyxVQUFVO0FBQ3hDLGlCQUFPLEtBQUssTUFBTSxJQUFJO0FBQUEsTUFDOUI7QUFBQSxJQUNKO0FBQ0EsV0FBTyxPQUFPLFNBQVMsYUFBYSxLQUFLLE1BQU0sSUFBSSxJQUFJO0FBQUEsRUFDM0Q7OztBSHpGQSxNQUFNLE1BQU07QUFFWixNQUFNLFdBQVc7QUFFakIsTUFBTSxXQUFXO0FBRWpCLE1BQU1FLFVBQVM7QUFFZixNQUFNQyxnQkFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFNBQVMsV0FBVztBQUV0RCxNQUFNQyxZQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsVUFDekIsTUFBTSxTQUFTLFlBQ1osTUFBTSxTQUFTLDBCQUNmLE1BQU0sU0FBUywwQkFDZixNQUFNLFNBQVM7QUFHdkIsV0FBUyxZQUFZLE9BQU87QUFDeEIsWUFBUSxPQUFPO0FBQUEsTUFDWCxLQUFLO0FBQ0QsZUFBTztBQUFBLE1BQ1gsS0FBSztBQUNELGVBQU87QUFBQSxNQUNYLEtBQUs7QUFDRCxlQUFPO0FBQUEsTUFDWCxLQUFLRjtBQUNELGVBQU87QUFBQSxNQUNYO0FBQ0ksZUFBTyxLQUFLLFVBQVUsS0FBSztBQUFBLElBQ25DO0FBQUEsRUFDSjtBQUVBLFdBQVMsVUFBVSxRQUFRO0FBQ3ZCLFlBQVEsUUFBUTtBQUFBLE1BQ1osS0FBSztBQUNELGVBQU87QUFBQSxNQUNYLEtBQUs7QUFDRCxlQUFPO0FBQUEsTUFDWCxLQUFLO0FBQ0QsZUFBTztBQUFBLE1BQ1gsS0FBS0E7QUFDRCxlQUFPO0FBQUEsTUFDWCxLQUFLO0FBQ0QsZUFBTztBQUFBLE1BQ1gsS0FBSztBQUNELGVBQU87QUFBQSxNQUNYLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFDRCxlQUFPO0FBQUEsTUFDWCxLQUFLO0FBQ0QsZUFBTztBQUFBLE1BQ1gsS0FBSztBQUNELGVBQU87QUFBQSxNQUNYLEtBQUs7QUFDRCxlQUFPO0FBQUEsTUFDWCxLQUFLO0FBQ0QsZUFBTztBQUFBLE1BQ1gsS0FBSztBQUNELGVBQU87QUFBQSxNQUNYLEtBQUs7QUFDRCxlQUFPO0FBQUEsTUFDWCxLQUFLO0FBQ0QsZUFBTztBQUFBLE1BQ1gsS0FBSztBQUNELGVBQU87QUFBQSxJQUNmO0FBQ0EsWUFBUSxPQUFPLENBQUMsR0FBRztBQUFBLE1BQ2YsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUNELGVBQU87QUFBQSxNQUNYLEtBQUs7QUFDRCxlQUFPO0FBQUEsTUFDWCxLQUFLO0FBQ0QsZUFBTztBQUFBLE1BQ1gsS0FBSztBQUNELGVBQU87QUFBQSxNQUNYLEtBQUs7QUFDRCxlQUFPO0FBQUEsTUFDWCxLQUFLO0FBQ0QsZUFBTztBQUFBLE1BQ1gsS0FBSztBQUNELGVBQU87QUFBQSxNQUNYLEtBQUs7QUFDRCxlQUFPO0FBQUEsTUFDWCxLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQ0QsZUFBTztBQUFBLElBQ2Y7QUFDQSxXQUFPO0FBQUEsRUFDWDs7O0FJMUJBLFdBQVMsUUFBUSxJQUFJO0FBQ2pCLFlBQVEsSUFBSTtBQUFBLE1BQ1IsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUNELGVBQU87QUFBQSxNQUNYO0FBQ0ksZUFBTztBQUFBLElBQ2Y7QUFBQSxFQUNKO0FBQ0EsTUFBTSxZQUFZLElBQUksSUFBSSx3QkFBd0I7QUFDbEQsTUFBTSxXQUFXLElBQUksSUFBSSxtRkFBbUY7QUFDNUcsTUFBTSxxQkFBcUIsSUFBSSxJQUFJLE9BQU87QUFDMUMsTUFBTSxxQkFBcUIsSUFBSSxJQUFJLGFBQWM7QUFDakQsTUFBTSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxtQkFBbUIsSUFBSSxFQUFFO0FBZ0JoRSxNQUFNLFFBQU4sTUFBWTtBQUFBLElBQ1IsY0FBYztBQUtWLFdBQUssUUFBUTtBQU1iLFdBQUssb0JBQW9CO0FBTXpCLFdBQUssa0JBQWtCO0FBRXZCLFdBQUssU0FBUztBQUtkLFdBQUssVUFBVTtBQUVmLFdBQUssWUFBWTtBQUtqQixXQUFLLGFBQWE7QUFFbEIsV0FBSyxjQUFjO0FBRW5CLFdBQUssYUFBYTtBQUVsQixXQUFLLE9BQU87QUFFWixXQUFLLE1BQU07QUFBQSxJQUNmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFPQSxDQUFDLElBQUksUUFBUSxhQUFhLE9BQU87QUFDN0IsVUFBSSxRQUFRO0FBQ1IsWUFBSSxPQUFPLFdBQVc7QUFDbEIsZ0JBQU0sVUFBVSx3QkFBd0I7QUFDNUMsYUFBSyxTQUFTLEtBQUssU0FBUyxLQUFLLFNBQVMsU0FBUztBQUNuRCxhQUFLLGFBQWE7QUFBQSxNQUN0QjtBQUNBLFdBQUssUUFBUSxDQUFDO0FBQ2QsVUFBSSxPQUFPLEtBQUssUUFBUTtBQUN4QixhQUFPLFNBQVMsY0FBYyxLQUFLLFNBQVMsQ0FBQztBQUN6QyxlQUFPLE9BQU8sS0FBSyxVQUFVLElBQUk7QUFBQSxJQUN6QztBQUFBLElBQ0EsWUFBWTtBQUNSLFVBQUksSUFBSSxLQUFLO0FBQ2IsVUFBSSxLQUFLLEtBQUssT0FBTyxDQUFDO0FBQ3RCLGFBQU8sT0FBTyxPQUFPLE9BQU87QUFDeEIsYUFBSyxLQUFLLE9BQU8sRUFBRSxDQUFDO0FBQ3hCLFVBQUksQ0FBQyxNQUFNLE9BQU8sT0FBTyxPQUFPO0FBQzVCLGVBQU87QUFDWCxVQUFJLE9BQU87QUFDUCxlQUFPLEtBQUssT0FBTyxJQUFJLENBQUMsTUFBTTtBQUNsQyxhQUFPO0FBQUEsSUFDWDtBQUFBLElBQ0EsT0FBTyxHQUFHO0FBQ04sYUFBTyxLQUFLLE9BQU8sS0FBSyxNQUFNLENBQUM7QUFBQSxJQUNuQztBQUFBLElBQ0EsZUFBZSxRQUFRO0FBQ25CLFVBQUksS0FBSyxLQUFLLE9BQU8sTUFBTTtBQUMzQixVQUFJLEtBQUssYUFBYSxHQUFHO0FBQ3JCLFlBQUlHLFVBQVM7QUFDYixlQUFPLE9BQU87QUFDVixlQUFLLEtBQUssT0FBTyxFQUFFQSxVQUFTLE1BQU07QUFDdEMsWUFBSSxPQUFPLE1BQU07QUFDYixnQkFBTSxPQUFPLEtBQUssT0FBT0EsVUFBUyxTQUFTLENBQUM7QUFDNUMsY0FBSSxTQUFTLFFBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSztBQUNqQyxtQkFBTyxTQUFTQSxVQUFTO0FBQUEsUUFDakM7QUFDQSxlQUFPLE9BQU8sUUFBUUEsV0FBVSxLQUFLLGNBQWUsQ0FBQyxNQUFNLENBQUMsS0FBSyxRQUMzRCxTQUFTQSxVQUNUO0FBQUEsTUFDVjtBQUNBLFVBQUksT0FBTyxPQUFPLE9BQU8sS0FBSztBQUMxQixjQUFNLEtBQUssS0FBSyxPQUFPLE9BQU8sUUFBUSxDQUFDO0FBQ3ZDLGFBQUssT0FBTyxTQUFTLE9BQU8sVUFBVSxRQUFRLEtBQUssT0FBTyxTQUFTLENBQUMsQ0FBQztBQUNqRSxpQkFBTztBQUFBLE1BQ2Y7QUFDQSxhQUFPO0FBQUEsSUFDWDtBQUFBLElBQ0EsVUFBVTtBQUNOLFVBQUksTUFBTSxLQUFLO0FBQ2YsVUFBSSxPQUFPLFFBQVEsWUFBYSxRQUFRLE1BQU0sTUFBTSxLQUFLLEtBQU07QUFDM0QsY0FBTSxLQUFLLE9BQU8sUUFBUSxNQUFNLEtBQUssR0FBRztBQUN4QyxhQUFLLGFBQWE7QUFBQSxNQUN0QjtBQUNBLFVBQUksUUFBUTtBQUNSLGVBQU8sS0FBSyxRQUFRLEtBQUssT0FBTyxVQUFVLEtBQUssR0FBRyxJQUFJO0FBQzFELFVBQUksS0FBSyxPQUFPLE1BQU0sQ0FBQyxNQUFNO0FBQ3pCLGVBQU87QUFDWCxhQUFPLEtBQUssT0FBTyxVQUFVLEtBQUssS0FBSyxHQUFHO0FBQUEsSUFDOUM7QUFBQSxJQUNBLFNBQVMsR0FBRztBQUNSLGFBQU8sS0FBSyxNQUFNLEtBQUssS0FBSyxPQUFPO0FBQUEsSUFDdkM7QUFBQSxJQUNBLFFBQVEsT0FBTztBQUNYLFdBQUssU0FBUyxLQUFLLE9BQU8sVUFBVSxLQUFLLEdBQUc7QUFDNUMsV0FBSyxNQUFNO0FBQ1gsV0FBSyxhQUFhO0FBQ2xCLFdBQUssT0FBTztBQUNaLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFDQSxLQUFLLEdBQUc7QUFDSixhQUFPLEtBQUssT0FBTyxPQUFPLEtBQUssS0FBSyxDQUFDO0FBQUEsSUFDekM7QUFBQSxJQUNBLENBQUMsVUFBVSxNQUFNO0FBQ2IsY0FBUSxNQUFNO0FBQUEsUUFDVixLQUFLO0FBQ0QsaUJBQU8sT0FBTyxLQUFLLFlBQVk7QUFBQSxRQUNuQyxLQUFLO0FBQ0QsaUJBQU8sT0FBTyxLQUFLLGVBQWU7QUFBQSxRQUN0QyxLQUFLO0FBQ0QsaUJBQU8sT0FBTyxLQUFLLGdCQUFnQjtBQUFBLFFBQ3ZDLEtBQUs7QUFDRCxpQkFBTyxPQUFPLEtBQUssY0FBYztBQUFBLFFBQ3JDLEtBQUs7QUFDRCxpQkFBTyxPQUFPLEtBQUssb0JBQW9CO0FBQUEsUUFDM0MsS0FBSztBQUNELGlCQUFPLE9BQU8sS0FBSyxrQkFBa0I7QUFBQSxRQUN6QyxLQUFLO0FBQ0QsaUJBQU8sT0FBTyxLQUFLLGlCQUFpQjtBQUFBLFFBQ3hDLEtBQUs7QUFDRCxpQkFBTyxPQUFPLEtBQUssaUJBQWlCO0FBQUEsTUFDNUM7QUFBQSxJQUNKO0FBQUEsSUFDQSxDQUFDLGNBQWM7QUFDWCxVQUFJLE9BQU8sS0FBSyxRQUFRO0FBQ3hCLFVBQUksU0FBUztBQUNULGVBQU8sS0FBSyxRQUFRLFFBQVE7QUFDaEMsVUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLO0FBQ2pCLGVBQU8sS0FBSyxVQUFVLENBQUM7QUFDdkIsZUFBTyxLQUFLLFVBQVUsQ0FBQztBQUFBLE1BQzNCO0FBQ0EsVUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLO0FBQ2pCLFlBQUksU0FBUyxLQUFLO0FBQ2xCLFlBQUksS0FBSyxLQUFLLFFBQVEsR0FBRztBQUN6QixlQUFPLE9BQU8sSUFBSTtBQUNkLGdCQUFNLEtBQUssS0FBSyxLQUFLLENBQUM7QUFDdEIsY0FBSSxPQUFPLE9BQU8sT0FBTyxLQUFNO0FBQzNCLHFCQUFTLEtBQUs7QUFDZDtBQUFBLFVBQ0osT0FDSztBQUNELGlCQUFLLEtBQUssUUFBUSxLQUFLLEtBQUssQ0FBQztBQUFBLFVBQ2pDO0FBQUEsUUFDSjtBQUNBLGVBQU8sTUFBTTtBQUNULGdCQUFNLEtBQUssS0FBSyxTQUFTLENBQUM7QUFDMUIsY0FBSSxPQUFPLE9BQU8sT0FBTztBQUNyQixzQkFBVTtBQUFBO0FBRVY7QUFBQSxRQUNSO0FBQ0EsY0FBTSxLQUFLLE9BQU8sS0FBSyxVQUFVLE1BQU0sTUFBTSxPQUFPLEtBQUssV0FBVyxJQUFJO0FBQ3hFLGVBQU8sS0FBSyxVQUFVLEtBQUssU0FBUyxDQUFDO0FBQ3JDLGFBQUssWUFBWTtBQUNqQixlQUFPO0FBQUEsTUFDWDtBQUNBLFVBQUksS0FBSyxVQUFVLEdBQUc7QUFDbEIsY0FBTSxLQUFLLE9BQU8sS0FBSyxXQUFXLElBQUk7QUFDdEMsZUFBTyxLQUFLLFVBQVUsS0FBSyxTQUFTLEVBQUU7QUFDdEMsZUFBTyxLQUFLLFlBQVk7QUFDeEIsZUFBTztBQUFBLE1BQ1g7QUFDQSxZQUFNO0FBQ04sYUFBTyxPQUFPLEtBQUssZUFBZTtBQUFBLElBQ3RDO0FBQUEsSUFDQSxDQUFDLGlCQUFpQjtBQUNkLFlBQU0sS0FBSyxLQUFLLE9BQU8sQ0FBQztBQUN4QixVQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7QUFDYixlQUFPLEtBQUssUUFBUSxZQUFZO0FBQ3BDLFVBQUksT0FBTyxPQUFPLE9BQU8sS0FBSztBQUMxQixZQUFJLENBQUMsS0FBSyxTQUFTLENBQUMsS0FBSyxTQUFTLENBQUM7QUFDL0IsaUJBQU8sS0FBSyxRQUFRLFlBQVk7QUFDcEMsY0FBTSxJQUFJLEtBQUssS0FBSyxDQUFDO0FBQ3JCLGFBQUssTUFBTSxTQUFTLE1BQU0sVUFBVSxRQUFRLEtBQUssT0FBTyxDQUFDLENBQUMsR0FBRztBQUN6RCxpQkFBTyxLQUFLLFVBQVUsQ0FBQztBQUN2QixlQUFLLGNBQWM7QUFDbkIsZUFBSyxhQUFhO0FBQ2xCLGlCQUFPLE1BQU0sUUFBUSxRQUFRO0FBQUEsUUFDakM7QUFBQSxNQUNKO0FBQ0EsV0FBSyxjQUFjLE9BQU8sS0FBSyxXQUFXLEtBQUs7QUFDL0MsVUFBSSxLQUFLLGFBQWEsS0FBSyxlQUFlLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDO0FBQzdELGFBQUssYUFBYSxLQUFLO0FBQzNCLGFBQU8sT0FBTyxLQUFLLGdCQUFnQjtBQUFBLElBQ3ZDO0FBQUEsSUFDQSxDQUFDLGtCQUFrQjtBQUNmLFlBQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLEtBQUssQ0FBQztBQUM5QixVQUFJLENBQUMsT0FBTyxDQUFDLEtBQUs7QUFDZCxlQUFPLEtBQUssUUFBUSxhQUFhO0FBQ3JDLFdBQUssUUFBUSxPQUFPLFFBQVEsT0FBTyxRQUFRLFFBQVEsUUFBUSxHQUFHLEdBQUc7QUFDN0QsY0FBTSxLQUFLLE9BQU8sS0FBSyxVQUFVLENBQUMsTUFBTSxPQUFPLEtBQUssV0FBVyxJQUFJO0FBQ25FLGFBQUssYUFBYSxLQUFLLGNBQWM7QUFDckMsYUFBSyxlQUFlO0FBQ3BCLGVBQU87QUFBQSxNQUNYO0FBQ0EsYUFBTztBQUFBLElBQ1g7QUFBQSxJQUNBLENBQUMsZ0JBQWdCO0FBQ2IsYUFBTyxLQUFLLFdBQVcsSUFBSTtBQUMzQixZQUFNLE9BQU8sS0FBSyxRQUFRO0FBQzFCLFVBQUksU0FBUztBQUNULGVBQU8sS0FBSyxRQUFRLEtBQUs7QUFDN0IsVUFBSSxJQUFJLE9BQU8sS0FBSyxlQUFlO0FBQ25DLGNBQVEsS0FBSyxDQUFDLEdBQUc7QUFBQSxRQUNiLEtBQUs7QUFDRCxpQkFBTyxLQUFLLFVBQVUsS0FBSyxTQUFTLENBQUM7QUFBQTtBQUFBLFFBRXpDLEtBQUs7QUFDRCxpQkFBTyxLQUFLLFlBQVk7QUFDeEIsaUJBQU8sT0FBTyxLQUFLLGVBQWU7QUFBQSxRQUN0QyxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQ0QsaUJBQU8sS0FBSyxVQUFVLENBQUM7QUFDdkIsZUFBSyxVQUFVO0FBQ2YsZUFBSyxZQUFZO0FBQ2pCLGlCQUFPO0FBQUEsUUFDWCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBRUQsaUJBQU8sS0FBSyxVQUFVLENBQUM7QUFDdkIsaUJBQU87QUFBQSxRQUNYLEtBQUs7QUFDRCxpQkFBTyxLQUFLLFVBQVUsZUFBZTtBQUNyQyxpQkFBTztBQUFBLFFBQ1gsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPLE9BQU8sS0FBSyxrQkFBa0I7QUFBQSxRQUN6QyxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQ0QsZUFBSyxPQUFPLEtBQUssdUJBQXVCO0FBQ3hDLGVBQUssT0FBTyxLQUFLLFdBQVcsSUFBSTtBQUNoQyxpQkFBTyxLQUFLLFVBQVUsS0FBSyxTQUFTLENBQUM7QUFDckMsaUJBQU8sS0FBSyxZQUFZO0FBQ3hCLGlCQUFPLE9BQU8sS0FBSyxpQkFBaUI7QUFBQSxRQUN4QztBQUNJLGlCQUFPLE9BQU8sS0FBSyxpQkFBaUI7QUFBQSxNQUM1QztBQUFBLElBQ0o7QUFBQSxJQUNBLENBQUMsc0JBQXNCO0FBQ25CLFVBQUksSUFBSTtBQUNSLFVBQUlBLFVBQVM7QUFDYixTQUFHO0FBQ0MsYUFBSyxPQUFPLEtBQUssWUFBWTtBQUM3QixZQUFJLEtBQUssR0FBRztBQUNSLGVBQUssT0FBTyxLQUFLLFdBQVcsS0FBSztBQUNqQyxlQUFLLGNBQWNBLFVBQVM7QUFBQSxRQUNoQyxPQUNLO0FBQ0QsZUFBSztBQUFBLFFBQ1Q7QUFDQSxjQUFNLE9BQU8sS0FBSyxXQUFXLElBQUk7QUFBQSxNQUNyQyxTQUFTLEtBQUssS0FBSztBQUNuQixZQUFNLE9BQU8sS0FBSyxRQUFRO0FBQzFCLFVBQUksU0FBUztBQUNULGVBQU8sS0FBSyxRQUFRLE1BQU07QUFDOUIsVUFBS0EsWUFBVyxNQUFNQSxVQUFTLEtBQUssY0FBYyxLQUFLLENBQUMsTUFBTSxPQUN6REEsWUFBVyxNQUNQLEtBQUssV0FBVyxLQUFLLEtBQUssS0FBSyxXQUFXLEtBQUssTUFDaEQsUUFBUSxLQUFLLENBQUMsQ0FBQyxHQUFJO0FBSXZCLGNBQU0sa0JBQWtCQSxZQUFXLEtBQUssYUFBYSxLQUNqRCxLQUFLLGNBQWMsTUFDbEIsS0FBSyxDQUFDLE1BQU0sT0FBTyxLQUFLLENBQUMsTUFBTTtBQUNwQyxZQUFJLENBQUMsaUJBQWlCO0FBRWxCLGVBQUssWUFBWTtBQUNqQixnQkFBTTtBQUNOLGlCQUFPLE9BQU8sS0FBSyxlQUFlO0FBQUEsUUFDdEM7QUFBQSxNQUNKO0FBQ0EsVUFBSSxJQUFJO0FBQ1IsYUFBTyxLQUFLLENBQUMsTUFBTSxLQUFLO0FBQ3BCLGFBQUssT0FBTyxLQUFLLFVBQVUsQ0FBQztBQUM1QixhQUFLLE9BQU8sS0FBSyxXQUFXLElBQUk7QUFDaEMsYUFBSyxVQUFVO0FBQUEsTUFDbkI7QUFDQSxXQUFLLE9BQU8sS0FBSyxlQUFlO0FBQ2hDLGNBQVEsS0FBSyxDQUFDLEdBQUc7QUFBQSxRQUNiLEtBQUs7QUFDRCxpQkFBTztBQUFBLFFBQ1gsS0FBSztBQUNELGlCQUFPLEtBQUssVUFBVSxLQUFLLFNBQVMsQ0FBQztBQUNyQyxpQkFBTztBQUFBLFFBQ1gsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPLEtBQUssVUFBVSxDQUFDO0FBQ3ZCLGVBQUssVUFBVTtBQUNmLGVBQUssYUFBYTtBQUNsQixpQkFBTztBQUFBLFFBQ1gsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPLEtBQUssVUFBVSxDQUFDO0FBQ3ZCLGVBQUssVUFBVTtBQUNmLGVBQUssYUFBYTtBQUNsQixpQkFBTyxLQUFLLFlBQVksU0FBUztBQUFBLFFBQ3JDLEtBQUs7QUFDRCxpQkFBTyxLQUFLLFVBQVUsZUFBZTtBQUNyQyxpQkFBTztBQUFBLFFBQ1gsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGVBQUssVUFBVTtBQUNmLGlCQUFPLE9BQU8sS0FBSyxrQkFBa0I7QUFBQSxRQUN6QyxLQUFLLEtBQUs7QUFDTixnQkFBTSxPQUFPLEtBQUssT0FBTyxDQUFDO0FBQzFCLGNBQUksS0FBSyxXQUFXLFFBQVEsSUFBSSxLQUFLLFNBQVMsS0FBSztBQUMvQyxpQkFBSyxVQUFVO0FBQ2YsbUJBQU8sS0FBSyxVQUFVLENBQUM7QUFDdkIsbUJBQU8sS0FBSyxXQUFXLElBQUk7QUFDM0IsbUJBQU87QUFBQSxVQUNYO0FBQUEsUUFDSjtBQUFBO0FBQUEsUUFFQTtBQUNJLGVBQUssVUFBVTtBQUNmLGlCQUFPLE9BQU8sS0FBSyxpQkFBaUI7QUFBQSxNQUM1QztBQUFBLElBQ0o7QUFBQSxJQUNBLENBQUMsb0JBQW9CO0FBQ2pCLFlBQU0sUUFBUSxLQUFLLE9BQU8sQ0FBQztBQUMzQixVQUFJLE1BQU0sS0FBSyxPQUFPLFFBQVEsT0FBTyxLQUFLLE1BQU0sQ0FBQztBQUNqRCxVQUFJLFVBQVUsS0FBSztBQUNmLGVBQU8sUUFBUSxNQUFNLEtBQUssT0FBTyxNQUFNLENBQUMsTUFBTTtBQUMxQyxnQkFBTSxLQUFLLE9BQU8sUUFBUSxLQUFLLE1BQU0sQ0FBQztBQUFBLE1BQzlDLE9BQ0s7QUFFRCxlQUFPLFFBQVEsSUFBSTtBQUNmLGNBQUksSUFBSTtBQUNSLGlCQUFPLEtBQUssT0FBTyxNQUFNLElBQUksQ0FBQyxNQUFNO0FBQ2hDLGlCQUFLO0FBQ1QsY0FBSSxJQUFJLE1BQU07QUFDVjtBQUNKLGdCQUFNLEtBQUssT0FBTyxRQUFRLEtBQUssTUFBTSxDQUFDO0FBQUEsUUFDMUM7QUFBQSxNQUNKO0FBRUEsWUFBTSxLQUFLLEtBQUssT0FBTyxVQUFVLEdBQUcsR0FBRztBQUN2QyxVQUFJLEtBQUssR0FBRyxRQUFRLE1BQU0sS0FBSyxHQUFHO0FBQ2xDLFVBQUksT0FBTyxJQUFJO0FBQ1gsZUFBTyxPQUFPLElBQUk7QUFDZCxnQkFBTSxLQUFLLEtBQUssZUFBZSxLQUFLLENBQUM7QUFDckMsY0FBSSxPQUFPO0FBQ1A7QUFDSixlQUFLLEdBQUcsUUFBUSxNQUFNLEVBQUU7QUFBQSxRQUM1QjtBQUNBLFlBQUksT0FBTyxJQUFJO0FBRVgsZ0JBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLE9BQU8sSUFBSTtBQUFBLFFBQzFDO0FBQUEsTUFDSjtBQUNBLFVBQUksUUFBUSxJQUFJO0FBQ1osWUFBSSxDQUFDLEtBQUs7QUFDTixpQkFBTyxLQUFLLFFBQVEsZUFBZTtBQUN2QyxjQUFNLEtBQUssT0FBTztBQUFBLE1BQ3RCO0FBQ0EsYUFBTyxLQUFLLFlBQVksTUFBTSxHQUFHLEtBQUs7QUFDdEMsYUFBTyxLQUFLLFlBQVksU0FBUztBQUFBLElBQ3JDO0FBQUEsSUFDQSxDQUFDLHlCQUF5QjtBQUN0QixXQUFLLG9CQUFvQjtBQUN6QixXQUFLLGtCQUFrQjtBQUN2QixVQUFJLElBQUksS0FBSztBQUNiLGFBQU8sTUFBTTtBQUNULGNBQU0sS0FBSyxLQUFLLE9BQU8sRUFBRSxDQUFDO0FBQzFCLFlBQUksT0FBTztBQUNQLGVBQUssa0JBQWtCO0FBQUEsaUJBQ2xCLEtBQUssT0FBTyxNQUFNO0FBQ3ZCLGVBQUssb0JBQW9CLE9BQU8sRUFBRSxJQUFJO0FBQUEsaUJBQ2pDLE9BQU87QUFDWjtBQUFBLE1BQ1I7QUFDQSxhQUFPLE9BQU8sS0FBSyxVQUFVLFFBQU0sUUFBUSxFQUFFLEtBQUssT0FBTyxHQUFHO0FBQUEsSUFDaEU7QUFBQSxJQUNBLENBQUMsbUJBQW1CO0FBQ2hCLFVBQUksS0FBSyxLQUFLLE1BQU07QUFDcEIsVUFBSUEsVUFBUztBQUNiLFVBQUk7QUFDSixXQUFNLFVBQVNDLEtBQUksS0FBSyxLQUFNLEtBQUssS0FBSyxPQUFPQSxFQUFDLEdBQUksRUFBRUEsSUFBRztBQUNyRCxnQkFBUSxJQUFJO0FBQUEsVUFDUixLQUFLO0FBQ0QsWUFBQUQsV0FBVTtBQUNWO0FBQUEsVUFDSixLQUFLO0FBQ0QsaUJBQUtDO0FBQ0wsWUFBQUQsVUFBUztBQUNUO0FBQUEsVUFDSixLQUFLLE1BQU07QUFDUCxrQkFBTSxPQUFPLEtBQUssT0FBT0MsS0FBSSxDQUFDO0FBQzlCLGdCQUFJLENBQUMsUUFBUSxDQUFDLEtBQUs7QUFDZixxQkFBTyxLQUFLLFFBQVEsY0FBYztBQUN0QyxnQkFBSSxTQUFTO0FBQ1Q7QUFBQSxVQUNSO0FBQUE7QUFBQSxVQUNBO0FBQ0ksa0JBQU07QUFBQSxRQUNkO0FBQUEsTUFDSjtBQUNBLFVBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztBQUNiLGVBQU8sS0FBSyxRQUFRLGNBQWM7QUFDdEMsVUFBSUQsV0FBVSxLQUFLLFlBQVk7QUFDM0IsWUFBSSxLQUFLLHNCQUFzQjtBQUMzQixlQUFLLGFBQWFBO0FBQUEsYUFDakI7QUFDRCxlQUFLLGFBQ0QsS0FBSyxxQkFBcUIsS0FBSyxlQUFlLElBQUksSUFBSSxLQUFLO0FBQUEsUUFDbkU7QUFDQSxXQUFHO0FBQ0MsZ0JBQU0sS0FBSyxLQUFLLGVBQWUsS0FBSyxDQUFDO0FBQ3JDLGNBQUksT0FBTztBQUNQO0FBQ0osZUFBSyxLQUFLLE9BQU8sUUFBUSxNQUFNLEVBQUU7QUFBQSxRQUNyQyxTQUFTLE9BQU87QUFDaEIsWUFBSSxPQUFPLElBQUk7QUFDWCxjQUFJLENBQUMsS0FBSztBQUNOLG1CQUFPLEtBQUssUUFBUSxjQUFjO0FBQ3RDLGVBQUssS0FBSyxPQUFPO0FBQUEsUUFDckI7QUFBQSxNQUNKO0FBR0EsVUFBSSxJQUFJLEtBQUs7QUFDYixXQUFLLEtBQUssT0FBTyxDQUFDO0FBQ2xCLGFBQU8sT0FBTztBQUNWLGFBQUssS0FBSyxPQUFPLEVBQUUsQ0FBQztBQUN4QixVQUFJLE9BQU8sS0FBTTtBQUNiLGVBQU8sT0FBTyxPQUFRLE9BQU8sT0FBTyxPQUFPLFFBQVEsT0FBTztBQUN0RCxlQUFLLEtBQUssT0FBTyxFQUFFLENBQUM7QUFDeEIsYUFBSyxJQUFJO0FBQUEsTUFDYixXQUNTLENBQUMsS0FBSyxpQkFBaUI7QUFDNUIsV0FBRztBQUNDLGNBQUlDLEtBQUksS0FBSztBQUNiLGNBQUlDLE1BQUssS0FBSyxPQUFPRCxFQUFDO0FBQ3RCLGNBQUlDLFFBQU87QUFDUCxZQUFBQSxNQUFLLEtBQUssT0FBTyxFQUFFRCxFQUFDO0FBQ3hCLGdCQUFNLFdBQVdBO0FBQ2pCLGlCQUFPQyxRQUFPO0FBQ1YsWUFBQUEsTUFBSyxLQUFLLE9BQU8sRUFBRUQsRUFBQztBQUN4QixjQUFJQyxRQUFPLFFBQVFELE1BQUssS0FBSyxPQUFPQSxLQUFJLElBQUlELFVBQVM7QUFDakQsaUJBQUtDO0FBQUE7QUFFTDtBQUFBLFFBQ1IsU0FBUztBQUFBLE1BQ2I7QUFDQSxZQUFNRTtBQUNOLGFBQU8sS0FBSyxZQUFZLEtBQUssR0FBRyxJQUFJO0FBQ3BDLGFBQU8sT0FBTyxLQUFLLGVBQWU7QUFBQSxJQUN0QztBQUFBLElBQ0EsQ0FBQyxtQkFBbUI7QUFDaEIsWUFBTSxTQUFTLEtBQUssWUFBWTtBQUNoQyxVQUFJLE1BQU0sS0FBSyxNQUFNO0FBQ3JCLFVBQUksSUFBSSxLQUFLLE1BQU07QUFDbkIsVUFBSTtBQUNKLGFBQVEsS0FBSyxLQUFLLE9BQU8sRUFBRSxDQUFDLEdBQUk7QUFDNUIsWUFBSSxPQUFPLEtBQUs7QUFDWixnQkFBTSxPQUFPLEtBQUssT0FBTyxJQUFJLENBQUM7QUFDOUIsY0FBSSxRQUFRLElBQUksS0FBTSxVQUFVLG1CQUFtQixJQUFJLElBQUk7QUFDdkQ7QUFDSixnQkFBTTtBQUFBLFFBQ1YsV0FDUyxRQUFRLEVBQUUsR0FBRztBQUNsQixjQUFJLE9BQU8sS0FBSyxPQUFPLElBQUksQ0FBQztBQUM1QixjQUFJLE9BQU8sTUFBTTtBQUNiLGdCQUFJLFNBQVMsTUFBTTtBQUNmLG1CQUFLO0FBQ0wsbUJBQUs7QUFDTCxxQkFBTyxLQUFLLE9BQU8sSUFBSSxDQUFDO0FBQUEsWUFDNUI7QUFFSSxvQkFBTTtBQUFBLFVBQ2Q7QUFDQSxjQUFJLFNBQVMsT0FBUSxVQUFVLG1CQUFtQixJQUFJLElBQUk7QUFDdEQ7QUFDSixjQUFJLE9BQU8sTUFBTTtBQUNiLGtCQUFNLEtBQUssS0FBSyxlQUFlLElBQUksQ0FBQztBQUNwQyxnQkFBSSxPQUFPO0FBQ1A7QUFDSixnQkFBSSxLQUFLLElBQUksR0FBRyxLQUFLLENBQUM7QUFBQSxVQUMxQjtBQUFBLFFBQ0osT0FDSztBQUNELGNBQUksVUFBVSxtQkFBbUIsSUFBSSxFQUFFO0FBQ25DO0FBQ0osZ0JBQU07QUFBQSxRQUNWO0FBQUEsTUFDSjtBQUNBLFVBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztBQUNiLGVBQU8sS0FBSyxRQUFRLGNBQWM7QUFDdEMsWUFBTUE7QUFDTixhQUFPLEtBQUssWUFBWSxNQUFNLEdBQUcsSUFBSTtBQUNyQyxhQUFPLFNBQVMsU0FBUztBQUFBLElBQzdCO0FBQUEsSUFDQSxDQUFDLFVBQVUsR0FBRztBQUNWLFVBQUksSUFBSSxHQUFHO0FBQ1AsY0FBTSxLQUFLLE9BQU8sT0FBTyxLQUFLLEtBQUssQ0FBQztBQUNwQyxhQUFLLE9BQU87QUFDWixlQUFPO0FBQUEsTUFDWDtBQUNBLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFDQSxDQUFDLFlBQVksR0FBRyxZQUFZO0FBQ3hCLFlBQU0sSUFBSSxLQUFLLE9BQU8sTUFBTSxLQUFLLEtBQUssQ0FBQztBQUN2QyxVQUFJLEdBQUc7QUFDSCxjQUFNO0FBQ04sYUFBSyxPQUFPLEVBQUU7QUFDZCxlQUFPLEVBQUU7QUFBQSxNQUNiLFdBQ1M7QUFDTCxjQUFNO0FBQ1YsYUFBTztBQUFBLElBQ1g7QUFBQSxJQUNBLENBQUMsaUJBQWlCO0FBQ2QsVUFBSSxJQUFJO0FBQ1IsV0FBTSxRQUFPLE1BQU07QUFDZixnQkFBUSxLQUFLLE9BQU8sQ0FBQyxHQUFHO0FBQUEsVUFDcEIsS0FBSztBQUNELGlCQUFLLE9BQU8sS0FBSyxRQUFRO0FBQ3pCLGlCQUFLLE9BQU8sS0FBSyxXQUFXLElBQUk7QUFDaEMscUJBQVM7QUFBQSxVQUNiLEtBQUs7QUFDRCxpQkFBSyxPQUFPLEtBQUssVUFBVSxlQUFlO0FBQzFDLGlCQUFLLE9BQU8sS0FBSyxXQUFXLElBQUk7QUFDaEMscUJBQVM7QUFBQSxVQUNiLEtBQUs7QUFBQTtBQUFBLFVBQ0wsS0FBSztBQUFBO0FBQUEsVUFDTCxLQUFLLEtBQUs7QUFDTixrQkFBTSxTQUFTLEtBQUssWUFBWTtBQUNoQyxrQkFBTSxNQUFNLEtBQUssT0FBTyxDQUFDO0FBQ3pCLGdCQUFJLFFBQVEsR0FBRyxLQUFNLFVBQVUsbUJBQW1CLElBQUksR0FBRyxHQUFJO0FBQ3pELGtCQUFJLENBQUM7QUFDRCxxQkFBSyxhQUFhLEtBQUssY0FBYztBQUFBLHVCQUNoQyxLQUFLO0FBQ1YscUJBQUssVUFBVTtBQUNuQixtQkFBSyxPQUFPLEtBQUssVUFBVSxDQUFDO0FBQzVCLG1CQUFLLE9BQU8sS0FBSyxXQUFXLElBQUk7QUFDaEMsdUJBQVM7QUFBQSxZQUNiO0FBQUEsVUFDSjtBQUFBLFFBQ0o7QUFDQSxjQUFNO0FBQUEsTUFDVjtBQUNBLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFDQSxDQUFDLFVBQVU7QUFDUCxVQUFJLEtBQUssT0FBTyxDQUFDLE1BQU0sS0FBSztBQUN4QixZQUFJLElBQUksS0FBSyxNQUFNO0FBQ25CLFlBQUksS0FBSyxLQUFLLE9BQU8sQ0FBQztBQUN0QixlQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssT0FBTztBQUMxQixlQUFLLEtBQUssT0FBTyxFQUFFLENBQUM7QUFDeEIsZUFBTyxPQUFPLEtBQUssWUFBWSxPQUFPLE1BQU0sSUFBSSxJQUFJLEdBQUcsS0FBSztBQUFBLE1BQ2hFLE9BQ0s7QUFDRCxZQUFJLElBQUksS0FBSyxNQUFNO0FBQ25CLFlBQUksS0FBSyxLQUFLLE9BQU8sQ0FBQztBQUN0QixlQUFPLElBQUk7QUFDUCxjQUFJLFNBQVMsSUFBSSxFQUFFO0FBQ2YsaUJBQUssS0FBSyxPQUFPLEVBQUUsQ0FBQztBQUFBLG1CQUNmLE9BQU8sT0FDWixVQUFVLElBQUksS0FBSyxPQUFPLElBQUksQ0FBQyxDQUFDLEtBQ2hDLFVBQVUsSUFBSSxLQUFLLE9BQU8sSUFBSSxDQUFDLENBQUMsR0FBRztBQUNuQyxpQkFBSyxLQUFLLE9BQVEsS0FBSyxDQUFFO0FBQUEsVUFDN0I7QUFFSTtBQUFBLFFBQ1I7QUFDQSxlQUFPLE9BQU8sS0FBSyxZQUFZLEdBQUcsS0FBSztBQUFBLE1BQzNDO0FBQUEsSUFDSjtBQUFBLElBQ0EsQ0FBQyxjQUFjO0FBQ1gsWUFBTSxLQUFLLEtBQUssT0FBTyxLQUFLLEdBQUc7QUFDL0IsVUFBSSxPQUFPO0FBQ1AsZUFBTyxPQUFPLEtBQUssVUFBVSxDQUFDO0FBQUEsZUFDekIsT0FBTyxRQUFRLEtBQUssT0FBTyxDQUFDLE1BQU07QUFDdkMsZUFBTyxPQUFPLEtBQUssVUFBVSxDQUFDO0FBQUE7QUFFOUIsZUFBTztBQUFBLElBQ2Y7QUFBQSxJQUNBLENBQUMsV0FBVyxXQUFXO0FBQ25CLFVBQUksSUFBSSxLQUFLLE1BQU07QUFDbkIsVUFBSTtBQUNKLFNBQUc7QUFDQyxhQUFLLEtBQUssT0FBTyxFQUFFLENBQUM7QUFBQSxNQUN4QixTQUFTLE9BQU8sT0FBUSxhQUFhLE9BQU87QUFDNUMsWUFBTSxJQUFJLElBQUksS0FBSztBQUNuQixVQUFJLElBQUksR0FBRztBQUNQLGNBQU0sS0FBSyxPQUFPLE9BQU8sS0FBSyxLQUFLLENBQUM7QUFDcEMsYUFBSyxNQUFNO0FBQUEsTUFDZjtBQUNBLGFBQU87QUFBQSxJQUNYO0FBQUEsSUFDQSxDQUFDLFVBQVUsTUFBTTtBQUNiLFVBQUksSUFBSSxLQUFLO0FBQ2IsVUFBSSxLQUFLLEtBQUssT0FBTyxDQUFDO0FBQ3RCLGFBQU8sQ0FBQyxLQUFLLEVBQUU7QUFDWCxhQUFLLEtBQUssT0FBTyxFQUFFLENBQUM7QUFDeEIsYUFBTyxPQUFPLEtBQUssWUFBWSxHQUFHLEtBQUs7QUFBQSxJQUMzQztBQUFBLEVBQ0o7OztBQ3pzQkEsTUFBTSxjQUFOLE1BQWtCO0FBQUEsSUFDZCxjQUFjO0FBQ1YsV0FBSyxhQUFhLENBQUM7QUFLbkIsV0FBSyxhQUFhLENBQUMsV0FBVyxLQUFLLFdBQVcsS0FBSyxNQUFNO0FBTXpELFdBQUssVUFBVSxDQUFDLFdBQVc7QUFDdkIsWUFBSSxNQUFNO0FBQ1YsWUFBSSxPQUFPLEtBQUssV0FBVztBQUMzQixlQUFPLE1BQU0sTUFBTTtBQUNmLGdCQUFNLE1BQU8sTUFBTSxRQUFTO0FBQzVCLGNBQUksS0FBSyxXQUFXLEdBQUcsSUFBSTtBQUN2QixrQkFBTSxNQUFNO0FBQUE7QUFFWixtQkFBTztBQUFBLFFBQ2Y7QUFDQSxZQUFJLEtBQUssV0FBVyxHQUFHLE1BQU07QUFDekIsaUJBQU8sRUFBRSxNQUFNLE1BQU0sR0FBRyxLQUFLLEVBQUU7QUFDbkMsWUFBSSxRQUFRO0FBQ1IsaUJBQU8sRUFBRSxNQUFNLEdBQUcsS0FBSyxPQUFPO0FBQ2xDLGNBQU0sUUFBUSxLQUFLLFdBQVcsTUFBTSxDQUFDO0FBQ3JDLGVBQU8sRUFBRSxNQUFNLEtBQUssS0FBSyxTQUFTLFFBQVEsRUFBRTtBQUFBLE1BQ2hEO0FBQUEsSUFDSjtBQUFBLEVBQ0o7OztBQ2pDQSxXQUFTLGNBQWMsTUFBTSxNQUFNO0FBQy9CLGFBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDL0IsVUFBSSxLQUFLLENBQUMsRUFBRSxTQUFTO0FBQ2pCLGVBQU87QUFDZixXQUFPO0FBQUEsRUFDWDtBQUNBLFdBQVMsa0JBQWtCLE1BQU07QUFDN0IsYUFBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLFFBQVEsRUFBRSxHQUFHO0FBQ2xDLGNBQVEsS0FBSyxDQUFDLEVBQUUsTUFBTTtBQUFBLFFBQ2xCLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFDRDtBQUFBLFFBQ0o7QUFDSSxpQkFBTztBQUFBLE1BQ2Y7QUFBQSxJQUNKO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFDQSxXQUFTLFlBQVksT0FBTztBQUN4QixZQUFRLE9BQU8sTUFBTTtBQUFBLE1BQ2pCLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFDRCxlQUFPO0FBQUEsTUFDWDtBQUNJLGVBQU87QUFBQSxJQUNmO0FBQUEsRUFDSjtBQUNBLFdBQVMsYUFBYSxRQUFRO0FBQzFCLFlBQVEsT0FBTyxNQUFNO0FBQUEsTUFDakIsS0FBSztBQUNELGVBQU8sT0FBTztBQUFBLE1BQ2xCLEtBQUssYUFBYTtBQUNkLGNBQU1DLE1BQUssT0FBTyxNQUFNLE9BQU8sTUFBTSxTQUFTLENBQUM7QUFDL0MsZUFBT0EsSUFBRyxPQUFPQSxJQUFHO0FBQUEsTUFDeEI7QUFBQSxNQUNBLEtBQUs7QUFDRCxlQUFPLE9BQU8sTUFBTSxPQUFPLE1BQU0sU0FBUyxDQUFDLEVBQUU7QUFBQTtBQUFBLE1BRWpEO0FBQ0ksZUFBTyxDQUFDO0FBQUEsSUFDaEI7QUFBQSxFQUNKO0FBRUEsV0FBUyxzQkFBc0IsTUFBTTtBQUNqQyxRQUFJLEtBQUssV0FBVztBQUNoQixhQUFPLENBQUM7QUFDWixRQUFJLElBQUksS0FBSztBQUNiLFNBQU0sUUFBTyxFQUFFLEtBQUssR0FBRztBQUNuQixjQUFRLEtBQUssQ0FBQyxFQUFFLE1BQU07QUFBQSxRQUNsQixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQ0QsZ0JBQU07QUFBQSxNQUNkO0FBQUEsSUFDSjtBQUNBLFdBQU8sS0FBSyxFQUFFLENBQUMsR0FBRyxTQUFTLFNBQVM7QUFBQSxJQUVwQztBQUNBLFdBQU8sS0FBSyxPQUFPLEdBQUcsS0FBSyxNQUFNO0FBQUEsRUFDckM7QUFDQSxXQUFTLGVBQWUsUUFBUSxRQUFRO0FBRXBDLFFBQUksT0FBTyxTQUFTO0FBQ2hCLFlBQU0sVUFBVSxLQUFLLE1BQU0sUUFBUSxNQUFNO0FBQUE7QUFFekMsZUFBUyxJQUFJLEdBQUcsSUFBSSxPQUFPLFFBQVEsRUFBRTtBQUNqQyxlQUFPLEtBQUssT0FBTyxDQUFDLENBQUM7QUFBQSxFQUNqQztBQUNBLFdBQVMsZ0JBQWdCLElBQUk7QUFDekIsUUFBSSxHQUFHLE1BQU0sU0FBUyxrQkFBa0I7QUFDcEMsaUJBQVdBLE9BQU0sR0FBRyxPQUFPO0FBQ3ZCLFlBQUlBLElBQUcsT0FDSCxDQUFDQSxJQUFHLFNBQ0osQ0FBQyxjQUFjQSxJQUFHLE9BQU8sa0JBQWtCLEtBQzNDLENBQUMsY0FBY0EsSUFBRyxLQUFLLGVBQWUsR0FBRztBQUN6QyxjQUFJQSxJQUFHO0FBQ0gsWUFBQUEsSUFBRyxRQUFRQSxJQUFHO0FBQ2xCLGlCQUFPQSxJQUFHO0FBQ1YsY0FBSSxZQUFZQSxJQUFHLEtBQUssR0FBRztBQUN2QixnQkFBSUEsSUFBRyxNQUFNO0FBQ1QsNkJBQWVBLElBQUcsTUFBTSxLQUFLQSxJQUFHLEdBQUc7QUFBQTtBQUVuQyxjQUFBQSxJQUFHLE1BQU0sTUFBTUEsSUFBRztBQUFBLFVBQzFCO0FBRUksMkJBQWVBLElBQUcsT0FBT0EsSUFBRyxHQUFHO0FBQ25DLGlCQUFPQSxJQUFHO0FBQUEsUUFDZDtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQTRCQSxNQUFNLFNBQU4sTUFBYTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLVCxZQUFZLFdBQVc7QUFFbkIsV0FBSyxZQUFZO0FBRWpCLFdBQUssV0FBVztBQUVoQixXQUFLLFNBQVM7QUFFZCxXQUFLLFNBQVM7QUFFZCxXQUFLLFlBQVk7QUFFakIsV0FBSyxRQUFRLENBQUM7QUFFZCxXQUFLLFNBQVM7QUFFZCxXQUFLLE9BQU87QUFFWixXQUFLLFFBQVEsSUFBSSxNQUFNO0FBQ3ZCLFdBQUssWUFBWTtBQUFBLElBQ3JCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBU0EsQ0FBQyxNQUFNLFFBQVEsYUFBYSxPQUFPO0FBQy9CLFVBQUksS0FBSyxhQUFhLEtBQUssV0FBVztBQUNsQyxhQUFLLFVBQVUsQ0FBQztBQUNwQixpQkFBVyxVQUFVLEtBQUssTUFBTSxJQUFJLFFBQVEsVUFBVTtBQUNsRCxlQUFPLEtBQUssS0FBSyxNQUFNO0FBQzNCLFVBQUksQ0FBQztBQUNELGVBQU8sS0FBSyxJQUFJO0FBQUEsSUFDeEI7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlBLENBQUMsS0FBSyxRQUFRO0FBQ1YsV0FBSyxTQUFTO0FBQ2QsVUFBSSxLQUFLLFVBQVU7QUFDZixhQUFLLFdBQVc7QUFDaEIsZUFBTyxLQUFLLEtBQUs7QUFDakIsYUFBSyxVQUFVLE9BQU87QUFDdEI7QUFBQSxNQUNKO0FBQ0EsWUFBTSxPQUFPLFVBQVUsTUFBTTtBQUM3QixVQUFJLENBQUMsTUFBTTtBQUNQLGNBQU0sVUFBVSxxQkFBcUIsTUFBTTtBQUMzQyxlQUFPLEtBQUssSUFBSSxFQUFFLE1BQU0sU0FBUyxRQUFRLEtBQUssUUFBUSxTQUFTLE9BQU8sQ0FBQztBQUN2RSxhQUFLLFVBQVUsT0FBTztBQUFBLE1BQzFCLFdBQ1MsU0FBUyxVQUFVO0FBQ3hCLGFBQUssWUFBWTtBQUNqQixhQUFLLFdBQVc7QUFDaEIsYUFBSyxPQUFPO0FBQUEsTUFDaEIsT0FDSztBQUNELGFBQUssT0FBTztBQUNaLGVBQU8sS0FBSyxLQUFLO0FBQ2pCLGdCQUFRLE1BQU07QUFBQSxVQUNWLEtBQUs7QUFDRCxpQkFBSyxZQUFZO0FBQ2pCLGlCQUFLLFNBQVM7QUFDZCxnQkFBSSxLQUFLO0FBQ0wsbUJBQUssVUFBVSxLQUFLLFNBQVMsT0FBTyxNQUFNO0FBQzlDO0FBQUEsVUFDSixLQUFLO0FBQ0QsZ0JBQUksS0FBSyxhQUFhLE9BQU8sQ0FBQyxNQUFNO0FBQ2hDLG1CQUFLLFVBQVUsT0FBTztBQUMxQjtBQUFBLFVBQ0osS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUNELGdCQUFJLEtBQUs7QUFDTCxtQkFBSyxVQUFVLE9BQU87QUFDMUI7QUFBQSxVQUNKLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFDRDtBQUFBLFVBQ0o7QUFDSSxpQkFBSyxZQUFZO0FBQUEsUUFDekI7QUFDQSxhQUFLLFVBQVUsT0FBTztBQUFBLE1BQzFCO0FBQUEsSUFDSjtBQUFBO0FBQUEsSUFFQSxDQUFDLE1BQU07QUFDSCxhQUFPLEtBQUssTUFBTSxTQUFTO0FBQ3ZCLGVBQU8sS0FBSyxJQUFJO0FBQUEsSUFDeEI7QUFBQSxJQUNBLElBQUksY0FBYztBQUNkLFlBQU0sS0FBSztBQUFBLFFBQ1AsTUFBTSxLQUFLO0FBQUEsUUFDWCxRQUFRLEtBQUs7QUFBQSxRQUNiLFFBQVEsS0FBSztBQUFBLFFBQ2IsUUFBUSxLQUFLO0FBQUEsTUFDakI7QUFDQSxhQUFPO0FBQUEsSUFDWDtBQUFBLElBQ0EsQ0FBQyxPQUFPO0FBQ0osWUFBTSxNQUFNLEtBQUssS0FBSyxDQUFDO0FBQ3ZCLFVBQUksS0FBSyxTQUFTLGFBQWEsS0FBSyxTQUFTLFdBQVc7QUFDcEQsZUFBTyxLQUFLLE1BQU0sU0FBUztBQUN2QixpQkFBTyxLQUFLLElBQUk7QUFDcEIsYUFBSyxNQUFNLEtBQUs7QUFBQSxVQUNaLE1BQU07QUFBQSxVQUNOLFFBQVEsS0FBSztBQUFBLFVBQ2IsUUFBUSxLQUFLO0FBQUEsUUFDakIsQ0FBQztBQUNEO0FBQUEsTUFDSjtBQUNBLFVBQUksQ0FBQztBQUNELGVBQU8sT0FBTyxLQUFLLE9BQU87QUFDOUIsY0FBUSxJQUFJLE1BQU07QUFBQSxRQUNkLEtBQUs7QUFDRCxpQkFBTyxPQUFPLEtBQUssU0FBUyxHQUFHO0FBQUEsUUFDbkMsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPLE9BQU8sS0FBSyxPQUFPLEdBQUc7QUFBQSxRQUNqQyxLQUFLO0FBQ0QsaUJBQU8sT0FBTyxLQUFLLFlBQVksR0FBRztBQUFBLFFBQ3RDLEtBQUs7QUFDRCxpQkFBTyxPQUFPLEtBQUssU0FBUyxHQUFHO0FBQUEsUUFDbkMsS0FBSztBQUNELGlCQUFPLE9BQU8sS0FBSyxjQUFjLEdBQUc7QUFBQSxRQUN4QyxLQUFLO0FBQ0QsaUJBQU8sT0FBTyxLQUFLLGVBQWUsR0FBRztBQUFBLFFBQ3pDLEtBQUs7QUFDRCxpQkFBTyxPQUFPLEtBQUssWUFBWSxHQUFHO0FBQUEsTUFDMUM7QUFFQSxhQUFPLEtBQUssSUFBSTtBQUFBLElBQ3BCO0FBQUEsSUFDQSxLQUFLLEdBQUc7QUFDSixhQUFPLEtBQUssTUFBTSxLQUFLLE1BQU0sU0FBUyxDQUFDO0FBQUEsSUFDM0M7QUFBQSxJQUNBLENBQUMsSUFBSSxPQUFPO0FBQ1IsWUFBTSxRQUFRLFNBQVMsS0FBSyxNQUFNLElBQUk7QUFFdEMsVUFBSSxDQUFDLE9BQU87QUFDUixjQUFNLFVBQVU7QUFDaEIsY0FBTSxFQUFFLE1BQU0sU0FBUyxRQUFRLEtBQUssUUFBUSxRQUFRLElBQUksUUFBUTtBQUFBLE1BQ3BFLFdBQ1MsS0FBSyxNQUFNLFdBQVcsR0FBRztBQUM5QixjQUFNO0FBQUEsTUFDVixPQUNLO0FBQ0QsY0FBTSxNQUFNLEtBQUssS0FBSyxDQUFDO0FBQ3ZCLFlBQUksTUFBTSxTQUFTLGdCQUFnQjtBQUUvQixnQkFBTSxTQUFTLFlBQVksTUFBTSxJQUFJLFNBQVM7QUFBQSxRQUNsRCxXQUNTLE1BQU0sU0FBUyxxQkFBcUIsSUFBSSxTQUFTLFlBQVk7QUFFbEUsZ0JBQU0sU0FBUztBQUFBLFFBQ25CO0FBQ0EsWUFBSSxNQUFNLFNBQVM7QUFDZiwwQkFBZ0IsS0FBSztBQUN6QixnQkFBUSxJQUFJLE1BQU07QUFBQSxVQUNkLEtBQUs7QUFDRCxnQkFBSSxRQUFRO0FBQ1o7QUFBQSxVQUNKLEtBQUs7QUFDRCxnQkFBSSxNQUFNLEtBQUssS0FBSztBQUNwQjtBQUFBLFVBQ0osS0FBSyxhQUFhO0FBQ2Qsa0JBQU1BLE1BQUssSUFBSSxNQUFNLElBQUksTUFBTSxTQUFTLENBQUM7QUFDekMsZ0JBQUlBLElBQUcsT0FBTztBQUNWLGtCQUFJLE1BQU0sS0FBSyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEtBQUssT0FBTyxLQUFLLENBQUMsRUFBRSxDQUFDO0FBQ2pELG1CQUFLLFlBQVk7QUFDakI7QUFBQSxZQUNKLFdBQ1NBLElBQUcsS0FBSztBQUNiLGNBQUFBLElBQUcsUUFBUTtBQUFBLFlBQ2YsT0FDSztBQUNELHFCQUFPLE9BQU9BLEtBQUksRUFBRSxLQUFLLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUN6QyxtQkFBSyxZQUFZLENBQUNBLElBQUc7QUFDckI7QUFBQSxZQUNKO0FBQ0E7QUFBQSxVQUNKO0FBQUEsVUFDQSxLQUFLLGFBQWE7QUFDZCxrQkFBTUEsTUFBSyxJQUFJLE1BQU0sSUFBSSxNQUFNLFNBQVMsQ0FBQztBQUN6QyxnQkFBSUEsSUFBRztBQUNILGtCQUFJLE1BQU0sS0FBSyxFQUFFLE9BQU8sQ0FBQyxHQUFHLE9BQU8sTUFBTSxDQUFDO0FBQUE7QUFFMUMsY0FBQUEsSUFBRyxRQUFRO0FBQ2Y7QUFBQSxVQUNKO0FBQUEsVUFDQSxLQUFLLG1CQUFtQjtBQUNwQixrQkFBTUEsTUFBSyxJQUFJLE1BQU0sSUFBSSxNQUFNLFNBQVMsQ0FBQztBQUN6QyxnQkFBSSxDQUFDQSxPQUFNQSxJQUFHO0FBQ1Ysa0JBQUksTUFBTSxLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsS0FBSyxPQUFPLEtBQUssQ0FBQyxFQUFFLENBQUM7QUFBQSxxQkFDNUNBLElBQUc7QUFDUixjQUFBQSxJQUFHLFFBQVE7QUFBQTtBQUVYLHFCQUFPLE9BQU9BLEtBQUksRUFBRSxLQUFLLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUM3QztBQUFBLFVBQ0o7QUFBQTtBQUFBLFVBRUE7QUFDSSxtQkFBTyxLQUFLLElBQUk7QUFDaEIsbUJBQU8sS0FBSyxJQUFJLEtBQUs7QUFBQSxRQUM3QjtBQUNBLGFBQUssSUFBSSxTQUFTLGNBQ2QsSUFBSSxTQUFTLGVBQ2IsSUFBSSxTQUFTLGlCQUNaLE1BQU0sU0FBUyxlQUFlLE1BQU0sU0FBUyxjQUFjO0FBQzVELGdCQUFNLE9BQU8sTUFBTSxNQUFNLE1BQU0sTUFBTSxTQUFTLENBQUM7QUFDL0MsY0FBSSxRQUNBLENBQUMsS0FBSyxPQUNOLENBQUMsS0FBSyxTQUNOLEtBQUssTUFBTSxTQUFTLEtBQ3BCLGtCQUFrQixLQUFLLEtBQUssTUFBTSxPQUNqQyxNQUFNLFdBQVcsS0FDZCxLQUFLLE1BQU0sTUFBTSxRQUFNLEdBQUcsU0FBUyxhQUFhLEdBQUcsU0FBUyxNQUFNLE1BQU0sSUFBSTtBQUNoRixnQkFBSSxJQUFJLFNBQVM7QUFDYixrQkFBSSxNQUFNLEtBQUs7QUFBQTtBQUVmLGtCQUFJLE1BQU0sS0FBSyxFQUFFLE9BQU8sS0FBSyxNQUFNLENBQUM7QUFDeEMsa0JBQU0sTUFBTSxPQUFPLElBQUksQ0FBQztBQUFBLFVBQzVCO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFDQSxDQUFDLFNBQVM7QUFDTixjQUFRLEtBQUssTUFBTTtBQUFBLFFBQ2YsS0FBSztBQUNELGdCQUFNLEVBQUUsTUFBTSxhQUFhLFFBQVEsS0FBSyxRQUFRLFFBQVEsS0FBSyxPQUFPO0FBQ3BFO0FBQUEsUUFDSixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQ0QsZ0JBQU0sS0FBSztBQUNYO0FBQUEsUUFDSixLQUFLO0FBQUEsUUFDTCxLQUFLLGFBQWE7QUFDZCxnQkFBTSxNQUFNO0FBQUEsWUFDUixNQUFNO0FBQUEsWUFDTixRQUFRLEtBQUs7QUFBQSxZQUNiLE9BQU8sQ0FBQztBQUFBLFVBQ1o7QUFDQSxjQUFJLEtBQUssU0FBUztBQUNkLGdCQUFJLE1BQU0sS0FBSyxLQUFLLFdBQVc7QUFDbkMsZUFBSyxNQUFNLEtBQUssR0FBRztBQUNuQjtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQ0EsWUFBTTtBQUFBLFFBQ0YsTUFBTTtBQUFBLFFBQ04sUUFBUSxLQUFLO0FBQUEsUUFDYixTQUFTLGNBQWMsS0FBSyxJQUFJO0FBQUEsUUFDaEMsUUFBUSxLQUFLO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQUEsSUFDQSxDQUFDLFNBQVMsS0FBSztBQUNYLFVBQUksSUFBSTtBQUNKLGVBQU8sT0FBTyxLQUFLLFFBQVEsR0FBRztBQUNsQyxjQUFRLEtBQUssTUFBTTtBQUFBLFFBQ2YsS0FBSyxhQUFhO0FBQ2QsY0FBSSxrQkFBa0IsSUFBSSxLQUFLLE1BQU0sSUFBSTtBQUNyQyxtQkFBTyxLQUFLLElBQUk7QUFDaEIsbUJBQU8sS0FBSyxLQUFLO0FBQUEsVUFDckI7QUFFSSxnQkFBSSxNQUFNLEtBQUssS0FBSyxXQUFXO0FBQ25DO0FBQUEsUUFDSjtBQUFBLFFBQ0EsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGNBQUksTUFBTSxLQUFLLEtBQUssV0FBVztBQUMvQjtBQUFBLE1BQ1I7QUFDQSxZQUFNLEtBQUssS0FBSyxnQkFBZ0IsR0FBRztBQUNuQyxVQUFJO0FBQ0EsYUFBSyxNQUFNLEtBQUssRUFBRTtBQUFBLFdBQ2pCO0FBQ0QsY0FBTTtBQUFBLFVBQ0YsTUFBTTtBQUFBLFVBQ04sUUFBUSxLQUFLO0FBQUEsVUFDYixTQUFTLGNBQWMsS0FBSyxJQUFJO0FBQUEsVUFDaEMsUUFBUSxLQUFLO0FBQUEsUUFDakI7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBQ0EsQ0FBQyxPQUFPLFFBQVE7QUFDWixVQUFJLEtBQUssU0FBUyxpQkFBaUI7QUFDL0IsY0FBTSxPQUFPLGFBQWEsS0FBSyxLQUFLLENBQUMsQ0FBQztBQUN0QyxjQUFNLFFBQVEsc0JBQXNCLElBQUk7QUFDeEMsWUFBSTtBQUNKLFlBQUksT0FBTyxLQUFLO0FBQ1osZ0JBQU0sT0FBTztBQUNiLGNBQUksS0FBSyxLQUFLLFdBQVc7QUFDekIsaUJBQU8sT0FBTztBQUFBLFFBQ2xCO0FBRUksZ0JBQU0sQ0FBQyxLQUFLLFdBQVc7QUFDM0IsY0FBTUMsT0FBTTtBQUFBLFVBQ1IsTUFBTTtBQUFBLFVBQ04sUUFBUSxPQUFPO0FBQUEsVUFDZixRQUFRLE9BQU87QUFBQSxVQUNmLE9BQU8sQ0FBQyxFQUFFLE9BQU8sS0FBSyxRQUFRLElBQUksQ0FBQztBQUFBLFFBQ3ZDO0FBQ0EsYUFBSyxZQUFZO0FBQ2pCLGFBQUssTUFBTSxLQUFLLE1BQU0sU0FBUyxDQUFDLElBQUlBO0FBQUEsTUFDeEM7QUFFSSxlQUFPLEtBQUssUUFBUSxNQUFNO0FBQUEsSUFDbEM7QUFBQSxJQUNBLENBQUMsWUFBWSxRQUFRO0FBQ2pCLGNBQVEsS0FBSyxNQUFNO0FBQUEsUUFDZixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQ0QsaUJBQU8sTUFBTSxLQUFLLEtBQUssV0FBVztBQUNsQztBQUFBLFFBQ0osS0FBSztBQUNELGlCQUFPLFNBQVMsS0FBSztBQUVyQixlQUFLLFlBQVk7QUFDakIsZUFBSyxTQUFTO0FBQ2QsY0FBSSxLQUFLLFdBQVc7QUFDaEIsZ0JBQUksS0FBSyxLQUFLLE9BQU8sUUFBUSxJQUFJLElBQUk7QUFDckMsbUJBQU8sT0FBTyxHQUFHO0FBQ2IsbUJBQUssVUFBVSxLQUFLLFNBQVMsRUFBRTtBQUMvQixtQkFBSyxLQUFLLE9BQU8sUUFBUSxNQUFNLEVBQUUsSUFBSTtBQUFBLFlBQ3pDO0FBQUEsVUFDSjtBQUNBLGlCQUFPLEtBQUssSUFBSTtBQUNoQjtBQUFBO0FBQUEsUUFFSjtBQUNJLGlCQUFPLEtBQUssSUFBSTtBQUNoQixpQkFBTyxLQUFLLEtBQUs7QUFBQSxNQUN6QjtBQUFBLElBQ0o7QUFBQSxJQUNBLENBQUMsU0FBU0EsTUFBSztBQUNYLFlBQU1ELE1BQUtDLEtBQUksTUFBTUEsS0FBSSxNQUFNLFNBQVMsQ0FBQztBQUV6QyxjQUFRLEtBQUssTUFBTTtBQUFBLFFBQ2YsS0FBSztBQUNELGVBQUssWUFBWTtBQUNqQixjQUFJRCxJQUFHLE9BQU87QUFDVixrQkFBTSxNQUFNLFNBQVNBLElBQUcsUUFBUUEsSUFBRyxNQUFNLE1BQU07QUFDL0Msa0JBQU0sT0FBTyxNQUFNLFFBQVEsR0FBRyxJQUFJLElBQUksSUFBSSxTQUFTLENBQUMsSUFBSTtBQUN4RCxnQkFBSSxNQUFNLFNBQVM7QUFDZixtQkFBSyxLQUFLLEtBQUssV0FBVztBQUFBO0FBRTFCLGNBQUFDLEtBQUksTUFBTSxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssV0FBVyxFQUFFLENBQUM7QUFBQSxVQUNwRCxXQUNTRCxJQUFHLEtBQUs7QUFDYixZQUFBQSxJQUFHLElBQUksS0FBSyxLQUFLLFdBQVc7QUFBQSxVQUNoQyxPQUNLO0FBQ0QsWUFBQUEsSUFBRyxNQUFNLEtBQUssS0FBSyxXQUFXO0FBQUEsVUFDbEM7QUFDQTtBQUFBLFFBQ0osS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGNBQUlBLElBQUcsT0FBTztBQUNWLFlBQUFDLEtBQUksTUFBTSxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssV0FBVyxFQUFFLENBQUM7QUFBQSxVQUNoRCxXQUNTRCxJQUFHLEtBQUs7QUFDYixZQUFBQSxJQUFHLElBQUksS0FBSyxLQUFLLFdBQVc7QUFBQSxVQUNoQyxPQUNLO0FBQ0QsZ0JBQUksS0FBSyxrQkFBa0JBLElBQUcsT0FBT0MsS0FBSSxNQUFNLEdBQUc7QUFDOUMsb0JBQU0sT0FBT0EsS0FBSSxNQUFNQSxLQUFJLE1BQU0sU0FBUyxDQUFDO0FBQzNDLG9CQUFNLE1BQU0sTUFBTSxPQUFPO0FBQ3pCLGtCQUFJLE1BQU0sUUFBUSxHQUFHLEdBQUc7QUFDcEIsK0JBQWUsS0FBS0QsSUFBRyxLQUFLO0FBQzVCLG9CQUFJLEtBQUssS0FBSyxXQUFXO0FBQ3pCLGdCQUFBQyxLQUFJLE1BQU0sSUFBSTtBQUNkO0FBQUEsY0FDSjtBQUFBLFlBQ0o7QUFDQSxZQUFBRCxJQUFHLE1BQU0sS0FBSyxLQUFLLFdBQVc7QUFBQSxVQUNsQztBQUNBO0FBQUEsTUFDUjtBQUNBLFVBQUksS0FBSyxVQUFVQyxLQUFJLFFBQVE7QUFDM0IsY0FBTSxjQUFjLENBQUMsS0FBSyxhQUFhLEtBQUssV0FBV0EsS0FBSTtBQUMzRCxjQUFNLGFBQWEsZ0JBQ2RELElBQUcsT0FBT0EsSUFBRyxnQkFDZCxLQUFLLFNBQVM7QUFFbEIsWUFBSSxRQUFRLENBQUM7QUFDYixZQUFJLGNBQWNBLElBQUcsT0FBTyxDQUFDQSxJQUFHLE9BQU87QUFDbkMsZ0JBQU0sS0FBSyxDQUFDO0FBQ1osbUJBQVMsSUFBSSxHQUFHLElBQUlBLElBQUcsSUFBSSxRQUFRLEVBQUUsR0FBRztBQUNwQyxrQkFBTSxLQUFLQSxJQUFHLElBQUksQ0FBQztBQUNuQixvQkFBUSxHQUFHLE1BQU07QUFBQSxjQUNiLEtBQUs7QUFDRCxtQkFBRyxLQUFLLENBQUM7QUFDVDtBQUFBLGNBQ0osS0FBSztBQUNEO0FBQUEsY0FDSixLQUFLO0FBQ0Qsb0JBQUksR0FBRyxTQUFTQyxLQUFJO0FBQ2hCLHFCQUFHLFNBQVM7QUFDaEI7QUFBQSxjQUNKO0FBQ0ksbUJBQUcsU0FBUztBQUFBLFlBQ3BCO0FBQUEsVUFDSjtBQUNBLGNBQUksR0FBRyxVQUFVO0FBQ2Isb0JBQVFELElBQUcsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQUEsUUFDbkM7QUFDQSxnQkFBUSxLQUFLLE1BQU07QUFBQSxVQUNmLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFDRCxnQkFBSSxjQUFjQSxJQUFHLE9BQU87QUFDeEIsb0JBQU0sS0FBSyxLQUFLLFdBQVc7QUFDM0IsY0FBQUMsS0FBSSxNQUFNLEtBQUssRUFBRSxNQUFNLENBQUM7QUFDeEIsbUJBQUssWUFBWTtBQUFBLFlBQ3JCLFdBQ1NELElBQUcsS0FBSztBQUNiLGNBQUFBLElBQUcsSUFBSSxLQUFLLEtBQUssV0FBVztBQUFBLFlBQ2hDLE9BQ0s7QUFDRCxjQUFBQSxJQUFHLE1BQU0sS0FBSyxLQUFLLFdBQVc7QUFBQSxZQUNsQztBQUNBO0FBQUEsVUFDSixLQUFLO0FBQ0QsZ0JBQUksQ0FBQ0EsSUFBRyxPQUFPLENBQUNBLElBQUcsYUFBYTtBQUM1QixjQUFBQSxJQUFHLE1BQU0sS0FBSyxLQUFLLFdBQVc7QUFDOUIsY0FBQUEsSUFBRyxjQUFjO0FBQUEsWUFDckIsV0FDUyxjQUFjQSxJQUFHLE9BQU87QUFDN0Isb0JBQU0sS0FBSyxLQUFLLFdBQVc7QUFDM0IsY0FBQUMsS0FBSSxNQUFNLEtBQUssRUFBRSxPQUFPLGFBQWEsS0FBSyxDQUFDO0FBQUEsWUFDL0MsT0FDSztBQUNELG1CQUFLLE1BQU0sS0FBSztBQUFBLGdCQUNaLE1BQU07QUFBQSxnQkFDTixRQUFRLEtBQUs7QUFBQSxnQkFDYixRQUFRLEtBQUs7QUFBQSxnQkFDYixPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxXQUFXLEdBQUcsYUFBYSxLQUFLLENBQUM7QUFBQSxjQUM1RCxDQUFDO0FBQUEsWUFDTDtBQUNBLGlCQUFLLFlBQVk7QUFDakI7QUFBQSxVQUNKLEtBQUs7QUFDRCxnQkFBSUQsSUFBRyxhQUFhO0FBQ2hCLGtCQUFJLENBQUNBLElBQUcsS0FBSztBQUNULG9CQUFJLGNBQWNBLElBQUcsT0FBTyxTQUFTLEdBQUc7QUFDcEMseUJBQU8sT0FBT0EsS0FBSSxFQUFFLEtBQUssTUFBTSxLQUFLLENBQUMsS0FBSyxXQUFXLEVBQUUsQ0FBQztBQUFBLGdCQUM1RCxPQUNLO0FBQ0Qsd0JBQU1FLFNBQVEsc0JBQXNCRixJQUFHLEtBQUs7QUFDNUMsdUJBQUssTUFBTSxLQUFLO0FBQUEsb0JBQ1osTUFBTTtBQUFBLG9CQUNOLFFBQVEsS0FBSztBQUFBLG9CQUNiLFFBQVEsS0FBSztBQUFBLG9CQUNiLE9BQU8sQ0FBQyxFQUFFLE9BQUFFLFFBQU8sS0FBSyxNQUFNLEtBQUssQ0FBQyxLQUFLLFdBQVcsRUFBRSxDQUFDO0FBQUEsa0JBQ3pELENBQUM7QUFBQSxnQkFDTDtBQUFBLGNBQ0osV0FDU0YsSUFBRyxPQUFPO0FBQ2YsZ0JBQUFDLEtBQUksTUFBTSxLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsS0FBSyxNQUFNLEtBQUssQ0FBQyxLQUFLLFdBQVcsRUFBRSxDQUFDO0FBQUEsY0FDcEUsV0FDUyxjQUFjRCxJQUFHLEtBQUssZUFBZSxHQUFHO0FBQzdDLHFCQUFLLE1BQU0sS0FBSztBQUFBLGtCQUNaLE1BQU07QUFBQSxrQkFDTixRQUFRLEtBQUs7QUFBQSxrQkFDYixRQUFRLEtBQUs7QUFBQSxrQkFDYixPQUFPLENBQUMsRUFBRSxPQUFPLEtBQUssTUFBTSxLQUFLLENBQUMsS0FBSyxXQUFXLEVBQUUsQ0FBQztBQUFBLGdCQUN6RCxDQUFDO0FBQUEsY0FDTCxXQUNTLFlBQVlBLElBQUcsR0FBRyxLQUN2QixDQUFDLGNBQWNBLElBQUcsS0FBSyxTQUFTLEdBQUc7QUFDbkMsc0JBQU1FLFNBQVEsc0JBQXNCRixJQUFHLEtBQUs7QUFDNUMsc0JBQU0sTUFBTUEsSUFBRztBQUNmLHNCQUFNLE1BQU1BLElBQUc7QUFDZixvQkFBSSxLQUFLLEtBQUssV0FBVztBQUV6Qix1QkFBT0EsSUFBRztBQUVWLHVCQUFPQSxJQUFHO0FBQ1YscUJBQUssTUFBTSxLQUFLO0FBQUEsa0JBQ1osTUFBTTtBQUFBLGtCQUNOLFFBQVEsS0FBSztBQUFBLGtCQUNiLFFBQVEsS0FBSztBQUFBLGtCQUNiLE9BQU8sQ0FBQyxFQUFFLE9BQUFFLFFBQU8sS0FBSyxJQUFJLENBQUM7QUFBQSxnQkFDL0IsQ0FBQztBQUFBLGNBQ0wsV0FDUyxNQUFNLFNBQVMsR0FBRztBQUV2QixnQkFBQUYsSUFBRyxNQUFNQSxJQUFHLElBQUksT0FBTyxPQUFPLEtBQUssV0FBVztBQUFBLGNBQ2xELE9BQ0s7QUFDRCxnQkFBQUEsSUFBRyxJQUFJLEtBQUssS0FBSyxXQUFXO0FBQUEsY0FDaEM7QUFBQSxZQUNKLE9BQ0s7QUFDRCxrQkFBSSxDQUFDQSxJQUFHLEtBQUs7QUFDVCx1QkFBTyxPQUFPQSxLQUFJLEVBQUUsS0FBSyxNQUFNLEtBQUssQ0FBQyxLQUFLLFdBQVcsRUFBRSxDQUFDO0FBQUEsY0FDNUQsV0FDU0EsSUFBRyxTQUFTLFlBQVk7QUFDN0IsZ0JBQUFDLEtBQUksTUFBTSxLQUFLLEVBQUUsT0FBTyxLQUFLLE1BQU0sS0FBSyxDQUFDLEtBQUssV0FBVyxFQUFFLENBQUM7QUFBQSxjQUNoRSxXQUNTLGNBQWNELElBQUcsS0FBSyxlQUFlLEdBQUc7QUFDN0MscUJBQUssTUFBTSxLQUFLO0FBQUEsa0JBQ1osTUFBTTtBQUFBLGtCQUNOLFFBQVEsS0FBSztBQUFBLGtCQUNiLFFBQVEsS0FBSztBQUFBLGtCQUNiLE9BQU8sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEtBQUssTUFBTSxLQUFLLENBQUMsS0FBSyxXQUFXLEVBQUUsQ0FBQztBQUFBLGdCQUM3RCxDQUFDO0FBQUEsY0FDTCxPQUNLO0FBQ0QsZ0JBQUFBLElBQUcsSUFBSSxLQUFLLEtBQUssV0FBVztBQUFBLGNBQ2hDO0FBQUEsWUFDSjtBQUNBLGlCQUFLLFlBQVk7QUFDakI7QUFBQSxVQUNKLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUssd0JBQXdCO0FBQ3pCLGtCQUFNLEtBQUssS0FBSyxXQUFXLEtBQUssSUFBSTtBQUNwQyxnQkFBSSxjQUFjQSxJQUFHLE9BQU87QUFDeEIsY0FBQUMsS0FBSSxNQUFNLEtBQUssRUFBRSxPQUFPLEtBQUssSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDO0FBQzFDLG1CQUFLLFlBQVk7QUFBQSxZQUNyQixXQUNTRCxJQUFHLEtBQUs7QUFDYixtQkFBSyxNQUFNLEtBQUssRUFBRTtBQUFBLFlBQ3RCLE9BQ0s7QUFDRCxxQkFBTyxPQUFPQSxLQUFJLEVBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUM7QUFDdEMsbUJBQUssWUFBWTtBQUFBLFlBQ3JCO0FBQ0E7QUFBQSxVQUNKO0FBQUEsVUFDQSxTQUFTO0FBQ0wsa0JBQU0sS0FBSyxLQUFLLGdCQUFnQkMsSUFBRztBQUNuQyxnQkFBSSxJQUFJO0FBQ0osa0JBQUksR0FBRyxTQUFTLGFBQWE7QUFDekIsb0JBQUksQ0FBQ0QsSUFBRyxlQUNKQSxJQUFHLE9BQ0gsQ0FBQyxjQUFjQSxJQUFHLEtBQUssU0FBUyxHQUFHO0FBQ25DLHlCQUFPLEtBQUssSUFBSTtBQUFBLG9CQUNaLE1BQU07QUFBQSxvQkFDTixRQUFRLEtBQUs7QUFBQSxvQkFDYixTQUFTO0FBQUEsb0JBQ1QsUUFBUSxLQUFLO0FBQUEsa0JBQ2pCLENBQUM7QUFDRDtBQUFBLGdCQUNKO0FBQUEsY0FDSixXQUNTLGFBQWE7QUFDbEIsZ0JBQUFDLEtBQUksTUFBTSxLQUFLLEVBQUUsTUFBTSxDQUFDO0FBQUEsY0FDNUI7QUFDQSxtQkFBSyxNQUFNLEtBQUssRUFBRTtBQUNsQjtBQUFBLFlBQ0o7QUFBQSxVQUNKO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFDQSxhQUFPLEtBQUssSUFBSTtBQUNoQixhQUFPLEtBQUssS0FBSztBQUFBLElBQ3JCO0FBQUEsSUFDQSxDQUFDLGNBQWNFLE1BQUs7QUFDaEIsWUFBTUgsTUFBS0csS0FBSSxNQUFNQSxLQUFJLE1BQU0sU0FBUyxDQUFDO0FBQ3pDLGNBQVEsS0FBSyxNQUFNO0FBQUEsUUFDZixLQUFLO0FBQ0QsY0FBSUgsSUFBRyxPQUFPO0FBQ1Ysa0JBQU0sTUFBTSxTQUFTQSxJQUFHLFFBQVFBLElBQUcsTUFBTSxNQUFNO0FBQy9DLGtCQUFNLE9BQU8sTUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLElBQUksU0FBUyxDQUFDLElBQUk7QUFDeEQsZ0JBQUksTUFBTSxTQUFTO0FBQ2YsbUJBQUssS0FBSyxLQUFLLFdBQVc7QUFBQTtBQUUxQixjQUFBRyxLQUFJLE1BQU0sS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLFdBQVcsRUFBRSxDQUFDO0FBQUEsVUFDcEQ7QUFFSSxZQUFBSCxJQUFHLE1BQU0sS0FBSyxLQUFLLFdBQVc7QUFDbEM7QUFBQSxRQUNKLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFDRCxjQUFJQSxJQUFHO0FBQ0gsWUFBQUcsS0FBSSxNQUFNLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxXQUFXLEVBQUUsQ0FBQztBQUFBLGVBQzNDO0FBQ0QsZ0JBQUksS0FBSyxrQkFBa0JILElBQUcsT0FBT0csS0FBSSxNQUFNLEdBQUc7QUFDOUMsb0JBQU0sT0FBT0EsS0FBSSxNQUFNQSxLQUFJLE1BQU0sU0FBUyxDQUFDO0FBQzNDLG9CQUFNLE1BQU0sTUFBTSxPQUFPO0FBQ3pCLGtCQUFJLE1BQU0sUUFBUSxHQUFHLEdBQUc7QUFDcEIsK0JBQWUsS0FBS0gsSUFBRyxLQUFLO0FBQzVCLG9CQUFJLEtBQUssS0FBSyxXQUFXO0FBQ3pCLGdCQUFBRyxLQUFJLE1BQU0sSUFBSTtBQUNkO0FBQUEsY0FDSjtBQUFBLFlBQ0o7QUFDQSxZQUFBSCxJQUFHLE1BQU0sS0FBSyxLQUFLLFdBQVc7QUFBQSxVQUNsQztBQUNBO0FBQUEsUUFDSixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQ0QsY0FBSUEsSUFBRyxTQUFTLEtBQUssVUFBVUcsS0FBSTtBQUMvQjtBQUNKLFVBQUFILElBQUcsTUFBTSxLQUFLLEtBQUssV0FBVztBQUM5QjtBQUFBLFFBQ0osS0FBSztBQUNELGNBQUksS0FBSyxXQUFXRyxLQUFJO0FBQ3BCO0FBQ0osY0FBSUgsSUFBRyxTQUFTLGNBQWNBLElBQUcsT0FBTyxjQUFjO0FBQ2xELFlBQUFHLEtBQUksTUFBTSxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssV0FBVyxFQUFFLENBQUM7QUFBQTtBQUU1QyxZQUFBSCxJQUFHLE1BQU0sS0FBSyxLQUFLLFdBQVc7QUFDbEM7QUFBQSxNQUNSO0FBQ0EsVUFBSSxLQUFLLFNBQVNHLEtBQUksUUFBUTtBQUMxQixjQUFNLEtBQUssS0FBSyxnQkFBZ0JBLElBQUc7QUFDbkMsWUFBSSxJQUFJO0FBQ0osZUFBSyxNQUFNLEtBQUssRUFBRTtBQUNsQjtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQ0EsYUFBTyxLQUFLLElBQUk7QUFDaEIsYUFBTyxLQUFLLEtBQUs7QUFBQSxJQUNyQjtBQUFBLElBQ0EsQ0FBQyxlQUFlLElBQUk7QUFDaEIsWUFBTUgsTUFBSyxHQUFHLE1BQU0sR0FBRyxNQUFNLFNBQVMsQ0FBQztBQUN2QyxVQUFJLEtBQUssU0FBUyxrQkFBa0I7QUFDaEMsWUFBSTtBQUNKLFdBQUc7QUFDQyxpQkFBTyxLQUFLLElBQUk7QUFDaEIsZ0JBQU0sS0FBSyxLQUFLLENBQUM7QUFBQSxRQUNyQixTQUFTLEtBQUssU0FBUztBQUFBLE1BQzNCLFdBQ1MsR0FBRyxJQUFJLFdBQVcsR0FBRztBQUMxQixnQkFBUSxLQUFLLE1BQU07QUFBQSxVQUNmLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFDRCxnQkFBSSxDQUFDQSxPQUFNQSxJQUFHO0FBQ1YsaUJBQUcsTUFBTSxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssV0FBVyxFQUFFLENBQUM7QUFBQTtBQUUzQyxjQUFBQSxJQUFHLE1BQU0sS0FBSyxLQUFLLFdBQVc7QUFDbEM7QUFBQSxVQUNKLEtBQUs7QUFDRCxnQkFBSSxDQUFDQSxPQUFNQSxJQUFHO0FBQ1YsaUJBQUcsTUFBTSxLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsS0FBSyxNQUFNLEtBQUssQ0FBQyxLQUFLLFdBQVcsRUFBRSxDQUFDO0FBQUEscUJBQzFEQSxJQUFHO0FBQ1IsY0FBQUEsSUFBRyxJQUFJLEtBQUssS0FBSyxXQUFXO0FBQUE7QUFFNUIscUJBQU8sT0FBT0EsS0FBSSxFQUFFLEtBQUssTUFBTSxLQUFLLENBQUMsS0FBSyxXQUFXLEVBQUUsQ0FBQztBQUM1RDtBQUFBLFVBQ0osS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUNELGdCQUFJLENBQUNBLE9BQU1BLElBQUc7QUFDVixpQkFBRyxNQUFNLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxXQUFXLEVBQUUsQ0FBQztBQUFBLHFCQUN0Q0EsSUFBRztBQUNSLGNBQUFBLElBQUcsSUFBSSxLQUFLLEtBQUssV0FBVztBQUFBO0FBRTVCLGNBQUFBLElBQUcsTUFBTSxLQUFLLEtBQUssV0FBVztBQUNsQztBQUFBLFVBQ0osS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSyx3QkFBd0I7QUFDekIsa0JBQU0sS0FBSyxLQUFLLFdBQVcsS0FBSyxJQUFJO0FBQ3BDLGdCQUFJLENBQUNBLE9BQU1BLElBQUc7QUFDVixpQkFBRyxNQUFNLEtBQUssRUFBRSxPQUFPLENBQUMsR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUFBLHFCQUN4Q0EsSUFBRztBQUNSLG1CQUFLLE1BQU0sS0FBSyxFQUFFO0FBQUE7QUFFbEIscUJBQU8sT0FBT0EsS0FBSSxFQUFFLEtBQUssSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDO0FBQzFDO0FBQUEsVUFDSjtBQUFBLFVBQ0EsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUNELGVBQUcsSUFBSSxLQUFLLEtBQUssV0FBVztBQUM1QjtBQUFBLFFBQ1I7QUFDQSxjQUFNLEtBQUssS0FBSyxnQkFBZ0IsRUFBRTtBQUVsQyxZQUFJO0FBQ0EsZUFBSyxNQUFNLEtBQUssRUFBRTtBQUFBLGFBQ2pCO0FBQ0QsaUJBQU8sS0FBSyxJQUFJO0FBQ2hCLGlCQUFPLEtBQUssS0FBSztBQUFBLFFBQ3JCO0FBQUEsTUFDSixPQUNLO0FBQ0QsY0FBTSxTQUFTLEtBQUssS0FBSyxDQUFDO0FBQzFCLFlBQUksT0FBTyxTQUFTLGdCQUNkLEtBQUssU0FBUyxtQkFBbUIsT0FBTyxXQUFXLEdBQUcsVUFDbkQsS0FBSyxTQUFTLGFBQ1gsQ0FBQyxPQUFPLE1BQU0sT0FBTyxNQUFNLFNBQVMsQ0FBQyxFQUFFLE1BQU87QUFDdEQsaUJBQU8sS0FBSyxJQUFJO0FBQ2hCLGlCQUFPLEtBQUssS0FBSztBQUFBLFFBQ3JCLFdBQ1MsS0FBSyxTQUFTLG1CQUNuQixPQUFPLFNBQVMsbUJBQW1CO0FBQ25DLGdCQUFNLE9BQU8sYUFBYSxNQUFNO0FBQ2hDLGdCQUFNLFFBQVEsc0JBQXNCLElBQUk7QUFDeEMsMEJBQWdCLEVBQUU7QUFDbEIsZ0JBQU0sTUFBTSxHQUFHLElBQUksT0FBTyxHQUFHLEdBQUcsSUFBSSxNQUFNO0FBQzFDLGNBQUksS0FBSyxLQUFLLFdBQVc7QUFDekIsZ0JBQU1DLE9BQU07QUFBQSxZQUNSLE1BQU07QUFBQSxZQUNOLFFBQVEsR0FBRztBQUFBLFlBQ1gsUUFBUSxHQUFHO0FBQUEsWUFDWCxPQUFPLENBQUMsRUFBRSxPQUFPLEtBQUssSUFBSSxJQUFJLENBQUM7QUFBQSxVQUNuQztBQUNBLGVBQUssWUFBWTtBQUNqQixlQUFLLE1BQU0sS0FBSyxNQUFNLFNBQVMsQ0FBQyxJQUFJQTtBQUFBLFFBQ3hDLE9BQ0s7QUFDRCxpQkFBTyxLQUFLLFFBQVEsRUFBRTtBQUFBLFFBQzFCO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUNBLFdBQVcsTUFBTTtBQUNiLFVBQUksS0FBSyxXQUFXO0FBQ2hCLFlBQUksS0FBSyxLQUFLLE9BQU8sUUFBUSxJQUFJLElBQUk7QUFDckMsZUFBTyxPQUFPLEdBQUc7QUFDYixlQUFLLFVBQVUsS0FBSyxTQUFTLEVBQUU7QUFDL0IsZUFBSyxLQUFLLE9BQU8sUUFBUSxNQUFNLEVBQUUsSUFBSTtBQUFBLFFBQ3pDO0FBQUEsTUFDSjtBQUNBLGFBQU87QUFBQSxRQUNIO0FBQUEsUUFDQSxRQUFRLEtBQUs7QUFBQSxRQUNiLFFBQVEsS0FBSztBQUFBLFFBQ2IsUUFBUSxLQUFLO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQUEsSUFDQSxnQkFBZ0IsUUFBUTtBQUNwQixjQUFRLEtBQUssTUFBTTtBQUFBLFFBQ2YsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUNELGlCQUFPLEtBQUssV0FBVyxLQUFLLElBQUk7QUFBQSxRQUNwQyxLQUFLO0FBQ0QsaUJBQU87QUFBQSxZQUNILE1BQU07QUFBQSxZQUNOLFFBQVEsS0FBSztBQUFBLFlBQ2IsUUFBUSxLQUFLO0FBQUEsWUFDYixPQUFPLENBQUMsS0FBSyxXQUFXO0FBQUEsWUFDeEIsUUFBUTtBQUFBLFVBQ1o7QUFBQSxRQUNKLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFDRCxpQkFBTztBQUFBLFlBQ0gsTUFBTTtBQUFBLFlBQ04sUUFBUSxLQUFLO0FBQUEsWUFDYixRQUFRLEtBQUs7QUFBQSxZQUNiLE9BQU8sS0FBSztBQUFBLFlBQ1osT0FBTyxDQUFDO0FBQUEsWUFDUixLQUFLLENBQUM7QUFBQSxVQUNWO0FBQUEsUUFDSixLQUFLO0FBQ0QsaUJBQU87QUFBQSxZQUNILE1BQU07QUFBQSxZQUNOLFFBQVEsS0FBSztBQUFBLFlBQ2IsUUFBUSxLQUFLO0FBQUEsWUFDYixPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxXQUFXLEVBQUUsQ0FBQztBQUFBLFVBQ3pDO0FBQUEsUUFDSixLQUFLLG9CQUFvQjtBQUNyQixlQUFLLFlBQVk7QUFDakIsZ0JBQU0sT0FBTyxhQUFhLE1BQU07QUFDaEMsZ0JBQU0sUUFBUSxzQkFBc0IsSUFBSTtBQUN4QyxnQkFBTSxLQUFLLEtBQUssV0FBVztBQUMzQixpQkFBTztBQUFBLFlBQ0gsTUFBTTtBQUFBLFlBQ04sUUFBUSxLQUFLO0FBQUEsWUFDYixRQUFRLEtBQUs7QUFBQSxZQUNiLE9BQU8sQ0FBQyxFQUFFLE9BQU8sYUFBYSxLQUFLLENBQUM7QUFBQSxVQUN4QztBQUFBLFFBQ0o7QUFBQSxRQUNBLEtBQUssaUJBQWlCO0FBQ2xCLGVBQUssWUFBWTtBQUNqQixnQkFBTSxPQUFPLGFBQWEsTUFBTTtBQUNoQyxnQkFBTSxRQUFRLHNCQUFzQixJQUFJO0FBQ3hDLGlCQUFPO0FBQUEsWUFDSCxNQUFNO0FBQUEsWUFDTixRQUFRLEtBQUs7QUFBQSxZQUNiLFFBQVEsS0FBSztBQUFBLFlBQ2IsT0FBTyxDQUFDLEVBQUUsT0FBTyxLQUFLLE1BQU0sS0FBSyxDQUFDLEtBQUssV0FBVyxFQUFFLENBQUM7QUFBQSxVQUN6RDtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQ0EsYUFBTztBQUFBLElBQ1g7QUFBQSxJQUNBLGtCQUFrQixPQUFPRyxTQUFRO0FBQzdCLFVBQUksS0FBSyxTQUFTO0FBQ2QsZUFBTztBQUNYLFVBQUksS0FBSyxVQUFVQTtBQUNmLGVBQU87QUFDWCxhQUFPLE1BQU0sTUFBTSxRQUFNLEdBQUcsU0FBUyxhQUFhLEdBQUcsU0FBUyxPQUFPO0FBQUEsSUFDekU7QUFBQSxJQUNBLENBQUMsWUFBWSxRQUFRO0FBQ2pCLFVBQUksS0FBSyxTQUFTLFlBQVk7QUFDMUIsWUFBSSxPQUFPO0FBQ1AsaUJBQU8sSUFBSSxLQUFLLEtBQUssV0FBVztBQUFBO0FBRWhDLGlCQUFPLE1BQU0sQ0FBQyxLQUFLLFdBQVc7QUFDbEMsWUFBSSxLQUFLLFNBQVM7QUFDZCxpQkFBTyxLQUFLLElBQUk7QUFBQSxNQUN4QjtBQUFBLElBQ0o7QUFBQSxJQUNBLENBQUMsUUFBUSxPQUFPO0FBQ1osY0FBUSxLQUFLLE1BQU07QUFBQSxRQUNmLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFDRCxpQkFBTyxLQUFLLElBQUk7QUFDaEIsaUJBQU8sS0FBSyxLQUFLO0FBQ2pCO0FBQUEsUUFDSixLQUFLO0FBQ0QsZUFBSyxZQUFZO0FBQUE7QUFBQSxRQUVyQixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTDtBQUVJLGNBQUksTUFBTTtBQUNOLGtCQUFNLElBQUksS0FBSyxLQUFLLFdBQVc7QUFBQTtBQUUvQixrQkFBTSxNQUFNLENBQUMsS0FBSyxXQUFXO0FBQ2pDLGNBQUksS0FBSyxTQUFTO0FBQ2QsbUJBQU8sS0FBSyxJQUFJO0FBQUEsTUFDNUI7QUFBQSxJQUNKO0FBQUEsRUFDSjs7O0FDcDhCQSxXQUFTLGFBQWEsU0FBUztBQUMzQixVQUFNLGVBQWUsUUFBUSxpQkFBaUI7QUFDOUMsVUFBTSxjQUFjLFFBQVEsZUFBZ0IsZ0JBQWdCLElBQUksWUFBWSxLQUFNO0FBQ2xGLFdBQU8sRUFBRSxhQUFhLGFBQWE7QUFBQSxFQUN2QztBQVVBLFdBQVMsa0JBQWtCLFFBQVEsVUFBVSxDQUFDLEdBQUc7QUFDN0MsVUFBTSxFQUFFLGFBQWEsYUFBYSxJQUFJLGFBQWEsT0FBTztBQUMxRCxVQUFNLFNBQVMsSUFBSSxPQUFPLGFBQWEsVUFBVTtBQUNqRCxVQUFNLFdBQVcsSUFBSSxTQUFTLE9BQU87QUFDckMsVUFBTSxPQUFPLE1BQU0sS0FBSyxTQUFTLFFBQVEsT0FBTyxNQUFNLE1BQU0sQ0FBQyxDQUFDO0FBQzlELFFBQUksZ0JBQWdCO0FBQ2hCLGlCQUFXLE9BQU8sTUFBTTtBQUNwQixZQUFJLE9BQU8sUUFBUSxjQUFjLFFBQVEsV0FBVyxDQUFDO0FBQ3JELFlBQUksU0FBUyxRQUFRLGNBQWMsUUFBUSxXQUFXLENBQUM7QUFBQSxNQUMzRDtBQUNKLFFBQUksS0FBSyxTQUFTO0FBQ2QsYUFBTztBQUNYLFdBQU8sT0FBTyxPQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sS0FBSyxHQUFHLFNBQVMsV0FBVyxDQUFDO0FBQUEsRUFDbkU7QUFFQSxXQUFTLGNBQWMsUUFBUSxVQUFVLENBQUMsR0FBRztBQUN6QyxVQUFNLEVBQUUsYUFBYSxhQUFhLElBQUksYUFBYSxPQUFPO0FBQzFELFVBQU0sU0FBUyxJQUFJLE9BQU8sYUFBYSxVQUFVO0FBQ2pELFVBQU0sV0FBVyxJQUFJLFNBQVMsT0FBTztBQUVyQyxRQUFJLE1BQU07QUFDVixlQUFXLFFBQVEsU0FBUyxRQUFRLE9BQU8sTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLE1BQU0sR0FBRztBQUM1RSxVQUFJLENBQUM7QUFDRCxjQUFNO0FBQUEsZUFDRCxJQUFJLFFBQVEsYUFBYSxVQUFVO0FBQ3hDLFlBQUksT0FBTyxLQUFLLElBQUksZUFBZSxLQUFLLE1BQU0sTUFBTSxHQUFHLENBQUMsR0FBRyxpQkFBaUIseUVBQXlFLENBQUM7QUFDdEo7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUNBLFFBQUksZ0JBQWdCLGFBQWE7QUFDN0IsVUFBSSxPQUFPLFFBQVEsY0FBYyxRQUFRLFdBQVcsQ0FBQztBQUNyRCxVQUFJLFNBQVMsUUFBUSxjQUFjLFFBQVEsV0FBVyxDQUFDO0FBQUEsSUFDM0Q7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUNBLFdBQVMsTUFBTSxLQUFLLFNBQVMsU0FBUztBQUNsQyxRQUFJLFdBQVc7QUFDZixRQUFJLE9BQU8sWUFBWSxZQUFZO0FBQy9CLGlCQUFXO0FBQUEsSUFDZixXQUNTLFlBQVksVUFBYSxXQUFXLE9BQU8sWUFBWSxVQUFVO0FBQ3RFLGdCQUFVO0FBQUEsSUFDZDtBQUNBLFVBQU0sTUFBTSxjQUFjLEtBQUssT0FBTztBQUN0QyxRQUFJLENBQUM7QUFDRCxhQUFPO0FBQ1gsUUFBSSxTQUFTLFFBQVEsYUFBVyxLQUFLLElBQUksUUFBUSxVQUFVLE9BQU8sQ0FBQztBQUNuRSxRQUFJLElBQUksT0FBTyxTQUFTLEdBQUc7QUFDdkIsVUFBSSxJQUFJLFFBQVEsYUFBYTtBQUN6QixjQUFNLElBQUksT0FBTyxDQUFDO0FBQUE7QUFFbEIsWUFBSSxTQUFTLENBQUM7QUFBQSxJQUN0QjtBQUNBLFdBQU8sSUFBSSxLQUFLLE9BQU8sT0FBTyxFQUFFLFNBQVMsU0FBUyxHQUFHLE9BQU8sQ0FBQztBQUFBLEVBQ2pFO0FBQ0EsV0FBU0MsV0FBVSxPQUFPLFVBQVUsU0FBUztBQUN6QyxRQUFJLFlBQVk7QUFDaEIsUUFBSSxPQUFPLGFBQWEsY0FBYyxNQUFNLFFBQVEsUUFBUSxHQUFHO0FBQzNELGtCQUFZO0FBQUEsSUFDaEIsV0FDUyxZQUFZLFVBQWEsVUFBVTtBQUN4QyxnQkFBVTtBQUFBLElBQ2Q7QUFDQSxRQUFJLE9BQU8sWUFBWTtBQUNuQixnQkFBVSxRQUFRO0FBQ3RCLFFBQUksT0FBTyxZQUFZLFVBQVU7QUFDN0IsWUFBTUMsVUFBUyxLQUFLLE1BQU0sT0FBTztBQUNqQyxnQkFBVUEsVUFBUyxJQUFJLFNBQVlBLFVBQVMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBQUEsUUFBTztBQUFBLElBQzdFO0FBQ0EsUUFBSSxVQUFVLFFBQVc7QUFDckIsWUFBTSxFQUFFLGNBQWMsSUFBSSxXQUFXLFlBQVksQ0FBQztBQUNsRCxVQUFJLENBQUM7QUFDRCxlQUFPO0FBQUEsSUFDZjtBQUNBLFFBQUksV0FBVyxLQUFLLEtBQUssQ0FBQztBQUN0QixhQUFPLE1BQU0sU0FBUyxPQUFPO0FBQ2pDLFdBQU8sSUFBSSxTQUFTLE9BQU8sV0FBVyxPQUFPLEVBQUUsU0FBUyxPQUFPO0FBQUEsRUFDbkU7OztBQ2hHQSxNQUFPLGtCQUFROzs7QUNvQlIsV0FBUyxXQUFXLEtBQUs7QUFDNUIsV0FBTyxJQUNGLFFBQVEsTUFBTSxPQUFPLEVBQ3JCLFFBQVEsTUFBTSxNQUFNLEVBQ3BCLFFBQVEsTUFBTSxNQUFNO0FBQUEsRUFDN0I7OztBQ3hCQSxNQUFNLHlCQUF5QjtBQWMvQixNQUFxQixlQUFyQixNQUFxQixjQUFhO0FBQUEsSUFDOUIsYUFBYSxLQUFLLFVBQVUsV0FBVyxDQUFDLEdBQUc7QUFDdkMsWUFBTSxXQUFXLFdBQVcsUUFBUTtBQUNwQyxZQUFNLE9BQU8sTUFBTSxTQUFTLFFBQVE7QUFDcEMsYUFBTyxJQUFJLGNBQWEsVUFBVSxNQUFNLFFBQVE7QUFBQSxJQUNwRDtBQUFBLElBRUEsV0FBVyxZQUFZO0FBQ25CLFVBQUksQ0FBQyxLQUFLLE9BQVEsUUFBTztBQUN6QixhQUFPLE9BQU8sT0FBTyxLQUFLLE1BQU0sRUFBRSxRQUFRLGFBQVc7QUFDakQsZUFBTyxPQUFPLE9BQU8sT0FBTztBQUFBLE1BQ2hDLENBQUMsRUFBRTtBQUFBLElBQ1A7QUFBQSxJQUVBLFlBQVksVUFBVSxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUc7QUFDNUMsV0FBSyxLQUFLO0FBQ1YsV0FBSyxPQUFPLGdCQUFLLE1BQU0sSUFBSSxLQUFLLENBQUM7QUFDakMsV0FBSyxlQUFlO0FBQ3BCLFdBQUssT0FBTyxLQUFLLFVBQVU7QUFDM0IsV0FBSyxRQUFRLFVBQVUsU0FBUztBQUNoQyxXQUFLLFVBQVUsVUFBVSxXQUFXLG9CQUFJLEtBQUs7QUFDN0MsV0FBSyxVQUFVLFVBQVUsV0FBVztBQUNwQyxXQUFLLGdCQUFnQixVQUFVLGlCQUFpQjtBQUNoRCxXQUFLLGVBQWUsVUFBVSxnQkFBZ0I7QUFBQSxJQUNsRDtBQUFBLElBRUEsaUJBQWlCO0FBNUNyQjtBQTZDUSxZQUFNLGdCQUFnQixPQUFPLFFBQVEsS0FBSyxZQUFZLE1BQU07QUFDNUQsaUJBQVcsQ0FBQyxjQUFjLE9BQU8sS0FBSyxlQUFlO0FBQ2pELG1CQUFLLE1BQUwscUNBQTRCLENBQUM7QUFDN0IsbUJBQVcsT0FBTztBQUNkLHFCQUFLLEtBQUssWUFBWSxHQUF0QixtQkFBaUM7QUFBQSxNQUN6QztBQUFBLElBQ0o7QUFBQSxJQUVBLFlBQVk7QUFDUixhQUFPLGdCQUFLLFVBQVUsS0FBSyxNQUFNLE1BQU0sRUFBRSxTQUFTLEdBQUcsQ0FBQztBQUFBLElBQzFEO0FBQUEsSUFFQSxRQUFRLGNBQWMsS0FBSyxRQUFRO0FBQy9CLFlBQU0sWUFBWSxLQUFLLEtBQUssWUFBWTtBQUN4QyxZQUFNLFdBQVcsWUFBWSxHQUFHO0FBQ2hDLFVBQUksQ0FBQyxTQUFVLFFBQU87QUFDdEIsYUFBTyxXQUFXLFNBQVMsUUFBUSxjQUFjLENBQUMsR0FBRyxVQUFVO0FBQzNELGVBQU8sT0FBTyxLQUFLO0FBQUEsTUFDdkIsQ0FBQyxDQUFDO0FBQUEsSUFDTjtBQUFBLElBRUEsSUFBSSxTQUFTO0FBQ1QsWUFBTSxJQUFJLFNBQVMsb0JBQW9CO0FBQ3ZDLGFBQU87QUFBQSxRQUNILEVBQUUsSUFBSSxNQUFNLE9BQU8sYUFBYTtBQUFBLFFBQ2hDLEVBQUUsSUFBSSxTQUFTLE9BQU8sU0FBUztBQUFBLFFBQy9CO0FBQUEsVUFBRSxJQUFJO0FBQUEsVUFDRixhQUFhO0FBQUEsVUFDYixPQUFPO0FBQUEsUUFBZ0I7QUFBQSxRQUMzQixFQUFFLElBQUksUUFBUSxPQUFPLFNBQVMsTUFBTSxRQUFRLFFBQVEsT0FBTztBQUFBLE1BQy9EO0FBQUEsSUFDSjtBQUFBLElBRUEsSUFBSSxXQUFXO0FBQ1gsYUFBTztBQUFBLFFBQ0gsT0FBTyxLQUFLO0FBQUEsUUFDWixTQUFTLEtBQUs7QUFBQSxRQUNkLFNBQVMsS0FBSztBQUFBLFFBQ2QsaUJBQWlCLEtBQUs7QUFBQSxRQUN0QixlQUFlLEtBQUs7QUFBQSxRQUNwQixjQUFjLEtBQUs7QUFBQSxNQUN2QjtBQUFBLElBQ0o7QUFBQSxJQUVBLElBQUksa0JBQWtCO0FBQ2xCLFlBQU0sUUFBUSxLQUFLLGlCQUFpQixLQUFLLFlBQVk7QUFDckQsYUFBTyxHQUFHLEtBQUssTUFBTSxRQUFRLEdBQUcsQ0FBQztBQUFBLElBQ3JDO0FBQUEsSUFFQSxJQUFJLGlCQUFpQjtBQUNqQixhQUFPLE9BQU8sT0FBTyxLQUFLLElBQUksRUFBRSxRQUFRLGFBQVc7QUFDL0MsZUFBTyxPQUFPLE9BQU8sT0FBTztBQUFBLE1BQ2hDLENBQUMsRUFBRTtBQUFBLElBQ1A7QUFBQSxJQUVBLElBQUksT0FBTztBQUNQLGFBQU8sR0FBRyxLQUFLLEtBQUssS0FBSyxLQUFLLEVBQUU7QUFBQSxJQUNwQztBQUFBLElBRUEsTUFBTSxPQUFPO0FBQ1QsWUFBTSxXQUFXLFdBQVcsS0FBSyxFQUFFO0FBQ25DLFlBQU0sVUFBVSxVQUFVLEtBQUssR0FBRztBQUFBLElBQ3RDO0FBQUEsRUFDSjs7O0FDcEZBLGlCQUFzQixnQkFBZ0IsVUFBVTtBQUM1QyxRQUFJO0FBQ0EsWUFBTSxRQUFRLE1BQU0sU0FBUyxRQUFRO0FBQ3JDLGFBQU8sTUFBTTtBQUFBLElBQ2pCLFNBQVMsT0FBTztBQUNaLFVBQUksTUFBTSxTQUFTLGdCQUFpQixRQUFPO0FBQzNDLFlBQU07QUFBQSxJQUNWO0FBQUEsRUFDSjs7O0FDeEJBLE1BQU0saUJBQWlCLFFBQVEsU0FBUyxZQUFZO0FBQ3BELE1BQU0sZ0JBQWdCLFdBQVc7QUFDakMsTUFBTSxpQkFBaUIsWUFBWTtBQUVuQyxNQUFJLHFCQUFxQjtBQU96QixpQkFBc0IsY0FBYztBQUNoQyxVQUFNLGVBQWU7QUFDckIsVUFBTSxjQUFjLE1BQU0sU0FBUyxZQUFZO0FBQy9DLFVBQU0sV0FBVyxLQUFLLE1BQU0sV0FBVztBQUV2QyxVQUFNLGFBQWEsTUFBTSxjQUFjLFNBQVM7QUFDaEQsVUFBTSxpQkFBaUIsV0FDbEIsT0FBTyxPQUFLLEVBQUUsU0FBUyxVQUFVLEVBQUUsTUFBTSxTQUFTLE1BQU0sQ0FBQyxFQUN6RCxJQUFJLE9BQUssRUFBRSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFFbEMsV0FBTyxRQUFRO0FBQUEsTUFDWCxPQUFPLFFBQVEsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsTUFBTTtBQUN2QyxlQUFPLGVBQWUsU0FBUyxHQUFHO0FBQUEsTUFDdEMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxNQUFNO0FBQ3JCLGVBQU8sYUFBYSxLQUFLLEtBQUssS0FBSztBQUFBLE1BQ3ZDLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjtBQXVDQSxXQUFTLG1CQUFtQixTQUFTLFFBQVE7QUFDekMsV0FBTyxRQUFRLENBQUMsSUFBSSxPQUFPLElBQUksQ0FBQyxHQUFHLE1BQU07QUFDckMsYUFBTyxHQUFHLENBQUMsR0FBRyxRQUFRLElBQUksQ0FBQyxDQUFDO0FBQUEsSUFDaEMsQ0FBQyxFQUFFLEtBQUssRUFBRTtBQUFBLEVBQ2Q7QUFFQSxXQUFTLHFCQUFxQixTQUFTLFFBQVE7QUFDM0MsV0FBTyxRQUFRLENBQUMsSUFBSSxPQUFPLElBQUksQ0FBQyxHQUFHLE1BQU07QUFDckMsYUFBTyxLQUFLLENBQUMsSUFBSSxRQUFRLElBQUksQ0FBQyxDQUFDO0FBQUEsSUFDbkMsQ0FBQyxFQUFFLEtBQUssRUFBRTtBQUFBLEVBQ2Q7QUFFQSxNQUFNLG1CQUFtQixlQUFlQyxtQkFBa0I7QUFDdEQsVUFBTUMsVUFBUyxNQUFNO0FBQ3JCLFVBQU0sT0FBTyxLQUFLLFVBQVVBLFNBQVEsTUFBTSxDQUFDO0FBQzNDLFVBQU0sYUFBYTtBQUNuQixRQUFJLFFBQVEsRUFBRSxJQUFJLG1DQUFtQyxVQUFVO0FBQy9ELFVBQU0sVUFBVSxZQUFZLElBQUk7QUFBQSxFQUNwQyxHQUFHLFNBQVMsR0FBSTtBQUVoQixpQkFBZSxhQUFhLGNBQWMsVUFBVTtBQUNoRCxVQUFNQSxVQUFTLE1BQU07QUFDckIsVUFBTSxZQUFZQSxRQUFBLGtCQUFBQSxRQUFBLGdCQUF5QixDQUFDO0FBQzVDLGtEQUF3QjtBQUN4QixjQUFVLFFBQVEsS0FBSztBQUN2QixvQkFBZ0I7QUFBQSxFQUNwQjtBQUVBLGlCQUFzQixhQUFhO0FBQy9CLFFBQUk7QUFDQSxZQUFNLFlBQVk7QUFDbEIsVUFBSSxDQUFDLE1BQU0sZ0JBQWdCLFNBQVMsRUFBRyxRQUFPLENBQUM7QUFDL0MsWUFBTSxPQUFPLE1BQU0sU0FBUyxTQUFTO0FBQ3JDLGFBQU8sS0FBSyxNQUFNLElBQUk7QUFBQSxJQUMxQixTQUFTLEdBQUc7QUFDUixVQUFJLFFBQVEsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQzNELGFBQU8sQ0FBQztBQUFBLElBQ1o7QUFBQSxFQUNKO0FBdUJBLFNBQU8sV0FBVyxTQUFTLGNBQWM7QUFDckMsV0FBTyxTQUFTLFlBQVksUUFBUTtBQUNoQyxZQUFNLE1BQU0scUJBQXFCLFNBQVMsTUFBTTtBQUNoRCxVQUFJLGVBQWdCLGNBQWEsY0FBYyxHQUFHO0FBQ2xELGFBQU8sb0JBQW9CLFFBQVEsY0FBYyxLQUFLLE1BQU0sS0FDckQsbUJBQW1CLFNBQVMsTUFBTTtBQUFBLElBQzdDO0FBQUEsRUFDSjs7O0FDNUlBLE1BQU0scUJBQXFCO0FBQUEsSUFDdkI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFFQSxXQUFTLGNBQWMsS0FBSztBQUN4QixXQUFPLE9BQU8sT0FBTyxRQUFRLFlBQVksT0FBTyxLQUFLLEdBQUcsRUFBRSxXQUFXO0FBQUEsRUFDekU7QUFFQSxXQUFTLFFBQVEsS0FBSztBQUNsQixVQUFNLGNBQWMsbUJBQW1CLEtBQUssVUFBUSxLQUFLLEtBQUssR0FBRyxDQUFDO0FBQ2xFLFdBQU8sY0FBYyxFQUFFLE1BQU0sWUFBWSxJQUFJLENBQUM7QUFBQSxFQUNsRDtBQUVBLFdBQVMsZUFBZSxPQUFPO0FBQzNCLFdBQU87QUFBQSxNQUNILE9BQU8sTUFBTSxDQUFDLEVBQUU7QUFBQSxNQUNoQixLQUFLLE1BQU0sQ0FBQztBQUFBLE1BQ1osR0FBRyxRQUFRLE1BQU0sQ0FBQyxDQUFDO0FBQUEsTUFDbkIsT0FBTyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUM7QUFBQSxJQUMzQjtBQUFBLEVBQ0o7QUFFQSxXQUFTLGtCQUFrQixhQUFhLGFBQWE7QUFDakQsYUFBUyxJQUFJLFlBQVksU0FBUyxHQUFHLEtBQUssR0FBRyxLQUFLO0FBQzlDLFVBQUksWUFBWSxDQUFDLEVBQUUsVUFBVTtBQUN6QixlQUFPO0FBQUEsSUFDZjtBQUFBLEVBQ0o7QUFFQSxXQUFTLHVCQUF1QixhQUFhLFdBQVc7QUFDcEQsVUFBTSxTQUFTLENBQUM7QUFDaEIsV0FBTyxZQUFZLFNBQVMsWUFBWSxHQUFHO0FBQ3ZDLFlBQU0sT0FBTyxZQUFZLElBQUk7QUFDN0IsYUFBTyxRQUFRLEdBQUcsS0FBSyxHQUFHLEtBQUssS0FBSyxLQUFLLEVBQUU7QUFBQSxJQUMvQztBQUNBLFFBQUksWUFBWSxTQUFTLEVBQUU7QUFDdkIsYUFBTyxRQUFRLFlBQVksU0FBUyxFQUFFLEtBQUs7QUFDL0MsV0FBTztBQUFBLEVBQ1g7QUFFQSxXQUFTLGdCQUFnQixPQUFPLFdBQVcsYUFBYTtBQUNwRCxVQUFNLFlBQVksa0JBQWtCLGFBQWEsUUFBUSxDQUFDO0FBQzFELGdCQUFZLFNBQVMsRUFBRSxPQUFPO0FBQzlCLGdCQUFZLFNBQVMsRUFBRSxRQUFRO0FBQUEsTUFDM0IsR0FBRyx1QkFBdUIsYUFBYSxTQUFTO0FBQUEsTUFDaEQ7QUFBQSxJQUNKLEVBQUUsS0FBSyxJQUFJO0FBQUEsRUFDZjtBQUVBLFdBQVMsYUFBYSxhQUFhLE9BQU87QUFDdEMsVUFBTSxXQUFXLFlBQVksWUFBWSxTQUFTLENBQUM7QUFDbkQsV0FBTyxVQUFVLFNBQVMsZUFDbkIsVUFBVSxVQUFVLFFBQVE7QUFBQSxFQUN2QztBQUVBLFdBQVMsY0FBYyxNQUFNO0FBQ3pCLFVBQU0sY0FBYyxDQUFDO0FBQ3JCLGVBQVcsUUFBUSxLQUFLLFFBQVEsRUFBRSxNQUFNLE9BQU8sR0FBRztBQUM5QyxZQUFNLFFBQVEsS0FBSyxNQUFNLDJCQUEyQjtBQUNwRCxVQUFJLFNBQVMsQ0FBQyxhQUFhLGFBQWEsTUFBTSxDQUFDLEVBQUUsTUFBTSxHQUFHO0FBQ3RELG9CQUFZLEtBQUssZUFBZSxLQUFLLENBQUM7QUFDdEM7QUFBQSxNQUNKO0FBQ0EsWUFBTSxhQUFhLEtBQUssTUFBTSxpQkFBaUI7QUFDL0Msc0JBQWdCLFdBQVcsQ0FBQyxFQUFFLFFBQVEsV0FBVyxDQUFDLEdBQUcsV0FBVztBQUFBLElBQ3BFO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFFQSxNQUFNLGVBQWUsQ0FBQztBQUFBLElBQ2xCLE9BQU8sQ0FBQyxRQUFRLFFBQVEsTUFBTSxRQUFRLE9BQU8sR0FBRyxDQUFDO0FBQUEsSUFDakQsT0FBTyxDQUFDLFFBQVEsS0FBSyxVQUFVLE9BQU8sR0FBRyxFQUFFLEtBQUssS0FBSztBQUFBLEVBQ3pELEdBQUc7QUFBQSxJQUNDLE9BQU8sQ0FBQyxRQUFRLFFBQVEsT0FBTyxPQUFPLFFBQVEsR0FBRztBQUFBLElBQ2pELE9BQU8sQ0FBQyxRQUFRLEtBQUssVUFBVSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLEtBQUs7QUFBQSxFQUNwRSxHQUFHO0FBQUEsSUFDQyxPQUFPLE1BQU07QUFBQSxJQUNiLE9BQU8sQ0FBQyxRQUFRLEtBQUssVUFBVSxPQUFPLEdBQUcsSUFBSTtBQUFBLEVBQ2pELENBQUM7QUFFRCxXQUFTLFVBQVUsT0FBTztBQUN0QixVQUFNLENBQUMsS0FBSyxLQUFLLElBQUksTUFBTSxJQUFJO0FBQy9CLFVBQU0sQ0FBQyxFQUFDLE1BQU0sSUFBSSxNQUFNLE1BQU0sU0FBUyxDQUFDO0FBQ3hDLFVBQU0sU0FBUyxhQUFhLEtBQUssUUFBTSxHQUFHLE1BQU0sUUFBUSxHQUFHLENBQUM7QUFDNUQsVUFBTSxhQUFhLGNBQWMsS0FBSyxJQUFJLE9BQU87QUFDakQsV0FBTyxNQUFNLFFBQVEsS0FBSyxVQUFVO0FBQUEsRUFDeEM7QUFFTyxXQUFTLFNBQVMsTUFBTTtBQUMzQixVQUFNLE9BQU8sQ0FBQztBQUNkLFVBQU0sUUFBUSxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUM7QUFDN0IsZUFBVyxFQUFFLE9BQU8sS0FBSyxNQUFNLEtBQUssY0FBYyxJQUFJLEdBQUc7QUFDckQsYUFBTyxNQUFNLFNBQVMsSUFBSSxNQUFPLFdBQVUsS0FBSztBQUNoRCxZQUFNLEtBQUssQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFBQSxJQUNqQztBQUNBLFdBQU8sTUFBTSxTQUFTLElBQUksRUFBRyxXQUFVLEtBQUs7QUFDNUMsV0FBTztBQUFBLEVBQ1g7OztBQ3BHQSxXQUFTLFlBQVksTUFBTTtBQUN2QixPQUFHLDhCQUE4QixNQUFNO0FBQ25DLFlBQU0sTUFBTSxTQUFTLGdCQUFnQjtBQUNyQyxhQUFPLEdBQUcsRUFBRSxZQUFZO0FBQ3hCLGFBQU8sSUFBSSxLQUFLLEVBQUUsS0FBSyxPQUFPO0FBQUEsSUFDbEMsQ0FBQztBQUVELE9BQUcscUNBQXFDLE1BQU07QUFDMUMsWUFBTSxNQUFNLFNBQVMsaUJBQWlCO0FBQ3RDLGFBQU8sR0FBRyxFQUFFLFlBQVk7QUFDeEIsYUFBTyxJQUFJLElBQUksRUFBRSxLQUFLLElBQUk7QUFDMUIsYUFBTyxJQUFJLEtBQUssRUFBRSxLQUFLLElBQUk7QUFBQSxJQUMvQixDQUFDO0FBRUQsT0FBRyx3QkFBd0IsTUFBTTtBQUM3QixZQUFNLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFJSjtBQUNBLGFBQU8sSUFBSSxNQUFNLEVBQUUsWUFBWTtBQUMvQixhQUFPLElBQUksT0FBTyxHQUFHLEVBQUUsS0FBSyxNQUFNO0FBQ2xDLGFBQU8sSUFBSSxPQUFPLEtBQUssRUFBRSxLQUFLLE1BQU07QUFDcEMsYUFBTyxJQUFJLE9BQU8sSUFBSSxFQUFFLEtBQUssTUFBTTtBQUFBLElBQ3ZDLENBQUM7QUFFRCxPQUFHLHVCQUF1QixNQUFNO0FBQzVCLFlBQU0sTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUlKO0FBQ0EsYUFBTyxJQUFJLFlBQVksRUFBRSxZQUFZO0FBQ3JDLGFBQU8sSUFBSSxhQUFhLE1BQU0sRUFBRSxLQUFLLENBQUM7QUFDdEMsYUFBTyxJQUFJLGFBQWEsQ0FBQyxDQUFDLEVBQUUsS0FBSyxrQkFBa0I7QUFDbkQsYUFBTyxJQUFJLGFBQWEsQ0FBQyxDQUFDLEVBQUUsS0FBSyxpQkFBaUI7QUFDbEQsYUFBTyxJQUFJLGFBQWEsQ0FBQyxDQUFDLEVBQUUsS0FBSyxvQkFBb0I7QUFDckQsYUFBTyxJQUFJLGFBQWEsQ0FBQyxDQUFDLEVBQUUsS0FBSyxnQkFBZ0I7QUFBQSxJQUNyRCxDQUFDO0FBRUQsT0FBRywrQkFBK0IsTUFBTTtBQUNwQyxZQUFNLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFJSjtBQUNBLGFBQU8sSUFBSSxVQUFVLEVBQUUsWUFBWTtBQUNuQyxhQUFPLElBQUksVUFBVSxFQUFFO0FBQUEsUUFDbkI7QUFBQSxNQUdKO0FBQUEsSUFDSixDQUFDO0FBRUQsT0FBRyxrRUFBa0UsTUFBTTtBQUN2RSxZQUFNLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFJSjtBQUNBLGFBQU8sSUFBSSxVQUFVLEVBQUUsWUFBWTtBQUNuQyxhQUFPLElBQUksVUFBVSxFQUFFO0FBQUEsUUFDbkI7QUFBQSxNQUdKO0FBQUEsSUFDSixDQUFDO0FBRUQsT0FBRyxrRUFBa0UsTUFBTTtBQUN2RSxZQUFNLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFJSjtBQUNBLGFBQU8sSUFBSSxVQUFVLEVBQUUsWUFBWTtBQUNuQyxhQUFPLElBQUksVUFBVSxFQUFFO0FBQUEsUUFDbkI7QUFBQSxNQUdKO0FBQUEsSUFDSixDQUFDO0FBRUQsT0FBRyxtREFBbUQsTUFBTTtBQUN4RCxZQUFNLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFFSjtBQUNBLGFBQU8sSUFBSSxVQUFVLENBQUMsRUFBRSxZQUFZO0FBQ3BDLGFBQU8sSUFBSSxVQUFVLENBQUMsRUFBRSxLQUFLLFVBQVU7QUFBQSxJQUMzQyxDQUFDO0FBRUQsT0FBRyw4QkFBOEIsTUFBTTtBQUNuQyxZQUFNLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFLSjtBQUNBLGFBQU8sSUFBSSxTQUFTLEVBQUUsWUFBWTtBQUNsQyxhQUFPLElBQUksU0FBUyxFQUFFO0FBQUEsUUFDbEI7QUFBQSxNQUNKO0FBQ0EsYUFBTyxJQUFJLEtBQUssRUFBRSxZQUFZO0FBQzlCLGFBQU8sSUFBSSxLQUFLLEVBQUUsS0FBSyxPQUFPO0FBQUEsSUFDbEMsQ0FBQztBQUFBLEVBQ0wsQ0FBQzs7O0FDL0dELGlCQUFzQixjQUFjLEtBQUs7QUFDckMsVUFBTSxZQUFZLENBQUM7QUFDbkIsVUFBTSxRQUFRLE1BQU0sY0FBYyxHQUFHO0FBQ3JDLGVBQVcsUUFBUSxPQUFPO0FBQ3RCLFlBQU0sT0FBTyxHQUFHLEdBQUcsSUFBSSxLQUFLLEtBQUs7QUFDakMsVUFBSSxLQUFLLFNBQVMsYUFBYTtBQUMzQixZQUFJLEtBQUssVUFBVSxPQUFPLEtBQUssVUFBVSxLQUFNO0FBQy9DLGtCQUFVLEtBQUssR0FBRyxNQUFNLGNBQWMsSUFBSSxDQUFDO0FBQUEsTUFDL0MsV0FBVyxLQUFLLE1BQU0sU0FBUyxXQUFXLEdBQUc7QUFDekMsa0JBQVUsS0FBSyxJQUFJO0FBQUEsTUFDdkI7QUFBQSxJQUNKO0FBQ0EsV0FBTztBQUFBLEVBQ1g7OztBQ1dBLE1BQU0sT0FBTztBQUFBLElBQ1QsT0FBTztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsTUFBTTtBQUFBLEVBQ1Y7QUEvQkE7QUFpQ0EsTUFBTSxpQkFBTixNQUFxQjtBQUFBLElBWWpCLFlBQVksU0FBUztBQVp6QjtBQUNJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBR0ksVUFBSSxDQUFDLFNBQVM7QUFDVixjQUFNLElBQUksTUFBTSwyQ0FBMkM7QUFFL0QseUJBQUssUUFBUyxRQUFRO0FBQ3RCLHlCQUFLLGFBQWMsUUFBUSxTQUFTO0FBQ3BDLHlCQUFLLHlCQUEwQixRQUFRLDBCQUEwQjtBQUNqRSx5QkFBSyx5QkFBMEIsUUFBUSwwQkFBMEI7QUFDakUseUJBQUssY0FBZSxRQUFRLGdCQUFnQixXQUFTO0FBQ3JELHlCQUFLLGNBQWUsQ0FBQztBQUNyQix5QkFBSyxlQUFnQixDQUFDO0FBQ3RCLHlCQUFLLHFCQUFzQixDQUFDO0FBQzVCLHlCQUFLLGVBQWdCLENBQUM7QUFDdEIseUJBQUssY0FBZSxRQUFRLFFBQVE7QUFBQSxJQUN4QztBQUFBLElBRUEsZUFBZSxTQUFTO0FBQ3BCLFdBQUssWUFBWTtBQUNqQixXQUFLLHNCQUFzQjtBQUMzQixXQUFLLGVBQWU7QUFFcEIsVUFBSSxTQUFTLE9BQU8sUUFBUTtBQUN4Qiw4QkFBSyxxQ0FBTCxXQUFZLHdCQUF3QixRQUFRLE1BQU0sSUFBSTtBQUN0RCw4QkFBSyw0Q0FBTDtBQUFBLE1BQ0o7QUFFQSw0QkFBSyxxQ0FBTCxXQUFZO0FBQ1osNEJBQUssNENBQUw7QUFBQSxJQUNKO0FBQUEsSUFFQSxTQUFTLFFBQVE7QUFDYixXQUFLO0FBRUwsY0FBUSxPQUFPLFFBQVE7QUFBQSxRQUN2QixLQUFLO0FBQ0QsNkJBQUssZUFBYyxLQUFLLE1BQU07QUFDOUIsZUFBSztBQUNMLGdDQUFLLHFDQUFMLFdBQVksc0JBQUssdUNBQUwsV0FBYyxVQUFVO0FBQ3BDO0FBQUEsUUFFSixLQUFLO0FBQ0QsNkJBQUsscUJBQW9CLEtBQUssTUFBTTtBQUNwQyxlQUFLO0FBQ0w7QUFBQSxRQUVKLEtBQUs7QUFDRCxlQUFLO0FBQ0wsZ0NBQUsscUNBQUwsV0FBWSxzQkFBSyx1Q0FBTCxXQUFjLFNBQVM7QUFDbkM7QUFBQSxRQUVKLEtBQUs7QUFDRCxlQUFLO0FBQ0wsNkJBQUssY0FBYSxLQUFLLE1BQU07QUFDN0IsZUFBSztBQUNMLGdDQUFLLHFDQUFMLFdBQVksc0JBQUssdUNBQUwsV0FBYyxPQUFPO0FBQ2pDO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUVBLFVBQVUsUUFBUTtBQUNkLFVBQUksT0FBTyxvQkFBb0IsU0FBUyxHQUFHO0FBQ3ZDLGFBQUs7QUFDTCwyQkFBSyxlQUFjLEtBQUssTUFBTTtBQUFBLE1BQ2xDO0FBQUEsSUFDSjtBQUFBLElBRUEsTUFBTSxZQUFZLFFBQVE7QUFDdEIsVUFBSSxPQUFPO0FBQ1AsYUFBSyxnQkFBZ0IsT0FBTyxtQkFBbUI7QUFFbkQsNEJBQUssNENBQUw7QUFDQSw0QkFBSyw0Q0FBTDtBQUVBLFVBQUksbUJBQUssY0FBYSxTQUFTO0FBQzNCLDhCQUFLLHFDQUFMLFdBQVk7QUFFaEIsZUFBUyxJQUFJLEdBQUcsSUFBSSxtQkFBSyxjQUFhLFFBQVE7QUFDMUMsOEJBQUssa0RBQUwsV0FBeUIsbUJBQUssY0FBYSxDQUFDLEdBQUcsSUFBSTtBQUV2RCxpQkFBVyxlQUFlLG1CQUFLO0FBQzNCLDhCQUFLLG1EQUFMLFdBQTBCO0FBRTlCLFVBQUksT0FBTyxvQkFBb0IsU0FBUyxHQUFHO0FBQ3ZDLDhCQUFLLG1EQUFMLFdBQTBCO0FBQUEsVUFDdEIsVUFBVTtBQUFBLFVBQ1YsR0FBRztBQUFBLFFBQ1A7QUFBQSxNQUNKO0FBRUEsVUFBSSxtQkFBSyw0QkFBMkIsT0FBTyxrQkFBa0IsVUFBVTtBQUNuRSxZQUFJLG1CQUFLLGVBQWMsU0FBUztBQUM1QixnQ0FBSyxxQ0FBTCxXQUFZO0FBRWhCLGlCQUFTLElBQUksR0FBRyxJQUFJLG1CQUFLLGVBQWMsUUFBUTtBQUMzQyxnQ0FBSyxrREFBTCxXQUF5QixtQkFBSyxlQUFjLENBQUMsR0FBRyxJQUFJO0FBQUEsTUFDNUQ7QUFFQSw0QkFBSyx1REFBTDtBQUVBLFVBQUksS0FBSyxZQUFZO0FBQ2pCLDhCQUFLLDRDQUFMO0FBQUE7QUFFQSw4QkFBSyxxQ0FBTCxXQUFZO0FBRWhCLDRCQUFLLDRDQUFMO0FBRUEsWUFBTSxVQUFVLFFBQVEsWUFBWSxPQUFRO0FBQzVDLDRCQUFLLHFDQUFMLFdBQVksZUFBZSxPQUFPLElBQUksT0FBTyxVQUFVLE9BQU8sQ0FBQztBQUMvRCw0QkFBSyw0Q0FBTDtBQUVBLFVBQUksUUFBUSxrQkFBa0IsY0FBYztBQUN4Qyw4QkFBSyxxQ0FBTCxXQUFZLGVBQWUsT0FBTyxnQkFBZ0I7QUFDbEQsOEJBQUssNENBQUw7QUFBQSxNQUNKO0FBRUEsVUFBSSxRQUFRLE9BQU8sUUFBUTtBQUN2Qiw4QkFBSyxxQ0FBTCxXQUFZLHdCQUF3QixPQUFPLE1BQU0sSUFBSTtBQUNyRCw4QkFBSyw0Q0FBTDtBQUFBLE1BQ0o7QUFFQSxZQUFNLG1CQUFLO0FBQUEsSUFDZjtBQUFBLEVBcUpKO0FBelJJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBVko7QUF1SUksYUFBTSxTQUFDLE1BQU07QUFDVCx1QkFBSyxjQUFlLG1CQUFLLGNBQWEsS0FBSyxNQUFNLG1CQUFLLFFBQUwsV0FBWSxLQUFLO0FBQUEsRUFDdEU7QUFFQSxvQkFBYSxXQUFHO0FBQ1osMEJBQUsscUNBQUwsV0FBWTtBQUFBLEVBQ2hCO0FBRUEsZUFBUSxTQUFDLE9BQU8sTUFBTTtBQUNsQixRQUFJLENBQUMsbUJBQUs7QUFDTixhQUFPO0FBRVgsV0FBTyxLQUFLLEtBQUssSUFBSSxPQUFPLEtBQUs7QUFBQSxFQUNyQztBQUVBLDBCQUFtQixTQUFDLFFBQVEsa0JBQWtCO0FBQzFDLDBCQUFLLDRDQUFMO0FBQ0EsMEJBQUsscUNBQUwsV0FBWSxHQUFHLGdCQUFnQixLQUFLLE9BQU8sUUFBUTtBQUNuRCwwQkFBSyx1REFBTCxXQUE4QjtBQUU5QixRQUFJLENBQUMsT0FBTztBQUNSO0FBRUosMEJBQUssNENBQUw7QUFDQSwwQkFBSyxxQ0FBTCxXQUFZLE9BQU8sZUFBZSxDQUFDO0FBQ25DLDBCQUFLLDRDQUFMO0FBRUEsZUFBVyxTQUFTLE9BQU8sV0FBVztBQUNsQyw0QkFBSyxxQ0FBTCxXQUFZLE9BQU8sR0FBRyxNQUFNLFNBQVMsT0FBTyxNQUFNLE9BQU8sSUFBSSxDQUFDO0FBQzlELDRCQUFLLDRDQUFMO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSwyQkFBb0IsU0FBQyxRQUFRO0FBQ3pCLDBCQUFLLDRDQUFMO0FBQ0EsMEJBQUsscUNBQUwsV0FBWSxnQkFBZ0IsT0FBTyxRQUFRO0FBQzNDLDBCQUFLLHVEQUFMLFdBQThCO0FBQUEsRUFDbEM7QUFFQSwrQkFBd0IsU0FBQyxRQUFRO0FBQzdCLGVBQVcscUJBQXFCLE9BQU8sb0JBQW9CO0FBQ3ZELDRCQUFLLDRDQUFMO0FBQ0EsNEJBQUsscUNBQUwsV0FBWSxPQUFPLFlBQVksQ0FBQztBQUNoQyw0QkFBSyw0Q0FBTDtBQUNBLDRCQUFLLHFDQUFMLFdBQ0ksc0JBQUssdUNBQUwsV0FDSSxPQUNBLE9BQU8sa0JBQWtCLFNBQVMsQ0FBQztBQUczQyw0QkFBSyw0Q0FBTDtBQUNBLDRCQUFLLHFDQUFMLFdBQVksT0FBTyxVQUFVLENBQUM7QUFDOUIsNEJBQUssNENBQUw7QUFDQSw0QkFBSyxxQ0FBTCxXQUNJLE9BQU8sbUJBQUssY0FBTCxXQUFrQixrQkFBa0IsUUFBUSxDQUFDO0FBQUEsSUFFNUQ7QUFFQSxRQUNJLE9BQU8sbUJBQW1CLFdBQVcsS0FDbEMsT0FBTyxtQkFBbUIsV0FBVyxHQUMxQztBQUNFLDRCQUFLLDRDQUFMO0FBQ0EsNEJBQUsscUNBQUwsV0FBWSxPQUFPLFlBQVksQ0FBQztBQUNoQyw0QkFBSyw0Q0FBTDtBQUNBLDRCQUFLLHFDQUFMLFdBQ0ksc0JBQUssdUNBQUwsV0FDSSxPQUNBLE9BQU8sNEJBQTRCLENBQUM7QUFBQSxJQUdoRDtBQUVBLDBCQUFLLDRDQUFMO0FBQUEsRUFDSjtBQUVBLDBCQUFtQixTQUFDLFFBQVEsbUJBQW1CO0FBQzNDLDBCQUFLLDRDQUFMO0FBQ0EsMEJBQUssNENBQUw7QUFDQSwwQkFBSyxxQ0FBTCxXQUFZLEdBQUcsaUJBQWlCLEtBQUssT0FBTyxRQUFRO0FBQ3BELDBCQUFLLDRDQUFMO0FBRUEsVUFBTSxTQUFTLE9BQU8saUJBQWlCO0FBRXZDLDBCQUFLLHFDQUFMLFdBQVksT0FBTyxzQkFBSyx1Q0FBTCxXQUFjLFVBQVUsU0FBUyxDQUFDO0FBQ3JELDBCQUFLLDRDQUFMO0FBQUEsRUFDSjtBQUVBLCtCQUF3QixXQUFHO0FBQ3ZCLFFBQUksbUJBQUsscUJBQW9CLFdBQVc7QUFDcEM7QUFFSixVQUFNLFdBQVcsQ0FBQztBQUVsQixlQUFXLFFBQVEsbUJBQUssc0JBQXFCO0FBQ3pDLFlBQU0sU0FBUyxLQUFLO0FBRXBCLFVBQUksQ0FBQyxTQUFTLE1BQU07QUFDaEIsaUJBQVMsTUFBTSxJQUFJLENBQUM7QUFFeEIsZUFBUyxNQUFNLEVBQUUsS0FBSyxLQUFLLFFBQVE7QUFBQSxJQUN2QztBQUVBLDBCQUFLLDRDQUFMO0FBRUEsZUFBVyxDQUFDLFFBQVEsU0FBUyxLQUFLLE9BQU8sUUFBUSxRQUFRLEdBQUc7QUFDeEQsNEJBQUsscUNBQUwsV0FDSSxHQUFHLFVBQVUsTUFBTSxJQUFJLE9BQU8sUUFBUSxVQUFVLE1BQU0sQ0FBQyw0QkFDekIsTUFBTTtBQUV4Qyw0QkFBSyw0Q0FBTDtBQUVBLFVBQUksQ0FBQyxtQkFBSztBQUNOO0FBRUosaUJBQVcsUUFBUSxXQUFXO0FBQzFCLDhCQUFLLHFDQUFMLFdBQVksUUFBUSxJQUFJO0FBQ3hCLDhCQUFLLDRDQUFMO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRUEsb0JBQWEsV0FBRztBQUNaLDBCQUFLLDRDQUFMO0FBRUEsUUFBSSxLQUFLLHdCQUF3QixLQUFLLFdBQVc7QUFDN0MsNEJBQUsscUNBQUwsV0FDSSxPQUFPLEtBQUssbUJBQW1CLE9BQU8sS0FBSyxTQUFTLEtBQ2xELE9BQU8sU0FBUyxLQUFLLFNBQVM7QUFFcEMsNEJBQUssNENBQUw7QUFBQSxJQUNKO0FBRUEsUUFBSSxVQUNFLEdBQUcsS0FBSyxtQkFBbUIsSUFDeEIsT0FBTyxRQUFRLEtBQUssbUJBQW1CLENBQUMsS0FDeEMsS0FBSyxZQUFZLE1BQ3BCLE9BQU8sV0FBVyxLQUFLLFlBQVk7QUFFekMsUUFBSSxtQkFBSyxlQUFjLFFBQVE7QUFDM0IsaUJBQ08sS0FBSyxtQkFBSyxlQUFjLE1BQU0sY0FDL0IsT0FBTyxRQUFRLG1CQUFLLGVBQWMsTUFBTTtBQUFBLElBQ2xEO0FBRUEsMEJBQUsscUNBQUwsV0FBWTtBQUFBLEVBQ2hCO0FBR0osV0FBUyxPQUFPLE1BQU0sT0FBTztBQUN6QixXQUFPLFVBQVUsSUFBSSxPQUFPLEdBQUcsSUFBSTtBQUFBLEVBQ3ZDO0FBRUEsV0FBUyxPQUFPLE1BQU0sUUFBUTtBQUMxQixVQUFNLFNBQVMsSUFBSSxPQUFPLE1BQU07QUFFaEMsWUFBUSxRQUFRLElBQ1gsTUFBTSxJQUFJLEVBQ1YsSUFBSSxVQUFRLFNBQVMsSUFBSSxFQUN6QixLQUFLLElBQUk7QUFBQSxFQUNsQjtBQUVBLE1BQU8seUJBQVE7OztBQ3RVZixNQUFNLGdCQUFnQjtBQUN0QixNQUFNLGdCQUFnQjtBQUV0QixpQkFBZSxrQkFBa0I7QUFDN0IsVUFBTSxZQUFZLE1BQU0sY0FBYyxTQUFTO0FBQy9DLFVBQU0sTUFBTSxZQUFZLFVBQVUsVUFBVTtBQUM1QyxlQUFXLFFBQVE7QUFDZixZQUFNLE9BQU8sSUFBSSxJQUFJO0FBQUEsRUFDN0I7QUFFQSxXQUFTLHdCQUF3QjtBQUM3QixRQUFJLGFBQWEsb0JBQXFCO0FBQ3RDLFVBQU0sSUFBSSxNQUFNLGlEQUFpRCxRQUFRLElBQUk7QUFBQSxFQUNqRjtBQUVBLGlCQUFlLFdBQVc7QUFDdEIsUUFBSSxTQUFTLEVBQUUsS0FBSyx5QkFBeUI7QUFDN0MsZUFBVyxLQUFLO0FBRWhCLFFBQUksU0FBUyxFQUFFLEtBQUssNEJBQTRCO0FBQ2hELDBCQUFzQjtBQUV0QixRQUFJLFNBQVMsRUFBRSxLQUFLLDZCQUE2QjtBQUNqRCxVQUFNLFdBQVcsUUFBUSxNQUFNO0FBRS9CLFFBQUksU0FBUyxFQUFFLEtBQUssc0JBQXNCO0FBQzFDLFVBQU0sZ0JBQWdCO0FBRXRCLFFBQUksU0FBUyxFQUFFLEtBQUsseUJBQXlCO0FBQzdDLFVBQU0sT0FBTyxlQUFlO0FBQUEsRUFDaEM7QUFFQSxXQUFTLE1BQU0sU0FBUztBQUNwQix1QkFBbUIsZ0JBQWdCLEtBQUssVUFBVSxFQUFFLFFBQVEsQ0FBQyxJQUFJLElBQUk7QUFBQSxFQUN6RTtBQUVBLFVBQVEsT0FBTyxFQUFFO0FBQUEsSUFDYixJQUFJLHVCQUFlLEVBQUUsTUFBTSxDQUFDO0FBQUEsRUFDaEM7QUFFQSxVQUFRLE9BQU8sRUFBRSxZQUFZO0FBQUEsSUFDekIsTUFBTSxZQUFZLFFBQVE7QUFDdEIsWUFBTSxTQUFTLEtBQUssVUFBVSxFQUFFLFFBQVEsT0FBTyxjQUFjLENBQUM7QUFDOUQsWUFBTSxtQkFBbUIsZ0JBQWdCLFNBQVMsSUFBSTtBQUN0RCxVQUFJLENBQUMsUUFBUSxTQUFTLGFBQWEsRUFBRyxPQUFNO0FBQUEsSUFDaEQ7QUFBQSxFQUNKLENBQUM7QUFFRCxTQUFPLGlCQUFpQixnQkFBZ0IsTUFBTTtBQUMxQyxZQUFRO0FBQUEsRUFDWixDQUFDO0FBRUQsV0FBUzsiLAogICJuYW1lcyI6IFsibG9nIiwgInRpbWVzdGFtcCIsICJsb2ciLCAic3RyaW5naWZ5IiwgInJlcyIsICJyZXMiLCAibWFwIiwgInNjaGVtYSIsICJub2RlIiwgInNjaGVtYSIsICJpdCIsICJpbmRlbnQiLCAiaW5kZW50IiwgImkiLCAiZW5kIiwgImlzQmxvY2siLCAiaW5kZW50IiwgImluZGVudCIsICJtYXAiLCAiaXQiLCAidmFsdWUiLCAibWFwIiwgInNjaGVtYSIsICJzdHJpbmdpZnkiLCAiaW5kZW50IiwgImNvbW1lbnQiLCAic3RyIiwgIml0IiwgInNjaGVtYSIsICJtYXAiLCAibWFwIiwgInNjaGVtYSIsICJzY2hlbWEiLCAiaXQiLCAic2VxIiwgInNlcSIsICJzY2hlbWEiLCAiaW50SWRlbnRpZnkiLCAic2NoZW1hIiwgInNlcSIsICJzY2hlbWEiLCAicGFpcnMiLCAiaXQiLCAibWFwIiwgInNjaGVtYSIsICJwYWlycyIsICJvbWFwIiwgInNlcSIsICJmbG9hdE5hTiIsICJmbG9hdEV4cCIsICJmbG9hdCIsICJpbnRJZGVudGlmeSIsICJpbnRSZXNvbHZlIiwgIm4iLCAiaW50U3RyaW5naWZ5IiwgImludE9jdCIsICJpbnQiLCAiaW50SGV4IiwgInNjaGVtYSIsICJzZXQiLCAibWFwIiwgInJlcyIsICJzY2hlbWEiLCAiaW50T2N0IiwgImludCIsICJpbnRIZXgiLCAiZmxvYXROYU4iLCAiZmxvYXRFeHAiLCAiZmxvYXQiLCAic2NoZW1hIiwgInRhZ3MiLCAibWVyZ2UiLCAic2NoZW1hIiwgInJlcyIsICJpdCIsICJpbmRlbnQiLCAiY29tcG9zZU5vZGUiLCAiY29tcG9zZUVtcHR5Tm9kZSIsICJtYXAiLCAiY29tcG9zZU5vZGUiLCAiY29tcG9zZUVtcHR5Tm9kZSIsICJzZXEiLCAiY29tcG9zZU5vZGUiLCAiY29tcG9zZUVtcHR5Tm9kZSIsICJpc01hcCIsICJtYXAiLCAiQ04iLCAidmFsdWUiLCAiZW5kIiwgImluZGVudCIsICJzY2hlbWEiLCAidGFnIiwgIml0IiwgIlNDQUxBUiIsICJpc0NvbGxlY3Rpb24iLCAiaXNTY2FsYXIiLCAic3RyaW5naWZ5IiwgInZpc2l0IiwgImluZGVudCIsICJzdHJpbmdpZnkiLCAiQlJFQUsiLCAiU0tJUCIsICJSRU1PVkUiLCAidmlzaXQiLCAiU0NBTEFSIiwgImlzQ29sbGVjdGlvbiIsICJpc1NjYWxhciIsICJpbmRlbnQiLCAiaSIsICJjaCIsICJTQ0FMQVIiLCAiaXQiLCAibWFwIiwgInN0YXJ0IiwgInNlcSIsICJpbmRlbnQiLCAic3RyaW5naWZ5IiwgImluZGVudCIsICJ3cml0ZVNjaGVtYUZpbGUiLCAic2NoZW1hIl0KfQo=
