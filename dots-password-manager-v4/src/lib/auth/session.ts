import { eq } from 'drizzle-orm'

import { db } from '#/db'
import { users } from '#/db/schema'
import { verifyJwt } from '#/lib/auth/jwt'

const CLAIM_NAME_ID =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'

type SessionUser = {
  id: string
  email: string
  username: string
  originalUsername: string
  salt: string
  passwordSalt: string
  passwordHash: string
}

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('authorization')
  if (!auth) return null

  const [scheme, token] = auth.split(' ')
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
    return null
  }

  return token
}

export async function getSessionUser(
  request: Request,
): Promise<SessionUser | null> {
  const token = getBearerToken(request)
  if (!token) return null

  try {
    const payload = verifyJwt(token)
    const userId = payload[CLAIM_NAME_ID]

    if (typeof userId !== 'string') {
      return null
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        username: true,
        originalUsername: true,
        salt: true,
        passwordSalt: true,
        passwordHash: true,
      },
    })

    return user ?? null
  } catch {
    return null
  }
}

export function unauthorizedResponse(): Response {
  return Response.json({ Message: 'Unauthorized' }, { status: 401 })
}
