<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
function reloadPage() {
  window.location.href = `${window.location.origin}/invite/${route.query.token}`
}
const token = computed(() => (route.query.token ? route.query.token : null))
</script>

<template>
  <div class="error-page">
    <div class="petal petal-1"></div>
    <div class="petal petal-2"></div>
    <div class="petal petal-3"></div>
    <div class="petal petal-4"></div>

    <section class="error-card">
      <p class="error-code">500</p>
      <h1 class="error-title">A Brief Pause in Our Story</h1>
      <p class="error-text">
        Our server ran into an unexpected issue. Please try again in a moment while we restore
        everything beautifully.
      </p>

      <div class="divider">
        <span class="divider-line"></span>
        <span class="divider-icon">❧</span>
        <span class="divider-line"></span>
      </div>

      <div class="actions">
        <button class="btn btn-solid" type="button" @click="reloadPage" v-if="token">
          Try Again
        </button>
        <RouterLink class="btn btn-ghost" to="/">Go Home</RouterLink>
      </div>

      <p class="note">If this keeps happening, please return in a few minutes.</p>
    </section>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #f3eaff 0%, #e8d5ff 30%, #d4b8f5 60%, #c4a0f0 100%);
  display: grid;
  place-items: center;
  overflow: hidden;
  position: relative;
  padding: 1.25rem;
  font-family: 'Cormorant Garamond', serif;
}

.petal {
  position: absolute;
  border-radius: 50% 0 50% 0;
  opacity: 0.18;
  pointer-events: none;
  animation: float linear infinite;
}

.petal-1 {
  width: 18px;
  height: 28px;
  background: #9b59b6;
  top: 12%;
  left: 8%;
  animation-duration: 10s;
}

.petal-2 {
  width: 14px;
  height: 22px;
  background: #b07fe0;
  top: 24%;
  right: 10%;
  animation-duration: 12s;
  animation-delay: 1.3s;
}

.petal-3 {
  width: 20px;
  height: 30px;
  background: #7d3c98;
  bottom: 16%;
  left: 7%;
  animation-duration: 9s;
  animation-delay: 2.2s;
}

.petal-4 {
  width: 12px;
  height: 18px;
  background: #c39bd3;
  bottom: 10%;
  right: 9%;
  animation-duration: 13s;
  animation-delay: 3.1s;
}

@keyframes float {
  0% {
    transform: translateY(-8vh) rotate(0deg);
    opacity: 0;
  }

  10% {
    opacity: 0.18;
  }

  90% {
    opacity: 0.18;
  }

  100% {
    transform: translateY(100vh) rotate(340deg);
    opacity: 0;
  }
}

.error-card {
  width: min(92vw, 680px);
  text-align: center;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(180, 130, 220, 0.3);
  border-radius: 24px;
  box-shadow: 0 8px 48px rgba(130, 60, 180, 0.15);
  padding: clamp(1.75rem, 4vw, 2.8rem);
  position: relative;
  z-index: 1;
  animation: rise 500ms ease-out;
}

@keyframes rise {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.error-code {
  margin: 0;
  font-family: 'Great Vibes', cursive;
  font-size: clamp(3.3rem, 12vw, 5.5rem);
  color: #6a3593;
  line-height: 1;
}

.error-title {
  margin: 0.4rem 0 0;
  color: #4a2570;
  font-size: clamp(1.45rem, 5vw, 2rem);
  letter-spacing: 0.03em;
}

.error-text {
  margin: 0.9rem auto 1.3rem;
  max-width: 520px;
  color: #694288;
  line-height: 1.7;
  font-size: clamp(0.95rem, 2.6vw, 1.08rem);
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0.4rem auto 1.35rem;
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

.actions {
  display: flex;
  gap: 0.65rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  border-radius: 999px;
  padding: 0.6rem 1.2rem;
  text-decoration: none;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid transparent;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
  cursor: pointer;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-solid {
  color: #fff;
  background: linear-gradient(135deg, #7b2fbe, #a855f7);
  box-shadow: 0 4px 16px rgba(120, 40, 180, 0.25);
}

.btn-ghost {
  color: #6a3593;
  border-color: rgba(106, 53, 147, 0.35);
  background: rgba(255, 255, 255, 0.4);
}

.note {
  margin: 1.1rem 0 0;
  color: #7d4db5;
  font-size: 0.9rem;
}

@media (max-width: 520px) {
  .error-card {
    border-radius: 18px;
    padding: 1.35rem 1rem 1.5rem;
  }

  .btn {
    width: 100%;
  }
}
</style>
