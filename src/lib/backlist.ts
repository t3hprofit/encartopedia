// Back List — Encarta's visited-articles history (Tools menu).

const KEY = 'encartopedia.backlist'
const MAX = 100

export interface Visit {
  title: string
  at: number
}

export function readBackList(): Visit[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Visit[]
  } catch {
    return []
  }
}

export function recordVisit(title: string) {
  const list = readBackList().filter((v) => v.title !== title)
  list.unshift({ title, at: Date.now() })
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
}
