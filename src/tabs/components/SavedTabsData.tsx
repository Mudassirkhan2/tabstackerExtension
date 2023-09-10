import React, { useEffect, useState } from 'react'
const SavedTabsData = ({ tab, closeTab, activateTabByURL, getFaviconUrl, currentFolder }) => {
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
    return (
        <li>

            <img
                className="w-8 h-8 rounded-md "
                src={faviconUrl || 'https://www.google.com/s2/favicons?domain=google.com'}
                alt="Favicon"
            />
            <h1>{tab.title}</h1>
        </li>
    )
}

export default SavedTabsData
