import Alpine from 'alpinejs';
import html from './cardForm.html';

Alpine.data('cardForm', () => ({
    async init() {
        this.$root.innerHTML = html;
        this.bindEvents();
        Alpine.initTree(this.$root);
    },

    bindEvents() {
        const debouncedSave = Alpine.debounce(this.save, 300);
        this.$root.addEventListener('input', debouncedSave);
        this.$root.addEventListener('change', debouncedSave);
    },

    async save() {
        const { activeCard, selectedCard } = Alpine.store('views');
        for (const face of Object.values(activeCard.model))
            selectedCard.model[face.id] = await face.save();
    }
}));
