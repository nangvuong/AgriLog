import { useState, useEffect } from 'react';
import { activitiesService, ActivityType } from '@/services/api/activities.service';

interface UseActivityTypesReturn {
  activityTypes: ActivityType[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Cache module-level để tránh fetch lặp lại giữa các component
let _cache: ActivityType[] | null = null;
let _fetchPromise: Promise<ActivityType[]> | null = null;

export function useActivityTypes(): UseActivityTypesReturn {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>(_cache ?? []);
  const [isLoading, setIsLoading] = useState(!_cache);
  const [error, setError] = useState<string | null>(null);

  const fetchTypes = async () => {
    // Nếu đang có request đang chạy, dùng lại promise đó
    if (_fetchPromise) {
      try {
        const data = await _fetchPromise;
        setActivityTypes(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách loại hoạt động');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    _fetchPromise = activitiesService.getActivityTypes();

    try {
      const data = await _fetchPromise;
      _cache = data;
      setActivityTypes(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách loại hoạt động');
    } finally {
      _fetchPromise = null;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!_cache) {
      fetchTypes();
    }
  }, []);

  const refetch = () => {
    _cache = null;
    fetchTypes();
  };

  return { activityTypes, isLoading, error, refetch };
}
