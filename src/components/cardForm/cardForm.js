import Alpine from 'alpinejs';
import html from './cardForm.html';

Alpine.data('cardForm', () => ({
    async init() {
        this.$root.innerHTML = html;
        this.card = Alpine.store('views').activeCard;
        this.$watch('$store.views.activeCard', (newValue) => {
            this.card = newValue;
        });
        let timeout = null;
        const debouncedSave = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(this.save, 300);
        };
        this.$root.addEventListener('input', debouncedSave);
        this.$root.addEventListener('change', debouncedSave);
        Alpine.initTree(this.$root);
    },
    async save() {
        const { activeCard, selectedCard} = Alpine.store('views');
        for (const face of Object.values(activeCard.model))
            selectedCard.model[face.id] = await face.save();
    }
}));
