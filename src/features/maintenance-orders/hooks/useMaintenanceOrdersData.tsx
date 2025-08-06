import { useState, useEffect, useCallback, useRef } from 'react';
import { MaintenanceOrder, MaintenanceOrderQueryParams, PaginatedMaintenanceOrdersResponse, MaintenanceOrderSummary } from '../../../types';
import { maintenanceOrderService } from '../../../services/apiService';

type SortColumn = 'orderNumber' | 'vehicleName' | 'startDate' | 'estimatedCompletionDate' | 'cost' | 'status';
type SortDirection = 'asc' | 'desc';

interface UseMaintenanceOrdersDataReturn {
  // Data
  maintenanceOrders: MaintenanceOrder[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // State
  searchTerm: string;
  statusFilters: string[];
  sortBy: SortColumn | null;
  sortOrder: SortDirection;
  itemsPerPage: number;
  loading: boolean;
  error: string | null;
  
  // Actions
  setSearchTerm: (term: string) => void;
  toggleStatusFilter: (status: string) => void;
  clearStatusFilters: () => void;
  setSorting: (column: SortColumn) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (limit: number) => void;
  clearAllFilters: () => void;
  refreshData: () => Promise<void>;

  // Summary data
  maintenanceOrderSummary: MaintenanceOrderSummary | null;
}

export function useMaintenanceOrdersData(): UseMaintenanceOrdersDataReturn {
  // Initialize state with default values (no URL parameters in mobile)
  const getInitialState = () => {
    return {
      search: '',
      status: ['active', 'scheduled', 'pending_authorization'], // Default filters
      sortBy: 'startDate' as SortColumn, // Default sort by start date
      sortOrder: 'desc' as SortDirection, // Default to newest first
      page: 1,
      limit: 10,
    };
  };

  const initialState = getInitialState();
  
  // State variables
  const [searchTerm, setSearchTermState] = useState(initialState.search);
  const [statusFilters, setStatusFilters] = useState<string[]>(initialState.status);
  const [sortBy, setSortByState] = useState<SortColumn | null>(initialState.sortBy);
  const [sortOrder, setSortOrderState] = useState<SortDirection>(initialState.sortOrder);
  const [currentPage, setCurrentPageState] = useState(initialState.page);
  const [itemsPerPage, setItemsPerPageState] = useState(initialState.limit);
  
  // Data state
  const [maintenanceOrders, setMaintenanceOrders] = useState<MaintenanceOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maintenanceOrderSummary, setMaintenanceOrderSummary] = useState<MaintenanceOrderSummary | null>(null);

  // Debouncing for search
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search term
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

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams: MaintenanceOrderQueryParams = {
        search: debouncedSearchTerm || undefined,
        status: statusFilters.length > 0 ? statusFilters : undefined,
        sortBy: sortBy || undefined,
        sortOrder,
        page: currentPage,
        limit: itemsPerPage,
      };

      // Fetch both paginated data and summary concurrently
      const [response, summaryResponse]: [PaginatedMaintenanceOrdersResponse, MaintenanceOrderSummary] = await Promise.all([
        maintenanceOrderService.fetchPaginatedMaintenanceOrders(queryParams),
        maintenanceOrderService.fetchMaintenanceOrderSummary()
      ]);
      
      setMaintenanceOrders(response.maintenanceOrders);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
      setHasNextPage(response.hasNextPage);
      setHasPreviousPage(response.hasPreviousPage);
      setMaintenanceOrderSummary(summaryResponse);
    } catch (err) {
      console.error('Error fetching maintenance orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch maintenance orders');
      setMaintenanceOrders([]);
      setTotalCount(0);
      setTotalPages(0);
      setHasNextPage(false);
      setHasPreviousPage(false);
      setMaintenanceOrderSummary(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, statusFilters, sortBy, sortOrder, currentPage, itemsPerPage]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Action functions
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    setCurrentPageState(1); // Reset to first page when searching
  }, []);

  const toggleStatusFilter = useCallback((status: string) => {
    setStatusFilters(prev => {
      const newFilters = prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status];
      setCurrentPageState(1); // Reset to first page when filtering
      return newFilters;
    });
  }, []);

  const clearStatusFilters = useCallback(() => {
    setStatusFilters([]);
    setCurrentPageState(1);
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
    setStatusFilters([]);
    setSortByState('startDate');
    setSortOrderState('desc');
    setCurrentPageState(1);
  }, []);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    // Data
    maintenanceOrders,
    totalCount,
    totalPages,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    
    // State
    searchTerm,
    statusFilters,
    sortBy,
    sortOrder,
    itemsPerPage,
    loading,
    error,
    
    // Actions
    setSearchTerm,
    toggleStatusFilter,
    clearStatusFilters,
    setSorting,
    setCurrentPage,
    setItemsPerPage,
    clearAllFilters,
    refreshData,

    // Summary data
    maintenanceOrderSummary,
  };
}