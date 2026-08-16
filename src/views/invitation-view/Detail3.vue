<template>
  <article class="detail-page detail-3">
    <div class="pos-top card-frosty">
      <h1 class="text-head mb-1">ATTIRE</h1>
      <h2 class="text-head mb-1">FORMAL OR SEMI FORMAL</h2>
      <p :style="{ fontSize: '15px' }">WE ENCOURAGE YOU TO DRESS IN THESE SHADES</p>
      <div>
        <img src="@/assets/details/clothes.png" alt="Attire" class="attire-image mb-2" />
        <div class="color-palette mb-2">
          <div class="d-flex">
            <div class="d-flex align-center gap-4 w-50">
              <div class="colors lavender"></div>
              <p class="mb-0">LAVENDER</p>
            </div>
            <div class="d-flex align-center gap-4 w-50">
              <div class="colors lilac"></div>
              <p class="mb-0">LILAC</p>
            </div>
          </div>
          <div class="d-flex">
            <div class="d-flex align-center gap-4 w-50">
              <div class="colors pearlwhite"></div>
              <p class="mb-0">PEARL WHITE</p>
            </div>
            <div class="d-flex align-center gap-4 w-50">
              <div class="colors softsilver"></div>
              <p class="mb-0">SOFT SILVER</p>
            </div>
          </div>
        </div>
      </div>
      <p :style="{ fontSize: '15px' }">
        STRICTLY, <span class="font-weight-bolds">WHITE</span> IS RESERVED FOR THE BRIDE
      </p>
    </div>
  </article>
</template>

<style scoped lang="scss">
.detail-3 {
  font-family: 'Bell MT', serif;
}
.color-palette {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  margin-block: 0.5rem;
}
.colors {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #fff;

  &.lavender {
    background-color: #b7a2cd;
  }
  &.lilac {
    background-color: #e2daeb;
  }
  &.pearlwhite {
    background-color: #e8e5d8;
  }
  &.softsilver {
    background-color: #bbb8b7;
  }
}

h1,
h2 {
  font-weight: 700;
  letter-spacing: 0.2em;
  line-height: 1.2;
  color: #5c5c5c !important;
}
p {
  letter-spacing: 0.1em;
  font-size: clamp(0.3rem, 4vw, 0.8rem);
  line-height: 1.4;
  color: #5c5c5c !important;
}
h1 {
  font-size: clamp(1.2rem, 6vw, 1.5rem);
}
h2 {
  font-size: clamp(1rem, 5vw, 1.2rem);
}

.text-head {
  color: #50267d;
  text-align: center;
  margin-bottom: 0.5rem;
}
.text-dikit {
  letter-spacing: 0.05em;
}
p {
  text-align: center;
  color: #2f1b47;
}
.attire-image {
  width: 100%;
  max-width: 350px;
  height: auto;
  display: block;
  margin: 0.2rem auto;
}
.pos-top .text-head,
.pos-center .text-head,
.pos-bottom .text-head,
.pos-top p,
.pos-center p,
.pos-bottom p {
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.35);
}
</style>
