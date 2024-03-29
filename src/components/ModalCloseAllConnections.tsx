import cx from 'clsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import Button from './Button';
import modalStyle from './Modal.module.scss';
import s from './ModalCloseAllConnections.module.scss';

const { useRef, useCallback, useMemo } = React;

export default function Comp(
  {
    confirm = 'close_all_confirm',
    isOpen,
    onRequestClose,
    primaryButtonOnTap
  }) {
  const { t } = useTranslation();
  const primaryButtonRef = useRef(null);
  const onAfterOpen = useCallback(() => {
    setSubmitting(false);
    primaryButtonRef.current.focus();
  }, []);
  const className = useMemo(
    () => ({
      base: cx(modalStyle.content, s.cnt),
      afterOpen: s.afterOpen,
      beforeClose: ''
    }),
    []
  );

  // 防止重复提交
  const [submitting, setSubmitting] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      onAfterOpen={onAfterOpen}
      className={className}
      overlayClassName={cx(modalStyle.overlay, s.overlay)}
    >
      <p style={{ textAlign: 'center' }}>{t(confirm)}</p>
      <div className={s.btngrp}>
        <Button disabled={submitting} onClick={() => {
          setSubmitting(true);
          primaryButtonOnTap();
        }} ref={primaryButtonRef}>
          {t('close_all_confirm_yes')}
        </Button>
        <div style={{ width: 20 }} />
        <Button onClick={onRequestClose}>{t('close_all_confirm_no')}</Button>
      </div>
    </Modal>
  );
}
