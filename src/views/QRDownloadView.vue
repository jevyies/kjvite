<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import QRCode from 'qrcode'

const route = useRoute()
const qrDataUrl = ref('')
const downloaded = ref(false)

const token = computed(() => (route.params.id ? String(route.params.id) : 'guest'))
const invitationUrl = computed(() => {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/${encodeURIComponent(token.value)}`
})

const triggerDownload = () => {
  if (!qrDataUrl.value) return

  const link = document.createElement('a')
  link.href = qrDataUrl.value
  link.download = `guest-qr-${token.value}.png`
  link.click()
  downloaded.value = true
}

onMounted(async () => {
  qrDataUrl.value = await QRCode.toDataURL(invitationUrl.value, {
    width: 360,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#1e1435',
      light: '#ffffff',
    },
  })

  // Auto-download for in-app browsers, with manual fallback button.
  triggerDownload()
})
</script>

<template>
  <main class="download-page">
    <section class="download-card">
      <p class="eyebrow">Guest QR</p>
      <h1 class="title">Your QR Code Is Ready</h1>
      <p class="sub">If the download did not start, tap the button below.</p>

      <div class="qr-wrap">
        <img v-if="qrDataUrl" :src="qrDataUrl" alt="Guest QR code" class="qr-image" />
      </div>

      <button type="button" class="download-btn" @click="triggerDownload">Download QR</button>

      <p class="status" :class="{ done: downloaded }">
        {{ downloaded ? 'Download triggered successfully.' : 'Waiting for download...' }}
      </p>
    </section>
  </main>
</template>

<style scoped>
.download-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
  background: linear-gradient(180deg, #efe7f8 0%, #fdfcff 100%);
}

.download-card {
  width: min(100%, 430px);
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(120, 72, 173, 0.2);
  box-shadow: 0 14px 35px rgba(55, 31, 89, 0.18);
  padding: 1.15rem;
  box-sizing: border-box;
  text-align: center;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.67rem;
  color: #8b63ba;
}

.title {
  margin: 0.35rem 0 0;
  color: #45226e;
  font-size: clamp(1.3rem, 6vw, 1.8rem);
}

.sub {
  margin: 0.45rem 0 0;
  color: #7f5ba8;
  font-size: 0.85rem;
}

.qr-wrap {
  margin: 0.85rem auto 0;
  padding: 0.45rem;
  border-radius: 12px;
  border: 1px solid rgba(106, 57, 163, 0.2);
  width: fit-content;
  background: #fff;
}

.qr-image {
  width: min(72vw, 300px);
  display: block;
}

.download-btn {
  margin-top: 0.8rem;
  width: 100%;
  border: 0;
  border-radius: 11px;
  padding: 0.8rem 1rem;
  background: #4e2f81;
  color: #fff;
  font-weight: 700;
  font-size: 0.94rem;
  cursor: pointer;
}

.status {
  margin: 0.7rem 0 0;
  color: #8f78ab;
  font-size: 0.78rem;
}

.status.done {
  color: #4f2b82;
}
</style>
