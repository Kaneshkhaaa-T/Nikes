import React from 'react'
import { useSearchParams } from 'react-router-dom'

const SortOptions = () => {

  const [searchParams, setSearchParams] = useSearchParams();

  const handleSortChange = (e) => {
    const sortBy = e.target.value;
    searchParams.set("sortBy",sortBy)
    setSearchParams(searchParams)
  }

  return (
    <div className="mb-4 flex items-center justify-end pr-10 ">
      <select name="" id="sort" onChange={handleSortChange} value = {searchParams.get("sortBy")||""} className="border p-2 rounded-md focus:outline-none">
        <option value="">Select</option>
        <option value="priceAsc">Low to High</option>
        <option value="priceDesc">High to Low</option>
        <option value="popularity">Popularity</option>
      </select>
    </div>
  )
}

export default SortOptions