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
                const sourceCode = context.getSourceCode();
                if (node.value.type === "ObjectExpression" || node.value.type === "ArrayExpression") {
                    if (isPropertyInsideObject(node)) {
                        if (isMutableProperty(node, findChildOfProgram(node))) {
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
                    }
                }
            }
        }
    }
}

function isPropertyInsideObject(node) {
    if (node.parent.type === "VariableDeclarator") {
        return true;
    }

    if (node.parent.type === "ObjectExpression" || node.parent.type === "ArrayExpression" || node.parent.type === "Property" || isFrozen(node.parent)) {
        // not at Variable Declaration yet
        return isPropertyInsideObject(node.parent);
    }

    return false;
}

function findChildOfProgram(node) {
    // always will get to Program? I believe
    if (node.parent.type === "Program") {
        return node;
    }

    return findChildOfProgram(node.parent);
}

function isMutableConstGlobal(node, parent) {
    if (parent.kind === "const" && parent.parent.type === "Program" && node.init) {
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

function isMutableProperty(node, parent) {
    if (parent.kind === "const" && parent.parent.type === "Program") {
        if (isFrozen(node.init)) {
            return false;
        }

        return true;
    }

    return false;
}

function isFrozen(node) {
    if (node && node.type === "CallExpression" && node.callee.type === "MemberExpression" && node.callee.property.name === "freeze") {
        return true;
    }

    return false;
}
