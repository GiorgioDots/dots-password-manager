import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClientCryptoService {
  private keyPair: CryptoKeyPair | null = null;
  private isGenerating = new BehaviorSubject<boolean>(false);

  // Generate the RSA key pair
  generateKeyPair(): Observable<void> {
    return from(
      window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      )
    ).pipe(
      map(keyPair => {
        this.keyPair = keyPair;
      })
    );
  }

  // Export the public key as Base64
  exportPublicKey(): Observable<string> {
    if (!this.keyPair || !this.keyPair.publicKey) {
      return of('');
    }

    return from(
      window.crypto.subtle.exportKey('spki', this.keyPair.publicKey)
    ).pipe(
      map(exportedKey => {
        return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
      })
    );
  }

  // Decrypt the encrypted data using the private key
  decryptData(encryptedData: string): Observable<string> {
    if (!this.keyPair || !this.keyPair.privateKey) {
      throw new Error('Key pair not generated.');
    }

    const encryptedBytes = Uint8Array.from(atob(encryptedData), c =>
      c.charCodeAt(0)
    );
    return from(
      window.crypto.subtle.decrypt(
        {
          name: 'RSA-OAEP',
        },
        this.keyPair.privateKey,
        encryptedBytes
      )
    ).pipe(
      map(decryptedBytes => {
        return new TextDecoder().decode(decryptedBytes);
      })
    );
  }

  async decryptDataAsync(encryptedData: string): Promise<string> {
    if (!this.keyPair || !this.keyPair.privateKey) {
      throw new Error('Key pair not generated.');
    }

    const encryptedBytes = Uint8Array.from(atob(encryptedData), c =>
      c.charCodeAt(0)
    );
    var decryptedBytes = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      this.keyPair.privateKey,
      encryptedBytes
    );

    return new TextDecoder().decode(decryptedBytes);
  }
}
