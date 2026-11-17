async function readItem(item) {
    const blobs = new Map(await Promise.all(item.types.map(async type => {
        return [type, await item.getType(type)];
    })));
    return { types: item.types, getType: async type => blobs.get(type) };
}

export function useFakeClipboard() {
    const clipboard = { items: [] };

    beforeEach(() => {
        clipboard.items = [];
        spyOn(navigator.clipboard, 'write').and.callFake(async items => {
            clipboard.items = await Promise.all(items.map(readItem));
        });
        spyOn(navigator.clipboard, 'read').and.callFake(async () => clipboard.items);
    });

    return clipboard;
}
