
import React, { useEffect, useState } from "react";
import "../../popup/popup.css"
import closeIcon from '../../assets/close-icon.svg';
import { HiFolderPlus } from 'react-icons/hi2';
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
    }
    const mainSiteName = getMainSiteName(tab.url);
    return (
        <li className="relative tab-item">
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
export default TabItem;
