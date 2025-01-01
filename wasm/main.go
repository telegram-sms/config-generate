package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"golang.org/x/crypto/pbkdf2"
	"io"
	"syscall/js"
)

const (
	ivLength       = 12
	iterationCount = 65536
	keyLength      = 32
)

func encrypt(data, key string) (string, error) {
	block, err := aes.NewCipher(deriveKey(key))
	if err != nil {
		return "", err
	}

	iv := make([]byte, ivLength)
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}

	aesgcm, err := cipher.NewGCMWithNonceSize(block, ivLength)
	if err != nil {
		return "", err
	}

	ciphertext := aesgcm.Seal(nil, iv, []byte(data), nil)
	result := append(iv, ciphertext...)
	return base64.StdEncoding.EncodeToString(result), nil
}

func decrypt(encryptedData, key string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(encryptedData)
	if err != nil {
		return "", err
	}

	if len(data) < ivLength {
		return "", errors.New("invalid encrypted data")
	}

	iv := data[:ivLength]
	ciphertext := data[ivLength:]

	block, err := aes.NewCipher(deriveKey(key))
	if err != nil {
		return "", err
	}

	aesgcm, err := cipher.NewGCMWithNonceSize(block, ivLength)
	if err != nil {
		return "", err
	}

	plaintext, err := aesgcm.Open(nil, iv, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

func deriveKey(key string) []byte {
	salt := sha256.Sum256([]byte(key))
	return pbkdf2.Key([]byte(key), salt[:], iterationCount, keyLength, sha256.New)
}

func encryptWrapper(this js.Value, p []js.Value) interface{} {
	data := p[0].String()
	key := p[1].String()
	result, err := encrypt(data, key)
	if err != nil {
		return js.ValueOf(map[string]interface{}{
			"error": err.Error(),
		})
	}
	return js.ValueOf(map[string]interface{}{
		"result": result,
	})
}

func decryptWrapper(this js.Value, p []js.Value) interface{} {
	encryptedData := p[0].String()
	key := p[1].String()
	result, err := decrypt(encryptedData, key)
	if err != nil {
		return js.ValueOf(map[string]interface{}{
			"error": err.Error(),
		})
	}
	return js.ValueOf(map[string]interface{}{
		"result": result,
	})
}

func main() {
	js.Global().Set("encrypt", js.FuncOf(encryptWrapper))
	js.Global().Set("decrypt", js.FuncOf(decryptWrapper))
	select {}
}
