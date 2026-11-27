function currentTags(card) {
    const editor = window.activeEditorCard;
    return editor?.baseCard === card ? editor.tags : card.tags;
}

export function projectTagNames(project = window.activeProject) {
    const cards = project?.cards ?? [];
    return new Set(cards.flatMap(card => currentTags(card) ?? []));
}
