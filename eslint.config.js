import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'assets', 'coverage', 'docs/assets']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^React$' }],
      'no-case-declarations': 'warn',
      'no-constant-binary-expression': 'warn',
      'no-useless-escape': 'warn',
      'no-dupe-keys': 'warn',
      'no-unreachable': 'warn',
      'react-refresh/only-export-components': 'off',
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },
])
