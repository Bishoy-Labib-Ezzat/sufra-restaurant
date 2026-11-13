import { apiClient } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { DashboardOverview } from '@/shared/types';

export const statsService = {
  overview: (signal?: AbortSignal) => apiClient.get<DashboardOverview>(endpoints.stats.overview, { signal }),
};
