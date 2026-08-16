<template>
  <article class="detail-page detail-3">
    <div class="pos-top card-frosty">
      <h1 class="text-head">ATTIRE</h1>
      <h2 class="text-head">FORMAL OR SEMI FORMAL</h2>
      <p>WE ENCOURAGE YOU TO DRESS IN THESE SHADES</p>
      <div>
        <img src="@/assets/details/clothes.png" alt="Attire" class="attire-image" />
        <div class="color-palette">
          <div class="lavender"></div>
          <div class="lilac"></div>
          <div class="pearlwhite"></div>
          <div class="softsilver"></div>
        </div>
      </div>
      <p>STRICTLY, WHITE IS RESERVED FOR THE BRIDE</p>
    </div>
    <div class="pos-center card-frosty">
      <h1 class="text-head">NOTES TO GIFT</h1>
      <p>
        WITH ALL THAT WE HAVE, WE'VE BEEN TRULY BLESSED. YOUR PRESENCE AND PRAYERS ARE ALL THAT WE
        REQUEST. BUT IF YOU DESIRE TO GIVE NONETHELESS, MONETARY GIFT IS ONE WE HUMBLY SUGGEST.
      </p>
    </div>
    <div class="pos-bottom card-frosty">
      <h1 class="text-head text-dikit">CAN I BRING SOMEONE?</h1>
      <p>
        UNFORTUNATELY, DUE TO SPACE AND SEATING CONSTRAINTS, WE KINDLY ASK FOR YOUR UNDERSTANDING
        THAT ONLY THE PEOPLE LISTED IN THE INVITATION WILL BE PRESENT, STRICTLY NO PLUS ONE, AS IT
        ENSURES THAT EVERY GUEST HAS A COMFORTABLE AND ENJOYABLE EXPERIENCE
      </p>
    </div>
  </article>
</template>

<style scoped lang="scss">
.detail-page {
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem;
  font-family: 'Bell MT', serif;
}
.color-palette {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-block: 0.5rem;

  div {
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
