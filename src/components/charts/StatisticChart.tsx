import { State } from '~/store/types';
import { getClashAPIConfig } from '~/store/app';
import { connect } from '~/components/StateProvider';
import React from 'react';
import { useQuery } from 'react-query';
import { ClashAPIConfig } from '~/types';
import { fetchStatistic } from '~/api/traffic';
import RuleStatisticChart from '~/components/charts/RuleStatisticChart';
import UserStatisticChart from '~/components/charts/UserStatisticChart';

const mapState = (s: State) => ({
  apiConfig: getClashAPIConfig(s)
});

interface Props {
  apiConfig: ClashAPIConfig;
}

export default connect(mapState)(StatisticChart);

function StatisticChart({ apiConfig }: Props) {
  const { data: statistic } = useQuery(['/statistic', apiConfig], () =>
    fetchStatistic('/statistic', apiConfig)
  );

  if (!statistic) return null;
  return (
    <>
      <RuleStatisticChart ruleStatistic={statistic.ruleStatistic} />
      <UserStatisticChart userStatistic={statistic.userStatistic} />
    </>
  );
}
