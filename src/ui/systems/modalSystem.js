import { closeModal } from "../modals/modalManager.js";

export default class Modal extends HTMLElement {
    static id = "base-modal";
    title = "";
    #data = {};
    clickHandlers = [];

    get onClick() {
        return {close: this.close};
    }

    get data() {
        return this.#data;
    }

    set data(newData) {
        this.#data = newData;
        this.render();
    }

    constructor() {
        super();
    }

    connectedCallback() {
        this.container = document.getElementById("modal-container");
        this.bind();
        this.init();
        this.render();
    }

    bind() {
        this.handleEvents('click', this.onClick);
    }

    close() {
        closeModal();
    }

    handleEvents(eventName, handlers) {
        this.addEventListener(eventName, event => {
            const dataKey = `${eventName}Action`;
            const actionKey = event.target.dataset?.[dataKey];
            const action = handlers[actionKey];
            if (action) action.call(this, event);
        });
    }

    init() {

    }

    renderBody() {
        return "";
    }

    render() {
        this.innerHTML = `
        <div class="modal">
            <div class="modal-title-bar">
                <div>${this.title}</div>
                <div class="close-modal">
                    <sl-icon name="x-lg" data-click-action="close"></sl-icon>
                </div>
            </div>
            <div class="modal-body">
                ${this.renderBody()}
            </div>
        </div>
        `;
    }
}