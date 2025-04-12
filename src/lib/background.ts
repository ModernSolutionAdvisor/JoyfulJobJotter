// background.ts

// Function to inject content script
async function injectContentScript(tabId: number) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']  // Make sure this matches your built file name
    });
    console.log('Content script injected successfully');
  } catch (err) {
    console.error('Failed to inject content script:', err);
  }
}

// Listen for tab updates to inject the content script when needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if the URL matches job sites
    const jobSitePatterns = [
      /linkedin\.com/i,
      /indeed\.com/i,
      /glassdoor\.com/i
      // Add more job site patterns here
    ];

    if (jobSitePatterns.some(pattern => pattern.test(tab.url!))) {
      injectContentScript(tabId);
    }
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "requestJobDataFromTab" && sender.tab) {
    if (sender.tab?.id !== undefined) {
      chrome.tabs.sendMessage(
        sender.tab.id, 
        { action: "getJobData" }, 
        (response) => {
          if (chrome.runtime.lastError) {
            // If content script isn't ready, inject it and retry
            injectContentScript(sender.tab!.id!).then(() => {
              // Retry the message after injection
              chrome.tabs.sendMessage(sender.tab!.id!, { action: "getJobData" }, sendResponse);
            });
          } else {
            sendResponse(response);
          }
        }
      );
    } else {
      sendResponse({ error: "Tab ID is undefined" });
    }
    return true;
  }
});