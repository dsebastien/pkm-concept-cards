import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'explored-concepts'

export type ExploredFilter = 'all' | 'explored' | 'not-explored'

export function useExploredConcepts() {
    const [exploredIds, setExploredIds] = useState<Set<string>>(() => {
        if (typeof window === 'undefined') return new Set()
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            return stored ? new Set(JSON.parse(stored)) : new Set()
        } catch {
            return new Set()
        }
    })

    // Sync to localStorage whenever exploredIds changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...exploredIds]))
        } catch {
            // Ignore storage errors
        }
    }, [exploredIds])

    const markAsExplored = useCallback((conceptId: string) => {
        setExploredIds((prev) => {
            if (prev.has(conceptId)) return prev
            const next = new Set(prev)
            next.add(conceptId)
            return next
        })
    }, [])

    const isExplored = useCallback(
        (conceptId: string) => {
            return exploredIds.has(conceptId)
        },
        [exploredIds]
    )

    const clearAllExplored = useCallback(() => {
        setExploredIds(new Set())
    }, [])

    const exploredCount = exploredIds.size

    return {
        exploredIds,
        markAsExplored,
        isExplored,
        clearAllExplored,
        exploredCount
    }
}
