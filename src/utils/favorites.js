const KEY = 'favorites';

export const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch (_) {
    return [];
  }
};

export const saveFavorites = (list) => {
  localStorage.setItem(KEY, JSON.stringify(list));
};

export const isFavorite = (slug) => {
  return getFavorites().some((c) => c.slug === slug);
};

export const addFavorite = (comic) => {
  const list = getFavorites();
  if (list.some((c) => c.slug === comic.slug)) return list;
  const next = [comic, ...list].slice(0, 100);
  saveFavorites(next);
  return next;
};

export const removeFavorite = (slug) => {
  const list = getFavorites().filter((c) => c.slug !== slug);
  saveFavorites(list);
  return list;
};

export const toggleFavorite = (comic) => {
  if (isFavorite(comic.slug)) {
    return removeFavorite(comic.slug);
  }
  return addFavorite(comic);
};


