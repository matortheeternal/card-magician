import { shoelaceIcons } from '../dev/shoelaceIcons.js';

const copiedIcons = new Set(shoelaceIcons);
const iconMarkupPattern = /<sl-icon(?:-button)?\b[^>]*?\bname="([^"]*)"/g;
const iconReceiverPattern = /icon/i;
const iconAttributeReceiverPattern = /icon|button/i;
const expressionPlaceholder = '${}';

function findVariable(scope, name) {
    for (let current = scope; current; current = current.upper) {
        const variable = current.set.get(name);
        if (variable) return variable;
    }
    return null;
}

function constantInitializer(variable) {
    const definition = variable?.defs.length === 1 ? variable.defs[0] : null;
    if (definition?.type !== 'Variable') return null;
    if (definition.parent.kind !== 'const') return null;
    return definition.node.init;
}

const valueResolvers = {
    Literal: node => typeof node.value === 'string' ? [node.value] : [],
    TemplateLiteral: node => node.expressions.length === 0
        ? [node.quasis[0].value.cooked]
        : [],
    ConditionalExpression: (node, resolve) => [
        ...resolve(node.consequent),
        ...resolve(node.alternate)
    ],
    Identifier: (node, resolve, scope) => {
        const init = constantInitializer(findVariable(scope, node.name));
        return init ? resolve(init) : [];
    }
};

function receiverName(node) {
    if (node.type === 'Identifier') return node.name;
    if (node.type !== 'MemberExpression' || node.computed) return '';
    return node.property.name;
}

function isPropertyNamed(node, name) {
    return node.type === 'MemberExpression'
        && !node.computed
        && node.property.name === name;
}

function isIconElementCreation(node) {
    return node?.type === 'CallExpression'
        && isPropertyNamed(node.callee, 'createElement')
        && node.arguments[0]?.type === 'Literal'
        && String(node.arguments[0].value).startsWith('sl-icon');
}

function isObjectAssignToIcon(node) {
    const call = node.parent;
    return call.type === 'CallExpression'
        && call.arguments[1] === node
        && isPropertyNamed(call.callee, 'assign')
        && isIconElementCreation(call.arguments[0]);
}

function markupIconNames(text) {
    const names = [];
    for (const match of text.matchAll(iconMarkupPattern)) {
        if (match[1].includes(expressionPlaceholder)) continue;
        names.push(match[1]);
    }
    return names;
}

function templateText(node) {
    return node.quasis.map(quasi => quasi.value.cooked).join(expressionPlaceholder);
}

export default {
    meta: {
        type: 'problem',
        schema: [],
        messages: {
            missing: 'Shoelace icon "{{name}}" is not copied by the build. '
                + 'Add it to tasks/dev/shoelaceIcons.js.'
        }
    },
    create(context) {
        function resolveFrom(scope) {
            return function resolve(node) {
                const resolver = valueResolvers[node.type];
                return resolver ? resolver(node, resolve, scope) : [];
            };
        }

        function checkNames(node, names) {
            for (const name of names) {
                if (copiedIcons.has(name)) continue;
                context.report({ node, messageId: 'missing', data: { name } });
            }
        }

        function checkValue(node) {
            const resolve = resolveFrom(context.sourceCode.getScope(node));
            checkNames(node, resolve(node));
        }

        return {
            Literal(node) {
                if (typeof node.value !== 'string') return;
                checkNames(node, markupIconNames(node.value));
            },
            TemplateLiteral(node) {
                checkNames(node, markupIconNames(templateText(node)));
            },
            AssignmentExpression(node) {
                if (!isPropertyNamed(node.left, 'name')) return;
                if (!iconReceiverPattern.test(receiverName(node.left.object))) return;
                checkValue(node.right);
            },
            CallExpression(node) {
                if (!isPropertyNamed(node.callee, 'setAttribute')) return;
                if (node.arguments[0]?.value !== 'name') return;
                const receiver = receiverName(node.callee.object);
                if (!iconAttributeReceiverPattern.test(receiver)) return;
                checkValue(node.arguments[1]);
            },
            'ObjectExpression > Property'(node) {
                if (node.key.name !== 'name') return;
                if (!isObjectAssignToIcon(node.parent)) return;
                checkValue(node.value);
            }
        };
    }
};
