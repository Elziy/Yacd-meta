import * as React from 'react';
import { focusManager, QueryClientProvider } from 'react-query';
import { HashRouter as Router, Route, RouteObject, Routes, useRoutes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import APIConfig from '~/components/apiConfig/APIConfig';
import { About } from '~/components/about/About';
import APIDiscovery from '~/components/apiConfig/APIDiscovery';
import ErrorBoundary from '~/components/error/ErrorBoundary';
import Home from '~/components/home/Home';
import Loading2 from '~/components/shared/Loading2';
import { Head } from '~/components/shared/Head';
import SideBar from '~/components/sideBar/SideBar';
import StateProvider from '~/components/StateProvider';
import StyleGuide from '~/components/test/StyleGuide';
import { queryClient } from '~/misc/query';
import { actions, initialState } from '~/store';

import styles from './App.module.scss';
import { ToastContainer } from 'react-toastify';

const { lazy, Suspense } = React;

const Connections = lazy(() => import('~/components/connections/Connections'));
const Config = lazy(() => import('~/components/configs/Config'));
const Logs = lazy(() => import('~/components/logs/Logs'));
const Proxies = lazy(() => import('~/components/proxies/Proxies'));
const Rules = lazy(() => import('~/components/rules/Rules'));

const routes = [
  { path: '/', element: <Home /> },
  { path: '/connections', element: <Connections /> },
  { path: '/configs', element: <Config /> },
  { path: '/logs', element: <Logs /> },
  { path: '/proxies', element: <Proxies /> },
  { path: '/rules', element: <Rules /> },
  { path: '/about', element: <About /> },
  process.env.NODE_ENV === 'development' ? { path: '/style', element: <StyleGuide /> } : false
].filter(Boolean) as RouteObject[];

focusManager.setFocused(false);

function SideBarApp() {
  return (
    <>
      <APIDiscovery />
      <SideBar />
      <div className={styles.content}>
        <Suspense fallback={<Loading2 />}>{useRoutes(routes)}</Suspense>
      </div>
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <RecoilRoot>
      <ToastContainer containerId={'ts'} />
      <StateProvider initialState={initialState} actions={actions}>
        <QueryClientProvider client={queryClient}>
          <div className={styles.app}>
            <Head />
            <Suspense fallback={<Loading2 />}>
              <Router>
                <Routes>
                  <Route path="/backend" element={<APIConfig />} />
                  <Route path="*" element={<SideBarApp />} />
                </Routes>
              </Router>
            </Suspense>
          </div>
        </QueryClientProvider>
      </StateProvider>
    </RecoilRoot>
  </ErrorBoundary>
);


export default App;
