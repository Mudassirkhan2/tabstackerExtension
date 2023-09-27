import React from 'react'
import settingsIcon from '../../assets/settings-icon.svg';
import logoIcon from '../../assets/logoIcon.svg';
import { useEffect, useState } from 'react';
import { BsFillMoonStarsFill, BsSun } from 'react-icons/bs';
import Modal from './Modal';
import AnalyticsModal from "./AnalyticsModal"
import { toast } from 'react-toastify';
import BarChart from "./BarChart"
const Navbar = () => {
    const [theme, setTheme] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [limit, setlimit] = useState(15);
    const [tabData, setTabData] = useState([]);
    // modal for analytics
    const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
    // analytics data
    const [analyticsData, setAnalyticsData] = useState([]);

    useEffect(() => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('light')
        } else {
            setTheme('light')
        }
        const localTheme = window.localStorage.getItem('theme')
        localTheme && setTheme(localTheme)

    }, [])

    useEffect(() => {
        chrome.tabs.query({}, (tabs) => {
            console.log("tabs from Navbar", tabs)
            // get limit from storage
            chrome.storage.sync.get(['limit'], function (result) {
                console.log('Value currently is ' + result.limit);
                setlimit(result.limit)
                if (tabs.length > result.limit) {
                    console.log("limit reached", tabs.length, result.limit)
                    toast.info(`Limit reached ${tabs.length} tabs are open the limit is ${result.limit}. Please close some tabs. `)
                }
                else {
                    console.log("limit not reached", tabs.length, result.limit)
                }
            });
            // Filter out tabs with URL "chrome://newtab/"
            const filteredTabs = tabs.filter((tab) => tab.url !== 'chrome://newtab/');
            // Set the filtered tabs in the tabData state
            setTabData(filteredTabs || []);
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.action === 'sendDataofAnalytics') {
                    console.log('Received Data in navbar ', message.data);
                    setAnalyticsData(message.data)

                    if (message.data.error) {
                        toast.error(message.data.error)
                    }
                }
            });
        });
    }, [setTabData]);
    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.remove('dark')
            document.documentElement.classList.add('light')
        }
        if (theme === 'dark') {
            document.documentElement.classList.remove('light')
            document.documentElement.classList.add('dark')
        }
    }, [theme])
    // handele the theme
    const handleTheme = () => {
        if (theme === 'light') {
            setTheme('dark')
            toast.success("Dark theme enabled")
            window.localStorage.setItem('theme', 'dark')
        } else {
            setTheme('light')
            toast.success("Light theme enabled")

            window.localStorage.setItem('theme', 'light')
        }
    }
    const openModal = () => {
        setIsModalOpen(true);
    };
    function getClickAnalytics() {
        console.log("open modal analytics")
        chrome.runtime.sendMessage({ action: 'getClickAnalytics', data: tabData });
    }
    const openModalAnalytics = () => {
        setIsAnalyticsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };
    const closeModalAnalytics = () => {
        setIsAnalyticsModalOpen(false);
    };
    const handleModalSubmit = () => {
        setIsModalOpen(false);
        console.log(limit)
        chrome.storage.sync.set({ limit: limit }, function () {
            console.log('Value is set to ' + limit);
            toast.success(`Tabs Limit set to ${limit}`)
        })

    }
    const handleLimitChange = (event) => {
        setlimit(event.target.value);
    };
    return (
        <nav className='flex items-center justify-between p-4 border-b-2 '>

            <div className='flex items-center space-x-2'>
                <img
                    className="rounded-md w-9 h-9"
                    src={logoIcon}
                    alt="logoIcon"
                    title="logo"
                />
                <h1 className="text-xl font-bold ">TabStacker</h1>
            </div>
            <div className='flex items-center space-x-4 '>
                <button
                    onClick={
                        () => {
                            getClickAnalytics()
                            openModalAnalytics()
                        }
                    }
                    title="Open Analytics modal"
                    className='font-extrabold hover:text-gray-600 active:text-amber-200'
                >Analytics</button>
                {isAnalyticsModalOpen && (
                    <AnalyticsModal isOpen={isAnalyticsModalOpen} onClose={closeModalAnalytics}>
                        {analyticsData.length > 0 && (
                            <BarChart data={analyticsData} />
                        )
                        }
                    </AnalyticsModal>
                )}
                <button
                    onClick={
                        () => {
                            openModal()
                        }
                    }
                    title="Open modal to set limit."
                    className='font-extrabold hover:text-gray-600 active:text-amber-200'
                >Set Limit</button>
                {isModalOpen && (
                    <Modal isOpen={isModalOpen} onClose={closeModal}>
                        <div className='dark:text-gray-700'>
                            <h2 className='font-mono font-extrabold hover:text-gray-600 active:text-amber-200'>Set Limit</h2>
                            <label htmlFor="Limit">Set Limit for the tabs:</label>
                            <input
                                type="text"
                                id="Limit"
                                required
                                value={limit}
                                onChange={handleLimitChange}
                            />
                            <div id="modal-buttons-div">
                                <button className="modal-button" onClick={handleModalSubmit} >Submit</button>
                                <button className="modal-button" onClick={closeModal}>Cancel</button>
                            </div>
                        </div>
                    </Modal>
                )}
                <button onClick={handleTheme} className='dark:text-white' >{

                    theme === 'light' ? (
                        <>
                            <BsFillMoonStarsFill className='text-lg transition ease-in-out delay-150 hover:shadow-lg hover:text-yellow-500 hover:animate-pulse'
                                title='Enable Dark Theme'
                            />
                        </>
                    ) : (
                        <BsSun className='text-lg transition ease-in-out delay-150 hover:shadow-lg hover:text-yellow-500 hover:animate-pulse'
                            title='Enable Light Theme'
                        />
                    )
                }</button>
            </div>
            {/* <button>
                <img
                    className="w-6 h-6 rounded-md cursor-pointer"
                    src={settingsIcon}
                    alt="settings"
                    title="settings"
                />
            </button> */}
        </nav>
    )
}

export default Navbar
