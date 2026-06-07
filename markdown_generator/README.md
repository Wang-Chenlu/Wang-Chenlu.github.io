# Markdown Generator

This directory contains various ways of creating Markdown for your site. In general, filenames that end with `.ipynb` or `.py` are similar, but may contain different documentation or are intended to be run from with GitHub when deploying your site.

## Python Scripts

The .py files are Python scripts that that can be run from the command line (ex., `python3 publications.py publications.csv`) with the objective of also ensuring that they have reduced requirements for packages, which may allow them to run when deploying your site from within GitHub.

### Publications From BibTeX

Publication metadata is maintained in `content/publications.bib`. Edit that file by adding normal BibTeX entries. The generator supports standard fields such as `title`, `author`, `journal`, `booktitle`, `year`, `month`, `doi`, `url`, `pages`, `volume`, and `number`, plus display fields such as `selected`, `preview`, `description`, and `category`.

Install the Python dependency once:

```bash
pip install -r requirements.txt
```

Regenerate the Jekyll collection files from the repository root:

```bash
python markdown_generator/generate_publications.py
```

The generated files are written to `_publications/` with `generated: true` in their front matter. They are read by the existing `site.publications` Jekyll collection. Do not edit generated `_publications/*.md` files by hand unless you intentionally want to diverge from the BibTeX source.

## Jupyter Notebooks

These .ipynb files are Jupyter notebook files that convert a TSV containing structured data about talks (`talks.tsv`) or presentations (`presentations.tsv`) into individual markdown files that will be properly formatted for the academicpages template. The notebooks contain a lot of documentation about the process.
