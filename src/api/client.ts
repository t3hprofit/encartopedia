// Shared Wikimedia fetch wrapper.
// Policy: identify the app via Api-User-Agent, honor Retry-After on 429/503,
// and keep interactive requests serial-ish (browser tier: 200 req/min).

const APP_AGENT = 'Encartopedia95/1.0 (https://github.com/encartopedia95; woodardj85@gmail.com)'

export class WikiHttpError extends Error {
  constructor(
    public status: number,
    public url: string,
  ) {
    super(`HTTP ${status} for ${url}`)
  }
}

export async function wikiFetch<T>(url: string, init?: RequestInit, retries = 2): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Api-User-Agent': APP_AGENT, ...init?.headers },
  })
  if (res.status === 429 || res.status === 503) {
    if (retries > 0) {
      const after = Number(res.headers.get('Retry-After') ?? 2)
      await new Promise((r) => setTimeout(r, Math.min(after, 10) * 1000))
      return wikiFetch<T>(url, init, retries - 1)
    }
  }
  if (!res.ok) throw new WikiHttpError(res.status, url)
  return (await res.json()) as T
}

export const EN_WIKI = 'https://en.wikipedia.org'

/** Action API URL builder — always format=json&formatversion=2&origin=* */
export function actionApiUrl(params: Record<string, string | number>): string {
  const q = new URLSearchParams({
    format: 'json',
    formatversion: '2',
    origin: '*',
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  })
  return `${EN_WIKI}/w/api.php?${q}`
}

/** Normalize an article title for REST path segments. */
export const titleToPath = (title: string) => encodeURIComponent(title.replace(/ /g, '_'))

export const pathToTitle = (path: string) => decodeURIComponent(path).replace(/_/g, ' ')
