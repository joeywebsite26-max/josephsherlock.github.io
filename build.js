/* Build josephsherlock.com - static HTML from data/content.json.
   Usage: node build.js                                            */

const fs = require("fs");
const path = require("path");

const D = JSON.parse(fs.readFileSync(path.join(__dirname, "data/content.json"), "utf8"));
const S = D.site;

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* Bind the last two words so a line can never end on a lone orphan.
   Applied to every heading, lede, card title and link label.        */
function nb(s = "") {
  const t = esc(s).trimEnd();
  const i = t.lastIndexOf(" ");
  if (i < 0) return t;
  // don't bind if the tail word is long enough to hold a line on its own
  const tail = t.slice(i + 1);
  if (tail.length > 14) return t;
  return t.slice(0, i) + "&nbsp;" + tail;
}

const NAV = [
  { href: "index.html",      label: "Home" },
  { href: "research.html",   label: "Research" },
  { href: "consulting.html", label: "Consulting" },
  { href: "resume.html",     label: "Resume" },
];

function pageHead(title, lede, cta) {
  return `<section class="section" style="padding-bottom:0">
  <div class="wrap">
    <h1 class="page-title">${nb(title)}</h1>
    ${lede ? `<p class="page-lede">${nb(lede)}</p>` : ""}
    ${cta || ""}
  </div>
</section>`;
}

const arrow = `<span class="ico" aria-hidden="true">→</span>`;

function layout({ title, current, body, description }) {
  const nav = NAV.map(
    (n) => `<a href="${n.href}"${n.href === current ? ' aria-current="page"' : ""}>${n.label}</a>`
  ).join("\n        ");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#101010">
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<header class="masthead">
  <div class="wrap">
    <a class="wordmark" href="index.html">Joseph Sherlock</a>
    <div class="head-right">
      <nav class="nav" aria-label="Primary">
        ${nav}
      </nav>
      <a class="btn btn-sm" href="mailto:${S.email}?subject=Hello">Get in touch ${arrow}</a>
    </div>
  </div>
</header>

<main>
${body}
</main>

<footer class="foot">
  <div class="wrap">
    <p>Dr Joseph Sherlock · School for Government, King’s College London</p>
    <div class="foot-links">
      <a class="link" href="mailto:${S.email}">${S.email}</a>
      <a class="link" href="${S.linkedin}">LinkedIn</a>
      <a class="link" href="${S.orcid}">ORCID</a>
    </div>
  </div>
</footer>

<script src="js/site.js" defer></script>
</body>
</html>
`;
}

/* ---------- shared partials ---------- */

const videoCards = (dark) =>
  D.videos
    .map(
      (v) => `      <button class="video card rv" data-video="${v.id}" data-title="${esc(v.title)}">
        <span class="card-media">
          <img src="img/video/${v.id}.jpg" alt="" loading="lazy" width="1280" height="720">
          <span class="play" aria-hidden="true">▶</span>
        </span>
        <h3>${nb(v.title)}</h3>
        <p class="kicker">${esc(v.source)}</p>
      </button>`
    )
    .join("\n");

const ar = `<span class="ar" aria-hidden="true">→</span>`;

function engagementsBlock() {
  return `<section class="section" style="padding-block: clamp(2.5rem,5vw,4rem)">
  <div class="wrap">
    <h2 class="eyebrow">Current engagements</h2>
    <div class="eng-grid">
${D.engagements
  .map(
    (e) => `      <div class="engagement">
        <img src="${e.logo}" alt="${esc(e.org)}" height="30">
        <div>
          <h3>${nb(e.role)}</h3>
          <p><span>${esc(e.unit)}</span><span>${esc(e.org)}</span></p>
        </div>
      </div>`
  )
  .join("\n")}
    </div>
  </div>
</section>`;
}

function featuredStage(idPrefix) {
  const slides = D.featured
    .map(
      (f, i) => `      <a class="slide${i === 0 ? " is-on" : ""}" href="${f.href}"${i === 0 ? "" : ' aria-hidden="true" tabindex="-1"'}>
        <span class="slide-media"><img src="${f.image}" alt="" ${i === 0 ? "" : 'loading="lazy"'}></span>
        <span class="slide-body">
          <span class="slide-theme">${esc(f.theme)}</span>
          <h3>${nb(f.title)}</h3>
          <span class="slide-kicker">${esc(f.kicker)}</span>
          <dl>
${f.rows.map((r) => `            <dt>${esc(r[0])}</dt>
            <dd>${nb(r[1])}</dd>`).join("\n")}
          </dl>
          <span class="btn slide-cta">Read the case study ${arrow}</span>
        </span>
      </a>`
    )
    .join("\n");

  const dots = D.featured
    .map(
      (f, i) =>
        `        <button class="dot" data-go="${i}" aria-current="${i === 0}"><span class="sr">${esc(f.title)}</span></button>`
    )
    .join("\n");

  return `  <div class="stage" id="${idPrefix}-stage" data-stage>
    <div class="slides">
${slides}
    </div>
    <div class="stage-bar">
      <div class="dots" role="tablist" aria-label="Featured case studies">
${dots}
      </div>
      <span class="stage-count"><span data-cur>1</span> / ${D.featured.length}</span>
      <div class="stage-nav">
        <button data-prev aria-label="Previous case study">←</button>
        <button data-next aria-label="Next case study">→</button>
      </div>
    </div>
  </div>`;
}

function newsCards() {
  return D.press
    .map(
      (p) => `      <a class="news-card rv" href="${p.href}">
        <span class="news-logo"><img src="${p.logo}" alt="" loading="lazy" width="26" height="26"></span>
        <span>
          <span class="outlet">${esc(p.outlet)}</span>
          <span class="headline">${nb(p.headline)}</span>
        </span>
        <span class="go">Read ${ar}</span>
      </a>`
    )
    .join("\n");
}

function ideasBlock() {
  const li = (x) => {
    const st = x.status ? `<span class="st">${esc(x.status)}</span>` : "";
    const note = x.note ? ` <span class="note">(${esc(x.note)})</span>` : "";
    const link = x.href
      ? ` <a class="link" href="${x.href}">${esc(x.hrefLabel || "Read")} ↗</a>`
      : "";
    return `        <li>${nb(x.text)}${note}${st}${link}</li>`;
  };
  return `<section class="section on-dark">
  <div class="wrap">
    <h2 class="eyebrow">Ideas in motion</h2>
    <div class="ideas-grid">
      <div class="ideas-col rv">
        <h3>Thinking about</h3>
        <ul class="ideas-list">
${D.ideas.thinking.map(li).join("\n")}
        </ul>
      </div>
      <div class="ideas-col rv">
        <h3>Working on</h3>
        <ul class="ideas-list">
${D.ideas.working.map(li).join("\n")}
        </ul>
      </div>
    </div>
  </div>
</section>`;
}

const breakBanner = `<figure class="break" style="margin:0">
  <img src="img/break-1600.jpg"
       srcset="img/break-1000.jpg 1000w, img/break-1600.jpg 1600w, img/break-2400.jpg 2400w"
       sizes="100vw" width="3840" height="2160" loading="lazy"
       alt="Joseph Sherlock teaching a seminar at King’s College London">
</figure>`;

const THEME = { democracy: "Democracy", sustainability: "Sustainability", science: "Method" };

function pubRow(c, stage) {
  const venue = c.venue || c.status || "";
  const doi = c.doi
    ? `<a class="link" href="${c.doi}">${esc(c.doiLabel || "View the paper")} ↗</a>`
    : "";
  const tag = c.theme ? `<span class="pub-tag">${esc(THEME[c.theme])}</span>` : "";
  const year = c.year ? esc(c.year) + " · " : "";
  return `      <li class="pub" data-theme="${c.theme || ""}" data-stage="${stage}">
        <button class="pub-head" aria-expanded="false">
          ${tag}
          <span class="pub-title">${nb(c.title)}</span>
          <span class="pub-meta">${year}${nb(venue)}</span>
          <span class="plus" aria-hidden="true"></span>
        </button>
        <div class="pub-body"><div><div class="inner">
          <span class="authors">${esc(c.authors)}</span>
          ${doi}
        </div></div></div>
      </li>`;
}

/* ---------- home ---------- */

const home = `
<section class="banner">
  <div class="banner-media">
    <img src="img/banner-1600.jpg"
         srcset="img/banner-1000.jpg 1000w, img/banner-1600.jpg 1600w, img/banner-2400.jpg 2400w"
         sizes="100vw" width="2048" height="1283"
         alt="Joseph Sherlock presenting research on behavioural science and democracy">
  </div>
  <div class="wrap">
    <div class="banner-inner">
      <h1>Joseph Sherlock</h1>
      <p class="banner-lede">
        <span>${nb(S.bannerLead)}</span>
        <span class="tw-slot"><span class="tw" data-phrases='${JSON.stringify(S.typewriter)}'>${esc(S.typewriter[0])}</span></span>
      </p>
    </div>
  </div>
</section>

${engagementsBlock()}

<section class="section">
  <div class="wrap">
    <h2 class="eyebrow">About</h2>
    <div class="about rv">
      <div>
        <p>${nb(S.bio)}</p>
      </div>
      <div class="about-side">
        <h3>More about me</h3>
        <p>Full profile, teaching and doctoral supervision at King’s.</p>
        <a class="btn" href="${S.kclProfile}">King’s College London profile ${arrow}</a>
      </div>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <h2 class="eyebrow">Research focus</h2>
    <div class="focus-grid">
${D.focus
  .map(
    (f) => `      <div class="focus-item rv">
        <h3>${nb(f.title)}</h3>
        <p>${nb(f.body)}</p>
      </div>`
  )
  .join("\n")}
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <h2 class="eyebrow">Featured work</h2>
${featuredStage("home")}
    <p style="margin-top:2.75rem"><a class="btn" href="research.html">Explore all research ${arrow}</a></p>
  </div>
</section>

<section class="section on-dark">
  <div class="wrap">
    <h2 class="eyebrow">Watch &amp; listen</h2>
    <div class="cards cards-3">
${videoCards(true)}
    </div>
  </div>
</section>
`;

/* ---------- research ---------- */

const allPubs = []
  .concat(D.publications.map((c) => ({ c, stage: "published" })))
  .concat(D.chaptersReports.map((c) => ({ c, stage: "published" })))
  .concat(D.underReview.map((c) => ({ c, stage: "progress" })))
  .concat(D.nearingSubmission.map((c) => ({ c, stage: "progress" })));

const count = (fn) => allPubs.filter(fn).length;
const FILTERS = [
  { id: "all", label: "All", n: allPubs.length },
  { id: "published", label: "Published", n: count((x) => x.stage === "published") },
  { id: "progress", label: "In progress", n: count((x) => x.stage === "progress") },
  { id: "democracy", label: "Democracy", n: count((x) => x.c.theme === "democracy") },
  { id: "sustainability", label: "Sustainability", n: count((x) => x.c.theme === "sustainability") },
  { id: "science", label: "Method", n: count((x) => x.c.theme === "science") },
];

const research = `
${pageHead(
  "Research",
  "Field experiments on democracy, sustainability and the practice of behavioural science."
)}

<section class="section">
  <div class="wrap">
    <h2 class="eyebrow">Featured work</h2>
${featuredStage("res")}
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <h2 class="eyebrow">Publications &amp; working papers</h2>
    <div class="filters" role="group" aria-label="Filter publications">
${FILTERS.map(
  (f) => `      <button class="chip" data-filter="${f.id}" aria-pressed="${f.id === "all"}">${esc(f.label)} <span class="n">${f.n}</span></button>`
).join("\n")}
    </div>
    <ul class="pubs" id="pub-list">
${allPubs.map(({ c, stage }) => pubRow(c, stage)).join("\n")}
    </ul>
    <p class="empty" id="pub-empty" hidden>Nothing in this category yet.</p>
    <button class="showall" id="showall" hidden></button>
  </div>
</section>

${breakBanner}

${ideasBlock()}
`;

/* ---------- consulting ---------- */

const consulting = `
${pageHead(
  "From Research to Results",
  "Open to consulting. Please reach out.",
  `<a class="btn" href="mailto:${S.email}?subject=Consulting%20enquiry">Start a conversation ${arrow}</a>`
)}

<section class="section on-dark" style="margin-top:var(--section)">
  <div class="wrap">
    <h2 class="eyebrow">Watch &amp; listen</h2>
    <div class="cards cards-3">
${videoCards(true)}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="eyebrow">In the news</h2>
    <div class="cards cards-3">
${newsCards()}
    </div>
  </div>
</section>
`;

/* ---------- resume ---------- */

const resume = `
${pageHead(
  "Resume",
  "Full record of appointments, publications, funding and teaching.",
  `<a class="btn" href="assets/joseph-sherlock-cv.pdf" download>Download PDF ${arrow}</a>`
)}

<section class="section">
  <div class="wrap">
    <object class="doc-frame" data="assets/joseph-sherlock-cv.pdf" type="application/pdf">
      <div class="doc-fallback">
        Your browser can’t display the PDF inline.
        <a class="link" href="assets/joseph-sherlock-cv.pdf">Download the resume</a> instead.
      </div>
    </object>
  </div>
</section>
`;

/* ---------- emit ---------- */

const pages = [
  { file: "index.html", current: "index.html", title: "Joseph Sherlock | Behavioural Science and Public Policy", description: S.tagline, body: home },
  { file: "research.html", current: "research.html", title: "Research | Joseph Sherlock", description: "Publications, working papers and field experiments on democracy, sustainability and the science of behavioural science.", body: research },
  { file: "consulting.html", current: "consulting.html", title: "Consulting | Joseph Sherlock", description: "From research to results. Open to consulting on behavioural science in public policy.", body: consulting },
  { file: "resume.html", current: "resume.html", title: "Resume | Joseph Sherlock", description: "Resume of Dr Joseph Sherlock, King’s College London.", body: resume },
];

for (const p of pages) {
  fs.writeFileSync(path.join(__dirname, p.file), layout(p));
  console.log("wrote", p.file);
}
console.log(`\n  ${allPubs.length} publication rows · ${D.videos.length} videos · ${D.press.length} press items`);
