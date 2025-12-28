import { memo, useCallback } from 'react'
import { FaStar, FaInfoCircle, FaCheckCircle } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import ConceptIcon from '@/components/concepts/concept-icon'
import type { Concept } from '@/types/concept'

interface ConceptCardProps {
    concept: Concept
    onShowDetails: (concept: Concept) => void
    onTagClick: (tag: string) => void
    onCategoryClick: (category: string) => void
    viewMode: 'grid' | 'list'
    isExplored?: boolean
}

const ConceptCard: React.FC<ConceptCardProps> = memo(
    ({ concept, onShowDetails, onTagClick, onCategoryClick, viewMode, isExplored = false }) => {
        const handleCardClick = useCallback(() => {
            onShowDetails(concept)
        }, [onShowDetails, concept])

        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onShowDetails(concept)
                }
            },
            [onShowDetails, concept]
        )

        const handleTagClick = useCallback(
            (e: React.MouseEvent, tag: string) => {
                e.stopPropagation()
                onTagClick(tag)
            },
            [onTagClick]
        )

        const handleCategoryClick = useCallback(
            (e: React.MouseEvent, category: string) => {
                e.stopPropagation()
                onCategoryClick(category)
            },
            [onCategoryClick]
        )

        if (viewMode === 'list') {
            return (
                <div
                    className={cn(
                        'bg-background/50 border-primary/10 hover:border-secondary/50 group relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/10',
                        concept.featured && 'ring-secondary/30 ring-1',
                        isExplored && 'border-green-500/20 bg-green-500/5'
                    )}
                    onClick={handleCardClick}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    role='button'
                    aria-label={`View details for ${concept.name}`}
                >
                    {/* Icon */}
                    <div
                        className={cn(
                            'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors',
                            isExplored
                                ? 'bg-green-500/20 group-hover:bg-green-500/30'
                                : 'bg-primary/10 group-hover:bg-primary/20'
                        )}
                    >
                        <ConceptIcon icon={concept.icon} category={concept.category} size='md' />
                        {isExplored && (
                            <FaCheckCircle className='absolute -right-1 -bottom-1 h-4 w-4 text-green-500' />
                        )}
                    </div>

                    {/* Content */}
                    <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                            <h3 className='group-hover:text-secondary truncate font-semibold transition-colors'>
                                {concept.name}
                            </h3>
                            {concept.featured && (
                                <FaStar className='text-secondary h-3 w-3 shrink-0' />
                            )}
                            {isExplored && (
                                <span className='shrink-0 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400'>
                                    Explored
                                </span>
                            )}
                            <button
                                onClick={(e) => handleCategoryClick(e, concept.category)}
                                className='bg-primary/10 text-primary/60 hover:bg-primary/20 hover:text-primary/80 shrink-0 cursor-pointer rounded-full px-2 py-0.5 text-xs transition-colors'
                            >
                                {concept.category}
                            </button>
                        </div>
                        <p className='text-primary/60 mt-1 line-clamp-1 text-sm'>
                            {concept.summary}
                        </p>
                    </div>

                    {/* Tags */}
                    <div className='hidden shrink-0 gap-1 md:flex'>
                        {concept.tags.slice(0, 3).map((tag) => (
                            <button
                                key={tag}
                                onClick={(e) => handleTagClick(e, tag)}
                                className='bg-primary/5 text-primary/60 hover:bg-primary/10 hover:text-primary/80 cursor-pointer rounded-full px-2 py-0.5 text-xs transition-colors'
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className='flex shrink-0 gap-2'>
                        <span
                            className='text-primary/60 hover:text-secondary rounded-lg p-2 transition-colors'
                            title='View details'
                        >
                            <FaInfoCircle className='h-4 w-4' />
                        </span>
                    </div>
                </div>
            )
        }

        // Grid view - using CSS hover instead of useState for better performance
        return (
            <div
                className={cn(
                    'bg-background/50 border-primary/10 hover:border-secondary/50 group relative flex h-full cursor-pointer flex-col rounded-xl border p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:shadow-black/10',
                    concept.featured && 'ring-secondary/30 ring-1',
                    isExplored && 'border-green-500/20 bg-green-500/5'
                )}
                onClick={handleCardClick}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role='button'
                aria-label={`View details for ${concept.name}`}
            >
                {/* Featured badge */}
                {concept.featured && (
                    <div className='from-secondary to-secondary/80 absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-gradient-to-r px-2 py-0.5 text-xs font-medium text-white shadow-md'>
                        <FaStar className='h-2.5 w-2.5' />
                        Featured
                    </div>
                )}

                {/* Explored badge */}
                {isExplored && !concept.featured && (
                    <div className='absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white shadow-md'>
                        <FaCheckCircle className='h-2.5 w-2.5' />
                        Explored
                    </div>
                )}

                {/* Header */}
                <div className='mb-3 flex items-start justify-between'>
                    <div
                        className={cn(
                            'relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                            isExplored
                                ? 'bg-green-500/20 group-hover:bg-green-500/30'
                                : 'bg-primary/10 group-hover:bg-primary/20'
                        )}
                    >
                        <ConceptIcon icon={concept.icon} category={concept.category} size='md' />
                    </div>
                    <div className='flex items-center gap-2'>
                        {isExplored && concept.featured && (
                            <span className='flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400'>
                                <FaCheckCircle className='h-2.5 w-2.5' />
                            </span>
                        )}
                        <button
                            onClick={(e) => handleCategoryClick(e, concept.category)}
                            className='bg-primary/10 text-primary/60 hover:bg-primary/20 hover:text-primary/80 cursor-pointer rounded-full px-2 py-0.5 text-xs transition-colors'
                        >
                            {concept.category}
                        </button>
                    </div>
                </div>

                {/* Title */}
                <div className='mb-1 flex items-center gap-2'>
                    <h3 className='group-hover:text-secondary font-semibold transition-colors'>
                        {concept.name}
                    </h3>
                </div>

                {/* Aliases */}
                {concept.aliases && concept.aliases.length > 0 && (
                    <p className='text-primary/50 mb-2 text-xs italic'>
                        Also known as: {concept.aliases.slice(0, 2).join(', ')}
                        {concept.aliases.length > 2 && '...'}
                    </p>
                )}

                {/* Summary */}
                <p className='text-primary/70 mb-3 line-clamp-2 flex-1 text-sm'>
                    {concept.summary}
                </p>

                {/* Tags */}
                <div className='mb-2 flex flex-wrap gap-1'>
                    {concept.tags.slice(0, 3).map((tag) => (
                        <button
                            key={tag}
                            onClick={(e) => handleTagClick(e, tag)}
                            className='bg-primary/5 text-primary/70 hover:bg-primary/10 hover:text-primary/90 cursor-pointer rounded-full px-2 py-0.5 text-xs transition-colors'
                        >
                            {tag}
                        </button>
                    ))}
                    {concept.tags.length > 3 && (
                        <span className='text-primary/50 px-1 py-0.5 text-xs'>
                            +{concept.tags.length - 3}
                        </span>
                    )}
                </div>

                {/* Reference count indicator */}
                {((concept.references?.length ?? 0) > 0 ||
                    (concept.articles?.length ?? 0) > 0 ||
                    (concept.tutorials?.length ?? 0) > 0) && (
                    <div className='border-primary/10 mb-3 border-t pt-2'>
                        <div className='flex flex-wrap gap-2 text-xs'>
                            {concept.references && concept.references.length > 0 && (
                                <span className='text-primary/50'>
                                    {concept.references.length} reference
                                    {concept.references.length !== 1 ? 's' : ''}
                                </span>
                            )}
                            {concept.articles && concept.articles.length > 0 && (
                                <span className='text-primary/50'>
                                    {concept.articles.length} article
                                    {concept.articles.length !== 1 ? 's' : ''}
                                </span>
                            )}
                            {concept.tutorials && concept.tutorials.length > 0 && (
                                <span className='text-primary/50'>
                                    {concept.tutorials.length} tutorial
                                    {concept.tutorials.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Action button */}
                <div className='mt-auto flex items-center gap-1.5'>
                    <span className='bg-secondary hover:bg-secondary/90 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium text-white transition-colors'>
                        <FaInfoCircle className='h-3 w-3' />
                        Learn More
                    </span>
                </div>
            </div>
        )
    },
    (prevProps, nextProps) => {
        // Custom comparison for memoization - only re-render if these change
        return (
            prevProps.concept.id === nextProps.concept.id &&
            prevProps.viewMode === nextProps.viewMode &&
            prevProps.isExplored === nextProps.isExplored &&
            prevProps.onShowDetails === nextProps.onShowDetails &&
            prevProps.onTagClick === nextProps.onTagClick &&
            prevProps.onCategoryClick === nextProps.onCategoryClick
        )
    }
)

ConceptCard.displayName = 'ConceptCard'

export default ConceptCard
