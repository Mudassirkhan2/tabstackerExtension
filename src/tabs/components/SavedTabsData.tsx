import React, { useEffect, useState } from 'react'
import { BsArrowUpRight } from 'react-icons/bs'
import { MdDelete } from 'react-icons/md'
const SavedTabsData = ({ tab, getFaviconUrl, currentFolder }) => {
    const [faviconUrl, setFaviconUrl] = useState(null);
    function deleteTabFromBackend(tabId, tabUrl, tabTitle, currentFolder) {
        console.log(tabId, tabUrl, tabTitle)
        chrome.runtime.sendMessage({ action: 'deleteTabFromBackend', tabId, tabUrl, tabTitle, currentFolder });
    }
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
        <li className="relative tab-item">
            <div className="tab-content">
                <img
                    className="w-8 h-8 rounded-md "
                    src={faviconUrl || 'https://www.google.com/s2/favicons?domain=google.com'}
                    alt="Favicon"
                />
                <span className="cursor-pointer tab-info" onClick={
                    () => {
                        chrome.tabs.create({ url: tab.url });
                    }
                }>
                    {mainSiteName || tab.url}
                </span>
                <div className="absolute top-4 right-2">
                    <div className="flex items-center space-x-4">
                        <BsArrowUpRight className="w-6 h-6 rounded-md cursor-pointer active:text-emerald-300 hover:text-gray-600"
                            title='Open in new tab'
                            onClick={
                                () => {
                                    chrome.tabs.create({ url: tab.url });
                                }
                            }
                        />
                        <MdDelete className="w-6 h-6 rounded-md cursor-pointer active:text-red-300 hover:text-red-600"
                            title='Delete'
                            onClick={
                                () => {
                                    deleteTabFromBackend(tab.id, tab.url, tab.title, currentFolder);
                                }
                            }
                        />
                    </div>
                </div>
            </div>
            <p className=" title">{tab.title}</p>
        </li>
    )
}

export default SavedTabsData
