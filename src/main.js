import './styles.css';
import { loadLocalizedContent } from './content-loader.js';
import { isArticleCompatible, parseVersionState, serializeVersionState } from './versioning.js';
import { searchArticles } from './search.js';

const fetchJson = async path => {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${response.status} ${path}`);
  return response.json();
};

const elements = {
  search: document.querySelector('#search-input'),
  version: document.querySelector('#version-select'),
  preview: document.querySelector('#preview-toggle'),
  locale: document.querySelector('#locale-select'),
  grid: document.querySelector('#article-grid'),
  summary: document.querySelector('#result-summary'),
  map: document.querySelector('#learning-map'),
  articlesView: document.querySelector('#articles-view'),
  mapView: document.querySelector('#map-view'),
  tagline: document.querySelector('#tagline')
};

const state = {
  locale: new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'ja',
  version: parseVersionState(location.search),
  includePreview: new URLSearchParams(location.search).get('preview') === '1',
  query: new URLSearchParams(location.search).get('q') ?? '',
  articles: [],
  learningMap: null
};

function syncUrl() {
  const params = new URLSearchParams();
  const version = serializeVersionState(state.version);
  if (version) params.set('version', String(state.version));
  if (state.locale !== 'ja') params.set('lang', state.locale);
  if (state.includePreview) params.set('preview', '1');
  if (state.query) params.set('q', state.query);
  history.replaceState(null, '', params.size ? `?${params}` : location.pathname);
}

function renderArticles() {
  const compatible = state.articles.filter(article => isArticleCompatible(article, state.version, { includePreview: state.includePreview }));
  const matches = searchArticles(compatible, state.query);
  elements.summary.textContent = state.locale === 'ja' ? `${matches.length}件の記事` : `${matches.length} articles`;
  elements.grid.replaceChildren(...matches.map(article => {
    const card = document.createElement('article');
    card.className = 'card';
    const badges = document.createElement('div');
    badges.className = 'badges';
    for (const text of [article.type, `Java ${article.since}+`, article.status !== 'standard' ? article.status : null].filter(Boolean)) {
      const span = document.createElement('span'); span.className = 'badge'; span.textContent = text; badges.append(span);
    }
    const title = document.createElement('h2'); title.textContent = article.title;
    const short = document.createElement('p'); short.textContent = article.short;
    card.append(badges, title, short);
    const codeText = article.code ?? article.good ?? article.bad;
    if (codeText) { const pre = document.createElement('pre'); pre.className = 'code'; pre.textContent = codeText; card.append(pre); }
    return card;
  }));
}

function renderMap() {
  elements.map.replaceChildren(...(state.learningMap?.chapters ?? []).map(chapter => {
    const section = document.createElement('section'); section.className = 'chapter';
    const title = document.createElement('h2'); title.textContent = chapter.title[state.locale] ?? chapter.id;
    const nodes = document.createElement('div'); nodes.className = 'nodes';
    for (const node of chapter.nodes ?? []) {
      const article = state.articles.find(item => item.id === node.articleId);
      const div = document.createElement('div'); div.className = `node ${node.kind}`; div.textContent = article?.title ?? node.articleId; nodes.append(div);
    }
    section.append(title, nodes); return section;
  }));
}

async function reloadLocale() {
  state.articles = await loadLocalizedContent({ fetchJson, locale: state.locale });
  elements.tagline.textContent = state.locale === 'ja' ? 'Javaのコード例、例外、コンパイルエラーをひとつに。' : 'Java code, exceptions, and compiler diagnostics in one atlas.';
  renderArticles(); renderMap(); syncUrl();
}

elements.search.value = state.query;
elements.version.value = state.version == null ? 'all' : String(state.version);
elements.preview.checked = state.includePreview;
elements.locale.value = state.locale;

elements.search.addEventListener('input', event => { state.query = event.target.value.trim(); renderArticles(); syncUrl(); });
elements.version.addEventListener('change', event => { state.version = event.target.value === 'all' ? null : Number(event.target.value); renderArticles(); syncUrl(); });
elements.preview.addEventListener('change', event => { state.includePreview = event.target.checked; renderArticles(); syncUrl(); });
elements.locale.addEventListener('change', async event => { state.locale = event.target.value; await reloadLocale(); });

document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(item => item.classList.toggle('active', item === button));
  const showMap = button.dataset.view === 'map'; elements.articlesView.hidden = showMap; elements.mapView.hidden = !showMap;
}));

state.learningMap = await fetchJson('./content/learning-map.json');
await reloadLocale();
