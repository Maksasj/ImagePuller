// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "get_images") {
    const images = Array.from(document.querySelectorAll('img'));
    let imageUrls = images
      .map(img => img.src)
      .filter(src => src && src.startsWith('http')); // Ignore base64/invalid tags

    // Filter by file types if specified
    if (request.fileTypes && request.fileTypes.length > 0) {
      imageUrls = imageUrls.filter(url => {
        try {
          const urlObj = new URL(url);
          const pathname = urlObj.pathname;
          const ext = pathname.split('.').pop().toLowerCase();
          return request.fileTypes.includes(ext);
        } catch (e) {
          return false;
        }
      });
    }
    
    sendResponse({ urls: imageUrls });
  }
});