import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { statsService } from '@/shared/services/stats.service';

export function useOverview() {
  return useQuery({
    queryKey: queryKeys.stats.overview,
    queryFn: ({ signal }) => statsService.overview(signal),
    refetchInterval: 30_000,
  });
}
