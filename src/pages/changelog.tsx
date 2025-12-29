import { Link } from 'react-router'
import { FaArrowLeft, FaHistory } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import Section from '@/components/ui/section'
import { AnimatedPage, AnimatedHero, AnimatedSection } from '@/components/ui/animated'
import changelogContent from '../../CHANGELOG.md?raw'

const ChangelogPage: React.FC = () => {
    return (
        <AnimatedPage>
            {/* Header */}
            <Section className='pt-16 pb-8 sm:pt-24 sm:pb-12'>
                <AnimatedHero className='mx-auto max-w-4xl'>
                    <Link
                        to='/'
                        className='text-primary/70 hover:text-secondary mb-6 inline-flex items-center gap-2 text-sm transition-colors'
                    >
                        <FaArrowLeft className='h-3 w-3' />
                        Back to Concepts
                    </Link>
                    <div className='flex items-center gap-4'>
                        <div className='bg-secondary/10 flex h-14 w-14 items-center justify-center rounded-full'>
                            <FaHistory className='text-secondary h-7 w-7' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                Changelog
                            </h1>
                            <p className='text-primary/70 mt-1'>
                                Version history and release notes
                            </p>
                        </div>
                    </div>
                </AnimatedHero>
            </Section>

            {/* Changelog Content */}
            <Section className='py-8 pb-16'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <div className='bg-primary/5 rounded-xl p-6'>
                        <div className='prose prose-invert prose-sm max-w-none'>
                            <ReactMarkdown
                                components={{
                                    h1: ({ children }) => (
                                        <h1 className='text-primary mb-6 text-2xl font-bold'>
                                            {children}
                                        </h1>
                                    ),
                                    h2: ({ children }) => (
                                        <h2 className='text-primary border-primary/10 mt-8 mb-4 border-b pb-2 text-xl font-semibold'>
                                            {children}
                                        </h2>
                                    ),
                                    h3: ({ children }) => (
                                        <h3 className='text-primary mt-6 mb-3 text-lg font-medium'>
                                            {children}
                                        </h3>
                                    ),
                                    ul: ({ children }) => (
                                        <ul className='text-primary/80 ml-2 list-inside list-disc space-y-1'>
                                            {children}
                                        </ul>
                                    ),
                                    li: ({ children }) => (
                                        <li className='text-primary/80'>{children}</li>
                                    ),
                                    a: ({ href, children }) => (
                                        <a
                                            href={href}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-secondary hover:text-secondary-text underline'
                                        >
                                            {children}
                                        </a>
                                    ),
                                    p: ({ children }) => (
                                        <p className='text-primary/80 my-2'>{children}</p>
                                    ),
                                    code: ({ children }) => (
                                        <code className='bg-primary/10 rounded px-1.5 py-0.5 font-mono text-sm'>
                                            {children}
                                        </code>
                                    )
                                }}
                            >
                                {changelogContent}
                            </ReactMarkdown>
                        </div>
                    </div>
                </AnimatedSection>
            </Section>
        </AnimatedPage>
    )
}

export default ChangelogPage
