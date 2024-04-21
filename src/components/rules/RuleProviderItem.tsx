import * as React from 'react';
import { useState } from 'react';

import Button from '~/components/Button';
import { useUpdateRuleProviderItem } from '~/components/rules/rules.hooks';
import { SectionNameType } from '~/components/shared/Basic';
import { RotateIcon } from '~/components/shared/RotateIcon';
import { HiX } from 'react-icons/hi';

import s from './RuleProviderItem.module.scss';
import s0 from '~/components/Rules.module.scss';
import { formatTime } from '~/api/proxies';
import ModalCloseAllConnections from '~/components/ModalCloseAllConnections';
import ShowModel from '~/components/rules/ShowModel';
import { notifyError, notifySuccess } from '~/misc/message';

export function RuleProviderItem(
  {
    idx,
    name,
    vehicleType,
    behavior,
    updatedAt,
    ruleCount,
    apiConfig
  }) {
  const [onClickRefreshButton, isRefreshing] = useUpdateRuleProviderItem(name, apiConfig);
  const [data, setData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [delete_modal, setDeleteModal] = useState(false);

  const timeAgo = formatTime(new Date(updatedAt));
  // const timeAgo = formatDistance(new Date(updatedAt), new Date());

  const delete_rule_set = async (name: string) => {
    fetch('/api/delete_rule_set', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    }).then(async (res) => {
      const response = await res.json();
      if (response.code === 200) {
        setDeleteModal(false);
        notifySuccess(response.message);
      } else {
        notifyError(response.message);
      }
    }).catch(() => {
      notifyError('网络错误');
    });
  };

  function get_rule_set() {
    setIsModalOpen(true);
    fetch('/api/get_rule_set?name=' + name, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(async (res) => {
      const response = await res.json();
      if (response.code === 200) {
        setData(response.data);
      } else {
        notifyError(response.message);
      }
    }).catch(() => {
      notifyError('网络错误');
    });
  }

  return (
    <div className={s.RuleProviderItem}>
      <span className={s.left}>{idx}</span>
      <div className={s.middle}>
        <SectionNameType name={name} type={`${vehicleType} / ${behavior}`} now={undefined} icon={undefined} nowProxy={undefined} />
        <div style={{ paddingRight: '0.5em' }}>
          <span onClick={get_rule_set} className={s0.qty}>{ruleCount}</span>
        </div>
        {/*<div style={{ paddingLeft: '1em' }} className={s.gray}>{`${ruleCount}条规则`}</div>*/}
        <div className={s.update_time}><span>{`更新于${timeAgo}`}</span></div>
      </div>
      <span className={s.refreshButtonWrapper}>
        <Button className={s.button} onClick={() => setDeleteModal(true)
        }>
          <HiX size={18} />
        </Button>
        <Button className={s.button} onClick={onClickRefreshButton} disabled={isRefreshing}>
          <RotateIcon isRotating={isRefreshing} />
        </Button>
      </span>

      <ModalCloseAllConnections
        confirm={'delete_rule'}
        isOpen={delete_modal}
        primaryButtonOnTap={() => delete_rule_set(name)}
        onRequestClose={() => setDeleteModal(false)}
      />

      <ShowModel isOpen={isModalOpen} onRequestClose={() => {
        setIsModalOpen(false)
        setData(null)
      }} data={data} />
    </div>
  );
}
