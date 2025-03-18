"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getEntityName } from '@/lib/actions';

const Breadcrumb = () => {
  const pathname = usePathname();
  const [showFullPath, setShowFullPath] = useState(false);
  const [entityName, setEntityName] = useState<string | null>(null);
  
  // Skip these segments in the breadcrumb
  const excludeSegments = ['list', '[[...sign-in]]', '(dashboard)'];
  
  // Function to format path segments for display
  const formatPathSegment = (segment: string) => {
    // For IDs, show the fetched name instead
    if (entityName && /^[0-9a-fA-F]{24}$/.test(segment)) {
      return entityName;
    }
    // Otherwise capitalize first letter and replace hyphens with spaces
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  };
  
  // Fetch entity name when the pathname contains an ID
  useEffect(() => {
    const fetchEntityName = async () => {
      const segments = pathname.split('/');
      const entityType = segments[segments.length - 2]; // 'students' or 'teachers'
      const id = segments[segments.length - 1];
      
      // Only fetch if we have a valid MongoDB ObjectID
      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        try {
          const data = await getEntityName(entityType, id);
          if (data) {
            setEntityName(data.name + " " + data.surname);
          }
        } catch (error) {
          console.error('Error fetching entity name:', error);
        }
      }
    };

    fetchEntityName();
  }, [pathname]);
  
  // Extract and process path segments
  const getPathSegments = () => {
    const segments = pathname.split('/').filter(segment => segment);
    
    // Filter out excluded segments
    const filteredSegments = segments.filter(segment => 
      !excludeSegments.some(excluded => segment.includes(excluded))
    );
    
    return filteredSegments.map((segment, index) => {
      // Create the href for this segment
      const href = '/' + filteredSegments.slice(0, index + 1).join('/');
      
      return {
        name: formatPathSegment(segment),
        href: href
      };
    });
  };
  
  const pathSegments = getPathSegments();
  
  // Determine if we need to use ellipsis (only when there are 3+ total segments)
  const shouldUseEllipsis = pathSegments.length > 1;
  
  // Create the breadcrumb items array based on whether we're showing full path
  let breadcrumbItems = [];
  
  if (showFullPath || !shouldUseEllipsis) {
    // Show all segments (Home + all path segments)
    breadcrumbItems = [
      { name: 'Home', href: '/' },
      ...pathSegments
    ];
  } else {
    // Show just Home and the current page
    breadcrumbItems = [
      { name: 'Home', href: '/' }
    ];
    
    // If there's exactly one intermediate page, show it without ellipsis
    if (pathSegments.length === 2) {
      breadcrumbItems.push(pathSegments[0], pathSegments[1]);
    } 
    // If there are more intermediate pages, show ellipsis
    else if (pathSegments.length > 0) {
      breadcrumbItems.push(pathSegments[pathSegments.length - 1]);
    }
  }
  
  // Only show toggle if there are more than 2 segments (Home + intermediate pages + current)
  const showToggle = pathSegments.length > 2;

  return (
    <nav className="flex items-center text-sm">
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        return (
          <div key={item.href} className="flex items-center">
            {index === 1 && !showFullPath && showToggle && (
              <>
                <button 
                  onClick={() => setShowFullPath(true)} 
                  className="text-gray-500 hover:text-gray-700 mx-2"
                >
                  ...
                </button>
                <span className="mx-2 text-gray-500">&gt;</span>
              </>
            )}
            <Link 
              href={item.href}
              className={`${isLast ? 'text-gray-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {item.name}
            </Link>
            {!isLast && <span className="mx-2 text-gray-500">&gt;</span>}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;