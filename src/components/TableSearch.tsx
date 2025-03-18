/* eslint-disable no-unused-vars */
"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

const TableSearch = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [isActive, setIsActive] = useState(false);
  const searchFormRef = useRef<HTMLFormElement>(null);

  // Set initial search value from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    if (searchParam) {
      setSearchValue(searchParam);
    }
  }, []);

  useEffect(() => {
    // Close other modals when search is focused
    const handleFocus = () => {
      setIsActive(true);
      document.dispatchEvent(new CustomEvent('modalOpened', { detail: 'search' }));
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchFormRef.current && !searchFormRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };
    
    // Add listener when the component is mounted
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    
    // Update or remove search parameter
    if (searchValue.trim()) {
      params.set("search", searchValue);
    } else {
      params.delete("search");
    }
    
    // Reset to first page when searching
    params.set("page", "1");
    
    router.push(`${window.location.pathname}?${params}`);
  };

  const clearSearch = () => {
    setSearchValue("");
    const params = new URLSearchParams(window.location.search);
    params.delete("search");
    params.set("page", "1");
    router.push(`${window.location.pathname}?${params}`);
  };

  return (
    <form
      ref={searchFormRef}
      onSubmit={handleSubmit}
      onFocus={() => setIsActive(true)}
      className={`
        w-full md:w-auto flex items-center gap-2 rounded-full
        transition-all duration-200 ease-in-out
        ${isActive 
          ? 'ring-2 ring-campDarwinCobaltBlue bg-white shadow-sm' 
          : 'ring-1 ring-gray-300 bg-gray-50'}
        px-3
      `}
    >
      <Image src="/search.png" alt="" width={16} height={16} 
        className={`${isActive ? 'opacity-100' : 'opacity-70'}`} 
      />
      
      <input
        type="text"
        placeholder="Search..."
        className="w-[180px] sm:w-[220px] py-2 bg-transparent outline-none text-sm text-gray-700"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
      />
      
      {searchValue && (
        <button
          type="button"
          onClick={clearSearch}
          className="text-gray-400 hover:text-gray-600"
        >
          <span className="text-xl">&times;</span>
        </button>
      )}
    </form>
  );
};

export default TableSearch;