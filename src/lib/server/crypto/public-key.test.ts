import { constants, generateKeyPairSync, privateDecrypt } from 'node:crypto'
import type { KeyObject } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import { encryptForClient } from '#/lib/server/crypto/public-key'

function exportSpkiBase64(publicKey: KeyObject): string {
    return publicKey.export({ format: 'der', type: 'spki' }).toString('base64')
}

describe('client public key encryption', () => {
    it('encrypts with RSA-OAEP-SHA256 compatible with legacy client flow', () => {
        const { publicKey, privateKey } = generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicExponent: 0x10001,
        })

        const publicKeyBase64 = exportSpkiBase64(publicKey)
        const encryptedBase64 = encryptForClient('secret-value', publicKeyBase64)

        const decrypted = privateDecrypt(
            {
                key: privateKey,
                padding: constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            Buffer.from(encryptedBase64, 'base64'),
        ).toString('utf8')

        expect(decrypted).toBe('secret-value')
    })
})
