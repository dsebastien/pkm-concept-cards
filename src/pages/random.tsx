import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { conceptsData } from '@/data'

const RandomConceptPage: React.FC = () => {
    const navigate = useNavigate()

    useEffect(() => {
        // Pick a random concept
        const concepts = conceptsData.concepts
        if (concepts.length === 0) {
            navigate('/', { replace: true })
            return
        }

        const randomIndex = Math.floor(Math.random() * concepts.length)
        const randomConcept = concepts[randomIndex]

        // Navigate to the concept's detail page
        if (randomConcept) {
            navigate(`/concept/${randomConcept.id}`, { replace: true })
        }
    }, [navigate])

    // Show a brief loading state while redirecting
    return (
        <div className='flex min-h-[50vh] items-center justify-center'>
            <div className='text-center'>
                <div className='text-secondary mb-4 text-5xl'>🎲</div>
                <p className='text-primary/70'>Finding a random concept...</p>
            </div>
        </div>
    )
}

export default RandomConceptPage
