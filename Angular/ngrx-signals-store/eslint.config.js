const tseslint = require('typescript-eslint');
const ngrx = require('@ngrx/eslint-plugin');

module.exports = tseslint.config({
  files: ['**/*.ts'],
  extends: [
    // Use all rules at once.
    ...ngrx.configs.all,
    // Or only import the rules for a specific package.
    ...ngrx.configs.store,
    ...ngrx.configs.effects,
    ...ngrx.configs.componentStore,
    ...ngrx.configs.operators,
    ...ngrx.configs.signals,
    // Include rules that require type information.
    ...ngrx.configs.allTypeChecked,
    ...ngrx.configs.effectsTypeChecked,
    ...ngrx.configs.signalsTypeChecked,
  ],
  rules: {
    // Configure specific rules.
    '@ngrx/with-state-no-arrays-at-root-level': 'warn',
  },
});