export class ImportParserRule {
    /**
     * @abstract
     * @param {string} str
     * @returns {RegExpMatchArray|undefined}
     */
    static match(str) {}

    /**
     *
     * @param {RegExpMatchArray} matchData
     * @returns {string}
     */
    static process(matchData) {
        return matchData[0];
    }
}

export class WhitespaceRule extends ImportParserRule {
    static match(str) {
        return str.match(/^\s+/);
    }
}

export class LineCommentRule extends ImportParserRule {
    static match(str) {
        return str.match(/^\/\/[^\n]*/);
    }
}

export class BlockCommentRule extends ImportParserRule {
    static match(str) {
        return str.match(/^\/\*[\s\S]*?\*\//);
    }
}

export class SideEffectImportRule extends ImportParserRule {
    static match(str) {
        return str.match(/^\s*import\s+['"]([^'"]+)['"]\s*;?/);
    }

    static process(matchData, filePath) {
        const path = matchData[1];
        return `await __MODULE_IMPORT__('${path}', '${filePath}');`
    }
}

function resolveImportPath(localPath, parentPath) {
    return [
        ...parentPath.split('/').slice(0, -1),
        ...localPath.split('/')
    ].reduce((parts, part) => {
        if (part === '.') return parts;
        if (part === '..') return parts.slice(0, -1);
        parts.push(part);
        return parts;
    }, []).join('/');
}

export class ImportNamedRule extends ImportParserRule {
    static match(str) {
        const m = str.match(/^\s*import\s+([\s\S]*?)\s*from\s+['"]([^'"]+)['"]\s*;?/);
        if (!m) return;

        const bindings = m[1].trim();
        if (!bindings.startsWith('{')) return;

        return [ m[0], bindings, m[2] ];
    }

    static process([ raw, namedBlock, localPath ], currentFilePath) {
        const filePath = resolveImportPath(localPath, currentFilePath);
        return `const ${namedBlock} = await __MODULE_IMPORT__('${filePath}');`;
    }
}

export class ImportDefaultRule extends ImportParserRule {
    static match(str) {
        const m = str.match(/^\s*import\s+([\s\S]*?)\s*from\s+['"]([^'"]+)['"]\s*;?/);
        if (!m) return;

        const bindings = m[1].trim();
        if (bindings.startsWith('{')) return;
        if (bindings.includes(',')) return;

        return [ m[0], bindings, m[2] ];
    }

    static process([ raw, defaultName, localPath ], currentFilePath) {
        const filePath = resolveImportPath(localPath, currentFilePath);
        return `const ${defaultName} = ` +
            `await __MODULE_DEFAULT_IMPORT__('${filePath}');`
    }
}

const importParserRules = [
    WhitespaceRule,
    LineCommentRule,
    BlockCommentRule,
    ImportNamedRule,
    ImportDefaultRule,
    SideEffectImportRule
];

function parseNext(str) {
    for (const rule of importParserRules) {
        const match = rule.match(str);
        if (match) return [match, rule];
    }
    return [null, null];
}

export function patchImports(source, filePath) {
    let out = '';
    let current = source;
    while (current.length) {
        const [match, Rule] = parseNext(current);
        if (!match) break;
        out += Rule.process(match, filePath);
        current = current.slice(match[0].length);
    }
    return out + current;
}
