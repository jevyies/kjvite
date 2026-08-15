<template>
  <article class="detail-page detail-1">
    <div class="panel">
      <p class="eyebrow">Wedding Day Invitation</p>
      <h2 class="title">Keann and Jenny</h2>
      <p class="lead">Together with our families, we invite you to celebrate our wedding day.</p>

      <div class="info-grid">
        <div class="info-card">
          <p class="label">Date</p>
          <p class="value">Friday, October 9, 2026</p>
        </div>
        <div class="info-card">
          <p class="label">Time</p>
          <p class="value">2:00 PM</p>
        </div>
      </div>

      <div class="venue-card">
        <p class="label">Venue</p>
        <p class="value">Kingdom Hall of Jehovah's Witnesses</p>
        <p class="sub">Digos City, Davao del Sur</p>
      </div>

      <p class="foot-note">Please scroll up for the full program and RSVP details.</p>
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
  padding: 1.2rem;
  box-sizing: border-box;
}

.detail-1 {
}

.panel {
  width: 100%;
  border-radius: 20px;
  border: 1px solid rgba(158, 91, 213, 0.22);
  background: rgba(255, 255, 255, 0.84);
  padding: 1.4rem 1.2rem;
  box-shadow: 0 14px 26px rgba(122, 58, 176, 0.15);
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-size: 0.66rem;
  color: #8a5ab8;
  text-align: center;
}

.title {
  margin: 0.45rem 0 0;
  text-align: center;
  color: #51267f;
  font-size: clamp(1.7rem, 7vw, 2.2rem);
  line-height: 1.05;
}

.lead {
  margin: 0.7rem 0 0;
  color: #684691;
  font-size: 0.95rem;
  line-height: 1.45;
  text-align: center;
}

.info-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.info-card,
.venue-card {
  border-radius: 12px;
  border: 1px solid rgba(120, 61, 169, 0.18);
  background: #ffffff;
  padding: 0.75rem;
}

.venue-card {
  margin-top: 0.65rem;
}

.label {
  margin: 0;
  font-size: 0.67rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #a074c9;
}

.value {
  margin: 0.35rem 0 0;
  color: #4f296f;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.3;
}

.sub {
  margin: 0.22rem 0 0;
  color: #7f5ca9;
  font-size: 0.8rem;
}

.foot-note {
  margin: 0.95rem 0 0;
  text-align: center;
  color: #7f5ca9;
  font-size: 0.8rem;
}
</style>
