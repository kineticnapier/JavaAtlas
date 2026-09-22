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
  'java-expansion-008.json',
  'java-expansion-009.json',
  'java-expansion-010.json',
  'java-expansion-011.json',
  'java-expansion-012.json',
  'java-expansion-013.json',
  'java-expansion-014.json',
  'java-expansion-015.json',
  'java-expansion-016.json',
  'java-expansion-017.json',
  'java-expansion-018.json',
  'java-expansion-019.json',
  'java-expansion-020.json',
  'java-expansion-021.json',
  'java-expansion-022.json',
  'java-expansion-023.json'
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
