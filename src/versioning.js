export const SUPPORTED_JAVA_VERSIONS = [8, 11, 17, 21, 25, 27];

export function isArticleCompatible(article, version, { includePreview = false } = {}) {
  if (version == null) return includePreview || article.status !== 'preview';
  if (!SUPPORTED_JAVA_VERSIONS.includes(Number(version))) return false;
  if (article.status === 'preview' && !includePreview) return false;
  if (Number(article.since) > Number(version)) return false;
  if (article.until != null && Number(version) > Number(article.until)) return false;
  return true;
}

export function parseVersionState(search) {
  const params = new URLSearchParams(search || '');
  const raw = params.get('version');
  if (raw == null || raw === '' || raw === 'all') return null;
  const version = Number(raw);
  return SUPPORTED_JAVA_VERSIONS.includes(version) ? version : null;
}

export function serializeVersionState(version) {
  if (version == null) return '';
  const numeric = Number(version);
  return SUPPORTED_JAVA_VERSIONS.includes(numeric) ? `version=${numeric}` : '';
}
