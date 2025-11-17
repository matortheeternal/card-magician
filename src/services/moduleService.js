import Alpine from 'alpinejs';
import { loadImport } from './fsHelpers.js';

export async function loadModule(card, modulePath) {
    try {
        const mainPath = `./modules/${modulePath}/main.js`;
        const Module = await loadImport(mainPath);
        console.log('Loading module', mainPath);
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

function getModuleContainers(card, module) {
    const selector = `module-container[module="${module.name}"]`;
    const containers = Array.from(card.dom.querySelectorAll(selector));
    return containers.map(element => ({
        renderKey: element.getAttribute('render') || 'render',
        subcardKey: element.getAttribute('subcard'),
        element
    }));
}

async function renderModule(card, module, renderKey, subcardKey) {
    const containers = getModuleContainers(card, module).filter(c => {
        return (!renderKey || renderKey === c.renderKey)
            && (subcardKey === c.subcardKey);
    });
    if (!containers.length) {
        console.log(
            `%cSkipped rendering %s, container not found`,
            'color:red', module.name
        );
        return;
    }
    for (const { renderKey, element } of containers) {
        console.log(`%cRendering %s(%s)`, 'color:red', module.name, renderKey);
        const render = module[renderKey].bind(module);
        const content = render(card);
        element.style.display = content === undefined ? 'none' : '';
        element.innerHTML = content || '';
    }
}

export function setupRenderPipeline(card, modules) {
    modules.forEach(module => {
        module.requestRender = function(options) {
            const renderKey = options?.render;
            const subcardKey = card.isSubcard ? card.id : null;
            renderModule(card, module, renderKey, subcardKey);
        }
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
