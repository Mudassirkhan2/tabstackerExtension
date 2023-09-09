import React, { useEffect, useState } from "react";
import './popup.css';
import closeIcon from '../assets/close-icon.svg';
// You can use the imported SVG content as a string
// This will log the SVG content as a string


const Popup = () => {
    const [tabData, setTabData] = useState([]);
    useEffect(() => {
        chrome.runtime.sendMessage({ action: 'getSavedTabs' }, (response) => {
            setTabData(response?.tabData || []);
        });
    }, []);


    // const displaySavedTabs = (tabData) => {
    //     return (
    //         <ul id="tabList">
    //             {tabData.map((tab) => (
    //                 <TabItem
    //                     key={tab.tabId}
    //                     tab={tab}
    //                     closeTab={closeTab}
    //                     activateTabByURL={activateTabByURL}
    //                     getFaviconUrl={getFaviconUrl}
    //                 />
    //             ))}
    //             {tabData.length === 0 && <li>No tabs to show</li>}
    //         </ul>
    //     );
    // };

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
                console.error(`Favicon not found for ${url}`);
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
                <div>
                    Current Tab
                </div>
                <div>
                    Folder2
                </div>
                <div>
                    Folder3
                </div>
                <div>
                    Folder4
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
                        />
                    ))}
                    {tabData.length === 0 && <li>No tabs to show</li>}
                </ul>
            </div>
        </div>
    );
};

const TabItem = ({ tab, closeTab, activateTabByURL, getFaviconUrl }) => {
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
    const mainSiteName = getMainSiteName(tab.url);
    return (
        <li className="tab-item">
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
                    <img
                        className="close-icon"
                        src={closeIcon}
                        alt="Close"
                        onClick={() => closeTab(tab.tabId)}
                    />
                </span>
            </div>
            <p className=" title">{tab.title}</p>
        </li>
    );
};


export default Popup;
