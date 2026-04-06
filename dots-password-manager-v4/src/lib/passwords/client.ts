import { authFetch } from '#/lib/client-auth'
import type { SavedPasswordDto } from '#/lib/passwords/contracts'

export async function getPasswords(): Promise<SavedPasswordDto[]> {
  const res = await authFetch('/api/passwords')
  if (!res.ok) {
    throw new Error('Failed to load passwords')
  }
  return (await res.json()) as SavedPasswordDto[]
}

export async function getPasswordById(id: string): Promise<SavedPasswordDto> {
  const res = await authFetch(`/api/passwords/${id}`)
  if (!res.ok) {
    throw new Error('Failed to load password')
  }
  return (await res.json()) as SavedPasswordDto
}

export async function createPassword(
  input: SavedPasswordDto,
): Promise<SavedPasswordDto> {
  const res = await authFetch('/api/passwords/create', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error('Failed to create password')
  }
  return (await res.json()) as SavedPasswordDto
}

export async function editPassword(
  input: SavedPasswordDto,
): Promise<SavedPasswordDto> {
  const res = await authFetch('/api/passwords/edit', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error('Failed to update password')
  }
  return (await res.json()) as SavedPasswordDto
}

export async function deletePassword(id: string): Promise<void> {
  const res = await authFetch(`/api/passwords/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    throw new Error('Failed to delete password')
  }
}

export async function togglePasswordFavourite(
  id: string,
): Promise<{ PasswordId: string; IsFavourite: boolean }> {
  const res = await authFetch(`/api/passwords/${id}/toggle-favourite`)
  if (!res.ok) {
    throw new Error('Failed to toggle favourite')
  }

  return (await res.json()) as { PasswordId: string; IsFavourite: boolean }
}
