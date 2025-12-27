import { useEffect, useRef, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import type { Concept, Reference } from '@/types/concept'

interface ConceptDetailModalProps {
    concept: Concept | null
    allConcepts: Concept[]
    isOpen: boolean
    onClose: () => void
    onNavigateToConcept: (concept: Concept) => void
    onTagClick: (tag: string) => void
    isExplored?: (conceptId: string) => boolean
}

const referenceTypeIcons: Record<string, React.ReactNode> = {
    book: <FaBook className='h-4 w-4 text-amber-400' />,
    paper: <FaNewspaper className='h-4 w-4 text-blue-400' />,
    website: <FaExternalLinkAlt className='h-4 w-4 text-green-400' />,
    video: <FaGraduationCap className='h-4 w-4 text-red-400' />,
    podcast: <FaQuoteLeft className='h-4 w-4 text-purple-400' />,
    other: <FaExternalLinkAlt className='h-4 w-4 text-gray-400' />
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

    // Find current index and prev/next concepts
    const currentIndex = useMemo(() => {
        if (!concept) return -1
        return sortedConcepts.findIndex((c) => c.id === concept.id)
    }, [concept, sortedConcepts])

    const prevConcept = currentIndex > 0 ? sortedConcepts[currentIndex - 1] : null
    const nextConcept =
        currentIndex < sortedConcepts.length - 1 ? sortedConcepts[currentIndex + 1] : null

    const handlePrevious = () => {
        if (prevConcept) {
            setSlideDirection('right')
            onNavigateToConcept(prevConcept)
        }
    }

    const handleNext = () => {
        if (nextConcept) {
            setSlideDirection('left')
            onNavigateToConcept(nextConcept)
        }
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            } else if (e.key === 'ArrowLeft' && prevConcept) {
                handlePrevious()
            } else if (e.key === 'ArrowRight' && nextConcept) {
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
                                        <p className='text-primary/90 text-base leading-relaxed font-medium'>
                                            {concept.summary}
                                        </p>
                                    </div>

                                    {/* Full Explanation */}
                                    <div>
                                        <h3 className='text-primary/80 mb-3 text-sm font-semibold tracking-wider uppercase'>
                                            Explanation
                                        </h3>
                                        <p className='text-primary/80 text-base leading-relaxed whitespace-pre-line'>
                                            {concept.explanation}
                                        </p>
                                    </div>

                                    {/* Category */}
                                    <div className='flex items-center gap-2'>
                                        <FaFolder className='text-secondary h-4 w-4' />
                                        <span className='text-primary/60 text-sm'>Category:</span>
                                        <span className='text-sm font-medium'>
                                            {concept.category}
                                        </span>
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

                                    {/* References Section */}
                                    <ReferenceList
                                        title='References'
                                        references={concept.references || []}
                                        icon={<FaBook className='text-secondary h-4 w-4' />}
                                    />

                                    {/* Articles Section */}
                                    <ReferenceList
                                        title='Articles'
                                        references={concept.articles || []}
                                        icon={<FaNewspaper className='text-secondary h-4 w-4' />}
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
                                        disabled={!prevConcept}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors sm:px-4 sm:py-3 ${
                                            prevConcept
                                                ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                                                : 'text-primary/30 bg-primary/5 cursor-not-allowed'
                                        }`}
                                        aria-label='Previous concept'
                                        title={
                                            prevConcept
                                                ? `Previous: ${prevConcept.name}`
                                                : 'No previous concept'
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
                                        disabled={!nextConcept}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors sm:px-4 sm:py-3 ${
                                            nextConcept
                                                ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                                                : 'text-primary/30 bg-primary/5 cursor-not-allowed'
                                        }`}
                                        aria-label='Next concept'
                                        title={
                                            nextConcept
                                                ? `Next: ${nextConcept.name}`
                                                : 'No next concept'
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
