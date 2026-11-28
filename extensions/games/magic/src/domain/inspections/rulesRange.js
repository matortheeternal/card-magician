export default function rulesRange(range, style = 'highlight') {
    return { field: 'rulesText', ...range, style };
}
