import { localizeArticles } from './article-localization.js';

export const CONTENT_CATEGORIES = [
  'java-core.json',
  'java-expansion-001.json',
  'java-expansion-002.json',
  'java-expansion-003.json',
  'java-expansion-004.json',
  'java-expansion-005.json',
  'java-expansion-006.json',
  'java-expansion-007.json',
  'java-expansion-008.json'
];

export async function loadLocalizedContent({ fetchJson, locale, fallbackLocale = 'ja' }) {
  if (typeof fetchJson !== 'function') throw new Error('fetchJson is required');

  const baseGroups = await Promise.all(
    CONTENT_CATEGORIES.map(file => fetchJson(`./content/articles/${file}`))
  );
  const fallbackGroups = await Promise.all(
    CONTENT_CATEGORIES.map(file => fetchJson(`./content/locales/${fallbackLocale}/${file}`))
  );
  const requestedGroups = locale === fallbackLocale
    ? fallbackGroups
    : await Promise.all(
      CONTENT_CATEGORIES.map(file => fetchJson(`./content/locales/${locale}/${file}`))
    );

  const baseArticles = baseGroups.flat();
  const mergeLocaleGroups = groups => Object.assign({}, ...groups);
  const localeMaps = {
    [fallbackLocale]: mergeLocaleGroups(fallbackGroups),
    [locale]: mergeLocaleGroups(requestedGroups)
  };

  return {
    articles: localizeArticles(baseArticles, localeMaps, locale, fallbackLocale),
    requestedLocale: locale
  };
}
