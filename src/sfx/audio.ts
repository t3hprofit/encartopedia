// Original WebAudio recreations of period sounds — no ripped Encarta assets.
// A brass-ish fanfare for the splash, a trumpet flourish for MindMaze wins,
// and a soft click for navigation.

let ctx: AudioContext | null = null
let muted = false

function audio(): AudioContext | null {
  if (muted) return null
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function setMuted(m: boolean) {
  muted = m
}

function brassNote(ac: AudioContext, freq: number, start: number, dur: number, gain = 0.12) {
  // two slightly detuned saws through a lowpass reads as "synth brass"
  const out = ac.createGain()
  out.gain.setValueAtTime(0, start)
  out.gain.linearRampToValueAtTime(gain, start + 0.03)
  out.gain.setValueAtTime(gain, start + dur - 0.08)
  out.gain.linearRampToValueAtTime(0, start + dur)
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = freq * 4
  lp.connect(out)
  out.connect(ac.destination)
  for (const detune of [-6, 6]) {
    const osc = ac.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = freq
    osc.detune.value = detune
    osc.connect(lp)
    osc.start(start)
    osc.stop(start + dur)
  }
}

/** Splash-screen fanfare: stately rising triad into a held chord. */
export function playFanfare() {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + 0.05
  const C4 = 261.63, E4 = 329.63, G4 = 392.0, C5 = 523.25, E5 = 659.25
  brassNote(ac, C4, t, 0.35)
  brassNote(ac, E4, t + 0.3, 0.35)
  brassNote(ac, G4, t + 0.6, 0.35)
  // final chord
  for (const f of [C4, G4, C5, E5]) brassNote(ac, f, t + 0.95, 1.4, 0.09)
}

/** MindMaze correct-answer trumpet flourish. */
export function playTrumpet() {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + 0.02
  const G4 = 392.0, C5 = 523.25, E5 = 659.25, G5 = 783.99
  brassNote(ac, G4, t, 0.14, 0.1)
  brassNote(ac, C5, t + 0.12, 0.14, 0.1)
  brassNote(ac, E5, t + 0.24, 0.14, 0.1)
  brassNote(ac, G5, t + 0.36, 0.5, 0.12)
}

/** Dull low "wrong answer" tone. */
export function playWrong() {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + 0.02
  brassNote(ac, 146.83, t, 0.3, 0.1)
  brassNote(ac, 138.59, t + 0.25, 0.45, 0.1)
}

/** Soft UI click. */
export function playClick() {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = 'square'
  osc.frequency.value = 1800
  g.gain.setValueAtTime(0.05, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04)
  osc.connect(g)
  g.connect(ac.destination)
  osc.start(t)
  osc.stop(t + 0.05)
}

/** Heavy castle door creak+thud for MindMaze. */
export function playDoor() {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(70, t)
  osc.frequency.linearRampToValueAtTime(45, t + 0.5)
  g.gain.setValueAtTime(0.14, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
  osc.connect(g)
  g.connect(ac.destination)
  osc.start(t)
  osc.stop(t + 0.65)
}
