<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import Detail5 from './Detail5.vue'

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

const slides = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11]
const props = defineProps({
  guestId: {
    type: String,
    default: 'guest',
  },
})

const currentIndex = ref(0)
const touchStartX = ref(null)
const showCarousel = ref(false)

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

onBeforeUnmount(stopAutoPlay)
</script>

<template>
  <section class="detail-page detail-4">
    <div class="intro-content">
      <button
        type="button"
        class="deck-button"
        aria-label="Open prenup gallery"
        @click="openCarousel"
      >
        <figure v-for="(slide, index) in deckSlides" :key="slide" class="deck-card">
          <img :src="slide" :alt="`Prenup preview ${index + 1}`" class="deck-image" />
        </figure>
        <p class="deck-hint">Image Stack Hover Animation</p>
      </button>

      <Detail5 :guest-id="props.guestId" />
    </div>

    <div v-if="showCarousel" class="carousel-modal">
      <div class="slideshow-shell">
        <button type="button" class="close-btn" aria-label="Close gallery" @click="closeCarousel">
          Close
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
  </section>
</template>

<style scoped>
.detail-page {
  min-height: 100dvh;
  width: 100%;
  background:
    radial-gradient(circle at 16% 4%, rgba(251, 216, 168, 0.3) 0%, rgba(251, 216, 168, 0) 34%),
    linear-gradient(180deg, #fffaf3 0%, #fff 100%);
  padding: 1rem;
  box-sizing: border-box;
}

.intro-content {
  width: min(560px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 0.95rem;
}

.deck-button {
  position: relative;
  display: block;
  width: 100%;
  height: 330px;
  border: 0;
  padding: 0;
  border-radius: 0;
  cursor: pointer;
  background: #2b2b2b;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.22);
  overflow: hidden;
}

.deck-card {
  position: absolute;
  top: 48px;
  left: 50%;
  width: min(220px, 42vw);
  height: min(260px, 52vw);
  margin: 0;
  padding: 10px 10px 22px;
  background: #fff;
  border-radius: 2px;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 15px 26px rgba(0, 0, 0, 0.42);
  transition: transform 0.38s ease;
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
  z-index: 60;
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
  z-index: 5;
  border: 0;
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  font-size: 0.78rem;
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
  font-family: 'Bell MT', serif;
  letter-spacing: 0.24em;
  font-size: clamp(0.7rem, 2.7vw, 0.95rem);
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
    height: 300px;
  }

  .deck-card {
    top: 54px;
    width: min(180px, 44vw);
    height: min(220px, 54vw);
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
</style>
