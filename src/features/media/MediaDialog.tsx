import { useEffect, useRef, useState } from 'react'
import { Dialog } from '../../ui/Dialog'
import { FileCredit, getFileCredit, transcodedMp3Url } from '../../api/media'

interface MediaDialogProps {
  fileTitle: string // File:...
  caption?: string
  /** National anthems ship with Copy Audio disabled — KB Q133169. */
  isAnthem?: boolean
  onClose: () => void
}

const isAudioFile = (t: string) => /\.(ogg|oga|wav|flac|mp3)$/i.test(t)

/** Encarta's "Caption" window: the media item, its caption, and its credits. */
export function MediaDialog({ fileTitle, caption, isAnthem, onClose }: MediaDialogProps) {
  const [credit, setCredit] = useState<FileCredit | null>(null)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const ctl = new AbortController()
    setError(false)
    getFileCredit(fileTitle, 500, ctl.signal)
      .then(setCredit)
      .catch(() => {
        if (!ctl.signal.aborted) setError(true)
      })
    return () => ctl.abort()
  }, [fileTitle])

  const audio = isAudioFile(fileTitle)
  const mp3 = credit?.url ? transcodedMp3Url(credit.url) : null
  const displayName = fileTitle.replace(/^File:/, '').replace(/_/g, ' ')

  const copyAudioUrl = async () => {
    if (!credit?.url) return
    await navigator.clipboard.writeText(credit.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Dialog title="Caption" onClose={onClose} width={520}>
      {error && <p>The credits for this item could not be read from the disc.</p>}
      {!credit && !error && <p>Reading media credits…</p>}
      {credit && (
        <div style={{ fontFamily: 'var(--font-ui)' }}>
          {audio ? (
            <audio ref={audioRef} controls autoPlay style={{ width: '100%' }} controlsList="nodownload">
              {mp3 && <source src={mp3} type="audio/mpeg" />}
              {credit.url && <source src={credit.url} />}
            </audio>
          ) : (
            credit.thumbUrl && (
              <img
                src={credit.thumbUrl}
                alt={displayName}
                style={{ maxWidth: '100%', border: '1px solid var(--e-putty-dark)' }}
              />
            )
          )}
          {caption && <p style={{ fontFamily: 'var(--font-serif)', fontSize: 14 }}>{caption}</p>}
          <table style={{ fontSize: 11, marginTop: 8, borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ paddingRight: 10, color: 'var(--e-ink-soft)' }}>Item</td>
                <td>{displayName}</td>
              </tr>
              {credit.artist && (
                <tr>
                  <td style={{ paddingRight: 10, color: 'var(--e-ink-soft)' }}>By</td>
                  <td>{credit.artist}</td>
                </tr>
              )}
              {credit.license && (
                <tr>
                  <td style={{ paddingRight: 10, color: 'var(--e-ink-soft)' }}>License</td>
                  <td>
                    {credit.licenseUrl ? (
                      <a href={credit.licenseUrl} target="_blank" rel="noreferrer">
                        {credit.license}
                      </a>
                    ) : (
                      credit.license
                    )}
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ paddingRight: 10, color: 'var(--e-ink-soft)' }}>Source</td>
                <td>
                  {credit.descriptionUrl && (
                    <a href={credit.descriptionUrl} target="_blank" rel="noreferrer">
                      Wikimedia Commons file page
                    </a>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          {audio && (
            <div style={{ marginTop: 10 }}>
              <button
                className="e-btn"
                disabled={isAnthem}
                onClick={copyAudioUrl}
                title={
                  isAnthem
                    ? 'The Copy command is not available for National Anthems. (This behavior is by design — Microsoft KB Q133169.)'
                    : 'Copy the audio file address'
                }
              >
                {copied ? 'Copied!' : 'Copy Audio'}
              </button>
            </div>
          )}
        </div>
      )}
    </Dialog>
  )
}
