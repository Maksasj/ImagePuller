document.getElementById('downloadBtn').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.url.startsWith("chrome://")) {
      console.error("Cannot run extensions on Chrome internal pages.");
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: "get_images" }, (response) => {
        console.log("Received response from content script:", response);

      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError.message);
        alert("Please refresh the page and try again.");
        return;
      }

      if (response && response.urls.length > 0) {
        console.log(`Found ${response.urls.length} images. Starting download...`);
        
        response.urls.forEach((url, index) => {
          chrome.downloads.download({
            url: url,
            filename: `image_${index + 1}.jpg`,
            conflictAction: 'uniquify'
          });
        });
      } else {
        console.log("No images found.");
      }
    });
  } catch (err) {
    console.error("External Error:", err);
  }
});