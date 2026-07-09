'use client';

import { motion } from 'framer-motion';
import { Award, BookOpen, FileText, GraduationCap, Medal, Mic, Sparkles, Trophy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CardPageConfig } from '@/types/page';

const markdownComponents = {
    p: ({ children }: React.ComponentProps<'p'>) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }: React.ComponentProps<'ul'>) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
    ol: ({ children }: React.ComponentProps<'ol'>) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
    li: ({ children }: React.ComponentProps<'li'>) => <li className="mb-1">{children}</li>,
    a: ({ ...props }) => (
        <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
        />
    ),
    blockquote: ({ children }: React.ComponentProps<'blockquote'>) => (
        <blockquote className="border-l-4 border-accent/50 pl-4 italic my-4 text-neutral-600 dark:text-neutral-500">
            {children}
        </blockquote>
    ),
    strong: ({ children }: React.ComponentProps<'strong'>) => <strong className="font-semibold text-primary">{children}</strong>,
    em: ({ children }: React.ComponentProps<'em'>) => <em className="italic">{children}</em>,
    code: ({ children }: React.ComponentProps<'code'>) => (
        <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[0.95em]">{children}</code>
    ),
};

const awardAccentStyles = [
    {
        icon: Sparkles,
        dot: 'bg-accent',
        badge: 'bg-accent/10 text-accent-dark ring-accent/20 dark:bg-accent/15 dark:text-accent-light dark:ring-accent/25',
        border: 'hover:border-accent/45 dark:hover:border-accent/45',
    },
    {
        icon: GraduationCap,
        dot: 'bg-teal-500',
        badge: 'bg-teal-500/10 text-teal-700 ring-teal-500/20 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/25',
        border: 'hover:border-teal-500/45 dark:hover:border-teal-400/45',
    },
    {
        icon: Award,
        dot: 'bg-indigo-500',
        badge: 'bg-indigo-500/10 text-indigo-700 ring-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/25',
        border: 'hover:border-indigo-500/45 dark:hover:border-indigo-400/45',
    },
    {
        icon: Medal,
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25',
        border: 'hover:border-emerald-500/45 dark:hover:border-emerald-400/45',
    },
];

function extractYears(date?: string) {
    return (date?.match(/\d{4}/g) || [])
        .map(year => Number.parseInt(year, 10))
        .filter(Number.isFinite);
}

function getTimelineDate(date?: string) {
    if (!date) {
        return { primary: '-', secondary: '' };
    }

    const monthDate = date.match(/^(\d{4})\.(\d{2})$/);
    if (monthDate) {
        return { primary: monthDate[1], secondary: `.${monthDate[2]}` };
    }

    const yearRange = date.match(/^(\d{4})\s*-\s*(\d{4})$/);
    if (yearRange) {
        return { primary: `${yearRange[1]}-${yearRange[2]}`, secondary: '' };
    }

    return { primary: date, secondary: '' };
}

function getDateSortValue(date?: string) {
    if (!date) {
        return 0;
    }

    const monthDate = date.match(/^(\d{4})\.(\d{2})$/);
    if (monthDate) {
        return Number.parseInt(monthDate[1], 10) * 100 + Number.parseInt(monthDate[2], 10);
    }

    const yearRange = date.match(/^(\d{4})\s*-\s*(\d{4})$/);
    if (yearRange) {
        return Number.parseInt(yearRange[2], 10) * 100;
    }

    const years = extractYears(date);
    return years.length > 0 ? Math.max(...years) * 100 : 0;
}

function sortAwardsByDate(items: NonNullable<CardPageConfig['items']>) {
    return items
        .map((item, index) => ({ item, index }))
        .sort((a, b) => {
            const byDate = getDateSortValue(b.item.date) - getDateSortValue(a.item.date);

            if (byDate !== 0) {
                return byDate;
            }

            return a.index - b.index;
        })
        .map(({ item }) => item);
}

function renderHighlightedTitle(title: string, highlight?: string, compactHighlight = false, embedded = false) {
    if (!highlight || !title.includes(highlight)) {
        return title;
    }

    const highlightStart = title.indexOf(highlight);
    const before = title.slice(0, highlightStart);
    const after = title.slice(highlightStart + highlight.length);
    const highlightSize = compactHighlight ? (embedded ? "text-base" : "text-lg") : "";

    return (
        <>
            {before}
            <span className={`text-accent-dark dark:text-accent-light ${highlightSize}`}>{highlight}</span>
            {after}
        </>
    );
}

function renderOrdinalText(text: string) {
    const parts = text.split(/(\d+)(st|nd|rd|th)\b/gi);

    if (parts.length === 1) {
        return text;
    }

    return parts.map((part, index) => {
        if (index % 3 === 1) {
            return (
                <span key={`${part}-${index}`}>
                    {part}<sup className="align-super text-[0.68em] leading-none">{parts[index + 1]}</sup>
                </span>
            );
        }

        if (index % 3 === 2) {
            return null;
        }

        return part;
    });
}

function AwardsCardPage({ config, embedded = false }: { config: CardPageConfig; embedded?: boolean }) {
    const items = config.items || [];
    const sortedItems = sortAwardsByDate(items);
    const summary = config.summary || {};

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <header className={`${embedded ? "mb-6 pb-6" : "mb-10 pb-8"} border-b border-neutral-200/80 dark:border-[rgba(148,163,184,0.18)]`}>
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-accent-dark dark:text-accent-light">
                        <Trophy className="h-4 w-4" aria-hidden="true" />
                        <span>{summary.eyebrow || 'Selected Recognition'}</span>
                    </div>
                    <h1 className={`${embedded ? "text-2xl" : "text-4xl"} mt-3 font-serif font-bold text-primary`}>{config.title}</h1>
                    <div className="mt-5 grid h-1 w-28 grid-cols-3 overflow-hidden rounded-full">
                        <span className="bg-accent" />
                        <span className="bg-teal-500" />
                        <span className="bg-indigo-500" />
                    </div>
                </div>
            </header>

            {items.length === 0 ? (
                <div className={`${embedded ? "p-4" : "p-6"} rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-500`}>
                    {config.empty || 'Content will be added soon.'}
                </div>
            ) : (
                <section aria-label={config.title}>
                    <ol className="relative space-y-4 before:absolute before:bottom-0 before:left-[8rem] before:top-0 before:hidden before:w-px before:bg-neutral-200 sm:before:block dark:before:bg-[rgba(148,163,184,0.18)]">
                        {sortedItems.map((item, index) => {
                            const date = getTimelineDate(item.date);
                            const accent = awardAccentStyles[index % awardAccentStyles.length];
                            const AwardIcon = accent.icon;
                            const titleSize = embedded ? "text-lg" : "text-xl";

                            return (
                                <motion.li
                                    key={`${item.title}-${item.date || index}`}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: 0.06 * index }}
                                    className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-5"
                                >
                                    <div className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0 sm:pt-4 sm:pr-4 sm:text-right">
                                        <span className="whitespace-nowrap font-serif text-base font-semibold text-primary sm:text-lg">{date.primary}</span>
                                        {date.secondary && (
                                            <span className="whitespace-nowrap text-xs font-medium text-neutral-500 dark:text-neutral-500">{date.secondary}</span>
                                        )}
                                    </div>

                                    <article className={`relative rounded-lg border border-neutral-200/80 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(15,23,42,0.09)] dark:border-[rgba(148,163,184,0.18)] dark:bg-neutral-900/60 dark:shadow-none ${accent.border}`}>
                                        <span className={`absolute left-[-1.7rem] top-6 hidden h-3.5 w-3.5 rounded-full border-2 border-background shadow-sm sm:block ${accent.dot}`} />
                                        <div className="flex gap-4">
                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${accent.badge}`}>
                                                <AwardIcon className="h-5 w-5" aria-hidden="true" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className={`${titleSize} font-semibold text-primary`}>
                                                    {item.subtitle ? (
                                                        <>
                                                            <span className="text-accent-dark dark:text-accent-light">{item.subtitle}</span>
                                                            <span className="mx-2 text-neutral-300 dark:text-neutral-600">·</span>
                                                            <span>{item.title}</span>
                                                        </>
                                                    ) : renderHighlightedTitle(item.title, item.highlight, item.compact, embedded)}
                                                </h3>
                                            </div>
                                        </div>
                                        {item.content && (
                                            <div className={`${embedded ? "text-sm" : "text-base"} mt-4 pl-14 text-neutral-600 dark:text-neutral-500 leading-relaxed`}>
                                                <ReactMarkdown components={markdownComponents}>
                                                    {item.content}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                        {item.tags && (
                                            <div className="mt-4 flex flex-wrap gap-2 pl-14">
                                                {item.tags.map(tag => (
                                                    <span key={tag} className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-500 dark:border-[rgba(148,163,184,0.18)] dark:bg-neutral-800/50 dark:text-neutral-500">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </article>
                                </motion.li>
                            );
                        })}
                    </ol>
                </section>
            )}
        </motion.div>
    );
}

const teachingSectionStyles = [
    {
        icon: Mic,
        dot: 'bg-accent',
        badge: 'bg-accent/10 text-accent-dark ring-accent/20 dark:bg-accent/15 dark:text-accent-light dark:ring-accent/25',
        border: 'hover:border-accent/45 dark:hover:border-accent/45',
    },
    {
        icon: FileText,
        dot: 'bg-teal-500',
        badge: 'bg-teal-500/10 text-teal-700 ring-teal-500/20 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/25',
        border: 'hover:border-teal-500/45 dark:hover:border-teal-400/45',
    },
    {
        icon: BookOpen,
        dot: 'bg-indigo-500',
        badge: 'bg-indigo-500/10 text-indigo-700 ring-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/25',
        border: 'hover:border-indigo-500/45 dark:hover:border-indigo-400/45',
    },
];

function TeachingCardPage({ config, embedded = false }: { config: CardPageConfig; embedded?: boolean }) {
    const sections = config.sections || [];
    const summary = config.summary || {};

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <header className={`${embedded ? "mb-6 pb-6" : "mb-10 pb-8"} border-b border-neutral-200/80 dark:border-[rgba(148,163,184,0.18)]`}>
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-accent-dark dark:text-accent-light">
                        <BookOpen className="h-4 w-4" aria-hidden="true" />
                        <span>{summary.eyebrow || 'Selected Teaching & Talks'}</span>
                    </div>
                    <h1 className={`${embedded ? "text-2xl" : "text-4xl"} mt-3 font-serif font-bold text-primary`}>{config.title}</h1>
                    {config.description && (
                        <div className={`${embedded ? "mt-3 text-base" : "mt-4 text-lg"} text-neutral-600 dark:text-neutral-500 leading-relaxed`}>
                            <ReactMarkdown components={markdownComponents}>
                                {config.description}
                            </ReactMarkdown>
                        </div>
                    )}
                    <div className="mt-5 grid h-1 w-28 grid-cols-3 overflow-hidden rounded-full">
                        <span className="bg-accent" />
                        <span className="bg-teal-500" />
                        <span className="bg-indigo-500" />
                    </div>
                </div>
            </header>

            {sections.length === 0 ? (
                <div className={`${embedded ? "p-4" : "p-6"} rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-500`}>
                    {config.empty || 'Content will be added soon.'}
                </div>
            ) : (
                <div className={embedded ? "space-y-8" : "space-y-10"}>
                    {sections.map((section, sectionIndex) => {
                        const accent = teachingSectionStyles[sectionIndex % teachingSectionStyles.length];
                        const SectionIcon = accent.icon;

                        return (
                            <section key={section.title} aria-labelledby={`teaching-section-${sectionIndex}`} className="relative">
                                <div className="mb-4 flex items-center gap-3 sm:ml-[8rem] sm:pl-5">
                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${accent.badge}`}>
                                        <SectionIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0">
                                        <h2 id={`teaching-section-${sectionIndex}`} className={`${embedded ? "text-lg" : "text-xl"} font-semibold text-primary`}>
                                            {section.title}
                                        </h2>
                                        {section.description && (
                                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">{section.description}</p>
                                        )}
                                    </div>
                                </div>

                                <ol className="relative space-y-4 before:absolute before:bottom-0 before:left-[8rem] before:top-0 before:hidden before:w-px before:bg-neutral-200 sm:before:block dark:before:bg-[rgba(148,163,184,0.18)]">
                                    {section.items.map((item, itemIndex) => {
                                        const date = getTimelineDate(item.date);
                                        const role = item.role || item.subtitle;

                                        return (
                                            <motion.li
                                                key={`${section.title}-${item.title}-${item.date || itemIndex}`}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.35, delay: 0.06 * itemIndex }}
                                                className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-5"
                                            >
                                                <div className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0 sm:pt-4 sm:pr-4 sm:text-right">
                                                    <span className="whitespace-nowrap font-serif text-base font-semibold text-primary sm:text-lg">{date.primary}</span>
                                                    {date.secondary && (
                                                        <span className="whitespace-nowrap text-xs font-medium text-neutral-500 dark:text-neutral-500">{date.secondary}</span>
                                                    )}
                                                </div>

                                                <article className={`relative rounded-lg border border-neutral-200/80 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(15,23,42,0.09)] dark:border-[rgba(148,163,184,0.18)] dark:bg-neutral-900/60 dark:shadow-none ${accent.border}`}>
                                                    <span className={`absolute left-[-1.7rem] top-6 hidden h-3.5 w-3.5 rounded-full border-2 border-background shadow-sm sm:block ${accent.dot}`} />
                                                    <div className="flex gap-4">
                                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${accent.badge}`}>
                                                            <SectionIcon className="h-5 w-5" aria-hidden="true" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-sm font-semibold leading-relaxed text-primary">
                                                                {renderOrdinalText(item.title)}
                                                            </h3>
                                                            {item.venue && (
                                                                <p className="mt-2 text-sm font-medium text-neutral-600 dark:text-neutral-500">
                                                                    {item.venue}
                                                                </p>
                                                            )}
                                                            {role && (
                                                                <p className="mt-2 text-sm font-semibold text-accent-dark dark:text-accent-light">
                                                                    {role}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {item.content && (
                                                        <div className={`${embedded ? "text-sm" : "text-base"} mt-4 pl-14 text-neutral-600 dark:text-neutral-500 leading-relaxed`}>
                                                            <ReactMarkdown components={markdownComponents}>
                                                                {item.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    )}

                                                    {item.tags && (
                                                        <div className="mt-4 flex flex-wrap gap-2 pl-14">
                                                            {item.tags.map(tag => (
                                                                <span key={tag} className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-500 dark:border-[rgba(148,163,184,0.18)] dark:bg-neutral-800/50 dark:text-neutral-500">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </article>
                                            </motion.li>
                                        );
                                    })}
                                </ol>
                            </section>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}

export default function CardPage({ config, embedded = false }: { config: CardPageConfig; embedded?: boolean }) {
    const items = config.items || [];

    if (config.variant === 'awards') {
        return <AwardsCardPage config={config} embedded={embedded} />;
    }

    if (config.variant === 'teaching') {
        return <TeachingCardPage config={config} embedded={embedded} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className={embedded ? "mb-4" : "mb-8"}>
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <div className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl leading-relaxed`}>
                        <ReactMarkdown components={markdownComponents}>
                            {config.description}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            <div className={`grid ${embedded ? "gap-4" : "gap-6"}`}>
                {items.length === 0 ? (
                    <div className={`${embedded ? "p-4" : "p-6"} rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-500`}>
                        {config.empty || 'Content will be added soon.'}
                    </div>
                ) : items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className={`bg-white dark:bg-neutral-900 ${embedded ? "p-4" : "p-6"} rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.01]`}
                    >
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start mb-2">
                            <h3 className={`${embedded ? "text-lg" : "text-xl"} font-semibold text-primary min-w-0`}>{item.title}</h3>
                            {item.date && (
                                <span className="text-sm text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded shrink-0 self-start">
                                    {item.date}
                                </span>
                            )}
                        </div>
                        {item.subtitle && (
                            <p className={`${embedded ? "text-sm" : "text-base"} text-accent font-medium mb-3`}>{item.subtitle}</p>
                        )}
                        {item.content && (
                            <div className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-500 leading-relaxed`}>
                                <ReactMarkdown components={markdownComponents}>
                                    {item.content}
                                </ReactMarkdown>
                            </div>
                        )}
                        {item.tags && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {item.tags.map(tag => (
                                    <span key={tag} className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1 rounded border border-neutral-100 dark:border-neutral-800">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
