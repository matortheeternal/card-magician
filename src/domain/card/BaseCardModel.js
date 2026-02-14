import RenderScheduler from '../template/renderScheduler.js';
import { initializeFields } from '../../ui/systems/fieldSystem.js';

export default class BaseCardModel {
    fields = [];
    options = [];
    modules = [];

    constructor(key) {
        this.id = key;
    }

    dispose() {
        this.modules.forEach(module => module.dispose());
    }

    async saveField(field) {
        if (Object.hasOwn(field, 'save'))
            return field.save(this[field.id]);
        if (field.type === 'select')
            return this[field.id]?.id;
        return this[field.id];
    }

    async loadField(dataToLoad, field) {
        if (Object.hasOwn(field, 'load'))
            return field.load(dataToLoad);
        if (field.type === 'select' && dataToLoad[field.id]) {
            return field.options.find(option => option.id === dataToLoad[field.id])
                || field.options[0];
        }
        return dataToLoad[field.id];
    }

    async save() {
        const cardData = {};
        for (const field of this.fields.concat(this.options))
            cardData[field.id] = await this.saveField(field);
        return cardData;
    }

    async load(cardData) {
        if (!cardData) return;
        for (const field of this.fields.concat(this.options)) {
            if (!Object.hasOwn(cardData, field.id)) continue;
            this[field.id] = await this.loadField(cardData, field);
        }
    }

    async loadModule(modulePath) {
        try {
            const mainPath = `/modules/${modulePath}/main.js`;
            log('plugin').debug('Loading module', mainPath);
            const { default: Module } = await import(mainPath);
            this.modules.push(new Module(this, modulePath));
        } catch (error) {
            log('plugin').error('Failed to load module:', error);
        }
    }

    loadModules(components) {
        return Promise.all(
            components.map(component => this.loadModule(component))
        );
    }

    setupRenderPipeline() {
        this.modules.forEach(module => {
            module.requestRender = options => {
                RenderScheduler.requestRender(this, module, options);
            };
        });
    }

    loadFields(key = 'fields') {
        for (const module of this.modules) {
            const fields = module[key];
            initializeFields(fields, this);
            this[key].push(...fields);
        }
    }

    hasLoadedModule(module) {
        const modules = this.modules.concat(this.parent?.()?.modules || []);
        return modules.some(m => {
            return m.constructor === module.constructor
                && m !== module;
        });
    }

    loadStyles(parent) {
        return Promise.all(
            this.modules.map(async module => {
                if (!module.styles || parent && parent.hasLoadedModule(module)) return;
                const styles = await module.styles();
                const target = parent?.dom || this.dom;
                styles.forEach(style => target.addCSS(style));
            })
        );
    }

    async initializeModules(parent) {
        await Promise.all(this.modules.map(module => {
            return module.init(this);
        }));
        this.loadFields();
        this.loadFields('options');
        await this.loadStyles(parent);
    }

    bindWatchers() {
        this.modules.forEach(module => {
            const watch = module.watch.bind(module);
            module.bind(this, watch);
        });
    }
}
