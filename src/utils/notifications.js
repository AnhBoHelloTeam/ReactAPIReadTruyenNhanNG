const NOTIFICATIONS_KEY = 'chapterNotifications';
const LAST_CHECK_KEY = 'lastNotificationCheck';

export const checkForNewChapters = async (favorites, apiClient) => {
  try {
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
    const lastCheckTime = lastCheck ? parseInt(lastCheck) : Date.now() - 24 * 60 * 60 * 1000; // Default to 24h ago
    
    const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)) || {};
    const updatedNotifications = { ...notifications };
    let hasNew = false;

    for (const comic of favorites) {
      try {
        const res = await apiClient.get(`/truyen-tranh/${comic.slug}`);
        const chapters = res?.data?.data?.item?.chapters?.[0]?.server_data || [];
        const latestChapter = chapters[0];
        
        if (latestChapter) {
          const lastReadChapter = updatedNotifications[comic.slug]?.lastReadChapter || '';
          const latestChapterId = latestChapter.chapter_api_data || latestChapter.chapter_name;
          
          // Check if there's a new chapter
          if (latestChapterId !== lastReadChapter && chapters.length > 0) {
            const lastReadIndex = lastReadChapter 
              ? chapters.findIndex(c => (c.chapter_api_data || c.chapter_name) === lastReadChapter)
              : -1;
            
            if (lastReadIndex === -1 || lastReadIndex > 0) {
              updatedNotifications[comic.slug] = {
                hasNew: true,
                lastReadChapter: lastReadChapter || latestChapterId,
                latestChapter: latestChapterId,
                latestChapterName: latestChapter.chapter_name || 'Chương mới',
                updatedAt: Date.now()
              };
              hasNew = true;
            }
          } else {
            updatedNotifications[comic.slug] = {
              ...updatedNotifications[comic.slug],
              hasNew: false
            };
          }
        }
      } catch (e) {
        console.error(`Error checking ${comic.slug}:`, e);
      }
    }

    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    localStorage.setItem(LAST_CHECK_KEY, String(Date.now()));
    
    return { notifications: updatedNotifications, hasNew };
  } catch (e) {
    console.error('Error checking for new chapters', e);
    return { notifications: {}, hasNew: false };
  }
};

export const markAsRead = (slug) => {
  try {
    const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)) || {};
    if (notifications[slug]) {
      notifications[slug].hasNew = false;
      notifications[slug].lastReadChapter = notifications[slug].latestChapter;
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
  } catch (e) {
    console.error('Error marking as read', e);
  }
};

export const getNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)) || {};
  } catch (e) {
    console.error('Error getting notifications', e);
    return {};
  }
};

export const hasNewChapters = (slug) => {
  const notifications = getNotifications();
  return notifications[slug]?.hasNew || false;
};

export const getNewChaptersCount = () => {
  const notifications = getNotifications();
  return Object.values(notifications).filter(n => n.hasNew).length;
};
