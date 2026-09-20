export function searchArticles(articles, query) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return articles;
  return articles.filter(article => {
    const haystack = [article.id, article.title, article.short, ...(article.tags ?? []), ...(article.topics ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase();
    return haystack.includes(needle);
  });
}
