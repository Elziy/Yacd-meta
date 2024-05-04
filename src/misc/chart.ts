import { createAsset } from 'use-asset';

import prettyBytes from './pretty-bytes';

export const chartJSResource = createAsset(() => {
  return import('~/misc/chart-lib');
});

export const commonDataSetProps = { borderWidth: 1, pointRadius: 0, tension: 0.2, fill: true };

export const commonChartOptions: import('chart.js').ChartOptions<'line'> = {
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
    x: {
      display: false,
      type: 'category'
    },
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
        font: {
          size: 16
        },
        maxTicksLimit: 6,
        callback(value: number) {
          return prettyBytes(value) + '/s ';
        }
      }
    }
  }
};

export const pieBackgroundColor = [
  'rgb(81, 168, 221 ,0.5)',
  'rgb(255, 205, 86, 0.5)',
  'rgb(153, 102, 255, 0.5)',
  'rgba(34,103,86, 0.5)',
  'rgb(255, 99, 132, 0.5)',
  'rgb(104,168,22, 0.5)',
  'rgb(218,159,77, 0.5)'
];

export const pieBorderColor = [
  'rgb(81, 168, 221)',
  'rgb(255, 205, 86)',
  'rgb(153, 102, 255)',
  'rgb(34,103,86)',
  'rgb(255, 99, 132)',
  'rgb(104,168,22)',
  'rgb(218,159,77)'
];

export const chartStyles = [
  {
    down: {
      backgroundColor: 'rgba(81, 168, 221, 0.5)',
      borderColor: 'rgb(81, 168, 221)'
    },
    up: {
      backgroundColor: 'rgba(219, 77, 109, 0.5)',
      borderColor: 'rgb(219, 77, 109)'
    }
  },
  {
    down: {
      backgroundColor: 'rgba(81, 168, 221, 0.5)',
      borderColor: 'rgb(81, 168, 221)'
    },
    up: {
      backgroundColor: 'rgba(123,59,140,0.6)',
      borderColor: 'rgba(66,33,142,1)'
    }
  },
  {
    up: {
      backgroundColor: 'rgba(94, 175, 223, 0.3)',
      borderColor: 'rgb(94, 175, 223)'
    },
    down: {
      backgroundColor: 'rgba(139, 227, 195, 0.3)',
      borderColor: 'rgb(139, 227, 195)'
    }
  },
  {
    up: {
      backgroundColor: 'rgba(242, 174, 62, 0.3)',
      borderColor: 'rgb(242, 174, 62)'
    },
    down: {
      backgroundColor: 'rgba(69, 154, 248, 0.3)',
      borderColor: 'rgb(69, 154, 248)'
    }
  }
];
