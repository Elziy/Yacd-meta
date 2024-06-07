import React, { useCallback, useState } from 'react';
import { reloadConfigFile } from '~/store/configs';
import { getClashAPIConfig, getUnreloadConfig } from '~/store/app';
import { connect } from '~/components/StateProvider';
import Button from '~/components/shared/Button';
import { useTranslation } from 'react-i18next';
import BaseModal from '~/components/shared/BaseModal';
import s from './ModalReloadConfig.module.scss';

function ModalReloadConfig({ dispatch, apiConfig, isOpen, onRequestClose, unReloadConfig }) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const handleReloadConfigFile = useCallback(() => {
    dispatch(reloadConfigFile(apiConfig));
  }, [apiConfig, dispatch]);

  const submit = () => {
    setSubmitting(true);
    handleReloadConfigFile();
    onRequestClose();
    setSubmitting(false);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}>
      <div style={{ textAlign: 'center', fontSize: '1.2em' }}>
        <span>{unReloadConfig?.length === 0 ? '没有未重载的配置' : '未重载的配置'}</span>
      </div>
      <div className={s.main}>
        <div className={s.configs}>
          {unReloadConfig?.map((config: string, index: number) =>
            <div key={index} className={s.multiSelectLabel}>
              <span style={{ width: '100%', textAlign: 'center' }}>{config}</span>
            </div>)}
        </div>
      </div>
      <Button disabled={unReloadConfig?.length === 0} isLoading={submitting} className={s.submit} onClick={submit}>{t('reload_config_file')}</Button>
    </BaseModal>
  );
}

const mapState = (s) => ({
  apiConfig: getClashAPIConfig(s),
  unReloadConfig: getUnreloadConfig(s)
});

export default connect(mapState)(ModalReloadConfig);
