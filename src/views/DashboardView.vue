<template>
  <div class="dashboard-page">
    <!-- Background orbs -->
    <div class="bg-orb orb-1" aria-hidden="true"></div>
    <div class="bg-orb orb-2" aria-hidden="true"></div>

    <!-- Top nav -->
    <header class="top-nav">
      <div class="nav-brand">
        <span class="brand-icon">✦</span>
        <span class="brand-label">K &amp; J Wedding</span>
      </div>
      <button class="logout-btn" @click="logout">Sign Out</button>
    </header>

    <main class="main-content">
      <!-- Page heading -->
      <div class="page-heading">
        <h1>Guest List</h1>
        <p>Manage invitations and track RSVPs</p>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-value">{{ guests.length }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-card stat-pending">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">Pending</span>
        </div>
        <div class="stat-card stat-accepted">
          <span class="stat-value">{{ acceptedCount }}</span>
          <span class="stat-label">Accepted</span>
        </div>
        <div class="stat-card stat-declined">
          <span class="stat-value">{{ declinedCount }}</span>
          <span class="stat-label">Declined</span>
        </div>
      </div>

      <!-- Add guest -->
      <section class="panel">
        <h2 class="section-title">Add Guest</h2>
        <div class="add-form">
          <input
            v-model="newGuestName"
            type="text"
            class="add-input"
            placeholder="Guest full name"
            @keyup.enter="addGuest"
          />
          <button class="add-btn" @click="addGuest" :disabled="addLoading || !newGuestName.trim()">
            <span v-if="addLoading" class="btn-spinner"></span>
            <span v-else>Generate Invitation</span>
          </button>
        </div>
        <transition name="fade">
          <p v-if="addError" class="form-error">{{ addError }}</p>
        </transition>
      </section>

      <!-- Guest table -->
      <section class="panel">
        <h2 class="section-title">Guests ({{ guests.length }})</h2>

        <div v-if="!tableLoading && guests.length > 0" class="search-bar">
          <input
            v-model="searchQuery"
            type="search"
            class="search-input"
            placeholder="Search guests by name…"
          />
        </div>

        <div v-if="tableLoading" class="table-loading">
          <div class="loading-ring"></div>
        </div>

        <div v-else-if="guests.length === 0" class="empty-state">
          <p>No guests yet. Add your first guest above.</p>
        </div>

        <div v-else class="table-wrap">
          <div v-if="filteredGuests.length === 0" class="empty-state">
            <p>No guests match “{{ searchQuery }}”.</p>
          </div>
          <table v-else>
            <thead>
              <tr>
                <th>Name</th>
                <th>Invitation Link</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="guest in paginatedGuests"
                :key="guest.id"
                :class="{ 'is-expanded': expandedId === guest.id }"
              >
                <td class="td-name" data-label="Name" @click="toggleExpand(guest.id)">
                  <input
                    v-if="editingId === guest.id"
                    v-model="editingName"
                    class="edit-input"
                    @keyup.enter="updateGuest(guest.id)"
                    @keyup.escape="cancelEdit"
                    @click.stop
                  />
                  <span v-else>{{ guest.name }}</span>
                  <span class="expand-chevron" aria-hidden="true">›</span>
                </td>
                <td class="td-link" data-label="Link">
                  <span class="token-text">{{ guest.token }}</span>
                  <button
                    class="copy-btn"
                    @click="copyLink(guest.id, guest.token)"
                    :class="{ copied: copiedId === guest.id }"
                  >
                    <span v-if="copiedId === guest.id">✓ Copied</span>
                    <span v-else>Copy</span>
                  </button>
                </td>
                <td data-label="Status">
                  <span class="badge" :class="`badge-${guest.status}`">{{ guest.status }}</span>
                </td>
                <td class="td-actions">
                  <template v-if="editingId === guest.id">
                    <button class="action-btn save-btn" @click="updateGuest(guest.id)" title="Save">
                      ✓
                    </button>
                    <button class="action-btn cancel-btn" @click="cancelEdit" title="Cancel">
                      ✕
                    </button>
                  </template>
                  <template v-else>
                    <button class="action-btn edit-btn" @click="startEdit(guest)" title="Edit name">
                      ✎
                    </button>
                    <button
                      class="action-btn delete-btn"
                      @click="confirmDelete(guest)"
                      title="Remove guest"
                    >
                      🗑
                    </button>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="totalPages > 1" class="pagination">
            <span class="pagination-meta"
              >{{ paginationStart }}–{{ paginationEnd }} of {{ filteredGuests.length }}</span
            >
            <div class="page-controls">
              <button class="page-btn" @click="currentPage--" :disabled="currentPage === 1">
                ‹
              </button>
              <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
              <button
                class="page-btn"
                @click="currentPage++"
                :disabled="currentPage === totalPages"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Delete confirmation modal -->
    <transition name="fade">
      <div v-if="deleteTarget" class="modal-backdrop" @click.self="deleteTarget = null">
        <div class="modal">
          <h3>Remove Guest?</h3>
          <p>
            This will permanently delete <strong>{{ deleteTarget.name }}</strong> and their
            invitation.
          </p>
          <div class="modal-actions">
            <button class="modal-cancel" @click="deleteTarget = null">Cancel</button>
            <button class="modal-confirm" @click="deleteGuest">Remove</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const guests = ref([])
const newGuestName = ref('')
const tableLoading = ref(true)
const addLoading = ref(false)
const addError = ref('')
const copiedId = ref(null)
const deleteTarget = ref(null)
const editingId = ref(null)
const editingName = ref('')
const expandedId = ref(null)
const searchQuery = ref('')
const currentPage = ref(1)
const PAGE_SIZE = 10

const filteredGuests = computed(() => {
  if (!searchQuery.value.trim()) return guests.value
  const q = searchQuery.value.trim().toLowerCase()
  return guests.value.filter((g) => g.name.toLowerCase().includes(q))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredGuests.value.length / PAGE_SIZE)))

const paginatedGuests = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredGuests.value.slice(start, start + PAGE_SIZE)
})

const paginationStart = computed(() => (currentPage.value - 1) * PAGE_SIZE + 1)
const paginationEnd = computed(() =>
  Math.min(currentPage.value * PAGE_SIZE, filteredGuests.value.length),
)

watch(searchQuery, () => {
  currentPage.value = 1
})

const acceptedCount = computed(() => guests.value.filter((g) => g.status === 'accepted').length)
const pendingCount = computed(() => guests.value.filter((g) => g.status === 'pending').length)
const declinedCount = computed(() => guests.value.filter((g) => g.status === 'rejected').length)

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const inviteLink = (token) => `${window.location.origin}/${token}`

const fetchGuests = async () => {
  tableLoading.value = true
  try {
    const res = await fetch('http://localhost:3000/api/admin/guests', {
      headers: authHeaders(),
    })
    if (res.status === 401 || res.status === 403) {
      router.push('/admin')
      return
    }
    if (res.ok) guests.value = await res.json()
  } finally {
    tableLoading.value = false
  }
}

const addGuest = async () => {
  if (!newGuestName.value.trim()) return
  addError.value = ''
  addLoading.value = true
  try {
    const res = await fetch('http://localhost:3000/api/admin/guests', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name: newGuestName.value.trim() }),
    })
    if (res.ok) {
      newGuestName.value = ''
      currentPage.value = 1
      await fetchGuests()
    } else {
      addError.value = 'Failed to add guest. Please try again.'
    }
  } catch {
    addError.value = 'Could not reach the server.'
  } finally {
    addLoading.value = false
  }
}

const confirmDelete = (guest) => {
  deleteTarget.value = guest
}

const deleteGuest = async () => {
  if (!deleteTarget.value) return
  const { id } = deleteTarget.value
  deleteTarget.value = null
  try {
    const res = await fetch(`http://localhost:3000/api/admin/guests/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    if (res.ok) {
      guests.value = guests.value.filter((g) => g.id !== id)
      if (currentPage.value > totalPages.value) currentPage.value = Math.max(1, totalPages.value)
    }
  } catch {
    // silent
  }
}

const startEdit = (guest) => {
  editingId.value = guest.id
  editingName.value = guest.name
}

const cancelEdit = () => {
  editingId.value = null
  editingName.value = ''
}

const toggleExpand = (id) => {
  if (editingId.value === id) return
  expandedId.value = expandedId.value === id ? null : id
}

const updateGuest = async (id) => {
  if (!editingName.value.trim()) return
  try {
    const res = await fetch(`http://localhost:3000/api/admin/guests/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ name: editingName.value.trim() }),
    })
    if (res.ok) {
      const guest = guests.value.find((g) => g.id === id)
      if (guest) guest.name = editingName.value.trim()
      cancelEdit()
    }
  } catch {
    // silent
  }
}

const copyLink = async (guestId, token) => {
  try {
    await navigator.clipboard.writeText(inviteLink(token))
    copiedId.value = guestId
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  } catch {
    prompt('Copy this invitation link:', inviteLink(token))
  }
}

const logout = () => {
  localStorage.removeItem('token')
  router.push('/admin')
}

onMounted(fetchGuests)
</script>

<style scoped lang="scss">
/* ── Page ──────────────────────────────────────────────── */
.dashboard-page {
  min-height: 100vh;
  background: #0e0b1f;
  color: #fff;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  position: relative;
  overflow-x: hidden;
}

.bg-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
}
.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(111, 71, 198, 0.5) 0%, transparent 70%);
  top: -160px;
  left: -160px;
}
.orb-2 {
  width: 340px;
  height: 340px;
  background: radial-gradient(circle, rgba(111, 71, 198, 0.2) 0%, transparent 70%);
  bottom: -100px;
  right: -80px;
}

/* ── Nav ───────────────────────────────────────────────── */
.top-nav {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(111, 71, 198, 0.2);
  backdrop-filter: blur(8px);
  background: rgba(14, 11, 31, 0.6);
}
.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.brand-icon {
  width: 30px;
  height: 30px;
  background: #6f47c6;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: #ffd700;
}
.brand-label {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  color: rgba(255, 255, 255, 0.6);
}
.logout-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.55);
  padding: 0.4rem 0.9rem;
  border-radius: 7px;
  font-size: 0.78rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}
.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* ── Main ──────────────────────────────────────────────── */
.main-content {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.page-heading {
  margin-bottom: 1.75rem;
}
.page-heading h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  letter-spacing: -0.01em;
}
.page-heading p {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* ── Stats ─────────────────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.75rem;
}
.stat-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(111, 71, 198, 0.25);
  border-radius: 12px;
  padding: 1.1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.stat-card.stat-accepted {
  border-color: rgba(46, 125, 50, 0.35);
}
.stat-card.stat-pending {
  border-color: rgba(180, 83, 9, 0.35);
}
.stat-card.stat-declined {
  border-color: rgba(183, 28, 28, 0.35);
}
.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
  color: #fff;
}
.stat-accepted .stat-value {
  color: #4ade80;
}
.stat-pending .stat-value {
  color: #fbbf24;
}
.stat-declined .stat-value {
  color: #f87171;
}
.stat-label {
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
}

/* ── Panel ─────────────────────────────────────────────── */
.panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(111, 71, 198, 0.2);
  border-radius: 14px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(8px);
}
.section-title {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 1rem;
}

/* ── Add form ──────────────────────────────────────────── */
.add-form {
  display: flex;
  gap: 0.75rem;
}
.add-input {
  flex: 1;
  padding: 0.65rem 0.9rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.add-input::placeholder {
  color: rgba(255, 255, 255, 0.22);
}
.add-input:focus {
  border-color: #6f47c6;
  box-shadow: 0 0 0 3px rgba(111, 71, 198, 0.25);
}
.add-btn {
  padding: 0.65rem 1.25rem;
  background: #6f47c6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  transition:
    background 0.2s,
    transform 0.15s,
    box-shadow 0.2s;
  box-shadow: 0 4px 14px rgba(111, 71, 198, 0.4);
}
.add-btn:hover:not(:disabled) {
  background: #8560d8;
  transform: translateY(-1px);
}
.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.form-error {
  font-size: 0.78rem;
  color: #f87171;
  margin: 0.6rem 0 0;
}

/* ── Search ────────────────────────────────────────────── */
.search-bar {
  margin-bottom: 1rem;
}
.search-input {
  width: 100%;
  padding: 0.6rem 0.9rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: #fff;
  font-size: 0.88rem;
  outline: none;
  box-sizing: border-box;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.search-input::placeholder {
  color: rgba(255, 255, 255, 0.22);
}
.search-input:focus {
  border-color: #6f47c6;
  box-shadow: 0 0 0 3px rgba(111, 71, 198, 0.25);
}
.search-input::-webkit-search-cancel-button {
  filter: invert(1) opacity(0.4);
  cursor: pointer;
}

/* ── Table ─────────────────────────────────────────────── */
.table-loading {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
.loading-ring {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 215, 0, 0.1);
  border-top-color: #6f47c6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.empty-state {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.9rem;
}
.table-wrap {
  overflow-x: auto;
  border-radius: 8px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
thead tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
th {
  padding: 0.6rem 0.85rem;
  text-align: left;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
}
td {
  padding: 0.75rem 0.85rem;
  vertical-align: middle;
}
td.active {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
tbody tr:last-child td {
  border-bottom: none;
}
tbody tr:hover td {
  background: rgba(111, 71, 198, 0.07);
}
.td-name {
  font-weight: 500;
  color: #fff;
}
.expand-chevron {
  display: none;
}

/* Copy button */
.copy-btn {
  padding: 0.3rem 0.65rem;
  background: rgba(111, 71, 198, 0.15);
  border: 1px solid rgba(111, 71, 198, 0.3);
  border-radius: 5px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
  white-space: nowrap;
}
.token-text {
  font-family: monospace;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.05em;
  margin-right: 0.4rem;
}
.copy-btn:hover {
  background: rgba(111, 71, 198, 0.3);
  color: #fff;
  border-color: rgba(111, 71, 198, 0.6);
}
.copy-btn.copied {
  background: rgba(46, 125, 50, 0.2);
  border-color: rgba(46, 125, 50, 0.4);
  color: #4ade80;
}

/* Status badges */
.badge {
  display: inline-block;
  padding: 0.22rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.badge-pending {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}
.badge-accepted {
  background: rgba(74, 222, 128, 0.12);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.3);
}
.badge-rejected {
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.3);
}

/* Action buttons (edit / save / cancel / delete) */
.td-actions {
  text-align: right;
  white-space: nowrap;
}
.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
  margin-left: 4px;
}
.edit-btn {
  background: transparent;
  border: 1px solid rgba(111, 71, 198, 0.25);
  color: rgba(167, 139, 250, 0.65);
}
.edit-btn:hover {
  background: rgba(111, 71, 198, 0.15);
  color: #a78bfa;
  border-color: rgba(111, 71, 198, 0.5);
}
.save-btn {
  background: rgba(46, 125, 50, 0.15);
  border: 1px solid rgba(74, 222, 128, 0.3);
  color: #4ade80;
}
.save-btn:hover {
  background: rgba(46, 125, 50, 0.3);
}
.cancel-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.35);
}
.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
}
.delete-btn {
  background: transparent;
  border: 1px solid rgba(248, 113, 113, 0.2);
  color: rgba(248, 113, 113, 0.5);
}
.delete-btn:hover {
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.4);
}

/* Inline edit input */
.edit-input {
  width: 100%;
  padding: 0.28rem 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(111, 71, 198, 0.55);
  border-radius: 5px;
  color: #fff;
  font-size: 0.88rem;
  outline: none;
  box-shadow: 0 0 0 2px rgba(111, 71, 198, 0.18);
}

/* ── Pagination ────────────────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0 0;
  margin-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.pagination-meta {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
}
.page-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.page-btn {
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s,
    color 0.2s;
}
.page-btn:hover:not(:disabled) {
  background: rgba(111, 71, 198, 0.2);
  color: #fff;
  border-color: rgba(111, 71, 198, 0.4);
}
.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.page-info {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  min-width: 3rem;
  text-align: center;
}

/* ── Delete modal ──────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}
.modal {
  background: #1a1530;
  border: 1px solid rgba(111, 71, 198, 0.4);
  border-radius: 14px;
  padding: 1.75rem;
  max-width: 360px;
  width: 100%;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  animation: fadeUp 0.25s ease both;
}
.modal h3 {
  font-size: 1.1rem;
  margin: 0 0 0.5rem;
}
.modal p {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 1.5rem;
  line-height: 1.5;
}
.modal strong {
  color: #fff;
}
.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
.modal-cancel {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 7px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}
.modal-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.modal-confirm {
  padding: 0.5rem 1rem;
  background: rgba(183, 28, 28, 0.7);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 7px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.modal-confirm:hover {
  background: #b71c1c;
}

/* ── Spinner ───────────────────────────────────────────── */
.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

/* ── Responsive ────────────────────────────────────────── */
@media (max-width: 600px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .add-form {
    flex-direction: column;
  }
  .top-nav {
    padding: 0.9rem 1rem;
  }
  .main-content {
    padding: 1.25rem 1rem;
  }

  /* Card layout for the guest table */
  .table-wrap {
    overflow-x: visible;
  }
  table thead {
    display: none;
  }
  table,
  tbody,
  tbody tr,
  tbody td {
    display: block;
    width: 100%;
  }
  tbody tr {
    border: 1px solid rgba(111, 71, 198, 0.25);
    border-radius: 10px;
    margin-bottom: 0.65rem;
    padding: 0.25rem 0;
    background: rgba(255, 255, 255, 0.02);
  }
  tbody tr:hover td {
    background: transparent;
  }
  tbody td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.55rem 0.85rem;
    box-sizing: border-box;
    &.active {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
  }
  tbody tr td:last-child {
    border-bottom: none;
  }
  tbody td[data-label]::before {
    content: attr(data-label);
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
    flex-shrink: 0;
  }

  /* Collapsible: hide detail rows by default, show only name */
  tbody td.td-link,
  tbody td[data-label='Status'],
  tbody td.td-actions {
    display: none;
  }
  tbody tr.is-expanded td.td-link,
  tbody tr.is-expanded td[data-label='Status'],
  tbody tr.is-expanded td.td-actions {
    display: flex;
  }

  .td-name {
    font-size: 0.92rem;
    cursor: pointer;
    user-select: none;
  }
  .expand-chevron {
    display: inline-block;
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.3);
    transition:
      transform 0.2s,
      color 0.2s;
    margin-left: auto;
    flex-shrink: 0;
  }
  tbody tr.is-expanded .expand-chevron {
    transform: rotate(90deg);
    color: rgba(111, 71, 198, 0.9);
  }
  .td-actions {
    justify-content: flex-end;
    padding-top: 0.4rem;
    padding-bottom: 0.6rem;
  }
  .edit-input {
    flex: 1;
  }
}

/* ── Animations ────────────────────────────────────────── */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
