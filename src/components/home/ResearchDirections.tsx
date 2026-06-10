'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { RESEARCH_DIRECTIONS, ResearchDirection } from '@/lib/researchDirections';
import { useLocaleStore } from '@/lib/stores/localeStore';

interface ResearchDirectionsProps {
  title?: string;
}

const ZH_DIRECTION_CONTENT: Record<string, { titleLines: string[]; keywords: string[] }> = {
  'electrolytes-energy-storage': {
    titleLines: ['电解质与储能'],
    keywords: ['离子输运', '溶剂化结构', '极化力场'],
  },
  'molecular-ionic-liquids': {
    titleLines: ['水与离子液体'],
    keywords: ['体相结构', '相互作用', '气体溶解'],
  },
  'interfaces-nanoconfinement': {
    titleLines: ['界面与纳米限域'],
    keywords: ['润湿行为', '膜分离', '功能材料'],
  },
};

export default function ResearchDirections({ title = 'Research Directions' }: ResearchDirectionsProps) {
  const locale = useLocaleStore((state) => state.locale);
  const isChinese = locale.startsWith('zh');
  const subtitle = locale.startsWith('zh')
    ? '复杂流体与界面体系的分子模拟'
    : 'Molecular Simulations of Fluids and Interfaces';

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-1.5 md:flex-row md:items-baseline md:gap-2.5">
        <h2 className="shrink-0 text-2xl font-serif font-bold leading-tight text-primary">
          {title}
        </h2>
        <span
          className="hidden text-base font-medium text-accent/55 md:inline"
          aria-hidden="true"
        >
          &middot;
        </span>
        <p className="text-sm font-normal leading-snug text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RESEARCH_DIRECTIONS.map((direction, index) => (
          <ResearchDirectionCard
            key={direction.title}
            direction={direction}
            index={index}
            isChinese={isChinese}
          />
        ))}
      </div>
    </motion.section>
  );
}

function ResearchDirectionCard({
  direction,
  index,
  isChinese,
}: {
  direction: ResearchDirection;
  index: number;
  isChinese: boolean;
}) {
  const Icon = direction.icon;
  const localizedContent = isChinese ? ZH_DIRECTION_CONTENT[direction.id] : undefined;
  const titleLines = localizedContent?.titleLines ?? direction.titleLines;
  const keywords = localizedContent?.keywords ?? direction.keywords;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 * index }}
      className={`relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-neutral-200/70 bg-white/80 p-4 shadow-[0_4px_16px_rgba(15,23,42,0.035)] transition-colors dark:border-[rgba(148,163,184,0.16)] dark:bg-neutral-900/40 dark:shadow-none ${direction.accent.hover}`}
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 ${direction.accent.line}`} aria-hidden="true" />
      <div className="mb-3 flex items-start justify-between gap-2.5 pt-0.5">
        <div className="min-w-0">
          <h3 className="text-[0.92rem] font-semibold leading-tight text-primary">
            {titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h3>
        </div>
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${direction.accent.icon}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </div>

      {direction.description && (
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-500">
          {direction.description}
        </p>
      )}

      <div className={isChinese ? 'flex flex-wrap items-start gap-1.5' : 'flex flex-col items-start gap-1'}>
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className={`whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[0.64rem] font-medium leading-4 ${direction.accent.chip}`}
          >
            {keyword}
          </span>
        ))}
      </div>

      <div className="mt-3 flex-1 border-t border-neutral-200/65 pt-3 dark:border-neutral-800/80">
        <h4 className="mb-1.5 text-[0.6rem] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {isChinese ? '代表性论文' : 'Representative Publications'}
        </h4>
        <ul className="space-y-1">
          {direction.papers.map((paper) => (
            <li key={`${paper.authors}-${paper.venue}`} className="text-[0.74rem] leading-[1.42] text-neutral-600 dark:text-neutral-300">
              <PublicationAuthorsLine
                authors={paper.authors}
                wangCorresponding={paper.wangCorresponding}
                wangCoFirst={paper.wangCoFirst}
                coFirstAuthors={paper.coFirstAuthors}
              />{' '}
              <span className="font-bold italic text-neutral-800 dark:text-[#f8fafc]">{paper.venue}</span>
              <span>, {paper.year}.</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={`/publications/?direction=${encodeURIComponent(direction.id)}`}
        prefetch={true}
        className={`mt-auto inline-flex w-fit items-center rounded-md pt-3 text-[0.76rem] font-semibold transition-colors hover:underline ${direction.accent.link}`}
      >
        {isChinese ? '查阅相关论文' : 'View Related Publications'} ({direction.publicationCount}) &rarr;
      </Link>
    </motion.article>
  );
}

function PublicationAuthorsLine({
  authors,
  wangCorresponding,
  wangCoFirst,
  coFirstAuthors,
}: {
  authors: string;
  wangCorresponding: boolean;
  wangCoFirst: boolean;
  coFirstAuthors?: string[];
}) {
  const coFirstNames = coFirstAuthors ?? (wangCoFirst ? ['Di A', 'Wang C'] : []);
  const highlightedNames = Array.from(new Set(['Wang C', ...coFirstNames]));
  const escapedNames = highlightedNames.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = authors.split(new RegExp(`(${escapedNames.join('|')})`, 'g'));

  if (!parts.some((part) => highlightedNames.includes(part))) {
    return <span>{authors}</span>;
  }

  return (
    <span>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`}>
          {highlightedNames.includes(part) ? (
            <span className={part === 'Wang C' ? 'font-semibold text-[#9a6a24] dark:text-[#e4b976]' : undefined}>
              {part}
              {part === 'Wang C' && wangCorresponding && (
                <span
                  className="ml-0.5 inline-block align-[-0.12em]"
                  title="Corresponding author"
                  aria-label="Corresponding author"
                  role="img"
                >
                  <EnvelopeIcon className="h-3 w-3" aria-hidden="true" />
                </span>
              )}
              {coFirstNames.includes(part) && (
                <sup
                  className="ml-0.5 text-[0.72em] font-semibold"
                  title="Co-first author"
                  aria-label="Co-first author"
                >
                  &#8224;
                </sup>
              )}
            </span>
          ) : (
            part
          )}
        </span>
      ))}
    </span>
  );
}
