<script setup>
import { ref, watch } from 'vue'

const isOpen = ref(false)
const videoRef = ref(null)

// Play only after the cover flip finishes (1.3 s), pause+reset on close
watch(isOpen, (val) => {
  if (val) {
    setTimeout(() => videoRef.value?.play(), 1300)
  } else {
    if (videoRef.value) {
      videoRef.value.pause()
      videoRef.value.currentTime = 0
    }
  }
})
</script>

<template>
  <div class="invitation-page">
    <!-- Floating petals -->
    <div class="petal petal-1"></div>
    <div class="petal petal-2"></div>
    <div class="petal petal-3"></div>
    <div class="petal petal-4"></div>
    <div class="petal petal-5"></div>

    <div class="scene">
      <div class="passport-wrap" :class="{ 'is-open': isOpen }">
        <!-- Inner white pages (behind the cover, revealed on open) -->
        <div class="page-inner">
          <div class="inner-content">
            <h2 class="inner-heading">You're Cordially Invited</h2>
            <p class="inner-sub">Keann &amp; Jenny · October 9, 2026</p>

            <!-- Image slots — replace src attributes to add photos -->
            <div class="img-grid">
              <div class="img-slot main-slot">
                <video
                  ref="videoRef"
                  src="@/assets/kj-intro.mp4"
                  class="main-video"
                  muted
                  playsinline
                ></video>
              </div>
              <div class="img-row">
                <div class="img-slot sm-slot">
                  <img src="@/assets/boarding-pass.png" class="sm-img" />
                </div>
              </div>
            </div>
            <p class="mb-0 text-center">Click the Boarding Pass for more details.</p>
          </div>
        </div>

        <!-- Front cover — flips open -->
        <div class="page-cover">
          <div class="book-spine"></div>
        </div>
      </div>

      <!-- Open Me button -->
      <!-- <Transition name="fade-btn"> -->
      <button v-if="!isOpen" class="open-btn" @click="isOpen = true">
        ✦ &nbsp;Open Me&nbsp; ✦
      </button>
      <!-- </Transition> -->

      <!-- Close button -->
      <Transition name="fade-btn">
        <button v-if="isOpen" class="close-btn" @click="isOpen = false">← Close</button>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

.invitation-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #f3eaff 0%, #e8d5ff 30%, #d4b8f5 60%, #c4a0f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'Cormorant Garamond', serif;
}

/* ── Petals ─────────────────────────────────────────── */
.petal {
  position: absolute;
  border-radius: 50% 0 50% 0;
  opacity: 0.18;
  animation: float linear infinite;
  pointer-events: none;
}
.petal-1 {
  width: 18px;
  height: 28px;
  background: #9b59b6;
  top: 10%;
  left: 8%;
  animation-duration: 9s;
  animation-delay: 0s;
}
.petal-2 {
  width: 12px;
  height: 20px;
  background: #b07fe0;
  top: 25%;
  left: 88%;
  animation-duration: 12s;
  animation-delay: 2s;
}
.petal-3 {
  width: 22px;
  height: 34px;
  background: #7d3c98;
  top: 60%;
  left: 5%;
  animation-duration: 10s;
  animation-delay: 4s;
}
.petal-4 {
  width: 14px;
  height: 24px;
  background: #c39bd3;
  top: 75%;
  left: 80%;
  animation-duration: 8s;
  animation-delay: 1s;
}
.petal-5 {
  width: 10px;
  height: 16px;
  background: #a569bd;
  top: 45%;
  left: 93%;
  animation-duration: 14s;
  animation-delay: 3s;
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.18;
  }
  90% {
    opacity: 0.18;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

/* ── Scene ───────────────────────────────────────────── */
.scene {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  perspective: 2200px;
  z-index: 1;
}

/* ── Passport wrapper ────────────────────────────────── */
.passport-wrap {
  position: relative;
  width: clamp(260px, 55vw, 380px);
  height: clamp(360px, 75vw, 530px);
  transform-style: preserve-3d;
  /* Resting tilt — looks like a physical closed passport */
  transform: rotateY(-10deg) rotateX(3deg);
  transition: transform 0.9s ease;
  filter: drop-shadow(-10px 16px 28px rgba(70, 10, 130, 0.4));
}

.passport-wrap.is-open {
  transform: rotateY(0deg) rotateX(0deg);
  filter: drop-shadow(0 8px 24px rgba(70, 10, 130, 0.2));
}

/* ── Inner white page ────────────────────────────────── */
.page-inner {
  position: absolute;
  inset: 0;
  background: #ffffff;
  border-radius: 0 8px 8px 0;
  border: 1px solid rgba(180, 130, 220, 0.25);
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.5s 0.75s;
}

.passport-wrap.is-open .page-inner {
  opacity: 1;
}

/* ── Front cover ─────────────────────────────────────── */
.page-cover {
  position: absolute;
  inset: 0;
  border-radius: 4px 8px 8px 4px;
  overflow: hidden;
  transform-origin: left center;
  transform-style: preserve-3d;
  background-image: url('@/assets/cover.png');
  /* Show the right panel of the landscape image as the cover */
  background-size: 200% 100%;
  background-position: right center;
  background-repeat: no-repeat;
  box-shadow: 4px 0 20px rgba(60, 10, 110, 0.25);
  transition: transform 1.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  z-index: 2;
}

.passport-wrap.is-open .page-cover {
  transform: rotateY(-180deg);
}

/* Spine shadow on cover left edge */
.book-spine {
  position: absolute;
  left: 0;
  top: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(to right, rgba(50, 5, 90, 0.35), transparent);
  pointer-events: none;
}

/* ── Inner page content ──────────────────────────────── */
.inner-content {
  padding: 1.8rem 1.4rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  box-sizing: border-box;
}

.inner-ornament {
  color: #9b6ec8;
  letter-spacing: 0.6em;
  font-size: 0.7rem;
}

.inner-heading {
  font-family: 'Great Vibes', cursive;
  font-size: clamp(1.5rem, 4.5vw, 2.2rem);
  color: #5b2d8e;
  margin: 0;
  line-height: 1.1;
}

.inner-sub {
  font-size: 0.75rem;
  color: #8a5ab8;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin: 0;
}

/* ── Image slots ─────────────────────────────────────── */
.img-grid {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.img-slot {
  background: rgba(180, 130, 220, 0.08);
  border: 2px dashed rgba(155, 110, 200, 0.35);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-slot {
  flex: 1;
  overflow: hidden;
}

.main-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  display: block;
}

.img-row {
  display: flex;
  gap: 0.6rem;
  height: 130px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    /* object-fit: cover; */
    border-radius: 6px;
    display: block;
  }
}

.sm-slot {
  flex: 1;
}

.img-label {
  font-size: 0.7rem;
  color: #c39bd3;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ── Buttons ─────────────────────────────────────────── */
.open-btn {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 1.1rem;
  letter-spacing: 0.22em;
  color: #5b2d8e;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(155, 110, 200, 0.5);
  border-radius: 50px;
  padding: 0.75rem 2.4rem;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  animation: pulse-glow 2.4s ease-in-out infinite;
}

.open-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 6px 28px rgba(130, 60, 180, 0.35);
  transform: translateY(-2px);
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 4px 16px rgba(130, 60, 180, 0.15);
  }
  50% {
    box-shadow: 0 4px 32px rgba(130, 60, 180, 0.45);
  }
}

.close-btn {
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.95rem;
  letter-spacing: 0.15em;
  color: #8a5ab8;
  background: transparent;
  border: 1px solid rgba(155, 110, 200, 0.4);
  border-radius: 50px;
  padding: 0.5rem 1.6rem;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.5);
  color: #5b2d8e;
}

/* ── Transitions ─────────────────────────────────────── */
.fade-btn-enter-active,
.fade-btn-leave-active {
  transition:
    opacity 0.4s,
    transform 0.4s;
}
.fade-btn-enter-from,
.fade-btn-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ── Responsive ──────────────────────────────────────── */
@media (max-width: 480px) {
  .passport-wrap {
    width: 82vw;
    height: 108vw;
  }

  .img-row {
    height: 56px;
  }
}
</style>
