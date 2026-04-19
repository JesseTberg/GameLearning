/**
 * Secure Encryption Utility for API Key Storage
 * * Strategy: Volatile Session Entropy
 * 1. A random 256-bit entropy buffer is generated in RAM on app load.
 * 2. This buffer is used as the 'seed' for PBKDF2 key derivation.
 * 3. AES-GCM 256-bit encryption secures the API key in sessionStorage.
 * * Result: If the tab is closed or a hard refresh occurs, the entropy is wiped,
 * making the sessionStorage data mathematically undecipherable.
 */

let sessionEntropy: Uint8Array | null = null;


function getSessionEntropy(): Uint8Array {
  if (!sessionEntropy) {
    sessionEntropy = crypto.getRandomValues(new Uint8Array(32));
  }
  return sessionEntropy;
}

async function getEncryptionKey(): Promise<CryptoKey> {
  const entropy = getSessionEntropy();
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    entropy.buffer as ArrayBuffer, 
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("game-learning-v1-salt").buffer as ArrayBuffer, 
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
  const data = encoder.encode(text.trim());
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  // Pack IV + Encrypted Data together
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
    // Decryption will fail if the session was reset or data was tampered with
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
  
  const decrypted = await decryptData(stored);
  if (!decrypted) {
    // If decryption fails, the session is invalid; clear the stale data
    sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${provider.toUpperCase()}`);
    return null;
  }
  return decrypted;
}

export function hasApiKey(provider: AiProvider = 'gemini'): boolean {
  if (typeof window === 'undefined') return false;
  return !!sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${provider.toUpperCase()}`);
}

export function clearApiKey(provider: AiProvider = 'gemini'): void {
  sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${provider.toUpperCase()}`);
  window.dispatchEvent(new CustomEvent(API_KEY_CHANGE_EVENT, { detail: { provider } }));
}