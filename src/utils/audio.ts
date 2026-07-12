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

export function playSuccessSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    playNotes([523, 659, 784, 1047], ctx.currentTime, 0.12, 'square', 0.12, ctx)
  } catch { /* audio no disponible */ }
}

export function playClickSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.04)
  } catch { /* audio no disponible */ }
}

export function playToggleOnSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    playNotes([400, 600], ctx.currentTime, 0.06, 'square', 0.1, ctx)
  } catch { /* audio no disponible */ }
}

export function playToggleOffSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    playNotes([600, 400], ctx.currentTime, 0.06, 'square', 0.1, ctx)
  } catch { /* audio no disponible */ }
}

export function playReactionSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    playNotes([880, 1100, 1320], ctx.currentTime, 0.06, 'sine', 0.12, ctx)
  } catch { /* audio no disponible */ }
}

export function playCommentSendSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    playNotes([523, 784, 1047], ctx.currentTime, 0.08, 'sine', 0.1, ctx)
  } catch { /* audio no disponible */ }
}

export function playCopySound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    playNotes([800, 1000], ctx.currentTime, 0.05, 'sine', 0.1, ctx)
  } catch { /* audio no disponible */ }
}

export function playDeleteSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    playNotes([400, 250, 150], ctx.currentTime, 0.15, 'sawtooth', 0.1, ctx)
  } catch { /* audio no disponible */ }
}

export function playCloseSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    playNotes([500, 350], ctx.currentTime, 0.06, 'square', 0.08, ctx)
  } catch { /* audio no disponible */ }
}

export function playOpenSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    playNotes([350, 500], ctx.currentTime, 0.06, 'square', 0.08, ctx)
  } catch { /* audio no disponible */ }
}

export function playStarSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  } catch { /* audio no disponible */ }
}

export function playShuffleSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'
      const t = ctx.currentTime + i * 0.03
      osc.frequency.setValueAtTime(300 + Math.random() * 400, t)
      gain.gain.setValueAtTime(0.06, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03)
      osc.start(t)
      osc.stop(t + 0.03)
    }
  } catch { /* audio no disponible */ }
}

export function playSpinSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(200, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3)
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.6)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.6)
  } catch { /* audio no disponible */ }
}

export function playVoteSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    playNotes([440, 550, 660], ctx.currentTime, 0.1, 'square', 0.1, ctx)
  } catch { /* audio no disponible */ }
}

export function playSwitchSound(): void {
  const ctx = getCtx()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(700, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.05)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.05)
  } catch { /* audio no disponible */ }
}
