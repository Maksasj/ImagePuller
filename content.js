// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "get_images") {
    const images = Array.from(document.querySelectorAll('img'));
    const imageUrls = images
      .map(img => img.src)
      .filter(src => src && src.startsWith('http')); // Ignore base64/invalid tags
    
    sendResponse({ urls: imageUrls });
  }
});