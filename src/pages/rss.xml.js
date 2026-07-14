import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const entries = (await getCollection('writing')).filter((e) => !e.data.draft);

  const items = entries
    .map((e) => ({
      title: e.data.title,
      pubDate: e.data.date,
      description: e.data.hook ?? e.data.title,
      // External articles/posts link out; on-site notes link to their page.
      link: e.data.url ?? new URL(`/writing/${e.slug}/`, context.site).href,
      categories: e.data.tags ?? [],
    }))
    .sort((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0));

  return rss({
    title: 'Debanjan - Writing',
    description:
      'Notes on production failures, judgment under pressure, early-career questions, and why building still matters.',
    site: context.site,
    items,
  });
}
