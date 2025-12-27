import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { FaGithub, FaLinkedin, FaRocket, FaYoutube, FaEnvelope } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import Section from '@/components/ui/section'
import ConceptCard from '@/components/concepts/concept-card'
import ConceptsFilter from '@/components/concepts/concepts-filter'
import ConceptDetailModal from '@/components/concepts/concept-detail-modal'
import CommandPalette from '@/components/concepts/command-palette'
import { conceptsData } from '@/data'
import type { Concept } from '@/types/concept'

const HomePage: React.FC = () => {
    const { conceptId } = useParams<{ conceptId?: string }>()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    // Derive filter state from URL search params
    const searchQueryFromUrl = searchParams.get('q') || ''
    const selectedCategory = searchParams.get('category') || 'All'
    const selectedTags = useMemo(() => {
        const tags = searchParams.get('tags')
        return tags ? tags.split(',').filter(Boolean) : []
    }, [searchParams])
    const viewMode = (searchParams.get('view') as 'grid' | 'list') || 'grid'

    // Local state for search input (for smooth typing)
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQueryFromUrl)
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Sync local search query when URL changes (e.g., browser back/forward)
    useEffect(() => {
        setLocalSearchQuery(searchQueryFromUrl)
    }, [searchQueryFromUrl])

    // Use local state for filtering (immediate feedback while typing)
    const searchQuery = localSearchQuery

    // Helper to update search params while preserving others
    const updateSearchParam = useCallback(
        (key: string, value: string | null) => {
            setSearchParams(
                (prev) => {
                    const newParams = new URLSearchParams(prev)
                    if (value === null || value === '' || value === 'All' || value === 'grid') {
                        newParams.delete(key)
                    } else {
                        newParams.set(key, value)
                    }
                    return newParams
                },
                { replace: true }
            )
        },
        [setSearchParams]
    )

    // Filter state setters that update URL
    const setSearchQuery = useCallback(
        (query: string) => {
            // Update local state immediately for smooth typing
            setLocalSearchQuery(query)

            // Debounce the URL update
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current)
            }
            searchDebounceRef.current = setTimeout(() => {
                updateSearchParam('q', query)
            }, 300)
        },
        [updateSearchParam]
    )

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current)
            }
        }
    }, [])

    const setSelectedCategory = useCallback(
        (category: string) => updateSearchParam('category', category),
        [updateSearchParam]
    )
    const setSelectedTags = useCallback(
        (tags: string[]) => updateSearchParam('tags', tags.length > 0 ? tags.join(',') : null),
        [updateSearchParam]
    )
    const setViewMode = useCallback(
        (mode: 'grid' | 'list') => updateSearchParam('view', mode),
        [updateSearchParam]
    )

    // Command palette state
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

    // Derive modal state from URL
    const selectedConcept = useMemo(() => {
        if (!conceptId) return null
        return conceptsData.concepts.find((c) => c.id === conceptId) || null
    }, [conceptId])

    const isDetailModalOpen = !!selectedConcept

    // Get all unique tags from concepts
    const allTags = useMemo(() => {
        const tags = new Set<string>()
        conceptsData.concepts.forEach((concept) => {
            concept.tags.forEach((tag) => tags.add(tag))
        })
        return Array.from(tags).sort()
    }, [])

    // Filter concepts
    const filteredConcepts = useMemo(() => {
        return conceptsData.concepts.filter((concept) => {
            // Search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                const matchesSearch =
                    concept.name.toLowerCase().includes(query) ||
                    concept.summary.toLowerCase().includes(query) ||
                    concept.explanation.toLowerCase().includes(query) ||
                    concept.tags.some((t) => t.toLowerCase().includes(query)) ||
                    concept.aliases?.some((a) => a.toLowerCase().includes(query))
                if (!matchesSearch) return false
            }

            // Category filter
            if (selectedCategory !== 'All' && concept.category !== selectedCategory) {
                return false
            }

            // Tags filter
            if (
                selectedTags.length > 0 &&
                !selectedTags.some((tag) => concept.tags.includes(tag))
            ) {
                return false
            }

            return true
        })
    }, [searchQuery, selectedCategory, selectedTags])

    // Sort: featured first, then by name
    const sortedConcepts = useMemo(() => {
        return [...filteredConcepts].sort((a, b) => {
            if (a.featured && !b.featured) return -1
            if (!a.featured && b.featured) return 1
            return a.name.localeCompare(b.name)
        })
    }, [filteredConcepts])

    // Handle keyboard shortcut for command palette
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Open command palette with '/' key (unless in input)
            if (
                e.key === '/' &&
                !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
            ) {
                e.preventDefault()
                setIsCommandPaletteOpen(true)
            }

            // Also support Cmd/Ctrl + K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsCommandPaletteOpen(true)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleShowDetails = useCallback(
        (concept: Concept) => {
            // Preserve search params when opening modal
            const params = searchParams.toString()
            navigate(`/concept/${concept.id}${params ? `?${params}` : ''}`)
        },
        [navigate, searchParams]
    )

    const handleCloseDetails = useCallback(() => {
        // Preserve search params when closing modal
        const params = searchParams.toString()
        navigate(`/${params ? `?${params}` : ''}`)
    }, [navigate, searchParams])

    const handleTagClick = useCallback(
        (tag: string) => {
            // Set the clicked tag as the only selected tag and navigate to home
            setSelectedTags([tag])
            navigate(`/?tags=${encodeURIComponent(tag)}`)
        },
        [navigate, setSelectedTags]
    )

    // Stats
    const totalConcepts = conceptsData.concepts.length
    const featuredConcepts = conceptsData.concepts.filter((c) => c.featured).length
    const categoriesCount = conceptsData.categories.filter((c) => c !== 'All').length

    return (
        <>
            {/* Hero Section */}
            <Section className='pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20'>
                <div className='mx-auto max-w-4xl text-center'>
                    <h1 className='mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl'>
                        Concepts
                    </h1>
                    <p className='text-primary/70 mx-auto mb-8 max-w-2xl text-lg sm:text-xl md:text-2xl'>
                        A curated collection of concepts, methods, and principles.
                    </p>

                    {/* Stats */}
                    <div className='mb-10 flex flex-wrap justify-center gap-6 sm:gap-10'>
                        <div className='text-center'>
                            <div className='text-secondary text-3xl font-bold sm:text-4xl'>
                                {totalConcepts}
                            </div>
                            <div className='text-primary/60 text-sm'>Total Concepts</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-amber-400 sm:text-4xl'>
                                {featuredConcepts}
                            </div>
                            <div className='text-primary/60 text-sm'>Featured</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-blue-400 sm:text-4xl'>
                                {categoriesCount}
                            </div>
                            <div className='text-primary/60 text-sm'>Categories</div>
                        </div>
                    </div>

                    {/* Quick tip */}
                    <div className='bg-secondary/10 border-secondary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm'>
                        <FaRocket className='text-secondary h-4 w-4' />
                        <span className='text-primary/70'>
                            Press{' '}
                            <kbd className='bg-secondary/20 mx-1 rounded px-1.5 py-0.5 font-mono text-xs'>
                                /
                            </kbd>{' '}
                            to quickly search and navigate
                        </span>
                    </div>
                </div>
            </Section>

            {/* Concepts Section */}
            <Section className='py-8 sm:py-12'>
                {/* Filters */}
                <div className='mb-8'>
                    <ConceptsFilter
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        selectedTags={selectedTags}
                        onTagsChange={setSelectedTags}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        categories={conceptsData.categories}
                        allTags={allTags}
                        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                    />
                </div>

                {/* Results count */}
                <div className='text-primary/60 mb-6 text-sm'>
                    Showing {sortedConcepts.length} of {totalConcepts} entries
                    {searchQuery && ` matching "${searchQuery}"`}
                </div>

                {/* Concepts Grid/List */}
                {sortedConcepts.length > 0 ? (
                    <div
                        className={
                            viewMode === 'grid'
                                ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                                : 'flex flex-col gap-3'
                        }
                    >
                        {sortedConcepts.map((concept) => (
                            <ConceptCard
                                key={concept.id}
                                concept={concept}
                                onShowDetails={handleShowDetails}
                                onTagClick={handleTagClick}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                ) : (
                    <div className='py-16 text-center'>
                        <div className='mb-4 text-5xl'>🔍</div>
                        <h3 className='mb-2 text-xl font-semibold'>No concepts found</h3>
                        <p className='text-primary/60'>
                            Try adjusting your search or filters to find what you're looking for.
                        </p>
                    </div>
                )}
            </Section>

            {/* About Section */}
            <Section className='border-primary/10 border-t py-16 sm:py-20'>
                <div className='mx-auto max-w-3xl text-center'>
                    <h2 className='mb-6 text-2xl font-bold sm:text-3xl'>About the Creator</h2>
                    <div className='mb-6 flex justify-center'>
                        <img
                            src='/assets/images/2025-11-03-Seb.png'
                            alt='Sébastien Dubois'
                            className='border-secondary/30 h-24 w-24 rounded-full border-2 object-cover sm:h-32 sm:w-32'
                        />
                    </div>
                    <p className='text-primary/70 mb-6 leading-relaxed'>
                        Hi! I'm Sébastien Dubois, a software crafter with 20+ years of IT
                        experience. I'm passionate about Personal Knowledge Management, note-taking,
                        and productivity. This collection gathers concepts, methods, and principles
                        I've explored and found valuable over the years.
                    </p>
                    {/* Primary links */}
                    <div className='mb-4 flex flex-wrap justify-center gap-3'>
                        <a
                            href='https://www.dsebastien.net'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='bg-secondary hover:bg-secondary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors'
                        >
                            <img
                                src='https://www.dsebastien.net/assets/images/developassion-logo.png?v=227ae60558'
                                alt='DeveloPassion'
                                className='h-5 w-5 rounded-full object-contain'
                            />
                            Website
                        </a>
                        <a
                            href='https://www.youtube.com/@dsebastien'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-red-400 transition-colors hover:bg-red-500/30'
                        >
                            <FaYoutube className='h-5 w-5' />
                            YouTube
                        </a>
                        <a
                            href='https://www.dsebastien.net/newsletter/'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-2 rounded-lg bg-amber-500/20 px-4 py-2 text-amber-400 transition-colors hover:bg-amber-500/30'
                        >
                            <FaEnvelope className='h-5 w-5' />
                            Newsletter
                        </a>
                    </div>
                    {/* Social links */}
                    <div className='flex flex-wrap justify-center gap-3'>
                        <a
                            href='https://github.com/dsebastien'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='bg-primary/10 hover:bg-primary/20 flex items-center gap-2 rounded-lg px-4 py-2 transition-colors'
                        >
                            <FaGithub className='h-5 w-5' />
                            GitHub
                        </a>
                        <a
                            href='https://x.com/dsebastien'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='bg-primary/10 hover:bg-primary/20 flex items-center gap-2 rounded-lg px-4 py-2 transition-colors'
                        >
                            <FaXTwitter className='h-5 w-5' />X
                        </a>
                        <a
                            href='https://www.linkedin.com/in/sebastiend'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='bg-primary/10 hover:bg-primary/20 flex items-center gap-2 rounded-lg px-4 py-2 transition-colors'
                        >
                            <FaLinkedin className='h-5 w-5' />
                            LinkedIn
                        </a>
                    </div>
                </div>
            </Section>

            {/* Detail Modal */}
            <ConceptDetailModal
                concept={selectedConcept}
                allConcepts={conceptsData.concepts}
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetails}
                onNavigateToConcept={handleShowDetails}
                onTagClick={handleTagClick}
            />

            {/* Command Palette */}
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                concepts={conceptsData.concepts}
                onShowDetails={handleShowDetails}
                onSetViewMode={setViewMode}
                onSetCategory={setSelectedCategory}
                categories={conceptsData.categories}
            />
        </>
    )
}

export default HomePage
