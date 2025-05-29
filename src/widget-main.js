import { defineCustomElement } from 'vue'
import SwerteMeterWidget from './widget/SwerteMeterWidget.vue'

console.log("Swerte Meter widget loading...");

try {
  // Define the widget component
  const SwerteMeterElement = defineCustomElement(SwerteMeterWidget);
  customElements.define('swerte-meter', SwerteMeterElement);
  console.log("Swerte meter widget registered successfully");
  
  // Expose API
  window.SwerteMeter = {
    refresh() {
      const widget = document.querySelector('swerte-meter');
      if (widget) widget.refreshReflections();
    },
    setTheme(theme) {
      const widget = document.querySelector('swerte-meter');
      if (widget) widget.theme = theme;
    }
  };
} catch (error) {
  console.error("Error registering Swerte meter widget:", error);
}