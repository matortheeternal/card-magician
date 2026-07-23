export const SectionConverter = {
    match(str) {
        return str.match(/^[\s\S]+?(?=\n\n|$)/);
    },
    convert(match, { convertParagraphs }) {
        return (
            `<div class="section">${convertParagraphs(match[0])}</div>`
        );
    }
};
