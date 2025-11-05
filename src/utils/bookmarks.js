const BOOKMARKS_KEY = 'pageBookmarks';

export const getBookmarks = (slug, chapterId) => {
  try {
    const bookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || {};
    return bookmarks[`${slug}_${chapterId}`] || [];
  } catch (e) {
    console.error('Error getting bookmarks', e);
    return [];
  }
};

export const addBookmark = (slug, chapterId, pageNumber, imageUrl) => {
  try {
    const bookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || {};
    const key = `${slug}_${chapterId}`;
    if (!bookmarks[key]) bookmarks[key] = [];
    
    const bookmark = {
      pageNumber,
      imageUrl,
      timestamp: Date.now(),
      note: ''
    };
    
    bookmarks[key].push(bookmark);
    bookmarks[key].sort((a, b) => a.pageNumber - b.pageNumber);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return bookmarks[key];
  } catch (e) {
    console.error('Error adding bookmark', e);
    return [];
  }
};

export const removeBookmark = (slug, chapterId, pageNumber) => {
  try {
    const bookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || {};
    const key = `${slug}_${chapterId}`;
    if (bookmarks[key]) {
      bookmarks[key] = bookmarks[key].filter(b => b.pageNumber !== pageNumber);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    }
    return bookmarks[key] || [];
  } catch (e) {
    console.error('Error removing bookmark', e);
    return [];
  }
};

export const updateBookmarkNote = (slug, chapterId, pageNumber, note) => {
  try {
    const bookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || {};
    const key = `${slug}_${chapterId}`;
    if (bookmarks[key]) {
      const bookmark = bookmarks[key].find(b => b.pageNumber === pageNumber);
      if (bookmark) {
        bookmark.note = note;
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      }
    }
    return bookmarks[key] || [];
  } catch (e) {
    console.error('Error updating bookmark note', e);
    return [];
  }
};

export const shareChapter = (slug, chapterId, chapterName) => {
  const url = `${window.location.origin}/read/${slug}/${chapterId}`;
  const text = `Đang đọc: ${chapterName} - ${url}`;
  
  if (navigator.share) {
    navigator.share({
      title: chapterName,
      text: `Đang đọc: ${chapterName}`,
      url: url
    }).catch(() => {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      alert('Đã sao chép link vào clipboard!');
    });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
    alert('Đã sao chép link vào clipboard!');
  } else {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Đã sao chép link vào clipboard!');
  }
};

export const shareComic = (slug, comicName) => {
  const url = `${window.location.origin}/comics/${slug}`;
  const text = `Xem truyện: ${comicName} - ${url}`;
  
  if (navigator.share) {
    navigator.share({
      title: comicName,
      text: `Xem truyện: ${comicName}`,
      url: url
    }).catch(() => {
      navigator.clipboard.writeText(url);
      alert('Đã sao chép link vào clipboard!');
    });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
    alert('Đã sao chép link vào clipboard!');
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Đã sao chép link vào clipboard!');
  }
};
