module.exports = {
    parser: '@typescript-eslint/parser',
    env: {
        node: true,
        es6: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
        'plugin:unicorn/recommended',
        'plugin:promise/recommended',
        'plugin:jest/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'prettier', 'unicorn', 'promise', 'import'],
    rules: {
        'no-console': 'off',
        // 'unicorn/no'
    },
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            typescript: {},
        },
    },
};
