document.getElementById('downloadBtn').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.url.startsWith("chrome://")) {
      console.error("Cannot run extensions on Chrome internal pages.");
      return;
    }

    // Get selected file types
    const fileTypeCheckboxes = document.querySelectorAll('#filetypes input[type="checkbox"]:checked');
    const selectedTypes = Array.from(fileTypeCheckboxes).map(cb => cb.value.toLowerCase());

    // Get target folder
    const folder = document.getElementById('folder').value.trim();

    chrome.tabs.sendMessage(tab.id, { action: "get_images", fileTypes: selectedTypes }, (response) => {
        console.log("Received response from content script:", response);

      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError.message);
        alert("Please refresh the page and try again.");
        return;
      }

      if (response && response.urls.length > 0) {
        console.log(`Found ${response.urls.length} images. Starting download...`);
        
        response.urls.forEach((url, index) => {
          // Extract extension from URL
          let ext = 'jpg';
          try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            ext = pathname.split('.').pop().toLowerCase() || 'jpg';
          } catch (e) {
            // fallback
          }

          // Build filename
          let filename = `image_${index + 1}.${ext}`;
          if (folder) {
            filename = `${folder}/${filename}`;
          }

          chrome.downloads.download({
            url: url,
            filename: filename,
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