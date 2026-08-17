<script setup>
import { computed, onBeforeUnmount, ref, inject } from 'vue'
import { useRoute } from 'vue-router'
import QRCode from 'qrcode'

import img1 from '@/assets/prenup/1.jpg'
import img2 from '@/assets/prenup/2.jpg'
import img3 from '@/assets/prenup/3.jpg'
import img4 from '@/assets/prenup/4.jpg'
import img5 from '@/assets/prenup/5.jpg'
import img6 from '@/assets/prenup/6.jpg'
import img7 from '@/assets/prenup/7.jpg'
import img8 from '@/assets/prenup/8.jpg'
import img9 from '@/assets/prenup/9.jpg'
import img10 from '@/assets/prenup/10.jpg'
import img11 from '@/assets/prenup/11.jpg'
import img12 from '@/assets/prenup/12.jpg'

const slides = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12]
const props = defineProps({
  guestId: {
    type: String,
    default: 'guest',
  },
  userResponse: {
    type: String,
    default: 'pending',
  },
})
const emit = defineEmits(['update-response'])

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})
const currentIndex = ref(0)
const touchStartX = ref(null)
const showCarousel = ref(false)
const route = useRoute()
const response = ref('pending')
const showNoConfirm = ref(false)
const qrDataUrl = ref('')
const deadlineDate = new Date(window.GLOBAL_RSVP_DEADLINE || '2026-09-15')
const loading = ref(false)
const somethingWentWrong = ref(false)
const globalRefs = inject('globalRefs')

let intervalId = null

const deckSlides = computed(() => slides.slice(0, Math.min(6, slides.length)))

const trackStyle = computed(() => ({
  transform: `translate3d(-${currentIndex.value * 100}%, 0, 0)`,
}))

function goTo(index) {
  currentIndex.value = index
}

function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % slides.length
}

function prevSlide() {
  currentIndex.value = (currentIndex.value - 1 + slides.length) % slides.length
}

function stopAutoPlay() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function startAutoPlay() {
  stopAutoPlay()
  intervalId = setInterval(nextSlide, 4500)
}

function onManualControl(action) {
  action()
  startAutoPlay()
}

function openCarousel() {
  currentIndex.value = 0
  showCarousel.value = true
  startAutoPlay()
}

function closeCarousel() {
  showCarousel.value = false
  touchStartX.value = null
  stopAutoPlay()
}

function onTouchStart(event) {
  touchStartX.value = event.touches[0]?.clientX ?? null
}

function onTouchEnd(event) {
  if (touchStartX.value === null) return

  const endX = event.changedTouches[0]?.clientX ?? touchStartX.value
  const deltaX = endX - touchStartX.value
  touchStartX.value = null

  if (Math.abs(deltaX) < 45) return

  if (deltaX < 0) {
    onManualControl(nextSlide)
  } else {
    onManualControl(prevSlide)
  }
}

const token = computed(() => props.guestId || (route.params.id ? String(route.params.id) : 'guest'))

const invitationUrl = computed(() => {
  return `${encodeURIComponent(token.value)}`
})

const onYes = async () => {
  somethingWentWrong.value = false
  loading.value = true
  try {
    const res = await fetch(`${globalRefs.BACKEND_URL}/api/guests/${token.value}/rsvp`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ status: 'accepted' }),
    })
    if (res.status === 401 || res.status === 403 || res.status === 404) {
      somethingWentWrong.value = true
      return
    }
    if (res.ok) {
      response.value = 'accepted'
      emit('update-response', 'accepted')
      showNoConfirm.value = false
      qrDataUrl.value = await QRCode.toDataURL(invitationUrl.value, {
        width: 150,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#1f0d39',
          light: '#ffffff',
        },
      })
    }
  } catch (error) {
    somethingWentWrong.value = true
  } finally {
    loading.value = false
  }
}

const onNo = () => {
  showNoConfirm.value = true
}

const confirmNo = async () => {
  somethingWentWrong.value = false
  loading.value = true
  try {
    const res = await fetch(`${globalRefs.BACKEND_URL}/api/guests/${token.value}/rsvp`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ status: 'rejected' }),
    })
    if (res.status === 401 || res.status === 403 || res.status === 404) {
      somethingWentWrong.value = true
      return
    }
    if (res.ok) {
      response.value = 'rejected'
      emit('update-response', 'rejected')
      showNoConfirm.value = false
    }
  } catch (error) {
    somethingWentWrong.value = true
  } finally {
    loading.value = false
  }
}

const openDownloadPage = () => {
  window.open(`/qr-download/${encodeURIComponent(token.value)}`, '_blank')
}
const isPassDeadline = computed(() => {
  const today = new Date()
  return today > deadlineDate
})
const onRevoke = () => {
  response.value = 'pending'
  emit('update-response', 'pending')
}
const onTryAgain = () => {
  somethingWentWrong.value = false
  loading.value = false
  response.value = 'pending'
  emit('update-response', 'pending')
}
watch(
  () => props.userResponse,
  async (newVal) => {
    qrDataUrl.value = ''
    response.value = newVal
    if (newVal === 'accepted') {
      qrDataUrl.value = await QRCode.toDataURL(invitationUrl.value, {
        width: 150,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#1f0d39',
          light: '#ffffff',
        },
      })
    }
  },
  { immediate: true },
)
onBeforeUnmount(stopAutoPlay)
</script>

<template>
  <section class="detail-page detail-5">
    <div class="intro-content card-frosty" :style="{ padding: '0 !important' }">
      <button
        type="button"
        class="deck-button"
        aria-label="Open prenup gallery"
        @click="openCarousel"
      >
        <figure v-for="(slide, index) in deckSlides" :key="slide" class="deck-card">
          <img :src="slide" :alt="`Prenup preview ${index + 1}`" class="deck-image" />
        </figure>
        <p class="deck-hint">Click to view the prenup photos</p>
      </button>
      <div :style="{ padding: '10px' }">
        <hr />
        <div class="panel mb-2 mt-2">
          <template v-if="isPassDeadline && response === 'pending'">
            <div class="deadline-card">
              <div class="deadline-badge">
                <span class="deadline-dot" />
                RSVP Closed
              </div>
              <p class="deadline-text">
                Thank you for visiting our invitation. Online responses are now closed, but your
                presence is still warmly appreciated.
              </p>

              <div class="deadline-note">
                <p class="deadline-note-label">Need help?</p>
                <p class="deadline-note-text">
                  Please contact the couple directly if you need any assistance.
                </p>
              </div>
            </div>
          </template>
          <template v-else>
            <h2 class="title" v-if="response === 'pending'">Will You Attend Our Wedding?</h2>
            <template v-if="loading">
              <p class="loading-text">Processing your response...</p>
            </template>
            <template v-else-if="somethingWentWrong">
              <div class="text-center">
                <p class="error-text mt-1 mb-1">
                  Something went wrong while processing your response. Please try again.
                </p>

                <a href="javascript:void(0);" @click="onTryAgain" class="result-sub underlined"
                  >Try Again</a
                >
              </div>
            </template>
            <template v-else>
              <div v-if="response === 'pending'" class="actions">
                <button type="button" class="btn accepted" @click="onYes">
                  Yes, I will attend
                </button>
                <button type="button" class="btn no" @click="onNo">No, I cannot attend</button>
              </div>

              <div v-if="response === 'accepted'" class="result-block">
                <p class="title">Thank you for your response.</p>
                <p class="result-sub">Please save your guest QR code.</p>

                <div class="qr-box">
                  <img v-if="qrDataUrl" :src="qrDataUrl" alt="Guest QR code" class="qr-image" />
                </div>

                <button
                  type="button"
                  class="btn download"
                  :style="{ marginBottom: '8px' }"
                  @click="openDownloadPage"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    stroke="currentColor"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download QR
                </button>

                <a href="javascript:void(0);" @click="onRevoke" class="result-sub underlined"
                  >Change my response</a
                >
                <p class="mt-1">
                  <small>↓ Scroll down to view more details</small>
                </p>
              </div>

              <div v-if="response === 'rejected'" class="result-block">
                <p class="title">Thank you for your response.</p>
                <p class="result-sub" :style="{ paddingInline: '10px' }">
                  We appreciate your response. See you next time!
                </p>
                <a href="javascript:void(0);" @click="onRevoke" class="result-sub underlined"
                  >Change my response</a
                >
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
    <div v-if="showCarousel" class="carousel-modal">
      <div class="slideshow-shell">
        <button type="button" class="close-btn" aria-label="Close gallery" @click="closeCarousel">
          ×
        </button>

        <div
          class="slides-viewport"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <div class="slides-track" :style="trackStyle">
            <figure v-for="(slide, index) in slides" :key="slide" class="slide">
              <img
                :src="slide"
                :alt="`Prenup photo ${index + 1}`"
                class="slide-image"
                :loading="index === 0 ? 'eager' : 'lazy'"
              />
            </figure>
          </div>
        </div>

        <div class="overlay" />

        <div class="slide-header">
          <p class="eyebrow">PRENUP GALLERY</p>
        </div>

        <div class="tablist" role="tablist" aria-label="Prenup slides">
          <button
            v-for="(slide, index) in slides"
            :key="slide"
            type="button"
            class="tab"
            :class="{ active: currentIndex === index }"
            :aria-label="`Go to slide ${index + 1}`"
            :aria-selected="currentIndex === index"
            role="tab"
            @click="onManualControl(() => goTo(index))"
          >
            <span class="tab-dot" />
          </button>
        </div>
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
  </section>
</template>

<style scoped>
.detail-5 {
  padding: 0.5rem;
}
.intro-content {
  width: min(560px, 100%);
  margin: 0 auto;
  display: grid;
}

.deck-button {
  position: relative;
  display: block;
  width: 100%;
  height: 320px;
  border: 0;
  padding: 0;
  border-radius: 0;
  cursor: pointer;
  overflow: hidden;
  background: transparent !important;
}

.deck-card {
  position: absolute;
  top: 48px;
  left: 50%;
  width: min(160px, 44vw);
  height: min(200px, 54vw);
  margin: 0;
  padding: 10px 10px 22px;
  background: #fff;
  border-radius: 2px;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 15px 26px rgba(0, 0, 0, 0.42);
  transition: transform 0.38s ease;
}

hr {
  border: 0;
  height: 2px;
  background: #5b2d8e;
  margin: 1rem 0;
}
.deck-card:nth-of-type(1) {
  transform: translateX(calc(-50% - 84px)) rotate(-18deg);
  z-index: 3;
}

.deck-card:nth-of-type(2) {
  transform: translateX(-50%) rotate(-1deg);
  z-index: 4;
}

.deck-card:nth-of-type(3) {
  transform: translateX(calc(-50% + 84px)) rotate(9deg);
  z-index: 5;
}

.deck-card:nth-of-type(4) {
  transform: translateX(calc(-50% - 36px)) translateY(22px) rotate(-8deg);
  z-index: 2;
}

.deck-card:nth-of-type(5) {
  transform: translateX(calc(-50% + 34px)) translateY(18px) rotate(7deg);
  z-index: 1;
}

.deck-card:nth-of-type(6) {
  transform: translateX(calc(-50% + 2px)) translateY(30px) rotate(1deg);
  z-index: 0;
}

.deck-button:hover .deck-card:nth-of-type(1) {
  transform: translateX(calc(-50% - 118px)) rotate(-28deg);
}

.deck-button:hover .deck-card:nth-of-type(2) {
  transform: translateX(-50%) translateY(-12px) rotate(-1deg);
}

.deck-button:hover .deck-card:nth-of-type(3) {
  transform: translateX(calc(-50% + 118px)) rotate(20deg);
}

.deck-button:hover .deck-card:nth-of-type(4) {
  transform: translateX(calc(-50% - 58px)) translateY(32px) rotate(-12deg);
}

.deck-button:hover .deck-card:nth-of-type(5) {
  transform: translateX(calc(-50% + 62px)) translateY(28px) rotate(11deg);
}

.deck-button:hover .deck-card:nth-of-type(6) {
  transform: translateX(calc(-50% + 8px)) translateY(40px) rotate(2deg);
}

.deck-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.deck-hint {
  position: absolute;
  bottom: 26px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.18em;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.carousel-modal {
  position: fixed;
  inset: 0;
  z-index: 998;
}

.slideshow-shell {
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background: #1e1728;
}

.close-btn {
  position: absolute;
  top: max(14px, env(safe-area-inset-top));
  right: 14px;
  z-index: 9999;
  border: 0;
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  font-size: 1rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #fff;
  background: rgba(16, 10, 28, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.slides-viewport {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  touch-action: pan-y;
}

.slides-track {
  display: flex;
  height: 100%;
  transition: transform 0.75s cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
}

.slide {
  width: 100%;
  min-width: 100%;
  height: 100%;
  margin: 0;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(8, 6, 14, 0.12) 0%, rgba(8, 6, 14, 0.6) 100%),
    radial-gradient(circle at 20% 18%, rgba(255, 243, 219, 0.24) 0%, rgba(255, 243, 219, 0) 48%),
    radial-gradient(circle at 78% 82%, rgba(188, 165, 255, 0.2) 0%, rgba(188, 165, 255, 0) 44%);
}

.overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.11) 0%, rgba(255, 255, 255, 0) 30%),
    linear-gradient(300deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 34%);
}

.slide-header {
  position: absolute;
  top: max(12px, env(safe-area-inset-top));
  left: 0;
  right: 0;
  z-index: 3;
  text-align: center;
}

.eyebrow {
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  font-family: 'Cormorant Garamond', Georgia, serif;
  letter-spacing: 0.24em;
  font-size: 1.25rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

.tablist {
  position: absolute;
  bottom: max(14px, env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  display: flex;
  justify-content: center;
  gap: 0.55rem;
  width: auto;
  max-width: 90vw;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: rgba(18, 11, 31, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.26);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.tab {
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  padding: 0;
  background: transparent;
  cursor: pointer;
  transition: transform 0.22s ease;
}

.tab:hover {
  transform: scale(1.1);
}

.tab-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.52);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
  transition:
    transform 0.22s ease,
    background 0.22s ease,
    box-shadow 0.22s ease;
}

.tab.active {
  transform: scale(1.14);
}

.tab.active .tab-dot {
  background: #fff;
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.36),
    0 0 16px rgba(255, 255, 255, 0.5);
}

@media (max-width: 640px) {
  .tablist {
    gap: 0.45rem;
    padding: 0.4rem 0.6rem;
  }

  .tab {
    width: 16px;
    height: 16px;
  }

  .deck-button {
    height: 320px;
  }

  .deck-card {
    top: 54px;
    width: min(160px, 44vw);
    height: min(200px, 54vw);
    padding: 8px 8px 18px;
  }

  .deck-card:nth-of-type(1) {
    transform: translateX(calc(-50% - 68px)) rotate(-16deg);
  }

  .deck-card:nth-of-type(2) {
    transform: translateX(-50%) rotate(-1deg);
  }

  .deck-card:nth-of-type(3) {
    transform: translateX(calc(-50% + 68px)) rotate(8deg);
  }

  .deck-card:nth-of-type(4) {
    transform: translateX(calc(-50% - 28px)) translateY(18px) rotate(-7deg);
  }

  .deck-card:nth-of-type(5) {
    transform: translateX(calc(-50% + 28px)) translateY(15px) rotate(6deg);
  }

  .deck-card:nth-of-type(6) {
    transform: translateX(-50%) translateY(24px) rotate(1deg);
  }

  .deck-button:hover .deck-card:nth-of-type(1) {
    transform: translateX(calc(-50% - 84px)) rotate(-24deg);
  }

  .deck-button:hover .deck-card:nth-of-type(2) {
    transform: translateX(-50%) translateY(-8px) rotate(-1deg);
  }

  .deck-button:hover .deck-card:nth-of-type(3) {
    transform: translateX(calc(-50% + 84px)) rotate(16deg);
  }

  .deck-button:hover .deck-card:nth-of-type(4) {
    transform: translateX(calc(-50% - 44px)) translateY(24px) rotate(-10deg);
  }

  .deck-button:hover .deck-card:nth-of-type(5) {
    transform: translateX(calc(-50% + 44px)) translateY(22px) rotate(9deg);
  }

  .deck-button:hover .deck-card:nth-of-type(6) {
    transform: translateX(-50%) translateY(30px) rotate(1deg);
  }

  .deck-hint {
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    bottom: 22px;
  }
}

.title {
  text-align: center;
  color: #50267d;
  font-size: clamp(2rem, 6vw, 1.8rem);
  line-height: 1.15;
  font-family: 'Great Vibes', cursive;
}

.actions {
  margin-top: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-inline: 1.2rem;
}

.btn {
  border: 0;
  border-radius: 12px;
  padding: 0.9rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.accepted {
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
  max-width: 150px;
  display: block;
}

.download {
  margin: 0.7rem auto 0;
  width: min(62vw, 250px);
  background: #2e1b55;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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

.deadline-card {
  margin: 0.25rem 0.5rem 0.15rem;
  padding: 1.1rem 1rem;
  border-radius: 18px;
  text-align: center;
  color: #fff;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 42%),
    linear-gradient(135deg, #3d215f 0%, #5f3a91 52%, #8b5cc7 100%);
  box-shadow: 0 14px 28px rgba(68, 34, 110, 0.24);
  position: relative;
  overflow: hidden;
}

.deadline-card::after {
  content: '';
  position: absolute;
  inset: auto -18% -34% auto;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.deadline-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.deadline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffd27a;
  box-shadow: 0 0 0 4px rgba(255, 210, 122, 0.15);
}

.deadline-title {
  margin: 0.95rem 0 0;
  font-family: 'Great Vibes', cursive;
  font-size: clamp(2rem, 6vw, 2.45rem);
  line-height: 1.05;
  color: #fff;
}

.deadline-text {
  margin: 0.7rem auto 0;
  max-width: 28ch;
  font-size: 0.95rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.9);
}

.deadline-note {
  margin-top: 1rem;
  padding: 0.85rem 0.9rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.deadline-note-label {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #ffdca4;
}

.deadline-note-text {
  margin: 0.35rem 0 0;
  font-size: 0.84rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.88);
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
.underlined {
  text-decoration: underline;
  cursor: pointer;
}
</style>
