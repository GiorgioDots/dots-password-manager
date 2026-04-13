export type LoginRequest = {
    Login: string
    Password: string
}

export type RegisterRequest = {
    Email: string
    Username: string
    Password: string
}

export type ResetPasswordRequestRequest = {
    Email: string
}

export type ResetPasswordRequest = {
    RequestId: string
    NewPassword: string
}

export type AuthSessionResponse = {
    LoggedIn: boolean
}

export type AuthMessageResponse = {
    Message: string
}
