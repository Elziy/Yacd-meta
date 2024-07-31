import { getClashAPIConfigs } from '~/store/app';

export function deleteRequest(url: string, body: any) {
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  });
}
