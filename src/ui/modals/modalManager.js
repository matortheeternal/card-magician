const Modals = [];
const modalContainer = document.querySelector('.modal-container');

const activeModals = [];

export function registerModal(modal) {
    customElements.define(modal.id, modal);
    Modals.push(modal);
}

export function resolveModal(modalId) {
    return Modals.find(m => m.id === modalId);
}

function withLastModal(callback) {
    if (activeModals.length === 0) return;
    callback(activeModals[activeModals.length - 1]);
}

export function openModal(modalId, data = {}) {
    const Component = resolveModal(modalId);
    if (!Component) {
        console.error('Skipped rendering unknown modal', modalId);
        return;
    }

    const modalElement = document.createElement(Component.id);
    modalElement.data = data;
    modalContainer.appendChild(modalElement);
    modalContainer.style.removeProperty('display');
    withLastModal(lastModal => {
        lastModal.style.display = 'none';
    })
    activeModals.push(modalElement);
}

export function closeModal() {
    const activeModal = activeModals.pop();
    activeModal.remove();
    if (activeModals.length === 0) {
        modalContainer.style.display = 'none';
    } else {
        withLastModal(lastModal => {
            lastModal.style.removeProperty('display');
            lastModal.render();
        });
    }
}

export function getActiveModal() {
    if (activeModals.length === 0) return null;
    return activeModals[activeModals.length - 1];
}
