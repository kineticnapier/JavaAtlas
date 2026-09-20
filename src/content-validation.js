const VALID_TYPES = new Set(['concept', 'code', 'exception', 'compiler-error', 'compiler-warning', 'logic']);
const VALID_STATUSES = new Set(['standard', 'preview', 'deprecated']);
const REQUIRED_LOCALE_FIELDS = ['title', 'short', 'summary', 'why', 'tips', 'tags'];

export function validateCorpus({ articles, locales }) {
  const errors = [];
  const ids = new Set();

  for (const article of articles) {
    if (!article?.id) {
      errors.push('article missing id');
      continue;
    }
    if (ids.has(article.id)) errors.push(`duplicate id: ${article.id}`);
    ids.add(article.id);

    if (!VALID_TYPES.has(article.type)) errors.push(`${article.id}: invalid type ${article.type}`);
    if (!Number.isInteger(article.since) || article.since < 1) errors.push(`${article.id}: invalid since`);
    if (article.until != null && (!Number.isInteger(article.until) || article.until < article.since)) {
      errors.push(`${article.id}: invalid version range`);
    }
    if (!VALID_STATUSES.has(article.status)) errors.push(`${article.id}: invalid status ${article.status}`);
    if (!Array.isArray(article.related)) errors.push(`${article.id}: related must be an array`);
    if (!Array.isArray(article.topics)) errors.push(`${article.id}: topics must be an array`);
  }

  for (const article of articles) {
    for (const related of article.related ?? []) {
      if (!ids.has(related)) errors.push(`${article.id}: missing related ${related}`);
    }
  }

  for (const [locale, map] of Object.entries(locales ?? {})) {
    const seenTitles = new Map();
    for (const article of articles) {
      const localized = map?.[article.id];
      if (!localized) {
        errors.push(`${locale}: missing locale ${article.id}`);
        continue;
      }
      for (const field of REQUIRED_LOCALE_FIELDS) {
        if (!(field in localized)) errors.push(`${locale}:${article.id}: missing ${field}`);
      }
      const title = localized.title?.trim();
      if (title) {
        if (seenTitles.has(title)) errors.push(`${locale}: duplicate title ${title}`);
        else seenTitles.set(title, article.id);
      }
    }
    for (const id of Object.keys(map ?? {})) {
      if (!ids.has(id)) errors.push(`${locale}: orphan locale ${id}`);
    }
  }

  for (const requiredLocale of ['ja', 'en']) {
    if (!locales?.[requiredLocale]) errors.push(`missing locale map ${requiredLocale}`);
  }

  return errors;
}
