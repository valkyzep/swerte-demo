// Constants
export const IMAGE_UPDATED_EVENT = 'image-updated';

// Track reflection state
let reflectionsLocked = false;
let reflectionUpdateTimer = null;

/**
 * Debounce utility function to prevent multiple rapid updates
 */
export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Setup image reflections for all cards
 */
export function setupImageReflections() {
  console.log("Setting up image reflections...");
  
  // Clear any previous timeouts to prevent multiple simultaneous updates
  if (window._reflectionTimeouts) {
    window._reflectionTimeouts.forEach(id => clearTimeout(id));
    window._reflectionTimeouts = [];
  }
  
  // Process cards with a slight delay to ensure DOM is ready
  setTimeout(() => {
    // First remove any existing reflections to start fresh
    document.querySelectorAll('.custom-reflection').forEach(el => el.remove());
    
    // Then add new reflections after a brief pause
    setTimeout(() => {
      const cards = document.querySelectorAll('.card');
      console.log(`Found ${cards.length} cards to add reflections to`);
      
      cards.forEach(card => {
        updateCardReflection(card);
      });
    }, 100);
  }, 100);
}

/**
 * Update reflection for a specific card
 */
export function updateCardReflection(card) {
  // Skip if reflections are locked
  if (reflectionsLocked) {
    console.log("Reflections locked, skipping update");
    return;
  }
  
  // Remove existing reflection if any
  const existingReflection = card.querySelector('.custom-reflection');
  if (existingReflection) {
    existingReflection.remove();
  }
  
  // Find the image in the card
  const img = card.querySelector('img');
  if (!img) {
    console.log('No image found in card');
    return;
  }
  
  if (img && img.complete && img.src) {
    console.log('Image is loaded, extracting color');
    try {
      extractBottomLeftColor(img, card);
    } catch (err) {
      console.error('Error extracting color:', err);
    }
  } else if (img) {
    console.log('Image is not yet loaded, setting onload handler');
    img.onload = () => {
      console.log('Image loaded via onload event, extracting color');
      try {
        extractBottomLeftColor(img, card);
      } catch (err) {
        console.error('Error extracting color after load:', err);
      }
    };
  }
}

/**
 * Extract color from image and create reflection
 */
export function extractBottomLeftColor(img, card) {
  // Create canvas to analyze image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  
  // Draw image to canvas to extract pixels
  try {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Get pixel data from bottom left region
    const sampleSize = Math.min(50, Math.floor(canvas.width / 4), Math.floor(canvas.height / 4));
    const sampleX = 0; // Left edge
    const sampleY = canvas.height - sampleSize; // Bottom edge
    
    const pixelData = ctx.getImageData(sampleX, sampleY, sampleSize, sampleSize).data;
    
    // Calculate average color
    let r = 0, g = 0, b = 0;
    let count = 0;
    
    for (let i = 0; i < pixelData.length; i += 4) {
      r += pixelData[i];
      g += pixelData[i + 1];
      b += pixelData[i + 2];
      count++;
    }
    
    // Average the values
    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);
    
    // Create custom reflection with PRECISE POSITIONING
    const reflection = document.createElement('div');
    reflection.classList.add('custom-reflection');
    
    // IMPROVED positioning to prevent misalignment
    reflection.style.position = 'absolute';
    reflection.style.bottom = '0';
    reflection.style.left = '0';
    reflection.style.width = '75%';
    reflection.style.height = '75%';
    reflection.style.borderRadius = '0 0 0 12px';
    reflection.style.transform = 'none'; // Reset any transforms
    reflection.style.margin = '0'; // Reset any margins
    reflection.style.padding = '0'; // Reset any padding
    
    // INTENSIFIED gradient with enhanced colors
    reflection.style.background = `radial-gradient(ellipse at 10% 90%, 
      rgba(${Math.min(r*1.2, 255)},${Math.min(g*1.2, 255)},${Math.min(b*1.2, 255)},0.98) 0%, 
      rgba(${Math.min(r*1.15, 255)},${Math.min(g*1.15, 255)},${Math.min(b*1.15, 255)},0.85) 10%,
      rgba(${Math.min(r*1.1, 255)},${Math.min(g*1.1, 255)},${Math.min(b*1.1, 255)},0.65) 20%,
      rgba(${r},${g},${b},0.45) 35%,
      rgba(${r},${g},${b},0.25) 45%,
      rgba(${r},${g},${b},0) 60%)`;
    
    reflection.style.pointerEvents = 'none';
    reflection.style.zIndex = '3';
    reflection.style.mixBlendMode = 'screen';
    reflection.style.opacity = '0.95';
    
    // Add reflection to card with proper positioning
    card.style.position = 'relative'; // Ensure the card has position: relative
    card.appendChild(reflection);
  } catch (e) {
    console.error('Error extracting image color:', e);
  }
}

/**
 * Event handler for image update events
 */
export function handleImageUpdateEvent(event) {
  console.log('Image updated event received:', event.detail);
  
  setTimeout(() => {
    const cardId = event.detail && event.detail.cardId;
    if (cardId) {
      console.log(`Updating reflection for card: ${cardId}`);
      const card = document.getElementById(cardId);
      if (card) {
        updateCardReflection(card);
      } else {
        console.warn(`Card with ID ${cardId} not found in DOM`);
      }
    } else {
      console.log('Updating reflections for all cards');
      document.querySelectorAll('.card').forEach(card => {
        updateCardReflection(card);
      });
    }
  }, 300);
}

/**
 * Event handler for forced reflection updates
 */
export function handleForceReflectionUpdate(event) {
  console.log('Forced reflection update triggered', event?.detail);
  
  setTimeout(() => {
    const freshCards = document.querySelectorAll('.card');
    console.log(`Processing ${freshCards.length} cards for forced update`);
    
    freshCards.forEach(card => {
      console.log(`Forcing update for card ${card.id || 'unknown'}`);
      updateCardReflection(card);
    });
  }, 500);
}

/**
 * Handle page refresh
 */
export function handlePageRefresh() {
  console.log("Page refresh detected, setting up reflections");
  
  // Clear any existing reflections first
  document.querySelectorAll('.custom-reflection').forEach(el => el.remove());
  
  // Use multiple attempts with increasing delays to ensure all images are loaded
  for (let attempt = 1; attempt <= 3; attempt++) {
    setTimeout(() => {
      console.log(`Refresh reflection attempt ${attempt}/3`);
      
      // Reset the lock if it was left in a locked state
      reflectionsLocked = false;
      
      const cards = document.querySelectorAll('.card');
      console.log(`Found ${cards.length} cards after refresh`);
      
      cards.forEach(card => {
        updateCardReflection(card);
      });
    }, attempt * 500); // 500ms, 1000ms, 1500ms
  }
}

/**
 * Lock reflections to prevent updates during transitions
 */
export function lockReflections() {
  reflectionsLocked = true;
}

/**
 * Unlock reflections to allow updates
 */
export function unlockReflections() {
  reflectionsLocked = false;
}

/**
 * Get CSS for reflection styling
 */
export const reflectionCSS = `
/* Style for dynamically added reflection - FLICKER FREE */
.custom-reflection {
  /* Simpler animation with no transform */
  animation: none; /* Disable animation initially */
  filter: 
    drop-shadow(0 0 10px rgba(255, 255, 255, 0.4))
    brightness(1.1)
    contrast(1.05)
    saturate(1.1)
    blur(0.5px);
  mix-blend-mode: soft-light !important;
  opacity: 0.85 !important;
  
  /* STATIC POSITIONING - no changing props during animation */
  position: absolute !important;
  bottom: 0 !important;
  left: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border-radius: 0 0 0 12px !important;
  
  /* Ensure hardware acceleration without animation */
  transform: translateZ(0) !important;
}

/* Add animation only after page is stable */
@media (min-width: 1px) {
  :not(.transitioning) .custom-reflection {
    animation: gentleFadeIn 0.6s ease-out forwards;
  }
}

@keyframes gentleFadeIn {
  from { opacity: 0 !important; }
  to { opacity: 0.85 !important; }
}
`;