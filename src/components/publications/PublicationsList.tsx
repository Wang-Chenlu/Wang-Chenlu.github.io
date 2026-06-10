'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
    BookOpenIcon,
    ClipboardDocumentIcon,
    DocumentTextIcon,
    PhotoIcon,
    SparklesIcon,
    UserGroupIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Publication, PublicationRole } from '@/types/publication';
import { PublicationPageConfig } from '@/types/page';
import { cn } from '@/lib/utils';
import { useMessages } from '@/lib/i18n/useMessages';
import { getResearchDirectionById, getResearchDirectionForPublication } from '@/lib/researchDirections';
import { useLocaleStore } from '@/lib/stores/localeStore';
import FormattedBibTeXText from './FormattedBibTeXText';
import PublicationAuthors from './PublicationAuthors';

interface PublicationsListProps {
    config: PublicationPageConfig;
    publications: Publication[];
    embedded?: boolean;
    directionFilterId?: string | null;
}

const PUBLICATIONS_SUMMARY_TEXT =
    'A complete list of my publications, including 8 papers as first, co-first, or corresponding author, 20 collaborative papers, 1 review article, and 1 preprint.';
const ZH_PUBLICATIONS_SUMMARY_TEXT =
    '完整论文列表，包括8篇第一作者、共同一作或通讯作者论文、20篇合作论文、1篇综述论文和1篇预印本。';

const ZH_DIRECTION_TITLES: Record<string, string> = {
    'electrolytes-energy-storage': '电解质与储能',
    'molecular-ionic-liquids': '水与离子液体',
    'interfaces-nanoconfinement': '界面与纳米限域',
};

const DIRECTION_NOTICE_TEXT_CLASSES: Record<string, string> = {
    'electrolytes-energy-storage': 'text-[#d97706] dark:text-amber-400',
    'molecular-ionic-liquids': 'text-[#16a34a] dark:text-green-400',
    'interfaces-nanoconfinement': 'text-[#7c3aed] dark:text-violet-400',
};

const ZH_PUBLICATION_TYPE_LABELS: Record<string, string> = {
    journal: '期刊论文',
    preprint: '预印本',
    conference: '会议论文',
    book: '图书',
    chapter: '章节',
    thesis: '学位论文',
};

type RoleFilter = PublicationRole | 'all';

export default function PublicationsList({
    config,
    publications,
    embedded = false,
    directionFilterId,
}: PublicationsListProps) {
    const messages = useMessages();
    const locale = useLocaleStore((state) => state.locale);
    const isChinese = locale.startsWith('zh');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [selectedType, setSelectedType] = useState<string | 'all'>('all');
    const [selectedRole, setSelectedRole] = useState<RoleFilter>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedBibtexId, setExpandedBibtexId] = useState<string | null>(null);
    const [expandedAbstractIds, setExpandedAbstractIds] = useState<Set<string>>(new Set());
    const [expandedFigureIds, setExpandedFigureIds] = useState<Set<string>>(new Set());
    const [figureIndexes, setFigureIndexes] = useState<Record<string, number>>({});
    const activeDirection = useMemo(
        () => getResearchDirectionById(directionFilterId),
        [directionFilterId]
    );
    const directionFilteredPublications = useMemo(() => {
        if (!activeDirection) {
            return publications;
        }

        const publicationIds = new Set(activeDirection.publicationIds);
        return publications.filter((publication) => publicationIds.has(publication.id));
    }, [activeDirection, publications]);
    const hasPublications = directionFilteredPublications.length > 0;

    useEffect(() => {
        setSearchQuery('');
        setSelectedYear('all');
        setSelectedType('all');
        setSelectedRole('all');
    }, [activeDirection?.id]);

    // Extract unique years and types for filters
    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(directionFilteredPublications.map(p => p.year)));
        return uniqueYears.sort((a, b) => b - a);
    }, [directionFilteredPublications]);

    const types = useMemo(() => {
        const uniqueTypes = Array.from(new Set(directionFilteredPublications.map(p => p.type)));
        return uniqueTypes.sort();
    }, [directionFilteredPublications]);

    // Filter publications
    const filteredPublications = useMemo(() => {
        return directionFilteredPublications.filter(pub => {
            const matchesSearch =
                pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.authors.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                pub.journal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.conference?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesYear = selectedYear === 'all' || pub.year === selectedYear;
            const matchesType = selectedType === 'all' || pub.type === selectedType;
            const matchesRole = selectedRole === 'all' || pub.role === selectedRole;

            return matchesSearch && matchesYear && matchesType && matchesRole;
        });
    }, [directionFilteredPublications, searchQuery, selectedYear, selectedType, selectedRole]);

    const toggleRoleFilter = (role: PublicationRole) => {
        setSelectedRole((currentRole) => currentRole === role ? 'all' : role);
    };

    const toggleAbstract = (publicationId: string) => {
        setExpandedAbstractIds((current) => {
            const next = new Set(current);
            if (next.has(publicationId)) {
                next.delete(publicationId);
            } else {
                next.add(publicationId);
            }
            return next;
        });
    };

    const toggleFigure = (publicationId: string) => {
        setExpandedFigureIds((current) => {
            const next = new Set(current);
            if (next.has(publicationId)) {
                next.delete(publicationId);
            } else {
                next.add(publicationId);
            }
            return next;
        });
        setFigureIndexes((current) => (
            current[publicationId] === undefined ? { ...current, [publicationId]: 0 } : current
        ));
    };

    const shiftFigure = (publicationId: string, figureCount: number, direction: -1 | 1) => {
        if (figureCount <= 1) {
            return;
        }

        setFigureIndexes((current) => {
            const currentIndex = current[publicationId] || 0;
            const nextIndex = (currentIndex + direction + figureCount) % figureCount;
            return { ...current, [publicationId]: nextIndex };
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="mb-8">
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <div className={`${embedded ? "text-base" : "text-lg"} leading-relaxed text-neutral-600 dark:text-neutral-500 max-w-3xl`}>
                        {activeDirection ? (
                            <DirectionFilterNotice
                                directionId={activeDirection.id}
                                title={activeDirection.title}
                                count={directionFilteredPublications.length}
                                accentClassName={activeDirection.accent.link}
                                isChinese={isChinese}
                            />
                        ) : (config.description === PUBLICATIONS_SUMMARY_TEXT || config.description === ZH_PUBLICATIONS_SUMMARY_TEXT) ? (
                            <PublicationsSummary
                                selectedRole={selectedRole}
                                onRoleClick={toggleRoleFilter}
                                isChinese={isChinese}
                            />
                        ) : (
                            config.description
                        )}
                    </div>
                )}
            </div>

            {/* Search and Filter Controls */}
            {hasPublications && (
            <div className="mb-8 space-y-4">
                {/* ... (keep existing controls) ... */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder={messages.publications.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center justify-center px-4 py-2 rounded-lg border transition-all duration-200",
                            showFilters
                                ? "bg-accent text-white border-accent"
                                : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-accent hover:text-accent"
                        )}
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        {messages.publications.filters}
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-6">
                                {/* Year Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-1" /> {messages.publications.year}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedYear('all')}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-full transition-colors",
                                                selectedYear === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {years.map(year => (
                                            <button
                                                key={year}
                                                onClick={() => setSelectedYear(year)}
                                                className={cn(
                                                    "px-3 py-1 text-xs rounded-full transition-colors",
                                                    selectedYear === year
                                                        ? "bg-accent text-white"
                                                        : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <BookOpenIcon className="h-4 w-4 mr-1" /> {messages.publications.type}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedType('all')}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-full transition-colors",
                                                selectedType === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {types.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedType(type)}
                                                className={cn(
                                                    "px-3 py-1 text-xs rounded-full capitalize transition-colors",
                                                    selectedType === type
                                                        ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {formatPublicationTypeLabel(type, isChinese)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            )}

            {/* Publications Grid */}
            <div className="space-y-6">
                {!hasPublications ? (
                    <div className="text-center py-12 text-neutral-500">
                        {messages.publications.empty}
                    </div>
                ) : filteredPublications.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                        {messages.publications.noResults}
                    </div>
                ) : (
                    filteredPublications.map((pub, index) => {
                        const direction = getResearchDirectionForPublication(pub.id);
                        const DirectionIcon = direction?.icon;
                        const figures = getPublicationFigures(pub);
                        const figureIndex = figures.length > 0
                            ? Math.min(figureIndexes[pub.id] || 0, figures.length - 1)
                            : 0;

                        return (
                        <motion.div
                            key={pub.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                            className={cn(
                                "font-en-body relative overflow-hidden rounded-xl border bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.055)] transition-all duration-200 dark:bg-neutral-900 dark:shadow-[0_14px_34px_rgba(2,6,23,0.32)] dark:ring-1 dark:ring-slate-700/50",
                                direction
                                    ? `border-neutral-200 border-l-4 dark:border-slate-600/70 ${direction.accent.border} ${direction.accent.hover} ${direction.accent.glow}`
                                    : "border-neutral-200 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] dark:border-slate-600/70 dark:hover:border-slate-500"
                            )}
                        >
                            <div className="mb-2 flex items-start gap-3">
                                <h3 className={`${embedded ? "text-lg" : "text-xl"} min-w-0 flex-1 font-semibold text-primary leading-tight`}>
                                    <FormattedBibTeXText nodes={pub.titleNodes} fallback={pub.title} />
                                </h3>
                                {direction && DirectionIcon && (
                                    <span
                                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${direction.accent.icon}`}
                                        title={direction.title}
                                    >
                                        <DirectionIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                    </span>
                                )}
                            </div>
                            <PublicationAuthors
                                authors={pub.authors}
                                className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-400 mb-2`}
                            />
                            <p className="text-sm text-neutral-800 dark:text-neutral-600 mb-3">
                                <PublicationVenue pub={pub} />
                            </p>

                            {pub.description && (
                                <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-4 line-clamp-3">
                                    {pub.description}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {pub.doi && (
                                    <a
                                        href={getDoiHref(pub.doi)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                    >
                                        DOI
                                    </a>
                                )}
                                {pub.html && (
                                    <PublicationLink href={pub.html} label="HTML" />
                                )}
                                {pub.url && (
                                    <PublicationLink href={pub.url} label="URL" />
                                )}
                                {pub.pdfUrl && (
                                    <PublicationLink href={pub.pdfUrl} label="PDF" />
                                )}
                                {pub.code && (
                                    <a
                                        href={pub.code}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                    >
                                        {messages.publications.code}
                                    </a>
                                )}
                                {pub.slides && (
                                    <PublicationLink href={pub.slides} label="Slides" />
                                )}
                                {pub.video && (
                                    <PublicationLink href={pub.video} label="Video" />
                                )}
                                {pub.arxivId && (
                                    <PublicationLink href={getArxivHref(pub.arxivId)} label="arXiv" />
                                )}
                                {pub.abstract && (
                                    <button
                                        onClick={() => toggleAbstract(pub.id)}
                                        className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                            expandedAbstractIds.has(pub.id)
                                                ? "bg-accent text-white"
                                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white"
                                        )}
                                    >
                                        <DocumentTextIcon className="h-3 w-3 mr-1.5" />
                                        {expandedAbstractIds.has(pub.id) ? 'Hide Abstract' : 'Show Abstract'}
                                    </button>
                                )}
                                {figures.length > 0 && (
                                    <button
                                        onClick={() => toggleFigure(pub.id)}
                                        className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                            expandedFigureIds.has(pub.id)
                                                ? "bg-accent text-white"
                                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white"
                                        )}
                                    >
                                        <PhotoIcon className="h-3 w-3 mr-1.5" />
                                        {expandedFigureIds.has(pub.id) ? 'Hide Figures' : 'Show Figures'}
                                    </button>
                                )}
                                {pub.bibtex && (
                                    <button
                                        onClick={() => setExpandedBibtexId(expandedBibtexId === pub.id ? null : pub.id)}
                                        className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                            expandedBibtexId === pub.id
                                                ? "bg-accent text-white"
                                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white"
                                        )}
                                    >
                                        <BookOpenIcon className="h-3 w-3 mr-1.5" />
                                        {messages.publications.bibtex}
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {expandedAbstractIds.has(pub.id) && pub.abstract ? (
                                    <motion.div
                                        key="abstract"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden mt-4"
                                    >
                                        <p className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-400">
                                            {pub.abstract}
                                        </p>
                                    </motion.div>
                                ) : null}
                                {expandedBibtexId === pub.id && pub.bibtex ? (
                                    <motion.div
                                        key="bibtex"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden mt-4"
                                    >
                                        <div className="relative bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                                            <pre className="text-xs text-neutral-600 dark:text-neutral-500 overflow-x-auto whitespace-pre-wrap font-mono">
                                                {pub.bibtex}
                                            </pre>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(pub.bibtex || '');
                                                    // Optional: Show copied feedback
                                                }}
                                                className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-neutral-700 text-neutral-500 hover:text-accent shadow-sm border border-neutral-200 dark:border-neutral-600 transition-colors"
                                                title={messages.common.copyToClipboard}
                                            >
                                                <ClipboardDocumentIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : null}
                                {expandedFigureIds.has(pub.id) && figures.length > 0 ? (
                                    <motion.div
                                        key="figure"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden mt-5"
                                    >
                                        <PublicationFigureCarousel
                                            publication={pub}
                                            figures={figures}
                                            currentIndex={figureIndex}
                                            onPrevious={() => shiftFigure(pub.id, figures.length, -1)}
                                            onNext={() => shiftFigure(pub.id, figures.length, 1)}
                                        />
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}

function DirectionFilterNotice({
    directionId,
    title,
    count,
    accentClassName,
    isChinese,
}: {
    directionId: string;
    title: string;
    count: number;
    accentClassName: string;
    isChinese: boolean;
}) {
    const localizedTitle = isChinese ? (ZH_DIRECTION_TITLES[directionId] || title) : title;
    const noticeClassName = DIRECTION_NOTICE_TEXT_CLASSES[directionId] || accentClassName;

    return (
        <div className="space-y-2">
            {isChinese ? (
                <p className={noticeClassName}>
                    <span className="font-semibold">{localizedTitle}</span>：
                    <span className="font-semibold">{count}</span> 篇。
                </p>
            ) : (
                <p className={noticeClassName}>
                    Showing <span className="font-semibold">{count}</span> related publications for{' '}
                    <span className="font-semibold">{localizedTitle}</span>.
                </p>
            )}
            <Link
                href="/publications/"
                className="inline-flex text-sm font-semibold text-accent transition-colors hover:text-accent-dark hover:underline dark:hover:text-accent-light"
            >
                {isChinese ? '查阅所有论文' : 'View All Publications'} &rarr;
            </Link>
        </div>
    );
}

function PublicationsSummary({
    selectedRole,
    onRoleClick,
    isChinese,
}: {
    selectedRole: RoleFilter;
    onRoleClick: (role: PublicationRole) => void;
    isChinese: boolean;
}) {
    return (
        <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
                <RoleSummaryButton
                    role="lead"
                    count="8"
                    label={isChinese ? '篇第一作者、共同一作或通讯作者论文' : 'papers as first, co-first, or corresponding author'}
                    icon={SparklesIcon}
                    selectedRole={selectedRole}
                    onRoleClick={onRoleClick}
                />
                <RoleSummaryButton
                    role="collaborative"
                    count="20"
                    label={isChinese ? '篇合作论文' : 'collaborative papers'}
                    icon={UserGroupIcon}
                    selectedRole={selectedRole}
                    onRoleClick={onRoleClick}
                />
                <RoleSummaryButton
                    role="review"
                    count="1"
                    label={isChinese ? '篇综述论文' : 'review article'}
                    icon={BookOpenIcon}
                    selectedRole={selectedRole}
                    onRoleClick={onRoleClick}
                />
                <RoleSummaryButton
                    role="preprint"
                    count="1"
                    label={isChinese ? '篇预印本' : 'preprint'}
                    icon={DocumentTextIcon}
                    selectedRole={selectedRole}
                    onRoleClick={onRoleClick}
                />
            </div>
        </div>
    );
}

function formatPublicationTypeLabel(type: string, isChinese: boolean): string {
    if (isChinese) {
        return ZH_PUBLICATION_TYPE_LABELS[type] || type.replace('-', ' ');
    }

    return type.replace('-', ' ');
}

function RoleSummaryButton({
    role,
    count,
    label,
    icon: Icon,
    selectedRole,
    onRoleClick,
}: {
    role: PublicationRole;
    count: string;
    label: string;
    icon: typeof SparklesIcon;
    selectedRole: RoleFilter;
    onRoleClick: (role: PublicationRole) => void;
}) {
    const isActive = selectedRole === role;

    return (
        <button
            type="button"
            aria-pressed={isActive}
            onClick={() => onRoleClick(role)}
            className={cn(
                "flex min-h-12 items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm leading-snug transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                isActive
                    ? "border-accent/40 bg-accent/10 text-accent dark:border-accent/50 dark:bg-accent/15 dark:text-accent-light"
                    : "border-neutral-200 bg-neutral-50/70 text-neutral-700 hover:border-accent/40 hover:text-accent dark:border-slate-600/70 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-accent/50 dark:hover:text-accent-light"
            )}
        >
            <span
                className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-white",
                    isActive
                        ? "border-accent/30 dark:border-accent/45 dark:bg-accent/10"
                        : "border-neutral-200 dark:border-slate-600/70 dark:bg-slate-800/80"
                )}
                aria-hidden="true"
            >
                <Icon className="h-4 w-4" />
            </span>
            <span>
                <span className="font-semibold">{count}</span>{' '}
                <span>{label}</span>
            </span>
        </button>
    );
}

function PublicationFigureCarousel({
    publication,
    figures,
    currentIndex,
    onPrevious,
    onNext,
}: {
    publication: Publication;
    figures: string[];
    currentIndex: number;
    onPrevious: () => void;
    onNext: () => void;
}) {
    const figure = figures[currentIndex];
    const hasMultipleFigures = figures.length > 1;
    const touchStartX = useRef<number | null>(null);

    const handleTouchEnd = (clientX: number) => {
        if (touchStartX.current === null || !hasMultipleFigures) {
            touchStartX.current = null;
            return;
        }

        const swipeDistance = clientX - touchStartX.current;
        if (Math.abs(swipeDistance) > 40) {
            if (swipeDistance > 0) {
                onPrevious();
            } else {
                onNext();
            }
        }
        touchStartX.current = null;
    };

    if (!figure) {
        return null;
    }

    return (
        <div
            className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-950"
            onKeyDown={(event) => {
                if (event.key === 'ArrowLeft') {
                    onPrevious();
                }
                if (event.key === 'ArrowRight') {
                    onNext();
                }
            }}
            onTouchStart={(event) => {
                touchStartX.current = event.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
                handleTouchEnd(event.changedTouches[0]?.clientX ?? 0);
            }}
            tabIndex={0}
        >
            <div className="relative overflow-hidden rounded-md bg-neutral-50 dark:bg-neutral-900">
                <a
                    href={figure}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                >
                    <FigurePreview
                        figure={figure}
                        alt={`${publication.title} figure ${currentIndex + 1}`}
                    />
                </a>

                {hasMultipleFigures && (
                    <>
                        <button
                            type="button"
                            onClick={onPrevious}
                            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-700 shadow-sm transition-colors hover:border-accent hover:text-accent dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-300"
                            title="Previous figure"
                            aria-label="Previous figure"
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={onNext}
                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-700 shadow-sm transition-colors hover:border-accent hover:text-accent dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-300"
                            title="Next figure"
                            aria-label="Next figure"
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </>
                )}
            </div>

            <div className="mt-3 flex items-center justify-center text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {currentIndex + 1}/{figures.length}
            </div>
        </div>
    );
}

function FigurePreview({ figure, alt }: { figure: string; alt: string }) {
    if (isPdfFigure(figure)) {
        return (
            <iframe
                key={figure}
                src={figure}
                title={alt}
                className="h-[min(70vh,720px)] min-h-[360px] w-full bg-white dark:bg-neutral-950"
            />
        );
    }

    return (
        <Image
            src={figure}
            alt={alt}
            width={1600}
            height={1019}
            className="mx-auto h-auto max-h-[720px] w-full object-contain"
            sizes="(max-width: 768px) 100vw, 960px"
        />
    );
}

function getPublicationFigures(publication: Publication): string[] {
    if (publication.figures && publication.figures.length > 0) {
        return publication.figures;
    }

    return publication.preview ? [publication.preview] : [];
}

function isPdfFigure(figure: string): boolean {
    return /\.pdf(?:$|[?#])/i.test(figure);
}

function PublicationVenue({ pub }: { pub: Publication }) {
    const venue = pub.journal || pub.conference;
    const volumeIssue = pub.volume
        ? `${formatPublicationDetail(pub.volume)}${pub.issue ? `(${formatPublicationDetail(pub.issue)})` : ''}`
        : '';
    const pages = formatPublicationDetail(pub.pages);

    if (!venue) {
        return <>{pub.year}</>;
    }

    return (
        <>
            <span className="font-semibold italic">{venue}</span>
            {volumeIssue ? ` ${volumeIssue}` : ''}
            {pages ? `, ${pages}` : ''}
            {` (${pub.year}).`}
        </>
    );
}

function formatPublicationDetail(value?: string): string {
    return (value || '').replace(/---/g, '\u2014').replace(/--/g, '\u2013').trim();
}

function getDoiHref(doi: string): string {
    const cleanDoi = doi.trim().replace(/^doi:\s*/i, '');
    return /^https?:\/\//i.test(cleanDoi) ? cleanDoi : `https://doi.org/${cleanDoi}`;
}

function getArxivHref(arxivId: string): string {
    const cleanArxivId = arxivId.trim().replace(/^arxiv:\s*/i, '');
    return /^https?:\/\//i.test(cleanArxivId) ? cleanArxivId : `https://arxiv.org/abs/${cleanArxivId}`;
}

function PublicationLink({ href, label }: { href: string; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
        >
            {label}
        </a>
    );
}
