export async function getJson<T>(url: string, authToken?: string): Promise<T> {
  return await request(url, {
    method: 'GET',
    headers: (authToken ? {
      Authorization: `Bearer ${authToken}`,
    } : {}),
  });
}

export async function postJson<T>(url: string, payload: unknown, authToken?: string): Promise<T> {
  return await request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && {Authorization: `Bearer ${authToken}`}),
    },
    body: JSON.stringify(payload),
  })
}

export async function patchJson<T>(url: string, payload: unknown, authToken?: string): Promise<T> {
  return await request(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && {Authorization: `Bearer ${authToken}`}),
    },
    body: JSON.stringify(payload),
  })
}

interface RequestProps {
  method: 'GET' | 'POST' | 'PATCH';
  headers?: Record<string, string>,
  body?: string;
}

async function request<T>(url: string, props: RequestProps): Promise<T> {
  const response = await fetch(url, props);
  if (!response.ok) {
    if (response.status === 400) {
      const e: any = await response.json()
      if ('detail' in e && typeof e.detail === 'string')
        throw new Error(e.detail)
      throw new Error('Unexpected API Error')
    }
    throw new Error('Internal Server Error')
  }

  return await response.json() as T
}
