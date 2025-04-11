// Basic background script structure
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "requestJobDataFromTab" && sender.tab) {
      if (sender.tab?.id !== undefined) {
          chrome.tabs.sendMessage(sender.tab.id, { action: "getJobData" }, (response) => {
              if (chrome.runtime.lastError) {
                  // Handle error (e.g., content script not injected yet)
                  sendResponse({ error: chrome.runtime.lastError.message });
              } else {
                  sendResponse(response);
              }
          });
      } else {
          sendResponse({ error: "Tab ID is undefined" });
      }
      return true; // Indicates you will send a response asynchronously
  }
});

export {};

