class AES {
    private static readonly ALGORITHM = 'AES-GCM';
    private static readonly IV_LENGTH_BYTE = 12;
    private static readonly TAG_LENGTH_BIT = 128;
    private static readonly ITERATION_COUNT = 65536;
    private static readonly KEY_LENGTH_BIT = 256;

    static async encrypt(data: string, key: CryptoKey): Promise<string> {
        const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH_BYTE));
        const encoder = new TextEncoder();
        const encrypted = await crypto.subtle.encrypt(
            {
                name: this.ALGORITHM,
                iv: iv,
                tagLength: this.TAG_LENGTH_BIT,
            },
            key,
            encoder.encode(data)
        );
        const encryptedArray = new Uint8Array(encrypted);
        const result = new Uint8Array(iv.length + encryptedArray.length);
        result.set(iv);
        result.set(encryptedArray, iv.length);
        return btoa(String.fromCharCode(...result));
    }

    static async decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
        const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        const iv = encryptedBuffer.slice(0, this.IV_LENGTH_BYTE);
        const encryptedText = encryptedBuffer.slice(this.IV_LENGTH_BYTE);
        const decrypted = await crypto.subtle.decrypt(
            {
                name: this.ALGORITHM,
                iv: iv,
                tagLength: this.TAG_LENGTH_BIT,
            },
            key,
            encryptedText
        );
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }

    static async getKeyFromString(keyString: string): Promise<CryptoKey> {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(keyString),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode('salt'),
                iterations: this.ITERATION_COUNT,
                hash: 'SHA-256',
            },
            keyMaterial,
            { name: this.ALGORITHM, length: this.KEY_LENGTH_BIT },
            true,
            ['encrypt', 'decrypt']
        );
        return key;
    }
}

export default AES;