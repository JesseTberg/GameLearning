/**
 * Secure Encryption Utility for API Key Storage
 * Uses Web Crypto API for client-side encryption of sensitive data in sessionStorage.
 */

// A simple internal salt for the application. 
// For production, this should ideally be combined with a user-specific value if available.
const APP_SECRET_BASE = "game-learning-secure-v1-2026";

async function getEncryptionKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(APP_SECRET_BASE),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("session-salt-secure"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binString);
}

function base64ToBytes(base64: string): Uint8Array {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.charCodeAt(0));
}

export async function encryptData(text: string): Promise<string> {
  const key = await getEncryptionKey();
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim()); // Trim before encryption
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  // Combine IV and Encrypted data for storage
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return bytesToBase64(combined);
}

export async function decryptData(base64: string): Promise<string | null> {
  try {
    const key = await getEncryptionKey();
    const combined = base64ToBytes(base64);

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error("Decryption failed:", e);
    return null;
  }
}

/**
 * Convenience functions for the BYOK flow
 */
const STORAGE_KEY_PREFIX = "ENCRYPTED_KEY_";

export const API_KEY_CHANGE_EVENT = "api-key-changed";

export type AiProvider = 'gemini' | 'openai' | 'anthropic';

export async function saveApiKey(provider: AiProvider, key: string): Promise<void> {
  const encrypted = await encryptData(key.trim());
  sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${provider.toUpperCase()}`, encrypted);
  window.dispatchEvent(new CustomEvent(API_KEY_CHANGE_EVENT, { detail: { provider } }));
}

export async function getStoredApiKey(provider: AiProvider = 'gemini'): Promise<string | null> {
  const stored = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${provider.toUpperCase()}`);
  if (!stored) return null;
  return decryptData(stored);
}

export function hasApiKey(provider: AiProvider = 'gemini'): boolean {
  if (typeof window === 'undefined') return false;
  return !!sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${provider.toUpperCase()}`);
}

export function clearApiKey(provider: AiProvider = 'gemini'): void {
  sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${provider.toUpperCase()}`);
  window.dispatchEvent(new CustomEvent(API_KEY_CHANGE_EVENT, { detail: { provider } }));
}
