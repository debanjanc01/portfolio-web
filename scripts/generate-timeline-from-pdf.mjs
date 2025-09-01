import fs from 'node:fs/promises';
import path from 'node:path';
import pdf from 'pdf-parse';

async function main() {
  const pdfPath = process.env.PDF || '/Users/debanjan/Downloads/Profile.pdf';
  const buf = await fs.readFile(pdfPath);
  const { text } = await pdf(buf);

  // Very simple heuristic parser: look for lines containing role/company/date.
  // You can refine later; for now we just extract blocks separated by blank lines.
  const lines = text.split(/\r?\n/).map(l => l.trim());
  const blocks = [];
  let cur = [];
  for (const l of lines) {
    if (l === '') { if (cur.length) { blocks.push(cur); cur = []; } continue; }
    cur.push(l);
  }
  if (cur.length) blocks.push(cur);

  const entries = [];
  const dateRe = /(\d{4})\s*(?:-|–|to|\/)\s*(Present|present|\d{4})/;
  for (const b of blocks) {
    const joined = b.join(' ');
    const dateMatch = joined.match(dateRe);
    if (!dateMatch) continue;
    const start = dateMatch[1];
    const end = /Present/i.test(dateMatch[2]) ? undefined : `${dateMatch[2]}-12-31`;
    // naive role/company extraction: first sentence tokens
    const first = b[0] || '';
    const role = first;
    const company = (b.find(x => /@| at | Pvt | Inc\.?| LLC| Labs/i.test(x)) || '').replace(/^[-•\s]+/, '');
    const body = b.slice(1).join(' ');
    entries.push({ role, company, start: `${start}-01-01`, end, body });
  }

  // Sort latest first
  entries.sort((a, b) => (b.end || b.start).localeCompare(a.end || a.start));

  const outDir = path.resolve('src/content/timeline');
  await fs.mkdir(outDir, { recursive: true });

  let idx = 0;
  for (const e of entries) {
    const slug = `${(e.end || e.start).slice(0, 4)}-${String(++idx).padStart(2, '0')}`;
    const file = path.join(outDir, `${slug}.md`);
    const fm = `---\nrole: ${yamlEscape(e.role)}\ncompany: ${yamlEscape(e.company || '')}\nstart: ${e.start}\n${e.end ? `end: ${e.end}\n` : ''}stack: []\nfocus: []\n---\n\n${e.body}\n`;
    await fs.writeFile(file, fm, 'utf8');
  }

  console.log(`Wrote ${entries.length} timeline entries to ${outDir}`);
}

function yamlEscape(s) {
  const v = String(s || '').replace(/"/g, '\\"');
  return `"${v}"`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


