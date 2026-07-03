let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext()
    } catch {
      return null
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function playTapSound(): void {
  const ctx = getCtx()
  if (!ctx) return

  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.08)
  } catch {
    /* audio no disponible */
  }
}

function playNotes(notes: number[], baseTime: number, duration: number, type: OscillatorType, gainValue: number, ctx: AudioContext): void {
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    const t = baseTime + i * duration
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(gainValue, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
    osc.start(t)
    osc.stop(t + duration)
  })
}

export function playWinSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    playNotes([523, 659, 784], ctx.currentTime, 0.2, 'square', 0.12, ctx)
  } catch { /* audio no disponible */ }
}

export function playLoseSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    playNotes([400, 350, 300], ctx.currentTime, 0.3, 'sawtooth', 0.1, ctx)
  } catch { /* audio no disponible */ }
}

export function playExplosionSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(150, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.6)
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.6)

    const noise = ctx.createOscillator()
    const noiseGain = ctx.createGain()
    noise.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.type = 'sawtooth'
    noise.frequency.setValueAtTime(2000, ctx.currentTime)
    noise.frequency.setValueAtTime(100, ctx.currentTime + 0.3)
    noiseGain.gain.setValueAtTime(0.08, ctx.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    noise.start(ctx.currentTime)
    noise.stop(ctx.currentTime + 0.3)
  } catch { /* audio no disponible */ }
}

export function playCagadaSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(200, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.5)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch { /* audio no disponible */ }
}

export function playCuleadaSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    playNotes([523, 659, 784, 1047], ctx.currentTime, 0.15, 'square', 0.1, ctx)
  } catch { /* audio no disponible */ }
}

export function playGymSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(300, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1)
    osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.2)
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.35)
  } catch { /* audio no disponible */ }
}
