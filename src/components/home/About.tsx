'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useMessages } from '@/lib/i18n/useMessages';

interface AboutProps {
    content: string;
    title?: string;
}

export default function About({ content, title }: AboutProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.about;
    const emailTooltipClassName = 'pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-neutral-200/80 bg-white/90 px-2.5 py-1 text-center text-xs font-normal leading-none text-neutral-800 opacity-0 shadow-[0_8px_22px_rgba(15,23,42,0.16)] backdrop-blur-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 dark:border-white/15 dark:bg-neutral-950/90 dark:text-white dark:shadow-[0_8px_28px_rgba(0,0,0,0.5)]';

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            <h2 className="text-2xl font-serif font-bold text-primary mb-4">{resolvedTitle}</h2>
            <div className="text-neutral-700 dark:text-neutral-600 leading-relaxed">
                <ReactMarkdown
                    components={{
                        h1: ({ children }) => <h1 className="text-3xl font-serif font-bold text-primary mt-8 mb-4">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-2xl font-serif font-bold text-primary mt-8 mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xl font-semibold text-primary mt-6 mb-3">{children}</h3>,
                        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 ml-4">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 ml-4">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        a: ({ href, ...props }) => {
                            const isEmailLink = typeof href === 'string' && href.startsWith('mailto:');
                            const emailAddress = isEmailLink ? decodeURIComponent(href.replace(/^mailto:/, '')) : undefined;

                            if (emailAddress) {
                                return (
                                    <span className="group relative inline-flex">
                                        <a
                                            {...props}
                                            href={href}
                                            aria-label={`Email: ${emailAddress}`}
                                            className="text-accent font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                                        />
                                        <span className={emailTooltipClassName} role="tooltip">
                                            {emailAddress}
                                        </span>
                                    </span>
                                );
                            }

                            return (
                                <a
                                    {...props}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-accent font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                                />
                            );
                        },
                        blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-accent/50 pl-4 italic my-4 text-neutral-600 dark:text-neutral-500">
                                {children}
                            </blockquote>
                        ),
                        strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                        em: ({ children }) => <em className="italic text-neutral-600 dark:text-neutral-500">{children}</em>,
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </motion.section>
    );
}
