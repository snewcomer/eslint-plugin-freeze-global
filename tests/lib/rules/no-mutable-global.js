const { RuleTester } = require('eslint');

const freezeGlobalRule = require('../../../lib/rules/no-mutable-global.js');

const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
});

ruleTester.run('no-mutable-global', freezeGlobalRule, {
    valid: [
        {
            code: "const a = 'b';",
        },
        {
            code: 'import K from "bar"; const GLOBAL = "bar";',
        },
        {
            code: 'const GLOBAL = Object.freeze({})', // we do not warn about these.
        },
        {
            code: 'import K from "bar"; const GLOBAL = Object.freeze({})',
        },
        {
            code: 'import K from "bar"; const GLOBAL = Object.freeze({ a: "b", b: Symbol("b") })',
        },
        {
            code: 'import K from "bar"; const GLOBAL = Object.freeze([])',
        },
        {
            code: 'import K from "bar"; const GLOBAL = Object.freeze([Object.freeze({a: 1})])',
        },
        {
            code: 'import K from "bar"; const GLOBAL = Object.freeze({ a: Object.freeze([]) })',
        },
        {
            code: 'import K from "bar"; const GLOBAL = Object.freeze([{}])', // TODO
        },
        {
            code: 'import K from "bar"; let GLOBAL = { a: [] }',
        },
        {
            code: 'import K from "bar"; var GLOBAL = { a: [] }',
        },
        {
            code: '{ const GLOBAL = {} }',
        },
        {
            code: '(function() { const GLOBAL = {} })()',
        },
        {
            code: `
                function foo() {
                    const GLOBAL = { a: [] };
                }
            `
        },
        {
            code: `
                function foo() {
                    const GLOBAL = db.find({ where: { key } });
                }
            `
        },
        {
            code: `
                const exportFunc = (key) => {
                    return {
                        a: db.find({ where: { key } }),
                    }
                }
            `
        },
        {
            code: `
                const exportFunc = function (key) {
                    return {
                        a: db.find({ where: { key } }),
                    }
                }
            `
        },
        {
            code: `
                const exportFunc = function (key) {
                    const y = {
                        a: { b: 'c' },
                    }
                }
            `
        },
        {
            code: `
                class Klass {
                    get foo() {
                        const y = { s: 't' };
                        return {
                            a: db.find({ where: { key } }),
                        }
                    }
                }
            `
        },
    ],
    invalid: [
        {
            code: 'import K from "bar"; const GLOBAL = Object.freeze([{ a: 1 }])',
            output: 'import K from "bar"; const GLOBAL = Object.freeze([Object.freeze({ a: 1 })])',
            errors: [
                {
                    messageId: 'noMutableGlobalProperty',
                }
            ],
        },
        {
            code: `
                import K from "bar";
                const { RuleTester } = require('eslint');
                const GLOBAL = Object.freeze({ a: [] });
                const GLOBAL_2 = Object.freeze({ a: { b: {} } });
                const GLOBAL_3 = Object.freeze({ a: Object.freeze({ b: {} }) });
                const GLOBAL_4 = Object.freeze({ a: Object.freeze([{ a: 'b' }]) });
                const GLOBAL_5 = Object.freeze({ a: Object.freeze([{}]) });
            `,
            output: `
                import K from "bar";
                const { RuleTester } = require('eslint');
                const GLOBAL = Object.freeze({ a: Object.freeze([]) });
                const GLOBAL_2 = Object.freeze({ a: Object.freeze({ b: {} }) });
                const GLOBAL_3 = Object.freeze({ a: Object.freeze({ b: Object.freeze({}) }) });
                const GLOBAL_4 = Object.freeze({ a: Object.freeze([Object.freeze({ a: 'b' })]) });
                const GLOBAL_5 = Object.freeze({ a: Object.freeze([{}]) });
            `, // TODO: object in array
            errors: [
                {
                    messageId: 'noMutableGlobalProperty',
                },
                {
                    messageId: 'noMutableGlobalProperty',
                },
                {
                    messageId: 'noMutableGlobalProperty',
                },
                {
                    messageId: 'noMutableGlobalProperty',
                },
                {
                    messageId: 'noMutableGlobalProperty',
                }
            ],
        },
        {
            code: `
                let K = "bar";
                const GLOBAL = [
                    1,
                    2,
                    {}
                ];
            `,
            output: `
                let K = "bar";
                const GLOBAL = Object.freeze([
                    1,
                    2,
                    {}
                ]);
            `,
            errors: [
                {
                    messageId: 'noMutableGlobal',
                }
            ],
        },
        {
            code: `
                import K from "bar";
                const GLOBAL = {
                    a: 1,
                    b: 2,
                    c: {}
                };
            `,
            output: `
                import K from "bar";
                const GLOBAL = Object.freeze({
                    a: 1,
                    b: 2,
                    c: {}
                });
            `, // RuleTester only does one pass by design so just test each case individually - https://github.com/eslint/eslint/issues/11187#issuecomment-470990425
            errors: [
                {
                    messageId: 'noMutableGlobal',
                },
                {
                    messageId: 'noMutableGlobalProperty',
                },
                {
                    messageId: 'noMutableGlobalProperty',
                },
                {
                    messageId: 'noMutableGlobalProperty',
                }
            ],
        },
        {
            code: `
                import K from "bar";
                const GLOBAL = Object.freeze({
                    a: 1,
                    b: 2,
                    c: {}
                });
            `,
            output: `
                import K from "bar";
                const GLOBAL = Object.freeze({
                    a: 1,
                    b: 2,
                    c: Object.freeze({})
                });
            `,
            errors: [
                {
                    messageId: 'noMutableGlobalProperty',
                }
            ],
        },
        {
            code: `
                export const GLOBAL = {
                    a: 1,
                    b: 2,
                    c: {}
                };
            `,
            output: `
                export const GLOBAL = Object.freeze({
                    a: 1,
                    b: 2,
                    c: {}
                });
            `,
            errors: [
                {
                    messageId: 'noMutableGlobal',
                }
            ],
        }
    ]
});
