import { RuleStatistic, State } from '~/store/types';
import { pieBackgroundColor, pieBorderColor } from '~/misc/chart';
import { getMinTraffic } from '~/store/app';
import React from 'react';
import PieChart from '~/components/home/charts/PieChart';
import { connect } from '~/components/StateProvider';

function getRuleStatistic(ruleStatistic: RuleStatistic[], minTraffic: number) {
  ruleStatistic = ruleStatistic.filter((item) => item.upload + item.download > minTraffic * 1024 * 1024).length >= 1 ?
    ruleStatistic.filter((item) => item.upload + item.download > minTraffic * 1024 * 1024) : ruleStatistic;
  // 找出所有含有CN的规则
  const cnRules = ruleStatistic.filter((item) => item.rule.toLowerCase().includes('cn'));
  // 找出所有含有Direct的规则
  const directRules = ruleStatistic.filter((item) => item.rule.toLowerCase().includes('direct'));
  // 合并CN和Direct规则为Direct
  const directRule = {
    rule: 'Direct',
    upload: cnRules.reduce((acc, item) => acc + item.upload, 0) + directRules.reduce((acc, item) => acc + item.upload, 0),
    download: cnRules.reduce((acc, item) => acc + item.download, 0) + directRules.reduce((acc, item) => acc + item.download, 0)
  };
  // 删除CN和Direct规则
  ruleStatistic = ruleStatistic.filter((item) => !item.rule.toLowerCase().includes('cn') && !item.rule.toLowerCase().includes('direct'));
  // 添加合并后的Direct规则
  ruleStatistic.push(directRule);
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
