import bcrypt from 'bcryptjs'

export function generatePasswordSalt(): string {
    return bcrypt.genSaltSync()
}

export function hashPasswordWithSalt(plainPassword: string, salt: string): string {
    return bcrypt.hashSync(plainPassword, salt)
}

export function verifyPasswordWithSalt(
    plainPassword: string,
    salt: string,
    expectedHash: string,
): boolean {
    return hashPasswordWithSalt(plainPassword, salt) === expectedHash
}
