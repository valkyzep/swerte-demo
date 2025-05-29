// Validate API keys against localStorage
export function validateApiKey(key) {
  const savedKeys = localStorage.getItem('swerteApiKeys');
  if (!savedKeys) return null;
  
  const apiKeys = JSON.parse(savedKeys);
  return apiKeys[key] || null;
}

// For widget use
export function getApiKeyPermissions(key) {
  const keyData = validateApiKey(key);
  if (!keyData) return null;
  
  // Return permissions based on tier
  switch (keyData.tier) {
    case 'premium':
      return {
        refreshInterval: 5000, // 5 seconds
        maxItems: 100,
        analyticsEnabled: true,
        customization: true
      };
    case 'basic':
      return {
        refreshInterval: 30000, // 30 seconds
        maxItems: 30,
        analyticsEnabled: true,
        customization: false
      };
    case 'free':
    default:
      return {
        refreshInterval: 60000, // 1 minute
        maxItems: 10,
        analyticsEnabled: false,
        customization: false
      };
  }
}