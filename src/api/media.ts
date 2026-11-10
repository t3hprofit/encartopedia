import { EN_WIKI, titleToPath, wikiFetch } from './client'

export interface MediaItem {
  title: string // File:...
  type: 'image' | 'audio' | 'video'
  caption?: { text: string }
  showInGallery?: boolean
  srcset?: { src: string }[]
  leadImage?: boolean
}

interface MediaListResponse {
  items: {
    title: string
    type: string
    caption?: { text: string }
    showInGallery?: boolean
    srcset?: { src: string }[]
    leadImage?: boolean
  }[]
}

/** Everything non-text on a page: images, audio, video with captions. */
export async function getMediaList(title: string, signal?: AbortSignal): Promise<MediaItem[]> {
  const res = await wikiFetch<MediaListResponse>(
    `${EN_WIKI}/api/rest_v1/page/media-list/${titleToPath(title)}`,
    { signal },
  )
  return res.items.filter((i): i is MediaItem => ['image', 'audio', 'video'].includes(i.type))
}

export interface FileCredit {
  url?: string // direct file url
  descriptionUrl?: string // commons file page
  thumbUrl?: string
  artist?: string // may contain HTML
  credit?: string
  license?: string
  licenseUrl?: string
  attributionRequired: boolean
}

interface ImageInfoResponse {
  query?: {
    pages?: {
      imageinfo?: {
        url: string
        descriptionurl: string
        thumburl?: string
        extmetadata?: Record<string, { value: string }>
      }[]
    }[]
  }
}

const stripHtml = (s: string | undefined) => {
  if (!s) return undefined
  const div = document.createElement('div')
  div.innerHTML = s
  return div.textContent?.trim() || undefined
}

/** License + attribution for a File: title (any wiki file resolves via enwiki). */
export async function getFileCredit(fileTitle: string, thumbWidth = 500, signal?: AbortSignal): Promise<FileCredit> {
  const q = new URLSearchParams({
    action: 'query',
    titles: fileTitle,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: String(thumbWidth),
    format: 'json',
    formatversion: '2',
    origin: '*',
  })
  const res = await wikiFetch<ImageInfoResponse>(`${EN_WIKI}/w/api.php?${q}`, { signal })
  const ii = res.query?.pages?.[0]?.imageinfo?.[0]
  const em = ii?.extmetadata ?? {}
  return {
    url: ii?.url,
    descriptionUrl: ii?.descriptionurl,
    thumbUrl: ii?.thumburl,
    artist: stripHtml(em.Artist?.value),
    credit: stripHtml(em.Credit?.value),
    license: em.LicenseShortName?.value,
    licenseUrl: em.LicenseUrl?.value,
    attributionRequired: em.AttributionRequired?.value !== 'false',
  }
}

/** Direct upload.wikimedia.org ogg/wav → browser-safe MP3 transcode URL. */
export function transcodedMp3Url(fileUrl: string): string | null {
  const m = /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/\w+)\/(.+\/)?([^/]+\.(ogg|oga|wav|flac))$/i.exec(fileUrl)
  if (!m) return null
  return `${m[1]}/transcoded/${m[2] ?? ''}${m[3]}/${m[3]}.mp3`
}

interface ClaimsResponse {
  claims?: Record<string, { mainsnak?: { datavalue?: { value?: unknown } }; qualifiers?: Record<string, { datavalue?: { value?: unknown } }[]> }[]>
}

async function getClaim(entity: string, property: string, signal?: AbortSignal): Promise<ClaimsResponse['claims']> {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${entity}&property=${property}&format=json&origin=*`
  const res = await wikiFetch<ClaimsResponse>(url, { signal })
  return res.claims
}

/** Pronunciation audio (P443) filenames for a Wikidata item, English first. */
export async function getPronunciationFiles(entity: string, signal?: AbortSignal): Promise<string[]> {
  const claims = (await getClaim(entity, 'P443', signal))?.P443 ?? []
  const named = claims
    .flatMap((c) => {
      const file = c.mainsnak?.datavalue?.value as string | undefined
      const lang = (c.qualifiers?.P407?.[0]?.datavalue?.value as { id?: string } | undefined)?.id
      return file ? [{ file, lang }] : []
    })
  // Q1860 = English
  named.sort((a, b) => Number(b.lang === 'Q1860') - Number(a.lang === 'Q1860'))
  return named.map((c) => `File:${c.file}`)
}

/** National anthem audio: item P85 → anthem item → P51 audio file. */
export async function getAnthemFile(entity: string, signal?: AbortSignal): Promise<string | null> {
  const p85 = (await getClaim(entity, 'P85', signal))?.P85 ?? []
  const anthemId = (p85[0]?.mainsnak?.datavalue?.value as { id?: string } | undefined)?.id
  if (!anthemId) return null
  const p51 = (await getClaim(anthemId, 'P51', signal))?.P51 ?? []
  const file = p51[0]?.mainsnak?.datavalue?.value as string | undefined
  return file ? `File:${file}` : null
}
