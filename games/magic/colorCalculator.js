const colorNames = {
    w: 'white',
    u: 'blue',
    b: 'black',
    r: 'red',
    g: 'green'
};

function isMulticolor(colors) {
    return colors.filter(name => name !== 'artifact').length > 1;
}

export function calculateColors(row) {
    const colorsFound = {};
    for (const face of Object.values(row)) {
        if (!face.cost) continue;
        const costChars = face.cost.split('');
        'wubrg'.split('')
            .filter(c => costChars.includes(c))
            .forEach(c => colorsFound[colorNames[c]] = 1);
        if (face.superType?.match(/artifact/i))
            colorsFound.artifact = 1;
    }
    let colors = Object.keys(colorsFound);
    if (isMulticolor(colors))
        colors.push('multicolor');
    if (colors.length === 0)
        return 'colorless';
    return colors.join(', ');
}
