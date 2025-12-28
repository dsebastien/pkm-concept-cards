import { Link } from 'react-router'
import {
    FaHeart,
    FaBrain,
    FaDice,
    FaChartBar,
    FaCompass,
    FaFolder,
    FaStar,
    FaFileContract,
    FaBook,
    FaNewspaper,
    FaLink,
    FaStickyNote,
    FaHistory
} from 'react-icons/fa'
import resourcesData from '@/data/resources.json'
import socialsData from '@/data/socials.json'
import ConceptIcon from '@/components/concepts/concept-icon'

const Footer: React.FC = () => {
    return (
        <footer className='border-primary/10 bg-background border-t pt-12 pb-20 sm:pt-16 sm:pb-24 md:pt-20 md:pb-28 lg:pt-24 lg:pb-32'>
            <div className='xg:px-24 mx-auto max-w-7xl px-6 sm:px-10 md:px-16 lg:px-20 xl:px-32'>
                <div className='grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-12'>
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
                        <div className='flex flex-wrap gap-3 pt-2'>
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

                    {/* Explore */}
                    <div>
                        <h3 className='mb-4 font-semibold'>Explore</h3>
                        <ul className='space-y-2 text-sm'>
                            <li>
                                <Link
                                    to='/featured'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaStar className='h-4 w-4' />
                                    Featured
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/unexplored'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaCompass className='h-4 w-4' />
                                    Unexplored
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/random'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaDice className='h-4 w-4' />
                                    Random Concept
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/categories'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaFolder className='h-4 w-4' />
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/statistics'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaChartBar className='h-4 w-4' />
                                    Statistics
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/history'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaHistory className='h-4 w-4' />
                                    History
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Content */}
                    <div>
                        <h3 className='mb-4 font-semibold'>Content</h3>
                        <ul className='space-y-2 text-sm'>
                            <li>
                                <Link
                                    to='/books'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaBook className='h-4 w-4' />
                                    Books
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/articles'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaNewspaper className='h-4 w-4' />
                                    Articles
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/references'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaLink className='h-4 w-4' />
                                    References
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/notes'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaStickyNote className='h-4 w-4' />
                                    Notes
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/disclaimer'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaFileContract className='h-4 w-4' />
                                    Disclaimer
                                </Link>
                            </li>
                        </ul>
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
                </div>
            </div>
        </footer>
    )
}

export default Footer
