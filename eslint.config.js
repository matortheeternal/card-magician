import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals';

export default [
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                // NEUTRALINO GLOBALS
                Neutralino: 'readonly',
                NL_PATH: 'readonly',
                NL_DATAPATH: 'readonly',
                NL_ARGS: 'readonly',
                // DEPENDENCY GLOBALS
                Alpine: 'readonly',
                // CODEBASE GLOBALS
                localize: 'readonly',
            }
        }
    },

    {
        files: ['src/tests/**/*.js'],
        languageOptions: {
            globals: globals.jasmine
        }
    },

    {
        files: ['src/**/*.js'],
        rules: {
            // Correctness & safety
            'no-undef': 'error',
            'no-unused-vars': ['warn', { args: 'none' }],
            'no-redeclare': 'error',
            'no-unreachable': 'error',
            'no-dupe-class-members': 'error',
            'no-constant-condition': 'warn',

            // Explicitness & clarity
            'curly': ['error', 'multi-or-nest'],
            'eqeqeq': ['error', 'always'],
            'no-implied-eval': 'error',
            'no-with': 'error',

            // Modern JS (conservative)
            'no-var': 'error',
            'prefer-const': 'warn',
            'object-shorthand': ['warn', 'always'],

            // Ternaries (intentional use only)
            'no-nested-ternary': 'error',

            // Size & structure warnings
            'max-lines': ['warn', {
                max: 300,
                skipBlankLines: true,
                skipComments: true
            }],

            'max-len': ['warn', {
                code: 90,
                ignoreComments: true,
                ignoreStrings: false,
                ignoreTemplateLiterals: false
            }],

            // Classes
            'no-useless-constructor': 'warn',
            'class-methods-use-this': 'off'
        }
    },

    {
        files: ['src/**/*.js'],
        plugins: {
            '@stylistic': stylistic
        },
        rules: {
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/quotes': ['error', 'single', { allowTemplateLiterals: 'always' }],
            '@stylistic/indent': ['error', 4, { SwitchCase: 1 }],
            '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
            '@stylistic/operator-linebreak': ['warn', 'before'],

            // Trailing commas intentionally unconstrained
            '@stylistic/comma-dangle': 'off'
        }
    }
]
