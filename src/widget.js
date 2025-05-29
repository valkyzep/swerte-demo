import { createApp, defineCustomElement } from 'vue'
import SwerteMeterWidget from './components/SwerteMeterWidget.vue'

// Define the custom element
const SwerteMeterElement = defineCustomElement(SwerteMeterWidget)

// Register the custom element with the browser
customElements.define('swerte-meter', SwerteMeterElement)

// Export a global API for the widget
window.SwerteMeter = {
  // Refresh the widget data
  refresh: function() {
    console.log('Widget refreshed')
    // Add actual refresh logic later
  },
  
  // Change the widget theme
  setTheme: function(theme) {
    console.log('Theme set to:', theme)
    // Add actual theme changing logic later
  }
}

console.log('Swerte Meter Widget loaded')