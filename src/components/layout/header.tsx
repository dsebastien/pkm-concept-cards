import { Link } from 'react-router'
import { FaBrain, FaDice } from 'react-icons/fa'

const Header: React.FC = () => {
    return (
        <header className='border-primary/10 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 w-full border-b shadow-lg shadow-black/5 backdrop-blur-md'>
            <nav className='mx-auto max-w-7xl'>
                <div className='xg:px-16 flex h-16 items-center justify-between px-4 sm:h-20 sm:px-6 md:px-8 lg:px-12 xl:px-20'>
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
                    <div className='flex items-center gap-2 sm:gap-3'>
                        {/* Random Concept Button */}
                        <Link
                            to='/random'
                            className='bg-primary/10 hover:bg-primary/20 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors sm:px-4'
                            title='Random Concept'
                        >
                            <FaDice className='h-5 w-5' />
                            <span className='hidden sm:inline'>Random</span>
                        </Link>

                        {/* Website Link */}
                        <a
                            href='https://www.dsebastien.net'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='bg-primary/10 hover:bg-primary/20 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors sm:px-4'
                        >
                            <img
                                src='https://www.dsebastien.net/assets/images/developassion-logo.png?v=227ae60558'
                                alt='DeveloPassion'
                                className='h-5 w-5 rounded-full object-contain'
                            />
                            <span className='hidden sm:inline'>Website</span>
                        </a>
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Header
