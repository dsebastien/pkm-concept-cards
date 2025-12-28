import { useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router'
import { FaStar, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { AnimatedPage, AnimatedHero, motion } from '@/components/ui/animated'
import AnimatedCounter from '@/components/ui/animated-counter'
import ConceptIcon from '@/components/concepts/concept-icon'
import { conceptsData } from '@/data'
import type { Concept } from '@/types/concept'

// Colors for concept cards
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

const FeaturedPage: React.FC = () => {
    const navigate = useNavigate()

    const featuredData = useMemo(() => {
        const concepts = conceptsData.concepts
        const totalConcepts = concepts.length

        // Get featured concepts sorted alphabetically
        const featuredConcepts = concepts
            .filter((c) => c.featured)
            .sort((a, b) => a.name.localeCompare(b.name))

        return {
            featuredConcepts,
            totalConcepts,
            featuredCount: featuredConcepts.length
        }
    }, [])

    const handleConceptClick = useCallback(
        (concept: Concept) => {
            navigate(`/concept/${concept.id}`)
        },
        [navigate]
    )

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
                        <div className='flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10'>
                            <FaStar className='h-7 w-7 text-amber-400' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                Featured Concepts
                            </h1>
                            <p className='text-primary/70 mt-1'>
                                Highlighted concepts worth exploring first
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
                            value={featuredData.featuredCount}
                            delay={0.3}
                            className='text-2xl font-bold text-amber-400'
                        />
                        <div className='text-primary/60 text-sm'>Featured</div>
                    </div>
                    <div className='bg-primary/20 h-8 w-px' />
                    <div className='text-center'>
                        <AnimatedCounter
                            value={featuredData.totalConcepts}
                            delay={0.4}
                            className='text-secondary text-2xl font-bold'
                        />
                        <div className='text-primary/60 text-sm'>Total Concepts</div>
                    </div>
                </div>
            </motion.div>

            {/* Featured Concepts Grid */}
            <Section fullWidth className='px-6 py-8 pb-16 sm:px-10 md:px-16'>
                <div className='mx-auto w-full max-w-[1800px]'>
                    <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
                        {featuredData.featuredConcepts.map((concept, index) => (
                            <motion.button
                                key={concept.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.03 }}
                                onClick={() => handleConceptClick(concept)}
                                className={`group relative cursor-pointer rounded-xl border bg-gradient-to-br p-6 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${cardColors[index % cardColors.length]}`}
                            >
                                <div className='mb-4 flex items-center justify-between'>
                                    <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-white/10'>
                                        <ConceptIcon
                                            icon={concept.icon}
                                            category={concept.category}
                                            size='md'
                                        />
                                    </div>
                                    <FaArrowRight className='text-primary/40 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:text-white/70' />
                                </div>
                                <h3 className='mb-1 text-lg font-semibold'>{concept.name}</h3>
                                <p className='text-primary/60 mb-2 line-clamp-2 text-sm'>
                                    {concept.summary}
                                </p>
                                <div className='mt-3 flex items-center gap-2'>
                                    <span className='rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60'>
                                        {concept.category}
                                    </span>
                                    <FaStar className='h-3 w-3 text-amber-400' />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </Section>
        </AnimatedPage>
    )
}

export default FeaturedPage
