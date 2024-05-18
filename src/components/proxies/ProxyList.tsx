import cx from 'clsx';
import * as React from 'react';

import { Proxy, ProxySmall } from './Proxy';
import s from './ProxyList.module.scss';

type ProxyListProps = {
  all: string[];
  now?: string;
  latencyTestUrl?: string;
  isSelectable?: boolean;
  itemOnTapCallback?: (x: string) => void;
  show?: boolean;
};

export function ProxyList({ all, now, latencyTestUrl, isSelectable, itemOnTapCallback }: ProxyListProps) {
  return (
    <div className={cx(s.list, s.detail)}>
      {all.map((proxyName) => {
        return (
          <Proxy
            key={proxyName}
            onClick={itemOnTapCallback}
            isSelectable={isSelectable}
            name={proxyName}
            now={proxyName === now}
            latencyTestUrl={latencyTestUrl}
          />
        );
      })}
    </div>
  );
}

export function ProxyListSummaryView({
                                       all,
                                       now,
                                       isSelectable,
                                       itemOnTapCallback
                                     }: ProxyListProps) {
  return (
    <div className={cx(s.list, s.summary)}>
      {all.map((proxyName) => {
        return (
          <ProxySmall
            key={proxyName}
            onClick={itemOnTapCallback}
            isSelectable={isSelectable}
            name={proxyName}
            now={proxyName === now}
          />
        );
      })}
    </div>
  );
}
