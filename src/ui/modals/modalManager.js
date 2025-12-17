const Modals = [];
const modalContainer = document.querySelector("#modal-container");
let activeModal = null;

export function registerModal(modal) {
    customElements.define(modal.id, modal);
    Modals.push(modal);
}

export function resolveModal(modalId) {
    return Modals.find(m => m.id === modalId);
}

export function openModal(modalId, data = {}) {
    const Component = resolveModal(modalId);
    if (!Component) {
        console.error('Skipped rendering unknown modal', modalId);
        return;
    }

    const modalElement = document.createElement(Component.id);
    modalElement.data = data;
    modalContainer.innerHTML = "";
    modalContainer.appendChild(modalElement);
    modalContainer.style.display = "flex";
    activeModal = modalElement;
}

export function closeModal() {
    modalContainer.style.display = "none";
    activeModal = null;
}

export function getActiveModal() {
    return activeModal;
}