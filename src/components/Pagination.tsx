"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";

const Pagination = ({ page, count }: { page: number; count: number | null }) => {

  const router = useRouter();

  if(count===null){
    return (
      <div className="p-4 flex items-center justify-between text-gray-500">
      <button
        disabled={true}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => {
          changePage(page - 1);
        }}
      >
        Prev
      </button>
      <button
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={true}
        onClick={() => {
          changePage(page + 1);
        }}
      >
        Next
      </button>
    </div>
    )
  }
  
  const hasPrev = ITEM_PER_PAGE * (page - 1) > 0;
  const hasNext = ITEM_PER_PAGE * (page - 1) + ITEM_PER_PAGE < count;
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  
  const changePage = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`${window.location.pathname}?${params}`);
  };

  // Function to determine which page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show before and after current page
    const range: (number | string)[] = [];
    
    // Always include page 1
    range.push(1);
    
    // Calculate the start and end of the visible range
    let rangeStart = Math.max(2, page - delta);
    let rangeEnd = Math.min(totalPages - 1, page + delta);
    
    // Add ellipsis after page 1 if needed
    if (rangeStart > 2) {
      range.push("...");
    }
    
    // Add all pages in the middle range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i);
    }
    
    // Add ellipsis before the last page if needed
    if (rangeEnd < totalPages - 1) {
      range.push("...");
    }
    
    // Always include the last page if it exists and is not already included
    if (totalPages > 1) {
      range.push(totalPages);
    }
    
    return range;
  };

  return (
    <div className="p-4 flex items-center justify-between text-gray-500">
      <button
        disabled={!hasPrev}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => {
          changePage(page - 1);
        }}
      >
        Prev
      </button>
      <div className="flex items-center gap-2 text-sm">
        {getPageNumbers().map((pageNum, index) => {
          // If it's an ellipsis, render it without a button
          if (pageNum === "...") {
            return <span key={`ellipsis-${index}`} className="px-2">...</span>;
          }
          
          // Otherwise render a page button
          const pageIndex = pageNum as number;
          return (
            <button
              key={pageIndex}
              className={`px-2 rounded-sm ${
                page === pageIndex ? "bg-campDarwinPastelCobaltBlue" : ""
              }`}
              onClick={() => {
                changePage(pageIndex);
              }}
            >
              {pageIndex}
            </button>
          );
        })}
      </div>
      <button
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!hasNext}
        onClick={() => {
          changePage(page + 1);
        }}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;