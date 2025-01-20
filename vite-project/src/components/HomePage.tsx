import React, { useState } from 'react'
import axios from 'axios'

const HomePage = () => {
    const [loading, setLoading] = useState(false)

    const handleSetCookies = () => {
        setLoading(true)
        axios.post(`${process.env.REACT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/set-cookies`, {}, { withCredentials: true }).finally(() => {
            setLoading(false)
        })
    }

    const handleRemoveCookies = () => {
        setLoading(true)
        axios.post(`${process.env.REACT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/remove-cookies`, {}, { withCredentials: true }).finally(() => {
            setLoading(false)
        })
    }

    const handleRedirectCookies = () => {
        window.open(`${process.env.REACT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/cookies`, "_self")
    }

    return (
        <div className='container max-w-[1920px] h-screen flex items-center justify-center mx-auto px-10 pt-10 font-mono'>
            <div className='flex flex-col gap-6 text-center'>
                <h6>Welcome to the site..</h6>
                <div className={`text-center text-sm transition-all duration-200 overflow-hidden ${loading ? 'h-full' : 'h-[0px]'}`}>Loading ....</div>
                <div className='flex gap-4'>
                    <button className='border-2 border-black p-2 rounded-lg text-sm min-w-[100px] hover:bg-black hover:text-white transition-all duration-200' onClick={handleSetCookies}>Set Cookies</button>
                    <button className='border-2 border-black p-2 rounded-lg text-sm min-w-[100px]  hover:bg-black hover:text-white transition-all duration-200' onClick={handleRemoveCookies}>Delete Cookies</button>
                    <button className='border-2 border-black p-2 rounded-lg text-sm min-w-[100px]  hover:bg-black hover:text-white transition-all duration-200' onClick={handleRedirectCookies}>Redirect Cookies</button>
                </div>
            </div>
        </div>
    )
}

export default HomePage