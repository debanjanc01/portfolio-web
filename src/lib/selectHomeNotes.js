/**
 * Pick notes for the home "Selected writing" shelf.
 * Guarantees dive + human + career when those modes exist in the list,
 * so the multi-pillar intro is never a false promise.
 *
 * @param {Array<{ data: { mode?: string, date?: Date, order?: number } }>} list
 * @param {number} [max=4]
 * @returns {typeof list}
 */
export function selectHomeNotes(list, max = 4) {
  if (!list?.length) return [];
  if (list.length <= max) return list;

  const byMode = (mode) => list.filter((e) => e.data?.mode === mode);
  const picked = [];
  const add = (e) => {
    if (e && !picked.includes(e) && picked.length < max) picked.push(e);
  };

  // Required pillars first (when present) so human is never dropped by dive-heavy fill.
  add(byMode('dive')[0]);
  add(byMode('human')[0]);
  add(byMode('career')[0]);
  add(
    byMode('philosophy')[0] ||
      byMode('lesson')[0] ||
      byMode('building')[0] ||
      byMode('dive')[1]
  );

  for (const e of list) {
    if (picked.length >= max) break;
    add(e);
  }
  return picked;
}
