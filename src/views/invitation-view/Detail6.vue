<template>
  <article class="detail-page detail-6">
    <div class="card-frosty">
      <div>
        <h1 class="text-head">PROGRAM DETAILS</h1>
        <div class="d-flex justify-center">
          <img src="@/assets/details/program.png" alt="Program Details" class="program-image" />
        </div>
      </div>
      <hr />
      <div :style="{ paddingInline: '10px' }">
        <h1 class="text-head mb-0">SNAP & SHARE</h1>
        <div class="d-flex justify-center">
          <img src="@/assets/details/camera.png" alt="Snap & Share" class="cam-image" />
        </div>
        <p class="text-center">Capture and share your moments with us using our hashtag!</p>
        <p class="text-center font-weight-bold hashtag">#oriJENNYllymeantforKEANN</p>
      </div>
    </div>
  </article>
</template>
<style scoped>
.detail-6 {
  font-family: 'Bell MT', serif;
}
.text-head {
  color: #50267d;
  text-align: center;
  margin-bottom: 0.5rem;
  letter-spacing: 0.1em;
}
hr {
  border: 0;
  height: 1px;
  background: #5b2d8e;
  margin: 0.5rem 0;
}
.paragraph {
  text-align: justify;
  font-size: 15px;
  color: #2f1b47;
  line-height: 1.4;
}
p {
  text-align: center;
  color: #2f1b47;
}
.program-image {
  width: clamp(150px, 60vw, 200px);
  height: auto;
  margin-bottom: 1.2rem;
  filter: drop-shadow(0 2px 8px rgba(130, 60, 180, 0.2));
}
.hashtag {
  font-size: 1.25rem;
  color: #50267d;
  letter-spacing: 0.08em;
  margin-top: 0.25rem;
}
.cam-image {
  width: clamp(30px, 60vw, 60px);
  height: auto;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 2px 8px rgba(130, 60, 180, 0.2));
}
</style>
