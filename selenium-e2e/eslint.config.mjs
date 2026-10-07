import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import mocha from 'eslint-plugin-mocha';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores([
    'reports/**',
    'test-results/**',
    'node_modules/**',
    'allure-results/**',
    'allure-report/**',
    'logs/**',
    'coverage/**'
  ]),
  {
    files: ['src/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.mocha
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-empty-pattern': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      'no-console': 'off'
    }
  },
  {
    files: ['src/tests/**/*.ts', 'src/pages/**/*.ts'],
    plugins: {
      mocha
    },
    rules: {
      'mocha/no-exclusive-tests': 'error',
      'mocha/no-pending-tests': 'warn',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='sleep']",
          message:
            'driver.sleep is forbidden. Use WebDriverWait and ExpectedConditions for explicit condition-based waiting.'
        }
      ]
    }
  }
]);
