<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// October 9, 2026 3:00 PM Manila time (UTC+8 = UTC+0 07:00)
const weddingDate = new Date('2026-10-09')
weddingDate.setHours(10, 0, 0, 0) // Set to 10:00 AM Manila time

const timerState = ref('countdown') // 'countdown' | 'today' | 'married'
const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)

function getManilaDateStr(date) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
}

function updateTimer() {
  const current = new Date()
  const diff = weddingDate - current

  if (diff > 0) {
    timerState.value = 'countdown'
    days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
    hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    seconds.value = Math.floor((diff % (1000 * 60)) / 1000)
  } else if (getManilaDateStr(current) === '2026-10-09') {
    timerState.value = 'today'
    days.value = hours.value = minutes.value = seconds.value = 0
  } else {
    timerState.value = 'married'
    const elapsed = current - weddingDate
    days.value = Math.floor(elapsed / (1000 * 60 * 60 * 24))
    hours.value = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    minutes.value = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60))
    seconds.value = Math.floor((elapsed % (1000 * 60)) / 1000)
  }
}
let timer
onMounted(() => {
  updateTimer()
  timer = setInterval(updateTimer, 1000)
})
onUnmounted(() => clearInterval(timer))

function pad(n) {
  return String(n).padStart(2, '0')
}
</script>
<template>
  <section class="detail-page detail-7">
    <div class="card-frosty">
      <div class="d-flex justify-center flex-column align-center">
        <!-- Logo -->
        <img src="@/assets/logo.png" alt="Keann & Jenny" class="couple-logo" />

        <!-- Names -->
        <h1 class="couple-names-7">Keann &amp; Jenny</h1>

        <!-- Tagline -->
        <p class="tagline">Joined in Love, Bound by Faith</p>

        <!-- Ornamental divider -->
        <div class="divider">
          <span class="divider-line"></span>
          <span class="divider-icon">❧</span>
          <span class="divider-line"></span>
        </div>

        <!-- Wedding date -->
        <p class="wedding-date">October 9, 2026</p>
        <p class="wedding-time text-center">
          10:00 AM · Marco Hotel, Cugman Cagayan de Oro City, Philippines
        </p>

        <!-- Bible verse -->
        <blockquote class="verse">
          <p class="text-center">
            "For this reason a man will leave his father and his mother and will stick to his wife,
            and the two will be one flesh... So that they are no longer two, but one flesh.
            Therefore, what God has yoked together, let no man put apart."
          </p>
          <footer class="text-center">— Matthew 19:5, 6</footer>
        </blockquote>
      </div>
      <template v-if="timerState === 'today'">
        <div class="today-message text-center">Today is the Day</div>
      </template>

      <template v-else>
        <div class="countdown-label text-center">
          {{ timerState === 'married' ? 'Days Married' : 'Counting down to forever' }}
        </div>
        <div class="countdown">
          <div class="countdown-unit">
            <span class="countdown-value">{{ pad(days) }}</span>
            <span class="countdown-unit-label">Days</span>
          </div>
          <span class="countdown-sep">:</span>
          <div class="countdown-unit">
            <span class="countdown-value">{{ pad(hours) }}</span>
            <span class="countdown-unit-label">Hours</span>
          </div>
          <span class="countdown-sep">:</span>
          <div class="countdown-unit">
            <span class="countdown-value">{{ pad(minutes) }}</span>
            <span class="countdown-unit-label">Minutes</span>
          </div>
          <span class="countdown-sep">:</span>
          <div class="countdown-unit">
            <span class="countdown-value">{{ pad(seconds) }}</span>
            <span class="countdown-unit-label">Seconds</span>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
<style scoped>
.ornament {
  color: #9b6ec8;
  letter-spacing: 0.6em;
  font-size: 0.75rem;
  margin-bottom: 1.5rem;
}

.couple-logo {
  width: clamp(200px, 20vw, 200px);
  height: auto;
  margin-bottom: 1.2rem;
  filter: drop-shadow(0 2px 8px rgba(130, 60, 180, 0.2));
}

.tagline {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: clamp(1rem, 3vw, 1.3rem);
  color: #7d4db5;
  letter-spacing: 0.12em;
  margin: 0 0 0.25rem;
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0.5rem auto 0.25rem;
  max-width: 220px;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, #b07fe0, transparent);
}
.divider-icon {
  color: #9b6ec8;
  font-size: 1.2rem;
}

.wedding-date {
  font-family: 'Great Vibes', cursive;
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  color: #6a3593;
  margin: 0 0 0.25rem;
}

.wedding-time {
  font-size: 0.9rem;
  color: #8a5ab8;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 0 0 1rem;
}

.verse {
  background: rgba(180, 130, 220, 0.1);
  border-left: 3px solid #c39bd3;
  border-radius: 8px;
  padding: 1.2rem 1.5rem;
  margin: 0 0 0.5rem;
  text-align: left;
}
.verse p {
  font-style: italic;
  font-size: clamp(0.9rem, 2.5vw, 1.05rem);
  color: #4a2570;
  line-height: 1.8;
  margin: 0 0 0.6rem;
}
.verse footer {
  font-size: 0.9rem;
  font-weight: 600;
  color: #7d4db5;
  letter-spacing: 0.05em;
}
.countdown-label {
  font-style: italic;
  font-size: 1rem;
  color: #8a5ab8;
  margin-bottom: 1rem;
  letter-spacing: 0.08em;
}

.countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.countdown-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #7b2fbe, #a855f7);
  border-radius: 12px;
  padding: 0.5rem 0.6rem;
  min-width: 72px;
  box-shadow: 0 4px 16px rgba(120, 40, 180, 0.25);
}

.countdown-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.4rem, 5vw, 2.4rem);
  font-weight: 300;
  color: #fff;
  line-height: 1;
}

.countdown-unit-label {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.3rem;
}

.countdown-sep {
  font-size: 2rem;
  color: #9b59b6;
  font-weight: 300;
  align-self: flex-start;
}

.today-message {
  font-family: 'Great Vibes', cursive;
  font-size: clamp(2.2rem, 7vw, 3.5rem);
  color: #5b2d8e;
  text-shadow: 0 2px 16px rgba(130, 60, 180, 0.25);
  margin: 0.5rem 0;
}
.couple-names-7 {
  font-family: 'Great Vibes', cursive;
  font-size: clamp(2.5rem, 8vw, 3.8rem);
  color: #50267d;
  margin: 0.5rem 0;
}
</style>
