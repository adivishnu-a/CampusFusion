"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function NotFound() {
  // Extract entity type from URL
  const pathname = usePathname();
  const segments = pathname?.split('/') || [];
  const entityType = segments.length > 2 ? segments[2] : 'item';
  const entitySingular = entityType.endsWith('s') ? entityType.slice(0, -1) : entityType;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-campDarwinSlateGray p-4">
      <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-md">
        <div className="mb-6">
          <Image 
            src="/logo.png"
            alt="Not found"
            width={80}
            height={80}
            className="mx-auto opacity-70"
          />
        </div>
        
        <h1 className="text-2xl font-bold text-campDarwinCobaltBlue mb-2">
          {entitySingular.charAt(0).toUpperCase() + entitySingular.slice(1)} Not Found
        </h1>
        
        <p className="text-gray-600 mb-6">
          The {entitySingular} you&apos;re looking for doesn&apos;t exist or the ID is invalid.
        </p>
        
        <Link 
          href={`/list/${entityType}`}
          className="inline-flex items-center px-4 py-2 bg-campDarwinCobaltBlue text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          Back to {entityType.charAt(0).toUpperCase() + entityType.slice(1)} List
        </Link>
      </div>
    </div>
  );
}
