import {
    FaSearch,
    FaTimes,
    FaTh,
    FaList,
    FaFilter,
    FaKeyboard,
    FaEye,
    FaTrash
} from 'react-icons/fa'
import { cn } from '@/lib/utils'
import type { ConceptsFilterProps } from '@/types/concepts-filter-props.intf'

const ConceptsFilter: React.FC<ConceptsFilterProps> = ({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    selectedTags,
    onTagsChange,
    viewMode,
    onViewModeChange,
    exploredFilter,
    onExploredFilterChange,
    exploredCount,
    onClearExplored,
    categories,
    allTags,
    onOpenCommandPalette
}) => {
    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            onTagsChange(selectedTags.filter((t) => t !== tag))
        } else {
            onTagsChange([...selectedTags, tag])
        }
    }

    const clearAllFilters = () => {
        onSearchChange('')
        onCategoryChange('All')
        onTagsChange([])
        onExploredFilterChange('all')
    }

    // Filters that are part of "More filters" section
    const hasMoreFiltersActive =
        selectedCategory !== 'All' || selectedTags.length > 0 || exploredFilter !== 'all'

    // All active filters (for clear all button)
    const hasActiveFilters = searchQuery || selectedCategory !== 'All' || hasMoreFiltersActive

    return (
        <div className='space-y-4'>
            {/* Search and View Toggle */}
            <div className='flex flex-col gap-3 sm:flex-row'>
                {/* Search Input */}
                <div className='relative flex-1'>
                    <FaSearch className='text-primary/40 absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2' />
                    <input
                        type='text'
                        placeholder='Search concepts...'
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className='bg-background/50 border-primary/10 focus:border-secondary/50 focus:ring-secondary/20 w-full rounded-xl border py-3 pr-24 pl-11 transition-colors focus:ring-2 focus:outline-none'
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className='text-primary/40 hover:text-primary absolute top-1/2 right-16 -translate-y-1/2 p-1'
                            aria-label='Clear search'
                        >
                            <FaTimes className='h-4 w-4' />
                        </button>
                    )}
                    <button
                        onClick={onOpenCommandPalette}
                        className='text-primary/40 hover:text-primary border-primary/20 bg-primary/5 absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 rounded border px-2 py-1 text-xs transition-colors'
                        title="Press '/' to open command palette"
                    >
                        <FaKeyboard className='h-3 w-3' />
                        <span>/</span>
                    </button>
                </div>

                {/* View Mode Toggle */}
                <div className='border-primary/10 flex rounded-xl border'>
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={cn(
                            'flex items-center gap-2 rounded-l-xl px-4 py-3 transition-colors',
                            viewMode === 'grid'
                                ? 'bg-secondary text-white'
                                : 'text-primary/60 hover:bg-primary/10'
                        )}
                        aria-label='Grid view'
                        aria-pressed={viewMode === 'grid'}
                    >
                        <FaTh className='h-4 w-4' />
                        <span className='hidden sm:inline'>Grid</span>
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={cn(
                            'flex items-center gap-2 rounded-r-xl px-4 py-3 transition-colors',
                            viewMode === 'list'
                                ? 'bg-secondary text-white'
                                : 'text-primary/60 hover:bg-primary/10'
                        )}
                        aria-label='List view'
                        aria-pressed={viewMode === 'list'}
                    >
                        <FaList className='h-4 w-4' />
                        <span className='hidden sm:inline'>List</span>
                    </button>
                </div>
            </div>

            {/* Expandable Filters */}
            <details className='bg-background/30 border-primary/10 rounded-xl border'>
                <summary className='text-primary/70 hover:text-primary flex cursor-pointer items-center gap-2 px-4 py-3 transition-colors'>
                    <FaFilter className='h-4 w-4' />
                    <span>Filters</span>
                    {hasMoreFiltersActive && (
                        <span className='bg-secondary ml-2 rounded-full px-2 py-0.5 text-xs text-white'>
                            Active
                        </span>
                    )}
                </summary>
                <div className='border-primary/10 space-y-4 border-t p-4'>
                    {/* Category Filter */}
                    <div>
                        <h4 className='text-primary/60 mb-2 text-sm font-medium'>Category</h4>
                        <div className='flex flex-wrap gap-2'>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => onCategoryChange(category)}
                                    className={cn(
                                        'rounded-full px-3 py-1.5 text-sm transition-colors',
                                        selectedCategory === category
                                            ? 'bg-secondary text-white'
                                            : 'bg-primary/5 text-primary/60 hover:bg-primary/10'
                                    )}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Explored Filter */}
                    <div>
                        <div className='mb-2 flex items-center justify-between'>
                            <h4 className='text-primary/60 flex items-center gap-2 text-sm font-medium'>
                                <FaEye className='h-3 w-3' />
                                Explored Status
                                <span className='text-primary/40'>({exploredCount} explored)</span>
                            </h4>
                            {exploredCount > 0 && (
                                <button
                                    onClick={onClearExplored}
                                    className='text-primary/40 hover:text-secondary flex items-center gap-1 text-xs transition-colors'
                                    title='Clear exploration history'
                                >
                                    <FaTrash className='h-3 w-3' />
                                    Reset
                                </button>
                            )}
                        </div>
                        <div className='flex flex-wrap gap-2'>
                            {(
                                [
                                    { value: 'all', label: 'All' },
                                    { value: 'explored', label: 'Explored' },
                                    { value: 'not-explored', label: 'Not Explored' }
                                ] as const
                            ).map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => onExploredFilterChange(option.value)}
                                    className={cn(
                                        'rounded-full px-3 py-1.5 text-sm transition-colors',
                                        exploredFilter === option.value
                                            ? 'bg-secondary text-white'
                                            : 'bg-primary/5 text-primary/60 hover:bg-primary/10'
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags Filter */}
                    <div>
                        <h4 className='text-primary/60 mb-2 text-sm font-medium'>Tags</h4>
                        <div className='flex max-h-32 flex-wrap gap-2 overflow-y-auto'>
                            {allTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={cn(
                                        'rounded-full px-3 py-1.5 text-sm transition-colors',
                                        selectedTags.includes(tag)
                                            ? 'bg-secondary text-white'
                                            : 'bg-primary/5 text-primary/60 hover:bg-primary/10'
                                    )}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className='text-secondary hover:text-secondary/80 flex items-center gap-2 text-sm transition-colors'
                        >
                            <FaTimes className='h-3 w-3' />
                            Clear all filters
                        </button>
                    )}
                </div>
            </details>
        </div>
    )
}

export default ConceptsFilter
