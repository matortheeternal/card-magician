function getModuleContainers(card, module) {
    const selector = `module-container[module="${module.name}"]`;
    const containers = Array.from(card.dom.querySelectorAll(selector));
    return containers.map(element => ({
        renderKey: element.getAttribute('render') || 'render',
        subcardKey: element.getAttribute('subcard'),
        element
    }));
}

function renderModule(card, module, renderKey, subcardKey) {
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
        const render = module[renderKey].bind(module);
        const content = render(card);
        element.style.display = content === undefined ? 'none' : '';
        element.innerHTML = content || '';
    }
}

export default class RenderScheduler {
    static queue = [];
    static scheduled = false;

    static hasTask(module, options) {
        return this.queue.some(task => {
            return (task.module === module)
                && (!task.options || task.options?.render === options?.render);
        });
    }

    static requestRender(card, module, options) {
        if (!options) this.queue = this.queue.filter(task => task.module !== module);
        if (!options || !this.hasTask(module, options))
            this.queue.push({ card, module, options });
        if (!this.scheduled) {
            this.scheduled = true;
            requestAnimationFrame(() => this.flush());
        }
    }

    static flush() {
        this.scheduled = false;
        const queue = this.queue.slice();

        const prettyRender = queue.map(task =>
            `${task.card.id}:${task.module.name}.${task.options?.render || 'render'}`
        );
        console.debug(`%cRendering %d items:`, 'color:#4f4', queue.length, prettyRender);
        for (const { card, module, options } of queue) {
            const renderKey = options?.render;
            const subcardKey = card.isSubcard ? card.id : null;
            renderModule(card, module, renderKey, subcardKey);
        }
        this.queue = [];
    }
}
