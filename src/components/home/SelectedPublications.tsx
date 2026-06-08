'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Publication } from '@/types/publication';
import { useMessages } from '@/lib/i18n/useMessages';
import FormattedBibTeXText from '@/components/publications/FormattedBibTeXText';
import PublicationAuthors from '@/components/publications/PublicationAuthors';

const SELECTED_PUBLICATION_GROUPS = [
    'Electrolytes & Polarizable Force Fields',
    'Ionic Liquids: Bulk & Interfacial Behaviors',
    'Functional Materials: GO, MXene & MOFs',
] as const;

const OTHER_SELECTED_GROUP = 'Other Selected Publications';

interface SelectedPublicationsProps {
    publications: Publication[];
    title?: string;
}

export default function SelectedPublications({ publications, title }: SelectedPublicationsProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.selectedPublications;
    const groupedPublications = groupSelectedPublications(publications);

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif font-bold text-primary">{resolvedTitle}</h2>
                <Link
                    href="/publications/"
                    prefetch={true}
                    className="text-accent hover:text-accent-dark text-sm font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                >
                    {messages.home.viewAll} &rarr;
                </Link>
            </div>
            <div className="space-y-5">
                {publications.length === 0 ? (
                    <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-[rgba(148,163,184,0.24)] text-sm text-neutral-500 dark:text-neutral-500">
                        {messages.publications.empty}
                    </div>
                ) : groupedPublications.map(({ group, publications: groupPublications }, groupIndex) => (
                    <SelectedPublicationGroup
                        key={group}
                        group={group}
                        publications={groupPublications}
                        groupIndex={groupIndex}
                    />
                ))}
            </div>
        </motion.section>
    );
}

function groupSelectedPublications(publications: Publication[]): Array<{ group: string; publications: Publication[] }> {
    const grouped = new Map<string, Publication[]>();

    publications.forEach((publication) => {
        const group = publication.group?.trim() || OTHER_SELECTED_GROUP;
        const groupPublications = grouped.get(group) || [];
        groupPublications.push(publication);
        grouped.set(group, groupPublications);
    });

    const orderedGroups: Array<{ group: string; publications: Publication[] }> = SELECTED_PUBLICATION_GROUPS
        .map((group) => ({ group, publications: grouped.get(group) || [] }))
        .filter(({ publications }) => publications.length > 0);

    const otherPublications = grouped.get(OTHER_SELECTED_GROUP) || [];
    if (otherPublications.length > 0) {
        orderedGroups.push({
            group: OTHER_SELECTED_GROUP,
            publications: otherPublications,
        });
    }

    return orderedGroups;
}

function SelectedPublicationGroup({
    group,
    publications,
    groupIndex,
}: {
    group: string;
    publications: Publication[];
    groupIndex: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 * groupIndex }}
            className="relative overflow-hidden rounded-lg border border-neutral-200/80 bg-white/70 shadow-sm dark:border-[rgba(148,163,184,0.22)] dark:bg-neutral-900/40"
        >
            <div className="absolute inset-y-0 left-0 w-1 bg-accent/70" aria-hidden="true" />
            <div className="border-b border-neutral-200/80 bg-neutral-50/80 px-5 py-4 pl-6 dark:border-[rgba(148,163,184,0.18)] dark:bg-neutral-800/25 sm:px-6">
                <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <h3 className="min-w-0 break-words text-base font-semibold leading-snug text-primary">
                        {group}
                    </h3>
                    <span className="shrink-0 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {formatSelectedPaperCount(publications.length)}
                    </span>
                </div>
            </div>
            <div className="divide-y divide-neutral-200/80 dark:divide-[rgba(148,163,184,0.18)]">
                {publications.map((pub, index) => (
                    <SelectedPublicationCard
                        key={pub.id}
                        publication={pub}
                        index={groupIndex * 4 + index}
                    />
                ))}
            </div>
        </motion.div>
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
            {publication.description && (
                <p className="text-sm text-neutral-500 dark:text-neutral-500 line-clamp-2">
                    {publication.description}
                </p>
            )}
        </motion.div>
    );
}

function formatSelectedPaperCount(count: number): string {
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
