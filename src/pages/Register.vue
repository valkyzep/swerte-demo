<script setup>
import { defineEmits } from 'vue'
const emit = defineEmits(['close'])

const closePopup = () => {
  emit('close')
}

const registerWithGoogle = () => {
  console.log('Google registration clicked')
  // Add your Google registration logic here
}

const registerWithFacebook = () => {
  console.log('Facebook registration clicked')
  // Add your Facebook registration logic here
}
</script>

<template>
  <div class="register-container" @click.self="closePopup">
    <div class="register-popup">
      <div class="popup-content">
        <h2>Register</h2>
        <div class="register-buttons">
          <button class="register-btn google" @click="registerWithGoogle">
            <span class="icon">G</span>
            Sign up with Google
          </button>
          <button class="register-btn facebook" @click="registerWithFacebook">
            <span class="icon">f</span>
            Sign up with Facebook
          </button>
        </div>
        <button class="close-btn" @click="closePopup">&times;</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.register-popup {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: popIn 0.3s ease-out;
}

.popup-content {
  text-align: center;
}

h2 {
  color: #ffffff;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.register-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.register-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.google {
  background: #ffffff;
  color: #333333;
}

.google:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
}

.facebook {
  background: #1877f2;
  color: #ffffff;
}

.facebook:hover {
  background: #166fe5;
  transform: translateY(-2px);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.close-btn:hover {
  opacity: 1;
}

@keyframes popIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .register-popup {
    width: 95%;
    padding: 1.5rem;
  }
}
</style>