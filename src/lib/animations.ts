import type { Variants } from 'framer-motion'

// Page transition animations
export const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: 'easeOut'
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3,
            ease: 'easeIn'
        }
    }
}

// Fade in animation
export const fadeInVariants: Variants = {
    initial: {
        opacity: 0
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: 'easeOut'
        }
    }
}

// Fade in up animation
export const fadeInUpVariants: Variants = {
    initial: {
        opacity: 0,
        y: 30
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: 'easeOut'
        }
    }
}

// Stagger container for children animations
export const staggerContainerVariants: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
}

// Stagger item animation
export const staggerItemVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.95
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut'
        }
    }
}

// Scale fade animation (for modals, cards on hover)
export const scaleFadeVariants: Variants = {
    initial: {
        opacity: 0,
        scale: 0.95
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.2,
            ease: 'easeOut'
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: 0.15,
            ease: 'easeIn'
        }
    }
}

// Backdrop animation
export const backdropVariants: Variants = {
    initial: {
        opacity: 0
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.2
        }
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.15
        }
    }
}

// Slide in from right (for sidebars, panels)
export const slideInRightVariants: Variants = {
    initial: {
        x: '100%',
        opacity: 0
    },
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut'
        }
    },
    exit: {
        x: '100%',
        opacity: 0,
        transition: {
            duration: 0.2,
            ease: 'easeIn'
        }
    }
}

// Progress bar animation
export const progressVariants: Variants = {
    initial: {
        width: 0
    },
    animate: (width: number) => ({
        width: `${width}%`,
        transition: {
            duration: 0.8,
            ease: 'easeOut',
            delay: 0.3
        }
    })
}

// Stats counter animation
export const statsVariants: Variants = {
    initial: {
        opacity: 0,
        scale: 0.5
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.175, 0.885, 0.32, 1.275] // Back ease out
        }
    }
}

// Hero section animation
export const heroVariants: Variants = {
    initial: {
        opacity: 0,
        y: 40
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut'
        }
    }
}

// Card hover animation (for use with whileHover)
export const cardHoverAnimation = {
    scale: 1.02,
    transition: {
        duration: 0.2,
        ease: 'easeOut'
    }
}

// Card tap animation (for use with whileTap)
export const cardTapAnimation = {
    scale: 0.98
}
