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
import { getClashAPIConfig, getUnreloadConfig } from '~/store/app';
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

function getItemSizeFactory({ provider }) {
  return function getItemSize(idx: number) {
    // const providerQty = provider.names.length;
    // if (idx < providerQty) {
    //   // provider
    //   return 66;
    // }
    // // rule
    // return 70;
    return 70;
  };
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'index' does not exist on type '{ childre... Remove this comment to see the full error message
const Row = memo(({ index, style, data }) => {
  const { rules, provider, apiConfig, groups } = data;
  const providerQty = provider.names.length;

  if (index < providerQty) {
    const name = provider.names[index];
    const item = provider.byName[name];
    return (
      <div style={style} className={s.RuleProviderItemWrapper}>
        <RuleProviderItem apiConfig={apiConfig} {...item} />
      </div>
    );
  }

  const r = rules[index - providerQty];
  return (
    <div style={style}>
      < Rule {...r} groups={groups} />
    </div>
  );
}, areEqual);

// 只有规则列表的行
const RuleRow = ({ index, style, data }) => {
  const { rules, provider, groups } = data;
  const providerQty = provider.names.length;
  index += providerQty;
  const r = rules[index - providerQty];
  return (
    <div style={style}>
      < Rule {...r} groups={groups} />
    </div>
  );
};

const DraggableRuleRow = ({ index, style, data }) => {
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
};

const mapState = (s: State) => ({
  apiConfig: getClashAPIConfig(s),
  groups: getProxyGroupNames(s),
  unReloadConfig: getUnreloadConfig(s)
});

export default connect(mapState)(Rules);

function Rules({ dispatch, apiConfig, groups, unReloadConfig }) {
  const [refRulesContainer, containerHeight] = useRemainingViewPortHeight();

  const { rules, provider } = useRuleAndProvider(apiConfig);
  const { updateAppConfig } = useStoreActions();

  const fetchProxiesHooked = useCallback(() => {
    dispatch(fetchProxies(apiConfig));
  }, [apiConfig, dispatch]);

  useEffect(() => {
    fetchProxiesHooked();
  }, [fetchProxiesHooked]);
  const getItemSize = getItemSizeFactory({ provider });
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

    editRule(JSON.stringify(body)).then((res) => {
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
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="droppable-rules" mode="virtual" renderClone={(provided, snapshot, rubric) => {
                    return (
                      <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                        < Rule {...rules[rubric.source.index]} groups={groups} />
                      </div>
                    );
                  }}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        <VariableSizeList
                          height={containerHeight - paddingBottom}
                          width="100%"
                          itemCount={rules.length}
                          itemSize={getItemSize}
                          outerRef={provided.innerRef}
                          itemData={{ rules, groups, unReloadConfig }}
                        >
                          {DraggableRuleRow}
                        </VariableSizeList>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </TabPanel>
            <TabPanel>
              <div ref={refRulesContainer} style={{ paddingBottom }}>
                <VariableSizeList
                  height={containerHeight - paddingBottom - 66}
                  width="100%"
                  itemCount={provider.names.length}
                  itemSize={getItemSize}
                  itemData={{ provider, apiConfig, unReloadConfig }}
                  itemKey={itemKey}
                >
                  {RuleProviderRow}
                </VariableSizeList>
                {provider && provider.names && provider.names.length > 0 ? (
                  <div className={s.update}>
                    <Button onClick={update}>
                      <RotateIcon isRotating={isLoading} />
                    </Button>
                  </div>
                ) : null}
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
