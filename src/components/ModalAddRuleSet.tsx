import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseModal from '~/components/shared/BaseModal';

import Button from './Button';
import Input from './Input';
import s from './ModalAddRule.module.scss';
import Select from '~/components/shared/Select';
import Switch from './SwitchThemed';
import { reloadConfigFile } from '~/store/configs';
import { notifyError, notifySuccess, notifyWarning } from '~/misc/message';

export default function ModalAddRuleSet({ dispatch, apiConfig, isOpen, onRequestClose, groups, rules, provider }) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [index, setIndex] = useState(5);
  const [policy, setPolicy] = useState(groups[0] || '');
  const [noResolve, setNoResolve] = useState(false);
  const [relaodConfig, setRelaodConfig] = useState(false);

  const [ruleSet, setRuleSet] = useState({
    name: '',
    type: 'http',
    behavior: 'classical',
    format: 'yaml',
    path: 'rule_provider',
    url: '',
    interval: null
  });

  const [msg, setMsg] = useState('');

  const handleReloadConfigFile = useCallback(() => {
    dispatch(reloadConfigFile(apiConfig));
  }, [apiConfig, dispatch]);


  const addRuleSet = async (body: BodyInit) => {
    const res = await fetch('/api/add_rule_set', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    });
    return await res.json();
  };

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
    if (!ruleSet.name || !index || !policy) {
      notifyWarning('请填写完整');
      setMsg('');
      return;
    }
    if (index < 3) {
      notifyWarning('索引不能小于3');
      setMsg('');
      return;
    }
    if (rules.find((rule: any) => rule.payload === ruleSet.name)) {
      notifyWarning('规则已存在');
      setMsg('');
      return;
    }
    let rule = 'RULE-SET,' + ruleSet.name.trim() + ',' + policy;
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
    const ruleBody = {
      rule,
      index
    };
    setSubmitting(true);
    const ruleSetBody = {
      name: ruleSet.name,
      type: ruleSet.type,
      behavior: ruleSet.behavior,
      format: ruleSet.format,
      path: './' + ruleSet.path + '/' + ruleSet.name + '.' + ruleSet.format,
      url: ruleSet.url,
      interval: ruleSet.interval
    };
    if (ruleSet.type === 'file') {
      delete ruleSetBody.url;
    }
    addRuleSet(JSON.stringify(ruleSetBody)).then((response) => {
      if (response.code === 200) {
        notifySuccess(response.message);
        addRule(JSON.stringify(ruleBody)).then((res) => {
          if (res.code === 200) {
            if (relaodConfig) {
              handleReloadConfigFile();
            }
            setSubmitting(false);
            onRequestClose();
          } else {
            notifyError(res.message);
            setSubmitting(false);
          }
        }).catch(() => {
          setMsg('');
          notifyError('网络异常');
          setSubmitting(false);
        });
      } else {
        setMsg('');
        notifyError(response.message);
        setSubmitting(false);
      }
    }).catch(() => {
      setMsg('');
      notifyError('网络异常');
      setSubmitting(false);
    });

  };

  const policies = groups.map((group: any) => [group, group]);
  policies.push(['DIRECT', '直连']);
  policies.push(['REJECT', '拒绝']);

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div style={{ textAlign: 'center', fontSize: '1.2em', paddingBottom: '1em' }}>
        <span>添加规则集合</span>
      </div>

      <div className={s.row}>
        集合来源:
        <Select
          options={[['http', 'http'], ['file', 'file']]}
          selected={ruleSet.type}
          onChange={(e) => setRuleSet({ ...ruleSet, type: e.target.value })
          }></Select>
      </div>
      <div className={s.row}>
        集合路径:
        <Input
          type="text"
          name="rule_set_url"
          autoComplete="off"
          value={ruleSet.url}
          onChange={(e) => {
            if (!e.target.value) {
              setMsg('');
              setRuleSet({ ...ruleSet, url: '' });
              return;
            }
            if (ruleSet.type === 'http') {
              const reg = /^http(s)?:\/\/.+/;
              if (!reg.test(e.target.value)) {
                notifyWarning('请输入正确的链接');
                setMsg('');
                return;
              }
            }
            setMsg('');
            const url = e.target.value;
            const index = url.lastIndexOf('/');
            const filename = url.substring(index + 1);
            const index2 = filename.lastIndexOf('.');
            const name = filename.substring(0, index2).toUpperCase();
            const format = filename.substring(index2 + 1);
            setRuleSet({ ...ruleSet, url, name, format });
          }} />
      </div>

      <div className={s.row}>
        规则名称:
        <Input
          type="text"
          name="rule_value"
          autoComplete="off"
          value={ruleSet.name}
          onChange={(e) => setRuleSet({ ...ruleSet, name: e.target.value })
          } />
      </div>

      <div className={s.row}>
        集合类型:
        <Select
          options={[['domain', 'domain'], ['ipcidr', 'ipcidr'], ['classical', 'classical']]}
          selected={ruleSet.behavior}
          onChange={(e) => setRuleSet({ ...ruleSet, behavior: e.target.value })
          }></Select>
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
        规则策略:
        <Select
          options={policies}
          selected={policy}
          onChange={(e) => setPolicy(e.target.value)
          }></Select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1em' }}>
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
