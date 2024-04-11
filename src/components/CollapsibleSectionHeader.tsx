import * as React from 'react';

import s from './CollapsibleSectionHeader.module.scss';
import { SectionNameType } from './shared/Basic';

type Props = {
  name: string;
  type: string;
  now?: string;
  icon?: string;
  qty?: number;
  toggle?: () => void;
  isOpen?: boolean;
};

export default function Header({ name, type, now, icon, toggle, qty }: Props) {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      if (e.key === 'Enter' || e.key === ' ') {
        toggle();
      }
    },
    [toggle]
  );
  return (
    <div
      className={s.header}
      onClick={toggle}
      style={{ cursor: 'pointer' }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="button"
    >
      <SectionNameType name={name} type={type} now={now} icon={icon} />
      {typeof qty === 'number' ? <div style={{ paddingBottom: '0.1em' }}><span className={s.qty}>{qty}</span></div> : null}
    </div>
  );
}
