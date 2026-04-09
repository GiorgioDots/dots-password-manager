import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function readSecretFromFilePath(envVarName: string): string | undefined {
    const filePath = process.env[envVarName]
    if (!filePath) return undefined
    console.log(`Reading secret from file: ${resolve(filePath)}`)
    return readFileSync(filePath, 'utf8')
}

function readRequired(name: string): string {
    const value =
        process.env[name] ?? readSecretFromFilePath(`${name}_FILE`) ?? readSecretFromFilePath(name)

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }

    return value
}

function readRequiredNumber(name: string): number {
    const value = readRequired(name)
    const parsed = Number.parseInt(value, 10)
    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be a number`)
    }
    return parsed
}

export const authConfig = {
    jwtSecret: readRequired('JWT_SECRET'),
    jwtIssuer: readRequired('JWT_ISSUER'),
    jwtAudience: readRequired('JWT_AUDIENCE'),
    jwtExpMinutes: readRequiredNumber('JWT_EXP_MINUTES'),
    jwtRefreshTokenExpDays: readRequiredNumber('JWT_REFRESH_TOKEN_EXP_DAYS'),
    cryptoBase64Key: readRequired('CRYPTO_BASE_64_KEY'),
}
