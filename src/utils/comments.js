const COMMENTS_KEY = 'comicComments';

export const getComments = (slug, chapterId) => {
  try {
    const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY)) || {};
    const key = chapterId ? `${slug}_${chapterId}` : slug;
    return comments[key] || [];
  } catch (e) {
    console.error('Error getting comments', e);
    return [];
  }
};

export const addComment = (slug, chapterId, comment) => {
  try {
    const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY)) || {};
    const key = chapterId ? `${slug}_${chapterId}` : slug;
    if (!comments[key]) comments[key] = [];
    
    const newComment = {
      id: Date.now().toString(),
      text: comment,
      author: 'Anonymous',
      timestamp: Date.now(),
      likes: 0
    };
    
    comments[key].unshift(newComment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    return comments[key];
  } catch (e) {
    console.error('Error adding comment', e);
    return [];
  }
};

export const deleteComment = (slug, chapterId, commentId) => {
  try {
    const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY)) || {};
    const key = chapterId ? `${slug}_${chapterId}` : slug;
    if (comments[key]) {
      comments[key] = comments[key].filter(c => c.id !== commentId);
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    }
    return comments[key] || [];
  } catch (e) {
    console.error('Error deleting comment', e);
    return [];
  }
};

export const likeComment = (slug, chapterId, commentId) => {
  try {
    const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY)) || {};
    const key = chapterId ? `${slug}_${chapterId}` : slug;
    if (comments[key]) {
      const comment = comments[key].find(c => c.id === commentId);
      if (comment) {
        comment.likes = (comment.likes || 0) + 1;
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
      }
    }
    return comments[key] || [];
  } catch (e) {
    console.error('Error liking comment', e);
    return [];
  }
};
