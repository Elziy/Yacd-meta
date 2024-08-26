import '../connections/Connections.css';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { areEqual, VariableSizeList } from 'react-window';

import { RuleProviderItem } from '~/components/rules/RuleProviderItem';
import { useRuleAndProvider, useUpdateAllRuleProviderItems } from '~/components/rules/rules.hooks';
import { TextFilter } from '~/components/shared/TextFitler';
import { ruleFilterText } from '~/store/rules';
import { State } from '~/store/types';
import { ClashAPIConfig } from '~/types';

import useRemainingViewPortHeight from '../../hooks/useRemainingViewPortHeight';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getClashAPIConfig, getUnreloadConfig, getUtilsApiUrl } from '~/store/app';
import ContentHeader from '../sideBar/ContentHeader';
import Rule, { editRule, fixedRuleCount } from './Rule';
import s from './Rules.module.scss';
import { connect, useStoreActions } from '../StateProvider';
import { fetchProxies, getProxyGroupNames } from '~/store/proxies';
import ModalAddRule from '~/components/rules/ModalAddRule';
import { reloadConfigFile } from '~/store/configs';
import ModalAddRuleSet from '~/components/rules/ModalAddRuleSet';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Button from '~/components/shared/Button';
import { RotateIcon } from '~/components/shared/RotateIcon';
import { notifyError, notifySuccess, notifyWarning } from '~/misc/message';
import { Tooltip } from '@reach/tooltip';
import { FiRepeat, FiFilePlus, FiPlusCircle } from 'react-icons/fi';
import ModalReloadConfig from '~/components/sideBar/ModalReloadConfig';
import { useQuery } from 'react-query';
import { fetchVersion } from '~/api/version';


const { memo } = React;

const paddingBottom = 10;

type ItemData = {
  rules: any[];
  provider: any;
  apiConfig: ClashAPIConfig;
  groups: string[];
};

function itemKey(index: number, { rules, provider }: ItemData) {
  const providerQty = provider.names.length;

  if (index < providerQty) {
    return provider.names[index];
  }
  const item = rules[index - providerQty];
  return item.id;
}

function getItemSizeFactory() {
  return function getItemSize() {
    return 70;
  };
}

// ts-expect-error ts-migrate(2339) FIXME: Property 'index' does not exist on type '{ childre... Remove this comment to see the full error message
// const Row = memo(({ index, style, data }) => {
//   const { rules, provider, apiConfig, groups } = data;
//   const providerQty = provider.names.length;
//
//   if (index < providerQty) {
//     const name = provider.names[index];
//     const item = provider.byName[name];
//     return (
//       <div style={style} className={s.RuleProviderItemWrapper}>
//         <RuleProviderItem apiConfig={apiConfig} {...item} />
//       </div>
//     );
//   }
//
//   const r = rules[index - providerQty];
//   return (
//     <div style={style}>
//       < Rule {...r} groups={groups} />
//     </div>
//   );
// }, areEqual);

// 只有规则列表的行
const RuleRow = ({ index, style, data }) => {
  const { rules, groups, utilsApiUrl, unReloadConfig } = data;
  const r = rules[index];
  return (
    <div style={style}>
      < Rule sing_box={true} {...r} groups={groups} unReloadConfig={unReloadConfig} utilsApiUrl={utilsApiUrl} />
    </div>
  );
};

/*const DraggableRuleRow = ({ index, style, data }) => {
  const { rules, groups, unReloadConfig } = data;
  const r = rules[index];
  return (
    <Draggable draggableId={`rule-${index}`} index={index} key={index}>
      {(provided) => (
        <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}
             style={{ ...style, ...provided.draggableProps.style }}>
          < Rule {...r} groups={groups} unReloadConfig={unReloadConfig} />
        </div>
      )}
    </Draggable>
  );
};

// 只有规则提供者的行
const RuleProviderRow = ({ index, style, data }) => {
  const { provider, apiConfig, unReloadConfig } = data;
  const name = provider.names[index];
  const item = provider.byName[name];
  return (
    <div style={style} className={s.RuleProviderItemWrapper}>
      <RuleProviderItem apiConfig={apiConfig} {...item} unReloadConfig={unReloadConfig} />
    </div>
  );
};*/

const mapState = (s: State) => ({
  apiConfig: getClashAPIConfig(s),
  groups: getProxyGroupNames(s),
  utilsApiUrl: getUtilsApiUrl(s),
  unReloadConfig: getUnreloadConfig(s)
});

export default connect(mapState)(Rules);

function Rules({ dispatch, apiConfig, groups, utilsApiUrl, unReloadConfig }) {
  const [refRulesContainer, containerHeight] = useRemainingViewPortHeight();

  const { rules, provider } = useRuleAndProvider(apiConfig);
  const { updateAppConfig } = useStoreActions();

  const fetchProxiesHooked = useCallback(() => {
    dispatch(fetchProxies(apiConfig));
  }, [apiConfig, dispatch]);

  const { data: version } = useQuery(['/version', apiConfig], () =>
    fetchVersion('/version', apiConfig)
  );

  useEffect(() => {
    fetchProxiesHooked();
  }, [fetchProxiesHooked]);
  const getItemSize = getItemSizeFactory();
  const [addRuleModal, setAddRuleModal] = useState(false);
  const [addRuleSetModal, setAddRuleSetModal] = useState(false);
  const [reload_config, setReloadConfig] = useState(false);

  const { t } = useTranslation();

  const i = groups.indexOf('GLOBAL');
  if (i > -1) {
    groups.splice(i, 1);
  }
  const mapState = (s: State) => ({
    apiConfig: getClashAPIConfig(s),
    utilsApiUrl: getUtilsApiUrl(s),
    unReloadConfig: getUnreloadConfig(s),
    groups: groups,
    rules: rules,
    provider: provider
  });

  const AddRule = connect(mapState)(ModalAddRule);
  const AddRuleSet = connect(mapState)(ModalAddRuleSet);

  const handleReloadConfigFile = useCallback(() => {
    dispatch(reloadConfigFile(apiConfig));
  }, [apiConfig, dispatch]);

  const [update, isLoading] = useUpdateAllRuleProviderItems(apiConfig);

  const onDragEnd = (result: { destination: { index: number; }; source: { index: number; }; }) => {
    if (!result.destination || result.source.index === result.destination.index) {
      return;
    }

    if (result.source.index < fixedRuleCount || result.destination.index < fixedRuleCount) {
      notifyWarning('所选规则禁止拖动');
      return;
    }
    const [removed] = rules.splice(result.source.index, 1);
    const destinationRule = rules[result.destination.index];
    rules.splice(result.destination.index, 0, removed);

    const body = {
      option: 'exchange',
      index1: result.source.index,
      index2: result.destination.index
    };

    editRule(utilsApiUrl, JSON.stringify(body)).then((res) => {
      if (res.code === 200) {
        unReloadConfig?.push('拖动规则 : ' + removed.payload + ' => ' + destinationRule.payload);
        updateAppConfig('unReloadConfig', unReloadConfig);
        notifySuccess(res.message);
      } else {
        notifyError(res.message);
      }
    }).catch(() => {
      notifyError('网络错误');
    });
  };

  // noinspection RequiredAttributes
  return (
    <div>
      <div className={s.header}>
        <ContentHeader title={t('Rules')} />
        <TextFilter textAtom={ruleFilterText} placeholder={t('Search')} />
        <Tooltip label={t('reload_config_file')}>
          <Button className={s.firstButton} onClick={() => setReloadConfig(true)} kind="minimal">
            <FiRepeat size={20} />
          </Button>
        </Tooltip>

        <Tooltip label={t('add_rule')}>
          <Button onClick={() => setAddRuleModal(true)} kind="minimal">
            <FiPlusCircle size={20} />
          </Button>
        </Tooltip>

        <Tooltip label={t('add_rule_set')}>
          <Button onClick={() => setAddRuleSetModal(true)} kind="minimal">
            <FiFilePlus size={20} />
          </Button>
        </Tooltip>
      </div>

      <Tabs>
        <div>
          <TabList>
            <Tab>
              <span>{t('rule_list')}</span>
              <span className={s.qty}>{rules.length}</span>
            </Tab>
            <Tab>
              <span>{t('rule_provider')}</span>
              <span className={s.qty}>{provider.names.length}</span>
            </Tab>
          </TabList>
        </div>
        <div>
          <div>
            <TabPanel>
              <div ref={refRulesContainer} style={{ paddingBottom, userSelect: 'none' }}>
                {rules.length <= 100 && version.meta && !version.premium ?
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable-rules">
                      {(provided: any) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {rules.map((rule, index) => (
                            <Draggable draggableId={`rule-${index}`} index={index} key={index}>
                              {(provided: any) => (
                                <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}
                                     style={{ ...provided.draggableProps.style }}>
                                  < Rule {...rule} groups={groups} utilsApiUrl={utilsApiUrl} unReloadConfig={unReloadConfig} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  :
                  // 规则过多则使用VariableSizeList
                  <VariableSizeList
                    height={containerHeight - paddingBottom}
                    width="100%"
                    itemCount={rules.length}
                    itemSize={getItemSize}
                    itemData={{ rules, groups, utilsApiUrl, unReloadConfig }}
                  >
                    {RuleRow}
                  </VariableSizeList>
                }
              </div>
            </TabPanel>
            <TabPanel>
              <div ref={refRulesContainer} style={{ paddingBottom }}>
                {provider.names.map((name, index) => {
                  const item = provider.byName[name];
                  return (
                    <div key={index} className={s.RuleProviderItemWrapper}>
                      <RuleProviderItem apiConfig={apiConfig} utilsApiUrl={utilsApiUrl} {...item} unReloadConfig={unReloadConfig} />
                    </div>
                  );
                })}
                {/*{provider && provider.names && provider.names.length > 0 ? (*/}
                {/*  <div className={s.update}>*/}
                {/*    <Button onClick={update}>*/}
                {/*      <RotateIcon isRotating={isLoading} />*/}
                {/*    </Button>*/}
                {/*  </div>*/}
                {/*) : null}*/}
              </div>
            </TabPanel>
          </div>
        </div>
      </Tabs>

      <AddRuleSet
        isOpen={addRuleSetModal}
        onRequestClose={() => {
          setAddRuleSetModal(false);
        }}
      />

      <AddRule
        isOpen={addRuleModal}
        onRequestClose={() => {
          setAddRuleModal(false);
        }}
      />

      <ModalReloadConfig isOpen={reload_config} onRequestClose={() => setReloadConfig(false)} />
    </div>
  );
}
