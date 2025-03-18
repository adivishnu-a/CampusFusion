/* eslint-disable no-undef */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type SortOption = {
  label: string;
  field: string;
};

type SortModalProps = {
  options: SortOption[];
};

const SortModal = ({ options }: SortModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Initialize sort values from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fieldParam = params.get("sortField");
    const orderParam = params.get("sortOrder");
    
    if (fieldParam) {
      setSortField(fieldParam);
    }
    
    if (orderParam === "desc") {
      setSortOrder("desc");
    } else if (orderParam === "asc") {
      setSortOrder("asc");
    }
  }, []);
  
  useEffect(() => {
    // Add click event listener to close modal when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    // Add listener when modal is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    // Clean up the listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  
  // Add an event for other components to listen to
  useEffect(() => {
    if (isOpen) {
      // Dispatch custom event when this modal opens
      document.dispatchEvent(new CustomEvent('modalOpened', { detail: 'sort' }));
      
      // Set up listener to close this modal if another opens
      const closeThisModal = (e: CustomEvent) => {
        if (e.detail !== 'sort') {
          setIsOpen(false);
        }
      };
      
      document.addEventListener('modalOpened', closeThisModal as EventListener);
      
      return () => {
        document.removeEventListener('modalOpened', closeThisModal as EventListener);
      };
    }
  }, [isOpen]);

  const applySort = () => {
    const params = new URLSearchParams(window.location.search);
    
    // Update sort parameters
    if (sortField) {
      params.set("sortField", sortField);
      params.set("sortOrder", sortOrder);
    } else {
      params.delete("sortField");
      params.delete("sortOrder");
    }
    
    router.push(`${window.location.pathname}?${params}`);
    setIsOpen(false);
  };

  const clearSort = () => {
    setSortField("");
    setSortOrder("asc");
    
    const params = new URLSearchParams(window.location.search);
    params.delete("sortField");
    params.delete("sortOrder");
    
    router.push(`${window.location.pathname}?${params}`);
    setIsOpen(false);
  };

  const handleSortClick = (field: string) => {
    if (sortField === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // New field defaults to ascending
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="relative">
      <button 
        className="w-8 h-8 flex items-center justify-center rounded-full bg-campDarwinCobaltBlue relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image src="/sort.png" alt="Sort" width={20} height={20} />
        {sortField && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            1
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          ref={modalRef}
          className="absolute right-0 top-10 w-72 bg-white rounded-md shadow-lg z-50 overflow-hidden"
          style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
        >
          <div className="bg-gray-50 flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-base font-medium text-gray-800">Sort Options</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              <span className="text-xl">&times;</span>
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {options.map((option) => (
              <div 
                key={option.field}
                className={`
                  flex justify-between items-center p-3 rounded-md mb-2 cursor-pointer 
                  ${sortField === option.field 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50 border border-transparent'}
                `}
                onClick={() => handleSortClick(option.field)}
              >
                <div className="flex items-center">
                  {sortField === option.field && (
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-campDarwinCobaltBlue text-white mr-2">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </div>
                  )}
                  <span className={`${sortField === option.field ? 'font-medium text-blue-800' : 'text-gray-700'}`}>
                    {option.label}
                  </span>
                </div>
                
                {sortField === option.field && (
                  <div className="flex items-center gap-2">
                    <button 
                      className={`w-8 h-6 rounded-md flex items-center justify-center border ${
                        sortOrder === "asc" 
                          ? 'bg-campDarwinCobaltBlue text-white' 
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSortOrder("asc");
                      }}
                    >
                      ↑
                    </button>
                    <button 
                      className={`w-8 h-6 rounded-md flex items-center justify-center border ${
                        sortOrder === "desc" 
                          ? 'bg-campDarwinCobaltBlue text-white' 
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSortOrder("desc");
                      }}
                    >
                      ↓
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200">
            <button 
              className="text-sm py-1.5 px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              onClick={clearSort}
            >
              Clear
            </button>
            <button 
              className="text-sm py-1.5 px-4 bg-campDarwinCobaltBlue text-white rounded hover:bg-blue-700 transition-colors"
              onClick={applySort}
            >
              Apply Sort
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortModal;
