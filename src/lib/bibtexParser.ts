import fs from 'fs';
import path from 'path';
import { Publication, PublicationType, ResearchArea } from '@/types/publication';
import { getConfig } from './config';
import { getRuntimeI18nConfig } from './i18n/config';
import { parseBibTeXInline } from './bibtexInline';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bibtexParse = require('bibtex-parse-js');

// Map BibTeX entry types to our publication types
const typeMapping: Record<string, PublicationType> = {
  article: 'journal',
  inproceedings: 'conference',
  conference: 'conference',
  incollection: 'book-chapter',
  book: 'book',
  phdthesis: 'thesis',
  mastersthesis: 'thesis',
  techreport: 'technical-report',
  unpublished: 'preprint',
  misc: 'preprint',
};

// Convert month names to numbers
const monthMapping: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, september: 9, sept: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

export function parseBibTeX(bibtexContent: string, locale?: string): Publication[] {
  const highlightNames = getHighlightNames(locale);
  const sanitizedContent = stripFullLineComments(bibtexContent);

  if (!sanitizedContent.trim()) {
    return [];
  }

  const entries = bibtexParse.toJSON(sanitizedContent);

  return entries.map((entry: { entryType: string; citationKey: string; entryTags: Record<string, string> }, index: number) => {
    const tags = entry.entryTags;
    const authorRoles = getAuthorRoles(tags);

    // Parse authors
    const authors = parseAuthors(tags.author || '', highlightNames, authorRoles);

    // Parse year and month
    const year = parseInt(tags.year) || new Date().getFullYear();
    const monthStr = tags.month?.toLowerCase() || '';
    const month = monthMapping[monthStr] || (parseInt(monthStr) || undefined);

    // Determine type
    const type = typeMapping[entry.entryType.toLowerCase()] || 'journal';

    // Parse tags/keywords
    const keywords = tags.keywords?.split(',').map((k: string) => k.trim()) || [];

    const selected = parseBoolean(tags.selected);
    const preview = resolvePublicPreview(tags.preview);
    const title = parseBibTeXInline(tags.title || 'Untitled');

    // Create publication object
    const publication: Publication = {
      id: entry.citationKey || tags.id || `pub-${Date.now()}-${index}`,
      title: title.plainText || 'Untitled',
      titleNodes: title.nodes,
      authors,
      year,
      month: monthMapping[tags.month?.toLowerCase()] ? String(month) : tags.month,
      type,
      status: 'published',
      tags: keywords,
      keywords,
      researchArea: detectResearchArea(tags.title, keywords),

      // Optional fields
      journal: cleanBibTeXString(tags.journal),
      conference: cleanBibTeXString(tags.booktitle),
      volume: tags.volume,
      issue: tags.number,
      pages: tags.pages,
      doi: cleanBibTeXString(tags.doi),
      url: cleanBibTeXString(tags.url),
      html: cleanBibTeXString(tags.html),
      code: cleanBibTeXString(tags.code),
      pdfUrl: cleanBibTeXString(tags.pdf || tags.pdfurl),
      slides: cleanBibTeXString(tags.slides),
      video: cleanBibTeXString(tags.video),
      arxivId: cleanBibTeXString(tags.arxiv || tags.arxivid || tags.eprint),
      abstract: cleanBibTeXString(tags.abstract),
      description: cleanBibTeXString(tags.description || tags.note),
      selected,
      group: cleanBibTeXString(tags.group),
      preview,

      // Store original BibTeX (excluding custom fields)
      bibtex: reconstructBibTeX(entry, [
        'selected',
        'group',
        'preview',
        'description',
        'keywords',
        'html',
        'url',
        'pdf',
        'pdfurl',
        'code',
        'slides',
        'video',
        'arxiv',
        'arxivid',
        'eprint',
        'corresponding',
        'correspondingauthor',
        'correspondingauthors',
        'corresponding_author',
        'corresponding_authors',
        'cofirst',
        'cofirstauthor',
        'cofirstauthors',
        'co_first',
        'co_first_author',
        'co_first_authors',
        'equalcontribution',
        'equal_contribution',
        'equal_contributors',
      ]),
    };

    // Clean up undefined fields
    Object.keys(publication).forEach(key => {
      if (publication[key as keyof Publication] === undefined) {
        delete publication[key as keyof Publication];
      }
    });

    return publication;
  }).sort((a: Publication, b: Publication) => {
    // Keep source order stable within the same year.
    return b.year - a.year;
  });
}

function stripFullLineComments(bibtexContent: string): string {
  return bibtexContent
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith('%'))
    .join('\n');
}

function parseBoolean(value?: string): boolean {
  const normalized = cleanBibTeXString(value).trim().toLowerCase();
  return normalized === 'true' || normalized === 'yes' || normalized === '1';
}

function resolvePublicPreview(value?: string): string | undefined {
  const preview = cleanBibTeXString(value).trim().replace(/\\/g, '/').replace(/^\/+/, '');

  if (!preview) {
    return undefined;
  }

  const publicPath = preview.startsWith('papers/') ? preview : path.posix.join('papers', preview);
  const diskPath = path.join(process.cwd(), 'public', ...publicPath.split('/'));

  if (!fs.existsSync(diskPath)) {
    return undefined;
  }

  return `/${publicPath}`;
}

function getHighlightNames(locale?: string): string[] {
  const names = new Set<string>();
  const baseConfig = getConfig();
  const runtimeI18n = getRuntimeI18nConfig(baseConfig.i18n);

  const addName = (name?: string) => {
    const cleaned = cleanBibTeXString(name).trim();
    if (cleaned) {
      names.add(cleaned);
    }
  };

  const addAliases = (aliases?: string[]) => {
    aliases?.forEach(addName);
  };

  addName(baseConfig.author.name);
  addAliases(baseConfig.author.aliases);

  if (runtimeI18n.enabled) {
    runtimeI18n.locales.forEach((localeCode) => {
      const localizedConfig = getConfig(localeCode);
      addName(localizedConfig.author.name);
      addAliases(localizedConfig.author.aliases);
    });
  }

  if (locale) {
    const currentLocaleConfig = getConfig(locale);
    addName(currentLocaleConfig.author.name);
    addAliases(currentLocaleConfig.author.aliases);
  }

  return Array.from(names);
}

function normalizePersonNameForMatch(name: string): string {
  return name.toLowerCase().replace(/[\s.,'’`"()\-_/]/g, '');
}

function buildNameVariants(name: string): Set<string> {
  const variants = new Set<string>();
  const cleaned = cleanBibTeXString(name).toLowerCase().trim();

  if (!cleaned) {
    return variants;
  }

  variants.add(cleaned);

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 2) {
    variants.add(`${parts[1]} ${parts[0]}`);
  }

  return variants;
}

interface AuthorRoles {
  corresponding: Set<string>;
  coFirst: Set<string>;
}

function getAuthorRoles(tags: Record<string, string>): AuthorRoles {
  return {
    corresponding: buildAuthorRoleMatcher(getRoleFieldValues(tags, [
      'corresponding',
      'correspondingauthor',
      'correspondingauthors',
      'corresponding_author',
      'corresponding_authors',
    ])),
    coFirst: buildAuthorRoleMatcher(getRoleFieldValues(tags, [
      'cofirst',
      'cofirstauthor',
      'cofirstauthors',
      'co_first',
      'co_first_author',
      'co_first_authors',
      'equalcontribution',
      'equal_contribution',
      'equal_contributors',
    ])),
  };
}

function getRoleFieldValues(tags: Record<string, string>, fieldNames: string[]): string[] {
  const normalizedFieldNames = new Set(fieldNames.map((fieldName) => fieldName.toLowerCase()));

  return Object.entries(tags)
    .filter(([key]) => normalizedFieldNames.has(key.toLowerCase()))
    .flatMap(([, value]) => splitAuthorRoleList(value));
}

function splitAuthorRoleList(value: string): string[] {
  const cleaned = cleanBibTeXString(value);
  if (!cleaned) {
    return [];
  }

  return cleaned
    .split(/\s+and\s+|;/i)
    .map((name) => name.trim())
    .filter(Boolean);
}

function buildAuthorRoleMatcher(names: string[]): Set<string> {
  const normalizedNames = new Set<string>();

  names.forEach((name) => {
    const displayName = formatAuthorName(name);
    if (displayName) {
      normalizedNames.add(normalizePersonNameForMatch(displayName));
    }
  });

  return normalizedNames;
}

function formatAuthorName(author: string): string {
  let name = author.trim().replace(/[*#]/g, '');

  // Handle "Last, First" format
  if (name.includes(',')) {
    const parts = name.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      name = `${parts.slice(1).join(' ')} ${parts[0]}`;
    }
  }

  return cleanBibTeXString(name);
}

function parseAuthors(authorsStr: string, highlightNames: string[], authorRoles: AuthorRoles): Array<{ name: string; isHighlighted?: boolean; isCorresponding?: boolean; isCoAuthor?: boolean }> {
  if (!authorsStr) return [];

  const highlightTextCandidates = new Set<string>();
  const highlightNormalizedCandidates = new Set<string>();

  highlightNames.forEach((name) => {
    const variants = buildNameVariants(name);
    variants.forEach((variant) => {
      highlightTextCandidates.add(variant);
      highlightNormalizedCandidates.add(normalizePersonNameForMatch(variant));
    });
  });

  const highlightTextList = Array.from(highlightTextCandidates);
  const highlightNormalizedList = Array.from(highlightNormalizedCandidates);

  // Split by "and" and clean up
  return authorsStr
    .split(/\sand\s/)
    .map(author => {
      // Clean up the author name
      let name = author.trim();

      // Check for corresponding author marker
      const isCorresponding = name.includes('*');

      // Check for co-author marker (#)
      const isCoAuthor = name.includes('#');

      // Remove special markers from name
      name = name.replace(/[*#]/g, '');

      name = formatAuthorName(name);

      // Check if this is the site owner (to highlight)
      const lowerName = name.toLowerCase();
      const normalizedName = normalizePersonNameForMatch(lowerName);
      const hasCorrespondingRole = authorRoles.corresponding.has(normalizedName);
      const hasCoFirstRole = authorRoles.coFirst.has(normalizedName);
      const isHighlighted =
        highlightTextList.some((candidate) => lowerName.includes(candidate)) ||
        highlightNormalizedList.some((candidate) => normalizedName.includes(candidate));

      return {
        name,
        isHighlighted,
        isCorresponding: isCorresponding || hasCorrespondingRole,
        isCoAuthor: isCoAuthor || hasCoFirstRole,
      };
    })
    .filter(author => author.name);
}

function cleanBibTeXString(str?: string): string {
  if (!str) return '';

  return parseBibTeXInline(str).plainText;
}

function detectResearchArea(title: string, keywords: string[]): ResearchArea {
  const text = (title + ' ' + keywords.join(' ')).toLowerCase();

  if (text.includes('healthcare') || text.includes('medical') || text.includes('health')) {
    return 'ai-healthcare';
  }
  if (text.includes('signal') || text.includes('processing')) {
    return 'signal-processing';
  }
  if (text.includes('reliability') || text.includes('fault') || text.includes('diagnosis')) {
    return 'reliability-engineering';
  }
  if (text.includes('quantum')) {
    return 'quantum-computing';
  }
  if (text.includes('neural') || text.includes('spiking')) {
    return 'neural-networks';
  }
  if (text.includes('transformer') || text.includes('attention')) {
    return 'transformer-architectures';
  }

  return 'machine-learning';
}

function reconstructBibTeX(entry: { entryType: string; citationKey: string; entryTags: Record<string, string> }, excludeFields: string[] = []): string {
  const { entryType, citationKey, entryTags } = entry;

  let bibtex = `@${entryType}{${citationKey},\n`;

  Object.entries(entryTags).forEach(([key, value]) => {
    // Skip excluded fields
    if (!excludeFields.includes(key.toLowerCase())) {
      let cleanValue = value;

      // Clean author field by removing # and * symbols
      if (key.toLowerCase() === 'author') {
        cleanValue = value.replace(/[#*]/g, '');
      }

      bibtex += `  ${key} = {${cleanValue}},\n`;
    }
  });

  // Remove trailing comma and newline
  bibtex = bibtex.slice(0, -2) + '\n';
  bibtex += '}';

  return bibtex;
} 
