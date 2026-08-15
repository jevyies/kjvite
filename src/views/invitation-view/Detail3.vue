<template>
  <article class="detail-page detail-3">
    <div class="panel">
      <p class="eyebrow">Guest Guide</p>
      <h2 class="title">Attire and Reminders</h2>

      <div class="photo-box">
        <img src="@/assets/details/detail3.png" alt="Wedding guest reminders" class="guide-image" />
      </div>

      <div class="dress-code-box">
        <p class="label">Suggested Attire</p>
        <img src="@/assets/details/clothes.png" alt="Sample dress code" class="clothes-image" />
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
}

.detail-3 {
  background:
    radial-gradient(circle at 12% 8%, rgba(147, 98, 212, 0.2), transparent 28%),
    linear-gradient(180deg, #fffdfd 0%, #f3edfb 100%);
}

.panel {
  width: 100%;
  border-radius: 20px;
  border: 1px solid rgba(146, 96, 211, 0.22);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 14px 26px rgba(106, 66, 148, 0.15);
  padding: 1rem;
  box-sizing: border-box;
}

.eyebrow {
  margin: 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.17em;
  font-size: 0.66rem;
  color: #9161c0;
}

.title {
  margin: 0.3rem 0 0.7rem;
  text-align: center;
  color: #51277f;
  font-size: clamp(1.2rem, 5.8vw, 1.7rem);
}

.photo-box {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(130, 74, 187, 0.2);
}

.guide-image {
  width: 100%;
  display: block;
  object-fit: cover;
}

.dress-code-box {
  margin-top: 0.75rem;
  border-radius: 12px;
  background: #fff;
  border: 1px solid rgba(143, 99, 192, 0.2);
  padding: 0.55rem;
}

.label {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: #8f63bc;
}

.clothes-image {
  margin-top: 0.4rem;
  width: 100%;
  border-radius: 8px;
  display: block;
}
</style>
