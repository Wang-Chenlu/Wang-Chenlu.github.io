'use client';

import Link from 'next/link';
import {
  getResearchDirectionsForPublication,
  getResearchTagsForPublication,
} from '@/lib/researchDirections';
import { useLocaleStore } from '@/lib/stores/localeStore';
import { cn } from '@/lib/utils';

const ZH_DIRECTION_TITLES: Record<string, string> = {
  'molecular-ionic-liquids': '气体分离与吸附',
  'electrolytes-energy-storage': '电解质与离子输运',
  'interfaces-nanoconfinement': '界面与纳米限域传质',
};

interface PublicationResearchTagsProps {
  publicationId: string;
  linked?: boolean;
  className?: string;
}

export default function PublicationResearchTags({
  publicationId,
  linked = false,
  className,
}: PublicationResearchTagsProps) {
  const isChinese = useLocaleStore((state) => state.locale).startsWith('zh');
  const directions = getResearchDirectionsForPublication(publicationId);
  const researchTags = getResearchTagsForPublication(publicationId);

  if (directions.length === 0 && researchTags.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {directions.map((direction) => {
        const label = isChinese ? (ZH_DIRECTION_TITLES[direction.id] || direction.title) : direction.title;
        const chipClassName = cn(
          'inline-flex items-center rounded-md border px-2 py-0.5 text-[0.67rem] font-medium leading-4',
          direction.accent.chip,
          linked && 'transition-colors hover:underline'
        );

        return linked ? (
          <Link
            key={direction.id}
            href={`/publications/?direction=${encodeURIComponent(direction.id)}`}
            className={chipClassName}
          >
            {label}
          </Link>
        ) : (
          <span key={direction.id} className={chipClassName}>
            {label}
          </span>
        );
      })}

      {researchTags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[0.67rem] font-medium leading-4 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-300"
        >
          {isChinese ? tag.labelZh : tag.label}
        </span>
      ))}
    </div>
  );
}
