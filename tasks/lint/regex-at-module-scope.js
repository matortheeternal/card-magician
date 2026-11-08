function isModuleVariable(node) {
    const declaration = node.parent;
    if (declaration?.type !== 'VariableDeclarator') return false;
    if (declaration.id.type !== 'Identifier') return false;
    const statement = declaration.parent;
    if (statement?.type !== 'VariableDeclaration') return false;
    if (statement.parent.type === 'Program') return true;
    return statement.parent.type === 'ExportNamedDeclaration';
}

function isStaticString(node) {
    if (node?.type === 'Literal') return typeof node.value === 'string';
    return node?.type === 'TemplateLiteral' && node.expressions.length === 0;
}

function isShortPattern(node) {
    if (node?.type === 'Literal') return node.value.length <= 3;
    if (node?.type !== 'TemplateLiteral') return false;
    return node.quasis[0].value.cooked.length <= 3;
}

export default {
    meta: {
        type: 'suggestion',
        schema: [],
        messages: {
            placement: 'Declare this regular expression in a named file-scope '
                + 'variable (AGENTS: Code structure). Reference that variable '
                + 'here; check lastIndex behavior when moving stateful patterns.'
        }
    },
    create(context) {
        function check(node) {
            if (isModuleVariable(node)) return;
            context.report({ node, messageId: 'placement' });
        }

        function checkConstructor(node) {
            if (node.callee.type !== 'Identifier') return;
            if (node.callee.name !== 'RegExp') return;
            let scope = context.sourceCode.getScope(node);
            while (scope) {
                const variable = scope.set.get('RegExp');
                if (variable?.defs.length) return;
                scope = scope.upper;
            }
            // Runtime patterns cannot generally be moved to file scope.
            if (!node.arguments.every(isStaticString)) return;
            if (isShortPattern(node.arguments[0])) return;
            check(node);
        }

        return {
            Literal(node) {
                if (!node.regex || node.regex.pattern.length <= 3) return;
                check(node);
            },
            NewExpression: checkConstructor,
            CallExpression: checkConstructor
        };
    }
};
