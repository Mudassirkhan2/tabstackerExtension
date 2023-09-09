

// Listener for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    // Save all currently opened tabs
    saveOpenTabs();
});
let tabData = [];
// Function to save all currently opened tabs
function saveOpenTabs() {
    chrome.tabs.query({}, (tabs) => {
        tabData = tabs.map((tab) => {
            return {
                title: tab.title,
                url: tab.url,
                tabId: tab.id,
            };
        });
        console.log("tabdata", tabData)
        // saveTabsToStorage(tabData);
    });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === "getToken") {
        // Access the token from localStorage in the content script
        const token = message.token;
        // Use the token for your purposes (e.g., send it in API requests)
        console.log("Token from the webpage:", token);
        // Call the function with the token
        makeAPICall(token);
    }
});

// Define the URL of your backend API endpoint
const apiUrl = 'http://localhost:8000/user/getuserdetail';
let userId;
let userName;
function makeAPICall(token) {
    console.log("hello")
    // Make the GET request with the token as a parameter
    fetch(`${apiUrl}?token=${token}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            //   Handle the response data containing userid, name, and email
            const { _id, fullname, email } = data;
            console.log('User ID:', _id);
            console.log('Name:', fullname);
            console.log('Email:', email);
            userId = _id;
            userName = fullname;
            // sendSavedTabsToBackend(tabData, userId, userName);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}



// Listener for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSavedTabs') {
        getSavedTabsFromStorage(sendResponse);
    } else if (request.action === 'saveTabs') {
        saveTabsToStorage(request.tabData, sendResponse);
    }
    return true; // Required for sendResponse to work asynchronously
});

// Function to retrieve saved tab data from storage
function getSavedTabsFromStorage(sendResponse) {
    chrome.storage.local.get('savedTabs', (result) => {
        const savedTabs = result.savedTabs || [];
        console.log("saved tabs", savedTabs)
        sendResponse({ tabData: savedTabs });
    });
}
async function sendSavedTabsToBackend(savedTabs, userId, userName) {
    const userData = {
        userId: userId,
        userName: userName,
        folderId: 'folder123',
        tabs: savedTabs,
    };
    const backendUrl = "http://localhost:8000/usertabs/savetabs"; // Replace with your backend URL and API endpoint
    const token = await chrome.storage.local.get(["token"]);
    console.log(token.token)
    // Make a POST request to send the saved tabs data
    fetch(backendUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json", // Set the content type to JSON
            "Authorization": `Bearer ${token.token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify(userData), // Convert savedTabs to JSON
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Saved tabs sent to backend:", data);
            // Handle the response from the backend if needed
        })
        .catch(error => {
            console.error("Error sending saved tabs to backend:", error);
        });
}

// Listener for when a tab is closed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    // Update saved tab data after a tab is closed
    updateSavedTabsAfterClosure(tabId);
});

// Function to update saved tab data after a tab is closed
function updateSavedTabsAfterClosure(closedTabId) {
    chrome.storage.local.get('savedTabs', (result) => {
        const savedTabs = result.savedTabs || [];
        const updatedTabs = savedTabs.filter(tab => tab.tabId !== closedTabId);
        chrome.storage.local.set({ 'savedTabs': updatedTabs });
    });
}

// Function to save tab data to storage
function saveTabsToStorage(tabData, sendResponse) {
    chrome.storage.local.set({ 'savedTabs': tabData }, () => {
        sendResponse({ success: true });
    });
}

// Create a map to track whether a tab's URL has loaded
const tabsLoadingMap = {};

// Listener for when a new tab is created
chrome.tabs.onCreated.addListener((tab) => {
    // Mark the tab as loading
    tabsLoadingMap[tab.id] = true;
});

// Listener for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (tabsLoadingMap[tabId] && changeInfo.status === 'complete') {
        // Update saved tab data after a new tab is created and the URL is loaded
        updateSavedTabsOnNewTabCreation(tabId);

        // Remove the tab from the loading map
        delete tabsLoadingMap[tabId];
    }
});



// Function to update saved tab data after a new tab is created
function updateSavedTabsOnNewTabCreation(newTabId) {
    chrome.tabs.get(newTabId, (tab) => {
        if (tab) {
            const newTab = {
                tabId: tab.id,
                title: tab.title,
                url: tab.url,
            };
            chrome.storage.local.get('savedTabs', (result) => {
                const savedTabs = result.savedTabs || [];
                const updatedTabs = [...savedTabs, newTab];
                chrome.storage.local.set({ 'savedTabs': updatedTabs });
            });
        }
    });
}



// Listener for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        // Update saved tab data after the tab's URL changes
        updateSavedTabsOnURLChange(tabId, changeInfo.url);
    }
});



// Function to update saved tab data after a tab's URL changes
function updateSavedTabsOnURLChange(tabId, newUrl) {
    console.log(tabId, newUrl);
    chrome.tabs.get(tabId, (tab) => {
        if (tab) {
            const updatedTab = {
                tabId: tab.id,
                title: tab.title,
                url: newUrl, // Use the new URL from the event
            };

            chrome.storage.local.get('savedTabs', (result) => {
                const savedTabs = result.savedTabs || [];
                const updatedTabs = savedTabs.map((savedTab) => {
                    if (savedTab.tabId === tabId) {
                        return updatedTab;
                    }
                    return savedTab;
                });
                chrome.storage.local.set({ 'savedTabs': updatedTabs });
            });
        }
    });
}
// chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
//     // Remove the closed tab from the displayedUrls set
//     const removedTab = tabData.find(tab => tab.tabId === tabId);
//     if (removedTab) {
//         displayedUrls.delete(removedTab.url);
//         // Update your tabData array to remove the closed tab
//         tabData = tabData.filter(tab => tab.tabId !== tabId);
//         // Update the displayed tab list
//         displaySavedTabs(tabData);
//         // Update the displayed tab list in the popup
//         chrome.runtime.sendMessage({ action: 'updateTabList', tabData });
//     }
// });
gettingtoken();
async function gettingtoken() {
    const token = await chrome.storage.local.get(["token"]);
    console.log(token.token)
}