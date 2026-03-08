import { useState, useEffect } from 'react'
import './Test.css'

function Test() {
  const [phase, setPhase] = useState(0)
  const [logoFrame, setLogoFrame] = useState(0)
  const [glitchActive, setGlitchActive] = useState(false)

  const logoFrames = ['/logo.png', '/logo2.png', '/logo3.png', '/logo2.png']

  // Main sequence timing
  useEffect(() => {
    const sequence = [
      { phase: 1, delay: 500 },    // Static noise
      { phase: 2, delay: 2000 },   // POG
      { phase: 3, delay: 3500 },   // TIME TO
      { phase: 4, delay: 5000 },   // REVIVE THE CULT
      { phase: 5, delay: 7500 },   // Anon reveal
      { phase: 6, delay: 10000 },  // Logo loop
    ]

    sequence.forEach(({ phase, delay }) => {
      setTimeout(() => setPhase(phase), delay)
    })
  }, [])

  // Logo animation loop (phase 6)
  useEffect(() => {
    if (phase >= 6) {
      const interval = setInterval(() => {
        setLogoFrame((prev) => (prev + 1) % logoFrames.length)
      }, 200)
      return () => clearInterval(interval)
    }
  }, [phase])

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 100 + Math.random() * 200)
      }
    }, 300)
    return () => clearInterval(glitchInterval)
  }, [])

  return (
    <div className={`promo-wrapper ${glitchActive ? 'glitch-active' : ''}`}>
      {/* Background Video */}
      <video
        className="promo-background-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/anon.mp4" type="video/mp4" />
      </video>

      {/* TV Static Overlay */}
      <div className={`tv-static ${phase < 2 ? 'visible' : ''}`}></div>

      {/* Scanlines */}
      <div className="scanlines"></div>

      {/* VHS tracking lines */}
      <div className="vhs-tracking"></div>

      {/* Phase 2: POG */}
      <div className={`promo-text pog-text ${phase === 2 ? 'active' : ''}`}>
        <span className="glitch-text" data-text="POG">POG</span>
      </div>

      {/* Phase 3: TIME TO */}
      <div className={`promo-text time-text ${phase === 3 ? 'active' : ''}`}>
        <span className="glitch-text" data-text="TIME TO">TIME TO</span>
      </div>

      {/* Phase 4: REVIVE THE CULT */}
      <div className={`promo-text revive-text ${phase === 4 ? 'active' : ''}`}>
        <span className="glitch-text" data-text="REVIVE THE CULT">REVIVE THE CULT</span>
      </div>

      {/* Phase 5: Anon Image */}
      <div className={`anon-reveal ${phase === 5 ? 'active' : ''}`}>
        <img src="/anon.png" alt="Anon" />
      </div>

      {/* Phase 6: Logo Loop */}
      <div className={`logo-finale ${phase >= 6 ? 'active' : ''}`}>
        <img src={logoFrames[logoFrame]} alt="POG Logo" className="finale-logo" />
        <div className="join-text">JOIN THE CULT</div>
      </div>

      {/* Corner decorations */}
      <div className="corner-decor top-left"></div>
      <div className="corner-decor top-right"></div>
      <div className="corner-decor bottom-left"></div>
      <div className="corner-decor bottom-right"></div>

      {/* Vignette */}
      <div className="vignette"></div>
    </div>
  )
}

export default Test
