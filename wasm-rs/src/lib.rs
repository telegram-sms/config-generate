use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use base64::{decode, encode};
use hmac::Hmac;
use pbkdf2::pbkdf2;
use rand::rngs::OsRng;
use rand::RngCore;
use sha2::{Digest, Sha256};
use wasm_bindgen::prelude::*;

const IV_LENGTH: usize = 12;
const ITERATION_COUNT: u32 = 65536;
const KEY_LENGTH: usize = 32;

#[wasm_bindgen]
pub fn encrypt(data: &str, key: &str) -> Result<String, JsValue> {
    let derived_key: [u8; KEY_LENGTH] = derive_key(key);
    let cipher = Aes256Gcm::new(&derived_key.into());
    let binding = generate_iv();
    let nonce = Nonce::from_slice(&binding);
    let ciphertext = cipher
        .encrypt(nonce, data.as_bytes())
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let mut result = nonce.to_vec();
    result.extend_from_slice(&ciphertext);
    Ok(encode(&result))
}

#[wasm_bindgen]
pub fn decrypt(encrypted_data: &str, key: &str) -> Result<String, JsValue> {
    let data = decode(encrypted_data).map_err(|e| JsValue::from_str(&e.to_string()))?;
    if data.len() < IV_LENGTH {
        return Err(JsValue::from_str("invalid encrypted data"));
    }

    let (nonce, ciphertext) = data.split_at(IV_LENGTH);
    let derived_key: [u8; KEY_LENGTH] = derive_key(key);
    let cipher = Aes256Gcm::new(&derived_key.into());

    let plaintext = cipher
        .decrypt(Nonce::from_slice(nonce), ciphertext)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    Ok(String::from_utf8(plaintext).map_err(|e| JsValue::from_str(&e.to_string()))?)
}

fn derive_key(key: &str) -> [u8; KEY_LENGTH] {
    let salt = Sha256::digest(key.as_bytes());
    let mut derived_key = [0u8; KEY_LENGTH];
    pbkdf2::<Hmac<Sha256>>(key.as_bytes(), &salt, ITERATION_COUNT, &mut derived_key);
    derived_key
}

fn generate_iv() -> [u8; IV_LENGTH] {
    let mut iv = [0u8; IV_LENGTH];
    OsRng.fill_bytes(&mut iv);
    iv
}

#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    Ok(())
}