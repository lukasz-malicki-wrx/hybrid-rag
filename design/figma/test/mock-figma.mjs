/**
 * A strict stand-in for the Figma plugin API, enough to run dist/code.js in Node. It throws where
 * Figma throws on the mistakes that are easy to make (FILL outside auto layout, text without a
 * loaded font, editing the structure of an instance, unknown variant ...), so a green run means
 * the plugin is very likely to run in Figma too. It is not a renderer: sizes of text are guessed.
 */
let nextId = 1;
const id = () => `${nextId++}:1`;

const AUTO_ONLY = ["itemSpacing", "counterAxisSpacing", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"];
const BINDABLE = new Set([...AUTO_ONLY, "width", "height", "minWidth", "maxWidth", "minHeight", "maxHeight", "topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius", "visible", "opacity", "strokeWeight"]);

export function createFigma(log = []) {
  const loadedFonts = new Set();
  const variables = new Map();
  const collections = [];
  const textStyles = [];
  const effectStyles = [];
  const images = new Map();
  const errors = [];

  function fail(msg) {
    const e = new Error(msg);
    errors.push(msg);
    throw e;
  }

  function insideInstance(node) {
    for (let p = node.parent; p; p = p.parent) if (p.type === "INSTANCE") return true;
    return false;
  }

  class Node {
    constructor(type) {
      this.id = id();
      this.type = type;
      this.name = type;
      this.parent = null;
      this.removed = false;
      this.visible = true;
      this.x = 0;
      this.y = 0;
      this.width = 100;
      this.height = 100;
      this.boundVariables = {};
      this._cpr = {};
      this.opacity = 1;
    }
    get componentPropertyReferences() {
      return this._cpr;
    }
    set componentPropertyReferences(v) {
      let inComponent = false;
      for (let p = this.parent; p; p = p.parent) if (p.type === "COMPONENT") inComponent = true;
      if (!inComponent) fail(`${this.name}: componentPropertyReferences outside a component`);
      this._cpr = v;
    }
    resize(w, h) {
      if (!(w >= 0.01) || !(h >= 0.01)) fail(`${this.name}: resize(${w}, ${h}) needs sizes >= 0.01`);
      this.width = w;
      this.height = h;
    }
    remove() {
      if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);
      this.parent = null;
      this.removed = true;
    }
    setBoundVariable(field, variable) {
      if (!BINDABLE.has(field)) fail(`${this.name}: cannot bind variable to "${field}"`);
      if (AUTO_ONLY.includes(field) && (!this.layoutMode || this.layoutMode === "NONE")) fail(`${this.name}: ${field} needs auto layout`);
      if (!variable || !variables.has(variable.id)) fail(`${this.name}: bind of unknown variable to ${field}`);
      this.boundVariables[field] = { type: "VARIABLE_ALIAS", id: variable.id };
    }
    clone() {
      const c = cloneNode(this, false);
      if (this.parent) this.parent.appendChild(c);
      return c;
    }
    findAll(pred) {
      const out = [];
      const visit = (n) => {
        for (const c of n.children || []) {
          if (pred(c)) out.push(c);
          visit(c);
        }
      };
      visit(this);
      return out;
    }
    findOne(pred) {
      return this.findAll(pred)[0] || null;
    }
    setExplicitVariableModeForCollection() {}
    async setEffectStyleIdAsync(sid) {
      if (!effectStyles.find((s) => s.id === sid)) fail(`${this.name}: unknown effect style`);
      this.effectStyleId = sid;
    }
  }

  class Parent extends Node {
    constructor(type) {
      super(type);
      this.children = [];
    }
    appendChild(child) {
      if (this.type === "INSTANCE" || insideInstance(this)) fail(`Cannot add "${child.name}" into instance "${this.name}"`);
      if (child === this) fail("appendChild(self)");
      if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
      this.children.push(child);
      child.parent = this;
    }
    insertChild(i, child) {
      this.appendChild(child);
      this.children.splice(this.children.indexOf(child), 1);
      this.children.splice(i, 0, child);
    }
  }

  class Frame extends Parent {
    constructor(type = "FRAME") {
      super(type);
      this._layoutMode = "NONE";
      this.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      this.strokes = [];
      this.effects = [];
      this.clipsContent = true;
      this.cornerRadius = 0;
      this._primaryAxisAlignItems = "MIN";
      this._counterAxisAlignItems = "MIN";
      this._sizingH = "FIXED";
      this._sizingV = "FIXED";
      for (const f of AUTO_ONLY) this[`_${f}`] = 0;
    }
    get layoutMode() {
      return this._layoutMode;
    }
    set layoutMode(v) {
      if (!["NONE", "HORIZONTAL", "VERTICAL", "GRID"].includes(v)) fail(`bad layoutMode ${v}`);
      this._layoutMode = v;
    }
    get layoutSizingHorizontal() {
      return this._sizingH;
    }
    set layoutSizingHorizontal(v) {
      this._sizing("H", v);
    }
    get layoutSizingVertical() {
      return this._sizingV;
    }
    set layoutSizingVertical(v) {
      this._sizing("V", v);
    }
    _sizing(axis, v) {
      const parentAuto = this.parent && this.parent.layoutMode && this.parent.layoutMode !== "NONE";
      if (v === "FILL" && !parentAuto) fail(`${this.name}: FILL needs an auto layout parent`);
      if (v === "HUG" && this.layoutMode === "NONE" && this.type !== "TEXT") fail(`${this.name}: HUG needs auto layout on the node itself`);
      this[`_sizing${axis}`] = v;
    }
  }
  for (const f of AUTO_ONLY) {
    Object.defineProperty(Frame.prototype, f, {
      get() {
        return this[`_${f}`];
      },
      set(v) {
        if (this.layoutMode === "NONE") fail(`${this.name}: ${f} needs auto layout`);
        this[`_${f}`] = v;
      },
    });
  }
  const ENUMS = {
    primaryAxisAlignItems: ["MIN", "MAX", "CENTER", "SPACE_BETWEEN"],
    counterAxisAlignItems: ["MIN", "MAX", "CENTER", "BASELINE"],
    primaryAxisSizingMode: ["FIXED", "AUTO"],
    counterAxisSizingMode: ["FIXED", "AUTO"],
    layoutWrap: ["NO_WRAP", "WRAP"],
  };
  for (const [f, allowed] of Object.entries(ENUMS)) {
    const prev = Object.getOwnPropertyDescriptor(Frame.prototype, f);
    if (prev) continue;
    Object.defineProperty(Frame.prototype, f, {
      get() {
        return this[`_${f}`];
      },
      set(v) {
        if (!allowed.includes(v)) fail(`${this.name}: ${f} = ${v} (expected ${allowed.join("|")})`);
        if (f !== "primaryAxisAlignItems" && f !== "counterAxisAlignItems" && this.layoutMode === "NONE") fail(`${this.name}: ${f} needs auto layout`);
        if (f === "layoutWrap" && v === "WRAP" && this.layoutMode !== "HORIZONTAL") fail(`${this.name}: wrap needs a horizontal layout`);
        this[`_${f}`] = v;
      },
    });
  }
  for (const f of []) {
    Object.defineProperty(Frame.prototype, f, {
      get() {
        return this[`_${f}`];
      },
      set(v) {
        if (this.layoutMode === "NONE") fail(`${this.name}: ${f} needs auto layout`);
        if (f === "layoutWrap" && v === "WRAP" && this.layoutMode !== "HORIZONTAL") fail(`${this.name}: wrap needs a horizontal layout`);
        this[`_${f}`] = v;
      },
    });
  }

  class Component extends Frame {
    constructor() {
      super("COMPONENT");
      this.description = "";
      this.key = `key-${this.id}`;
      this.props = {};
    }
    get variantProperties() {
      if (!this.parent || this.parent.type !== "COMPONENT_SET") return null;
      return Object.fromEntries(this.name.split(", ").map((p) => p.split("=")));
    }
    addComponentProperty(name, type, def, options) {
      if (options !== undefined && (typeof options !== "object" || Array.isArray(options))) fail(`${this.name}: addComponentProperty options must be an object`);
      if (type === "INSTANCE_SWAP" && typeof def !== "string") fail(`${this.name}: swap default must be a component id`);
      const preferred = options && options.preferredValues;
      for (const k of Object.keys(this.props)) if (k.split("#")[0] === name) fail(`${this.name}: a property named "${name}" exists already`);
      if (this.parent && this.parent.type === "COMPONENT_SET") fail(`${this.name}: add properties on the set, not a variant`);
      const key = `${name}#${nextId++}:0`;
      this.props[key] = { type, defaultValue: def, preferredValues: preferred };
      return key;
    }
    get componentPropertyDefinitions() {
      return this.props;
    }
    editComponentProperty(key, values) {
      return editProp(this, key, values);
    }
    createInstance() {
      const inst = cloneNode(this, true);
      inst.mainComponent = this;
      return inst;
    }
  }

  class ComponentSet extends Frame {
    constructor() {
      super("COMPONENT_SET");
      this.props = {};
      this.description = "";
    }
    addComponentProperty(name, type, def, options) {
      if (options !== undefined && (typeof options !== "object" || Array.isArray(options))) fail(`${this.name}: addComponentProperty options must be an object`);
      if (type === "INSTANCE_SWAP" && typeof def !== "string") fail(`${this.name}: swap default must be a component id`);
      const preferred = options && options.preferredValues;
      for (const k of Object.keys(this.props)) if (k.split("#")[0] === name) fail(`${this.name}: a property named "${name}" exists already`);
      const key = `${name}#${nextId++}:0`;
      this.props[key] = { type, defaultValue: def, preferredValues: preferred };
      return key;
    }
    editComponentProperty(key, values) {
      return editProp(this, key, values);
    }
    get componentPropertyDefinitions() {
      const out = { ...this.props };
      for (const c of this.children) for (const [k, v] of Object.entries(c.variantProperties || {})) {
        out[k] = out[k] || { type: "VARIANT", variantOptions: [] };
        if (!out[k].variantOptions.includes(v)) out[k].variantOptions.push(v);
      }
      return out;
    }
  }

  function editProp(node, key, values) {
    if (!node.props[key]) fail(`${node.name}: editComponentProperty unknown ${key}`);
    if (values.name) {
      for (const k of Object.keys(node.props)) if (k !== key && k.split("#")[0] === values.name) fail(`${node.name}: a property named "${values.name}" exists already`);
      const newKey = `${values.name}#${key.split("#")[1]}`;
      node.props[newKey] = node.props[key];
      delete node.props[key];
      const visit = (n) => {
        for (const [f, ref] of Object.entries(n._cpr || {})) if (ref === key) n._cpr[f] = newKey;
        for (const c of n.children || []) visit(c);
      };
      visit(node);
      return newKey;
    }
    return key;
  }

  class Instance extends Frame {
    constructor() {
      super("INSTANCE");
    }
    get componentProperties() {
      const main = this.mainComponent;
      const holder = main.parent && main.parent.type === "COMPONENT_SET" ? main.parent : main;
      const out = {};
      for (const [k, v] of Object.entries(holder.props || {})) out[k] = { type: v.type, value: (this._values || {})[k] ?? v.defaultValue };
      return out;
    }
    setProperties(values) {
      const known = this.componentProperties;
      for (const [k, v] of Object.entries(values)) {
        if (!known[k]) fail(`${this.name}: setProperties unknown "${k}"`);
        const t = known[k].type;
        if (t === "TEXT" && typeof v !== "string") fail(`${this.name}: text property ${k} needs a string`);
        if (t === "BOOLEAN" && typeof v !== "boolean") fail(`${this.name}: boolean property ${k} needs a boolean`);
        this._values = { ...(this._values || {}), [k]: v };
      }
    }
    appendChild(c) {
      fail(`Cannot add "${c.name}" into instance "${this.name}"`);
    }
    detachInstance() {
      fail("detachInstance is not allowed in this design file");
    }
  }

  class Text extends Node {
    constructor() {
      super("TEXT");
      this._chars = "";
      this.fills = [];
      this.fontName = { family: "Inter", style: "Regular" };
      this.fontSize = 12;
      this.textAutoResize = "WIDTH_AND_HEIGHT";
      this.textStyleId = "";
      this._sizingH = "HUG";
      this._sizingV = "HUG";
    }
    get characters() {
      return this._chars;
    }
    set characters(v) {
      if (!loadedFonts.has(`${this.fontName.family}/${this.fontName.style}`)) fail(`Font ${this.fontName.family} ${this.fontName.style} not loaded`);
      if (typeof v !== "string") fail("characters must be a string");
      this._chars = v;
      this.width = Math.max(1, v.length * this.fontSize * 0.55);
      this.height = this.fontSize * 1.4;
    }
    async setTextStyleIdAsync(sid) {
      const s = textStyles.find((t) => t.id === sid);
      if (!s) fail("unknown text style");
      this.textStyleId = sid;
      this.fontName = s.fontName;
      this.fontSize = s.fontSize;
    }
    get layoutSizingHorizontal() {
      return this._sizingH;
    }
    set layoutSizingHorizontal(v) {
      if (v === "FILL" && !(this.parent && this.parent.layoutMode && this.parent.layoutMode !== "NONE")) fail(`text "${this.name}": FILL needs an auto layout parent`);
      this._sizingH = v;
    }
    get layoutSizingVertical() {
      return this._sizingV;
    }
    set layoutSizingVertical(v) {
      this._sizingV = v;
    }
  }

  class Rect extends Node {
    constructor(type = "RECTANGLE") {
      super(type);
      this.fills = [];
      this.strokes = [];
    }
    get layoutSizingHorizontal() {
      return this._h || "FIXED";
    }
    set layoutSizingHorizontal(v) {
      if (v === "HUG") fail(`${this.name}: a ${this.type} cannot hug`);
      if (v === "FILL" && !(this.parent && this.parent.layoutMode !== "NONE")) fail(`${this.name}: FILL needs an auto layout parent`);
      this._h = v;
    }
    get layoutSizingVertical() {
      return this._v || "FIXED";
    }
    set layoutSizingVertical(v) {
      if (v === "HUG") fail(`${this.name}: a ${this.type} cannot hug`);
      if (v === "FILL" && !(this.parent && this.parent.layoutMode !== "NONE")) fail(`${this.name}: FILL needs an auto layout parent`);
      this._v = v;
    }
  }

  function cloneNode(src, asInstance) {
    let c;
    if (asInstance && src.type === "COMPONENT") c = new Instance();
    else if (src.type === "COMPONENT" && !asInstance) c = new Frame();
    else c = Object.create(Object.getPrototypeOf(src));
    for (const [k, v] of Object.entries(src)) {
      if (["parent", "children", "id"].includes(k)) continue;
      c[k] = Array.isArray(v) ? v.map((x) => (typeof x === "object" ? { ...x } : x)) : typeof v === "object" && v !== null && k !== "mainComponent" ? { ...v } : v;
    }
    c.id = id();
    c.parent = null;
    if (asInstance) {
      c.mainComponent = src;
      c.type = "INSTANCE";
    } else if (src.type === "COMPONENT") c.type = "FRAME";
    if (src.children) {
      c.children = [];
      for (const ch of src.children) {
        const cc = cloneNode(ch, false);
        if (ch.type === "INSTANCE") cc.mainComponent = ch.mainComponent;
        c.children.push(cc);
        cc.parent = c;
      }
    }
    return c;
  }

  class Page extends Parent {
    constructor() {
      super("PAGE");
    }
  }

  const root = { type: "DOCUMENT", children: [] };
  const firstPage = new Page();
  firstPage.name = "Page 1";
  root.children.push(firstPage);
  firstPage.parent = root;

  const mixed = Symbol("mixed");
  let closed = null;
  const done = new Promise((resolve) => (closed = resolve));

  const figma = {
    mixed,
    root,
    currentPage: firstPage,
    _done: done,
    _errors: errors,
    async setCurrentPageAsync(p) {
      figma.currentPage = p;
    },
    createPage() {
      if (root.children.length >= 3) fail("Starter plan: at most 3 pages");
      const p = new Page();
      root.children.push(p);
      p.parent = root;
      return p;
    },
    createFrame() {
      const f = new Frame();
      figma.currentPage.appendChild(f);
      return f;
    },
    createComponent() {
      const c = new Component();
      figma.currentPage.appendChild(c);
      return c;
    },
    createText() {
      const t = new Text();
      figma.currentPage.appendChild(t);
      return t;
    },
    createRectangle() {
      const r = new Rect();
      figma.currentPage.appendChild(r);
      return r;
    },
    createEllipse() {
      const r = new Rect("ELLIPSE");
      figma.currentPage.appendChild(r);
      return r;
    },
    createLine() {
      const r = new Rect("LINE");
      figma.currentPage.appendChild(r);
      return r;
    },
    createNodeFromSvg(svg) {
      if (!svg.startsWith("<svg")) fail("createNodeFromSvg: not an svg");
      const f = new Frame();
      f.fills = [];
      const v = new Rect("VECTOR");
      v.strokes = svg.includes('stroke="') ? [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }] : [];
      v.fills = svg.includes('fill="#000000"') ? [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }] : [];
      f.appendChild(v);
      figma.currentPage.appendChild(f);
      return f;
    },
    combineAsVariants(nodes, parent) {
      if (!nodes.length) fail("combineAsVariants: no nodes");
      const names = new Set();
      for (const n of nodes) {
        if (n.type !== "COMPONENT") fail("combineAsVariants: not a component");
        if (names.has(n.name)) fail(`combineAsVariants: duplicate variant "${n.name}"`);
        names.add(n.name);
      }
      const set = new ComponentSet();
      for (const n of nodes) set.appendChild(n);
      parent.appendChild(set);
      return set;
    },
    createImage(bytes) {
      if (!(bytes instanceof Uint8Array)) fail("createImage needs bytes");
      const hash = `img${images.size}`;
      images.set(hash, bytes.length);
      return { hash };
    },
    base64Decode(s) {
      return new Uint8Array(Buffer.from(s, "base64"));
    },
    async loadFontAsync(f) {
      if (f.family !== "Inter" || !["Regular", "Medium", "Semi Bold", "Bold"].includes(f.style)) fail(`Font not available: ${f.family} ${f.style}`);
      loadedFonts.add(`${f.family}/${f.style}`);
    },
    notify(m) {
      log.push(`notify: ${m}`);
    },
    closePlugin(m) {
      closed(m);
    },
    viewport: { scrollAndZoomIntoView() {} },
    createTextStyle() {
      const s = { id: `S:${id()}`, name: "", remove() { textStyles.splice(textStyles.indexOf(s), 1); } };
      textStyles.push(s);
      return s;
    },
    createEffectStyle() {
      const s = { id: `E:${id()}`, name: "", remove() { effectStyles.splice(effectStyles.indexOf(s), 1); } };
      effectStyles.push(s);
      return s;
    },
    async getLocalTextStylesAsync() {
      return [...textStyles];
    },
    async getLocalEffectStylesAsync() {
      return [...effectStyles];
    },
    variables: {
      createVariableCollection(name) {
        const c = {
          id: `VC:${id()}`,
          name,
          modes: [{ modeId: `m${nextId++}`, name: "Mode 1" }],
          renameMode(mid, n) {
            c.modes.find((m) => m.modeId === mid).name = n;
          },
          addMode(n) {
            if (figma._starter) fail("Starter plan: one mode per collection");
            const m = { modeId: `m${nextId++}`, name: n };
            c.modes.push(m);
            return m.modeId;
          },
          remove() {
            collections.splice(collections.indexOf(c), 1);
          },
        };
        collections.push(c);
        return c;
      },
      createVariable(name, collection, type) {
        if (/[.{}]/.test(name)) fail(`Variable name "${name}" has a forbidden character`);
        const v = { id: `V:${id()}`, name, type, collection, values: {}, setValueForMode(m, val) { v.values[m] = val; } };
        variables.set(v.id, v);
        return v;
      },
      async getLocalVariableCollectionsAsync() {
        return [...collections];
      },
      setBoundVariableForPaint(p, field, v) {
        if (!v || !variables.has(v.id)) fail("setBoundVariableForPaint: unknown variable");
        if (v.type !== "COLOR") fail(`setBoundVariableForPaint: ${v.name} is not a colour`);
        return { ...p, boundVariables: { color: { type: "VARIABLE_ALIAS", id: v.id } } };
      },
    },
  };
  return figma;
}
