import { useMemo, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { FaFolder, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { AnimatedPage, AnimatedHero, motion } from '@/components/ui/animated'
import AnimatedCounter from '@/components/ui/animated-counter'
import ConceptDetailModal from '@/components/concepts/concept-detail-modal'
import { conceptsData } from '@/data'
import { useExploredConcepts } from '@/hooks/use-explored-concepts'
import type { Concept } from '@/types/concept'

interface CategoryData {
    name: string
    count: number
    percentage: number
}

// Colors for category cards
const categoryColors = [
    'from-pink-500/20 to-pink-600/10 border-pink-500/30 hover:border-pink-500/50',
    'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50',
    'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-500/50',
    'from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-500/50',
    'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50',
    'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-500/50',
    'from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-500/50',
    'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-500/50',
    'from-teal-500/20 to-teal-600/10 border-teal-500/30 hover:border-teal-500/50',
    'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-500/50'
]

const iconColors = [
    'text-pink-400',
    'text-blue-400',
    'text-green-400',
    'text-amber-400',
    'text-purple-400',
    'text-cyan-400',
    'text-red-400',
    'text-indigo-400',
    'text-teal-400',
    'text-orange-400'
]

const CategoriesPage: React.FC = () => {
    const { conceptId } = useParams<{ conceptId?: string }>()
    const navigate = useNavigate()
    const { isExplored } = useExploredConcepts()

    const categoryData = useMemo(() => {
        const concepts = conceptsData.concepts
        const totalConcepts = concepts.length

        // Count concepts per category
        const categoryCount: Record<string, number> = {}
        concepts.forEach((c) => {
            categoryCount[c.category] = (categoryCount[c.category] || 0) + 1
        })

        // Convert to array and sort by count
        const categories: CategoryData[] = Object.entries(categoryCount)
            .map(([name, count]) => ({
                name,
                count,
                percentage: (count / totalConcepts) * 100
            }))
            .sort((a, b) => b.count - a.count)

        return {
            categories,
            totalConcepts,
            totalCategories: categories.length
        }
    }, [])

    // Selected concept for modal
    const selectedConcept = useMemo(() => {
        if (!conceptId) return null
        return conceptsData.concepts.find((c) => c.id === conceptId) || null
    }, [conceptId])

    const isDetailModalOpen = !!selectedConcept

    const handleCategoryClick = useCallback(
        (category: string) => {
            navigate(`/category/${encodeURIComponent(category)}`)
        },
        [navigate]
    )

    const handleCloseDetails = useCallback(() => {
        navigate('/categories')
    }, [navigate])

    const handleNavigateToConcept = useCallback(
        (concept: Concept) => {
            navigate(`/categories/concept/${concept.id}`)
        },
        [navigate]
    )

    const handleTagClick = useCallback(
        (tag: string) => {
            navigate(`/tag/${encodeURIComponent(tag)}`)
        },
        [navigate]
    )

    const handleCategoryClickFromModal = useCallback(
        (category: string) => {
            navigate(`/category/${encodeURIComponent(category)}`)
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
                        <div className='flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10'>
                            <FaFolder className='h-7 w-7 text-blue-400' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                Categories
                            </h1>
                            <p className='text-primary/70 mt-1'>Browse concepts by category</p>
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
                            value={categoryData.totalCategories}
                            delay={0.3}
                            className='text-2xl font-bold text-blue-400'
                        />
                        <div className='text-primary/60 text-sm'>Categories</div>
                    </div>
                    <div className='bg-primary/20 h-8 w-px' />
                    <div className='text-center'>
                        <AnimatedCounter
                            value={categoryData.totalConcepts}
                            delay={0.4}
                            className='text-secondary text-2xl font-bold'
                        />
                        <div className='text-primary/60 text-sm'>Total Concepts</div>
                    </div>
                </div>
            </motion.div>

            {/* Categories Grid */}
            <Section fullWidth className='px-6 py-8 pb-16 sm:px-10 md:px-16'>
                <div className='mx-auto w-full max-w-[1800px]'>
                    <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
                        {categoryData.categories.map((category, index) => (
                            <motion.button
                                key={category.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                onClick={() => handleCategoryClick(category.name)}
                                className={`group relative cursor-pointer rounded-xl border bg-gradient-to-br p-6 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${categoryColors[index % categoryColors.length]}`}
                            >
                                <div className='mb-4 flex items-center justify-between'>
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-lg bg-white/10`}
                                    >
                                        <FaFolder
                                            className={`h-6 w-6 ${iconColors[index % iconColors.length]}`}
                                        />
                                    </div>
                                    <FaArrowRight className='text-primary/40 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:text-white/70' />
                                </div>
                                <h3 className='mb-1 text-lg font-semibold'>{category.name}</h3>
                                <p className='text-primary/60 text-sm'>
                                    {category.count} concept{category.count !== 1 ? 's' : ''}
                                    <span className='text-primary/40 ml-1'>
                                        ({category.percentage.toFixed(1)}%)
                                    </span>
                                </p>
                                {/* Progress bar */}
                                <div className='mt-4 h-1 overflow-hidden rounded-full bg-white/10'>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${category.percentage}%` }}
                                        transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                                        className='h-full rounded-full bg-white/30'
                                    />
                                </div>
                            </motion.button>
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
                onCategoryClick={handleCategoryClickFromModal}
                isExplored={isExplored}
            />
        </AnimatedPage>
    )
}

export default CategoriesPage
