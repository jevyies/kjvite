<script setup>
import Detail1 from './Detail1.vue'
import Detail2 from './Detail2.vue'
import Detail3 from './Detail3.vue'
import Detail4 from './Detail4.vue'

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  guestId: {
    type: String,
    default: 'guest',
  },
})

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="details-overlay" @click.self="emit('close')">
        <div class="details-modal" role="dialog" aria-modal="true" aria-label="Invitation details">
          <button type="button" class="modal-close" @click="emit('close')">Close</button>

          <div class="snap-scroll">
            <section class="snap-page">
              <Detail1 />
            </section>
            <section class="snap-page">
              <Detail2 />
            </section>
            <section class="snap-page">
              <Detail3 />
            </section>
            <section class="snap-page">
              <Detail4 :guest-id="guestId" />
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.details-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(13, 7, 28, 0.72);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.details-modal {
  position: relative;
  width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  background: linear-gradient(180deg, #fffefe 0%, #f8f4ff 100%);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  border: 0;
  border-radius: 999px;
  padding: 0.38rem 0.9rem;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.9);
  color: #4c2379;
  cursor: pointer;
}

.snap-scroll {
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.snap-scroll::-webkit-scrollbar {
  display: none;
}

.snap-page {
  min-height: 100dvh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: flex;
  justify-content: center;
}

.snap-page :deep(.detail-page) {
  width: min(100%, 430px);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
