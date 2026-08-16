<template>
  <article class="detail-page detail-1">
    <div class="card-frosty">
      <div class="mb-4 w-wmap">
        <p class="mb-2 text-center text-sec font-bell">WE,</p>
        <h1 class="couple-names text-center mb-2 more-fs">Keann &amp; Jenny</h1>
        <p class="text-center text-sec font-bell">JOYOUSLY INVITE YOU TO WITNESS OUR WEDDING</p>
      </div>
      <div>
        <p class="text-center mb-0 font-passport passport-headline">PASSPORT TO MARRIAGE</p>
        <hr />
        <div class="d-flex gap-2" :style="{ padding: '10px' }">
          <div id="image" :style="{ width: '150px', padding: '5px 0' }">
            <img src="@/assets/details/1.jpg" class="w-100 h-100" />
          </div>
          <div :style="{ width: 'calc(100% - 150px)' }" class="font-passport">
            <div class="d-flex flex-column" :style="{ padding: '0 0 8px' }">
              <div class="d-flex gap-1">
                <p class="mb-0">TYPE:</p>
                <p class="mb-0">WEDDING</p>
              </div>
              <div class="d-flex gap-1">
                <p class="mb-0">CODE:</p>
                <p class="mb-0">CITY</p>
              </div>
              <div class="d-flex gap-1">
                <p class="mb-0">PASSPORT ID:</p>
                <p class="mb-0">10092026</p>
              </div>
            </div>
            <hr />
            <div :style="{ marginBottom: '8px' }">
              <p class="mb-0">NAME:</p>
              <p class="mb-0">KEANN ANDRES & JENNY ANN CAMBARI</p>
            </div>
            <div :style="{ marginBottom: '8px' }">
              <p class="mb-0">DATE:</p>
              <p class="mb-0">09 OCTOBER 2026</p>
            </div>
            <div :style="{ marginBottom: '8px' }">
              <p class="mb-0">TIME:</p>
              <p class="mb-0">10:00 AM</p>
            </div>
            <div>
              <p class="mb-0">LOCATION:</p>
              <p class="mb-0">MARCO HOTEL, CDOC</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
#image {
  align-self: stretch;
}

#image img {
  object-fit: cover;
}
.passport-headline {
  font-size: 18px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5b2d8e;
  font-weight: 600;
}
.text-sec {
  color: #000;
  font-size: 20px;
}
hr {
  border: 0;
  height: 2px;
  background: #5b2d8e;
}
.more-fs {
  font-size: clamp(3rem, 6vw, 2rem);
}
.w-wmap {
  background-image: url('@/assets/details/worldmap.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
