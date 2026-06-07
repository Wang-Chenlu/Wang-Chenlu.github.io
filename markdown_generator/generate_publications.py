#!/usr/bin/env python3
"""Generate AcademicPages publication markdown files from BibTeX."""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
import warnings
from pathlib import Path

warnings.filterwarnings(
    "ignore",
    message=r"pkg_resources is deprecated as an API.*",
    category=UserWarning,
)

try:
    from pybtex.database.input import bibtex
except ImportError as exc:
    print(
        "Missing dependency: pybtex. Install it with `pip install -r requirements.txt`.",
        file=sys.stderr,
    )
    raise SystemExit(1) from exc


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BIB = REPO_ROOT / "content" / "publications.bib"
DEFAULT_OUTPUT_DIR = REPO_ROOT / "_publications"
GENERATED_RE = re.compile(r"^generated:\s*true\s*$", re.IGNORECASE | re.MULTILINE)

MONTHS = {
    "jan": 1,
    "january": 1,
    "feb": 2,
    "february": 2,
    "mar": 3,
    "march": 3,
    "apr": 4,
    "april": 4,
    "may": 5,
    "jun": 6,
    "june": 6,
    "jul": 7,
    "july": 7,
    "aug": 8,
    "august": 8,
    "sep": 9,
    "sept": 9,
    "september": 9,
    "oct": 10,
    "october": 10,
    "nov": 11,
    "november": 11,
    "dec": 12,
    "december": 12,
}

CATEGORY_BY_ENTRY_TYPE = {
    "article": "manuscripts",
    "inproceedings": "conferences",
    "conference": "conferences",
    "proceedings": "conferences",
    "book": "books",
    "inbook": "books",
}


def warn(message: str) -> None:
    print(f"WARNING: {message}", file=sys.stderr)


def clean_latex(value: object) -> str:
    """Keep protected capitalization while removing common BibTeX/LaTeX markup."""
    text = str(value).replace("\n", " ")
    replacements = {
        r"\&": "&",
        r"\%": "%",
        r"\$": "$",
        r"\#": "#",
        r"\_": "_",
        r"``": '"',
        r"''": '"',
        "~": " ",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)

    text = re.sub(r"\$([^$]*)\$", r"\1", text)
    text = re.sub(
        r"\\(?:textsubscript|textsuperscript|mathrm|textrm|mathbf|emph|textit|textbf)\{([^{}]*)\}",
        r"\1",
        text,
    )
    text = re.sub(r"[_^]\{([^{}]*)\}", r"\1", text)
    text = re.sub(r"[_^]([A-Za-z0-9+\-]+)", r"\1", text)
    text = re.sub(r"\\[a-zA-Z]+\*?(?:\[[^\]]*\])?\{([^{}]*)\}", r"\1", text)
    text = re.sub(r"\\[a-zA-Z]+", "", text)
    text = text.replace("{", "").replace("}", "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def entry_fields(entry) -> dict[str, str]:
    return {key.lower(): clean_latex(value) for key, value in entry.fields.items()}


def get_field(fields: dict[str, str], *names: str) -> str:
    for name in names:
        value = fields.get(name.lower(), "").strip()
        if value:
            return value
    return ""


def parse_bool(value: str) -> bool:
    return clean_latex(value).strip().lower() in {"1", "true", "yes", "y"}


def normalize_doi(doi: str) -> str:
    doi = doi.strip()
    doi = re.sub(r"^https?://(?:dx\.)?doi\.org/", "", doi, flags=re.IGNORECASE)
    doi = re.sub(r"^doi:\s*", "", doi, flags=re.IGNORECASE)
    return doi.strip()


def parse_date(fields: dict[str, str], bib_id: str) -> tuple[str, str]:
    year = get_field(fields, "year")
    if not year:
        warn(f"{bib_id}: missing year; using 1900-01-01 as a sorting placeholder.")
        return "1900-01-01", ""

    year_match = re.search(r"\d{4}", year)
    if not year_match:
        warn(f"{bib_id}: could not parse year `{year}`; using 1900-01-01.")
        return "1900-01-01", ""

    parsed_year = year_match.group(0)
    parsed_month = 1
    parsed_day = 1

    month = get_field(fields, "month")
    if month:
        month_key = month.strip().lower()[:3]
        if month.strip().isdigit():
            parsed_month = max(1, min(12, int(month.strip())))
        elif month.strip().lower() in MONTHS:
            parsed_month = MONTHS[month.strip().lower()]
        elif month_key in MONTHS:
            parsed_month = MONTHS[month_key]
        else:
            warn(f"{bib_id}: could not parse month `{month}`; using January.")

    day = get_field(fields, "day")
    if day:
        day_match = re.search(r"\d{1,2}", day)
        if day_match:
            parsed_day = max(1, min(31, int(day_match.group(0))))
        else:
            warn(f"{bib_id}: could not parse day `{day}`; using day 1.")

    return f"{parsed_year}-{parsed_month:02d}-{parsed_day:02d}", parsed_year


def format_person(person) -> str:
    parts = []
    for names in (person.first_names, person.middle_names, person.prelast_names, person.last_names, person.lineage_names):
        parts.extend(str(name) for name in names)
    return clean_latex(" ".join(parts))


def format_authors(entry) -> list[str]:
    return [format_person(person) for person in entry.persons.get("author", [])]


def compact_authors(authors: list[str]) -> str:
    if not authors:
        return ""
    if len(authors) <= 3:
        return ", ".join(authors)
    return f"{', '.join(authors[:3])}, et al."


def slugify(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", clean_latex(text))
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_text.lower()).strip("-")
    return re.sub(r"-{2,}", "-", slug)


def yaml_value(value) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if value is None or value == "":
        return ""
    return json.dumps(str(value), ensure_ascii=False)


def front_matter(data: dict) -> str:
    lines = ["---"]
    for key, value in data.items():
        if isinstance(value, list):
            lines.append(f"{key}:")
            if value:
                for item in value:
                    lines.append(f"  - {yaml_value(item)}")
            continue
        rendered = yaml_value(value)
        lines.append(f"{key}: {rendered}" if rendered else f"{key}:")
    lines.append("---")
    return "\n".join(lines)


def is_generated_file(path: Path) -> bool:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return False
    if not text.startswith("---"):
        return False
    end = text.find("\n---", 3)
    if end == -1:
        return False
    return bool(GENERATED_RE.search(text[3:end]))


def clean_generated_files(output_dir: Path) -> int:
    count = 0
    for path in output_dir.glob("*.md"):
        if is_generated_file(path):
            path.unlink()
            count += 1
    return count


def build_citation(authors: list[str], title: str, venue: str, fields: dict[str, str], year: str) -> str:
    parts = []
    author_text = compact_authors(authors)
    if author_text:
        parts.append(f"{author_text}.")
    if title:
        parts.append(f'"{title}."')

    venue_parts = []
    if venue:
        venue_parts.append(venue)

    volume = get_field(fields, "volume")
    number = get_field(fields, "number")
    pages = get_field(fields, "pages")
    if volume:
        volume_text = volume
        if number:
            volume_text += f"({number})"
        venue_parts.append(volume_text)
    if pages:
        venue_parts.append(pages)
    if year:
        venue_parts.append(year)
    if venue_parts:
        parts.append(", ".join(venue_parts))

    citation = " ".join(parts).strip()
    if citation and not citation.endswith("."):
        citation += "."
    return citation


def entry_to_markdown(bib_id: str, entry, used_filenames: set[str]) -> tuple[str, str] | None:
    fields = entry_fields(entry)
    title = get_field(fields, "title")
    if not title:
        warn(f"{bib_id}: missing title; skipping entry.")
        return None

    slug = slugify(title) or slugify(bib_id)
    if not slug:
        warn(f"{bib_id}: could not generate slug; skipping entry.")
        return None

    pub_date, parsed_year = parse_date(fields, bib_id)
    venue = get_field(fields, "journal") or get_field(fields, "booktitle")
    description = get_field(fields, "description")
    doi = normalize_doi(get_field(fields, "doi"))
    url = get_field(fields, "url")
    paperurl = f"https://doi.org/{doi}" if doi else url
    authors = format_authors(entry)
    entry_type = entry.type.lower()
    category = get_field(fields, "category") or CATEGORY_BY_ENTRY_TYPE.get(entry_type, "manuscripts")
    selected = parse_bool(get_field(fields, "selected"))
    preview = get_field(fields, "preview")
    excerpt = description or ", ".join(part for part in (venue, parsed_year) if part)
    citation = build_citation(authors, title, venue, fields, parsed_year)

    filename = f"{pub_date}-{slug}.md"
    if filename in used_filenames:
        filename = f"{pub_date}-{slugify(bib_id) or bib_id}.md"
    suffix = 2
    base_filename = filename
    while filename in used_filenames:
        filename = base_filename.replace(".md", f"-{suffix}.md")
        suffix += 1
    used_filenames.add(filename)

    front = {
        "title": title,
        "collection": "publications",
        "category": category,
        "permalink": f"/publication/{pub_date}-{slug}/",
        "date": pub_date,
        "venue": venue,
        "excerpt": excerpt,
        "paperurl": paperurl,
        "citation": citation,
        "generated": True,
        "selected": selected,
        "preview": preview,
        "description": description,
        "doi": doi,
        "authors": authors,
    }

    body = []
    if description:
        body.append(description)
    if paperurl:
        body.append(f"[Access paper here]({paperurl}){{:target=\"_blank\"}}")
    if citation:
        body.append(f"Recommended citation: {citation}")

    markdown = front_matter(front)
    if body:
        markdown += "\n\n" + "\n\n".join(body)
    markdown += "\n"
    return filename, markdown


def generate(bib_path: Path, output_dir: Path, clean: bool = True) -> int:
    if not bib_path.exists():
        print(f"BibTeX file not found: {bib_path}", file=sys.stderr)
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)
    removed = clean_generated_files(output_dir) if clean else 0

    parser = bibtex.Parser()
    try:
        bib_data = parser.parse_file(str(bib_path))
    except Exception as exc:
        print(f"Failed to parse BibTeX file {bib_path}: {exc}", file=sys.stderr)
        return 1

    generated = 0
    used_filenames: set[str] = set()
    for bib_id, entry in bib_data.entries.items():
        result = entry_to_markdown(bib_id, entry, used_filenames)
        if result is None:
            continue
        filename, markdown = result
        (output_dir / filename).write_text(markdown, encoding="utf-8")
        generated += 1
        print(f"Generated {output_dir / filename}")

    print(f"Removed {removed} previously generated file(s).")
    print(f"Generated {generated} publication file(s).")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bib", type=Path, default=DEFAULT_BIB, help="BibTeX source file")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR, help="Generated markdown output directory")
    parser.add_argument("--no-clean", action="store_true", help="Do not remove previously generated markdown files first")
    args = parser.parse_args()
    return generate(args.bib, args.output_dir, clean=not args.no_clean)


if __name__ == "__main__":
    raise SystemExit(main())
