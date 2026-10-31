import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals';

// ESLint philosophy:
// - Prioritize correctness and real bugs
// - Enforce a small, explicit set of structural style rules
//   (semicolons, quotes, indentation, brace shape)
// - Avoid formatter-style micromanagement and implicit rewrites
// - Use warnings where human judgment is expected
// - Maintain a zero-noise baseline: lint should be quiet on intentional code
export default [
    {
        files: ['electron/**/*.{js,cjs}', 'tasks/**/*.{js,cjs}'],
        languageOptions: { globals: globals.node }
    },
    {
        files: ['electron/**/*.cjs', 'tasks/**/*.cjs'],
        languageOptions: { sourceType: 'commonjs', globals: globals.node }
    },
    {
        files: ['src/*.js', 'src/**/*.js', 'extensions/cardparts/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.jasmine,
                appEnvironment: 'readonly',
                // CODEBASE GLOBALS
                activeGame: 'readonly',
                activeProject: 'readonly',
                activeEditorCard: 'readonly',
                selectedProjectCard: 'readonly',
                localize: 'readonly',
                log: 'readonly',
                createReporter: 'readonly',
                changed: 'readonly',
                CardMagicianModule: 'readonly',
                CardMagicianGame: 'readonly',
                CardMagicianProject: 'readonly',
                CardMagicianCard: 'readonly',
                CardMagicianExporter: 'readonly',
                ReactiveComponent: 'readonly',
                Modal: 'readonly',
                dialog: 'readonly',
            }
        }
    },

    {
        files: ['src/**/*.js', 'extensions/cardparts/**/*.js', 'electron/**/*.{js,cjs}', 'tasks/**/*.{js,cjs}'],
        rules: {
            // Correctness & safety
            'no-undef': 'error',
            'no-redeclare': 'error',
            'no-dupe-class-members': 'error',
            'no-constant-condition': 'warn',
            'array-callback-return': 'error',
            'for-direction': 'error',
            'getter-return': 'error',
            'no-async-promise-executor': 'error',
            'no-class-assign': 'error',
            'no-compare-neg-zero': 'error',
            'no-cond-assign': 'error',
            'no-const-assign': 'error',
            'no-debugger': 'warn',
            'no-dupe-args': 'error',
            'no-dupe-keys': 'error',
            'no-duplicate-case': 'error',
            'no-empty-character-class': 'error',
            'no-empty-pattern': 'error',
            'no-ex-assign': 'error',
            'no-fallthrough': 'warn',
            'no-func-assign': 'error',
            'no-import-assign': 'error',
            'no-inner-declarations': 'warn',
            'no-invalid-regexp': 'warn',
            'no-irregular-whitespace': 'error',
            'no-loss-of-precision': 'warn',
            'no-misleading-character-class': 'error',
            'no-new-native-nonconstructor': 'error',
            'no-obj-calls': 'error',
            'no-promise-executor-return': 'error',
            'no-prototype-builtins': 'warn',
            'no-self-assign': 'warn',
            'no-self-compare': 'error',
            'no-setter-return': 'error',
            'no-sparse-arrays': 'warn',
            'no-template-curly-in-string': 'warn',
            'no-this-before-super': 'error',
            'no-unassigned-vars': 'error',
            'no-unexpected-multiline': 'warn',
            'no-unmodified-loop-condition': 'warn',
            'no-unreachable': 'error',
            'no-unreachable-loop': 'warn',
            'no-unsafe-finally': 'warn',
            'no-unsafe-negation': 'error',
            'no-unsafe-optional-chaining': 'warn',
            'no-unused-private-class-members': 'warn',
            'no-unused-vars': ['warn', { args: 'none' }],
            'no-useless-assignment': 'warn',
            'no-useless-backreference': 'warn',
            'use-isnan': 'error',
            'valid-typeof': 'warn',

            // Explicitness & clarity
            'curly': ['error', 'multi-or-nest', 'consistent'],
            'eqeqeq': ['error', 'always'],
            'no-implied-eval': 'error',
            'no-with': 'error',

            // Modern JS
            'no-var': 'error',
            'prefer-const': 'warn',
            'object-shorthand': ['warn', 'always'],

            // Ternaries (disciplined usage)
            'no-nested-ternary': 'error',

            'max-len': ['warn', {
                code: 90,
                ignoreComments: false,
                ignoreStrings: false,
                ignoreTemplateLiterals: false
            }],

            // Classes
            'constructor-super': 'error',
            'no-useless-constructor': 'warn',
            'class-methods-use-this': 'off'
        }
    },

    {
        files: ['src/**/*.js', 'extensions/cardparts/**/*.js', 'electron/**/*.{js,cjs}', 'tasks/**/*.{js,cjs}'],
        ignores: ['src/**/*.smoke.js'],

        rules: {
            // Size & structure warnings
            'max-lines': ['warn', {
                max: 300,
                skipBlankLines: true,
                skipComments: true
            }],
        }
    },

    {
        files: ['src/**/*.js', 'extensions/cardparts/**/*.js', 'electron/**/*.{js,cjs}', 'tasks/**/*.{js,cjs}'],
        plugins: {
            '@stylistic': stylistic
        },
        rules: {
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/quotes': ['error', 'single', {
                allowTemplateLiterals: 'always'
            }],
            '@stylistic/indent': ['error', 4, {
                CallExpression: {
                    arguments: 'first'
                },
                ArrayExpression: 'first'
            }],
            '@stylistic/brace-style': ['error', '1tbs', {
                allowSingleLine: true
            }],
            '@stylistic/operator-linebreak': ['warn', 'before'],
            // Trailing commas intentionally unconstrained
            '@stylistic/comma-dangle': 'off'
        }
    }
]
