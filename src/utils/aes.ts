const ALGORITHM = 'AES-GCM';
const TAG_LENGTH = 16;
const IV_LENGTH = 12;

async function generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
        {
            name: ALGORITHM,
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );
}

async function encrypt(data: string, key: CryptoKey): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encodedData = new TextEncoder().encode(data);
    const encrypted = await crypto.subtle.encrypt(
        {
            name: ALGORITHM,
            iv: iv,
            tagLength: TAG_LENGTH * 8,
        },
        key,
        encodedData
    );
    const buffer = new Uint8Array(iv.length + encrypted.byteLength);
    buffer.set(iv);
    buffer.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...buffer));
}

async function decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
    const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = data.slice(0, IV_LENGTH);
    const encrypted = data.slice(IV_LENGTH);
    const decrypted = await crypto.subtle.decrypt(
        {
            name: ALGORITHM,
            iv: iv,
            tagLength: TAG_LENGTH * 8,
        },
        key,
        encrypted
    );
    return new TextDecoder().decode(decrypted);
}

async function keyToString(key: CryptoKey): Promise<string> {
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
}

async function getKeyFromString(keyString: string): Promise<CryptoKey> {
    const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
    return crypto.subtle.importKey(
        'raw',
        keyData,
        {
            name: ALGORITHM,
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );
}

export {
    generateKey,
    encrypt,
    decrypt,
    keyToString,
    getKeyFromString
};