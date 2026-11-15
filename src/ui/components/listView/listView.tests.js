import './listView.js';

describe('ListView selection', () => {
    let list;
    let cards;
    let events;

    beforeEach(() => {
        cards = ['A', 'B', 'C', 'D'].map(name => ({ name }));
        list = document.createElement('cm-list-view');
        list.columns = [{ id: 'name', data: card => card.name }];
        document.body.appendChild(list);
        events = [];
        list.addEventListener('row-selected', event => events.push(event.detail.row));
    });

    afterEach(() => list.remove());

    function selected() {
        return list.selection.map(row => row.original);
    }

    function active() {
        return list.activeRow?.original;
    }

    it('moves selection in both directions and reveals the destination', () => {
        list.rows = cards;
        list.selection = [1];
        const destination = list.tbody.children[2];
        spyOn(destination, 'scrollIntoView');
        events.length = 0;
        list.moveSelection(1);
        expect(selected()).toEqual([cards[2]]);
        expect(events.at(-1).original).toBe(cards[2]);
        expect(destination.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
        list.moveSelection(-1);
        expect(selected()).toEqual([cards[1]]);
    });

    it('does not wrap or emit selection events at either boundary', () => {
        list.rows = cards;
        events.length = 0;
        list.moveSelection(1);
        expect(active()).toBe(cards[3]);
        list.selection = [0];
        list.moveSelection(-1);
        expect(active()).toBe(cards[0]);
        expect(events).toEqual([]);
    });

    it('handles empty lists and starts at the first row without a selection', () => {
        list.moveSelection(1);
        expect(events).toEqual([]);
        list.rows = cards;
        list.selection = [];
        list.moveSelection(-1);
        expect(selected()).toEqual([cards[0]]);
    });

    it('collapses multiselection when navigating from the active row', () => {
        list.rows = cards;
        list.selection = [0, 2];
        list.moveSelection(-1);
        expect(selected()).toEqual([cards[1]]);
    });

    it('navigates only displayed rows in their sorted order', () => {
        list.activeColumns[0].compare = (a, b) => b.data.name.localeCompare(a.data.name);
        list.activeColumns[0].sort = { priority: 1, direction: 'desc' };
        list.rows = [cards[0], cards[2], cards[3]];
        list.moveSelection(1);
        expect(selected()).toEqual([cards[2]]);
        list.moveSelection(1);
        expect(selected()).toEqual([cards[0]]);
    });

    it('selects the last newly added item', () => {
        list.rows = cards.slice(0, 2);
        expect(selected()).toEqual([cards[1]]);
        list.rows = cards;
        expect(selected()).toEqual([cards[3]]);
        expect(events.at(-1).original).toBe(cards[3]);
    });

    it('uses insertion order when new items are displayed in sorted order', () => {
        list.activeColumns[0].compare = (a, b) => b.data.name.localeCompare(a.data.name);
        list.activeColumns[0].sort = { priority: 1, direction: 'desc' };
        list.rows = cards;
        expect(list.activeRows.map(row => row.original)).toEqual([...cards].reverse());
        expect(active()).toBe(cards[3]);
        expect(selected()).toEqual([cards[3]]);
    });

    it('preserves multiselection and its anchor when rows refresh or reorder', () => {
        list.rows = cards;
        list.selection = [0, 2];
        events.length = 0;
        list.rows = [...cards].reverse();
        expect(new Set(selected())).toEqual(new Set([cards[0], cards[2]]));
        expect(active()).toBe(cards[2]);
        expect(events).toEqual([]);
    });

    it('selects the closest preceding survivor after removing the active item', () => {
        list.rows = cards;
        list.selection = [2];
        list.rows = [cards[0], cards[1], cards[3]];
        expect(selected()).toEqual([cards[1]]);
        expect(active()).toBe(cards[1]);
        expect(events.at(-1).original).toBe(cards[1]);
    });

    it('falls forward when no preceding item survives', () => {
        list.rows = cards;
        list.selection = [0];
        list.rows = cards.slice(1);
        expect(selected()).toEqual([cards[1]]);
    });

    it('finds the preceding item using the previous visual sort order', () => {
        list.activeColumns[0].compare = (a, b) => b.data.name.localeCompare(a.data.name);
        list.activeColumns[0].sort = { priority: 1, direction: 'desc' };
        list.rows = cards;
        list.selection = [2];
        list.rows = [cards[0], cards[2], cards[3]];
        expect(selected()).toEqual([cards[2]]);
    });

    it('keeps surviving selected items when a multiselection anchor disappears', () => {
        list.rows = cards;
        list.selection = [0, 1, 3];
        list.rows = cards.slice(0, 3);
        expect(selected()).toEqual([cards[0], cards[1]]);
        expect(active()).toBe(cards[1]);
    });

    it('skips all removed items in a batch deletion', () => {
        list.rows = cards;
        list.rows = [cards[0], cards[2]];
        expect(selected()).toEqual([cards[2]]);
    });

    it('preserves the active item when only unselected items disappear', () => {
        list.rows = cards;
        list.selection = [1];
        events.length = 0;
        list.rows = cards.slice(1);
        expect(selected()).toEqual([cards[1]]);
        expect(events).toEqual([]);
    });

    it('clears selection and notifies consumers when all rows disappear', () => {
        list.rows = cards;
        list.rows = [];
        expect(selected()).toEqual([]);
        expect(active()).toBeUndefined();
        expect(events.at(-1)).toBeNull();
        expect(list.querySelectorAll('tr.selected').length).toBe(0);
    });

    it('applies the same policy when filtering changes the displayed rows', () => {
        list.rows = cards;
        list.rows = cards.slice(0, 2);
        expect(selected()).toEqual([cards[1]]);
        list.rows = cards;
        expect(selected()).toEqual([cards[3]]);
    });

    it('renders the selected row and anchor after an automatic update', () => {
        list.rows = cards;
        list.rows = cards.slice(0, 3);
        const row = list.tbody.querySelector('tr.selected');
        expect(row.textContent).toBe('C');
        expect(row.classList.contains('last-selected')).toBeTrue();
    });
});
