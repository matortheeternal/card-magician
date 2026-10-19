export function indent(str, indentStr = '    ') {
    return str.replaceAll(/^/gm, indentStr);
}

export function objectToAttributesString(obj) {
    return Object.entries(obj).map(([key, value]) => {
        return `${key}="${value}"`;
    }).join(' ');
}
