<template>
  <article class="detail-page detail-2">
    <div class="panel">
      <p class="eyebrow">Wedding Ceremony</p>
      <h2 class="title">Marchers</h2>

      <div class="items">
        <div class="line-item">
          <p class="role">Officiating Minister</p>
          <p class="name">Bro. Allan Andres</p>
        </div>

        <div class="line-item">
          <p class="role">Director of the Feast</p>
          <p class="name">Bro. William Patilano II</p>
        </div>

        <div class="line-item">
          <p class="role">Witnesses</p>
          <p class="name">Bro. Jonathan Cabanas and Wife</p>
          <p class="name">Sis. Genevieve Amor and Bro. Kenji Amor</p>
        </div>

        <div class="line-item">
          <p class="role">Parents of the Bride</p>
          <p class="name">Mr. Ricky Cambari and Mrs. Rose Cambari (Grandmother)</p>
        </div>

        <div class="line-item">
          <p class="role">Parents of the Groom</p>
          <p class="name">Mr. Cris Andres and Mrs. Abella Andres</p>
        </div>

        <div class="split-grid">
          <div class="line-item">
            <p class="role">Bible Bearer</p>
            <p class="name">Troy Magollado</p>
          </div>
          <div class="line-item">
            <p class="role">Songbook Bearer</p>
            <p class="name">Prancis June Pipino</p>
          </div>
        </div>

        <div class="split-grid">
          <div class="line-item">
            <p class="role">Ring Bearer</p>
            <p class="name">Ruie Amor</p>
          </div>
          <div class="line-item">
            <p class="role">Best Man</p>
            <p class="name">Aldrin Andres</p>
          </div>
        </div>

        <div class="line-item">
          <p class="role">Maid of Honor</p>
          <p class="name">Mary Joy Lusuegro</p>
        </div>

        <div class="line-item">
          <p class="role">Groomsmen</p>
          <p class="name">Jevy Ababa, Jake Allan Andres, Victor Recamara</p>
        </div>

        <div class="line-item">
          <p class="role">Bridesmaid</p>
          <p class="name">Jeannette Ababa, Andreia Cassandra Albacete, Jhena Marie Malaluan</p>
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
}

.detail-2 {
  /* background:
    radial-gradient(circle at 80% 15%, rgba(145, 97, 209, 0.18), transparent 30%),
    linear-gradient(180deg, #f6f0fc 0%, #fff7fb 100%); */
}

.panel {
  width: 100%;
  max-height: calc(100dvh - 2rem);
  overflow: hidden;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.93);
  border: 1px solid rgba(130, 74, 187, 0.24);
  box-shadow: 0 14px 28px rgba(78, 42, 123, 0.14);
  padding: 1rem 0.9rem;
  box-sizing: border-box;
}

.eyebrow {
  margin: 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.63rem;
  color: #8f63bc;
}

.title {
  margin: 0.3rem 0 0.7rem;
  text-align: center;
  color: #532d80;
  font-size: clamp(1.25rem, 5.8vw, 1.7rem);
}

.items {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.line-item {
  border-left: 3px solid rgba(113, 63, 167, 0.38);
  padding-left: 0.55rem;
}

.role {
  margin: 0;
  font-size: 0.64rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9b77bf;
}

.name {
  margin: 0.2rem 0 0;
  color: #442260;
  font-size: 0.79rem;
  line-height: 1.25;
}

.split-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}
</style>
