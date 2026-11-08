const SECTION_TEXT_PATTERN = /^[\s\S]+?(?=\n\n|$)/;
export const SectionConverter = {
    match(str) {
        return str.match(SECTION_TEXT_PATTERN);
    },
    convert(match, { convertParagraphs }) {
        return (
            `<div class="section">${convertParagraphs(match[0])}</div>`
        );
    }
};
