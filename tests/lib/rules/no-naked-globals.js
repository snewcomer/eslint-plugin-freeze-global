const { RuleTester } = require('eslint');

const noNakedGlobal = require('../../../lib/rules/no-naked-globals.js');

const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
});

ruleTester.run('no-naked-globals', noNakedGlobal, {
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
            code: 'import K from "bar"; const GLOBAL = Object.freeze([{ a: 1 }])',
        },
        {
            code: 'import K from "bar"; const GLOBAL = Object.freeze({ a: Object.freeze([]) })',
        },
        {
            code: 'import K from "bar"; const GLOBAL = Object.freeze([{}])',
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
            output: null,
            errors: [
                {
                    messageId: 'emptyMutableGlobal',
                }
            ],
        },
        {
            code: 'const GLOBAL = [];',
            output: null,
            errors: [
                {
                    messageId: 'emptyMutableGlobal',
                }
            ],
        },
        {
            code: 'import K from "bar"; const GLOBAL = {};',
            output: null,
            errors: [
                {
                    messageId: 'emptyMutableGlobal',
                }
            ],
        },
        {
            code: 'import K from "bar"; const GLOBAL = [];',
            output: null,
            errors: [
                {
                    messageId: 'emptyMutableGlobal',
                }
            ],
        },
    ]
});
