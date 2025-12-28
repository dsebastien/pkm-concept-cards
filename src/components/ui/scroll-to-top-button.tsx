import { useState, useEffect } from 'react'
import { FaArrowUp } from 'react-icons/fa'
import { cn } from '@/lib/utils'

const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const toggleVisibility = (): void => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        // Detect modal open state by observing body overflow changes
        const checkModalState = (): void => {
            setIsModalOpen(document.body.style.overflow === 'hidden')
        }

        // Create a MutationObserver to watch for body style changes
        const observer = new MutationObserver(checkModalState)
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['style']
        })

        window.addEventListener('scroll', toggleVisibility)
        checkModalState() // Initial check

        return () => {
            window.removeEventListener('scroll', toggleVisibility)
            observer.disconnect()
        }
    }, [])

    const scrollToTop = (): void => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    return (
        <button
            onClick={scrollToTop}
            className={cn(
                'bg-secondary hover:bg-secondary/90 hover:shadow-secondary/30 fixed right-6 bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:shadow-xl sm:right-8 sm:bottom-8 md:h-14 md:w-14 lg:right-10 lg:bottom-10',
                isVisible && !isModalOpen
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-16 opacity-0'
            )}
            aria-label='Scroll to top'
        >
            <FaArrowUp className='text-lg text-white md:text-xl' />
        </button>
    )
}

export default ScrollToTopButton
