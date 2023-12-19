import { BiTimer } from 'react-icons/bi';
import React, { useEffect, useState } from "react";
import "../../popup/popup.css"
import closeIcon from '../../assets/close-icon.svg';
import { HiFolderPlus } from 'react-icons/hi2';
import Modal from './Modal'; // Import your modal component
import { toast } from 'react-toastify';
const TabItem = (
    { tab, closeTab, activateTabByURL, getFaviconUrl, currentFolder,
        setArrayOfMainWebsites, arrayOfMainWebsites, faviconUrlarray
    }) => {
    const [faviconUrl, setFaviconUrl] = useState(null);
    const [mainWebsites, setmainWebsites] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');

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
        console.log(arrayOfMainWebsites)
        toast.success("Tab added successfully")

    }

    const openModal = (mainSiteName: string) => {
        setIsModalOpen(true);
        setmainWebsites(mainSiteName);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };

    const handleTimeChange = (event) => {
        setTime(event.target.value);
    };

    const handleModalSubmit = () => {
        // Check if both title and time are present
        if (title && time) {
            // Get the data you want to save (title and time)
            const dataToSave = {
                title: title,
                time: time,
                mainWebsites: mainWebsites
            };
            console.log(arrayOfMainWebsites)
            // Create a copy of the previous state and add the new data
            const updatedArray = [...arrayOfMainWebsites, dataToSave];

            // Update the state with the new array
            setArrayOfMainWebsites(updatedArray);

            // Use chrome.storage to save the data
            chrome.storage.sync.set({ myData: dataToSave, arrayOfMainWebsites: updatedArray }, () => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                } else {
                    toast.success(`Timer set for ${title} for ${time} minutes`)
                    console.log('Data saved successfully:', dataToSave);
                    console.log('Array of main websites saved successfully:', updatedArray);
                }
                closeModal();
            });
        } else {
            toast.error("Please enter both title and time")
            // Handle the case where either title or time is missing
            console.error('Both title and time must be provided to save data.');
        }
    };

    const mainSiteName = getMainSiteName(tab.url);
    return (
        <li className="relative tab-item hover:bg-[#dcdcdc] border-gray-400 border-[1px]  rounded-xl dark:hover:bg-gray-400">
            <div className="tab-content">
                <img
                    className="w-8 h-8 rounded-md "
                    src={faviconUrlarray || 'https://www.google.com/s2/favicons?domain=google.com'}
                    alt="Favicon"
                />
                <span className="tab-info dark:text-white">
                    <a
                        href={tab.url}
                        onClick={(event) => {
                            event.preventDefault();
                            activateTabByURL(tab.url);
                        }}
                        className='text-gray-700 dark:text-white'
                    >
                        {mainSiteName || tab.url}
                    </a>
                </span>
                <div className="absolute top-4 right-2">
                    <div className="flex items-center space-x-4">

                        <HiFolderPlus className="w-6 h-6 transition-all ease-in-out delay-150 rounded-md cursor-pointer active:text-emerald-300 hover:text-gray-600"
                            onClick={
                                () => {
                                    sendTabToBackend(tab.id, tab.url, tab.title, currentFolder);
                                }
                            }
                            title="Add to folder"
                        />
                        <BiTimer className="w-6 h-6 transition-all ease-in-out delay-150 rounded-md cursor-pointer active:text-emerald-300 hover:text-gray-600"
                            onClick={
                                () => {
                                    openModal(mainSiteName)
                                }
                            }
                            title="Set timer."

                        />
                        <img
                            className="transition-all ease-in-out delay-150 close-icon hover:scale-125"
                            src={closeIcon}
                            alt="Close"
                            onClick={() => closeTab(tab.id)}
                            title="Close tab"
                        />
                        {isModalOpen && (
                            <Modal isOpen={isModalOpen} onClose={closeModal}>
                                <div className='dark:text-black'>
                                    <h2 className='dark:text-black'>Set Timer</h2>
                                    <label htmlFor="title" className='dark:text-black'>Title:</label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={title}
                                        onChange={handleTitleChange}
                                    />

                                    <label htmlFor="time" className='dark:text-black'>Time (in mins):</label>
                                    <input
                                        type="number"
                                        id="time"
                                        value={time}
                                        onChange={handleTimeChange}
                                        className='dark:text-black'

                                    />
                                    <div id="modal-buttons-div">
                                        <button className="modal-button dark:text-gray-700" onClick={handleModalSubmit}>Submit</button>
                                        <button className="modal-button" onClick={closeModal}>Cancel</button>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                </div>
            </div>
            <p className="text-gray-700 title dark:text-slate-200 ">{tab.title}</p>
        </li>
    );
};
export default TabItem;
