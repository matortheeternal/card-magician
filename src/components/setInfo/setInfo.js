import Alpine from 'alpinejs';
import html from './setInfo.html';

Alpine.data('setInfo', () => ({
    async init() {
        this.$root.innerHTML = html;
        this.set = Alpine.store('views').activeSet;
        Alpine.initTree(this.$root);
    },
    closeModal() {
        Alpine.store('views').showSetInfo = false;
    }
}));
