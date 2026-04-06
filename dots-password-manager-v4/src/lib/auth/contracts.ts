export type LoginRequest = {
  Login: string
  Password: string
}

export type RegisterRequest = {
  Email: string
  Username: string
  Password: string
}

export type RefreshTokenRequest = {
  Token: string
}

export type ResetPasswordRequestRequest = {
  Email: string
}

export type ResetPasswordRequest = {
  RequestId: string
  NewPassword: string
}

export type AuthTokenResponse = {
  Token: string
  RefreshToken: string
}

export type AuthMessageResponse = {
  Message: string
}
