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
            code: 'const GLOBAL = Object.freeze({})',
        },
        {
            code: 'import K from "bar"; const GLOBAL = Object.freeze({})',
        },
        {
            code: 'import K from "bar"; const GLOBAL = Object.freeze({ a: "b" })',
        },
        {
            code: 'import K from "bar"; const GLOBAL = Object.freeze([])',
        },
        {
            code: 'import K from "bar"; const GLOBAL = Object.freeze([{ a: 1 }])',
        },
        {
            code: 'import K from "bar"; const GLOBAL = Object.freeze({ a: [] })',
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
    ],
    invalid: [
        {
            code: 'const GLOBAL = {};',
            output: 'const GLOBAL = Object.freeze({});',
            errors: [
                {
                    messageId: 'noMutableGlobal',
                }
            ],
        },
        {
            code: 'const GLOBAL = [];',
            output: 'const GLOBAL = Object.freeze([]);',
            errors: [
                {
                    messageId: 'noMutableGlobal',
                }
            ],
        },
        {
            code: 'import K from "bar"; const GLOBAL = {};',
            output: 'import K from "bar"; const GLOBAL = Object.freeze({});',
            errors: [
                {
                    messageId: 'noMutableGlobal',
                }
            ],
        },
        {
            code: 'import K from "bar"; const GLOBAL = [];',
            output: 'import K from "bar"; const GLOBAL = Object.freeze([]);',
            errors: [
                {
                    messageId: 'noMutableGlobal',
                }
            ],
        },
        {
            code: `
                import K from "bar";
                const GLOBAL = [
                    1,
                    2,
                    {}
                ];
            `,
            output: `
                import K from "bar";
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
            `,
            errors: [
                {
                    messageId: 'noMutableGlobal',
                }
            ],
        }
    ]
});
