export const listExpr = activeGame.textStructures.listExpr;

function itemsToHTML(items, convertParagraphs) {
    return items.map(item =>
        (`<li>
            ${convertParagraphs(item)}
        </li>`)
    ).join('\n');
}

export const ListConverter = {
    match(str) {
        return activeGame.textStructures.matchChoices(str);
    },
    convert(match, { convertParagraphs }) {
        const items = activeGame.textStructures.parseList(match[0]);
        return (
            `<ul>
                ${itemsToHTML(items, convertParagraphs)}
            </ul>`
        );
    }
};
