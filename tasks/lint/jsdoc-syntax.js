const IMPORT_EXPRESSION = /\bimport\s*\(/;
const IMPORT_TAG = /(?:^|\s)@import\b/;
const TYPE_ANNOTATION = /^\*\s*@type\s+\{.+\}\s*$/;

function documentationTarget(node) {
    if (node.parent?.type === 'ExportNamedDeclaration') return node.parent;
    return node;
}

export default {
    meta: {
        type: 'suggestion',
        schema: [],
        messages: {
            multiline: 'Use multiline JSDoc for function/class documentation '
                + '(AGENTS: JSDoc). Single-line @type annotations are allowed '
                + 'on variables and properties; do not add new documentation.',
            imports: 'Reference a named type instead of a JSDoc import '
                + '(AGENTS 9.1). Expose external types through the existing '
                + 'TypeScript declarations/global aliases.'
        }
    },
    create(context) {
        const annotationComments = new Set();

        function recordAnnotations(node) {
            const target = documentationTarget(node);
            for (const comment of context.sourceCode.getCommentsBefore(target))
                annotationComments.add(comment);
        }

        function checkLayout(comment) {
            if (comment.loc.start.line !== comment.loc.end.line) return;
            if (annotationComments.has(comment)
                && TYPE_ANNOTATION.test(comment.value)) return;
            context.report({ loc: comment.loc, messageId: 'multiline' });
        }

        function checkImports(comment) {
            if (!IMPORT_EXPRESSION.test(comment.value)
                && !IMPORT_TAG.test(comment.value)) return;
            context.report({ loc: comment.loc, messageId: 'imports' });
        }

        return {
            VariableDeclaration: recordAnnotations,
            PropertyDefinition: recordAnnotations,
            ExpressionStatement(node) {
                if (node.expression.type !== 'AssignmentExpression') return;
                if (node.expression.left.type !== 'MemberExpression') return;
                recordAnnotations(node);
            },
            Property(node) {
                if (node.method || node.kind !== 'init') return;
                recordAnnotations(node);
            },
            'Program:exit'() {
                for (const comment of context.sourceCode.getAllComments()) {
                    if (comment.type !== 'Block') continue;
                    if (!comment.value.startsWith('*')) continue;
                    checkLayout(comment);
                    checkImports(comment);
                }
            }
        };
    }
};
