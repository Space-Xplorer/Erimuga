import React from 'react'
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

const SearchBar = () => {

    const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
  return showSearch ? (
    <div className='border-t border-b text-center bg-gray-50'>
        <div className='inline-flex items-center justify-center border border-gray-300 rounded-full p-2'>
        <button
            onClick={() => setShowSearch(!showSearch)}
            className='p-2 rounded-full hover:bg-gray-100'
        >
            {showSearch ? 'Hide' : 'Show'} Search
        </button>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
      />
      </div>
    </div>
  ) : null;
}

export default SearchBar
