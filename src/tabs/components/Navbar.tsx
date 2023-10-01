import React from 'react'
import settingsIcon from '../../assets/settings-icon.svg';
import logoIcon from '../../assets/logoIcon.svg';
import { useEffect, useState } from 'react';
import { BsFillMoonStarsFill, BsSun } from 'react-icons/bs';
import Modal from './Modal';
import AnalyticsModal from "./AnalyticsModal"
import { toast } from 'react-toastify';
import BarChart from "./BarChart"
import PieChart from './PieChart';
const Navbar = () => {
    const [theme, setTheme] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [limit, setlimit] = useState(15);
    const [tabData, setTabData] = useState([]);
    // modal for analytics
    const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
    // modal for a pie chartData
    const [isPieChartModalOpen, setIsPieChartModalOpen] = useState(false);
    // analytics data
    const [analyticsData, setAnalyticsData] = useState([]);
    // pie chartData
    const [pieChartData, setPieChartData] = useState([]);
    let localtime = 'false'
    const localtime1 = window.localStorage.getItem("timepermission");
    localtime1 && (localtime = localtime1);

    const [timepermission, setTimepermission] = useState(localtime);

    useEffect(() => {
        if (timepermission == 'true') {
            //send message to background.js
            chrome.runtime.sendMessage({ action: 'permissiongranted' });
        }
        else if (timepermission == 'false') {
            //send message to background.js
            chrome.runtime.sendMessage({ action: 'permissiondenied' });
        }

        console.log("now", timepermission);

    }, [timepermission]);


    useEffect(() => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('light')
        } else {
            setTheme('light')
        }
        const localTheme = window.localStorage.getItem('theme')
        localTheme && setTheme(localTheme)

        //get timepermission from storage
        // chrome.storage.sync.get(['timepermission'], function (result) {
        //     setTimepermission(result.timepermission)
        // });

        // //send chrome message if the condition is true that "permission granted"
        // if (timepermission) {
        //     chrome.runtime.sendMessage({ action: 'permissiongranted' });
        // }        
    }, [])

    useEffect(() => {
        chrome.tabs.query({}, (tabs) => {
            // get limit from storage
            chrome.storage.sync.get(['limit'], function (result) {
                setlimit(result.limit)
                if (tabs.length > result.limit) {
                    toast.info(`Limit reached ${tabs.length} tabs are open the limit is ${result.limit}. Please close some tabs. `)
                }
            });
            // Filter out tabs with URL "chrome://newtab/"
            const filteredTabs = tabs.filter((tab) => tab.url !== 'chrome://newtab/');
            // Set the filtered tabs in the tabData state
            setTabData(filteredTabs || []);
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.action === 'sendDataofAnalytics') {
                    setAnalyticsData(message.data)
                    if (message.data.error) {
                        toast.error(message.data.error)
                    }
                }
            });
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.action === 'getPieChartAnalytics') {
                    console.log("pie chart data", message.data)
                    setPieChartData(message.data)
                    if (message.data.error) {
                        toast.error(message.data.error)
                    }
                }
            });
        });
    }, [setTabData, setPieChartData]);
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
        chrome.runtime.sendMessage({ action: 'getClickAnalytics', data: tabData });
    }
    function getPieChartAnalytics() {
        chrome.runtime.sendMessage({ action: 'getPieChartAnalytics', data: tabData });
    }
    const openModalAnalytics = () => {
        setIsAnalyticsModalOpen(true);
    };
    const openPieChartModalAnalytics = () => {
        setIsPieChartModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };
    const closeModalAnalytics = () => {
        setIsAnalyticsModalOpen(false);
    };
    const closePieChartModalAnalytics = () => {
        setIsPieChartModalOpen(false);
    };
    const handleModalSubmit = () => {
        setIsModalOpen(false);
        chrome.storage.sync.set({ limit: limit }, function () {
            toast.success(`Tabs Limit set to ${limit}`)
        })
    }
    const handleLimitChange = (event) => {
        setlimit(event.target.value);
    };
    // const sendpermissionmessage = (timepermission) => {

    //     if (timepermission) {
    //         chrome.runtime.sendMessage({ action: 'permissiongranted' });
    //     } else {
    //         chrome.runtime.sendMessage({ action: 'permissiondenied' });
    //     }
    // };

    const handletime = () => {
        if (timepermission == 'true') {
            setTimepermission('false');
            window.localStorage.setItem("timepermission", 'false');

        }
        else if (timepermission == 'false') {
            setTimepermission('true');
            window.localStorage.setItem("timepermission", 'true');
        }
    }


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
                            getPieChartAnalytics()
                            openPieChartModalAnalytics()
                        }
                    }
                    title="Open Analytics modal"
                    className='font-extrabold hover:text-gray-600 active:text-amber-200'
                >Folder Analytics</button>
                <button
                    onClick={
                        () => {

                            getClickAnalytics()
                            openModalAnalytics()
                        }
                    }
                    title="Open Analytics modal"
                    className='font-extrabold hover:text-gray-600 active:text-amber-200'
                >Tab Analytics</button>
                {isPieChartModalOpen && (
                    <AnalyticsModal isOpen={isPieChartModalOpen} onClose={closePieChartModalAnalytics}>
                        {pieChartData.length > 0 ? (
                            <PieChart data={pieChartData} />
                        ) : (
                            <div className='w-[200px] h-[200px] flex items-center justify-center'>
                                <p>Loading...</p>
                            </div>
                        )}
                    </AnalyticsModal>
                )}
                <button
                    onClick={handletime}
                    title="Open Pie Chart"
                    className='font-extrabold hover:text-gray-600 active:text-amber-200'
                    style={{
                        backgroundColor: timepermission === 'true' ? 'green' : '',
                        color: theme === 'dark' ? 'white' : 'black',
                    }}
                >
                    Time-track-permission
                </button>


                {isAnalyticsModalOpen && (
                    <AnalyticsModal isOpen={isAnalyticsModalOpen} onClose={closeModalAnalytics}>
                        {analyticsData.length > 0 ? (
                            <BarChart data={analyticsData} />
                        ) : (
                            <div className='w-[200px] h-[200px] flex items-center justify-center'>
                                <p>Loading...</p>
                            </div>
                        )}
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

        </nav>
    )
}

export default Navbar
