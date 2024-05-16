import { RuleStatistic, State } from '~/store/types';
import { pieBackgroundColor, pieBorderColor } from '~/misc/chart';
import { getMinTraffic } from '~/store/app';
import React from 'react';
import PieChart from '~/components/home/charts/PieChart';
import { connect } from '~/components/StateProvider';

function getRuleStatistic(ruleStatistic: RuleStatistic[], minTraffic: number) {
  ruleStatistic = ruleStatistic.filter((item) => item.upload + item.download > minTraffic * 1024 * 1024).length >= 1 ?
    ruleStatistic.filter((item) => item.upload + item.download > minTraffic * 1024 * 1024) : ruleStatistic;
  return ruleStatistic
    .sort((a, b) => b.upload + b.download - a.upload - a.download);
}

function getRuleLabels(ruleStatistic: RuleStatistic[]) {
  return ruleStatistic.map((item) => {
    let rule = item.rule;
    const reg = /\(([^)]+)\)/;
    const result = reg.exec(rule);
    if (result && result[1].toLowerCase() !== 'cn') rule = result[1];
    if (rule.startsWith('(')) rule = rule.slice(1);
    if (rule === 'Match()') rule = 'Match';
    return rule.toUpperCase();
  });
}

function getRuleDatasets(ruleStatistic: RuleStatistic[]) {
  return [{
    data: ruleStatistic.map((item) => item.upload + item.download),
    extraData: ruleStatistic,
    backgroundColor: pieBackgroundColor,
    borderColor: pieBorderColor,
    borderWidth: 2,
    hoverOffset: 20
  }];

}

const mapState = (s: State) => ({
  minTraffic: getMinTraffic(s)
});

interface Props {
  minTraffic: number;
  ruleStatistic: RuleStatistic[];
}

export default connect(mapState)(RuleStatisticChart);

function RuleStatisticChart({ minTraffic, ruleStatistic }: Props) {
  if (!ruleStatistic) return null;
  ruleStatistic = getRuleStatistic(ruleStatistic, minTraffic);
  const ruleLabels = getRuleLabels(ruleStatistic);
  const ruleDatasets = getRuleDatasets(ruleStatistic);

  return (
    <PieChart labels={ruleLabels} datasets={ruleDatasets} />
  );
}
