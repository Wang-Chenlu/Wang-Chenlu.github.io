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
          <span className={`${author.isHighlighted ? 'font-semibold text-accent' : ''} ${author.isCoAuthor ? `underline underline-offset-4 ${author.isHighlighted ? 'decoration-accent' : 'decoration-neutral-400'}` : ''}`}>
            {author.name}
          </span>
          {author.isCoAuthor && (
            <sup
              className={`ml-0.5 text-[0.7em] font-semibold ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-400'}`}
              title="Co-first author"
            >
              #
            </sup>
          )}
          {author.isCorresponding && (
            <EnvelopeIcon
              className={`ml-1 inline-block h-3.5 w-3.5 align-[-0.15em] ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-400'}`}
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
