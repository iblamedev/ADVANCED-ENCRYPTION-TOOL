// Encryption utility functions using Web Crypto API

export interface EncryptedData {
  data: ArrayBuffer;
  iv: ArrayBuffer;
  salt: ArrayBuffer;
  filename: string;
}

export const validatePassword = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 8) return 'weak';
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSymbols].filter(Boolean).length;
  
  if (password.length >= 12 && strength >= 3) return 'strong';
  if (password.length >= 8 && strength >= 2) return 'medium';
  return 'weak';
};

export const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // 100k iterations for security
      hash: 'SHA-256'
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
};

export const encryptFile = async (
  file: File, 
  password: string, 
  progressCallback?: (progress: number) => void
): Promise<ArrayBuffer> => {
  try {
    progressCallback?.(10);
    
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    progressCallback?.(20);
    
    // Derive key from password
    const key = await deriveKey(password, salt);
    
    progressCallback?.(40);
    
    // Read file as array buffer
    const fileBuffer = await file.arrayBuffer();
    
    progressCallback?.(60);
    
    // Prepare metadata
    const encoder = new TextEncoder();
    const filenameBytes = encoder.encode(file.name);
    const metadata = new Uint8Array(4 + filenameBytes.length);
    const view = new DataView(metadata.buffer);
    view.setUint32(0, filenameBytes.length, true);
    metadata.set(filenameBytes, 4);
    
    // Combine metadata and file data
    const dataToEncrypt = new Uint8Array(metadata.length + fileBuffer.byteLength);
    dataToEncrypt.set(metadata, 0);
    dataToEncrypt.set(new Uint8Array(fileBuffer), metadata.length);
    
    progressCallback?.(80);
    
    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      dataToEncrypt
    );
    
    progressCallback?.(90);
    
    // Combine salt, IV, and encrypted data
    const result = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encryptedData), salt.length + iv.length);
    
    progressCallback?.(100);
    
    return result.buffer;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt file');
  }
};

export const decryptFile = async (
  file: File, 
  password: string, 
  progressCallback?: (progress: number) => void
): Promise<{ decryptedData: ArrayBuffer; originalFilename: string }> => {
  try {
    progressCallback?.(10);
    
    // Read the encrypted file
    const encryptedBuffer = await file.arrayBuffer();
    const encryptedArray = new Uint8Array(encryptedBuffer);
    
    progressCallback?.(20);
    
    // Extract salt, IV, and encrypted data
    const salt = encryptedArray.slice(0, 16);
    const iv = encryptedArray.slice(16, 28);
    const encryptedData = encryptedArray.slice(28);
    
    progressCallback?.(40);
    
    // Derive key from password
    const key = await deriveKey(password, salt);
    
    progressCallback?.(60);
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encryptedData
    );
    
    progressCallback?.(80);
    
    // Extract metadata and file data
    const decryptedArray = new Uint8Array(decryptedBuffer);
    const view = new DataView(decryptedBuffer);
    const filenameLength = view.getUint32(0, true);
    
    const decoder = new TextDecoder();
    const originalFilename = decoder.decode(decryptedArray.slice(4, 4 + filenameLength));
    
    const fileData = decryptedArray.slice(4 + filenameLength);
    
    progressCallback?.(100);
    
    return {
      decryptedData: fileData.buffer,
      originalFilename
    };
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt file - please check your password');
  }
};