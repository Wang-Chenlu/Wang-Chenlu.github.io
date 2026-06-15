import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { LocaleProvider } from '@/components/ui/LocaleProvider';
import { StatcounterNoscript, StatcounterScripts } from '@/components/analytics/StatcounterAnalytics';
import { getConfig } from '@/lib/config';
import { getRuntimeI18nConfig } from '@/lib/i18n/config';
import type { SiteConfig } from '@/lib/config';

const OFFICIAL_SITE_URL = 'https://wang-chenlu.github.io';

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();
  const runtimeI18n = getRuntimeI18nConfig(config.i18n);
  const openGraphLocale = runtimeI18n.defaultLocale === 'zh' ? 'zh_CN' : 'en_US';

  return {
    metadataBase: new URL(OFFICIAL_SITE_URL),
    title: {
      default: config.site.title,
      template: `%s | ${config.site.title}`,
    },
    description: config.site.description,
    keywords: [config.author.name, 'PhD', 'Research', config.author.institution],
    authors: [{ name: config.author.name }],
    creator: config.author.name,
    publisher: config.author.name,
    alternates: {
      canonical: '/',
    },
    icons: {
      icon: config.site.favicon,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: openGraphLocale,
      title: config.site.title,
      description: config.site.description,
      siteName: `${config.author.name}'s Academic Website`,
      url: '/',
    },
  };
}

function buildLocaleBootstrapScript(config: ReturnType<typeof getRuntimeI18nConfig>): string {
  const serializedConfig = JSON.stringify(config).replace(/</g, '\\u003c');

  return `
    try {
      const cfg = ${serializedConfig};
      const storageKey = 'locale-storage';
      const normalize = (value) => typeof value === 'string' ? value.trim().replace('_', '-').toLowerCase() : '';
      const matchLocale = (candidate) => {
        const normalized = normalize(candidate);
        if (!normalized) return null;
        if (cfg.locales.includes(normalized)) return normalized;
        const language = normalized.split('-')[0];
        if (cfg.locales.includes(language)) return language;
        return null;
      };

      let resolved = null;

      if (!cfg.enabled) {
        resolved = cfg.defaultLocale;
      } else if (cfg.persist) {
        resolved = matchLocale(localStorage.getItem(storageKey));
      }

      if (!resolved) {
        if (cfg.mode === 'fixed') {
          resolved = cfg.fixedLocale;
        } else {
          resolved = matchLocale(navigator.language);
        }
      }

      if (!resolved) {
        resolved = cfg.defaultLocale;
      }

      const root = document.documentElement;
      root.lang = resolved;
      root.setAttribute('data-locale', resolved);

      if (cfg.persist) {
        localStorage.setItem(storageKey, resolved);
      }
    } catch (e) {
      const root = document.documentElement;
      root.lang = '${config.defaultLocale}';
      root.setAttribute('data-locale', '${config.defaultLocale}');
    }
  `;
}

function buildClientCacheCleanupScript(): string {
  return `
    try {
      const cacheVersionKey = 'chenlu-site-cache-version';
      const cacheVersion = '2026-06-15-publication-images-27-28';

      if (localStorage.getItem(cacheVersionKey) !== cacheVersion) {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations()
            .then((registrations) => registrations.forEach((registration) => registration.unregister()))
            .catch(() => {});
        }

        if ('caches' in window) {
          caches.keys()
            .then((keys) => keys.forEach((key) => caches.delete(key)))
            .catch(() => {});
        }

        localStorage.setItem(cacheVersionKey, cacheVersion);
      }
    } catch (e) {}
  `;
}

function buildLocalizedConfigMaps(
  locales: string[]
): {
  navigationByLocale: Record<string, SiteConfig['navigation']>;
  siteTitleByLocale: Record<string, string>;
  lastUpdatedByLocale: Record<string, string | undefined>;
} {
  const navigationByLocale: Record<string, SiteConfig['navigation']> = {};
  const siteTitleByLocale: Record<string, string> = {};
  const lastUpdatedByLocale: Record<string, string | undefined> = {};

  for (const locale of locales) {
    const localizedConfig = getConfig(locale);
    navigationByLocale[locale] = localizedConfig.navigation;
    siteTitleByLocale[locale] = localizedConfig.site.title;
    lastUpdatedByLocale[locale] = localizedConfig.site.last_updated;
  }

  return {
    navigationByLocale,
    siteTitleByLocale,
    lastUpdatedByLocale,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = getConfig();
  const runtimeI18n = getRuntimeI18nConfig(config.i18n);
  const targetLocales = runtimeI18n.enabled ? runtimeI18n.locales : [runtimeI18n.defaultLocale];

  const {
    navigationByLocale,
    siteTitleByLocale,
    lastUpdatedByLocale,
  } = buildLocalizedConfigMaps(targetLocales);

  return (
    <html lang={runtimeI18n.defaultLocale} className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href={config.site.favicon} type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: buildLocaleBootstrapScript(runtimeI18n),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                localStorage.removeItem('theme-storage');
                localStorage.removeItem('theme-storage-v2');
                const root = document.documentElement;
                const locale = root.getAttribute('data-locale') || root.lang || '${runtimeI18n.defaultLocale}';
                const effective = locale.toLowerCase().startsWith('zh') ? 'dark' : 'light';
                root.classList.remove('light', 'dark');
                root.classList.add(effective);
                root.setAttribute('data-theme', effective);
              } catch (e) {
                var root = document.documentElement;
                root.classList.remove('light', 'dark');
                root.classList.add('light');
                root.setAttribute('data-theme', 'light');
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: buildClientCacheCleanupScript(),
          }}
        />
        <StatcounterScripts />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <LocaleProvider config={runtimeI18n}>
            <Navigation
              items={config.navigation}
              siteTitle={config.site.title}
              enableOnePageMode={config.features.enable_one_page_mode}
              i18n={runtimeI18n}
              itemsByLocale={navigationByLocale}
              siteTitleByLocale={siteTitleByLocale}
            />
            <main className="min-h-screen pt-16 lg:pt-20">
              {children}
            </main>
            <Footer
              lastUpdated={config.site.last_updated}
              lastUpdatedByLocale={lastUpdatedByLocale}
              defaultLocale={runtimeI18n.defaultLocale}
            />
            <StatcounterNoscript />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
