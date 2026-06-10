import { EnvelopeIcon } from '@heroicons/react/24/outline';
import type { Author } from '@/types/publication';

interface PublicationAuthorsProps {
  authors: Author[];
  className?: string;
}

export default function PublicationAuthors({ authors, className }: PublicationAuthorsProps) {
  return (
    <p className={className}>
      {authors.map((author, idx) => (
        <span key={idx}>
          <span className={author.isHighlighted ? 'font-semibold text-[#9a6a24] dark:text-[#e4b976]' : undefined}>
            {author.name}
          </span>
          {author.isCoAuthor && (
            <sup
              className={`ml-0.5 text-[0.72em] font-semibold ${author.isHighlighted ? 'text-[#9a6a24] dark:text-[#e4b976]' : 'text-neutral-600 dark:text-neutral-400'}`}
              title="Co-first author"
              aria-label="Co-first author"
            >
              &#8224;
            </sup>
          )}
          {author.isCorresponding && (
            <EnvelopeIcon
              className={`ml-1 inline-block h-3.5 w-3.5 align-[-0.15em] ${author.isHighlighted ? 'text-[#9a6a24] dark:text-[#e4b976]' : 'text-neutral-600 dark:text-neutral-400'}`}
              aria-label="Corresponding author"
              role="img"
            />
          )}
          {idx < authors.length - 1 && ', '}
        </span>
      ))}
    </p>
  );
}
