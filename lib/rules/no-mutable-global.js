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
            noMutableGlobal: `Please add Object.freeze to global {{ name }} to ensure it cannot be mutated.`,
            noMutableGlobalProperty: `Please add Object.freeze to property {{ name }} to ensure it cannot be mutated inside a global.`,
        }
    },
    create(context) {
        return {
            VariableDeclarator(node) {
                if (isMutableConstGlobal(node, node.parent)) {
                    const sourceCode = context.getSourceCode();

                    if (node.init.type === "ObjectExpression" || node.init.type === "ArrayExpression") {
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
                    }
                }
            },
            Property(node) {
                if (node.value.type === "ObjectExpression" || node.value.type === "ArrayExpression") {
                    // if the value in an object is an object or array, it isn't frozen
                    if (isPropertyInsideGlobalObject(node)) {
                        const sourceCode = context.getSourceCode();
                        context.report({
                            node,
                            messageId: "noMutableGlobalProperty",
                            data: {
                                name: node.key.name
                            },
                            fix(fixer) {
                                return fixer.replaceText(node.value, `Object.freeze(${sourceCode.getText(node.value)})`);
                            }
                        });
                    }
                } else if (node.parent.type === "ObjectExpression") {
                    // e.g. property in object in array
                    if (isPropertyInsideGlobalObject(node) && !isFrozen(node.parent.parent)) {
                        const sourceCode = context.getSourceCode();
                        context.report({
                            node,
                            messageId: "noMutableGlobalProperty",
                            data: {
                                name: node.key.name
                            },
                            fix(fixer) {
                                return fixer.replaceText(node.parent, `Object.freeze(${sourceCode.getText(node.parent)})`);
                            }
                        });
                    }
                }
            }
        }
    }
}

function isPropertyInsideGlobalObject(node) {
    if (node.parent.type === "VariableDeclaration") {
        return node.parent.kind === "const" && node.parent.parent.type === "Program";
    }

    if (node.parent.type === "VariableDeclarator" || node.parent.type === "ObjectExpression" || node.parent.type === "ArrayExpression" || node.parent.type === "Property" || isFrozen(node.parent)) {
        // not at Variable Declaration yet
        return isPropertyInsideGlobalObject(node.parent);
    }

    return false;
}

function isMutableConstGlobal(node, parent) {
    if (parent.kind === "const" &&
        (parent.parent.type === "Program" || parent.parent.type === 'ExportNamedDeclaration') &&
        node.init
    ) {
        // const require
        if (node.init.type === "CallExpression" && node.init.callee.type === "Identifier" && node.init.callee.name === "require") {
            return false;
        }

        if (!isFrozen(node.init)) {
            return true;
        }

        return false;
    }
}

function isFrozen(node) {
    if (node && node.type === "CallExpression" && node.callee.type === "MemberExpression" && node.callee.property.name === "freeze") {
        return true;
    }

    return false;
}
