import React, { useEffect, useState } from 'react';
import {useNavigate, useSearchParams} from "react-router-dom";

const FilterSidebar = () => {

  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate(); //It is used to change the URL or redirect the user programmatically in your React app.

  const [filters, setFilters]  = useState({
    category:[],
    gender:[],
    color:[],
    size:[],
    material:[],
    brand:[],
    minPrice:0,
    maxprice:100,
  });

  const handleFilterChange = (e) => {
    const {name, value, checked, type} = e.target;
    // console.log({name, value, checked, type});
    let newFilter = {...filters};
    if(type === "checkbox"){
      if(checked){
        newFilter[name] = [...(newFilter[name] || []), value]; //newFilter["category"] = [...(filters["category"] || []), "Top Wear"];
      }
      else{
        newFilter[name] = newFilter[name].filter((item) => item !== value); 
        /*
          name = "size"
          value = "M"
          checked = false
          
          newFilter[name] = newFilter[name].filter((item) => item !== value);
        
          newFilter[name] → means newFilter["size"] → that’s ["S", "M", "L"]

          .filter((item) => item !== value) → goes through each item:

          For "S" → "S" !== "M" ✅ (keep it)

          For "M" → "M" !== "M" ❌ (remove it)

          For "L" → "L" !== "M" ✅ (keep it)
        */
      }
    } 
    else{
      newFilter[name] = value;
    }
    setFilters(newFilter);
    updateURLParams(newFilter);
    console.log(newFilter);
    
    
  }

  const [priceRange, setPriceRange] = useState([0,100]);

  const categories = ["Top Wear","Bottom Wear"];

  const colors = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
  "pink",
  "teal",
  "brown",
  "gray"
  ];
  const sizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "3XL",
    "4XL",
    "5XL",
    "Free Size"
  ];
  const brands = [
    "Zara",
    "H&M",
    "Uniqlo",
    "Nike",
    "Adidas",
    "Levi's",
    "Puma",
    "Forever 21",
    "Gap",
    "Tommy Hilfiger"
  ];
  const genders = ["Men","Women"];

  useEffect(()=>{ 
    const params = Object.fromEntries([...searchParams]);
    setFilters({
      category: params.category ?params.category.split(",") :[],
      gender: params.gender ?params.gender.split(",") :[],
      color: params.color?params.color.split(",") :[],
      size:params.size ? params.size.split(",") :[],
      material:params.material ? params.material.split(",") :[],
      brand:params.brand ? params.brand.split(",") :[],
      minPrice: params.minPrice || 0,
      maxPrice: params.maxPrice  || 100
    });
    setPriceRange([0,params.maxPrice  || 100]);
  },[searchParams]);

  const updateURLParams = (newFilter) => {
    const params = new URLSearchParams(); //URLSearchParams is used to create or modify the query string part of a URL (the part after the ?).
    //{category;"Top Wear",Size:["XS","S"]}
    Object.keys(newFilter).forEach((key)=>{
      if(Array.isArray(newFilter[key])&&newFilter[key].length>0){
        params.append(key,newFilter[key].join(","));//"XS,S"
        }
        else if(newFilter[key]){
          params.append(key, newFilter[key]);
        }
    });
    setSearchParams(params); //setSearchParams() is for updating the current URL’s query state. 
    navigate(`?${params.toString()}`); //?category = Bottom+Wear&size=XS%2CS // this is enough for the updating the url and navigating the page
  };

  const handlePriceChange = (e) => {
    const newPrice = e.target.value;
    setPriceRange([0,newPrice]);
    const newFilter = {...filters, minPrice:0 , maxPrice: newPrice};
    setFilters (newFilter);
    updateURLParams(newFilter);
  };

  return (
    <div className='p-8 w-full'>
      <h3 className="text-xl font-medium text-gray-800 mb-4">Filter</h3>
      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Category</label>
        {categories.map((category) => (
          <div key={category} className="flex items-center mb-1 p-1">
            <input value={category} checked={filters.category.includes(category)} onChange={handleFilterChange} type="checkbox" name='category' className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 " />
            <span className="text-gray-700">{category}</span>
          </div>
        ))}
      </div>
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Gender</label>
        {genders.map((gender) => (
          <div key={gender} className="flex items-center mb-1 p-1">
            <input value={gender} checked={filters.gender.includes(gender)} onChange={handleFilterChange} type="checkbox" name='gender' className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 " />
            <span className="text-gray-700">{gender}</span>
          </div>
        ))}
      </div>
      <div className="mb-6">
        <label className=" text-gray-600 font-medium mb-2">Colors</label>
        <div className="flex flex-wrap gap-2 max-w-[148px]">
          {colors.map((color) => (
          <button 
            key={color}
            name='color'
            value={color} 
            checked={filters.color.includes(color)}
            onClick={handleFilterChange}
            className="w-8 h-8 rounded-full border cursor-pointer transition hover:scale-105" 
            style={{
            backgroundColor: color.toLowerCase(),
            }}> 
          </button>
        ))}
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">sizes</label>
        {sizes.map((size) => (
          <div key={size} className="flex items-center mb-1 p-1">
            <input value={size} checked={filters.size.includes(size)} onChange={handleFilterChange} type="checkbox" name='size' className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 " />
            <span className="text-gray-700">{size}</span>
          </div>
        ))}
      </div>
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Brands</label>
        {brands.map((brand) => (
          <div key={brand} className="flex items-center mb-1 p-1">
            <input value={brand} checked={filters.brand.includes(brand)} onChange={handleFilterChange} type="checkbox" name='brand' className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 " />
            <span className="text-gray-700">{brand}</span>
          </div>
        ))}
      </div>
      <div className="mb-8">
        <label className="block text-gray-600 font-medium mb-2">Price Range</label>
        <input type="range" name='priceRange' min={0} max={100} value={priceRange[1]} /* here the use of value is to change the slider to the current position try:just remove the value and manually change the url max price then the slider will not move */ onChange={handlePriceChange}  className="w-full h-2 bg-gray-300 rounded-lg appearance-none" />
        <div className="flex justify-between text-gray-600">
          <span>$0</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>
      
    </div>
  )
}

export default FilterSidebar;