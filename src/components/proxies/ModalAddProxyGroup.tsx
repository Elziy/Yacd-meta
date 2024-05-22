import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseModal from '~/components/shared/BaseModal';

import Button from '../shared/Button';
import Input from '../shared/Input';
import s from './ModalAddProxyGroup.module.scss';
import Select from '~/components/shared/Select';
import { reloadConfigFile } from '~/store/configs';
import { notifyError, notifySuccess, notifyWarning } from '~/misc/message';
import type { State } from '~/store/types';
import { getClashAPIConfig } from '~/store/app';
import { getProxyGroupNames, getProxyProviderNames } from '~/store/proxies';
import { connect } from '~/components/StateProvider';
import MultiSelect from '~/components/shared/MultiSelect';

export const defaultProxyGroup = {
  name: '',
  type: 'select',
  proxies: [],
  use: [],
  icon: '',
  'disable-udp': false,
  filter: '',
  'exclude-filter': '',
  url: 'https://www.gstatic.com/generate_204',
  interval: 3600,
  timeout: 5000
};

function ModalAddProxyGroup({ dispatch, apiConfig, isOpen, onRequestClose, nowProxyGroup, groupNames, proxyProviderNames }) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [index, setIndex] = useState(null);

  const handleReloadConfigFile = useCallback(() => {
    dispatch(reloadConfigFile(apiConfig));
  }, [apiConfig, dispatch]);

  const [proxyGroup, setProxyGroup] = useState(defaultProxyGroup);
  const [proxyGroups, setProxyGroups] = useState([]);
  const [proxyProviders, setProxyProviders] = useState([]);

  useEffect(() => {
    if (nowProxyGroup) {
      setProxyGroup(nowProxyGroup);
      // 设置当前代理组的索引
      const name = nowProxyGroup.name;
      const i = groupNames.indexOf(name);
      setIndex(i === -1 ? groupNames.length - 2 : i);
    } else {
      setIndex(groupNames.length - 2);
    }
  }, [nowProxyGroup, groupNames]);

  useEffect(() => {
    const groups = groupNames.map((group: string) => [group, group]);
    // 去掉最后一个代理组GLOBAL
    groups.pop();
    groups.unshift(['请选择代理组', '请选择代理组']);
    // 去掉选中的代理组和当前代理组
    setProxyGroups(groups.filter((proxy: string[]) => !proxyGroup.proxies.includes(proxy[0]) && proxy[0] !== proxyGroup.name));
  }, [proxyGroup.proxies, groupNames]);


  useEffect(() => {
    const providers = proxyProviderNames.map((provider: string) => [provider, provider]);
    providers.unshift(['请选择代理源', '请选择代理源']);
    setProxyProviders(providers.filter((provider: string[]) => !proxyGroup.use.includes(provider[0])));
  }, [proxyGroup.use, proxyProviderNames]);

  const submit = () => {
    if (!proxyGroup.name) {
      notifyWarning('代理组名称不能为空');
      return;
    }
    if (!nowProxyGroup && groupNames.includes(proxyGroup.name)) {
      notifyWarning(`代理组名称 ${proxyGroup.name} 已存在`);
      return;
    }
    if (!proxyGroup.proxies.length && !proxyGroup.use.length) {
      notifyWarning('引用的代理组和代理源不能为空');
      return;
    }
    if (!proxyGroup.url) proxyGroup.url = defaultProxyGroup.url;
    if (!proxyGroup.interval) proxyGroup.interval = defaultProxyGroup.interval;
    if (proxyGroup.icon && !proxyGroup.icon.startsWith('https')) {
      notifyWarning('代理组图标地址错误');
      return;
    }

    if (proxyGroup.type === 'select') {
      delete proxyGroup.url;
      delete proxyGroup.interval;
    }
    proxyGroup['index'] = index;
    setSubmitting(true);
    fetch('/api/edit_proxy_group', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(proxyGroup)
    }).then(async (res) => {
      const response = await res.json();
      if (response.code === 200) {
        notifySuccess(response.message);
        onRequestClose();
      } else {
        notifyError(response.message);
      }
      setSubmitting(false);
    }).catch(() => {
      notifyError('网络错误');
      setSubmitting(false);
    });
  };

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div>
        <div style={{ textAlign: 'center', fontSize: '1.2em' }}>
          <span>{t('add_proxy_group')}</span>
        </div>

        <div className={s.main}>
          <div className={s.row}>
            代理组名称:
            <Input
              type="text"
              name="group_name"
              autoComplete="off"
              placeholder="唯一代理组名称"
              value={proxyGroup.name}
              onChange={(e) => setProxyGroup({ ...proxyGroup, name: e.target.value })
              } />
          </div>

          <div className={s.row}>
            代理组类型:
            <Select
              options={[['select', 'select'], ['url-test', 'url-test'],
                ['fallback', 'fallback'], ['load-balance', 'load-balance']]}
              selected={proxyGroup.type}
              onChange={(e) => setProxyGroup({ ...proxyGroup, type: e.target.value })
              }></Select>
          </div>

          <div className={s.row}>
            代理组索引:
            <Input
              type="number"
              name="rule_index"
              value={index}
              onChange={(e) => setIndex(e.target.value ? Number(e.target.value) : null)}
            />
          </div>

          <div className={s.row}>
            代理组图标:
            <Input
              type="text"
              name="group_icon"
              autoComplete="off"
              placeholder="https://"
              value={proxyGroup.icon}
              onChange={(e) => setProxyGroup({ ...proxyGroup, icon: e.target.value })
              } />
          </div>

          <div className={s.row}>
            代理组筛选:
            <Input
              type="text"
              name="group_filter"
              autoComplete="off"
              placeholder="香港|新加坡"
              value={proxyGroup.filter}
              onChange={(e) => setProxyGroup({ ...proxyGroup, filter: e.target.value })
              } />
          </div>

          <div className={s.row}>
            代理组排除:
            <Input
              type="text"
              name="group_exclude_filter"
              autoComplete="off"
              placeholder="到期|剩余"
              value={proxyGroup['exclude-filter']}
              onChange={(e) => setProxyGroup({ ...proxyGroup, 'exclude-filter': e.target.value })
              } />
          </div>

          {proxyGroup.type !== 'select' ? <div className={s.row}>
            代理组URL:
            <Input
              type="text"
              name="group_url"
              autoComplete="off"
              value={proxyGroup.url}
              onChange={(e) => setProxyGroup({ ...proxyGroup, url: e.target.value })
              } />
          </div> : null}

          {proxyGroup.type !== 'select' ? <div className={s.row}>
            代理组间隔:
            <Input
              type="number"
              name="group_interval"
              autoComplete="off"
              value={proxyGroup.interval}
              onChange={(e) => setProxyGroup({ ...proxyGroup, interval: parseInt(e.target.value) })
              } />
          </div> : null}

          <div className={s.row}>
            <div className={s.mSelectLabel}>
              导入代理组:
            </div>
            <MultiSelect
              options={proxyGroups}
              selected={proxyGroup.proxies}
              onChange={(e) => setProxyGroup({ ...proxyGroup, proxies: [...proxyGroup.proxies, e.target.value] })
              }
              onRemove={(e) => setProxyGroup({ ...proxyGroup, proxies: proxyGroup.proxies.filter((p) => p !== e) })
              } />
          </div>

          <div className={s.row}>
            <div className={s.mSelectLabel}>
              导入代理源:
            </div>
            <MultiSelect
              options={proxyProviders}
              selected={proxyGroup.use}
              onChange={(e) => setProxyGroup({ ...proxyGroup, use: [...proxyGroup.use, e.target.value] })
              }
              onRemove={(e) => setProxyGroup({ ...proxyGroup, use: proxyGroup.use.filter((p) => p !== e) })
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
  proxyProviderNames: getProxyProviderNames(s)
});

export default connect(mapState)(ModalAddProxyGroup);
