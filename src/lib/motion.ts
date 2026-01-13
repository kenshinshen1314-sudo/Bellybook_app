// Apple Spring Physics Presets
export const spring = {
  snappy:   { type: "spring" as const, stiffness: 400, damping: 30 },       // Standard interaction - buttons, card hover
  gentle:   { type: "spring" as const, stiffness: 300, damping: 35 },       // Soft transition - panels, modals
  bouncy:   { type: "spring" as const, stiffness: 500, damping: 25, mass: 0.8 },  // Elastic emphasis - success feedback
  smooth:   { type: "spring" as const, stiffness: 200, damping: 40, mass: 1.2 },  // Elegant settle - page transitions
  inertia:  { type: "spring" as const, stiffness: 150, damping: 20, mass: 0.5 },  // Inertial slide - lists, carousels
}

// Entrance Animations
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
}

export const fadeInDown = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
}

export const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
}

export const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } }
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 35 } }
}

export const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 35 } }
}

// Stagger Animations
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 30 }
  }
}

// Interaction Animations
export const hoverLift = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
}

export const tapScale = {
  tap: { scale: 0.96 }
}

export const pressScale = {
  press: { scale: 0.98 }
}

// Scene Animations
export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 260, damping: 40 }
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
}

export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } }
}

export const modalContent = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 35 }
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
}

export const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  }
}

export const listItemReveal = {
  hidden: { opacity: 0, x: -20 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      delay: index * 0.05
    }
  })
}

// Apple Easing Curves (Non-Spring scenarios)
export const appleEase        = [0.25, 0.1, 0.25, 1.0]   // iOS standard
export const appleEaseOut     = [0.22, 1, 0.36, 1]       // iOS pop-out
export const appleDecelerate  = [0, 0, 0.2, 1]           // iOS deceleration
export const appleAccelerate  = [0.4, 0, 1, 1]           // iOS acceleration

// Viewport Hook Configuration
export const viewportConfig = {
  once: true,        // Trigger only once
  margin: '-100px'   // Trigger 100px early
}
