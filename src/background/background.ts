// Listen for the onInstalled event and open a new tab with the login page URL if the extension was just installed
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') {
        chrome.tabs.create({ url: 'https://tabstacker.vercel.app/' });
    }
});

// Define the base URL of the backend API and initialize variables for the user ID and name
const baseUrl = 'https://tabstacker-backend.onrender.com';
let userId;
let userName;

// Get the user's token from Chrome's local storage and call the API to retrieve the user's details
let tokenFirst;
getToken();
function getToken() {
    chrome.storage.local.get(["token"], function (result) {
        console.log("Value currently is " + result.token);
        tokenFirst = result.token;
        if (tokenFirst) {
            makeAPICall(tokenFirst);
            console.log("the token is from local storage call api done", tokenFirst)
        }
    });
}

// Send a message to the content script to get saved tab data
let ShowsavedDataResponse;
chrome.runtime.sendMessage({ type: "getData", ShowsavedDataResponse });

// Listen for messages from the content script to get the user's token and call the API to retrieve the user's details
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === "getToken") {
        const token = message.token;
        chrome.storage.local.set({ token: token });
        console.log("Token from the webpage:", token);
        makeAPICall(token);
    }
});

// Define the URL of the API endpoint for retrieving user details
const apiUrl = `${baseUrl}/user/getuserdetail`;

// Call the API to retrieve the user's details using the token
function makeAPICall(token) {
    fetch(`${apiUrl}?token=${token}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            const { _id, fullname, email } = data;
            console.log('User ID:', _id);
            console.log('Name:', fullname);
            console.log('Email:', email);
            userId = _id;
            userName = fullname;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Listen for messages from the popup or content scripts to send tab data to the backend
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("action fired in background", message.action, userId)
    if (message.action === 'sendTabToBackend') {
        if (!userId) {
            makeAPICall(tokenFirst);
        }
        const { tabId, tabUrl, tabTitle, currentFolder } = message;
        console.log("tabId, tabUrl, tabTitle", tabId, tabUrl, tabTitle)
        // Send the tab data to the backend
        sendTabDataToBackend(tabId, tabUrl, tabTitle, currentFolder)
            .then((response) => {
                if (response.success) {
                    sendResponse({ success: true });
                } else {
                    sendResponse({ success: false, error: 'Failed to send tab data to the backend.' });
                }
            })
            .catch((error) => {
                console.error('Error sending tab data to the backend:', error);
                sendResponse({ success: false, error: 'Error sending tab data to the backend.' });
            });

        // Return true to indicate that you will send a response asynchronously
        return true;
    }
});

// Function to send tab data to the backend
async function sendTabDataToBackend(tabId, url, title, currentFolder) {
    const backendEndpoint = `${baseUrl}/usertabs/addtab/${userId}/${currentFolder}`;
    const token = await chrome.storage.local.get(["token"]);
    console.log(tabId, url, title, token.token, currentFolder)
    const data = {
        tabId: tabId,
        url: url,
        title: title,
    };

    // Send a POST request to your backend
    return fetch(backendEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token.token}`, // Include the token in the Authorization header

        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .catch((error) => {
            throw error;
        });
}

// Listen for messages from the popup or content scripts to show saved tabs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'showSavedTabs') {
        console.log("showSavedTabs running in background")
        if (!userId) {
            makeAPICall(tokenFirst);
        }
        const { currentFolder } = message;
        // Send a GET request to the backend to retrieve saved tabs
        showSavedTabs(currentFolder)
            .then((response) => {
                console.log("response from background", response);
                ShowsavedDataResponse = response;
                console.log("ShowsavedDataResponse", ShowsavedDataResponse)
                // Send the response to the popup
                chrome.runtime.sendMessage({ action: 'sendDataToPopup', data: ShowsavedDataResponse });
                if (response.success) {
                    sendResponse({ success: true });
                } else {
                    sendResponse({ success: false, error: 'Failed to send tab data to the backend.' });
                }
            })
            .catch((error) => {
                console.error('Error sending tab data to the backend:', error);
                sendResponse({ success: false, error: 'Error sending tab data to the backend.' });
            });
        // Return true to indicate that you will send a response asynchronously
        return true;
    }
});

// Function to send a GET request to the backend to retrieve saved tabs
async function showSavedTabs(currentFolder) {
    const backendEndpoint = `${baseUrl}/usertabs/gettabs/${userId}/${currentFolder}`;
    const token = await chrome.storage.local.get(["token"]);
    console.log(token.token, currentFolder)
    console.log("userId", userId)
    // Send a GET request to your backend
    return fetch(backendEndpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token.token}`, // Include the token in the Authorization header
        },
    })
        .then((response) => response.json())
        .catch((error) => {
            throw error;
        });
}

// Listen for messages from the popup or content scripts to show delete tabs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'deleteTabFromBackend') {
        console.log("deleteTabFromBackend running in background")
        if (!userId) {
            makeAPICall(tokenFirst);
        }
        const { tabID, currentFolder } = message;
        console.log(message)
        // Send a GET request to the backend to retrieve saved tabs
        deleteTabs(tabID, currentFolder)
            .then((response) => {
                console.log("response from background", response);
                // Send a GET request to the backend to retrieve saved tabs
                showSavedTabs(currentFolder)
                    .then((response) => {
                        console.log("response from background", response);
                        ShowsavedDataResponse = response;
                        console.log("ShowsavedDataResponse", ShowsavedDataResponse)
                        // Send the response to the popup
                        chrome.runtime.sendMessage({ action: 'sendDataToPopup', data: ShowsavedDataResponse });
                        chrome.runtime.sendMessage({ action: 'deletedSuccessFully ', data: ShowsavedDataResponse });
                        if (response.success) {
                            sendResponse({ success: true });
                        } else {
                            sendResponse({ success: false, error: 'Failed to send tab data to the backend.' });
                        }
                    })
                    .catch((error) => {
                        console.error('Error sending tab data to the backend:', error);
                        sendResponse({ success: false, error: 'Error sending tab data to the backend.' });
                    });
                if (response.success) {
                    sendResponse({ success: true });
                } else {
                    sendResponse({ success: false, error: 'Failed to send tab data to the backend.' });
                }
            })
            .catch((error) => {
                console.error('Error sending tab data to the backend:', error);
                sendResponse({ success: false, error: 'Error sending tab data to the backend.' });
            });
        // Return true to indicate that you will send a response asynchronously
        return true;
    }
});
// Function to send a GET request to the backend to retrieve delete tabs
async function deleteTabs(tabID, currentFolder) {
    // https://tabstacker-backend.onrender.com/usertabs/deletetab/64fc64751abeaef4f86236ff/0/1942898276
    const backendEndpoint = `${baseUrl}/usertabs/deletetab/${userId}/${currentFolder}/${tabID}`;
    const token = await chrome.storage.local.get(["token"]);
    console.log(token.token, currentFolder)
    console.log("userId", userId)
    // Send a GET request to your backend
    return fetch(backendEndpoint, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token.token}`, // Include the token in the Authorization header
        },
    })
        .then((response) => response.json())
        .catch((error) => {
            throw error;
        });
}

// Listen for connections from content scripts and send data to them
chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((message) => {
        if (message.action === 'requestDataFromBackground') {
            console.log('Received requestDataFromBackground message from content script');

            // Fetch data from storage and all currently opened tabs
            chrome.storage.sync.get(['arrayOfMainWebsites'], (result) => {
                if (!chrome.runtime.lastError) {
                    const arrayOfMainWebsites = result.arrayOfMainWebsites || [];
                    console.log('Fetched arrayOfMainWebsites:', arrayOfMainWebsites);

                    chrome.tabs.query({}, (tabs) => {
                        console.log('Fetched all currently opened tabs:', tabs);
                        // Send data to the content script
                        port.postMessage({ arrayOfMainWebsites, tabs });
                        console.log('Sent arrayOfMainWebsites and tabs to content script');
                    });
                } else {
                    console.error('Error fetching data from storage:', chrome.runtime.lastError);
                }
            });
        }
    });
});

// Establish a connection with content scripts and send a message to request data
chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
        const port = chrome.tabs.connect(tab.id, { name: 'content-script' });
        console.log('Established connection with content script in tab', tab.id);

        port.postMessage({ action: 'requestDataFromBackground' });
        console.log('Sent requestDataFromBackground message to content script in tab', tab.id);
    }
});



// Listen for messages from the popup or content scripts to show delete tabs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'trackClick') {
        console.log("trackClick running in background")
        if (!userId) {
            makeAPICall(tokenFirst);
        }
        const { tabId, currentFolder } = message;
        console.log(message)
        console.log("tabID, currentFolder", tabId, currentFolder)
        // Send a GET request to the backend to retrieve saved tabs
        trackClick(tabId, currentFolder)
            .then((response) => {
                console.log("response from background", response);
                if (response.success) {
                    sendResponse({ success: true });
                } else {
                    sendResponse({ success: false, error: 'Failed to send tab data to the backend.' });
                }
            })
            .catch((error) => {
                console.error('Error sending tab data to the backend:', error);
                sendResponse({ success: false, error: 'Error sending tab data to the backend.' });
            });
        // Return true to indicate that you will send a response asynchronously
        return true;
    }
});
// Function to send a GET request to the backend to retrieve delete tabs
async function trackClick(tabId, currentFolder) {
    // /track-click/:userId/:folderId/:tabId
    // https://tabstacker-backend.onrender.com/usertabs/track-click/64fc64751abeaef4f86236ff/0/1942906336
    const backendEndpoint = `${baseUrl}/usertabs/track-click/${userId}/${currentFolder}/${tabId}`;
    const token = await chrome.storage.local.get(["token"]);
    console.log("token.token, currentFolder, tabID", token.token, currentFolder, tabId)
    // Send a GET request to your backend
    return fetch(backendEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token.token}`, // Include the token in the Authorization header
        },
    })
        .then((response) => response.json())
        .catch((error) => {
            throw error;
        });
}