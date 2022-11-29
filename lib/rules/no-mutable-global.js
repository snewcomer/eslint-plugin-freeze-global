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
            emptyMutableGlobal: 'Naked objects or arrays such as {{name}} at the top level are discouraged. Please refactor to non global constants or ignore this lint rule since this object should be mutable.',
            noMutableGlobal: `Please add Object.freeze to global {{ name }} to ensure it cannot be mutated.`,
        }
    },
    create(context) {
        return {
            VariableDeclarator(node) {
                if (isMutableNode(node, node.parent)) {
                    const sourceCode = context.getSourceCode();

                    if (node.init.type === "ObjectExpression" || node.init.type === "ArrayExpression") {
                        if ((node.init.properties || []).length || (node.init.elements || []).length) {
                            context.report({
                                node,
                                messageId: "noMutableGlobal",
                                data: {
                                    name: node.id.name
                                },
                                fix(fixer) {
                                    return fixer.replaceText(node.init, `Object.freeze(${sourceCode.getText(node.init)})`);
                                }
                            });
                        } else {
                            context.report({
                                node,
                                messageId: 'emptyMutableGlobal',
                                data: {
                                    name: node.id.name,
                                },
                            });
                        }
                    }
                }
            },
            Property(node) {
                const sourceCode = context.getSourceCode();
                if (node.value.type === "ObjectExpression" || node.value.type === "ArrayExpression") {
                    const beforeProgram = findChildOfProgram(node);
                    if (beforeProgram.type === "VariableDeclaration") {
                        if (isMutableKey(node, beforeProgram)) {
                            context.report({
                                node,
                                messageId: "noMutableGlobal",
                                data: {
                                    name: node.key.name
                                },
                                fix(fixer) {
                                    return fixer.replaceText(node.value, `Object.freeze(${sourceCode.getText(node.value)})`);
                                }
                            });
                        }
                    }
                }
            }
        }
    }
}

function findChildOfProgram(node) {
    if (node.parent.type === "Program") {
        return node;
    }

    return findChildOfProgram(node.parent);
}

function isMutableNode(node, parent) {
    if (parent.kind === "const" && parent.parent.type === "Program" && node.init) {
        if (node.init.type === "CallExpression" && node.init.callee.type === "Identifier" && node.init.callee.name === "require") {
            return false;
        }
        if (node.init.type === "CallExpression" && node.init.callee.type === "MemberExpression" && node.init.callee.property.name === "freeze") {
            return false;
        }

        return true;
    }
}

function isMutableKey(node, parent) {
    if (parent.kind === "const" && parent.parent.type === "Program") {
        if (node.init && node.init.type === "CallExpression" && node.init.callee.type === "MemberExpression" && node.init.callee.property.name === "freeze") {
            return false;
        }

        return true;
    }

    return false;
}
