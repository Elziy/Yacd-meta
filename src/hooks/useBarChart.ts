import type { ChartConfiguration } from 'chart.js';
import { useEffect } from 'react';
import { BarChartOptions } from '~/misc/chart-bar';

export function useBarChart(
  chart: typeof import('chart.js').Chart,
  elementId: string,
  data: ChartConfiguration['data'],
  extraChartOptions = {}
) {
  useEffect(() => {
    const ctx = (document.getElementById(elementId) as HTMLCanvasElement).getContext('2d');
    const options = { ...BarChartOptions, ...extraChartOptions };
    const c = new chart(ctx, { type: 'bar', data, options });
    return () => {
      c.destroy();
    };
  }, [chart, elementId, data, extraChartOptions]);
}
