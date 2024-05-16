import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseModal from '~/components/shared/BaseModal';

import Button from '../shared/Button';
import Input from '../shared/Input';
import s from './ModalAddUserIpFilter.module.scss';

function isValidIP(ip) {
  const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Pattern.test(ip);
}

export default function ModalAddUserIpFilter({ isOpen, onRequestClose, userIpFilter }) {
  const { t } = useTranslation();

  const [userIps, setUserIps] = useState(userIpFilter);

  const setSource = (index: number, val: string) => {
    userIpFilter[index] = val;
    setUserIps(Array.from(userIpFilter));
  };

  const pushSource = () => {
    userIpFilter.push('');
    setUserIps(Array.from(userIpFilter));
  };

  const removeSource = (index: number) => {
    userIpFilter.splice(index, 1);
    setUserIps(Array.from(userIpFilter));
  };

  if (userIpFilter.length === 0) {
    pushSource();
  }

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onRequestClose}>
      <table className={s.sourceipTable}>
        <thead>
        <tr>
          <th>{t('c_source')}</th>
        </tr>
        </thead>
        <tbody>
        {userIps.map((source: string, index: number) => (
          <tr key={`${index}`}>
            <td>
              <Input
                type="text"
                name="userIpFilter"
                autoComplete="off"
                value={source}
                onChange={(e) => setSource(index, e.target.value)}
              />
            </td>
            <td style={{ paddingLeft: 10 }}>
              <Button onClick={() => removeSource(index)}>{t('delete')}</Button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
      <div>
        <div className={s.buttons}>
          <Button onClick={pushSource}>{t('add_tag')}</Button>
        </div>
      </div>
    </BaseModal>
  );
}
