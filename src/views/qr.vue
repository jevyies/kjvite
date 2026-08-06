<template>
  <div class="generator-container">
    <h2>QR Code Generator</h2>

    <!-- User Input Control -->
    <div class="input-group">
      <label for="qr-text">Enter text or URL:</label>
      <input
        id="qr-text"
        v-model="textToEncode"
        type="text"
        placeholder="https://example.com"
        class="text-input"
      />
    </div>

    <!-- QR Render Target -->
    <div class="qr-preview-box">
      <!-- The library draws the matrix directly inside this canvas element -->
      <canvas ref="canvasRef"></canvas>

      <p v-if="!textToEncode" class="placeholder-text">
        Type something above to generate a QR code
      </p>
    </div>

    <!-- Action Tool -->
    <button v-if="textToEncode" @click="downloadQrCode" class="download-btn">Download PNG</button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

// Reactive state bindings
const textToEncode = ref('https://vuejs.org')
const canvasRef = ref(null)

/**
 * Handles generating and painting the QR matrix onto our canvas ref
 */
const generateQRCode = async () => {
  if (!canvasRef.value) return

  // If the user clears out the input box, wipe the canvas clear
  if (!textToEncode.value) {
    const context = canvasRef.value.getContext('2d')
    context.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    return
  }

  try {
    await QRCode.toCanvas(canvasRef.value, textToEncode.value, {
      width: 256, // Outer pixel dimensions
      margin: 2, // Buffer border zone (quiet zone units)
      color: {
        dark: '#0f172a', // Dark modules color (slate-900)
        light: '#ffffff', // Background color
      },
      errorCorrectionLevel: 'M', // Low (L), Medium (M), Quartile (Q), High (H)
    })
  } catch (err) {
    console.error('Failed to render QR Code:', err)
  }
}

// Instantly regenerate the frame whenever user text transforms
watch(textToEncode, () => {
  generateQRCode()
})

// Fire off the initial baseline render once DOM refs hook up
onMounted(() => {
  generateQRCode()
})

/**
 * Utility function to download the canvas content directly to local storage
 */
const downloadQrCode = () => {
  if (!canvasRef.value) return

  const link = document.createElement('a')
  link.download = 'qrcode.png'
  link.href = canvasRef.value.toDataURL('image/png')
  link.click()
}
</script>

<style scoped>
.generator-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1.5rem;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  text-align: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.input-group {
  text-align: left;
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #475569;
}

.text-input {
  width: 100%;
  padding: 0.75rem;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
}

.text-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.qr-preview-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 256px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.placeholder-text {
  color: #94a3b8;
  font-size: 0.9rem;
}

.download-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.download-btn:hover {
  background-color: #059669;
}
</style>
