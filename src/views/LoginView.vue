<template>
  <div class="login-page">
    <!-- Background decoration -->
    <div class="bg-orb orb-1" aria-hidden="true"></div>
    <div class="bg-orb orb-2" aria-hidden="true"></div>

    <div class="login-card">
      <!-- Brand mark -->
      <div class="brand">
        <span class="brand-icon">✦</span>
        <p class="brand-label">K &amp; J Wedding</p>
      </div>

      <h1 class="card-title">Admin Portal</h1>
      <p class="card-sub">Sign in to manage your guest list</p>

      <!-- Error banner -->
      <transition name="shake">
        <div v-if="error" class="error-banner" role="alert">
          {{ error }}
        </div>
      </transition>

      <form @submit.prevent="handleLogin" novalidate>
        <div class="field">
          <label class="field-label" for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="field-input"
            placeholder="admin"
            autocomplete="username"
            required
          />
        </div>

        <div class="field">
          <label class="field-label" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="field-input"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <label class="remember-row">
          <input type="checkbox" v-model="rememberMe" class="remember-check" />
          <span class="remember-box" aria-hidden="true">
            <svg
              class="check-icon"
              viewBox="0 0 10 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 4L3.5 6.5L9 1"
                stroke="white"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="remember-label">Remember me</span>
        </label>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="btn-spinner"></span>
          <span v-else>Sign In</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')
const router = useRouter()
const BACKEND_URL = window.GLOBAL_BACKEND_URL || 'http://localhost:3000'

onMounted(() => {
  const savedUser = localStorage.getItem('remembered_user')
  if (savedUser) {
    username.value = savedUser
    rememberMe.value = true
  }
})

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value }),
    })

    if (res.ok) {
      const data = await res.json()
      localStorage.setItem('token', data.token)
      if (rememberMe.value) {
        localStorage.setItem('remembered_user', username.value)
      } else {
        localStorage.removeItem('remembered_user')
      }
      router.push('/admin/dashboard')
    } else {
      error.value = 'Invalid username or password.'
    }
  } catch {
    error.value = 'Could not reach the server. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ── Page ──────────────────────────────────────────────── */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0e0b1f;
  position: relative;
  overflow: hidden;
  padding: 1.5rem;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.orb-1 {
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(111, 71, 198, 0.55) 0%, transparent 70%);
  top: -180px;
  left: -140px;
}
.orb-2 {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(111, 71, 198, 0.25) 0%, transparent 70%);
  bottom: -100px;
  right: -80px;
}

/* ── Card ──────────────────────────────────────────────── */
.login-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(111, 71, 198, 0.35);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  backdrop-filter: blur(12px);
  box-shadow:
    0 0 0 1px rgba(111, 71, 198, 0.12),
    0 24px 60px rgba(0, 0, 0, 0.5);
  animation: fadeUp 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

/* ── Brand ─────────────────────────────────────────────── */
.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
}
.brand-icon {
  width: 34px;
  height: 34px;
  background: #6f47c6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #ffd700;
  flex-shrink: 0;
}
.brand-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
}

/* ── Headings ──────────────────────────────────────────── */
.card-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.3rem;
  letter-spacing: -0.01em;
}
.card-sub {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 1.75rem;
}

/* ── Error banner ──────────────────────────────────────── */
.error-banner {
  background: rgba(183, 28, 28, 0.18);
  border: 1px solid rgba(183, 28, 28, 0.45);
  color: #ff7070;
  font-size: 0.78rem;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  margin-bottom: 1.25rem;
}

/* ── Form fields ───────────────────────────────────────── */
.field {
  margin-bottom: 1rem;
}
.field-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.4rem;
}
.field-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
}
.field-input::placeholder {
  color: rgba(255, 255, 255, 0.22);
}
.field-input:focus {
  border-color: #6f47c6;
  box-shadow: 0 0 0 3px rgba(111, 71, 198, 0.25);
}

/* ── Remember me ───────────────────────────────────────── */
.remember-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  user-select: none;
}

/* Hide the native input but keep it accessible */
.remember-check {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

/* Custom checkbox box */
.remember-box {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}
.remember-check:checked + .remember-box {
  background: #6f47c6;
  border-color: #6f47c6;
  box-shadow: 0 0 0 3px rgba(111, 71, 198, 0.25);
}

/* Checkmark SVG — hidden until checked */
.check-icon {
  width: 10px;
  height: 8px;
  opacity: 0;
  transform: scale(0.5);
  transition:
    opacity 0.18s ease,
    transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.remember-check:checked + .remember-box .check-icon {
  opacity: 1;
  transform: scale(1);
}

/* Hover glow when unchecked */
.remember-row:hover .remember-box {
  border-color: rgba(111, 71, 198, 0.6);
}

.remember-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
}

/* ── Submit button ─────────────────────────────────────── */
.submit-btn {
  width: 100%;
  padding: 0.72rem;
  background: #6f47c6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition:
    background 0.2s,
    transform 0.15s,
    box-shadow 0.2s;
  box-shadow: 0 4px 18px rgba(111, 71, 198, 0.45);
}
.submit-btn:hover:not(:disabled) {
  background: #8560d8;
  box-shadow: 0 6px 24px rgba(111, 71, 198, 0.6);
  transform: translateY(-1px);
}
.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading spinner inside button */
.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ── Animations ────────────────────────────────────────── */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
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

.shake-enter-active {
  animation: shake 0.4s ease;
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-6px);
  }
  40% {
    transform: translateX(6px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}
</style>
