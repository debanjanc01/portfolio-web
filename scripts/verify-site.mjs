/**
 * Ship checks for theybanjan.com: voice + positioning on real built HTML.
 * Usage: npm run build && npm test
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectHomeNotes } from '../src/lib/selectHomeNotes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const writingDir = path.join(root, 'src', 'content', 'writing');
const pagesDir = path.join(root, 'src', 'pages');
const workDir = path.join(root, 'src', 'content', 'work');
const timelineDir = path.join(root, 'src', 'content', 'timeline');
const layoutFile = path.join(root, 'src', 'layouts', 'Base.astro');

const EMDASH = '\u2014';

const failures = [];
function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function exists(p) {
  return fs.existsSync(p);
}

function walkFiles(dir, ext) {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) return walkFiles(p, ext);
    if (ext && !name.endsWith(ext)) return [];
    return [p];
  });
}

// --- Build output present ---
assert(exists(path.join(dist, 'index.html')), 'dist/index.html missing - run npm run build first');
for (const seg of ['writing', 'about', 'now', 'contact', 'timeline']) {
  assert(exists(path.join(dist, seg, 'index.html')), `dist/${seg}/index.html missing`);
}

const home = read(path.join(dist, 'index.html'));
const about = read(path.join(dist, 'about', 'index.html'));
const writingPage = read(path.join(dist, 'writing', 'index.html'));

// --- Em dash ban in visitor-facing source prose ---
const proseRoots = [
  ...walkFiles(pagesDir, '.astro'),
  ...walkFiles(pagesDir, '.js'),
  ...walkFiles(writingDir, '.md'),
  ...walkFiles(workDir, '.md'),
  ...walkFiles(timelineDir, '.md'),
  layoutFile,
];

const emdashHits = [];
for (const file of proseRoots) {
  if (file.includes('_post-template')) continue;
  // Strip HTML comments only; remaining U+2014 is visitor-facing or titles we ban sitewide.
  const raw = read(file).replace(/<!--[\s\S]*?-->/g, '');
  if (raw.includes(EMDASH)) {
    const lines = raw.split('\n');
    lines.forEach((line, i) => {
      if (line.includes(EMDASH) && !line.trim().startsWith('//') && !line.trim().startsWith('*') && !line.trim().startsWith('#')) {
        emdashHits.push(`${path.relative(root, file)}:${i + 1}: ${line.trim().slice(0, 120)}`);
      }
    });
  }
}
assert(emdashHits.length === 0, `em dash (U+2014) still present:\n    ${emdashHits.slice(0, 12).join('\n    ')}`);

// Built HTML home/about/writing should not show em dash in visible text either
for (const [label, html] of [
  ['home', home],
  ['about', about],
  ['writing', writingPage],
]) {
  // ignore JSON-LD and script blocks lightly by checking body-ish content
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  assert(!body.includes(EMDASH), `built ${label} still contains em dash`);
}

// --- Banned AI stock phrases ---
const banned = [
  'not the hype version',
  'same mind, different angle',
  'If the notes land',
  'Systems under load. Careers under load',
  'Judgment under load',
  'operable one',
];
for (const phrase of banned) {
  assert(!home.includes(phrase), `home still contains banned AI phrase: "${phrase}"`);
}

// --- Landing: stake first, not résumé lead ---
// Extract main text roughly
const text = home
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const h1Match = home.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
const h1 = (h1Match?.[1] || '').replace(/<[^>]+>/g, '').trim();
assert(h1.length > 8, 'home: missing H1');
assert(
  !/apollo\.io/i.test(h1),
  'home H1 should not lead with employer name'
);
assert(
  !/^senior software engineer/i.test(h1),
  'home H1 should not be a job title'
);
assert(
  /agents|Claude connector/i.test(text.slice(0, 900)),
  'home: missing who-he-is and agents near the top'
);
assert(/Apollo/i.test(home), 'home: missing current employer grounding');

assert(
  /human|agent|ship/i.test(home),
  'home: missing the writing subject'
);

assert(/x\.com\/theybanjan|@theybanjan/i.test(home), 'home: missing X follow affordance');
assert(!/Follow on X/i.test(home), 'home: needy Follow on X banner should not lead');
assert(
  /Short takes|brain dumps|@theybanjan|x\.com\/theybanjan/i.test(home),
  'home: missing plain follow-reason for X'
);
assert(/linkedin\.com\/in\/debanjanc01/i.test(home), 'home: missing LinkedIn');

assert(!exists(path.join(dist, 'work', 'index.html')), 'work page should stay unpublished for now');

// Paths
for (const href of ['/writing', '/about', '/contact', '/now', '/timeline', 'https://x.com/theybanjan']) {
  assert(home.includes(href), `home: missing path ${href}`);
}

// --- Writing inventory + selectHomeNotes ---
const mdFiles = fs
  .readdirSync(writingDir)
  .filter((f) => f.endsWith('.md') && !f.startsWith('_'));

const publishedNotes = [];
const publishedDives = [];
const publishedHumanish = [];

for (const f of mdFiles) {
  const raw = read(path.join(writingDir, f));
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) continue;
  const fm = fmMatch[1];
  if (/draft:\s*true/.test(fm)) continue;
  if (!/kind:\s*note/.test(fm)) continue;
  if (/^url:/m.test(fm)) continue;
  const mode = (fm.match(/mode:\s*(\w+)/) || [])[1];
  publishedNotes.push({ file: f, mode });
  if (mode === 'dive') publishedDives.push(f);
  if (['human', 'career', 'philosophy', 'lesson', 'building'].includes(mode)) {
    publishedHumanish.push(f);
  }
  const slug = f.replace(/\.md$/, '');
  assert(
    exists(path.join(dist, 'writing', slug, 'index.html')),
    `built note page missing for ${slug}`
  );
  // note body should not use em dash
  const body = raw.replace(/^---[\s\S]*?---/, '');
  assert(!body.includes(EMDASH), `note body has em dash: ${f}`);
}

assert(publishedNotes.length >= 3, `expected ≥3 published notes, got ${publishedNotes.length}`);
assert(publishedDives.length >= 1, 'expected ≥1 dive note');
assert(publishedHumanish.length >= 1, 'expected ≥1 human/career/philosophy note');

const featuredForSelect = publishedNotes
  .map((n) => {
    const raw = read(path.join(writingDir, n.file));
    const fm = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
    const featured = /featured:\s*true/.test(fm);
    const dateM = fm.match(/date:\s*(\d{4}-\d{2}-\d{2})/);
    const orderM = fm.match(/order:\s*(\d+)/);
    return {
      file: n.file,
      slug: n.file.replace(/\.md$/, ''),
      featured,
      data: {
        mode: n.mode,
        date: dateM ? new Date(dateM[1]) : undefined,
        order: orderM ? Number(orderM[1]) : 0,
      },
    };
  })
  .filter((n) => n.featured)
  .sort((a, b) => {
    const ad = a.data.date ? a.data.date.getTime() : 0;
    const bd = b.data.date ? b.data.date.getTime() : 0;
    if (ad !== bd) return bd - ad;
    return (b.data.order ?? 0) - (a.data.order ?? 0);
  });

const selected = selectHomeNotes(featuredForSelect);
const selectedModes = selected.map((e) => e.data.mode);
assert(selectedModes.includes('human'), `selectHomeNotes must keep human; got [${selectedModes}]`);
assert(selectedModes.includes('dive'), `selectHomeNotes must keep dive; got [${selectedModes}]`);
assert(selectedModes.includes('career'), `selectHomeNotes must keep career; got [${selectedModes}]`);

for (const mode of ['human', 'dive', 'career']) {
  const slug = selected.find((e) => e.data.mode === mode)?.slug;
  assert(slug && home.includes(`/writing/${slug}`), `home must link ${mode} note ${slug}`);
}

assert(
  /Other sites/i.test(writingPage),
  'writing page should keep external pieces in their own list'
);
assert(
  !/post-card|deep dive|philosophy/i.test(writingPage),
  'writing page should not use mode chips or cards'
);

assert(/eight(-plus)?\s+years|8\+\s*years/i.test(about), 'about: missing years signal');

// --- Timeline bodies: spoken voice, not LinkedIn résumé soup ---
const timelineFiles = walkFiles(timelineDir, '.md');
assert(timelineFiles.length >= 6, `expected ≥6 timeline entries, got ${timelineFiles.length}`);

const resumeOpeners =
  /^(Led|Drove|Built|Designed|Key contributor|Working on sales engagement workflows with a focus)/m;
const resumeChains = /; (cut|lifted|and redesigned|built a|eliminating)/i;

const timelineReport = [];
for (const file of timelineFiles) {
  const raw = read(file);
  const body = raw.replace(/^---[\s\S]*?---\s*/, '').trim();
  const rel = path.relative(root, file);
  assert(body.length > 40, `timeline body too thin: ${rel}`);
  assert(!body.includes(EMDASH), `timeline body has em dash: ${rel}`);
  assert(
    !resumeOpeners.test(body),
    `timeline still opens like a résumé bullet: ${rel}`
  );
  assert(
    !resumeChains.test(body),
    `timeline still has semicolon résumé chain: ${rel}`
  );
  // Spoken / first-person or concrete scene (not pure passive corporate)
  assert(
    /\b(I |we |The |Same |Early |Pre-go|End-of-day|Mail |I got|I owned|I work|I also|I moved|I modeled)/i.test(
      body
    ),
    `timeline body lacks spoken/first-person signal: ${rel}`
  );
  timelineReport.push({ file: path.basename(file), chars: body.length });
}

// Built timeline page should carry rewritten Apollo + Snapdeal language
const timelineHtml = read(path.join(dist, 'timeline', 'index.html'));
assert(
  /I work on sales engagement|I owned outbound|got tired of every WhatsApp/i.test(timelineHtml),
  'built timeline missing rewritten spoken bodies'
);
assert(
  !/Led outbound communication across Email/i.test(timelineHtml),
  'built timeline still has old résumé Snapdeal line'
);

// --- Report ---
if (failures.length) {
  console.error('verify-site FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}

console.log('verify-site OK');
console.log(
  JSON.stringify(
    {
      h1,
      publishedNotes: publishedNotes.length,
      selectedModes,
      emdashHits: emdashHits.length,
      timelineEntries: timelineReport,
      homeBytes: home.length,
    },
    null,
    2
  )
);
