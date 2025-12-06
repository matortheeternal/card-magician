import Alpine from 'alpinejs';
import RenderScheduler from './renderScheduler.js';
import ImageFieldValue from '../card/ImageFieldValue.js';

export async function loadModule(card, modulePath) {
    try {
        const mainPath = `/modules/${modulePath}/main.js`;
        const { default: Module } = await import(mainPath);
        return new Module(card, modulePath);
    } catch (error) {
        console.error('Failed to load module:', error);
    }
}

export function loadModules(card, components) {
    return Promise.all(components.map(component => {
        return loadModule(card, component);
    }));
}

export function setupRenderPipeline(card, modules) {
    modules.forEach(module => {
        module.requestRender = function(options) {
            RenderScheduler.requestRender(card, module, options);
        };
    });
}

function getDefaultValue(field) {
    if (field.hasOwnProperty('default')) return field.default;
    if (field.type === 'checkboxlist') return {};
    if (field.type === 'select') return field.options?.[0]?.id || null;
    if (field.type === 'multiselect') return [];
    if (field.type === 'image') return new ImageFieldValue();
    return '';
}

function loadFields(card, modules) {
    for (const module of modules)
        module.fields.forEach(field => {
            card.fields.push(field);
            card[field.id] = getDefaultValue(field);
        });
}

function loadOptions(card, modules) {
    for (const module of modules)
        module.options.forEach(field => {
            card.options.push(field);
            card[field.id] = getDefaultValue(field);
        });
}

function hasLoadedModule(parent, module) {
    return parent && parent.modules().some(m => {
        return m.constructor === module.constructor;
    });
}

export function loadStyles(card, modules, parent) {
    const target = parent || card;
    return Promise.all(
        modules.map(async module => {
            if (!module.styles || hasLoadedModule(parent, module)) return;
            const styles = await module.styles();
            styles.forEach(style => target.dom.addCSS(style));
        })
    );
}

export async function initializeModules(card, modules, parent) {
    await Promise.all(modules.map(module => {
        return module.init(card);
    }));
    loadFields(card, modules);
    loadOptions(card, modules);
    await loadStyles(card, modules, parent);
}

export function bindEffects(card) {
    card.modules().forEach(module => {
        const watch = (getDependencies, callback) => {
            Alpine.effect(async () => {
                getDependencies();
                await callback();
            });
        };
        module.bind(card, watch);
    });
}
