import { createPublicKey, publicEncrypt, constants } from 'node:crypto'

export function getPublicKeyHeader(request: Request): string | null {
    return request.headers.get('x-public-key')
}

export function encryptForClient(
    text: string,
    publicKeyBase64: string | null,
): string {
    if (!publicKeyBase64) {
        return text
    }

    const der = Buffer.from(publicKeyBase64, 'base64')
    const publicKey = createPublicKey({
        key: der,
        type: 'spki',
        format: 'der',
    })

    const encrypted = publicEncrypt(
        {
            key: publicKey,
            padding: constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        Buffer.from(text, 'utf8'),
    )

    return encrypted.toString('base64')
}
