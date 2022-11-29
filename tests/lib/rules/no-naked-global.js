const { RuleTester } = require('eslint');

const noNakedGlobal = require('../../../lib/rules/no-naked-global.js');

const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
});

ruleTester.run('no-naked-global', noNakedGlobal, {
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
            code: 'const GLOBAL = { a: "b" }',
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
        {
            code: `
                function foo() {
                    const GLOBAL = {};
                }
            `
        },
        {
            code: `
                function foo() {
                    const GLOBAL = db.find({ where: { } });
                }
            `
        },
        {
            code: `
                const exportFunc = (key) => {
                    return {
                        a: db.find({ where: {} }),
                    }
                }
            `
        },
        {
            code: `
                const exportFunc = function (key) {
                    return {
                        a: db.find({ where: {} }),
                    }
                }
            `
        },
        {
            code: `
                const exportFunc = function (key) {
                    const y = {
                        a: {},
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
