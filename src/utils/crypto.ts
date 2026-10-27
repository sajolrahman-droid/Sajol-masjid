/**
 * Web Crypto API AES-256-GCM encryption & decryption utilities
 * Zero external dependencies, hardware accelerated, PBKDF2 key derivation.
 */

export interface EncryptedPayload {
  version: number;
  algorithm: string;
  salt: string; // base64
  iv: string; // base64
  ciphertext: string; // base64
  timestamp: string;
  appId: string;
}

// Convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive AES-GCM 256 key from passphrase and salt
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

}

/**
 * Encrypt arbitrary JavaScript data using AES-256-GCM and PBKDF2 key derivation
 */
export async function encryptData(data: unknown, passphrase: string): Promise<string> {
  if (!passphrase || passphrase.trim().length === 0) {
    throw new Error('একটি গোপন পাসকি বা এনক্রিপশন কি (Sync Key) দিন');
  }

  const jsonString = JSON.stringify(data);
  const enc = new TextEncoder();
  const encodedData = enc.encode(jsonString);

  // 16-byte random salt for PBKDF2
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  // 12-byte IV for AES-GCM standard
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(passphrase, salt);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );

  const payload: EncryptedPayload = {
    version: 1,
    algorithm: 'AES-256-GCM',
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(encryptedBuffer),
    timestamp: new Date().toISOString(),
    appId: 'mosque-companion-digital-hisab',
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Decrypt AES-256-GCM encrypted payload back into original JavaScript data
 */
export async function decryptData<T = unknown>(encryptedPayloadString: string, passphrase: string): Promise<T> {
  if (!passphrase || passphrase.trim().length === 0) {
    throw new Error('এনক্রিপশন পাসকি (Passphrase/Sync Key) প্রদান করুন');
  }

  let payload: EncryptedPayload;
  try {
    payload = JSON.parse(encryptedPayloadString);
  } catch {
    throw new Error('অবৈধ ব্যাকআপ ফাইল ফরম্যাট! ফাইলটি সঠিক JSON নয়।');
  }

  if (!payload.ciphertext || !payload.iv || !payload.salt) {
    throw new Error('ফাইলটিতে প্রয়োজনীয় এনক্রিপশন মেটাডাটা (salt/iv/ciphertext) নেই');
  }

  const salt = base64ToBuffer(payload.salt);
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);

  const key = await deriveKey(passphrase, salt);

  let decryptedBuffer: ArrayBuffer;
  try {
    decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      ciphertext as unknown as BufferSource
    );

  } catch {
    throw new Error('ভুল পাসকি অথবা ক্ষতিগ্রস্ত ফাইল! অনুগ্রহ করে সঠিক পাসকি লিখুন।');
  }

  const dec = new TextDecoder();
  const jsonString = dec.decode(decryptedBuffer);
  return JSON.parse(jsonString) as T;
}

/**
 * Generate a cryptographically secure, readable Sync Key
 * Format: MSQ-XXXX-XXXX-XXXX
 */
export function generateSecureSyncKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous 0, O, 1, I
  const randomBytes = window.crypto.getRandomValues(new Uint8Array(12));
  let key = 'MSQ-';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) key += '-';
    key += chars[randomBytes[i] % chars.length];
  }
  return key;
}
