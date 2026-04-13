async function getImages(tab, selectedTypes) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id, { action: "get_images", fileTypes: selectedTypes }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
        return;
      }
      resolve(response.urls || []);
    });
  });
}

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

    const urls = await getImages(tab, selectedTypes);

    if (urls.length > 0) {
      console.log(`Found ${urls.length} images. Starting download...`);
      
      // Get target folder
      const folder = document.getElementById('folder').value.trim();

      urls.forEach((url, index) => {
        // Extract actual filename from URL
        let filename = `image_${index + 1}.jpg`; // fallback
        try {
          const urlObj = new URL(url);
          const pathname = urlObj.pathname;
          const filenameFromUrl = pathname.split('/').pop();
          if (filenameFromUrl && filenameFromUrl.includes('.')) {
            filename = filenameFromUrl;
          } else {
            // If no extension, use the extracted ext
            let ext = 'jpg';
            const extFromPath = pathname.split('.').pop().toLowerCase();
            if (extFromPath && extFromPath.length < 10) { // reasonable extension length
              ext = extFromPath;
            }
            filename = `${filenameFromUrl || 'image_' + (index + 1)}.${ext}`;
          }
        } catch (e) {
          // fallback to default
        }

        // Prepend folder if specified
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
  } catch (err) {
    console.error("External Error:", err);
  }
});

document.getElementById('eagleBtn').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.url.startsWith("chrome://")) {
      console.error("Cannot run extensions on Chrome internal pages.");
      return;
    }

    // Get selected file types
    const fileTypeCheckboxes = document.querySelectorAll('#filetypes input[type="checkbox"]:checked');
    const selectedTypes = Array.from(fileTypeCheckboxes).map(cb => cb.value.toLowerCase());

    const urls = await getImages(tab, selectedTypes);

    if (urls.length > 0) {
      console.log(`Found ${urls.length} images. Adding to Eagle...`);

      // Prepare data for Eagle API
      const items = urls.map((url, index) => {
        // Extract filename for Eagle name
        let filename = `image_${index + 1}`;
        try {
          const urlObj = new URL(url);
          const pathname = urlObj.pathname;
          const filenameFromUrl = pathname.split('/').pop();
          if (filenameFromUrl) {
            filename = filenameFromUrl.split('.')[0]; // remove extension for name
          }
        } catch (e) {
          // fallback
        }

        return {
          url: url,
          name: `${tab.title} - ${filename}`,
          website: tab.url,
          tags: ["ImagePuller"]
        };
      });

      const data = { items: items };

      // Send to Eagle API
      try {
        const response = await fetch('http://localhost:41595/api/item/addFromURLs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.status === 'success') {
          alert(`Successfully added ${urls.length} images to Eagle!`);
        } else {
          alert('Failed to add images to Eagle. Make sure Eagle app is running.');
        }
      } catch (error) {
        console.error('Eagle API error:', error);
        alert('Failed to connect to Eagle. Make sure Eagle app is running and API is enabled.');
      }
    } else {
      console.log("No images found.");
    }
  } catch (err) {
    console.error("External Error:", err);
  }
});