import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseModal from '~/components/shared/BaseModal';

import Button from '../shared/Button';
import Input from '../shared/Input';
import s from './ModalSourceIP.module.scss';
import { notifyError } from '~/misc/message';

async function reverseDNS(ips: string[]) {
  const res = await fetch('/api/dns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ips)
  });
  return await res.json();
}

export default function ModalSourceIP({ isOpen, onRequestClose, sourceMap, setSourceMap, ips }) {
  const { t } = useTranslation();
  const setSource = (key, index, val) => {
    sourceMap[index][key] = val;
    setSourceMap(Array.from(sourceMap));
  };

  const [submitting, setSubmitting] = useState(false);

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onRequestClose}>
      <table className={s.sourceipTable}>
        <thead>
        <tr>
          <th>{t('c_source')}</th>
          <th>{t('device_name')}</th>
        </tr>
        </thead>
        <tbody>
        {sourceMap.map((source, index) => (
          <tr key={`${index}`}>
            <td>
              <Input
                type="text"
                name="reg"
                autoComplete="off"
                value={source.reg}
                onChange={(e) => setSource('reg', index, e.target.value)}
              />
            </td>
            <td>
              <Input
                type="text"
                name="name"
                autoComplete="off"
                value={source.name}
                onChange={(e) => setSource('name', index, e.target.value)}
              />
            </td>
            <td style={{ paddingLeft: 10 }}>
              <Button onClick={() => sourceMap.splice(index, 1)}>{t('delete')}</Button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
      <div>
        <div className={s.iptableTipContainer}>{t('sourceip_tip')}</div>
        <div className={s.buttons}>
          <Button onClick={() => sourceMap.push({ reg: '', name: '' })}>{t('add_tag')}</Button>
          <Button disabled={submitting} onClick={() => {
            setSubmitting(true);
            reverseDNS(ips).then((res) => {
              res.code === 200 && res.data.forEach((item) => {
                if (item.code == 200) {
                  let hostname = item.hostname || '';
                  if (hostname.endsWith('.lan') || hostname.endsWith('.art') || hostname.endsWith('.com')) {
                    hostname = hostname.slice(0, -4);
                  }
                  if (item.code === 200) {
                    sourceMap.push({
                      reg: item.ipAddress,
                      name: hostname
                    });
                  }
                }
              });
              localStorage.setItem('sourceMap', JSON.stringify(sourceMap));
              setTimeout(() => setSubmitting(false), 1000);
            }).catch(() => {
              notifyError('网络错误，请稍后重试');
              setTimeout(() => setSubmitting(false), 1000);
            });
          }}>{t('get_tag')}</Button>
        </div>
      </div>
    </BaseModal>
  );
}
