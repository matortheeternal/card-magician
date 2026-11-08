const BRANCH_NODES = [
    'IfStatement', 'ConditionalExpression', 'LogicalExpression',
    'ForStatement', 'ForInStatement', 'ForOfStatement',
    'WhileStatement', 'DoWhileStatement', 'CatchClause', 'AssignmentPattern'
];

function functionName(node) {
    if (node.id?.name) return node.id.name;
    if (node.parent?.key?.name) return node.parent.key.name;
    if (node.parent?.type === 'VariableDeclarator') return node.parent.id.name;
    return 'Anonymous function';
}

function codePathName(path, node) {
    if (path.origin === 'class-field-initializer') return 'Class field initializer';
    if (path.origin === 'class-static-block') return 'Class static block';
    return functionName(node);
}

export default {
    meta: {
        type: 'suggestion',
        schema: [{ type: 'integer', minimum: 0 }],
        messages: {
            complex: '{{name}} has complexity {{count}}; maximum {{max}} '
                + '(AGENTS 2.1, 5.4). Extract focused helpers or separate '
                + 'dispatch responsibilities. Optional access/calls are excluded.'
        }
    },
    create(context) {
        const max = context.options[0] ?? 8;
        const counts = [];

        function branch() {
            counts[counts.length - 1]++;
        }

        return {
            onCodePathStart() { counts.push(1); },
            onCodePathEnd(path, node) {
                const count = counts.pop();
                if (path.origin === 'program' || count <= max) return;
                context.report({
                    node,
                    messageId: 'complex',
                    data: { name: codePathName(path, node), count, max }
                });
            },
            [BRANCH_NODES.join(', ')]: branch,
            'SwitchCase[test]': branch,
            AssignmentExpression(node) {
                if (['&&=', '||=', '??='].includes(node.operator)) branch();
            }
        };
    }
};
