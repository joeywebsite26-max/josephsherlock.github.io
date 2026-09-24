# josephsherlock.com, static site

No framework, no build dependencies beyond Node. Four pages generated from one data file.

## Editing content

Everything list-shaped lives in `data/content.json`: publications, working papers, the
numbers strip, videos, press items, engagements, ideas in motion. Edit the JSON, then:

    node build.js

That rewrites `index.html`, `research.html`, `consulting.html` and `resume.html`.
Don't hand-edit those four; they're generated. Page structure and the wording outside the
lists lives in `build.js`.

**Adding a paper:** append to `publications` (published), `underReview`, or
`nearingSubmission`. Set `theme` to `democracy`, `sustainability` or `science` and it joins
the right research filter automatically; leave it off and the entry still shows under
All / Published / In progress.

## Design system

`css/style.css`, tokens at the top under `:root`. Near-black `#101010` and white, with the
green carried over from the existing site.

Three green tokens, because one value can't serve every ground:

| token | value | use |
|---|---|---|
| `--accent` | `#617E64` | surfaces and rules; the site's green, exactly as it was |
| `--accent-ink` | `#4E6851` | green **text** on white, and button fills (6.14:1; `--accent` alone is 4.49 and misses AA) |
| `--accent-lt` | `#A3BFA6` | green on near-black grounds (9.57:1) |

Use `--accent-ink` whenever green meets white and `--accent-lt` whenever it meets black.
Every pair in the palette passes WCAG AA.

## Motion

`js/site.js`, no dependencies: typewriter in the banner, scroll reveals, click-to-play
video, the featured case-study stage, research filters and expandable rows.

**The typewriter cycles single words only** (`site.typewriter` in the JSON), and
`.banner-lede` has a fixed two-line box, so the page height never shifts while it types.
Keep those phrases short for the same reason. The rotating word is white on a green
highlight. The highlight uses `--accent-ink`, not `--accent`, so white on it clears AA.

**The featured stage** (`[data-stage]`) shows one case study at a time from `featured` in
the JSON, auto-advancing every 7s. It pauses on hover, on keyboard focus, when scrolled
out of view, and when the tab is hidden; with reduced motion it never auto-advances and the
arrows/dots still work. Each slide is a link to its own case-study URL. Add a fourth entry
to `featured` and the dots, counter and rotation all pick it up.
All of it is gated behind `prefers-reduced-motion: reduce`; with motion off the page is
complete and static. Reveals also have a 2.5s safety net so content can never stay hidden.

## Avoiding stray single words

`build.js` has an `nb()` helper that binds the last two words of every heading, lede, card
title and citation line with a non-breaking space, and the CSS applies `text-wrap: balance`
to headings and `pretty` to body copy. If you add a new text field to a template, wrap it in
`nb()` rather than `esc()` so it inherits this. Verified clean at 1440/1100/900/600/375.

## Previewing

    node build.js && ./sync.sh

then open http://localhost:4399. `sync.sh` mirrors the site into a temp directory because
the preview server can't read the Desktop folder on this Mac.

## Videos

Click-to-play facades: the poster image is local and the YouTube iframe is only created on
click, pointing at `youtube-nocookie.com`. Nothing is requested from Google until a visitor
actually plays a video. Posters are in `img/video/<id>.jpg`.

## Resume PDF

`assets/joseph-sherlock-cv.pdf` is Joseph's own formatted PDF, used as-is (last replaced
24 September 2026, "Joseph Sherlock CV September 2026.pdf"). To update it, drop the new
PDF in at that exact path and keep the filename `joseph-sherlock-cv.pdf` so `resume.html`
still finds it; no HTML or build changes are needed. Before publishing a new version,
check it for anything that shouldn't go public (referee names/emails, internal-only notes)
since a public repo makes the file world-readable and its git history.

## Fonts

Space Grotesk (display) and Inter Tight (body), self-hosted in `fonts/`. No external
requests, so the site works offline and has no Google Fonts dependency.

## Banners

Both photographic banners (`.banner` on the home page, `.break` on research) set an
`aspect-ratio` equal to the source photo's own ratio, so `object-fit: cover` has nothing to
crop. Do not add a `max-height` to either: it makes the box a different shape from the image
and the crop comes straight back. Below 860px the home banner stacks, photo at its natural
ratio with the type beneath it, for the same reason.

## Section labels

`.eyebrow` is the small uppercase label above each section: letterspaced, muted, with a
hairline under it. No decorative dot: deliberately removed, don't add one back.

## Assets

Institution logos and project mockups in `img/logos/` and `img/projects/` were taken from
the existing Wix site's own media. The banner is generated from
`../WhatsApp Image 2025-07-05 at 13.44.04.jpeg`.
