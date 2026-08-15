<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import QRCode from 'qrcode'

const props = defineProps({
  guestId: {
    type: String,
    default: 'guest',
  },
})

const route = useRoute()
const response = ref('pending')
const showNoConfirm = ref(false)
const qrDataUrl = ref('')

const token = computed(() => props.guestId || (route.params.id ? String(route.params.id) : 'guest'))

const invitationUrl = computed(() => {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/${encodeURIComponent(token.value)}`
})

const onYes = async () => {
  response.value = 'yes'
  showNoConfirm.value = false
  qrDataUrl.value = await QRCode.toDataURL(invitationUrl.value, {
    width: 260,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#1f0d39',
      light: '#ffffff',
    },
  })
}

const onNo = () => {
  showNoConfirm.value = true
}

const confirmNo = () => {
  response.value = 'no'
  showNoConfirm.value = false
}

const openDownloadPage = () => {
  window.open(`/qr-download/${encodeURIComponent(token.value)}`, '_blank')
}
</script>

<template>
  <article class="detail-page detail-4">
    <div class="panel">
      <p class="eyebrow">RSVP</p>
      <h2 class="title">Will You Attend Our Wedding?</h2>

      <div v-if="response === 'pending'" class="actions">
        <button type="button" class="btn yes" @click="onYes">Yes, I will attend</button>
        <button type="button" class="btn no" @click="onNo">No, I cannot attend</button>
      </div>

      <div v-if="response === 'yes'" class="result-block">
        <p class="result-title">Thank you for your response.</p>
        <p class="result-sub">Please save your guest QR code.</p>

        <div class="qr-box">
          <img v-if="qrDataUrl" :src="qrDataUrl" alt="Guest QR code" class="qr-image" />
        </div>

        <button type="button" class="btn download" @click="openDownloadPage">
          Download QR on New Page
        </button>
      </div>

      <div v-if="response === 'no'" class="result-block">
        <p class="result-title">Thank you for your response.</p>
        <p class="result-sub">We appreciate your time and understanding.</p>
      </div>
    </div>

    <div v-if="showNoConfirm" class="confirm-overlay">
      <div class="confirm-box">
        <p class="confirm-title">Are you sure?</p>
        <p class="confirm-sub">You can still change your response now.</p>
        <div class="confirm-actions">
          <button type="button" class="confirm-btn keep" @click="showNoConfirm = false">
            Go Back
          </button>
          <button type="button" class="confirm-btn leave" @click="confirmNo">Yes, I'm Sure</button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.detail-page {
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
  position: relative;
}

.detail-4 {
  background:
    radial-gradient(circle at 80% 20%, rgba(162, 101, 219, 0.18), transparent 34%),
    linear-gradient(180deg, #f8f2fc 0%, #ffffff 100%);
}

.panel {
  width: 100%;
  border-radius: 20px;
  border: 1px solid rgba(127, 82, 180, 0.25);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 16px 32px rgba(93, 54, 136, 0.16);
  padding: 1.2rem 1rem;
  box-sizing: border-box;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  text-align: center;
  color: #8d62ba;
  font-size: 0.68rem;
}

.title {
  margin: 0.35rem 0 0;
  text-align: center;
  color: #50267d;
  font-size: clamp(1.3rem, 6vw, 1.8rem);
  line-height: 1.15;
}

.actions {
  margin-top: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.btn {
  border: 0;
  border-radius: 12px;
  padding: 0.9rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.yes {
  background: linear-gradient(90deg, #5d3da8 0%, #7e57c2 100%);
  color: #fff;
}

.no {
  background: #efe8f8;
  color: #5d3da8;
}

.result-block {
  margin-top: 1rem;
  text-align: center;
}

.result-title {
  margin: 0;
  color: #4b2b77;
  font-size: 1rem;
  font-weight: 700;
}

.result-sub {
  margin: 0.35rem 0 0;
  color: #7d5ca4;
  font-size: 0.84rem;
}

.qr-box {
  margin: 0.75rem auto 0;
  width: fit-content;
  border-radius: 10px;
  padding: 0.45rem;
  background: #fff;
  border: 1px solid rgba(104, 57, 162, 0.2);
}

.qr-image {
  width: min(62vw, 230px);
  max-width: 230px;
  display: block;
}

.download {
  margin-top: 0.7rem;
  width: 100%;
  background: #2e1b55;
  color: #fff;
}

.confirm-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 7, 17, 0.58);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.confirm-box {
  width: 100%;
  border-radius: 14px;
  background: #fff;
  padding: 0.95rem;
  box-sizing: border-box;
}

.confirm-title {
  margin: 0;
  color: #43256a;
  font-weight: 700;
  text-align: center;
}

.confirm-sub {
  margin: 0.3rem 0 0;
  text-align: center;
  color: #7e5ca6;
  font-size: 0.84rem;
}

.confirm-actions {
  margin-top: 0.75rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.confirm-btn {
  border: 0;
  border-radius: 9px;
  padding: 0.62rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.keep {
  background: #f1ebf8;
  color: #5d3da8;
}

.leave {
  background: #4f2b82;
  color: #fff;
}
</style>
