<template>
  <div class="swerte-meter-widget">
    <div class="cards-container">
      <div 
        v-for="(product, index) in products" 
        :key="product.id" 
        class="card"
        :class="getTemperatureClass(product.temperature)"
      >
        <div class="card-image">
          <img :src="product.image" :alt="product.title">
        </div>
        <div class="card-content">
          <h2>{{ product.title }}</h2>
          <div class="temperature-bar">
            <div class="progress" :style="{ width: `${product.temperature}%` }"></div>
          </div>
          <p class="temperature-text">{{ formatTemperature(product.temperature) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { setupImageReflections } from '../utils/reflections'
import { validateApiKey } from '../utils/apiKeyGenerator'

// Widget props
const props = defineProps({
  apiKey: String,
  theme: {
    type: String,
    default: 'dark'
  }
});

// Sample data (would come from API in production)
const products = ref([
  {
    id: 1,
    title: "Lucky Dragons",
    temperature: 85,
    image: "https://via.placeholder.com/400x300/FF5733/ffffff?text=Lucky+Dragons" 
  },
  {
    id: 2,
    title: "Fortune Tiger",
    temperature: 65,
    image: "https://via.placeholder.com/400x300/33FF57/ffffff?text=Fortune+Tiger"
  },
  {
    id: 3,
    title: "Golden Buffalo",
    temperature: 40,
    image: "https://via.placeholder.com/400x300/3357FF/ffffff?text=Golden+Buffalo"
  }
]);

// API Key validation
const isValidKey = ref(true);
const keyData = ref(null);

onMounted(async () => {
  console.log(`Validating API key: ${props.apiKey}`);
  
  // Validate the API key
  const result = validateApiKey(props.apiKey);
  
  if (result) {
    console.log(`Valid API key for: ${result.user}, tier: ${result.tier}`);
    keyData.value = result;
    isValidKey.value = true;
    
    // Fetch data and set up widget
    setupImageReflections();
  } else {
    console.error('Invalid API key provided');
    isValidKey.value = false;
    // Show watermark or error state
  }
});

// Helper methods
function getTemperatureClass(temp) {
  if (temp >= 70) return 'hot-glow';
  if (temp >= 50) return 'medium-glow';
  return 'cold-glow';
}

function formatTemperature(temp) {
  if (temp >= 70) return 'HOT 🔥';
  if (temp >= 50) return 'WARM 🔶';
  return 'COLD ❄️';
}

// Setup reflections
onMounted(() => {
  setTimeout(() => {
    setupImageReflections();
  }, 100);
});

// Expose refresh method
function refreshReflections() {
  setupImageReflections();
}
defineExpose({ refreshReflections });
</script>

<style>
/* Copy your card styles from Home.vue */
.swerte-meter-widget {
  font-family: 'Inter', sans-serif;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.card {
  background-color: #222;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
}

.card-image img {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card-content {
  padding: 16px;
}

.card-content h2 {
  color: #ffffff;
  font-size: 24px;
  margin-bottom: 0.5rem;
}

.temperature-bar {
  height: 8px;
  background-color: #444;
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #3e88f0, #ffba00, #ff0000);
  transition: width 0.5s ease;
}

.temperature-text {
  font-weight: bold;
  color: #ddd;
}

.hot-glow {
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.3);
}

.medium-glow {
  box-shadow: 0 0 15px rgba(255, 186, 0, 0.3);
}

.cold-glow {
  box-shadow: 0 0 15px rgba(62, 136, 240, 0.3);
}
</style>