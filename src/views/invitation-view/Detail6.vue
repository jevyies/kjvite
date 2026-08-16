<script setup></script>

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
  /* background:
    radial-gradient(circle at 80% 20%, rgba(162, 101, 219, 0.18), transparent 34%),
    linear-gradient(180deg, #f8f2fc 0%, #ffffff 100%); */
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
</style>
