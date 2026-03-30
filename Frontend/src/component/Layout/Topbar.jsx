import React from 'react'
import { IoLogoInstagram } from 'react-icons/io';
import { RiTwitterXLine } from 'react-icons/ri';
import { TbBrandMeta } from 'react-icons/tb'

const Topbar = () => {
  return (
    <div className="bg-rabbit-red text-white">
        <div className= "container mx-auto flex justify-between  py-3 px-4">
            <div className='hidden md:flex items-center space-x-4' >
                <a href='#' className="hover:text-black">
                    <TbBrandMeta className='w-5 h-5' />
                </a>
                <a href='#' className="hover:text-black">
                    <IoLogoInstagram className='w-5 h-5' />
                </a>
                <a href='#' className="hover:text-black">
                    <RiTwitterXLine className='w-4 h-4' />
                </a>
            </div>
            <div  className='text-sm text-center flex-grow' >
                <span>We ship worldwide - Fast and reliable shipping!</span>
            </div>
            <div>
                <a href="tel:+1234567890" className='hidden md:block hover:text-black'>+91-8148752255</a>
            </div>
        </div>
    </div>
  )
}

export default Topbar;