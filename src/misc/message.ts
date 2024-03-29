import { Slide, toast } from 'react-toastify';

export function notifyError(message: string) {
  const theme = document.documentElement.getAttribute('data-theme');
  toast.error(message, {
    style: {
      border: '1px solid #ff4d4f',
    },
    containerId: 'ts',
    position: 'top-center',
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme,
    transition: Slide
  });
}

export function notifySuccess(message: string) {
  const theme = document.documentElement.getAttribute('data-theme');
  toast.success(message, {
    style: {
      border: '1px solid #52c41a'
    },
    containerId: 'ts',
    position: 'top-center',
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme,
    transition: Slide
  });
}

export function notifyInfo(message: string) {
  const theme = document.documentElement.getAttribute('data-theme');
  toast.info(message, {
    style: {
      border: '1px solid #1890ff'
    },
    containerId: 'ts',
    position: 'top-center',
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme,
    transition: Slide
  });
}


export function notifyWarning(message: string) {
  const theme = document.documentElement.getAttribute('data-theme');
  toast.warning(message, {
    style: {
      border: '1px solid #faad14'
    },
    containerId: 'ts',
    position: 'top-center',
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme,
    transition: Slide
  });
}


