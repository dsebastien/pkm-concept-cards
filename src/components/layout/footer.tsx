import { Link } from 'react-router'
import { FaHeart, FaBrain, FaDice, FaChartBar, FaCompass } from 'react-icons/fa'
import resourcesData from '@/data/resources.json'
import socialsData from '@/data/socials.json'
import ConceptIcon from '@/components/concepts/concept-icon'

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className='border-primary/10 bg-background border-t pt-12 pb-20 sm:pt-16 sm:pb-24 md:pt-20 md:pb-28 lg:pt-24 lg:pb-32'>
            <div className='xg:px-24 mx-auto max-w-7xl px-6 sm:px-10 md:px-16 lg:px-20 xl:px-32'>
                <div className='grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-3 lg:gap-16'>
                    {/* Logo and Description */}
                    <div className='flex flex-col gap-4'>
                        <Link to='/' className='flex items-center gap-3'>
                            <div className='bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                                <FaBrain className='text-secondary h-5 w-5' />
                            </div>
                            <span className='text-lg font-bold'>Concepts</span>
                        </Link>
                        <p className='text-primary/70 text-sm'>
                            A curated collection of concepts, methods, and principles.
                        </p>
                        <Link
                            to='/random'
                            className='text-primary/70 hover:text-secondary mt-2 inline-flex items-center gap-2 text-sm transition-colors'
                        >
                            <FaDice className='h-4 w-4' />
                            Random Concept
                        </Link>
                        <Link
                            to='/statistics'
                            className='text-primary/70 hover:text-secondary mt-2 inline-flex items-center gap-2 text-sm transition-colors'
                        >
                            <FaChartBar className='h-4 w-4' />
                            Statistics
                        </Link>
                        <Link
                            to='/unexplored'
                            className='text-primary/70 hover:text-secondary mt-2 inline-flex items-center gap-2 text-sm transition-colors'
                        >
                            <FaCompass className='h-4 w-4' />
                            Unexplored
                        </Link>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className='mb-4 font-semibold'>Resources</h3>
                        <ul className='space-y-2 text-sm'>
                            {resourcesData.resources.map((resource) => (
                                <li key={resource.url}>
                                    <a
                                        href={resource.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-primary/70 hover:text-secondary flex items-center gap-2 transition-colors'
                                    >
                                        <ConceptIcon icon={resource.icon} category='' size='sm' />
                                        {resource.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h3 className='mb-4 font-semibold'>Connect</h3>
                        <div className='flex flex-wrap gap-3'>
                            {socialsData.socials.map((social) => (
                                <a
                                    key={social.url}
                                    href={social.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='transition-transform hover:scale-110'
                                    aria-label={social.name}
                                    title={social.name}
                                >
                                    <ConceptIcon icon={social.icon} category='' size='md' />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='border-primary/10 text-primary/70 mt-12 border-t pt-12 text-center text-sm sm:mt-16 sm:pt-16 lg:mt-20 lg:pt-20'>
                    <p className='flex items-center justify-center gap-1'>
                        Made with <FaHeart className='text-secondary h-4 w-4' /> by{' '}
                        <a
                            href='https://www.dsebastien.net'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='hover:text-secondary transition-colors'
                        >
                            Sébastien Dubois
                        </a>
                    </p>
                    <p className='mt-2'>© {currentYear} All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
