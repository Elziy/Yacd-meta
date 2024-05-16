import * as React from 'react';

import { chartJSResource } from '~/misc/chart';
import s0 from './PieChart.module.scss';
import { useBarChart } from '~/hooks/useBarChart';

const { useMemo } = React;

const chartWrapperStyle = {
  justifySelf: 'center',
  position: 'relative',
  width: '100%',
  height: '100%'
};

const canvasWrapperStyle = {
  width: '100%',
  height: '100%',
  padding: '10px',
  borderRadius: '10px'
};


export default function BarChart({ labels, datasets }) {
  const ChartMod = chartJSResource.read();

  const data = useMemo(
    () => ({
      labels: labels,
      datasets: datasets
    }), []);

  useBarChart(ChartMod.Chart, 'BarChart', data, {});

  return (
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ position: string; maxWidth: number; }' is ... Remove this comment to see the full error message
    <div style={chartWrapperStyle}>
      <canvas id="BarChart" style={canvasWrapperStyle} className={s0.PieChart} />
    </div>
  );
}
