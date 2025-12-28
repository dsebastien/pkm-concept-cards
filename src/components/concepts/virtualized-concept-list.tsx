import { useRef, useCallback, useMemo, memo, useState, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import ConceptCard from '@/components/concepts/concept-card'
import type { Concept } from '@/types/concept'

interface VirtualizedConceptListProps {
    concepts: Concept[]
    viewMode: 'grid' | 'list'
    onShowDetails: (concept: Concept) => void
    onTagClick: (tag: string) => void
    onCategoryClick: (category: string) => void
    isExplored: (conceptId: string) => boolean
}

// Grid configuration
const BADGE_PADDING = 12 // pt-3 = 0.75rem = 12px for badge overflow
const CARD_MIN_HEIGHT_GRID = 320 // Approximate card height in grid mode
const CARD_HEIGHT_LIST = 80 // Approximate card height in list mode
const OVERSCAN = 5 // Number of items to render outside viewport

// Get number of columns based on container width
const getColumnCount = (containerWidth: number): number => {
    if (containerWidth >= 1024) return 3 // lg:grid-cols-3
    if (containerWidth >= 640) return 2 // sm:grid-cols-2
    return 1
}

const VirtualizedConceptList: React.FC<VirtualizedConceptListProps> = memo(
    ({ concepts, viewMode, onShowDetails, onTagClick, onCategoryClick, isExplored }) => {
        const parentRef = useRef<HTMLDivElement>(null)
        const [containerWidth, setContainerWidth] = useState(1024)

        // Observe container resize
        useEffect(() => {
            const parent = parentRef.current
            if (!parent) return

            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    setContainerWidth(entry.contentRect.width)
                }
            })

            resizeObserver.observe(parent)
            // Initial measurement
            setContainerWidth(parent.offsetWidth)

            return () => resizeObserver.disconnect()
        }, [])

        // Calculate columns based on container width
        const columnCount = getColumnCount(containerWidth)

        // Calculate rows for grid view
        const rowCount =
            viewMode === 'grid' ? Math.ceil(concepts.length / columnCount) : concepts.length

        // Estimate row height
        const estimateSize = useCallback(() => {
            return viewMode === 'grid'
                ? CARD_MIN_HEIGHT_GRID + BADGE_PADDING + BADGE_PADDING // top and bottom padding for badges
                : CARD_HEIGHT_LIST + 12
        }, [viewMode])

        const virtualizer = useVirtualizer({
            count: rowCount,
            getScrollElement: () => parentRef.current,
            estimateSize,
            overscan: OVERSCAN,
            paddingStart: 0,
            paddingEnd: 0
        })

        const virtualItems = virtualizer.getVirtualItems()

        // Memoize stable callbacks
        const handleShowDetails = useCallback(
            (concept: Concept) => {
                onShowDetails(concept)
            },
            [onShowDetails]
        )

        const handleTagClick = useCallback(
            (tag: string) => {
                onTagClick(tag)
            },
            [onTagClick]
        )

        const handleCategoryClick = useCallback(
            (category: string) => {
                onCategoryClick(category)
            },
            [onCategoryClick]
        )

        // Memoize isExplored check to avoid recalculating
        const exploredMap = useMemo(() => {
            const map = new Map<string, boolean>()
            concepts.forEach((c) => {
                map.set(c.id, isExplored(c.id))
            })
            return map
        }, [concepts, isExplored])

        const getIsExplored = useCallback(
            (conceptId: string) => {
                return exploredMap.get(conceptId) ?? false
            },
            [exploredMap]
        )

        if (concepts.length === 0) {
            return (
                <div className='py-16 text-center'>
                    <div className='mb-4 text-5xl'>🔍</div>
                    <h3 className='mb-2 text-xl font-semibold'>No concepts found</h3>
                    <p className='text-primary/60'>
                        Try adjusting your search or filters to find what you're looking for.
                    </p>
                </div>
            )
        }

        if (viewMode === 'list') {
            return (
                <div
                    ref={parentRef}
                    className='h-[calc(100vh-200px)] min-h-[800px] overflow-auto'
                    style={{ contain: 'strict' }}
                >
                    <div
                        className='relative w-full'
                        style={{ height: `${virtualizer.getTotalSize()}px` }}
                    >
                        {virtualItems.map((virtualRow) => {
                            const concept = concepts[virtualRow.index]
                            if (!concept) return null

                            return (
                                <div
                                    key={concept.id}
                                    className='absolute top-0 left-0 w-full'
                                    style={{
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`
                                    }}
                                >
                                    <div className='pb-3'>
                                        <ConceptCard
                                            concept={concept}
                                            onShowDetails={handleShowDetails}
                                            onTagClick={handleTagClick}
                                            onCategoryClick={handleCategoryClick}
                                            viewMode='list'
                                            isExplored={getIsExplored(concept.id)}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        }

        // Grid view - virtualize rows, render columns within each row
        return (
            <div
                ref={parentRef}
                className='-mx-3 h-[calc(100vh-200px)] min-h-[800px] overflow-auto px-3 pt-3'
            >
                <div
                    className='relative w-full'
                    style={{ height: `${virtualizer.getTotalSize()}px` }}
                >
                    {virtualItems.map((virtualRow) => {
                        const rowIndex = virtualRow.index
                        const startIndex = rowIndex * columnCount
                        const rowConcepts = concepts.slice(startIndex, startIndex + columnCount)

                        return (
                            <div
                                key={virtualRow.key}
                                className='absolute top-0 left-0 w-full'
                                style={{
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`
                                }}
                            >
                                <div
                                    className='grid gap-6 pt-3 pb-3'
                                    style={{
                                        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`
                                    }}
                                >
                                    {rowConcepts.map((concept) => (
                                        <ConceptCard
                                            key={concept.id}
                                            concept={concept}
                                            onShowDetails={handleShowDetails}
                                            onTagClick={handleTagClick}
                                            onCategoryClick={handleCategoryClick}
                                            viewMode='grid'
                                            isExplored={getIsExplored(concept.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
)

VirtualizedConceptList.displayName = 'VirtualizedConceptList'

export default VirtualizedConceptList
