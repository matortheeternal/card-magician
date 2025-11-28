import Alpine from 'alpinejs';
import RenderScheduler from './renderScheduler.js';

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

function loadFields(card, modules) {
    for (const module of modules)
        module.fields.forEach(field => {
            card.fields.push(field);
            card[field.id] = field.hasOwnProperty('default') ? field.default : '';
        });
}

function loadOptions(card, modules) {
    for (const module of modules)
        module.options.forEach(field => {
            card.options.push(field);
            card[field.id] = field.hasOwnProperty('default') ? field.default : '';
        });
}

function loadStyles(card, modules) {
    return Promise.all(
        modules.map(async module => {
            if (!module.styles) return;
            const styles = await module.styles();
            styles.forEach(style => card.dom.addCSS(style));
        })
    );
}

export async function initializeModules(card, modules) {
    await Promise.all(modules.map(module => {
        return module.init(card);
    }));
    loadFields(card, modules);
    loadOptions(card, modules);
    return loadStyles(card, modules);
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
