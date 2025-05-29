<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import NavBar from "../components/NavBar.vue";

// Create separate product arrays for each tab
const tabProducts = ref(
  JSON.parse(localStorage.getItem("products")) || [
    [...Array(36)].map((_, i) => ({
      title: `Product ${String.fromCharCode(65 + (i % 26))}${
        Math.floor(i / 26) + 1
      }`,
      value: parseFloat((Math.random() * 100).toFixed(2)),
      icon: null,
      isAutoUpdate: true,
    })),
    [...Array(36)].map((_, i) => ({
      title: `Product ${String.fromCharCode(65 + (i % 26))}${
        Math.floor(i / 26) + 1
      }`,
      value: parseFloat((Math.random() * 100).toFixed(2)),
      icon: null,
      isAutoUpdate: true,
    })),
    [...Array(36)].map((_, i) => ({
      title: `Product ${String.fromCharCode(65 + (i % 26))}${
        Math.floor(i / 26) + 1
      }`,
      value: parseFloat((Math.random() * 100).toFixed(2)),
      icon: null,
      isAutoUpdate: true,
    })),
    [...Array(36)].map((_, i) => ({
      title: `Product ${String.fromCharCode(65 + (i % 26))}${
        Math.floor(i / 26) + 1
      }`,
      value: parseFloat((Math.random() * 100).toFixed(2)),
      icon: null,
      isAutoUpdate: true,
    })),
  ]
);

const activeTab = ref(0);
const intervalIds = ref([null, null, null, null]);
const isClicked = ref(Array(36).fill(false));

const itemsPerPage = 18;
const currentPage = ref(1);
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return tabProducts.value[activeTab.value].slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(tabProducts.value[activeTab.value].length / itemsPerPage)
);

const updateProgress = (tabIndex) => {
  tabProducts.value[tabIndex] = tabProducts.value[tabIndex].map((item) => ({
    ...item,
    value: item.isAutoUpdate
      ? parseFloat((Math.random() * 100).toFixed(2))
      : item.value,
  }));
};

const handleTabChange = (index) => {
  activeTab.value = index;
  currentPage.value = 1; // Reset to first page on tab change
};

const handleCardClick = (index) => {
  isClicked.value[index] = true;
  setTimeout(() => {
    isClicked.value[index] = false;
  }, 1500); // Reset after 1.5 seconds
};

const changePage = (page) => {
  currentPage.value = page;
  isClicked.value = Array(itemsPerPage).fill(false); // Reset click states
};

onMounted(() => {
  // Create separate intervals for each tab
  intervalIds.value = tabProducts.value.map((_, index) => {
    return setInterval(() => updateProgress(index), 5000 + index * 1000); // Stagger the updates
  });

  // Get the API key that was set in widget-test.html
  const apiKey = localStorage.getItem("swerteCurrentKey");
  if (apiKey) {
    console.log("Using API key from widget test:", apiKey);
    // Do something with the key in your Home component
  }
});

onUnmounted(() => {
  // Clear all intervals
  intervalIds.value.forEach((id) => {
    if (id) clearInterval(id);
  });
});

function getProgressValueColor(value) {
  if (value <= 39) {
    return "#3e88f0"; // Blue for 0-39%
  } else if (value > 39 && value < 80.1) {
    return "#ffba00"; // Yellow for 40.1-79%
  } else {
    return "#ff0000"; // Red for 80.1-100%
  }
}
</script>

<template>
  <div class="app-container">
    <NavBar @changeTab="handleTabChange" />
    <div class="main">
      <div class="cards-container">
        <div
          v-for="(item, index) in paginatedProducts"
          :key="index"
          class="card"
          :class="{
            'hot-glow': item.value >= 81 && !isClicked[index],
            'medium-glow':
              item.value > 40 && item.value < 81 && !isClicked[index],
            'cold-glow': item.value <= 40 && !isClicked[index],
            'neon-glow': isClicked[index],
          }"
          @click="handleCardClick(index)"
        >
          <!-- BADGE LOGIC: Only one badge will show per card -->
          <div v-if="item.value >= 80.1" class="status-badge hot">
            <span class="badge-icon">🔥</span> HOT!
          </div>
          <div
            v-else-if="item.value >= 40.1 && item.value < 80.1"
            class="status-badge warning"
          >
            <span class="badge-icon">⚠️</span> WARM
          </div>
          <div v-else class="status-badge cold">
            <span class="badge-icon">❄️</span> COLD
          </div>
          <div class="card-content">
            <div class="card-layout">
              <div class="thumbnail-container">
                <img
                  v-if="item.icon"
                  :src="item.icon"
                  :alt="item.title"
                  class="thumbnail-image"
                />
                <div v-else class="thumbnail-placeholder">?</div>
              </div>

              <div class="content-wrapper">
                <h2>{{ item.title }}</h2>
                <div class="progress-container">
                  <div class="progress-bar-container">
                    <!-- Add the SwerteMeter label -->
                    <span class="swerte-meter-label">RTP</span>

                    <span
                      class="progress-value"
                      :class="{
                        'value-pulse': item.value >= 85 || item.value <= 15,
                      }"
                      style="color: #ffffff"
                    >
                      {{ item.value.toFixed(2) }}%
                    </span>
                    <div class="progress-wrapper">
                      <div class="progress-bar">
                        <div
                          class="progress-fill"
                          :style="{
                            width: `${item.value}%`,
                            background: getProgressValueColor(item.value),
                          }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add pagination controls -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          @click="changePage(1)"
          :disabled="currentPage === 1"
        >
          First
        </button>
        <button
          class="page-btn"
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          Previous
        </button>
        <div class="page-numbers">
          <button
            v-for="n in totalPages"
            :key="n"
            class="page-btn"
            :class="{ active: currentPage === n }"
            @click="changePage(n)"
          >
            {{ n }}
          </button>
        </div>
        <button
          class="page-btn"
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          Next
        </button>
        <button
          class="page-btn"
          @click="changePage(totalPages)"
          :disabled="currentPage === totalPages"
        >
          Last
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Reset styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  width: 100%;
  min-height: 100vh;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}

.main {
  flex: 1;
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column; /* Changed to column */
  align-items: center;
  min-height: 100vh; /* Ensure full height */
}

/* Update the responsive styles */

/* Base styles for all devices */
.cards-container {
  display: grid;
  width: 100%;
  max-width: 1800px;
  gap: 1.5rem;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Responsive grid layouts */

/* Extra small devices (phones, 320px and up) */
@media (min-width: 320px) {
  .cards-container {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem;
  }

  .card {
    padding: 1rem;
    min-height: 140px;
  }

  .thumbnail-container {
    width: 100px;
    height: 100px;
    border-radius: 12px;
  }

  .card-layout {
    gap: 0.75rem;
  }

  .progress-bar {
    height: 20px;
  }

  .progress-value {
    font-size: 0.8rem;
    top: -18px;
  }

  .progress-icon {
    font-size: 1.1rem;
  }

  .card-content h2 {
    font-size: 0.9rem;
  }
}

/* Small devices (larger phones, 375px and up) */
@media (min-width: 375px) {
  .card {
    min-height: 150px;
  }

  .thumbnail-container {
    width: 110px;
    height: 110px;
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  .cards-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    padding: 1rem;
  }

  .card {
    padding: 1.5rem;
    min-height: 180px;
  }

  .thumbnail-container {
    width: 140px;
    height: 140px;
    border-radius: 16px;
  }

  .card-layout {
    gap: 1.5rem;
  }

  .progress-bar {
    height: 28px;
  }

  .progress-value {
    font-size: 0.9rem;
    top: -22px;
  }

  .progress-icon {
    font-size: 1.3rem;
  }

  .card-content h2 {
    font-size: 1.1rem;
  }
}

/* Large devices (laptops, 1024px and up) */
@media (min-width: 1024px) {
  .cards-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    padding: 1.5rem;
  }

  .card {
    padding: 2rem;
    min-height: 220px;
  }

  .thumbnail-container {
    width: 180px;
    height: 180px;
    border-radius: 18px;
  }

  .card-layout {
    gap: 2rem;
  }

  .progress-bar {
    height: 32px;
  }

  .progress-value {
    font-size: 1rem;
    top: -24px;
  }

  .progress-icon {
    font-size: 1.5rem;
  }

  .card-content h2 {
    font-size: 1.3rem;
  }
}

/* Extra large devices (desktops, 1440px and up) */
@media (min-width: 1440px) {
  .cards-container {
    grid-template-columns: repeat(3, 1fr);
    padding: 2rem;
  }
}

/* Pagination styles */
.pagination {
  width: 100%;
  max-width: 1800px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 2rem auto;
  padding: 1.5rem;
  background: rgba(25, 25, 25, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.page-numbers {
  display: flex;
  gap: 0.75rem;
  margin: 0 0.5rem;
}

.page-btn {
  min-width: 44px;
  height: 44px;
  padding: 0 1rem;
  border: 2px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

/* First and Last buttons */
.page-btn:first-child,
.page-btn:last-child {
  min-width: 90px;
  background: rgba(255, 255, 255, 0.08);
}

/* Previous and Next buttons */
.page-btn:nth-child(2),
.page-btn:nth-last-child(2) {
  min-width: 100px;
  background: rgba(255, 255, 255, 0.08);
}

.page-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.page-btn.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  position: relative;
}

.page-btn.active::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.03);
}

/* Large screens */
@media (min-width: 1440px) {
  .pagination {
    padding: 1.75rem;
    gap: 1.25rem;
  }

  .page-btn {
    min-width: 48px;
    height: 48px;
    font-size: 1rem;
  }
}

/* Tablets and smaller laptops */
@media (max-width: 1024px) {
  .pagination {
    padding: 1.25rem;
    gap: 0.75rem;
    margin: 1.5rem auto;
  }

  .page-numbers {
    gap: 0.5rem;
  }

  .page-btn {
    min-width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }
}

/* Tablets */
@media (max-width: 768px) {
  .pagination {
    padding: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem;
  }

  .page-numbers {
    order: -1;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .page-btn:first-child,
  .page-btn:last-child,
  .page-btn:nth-child(2),
  .page-btn:nth-last-child(2) {
    flex: 1;
    min-width: calc(50% - 0.5rem);
  }
}

/* Mobile devices */
@media (max-width: 480px) {
  .pagination {
    padding: 0.75rem;
    gap: 0.35rem;
    border-radius: 16px;
  }

  .page-numbers {
    gap: 0.35rem;
  }

  .page-btn {
    min-width: 36px;
    height: 36px;
    font-size: 0.85rem;
    padding: 0;
  }

  .page-btn:first-child,
  .page-btn:last-child,
  .page-btn:nth-child(2),
  .page-btn:nth-last-child(2) {
    width: 100%;
    margin: 0.25rem 0;
  }
}

/* Add hover effects only for non-touch devices */
@media (hover: hover) and (pointer: fine) {
  .page-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
}

/* Performance optimizations for mobile */
@media (max-width: 768px) {
  .page-btn {
    transition: background-color 0.3s ease;
    transform: none !important;
  }
}

/* Update card base styles - remove background colors */
.card {
  border-radius: 12px;
  padding: 2rem; /* Increased from 1rem */
  height: 100%;
  min-height: 220px; /* Increased from 150px */
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: visible !important;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1) !important; /* subtle white overlay */
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 4px 32px 0 rgba(31, 38, 135, 0.1);
}

/* Update the glow animations with brighter effects */
@keyframes hotCardGlow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(255, 50, 50, 0.7), 0 0 40px rgba(255, 80, 80, 0.5),
      0 0 60px rgba(255, 100, 100, 0.4), inset 0 0 30px rgba(255, 70, 70, 0.5);
    border-color: rgba(255, 80, 80, 0.8);
    background: rgba(255, 60, 60, 0.15);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 70, 70, 0.8),
      0 0 60px rgba(255, 100, 100, 0.6), 0 0 90px rgba(255, 120, 120, 0.5),
      inset 0 0 40px rgba(255, 90, 90, 0.6);
    border-color: rgba(255, 100, 100, 0.9);
    background: rgba(255, 80, 80, 0.2);
  }
}

@keyframes mediumCardGlow {
  0%,
  100% {
    box-shadow: 0 0 15px rgba(255, 140, 0, 0.3), 0 0 30px rgba(255, 140, 0, 0.2),
      inset 0 0 20px rgba(255, 140, 0, 0.2);
    border-color: rgba(255, 140, 0, 0.4);
    background: rgba(255, 140, 0, 0.05);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 140, 0, 0.4), 0 0 40px rgba(255, 140, 0, 0.3),
      inset 0 0 25px rgba(255, 140, 0, 0.3);
    border-color: rgba(255, 140, 0, 0.5);
    background: rgba(255, 140, 0, 0.1);
  }
}

@keyframes coldCardGlow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(30, 144, 255, 0.6),
      0 0 40px rgba(30, 144, 255, 0.4), 0 0 60px rgba(30, 144, 255, 0.3),
      inset 0 0 30px rgba(30, 144, 255, 0.4);
    border-color: rgba(30, 144, 255, 0.7);
    background: rgba(30, 144, 255, 0.15);
  }
  50% {
    box-shadow: 0 0 30px rgba(30, 144, 255, 0.7),
      0 0 60px rgba(30, 144, 255, 0.5), 0 0 80px rgba(30, 144, 255, 0.4),
      inset 0 0 40px rgba(30, 144, 255, 0.5);
    border-color: rgba(30, 144, 255, 0.9);
    background: rgba(30, 144, 255, 0.2);
  }
}

@keyframes neonGlow {
  0% {
    box-shadow: 0 -30px 30px rgba(255, 0, 0, 0.8),
      30px 0 30px rgba(255, 165, 0, 0.8), 0 30px 30px rgba(255, 255, 0, 0.8),
      -30px 0 30px rgba(0, 255, 0, 0.8);
    border-color: rgba(255, 0, 0, 0.9);
  }
  25% {
    box-shadow: -30px 0 30px rgba(255, 0, 0, 0.8),
      0 -30px 30px rgba(255, 165, 0, 0.8), 30px 0 30px rgba(255, 255, 0, 0.8),
      0 30px 30px rgba(0, 255, 0, 0.8);
    border-color: rgba(255, 165, 0, 0.9);
  }
  50% {
    box-shadow: 0 30px 30px rgba(255, 0, 0, 0.8),
      -30px 0 30px rgba(255, 165, 0, 0.8), 0 -30px 30px rgba(255, 255, 0, 0.8),
      30px 0 30px rgba(0, 255, 0, 0.8);
    border-color: rgba(255, 255, 0, 0.9);
  }
  75% {
    box-shadow: 30px 0 30px rgba(255, 0, 0, 0.8),
      0 30px 30px rgba(255, 165, 0, 0.8), -30px 0 30px rgba(255, 255, 0, 0.8),
      0 -30px 30px rgba(0, 255, 0, 0.8);
    border-color: rgba(0, 255, 0, 0.9);
  }
  100% {
    box-shadow: 0 -30px 30px rgba(255, 0, 0, 0.8),
      30px 0 30px rgba(255, 165, 0, 0.8), 0 30px 30px rgba(255, 255, 0, 0.8),
      -30px 0 30px rgba(0, 255, 0, 0.8);
    border-color: rgba(255, 0, 0, 0.9);
  }
}

.neon-glow {
  animation: neonGlow 2s linear infinite;
  position: relative;
  transition: all 0.3s ease;
  z-index: 1;
}

.neon-glow::before {
  content: "";
  position: absolute;
  inset: -2px;
  background: transparent;
  border-radius: 12px;
  z-index: -1;
  animation: neonGlow 2s linear infinite;
  opacity: 0.5;
}

/* .hot-glow {
  animation: hotCardGlow 2s ease-in-out infinite;
}

.medium-glow {
  animation: mediumCardGlow 2s ease-in-out infinite;
}

.cold-glow {
  animation: coldCardGlow 2s ease-in-out infinite;
} */

.neon-glow {
  animation: neonGlow 2s linear infinite;
  transition: all 0.3s ease;
}

/* Add transitions to existing glow classes */
.hot-glow,
.medium-glow,
.cold-glow {
  transition: all 0.3s ease;
  cursor: pointer;
}

.card {
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Mobile optimization */
@media (max-width: 640px) {
  .hot-glow,
  .medium-glow,
  .cold-glow {
    animation-duration: 3s;
  }
}

/* Add to reduced motion section */
@media (prefers-reduced-motion: reduce) {
  .hot-glow,
  .medium-glow,
  .cold-glow {
    animation: none;
    background: transparent;
  }
}

/* Add shine effect to all cards */
.card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    125deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.02) 40%,
    transparent 60%
  );
  border-radius: 12px;
  pointer-events: none;
}

/* Ensure text visibility */
.card[class*="cold"] .card-content h2,
.card[class*="cold"] .card-content p,
.card[class*="cold"] .progress-value {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

/* Progress bar specific styles */
.progress-container {
  margin-top: auto; /* Pushes to bottom */
  width: 100%;
  position: relative;
  padding-top: 1.5rem;
  margin-bottom: 1rem; /* Added bottom margin */
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  height: 32px;
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.18), 0 2px 8px 0 rgba(0, 0, 0, 0.12);
  /* Remove any static background here, it's set inline */
  /* Add a subtle overlay shine */
  overflow: hidden;
}
.progress-fill::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.08) 100%
  );
  border-radius: 999px 999px 0 0;
  pointer-events: none;
}

/* Icon-specific styles */
.progress-icon {
  font-size: 1.5rem;
  transition: all 0.3s ease;
  filter: brightness(0) invert(1); /* Default white */
  opacity: 0.5;
  z-index: 2;
}

.half-filled {
  opacity: 0.75;
  filter: brightness(0.7) invert(0.7);
  transform: scale(1);
}

.neutral {
  opacity: 0.3;
  filter: brightness(0) invert(1);
  transform: scale(0.9);
}

/* Glow animations */
@keyframes coldGlow {
  0%,
  100% {
    filter: brightness(1) drop-shadow(0 0 5px #1e90ff)
      drop-shadow(0 0 10px #1e90ff) drop-shadow(0 0 15px #1e90ff);
    transform: scale(1);
    opacity: 1;
  }
  50% {
    filter: brightness(1.2) drop-shadow(0 0 8px #1e90ff)
      drop-shadow(0 0 16px #1e90ff) drop-shadow(0 0 24px #1e90ff);
    transform: scale(1.1);
    opacity: 1;
  }
}

@keyframes hotGlow {
  0%,
  100% {
    filter: brightness(1) drop-shadow(0 0 5px #ff4d4d)
      drop-shadow(0 0 10px #ff4d4d) drop-shadow(0 0 15px #ff4d4d);
    transform: scale(1);
    opacity: 1;
  }
  50% {
    filter: brightness(1.2) drop-shadow(0 0 8px #ff4d4d)
      drop-shadow(0 0 16px #ff4d4d) drop-shadow(0 0 24px #ff4d4d);
    transform: scale(1.1);
    opacity: 1;
  }
}

.glow-cold {
  animation: coldGlow 2s ease-in-out infinite;
  filter: none;
}

.glow-hot {
  animation: hotGlow 2s ease-in-out infinite;
  filter: none;
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .progress-icon {
    font-size: 1.2rem;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .glow-cold,
  .glow-hot {
    animation: none;
    filter: none;
    opacity: 1;
  }
}

.bar1,
.bar2,
.bar3,
.bar4,
.bar5,
.bar6,
.bar7,
.bar8,
.bar9,
.bar10,
.bar11,
.bar12,
.bar13,
.bar14,
.bar15,
.bar16 {
  background: linear-gradient(
    to right,
    #007bff 0%,
    /* Start with blue */ #ffd700 50%,
    /* Yellow in the middle */ #ff4d4d 100% /* End with red */
  );
}

/* Add hover effects */
.card:hover {
  transform: translateY(-2px);
}

.card[class*="cold"]:hover {
  box-shadow: 0 0 30px rgba(255, 77, 77, 0.2),
    inset 0 0 25px rgba(255, 255, 255, 0.1);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
}

.card-layout {
  display: flex;
  gap: 2rem; /* Increased from 1.5rem */
  align-items: start;
  width: 100%;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Changed from gap */
  min-height: 180px; /* Increased minimum height */
}

/* Update the thumbnail styles */
.thumbnail-container {
  width: 180px; /* Increased from 160px */
  height: 180px; /* Increased from 160px */
  flex-shrink: 0;
  border-radius: 18px; /* Slightly increased for proportion */
  overflow: hidden;
  background: rgba(51, 51, 51, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #2a2a2a, #333);
  color: rgba(255, 255, 255, 0.3);
  font-size: 2rem; /* Increased from 1.5rem */
}

.card-content h2 {
  color: #ffffff;
  font-family: "Inter", sans-serif;
  font-size: 32px; /* Increased from 28px */
  font-weight: 500; /* Medium weight */
  letter-spacing: 0.3px;
  margin-bottom: 0.5rem;
  line-height: 1.2; /* Added for better readability */
}

/* Make font responsive on smaller screens */
@media (max-width: 1024px) {
  .card-content h2 {
    font-size: 28px; /* Increased from 24px */
  }
}

@media (max-width: 768px) {
  .card-content h2 {
    font-size: 24px; /* Increased from 20px */
  }
}

@media (max-width: 480px) {
  .card-content h2 {
    font-size: 22px; /* Increased from 18px */
  }
}

.card-content p {
  color: #888888;
  font-size: clamp(0.9rem, 1.2vw, 1rem);
  margin-bottom: 0.5rem;
  font-weight: 400;
  letter-spacing: 0.2px;
}

.progress-value {
  position: absolute;
  top: 50%;
  right: 13px;
  transform: translateY(135%);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 500;
  font-family: "Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial,
    sans-serif; /* Modern font stack */
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .progress-value {
    right: 32px; /* Adjust for smaller screens */
  }
}

@media (max-width: 480px) {
  .progress-value {
    right: 28px; /* Further adjust for mobile */
  }
}

/* Combine and update the status badge styles to ensure consistent size */
.status-badge {
  position: absolute;
  top: -8px !important;
  right: -8px !important;
  min-width: 81px !important; /* Use min-width instead of fixed width */
  height: 32px !important;
  border-radius: 15px;
  font-family: "Inter", system-ui, sans-serif;
  font-weight: 500;
  font-size: 0.95rem; /* Slightly smaller font */
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px !important; /* Add horizontal padding */
  gap: -1px !important; /* Reduced from 6px to bring icon and text closer */
  white-space: nowrap;
  z-index: 1000 !important;
  pointer-events: none;
  animation: float 2s ease-in-out infinite;
  transform: none !important; /* Remove rotation */
  border-width: 2px;
}

.status-badge .badge-icon {
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: brightness(0) invert(1);
  text-shadow: 0 0 2px #fff, 0 0 4px #fff;
  margin-right: 0; /* Removed additional margin to tighten spacing */
}

.card .status-badge.hot {
  background: #ff0000;
  color: #ffffff;
  text-shadow: none;
  box-shadow: 0 0 20px #ff000088, 0 0 40px #ff000044;
  border: 2px solid #ff0000;
}

.card .status-badge.cold {
  background: #3e88f0;
  color: #ffffff;
  text-shadow: none;
  box-shadow: 0 0 20px #3e88f088, 0 0 40px #3e88f044;
  border: 2px solid #3e88f0;
}

.card .status-badge.warning {
  background: #ffba00;
  color: #ffffff;
  text-shadow: none;
  box-shadow: 0 0 20px #ffba0088, 0 0 40px #ffba0044;
  border: 2px solid #ffba00;
}

/* Update the flames animation */
@keyframes flames {
  0%,
  100% {
    text-shadow: 0 0 5px #ff4500, 0 0 10px #ff6b00, 0 0 15px #ff8c00;
    transform: rotate(15deg) scale(1);
  }
  50% {
    text-shadow: 0 0 10px #ff4500, 0 0 20px #ff6b00, 0 0 30px #ff8c00;
    transform: rotate(15deg) scale(1.05);
  }
}

@keyframes float {
  0%,
  100% {
    transform: rotate(15deg) translateY(0);
  }
  50% {
    transform: rotate(15deg) translateY(-5px);
  }
}

/* Add responsive adjustments for the badge */
@media (max-width: 640px) {
  .status-badge {
    padding: 2px 4px;
    font-size: 0.6rem;
    top: -6px !important;
    right: -6px !important;
    border-width: 1px;
  }
}

/* Update mobile styles to keep progress bar visible */
@media (max-width: 640px) {
  .progress-bar {
    height: 14px; /* Slightly smaller on mobile but still visible */
  }

  .progress-value {
    font-size: 0.8rem;
  }
}

/* Add SwerteMeter label styles */
.swerte-meter-label {
  position: absolute;
  top: 5px;
  left: 5px;
  font-family: "Inter", sans-serif;
  font-size: 9px;
  font-weight: 400; /* regular */
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 1;
}

/* Make sure it's responsive */
@media (max-width: 768px) {
  .swerte-meter-label {
    top: -18px;
  }
}

@media (max-width: 480px) {
  .swerte-meter-label {
    top: -16px;
  }
}

/* Update responsive grid layouts */

/* Extra small devices (phones, 320px and up) */
@media (min-width: 320px) {
  .cards-container {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem;
  }

  .card {
    padding: 1rem;
    min-height: 140px;
  }

  .thumbnail-container {
    width: 100px;
    height: 100px;
    border-radius: 12px;
  }

  .card-layout {
    gap: 0.75rem;
  }

  .progress-bar {
    height: 20px;
  }

  .progress-value {
    font-size: 0.8rem;
    top: -18px;
  }

  .progress-icon {
    font-size: 1.1rem;
  }

  .card-content h2 {
    font-size: 0.9rem;
  }
}

/* Small devices (larger phones, 375px and up) */
@media (min-width: 375px) {
  .card {
    min-height: 150px;
  }

  .thumbnail-container {
    width: 110px;
    height: 110px;
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  .cards-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    padding: 1rem;
  }

  .card {
    padding: 1.5rem;
    min-height: 180px;
  }

  .thumbnail-container {
    width: 140px;
    height: 140px;
    border-radius: 16px;
  }

  .card-layout {
    gap: 1.5rem;
  }

  .progress-bar {
    height: 28px;
  }

  .progress-value {
    font-size: 0.9rem;
    top: -22px;
  }

  .progress-icon {
    font-size: 1.3rem;
  }

  .card-content h2 {
    font-size: 1.1rem;
  }
}

/* Large devices (laptops, 1024px and up) */
@media (min-width: 1024px) {
  .cards-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    padding: 1.5rem;
  }

  .card {
    padding: 2rem;
    min-height: 220px;
  }

  .thumbnail-container {
    width: 180px;
    height: 180px;
    border-radius: 18px;
  }

  .card-layout {
    gap: 2rem;
  }

  .progress-bar {
    height: 32px;
  }

  .progress-value {
    font-size: 1rem;
    top: -24px;
  }

  .progress-icon {
    font-size: 1.5rem;
  }

  .card-content h2 {
    font-size: 1.3rem;
  }
}

/* Extra large devices (desktops, 1440px and up) */
@media (min-width: 1440px) {
  .cards-container {
    grid-template-columns: repeat(3, 1fr);
    padding: 2rem;
  }
}

/* Pagination responsive improvements */
@media (max-width: 480px) {
  .pagination {
    padding: 0.75rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .page-numbers {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.35rem;
  }

  .page-btn {
    min-width: 36px;
    height: 36px;
    font-size: 0.85rem;
    padding: 0;
  }

  .page-btn:first-child,
  .page-btn:last-child,
  .page-btn:nth-child(2),
  .page-btn:nth-last-child(2) {
    width: 100%;
    margin: 0.25rem 0;
  }
}

/* Landscape mode optimizations */
@media (max-height: 600px) and (orientation: landscape) {
  .card {
    min-height: 160px;
    padding: 1rem;
  }

  .thumbnail-container {
    width: 120px;
    height: 120px;
  }

  .progress-bar {
    height: 24px;
  }

  .card-layout {
    gap: 1rem;
  }
}

/* High-DPI screens */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .card-content h2 {
    font-weight: 450;
  }

  .progress-value {
    font-weight: 450;
  }
}

/* Performance optimizations for mobile */
@media (max-width: 768px) {
  .hot-glow,
  .medium-glow,
  .cold-glow {
    animation-duration: 3s;
  }

  .card {
    transform: none !important;
  }

  .progress-fill {
    transition: width 0.3s ease-out;
  }
}
</style>
