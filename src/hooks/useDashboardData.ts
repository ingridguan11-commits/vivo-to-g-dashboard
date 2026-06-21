import { useEffect, useState } from "react";
import type { GuideMetric, GuideProfile, RegionMetric } from "../types/dashboard";

type DashboardDataState = {
  regionMetrics: RegionMetric[];
  guideProfiles: GuideProfile[];
  guideMetrics: GuideMetric[];
  loading: boolean;
  error: string | null;
};

export function useDashboardData(): DashboardDataState {
  const [state, setState] = useState<DashboardDataState>({
    regionMetrics: [],
    guideProfiles: [],
    guideMetrics: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [regionMetrics, guideProfiles, guideMetrics] = await Promise.all([
          fetch("/data/region_metrics.json").then((response) => response.json()),
          fetch("/data/guide_profiles.json").then((response) => response.json()),
          fetch("/data/guide_metrics.json").then((response) => response.json())
        ]);

        if (!mounted) return;
        setState({
          regionMetrics,
          guideProfiles,
          guideMetrics,
          loading: false,
          error: null
        });
      } catch (error) {
        if (!mounted) return;
        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : "数据加载失败"
        }));
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
