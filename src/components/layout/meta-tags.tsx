import { useEffect } from 'react'
import { useLocation } from 'react-router'

interface MetaTagsProps {
    title?: string
    description?: string
    image?: string
    url?: string
}

/**
 * Component to dynamically update meta tags for social sharing.
 * Updates document title and Open Graph / Twitter Card meta tags.
 */
export function MetaTags({ title, description, image, url }: MetaTagsProps) {
    const location = useLocation()
    const BASE_URL = 'https://concepts.dsebastien.net'

    const defaultTitle = 'Concepts - A Curated Collection of Concepts, Methods & Principles'
    const defaultDescription = 'A curated collection of concepts, methods, and principles.'
    const defaultImage = `${BASE_URL}/assets/images/social-card.png`

    const finalTitle = title || defaultTitle
    const finalDescription = description || defaultDescription
    const finalImage = image || defaultImage
    const finalUrl = url || `${BASE_URL}${location.pathname}${location.search}${location.hash}`

    useEffect(() => {
        // Update document title
        document.title = finalTitle

        // Update or create meta tags
        const updateMetaTag = (property: string, content: string, isName = false) => {
            const attribute = isName ? 'name' : 'property'
            let element = document.querySelector(`meta[${attribute}="${property}"]`)

            if (element) {
                element.setAttribute('content', content)
            } else {
                element = document.createElement('meta')
                element.setAttribute(attribute, property)
                element.setAttribute('content', content)
                document.head.appendChild(element)
            }
        }

        // Update basic meta tags
        updateMetaTag('description', finalDescription, true)

        // Update Open Graph tags
        updateMetaTag('og:title', finalTitle)
        updateMetaTag('og:description', finalDescription)
        updateMetaTag('og:image', finalImage)
        updateMetaTag('og:url', finalUrl)

        // Update Twitter Card tags
        updateMetaTag('twitter:title', finalTitle, true)
        updateMetaTag('twitter:description', finalDescription, true)
        updateMetaTag('twitter:image', finalImage, true)
        updateMetaTag('twitter:url', finalUrl, true)

        // Update canonical URL
        let canonical = document.querySelector('link[rel="canonical"]')
        if (canonical) {
            canonical.setAttribute('href', finalUrl)
        } else {
            canonical = document.createElement('link')
            canonical.setAttribute('rel', 'canonical')
            canonical.setAttribute('href', finalUrl)
            document.head.appendChild(canonical)
        }
    }, [finalTitle, finalDescription, finalImage, finalUrl])

    return null
}

/**
 * Helper function to generate social image URL for a concept
 */
export function getConceptSocialImage(conceptId: string): string {
    return `https://concepts.dsebastien.net/assets/images/social-cards/concepts/${conceptId}.png`
}

/**
 * Helper function to generate social image URL for a tag
 */
export function getTagSocialImage(tag: string): string {
    const sanitizedTag = tag
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    return `https://concepts.dsebastien.net/assets/images/social-cards/tags/${sanitizedTag}.png`
}

/**
 * Helper function to generate social image URL for a category
 */
export function getCategorySocialImage(category: string): string {
    const sanitizedCategory = category
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    return `https://concepts.dsebastien.net/assets/images/social-cards/categories/${sanitizedCategory}.png`
}

/**
 * Helper function to generate social image URL for a page
 */
export function getPageSocialImage(pageName: string): string {
    return `https://concepts.dsebastien.net/assets/images/social-cards/pages/${pageName}.png`
}
