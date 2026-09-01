<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { apiFetch, logout } from '@/utils/api'
import { QrcodeStream } from 'qrcode-reader-vue3'

const guests = ref([])
const newGuestName = ref('')
const tableLoading = ref(false)
const addLoading = ref(false)
const addError = ref('')
const copiedId = ref(null)
const deleteTarget = ref(null)
const editingId = ref(null)
const editingName = ref('')
const editingTableNo = ref('')
const expandedId = ref(null)
const statusMenuId = ref(null)
const searchQuery = ref('')
const toastMessage = ref('')
const selectedCard = ref('all')
const statusMenuPosition = ref({ top: 0, left: 0 })
const currentPage = ref(1)
const toastType = ref('success')
const PAGE_SIZE = 10
let toastTimer = null

// ── QR Scanner & Floating Button State ──────────────────────
const isScannerOpen = ref(false)
const scannerLoading = ref(true)
const scannerError = ref('')
const scannerFacingMode = ref('environment')
const scannerKey = ref(0)
const scannedResult = ref(null)
const isScanPaused = ref(false)

// ── Floating Button Bury / Swipe Gesture State ──────────────
const isFabBuried = ref(true)
const touchStartY = ref(null)
const touchStartX = ref(null)
const isDraggingFab = ref(false)
const fabDragDeltaY = ref(0)
let fabTouchStartTime = 0

const onFabTouchStart = (e) => {
  const touch = e.touches ? e.touches[0] : e
  touchStartY.value = touch.clientY
  touchStartX.value = touch.clientX
  fabTouchStartTime = Date.now()
  isDraggingFab.value = true
  fabDragDeltaY.value = 0
}

const onFabTouchMove = (e) => {
  if (!isDraggingFab.value || touchStartY.value === null) return
  const touch = e.touches ? e.touches[0] : e
  const deltaY = touch.clientY - touchStartY.value
  const deltaX = touch.clientX - touchStartX.value

  if (Math.abs(deltaY) > Math.abs(deltaX) || Math.abs(deltaY) > 5) {
    if (isFabBuried.value) {
      fabDragDeltaY.value = Math.min(0, Math.max(-56, deltaY))
    } else {
      fabDragDeltaY.value = Math.max(0, Math.min(56, deltaY))
    }
  }
}

const onFabTouchEnd = (e) => {
  if (!isDraggingFab.value) return
  const touch = e.changedTouches ? e.changedTouches[0] : e
  const deltaY = touchStartY.value !== null ? touch.clientY - touchStartY.value : 0
  const deltaX = touchStartX.value !== null ? touch.clientX - touchStartX.value : 0
  const duration = Date.now() - fabTouchStartTime

  isDraggingFab.value = false
  fabDragDeltaY.value = 0
  touchStartY.value = null
  touchStartX.value = null

  if (deltaY < -15) {
    // Swiped UP -> unbury
    isFabBuried.value = false
    return
  }
  if (deltaY > 15) {
    // Swiped DOWN -> bury
    isFabBuried.value = true
    return
  }

  // Tap without significant movement -> open camera scanner
  if (Math.abs(deltaY) < 10 && Math.abs(deltaX) < 10 && duration < 350) {
    openScanner()
  }
}

const onFabMouseDown = (e) => {
  if (e.button !== 0) return
  onFabTouchStart(e)
  const onMouseMove = (moveEvent) => onFabTouchMove(moveEvent)
  const onMouseUp = (upEvent) => {
    onFabTouchEnd(upEvent)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

const fabStyle = computed(() => {
  if (isDraggingFab.value && fabDragDeltaY.value !== 0) {
    const baseOffset = isFabBuried.value ? 29 : -24
    return {
      transform: `translateY(${baseOffset + fabDragDeltaY.value}px)`,
      transition: 'none',
    }
  }
  return {}
})

const filteredGuests = computed(() => {
  let data = guests.value
  if (selectedCard.value !== 'all') {
    data = guests.value.filter((g) => g.status === selectedCard.value)
  }
  if (!searchQuery.value.trim()) return data
  const q = searchQuery.value.trim().toLowerCase()
  return data.filter((g) => g.name.toLowerCase().includes(q))
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

const inviteLink = (token) => `${window.location.origin}/invite/${token}`

const fetchGuests = async () => {
  if (localStorage.getItem('guests')) {
    guests.value = JSON.parse(localStorage.getItem('guests') || [])
    return
  }
  await getGuests()
}
const getGuests = async () => {
  tableLoading.value = true
  try {
    const res = await apiFetch('/api/admin/guests')
    if (res.status === 401 || res.status === 403) {
      return
    }
    if (res.ok) {
      guests.value = await res.json()
      setLocalStorage()
    }
  } finally {
    tableLoading.value = false
  }
}

const addGuest = async () => {
  if (!newGuestName.value.trim()) return
  addError.value = ''
  addLoading.value = true
  try {
    const res = await apiFetch('/api/admin/guests', {
      method: 'POST',
      body: JSON.stringify({ name: newGuestName.value.trim() }),
    })
    if (res.status === 401 || res.status === 403) {
      return
    }
    if (res.ok) {
      newGuestName.value = ''
      currentPage.value = 1
      guests.value.unshift(await res.json())
      setLocalStorage()
    } else {
      addError.value = 'Failed to add guest. Please try again.'
    }
  } catch {
    addError.value = 'Could not reach the server.'
  } finally {
    addLoading.value = false
  }
}
const setLocalStorage = () => {
  localStorage.setItem('guests', JSON.stringify(guests.value))
}
const confirmDelete = (guest) => {
  deleteTarget.value = guest
}

const deleteGuest = async () => {
  if (!deleteTarget.value) return
  const { id } = deleteTarget.value
  deleteTarget.value = null
  try {
    const res = await apiFetch(`/api/admin/guests/${id}`, {
      method: 'DELETE',
    })
    if (res.status === 401 || res.status === 403) {
      return
    }
    if (res.ok) {
      guests.value = guests.value.filter((g) => g.id !== id)
      setLocalStorage()
      if (currentPage.value > totalPages.value) currentPage.value = Math.max(1, totalPages.value)
    } else {
      showToast('Failed to delete guest.', 'error')
    }
  } catch {
    showToast('Failed to delete guest.', 'error')
  }
}

const startEdit = (guest) => {
  editingId.value = guest.id
  editingName.value = guest.name
  editingTableNo.value = guest.tableNo
}

const cancelEdit = () => {
  editingId.value = null
  editingName.value = ''
  editingTableNo.value = ''
}

const toggleExpand = (id) => {
  if (editingId.value === id) return
  expandedId.value = expandedId.value === id ? null : id
}

const setStatusMenuPosition = (buttonEl) => {
  if (!buttonEl) return
  const rect = buttonEl.getBoundingClientRect()
  const menuWidth = 170
  const gap = 8
  const viewportPadding = 12
  const maxLeft = window.innerWidth - menuWidth - viewportPadding

  statusMenuPosition.value = {
    top: rect.bottom + gap,
    left: Math.max(viewportPadding, Math.min(rect.right - menuWidth, maxLeft)),
  }
}

const toggleStatusMenu = (guestId, event) => {
  if (statusMenuId.value === guestId) {
    closeStatusMenu()
    return
  }
  setStatusMenuPosition(event?.currentTarget)
  statusMenuId.value = guestId
}

const closeStatusMenu = () => {
  statusMenuId.value = null
}

const showToast = (message, type) => {
  toastMessage.value = message
  toastType.value = type || 'info'
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
    toastTimer = null
  }, 2200)
}

const updateGuest = async (id) => {
  if (!editingName.value.trim()) return
  try {
    const res = await apiFetch(`/api/admin/guests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: editingName.value.trim(),
        tableNo: editingTableNo.value.trim() || '',
      }),
    })
    if (res.status === 401 || res.status === 403) {
      return
    }
    if (res.ok) {
      const guest = guests.value.find((g) => g.id === id)
      if (guest) {
        guest.name = editingName.value.trim()
        guest.tableNo = editingTableNo.value.trim() || ''
      }
      cancelEdit()
    } else {
      showToast('Failed to update guest.', 'error')
    }
  } catch {
    showToast('Failed to update guest.', 'error')
  }
}

const setGuestStatus = async (id, status) => {
  try {
    const res = await apiFetch(`/api/guests/${id}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    })
    if (res.status === 401 || res.status === 403) {
      return
    }
    if (res.ok) {
      const guest = guests.value.find((g) => g.token === id)
      if (guest) guest.status = status
      setLocalStorage()
      showToast('Status updated successfully.', 'success')
    } else {
      showToast('Failed to update status.', 'error')
    }
  } catch {
    showToast('Failed to update status.', 'error')
  } finally {
    closeStatusMenu()
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

const handleDocumentClick = () => {
  closeStatusMenu()
}

const handleViewportChange = () => {
  closeStatusMenu()
}

const resetTableNo = async () => {
  tableLoading.value = true
  try {
    const res = await apiFetch('/api/guests/reset/tableNo', {
      method: 'GET',
    })
    if (res.status === 401 || res.status === 403) {
      return
    }
    if (res.ok) {
      guests.value.forEach((guest) => {
        guest.tableNo = null
      })
      setLocalStorage()
      showToast('Table numbers reset successfully.', 'success')
    } else {
      showToast('Failed to reset table numbers.', 'error')
    }
  } catch {
    showToast('Failed to reset table numbers.', 'error')
  } finally {
    tableLoading.value = false
  }
}
void resetTableNo

// ── Scanner Logic & QR Code Handling ────────────────────────
const openScanner = () => {
  isScannerOpen.value = true
  scannerLoading.value = true
  scannerError.value = ''
  scannedResult.value = null
  isScanPaused.value = false
  scannerKey.value++
}

const closeScanner = () => {
  isScannerOpen.value = false
  scannedResult.value = null
  scannerError.value = ''
  scannerLoading.value = false
  isScanPaused.value = false
}

const toggleScannerFacingMode = () => {
  scannerFacingMode.value = scannerFacingMode.value === 'environment' ? 'user' : 'environment'
  scannerKey.value++
}

const retryScanner = () => {
  scannerError.value = ''
  scannerLoading.value = true
  scannerKey.value++
}

const playBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const audioCtx = new AudioContextClass()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, audioCtx.currentTime)
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.16)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.16)
  } catch (err) {
    console.debug('Beep sound not supported:', err)
  }
}

const triggerVibration = () => {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([60, 40, 60])
    }
  } catch (err) {
    console.debug('Vibration not supported:', err)
  }
}

const findGuestByScannedCode = (raw) => {
  if (!raw || !guests.value || guests.value.length === 0) return null
  const str = String(raw).trim()

  // 1. Exact token match
  let matched = guests.value.find((g) => g.token && g.token === str)
  if (matched) return matched

  // 2. Case-insensitive token match
  matched = guests.value.find((g) => g.token && g.token.toLowerCase() === str.toLowerCase())
  if (matched) return matched

  // 3. Match from URL / pathname segments / search params
  try {
    let pathname = str
    if (str.includes('://')) {
      const url = new URL(str)
      pathname = url.pathname
      const qToken = url.searchParams.get('token') || url.searchParams.get('id')
      if (qToken) {
        matched = guests.value.find(
          (g) =>
            (g.token && g.token.toLowerCase() === qToken.toLowerCase()) ||
            String(g.id) === qToken,
        )
        if (matched) return matched
      }
    }
    const segments = pathname.split('/').filter(Boolean)
    for (const seg of segments) {
      matched = guests.value.find((g) => g.token && g.token.toLowerCase() === seg.toLowerCase())
      if (matched) return matched
    }
  } catch (err) {
    console.debug('URL parsing skipped:', err)
  }

  // 4. Substring token match
  matched = guests.value.find(
    (g) => g.token && g.token.length >= 3 && str.toLowerCase().includes(g.token.toLowerCase()),
  )
  if (matched) return matched

  // 5. Match by ID
  matched = guests.value.find((g) => String(g.id) === str)
  if (matched) return matched

  // 6. Match by exact Name
  matched = guests.value.find((g) => g.name && g.name.toLowerCase() === str.toLowerCase())
  if (matched) return matched

  return null
}

const handleScannedCode = (rawCode) => {
  if (!rawCode || isScanPaused.value) return
  isScanPaused.value = true
  playBeep()
  triggerVibration()

  const rawStr =
    typeof rawCode === 'string' ? rawCode : rawCode.rawValue || JSON.stringify(rawCode)
  const matchedGuest = findGuestByScannedCode(rawStr)

  if (matchedGuest) {
    scannedResult.value = {
      guest: matchedGuest,
      rawValue: rawStr,
      notFound: false,
    }
  } else {
    scannedResult.value = {
      guest: null,
      rawValue: rawStr,
      notFound: true,
    }
  }
}

const onDetect = (detectedCodes) => {
  if (detectedCodes && detectedCodes.length > 0) {
    const first = detectedCodes[0]
    const val = first.rawValue || first
    handleScannedCode(val)
  }
}

const onDecode = (decodedString) => {
  if (decodedString) {
    handleScannedCode(decodedString)
  }
}

const onScannerInit = async (promise) => {
  scannerLoading.value = true
  scannerError.value = ''
  try {
    await promise
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      scannerError.value =
        'Camera permission was denied. Please allow camera access in your browser or device settings to scan QR codes.'
    } else if (err.name === 'NotFoundError') {
      scannerError.value = 'No camera device found on this system.'
    } else if (err.name === 'NotSupportedError') {
      scannerError.value =
        'Camera stream requires a secure context (HTTPS or localhost).'
    } else if (err.name === 'NotReadableError') {
      scannerError.value =
        'Camera is currently in use by another application or device.'
    } else if (err.name === 'OverconstrainedError') {
      scannerError.value = 'Camera does not support the requested constraints.'
    } else {
      scannerError.value = `Failed to initialize camera (${err.message || err.name || 'Unknown error'}).`
    }
  } finally {
    scannerLoading.value = false
  }
}

const scanNext = () => {
  scannedResult.value = null
  isScanPaused.value = false
}

const viewGuestInTable = (guest) => {
  if (!guest) return
  searchQuery.value = guest.name
  selectedCard.value = 'all'
  closeScanner()
}

const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    if (scannedResult.value) {
      scanNext()
    } else if (isScannerOpen.value) {
      closeScanner()
    }
  }
}

onMounted(() => {
  fetchGuests()
  document.addEventListener('click', handleDocumentClick)
  window.addEventListener('resize', handleViewportChange)
  window.addEventListener('scroll', handleViewportChange, true)
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('scroll', handleViewportChange, true)
  window.removeEventListener('keydown', handleKeyDown)
  if (toastTimer) clearTimeout(toastTimer)
})
</script>
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
        <div class="stat-card" :class="{ selected: selectedCard === 'all' }" @click="selectedCard = 'all'">
          <span class="stat-value">{{ guests.length }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-card stat-pending" :class="{ selected: selectedCard === 'pending' }"
          @click="selectedCard = 'pending'">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">Pending</span>
        </div>
        <div class="stat-card stat-accepted" :class="{ selected: selectedCard === 'accepted' }"
          @click="selectedCard = 'accepted'">
          <span class="stat-value">{{ acceptedCount }}</span>
          <span class="stat-label">Accepted</span>
        </div>
        <div class="stat-card stat-declined" :class="{ selected: selectedCard === 'rejected' }"
          @click="selectedCard = 'rejected'">
          <span class="stat-value">{{ declinedCount }}</span>
          <span class="stat-label">Declined</span>
        </div>
      </div>

      <!-- Add guest -->
      <section class="panel">
        <h2 class="section-title">Add Guest</h2>
        <div class="add-form">
          <input v-model="newGuestName" type="text" class="add-input" placeholder="Guest full name"
            @keyup.enter="addGuest" />
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
        <div class="d-flex justify-space-between align-center mb-1">
          <h2 class="section-title mb-0">Guests ({{ guests.length }})</h2>
          <div class="d-flex gap-1">
            <!-- <button class="btn-outlined" @click="resetTableNo" :disabled="tableLoading">
              <span>↻ Reset Table Numbers</span>
            </button> -->
            <button class="btn-outlined" @click="getGuests" :disabled="tableLoading">
              <span>↻ Reload Guest List</span>
            </button>
          </div>
        </div>

        <div v-if="!tableLoading && guests.length > 0" class="search-bar">
          <input v-model="searchQuery" type="search" class="search-input" placeholder="Search guests by name…" />
        </div>

        <div v-if="tableLoading" class="table-loading">
          <div class="loading-ring"></div>
        </div>

        <div v-else-if="guests.length === 0" class="empty-state">
          <p>No guests yet. Add your first guest above.</p>
        </div>

        <div v-else class="table-wrap">
          <div v-if="filteredGuests.length === 0" class="empty-state">
            <p v-if="searchQuery.trim()">No guests match “{{ searchQuery }}”.</p>
            <p v-else>No guests available.</p>
          </div>
          <table v-else>
            <thead>
              <tr>
                <th>Name</th>
                <th>Invitation Link</th>
                <th class="text-center">Table Name</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="guest in paginatedGuests" :key="guest.id" :class="{ 'is-expanded': expandedId === guest.id }">
                <td class="td-name" data-label="Name" @click="toggleExpand(guest.id)">
                  <input v-if="editingId === guest.id" v-model="editingName" class="edit-input"
                    @keyup.enter="updateGuest(guest.id)" @keyup.escape="cancelEdit" @click.stop />
                  <span v-else>{{ guest.name }}</span>
                  <span class="expand-chevron" aria-hidden="true">›</span>
                </td>
                <td class="td-link" data-label="Link">
                  <span class="token-text">{{ guest.token }}</span>
                  <button class="copy-btn" @click="copyLink(guest.id, guest.token)"
                    :class="{ copied: copiedId === guest.id }">
                    <span v-if="copiedId === guest.id">✓ Copied</span>
                    <span v-else>Copy</span>
                  </button>
                </td>
                <td data-label="Table Name" class="text-center td-link">
                  <input v-if="editingId === guest.id" v-model="editingTableNo" class="edit-input"
                    @keyup.enter="updateGuest(guest.id)" @keyup.escape="cancelEdit" @click.stop />
                  <span v-else>{{ guest.tableNo }}</span>
                </td>
                <td data-label="Status" :style="{ width: '120px' }">
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
                    <button class="action-btn delete-btn" @click="confirmDelete(guest)" title="Remove guest">
                      🗑
                    </button>
                    <div class="status-menu-wrap" @click.stop>
                      <button class="action-btn more-btn" @click.stop="toggleStatusMenu(guest.token, $event)"
                        title="More actions">
                        •••
                      </button>
                    </div>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="totalPages > 1" class="pagination">
            <span class="pagination-meta">{{ paginationStart }}–{{ paginationEnd }} of {{ filteredGuests.length
            }}</span>
            <div class="page-controls">
              <button class="page-btn" @click="currentPage--" :disabled="currentPage === 1">
                ‹
              </button>
              <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
              <button class="page-btn" @click="currentPage++" :disabled="currentPage === totalPages">
                ›
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Floating Camera Scan Button (Buried at bottom-right, swipe up to float, swipe down to bury) -->
    <button
      type="button"
      class="fab-camera-btn"
      :class="{ 'is-buried': isFabBuried, 'is-dragging': isDraggingFab }"
      :style="fabStyle"
      @touchstart.passive="onFabTouchStart"
      @touchmove.passive="onFabTouchMove"
      @touchend="onFabTouchEnd"
      @mousedown="onFabMouseDown"
      aria-label="Scan Guest QR Code"
      :title="isFabBuried ? 'Swipe up to float or tap to scan' : 'Swipe down to bury or tap to scan'"
    >
      <!-- Swipe indicator hint -->
      <span class="fab-swipe-indicator" aria-hidden="true">
        <svg
          v-if="isFabBuried"
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="camera-svg-icon"
      >
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
      </svg>
      <span v-if="!isFabBuried" class="fab-pulse-ring" aria-hidden="true"></span>
    </button>

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

    <transition name="fade-up-toast">
      <div v-if="toastMessage" class="toast" :class="{
        'toast-success': toastType == 'success',
        'toast-warning': toastType == 'warning',
        'toast-info': toastType == 'info',
        'toast-danger': toastType == 'error',
      }" role="status" aria-live="polite">
        {{ toastMessage }}
      </div>
    </transition>

    <teleport to="body">
      <transition name="fade-up-toast">
        <div v-if="statusMenuId" class="status-menu status-menu-popup"
          :style="{ top: `${statusMenuPosition.top}px`, left: `${statusMenuPosition.left}px` }" @click.stop>
          <button class="status-option" @click="setGuestStatus(statusMenuId, 'pending')">
            Mark as Pending
          </button>
          <button class="status-option" @click="setGuestStatus(statusMenuId, 'accepted')">
            Mark as Accepted
          </button>
          <button class="status-option" @click="setGuestStatus(statusMenuId, 'rejected')">
            Mark as Declined
          </button>
        </div>
      </transition>

      <!-- Fullscreen QR Scanner Modal with Table No Popout -->
      <transition name="scanner-fade">
        <div v-if="isScannerOpen" class="scanner-modal-backdrop" role="dialog" aria-modal="true"
          aria-label="Guest QR Scanner">
          <div class="scanner-modal-shell">
            <!-- Top Bar -->
            <header class="scanner-top-bar">
              <div class="scanner-brand-info">
                <div class="scanner-title-badge">
                  <span class="live-pulse-dot"></span>
                  <span class="scanner-header-title">Guest QR Scanner</span>
                </div>
                <p class="scanner-header-desc">Point camera at guest invitation QR code</p>
              </div>
              <div class="scanner-header-actions">
                <button type="button" class="scanner-tool-btn" @click="toggleScannerFacingMode"
                  title="Switch Camera (Front/Back)" aria-label="Switch Camera">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  <span>Flip</span>
                </button>
                <button type="button" class="scanner-close-btn" @click="closeScanner" aria-label="Close Scanner"
                  title="Close Scanner">
                  ✕
                </button>
              </div>
            </header>

            <!-- Video Stream & Viewfinder Container -->
            <div class="scanner-viewport-area">
              <div class="scanner-stream-wrapper">
                <qrcode-stream :key="scannerKey" :constraints="{ facingMode: scannerFacingMode }" @detect="onDetect"
                  @decode="onDecode" @init="onScannerInit" />

                <!-- Viewfinder frame overlay -->
                <div v-if="!scannerError && !scannerLoading" class="scanner-viewfinder-overlay" aria-hidden="true">
                  <div class="viewfinder-box">
                    <span class="vf-corner tl"></span>
                    <span class="vf-corner tr"></span>
                    <span class="vf-corner bl"></span>
                    <span class="vf-corner br"></span>
                    <div class="vf-laser-line"></div>
                  </div>
                  <p class="vf-hint-text">Align QR code within the frame</p>
                </div>

                <!-- Loading State (Opening Camera / Requesting permission) -->
                <div v-if="scannerLoading" class="scanner-status-card">
                  <div class="loading-ring"></div>
                  <h4>Opening Camera...</h4>
                  <p>Please grant camera permission in your browser when prompted.</p>
                </div>

                <!-- Camera Permission / Error State -->
                <div v-if="scannerError" class="scanner-status-card scanner-error-card">
                  <div class="error-icon-circle">📷</div>
                  <h4>Camera Access Required</h4>
                  <p class="error-msg-text">{{ scannerError }}</p>
                  <div class="error-card-buttons">
                    <button type="button" class="btn-retry" @click="retryScanner">
                      ↻ Allow &amp; Retry
                    </button>
                    <button type="button" class="btn-cancel" @click="closeScanner">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- POP OUT GUEST TABLE NUMBER RESULT -->
            <transition name="popout-zoom">
              <div v-if="scannedResult" class="scanned-popout-overlay" @click.self="scanNext">
                <div class="scanned-popout-card">
                  <!-- Match Found: Display Guest & Table Assignment -->
                  <template v-if="!scannedResult.notFound">
                    <div class="popout-pill-tag">
                      <span class="pill-icon">✦</span>
                      <span>Guest Verified</span>
                    </div>

                    <h3 class="popout-guest-title">{{ scannedResult.guest.name }}</h3>

                    <!-- Table Number Hero Popout -->
                    <div class="popout-table-hero" :class="{ 'has-table': Boolean(scannedResult.guest.tableNo) }">
                      <span class="table-badge-label">TABLE ASSIGNMENT</span>
                      <div class="table-number-box">
                        <template v-if="scannedResult.guest.tableNo">
                          <span class="table-number-val">{{ scannedResult.guest.tableNo }}</span>
                        </template>
                        <template v-else>
                          <span class="table-number-none">No Table Assigned</span>
                        </template>
                      </div>
                      <p v-if="scannedResult.guest.tableNo" class="table-sub-note">
                        Please guide guest to <strong>Table {{ scannedResult.guest.tableNo }}</strong>
                      </p>
                      <p v-else class="table-sub-note">
                        Table number has not been set yet in the guest list
                      </p>
                    </div>

                    <!-- Meta Details Row -->
                    <div class="popout-meta-row">
                      <div class="meta-box">
                        <span class="meta-box-label">RSVP STATUS</span>
                        <span class="badge" :class="`badge-${scannedResult.guest.status}`">
                          {{ scannedResult.guest.status }}
                        </span>
                      </div>
                      <div class="meta-box">
                        <span class="meta-box-label">INVITATION CODE</span>
                        <span class="token-value">{{ scannedResult.guest.token }}</span>
                      </div>
                    </div>
                  </template>

                  <!-- Not Found in Guests list -->
                  <template v-else>
                    <div class="popout-pill-tag pill-warning">
                      <span>⚠️ Unrecognized QR Code</span>
                    </div>
                    <h3 class="popout-guest-title">Guest Not Found</h3>
                    <p class="popout-not-found-desc">
                      No matching guest was found in your guest list for this invitation token.
                    </p>
                    <div class="popout-raw-box">
                      <code>{{ scannedResult.rawValue }}</code>
                    </div>
                  </template>

                  <!-- Action Buttons -->
                  <div class="popout-actions-row">
                    <button type="button" class="popout-btn-primary" @click="scanNext">
                      <span>📷 Scan Next</span>
                    </button>
                    <button v-if="!scannedResult.notFound" type="button" class="popout-btn-secondary"
                      @click="viewGuestInTable(scannedResult.guest)">
                      Find in List
                    </button>
                    <button type="button" class="popout-btn-ghost" @click="closeScanner">
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

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

/* ── Floating Camera Button (FAB) ───────────────────────── */
.fab-camera-btn {
  position: fixed;
  bottom: 0;
  right: 2rem;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  color: #ffffff;
  border: 2px solid rgba(255, 215, 0, 0.55);
  box-shadow:
    0 10px 25px rgba(124, 58, 237, 0.5),
    0 0 20px rgba(111, 71, 198, 0.4);
  cursor: grab;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 95;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  transform: translateY(-24px);
  transition:
    transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease;
  outline: none;

  &:hover {
    transform: translateY(-28px) scale(1.05);
    box-shadow:
      0 14px 32px rgba(124, 58, 237, 0.65),
      0 0 26px rgba(255, 215, 0, 0.35);
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  }

  &:active {
    cursor: grabbing;
  }

  &.is-dragging {
    transition: none !important;
    cursor: grabbing;
  }

  /* Buried half-hidden state at the bottom */
  &.is-buried {
    transform: translateY(29px);
    box-shadow:
      0 -6px 20px rgba(124, 58, 237, 0.55),
      0 0 16px rgba(255, 215, 0, 0.3);
    border-bottom-color: transparent;

    &:hover {
      transform: translateY(22px);
      box-shadow:
        0 -8px 25px rgba(124, 58, 237, 0.7),
        0 0 22px rgba(255, 215, 0, 0.45);
    }

    .camera-svg-icon {
      transform: translateY(-6px);
    }

    .fab-swipe-indicator {
      top: 2px;
      bottom: auto;
      animation: bounceSwipeUp 1.8s ease-in-out infinite;
    }
  }

  .fab-swipe-indicator {
    position: absolute;
    bottom: 3px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255, 255, 255, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    transition: all 0.25s ease;
  }

  .camera-svg-icon {
    position: relative;
    z-index: 2;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    transition: transform 0.25s ease;
  }

  .fab-pulse-ring {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid rgba(124, 58, 237, 0.6);
    pointer-events: none;
    animation: fabPulse 2.4s cubic-bezier(0.25, 1, 0.5, 1) infinite;
  }
}

@keyframes bounceSwipeUp {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
    opacity: 0.9;
  }

  50% {
    transform: translateX(-50%) translateY(-3px);
    opacity: 1;
  }
}

@keyframes fabPulse {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }

  70% {
    transform: scale(1.35);
    opacity: 0;
  }

  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* ── Fullscreen Scanner Modal ──────────────────────────── */
.scanner-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(11, 8, 24, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
}

.scanner-modal-shell {
  position: relative;
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 50% 15%, rgba(111, 71, 198, 0.2) 0%, transparent 60%), #0c0919;
  overflow: hidden;
}

/* Top bar */
.scanner-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.5rem;
  background: rgba(19, 14, 38, 0.75);
  border-bottom: 1px solid rgba(111, 71, 198, 0.25);
  backdrop-filter: blur(12px);
  z-index: 10;
}

.scanner-brand-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.scanner-title-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.live-pulse-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 10px #4ade80;
  animation: pulseDot 1.6s ease-in-out infinite;
}

@keyframes pulseDot {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
}

.scanner-header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
}

.scanner-header-desc {
  margin: 0;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
}

.scanner-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.scanner-tool-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.8rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(111, 71, 198, 0.25);
    border-color: rgba(111, 71, 198, 0.5);
  }
}

.scanner-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(248, 113, 113, 0.25);
    border-color: rgba(248, 113, 113, 0.5);
    color: #f87171;
    transform: rotate(90deg);
  }
}

/* Viewport Area */
.scanner-viewport-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.scanner-stream-wrapper {
  position: relative;
  width: min(92vw, 440px);
  aspect-ratio: 1 / 1;
  border-radius: 20px;
  overflow: hidden;
  background: #000;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(111, 71, 198, 0.35);

  :deep(video) {
    object-fit: cover !important;
    width: 100% !important;
    height: 100% !important;
  }
}

/* Viewfinder overlay */
.scanner-viewfinder-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.viewfinder-box {
  position: relative;
  width: 220px;
  height: 220px;
  border-radius: 16px;
  box-shadow: 0 0 0 9999px rgba(10, 8, 22, 0.45);
}

.vf-corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border-color: #ffd700;
  border-style: solid;
  border-width: 0;

  &.tl {
    top: -2px;
    left: -2px;
    border-top-width: 4px;
    border-left-width: 4px;
    border-top-left-radius: 12px;
  }

  &.tr {
    top: -2px;
    right: -2px;
    border-top-width: 4px;
    border-right-width: 4px;
    border-top-right-radius: 12px;
  }

  &.bl {
    bottom: -2px;
    left: -2px;
    border-bottom-width: 4px;
    border-left-width: 4px;
    border-bottom-left-radius: 12px;
  }

  &.br {
    bottom: -2px;
    right: -2px;
    border-bottom-width: 4px;
    border-right-width: 4px;
    border-bottom-right-radius: 12px;
  }
}

.vf-laser-line {
  position: absolute;
  left: 6px;
  right: 6px;
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, #ffd700 50%, transparent 100%);
  box-shadow:
    0 0 12px #ffd700,
    0 0 4px #fff;
  border-radius: 3px;
  animation: laserScan 2.4s ease-in-out infinite;
}

@keyframes laserScan {
  0% {
    top: 5%;
    opacity: 0;
  }

  15% {
    opacity: 1;
  }

  85% {
    opacity: 1;
  }

  100% {
    top: 93%;
    opacity: 0;
  }
}

.vf-hint-text {
  margin: 1.2rem 0 0;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.75);
  background: rgba(0, 0, 0, 0.6);
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  backdrop-filter: blur(4px);
}

/* Status Cards (Loading & Error) */
.scanner-status-overlay {
  position: absolute;
  inset: 0;
  background: rgba(14, 10, 28, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
  z-index: 20;
}

.scanner-status-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 320px;

  h4 {
    margin: 1rem 0 0.4rem;
    font-size: 1.1rem;
    font-weight: 700;
  }

  p {
    margin: 0;
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.45;
  }
}

.scanner-error-card {
  .error-icon-circle {
    font-size: 2.2rem;
    margin-bottom: 0.25rem;
  }

  .error-msg-text {
    color: #fca5a5;
    margin-top: 0.5rem;
    font-size: 0.84rem;
  }

  .error-card-buttons {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.4rem;
    width: 100%;
  }

  .btn-retry {
    flex: 1;
    padding: 0.65rem 1rem;
    background: #6f47c6;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #8560d8;
    }
  }

  .btn-cancel {
    padding: 0.65rem 1rem;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    font-size: 0.85rem;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }
  }
}

/* ── Pop-out Guest Table Number Result ──────────────────── */
.scanned-popout-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  background: rgba(8, 5, 18, 0.82);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.scanned-popout-card {
  width: min(100%, 380px);
  background: #18132e;
  border: 2px solid #7c3aed;
  border-radius: 20px;
  padding: 1.6rem 1.4rem;
  text-align: center;
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.75),
    0 0 35px rgba(124, 58, 237, 0.35);
  animation: popoutIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes popoutIn {
  from {
    opacity: 0;
    transform: scale(0.85) translateY(15px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.popout-pill-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: rgba(74, 222, 128, 0.12);
  border: 1px solid rgba(74, 222, 128, 0.35);
  color: #4ade80;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 0.6rem;

  .pill-icon {
    color: #ffd700;
  }

  &.pill-warning {
    background: rgba(248, 113, 113, 0.12);
    border-color: rgba(248, 113, 113, 0.35);
    color: #f87171;
  }
}

.popout-guest-title {
  margin: 0 0 1rem;
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
  word-break: break-word;
}

/* Big Table Hero Highlight */
.popout-table-hero {
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(111, 71, 198, 0.4);
  border-radius: 14px;
  padding: 1.1rem 1rem;
  margin-bottom: 1.1rem;

  &.has-table {
    background: linear-gradient(180deg, rgba(124, 58, 237, 0.15) 0%, rgba(124, 58, 237, 0.05) 100%);
    border: 2px solid rgba(255, 215, 0, 0.5);
    box-shadow: 0 8px 24px rgba(111, 71, 198, 0.2);
  }
}

.table-badge-label {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 0.35rem;
}

.table-number-box {
  margin: 0.2rem 0;
}

.table-number-val {
  font-size: 2.6rem;
  font-weight: 800;
  line-height: 1.1;
  color: #ffd700;
  text-shadow:
    0 0 18px rgba(255, 215, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.5);
  display: inline-block;
  letter-spacing: 0.02em;
}

.table-number-none {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  display: inline-block;
  padding: 0.4rem 0;
}

.table-sub-note {
  margin: 0.4rem 0 0;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);

  strong {
    color: #ffd700;
  }
}

/* Meta Row */
.popout-meta-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 1.3rem;
}

.meta-box {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.55rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.meta-box-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.4);
}

.token-value {
  font-family: monospace;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.04em;
}

/* Not found body */
.popout-not-found-desc {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.45;
  margin: 0 0 1rem;
}

.popout-raw-box {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.6rem;
  margin-bottom: 1.3rem;
  word-break: break-all;

  code {
    font-size: 0.75rem;
    color: #fca5a5;
  }
}

/* Popout action buttons */
.popout-actions-row {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.popout-btn-primary {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);
  transition: all 0.2s;

  &:hover {
    background: linear-gradient(135deg, #8b5cf6 0%, #4f46e5 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(124, 58, 237, 0.55);
  }
}

.popout-btn-secondary {
  width: 100%;
  padding: 0.6rem 1rem;
  background: rgba(111, 71, 198, 0.15);
  border: 1px solid rgba(111, 71, 198, 0.35);
  color: rgba(255, 255, 255, 0.85);
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(111, 71, 198, 0.3);
    color: #fff;
    border-color: rgba(111, 71, 198, 0.6);
  }
}

.popout-btn-ghost {
  width: 100%;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.45);
  border-radius: 10px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }
}

/* Modal transitions */
.scanner-fade-enter-active,
.scanner-fade-leave-active {
  transition: opacity 0.25s ease;
}

.scanner-fade-enter-from,
.scanner-fade-leave-to {
  opacity: 0;
}

.popout-zoom-enter-active,
.popout-zoom-leave-active {
  transition: all 0.25s ease;
}

.popout-zoom-enter-from,
.popout-zoom-leave-to {
  opacity: 0;
  transform: scale(0.92);
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
  cursor: pointer;
}

.stat-card.selected {
  border-width: 2px;
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
  width: 120px;
  position: relative;
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

.status-menu-wrap {
  position: relative;
  display: inline-block;
}

.more-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.08em;
}

.more-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.status-menu {
  position: absolute;
  min-width: 170px;
  background: #1a1530;
  border: 1px solid rgba(111, 71, 198, 0.35);
  border-radius: 8px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  z-index: 30;
  display: flex;
  flex-direction: column;
}

.status-menu-popup {
  position: fixed;
  z-index: 140;
}

.status-option {
  width: 100%;
  text-align: left;
  padding: 0.55rem 0.7rem;
  background: transparent;
  border: 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.78rem;
  cursor: pointer;
}

.status-option:hover {
  background: rgba(111, 71, 198, 0.2);
  color: #fff;
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

/* ── Toast ─────────────────────────────────────────────── */
.toast {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 120;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.35);
}

.toast-success {
  background: rgba(46, 125, 50, 0.9);
  border: 1px solid rgba(74, 222, 128, 0.55);
  color: #ecfdf3;
}

.toast-warning {
  background: rgba(180, 83, 9, 0.9);
  border: 1px solid rgba(251, 191, 36, 0.55);
  color: #fff7ed;
}

.toast-info {
  background: rgba(59, 130, 246, 0.9);
  border: 1px solid rgba(147, 197, 253, 0.55);
  color: #eff6ff;
}

.toast-danger {
  background: rgba(183, 28, 28, 0.9);
  border: 1px solid rgba(248, 113, 113, 0.55);
  color: #fef2f2;
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
  .fab-camera-btn {
    right: calc(1.2rem + env(safe-area-inset-right, 0px));
    width: 52px;
    height: 52px;
    transform: translateY(-18px);

    &.is-buried {
      transform: translateY(26px);

      &:hover {
        transform: translateY(20px);
      }
    }
  }

  .scanner-top-bar {
    padding: 0.85rem 1rem;
  }

  .scanner-stream-wrapper {
    width: min(94vw, 360px);
  }

  .viewfinder-box {
    width: 190px;
    height: 190px;
  }

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
    width: 100%;
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

.fade-up-toast-enter-active,
.fade-up-toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-up-toast-enter-from,
.fade-up-toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
