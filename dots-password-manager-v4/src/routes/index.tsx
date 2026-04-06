import { createFileRoute, redirect } from '@tanstack/react-router'
import { isLoggedIn } from '#/lib/client-auth'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (isLoggedIn()) {
      throw redirect({ to: '/saved-passwords' })
    }

    throw redirect({ to: '/auth/login' })
  },
  component: () => null,
})
