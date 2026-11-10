import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Dialog } from '../../ui/Dialog'
import { wikiFetch, titleToPath, pathToTitle, actionApiUrl } from '../../api/client'
import { randomArticleTitle } from '../../api/browse'
import { readBackList } from '../../lib/backlist'
import './tools.css'

type Tool = 'Browse Panel' | 'Dictionary Thesaurus' | 'Notemark' | 'Back List' | 'Word Processor'

export function ToolsHost() {
  const [open, setOpen] = useState<Tool | null>(null)
  const [browseDock, setBrowseDock] = useState(false)

  useEffect(() => {
    const onTool = (e: Event) => {
      const t = (e as CustomEvent<string>).detail as Tool
      e.preventDefault() // tell the Shell it's handled
      if (t === 'Browse Panel') setBrowseDock((d) => !d)
      else setOpen(t)
    }
    window.addEventListener('e-tool', onTool)
    return () => window.removeEventListener('e-tool', onTool)
  }, [])

  return (
    <>
      {browseDock && <BrowsePanel onClose={() => setBrowseDock(false)} />}
      {open === 'Dictionary Thesaurus' && <DictionaryTool onClose={() => setOpen(null)} />}
      {open === 'Notemark' && <NotemarkTool onClose={() => setOpen(null)} />}
      {open === 'Back List' && <BackListTool onClose={() => setOpen(null)} />}
      {open === 'Word Processor' && <WordProcessorTool onClose={() => setOpen(null)} />}
    </>
  )
}

/* ---------- Dictionary Thesaurus (Wiktionary definitions) ---------- */

interface Definition {
  partOfSpeech: string
  definitions: { definition: string }[]
}

function DictionaryTool({ onClose }: { onClose: () => void }) {
  const [word, setWord] = useState('')
  const [defs, setDefs] = useState<Definition[] | null>(null)
  const [status, setStatus] = useState('Type a word and press Enter.')

  const lookup = async () => {
    const w = word.trim().toLowerCase()
    if (!w) return
    setStatus('Thumbing through the dictionary…')
    setDefs(null)
    try {
      const res = await wikiFetch<Record<string, Definition[]>>(
        `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(w)}`,
      )
      const en = res.en
      if (en?.length) {
        setDefs(en)
        setStatus('')
      } else {
        setStatus('No English entry on this disc. Try another form of the word.')
      }
    } catch {
      setStatus('That word is not in the dictionary. (Neither was "internet", in 1994.)')
    }
  }

  const strip = (html: string) => {
    const d = document.createElement('div')
    d.innerHTML = html
    return d.textContent ?? ''
  }

  return (
    <Dialog title="Dictionary & Thesaurus" onClose={onClose} width={480}>
      <div className="e-tool-row">
        <input
          autoFocus
          className="e-tool-input"
          value={word}
          placeholder="e.g. encyclopedia"
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && lookup()}
        />
        <button className="e-btn" onClick={lookup}>
          Define
        </button>
      </div>
      {status && <p className="e-tool-status">{status}</p>}
      {defs?.map((d, i) => (
        <div key={i} className="e-tool-defblock">
          <i>{d.partOfSpeech}</i>
          <ol>
            {d.definitions.slice(0, 4).map((def, j) => {
              const text = strip(def.definition)
              return text ? <li key={j}>{text}</li> : null
            })}
          </ol>
        </div>
      ))}
      <p className="e-tool-foot">
        Definitions from{' '}
        <a href={`https://en.wiktionary.org/wiki/${encodeURIComponent(word.trim().toLowerCase())}`} target="_blank" rel="noreferrer">
          Wiktionary
        </a>{' '}
        (CC BY-SA).
      </p>
    </Dialog>
  )
}

/* ---------- Notemark (bookmarks with notes) ---------- */

interface Note {
  title: string
  note: string
  at: number
}
const NOTES_KEY = 'encartopedia.notemarks'
const readNotes = (): Note[] => {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) ?? '[]') as Note[]
  } catch {
    return []
  }
}

function NotemarkTool({ onClose }: { onClose: () => void }) {
  const [notes, setNotes] = useState<Note[]>(readNotes)
  const navigate = useNavigate()
  const location = useLocation()
  const m = /^\/w\/article\/(.+)$/.exec(location.pathname)
  const current = m ? pathToTitle(m[1]) : null

  const saveAll = (n: Note[]) => {
    setNotes(n)
    localStorage.setItem(NOTES_KEY, JSON.stringify(n))
  }

  return (
    <Dialog title="Notemark" onClose={onClose} width={500}>
      {current && !notes.some((n) => n.title === current) && (
        <button className="e-btn" onClick={() => saveAll([{ title: current, note: '', at: Date.now() }, ...notes])}>
          ＋ Notemark this article: {current}
        </button>
      )}
      {notes.length === 0 && <p className="e-tool-status">No notemarks yet. Open an article and mark it.</p>}
      {notes.map((n) => (
        <div key={n.title} className="e-tool-note">
          <div className="e-tool-row">
            <a
              onClick={(e) => {
                e.preventDefault()
                onClose()
                navigate(`/w/article/${titleToPath(n.title)}`)
              }}
              href="#"
            >
              {n.title}
            </a>
            <button className="e-btn" onClick={() => saveAll(notes.filter((x) => x.title !== n.title))}>
              Remove
            </button>
          </div>
          <textarea
            placeholder="Your note on this article…"
            value={n.note}
            onChange={(e) => saveAll(notes.map((x) => (x.title === n.title ? { ...x, note: e.target.value } : x)))}
          />
        </div>
      ))}
    </Dialog>
  )
}

/* ---------- Back List ---------- */

function BackListTool({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const visits = readBackList()
  return (
    <Dialog title="Back List" onClose={onClose} width={420}>
      {visits.length === 0 && <p className="e-tool-status">You have not read any articles yet this century.</p>}
      <div className="e-tool-backlist">
        {visits.map((v) => (
          <button
            key={v.title}
            className="e-tool-backitem"
            onClick={() => {
              onClose()
              navigate(`/w/article/${titleToPath(v.title)}`)
            }}
          >
            {v.title}
            <small>{new Date(v.at).toLocaleString()}</small>
          </button>
        ))}
      </div>
    </Dialog>
  )
}

/* ---------- Word Processor ---------- */

const DOC_KEY = 'encartopedia.report.doc'

function WordProcessorTool({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState(() => localStorage.getItem(DOC_KEY) ?? '')
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    localStorage.setItem(DOC_KEY, text)
  }, [text])
  return (
    <Dialog title="Word Processor — REPORT.DOC" onClose={onClose} width={560}>
      <textarea
        className="e-tool-doc"
        autoFocus
        placeholder={'My Report\nby A. Student\n\nPaste encyclopedia passages here. Cite your sources — the footer of every article tells you how.'}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="e-tool-row">
        <button
          className="e-btn"
          onClick={async () => {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
        >
          {copied ? 'Copied!' : 'Copy All'}
        </button>
        <button className="e-btn" onClick={() => setText('')}>
          New Document
        </button>
        <span className="e-tool-status">{text.length.toLocaleString()} characters · saved automatically</span>
      </div>
    </Dialog>
  )
}

/* ---------- Browse Panel (docked strip: Random + A–Z) ---------- */

interface AllPagesResponse {
  query?: { allpages?: { title: string }[] }
}

function BrowsePanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [letter, setLetter] = useState<string | null>(null)
  const [titles, setTitles] = useState<string[]>([])

  const jump = async (l: string) => {
    setLetter(l)
    setTitles([])
    try {
      const res = await wikiFetch<AllPagesResponse>(
        actionApiUrl({ action: 'query', list: 'allpages', apfrom: l, aplimit: 30, apfilterredir: 'nonredirects' }),
      )
      setTitles((res.query?.allpages ?? []).map((p) => p.title))
    } catch {
      /* offline */
    }
  }

  const random = async () => {
    try {
      navigate(`/w/article/${titleToPath(await randomArticleTitle())}`)
    } catch {
      /* offline */
    }
  }

  return (
    <div className="e-browsepanel">
      {letter && (
        <div className="e-browsepanel-list">
          {titles.length === 0 ? (
            <span className="e-tool-status">Leafing through volume {letter}…</span>
          ) : (
            titles.map((t) => (
              <button key={t} onClick={() => navigate(`/w/article/${titleToPath(t)}`)}>
                {t}
              </button>
            ))
          )}
        </div>
      )}
      <div className="e-browsepanel-strip">
        <button className="e-btn" onClick={random} title="A random article — the original doomscroll">
          Random
        </button>
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => (
          <button key={l} className={`e-browsepanel-letter ${letter === l ? 'active' : ''}`} onClick={() => jump(l)}>
            {l}
          </button>
        ))}
        <button className="e-btn" onClick={onClose} title="Close the Browse Panel">
          ✕
        </button>
      </div>
    </div>
  )
}
