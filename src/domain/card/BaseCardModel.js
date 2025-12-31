import RenderScheduler from '../template/renderScheduler.js';
import ImageFieldValue from './ImageFieldValue.js';
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
            return await field.save(this[field.id]);
        if (field.type === 'image')
            return await this[field.id].save();
        return this[field.id];
    }

    async loadField(dataToLoad, field) {
        if (Object.hasOwn(field, 'load'))
            return await field.load(dataToLoad);
        if (field.type === 'image')
            return await ImageFieldValue.load(dataToLoad[field.id]);
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
            const { default: Module } = await import(mainPath);
            return new Module(this, modulePath);
        } catch (error) {
            console.error('Failed to load module:', error);
        }
    }

    loadModules(components) {
        return Promise.all(
            components.map(component => this.loadModule(component))
        );
    }

    setupRenderPipeline() {
        this.modules.forEach(module => {
            module.requestRender = function(options) {
                RenderScheduler.requestRender(card, module, options);
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
        const modules = this.modules.concat(this.parent?.modules || []);
        return modules.some(m => m.constructor === module.constructor);
    }

    loadStyles() {
        return Promise.all(
            this.modules.map(async module => {
                if (!module.styles || this.hasLoadedModule(module)) return;
                const styles = await module.styles();
                styles.forEach(style => this.dom.addCSS(style));
            })
        );
    }

    async initializeModules() {
        await Promise.all(this.modules.map(module => {
            return module.init(this);
        }));
        this.loadFields();
        this.loadFields('options');
        this.loadStyles();
    }

    bindWatchers() {
        this.modules.forEach(module => {
            const watch = module.watch.bind(module);
            module.bind(this, watch);
        });
    }
}
