import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/shared/utils'

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground hover:brightness-110',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                outline:
                    'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                destructive:
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 rounded-md px-3',
                lg: 'h-11 rounded-md px-8',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
)

type ButtonProps = React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants>

function Button({ className, variant, size, ...props }: ButtonProps) {
    return (
        <button
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    )
}

export { Button, buttonVariants }
