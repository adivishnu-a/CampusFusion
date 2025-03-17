import { Prisma } from "@prisma/client";

// Helper function to apply sorting to Prisma queries
export function applySorting(sortField: string | undefined, sortOrder: string | undefined) {
  if (!sortField) {
    return undefined;
  }

  const order = sortOrder === 'desc' ? 'desc' : 'asc';
  
  // Handle special cases for count sorting
  if (sortField.startsWith('_count.')) {
    // Extract the relationship name from _count.relationship
    const relationName = sortField.split('.')[1];
    
    // Use the proper format for count sorting in Prisma
    return {
      [relationName]: {
        _count: order
      }
    };
  }
  
  // Handle nested fields with dot notation (e.g., "subject.department.name")
  const fields = sortField.split('.');
  
  if (fields.length === 1) {
    return { [sortField]: order };
  }
  
  // Build nested orderBy structure for complex paths
  let result: any = { [order]: true };
  for (let i = fields.length - 1; i >= 0; i--) {
    result = { [fields[i]]: result };
  }
  
  return result;
}

// Helper to modify Prisma queries with filtering and sorting
export function buildQueryOptions<T extends Record<string, any>>(
  searchParams: { [key: string]: string | undefined },
  baseQuery: T = {} as T
): T & { orderBy?: any } {
  const { sortField, sortOrder, page, search, ...filterParams } = searchParams;
  
  const orderBy = applySorting(sortField, sortOrder);
  const result = { ...baseQuery } as T & { orderBy?: any };
  
  if (orderBy) {
    result.orderBy = orderBy;
  }
  
  return result;
}

// Parse comma-separated filter values into an array
export function parseFilterValues(value: string): string[] {
  return value.split(',').filter(v => v.trim());
}

// Helper function to build Prisma filter conditions for multiple values
export function buildFilterCondition(field: string, values: string[]): any {
  if (!values || values.length === 0) return {};

  // Handle special case for null values (like classId: null for school-wide events)
  if (values.includes('null')) {
    const otherValues = values.filter(v => v !== 'null');
    if (otherValues.length === 0) {
      return { [field]: null };
    } else {
      return { 
        OR: [
          { [field]: null },
          ...otherValues.map(value => ({ [field]: value }))
        ]
      };
    }
  }
  
  // Return OR conditions for each value instead of using 'in' operator
  if (values.length > 1) {
    return { OR: values.map(value => ({ [field]: value })) };
  }
  
  // Single value case
  return { [field]: values[0] };
}

// Helper to get filter options from a list of items
export function createFilterOptions<T extends Record<string, any>>(
  items: T[],
  labelField: keyof T | ((item: T) => string),
  valueField: keyof T,
  filterField: string
) {
  return items.map(item => ({
    label: typeof labelField === 'function' 
      ? labelField(item) 
      : String(item[labelField]),
    value: String(item[valueField]),
    field: filterField
  }));
}
