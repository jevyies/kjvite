<template>
  <div class="scanner-container">
    <h2>QR Code Scanner</h2>

    <!-- Camera Stream Component -->
    <div class="camera-wrapper">
      <qrcode-stream @detect="onDetect" @init="onInit" />

      <!-- Loading Overlay -->
      <div v-if="loading" class="overlay loading-overlay">Initializing camera...</div>
    </div>

    <!-- Error Alerts -->
    <div v-if="error" class="error-banner">
      {{ error }}
    </div>

    <!-- Scanned Result UI -->
    <div v-if="scannedResult" class="result-card">
      <h3>Scanned Successfully!</h3>
      <p class="result-text">{{ scannedResult }}</p>

      <a v-if="isUrl(scannedResult)" :href="scannedResult" target="_blank" class="action-btn">
        Open Link
      </a>
      <button @click="clearResult" class="action-btn secondary">Scan Again</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { QrcodeStream } from 'qrcode-reader-vue3'

// Reactive states
const scannedResult = ref('')
const error = ref('')
const loading = ref(true)

/**
 * Triggered when a QR code is successfully detected in the frame
 */
const onDetect = (detectedCodes) => {
  // detectedCodes is an array of found matches. Grab the first one's raw text content.
  if (detectedCodes && detectedCodes.length > 0) {
    scannedResult.value = detectedCodes[0].rawValue
  }
}

/**
 * Handles initialization states and potential hardware/browser exceptions
 */
const onInit = async (promise) => {
  loading.value = true
  try {
    await promise
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      error.value = 'ERROR: Camera access permission denied.'
    } else if (err.name === 'NotFoundError') {
      error.value = 'ERROR: No camera found on this device.'
    } else if (err.name === 'NotSupportedError') {
      error.value = 'ERROR: Secure context required (HTTPS or localhost).'
    } else if (err.name === 'NotReadableError') {
      error.value = 'ERROR: Camera is already in use by another app.'
    } else {
      error.value = `ERROR: Camera initialization failed (${err.message})`
    }
  } finally {
    loading.value = false
  }
}

// Reset state to scan a new code
const clearResult = () => {
  scannedResult.value = ''
}

// Helper utility to check if scanned text is an actionable URL
const isUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}
</script>

<style scoped>
.scanner-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 1.5rem;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  text-align: center;
}

.camera-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  background: #111;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  font-weight: 500;
}

.error-banner {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #ffeef0;
  color: #d9383a;
  border-radius: 6px;
  font-size: 0.9rem;
  border: 1px solid #fecdd3;
}

.result-card {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.result-text {
  word-break: break-all;
  background: white;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  font-family: monospace;
}

.action-btn {
  display: inline-block;
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.action-btn.secondary {
  background-color: #64748b;
}

.action-btn:hover {
  opacity: 0.9;
}
</style>
