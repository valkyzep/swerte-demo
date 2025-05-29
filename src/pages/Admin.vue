<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const products = ref([])
const isAutoUpdate = ref(false)
const updateInterval = ref(5000)
const selectedTab = ref(0)

const updateIntervalUnit = ref('seconds') // seconds, minutes, hours
const updateIntervalValue = ref(5) // Default to 5 seconds

// Load products from localStorage or use default
onMounted(() => {
  const savedProducts = localStorage.getItem('products')
  if (savedProducts) {
    products.value = JSON.parse(savedProducts)
  } else {
    // Initialize with default products
    products.value = Array(4).fill().map(() => 
      Array(16).fill().map((_, i) => ({
        id: `tab${selectedTab.value}-product${i}`,
        title: `Product ${String.fromCharCode(65 + i)}`,
        value: Math.floor(Math.random() * 100),
        desc: '',
        icon: null,
        isAutoUpdate: true
      }))
    )
    saveProducts()
  }

  // Load interval settings
  const savedInterval = localStorage.getItem('updateIntervalSettings')
  if (savedInterval) {
    const settings = JSON.parse(savedInterval)
    updateIntervalValue.value = settings.value
    updateIntervalUnit.value = settings.unit
    updateInterval.value = calculateIntervalInMs(
      updateIntervalValue.value, 
      updateIntervalUnit.value
    )
  }
})

const saveProducts = () => {
  localStorage.setItem('products', JSON.stringify(products.value))
  
  // After saving, update all reflections
  const event = new CustomEvent('image-updated')
  window.dispatchEvent(event)
}

const updateProduct = (tabIndex, productIndex, data) => {
  products.value[tabIndex][productIndex] = {
    ...products.value[tabIndex][productIndex],
    ...data
  }
  saveProducts()
}

const toggleAutoUpdate = (tabIndex, productIndex) => {
  const product = products.value[tabIndex][productIndex]
  product.isAutoUpdate = !product.isAutoUpdate
  saveProducts()
}

const addNewProduct = (tabIndex) => {
  const newProduct = {
    id: `tab${tabIndex}-product${products.value[tabIndex].length}`,
    title: 'New Product',
    value: 50,
    desc: '',
    icon: null,
    isAutoUpdate: false
  }
  products.value[tabIndex].push(newProduct)
  saveProducts()
}

const removeProduct = (tabIndex, productIndex) => {
  products.value[tabIndex].splice(productIndex, 1)
  saveProducts()
}

const removeImage = (tabIndex, productIndex) => {
  const productId = products.value[tabIndex][productIndex].id
  updateProduct(tabIndex, productIndex, { icon: null })
  
  // Use timeout to ensure DOM has updated
  setTimeout(() => {
    const updateEvent = new CustomEvent('image-updated', {
      detail: { cardId: productId }
    })
    window.dispatchEvent(updateEvent)
  }, 300)
}

const goBack = () => {
  router.push('/')
}

const goToApiKeyAdmin = () => {
  router.push('/api-keys');
}

const processImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 512
        
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#2a2a2a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        const scale = Math.max(512 / img.width, 512 / img.height)
        const x = (512 - img.width * scale) / 2
        const y = (512 - img.height * scale) / 2
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
        
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const handleImageUpload = async (event, tabIndex, productIndex) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file')
    return
  }
  
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    alert('Image must be smaller than 5MB')
    return
  }

  try {
    const productId = products.value[tabIndex][productIndex].id
    console.log(`Processing image for ${productId}...`)
    
    const processedImage = await processImage(file)
    
    updateProduct(tabIndex, productIndex, { icon: processedImage })
    console.log(`Updated product with new image: ${productId}`)
    
    const attemptReflectionUpdate = (attempts = 1) => {
      console.log(`Attempting reflection update #${attempts} for ${productId}`)
      
      const updateEvent = new CustomEvent('image-updated', {
        detail: { 
          cardId: productId,
          timestamp: new Date().getTime()
        }
      })
      window.dispatchEvent(updateEvent)
      
      if (attempts < 3) {
        setTimeout(() => attemptReflectionUpdate(attempts + 1), attempts * 500)
      }
    }
    
    setTimeout(() => attemptReflectionUpdate(), 300)
    
  } catch (error) {
    console.error('Error processing image:', error)
    alert('Error processing image. Please try again.')
  }
}

const calculateIntervalInMs = (value, unit) => {
  const val = parseInt(value) || 1
  switch (unit) {
    case 'seconds':
      return val * 1000
    case 'minutes':
      return val * 60 * 1000
    case 'hours':
      return val * 60 * 60 * 1000
    default:
      return 5000
  }
}

const saveIntervalSettings = () => {
  const settings = {
    value: updateIntervalValue.value,
    unit: updateIntervalUnit.value
  }
  localStorage.setItem('updateIntervalSettings', JSON.stringify(settings))
  updateInterval.value = calculateIntervalInMs(
    updateIntervalValue.value,
    updateIntervalUnit.value
  )
}

watch([updateIntervalValue, updateIntervalUnit], () => {
  saveIntervalSettings()
})

const refreshReflections = () => {
  console.log('Manually refreshing all card reflections');
  
  document.querySelectorAll('.custom-reflection').forEach(el => {
    console.log('Removing existing reflection');
    el.remove();
  });
  
  const event = new CustomEvent('force-reflection-update', {
    detail: { 
      timestamp: new Date().getTime(),
      source: 'admin-button'
    }
  });
  
  window.dispatchEvent(event);
  console.log('Force reflection update event dispatched');
  
  setTimeout(() => {
    alert('Reflections have been refreshed!');
  }, 1000);
}
</script>

<template>
  <div class="admin-container">
    <div class="admin-header">
      <button class="back-btn" @click="goBack">← Back to Home</button>
      <h1>Admin Panel</h1>
      <div class="tab-buttons">
        <button 
          v-for="(tab, index) in 4" 
          :key="index"
          :class="{ active: selectedTab === index }"
          @click="selectedTab = index"
        >
          Tab {{ index + 1 }}
        </button>
      </div>
    </div>

    <div class="admin-controls" style="margin: 20px 0; text-align: center; display: flex; justify-content: center; gap: 20px;">
      <button 
        @click="refreshReflections" 
        class="refresh-button"
        style="background: linear-gradient(45deg, #4a90e2, #845ec2); 
               color: white; 
               border: none; 
               border-radius: 5px; 
               padding: 10px 15px; 
               font-weight: bold;
               cursor: pointer;
               box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
        <span style="margin-right: 8px;">✨</span>
        Refresh Card Reflections
      </button>
      
      <!-- API Key Management Button -->
      <button 
        @click="goToApiKeyAdmin" 
        class="api-button"
        style="background: linear-gradient(45deg, #ff9a9e, #fad0c4); 
               color: #333; 
               border: none; 
               border-radius: 5px; 
               padding: 10px 15px; 
               font-weight: bold;
               cursor: pointer;
               box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
        <span style="margin-right: 8px;">🔑</span>
        API Key Management
      </button>
    </div>

    <div class="update-interval-settings">
      <h3>Auto Update Interval</h3>
      <div class="interval-controls">
        <input 
          type="number" 
          v-model="updateIntervalValue"
          min="1"
          max="1000"
          class="interval-input"
        >
        <select v-model="updateIntervalUnit" class="interval-select">
          <option value="seconds">Seconds</option>
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
        </select>
        <div class="interval-display">
          Current interval: {{ updateIntervalValue }} {{ updateIntervalUnit }}
        </div>
      </div>
    </div>

    <div class="products-grid">
      <div v-for="(product, index) in products[selectedTab]" 
           :key="product.id" 
           class="product-card">
        <div class="product-header">
          <input 
            v-model="product.title" 
            @change="updateProduct(selectedTab, index, { title: product.title })"
          >
          <button @click="removeProduct(selectedTab, index)" class="remove-btn">✖</button>
        </div>

        <div class="image-upload-section">
          <h3 class="section-title">Product Image</h3>
          <div class="image-preview-container">
            <div class="image-preview" :class="{ 'has-image': product.icon }">
              <img 
                v-if="product.icon && product.icon.startsWith('data:')" 
                :src="product.icon" 
                alt="Product thumbnail"
                class="preview-image"
              />
              <div v-else class="upload-placeholder">
                <i class="fas fa-image"></i>
                <span>Click to add image</span>
              </div>
            </div>
            <div class="image-actions">
              <label class="action-btn upload-btn" title="Upload new image">
                <span>Upload</span>
                <input 
                  type="file"
                  accept="image/*"
                  @change="(e) => handleImageUpload(e, selectedTab, index)"
                  class="file-input"
                >
              </label>
              <button 
                v-if="product.icon"
                @click="removeImage(selectedTab, index)" 
                class="action-btn remove-btn"
                title="Remove current image"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <div class="product-controls">
          <div class="value-control">
            <input 
              type="number" 
              v-model="product.value"
              min="0"
              max="100"
              @change="updateProduct(selectedTab, index, { value: product.value })"
            >
            <div class="auto-update">
              <div class="switch-container">
                <label class="switch">
                  <input 
                    type="checkbox"
                    :checked="product.isAutoUpdate"
                    @change="toggleAutoUpdate(selectedTab, index)"
                  >
                  <span class="slider"></span>
                </label>
                <span class="switch-label">Auto Update</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button class="add-product" @click="addNewProduct(selectedTab)">
        + Add Product
      </button>
    </div>
  </div>
</template>

<style scoped>
.back-btn {
  position: absolute;
  top: 2rem;
  left: 2rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #333 0%, #444 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  transform: translateX(-5px);
  background: linear-gradient(45deg, #ff6b6b 0%, #ffd93d 100%);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.admin-container {
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  min-height: 100vh;
  color: white;
}

.admin-header {
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
}

.admin-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(255, 107, 107, 0.2);
}

.tab-buttons {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  justify-content: center;
  padding: 1rem;
}

.tab-buttons button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #333 0%, #444 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.tab-buttons button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tab-buttons button.active {
  background: linear-gradient(45deg, #ff6b6b 0%, #ffd93d 100%);
  color: #1a1a1a;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.product-card {
  background: rgba(42, 42, 42, 0.8);
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.product-header input {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 500;
}

.product-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input {
  background: rgba(51, 51, 51, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
  outline: none;
}

.remove-btn {
  background: linear-gradient(45deg, #ff4444 0%, #ff6b6b 100%);
  border: none;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(255, 68, 68, 0.4);
}

.add-product {
  background: linear-gradient(45deg, #444 0%, #555 100%);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  cursor: pointer;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.add-product:hover {
  background: linear-gradient(45deg, #ff6b6b 0%, #ffd93d 100%);
  border-color: transparent;
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.value-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(51, 51, 51, 0.4);
  padding: 1rem;
  border-radius: 8px;
}

.auto-update {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0;
  padding: 0.5rem;
  background-color: transparent;
}

.switch-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.switch {
  position: relative;
  width: 90px;
  height: 40px;
}

.switch input {
  display: none;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s ease;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "😵";
  display: flex;
  align-items: center;
  justify-content: center;
  height: 39px;
  width: 36px;
  left: 1px;
  bottom: 0px;
  background: transparent;
  transition: all 0.4s ease;
  border-radius: 50%;
  font-size: 25px;
}

input:checked + .slider {
  border-color: #ff6b6b;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
}

input:checked + .slider:before {
  content: "😏";
  transform: translateX(33px) rotate(360deg);
  background: transparent;
}

@keyframes slideOn {
  0% { transform: translateX(0) rotate(0); }
  100% { transform: translateX(33px) rotate(360deg); }
}

@keyframes slideOff {
  0% { transform: translateX(33px) rotate(360deg); }
  100% { transform: translateX(0) rotate(0); }
}

input:checked + .slider:before {
  animation: slideOn 0.4s ease forwards;
}

input:not(:checked) + .slider:before {
  animation: slideOff 0.4s ease forwards;
}

.switch-label {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

input:checked ~ .switch-label {
  background: linear-gradient(45deg, #ff6b6b 0%, #ffd93d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.thumbnail-preview {
  width: 128px;
  height: 128px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(51, 51, 51, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 1rem;
}

.image-upload-section {
  background: rgba(51, 51, 51, 0.4);
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.image-preview {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(30, 30, 30, 0.6);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.image-preview.has-image {
  border-style: solid;
  border-color: rgba(255, 107, 107, 0.5);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.5);
}

.upload-placeholder i {
  font-size: 2rem;
}

.image-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
  margin-top: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  color: white;
  text-align: center;
}

.upload-btn {
  background: linear-gradient(45deg, #2196f3, #4CAF50);
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.remove-btn {
  background: linear-gradient(45deg, #ff4444, #ff6b6b);
}

.remove-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
}

.file-input {
  display: none;
}

@media (max-width: 768px) {
  .action-btn {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .image-actions {
    max-width: 100%;
  }
}

@media (min-width: 1024px) {
  .image-preview:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
}

.update-interval-settings {
  max-width: 600px;
  margin: 0 auto 2rem auto;
  background: rgba(42, 42, 42, 0.8);
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.update-interval-settings h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #ff6b6b;
}

.interval-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.interval-input {
  width: 100px;
  padding: 0.75rem;
  background: rgba(51, 51, 51, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
}

.interval-select {
  padding: 0.75rem;
  background: rgba(51, 51, 51, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
  min-width: 120px;
}

.interval-display {
  background: rgba(51, 51, 51, 0.4);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-left: auto;
  font-size: 0.9rem;
  color: #ff6b6b;
}

@media (max-width: 768px) {
  .interval-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .interval-display {
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  input, select, .action-btn {
    font-size: 16px;
  }
  
  .product-header {
    flex-direction: column;
  }
  
  .product-header input {
    width: 100%;
  }
  
  .product-header .remove-btn {
    align-self: flex-end;
  }
  
  .value-control {
    flex-direction: column;
    align-items: stretch;
  }
  
  .image-preview {
    width: 150px;
    height: 150px;
  }
  
  .interval-input, .interval-select {
    width: 100%;
  }
}

@media (max-width: 360px) {
  .image-preview {
    width: 120px;
    height: 120px;
  }
  
  .image-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}

.update-interval-settings {
  max-width: 100%;
}

@media (max-width: 640px) {
  .interval-controls {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .interval-input, .interval-select {
    width: 100%;
  }
  
  .interval-display {
    width: 100%;
    text-align: center;
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  .switch {
    width: 70px;
    height: 34px;
  }
  
  .slider:before {
    height: 32px;
    width: 32px;
    font-size: 18px;
  }
  
  input:checked + .slider:before {
    transform: translateX(36px) rotate(360deg);
  }
  
  .switch-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .product-card {
    font-size: 14px;
  }
  
  .section-title {
    font-size: 16px;
  }
  
  .update-interval-settings h3 {
    font-size: 16px;
  }
  
  .add-product {
    font-size: 16px;
    padding: 1.5rem;
    min-height: 100px;
  }
}

@media (max-width: 320px) {
  .admin-container {
    padding: 0.75rem;
  }
  
  .admin-header h1 {
    font-size: 1.25rem;
  }
  
  .tab-buttons button {
    font-size: 0.75rem;
    padding: 0.4rem;
  }
}

.refresh-button:hover {
  background: linear-gradient(45deg, #3a80d2, #744eb2);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.3);
  transition: all 0.2s ease;
}

.refresh-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
</style>