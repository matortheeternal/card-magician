import Alpine from 'alpinejs';
import html from './cardForm.html';

Alpine.data('cardForm', () => ({
    hasCard: false,

    async init() {
        this.$root.innerHTML = html;
        this.$watch('$store.views.activeCard', (newValue, oldValue) => {
            if (newValue === oldValue) return;
            this.hasCard = false;
            Alpine.nextTick(() => {
                this.hasCard = true;
                this.card = newValue;
            });
        });
        
        this.bindEvents();
        Alpine.initTree(this.$root);
    },

    bindEvents() {
        let timeout = null;
        const debouncedSave = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(this.save, 300);
        };
        this.$root.addEventListener('input', debouncedSave);
        this.$root.addEventListener('change', debouncedSave);
    },

    async save() {
        const { activeCard, selectedCard} = Alpine.store('views');
        for (const face of Object.values(activeCard.model))
            selectedCard.model[face.id] = await face.save();
    }
}));
