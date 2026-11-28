import { canonicalTag, inheritedTagSources } from 'oracle-of-pie';

export function reconcileCardTags(card, assigned = card.tags ?? []) {
    const previous = new Set(card.inheritedTags);
    const explicit = assigned.filter(tag => !previous.has(tag));
    const excludedInheritedTags = card.excludedInheritedTags ?? [];
    const excluded = new Set(excludedInheritedTags.map(canonicalTag));
    const inheritedTags = [...inheritedTagSources(explicit).keys()]
        .filter(tag => !excluded.has(tag));
    const allowed = new Set([...explicit, ...inheritedTags]);
    const retained = assigned.filter(tag => allowed.has(tag));
    const tags = [...new Set([...retained, ...inheritedTags])];
    return { tags, inheritedTags, excludedInheritedTags };
}

export function editCardTags(card, added, removed) {
    const tags = new Set(card.tags);
    const inherited = new Set(card.inheritedTags);
    const excluded = new Set(card.excludedInheritedTags);
    const sources = inheritedTagSources([...tags], { includeAssigned: true });
    const key = removed && canonicalTag(removed);
    if (removed) tags.delete(removed);
    if (sources.has(key)) excluded.add(key);
    for (const tag of added) {
        tags.add(tag);
        inherited.delete(tag);
        excluded.delete(canonicalTag(tag));
    }
    return reconcileCardTags({
        inheritedTags: [...inherited],
        excludedInheritedTags: [...excluded]
    }, [...tags]);
}
