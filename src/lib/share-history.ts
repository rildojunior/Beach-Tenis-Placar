import type { MatchRecord } from './types'

const WIDTH = 1080
const HEIGHT = 1920
const MAX_MATCHES = 8
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
const FILE_NAME = 'historico-beach-tennis.png'

export const formatDate = (date: string | Date) => new Date(date).toLocaleString('pt-BR')

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`))
    image.src = src
  })
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

/** Corta o texto com "…" para caber na largura. */
function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let result = text
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1)
  }
  return `${result.trimEnd()}…`
}

async function drawHistory(matches: MatchRecord[]): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D indisponível')

  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  gradient.addColorStop(0, '#000000')
  gradient.addColorStop(1, '#1c1c1e')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  const centerX = WIDTH / 2
  const headerTop = 60
  const logoSize = 84

  const logo = await loadImage('/icon-192.png').catch(error => {
    console.warn(error)
    return null
  })
  if (logo) {
    ctx.save()
    roundedRect(ctx, centerX - logoSize / 2, headerTop, logoSize, logoSize, 20)
    ctx.clip()
    ctx.drawImage(logo, centerX - logoSize / 2, headerTop, logoSize, logoSize)
    ctx.restore()
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = '#17cfcf'
  ctx.font = `700 40px ${FONT}`
  ctx.fillText('BEACH TENNIS PLACAR', centerX, headerTop + 120)

  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = `600 24px ${FONT}`
  ctx.fillText(formatDate(new Date()), centerX, headerTop + 160)

  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(120, headerTop + 200)
  ctx.lineTo(WIDTH - 120, headerTop + 200)
  ctx.stroke()

  const left = 160
  const right = WIDTH - 160

  matches.slice(0, MAX_MATCHES).forEach((match, index) => {
    const winnerColor =
      match.winner === 'A' ? match.teamAColors.primary : match.teamBColors.primary
    const winnerName = match.winner === 'A' ? match.teamA : match.teamB
    const cardTop = 285 + index * 190
    const top = cardTop + 22

    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    roundedRect(ctx, 120, cardTop, WIDTH - 240, 150, 22)
    ctx.fill()

    ctx.textBaseline = 'top'

    ctx.textAlign = 'right'
    ctx.font = `800 36px ${FONT}`
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    const scoreText = `${match.gamesA} x ${match.gamesB}`
    ctx.fillText(scoreText, right, top)
    const scoreWidth = ctx.measureText(scoreText).width

    ctx.textAlign = 'left'
    ctx.font = `700 36px ${FONT}`
    ctx.fillStyle = winnerColor
    ctx.fillText(
      fitText(ctx, `🏆 ${winnerName}`, right - left - scoreWidth - 32),
      left,
      top
    )

    // "Time A x Time B", cada nome com metade do espaço disponível.
    ctx.font = `600 24px ${FONT}`
    const nameWidth = (right - left - 60) / 2
    const teamA = fitText(ctx, match.teamA, nameWidth)
    ctx.fillStyle = match.teamAColors.primary
    ctx.fillText(teamA, left, top + 48)
    const teamAWidth = ctx.measureText(teamA).width

    ctx.font = `500 22px ${FONT}`
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText('x', left + teamAWidth + 12, top + 50)

    ctx.font = `600 24px ${FONT}`
    ctx.fillStyle = match.teamBColors.primary
    ctx.fillText(fitText(ctx, match.teamB, nameWidth), left + teamAWidth + 34, top + 48)

    ctx.font = `500 22px ${FONT}`
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillText(formatDate(match.date), left, top + 78)
  })

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `600 22px ${FONT}`
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText(`Histórico das últimas ${MAX_MATCHES} partidas`, centerX, HEIGHT - 80)

  return canvas
}

function download(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = FILE_NAME
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Gera uma imagem do histórico e abre o compartilhamento do celular (ou baixa o arquivo). */
export async function shareHistoryImage(matches: MatchRecord[]) {
  if (matches.length === 0) return

  const canvas = await drawHistory(matches)
  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, 'image/png')
  )
  if (!blob) return

  const file = new File([blob], FILE_NAME, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Histórico de Partidas',
        text: `Últimas ${MAX_MATCHES} partidas no Beach Tennis Placar.`
      })
      return
    } catch (error) {
      // Usuário cancelou o compartilhamento: não baixa o arquivo.
      if (error instanceof DOMException && error.name === 'AbortError') return
      console.error('Falha ao compartilhar:', error)
    }
  }

  download(blob)
}
