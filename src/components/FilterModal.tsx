"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type FilterOption = {
  label: string;
  value: string;
  field: string;
};

type FilterModalProps = {
  options: FilterOption[];
};

const FilterModal = ({ options }: FilterModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize selectedFilters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialFilters: Record<string, string[]> = {};
    
    // Group options by field
    const groupedOptions: Record<string, FilterOption[]> = {};
    options.forEach(option => {
      if (!groupedOptions[option.field]) {
        groupedOptions[option.field] = [];
      }
      groupedOptions[option.field].push(option);
    });
    
    // Check each option field in URL params
    Object.keys(groupedOptions).forEach(field => {
      const value = params.get(field);
      if (value) {
        // Support comma-separated values for multiple selection
        initialFilters[field] = value.split(',');
      }
    });
    
    setSelectedFilters(initialFilters);
    
    // Initialize all sections as expanded
    const sections: Record<string, boolean> = {};
    Object.keys(groupedOptions).forEach(field => {
      sections[field] = true;
    });
    setExpandedSections(sections);
  }, [options]);
  
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
      document.dispatchEvent(new CustomEvent('modalOpened', { detail: 'filter' }));
      
      // Set up listener to close this modal if another opens
      const closeThisModal = (e: CustomEvent) => {
        if (e.detail !== 'filter') {
          setIsOpen(false);
        }
      };
      
      document.addEventListener('modalOpened', closeThisModal as EventListener);
      
      return () => {
        document.removeEventListener('modalOpened', closeThisModal as EventListener);
      };
    }
  }, [isOpen]);

  const toggleSection = (field: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleFilterSelect = (field: string, value: string) => {
    setSelectedFilters(prev => {
      const currentValues = prev[field] || [];
      const valueIndex = currentValues.indexOf(value);
      
      if (valueIndex === -1) {
        // Add value if not present
        return {
          ...prev,
          [field]: [...currentValues, value]
        };
      } else {
        // Remove value if already present
        const newValues = [...currentValues];
        newValues.splice(valueIndex, 1);
        return {
          ...prev,
          [field]: newValues
        };
      }
    });
  };

  const applyFilters = () => {
    const params = new URLSearchParams(window.location.search);
    
    // Clear any existing filter parameters
    Object.keys(selectedFilters).forEach(field => {
      if (params.has(field)) {
        params.delete(field);
      }
    });
    
    // Add new filter parameters with comma-separated values
    Object.entries(selectedFilters).forEach(([field, values]) => {
      if (values.length > 0) {
        params.set(field, values.join(','));
      }
    });
    
    // Reset to first page
    params.set("page", "1");
    
    router.push(`${window.location.pathname}?${params}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(window.location.search);
    
    // Remove all filter parameters
    Object.keys(selectedFilters).forEach(field => {
      if (params.has(field)) {
        params.delete(field);
      }
    });
    
    // Reset to first page
    params.set("page", "1");
    
    router.push(`${window.location.pathname}?${params}`);
    setIsOpen(false);
    setSelectedFilters({});
  };

  // Group options by field
  const groupedOptions: Record<string, FilterOption[]> = {};
  options.forEach(option => {
    if (!groupedOptions[option.field]) {
      groupedOptions[option.field] = [];
    }
    groupedOptions[option.field].push(option);
  });

  // Calculate active filter count
  const activeFilterCount = Object.values(selectedFilters)
    .reduce((count, values) => count + values.length, 0);

  return (
    <div className="relative">
      <button 
        className="w-8 h-8 flex items-center justify-center rounded-full bg-campDarwinCobaltBlue relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image src="/filter.png" alt="Filter" width={20} height={20} />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          ref={modalRef}
          className="absolute right-0 top-10 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden"
          style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
        >
          <div className="bg-gray-50 flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-base font-medium text-gray-800">Filter Options</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              <span className="text-xl">&times;</span>
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {Object.entries(groupedOptions).map(([field, fieldOptions]) => (
              <div key={field} className="mb-2 border border-gray-200 rounded-md overflow-hidden">
                <div 
                  className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                  onClick={() => toggleSection(field)}
                >
                  <h4 className="text-sm font-medium capitalize text-gray-700">
                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    {selectedFilters[field]?.length > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                        {selectedFilters[field].length}
                      </span>
                    )}
                  </h4>
                  <span className={`transform transition-transform ${expandedSections[field] ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
                
                {expandedSections[field] && (
                  <div className="p-3 bg-white border-t border-gray-200 max-h-48 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {fieldOptions.map(option => (
                        <div 
                          key={option.value}
                          className={`
                            py-1 px-2 text-xs rounded-full cursor-pointer transition-colors
                            ${(selectedFilters[field] || []).includes(option.value) 
                              ? 'bg-campDarwinCobaltBlue text-white' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                          `}
                          onClick={() => handleFilterSelect(field, option.value)}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200">
            <button 
              className="text-sm py-1.5 px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              onClick={clearFilters}
            >
              Clear All
            </button>
            <button 
              className="text-sm py-1.5 px-4 bg-campDarwinCobaltBlue text-white rounded hover:bg-blue-700 transition-colors"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterModal;
