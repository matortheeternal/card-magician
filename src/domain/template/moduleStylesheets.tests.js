import { loadModuleStylesheets } from './moduleStylesheets.js';
import DOMBuilder from '../card/DomBuilder.js';

function stylesheet(css) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    return sheet;
}

function register(Module, id, metadata = {}, ownStylesheets = []) {
    Module.moduleMetadata = { id, ...metadata };
    Module.ownStylesheets = ownStylesheets;
}

const baseSheet = stylesheet('.base { color: red; }');
const derivedSheet = stylesheet('.derived { color: blue; }');

class BaseModule extends CardMagicianModule {}

class DerivedModule extends BaseModule {
    async styles() {
        return ['.generated { color: green; }'];
    }
}

class InheritingModule extends BaseModule {}

class ReplacingModule extends BaseModule {}

class SpecificModule extends CardMagicianModule {
    async styles() {
        return [':host div > module-container[module="Name"] { color: red; }'];
    }
}

register(BaseModule, 'test/Base', {}, [baseSheet]);
register(DerivedModule, 'test/Derived', {}, [derivedSheet]);
register(InheritingModule, 'test/Inheriting');
register(SpecificModule, 'test/Specific');
register(ReplacingModule, 'test/Replacing', { inheritStylesheets: false }, [
    derivedSheet
]);

function firstStyleRule(rules) {
    const [rule] = rules;
    return rule.selectorText ? rule : firstStyleRule(rule.cssRules);
}

function selectors(sheets) {
    return sheets.map(sheet => firstStyleRule(sheet.cssRules).selectorText);
}

function renderCard(css, sheets) {
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const dom = new DOMBuilder();
    shadowRoot.appendChild(dom.root);
    dom.setHTML('<module-container module="Name"></module-container>');
    dom.addCSS(css);
    dom.addStylesheets(sheets);
    document.body.appendChild(host);
    return host;
}

describe('Module stylesheets', () => {
    it('loads inherited stylesheets, then its own, then its styles', async () => {
        const module = new DerivedModule({}, 'test/Derived');
        const sheets = await loadModuleStylesheets(module);
        expect(selectors(sheets)).toEqual(['.base', '.derived', '.generated']);
    });

    it('inherits stylesheets from an extended module that adds none', async () => {
        const module = new InheritingModule({}, 'test/Inheriting');
        expect(await loadModuleStylesheets(module)).toEqual([baseSheet]);
    });

    it('applies only its own stylesheets when it does not inherit them', async () => {
        const module = new ReplacingModule({}, 'test/Replacing');
        expect(await loadModuleStylesheets(module)).toEqual([derivedSheet]);
    });

    it('shares stylesheets generated from identical CSS', async () => {
        const first = await loadModuleStylesheets(new DerivedModule({}, 'test/Derived'));
        const second = await loadModuleStylesheets(new DerivedModule({}, 'test/Derived'));
        expect(first[2]).toBe(second[2]);
    });

    it('lets template CSS override module CSS of any specificity', async () => {
        const module = new SpecificModule({}, 'test/Specific');
        const sheets = await loadModuleStylesheets(module);
        const host = renderCard('module-container { color: blue; }', sheets);
        const container = host.shadowRoot.querySelector('module-container');
        const { color } = getComputedStyle(container);
        host.remove();
        expect(color).toBe('rgb(0, 0, 255)');
    });

    it('adopts each stylesheet once into the shadow root holding the card', () => {
        const host = document.createElement('div');
        const shadowRoot = host.attachShadow({ mode: 'open' });
        const dom = new DOMBuilder();
        shadowRoot.appendChild(dom.root);
        dom.addStylesheets([baseSheet, derivedSheet]);
        dom.addStylesheets([baseSheet]);
        expect(shadowRoot.adoptedStyleSheets).toEqual([baseSheet, derivedSheet]);
    });
});
