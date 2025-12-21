import Alpine from 'alpinejs';
import RenderScheduler from './renderScheduler.js';
import { initializeFields } from '../../ui/systems/fieldSystem.js';

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

function loadFields(card, modules, key = 'fields') {
    for (const module of modules) {
        const fields = module[key];
        initializeFields(fields, card);
        card[key].push(...fields);
    }
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
    loadFields(card, modules, 'options');
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
