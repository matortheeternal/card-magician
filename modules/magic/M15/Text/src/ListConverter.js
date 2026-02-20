export const listExpr = /^([-*] .+\n)*([-*] .+)/g;
const listItemExpr = /^[-*] (.+)/gm;

function parseList(str) {
    const items = [];
    for (const match of str.matchAll(listItemExpr))
        items.push(match[1]);
    return items;
}

function itemsToHTML(items, convertParagraphs) {
    return items.map(item =>
        (`<li>
            ${convertParagraphs(item)}
        </li>`)
    ).join('\n');
}

export const ListConverter = {
    match(str) {
        return str.match(listExpr);
    },
    convert(match, { convertParagraphs }) {
        const items = parseList(match[0]);
        return (
            `<ul>
                ${itemsToHTML(items, convertParagraphs)}
            </ul>`
        );
    }
};
