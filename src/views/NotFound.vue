<template>
  <div class="not-found-page">
    <div class="petal petal-1"></div>
    <div class="petal petal-2"></div>
    <div class="petal petal-3"></div>

    <section class="not-found-card">
      <p class="code">404</p>
      <h1 class="title">This Page Is Missing</h1>
      <p class="subtitle">
        The page you are looking for has wandered off the invitation path. Let us guide you back.
      </p>

      <div class="divider">
        <span class="divider-line"></span>
        <span class="divider-icon">✦</span>
        <span class="divider-line"></span>
      </div>

      <div class="cta-row">
        <RouterLink class="cta primary" to="/">Back to Home</RouterLink>
        <RouterLink class="cta secondary" to="/dashboard">Go to Dashboard</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #f3eaff 0%, #e8d5ff 30%, #d4b8f5 60%, #c4a0f0 100%);
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  padding: 1.25rem;
  font-family: 'Cormorant Garamond', serif;
}

.petal {
  position: absolute;
  border-radius: 50% 0 50% 0;
  opacity: 0.16;
  pointer-events: none;
  animation: drift linear infinite;
}

.petal-1 {
  width: 16px;
  height: 26px;
  top: 12%;
  left: 9%;
  background: #9b59b6;
  animation-duration: 11s;
}

.petal-2 {
  width: 13px;
  height: 21px;
  top: 36%;
  right: 8%;
  background: #b07fe0;
  animation-duration: 9s;
  animation-delay: 1.7s;
}

.petal-3 {
  width: 11px;
  height: 18px;
  bottom: 12%;
  left: 15%;
  background: #c39bd3;
  animation-duration: 12.5s;
  animation-delay: 2.8s;
}

@keyframes drift {
  0% {
    transform: translateY(-8vh) rotate(0deg);
    opacity: 0;
  }

  10% {
    opacity: 0.16;
  }

  90% {
    opacity: 0.16;
  }

  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.not-found-card {
  width: min(92vw, 640px);
  text-align: center;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 1px solid rgba(180, 130, 220, 0.3);
  box-shadow: 0 8px 48px rgba(130, 60, 180, 0.15);
  padding: clamp(1.75rem, 4vw, 2.6rem);
  animation: appear 520ms ease-out;
  position: relative;
  z-index: 1;
}

@keyframes appear {
  from {
    opacity: 0;
    transform: scale(0.98);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.code {
  margin: 0;
  color: #6a3593;
  font-family: 'Great Vibes', cursive;
  font-size: clamp(3.2rem, 12vw, 5rem);
  line-height: 1;
}

.title {
  margin: 0.35rem 0 0.2rem;
  color: #4a2570;
  font-size: clamp(1.5rem, 5.5vw, 2.2rem);
}

.subtitle {
  margin: 0 auto 1.35rem;
  max-width: 500px;
  color: #694288;
  line-height: 1.65;
  font-size: clamp(0.95rem, 2.6vw, 1.05rem);
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0 auto 1.3rem;
  max-width: 210px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, #b07fe0, transparent);
}

.divider-icon {
  color: #9b6ec8;
  font-size: 1rem;
}

.cta-row {
  display: flex;
  justify-content: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.cta {
  border-radius: 999px;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.9rem;
  padding: 0.58rem 1.15rem;
  border: 1px solid transparent;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.cta:hover {
  transform: translateY(-1px);
}

.primary {
  color: #fff;
  background: linear-gradient(135deg, #7b2fbe, #a855f7);
  box-shadow: 0 4px 16px rgba(120, 40, 180, 0.25);
}

.secondary {
  color: #6a3593;
  border-color: rgba(106, 53, 147, 0.35);
  background: rgba(255, 255, 255, 0.4);
}

@media (max-width: 520px) {
  .not-found-card {
    border-radius: 18px;
    padding: 1.35rem 1rem 1.5rem;
  }

  .cta {
    width: 100%;
  }
}
</style>
