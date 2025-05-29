<!-- src/pages/ApiKeyAdmin.vue -->
<template>
  <div class="admin-panel">
    <button @click="goBackToAdmin" class="back-btn">
      ← Back to Admin Panel
    </button>
    
    <h1>API Key Management</h1>
    
    <div class="key-generator card">
      <h2>Generate New API Key</h2>
      <div class="form-grid">
        <div class="form-group">
          <label>User/Client Name</label>
          <input v-model="newUser.name" type="text" placeholder="Enter client name">
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input v-model="newUser.email" type="email" placeholder="Enter client email">
        </div>
        
        <div class="form-group">
          <label>Website URL</label>
          <input v-model="newUser.website" type="url" placeholder="Enter client website">
        </div>
        
        <div class="form-group">
          <label>Tier</label>
          <select v-model="newUser.tier">
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>
      
      <button @click="generateKey" class="generate-btn">Generate API Key</button>
    </div>
    
    <div v-if="generatedKey" class="key-display card">
      <h3>New API Key Generated</h3>
      <div class="key-box">
        <span>{{ generatedKey }}</span>
        <button @click="copyKey" class="copy-btn">Copy</button>
      </div>
      <p class="key-notice">Share this key with your client. This key won't be shown again.</p>
    </div>
    
    <h2>Existing API Keys</h2>
    <div class="key-list">
      <div v-for="(data, key) in apiKeys" :key="key" class="key-item card">
        <div class="key-info">
          <div class="key-header">
            <div class="key-user">{{ data.user }}</div>
            <div class="key-tier" :class="data.tier">{{ data.tier }}</div>
          </div>
          <div class="key-value">{{ key }}</div>
          <div class="key-meta">
            <span class="key-email">{{ data.email }}</span>
            <span class="key-website">{{ data.website }}</span>
            <span class="key-date">Created: {{ formatDate(data.created) }}</span>
          </div>
        </div>
        <div class="key-actions">
          <button @click="revokeKey(key)" class="revoke-btn">Revoke</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const newUser = ref({
  name: '',
  email: '',
  website: '',
  tier: 'free'
});

const generatedKey = ref('');
const apiKeys = ref({});

// Generate a unique API key
function generateApiKey(prefix = 'swerte') {
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

// Load saved API keys on mount
onMounted(() => {
  const savedKeys = localStorage.getItem('swerteApiKeys');
  if (savedKeys) {
    apiKeys.value = JSON.parse(savedKeys);
  } else {
    // Add some default keys for demonstration
    apiKeys.value = {
      'swerte_demo': { user: 'Demo User', email: 'demo@example.com', website: 'example.com', created: new Date().toISOString(), tier: 'free' },
      'swerte_test': { user: 'Test Account', email: 'test@example.com', website: 'test.com', created: new Date().toISOString(), tier: 'basic' }
    };
    saveApiKeys();
  }
});

// Save API keys to localStorage
function saveApiKeys() {
  localStorage.setItem('swerteApiKeys', JSON.stringify(apiKeys.value));
}

// Generate a new API key
function generateKey() {
  if (!newUser.value.name || !newUser.value.email) {
    alert('Please enter client name and email');
    return;
  }
  
  // Generate a new unique key
  const key = generateApiKey();
  
  // Register the key with user data
  apiKeys.value[key] = {
    user: newUser.value.name,
    email: newUser.value.email,
    website: newUser.value.website || '',
    created: new Date().toISOString(),
    tier: newUser.value.tier
  };
  
  // Save keys
  saveApiKeys();
  
  // Show the generated key
  generatedKey.value = key;
  
  // Reset form
  newUser.value = { name: '', email: '', website: '', tier: 'free' };
}

// Format date to a readable string
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Copy key to clipboard
function copyKey() {
  navigator.clipboard.writeText(generatedKey.value);
  alert('API key copied to clipboard!');
}

// Revoke an API key
function revokeKey(key) {
  if (confirm(`Are you sure you want to revoke API key for ${apiKeys.value[key].user}?`)) {
    delete apiKeys.value[key];
    saveApiKeys();
  }
}

// Back to admin panel
function goBackToAdmin() {
  router.push('/admin');
}
</script>

<style scoped>
.admin-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 30px;
  color: white;
  background: #1a1a1a;
  min-height: 100vh;
}

.back-btn {
  padding: 12px 22px;
  margin-bottom: 35px;
  background: #333;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.back-btn:hover {
  background: #444;
}

h1 {
  font-size: 2.2rem;
  margin-bottom: 2.5rem;
  color: white;
  font-weight: 600;
}

h2 {
  margin-top: 40px;
  margin-bottom: 25px;
  font-size: 1.6rem;
  color: white;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 15px;
}

h3 {
  font-size: 1.4rem;
  color: white;
  margin-bottom: 20px;
  font-weight: 500;
}

.card {
  background: #262626;
  border-radius: 8px;
  border: 1px solid #333;
  padding: 35px;
  margin-bottom: 30px;
}

/* Horizontal form layout with MORE SPACING */
.form-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;  /* Increased spacing between form elements */
  margin-bottom: 40px;
}

.form-group {
  flex: 1;
  min-width: 280px; /* Increased from 250px */
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 12px;
  font-weight: 500;
  color: #ddd;
  font-size: 16px;
  letter-spacing: 0.3px;
}

/* Improved input styling with better padding and taller height */
input, select {
  width: 100%;
  padding: 16px 18px;  /* Increased padding */
  border: 1px solid #444;
  background: #333;
  color: white;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  height: 56px; /* Taller height for better readability */
  letter-spacing: 0.5px; /* Better letter spacing */
}

/* Better placeholder styling */
::placeholder {
  color: #888;
  opacity: 0.7;
  letter-spacing: 0.5px;
  font-size: 15px;
}

input:focus, select:focus {
  border-color: #2196F3;
  outline: none;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

/* More spacing for buttons */
.generate-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 16px 32px;  /* Larger padding */
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  font-size: 16px;
  min-width: 220px;
  margin: 25px auto 0;  /* More top margin */
  display: block;
}

.generate-btn:hover {
  background: #1976D2;
}

.key-display {
  background: #262626;
  padding: 35px;  /* More padding */
  border-radius: 8px;
  margin: 40px 0;  /* More margin */
  border-left: 4px solid #2196F3;
}

.key-box {
  background: #1a1a1a;
  padding: 22px;  /* More padding */
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  margin: 20px 0;  /* More margin */
  display: flex;
  justify-content: space-between;
  align-items: center;
  word-break: break-all;
  border: 1px solid #333;
  letter-spacing: 1px;  /* Better letter spacing for code */
  font-size: 16px;
  line-height: 1.6;
}

.key-notice {
  color: #aaa;
  font-style: italic;
  margin-top: 20px;
  text-align: center;
  font-size: 15px;
  letter-spacing: 0.3px;
}

.copy-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  margin-left: 25px; /* More space to separate from text */
  font-weight: 500;
  transition: background 0.2s;
  flex-shrink: 0;
}

.copy-btn:hover {
  background: #1976D2;
}

/* Horizontal key list with MORE SPACING */
.key-list {
  display: grid;
  gap: 30px; /* More gap between items */
  grid-template-columns: repeat(auto-fill, minmax(580px, 1fr)); /* Slightly wider */
}

/* Improved horizontal key items with more padding */
.key-item {
  padding: 30px; /* More padding */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 30px; /* More gap between sections */
}

.key-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  width: 100%;
}

.key-info {
  flex: 1;
  min-width: 0; /* Prevents overflow issues */
}

.key-value {
  font-family: monospace;
  font-size: 16px;
  margin: 16px 0;
  padding: 16px 20px; /* More padding */
  background: #1a1a1a;
  border-radius: 6px;
  word-break: break-all;
  border: 1px solid #333;
  line-height: 1.6;
  letter-spacing: 0.8px;
}

.key-user {
  font-weight: 600;
  font-size: 19px;
  color: #fff;
  margin-bottom: 8px;
}

.key-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 25px; /* More gap */
  margin-top: 16px;
  font-size: 15px;
  color: #bbb;
}

.key-email, .key-website, .key-date {
  display: inline-flex;
  align-items: center;
  margin-right: 15px;
  letter-spacing: 0.3px;
}

.key-email::before {
  content: "📧";
  margin-right: 10px;
  font-size: 18px;
}

.key-website::before {
  content: "🌐";
  margin-right: 10px;
  font-size: 18px;
}

.key-date::before {
  content: "🗓️";
  margin-right: 10px;
  font-size: 18px;
}

.key-tier {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.key-tier.free {
  background: #424242;
  color: white;
}

.key-tier.basic {
  background: #2196F3;
  color: white;
}

.key-tier.premium {
  background: #FFC107;
  color: black;
}

.key-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.revoke-btn {
  background: transparent;
  color: #F44336;
  border: 1px solid #F44336;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.revoke-btn:hover {
  background: #F44336;
  color: white;
}

/* Enhanced responsiveness with BETTER SPACING */
@media (max-width: 992px) {
  .key-list {
    grid-template-columns: 1fr;
  }
  
  .form-group {
    min-width: 240px;
  }
  
  .card {
    padding: 30px;
  }
}

@media (max-width: 768px) {
  .admin-panel {
    padding: 30px 20px;
  }
  
  .form-grid {
    flex-direction: column;
    gap: 25px;
  }
  
  .form-group {
    min-width: 100%;
    margin-bottom: 15px;
  }
  
  .key-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .key-info {
    margin-bottom: 25px;
  }
  
  .key-actions {
    justify-content: flex-end;
  }
  
  .generate-btn {
    width: 100%;
    margin-top: 15px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.8rem;
    text-align: center;
  }
  
  h2 {
    font-size: 1.4rem;
  }
  
  .card {
    padding: 25px;
  }
  
  .key-box {
    flex-direction: column;
    align-items: stretch;
  }
  
  .copy-btn {
    margin: 20px 0 0 0;
    width: 100%;
    padding: 14px;
  }
  
  input, select {
    height: 52px;
    font-size: 15px;
  }
}
</style>