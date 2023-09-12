const token = localStorage.getItem("token");
console.log(token);
if (token) {
    // Send the token to the background script
    chrome.runtime.sendMessage({ type: "getToken", token });
}
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') {
        // Open a new tab with the login page URL
        chrome.tabs.create({ url: 'https://tabstacker.vercel.app/' });
    }
});