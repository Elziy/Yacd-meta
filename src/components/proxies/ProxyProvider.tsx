import * as React from 'react';
import { Edit, RotateCw, Zap } from 'react-feather';

import Button from '~/components/shared/Button';
import Collapsible from '~/components/shared/Collapsible';
import CollapsibleSectionHeader from '~/components/proxies/ProxyHeader';
import { useUpdateProviderItem } from '~/components/proxies/proxies.hooks';
import s0 from '~/components/proxies/ProxyGroup.module.scss';
import { connect, useStoreActions } from '~/components/StateProvider';
import { framerMotionResouce } from '~/misc/motion';
import {
  getClashAPIConfig,
  getCollapsibleIsOpen,
  getHideUnavailableProxies,
  getLatencyTestUrl,
  getProxySortBy,
  getUnreloadConfig, getUtilsApiUrl
} from '~/store/app';
import { getDelay, healthcheckProviderByName } from '~/store/proxies';
import { DelayMapping, SubscriptionInfo } from '~/store/types';

import { useFilteredAndSorted } from './hooks';
import { ProxyList, ProxyListSummaryView } from './ProxyList';
import s from './ProxyProvider.module.scss';
import { useTranslation } from 'react-i18next';
import { formatTime } from '~/api/proxies';
import ModalAddProxyProvider, { defaultProxyProvider } from '~/components/proxies/ModalAddProxyProvider';
import { notifyError, notifySuccess } from '~/misc/message';
import { HiX } from 'react-icons/hi';
import ModalCloseAllConnections from '~/components/connections/ModalCloseAllConnections';

const { useState, useCallback } = React;

type Props = {
  name: string;
  proxies: Array<string>;
  delay: DelayMapping;
  icon: string;
  latencyTestUrl?: string;
  hideUnavailableProxies: boolean;
  proxySortBy: string;
  type: 'Proxy' | 'Rule';
  vehicleType: 'HTTP' | 'File' | 'Compatible';
  updatedAt?: string;
  subscriptionInfo?: SubscriptionInfo;
  dispatch: (x: any) => Promise<any>;
  isOpen: boolean;
  unReloadConfig: string[];
  apiConfig: any;
  utilsApiUrl: string;
};

function ProxyProviderImpl({
                             name,
                             proxies: all,
                             delay,
                             icon,
                             latencyTestUrl,
                             hideUnavailableProxies,
                             proxySortBy,
                             vehicleType,
                             updatedAt,
                             subscriptionInfo,
                             isOpen,
                             unReloadConfig,
                             dispatch,
                             apiConfig,
                             utilsApiUrl
                           }: Props) {
  const { t } = useTranslation();
  const { updateAppConfig } = useStoreActions();
  const proxies = useFilteredAndSorted(all, delay, hideUnavailableProxies, proxySortBy);
  const [isHealthcheckLoading, setIsHealthcheckLoading] = useState(false);

  const updateProvider = useUpdateProviderItem({ dispatch, apiConfig, name });

  const healthcheckProvider = useCallback(async () => {
    setIsHealthcheckLoading(true);
    await dispatch(healthcheckProviderByName(apiConfig, name));
    setIsHealthcheckLoading(false);
  }, [apiConfig, dispatch, name, setIsHealthcheckLoading]);

  const {
    app: { updateCollapsibleIsOpen }
  } = useStoreActions();

  const toggle = useCallback(() => {
    updateCollapsibleIsOpen('proxyProvider', name, !isOpen);
  }, [isOpen, updateCollapsibleIsOpen, name]);

  // const timeAgo = formatDistance(new Date(updatedAt), new Date());
  const timeAgo = formatTime(new Date(updatedAt));
  const total = subscriptionInfo ? formatBytes(subscriptionInfo.Total) : 0;
  const used = subscriptionInfo
    ? formatBytes(subscriptionInfo.Download + subscriptionInfo.Upload)
    : 0;
  const percentage = subscriptionInfo
    ? (
      ((subscriptionInfo.Download + subscriptionInfo.Upload) / subscriptionInfo.Total) *
      100
    ).toFixed(2)
    : 0;
  const expireStr = () => {
    if (subscriptionInfo.Expire === 0) {
      return '长期有效';
    }
    const expire = new Date(subscriptionInfo.Expire * 1000);
    const getYear = expire.getFullYear() + '-';
    const getMonth =
      (expire.getMonth() + 1 < 10 ? '0' + (expire.getMonth() + 1) : expire.getMonth() + 1) + '-';
    const getDate = (expire.getDate() < 10 ? '0' + expire.getDate() : expire.getDate()) + ' ';
    return getYear + getMonth + getDate;
  };

  const [addProxyProviderModal, setAddProxyProviderModal] = useState(false);
  const [removeProxyProviderModal, setRemoveProxyProviderModal] = useState(false);
  const [proxyProvider, setProxyProvider] = useState(null);
  const openAddProxyProviderModal = () => {
    setAddProxyProviderModal(true);
    fetch(utilsApiUrl + '/get_proxy_provider?name=' + name, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(async (res) => {
      const response = await res.json();
      if (response.code === 200) {
        setProxyProvider({
          name: name,
          type: 'http',
          url: response.data.url,
          icon: response.data.icon || '',
          path: defaultProxyProvider.path,
          interval: response.data.interval || defaultProxyProvider.interval,
          proxy: response.data.proxy || '',
          'health-check': {
            enable: false,
            url: defaultProxyProvider['health-check'].url,
            interval: defaultProxyProvider['health-check'].interval
          },
          override: {
            'additional-prefix': response.data.override?.['additional-prefix'] || ''
          },
          filter: response.data.filter || '',
          'exclude-filter': response.data['exclude-filter'] || ''
        });
      } else {
        notifyError(response.message);
        setAddProxyProviderModal(false);
      }
    }).catch(() => {
      notifyError('网络错误');
      setAddProxyProviderModal(false);
    });
  };
  const removeProxyProvider = (name: string) => {
    fetch(utilsApiUrl + '/delete_proxy_provider', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    }).then(async (res) => {
      const response = await res.json();
      if (response.code === 200) {
        notifySuccess(response.message);
        unReloadConfig?.push('删除代理资源 : ' + name);
        updateAppConfig('unReloadConfig', unReloadConfig);
      } else {
        notifyError(response.message);
      }
    }).catch(() => {
      notifyError('网络错误');
    });
  };

  return (
    <div className={s.body}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}
      >
        <CollapsibleSectionHeader
          name={name}
          toggle={toggle}
          type={vehicleType}
          icon={icon}
          isOpen={isOpen}
          qty={proxies.length}
        />
        <div className={s0.clickable} onClick={toggle}></div>
        <div style={{ display: 'flex' }}>
          <Button
            kind="minimal"
            onClick={openAddProxyProviderModal}
            className={s0.btn}
            isLoading={addProxyProviderModal}
          >
            <div className={s0.zapWrapper}>
              <Edit size={16} />
            </div>
          </Button>
          <Button kind="minimal" start={<Refresh />} onClick={updateProvider} />
          <Button
            kind="minimal"
            start={<HiX size={18} />}
            onClick={() => setRemoveProxyProviderModal(true)}
            className={s0.btn}
            isLoading={removeProxyProviderModal}
          />
          {/*<Button*/}
          {/*  kind="minimal"*/}
          {/*  start={<Zap size={16} />}*/}
          {/*  onClick={healthcheckProvider}*/}
          {/*  isLoading={isHealthcheckLoading}*/}
          {/*/>*/}
        </div>
      </div>
      <div className={s.updatedAt}>
        {subscriptionInfo && (
          <small>
            {used} / {total} ( {percentage}% ) &nbsp;&nbsp; {t('expire')}: {expireStr()}{' '}
          </small>
        )}
        <br />
        <small>更新于{timeAgo}</small>
      </div>
      {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element[]; isOpen: boolean; }' i... Remove this comment to see the full error message */}
      <Collapsible isOpen={isOpen}>
        <ProxyList all={proxies} latencyTestUrl={latencyTestUrl} />
        <div className={s.actionFooter}>
          {/*<Button text="Update" start={<Refresh />} onClick={updateProvider} />*/}
          <Button
            text="Health Check"
            start={<Zap size={16} />}
            onClick={healthcheckProvider}
            isLoading={isHealthcheckLoading}
          />
        </div>
      </Collapsible>
      {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; isOpen: boolean; }' is ... Remove this comment to see the full error message */}
      <Collapsible isOpen={!isOpen}>
        <ProxyListSummaryView all={proxies} />
      </Collapsible>
      <ModalAddProxyProvider
        nowProxyProvider={proxyProvider}
        isOpen={addProxyProviderModal}
        onRequestClose={() => setAddProxyProviderModal(false)} />
      <ModalCloseAllConnections
        confirm={'remove_proxy_provider'}
        isOpen={removeProxyProviderModal}
        primaryButtonOnTap={() => {
          removeProxyProvider(name);
          setRemoveProxyProviderModal(false);
        }}
        onRequestClose={() => setRemoveProxyProviderModal(false)} />
    </div>
  );
}

const button = {
  rest: { scale: 1 },
  pressed: { scale: 0.95 }
};
const arrow = {
  rest: { rotate: 0 },
  hover: { rotate: 360, transition: { duration: 0.3 } }
};

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function Refresh() {
  const module = framerMotionResouce.read();
  const motion = module.motion;
  return (
    <motion.div
      className={s.refresh}
      variants={button}
      initial="rest"
      whileHover="hover"
      whileTap="pressed"
    >
      <motion.div className="flexCenter" variants={arrow}>
        <RotateCw size={16} />
      </motion.div>
    </motion.div>
  );
}

const mapState = (s, { proxies, name }) => {
  const hideUnavailableProxies = getHideUnavailableProxies(s);
  const delay = getDelay(s);
  const collapsibleIsOpen = getCollapsibleIsOpen(s);
  const apiConfig = getClashAPIConfig(s);
  const latencyTestUrl = getLatencyTestUrl(s);
  const unReloadConfig = getUnreloadConfig(s);

  const proxySortBy = getProxySortBy(s);

  return {
    apiConfig,
    utilsApiUrl: getUtilsApiUrl(s),
    proxies,
    delay,
    latencyTestUrl,
    hideUnavailableProxies,
    proxySortBy,
    isOpen: collapsibleIsOpen[`proxyProvider:${name}`],
    unReloadConfig: unReloadConfig
  };
};

export const ProxyProvider = connect(mapState)(ProxyProviderImpl);
