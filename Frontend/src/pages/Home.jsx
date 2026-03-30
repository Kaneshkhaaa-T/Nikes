import React, { useEffect, useState } from 'react'
import Hero from '../component/Layout/Hero'
import GenderCollection from '../component/Products/GenderCollection'
import NewArrivals from '../component/Products/NewArrivals'
import ProductDetails from '../component/Products/ProductDetails'
import ProductGrid from '../component/Products/ProductGrid'
import FeaturedCollection from '../component/Products/FeaturedCollection'
import FeaturesSection from '../component/Products/FeaturesSection'
import {useDispatch, useSelector} from "react-redux";
import { fetchProductsByFilters } from "../Redux/Slices/productsSlice";
import axios from 'axios'



const Home = () => {

  const dispatch = useDispatch();
  const {products,loading,error} = useSelector((state)=>state.products);
  const [bestSellerProduct, setBestSellerProduct] = useState(null);

  useEffect(() => {

  // Fetch product for specific collection
  dispatch(
    fetchProductsByFilters({
      gender: "Women",
      category: "Top Wear",
      limit: 8,
    })
  );

  const fetchBestSeller = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`
      );

      // ✅ Add these two lines
      console.log("Full response:", JSON.stringify(response.data));
      console.log("_id value:", response.data?._id);

      setBestSellerProduct(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  fetchBestSeller();

}, [dispatch]);



  return (

    <div>
      <Hero />
      <GenderCollection />
      <NewArrivals/>
      <h2 className='text-3xl text-center font-bold mb-4' >
        Best Seller
      </h2>
      {bestSellerProduct?._id ? (
  <ProductDetails productId={bestSellerProduct._id} />
) : (
  <p className="text-center">Loading best seller product....</p>
)}
     
      <div className="container mx-auto">
        <h2 className="text-3xl text-center font-bold mb-4">
          Top Wear for Women
        </h2>
        <ProductGrid products={products} loading={loading} error={error} />
      </div>
      <FeaturedCollection />
      <FeaturesSection />
    </div>
  )
} 

export default Home
