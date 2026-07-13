import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SearchBar = ({ mobile = false }) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const expanded = mobile || isExpanded || query.trim().length > 0;

  const focusInput = () => {
    if (!expanded) setIsExpanded(true);
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = query.trim();
    if (!searchTerm) return;

    navigate(`/collection?search=${encodeURIComponent(searchTerm)}`);
    setQuery('');
    if (!mobile) setIsExpanded(false);
    inputRef.current?.blur();
  };

  const containerClassName = mobile
    ? 'flex w-full items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-white backdrop-blur-sm'
    : `flex h-11 items-center overflow-hidden rounded-full border bg-white shadow-sm transition-all duration-300 ease-out ${expanded ? 'w-72' : 'w-12'}`;

  const inputClassName = mobile
    ? 'flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/65'
    : `bg-transparent text-sm text-gray-700 outline-none transition-all duration-300 ${expanded ? 'w-full px-1 opacity-100' : 'w-0 px-0 opacity-0'}`;

  const iconButtonClassName = mobile
    ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25'
    : 'flex h-11 w-11 shrink-0 items-center justify-center text-gray-400 transition-colors hover:text-[#b22222]';

  const clearButtonClassName = mobile
    ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white'
    : 'flex h-11 w-11 shrink-0 items-center justify-center text-gray-300 transition-colors hover:text-gray-500';

  return (
    <form
      onSubmit={handleSearch}
      className={mobile ? 'w-full' : 'w-full md:w-auto'}
    >
      <div className={containerClassName}>
        <button
          type="button"
          onClick={expanded && query.trim() ? handleSearch : focusInput}
          className={iconButtonClassName}
          aria-label={expanded && query.trim() ? 'Search products' : 'Open search'}
        >
          <FaSearch className="text-sm" />
        </button>

        <input
          ref={inputRef}
          className={inputClassName}
          type="text"
          value={query}
          onFocus={() => !mobile && setIsExpanded(true)}
          onBlur={() => {
            if (!mobile && !query.trim()) setIsExpanded(false);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!mobile) setIsExpanded(true);
          }}
          placeholder="Search products..."
        />

        {expanded && query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              if (!mobile) setIsExpanded(false);
              inputRef.current?.focus();
            }}
            className={clearButtonClassName}
            aria-label="Clear search"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
