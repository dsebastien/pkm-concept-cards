import { useEffect, useRef, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaTag, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { backdropVariants, scaleFadeVariants } from '@/lib/animations'
import ConceptIcon from '@/components/concepts/concept-icon'
import type { Concept } from '@/types/concept'

export interface TagData {
    name: string
    count: number
    percentage: number
    concepts: Concept[]
}

interface TagDetailModalProps {
    tag: TagData | null
    allTags: TagData[]
    isOpen: boolean
    onClose: () => void
    onNavigateToTag: (tag: TagData) => void
    basePath: string
}

const TagDetailModal: React.FC<TagDetailModalProps> = ({
    tag,
    allTags,
    isOpen,
    onClose,
    onNavigateToTag,
    basePath
}) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
    const scrollPositionRef = useRef<number>(0)

    // Sort tags alphabetically
    const sortedTags = useMemo(() => {
        return [...allTags].sort((a, b) => a.name.localeCompare(b.name))
    }, [allTags])

    // Find current index and prev/next tags
    const currentIndex = useMemo(() => {
        if (!tag) return -1
        return sortedTags.findIndex((t) => t.name === tag.name)
    }, [tag, sortedTags])

    const prevTag = useMemo(() => {
        if (sortedTags.length === 0 || currentIndex === -1) return null
        const prevIndex = currentIndex === 0 ? sortedTags.length - 1 : currentIndex - 1
        return sortedTags[prevIndex]
    }, [sortedTags, currentIndex])

    const nextTag = useMemo(() => {
        if (sortedTags.length === 0 || currentIndex === -1) return null
        const nextIndex = currentIndex === sortedTags.length - 1 ? 0 : currentIndex + 1
        return sortedTags[nextIndex]
    }, [sortedTags, currentIndex])

    const handlePrevious = () => {
        if (prevTag && sortedTags.length > 1) {
            setSlideDirection('right')
            onNavigateToTag(prevTag)
        }
    }

    const handleNext = () => {
        if (nextTag && sortedTags.length > 1) {
            setSlideDirection('left')
            onNavigateToTag(nextTag)
        }
    }

    const handleConceptClick = (conceptId: string) => {
        navigate(`/concept/${conceptId}?from=${basePath}`)
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            } else if (e.key === 'ArrowLeft' && sortedTags.length > 1) {
                handlePrevious()
            } else if (e.key === 'ArrowRight' && sortedTags.length > 1) {
                handleNext()
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                // Allow scrolling with up/down arrows
                const scrollContainer = modalRef.current?.querySelector('.overflow-auto')
                if (scrollContainer) {
                    const scrollAmount = e.key === 'ArrowUp' ? -100 : 100
                    scrollContainer.scrollBy({ top: scrollAmount, behavior: 'smooth' })
                    e.preventDefault()
                }
            }
        }

        if (isOpen) {
            // Try to get saved scroll position from sessionStorage (set before navigation)
            const savedPosition = sessionStorage.getItem('scrollPosition')
            if (savedPosition) {
                scrollPositionRef.current = parseInt(savedPosition, 10)
            } else {
                scrollPositionRef.current = window.scrollY
            }

            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
            document.body.style.position = 'fixed'
            document.body.style.top = `-${scrollPositionRef.current}px`
            document.body.style.width = '100%'
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)

            // Restore body styles when modal closes (scroll position is handled by parent component)
            if (isOpen) {
                document.body.style.overflow = ''
                document.body.style.position = ''
                document.body.style.top = ''
                document.body.style.width = ''
            }
        }
    }, [isOpen, onClose, prevTag, nextTag])

    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus()
        }
    }, [isOpen])

    useEffect(() => {
        if (isOpen && modalRef.current && tag) {
            modalRef.current.scrollTop = 0
        }
    }, [isOpen, tag])

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <AnimatePresence>
            {isOpen && tag && (
                <motion.div
                    initial='initial'
                    animate='animate'
                    exit='exit'
                    variants={backdropVariants}
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'
                    onClick={handleBackdropClick}
                    role='dialog'
                    aria-modal='true'
                    aria-labelledby='modal-title'
                >
                    <motion.div
                        ref={modalRef}
                        variants={scaleFadeVariants}
                        className='bg-background border-primary/10 relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl'
                        tabIndex={-1}
                    >
                        <AnimatePresence mode='wait' initial={false}>
                            <motion.div
                                key={tag.name}
                                initial={
                                    slideDirection
                                        ? { x: slideDirection === 'left' ? 100 : -100, opacity: 0 }
                                        : false
                                }
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: slideDirection === 'left' ? -100 : 100, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className='max-h-[90vh] overflow-auto'
                            >
                                {/* Header */}
                                <div className='border-primary/10 bg-background/95 sticky top-0 z-10 flex items-start justify-between border-b p-6 backdrop-blur-md'>
                                    <div className='flex items-center gap-4'>
                                        <div className='flex h-16 w-16 items-center justify-center rounded-xl bg-rose-500/20'>
                                            <FaTag className='h-7 w-7 text-rose-400' />
                                        </div>
                                        <div className='min-w-0 flex-1'>
                                            <h2
                                                id='modal-title'
                                                className='text-xl font-bold sm:text-2xl'
                                            >
                                                {tag.name}
                                            </h2>
                                            <span className='bg-primary/10 text-primary/60 mt-2 inline-block rounded-full px-2 py-0.5 text-xs'>
                                                {tag.count} concept{tag.count !== 1 ? 's' : ''} (
                                                {tag.percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className='text-primary/60 hover:text-primary hover:bg-primary/10 rounded-lg p-2 transition-colors'
                                        aria-label='Close modal'
                                    >
                                        <FaTimes className='h-5 w-5' />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className='space-y-6 p-6'>
                                    {/* Concepts List */}
                                    <div>
                                        <h3 className='text-primary/80 mb-3 text-sm font-semibold tracking-wider uppercase'>
                                            Concepts with this tag
                                        </h3>
                                        <div className='space-y-2'>
                                            {tag.concepts
                                                .sort((a, b) => a.name.localeCompare(b.name))
                                                .map((concept) => (
                                                    <button
                                                        key={concept.id}
                                                        onClick={() =>
                                                            handleConceptClick(concept.id)
                                                        }
                                                        className='bg-primary/5 hover:bg-primary/10 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors'
                                                    >
                                                        <div className='bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
                                                            <ConceptIcon
                                                                icon={concept.icon}
                                                                category={concept.category}
                                                                size='md'
                                                            />
                                                        </div>
                                                        <div className='min-w-0 flex-1'>
                                                            <div className='font-medium'>
                                                                {concept.name}
                                                            </div>
                                                            <div className='text-primary/60 line-clamp-1 text-sm'>
                                                                {concept.summary}
                                                            </div>
                                                        </div>
                                                        <span className='bg-primary/10 text-primary/60 shrink-0 rounded-full px-2 py-0.5 text-xs'>
                                                            {concept.category}
                                                        </span>
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className='border-primary/10 bg-background/95 sticky bottom-0 flex items-center gap-3 border-t p-4 backdrop-blur-md sm:p-6'>
                                    {/* Previous Button */}
                                    <button
                                        onClick={handlePrevious}
                                        disabled={sortedTags.length <= 1}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors sm:px-4 sm:py-3 ${
                                            sortedTags.length > 1
                                                ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                                                : 'text-primary/30 bg-primary/5 cursor-not-allowed'
                                        }`}
                                        aria-label='Previous tag'
                                        title={
                                            prevTag ? `Previous: ${prevTag.name}` : 'No other tags'
                                        }
                                    >
                                        <FaChevronLeft className='h-4 w-4' />
                                        <span className='hidden sm:inline'>Previous</span>
                                    </button>

                                    {/* Close Button */}
                                    <button
                                        onClick={onClose}
                                        className='bg-primary/10 hover:bg-primary/20 text-primary flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors sm:px-6 sm:py-3'
                                    >
                                        Close
                                    </button>

                                    {/* Next Button */}
                                    <button
                                        onClick={handleNext}
                                        disabled={sortedTags.length <= 1}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors sm:px-4 sm:py-3 ${
                                            sortedTags.length > 1
                                                ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                                                : 'text-primary/30 bg-primary/5 cursor-not-allowed'
                                        }`}
                                        aria-label='Next tag'
                                        title={nextTag ? `Next: ${nextTag.name}` : 'No other tags'}
                                    >
                                        <span className='hidden sm:inline'>Next</span>
                                        <FaChevronRight className='h-4 w-4' />
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default TagDetailModal
