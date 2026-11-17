'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Publication } from '@/types/publication';
import { useMessages } from '@/lib/i18n/useMessages';
import FormattedBibTeXText from '@/components/publications/FormattedBibTeXText';
import PublicationAuthors from '@/components/publications/PublicationAuthors';
import PublicationResearchTags from '@/components/publications/PublicationResearchTags';
import { useLocaleStore } from '@/lib/stores/localeStore';

interface SelectedPublicationsProps {
    publications: Publication[];
    title?: string;
}

export default function SelectedPublications({ publications, title }: SelectedPublicationsProps) {
    const messages = useMessages();
    const isChinese = useLocaleStore((state) => state.locale).startsWith('zh');
    const resolvedTitle = title || messages.home.selectedPublications;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-baseline gap-3">
                    <h2 className="text-2xl font-serif font-bold text-primary">{resolvedTitle}</h2>
                    <span className="shrink-0 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {formatSelectedPaperCount(publications.length, isChinese)}
                    </span>
                </div>
                <Link
                    href="/publications/"
                    prefetch={true}
                    className="text-accent hover:text-accent-dark text-sm font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                >
                    {messages.home.viewAll} &rarr;
                </Link>
            </div>
            <div className="overflow-hidden rounded-lg border border-neutral-200/80 bg-white/70 shadow-sm dark:border-[rgba(148,163,184,0.22)] dark:bg-neutral-900/40">
                {publications.length === 0 ? (
                    <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-[rgba(148,163,184,0.24)] text-sm text-neutral-500 dark:text-neutral-500">
                        {messages.publications.empty}
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-200/80 dark:divide-[rgba(148,163,184,0.18)]">
                        {publications.map((publication, index) => (
                            <SelectedPublicationCard
                                key={publication.id}
                                publication={publication}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.section>
    );
}

function SelectedPublicationCard({ publication, index }: { publication: Publication; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * index }}
            className="px-5 py-4 transition-colors duration-200 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 sm:px-6"
        >
            <h4 className="mb-2 break-words text-[0.95rem] font-semibold leading-tight text-primary sm:text-base">
                <FormattedBibTeXText nodes={publication.titleNodes} fallback={publication.title} />
            </h4>
            <PublicationAuthors
                authors={publication.authors}
                className="mb-1 break-words text-sm leading-relaxed text-neutral-600 dark:text-neutral-500"
            />
            <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-2">
                <PublicationVenue publication={publication} />
            </p>
            <PublicationResearchTags
                publicationId={publication.id}
                linked
                className="mb-2"
            />
            {publication.description && (
                <p className="text-sm text-neutral-500 dark:text-neutral-500 line-clamp-2">
                    {publication.description}
                </p>
            )}
        </motion.div>
    );
}

function formatSelectedPaperCount(count: number, isChinese: boolean): string {
    if (isChinese) {
        return `${count} 篇精选论文`;
    }

    return count === 1 ? '1 selected paper' : `${count} selected papers`;
}

function PublicationVenue({ publication }: { publication: Publication }) {
    const pub = publication;
    const venue = pub.journal || pub.conference;
    if (!venue) {
        return <>{pub.year}</>;
    }

    return (
        <>
            <span className="font-semibold italic">{venue}</span>
            {`, ${pub.year}`}
        </>
    );
}
