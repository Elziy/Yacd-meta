import {
  ArcElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  BarController,
  BarElement,
  PointElement,
  Tooltip,
  Title
} from 'chart.js';

// see https://www.chartjs.org/docs/latest/getting-started/integration.html#bundlers-webpack-rollup-etc
Chart.register(
  LineElement,
  PointElement,
  LineController,
  PieController,
  BarController,
  BarElement,
  ArcElement,
  Tooltip,
  Title,
  CategoryScale,
  LinearScale,
  Filler,
  Legend
);

export { Chart };
