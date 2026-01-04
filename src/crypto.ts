import nacl from 'tweetnacl';

const KEY_SIZE = 32;
const NONCE_SIZE = 24;

/**
 * Derives a 32-byte key from a password string using double SHA-256 hash.
 *
 * Derivation Method:
 * 1. SHA-256(keyString) → firstHash
 * 2. SHA-256(firstHash + keyString) → key (32 bytes)
 */
async function getKeyFromString(keyString: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(keyString);

    // First hash: SHA-256(keyString)
    const firstHashBuffer = await crypto.subtle.digest('SHA-256', keyBytes);
    const firstHash = new Uint8Array(firstHashBuffer);

    // Combine firstHash + keyString
    const combined = new Uint8Array(firstHash.length + keyBytes.length);
    combined.set(firstHash);
    combined.set(keyBytes, firstHash.length);

    // Second hash: SHA-256(firstHash + keyString)
    const keyBuffer = await crypto.subtle.digest('SHA-256', combined);
    return new Uint8Array(keyBuffer).slice(0, KEY_SIZE);
}

/**
 * Encrypts a string using NaCl SecretBox (XSalsa20-Poly1305).
 *
 * Data Format:
 * +------------------+------------------------+
 * |      Nonce       |       Ciphertext       |
 * |    (24 bytes)    |   (plaintext + MAC)    |
 * +------------------+------------------------+
 *
 * The final output is a Base64-encoded string.
 */
export async function encrypt(data: string, password: string): Promise<string> {
    const key = await getKeyFromString(password);
    const nonce = nacl.randomBytes(NONCE_SIZE);
    const messageUint8 = new TextEncoder().encode(data);
    const ciphertext = nacl.secretbox(messageUint8, nonce, key);

    // Combine nonce + ciphertext
    const result = new Uint8Array(nonce.length + ciphertext.length);
    result.set(nonce);
    result.set(ciphertext, nonce.length);

    // Base64 encode
    return btoa(String.fromCharCode(...result));
}

/**
 * Decrypts encrypted data using NaCl SecretBox (XSalsa20-Poly1305).
 *
 * @throws Error if decryption fails (wrong key or tampered data)
 */
export async function decrypt(encryptedData: string, password: string): Promise<string> {
    const key = await getKeyFromString(password);

    // Base64 decode
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    if (combined.length < NONCE_SIZE) {
        throw new Error('Invalid encrypted data');
    }

    const nonce = combined.slice(0, NONCE_SIZE);
    const ciphertext = combined.slice(NONCE_SIZE);

    const decrypted = nacl.secretbox.open(ciphertext, nonce, key);
    if (!decrypted) {
        throw new Error('Decryption failed');
    }

    return new TextDecoder().decode(decrypted);
}

