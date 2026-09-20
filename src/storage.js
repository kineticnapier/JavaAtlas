const FAVORITES_KEY = 'javaatlas:favorites';
const RECENTS_KEY = 'javaatlas:recents';

function readArray(storage, key) {
  try {
    const value = JSON.parse(storage.getItem(key) ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function createPersonalStore(storage = globalThis.localStorage) {
  return {
    getFavorites() { return readArray(storage, FAVORITES_KEY); },
    toggleFavorite(id) {
      const current = new Set(readArray(storage, FAVORITES_KEY));
      current.has(id) ? current.delete(id) : current.add(id);
      const next = [...current];
      storage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    },
    getRecents() { return readArray(storage, RECENTS_KEY); },
    pushRecent(id, limit = 24) {
      const next = [id, ...readArray(storage, RECENTS_KEY).filter(value => value !== id)].slice(0, limit);
      storage.setItem(RECENTS_KEY, JSON.stringify(next));
      return next;
    }
  };
}
