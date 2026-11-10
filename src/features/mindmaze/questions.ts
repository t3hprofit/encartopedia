// MindMaze questions, generated live from the encyclopedia itself.
// Pools come from CirrusSearch ranked by incoming links (notability),
// with difficulty reaching deeper into the ranking for obscurer fare.

import { actionApiUrl, wikiFetch } from '../../api/client'
import { AREA_TOPICS } from '../../api/pinpointer'
import { AREAS } from '../../theme/areas'

export interface PoolEntry {
  title: string
  description: string
}

export interface Question {
  prompt: string
  choices: { title: string; isCorrect: boolean }[]
  /** scoring: base points at difficulty, decaying over 60 s */
  base: number
}

interface SearchResponse {
  query?: { pages?: { pageid: number; ns: number; title: string; description?: string; index?: number }[] }
}

const POOL_CACHE_PREFIX = 'encartopedia.mindmaze.pool.'
const POOL_TTL = 7 * 24 * 3600 * 1000

/** ~tiered pool of (title, description) for a category. Difficulty 1-4. */
export async function fetchPool(categoryId: string | 'all', difficulty: number, signal?: AbortSignal): Promise<PoolEntry[]> {
  const cacheKey = `${POOL_CACHE_PREFIX}${categoryId}.${difficulty}`
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) ?? 'null') as { at: number; data: PoolEntry[] } | null
    if (cached && Date.now() - cached.at < POOL_TTL && cached.data.length >= 20) return cached.data
  } catch {
    /* refetch */
  }

  const topics =
    categoryId === 'all'
      ? AREAS.map((a) => AREA_TOPICS[a.id]).join('|')
      : (AREA_TOPICS[categoryId] ?? AREA_TOPICS.history)
  const url = actionApiUrl({
    action: 'query',
    generator: 'search',
    gsrsearch: `articletopic:${topics}`,
    gsrsort: 'incoming_links_desc',
    gsrlimit: 100,
    gsroffset: (difficulty - 1) * 150,
    gsrnamespace: 0,
    prop: 'description',
  })
  const res = await wikiFetch<SearchResponse>(url, { signal })
  const pool = (res.query?.pages ?? [])
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .filter((p) => p.ns === 0 && p.description && p.description.length > 12)
    // drop list/disambiguation-ish pages — they make mushy questions
    .filter((p) => !/^List of|^Outline of|disambiguation/i.test(p.title) && !/disambiguation/i.test(p.description!))
    .map((p) => ({ title: p.title, description: p.description! }))
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), data: pool }))
  } catch {
    /* storage full */
  }
  return pool
}

const BASE_POINTS = [0, 250, 500, 750, 1000] // index by difficulty 1-4

function shuffled<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Build one 4-choice question from a pool. Two prompt shapes keep it fresh. */
export function buildQuestion(pool: PoolEntry[], difficulty: number, rand: () => number): Question | null {
  if (pool.length < 4) return null
  const picks = shuffled(pool, rand).slice(0, 4)
  const target = picks[Math.floor(rand() * picks.length)]
  const reversed = rand() < 0.35
  const prompt = reversed
    ? `In the encyclopedia, "${target.title}" is described as…`
    : `Which of these is ${articleize(target.description)}?`
  const choices = picks.map((p) => ({
    title: reversed ? capitalize(p.description) : p.title,
    isCorrect: p.title === target.title,
  }))
  return { prompt, choices, base: BASE_POINTS[difficulty] ?? 500 }
}

/** The article each choice points at, for the famous research-the-answers flow. */
export function choiceArticle(q: Question, pool: PoolEntry[], idx: number): string | null {
  const c = q.choices[idx]
  const byTitle = pool.find((p) => p.title === c.title)
  if (byTitle) return byTitle.title
  const byDesc = pool.find((p) => capitalize(p.description) === c.title)
  return byDesc?.title ?? null
}

const articleize = (d: string) => {
  const lower = d.charAt(0).toLowerCase() + d.slice(1)
  return /^(a |an |the )/i.test(lower) ? lower : /^[aeiou]/i.test(lower) ? `an ${lower}` : `a ${lower}`
}
const capitalize = (d: string) => d.charAt(0).toUpperCase() + d.slice(1)

/** Timed score: full points instantly, nothing after 60 seconds. */
export function scoreFor(base: number, elapsedMs: number, attempt: number): number {
  const t = Math.max(0, 1 - elapsedMs / 60000)
  const attemptFactor = attempt === 1 ? 1 : 0.5
  return Math.round((base * t * attemptFactor) / 10) * 10
}
