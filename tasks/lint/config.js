import magic from '../../extensions/games/magic/eslint.config.js';
import agent from './plugin.js';
import globals from 'globals';

const FILES = [
    'src/**/*.js', 'extensions/games/magic/src/**/*.js',
    'extensions/cardparts/**/*.js', 'extensions/exporters/**/*.js',
    'electron/**/*.{js,cjs,mjs}', 'tasks/**/*.{js,cjs,mjs}', '*.config.js'
];

function scopeMagic(config) {
    return {
        ...config,
        files: config.files.map(pattern => `extensions/games/magic/${pattern}`)
    };
}

export default [
    { linterOptions: { reportUnusedDisableDirectives: 'error' } },
    ...magic.map(scopeMagic),
    { files: ['*.config.js'], languageOptions: { globals: globals.node } },
    {
        files: FILES,
        plugins: { agent },
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'IfStatement[alternate]',
                    message: 'Avoid else branches (AGENTS 2.2). Terminate the '
                        + 'exceptional case with return, continue, or break.'
                },
                {
                    selector: 'SwitchStatement',
                    message: 'Do not use switch (AGENTS 2.3). Use focused '
                        + 'functions or a lookup/implementation registry.'
                }
            ],
            'no-nested-ternary': 'error',
            'agent/regex-at-module-scope': 'error',
            'agent/jsdoc-syntax': 'error',
            'complexity': 'off',
            'agent/complexity': ['warn', 8],
            'max-depth': ['warn', 2]
        }
    },
    {
        files: ['**/*.test.js', '**/*.tests.js', '**/*.smoke.js'],
        rules: { 'agent/regex-at-module-scope': 'off' }
    }
];
