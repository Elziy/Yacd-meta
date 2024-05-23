import ContentHeader from '~/components/sideBar/ContentHeader';
import { ProxyProvider } from '~/components/proxies/ProxyProvider';
import { State } from '~/store/types';
import s0 from '~/components/proxies/Proxies.module.scss';
import { Tooltip } from '@reach/tooltip';
import Button from '~/components/shared/Button';
import { FiPlusCircle, FiRepeat } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ModalAddProxyProvider from '~/components/proxies/ModalAddProxyProvider';
import React, { useCallback, useState } from 'react';
import ModalCloseAllConnections from '~/components/connections/ModalCloseAllConnections';
import { reloadConfigFile } from '~/store/configs';
import { connect } from '~/components/StateProvider';
import { getClashAPIConfig } from '~/store/app';


function ProxyProviderList({ apiConfig, items, dispatch }) {
  const { t } = useTranslation();
  const [addProxyProviderModal, setAddProxyProviderModal] = useState(false);
  const [reload_config, setReloadConfig] = useState(false);

  const handleReloadConfigFile = useCallback(() => {
    dispatch(reloadConfigFile(apiConfig));
  }, [apiConfig, dispatch]);

  if (items.length === 0) return null;

  // noinspection RequiredAttributes
  return (
    <div>
      <div className={s0.header}>
        <ContentHeader title={t('Proxy_Provider')} />
        <Tooltip label={t('reload_config_file')}>
          <Button className={s0.firstButton} onClick={() => setReloadConfig(true)} kind="minimal">
            <FiRepeat size={20} />
          </Button>
        </Tooltip>
        <Tooltip label={t('add_proxy_provider')}>
          <Button onClick={() => {
            setAddProxyProviderModal(true);
          }} kind="minimal">
            <FiPlusCircle size={20} />
          </Button>
        </Tooltip>
      </div>
      <div>
        {items.map((item) => (
          <ProxyProvider
            key={item.name}
            name={item.name}
            proxies={item.proxies}
            type={item.type}
            vehicleType={item.vehicleType}
            updatedAt={item.updatedAt}
            subscriptionInfo={item.subscriptionInfo}
          />
        ))}
      </div>
      <ModalCloseAllConnections
        confirm={'reload_config_file'}
        isOpen={reload_config}
        primaryButtonOnTap={() => {
          handleReloadConfigFile();
          setReloadConfig(false);
        }}
        onRequestClose={() => setReloadConfig(false)}
      />
      <ModalAddProxyProvider
        isOpen={addProxyProviderModal}
        onRequestClose={() => setAddProxyProviderModal(false)} />
    </div>
  );
}

const mapState = (s: State) => ({
  apiConfig: getClashAPIConfig(s)
});

export default connect(mapState)(ProxyProviderList);
