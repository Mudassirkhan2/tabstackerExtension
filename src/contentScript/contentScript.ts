chrome.runtime.sendMessage('I am loading content script', (response) => {
    console.log(response);
    console.log('I am content script')

})

window.onload = (event) => {
    console.log('page is fully loaded');
};
const token = localStorage.getItem("token");
console.log(token);

if (token) {
    chrome.storage.local.set({ token: token });
    // Send the token to the background script
    chrome.runtime.sendMessage({ type: "getToken", token });
}
chrome.runtime.sendMessage('I am loading content script', (response) => {
    console.log(response);
    console.log('I am content script')

})


