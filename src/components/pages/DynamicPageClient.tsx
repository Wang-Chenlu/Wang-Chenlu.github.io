'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PublicationsList from '@/components/publications/PublicationsList';
import TextPage from '@/components/pages/TextPage';
import CardPage from '@/components/pages/CardPage';
import { Publication } from '@/types/publication';
import {
  PublicationPageConfig,
  TextPageConfig,
  CardPageConfig,
} from '@/types/page';
import { useLocaleStore } from '@/lib/stores/localeStore';

export type DynamicPageLocaleData =
  | { type: 'publication'; config: PublicationPageConfig; publications: Publication[] }
  | { type: 'text'; config: TextPageConfig; content: string }
  | { type: 'card'; config: CardPageConfig };

interface DynamicPageClientProps {
  dataByLocale: Record<string, DynamicPageLocaleData>;
  defaultLocale: string;
}

export default function DynamicPageClient({ dataByLocale, defaultLocale }: DynamicPageClientProps) {
  const locale = useLocaleStore((state) => state.locale);
  const fallback = dataByLocale[defaultLocale] || Object.values(dataByLocale)[0];
  const pageData = dataByLocale[locale] || fallback;

  if (!pageData) {
    return null;
  }

  return (
    <div key={locale} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {pageData.type === 'publication' && (
        <Suspense fallback={<PublicationsList config={pageData.config} publications={pageData.publications} />}>
          <PublicationPageWithQuery
            key={locale}
            config={pageData.config}
            publications={pageData.publications}
          />
        </Suspense>
      )}
      {pageData.type === 'text' && (
        <TextPage key={locale} config={pageData.config} content={pageData.content} />
      )}
      {pageData.type === 'card' && (
        <CardPage key={locale} config={pageData.config} />
      )}
    </div>
  );
}

function PublicationPageWithQuery({
  config,
  publications,
}: {
  config: PublicationPageConfig;
  publications: Publication[];
}) {
  const searchParams = useSearchParams();

  return (
    <PublicationsList
      config={config}
      publications={publications}
      directionFilterId={searchParams.get('direction')}
    />
  );
}
