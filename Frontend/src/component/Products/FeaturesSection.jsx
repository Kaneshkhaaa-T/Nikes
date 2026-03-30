import React from 'react'
import { FaMoneyCheck, FaRepeat } from 'react-icons/fa6';
import { MdLock } from 'react-icons/md';

const FeaturesSection = () => {
  return (
    <div className="px-4 py-16 mx-auto grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3">
        <div className="px-12 py-20  flex flex-col items-center justify-center text-center">
            <MdLock className='w-5 h-5' />
            <h1 className="uppercase font-bold text-black items-center mt-4">
                Free International Shipping
            </h1>
            <p className="text-black items-center font-thin">
                on all orders over $100.00
            </p>
        </div>
        <div className="px-12 py-20 flex flex-col items-center justify-center text-center">
            <FaRepeat className='w-5 h-5' />
            <h1 className="uppercase font-bold text-black items-center mt-4">
                45 days return
            </h1>
            <p className="text-black items-center font-thin">
                Money back gaurantee
            </p>
        </div>
        <div className="px-12 py-20 flex flex-col items-center justify-center text-center">
            <FaMoneyCheck className='w-5 h-5' />
            <h1 className="uppercase font-bold text-black items-center mt-4">
                Secure Checkout
            </h1>
            <p className="text-black items-center font-thin">
                100% secure checkout process
            </p>
        </div>
    </div>
  )
}

export default FeaturesSection;