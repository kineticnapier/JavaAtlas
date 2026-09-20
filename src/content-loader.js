export const CONTENT_CATEGORIES = ['concepts.json','code-recipes.json','exceptions.json','compiler-errors.json','compiler-warnings.json','logic-errors.json'];

export async function loadLocalizedContent({ fetchJson, locale = 'ja', fallbackLocale = 'ja' }) {
  const baseGroups = await Promise.all(CONTENT_CATEGORIES.map(file => fetchJson(`./content/articles/${file}`)));
  const fallbackGroups = await Promise.all(CONTENT_CATEGORIES.map(file => fetchJson(`./content/locales/${fallbackLocale}/${file}`)));
  const requestedGroups = locale === fallbackLocale ? fallbackGroups : await Promise.all(CONTENT_CATEGORIES.map(file => fetchJson(`./content/locales/${locale}/${file}`)));
  const base = baseGroups.flat();
  const fallback = Object.assign({}, ...fallbackGroups);
  const requested = Object.assign({}, ...requestedGroups);
  return base.map(article => ({ ...article, ...(fallback[article.id] ?? {}), ...(requested[article.id] ?? {}) }));
}
