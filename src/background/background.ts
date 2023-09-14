chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') {
        // Open a new tab with the login page URL
        chrome.tabs.create({ url: 'https://tabstacker.vercel.app/' });
    }
});
// const baseUrl = 'https://tabstacker-backend.onrender.com';
// local host base url
const baseUrl = 'http://localhost:8000';
let userId;
let userName;
// get token from chrome storage
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
let ShowsavedDataResponse;
chrome.runtime.sendMessage({ type: "getData", ShowsavedDataResponse });


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === "getToken") {
        // Access the token from localStorage in the content script
        const token = message.token;
        chrome.storage.local.set({ token: token });
        console.log("Token from the webpage:", token);
        // Call the function with the token
        console.log("api call")
        makeAPICall(token);
    }
});


// Define the URL of your backend API endpoint
const apiUrl = `${baseUrl}/user/getuserdetail`;
function makeAPICall(token) {
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
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("action fired in background", message.action, userId)
    if (message.action === 'sendTabToBackend') {
        if (!userId) {
            makeAPICall(tokenFirst);
        }
        const { tabId, tabUrl, tabTitle, currentFolder } = message;
        console.log("tabId, tabUrl, tabTitle", tabId, tabUrl, tabTitle)
        // Send the tab data to your backend
        sendTabDataToBackend(tabId, tabUrl, tabTitle, currentFolder)
            .then((response) => {
                // Handle the response from the backend if needed
                if (response.success) {
                    // You can send a response back to the popup or content script if needed
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
    // Replace with your backend API endpoint
    const backendEndpoint = `${baseUrl}/usertabs/addtab/${userId}/${currentFolder}`;
    const token = await chrome.storage.local.get(["token"]);
    console.log(tabId, url, title, token.token, currentFolder)
    // Construct the data to send to the backend
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'showSavedTabs') {
        console.log("showSavedTabs running in background")
        if (!userId) {
            makeAPICall(tokenFirst);
        }
        const { currentFolder } = message;
        // Assuming showSavedTabs is an async function
        showSavedTabs(currentFolder)
            .then((response) => {
                console.log("response from background", response);
                ShowsavedDataResponse = response;
                console.log("ShowsavedDataResponse", ShowsavedDataResponse)
                // After receiving ShowsavedDataResponse
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
// Function to send tab data to the backend
async function showSavedTabs(currentFolder) {
    // Replace with your backend API endpoint
    const backendEndpoint = `${baseUrl}/usertabs/gettabs/${userId}/${currentFolder}`;
    const token = await chrome.storage.local.get(["token"]);
    console.log(token.token, currentFolder)
    console.log("userId", userId)
    // Construct the data to send to the backend
    // Send a POST request to your backend
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
