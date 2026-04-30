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

function readRequiredNumberFromAny(names: string[]): number {
    for (const name of names) {
        const raw = process.env[name]
        if (!raw) {
            continue
        }

        const parsed = Number.parseInt(raw, 10)
        if (Number.isNaN(parsed)) {
            throw new Error(`Environment variable ${name} must be a number`)
        }

        return parsed
    }

    throw new Error(`Missing required environment variable: one of ${names.join(', ')}`)
}

export const authConfig = {
    sessionTokenExpDays: readRequiredNumberFromAny([
        'SESSION_TOKEN_EXP_DAYS',
        'JWT_REFRESH_TOKEN_EXP_DAYS',
    ]),
    cryptoBase64Key: readRequired('CRYPTO_BASE_64_KEY'),
}
