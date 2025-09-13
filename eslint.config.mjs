import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
  // Configuración para TypeScript
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: [
          './tsconfig.json',
          './apps/*/tsconfig.json',
          './packages/*/tsconfig.json',
          '../frontend/tsconfig.json',
        ],
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier,
    },
    rules: {
      // Reglas de TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      // Reglas generales
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',

      // Reglas de Prettier
      'prettier/prettier': 'error',
    },
  },

  // Configuración específica para APIs
  {
    files: [
      'apps/api-*/**/*.ts',
      'backend/**/*.ts',
      'packages/services/**/*.ts',
    ],
    rules: {
      'no-console': 'off', // Permitir console en APIs
      '@typescript-eslint/no-explicit-any': 'error', // Más estricto en APIs
    },
  },

  // Configuración para archivos de test
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // Configuración específica para archivos de ejemplo
  {
    files: ['**/examples/**/*.ts', '**/examples/**/*.tsx'],
    rules: {
      'no-console': 'off', // Permitir console en archivos de ejemplo
      '@typescript-eslint/no-explicit-any': 'off', // Permitir any en ejemplos
    },
  },

  // Archivos ignorados
  {
    ignores: [
      'node_modules/**',
      '.pnp/**',
      '.pnp.js',
      'dist/**',
      'build/**',
      '.next/**',
      'out/**',
      '**/*.generated.ts',
      '**/*.generated.js',
      '**/generated/**',
      '**/.turbo/**',
      '**/prisma/migrations/**',
      '**/prisma/generated/**',
      'coverage/**',
      '.nyc_output/**',
      '.eslintcache',
      '.parcel-cache/**',
      '.cache/**',
      '.env*',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      'pnpm-debug.log*',
      'lerna-debug.log*',
      '.DS_Store*',
      '._*',
      '.Spotlight-V100',
      '.Trashes',
      'ehthumbs.db',
      'Thumbs.db',
      '.vscode/settings.json',
      '.idea/**',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      '**/public/**',
      '**/static/**',
      'docs/.vitepress/dist/**',
      'docs/.vitepress/cache/**',
    ],
  },
];
