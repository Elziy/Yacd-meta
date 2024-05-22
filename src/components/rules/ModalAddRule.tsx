import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseModal from '~/components/shared/BaseModal';

import Button from '../shared/Button';
import Input from '../shared/Input';
import s from './ModalAddRule.module.scss';
import Select from '~/components/shared/Select';
import Switch from '../shared/SwitchThemed';
import { reloadConfigFile } from '~/store/configs';
import { notifyError, notifySuccess, notifyWarning } from '~/misc/message';
import { fixRuleCount } from '~/components/rules/Rule';

const ruleTypes = [
  ['DOMAIN', '域名'],
  ['DOMAIN-SUFFIX', '域名前缀'],
  ['DOMAIN-KEYWORD', '域名关键词'],
  ['DOMAIN-REGEX', '域名正则'],
  ['RULE-SET', '规则集合'],
  ['GEOSITE', 'GEOSITE'],
  ['GEOIP', 'GEOIP'],
  ['IP-CIDR', 'IP-CIDR'],
  ['IP-ASN', 'IP-ASN']
];


export default function ModalAddRule({ dispatch, apiConfig, isOpen, onRequestClose, groups, rules, provider }) {
  const { t } = useTranslation();

  const [submitting, setSubmitting] = useState(false);
  const [index, setIndex] = useState(5);
  const [type, setType] = useState('DOMAIN');
  const [name, setName] = useState('');
  const [policy, setPolicy] = useState(groups[0] || '');
  const [noResolve, setNoResolve] = useState(false);
  const [relaodConfig, setRelaodConfig] = useState(false);

  const [msg, setMsg] = useState('');

  const policies = groups.map((group: any) => [group, group]);
  policies.push(['DIRECT', '直连']);
  policies.push(['REJECT', '拒绝']);

  const handleReloadConfigFile = useCallback(() => {
    dispatch(reloadConfigFile(apiConfig));
  }, [apiConfig, dispatch]);

  const rule_sets = provider.names.map((name: any) => [name, name]);
  const addRule = async (body: BodyInit) => {
    const res = await fetch('/api/add_rule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    });
    return await res.json();
  };

  const check = () => {
    if (!name || !index || !policy) {
      notifyWarning('请填写完整');
      setMsg('');
      return;
    }
    if (index < fixRuleCount) {
      notifyWarning('索引不能小于' + fixRuleCount);
      setMsg('');
      return;
    }
    if (rules.find((rule: any) => rule.payload === name)) {
      notifyWarning('规则已存在');
      setMsg('');
      return;
    }
    let rule = type + ',' + name.trim() + ',' + policy;
    if (noResolve) {
      rule += ',no-resolve';
    }
    return rule;
  };
  const onLook = () => {
    const rule = check();
    if (!rule) {
      return;
    }
    setMsg(rule);
  };
  const onSubmit = () => {
    const rule = check();
    const body = {
      rule,
      index
    };
    setSubmitting(true);
    addRule(JSON.stringify(body)).then((res) => {
      if (res.code === 200) {
        if (relaodConfig) {
          handleReloadConfigFile();
        }
        setSubmitting(false);
        onRequestClose();
        notifySuccess(res.message);
      } else {
        setMsg('');
        notifyError(res.message);
        setSubmitting(false);
      }
    }).catch(() => {
      setMsg('');
      notifyError('网络异常');
      setSubmitting(false);
    });
  };

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div style={{ textAlign: 'center', fontSize: '1.2em', paddingBottom: '1em' }}>
        <span>{t('add_rule')}</span>
      </div>
      <div className={s.row}>
        规则索引:
        <Input
          type="number"
          name="rule_index"
          value={index}
          onChange={(e) => setIndex(e.target.value ? Number(e.target.value) : null)}
        />
      </div>
      <div className={s.row}>
        规则类型:
        <Select
          options={ruleTypes}
          selected={type}
          onChange={(e) => setType(e.target.value)}></Select>
      </div>
      {type === 'RULE-SET' ? (
        <div className={s.row}>
          规则集合:
          <Select
            options={rule_sets}
            selected={name}
            onChange={(e) => setName(e.target.value)}></Select>
        </div>
      ) : <div className={s.row}>
        规则名称:
        <Input
          type="text"
          name="rule_value"
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      }

      <div className={s.row}>
        规则策略:
        <Select
          options={policies}
          selected={policy}
          onChange={(e) => setPolicy(e.target.value)
          }></Select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5em' }}>
        <div className={s.row2}>
          禁用解析:
          <Switch
            name="use-no-resolve"
            checked={noResolve}
            onChange={(value: boolean) => setNoResolve(value)}
          />
        </div>
        <div className={s.row2}>
          重载配置:
          <Switch
            name="relaodConfig"
            checked={relaodConfig}
            onChange={(value: boolean) => setRelaodConfig(value)}
          />
        </div>
      </div>

      <div style={{ paddingTop: '1em' }}>
        <div style={{ textAlign: 'center', color: 'green' }}>
          <span>{msg}</span>
        </div>
      </div>

      <div className={s.submit}>
        <Button className={s.submit_button} onClick={onLook}>预览</Button>
        <Button disabled={msg === '' || submitting} className={s.submit_button} onClick={onSubmit}>提交</Button>
      </div>
    </BaseModal>
  );
}
