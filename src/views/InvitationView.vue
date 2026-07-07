<template>
  <div class="invitation-container">
    <!-- Ambient background glows -->
    <div class="glow glow-1" aria-hidden="true"></div>
    <div class="glow glow-2" aria-hidden="true"></div>
    <div class="glow glow-3" aria-hidden="true"></div>

    <!-- Loading spinner -->
    <div v-if="loading" class="loading-wrap">
      <div class="loading-ring"></div>
    </div>

    <template v-else>
      <!-- Guest greeting -->
      <div v-if="guest" class="guest-intro">
        <p class="guest-eyebrow">You are cordially invited</p>
        <h1 class="guest-name">{{ guest.name }}</h1>
      </div>

      <!-- 3-D passport book -->
      <div class="passport-scene">
        <div class="passport-book" ref="book">
          <!-- ① Front cover — flips open like a book page -->
          <div class="page cover" ref="cover" @click="openPassport">
            <div class="cover-shell">
              <div class="cover-header">
                <span class="cover-republic">REPUBLIC OF LOVE</span>
                <span class="cover-crest">✦</span>
              </div>

              <div class="cover-body">
                <h2 class="cover-title">Wedding PASSPORT</h2>
                <div class="cover-emblem">K ✈ ♡ J</div>
                <p class="cover-to">TO THE WEDDING OF</p>
                <h3 class="cover-couple">Keann &amp; Jenny</h3>
                <p class="cover-date">10.10.2026</p>
              </div>

              <div class="cover-footer">
                <div class="cover-strip"></div>
              </div>
            </div>
          </div>

          <!-- ② Inside page — revealed after the animation -->
          <div class="page inside" ref="inside" @click.stop>
            <!-- Header strip -->
            <div class="inside-header">
              <span>WEDDING TRAVEL DOCUMENT</span>
              <span class="inside-doc-no">WTD · 10102026</span>
            </div>

            <!-- Photo + passport fields -->
            <div class="inside-body">
              <div class="photo-col">
                <div class="photo-box"><span>K&amp;J</span></div>
                <p class="photo-label">BRIDE &amp; GROOM</p>
              </div>
              <div class="fields-col">
                <div class="pf">
                  <span class="pf-label">PASSENGER</span>
                  <span class="pf-value">{{ guest?.name || 'VALUED GUEST' }}</span>
                </div>
                <div class="pf">
                  <span class="pf-label">DATE OF UNION</span>
                  <span class="pf-value">10 OCT 2026</span>
                </div>
                <div class="pf">
                  <span class="pf-label">DESTINATION</span>
                  <span class="pf-value">FOREVER</span>
                </div>
                <div class="pf">
                  <span class="pf-label">FLIGHT</span>
                  <span class="pf-value">KJ – 2026</span>
                </div>
              </div>
            </div>

            <!-- Machine-readable zone -->
            <div class="mrz">
              <p>P&lt;LOVE&lt;KEANN&lt;&lt;AND&lt;JENNY&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
              <p>10102026M9991231&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
            </div>

            <!-- RSVP tear-off section -->
            <div class="rsvp-section">
              <div
                class="rsvp-stamp"
                :class="{
                  'stamp-pending': rsvpStatus === 'pending',
                  'stamp-accepted': rsvpStatus === 'accepted',
                  'stamp-declined': rsvpStatus === 'rejected',
                }"
              >
                {{
                  rsvpStatus === 'accepted'
                    ? 'ADMITTED'
                    : rsvpStatus === 'rejected'
                      ? 'DECLINED'
                      : 'RSVP'
                }}
              </div>

              <div class="rsvp-body">
                <h3 class="rsvp-question">Will you join our journey?</h3>
                <p class="rsvp-sub">Your presence is the greatest gift</p>

                <div v-if="rsvpStatus === 'pending'" class="rsvp-actions">
                  <button class="btn btn-yes" @click="submitRSVP('accepted')">
                    ✓ &nbsp;Accept
                  </button>
                  <button class="btn btn-no" @click="submitRSVP('rejected')">
                    ✗ &nbsp;Decline
                  </button>
                </div>
                <p v-else-if="rsvpStatus === 'accepted'" class="rsvp-response rsvp-yes">
                  🥂 We can't wait to see you!
                </p>
                <p v-else class="rsvp-response rsvp-no">We'll miss you, but we understand.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pulsing tap hint, hidden once open -->
      <p v-if="!isOpen" class="tap-hint">tap to open</p>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { createTimeline } from 'animejs'

const route = useRoute()
const loading = ref(true)
const guest = ref(null)
const rsvpStatus = ref('pending')
const isOpen = ref(false)

// Template refs for anime.js
const book = ref(null)
const cover = ref(null)
const inside = ref(null)

onMounted(async () => {
  if (route.params.id) {
    try {
      const res = await fetch(`http://localhost:3000/api/guests/${route.params.id}`)
      if (res.ok) {
        guest.value = await res.json()
        rsvpStatus.value = guest.value.status || 'pending'
      }
    } catch {
      // Preview mode — no backend
    }
  }
  loading.value = false
})

const openPassport = () => {
  if (isOpen.value) return
  isOpen.value = true

  const tl = createTimeline({
    defaults: { ease: 'inOutCubic' },
  })

  // 1. Lift the passport off the page
  tl.add(book.value, {
    translateY: -14,
    scale: 1.05,
    duration: 380,
    ease: 'outBack',
  })

    // 1b. Tilt to 90° first — show the spine before opening
    .add(book.value, {
      rotateY: 90,
      duration: 600,
      ease: 'inOutCubic',
    })

    // 2. Front cover flips open — bottom-hinged, swings upward like an upside-down book
    .add(cover.value, {
      rotateX: -180,
      duration: 1300,
      ease: 'inOutCubic',
    })

    // Fade cover just before flip ends so it doesn't ghost during the spin
    .add(
      cover.value,
      {
        opacity: 0,
        duration: 150,
        ease: 'linear',
      },
      '-=250',
    )

    // 3. Horizontal spin of the now-open book
    .add(book.value, {
      rotateY: 360,
      duration: 1100,
      ease: 'inOutCubic',
    })

    // 4. Settle the book back to resting position
    .add(
      book.value,
      {
        translateY: 0,
        scale: 1,
        duration: 450,
        ease: 'outBack',
      },
      '-=200',
    )

    // 5. Inside content fades + slides up into view
    .add(
      inside.value,
      {
        opacity: [0, 1],
        translateY: [22, 0],
        duration: 750,
        ease: 'outExpo',
      },
      '-=350',
    )
}

const submitRSVP = async (status) => {
  if (!route.params.id) {
    rsvpStatus.value = status
    return
  }
  try {
    const res = await fetch(`http://localhost:3000/api/guests/${route.params.id}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) rsvpStatus.value = status
  } catch {
    // silent
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');

/* ─── Page shell ─────────────────────────────────────────── */
.invitation-container {
  min-height: 100vh;
  background: radial-gradient(ellipse at 18% 18%, #2d1870 0%, #0e0b20 50%, #180d3e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Cormorant Garamond', Georgia, serif;
  position: relative;
  overflow: hidden;
  padding: 2rem 1rem;
}

/* Ambient glow blobs */
.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}
.glow-1 {
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(111, 71, 198, 0.65) 0%, transparent 70%);
  top: -160px;
  left: -160px;
}
.glow-2 {
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgba(201, 162, 39, 0.22) 0%, transparent 70%);
  bottom: -90px;
  right: -90px;
}
.glow-3 {
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(111, 71, 198, 0.28) 0%, transparent 70%);
  top: 42%;
  right: 6%;
}

/* ─── Loading ────────────────────────────────────────────── */
.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
.loading-ring {
  width: 42px;
  height: 42px;
  border: 3px solid rgba(255, 215, 0, 0.12);
  border-top-color: #ffd700;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ─── Guest intro ────────────────────────────────────────── */
.guest-intro {
  text-align: center;
  margin-bottom: 2rem;
  animation: fadeDown 0.75s ease both;
}
.guest-eyebrow {
  font-size: 0.68rem;
  letter-spacing: 0.38em;
  text-transform: uppercase;
  color: rgba(255, 215, 0, 0.65);
  margin: 0 0 0.45rem;
}
.guest-name {
  font-size: 2.4rem;
  font-weight: 300;
  color: #fff;
  margin: 0;
  letter-spacing: 0.04em;
}

/* ─── 3-D scene ──────────────────────────────────────────── */
.passport-scene {
  perspective: 1600px;
  animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

.passport-book {
  width: min(340px, 90vw);
  height: 490px;
  position: relative;
  transform-style: preserve-3d;
}

/* Shared page rules */
.page {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* ─── COVER ──────────────────────────────────────────────── */
.cover {
  background: linear-gradient(155deg, #8a5de0 0%, #6f47c6 45%, #4a2e99 100%);
  border: 2px solid #c9a227;
  box-shadow:
    0 0 0 1px rgba(201, 162, 39, 0.2),
    0 24px 55px rgba(0, 0, 0, 0.65),
    inset 0 0 60px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  transform-origin: bottom center; /* bottom-hinged — opens upward like an upside-down book */
  user-select: none;
  z-index: 2;
}

.cover-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(201, 162, 39, 0.28);
  margin: 10px;
  border-radius: 6px;
  overflow: hidden;
}

.cover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid rgba(201, 162, 39, 0.2);
}
.cover-republic {
  font-size: 0.44rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: rgba(255, 215, 0, 0.62);
}
.cover-crest {
  font-size: 1.05rem;
  color: #ffd700;
  text-shadow: 0 0 14px rgba(255, 215, 0, 0.5);
}

.cover-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem 1.25rem;
  gap: 0.7rem;
}

.cover-title {
  font-family: 'IM Fell English', Georgia, serif;
  font-size: 1.55rem;
  font-weight: 400;
  color: #ffd700;
  margin: 0;
  letter-spacing: 0.06em;
  text-shadow: 0 0 28px rgba(255, 215, 0, 0.25);
  line-height: 1.2;
}

.cover-emblem {
  font-size: 1.55rem;
  color: rgba(255, 215, 0, 0.9);
  letter-spacing: 0.2em;
  animation: glide 3.5s ease-in-out infinite;
}

.cover-to {
  font-size: 0.5rem;
  letter-spacing: 0.48em;
  text-transform: uppercase;
  color: rgba(255, 215, 0, 0.58);
  margin: 0;
}

.cover-couple {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.8rem;
  font-weight: 300;
  font-style: italic;
  color: #fff;
  margin: 0;
  letter-spacing: 0.03em;
}

.cover-date {
  font-size: 0.8rem;
  letter-spacing: 0.38em;
  color: rgba(255, 215, 0, 0.75);
  margin: 0;
}

.cover-footer {
  padding: 0.6rem 1rem;
}
.cover-strip {
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent,
    #ffd700 30%,
    rgba(255, 255, 255, 0.5) 50%,
    #ffd700 70%,
    transparent
  );
  border-radius: 2px;
}

/* ─── INSIDE PAGE ────────────────────────────────────────── */
.inside {
  background: #faf7f0;
  color: #2a2020;
  box-shadow: 0 24px 55px rgba(0, 0, 0, 0.65);
  display: flex;
  flex-direction: column;
  opacity: 0; /* anime.js drives this to 1 */
  z-index: 1;
}

.inside-header {
  background: #6f47c6;
  color: #ffd700;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.44rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  flex-shrink: 0;
}
.inside-doc-no {
  font-family: 'Courier New', monospace;
  opacity: 0.72;
}

.inside-body {
  display: flex;
  gap: 0.8rem;
  padding: 0.75rem 1rem;
  background: #f5f0e8;
  flex-shrink: 0;
}

.photo-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}
.photo-box {
  width: 72px;
  height: 88px;
  border: 2px solid #c5b07e;
  background: #ede5d0;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.photo-box span {
  font-size: 0.85rem;
  font-weight: 700;
  color: #6b5530;
  letter-spacing: 0.05em;
}
.photo-label {
  font-size: 0.36rem;
  letter-spacing: 0.15em;
  color: #8b7355;
  text-transform: uppercase;
  margin: 0;
}

.fields-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
}
.pf-label {
  display: block;
  font-size: 0.4rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #8b7355;
  margin-bottom: 0.1rem;
}
.pf-value {
  display: block;
  font-size: 0.68rem;
  font-weight: 600;
  color: #4a2e99;
}

.mrz {
  font-family: 'Courier New', monospace;
  font-size: 0.36rem;
  color: #b0a090;
  line-height: 1.55;
  padding: 0.4rem 1rem;
  background: #f5f0e8;
  border-top: 1px solid #e8dfc8;
  flex-shrink: 0;
  letter-spacing: 0.04em;
}
.mrz p {
  margin: 0;
}

/* RSVP — dashed line mimics a boarding-pass tear-off */
.rsvp-section {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border-top: 2px dashed #c5b07e;
}

.rsvp-stamp {
  flex-shrink: 0;
  width: 62px;
  height: 62px;
  border: 3px solid;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.52rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-align: center;
  transform: rotate(-8deg);
  line-height: 1.2;
}
.stamp-pending {
  border-color: #6f47c6;
  color: #6f47c6;
}
.stamp-accepted {
  border-color: #2e7d32;
  color: #2e7d32;
}
.stamp-declined {
  border-color: #b71c1c;
  color: #b71c1c;
}

.rsvp-body {
  flex: 1;
}

.rsvp-question {
  font-size: 0.9rem;
  font-weight: 400;
  color: #3d2080;
  margin: 0 0 0.2rem;
  line-height: 1.35;
}
.rsvp-sub {
  font-size: 0.48rem;
  color: #8b7355;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem;
}

.rsvp-actions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.btn {
  padding: 0.46rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  font-weight: 700;
  font-family: inherit;
  transition:
    filter 0.15s,
    transform 0.15s;
}
.btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}
.btn:active {
  transform: translateY(0);
}
.btn-yes {
  background: #6f47c6;
  color: #ffd700;
}
.btn-no {
  background: #e8dfc8;
  color: #6b5530;
}

.rsvp-response {
  font-size: 0.65rem;
  margin: 0.25rem 0 0;
  line-height: 1.5;
}
.rsvp-yes {
  color: #2e7d32;
}
.rsvp-no {
  color: #666;
}

/* ─── Tap hint ───────────────────────────────────────────── */
.tap-hint {
  margin-top: 1.5rem;
  font-size: 0.56rem;
  letter-spacing: 0.38em;
  text-transform: uppercase;
  color: rgba(255, 215, 0, 0.42);
  animation: pulse 2.2s ease-in-out infinite;
}

/* ─── Keyframes ──────────────────────────────────────────── */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.85) translateY(18px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes glide {
  0%,
  100% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(5px) translateY(-3px);
  }
}
@keyframes pulse {
  0%,
  100% {
    opacity: 0.42;
  }
  50% {
    opacity: 1;
  }
}
</style>
