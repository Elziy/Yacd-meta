import { createAsset } from 'use-asset';

import prettyBytes from './pretty-bytes';

export const chartJSResource = createAsset(() => {
  return import('~/misc/chart-lib');
});

export const commonDataSetProps = { borderWidth: 1, pointRadius: 0, tension: 0.2, fill: true };

export const memoryChartOptions: import('chart.js').ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    point: {
      hitRadius: 20,
      hoverRadius: 10
    }
  },
  plugins: {
    legend: {
      labels:
        {
          boxHeight: 10,
          boxWidth: 30,
          font: {
            size: 16
          }
        }
    },
    tooltip: {
      titleFont: {
        size: 0
      },
      bodyFont: {
        size: 16
      },
      callbacks: {
        label(context) {
          return ' ' + prettyBytes(context.parsed.y);
        }
      }
    }
  },
  scales: {
    x: { display: false, type: 'category' },
    y: {
      type: 'linear',
      display: true,
      grid: {
        display: true,
        color: '#555',
        drawTicks: false
      },
      border: {
        dash: [3, 6]
      },
      ticks: {
        maxTicksLimit: 5,
        font: {
          size: 16
        },
        callback(value: number) {
          return prettyBytes(value);
        }
      }
    }
  }
};

export const chartStyles = [
  {
    inuse: {
      backgroundColor: 'rgba(81, 168, 221, 0.5)',
      borderColor: 'rgb(81, 168, 221)'
    }
  },
  {
    inuse: {
      backgroundColor: 'rgba(81, 168, 221, 0.5)',
      borderColor: 'rgb(81, 168, 221)'
    }
  },
  {
    inuse: {
      backgroundColor: 'rgba(94, 175, 223, 0.3)',
      borderColor: 'rgb(94, 175, 223)'
    }
  },
  {
    inuse: {
      backgroundColor: 'rgba(242, 174, 62, 0.3)',
      borderColor: 'rgb(242, 174, 62)'
    }
  }
];
