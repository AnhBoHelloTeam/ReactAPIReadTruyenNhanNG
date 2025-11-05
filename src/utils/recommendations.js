const HISTORY_KEY = 'readingHistory';

export const getRecommendations = (currentComic, limit = 8) => {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    
    if (history.length === 0) return [];
    
    // Get all categories from reading history
    const allCategories = [];
    history.forEach(comic => {
      if (comic.category && Array.isArray(comic.category)) {
        comic.category.forEach(cat => {
          if (!allCategories.find(c => c.name === cat.name)) {
            allCategories.push(cat);
          }
        });
      }
    });
    
    // Count category frequency
    const categoryFrequency = {};
    allCategories.forEach(cat => {
      categoryFrequency[cat.name] = history.filter(c => 
        c.category && c.category.some(cc => cc.name === cat.name)
      ).length;
    });
    
    // Sort by frequency
    const sortedCategories = Object.entries(categoryFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
    
    return {
      topCategories: sortedCategories,
      totalRead: history.length,
      uniqueCategories: allCategories.length
    };
  } catch (e) {
    console.error('Error getting recommendations', e);
    return {
      topCategories: [],
      totalRead: 0,
      uniqueCategories: 0
    };
  }
};

export const getSimilarComics = (currentComic, allComics = []) => {
  try {
    if (!currentComic || !currentComic.category || allComics.length === 0) {
      return [];
    }
    
    const currentCategories = currentComic.category.map(c => c.name);
    
    // Find comics with similar categories
    const similar = allComics
      .filter(comic => 
        comic.slug !== currentComic.slug &&
        comic.category &&
        comic.category.some(cat => currentCategories.includes(cat.name))
      )
      .map(comic => {
        // Calculate similarity score
        const comicCategories = comic.category.map(c => c.name);
        const commonCategories = comicCategories.filter(c => currentCategories.includes(c));
        const score = commonCategories.length / Math.max(currentCategories.length, comicCategories.length);
        
        return { ...comic, similarity: score };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 8);
    
    return similar;
  } catch (e) {
    console.error('Error getting similar comics', e);
    return [];
  }
};

export const getRecentlyViewed = (limit = 8) => {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    return history.slice(0, limit);
  } catch (e) {
    console.error('Error getting recently viewed', e);
    return [];
  }
};
