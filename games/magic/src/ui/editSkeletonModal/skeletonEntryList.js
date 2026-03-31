import './skeletonEntry.js';

export default class SkeletonEntryList extends window.ReactiveComponent {
    connectedCallback() {
        super.connectedCallback();
        this.render();
    }

    render() {
        this.innerHTML = '';
        for (const entry of this.entries) {
            const element = document.createElement('cm-skeleton-entry');
            element.model = entry;
            this.appendChild(element);
        }
    }
}
