/**
 * Notification sounds — generated via the Web Audio API.
 * No external audio files required. Works offline.
 *
 * Usage:
 *   import { playNotifSound, playMessageSound, isSoundEnabled, toggleSound } from '@/lib/notification-sound'
 */

let _ctx = null

function ctx() {
  if (typeof window === 'undefined') return null
  try {
    if (!_ctx || _ctx.state === 'closed') {
      _ctx = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (_ctx.state === 'suspended') _ctx.resume()
    return _ctx
  } catch {
    return null
  }
}

/** Check / toggle user mute preference (persisted in localStorage) */
export function isSoundEnabled() {
  if (typeof window === 'undefined') return true
  return localStorage.getItem('dbs_notif_sound') !== 'off'
}

export function toggleSound() {
  const next = !isSoundEnabled()
  localStorage.setItem('dbs_notif_sound', next ? 'on' : 'off')
  return next
}

/**
 * Two-tone ascending chime for system notifications.
 * ~0.4s total, soft sine wave.
 */
export function playNotifSound() {
  if (!isSoundEnabled()) return
  const ac = ctx()
  if (!ac) return
  try {
    const notes = [880, 1100] // A5 → C#6 minor third (upbeat)
    notes.forEach((freq, i) => {
      const t = ac.currentTime + i * 0.13
      const osc  = ac.createOscillator()
      const gain = ac.createGain()
      osc.connect(gain)
      gain.connect(ac.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.18, t + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
      osc.start(t)
      osc.stop(t + 0.3)
    })
  } catch { /* non-critical */ }
}

/**
 * Short rising "pop" sound for new messages.
 * ~0.2s, lighter than the notification chime.
 */
export function playMessageSound() {
  if (!isSoundEnabled()) return
  const ac = ctx()
  if (!ac) return
  try {
    const t   = ac.currentTime
    const osc  = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, t)
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.06)
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.14, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
    osc.start(t)
    osc.stop(t + 0.2)
  } catch { /* non-critical */ }
}
