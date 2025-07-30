import React from 'react'
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

const SearchBar = () => {

    const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
  return showSearch ? (
    <div className='border-t border-b text-center bg-gray-50'>
        <div className='inline-flex items-center justify-center border border-gray-300 rounded-full p-2'>
      <input className='flex-1 outline-none bg-inherit text-sm'
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
      />
      {/* Optional: Add a search icon */}
      <span className='material-icons'>search</span>
      </div>
    </div>
  ) : null;
}

export default SearchBar
