// noinspection RequiredAttributes

import { Tooltip } from '@reach/tooltip';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '~/components/shared/Button';
import ContentHeader from '~/components/sideBar/ContentHeader';
import { ClosePrevConns } from '~/components/proxies/ClosePrevConns';
import { ProxyGroup } from '~/components/proxies/ProxyGroup';
import ProxyProviderList from '~/components/proxies/ProxyProviderList';
import Settings from '~/components/proxies/Settings';
import BaseModal from '~/components/shared/BaseModal';
import { TextFilter } from '~/components/shared/TextFitler';
import { connect, useStoreActions } from '~/components/StateProvider';
import { getClashAPIConfig } from '~/store/app';
import {
  fetchProxies,
  getDelay,
  getProxyGroupNames,
  getProxyProviders,
  getShowModalClosePrevConns,
  proxyFilterText
} from '~/store/proxies';
import type { State } from '~/store/types';

import s0 from './Proxies.module.scss';
import { FiPlusCircle, FiRepeat } from 'react-icons/fi';
import Equalizer from '~/components/svg/Equalizer';
import ModalAddProxyGroup from '~/components/proxies/ModalAddProxyGroup';
import { reloadConfigFile } from '~/store/configs';
import ModalReloadConfig from '~/components/sideBar/ModalReloadConfig';

const { useState, useEffect, useCallback, useRef } = React;

function Proxies({
                   dispatch,
                   groupNames,
                   delay,
                   proxyProviders,
                   apiConfig,
                   showModalClosePrevConns
                 }) {
  const { t } = useTranslation();

  const fetchProxiesHooked = useCallback(() => {
    dispatch(fetchProxies(apiConfig));
  }, [apiConfig, dispatch]);

  const handleReloadConfigFile = useCallback(() => {
    dispatch(reloadConfigFile(apiConfig));
  }, [apiConfig, dispatch]);

  useEffect(() => {
    fetchProxiesHooked();
  }, [fetchProxiesHooked]);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const closeSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, []);

  const {
    proxies: { closeModalClosePrevConns, closePrevConnsAndTheModal }
  } = useStoreActions();


  const [addProxyGroupModal, setAddProxyGroupModal] = useState(false);
  const [reload_config, setReloadConfig] = useState(false);

  return (
    <div>
      <div className={s0.header}>
        <ContentHeader title={t('Proxies')} />
        <TextFilter textAtom={proxyFilterText} placeholder={t('Search')} />
        <Tooltip label={t('reload_config_file')}>
          <Button className={s0.firstButton} onClick={() => setReloadConfig(true)} kind="minimal">
            <FiRepeat size={20} />
          </Button>
        </Tooltip>

        <Tooltip label={t('settings')}>
          <Button kind="minimal" onClick={() => setIsSettingsModalOpen(true)}>
            <Equalizer size={20} />
          </Button>
        </Tooltip>

        <Tooltip label={t('add_proxy_group')}>
          <Button onClick={() => {
            setAddProxyGroupModal(true);
          }} kind="minimal">
            <FiPlusCircle size={20} />
          </Button>
        </Tooltip>
      </div>
      <div>
        {groupNames.map((groupName: string) => {
          return (
            <div className={s0.group} key={groupName}>
              <ProxyGroup
                name={groupName}
                delay={delay}
                apiConfig={apiConfig}
                dispatch={dispatch}
              />
            </div>
          );
        })}
      </div>
      <ProxyProviderList items={proxyProviders} />
      <div style={{ height: 60 }} />
      {/*<ProxyPageFab dispatch={dispatch} apiConfig={apiConfig} proxyProviders={proxyProviders} />*/}

      <ModalAddProxyGroup isOpen={addProxyGroupModal} onRequestClose={() => {
        setAddProxyGroupModal(false);
      }} />

      <ModalReloadConfig isOpen={reload_config} onRequestClose={() => setReloadConfig(false)} />

      <BaseModal isOpen={isSettingsModalOpen} onRequestClose={closeSettingsModal}>
        <Settings />
      </BaseModal>

      <BaseModal isOpen={showModalClosePrevConns} onRequestClose={closeModalClosePrevConns}>
        <ClosePrevConns
          onClickPrimaryButton={() => closePrevConnsAndTheModal(apiConfig)}
          onClickSecondaryButton={closeModalClosePrevConns}
        />
      </BaseModal>
    </div>
  );
}

const mapState = (s: State) => ({
  apiConfig: getClashAPIConfig(s),
  groupNames: getProxyGroupNames(s),
  proxyProviders: getProxyProviders(s),
  delay: getDelay(s),
  showModalClosePrevConns: getShowModalClosePrevConns(s)
});

export default connect(mapState)(Proxies);

