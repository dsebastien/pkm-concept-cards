import { useMemo, useState, useCallback, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { FaCompass, FaArrowLeft, FaEnvelope, FaTh, FaList } from 'react-icons/fa'
import Section from '@/components/ui/section'
import ConceptCard from '@/components/concepts/concept-card'
import ConceptDetailModal from '@/components/concepts/concept-detail-modal'
import { conceptsData } from '@/data'
import { useExploredConcepts } from '@/hooks/use-explored-concepts'
import type { Concept } from '@/types/concept'

const UnexploredPage: React.FC = () => {
    const { conceptId } = useParams<{ conceptId?: string }>()
    const navigate = useNavigate()
    const { isExplored, markAsExplored } = useExploredConcepts()
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const unexploredConcepts = useMemo(() => {
        return conceptsData.concepts
            .filter((concept) => !isExplored(concept.id))
            .sort((a, b) => {
                // Featured first, then alphabetically
                if (a.featured && !b.featured) return -1
                if (!a.featured && b.featured) return 1
                return a.name.localeCompare(b.name)
            })
    }, [isExplored])

    const totalConcepts = conceptsData.concepts.length
    const unexploredCount = unexploredConcepts.length
    const exploredCount = totalConcepts - unexploredCount
    const progressPercentage = Math.round((exploredCount / totalConcepts) * 100)

    // Selected concept for modal
    const selectedConcept = useMemo(() => {
        if (!conceptId) return null
        return conceptsData.concepts.find((c) => c.id === conceptId) || null
    }, [conceptId])

    const isDetailModalOpen = !!selectedConcept

    // Mark concept as explored when modal opens
    useEffect(() => {
        if (conceptId) {
            markAsExplored(conceptId)
        }
    }, [conceptId, markAsExplored])

    const handleShowDetails = useCallback(
        (concept: Concept) => {
            navigate(`/unexplored/concept/${concept.id}`)
        },
        [navigate]
    )

    const handleCloseDetails = useCallback(() => {
        navigate('/unexplored')
    }, [navigate])

    const handleNavigateToConcept = useCallback(
        (concept: Concept) => {
            navigate(`/unexplored/concept/${concept.id}`)
        },
        [navigate]
    )

    const handleTagClick = useCallback(
        (tag: string) => {
            navigate(`/tag/${encodeURIComponent(tag)}`)
        },
        [navigate]
    )

    // All concepts explored - show congratulations
    if (unexploredCount === 0) {
        return (
            <>
                <Section className='pt-16 pb-8 sm:pt-24 sm:pb-12'>
                    <div className='mx-auto max-w-4xl'>
                        <Link
                            to='/'
                            className='text-primary/70 hover:text-secondary mb-6 inline-flex items-center gap-2 text-sm transition-colors'
                        >
                            <FaArrowLeft className='h-3 w-3' />
                            Back to Concepts
                        </Link>
                    </div>
                </Section>

                <Section className='py-16'>
                    <div className='mx-auto max-w-2xl text-center'>
                        <div className='mb-8 text-8xl'>🎉</div>
                        <h1 className='mb-6 text-4xl font-bold tracking-tight sm:text-5xl'>
                            Congratulations!
                        </h1>
                        <p className='text-primary/70 mb-8 text-xl'>
                            You've explored all {totalConcepts} concepts in the collection. That's
                            an incredible achievement!
                        </p>

                        <div className='bg-primary/5 mb-10 rounded-xl p-6'>
                            <div className='mb-4 flex items-center justify-center gap-2'>
                                <div className='h-4 max-w-xs flex-1 overflow-hidden rounded-full bg-green-500/20'>
                                    <div
                                        className='h-full rounded-full bg-green-500 transition-all duration-500'
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <span className='font-medium text-green-400'>100%</span>
                            </div>
                            <p className='text-primary/60 text-sm'>
                                {totalConcepts} of {totalConcepts} concepts explored
                            </p>
                        </div>

                        <div className='border-primary/10 border-t pt-10'>
                            <h2 className='mb-4 text-xl font-semibold'>Want more?</h2>
                            <p className='text-primary/70 mb-6'>
                                Subscribe to my newsletter for more insights on knowledge
                                management, productivity, and personal development.
                            </p>
                            <a
                                href='https://dsebastien.net/newsletter'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-colors'
                            >
                                <FaEnvelope className='h-4 w-4' />
                                Subscribe to Newsletter
                            </a>
                        </div>
                    </div>
                </Section>
            </>
        )
    }

    return (
        <>
            {/* Header */}
            <Section className='pt-16 pb-8 sm:pt-24 sm:pb-12'>
                <div className='mx-auto max-w-4xl'>
                    <Link
                        to='/'
                        className='text-primary/70 hover:text-secondary mb-6 inline-flex items-center gap-2 text-sm transition-colors'
                    >
                        <FaArrowLeft className='h-3 w-3' />
                        Back to Concepts
                    </Link>
                    <div className='flex items-center gap-4'>
                        <div className='flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10'>
                            <FaCompass className='h-7 w-7 text-emerald-400' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                Unexplored Concepts
                            </h1>
                            <p className='text-primary/70 mt-1'>
                                {unexploredCount} concepts waiting to be discovered
                            </p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Progress */}
            <Section className='py-4'>
                <div className='mx-auto max-w-4xl'>
                    <div className='bg-primary/5 rounded-xl p-6'>
                        <div className='mb-2 flex items-center justify-between text-sm'>
                            <span className='text-primary/70'>Your exploration progress</span>
                            <span className='font-medium'>
                                {exploredCount} / {totalConcepts} explored
                            </span>
                        </div>
                        <div className='mb-2 flex items-center gap-3'>
                            <div className='h-3 flex-1 overflow-hidden rounded-full bg-green-500/20'>
                                <div
                                    className='h-full rounded-full bg-green-500 transition-all duration-500'
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <span className='w-12 text-right font-medium text-green-400'>
                                {progressPercentage}%
                            </span>
                        </div>
                        <p className='text-primary/50 text-xs'>
                            Concepts are marked as explored when you view their details
                        </p>
                    </div>
                </div>
            </Section>

            {/* View Mode Toggle */}
            <div className='mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-2 sm:px-10 md:px-16 lg:px-20 xl:px-32'>
                <p className='text-primary/60 text-sm'>
                    Showing {unexploredCount} unexplored concept
                    {unexploredCount !== 1 ? 's' : ''}
                </p>
                <div className='bg-primary/5 flex rounded-lg p-1'>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                            viewMode === 'grid'
                                ? 'bg-secondary text-white'
                                : 'text-primary/60 hover:text-primary'
                        }`}
                        aria-label='Grid view'
                    >
                        <FaTh className='h-4 w-4' />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                            viewMode === 'list'
                                ? 'bg-secondary text-white'
                                : 'text-primary/60 hover:text-primary'
                        }`}
                        aria-label='List view'
                    >
                        <FaList className='h-4 w-4' />
                    </button>
                </div>
            </div>

            {/* Concepts Grid/List */}
            <Section className='py-8 pb-16'>
                <div className='mx-auto max-w-7xl'>
                    <div
                        className={
                            viewMode === 'grid'
                                ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                                : 'flex flex-col gap-3'
                        }
                    >
                        {unexploredConcepts.map((concept) => (
                            <ConceptCard
                                key={concept.id}
                                concept={concept}
                                onShowDetails={handleShowDetails}
                                onTagClick={handleTagClick}
                                viewMode={viewMode}
                                isExplored={false}
                            />
                        ))}
                    </div>
                </div>
            </Section>

            {/* Detail Modal */}
            <ConceptDetailModal
                concept={selectedConcept}
                allConcepts={conceptsData.concepts}
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetails}
                onNavigateToConcept={handleNavigateToConcept}
                onTagClick={handleTagClick}
                isExplored={isExplored}
            />
        </>
    )
}

export default UnexploredPage
