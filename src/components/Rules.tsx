import './Connections.css';

import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { areEqual, VariableSizeList } from 'react-window';

import { RuleProviderItem } from '~/components/rules/RuleProviderItem';
import { useRuleAndProvider, useUpdateAllRuleProviderItems } from '~/components/rules/rules.hooks';
import { TextFilter } from '~/components/shared/TextFitler';
import { ruleFilterText } from '~/store/rules';
import { State } from '~/store/types';
import { ClashAPIConfig } from '~/types';

import useRemainingViewPortHeight from '../hooks/useRemainingViewPortHeight';
import { FcAddDatabase, FcDataBackup, FcDataRecovery } from 'react-icons/fc';
import { getClashAPIConfig } from '~/store/app';
import ContentHeader from './ContentHeader';
import Rule from './Rule';
import s from './Rules.module.scss';
import { connect } from './StateProvider';
import { fetchProxies, getProxyGroupNames } from '~/store/proxies';
import ModalAddRule from '~/components/ModalAddRule';
import ModalCloseAllConnections from '~/components/ModalCloseAllConnections';
import { reloadConfigFile } from '~/store/configs';
import ModalAddRuleSet from '~/components/ModalAddRuleSet';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Button from '~/components/Button';
import { RotateIcon } from '~/components/shared/RotateIcon';


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
    return 70
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

// 只有规则提供者的行
const RuleProviderRow = ({ index, style, data }) => {
  const { rules, provider, apiConfig, groups } = data;
  const name = provider.names[index];
  const item = provider.byName[name];
  return (
    <div style={style} className={s.RuleProviderItemWrapper}>
      <RuleProviderItem apiConfig={apiConfig} {...item} />
    </div>
  );
};

const mapState = (s: State) => ({
  apiConfig: getClashAPIConfig(s),
  groups: getProxyGroupNames(s)
});

export default connect(mapState)(Rules);

type RulesProps = {
  apiConfig: ClashAPIConfig;
};

let tag = 0;

function Rules({ dispatch, apiConfig, groups }) {
  const [refRulesContainer, containerHeight] = useRemainingViewPortHeight();

  const { rules, provider } = useRuleAndProvider(apiConfig);
  if (tag === 0) {
    dispatch(fetchProxies(apiConfig));
    tag = 1;
  }
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

  return (
    <div>
      <div className={s.header}>
        <ContentHeader title={t('Rules')} />
        <TextFilter textAtom={ruleFilterText} placeholder={t('Search')} />
        <button onClick={() => setReloadConfig(true)} className={s.addRuleButton}>
          <FcDataBackup size={32} />
        </button>
        <button onClick={() => setAddRuleSetModal(true)} className={s.addRuleButton}>
          <FcDataRecovery size={32} />
        </button>
        <button onClick={() => setAddRuleModal(true)} className={s.addRuleButton}>
          <FcAddDatabase size={32} />
        </button>
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
              <div ref={refRulesContainer} style={{ paddingBottom }}>
                <VariableSizeList
                  height={containerHeight - paddingBottom}
                  width="100%"
                  itemCount={rules.length}
                  itemSize={getItemSize}
                  itemData={{ rules, provider, apiConfig, groups }}
                  itemKey={itemKey}
                >
                  {RuleRow}
                </VariableSizeList>
              </div>
            </TabPanel>
            <TabPanel>
              <div ref={refRulesContainer} style={{ paddingBottom }}>
                <VariableSizeList
                  height={containerHeight - paddingBottom - 66}
                  width="100%"
                  itemCount={provider.names.length}
                  itemSize={getItemSize}
                  itemData={{ rules, provider, apiConfig, groups }}
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

      <ModalCloseAllConnections
        confirm={'reload_config_file'}
        isOpen={reload_config}
        primaryButtonOnTap={() => {
          handleReloadConfigFile();
          setReloadConfig(false);
        }}
        onRequestClose={() => setReloadConfig(false)}
      />
    </div>
  );
}
