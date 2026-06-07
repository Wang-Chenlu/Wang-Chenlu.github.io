# Publications Content

`content/publications.bib` is the publication data source for the PRISM migration. The Publications page reads this file directly, and the homepage Selected Publications section uses entries where `selected = {true}`.

Keep placeholder entries out of `content/publications.bib` before publishing. Because BibTeX parsers can still detect commented `@article` blocks in some cases, store examples in this document instead of the active `.bib` file.

If `content/publications.bib` has no active BibTeX entries, the Publications page and homepage section show a natural empty state instead of placeholder papers.

## Supported Fields

Standard BibTeX fields:

- `title`: paper title. Wrap terms that must keep capitalization in braces, for example `{DFT}`, `{MD}`, `{CO2}`, `{Li+}`.
- `author`: BibTeX author list. `Wang, Chenlu` or `Chenlu Wang` will be highlighted as the site owner. Add `#` after a co-first author and `*` after a corresponding author, for example `author = {Wang, Chenlu# and He, Hongyan*}`.
- `cofirst`: optional author-role field. List co-first authors with BibTeX `and` separators, for example `cofirst = {Di, Andi and Wang, Chenlu}`. PRISM displays a `#` marker after matching authors.
- `corresponding`: optional author-role field. List corresponding authors with BibTeX `and` separators, for example `corresponding = {He, Hongyan and Zhang, Miao}`. PRISM displays a small envelope icon after matching authors.
- `journal`: journal venue for `@article`.
- `booktitle`: conference/proceedings venue for `@inproceedings`.
- `year`, `month`, `volume`, `number`, `pages`: displayed in the venue line where available.
- `abstract`: optional collapsible abstract on the Publications page.
- `keywords`: optional comma-separated tags used internally for research-area detection.

Display and link fields:

- `selected`: set to `{true}` to show the paper on the homepage Selected Publications section. Omit it or set `{false}` for Publications page only.
- `preview`: image filename for the paper preview. Put the image in `public/papers/` and use only the filename, for example `preview = {my-paper.png}`. `preview = {papers/my-paper.png}` also works.
- `description`: short display text shown under the venue on publication cards.
- `doi`: rendered as a DOI button. Plain DOI values are linked through `https://doi.org/`.
- `url`: rendered as a URL button.
- `html`: rendered as an HTML button.
- `pdf`: rendered as a PDF button. `pdfurl` is also accepted.
- `code`: rendered as a Code button.
- `slides`: rendered as a Slides button.
- `video`: rendered as a Video button.
- `arxiv`: rendered as an arXiv button. `arxivid` and `eprint` are also accepted.

If a `preview` image does not exist in `public/papers/`, PRISM skips the image and uses the no-image layout.

## Journal Article Template

```bibtex
@article{wang-short-key-2026,
  title = {Title with Preserved Terms such as {DFT}, {MD}, {CO2}, and {Li+}},
  author = {Wang, Chenlu and Coauthor, Name},
  journal = {Journal Name},
  year = {2026},
  volume = {12},
  number = {3},
  pages = {123--145},
  doi = {10.xxxx/example-doi},
  url = {https://example.com/article},
  selected = {true},
  preview = {my-paper.png},
  description = {One concise sentence describing the contribution.}
}
```

## Conference Template

```bibtex
@inproceedings{wang-conference-key-2026,
  title = {Conference Paper Title with {DFT}, {MD}, {CO2}, or {Li+} Preserved},
  author = {Wang, Chenlu and Coauthor, Name},
  booktitle = {Proceedings of the Conference Name},
  year = {2026},
  volume = {12},
  number = {3},
  pages = {123--145},
  doi = {10.xxxx/example-doi},
  url = {https://example.com/conference-paper},
  selected = {false},
  preview = {conference-paper.png},
  description = {One concise sentence describing the conference paper.}
}
```

## Common Link Fields

```bibtex
  html = {https://example.com/html-page},
  pdf = {https://example.com/paper.pdf},
  code = {https://github.com/user/repo},
  slides = {https://example.com/slides.pdf},
  video = {https://example.com/talk-video},
  arxiv = {2601.01234}
```

## Author Markers

```bibtex
author = {First Author# and Wang, Chenlu# and Corresponding Author*}
```

- `#`: co-first author. PRISM displays a `#` marker after the author name.
- `*`: corresponding author. PRISM displays a small envelope icon after the author name.
- Use both markers if needed, for example `Wang, Chenlu#*`.

You can also keep the `author` field clean and add role fields:

```bibtex
author = {Di, Andi and Wang, Chenlu and He, Hongyan and Zhang, Miao}
cofirst = {Di, Andi and Wang, Chenlu}
corresponding = {He, Hongyan and Zhang, Miao}
```

Use `and` or semicolons between names in role fields. Do not use commas as separators, because BibTeX names already use commas.

## Check Changes

After editing `content/publications.bib`, run:

```bash
npm run build
```

Then preview the built site and check `/` and `/publications/`.
