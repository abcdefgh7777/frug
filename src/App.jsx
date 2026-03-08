import { useState, useEffect } from 'react'
import './App.css'
import PfpBuilder from './PfpBuilder'

function App() {
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showPfpBuilder, setShowPfpBuilder] = useState(false)
  const [bgFrame, setBgFrame] = useState(0)

  // Background animation: frug1 → frug2 → frug3 → frug2 → loop
  const bgFrames = ['/frug1.png', '/frug2.png', '/frug3.png', '/frug2.png']

  useEffect(() => {
    const interval = setInterval(() => {
      setBgFrame((prev) => (prev + 1) % bgFrames.length)
    }, 200)

    return () => clearInterval(interval)
  }, [])

  const openAboutModal = (e) => {
    e.preventDefault()
    setShowAboutModal(true)
  }

  const scrollToTop = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="main-wrapper">
      {/* Hero Section */}
      <div className="container">

        {/* Background Image - Animated frug loop */}
        <div
          className="background"
          style={{
            backgroundImage: `url(${bgFrames[bgFrame]})`
          }}
        />

        {/* Header - Menu top left */}
        <header className="header">
          <img src="/frug-icon.png" alt="Frug" className="menu-icon" />
          <nav className="nav">
            <a href="#home" onClick={scrollToTop} className="nav-img-link">
              <img src="/nav-home.png" alt="Home" />
            </a>
            <a href="#about" onClick={openAboutModal} className="nav-img-link">
              <img src="/nav-about.png" alt="About Frug" />
            </a>
            <a href="#pfp" onClick={(e) => { e.preventDefault(); setShowPfpBuilder(true); }} className="nav-img-link">
              <img src="/nav-pfp.png" alt="Get Ur Frug" />
            </a>
            <a href="https://x.com/watdafrug" target="_blank" rel="noopener noreferrer" className="nav-img-link">
              <img src="/nav-x.png" alt="X" />
            </a>
          </nav>
        </header>

        {/* Footer on Hero */}
        <footer className="hero-footer">
          <p>
            © 2026 FRUG. ALL RIGHTS RESERVED.
            <a href="https://x.com/watdafrug" target="_blank" rel="noopener noreferrer" className="x-icon">
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
              <span className="cult-title">FRUG</span>
            </div>

            <div className="cult-content">
              <h1 className="cult-heading">WHY FRUG?</h1>

              <div className="cult-story">
                <p>
                  I've been an artist since the first cycle of crypto. Back in the early days, before Solana was even a thing, I was already trying to make it with NFTs. I watched others succeed, tried to do the same, but never made a single sale. Eventually I gave up and went back to being a normie for a few years.
                </p>
                <p>
                  But I always had this character I kept drawing - a frog. Kind of a broke, weird looking frog. I liked this guy so much. I don't know if anyone else would feel the same way about him, but I wanted to give it one more shot.
                </p>
                <p>
                  So I drew my frug and decided to just give it away to everyone. I figured if people like him, maybe we could build a community around frug - a cult even. That's why everything is open source. You can grab the files from the website, make your own frug picture, and if you want to draw your own version, there's simple tools right here to do it.
                </p>
                <p>
                  I'm not gonna pretend I have some big master plan. I just want people to not forget frug. I want everyone to remember him. That's why I made him.
                </p>
                <p>
                  I don't have much more to say. Just hope everyone likes frug like I do.
                </p>
              </div>

              <div className="cult-footer">
                <p className="cult-slogan">LONG LIVE FRUG</p>
                <a
                  href="https://x.com/watdafrug"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cult-x-link"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <rect width="24" height="24" rx="4" fill="black"/>
                    <path d="M16.5 5h2.4l-5.2 5.9 6.1 8.1h-4.7l-3.8-4.9-4.3 4.9H4.6l5.6-6.4L4.3 5h4.8l3.4 4.5L16.5 5zm-.9 12.6h1.3L8.5 6.3H7.1l8.5 11.3z" fill="white"/>
                  </svg>
                  Visit The Frug
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PFP Builder Modal */}
      {showPfpBuilder && (
        <PfpBuilder onClose={() => setShowPfpBuilder(false)} />
      )}
    </div>
  )
}

export default App
