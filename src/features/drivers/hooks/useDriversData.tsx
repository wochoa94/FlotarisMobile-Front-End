import { useState, useEffect, useCallback, useRef } from 'react';
import { Driver, DriverQueryParams, PaginatedDriversResponse } from '../../../types';
import { driverService } from '../../../services/apiService';

type SortColumn = 'name' | 'email' | 'idNumber' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface UseDriversDataReturn {
  // Data
  drivers: Driver[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // State
  searchTerm: string;
  emailSearchTerm: string;
  sortBy: SortColumn | null;
  sortOrder: SortDirection;
  itemsPerPage: number;
  loading: boolean;
  error: string | null;
  
  // Actions
  setSearchTerm: (term: string) => void;
  setEmailSearchTerm: (term: string) => void;
  setSorting: (column: SortColumn) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (limit: number) => void;
  clearAllFilters: () => void;
  refreshData: () => Promise<void>;
}

export function useDriversData(): UseDriversDataReturn {
  // State variables - removed URL parameter initialization for mobile
  const [searchTerm, setSearchTermState] = useState('');
  const [emailSearchTerm, setEmailSearchTermState] = useState('');
  const [sortBy, setSortByState] = useState<SortColumn | null>(null);
  const [sortOrder, setSortOrderState] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPageState] = useState(1);
  const [itemsPerPage, setItemsPerPageState] = useState(10);
  
  // Data state
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debouncing for search
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const emailSearchTimeoutRef = useRef<NodeJS.Timeout>();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [debouncedEmailSearchTerm, setDebouncedEmailSearchTerm] = useState(emailSearchTerm);

  // Debounce search terms
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  useEffect(() => {
    if (emailSearchTimeoutRef.current) {
      clearTimeout(emailSearchTimeoutRef.current);
    }
    
    emailSearchTimeoutRef.current = setTimeout(() => {
      setDebouncedEmailSearchTerm(emailSearchTerm);
    }, 300); // 300ms debounce

    return () => {
      if (emailSearchTimeoutRef.current) {
        clearTimeout(emailSearchTimeoutRef.current);
      }
    };
  }, [emailSearchTerm]);

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams: DriverQueryParams = {
        search: debouncedSearchTerm || undefined,
        emailSearch: debouncedEmailSearchTerm || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
        page: currentPage,
        limit: itemsPerPage,
      };

      const response: PaginatedDriversResponse = await driverService.fetchPaginatedDrivers(queryParams);
      
      setDrivers(response.drivers);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
      setHasNextPage(response.hasNextPage);
      setHasPreviousPage(response.hasPreviousPage);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch drivers');
      setDrivers([]);
      setTotalCount(0);
      setTotalPages(0);
      setHasNextPage(false);
      setHasPreviousPage(false);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, debouncedEmailSearchTerm, sortBy, sortOrder, currentPage, itemsPerPage]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Action functions
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    setCurrentPageState(1); // Reset to first page when searching
  }, []);

  const setEmailSearchTerm = useCallback((term: string) => {
    setEmailSearchTermState(term);
    setCurrentPageState(1); // Reset to first page when searching
  }, []);

  const setSorting = useCallback((column: SortColumn) => {
    if (sortBy === column) {
      // Toggle sort order if same column
      setSortOrderState(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortByState(column);
      setSortOrderState('asc');
    }
    setCurrentPageState(1); // Reset to first page when sorting
  }, [sortBy]);

  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(page);
  }, []);

  const setItemsPerPage = useCallback((limit: number) => {
    setItemsPerPageState(limit);
    setCurrentPageState(1); // Reset to first page when changing page size
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTermState('');
    setEmailSearchTermState('');
    setSortByState(null);
    setSortOrderState('asc');
    setCurrentPageState(1);
  }, []);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    // Data
    drivers,
    totalCount,
    totalPages,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    
    // State
    searchTerm,
    emailSearchTerm,
    sortBy,
    sortOrder,
    itemsPerPage,
    loading,
    error,
    
    // Actions
    setSearchTerm,
    setEmailSearchTerm,
    setSorting,
    setCurrentPage,
    setItemsPerPage,
    clearAllFilters,
    refreshData,
  };
}