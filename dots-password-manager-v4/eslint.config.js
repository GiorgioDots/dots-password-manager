//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import unusedImports from 'eslint-plugin-unused-imports'

export default [
    ...tanstackConfig,
    {
        plugins: {
            'unused-imports': unusedImports,
        },
        rules: {
            'import/no-cycle': 'off',
            'import/order': 'off',
            'sort-imports': 'off',
            '@typescript-eslint/array-type': 'off',
            '@typescript-eslint/require-await': 'off',
            'pnpm/json-enforce-catalog': 'off',
            // 'unused-imports/no-unused-imports': 'error',
            // 'unused-imports/no-unused-vars': [
            //     'warn',
            //     {
            //         vars: 'all',
            //         varsIgnorePattern: '^_',
            //         args: 'after-used',
            //         argsIgnorePattern: '^_',
            //     },
            // ],
        },
    },
    {
        files: [
            'src/lib/client/**/*.{ts,tsx}',
            'src/components/**/*.{ts,tsx}',
            'src/routes/**/*.{ts,tsx}',
        ],
        ignores: ['src/routes/api/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: ['#/lib/server/*', '#/lib/server/**'],
                },
            ],
        },
    },
    {
        files: ['src/lib/server/**/*.{ts,tsx}', 'src/routes/api/**/*.{ts,tsx}', 'server.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: ['#/lib/client/*', '#/lib/client/**'],
                },
            ],
        },
    },
    {
        ignores: [
            'eslint.config.js',
            'prettier.config.js',
            '.output',
            '**/src/routeTree.gen.ts',
            '**/routeTree.gen.ts',
        ],
    },
]
