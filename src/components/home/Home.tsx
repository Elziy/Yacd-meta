import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import ContentHeader from '../sideBar/ContentHeader';
import s0 from './Home.module.scss';
import Loading from '../shared/Loading2';
import TrafficChart from '~/components/home/charts/TrafficChart';
import TrafficNow from './TrafficNow';
import MemoryChart from '~/components/home/charts/MemoryChart';
import StatisticChart from '~/components/home/charts/StatisticChart';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div>
      <ContentHeader title={t('Overview')} />
      <div className={s0.root}>
        <div>
          <TrafficNow />
        </div>
        <div className={s0.chart}>
          <Suspense fallback={<Loading />}>
            <TrafficChart />
            <StatisticChart />
            <MemoryChart />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
