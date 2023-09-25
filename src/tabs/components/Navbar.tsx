import React from 'react'
import settingsIcon from '../../assets/settings-icon.svg';
import logoIcon from '../../assets/logoIcon.svg';
import { useEffect, useState } from 'react';
import { BsFillMoonStarsFill, BsSun } from 'react-icons/bs';
const Navbar = () => {
    const [theme, setTheme] = useState(null)

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
            window.localStorage.setItem('theme', 'dark')
        } else {
            setTheme('light')
            window.localStorage.setItem('theme', 'light')
        }
    }
    return (
        <nav className='flex items-center justify-between p-4 border-b-2'>
            <div className='flex items-center space-x-2'>
                <img
                    className="rounded-md w-9 h-9"
                    src={logoIcon}
                    alt="logoIcon"
                    title="logo"
                />
                <h1 className="text-xl font-bold ">TabStacker</h1>
            </div>
            <button onClick={handleTheme} className='dark:text-white' >{

                theme === 'light' ? (
                    <>

                        <BsFillMoonStarsFill className='text-lg' />
                    </>
                ) : (
                    <BsSun className='text-lg' />
                )
            }</button>
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
