import React from 'react';

import { useTranslation } from 'react-i18next';
import BaseModal from '~/components/shared/BaseModal';
import s from './ShowModel.module.scss';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atelierDuneDark, atelierDuneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Loading from '~/components/shared/Loading2';
import { HiX } from 'react-icons/hi';

export default function ModalAddRule({ isOpen, onRequestClose, data }) {
  if (!data)
    return (
      <BaseModal isOpen={isOpen} onRequestClose={onRequestClose}>
        <Loading />
      </BaseModal>
    );

  const type = data.type || 'yaml';

  const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? atelierDuneDark : atelierDuneLight;

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div>
        <button className={s.close} onClick={onRequestClose}>
          <HiX size={24} />
        </button>
      </div>
      <div style={{ paddingBottom: 20 }}></div>
      <div className={s.main}>
        <div>
          <SyntaxHighlighter language={type} style={theme}>
            {data.content}
          </SyntaxHighlighter>
        </div>
      </div>
    </BaseModal>
  );
}
