const token = localStorage.getItem("token");
console.log(token);
if (token) {
    // Send the token to the background script
    chrome.runtime.sendMessage({ type: "getToken", token });
}
