module.exports = {
    meta: {
        type: 'problem',
        schema: [],
        docs: {
            description: 'Forbid mutable globals objects or arrays.',
            recommended: true,
        },
        fixable: 'code',
        messages: {
            freezeGlobal: `Please add Object.freeze to global {{ name }} to ensure it cannot be mutated.`,
        }
    },
    create(context) {
        return {
            VariableDeclarator(node) {
                if (node.parent.kind === "const" && node.parent.parent.type === "Program" && node.init) {
                    if (node.init.type === "CallExpression" && node.init.callee.type === "Identifier" && node.init.callee.name === "require") {
                        return;
                    }
                    if (node.init.type === "CallExpression" && node.init.callee.type === "MemberExpression" && node.init.callee.property.name === "freeze") {
                        return;
                    }

                    if (node.init.type === "ObjectExpression" || node.init.type === "ArrayExpression") {
                        context.report({
                            node,
                            messageId: 'freezeGlobal',
                            data: {
                                name: node.id.name,
                            },
                            fix(fixer) {
                                const sourceCode = context.getSourceCode();
                                return fixer.replaceText(node.init, `Object.freeze(${sourceCode.getText(node.init)})`);
                            }
                        });
                    }
                }
            }
        }
    }
}
