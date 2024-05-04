import prettyBytes from '~/misc/pretty-bytes';

export const BarChartOptions: import('chart.js').ChartOptions<'bar'> = {
  responsive: true, // 设置图表为响应式，根据屏幕窗口变化而变化
  maintainAspectRatio: false,// 保持图表原有比例
  interaction: {
    intersect: false,
  },
  plugins: {
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
        label: (context) => {
          let label = ' ';
          label += context.dataset.label + ' ';
          if (context.parsed.y !== null) {
            if (context.parsed.y < 0) {
              label += prettyBytes(-context.parsed.y);
            } else {
              label += prettyBytes(context.parsed.y);
            }
          }
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: true,
        color: '#555',
        drawTicks: false
      },
      border: {
        dash: [3, 6],
      },
      ticks: {
        font: {
          size: 16
        }
      }
    },
    y: {
      type: 'linear',
      display: true,
      grid: {
        display: true,
        color: '#555',
        drawTicks: false,
      },
      border: {
        dash: [3, 6],
      },
      ticks: {
        font: {
          size: 16
        },
        callback(value: number) {
          if (value < 0) {
            return prettyBytes(-value);
          }
          return prettyBytes(value);
        }
      }
    }
  }
};
