import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

interface AnimatedCounterProps {
    value: number
    duration?: number
    delay?: number
    className?: string
    formatValue?: (value: number) => string
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    duration = 1.5,
    delay = 0,
    className,
    formatValue = (v) => Math.round(v).toLocaleString()
}) => {
    const ref = useRef<HTMLSpanElement>(null)
    const motionValue = useMotionValue(0)
    const springValue = useSpring(motionValue, {
        duration: duration * 1000,
        bounce: 0
    })
    const isInView = useInView(ref, { once: true, margin: '-50px' })

    useEffect(() => {
        if (isInView) {
            const timeout = setTimeout(() => {
                motionValue.set(value)
            }, delay * 1000)
            return () => clearTimeout(timeout)
        }
        return undefined
    }, [isInView, value, motionValue, delay])

    useEffect(() => {
        const unsubscribe = springValue.on('change', (latest) => {
            if (ref.current) {
                ref.current.textContent = formatValue(latest)
            }
        })
        return unsubscribe
    }, [springValue, formatValue])

    return (
        <span ref={ref} className={className}>
            {formatValue(0)}
        </span>
    )
}

export default AnimatedCounter
