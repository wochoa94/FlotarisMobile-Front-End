import { useState, useEffect, useCallback } from 'react';
import { Vehicle } from '../../../types';
import { vehicleService } from '../../../services/apiService';

interface UseVehicleDetailsReturn {
  vehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  refreshVehicle: () => Promise<void>;
}

export function useVehicleDetails(vehicleId: string | undefined): UseVehicleDetailsReturn {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicle = useCallback(async () => {
    if (!vehicleId) {
      setVehicle(null);
      setLoading(false);
      setError('Vehicle ID is undefined.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fetchedVehicle = await vehicleService.getVehicleById(vehicleId);
      setVehicle(fetchedVehicle);
    } catch (err) {
      console.error('Error fetching vehicle details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicle details.');
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchVehicle();

  const refreshVehicle = async () => {
    await fetchVehicle();
  };

  return { vehicle, loading, error, refreshVehicle };
}