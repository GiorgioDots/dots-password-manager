import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/shared/utils'

const alertVariants = cva(
    'relative w-full rounded-lg border px-4 py-3 text-sm [&>p]:leading-relaxed',
    {
        variants: {
            variant: {
                default: 'bg-background text-foreground',
                destructive:
                    'border-destructive/50 text-destructive dark:border-destructive [&>p]:text-destructive',
                success: 'border-emerald-300/60 bg-emerald-50 text-emerald-700',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
)

type AlertProps = React.ComponentProps<'div'> &
    VariantProps<typeof alertVariants>

function Alert({ className, variant, ...props }: AlertProps) {
    return (
        <div
            role="alert"
            data-slot="alert"
            className={cn(alertVariants({ variant }), className)}
            {...props}
        />
    )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'p'>) {
    return (
        <p data-slot="alert-description" className={cn(className)} {...props} />
    )
}

export { Alert, AlertDescription }
