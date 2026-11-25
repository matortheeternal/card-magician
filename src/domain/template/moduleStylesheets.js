const textStylesheets = new Map();

function textStylesheet(css) {
    if (textStylesheets.has(css)) return textStylesheets.get(css);
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    textStylesheets.set(css, sheet);
    return sheet;
}

async function loadStylesheetFile(directory, path) {
    try {
        return textStylesheet(await directory.readText(path));
    } catch (error) {
        log('plugin').warn('Failed to load stylesheet:', directory.url(path), error);
    }
}

export async function loadStylesheetFiles(directory, paths = []) {
    const sheets = await Promise.all(paths.map(path => {
        return loadStylesheetFile(directory, path);
    }));
    return sheets.filter(Boolean);
}

export async function loadModuleStylesheets(module) {
    const styles = await module.styles();
    return [...module.constructor.stylesheets, ...styles.map(textStylesheet)];
}
