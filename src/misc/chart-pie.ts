import prettyBytes from '~/misc/pretty-bytes';
import { TooltipItem } from 'chart.js';

export const PieChartOptions: import('chart.js').ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  borderColor: 'rgba(0, 0, 0, 0.1)',
  elements: {
  },
  plugins: {
    // title: {
    //   display: true,
    //   text: '规则用量',
    //   font: {
    //     size: 18
    //   }
    // },
    legend: {
      labels: {
        boxWidth: 15,
        boxHeight: 10,
        font: {
          size: 14
        }
      }
    },
    tooltip: {
      titleFont: {
        size: 16
      },
      bodyFont: {
        size: 16
      },
      callbacks: {
        label: (context: TooltipItem<'pie'>) => {
          let label = ' ';
          if (context.parsed !== null) {
            label += prettyBytes(context.parsed);
          }
          label += '   ⬇ ' + prettyBytes(context.dataset['extraData'][context.dataIndex]['download']);
          label += ' ⬆ ' + prettyBytes(context.dataset['extraData'][context.dataIndex]['upload']);
          return label;
        }
      }
    }
  },
  scales: {
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
        maxTicksLimit: 10,
        font: {
          size: 0
        }
      }
    }
  }
};
