import ReactiveComponent from '../ReactiveComponent.js';
import { esc, escapeHTML } from '../../../shared/htmlUtils.js';
import { tagStyle } from '../../../domain/game/tagManager.js';

const L = localize('tag-suggestion-tree');

function cardCount(count) {
    return count === 1 ? L`1 card` : L`${count} cards`;
}

function decisionFor(decisions, card) {
    if (!decisions.has(card)) decisions.set(card, { accepted: [], declined: [] });
    return decisions.get(card);
}

export default class TagSuggestionTree extends ReactiveComponent {
    static tagName = 'cm-tag-suggestion-tree';
    #groups = [];

    get groups() {
        return this.#groups;
    }

    set groups(groups) {
        this.#groups = groups;
        if (this.isConnected) this.render();
    }

    get tagItems() {
        return this.querySelectorAll('sl-tree > sl-tree-item');
    }

    get decisions() {
        const decisions = new Map();
        for (const item of this.tagItems) this.collectDecisions(item, decisions);
        return decisions;
    }

    collectDecisions(tagItem, decisions) {
        const { tag, cards } = this.#groups[Number(tagItem.dataset.group)];
        const cardItems = tagItem.querySelectorAll(':scope > sl-tree-item');
        for (const [index, cardItem] of [...cardItems].entries()) {
            const decision = decisionFor(decisions, cards[index]);
            const list = cardItem.selected ? decision.accepted : decision.declined;
            list.push(tag);
        }
    }

    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.on('sl-selection-change', () => this.emit('cm-suggestion-selection-change'));
    }

    renderCard(card) {
        const name = escapeHTML(card.name || L`Untitled card`);
        return `<sl-tree-item selected>${name}</sl-tree-item>`;
    }

    renderGroup({ tag, cards }, index) {
        return (
            `<sl-tree-item selected data-group="${index}">
                <sl-tag size="small" data-tag-style="${esc(tagStyle(tag))}">
                    ${escapeHTML(tag)}
                </sl-tag>
                <small>${cardCount(cards.length)}</small>
                ${cards.map(card => this.renderCard(card)).join('')}
            </sl-tree-item>`
        );
    }

    render() {
        if (!this.#groups.length) {
            this.innerHTML = `<p>${L`No new tag suggestions for these cards.`}</p>`;
            return;
        }
        const groups = this.#groups.map((group, index) => this.renderGroup(group, index));
        this.innerHTML = `<sl-tree selection="multiple">${groups.join('')}</sl-tree>`;
    }
}

customElements.define(TagSuggestionTree.tagName, TagSuggestionTree);
