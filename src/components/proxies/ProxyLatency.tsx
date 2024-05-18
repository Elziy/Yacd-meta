import * as React from 'react';

import s0 from './ProxyLatency.module.scss';
import { useTranslation } from 'react-i18next';
import { LoadingDot } from '~/components/shared/Basic';

type ProxyLatencyProps = {
  number: number;
  color: string;
  isLoading: boolean;
  handleOnclick: () => void;
};

export function ProxyLatency({ number, color, isLoading, handleOnclick }: ProxyLatencyProps) {
  const { t } = useTranslation();

  const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    handleOnclick();
  };
  return (
    <>
      {!isLoading ? <span onClick={event => handleClick(event)}
                          className={s0.proxyLatency} style={{ color }}>
        <span>{number ? number + ' ms' : t('check')}</span>
    </span> : <span className={s0.loading}><LoadingDot /></span>}
    </>
  );
}
