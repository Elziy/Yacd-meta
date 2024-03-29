import * as React from 'react';
import type { RecoilState } from 'recoil';

import { useTextInut } from '~/hooks/useTextInput';

import s from './TextFitler.module.scss';
import { MdClear } from 'react-icons/md';

export function TextFilter(props: { textAtom: RecoilState<string>; placeholder?: string }) {
  const [onChange, clear, text] = useTextInut(props.textAtom);

  return (
    <div className={s.container}>
      <input
        className={s.input}
        type="text"
        value={text}
        onChange={onChange}
        placeholder={props.placeholder}
      />
      <div onClick={clear} className={s.clear}><MdClear style={{ paddingTop: '2px' }} size={18} /></div>
    </div>
  );
}
