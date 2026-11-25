import { emit } from '../../shared/htmlUtils.js';
import { morphHTML } from './morphHTML.js';

const report = createReporter({
    unit: 'RenderScheduler',
    label: 'Card Part Rendering',
});

function getModuleContainers(card, module) {
    const selector = `module-container[module="${module.containerName}"]`;
    const containers = Array.from(card.renderRoot.querySelectorAll(selector));
    return containers.map(element => ({
        renderKey: element.getAttribute('render') || 'render',
        subcardKey: element.getAttribute('subcard'),
        element
    }));
}

function renderModule(card, module, renderKey, subcardKey) {
    const containers = getModuleContainers(card, module).filter(c => {
        return (renderKey === '*' || renderKey === c.renderKey)
            && (subcardKey === c.subcardKey);
    });
    if (!containers.length) return;
    for (const { renderKey, element } of containers) {
        const render = module[renderKey].bind(module);
        const content = render(card);
        element.style.display = content === undefined ? 'none' : '';
        morphHTML(element, content || '');
    }
}

function renderMatches(task, options) {
    const taskRender = task.options?.render || 'render';
    const optionsRender = options?.render || 'render';
    return taskRender === optionsRender || taskRender === '*';
}

function renderTask({ card, module, options }) {
    const renderKey = options?.render || 'render';
    const subcardKey = card.subcardKey;
    try {
        renderModule(card, module, renderKey, subcardKey);
    } catch (err) {
        const key = [
            subcardKey || 'card',
            module.modulePath,
            renderKey
        ].join(':');
        log('render').error(`Error rendering ${key}, ${err?.stack || err}`);
        report(key, err, [card, module]);
    }
}

export default class RenderScheduler {
    static queue = [];
    static scheduled = false;

    static hasTask(module, options) {
        return this.queue.some(task => {
            return (task.module === module)
                && renderMatches(task, options);
        });
    }

    static requestRender(card, module, options) {
        if (options?.render === '*')
            this.queue = this.queue.filter(task => task.module !== module);
        if (!this.hasTask(module, options))
            this.queue.push({ card, module, options });
        if (!this.scheduled) {
            this.scheduled = true;
            requestAnimationFrame(() => this.flush());
        }
    }

    static flushComplete(queue) {
        const uniqueCards = new Set(queue.map(task => task.card));
        for (const card of uniqueCards) {
            const base = card.isSubcard ? card.parent() : card;
            const root = base.dom.root.getRootNode();
            emit(root, 'RenderScheduler:flushed', { tasks: queue });
        }
    }

    static flush() {
        this.scheduled = false;
        const queue = this.queue.slice();

        const prettyRender = queue.map(task =>
            `${task.card.id}:${task.module.name}.${task.options?.render || 'render'}`
        );
        log('render').debug(`Rendering ${queue.length} items:`, prettyRender);
        for (const task of queue) renderTask(task);
        this.queue = [];
        this.flushComplete(queue);
    }

    static async settle() {
        if (this.queue.length) this.flush();
        const updates = [];
        for (const face of document.querySelectorAll('cm-card-face')) {
            for (const image of face.shadowRoot.querySelectorAll('crop-image'))
                updates.push(image.updateComplete);
        }
        await Promise.all(updates);
    }
}
