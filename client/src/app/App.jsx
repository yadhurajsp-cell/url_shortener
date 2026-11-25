import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
})
const shortUrlBase = (
  import.meta.env.VITE_SHORT_URL_BASE ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000'
).replace(/\/$/, '')

function getShortUrl(shortUrl) {
  if (/^https?:\/\//i.test(shortUrl)) {
    return shortUrl
  }

  return `${shortUrlBase}/${encodeURIComponent(shortUrl)}`
}

async function fetchUrls() {
  const response = await api.get('/api/url/')
  const savedUrls = response.data.data

  if (!Array.isArray(savedUrls)) {
    throw new Error('The URLs API returned an unexpected response.')
  }

  return savedUrls.map((url) => ({ ...url, id: url._id }))
}

function App() {
  const [urls, setUrls] = useState([])
  const [inputUrl, setInputUrl] = useState('')
  const [copyStatus, setCopyStatus] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadUrls() {
      try {
        const savedUrls = await fetchUrls()
        if (!cancelled) {
          setUrls(savedUrls)
        }
      } catch (error) {
        console.error('Failed to fetch URLs:', error)
        if (!cancelled) {
          setLoadError('Could not load saved links. Check that the server and database are running.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadUrls()
    return () => {
      cancelled = true
    }
  }, [])

  async function createShortUrl() {
    try {
      await api.post('/api/url/shorten', { url: inputUrl })
      setUrls(await fetchUrls())
      setInputUrl('')
      setLoadError('')
    } catch (error) {
      console.error('Failed to create short URL:', error)
      setLoadError('Could not create the short link. Check the URL and try again.')
    }
  }

  const totalClicks = urls.reduce((total, url) => total + url.clicks, 0)

  async function copyShortUrl(url) {
    try {
      await navigator.clipboard.writeText(getShortUrl(url.shortUrl))
      setCopyStatus({ id: url.id, message: 'Copied!' })
    } catch (error) {
      console.error('Failed to copy short URL:', error)
      setCopyStatus({ id: url.id, message: 'Copy failed' })
    }
  }

  async function deleteUrl(urlId) {
    try {
      await api.delete(`/api/url/${urlId}`)
      setUrls((currentUrls) => currentUrls.filter((url) => url.id !== urlId))
      setLoadError('')
    } catch (error) {
      console.error('Failed to delete URL:', error)
      setLoadError('Could not delete this link. Please try again.')
    }
  }

  return (
    <div className="app-shell">
      <main className="dashboard">
        <header className="topbar">
          <a className="brand" href="/" aria-label="Ziplink home">
            <span className="brand-icon" aria-hidden="true">↗</span>
            <span>ziplink<span className="brand-period">.</span></span>
          </a>
          <div className="topbar-note">
            <span className="live-dot" />
            your tiny link studio
          </div>
          <span className="edition-tag">VOL. 01 / INTERNET</span>
        </header>

        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow"><span>✳</span> THE SHORT LINK CLUB</p>
            <h1>
              Less link.
              <br />
              <span className="headline-accent">More</span> <span className="headline-outline">wow.</span>
            </h1>
            <p className="hero-description">
              Turn those long, clunky URLs into little internet-ready gems.
            </p>

            <div className="shorten-form">
              <label className="sr-only" htmlFor="url-input">URL to shorten</label>
              <input
                id="url-input"
                type="url"
                value={inputUrl}
                onChange={(event) => setInputUrl(event.target.value)}
                placeholder="Paste your very long link here..."
              />
              <button
                type="button"
                onClick={createShortUrl}
                disabled={!inputUrl.trim()}
              >
                Make it tiny <span aria-hidden="true">↗</span>
              </button>
            </div>
            <div className="form-note">
              <span className="sparkle" aria-hidden="true">✦</span>
              Free to use. Big main-character energy.
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="sunburst">✳</div>
            <div className="sticker">
              <span>LONG URL?</span>
              <strong>NOT<br />ANYMORE.</strong>
              <span className="sticker-arrow">↘</span>
            </div>
            <span className="art-star star-one">✦</span>
            <span className="art-star star-two">✳</span>
            <span className="art-dot" />
          </div>
          <span className="hero-index">01 — MAKE IT SHORT</span>
        </section>

        <section className="links-section" aria-labelledby="links-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow section-eyebrow">YOUR LITTLE COLLECTION</p>
              <h2 id="links-heading">Freshly <span>snipped</span></h2>
            </div>
            <div className="collection-stats">
              <div className="stat">
                <strong>{String(urls.length).padStart(2, '0')}</strong>
                <span>LINKS MADE</span>
              </div>
              <span className="stat-divider" />
              <div className="stat">
                <strong>{String(totalClicks).padStart(2, '0')}</strong>
                <span>TOTAL CLICKS</span>
              </div>
            </div>
          </div>

          <ul className="url-list">
            {isLoading ? (
              <li className="empty-links" role="status">Loading your links...</li>
            ) : urls.length === 0 ? (
              <li className="empty-links">No links yet. Make your first one above!</li>
            ) : urls.map((url, index) => (
              <li className="url-card" key={url.id}>
                <span className="url-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="url-details">
                  <div className="url-link-row">
                    <a className="short-url" href={getShortUrl(url.shortUrl)} target="_blank" rel="noopener noreferrer">
                      {getShortUrl(url.shortUrl).replace(/^https?:\/\//, '')}
                      <span aria-hidden="true"> ↗</span>
                    </a>
                    <div className="url-actions">
                      <button
                        className={`copy-button${copyStatus?.id === url.id && copyStatus.message === 'Copied!' ? ' is-copied' : ''}`}
                        type="button"
                        onClick={() => copyShortUrl(url)}
                        aria-live="polite"
                      >
                        {copyStatus?.id === url.id ? copyStatus.message : 'Copy'}
                      </button>
                      <button
                        className="delete-button"
                        type="button"
                        onClick={() => deleteUrl(url.id)}
                        aria-label={`Delete link ${url.shortUrl}`}
                        title="Delete link"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="original-url">{url.originalUrl}</p>
                </div>
                <div className="click-count">
                  <strong>{String(url.clicks).padStart(2, '0')}</strong>
                  <span>CLICKS</span>
                </div>
                <span className="card-sparkle" aria-hidden="true">✳</span>
              </li>
            ))}
          </ul>
          {loadError && <p className="load-error" role="alert">{loadError}</p>}

          <footer className="page-footer">
            <span>MADE FOR THE SPEED OF THE INTERNET</span>
            <div className="palette-dots" aria-label="Color palette: lilac, lime, coral, and ink">
              <i className="dot-lilac" />
              <i className="dot-lime" />
              <i className="dot-coral" />
              <i className="dot-ink" />
            </div>
            <span>ZIPLINK © 2025</span>
          </footer>
        </section>
      </main>
    </div>
  )
}

export default App
