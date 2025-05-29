<template>
  <div class="app-wrapper">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { 
  IMAGE_UPDATED_EVENT,
  setupImageReflections, 
  handleImageUpdateEvent, 
  handleForceReflectionUpdate, 
  handlePageRefresh 
} from './utils/reflections'

// Get router to detect navigation
const router = useRouter()

// Add this to your router logic to track transitions
router.beforeEach((to, from) => {
  // Mark as transitioning
  document.querySelector('.app-wrapper')?.classList.add('transitioning');
});

router.afterEach(() => {
  // After navigation completes, remove transitioning class after animations finish
  setTimeout(() => {
    document.querySelector('.app-wrapper')?.classList.remove('transitioning');
  }, 600);
});

// Setup reflections whenever the route changes
onMounted(() => {
  // Initial setup
  nextTick(() => {
    console.log("Initial setup of image reflections")
    setupImageReflections()
    
    // Listen for custom image update events
    window.addEventListener(IMAGE_UPDATED_EVENT, handleImageUpdateEvent)
    
    // Listen for forced reflection updates
    window.addEventListener('force-reflection-update', handleForceReflectionUpdate)
    
    // Add page load/refresh handler
    window.addEventListener('load', handlePageRefresh)
    
    // If the page is already loaded (which can happen), also trigger the refresh handler
    if (document.readyState === 'complete') {
      console.log("Page already loaded, triggering refresh handler")
      handlePageRefresh()
    }
  })
})

// Clean up the event listeners when unmounting
onUnmounted(() => {
  window.removeEventListener(IMAGE_UPDATED_EVENT, handleImageUpdateEvent)
  window.removeEventListener('force-reflection-update', handleForceReflectionUpdate)
  window.removeEventListener('load', handlePageRefresh)
})
</script>

<style>
/* Global styles to ensure no margins */
html, 
body {
  margin: 0 !important;
  padding: 0 !important;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  background-color: #1a1a1a;
  color: #ffffff;
}

.app-wrapper {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
}

/* Remove default margins from router-view */
:deep(router-view) {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

/* Global glass card styles with enhanced gradients */
.card {
  background: rgba(42, 42, 42, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  position: relative !important;
  padding: 16px !important;
}

/* Fallback for browsers that don't support backdrop-filter */
@supports not (backdrop-filter: blur(10px)) {
  .card {
    background: rgba(42, 42, 42, 0.8) !important;
  }
}

/* Reduce box shadow intensity for badges */
.card:has(.status-badge.hot) {
  border-color: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 4px 24px 0 rgba(255, 0, 0, 0.08), inset 0 0 32px rgba(255, 0, 0, 0.02) !important;
  background: rgba(42, 42, 42, 0.2) !important;
}

.card:has(.status-badge.warning) {
  border-color: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 4px 24px 0 rgba(255, 186, 0, 0.08), inset 0 0 32px rgba(255, 186, 0, 0.02) !important;
  background: rgba(42, 42, 42, 0.2) !important;
}

.card:has(.status-badge.cold) {
  border-color: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 4px 24px 0 rgba(62, 136, 240, 0.08), inset 0 0 32px rgba(62, 136, 240, 0.02) !important;
  background: rgba(42, 42, 42, 0.2) !important;
}

/* Reduce intensity of upper right badge reflections */
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  background: 
    radial-gradient(circle at 5% 95%, 
      rgba(0, 0, 0, 0) 0%, 
      rgba(0, 0, 0, 0) 100%),
    radial-gradient(circle at 95% 5%, 
      rgba(255, 255, 255, 0.3) 0%, 
      rgba(255, 255, 255, 0.15) 15%, 
      rgba(255, 255, 255, 0) 30%);
  pointer-events: none;
  z-index: 1;
}

/* Reduced red accents for hot badge */
.card:has(.status-badge.hot)::before {
  background: 
    radial-gradient(circle at 5% 95%, 
      rgba(0, 0, 0, 0) 0%, 
      rgba(0, 0, 0, 0) 100%),
    radial-gradient(circle at 95% 5%, 
      rgba(255, 100, 100, 0.5) 0%, 
      rgba(255, 100, 100, 0.25) 15%, 
      rgba(255, 100, 100, 0) 30%);
}

/* Reduced yellow accents for warning badge */
.card:has(.status-badge.warning)::before {
  background: 
    radial-gradient(circle at 5% 95%, 
      rgba(0, 0, 0, 0) 0%, 
      rgba(0, 0, 0, 0) 100%),
    radial-gradient(circle at 95% 5%, 
      rgba(255, 215, 120, 0.5) 0%, 
      rgba(255, 215, 120, 0.25) 15%, 
      rgba(255, 215, 120, 0) 30%);
}

/* Reduced blue accents for cold badge */
.card:has(.status-badge.cold)::before {
  background: 
    radial-gradient(circle at 5% 95%, 
      rgba(0, 0, 0, 0) 0%, 
      rgba(0, 0, 0, 0) 100%),
    radial-gradient(circle at 95% 5%, 
      rgba(120, 170, 255, 0.5) 0%, 
      rgba(120, 170, 255, 0.25) 15%, 
      rgba(120, 170, 255, 0) 30%);
}

/* Add neon glow effect for clicks */
.neon-glow {
  animation: neonPulse 1.5s ease-in-out;
  box-shadow: 
    0 0 5px rgba(255, 255, 255, 0.8),
    0 0 10px rgba(255, 255, 255, 0.6),
    0 0 15px rgba(255, 255, 255, 0.4),
    0 0 20px rgba(255, 255, 255, 0.2) !important;
}

@keyframes neonPulse {
  0% {
    box-shadow: none;
    background: rgba(255, 255, 255, 0.05);
  }
  50% {
    box-shadow: 
      0 0 10px rgba(255, 255, 255, 0.8),
      0 0 20px rgba(255, 255, 255, 0.6),
      0 0 30px rgba(255, 255, 255, 0.4),
      0 0 40px rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
  }
  100% {
    box-shadow: none;
    background: rgba(255, 255, 255, 0.05);
  }
}

/* Card glow effects based on temperature */
.hot-glow {
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.3);
}

.medium-glow {
  box-shadow: 0 0 15px rgba(255, 186, 0, 0.3);
}

.cold-glow {
  box-shadow: 0 0 15px rgba(62, 136, 240, 0.3);
}

/* Base styles for product titles */
.app-wrapper .card .card-content h2,
.app-wrapper .cards-container .card .card-content h2,
.card-content h2,
h2.card-title {
  color: #ffffff !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 24px !important; 
  font-weight: 500 !important;
  letter-spacing: 0.3px !important;
  margin: 0.5rem 0 0.75rem !important; /* Added top margin to avoid badge */
  line-height: 1.2 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
  padding-right: 70px !important; /* Add space for badge */
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  max-width: 100% !important;
}

/* Fix responsive scaling - smaller screens should have smaller fonts */
@media (max-width: 1024px) {
  .app-wrapper .card .card-content h2,
  .app-wrapper .cards-container .card .card-content h2,
  .card-content h2,
  h2.card-title {
    font-size: 22px !important;
    padding-right: 60px !important;
  }
}

@media (max-width: 768px) {
  .app-wrapper .card .card-content h2,
  .app-wrapper .cards-container .card .card-content h2,
  .card-content h2,
  h2.card-title {
    font-size: 20px !important;
    padding-right: 50px !important;
    margin-top: 1rem !important;
  }
  
  /* Adjust badge position on medium screens */
  .status-badge {
    top: -4px !important;
    right: -4px !important;
  }
}

@media (max-width: 480px) {
  .app-wrapper .card .card-content h2,
  .app-wrapper .cards-container .card .card-content h2,
  .card-content h2,
  h2.card-title {
    font-size: 18px !important;
    padding-right: 40px !important;
    margin-top: 1.5rem !important;
  }
  
  /* Adjust badge position on small screens */
  .status-badge {
    top: 0px !important;
    right: 0px !important;
    min-width: 70px !important;
    height: 28px !important;
    font-size: 0.85rem !important;
  }
  
  /* Adjust card padding */
  .card {
    padding: 1.25rem !important;
  }
}

/* CONSOLIDATED LARGER RESPONSIVE IMAGES - Remove previous card img styles */
.card img {
  width: 100% !important;
  height: auto !important;
  max-height: 450px !important; /* SIGNIFICANTLY INCREASED size */
  object-fit: cover !important; 
  margin-bottom: 16px !important;
  border-radius: 12px !important;
  display: block !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25) !important;
}

/* Enhanced hover effect */
.card:hover img {
  transform: scale(1.03) translateY(-3px) !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35) !important;
}

/* EXTRA LARGE screens */
@media (min-width: 1600px) {
  .card img {
    max-height: 550px !important; /* MASSIVE on very large screens */
  }
}

/* Large screens */
@media (min-width: 1200px) and (max-width: 1599px) {
  .card img {
    max-height: 500px !important; /* INCREASED from 400px */
  }
}

/* Medium-large screens */
@media (min-width: 992px) and (max-width: 1199px) {
  .card img {
    max-height: 450px !important;
  }
}

/* Medium screens */
@media (min-width: 768px) and (max-width: 991px) {
  .card img {
    max-height: 400px !important; /* INCREASED from 280px */
  }
}

/* Small screens */
@media (min-width: 481px) and (max-width: 767px) {
  .card img {
    max-height: 350px !important; /* INCREASED from 230px */
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .card img {
    max-height: 300px !important; /* INCREASED from 230px */
  }
}

/* Make sure card content has proper spacing */
.card-content {
  margin-top: 12px !important;
}
</style>


