import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import {
    pageVariants,
    fadeInUpVariants,
    staggerContainerVariants,
    staggerItemVariants,
    heroVariants
} from '@/lib/animations'

interface AnimatedPageProps {
    children: ReactNode
    className?: string
}

// Animated page wrapper with fade in/up effect
export const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, className }) => {
    return (
        <motion.div
            initial='initial'
            animate='animate'
            exit='exit'
            variants={pageVariants}
            className={className}
        >
            {children}
        </motion.div>
    )
}

// Animated section with fade in up
export const AnimatedSection: React.FC<AnimatedPageProps> = ({ children, className }) => {
    return (
        <motion.div
            initial='initial'
            whileInView='animate'
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUpVariants}
            className={className}
        >
            {children}
        </motion.div>
    )
}

// Hero section animation
export const AnimatedHero: React.FC<AnimatedPageProps> = ({ children, className }) => {
    return (
        <motion.div
            initial='initial'
            animate='animate'
            variants={heroVariants}
            className={className}
        >
            {children}
        </motion.div>
    )
}

// Stats animation
export const AnimatedStat: React.FC<AnimatedPageProps & { delay?: number }> = ({
    children,
    className,
    delay = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
                opacity: 1,
                scale: 1,
                transition: {
                    duration: 0.4,
                    ease: [0.175, 0.885, 0.32, 1.275],
                    delay
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

// Stagger container for animating children
export const StaggerContainer: React.FC<AnimatedPageProps> = ({ children, className }) => {
    return (
        <motion.div
            initial='initial'
            animate='animate'
            variants={staggerContainerVariants}
            className={className}
        >
            {children}
        </motion.div>
    )
}

// Stagger item for use inside StaggerContainer
export const StaggerItem: React.FC<AnimatedPageProps> = ({ children, className }) => {
    return (
        <motion.div variants={staggerItemVariants} className={className}>
            {children}
        </motion.div>
    )
}

// Animated list with stagger (when items change)
interface AnimatedListProps {
    children: ReactNode
    className?: string
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ children, className }) => {
    return (
        <motion.div
            initial='initial'
            animate='animate'
            variants={staggerContainerVariants}
            className={className}
        >
            <AnimatePresence mode='popLayout'>{children}</AnimatePresence>
        </motion.div>
    )
}

// Animated list item with layout animation
interface AnimatedListItemProps {
    children: ReactNode
    className?: string
    layoutId?: string
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
    children,
    className,
    layoutId
}) => {
    return (
        <motion.div
            layout
            layoutId={layoutId}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

// Re-export AnimatePresence for convenience
export { AnimatePresence, motion }
