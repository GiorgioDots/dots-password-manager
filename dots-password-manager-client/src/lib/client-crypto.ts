import { SavedPassword } from "./models/saved-password";

class ClientCryptoService {
    private keyPair: CryptoKeyPair | null = null;

    // Generate the RSA key pair
    async generateKeyPair(): Promise<void> {
        this.keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"]
        );
    }

    // Export the public key as Base64
    async exportPublicKey(): Promise<string> {
        if (!this.keyPair || !this.keyPair.publicKey) return "";

        const key = await window.crypto.subtle.exportKey(
            "spki",
            this.keyPair.publicKey
        );
        return btoa(String.fromCharCode(...new Uint8Array(key)));
    }

    async decryptDataAsync(encryptedData: string): Promise<string> {
        if (!this.keyPair || !this.keyPair.privateKey) {
            throw new Error("Key pair not generated.");
        }

        const encryptedBytes = Uint8Array.from(atob(encryptedData), (c) =>
            c.charCodeAt(0)
        );
        const decryptedBytes = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
            },
            this.keyPair.privateKey,
            encryptedBytes
        );

        return new TextDecoder().decode(decryptedBytes);
    }

    async decryptPasswords(data: SavedPassword[]) {
        const ret = data.map(async (pwd) => {
            pwd.Login = await this.decryptDataAsync(pwd.Login!);
            pwd.Password = await this.decryptDataAsync(pwd.Password!);
            if (pwd.SecondLogin) {
                pwd.SecondLogin = await this.decryptDataAsync(pwd.SecondLogin);
            }
            return pwd;
        });
        return Promise.all(ret);
    }
}

export default new ClientCryptoService();
