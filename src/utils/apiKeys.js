// Sample pre-defined API keys (in production, store these securely)
const validApiKeys = {
  "swerte-demo-key": { user: "demo", permissions: ["read"] },
  "swerte-admin-key": { user: "admin", permissions: ["read", "write"] }
};

export function validateApiKey(key) {
  return validApiKeys[key] || null;
}