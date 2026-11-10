import { wikiFetch } from './client'

const FEED = 'https://api.wikimedia.org/feed/v1/wikipedia/en'

export interface PotdImage {
  title: string // File:...
  thumbnail?: { source: string }
  image?: { source: string }
  description?: { text: string }
}

interface FeaturedResponse {
  image?: PotdImage
  tfa?: { title: string; titles?: { normalized: string }; extract?: string; thumbnail?: { source: string } }
}

export interface FeaturedDay {
  date: Date
  image?: PotdImage
  tfaTitle?: string
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Picture of the day + featured article for a given date. */
export async function getFeatured(date: Date, signal?: AbortSignal): Promise<FeaturedDay> {
  const url = `${FEED}/featured/${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`
  const res = await wikiFetch<FeaturedResponse>(url, { signal })
  return {
    date,
    image: res.image,
    tfaTitle: res.tfa?.titles?.normalized ?? res.tfa?.title,
  }
}

export interface OnThisDayEvent {
  year: number
  text: string
  pages: { title: string; titles?: { normalized: string }; description?: string; thumbnail?: { source: string } }[]
}

interface OnThisDayResponse {
  events?: OnThisDayEvent[]
  births?: OnThisDayEvent[]
  deaths?: OnThisDayEvent[]
}

export type OnThisDayKind = 'events' | 'births' | 'deaths'

/** Historical events for a month/day — powers the Timeline's "today" strip. */
export async function getOnThisDay(kind: OnThisDayKind, month: number, day: number, signal?: AbortSignal) {
  const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/${kind}/${pad(month)}/${pad(day)}`
  const res = await wikiFetch<OnThisDayResponse>(url, { signal })
  return res[kind] ?? []
}
