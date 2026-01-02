import { useMemo, useState, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { FaCompass, FaArrowLeft, FaEnvelope, FaTh, FaList } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { AnimatedPage, AnimatedHero, motion } from '@/components/ui/animated'
import AnimatedCounter from '@/components/ui/animated-counter'
import VirtualizedConceptList from '@/components/concepts/virtualized-concept-list'
import ConceptDetailModal from '@/components/concepts/concept-detail-modal'
import { conceptsData } from '@/data'
import { useExploredConcepts } from '@/hooks/use-explored-concepts'
import type { Concept } from '@/types/concept'

const UnexploredPage: React.FC = () => {
    const navigate = useNavigate()
    const { isExplored, markAsExplored } = useExploredConcepts()
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null)

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

    const handleShowDetails = useCallback((concept: Concept) => {
        // Save scroll position before opening modal
        sessionStorage.setItem('scrollPosition', window.scrollY.toString())

        setSelectedConcept(concept)
        // Update URL to canonical format for shareability
        window.history.pushState({}, '', `/concept/${concept.id}`)
    }, [])

    const handleCloseDetails = useCallback(() => {
        setSelectedConcept(null)
        // Restore URL to unexplored page
        window.history.pushState({}, '', '/unexplored')

        // Restore scroll position after closing modal
        requestAnimationFrame(() => {
            const savedPosition = sessionStorage.getItem('scrollPosition')
            if (savedPosition) {
                window.scrollTo(0, parseInt(savedPosition, 10))
                sessionStorage.removeItem('scrollPosition')
            }
        })
    }, [])

    const handleNavigateToConcept = useCallback((concept: Concept) => {
        setSelectedConcept(concept)
        // Update URL for the new concept
        window.history.replaceState({}, '', `/concept/${concept.id}`)
    }, [])

    // Mark concept as explored when modal opens
    useEffect(() => {
        if (selectedConcept) {
            markAsExplored(selectedConcept.id)
        }
    }, [selectedConcept, markAsExplored])

    // Handle browser back button
    useEffect(() => {
        const handlePopState = () => {
            // If we're back on /unexplored, close the modal
            if (window.location.pathname === '/unexplored') {
                setSelectedConcept(null)
            }
        }
        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [])

    const handleTagClick = useCallback(
        (tag: string) => {
            navigate(`/tag/${encodeURIComponent(tag)}`)
        },
        [navigate]
    )

    const handleCategoryClick = useCallback(
        (category: string) => {
            navigate(`/category/${encodeURIComponent(category)}`)
        },
        [navigate]
    )

    // All concepts explored - show congratulations
    if (unexploredCount === 0) {
        return (
            <AnimatedPage>
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
                    <AnimatedHero className='mx-auto max-w-2xl text-center'>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', duration: 0.6 }}
                            className='mb-8 text-8xl'
                        >
                            🎉
                        </motion.div>
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
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                                        className='h-full rounded-full bg-green-500'
                                    />
                                </div>
                                <span className='font-medium text-green-400'>100%</span>
                            </div>
                            <p className='text-primary/60 text-sm'>
                                {totalConcepts} of {totalConcepts} concepts explored
                            </p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className='border-primary/10 border-t pt-10'
                        >
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
                        </motion.div>
                    </AnimatedHero>
                </Section>
            </AnimatedPage>
        )
    }

    return (
        <AnimatedPage>
            {/* Header */}
            <AnimatedHero className='mx-auto max-w-4xl px-6 pt-8 pb-4 sm:px-10 sm:pt-12 md:px-16 lg:px-20 xl:px-32'>
                <Link
                    to='/'
                    className='text-primary/70 hover:text-secondary mb-4 inline-flex items-center gap-2 text-sm transition-colors'
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
            </AnimatedHero>

            {/* Progress */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='mx-auto max-w-4xl px-6 py-4 sm:px-10 md:px-16 lg:px-20 xl:px-32'
            >
                <div className='bg-primary/5 rounded-xl p-4'>
                    <div className='mb-2 flex items-center justify-between text-sm'>
                        <span className='text-primary/70'>Your exploration progress</span>
                        <span className='font-medium'>
                            <AnimatedCounter value={exploredCount} delay={0.2} duration={1} /> /{' '}
                            <AnimatedCounter value={totalConcepts} delay={0.2} duration={1} />{' '}
                            explored
                        </span>
                    </div>
                    <div className='mb-2 flex items-center gap-3'>
                        <div className='h-3 flex-1 overflow-hidden rounded-full bg-green-500/20'>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                                className='h-full rounded-full bg-green-500'
                            />
                        </div>
                        <span className='w-12 text-right font-medium text-green-400'>
                            <AnimatedCounter
                                value={progressPercentage}
                                delay={0.4}
                                duration={1}
                                formatValue={(v) => `${Math.round(v)}%`}
                            />
                        </span>
                    </div>
                    <p className='text-primary/50 text-xs'>
                        Concepts are marked as explored when you view their details
                    </p>
                </div>
            </motion.div>

            {/* View Mode Toggle */}
            <div className='mx-auto max-w-4xl px-6 py-3 sm:px-10 md:px-16 lg:px-20 xl:px-32'>
                <div className='flex items-center justify-between gap-4'>
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
            </div>

            {/* Concepts Grid/List - Virtualized with window scrolling */}
            <Section fullWidth className='px-6 py-6 pb-16 sm:px-10 md:px-16'>
                <div className='mx-auto w-full max-w-[1800px]'>
                    <VirtualizedConceptList
                        concepts={unexploredConcepts}
                        viewMode={viewMode}
                        onShowDetails={handleShowDetails}
                        onTagClick={handleTagClick}
                        onCategoryClick={handleCategoryClick}
                        isExplored={() => false}
                    />
                </div>
            </Section>

            {/* Detail Modal */}
            <ConceptDetailModal
                concept={selectedConcept}
                allConcepts={unexploredConcepts}
                isOpen={!!selectedConcept}
                onClose={handleCloseDetails}
                onNavigateToConcept={handleNavigateToConcept}
                onTagClick={handleTagClick}
                onCategoryClick={handleCategoryClick}
                isExplored={isExplored}
                hidePreviousButton={true}
            />
        </AnimatedPage>
    )
}

export default UnexploredPage
