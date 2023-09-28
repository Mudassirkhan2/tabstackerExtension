// Get the token from local storage
const token = localStorage.getItem("token");
console.log("Token:", token);

// If a token exists, send it to the background script
if (token) {
  chrome.runtime.sendMessage({ type: "getToken", token });
}

console.log("Content script loaded");



// content_script.ts

// content_script.js
const popup = document.createElement('div');
            popup.id = 'my-popup';
            popup.style.position = 'fixed';
            popup.style.top = '10px';
            popup.style.left = '10px';
            popup.style.zIndex = '9999';
            popup.style.border = '1px solid #000';
            popup.style.padding = '20px';
            popup.style.backgroundColor = '#fff';
            popup.style.color = '#000';
            popup.style.borderRadius = '5px';
            popup.style.boxShadow = '0 0 10px #000';
            popup.style.display = 'none';
            document.body.appendChild(popup);
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Check if the message contains the tabDataTitle property
  console.log("message ", message);
  if (message.tabDataTitle) {
    const title = message.tabDataTitle;

    // Display an alert box with the received title
          // SHOW A POPUP add it in the body of the html
          popup.innerText = `Timer ended for  ${title} `;
            popup.style.display = 'block';
            setTimeout(() => {
              popup.style.display = 'none';
            }, 3000);    
    alert(`Received title: ${title}`);

    // You can perform any other actions you want with the received title here.
  }
});
// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Check if the message has the expected action
  if (message.action === 'someAction') {
      // Access the data sent in the message
      const messageData = message.data;


      // Do something with the data
      console.log('Received message from background:', messageData);

      // Optionally, you can send a response back to the background script
      // sendResponse({ response: 'Message received successfully!' });
  }
});



// Define a variable to store the timer intervals for each tab
// const timerIntervals = {};

// // Function to start a timer for a tab based on received data
// function startTimerForTab(arrayOfMainWebsites, tabs) {
//   if (arrayOfMainWebsites && tabs) {
//     console.log("array Aaya hai ", arrayOfMainWebsites)
//     console.log("Received tabs data: aaya hai ", tabs);
//     // Check if the tab is active
//     const activeTabs = tabs.filter((tab) => tab.active);

//     for (const currentTab of activeTabs) {
//       const current_tab= currentTab;
//       console.log("currentTab ", current_tab.active);
//       console.log("current ", currentTab.url);
//       const currentTabDomain = new URL(currentTab.url).hostname;
//       console.log(currentTabDomain);
//       for (const item of arrayOfMainWebsites) {
//         console.log('Main Website:', item['mainWebsites']);
//         console.log('Time:', item['time']);
//         console.log('Title:', item['title']);
//       }

//       // console.log("arrayOfMainWebsitesArray ", valuesArray);
//       let tabData;
//       for (const item of arrayOfMainWebsites) {
//         if (item['mainWebsites'] === currentTabDomain) {
//           tabData = item;
//           break;
//         }
//         else{
//           console.log("else aaya hai")  
//           tabData = null;
//         }
//       }

//       console.log("tabdata ", tabData);
//       // Check if there is data associated with the current tab's domain
//       if (tabData) {
//         console.log(`Tab ${currentTabDomain} has associated data.`);
//         // Start a timer if there is associated data
//         const timeLimit = parseFloat(tabData['time']) * 60 * 1000; // Convert minutes to milliseconds
//         console.log(`Time limit for tab ${currentTabDomain} is ${timeLimit} milliseconds.`);
//         let remainingTime = timeLimit;

//         // Function to update the timer and open the popup when the time is up
//         const updateTimer = () => {
//           const port = chrome.runtime.connect({ name: 'content-script' });
//           console.log('Established connection with background script.');
          
//           // Request data from the background script
//           port.postMessage({ action: 'requestDataFromBackground' });
//           console.log('Sent requestDataFromBackground message to background script.');
          
//           // Listen for messages from the background script
//           port.onMessage.addListener((message) => {
//             if (message.arrayOfMainWebsites && message.tabs) {
//               // Handle the received arrayOfMainWebsites data if needed
//               console.log('Received arrayOfMainWebsites:', message.arrayOfMainWebsites);
//               console.log('Received tabs data:', message.tabs);
          
//             }
//           });
//           const activeTabs2 = tabs.filter((tab) => tab.active);
//           let current_tab2;
//           for (const currentTab of activeTabs2) {
//              current_tab2 = currentTab;
//             console.log("currentTab2vala ", current_tab2);
//           }

//           // Check if the current tab is active and matches the domain of the tab data
//           if(tabData['mainWebsites']=== new URL(current_tab2.url).hostname && current_tab2.active==true){
//             console.log(current_tab2.active);
//             if (remainingTime <= 0) {
//               clearInterval(timerIntervals[currentTabDomain]);
//               // Open a popup with the information
//               alert("Timmer for this tab has finished");
//               const title = tabData['title'];
//               chrome.runtime.sendMessage({ action: 'showPopup', title });
//               console.log(`Timer for tab ${currentTabDomain} has finished.`);
//             }
//             remainingTime -= 1000; // Decrease by 1 second
//             console.log(`Remaining time for tab ${currentTabDomain} is ${remainingTime} milliseconds.`);
//           }
//           else{
//             console.log("Tab is not active");
//           }
//         }

//         // Start the timer interval for the tab
//         timerIntervals[currentTabDomain] = setInterval(updateTimer, 1000);
//         console.log(`Timer for tab ${currentTabDomain} started.`);
//       }
//     }
//   }
// }

// // Establish a connection with the background script
// const port = chrome.runtime.connect({ name: 'content-script' });
// console.log('Established connection with background script.');

// // Request data from the background script
// port.postMessage({ action: 'requestDataFromBackground' });
// console.log('Sent requestDataFromBackground message to background script.');

// // Listen for messages from the background script
// port.onMessage.addListener((message) => {
//   if (message.arrayOfMainWebsites && message.tabs) {
//     // Handle the received arrayOfMainWebsites data if needed
//     console.log('Received arrayOfMainWebsites:', message.arrayOfMainWebsites);
//     console.log('Received tabs data:', message.tabs);
//     // Start timers for each tab based on received data
//     startTimerForTab(message.arrayOfMainWebsites, message.tabs);
//   }
// });