import { useEffect, useRef, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaExternalLinkAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { backdropVariants, scaleFadeVariants } from '@/lib/animations'
import ConceptIcon from '@/components/concepts/concept-icon'
import type { ExtractedResource } from '@/types/extracted-resource.intf'
import type { ResourceType } from './resource-card'

const typeLabels: Record<string, string> = {
    paper: 'Paper',
    website: 'Website',
    video: 'Video',
    podcast: 'Podcast',
    other: 'Other'
}

interface ResourceDetailModalProps {
    resource: ExtractedResource | null
    allResources: ExtractedResource[]
    isOpen: boolean
    onClose: () => void
    onNavigateToResource: (resource: ExtractedResource) => void
    resourceType: ResourceType
    icon: React.ReactNode
    colorClass: string
    basePath: string
}

const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
    resource,
    allResources,
    isOpen,
    onClose,
    onNavigateToResource,
    resourceType,
    icon,
    colorClass,
    basePath
}) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
    const scrollPositionRef = useRef<number>(0)

    // Sort resources alphabetically
    const sortedResources = useMemo(() => {
        return [...allResources].sort((a, b) => a.title.localeCompare(b.title))
    }, [allResources])

    // Find current index and prev/next resources
    const currentIndex = useMemo(() => {
        if (!resource) return -1
        return sortedResources.findIndex((r) => r.id === resource.id)
    }, [resource, sortedResources])

    const prevResource = useMemo(() => {
        if (sortedResources.length === 0 || currentIndex === -1) return null
        const prevIndex = currentIndex === 0 ? sortedResources.length - 1 : currentIndex - 1
        return sortedResources[prevIndex]
    }, [sortedResources, currentIndex])

    const nextResource = useMemo(() => {
        if (sortedResources.length === 0 || currentIndex === -1) return null
        const nextIndex = currentIndex === sortedResources.length - 1 ? 0 : currentIndex + 1
        return sortedResources[nextIndex]
    }, [sortedResources, currentIndex])

    const handlePrevious = () => {
        if (prevResource && sortedResources.length > 1) {
            setSlideDirection('right')
            onNavigateToResource(prevResource)
        }
    }

    const handleNext = () => {
        if (nextResource && sortedResources.length > 1) {
            setSlideDirection('left')
            onNavigateToResource(nextResource)
        }
    }

    const handleConceptClick = (conceptId: string) => {
        navigate(`/concept/${conceptId}?from=${basePath}`)
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            } else if (e.key === 'ArrowLeft' && sortedResources.length > 1) {
                handlePrevious()
            } else if (e.key === 'ArrowRight' && sortedResources.length > 1) {
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
    }, [isOpen, onClose, prevResource, nextResource])

    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus()
        }
    }, [isOpen])

    useEffect(() => {
        if (isOpen && modalRef.current && resource) {
            modalRef.current.scrollTop = 0
        }
    }, [isOpen, resource])

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    const resourceTypeLabel = resourceType.charAt(0).toUpperCase() + resourceType.slice(1)

    return (
        <AnimatePresence>
            {isOpen && resource && (
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
                                key={resource.id}
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
                                        <div
                                            className={`flex h-16 w-16 items-center justify-center rounded-xl ${colorClass}`}
                                        >
                                            {icon}
                                        </div>
                                        <div className='min-w-0 flex-1'>
                                            <div className='flex items-center gap-2'>
                                                <h2
                                                    id='modal-title'
                                                    className='text-xl font-bold sm:text-2xl'
                                                >
                                                    {resource.title}
                                                </h2>
                                            </div>
                                            {resource.type && (
                                                <span className='bg-primary/10 text-primary/60 mt-2 inline-block rounded-full px-2 py-0.5 text-xs'>
                                                    {typeLabels[resource.type] || resource.type}
                                                </span>
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
                                    {/* External link */}
                                    <a
                                        href={resource.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='bg-secondary/10 border-secondary/20 hover:bg-secondary/20 flex items-center gap-3 rounded-lg border p-4 transition-colors'
                                    >
                                        <FaExternalLinkAlt className='text-secondary h-4 w-4' />
                                        <span className='flex-1 truncate text-sm'>
                                            {resource.url}
                                        </span>
                                        <span className='text-secondary text-sm font-medium'>
                                            Open {resourceTypeLabel}
                                        </span>
                                    </a>

                                    {/* Related Concepts */}
                                    <div>
                                        <h3 className='text-primary/80 mb-3 text-sm font-semibold tracking-wider uppercase'>
                                            Referenced by {resource.concepts.length} Concept
                                            {resource.concepts.length !== 1 ? 's' : ''}
                                        </h3>
                                        <div className='space-y-2'>
                                            {resource.concepts.map((concept) => (
                                                <button
                                                    key={concept.id}
                                                    onClick={() => handleConceptClick(concept.id)}
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
                                        disabled={sortedResources.length <= 1}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors sm:px-4 sm:py-3 ${
                                            sortedResources.length > 1
                                                ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                                                : 'text-primary/30 bg-primary/5 cursor-not-allowed'
                                        }`}
                                        aria-label='Previous resource'
                                        title={
                                            prevResource
                                                ? `Previous: ${prevResource.title}`
                                                : 'No other resources'
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
                                        disabled={sortedResources.length <= 1}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors sm:px-4 sm:py-3 ${
                                            sortedResources.length > 1
                                                ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                                                : 'text-primary/30 bg-primary/5 cursor-not-allowed'
                                        }`}
                                        aria-label='Next resource'
                                        title={
                                            nextResource
                                                ? `Next: ${nextResource.title}`
                                                : 'No other resources'
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

export default ResourceDetailModal
