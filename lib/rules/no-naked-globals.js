module.exports = {
  meta: {
    type: 'problem',
    schema: [],
    docs: {
      description: 'Forbid empty globals objects or arrays.',
      recommended: true,
    },
    messages: {
      emptyMutableGlobal: 'Naked objects or arrays such as {{name}} at the top level are discouraged. Please refactor to non global constants or ignore this lint rule since this object should be mutable.',
    }
  },
  create(context) {
    return {
      VariableDeclarator(node) {
        if (isMutableGlobal(node, node.parent)) {
          if (node.init.type === "ObjectExpression" || node.init.type === "ArrayExpression") {
            if (!(node.init.properties || []).length || !(node.init.elements || []).length) {
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
    }
  }
}

function isMutableGlobal(node, parent) {
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
