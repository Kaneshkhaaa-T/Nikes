import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PayPalButton from './PayPalButton';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { createCheckout } from "../../Redux/Slices/checkoutSlice";



const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, loading,error } = useSelector((state)=>state.cart);
  const { user } = useSelector((state) => state.auth);
  const [checkoutId, setCheckoutId] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  // Ensure cart is loaded before proceeding
  useEffect(()=>{
    if(!cart||!cart.products||cart.products.length===0){
      navigate("/");
    }
  },[cart, navigate]);

  const handleCreateCheckout = async (e) => {
    e.preventDefault();
    if(cart && cart.products.length > 0){
      const res = await dispatch(
        createCheckout({
          checkoutItems:cart.products,
          shippingAddress,
          paymentMethod:"Paypal",
          totalPrice: cart.totalPrice,
        })
      );
      if(res.payload && res.payload._id){
        setCheckoutId(res.payload._id)
      }
    }
  };

  const handlePaymentSuccess = async(details) => { 
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
        {paymentStatus : "paid",paymentDetails: details},
        {
          headers:{
            Authorization:`Bearer ${localStorage.getItem("userToken")}`,
          }
        }
      );
     
        await handleFinalizeCheckout(checkoutId);
      
    } catch (error) {
       console.error(error);
    }
    navigate("/order-confirmation");
  };

  const handleFinalizeCheckout = async (checkoutId) => {
    try {
      const response = await axios.post(
         `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/finalize`, {},
         {
             headers:{
               Authorization:`Bearer ${localStorage.getItem("userToken")}`
            }
         }
      );
      navigate("/order-confrimation");
    } catch (error) {
      console.error(error);
    }
  }

  if(loading) return <p>Loading Cart....</p>
  if(error) return <p>Error:</p>
  if(!cart || !cart.products || cart.products.length === 0){
   return <p>Your cart is empty</p> ;
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter'>
      
      {/* LEFT SIDE - Checkout Form */}
      <div className='bg-white rounded-lg p-6'>
        <h2 className='text-2xl uppercase mb-6'>Checkout</h2>

        <form onSubmit={handleCreateCheckout}>
          <h3 className='text-lg mb-4'>Contact Details</h3>

          <div className='mb-4'>
            <label className='block text-gray-700'>Email</label>
            <input
              type="email"
              value={user?user.email : ""}
              disabled
              className='w-full p-2 border rounded bg-gray-100'
            />
          </div>

          {/* Name */}
          <div className='mb-4 grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-gray-700'>First Name</label>
              <input
                type="text"
                value={shippingAddress.firstName}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, firstName: e.target.value })
                }
                className='w-full p-2 border rounded'
                required
              />
            </div>

            <div>
              <label className='block text-gray-700'>Last Name</label>
              <input
                type="text"
                value={shippingAddress.lastName}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, lastName: e.target.value })
                }
                className='w-full p-2 border rounded'
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className='mb-4'>
            <label className='block text-gray-700'>Address</label>
            <input
              type="text"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, address: e.target.value })
              }
              className='w-full p-2 border rounded'
              required
            />
          </div>

          {/* City + Postal Code */}
          <div className='mb-4 grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-gray-700'>City</label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, city: e.target.value })
                }
                className='w-full p-2 border rounded'
                required
              />
            </div>

            <div>
              <label className='block text-gray-700'>Postal Code</label>
              <input
                type="text"
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                }
                className='w-full p-2 border rounded'
                required
              />
            </div>
          </div>

          {/* Country */}
          <div className='mb-4'>
            <label className='block text-gray-700'>Country</label>
            <input
              type="text"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, country: e.target.value })
              }
              className='w-full p-2 border rounded'
              required
            />
          </div>

          {/* Phone */}
          <div className='mb-4'>
            <label className='block text-gray-700'>Phone</label>
            <input
              type="text"
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, phone: e.target.value })
              }
              className='w-full p-2 border rounded'
              required
            />
          </div>

          {/* Payment Section */}
          <div className='mt-6'>
            {!checkoutId ? (
              <button
                type="submit"
                className='w-full bg-black text-white py-3 rounded'
              >
                Continue to Payment
              </button>
            ) : (
              <div>
                <h3 className='text-lg mb-4'>Pay with PayPal</h3>
                <PayPalButton
                  amount={cart.totalPrice}
                  onSuccess={handlePaymentSuccess}
                  onError={() => alert("Payment failed. Try again.")}
                />
              </div>
            )}
          </div>
        </form>
      </div>

      {/* RIGHT SIDE - Order Summary */}
      <div>
        <div className='bg-gray-50 p-6 rounded-lg'>
          <h3 className='text-lg mb-4'>Order Summary</h3>

          <div className='border-t py-4 mb-4'>
            {cart.products.map((product, index) => (
              <div
                key={index}
                className='flex items-start justify-between py-4 border-b'
              >
                <div className='flex items-start'>
                  <img
                    src={product.image}
                    alt={product.name}
                    className='w-20 h-24 object-cover mr-4 rounded'
                  />

                  <div>
                    <p className='font-semibold'>{product.name}</p>
                    <p className='text-sm text-gray-600'>Size: {product.size}</p>
                    <p className='text-sm text-gray-600'>Color: {product.color}</p>
                    <p className='text-sm text-gray-600'>Qty: {product.quantity}</p>
                    <p className='font-semibold mt-1'>₹{product.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className='flex justify-between text-lg font-semibold'>
            <span>Total:</span>
            <span>₹{cart.totalPrice?.toLocaleString()}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Checkout;
