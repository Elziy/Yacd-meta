import * as React from 'react';
import { Zap, Edit } from 'react-feather';
import { useQuery } from 'react-query';

import * as proxiesAPI from '~/api/proxies';
import { fetchVersion } from '~/api/version';
import { getCollapsibleIsOpen, getHideUnavailableProxies, getLatencyTestUrl, getProxySortBy } from '~/store/app';
import { fetchProxies, getProxies, switchProxy } from '~/store/proxies';

import Button from '../shared/Button';
import CollapsibleSectionHeader from './ProxyHeader';
import { connect, useStoreActions } from '../StateProvider';
import { useFilteredAndSorted } from './hooks';
import s0 from './ProxyGroup.module.scss';
import { ProxyList, ProxyListSummaryView } from './ProxyList';
import ModalAddProxyGroup, { defaultProxyGroup } from '~/components/proxies/ModalAddProxyGroup';
import { notifyError } from '~/misc/message';

const { createElement, useCallback, useMemo, useState, useEffect } = React;

function ProxyGroupImpl({
                          name,
                          all: allItems,
                          delay,
                          hideUnavailableProxies,
                          proxySortBy,
                          proxies,
                          type,
                          now,
                          nowProxy,
                          icon,
                          isOpen,
                          latencyTestUrl,
                          apiConfig,
                          dispatch
                        }) {
  const all = useFilteredAndSorted(allItems, delay, hideUnavailableProxies, proxySortBy, proxies);

  const { data: version } = useQuery(['/version', apiConfig], () =>
    fetchVersion('/version', apiConfig)
  );

  const isSelectable = useMemo(
    () => ['Selector', version.meta && 'Fallback', version.meta && 'URLTest'].includes(type),
    [type, version.meta]
  );

  const {
    app: { updateCollapsibleIsOpen },
    proxies: { requestDelayForProxies }
  } = useStoreActions();

  const toggle = useCallback(() => {
    updateCollapsibleIsOpen('proxyGroup', name, !isOpen);
  }, [isOpen, updateCollapsibleIsOpen, name]);

  const itemOnTapCallback = useCallback(
    (proxyName) => {
      if (!isSelectable) return;
      dispatch(switchProxy(apiConfig, name, proxyName));
    },
    [apiConfig, dispatch, name, isSelectable]
  );
  const [isTestingLatency, setIsTestingLatency] = useState(false);
  const testLatency = useCallback(async () => {
    setIsTestingLatency(true);
    try {
      if (version.meta === true) {
        await proxiesAPI.requestDelayForProxyGroup(apiConfig, name, latencyTestUrl);
        await dispatch(fetchProxies(apiConfig));
      } else {
        await requestDelayForProxies(apiConfig, all);
        await dispatch(fetchProxies(apiConfig));
      }
    } catch (err) {
    }
    setIsTestingLatency(false);
  }, [all, apiConfig, dispatch, name, version.meta]);

  const [addProxyGroupModal, setAddProxyGroupModal] = useState(false);
  const [proxyGroup, setProxyGroup] = useState(null);
  const openAddProxyGroupModal = () => {
    setAddProxyGroupModal(true);
    fetch('/api/get_proxy_group?name=' + name, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(async (res) => {
      const response = await res.json();
      if (response.code === 200) {
        setProxyGroup({
          name: response.data.name,
          type: response.data.type,
          proxies: response.data.proxies || [],
          use: response.data.use || [],
          icon: response.data.icon || '',
          'disable-udp': response.data['disable-udp'] || false,
          filter: response.data.filter || '',
          'exclude-filter': response.data['exclude-filter'] || '',
          url: response.data.url || defaultProxyGroup.url,
          interval: response.data.interval || defaultProxyGroup.interval
        });
      } else {
        notifyError(response.message);
        setAddProxyGroupModal(false);
      }
    }).catch(() => {
      notifyError('网络错误');
      setAddProxyGroupModal(false);
    });
  };

  return (
    <div className={s0.group}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <CollapsibleSectionHeader name={name} type={type} now={now} nowProxy={nowProxy} icon={icon} toggle={toggle} qty={all.length} />
        <div className={s0.clickable} onClick={toggle}>
        </div>
        <div style={{ display: 'flex' }}>
          <>
            <Button
              kind="minimal"
              onClick={openAddProxyGroupModal}
              className={s0.btn}
              isLoading={addProxyGroupModal}
            >
              <div className={s0.zapWrapper}>
                <Edit size={16} />
              </div>
            </Button>
            <Button
              title="Test latency"
              kind="minimal"
              onClick={testLatency}
              isLoading={isTestingLatency}
            >
              <div className={s0.zapWrapper}>
                <Zap size={16} />
              </div>
            </Button>
          </>
        </div>
      </div>
      {createElement(isOpen ? ProxyList : ProxyListSummaryView, {
        all,
        now,
        latencyTestUrl,
        isSelectable,
        itemOnTapCallback
      })}

      <ModalAddProxyGroup nowProxyGroup={proxyGroup} isOpen={addProxyGroupModal} onRequestClose={() => {
        setAddProxyGroupModal(false);
      }} />
    </div>
  );
}

export const ProxyGroup = connect((s, { name, delay }) => {
  const proxies = getProxies(s);
  const collapsibleIsOpen = getCollapsibleIsOpen(s);
  const proxySortBy = getProxySortBy(s);
  const hideUnavailableProxies = getHideUnavailableProxies(s);
  const latencyTestUrl = getLatencyTestUrl(s);

  const group = proxies[name];
  const { all, type, now, icon } = group;
  let nowProxy = now;
  while (proxies[nowProxy].now) {
    nowProxy = proxies[nowProxy].now;
  }

  return {
    all,
    delay,
    hideUnavailableProxies,
    proxySortBy,
    proxies,
    type,
    now,
    nowProxy,
    icon,
    isOpen: collapsibleIsOpen[`proxyGroup:${name}`],
    latencyTestUrl
  };
})(ProxyGroupImpl);
