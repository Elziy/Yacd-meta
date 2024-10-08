import React, { useEffect, useState } from 'react';

import s0 from './Rule.module.scss';
import Button from '~/components/shared/Button';
import { HiX } from 'react-icons/hi';
import ModalCloseAllConnections from '~/components/connections/ModalCloseAllConnections';
import Select from '~/components/shared/Select';
import { notifyError, notifySuccess, notifyWarning } from '~/misc/message';
import s from '~/components/rules/Rules.module.scss';
import ShowCodeModal from '~/components/rules/ShowCodeModal';
import { useStoreActions } from '~/components/StateProvider';

const colorMap = {
  _default: '#185a9d',
  DIRECT: '#478303',
  REJECT: '#cb3131',
};

function getStyleFor({ proxy }) {
  let color = colorMap._default;
  if (colorMap[proxy]) {
    color = colorMap[proxy];
  }
  return { color, paddingLeft: '1em' };
}

const deleteRule = async (url: string, body: BodyInit) => {
  const res = await fetch(url + '/delete_rule', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });
  return await res.json();
};

export const editRule = async (url: string, body: BodyInit) => {
  const res = await fetch(url + '/edit_rule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });
  return await res.json();
};

type Props = {
  id?: number;
  type?: string;
  payload?: string;
  proxy?: string;
  size?: number;
  groups: string[];
  utilsApiUrl: string;
  unReloadConfig?: string[];
  sing_box?: boolean;
};

function Rule({
  type,
  payload,
  proxy,
  id,
  size,
  groups,
  utilsApiUrl,
  unReloadConfig,
  sing_box,
}: Props) {
  const styleProxy = getStyleFor({ proxy });
  const { updateAppConfig } = useStoreActions();

  const [data, setData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [delete_modal, setDeleteModal] = useState(false);
  const [edit_modal, setEditModal] = useState(false);
  const [policy, setPolicy] = useState(proxy);
  useEffect(() => {
    setPolicy(proxy);
  }, [proxy]);

  const policies = groups.map((group: any) => [group, group]);
  policies.unshift(['DIRECT', '直连']);
  policies.unshift(['REJECT', '拒绝']);

  const disable =
    id < fixedRuleCount || type === 'AND' || type === 'OR' || type === 'NOT' || type === 'SubRules';
  if (type === 'SubRules') {
    policies.push([policy, policy]);
  }

  const delete_rule = (id: number) => {
    const body = {
      index: id,
    };
    deleteRule(utilsApiUrl, JSON.stringify(body))
      .then((res) => {
        if (res.code === 200) {
          notifySuccess(res.message);
          unReloadConfig?.push('删除规则 : ' + type + ', ' + payload);
          updateAppConfig('unReloadConfig', unReloadConfig);
          setDeleteModal(false);
        } else {
          notifyError(res.message);
        }
      })
      .catch(() => {
        notifyError('网络错误');
      });
  };

  const edit_rule = (id: number) => {
    const body = {
      option: 'change_policy',
      policy: policy,
      index: id,
    };
    editRule(utilsApiUrl, JSON.stringify(body))
      .then((res) => {
        if (res.code === 200) {
          notifySuccess(res.message);
          unReloadConfig?.push('修改规则 : ' + type + ', ' + payload);
          updateAppConfig('unReloadConfig', unReloadConfig);
          setEditModal(false);
        } else {
          setPolicy(proxy);
          notifyError(res.message);
        }
      })
      .catch(() => {
        setPolicy(proxy);
        notifyError('网络错误');
      });
  };

  function get_rule(url: string) {
    if (sing_box) {
      return;
    }
    const t = type.toLowerCase();
    if (t !== 'geosite' && t !== 'geoip') {
      notifyError('不支持的类型');
      return;
    }
    if (size > 20000) {
      notifyWarning('规则过大, 别看啦！');
      return;
    }
    setIsModalOpen(true);
    fetch(url + '/get_rule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: t,
        tag: payload,
      }),
    })
      .then(async (res) => {
        const response = await res.json();
        if (response.code === 200) {
          setData(response.data);
        } else {
          setIsModalOpen(false);
          notifyError(response.message);
        }
      })
      .catch(() => {
        setIsModalOpen(false);
        notifyError('网络错误');
      });
  }

  return (
    <div className={s0.rule}>
      <div className={s0.left}>{id}</div>
      <div>
        <div className={s0.payloadAndSize}>
          <div className={s0.payload}>
            <span style={{ lineHeight: '20px' }}>{payload}</span>
          </div>
          {(type === 'GeoSite' || type === 'GeoIP') && (
            <div style={{ margin: '0 0 0 0.4em' }} className={s0.size}>
              <span onClick={() => get_rule(utilsApiUrl)} className={s.qty}>
                {size}
              </span>
            </div>
          )}
        </div>
        <div className={s0.a}>
          <div className={s0.type}>{type}</div>
          {/*<div style={styleProxy}>{proxy}</div>*/}
          {!sing_box ? (
            <span>
              <Select
                disabled={disable}
                style={{ backgroundColor: styleProxy.color, height: '1.8em', color: '#E7E7E7' }}
                options={policies}
                selected={policy}
                onChange={(e) => {
                  setPolicy(e.target.value);
                  setEditModal(true);
                }}
              ></Select>
            </span>
          ) : (
            <div>
              <div
                style={{ backgroundColor: styleProxy.color, height: '1.8em', color: '#E7E7E7' }}
                className={s0.rulePolicy}
              >
                <span>{policy}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {id >= fixedRuleCount && !sing_box && (
        <div className={s0.right}>
          <span style={{ paddingLeft: '0.5em' }} className={s0.buttonWrapper}>
            <Button
              className={s0.button}
              onClick={() => {
                setDeleteModal(true);
              }}
            >
              <HiX size={18}></HiX>
            </Button>
          </span>
        </div>
      )}

      <ModalCloseAllConnections
        confirm={'edit_rule'}
        isOpen={edit_modal}
        primaryButtonOnTap={() => edit_rule(id)}
        onRequestClose={() => {
          setPolicy(proxy);
          setEditModal(false);
        }}
      />

      <ModalCloseAllConnections
        confirm={'delete_rule'}
        isOpen={delete_modal}
        primaryButtonOnTap={() => delete_rule(id)}
        onRequestClose={() => setDeleteModal(false)}
      />

      <ShowCodeModal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setData(null);
        }}
        data={data}
      />
    </div>
  );
}

export default Rule;

export const fixedRuleCount = 0;
