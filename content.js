class VideoController {
  constructor() {
    this.setupMessageListener();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getVideoInfo') {
        const videoInfo = this.getVideoInfo();
        sendResponse(videoInfo);
      }
      return true;
    });
  }

  getVideoInfo() {
    let video;
    if (window.location.hostname.includes('youtube.com')) {
      video = document.querySelector('video.html5-main-video');
    } else if (window.location.hostname.includes('vimeo.com')) {
      video = document.querySelector('video');
    }

    if (!video) return null;

    return {
      url: window.location.href.split('&t=')[0], // Remove any existing timestamp
      timestamp: video.currentTime,
      title: document.title
    };
  }
}

new VideoController(); 