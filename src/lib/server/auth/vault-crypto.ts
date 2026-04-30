import { createCipheriv, createDecipheriv, pbkdf2Sync } from 'node:crypto'

import { authConfig } from '#/lib/server/auth/config'

function deriveKeyAndIv(passphrase: string, userSaltBase64: string): { key: Buffer; iv: Buffer } {
    const salt = Buffer.from(userSaltBase64, 'base64')
    const derived = pbkdf2Sync(passphrase, salt, 100_000, 48, 'sha256')

    return {
        key: derived.subarray(0, 32),
        iv: derived.subarray(32, 48),
    }
}

function getCryptoKeyCandidates(primary: string): string[] {
    const candidates = [primary]

    // Compatibility fallback for secrets previously loaded from files ending with a newline.
    if (!primary.endsWith('\n')) {
        candidates.push(`${primary}\n`)
    }

    if (!primary.endsWith('\r\n')) {
        candidates.push(`${primary}\r\n`)
    }

    return [...new Set(candidates)]
}

export function encryptWithUserSalt(plainText: string, userSaltBase64: string): string {
    const { key, iv } = deriveKeyAndIv(authConfig.cryptoBase64Key, userSaltBase64)
    const cipher = createCipheriv('aes-256-cbc', key, iv)

    return Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]).toString('base64')
}

export function decryptWithUserSalt(encryptedTextBase64: string, userSaltBase64: string): string {
    const encryptedBuffer = Buffer.from(encryptedTextBase64, 'base64')
    let lastError: unknown

    for (const keyCandidate of getCryptoKeyCandidates(authConfig.cryptoBase64Key)) {
        try {
            const { key, iv } = deriveKeyAndIv(keyCandidate, userSaltBase64)
            const decipher = createDecipheriv('aes-256-cbc', key, iv)

            return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]).toString(
                'utf8',
            )
        } catch (error) {
            lastError = error
        }
    }

    throw new Error('Unable to decrypt password with configured crypto key.', {
        cause: lastError,
    })
}
