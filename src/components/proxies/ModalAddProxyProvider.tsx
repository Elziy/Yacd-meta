import React, { useCallback, useEffect, useState } from 'react';
import type { State } from '~/store/types';
import { getClashAPIConfig, getUnreloadConfig } from '~/store/app';
import { getProxyGroupNames, getProxyProviderNames } from '~/store/proxies';
import { connect, useStoreActions } from '~/components/StateProvider';
import { useTranslation } from 'react-i18next';
import { reloadConfigFile } from '~/store/configs';
import BaseModal from '~/components/shared/BaseModal';
import s from '~/components/proxies/ModalAddProxyGroup.module.scss';
import Input from '~/components/shared/Input';
import Select from '~/components/shared/Select';
import Button from '~/components/shared/Button';
import { notifyError, notifySuccess, notifyWarning } from '~/misc/message';

export const defaultProxyProvider = {
  name: '',
  type: 'http',
  url: '',
  path: 'proxy_provider',
  interval: 86400,
  proxy: 'DIRECT',
  'health-check': {
    enable: false,
    url: 'http://www.gstatic.com/generate_204',
    interval: 3600
  },
  override: {
    'additional-prefix': ''
  },
  filter: '',
  'exclude-filter': ''
};

function ModalAddProxyProvider({ dispatch, apiConfig, isOpen, onRequestClose, nowProxyProvider, groupNames, proxyProviderNames, unReloadConfig }) {
  const { t } = useTranslation();
  const { updateAppConfig } = useStoreActions();
  const [submitting, setSubmitting] = useState(false);

  const handleReloadConfigFile = useCallback(() => {
    dispatch(reloadConfigFile(apiConfig));
  }, [apiConfig, dispatch]);

  const [proxyProvider, setProxyProvider] = useState(defaultProxyProvider);
  const [proxyGroups, setProxyGroups] = useState([]);

  useEffect(() => {
    if (nowProxyProvider) {
      setProxyProvider(nowProxyProvider);
    }
  }, [nowProxyProvider]);

  useEffect(() => {
    const groups = groupNames.map((group: string) => [group, group]);
    groups.pop();
    groups.unshift(['DIRECT', '直连']);
    setProxyGroups(groups);
  }, [groupNames]);


  const submit = () => {
    if (!proxyProvider.name) {
      notifyWarning('请输入资源组名称');
      return;
    }
    if (!nowProxyProvider && proxyProviderNames.includes(proxyProvider.name)) {
      notifyWarning('资源组名称已存在');
      return;
    }
    if (!proxyProvider.url || !proxyProvider.url.startsWith('http')) {
      notifyWarning('请输入正确资源组URL');
      return;
    }
    if (!proxyProvider.interval) {
      notifyWarning('请输入资源组间隔');
      return;
    }
    proxyProvider.path = './' + proxyProvider.path + '/' + proxyProvider.name + '.yaml';
    setSubmitting(true);
    fetch('/api/edit_proxy_provider', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(proxyProvider)
    }).then(async (res) => {
      const response = await res.json();
      setSubmitting(false);
      if (response.code === 200) {
        notifySuccess(response.message);
        unReloadConfig?.push((nowProxyProvider ? t('edit_proxy_provider') : t('add_proxy_provider')) + ' : ' + proxyProvider.name);
        updateAppConfig('unReloadConfig', unReloadConfig);
        // handleReloadConfigFile();
        onRequestClose();
      } else {
        notifyError(response.message);
        setSubmitting(false);
      }
    }).catch(() => {
      notifyError('网络错误');
      setSubmitting(false);
    });
  };

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div>
        <div style={{ textAlign: 'center', fontSize: '1.2em' }}>
          <span>{nowProxyProvider ? t('edit_proxy_provider') : t('add_proxy_provider')}</span>
        </div>

        <div className={s.main} style={{ paddingRight: 10 }}>
          <div className={s.row}>
            资源组名称:
            <Input
              type="text"
              name="provider_name"
              autoComplete="off"
              placeholder="唯一资源组名称"
              value={proxyProvider.name}
              onChange={(e) => setProxyProvider({ ...proxyProvider, name: e.target.value })
              } />
          </div>

          <div className={s.row}>
            资源组URL:
            <Input
              type="text"
              name="provider_url"
              autoComplete="off"
              placeholder="https://"
              value={proxyProvider.url}
              onChange={(e) => setProxyProvider({ ...proxyProvider, url: e.target.value })
              }></Input>
          </div>

          {/*interval*/}
          <div className={s.row}>
            资源组间隔:
            <Input
              type="number"
              name="provider_interval"
              autoComplete="off"
              placeholder={defaultProxyProvider.interval.toString()}
              value={proxyProvider.interval}
              onChange={(e) => setProxyProvider({ ...proxyProvider, interval: e.target.value ? Number(e.target.value) : null })
              } />
          </div>

          <div className={s.row}>
            资源组筛选:
            <Input
              type="text"
              name="provider_filter"
              autoComplete="off"
              placeholder="香港|新加坡"
              value={proxyProvider.filter}
              onChange={(e) => setProxyProvider({ ...proxyProvider, filter: e.target.value })
              } />
          </div>

          <div className={s.row}>
            资源组排除:
            <Input
              type="text"
              name="provider_exclude_filter"
              autoComplete="off"
              placeholder="到期|剩余"
              value={proxyProvider['exclude-filter']}
              onChange={(e) => setProxyProvider({ ...proxyProvider, 'exclude-filter': e.target.value })
              } />
          </div>

          <div className={s.row}>
            资源组代理:
            <Select
              options={proxyGroups}
              selected={proxyProvider.proxy}
              onChange={(e) => setProxyProvider({ ...proxyProvider, proxy: e.target.value })} />
          </div>

          <div className={s.row}>
            资源组前缀:
            <Input
              type="text"
              name="provider_additional_prefix"
              autoComplete="off"
              value={proxyProvider.override['additional-prefix']}
              onChange={(e) => setProxyProvider({ ...proxyProvider, override: { 'additional-prefix': e.target.value } })
              } />
          </div>

        </div>

        <div className={s.submit}>
          <Button isLoading={submitting} className={s.submit_button} onClick={submit}>提交</Button>
        </div>
      </div>
    </BaseModal>

  );
}

const mapState = (s: State) => ({
  apiConfig: getClashAPIConfig(s),
  groupNames: getProxyGroupNames(s),
  proxyProviderNames: getProxyProviderNames(s),
  unReloadConfig: getUnreloadConfig(s)
});

export default connect(mapState)(ModalAddProxyProvider);
