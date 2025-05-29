// src/utils/apiKeyGenerator.js
export function generateApiKey(prefix = 'swerte') {
  // Create random bytes
  const randomBytes = new Uint8Array(16);
  window.crypto.getRandomValues(randomBytes);
  
  // Convert to hex string
  const hexString = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Format as API key with prefix
  return `${prefix}_${hexString}`;
}

// Use localStorage for key validation, just like ApiKeyAdmin
export function validateApiKey(key) {
  try {
    // Get keys from localStorage (same as ApiKeyAdmin)
    const savedKeys = localStorage.getItem('swerteApiKeys');
    if (!savedKeys) return null;
    
    const apiKeys = JSON.parse(savedKeys);
    return apiKeys[key] || null;
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
  }
}