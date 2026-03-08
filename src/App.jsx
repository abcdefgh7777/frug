import { useState, useEffect, useRef } from 'react'
import './App.css'
import PfpBuilder from './PfpBuilder'

function App() {
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showPfpBuilder, setShowPfpBuilder] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [bgFrame, setBgFrame] = useState(0)
  const [tvFrame, setTvFrame] = useState(0)
  const [recentFugs, setRecentFugs] = useState([])
  const [allFugs, setAllFugs] = useState([])
  const [tvIndex, setTvIndex] = useState(0)
  const [galleryPage, setGalleryPage] = useState(1)
  const [galleryTotal, setGalleryTotal] = useState(0)

  // Background animation: fug1 → fug2 → fug3 → fug2 → loop
  const bgFrames = ['/fug1.png', '/fug2.png', '/fug3.png', '/fug2.png']
  // TV animation: tv → tv2 → tv3 → tv2 → loop
  const tvFrames = ['/tv.png', '/tv2.png', '/tv3.png', '/tv2.png']

  useEffect(() => {
    const interval = setInterval(() => {
      setBgFrame((prev) => (prev + 1) % bgFrames.length)
    }, 200)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTvFrame((prev) => (prev + 1) % tvFrames.length)
    }, 200)

    return () => clearInterval(interval)
  }, [])

  // Fetch recent fugs for TV
  const fetchRecentFugs = async () => {
    try {
      const res = await fetch('/api/fugs/recent')
      const data = await res.json()
      if (Array.isArray(data)) setRecentFugs(data)
    } catch (e) {
      console.error('Failed to fetch recent fugs')
    }
  }

  useEffect(() => {
    fetchRecentFugs()
    // Poll every 15 seconds for new fugs
    const poll = setInterval(fetchRecentFugs, 15000)
    return () => clearInterval(poll)
  }, [])

  // Cycle TV through recent fugs
  useEffect(() => {
    if (recentFugs.length === 0) return
    const interval = setInterval(() => {
      setTvIndex((prev) => (prev + 1) % recentFugs.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [recentFugs.length])

  // Fetch all fugs for gallery
  const fetchGalleryFugs = async (page = 1) => {
    try {
      const res = await fetch(`/api/fugs?page=${page}&limit=50`)
      const data = await res.json()
      if (data.fugs) {
        setAllFugs(data.fugs)
        setGalleryTotal(data.total)
        setGalleryPage(page)
      }
    } catch (e) {
      console.error('Failed to fetch gallery fugs')
    }
  }

  const openGallery = () => {
    setShowGallery(true)
    fetchGalleryFugs(1)
  }

  // Refresh TV when PFP builder closes (in case they submitted)
  const handlePfpClose = () => {
    setShowPfpBuilder(false)
    fetchRecentFugs()
  }

  const openAboutModal = (e) => {
    e.preventDefault()
    setShowAboutModal(true)
  }

  const scrollToTop = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentTvFug = recentFugs[tvIndex]

  return (
    <div className="main-wrapper">
      {/* Hero Section */}
      <div className="container">

        {/* Background Image - Animated fug loop */}
        <div
          className="background"
          style={{
            backgroundImage: `url(${bgFrames[bgFrame]})`
          }}
        />

        {/* TV - bottom right */}
        <div className="tv-container" onClick={openGallery}>
          <img src={tvFrames[tvFrame]} alt="FUG TV" className="tv-frame" />
          {currentTvFug && (
            <div className="tv-screen">
              <img src={currentTvFug.image_data} alt={currentTvFug.name} className="tv-fug-image" />
              <div className="tv-fug-name">{currentTvFug.name}</div>
            </div>
          )}
          {!currentTvFug && (
            <div className="tv-screen tv-empty">
              <span>NO FUGS YET</span>
              <span className="tv-hint">BE THE FIRST!</span>
            </div>
          )}
          <div className="tv-count">{recentFugs.length > 0 ? `${recentFugs.length} FUGS` : ''}</div>
        </div>

        {/* Header - Menu top left */}
        <header className="header">
          <img src="/fug-icon.png" alt="Fug" className="menu-icon" />
          <nav className="nav">
            <a href="#home" onClick={scrollToTop} className="nav-img-link">
              <img src="/nav-home.png" alt="Home" />
            </a>
            <a href="#about" onClick={openAboutModal} className="nav-img-link">
              <img src="/nav-about.png" alt="About Fug" />
            </a>
            <a href="#pfp" onClick={(e) => { e.preventDefault(); setShowPfpBuilder(true); }} className="nav-img-link">
              <img src="/nav-pfp.png" alt="Get Ur Fug" />
            </a>
            <a href="https://x.com/fugdafrog" target="_blank" rel="noopener noreferrer" className="nav-img-link">
              <img src="/nav-x.png" alt="X" />
            </a>
          </nav>
        </header>

        {/* Footer on Hero */}
        <footer className="hero-footer">
          <p>
            © 2026 FUG. ALL RIGHTS RESERVED.
            <a href="https://x.com/fugdafrog" target="_blank" rel="noopener noreferrer" className="x-icon">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <rect width="24" height="24" rx="4" fill="black"/>
                <path d="M16.5 5h2.4l-5.2 5.9 6.1 8.1h-4.7l-3.8-4.9-4.3 4.9H4.6l5.6-6.4L4.3 5h4.8l3.4 4.5L16.5 5zm-.9 12.6h1.3L8.5 6.3H7.1l8.5 11.3z" fill="white"/>
              </svg>
            </a>
          </p>
        </footer>
      </div>

      {/* About Modal - Mac Terminal Style */}
      {showAboutModal && (
        <div className="cult-modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="cult-modal" onClick={(e) => e.stopPropagation()}>
            {/* Mac Terminal Title Bar */}
            <div className="cult-titlebar">
              <div className="cult-buttons">
                <button className="cult-btn close" onClick={() => setShowAboutModal(false)}></button>
                <button className="cult-btn minimize"></button>
                <button className="cult-btn maximize"></button>
              </div>
              <span className="cult-title">FUG</span>
            </div>

            <div className="cult-content">
              <h1 className="cult-heading">WHY FUG?</h1>

              <div className="cult-story">
                <p>
                  I've been an artist since the first cycle of crypto. Back in the early days, before Solana was even a thing, I was already trying to make it with NFTs. I watched others succeed, tried to do the same, but never made a single sale. Eventually I gave up and went back to being a normie for a few years.
                </p>
                <p>
                  But I always had this character I kept drawing - a frog. Kind of a broke, weird looking frog. I liked this guy so much. I don't know if anyone else would feel the same way about him, but I wanted to give it one more shot.
                </p>
                <p>
                  So I drew my fug and decided to just give it away to everyone. I figured if people like him, maybe we could build a community around fug - a cult even. That's why everything is open source. You can grab the files from the website, make your own fug picture, and if you want to draw your own version, there's simple tools right here to do it.
                </p>
                <p>
                  I'm not gonna pretend I have some big master plan. I just want people to not forget fug. I want everyone to remember him. That's why I made him.
                </p>
                <p>
                  I don't have much more to say. Just hope everyone likes fug like I do.
                </p>
              </div>

              <div className="cult-footer">
                <p className="cult-slogan">LONG LIVE FUG</p>
                <a
                  href="https://x.com/fugdafrog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cult-x-link"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <rect width="24" height="24" rx="4" fill="black"/>
                    <path d="M16.5 5h2.4l-5.2 5.9 6.1 8.1h-4.7l-3.8-4.9-4.3 4.9H4.6l5.6-6.4L4.3 5h4.8l3.4 4.5L16.5 5zm-.9 12.6h1.3L8.5 6.3H7.1l8.5 11.3z" fill="white"/>
                  </svg>
                  Visit The Fug
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <div className="cult-modal-overlay" onClick={() => setShowGallery(false)}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cult-titlebar">
              <div className="cult-buttons">
                <button className="cult-btn close" onClick={() => setShowGallery(false)}></button>
                <button className="cult-btn minimize"></button>
                <button className="cult-btn maximize"></button>
              </div>
              <span className="cult-title">FUG ALBUM - {galleryTotal} FUGS</span>
            </div>

            <div className="gallery-content">
              <h1 className="gallery-heading">FUG ALBUM</h1>
              <p className="gallery-count">{galleryTotal} FUGS SUBMITTED</p>

              {allFugs.length === 0 && (
                <div className="gallery-empty">
                  <p>NO FUGS YET... BE THE FIRST!</p>
                </div>
              )}

              <div className="gallery-grid">
                {allFugs.map((fug) => (
                  <div key={fug.id} className="gallery-item">
                    <img src={fug.image_data} alt={fug.name} />
                    <div className="gallery-item-name">{fug.name}</div>
                  </div>
                ))}
              </div>

              {galleryTotal > 50 && (
                <div className="gallery-pagination">
                  <button
                    className="pfp-btn"
                    disabled={galleryPage <= 1}
                    onClick={() => fetchGalleryFugs(galleryPage - 1)}
                  >
                    PREV
                  </button>
                  <span>PAGE {galleryPage} / {Math.ceil(galleryTotal / 50)}</span>
                  <button
                    className="pfp-btn"
                    disabled={galleryPage >= Math.ceil(galleryTotal / 50)}
                    onClick={() => fetchGalleryFugs(galleryPage + 1)}
                  >
                    NEXT
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PFP Builder Modal */}
      {showPfpBuilder && (
        <PfpBuilder onClose={handlePfpClose} />
      )}
    </div>
  )
}

export default App
