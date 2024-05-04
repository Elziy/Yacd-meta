import type { ChartConfiguration } from 'chart.js';
import { useEffect } from 'react';
import { PieChartOptions } from '~/misc/chart-pie';

export function usePieChart(
  chart: typeof import('chart.js').Chart,
  elementId: string,
  data: ChartConfiguration['data'],
  extraChartOptions = {}
) {
  useEffect(() => {
    const ctx = (document.getElementById(elementId) as HTMLCanvasElement).getContext('2d');
    const options = { ...PieChartOptions, ...extraChartOptions };
    // @ts-ignore
    const c = new chart(ctx, { type: 'pie', data, options });
    return () => {
      c.destroy();
    };
  }, [chart, elementId, data, extraChartOptions]);
}
