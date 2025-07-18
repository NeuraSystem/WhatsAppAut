// eslint.config.js
const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                process: 'readonly',
                console: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
                global: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            semi: ['error', 'always'],
            quotes: ['error', 'single', { allowTemplateLiterals: true }],
            indent: ['error', 4],
            'comma-dangle': ['error', 'never'],
            'no-trailing-spaces': 'error',
            'eol-last': 'error'
        }
    },
    {
        files: ['src/scripts/**/*.js'],
        rules: {
            'no-console': 'off'
        }
    },
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            '*.min.js',
            'coverage/**',
            'venv/**',
            'chroma_data/**'
        ]
    }
];
