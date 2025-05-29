<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Update the goToAdmin function to only prevent default for left clicks
const goToAdmin = (event) => {
  // Only prevent default behavior for left-clicks (button 0)
  // This allows right-click context menu to work normally
  if (event && event.button === 0) {
    event.preventDefault()
    
    // Navigate only for left clicks
    setTimeout(() => {
      router.push('/admin')
      console.log('Navigating to admin...')
    }, 10)
  }
  // Don't return false to allow context menu
}

const emit = defineEmits(['changeTab'])
const currentTab = ref(0)
const isMobileMenuOpen = ref(false)

const tabs = ref([
  { title: "Tab 1", icon: "🎮" },
  { title: "Tab 2", icon: "🎲" },
  { title: "Tab 3", icon: "🎯" },
  { title: "Tab 4", icon: "🎪" }
])

const selectTab = (index) => {
  currentTab.value = index
  emit('changeTab', index)
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="logo">
        <!-- Comment out the image that's causing problems -->
        <!-- <img src="/images/logo.png" alt="Logo" class="logo-image"> -->
        <!-- Replace with text instead -->
        <span style="font-size: 20px; font-weight: bold; color: white;">Swerte</span>
      </div>
      
      <!-- Add hamburger menu button -->
      <button 
        class="mobile-menu-btn" 
        :class="{ 'is-open': isMobileMenuOpen }"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Update tabs and auth container -->
      <div class="nav-content-wrapper" :class="{ 'is-open': isMobileMenuOpen }">
        <div class="tabs-container">
          <div v-for="(tab, index) in tabs" 
               :key="index" 
               class="nav-item"
               :class="{ 'active': currentTab === index }"
               @click="selectTab(index)">
            <div class="nav-content">
              <span class="nav-icon">{{ tab.icon }}</span>
              <h3>{{ tab.title }}</h3>
            </div>
          </div>
        </div>
        <div class="auth-buttons">
          <button 
            class="auth-btn admin" 
            @click="goToAdmin"
          >Admin</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Add these styles to your <style scoped> section */

.navbar {
  background: linear-gradient(to bottom, #2a2a2a, #222222);
  padding: 0.75rem 1rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  width: 100%;
  backdrop-filter: blur(10px);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1800px;
  margin: 0 auto;
  gap: 1rem;
  padding: 0 2rem; /* Increased padding */
}

.logo {
  display: flex;
  align-items: center;
  padding-left: 0.5rem;
  flex-shrink: 0;
}

.logo-image {
  height: 40px;
  width: auto;
  object-fit: contain;
}

/* Enhanced mobile menu button */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 32px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 100;
  margin-right: 1rem; /* Add margin to move away from edge */
}

.mobile-menu-btn span {
  display: block;
  width: 100%;
  height: 3px;
  background-color: #ffffff;
  border-radius: 3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animated hamburger states */
.mobile-menu-btn.is-open span:nth-child(1) {
  transform: translateY(10.5px) rotate(45deg);
}

.mobile-menu-btn.is-open span:nth-child(2) {
  opacity: 0;
  transform: translateX(-100%);
}

.mobile-menu-btn.is-open span:nth-child(3) {
  transform: translateY(-10.5px) rotate(-45deg);
}

/* Add hover effect for desktop */
@media (hover: hover) {
  .mobile-menu-btn:hover span {
    background-color: rgba(255, 255, 255, 0.8);
  }
}

.nav-content-wrapper {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.tabs-container {
  display: flex;
  gap: 1rem;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-item {
  position: relative;
  cursor: pointer;
  padding: 0.5rem 0.1rem;  /* Reduced padding */

  transition: all 0.3s ease;
  

  min-width: 80px;     /* Changed from 100px to 80px */
  text-align: center;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.15);
  
  
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-icon {
  font-size: 1.1rem;    /* Smaller icon */
  color: #ffffff;  /* Add this line only */
}

.nav-content h3 {
  font-size: 0.85rem;   /* Smaller text */
  font-weight: 500;
  margin: 0;
  color: #ffffff;  /* Add this line only */
}

.auth-buttons {
  display: flex;
  gap: 0.75rem;
}

.auth-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
  text-align: center;
}

/* Large screens (1440px and up) */
@media (min-width: 1440px) {
  .nav-item {
    padding: 0.6rem 1.25rem;
    min-width: 120px;
  }
}

.nav-icon {
  font-size: 1.3rem;
}

.nav-content h3 {
  font-size: 1rem;
}

/* Desktop and laptop */
@media (min-width: 1024px) and (max-width: 1439px) {
  .nav-item {
    padding: 0.75rem 1.25rem;
    min-width: 130px;
  }
}

/* Tablets and smaller laptops */
@media (min-width: 768px) and (max-width: 1023px) {
  .tabs-container {
    gap: 0.75rem;
  }

  .nav-item {
    padding: 0.5rem 0.875rem;
    min-width: 90px;
  }
}

/* Mobile devices */
@media (max-width: 767px) {
  .navbar {
    padding: 0.5rem;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .mobile-menu-btn span {
    transform-origin: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Add visual feedback for active state */
  .mobile-menu-btn:active span {
    background-color: rgba(255, 255, 255, 0.6);
  }

  .nav-content-wrapper {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: #2a2a2a;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  .nav-content-wrapper.is-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-item {
    width: 80%; /* Changed from 100% to 90% */
    padding: 0.875rem;
    min-width: unset;
    display: flex;
    justify-content: center;
    margin: 0 auto; /* Center the tab button */
  }

  .tabs-container {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
    align-items: center; /* Center the container */
  }

  .nav-content {
    width: 100%;
    justify-content: center;
  }

  .nav-icon {
    font-size: 1.2rem;
  }

  .nav-content h3 {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .nav-item {
    padding: 0.75rem;
  }

  .nav-icon {
    font-size: 1.1rem;
  }

  .nav-content h3 {
    font-size: 0.9rem;
  }

  .nav-content {
    gap: 0.5rem;
  }
}

/* Add hover effects only for non-touch devices */
@media (hover: hover) {
  .nav-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}

/* Performance optimizations for mobile */
@media (max-width: 768px) {
  .nav-item {
    transition: background-color 0.3s ease;
    transform: none !important;
  }
}
</style>