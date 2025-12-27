import { useEffect, useRef } from 'react'
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
    FaLink
} from 'react-icons/fa'
import ConceptIcon from '@/components/concepts/concept-icon'
import type { Concept, Reference } from '@/types/concept'

interface ConceptDetailModalProps {
    concept: Concept | null
    allConcepts: Concept[]
    isOpen: boolean
    onClose: () => void
    onNavigateToConcept: (concept: Concept) => void
    onTagClick: (tag: string) => void
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
    onTagClick
}) => {
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

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

    if (!isOpen || !concept) return null

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'
            onClick={handleBackdropClick}
            role='dialog'
            aria-modal='true'
            aria-labelledby='modal-title'
        >
            <div
                ref={modalRef}
                className='bg-background border-primary/10 relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border shadow-2xl'
                tabIndex={-1}
            >
                {/* Header */}
                <div className='border-primary/10 bg-background/95 sticky top-0 z-10 flex items-start justify-between border-b p-6 backdrop-blur-md'>
                    <div className='flex items-center gap-4'>
                        <div className='bg-primary/10 flex h-16 w-16 items-center justify-center rounded-xl'>
                            <ConceptIcon
                                icon={concept.icon}
                                category={concept.category}
                                size='xl'
                            />
                        </div>
                        <div>
                            <div className='flex items-center gap-2'>
                                <h2 id='modal-title' className='text-xl font-bold sm:text-2xl'>
                                    {concept.name}
                                </h2>
                                {concept.featured && <FaStar className='text-secondary h-5 w-5' />}
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
                        <span className='text-sm font-medium'>{concept.category}</span>
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
                    {concept.relatedConcepts && concept.relatedConcepts.length > 0 && (
                        <div>
                            <div className='mb-2 flex items-center gap-2'>
                                <FaLink className='text-secondary h-4 w-4' />
                                <span className='text-primary/60 text-sm'>Related Concepts</span>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {concept.relatedConcepts.map((conceptId) => {
                                    const relatedConcept = allConcepts.find(
                                        (c) => c.id === conceptId
                                    )
                                    if (!relatedConcept) return null
                                    return (
                                        <button
                                            key={conceptId}
                                            onClick={() => onNavigateToConcept(relatedConcept)}
                                            className='bg-secondary/10 hover:bg-secondary/20 text-secondary border-secondary/20 flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors'
                                        >
                                            <ConceptIcon
                                                icon={relatedConcept.icon}
                                                category={relatedConcept.category}
                                                size='sm'
                                            />
                                            {relatedConcept.name}
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
                                <span className='text-primary/60 text-sm'>Related Notes</span>
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
                                        <span className='flex-1 truncate text-sm'>{note}</span>
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
                        icon={<FaGraduationCap className='text-secondary h-4 w-4' />}
                    />
                </div>

                {/* Footer */}
                <div className='border-primary/10 bg-background/95 sticky bottom-0 flex flex-wrap gap-3 border-t p-6 backdrop-blur-md'>
                    <button
                        onClick={onClose}
                        className='bg-primary/10 hover:bg-primary/20 text-primary flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors'
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConceptDetailModal
