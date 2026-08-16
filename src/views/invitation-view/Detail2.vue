<template>
  <article class="detail-page detail-2">
    <div class="card-frosty">
      <div :style="{ lineHeight: '1' }" class="mb-1">
        <p class="mb-0 text-center text-header">Andres - Cambari</p>
        <p class="text-center text-head">MARCHERS</p>
      </div>
      <div class="mb-1">
        <p class="text-center font-bell text-uppercase font-weight-bold text-primary">
          Officiating Minister
        </p>
        <p class="text-center">Allan Andres</p>
      </div>
      <div class="mb-1">
        <p class="text-center font-bell text-uppercase font-weight-bold text-primary">
          Director of the Feast
        </p>
        <p class="text-center">William Patilano II</p>
      </div>
      <div class="d-flex justify-space-between mb-1">
        <div>
          <p class="text-center font-bell text-uppercase font-weight-bold text-primary">
            PARENTS (GROOM)
          </p>
          <p class="text-center">Cris Andres</p>
          <p class="text-center">Abella Andres</p>
        </div>
        <div>
          <p class="text-center font-bell text-uppercase font-weight-bold text-primary">
            PARENTS (BRIDE)
          </p>
          <p class="text-center">Ricky Cambari</p>
          <div class="text-center line-height-1">
            <p class="">Rose Cambari</p>
            <small :style="{ fontSize: '10px' }">(Grandmother)</small>
          </div>
        </div>
      </div>
      <div class="d-flex justify-space-between mb-1">
        <div>
          <p class="text-center font-bell text-uppercase font-weight-bold text-primary">
            WITNESS (GROOM)
          </p>
          <p class="text-center">Genevieve Amor</p>
          <p class="text-center">Kenji Amor</p>
        </div>
        <div>
          <p class="text-center font-bell text-uppercase font-weight-bold text-primary">
            WITNESS (BRIDE)
          </p>
          <p class="text-center">Jonathan Cabañas</p>
          <p class="text-center">Jocelyn Cabañas</p>
        </div>
      </div>
      <div class="mb-1">
        <p class="text-center font-bell text-uppercase font-weight-bold text-primary">
          Bible Bearer
        </p>
        <p class="text-center">Troy Magollado</p>
      </div>
      <div class="mb-1">
        <p class="text-center font-bell text-uppercase font-weight-bold text-primary">
          Ring Bearer
        </p>
        <p class="text-center">Ruie Amor</p>
      </div>
      <div class="mb-1">
        <p class="text-center font-bell text-uppercase font-weight-bold text-primary">
          Songbook Bearer
        </p>
        <p class="text-center">Prancis June Pipino</p>
      </div>
      <div class="d-flex justify-space-between mb-1">
        <div>
          <p class="text-center font-bell text-uppercase font-weight-bold text-primary">
            FRIEND (GROOM)
          </p>
          <p class="text-center">Aldrin Andres</p>
        </div>
        <div>
          <p class="text-center font-bell text-uppercase font-weight-bold text-primary">
            FRIEND (BRIDE)
          </p>
          <p class="text-center">Mary Joy Lusuegro</p>
        </div>
      </div>
      <div class="d-flex justify-space-between mb-1">
        <div>
          <p class="text-center font-bell text-uppercase font-weight-bold text-primary">
            GROOMSMEN
          </p>
          <p class="text-center">Jevy Ababa</p>
          <p class="text-center">Jake Allan Andres</p>
          <p class="text-center">Victor Recamara</p>
        </div>
        <div>
          <p class="text-center font-bell text-uppercase font-weight-bold text-primary">
            BRIDESMAIDS
          </p>
          <p class="text-center">Jeannette Ababa</p>
          <p class="text-center">Andreia Albacete</p>
          <p class="text-center">Jhena Malaluan</p>
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
  box-sizing: border-box;
}
.text-header {
  font-family: 'Great Vibes', cursive;
  font-size: clamp(2.7rem, 6vw, 2rem);
  line-height: 1.2;
  color: #5b2d8e;
  font-weight: 600;
}
.text-head {
  font-family: 'Bell MT', serif;
  font-size: clamp(1.2rem, 6vw, 1rem);
  line-height: 1.2;
  color: #505050;
  font-weight: 600;
  letter-spacing: 0.08em;
}
</style>
