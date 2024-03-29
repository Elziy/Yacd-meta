import React from 'react';

import s from './Basic.module.scss';

const getBase64 = async (url: RequestInfo | URL) => {
  const res = await fetch(url);
  const blob = await res.blob();
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export function SectionNameType({ name, type, now, icon }) {
  let src = '';

  if (name === 'GLOBAL')
    src = 'Global.png';
  else if (type === 'HTTP' || type === 'HTTPS')
    src = 'yacd.png';
  else if (icon) {
    let base64 = localStorage.getItem(icon);
    if (base64) {
      src = base64;
    } else {
      getBase64(icon).then((res) => {
        src = res as string;
        if (src) {
          localStorage.setItem(icon, src);
        }
      });
    }
  }

  return (
    <h2 className={s.sectionNameType}>
      {src ? <img src={src} style={{ width: '2.4em', height: '2.4em', marginRight: 10 }} alt="yacd" /> : null}
      <div style={{ marginRight: 5 }}>
        <span style={{ fontSize: '15px', verticalAlign: 'top' }}>{name}</span>
        <div>
          {now ? <span style={{ fontSize: '12px', color: '#777', marginRight: '1.5em' }}>{now}</span>
            : null}
          <span>{type.toUpperCase()}</span>
        </div>
      </div>
    </h2>
  );
}

export function LoadingDot() {
  return <span className={s.loadingDot} />;
}
