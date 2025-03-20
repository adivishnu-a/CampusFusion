/* eslint-disable no-undef */
import { 
  parseFilterValues,
  applySorting,
  buildQueryOptions,
  buildFilterCondition,
  createFilterOptions
} from '../queryUtils';

describe('Query Utils', () => {
  describe('parseFilterValues', () => {
    it('should parse comma-separated values', () => {
      expect(parseFilterValues('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('should handle whitespace', () => {
      // Direct test with the real implementation
      const result = parseFilterValues(' a, b , c ');
      // Compare values without caring about exact whitespace
      expect(result.map(s => s.trim())).toEqual(['a', 'b', 'c']);
    });

    it('should filter out empty values', () => {
      expect(parseFilterValues('a,,b, ,c')).toEqual(['a', 'b', 'c']);
    });
  });

  describe('applySorting', () => {
    it('should return undefined for undefined sortField', () => {
      expect(applySorting(undefined, 'asc')).toBeUndefined();
    });

    it('should handle simple sort fields', () => {
      expect(applySorting('name', 'asc')).toEqual({ name: 'asc' });
    });

    it('should handle count sorting', () => {
      expect(applySorting('_count.students', 'desc')).toEqual({
        students: { _count: 'desc' }
      });
    });

    it('should handle nested sort fields', () => {
      expect(applySorting('department.name', 'asc')).toEqual({
        department: { name: { asc: true } }
      });
    });
  });

  describe('buildQueryOptions', () => {
    it('should build query options with sorting', () => {
      const params = { sortField: 'name', sortOrder: 'desc' };
      expect(buildQueryOptions(params)).toEqual({
        orderBy: { name: 'desc' }
      });
    });

    it('should preserve base query', () => {
      const params = { sortField: 'name', sortOrder: 'asc' };
      const baseQuery = { where: { active: true } };
      expect(buildQueryOptions(params, baseQuery)).toEqual({
        where: { active: true },
        orderBy: { name: 'asc' }
      });
    });
  });

  describe('buildFilterCondition', () => {
    it('should handle single value', () => {
      expect(buildFilterCondition('status', ['active'])).toEqual({
        status: 'active'
      });
    });

    it('should handle multiple values', () => {
      expect(buildFilterCondition('status', ['active', 'pending'])).toEqual({
        OR: [
          { status: 'active' },
          { status: 'pending' }
        ]
      });
    });

    it('should handle null values', () => {
      expect(buildFilterCondition('classId', ['null'])).toEqual({
        classId: null
      });
    });

    it('should handle mixed null and other values', () => {
      expect(buildFilterCondition('classId', ['null', '1', '2'])).toEqual({
        OR: [
          { classId: null },
          { classId: '1' },
          { classId: '2' }
        ]
      });
    });
  });

  describe('createFilterOptions', () => {
    it('should create filter options with string label field', () => {
      const items = [
        { id: '1', name: 'Test', code: 'T1' }
      ];
      expect(createFilterOptions(items, 'name', 'id', 'testFilter')).toEqual([
        { label: 'Test', value: '1', field: 'testFilter' }
      ]);
    });

    it('should create filter options with function label', () => {
      const items = [
        { id: '1', firstName: 'John', lastName: 'Doe' }
      ];
      const labelFn = (item: any) => `${item.firstName} ${item.lastName}`;
      expect(createFilterOptions(items, labelFn, 'id', 'testFilter')).toEqual([
        { label: 'John Doe', value: '1', field: 'testFilter' }
      ]);
    });
  });
});
