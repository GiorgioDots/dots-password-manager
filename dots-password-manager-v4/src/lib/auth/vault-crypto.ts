import { createCipheriv, createDecipheriv, pbkdf2Sync } from 'node:crypto'

import { authConfig } from '#/lib/auth/config'

function deriveKeyAndIv(userSaltBase64: string): { key: Buffer; iv: Buffer } {
  const salt = Buffer.from(userSaltBase64, 'base64')
  const derived = pbkdf2Sync(authConfig.cryptoBase64Key, salt, 100_000, 48, 'sha256')

  return {
    key: derived.subarray(0, 32),
    iv: derived.subarray(32, 48),
  }
}

export function encryptWithUserSalt(plainText: string, userSaltBase64: string): string {
  const { key, iv } = deriveKeyAndIv(userSaltBase64)
  const cipher = createCipheriv('aes-256-cbc', key, iv)

  return Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]).toString(
    'base64',
  )
}

export function decryptWithUserSalt(
  encryptedTextBase64: string,
  userSaltBase64: string,
): string {
  const { key, iv } = deriveKeyAndIv(userSaltBase64)
  const decipher = createDecipheriv('aes-256-cbc', key, iv)

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedTextBase64, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}
