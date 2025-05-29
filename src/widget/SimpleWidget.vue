<template>
  <div style="background-color: #444; padding: 20px; border: 3px solid red;">
    <h2>Widget Works!</h2>
    <p>API Key: {{ apiKey }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  apiKey: String
});
</script>

<style>
.simple-widget {
  padding: 20px;
  background-color: #333;
  color: white;
  border-radius: 8px;
  margin: 20px 0;
  border: 2px solid red;
}

.sample-card {
  background-color: #444;
  padding: 15px;
  margin-top: 15px;
  border-radius: 8px;
}

.color-bar {
  height: 8px;
  background: linear-gradient(90deg, blue, yellow, red);
  margin-top: 10px;
  border-radius: 4px;
}
</style>