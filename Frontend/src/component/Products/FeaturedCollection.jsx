import React from 'react'
import featuredImg from "../../assets/featured.webp"
import { Link } from 'react-router-dom';


const FeaturedCollection = () => {
  return (
    <div className='flex flex-col-reverse lg:flex-row h-auto mt-7 ml-12 mr-12 rounded-lg  bg-green-100 justify-end lg:rounded-tr-3xl lg:rounded-br-3xl ' >
        <div className="lg:w-1/2 p-10 mt-20 text-center lg:text-left ">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Comfort and Style
        </h2>
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Apparel made for your everyday life
        </h2>
        <p className="text-lg text-gray-600 mb-6">
            Online Shopping Site for Designer Clothes, Accessories & Lifestyle Products in India. Shop at Best Prices & Attractive Offers from India's.
        </p>
        <Link to='/collections/all' className='bg-black text-white px-6 py-3 rounded-lg text-lg hover:bg-gray-800'>
        Shop Now
        </Link>
        </div>
        <div className="lg:w-1/2">
        <img src= {featuredImg} alt="featuredImg" className='w-full h-full object-cover lg:rounded-tr-3xl lg:rounded-br-3xl' />
        </div>
    </div>
  )
}

export default FeaturedCollection;