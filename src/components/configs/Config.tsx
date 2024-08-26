import * as React from 'react';
import { DownloadCloud, LogOut, RotateCw, Trash2, Edit } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';

import * as logsApi from '~/api/logs';
import { fetchVersion } from '~/api/version';
import Select from '~/components/shared/Select';
import { ClashGeneralConfig, DispatchFn, State } from '~/store/types';
import { ClashAPIConfig } from '~/types';

import {
  getClashAPIConfig,
  getLatencyTestUrl,
  getMinTraffic,
  getSelectedChartStyleIndex,
  getUserIpFilter,
  getUtilsApiUrl,
} from '~/store/app';
import {
  fetchConfigs,
  flushFakeIPPool,
  flushTrafficStatistic,
  getConfigs,
  reloadConfigFile,
  restartCore,
  updateConfigs,
  updateGeoDatabasesFile,
  upgradeCore,
  upgradeUI,
} from '~/store/configs';
import { openModal } from '~/store/modals';
import Button from '../shared/Button';
import s0 from './Config.module.scss';
import ContentHeader from '../sideBar/ContentHeader';
import Input, { SelfControlledInput } from '../shared/Input';
import { Selection2 } from '../shared/Selection';
import { connect, useStoreActions } from '../StateProvider';
import Switch from '../shared/SwitchThemed';
import TrafficChartSample from './TrafficChartSample';
import ModalCloseAllConnections from '~/components/connections/ModalCloseAllConnections';
import { notifyWarning } from '~/misc/message';
import ModalAddUserIpFilter from '~/components/configs/ModalAddUserIpFilter';

const { useEffect, useState, useCallback, useRef } = React;

const propsList = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];

const logLeveOptions = [
  ['debug', 'Debug'],
  ['info', 'Info'],
  ['warning', 'Warning'],
  ['error', 'Error'],
  ['silent', 'Silent'],
];

const portFields = [
  { key: 'port', label: 'Http Port' },
  { key: 'socks-port', label: 'Socks5 Port' },
  { key: 'mixed-port', label: 'Mixed Port' },
  { key: 'redir-port', label: 'Redir Port' },
  { key: 'mitm-port', label: 'MITM Port' },
];

const langOptions = [
  ['zh-cn', '简体中文'],
  ['zh-tw', '繁體中文'],
  ['en', 'English'],
  ['vi', 'Vietnamese'],
];

const modeOptions = [
  ['direct', 'Direct'],
  ['rule', 'Rule'],
  ['script', 'Script'],
  ['global', 'Global'],
];

const tunStackOptions = [
  ['gvisor', 'gVisor'],
  ['mixed', 'Mixed'],
  ['system', 'System'],
  ['lwip', 'LWIP'],
];

const mapState = (s: State) => ({
  configs: getConfigs(s),
  apiConfig: getClashAPIConfig(s),
});

const mapState2 = (s: State) => ({
  selectedChartStyleIndex: getSelectedChartStyleIndex(s),
  utilsApiUrl: getUtilsApiUrl(s),
  latencyTestUrl: getLatencyTestUrl(s),
  minTraffic: getMinTraffic(s),
  userIpFilter: getUserIpFilter(s),
  apiConfig: getClashAPIConfig(s),
});

const Config = connect(mapState2)(ConfigImpl);
export default connect(mapState)(ConfigContainer);

function ConfigContainer({ dispatch, configs, apiConfig }) {
  useEffect(() => {
    dispatch(fetchConfigs(apiConfig));
  }, [dispatch, apiConfig]);
  return <Config configs={configs} />;
}

type ConfigImplProps = {
  dispatch: DispatchFn;
  configs: ClashGeneralConfig;
  selectedChartStyleIndex: number;
  utilsApiUrl: string;
  latencyTestUrl: string;
  minTraffic: number;
  userIpFilter: string[];
  apiConfig: ClashAPIConfig;
};

function getBackendContent(version: any): string {
  if (version && version.meta && !version.premium) {
    return 'Clash.Meta ';
  } else if (version && version.meta && version.premium) {
    return 'sing-box ';
  } else {
    return 'Clash Premium';
  }
}

function ConfigImpl({
  dispatch,
  configs,
  selectedChartStyleIndex,
  utilsApiUrl,
  latencyTestUrl,
  minTraffic,
  userIpFilter,
  apiConfig,
}: ConfigImplProps) {
  const { t, i18n } = useTranslation();

  const [configState, setConfigStateInternal] = useState(configs);
  const refConfigs = useRef(configs);
  useEffect(() => {
    if (refConfigs.current !== configs) {
      setConfigStateInternal(configs);
    }
    refConfigs.current = configs;
  }, [configs]);

  const openAPIConfigModal = useCallback(() => {
    dispatch(openModal('apiConfig'));
  }, [dispatch]);

  const setConfigState = useCallback(
    (name: string, val: any) => {
      setConfigStateInternal({ ...configState, [name]: val });
    },
    [configState]
  );

  const setTunConfigState = useCallback(
    (name: any, val: any) => {
      const tun = { ...configState.tun, [name]: val };
      setConfigStateInternal({ ...configState, tun: { ...tun } });
    },
    [configState]
  );

  const handleInputOnChange = useCallback(
    ({ name, value }) => {
      switch (name) {
        case 'mode':
        case 'log-level':
        case 'allow-lan':
        case 'sniffing':
          setConfigState(name, value);
          dispatch(updateConfigs(apiConfig, { [name]: value }));
          if (name === 'log-level') {
            logsApi.reconnect({ ...apiConfig, logLevel: value });
          }
          break;
        case 'mitm-port':
        case 'redir-port':
        case 'socks-port':
        case 'mixed-port':
        case 'port':
          if (value !== '') {
            const num = parseInt(value, 10);
            if (num < 0 || num > 65535) return;
          }
          setConfigState(name, value);
          break;
        case 'enable':
        case 'stack':
          setTunConfigState(name, value);
          dispatch(updateConfigs(apiConfig, { tun: { [name]: value } }));
          break;
        default:
          return;
      }
    },
    [apiConfig, dispatch, setConfigState, setTunConfigState]
  );

  const { selectChartStyleIndex, updateAppConfig } = useStoreActions();

  const handleInputOnBlur = useCallback(
    (
      e:
        | React.FocusEvent<HTMLSelectElement | HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
    ) => {
      const { name, value } = e.target;

      switch (name) {
        case 'port':
        case 'socks-port':
        case 'mixed-port':
        case 'redir-port':
        case 'mitm-port': {
          const num = parseInt(value, 10);
          if (num < 0 || num > 65535) return;
          dispatch(updateConfigs(apiConfig, { [name]: num }));
          break;
        }
        case 'utilsApiUrl':
        case 'latencyTestUrl': {
          updateAppConfig(name, value);
          break;
        }
        case 'minTraffic': {
          const num = parseInt(value, 10);
          if (num < 0) return;
          updateAppConfig(name, num);
          break;
        }
        case 'device name':
        case 'interface name':
          break;
        default:
          throw new Error(`unknown input name ${name}`);
      }
    },
    [apiConfig, dispatch, updateAppConfig]
  );
  const handleReloadConfigFile = useCallback(() => {
    dispatch(reloadConfigFile(apiConfig));
  }, [apiConfig, dispatch]);

  const handleRestartCore = useCallback(() => {
    dispatch(restartCore(apiConfig));
  }, [apiConfig, dispatch]);

  const handleUpgradeCore = useCallback(() => {
    dispatch(upgradeCore(apiConfig));
  }, [apiConfig, dispatch]);

  const handleUpgradeUI = useCallback(() => {
    dispatch(upgradeUI(apiConfig));
  }, [apiConfig, dispatch]);

  const handleUpdateGeoDatabasesFile = useCallback(() => {
    dispatch(updateGeoDatabasesFile(apiConfig));
  }, [apiConfig, dispatch]);

  const handleFlushFakeIPPool = useCallback(() => {
    dispatch(flushFakeIPPool(apiConfig));
  }, [apiConfig, dispatch]);

  const handleFlushTrafficStatistic = useCallback(() => {
    dispatch(flushTrafficStatistic(apiConfig));
  }, [apiConfig, dispatch]);

  const handleUserIpFilter = () => {
    userIpFilter = userIpFilter.filter((i) => i);
    updateAppConfig('userIpFilter', userIpFilter);
    setUserIpFilterModel(false);
  };

  const { data: version } = useQuery(['/version', apiConfig], () =>
    fetchVersion('/version', apiConfig)
  );

  const [reloadConfigFileModel, setReloadConfigFileModel] = useState(false);
  const [updateGeoDatabasesFileModel, setUpdateGeoDatabasesFileModel] = useState(false);
  const [flushFakeIPPoolModel, setFlushFakeIPPoolModel] = useState(false);
  const [flushTrafficStatisticModel, setFlushTrafficStatisticModel] = useState(false);
  const [userIpFilterModel, setUserIpFilterModel] = useState(false);
  const [restartCoreModel, setRestartCoreModel] = useState(false);
  const [upgradeCoreModel, setUpgradeCoreModel] = useState(false);
  const [updateUIModel, setUpdateUIModel] = useState(false);

  return (
    <div>
      <ContentHeader title={t('Config')} />
      <div className={s0.root}>
        {(version.meta && version.premium) ||
          portFields.map((f) =>
            configState[f.key] !== undefined ? (
              <div key={f.key}>
                <div className={s0.label}>{f.label}</div>
                <Input
                  name={f.key}
                  value={configState[f.key]}
                  onChange={({ target: { name, value } }) => handleInputOnChange({ name, value })}
                  // onBlur={handleInputOnBlur}
                />
              </div>
            ) : null
          )}

        <div>
          <div className={s0.label}>Mode</div>
          <Select
            options={modeOptions}
            selected={configState.mode.toLowerCase()}
            onChange={(e) => handleInputOnChange({ name: 'mode', value: e.target.value })}
          />
        </div>

        <div>
          <div className={s0.label}>Log Level</div>
          <Select
            options={logLeveOptions}
            selected={configState['log-level'].toLowerCase()}
            onChange={(e) => handleInputOnChange({ name: 'log-level', value: e.target.value })}
          />
        </div>

        {(version.meta && version.premium) || (
          <div>
            <div className={s0.label}>{t('allow_lan')}</div>
            <div className={s0.wrapSwitch}>
              <Switch
                name="allow-lan"
                checked={configState['allow-lan']}
                onChange={(value: boolean) =>
                  handleInputOnChange({ name: 'allow-lan', value: value })
                }
              />
            </div>
          </div>
        )}

        {version.meta && !version.premium && (
          <div>
            <div className={s0.label}>{t('tls_sniffing')}</div>
            <div className={s0.wrapSwitch}>
              <Switch
                name="sniffing"
                checked={configState['sniffing']}
                onChange={(value: boolean) =>
                  handleInputOnChange({ name: 'sniffing', value: value })
                }
              />
            </div>
          </div>
        )}
      </div>
      <div className={s0.sep}>
        <div />
      </div>
      {version.meta && (
        <>
          {version.premium || (
            <div>
              <div className={s0.section}>
                <div>
                  <div className={s0.label}>{t('enable_tun_device')}</div>
                  <div className={s0.wrapSwitch}>
                    <Switch
                      checked={configState['tun']?.enable}
                      onChange={(value: boolean) =>
                        handleInputOnChange({ name: 'enable', value: value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <div className={s0.label}>TUN IP Stack</div>
                  <Select
                    options={tunStackOptions}
                    selected={configState.tun?.stack?.toLowerCase()}
                    onChange={(e) => handleInputOnChange({ name: 'stack', value: e.target.value })}
                  />
                </div>
                <div>
                  <div className={s0.label}>Device Name</div>
                  <Input
                    name="device name"
                    value={configState.tun?.device}
                    onChange={handleInputOnBlur}
                  />
                </div>
                <div>
                  <div className={s0.label}>Interface Name</div>
                  <Input
                    name="interface name"
                    value={configState['interface-name'] || ''}
                    onChange={handleInputOnBlur}
                  />
                </div>
              </div>
              <div className={s0.sep}>
                <div />
              </div>
            </div>
          )}
          <div className={s0.section}>
            <div>
              <div className={s0.label}>{t('reload_config_file')}</div>
              <Button
                start={<RotateCw size={16} />}
                label={t('reload_config_file')}
                onClick={() => setReloadConfigFileModel(true)}
              />
              <ModalCloseAllConnections
                confirm={'reload_config_file'}
                isOpen={reloadConfigFileModel}
                primaryButtonOnTap={() => {
                  handleReloadConfigFile();
                  setReloadConfigFileModel(false);
                }}
                onRequestClose={() => setReloadConfigFileModel(false)}
              />
            </div>
            {version.meta && !version.premium && (
              <div>
                <div className={s0.label}>GEO数据库</div>
                <Button
                  start={<DownloadCloud size={16} />}
                  label={t('update_geo_databases_file')}
                  onClick={() => setUpdateGeoDatabasesFileModel(true)}
                />
                <ModalCloseAllConnections
                  confirm={'update_geo_databases_file'}
                  isOpen={updateGeoDatabasesFileModel}
                  primaryButtonOnTap={() => {
                    handleUpdateGeoDatabasesFile();
                    setUpdateGeoDatabasesFileModel(false);
                  }}
                  onRequestClose={() => setUpdateGeoDatabasesFileModel(false)}
                />
              </div>
            )}
            <div>
              <div className={s0.label}>FakeIP</div>
              <Button
                start={<Trash2 size={16} />}
                label={t('flush_fake_ip_pool')}
                onClick={() => setFlushFakeIPPoolModel(true)}
              />
              <ModalCloseAllConnections
                confirm={'flush_fake_ip_pool'}
                isOpen={flushFakeIPPoolModel}
                primaryButtonOnTap={() => {
                  handleFlushFakeIPPool();
                  setFlushFakeIPPoolModel(false);
                }}
                onRequestClose={() => setFlushFakeIPPoolModel(false)}
              />
            </div>
            <div>
              <div className={s0.label}>流量统计</div>
              <Button
                start={<Trash2 size={16} />}
                label={t('flush_traffic_statistic')}
                onClick={() => setFlushTrafficStatisticModel(true)}
              />
              <ModalCloseAllConnections
                confirm={'flush_traffic_statistic'}
                isOpen={flushTrafficStatisticModel}
                primaryButtonOnTap={() => {
                  handleFlushTrafficStatistic();
                  setFlushTrafficStatisticModel(false);
                }}
                onRequestClose={() => setFlushTrafficStatisticModel(false)}
              />
            </div>
            <div>
              <div className={s0.label}>{t('user_statistic_ip_filter')}</div>
              <Button
                start={<Edit size={16} />}
                label={t('add_user_statistic_ip_filter')}
                onClick={() => setUserIpFilterModel(true)}
              />
              <ModalAddUserIpFilter
                isOpen={userIpFilterModel}
                onRequestClose={handleUserIpFilter}
                userIpFilter={userIpFilter}
              />
            </div>

            {version.meta && !version.premium && (
              <div>
                <div className={s0.label}>重启核心</div>
                <Button
                  start={<RotateCw size={16} />}
                  label={t('restart_core')}
                  onClick={() => {
                    notifyWarning('重启核心后可能导致网络异常');
                    setRestartCoreModel(true);
                  }}
                />
                <ModalCloseAllConnections
                  confirm={'restart_core'}
                  isOpen={restartCoreModel}
                  primaryButtonOnTap={() => {
                    handleRestartCore();
                    setRestartCoreModel(false);
                  }}
                  onRequestClose={() => setRestartCoreModel(false)}
                />
              </div>
            )}
            {version.meta && !version.premium && (
              <div>
                <div className={s0.label}>⚠️ 升级核心 ⚠️</div>
                <Button
                  start={<RotateCw size={16} />}
                  label={t('upgrade_core')}
                  onClick={() => {
                    notifyWarning('升级核心后可能导致网络异常');
                    setUpgradeCoreModel(true);
                  }}
                />
                <ModalCloseAllConnections
                  confirm={'upgrade_core'}
                  isOpen={upgradeCoreModel}
                  primaryButtonOnTap={() => {
                    handleUpgradeCore();
                    setUpgradeCoreModel(false);
                  }}
                  onRequestClose={() => setUpgradeCoreModel(false)}
                />
              </div>
            )}
            {version.meta && !version.premium && (
              <div>
                <div className={s0.label}> 升级UI</div>
                <Button
                  start={<RotateCw size={16} />}
                  label={t('upgrade_ui')}
                  onClick={() => {
                    setUpdateUIModel(true);
                  }}
                />
                <ModalCloseAllConnections
                  confirm={'upgrade_ui'}
                  isOpen={updateUIModel}
                  primaryButtonOnTap={() => {
                    handleUpgradeUI();
                    setUpdateUIModel(false);
                  }}
                  onRequestClose={() => setUpdateUIModel(false)}
                />
              </div>
            )}
          </div>
          <div className={s0.sep}>
            <div />
          </div>
        </>
      )}

      <div className={s0.section}>
        <div>
          <div className={s0.label}>{t('latency_test_url')}</div>
          <SelfControlledInput
            name="latencyTestUrl"
            type="text"
            value={latencyTestUrl}
            onBlur={handleInputOnBlur}
          />
        </div>

        <div>
          <div className={s0.label}>{t('lang')}</div>
          <div>
            <Select
              options={langOptions}
              selected={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className={s0.label}>{t('chart_style')}</div>
          <Selection2
            OptionComponent={TrafficChartSample}
            optionPropsList={propsList}
            selectedIndex={selectedChartStyleIndex}
            onChange={selectChartStyleIndex}
          />
        </div>

        <div>
          <div className={s0.label}>{t('min_traffic')}</div>
          <Input name="minTraffic" type="number" value={minTraffic} onChange={handleInputOnBlur} />
        </div>

        {(version.meta && version.premium) || (
          <div>
            <div className={s0.label}>{t('min_traffic')}</div>
            <Input
              name="utilsApiUrl"
              type="text"
              value={utilsApiUrl}
              onChange={handleInputOnBlur}
            />
          </div>
        )}

        <div>
          <div className={s0.label}>
            <p>{t('current_backend') + ' : ' + getBackendContent(version) + apiConfig?.baseURL}</p>
          </div>
          <Button
            start={<LogOut size={16} />}
            label={t('switch_backend')}
            onClick={openAPIConfigModal}
          />
        </div>
      </div>
    </div>
  );
}
