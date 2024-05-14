import React from 'react';
import { HiArrowNarrowRight } from 'react-icons/hi';


import s from './Basic.module.scss';

const getBase64 = async (url: RequestInfo | URL) => {
  const headers = new Headers();
  headers.append('Control-Allow-Origin', '*');
  headers.append('Access-Control-Allow-Credentials', 'true');
  headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  const res = await fetch(url);
  const blob = await res.blob();
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export function SectionNameType({ name, type, now, nowProxy, icon }) {
  let src = '';

  if (name === 'GLOBAL')
    src = 'Global.png';
  else if (type === 'HTTP' || type === 'HTTPS')
    src = 'yacd.png';
  else if (icon) {
    let cacheObj = JSON.parse(localStorage.getItem('iconCache') || '{}');
    let base64 = cacheObj[icon];
    if (base64) {
      src = base64;
    } else {
      getBase64(icon).then((res) => {
        src = res as string;
        if (src) {
          cacheObj = JSON.parse(localStorage.getItem('iconCache') || '{}');
          localStorage.setItem('iconCache', JSON.stringify({ ...cacheObj, [icon]: src }));
        }
      });
    }
  }

  return (
    <h2 className={s.sectionNameType}>
      {src ? <img src={src} style={{ width: '2.4em', height: '2.4em', marginRight: 10 }} alt="yacd" /> : null}
      <div style={{ marginRight: 5 }}>
        <span style={{ fontSize: '15px', verticalAlign: 'top' }}>{name}</span>
        <div className={s.proxyMain}>
          {now ? <div className={s.proxy}>
              <span>{now}</span>
              {now !== nowProxy ? <><HiArrowNarrowRight size={16} />
                <span>{nowProxy}</span></> : null}
            </div>
            : null}
          <span className={s.disabled}>{type.toUpperCase()}</span>
        </div>
      </div>
    </h2>
  );
}

export function LoadingDot() {
  return <span className={s.loadingDot} />;
}
