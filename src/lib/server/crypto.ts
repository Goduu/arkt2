import crypto from 'node:crypto';
// Shared crypto helpers
// Client: uses WebCrypto (AES-GCM) to encrypt the OpenAI key before persisting to localStorage
// Server: see api route for corresponding decryption using Node's crypto

export type EncryptedBlob = {
    v: 1;
    iv: string; // base64
    ct: string; // base64 (ciphertext || authTag)
  };
  
  // Base64 helpers for ArrayBuffer <-> string
  export function abToB64(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  }
  
  export function b64ToAb(b64: string): ArrayBuffer {
    const binary = typeof atob !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }
  
  // Derive a 256-bit key from a secret string using SHA-256 (deterministic)
  export async function deriveAesKeyFromSecret(secret: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const secretBytes = enc.encode(secret);
    const hash = await crypto.subtle.digest('SHA-256', secretBytes);
    return crypto.subtle.importKey(
      'raw',
      hash,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  export async function encryptStringToBlob(plainText: string, secret: string): Promise<EncryptedBlob> {
    const key = await deriveAesKeyFromSecret(secret);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const data = enc.encode(plainText);
    const ctBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
    return {
      v: 1,
      iv: abToB64(iv.buffer),
      ct: abToB64(ctBuf),
    };
  }
  
  export async function decryptBlobToString(blob: EncryptedBlob, secret: string): Promise<string> {
    const key = await deriveAesKeyFromSecret(secret);
    const iv = new Uint8Array(b64ToAb(blob.iv));
    const ct = b64ToAb(blob.ct);
    const ptBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    const dec = new TextDecoder();
    return dec.decode(ptBuf);
  }
  
  
  
export type EncryptedKeyBlob = { v: number; iv: string; ct: string };

export async function decryptOpenAIKey(encKey: EncryptedKeyBlob): Promise<string | null> {
    try {
        if (typeof process.env.OPENAI_KEY_SECRET !== 'string') {
            return null;
        }

        const secretHash = crypto.createHash('sha256').update(process.env.OPENAI_KEY_SECRET).digest();
        const key = crypto.createSecretKey(secretHash);
        const iv = Buffer.from(encKey.iv, 'base64');
        const ct = Buffer.from(encKey.ct, 'base64');

        if (ct.length < 16) {
            throw new Error('Ciphertext too short');
        }

        const authTag = ct.subarray(ct.length - 16);
        const data = ct.subarray(0, ct.length - 16);
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
        return decrypted;
    } catch (error) {
        console.error("[server/crypto] Failed to decrypt OpenAI API key:", error);
        return null;
    }
}


