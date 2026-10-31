import RenderScheduler from '../template/renderScheduler.js';
import { initializeFields } from '../../ui/systems/fieldSystem.js';

const report = createReporter({ unit: 'BaseCardModel', label: 'Card' });

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
        return this[field.id];
    }

    async loadField(cardFaceData, field) {
        if (field.override) return field.override;
        if (Object.hasOwn(field, 'load'))
            return field.load(cardFaceData);
        return cardFaceData[field.id];
    }

    async save() {
        const cardData = {};
        for (const field of this.fields.concat(this.options))
            cardData[field.id] = await this.saveField(field);
        return cardData;
    }

    async load(cardFaceData) {
        if (!cardFaceData) return;
        for (const field of this.fields.concat(this.options)) {
            if (!Object.hasOwn(cardFaceData, field.id)) continue;
            this[field.id] = await this.loadField(cardFaceData, field);
        }
    }

    async loadModule(modulePath) {
        try {
            const mainPath = `/extensions/cardparts/${modulePath}/main.js`;
            log('plugin').debug('Loading module', mainPath);
            const { default: Module } = await import(mainPath);
            return new Module(this, modulePath);
        } catch (error) {
            report('loadModule', error, [modulePath]);
            log('plugin').error('Failed to load module:', error);
        }
    }

    async loadModules(components) {
        const modules = await Promise.all(
            components.map(component => this.loadModule(component))
        );
        this.modules.push(...modules.filter(Boolean));
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

    async initializeModules(template, parent) {
        await Promise.all(this.modules.map(module => {
            return module.init(this, template);
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
