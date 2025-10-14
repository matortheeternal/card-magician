import Alpine from 'alpinejs';

Alpine.directive('sl-fix', el => {
    el.addEventListener('sl-change', () => {
        const event = new Event('input', { bubbles: true });
        el.dispatchEvent(event);
    });
});
