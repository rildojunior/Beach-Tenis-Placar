import { state } from './state.js'
import { clearHistoryStorage, saveHistory } from './storage.js'
import { closeModal, openModal } from './ui.js'
import { getPaletteFallbackByIndex, normalizeTeamColors } from './team-colors.js'

function getMatchTeamColors(match, teamKey) {
  const fallback = teamKey === 'A' ? getPaletteFallbackByIndex(0) : getPaletteFallbackByIndex(1)
  return normalizeTeamColors(teamKey === 'A' ? match.teamAColors : match.teamBColors, fallback)
}

export function saveMatchToHistory() {
  const { pointsA, pointsB, gamesA, gamesB } = state.score

  if (gamesA === 0 && gamesB === 0 && pointsA === 0 && pointsB === 0) return

  let winnerKey = 'A'
  if (gamesB > gamesA) {
    winnerKey = 'B'
  } else if (gamesA === gamesB && pointsB > pointsA) {
    winnerKey = 'B'
  }

  state.matchHistory.unshift({
    teamA: state.teamNames.A,
    teamB: state.teamNames.B,
    teamAColors: normalizeTeamColors(
      state.teamPresets.find(preset => preset.id === state.teamSelection.A)?.colors,
      getPaletteFallbackByIndex(0)
    ),
    teamBColors: normalizeTeamColors(
      state.teamPresets.find(preset => preset.id === state.teamSelection.B)?.colors,
      getPaletteFallbackByIndex(1)
    ),
    gamesA,
    gamesB,
    winner: winnerKey,
    date: new Date().toISOString()
  })

  saveHistory()
}

export function renderHistory(refs) {
  refs.historyList.innerHTML = ''

  if (state.matchHistory.length === 0) {
    refs.historyList.innerHTML = `
      <p class="text-center text-sm opacity-50">
        Nenhuma partida registrada
      </p>
    `
    refs.exportHistoryBtn.disabled = true
    return
  }

  state.matchHistory.forEach(match => {
    const formatted = new Date(match.date).toLocaleString()
    const teamAColors = getMatchTeamColors(match, 'A')
    const teamBColors = getMatchTeamColors(match, 'B')
    const winnerColor = match.winner === 'A' ? teamAColors.primary : teamBColors.primary

    refs.historyList.innerHTML += `
      <div class="bg-white/5 rounded-xl p-3 space-y-1">
        <div class="flex justify-between text-sm font-bold">
          <span style="color:${winnerColor};">
            🏆 ${match.winner === 'A' ? match.teamA : match.teamB}
          </span>
          <span class="opacity-60">${match.gamesA} x ${match.gamesB}</span>
        </div>

        <div class="text-xs opacity-70 flex items-center gap-2">
          <span style="color:${teamAColors.primary};">${match.teamA}</span>
          <span class="opacity-40">x</span>
          <span style="color:${teamBColors.primary};">${match.teamB}</span>
        </div>
        <div class="text-[10px] opacity-40">${formatted}</div>
      </div>
    `
  })

  refs.exportHistoryBtn.disabled = false
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`))
    image.src = src
  })
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const normalizedRadius = Math.min(radius, width / 2, height / 2)

  ctx.beginPath()
  ctx.moveTo(x + normalizedRadius, y)
  ctx.arcTo(x + width, y, x + width, y + height, normalizedRadius)
  ctx.arcTo(x + width, y + height, x, y + height, normalizedRadius)
  ctx.arcTo(x, y + height, x, y, normalizedRadius)
  ctx.arcTo(x, y, x + width, y, normalizedRadius)
  ctx.closePath()
}

export async function exportHistoryImage(refs) {
  if (state.matchHistory.length === 0) return

  const width = 1080
  const height = 1920
  const canvas = refs.historyCanvas
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#0f1115')
  gradient.addColorStop(1, '#1f232a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  let logo = null
  try {
    logo = await loadImage('icon-192.png')
  } catch (error) {
    console.warn(error)
  }

  const headerCenterX = width / 2
  const headerTop = 60
  const logoSize = 84

  if (logo) {
    ctx.save()
    drawRoundedRect(
      ctx,
      headerCenterX - logoSize / 2,
      headerTop,
      logoSize,
      logoSize,
      20
    )
    ctx.clip()
    ctx.drawImage(
      logo,
      headerCenterX - logoSize / 2,
      headerTop,
      logoSize,
      logoSize
    )
    ctx.restore()
  }

  ctx.fillStyle = '#17cfcf'
  ctx.font = "700 40px 'Spline Sans', sans-serif"
  ctx.textAlign = 'center'
  ctx.fillText('BEACH TENNIS PLACAR', headerCenterX, headerTop + 120)

  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = "600 24px 'Spline Sans', sans-serif"
  ctx.fillText(new Date().toLocaleString(), headerCenterX, headerTop + 160)

  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(120, headerTop + 200)
  ctx.lineTo(width - 120, headerTop + 200)
  ctx.stroke()

  state.matchHistory.slice(0, 8).forEach((match, index) => {
    const teamAColors = getMatchTeamColors(match, 'A')
    const teamBColors = getMatchTeamColors(match, 'B')
    const winnerColors = match.winner === 'A' ? teamAColors : teamBColors
    const y = 360 + index * 190
    const cardTop = y - 75
    const blockTop = cardTop + 22

    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    drawRoundedRect(ctx, 120, cardTop, width - 240, 150, 22)
    ctx.fill()

    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.font = "700 36px 'Spline Sans', sans-serif"
    ctx.fillStyle = winnerColors.primary
    ctx.fillText(`🏆 ${match.winner === 'A' ? match.teamA : match.teamB}`, 160, blockTop)

    ctx.textAlign = 'right'
    ctx.font = "800 36px 'Spline Sans', sans-serif"
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillText(`${match.gamesA} x ${match.gamesB}`, width - 160, blockTop)

    ctx.textAlign = 'left'
    ctx.font = "600 24px 'Spline Sans', sans-serif"
    ctx.fillStyle = teamAColors.primary
    ctx.fillText(match.teamA, 160, blockTop + 48)
    const teamAWidth = ctx.measureText(match.teamA).width

    ctx.font = "500 22px 'Spline Sans', sans-serif"
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText('x', 160 + teamAWidth + 12, blockTop + 50)

    const separatorX = 160 + teamAWidth + 34
    ctx.font = "600 24px 'Spline Sans', sans-serif"
    ctx.fillStyle = teamBColors.primary
    ctx.fillText(match.teamB, separatorX, blockTop + 48)

    ctx.font = "500 22px 'Spline Sans', sans-serif"
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillText(new Date(match.date).toLocaleString(), 160, blockTop + 78)
  })

  ctx.textAlign = 'center'
  ctx.font = "600 22px 'Spline Sans', sans-serif"
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText('Histórico das últimas 8 partidas', width / 2, height - 80)

  canvas.toBlob(async blob => {
    if (!blob) return

    const file = new File([blob], 'historico-beach-tennis.png', {
      type: 'image/png'
    })

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Histórico de Partidas',
          text: 'Últimas 8 partidas no Beach Tennis Placar.'
        })
        return
      } catch (error) {
        console.error('Compartilhamento cancelado:', error)
      }
    }

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'historico-beach-tennis.png'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

export function openHistory(refs) {
  renderHistory(refs)
  openModal('historyModal')
}

export function closeHistory() {
  closeModal('historyModal')
}

export function openClearHistoryModal() {
  openModal('clearHistoryModal')
}

export function closeClearHistoryModal() {
  closeModal('clearHistoryModal')
}

export function confirmClearHistory(refs) {
  state.matchHistory = []
  clearHistoryStorage()
  renderHistory(refs)
  closeClearHistoryModal()
}
