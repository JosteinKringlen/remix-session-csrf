/** @type {import('eslint').Linter.Config} */
module.exports = {
    extends: [
        '@remix-run/eslint-config',
        '@remix-run/eslint-config/node',
        'plugin:prettier/recommended',
    ],
    plugins: ['simple-import-sort'],
    rules: {
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
    },
};
