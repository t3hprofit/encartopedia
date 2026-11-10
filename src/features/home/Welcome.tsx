import { Link } from 'react-router-dom'

/** The first thing you see past the splash — an in-style welcome "article". */
export function Welcome() {
  return (
    <>
      <div className="e-banner">
        Welcome to Encartopedia &rsquo;95 <small>INTRODUCTION</small>
      </div>
      <div className="e-page-scroll">
        <div className="e-welcome">
          <p>
            <b>Encartopedia &rsquo;95</b> is the complete interactive multimedia encyclopedia — every article in
            the English <a href="https://en.wikipedia.org" target="_blank" rel="noreferrer">Wikipedia</a>,
            dressed in the finest 1994 has to offer. No CD-ROM required; a 2x drive is, however, recommended in
            spirit.
          </p>
          <h2>Where to begin</h2>
          <p>
            Click <b>Find</b> in the toolbar to open the <b>Pinpointer</b> and watch the article list narrow as
            you type. Or pull down an <b>Area of Interest</b> and browse one of the nine great branches of
            knowledge. Words in <Link to="/w/article/Encarta">red</Link> are links — click them and fall down the
            rabbit hole, as nature intended.
          </p>
          <h2>Features</h2>
          <p>
            The <b>Features</b> menu holds the <Link to="/w/atlas">Atlas</Link>, the{' '}
            <Link to="/w/gallery">Media Gallery</Link>, the <Link to="/w/timeline">Timeline</Link>, and{' '}
            <Link to="/w/mindmaze">MindMaze</Link> — a castle, a curse, and several thousand questions.
          </p>
          <p style={{ marginTop: 32, fontSize: 12, fontFamily: 'var(--font-ui)', color: 'var(--e-ink-soft)' }}>
            Text from Wikipedia, available under{' '}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
              CC BY-SA 4.0
            </a>
            . An unofficial fan homage — not affiliated with Microsoft.
          </p>
        </div>
      </div>
    </>
  )
}
