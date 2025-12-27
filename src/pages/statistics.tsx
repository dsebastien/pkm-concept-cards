import { useMemo } from 'react'
import { Link } from 'react-router'
import { FaChartBar, FaArrowLeft } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { AnimatedPage, AnimatedHero, AnimatedSection, AnimatedStat } from '@/components/ui/animated'
import AnimatedCounter from '@/components/ui/animated-counter'
import { conceptsData } from '@/data'

interface CategoryStat {
    name: string
    count: number
    percentage: number
}

interface TagStat {
    name: string
    count: number
}

interface ReferenceTypeStat {
    type: string
    count: number
    percentage: number
}

const StatisticsPage: React.FC = () => {
    const stats = useMemo(() => {
        const concepts = conceptsData.concepts

        // Basic counts
        const totalConcepts = concepts.length
        const featuredConcepts = concepts.filter((c) => c.featured).length
        const conceptsWithAliases = concepts.filter((c) => c.aliases && c.aliases.length > 0).length
        const conceptsWithRelatedConcepts = concepts.filter(
            (c) => c.relatedConcepts && c.relatedConcepts.length > 0
        ).length
        const conceptsWithRelatedNotes = concepts.filter(
            (c) => c.relatedNotes && c.relatedNotes.length > 0
        ).length
        const conceptsWithReferences = concepts.filter(
            (c) => c.references && c.references.length > 0
        ).length
        const conceptsWithArticles = concepts.filter(
            (c) => c.articles && c.articles.length > 0
        ).length
        const conceptsWithTutorials = concepts.filter(
            (c) => c.tutorials && c.tutorials.length > 0
        ).length

        // Category distribution
        const categoryCount: Record<string, number> = {}
        concepts.forEach((c) => {
            categoryCount[c.category] = (categoryCount[c.category] || 0) + 1
        })
        const categoryStats: CategoryStat[] = Object.entries(categoryCount)
            .map(([name, count]) => ({
                name,
                count,
                percentage: (count / totalConcepts) * 100
            }))
            .sort((a, b) => b.count - a.count)

        // Tag statistics
        const tagCount: Record<string, number> = {}
        let totalTags = 0
        concepts.forEach((c) => {
            c.tags.forEach((tag) => {
                tagCount[tag] = (tagCount[tag] || 0) + 1
                totalTags++
            })
        })
        const uniqueTags = Object.keys(tagCount).length
        const avgTagsPerConcept = totalTags / totalConcepts

        const tagStats: TagStat[] = Object.entries(tagCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
        const topTags = tagStats.slice(0, 20)

        // Reference type distribution
        const referenceTypeCount: Record<string, number> = {}
        let totalReferences = 0
        concepts.forEach((c) => {
            const allRefs = [...(c.references || []), ...(c.articles || []), ...(c.tutorials || [])]
            allRefs.forEach((ref) => {
                referenceTypeCount[ref.type] = (referenceTypeCount[ref.type] || 0) + 1
                totalReferences++
            })
        })
        const referenceTypeStats: ReferenceTypeStat[] = Object.entries(referenceTypeCount)
            .map(([type, count]) => ({
                type,
                count,
                percentage: totalReferences > 0 ? (count / totalReferences) * 100 : 0
            }))
            .sort((a, b) => b.count - a.count)

        // Text statistics
        const explanationLengths = concepts.map((c) => c.explanation.length)
        const avgExplanationLength = Math.round(
            explanationLengths.reduce((a, b) => a + b, 0) / totalConcepts
        )
        const longestExplanation = Math.max(...explanationLengths)
        const shortestExplanation = Math.min(...explanationLengths)

        // Word counts
        const wordCounts = concepts.map(
            (c) => c.explanation.split(/\s+/).filter((w) => w.length > 0).length
        )
        const totalWords = wordCounts.reduce((a, b) => a + b, 0)
        const avgWordsPerConcept = Math.round(totalWords / totalConcepts)

        // Alias statistics
        const totalAliases = concepts.reduce((sum, c) => sum + (c.aliases?.length || 0), 0)
        const avgAliasesPerConcept =
            conceptsWithAliases > 0 ? (totalAliases / conceptsWithAliases).toFixed(1) : '0'

        // Related concepts statistics
        const totalRelatedConcepts = concepts.reduce(
            (sum, c) => sum + (c.relatedConcepts?.length || 0),
            0
        )

        return {
            totalConcepts,
            featuredConcepts,
            conceptsWithAliases,
            conceptsWithRelatedConcepts,
            conceptsWithRelatedNotes,
            conceptsWithReferences,
            conceptsWithArticles,
            conceptsWithTutorials,
            categoryStats,
            uniqueTags,
            avgTagsPerConcept,
            topTags,
            referenceTypeStats,
            totalReferences,
            avgExplanationLength,
            longestExplanation,
            shortestExplanation,
            totalWords,
            avgWordsPerConcept,
            totalAliases,
            avgAliasesPerConcept,
            totalRelatedConcepts
        }
    }, [])

    const maxCategoryCount = Math.max(...stats.categoryStats.map((c) => c.count))
    const maxTagCount = stats.topTags.length > 0 ? stats.topTags[0]!.count : 1

    // Colors for categories
    const categoryColors = [
        'bg-pink-500',
        'bg-blue-500',
        'bg-green-500',
        'bg-amber-500',
        'bg-purple-500',
        'bg-cyan-500',
        'bg-red-500',
        'bg-indigo-500'
    ]

    // Colors for reference types
    const referenceTypeColors: Record<string, string> = {
        book: 'bg-amber-500',
        paper: 'bg-blue-500',
        website: 'bg-green-500',
        video: 'bg-red-500',
        podcast: 'bg-purple-500',
        other: 'bg-gray-500'
    }

    const referenceTypeLabels: Record<string, string> = {
        book: 'Books',
        paper: 'Papers',
        website: 'Websites',
        video: 'Videos',
        podcast: 'Podcasts',
        other: 'Other'
    }

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
                        <div className='bg-secondary/10 flex h-14 w-14 items-center justify-center rounded-full'>
                            <FaChartBar className='text-secondary h-7 w-7' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                Statistics
                            </h1>
                            <p className='text-primary/70 mt-1'>
                                Insights and analytics about the concepts collection
                            </p>
                        </div>
                    </div>
                </AnimatedHero>
            </Section>

            {/* Overview Stats */}
            <Section className='py-8'>
                <div className='mx-auto max-w-4xl'>
                    <h2 className='mb-6 text-xl font-semibold'>Overview</h2>
                    <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                        <AnimatedStat delay={0.1}>
                            <div className='bg-primary/5 rounded-xl p-4 text-center'>
                                <AnimatedCounter
                                    value={stats.totalConcepts}
                                    delay={0.3}
                                    className='text-secondary text-3xl font-bold'
                                />
                                <div className='text-primary/60 text-sm'>Total Concepts</div>
                            </div>
                        </AnimatedStat>
                        <AnimatedStat delay={0.2}>
                            <div className='bg-primary/5 rounded-xl p-4 text-center'>
                                <AnimatedCounter
                                    value={stats.featuredConcepts}
                                    delay={0.4}
                                    className='text-3xl font-bold text-amber-400'
                                />
                                <div className='text-primary/60 text-sm'>Featured</div>
                            </div>
                        </AnimatedStat>
                        <AnimatedStat delay={0.3}>
                            <div className='bg-primary/5 rounded-xl p-4 text-center'>
                                <AnimatedCounter
                                    value={stats.categoryStats.length}
                                    delay={0.5}
                                    className='text-3xl font-bold text-blue-400'
                                />
                                <div className='text-primary/60 text-sm'>Categories</div>
                            </div>
                        </AnimatedStat>
                        <AnimatedStat delay={0.4}>
                            <div className='bg-primary/5 rounded-xl p-4 text-center'>
                                <AnimatedCounter
                                    value={stats.uniqueTags}
                                    delay={0.6}
                                    className='text-3xl font-bold text-green-400'
                                />
                                <div className='text-primary/60 text-sm'>Unique Tags</div>
                            </div>
                        </AnimatedStat>
                    </div>
                </div>
            </Section>

            {/* Category Distribution */}
            <Section className='py-8'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <h2 className='mb-6 text-xl font-semibold'>Category Distribution</h2>
                    <div className='bg-primary/5 rounded-xl p-6'>
                        <div className='space-y-4'>
                            {stats.categoryStats.map((cat, index) => (
                                <div key={cat.name}>
                                    <div className='mb-1 flex items-center justify-between text-sm'>
                                        <span className='font-medium'>{cat.name}</span>
                                        <span className='text-primary/60'>
                                            {cat.count} ({cat.percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className='bg-primary/10 h-6 overflow-hidden rounded-full'>
                                        <div
                                            className={`h-full rounded-full ${categoryColors[index % categoryColors.length]} transition-all duration-500`}
                                            style={{
                                                width: `${(cat.count / maxCategoryCount) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>
            </Section>

            {/* Content Completeness */}
            <Section className='py-8'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <h2 className='mb-6 text-xl font-semibold'>Content Completeness</h2>
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <div className='bg-primary/5 rounded-xl p-6'>
                            <h3 className='text-primary/70 mb-4 text-sm font-medium'>
                                Concepts With...
                            </h3>
                            <div className='space-y-3'>
                                {[
                                    {
                                        label: 'Aliases',
                                        count: stats.conceptsWithAliases,
                                        color: 'bg-purple-500'
                                    },
                                    {
                                        label: 'Related Concepts',
                                        count: stats.conceptsWithRelatedConcepts,
                                        color: 'bg-blue-500'
                                    },
                                    {
                                        label: 'Related Notes',
                                        count: stats.conceptsWithRelatedNotes,
                                        color: 'bg-cyan-500'
                                    },
                                    {
                                        label: 'References',
                                        count: stats.conceptsWithReferences,
                                        color: 'bg-amber-500'
                                    },
                                    {
                                        label: 'Articles',
                                        count: stats.conceptsWithArticles,
                                        color: 'bg-green-500'
                                    },
                                    {
                                        label: 'Tutorials',
                                        count: stats.conceptsWithTutorials,
                                        color: 'bg-red-500'
                                    }
                                ].map((item) => (
                                    <div key={item.label} className='flex items-center gap-3'>
                                        <div className='bg-primary/10 h-2 flex-1 overflow-hidden rounded-full'>
                                            <div
                                                className={`h-full rounded-full ${item.color}`}
                                                style={{
                                                    width: `${(item.count / stats.totalConcepts) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <div className='w-32 text-right text-sm'>
                                            <span className='font-medium'>{item.count}</span>
                                            <span className='text-primary/60'>
                                                {' '}
                                                (
                                                {((item.count / stats.totalConcepts) * 100).toFixed(
                                                    0
                                                )}
                                                %)
                                            </span>
                                        </div>
                                        <div className='text-primary/70 w-32 text-sm'>
                                            {item.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='bg-primary/5 rounded-xl p-6'>
                            <h3 className='text-primary/70 mb-4 text-sm font-medium'>
                                Quick Stats
                            </h3>
                            <div className='space-y-4'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-primary/70 text-sm'>Total Aliases</span>
                                    <span className='font-medium'>{stats.totalAliases}</span>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-primary/70 text-sm'>
                                        Avg Aliases (where present)
                                    </span>
                                    <span className='font-medium'>
                                        {stats.avgAliasesPerConcept}
                                    </span>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-primary/70 text-sm'>
                                        Total Related Concept Links
                                    </span>
                                    <span className='font-medium'>
                                        {stats.totalRelatedConcepts}
                                    </span>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-primary/70 text-sm'>
                                        Total References
                                    </span>
                                    <span className='font-medium'>{stats.totalReferences}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </Section>

            {/* Reference Types */}
            {stats.totalReferences > 0 && (
                <Section className='py-8'>
                    <AnimatedSection className='mx-auto max-w-4xl'>
                        <h2 className='mb-6 text-xl font-semibold'>Reference Types</h2>
                        <div className='bg-primary/5 rounded-xl p-6'>
                            {/* Pie chart visualization */}
                            <div className='flex flex-col items-center gap-8 sm:flex-row'>
                                <div className='relative h-48 w-48'>
                                    <svg viewBox='0 0 100 100' className='h-full w-full -rotate-90'>
                                        {(() => {
                                            let cumulativePercent = 0
                                            return stats.referenceTypeStats.map((ref) => {
                                                const startPercent = cumulativePercent
                                                cumulativePercent += ref.percentage
                                                const startAngle = (startPercent / 100) * 360
                                                const endAngle = (cumulativePercent / 100) * 360
                                                const largeArcFlag = ref.percentage > 50 ? 1 : 0

                                                const startX =
                                                    50 + 40 * Math.cos((startAngle * Math.PI) / 180)
                                                const startY =
                                                    50 + 40 * Math.sin((startAngle * Math.PI) / 180)
                                                const endX =
                                                    50 + 40 * Math.cos((endAngle * Math.PI) / 180)
                                                const endY =
                                                    50 + 40 * Math.sin((endAngle * Math.PI) / 180)

                                                const colorMap: Record<string, string> = {
                                                    book: '#f59e0b',
                                                    paper: '#3b82f6',
                                                    website: '#22c55e',
                                                    video: '#ef4444',
                                                    podcast: '#a855f7',
                                                    other: '#6b7280'
                                                }

                                                return (
                                                    <path
                                                        key={ref.type}
                                                        d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                                                        fill={colorMap[ref.type] || '#6b7280'}
                                                        stroke='rgb(55, 64, 76)'
                                                        strokeWidth='1'
                                                    />
                                                )
                                            })
                                        })()}
                                    </svg>
                                    <div className='absolute inset-0 flex items-center justify-center'>
                                        <div className='text-center'>
                                            <div className='text-2xl font-bold'>
                                                {stats.totalReferences}
                                            </div>
                                            <div className='text-primary/60 text-xs'>Total</div>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex-1'>
                                    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                                        {stats.referenceTypeStats.map((ref) => (
                                            <div key={ref.type} className='flex items-center gap-2'>
                                                <div
                                                    className={`h-3 w-3 rounded-full ${referenceTypeColors[ref.type] || 'bg-gray-500'}`}
                                                />
                                                <div className='text-sm'>
                                                    <span className='text-primary/70'>
                                                        {referenceTypeLabels[ref.type] || ref.type}
                                                    </span>
                                                    <span className='text-primary/50 ml-1'>
                                                        ({ref.count})
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>
                </Section>
            )}

            {/* Tags */}
            <Section className='py-8'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <h2 className='mb-2 text-xl font-semibold'>Top Tags</h2>
                    <p className='text-primary/60 mb-6 text-sm'>
                        Showing top 20 most used tags (avg {stats.avgTagsPerConcept.toFixed(1)} tags
                        per concept)
                    </p>
                    <div className='bg-primary/5 rounded-xl p-6'>
                        <div className='flex flex-wrap gap-2'>
                            {stats.topTags.map((tag) => {
                                // Calculate size based on frequency (min 0.75rem, max 1.5rem)
                                const minSize = 0.75
                                const maxSize = 1.5
                                const size =
                                    minSize + (tag.count / maxTagCount) * (maxSize - minSize)
                                // Calculate opacity based on frequency
                                const opacity = 0.5 + (tag.count / maxTagCount) * 0.5

                                return (
                                    <Link
                                        key={tag.name}
                                        to={`/tag/${encodeURIComponent(tag.name)}`}
                                        className='hover:bg-secondary/20 hover:border-secondary/40 rounded-full border border-white/10 bg-white/5 px-3 py-1 transition-colors'
                                        style={{
                                            fontSize: `${size}rem`,
                                            opacity
                                        }}
                                    >
                                        {tag.name}
                                        <span className='text-primary/50 ml-1 text-xs'>
                                            ({tag.count})
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </AnimatedSection>
            </Section>

            {/* Text Statistics */}
            <Section className='py-8 pb-16'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <h2 className='mb-6 text-xl font-semibold'>Content Statistics</h2>
                    <div className='grid gap-4 sm:grid-cols-3'>
                        <div className='bg-primary/5 rounded-xl p-6 text-center'>
                            <AnimatedCounter
                                value={stats.totalWords}
                                delay={0.2}
                                className='text-secondary text-3xl font-bold'
                            />
                            <div className='text-primary/60 text-sm'>Total Words</div>
                        </div>
                        <div className='bg-primary/5 rounded-xl p-6 text-center'>
                            <AnimatedCounter
                                value={stats.avgWordsPerConcept}
                                delay={0.3}
                                className='text-3xl font-bold text-blue-400'
                            />
                            <div className='text-primary/60 text-sm'>Avg Words per Concept</div>
                        </div>
                        <div className='bg-primary/5 rounded-xl p-6 text-center'>
                            <AnimatedCounter
                                value={stats.avgTagsPerConcept}
                                delay={0.4}
                                className='text-3xl font-bold text-green-400'
                                formatValue={(v) => v.toFixed(1)}
                            />
                            <div className='text-primary/60 text-sm'>Avg Tags per Concept</div>
                        </div>
                    </div>
                    <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                        <div className='bg-primary/5 rounded-xl p-4'>
                            <div className='flex items-center justify-between'>
                                <span className='text-primary/70 text-sm'>
                                    Shortest Explanation
                                </span>
                                <span className='font-medium'>
                                    {stats.shortestExplanation.toLocaleString()} chars
                                </span>
                            </div>
                        </div>
                        <div className='bg-primary/5 rounded-xl p-4'>
                            <div className='flex items-center justify-between'>
                                <span className='text-primary/70 text-sm'>Longest Explanation</span>
                                <span className='font-medium'>
                                    {stats.longestExplanation.toLocaleString()} chars
                                </span>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </Section>
        </AnimatedPage>
    )
}

export default StatisticsPage
