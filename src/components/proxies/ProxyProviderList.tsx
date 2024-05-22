import * as React from 'react';

import ContentHeader from '~/components/sideBar/ContentHeader';
import { ProxyProvider } from '~/components/proxies/ProxyProvider';
import { FormattedProxyProvider } from '~/store/types';
import s0 from '~/components/proxies/Proxies.module.scss';
import { Tooltip } from '@reach/tooltip';
import Button from '~/components/shared/Button';
import { FiPlus } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ModalAddProxyProvider from '~/components/proxies/ModalAddProxyProvider';

export function ProxyProviderList({ items }: { items: FormattedProxyProvider[] }) {
  const { t } = useTranslation();
  const [addProxyProviderModal, setAddProxyProviderModal] = React.useState(false);

  if (items.length === 0) return null;

  // noinspection RequiredAttributes
  return (
    <div>
      <div className={s0.header}>
        <ContentHeader title={t('Proxy_Provider')} />
        <Tooltip label={t('add_proxy_provider')}>
          <Button onClick={() => {
            setAddProxyProviderModal(true);
          }} kind="minimal">
            <FiPlus size={24} />
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
      <ModalAddProxyProvider
        isOpen={addProxyProviderModal}
        onRequestClose={() => setAddProxyProviderModal(false)} />
    </div>
  );
}
