class VideoBookmark {
  constructor() {
    this.bookmarkBtn = document.getElementById('bookmarkBtn');
    this.bookmarksList = document.getElementById('bookmarksList');
    this.init();
  }

  init() {
    this.loadBookmarks();
    this.bookmarkBtn.addEventListener('click', () => this.addBookmark());
  }

  async loadBookmarks() {
    const { bookmarks = [] } = await chrome.storage.local.get('bookmarks');
    this.bookmarksList.innerHTML = '';
    
    bookmarks.forEach((bookmark, index) => {
      const card = this.createBookmarkCard(bookmark, index);
      this.bookmarksList.appendChild(card);
    });
  }

  createBookmarkCard(bookmark, index) {
    const card = document.createElement('div');
    card.className = 'bookmark-card';
    card.innerHTML = `
      <div class="bookmark-content">
        <div class="bookmark-title">${bookmark.title}</div>
        <div class="bookmark-timestamp">${this.formatTime(bookmark.timestamp)}</div>
      </div>
      <button class="delete-btn" data-index="${index}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
          <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
        </svg>
      </button>
    `;
    
    // Add click handler for opening the video
    card.querySelector('.bookmark-content').addEventListener('click', () => {
      chrome.tabs.create({
        url: `${bookmark.url}&t=${Math.floor(bookmark.timestamp)}s`
      });
    });

    // Add click handler for delete button
    card.querySelector('.delete-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const index = parseInt(e.currentTarget.dataset.index);
      const { bookmarks = [] } = await chrome.storage.local.get('bookmarks');
      bookmarks.splice(index, 1);
      await chrome.storage.local.set({ bookmarks });
      this.loadBookmarks();
    });

    return card;
  }

  formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    
    return parts.join(' ');
  }

  async addBookmark() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'getVideoInfo' }, async response => {
      if (!response) return;

      const { bookmarks = [] } = await chrome.storage.local.get('bookmarks');
      const newBookmark = {
        url: response.url,
        timestamp: response.timestamp,
        title: response.title,
        date: new Date().toISOString()
      };

      await chrome.storage.local.set({
        bookmarks: [...bookmarks, newBookmark]
      });

      this.loadBookmarks();
    });
  }
}

new VideoBookmark(); 