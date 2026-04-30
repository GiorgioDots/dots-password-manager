export type FieldErrorItem = { message?: string }

export function mapFieldErrors(errors: unknown[]): FieldErrorItem[] {
    return errors
        .map((error) => {
            if (typeof error === 'string') {
                return { message: error }
            }

            if (
                error &&
                typeof error === 'object' &&
                'message' in error &&
                typeof error.message === 'string'
            ) {
                return { message: error.message }
            }

            return {
                message:
                    error == null
                        ? undefined
                        : typeof error === 'number' || typeof error === 'boolean'
                          ? String(error)
                          : undefined,
            }
        })
        .filter((error) => Boolean(error.message))
}
