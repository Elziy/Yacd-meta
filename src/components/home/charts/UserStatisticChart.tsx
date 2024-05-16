import { State, UserStatistic } from '~/store/types';
import { connect } from '~/components/StateProvider';
import { getMinTraffic, getUserIpFilter } from '~/store/app';
import React from 'react';
import BarChart from '~/components/home/charts/BarChart';
import { getNameFromSource } from '~/components/connections/Connections';

function getUserStatistic(userStatistic: UserStatistic[], minTraffic: number, userIpFilter: string[]) {
  userStatistic = userStatistic.filter((item) => item.user !== 'invalid IP' &&
    (item.directDownload + item.directUpload + item.proxyDownload + item.proxyUpload) > minTraffic * 1024 * 1024 &&
    !userIpFilter.includes(item.user)).length >= 1 ?
    userStatistic.filter((item) => item.user !== 'invalid IP' &&
      (item.directDownload + item.directUpload + item.proxyDownload + item.proxyUpload) > minTraffic * 1024 * 1024 &&
      !userIpFilter.includes(item.user))
    : userStatistic;
  return userStatistic
    .sort((a, b) => b.directDownload + b.directUpload + b.proxyDownload + b.proxyUpload
      - a.directDownload - a.directUpload - a.proxyDownload - a.proxyUpload);
}

const sourceMap = localStorage.getItem('sourceMap')
  ? JSON.parse(localStorage.getItem('sourceMap'))
  : [];

function getUserLabels(userStatistic: UserStatistic[]) {
  return userStatistic.map((item) => {
    return getNameFromSource(item.user, sourceMap).split('(')[0];
  });
}

function getUserDatasets(userStatistic: UserStatistic[]) {
  return [{
    label: '直连下载',
    data: userStatistic.map((item) => item.directDownload),
    hoverOffset: 20,
    backgroundColor: 'rgb(139, 227, 195, 0.5)',
    borderColor: 'rgb(139, 227, 195)',
    borderRadius: 10,
    borderWidth: 2,
    borderSkipped: false
  }, {
    label: '直连上传',
    data: userStatistic.map((item) => -item.directUpload),
    hoverOffset: 20,
    backgroundColor: 'rgb(123,59,140, 0.5)',
    borderColor: 'rgb(123,59,140)',
    borderRadius: 10,
    borderWidth: 2,
    borderSkipped: false
  }, {
    label: '代理下载',
    data: userStatistic.map((item) => item.proxyDownload),
    hoverOffset: 20,
    backgroundColor: 'rgb(81, 168, 221, 0.5)',
    borderColor: 'rgb(81, 168, 221)',
    borderRadius: 10,
    borderWidth: 2,
    borderSkipped: false
  }, {
    label: '代理上传',
    data: userStatistic.map((item) => -item.proxyUpload),
    hoverOffset: 20,
    backgroundColor: 'rgb(219, 77, 109, 0.5)',
    borderColor: 'rgb(219, 77, 109)',
    borderRadius: 10,
    borderWidth: 2,
    borderSkipped: false
  }];
}

const mapState = (s: State) => ({
  minTraffic: getMinTraffic(s),
  userIpFilter: getUserIpFilter(s)
});

export default connect(mapState)(UserStatisticChart);

function UserStatisticChart({ userStatistic, minTraffic, userIpFilter }: {
  userStatistic: UserStatistic[];
  minTraffic: number,
  userIpFilter: string[]
}) {
  if (!userStatistic) return null;
  userStatistic = getUserStatistic(userStatistic, minTraffic, userIpFilter);
  const userDatasets = getUserDatasets(userStatistic);

  return (
    <BarChart labels={getUserLabels(userStatistic)} datasets={userDatasets} />
  );
}
