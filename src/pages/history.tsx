import { useMemo, useCallback, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { FaHistory, FaArrowLeft, FaArrowRight, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { AnimatedPage, AnimatedHero, motion } from '@/components/ui/animated'
import AnimatedCounter from '@/components/ui/animated-counter'
import ConceptIcon from '@/components/concepts/concept-icon'
import ConceptDetailModal from '@/components/concepts/concept-detail-modal'
import { conceptsData } from '@/data'
import { useExploredConcepts } from '@/hooks/use-explored-concepts'
import type { Concept } from '@/types/concept'

// Colors for concept cards - cycling through different colors
const cardColors = [
    'from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-500/50',
    'from-pink-500/20 to-pink-600/10 border-pink-500/30 hover:border-pink-500/50',
    'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50',
    'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-500/50',
    'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50',
    'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-500/50',
    'from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-500/50',
    'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-500/50',
    'from-teal-500/20 to-teal-600/10 border-teal-500/30 hover:border-teal-500/50',
    'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-500/50'
]

interface ConceptsByDate {
    date: string
    formattedDate: string
    concepts: Concept[]
}

const HistoryPage: React.FC = () => {
    const navigate = useNavigate()
    const { isExplored, markAsExplored } = useExploredConcepts()
    const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null)

    const historyData = useMemo(() => {
        const concepts = conceptsData.concepts
        const totalConcepts = concepts.length

        // Group concepts by datePublished
        const conceptsByDateMap = new Map<string, Concept[]>()

        concepts.forEach((concept) => {
            const date = concept.datePublished
            if (!conceptsByDateMap.has(date)) {
                conceptsByDateMap.set(date, [])
            }
            conceptsByDateMap.get(date)!.push(concept)
        })

        // Sort dates newest first and create array
        const sortedDates = Array.from(conceptsByDateMap.keys()).sort(
            (a, b) => new Date(b).getTime() - new Date(a).getTime()
        )

        // Format dates and sort concepts within each date alphabetically
        const conceptsByDate: ConceptsByDate[] = sortedDates.map((date) => {
            const dateObj = new Date(date + 'T00:00:00')
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })

            const dateConcepts = conceptsByDateMap.get(date)!
            dateConcepts.sort((a, b) => a.name.localeCompare(b.name))

            return {
                date,
                formattedDate,
                concepts: dateConcepts
            }
        })

        // Count unique dates
        const uniqueDates = conceptsByDate.length

        return {
            conceptsByDate,
            totalConcepts,
            uniqueDates
        }
    }, [])

    // Flatten all concepts for modal navigation
    const allConcepts = useMemo(() => {
        return historyData.conceptsByDate.flatMap((group) => group.concepts)
    }, [historyData])

    const handleShowDetails = useCallback((concept: Concept) => {
        // Save scroll position before opening modal
        sessionStorage.setItem('scrollPosition', window.scrollY.toString())

        setSelectedConcept(concept)
        window.history.pushState({}, '', `/concept/${concept.id}?from=/history`)
    }, [])

    const handleCloseDetails = useCallback(() => {
        setSelectedConcept(null)
        window.history.pushState({}, '', '/history')

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
        window.history.replaceState({}, '', `/concept/${concept.id}?from=/history`)
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

    // Mark concept as explored when modal opens
    useEffect(() => {
        if (selectedConcept) {
            markAsExplored(selectedConcept.id)
        }
    }, [selectedConcept, markAsExplored])

    // Handle browser back button
    useEffect(() => {
        const handlePopState = () => {
            if (window.location.pathname === '/history') {
                setSelectedConcept(null)
            }
        }
        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [])

    // Track global card index for color cycling
    let globalCardIndex = 0

    return (
        <AnimatedPage>
            {/* Header */}
            <Section className='pt-16 pb-8 sm:pt-24 sm:pb-12'>
                <AnimatedHero className='mx-auto max-w-4xl'>
                    <Link
                        to='/'
                        className='text-primary/70 hover:text-secondary mb-6 inline-flex items-center gap-2 text-sm transition-colors'
                    >
                        <FaArrowLeft className='h-3 w-3' />
                        Back to Concepts
                    </Link>
                    <div className='flex items-center gap-4'>
                        <div className='flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10'>
                            <FaHistory className='h-7 w-7 text-cyan-400' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                History
                            </h1>
                            <p className='text-primary/70 mt-1'>
                                Concepts added over time, from newest to oldest
                            </p>
                        </div>
                    </div>
                </AnimatedHero>
            </Section>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='mx-auto max-w-4xl px-6 py-4 sm:px-10 md:px-16 lg:px-20 xl:px-32'
            >
                <div className='bg-primary/5 flex items-center justify-center gap-8 rounded-xl p-4'>
                    <div className='text-center'>
                        <AnimatedCounter
                            value={historyData.totalConcepts}
                            delay={0.3}
                            className='text-2xl font-bold text-cyan-400'
                        />
                        <div className='text-primary/60 text-sm'>Total Concepts</div>
                    </div>
                    <div className='bg-primary/20 h-8 w-px' />
                    <div className='text-center'>
                        <AnimatedCounter
                            value={historyData.uniqueDates}
                            delay={0.4}
                            className='text-secondary text-2xl font-bold'
                        />
                        <div className='text-primary/60 text-sm'>Days with Additions</div>
                    </div>
                </div>
            </motion.div>

            {/* Concepts grouped by date */}
            <Section fullWidth className='px-6 py-8 pb-16 sm:px-10 md:px-16'>
                <div className='mx-auto w-full max-w-[1800px]'>
                    {historyData.conceptsByDate.map((dateGroup, groupIndex) => (
                        <motion.div
                            key={dateGroup.date}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + groupIndex * 0.05 }}
                            className='mb-10'
                        >
                            {/* Date Header */}
                            <div className='mb-4 flex items-center gap-3'>
                                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10'>
                                    <FaCalendarAlt className='h-5 w-5 text-cyan-400' />
                                </div>
                                <div>
                                    <h2 className='text-lg font-semibold'>
                                        {dateGroup.formattedDate}
                                    </h2>
                                    <p className='text-primary/60 text-sm'>
                                        {dateGroup.concepts.length} concept
                                        {dateGroup.concepts.length !== 1 ? 's' : ''} added
                                    </p>
                                </div>
                            </div>

                            {/* Concept Cards Grid */}
                            <div className='grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
                                {dateGroup.concepts.map((concept) => {
                                    const colorIndex = globalCardIndex % cardColors.length
                                    globalCardIndex++
                                    const explored = isExplored(concept.id)
                                    return (
                                        <button
                                            key={concept.id}
                                            onClick={() => handleShowDetails(concept)}
                                            className={`group relative cursor-pointer rounded-xl border bg-gradient-to-br p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${cardColors[colorIndex]} ${explored ? 'ring-2 ring-green-500/40' : ''}`}
                                        >
                                            {/* Explored badge */}
                                            {explored && (
                                                <div className='absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white shadow-md'>
                                                    <FaCheckCircle className='h-2.5 w-2.5' />
                                                    Explored
                                                </div>
                                            )}
                                            <div className='mb-3 flex items-center justify-between'>
                                                <div
                                                    className={`relative flex h-10 w-10 items-center justify-center rounded-lg ${explored ? 'bg-green-500/20' : 'bg-white/10'}`}
                                                >
                                                    <ConceptIcon
                                                        icon={concept.icon}
                                                        category={concept.category}
                                                        size='sm'
                                                    />
                                                    {explored && (
                                                        <FaCheckCircle className='absolute -right-1 -bottom-1 h-4 w-4 text-green-500' />
                                                    )}
                                                </div>
                                                <FaArrowRight className='text-primary/40 h-3 w-3 transition-transform group-hover:translate-x-1 group-hover:text-white/70' />
                                            </div>
                                            <h3 className='mb-1 line-clamp-1 text-base font-semibold'>
                                                {concept.name}
                                            </h3>
                                            <p className='text-primary/60 mb-2 line-clamp-2 text-xs'>
                                                {concept.summary}
                                            </p>
                                            <span className='rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60'>
                                                {concept.category}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* Detail Modal */}
            <ConceptDetailModal
                concept={selectedConcept}
                allConcepts={allConcepts}
                isOpen={!!selectedConcept}
                onClose={handleCloseDetails}
                onNavigateToConcept={handleNavigateToConcept}
                onTagClick={handleTagClick}
                onCategoryClick={handleCategoryClick}
                isExplored={isExplored}
            />
        </AnimatedPage>
    )
}

export default HistoryPage
