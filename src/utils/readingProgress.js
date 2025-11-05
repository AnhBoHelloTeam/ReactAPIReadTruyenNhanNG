const READING_PROGRESS_KEY = 'readingProgress';

export const getReadingProgress = (slug, chapterId) => {
  try {
    const progress = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY)) || {};
    return progress[`${slug}_${chapterId}`] || 0;
  } catch (e) {
    console.error('Error getting reading progress', e);
    return 0;
  }
};

export const saveReadingProgress = (slug, chapterId, percentage) => {
  try {
    const progress = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY)) || {};
    progress[`${slug}_${chapterId}`] = Math.max(0, Math.min(100, percentage));
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving reading progress', e);
  }
};

export const getComicProgress = (slug) => {
  try {
    const progress = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY)) || {};
    const comicKeys = Object.keys(progress).filter(key => key.startsWith(`${slug}_`));
    if (comicKeys.length === 0) return 0;
    
    const total = comicKeys.reduce((sum, key) => sum + progress[key], 0);
    return Math.round(total / comicKeys.length);
  } catch (e) {
    console.error('Error getting comic progress', e);
    return 0;
  }
};

export const getReadingStats = () => {
  try {
    const progress = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY)) || {};
    const totalChapters = Object.keys(progress).length;
    const completedChapters = Object.values(progress).filter(p => p >= 90).length;
    const totalProgress = Object.values(progress).reduce((sum, p) => sum + p, 0);
    const avgProgress = totalChapters > 0 ? Math.round(totalProgress / totalChapters) : 0;
    
    return {
      totalChapters,
      completedChapters,
      avgProgress,
      totalProgress: Math.round(totalProgress / 100)
    };
  } catch (e) {
    console.error('Error getting reading stats', e);
    return {
      totalChapters: 0,
      completedChapters: 0,
      avgProgress: 0,
      totalProgress: 0
    };
  }
};
