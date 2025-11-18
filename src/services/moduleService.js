import Alpine from 'alpinejs';
import { loadImport } from './fsHelpers.js';
import RenderScheduler from './renderScheduler.js';

export async function loadModule(card, modulePath) {
    try {
        const mainPath = `./modules/${modulePath}/main.js`;
        const Module = await loadImport(mainPath);
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

export async function initializeModules(card, modules) {
    await Promise.all(modules.map(module => {
        return module.init && module.init(card);
    }));
    for (const module of modules)
        (module.fields || []).forEach(field => card.addField(field));
    return Promise.all(modules.map(async module => {
        if (!module.styles) return;
        const styles = await module.styles();
        styles.forEach(style => card.addStyle(style));
    }));
}

export function bindEffects(card, modules) {
    modules.forEach(module => {
        if (!module.bind) return;
        const watch = (getDependencies, callback) => {
            Alpine.effect(async () => {
                getDependencies();
                await callback();
            });
        };
        module.bind(card, watch);
    });
}
