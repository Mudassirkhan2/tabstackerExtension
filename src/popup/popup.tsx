import React, { useEffect, useState } from "react";
import './popup.css';
import TabItem from "../tabs/components/TabItem";
import SavedTabsData from "../tabs/components/SavedTabsData";
import Navbar from "../tabs/components/Navbar";

const Popup = () => {
    const [tabData, setTabData] = useState([]);
    // current folder
    const [currentFolder, setCurrentFolder] = useState(0);
    const [selectedFolder, setSelectedFolder] = useState(0);
    // show saved tabs
    const [showSavedTabsData, setshowSavedTabsData] = useState([]);
    // Function to handle folder click
    const handleFolderClick = (folderId) => {
        // Set the selected folder when it's clicked
        setSelectedFolder(folderId);
        console.log(folderId)
        setCurrentFolder(folderId)
    };
    // useEffect(() => {
    //     let timeoutId;

    //     // Function to fetch and filter tabs
    //     const fetchAndFilterTabs = () => {
    //         chrome.tabs.query({}, (tabs) => {
    //             // Filter out tabs with URL "chrome://newtab/"
    //             const filteredTabs = tabs.filter((tab) => tab.url !== 'chrome://newtab/');
    //             // Set the filtered tabs in the tabData state
    //             setTabData(filteredTabs || []);
    //         });
    //     };

    //     // Initial fetch of tabs
    //     fetchAndFilterTabs();

    //     // Listen for updates to tabs and debounce the function
    //     chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    //         clearTimeout(timeoutId);
    //         // Debounce the function to run after 500 milliseconds of no updates
    //         timeoutId = setTimeout(fetchAndFilterTabs, 500);
    //     });

    //     // Clean up the timeout when the component unmounts
    //     return () => clearTimeout(timeoutId);
    // }, [setTabData]);
    useEffect(() => {
        chrome.tabs.query({}, (tabs) => {
            // Filter out tabs with URL "chrome://newtab/"
            const filteredTabs = tabs.filter((tab) => tab.url !== 'chrome://newtab/');
            // Set the filtered tabs in the tabData state
            setTabData(filteredTabs || []);
        });
    }, [setTabData]);
    const closeTab = (tabId) => {
        chrome.tabs.remove(tabId);
        chrome.runtime.sendMessage({ action: 'reloadPopup' });
        location.reload();
    };
    //  to show saved tabs
    const handleshowSavedTabs = () => {
        chrome.runtime.sendMessage({ action: 'showSavedTabs', currentFolder });
    };
    const activateTabByURL = (url) => {
        chrome.tabs.query({}, (tabs) => {
            const matchingTab = tabs.find((tab) => tab.url === url);
            if (matchingTab) {
                chrome.tabs.update(matchingTab.id, { active: true });
            }
        });
    };
    // In your React component in the popup script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'sendDataToPopup') {
            const receivedData = message.data;
            if (receivedData.tabs) {
                console.log('Received Data in Popup:', receivedData.tabs);
                setshowSavedTabsData(receivedData.tabs)
            }
            else {
                console.log('Received Data in Popup:', receivedData);
            }
        }
    });

    const getFaviconUrl = async (url) => {
        try {
            const response = await fetch(`https://www.google.com/s2/favicons?domain=${url}`);

            if (response.status === 200) {
                const blob = await response.blob();
                return URL.createObjectURL(blob);
            } else if (response.status === 404) {
                // Handle 404 error: return a default favicon URL or null
                // console.error(`Favicon not found for ${url}`);
                return 'https://www.google.com/s2/favicons?domain=google.com'; // Replace with your default favicon URL
            } else {
                // Handle other error cases
                console.error(`Error fetching favicon for ${url}: ${response.status}`);
                return null;
            }
        } catch (error) {
            console.error(`Error fetching favicon for ${url}: ${error}`);
            return null;
        }
    };

    return (
        <main>
            <Navbar />
            <div className="container">
                <div className="leftbar">
                    <div
                        className={`folder ${selectedFolder === 3 ? "selected" : ""} active:scale-95 active:bg-purple-600 gap-4`}
                        onClick={() => handleFolderClick(3)}
                    >
                        Current Tabs
                    </div>
                    <div
                        className={`folder ${selectedFolder === 0 ? "selected" : ""} active:scale-95 active:bg-purple-600 gap-4`}
                        onClick={() => handleFolderClick(0)}
                    >
                        <p>Work</p>
                        <button
                            onClick={
                                () => {
                                    handleshowSavedTabs();
                                }
                            }
                            className="active:text-blue-500 hover:text-blue-200"
                            title="Show saved tabs of Work folder"
                        >
                            Show
                        </button>
                    </div>
                    <div
                        className={`folder ${selectedFolder === 1 ? "selected" : ""} active:scale-95 active:bg-purple-600 gap-4`}
                        onClick={() => handleFolderClick(1)}
                    >
                        <p>Music</p>
                        <button
                            onClick={
                                () => {
                                    handleshowSavedTabs();
                                }
                            }
                            className="active:text-blue-500 hover:text-blue-200"
                            title="Show saved tabs of music folder"
                        >
                            Show
                        </button>
                    </div>

                    <div
                        className={`folder ${selectedFolder === 2 ? "selected" : ""} active:scale-95 active:bg-purple-600 gap-4`}
                        onClick={() => handleFolderClick(2)}
                    >
                        Miscellaneous
                        <button
                            onClick={
                                () => {
                                    handleshowSavedTabs();
                                }
                            }
                            className="active:text-blue-500 hover:text-blue-200"
                            title="Show saved tabs of miscellaneous folder"
                        >
                            Show
                        </button>
                    </div>

                </div>
                <div className="rightbar ">
                    <h1>Current Tabs</h1>
                    <ul id="tabList">
                        {tabData.map((tab) => (
                            <TabItem
                                key={tab.tabId}
                                tab={tab}
                                closeTab={closeTab}
                                activateTabByURL={activateTabByURL}
                                getFaviconUrl={getFaviconUrl}
                                currentFolder={currentFolder}
                            />
                        ))}
                        {tabData.length === 0 && <li>No tabs to show</li>}
                    </ul>
                    <h1>Saved Tabs</h1>
                    <ul id="tabList">
                        {
                            showSavedTabsData && showSavedTabsData.map((tab) => (
                                <SavedTabsData key={tab.tabId}
                                    tab={tab}
                                    getFaviconUrl={getFaviconUrl}
                                    currentFolder={currentFolder} />
                            ))
                        }
                        {showSavedTabsData.length === 0 && <li>No tabs to show</li>}
                    </ul>


                </div>
            </div>
        </main>
    );
};
export default Popup;
