import React from 'react';

import s0 from './ErrorBoundaryFallback.module.scss';
import SvgGithub from '../svg/SvgGithub';
import SvgYacd from '../svg/SvgYacd';

const yacdRepoIssueUrl = 'https://github.com/Elziy/Yacd-meta';

type Props = {
  message?: string;
  detail?: string;
};

function ErrorBoundaryFallback({ message, detail }: Props) {
  return (
    <div className={s0.root}>
      <div className={s0.yacd}>
        <SvgYacd width={150} height={150} />
      </div>
      {message ? <h1>{message}</h1> : null}
      {detail ? <p>{detail}</p> : null}
      <p>
        <a className={s0.link} href={yacdRepoIssueUrl}>
          <SvgGithub width={20} height={20} />
          <span>Elziy/Yacd-meta</span>
        </a>
      </p>
    </div>
  );
}

export default ErrorBoundaryFallback;
