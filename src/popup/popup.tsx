import React, { useEffect, useState } from "react";
import './popup.css';
import closeIcon from '../assets/close-icon.svg';
// You can use the imported SVG content as a string
// This will log the SVG content as a string
import { HiFolderPlus } from 'react-icons/hi2';
const Popup = () => {
    const [tabData, setTabData] = useState([]);
    // current folder
    const [currentFolder, setCurrentFolder] = useState(0);
    const [selectedFolder, setSelectedFolder] = useState(0);

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

    const activateTabByURL = (url) => {
        chrome.tabs.query({}, (tabs) => {
            const matchingTab = tabs.find((tab) => tab.url === url);
            if (matchingTab) {
                chrome.tabs.update(matchingTab.id, { active: true });
            }
        });
    };

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
        <div className="container">
            <div className="leftbar">
                <div
                    className={`folder ${selectedFolder === 0 ? "selected" : ""} active:scale-95 active:bg-purple-600`}
                    onClick={() => handleFolderClick(0)}
                >
                    Folder 1
                </div>
                <div
                    className={`folder ${selectedFolder === 1 ? "selected" : ""} active:scale-95 active:bg-purple-600`}
                    onClick={() => handleFolderClick(1)}
                >
                    Folder 2
                </div>
                <div
                    className={`folder ${selectedFolder === 2 ? "selected" : ""} active:scale-95 active:bg-purple-600`}
                    onClick={() => handleFolderClick(2)}
                >
                    Folder 3
                </div>
                <div
                    className={`folder ${selectedFolder === 3 ? "selected" : ""} active:scale-95 active:bg-purple-600`}
                    onClick={() => handleFolderClick(3)}
                >
                    Folder 4
                </div>
            </div>
            <div className="rightbar">
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
            </div>
        </div>
    );
};

const TabItem = ({ tab, closeTab, activateTabByURL, getFaviconUrl, currentFolder }) => {
    const [faviconUrl, setFaviconUrl] = useState(null);

    useEffect(() => {
        // Fetch and set the favicon URL when the component mounts
        getFaviconUrl(tab.url)
            .then((url) => setFaviconUrl(url))
            .catch((error) => {
                console.error(`Error fetching favicon: ${error}`)
            });
    }, [tab.url, getFaviconUrl]);
    function getMainSiteName(url) {
        try {
            const urlObject = new URL(url);
            return urlObject.hostname;
        } catch (error) {
            console.error(`Error extracting main site name from ${url}: ${error}`);
            return url; // Return the original URL in case of an error
        }
    }
    function sendTabToBackend(tabId, tabUrl, tabTitle, currentFolder) {
        console.log(tabId, tabUrl, tabTitle)
        chrome.runtime.sendMessage({ action: 'sendTabToBackend', tabId, tabUrl, tabTitle, currentFolder });
        console.log("sent")
    }
    const mainSiteName = getMainSiteName(tab.url);
    return (
        <li className="tab-item relative">
            <div className="tab-content">
                <img
                    className="w-8 h-8 rounded-md "
                    src={faviconUrl || 'https://www.google.com/s2/favicons?domain=google.com'}
                    alt="Favicon"
                />
                <span className="tab-info">
                    <a
                        href={tab.url}
                        onClick={(event) => {
                            event.preventDefault();
                            activateTabByURL(tab.url);
                        }}
                    >
                        {mainSiteName || tab.url}
                    </a>


                </span>
                <div className="absolute top-4 right-2">
                    <div className="flex items-center space-x-4">
                        <img
                            className="close-icon"
                            src={closeIcon}
                            alt="Close"
                            onClick={() => closeTab(tab.id)}
                        />
                        <HiFolderPlus className="w-6 h-6 rounded-md"
                            onClick={
                                () => {
                                    sendTabToBackend(tab.id, tab.url, tab.title, currentFolder);
                                }
                            }
                        />
                    </div>
                </div>
            </div>
            <p className=" title">{tab.title}</p>
        </li>
    );
};


export default Popup;
