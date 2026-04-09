//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
    ...tanstackConfig,
    {
        rules: {
            'import/no-cycle': 'off',
            'import/order': 'off',
            'sort-imports': 'off',
            '@typescript-eslint/array-type': 'off',
            '@typescript-eslint/require-await': 'off',
            'pnpm/json-enforce-catalog': 'off',
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
        files: [
            'src/lib/server/**/*.{ts,tsx}',
            'src/routes/api/**/*.{ts,tsx}',
            'server.ts',
        ],
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
