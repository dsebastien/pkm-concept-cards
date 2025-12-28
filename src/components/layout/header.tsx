import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import {
    FaBrain,
    FaDice,
    FaCompass,
    FaStar,
    FaFolder,
    FaChartBar,
    FaBars,
    FaTimes
} from 'react-icons/fa'

interface NavLink {
    to: string
    label: string
    icon: React.ReactNode
    color?: string
    external?: boolean
}

// Links that are always visible (even on mobile, as icons)
const alwaysVisibleLinks: NavLink[] = [
    {
        to: '/featured',
        label: 'Featured',
        icon: <FaStar className='h-5 w-5' />,
        color: 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
    },
    {
        to: '/unexplored',
        label: 'Unexplored',
        icon: <FaCompass className='h-5 w-5' />,
        color: 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
    }
]

// Links that go into the hamburger menu on smaller screens
const menuLinks: NavLink[] = [
    {
        to: '/random',
        label: 'Random',
        icon: <FaDice className='h-5 w-5' />,
        color: 'bg-primary/10 hover:bg-primary/20'
    },
    {
        to: '/categories',
        label: 'Categories',
        icon: <FaFolder className='h-5 w-5' />,
        color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
    },
    {
        to: '/statistics',
        label: 'Statistics',
        icon: <FaChartBar className='h-5 w-5' />,
        color: 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20'
    }
]

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const location = useLocation()

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false)
    }, [location.pathname])

    // Prevent body scroll when menu is open and handle ESC key
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'

            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    setIsMenuOpen(false)
                }
            }
            window.addEventListener('keydown', handleEsc)
            return () => {
                document.body.style.overflow = ''
                window.removeEventListener('keydown', handleEsc)
            }
        } else {
            document.body.style.overflow = ''
        }
    }, [isMenuOpen])

    return (
        <>
            <header className='border-primary/10 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 w-full border-b shadow-lg shadow-black/5 backdrop-blur-md'>
                <nav className='mx-auto max-w-7xl'>
                    <div className='flex h-16 items-center justify-between px-4 sm:h-20 sm:px-6 md:px-8 lg:px-12 xl:px-16'>
                        {/* Logo */}
                        <div className='flex items-center'>
                            <Link
                                to='/'
                                className='flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 sm:gap-4'
                            >
                                <div className='relative'>
                                    <div className='bg-secondary/20 absolute inset-0 rounded-full blur-md'></div>
                                    <div className='bg-secondary/10 relative flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12 md:h-14 md:w-14'>
                                        <FaBrain className='text-secondary h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7' />
                                    </div>
                                </div>
                                <span className='from-primary to-primary/80 bg-gradient-to-r bg-clip-text text-lg font-bold tracking-tight text-transparent sm:text-xl md:text-2xl'>
                                    Concepts
                                </span>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className='flex items-center gap-1 sm:gap-2'>
                            {/* Always visible links (icons on mobile, labels on xl) */}
                            {alwaysVisibleLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`flex items-center gap-2 rounded-lg p-2 transition-colors sm:px-3 sm:py-2 xl:px-4 ${link.color}`}
                                    title={link.label}
                                >
                                    {link.icon}
                                    <span className='hidden xl:inline'>{link.label}</span>
                                </Link>
                            ))}

                            {/* Website Link - always visible */}
                            <a
                                href='https://www.dsebastien.net'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='bg-primary/10 hover:bg-primary/20 flex items-center gap-2 rounded-lg p-2 transition-colors sm:px-3 sm:py-2 xl:px-4'
                                title='DeveloPassion Website'
                            >
                                <img
                                    src='/assets/images/developassion-logo.png'
                                    alt='DeveloPassion'
                                    className='h-5 w-5 rounded-full object-contain'
                                />
                                <span className='hidden xl:inline'>Website</span>
                            </a>

                            {/* Menu links - visible on lg+ screens */}
                            <div className='hidden items-center gap-2 lg:flex'>
                                {menuLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors xl:px-4 ${link.color}`}
                                        title={link.label}
                                    >
                                        {link.icon}
                                        <span className='hidden xl:inline'>{link.label}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* Hamburger Menu Button - visible on smaller screens */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className='bg-primary/10 hover:bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg transition-colors lg:hidden'
                                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={isMenuOpen}
                            >
                                {isMenuOpen ? (
                                    <FaTimes className='h-5 w-5' />
                                ) : (
                                    <FaBars className='h-5 w-5' />
                                )}
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile Fullscreen Overlay Menu */}
            <div
                className={`bg-background/98 fixed inset-0 z-40 flex flex-col backdrop-blur-md transition-all duration-300 lg:hidden ${
                    isMenuOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
                }`}
                style={{ top: '64px' }}
                onClick={() => setIsMenuOpen(false)}
            >
                <div className='flex flex-1 flex-col items-center justify-center gap-4 p-6'>
                    {menuLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex w-full max-w-xs items-center justify-center gap-3 rounded-xl px-6 py-4 text-lg font-medium transition-all hover:scale-105 ${link.color}`}
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Close hint */}
                <div className='text-primary/40 pb-8 text-center text-sm'>
                    Tap anywhere or press ESC to close
                </div>
            </div>
        </>
    )
}

export default Header
