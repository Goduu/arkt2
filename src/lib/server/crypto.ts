import nodeCrypto from 'node:crypto';
// Shared crypto helpers
// Client: uses WebCrypto (AES-GCM) to encrypt the OpenAI key before persisting to localStorage
// Server: see api route for corresponding decryption using Node's crypto

export type EncryptedBlob = {
    v: 1;
    iv: string; // base64
    ct: string; // base64 (ciphertext || authTag)
  };
  
  // Base64 helpers for ArrayBuffer <-> string
  export function abToB64(buf: ArrayBufferLike): string {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  }
  
  export function b64ToAb(b64: string): ArrayBuffer {
    const binary = typeof atob !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    // Force a real ArrayBuffer copy to satisfy TS when SharedArrayBuffer is present
    const copy = new Uint8Array(bytes.length);
    copy.set(bytes);
    return copy.buffer;
  }
  
  // Minimal SubtleCrypto surface we use
  type MinimalSubtle = {
    digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>;
    importKey(
      format: 'raw',
      keyData: BufferSource,
      algorithm: AlgorithmIdentifier | AesKeyGenParams,
      extractable: boolean,
      keyUsages: KeyUsage[]
    ): Promise<CryptoKey>;
    encrypt(algorithm: AlgorithmIdentifier | AesGcmParams, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer>;
    decrypt(algorithm: AlgorithmIdentifier | AesGcmParams, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer>;
  };

  // Resolve WebCrypto Subtle API (browser or Node)
  async function getSubtle(): Promise<MinimalSubtle> {
    if (typeof globalThis !== 'undefined' && (globalThis as unknown as { crypto?: { subtle?: SubtleCrypto } }).crypto?.subtle) {
      return (globalThis as unknown as { crypto: { subtle: SubtleCrypto } }).crypto.subtle as unknown as MinimalSubtle;
    }
    return nodeCrypto.webcrypto.subtle as unknown as MinimalSubtle;
  }

  function getRandomBytes(length: number): Uint8Array {
    if (typeof globalThis !== 'undefined' && (globalThis as unknown as { crypto?: { getRandomValues?: <T extends ArrayBufferView | null>(a: T) => T } }).crypto?.getRandomValues) {
      return (globalThis as unknown as { crypto: { getRandomValues: <T extends ArrayBufferView | null>(a: T) => T } }).crypto.getRandomValues(new Uint8Array(length));
    }
    return nodeCrypto.webcrypto.getRandomValues(new Uint8Array(length));
  }

  // Derive a 256-bit key from a secret string using SHA-256 (deterministic)
  export async function deriveAesKeyFromSecret(secret: string): Promise<CryptoKey> {
    const subtle = await getSubtle();
    const enc = new TextEncoder();
    const secretBytes = enc.encode(secret);
    const hash = await subtle.digest('SHA-256', secretBytes);
    return subtle.importKey(
      'raw',
      hash,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  export async function encryptStringToBlob(plainText: string, secret: string): Promise<EncryptedBlob> {
    const subtle = await getSubtle();
    const key = await deriveAesKeyFromSecret(secret);
    const iv = getRandomBytes(12);
    const enc = new TextEncoder();
    const data = enc.encode(plainText);
    const ctBuf = await subtle.encrypt({ name: 'AES-GCM', iv: iv as unknown as BufferSource }, key, data);
    return {
      v: 1,
      iv: abToB64(iv.buffer),
      ct: abToB64(ctBuf),
    };
  }
  
  export async function decryptBlobToString(blob: EncryptedBlob, secret: string): Promise<string> {
    const subtle = await getSubtle();
    const key = await deriveAesKeyFromSecret(secret);
    const iv = new Uint8Array(b64ToAb(blob.iv));
    const ct = b64ToAb(blob.ct);
    const ptBuf = await subtle.decrypt({ name: 'AES-GCM', iv: iv as unknown as BufferSource }, key, ct as unknown as BufferSource);
    const dec = new TextDecoder();
    return dec.decode(ptBuf);
  }
  
  
  
export type EncryptedKeyBlob = { v: number; iv: string; ct: string };

export async function decryptOpenAIKey(encKey: EncryptedKeyBlob): Promise<string | null> {
    try {
        if (typeof process.env.OPENAI_KEY_SECRET !== 'string') {
            return null;
        }

        const secretHash = nodeCrypto.createHash('sha256').update(process.env.OPENAI_KEY_SECRET).digest();
        const key = nodeCrypto.createSecretKey(secretHash);
        const iv = Buffer.from(encKey.iv, 'base64');
        const ct = Buffer.from(encKey.ct, 'base64');

        if (ct.length < 16) {
            throw new Error('Ciphertext too short');
        }

        const authTag = ct.subarray(ct.length - 16);
        const data = ct.subarray(0, ct.length - 16);
        const decipher = nodeCrypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
        return decrypted;
    } catch (error) {
        console.error("[server/crypto] Failed to decrypt OpenAI API key:", error);
        return null;
    }
}


