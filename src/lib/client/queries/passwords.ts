import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
    createPassword,
    deletePassword,
    editPassword,
    getPasswordById,
    getPasswords,
    togglePasswordFavourite,
} from '#/lib/client/passwords'
import type { SavedPasswordDto } from '#/lib/shared/passwords/contracts'

export const passwordQueryKeys = {
    all: ['passwords'] as const,
    detail: (id: string | null) => ['password', id] as const,
}

export function usePasswordsQuery() {
    return useQuery({
        queryKey: passwordQueryKeys.all,
        queryFn: getPasswords,
    })
}

export function usePasswordByIdQuery(id: string | null) {
    return useQuery({
        queryKey: passwordQueryKeys.detail(id),
        queryFn: () => getPasswordById(id as string),
        enabled: !!id,
    })
}

export function useCreatePasswordMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createPassword,
        onSuccess: async (created) => {
            await queryClient.invalidateQueries({ queryKey: passwordQueryKeys.all })
            if (created.PasswordId) {
                await queryClient.invalidateQueries({
                    queryKey: passwordQueryKeys.detail(created.PasswordId),
                })
            }
        },
    })
}

export function useEditPasswordMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: editPassword,
        onSuccess: async (updated) => {
            await queryClient.invalidateQueries({ queryKey: passwordQueryKeys.all })
            if (updated.PasswordId) {
                await queryClient.invalidateQueries({
                    queryKey: passwordQueryKeys.detail(updated.PasswordId),
                })
            }
        },
    })
}

export function useDeletePasswordMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deletePassword,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: passwordQueryKeys.all })
        },
    })
}

export function useTogglePasswordFavouriteMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: togglePasswordFavourite,
        onSuccess: async (updated) => {
            await queryClient.invalidateQueries({ queryKey: passwordQueryKeys.all })
            await queryClient.invalidateQueries({
                queryKey: passwordQueryKeys.detail(updated.PasswordId),
            })
        },
    })
}

export type PasswordMutationInput = SavedPasswordDto
