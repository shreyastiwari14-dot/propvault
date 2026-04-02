/* ══════════════════════════════════════════
   PropVault — Shared Animation Presets
   ══════════════════════════════════════════ */

export const EASE = [0.22, 1, 0.36, 1] as const
export const EASE_SNAPPY = [0.16, 1, 0.3, 1] as const
export const EASE_BOUNCE = [0.34, 1.56, 0.64, 1] as const
export const EASE_OUT = [0, 0, 0.2, 1] as const

export const DURATION = {
  fast: 0.3,
  normal: 0.6,
  slow: 0.9,
  hero: 1.2,
} as const

/* ── Framer Motion Variants ── */

export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE, delay: i * 0.1 },
  }),
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASE, delay: i * 0.1 },
  }),
}

export const slideFromLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.slow, ease: EASE },
  },
}

export const slideFromRight = {
  hidden: { opacity: 0, x: 50 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE, delay: 0.2 + i * 0.1 },
  }),
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.normal, ease: EASE },
  },
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

export const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE },
  },
}

/* ── Clip-path text reveal ── */
export const clipReveal = {
  hidden: { clipPath: 'inset(0 0 100% 0)' },
  visible: (i: number = 0) => ({
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: 0.8, ease: EASE, delay: i * 0.08 },
  }),
}

/* ── Line reveal (for horizontal rules) ── */
export const lineReveal = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 1, ease: EASE, delay: 0.3 },
  },
}
