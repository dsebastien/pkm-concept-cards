import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
    FaTimes,
    FaExternalLinkAlt,
    FaStar,
    FaTag,
    FaFolder,
    FaBook,
    FaNewspaper,
    FaGraduationCap,
    FaStickyNote,
    FaQuoteLeft,
    FaLink,
    FaCheckCircle,
    FaChevronLeft,
    FaChevronRight
} from 'react-icons/fa'
import { backdropVariants, scaleFadeVariants } from '@/lib/animations'
import ConceptIcon from '@/components/concepts/concept-icon'
import Markdown from '@/components/ui/markdown'
import type { ConceptDetailModalProps } from '@/types/concept-detail-modal-props.intf'
import type { Reference } from '@/types/reference.intf'
import type { Book } from '@/types/book.intf'

// Confetti celebration animation
const triggerConfetti = () => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: ['#e5007d', '#ff1493', '#ffd700', '#00ff88', '#00bfff']
        })
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: ['#e5007d', '#ff1493', '#ffd700', '#00ff88', '#00bfff']
        })

        if (Date.now() < end) {
            requestAnimationFrame(frame)
        }
    }

    // Initial burst
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e5007d', '#ff1493', '#ffd700', '#00ff88', '#00bfff']
    })

    frame()
}

// Icons for reference types (books are displayed separately via BookList)
const referenceTypeIcons: Record<string, React.ReactNode> = {
    paper: <FaNewspaper className='h-4 w-4 text-blue-400' />,
    website: <FaExternalLinkAlt className='h-4 w-4 text-green-400' />,
    video: <FaGraduationCap className='h-4 w-4 text-red-400' />,
    podcast: <FaQuoteLeft className='h-4 w-4 text-purple-400' />,
    other: <FaExternalLinkAlt className='h-4 w-4 text-gray-400' />
}

const BookList: React.FC<{
    books: Book[]
}> = ({ books }) => {
    if (!books || books.length === 0) return null

    return (
        <div>
            <div className='mb-2 flex items-center gap-2'>
                <FaBook className='text-secondary h-4 w-4' />
                <span className='text-primary/60 text-sm'>Recommended Books</span>
            </div>
            <div className='space-y-2'>
                {books.map((book, index) => (
                    <a
                        key={index}
                        href={book.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 transition-colors hover:bg-amber-500/10'
                    >
                        <FaBook className='h-4 w-4 text-amber-400' />
                        <span className='flex-1 text-sm'>{book.title}</span>
                        <FaExternalLinkAlt className='text-primary/40 h-3 w-3' />
                    </a>
                ))}
            </div>
        </div>
    )
}

const ReferenceList: React.FC<{
    title: string
    references: Reference[]
    icon: React.ReactNode
}> = ({ title, references, icon }) => {
    if (!references || references.length === 0) return null

    return (
        <div>
            <div className='mb-2 flex items-center gap-2'>
                {icon}
                <span className='text-primary/60 text-sm'>{title}</span>
            </div>
            <div className='space-y-2'>
                {references.map((ref, index) => (
                    <a
                        key={index}
                        href={ref.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='bg-primary/5 hover:bg-primary/10 flex items-center gap-3 rounded-lg p-3 transition-colors'
                    >
                        {referenceTypeIcons[ref.type] || referenceTypeIcons['other']}
                        <span className='flex-1 text-sm'>{ref.title}</span>
                        <FaExternalLinkAlt className='text-primary/40 h-3 w-3' />
                    </a>
                ))}
            </div>
        </div>
    )
}

const ConceptDetailModal: React.FC<ConceptDetailModalProps> = ({
    concept,
    allConcepts,
    isOpen,
    onClose,
    onNavigateToConcept,
    onTagClick,
    onCategoryClick,
    isExplored
}) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)

    // Sort concepts the same way as displayed (featured first, then alphabetically)
    const sortedConcepts = useMemo(() => {
        return [...allConcepts].sort((a, b) => {
            if (a.featured && !b.featured) return -1
            if (!a.featured && b.featured) return 1
            return a.name.localeCompare(b.name)
        })
    }, [allConcepts])

    // Find current index and prev/next concepts (carousel style - wraps around)
    const currentIndex = useMemo(() => {
        if (!concept) return -1
        return sortedConcepts.findIndex((c) => c.id === concept.id)
    }, [concept, sortedConcepts])

    const prevConcept = useMemo(() => {
        if (sortedConcepts.length === 0 || currentIndex === -1) return null
        // Wrap to last item if at the beginning
        const prevIndex = currentIndex === 0 ? sortedConcepts.length - 1 : currentIndex - 1
        return sortedConcepts[prevIndex]
    }, [sortedConcepts, currentIndex])

    const nextConcept = useMemo(() => {
        if (sortedConcepts.length === 0 || currentIndex === -1) return null
        // Wrap to first item if at the end
        const nextIndex = currentIndex === sortedConcepts.length - 1 ? 0 : currentIndex + 1
        return sortedConcepts[nextIndex]
    }, [sortedConcepts, currentIndex])

    // Track if collection was not fully explored when modal opened
    const wasNotAllExploredOnOpen = useRef(false)
    const lastCollectionKey = useRef<string>('')

    // Generate a stable key for the current collection
    const collectionKey = useMemo(() => {
        return sortedConcepts.map((c) => c.id).join(',')
    }, [sortedConcepts])

    // Check if all concepts are explored
    const checkAllExplored = useCallback(() => {
        if (!isExplored || sortedConcepts.length === 0) return false
        return sortedConcepts.every((c) => isExplored(c.id))
    }, [sortedConcepts, isExplored])

    // Capture state when modal opens or collection changes
    useEffect(() => {
        if (isOpen && concept) {
            // If collection changed, reset the tracking
            if (collectionKey !== lastCollectionKey.current) {
                lastCollectionKey.current = collectionKey
                // Check if NOT all explored when we open
                wasNotAllExploredOnOpen.current = !checkAllExplored()
            }
        }
    }, [isOpen, concept, collectionKey, checkAllExplored])

    // Check for collection completion after concept is marked as explored
    useEffect(() => {
        if (!isOpen || !concept) return

        // Small delay to ensure parent's markAsExplored has run
        const timer = setTimeout(() => {
            const allExplored = checkAllExplored()

            // Show confetti only if:
            // 1. All concepts are now explored
            // 2. They weren't all explored when we opened the modal
            if (allExplored && wasNotAllExploredOnOpen.current) {
                triggerConfetti()
                wasNotAllExploredOnOpen.current = false // Prevent re-triggering
            }
        }, 150)

        return () => clearTimeout(timer)
    }, [isOpen, concept, checkAllExplored])

    const handlePrevious = () => {
        if (prevConcept && sortedConcepts.length > 1) {
            setSlideDirection('right')
            onNavigateToConcept(prevConcept)
        }
    }

    const handleNext = () => {
        if (nextConcept && sortedConcepts.length > 1) {
            setSlideDirection('left')
            onNavigateToConcept(nextConcept)
        }
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            } else if (e.key === 'ArrowLeft' && sortedConcepts.length > 1) {
                handlePrevious()
            } else if (e.key === 'ArrowRight' && sortedConcepts.length > 1) {
                handleNext()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose, prevConcept, nextConcept])

    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus()
        }
    }, [isOpen])

    useEffect(() => {
        if (isOpen && modalRef.current && concept) {
            modalRef.current.scrollTop = 0
        }
    }, [isOpen, concept])

    const currentConceptExplored = concept ? (isExplored?.(concept.id) ?? false) : false

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <AnimatePresence>
            {isOpen && concept && (
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
                                key={concept.id}
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
                                <div
                                    className={`sticky top-0 z-10 flex items-start justify-between border-b p-6 backdrop-blur-md ${
                                        currentConceptExplored
                                            ? 'border-green-500/20 bg-green-500/5'
                                            : 'border-primary/10 bg-background/95'
                                    }`}
                                >
                                    <div className='flex items-center gap-4'>
                                        <div
                                            className={`relative flex h-16 w-16 items-center justify-center rounded-xl ${
                                                currentConceptExplored
                                                    ? 'bg-green-500/20'
                                                    : 'bg-primary/10'
                                            }`}
                                        >
                                            <ConceptIcon
                                                icon={concept.icon}
                                                category={concept.category}
                                                size='xl'
                                            />
                                            {currentConceptExplored && (
                                                <FaCheckCircle className='absolute -right-1 -bottom-1 h-5 w-5 text-green-500' />
                                            )}
                                        </div>
                                        <div>
                                            <div className='flex items-center gap-2'>
                                                <h2
                                                    id='modal-title'
                                                    className='text-xl font-bold sm:text-2xl'
                                                >
                                                    {concept.name}
                                                </h2>
                                                {concept.featured && (
                                                    <FaStar className='text-secondary h-5 w-5' />
                                                )}
                                                {currentConceptExplored && (
                                                    <span className='flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400'>
                                                        <FaCheckCircle className='h-2.5 w-2.5' />
                                                        Explored
                                                    </span>
                                                )}
                                            </div>
                                            {concept.aliases && concept.aliases.length > 0 && (
                                                <p className='text-primary/50 mt-1 text-sm italic'>
                                                    Also known as: {concept.aliases.join(', ')}
                                                </p>
                                            )}
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
                                    {/* Summary */}
                                    <div className='bg-secondary/10 border-secondary/20 rounded-lg border p-4'>
                                        <div className='text-primary/90 text-base leading-relaxed font-medium'>
                                            <Markdown compact>{concept.summary}</Markdown>
                                        </div>
                                    </div>

                                    {/* Full Explanation */}
                                    <div>
                                        <h3 className='text-primary/80 mb-3 text-sm font-semibold tracking-wider uppercase'>
                                            Explanation
                                        </h3>
                                        <div className='text-primary/80 text-base leading-relaxed'>
                                            <Markdown>{concept.explanation}</Markdown>
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className='flex items-center gap-2'>
                                        <FaFolder className='text-secondary h-4 w-4' />
                                        <span className='text-primary/60 text-sm'>Category:</span>
                                        <button
                                            onClick={() => onCategoryClick(concept.category)}
                                            className='bg-primary/5 hover:bg-primary/10 text-primary/70 hover:text-primary/90 cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-colors'
                                        >
                                            {concept.category}
                                        </button>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <div className='mb-2 flex items-center gap-2'>
                                            <FaTag className='text-secondary h-4 w-4' />
                                            <span className='text-primary/60 text-sm'>Tags</span>
                                        </div>
                                        <div className='flex flex-wrap gap-2'>
                                            {concept.tags.map((tag) => (
                                                <button
                                                    key={tag}
                                                    onClick={() => onTagClick(tag)}
                                                    className='bg-primary/5 hover:bg-primary/10 text-primary/70 hover:text-primary/90 cursor-pointer rounded-full px-3 py-1.5 text-sm transition-colors'
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Related Concepts */}
                                    {concept.relatedConcepts &&
                                        concept.relatedConcepts.length > 0 && (
                                            <div>
                                                <div className='mb-2 flex items-center gap-2'>
                                                    <FaLink className='text-secondary h-4 w-4' />
                                                    <span className='text-primary/60 text-sm'>
                                                        Related Concepts
                                                    </span>
                                                </div>
                                                <div className='flex flex-wrap gap-2'>
                                                    {concept.relatedConcepts.map((conceptId) => {
                                                        const relatedConcept = allConcepts.find(
                                                            (c) => c.id === conceptId
                                                        )
                                                        if (!relatedConcept) return null
                                                        const explored =
                                                            isExplored?.(conceptId) ?? false
                                                        return (
                                                            <button
                                                                key={conceptId}
                                                                onClick={() =>
                                                                    onNavigateToConcept(
                                                                        relatedConcept
                                                                    )
                                                                }
                                                                className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                                                                    explored
                                                                        ? 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                                        : 'bg-secondary/10 hover:bg-secondary/20 text-secondary border-secondary/20'
                                                                }`}
                                                            >
                                                                <ConceptIcon
                                                                    icon={relatedConcept.icon}
                                                                    category={
                                                                        relatedConcept.category
                                                                    }
                                                                    size='sm'
                                                                />
                                                                {relatedConcept.name}
                                                                {explored && (
                                                                    <FaCheckCircle className='h-3 w-3 text-green-500' />
                                                                )}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                    {/* Related Notes */}
                                    {concept.relatedNotes && concept.relatedNotes.length > 0 && (
                                        <div>
                                            <div className='mb-2 flex items-center gap-2'>
                                                <FaStickyNote className='text-secondary h-4 w-4' />
                                                <span className='text-primary/60 text-sm'>
                                                    Related Notes
                                                </span>
                                            </div>
                                            <div className='space-y-2'>
                                                {concept.relatedNotes.map((note, index) => (
                                                    <a
                                                        key={index}
                                                        href={note}
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        className='bg-primary/5 hover:bg-primary/10 flex items-center gap-3 rounded-lg p-3 transition-colors'
                                                    >
                                                        <FaStickyNote className='h-4 w-4 text-yellow-400' />
                                                        <span className='flex-1 truncate text-sm'>
                                                            {note}
                                                        </span>
                                                        <FaExternalLinkAlt className='text-primary/40 h-3 w-3' />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Articles Section */}
                                    <ReferenceList
                                        title='Articles'
                                        references={concept.articles || []}
                                        icon={<FaNewspaper className='text-secondary h-4 w-4' />}
                                    />

                                    {/* Books Section */}
                                    <BookList books={concept.books || []} />

                                    {/* References Section */}
                                    <ReferenceList
                                        title='References'
                                        references={concept.references || []}
                                        icon={<FaLink className='text-secondary h-4 w-4' />}
                                    />

                                    {/* Tutorials Section */}
                                    <ReferenceList
                                        title='Tutorials'
                                        references={concept.tutorials || []}
                                        icon={
                                            <FaGraduationCap className='text-secondary h-4 w-4' />
                                        }
                                    />
                                </div>

                                {/* Footer */}
                                <div className='border-primary/10 bg-background/95 sticky bottom-0 flex items-center gap-3 border-t p-4 backdrop-blur-md sm:p-6'>
                                    {/* Previous Button */}
                                    <button
                                        onClick={handlePrevious}
                                        disabled={sortedConcepts.length <= 1}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors sm:px-4 sm:py-3 ${
                                            sortedConcepts.length > 1
                                                ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                                                : 'text-primary/30 bg-primary/5 cursor-not-allowed'
                                        }`}
                                        aria-label='Previous concept'
                                        title={
                                            prevConcept
                                                ? `Previous: ${prevConcept.name}`
                                                : 'No other concepts'
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
                                        disabled={sortedConcepts.length <= 1}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors sm:px-4 sm:py-3 ${
                                            sortedConcepts.length > 1
                                                ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                                                : 'text-primary/30 bg-primary/5 cursor-not-allowed'
                                        }`}
                                        aria-label='Next concept'
                                        title={
                                            nextConcept
                                                ? `Next: ${nextConcept.name}`
                                                : 'No other concepts'
                                        }
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

export default ConceptDetailModal
