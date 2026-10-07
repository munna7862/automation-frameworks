import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores([
    'reports/**',
    'test-results/**',
    'blob-report/**',
    'node_modules/**',
    '.auth/**',
    'playwright-report/**',
    'coverage/**'
  ]),
  {
    files: ['src/**/*.ts', 'scripts/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-empty-pattern': 'off',
      'preserve-caught-error': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      'no-console': 'off'
    }
  },
  {
    files: ['src/tests/**/*.ts'],
    plugins: {
      playwright
    },
    rules: {
      'playwright/missing-playwright-await': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-conditional-in-test': 'warn',
      'playwright/no-networkidle': 'error',
      'playwright/no-element-handle': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-eval': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Promise'] CallExpression[callee.name='setTimeout']",
          message:
            'Hard waits via setTimeout inside new Promise are forbidden. Use expect.poll or web-first assertions instead.'
        },
        {
          selector: "CallExpression[callee.object.name='page'][callee.property.name='locator']",
          message:
            'Direct page.locator(...) calls in test specs are forbidden. Encapsulate element locators inside Page Object Models under src/pages/.'
        }
      ]
    }
  },
  {
    files: ['src/tests/api/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.name='request'][callee.property.name=/^(get|post|put|patch|delete)$/]",
          message:
            'Direct request.<method> calls are forbidden in API tests. Use typed api.* clients instead.'
        },
        {
          selector: "NewExpression[callee.name='Promise'] CallExpression[callee.name='setTimeout']",
          message:
            'Hard waits via setTimeout inside new Promise are forbidden. Use expect.poll or web-first assertions instead.'
        }
      ]
    }
  }
]);
