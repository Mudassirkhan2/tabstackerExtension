import React from 'react'
import settingsIcon from '../../assets/settings-icon.svg';
import logoIcon from '../../assets/logoIcon.svg';

const Navbar = () => {
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
            <button>
                <img
                    className="w-6 h-6 rounded-md cursor-pointer"
                    src={settingsIcon}
                    alt="settings"
                    title="settings"
                />
            </button>
        </nav>
    )
}

export default Navbar
